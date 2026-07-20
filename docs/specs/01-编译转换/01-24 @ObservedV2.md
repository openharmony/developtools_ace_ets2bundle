# 功能概述
`@ObservedV2` 装饰器标记可观察的数据类，配合 `@Trace` 属性实现细粒度的数据变化监听，是 V2 响应式数据模型的基础。

## 动态
### 源码参考位置
- `compiler/src/validate_ui_syntax.ts:381-388`（`isObservedClass`）
- `compiler/src/validate_ui_syntax.ts:638-666`（`checkObservedProperty`）
- `compiler/src/pre_define.ts:30`（`COMPONENT_DECORATOR_REUSEABLE`，附近 `COMPONENT_OBSERVEDV2_DECORATOR = '@ObservedV2'`）

### 转换前的原始代码
```typescript
@ObservedV2
class MyData {
  @Trace count: number = 0
}
```

### 转换后的代码（Legacy）
`@ObservedV2` 类在动态工具链中不生成额外代码，仅收集和校验，可观察逻辑由运行时框架处理。

### 转换后的代码（Partial Update）
```typescript
// 与 Legacy 相同：不生成额外代码
class MyData {
  count: number = 0
}
```

### 关键转换逻辑
- `isObservedClass`（line 381-388）：检测类是否有 `@ObservedV2` 装饰器。
- `checkObservedProperty`（line 638-666）：校验 `@ObservedV2` 类的属性规则。
- 校验约束：`@Observed` 和 `@ObservedV2` 不可同时使用；`@ObservedV2` class 不能继承 `@Observed` class。
- `@ObservedV2` class 内只能使用 `@Trace`（不能用 `@Track`），`@Observed` class 内只能使用 `@Track`（不能用 `@Trace`）。

## 静态
### 源码参考位置
- `arkui-plugins/common/predefines.ts:231`（`ObservedNames` 枚举）
- `arkui-plugins/ui-plugins/property-translators/observedV2Trace.ts`（与 `@Trace` 配合时生成变换）
- `arkui-plugins/common/predefines.ts`（`DecoratorNames.OBSERVED_V2 = 'ObservedV2'`）

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
- `@ObservedV2` 本身不生成额外代码，但与 `@Trace` 配合时，`@Trace` 属性会生成 backing field + meta field + getter/setter。
- `makeMutableStateMeta` 创建元状态对象，`fireChange` 在属性变化时通知监听者。
- 声明文件：`@ObservedV2` 类装饰器，`@Retention({policy: "SOURCE"})`。
- `compiler/src/validate_ui_syntax.ts:2034`（`validateInheritClassDecorator`）
- `compiler/src/validate_ui_syntax.ts:1976`（`validateMutilObserved`）

## 接口声明交叉验证

### @ObservedV2 声明细节

| 维度 | SDK 声明 | 动态工具链 | 静态工具链 |
|---|---|---|---|
| 声明文件 | `decorator.static.d.ets` | - | - |
| 常量 | `declare class ObservedV2` | `COMPONENT_OBSERVEDV2_DECORATOR = '@ObservedV2'`（`pre_define.ts:115`） | `DecoratorNames.OBSERVED_V2 = 'ObservedV2'` |
| 工厂方法 | - | - | `StateManagementTypes.MAKE_OBSERVED = 'makeObserved'` |

### @Trace 声明细节

| 维度 | SDK 声明 | 动态工具链 | 静态工具链 |
|---|---|---|---|
| 常量 | `declare class Trace` | `CLASS_MIN_TRACK_DECORATOR = 'Trace'`（`pre_define.ts:73`） | `DecoratorNames.TRACE = 'Trace'` |
| 使用范围 | `@ObservedV2` class 的属性 | 同 | 同 |
| 验证 | - | `process_component_member.ts:1418-1426`：仅限 `@ObservedV2` 或 `makeV1Observed` | property-translators 处理 |

**验证逻辑**（动态工具链 `process_component_member.ts:1418-1426`）：
```
Apply it only to classes decorated by '@ObservedV2' or initialized using the return value of 'makeV1Observed'.
```

## 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| 代码生成 | 不生成额外代码 | `@ObservedV2` 本身不生成代码，但 `@Trace` 属性生成完整变换 |
| 校验 | `isObservedClass` + `checkObservedProperty` | ui-syntax-plugins lint 规则 |
| 与 @Trace 配合 | 运行时框架处理可观察 | backing field + meta field + `fireChange` |
| 声明接口 | 无 | `@ObservedV2`，`@Retention({policy: "SOURCE"})` |
