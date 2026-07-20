# 规则
校验 `@SyncMonitor` 装饰器只能装饰方法、需在 @ComponentV2 struct 或 @ObservedV2 class 中使用、参数必须为常量表达式、不可观察不存在的变量或非状态变量、通配符 `.*` 必须在字符串末尾。

## 源码参考位置
- 动态：
  - `compiler/src/validate_ui_syntax.ts:1233-1836`（多个 @Monitor/@SyncMonitor 校验函数，含通配符和常量表达式检查）
- 静态：
  - `arkui-plugins/collectors/ui-collectors/validators/rules/check-sync-monitor-decorator.ts:71`

## 适用对象
`@SyncMonitor` 装饰的方法（struct 方法或 class 方法）

## 报错信息
- 动态：
  - `'@SyncMonitor' cannot observe non-existent variables or non-state variables, except in wildcard-based monitoring scenarios.`（错误码 10905366）
  - `Only constant expressions are supported as parameters in '@${decoratorName}'. Variables are not allowed.`（错误码 10905365）
  - `In wildcard-based monitoring scenarios with '@SyncMonitor', the .* pattern must be placed at the end of the string.`（错误码 10905367）
  - `The value of 'enableWildcard' must be a Boolean keyword.`（错误码 10905372）
  - `The '@SyncMonitor' can decorate only member method within a 'class' decorated with @ObservedV2.`（错误码 10905343）
  - `The '@SyncMonitor' annotation can only be used in a 'struct' decorated with '@ComponentV2'.`
- 静态：
  - `@SyncMonitor can only decorate method.`（ERROR）
  - `The '@SyncMonitor' annotation can only be used in a 'struct' decorated with '@ComponentV2'.`（ERROR）
  - `The '@SyncMonitor' can decorate only member method within a 'class' decorated with @ObservedV2.`（ERROR）
  - `The member property or method cannot be decorated by multiple built-in annotations.`（ERROR）
  - `In wildcard-based monitoring scenarios with '@SyncMonitor', the .* pattern must be placed at the end of the string.`（ERROR）
  - `'@SyncMonitor' cannot observe non-existent variables or non-state variables, except in wildcard-based monitoring scenarios.`（ERROR / WARN）

## 错误码
- 10905343：@SyncMonitor 不在 @ObservedV2 class 中
- 10905365：@SyncMonitor 参数不是常量表达式
- 10905366：@SyncMonitor 观察不存在的变量或非状态变量
- 10905367：通配符 .* 不在字符串末尾
- 10905372：enableWildcard 不是布尔值

## 核心校验规则
1. **只能装饰方法**：若 `@SyncMonitor` 出现在 `ClassProperty` 上（通过 `ignoredAnnotations` 检测），报 ERROR 并建议移除装饰器
2. **上下文限制**：
   - struct 方法：所属 struct 必须被 `@ComponentV2` 装饰；若被 `@Component` 装饰则报 ERROR 并建议改为 `@ComponentV2`
   - class 方法：所属 class 必须被 `@ObservedV2` 装饰；若被 `@Observed` 装饰则报 ERROR 并建议改为 `@ObservedV2`；若无任何 Observed 装饰器则建议添加 `@ObservedV2`
3. **不可与其他内置装饰器同时使用**：统计方法上的装饰器数量，若大于 1 则报 ERROR 并建议移除其他装饰器
4. **通配符合法性**（`isWildcardPathInvalid`）：
   - 路径按 `.` 分割，`*` 段必须恰好出现 1 次
   - `*` 必须在最后一个段
   - 至少有 2 个段（即 `xxx.*` 而非单独 `*`）
5. **通配符总是启用**：`resolvePropertyPath` 调用时 `enableWildcard: true`（与 @Monitor 不同，@Monitor 根据兼容 SDK 版本决定）
6. **路径解析校验**：
   - 路径未完全解析（`!result.fullyResolved`）且之前未报过 ERROR -> 报 ERROR
   - 路径已解析但某段不可观察（非状态变量）-> 报 WARN（通过 `MonitorPathValidationCache` 去重，优先 ERROR）
   - 最后一段若非确定可观察（类型为 null 且 possiblyResolved）-> 报 WARN
