# 功能概述
`@LocalStorageLink` 装饰器标记与 LocalStorage 双向同步的组件属性，支持页面级本地存储的双向绑定。

## 动态
### 源码参考位置
- `compiler/src/pre_define.ts:47`（`COMPONENT_LOCAL_STORAGE_LINK_DECORATOR = '@LocalStorageLink'`）
- `compiler/src/pre_define.ts:655`（`CREATE_LOCAL_STORAGE_LINK = 'createLocalStorageLink'`）

### 转换前的原始代码
```typescript
@Component
struct MyComponent {
  @LocalStorageLink('lkey') ldata: number = 0
}
```

### 转换后的代码（Legacy）
```typescript
this.__ldata = this.createLocalStorageLink('lkey', 0, this, 'ldata')
get ldata(): number { return this.__ldata.get() }
set ldata(newValue: number) { this.__ldata.set(newValue) }
```

### 转换后的代码（Partial Update）
```typescript
this.__ldata = this.createLocalStorageLink('lkey', 0, this, 'ldata')
get ldata(): number { return this.__ldata.get() }
set ldata(newValue: number) { this.__ldata.set(newValue) }
```

## 静态
### 源码参考位置
- `arkui-plugins/ui-plugins/property-translators/localstoragelink.ts:49`（`initializeStructWithLocalStorageLinkProperty`）
- `arkui-plugins/common/predefines.ts:220`（`DecoratorNames.LOCAL_STORAGE_LINK = 'LocalStorageLink'`）
- `arkui-plugins/common/predefines.ts:280`（`StateManagementTypes.LOCAL_STORAGE_LINK_DECORATED`）
- `arkui-plugins/common/predefines.ts:315`（`StateManagementTypes.MAKE_LOCAL_STORAGE_LINK = 'makeLocalStorageLink'`）

### 转换前的原始代码
```typescript
@Component
struct MyComponent {
  @LocalStorageLink('lkey') ldata: number = 0
}
```

### 转换后的代码
```typescript
private __backing_ldata: ILocalStorageLinkDecoratedVariable<number>
get ldata(): number { return this.__backing_ldata!.get() }
set ldata(value: number) { this.__backing_ldata!.set(value) }

__initializeStruct(initializers, content): void {
  this.__backing_ldata = STATE_MGMT_FACTORY.makeLocalStorageLink<number>("lkey",
    "ldata", defaultValue)
}
```
- @LocalStorageLink 常量：`CREATE_LOCAL_STORAGE_LINK`（`pre_define.ts:655`）
- Partial Update 模式下生成 reset 重用语句（`createStoragePropReuseDecl`）
- @LocalStorageLink 通过 `createLocalStorageLink` 实现双向同步
- @LocalStorageLink 必须指定默认值
- Partial Update 模式下生成 reset 重用语句（`createStoragePropReuseDecl`）
- 与 LocalStorage 的绑定需要在 @Entry 中传入 storage 参数

- 常量 `CREATE_LOCAL_STORAGE_LINK`（`pre_define.ts:655`）
- Partial Update 模式下生成 reset 重用语句
- 常量 `CREATE_LOCAL_STORAGE_LINK`（`pre_define.ts:655`）
- Partial Update 模式下生成 reset 重用语句

- Partial Update 模式重用：`createStoragePropReuseDecl`（`process_component_member.ts:747`）生成 reset 语句

- @LocalStorageLink 常量 `CREATE_LOCAL_STORAGE_LINK`（`pre_define.ts:655`），生成 `this.createLocalStorageLink(key, default, this, name)`

## 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| 创建方式 | `this.createLocalStorageLink(key, default, this, name)` | 工厂方法 `makeLocalStorageLink` |
| 参数差异 | 传 `this` 实例 | 无需 `this`，工厂内部处理 |
| 包装类 | 运行时 LocalStorage 包装 | `ILocalStorageLinkDecoratedVariable<T>` 接口 |
| 可变性 | 双向同步，生成 getter/setter | 双向同步，生成 getter/setter |
