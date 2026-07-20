# 功能概述
`@State` 装饰器标记组件内部状态变量，转换为 `ObservedPropertySimple`/`ObservedPropertySimplePU`（动态）或通过 `STATE_MGMT_FACTORY.makeState` 工厂创建（静态）。

## 动态
### 源码参考位置
- `compiler/src/process_component_member.ts:578`（`processStateDecorators`）
- `compiler/src/process_component_member.ts:870-878`（`updateObservedProperty`，Legacy）
- `compiler/src/process_component_member.ts:1501`（`updateObservedPropertyPU`，Partial Update）
- `compiler/src/process_component_member.ts:1428-1435`（`createTypeReference`，类型映射）
- `compiler/src/pre_define.ts:37`（`COMPONENT_STATE_DECORATOR = '@State'`）

### 转换前的原始代码
```typescript
@Component
struct MyComponent {
  @State count: number = 0
  @State data: MyClass = new MyClass()
}
```

### 转换后的代码（Legacy）
```typescript
// 简单类型
this.__count = new ObservedPropertySimple(0, this, 'count')
get count(): number { return this.__count.get() }
set count(newValue: number) { this.__count.set(newValue) }

// 复杂类型
this.__data = new ObservedPropertyObject(new MyClass(), this, 'data')
get data(): MyClass { return this.__data.get() }
set data(newValue: MyClass) { this.__data.set(newValue) }
```

### 转换后的代码（Partial Update）
```typescript
this.__count = new ObservedPropertySimplePU(0, this, 'count')
// Partial Update 模式额外生成:
purgeVariableDependenciesOnElmtId(rmElmtId: number) {
  this.__count.purgeDependencyOnElmtId(rmElmtId)
}
```

## 静态
### 源码参考位置
- `arkui-plugins/ui-plugins/property-translators/state.ts:38`（`StateTranslator`）
- `arkui-plugins/common/predefines.ts:208`（`DecoratorNames.STATE = 'State'`）
- `arkui-plugins/ui-plugins/property-translators/base.ts:171`（`initializeStruct`，工厂调用生成）

### 转换后的代码
```typescript
private __backing_count: IStateDecoratedVariable<number>
get count(): number { return this.__backing_count!.get() }
set count(value: number) { this.__backing_count!.set(value) }

__initializeStruct(initializers, content): void {
  this.__backing_count = STATE_MGMT_FACTORY.makeState<number>("count",
    initializers?.count ?? 0, watchCb?)
}
```
- @State 的 setter 生成 `set count(newValue) { this.__count.set(newValue) }`（`process_component_member.ts:596`）
- Partial Update 模式额外生成 `purgeDependencyOnElmtId` 方法（`process_component_member.ts:611`）
- 简单类型（number/string/boolean）映射为 `ObservedPropertySimple`/`ObservedPropertySimplePU`
- 复杂类型（object/class）映射为 `ObservedPropertyObject`/`ObservedPropertyObjectPU`
- Partial Update 模式额外生成 `purgeVariableDependenciesOnElmtId` 方法
- @State 与 @Require 配合时可免除必须指定默认值的要求

- getter/setter 生成：`process_component_member.ts:596`（`createGetAccessor`）/`:601`（`createSetAccessor`）
- Partial Update 模式额外生成 `purgeDependencyOnElmtId`（`:611`）
- getter/setter 生成：`createGetAccessor`/`createSetAccessor`（`process_component_member.ts:596-601`）
- Partial Update 模式额外生成 `purgeDependencyOnElmtId`（`process_component_member.ts:611-615`）

## 接口声明交叉验证

### IStateMgmtFactory makeState 工厂方法对应

SDK 声明文件中的 `IStateMgmtFactory` 接口定义了 `makeState` 工厂方法，对应 `@State` 装饰器的运行时创建。

| IStateMgmtFactory 方法 | StateManagementTypes 枚举 | 对应装饰器 |
|---|---|---|
| `makeState` | `MAKE_STATE = 'makeState'` | `@State` |

静态工具链通过 `STATE_MGMT_FACTORY.makeState<T>("name", initialValue, watchCb?)` 调用创建状态变量，与动态工具链的 `new ObservedPropertySimple(...)` 直接构造形成差异。

## 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| 包装类 | `ObservedPropertySimple`/`ObservedPropertySimplePU` | `IStateDecoratedVariable<T>` 接口 |
| 工厂方法 | 直接 `new` 构造 | `STATE_MGMT_FACTORY.makeState` 工厂调用 |
| 复杂类型 | `ObservedPropertyObject`/`ObservedPropertyObjectPU` | 泛型参数自动处理 |
| resetOnReuse | 无 | `resetStateVarsOnReuse` 重新计算初始值 |
