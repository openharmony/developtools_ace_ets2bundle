/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
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
import { ProjectConfig } from '../../common/plugin-context';
import { InsightIntentCollector, InsightIntentData } from './insight-intent-collector';
import { LogCollector } from '../../common/log-collector';
import { LogType } from '../../common/predefines';
import { ResourceSourceCache } from './resource-source-cache';
import Ajv, { ErrorObject } from 'ajv';
import { isEtsGlobalClass } from '../struct-translators/utils';

const ajv = new Ajv({
    allErrors: true,
    strict: false,  // 允许未知关键字
    validateFormats: false,  // 暂不验证 format
    verbose: true  // 提供更详细的错误信息
});

// 装饰器常量
const INSIGHT_INTENT_LINK_DECORATOR = 'InsightIntentLink';
const INSIGHT_INTENT_ENTRY_DECORATOR = 'InsightIntentEntry';
const INSIGHT_INTENT_PAGE_DECORATOR = 'InsightIntentPage';
const INSIGHT_INTENT_FUNCTION_DECORATOR = 'InsightIntentFunction';
const INSIGHT_INTENT_FUNCTION_METHOD_DECORATOR = 'InsightIntentFunctionMethod';
const INSIGHT_INTENT_FORM_DECORATOR = 'InsightIntentForm';
const INSIGHT_INTENT_ENTITY_DECORATOR = 'InsightIntentEntity';

// 参数校验规则
const BASE_REQUIRED_FIELDS = ['intentName', 'domain', 'intentVersion', 'displayName'];
const DECORATOR_REQUIRED_FIELDS: Record<string, string[]> = {
    'Link': [...BASE_REQUIRED_FIELDS, 'uri'],
    'Entry': [...BASE_REQUIRED_FIELDS, 'abilityName', 'executeMode'],
    'Page': [...BASE_REQUIRED_FIELDS, 'pagePath'],
    'Function': BASE_REQUIRED_FIELDS,
    'FunctionMethod': BASE_REQUIRED_FIELDS,
    'Form': [...BASE_REQUIRED_FIELDS, 'formName'],
    'Entity': ['entityCategory']
};

function validateRequiredFields(data: any, decoratorType: string, node: arkts.AstNode): boolean {
    const requiredFields = DECORATOR_REQUIRED_FIELDS[decoratorType] || [];
    
    for (const field of requiredFields) {
        const value = data[field];
        if (value === undefined || value === null) {
            LogCollector.getInstance().collectLogInfo({
                node: node,
                type: LogType.ERROR,
                code: '10110003',
                message: `Required parameters are missing for the decorator. Missing field: "${field}" in @InsightIntent${decoratorType}`
            });
            return false;
        }
        if (typeof value === 'string' && value.trim() === '') {
            LogCollector.getInstance().collectLogInfo({
                node: node,
                type: LogType.ERROR,
                code: '10110003',
                message: `Required parameters are missing for the decorator. Empty field: "${field}" in @InsightIntent${decoratorType}`
            });
            return false;
        }
        if (Array.isArray(value) && value.length === 0) {
            LogCollector.getInstance().collectLogInfo({
                node: node,
                type: LogType.ERROR,
                code: '10110003',
                message: `Required parameters are missing for the decorator. Empty array: "${field}" in @InsightIntent${decoratorType}`
            });
            return false;
        }
    }
    
    return true;
}

function validateExecuteMode(executeMode: any): boolean {
    if (!Array.isArray(executeMode) || executeMode.length === 0) {
        return false;
    }
    return executeMode.every(mode => [0, 1, 2, 3].includes(mode));
}

function validateKeywords(keywords: any, node: arkts.AstNode): boolean {
    if (!keywords) {
        return true;
    }
    
    if (!Array.isArray(keywords)) {
        LogCollector.getInstance().collectLogInfo({
            node: node,
            type: LogType.ERROR,
            code: '10110004',
            message: 'The parameter type does not match the decorator\'s requirement. keywords must be an array'
        });
        return false;
    }
    const valid = keywords.every((keyword: any) => typeof keyword === 'string');
    if (!valid) {
        LogCollector.getInstance().collectLogInfo({
            node: node,
            type: LogType.ERROR,
            code: '10110004',
            message: 'The parameter type does not match the decorator\'s requirement. All keywords must be strings'
        });
    }
    return valid;
}

/**
 * 验证 JSON Schema 的有效性（使用 Ajv）
 * 
 * @param schema - 要验证的 JSON Schema 对象
 * @param fieldName - 字段名称，用于错误日志
 * @param node - AST 节点，用于错误定位
 * @returns 如果 schema 为空或验证通过返回 true，否则返回 false
 * 
 * 验证规则：
 * 1. 空值（null/undefined）被视为有效（可选字段）
 * 2. 空对象（{}）被视为有效（JSON Schema 规范：接受任何值）
 * 3. 必须是对象类型，不能是数组
 * 4. 使用 Ajv 验证 schema 本身是否为有效的 JSON Schema
 */
function validateJsonSchema(schema: any, fieldName: string, node: arkts.AstNode): boolean {
    // 空值被视为有效（可选字段）
    if (!schema) {
        return true;
    }
    
    // 必须是对象类型
    if (typeof schema !== 'object' || Array.isArray(schema)) {
        LogCollector.getInstance().collectLogInfo({
            node: node,
            type: LogType.ERROR,
            code: '10110004',
            message: `The parameter type does not match the decorator's requirement. ${fieldName} must be a valid JSON Schema object`
        });
        return false;
    }
    
    // 空对象被视为有效
    if (Object.keys(schema).length === 0) {
        return true;
    }

    // 使用 Ajv 验证 schema 格式
    try {
        ajv.compile(schema); // 尝试编译 schema，如果编译失败说明 schema 格式不正确
        return true;
    } catch (compileError: any) {
        // 捕获 Ajv 编译错误并转换为 LogCollector 格式
        const errorMessage = compileError.message || String(compileError);
        // 解析错误类型并报告适当的错误码
        if (errorMessage.includes('unknown keyword') || errorMessage.includes('strict mode')) {
            LogCollector.getInstance().collectLogInfo({
                node: node,
                type: LogType.ERROR,
                code: '10110005',
                message: `Unsupported parameters found in the decorator. ${fieldName} contains unsupported JSON Schema keywords: ${errorMessage}`
            });
        } else if (errorMessage.includes('type') || errorMessage.includes('should be')) {
            LogCollector.getInstance().collectLogInfo({
                node: node,
                type: LogType.ERROR,
                code: '10110004',
                message: `The parameter type does not match the decorator's requirement. ${fieldName} validation error: ${errorMessage}`
            });
        } else {
            LogCollector.getInstance().collectLogInfo({
                node: node,
                type: LogType.ERROR,
                code: '10110005',
                message: `Unsupported parameters found in the decorator. ${fieldName} is not a valid JSON Schema: ${errorMessage}`
            });
        }
        return false;
    }
}

