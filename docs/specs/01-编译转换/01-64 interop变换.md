# 功能概述
interop 变换是静态工具链中 ArkTS 组件的 struct 到 class 桥接机制，通过 interop-plugins 在 parsed 和 checked 阶段处理跨语言互操作。

## 动态
### 源码参考位置
动态工具链不涉及 interop 变换。interop 是静态工具链特有的跨语言互操作机制。

## 静态
### 源码参考位置
- `arkui-plugins/interop-plugins/index.ts`（`interopTransform`，插件入口）
- `arkui-plugins/interop-plugins/decl_transformer.ts`（`DeclTransformer`，parsed 阶段）
- `arkui-plugins/interop-plugins/emit_transformer.ts`（`EmitTransformer`，checked 阶段）
- `arkui-plugins/interop-plugins/arkuiImportList.ts`（`ARKUI_DECLARE_LIST`，165 个组件/装饰器名）
- `arkui-plugins/ui-plugins/interop/interop.ts`（`generateArkUICompatible`）
- `arkui-plugins/ui-plugins/interop/builder-interop.ts`（`generateBuilderCompatible`）

### 转换前的原始代码
```typescript
// ArkTS 1.1 组件调用
MyComp({ count: 1 }) { Text("hi") }
```

### 转换后的代码
```typescript
// parsed 阶段: struct -> class（interop 路径）
class MyComp {
  // build 方法体清空（保留签名，用于跨语言互操作）
  build() {}
}

// checked 阶段: 注解变换
// @Provider('alias') -> @Provider({ value: 'alias' })
// V2 装饰器名映射: PropRef -> Prop, StoragePropRef -> StorageProp
// @Monitor/@Computed 方法清除注解

// 组件调用 -> arkUICompatible 调用
arkUICompatible(
  /* initializer */ (instance) => {
    let global = globalThis...;
    let elmtId = ...;
    let createCompatibleNode = global.getProperty("createCompatibleNodeWithFunc2");
    let component = createCompatibleNode.invoke(MyComp_wrap, elmtId, arg1_wrap, arg2_wrap);
    let viewPU = global.getProperty("viewPUCreate").invoke(Component);
    return createInitReturn(MyComp);
  },
  /* updater */ (instance) => { ... runPendingJobs.invoke() }
)
```

### 关键转换逻辑
- **流水线**（interop-plugins/index.ts）：
  1. parsed 阶段：`DeclTransformer` 做 struct -> class 变换，清空 build 方法体
  2. checked 阶段：`EmitTransformer` 处理注解变换，调 `arkts.recheckSubtree(script)`
- **DeclTransformer**（decl_transformer.ts）：
  - `processComponent()`：struct -> class（同 definition）
  - `transformMethodDefinition()`：对 build 方法清空函数体
  - `transformWrappedBuilderVarDecl()`：`WrappedBuilder<(...)=>void>` -> `WrappedBuilder<[Tuple<...>]>` 元组类型
  - `updateImportDeclaration()`：对 `@ohos.arkui.*` 导入中 `ARKUI_DECLARE_LIST` 集合的 specifier 标记 `setRemovable(true)`
- **EmitTransformer**（emit_transformer.ts）：
  - `transformReusePoolInAnnotations()`：`reusePool` 值转字符串，添加 `freezeWhenInactive: true`
  - `processAlias()`：`@Provider('alias')` -> `@Provider({ value: 'alias' })`
  - `processRefDecorators()`：V2 装饰器名映射为 V1 旧名
  - `processMethodDefinition()`：清除 `@Monitor`/`@Computed` 方法注解
- **arkUICompatible 生成**（ui-plugins/interop/interop.ts）：
  - 对 interop 组件调用生成 `arkUICompatible(initializer, updater, this)` 调用
  - `getFunctionName()`（builder-interop.ts）：根据参数数量选择 `createCompatibleNodeWithFuncVoid` / `createCompatibleNodeWithFunc2` 等
- interop 插件流水线顺序：interop（parsed）-> ui（parsed+checked）-> ui-syntax（checked）-> memo（checked）
- `ARKUI_DECLARE_LIST`（`arkuiImportList.ts`）包含 165 个 ArkUI 组件/装饰器名称
- interop 插件的 `EmitTransformer` 在 checked 阶段调用 `arkts.recheckSubtree(script)`（`interop-plugins/index.ts`）
- `DeclTransformer` 在 parsed 阶段清空 build 方法体（保留签名用于跨语言互操作）

### 转换后的代码（Legacy）
```typescript
// parsed 阶段: struct -> class（interop 路径）
class MyComp { build() {} }
// checked 阶段: @Provider('alias') -> @Provider({ value: 'alias' })
```
### 转换后的代码（Partial Update）
interop 变换不区分 Legacy/Partial Update 模式，parsed 和 checked 阶段处理逻辑相同。

## 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| interop 机制 | 不支持 | interop-plugins 实现 struct -> class 桥接 |
| 跨语言互操作 | 不适用 | `arkUICompatible(initializer, updater, this)` 调用 |
| 装饰器名映射 | 不适用 | V2 装饰器名 -> V1 旧名（PropRef -> Prop 等） |
| build 方法 | 完整展开为 create/pop | 清空函数体，保留签名 |
| recheckSubtree | 不适用 | checked 阶段必须调用 |
