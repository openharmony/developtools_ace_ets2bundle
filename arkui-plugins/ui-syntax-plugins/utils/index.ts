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
import * as fs from 'fs';
import * as path from 'path';
import { UISyntaxRuleContext } from 'ui-syntax-plugins/rules/ui-syntax-rule';
import { ProjectConfig } from 'common/plugin-context';

export const EXCLUDE_EXTERNAL_SOURCE_PREFIXES: Array<string | RegExp> = [
    'std',
    'escompat',
    'security',
    'application',
    'permissions',
    'bundleManager',
    'commonEvent',
    'global',
    'arkui',
    /@arkts\..*/,
    /@ohos\.*/,
    /@system\..*/,
    /@koalaui\./,
    /ability\..*/,
];

export const BUILD_NAME: string = 'build';

export const SINGLE_CHILD_COMPONENT: number = 1;
export const MAX_ENTRY_DECORATOR_COUNT: number = 1;
export const MAX_PREVIEW_DECORATOR_COUNT: number = 10;

export const $_INVOKE: string = '$_invoke';
export const COMPONENT_BUILDER: string = 'ComponentBuilder';

export const COMPONENT_REPEAT: string = 'Repeat';
export const TEMPLATE: string = 'template';

export const MAX_LINK_SOURCE_DATA_NESTING_LEVEL = 2;

export const CheckObjectLinkUseLiteralKeyword = {
    GLOBAL: 'GLOBAL',
    ARRAY: 'Array',
    FROM: 'from',
    GET: 'get',
    CONSTRUCTOR: 'constructor',
    BUILD: 'build',
};

export const PresetType = {
    STRING: 'string',
    NUMBER: 'number',
    BOOLEAN: 'boolean',
    BIGINT: 'bigint',
};

export const forbiddenUseStateType: string[] = [
    'Scroller',
    'SwiperScroller',
    'VideoController',
    'WebController',
    'CustomDialogController',
    'SwiperController',
    'TabsController',
    'CalendarController',
    'AbilityController',
    'XComponentController',
    'CanvasRenderingContext2D',
    'CanvasGradient',
    'ImageBitmap',
    'ImageData',
    'Path2D',
    'RenderingContextSettings',
    'OffscreenCanvasRenderingContext2D',
    'PatternLockController',
    'TextAreaController',
    'TextInputController',
    'TextTimerController',
    'SearchController',
    'RichEditorController',
];

export const PresetDecorators = {
    TOGGLE: 'Toggle',
    BUILDER_PARAM: 'BuilderParam',
    COMPONENT_V1: 'Component',
    COMPONENT_V2: 'ComponentV2',
    COMPUTED: 'Computed',
    CONSUME: 'Consume',
    CONSUMER: 'Consumer',
    CUSTOM_DIALOG: 'CustomDialog',
    ENTRY: 'Entry',
    EVENT: 'Event',
    PREVIEW: 'Preview',
    STATE: 'State',
    PARAM: 'Param',
    PROP_REF: 'PropRef',
    PROVIDE: 'Provide',
    PROVIDER: 'Provider',
    LINK: 'Link',
    LOCAL: 'Local',
    OBJECT_LINK: 'ObjectLink',
    STORAGE_PROP_REF: 'StoragePropRef',
    STORAGE_LINK: 'StorageLink',
    LOCAL_STORAGE_LINK: 'LocalStorageLink',
    LOCAL_STORAGE_PROP_REF: 'LocalStoragePropRef',
    REQUIRE: 'Require',
    REUSABLE_V1: 'Reusable',
    REUSABLE_V2: 'ReusableV2',
    OBSERVED_V1: 'Observed',
    OBSERVED_V2: 'ObservedV2',
    TYPE: 'Type',
    WATCH: 'Watch',
    BUILDER: 'Builder',
    TRACK: 'Track',
    TRACE: 'Trace',
    ONCE: 'Once',
    MONITOR: 'Monitor',
    LOCAL_BUILDER: 'LocalBuilder',
    REGULAR: 'regular',
    VARIABLE: 'variable',
    PARAMETER: 'parameter',
    ANIMATABLE_EXTEND: 'AnimatableExtend',
};

