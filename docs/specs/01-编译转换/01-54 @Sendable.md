# 功能概述
`@Sendable` 装饰器标记跨并发线程（Worker/TaskPool）共享的类、函数和类型别名。编译器移除装饰器，为类注入构造函数（含 `'use sendable'` 指令），为函数注入 `'use sendable'` 指令，为可选属性追加 `undefined` 类型，使 Ark 运行时识别 Sendable 语义。

## 动态
### 源码参考位置
- `compiler/src/pre_define.ts:127`（`COMPONENT_SENDABLE_DECORATOR = '@Sendable'`）
- `compiler/src/pre_define.ts:118`（`SENDABLE = 'Sendable'`）
- `compiler/src/process_sendable.ts:105`（`processSendableClass`）
- `compiler/src/process_sendable.ts:139`（`processSendableFunction`）
- `compiler/src/process_sendable.ts:151`（`processSendableType`）
- `compiler/src/process_ui_syntax.ts:446-458`（class 检测和 `processSendableClass` 调用）
- `compiler/src/process_ui_syntax.ts:404-409`（function 检测和 `processSendableFunction` 调用）
- `compiler/src/process_ui_syntax.ts:459-463`（type alias 检测和 `processSendableType` 调用）
- `compiler/src/process_sendable.ts:19-43`（`transformOptionalMemberForSendable`）
- `compiler/src/process_sendable.ts:45-52`（`removeSendableDecorator`）
- `compiler/src/process_sendable.ts:54-70`（`updateSendableConstructor`）
- `compiler/src/process_sendable.ts:72-103`（`addConstructorForSendableClass`）

### 转换前的原始代码
```typescript
@Sendable
class MyData {
  name: string
  value?: number
}

@Sendable
function processData(data: MyData): string {
  return data.name;
}

@Sendable
type MyType = string;
```

### 转换后的代码（Legacy）
```typescript
// @Sendable class: 移除装饰器，可选属性追加 undefined 类型，注入构造函数
class MyData {
  name: string
  value: number | undefined = undefined
  constructor() {
    'use sendable';
  }
}

// @Sendable function: 注入 'use sendable' 指令
function processData(data: MyData): string {
  'use sendable';
  return data.name;
}

// @Sendable type: 移除装饰器，保留类型声明
type MyType = string;
```

### 转换后的代码（Partial Update）
```typescript
// Partial Update 模式行为一致
class MyData {
  name: string
  value: number | undefined = undefined
  constructor() {
    'use sendable';
  }
}

function processData(data: MyData): string {
  'use sendable';
  return data.name;
}

type MyType = string;
```

### 关键转换逻辑

#### 1. processSendableClass（line 105-137）
| 步骤 | 函数 | 说明 |
|---|---|---|
| 移除装饰器 | `removeSendableDecorator:45-52` | 过滤 `@Sendable` 装饰器 |
| 可选属性变换 | `transformOptionalMemberForSendable:19-43` | 对有 `?` 的属性：类型追加 `\| undefined`，初始化为 `undefined` |
| 构造函数注入 | `updateSendableConstructor:54-70` | 若已有构造函数：首行注入 `'use sendable'` |
| 缺省构造函数 | `addConstructorForSendableClass:72-103` | 若无构造函数：创建含 `'use sendable'` 的构造函数；若继承父类则追加 `super(...args)` |

#### 2. processSendableFunction（line 139-149）
- 若函数有 body：在 `body.statements` 首部插入 `'use sendable'` 表达式语句。
- 若无 body（声明）：重建函数声明。

#### 3. processSendableType（line 151-153）
- 仅移除 `@Sendable` 装饰器，保留类型别名声明本身不变。

#### 4. 继承处理（`addConstructorForSendableClass:109-110`）
```typescript
let needSuper = node.heritageClauses?.some(clause => clause.token === ts.SyntaxKind.ExtendsKeyword) || false;
```
若类有 `extends` 父类，构造函数追加 `super(...args)` 和 `...args` 参数。

#### 5. HAR 警告（`process_ui_syntax.ts:447-456`）
当 `compileHar && !useTsHar` 时，警告：`@Sendable` 在 JS HAR 中运行时会异常，建议使用 TS HAR。

## 静态
### 源码参考位置
静态工具链（arkui-plugins）不处理 `@Sendable` 装饰器。`@Sendable` 是 Ark 运行时并发特性，由动态工具链的 TypeScript AST 变换处理。

### 转换前的原始代码
```typescript
@Sendable
class MyData {
  name: string
}
```

### 转换后的代码
```typescript
// 静态工具链不处理，es2panda 编译阶段保留 @Sendable 语义
class MyData {
  name: string
}
```

## 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| 是否处理 @Sendable | 是，三个函数变换 | 否 |
| 'use sendable' 注入 | 类构造函数 + 函数体 | 无 |
| 装饰器移除 | `removeSendableDecorator` | 保留 |
| 可选属性变换 | 追加 `undefined` 类型 | 无 |
| 缺省构造函数 | 自动生成 | 无 |
| HAR 警告 | 有 | 无 |
