# 功能概述
`@WrapBuilder` 是全局函数调用，将 `@Builder` 函数包装为 `WrappedBuilder` 对象，编译器校验参数必须是 `@Builder` 函数，包装后的对象可在组件间传递并按需调用构建逻辑。

## 动态
### 源码参考位置
- `compiler/src/pre_define.ts:707`（`WRAPBUILDER_FUNCTION = 'wrapBuilder'`）
- `compiler/src/pre_define.ts:709`（`WRAPPEDBUILDER_CLASS = 'WrappedBuilder'`）
- `compiler/src/pre_define.ts:711`（`WRAPBUILDER_BUILDERPROP = 'builder'`）
- `compiler/src/pre_define.ts:708`（`MUTABLEBUILDER_FUNCTION = 'mutableBuilder'`）
- `compiler/src/pre_define.ts:710`（`MUTABLEBUILDER_CLASS = 'MutableBuilder'`）
- `compiler/src/process_ui_syntax.ts:494-500`（`isWrapBuilderFunction`）
- `compiler/src/process_ui_syntax.ts:502-508`（`isMutableBuilderFunction`）
- `compiler/src/process_ui_syntax.ts:432-442`（处理分支，校验参数）
- `compiler/src/component_map.ts`（`STATIC_WRAPPED_BUILDER`、`STATIC_BUILDER` 集合）

### 转换前的原始代码
```typescript
@Builder
function myBuilder(text: string) {
  Text(text)
}

let wrapped: WrappedBuilder<[string], (text: string) => void> = wrapBuilder(myBuilder);
```

### 转换后的代码（Legacy）
```typescript
// 动态工具链仅校验参数，不改变 wrapBuilder 调用表达式
// 运行时由框架处理 WrappedBuilder 的实例化
function myBuilder(text: string, parent = null, myIds = []) {
  Text(text)
}

let wrapped = wrapBuilder(myBuilder);
```

### 转换后的代码（Partial Update）
```typescript
// Partial Update 模式下行为一致，仅校验不变换
function myBuilder(text: string, myIds = []) {
  Text(text)
}

let wrapped = wrapBuilder(myBuilder);
```

### 关键转换逻辑
1. **检测**（`isWrapBuilderFunction:494-500`）：判断节点是否为 `CallExpression`，且 `node.expression` 为 Identifier 且 `escapedText === 'wrapBuilder'`。
2. **参数校验**（line 432-442）：
   ```
   if (node.arguments[0] && (!ts.isIdentifier(node.arguments[0]) ||
       !CUSTOM_BUILDER_METHOD.has(node.arguments[0].escapedText.toString())))
   ```
   - 第一个参数必须是 Identifier
   - 该 Identifier 名称必须在 `CUSTOM_BUILDER_METHOD` 集合中（即被 `@Builder` 标记的函数）
   - 否则报错：`The wrapBuilder's parameter should be '@Builder' function.`（错误码 10905109）
3. **mutableBuilder 处理**（`isMutableBuilderFunction:502-508`）：同理检测 `mutableBuilder` 调用，参数校验逻辑一致。
4. **不变换调用表达式**：`wrapBuilder` / `mutableBuilder` 调用本身在编译期不改变，仅在运行时由框架实例化 `WrappedBuilder` / `MutableBuilder` 对象。

### WrappedBuilder / MutableBuilder 常量

| 常量 | 值 | 用途 |
|---|---|---|
| `WRAPBUILDER_FUNCTION` | `'wrapBuilder'` | 包装函数名 |
| `MUTABLEBUILDER_FUNCTION` | `'mutableBuilder'` | 可变包装函数名 |
| `WRAPPEDBUILDER_CLASS` | `'WrappedBuilder'` | 包装结果类名 |
| `MUTABLEBUILDER_CLASS` | `'MutableBuilder'` | 可变包装结果类名 |
| `WRAPBUILDER_BUILDERPROP` | `'builder'` | 包装对象内部 builder 属性名 |

## 静态
### 源码参考位置
静态工具链（arkui-plugins）通过 interop 插件和 builder-lambda-translators 处理 WrappedBuilder，但 `wrapBuilder` 函数调用本身不在 arkui-plugins 的变换范围中。静态工具链中 `WrappedBuilder` 的类型信息由 SDK 声明提供。

### 转换前的原始代码
```typescript
@Builder
function myBuilder(text: string) {
  Text(text)
}

let wrapped = wrapBuilder(myBuilder);
```

### 转换后的代码
```typescript
// 静态工具链不处理 wrapBuilder 调用，保留原始表达式
function myBuilder(text: string) {
  Text(text)
}

let wrapped = wrapBuilder(myBuilder);
```

## 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| 参数校验 | `CUSTOM_BUILDER_METHOD` 集合检查 | 无编译期校验 |
| 调用变换 | 不变换，仅校验 | 不处理 |
| 错误码 | 10905109（参数非 @Builder） | 无 |
| WrappedBuilder 类 | 运行时框架提供 | SDK 声明提供 |
| @Builder 函数变换 | 追加 parent/myIds 参数 | 通过 builder-lambda 变换 |
