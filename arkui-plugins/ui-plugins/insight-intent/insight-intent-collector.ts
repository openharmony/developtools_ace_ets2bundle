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
    parameters?: Record<string, unknown> | null | undefined;
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
    insightEntities?: InsightIntentEntityData[];  // Entity 类型单独存储
}

/**
 * InsightIntentCollector 单例类
 * 用于收集编译过程中的 InsightIntentLink 装饰器信息
 */
export class InsightIntentCollector {
    private static instance: InsightIntentCollector;
    private intents: Map<string, InsightIntentData> = new Map();
    // 记录每个 intent 对应的 entity 类名
    private entityOwnerMap: Map<string, Set<string>> = new Map();

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
        // 使用 decoratorFile + (decoratorClass 或 className) 作为唯一标识
        const identifier = 'decoratorClass' in intent ? intent.decoratorClass : 
                          'className' in intent ? intent.className : 'Unknown';
        const key = `${intent.decoratorFile}#${identifier}`;
        this.intents.set(key, intent);
    }
    
    /**
     * 添加 entity 与 intent 的关联关系
     * @param intentName intent 的名称
     * @param entityClassName entity 类名
     */
    public addEntityOwner(intentName: string, entityClassName: string): void {
        if (!intentName || !entityClassName) {
            return;
        }
        
        if (!this.entityOwnerMap.has(intentName)) {
            this.entityOwnerMap.set(intentName, new Set());
        }
        this.entityOwnerMap.get(intentName)!.add(entityClassName);
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
        this.entityOwnerMap.clear();
    }

    /**
     * 将 entities 关联到对应的 intents
     * 根据 entityOwnerMap 中的映射关系，将 entity 数据添加到对应的 intent 中
     */
    private matchEntities(regularIntents: InsightIntentDataBase[], entities: InsightIntentEntityData[]): void {
        if (entities.length === 0 || this.entityOwnerMap.size === 0) {
            return;
        }
        
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
        for (const [intentName, entityClassNames] of this.entityOwnerMap.entries()) {
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
            if (entity.parameters && entity.parameters.$id) {
                entitySchemaMap.set(entity.parameters.$id, entity.parameters);
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
        for (const key of Object.keys(obj)) {
            const value = obj[key];
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                // 检查是否包含 $ref 且能匹配到 entity 的 $id
                if (value.$ref && entitySchemaMap.has(value.$ref)) {
                    const entityParams = entitySchemaMap.get(value.$ref);
                    // 深拷贝 entity 的 parameters 内容，避免修改原始数据
                    const resolvedContent = JSON.parse(JSON.stringify(entityParams));
                    obj[key] = resolvedContent;
                } else {
                    // 没有 $ref 或未匹配到，递归处理子对象
                    this.resolveRefsInObject(value, entitySchemaMap);
                }
            }
        }
    }

    private collectSchemaInfo(intent: InsightIntentLinkData): void {
        // 1. 校验 Intent 对象是否包含 schema 字段
        if (intent.schema) {
            // 2. 拼接 JSON Schema 文件的完整路径
            const schemaPath: string = path.join(
                __dirname, '../../insight_intents/schema', // 基准路径：当前文件目录向上两级 → insight_intents/schema 目录
                `${intent.schema}_${intent.intentVersion}.json` // 文件名：schema值 + _ + 版本号 + .json
            );
            // 3. 检查 Schema 文件是否存在
            if (fs.existsSync(schemaPath)) {
                // 4. 读取 Schema 文件的文本内容（编码为 utf-8）
                const schemaContent: string = fs.readFileSync(schemaPath, 'utf-8');
                // 5. 将 JSON 文本解析为 JavaScript 对象
                const schemaObj: InsightIntentLinkData = JSON.parse(schemaContent);
                // 6. 将 Schema 文件中的核心字段赋值到 Intent 对象
                intent.parameters = schemaObj.parameters ?? intent.parameters;
                intent.llmDescription = schemaObj.llmDescription ?? intent.llmDescription;
                intent.keywords = schemaObj.keywords ?? intent.keywords;
                intent.intentName = schemaObj.intentName ?? intent.intentName;
                intent.result = schemaObj.result ?? intent.result;
                intent.domain = schemaObj.domain ?? intent.domain;
            }
        }
    }
    /**
     * 写入 JSON 配置文件到指定目录
     * 只更新 extractInsightIntents 和 insightEntities，保留 insightIntents 和 insightIntentsSrcEntry
     */
    public writeToFile(aceProfilePath: string, bundleName: string): boolean {
        try {
            const intents = this.getAllIntents();
            if (intents.length === 0) {
                return false;
            }

            // 确保目录存在
            if (!fs.existsSync(aceProfilePath)) {
                fs.mkdirSync(aceProfilePath, { recursive: true });
            }

            const outputPath = path.join(aceProfilePath, 'insight_intent.json');
            
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

                // 收集意图对象的 Schema 信息（从指定路径读取 Schema 配置并填充到 intent）
                this.collectSchemaInfo(intent);
                
                // 更新 bundleName
                if ('bundleName' in intent) {
                    intent.bundleName = bundleName || intent.bundleName;
                }

                // 根据装饰器类型分类
                if (intent.decoratorType === '@InsightIntentEntity') {
                    entities.push(intent as InsightIntentEntityData);
                } else {
                    regularIntents.push(intent);
                }
            }
            
            // 将 entities 关联到对应的 intents
            this.matchEntities(regularIntents, entities);
            
            // 解析 $ref 引用：将实体 parameters 内容内联到 intent parameters 中的 $ref 引用位置
            this.resolveEntityRefs(regularIntents, entities);
            
            // 构建输出数据结构，保留现有的 insightIntents 和 insightIntentsSrcEntry
            const config = {
                ...existingConfig, 
                extractInsightIntents: regularIntents
            };

            // 如果有 Entity 数据，添加到配置中
            if (entities.length > 0) {
                config.insightEntities = entities;
            }

            // 写入文件
            fs.writeFileSync(outputPath, JSON.stringify(config, null, 2), 'utf-8');          
            
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

            const intentsCount = this.getAllIntents().length;
            
            // 只有当有收集到数据时才写入
            if (intentsCount === 0) {
                return false;
            }
            if (!projectConfig || !projectConfig.aceProfilePath) {
                return false;
            }
            const aceProfilePath = projectConfig.aceProfilePath
            
            const bundleName = projectConfig.bundleName || '';
            
            // 写入 JSON 文件
            return this.writeToFile(aceProfilePath, bundleName);
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

