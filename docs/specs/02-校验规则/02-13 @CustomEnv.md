# 规则
校验 `@CustomEnv` 的 key 必须是全局 `const` 且由 `CustomEnvKey.create<T>()` 创建。

## 源码参考位置
- 动态：
  - `compiler/src/validate_ui_syntax.ts:2750`（`checkCustomEnvDecoratorInterop`）
  - `compiler/src/validate_ui_syntax.ts:2899`（`validateCustomEnvArgType`，类型一致性校验）
  - `compiler/src/validate_ui_syntax.ts:2912`（`validateInvalidCustomEnvCreation`，key 校验）
- 静态：`arkui-plugins/collectors/ui-collectors/validators/rules/check-custom-env-decorator.ts:37`

## 适用对象
- struct 的静态方法 `__resolveDecoratorSymbols`（编译器生成的方法，其中包含 `@CustomEnv` key 的变量声明）

## 报错信息
- 静态：
  - `Invalid key for '@CustomEnv', '@CustomEnv' key must be global const and created from CustomEnvKey.create<T>()`（ERROR）

## 错误码
- 无数字错误码（静态工具链使用规则名标识）

## 核心校验规则
1. `@CustomEnv` 的 key 必须是全局 `const` 变量
2. `@CustomEnv` 的 key 必须由 `CustomEnvKey.create<T>()` 方法创建（即调用表达式的 callee 为 `CustomEnvKey.create`）
3. 校验范围：仅检查 struct 中 `__resolveDecoratorSymbols` 静态方法内的 `__customEnv_` 前缀变量声明
4. 校验等级为 ERROR（阻断编译）

## 校验实现细节
### 静态工具链实现
源码位于 `check-custom-env-decorator.ts`（133 行），通过解析编译器生成的 `__resolveDecoratorSymbols` 方法验证 key 合法性：

#### 1. 目标方法定位
`_checkCustomEnvDecorator` 首先过滤目标方法：
- 方法名必须为 `__resolveDecoratorSymbols`（编译器为 @CustomEnv 装饰的 struct 生成的方法）
- 必须带 `MODIFIER_FLAGS_STATIC` 修饰符（静态方法）
- 不满足则直接返回

#### 2. key 变量收集（collectCustomEnvVarEntries + extractCustomEnvKeyInfo）
遍历方法体内所有 `VariableDeclaration` 语句，提取 `__customEnv_` 前缀变量：
- 获取方法 `function.body` 并校验为 `BlockStatement`
- 遍历 `body.statements`，筛选 `VariableDeclaration` 节点
- 对每个 `VariableDeclarator`：
  - `declarator.id` 必须为 `Identifier` 且 `name` 以 `__customEnv_` 前缀开头
  - `declarator.init` 必须为 `Identifier`（即 key 引用，非字面量或表达式）
- 返回 `CustomEnvKeyInfo { keyIdent: init, varDecl }` 列表

#### 3. key 声明解析与校验（validateCustomEnvKeyDecl）
对每个收集到的 key 标识符：
- 调用 `arkts.getDecl(keyInfo.keyIdent)` 解析标识符到声明节点（checked 阶段语义解析）
- 校验声明节点：
  - **必须是 `ClassProperty`**：全局 const 变量在 es2panda AST 中表示为 ClassProperty
  - **必须有 `MODIFIER_FLAGS_CONST`**：确保是 const 声明，排除 let/var
  - **init 值必须是 `CallExpression`**：key 必须通过函数调用创建
  - **调用必须为 `CustomEnvKey.create`**：由 `isCustomEnvKeyCreateCall` 验证

#### 4. CustomEnvKey.create 调用检测（isCustomEnvKeyCreateCall）
精确匹配调用表达式的结构：
- `expr.callee` 必须为 `MemberExpression`
- `callee.object` 必须为 `Identifier` 且 `name === 'CustomEnvKey'`
- `callee.property` 必须为 `Identifier` 且 `name === 'create'`
- 三层条件全部满足才返回 true

## 适用场景
- `@CustomEnv` 用于 V2 状态管理中的环境变量注入，从 `Environment` 读取自定义 key 对应的值
- key 必须全局唯一且不可变，因此要求 `const` 全局声明
- key 必须通过 `CustomEnvKey.create<T>()` 创建，确保类型安全和唯一性（内部生成唯一 ID）
- `__resolveDecoratorSymbols` 是编译器生成的辅助方法，集中存放装饰器参数的解析逻辑

## 自动修复建议
- 将 key 声明改为全局 `const`：`let myKey` -> `const myKey`
- 使用 `CustomEnvKey.create<T>()` 创建 key：`const myKey = 'string'` -> `const myKey = CustomEnvKey.create<string>()`
- 确保 key 声明在文件顶层而非 struct 内部

## 示例代码
### 反例
```typescript
// 非 const
let myKey = CustomEnvKey.create<string>()
@CustomEnv(myKey)

// 非 CustomEnvKey.create 创建
const myKey = 'someString'
@CustomEnv(myKey)

// 非 CustomEnvKey.create 调用
const myKey = SomeOtherClass.create<string>()
@CustomEnv(myKey)
```

### 正例
```typescript
const myKey = CustomEnvKey.create<string>()

@ComponentV2
struct MyComp {
  @CustomEnv(myKey) customValue: string
  build() { Text(this.customValue) }
}
```

## 跨工具链一致性
- 此规则仅静态工具链实现，动态工具链无对应校验
- @CustomEnv 是 V2 装饰器，仅在静态工具链（arkui-plugins）中变换处理

- `arkui-plugins/common/predefines.ts:240`（`DecoratorNames.CUSTOM_ENV = 'CustomEnv'`）

## 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| 校验入口 | `validate_ui_syntax.ts:2750`（`checkCustomEnvDecoratorInterop`） | `check-custom-env-decorator.ts:22`（Copyright 2026 新规则） |
| key 校验 | `:2912`（`validateInvalidCustomEnvCreation`） | 在 `__resolveDecoratorSymbols` 方法中检测 |
| 类型一致性 | `:2899`（`validateCustomEnvArgType`） | 同动态 |