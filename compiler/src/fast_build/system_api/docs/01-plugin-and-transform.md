# 01 - 插件入口与系统 API 变换

> 文件：`rollup-plugin-system-api.ts`

---

## 1. 插件概述

`apiTransform` 是 Rollup 插件链第 6 位插件，负责：

1. **系统 API 导入变换**：将 `@ohos.xxx`、`@arkui-x.xxx` 等系统模块导入变换为运行时 `globalThis.requireNapi()` 调用
2. **libso 变换**：将 `libxxx.so` 导入变换为 `globalThis.requireNapi()` 调用
3. **模块收集**：收集每个文件导入的系统模块，写入 `module_collection.json`
4. **组件收集**：收集每个文件使用的内置组件，写入 `component_collection.json`
5. **Kit 模块替换**：将 Kit 导入替换为实际模块路径
6. **跨平台模块合并**：合并跨平台外部模块到收集结果

---

## 2. 插件生命周期

```
buildStart()          判断是否需要模块/组件收集
    │
load(id)              收集所有文件路径到 allFiles
    │
transform(code, id)   系统 API 变换 + libso 变换 + sourceMap 生成
    │
beforeBuildEnd()      组件收集 + 跨平台组件合并 + 写入 component_collection.json
    │
buildEnd()            模块收集 + kit 替换 + 跨平台模块合并 + 写入 module_collection.json + 写入 useOSFiles
    │
cleanUp()             清理 allFiles / appImportModuleCollection / useOSFiles / kitModules
```

### 2.1 buildStart

```typescript
buildStart(): void {
  // 跨平台：需要模块收集 + 组件收集
  // 卡片编译：仅需要组件收集
  // 普通编译：都不需要
}
```

### 2.2 transform 核心逻辑

```typescript
transform(code, id) {
  // 1. 判断是否需要发射 JS
  //    - .js 文件需要
  //    - shouldEmitJsFlagById 返回 true 需要
  //    - compileMode !== 'esmodule' 需要
  //    - 跨平台/卡片编译需要
  //
  // 2. 根据编译模式选择变换路径：
  //    - esmodule:  processSystemApiAndLibso (保留 import 语法，仅收集 + 规范化)
  //    - 非esmodule:       processSystemApi + processLibso (替换为 var xxx = requireNapi(...))
  //
  // 3. 仅在 shouldEmitJsFlag 时返回变换结果（含 sourceMap）
}
```

**关键分支判断**：

| 条件 | 行为 |
|------|------|
| `!shouldEmitJsFlag && !isCrossplatform && !widgetCompile` | 跳过变换（return null） |
| `compileMode === 'esmodule'` | `processSystemApiAndLibso` |
| `compileMode !== 'esmodule'` | `processSystemApi` + `processLibso` |

---

## 3. 系统 API 变换

### 3.1 processSystemApi（非 esmodule 模式）

将 `import xxx from '@ohos.yyy'` 替换为 `var xxx = globalThis.requireNapi('yyy')`。

**正则匹配两种导入形式**：
- `import xxx from '@ohos.yyy'`
- `import xxx = require('@ohos.yyy')`

**变换规则**：

```typescript
// 原始: import network from '@ohos.net.connection'
// 变换: var network = globalThis.requireNapi('net.connection')

// 原始: import xxx from '@arkui-x.yyy'
// 变换: var xxx = globalThis.requireNapi('yyy', false, '', 'arkui-x')
```

**三种情况**：
1. `NATIVE_MODULE` 中有该模块 → `globalThis.requireNativeModule('moduleType.key')`
2. SDK 配置中有该前缀 → `globalThis.requireNapi('key')` 或 `globalThis.requireNapi('key', false, '', 'moduleType')`（扩展模块）
3. 都不在 → 保持原样（可能报错）

### 3.2 processSystemApiAndLibso（esmodule 模式）

保留 `import` 语法，仅做规范化：
- `import xxx = require('@ohos.yyy')` → `import xxx from '@ohos.yyy'`（统一为 import 语法）
- `import xxx from 'libyyy.so'` → `import xxx from 'libyyy.so'`（保留，后续由打包器处理）

同时收集模块使用信息到 `appImportModuleCollection`。

### 3.3 模块存在性检查

```typescript
function checkModuleExist(systemModule, sourcePath): void {
  // .js 文件中引用的系统模块如果不在 systemModules 列表中，报 BUILDERROR
}
```

---

## 4. libso 变换

### 4.1 processLibso（非 esmodule 模式）

