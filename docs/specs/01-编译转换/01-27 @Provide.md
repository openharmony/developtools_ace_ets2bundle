# 功能概述
`@Provide` 装饰器标记祖先组件向后代组件提供的共享状态，与 `@Consume` 配合实现跨层级数据传递。

## 动态
### 源码参考位置
- `compiler/src/process_component_member.ts:1204-1219`（`addAddProvidedVar`）
- `compiler/src/process_component_member.ts:1221-1229`（`createAddProvidedVar`）
- `compiler/src/pre_define.ts:42`（`COMPONENT_PROVIDE_DECORATOR = '@Provide'`）

### 转换前的原始代码
```typescript
@Component
struct Parent {
  @Provide theme: string = 'dark'
}
```

### 转换后的代码（Legacy）
```typescript
this.__theme = new ObservedPropertySimple('dark', this, 'theme')
this.addProvidedVar('theme', this.__theme)
get theme(): string { return this.__theme.get() }
set theme(newValue: string) { this.__theme.set(newValue) }
```

### 转换后的代码（Partial Update）
```typescript
this.__theme = new ObservedPropertySimplePU('dark', this, 'theme')
this.addProvidedVar('theme', this.__theme)
get theme(): string { return this.__theme.get() }
set theme(newValue: string) { this.__theme.set(newValue) }
```

## 静态
### 源码参考位置
- `arkui-plugins/ui-plugins/property-translators/provide.ts:49`（`initializeStructWithProvideProperty`）
- `arkui-plugins/common/predefines.ts:211`（`DecoratorNames.PROVIDE = 'Provide'`）
- `arkui-plugins/common/predefines.ts:282`（`StateManagementTypes.PROVIDE_DECORATED`）
- `arkui-plugins/common/predefines.ts:316`（`StateManagementTypes.MAKE_PROVIDE = 'makeProvide'`）

### 转换前的原始代码
```typescript
@Component
struct Parent {
  @Provide theme: string = 'dark'
}
```

### 转换后的代码
```typescript
private __backing_theme: IProvideDecoratedVariable<string>
get theme(): string { return this.__backing_theme!.get() }
set theme(value: string) { this.__backing_theme!.set(value) }

__initializeStruct(initializers, content): void {
  this.__backing_theme = STATE_MGMT_FACTORY.makeProvide<string>("theme",
    alias, initValue, allowOverride, watchCb?)
}
```

> 声明文件参考：`interface/sdk-js/api/arkui/stateManagement/decorator.static.d.ets`，签名为 `@Provide(alias: string = "", allowOverride: boolean = false)`。
- @Provide 的 alias 参数：`addAddProvidedVar`（`process_component_member.ts:1204`）生成 `this.addProvidedVar('name', this.__prop)`
- @Provide 的 allowOverride 参数控制是否允许后代覆盖
- @Provide 初始化方式与 @State 相同，额外调用 `addProvidedVar` 注册到 ProvidedVar
- @Provide 的 alias 参数允许后代通过不同名称消费
- @Provide 的 `allowOverride` 参数控制是否允许后代 @Provide 覆盖
- 声明文件：`@Provide(alias: string = "", allowOverride: boolean = false)`

- alias 和 allowOverride 参数提取：`process_component_member.ts:1204`（`addAddProvidedVar`）
- @Provide 初始化与 @State 相同，额外注册到 ProvidedVar
- @Provide 的 `allowOverride` 参数：`process_component_member.ts:1216`（`addAddProvidedVar` 中的 allowOverride 逻辑）

## 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| 注册机制 | 先 `new` 包装类，再调用 `this.addProvidedVar()` 注册 | 工厂方法 `makeProvide` 内部完成创建与注册 |
| 别名支持 | 通过 `getDecoratorKey` 解析装饰器参数 | 通过 `ProvideOptions`（alias、allowOverride）解析 |
| allowOverride | 无显式参数 | 通过 `ProvideOptions.allowOverride` 传入 |
| 包装类 | `ObservedPropertySimple`/`ObservedPropertySimplePU` | `IProvideDecoratedVariable<T>` 接口 |