export const TOGGLE_TYPE: string = 'ToggleType';
export const TYPE: string = 'type';
export const WRAP_BUILDER: string = 'wrapBuilder';

const UI_COMPONENT_PATH = '../../components/';
const EXTERNAL_COMPONENT_PATH_EDIT    = 'build-tools/ets-loader/components';
const EXTERNAL_COMPONENT_PATH_COMPILE = '../build-tools/ets-loader/components';

export const ToggleType = {
    CHECKBOX: 'Checkbox',
    BUTTON: 'Button',
};

export const ReuseConstants = {
    REUSE: 'reuse',
    REUSE_ID: 'reuseId',
};

export function isClassPropertyOptional(node: arkts.ClassProperty): boolean {
    return arkts.hasModifierFlag(node, arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_OPTIONAL);
}

export function getIdentifierName(node: arkts.AstNode): string {
    if (!arkts.isIdentifier(node)) {
        return '';
    }
    return node.name;
}

export function getAnnotationName(annotation: arkts.AnnotationUsage): string {
    if (!annotation.expr) {
        return '';
    }
    return getIdentifierName(annotation.expr);
}

export function getAnnotationUsage(
    declaration: arkts.StructDeclaration,
    annotationName: string
): arkts.AnnotationUsage | undefined {
    return declaration.definition.annotations.find(
        (annotation) =>
            annotation.expr && arkts.isIdentifier(annotation.expr) && annotation.expr.name === annotationName
    );
}

export function getClassAnnotationUsage(
    declaration: arkts.ClassDeclaration,
    annotationName: string
): arkts.AnnotationUsage | undefined {
    if (!declaration.definition || !declaration.definition.annotations) {
        return undefined;
    }
    return declaration.definition.annotations.find(
        (annotation) =>
            annotation.expr &&
            ((arkts.isIdentifier(annotation.expr) && annotation.expr.name === annotationName) ||
                (arkts.isCallExpression(annotation.expr) &&
                    arkts.isIdentifier(annotation.expr) &&
                    annotation.expr.name === annotationName))
    );
}

export function getClassPropertyName(property: arkts.ClassProperty): string | undefined {
    if (!property.key) {
        return undefined;
    }
    return getIdentifierName(property.key);
}

export function getClassPropertyType(property: arkts.ClassProperty): string | undefined {
    return property.typeAnnotation?.dumpSrc();
}

export function getClassPropertyAnnotationNames(property: arkts.ClassProperty): string[] {
    return property.annotations.map((annotation) => getAnnotationName(annotation));
}

export function getClassPropertyAnnotation(
    property: arkts.ClassProperty,
    decoratorName: string
): arkts.AnnotationUsage | undefined {
    return property.annotations?.find(annotation =>
        annotation.expr &&
        arkts.isIdentifier(annotation.expr) &&
        annotation.expr.name === decoratorName
    );
}

export function getClassDeclarationAnnotation(
    classDeclaration: arkts.ClassDeclaration,
    decoratorName: string
): arkts.AnnotationUsage | undefined {
    return classDeclaration.definition?.annotations.find(annotation =>
        annotation.expr && arkts.isIdentifier(annotation.expr) &&
        annotation.expr.name === decoratorName
    );
}

export function findDecorator(
    member: arkts.ClassProperty | arkts.VariableDeclaration | arkts.FunctionDeclaration |
        arkts.ScriptFunction | arkts.TSInterfaceDeclaration | arkts.TSTypeAliasDeclaration,
    decoratorName: string
): arkts.AnnotationUsage | undefined {
    return member.annotations.find(annotation =>
        annotation.expr && arkts.isIdentifier(annotation.expr) &&
        annotation.expr.name === decoratorName
    );
}

export function isPublicClassProperty(property: arkts.ClassProperty): boolean {
    return arkts.hasModifierFlag(property, arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC);
}

