# 功能概述
`Repeat` 渲染控制转换为 `Repeat(arr, this).each(...).template(...).key(...).render(isInitialRender)` 链式调用模式。

## 动态
### 源码参考位置
- `compiler/src/process_component_build.ts:1082`（`processRepeatComponent`）
- `compiler/src/process_component_build.ts:1100`（`recurseRepeatExpression`，链式递归变换）
- `compiler/src/process_component_build.ts:1120`（`processRepeatPropWithChild`，each/template 箭头函数处理）
- `compiler/src/pre_define.ts:200`（`COMPONENT_REPEAT = 'Repeat'`）
- `compiler/src/pre_define.ts:201`（`REPEAT_EACH = 'each'`）
- `compiler/src/pre_define.ts:202`（`REPEAT_TEMPLATE = 'template'`）

### 转换前的原始代码
```typescript
Repeat(this.arr)
  .each((item, index) => {
    Text(item)
  })
  .template((item, index) => {
    Column() { Text(item) }
  }, { templateId: 'myTemplate' })
  .key((item) => item.id)
```

### 转换后的代码（Partial Update）
```typescript
Repeat(this.arr, this)                              // 注入 this 参数
  .each((item, index) => {
    this.observeComponentCreation2((elmtId, isInitialRender) => {
      Text.create(item)
      if (!isInitialRender) { Text.pop() }
    }, Text)
  })
  .template((item, index) => {
    this.observeComponentCreation2((elmtId, isInitialRender) => {
      Column.create()
      Text.create(item)
      if (!isInitialRender) { Text.pop() }
      if (!isInitialRender) { Column.pop() }
    }, Column)
  }, { templateId: 'myTemplate' })
  .key((item) => item.id)
  .render(isInitialRender)                          // COMPONENT_RENDER_FUNCTION 调用
```

### 关键转换逻辑
- `processRepeatComponent`（line 1082）：入口
- `recurseRepeatExpression`（line 1100）：递归处理 Repeat 的链式调用 `Repeat(arr).each(...).template(...).key(...)`，逐层 update
- `this` 注入（line 1105）：在最内层 `Repeat(arr)` 调用追加 `this` 参数
- `processRepeatPropWithChild`（line 1120）：
  - 对 `each` 和 `template` 属性的箭头函数体调用 `processComponentBlock` 递归变换子组件
  - **关键**：`template` 分支调用时第 6 个参数传 `true`（`isInRepeatTemplate=true`，line 1140），此上下文内不允许 `@ReusableV2` 组件
- 最终包装：整个链式调用包成 `Repeat(...).render(isInitialRender)` 形式（line 1089-1097）
- 状态追踪：`storedFileInfo.processRepeat` 在变换期间置 true（line 1111），变换后置 false（line 1113）

## 静态
### 源码参考位置
静态工具链中 Repeat 不在 `InnerComponentNames` 枚举中，按通用 builder lambda 链路处理，通过 `transformBuilderLambda`（`arkui-plugins/ui-plugins/builder-lambda-translators/factory.ts:1093`）的链式调用展开逻辑处理。

## 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| 处理方式 | 链式递归 + `render(isInitialRender)` 收尾 | builder lambda 链式展开 |
| this 注入 | `Repeat(arr, this)` 追加 this | 无此注入 |
| isInRepeatTemplate | 标记 template 上下文，禁止 @ReusableV2 | 无此标记 |
| render 调用 | `Repeat(...).render(isInitialRender)` | 无此调用 |

## 深度转换逻辑

