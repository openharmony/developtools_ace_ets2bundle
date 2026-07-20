# 规则
校验 `@Entry` 组件中不可使用 `@PropRef`、`@Link`、`@ObjectLink` 装饰器（这些装饰器需要从父组件传入，而 @Entry 是根组件无父组件）。

## 源码参考位置
- 动态：
  - `compiler/src/process_component_member.ts:522-528`（`checkDecoratorIsIllegalInEntry`）
  - `compiler/src/process_component_member.ts:1442-1450`（`validateHasIllegalDecoratorInEntry`）
  - `compiler/src/process_component_member.ts:164-165`（`mandatoryToInitViaParamDecorators` 包含 @Prop、@Link、@ObjectLink）
- 静态：
  - `arkui-plugins/collectors/ui-collectors/validators/rules/check-no-prop-link-objectlink-in-entry.ts:36`

## 适用对象
`@Entry` 装饰的 struct 中的成员属性

## 报错信息
- 动态：
  - `The '@Entry' component '${parentName}' cannot have the '${decorator}' property '${propertyName}'.`（WARN）
- 静态：
  - `The '@Entry' component '${componentName}' cannot have the '@${decoratorName}' property '${propertyName}'.`（WARN）

## 错误码
无显式错误码（WARN 级别）

## 核心校验规则
1. 前置条件：struct 被判断为 Entry 组件（动态侧 `parentName.getText() === componentCollection.entryComponent`；静态侧 `metadata.structInfo.annotationInfo.hasEntry` 为 true）
2. 非法装饰器集合：`@PropRef`（`PROP_REF`）、`@Link`（`LINK`）、`@ObjectLink`（`OBJECT_LINK`）
3. 动态侧通过 `mandatoryToInitViaParamDecorators` 集合判断，该集合包含 `@Prop`、`@Link`、`@ObjectLink`，这些装饰器必须通过父组件参数初始化，@Entry 无父组件故非法
4. 静态侧遍历 `invalidDecorators` 数组，检查 `metadata.annotations` 中是否包含对应装饰器
5. 命中时报 WARN，并建议移除该装饰器（静态侧提供 `Remove the annotation` 建议）

## 示例代码
### 反例
```typescript
@Entry
struct MyComp {
  @Link count: number          // 错误：@Entry 组件无父组件，@Link 无法从父组件接收数据
  @Prop name: string           // 错误：@Prop 同理
  @ObjectLink data: MyData     // 错误：@ObjectLink 同理
  build() { }
}
```

### 正例
```typescript
@Entry
struct MyComp {
  @State count: number = 0     // @State 自管理状态，可用于 @Entry
  build() { }
}
```

## 校验实现细节

### @Entry 是根组件无父组件的原理
`@Entry` 装饰的 struct 是页面入口组件，作为组件树的根节点，没有父组件。因此所有需要从父组件接收数据的装饰器在 `@Entry` 组件中均无意义。

### @PropRef/@Link/@ObjectLink 不可使用的原因
- `@PropRef`（PROP_REF）：单向数据绑定，需父组件传入值
- `@Link`（LINK）：双向数据绑定，需父组件传入引用
- `@ObjectLink`（OBJECT_LINK）：对象引用，需父组件传入 `@Observed` 装饰的类实例
以上三种装饰器（`invalidDecorators` 数组）均要求父组件在构造时传入初始化值，而 `@Entry` 无父组件，故不可使用。

### 具体报错文案
```
The '@Entry' component '${componentName}' cannot have the '@${decoratorName}' property '${propertyName}'.
```
同时提供 FixSuggestion：`Remove the annotation`（建议移除该装饰器）。

### 校验逻辑流程
1. 检查 `metadata.structInfo?.annotationInfo?.hasEntry` 是否为 true（是否为 Entry 组件）
2. 遍历 `invalidDecorators` 数组，对每个装饰器名检查 `metadata.annotations?.[decoratorName]` 是否存在
3. 命中时报 WARN 级别日志

### 源码位置
`arkui-plugins/collectors/ui-collectors/validators/rules/check-no-prop-link-objectlink-in-entry.ts`

## 静态
### 源码参考位置
- `arkui-plugins/collectors/ui-collectors/validators/rules/check-no-prop-link-objectlink-in-entry.ts`
### 静态工具链处理
静态工具链通过 `check-no-prop-link-objectlink-in-entry.ts` 校验 @Entry 组件不可使用 @PropRef/@Link/@ObjectLink 装饰器（这些装饰器需要从父组件传入值，而 @Entry 是根组件无父组件）。支持 `FixSuggestion`（建议移除组件调用）。
- `compiler/src/validate_ui_syntax.ts:470`（`validateStruct`）

## 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| 校验入口 | `validate_ui_syntax.ts:470`（`validateStruct`） | `check-no-prop-link-objectlink-in-entry.ts` |
| 检测原理 | @Entry 是根组件无父组件，不可使用需父传入的装饰器 | 同动态 |