export function isPrivateClassProperty(property: arkts.ClassProperty): boolean {
    return arkts.hasModifierFlag(property, arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PRIVATE);
}

export function isProtectedClassProperty(property: arkts.ClassProperty): boolean {
    return arkts.hasModifierFlag(property, arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PROTECTED);
}

export function listToString(strList: string[]): string {
    return strList.length > 1 ? `${strList.join(',')}` : strList.join('');
}

export class MultiMap<K, V> {
    private readonly map: Map<K, V[]>;
    constructor() {
        this.map = new Map();
    }
    /**
     * Add key-value pairs to MultiMap
     * @param key key
     * @param value value
     */
    add(key: K, value: V): void {
        if (!this.map.has(key)) {
            this.map.set(key, []);
        }
        this.map.get(key)!.push(value);
    }

    /**
     * Gets all the values of the specified key
     * @param key key
     * @returns An array of values, which returns an empty array if the key does not exist
     */
    get(key: K): V[] {
        return this.map.get(key) || [];
    }

    /**
     * Check if the specified key exists in the MultiMap
     * @param key key
     * @returns Whether it exists
     */
    has(key: K): boolean {
        return this.map.has(key);
    }
}

export function hasAnnotation(annoArray: readonly arkts.AnnotationUsage[], annotationName: string): boolean {
    return (annoArray || []).some((anno) => anno.expr && getIdentifierName(anno.expr) === annotationName);
}

interface ComponentJson {
    name: string;
    atomic?: boolean;
    attrs: string[];
    single?: boolean;
    parents?: string[];
    children?: string[];
}

export interface UISyntaxRuleComponents {
    builtInAttributes: string[];
    containerComponents: string[];
    atomicComponents: string[];
    singleChildComponents: string[];
    validParentComponent: Map<string, string[]>;
    validChildComponent: Map<string, string[]>;
}

export function getComponentsInfo(projectConfig: ProjectConfig | undefined, isCoding: boolean): UISyntaxRuleComponents {
    const uiComponentPath = path.resolve(__dirname, UI_COMPONENT_PATH);
    const uiComponentFiles = fs.existsSync(uiComponentPath) ? fs.readdirSync(uiComponentPath) : [];
    const externalComponentPath = getExternalComponentPath(projectConfig, isCoding);
    const externalComponentFiles = fs.existsSync(externalComponentPath) ? fs.readdirSync(externalComponentPath) : [];

    let builtInAttributes: string[] = [];
    let containerComponents: string[] = [];
    let atomicComponents: string[] = [];
    let singleChildComponents: string[] = [];
    let validParentComponent: Map<string, string[]> = new Map();
    let validChildComponent: Map<string, string[]> = new Map();
    const componentsInfo: UISyntaxRuleComponents = {
        builtInAttributes,
        containerComponents,
        atomicComponents,
        singleChildComponents,
        validParentComponent,
        validChildComponent,
    };

    extractComponentInfo(componentsInfo, uiComponentPath, uiComponentFiles);
    extractComponentInfo(componentsInfo, externalComponentPath, externalComponentFiles);
    return componentsInfo;
}