function validateParamMappings(paramMappings: any, node: arkts.AstNode): boolean {
    if (!paramMappings) {
        return true;
    }
    
    if (!Array.isArray(paramMappings)) {
        LogCollector.getInstance().collectLogInfo({
            node: node,
            type: LogType.ERROR,
            code: '10110004',
            message: 'The parameter type does not match the decorator\'s requirement. paramMappings must be an array'
        });
        return false;
    }
    
    for (const mapping of paramMappings) {
        if (!mapping || typeof mapping !== 'object') {
            LogCollector.getInstance().collectLogInfo({
                node: node,
                type: LogType.ERROR,
                code: '10110004',
                message: 'The parameter type does not match the decorator\'s requirement. Each paramMapping must be an object'
            });
            return false;
        }
        if (!mapping.paramName || typeof mapping.paramName !== 'string') {
            LogCollector.getInstance().collectLogInfo({
                node: node,
                type: LogType.ERROR,
                code: '10110003',
                message: 'Required parameters are missing for the decorator. Each paramMapping must have a valid paramName string'
            });
            return false;
        }
        if (mapping.paramCategory && !['link', 'want'].includes(mapping.paramCategory.toLowerCase())) {
            LogCollector.getInstance().collectLogInfo({
                node: node,
                type: LogType.ERROR,
                code: '10110004',
                message: `The parameter type does not match the decorator's requirement. Invalid paramCategory: ${mapping.paramCategory}, must be 'link' or 'want'`
            });
            return false;
        }
    }
    
    return true;
}

/**
 * InsightIntentHandler
 * 在 Check 阶段处理 InsightIntent 装饰器
 * 使用 arkts.getDecl() 直接获取变量声明，不依赖 Parse 阶段的缓存
 * 
 * 性能优化：
 * - 提前退出机制：快速过滤不包含InsightIntent装饰器的类
 * - 路径规范化缓存：避免重复的字符串处理
 * - 装饰器类型映射：使用Map替代switch提升查找性能
 * - Check阶段直接解析：使用arkts.getDecl()获取变量值，无需缓存
 */
export class InsightIntentHandler {
    private projectConfig: ProjectConfig | undefined;
    private collector: InsightIntentCollector;
    
    // 性能优化：路径规范化缓存
    private normalizedPathCache: Map<string, string> = new Map();
    
    // 性能优化：装饰器处理器映射表
    private readonly decoratorHandlers: Map<string, (anno: any, node: any) => InsightIntentData | null>;
    
    // 缓存当前文件的变量（从ETSGLOBAL类成员中按需提取）
    private topLevelVariables: Map<string, any> = new Map();
    
    // 缓存ETSGLOBAL类节点
    private etsGlobalClass: arkts.ClassDeclaration | null = null;
    
    // 性能优化：ETSGLOBAL成员索引（name -> member）
    private etsGlobalMemberIndex: Map<string, arkts.ClassProperty> = new Map();
    
    // 导入变量映射：变量名 -> { modulePath, exportedName, identifierNode }
    private importedVariables: Map<string, { 
        modulePath: string, 
        exportedName: string,
        identifierNode: arkts.Identifier  // 保存 Identifier 节点用于延迟解析
    }> = new Map();
    

    constructor(projectConfig: ProjectConfig | undefined) {
        this.projectConfig = projectConfig;
        this.collector = InsightIntentCollector.getInstance();
        
        // 初始化装饰器处理器映射表
        this.decoratorHandlers = new Map([
            [INSIGHT_INTENT_LINK_DECORATOR, this.extractLinkIntentData.bind(this)],
            [INSIGHT_INTENT_ENTRY_DECORATOR, this.extractEntryIntentData.bind(this)],
            [INSIGHT_INTENT_PAGE_DECORATOR, this.extractPageIntentData.bind(this)],
            [INSIGHT_INTENT_FUNCTION_DECORATOR, this.extractFunctionIntentData.bind(this)],
            [INSIGHT_INTENT_FUNCTION_METHOD_DECORATOR, this.extractFunctionMethodIntentData.bind(this)],
            [INSIGHT_INTENT_FORM_DECORATOR, this.extractFormIntentData.bind(this)],
            [INSIGHT_INTENT_ENTITY_DECORATOR, this.extractEntityIntentData.bind(this)],
        ]);
    }

    reset(): void {    
        // 清理路径规范化缓存
        this.normalizedPathCache.clear();
        // 清理顶层变量缓存
        this.topLevelVariables.clear();
        this.etsGlobalMemberIndex.clear();
        this.etsGlobalClass = null;
        // 清理导入映射
        this.importedVariables.clear();
        // 注意：crossFileETSGlobalCache 跨文件共享，不清理
    }
    /**
     * 处理节点入口判断
     */
    nodeHandleEntry(node: arkts.ClassDeclaration): void {
        // 检查是否是ETSGLOBAL类，如果是则从中收集变量
        if (isEtsGlobalClass(node)) {
            this.collectFromETSGlobal(node);
        }
        
        // 集成 InsightIntent 处理：在处理类声明时同时处理装饰器
        this.handleClass(node);
    }
    /**
     * 初始化方法：仅收集 import 语句信息，不预解析
     */
    init(program: arkts.Program | undefined): void {
        if (!program || !program.astNode) {
            return;
        }
        
        this.collectImports(program.astNode);
    }
    /**
     * 处理枚举类型变量
     */
    private processEnumElement(actualNode: arkts.Expression): string {
        let enumValue: string = actualNode.property.name||'';
        const paramCategoryEnum: Map<string, string> = new Map();
        paramCategoryEnum.set('LINK', 'link');
        paramCategoryEnum.set('WANT', 'want');
        if (paramCategoryEnum.has(enumValue)) {
            return paramCategoryEnum.get(enumValue)||'';
        } else {
            const errorMessage: string = `Unsupported parameters found in the decorator.`;
            LogCollector.getInstance().collectLogInfo({
                node: actualNode,
                type: LogType.ERROR,
                code: '10110005',
                message: 'InsightIntent Compiler Error'
            });
            return '';
        }
    }
    /**
     * 收集当前文件的 import 语句
     */
    private collectImports(script: arkts.EtsScript): void {
        if (!script.statements) {
            return;
        }
        
        for (const statement of script.statements) {
            // 处理 import 声明
            if (arkts.isImportDeclaration(statement)) {
                this.processImportDeclaration(statement);
            }
        }
        
    }
    
    /**
     * 处理单个 import 声明
     * 只收集信息，不立即解析值
     */
    private processImportDeclaration(importDecl: arkts.ImportDeclaration): void {
        const source = importDecl.source;
        if (!source || !arkts.isStringLiteral(source)) {
            return;
        }
        
        const modulePath = source.str;
        
        // 处理命名导入：import { A, B as C } from './module'
        if (importDecl.specifiers) {
            for (const specifier of importDecl.specifiers) {
                if (arkts.isImportSpecifier(specifier)) {
                    const imported = specifier.imported;  // 导出的名称
                    const local = specifier.local;        // 本地使用的名称
                    
                    if (arkts.isIdentifier(imported) && arkts.isIdentifier(local)) {
                        const exportedName = imported.name;
                        const localName = local.name;
                        
                        // 保存导入信息和 Identifier 节点引用
                        this.importedVariables.set(localName, {
                            modulePath: modulePath,
                            exportedName: exportedName,
                            identifierNode: local  // 保存节点引用，用于延迟解析
                        });
                    }
                }
            }
        }
    }
    
