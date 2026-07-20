# 规则
校验当 struct 中使用了 `@LocalStorageLink` 绑定属性时，`@Entry` 装饰器必须传入 storage 参数。

## 源码参考位置
- 动态：
  - `compiler/src/process_ui_syntax.ts:1950-1979`（`addStorageParam` 函数，检查 `hasStorage()` 和 `localStorageNum`）
- 静态：
  - `arkui-plugins/collectors/ui-collectors/validators/rules/check-entry-localstorage.ts:32`

## 适用对象
`@Entry` 装饰的 struct 中使用 `@LocalStorageLink` 装饰的成员属性

## 报错信息
- 动态：
  - `'@Entry' should have a parameter, like '@Entry (storage)'.`（WARN）
- 静态：
  - `'@Entry' should have a parameter, like '@Entry ({ storage: "__get_local_storage__" })'.`（WARN）

## 错误码
无显式错误码（WARN 级别）

## 核心校验规则
1. 前置条件：struct 属性上存在 `@LocalStorageLink` 装饰器（`metadata.annotationInfo.hasLocalStorageLink` 为 true）
2. 前置条件：struct 本身被 `@Entry` 装饰（`metadata.structInfo.annotationInfo.hasEntry` 为 true）
3. 检查 `@Entry` 装饰器的参数列表中是否存在 `storage` 属性：
   - 参数必须为 `ClassProperty`，key 为 `Identifier` 且名称等于 `ENTRY_STORAGE`（即 `'storage'`）
   - value 必须为 `StringLiteral` 且字符串长度大于 0
4. 若不满足上述条件，报 WARN 提示 `@Entry` 应有 storage 参数
5. 动态侧逻辑类似：检查 `localStorageLinkCollection` + `localStoragePropCollection` 的总数大于 0 且 `hasStorage()` 为 false 时报 WARN

## 示例代码
### 反例
```typescript
let storage = new LocalStorage();
@Entry                        // 缺少 storage 参数
struct MyComp {
  @LocalStorageLink('key') count: number = 0
  build() { }
}
```

### 正例
```typescript
let storage = new LocalStorage();
@Entry({ storage: storage })
struct MyComp {
  @LocalStorageLink('key') count: number = 0
  build() { }
}
```

## 校验实现细节

### @Entry storage 参数格式
静态工具链期望的 `@Entry` storage 参数格式为对象字面量，形如：
```typescript
@Entry({ storage: '__get_local_storage__' })
```
其中 `storage` 为 key（`Identifier`，名称等于 `EntryParamNames.ENTRY_STORAGE` 即 `'storage'`），value 为非空 `StringLiteral`。

### 检测条件
1. 前置条件：struct 属性含 `@LocalStorageLink`（`metadata.annotationInfo?.hasLocalStorageLink` 为 true）
2. 前置条件：struct 本身被 `@Entry` 装饰（`metadata.structInfo?.annotationInfo?.hasEntry` 为 true）
3. 两个前置条件均满足时，调用 `findStorageParamFromEntryAnnotation` 检查 `@Entry` 装饰器参数列表
4. `findStorageParamFromEntryAnnotation` 遍历 `@Entry` 的 properties，检查是否存在 `ClassProperty`，其 key 为 `Identifier` 且名称等于 `'storage'`，value 为 `StringLiteral` 且 `str.length > 0`
5. 若不满足，报 WARN：`'@Entry' should have a parameter, like '@Entry ({ storage: "__get_local_storage__" })'.`

### 动态侧 addStorageParam 逻辑
动态工具链在 `process_ui_syntax.ts` 的 `addStorageParam` 函数中检查 `hasStorage()`（`@Entry` 是否已传 storage 参数）和 `localStorageNum`（`localStorageLinkCollection` + `localStoragePropCollection` 总数）。当 `localStorageNum > 0` 且 `!hasStorage()` 时报 WARN，提示格式为 `'@Entry' should have a parameter, like '@Entry (storage)'.`

### storage 参数取值
- 静态侧示例值 `'__get_local_storage__'` 为框架内部约定的 LocalStorage 获取标识
- 实际使用中也可传入 `LocalStorage` 实例引用（动态侧），如 `@Entry({ storage: storage })`

### 报错节点定位
静态侧报错时定位到 `@Entry` 注解节点本身（`metadata.structInfo?.annotations?.[StructDecoratorNames.ENTRY]`），而非属性节点。

### 源码位置
`arkui-plugins/collectors/ui-collectors/validators/rules/check-entry-localstorage.ts:22`

## 静态
### 源码参考位置
- `arkui-plugins/collectors/ui-collectors/validators/rules/check-entry-localstorage.ts:22`
### 静态工具链处理
静态工具链通过 `check-entry-localstorage.ts` 校验当 struct 中使用了 @LocalStorageLink 时 @Entry 必须传入 storage 参数。报错级别为 WARN。
- `compiler/src/pre_define.ts:655`（`CREATE_LOCAL_STORAGE_LINK`）

## 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| 校验入口 | `process_ui_syntax.ts:1950`（`addStorageParam`） | `check-entry-localstorage.ts:22` |
| 报错级别 | WARN | WARN |
| 检测条件 | 检查 `hasStorage()` 和 `localStorageNum` | 检查 struct 中 @LocalStorageLink 属性存在性 |