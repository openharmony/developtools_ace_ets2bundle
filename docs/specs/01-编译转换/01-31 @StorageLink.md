# 功能概述
`@StorageLink` 装饰器标记与 AppStorage 双向同步的组件属性，支持应用级全局状态的双向绑定。

## 动态
### 源码参考位置
- `compiler/src/process_component_member.ts:907-918`（`updateStoragePropAndLinkProperty`）
- `compiler/src/pre_define.ts:41`（`COMPONENT_STORAGE_LINK_DECORATOR = '@StorageLink'`）
- `compiler/src/pre_define.ts:159`（`APP_STORAGE_SET_AND_LINK = 'SetAndLink'`）
- `compiler/src/pre_define.ts:653`（`CREATE_STORAGE_LINK = 'createStorageLink'`，Partial Update 模式）

### 转换前的原始代码
```typescript
@Component
struct MyComponent {
  @StorageLink('key') data: number = 0
}
```

### 转换后的代码（Legacy）
```typescript
this.__data = AppStorage.SetAndLink('key', 0, this, 'data')
get data(): number { return this.__data.get() }
set data(newValue: number) { this.__data.set(newValue) }
```

### 转换后的代码（Partial Update）
```typescript
this.__data = this.createStorageLink('key', 0, 'data')
get data(): number { return this.__data.get() }
set data(newValue: number) { this.__data.set(newValue) }
```

## 静态
### 源码参考位置
- `arkui-plugins/ui-plugins/property-translators/storagelink.ts:43`（`initializeStructWithStorageLinkProperty`）
- `arkui-plugins/common/predefines.ts:209`（`DecoratorNames.STORAGE_LINK = 'StorageLink'`）
- `arkui-plugins/common/predefines.ts:278`（`StateManagementTypes.STORAGE_LINK_DECORATED`）
- `arkui-plugins/common/predefines.ts:314`（`StateManagementTypes.MAKE_STORAGE_LINK = 'makeStorageLink'`）

### 转换前的原始代码
```typescript
@Component
struct MyComponent {
  @StorageLink('key') data: number = 0
}
```

### 转换后的代码
```typescript
private __backing_data: IStorageLinkDecoratedVariable<number>
get data(): number { return this.__backing_data!.get() }
set data(value: number) { this.__backing_data!.set(value) }

__initializeStruct(initializers, content): void {
  this.__backing_data = STATE_MGMT_FACTORY.makeStorageLink<number>("storageKey",
    "data", defaultValue)
}
```

> 声明文件参考：`@StorageLink(property: string)`。
- @StorageLink 常量：`APP_STORAGE_SET_AND_LINK = 'SetAndLink'`（`pre_define.ts:159`）
- @StorageLink 的 key 参数为 AppStorage 中的键名
- @StorageLink 通过 `AppStorage.SetAndLink` 实现双向同步
- @StorageLink 必须指定默认值（作为 AppStorage 不存在时的回退值）
- @StorageLink 的 key 参数为 AppStorage 中的键名
- 与 @StorageProp 的区别：@StorageLink 双向同步，@StorageProp 单向只读

- 常量 `APP_STORAGE_SET_AND_LINK`（`pre_define.ts:159`）
- @StorageLink 必须指定默认值
- 常量 `APP_STORAGE_SET_AND_LINK`（`pre_define.ts:159`）
- @StorageLink 必须指定默认值

## 接口声明交叉验证

### AppStorageV2 / PersistenceV2（@since 26）

| 维度 | AppStorageV2 | PersistenceV2 |
|---|---|---|
| SDK 声明 | `stateManagement/` 目录下 | `stateManagement/` 目录下 |
| API 版本 | `@since 26` | `@since 26` |
| 功能 | 类型安全的应用级存储 | 持久化存储 |
| 工具链处理 | 运行时 API，编译器不做变换 | 运行时 API，编译器不做变换 |
| 静态工具链引用 | `APIVersions.API_26 = 26` | `APIVersions.API_26 = 26` |

### API 版本控制

静态工具链通过 `APIVersions` 枚举进行版本控制：

```typescript
export enum APIVersions {
    API_20 = 20,
    API_24 = 24,
    API_26 = 26
}
```

使用方式（`factory.ts:1031-1038`）：
```typescript
withAPIVersion(
    { version: APIVersions.API_24, compare: APIComparison.LESS_THAN_OR_EQUAL },
    (sdkVersion: APIVersions) => { ... },
    { ignoreCompare: ... }
)
```

### storage/ 子目录声明

| 文件 | 内容 | 工具链引用 |
|---|---|---|
| `stateManagement/storage/localStorage.static.d.ets` | `LocalStorage` 类声明 | `ARKUI_LOCAL_STORAGE_SOURCE_NAME`（`predefines.ts:64`） |
| `stateManagement/storage/persistentStorage.static.d.ets` | `PersistentStorage` 类声明 | 运行时 API |
| `stateManagement/storage/environment.static.d.ets` | `Environment` 类声明 | 运行时 API |

## 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| Legacy 创建 | `AppStorage.SetAndLink(key, default, this, name)` | 工厂方法 `makeStorageLink` |
| Partial Update 创建 | `this.createStorageLink(key, default, name)` | 工厂方法 `makeStorageLink` |
| 参数差异 | Legacy 传 `this`，Partial Update 不传 `this` | 统一通过工厂调用，无需 `this` |
| 包装类 | 运行时 AppStorage 包装 | `IStorageLinkDecoratedVariable<T>` 接口 |