function extractComponentInfo(componentsInfo: UISyntaxRuleComponents, componentPath: string, files: string[]): void {
    if (files.length === 0) {
        return;
    }
    files.forEach((file) => {
        if (path.extname(file) === '.json') {
            const filePath = path.join(componentPath, file);
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            let componentJson: ComponentJson;
            try {
                componentJson = JSON.parse(fileContent);
            } catch (error) {
                console.error(`Invalid JSON: ${filePath}`, (error as Error).message);
                return;
            }
            
            // Record the container component name
            if ((!componentJson.atomic || componentJson.atomic !== true) && componentJson.name) {
                componentsInfo.containerComponents.push(componentJson.name);
            }
            // Record the atomic component name
            if (componentJson.atomic && componentJson.atomic === true && componentJson.name) {
                componentsInfo.atomicComponents.push(componentJson.name);
            }
            // Record the name of a single subcomponent component name
            if (componentJson.single && componentJson.single === true && componentJson.name) {
                componentsInfo.singleChildComponents.push(componentJson.name);
            }
            // Record a valid parent component name
            if (componentJson.parents && componentJson.name) {
                componentsInfo.validParentComponent.set(componentJson.name, componentJson.parents);
            }
            // Record a valid children component name
            if (componentJson.children && componentJson.name) {
                componentsInfo.validChildComponent.set(componentJson.name, componentJson.children);
            }
            // Document all built-in attributes
            componentJson.attrs
                ?.filter((attr) => !componentsInfo.builtInAttributes.includes(attr))
                .forEach((attr) => componentsInfo.builtInAttributes.push(attr));
        }
    });
}

function getExternalComponentPath(projectConfig: ProjectConfig | undefined, isCoding: boolean): string {
    if (!projectConfig) {
        return '';
    }
    const externalComponentPaths = isCoding
        ? (projectConfig.externalApiPath ? [projectConfig.externalApiPath] : [])
        : (projectConfig.externalApiPaths ?? []);
    const subPath = isCoding ? EXTERNAL_COMPONENT_PATH_EDIT : EXTERNAL_COMPONENT_PATH_COMPILE;
    for (const sdkPath of externalComponentPaths) {
        const fullPath = path.resolve(sdkPath, subPath);
        if (fs.existsSync(fullPath)) {
            return fullPath;
        }
    }
    return '';
}

export function getConsistentResourceInfo(): Map<string, { id: string; resourceName: string }[]> {
    const resultMap = new Map<string, { id: string; resourceName: string }[]>();
    const consistentResourcePath =
        path.resolve(__dirname, '../../../../../../../previewer/common/resources/entry/resources.txt');
    let resourceText: string = '';
    try {
        // The contents of the file are read synchronously
        resourceText = fs.readFileSync(path.resolve(consistentResourcePath), 'utf-8');
    } catch (error: unknown) {
        return resultMap;
    }
    // Split text by line
    const lines = resourceText.split('\n');
    for (const line of lines) {
        // Skip blank lines
        if (!line.trim()) {
            continue;
        }
        const match = line.match(/id:(\d+),\s*'([^']+)'\s*'([^']+)'/);
        if (match && match.length === 4) {
            const id = match[1];
            const value = match[2];
            const resourceName = match[3];
            // Remove resource names that start with 'ohos_id' or 'ohos_fa'
            if (resourceName.startsWith('ohos_id') || resourceName.startsWith('ohos_fa')) {
                continue;
            }
            let entries = resultMap.get(value);
            if (!entries) {
                entries = [];
                resultMap.set(value, entries);
            }
            entries.push({
                id: id,
                resourceName: resourceName,
            });
        }
    }
    return resultMap;
}

export function isBuiltInAttribute(context: UISyntaxRuleContext, attributeName: string): boolean {
    if (!context.componentsInfo) {
        return false;
    }
    return context.componentsInfo.builtInAttributes.includes(attributeName);
}
export function isBuildInComponent(context: UISyntaxRuleContext, componentName: string): boolean {
    if (!context.componentsInfo) {
        return false;
    }
    return (
        context.componentsInfo.containerComponents.includes(componentName) ||
        context.componentsInfo.atomicComponents.includes(componentName)
    );
}

export function isAtomicComponent(context: UISyntaxRuleContext, componentName: string): boolean {
    if (!context.componentsInfo) {
        return false;
    }
    return context.componentsInfo.atomicComponents.includes(componentName);
}

export function isContainerComponent(context: UISyntaxRuleContext, componentName: string): boolean {
    if (!context.componentsInfo) {
        return false;
    }
    return context.componentsInfo.containerComponents.includes(componentName);
}

export function isSingleChildComponent(context: UISyntaxRuleContext, componentName: string): boolean {
    if (!context.componentsInfo) {
        return false;
    }
    return context.componentsInfo.singleChildComponents.includes(componentName);
}

