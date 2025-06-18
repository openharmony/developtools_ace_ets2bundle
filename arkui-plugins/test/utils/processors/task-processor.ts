/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import * as child_process from 'child_process';
import EventEmitter from 'events';
import {
    CompileStrategy,
    type BuildConfig,
    type CompileFileInfo,
    type JobInfo,
    type PluginTestContext,
    type ProcessEvent,
    type TraceOptions,
} from '../shared-types';
import {
    DECL_ETS_SUFFIX,
    ensurePathExists,
    getFileName,
    MOCK_DEP_INPUT_FILE_NAME,
    MOCK_FILE_DEP_FILE_NAME,
} from '../path-config';
import { FileDependencyContextCache, PluginTestContextCache } from '../cache';
import { HashGenerator } from '../hash-generator';
import { createGlobalConfig, createGlobalContextPtr, destroyGlobalConfig, destroyGlobalContextPtr } from '../global';
import { Plugins, PluginState } from '../../../common/plugin-context';
import { concatObject, serializable } from '../serializable';
import { compileAbc, compileExternalProgram } from '../compile';
import { BaseProcessor } from './base-processor';

interface Job {
    id: string;
    isDeclFile: boolean;
    isInCycle?: boolean;
    fileList: string[];
    dependencies: string[];
    dependants: string[];
    isAbcJob: boolean;
}

interface Queues {
    externalProgramQueue: Job[];
    abcQueue: Job[];
}

interface FileDepsInfo {
    dependencies: Record<string, string[]>;
    dependants: Record<string, string[]>;
}

interface WorkerInfo {
    isIdle: boolean;
}

function getDepAnalyzerCmd(
    depAnalyzerPath: string,
    depInputFile: string,
    entryFiles: Set<string>,
    outputFile: string,
    arktsConfigFile: string
): string[] {
    const depAnalyzerCmd: string[] = [`"${depAnalyzerPath}"`];

    let depInputContent = '';
    entryFiles.forEach((file: string) => {
        depInputContent += file + os.EOL;
    });
    fs.writeFileSync(depInputFile, depInputContent);

    depAnalyzerCmd.push(`@"${depInputFile}"`);
    depAnalyzerCmd.push(`--output=${outputFile}`);
    depAnalyzerCmd.push(`--arktsconfig=${arktsConfigFile}`);

    return depAnalyzerCmd;
}

function dfs(node: string, visited: Set<string>, adjacencyList: Record<string, string[]>, order: string[]) {
    visited.add(node);
    for (const neighbor of adjacencyList[node]) {
        if (!visited.has(neighbor)) {
            dfs(neighbor, visited, adjacencyList, order);
        }
    }
    order.push(node);
}

function reverseDfs(
    node: string,
    component: Set<string>,
    visited: Set<string>,
    reverseAdjacencyList: Record<string, string[]>
) {
    visited.add(node);
    component.add(node);
    for (const neighbor of reverseAdjacencyList[node]) {
        if (!visited.has(neighbor)) {
            reverseDfs(neighbor, component, visited, reverseAdjacencyList);
        }
    }
}

function findStronglyConnectedComponents(graph: FileDepsInfo): Map<string, Set<string>> {
    const adjacencyList: Record<string, string[]> = {};
    const reverseAdjacencyList: Record<string, string[]> = {};
    const allNodes = new Set<string>();
    for (const node in graph.dependencies) {
        allNodes.add(node);
        graph.dependencies[node].forEach((dep) => allNodes.add(dep));
    }
    for (const node in graph.dependants) {
        allNodes.add(node);
        graph.dependants[node].forEach((dep) => allNodes.add(dep));
    }
    Array.from(allNodes).forEach((node) => {
        adjacencyList[node] = graph.dependencies[node] || [];
        reverseAdjacencyList[node] = graph.dependants[node] || [];
    });
    const visited = new Set<string>();
    const order: string[] = [];
    Array.from(allNodes).forEach((node) => {
        if (!visited.has(node)) {
            dfs(node, visited, adjacencyList, order);
        }
    });
    visited.clear();
    const components = new Map<string, Set<string>>();
    for (let i = order.length - 1; i >= 0; i--) {
        const node = order[i];
        if (!visited.has(node)) {
            const component = new Set<string>();
            reverseDfs(node, component, visited, reverseAdjacencyList);
            if (component.size > 1) {
                const sortedFiles = Array.from(component).sort();
                const hashKey = HashGenerator.getInstance().staticSha1Id(sortedFiles.join('|'), 13);
                components.set(hashKey, component);
            }
        }
    }
    return components;
}

