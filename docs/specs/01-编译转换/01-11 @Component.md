# 功能概述
`@Component` 装饰器标记 struct 为自定义组件，触发 struct -> class 转换、构造函数生成、生命周期方法处理。

## 动态
### 源码参考位置
- `compiler/src/process_component_class.ts:175`（`processComponentClass`）
- `compiler/src/pre_define.ts:24`（`COMPONENT_DECORATOR = '@Component'`）
- `compiler/src/pre_define.ts:186`（`BASE_COMPONENT_NAME = 'View'`）
- `compiler/src/pre_define.ts:639`（`BASE_COMPONENT_NAME_Partial Update = 'ViewPU'`）

### 转换前的原始代码
```typescript
@Component
struct MyComponent {
  @State count: number = 0
  build() { Text(this.count.toString()) }
}
```

### 转换后的代码（Legacy）
```typescript
class MyComponent extends View {
  constructor(compilerAssignedUniqueChildId, parent, params, localStorage) {
    super(compilerAssignedUniqueChildId, parent, localStorage)
    this.updateWithValueParams(params)
    this.__count = new ObservedPropertySimple(0, this, 'count')
  }
  // ...
  render() { /* create/pop 命令式 */ }
  rerender() { this.updateDirtyElements() }
}
```

### 转换后的代码（Partial Update）
```typescript
class MyComponent extends ViewPU {
  constructor(parent, params, __localStorage, elmtId, paramsLambda, extraInfo) {
    super(parent, __localStorage, elmtId, extraInfo)
    this.setInitiallyProvidedValue(params)
    this.__count = new ObservedPropertySimplePU(0, this, 'count')
    this.finalizeConstruction()
  }
  // ...
  initialRender() { /* observeComponentCreation2 包装 */ }
  rerender() { this.updateDirtyElements() }
}
```

## 静态
### 源码参考位置
- `arkui-plugins/common/predefines.ts:121`（`StructDecoratorNames.COMPONENT = 'Component'`）
- `arkui-plugins/ui-plugins/component-transformer.ts:356`（`processComponent`）
- `arkui-plugins/ui-plugins/component-transformer.ts:691`（`getComponentExtendsName`，基类选择）
- `arkui-plugins/common/predefines.ts:583`（`COMPONENT_CLASS_NAME = 'CustomComponent'`）

### 转换后的代码
```typescript
class MyComponent extends CustomComponent<MyComponent, __Options_MyComponent> {
  // ...
  static $_invoke(initializers?, storage?, content?): MyComponent { ... }
  static _invokeImpl(style, initializers, storage, reuseId, content): void { ... }
  __initializeStruct(initializers, content): void { ... }
  build() { /* 声明式体 */ }
  static _buildCompatibleNode(options: __Options_MyComponent): void { }
}
```
- @Component 的可选参数：`{ reusePool?: number, poolAccepts?: string[] }`（`process_component_class.ts:330` 的 `processComponentReusePool`）
- Partial Update 模式特有的 `freezeWhenInactive` 和 `memoryOptimizationStrategy` 参数注入
- `finalizeConstruction` 在 Partial Update 模式下通过 `Reflect.defineProperty` 注入（`process_component_class.ts:1524`）

## 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| 基类 | `View`(Legacy) / `ViewPU`(Partial Update) | `CustomComponent` |
| build 方法 | 重命名为 `render`/`initialRender`，展开为 create/pop | 保留为 `build`，声明式体 |
| 构造函数 | 直接注入属性初始化代码 | 生成 `__initializeStruct` 方法 |
| 静态方法 | 无 | `_invokeImpl`/`$_invoke`/`_buildCompatibleNode` |
| Options 类 | 无 | `__Options_<Name>` 内部接口 |
