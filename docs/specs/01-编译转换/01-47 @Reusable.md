# 功能概述
`@Reusable` 装饰器标记自定义组件为可复用组件，配合组件复用池实现列表项回收与重用，降低内存开销。

## 动态
### 源码参考位置
- `compiler/src/process_custom_component.ts:153`（`processCustomComponent`）
- `compiler/src/process_custom_component.ts:263`（`createRecycleComponent`）
- `compiler/src/pre_define.ts:30`（`COMPONENT_DECORATOR_REUSEABLE = '@Reusable'`）
- `compiler/src/pre_define.ts:31`（`DECORATOR_REUSEABLE = 'Reusable'`）
- `compiler/src/pre_define.ts:248`（`OBSERVE_RECYCLE_COMPONENT_CREATION`）

### 转换前的原始代码
```typescript
@Reusable
@Component
struct MyReusable {
  build() { Text('reusable') }
}
```

### 转换后的代码（Legacy）
```typescript
// Legacy 模式下通过 __Recycle__ 包装
// 4 种 observe 选择逻辑根据条件分支
```

### 转换后的代码（Partial Update）
```typescript
// Partial Update 模式下使用 observeRecycleComponentCreation
this.observeRecycleComponentCreation('MyReusable',
  (elmtId, isInitialRender, recycleNode, isPreRender) => {
    // 组件创建/复用逻辑
  }, MyReusable)
```

> 深度逻辑：4 种 observe 选择逻辑：
> 1. `observeRecycleComponentCreation`（Reusable + Partial Update）
> 2. `reuseOrCreateNewComponent`（ReusableV2）
> 3. `observeComponentCreation2`（普通 Partial Update）
> 4. `observeComponentCreation`（Legacy）
> API>=26 时 `Reusable(name)` 调用支持命名复用池。

## 静态
### 源码参考位置
- `arkui-plugins/common/predefines.ts:125`（`StructDecoratorNames.RESUABLE = 'Reusable'`）
- `arkui-plugins/common/predefines.ts:221`（`DecoratorNames.REUSABLE = 'Reusable'`）
- ReusePoolOwnership import

### 转换前的原始代码
```typescript
@Reusable
@Component
struct MyReusable {
  build() { Text('reusable') }
}
```

### 转换后的代码
```typescript
// 静态工具链通过组件复用池机制处理
// 与 CustomComponent 基类配合，由运行时框架管理回收
class MyReusable extends CustomComponent<MyReusable, __Options_MyReusable> {
  // ...
}
```
- @Reusable 仅在 Partial Update 模式下生效（`process_custom_component.ts:227`）
- @Reusable 的可选参数 `reusePool`/`poolAccepts` 生成 `__reusePool__Internal` 属性
- API >= 26 时额外生成 `Reusable(name)` 调用注册到全局复用池
- 使用 `observeRecycleComponentCreation` 而非 `observeComponentCreation2`

- @Reusable 仅在 Partial Update 模式生效（`process_custom_component.ts:227`）
- API >= 26 时额外生成 `Reusable(name)` 调用
## 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| 创建包装 | `observeRecycleComponentCreation` 闭包 | 由 `CustomComponent` 基类配合复用池 |
| 复用模式 | 4 种 observe 分支选择 | 统一通过基类机制 |
| 命名复用 | API>=26 支持 `Reusable(name)` | 通过 `ReusePoolOwnership` 管理 |
| recycleNode | Partial Update 模式传入 `recycleNode`/`isPreRender` 参数 | 由运行时框架处理 |
