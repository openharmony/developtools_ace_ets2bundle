/*
 * Copyright (c) 2026 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as arkts from '@koalaui/libarkts';
import * as path from 'path';
import * as fs from 'fs';
import { PluginContext } from '../../common/plugin-context';
import { INSIGHT_INTENT_FILE_NAME } from '../../common/predefines';

/**
 * InsightIntent 数据项基础接口
 */
export interface InsightIntentDataBase {
    decoratorClass?: string | undefined;
    className?: string | undefined; // For Entity
    decoratorFile: string | undefined;
    decoratorType: string | undefined;
    moduleName: string | undefined;
    bundleName: string | undefined;
    intentName?: string | undefined;
    domain?: string | undefined;
    intentVersion?: string | undefined;
    displayName?: string | undefined;
    displayDescription?: string | undefined;
    schema?: string | undefined;
    icon?: string | undefined;
    llmDescription?: string | undefined;
    keywords?: string[];
    parameters?: Record<string, unknown> | null | undefined;
    result?: Record<string, unknown> | null | undefined;
    example?: string;
    [key: string]: unknown;
}

/**
 * InsightIntentLink 数据接口
 */
export interface InsightIntentLinkData extends InsightIntentDataBase {
    uri: string;
    paramMappings?: Record<string, unknown> | null | undefined | string;
    [key: string]: unknown;
}

/**
 * InsightIntentEntry 数据接口
 */
export interface InsightIntentEntryData extends InsightIntentDataBase {
    abilityName: string;
    executeMode: number[];
}

/**
 * InsightIntentPage 数据接口
 */
export interface InsightIntentPageData extends InsightIntentDataBase {
    uiAbility?: string;
    pagePath: string;
    navigationId?: string;
    navDestinationName?: string;
}

/**
 * InsightIntentFunction/Method 数据接口
 */
export interface InsightIntentFunctionData extends InsightIntentDataBase {
    functionName?: string;
    functionParamList?: string[];
}

/**
 * InsightIntentForm 数据接口
 */
export interface InsightIntentFormData extends InsightIntentDataBase {
    formName: string;
    abilityName?: string;
}
/**
 * InsightIntentEntity 数据接口
 */
export interface InsightIntentEntityData {
    className: string;
    decoratorFile: string;
    decoratorType: string;
    entityCategory: string;
    entityId?: string;
    parentClassName?: string;
    parameters?: Record<string, unknown> | null | undefined;
    supportedQueryProperties?: string[];
}

/**
 * 联合类型：所有 InsightIntent 数据类型
 */
export type InsightIntentData = 
    | InsightIntentLinkData 
    | InsightIntentEntryData 
    | InsightIntentPageData 
    | InsightIntentFunctionData 
    | InsightIntentFormData 
    | InsightIntentEntityData;

/**
 * InsightIntent 配置文件结构
 */
export interface InsightIntentConfig {
    insightIntents: InsightIntentData[];  // 主要的 intent 列表（Link, Entry, Page, Function, Form）
    insightIntentsSrcEntry: Map<string, object[]>;        // 源文件入口信息
    extractInsightIntents: InsightIntentData[];  // 提取的 intent 数据（旧版兼容字段）
}

interface InsightIntentCacheConfig {
    extractInsightIntents: InsightIntentDataBase[];
    entityIntents: InsightIntentEntityData[];
    entityOwnerMapByFile: Record<string, Record<string, string[]>>;
    entityExtendsMapByFile: Record<string, Record<string, string>>;
}

/**
 * InsightIntentCollector 单例类
 * 用于收集编译过程中的 InsightIntentLink 装饰器信息
 */
export class InsightIntentCollector {
    private static instance: InsightIntentCollector;
    private intents: Map<string, InsightIntentData> = new Map();
    private fileIntentKeys: Map<string, Set<string>> = new Map();
    private touchedFiles: Set<string> = new Set();
    // 按源文件记录每个 intent 对应的 entity 类名，便于增量编译时精准替换
    private entityOwnerMapByFile: Map<string, Map<string, Set<string>>> = new Map();
    // 按源文件记录 entity 的直接继承关系：子类 -> 父类
    private entityExtendsMapByFile: Map<string, Map<string, string>> = new Map();
    private constructor() {}

