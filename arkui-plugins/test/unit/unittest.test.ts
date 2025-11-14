/*
 * Copyright (C) 2025 Huawei Device Co., Ltd.
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

const fs = require('fs');
const path = require('path');
import * as m from './model';
import {extractErrorWarningBlocks, LookingFor} from '../utils/parse-string';

function changePathToAbsPath(p) {
    return path.resolve(p);
}

function replaceWorkspace(p, workspace) {
    return p.replace(/workspace/g, workspace);
}

// 获取当前目录
const currentDirectory = process.cwd();
let workspace = currentDirectory;
for (let i = 0; i < 4; i++) {
    workspace = path.dirname(workspace);
}
// JSON 文件路径
const jsonFilePath = path.join(__dirname, '../demo/localtest/unit_config_template.json');
const unitPath = path.join(__dirname, '../demo/localtest/entry/src/main/ets/unit');
const configFile = './test_config_all.json';

let TEST_DATA = {};
const TIMEOUT_MS = 10000;
const JEST_TIMEOUT_MS = 100000;

try {
    // 读取 JSON 文件内容
    const data = fs.readFileSync(jsonFilePath, 'utf8');
    const jsonData = JSON.parse(data);

    // 处理 baseUrl 字段
    if (jsonData.buildSdkPath) {
        jsonData.buildSdkPath = replaceWorkspace(jsonData.buildSdkPath, workspace);
    }

    // 处理 plugins 字段
    if (jsonData.plugins.ui_syntax_plugin) {
        jsonData.plugins.ui_syntax_plugin = replaceWorkspace(jsonData.plugins.ui_syntax_plugin, workspace);
    }
    if (jsonData.plugins.ui_plugin) {
        jsonData.plugins.ui_plugin = replaceWorkspace(jsonData.plugins.ui_plugin, workspace);
    }
    if (jsonData.plugins.memo_plugin) {
        jsonData.plugins.memo_plugin = replaceWorkspace(jsonData.plugins.memo_plugin, workspace);
    }

    // moduleRootPath
    if (jsonData.moduleRootPath) {
        jsonData.moduleRootPath = changePathToAbsPath(jsonData.moduleRootPath);
    }

    // sourceRoots
    if (jsonData.sourceRoots) {
        jsonData.sourceRoots = jsonData.sourceRoots.map((file) => changePathToAbsPath(file));
    }

    // loaderOutPath
    if (jsonData.loaderOutPath) {
        jsonData.loaderOutPath = changePathToAbsPath(jsonData.loaderOutPath);
    }

    // cachePath
    if (jsonData.cachePath) {
        jsonData.cachePath = changePathToAbsPath(jsonData.cachePath);
    }

    // appModuleJsonPath
    if (jsonData.aceModuleJsonPath) {
        jsonData.aceModuleJsonPath = changePathToAbsPath(jsonData.aceModuleJsonPath);
    }

    // externalApiPaths
    if (jsonData.externalApiPaths) {
        jsonData.externalApiPaths = jsonData.externalApiPaths.map((p) => replaceWorkspace(p, workspace));
    }

    // externalApiPaths
    if (jsonData.codeRootPath) {
        jsonData.codeRootPath = changePathToAbsPath(jsonData.codeRootPath);
    }

    // abcLinkerPath
    if (jsonData.pandaSdkPath) {
        jsonData.pandaSdkPath = replaceWorkspace(jsonData.pandaSdkPath, workspace);
    }

    // abcLinkerPath
    if (jsonData.abcLinkerPath) {
        jsonData.abcLinkerPath = replaceWorkspace(jsonData.abcLinkerPath, workspace);
    }

    // dependencyAnalyzerPath
    if (jsonData.dependencyAnalyzerPath) {
        jsonData.dependencyAnalyzerPath = replaceWorkspace(jsonData.dependencyAnalyzerPath, workspace);
    }
    TEST_DATA = jsonData;
}
catch (error) {
    console.error('处理 JSON 文件时出错:', error);
}

const BUILDER_SCRIPT = process.env['BUILDER_SCRIPT'];
const { exec } = require('child_process');

/**
 * Runs a Node.js script and captures its output logs.
 * @param {string} scriptPath - Path to the script file to execute
 * @param {number} [timeoutMs=10000] - Maximum execution time in milliseconds
 * @returns {Promise<{logs: string}>} Promise that resolves with combined stdout/stderr logs
 * @throws {Error} Throws if process times out or encounters an error
 */
function runScriptAndCheckLogs(scriptPath: string, timeoutMs: number = TIMEOUT_MS) {
    return new Promise((resolve, reject) => {
        const process = exec(`node ${scriptPath}`, { timeout: timeoutMs }, (error, stdout, stderr) => {
            if (error && error.killed){
                return reject(new Error('Process timed out'));
            }
            const logs = (stdout + stderr).toString();
            resolve({ logs });
        });
        process.on('error', reject);
    });
}

function collectTestUnits(unitBasePath: string): Map<string, m.TestUnit> {
    const rules = new Map<string, m.TestUnit>();
    const folders = fs.readdirSync(unitBasePath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    for (const folderName of folders) {
        const rulePath = path.join(unitBasePath, folderName);
        const etsFile = path.join(rulePath, `${folderName}.ets`);
        const jsonFile = path.join(rulePath, `${folderName}.json`);
        if (fs.existsSync(etsFile) && fs.existsSync(jsonFile)) {
            const messageData = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
            const testUnit: m.TestUnit = {
                folderName:folderName,
                etsPath: etsFile,
                jsonPath: jsonFile,
                demo: messageData,
            };
            rules.set(folderName, testUnit);
        }
    }
    return rules;
}

const testUnits = collectTestUnits(unitPath);
jest.setTimeout(JEST_TIMEOUT_MS);

describe('All validation rules check', () => {
    let globalLogs = '';
    beforeAll(async () => {
        const allEtsPaths = Array.from(testUnits.values()).map(u => path.resolve(__dirname, u.etsPath));
        TEST_DATA.compileFiles = allEtsPaths;
        TEST_DATA.entryFiles = allEtsPaths;
        fs.writeFileSync(configFile, JSON.stringify(TEST_DATA, null, 2), 'utf8');
        const result = await runScriptAndCheckLogs(`${BUILDER_SCRIPT} ${configFile}`);
        globalLogs = result.logs;
    });

    for (const [ folderName, test] of testUnits) {
        for (const [demoName, demo] of Object.entries(test.demo)) {
            it(`${folderName} - ${demoName} should match`, () => {
                const pluginErrorLines = extractErrorWarningBlocks(globalLogs, LookingFor.ERROR);
                const pluginWarningLines = extractErrorWarningBlocks(globalLogs, LookingFor.WARNING);
                const missing: string[] = [];

                for (const { message, position } of demo.messages) {
                    const positionInfo = `${position.line}:${position.column}`;
                    const found =
                        pluginErrorLines.some(line => line.includes(message) && line.includes(positionInfo)) ||
                        pluginWarningLines.some(line => line.includes(message) && line.includes(positionInfo))
                    if (!found) {
                        missing.push(`${folderName}/${demoName}: ${message} ${positionInfo}`);
                    }
                }
                expect(missing).toEqual([]);
            });
        }
    }
    afterAll(() => {
        if (fs.existsSync(configFile)) fs.unlinkSync(configFile);
    });
});

