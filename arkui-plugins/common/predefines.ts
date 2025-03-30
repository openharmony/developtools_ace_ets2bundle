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

export const EXTERNAL_SOURCE_PREFIX_NAMES: string[] = [
    "std",
    "escompat"
];

export const EXTERNAL_SOURCE_ALLOWED_IMPORT_INSERT_NAMES: string[] = [
    "@ohos.arkui"
];

export const IMPORT_SOURCE_MAP: Map<string, Set<string>> = new Map<string, Set<string>>([
    ["@ohos.arkui.component", new Set(["$r", "$rawfile", "ArkReusableStructBase", "Reusable"])],
    ["@ohos.arkui.external", new Set(["_r", "_rawfile"])],
    ["@ohos.arkui.stateManagement", new Set([
        "State",
        "Prop",
        "Provide",
        "Consume",
        "StorageLink",
        "StorageProp",
        "LocalStorageLink",
        "LocalStorageProp",
        "StateDecoratedVariable",
        "MutableState",
        "contextLocalStateOf",
        "contextLocal",
        "observableProxy",
        "SyncedProperty",
        "propState",
        "AppStorageLinkState",
        "DecoratedMutableVariable",
        "LinkDecoratedVariable",
        "PropDecoratedVariable"
    ])]
]);

export const OUTPUT_DEPENDENCY_MAP: Map<string, string[]> = new Map<string, string[]>([
    ["$r", ["_r"]],
    ["$rawfile", ["_rawfile"]],
    ["State", ["StateDecoratedVariable"]],
    ["Link", ["LinkDecoratedVariable", "DecoratedMutableVariable"]],
    ["Prop", ["PropDecoratedVariable"]],
    ["Provide", ["MutableState", "contextLocalStateOf", "observableProxy"]],
    ["Consume", ["MutableState", "contextLocal", "observableProxy"]],
    ["StorageProp", ["SyncedProperty", "AppStorageLinkState", "observableProxy", "propState"]],
    ["Reusable", ["ArkReusableStructBase"]],
]);