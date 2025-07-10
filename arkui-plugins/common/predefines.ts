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

export const ARKUI_IMPORT_PREFIX_NAMES: (string | RegExp)[] = [/arkui\..*/, /@ohos\..*/, /@kit\..*/];

export const MEMO_IMPORT_SOURCE_NAME: string = 'arkui.stateManagement.runtime';
export const CUSTOM_COMPONENT_IMPORT_SOURCE_NAME: string = 'arkui.component.customComponent';
export const CUSTOM_DIALOG_CONTROLLER_SOURCE_NAME: string = 'arkui.component.customDialogController';
export const ENTRY_POINT_IMPORT_SOURCE_NAME: string = 'arkui.UserView';
export const ARKUI_COMPONENT_COMMON_SOURCE_NAME: string = 'arkui.component.common';
export const ARKUI_FOREACH_SOURCE_NAME: string = 'arkui.component.forEach';

export enum ModuleType {
    HAR = 'har',
    ENTRY = 'entry',
    FEATURE = 'feature',
    SHARED = 'shared',
}

export enum DefaultConfiguration {
    HAR_DEFAULT_MODULE_NAME = '__harDefaultModuleName__',
    HAR_DEFAULT_BUNDLE_NAME = '__harDefaultBundleName__',
    DYNAMIC_MODULE_NAME = '__MODULE_NAME__',
    DYNAMIC_BUNDLE_NAME = '__BUNDLE_NAME__',
}

export enum LogType {
    ERROR = 'ERROR',
    WARN = 'WARN',
}

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
    COMPONENT_V2 = 'ComponentV2',
    RESUABLE = 'Reusable',
    RESUABLE_V2 = 'ReusableV2',
    CUSTOM_LAYOUT = 'CustomLayout',
    CUSTOMDIALOG = 'CustomDialog',
}

export enum EntryWrapperNames {
    ENTRY_FUNC = 'entry',
    WRAPPER_CLASS_NAME = '__EntryWrapper',
    ENTRY_STORAGE_LOCAL_STORAGE_PROPERTY_NAME = '_entry_local_storage_',
    ENTRY_POINT_CLASS_NAME = 'EntryPoint',
    REGISTER_NAMED_ROUTER = 'RegisterNamedRouter',
    ROUTER_NAME = 'routerName',
    INSTANCE = 'instance',
    PARAM = 'param'
}

export enum EntryParamNames {
    ENTRY_STORAGE = 'storage',
    ENTRY_USE_SHARED_STORAGE = 'useSharedStorage',
    ENTRY_ROUTE_NAME = 'routeName'
}

export enum InnerComponentNames {
    FOR_EACH = 'ForEach',
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
    JSONSTRINGIFYIGNORE = 'JSONStringifyIgnore',
    JSONRENAME = 'JSONRename',
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
    STORAGE_PROP_REF_DECORATED = 'IStoragePropRefDecoratedVariable',
    LOCAL_STORAGE_LINK_DECORATED = 'ILocalStorageLinkDecoratedVariable',
    PROP_DECORATED = 'IPropDecoratedVariable',
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
    MAKE_STORAGE_PROP_REF = 'makeStoragePropRef',
    MAKE_STORAGE_LINK = 'makeStorageLink',
    MAKE_LOCAL_STORAGE_LINK = 'makeLocalStorageLink',
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

export enum NavigationNames {
    NAVINTERFACE = 'NavInterface',
    BUNDLE_NAME = 'bundleName',
    MODULE_NAME = 'moduleName',
    PAGE_PATH = 'pagePath',
    PAGE_FULL_PATH = 'pageFullPath',
    INTEGRATED_HSP = 'integratedHsp',
}

export const RESOURCE_TYPE: Record<string, number> = {
    color: 10001,
    float: 10002,
    string: 10003,
    plural: 10004,
    boolean: 10005,
    intarray: 10006,
    integer: 10007,
    pattern: 10008,
    strarray: 10009,
    media: 20000,
    rawfile: 30000,
    symbol: 40000,
};

export const DECORATOR_TYPE_MAP = new Map<DecoratorNames, StateManagementTypes>([
    [DecoratorNames.STATE, StateManagementTypes.STATE_DECORATED],
    [DecoratorNames.LINK, StateManagementTypes.LINK_SOURCE_TYPE],
    [DecoratorNames.PROP, StateManagementTypes.PROP_DECORATED],
    [DecoratorNames.STORAGE_LINK, StateManagementTypes.STORAGE_LINK_DECORATED],
    [DecoratorNames.STORAGE_PROP, StateManagementTypes.STORAGE_PROP_REF_DECORATED],
    [DecoratorNames.LOCAL_STORAGE_PROP, StateManagementTypes.SYNCED_PROPERTY],
    [DecoratorNames.LOCAL_STORAGE_LINK, StateManagementTypes.LOCAL_STORAGE_LINK_DECORATED],
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
    [DecoratorNames.STORAGE_PROP, [StateManagementTypes.STORAGE_PROP_REF_DECORATED, StateManagementTypes.STATE_MANAGEMENT_FACTORY]],
    [DecoratorNames.STORAGE_LINK, [StateManagementTypes.STORAGE_LINK_DECORATED, StateManagementTypes.STATE_MANAGEMENT_FACTORY]],
    [DecoratorNames.OBJECT_LINK, [StateManagementTypes.OBJECT_LINK_DECORATED, StateManagementTypes.STATE_MANAGEMENT_FACTORY]],
    [DecoratorNames.LOCAL_STORAGE_LINK, [StateManagementTypes.LOCAL_STORAGE_LINK_DECORATED, StateManagementTypes.STATE_MANAGEMENT_FACTORY]],
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

export enum GenSymPrefix {
    INTRINSIC = 'gensym%%',
    UI = 'gensym__'
}