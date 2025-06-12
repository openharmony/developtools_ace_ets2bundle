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
import { UISyntaxRuleComponents } from 'ui-syntax-plugins/processor';
import { UISyntaxRuleContext } from 'ui-syntax-plugins/rules/ui-syntax-rule';

export const SINGLE_CHILD_COMPONENT: number = 1;
export const MAX_ENTRY_DECORATOR_COUNT: number = 1;
export const MAX_PREVIEW_DECORATOR_COUNT: number = 10;

export const COMPONENT_REPEAT: string = 'Repeat';
export const TEMPLATE: string = 'template';

export const PresetType = {
  STRING: 'string',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
  BIGINT: 'bigint'
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
  PROP: 'Prop',
  PROVIDE: 'Provide',
  PROVIDER: 'Provider',
  LINK: 'Link',
  LOCAL: 'Local',
  OBJECT_LINK: 'ObjectLink',
  STORAGE_PROP: 'StorageProp',
  STORAGE_LINK: 'StorageLink',
  LOCAL_STORAGE_PROP: 'LocalStorageProp',
  LOCAL_STORAGE_LINK: 'LocalStorageLink',
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
};

const PUBLIC_PROPERTY_MODIFIERS: Number = 4;
const PROTECTED_PROPERTY_MODIFIERS: Number = 8;
const PRIVATE_PROPERTY_MODIFIERS: Number = 16;

export const ReuseConstants = {
  REUSE: 'reuse',
  REUSE_ID: 'reuseId',
};

export function getIdentifierName(node: arkts.AstNode): string {
  if (!arkts.isIdentifier(node)) {
    throw new Error(`Except a Identifier type!`);
  }
  return node.name;
}

export function getAnnotationName(annotation: arkts.AnnotationUsage): string {
  if (!annotation.expr) {
    throw new Error(`The expr property does not exist!`);
  }
  return getIdentifierName(annotation.expr);
}

export function getAnnotationUsage(
  declaration: arkts.StructDeclaration,
  annotationName: string,
): arkts.AnnotationUsage | undefined {
  return declaration.definition.annotations.find(
    (annotation) =>
      annotation.expr &&
      arkts.isIdentifier(annotation.expr) &&
      annotation.expr.name === annotationName,
  );
}

export function getClassAnnotationUsage(
  declaration: arkts.ClassDeclaration,
  annotationName: string,
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



export function getClassPropertyName(property: arkts.ClassProperty): string {
  return getIdentifierName(property.key);
}

export function getClassPropertyType(property: arkts.ClassProperty): string {
  return property.typeAnnotation.dumpSrc();
}

export function getClassPropertyAnnotationNames(
  property: arkts.ClassProperty,
): string[] {
  return property.annotations.map((annotation) =>
    getAnnotationName(annotation),
  );
}

export function isPublicClassProperty(property: arkts.ClassProperty): boolean {
  // todo 使用接口实现
  return property.modifiers === PUBLIC_PROPERTY_MODIFIERS;
}

export function isPrivateClassProperty(property: arkts.ClassProperty): boolean {
  // todo 使用接口实现
  return property.modifiers === PRIVATE_PROPERTY_MODIFIERS;
}

export function isProtectedlassProperty(property: arkts.ClassProperty): boolean {
  // todo 使用接口实现
  return property.modifiers === PROTECTED_PROPERTY_MODIFIERS;
}

export function listToString(strList: string[]): string {
  return strList.length > 1 ? `${strList.slice(0, -1).join(', ')} and ${strList.slice(-1)}` : strList.join('');
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
  return (annoArray || []).some(anno =>
    anno.expr && getIdentifierName(anno.expr) === annotationName
  );
}

interface ComponentJson {
  name: string;
  atomic?: boolean;
  attrs: string[];
  single?: boolean;
  parents?: string[];
  children?: string[];
}

export function getUIComponents(dirPath: string): UISyntaxRuleComponents {
  const absolutePath = path.resolve(__dirname, dirPath);
  let builtInAttributes: string[] = [];
  let containerComponents: string[] = [];
  let atomicComponents: string[] = [];
  let singleChildComponents: string[] = [];
  let validParentComponent: Map<string, string[]> = new Map();
  let validChildComponent: Map<string, string[]> = new Map();

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Directory does not exist: ${absolutePath}`);
  }
  // Read all files in the directory
  const files = fs.readdirSync(absolutePath);

  files.forEach(file => {
    if (path.extname(file) === '.json') {
      const filePath = path.join(absolutePath, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const componentJson: ComponentJson = JSON.parse(fileContent);
      // Record the container component name
      if ((!componentJson.atomic || componentJson.atomic !== true) && (componentJson.name)) {
        containerComponents.push(componentJson.name);
      }
      // Record the atomic component name
      if (componentJson.atomic && componentJson.atomic === true && componentJson.name) {
        atomicComponents.push(componentJson.name);
      }
      // Record the name of a single subcomponent component name
      if (componentJson.single && componentJson.single === true && componentJson.name) {
        singleChildComponents.push(componentJson.name);
      }
      // Record a valid parent component name
      if (componentJson.parents && componentJson.name) {
        validParentComponent.set(componentJson.name, componentJson.parents);
      }
      // Record a valid children component name
      if (componentJson.children && componentJson.name) {
        validChildComponent.set(componentJson.name, componentJson.children);
      }
      // Document all built-in attributes
      componentJson.attrs?.filter(attr => !builtInAttributes.includes(attr))
        .forEach(attr => builtInAttributes.push(attr));
    }
  });
  const componentsInfo: UISyntaxRuleComponents = {
    builtInAttributes,
    containerComponents,
    atomicComponents,
    singleChildComponents,
    validParentComponent,
    validChildComponent,
  };

  return componentsInfo;
}

export function isBuiltInAttribute(context: UISyntaxRuleContext, attributeName: string): boolean {
  return context.componentsInfo.builtInAttributes.includes(attributeName);
}
export function isBuildInComponent(context: UISyntaxRuleContext, componentName: string): boolean {
  return context.componentsInfo.containerComponents.includes(componentName) ||
    context.componentsInfo.atomicComponents.includes(componentName);
}

export function isAtomicComponent(context: UISyntaxRuleContext, componentName: string): boolean {
  return context.componentsInfo.atomicComponents.includes(componentName);
}

export function isContainerComponent(context: UISyntaxRuleContext, componentName: string): boolean {
  return context.componentsInfo.containerComponents.includes(componentName);
}

export function isSingleChildComponent(context: UISyntaxRuleContext, componentName: string): boolean {
  return context.componentsInfo.singleChildComponents.includes(componentName);
}