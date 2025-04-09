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

export const EXTERNAL_SOURCE_PREFIX_NAMES: (string | RegExp)[] = [
    'std',
    'escompat',
    'security',
    'application',
    'permissions',
    'bundleManager',
    'commonEvent',
    /@arkts\..*/,
    /@ohos\.(?!arkui).*/,
    /@system\..*/,
    /arkui\.(?!Ark|[Uu]serView$)[A-Z]/, // temporary solution
    /ability\..*/,
];

export const ARKUI_IMPORT_PREFIX_NAMES: (string | RegExp)[] = [/@ohos\..*/, /arkui\..*/];

export const ARKUI_COMPONENT_IMPORT_NAME: string = '@ohos.arkui.component';
export const ARKUI_STATEMANAGEMENT_IMPORT_NAME: string = '@ohos.arkui.stateManagement';
export const KIT_ARKUI_NAME: string = '@kit.ArkUI';

export const KOALAUI_COMMON_IMPORT_NAME: string = '@koalaui.runtime.common';

export const IMPORT_SOURCE_MAP: Map<string, Set<string>> = new Map<string, Set<string>>([
    ['arkui.stateManagement.runtime', new Set(['memo', '__memo_context_type', '__memo_id_type'])]
]);

export const IMPORT_SOURCE_MAP_V2: Map<string, string> = new Map<string, string>([
    ['$r', ARKUI_COMPONENT_IMPORT_NAME],
    ['$rawfile', ARKUI_COMPONENT_IMPORT_NAME],
    ['_r', ARKUI_COMPONENT_IMPORT_NAME],
    ['_rawfile', ARKUI_COMPONENT_IMPORT_NAME],
    ['Bindable', ARKUI_COMPONENT_IMPORT_NAME],
    ['State', ARKUI_STATEMANAGEMENT_IMPORT_NAME],
    ['Prop', ARKUI_STATEMANAGEMENT_IMPORT_NAME],
    ['Provide', ARKUI_STATEMANAGEMENT_IMPORT_NAME],
    ['Consume', ARKUI_STATEMANAGEMENT_IMPORT_NAME],
    ['StorageLink', ARKUI_STATEMANAGEMENT_IMPORT_NAME],
    ['StorageProp', ARKUI_STATEMANAGEMENT_IMPORT_NAME],
    ['LocalStorageLink', ARKUI_STATEMANAGEMENT_IMPORT_NAME],
    ['LocalStorageProp', ARKUI_STATEMANAGEMENT_IMPORT_NAME],
    ['Watch', ARKUI_STATEMANAGEMENT_IMPORT_NAME],
    ['ObjectLink', ARKUI_STATEMANAGEMENT_IMPORT_NAME],
    ['StateDecoratedVariable', ARKUI_STATEMANAGEMENT_IMPORT_NAME],
    ['MutableState', ARKUI_STATEMANAGEMENT_IMPORT_NAME],
    ['contextLocalStateOf', ARKUI_STATEMANAGEMENT_IMPORT_NAME],
    ['contextLocal', ARKUI_STATEMANAGEMENT_IMPORT_NAME],
    ['observableProxy', ARKUI_STATEMANAGEMENT_IMPORT_NAME],
    ['SyncedProperty', ARKUI_STATEMANAGEMENT_IMPORT_NAME],
    ['objectLinkState', ARKUI_STATEMANAGEMENT_IMPORT_NAME],
    ['propState', ARKUI_STATEMANAGEMENT_IMPORT_NAME],
    ['AppStorageLinkState', ARKUI_STATEMANAGEMENT_IMPORT_NAME],
    ['StorageLinkState', ARKUI_STATEMANAGEMENT_IMPORT_NAME],
    ['DecoratedV1VariableBase', ARKUI_STATEMANAGEMENT_IMPORT_NAME],
    ['LinkDecoratedVariable', ARKUI_STATEMANAGEMENT_IMPORT_NAME],
    ['PropDecoratedVariable', ARKUI_STATEMANAGEMENT_IMPORT_NAME],
    ['StorageLinkDecoratedVariable', ARKUI_STATEMANAGEMENT_IMPORT_NAME],
    ['StoragePropDecoratedVariable', ARKUI_STATEMANAGEMENT_IMPORT_NAME],
    ['ProvideDecoratedVariable', ARKUI_STATEMANAGEMENT_IMPORT_NAME],
    ['ConsumeDecoratedVariable', ARKUI_STATEMANAGEMENT_IMPORT_NAME],
    ['ObjectLinkDecoratedVariable', ARKUI_STATEMANAGEMENT_IMPORT_NAME],
    ['MutableStateMeta', ARKUI_STATEMANAGEMENT_IMPORT_NAME],
    ['BackingValue', ARKUI_STATEMANAGEMENT_IMPORT_NAME],
    ['setObservationDepth', ARKUI_STATEMANAGEMENT_IMPORT_NAME],
    ['IObservedObject', ARKUI_STATEMANAGEMENT_IMPORT_NAME],
    ['WatchIdType', ARKUI_STATEMANAGEMENT_IMPORT_NAME],
    ['SubscribedWatches', ARKUI_STATEMANAGEMENT_IMPORT_NAME],
    ['int32', KOALAUI_COMMON_IMPORT_NAME],
]);

export const OUTPUT_DEPENDENCY_MAP: Map<string, string[]> = new Map<string, string[]>([
    ['$r', []],
    ['$rawfile', []],
    ['State', []],
    ['Link', []],
    ['Prop', []],
    ['Provide', []],
    ['Consume', []],
    ['StorageProp', []],
    ['StorageLink', []],
    ['LocalStorageLink', []],
    ['LocalStorageProp', []],
    ['ObjectLink', []],
    ['Observed', []],
    ['Track', []],
    ['$$', []],
]);

export enum InteroperAbilityNames {
    ARKTS_1_1 = '1.1',
    ARKTS_1_2 = '1.2',
    ARKUICOMPATIBLE = 'ArkUICompatible',
    ESVALUE = 'ESValue',
    ELMTID = 'elmtId',
    INITEMPTYOBJECT = 'instantiateEmptyObject',
    SETPROPERTY = 'setProperty',
    NUMBER = 'number',
    PARENT = 'parent',
    INSTANCE = 'instance',
    PARAM = 'param',
    EXTRAINFO = 'extraInfo',
    COMPONENT = 'component',
    GETPROPERTY = 'getProperty',
    CONSTRUCTOR = 'constructor',
    MODULE = 'module',
    LOAD = 'load',
    STRUCTOBJECT = 'structObject',
    INSTANTIATE = 'instantiate',
    WRAP = 'wrap',
    WRAPINT = 'wrapInt',
    WRAPSTRING = 'wrapString',
    PARAMSLAMBDA = 'paramsLambda',
    INTEROPCOMPONENT = 'interopComponent',
    OHMURL = '@normalized:N&entry&com.example.Interop2use1&har1/src/main/ets/components/MainPage&1.0.0',
}
