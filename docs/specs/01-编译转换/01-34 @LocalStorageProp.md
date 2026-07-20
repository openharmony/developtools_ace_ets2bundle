# 功能概述
`@LocalStorageProp` 装饰器标记从 LocalStorage 单向同步的只读组件属性，LocalStorage 变更同步到组件，组件不可修改（已 deprecated，由 `@LocalStoragePropRef` 替代）。

## 动态
### 源码参考位置
- `compiler/src/pre_define.ts:48`（`COMPONENT_LOCAL_STORAGE_PROP_DECORATOR = '@LocalStorageProp'`）
- `compiler/src/pre_define.ts:656`（`CREATE_LOCAL_STORAGE_PROP = 'createLocalStorageProp'`）

### 转换前的原始代码
```typescript
@Component
struct MyComponent {
  @LocalStorageProp('lkey') lreadonlyData: number = 0
}
```

### 转换后的代码（Legacy）
```typescript
this.__lreadonlyData = this.createLocalStorageProp('lkey', 0, this, 'lreadonlyData')
get lreadonlyData(): number { return this.__lreadonlyData.get() }
// immutable，不生成 setter
```

### 转换后的代码（Partial Update）
```typescript
this.__lreadonlyData = this.createLocalStorageProp('lkey', 0, this, 'lreadonlyData')
get lreadonlyData(): number { return this.__lreadonlyData.get() }
// immutable，不生成 setter
```

## 静态
### 源码参考位置
- `arkui-plugins/ui-plugins/property-translators/localStoragePropRef.ts:49`（`initializeStructWithLocalStoragePropRefProperty`）
- `arkui-plugins/common/predefines.ts:230`（`DecoratorNames.LOCAL_STORAGE_PROP_REF = 'LocalStoragePropRef'`）
- `arkui-plugins/common/predefines.ts:287`（`StateManagementTypes.LOCAL_STORAGE_PROP_REF_DECORATED`）
- `arkui-plugins/common/predefines.ts:313`（`StateManagementTypes.MAKE_LOCAL_STORAGE_PROP_REF = 'makeLocalStoragePropRef'`）

### 转换前的原始代码
```typescript
@Component
struct MyComponent {
  @LocalStorageProp('lkey') lreadonlyData: number = 0
}
```

### 转换后的代码
```typescript
private __backing_lreadonlyData: ILocalStoragePropRefDecoratedVariable<number>
get lreadonlyData(): number { return this.__backing_lreadonlyData!.get() }
// immutable，不生成 setter

__initializeStruct(initializers, content): void {
  this.__backing_lreadonlyData = STATE_MGMT_FACTORY.makeLocalStoragePropRef<number>("lkey",
    "lreadonlyData", defaultValue)
}
```

> 注意：`@LocalStorageProp` 已 deprecated，声明文件中使用 `@LocalStoragePropRef` 替代。
- @LocalStorageProp 常量：`CREATE_LOCAL_STORAGE_PROP`（`pre_define.ts:656`）
- @LocalStorageProp 已 deprecated，由 @LocalStoragePropRef 替代
- @LocalStorageProp 已 deprecated，由 @LocalStoragePropRef 替代
- @LocalStorageProp 通过 `createLocalStorageProp` 实现单向只读同步
- @LocalStorageProp 必须指定默认值
- 属性类型映射为 `ObservedPropertyAbstract`/`ObservedPropertyAbstractPU`

- 常量 `CREATE_LOCAL_STORAGE_PROP`（`pre_define.ts:656`）
- @LocalStorageProp 已 deprecated
- 常量 `CREATE_LOCAL_STORAGE_PROP`（`pre_define.ts:656`）
- @LocalStorageProp 已 deprecated

- @LocalStorageProp 已 deprecated，由 @LocalStoragePropRef 替代（`predefines.ts` 的 `DeprecatedDecoratorNames`）

## 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| 创建方式 | `this.createLocalStorageProp(key, default, this, name)` | 工厂方法 `makeLocalStoragePropRef` |
| 可变性 | immutable，不生成 setter | immutable，不生成 setter |
| deprecated | `@LocalStorageProp` 仍可用但已废弃 | 声明文件使用 `@LocalStoragePropRef` |
| 包装类 | 运行时 LocalStorage 包装 | `ILocalStoragePropRefDecoratedVariable<T>` 接口 |