    /**
     * 从ETSGLOBAL类收集变量（延迟收集策略：只保存引用，按需提取）
     * 在Check阶段，当遇到ETSGLOBAL类时调用
     * 性能优化：建立成员索引，避免线性查找
     */
    collectFromETSGlobal(etsGlobalClass: arkts.ClassDeclaration): void {
        // 只清理缓存，保存 ETSGLOBAL 类的引用
        this.topLevelVariables.clear();
        this.etsGlobalMemberIndex.clear();
        this.etsGlobalClass = etsGlobalClass;
        
        // 建立成员名称索引，提升查找性能 O(n) -> O(1)
        if (etsGlobalClass?.definition?.body) {
            for (const member of etsGlobalClass.definition.body) {
                if (arkts.isClassProperty(member) && 
                    member.key && 
                    arkts.isIdentifier(member.key)) {
                    this.etsGlobalMemberIndex.set(member.key.name, member);
                }
            }
        }
    }
    
    /**
     * 从表达式中提取值
     */
    private extractValueFromExpression(expr: arkts.Expression): any {
        // 使用 arkts API 解包 TSAsExpression
        let actualExpr: any = expr;
        while (arkts.isTSAsExpression(actualExpr)) {
            actualExpr = actualExpr.expr;
            if (!actualExpr) break;
        }
        
        if (arkts.isObjectExpression(actualExpr)) {
            return this.convertObjectExpressionToJson(actualExpr);
        }
        
        if (arkts.isArrayExpression(actualExpr)) {
            return this.convertArrayExpressionToJson(actualExpr);
        }
        
        if (arkts.isStringLiteral(actualExpr)) {
            return actualExpr.str;
        }
        
        if (arkts.isNumberLiteral(actualExpr)) {
            // 性能优化：减少 dumpSrc() 调用
            // 只在处理对象属性时调用 dumpSrc()，其他情况使用 value
            try {
                const srcValue = actualExpr.dumpSrc();
                if (srcValue) {
                    const num = Number(srcValue);
                    if (!isNaN(num)) {
                        return num;
                    }
                }
            } catch (e) {
                // 忽略错误，使用 fallback
            }
            // Fallback: 使用 value 属性，处理 BigInt 类型
            const value = actualExpr.value;
            if (typeof value === 'bigint') {
                // BigInt 转换为 Number（如果超出安全范围会损失精度）
                return Number(value);
            }
            return value;
        }
        
        if (arkts.isBooleanLiteral(actualExpr)) {
            return actualExpr.value;
        }
        
        // 处理 CallExpression（如已转换的 _r() 调用）
        // 从 ResourceSourceCache 获取原始的 $r() 表达式
        if (arkts.isCallExpression(actualExpr)) {
            const originalSource = ResourceSourceCache.getInstance().get(actualExpr);
            if (originalSource) {
                return originalSource;
            }
        }
        
        return undefined;
    }

    /**
     * 处理带有 InsightIntent 装饰器的类声明
     */
    handleClass(node: arkts.ClassDeclaration): void {
        if (!node.definition) {
            return;
        }

        // 处理类级别的装饰器
        if (node.definition.annotations) {
            // console.log('[[[[2222===='+node.dumpSrc())
            this.processClassAnnotations(node.definition.annotations, node);
        }
        
        // 处理方法级别的装饰器（如 @InsightIntentFunctionMethod）
        if (node.definition.body) {
            this.processMethodAnnotations(node.definition.body, node);
        }
    }
    
    /**
     * 处理类级别的装饰器
     */
    private processClassAnnotations(annotations: readonly arkts.AnnotationUsage[], classNode: arkts.ClassDeclaration): void {
        // 性能优化：提前退出机制
        const hasInsightDecorator = annotations.some((anno: arkts.AnnotationUsage) => 
            anno.expr && 
            arkts.isIdentifier(anno.expr) && 
            anno.expr.name.startsWith('InsightIntent')
        );
        if (!hasInsightDecorator) {
            // console.log("[[[[[[")
            return;
        }
        // console.log("fffffffff")
        // 遍历所有注解
        for (const anno of annotations) {
            if (!anno.expr || !arkts.isIdentifier(anno.expr)) {
        // console.log("continue111")
                continue;
            }

            const decoratorName = anno.expr.name;
            // console.log("decoratorName="+decoratorName)
            const handler = this.decoratorHandlers.get(decoratorName);
            if (!handler) {
        // console.log("continue111")
                continue;
            }

            try {
                const intentData = handler(anno, classNode);

                if (intentData) {
                    // console.log("有节点！")
                    this.collector.addIntent(intentData);
                }
            } catch (error) {
                LogCollector.getInstance().collectLogInfo({
                    node: classNode,
                    type: LogType.ERROR,
                    code: '10110005',
                    message: `Unsupported parameters found in the decorator. Failed to process @${decoratorName}: ${error}`
                });
            }
        }
    }
    
    /**
     * 处理方法级别的装饰器（如 @InsightIntentFunctionMethod）
     */
    private processMethodAnnotations(body: readonly arkts.AstNode[], classNode: arkts.ClassDeclaration): void {
        for (const member of body) {
            // 处理方法定义
            if (arkts.isMethodDefinition(member)) {
                const methodAnnotations = member.scriptFunction?.annotations;
                if (!methodAnnotations || methodAnnotations.length === 0) {
                    continue;
                }
                
                for (const anno of methodAnnotations) {
                    if (!anno.expr || !arkts.isIdentifier(anno.expr)) {
                        continue;
                    }
                    
                    const decoratorName = anno.expr.name;
                    
                    // 只处理 InsightIntentFunctionMethod
                    if (decoratorName !== INSIGHT_INTENT_FUNCTION_METHOD_DECORATOR) {
                        continue;
                    }
                    
                    try {
                        const intentData = this.extractFunctionMethodIntentDataFromMethod(anno, member, classNode);
                        if (intentData) {
                            this.collector.addIntent(intentData);
                        }
                    } catch (error) {
                        LogCollector.getInstance().collectLogInfo({
                            node: classNode,
                            type: LogType.ERROR,
                            code: '10110005',
                            message: `Unsupported parameters found in the decorator. Failed to process @${decoratorName}: ${error}`
                        });
                    }
                }
            }
        }
    }

    /**
     * 获取变量的值（按需查找策略）
     * 优先从缓存查找，缓存未命中时从 ETSGLOBAL 中提取
     */
    private getVariableValueFromDecl(identifier: arkts.Identifier): any {
        const varName = identifier.name;
        
        // 1. 先查缓存（按需缓存）
        if (this.topLevelVariables.has(varName)) {
            return this.topLevelVariables.get(varName);
        }
        
        // 2. 缓存未命中，从 ETSGLOBAL 中按需提取
        if (this.etsGlobalClass) {
            const value = this.extractVariableFromETSGlobal(varName);
            if (value !== undefined) {
                // 缓存提取的值，避免重复解析
                this.topLevelVariables.set(varName, value);
                return value;
            }
        }
        
        return undefined;
    }
    