function getJobDependencies(fileDeps: string[], cycleFiles: Map<string, string[]>): Set<string> {
    const depJobList: Set<string> = new Set<string>();
    fileDeps.forEach((file) => {
        if (!cycleFiles.has(file)) {
            depJobList.add('0' + file);
        } else {
            cycleFiles.get(file)?.forEach((f) => {
                depJobList.add(f);
            });
        }
    });

    return depJobList;
}

function getJobDependants(fileDeps: string[], cycleFiles: Map<string, string[]>): Set<string> {
    let depJobList: Set<string> = new Set<string>();
    fileDeps.forEach((file) => {
        if (!file.endsWith(DECL_ETS_SUFFIX)) {
            depJobList.add('1' + file);
        }
        if (cycleFiles.has(file)) {
            cycleFiles.get(file)?.forEach((f) => {
                depJobList.add(f);
            });
        } else {
            depJobList.add('0' + file);
        }
    });

    return depJobList;
}

function insertJobDependantsButSelf(jobMap: Record<string, Job>, id: string, dependants: Set<string>): Set<string> {
    jobMap[id].dependants.forEach((dep) => {
        dependants.add(dep);
    });
    if (dependants.has(id)) {
        dependants.delete(id);
    }
    return dependants;
}

function createExternalProgramJob(id: string, fileList: string[], dependencies: Set<string>, isInCycle?: boolean): Job {
    return {
        id,
        fileList,
        isDeclFile: true,
        isInCycle,
        isAbcJob: false,
        dependencies: Array.from(dependencies),
        dependants: [],
    };
}

function createAbcJob(id: string, fileList: string[], dependencies: Set<string>, isInCycle?: boolean): Job {
    return {
        id,
        isDeclFile: false,
        isInCycle,
        isAbcJob: true,
        fileList,
        dependencies: Array.from(dependencies),
        dependants: [],
    };
}

function addJobToQueues(job: Job, queues: Queues): void {
    if (queues.externalProgramQueue.some((j) => j.id === job.id) || queues.abcQueue.some((j) => j.id === job.id)) {
        return;
    }
    if (!job.isAbcJob) {
        queues.externalProgramQueue.push(job);
    } else {
        queues.abcQueue.push(job);
    }
}

class TaskProcessor extends BaseProcessor {
    entryFiles: Set<string>;
    depAnalyzerPath: string;
    depInputFile: string;
    fileDepsInfoJson: string;
    jobMap: Record<string, Job>;
    jobQueues: Queues;

    readonly emitter: EventEmitter<ProcessEvent> = new EventEmitter<ProcessEvent>();
    private worker!: WorkerInfo;

    constructor(hashId: string, buildConfig?: BuildConfig, tracing?: TraceOptions) {
        super(hashId, buildConfig, tracing);
        this.entryFiles = new Set<string>(this.buildConfig.compileFiles as string[]);
        this.depAnalyzerPath = this.buildConfig.depAnalyzerPath;
        this.depInputFile = path.resolve(this.buildConfig.cachePath, this.hashId, MOCK_DEP_INPUT_FILE_NAME);
        this.fileDepsInfoJson = path.resolve(this.buildConfig.cachePath, this.hashId, MOCK_FILE_DEP_FILE_NAME);

        this.generateFileDependencies();
        this.cacheFileDependencies();
        this.jobMap = this.collectCompileJobs();
        this.jobQueues = this.initCompileQueues();
    }

    private cacheFileDependencies(): void {
        const depInputFile: string = this.arktsConfigFile;
        const fileDepsInfoJson: string = this.fileDepsInfoJson;
        FileDependencyContextCache.getInstance().set(this.hashId, { depInputFile, fileDepsInfoJson });
    }

    private generateFileDependencies(): void {
        ensurePathExists(this.depInputFile);
        ensurePathExists(this.fileDepsInfoJson);
        const depAnalyzerCmd: string[] = getDepAnalyzerCmd(
            this.depAnalyzerPath,
            this.depInputFile,
            this.entryFiles,
            this.fileDepsInfoJson,
            this.arktsConfigFile
        );
        const depAnalyzerCmdStr: string = depAnalyzerCmd.join(' ');
        try {
            child_process.execSync(depAnalyzerCmdStr).toString();
        } catch (error) {
            const err = `[${this.hashId}] TaskProcessor generateFileDependencies failed: ${error}`;
            console.error(err);
            throw new Error(err);
        }
    }

