# 功能概述
`@Trace` 装饰器标记 `@ObservedV2` 类中的可观察属性，属性变化时自动触发 `fireChange` 通知所有依赖的监听者。

## 动态
### 源码参考位置
- `compiler/src/constant_define.ts:20`（`TRACE = 'Trace'`，命名为 `MIN_TRACK`）
- `compiler/src/validate_ui_syntax.ts:1189-1229`（`validateClassDecorator` -> `validateMemberInClass`）
- `compiler/src/pre_define.ts:99`（`CLASS_MIN_TRACK_DECORATOR = 'Trace'`）

### 转换前的原始代码
```typescript
@ObservedV2
class MyData {
  @Trace count: number = 0
}
```

### 转换后的代码（Legacy）
`@ObservedV2` 类在动态工具链中不生成额外代码，`@Trace` 属性保持为普通属性，可观察逻辑由运行时框架处理。

### 转换后的代码（Partial Update）
```typescript
// 与 Legacy 相同：@ObservedV2 类不生成额外代码
class MyData {
  count: number = 0
}
```

### 关键转换逻辑
- `validateMemberInClass`（line 1202-1231）：校验 `@Trace` 只能在 `@ObservedV2` class 内使用。
- `@Trace` 命名为 `MIN_TRACK`（`constant_define.ts:20`），与 V1 的 `@Track`（`CLASS_TRACK_DECORATOR`）区分。
- compiler 收集 `observedClassCollection` 并校验 `@Trace` 不能用于 `@Observed` class（line 1205-1211），应使用 `@Trace` 替代。

## 静态
### 源码参考位置
- `arkui-plugins/ui-plugins/property-translators/observedV2Trace.ts:41`（`getterBodyWithObservedV2TraceProperty`）
- `arkui-plugins/ui-plugins/property-translators/observedV2Trace.ts:70`（`getterWithObservedV2TraceProperty`）
- `arkui-plugins/ui-plugins/property-translators/observedV2Trace.ts:97`（`setterWithObservedV2TraceProperty`）
- `arkui-plugins/common/predefines.ts`（`DecoratorNames.TRACE = 'Trace'`）

### 转换前的原始代码
```typescript
@ObservedV2
class MyData {
  @Trace count: number = 0
}
```

### 转换后的代码
```typescript
@ObservedV2
class MyData {
  @JSONStringifyIgnore @JSONParseIgnore @JSONRename({ newName: "count" })
  private __backing_count: number
  private __meta_count = STATE_MGMT_FACTORY.makeMutableStateMeta("__meta_count")
  get count(): number {
    UIUtils.makeObserved(this.__backing_count)
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
- `hasMetaField = true`：总是生成 meta field（`__meta_count`）。
- getter 中调用 `UIUtils.makeObserved(this.__backing_count)` 使属性可观察，再调用 `conditionalAddRef(__meta_count)` 建立引用关系。
- setter 中检测值变化后调用 `fireChange()` 触发通知。
- 生成 `@JSONStringifyIgnore`、`@JSONParseIgnore`、`@JSONRename` 注解，确保 JSON 序列化/反序列化时正确映射。
- 声明文件：`@Trace` 属性装饰器，`@Retention({policy: "SOURCE"})`。

## 接口声明交叉验证

### @Type 装饰器已从 SDK 移除

| 维度 | 状态 |
|---|---|
| SDK 声明 | **已移除** — `decorator.static.d.ets` 中无 `@Type` 声明 |
| 动态工具链 | `pre_define.ts:119`：`export const TYPE: string = 'Type';` — **遗留常量仍存在** |
| 静态工具链 | `predefines.ts` 的 `DecoratorNames` 枚举 — **无 `TYPE` 条目** |

**历史背景**：`@Type` 装饰器曾用于 `@Observed` class 中标记嵌套可观察属性。在 `@ObservedV2` + `@Trace` 推出后，`@Type` 被废弃并从 SDK 移除，`@Trace` 完全替代了其功能。

**影响**：动态工具链的 `TYPE` 常量属于死代码，不会实际触发（SDK 中已无 `@Type` 装饰器声明），可安全移除。静态工具链已完全移除。

## 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| 代码生成 | 不生成额外代码，运行时框架处理 | backing field + meta field + getter/setter |
| 可观察机制 | 运行时框架处理 | `UIUtils.makeObserved` + `fireChange` |
| meta field | 无 | 总是生成（`hasMetaField = true`） |
| JSON 注解 | 无 | `@JSONStringifyIgnore`/`@JSONParseIgnore`/`@JSONRename` |
| 声明接口 | 无 | `@Trace`，`@Retention({policy: "SOURCE"})` |
