# 规则
校验 `@Provider`/`@Consumer` 装饰器只能修饰成员属性、不可与其他内置装饰器同时使用、且不可在父组件构造时初始化。

## 源码参考位置
- 动态：
  - `compiler/src/validate_ui_syntax.ts:734`（V2 装饰器集合包含 Provider/Consumer）
  - `compiler/src/process_struct_componentV2.ts:607-608,700-705`（parseProviderDecorator/parseConsumerDecorator）
  - `compiler/src/process_custom_component.ts:516-518`（COMPONENTV2_CONSUMER_DECORATOR/COMPONENTV2_PROVIDER_DECORATOR）
- 静态：
  - `arkui-plugins/collectors/ui-collectors/validators/rules/check-consumer-provider-decorator.ts:47`

## 适用对象
`@ComponentV2` 装饰的 struct 成员属性（@Provider/@Consumer 装饰的属性）

## 报错信息
- 动态：
  - Provider/Consumer 变换在 `process_struct_componentV2.ts` 中处理，无独立校验报错
- 静态：
  - `'@Consumer' can only decorate member property.`（ERROR）
  - `'@Provider' can only decorate member property.`（ERROR）
  - `The struct member variable can not be decorated by multiple built-in annotations.`（ERROR）
  - `The '@${decorator}' property '${key}' in the custom component '${component}' cannot be initialized here (forbidden to specify).`（ERROR）

## 错误码
无显式错误码（静态工具链以 LogType.ERROR 报告）

## 核心校验规则
1. `@Provider`/`@Consumer` 只能用来修饰类成员属性，不能修饰方法、参数、变量声明、接口声明、类型别名等（非属性节点上出现时通过 `ignoredAnnotations` 检测并报错）
2. 结构体成员变量不能被多个内置装饰器修饰：当 @Provider 或 @Consumer 属性上还存在其他内置装饰器时报错，建议移除其他装饰器
3. 自定义组件中的 `@Provider`/`@Consumer` 装饰的属性不能在父组件构造时初始化（禁止指定初始值）：通过检查 struct 调用处传入的属性参数，若属性名匹配到 @Provider/@Consumer 装饰的属性则报错
4. 校验按节点类型分发：
   - `METHOD_DEFINITION`、`SCRIPT_FUNCTION`、`VARIABLE_DECLARATION`、`TS_INTERFACE_DECLARATION`、`TS_TYPE_ALIAS_DECLARATION` -> 检查非属性节点上的装饰器
   - `CLASS_PROPERTY` -> 检查多装饰器冲突
   - `CALL_EXPRESSION` -> 检查父组件构造时初始化

## 示例代码
### 反例
```typescript
// 反例1：@Consumer 装饰方法
@ComponentV2
struct MyComp {
  @Consumer
  myMethod() { }              // 错误：@Consumer 只能装饰成员属性
}

// 反例2：@Provider 与其他内置装饰器同时使用
@ComponentV2
struct MyComp {
  @Local @Provider
  count: number = 0           // 错误：不可被多个内置装饰器修饰
}

// 反例3：父组件构造时初始化 @Provider 属性
@ComponentV2
struct Parent {
  build() {
    Child({ providerProp: 42 })  // 错误：@Provider 属性不可在此初始化
  }
}
@ComponentV2
struct Child {
  @Provider providerProp: number = 0
  build() { }
}
```

### 正例
```typescript
@ComponentV2
struct MyComp {
  @Provider themeColor: ResourceColor = Color.Black
  @Consumer accountInfo: string = 'default'
  build() { }
}
```

## 校验实现细节

### alias 参数匹配机制
`@Provider('alias')` 和 `@Consumer('alias')` 可传入 alias 参数用于跨组件匹配。Provider 向下提供数据，Consumer 向上查找最近的同 alias Provider。匹配机制基于 alias 字符串相等，未传 alias 时使用属性名作为默认 alias。

### 不可外部初始化的具体报错文案
当父组件构造时传入 `@Provider`/`@Consumer` 装饰的属性初始值，报 ERROR：
```
The '@${decorator}' property '${key}' in the custom component '${component}' cannot be initialized here (forbidden to specify).
```
其中 `decorator` 为 `Provider` 或 `Consumer`，`key` 为属性名，`component` 为子组件名。

### FixSuggestion
- 非属性节点上的 `@Provider`/`@Consumer`：建议 `Remove the annotation`（移除注解）
- `@Provider`/`@Consumer` 属性上存在其他内置装饰器：建议 `Remove other annotations`（移除其他注解）
- 父组件构造时初始化 `@Provider`/`@Consumer` 属性：建议 `Remove the property`（移除该属性）

### 按节点类型分发的校验
通过 `checkByType` Map 分发：
- `METHOD_DEFINITION`、`SCRIPT_FUNCTION`、`VARIABLE_DECLARATION`、`TS_INTERFACE_DECLARATION`、`TS_TYPE_ALIAS_DECLARATION` -> `checkConsumerProviderDecoratorOnNonProperty`（检查非属性节点）
- `CLASS_PROPERTY` -> `checkConsumerProviderDecoratorInProperty`（检查多装饰器冲突）
- `CALL_EXPRESSION` -> `checkConsumerProviderDecoratorInStructCall`（检查父组件构造时初始化）

### 源码位置
`arkui-plugins/collectors/ui-collectors/validators/rules/check-consumer-provider-decorator.ts:34`

## 静态
### 源码参考位置
- `arkui-plugins/collectors/ui-collectors/validators/rules/check-consumer-provider-decorator.ts:34`
### 静态工具链处理
静态工具链通过 `check-consumer-provider-decorator.ts` 校验 @Provider/@Consumer：仅用于成员属性、不可与其他内置装饰器同时使用、不可在父组件构造时初始化。支持 `FixSuggestion`（建议移除注解或移除属性）。

## 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| 校验入口 | `validate_ui_syntax.ts`（分散校验） | `check-consumer-provider-decorator.ts:34` |
| 报错条数 | 分散 | 4 条（仅属性、不可多装饰器、不可外部初始化） |
| 自动修复 | 无 | 有（建议移除注解、移除属性） |