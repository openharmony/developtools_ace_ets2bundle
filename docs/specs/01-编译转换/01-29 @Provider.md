# 功能概述
`@Provider` 装饰器标记 V2 组件的状态提供属性，将状态向后代组件单向跨层传递，后代通过 `@Consumer` 消费。

## 动态
### 源码参考位置
- `compiler/src/process_struct_componentV2.ts`（V2 属性处理逻辑，`parseProviderDecorator`）
- `compiler/src/pre_define.ts:99`（`COMPONENTV2_PROVIDER_DECORATOR = '@Provider'`）

### 转换前的原始代码
```typescript
@ComponentV2
struct ParentComponent {
  @Provider('theme') theme: string = 'dark'
  build() { ChildComponent() }
}
```

### 转换后的代码（Legacy）
V2 装饰器仅支持 Partial Update 模式，无 Legacy 输出。

### 转换后的代码（Partial Update）
```typescript
class ParentComponent extends ViewV2 {
  theme: string = 'dark'
  constructor(parent, params, __localStorage, elmtId, paramsLambda, extraInfo) {
    super(parent, elmtId, extraInfo)
    this.theme = ('theme' in params) ? params.theme : 'dark'
    this.finalizeConstruction()
  }
  initialRender() { /* 命令式 */ }
  rerender() { this.updateDirtyElements() }
}
```

### 关键转换逻辑
- `parseProviderDecorator`（line 700-703）：将属性名加入 `structInfo.providerDecoratorSet`。
- 移除 `@Provider` 装饰器，保留为普通属性。
- 别名（alias）用于匹配 `@Consumer` 的 key。

## 静态
### 源码参考位置
- `arkui-plugins/ui-plugins/property-translators/provider.ts:47`（`initializeStructWithProviderProperty`）
- `arkui-plugins/ui-plugins/property-translators/provider.ts:92`（`ProviderTranslator`）
- `arkui-plugins/interop-plugins/emit_transformer.ts:175`（`allowOverride` 和 `alias` 兼容性转换）
- `arkui-plugins/common/predefines.ts`（`DecoratorNames.PROVIDER = 'Provider'`）

### 转换前的原始代码
```typescript
@ComponentV2
struct ParentComponent {
  @Provider('theme') theme: string = 'dark'
  build() { ChildComponent() }
}
```

### 转换后的代码
```typescript
class ParentComponent extends CustomComponentV2 {
  private __backing_theme: IProviderDecoratedVariable<string>
  get theme(): string { return this.__backing_theme!.get() }
  set theme(value: string) { this.__backing_theme!.set(value) }

  __initializeStruct(initializers, content): void {
    this.__backing_theme = STATE_MGMT_FACTORY.makeProvider<string>("theme", "alias", "dark")
  }
}
```

### 深度逻辑
- `makeType = MAKE_PROVIDER`，生成 backing field + getter/setter + `__initializeStruct` 工厂调用。
- 工厂参数：属性名、别名（alias，从注解中提取或默认为属性名）、初始值。
- interop emit 阶段（`emit_transformer.ts:175`）：处理 `allowOverride` 和 `alias` 的兼容性转换。
- 声明文件：`@Provider(alias: string = "")`，`IProviderDecoratedVariable<T> extends IDecoratedMutableVariable, IDecoratedV2Variable`。
- `arkui-plugins/common/predefines.ts:234`（`DecoratorNames.PROVIDER = 'Provider'`）

## 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| 属性管理 | 普通属性赋值 | `STATE_MGMT_FACTORY.makeProvider` 工厂 |
| 别名处理 | 仅记录到 set | 从注解提取 alias，传入工厂 |
| interop 兼容 | 无 | `emit_transformer.ts` 处理 `allowOverride`/`alias` |
| 声明接口 | 无 | `IProviderDecoratedVariable<T>` |
