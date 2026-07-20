# 规则
校验 struct 成员属性的类型限制：`@ObjectLink` 只能用于 `@Observed` 装饰的类、`@PropRef`/`@StoragePropRef` 必须是基本类型、V1 装饰器不可装饰 Function 类型变量、特定装饰器属性不可为特定控制器类型。

## 源码参考位置
- 动态：`compiler/src/validate_ui_syntax.ts` 中的属性类型校验逻辑
- 静态：
  - `arkui-plugins/collectors/ui-collectors/validators/rules/check-property-type.ts:47`（property-type 规则）
  - `arkui-plugins/collectors/ui-collectors/validators/rules/check-decorated-property-type.ts:74`（decorated-property-type 规则）
  - `arkui-plugins/collectors/ui-collectors/validators/rules/check-struct-v1-decorator-function.ts:46`（v1-decorator-function 规则）

## 适用对象
- struct 成员属性

## 报错信息
- 动态：
  - `'@ObjectLink' can only be used to decorate class variables that have been decorated by '@Observed'.`（错误码 10905352）
  - `The '@${decoratorName}' can only be decorated with string, number, boolean, enum or object type.`
- 静态：
  - `'@ObjectLink' cannot be used with this type. Apply it only to classes decorated by '@Observed'.`
  - `The '@${annotation}' decorated attribute '${propertyName}' must be of the string, number, boolean, enum or object type.`
  - `'@BuilderParam' property can only be initialized by '@Builder' function or '@Builder' method in struct.`
  - `The '@${forbiddenUseAnnotation}' property '${propertyName}' cannot be a '${forbiddenUseType}' object.`
  - `The V1 decorator '@${decoratorName}' cannot be applied to a Function-type variable '${propertyName}'`

## 错误码
- 10905352：@ObjectLink 不用于 @Observed 类

## 核心校验规则
1. `@ObjectLink` 属性类型只能是被 `@Observed` 装饰的类（不可是简单类型、`@ObservedV2` 类、`any`/`unknown`）
2. `@PropRef`/`@StoragePropRef` 装饰的属性必须是 string、number、boolean、enum 或 object 类型（不可是 `any` 或 `BigInt`）
3. `@BuilderParam` 属性只能由 `@Builder` 函数或 `@Builder` 方法本地初始化
4. V1 装饰器（@State/@PropRef/@Provide/@Link/@Consume/@StorageLink/@LocalStorageLink/@StoragePropRef/@LocalStoragePropRef）不可装饰 Function 类型变量（包括箭头函数类型、`Function` 类型引用、类型别名间接引用）
5. 特定装饰器属性不可为特定控制器类型：`@State`/`@PropRef`/`@Link`/`@Provide`/`@Consume`/`@ObjectLink`/`@BuilderParam`/`@StoragePropRef`/`@StorageLink`/`@LocalStorageLink` 装饰的属性不可为 `Scroller`/`WebController`/`CustomDialogController`/`TabsController`/`TextInputController`/`VideoController`/`SwiperController`/`SwiperScroller`/`CalendarController`/`AbilityController`/`XComponentController`/`CanvasRenderingContext2D`/`CanvasGradient`/`ImageBitmap`/`ImageData`/`Path2D`/`RenderingContextSettings`/`OffscreenCanvasRenderingContext2D`/`PatternLockController`/`TextAreaController`/`TextTimerController`/`SearchController`/`RichEditorController` 等类型

## 示例代码
### 反例
```typescript
@ObservedV2
class MyV2Data { @Trace count: number = 0 }

@Component
struct MyComp {
  @ObjectLink data: MyV2Data              // @ObjectLink 不可用于 @ObservedV2 类
  @PropRef prop: any                      // @PropRef 不可为 any 类型
  @State handler: () => void = () => {}   // V1 装饰器不可装饰 Function 类型
  @State scroller: Scroller = new Scroller()  // @State 不可为 Scroller 类型
}
```

### 正例
```typescript
@Observed
class MyData { count: number = 0 }

@Component
struct MyComp {
  @ObjectLink data: MyData                // @ObjectLink 用于 @Observed 类
  @PropRef prop: number = 0              // @PropRef 为 number 类型
  handler: () => void = () => {}          // 普通属性装饰 Function 类型
  scroller: Scroller = new Scroller()     // 普通属性为 Scroller 类型
  build() { Text('hello') }
}
```

## 校验实现细节

### forbiddenUseStateType 完整控制器类型列表
`component_map.ts` 中的 `forbiddenUseStateType` 集合定义了不可被特定状态装饰器修饰的控制器/渲染上下文类型：
1. Scroller
2. SwiperScroller
3. VideoController
4. WebController
5. CustomDialogController
6. SwiperController
7. TabsController
8. CalendarController
9. AbilityController
10. XComponentController
11. CanvasRenderingContext2D
12. CanvasGradient
13. ImageBitmap
14. ImageData
15. Path2D
16. RenderingContextSettings
17. OffscreenCanvasRenderingContext2D
18. PatternLockController
19. TextAreaController
20. TextInputController
21. TextTimerController
22. SearchController
23. RichEditorController
24. ArcSwiperController

### 受限装饰器
@State、@PropRef、@Link、@Provide、@Consume、@ObjectLink、@BuilderParam、@StoragePropRef、@StorageLink、@LocalStorageLink 装饰的属性不可为上述类型。

### 源码位置
`compiler/src/component_map.ts:95`

## 静态
### 源码参考位置
- `arkui-plugins/collectors/ui-collectors/validators/rules/check-property-type.ts:23`
- `arkui-plugins/collectors/ui-collectors/validators/rules/check-decorated-property-type.ts:24`
- `arkui-plugins/collectors/ui-collectors/validators/rules/check-struct-v1-decorator-function.ts:46`
### 静态工具链处理
静态工具链通过 3 个独立规则文件校验属性类型：@ObjectLink 必须为 @Observed 类（check-property-type）、特定装饰器属性不可为特定控制器类型（check-decorated-property-type）、V1 装饰器不可装饰 Function 类型（check-struct-v1-decorator-function）。

## 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| @ObjectLink 类型 | `validate_ui_syntax.ts` 中校验 | `check-property-type.ts:23`（独立规则） |
| V1+Function | `validate_ui_syntax.ts:2552`（`validateNonFunctionTypeWithDecorator`） | `check-struct-v1-decorator-function.ts:46`（独立规则） |
| 控制器类型 | `component_map.ts:95`（`forbiddenUseStateType` 23 种） | `check-decorated-property-type.ts:24`（独立规则） |