    public static getInstance(): InsightIntentCollector {
        if (!InsightIntentCollector.instance) {
            InsightIntentCollector.instance = new InsightIntentCollector();
        }
        return InsightIntentCollector.instance;
    }

    /**
     * 添加一个 InsightIntent 数据项
     */
    public addIntent(intent: InsightIntentData): void {
        // 支持同一个类上存在多个 InsightIntent 装饰器，避免后写入的数据覆盖先写入的数据
        const identifier = 'decoratorClass' in intent ? intent.decoratorClass : 
                          'className' in intent ? intent.className : 'Unknown';
        const decoratorType = 'decoratorType' in intent ? intent.decoratorType : 'UnknownDecorator';
        const intentIdentity = 'intentName' in intent && intent.intentName ? intent.intentName :
            'functionName' in intent && intent.functionName ? intent.functionName :
            'entityCategory' in intent && intent.entityCategory ? intent.entityCategory :
            'formName' in intent && intent.formName ? intent.formName :
            'default';
        const key = `${intent.decoratorFile}#${identifier}#${decoratorType}#${intentIdentity}`;
        this.intents.set(key, intent);
        if (intent.decoratorFile) {
            if (!this.fileIntentKeys.has(intent.decoratorFile)) {
                this.fileIntentKeys.set(intent.decoratorFile, new Set());
            }
            this.fileIntentKeys.get(intent.decoratorFile)!.add(key);
        }
    }

    public markSourceFileTouched(decoratorFile: string | undefined): void {
        if (!decoratorFile) {
            return;
        }
        this.touchedFiles.add(decoratorFile);
        this.removeFileData(decoratorFile);
    }
    
    /**
     * 添加 entity 与 intent 的关联关系
     * @param intentName intent 的名称
     * @param entityClassName entity 类名
     */
    public addEntityOwner(intentName: string, entityClassName: string, decoratorFile?: string): void {
        if (!intentName || !entityClassName || !decoratorFile) {
            return;
        }

        if (!this.entityOwnerMapByFile.has(decoratorFile)) {
            this.entityOwnerMapByFile.set(decoratorFile, new Map());
        }
        const fileEntityOwners = this.entityOwnerMapByFile.get(decoratorFile)!;
        if (!fileEntityOwners.has(intentName)) {
            fileEntityOwners.set(intentName, new Set());
        }
        fileEntityOwners.get(intentName)!.add(entityClassName);
    }

    public addEntityInheritance(entityClassName: string, parentClassName: string, decoratorFile?: string): void {
        if (!entityClassName || !parentClassName || !decoratorFile) {
            return;
        }
        if (!this.entityExtendsMapByFile.has(decoratorFile)) {
            this.entityExtendsMapByFile.set(decoratorFile, new Map());
        }
        this.entityExtendsMapByFile.get(decoratorFile)!.set(entityClassName, parentClassName);
    }

    /**
     * 获取所有收集的 InsightIntent 数据
     */
    public getAllIntents(): InsightIntentData[] {
        return Array.from(this.intents.values());
    }

    /**
     * 清空收集的数据
     */
    public clear(): void {
        this.intents.clear();
        this.fileIntentKeys.clear();
        this.touchedFiles.clear();
        this.entityOwnerMapByFile.clear();
        this.entityExtendsMapByFile.clear();
    }

    private removeFileData(decoratorFile: string): void {
        const existingKeys = this.fileIntentKeys.get(decoratorFile);
        if (existingKeys) {
            for (const key of existingKeys) {
                this.intents.delete(key);
            }
            this.fileIntentKeys.delete(decoratorFile);
        }
        this.entityOwnerMapByFile.delete(decoratorFile);
        this.entityExtendsMapByFile.delete(decoratorFile);
    }

    private getTouchedFiles(): string[] {
        return Array.from(this.touchedFiles.values());
    }

