# 功能概述
`ForEach` 数组渲染转换为 `ForEach.create()` / `forEachItemGenFunction` / `forEachUpdateFunction` / `ForEach.pop()` 命令式结构。

## 动态
### 源码参考位置
- `compiler/src/process_component_build.ts:1703`（`processForEachComponent`，Legacy）
- `compiler/src/process_component_build.ts:1759`（`processForEachComponentNew`，Partial Update）
- `compiler/src/process_component_build.ts:1812`（`createItemGenFunctionStatement`）
- `compiler/src/process_component_build.ts:1890`（`createItemIdFuncStatement`）
- `compiler/src/process_component_build.ts:1910`（`createUpdateFunctionStatement`）
- `compiler/src/pre_define.ts:198`（`COMPONENT_FOREACH = 'ForEach'`）
- `compiler/src/pre_define.ts:624`（`FOREACHITEMGENFUNCTION = 'forEachItemGenFunction'`）
- `compiler/src/pre_define.ts:628`（`FOREACHUPDATEFUNCTION = 'forEachUpdateFunction'`）

### 转换前的原始代码
```typescript
ForEach(this.arr, (item: string) => {
  Text(item)
}, (item: string) => item)
```

### 转换后的代码（Legacy）
```typescript
ForEach.create()
const forEachItemGenFunction = (item: string) => {
  Text.create(item)
  Text.pop()
}
ForEach.forEachItemGenFunction(forEachItemGenFunction, (item: string) => item)
ForEach.pop()
```

### 转换后的代码（Partial Update）
```typescript
ForEach.create()
const forEachItemGenFunction = (item: string) => {
  this.observeComponentCreation2((elmtId, isInitialRender) => {
    Text.create(item)
    if (!isInitialRender) { Text.pop() }
  }, Text)
}
const forEachItemIdFunc = (item: string) => item
this.observeComponentCreation2((elmtId, isInitialRender) => {
  this.forEachUpdateFunction(elmtId, ObservedObject.GetRawObject(this.arr),
    forEachItemGenFunction, forEachItemIdFunc, true, false)
  if (!isInitialRender) { ForEach.pop() }
}, ForEach)
```

### 关键转换逻辑
- `processForEachComponentNew`（line 1759-1805）：
  - `collectForEachAttribute`（line 1734）：分离属性链和核心调用
  - `createItemGenFunctionStatement`（line 1812-1844）：生成 `forEachItemGenFunction` 变量
  - `createItemIdFuncStatement`（line 1890）：生成 key 函数变量
  - `createUpdateFunctionStatement`（line 1910）：生成 `forEachUpdateFunction` 调用
- 数据源包装：`ObservedObject.GetRawObject(arr)`（line 1716-1721），仅 V1 非 V2 兼容时（`isNeedGetRawObject`）
- 结构：`[propertyNode, ...attributeList, itemGenFunctionStatement, updateFunctionStatement]`

## 静态
### 源码参考位置
- `arkui-plugins/common/predefines.ts:179`（`InnerComponentNames.FOR_EACH = 'ForEach'`）
- `arkui-plugins/collectors/ui-collectors/records/inner-component-function.ts:170`（`isForEach`）
- `arkui-plugins/ui-plugins/builder-lambda-translators/factory.ts:890`（`processModifiedArg`）

### 转换前的原始代码
同动态工具链

### 转换后的代码
ForEach 作为 `@ComponentBuilder` 装饰的函数调用保留在 builder lambda 体中，第一个参数（数组）被包成 `() => arr` 箭头函数（用于 memoable 推断和延迟计算）。

### 关键转换逻辑
- `isForEach`（line 170-173）：判定 `name === 'ForEach' && externalSourceName === 'arkui.component.forEach'`
- 参数预处理（line 207-219）：ForEach 第一个参数被改写为 lambda 类型
- `processModifiedArg`（factory.ts:896-908）：将第一参数包成 `() => modifiedArg` 箭头函数

## 接口声明交叉验证

### @ComponentBuilder vs @Builder 双形式

ForEach 在 SDK 声明文件 `forEach.static.d.ets` 中有两个重载形式：

| 形式 | 装饰器 | 用途 | 调用方式 |
|---|---|---|---|
| 数据形式 | `@ComponentBuilder` | 作为顶层组件调用 | `ForEach(arr, ...) { }` |
| 样式形式 | `@Builder` | 作为链式属性调用 | `Column().forEach(...)` |

两种形式参数相同（`arr`、`itemGenerator`、`keyGenerator?`），返回类型均为 `ForEachInterface`。

**设计意图**：同一组件有两种重载形式，`@ComponentBuilder` 用于作为顶层组件调用，`@Builder` 用于作为属性链式调用。动态工具链不区分双形式，通过 `processForEachComponent` 统一处理；静态工具链通过声明文件重载区分。

## 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| ForEach 处理方式 | 视为控制流组件，生成 create/pop 命令式调用 | 视为 @ComponentBuilder 函数调用 |
| itemGenerator | 提取为 `forEachItemGenFunction` 变量 | 保留为箭头函数参数 |
| keyGenerator | 提取为 `forEachItemIdFunc` 变量 | 保留为箭头函数参数 |
| updateFunction | Partial Update 模式生成 `forEachUpdateFunction` 调用 | 无此机制 |
| 数据源包装 | `ObservedObject.GetRawObject(arr)` | 第一参数包成 `() => arr` |
