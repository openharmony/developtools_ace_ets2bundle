# 功能概述
`@Event` 装饰器标记 V2 组件的回调事件属性，用于声明组件向父组件传递消息的回调接口，未传入时使用空函数作为默认值。

## 动态
### 源码参考位置
- `compiler/src/process_struct_componentV2.ts:662`（`parseEventDecorator`）
- `compiler/src/process_struct_componentV2.ts:320`（`getDefaultValueForEvent`）
- `compiler/src/pre_define.ts:99`（`COMPONENTV2_EVENT_DECORATOR = '@Event'`）

### 转换前的原始代码
```typescript
@ComponentV2
struct MyComponent {
  @Event onClick: (val: string) => void
  build() { Button('click').onClick(() => this.onClick('hello')) }
}
```

### 转换后的代码（Legacy）
V2 装饰器仅支持 Partial Update 模式，无 Legacy 输出。

### 转换后的代码（Partial Update）
```typescript
class MyComponent extends ViewV2 {
  onClick: (val: string) => void
  constructor(parent, params, __localStorage, elmtId, paramsLambda, extraInfo) {
    super(parent, elmtId, extraInfo)
    this.onClick = ('onClick' in params) ? params.onClick : (val: string) => {}
    this.finalizeConstruction()
  }
  resetStateVarsOnReuse(params: Object) {
    this.onClick = ('onClick' in params) ? params.onClick : (val: string) => {}
  }
  initialRender() { /* 命令式 */ }
  rerender() { this.updateDirtyElements() }
}
```

### 关键转换逻辑
- `parseEventDecorator`（line 662）：将属性和类型存入 `structInfo.eventDecoratorMap`。
- `getDefaultValueForEvent`（line 320-328）：根据函数类型节点的参数生成空箭头函数作为默认值；`resetStateVarsOnReuse` 时保留参数签名。
- Event 属性在 `needInitFromParams` 列表中，通过 `createPropertyAssignNode` 从 params 初始化或使用默认空函数。

## 静态
### 源码参考位置
- `arkui-plugins/ui-plugins/property-translators/event.ts:52`（`EventTranslator`）
- `arkui-plugins/ui-plugins/property-translators/event.ts:108`（`EventCachedTranslator`）
- `arkui-plugins/common/predefines.ts`（`DecoratorNames.EVENT = 'Event'`）

### 转换前的原始代码
```typescript
@ComponentV2
struct MyComponent {
  @Event onClick: (val: string) => void
  build() { Button('click').onClick(() => this.onClick('hello')) }
}
```

### 转换后的代码
```typescript
class MyComponent extends CustomComponentV2 {
  private __backing_onClick: IEventDecoratedVariable<(val: string) => void>
  get onClick(): (val: string) => void { return this.__backing_onClick!.get() }
  set onClick(value: (val: string) => void) { this.__backing_onClick!.set(value) }

  __initializeStruct(initializers, content): void {
    this.__backing_onClick = STATE_MGMT_FACTORY.makeEvent("onClick", init)
  }
}
```

### 深度逻辑
- 继承 `RegularPropertyCachedTranslator`，`shouldWrapPropertyType = false`（不包装属性类型，保持原始函数类型），`hasSetter = true`（生成 setter）。
- `hasUpdateStruct = false`：不生成 `__updateStruct`，事件回调不需要从父组件更新。
- `hasToRecord = true`：记录到 record 列表。
- 声明文件：`@Event`，回调方法装饰器。

## 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| 默认值 | `getDefaultValueForEvent` 生成空箭头函数 | 工厂调用处理 |
| 类型包装 | 无 | `shouldWrapPropertyType = false`，不包装 |
| setter | 普通属性可直接赋值 | 生成 backing field + getter/setter |
| 声明接口 | 无 | `IEventDecoratedVariable<T>` |