### 源码参考位置
- `compiler/src/process_component_build.ts:1082-1098`（`processRepeatComponent`，入口和 render 包装）
- `compiler/src/process_component_build.ts:1100-1118`（`recurseRepeatExpression`，链式递归变换）
- `compiler/src/process_component_build.ts:1120-1145`（`processRepeatPropWithChild`，each vs template 差异化处理）
- `compiler/src/process_component_build.ts:1147-1155`（`processRepeatCallBackBlock`，箭头函数体提取）
- `compiler/src/pre_define.ts:200`（`COMPONENT_REPEAT = 'Repeat'`）
- `compiler/src/pre_define.ts:201`（`REPEAT_EACH = 'each'`）
- `compiler/src/pre_define.ts:202`（`REPEAT_TEMPLATE = 'template'`）
- `compiler/src/pre_define.ts:116`（`COMPONENT_RENDER_FUNCTION = 'render'`）

### 转换前代码
```typescript
Repeat(this.arr)
  .each((item, index) => {
    Text(item)
  })
  .template((item, index) => {
    Column() {
      Text(item)
    }
  }, { templateId: 'myTemplate' })
  .key((item) => item.id)
```

### 转换后代码（Partial Update 模式）
```typescript
// 整体被 render(isInitialRender) 包装
Repeat(this.arr, this)                                      // this 注入
  .each((item, index) => {
    this.observeComponentCreation2((elmtId, isInitialRender) => {
      Text.create(item)
      if (!isInitialRender) { Text.pop() }
    }, Text)
  })
  .template((item, index) => {
    this.observeComponentCreation2((elmtId, isInitialRender) => {
      Column.create()
      Text.create(item)
      if (!isInitialRender) { Text.pop() }
      if (!isInitialRender) { Column.pop() }
    }, Column)
  }, { templateId: 'myTemplate' })                         // template 上下文 isInRepeatTemplate=true
  .key((item) => item.id)
  .render(isInitialRender)                                  // render 收尾
```

### 关键转换逻辑

#### 1. processRepeatComponent 入口和 render 包装（line 1082-1098）

```typescript
function processRepeatComponent(node: ts.ExpressionStatement, newStatements: ts.Statement[],
  log: LogInfo[], isBuilder: boolean = false, isGlobalBuilder: boolean = false): void {
  // ...
  newStatements.push(processInnerCompStatements(
    [ts.factory.createExpressionStatement(ts.factory.createCallExpression(
      ts.factory.createPropertyAccessExpression(
        chainCallTransform,
        ts.factory.createIdentifier(COMPONENT_RENDER_FUNCTION)
      ),
      undefined,
      [ts.factory.createIdentifier(ISINITIALRENDER)]
    ))], COMPONENT_REPEAT, isGlobalBuilder, isTransition, undefined, null, builderParamsResult));
}
```

- 整个链式调用最终被包装成 `Repeat(arr, this).each(...).template(...).key(...).render(isInitialRender)` 形式
- `render(isInitialRender)` 在链的最末尾调用

#### 2. recurseRepeatExpression 递归处理链式调用（line 1100-1118）

```typescript
function recurseRepeatExpression(node: ts.CallExpression | ts.PropertyAccessExpression,
  log: LogInfo[], isBuilder: boolean = false, isGlobalBuilder: boolean = false,
  isTransition: boolean = false, isInRepeatTemplate: boolean = false):
  ts.PropertyAccessExpression | ts.CallExpression {
  // 基础情况：Repeat(arr) 调用
  if (ts.isCallExpression(node) && node.expression && ts.isIdentifier(node.expression) &&
    node.expression.getText() === COMPONENT_REPEAT) {
    return ts.factory.createCallExpression(node.expression, node.typeArguments,
      [...node.arguments, ts.factory.createThis()]);  // 追加 this 参数
  }
  // PropertyAccessExpression：链式调用中间节点
  else if (ts.isPropertyAccessExpression(node)) {
    return ts.factory.updatePropertyAccessExpression(node,
      recurseRepeatExpression(node.expression, log, isBuilder, isGlobalBuilder, isTransition, isInRepeatTemplate),
      node.name);
  }
  // CallExpression（非 Repeat 基础调用）：处理 each/template/key 等属性
  else {
    let repeatPropArgs = processRepeatAttributeArrowNode(node.arguments);
    storedFileInfo.processRepeat = true;
    repeatPropArgs = processRepeatPropWithChild(node, repeatPropArgs, log, isBuilder,
      isGlobalBuilder, isTransition, isInRepeatTemplate);
    storedFileInfo.processRepeat = false;
    return ts.factory.updateCallExpression(node,
      recurseRepeatExpression(node.expression as ts.PropertyAccessExpression, log, isBuilder,
        isGlobalBuilder, isTransition, isInRepeatTemplate) as ts.PropertyAccessExpression,
      undefined, repeatPropArgs);
  }
}
```

