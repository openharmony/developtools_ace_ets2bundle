# 规则
校验属性不可同时被 `private` 和 `@Require` 装饰器修饰。

## 源码参考位置
- 动态：`compiler/src/validate_ui_syntax.ts:2699`（`checkRequire`，@Require 放宽默认值要求）
- 动态：`compiler/src/validate_ui_syntax.ts:2610`（`validateAccessQualifier`，private + @Require 校验） 中的 `@Require` 装饰器校验逻辑
- 静态：`arkui-plugins/collectors/ui-collectors/validators/rules/check-require-decorator-regular.ts:34`

## 适用对象
- struct 成员属性（`@Require` 装饰的属性）

## 报错信息
- 动态：
  - `The 'private' modified property '${propertyName}' cannot be decorated with '@Require'.`（WARN）
- 静态：
  - `Property '${propertyName}' can not be decorated with both 'Require' and private.`（WARN）

## 错误码
- 无数字错误码（静态工具链使用规则名标识，WARN 级别）

## 核心校验规则
1. 属性不可同时被 `private` 修饰符和 `@Require` 装饰器修饰
2. 校验等级为 WARN（警告，非错误）
3. 校验时机：checked 阶段，在 `BaseValidator` 对 `ClassProperty` 节点遍历时触发
4. 判定条件：节点的 `annotations` 中存在 `DecoratorNames.REQUIRE` 装饰器，且 `isPrivateClassProperty(node)` 返回 true 时报错

## 校验实现细节
### 静态工具链实现
源码位于 `check-require-decorator-regular.ts`，核心逻辑如下：

1. **元数据获取**：从 `this.context`（`StructPropertyInfo`）读取 `metadata.annotations?.[DecoratorNames.REQUIRE]`，若不存在 `@Require` 装饰器则直接返回，不做校验。
2. **private 判定**：调用 `isPrivateClassProperty(node)` 判断该 `ClassProperty` 节点是否被 `private` 修饰符修饰。该工具函数位于 `arkui-plugins/collectors/ui-collectors/validators/utils`，通过检查节点的修饰符字段判定。
3. **双重条件**：只有当 `@Require` 装饰器存在 **且** 属性为 `private` 时才报错。二者缺一不触发。
4. **属性名获取**：从 `metadata.name` 获取属性名用于拼接错误信息，若属性名为空则跳过报告。
5. **报告位置**：诊断报告锚定在 `requireDecorator` 节点（即 `@Require` 装饰器节点本身），便于 IDE 精确定位。

### 动态工具链实现
`compiler/src/validate_ui_syntax.ts:2699`（`checkRequire`，@Require 放宽默认值要求）
- 动态：`compiler/src/validate_ui_syntax.ts:2610`（`validateAccessQualifier`，private + @Require 校验） 中对 `@Require` 装饰器进行语法校验时，检测同一属性上的 `private` 修饰符，输出 WARN 级诊断。

## 适用场景
- `@Require` 装饰器用于在 V1 状态管理中标记必须由父组件传入的参数，配合 `@Prop` / `@State` 等使用
- `private` 修饰符限制属性仅在当前 struct 内部可见
- 二者冲突原因：`@Require` 要求属性对外可见以接受父组件传值，而 `private` 限制外部访问，语义矛盾
- 仅适用于 `@Component` 装饰的 struct 成员属性

## 自动修复建议
- **移除 `private` 修饰符**：保留 `@Require` 装饰器，使属性可被父组件传入
  ```typescript
  // 修复前
  @Require private requiredProp: number = 0
  // 修复后
  @Require requiredProp: number = 0
  ```
- 若该属性确实需要私有访问，则应移除 `@Require` 装饰器，改用普通 `private` 属性
- 不建议通过忽略警告绕过，因为运行时 `@Require` 的必传校验会导致组件构造失败

## 示例代码
### 反例
```typescript
@Component
struct MyComp {
  @Require private requiredProp: number = 0  // private + @Require 同时使用
  build() { Text('hello') }
}
```

### 正例
```typescript
@Component
struct MyComp {
  @Require requiredProp: number = 0           // @Require 非 private
  private privateProp: number = 0             // private 无 @Require
  build() { Text('hello') }
}
```

## 跨工具链一致性
- 动态工具链（compiler）和静态工具链（arkui-plugins）均实现此规则，错误信息文案略有差异但语义一致
- 两条工具链均为 WARN 级别，不阻断编译，但建议修复以避免运行时语义问题

## 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| 校验入口 | `validate_ui_syntax.ts:2699`（`checkRequire`）+ `:2610`（`validateAccessQualifier`） | `check-require-decorator-regular.ts:23` |
| 报错级别 | WARN | WARN |
| 检测内容 | private + @Require 不可同时使用 | 同动态 |