7. **可观察性判断**：
   - struct 中：属性需有 `@ComponentV2` 且属性本身有装饰器（即状态变量）
   - class 中：属性需有 `@ObservedV2` 且属性本身有装饰器
   - getter 方法：需被 `@Computed` 装饰
   - 数组索引段：需对应 `@ObservedV2` 装饰的 class（非原始包装类）

### 与 @Monitor 校验的差异
| 差异点 | @Monitor | @SyncMonitor |
|---|---|---|
| 不可观察变量报错等级 | WARN | **ERROR**（优先） |
| 通配符启用条件 | `compatibleSdkVersion >= API_26` 时启用 | **总是启用** |
| 通配符合法性检查 | 无（由动态侧检查） | 有（`isWildcardPathInvalid`） |
| 路径未解析报错等级 | ERROR | ERROR |
| 报错信息文案 | `The Monitor decorator needs to monitor the state variables that exist.` | `'@SyncMonitor' cannot observe non-existent variables or non-state variables, except in wildcard-based monitoring scenarios.` |

## 示例代码
### 反例
```typescript
// 反例1：@SyncMonitor 装饰属性
@ComponentV2
struct MyComp {
  @Local count: number = 0
  @SyncMonitor('count')       // 错误：只能装饰方法
  count: number = 0
}

// 反例2：struct 未用 @ComponentV2
@Component
struct MyComp {
  @Local count: number = 0
  @SyncMonitor('count')       // 错误：需 @ComponentV2
  onChange(monitor: IMonitor) { }
}

// 反例3：class 未用 @ObservedV2
@Observed
class MyClass {
  @Local count: number = 0
  @SyncMonitor('count')       // 错误：需 @ObservedV2
  onChange(monitor: IMonitor) { }
}

// 反例4：通配符不在末尾
@ComponentV2
struct MyComp {
  @Local data: { name: string } = { name: '' }
  @SyncMonitor('data.*.sub')  // 错误：.* 必须在末尾
  onChange(monitor: IMonitor) { }
}

// 反例5：观察不存在的变量
@ComponentV2
struct MyComp {
  @SyncMonitor('nonexistent') // 错误：变量不存在
  onChange(monitor: IMonitor) { }
}
```

### 正例
```typescript
@ComponentV2
struct MyComp {
  @Local count: number = 0
  @Local data: { name: string } = { name: '' }

  @SyncMonitor('count')
  onCountChange(monitor: IMonitor) { }

  @SyncMonitor('data.name')
  onNameChange(monitor: IMonitor) { }

  @SyncMonitor('count.*')     // .* 在末尾
  onWildcard(monitor: IMonitor) { }

  build() { }
}
```

## 静态
### 源码参考位置
- `arkui-plugins/collectors/ui-collectors/validators/rules/check-sync-monitor-decorator.ts:56`
### 静态工具链处理
静态工具链通过 `check-sync-monitor-decorator.ts`（2040 行）校验 @SyncMonitor 装饰器。与 @Monitor 的关键差异：不可观察变量报 ERROR（@Monitor 为 WARN）、通配符总是启用（不依赖 API 版本）、有独立的 `isWildcardPathInvalid` 通符合法性检查。支持 `FixSuggestion`。
- `compiler/src/validate_ui_syntax.ts:1440`（`checkSyncMonitorDecoratorArgInStruct`）
- `compiler/src/validate_ui_syntax.ts:1383`（`checkSyncMonitorDecoratorArgContent`）

## 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| 校验入口 | `validate_ui_syntax.ts:1233-1836` | `check-sync-monitor-decorator.ts:56` |
| 通配符 | 按 API 版本条件启用 | 总是启用 |
| 报错级别 | ERROR（变量不存在） | ERROR |