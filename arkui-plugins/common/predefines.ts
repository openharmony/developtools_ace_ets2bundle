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

export const ARKUI_IMPORT_PREFIX_NAMES: (string | RegExp)[] = [/arkui\..*/, /@ohos\..*/, /@kit\..*/];

export const MEMO_IMPORT_SOURCE_NAME: string = 'arkui.stateManagement.runtime';
export const CUSTOM_COMPONENT_IMPORT_SOURCE_NAME: string = 'arkui.component.customComponent';
export const ENTRY_POINT_IMPORT_SOURCE_NAME: string = 'arkui.UserView';
export const ARKUI_COMPONENT_COMMON_SOURCE_NAME: string = 'arkui.component.common';

export enum Dollars {
    DOLLAR_RESOURCE = '$r',
    DOLLAR_RAWFILE = '$rawfile',
    DOLLAR_DOLLAR = '$$',
    TRANSFORM_DOLLAR_RESOURCE = '_r',
    TRANSFORM_DOLLAR_RAWFILE = '_rawfile',
}

export enum BindableDecl {
    BINDABLE = 'Bindable',
}

export enum StructDecoratorNames {
    ENTRY = 'Entry',
    COMPONENT = 'Component',
    RESUABLE = 'Reusable',
}

export enum DecoratorNames {
    STATE = 'State',
    STORAGE_LINK = 'StorageLink',
    STORAGE_PROP = 'StorageProp',
    LINK = 'Link',
    PROP = 'Prop',
    PROVIDE = 'Provide',
    CONSUME = 'Consume',
    OBJECT_LINK = 'ObjectLink',
    OBSERVED = 'Observed',
    WATCH = 'Watch',
    BUILDER_PARAM = 'BuilderParam',
    BUILDER = 'Builder',
    CUSTOM_DIALOG = 'CustomDialog',
    LOCAL_STORAGE_PROP = 'LocalStorageProp',
    LOCAL_STORAGE_LINK = 'LocalStorageLink',
    REUSABLE = 'Reusable',
    TRACK = 'Track',
}

export enum DecoratorIntrinsicNames {
    LINK = '__Link_intrinsic',
}

export enum StateManagementTypes {
    STATE_DECORATED = 'StateDecoratedVariable',
    LINK_DECORATED = 'LinkDecoratedVariable',
    STORAGE_LINK_DECORATED = 'StorageLinkDecoratedVariable',
    STORAGE_PROP_DECORATED = 'StoragePropDecoratedVariable',
    DECORATED_V1 = 'DecoratedV1VariableBase',
    PROP_DECORATED = 'PropDecoratedVariable',
    MUTABLE_STATE = 'MutableState',
    MUTABLE_STATE_META = 'MutableStateMeta',
    SYNCED_PROPERTY = 'SyncedProperty',
    PROVIDE_DECORATED = 'ProvideDecoratedVariable',
    CONSUME_DECORATED = 'ConsumeDecoratedVariable',
    OBJECT_LINK_DECORATED = 'ObjectLinkDecoratedVariable',
    BACKING_VALUE = 'BackingValue',
    SET_OBSERVATION_DEPTH = 'setObservationDepth',
    OBSERVED_OBJECT = 'IObservedObject',
    WATCH_ID_TYPE = 'WatchIdType',
    SUBSCRIBED_WATCHES = 'SubscribedWatches',
    STORAGE_LINK_STATE = 'StorageLinkState',
    OBSERVABLE_PROXY = 'observableProxy',
    PROP_STATE = 'propState',
    INT_32 = 'int32',
}

export const DECORATOR_TYPE_MAP = new Map<DecoratorNames, StateManagementTypes>([
    [DecoratorNames.STATE, StateManagementTypes.STATE_DECORATED],
    [DecoratorNames.LINK, StateManagementTypes.DECORATED_V1],
    [DecoratorNames.PROP, StateManagementTypes.PROP_DECORATED],
    [DecoratorNames.STORAGE_LINK, StateManagementTypes.STORAGE_LINK_DECORATED],
    [DecoratorNames.STORAGE_PROP, StateManagementTypes.STORAGE_PROP_DECORATED],
    [DecoratorNames.LOCAL_STORAGE_PROP, StateManagementTypes.SYNCED_PROPERTY],
    [DecoratorNames.LOCAL_STORAGE_LINK, StateManagementTypes.MUTABLE_STATE],
    [DecoratorNames.OBJECT_LINK, StateManagementTypes.OBJECT_LINK_DECORATED],
    [DecoratorNames.PROVIDE, StateManagementTypes.PROVIDE_DECORATED],
    [DecoratorNames.CONSUME, StateManagementTypes.CONSUME_DECORATED],
]);