    private collectJobsInDependants(
        jobMap: Record<string, Job>,
        cycleFiles: Map<string, string[]>,
        dependantMap: [string, string[]]
    ): void {
        const [key, value] = dependantMap;
        const dependants = getJobDependants(value, cycleFiles);
        if (cycleFiles.has(key)) {
            const externalProgramJobIds = cycleFiles.get(key)!;
            externalProgramJobIds.forEach((id) => {
                jobMap[id].dependants = Array.from(insertJobDependantsButSelf(jobMap, id, dependants));
            });
        } else {
            const id = '0' + key;
            jobMap[id].dependants = Array.from(insertJobDependantsButSelf(jobMap, id, dependants));
        }
    }

    private collectJobsInDependencies(
        jobMap: Record<string, Job>,
        cycleFiles: Map<string, string[]>,
        cycleGroups: Map<string, Set<string>>,
        dependencyMap: [string, string[]]
    ): void {
        const [key, value] = dependencyMap;
        const dependencies = getJobDependencies(value, cycleFiles);
        // Create generate abc job
        if (!key.endsWith(DECL_ETS_SUFFIX)) {
            const abcJobId: string = '1' + key;
            jobMap[abcJobId] = createAbcJob(abcJobId, [key], dependencies, cycleFiles.has(key));
        }
        // Create cache external job
        if (cycleFiles.has(key)) {
            const externalProgramJobIds = cycleFiles.get(key)!;
            externalProgramJobIds.forEach((id) => {
                const fileList: string[] = Array.from(cycleGroups.get(id)!);
                if (dependencies.has(id)) {
                    dependencies.delete(id);
                }
                jobMap[id] = createExternalProgramJob(id, fileList, dependencies, true);
            });
        } else {
            const id = '0' + key;
            const fileList: string[] = [key];
            if (dependencies.has(id)) {
                dependencies.delete(id);
            }
            jobMap[id] = createExternalProgramJob(id, fileList, dependencies);
        }
        // register compileFiles for declaration files
        if (key.endsWith(DECL_ETS_SUFFIX)) {
            const fileInfo: CompileFileInfo = {
                filePath: key,
                dependentFiles: [],
                abcFilePath: '',
                arktsConfigFile: this.arktsConfigFile,
                fileName: getFileName(key),
                stdLibPath: '',
            };

            if (!this.compileFiles.has(key)) {
                this.compileFiles.set(key, fileInfo);
            }
        }
    }

    private collectCompileJobs(): Record<string, Job> {
        const data = fs.readFileSync(this.fileDepsInfoJson, 'utf-8');
        if (data.length === 0) {
            const err = `[${this.hashId}] TaskProcessor cannot read fileDepsInfoJson`;
            console.error(err);
            throw new Error(err);
        }
        const fileDepsInfo: FileDepsInfo = JSON.parse(data) as FileDepsInfo;
        Object.keys(fileDepsInfo.dependants).forEach((file) => {
            if (!(file in fileDepsInfo.dependencies)) {
                fileDepsInfo.dependencies[file] = [];
            }
        });
        const cycleGroups = findStronglyConnectedComponents(fileDepsInfo);
        const cycleFiles: Map<string, string[]> = new Map<string, string[]>();
        cycleGroups.forEach((value: Set<string>, key: string) => {
            value.forEach((file) => {
                cycleFiles.set(file, [key]);
            });
        });
        const jobMap: Record<string, Job> = {};
        Object.entries(fileDepsInfo.dependencies).forEach((dependencyMap) => {
            this.collectJobsInDependencies(jobMap, cycleFiles, cycleGroups, dependencyMap);
        });
        Object.entries(fileDepsInfo.dependants).forEach((dependantMap) => {
            this.collectJobsInDependants(jobMap, cycleFiles, dependantMap);
        });
        return jobMap;
    }

    private initCompileQueues(): Queues {
        const queues: Queues = { externalProgramQueue: [], abcQueue: [] };
        Object.values(this.jobMap).forEach((job) => {
            if (job.dependencies.length === 0) {
                addJobToQueues(job, queues);
            }
        });
        return queues;
    }

