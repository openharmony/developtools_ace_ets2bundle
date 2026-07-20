# 规则
校验 `@Computed` 装饰器只能用于 GetAccessor、不可定义 setter、必须在 `@ComponentV2` struct 或 `@ObservedV2` class 中使用、不可与 `$$` 双向绑定语法一起使用。

## 源码参考位置
- 动态：`compiler/src/validate_ui_syntax.ts:1137-1159`（`validateSingleDecorator`）
- 静态：`arkui-plugins/collectors/ui-collectors/validators/rules/check-computed-decorator.ts:55`

## 适用对象
- struct/class 的成员方法（getter/setter）
- struct/class 的成员属性
- 组件初始化调用（`$$` 双向绑定语法）

## 报错信息
- 动态：
  - `'@Computed' can only decorate 'GetAccessor'.`（错误码 10905116）
- 静态：
  - `'@Computed' can only decorate 'GetAccessor'.`
  - `A property decorated by '@Computed' cannot define a set method.`
  - `The '@Computed' annotation can only be used in a 'struct' decorated with '@ComponentV2'.`
  - `The '@Computed' can decorate only member method within a 'class' decorated with ObservedV2.`
  - `A property decorated by '@Computed' cannot be used with two-way bind syntax.`

## 错误码
- 10905116：@Computed 用于非 getter

## 核心校验规则
1. `@Computed` 只能装饰 GetAccessor（getter 方法），不可用于普通方法、属性或 setter
2. `@Computed` 修饰的属性不可定义 setter 方法
3. struct 中使用 `@Computed` 时，struct 必须被 `@ComponentV2` 装饰（若已用 `@Component`，建议改为 `@ComponentV2`；若无组件装饰器，建议添加 `@ComponentV2`）
4. class 中使用 `@Computed` 时，class 必须被 `@ObservedV2` 装饰（若已用 `@Observed`，建议改为 `@ObservedV2`；若无，建议添加 `@ObservedV2`）
5. `@Computed` 修饰的属性不可与 `$$` 双向绑定语法一起使用

## 示例代码
### 反例
```typescript
@Component
struct MyComp {
  @Computed myMethod(): number { return 1 }   // 非 getter

  @Computed
  get value(): number { return 1 }
  set value(v: number) { }                     // @Computed 不可有 setter
}

@ComponentV2
struct V2Comp {
  @Local count: number = 0
  @Computed
  get doubled(): number { return this.count * 2 }
  build() {
    TextInput($$this.doubled)                  // @Computed 不可与 $$ 双向绑定
  }
}
```

### 正例
```typescript
@ComponentV2
struct MyComp {
  @Local count: number = 0
  @Computed
  get doubled(): number { return this.count * 2 }
  build() {
    Text(this.doubled.toString())
  }
}

@ObservedV2
class MyData {
  @Trace count: number = 0
  @Computed
  get doubled(): number { return this.count * 2 }
}
```

## 静态
### 源码参考位置
- `arkui-plugins/collectors/ui-collectors/validators/rules/check-computed-decorator.ts:40`
### 静态工具链处理
静态工具链通过 `check-computed-decorator.ts` 校验 @Computed 装饰器：仅用于 GetAccessor、不可有 setter、struct 中需 @ComponentV2、class 中需 @ObservedV2、不可与 $$ 双向绑定一起使用。支持 `FixSuggestion`（建议移除 setter、添加 @ComponentV2/@ObservedV2）。
- `arkui-plugins/common/predefines.ts:233`（`DecoratorNames.COMPUTED = 'Computed'`）
- `compiler/src/validate_ui_syntax.ts:1189`（`validateClassDecorator`）

## 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| 校验入口 | `validate_ui_syntax.ts:1137`（`validateSingleDecorator`） | `check-computed-decorator.ts:40` |
| 报错条数 | 3 条（仅 getter、不可有 setter、目标校验） | 5 条（额外含 @ComponentV2/@ObservedV2 上下文、$$ 双向绑定） |
| 自动修复 | 无 | 有（建议移除 setter、添加 @ComponentV2/@ObservedV2） |