**递归处理三种节点类型**：

1. **`Repeat(arr)` 基础调用**（CallExpression + callee 是 Identifier "Repeat"）：
   - 追加 `this` 参数：`Repeat(arr)` → `Repeat(arr, this)`
   - 这是最内层节点，递归基线

2. **`Repeat(arr).each` 链式属性访问**（PropertyAccessExpression）：
   - 递归处理 `expression`（即 `Repeat(arr)`）
   - 保留 `name`（即 `each`）

3. **`Repeat(arr).each(...)` 属性调用**（CallExpression，非基础调用）：
   - 先通过 `processRepeatAttributeArrowNode` 解包参数中的括号表达式
   - 设置 `storedFileInfo.processRepeat = true` 标记
   - 调用 `processRepeatPropWithChild` 处理 each/template 箭头函数体
   - 递归处理 `node.expression`（即 `Repeat(arr).each`）
   - 变换完成后设置 `storedFileInfo.processRepeat = false`

#### 3. processRepeatPropWithChild 中 each vs template 的差异化处理（line 1120-1145）

```typescript
function processRepeatPropWithChild(node: ts.CallExpression, repeatPropArgs: ts.ArrowFunction[],
  log: LogInfo[], isBuilder: boolean = false, isGlobalBuilder: boolean = false,
  isTransition: boolean = false, isInRepeatTemplate: boolean = false): ts.ArrowFunction[] {
  // each 属性处理
  if (ts.isPropertyAccessExpression(node.expression) && ts.isIdentifier(node.expression.name) &&
    node.expression.name.getText() === REPEAT_EACH && repeatPropArgs.length > 0 && repeatPropArgs[0].body) {
    return [
      ts.factory.updateArrowFunction(repeatPropArgs[0], ...,
        processComponentBlock(processRepeatCallBackBlock(repeatPropArgs[0]), false, log, isTransition,
          isBuilder, undefined, undefined, isGlobalBuilder, null, false, isInRepeatTemplate)),  // 传 isInRepeatTemplate 原值
      ...repeatPropArgs.slice(1)
    ];
  }
  // template 属性处理
  else if (ts.isPropertyAccessExpression(node.expression) && ts.isIdentifier(node.expression.name) &&
    node.expression.name.getText() === REPEAT_TEMPLATE && repeatPropArgs.length > 1 && repeatPropArgs[1].body) {
    return [
      repeatPropArgs[0],
      ts.factory.updateArrowFunction(repeatPropArgs[1], ...,
        processComponentBlock(processRepeatCallBackBlock(repeatPropArgs[1]), false, log, isTransition,
          isBuilder, undefined, undefined, isGlobalBuilder, null, false, true)),  // 强制传 true
      ...repeatPropArgs.slice(2)
    ];
  }
  return repeatPropArgs;
}
```

**each vs template 的关键差异**：

| 维度 | `each` | `template` |
|---|---|---|
| 参数索引 | `repeatPropArgs[0]` | `repeatPropArgs[1]` |
| `isInRepeatTemplate` | 传入原值 | **强制 `true`** |
| 用途 | 默认渲染模板 | 命名模板（配合 templateId） |