    private assignTaskToIdleWorker(
        processingJobs: Set<string>,
        globalContextPtr: number,
        plugins: Plugins[],
        stopAfter?: PluginState
    ) {
        let job: Job | undefined;
        let jobInfo: JobInfo | undefined;
        if (this.jobQueues.externalProgramQueue.length > 0) {
            job = this.jobQueues.externalProgramQueue.shift()!;
            jobInfo = {
                id: job.id,
                isCompileAbc: CompileStrategy.EXTERNAL,
            };
        } else if (this.jobQueues.abcQueue.length > 0) {
            job = this.jobQueues.abcQueue.shift()!;
            jobInfo = {
                id: job.id,
                isCompileAbc: CompileStrategy.ABC,
            };
        }

        if (!!job && !!jobInfo) {
            processingJobs.add(job.id);
            jobInfo.compileFileInfo = this.compileFiles.get(job.fileList[0]);
            jobInfo.buildConfig = serializable(this.buildConfig);
            jobInfo.plugins = plugins;
            jobInfo.globalContextPtr = globalContextPtr;
            jobInfo.stopAfter = stopAfter;

            this.worker.isIdle = false;
            this.emitter.emit('ASSIGN_TASK', { jobInfo });
        }
    }

    private checkAllTasksDone(): boolean {
        return this.jobQueues.externalProgramQueue.length === 0 && this.worker.isIdle;
    }

    private addDependantJobToQueues(jobId: string): void {
        const completedJob = this.jobMap[jobId];
        completedJob.dependants.forEach((depJobId) => {
            const depJob = this.jobMap[depJobId];
            const depIndex = depJob.dependencies.indexOf(jobId);
            if (depIndex !== -1) {
                depJob.dependencies.splice(depIndex, 1);
                if (depJob.dependencies.length === 0) {
                    addJobToQueues(depJob, this.jobQueues);
                }
            }
        });
    }

    private subscribe() {
        this.emitter.on('ASSIGN_TASK', (msg) => {
            const job = msg.jobInfo;
            if (job.isCompileAbc === CompileStrategy.ABC) {
                compileAbc(this.emitter, job, this.tracing);
            } else if (job.isCompileAbc === CompileStrategy.EXTERNAL) {
                compileExternalProgram(this.emitter, job, this.tracing);
            }
            this.emitter.emit('TASK_FINISH', { jobId: job.id });
        });
        this.emitter.on('EXIT', () => {
            this.worker.isIdle = true;
            console.log(`worker exiting...`);
        });
        this.emitter.on('TASK_COLLECT', (msg) => {
            const jobId = msg.jobId;
            const job = this.jobMap[jobId];
            const sourceType = job.isAbcJob ? 'abc' : 'external';
            const pluginStateId = msg.pluginStateId;
            const fileName = msg.fileName;
            const pluginTestContext = msg.pluginTestContext as PluginTestContext;
            const key = `${this.hashId}:${sourceType}:${pluginStateId}:${fileName}`;
            let currentPluginTestContext;
            if (PluginTestContextCache.getInstance().has(key)) {
                const oldContext = PluginTestContextCache.getInstance().get(key)!;
                currentPluginTestContext = concatObject(oldContext, pluginTestContext);
            } else {
                currentPluginTestContext = pluginTestContext;
            }
            PluginTestContextCache.getInstance().set(key, currentPluginTestContext);
        });
    }

    async invokeWorkers(plugins: Plugins[], stopAfter?: PluginState): Promise<void> {
        const processingJobs = new Set<string>();
        return new Promise<void>((resolve) => {
            const files: string[] = [];
            Object.values(this.jobMap).forEach((job) => {
                for (let i = 0; i < job.fileList.length; i++) {
                    files.push(job.fileList[i]);
                }
            });
            const fileInfo: CompileFileInfo = this.compileFiles.values().next().value!;
            const config = createGlobalConfig(fileInfo);
            const globalContextPtr = createGlobalContextPtr(config, files);
            this.subscribe();
            this.emitter.on('TASK_FINISH', (msg) => {
                this.worker.isIdle = true;
                const jobId = msg.jobId;
                processingJobs.delete(jobId);
                this.addDependantJobToQueues(jobId);
                const hasRemainingTask =
                    this.jobQueues.externalProgramQueue.length > 0 || this.jobQueues.abcQueue.length > 0;
                if (hasRemainingTask) {
                    this.assignTaskToIdleWorker(processingJobs, globalContextPtr, plugins, stopAfter);
                } else if (this.checkAllTasksDone()) {
                    console.log('All tasks completed. Exiting...');
                    this.emitter.emit('EXIT');
                    destroyGlobalContextPtr(globalContextPtr);
                    destroyGlobalConfig(config);
                    resolve();
                }
            });
            this.worker = { isIdle: true };
            this.assignTaskToIdleWorker(processingJobs, globalContextPtr, plugins, stopAfter);
        });
    }

    clear(): void {
        FileDependencyContextCache.getInstance().delete(this.hashId);
    }
}

export { TaskProcessor };
