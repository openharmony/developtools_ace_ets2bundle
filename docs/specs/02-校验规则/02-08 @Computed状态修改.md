# 规则
校验 `@Computed` getter 方法中不可修改状态变量（包括赋值、自增/自减等操作）。

## 源码参考位置
- 动态：`compiler/src/validate_ui_syntax.ts:3514`（`handleLifecycleDecorator`，@Computed getter 修改检测）
- 静态：`arkui-plugins/collectors/ui-collectors/validators/rules/check-computed-state-modification.ts:46`

## 适用对象
- struct/class 的成员方法（`@Computed` 装饰的 getter 方法）

## 报错信息
- 动态：
  - 无对应动态工具链校验
- 静态：
  - `State variables cannot be modified within a getter function decorated with '@Computed'.`

## 错误码
- 无数字错误码（静态工具链使用规则名标识）

## 核心校验规则
1. `@Computed` 装饰的 getter 方法中不可修改状态变量
2. 状态变量包括被以下装饰器修饰的属性：@State、@Local、@Param、@Once、@Link、@PropRef、@StorageLink、@StoragePropRef、@LocalStorageLink、@LocalStoragePropRef、@ObjectLink、@Provide、@Consume、@Provider、@Consumer、@Env、@Event、@Trace、@Track
3. 检查的修改操作包括：赋值表达式（`=`、`+=`、`-=`、`*=`、`/=`、`%=`）和更新表达式（`++`、`--`）
4. 仅检查 `this.<property>` 形式的成员表达式赋值，跳过匿名函数（箭头函数、函数表达式）内的修改

## 示例代码
### 反例
```typescript
@ComponentV2
struct MyComp {
  @Local count: number = 0

  @Computed
  get doubled(): number {
    this.count = this.count + 1      // getter 中修改 @Local 状态变量
    return this.count * 2
  }

  build() { Text(this.doubled.toString()) }
}
```

### 正例
```typescript
@ComponentV2
struct MyComp {
  @Local count: number = 0

  @Computed
  get doubled(): number {
    return this.count * 2            // getter 中只读取，不修改
  }

  build() { Text(this.doubled.toString()) }
}
```

## 校验实现细节

### 检测的状态变量类型列表
静态工具链在 `STATE_DECORATOR_NAMES` 集合中定义了 19 种状态装饰器，被这些装饰器修饰的属性视为状态变量，不可在 `@Computed` getter 中修改：
- @State、@Local、@Param、@Once、@Link、@PropRef、@StorageLink、@StoragePropRef、@LocalStorageLink、@LocalStoragePropRef、@ObjectLink、@Provide、@Consume、@Provider、@Consumer、@Env、@Event、@Trace、@Track

### 箭头函数内修改的豁免规则
`traverseBody` 遍历 getter 方法体子节点时，遇到 `ArrowFunctionExpression`（箭头函数）或 `FunctionExpression`（函数表达式）直接 `continue` 跳过，不递归检测其内部的赋值/更新操作。因此 getter 内嵌套匿名函数中的状态变量修改不会触发报错。

### 具体检测操作
- **赋值表达式**（`isAssignmentExpression`）：检测 `this.xxx = value`、`this.xxx += value`、`this.xxx -= value`、`this.xxx *= value`、`this.xxx /= value`、`this.xxx %= value`，检查左侧是否为 `this.<property>` 形式的 `MemberExpression`
- **更新表达式**（`isUpdateExpression`）：检测 `this.xxx++`、`this.xxx--`（前置/后置均检测），检查参数是否为 `this.<property>` 形式的 `MemberExpression`
- 通过 `findLastPropertyInChain` 沿 `.object` 链向上追溯，要求根节点为 `ThisExpression` 才认定为 `this.xxx` 成员访问
- 通过 `isStateVariableProperty` 解析属性声明节点（`getPeerIdentifierDecl`），检查该 `ClassProperty` 是否含状态装饰器（`hasStateDecorator`）

### 源码位置
`arkui-plugins/collectors/ui-collectors/validators/rules/check-computed-state-modification.ts:46`

## 静态
### 源码参考位置
- `arkui-plugins/collectors/ui-collectors/validators/rules/check-computed-state-modification.ts:46`
### 静态工具链处理
静态工具链通过 `check-computed-state-modification.ts`（Copyright 2026 新规则）校验 @Computed getter 中不可修改状态变量。遍历方法体检测赋值/自增/自减操作，箭头函数内的修改豁免。报错级别为 ERROR。

- `arkui-plugins/common/predefines.ts:233`（`DecoratorNames.COMPUTED = 'Computed'`）

## 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| 校验入口 | `validate_ui_syntax.ts` 中 @Computed getter 修改检测 | `check-computed-state-modification.ts:46` 专责校验 |
| 检测范围 | 检测 @Computed getter 内的状态变量赋值/自增 | 同动态，含 17 种状态装饰器变量检测 |
| 箭头函数豁免 | 箭头函数内修改不报错 | 同动态