export const INTERMEDIATE_IMPORT_SOURCE: Map<string, string[]> = new Map<string, string[]>([
    [Dollars.DOLLAR_RESOURCE, [Dollars.TRANSFORM_DOLLAR_RESOURCE]],
    [Dollars.DOLLAR_RAWFILE, [Dollars.TRANSFORM_DOLLAR_RAWFILE]],
    [Dollars.DOLLAR_DOLLAR, [BindableDecl.BINDABLE]],
    [DecoratorNames.STATE, [StateManagementTypes.STATE_DECORATED]],
    [DecoratorNames.LINK, [StateManagementTypes.LINK_DECORATED, StateManagementTypes.DECORATED_V1]],
    [DecoratorNames.PROP, [StateManagementTypes.PROP_DECORATED]],
    [DecoratorNames.PROVIDE, [StateManagementTypes.PROVIDE_DECORATED]],
    [DecoratorNames.CONSUME, [StateManagementTypes.CONSUME_DECORATED]],
    [DecoratorNames.STORAGE_PROP, [StateManagementTypes.STORAGE_PROP_DECORATED]],
    [DecoratorNames.STORAGE_LINK, [StateManagementTypes.STORAGE_LINK_DECORATED]],
    [DecoratorNames.OBJECT_LINK, [StateManagementTypes.OBJECT_LINK_DECORATED]],
    [
        DecoratorNames.LOCAL_STORAGE_LINK,
        [
            StateManagementTypes.STORAGE_LINK_STATE,
            StateManagementTypes.MUTABLE_STATE,
            StateManagementTypes.OBSERVABLE_PROXY,
        ],
    ],
    [
        DecoratorNames.LOCAL_STORAGE_PROP,
        [
            StateManagementTypes.STORAGE_LINK_STATE,
            StateManagementTypes.SYNCED_PROPERTY,
            StateManagementTypes.OBSERVABLE_PROXY,
            StateManagementTypes.PROP_STATE,
        ],
    ],
    [
        DecoratorNames.OBSERVED,
        [
            StateManagementTypes.MUTABLE_STATE_META,
            StateManagementTypes.BACKING_VALUE,
            StateManagementTypes.SET_OBSERVATION_DEPTH,
            StateManagementTypes.OBSERVED_OBJECT,
            StateManagementTypes.INT_32,
            StateManagementTypes.WATCH_ID_TYPE,
            StateManagementTypes.SUBSCRIBED_WATCHES,
        ],
    ],
    [
        DecoratorNames.TRACK,
        [
            StateManagementTypes.MUTABLE_STATE_META,
            StateManagementTypes.BACKING_VALUE,
            StateManagementTypes.SET_OBSERVATION_DEPTH,
            StateManagementTypes.OBSERVED_OBJECT,
            StateManagementTypes.INT_32,
            StateManagementTypes.WATCH_ID_TYPE,
            StateManagementTypes.SUBSCRIBED_WATCHES,
        ],
    ],
]);

/**
 * @deprecated
 */
export const IMPORT_SOURCE_MAP_V2: Map<string, string> = new Map<string, string>([
    [Dollars.TRANSFORM_DOLLAR_RESOURCE, 'arkui.component.resources'],
    [Dollars.TRANSFORM_DOLLAR_RAWFILE, 'arkui.component.resources'],
    [StateManagementTypes.STATE_DECORATED, 'arkui.stateManagement.decorators.decoratorState'],
    [StateManagementTypes.LINK_DECORATED, 'arkui.stateManagement.decorators.decoratorLink'],
    [StateManagementTypes.STORAGE_LINK_DECORATED, 'arkui.stateManagement.decorators.decoratorStorageLink'],
    [StateManagementTypes.STORAGE_PROP_DECORATED, 'arkui.stateManagement.decorators.decoratorStorageProp'],
    [StateManagementTypes.DECORATED_V1, 'arkui.stateManagement.base.decoratorBase'],
    [StateManagementTypes.PROP_DECORATED, 'arkui.stateManagement.decorators.decoratorProp'],
    [StateManagementTypes.MUTABLE_STATE, 'arkui.stateManagement.runtime'],
    [StateManagementTypes.MUTABLE_STATE_META, 'arkui.stateManagement.base.mutableStateMeta'],
    [StateManagementTypes.SYNCED_PROPERTY, 'arkui.stateManagement.runtime'],
    [StateManagementTypes.PROVIDE_DECORATED, 'arkui.stateManagement.decorators.decoratorProvide'],
    [StateManagementTypes.CONSUME_DECORATED, 'arkui.stateManagement.decorators.decoratorConsume'],
    [StateManagementTypes.OBJECT_LINK_DECORATED, 'arkui.stateManagement.decorators.decoratorObjectLink'],
    [StateManagementTypes.BACKING_VALUE, 'arkui.stateManagement.base.backingValue'],
    [StateManagementTypes.SET_OBSERVATION_DEPTH, 'arkui.stateManagement.base.iObservedObject'],
    [StateManagementTypes.OBSERVED_OBJECT, 'arkui.stateManagement.base.iObservedObject'],
    [StateManagementTypes.WATCH_ID_TYPE, 'arkui.stateManagement.decorators.decoratorWatch'],
    [StateManagementTypes.SUBSCRIBED_WATCHES, 'arkui.stateManagement.decorators.decoratorWatch'],
    [StateManagementTypes.STORAGE_LINK_STATE, 'arkui.stateManagement.runtime'],
    [StateManagementTypes.OBSERVABLE_PROXY, 'arkui.stateManagement.runtime'],
    [StateManagementTypes.PROP_STATE, 'arkui.stateManagement.runtime'],
    [StateManagementTypes.INT_32, '@koalaui.runtime.common'],
]);
