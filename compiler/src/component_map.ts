/*
 * Copyright (c) 2021 Huawei Device Co., Ltd.
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
import ts from 'typescript';

export const COMPONENT_MAP: any = {};

export let COMMON_ATTRS: Set<string> = new Set([]);

(function readComponents() {
  const componentsFile: string = path.join(__dirname, '../components');
  const files: string[] = fs.readdirSync(componentsFile);
  files.forEach(function(item) {
    const fPath: string = path.join(componentsFile, item);
    const json: any = require(fPath);
    const stat: any = fs.statSync(fPath);
    if (stat.isFile()) {
      if (json.name) {
        const compName: string = json.name;
        delete json.name;
        COMPONENT_MAP[compName] = json;
      } else {
        COMMON_ATTRS = new Set(json.attrs);
      }
    }
  });
})();

const TRANSITION_COMMON_ATTRS: Set<string> = new Set([
  'slide', 'translate', 'scale', 'opacity'
]);
export const GESTURE_ATTRS: Set<string> = new Set([
  'gesture', 'parallelGesture', 'priorityGesture'
]);

export const forbiddenUseStateType: Set<string> = new Set(['Scroller', 'SwiperScroller',
  'VideoController', 'WebController', 'CustomDialogController', 'SwiperController',
  'TabsController', 'CalendarController', 'AbilityController', 'XComponentController',
  'CanvasRenderingContext2D', 'CanvasGradient', 'ImageBitmap', 'ImageData', 'Path2D',
  'RenderingContextSettings', 'OffscreenCanvasRenderingContext2D', 'PatternLockController'
]);

export const INNER_COMPONENT_NAMES: Set<string> = new Set();
export const NO_DEBUG_LINE_COMPONENT: Set<string> = new Set();
export const BUILDIN_CONTAINER_COMPONENT: Set<string> = new Set();
export const BUILDIN_STYLE_NAMES: Set<string> = new Set([
  ...COMMON_ATTRS, ...GESTURE_ATTRS, ...TRANSITION_COMMON_ATTRS
]);
export const AUTOMIC_COMPONENT: Set<string> = new Set();
export const SINGLE_CHILD_COMPONENT: Set<string> = new Set();
export const SPECIFIC_CHILD_COMPONENT: Map<string, Set<string>> = new Map();
export const GESTURE_TYPE_NAMES: Set<string> = new Set([
  'TapGesture', 'LongPressGesture', 'PanGesture', 'PinchGesture', 'RotationGesture', 'GestureGroup',
  'SwipeGesture'
]);
export const CUSTOM_BUILDER_METHOD: Set<string> = new Set();
export const INNER_STYLE_FUNCTION: Map<string, ts.Block> = new Map();
export const GLOBAL_STYLE_FUNCTION: Map<string, ts.Block> = new Map();

export interface ExtendParamterInterfance {
  attribute: string,
  parameterCount: number
}
export const EXTEND_ATTRIBUTE: Map<string, Set<string>> = new Map();
export const STYLES_ATTRIBUTE: Set<string> = new Set();

export const INTERFACE_NODE_SET: Set<ts.InterfaceDeclaration> = new Set();

export const JS_BIND_COMPONENTS: Set<string> = new Set([
  'ForEach', 'LazyForEach', ...GESTURE_TYPE_NAMES, 'Gesture',
  'PanGestureOption', 'CustomDialogController', 'Storage', 'Scroller', 'SwiperController',
  'TabsController', 'CalendarController', 'AbilityController', 'VideoController', 'WebController',
  'XComponentController', 'CanvasRenderingContext2D', 'CanvasGradient', 'ImageBitmap', 'ImageData',
  'Path2D', 'RenderingContextSettings', 'OffscreenCanvasRenderingContext2D', 'DatePickerDialog',
  'TextPickerDialog', 'AlertDialog', 'ContextMenu', 'ActionSheet', 'PatternLockController'
]);

export const NEEDPOP_COMPONENT: Set<string> = new Set(['Blank', 'Search']);

export const CUSTOM_BUILDER_PROPERTIES: Set<string> = new Set(['bindPopup', 'bindMenu', 'bindContextMenu', 'title',
  'menus', 'toolBar', 'tabBar', 'onDragStart']);

(function initComponent() {
  Object.keys(COMPONENT_MAP).forEach((componentName) => {
    INNER_COMPONENT_NAMES.add(componentName);
    JS_BIND_COMPONENTS.add(componentName);
    if (!COMPONENT_MAP[componentName].atomic) {
      BUILDIN_CONTAINER_COMPONENT.add(componentName);
    } else {
      AUTOMIC_COMPONENT.add(componentName);
    }
    if (COMPONENT_MAP[componentName].single) {
      SINGLE_CHILD_COMPONENT.add(componentName);
    }
    if (COMPONENT_MAP[componentName].children) {
      SPECIFIC_CHILD_COMPONENT.set(componentName,
        new Set([...COMPONENT_MAP[componentName].children]));
    }
    if (COMPONENT_MAP[componentName].attrs && COMPONENT_MAP[componentName].attrs.length) {
      COMPONENT_MAP[componentName].attrs.forEach((item) => {
        BUILDIN_STYLE_NAMES.add(item);
      });
    }
    if (COMPONENT_MAP[componentName].noDebugLine) {
      NO_DEBUG_LINE_COMPONENT.add(componentName);
    }
  });
})();
