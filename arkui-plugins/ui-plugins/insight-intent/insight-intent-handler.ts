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
import * as fs from 'fs';
import * as path from 'path';
import { ProjectConfig } from '../../common/plugin-context';
import {
    InsightIntentCollector,
    InsightIntentData,
    InsightIntentLinkData,
    InsightIntentFormData,
    InsightIntentDataBase,
    InsightIntentEntryData,
    InsightIntentEntityData
} from './insight-intent-collector';
import { LogCollector } from '../../common/log-collector';
import { LogType, ObservedNames } from '../../common/predefines';
import { ResourceSourceCache } from './resource-source-cache';
import Ajv, { ErrorObject } from 'ajv';
import { isEtsGlobalClass } from '../struct-translators/utils';

declare const __dirname: string;

const ajv = new Ajv({
    allErrors: true,
    strict: false,  // 允许未知关键字
    validateFormats: false,  // 暂不验证 format
    verbose: true  // 提供更详细的错误信息
});
// 装饰器常量
const INSIGHT_INTENT_LINK_DECORATOR = 'InsightIntentLink';
const INSIGHT_INTENT_FORM_DECORATOR = 'InsightIntentForm';
const INSIGHT_INTENT_FUNCTION_METHOD_DECORATOR = 'InsightIntentFunctionMethod';
const INSIGHT_INTENT_FUNCTION_DECORATOR = 'InsightIntentFunction';
const INSIGHT_INTENT_ENTITY_DECORATOR = 'InsightIntentEntity';
const INSIGHT_INTENT_ENTRY_DECORATOR = 'InsightIntentEntry';

interface DecoratorData {
    [key: string]: unknown;
}

interface SchemaVerifyType {
    type: string;
    isEntity: boolean;
}

interface FormExtensionAbilityInfo {
    name?: string;
    type?: string;
    srcEntry?: string;
    metadata?: Array<{ resource?: string }>;
}

function parseJson5LikeContent(content: string): unknown {
    const withoutBlockComments = content.replace(/\/\*[\s\S]*?\*\//g, '');
    const withoutLineComments = withoutBlockComments.replace(/(^|[^\\])\/\/.*$/gm, '$1');
    const withoutTrailingCommas = withoutLineComments.replace(/,\s*([}\]])/g, '$1');
    return JSON.parse(withoutTrailingCommas);
}

function normalizePathForCompare(filePath: string, pathModule: { normalize: (input: string) => string; resolve: (...paths: string[]) => string }): string {
    return pathModule.resolve(pathModule.normalize(filePath)).replace(/\\/g, '/').toLowerCase();
}
// 参数校验规则
const BASE_REQUIRED_FIELDS = ['intentName', 'domain', 'intentVersion', 'displayName'];
const DECORATOR_REQUIRED_FIELDS: Record<string, string[]> = {
    'Link': [...BASE_REQUIRED_FIELDS, 'uri'],
    'Form': BASE_REQUIRED_FIELDS,
    'Function': BASE_REQUIRED_FIELDS,
    'FunctionMethod': BASE_REQUIRED_FIELDS,
    'Entry': [...BASE_REQUIRED_FIELDS, 'abilityName', 'executeMode'],
};

function validateRequiredFields(data: InsightIntentDataBase, decoratorType: string, node: arkts.AstNode): boolean {
    const requiredFields = DECORATOR_REQUIRED_FIELDS[decoratorType] || [];
    
    for (const field of requiredFields) {
        const value = data[field];
        if (value === undefined || value === null) {
            LogCollector.getInstance().collectLogInfo({
                node: node,
                type: LogType.ERROR,
                code: '10110003',
                message: `Required parameters are missing for the decorator.`,
            });
            return false;
        }
        if (typeof value === 'string' && value.trim() === '') {
            LogCollector.getInstance().collectLogInfo({
                node: node,
                type: LogType.ERROR,
                code: '10110003',
                message: `Required parameters are missing for the decorator.`,
            });
            return false;
        }
        if (Array.isArray(value) && value.length === 0) {
            LogCollector.getInstance().collectLogInfo({
                node: node,
                type: LogType.ERROR,
                code: '10110003',
                message: `Required parameters are missing for the decorator.`,
            });
            return false;
        }
    }
    
    return true;
}
function validateExecuteMode(executeMode: number[] | undefined): boolean {
    if (!Array.isArray(executeMode) || executeMode.length === 0) {
        return false;
    }
    return executeMode.every(mode => [0, 1, 2, 3].includes(mode));
}
function validateKeywords(keywords: string[] | null | undefined, node: arkts.AstNode): boolean {
    if (!keywords) {
        return true;
    }
    
    if (!Array.isArray(keywords)) {
        LogCollector.getInstance().collectLogInfo({
            node: node,
            type: LogType.ERROR,
            code: '10110004',
            message: 'The parameter type does not match the decorator\'s requirement.'
        });
        return false;
    }
    const valid = keywords.every((keyword: string | null | undefined) => typeof keyword === 'string');
    if (!valid) {
        LogCollector.getInstance().collectLogInfo({
            node: node,
            type: LogType.ERROR,
            code: '10110004',
            message: 'The parameter type does not match the decorator\'s requirement.'
        });
    }
    return valid;
}

