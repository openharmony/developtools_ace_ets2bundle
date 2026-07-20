# 功能概述
`@ObjectLink` 装饰器标记 `@Observed` 装饰类的对象引用，实现嵌套对象的深度可观察性（immutable，不生成 setter）。

## 动态
### 源码参考位置
- `compiler/src/process_component_member.ts:964-973`（`updateSynchedPropertyNesedObject`，Legacy）
- `compiler/src/process_component_member.ts:1538-1552`（`updateSynchedPropertyNesedObjectPU`，Partial Update）
- `compiler/src/pre_define.ts:44`（`COMPONENT_OBJECT_LINK_DECORATOR = '@ObjectLink'`）
- `compiler/src/pre_define.ts:151`（`SYNCHED_PROPERTY_NESED_OBJECT`）
- `compiler/src/pre_define.ts:648`（`SYNCHED_PROPERTY_NESED_OBJECT_Partial Update`）

### 转换前的原始代码
```typescript
@Observed
class MyData {
  count: number = 0
}

@Component
struct MyComponent {
  @ObjectLink data: MyData
}
```

### 转换后的代码（Legacy）
```typescript
this.__data = new SynchedPropertyNesedObject(params.data, this, 'data')
get data(): MyData { return this.__data.get() }
// immutable，不生成 setter
```

### 转换后的代码（Partial Update）
```typescript
this.__data = new SynchedPropertyNesedObjectPU(params.data, this, 'data')
get data(): MyData { return this.__data.get() }
// immutable，不生成 setter
```

## 静态
### 源码参考位置
- `arkui-plugins/ui-plugins/property-translators/objectlink.ts:47`（`initializeStructWithObjectLinkProperty`）
- `arkui-plugins/common/predefines.ts:213`（`DecoratorNames.OBJECT_LINK = 'ObjectLink'`）
- `arkui-plugins/common/predefines.ts:284`（`StateManagementTypes.OBJECT_LINK_DECORATED`）
- `arkui-plugins/common/predefines.ts:318`（`StateManagementTypes.MAKE_OBJECT_LINK = 'makeObjectLink'`）

### 转换前的原始代码
```typescript
@Observed
class MyData {
  count: number = 0
}

@Component
struct MyComponent {
  @ObjectLink data: MyData
}
```

### 转换后的代码
```typescript
private __backing_data: IObjectLinkDecoratedVariable<MyData>
get data(): MyData { return this.__backing_data!.get() }
// immutable，不生成 setter（hasSetter = false）

__initializeStruct(initializers, content): void {
  this.__backing_data = STATE_MGMT_FACTORY.makeObjectLink<MyData>("data",
    (initializers!.data as MyData))
}
```

> 声明文件参考：`IObjectLinkDecoratedVariable<T> extends IDecoratedImmutableVariable, IDecoratedUpdatableVariable, IDecoratedV1Variable`。

## 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| 包装类 | `SynchedPropertyNesedObject`/`SynchedPropertyNesedObjectPU` | `IObjectLinkDecoratedVariable<T>` 接口 |
| 可变性 | immutable，不生成 setter | `hasSetter = false`，不生成 setter |
| 类型校验 | Legacy 校验 `isObservedClassType`；Partial Update 校验 `checkObjectLinkType`（ESMODULE 模式） | 通过泛型参数约束 |
| 工厂方法 | 直接 `new` 构造 | `STATE_MGMT_FACTORY.makeObjectLink` 工厂调用 |
| hasUpdateStruct | 无 | `hasUpdateStruct = true` |