    /**
     * 从 ETSGLOBAL 类中按需提取单个变量的值
     * 只在首次访问该变量时调用，之后使用缓存
     * 性能优化：使用索引查找，O(1) 复杂度
     */
    private extractVariableFromETSGlobal(varName: string): any {
        // 使用索引快速查找
        const member = this.etsGlobalMemberIndex.get(varName);
        if (member?.value) {
            return this.extractValueFromExpression(member.value);
        }
        
        return undefined;
    }
    
    /**
     * 从导入的变量中提取值（跨文件）
     * 使用保存的 Identifier 节点引用进行延迟解析
     */
    private extractImportedVariable(varName: string): any {
        
        // 检查是否是导入的变量
        const importInfo = this.importedVariables.get(varName);
        if (!importInfo) {
            return undefined;
        }
        
        // 使用保存的 Identifier 节点调用 arkts.getDecl()
        const decl = arkts.getDecl(importInfo.identifierNode);
        
        if (decl) {
            
            const value = this.extractValueFromDeclaration(decl);
            
            if (value !== undefined) {
                return value;
            }
        }
        
        return undefined;
    }
    
    
    /**
     * 从变量声明节点中提取值（支持跨文件）
     * 处理 VariableDeclarator 和 ClassProperty 两种情况
     */
    private extractValueFromDeclaration(decl: arkts.AstNode): any {
        // 处理变量声明：const MY_VAR = ...
        if (arkts.isIdentifier(decl) && decl.parent && arkts.isVariableDeclarator(decl.parent)) {
            return this.extractValueFromDeclarator(decl.parent);
        }
        
        // 处理类属性：class ETSGLOBAL { static MY_VAR = ... }
        if (arkts.isClassProperty(decl) && decl.value) {
            return this.extractValueFromExpression(decl.value);
        }
        
        return undefined;
    }
    
    /**
     * 从变量声明器中提取值
     */
    private extractValueFromDeclarator(declarator: arkts.VariableDeclarator): any {
        const init = declarator.initializer;
        
        if (!init) {
            return undefined;
        }
        
        if (arkts.isObjectExpression(init)) {
            return this.convertObjectExpressionToJson(init);
        }
        
        if (arkts.isArrayExpression(init)) {
            return this.convertArrayExpressionToJson(init);
        }
        
        if (arkts.isStringLiteral(init)) {
            return init.str;
        }
        
        if (arkts.isNumberLiteral(init)) {
            return Number(init.num);
        }
        
        if (arkts.isBooleanLiteral(init)) {
            return init.value;
        }
        
        return undefined;
    }

    private extractLinkIntentData(annotation: arkts.AnnotationUsage, classNode: arkts.ClassDeclaration): InsightIntentData | null {
        const baseData = this.extractBaseIntentData(annotation, classNode, '@InsightIntentLink');
        if (!baseData) return null;
        
        const data: any = { ...baseData };
        const properties = annotation.properties;
        for (const prop of properties) {
            if (!arkts.isClassProperty(prop) || !arkts.isIdentifier(prop.key)) continue;
            const propName = prop.key.name;
            const propValue = prop.value;
            if (!propValue) continue;
            if (propName === 'uri') {
                // uri 是必填字段，直接赋值
                data.uri = this.extractStringValue(propValue, classNode);
            } else if (propName === 'paramMappings') {
                // paramMappings 是非必填字段，空值不写入
                const paramMappings = this.extractJsonValue(propValue, classNode);
                if (this.isValidOptionalValue(paramMappings, classNode, '@InsightIntentLink')) {
                    data.paramMappings = paramMappings;
                }
            }
        }
        if (!validateRequiredFields(data, 'Link', classNode) || 
            (data.paramMappings && !validateParamMappings(data.paramMappings, classNode)) ||
            (data.keywords && !validateKeywords(data.keywords, classNode)) ||
            (data.parameters && !validateJsonSchema(data.parameters, 'parameters', classNode)) ||
            (data.result && !validateJsonSchema(data.result, 'result', classNode))) {
            return null;
        }
        return data;
    }

    private extractEntryIntentData(annotation: arkts.AnnotationUsage, classNode: arkts.ClassDeclaration): InsightIntentData | null {
        const baseData = this.extractBaseIntentData(annotation, classNode, '@InsightIntentEntry');
        if (!baseData) return null;

        const data: any = { ...baseData };
        const properties = annotation.properties;
        
        for (const prop of properties) {
            if (!arkts.isClassProperty(prop) || !arkts.isIdentifier(prop.key)) continue;
            const propName = prop.key.name;
            const propValue = prop.value;
            if (!propValue) continue;

            if (propName === 'abilityName') {
                data.abilityName = this.extractStringValue(propValue, classNode);
            } else if (propName === 'executeMode') {
                data.executeMode = this.extractExecuteModeArray(propValue);
            }
        }
        
        // 验证必填字段和数据类型
        if (!validateRequiredFields(data, 'Entry', classNode) ||
            (data.executeMode && !validateExecuteMode(data.executeMode)) ||
            (data.keywords && !validateKeywords(data.keywords, classNode)) ||
            (data.parameters && !validateJsonSchema(data.parameters, 'parameters', classNode))) {
            return null;
        }
        
        // 将 executeMode 从数字数组转换成字符串数组（必须在验证之后）
        if (data.executeMode) {
            this.processExecuteModeParam(data);
        }
        
        // 分析基类继承信息（InsightIntentEntryExecutor）
        this.analyzeBaseClass(classNode, data, '@InsightIntentEntry');
        
        return data;
    }

    private extractPageIntentData(annotation: arkts.AnnotationUsage, classNode: arkts.ClassDeclaration): InsightIntentData | null {
        const baseData = this.extractBaseIntentData(annotation, classNode, '@InsightIntentPage');
        if (!baseData) return null;

        const data: any = { ...baseData };
        const properties = annotation.properties;
        
        for (const prop of properties) {
            if (!arkts.isClassProperty(prop) || !arkts.isIdentifier(prop.key)) continue;
            const propName = prop.key.name;
            const propValue = prop.value;
            if (!propValue) continue;
            switch (propName) {
                case 'pagePath':
                    // pagePath 是必填字段，直接赋值
                    data[propName] = this.extractStringValue(propValue, classNode);
                    break;
                case 'uiAbility':
                case 'navigationId':
                case 'navDestinationName': {
                    // 非必填字段，空字符串不写入
                    const value = this.extractStringValue(propValue, classNode);
                    if (this.isValidOptionalValue(value, classNode, '@InsightIntentPage')) {
                        data[propName] = value;
                    }
                    break;
                }
            }
        }

        if (!validateRequiredFields(data, 'Page', classNode) ||
            (data.keywords && !validateKeywords(data.keywords, classNode)) ||
            (data.parameters && !validateJsonSchema(data.parameters, 'parameters', classNode)) ||
            (data.result && !validateJsonSchema(data.result, 'result', classNode))) {
            return null;
        }

        return data;
    }