function validateSupportedQuery(
    paramterSchema: Record<string, unknown> | null | undefined,
    schema: string[],
    classNode: arkts.ClassDeclaration,
    consistencyValidator?: (
        schema: Record<string, unknown> | null | undefined,
        classNode: arkts.ClassDeclaration,
        isSupport: string[],
    ) => boolean
): boolean {
    if (!schema || !Array.isArray(schema) || schema.length === 0) {
        return true;
    }

    if (consistencyValidator) {
        return consistencyValidator(paramterSchema, classNode, schema);
    }
    return true;
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
function validateJsonSchema(schema: Record<string, unknown> | null | undefined, fieldName: string, node: arkts.AstNode): boolean {
    // 空值被视为有效（可选字段）
    if (!schema) {
        return true;
    }
    
    // 必须是对象类型
    if (typeof schema !== 'object' || Array.isArray(schema)) {
        LogCollector.getInstance().collectLogInfo({
            node: node,
            type: LogType.ERROR,
            code: '10110007',
            message: `The root type of the JSON Schema for Parameters must be object. ${fieldName}`
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
    } catch (compileError: unknown) {
        // 捕获 Ajv 编译错误并转换为 LogCollector 格式
        let errorMessage = 'Unknown error';
        if (compileError instanceof Error) {
            errorMessage = compileError.message;
        } else {
            errorMessage = String(compileError);
        }
        // 解析错误类型并报告适当的错误码
        if (errorMessage.includes('unknown keyword') || errorMessage.includes('strict mode')) {
            LogCollector.getInstance().collectLogInfo({
                node: node,
                type: LogType.ERROR,
                code: '10110005',
                message: `Unsupported parameters found in the decorator.`
            });
        } else if (errorMessage.includes('type') || errorMessage.includes('should be')) {
            LogCollector.getInstance().collectLogInfo({
                node: node,
                type: LogType.ERROR,
                code: '10110004',
                message: `The parameter type does not match the decorator\'s requirement.`
            });
        } else {
            LogCollector.getInstance().collectLogInfo({
                node: node,
                type: LogType.ERROR,
                code: '10110005',
                message: `Unsupported parameters found in the decorator.`
            });
        }
        return false;
    }
}
/**
 * 推断 JSON Schema 的类型验证类型
 * 
 * @param typeText - 类型文本
 * @returns 推断的 SchemaVerifyType 类型
 */
function inferSchemaVerifyTypeFromTypeText(typeText: string): SchemaVerifyType {
    // Normalize optional-property syntax like ": string" and "string?" before schema comparison.
    const normalizedType = typeText.replace(/\s+/g, '');
    const sanitizedType = normalizedType
        .replace(/^:/, '')
        .replace(/^\?:/, '')
        .replace(/\?$/g, '')
        .replace(/;$/g, '');
    const unwrappedType = sanitizedType.startsWith('(') && sanitizedType.endsWith(')')
        ? sanitizedType.slice(1, -1)
        : sanitizedType;
    const unionTypes = unwrappedType
        .split('|')
        .map((item) => item.replace(/^\(+|\)+$/g, ''))
        .filter((item) => item && item !== 'undefined' && item !== 'null');

    const simplifiedType = unionTypes.length === 1 ? unionTypes[0] : unwrappedType;
    if (simplifiedType === 'string' || /^(['"]).*\1$/.test(simplifiedType)) {
        return { type: 'string', isEntity: false };
    }
    if (['number', 'int', 'float', 'double', 'Int', 'Float', 'Double'].includes(simplifiedType) ||
        /^-?\d+(\.\d+)?$/.test(simplifiedType)) {
        return { type: 'number', isEntity: false };
    }
    if (simplifiedType === 'boolean' || simplifiedType === 'true' || simplifiedType === 'false') {
        return { type: 'boolean', isEntity: false };
    }

    const arrayMatch = simplifiedType.match(/^(?:ReadonlyArray|Array)<(.+)>$/) ||
        simplifiedType.match(/^\((.+)\)\[\]$/) ||
        simplifiedType.match(/^(.+)\[\]$/);
    if (arrayMatch) {
        const elementType = inferSchemaVerifyTypeFromTypeText(arrayMatch[1]);
        if (elementType.type === 'string' || elementType.type === 'number' || elementType.type === 'boolean') {
            return { type: '', isEntity: false };
        }
        return { type: 'array', isEntity: true };
    }

    if (simplifiedType === 'object' || simplifiedType === 'Object' ||
        simplifiedType.startsWith('{') || simplifiedType.startsWith('Record<') ||
        simplifiedType.startsWith('Map<')) {
        return { type: 'object', isEntity: false };
    }

    return { type: 'object', isEntity: true };
}

function inferSchemaVerifyTypeFromExpression(expr: arkts.Expression | undefined): SchemaVerifyType {
    if (!expr) {
        return { type: '', isEntity: false };
    }

    if (arkts.isStringLiteral(expr)) {
        return { type: 'string', isEntity: false };
    }
    if (arkts.isNumberLiteral(expr)) {
        return { type: 'number', isEntity: false };
    }
    if (arkts.isBooleanLiteral(expr)) {
        return { type: 'boolean', isEntity: false };
    }
    if (arkts.isObjectExpression(expr)) {
        return { type: 'object', isEntity: false };
    }
    if (arkts.isArrayExpression(expr)) {
        return { type: '', isEntity: false };
    }

    return { type: '', isEntity: false };
}
function getClassVisitKey(classNode: arkts.ClassDeclaration): string {
    const program = arkts.getProgramFromAstNode(classNode);
    const className = classNode.definition?.ident?.name || 'UnknownClass';
    return `${program?.absName || ''}#${className}`;
}

function findEnclosingClassDeclaration(node: arkts.AstNode | null | undefined): arkts.ClassDeclaration | null {
    let currentNode = node;
    while (currentNode) {
        if (arkts.isClassDeclaration(currentNode)) {
            return currentNode;
        }
        currentNode = currentNode.parent;
    }
    return null;
}

function extractIdentifierFromTypeReferenceName(typeName: arkts.AstNode | undefined): arkts.Identifier | undefined {
    if (!typeName) {
        return undefined;
    }

    if (arkts.isIdentifier(typeName)) {
        return typeName;
    }

    if (arkts.isTSQualifiedName(typeName) && typeName.right && arkts.isIdentifier(typeName.right)) {
        return typeName.right;
    }

    return undefined;
}

function extractTypeNameFromExpression(typeExpr: arkts.Expression | undefined): string | undefined {
    if (!typeExpr) {
        return undefined;
    }

    if (arkts.isETSTypeReference(typeExpr)) {
        const part = typeExpr.part;
        const identifier = part && arkts.isETSTypeReferencePart(part)
            ? extractIdentifierFromTypeReferenceName(part.name)
            : undefined;
        return identifier?.name;
    }

    if (arkts.isIdentifier(typeExpr)) {
        return typeExpr.name;
    }

    return undefined;
}

function extractQualifiedTypeName(typeName: arkts.ETSTypeReferencePart['name'] | arkts.Identifier | undefined): string | undefined {
    if (!typeName) {
        return undefined;
    }

    if (arkts.isIdentifier(typeName)) {
        return typeName.name;
    }

    if (arkts.isTSQualifiedName(typeName)) {
        const left = extractQualifiedTypeName(typeName.left);
        const right = arkts.isIdentifier(typeName.right) ? typeName.right.name : undefined;
        if (!left) {
            return right;
        }
        if (!right) {
            return left;
        }
        return `${left}.${right}`;
    }

    return undefined;
}

function extractQualifiedTypeNameFromExpression(typeExpr: arkts.Expression | undefined): string | undefined {
    if (!typeExpr) {
        return undefined;
    }

    if (arkts.isETSTypeReference(typeExpr)) {
        const part = typeExpr.part;
        return part && arkts.isETSTypeReferencePart(part)
            ? extractQualifiedTypeName(part.name)
            : undefined;
    }

    if (arkts.isIdentifier(typeExpr)) {
        return typeExpr.name;
    }

    return undefined;
}

function extractTypeIdentifierFromExpression(typeExpr: arkts.Expression | undefined): arkts.Identifier | undefined {
    if (!typeExpr) {
        return undefined;
    }

    if (arkts.isETSTypeReference(typeExpr)) {
        const part = typeExpr.part;
        return part && arkts.isETSTypeReferencePart(part)
            ? extractIdentifierFromTypeReferenceName(part.name)
            : undefined;
    }

    if (arkts.isIdentifier(typeExpr)) {
        return typeExpr;
    }

    return undefined;
}

function extractImplementedTypeNames(classNode: arkts.ClassDeclaration): string[] {
    const implementedTypes = classNode.definition?.implements || [];
    return implementedTypes
        .map((implementedType: { expr?: arkts.Expression }) => extractTypeNameFromExpression(implementedType.expr))
        .filter((name: string | undefined): name is string => !!name);
}

function resolveExtendedClassDeclaration(classNode: arkts.ClassDeclaration): arkts.ClassDeclaration | null {
    const superIdentifier = extractTypeIdentifierFromExpression(classNode.definition?.super);
    if (!superIdentifier) {
        return null;
    }

    const declaration = arkts.getDecl(superIdentifier);
    if (!declaration) {
        return null;
    }

    return findEnclosingClassDeclaration(declaration);
}

function collectClassSchemaDataFromClass(
    classNode: arkts.ClassDeclaration,
    excludedPropertyNames: Set<string>,
    schemaData: Record<string, SchemaVerifyType>,
    visited: Set<string>
): void {
    const classKey = getClassVisitKey(classNode);
    if (visited.has(classKey)) {
        return;
    }
    visited.add(classKey);

    const parentClassNode = resolveExtendedClassDeclaration(classNode);
    if (parentClassNode) {
        collectClassSchemaDataFromClass(parentClassNode, excludedPropertyNames, schemaData, visited);
    }

    const classMembers = classNode.definition?.body || [];
    for (const member of classMembers) {
        if (arkts.isMethodDefinition(member)) {
            const isConstructorMethod =
                member.kind === arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_CONSTRUCTOR;
            if (isConstructorMethod || member.isStatic || !member.name || !arkts.isIdentifier(member.name)) {
                continue;
            }
            if (!excludedPropertyNames.has(member.name.name)) {
                schemaData[member.name.name] = { type: '', isEntity: false };
            }
            continue;
        }

        if (!arkts.isClassProperty(member) || !member.key || !arkts.isIdentifier(member.key)) {
            continue;
        }
        if (excludedPropertyNames.has(member.key.name) || (member as { isStatic?: boolean }).isStatic) {
            continue;
        }

        const typeAnnotation = member.typeAnnotation;
        schemaData[member.key.name] = typeAnnotation
            ? inferSchemaVerifyTypeFromTypeText(typeAnnotation.dumpSrc())
            : inferSchemaVerifyTypeFromExpression(member.value);
    }
}

function collectClassSchemaData(
    classNode: arkts.ClassDeclaration,
    excludedPropertyNames: string[] = []
): Record<string, SchemaVerifyType> {
    const schemaData: Record<string, SchemaVerifyType> = {};
    collectClassSchemaDataFromClass(classNode, new Set(excludedPropertyNames), schemaData, new Set<string>());
    return schemaData;
}
/**
 * 收集表单意图的 JSON Schema 数据
 * 
 * @param classNode - AST 节点，用于错误定位
 * @returns 收集的 JSON Schema 数据
 */
function collectFormSchemaData(classNode: arkts.ClassDeclaration): Record<string, SchemaVerifyType> {
    return collectClassSchemaData(classNode, ['context']);
}

function collectEntitySchemaData(classNode: arkts.ClassDeclaration): Record<string, SchemaVerifyType> {
    return collectClassSchemaData(classNode);
}
function collectEntrySchemaData(classNode: arkts.ClassDeclaration): Record<string, SchemaVerifyType> {
    return collectClassSchemaData(classNode, ['context']);
}

function validateSchemaConsistency(
    schema: Record<string, unknown> | null | undefined,
    classNode: arkts.ClassDeclaration,
    collectSchemaData: (classNode: arkts.ClassDeclaration) => Record<string, SchemaVerifyType>,
    supportedQueryProperties?:string[]
): boolean {
    if (!schema || typeof schema !== 'object' || Array.isArray(schema)) {
        return true;
    }

    const schemaData = collectSchemaData(classNode);
    if (schema.additionalProperties === false &&
        !validateSchemaAdditionalPropertiesRule(schemaData, schema.properties, classNode)) {
        return false;
    }
    if (!validateSchemaPropertiesRule(schemaData, schema, classNode)) {
        return false;
    }
    if(supportedQueryProperties && supportedQueryProperties?.length !== 0){ 
        if (!validateSupportedQueryProperties(schemaData, schema, supportedQueryProperties, classNode)) {
            return false;
        }
    }
    if (!validateSchemaRequiredClassProperties(schemaData, schema, classNode)) {
        return false;
    }
    return validateSchemaCombinationRules(schemaData, schema, classNode);
}
/**
 * 校验 entity意图的 SupportedQueryProperties
*/
function validateSupportedQueryProperties(
    schemaData: Record<string, SchemaVerifyType>,
    schema: Record<string, unknown> | null | undefined,
    supportedValue: string[],
    node: arkts.AstNode
): boolean {
    if (!schema || typeof schema !== 'object' || Array.isArray(schema)) {
        return true;
    }
    const properties = schema.properties;
    if (!Array.isArray(supportedValue) || !properties || typeof properties !== 'object' || Array.isArray(properties)) {
        return true;
    }
    // 验证 supportedValue 中的字段是否都在 properties 中定义
    const propertyKeys = new Set(Object.keys(properties));
    for (const field of supportedValue) {
        if (typeof field === 'string' && !propertyKeys.has(field)) {
            LogCollector.getInstance().collectLogInfo({
                node: node,
                type: LogType.ERROR,
                code: '10110003',
                message: `The supportedQueryProperties field '${field}' is not defined in properties.`
            });
            return false;
        }
    }
    const supportedQueryPropertiesFieldSet = new Set(
        supportedValue.filter((field): field is string => typeof field === 'string')
    );
    if (supportedQueryPropertiesFieldSet.size === 0) {
        return true;
    }

    for (const key of Object.keys(properties)) {
        if (supportedQueryPropertiesFieldSet.has(key) && !schemaData[key]) {
            LogCollector.getInstance().collectLogInfo({
                node: node,
                type: LogType.ERROR,
                code: '10110003',
                message: `The field '${key}' in supportedQueryProperties is not a property of the class.`
            });
            return false;
        }
    }

    return true;
}
/**
 * 验证 JSON Schema 的必填属性一致性
 * 
 * @param schemaData - 收集的 JSON Schema 数据
 * @param schema - 要验证的 JSON Schema 对象
 * @param node - AST 节点，用于错误定位
 * @returns 如果必填属性验证通过返回 true，否则返回 false
 */
function validateSchemaRequiredClassProperties(
    schemaData: Record<string, SchemaVerifyType>,
    schema: Record<string, unknown> | null | undefined,
    node: arkts.AstNode
): boolean {
    if (!schema || typeof schema !== 'object' || Array.isArray(schema)) {
        return true;
    }

    const required = schema.required;
    const properties = schema.properties;
    if (!Array.isArray(required) || !properties || typeof properties !== 'object' || Array.isArray(properties)) {
        return true;
    }

    const requiredFieldSet = new Set(
        required.filter((field): field is string => typeof field === 'string')
    );
    if (requiredFieldSet.size === 0) {
        return true;
    }

    for (const key of Object.keys(properties)) {
        if (requiredFieldSet.has(key) && !schemaData[key]) {
            LogCollector.getInstance().collectLogInfo({
                node: node,
                type: LogType.ERROR,
                code: '10110008',
                message: 'A required field in the class property is missing.'
            });
            return false;
        }
    }

    return true;
}
/**
 * 验证 JSON Schema 的属性一致性
 * 
 * @param schemaData - 收集的 JSON Schema 数据
 * @param schema - 要验证的 JSON Schema 对象
 * @param node - AST 节点，用于错误定位
 * @returns 如果属性验证通过返回 true，否则返回 false
 */
function validateSchemaPropertiesRule(
    schemaData: Record<string, SchemaVerifyType>,
    schema: Record<string, unknown> | null | undefined,
    node: arkts.AstNode
): boolean {
    if (!schema || typeof schema !== 'object' || Array.isArray(schema)) {
        return true;
    }

    const properties = schema.properties;
    if (!properties || typeof properties !== 'object' || Array.isArray(properties)) {
        return true;
    }

    for (const [key, rawValue] of Object.entries(properties)) {
        if (!rawValue || typeof rawValue !== 'object' || Array.isArray(rawValue)) {
            continue;
        }

        const schemaProperty = rawValue as { type?: unknown };
        if ((schemaData[key]?.type && schemaProperty.type !== schemaData[key].type) ||
            (schemaProperty.type === 'object' && schemaData[key]?.isEntity === false)) {
            LogCollector.getInstance().collectLogInfo({
                node: node,
                type: LogType.ERROR,
                code: '10110009',
                message: 'The field type of the class property does not match the JSON Schema.'
            });
            return false;
        }
    }

    return true;
}
/**
 * 验证 JSON Schema 的额外属性一致性
 * 
 * @param schemaData - 收集的 JSON Schema 数据
 * @param schemaProps - 要验证的 JSON Schema 对象的属性
 * @param node - AST 节点，用于错误定位
 * @returns 如果额外属性验证通过返回 true，否则返回 false
 */
function validateSchemaAdditionalPropertiesRule(
    schemaData: Record<string, SchemaVerifyType>,
    schemaProps: unknown,
    node: arkts.AstNode
): boolean {
    if (!schemaProps || typeof schemaProps !== 'object' || Array.isArray(schemaProps)) {
        return true;
    }

    const allowedProperties = schemaProps as Record<string, unknown>;
    for (const key of Object.keys(schemaData)) {
        if (!allowedProperties[key]) {
            LogCollector.getInstance().collectLogInfo({
                node: node,
                type: LogType.ERROR,
                code: '10110011',
                message: 'The class property includes parameters not defined in the JSON Schema.'
            });
            return false;
        }
    }

    return true;
}
/**
 * 验证 JSON Schema 的组合规则一致性
 * 
 * @param schemaData - 收集的 JSON Schema 数据
 * @param schema - 要验证的 JSON Schema 对象
 * @param node - AST 节点，用于错误定位
 * @returns 如果组合规则验证通过返回 true，否则返回 false
 */
function validateSchemaCombinationRules(
    schemaData: Record<string, SchemaVerifyType>,
    schema: Record<string, unknown> | null | undefined,
    node: arkts.AstNode
): boolean {
    if (!schema || typeof schema !== 'object' || Array.isArray(schema)) {
        return true;
    }

    const schemaKeys = Object.keys(schemaData);
    const validateRequiredGroups = (groups: unknown, allowZeroMatch: boolean): boolean => {
        if (!Array.isArray(groups)) {
            return true;
        }

        let count = 0;
        for (const group of groups) {
            if (!group || typeof group !== 'object' || Array.isArray(group)) {
                continue;
            }
            const required = (group as { required?: unknown }).required;
            if (!Array.isArray(required)) {
                continue;
            }

            const isContained = required.every((item) => typeof item === 'string' && schemaKeys.includes(item));
            if (isContained) {
                count++;
            }
        }

        const isValid = allowZeroMatch ? count > 0 : count === 1;
        if (!isValid) {
            LogCollector.getInstance().collectLogInfo({
                node: node,
                type: LogType.ERROR,
                code: '10110010',
                message: 'The class property parameter violates the oneOf/anyOf validation rules in the JSON Schema.'
            });
        }
        return isValid;
    };

    return validateRequiredGroups(schema.oneOf, false) && validateRequiredGroups(schema.anyOf, true);
}
/**
 * 验证表单意图的 JSON Schema 一致性
 * 
 * @param schema - 要验证的 JSON Schema 对象
 * @param classNode - AST 节点，用于错误定位
 * @returns 如果 schema 为空或验证通过返回 true，否则返回 false
 */
function validateFormSchemaConsistency(
    schema: Record<string, unknown> | null | undefined,
    classNode: arkts.ClassDeclaration
): boolean {
    return validateSchemaConsistency(schema, classNode, collectFormSchemaData);
}

function validateEntitySchemaConsistency(
    schema: Record<string, unknown> | null | undefined,
    classNode: arkts.ClassDeclaration,
    supportedQueryProperties?:string[]
): boolean {
    return validateSchemaConsistency(schema, classNode, collectEntitySchemaData, supportedQueryProperties);
}

function validateEntrySchemaConsistency(
    schema: Record<string, unknown> | null | undefined,
    classNode: arkts.ClassDeclaration
): boolean {
    return validateSchemaConsistency(schema, classNode, collectEntrySchemaData);
}
function validateParametersSchemaRootType(
    schema: Record<string, unknown> | null | undefined,
    node: arkts.AstNode,
    schemaFieldName: string = 'Parameters'
): boolean {
    if (!schema || typeof schema !== 'object' || Array.isArray(schema) || Object.keys(schema).length === 0) {
        return true;
    }
    if (schema.type !== 'object') {
        LogCollector.getInstance().collectLogInfo({
            node,
            type: LogType.ERROR,
            code: '10110007',
            message: `The root type of the JSON Schema for ${schemaFieldName} must be object.`
        });
        return false;
    }

    return true;
}

function validateParametersSchema(
    schema: Record<string, unknown> | null | undefined,
    classNode: arkts.ClassDeclaration,
    consistencyValidator?: (
        schema: Record<string, unknown> | null | undefined,
        classNode: arkts.ClassDeclaration
    ) => boolean
): boolean {
    const isJsonSchemaValid = validateJsonSchema(schema, 'parameters', classNode);
    const isRootTypeValid = validateParametersSchemaRootType(schema, classNode);

    if (!isJsonSchemaValid || !isRootTypeValid) {
        return false;
    }

    if (consistencyValidator) {
        return consistencyValidator(schema, classNode);
    }

    return true;
}

function validateResultSchema(
    schema: Record<string, unknown> | null | undefined,
    classNode: arkts.ClassDeclaration
): boolean {
    return validateJsonSchema(schema, 'result', classNode);
}

function validateParamMappings(paramMappings: Record<string, unknown> | null | undefined | string, node: arkts.AstNode): boolean {
    if (!paramMappings) {
        return true;
    }
    
    if (!Array.isArray(paramMappings)) {
        LogCollector.getInstance().collectLogInfo({
            node: node,
            type: LogType.ERROR,
            code: '10110004',
            message: `The parameter type does not match the decorator\'s requirement.`
        });
        return false;
    }
    
    for (const mapping of paramMappings) {
        if (!mapping || typeof mapping !== 'object') {
            LogCollector.getInstance().collectLogInfo({
                node: node,
                type: LogType.ERROR,
                code: '10110004',
                message: `The parameter type does not match the decorator\'s requirement.`
            });
            return false;
        }
        if (!mapping.paramName || typeof mapping.paramName !== 'string') {
            LogCollector.getInstance().collectLogInfo({
                node: node,
                type: LogType.ERROR,
                code: '10110003',
                message: `Required parameters are missing for the decorator.`,
            });
            return false;
        }
        if (mapping.paramCategory && !['link', 'want'].includes(mapping.paramCategory.toLowerCase())) {
            LogCollector.getInstance().collectLogInfo({
                node: node,
                type: LogType.ERROR,
                code: '10110004',
                message: `The parameter type does not match the decorator\'s requirement.`
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
    private intentNameSet = new Set<string>();
    private projectConfig: ProjectConfig;
    private collector: InsightIntentCollector;
    private currentDecoratorFile = '';
    
    // 性能优化：路径规范化缓存
    private normalizedPathCache: Map<string, string> = new Map();
    
    // 性能优化：装饰器处理器映射表
    private readonly decoratorHandlers: Map<string, (anno: arkts.Decorator, node: arkts.AstNode) => InsightIntentData | null>;
    
    // 缓存当前文件的变量（从ETSGLOBAL类成员中按需提取）
    private topLevelVariables: Map<string, unknown> = new Map();
    
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
    
    // 用于跟踪已添加的 intentName，确保唯一性（全局）
    private intentNames: Set<string> = new Set();

    constructor(projectConfig: ProjectConfig) {
        this.projectConfig = projectConfig;
        this.collector = InsightIntentCollector.getInstance();
        
        // 初始化装饰器处理器映射表
        this.decoratorHandlers = new Map([
            [INSIGHT_INTENT_LINK_DECORATOR, this.extractLinkIntentData.bind(this)],
            [INSIGHT_INTENT_FORM_DECORATOR, this.extractFormIntentData.bind(this)],
            [INSIGHT_INTENT_ENTITY_DECORATOR, this.extractEntityIntentData.bind(this)],
            [INSIGHT_INTENT_ENTRY_DECORATOR, this.extractEntryIntentData.bind(this)],
        ]);
    }
        /**
     * 加载现有的 insight_intent.json 文件中的 intentName
     */
    private loadExistingIntentNames(): void {
        const projectConfig = this.projectConfig;
        const moduleRootPath = projectConfig.moduleRootPath
        if (!fs.existsSync(moduleRootPath)) {
            fs.mkdirSync(moduleRootPath, { recursive: true });
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
        if (!projectConfig.aceProfilePath) {
            if (moduleRootPath) {
                projectConfig.aceProfilePath = path.join(moduleRootPath, ...pathSegments);
            } else {
                return;
            }
        }
        
        try {
            const insightIntentPath = path.join(projectConfig.aceProfilePath, 'insight_intent.json');
            const insightIntentCachePath = projectConfig.cachePath ?
                path.join(projectConfig.cachePath, 'insight_compile_cache.json') : '';
            
            const loadIntentNames = (intents: InsightIntentDataBase[] | undefined): void => {
                if (!Array.isArray(intents)) {
                    return;
                }
                intents.forEach((intent: InsightIntentDataBase) => {
                    if (!intent.intentName) {
                        return;
                    }
                    if (this.currentDecoratorFile && intent.decoratorFile === this.currentDecoratorFile) {
                        return;
                    }
                    this.intentNames.add(intent.intentName);
                });
            };

            if (insightIntentCachePath && fs.existsSync(insightIntentCachePath)) {
                const cacheContent = fs.readFileSync(insightIntentCachePath, 'utf-8');
                const cacheConfig = JSON.parse(cacheContent);
                loadIntentNames(cacheConfig.extractInsightIntents);
            }

            if (fs.existsSync(insightIntentPath)) {
                const content = fs.readFileSync(insightIntentPath, 'utf-8');
                const config = JSON.parse(content);
                loadIntentNames(config.insightIntents);
            }
        } catch (error) {
            // 忽略文件读取或解析错误
        }
    }

    private prepareCurrentFile(program: arkts.Program): void {
        this.intentNames.clear();
        this.currentDecoratorFile = this.normalizeFilePath(program.absName || '');
        if (this.currentDecoratorFile) {
            this.collector.markSourceFileTouched(this.currentDecoratorFile);
        }
        this.loadExistingIntentNames();
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
        this.intentNames.clear();
        this.currentDecoratorFile = '';
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

        this.prepareCurrentFile(program);
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
            LogCollector.getInstance().collectLogInfo({
                node: actualNode,
                type: LogType.ERROR,
                code: '10110005',
                message: `Unsupported parameters found in the decorator.`
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
    private extractValueFromExpression(expr: arkts.Expression): unknown {
        // 使用 arkts API 解包 TSAsExpression
        let actualExpr: arkts.Expression | undefined = expr;
        while (arkts.isTSAsExpression(actualExpr)) {
            actualExpr = actualExpr.expr;
            if (!actualExpr) {
                break;
            }
        }
        
        if (arkts.isObjectExpression(actualExpr)) {
            return this.convertObjectToJson(actualExpr);
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
            return;
        }
        // 遍历所有注解
        for (const anno of annotations) {
            if (!anno.expr || !arkts.isIdentifier(anno.expr)) {
                continue;
            }

            const decoratorName = anno.expr.name;
            const handler = this.decoratorHandlers.get(decoratorName);
            if (!handler) {
                continue;
            }

            try {
                const intentData = handler(anno, classNode);
                if (intentData) {
                    // 检查 intentName 唯一性
                    if ('intentName' in intentData && intentData.intentName) {
                        if (this.intentNames.has(intentData.intentName)) {
                            LogCollector.getInstance().collectLogInfo({
                                node: classNode,
                                type: LogType.ERROR,
                                code: '10110012',
                                message: `Duplicate intentName definitions found: ${intentData.intentName}`
                            });
                            continue;
                        }
                        this.intentNames.add(intentData.intentName);
                    }
                    this.collector.addIntent(intentData);
                }
            } catch (error) {
                LogCollector.getInstance().collectLogInfo({
                    node: classNode,
                    type: LogType.ERROR,
                    code: '10110005',
                    message: `Unsupported parameters found in the decorator.`
                });
            }
        }
    }
        /**
     * 处理方法级别的装饰器（如 @InsightIntentFunctionMethod）
     */
    private processMethodAnnotations(body: readonly arkts.AstNode[], classNode: arkts.ClassDeclaration): void {
        for (const member of body) {
            // 获取当前成员的装饰器列表
            // 注意：不同成员类型的装饰器存放位置可能不同，这里主要关注 MethodDefinition 和 ClassProperty
            let annotations: readonly arkts.AnnotationUsage[] | undefined = [];
            let isMethod = false;
            let methodDef: arkts.MethodDefinition | null = null;

            if (arkts.isMethodDefinition(member)) {
                isMethod = true;
                methodDef = member;
                annotations = member.scriptFunction?.annotations;
            } else if (arkts.isClassProperty(member)) {
                // 检查属性上的装饰器
                annotations = member.annotations;
            } 
            // 可以根据需要添加对其他成员类型(如 Accessor)的检查
            if (!annotations || annotations.length === 0) {
                continue;
            }
            // 检查是否包含目标装饰器
            let hasTargetDecorator = false;
            for (const anno of annotations) {
                if (anno.expr && arkts.isIdentifier(anno.expr) && anno.expr.name === INSIGHT_INTENT_FUNCTION_METHOD_DECORATOR) {
                    hasTargetDecorator = true;
                    break;
                }
            }
            // 如果包含 @InsightIntentFunctionMethod 但不是方法定义，抛错
            if (hasTargetDecorator && !isMethod) {
                LogCollector.getInstance().collectLogInfo({
                    node: member,
                    type: LogType.ERROR,
                    code: '10110015', 
                    message: 'Methods decorated with @InsightIntentFunctionMethod must be static methods.'
                });
                continue;
            }
            if (!hasTargetDecorator) {
                continue;
            }
            if (methodDef) {
                 for (const anno of annotations) {
                    if (!anno.expr || !arkts.isIdentifier(anno.expr)) {
                        continue;
                    }
                    const decoratorName = anno.expr.name;
                    if (decoratorName !== INSIGHT_INTENT_FUNCTION_METHOD_DECORATOR) {
                        continue;
                    }
                    try {
                        const intentData = this.extractFunctionMethodIntentDataFromMethod(anno, methodDef, classNode);
                        if (intentData) {
                            // 检查 intentName 唯一性
                            if ('intentName' in intentData && intentData.intentName) {
                                if (this.intentNames.has(intentData.intentName)) {
                                    LogCollector.getInstance().collectLogInfo({
                                        node: classNode,
                                        type: LogType.ERROR,
                                        code: '10110012',
                                        message: `Duplicate intentName definitions found: ${intentData.intentName}`
                                    });
                                    continue;
                                }
                                this.intentNames.add(intentData.intentName);
                            }
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
    private getVariableValueFromDecl(identifier: arkts.Identifier): unknown {
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
    private extractVariableFromETSGlobal(varName: string): unknown {
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
    private extractImportedVariable(varName: string): unknown {
        
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
    private extractValueFromDeclaration(decl: arkts.AstNode): unknown {
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
    private extractValueFromDeclarator(declarator: arkts.VariableDeclarator): unknown {
        const init = declarator.initializer;
        
        if (!init) {
            return undefined;
        }
        
        if (arkts.isObjectExpression(init)) {
            return this.convertObjectToJson(init);
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
        if (!baseData) {
            return null;
        }
        const data: InsightIntentLinkData = { ...baseData, uri: '' };
        const properties = annotation.properties;
        for (const prop of properties) {
            if (!arkts.isClassProperty(prop) || !arkts.isIdentifier(prop.key)) {
                continue
            };
            const propName = prop.key.name;
            const propValue = prop.value;
            if (!propValue)  {
                continue
            };
            if (propName === 'uri') {
                // uri 是必填字段，直接赋值
                data.uri = propValue.str;
            } else if (propName === 'paramMappings') { 
                // paramMappings 是非必填字段，空值不写入 
                const paramMappings = this.extractJsonValue(propValue, classNode) as InsightIntentLinkData['paramMappings']; 
                if (this.isValidOptionalValue(paramMappings, classNode, '@InsightIntentLink')) { 
                    data.paramMappings = paramMappings; 
                }
                if (data.paramMappings === '') {
                    delete data.paramMappings;
                }
            }
        }
        if (!validateRequiredFields(data, 'Link', classNode) || 
            (data.paramMappings && !validateParamMappings(data.paramMappings, classNode)) ||
            (data.keywords && !validateKeywords(data.keywords, classNode)) ||
            (data.parameters && !validateJsonSchema(data.parameters, 'parameters', classNode)) ||
            (data.result && !validateResultSchema(data.result, classNode))) {
            return null;
        }
        return data;
    }
    private extractFormIntentData(annotation: arkts.AnnotationUsage, classNode: arkts.ClassDeclaration): InsightIntentData | null {
        const baseData = this.extractBaseIntentData(annotation, classNode, '@InsightIntentForm');
        if (!baseData) {
            return null;
        }

        const data: InsightIntentFormData = { ...baseData, formName: '' };
        const properties = annotation.properties;
        for (const prop of properties) {
            if (!arkts.isClassProperty(prop) || !arkts.isIdentifier(prop.key)) {
                continue;
            }
            const propName = prop.key.name;
            const propValue = prop.value;
            if (!propValue) {
                continue;
            }

            if (propName === 'formName') {
                data.formName = this.extractStringValue(propValue, classNode) as string;
            }
        }

        if (!validateRequiredFields(data, 'Form', classNode) ||
            !this.validateFormExtensionAbility(data, classNode) ||
            (data.keywords && !validateKeywords(data.keywords, classNode)) ||
            (data.parameters && !validateParametersSchema(data.parameters, classNode, validateFormSchemaConsistency)) ||
            (data.result && !validateResultSchema(data.result, classNode))) {
            return null;
        }

        this.collectEntityOwnersFromClassProperties(classNode, data, new Set(['context']));

        return data;
    }

    private validateFormExtensionAbility(data: InsightIntentFormData, classNode: arkts.ClassDeclaration): boolean {
        const bindFormInfo = this.resolveFormExtensionAbility(classNode);
        if (bindFormInfo === undefined) {
            return false;
        }
        const isExported = !!classNode.definition?.isExport || !!classNode.definition?.isDefaultExport;
        const isDefaultExport = !!classNode.definition?.isDefaultExport;
        if (!bindFormInfo || !isExported || !isDefaultExport) {
            LogCollector.getInstance().collectLogInfo({
                node: classNode,
                type: LogType.ERROR,
                code: '10110022',
                message: '@InsightIntentForm must be applied to formExtensionAbility.',
            });
            return false;
        }

        data.abilityName = bindFormInfo.name;
        return this.validateFormName(data.formName, bindFormInfo, classNode);
    }

    private resolveFormExtensionAbility(classNode: arkts.ClassDeclaration): FormExtensionAbilityInfo | null | undefined {
        const projectConfig = this.projectConfig as ProjectConfig & { aceModuleJsonPath?: string };
        const moduleJsonPath = projectConfig.aceModuleJsonPath ||
            path.join(projectConfig.moduleRootPath, 'src', 'main', 'module.json5');

        if (!fs.existsSync(moduleJsonPath)) {
            LogCollector.getInstance().collectLogInfo({
                node: classNode,
                type: LogType.ERROR,
                code: '10110024',
                message: 'The module.json5 file is missing.'
            });
            return undefined;
        }

        try {
            const moduleJson = parseJson5LikeContent(fs.readFileSync(moduleJsonPath, 'utf-8')) as {
                module?: { extensionAbilities?: FormExtensionAbilityInfo[] };
            };
            const extensionAbilities = Array.isArray(moduleJson?.module?.extensionAbilities)
                ? moduleJson.module.extensionAbilities
                : [];
            const program = arkts.getProgramFromAstNode(classNode);
            const currentFilePath = normalizePathForCompare(program?.absName || '', path);
            const currentClassName = classNode.definition?.ident?.name || '';
            const matchedByPath = extensionAbilities.find((extensionInfo: FormExtensionAbilityInfo) => {
                if (!extensionInfo || extensionInfo.type !== 'form' || !extensionInfo.srcEntry) {
                    return false;
                }
                const formSrcEntryPath = normalizePathForCompare(
                    path.join(projectConfig.moduleRootPath, 'src', 'main', extensionInfo.srcEntry)
                    , path
                );
                return formSrcEntryPath === currentFilePath;
            });
            if (matchedByPath) {
                return matchedByPath;
            }

            return extensionAbilities.find((extensionInfo: FormExtensionAbilityInfo) =>
                extensionInfo?.type === 'form' && extensionInfo.name === currentClassName
            ) || null;

        } catch {
            return null;
        }
    }
    private extractEntryIntentData(annotation: arkts.AnnotationUsage, classNode: arkts.ClassDeclaration): InsightIntentData | null {
        const baseData = this.extractBaseIntentData(annotation, classNode, '@InsightIntentEntry');
        if (!baseData) {
            return null;
        }
        const data: InsightIntentEntryData = { ...baseData, abilityName:'', executeMode:[]};
        const properties = annotation.properties;
        
        for (const prop of properties) {
            if (!arkts.isClassProperty(prop) || !arkts.isIdentifier(prop.key)) {
                continue;
            }
            const propName = prop.key.name;
            const propValue = prop.value;
            if (!propValue) {
                continue;
            }

            if (propName === 'abilityName') {
                data.abilityName = this.extractStringValue(propValue, classNode) as string;
            } else if (propName === 'executeMode') {
                data.executeMode = this.extractExecuteModeArray(propValue);
            }
        }
        
        // 验证必填字段和数据类型
        if (!validateRequiredFields(data, 'Entry', classNode) ||
            (data.executeMode && !validateExecuteMode(data.executeMode)) ||
            (data.keywords && !validateKeywords(data.keywords, classNode)) ||
            (data.parameters && !validateParametersSchema(data.parameters, classNode, validateEntrySchemaConsistency))) {
            return null;
        }
        
        // 将 executeMode 从数字数组转换成字符串数组（必须在验证之后）
        if (data.executeMode) {
            this.processExecuteModeParam(data);
        }
        
        // 分析基类继承信息（InsightIntentEntryExecutor）
        this.analyzeBaseClass(classNode, data, '@InsightIntentEntry');
        this.collectEntityOwnersFromClassProperties(
            classNode,
            data,
            new Set(['executeMode', 'context', 'windowStage', 'uiExtensionSession', 'onExecute'])
        );
        return data;
    }
    private validateFormName(
        formName: string,
        bindFormInfo: FormExtensionAbilityInfo,
        classNode: arkts.ClassDeclaration
    ): boolean {
        if (!formName) {
            this.reportInvalidFormName(classNode);
            return false;
        }

        const aceProfilePath = this.resolveAceProfilePath();
        if (!aceProfilePath) {
            return true;
        }

        let formNameFound = false;
        const metadataList = Array.isArray(bindFormInfo.metadata) ? bindFormInfo.metadata : [];
        for (const metadata of metadataList) {
            if (!metadata?.resource || typeof metadata.resource !== 'string') {
                continue;
            }
            const formConfigName = `${metadata.resource.split(':').pop()}.json`;
            const formConfigPath = path.join(aceProfilePath, formConfigName);
            if (!fs.existsSync(formConfigPath)) {
                continue;
            }
            try {
                const formConfig = JSON.parse(fs.readFileSync(formConfigPath, 'utf-8'));
                const formConfigs = Array.isArray(formConfig?.forms) ? formConfig.forms : [];
                if (formConfigs.some((form: { name?: unknown }) => form?.name === formName)) {
                    formNameFound = true;
                    break;
                }
            } catch {
                continue;
            }
        }

        if (!formNameFound) {
            this.reportInvalidFormName(classNode);
            return false;
        }

        return true;
    }

    private resolveAceProfilePath(): string | undefined {
        const projectConfig = this.projectConfig;
        if (projectConfig.aceProfilePath) {
            return projectConfig.aceProfilePath;
        }

        const moduleRootPath = projectConfig.moduleRootPath;
        if (!moduleRootPath) {
            return undefined;
        }

        projectConfig.aceProfilePath = path.join(
            moduleRootPath,
            'build',
            'default',
            'intermediates',
            'res',
            'default',
            'resources',
            'base',
            'profile'
        );

        return projectConfig.aceProfilePath;
    }

    private reportInvalidFormName(classNode: arkts.ClassDeclaration): void {
        LogCollector.getInstance().collectLogInfo({
            node: classNode,
            type: LogType.ERROR,
            code: '10110023',
            message: 'formName in @InsightIntentForm must match the widget name registered in formExtensionAbility.'
        });
    }

    private extractEntityIntentData(annotation: arkts.AnnotationUsage, classNode: arkts.ClassDeclaration): InsightIntentData | null {
        const properties = annotation.properties;
        if (!properties || properties.length === 0) {
            return null;
        }
        const program = arkts.getProgramFromAstNode(classNode);
        const data: InsightIntentEntityData & { supportedQueryProperties?: string[] } = {
            className: classNode.definition?.ident?.name || 'UnknownClass',
            decoratorFile: this.normalizeFilePath(program?.absName || ''),
            decoratorType: '@InsightIntentEntity',
            entityCategory: '',
        };

        for (const prop of properties) {
            if (!arkts.isClassProperty(prop) || !arkts.isIdentifier(prop.key)) {
                continue;
            }
            const propName = prop.key.name;
            const propValue = prop.value;
            if (!propValue) {
                continue;
            }

            if (propName === 'entityCategory') {
                // entityCategory 是必填字段，直接赋值
                data.entityCategory = this.extractStringValue(propValue, classNode) as string;
            } else if (propName === 'parameters') {
                // parameters 是非必填字段，undefined 或空字符串不写入
                // 注意：SDK 定义中这些字段有默认值 = ""，需要额外过滤空字符串
                const parameters = this.extractJsonValue(propValue, classNode);
                // 过滤掉 undefined、null 和空字符串（SDK 默认值导致的）
                if (this.isValidOptionalValue(parameters, classNode, '@InsightIntentEntity') && 
                    !(typeof parameters === 'string' && parameters.trim() === '')) {
                    data.parameters = parameters as Record<string, unknown> | null | undefined;
                }
            } else if (propName === 'supportedQueryProperties') {
                const supportedQueryProperties = this.extractArrayValue(propValue);
                if (this.isValidOptionalValue(supportedQueryProperties, classNode, '@InsightIntentEntity')) {
                    data.supportedQueryProperties = supportedQueryProperties;
                }
            }
        }

        const entityId = this.extractEntityIdFromClass(classNode);
        data.entityId = entityId || '';

        if (!data.entityCategory) {
            LogCollector.getInstance().collectLogInfo({
                node: classNode,
                type: LogType.ERROR,
                code: '10110003',
                message: 'Required parameters are missing for the decorator.'
            });
            return null;
        }
        if (!data.className || !data.decoratorFile ||
            (data.parameters && !this.isValidOptionalValue(data.parameters, classNode, '@InsightIntentEntity')) ||
            (data.parameters && !validateParametersSchema(data.parameters, classNode, validateEntitySchemaConsistency)) ||
            (data.supportedQueryProperties && !validateKeywords(data.supportedQueryProperties, classNode)) ||
            (data.supportedQueryProperties && !validateSupportedQuery(data.parameters, data.supportedQueryProperties, classNode, validateEntitySchemaConsistency)) ||

            !this.validateEntityBaseClass(classNode, data)
        ) {
            return null;
        }

        return data;
    }
    private extractEntityIdFromClass(classNode: arkts.ClassDeclaration, visited: Set<string> = new Set()): string | undefined {
        const classKey = getClassVisitKey(classNode);
        if (visited.has(classKey)) {
            return undefined;
        }
        visited.add(classKey);

        const classMembers = classNode.definition?.body || [];
        for (const member of classMembers) {
            if (!arkts.isClassProperty(member) || !member.key || !arkts.isIdentifier(member.key)) {
                continue;
            }
            if (!this.isEntityIdPropertyName(member.key.name)) {
                continue;
            }

            const initializer =
                member.value ??
                (member as { initializer?: arkts.Expression }).initializer ??
                (member as { init?: arkts.Expression }).init;
            if (!initializer) {
                continue;
            }

            const entityId = this.extractEntityIdFromInitializer(initializer, member, classNode);
            if (typeof entityId === 'string' && entityId.trim() !== '') {
                return entityId;
            }
        }

        const parentClassNode = resolveExtendedClassDeclaration(classNode);
        if (!parentClassNode) {
            return undefined;
        }
        return this.extractEntityIdFromClass(parentClassNode, visited);
    }

    private isEntityIdPropertyName(propertyName: string): boolean {
        if (propertyName === 'entityId') {
            return true;
        }
        if (propertyName === `${ObservedNames.PROPERTY_PREFIX}entityId`) {
            return true;
        }
        return propertyName === '_$property$_entityId';
    }

    private extractEntityIdFromInitializer(
        initializer: arkts.Expression,
        member: arkts.ClassProperty,
        classNode: arkts.ClassDeclaration
    ): string | undefined {
        const candidateValues = [
            this.extractValueFromExpression(initializer),
            this.extractStringValue(initializer, classNode),
            this.extractValueFromDeclaration(member),
        ];

        for (const candidateValue of candidateValues) {
            if (typeof candidateValue === 'string' && candidateValue.trim() !== '') {
                return candidateValue;
            }
        }
        return undefined;
    }

    private validateEntityBaseClass(classNode: arkts.ClassDeclaration, entityData: InsightIntentEntityData): boolean {
        if (!this.isEntityInheritanceValid(classNode, new Set<string>())) {
            LogCollector.getInstance().collectLogInfo({
                node: classNode,
                type: LogType.ERROR,
                code: '10110021',
                message: 'Classes decorated with @InsightIntentEntity must implement InsightIntent.IntentEntity.'
            });
            return false;
        }

        const implementedTypeNames = extractImplementedTypeNames(classNode);
        const qualifiedImplementedTypeNames = (classNode.definition?.implements || [])
            .map((implementedType: { expr?: arkts.Expression }) => extractQualifiedTypeNameFromExpression(implementedType.expr))
            .filter((name: string | undefined): name is string => !!name);
        let parentClassName: string | undefined = implementedTypeNames.find((typeName: string) => typeName === 'IntentEntity');
        let qualifiedParentClassName: string | undefined = qualifiedImplementedTypeNames.find(
            (_: string, index: number) => implementedTypeNames[index] === parentClassName
        );
        if (!parentClassName) {
            parentClassName = extractTypeNameFromExpression(classNode.definition?.super);
            qualifiedParentClassName = extractQualifiedTypeNameFromExpression(classNode.definition?.super);
        }
        if (qualifiedParentClassName || parentClassName) {
            entityData.parentClassName = qualifiedParentClassName || parentClassName;
        }
        if (parentClassName) {
            this.collector.addEntityInheritance(entityData.className, parentClassName, entityData.decoratorFile);
        }
        return true;
    }

    private isEntityInheritanceValid(classNode: arkts.ClassDeclaration, visited: Set<string>): boolean {
        const classKey = getClassVisitKey(classNode);
        if (visited.has(classKey)) {
            return false;
        }
        visited.add(classKey);

        const implementedTypeNames = extractImplementedTypeNames(classNode);
        if (implementedTypeNames.includes('IntentEntity')) {
            return true;
        }

        const parentClassName = extractTypeNameFromExpression(classNode.definition?.super);
        if (parentClassName === 'IntentEntity') {
            return true;
        }
        if (!parentClassName) {
            return false;
        }

        const parentClassNode = resolveExtendedClassDeclaration(classNode);
        if (!parentClassNode) {
            return false;
        }
        return this.isEntityInheritanceValid(parentClassNode, visited);
    }
    /**
     * 判断是否为有效的非空值（用于非必填字段）
     * @param value 要检查的值
     * @returns 如果值不是 undefined 或 null 返回 true（只要注解传参了就写入）
     */
    private isValidOptionalValue(value: unknown, classNode: arkts.ClassDeclaration, decoratorType: string): boolean {
        if (value === undefined || value === null) {
            LogCollector.getInstance().collectLogInfo({
                node: classNode,
                message: `The parameter type does not match the decorator\'s requirement.`,
                type: LogType.ERROR,
                code: '10110004'
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
    private extractBaseIntentData(annotation: arkts.AnnotationUsage, classNode: arkts.ClassDeclaration, decoratorType: string): InsightIntentDataBase | null {
        const properties = annotation.properties;
        if (!properties || properties.length === 0) {
            return null;
        }

        const data: InsightIntentDataBase = {
            decoratorFile: undefined,
            decoratorType: undefined,
            moduleName: undefined,
            bundleName: undefined
        };
        const className = classNode.definition?.ident?.name || 'UnknownClass';
        const program = arkts.getProgramFromAstNode(classNode);
        const filePath = program?.absName || '';

        data.decoratorClass = className;
        data.decoratorFile = this.normalizeFilePath(filePath);
        data.decoratorType = decoratorType;
        data.moduleName = this.projectConfig?.moduleName;
        data.bundleName = this.projectConfig?.bundleName;

        for (const prop of properties) {
            if (!arkts.isClassProperty(prop) || !arkts.isIdentifier(prop.key)) {
                continue
            };
            const propName = prop.key.name;
            const propValue = prop.value;
            if (!propValue){
                continue
            };
            switch (propName) {
                case 'intentName':
                case 'domain':
                case 'intentVersion':
                case 'displayName':
                case 'displayDescription':
                case 'schema':
                case 'icon':
                case 'llmDescription':
                case 'example': {
                    // 必填字段，直接赋值
                    data[propName] = propValue.str
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

        this.mergeStandardIntentSchema(data);

        if (!data.intentName || !data.domain || !data.intentVersion) {
            LogCollector.getInstance().collectLogInfo({
                type: LogType.ERROR,
                node: classNode,
                message: `The parameter type does not match the decorator's requirement.`,
                code: '10110004'
            });
            return null;
        }

        return data;
    }

    private extractStringValue(node: arkts.Expression, classNode?: arkts.ClassDeclaration): unknown {
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
            return this.extractTemplateLiteralValue(node as arkts.TemplateLiteral) || undefined;
        }
        // 使用 arkts.getDecl() 获取变量值
        if (arkts.isIdentifier(node)) {
            const value = this.getVariableValueFromDecl(node);
            if (!value && classNode) {
                LogCollector.getInstance().collectLogInfo({
                    node: classNode,
                    type: LogType.ERROR,
                    code: '10110005',
                    message: `Unsupported parameters found in the decorator.`
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
                return node.quasis.map((q: arkts.TemplateLiteralElement) => q.cooked || q.raw || '').join('');
            }
            return null;
        } catch (error) {
            return null;
        }
    }

    private extractArrayValue(node: arkts.Expression): string[] | undefined {
        if (!arkts.isArrayExpression(node)) {
            LogCollector.getInstance().collectLogInfo({
                node: node,
                type: LogType.ERROR,
                code: '10110004',
                message: `The parameter type does not match the decorator's requirement.`
            });
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
    private extractExecuteModeArray(node: arkts.Expression): number[] {
        if (!arkts.isArrayExpression(node)) {
            return [];
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

        return result.length > 0 ? result : [];
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
    private processExecuteModeParam(intentObj: InsightIntentDataBase): void {
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
    private analyzeBaseClass(classNode: arkts.ClassDeclaration, intentObj: InsightIntentDataBase, decoratorType: string): void {
        if (!classNode.definition || !classNode.definition.super) {
            LogCollector.getInstance().collectLogInfo({
                node: classNode,
                type: LogType.ERROR,
                code: '10110018',
                message: 'Classes decorated with @InsightIntentEntry must inherit from InsightIntentEntryExecutor.'
            });
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
    private collectEntityOwnersFromClassProperties(
        classNode: arkts.ClassDeclaration,
        intentObj: InsightIntentDataBase,
        excludedPropertyNames: Set<string>,
        visited: Set<string> = new Set<string>()
    ): void {
        if (!intentObj.intentName) {
            return;
        }

        const classKey = getClassVisitKey(classNode);
        if (visited.has(classKey)) {
            return;
        }
        visited.add(classKey);

        const parentClassNode = resolveExtendedClassDeclaration(classNode);
        if (parentClassNode) {
            this.collectEntityOwnersFromClassProperties(parentClassNode, intentObj, excludedPropertyNames, visited);
        }

        const classMembers = classNode.definition?.body || [];
        for (const member of classMembers) {
            if (!arkts.isClassProperty(member) || !member.key || !arkts.isIdentifier(member.key)) {
                continue;
            }
            if (excludedPropertyNames.has(member.key.name) || (member as { isStatic?: boolean }).isStatic) {
                continue;
            }

            const typeAnnotation = member.typeAnnotation;
            if (!typeAnnotation) {
                continue;
            }

            const schemaType = inferSchemaVerifyTypeFromTypeText(typeAnnotation.dumpSrc());
            if (!schemaType.isEntity) {
                continue;
            }

            const entityTypeName = this.resolveEntityClassNameFromTypeNode(typeAnnotation);
            if (entityTypeName) {
                this.collector.addEntityOwner(intentObj.intentName, entityTypeName, intentObj.decoratorFile);
            }
        }
    }

    private hasInsightIntentEntityAnnotation(classNode: arkts.ClassDeclaration): boolean {
        const annotations = classNode.definition?.annotations || [];
        return annotations.some((annotation: arkts.AnnotationUsage) =>
            !!annotation.expr && arkts.isIdentifier(annotation.expr) &&
            annotation.expr.name === INSIGHT_INTENT_ENTITY_DECORATOR
        );
    }

    private resolveAnnotatedEntityClassNameByIdentifier(identifier: arkts.Identifier | undefined): string | undefined {
        if (!identifier) {
            return undefined;
        }

        const declaration = arkts.getDecl(identifier);
        const classDeclaration = findEnclosingClassDeclaration(declaration);
        if (!classDeclaration || !this.hasInsightIntentEntityAnnotation(classDeclaration)) {
            return undefined;
        }

        return classDeclaration.definition?.ident?.name;
    }

    private resolveEntityClassNameFromTypeNode(typeNode: arkts.TypeNode): string | undefined {
        if (arkts.isETSTypeReference(typeNode)) {
            const part = typeNode.part;
            if (part && arkts.isETSTypeReferencePart(part)) {
                if (part.typeArguments) {
                    for (const typeArgument of part.typeArguments) {
                        const resolvedTypeName = this.resolveEntityClassNameFromTypeNode(typeArgument);
                        if (resolvedTypeName) {
                            return resolvedTypeName;
                        }
                    }
                }

                const identifier = extractIdentifierFromTypeReferenceName(part.name);
                const resolvedTypeName = this.resolveAnnotatedEntityClassNameByIdentifier(identifier);
                if (resolvedTypeName) {
                    return resolvedTypeName;
                }
            }
        } else if (arkts.isIdentifier(typeNode)) {
            const resolvedTypeName = this.resolveAnnotatedEntityClassNameByIdentifier(typeNode);
            if (resolvedTypeName) {
                return resolvedTypeName;
            }
        }

        const entityTypeName = this.extractEntityTypeNameFromTypeNode(typeNode);
        if (!entityTypeName) {
            return undefined;
        }

        const knownEntityClassNames = new Set(
            this.collector.getAllIntents()
                .filter((intent): intent is InsightIntentEntityData =>
                    intent.decoratorType === '@InsightIntentEntity' && 'className' in intent
                )
                .map((intent) => intent.className)
        );
        return knownEntityClassNames.has(entityTypeName) ? entityTypeName : undefined;
    }

    private extractEntityTypeNameFromTypeNode(typeNode: arkts.TypeNode): string | undefined {
        if (arkts.isETSTypeReference(typeNode)) {
            const part = typeNode.part;
            if (part && arkts.isETSTypeReferencePart(part) && part.name) {
                const identifier = extractIdentifierFromTypeReferenceName(part.name);
                if (identifier) {
                    return identifier.name;
                }
            }
        } else if (arkts.isIdentifier(typeNode)) {
            return typeNode.name;
        }

        const typeText = typeNode.dumpSrc().replace(/\s+/g, '');
        const normalizedTypeText = typeText
            .replace(/^:/, '')
            .replace(/[;?]$/g, '');
        const unionTypes = normalizedTypeText
            .split('|')
            .filter((item: string) => item && item !== 'undefined' && item !== 'null');
        const simplifiedType = unionTypes.length === 1 ? unionTypes[0] : normalizedTypeText;
        const arrayMatch = simplifiedType.match(/^(?:ReadonlyArray|Array)<(.+)>$/) ||
            simplifiedType.match(/^\((.+)\)\[\]$/) ||
            simplifiedType.match(/^(.+)\[\]$/);
        if (arrayMatch) {
            return arrayMatch[1].replace(/[()]/g, '').split('|')
                .map((item: string) => item.trim())
                .find((item: string) => item && item !== 'undefined' && item !== 'null');
        }
        if (simplifiedType === 'object' || simplifiedType === 'Object' ||
            simplifiedType.startsWith('{') || simplifiedType.startsWith('Record<') ||
            simplifiedType.startsWith('Map<')) {
            return undefined;
        }

        const identifierCandidates = simplifiedType.match(/[A-Za-z_]\w*/g) || [];
        const ignoredTypeNames = new Set([
            'string', 'number', 'boolean', 'object', 'Object',
            'undefined', 'null', 'Array', 'ReadonlyArray', 'Record', 'Map'
        ]);
        for (let index = identifierCandidates.length - 1; index >= 0; index--) {
            const candidate = identifierCandidates[index];
            if (!ignoredTypeNames.has(candidate)) {
                return candidate;
            }
        }
        return undefined;
    }
    /**
     * 处理 Entry 类的基类信息
     */
    private processEntryBaseClass(superClass: arkts.Expression, classNode: arkts.ClassDeclaration, intentObj: InsightIntentDataBase): void {
        // 获取父类名称和泛型参数
        let parentClassName: string | undefined;
        let typeArguments: arkts.TypeNode[] = [];
        let genericTypeTexts: string[] = [];
        
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
        // 检查类是否被导出
        const isExported = !!classNode.definition?.isExport || !!classNode.definition?.isDefaultExport;
        const isDefault = !!classNode.definition?.isDefaultExport;
        if (!(isExported && isDefault)) {
            const errorMessage: string = 'The class decorated with @InsightIntentEntry must be exported as default.';
            LogCollector.getInstance().collectLogInfo({
                node: classNode,
                type: LogType.ERROR,
                code: '10110019',
                message: errorMessage
            });
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
        if (typeArguments.length === 0) {
            genericTypeTexts = this.extractGenericTypeTextsFromExpression(superClass);
        }
        // 收集类继承信息
        this.collectClassInheritanceInfo(parentClassName, typeArguments, intentObj, genericTypeTexts);
    }
    /**
     * 收集类继承信息，包括泛型参数
     */
    private collectClassInheritanceInfo(
        parentClassName: string,
        typeArguments: arkts.TypeNode[],
        intentObj: InsightIntentDataBase,
        genericTypeTexts: string[] = []
    ): void {
        const ClassInheritanceInfo: {
            parentClassName: string;
            definitionFilePath: string;
            generics: unknown[];
        } = {
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
        if (ClassInheritanceInfo.generics.length === 0 && genericTypeTexts.length > 0) {
            for (const genericTypeText of genericTypeTexts) {
                const generic = this.extractGenericInfoFromText(genericTypeText, intentObj);
                if (generic) {
                    ClassInheritanceInfo.generics.push(generic);
                }
            }
        }
        intentObj.ClassInheritanceInfo = ClassInheritanceInfo;
    }
    /**
     * 提取泛型信息
     * @param typeNode 类型节点
     * @param intentObj intent 对象（可选，用于记录 entity 关联）
     */
    private extractGenericInfo(typeNode: arkts.TypeNode, intentObj?: InsightIntentDataBase): unknown | null {
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

        if (!typeName) {
            const typeText = typeNode.dumpSrc().replace(/\s+/g, '');
            const normalizedTypeText = typeText
                .replace(/^:/, '')
                .replace(/[;?]$/g, '');
            const unionTypes = normalizedTypeText
                .split('|')
                .filter((item: string) => item && item !== 'undefined' && item !== 'null');
            if (unionTypes.length === 1) {
                typeName = unionTypes[0];
            } else if (normalizedTypeText) {
                typeName = normalizedTypeText;
            }
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
            this.collector.addEntityOwner(intentObj.intentName, typeName, intentObj.decoratorFile);
        }
        
        return {
            'typeName': typeName,
            'definitionFilePath': definitionFilePath
        };
    }
    private extractGenericInfoFromText(typeText: string, intentObj?: InsightIntentDataBase): unknown | null {
        const normalizedTypeText = typeText.replace(/\s+/g, '');
        if (!normalizedTypeText) {
            return null;
        }

        const unionTypes = normalizedTypeText
            .split('|')
            .filter((item: string) => item && item !== 'undefined' && item !== 'null');
        const typeName = unionTypes.length === 1 ? unionTypes[0] : normalizedTypeText;
        const primitiveTypes = ['string', 'number', 'boolean'];
        if (primitiveTypes.includes(typeName.toLowerCase())) {
            return {
                'typeName': typeName,
                'definitionFilePath': 'lib.es5.d.ts'
            };
        }

        if (intentObj?.intentName) {
            const entityTypeName = this.extractEntityTypeNameFromText(typeName);
            if (entityTypeName) {
                this.collector.addEntityOwner(intentObj.intentName, entityTypeName, intentObj.decoratorFile);
            }
        }

        return {
            'typeName': typeName,
            'definitionFilePath': 'lib.es5.d.ts'
        };
    }

    private extractGenericTypeTextsFromExpression(typeExpr: arkts.Expression): string[] {
        const sourceText = typeExpr.dumpSrc?.().replace(/\s+/g, '') || '';
        const genericMatch = sourceText.match(/^[A-Za-z_]\w*<(.+)>$/);
        if (!genericMatch?.[1]) {
            return [];
        }
        return this.splitTopLevelGenericArguments(genericMatch[1]);
    }

    private splitTopLevelGenericArguments(typeText: string): string[] {
        const result: string[] = [];
        let current = '';
        let depth = 0;
        for (const char of typeText) {
            if (char === '<') {
                depth++;
            } else if (char === '>') {
                depth--;
            } else if (char === ',' && depth === 0) {
                if (current.trim()) {
                    result.push(current.trim());
                }
                current = '';
                continue;
            }
            current += char;
        }
        if (current.trim()) {
            result.push(current.trim());
        }
        return result;
    }

    private extractEntityTypeNameFromText(typeText: string): string | undefined {
        const identifierCandidates = typeText.match(/[A-Za-z_]\w*/g) || [];
        const ignoredTypeNames = new Set([
            'string', 'number', 'boolean', 'object', 'Object',
            'undefined', 'null', 'Array', 'ReadonlyArray', 'Record', 'Map'
        ]);
        for (let index = identifierCandidates.length - 1; index >= 0; index--) {
            const candidate = identifierCandidates[index];
            if (!ignoredTypeNames.has(candidate)) {
                return candidate;
            }
        }
        return undefined;
    }
    /**
     * 提取 JSON 值
     * @param node 
     * @param classNode 
     * @returns 
     */
    private extractJsonValue(node: arkts.Expression, classNode?: arkts.ClassDeclaration): unknown{
        // 使用 arkts.getDecl() 获取变量值
        if (arkts.isIdentifier(node)) {
            const value = this.getVariableValueFromDecl(node);
            if (value !== undefined) {
                return value;
            }
            if (classNode) {
                LogCollector.getInstance().collectLogInfo({
                    node: classNode,
                    type: LogType.ERROR,
                    code: '10110005',
                    message: `Unsupported parameters found in the decorator.`
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
            return this.convertObjectToJson(node);
        }

        if (arkts.isArrayExpression(node)) {
            return this.convertArrayExpressionToJson(node);
        }

        if (classNode) {
            LogCollector.getInstance().collectLogInfo({
                node: classNode,
                type: LogType.ERROR,
                code: '10110005',
                message: `Unsupported parameters found in the decorator.`
            });
        }
        return undefined;
    }
    /**
     * 转换对象表达式为 JSON
     * @param node 
     * @returns 
     */
    private convertObjectToJson(node: arkts.ObjectExpression): unknown {
        const obj: DecoratorData = {};
        for (const prop of node.properties) {
            if (!arkts.isProperty(prop) && !arkts.isClassProperty(prop)) {
                continue
            }

            const key = prop.key;
            const value = prop.value;
            if (!key || !value) {
                continue
            }

            let keyName: string | null = null;
            if (arkts.isIdentifier(key)) {
                keyName = key.name;
            } else if (arkts.isStringLiteral(key)) {
                keyName = key.str;
            }

            if (!keyName) {
                continue
            }

            const jsonValue = this.convertExpressionToJson(value);
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
    private convertArrayExpressionToJson(node: arkts.ArrayExpression): unknown[] {
        const arr: unknown[] = [];
        for (const element of node.elements) {
            arr.push(this.convertExpressionToJson(element));
        }
        return arr;
    }

    /**
     * 转换表达式为 JSON 值
     * @param node 
     * @returns 
     */
    private convertExpressionToJson(node: arkts.Expression): unknown {
        if (!node) {
            return undefined;
        }
        
        // 使用 arkts API 解包 TSAsExpression
        let actualNode: arkts.Expression | undefined = node;
        while (arkts.isTSAsExpression(actualNode)) {
            actualNode = actualNode.expr;
            if (!actualNode) {
                break
            }
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
            return this.convertObjectToJson(actualNode);
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
            // 如果仍然找不到值，记录错误
            LogCollector.getInstance().collectLogInfo({
                node: actualNode,
                type: LogType.ERROR,
                code: '10110005',
                message: `Unsupported parameters found in the decorator.`
            });
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

        // 统一将反斜杠替换为正斜杠，方便后续处理
        let normalizedPath = filePath.replace(/\\/g, '/');

        // 查找 'src/main/' 的位置
        const srcMainIndex = normalizedPath.indexOf('/src/main/');

        let relativePath = '';

        if (srcMainIndex !== -1) {
            // 截取 '/src/main/' 之后的所有内容
            relativePath = normalizedPath.substring(srcMainIndex + 10);
            if (!relativePath.startsWith('./')) {
                relativePath = './' + relativePath;
            }
        } else {
            relativePath = normalizedPath;
        }
        // 缓存结果
        this.normalizedPathCache.set(filePath, relativePath);

        return relativePath;
    }

    private mergeStandardIntentSchema(intent: InsightIntentDataBase): void {
        if (!intent.schema || !intent.intentVersion) {
            return;
        }

        const schemaPath: string = path.join(
            __dirname,
            '../../insight_intents/schema',
            `${intent.schema}_${intent.intentVersion}.json`
        );

        if (!fs.existsSync(schemaPath)) {
            return;
        }

        const schemaContent: string = fs.readFileSync(schemaPath, 'utf-8');
        const schemaObj: InsightIntentDataBase = JSON.parse(schemaContent);
        intent.parameters = schemaObj.parameters ?? intent.parameters;
        intent.llmDescription = schemaObj.llmDescription ?? intent.llmDescription;
        intent.keywords = schemaObj.keywords ?? intent.keywords;
        intent.intentName = schemaObj.intentName ?? intent.intentName;
        intent.result = schemaObj.result ?? intent.result;
        intent.domain = schemaObj.domain ?? intent.domain;

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
        // 检查类是否被导出
        let isExported: boolean = classNode.definition?.isExport || classNode.definition?.isDefaultExport;
        if (!isExported) {
            const errorMessage: string = 'The class decorated with @InsightIntentFunction must be exported.';
            LogCollector.getInstance().collectLogInfo({
                node: classNode,
                type: LogType.ERROR,
                code: '10110014',
                message: errorMessage
            });
            return null;
        }
        // 判断当前类是否被 @InsightIntentFunction() 修饰
        const hasDecorator = this.hasInsightIntentFunctionDecorator(classNode);
        if (!hasDecorator) {
            LogCollector.getInstance().collectLogInfo({
                node: classNode,
                type: LogType.ERROR,
                code: '10110013',
                message: 'Methods decorated with @InsightIntentFunctionMethod must be in a class decorated with @InsightIntentFunction.'
            });
            return null;
        }
        // 装饰的方法未使用static修饰
        for (const member of classNode.definition?.body || []) {
            let kind = member.kind;
            let isNotConstructorMethod = kind !== arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_CONSTRUCTOR;
            if (arkts.isMethodDefinition(member) && isNotConstructorMethod && !member.isStatic) {
                const errorMessage: string = `Methods decorated with @InsightIntentFunctionMethod must be static.`;
                LogCollector.getInstance().collectLogInfo({
                    node: classNode,
                    type: LogType.ERROR,
                    code: '10110015',
                    message: errorMessage
                });
                return null;
            }
        }
        const data: InsightIntentDataBase = {
            decoratorFile: undefined,
            decoratorType: undefined,
            moduleName: undefined,
            bundleName: undefined
        };
        
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
                    if (param && param.identifier && arkts.isIdentifier(param.identifier)) {
                        return param.identifier.name;
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
            if (!arkts.isClassProperty(prop) || !arkts.isIdentifier(prop.key)) {
                continue;
            }
            const propName = prop.key.name;
            const propValue = prop.value;
            if (!propValue) {
                continue;
            }

            switch (propName) {
                case 'intentName':
                case 'domain':
                case 'intentVersion':
                case 'displayName':
                case 'displayDescription':
                case 'schema':
                case 'icon':
                case 'llmDescription':
                case 'example': {
                    // 必填字段，直接赋值
                    data[propName] = propValue.str
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

        this.mergeStandardIntentSchema(data);

        // 验证必填字段
        if (!data.intentName || !data.domain || !data.intentVersion) {
            LogCollector.getInstance().collectLogInfo({
                node: classNode,
                type: LogType.ERROR,
                code: '10110003',
                message: 'Required parameters are missing for the decorator.'
            });
            return null;
        }

        if (!validateRequiredFields(data, 'FunctionMethod', classNode) ||
            (data.keywords && !validateKeywords(data.keywords, classNode)) ||
            (data.parameters && !validateJsonSchema(data.parameters, 'parameters', classNode)) ||
            (data.result && !validateResultSchema(data.result, classNode))) {
            return null;
        }

        return data;
    }
    /**
     * 判断类是否被 @InsightIntentFunction 装饰器修饰
     */
    private hasInsightIntentFunctionDecorator(classNode: arkts.ClassDeclaration): boolean {
        if (!classNode.definition?.annotations) {
            return false;
        }
        const annotations = classNode.definition.annotations;
        if (annotations.length === 0) {
            return false;
        }
        return annotations.some((anno: arkts.AnnotationUsage) => {
            if (anno.expr && arkts.isIdentifier(anno.expr)) {
                return anno.expr.name === INSIGHT_INTENT_FUNCTION_DECORATOR;
            }
            return false;
        });
    }
}

