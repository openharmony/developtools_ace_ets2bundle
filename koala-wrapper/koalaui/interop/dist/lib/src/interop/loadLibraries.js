"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadNativeModuleLibrary = exports.registerNativeModuleLibraryName = exports.loadNativeLibrary = void 0;
const nativeModuleLibraries = new Map();
function loadNativeLibrary(name) {
    if (globalThis.requireNapi)
        return globalThis.requireNapi(name, true);
    else {
        const suffixedName = name.endsWith(".node") ? name : `${name}.node`;
        return eval(`let exports = {}; process.dlopen({ exports }, require.resolve("${suffixedName}"), 2); exports`);
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