    private extractFunctionIntentData(annotation: arkts.AnnotationUsage, classNode: arkts.ClassDeclaration): InsightIntentData | null {
        const baseData = this.extractBaseIntentData(annotation, classNode, '@InsightIntentFunction');
        if (!baseData) return null;

        if (!validateRequiredFields(baseData, 'Function', classNode) ||
            (baseData.keywords && !validateKeywords(baseData.keywords, classNode)) ||
            (baseData.parameters && !validateJsonSchema(baseData.parameters, 'parameters', classNode)) ||
            (baseData.result && !validateJsonSchema(baseData.result, 'result', classNode))) {
            return null;
        }

        return baseData;
    }

    private extractFunctionMethodIntentData(annotation: arkts.AnnotationUsage, classNode: arkts.ClassDeclaration): InsightIntentData | null {
        const baseData = this.extractBaseIntentData(annotation, classNode, '@InsightIntentFunctionMethod');
        if (!baseData) return null;

        if (!validateRequiredFields(baseData, 'FunctionMethod', classNode) ||
            (baseData.keywords && !validateKeywords(baseData.keywords, classNode)) ||
            (baseData.parameters && !validateJsonSchema(baseData.parameters, 'parameters', classNode)) ||
            (baseData.result && !validateJsonSchema(baseData.result, 'result', classNode))) {
            return null;
        }

        return baseData;
    }
    
    /**
     * 从方法装饰器中提取 FunctionMethod 意图数据
     */
    private extractFunctionMethodIntentDataFromMethod(
        annotation: arkts.AnnotationUsage, 
        methodDef: arkts.MethodDefinition,
        classNode: arkts.ClassDeclaration
    ): InsightIntentData | null {
        const properties = annotation.properties;
        if (!properties || properties.length === 0) {
            return null;
        }

        const data: any = {};
        
        // 获取类名和方法名
        const className = classNode.definition?.ident?.name || 'UnknownClass';
        const methodName = methodDef.name && arkts.isIdentifier(methodDef.name) 
            ? methodDef.name.name 
            : 'UnknownMethod';
        
        // 获取文件路径
        const program = arkts.getProgramFromAstNode(classNode);
        const filePath = program?.absName || '';

        data.decoratorClass = className;
        data.functionName = methodName;
        // 从 scriptFunction.params 获取方法参数列表
        const params = methodDef.scriptFunction?.params;
        if (params && params.length > 0) {
            data.functionParamList = params
                .map((param: arkts.Expression) => {
                    if (arkts.isIdentifier(param)) {
                        return param.name;
                    }
                    // ETSParameterExpression 的情况
                    if (param && (param as any).identifier && arkts.isIdentifier((param as any).identifier)) {
                        return (param as any).identifier.name;
                    }
                    return undefined;
                })
                .filter((name: string | undefined) => name !== undefined);
        }
        data.decoratorFile = this.normalizeFilePath(filePath);
        data.decoratorType = '@InsightIntentFunctionMethod';
        data.moduleName = this.projectConfig?.moduleName || 'entry';
        data.bundleName = this.projectConfig?.bundleName || '';

        // 提取装饰器参数
        for (const prop of properties) {
            if (!arkts.isClassProperty(prop) || !arkts.isIdentifier(prop.key)) continue;
            const propName = prop.key.name;
            const propValue = prop.value;
            if (!propValue) continue;

            switch (propName) {
                case 'intentName':
                case 'domain':
                case 'intentVersion':
                case 'displayName':
                    // 必填字段，直接赋值
                    data[propName] = this.extractStringValue(propValue, classNode);
                    break;
                case 'displayDescription':
                case 'schema':
                case 'icon':
                case 'llmDescription':
                case 'example': {
                    // 非必填字段，空字符串不写入
                    const value = this.extractStringValue(propValue, classNode);
                    if (this.isValidOptionalValue(value, classNode, '@InsightIntentFunctionMethod')) {
                        data[propName] = value;
                    }
                    break;
                }
                case 'keywords': {
                    // 非必填字段，空数组不写入
                    const keywords = this.extractArrayValue(propValue);
                    if (this.isValidOptionalValue(keywords, classNode, '@InsightIntentFunctionMethod')) {
                        data.keywords = keywords;
                    }
                    break;
                }
                case 'parameters':
                case 'result': {
                    // 非必填字段，undefined 或空字符串不写入
                    // 注意：SDK 定义中这些字段有默认值 = ""，需要额外过滤空字符串
                    const jsonValue = this.extractJsonValue(propValue, classNode);
                    // 过滤掉 undefined、null 和空字符串（SDK 默认值导致的）
                    if (this.isValidOptionalValue(jsonValue, classNode, '@InsightIntentFunctionMethod') && 
                        !(typeof jsonValue === 'string' && jsonValue.trim() === '')) {
                        data[propName] = jsonValue;
                    }
                    break;
                }
            }
        }

        // 验证必填字段
        if (!data.intentName || !data.domain || !data.intentVersion) {
            LogCollector.getInstance().collectLogInfo({
                node: classNode,
                type: LogType.ERROR,
                code: '10110003',
                message: 'Required parameters are missing for the decorator in @InsightIntentFunctionMethod'
            });
            return null;
        }

        if (!validateRequiredFields(data, 'FunctionMethod', classNode) ||
            (data.keywords && !validateKeywords(data.keywords, classNode)) ||
            (data.parameters && !validateJsonSchema(data.parameters, 'parameters', classNode)) ||
            (data.result && !validateJsonSchema(data.result, 'result', classNode))) {
            return null;
        }

        return data;
    }

    private extractFormIntentData(annotation: arkts.AnnotationUsage, classNode: arkts.ClassDeclaration): InsightIntentData | null {
        const baseData = this.extractBaseIntentData(annotation, classNode, '@InsightIntentForm');
        if (!baseData) return null;

        const data: any = { ...baseData };
        const properties = annotation.properties;
        
        for (const prop of properties) {
            if (!arkts.isClassProperty(prop) || !arkts.isIdentifier(prop.key)) continue;
            const propName = prop.key.name;
            const propValue = prop.value;
            if (!propValue) continue;

            if (propName === 'formName') {
                data.formName = this.extractStringValue(propValue, classNode);
            }
        }

        if (!validateRequiredFields(data, 'Form', classNode) ||
            (data.keywords && !validateKeywords(data.keywords, classNode)) ||
            (data.parameters && !validateJsonSchema(data.parameters, 'parameters', classNode)) ||
            (data.result && !validateJsonSchema(data.result, 'result', classNode))) {
            return null;
        }

        return data;
    }

