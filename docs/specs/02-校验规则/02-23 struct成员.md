# 规则
校验 struct 成员属性必须有显式类型注解、必须/禁止指定默认值的装饰器规则、属性可选性限制、静态成员限制、protected 限制、继承限制。

## 源码参考位置
- 动态：
  - `compiler/src/validate_ui_syntax.ts:3394-3413`（`validateStateVariable`）
  - `compiler/src/validate_ui_syntax.ts:2678-2684`（`getAccessQualifier`，protected 限制）
  - `compiler/src/validate_ui_syntax.ts:3415-3421`（`validateStaticBlock`，静态代码块限制）
  - `compiler/src/validate_ui_syntax.ts:3467-3477`（`validateStmgmtKeywords`，关键字命名）
- 静态：
  - `arkui-plugins/collectors/ui-collectors/validators/rules/check-struct-attribute-no-type.ts:22`
  - `arkui-plugins/collectors/ui-collectors/validators/rules/check-struct-variable-initialization.ts:22`
  - `arkui-plugins/collectors/ui-collectors/validators/rules/check-struct-property-optional.ts:22`
  - `arkui-plugins/collectors/ui-collectors/validators/rules/check-struct-property-decorator.ts:25`
  - `arkui-plugins/collectors/ui-collectors/validators/rules/check-property-modifiers.ts:23`

## 适用对象
struct 声明及其成员

## 报错信息
- 动态：
  - `'${decoratorName}' can not decorate the method.`（错误码 10905112）
  - `The member attributes of a struct can not be protected.`（WARN）
  - `Static code blocks not supported in structs.`（WARN）
  - `Methods, properties and accessors in structures decorated by '@Component' and '@ComponentV2' cannot have name as '${itemName}'.`（WARN）
- 静态：
  - `Struct property '{{propertyName}}' has no type.`
  - `The '@{{decoratorName}}' property must be specified a default value.`（@State/@StorageLink/@StorageProp/@LocalStorageLink/@Provide）
  - `The '@{{decoratorName}}' property cannot be specified a default value.`（@Link/@ObjectLink）
  - `The '{{decoratorName}}' property '{{propertyName}}' cannot be an optional parameter.`（@Link/@ObjectLink）
  - `The static variable of struct cannot be used together with built-in annotations.`
  - `Structs are not allowed to inherit from classes or implement interfaces.`
  - `The member attributes of a struct can not be protected.`

## 错误码
- 10905112：属性装饰器用于方法

## 核心校验规则
1. struct 成员属性必须有显式类型注解
2. 必须初始化的装饰器：@State、@StorageLink、@StorageProp、@LocalStorageLink、@Provide（@Require 配合时允许不初始化）
3. 禁止初始化的装饰器：@Link、@ObjectLink
4. @Link/@ObjectLink 属性不可为可选参数（带 `?`）；@Prop 无初始值时也不可为可选参数
5. static 属性不可使用 V1/V2 装饰器；static 方法不可使用 @Monitor
6. struct 成员属性不可使用 `protected` 修饰符
7. struct 不可有静态代码块
8. struct 不可继承类或实现接口
9. struct 成员名不可与状态管理白名单关键字同名
10. 属性装饰器（@State/@Prop/@Link 等）不可装饰方法

## 示例代码
### 反例
```typescript
@Component
struct MyComp {
  @State count                          // 无类型注解
  @Link data?: string                   // @Link 不可为可选
  @ObjectLink obj: MyData = new MyData() // @ObjectLink 不可有默认值
  protected prop: number = 0            // protected 限制
  static @State staticProp: number = 0  // static + 装饰器
  static { }                            // 静态代码块
  @State myMethod(): void { }           // 装饰器用于方法
}

struct ExtendsComp extends BaseStruct { }  // struct 不可继承
```

### 正例
```typescript
@Component
struct MyComp {
  @State count: number = 0
  @Link data: string
  @ObjectLink obj: MyData
  private prop: number = 0
  build() { Text('hello') }
}
```

## 静态
### 源参考位置
- `arkui-plugins/collectors/ui-collectors/validators/rules/check-struct-attribute-no-type.ts:22`
- `arkui-plugins/collectors/ui-collectors/validators/rules/check-struct-property-decorator.ts:25`
- `arkui-plugins/collectors/ui-collectors/validators/rules/check-struct-property-optional.ts:22`
- `arkui-plugins/collectors/ui-collectors/validators/rules/check-struct-variable-initialization.ts:22`
- `arkui-plugins/collectors/ui-collectors/validators/rules/check-property-modifiers.ts:23`
### 静态工具链处理
静态工具链通过 5 个独立规则文件分别校验 struct 成员规则：属性必须有类型注解（check-struct-attribute-no-type）、静态属性不可使用装饰器（check-struct-property-decorator）、@Link/@ObjectLink 不可为可选参数（check-struct-property-optional）、必须/禁止初始化的装饰器规则（check-struct-variable-initialization）、访问修饰符与装饰器兼容性（check-property-modifiers）。

## 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| 属性类型注解 | validate_ui_syntax.ts:3394（validateStateVariable） | check-struct-attribute-no-type.ts:22 |
| 静态成员限制 | validate_ui_syntax.ts:3415（validateStaticBlock） | check-struct-property-decorator.ts:25 |
| 可选参数 | validate_ui_syntax.ts | check-struct-property-optional.ts:22 |
| 初始化规则 | validate_ui_syntax.ts | check-struct-variable-initialization.ts:22 |
| 访问修饰符 | validate_ui_syntax.ts:2610（validateAccessQualifier） | check-property-modifiers.ts:23 |
| 关键字命名 | validate_ui_syntax.ts:3467（validateStmgmtKeywords） | 无对应 |