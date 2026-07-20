# 功能概述
`LazyForEach` 懒加载渲染转换为 `LazyForEach.create()` / `__lazyForEachItemGenFunction` / `__lazyForEachItemIdFunc` 命令式结构，支持懒创建优化。与 `ForEach` 共用 `processForEachComponentNew` 入口，但通过 `checkForEachComponent` 区分后走不同分支：LazyForEach 使用 `ts.factory.createBlock` 包装，生成器函数名带双下划线前缀 `__lazyForEach`，并通过 `optLazyForEach` 选项控制是否追加 `true` 参数启用懒创建。

| 转换规则 | 说明 |
|---|---|
| 共用入口 | `processForEachComponentNew`，与 ForEach 共用 |
| 区分函数 | `checkForEachComponent` 返回 `false` 表示 LazyForEach |
| 生成器函数名 | `__lazyForEachItemGenFunction`（双下划线前缀），非 ForEach 的 `forEachItemGenFunction` |
| ID 函数名 | `__lazyForEachItemIdFunc`（双下划线前缀），非 ForEach 的 `forEachItemIdFunc` |
| Block 包装 | `ts.factory.createBlock([...], true)` 包裹全部语句 |
| create 参数顺序 | `id, this, dataSource, __lazyForEachItemGenFunction, [__lazyForEachItemIdFunc?], [options?], [true?]` |
| optLazyForEach | `projectConfig.optLazyForEach` 为 true 时追加 `true` 参数 |
| 无 updateFunction | LazyForEach 不生成 `forEachUpdateFunction` 调用（ForEach 生成） |
| 依赖追踪 | `storedFileInfo.lazyForEachInfo` 维护 `forEachParameters`、`isDependItem` 状态 |

## 动态
### 源码参考位置
- `compiler/src/process_component_build.ts:1759-1805`（`processForEachComponentNew`，与 ForEach 共用入口）
- `compiler/src/process_component_build.ts:1807-1810`（`checkForEachComponent`，区分 ForEach/LazyForEach）
- `compiler/src/process_component_build.ts:1812-1844`（`createItemGenFunctionStatement`，生成器函数名选择）
- `compiler/src/process_component_build.ts:1890-1908`（`createItemIdFuncStatement`，ID 函数名选择）
- `compiler/src/process_component_build.ts:1910-1922`（`createUpdateFunctionStatement`，ForEach 专属）
- `compiler/src/process_component_build.ts:1958-1984`（`createLazyForEachStatement`，LazyForEach 专属 create 调用）
- `compiler/src/process_component_build.ts:2003-2040`（`processForEachBlock`，`isLazy` 标记）
- `compiler/src/pre_define.ts:199`（`COMPONENT_LAZYFOREACH = 'LazyForEach'`）
- `compiler/src/pre_define.ts:627`（`__LAZYFOREACHITEMGENFUNCTION = '__lazyForEachItemGenFunction'`）
- `compiler/src/pre_define.ts:629`（`__LAZYFOREACHITEMIDFUNC = '__lazyForEachItemIdFunc'`）

### 转换前的原始代码
```typescript
LazyForEach(this.dataSource, (item: string) => {
  Text(item)
}, (item: string) => item)
```

### 转换后的代码（Partial Update）
```typescript
{
  const __lazyForEachItemGenFunction = (item, index, isInitial, ids) => {
    this.observeComponentCreation2((elmtId, isInitialRender) => {
      Text.create(item)
      if (!isInitialRender) { Text.pop() }
    }, Text)
  }
  const __lazyForEachItemIdFunc = (item: string) => item
  LazyForEach.create(id, this, this.dataSource, __lazyForEachItemGenFunction,
                     __lazyForEachItemIdFunc, undefined, true)
  LazyForEach.pop()
}
```

### 关键转换逻辑
- **共用入口 `processForEachComponentNew`**（line 1759-1805）：
  - `collectForEachAttribute`（line 1763）：收集属性调用列表 `attributeList`。
  - `checkForEachComponent`（line 1769）：判断是否为 ForEach。返回 `true` 时 `processForEach += 1`，返回 `false`（LazyForEach）时 `processLazyForEach += 1`。
  - 生成器函数（line 1783）：`createItemGenFunctionStatement` — 根据组件类型选择函数名。
  - ID 函数（line 1784）：`createItemIdFuncStatement` — 仅当存在第 3 个参数时生成。
  - update 函数（line 1785）：`createUpdateFunctionStatement` — **仅 ForEach 使用**，LazyForEach 不使用。
  - LazyForEach create 语句（line 1786）：`createLazyForEachStatement(argumentsArray)` — LazyForEach 专属。

- **`checkForEachComponent`**（line 1807-1810）：
  ```typescript
  return node.expression.expression && ts.isIdentifier(node.expression.expression) &&
    node.expression.expression.getText() === COMPONENT_FOREACH;
  ```
  返回 `true` 为 ForEach，返回 `false` 为 LazyForEach。

- **分支差异**（line 1787-1797）：
  - ForEach（line 1787-1790）：`createComponentCreationStatement` 包装，推入 `propertyNode, ...attributeList, itemGenFunctionStatement, updateFunctionStatement`。
  - LazyForEach（line 1791-1797）：`ts.factory.createBlock([...], true)` 包装：
    - 有 `argumentsArray[2]`（keyGenerator，line 1792-1794）：`[itemGenFunctionStatement, itemIdFuncStatement, lazyForEachStatement, ...attributeList, popNode]`
    - 无 `argumentsArray[2]`（line 1795-1796）：`[itemGenFunctionStatement, lazyForEachStatement, popNode, ...attributeList]`

