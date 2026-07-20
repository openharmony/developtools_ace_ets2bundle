# 功能概述
`@Track` 装饰器标记 `@Observed` 类中的可追踪属性，属性变化时精确触发依赖该属性的 UI 刷新，仅用于 V1 的 `@Observed` class（不可用于 `@ObservedV2` class）。

## 动态
### 源码参考位置
- `compiler/src/pre_define.ts:99`（`COMPONENT_TRACK_DECORATOR`，`CLASS_TRACK_DECORATOR = 'Track'`）
- `compiler/src/validate_ui_syntax.ts:1205-1211`（`validateMemberInClass` 中 `@Track` 校验）

### 转换前的原始代码
```typescript
@Observed
class MyData {
  @Track count: number = 0
  name: string = ''
}
```

### 转换后的代码（Legacy）
`@Observed` 类中的 `@Track` 属性在动态工具链中不生成额外代码，追踪逻辑由运行时框架处理。

### 转换后的代码（Partial Update）
```typescript
// 与 Legacy 相同：不生成额外代码
class MyData {
  count: number = 0
  name: string = ''
}
```

### 关键转换逻辑
- `@Track` 仅用于 `@Observed` class（V1 数据模型）。
- `validateMemberInClass`（line 1205-1211）：校验 `@Track` 不能用于 `@ObservedV2` class，应使用 `@Trace` 替代。
- compiler 收集 `observedClassCollection` 并校验 `@Track` 属性必须在 `@Observed` class 内使用。

## 静态
### 源码参考位置
- `arkui-plugins/ui-plugins/property-translators/observedTrack.ts:39`（`createAddRef`）
- `arkui-plugins/ui-plugins/property-translators/observedTrack.ts:84`（`getterBodyWithObservedTrackProperty`）
- `arkui-plugins/common/predefines.ts`（`DecoratorNames.TRACK = 'Track'`）

### 转换前的原始代码
```typescript
@Observed
class MyData {
  @Track count: number = 0
}
```

### 转换后的代码
```typescript
@Observed
class MyData {
  private __backing_count: number
  private __meta_count = STATE_MGMT_FACTORY.makeMutableStateMeta("__meta_count")
  get count(): number {
    this.conditionalAddRef(__meta_count)
    return this.__backing_count
  }
  set count(newValue: number) {
    if (this.__backing_count !== newValue) {
      this.__backing_count = newValue
      this.__meta_count!.fireChange()
    }
  }
}
```

### 深度逻辑
- 生成 backing field + meta field + getter/setter with `fireChange`（与 `@Observed` 配合时）。
- 仅在 `isTracked` 或 `classHasTrack || isObserved` 时才执行转换。
- getter 中调用 `conditionalAddRef(metaMember)` 建立引用关系（与 `@Trace` 类似但不调用 `UIUtils.makeObserved`）。
- 声明文件：`@Track` 属性装饰器，`@Retention({policy: "SOURCE"})`。
- `compiler/src/pre_define.ts:72`（`CLASS_TRACK_DECORATOR = 'Track'`）

## 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| 代码生成 | 不生成额外代码 | backing field + meta field + getter/setter |
| 适用类 | `@Observed` class（V1） | `@Observed` class（V1） |
| 与 @Trace 区别 | `@Track` 用于 `@Observed`，`@Trace` 用于 `@ObservedV2` | `@Track` 不调用 `makeObserved`，`@Trace` 调用 |
| 声明接口 | 无 | `@Track`，`@Retention({policy: "SOURCE"})` |
