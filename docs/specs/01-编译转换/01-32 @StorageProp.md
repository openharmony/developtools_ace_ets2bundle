# 功能概述
`@StorageProp` 装饰器标记从 AppStorage 单向同步的只读组件属性，父级（AppStorage）变更同步到组件，组件不可修改（已 deprecated，由 `@StoragePropRef` 替代）。

## 动态
### 源码参考位置
- `compiler/src/process_component_member.ts:907-918`（`updateStoragePropAndLinkProperty`）
- `compiler/src/pre_define.ts:40`（`COMPONENT_STORAGE_PROP_DECORATOR = '@StorageProp'`）
- `compiler/src/pre_define.ts:158`（`APP_STORAGE_SET_AND_PROP = 'SetAndProp'`）
- `compiler/src/pre_define.ts:654`（`CREATE_STORAGE_PROP = 'createStorageProp'`，Partial Update 模式）

### 转换前的原始代码
```typescript
@Component
struct MyComponent {
  @StorageProp('key') data: number = 0
}
```

### 转换后的代码（Legacy）
```typescript
this.__data = AppStorage.SetAndProp('key', 0, this, 'data')
get data(): number { return this.__data.get() }
// immutable，不生成 setter
```

### 转换后的代码（Partial Update）
```typescript
this.__data = this.createStorageProp('key', 0, 'data')
get data(): number { return this.__data.get() }
// immutable，不生成 setter
```

## 静态
### 源码参考位置
- `arkui-plugins/ui-plugins/property-translators/storagePropRef.ts:49`（`initializeStructWithStoragePropRefProperty`）
- `arkui-plugins/common/predefines.ts:231`（`DecoratorNames.STORAGE_PROP_REF = 'StoragePropRef'`）
- `arkui-plugins/common/predefines.ts:279`（`StateManagementTypes.STORAGE_PROP_REF_DECORATED`）
- `arkui-plugins/common/predefines.ts:312`（`StateManagementTypes.MAKE_STORAGE_PROP_REF = 'makeStoragePropRef'`）

### 转换前的原始代码
```typescript
@Component
struct MyComponent {
  @StorageProp('key') data: number = 0
}
```

### 转换后的代码
```typescript
private __backing_data: IStoragePropRefDecoratedVariable<number>
get data(): number { return this.__backing_data!.get() }
// immutable，不生成 setter

__initializeStruct(initializers, content): void {
  this.__backing_data = STATE_MGMT_FACTORY.makeStoragePropRef<number>("storageKey",
    "data", defaultValue)
}
```

> 注意：`@StorageProp` 已 deprecated，声明文件中使用 `@StoragePropRef` 替代。
- @StorageProp 常量：`APP_STORAGE_SET_AND_PROP = 'SetAndProp'`（`pre_define.ts:158`）
- @StorageProp 已 deprecated，由 @StoragePropRef 替代
- @StorageProp 已 deprecated，由 @StoragePropRef 替代
- @StorageProp 通过 `AppStorage.SetAndProp` 实现单向同步
- @StorageProp 必须指定默认值
- 属性类型映射为 `ObservedPropertyAbstract`/`ObservedPropertyAbstractPU`

- 常量 `APP_STORAGE_SET_AND_PROP`（`pre_define.ts:158`）
- @StorageProp 已 deprecated，由 @StoragePropRef 替代
- 常量 `APP_STORAGE_SET_AND_PROP`（`pre_define.ts:158`）
- @StorageProp 已 deprecated，由 @StoragePropRef 替代

## 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| Legacy 创建 | `AppStorage.SetAndProp(key, default, this, name)` | 工厂方法 `makeStoragePropRef` |
| Partial Update 创建 | `this.createStorageProp(key, default, name)` | 工厂方法 `makeStoragePropRef` |
| 可变性 | immutable，不生成 setter | immutable，不生成 setter |
| deprecated | `@StorageProp` 仍可用但已废弃 | 声明文件使用 `@StoragePropRef` |
