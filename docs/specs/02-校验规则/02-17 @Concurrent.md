# 规则
校验 `@Concurrent` 装饰器只能在 ESMODULE 编译模式使用、不可用于方法声明、不可用于 generator/async generator 函数。

## 源码参考位置
- 动态：
  - `compiler/src/validate_ui_syntax.ts:499-519`（`checkConcurrentDecorator` 函数）
  - `compiler/src/validate_ui_syntax.ts:572-577`（`visitAllNode` 中调用入口）
  - `compiler/src/pre_define.ts:126`（`COMPONENT_CONCURRENT_DECORATOR` 常量）
- 静态：
  - 无（@Concurrent 仅在动态类型工具链 compiler 中校验，arkui-plugins 无对应规则）

## 适用对象
`@Concurrent` 装饰的函数声明（`FunctionDeclaration`）或方法声明（`MethodDeclaration`）

## 报错信息
- 动态：
  - `'@Concurrent' can only be used in ESMODULE compile mode.`（ERROR）
  - `'@Concurrent' can not be used on method, please use it on function declaration.`（ERROR，错误码 10905123）
  - `'@Concurrent' can not be used on '${funcKind}' function declaration.`（ERROR，错误码 10905122，funcKind 为 `Generator` 或 `Async generator`）
- 静态：
  - 无

## 错误码
- 10905122：@Concurrent 用于 generator 或 async generator 函数
- 10905123：@Concurrent 用于方法声明

## 核心校验规则
1. 入口：`visitAllNode` 遍历到 `MethodDeclaration` 或 `FunctionDeclaration` 节点时，若该节点有 `@Concurrent` 装饰器，调用 `checkConcurrentDecorator`
2. 编译模式检查：若 `projectConfig.compileMode === JSBUNDLE`，报 ERROR（@Concurrent 仅支持 ESMODULE 模式）
3. 方法声明检查：若节点为 `ts.isMethodDeclaration(node)`，报 ERROR 10905123（请改用在函数声明上）
4. Generator 检查：若节点有 `asteriskToken`（即 `*` 标记的 generator 函数）：
   - 检查修饰符中是否含 `async` 关键字
   - 若含 async，`funcKind` 为 `'Async generator'`；否则为 `'Generator'`
   - 报 ERROR 10905122
5. 三项检查独立执行，不互斥（可能同时触发多条报错）

## 示例代码
### 反例
```typescript
// 反例1：JSBUNDLE 模式下使用
@Concurrent function myTask() { }  // JSBUNDLE 模式下报错

// 反例2：用于方法声明
struct MyComp {
  @Concurrent                    // 错误：不可用于方法
  myMethod() { }
}

// 反例3：用于 generator 函数
@Concurrent function* genTask() { }  // 错误：不可用于 generator

// 反例4：用于 async generator 函数
@Concurrent async function* asyncGen() { }  // 错误：不可用于 async generator
```

### 正例
```typescript
// ESMODULE 编译模式下，用于普通函数声明
@Concurrent function myTask(): void {
  console.log('running concurrently')
}
```

## 校验实现细节

### ESMODULE vs JSBUNDLE 模式差异
`@Concurrent` 仅在 ESMODULE 编译模式下可用。当 `projectConfig.compileMode === JSBUNDLE` 时，`checkConcurrentDecorator` 报 ERROR：`'@Concurrent' can only be used in ESMODULE compile mode.`

### generator/async generator 函数的判定方式
1. 通过 `node.asteriskToken` 判断是否为 generator 函数（带 `*` 标记）
2. 若为 generator，进一步通过 `ts.getModifiers` 获取修饰符，检查是否含 `async` 关键字
3. 含 `async` 则 `funcKind` 为 `'Async generator'`，否则为 `'Generator'`
4. 报 ERROR：`'@Concurrent' can not be used on '${funcKind}' function declaration.`

### 错误码
- **10905122**：`@Concurrent` 用于 generator 或 async generator 函数
- **10905123**：`@Concurrent` 用于方法声明（`ts.isMethodDeclaration(node)` 为 true），报错：`'@Concurrent' can not be used on method, please use it on function declaration.`

### 三项检查独立执行
模式检查、方法声明检查、generator 检查三项独立执行、不互斥，可能同时触发多条报错。

### 源码位置
`compiler/src/validate_ui_syntax.ts:499`（`checkConcurrentDecorator`）

## 静态
### 源码参考位置
静态侧无对应独立规则文件。@Concurrent 的校验仅在动态工具链（compiler）的 `validate_ui_syntax.ts:499`（`checkConcurrentDecorator`）中实现。
### 静态工具链处理
静态工具链（arkui-plugins）当前无 @Concurrent 装饰器的独立校验规则，该装饰器的校验完全由动态工具链处理。

- `compiler/src/pre_define.ts:28`（`COMPONENT_DECORATOR_COMPONENT_V2`）

## 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| 校验入口 | `validate_ui_syntax.ts:499`（`checkConcurrentDecorator`） | 静态侧无对应规则 |
| 模式限制 | 仅 ESMODULE 模式可用 | 不适用 |
| 错误码 | 10905122/10905123 | 无 |