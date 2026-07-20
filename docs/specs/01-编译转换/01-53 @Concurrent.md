# 功能概述
`@Concurrent` 装饰器标记函数可跨并发线程（Worker/TaskPool）执行，编译器在函数体首行注入 `'use concurrent'` 指令字符串供 Ark 运行时识别并发函数。

## 动态
### 源码参考位置
- `compiler/src/pre_define.ts:126`（`COMPONENT_CONCURRENT_DECORATOR = '@Concurrent'`）
- `compiler/src/process_ui_syntax.ts:1331`（`processConcurrent`）
- `compiler/src/process_ui_syntax.ts:397-403`（visitor 中调用 `processConcurrent`）
- `compiler/src/validate_ui_syntax.ts:499-518`（`checkConcurrentDecorator`）
- `compiler/src/validate_ui_syntax.ts:574-576`（`visitAllNode` 中检测 `@Concurrent`）

### 转换前的原始代码
```typescript
@Concurrent
function myFunc(arg: string): string {
  return arg + '_processed';
}
```

### 转换后的代码（Legacy）
```typescript
function myFunc(arg: string): string {
  'use concurrent';
  return arg + '_processed';
}
```

### 转换后的代码（Partial Update）
```typescript
// Partial Update 模式下行为一致
function myFunc(arg: string): string {
  'use concurrent';
  return arg + '_processed';
}
```

### 关键转换逻辑
1. **检测入口**（`process_ui_syntax.ts:397`）：在 `processAllNodes` 的 visitor 中，当节点为 `FunctionDeclaration` 且有 `@Concurrent` 装饰器时，调用 `processConcurrent`。
2. **注入指令**（`processConcurrent:1332-1337`）：若函数有 body，在 body.statements 数组首部插入 `ts.factory.createExpressionStatement(ts.factory.createStringLiteral('use concurrent'))`，然后通过 `ts.factory.updateFunctionDeclaration` 重建函数节点。
3. **装饰器移除**（line 400-402）：转换后 `node.illegalDecorators = undefined` 移除装饰器。

### 校验规则（`checkConcurrentDecorator:499-518`）
| 校验项 | 条件 | 错误码 | 消息 |
|---|---|---|---|
| 编译模式限制 | `projectConfig.compileMode === JSBUNDLE` | - | `'@Concurrent' can only be used in ESMODULE compile mode.` |
| 不可用于方法 | `ts.isMethodDeclaration(node)` | 10905123 | `'@Concurrent' can not be used on method, please use it on function declaration.` |
| 不可用于 Generator | `node.asteriskToken` 且非 async | 10905122 | `'@Concurrent' can not be used on 'Generator' function declaration.` |
| 不可用于 Async Generator | `node.asteriskToken` 且 async | 10905122 | `'@Concurrent' can not be used on 'Async generator' function declaration.` |

## 静态
### 源码参考位置
静态工具链（arkui-plugins）不处理 `@Concurrent` 装饰器。`@Concurrent` 是 Ark 运行时并发特性，由动态工具链的 TypeScript AST 变换处理。

### 转换前的原始代码
```typescript
@Concurrent
function myFunc(arg: string): string {
  return arg + '_processed';
}
```

### 转换后的代码
```typescript
// 静态工具链不处理，@Concurrent 不在 arkui-plugins 装饰器白名单中
// es2panda 编译阶段保留装饰器，由 Ark 运行时处理
function myFunc(arg: string): string {
  return arg + '_processed';
}
```

## 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| 是否处理 @Concurrent | 是，注入 `'use concurrent'` | 否 |
| 校验逻辑 | `checkConcurrentDecorator` 检查模式/方法/generator | 无 |
| 装饰器移除 | 变换后移除 | 保留，由运行时处理 |
| ESMODULE 限制 | 仅 ESMODULE 模式可用 | 无此限制 |
| 输出差异 | Legacy 和 Partial Update 一致 | 不处理 |