```typescript
// 原始: import xxx from 'libyyy.so'
// 变换: var xxx = globalThis.requireNapi("yyy", true)
//   或: var xxx = globalThis.requireNapi("yyy", true, "bundleName/moduleName")

function processLibso(content, sourcePath, useOSFiles): string {
  // 匹配: import xxx from 'libyyy.so'  或  import xxx = require('libyyy.so')
  // 变换为 globalThis.requireNapi 调用
  // 同时将 sourcePath 加入 useOSFiles（供 preview 模式使用）
}
```

### 4.2 esmodule 模式

`processSystemApiAndLibso` 中对 libso 仅保留原样，不替换为 `requireNapi`。

---

## 5. 模块收集

### 5.1 数据结构

```typescript
// 文件 -> 该文件导入的系统模块集合
export const appImportModuleCollection: Map<string, Set<string>> = new Map();
// 示例: { "/src/main/ets/pages/Index.ets": Set{ "ohos.network", "ohos.deviceInfo" } }

// kit 文件 -> (kit key -> 实际模块集合)
export const kitModules: Map<string, Map<string, Set<string>>> = new Map();
```

### 5.2 收集时机

在 `processSystemApi` / `processSystemApiAndLibso` 中，正则匹配到系统模块导入时：
```typescript
appImportModuleCollection.get(path.join(sourcePath)).add(systemModule);
// systemModule 格式: "moduleType.key"，如 "ohos.network"
```

### 5.3 Kit 模块替换

```typescript
function replaceKitModules(): void {
  // 遍历 appImportModuleCollection
  // 如果某文件路径与 kitModules 中的 key 匹配
  // 则将该文件导入的 kit 模块名替换为 kit 实际包含的模块列表
}
```

**`collectKitModules`**（外部调用）：收集 kit 文件中 key->value 的映射关系。

### 5.4 跨平台模块合并

```typescript
function mergeModuleOrComponentCollection(type): void {
  // 遍历 crossplatformExternalModule
  // 按路径匹配合并到 appImportModuleCollection 或 appComponentCollection
  // 路径匹配使用 isSamePath（规范化后比较）
}
```

### 5.5 写入收集文件

在 `buildEnd` / `beforeBuildEnd` 中调用 `writeCollectionFile`：
- `module_collection.json`：模块使用信息
- `component_collection.json`：组件使用信息

仅在全量编译（非 watch 模式）且非 xts 模式，且 `needModuleCollection` / `needComponentCollection` 为 true 时写入。

---

## 6. useOSFiles

```typescript
function buildEnd(): void {
  // preview 模式下，如果有 useOSFiles，写入文件
  if (projectConfig.isPreview && projectConfig.aceSoPath && useOSFiles.size > 0) {
    writeUseOSFiles(useOSFiles);
  }
}
```

`useOSFiles` 记录了使用了 libso 的源文件路径，供 preview 模式加载原生库。

---

## 7. 关键函数索引

| 函数 | 行号 | 职责 |
|------|------|------|
| `apiTransform()` | :51 | 插件入口，返回 Rollup 插件对象 |
| `processSystemApi()` | :141 | 非 esmodule：系统 API 导入 -> requireNapi |
| `processLibso()` | :198 | 非 esmodule：libso 导入 -> requireNapi |
| `processSystemApiAndLibso()` | :213 | esmodule：规范化导入语法 + 收集 |
| `checkModuleExist()` | :189 | 检查 .js 文件中系统模块是否存在 |
| `checkModuleType()` | :179 | 判断模块类型是否在 SDK 配置中 |
| `isExtendModuleType()` | :169 | 判断是否为扩展 SDK 模块 |
| `collectKitModules()` | :246 | 收集 kit 模块映射（外部调用） |
| `replaceKitModules()` | :281 | 将 kit 导入替换为实际模块 |
| `mergeModuleOrComponentCollection()` | :304 | 合并跨平台模块/组件收集 |

---

## 8. 注意事项

1. **`sdkConfigPrefix`**：系统模块前缀（通常为 `ohos`），来自全局配置
2. **`ARKUI_X_PLUGIN`**：arkui-x 前缀特殊处理，跨平台相关
3. **sourceMap 的 hires**：`hasTsNoCheckOrTsIgnoreFiles` 中的文件或非 esmodule 模式使用高精度 sourceMap
4. **`cleanUp` 必须清理**：`allFiles`、`appImportModuleCollection`、`useOSFiles`、`kitModules` 四个局部全局状态
5. **`this.share` 共享数据**：`allFiles` 和 `allComponents` 通过 `this.share` 跨插件共享
