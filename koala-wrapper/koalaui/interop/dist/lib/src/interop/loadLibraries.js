"use strict";
/*
 * Copyright (c) 2022-2025 Huawei Device Co., Ltd.
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

Object.defineProperty(exports, "__esModule", { value: true });
exports.loadNativeModuleLibrary = exports.registerNativeModuleLibraryName = exports.loadNativeLibrary = void 0;
const nativeModuleLibraries = new Map();
function loadNativeLibrary(name) {
    if (globalThis.requireNapi)
        return globalThis.requireNapi(name, true);
    else {
        const suffixedName = name.endsWith(".node") ? name : `${name}.node`;
        return require(suffixedName)
    }
}
exports.loadNativeLibrary = loadNativeLibrary;
function registerNativeModuleLibraryName(nativeModule, libraryName) {
    nativeModuleLibraries.set(nativeModule, libraryName);
}
exports.registerNativeModuleLibraryName = registerNativeModuleLibraryName;
function loadNativeModuleLibrary(moduleName, module) {
    var _a;
    if (!module)
        throw new Error("<module> argument is required and optional only for compatibility with ArkTS");
    const library = loadNativeLibrary((_a = nativeModuleLibraries.get(moduleName)) !== null && _a !== void 0 ? _a : moduleName);
    if (!library || !library[moduleName]) {
        console.error(`Failed to load library for module ${moduleName}`);
        return;
    }
    Object.assign(module, library[moduleName]);
}
exports.loadNativeModuleLibrary = loadNativeModuleLibrary;
//# sourceMappingURL=loadLibraries.js.map