    private extractEntityIntentData(annotation: arkts.AnnotationUsage, classNode: arkts.ClassDeclaration): InsightIntentData | null {
        const properties = annotation.properties;
        if (!properties || properties.length === 0) {
            return null;
        }

        const data: any = {};
        const className = classNode.definition?.ident?.name || 'UnknownClass';
        const program = arkts.getProgramFromAstNode(classNode);
        const filePath = program?.absName || '';

        data.className = className;
        data.decoratorFile = this.normalizeFilePath(filePath);
        data.decoratorType = '@InsightIntentEntity';

        for (const prop of properties) {
            if (!arkts.isClassProperty(prop) || !arkts.isIdentifier(prop.key)) continue;
            const propName = prop.key.name;
            const propValue = prop.value;
            if (!propValue) continue;

            if (propName === 'entityCategory') {
                // entityCategory 是必填字段，直接赋值
                data.entityCategory = this.extractStringValue(propValue, classNode);
            } else if (propName === 'parameters') {
                // parameters 是非必填字段，undefined 或空字符串不写入
                // 注意：SDK 定义中这些字段有默认值 = ""，需要额外过滤空字符串
                const parameters = this.extractJsonValue(propValue, classNode);
                // 过滤掉 undefined、null 和空字符串（SDK 默认值导致的）
                if (this.isValidOptionalValue(parameters, classNode, '@InsightIntentEntity') && 
                    !(typeof parameters === 'string' && parameters.trim() === '')) {
                    data.parameters = parameters;
                }
            }
        }

        if (!validateRequiredFields(data, 'Entity', classNode) ||
            (data.parameters && !validateJsonSchema(data.parameters, 'parameters', classNode))) {
            return null;
        }

        return data;
    }
    /**
     * 判断是否为有效的非空值（用于非必填字段）
     * @param value 要检查的值
     * @returns 如果值不是 undefined 或 null 返回 true（只要注解传参了就写入）
     */
    private isValidOptionalValue(value: any, classNode: arkts.ClassDeclaration, decoratorType: string): boolean {
        if (value === undefined || value === null) {
            LogCollector.getInstance().collectLogInfo({
                node: classNode,
                type: LogType.ERROR,
                code: '10110003',
                message: `Invalid value for the decorator in ${decoratorType}`
            });
            return false;
        }
        return true;
    }

    /**
     * 提取基础意图数据
     * @param annotation 
     * @param classNode 
     * @param decoratorType 
     * @returns 
     */
    private extractBaseIntentData(annotation: arkts.AnnotationUsage, classNode: arkts.ClassDeclaration, decoratorType: string): any | null {
        const properties = annotation.properties;
        if (!properties || properties.length === 0) {
            return null;
        }

        const data: any = {};
        const className = classNode.definition?.ident?.name || 'UnknownClass';
        const program = arkts.getProgramFromAstNode(classNode);
        const filePath = program?.absName || '';

        data.decoratorClass = className;
        data.decoratorFile = this.normalizeFilePath(filePath);
        data.decoratorType = decoratorType;
        data.moduleName = this.projectConfig?.moduleName || 'entry';
        data.bundleName = this.projectConfig?.bundleName || '';

        // 必填字段列表
        const requiredFields = ['intentName', 'domain', 'intentVersion', 'displayName'];

        for (const prop of properties) {
            if (!arkts.isClassProperty(prop) || !arkts.isIdentifier(prop.key)) continue;
            const propName = prop.key.name;
            const propValue = prop.value;
            if (!propValue) continue;

            switch (propName) {
                case 'intentName':
                case 'domain':
                case 'intentVersion':
                case 'displayName':
                    // 必填字段，直接赋值
                    data[propName] = this.extractStringValue(propValue, classNode);
                    break;
                case 'displayDescription':
                case 'schema':
                case 'icon':
                case 'llmDescription':
                case 'example': {
                    // 非必填字段，空字符串不写入
                    const value = this.extractStringValue(propValue, classNode);
                    if (this.isValidOptionalValue(value, classNode, decoratorType)) {
                        data[propName] = value;
                    }
                    break;
                }
                case 'keywords': {
                    // 非必填字段，空数组不写入
                    const keywords = this.extractArrayValue(propValue);
                    if (this.isValidOptionalValue(keywords, classNode, decoratorType)) {
                        data.keywords = keywords;
                    }
                    break;
                }
                case 'parameters':
                case 'result': {
                    // 非必填字段，undefined 或空字符串不写入
                    // 注意：SDK 定义中这些字段有默认值 = ""，需要额外过滤空字符串
                    const jsonValue = this.extractJsonValue(propValue, classNode);
                    // 过滤掉 undefined、null 和空字符串（SDK 默认值导致的）
                    if (this.isValidOptionalValue(jsonValue, classNode, decoratorType) && 
                        !(typeof jsonValue === 'string' && jsonValue.trim() === '')) {
                        data[propName] = jsonValue;
                    }
                    break;
                }
            }
        }

        if (!data.intentName || !data.domain || !data.intentVersion) {
            LogCollector.getInstance().collectLogInfo({
                node: classNode,
                type: LogType.ERROR,
                code: '10110003',
                message: `Required parameters are missing for the decorator in ${decoratorType}`
            });
            return null;
        }

        return data;
    }

    private extractStringValue(node: arkts.Expression, classNode?: arkts.ClassDeclaration): string | undefined {
        if (arkts.isStringLiteral(node)) {
            const strValue = node.str;
            // 判断是否可能是变量名（字面量形式的变量引用，如 icon: "icon1"）
            const isLikelyVariable = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(strValue);
            
            if (isLikelyVariable) {
                // 1. 先检查缓存
                if (this.topLevelVariables.has(strValue)) {
                    const cachedValue = this.topLevelVariables.get(strValue);
                    if (cachedValue !== undefined) {
                        return cachedValue;
                    }
                }
                
                // 2. 尝试从当前文件的 ETSGLOBAL 提取
                if (this.etsGlobalClass) {
                    const value = this.extractVariableFromETSGlobal(strValue);
                    if (value !== undefined) {
                        this.topLevelVariables.set(strValue, value);
                        return value;
                    }
                }
                
                // 3. 尝试从导入的变量中提取（跨文件）
                const importedValue = this.extractImportedVariable(strValue);
                if (importedValue !== undefined) {
                    this.topLevelVariables.set(strValue, importedValue);
                    return importedValue;
                }
            }
            
            // 如果不是变量名或查找失败，返回字符串字面量本身
            return strValue;
        }

        if (node.constructor.name === 'TemplateLiteral') {
            return this.extractTemplateLiteralValue(node as any) || undefined;
        }

        // 使用 arkts.getDecl() 获取变量值
        if (arkts.isIdentifier(node)) {
            const value = this.getVariableValueFromDecl(node);
            if (!value && classNode) {
                LogCollector.getInstance().collectLogInfo({
                    node: classNode,
                    type: LogType.WARN,
                    code: '10110005',
                    message: `Unsupported parameters found in the decorator. Variable not found or cannot extract value: ${node.name}`
                });
            }
            return value;
        }

        return undefined;
    }

    private extractTemplateLiteralValue(node: arkts.TemplateLiteral): string | null {
        try {
            if (node.expressions && node.expressions.length > 0) {
                return null;
            }
            if (node.quasis && node.quasis.length > 0) {
                return node.quasis.map((q: any) => q.cooked || q.raw || '').join('');
            }
            return null;
        } catch (error) {
            return null;
        }
    }

