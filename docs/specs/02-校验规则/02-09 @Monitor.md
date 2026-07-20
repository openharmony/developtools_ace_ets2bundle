# 规则
校验 `@Monitor`/`@SyncMonitor` 装饰器的参数路径必须指向存在的状态变量，通配符 `.*` 必须在字符串末尾，`enableWildcard` 选项必须是布尔值。

## 源码参考位置
- 动态：`compiler/src/validate_ui_syntax.ts:1233-1836`（多个函数）
- 静态：
  - `arkui-plugins/collectors/ui-collectors/validators/rules/check-monitor-decorator.ts:57`
  - `arkui-plugins/collectors/ui-collectors/validators/rules/check-sync-monitor-decorator.ts:56`

## 适用对象
struct/class 方法（@Monitor/@SyncMonitor 装饰的方法）

## 报错信息
- 动态：
  - `The '@Monitor' decorator needs to monitor the state variables that exist.`（WARN）
  - `'@SyncMonitor' cannot observe non-existent variables or non-state variables, except in wildcard-based monitoring scenarios.`（错误码 10905366）
  - `Only constant expressions are supported as parameters in '@${decoratorName}'. Variables are not allowed.`（错误码 10905365，SyncMonitor；WARN，Monitor）
  - `In wildcard-based monitoring scenarios with '${currentDecoratorName}', the .* pattern must be placed at the end of the string.`（错误码 10905367）
  - `The value of 'enableWildcard' must be a Boolean keyword.`（错误码 10905372）
  - `The '@Monitor' can decorate only member method within a 'class' decorated with @ObservedV2.`（错误码 10905343）
  - `The '@Monitor' annotation can only be used in a 'struct' decorated with '@ComponentV2'.`
- 静态：
  - `@Monitor can only decorate method.`
  - `The '@Monitor' can decorate only member method within a 'class' decorated with @ObservedV2.`
  - `The '@Monitor' annotation can only be used in a 'struct' decorated with '@ComponentV2'.`
  - `The Monitor decorator needs to monitor the state variables that exist.`
  - `In wildcard-based monitoring scenarios with '@Monitor', the .* pattern must be placed at the end of the string.`
  - `'@SyncMonitor' cannot observe non-existent variables or non-state variables, except in wildcard-based monitoring scenarios.`

## 错误码
- 10905343：@Monitor/@SyncMonitor 不在 @ObservedV2 class 中
- 10905365：@SyncMonitor 参数不是常量表达式
- 10905366：@SyncMonitor 观察不存在的变量
- 10905367：通配符 .* 不在字符串末尾
- 10905372：enableWildcard 不是布尔值

## 核心校验规则
1. @Monitor/@SyncMonitor 仅用于方法
2. struct 中需 @ComponentV2，class 中需 @ObservedV2
3. 参数必须是字符串字面量常量（@SyncMonitor 更严格，不允许变量）
4. 参数引用的变量必须存在且为状态变量（@SyncMonitor 为 ERROR，@Monitor 为 WARN）
5. 通配符 `.*` 必须在字符串末尾且仅出现一次
6. `enableWildcard` 选项必须是布尔关键字（`true`/`false`）

## 示例代码
### 反例
```typescript
@ComponentV2
struct MyComp {
  @Local count: number = 0

  @Monitor('nonexistent')              // 监听不存在的变量
  onNonexistent(monitor: IMonitor) { }

  @Monitor('count.*.sub')              // .* 不在末尾
  onBadWildcard(monitor: IMonitor) { }

  @SyncMonitor(myVariable)             // 参数不是常量
  onSync(monitor: IMonitor) { }
}
```

### 正例
```typescript
@ComponentV2
struct MyComp {
  @Local count: number = 0
  @Local data: { name: string } = { name: '' }

  @Monitor('count')
  onCountChange(monitor: IMonitor) { }

  @Monitor('data.name')
  onNameChange(monitor: IMonitor) { }

  @Monitor('count.*')                  // .* 在末尾
  onWildcard(monitor: IMonitor) { }
}
```

## 静态
### 源码参考位置
- `arkui-plugins/collectors/ui-collectors/validators/rules/check-monitor-decorator.ts:71`
### 静态工具链处理
静态工具链通过 `check-monitor-decorator.ts`（2824 行，最大规则文件）校验 @Monitor 装饰器：仅用于方法、struct 中需 @ComponentV2、class 中需 @ObservedV2、参数路径必须解析到存在的状态变量、支持通配符 `.*`。深度路径解析含数组索引、Map/Set、union 类型、跨文件导入。支持 `FixSuggestion`。

- `arkui-plugins/common/predefines.ts:236`（`DecoratorNames.MONITOR = 'Monitor'`）

## 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| 校验入口 | validate_ui_syntax.ts:1233-1836（多个函数） | check-monitor-decorator.ts:71（2824 行） |
| 路径解析 | 基础路径检测 | 深度路径解析（数组索引/Map/Set/union/跨文件） |
| 报错级别 | 变量不存在为 WARN | 变量不存在为 WARN |
| 自动修复 | 无 | 有 FixSuggestion |