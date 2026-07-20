# 功能概述
`@Consume` 装饰器标记后代组件消费祖先组件通过 `@Provide` 提供的共享状态，实现跨层级数据传递。

## 动态
### 源码参考位置
- `compiler/src/process_component_member.ts:975-1015`（`updateConsumeProperty`）
- `compiler/src/pre_define.ts:43`（`COMPONENT_CONSUME_DECORATOR = '@Consume'`）

### 转换前的原始代码
```typescript
@Component
struct Child {
  @Consume theme: string
}
```

### 转换后的代码（Legacy）
```typescript
this.__theme = this.initializeConsume('theme', undefined)
get theme(): string { return this.__theme.get() }
set theme(newValue: string) { this.__theme.set(newValue) }
```

### 转换后的代码（Partial Update）
```typescript
this.__theme = this.initializeConsume('theme', undefined)
get theme(): string { return this.__theme.get() }
set theme(newValue: string) { this.__theme.set(newValue) }
```

## 静态
### 源码参考位置
- `arkui-plugins/ui-plugins/property-translators/consume.ts:48`（`initializeStructWithConsumeProperty`）
- `arkui-plugins/common/predefines.ts:212`（`DecoratorNames.CONSUME = 'Consume'`）
- `arkui-plugins/common/predefines.ts:283`（`StateManagementTypes.CONSUME_DECORATED`）
- `arkui-plugins/common/predefines.ts:317`（`StateManagementTypes.MAKE_CONSUME = 'makeConsume'`）

### 转换前的原始代码
```typescript
@Component
struct Child {
  @Consume theme: string
}
```

### 转换后的代码
```typescript
private __backing_theme: IConsumeDecoratedVariable<string>
get theme(): string { return this.__backing_theme!.get() }
set theme(value: string) { this.__backing_theme!.set(value) }

__initializeStruct(initializers, content): void {
  this.__backing_theme = STATE_MGMT_FACTORY.makeConsume<string>("theme",
    alias, undefined, { defaultValue: v }?)
}
```

> 声明文件参考：`@Consume(alias: string = "")`。
- @Consume 通过 `initializeConsume`（`process_component_member.ts:975`）从祖先查找 ProvidedVar
- @Consume 的 alias 参数指定消费的 @Provide alias 名称
- @Consume 不需要默认值（`mandatorySpecifyDefaultValueDecorators` 不含 @Consume）
- @Consume 通过 `initializeConsume` 从祖先组件查找 ProvidedVar
- @Consume 的 alias 参数指定要消费的 @Provide alias 名称
- 类型映射为 `ObservedPropertyAbstract`/`ObservedPropertyAbstractPU`

- `initializeConsume` 从祖先查找（`process_component_member.ts:975`）
- @Consume 不需要默认值
- `initializeConsume` 从祖先查找（`process_component_member.ts:975`）
- @Consume 不需要默认值（不在 `mandatorySpecifyDefaultValueDecorators` 中）

- @Consume 的 alias 参数：`process_component_member.ts:990`（从装饰器参数提取 alias）

## 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| 获取方式 | 调用 `this.initializeConsume()` 从 Provide 链查找 | 工厂方法 `makeConsume` 内部查找 |
| 别名解析 | 通过 `getDecoratorKey` 解析单参数/无参数 | 通过 `getValueInAnnotation` 解析 alias |
| 默认值 | 支持 `node.initializer` 作为默认值 | 通过 `{ defaultValue: v }` 可选对象传入 |
| resetOnReuse | API>=26 时生成 `reInitializeConsume` 调用 | 由 `initializeOptions` 控制 |
