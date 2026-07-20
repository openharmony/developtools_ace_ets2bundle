# 功能概述
`@Entry` 装饰器标记 struct 为页面入口，影响构建流水线并生成路由注册代码。

## 动态
### 源码参考位置
- `compiler/src/pre_define.ts:26`（`COMPONENT_DECORATOR_ENTRY = '@Entry'`）

### 转换前的原始代码
```typescript
@Entry
struct MyPage {
  build() { Text('hello') }
}
```

### 转换后的代码（Legacy）
```typescript
// 标记 struct 为页面入口，影响构建流水线
// 生成入口注册逻辑
class MyPage extends View {
  // ...
}
```

### 转换后的代码（Partial Update）
```typescript
class MyPage extends ViewPU {
  // ...
}
```

> 深度逻辑：`transformStorageParams` 处理 `@Entry({ storage, useSharedStorage })` 参数；`navInterfaceArg` 构造 NavInterface 参数对象。

## 静态
### 源码参考位置
- `arkui-plugins/ui-plugins/entry-translators/entry-transformer.ts:22`（`EntryTransformer`）
- `arkui-plugins/ui-plugins/entry-translators/factory.ts:208`（`generateEntryWrapper`）
- `arkui-plugins/common/predefines.ts:122`（`StructDecoratorNames.ENTRY = 'Entry'`）

### 转换前的原始代码
```typescript
@Entry
struct MyPage {
  build() { Text('hello') }
}
```

### 转换后的代码
```typescript
// 生成 __EntryWrapper 类 implements EntryPoint
class __EntryWrapper implements EntryPoint {
  entry() {
    // 调用 struct
  }
  // RegisterNamedRouter 调用
}
```
- @Entry 的 `createEntryNode`（`process_ui_syntax.ts:1506`）生成入口节点
- @Entry 的 `routeName` 参数用于命名路由注册（`createRegisterNamedRoute`）
- `compiler/src/process_ui_syntax.ts:1506`（`createEntryNode`）
- @Entry 的可选参数 `{ storage, useSharedStorage, routeName }`
- `storage` 参数用于绑定 LocalStorage（`@Entry({ storage: '__get_local_storage__' })`）
- `routeName` 用于命名路由注册（`createRegisterNamedRoute`）
- @Entry struct 不可导出（WARN）

- `createEntryNode`（`process_ui_syntax.ts:1506`）生成入口节点
- `routeName` 参数用于命名路由注册
- `createEntryNode`（`process_ui_syntax.ts:1506`）生成入口节点
- `routeName` 参数用于命名路由注册

- @Entry 的 `useSharedStorage` 参数：`process_ui_syntax.ts:1628`（`generateLoadDocumentEntrance`）

## 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| 入口标记 | 标记 struct 影响构建流水线 | 生成 `__EntryWrapper` 类 |
| 路由注册 | 流水线处理 | `RegisterNamedRouter` 调用 |
| storage 参数 | `transformStorageParams` 处理 | `EntryAnnoInfo` 解析 |
| NavInterface | `navInterfaceArg` 构造 | 由 `EntryPoint` 接口约束 |
