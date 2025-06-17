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
    ANIMATABLE_EXTEND = 'AnimatableExtend'
}

export enum DecoratorIntrinsicNames {
    LINK = '__Link_intrinsic',
}

export enum StateManagementTypes {
    STATE_MANAGEMENT_FACTORY = 'STATE_MGMT_FACTORY',
    STATE_DECORATED = 'IStateDecoratedVariable',
    LINK_DECORATED = 'ILinkDecoratedVariable',
    LINK_SOURCE_TYPE = 'LinkSourceType',
    STORAGE_LINK_DECORATED = 'IStorageLinkDecoratedVariable',
    STORAGE_PROP_DECORATED = 'IStoragePropDecoratedVariable',
    PROP_DECORATED = 'IPropDecoratedVariable',
    MUTABLE_STATE = 'MutableState',
    SYNCED_PROPERTY = 'SyncedProperty',
    PROVIDE_DECORATED = 'IProvideDecoratedVariable',
    CONSUME_DECORATED = 'IConsumeDecoratedVariable',
    OBJECT_LINK_DECORATED = 'IObjectLinkDecoratedVariable',
    MUTABLE_STATE_META = 'IMutableStateMeta',
    OBSERVED_OBJECT = 'IObservedObject',
    WATCH_ID_TYPE = 'WatchIdType',
    RENDER_ID_TYPE = 'RenderIdType',
    OBSERVE = 'OBSERVE',
    META = '__meta',
    SUBSCRIBED_WATCHES = 'ISubscribedWatches',
    STORAGE_LINK_STATE = 'StorageLinkState',
    OBSERVABLE_PROXY = 'observableProxy',
    PROP_STATE = 'propState',
    UPDATE = 'update',
    MAKE_STATE = 'makeState',
    MAKE_LINK = 'makeLink',
    MAKE_PROP = 'makeProp',
    MAKE_STORAGE_PROP = 'makeStorageProp',
    MAKE_STORAGE_LINK = 'makeStorageLink',
    MAKE_PROVIDE = 'makeProvide',
    MAKE_CONSUME = 'makeConsume',
    MAKE_OBJECT_LINK = 'makeObjectLink',
    MAKE_SUBSCRIBED_WATCHES = 'makeSubscribedWatches',
    MAKE_MUTABLESTATE_META = 'makeMutableStateMeta',
}

export enum AnimationNames {
    ANIMATABLE_ARITHMETIC = 'AnimatableArithmetic',
    CREATE_OR_SET_ANIMATABLEPROPERTY = '__createOrSetAnimatableProperty',
    ANIMATION = 'animation',
    ANIMATION_START = 'animationStart',
    ANIMATION_STOP = 'animationStop',
}

export const DECORATOR_TYPE_MAP = new Map<DecoratorNames, StateManagementTypes>([
    [DecoratorNames.STATE, StateManagementTypes.STATE_DECORATED],
    [DecoratorNames.LINK, StateManagementTypes.LINK_SOURCE_TYPE],
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
    [DecoratorNames.STATE, [StateManagementTypes.STATE_DECORATED, StateManagementTypes.STATE_MANAGEMENT_FACTORY]],
    [DecoratorNames.LINK, [StateManagementTypes.LINK_DECORATED, StateManagementTypes.LINK_SOURCE_TYPE, StateManagementTypes.STATE_MANAGEMENT_FACTORY]],
    [DecoratorNames.PROP, [StateManagementTypes.PROP_DECORATED, StateManagementTypes.STATE_MANAGEMENT_FACTORY]],
    [DecoratorNames.PROVIDE, [StateManagementTypes.PROVIDE_DECORATED, StateManagementTypes.STATE_MANAGEMENT_FACTORY]],
    [DecoratorNames.CONSUME, [StateManagementTypes.CONSUME_DECORATED, StateManagementTypes.STATE_MANAGEMENT_FACTORY]],
    [DecoratorNames.STORAGE_PROP, [StateManagementTypes.STORAGE_PROP_DECORATED, StateManagementTypes.STATE_MANAGEMENT_FACTORY]],
    [DecoratorNames.STORAGE_LINK, [StateManagementTypes.STORAGE_LINK_DECORATED, StateManagementTypes.STATE_MANAGEMENT_FACTORY]],
    [DecoratorNames.OBJECT_LINK, [StateManagementTypes.OBJECT_LINK_DECORATED, StateManagementTypes.STATE_MANAGEMENT_FACTORY]],
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
            StateManagementTypes.OBSERVED_OBJECT,
            StateManagementTypes.WATCH_ID_TYPE,
            StateManagementTypes.RENDER_ID_TYPE,
            StateManagementTypes.OBSERVE,
            StateManagementTypes.SUBSCRIBED_WATCHES,
            StateManagementTypes.STATE_MANAGEMENT_FACTORY
        ],
    ],
    [
        DecoratorNames.TRACK,
        [
            StateManagementTypes.MUTABLE_STATE_META,
            StateManagementTypes.OBSERVED_OBJECT,
            StateManagementTypes.WATCH_ID_TYPE,
            StateManagementTypes.RENDER_ID_TYPE,
            StateManagementTypes.OBSERVE,
            StateManagementTypes.SUBSCRIBED_WATCHES,
            StateManagementTypes.STATE_MANAGEMENT_FACTORY
        ],
    ],
    [DecoratorNames.ANIMATABLE_EXTEND, [AnimationNames.ANIMATABLE_ARITHMETIC]]
]);

/**
 * @deprecated
 */
export const IMPORT_SOURCE_MAP_V2: Map<string, string> = new Map<string, string>([
    [Dollars.TRANSFORM_DOLLAR_RESOURCE, 'arkui.component.resources'],
    [Dollars.TRANSFORM_DOLLAR_RAWFILE, 'arkui.component.resources'],
    [StateManagementTypes.MUTABLE_STATE, 'arkui.stateManagement.runtime'],
    [StateManagementTypes.SYNCED_PROPERTY, 'arkui.stateManagement.runtime'],
    [StateManagementTypes.STORAGE_LINK_STATE, 'arkui.stateManagement.runtime'],
    [StateManagementTypes.OBSERVABLE_PROXY, 'arkui.stateManagement.runtime'],
    [StateManagementTypes.PROP_STATE, 'arkui.stateManagement.runtime'],
    [AnimationNames.ANIMATABLE_ARITHMETIC, 'arkui.component.common']
]);

export enum GetSetTypes {
    GET = 'get',
    SET = 'set',
}