- **`each` 分支**（line 1123-1132）：将第 0 个参数（each 的箭头函数）的 body 通过 `processComponentBlock` 递归变换，`isInRepeatTemplate` 传入原值
- **`template` 分支**（line 1133-1142）：将第 1 个参数（template 的箭头函数）的 body 变换，**`isInRepeatTemplate` 强制传 `true`**（line 1140）

#### 4. isInRepeatTemplate=true 上下文的影响

当 `isInRepeatTemplate = true` 时，`processComponentBlock` 在处理子组件时会传递此标志。其主要影响是**禁止 V2 `@Reuse` 组件**在 Repeat template 上下文中使用。

这是因为 Repeat template 的生命周期管理与 @ReusableV2 的复用机制存在冲突，在 template 上下文中使用 @ReusableV2 组件会导致复用逻辑错误。

#### 5. processRepeatCallBackBlock 箭头函数体提取（line 1147-1155）

```typescript
function processRepeatCallBackBlock(repeatPropArg: ts.ArrowFunction): ts.Block {
  if (ts.isBlock(repeatPropArg.body)) {
    return repeatPropArg.body;
  } else {
    return ts.factory.updateArrowFunction(repeatPropArg, ...,
      ts.factory.createBlock([ts.factory.createExpressionStatement(repeatPropArg.body)], true)).body as ts.Block;
  }
}
```

- 如果箭头函数体已经是 `Block`，直接返回
- 如果是表达式（如 `Text(item)`），包装为 `Block`：`{ Text(item) }`
- 确保后续 `processComponentBlock` 接收的是 `Block` 类型

#### 6. render(isInitialRender) 生成逻辑

在 `processRepeatComponent`（line 1089-1097）中，整个链式调用的最外层被包装为：

```typescript
ts.factory.createCallExpression(
  ts.factory.createPropertyAccessExpression(
    chainCallTransform,  // 已变换的 Repeat(arr, this).each(...).template(...).key(...)
    ts.factory.createIdentifier(COMPONENT_RENDER_FUNCTION)  // 'render'
  ),
  undefined,
  [ts.factory.createIdentifier(ISINITIALRENDER)]  // isInitialRender
)
```

生成 `Repeat(arr, this).each(...).template(...).key(...).render(isInitialRender)`。

#### 7. 状态追踪

- `storedFileInfo.processRepeat = true`（line 1111）：在变换期间置 true，标记当前正在处理 Repeat
- `storedFileInfo.processRepeat = false`（line 1113）：变换完成后复位

### 静态变换逻辑

静态工具链中 Repeat 不在 `InnerComponentNames` 枚举中，按通用 builder lambda 链路处理。

#### 源码参考位置
- `arkui-plugins/ui-plugins/builder-lambda-translators/factory.ts:1093-1158`（`transformBuilderLambda`，链式调用展开）

静态工具链通过 `transformBuilderLambda` 的 `instanceCalls` 数组收集链式调用，然后逆序重组：

1. **收集 instanceCalls**（line 1096-1117）：遍历链式调用，区分 `isStyleChainedCall` 和 `isStyleWithReceiverCall`
2. **逆序处理**（line 1136）：`instanceCalls = instanceCalls.reverse()`
3. **updateAnimation**（line 1137）：处理 `.animation()` 拆分
4. **createStyleLambdaBody**（line 1146）：逐个重建链式调用
5. **generateArgsInBuilderLambda**（line 1151）：生成最终参数

### 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| 处理方式 | 链式递归 + `render(isInitialRender)` 收尾 | builder lambda 链式展开 |
| this 注入 | `Repeat(arr, this)` 追加 this | 无此注入 |
| isInRepeatTemplate | 标记 template 上下文，禁止 @ReusableV2 | 无此标记 |
| render 调用 | `Repeat(...).render(isInitialRender)` | 无此调用 |
| each vs template | 差异化处理（template 强制 isInRepeatTemplate=true） | 统一 instanceCalls 处理 |
