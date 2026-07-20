# 功能概述
`@Watch` 装饰器为状态变量注册变更回调，当被监听的属性值变化时触发指定的观察方法。

## 动态
### 源码参考位置
- `compiler/src/process_component_member.ts:634-668`（`processWatch`）
- `compiler/src/pre_define.ts:45`（`COMPONENT_WATCH_DECORATOR = '@Watch'`）
- `compiler/src/pre_define.ts:272`（`COMPONENT_WATCH_FUNCTION = 'declareWatch'`）

### 转换前的原始代码
```typescript
@Component
struct MyComponent {
  @State @Watch('onDataChange') count: number = 0

  onDataChange(): void { /* ... */ }
}
```

### 转换后的代码（Legacy）
```typescript
// 在构造函数中声明 watch
this.declareWatch('count', this.onDataChange)
this.__count = new ObservedPropertySimple(0, this, 'count')
```

### 转换后的代码（Partial Update）
```typescript
// 在构造函数中声明 watch
this.declareWatch('count', this.onDataChange)
this.__count = new ObservedPropertySimplePU(0, this, 'count')
```

## 静态
### 源码参考位置
- 通过 `watchCb?` 参数传递给 `makeState`/`makeLink` 等工厂方法
- `arkui-plugins/ui-plugins/property-translators/base.ts`（`initializeOptions.isWatched`）
- `arkui-plugins/common/predefines.ts:216`（`DecoratorNames.WATCH = 'Watch'`）

### 转换前的原始代码
```typescript
@Component
struct MyComponent {
  @State @Watch('onDataChange') count: number = 0

  onDataChange(): void { /* ... */ }
}
```

### 转换后的代码
```typescript
// @Watch 不生成独立语句，通过 watchCb 参数传入工厂方法
__initializeStruct(initializers, content): void {
  this.__backing_count = STATE_MGMT_FACTORY.makeState<number>("count",
    initializers?.count ?? 0, this.onDataChange)
}
```
- @Watch 注册到 `watchMap`，在 `addConstructor` 中生成 `this.declareWatch('name', this.onDataChange)`
- @Watch 支持三种参数形式：字符串字面量方法名、标识符（WARN）、属性访问表达式
- @Watch 不可单独使用，必须配合其他状态管理装饰器（`process_component_member.ts:1472`）
- @Watch 参数必须指向 struct 中已存在的方法名

- `processWatch`（`process_component_member.ts:634`）：注册到 `watchMap`，最终在 `addConstructor` 中生成 `this.declareWatch('name', this.onDataChange)`
- `COMPONENT_WATCH_FUNCTION = 'declareWatch'`（`pre_define.ts:272`）
- @Watch 支持三种参数形式：字符串字面量方法名、标识符（WARN）、属性访问表达式

- @Watch 注册到 `watchMap`，最终在 `addConstructor`（`process_component_constructor.ts:158`）中生成 `this.declareWatch('name', this.onDataChange)`
- @Watch 支持三种参数形式：字符串字面量方法名、标识符（WARN）、属性访问表达式

- `compiler/src/process_component_constructor.ts:158`（`addConstructor`，在构造函数中生成 `this.declareWatch(name, callback)`）

- @Watch 注册到 `watchMap`，在 `addConstructor` 中生成 `this.declareWatch('count', this.onDataChange)`
- @Watch 不可单独使用，必须配合其他状态管理装饰器
- @Watch 参数必须指向 struct 中已存在的方法名

## 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| 注册方式 | 独立调用 `this.declareWatch(name, callback)` | 作为 `watchCb?` 参数传入工厂方法 |
| 触发时机 | 在属性初始化前注册 watch | 工厂方法内部绑定 |
| 回调引用 | `this.onDataChange` 方法引用 | 同上，由 `initializeOptions.isWatched` 控制 |
| 代码生成 | 生成独立表达式语句 | 内联到工厂调用参数中 |
