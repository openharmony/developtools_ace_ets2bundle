# 功能概述
`@BuilderParam` 装饰器标记组件中可接收外部 `@Builder` 函数的占位属性，用于实现插槽（slot）模式的内容注入。

## 动态
### 源码参考位置
- `compiler/src/process_component_member.ts:1016-1029`（`updateBuilderParamProperty`）
- `compiler/src/pre_define.ts:46`（`COMPONENT_BUILDERPARAM_DECORATOR = '@BuilderParam'`）

### 转换前的原始代码
```typescript
@Component
struct MyComponent {
  @BuilderParam content: () => void
}
```

### 转换后的代码（Legacy）
```typescript
// 移除装饰器保留为普通属性（immutableDecorators，不生成 setter）
this.content = params.content || undefined
get content(): () => void { return this.content }
// 不生成 setter
```

### 转换后的代码（Partial Update）
```typescript
this.content = params.content || undefined
get content(): () => void { return this.content }
// 不生成 setter
```

> 校验：`@BuilderParam` 不可用 `@Builder` 直接初始化（错误码 `10905101`）。

## 静态
### 源码参考位置
- `arkui-plugins/ui-plugins/property-translators/builderParam.ts:40`（`BuilderParamTranslator`）
- `arkui-plugins/common/predefines.ts:217`（`DecoratorNames.BUILDER_PARAM = 'BuilderParam'`）

### 转换前的原始代码
```typescript
@Component
struct MyComponent {
  @BuilderParam content: () => void
}
```

### 转换后的代码
```typescript
// 尾随闭包注入最后一个 @BuilderParam
private __backing_content: () => void
get content(): () => void { return this.__backing_content! }

__initializeStruct(initializers, content): void {
  this.__backing_content = initializers?.content
    ?? initializers?.content
    ?? initialValue
}
```
- @BuilderParam 校验：不可用 Builder 直接初始化（`judgeBuilderParamAssignedByBuilder`，`process_component_member.ts:1033`，错误码 10905107）
- @BuilderParam 是 immutable（`immutableDecorators`，不生成 setter）
- `compiler/src/process_component_member.ts:1033`（`judgeBuilderParamAssignedByBuilder`，错误码 10905107）
- @BuilderParam 是 immutable（不生成 setter）
- @BuilderParam 不可用 Builder 直接初始化（错误码 10905107）
- 静态工具链中，最后一个 @BuilderParam 通过尾随闭包注入（`isLastBuilderParam`）
- @BuilderParam 类型为函数类型时，静态工具链自动添加 @memo 注解让 memo 插件介入

- 不可用 Builder 直接初始化（`judgeBuilderParamAssignedByBuilder`，`process_component_member.ts:1033`，错误码 10905107）
- @BuilderParam 是 immutable（`immutableDecorators`，不生成 setter）
- 不可用 Builder 直接初始化（错误码 10905107）
- @BuilderParam 是 immutable（不生成 setter）

## 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| 可变性 | immutableDecorators，不生成 setter | 不生成 setter |
| 初始化 | `params.content \|\| undefined` | `initializers?.content ?? initialValue` |
| 尾随闭包 | 无 | 注入最后一个 `@BuilderParam` |
| 校验 | 禁止用 `@Builder` 直接初始化（错误码 10905101） | 通过类型系统约束 |
