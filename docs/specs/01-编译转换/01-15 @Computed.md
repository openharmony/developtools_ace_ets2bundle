# 功能概述
`@Computed` 装饰器标记 V2 组件的计算属性（getter），其值由依赖的响应式属性自动计算得出，依赖变化时自动触发重新渲染。

## 动态
### 源码参考位置
- `compiler/src/process_struct_componentV2.ts:253`（`isComputedDecorator`）
- `compiler/src/process_struct_componentV2.ts:513`（`parseGetAccessor`）
- `compiler/src/pre_define.ts:99`（`COMPONENTV2_COMPUTED_DECORATOR`）

### 转换前的原始代码
```typescript
@ComponentV2
struct MyComponent {
  @Local count: number = 0
  @Computed get doubled(): number { return this.count * 2 }
  build() { Text(`${this.doubled}`) }
}
```

### 转换后的代码（Legacy）
V2 装饰器仅支持 Partial Update 模式，无 Legacy 输出。

### 转换后的代码（Partial Update）
```typescript
class MyComponent extends ViewV2 {
  count: number = 0
  get doubled(): number { return this.count * 2 }
  constructor(parent, params, __localStorage, elmtId, paramsLambda, extraInfo) {
    super(parent, elmtId, extraInfo)
    this.count = ('count' in params) ? params.count : 0
    this.finalizeConstruction()
  }
  resetStateVarsOnReuse(params: Object) {
    this.resetComputed('doubled')
  }
  initialRender() { /* 命令式 */ }
  rerender() { this.updateDirtyElements() }
}
```

### 关键转换逻辑
- `isComputedDecorator`（line 253-256）：检测 `@Computed` 装饰器。
- `parseGetAccessor`（line 513-519）：将属性名加入 `structInfo.computedDecoratorSet`（line 517），同时将属性名存入 `structInfo.propertiesMap`（值为 `undefined`）。
- 保留为 GetAccessor，不生成额外代码。组件重用时通过 `resetComputed` 重置计算属性缓存。

## 静态
### 源码参考位置
- `arkui-plugins/ui-plugins/property-translators/computed.ts:35`（`fieldWithComputedMethod`）
- `arkui-plugins/ui-plugins/property-translators/computed.ts:67`（`getterWithComputedMethod`）
- `arkui-plugins/ui-plugins/property-translators/computed.ts:81`（`resetOnReuseWithComputedMethod`）
- `arkui-plugins/common/predefines.ts`（`DecoratorNames.COMPUTED = 'Computed'`）

### 转换前的原始代码
```typescript
@ComponentV2
struct MyComponent {
  @Local count: number = 0
  @Computed get doubled(): number { return this.count * 2 }
  build() { Text(`${this.doubled}`) }
}
```

### 转换后的代码
```typescript
class MyComponent extends CustomComponentV2 {
  private __backing_computed_doubled: IComputedDecoratedVariable<number>
  get doubled(): number { return this.__backing_computed_doubled!.get() }

  __initializeStruct(initializers, content): void {
    this.__backing_computed_doubled = STATE_MGMT_FACTORY.makeComputed<number>(() => {
      return this.count * 2
    }, "doubled")
  }
  resetStateVarsOnReuse(initializers): void {
    this.__backing_computed_doubled = STATE_MGMT_FACTORY.makeComputed<number>(() => {
      return this.count * 2
    }, "doubled")
  }
}
```

### 深度逻辑
- 是方法装饰器（继承 `MethodCacheTranslator`），`newName = computedField(originalName)` 即 `__computed_<name>`。
- `fieldWithComputedMethod`（line 35-65）：生成 backing field，传入箭头函数（计算逻辑）和原始属性名。
- `getterWithComputedMethod`（line 67-79）：将原方法体替换为 `return this.__backing_computed_doubled!.get()`。
- `cacheTranslatedInitializer` 收集到 `ComputedCache` 并生成 `resetStateVarsOnReuse` 调用。
- 声明文件：`@Computed`，`IComputedDecoratedVariable<T> extends IDecoratedReadableVariable`。

## 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| 实现方式 | 保留 GetAccessor，运行时框架处理 | backing field + 工厂创建 + getter 代理 |
| 装饰器类型 | 方法装饰器 | 方法装饰器（`MethodCacheTranslator`） |
| 复用重置 | `resetComputed` | `STATE_MGMT_FACTORY.makeComputed` 重新创建 |
| 声明接口 | 无 | `IComputedDecoratedVariable<T>` |