    private buildEntityOwnerMap(
        entityOwnerMapByFile: Map<string, Map<string, Set<string>>> = this.entityOwnerMapByFile
    ): Map<string, Set<string>> {
        const entityOwnerMap: Map<string, Set<string>> = new Map();
        for (const fileEntityOwners of entityOwnerMapByFile.values()) {
            for (const [intentName, entityClassNames] of fileEntityOwners.entries()) {
                if (!entityOwnerMap.has(intentName)) {
                    entityOwnerMap.set(intentName, new Set());
                }
                const targetEntityNames = entityOwnerMap.get(intentName)!;
                for (const entityClassName of entityClassNames) {
                    targetEntityNames.add(entityClassName);
                }
            }
        }
        return entityOwnerMap;
    }

    private buildEntityExtendsMap(
        entityExtendsMapByFile: Map<string, Map<string, string>> = this.entityExtendsMapByFile
    ): Map<string, string> {
        const entityExtendsMap: Map<string, string> = new Map();
        for (const fileEntityExtends of entityExtendsMapByFile.values()) {
            for (const [entityClassName, parentClassName] of fileEntityExtends.entries()) {
                entityExtendsMap.set(entityClassName, parentClassName);
            }
        }
        return entityExtendsMap;
    }

    private expandEntityOwnersWithInheritance(entityOwnerMap: Map<string, Set<string>>, entityExtendsMap: Map<string, string>): void {
        for (const [intentName, entityClassNames] of entityOwnerMap.entries()) {
            const expandedClassNames = new Set<string>(entityClassNames);
            for (const className of entityClassNames) {
                this.visitEntityInheritance(className, expandedClassNames, entityExtendsMap);
            }
            entityOwnerMap.set(intentName, expandedClassNames);
        }
    }

    private visitEntityInheritance(
        entityClassName: string,
        expandedClassNames: Set<string>,
        entityExtendsMap: Map<string, string>
    ): void {
        const parentClassName = entityExtendsMap.get(entityClassName);
        if (!parentClassName || expandedClassNames.has(parentClassName)) {
            return;
        }
        expandedClassNames.add(parentClassName);
        this.visitEntityInheritance(parentClassName, expandedClassNames, entityExtendsMap);
    }
    /**
     * 将 entities 关联到对应的 intents
     * 根据 entityOwnerMap 中的映射关系，将 entity 数据添加到对应的 intent 中
     */
    private matchEntities(
        regularIntents: InsightIntentDataBase[],
        entities: InsightIntentEntityData[],
        entityOwnerMapByFile: Map<string, Map<string, Set<string>>> = this.entityOwnerMapByFile,
        entityExtendsMapByFile: Map<string, Map<string, string>> = this.entityExtendsMapByFile
    ): void {
        const entityOwnerMap = this.buildEntityOwnerMap(entityOwnerMapByFile);
        if (entities.length === 0 || entityOwnerMap.size === 0) {
            return;
        }
        this.expandEntityOwnersWithInheritance(entityOwnerMap, this.buildEntityExtendsMap(entityExtendsMapByFile));
        // 创建 entity 类名到 entity 数据的映射
        const entityMap: Map<string, InsightIntentEntityData> = new Map();
        for (const entity of entities) {
            entityMap.set(entity.className, entity);
        }
        
        // 创建 intentName 到 intent 的映射
        const intentNameMap: Map<string, InsightIntentDataBase> = new Map();
        for (const intent of regularIntents) {
            if (intent.intentName) {
                intentNameMap.set(intent.intentName, intent);
            }
        }
        
        // 遍历 entityOwnerMap，将 entities 添加到对应的 intent
        for (const [intentName, entityClassNames] of entityOwnerMap.entries()) {
            const targetIntent = intentNameMap.get(intentName);
            if (!targetIntent) {
                continue;
            }
            
            const matchedEntities: InsightIntentEntityData[] = [];
            for (const entityClassName of entityClassNames) {
                const entity = entityMap.get(entityClassName);
                if (entity) {
                    matchedEntities.push(entity);
                }
            }
            
            if (matchedEntities.length > 0) {
                targetIntent.entities = matchedEntities;
            }
        }
    }
    
