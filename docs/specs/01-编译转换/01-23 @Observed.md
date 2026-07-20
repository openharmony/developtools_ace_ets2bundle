# 功能概述
`@Observed` 装饰器标记 class 为可观察数据类，使其属性变更能被 `@ObjectLink` 感知，与 `@Track` 配合实现精确属性级追踪。

## 动态
### 源码参考位置
- `compiler/src/validate_ui_syntax.ts:381`（`isObservedClass`）
- `compiler/src/validate_ui_syntax.ts:289-291`（收集 `observedClassCollection`）
- `compiler/src/pre_define.ts:114`（`COMPONENT_OBSERVED_DECORATOR = '@Observed'`）

### 转换前的原始代码
```typescript
@Observed
class MyClass {
  count: number = 0
}
```

### 转换后的代码（Legacy）
```typescript
// @Observed 类本身在 compiler 中不直接转换代码
// 运行时由状态管理框架处理（ObservedPropertyObject 等）
// compiler 仅收集 observedClassCollection 用于 @ObjectLink 的类型校验
class MyClass {
  count: number = 0
}
```

### 转换后的代码（Partial Update）
```typescript
// 与 Legacy 相同，@Observed 类不产生代码变换
// compiler 收集类名供 @ObjectLink 校验使用
class MyClass {
  count: number = 0
}
```

## 静态
### 源码参考位置
- `arkui-plugins/ui-plugins/property-translators/observedTrack.ts:39`（`createAddRef`）
- `arkui-plugins/common/predefines.ts:214`（`DecoratorNames.OBSERVED = 'Observed'`）
- `arkui-plugins/common/predefines.ts:125`（`StructDecoratorNames.RESUABLE`，附近 enum）

### 转换前的原始代码
```typescript
@Observed
class MyClass {
  count: number = 0
}
```

### 转换后的代码
```typescript
// 生成 backing field + meta field + getter/setter with fireChange
// 与 @Track 配合时，被 @Track 的属性产生精确追踪
class MyClass {
  private __backing_count: number = 0
  // meta field 用于引用追踪
  get count(): number { return this.__backing_count }
  set count(value: number) {
    this.__backing_count = value
    // fireChange 通知观察者
  }
}
```

> 声明文件参考：`@Observed` 为类装饰器，`@Track` 为属性装饰器，二者配合使用。
- @Observed 类本身不生成额外代码（运行时由状态管理框架处理）
- compiler 收集 `observedClassCollection`（`validate_ui_syntax.ts:289`）用于 @ObjectLink 类型校验
- @Observed 与 @Track 配合实现精确属性级追踪
- @Observed 和 @ObservedV2 不可同时使用（错误码 10905226）

## 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| 代码变换 | 不直接转换，仅收集类名供校验 | 生成 backing field + meta field + getter/setter |
| 运行时处理 | 由状态管理框架（`ObservedPropertyObject`）处理 | 生成 `fireChange` 通知逻辑 |
| @Track 配合 | 运行时框架支持 | `observedTrack.ts` 生成 `addRef`/`conditionalAddRef` 逻辑 |
| 类型校验 | `observedClassCollection` 校验 `@ObjectLink` 类型 | 通过 `IObservedTrackTranslator` 接口约束 |
