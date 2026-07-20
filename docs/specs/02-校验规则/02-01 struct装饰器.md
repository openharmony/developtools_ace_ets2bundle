# 规则
校验 struct 声明必须使用 `@Component`/`@ComponentV2`/`@CustomDialog` 装饰器之一，且不可使用无效装饰器。

## 源码参考位置
- 动态：
  - `compiler/src/validate_ui_syntax.ts:332`（`validateStructSpec`）
  - `compiler/src/validate_ui_syntax.ts:462-497`（`validateComponentDecorator`/`validateStruct`）
  - `compiler/src/validate_ui_syntax.ts:455-460`（`validateInvalidStructDecorator`）
- 静态：
  - `arkui-plugins/collectors/ui-collectors/validators/rules/check-validate-decorator-target.ts:46`
  - `arkui-plugins/collectors/ui-collectors/validators/rules/check-componentV2-mix.ts:22`

## 适用对象
struct 声明

## 报错信息
- 动态：
  - `Decorator '@Component', '@ComponentV2', or '@CustomDialog' is missing for struct '${componentName}'.`（错误码 10905233）
  - `A struct must have a name.`（错误码 10905232）
  - `Please use a valid decorator.`（错误码 10905234）
  - `The struct '${componentName}' use invalid decorator.`（WARN，无错误码）
- 静态：`Annotation '@Component', '@ComponentV2', or '@CustomDialog' is missing for struct '{{structName}}'.`

## 错误码
- 10905233：struct 缺少组件装饰器
- 10905232：struct 必须有名称
- 10905234：无效装饰器语法（缺少 struct 关键字）

## 核心校验规则
1. struct 声明必须包含 `@Component`、`@ComponentV2` 或 `@CustomDialog` 装饰器之一
2. struct 必须有名称（不可为匿名 struct）
3. struct 装饰器必须在 `INNER_COMPONENT_DECORATORS` 集合中，否则发出 WARN
4. `@ComponentV2` 不可与 `@Component`/`@Reusable`/`@CustomDialog` 同时使用（错误码 10905229）

## 示例代码
### 反例
```typescript
// 缺少装饰器
struct MyComponent {
  build() { Text('hello') }
}

// V1/V2 混用
@ComponentV2
@Component
struct MyComp { }

// 匿名 struct
struct { build() { Text('hi') } }
```

### 正例
```typescript
@Component
struct MyComponent {
  build() { Text('hello') }
}

@ComponentV2
struct MyV2Component {
  build() { Text('hello') }
}
```

## 静态
### 源码参考位置
- `arkui-plugins/collectors/ui-collectors/validators/rules/check-validate-decorator-target.ts:46`
- `arkui-plugins/collectors/ui-collectors/validators/rules/check-componentV2-mix.ts:22`
### 静态工具链处理
静态工具链在 parsed 阶段检测 struct 是否包含 @Component/@ComponentV2/@CustomDialog 装饰器，并通过 `check-componentV2-mix.ts` 校验 @ComponentV2 不可与 @Component/@Reusable/@CustomDialog 混用。报错通过 `this.report({ node, level, message })` 输出，无数字错误码，支持 `FixSuggestion`。
- 错误码 10905233：struct 缺少组件装饰器
- 错误码 10905232：struct 必须有名称
- 错误码 10905234：无效装饰器语法（缺少 struct 关键字）
- 错误码 10905229：@ComponentV2 不可与 @Component/@Reusable/@CustomDialog 同时使用

## 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| 校验入口 | validate_ui_syntax.ts:324（validateStructSpec） | check-validate-decorator-target.ts:46 + check-componentV2-mix.ts:22 |
| 报错机制 | addLog(LogType.ERROR) + 错误码 | this.report({ level, message }) |
| 错误码 | 10905229/10905232/10905233/10905234 | 无数字错误码 |
| 自动修复 | 无 | 有 FixSuggestion |