    /**
     * 解析 $ref 引用，将实体的 parameters 内容内联到引用位置
     * 遍历 intent 的 parameters 和 result，查找 $ref 引用，
     * 并用匹配的 entity parameters 内容替换
     */
    private resolveEntityRefs(regularIntents: InsightIntentDataBase[], entities: InsightIntentEntityData[]): void {
        if (entities.length === 0) {
            return;
        }

        // 构建 $id -> parameters 映射
        const entitySchemaMap: Map<string, Record<string, unknown>> = new Map();
        for (const entity of entities) {
            const entityId = entity.parameters?.$id;
            if (typeof entityId === 'string' && entity.parameters) {
                entitySchemaMap.set(entityId, entity.parameters);
            }
        }

        if (entitySchemaMap.size === 0) {
            return;
        }

        // 遍历所有 intent，解析 $ref 引用
        for (const intent of regularIntents) {
            if ((intent as InsightIntentDataBase).parameters) {
                this.resolveRefsInObject((intent as InsightIntentDataBase).parameters, entitySchemaMap);
            }
            if ((intent as InsightIntentDataBase).result) {
                this.resolveRefsInObject((intent as InsightIntentDataBase).result, entitySchemaMap);
            }
        }
    }

    /**
     * 递归解析对象中的 $ref 引用
     * 当某个属性值对象包含 $ref 字段且其值与 entitySchemaMap 中的 $id 匹配时，
     * 将该属性值替换为对应 entity 的 parameters 内容
     */
    private resolveRefsInObject(obj: unknown, entitySchemaMap: Map<string, Record<string, unknown>>): void {
        if (!obj || typeof obj !== 'object') {
            return;
        }

        if (Array.isArray(obj)) {
            for (const item of obj) {
                this.resolveRefsInObject(item, entitySchemaMap);
            }
            return;
        }

        // 检查每个属性
        const objectRecord = obj as Record<string, unknown>;
        for (const key of Object.keys(objectRecord)) {
            const value = objectRecord[key];
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                const valueRecord = value as Record<string, unknown>;
                const refValue = valueRecord.$ref;
                // 检查是否包含 $ref 且能匹配到 entity 的 $id
                if (typeof refValue === 'string' && entitySchemaMap.has(refValue)) {
                    const entityParams = entitySchemaMap.get(refValue);
                    // 深拷贝 entity 的 parameters 内容，避免修改原始数据
                    const resolvedContent = JSON.parse(JSON.stringify(entityParams));
                    objectRecord[key] = resolvedContent;
                } else {
                    // 没有 $ref 或未匹配到，递归处理子对象
                    this.resolveRefsInObject(value, entitySchemaMap);
                }
            }
        }
    }

    private cloneData<T>(value: T): T {
        return JSON.parse(JSON.stringify(value)) as T;
    }

    private stripEntitiesFromRegularIntents(intents: InsightIntentDataBase[]): InsightIntentDataBase[] {
        return intents.map((intent: InsightIntentDataBase) => {
            const clonedIntent = this.cloneData(intent);
            delete clonedIntent.entities;
            return clonedIntent;
        });
    }

    private serializeEntityOwnerMapByFile(
        entityOwnerMapByFile: Map<string, Map<string, Set<string>>>
    ): Record<string, Record<string, string[]>> {
        const result: Record<string, Record<string, string[]>> = {};
        for (const [decoratorFile, intentMap] of entityOwnerMapByFile.entries()) {
            result[decoratorFile] = {};
            for (const [intentName, entityClassNames] of intentMap.entries()) {
                result[decoratorFile][intentName] = Array.from(entityClassNames.values());
            }
        }
        return result;
    }

    private deserializeEntityOwnerMapByFile(
        rawData: unknown
    ): Map<string, Map<string, Set<string>>> {
        const result: Map<string, Map<string, Set<string>>> = new Map();
        if (!rawData || typeof rawData !== 'object') {
            return result;
        }
        for (const [decoratorFile, intentMap] of Object.entries(rawData as Record<string, unknown>)) {
            if (!intentMap || typeof intentMap !== 'object') {
                continue;
            }
            const deserializedIntentMap: Map<string, Set<string>> = new Map();
            for (const [intentName, entityClassNames] of Object.entries(intentMap as Record<string, unknown>)) {
                if (!Array.isArray(entityClassNames)) {
                    continue;
                }
                deserializedIntentMap.set(intentName, new Set(entityClassNames.filter((item): item is string => typeof item === 'string')));
            }
            result.set(decoratorFile, deserializedIntentMap);
        }
        return result;
    }

    private serializeEntityExtendsMapByFile(
        entityExtendsMapByFile: Map<string, Map<string, string>>
    ): Record<string, Record<string, string>> {
        const result: Record<string, Record<string, string>> = {};
        for (const [decoratorFile, extendsMap] of entityExtendsMapByFile.entries()) {
            result[decoratorFile] = Object.fromEntries(extendsMap.entries());
        }
        return result;
    }

    private deserializeEntityExtendsMapByFile(
        rawData: unknown
    ): Map<string, Map<string, string>> {
        const result: Map<string, Map<string, string>> = new Map();
        if (!rawData || typeof rawData !== 'object') {
            return result;
        }
        for (const [decoratorFile, extendsMap] of Object.entries(rawData as Record<string, unknown>)) {
            if (!extendsMap || typeof extendsMap !== 'object') {
                continue;
            }
            const deserializedExtendsMap: Map<string, string> = new Map();
            for (const [entityClassName, parentClassName] of Object.entries(extendsMap as Record<string, unknown>)) {
                if (typeof parentClassName === 'string') {
                    deserializedExtendsMap.set(entityClassName, parentClassName);
                }
            }
            result.set(decoratorFile, deserializedExtendsMap);
        }
        return result;
    }

    private readCacheFile(cacheFilePath: string | undefined): InsightIntentCacheConfig {
        const emptyCache: InsightIntentCacheConfig = {
            extractInsightIntents: [],
            entityIntents: [],
            entityOwnerMapByFile: {},
            entityExtendsMapByFile: {},
        };
        if (!cacheFilePath || !fs.existsSync(cacheFilePath)) {
            return emptyCache;
        }
        try {
            const rawContent = fs.readFileSync(cacheFilePath, 'utf-8');
            const parsedContent = JSON.parse(rawContent) as Partial<InsightIntentCacheConfig>;
            return {
                extractInsightIntents: Array.isArray(parsedContent.extractInsightIntents) ? parsedContent.extractInsightIntents : [],
                entityIntents: Array.isArray(parsedContent.entityIntents) ? parsedContent.entityIntents : [],
                entityOwnerMapByFile: parsedContent.entityOwnerMapByFile ?? {},
                entityExtendsMapByFile: parsedContent.entityExtendsMapByFile ?? {},
            };
        } catch (error) {
            console.warn('[InsightIntent] Failed to parse cache file:', error);
            return emptyCache;
        }
    }

    private buildCacheFileContent(
        regularIntents: InsightIntentDataBase[],
        entityIntents: InsightIntentEntityData[],
        entityOwnerMapByFile: Map<string, Map<string, Set<string>>>,
        entityExtendsMapByFile: Map<string, Map<string, string>>
    ): InsightIntentCacheConfig {
        return {
            extractInsightIntents: this.stripEntitiesFromRegularIntents(regularIntents),
            entityIntents: this.cloneData(entityIntents),
            entityOwnerMapByFile: this.serializeEntityOwnerMapByFile(entityOwnerMapByFile),
            entityExtendsMapByFile: this.serializeEntityExtendsMapByFile(entityExtendsMapByFile),
        };
    }

    private mergeFileScopedSetMaps(
        cachedMap: Map<string, Map<string, Set<string>>>,
        currentMap: Map<string, Map<string, Set<string>>>,
        touchedFileSet: Set<string>
    ): Map<string, Map<string, Set<string>>> {
        const mergedMap: Map<string, Map<string, Set<string>>> = new Map();
        for (const [decoratorFile, intentMap] of cachedMap.entries()) {
            if (touchedFileSet.has(decoratorFile)) {
                continue;
            }
            const clonedIntentMap: Map<string, Set<string>> = new Map();
            for (const [intentName, entityClassNames] of intentMap.entries()) {
                clonedIntentMap.set(intentName, new Set(entityClassNames));
            }
            mergedMap.set(decoratorFile, clonedIntentMap);
        }
        for (const [decoratorFile, intentMap] of currentMap.entries()) {
            const clonedIntentMap: Map<string, Set<string>> = new Map();
            for (const [intentName, entityClassNames] of intentMap.entries()) {
                clonedIntentMap.set(intentName, new Set(entityClassNames));
            }
            mergedMap.set(decoratorFile, clonedIntentMap);
        }
        return mergedMap;
    }

    private mergeFileScopedStringMaps(
        cachedMap: Map<string, Map<string, string>>,
        currentMap: Map<string, Map<string, string>>,
        touchedFileSet: Set<string>
    ): Map<string, Map<string, string>> {
        const mergedMap: Map<string, Map<string, string>> = new Map();
        for (const [decoratorFile, extendsMap] of cachedMap.entries()) {
            if (touchedFileSet.has(decoratorFile)) {
                continue;
            }
            mergedMap.set(decoratorFile, new Map(extendsMap));
        }
        for (const [decoratorFile, extendsMap] of currentMap.entries()) {
            mergedMap.set(decoratorFile, new Map(extendsMap));
        }
        return mergedMap;
    }

    /**
     * 写入 JSON 配置文件到指定目录
     * 只更新 extractInsightIntents，保留 insightIntents 和 insightIntentsSrcEntry
     * Entity 按 1.1 旧链路格式挂载到对应 intent 的 entities 字段中，不单独落顶层字段
     */
    public writeToFile(aceProfilePath: string, bundleName: string, cachePath?: string): boolean {
        try {
            const touchedFiles = this.getTouchedFiles();
            const touchedFileSet = new Set(touchedFiles);
            const intents = this.getAllIntents();
            const cacheFilePath = cachePath ? path.join(cachePath, 'insight_compile_cache.json') : undefined;
            const cacheConfig = this.readCacheFile(cacheFilePath);
            const cachedEntityOwnerMapByFile = this.deserializeEntityOwnerMapByFile(cacheConfig.entityOwnerMapByFile);
            const cachedEntityExtendsMapByFile = this.deserializeEntityExtendsMapByFile(cacheConfig.entityExtendsMapByFile);
            // 如果既没有新数据，也没有缓存，不进行写入处理
            if (intents.length === 0 && 
                cacheConfig.extractInsightIntents.length === 0 && 
                cacheConfig.entityIntents.length === 0) {
                return false;
            }
            // 确保目录存在
            if (!fs.existsSync(aceProfilePath)) {
                fs.mkdirSync(aceProfilePath, { recursive: true });
            }
            if (cachePath && !fs.existsSync(cachePath)) {
                fs.mkdirSync(cachePath, { recursive: true });
            }

            const outputPath = path.join(aceProfilePath, INSIGHT_INTENT_FILE_NAME);
            
            // 读取现有配置文件（如果存在）
            let existingConfig: Partial<InsightIntentConfig> = {};
            if (fs.existsSync(outputPath)) {
                try {
                    const existingContent = fs.readFileSync(outputPath, 'utf-8');
                    const parsed = JSON.parse(existingContent);
                    existingConfig = {
                        ...(parsed.insightIntents !== undefined && { insightIntents: parsed.insightIntents }),
                        ...(parsed.insightIntentsSrcEntry !== undefined && { insightIntentsSrcEntry: parsed.insightIntentsSrcEntry }),
                    };
                } catch (error) {
                    console.warn('[InsightIntent] Failed to parse existing config:', error);
                }
            }
            
            // 性能优化：合并分类、变量替换为单次遍历
            const regularIntents: InsightIntentDataBase[] = [];
            const entities: InsightIntentEntityData[] = [];
            // 单次遍历：分类 + 更新bundleName
            for (const intent of intents) {
                // 更新 bundleName
                if ('bundleName' in intent) {
                    intent.bundleName = bundleName || intent.bundleName;
                }

                // 根据装饰器类型分类
                if (intent.decoratorType === '@InsightIntentEntity') {
                    entities.push(intent as InsightIntentEntityData);
                } else {
                    regularIntents.push(intent as InsightIntentDataBase);
                }
            }

            const preservedIntents = cacheConfig.extractInsightIntents.filter((intent: InsightIntentDataBase) => {
                return !intent.decoratorFile || !touchedFileSet.has(intent.decoratorFile);
            });
            const preservedEntities = cacheConfig.entityIntents.filter((entityIntent: InsightIntentEntityData) => {
                return !entityIntent.decoratorFile || !touchedFileSet.has(entityIntent.decoratorFile);
            });
            const mergedRegularIntents = this.stripEntitiesFromRegularIntents([
                ...preservedIntents,
                ...regularIntents,
            ]);
            const mergedEntities = this.cloneData([
                ...preservedEntities,
                ...entities,
            ]);
            const mergedEntityOwnerMapByFile = this.mergeFileScopedSetMaps(
                cachedEntityOwnerMapByFile,
                this.entityOwnerMapByFile,
                touchedFileSet
            );
            const mergedEntityExtendsMapByFile = this.mergeFileScopedStringMaps(
                cachedEntityExtendsMapByFile,
                this.entityExtendsMapByFile,
                touchedFileSet
            );
            // 将 entities 关联到对应的 intents
            this.matchEntities(mergedRegularIntents, mergedEntities, mergedEntityOwnerMapByFile, mergedEntityExtendsMapByFile);

            // 解析 $ref 引用：将实体 parameters 内容内联到 intent parameters 中的 $ref 引用位置
            this.resolveEntityRefs(mergedRegularIntents, mergedEntities);
            mergedRegularIntents.sort((leftIntent, rightIntent) => {
                return (leftIntent.decoratorFile || '').localeCompare(rightIntent.decoratorFile || '');
            });
            
            // 构建输出数据结构，保留现有的 insightIntents 和 insightIntentsSrcEntry
            const config: Partial<InsightIntentConfig> = {
                ...existingConfig
            };
            config.extractInsightIntents = mergedRegularIntents;

            // 写入文件
            fs.writeFileSync(outputPath, JSON.stringify(config, null, 2), 'utf-8');
            if (cacheFilePath) {
                const cacheFileContent = this.buildCacheFileContent(
                    mergedRegularIntents,
                    mergedEntities,
                    mergedEntityOwnerMapByFile,
                    mergedEntityExtendsMapByFile
                );
                fs.writeFileSync(cacheFilePath, JSON.stringify(cacheFileContent, null, 2), 'utf-8');
            }
            
            return true;
        } catch (error) {
            console.error('[InsightIntent] Failed to write config file:', error);
            return false;
        }
    }

    /**
     * 从 PluginContext 中提取配置并尝试写入文件
     * 这个方法封装了获取配置路径和调用 writeToFile 的逻辑
     * 
     * @param context - 插件上下文对象
     * @returns 写入是否成功
     */
    public tryWriteFromContext(context: PluginContext): boolean {
        try {
            const projectConfig = context.getProjectConfig?.();
            
            if (!projectConfig) {
                return false;
            }
            // 确保moduleRootPath目录存在
            if (!fs.existsSync(projectConfig.moduleRootPath)) {
                fs.mkdirSync(projectConfig.moduleRootPath, { recursive: true });
            }
            const pathSegments = [
                'build',
                'default',
                'intermediates',
                'res',
                'default',
                'resources',
                'base',
                'profile'
            ];
            if (!projectConfig || !projectConfig.aceProfilePath) {
                if (projectConfig.moduleRootPath) {
                    projectConfig.aceProfilePath = path.join(projectConfig.moduleRootPath, ...pathSegments);
                }else{
                    return false;
                }
            }
            const aceProfilePath = projectConfig.aceProfilePath
            if (!aceProfilePath) {
                return false;
            }
            const bundleName = projectConfig.bundleName || '';
            
            // 写入 JSON 文件
            return this.writeToFile(aceProfilePath, bundleName, projectConfig.cachePath);
        } catch (error) {
            console.error('[InsightIntent] Failed to generate config:', error);
            return false;
        }
    }

    /**
     * 重置收集器（用于新的编译周期）
     */
    public reset(): void {
        this.clear();
    }
}