    private extractArrayValue(node: arkts.Expression): string[] | undefined {
        if (!arkts.isArrayExpression(node)) {
            return undefined;
        }

        const result: string[] = [];
        for (const element of node.elements) {
            if (arkts.isStringLiteral(element)) {
                result.push(element.str);
            }
        }

        return result;
    }
    private extractExecuteModeArray(node: arkts.Expression): number[] | undefined {
        if (!arkts.isArrayExpression(node)) {
            return undefined;
        }
        
        const result: number[] = [];
        const modeMap: Record<string, number> = {
            'UI_ABILITY_FOREGROUND': 0,
            'UI_ABILITY_BACKGROUND': 1,
            'UI_EXTENSION_ABILITY': 2,
            'SERVICE_EXTENSION_ABILITY': 3
        };
        
        for (const element of node.elements) {
            let numValue: number | undefined;
            
            if (arkts.isMemberExpression(element)) {
                const enumValue = this.extractEnumValueFromMemberExpression(element);
                if (enumValue && modeMap[enumValue] !== undefined) {
                    result.push(modeMap[enumValue]);
                }
            }
        }

        return result.length > 0 ? result : undefined;
    }
    
    /**
     * 从 MemberExpression 中提取枚举值
     * 例如: insightIntent.ExecuteMode.UI_ABILITY_FOREGROUND -> UI_ABILITY_FOREGROUND
     */
    private extractEnumValueFromMemberExpression(expr: arkts.MemberExpression): string | undefined {
        // 获取最右侧的属性名
        if (expr.property && arkts.isIdentifier(expr.property)) {
            return expr.property.name;
        }
        
        // 如果 property 不是 Identifier，尝试递归处理
        if (expr.property && arkts.isMemberExpression(expr.property)) {
            return this.extractEnumValueFromMemberExpression(expr.property);
        }
        
        return undefined;
    }
    
    /**
     * 处理 executeMode 参数：将数字数组转换为字符串数组
     * 0 -> 'foreground'
     * 1 -> 'background'
     * 2 -> 'uiextension'
     * 3 -> 'serviceextension'
     */
    private processExecuteModeParam(intentObj: any): void {
        if (intentObj.executeMode && Array.isArray(intentObj.executeMode)) {
            intentObj.executeMode = intentObj.executeMode.map((item: number) => {
                if (item === 0) {
                    return 'foreground';
                }
                if (item === 1) {
                    return 'background';
                }
                if (item === 2) {
                    return 'uiextension';
                }
                if (item === 3) {
                    return 'serviceextension';
                }
                return item;
            });
        }
    }
    
    /**
     * 分析类的基类继承信息
     * 用于 Entry 和 Entity 装饰器
     */
    private analyzeBaseClass(classNode: arkts.ClassDeclaration, intentObj: any, decoratorType: string): void {
        if (!classNode.definition || !classNode.definition.super) {
            return;
        }
        
        const superClass = classNode.definition.super;
        
        if (decoratorType === '@InsightIntentEntry') {
            // Entry 装饰器需要继承 InsightIntentEntryExecutor
            if (arkts.isExpression(superClass)) {
                this.processEntryBaseClass(superClass, classNode, intentObj);
            }
        }
    }
    
    /**
     * 处理 Entry 类的基类信息
     */
    private processEntryBaseClass(superClass: arkts.Expression, classNode: arkts.ClassDeclaration, intentObj: any): void {
        // 获取父类名称和泛型参数
        let parentClassName: string | undefined;
        let typeArguments: arkts.TypeNode[] = [];
        
        // 处理 ETSTypeReference（包含泛型参数）
        if (arkts.isETSTypeReference(superClass)) {
            const part = superClass.part;
            if (part && arkts.isETSTypeReferencePart(part)) {
                if (part.name && arkts.isIdentifier(part.name)) {
                    parentClassName = part.name.name;
                }
                // 获取泛型参数
                if (part.typeArguments) {
                    typeArguments = part.typeArguments;
                }
            }
        }
        // 处理简单的 Identifier
        else if (arkts.isIdentifier(superClass)) {
            parentClassName = superClass.name;
        }
        
        if (!parentClassName) {
            return;
        }
        
        // 验证是否继承自 InsightIntentEntryExecutor
        if (parentClassName !== 'InsightIntentEntryExecutor') {
            LogCollector.getInstance().collectLogInfo({
                node: classNode,
                type: LogType.ERROR,
                code: '10110018',
                message: 'Classes decorated with @InsightIntentEntry must inherit from InsightIntentEntryExecutor.'
            });
            return;
        }
        
        // 收集类继承信息
        this.collectClassInheritanceInfo(parentClassName, typeArguments, intentObj);
    }
    
    /**
     * 收集类继承信息，包括泛型参数
     */
    private collectClassInheritanceInfo(parentClassName: string, typeArguments: arkts.TypeNode[], intentObj: any): void {
        const ClassInheritanceInfo: any = {
            'parentClassName': parentClassName,
            'definitionFilePath': 'sdk', // 父类来自 SDK
            'generics': []
        };
        
        // 提取泛型参数
        for (const typeArg of typeArguments) {
            const generic = this.extractGenericInfo(typeArg, intentObj);
            if (generic) {
                ClassInheritanceInfo.generics.push(generic);
            }
        }
        
        intentObj.ClassInheritanceInfo = ClassInheritanceInfo;
    }
    
    /**
     * 提取泛型信息
     * @param typeNode 类型节点
     * @param intentObj intent 对象（可选，用于记录 entity 关联）
     */
    private extractGenericInfo(typeNode: arkts.TypeNode, intentObj?: any): any | null {
        let typeName: string | undefined;
        let definitionFilePath: string = 'lib.es5.d.ts'; // 默认路径
        
        // 处理 ETSTypeReference
        if (arkts.isETSTypeReference(typeNode)) {
            const part = typeNode.part;
            if (part && arkts.isETSTypeReferencePart(part)) {
                if (part.name && arkts.isIdentifier(part.name)) {
                    typeName = part.name.name;
                }
            }
        }
        // 处理 TypeReference（兼容）
        else if (arkts.isTypeReference(typeNode)) {
            if (arkts.isIdentifier(typeNode.typeName)) {
                typeName = typeNode.typeName.name;
            } else if (arkts.isQualifiedName(typeNode.typeName)) {
                // 处理限定名称，如 Namespace.Type
                typeName = typeNode.typeName.right.name;
            }
        } 
        // 处理 Identifier
        else if (arkts.isIdentifier(typeNode)) {
            typeName = typeNode.name;
        }
        
        // 处理基本类型
        const primitiveTypes = ['string', 'number', 'boolean'];
        if (typeName && primitiveTypes.includes(typeName.toLowerCase())) {
            return {
                'typeName': typeName,
                'definitionFilePath': 'lib.es5.d.ts'
            };
        }
        
        if (!typeName) {
            return null;
        }
        
        // 如果不是基本类型，可能是 Entity 类，记录到 entityOwnerMap
        if (intentObj && intentObj.intentName && typeName && 
            !primitiveTypes.includes(typeName.toLowerCase())) {
            this.collector.addEntityOwner(intentObj.intentName, typeName);
        }
        
        return {
            'typeName': typeName,
            'definitionFilePath': definitionFilePath
        };
    }
    
