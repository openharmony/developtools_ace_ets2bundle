# 规则
校验 `@Watch` 装饰器不能单独使用，必须与其他状态管理装饰器配合使用。

## 源码参考位置
- 动态：
  - `compiler/src/process_component_member.ts:1472-1490`（`validateWatchDecorator` 函数，检查装饰器数量为 1 或仅含 @Require）
- 静态：
  - `arkui-plugins/collectors/ui-collectors/validators/rules/check-watch-decorator-regular.ts:33`

## 适用对象
`@Watch` 装饰的 struct 成员属性（ClassProperty）

## 报错信息
- 动态：
  - `Regular variable '${propertyName.escapedText.toString()}' can not be decorated with '@Watch'.`（ERROR，错误码 10905310）
- 静态：
  - `Regular variable '${metadata.name}' can not be decorated with '@Watch'.`（ERROR）

## 错误码
- 10905310：常规变量被 @Watch 单独装饰（动态）

## 核心校验规则
1. 检查属性是否含有 `@Watch` 装饰器（`metadata.annotationInfo.hasWatch` 为 true）
2. 获取该属性上的装饰器总数 `annotationCount`（静态侧用 `node.annotations.length`）
3. 动态侧额外判断：若装饰器数量为 2（`DECORATOR_LENGTH`）且其中一个是 `@Require`，也视为"单独使用"（@Require 不是状态管理装饰器）
4. 当 `@Watch` 是唯一装饰器（`annotationCount === 1`）或仅与 @Require 配合时，报 ERROR
5. 静态侧逻辑简化：`hasWatch && annotationCount === 1` 即报错

## 示例代码
### 反例
```typescript
@Component
struct MyComp {
  @Watch('onDataChange')      // 错误：@Watch 单独使用，需配合 @State 等状态装饰器
  data: number = 0

  onDataChange(): void { }
  build() { }
}
```

### 正例
```typescript
@Component
struct MyComp {
  @State @Watch('onCountChange')
  count: number = 0           // 正确：@Watch 配合 @State 使用

  onCountChange(): void { }
  build() { }
}
```

## 校验实现细节

### @Watch 不可单独使用的具体场景
当 struct 成员属性仅被 `@Watch` 一个装饰器修饰时（`node.annotations.length === 1` 且 `hasWatch` 为 true），报 ERROR。静态工具链不额外处理 `@Require` 组合（与动态侧不同，动态侧在装饰器数量为 2 且含 `@Require` 时也视为单独使用）。

### 必须配合的状态装饰器列表
`@Watch` 必须与以下状态管理装饰器之一同时使用（即属性上除 `@Watch` 外还需至少一个状态装饰器）：
- @State、@Prop、@Link、@Provide、@Consume、@StorageLink、@StorageProp、@LocalStorageLink、@LocalStorageProp、@ObjectLink、@BuilderParam

### 校验逻辑流程
1. 从 `metadata.annotationInfo?.hasWatch` 判断属性是否含 `@Watch` 装饰器
2. 从 `node.annotations.length` 获取属性上的注解总数 `annotationCount`
3. 当 `hasWatch && annotationCount === 1` 时，定位到 `@Watch` 注解节点（`metadata.annotations?.[DecoratorNames.WATCH]`）报错

### 动态侧与静态侧的 @Require 处理差异
动态工具链（`validateWatchDecorator`）额外判断：当装饰器数量为 2（`DECORATOR_LENGTH`）且其中一个是 `@Require` 时，也视为"单独使用"并报错。这是因为 `@Require` 不是状态管理装饰器，不能为 `@Watch` 提供数据源。静态工具链简化了此逻辑，仅在 `annotationCount === 1` 时报错。

### 报错节点定位
静态侧报错时定位到 `@Watch` 注解节点本身（`metadata.annotations?.[DecoratorNames.WATCH]`），而非属性节点，便于 IDE 高亮具体的装饰器。

### 源码位置
`arkui-plugins/collectors/ui-collectors/validators/rules/check-watch-decorator-regular.ts:22`

## 静态
### 源码参考位置
- `arkui-plugins/collectors/ui-collectors/validators/rules/check-watch-decorator-regular.ts:22`
### 静态工具链处理
静态工具链通过 `check-watch-decorator-regular.ts` 校验 @Watch 不可单独使用（当注解数量为 1 时报错），必须与其他状态管理装饰器配合。

- `compiler/src/pre_define.ts:45`（`COMPONENT_WATCH_DECORATOR = '@Watch'`）

## 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| 校验入口 | `process_component_member.ts:1472`（`validateWatchDecorator`） | `check-watch-decorator-regular.ts:22` |
| 检测逻辑 | 检查装饰器数量为 1 或仅含 @Require | 检查注解数量 === 1 时报错 |
| 自动修复 | 无 | 无 |