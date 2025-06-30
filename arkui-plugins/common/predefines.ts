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
    /ability\..*/,
];

export const EXTERNAL_SOURCE_PREFIX_NAMES_FOR_FRAMEWORK: (string | RegExp)[] = [
    'std',
    'escompat',
    /@arkts\..*/
];

export const ARKUI_COMPONENT_IMPORT_NAME: string = '@ohos.arkui.component';
export const ARKUI_STATEMANAGEMENT_IMPORT_NAME: string = '@ohos.arkui.stateManagement';
export const KIT_ARKUI_NAME: string = '@kit.ArkUI';

export const EXTERNAL_SOURCE_ALLOWED_IMPORT_INSERT_NAMES: string[] = [
    ARKUI_COMPONENT_IMPORT_NAME,
    ARKUI_STATEMANAGEMENT_IMPORT_NAME,
];

export const IMPORT_SOURCE_MAP: Map<string, Set<string>> = new Map<string, Set<string>>([
    ['arkui.stateManagement.runtime', new Set(['memo', '__memo_context_type', '__memo_id_type'])]
]);

export const OUTPUT_DEPENDENCY_MAP: Map<string, string[]> = new Map<string, string[]>([
    ['$r', ['_r']],
    ['$rawfile', ['_rawfile']],
    ['State', ['StateDecoratedVariable']],
    ['Link', ['LinkDecoratedVariable', 'DecoratedV1VariableBase']],
    ['Prop', ['PropDecoratedVariable']],
    ['Provide', ['ProvideDecoratedVariable']],
    ['Consume', ['ConsumeDecoratedVariable']],
    ['StorageProp', ['StoragePropDecoratedVariable']],
    ['StorageLink', ['StorageLinkDecoratedVariable']],
    ['LocalStorageLink', ['StorageLinkState', 'MutableState', 'observableProxy']],
    ['LocalStorageProp', ['StorageLinkState', 'SyncedProperty', 'observableProxy', 'propState']],
    ['ObjectLink', ['ObjectLinkDecoratedVariable']],
    ['Observed', ['MutableStateMeta', 'BackingValue', 'setObservationDepth', 'IObservedObject', 'int32', 'WatchIdType', 'SubscribedWatches']],
    ['Track', ['MutableStateMeta', 'BackingValue', 'setObservationDepth', 'IObservedObject', 'int32', 'WatchIdType', 'SubscribedWatches']],
    ['$$', ['Bindable']],
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
