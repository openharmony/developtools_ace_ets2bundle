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
    "std",
    "escompat",
    "security",
    "application",
    "permissions",
    "bundleManager",
    "commonEvent",
    /@arkts\..*/,
    /@ohos\.(?!arkui).*/,
    /@system\..*/,
    /arkui\.(?![Uu]serView$)[A-Z]/, // temporary solution
    /ability\..*/,
];

export const ARKUI_COMPONENT_IMPORT_NAME: string = "@ohos.arkui.component";

export const ARKUI_STATEMANAGEMENT_IMPORT_NAME: string = "@ohos.arkui.stateManagement";

export const EXTERNAL_SOURCE_ALLOWED_IMPORT_INSERT_NAMES: string[] = [
    ARKUI_COMPONENT_IMPORT_NAME,
    ARKUI_STATEMANAGEMENT_IMPORT_NAME
];

export const IMPORT_SOURCE_MAP: Map<string, Set<string>> = new Map<string, Set<string>>([
    ["@ohos.arkui.component", new Set(["$r", "$rawfile", "_r", "_rawfile"])],
    ["@ohos.arkui.stateManagement", new Set([
        "State",
        "Prop",
        "Provide",
        "Consume",
        "StorageLink",
        "StorageProp",
        "LocalStorageLink",
        "LocalStorageProp",
        "Watch",
        "ObjectLink",
        "StateDecoratedVariable",
        "MutableState",
        "contextLocalStateOf",
        "contextLocal",
        "observableProxy",
        "SyncedProperty",
        "objectLinkState",
        "propState",
        "AppStorageLinkState",
        "StorageLinkState",
        "DecoratedV1VariableBase",
        "LinkDecoratedVariable",
        "PropDecoratedVariable",
        "StorageLinkDecoratedVariable",
        "StoragePropDecoratedVariable",
        "memo",
        "__memo_context_type",
        "__memo_id_type"
    ])]
]);

export const OUTPUT_DEPENDENCY_MAP: Map<string, string[]> = new Map<string, string[]>([
    ["$r", ["_r"]],
    ["$rawfile", ["_rawfile"]],
    ["State", ["StateDecoratedVariable"]],
    ["Link", ["LinkDecoratedVariable", "DecoratedV1VariableBase"]],
    ["Prop", ["PropDecoratedVariable"]],
    ["Provide", ["MutableState", "contextLocalStateOf", "observableProxy"]],
    ["Consume", ["MutableState", "contextLocal", "observableProxy"]],
    ["StorageProp", ["StoragePropDecoratedVariable"]],
    ["StorageLink", ["StorageLinkDecoratedVariable"]],
    ["LocalStorageLink", ["StorageLinkState", "MutableState", "observableProxy"]],
    ["LocalStorageProp", ["StorageLinkState", "MutableState", "observableProxy", "propState"]],
    ["ObjectLink", ["objectLinkState", "observableProxy", "SyncedProperty"]]
]);