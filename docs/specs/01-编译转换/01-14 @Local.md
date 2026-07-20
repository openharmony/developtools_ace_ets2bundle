# 功能概述
`@Local` 装饰器标记 V2 组件的内部状态变量，仅在声明它的组件内部可访问，通过简单赋值即可触发重新渲染。

## 动态
### 源码参考位置
- `compiler/src/process_struct_componentV2.ts:695`（`parseLocalDecorator`）
- `compiler/src/pre_define.ts:99`（`COMPONENTV2_LOCAL_DECORATOR = '@Local'`）

### 转换前的原始代码
```typescript
@ComponentV2
struct MyComponent {
  @Local count: number = 0
  build() { Text(`${this.count}`) }
}
```

### 转换后的代码（Legacy）
V2 装饰器仅支持 Partial Update 模式，无 Legacy 输出。

### 转换后的代码（Partial Update）
```typescript
class MyComponent extends ViewV2 {
  count: number = 0
  constructor(parent, params, __localStorage, elmtId, paramsLambda, extraInfo) {
    super(parent, elmtId, extraInfo)
    this.count = ('count' in params) ? params.count : 0
    this.finalizeConstruction()
  }
  initialRender() { /* 命令式 */ }
  rerender() { this.updateDirtyElements() }
}
```

### 关键转换逻辑
- `parseLocalDecorator`（line 695-698）：将属性名加入 `structInfo.localDecoratorSet`，移除 `@Local` 装饰器，保留为普通属性。
- 不生成 ObservedProperty 包装类，直接通过属性赋值管理状态。
- 支持静态 `@Local`：当属性为 `static` 时，`makeType = MAKE_STATIC_LOCAL`，`hasResetOnReuse = false`（见 `arkui-plugins/ui-plugins/property-translators/local.ts:201-215`）。

## 静态
### 源码参考位置
- `arkui-plugins/ui-plugins/property-translators/local.ts:48`（`factoryCallWithLocalProperty`）
- `arkui-plugins/ui-plugins/property-translators/local.ts:201-215`（静态 `@Local` 处理）
- `arkui-plugins/common/predefines.ts`（`DecoratorNames.LOCAL = 'Local'`）

### 转换前的原始代码
```typescript
@ComponentV2
struct MyComponent {
  @Local count: number = 0
  build() { Text(`${this.count}`) }
}
```

### 转换后的代码
```typescript
class MyComponent extends CustomComponentV2 {
  private __backing_count: ILocalDecoratedVariable<number>
  get count(): number { return this.__backing_count!.get() }
  set count(value: number) { this.__backing_count!.set(value) }

  __initializeStruct(initializers, content): void {
    this.__backing_count = STATE_MGMT_FACTORY.makeLocal<number>("count", 0)
  }
}
```

### 深度逻辑
- `makeType = MAKE_LOCAL`，生成 backing field + getter/setter + `__initializeStruct` 中的工厂调用。
- 静态 `@Local`（`local.ts:201-215`）：`makeType` 切换为 `MAKE_STATIC_LOCAL`，`hasResetOnReuse = false`，`hasInitializeStruct = false`，通过 `fieldWithStaticLocalProperty` 和 `getterWithStaticLocalProperty` 生成静态版本。
- 声明文件：`@Local`，`ILocalDecoratedVariable<T> extends IDecoratedMutableVariable, IDecoratedV2Variable`。

## 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| 属性管理 | 普通属性赋值，无包装类 | `STATE_MGMT_FACTORY.makeLocal` 工厂 |
| getter/setter | 无，直接属性访问 | backing field + getter/setter |
| 静态 @Local | 不区分 | `MAKE_STATIC_LOCAL`，无 resetOnReuse |
| 声明接口 | 无 | `ILocalDecoratedVariable<T>` |