- **生成器函数名选择** — `createItemGenFunctionStatement`（line 1812-1844）：
  ```typescript
  ts.factory.createIdentifier(
    node.expression.getText() === COMPONENT_FOREACH ?
      FOREACHITEMGENFUNCTION : __LAZYFOREACHITEMGENFUNCTION)
  ```
  LazyForEach 使用 `__LAZYFOREACHITEMGENFUNCTION`（双下划线前缀 `__lazyForEachItemGenFunction`）。

- **ID 函数名选择** — `createItemIdFuncStatement`（line 1890-1908）：
  ```typescript
  ts.factory.createIdentifier(
    node.expression.getText() === COMPONENT_FOREACH ?
      FOREACHITEMIDFUNC : __LAZYFOREACHITEMIDFUNC)
  ```
  LazyForEach 使用 `__LAZYFOREACHITEMIDFUNC`（双下划线前缀 `__lazyForEachItemIdFunc`）。

- **`createLazyForEachStatement`**（line 1958-1984）：LazyForEach 专属 create 调用。
  - 参数列表构造（line 1959-1973）：
    1. `componentInfo.id.toString()` — 字符串字面量，组件 ID
    2. `ts.factory.createThis()` — this 引用
    3. `argumentsArray[0]` — 数据源（dataSource）
    4. `ts.factory.createIdentifier(__LAZYFOREACHITEMGENFUNCTION)` — 生成器函数引用
    5. （可选）`argumentsArray[2]` 存在时追加 `__LAZYFOREACHITEMIDFUNC`（line 1965-1967）
    6. （可选）`argumentsArray[3]` 为对象字面量时追加原始参数（line 1968-1970）
    7. （可选）`projectConfig.optLazyForEach` 为 true 时追加 `ts.factory.createTrue()`（line 1971-1973）
  - 调用目标：`LazyForEach.create`（`COMPONENT_LAZYFOREACH` + `COMPONENT_CREATE_FUNCTION`）

- **`processForEachBlock`**（line 2012-2040）：
  - `isLazy = node.expression.getText() === COMPONENT_LAZYFOREACH`（line 2016）：标记为 LazyForEach。
  - `isLazy` 传递给 `processComponentBlock`，影响内部组件创建逻辑（如是否使用 `observeComponentCreation2`）。

- **与 ForEach 的详细差异**：

| 维度 | ForEach | LazyForEach |
|---|---|---|
| 生成器函数名 | `forEachItemGenFunction` | `__lazyForEachItemGenFunction` |
| ID 函数名 | `forEachItemIdFunc` | `__lazyForEachItemIdFunc` |
| create 调用 | `ForEach.create(...)` | `LazyForEach.create(...)` |
| update 函数 | 生成 `forEachUpdateFunction` 调用 | 不生成 update 函数 |
| 语句包装 | `createComponentCreationStatement` | `ts.factory.createBlock([...], true)` |
| optLazyForEach | 无此选项 | `true` 参数追加 |
| create 参数 | `id, this, dataSource, forEachItemGenFunction, ...` | `id, this, dataSource, __lazyForEachItemGenFunction, [itemIdFunc], [options], [true]` |
| 依赖追踪 | `processForEach` 计数 | `processLazyForEach` 计数 + `lazyForEachInfo` |

- **依赖追踪**：`storedFileInfo.lazyForEachInfo` 维护 `forEachParameters`（参数列表）和 `isDependItem`（是否依赖 item 变量）状态，用于增量编译和热重载时的依赖分析。

## 静态
### 源码参考位置
静态工具链中 LazyForEach 不在 `InnerComponentNames` 枚举中，按通用 builder lambda 链路处理。

### 转换后的代码
LazyForEach 作为 `@ComponentBuilder` 装饰的函数调用保留在 builder lambda 体中，通过 `transformBuilderLambda`（`arkui-plugins/ui-plugins/builder-lambda-translators/factory.ts:1093`）的链式调用展开逻辑处理。

## 接口声明交叉验证

### LazyForEach 声明重载形式

LazyForEach 在 SDK 声明文件 `lazyForEach.static.d.ets` 中有三个重载形式：

| 重载 | 装饰器 | 特征 | 返回类型 |
|---|---|---|---|
| 重载1 | `@ComponentBuilder` | 数据形式（itemGenerator, keyGenerator） | `LazyForEachInterface` |
| 重载2 | `@Builder` | 样式形式 | `LazyForEachInterface` |
| 重载3 | `@Builder` | 样式形式，带 count 参数 | `LazyForEachInterface` |

**动态工具链处理**：`processForEachComponent` 复用 ForEach 处理逻辑，通过 `isLazy` 标记区分。LazyForEach 支持 `optLazyForEach` 优化模式（追加 `true` 参数启用懒创建）。

**静态工具链处理**：LazyForEach 不在 `InnerComponentNames` 枚举中，按通用 builder lambda 链路处理，通过 `transformBuilderLambda` 链式展开。

## 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| 处理方式 | 生成 `LazyForEach.create()` 命令式调用 | 作为 @ComponentBuilder 函数调用保留 |
| 函数名 | `__lazyForEachItemGenFunction` / `__lazyForEachItemIdFunc` | 保留原始箭头函数 |
| optLazyForEach | 追加 `true` 参数启用 lazy 创建 | 无此选项 |
| 结构 | Block 块包装 | builder lambda 链式展开 |
| update 函数 | 不生成 | 无此概念 |
