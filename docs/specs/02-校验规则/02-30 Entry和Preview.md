# 规则
校验同一文件内 @Entry 装饰器数量不超过 1 个、@Preview 装饰器数量不超过 10 个、@Entry struct 不可导出、pages 配置文件必须有且仅有一个 @Entry。

## 源码参考位置
- 动态：
  - `compiler/src/validate_ui_syntax.ts:342-379`（`validateEntryAndPreviewCount`）
  - `compiler/src/validate_ui_syntax.ts:3380-3392`（`checkEntryComponent`，@Entry struct 不可导出）
- 静态：
  - `arkui-plugins/collectors/ui-collectors/validators/rules/check-main-pages-entry-check.ts:24`
  - `arkui-plugins/collectors/ui-collectors/validators/rules/check-no-duplicate-preview.ts:23`
  - `arkui-plugins/collectors/ui-collectors/validators/rules/check-entry-struct-no-export.ts:22`
  - `arkui-plugins/collectors/ui-collectors/validators/rules/check-main-pages-entry-check.ts:24`

## 适用对象
- @Entry struct 声明
- @Preview 装饰器使用

## 报错信息
- 动态：
  - `A page can't contain more than one '@Entry' decorator.`（错误码 10905231）
  - `A page which is being previewed must have one and only one '@Entry' decorator, or at least one '@Preview' decorator.`（错误码 10905403）
  - `A page configured in '${projectConfig.pagesJsonFileName} or build-profile.json5' must have one and only one '@Entry' decorator.`（错误码 10905402）
  - `A page can contain at most 10 '@Preview' decorators.`（错误码 10905404）
  - `It's not a recommended way to export struct with '@Entry' decorator, which may cause ACE Engine error in component preview mode.`（WARN）
- 静态：
  - `A page can't contain more then one '@Entry' annotation.`
  - `A page can contain at most 10 '@Preview' annotations.`
  - `It's not a recommended way to export struct with '@Entry' annotation.`

## 错误码
- 10905231：多个 @Entry
- 10905402：pages 配置文件要求有且仅有一个 @Entry
- 10905403：preview 模式缺少 @Entry 或 @Preview
- 10905404：超过 10 个 @Preview

## 核心校验规则
1. 单文件内 @Entry 装饰器数量 <= 1
2. 单文件内 @Preview 装饰器数量 <= 10
3. @Entry struct 使用 `export` 关键字时发出 WARN
4. pages 配置文件中配置的页面必须有且仅有一个 @Entry
5. preview 模式下页面必须有且仅有一个 @Entry 或至少一个 @Preview
6. 静态工具链提供移除重复 @Entry 的自动修复

## 示例代码
### 反例
```typescript
@Entry
struct Page1 { build() { Text('1') } }

@Entry                              // 多个 @Entry
struct Page2 { build() { Text('2') } }

export
@Entry
struct ExportedPage { build() { Text('export') } }  // @Entry + export (WARN)
```

### 正例
```typescript
@Entry
struct MyPage {
  build() { Text('hello') }
}

// preview 模式
@Preview
struct PreviewPage {
  build() { Text('preview') }
}
```

## 静态
### 源码参考位置
- `arkui-plugins/collectors/ui-collectors/validators/rules/check-main-pages-entry-check.ts:24`
- `arkui-plugins/collectors/ui-collectors/validators/rules/check-no-duplicate-preview.ts:23`
- `arkui-plugins/collectors/ui-collectors/validators/rules/check-entry-struct-no-export.ts:22`
### 静态工具链处理
静态工具链通过 3 个独立规则文件校验：main_pages 配置页面必须有且仅有一个 @Entry（check-main-pages-entry-check）、@Preview 数量不超过 10（check-no-duplicate-preview）、@Entry struct 不可导出（check-entry-struct-no-export）。支持 `FixSuggestion`。

## 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| @Entry 数量 | validate_ui_syntax.ts:342（validateEntryAndPreviewCount） | check-main-pages-entry-check.ts:24 |
| @Preview 数量 | validate_ui_syntax.ts:342 | check-no-duplicate-preview.ts:23 |
| @Entry 导出 | validate_ui_syntax.ts:3380（checkEntryComponent） | check-entry-struct-no-export.ts:22 |
| 自动修复 | 无 | 有 FixSuggestion |