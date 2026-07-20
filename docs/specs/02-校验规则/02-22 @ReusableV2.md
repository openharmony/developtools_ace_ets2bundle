# 规则
校验 `@ReusableV2` 装饰器的使用约束：不可与 `@Reusable` 同时使用，且仅用于 `@ComponentV2` 装饰的组件。

## 源码参考位置
- 动态：
  - `compiler/src/validate_ui_syntax.ts:479-480`（`@ReusableV2` 仅用于 `@ComponentV2`，错误码 10905242）
  - `compiler/src/validate_ui_syntax.ts:483-486`（`@Reusable` 与 `@ReusableV2` 不可同时使用，错误码 10905241）
  - `compiler/src/pre_define.ts:75`（`COMPONENT_DECORATOR_REUSABLE_V2 = '@ReusableV2'`）
  - `compiler/src/pre_define.ts:76`（`DECORATOR_REUSABLE_V2 = 'ReusableV2'`）
- 静态：
  - `arkui-plugins/collectors/ui-collectors/validators/rules/check-reusableV2-decorator.ts:34`（`_checkReusableV2Decorator`，两条规则合一实现）

## 适用对象
struct 声明（被 `@ReusableV2` 装饰的 struct）

## 报错信息
- 动态：
  - `The '@Reusable' and '@ReusableV2' decoraotrs cannot be applied simultaneously.`（错误码 10905241）
  - `'@ReusableV2' is only applicable to custom components decorated by '@ComponentV2'.`（错误码 10905242）
- 静态：
  - `The '@Reusable' and '@ReusableV2' annotations cannot be applied simultaneously.`
  - `@ReusableV2 is only applicable to custom components decorated by @ComponentV2.`

## 错误码
- 10905241：`@Reusable` 与 `@ReusableV2` 同时使用
- 10905242：`@ReusableV2` 不用于 `@ComponentV2` 装饰的组件

## 核心校验规则
1. `@Reusable` 和 `@ReusableV2` 装饰器不可同时用于同一个 struct
2. `@ReusableV2` 仅可用于被 `@ComponentV2` 装饰的自定义组件
3. 校验等级为 ERROR（阻断性错误）
4. 动态工具链在 `validateStruct` 函数中通过 `structInfo.isReusableV2` 和 `structInfo.isComponentV2`/`structInfo.isReusable` 标志判断
5. 静态工具链在 `check-reusableV2-decorator.ts` 中通过 `metadata.annotationInfo` 的 `hasReusableV2`/`hasComponentV2`/`hasReusable` 标志判断

## 示例代码
### 反例
```typescript
// @Reusable + @ReusableV2 同时使用
@Reusable
@ReusableV2
@ComponentV2
struct MyComp {
  build() { Text('hello') }
}

// @ReusableV2 不用于 @ComponentV2
@ReusableV2
@Component
struct MyV1Comp {
  build() { Text('hello') }
}
```

### 正例
```typescript
@ReusableV2
@ComponentV2
struct MyComp {
  build() { Text('hello') }
}
```

## 静态
### 源码参考位置
- `arkui-plugins/collectors/ui-collectors/validators/rules/check-reusableV2-decorator.ts:22`
### 静态工具链处理
静态工具链通过 `check-reusableV2-decorator.ts` 校验 @ReusableV2：不可与 @Reusable 同时使用、仅用于 @ComponentV2 装饰的组件。通过 `metadata.annotationInfo` 的 `hasReusableV2`/`hasComponentV2`/`hasReusable` 标志判断。
- 错误码 10905241：@Reusable 与 @ReusableV2 同时使用
- 错误码 10905242：@ReusableV2 不用于 @ComponentV2
- 静态规则文件：`check-reusableV2-decorator.ts:22`（`_checkReusableV2Decorator`）
- 通过 `metadata.annotationInfo` 的 `hasReusableV2`/`hasComponentV2`/`hasReusable` 标志判断

- 错误码 10905241：@Reusable 与 @ReusableV2 同时使用
- 错误码 10905242：@ReusableV2 不用于 @ComponentV2
- 通过 `metadata.annotationInfo` 的 `hasReusableV2`/`hasComponentV2`/`hasReusable` 标志判断
## 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| 校验入口 | validate_ui_syntax.ts:479-486 | check-reusableV2-decorator.ts:22 |
| 错误码 | 10905241/10905242 | 无数字错误码 |
| 自动修复 | 无 | 无 |