    /**
     * 提取 JSON 值
     * @param node 
     * @param classNode 
     * @returns 
     */
    private extractJsonValue(node: arkts.Expression, classNode?: arkts.ClassDeclaration): any {
        // 使用 arkts.getDecl() 获取变量值
        if (arkts.isIdentifier(node)) {
            const value = this.getVariableValueFromDecl(node);
            if (value !== undefined) {
                return value;
            }
            if (classNode) {
                LogCollector.getInstance().collectLogInfo({
                    node: classNode,
                    type: LogType.WARN,
                    code: '10110005',
                    message: `Unsupported parameters found in the decorator. Variable not found: ${node.name}`
                });
            }
            return undefined;
        }

        if (arkts.isStringLiteral(node)) {
            const strValue = node.str;
            
            // 判断是否可能是变量名
            const isLikelyVariable = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(strValue);
            
            if (isLikelyVariable) {
                // 1. 先检查缓存
                if (this.topLevelVariables.has(strValue)) {
                    return this.topLevelVariables.get(strValue);
                }
                
                // 2. 尝试从当前文件的 ETSGLOBAL 提取
                if (this.etsGlobalClass) {
                    const value = this.extractVariableFromETSGlobal(strValue);
                    if (value !== undefined) {
                        this.topLevelVariables.set(strValue, value);
                        return value;
                    }
                }
                
                // 3. 尝试从导入的变量中提取（跨文件）
                const importedValue = this.extractImportedVariable(strValue);
                if (importedValue !== undefined) {
                    this.topLevelVariables.set(strValue, importedValue);
                    return importedValue;
                }
            }
            
            // 如果不是变量名，返回字符串字面量本身
            return strValue;
        }

        if (arkts.isObjectExpression(node)) {
            return this.convertObjectExpressionToJson(node);
        }

        if (arkts.isArrayExpression(node)) {
            return this.convertArrayExpressionToJson(node);
        }

        if (classNode) {
            LogCollector.getInstance().collectLogInfo({
                node: classNode,
                type: LogType.WARN,
                code: '10110005',
                message: 'Unsupported parameters found in the decorator. Cannot extract JSON value, unknown node type'
            });
        }
        return undefined;
    }
    /**
     * 转换对象表达式为 JSON
     * @param node 
     * @returns 
     */
    private convertObjectExpressionToJson(node: arkts.ObjectExpression): any {
        const obj: any = {};
        for (const prop of node.properties) {
            if (!arkts.isProperty(prop) && !arkts.isClassProperty(prop)) continue;

            const key = prop.key;
            const value = prop.value;
            if (!key || !value) continue;

            let keyName: string | null = null;
            if (arkts.isIdentifier(key)) {
                keyName = key.name;
            } else if (arkts.isStringLiteral(key)) {
                keyName = key.str;
            }

            if (!keyName) continue;

            const jsonValue = this.convertExpressionToJsonValue(value);
            if (jsonValue !== undefined) {
                obj[keyName] = jsonValue;
            }
        }
        return obj;
    }

    /**
     * 转换数组表达式为 JSON
     * @param node 
     * @returns 
     */
    private convertArrayExpressionToJson(node: arkts.ArrayExpression): any[] {
        const arr: any[] = [];
        for (const element of node.elements) {
            arr.push(this.convertExpressionToJsonValue(element));
        }
        return arr;
    }

    /**
     * 转换表达式为 JSON 值
     * @param node 
     * @returns 
     */
    private convertExpressionToJsonValue(node: arkts.Expression): any {
        if (!node) {
            return undefined;
        }
        
        // 使用 arkts API 解包 TSAsExpression
        let actualNode: any = node;
        while (arkts.isTSAsExpression(actualNode)) {
            actualNode = actualNode.expr;
            if (!actualNode) break;
        }
        if (arkts.isMemberExpression(actualNode)) {
            if (arkts.isIdentifier (actualNode.property)) {
                return this.processEnumElement(actualNode)
            }
        }
        if (arkts.isStringLiteral(actualNode)) {
            return actualNode.str;
        }

        if (arkts.isNumberLiteral(actualNode)) {
            // 性能优化：减少 dumpSrc() 调用
            try {
                const srcValue = actualNode.dumpSrc();
                if (srcValue) {
                    const num = Number(srcValue);
                    if (!isNaN(num)) {
                        return num;
                    }
                }
            } catch (e) {
                // 忽略错误，使用 fallback
            }
            // Fallback: 使用 value 属性，处理 BigInt 类型
            const value = actualNode.value;
            if (typeof value === 'bigint') {
                // BigInt 转换为 Number（如果超出安全范围会损失精度）
                return Number(value);
            }
            return value;
        }

        if (arkts.isBooleanLiteral(actualNode)) {
            return actualNode.value;
        }

        if (arkts.isNullLiteral(actualNode)) {
            return null;
        }

        if (arkts.isObjectExpression(actualNode)) {
            return this.convertObjectExpressionToJson(actualNode);
        }

        if (arkts.isArrayExpression(actualNode)) {
            return this.convertArrayExpressionToJson(actualNode);
        }
        if (arkts.isIdentifier(actualNode)) {
            // 处理标识符类型，尝试获取变量值
            const value = this.getVariableValueFromDecl(actualNode);
            if (value !== undefined) {
                return value;
            }
            // 如果从缓存中获取失败，尝试直接从声明中获取
            const decl = arkts.getDecl(actualNode);
            if (decl && decl.parent && arkts.isVariableDeclarator(decl.parent) && decl.parent.init) {
                const initValue = this.extractValueFromExpression(decl.parent.init);
                if (initValue !== undefined) {
                    // 缓存值，避免重复解析
                    this.topLevelVariables.set(actualNode.name, initValue);
                    return initValue;
                }
            }
        }
        return undefined;
    }


    private normalizeFilePath(filePath: string): string {
        if (!filePath) {
            return '';
        }
        
        const cached = this.normalizedPathCache.get(filePath);
        if (cached !== undefined) {
            return cached;
        }

        const moduleName = this.projectConfig?.moduleName || 'entry';
        
        let relativePath = filePath;
        const srcIndex = filePath.indexOf('/src/');
        if (srcIndex !== -1) {
            relativePath = filePath.substring(srcIndex + 1);
        } else if (filePath.includes('\\')) {
            const srcIndexWin = filePath.indexOf('\\src\\');
            if (srcIndexWin !== -1) {
                relativePath = filePath.substring(srcIndexWin + 1).replace(/\\/g, '/');
            }
        }
        
        // 移除 .ets 后缀（与 parseUserIntents.ts 保持一致）
        if (relativePath.endsWith('.ets')) {
            relativePath = relativePath.substring(0, relativePath.length - 4);
        }

        const result = `@normalized:N&&&${moduleName}/${relativePath}&`;
        this.normalizedPathCache.set(filePath, result);
        
        return result;
    }
}

