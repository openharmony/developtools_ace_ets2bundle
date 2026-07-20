# 功能概述
`@Consumer` 装饰器标记 V2 组件的消费属性，通过别名从祖先组件的 `@Provider` 获取数据，实现跨层状态消费。

## 动态
### 源码参考位置
- `compiler/src/process_struct_componentV2.ts`（V2 属性处理逻辑，`parseConsumerDecorator`）
- `compiler/src/pre_define.ts:99`（`COMPONENTV2_CONSUMER_DECORATOR = '@Consumer'`）

### 转换前的原始代码
```typescript
@ComponentV2
struct ChildComponent {
  @Consumer('theme') currentTheme: string = ''
  build() { Text(this.currentTheme) }
}
```

### 转换后的代码（Legacy）
V2 装饰器仅支持 Partial Update 模式，无 Legacy 输出。

### 转换后的代码（Partial Update）
```typescript
class ChildComponent extends ViewV2 {
  currentTheme: string = ''
  constructor(parent, params, __localStorage, elmtId, paramsLambda, extraInfo) {
    super(parent, elmtId, extraInfo)
    this.currentTheme = ('currentTheme' in params) ? params.currentTheme : ''
    this.finalizeConstruction()
  }
  initialRender() { /* 命令式 */ }
  rerender() { this.updateDirtyElements() }
}
```

### 关键转换逻辑
- `parseConsumerDecorator`（line 705-708）：将属性名加入 `structInfo.consumerDecoratorSet`。
- 移除 `@Consumer` 装饰器，保留为普通属性。
- 别名（alias）用于匹配 `@Provider` 的 key。

## 静态
### 源码参考位置
- `arkui-plugins/ui-plugins/property-translators/consumer.ts:47`（`initializeStructWithConsumerProperty`）
- `arkui-plugins/ui-plugins/property-translators/consumer.ts:92`（`ConsumerTranslator`）
- `arkui-plugins/common/predefines.ts`（`DecoratorNames.CONSUMER = 'Consumer'`）

### 转换前的原始代码
```typescript
@ComponentV2
struct ChildComponent {
  @Consumer('theme') currentTheme: string = ''
  build() { Text(this.currentTheme) }
}
```

### 转换后的代码
```typescript
class ChildComponent extends CustomComponentV2 {
  private __backing_currentTheme: IConsumerDecoratedVariable<string>
  get currentTheme(): string { return this.__backing_currentTheme!.get() }
  set currentTheme(value: string) { this.__backing_currentTheme!.set(value) }

  __initializeStruct(initializers, content): void {
    this.__backing_currentTheme = STATE_MGMT_FACTORY.makeConsumer<string>("theme", "alias", '')
  }
}
```

### 深度逻辑
- `makeType = MAKE_CONSUMER`，生成 backing field + getter/setter + `__initializeStruct` 工厂调用。
- 工厂参数：属性名、别名（alias，从注解中提取或默认为属性名）、初始值。
- 与 `@Provider` 结构对称，通过 alias 匹配建立跨层连接。
- 声明文件：`@Consumer(alias: string = "")`，`IConsumerDecoratedVariable<T>`。
- `arkui-plugins/common/predefines.ts:235`（`DecoratorNames.CONSUMER = 'Consumer'`）
- `arkui-plugins/interop-plugins/emit_transformer.ts:175`（`processProvide`，interop emit 阶段）

## 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| 属性管理 | 普通属性赋值 | `STATE_MGMT_FACTORY.makeConsumer` 工厂 |
| 别名处理 | 仅记录到 set | 从注解提取 alias，传入工厂 |
| 与 @Provider 关系 | 运行时框架通过 alias 匹配 | 工厂调用建立连接 |
| 声明接口 | 无 | `IConsumerDecoratedVariable<T>` |
