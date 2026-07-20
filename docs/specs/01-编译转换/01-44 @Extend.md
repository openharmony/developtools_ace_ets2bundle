# 功能概述
`@Extend` 装饰器为指定组件扩展样式属性，将样式函数绑定到组件类型上实现属性复用。动态工具链在函数声明阶段将函数重命名为 `__<Component>__<funcName>` 格式，并在调用阶段追加 `elmtId`、`isInitialRender`、`this` 三个参数。区分 component 级 `@Extend`（已注册到 `EXTEND_ATTRIBUTE`）和非 component 级 `@Extend`（通过 `EXTEND_ATTRIBUTE` 检测判定）。

| 转换规则 | 说明 |
|---|---|
| 函数名重命名 | `__<Component>__<funcName>` 格式，如 `__Text__fancy` |
| 参数追加 | 非 component 级追加 `elmtId, isInitialRender, this`；component 级仅传原始参数 |
| component 级判定 | `isExtendFunctionNode` 检查 `EXTEND_ATTRIBUTE` Map 中是否注册 |
| @AnimatableExtend 区分 | `isExtendFunctionNode` 也检查 `animatableExtendAttribute` Map，返回 `CHECK_COMPONENT_ANIMATABLE_EXTEND_DECORATOR` 类型 |

## 动态
### 源码参考位置
- `compiler/src/process_ui_syntax.ts:1169-1228`（`processExtend`，函数声明阶段重命名和变换）
- `compiler/src/process_component_build.ts:3031-3058`（`addComponentAttr` 中 `@Extend` 分支，调用阶段参数追加）
- `compiler/src/process_component_build.ts:3398-3417`（`isExtendFunctionNode`，component 级 vs 非component级判定）
- `compiler/src/pre_define.ts:123`（`COMPONENT_EXTEND_DECORATOR = '@Extend'`）
- `compiler/src/pre_define.ts:128`（`CHECK_COMPONENT_EXTEND_DECORATOR = 'Extend'`）
- `compiler/src/pre_define.ts:131`（`CHECK_COMPONENT_ANIMATABLE_EXTEND_DECORATOR = 'AnimatableExtend'`）

### 转换前的原始代码
```typescript
@Extend(Text)
function fancy(size: number) {
  .fontSize(size)
  .fontColor(Color.Red)
}

// 使用处
Text('hello')
  .fancy(20)
```

### 转换后的代码（Legacy）
```typescript
// 函数声明阶段：重命名为 __Text__fancy
function __Text__fancy(size: number) {
  Text.fontSize(size)
  Text.fontColor(Color.Red)
}

// 调用处：追加 elmtId, isInitialRender, this 参数
__Text__fancy(20, elmtId, isInitialRender, this)
```

### 转换后的代码（Partial Update）
```typescript
function __Text__fancy(size: number) {
  Text.fontSize(size)
  Text.fontColor(Color.Red)
}

__Text__fancy(20, elmtId, isInitialRender, this)
```

### 关键转换逻辑
- **函数声明阶段** — `processExtend`（line 1169-1228）：
  - `isExtendFunction`（line 1171）：提取组件名 `componentName` 和校验装饰器。
  - `checkExtendNode`（line 1172）：校验函数体合法性和参数约束。
  - 函数名重命名（line 1177-1182）：
    - 若函数名已以 `__<componentName>__` 开头，保留原名（line 1177-1178）。
    - 否则构造 `extendFunctionName = '__' + componentName + '__' + node.name.getText()`（line 1180），并调用 `collectExtend(EXTEND_ATTRIBUTE, componentName, funcName)` 将映射注册到全局 `EXTEND_ATTRIBUTE` Map（line 1181）。
  - 函数体变换（line 1183-1186）：`ts.visitEachChild(node.body, traverseExtendExpression, contextGlobal)` 遍历函数体内的样式调用表达式，将 `.fontSize(size)` 等无组件名的链式调用绑定到组件类型上。
  - 空函数体（line 1173-1186）：若 `node.body.statements.length === 0`，生成空 `statementArray`。

- **调用阶段** — `addComponentAttr` 中 `@Extend` 分支（line 3031-3058）：
  - `isExtendFunctionNode`（line 3031）：检测当前属性调用是否为 `@Extend` 或 `@AnimatableExtend` 函数。
  - `isAcceleratePreview` 检查（line 3032-3039）：加速预览模式下报错 `'Doesn't support '@Extend' function now.'`（code `10906205`）。
  - 函数名构造（line 3040-3045）：
    - `extendType.type === CHECK_COMPONENT_EXTEND_DECORATOR`（component 级）：`functionName = '__${identifierNode.escapedText}__${propName}'`，如 `__Text__fancy`。
    - 否则（非 component 级，即 `@AnimatableExtend`）：`functionName = propName`，直接用属性名。
  - 参数追加（line 3046-3055）：
    - component 级 `@Extend`：`temp.arguments`，仅传原始参数（line 3049）。
    - 非 component 级：`[...temp.arguments, ELMTID, ISINITIALRENDER, this]`，追加 `elmtId`、`isInitialRender`、`this` 三个参数（line 3050-3054）。
  - 语句推送（line 3056-3057）：同时推入 `statements`（初始渲染）和 `updateStatements`（更新渲染）。

- **component 级 vs 非component级判定** — `isExtendFunctionNode`（line 3402-3417）：
  - `EXTEND_ATTRIBUTE` Map（line 3405）：存储 `@Extend` 注册的组件-属性映射。若当前组件名在 Map 中且属性名在对应 Set 中，设置 `extendType.type = CHECK_COMPONENT_EXTEND_DECORATOR`（line 3406），返回 `true`。
  - `animatableExtendAttribute` Map（line 3409-3414）：存储 `@AnimatableExtend` 注册的映射。若匹配，设置 `extendType.type = CHECK_COMPONENT_ANIMATABLE_EXTEND_DECORATOR`（line 3413），返回 `true`。
  - 两者都不匹配时返回 `false`，属性走通用 `else` 分支。

## 静态
### 源码参考位置
- `arkui-plugins/common/predefines.ts:227`（`DecoratorNames.ANIMATABLE_EXTEND`，附近 enum）

### 转换前的原始代码
```typescript
@Extend(Text)
function fancy(size: number) {
  .fontSize(size)
  .fontColor(Color.Red)
}
```

### 转换后的代码
```typescript
// 静态工具链通过组件类型绑定机制处理
// 函数名重命名 + 参数追加
```

## 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| 函数重命名 | `__<Component>__<funcName>` | 同样重命名 |
| 参数追加 | component 级仅原始参数；非component级追加 `elmtId`, `isInitialRender`, `this` | 通过组件类型绑定机制 |
| 调用时机 | `addComponentAttr` 中展开 | 属性变换阶段处理 |
| 类型区分 | `CHECK_COMPONENT_EXTEND_DECORATOR` vs `CHECK_COMPONENT_ANIMATABLE_EXTEND_DECORATOR` | 无运行时类型标记 |