export function readJSON<T>(path: string): T | null {
    if (!fs.existsSync(path)) {
        return null;
    }
    const content = fs.readFileSync(path).toString();
    if (!content) {
        return null;
    }
    return JSON.parse(content) as T;
}

export function tracePerformance<T extends (...args: any[]) => any>(name: string, fn: T): T {
    return function (this: ThisParameterType<T>, ...args: Parameters<T>): ReturnType<T> {
        arkts.Performance.getInstance().createEvent(name);
        const result = fn.apply(this, args);
        arkts.Performance.getInstance().stopEvent(name, true);
        return result;
    } as T;
}

const ANNOTATION_PRESET_MODULE_PREFIXES: string[] = ['arkui.', '@ohos.', '@kit.ArkUI'];

export function isFromPresetModules(moduleName: string): boolean {
    for (const presetModulePrefix of ANNOTATION_PRESET_MODULE_PREFIXES) {
        if (moduleName.startsWith(presetModulePrefix)) {
            return true;
        }
    }
    return false;
}

export function getAnnotationUsagesByName(
    annotations: readonly arkts.AnnotationUsage[],
    annotationNames: string[]
): Array<arkts.AnnotationUsage | undefined> {
    return annotationNames.map((annotationName) => getAnnotationUsageByName(annotations, annotationName));
}

export function getAnnotationUsageByName(
    annotations: readonly arkts.AnnotationUsage[],
    annotationName: string
): arkts.AnnotationUsage | undefined {
    return annotations.find((annotation: arkts.AnnotationUsage): boolean => {
        if (!annotation.expr || !arkts.isIdentifier(annotation.expr) || annotation.expr.name !== annotationName) {
            return false;
        }
        const annotationDeclaration = arkts.getDecl(annotation.expr);
        if (!annotationDeclaration) {
            return false;
        }
        const program = arkts.getProgramFromAstNode(annotationDeclaration);
        if (!isFromPresetModules(program.moduleName)) {
            return false;
        }
        return true;
    });
}

export function isStructClassDeclaration(node: arkts.AstNode): node is arkts.ClassDeclaration {
    return (
        arkts.isClassDeclaration(node) && !!node.definition && arkts.classDefinitionIsFromStructConst(node.definition)
    );
}

export function getFunctionAnnotationUsage(
    declaration: arkts.FunctionDeclaration,
    annotationName: string,
): arkts.AnnotationUsage | undefined {
    if (!declaration || !declaration.annotations) {
        return undefined;
    }
    return declaration.annotations.find(
        (annotation) =>
            annotation.expr &&
            ((arkts.isIdentifier(annotation.expr) && annotation.expr.name === annotationName) ||
                (arkts.isCallExpression(annotation.expr) &&
                    arkts.isIdentifier(annotation.expr) &&
                    annotation.expr.name === annotationName))
    );
}

export function getCallee(callExpression: arkts.CallExpression): arkts.Identifier | undefined {
    const expression = callExpression.expression;
    if (arkts.isIdentifier(expression)) {
        return expression;
    }
    if (arkts.isMemberExpression(expression)) {
        if (arkts.isCallExpression(expression.object)) {
            return getCallee(expression.object);
        }
    }
    return undefined;
}

export const TypeFlags = {
    Boolean: 'boolean',
    String: 'string',
    Number: 'number',
    Enum: 'enum',
    Null: 'null',
    Undefined: 'undefined',
    Object: 'object',
    Array: 'array',
    Function: 'function',
    Symbol: 'symbol',
    BigInt: 'bigint',
    Unknown: 'unknown',
    Any: 'any',
    Never: 'never',
    Void: 'void',
    This: 'this',
    TypeParameter: 'typeParameter',
    Literal: 'literal',
    Union: 'union',
};

export function getCurrentFilePath(node: arkts.AstNode): string | undefined {
    const program = arkts.getProgramFromAstNode(node);
    return program.absName;
}