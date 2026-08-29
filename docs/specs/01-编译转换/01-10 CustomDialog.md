# 功能概述
`@CustomDialog` 装饰器的 struct 转换为 `BaseCustomDialog` 子类，以及 `CustomDialogController` 构造函数的 builder 属性变换为包含 `setController` 调用的箭头函数。

## 动态
### 源码参考位置
- `compiler/src/process_ui_syntax.ts`（`isCustomDialogController`，识别 Controller 构造）
- `compiler/src/process_ui_syntax.ts`（`createCustomDialogController`，Controller 变换）
- `compiler/src/process_ui_syntax.ts`（`processCustomDialogControllerBuilder`，builder 属性变换）
- `compiler/src/process_component_class.ts`（`validateHasControllerAndControllerCount`，校验必须含 Controller 属性）
- `compiler/src/process_component_member.ts`（`createControllerSet`，生成 setController 方法）
- `compiler/src/pre_define.ts`（`JS_DIALOG = 'jsDialog'`）
- `compiler/src/pre_define.ts`（`SET_CONTROLLER_METHOD = 'setController'`）
- `compiler/src/pre_define.ts`（`CUSTOM_DIALOG_CONTROLLER_BUILDER = 'builder'`）

### 转换前的原始代码
```typescript
@CustomDialog
struct MyDialog {
  controller: CustomDialogController
  build() { Text('dialog') }
}

// 使用处
let dialogController = new CustomDialogController({ builder: MyDialog, autoCancel: true })
```

### 转换后的代码（Legacy 和 Partial Update）
```typescript
class MyDialog extends View {  // Partial Update（Partial Update）: extends ViewPU
  setController(ctr: CustomDialogController) {
    this.controller = ctr
  }
  // ...
}

// 使用处变换
let dialogController = new CustomDialogController({
  builder: () => {
    let jsDialog = new MyDialog(undefined, this, { builder: ... }, undefined, elmtId, paramsLambda, extraInfo)
    jsDialog.setController(dialogController)
    createViewCreate(jsDialog)
  },
  autoCancel: true
}, this)
```

### 关键转换逻辑
- `@CustomDialog` struct 走与 @Component 相同的 `processComponentClass`，但校验必须含 `CustomDialogController` 类型属性（`validateHasControllerAndControllerCount`，错误码 10905211）
- `createCustomDialogController`：遍历 Controller 构造参数，对 `builder` 属性检查其值是否是 @CustomDialog 组件（`componentCollection.customDialogs.has`），第二参数追加 `this`
- `processCustomDialogControllerBuilder`：生成 `new MyDialog(...)` 实例化 + `jsDialog.setController(mountNode)` 调用，包装为箭头函数

## 静态
### 源码参考位置
- `arkui-plugins/ui-plugins/struct-translators/factory.ts`（`transformCustomDialogController`）
- `arkui-plugins/ui-plugins/struct-translators/factory.ts`（`createDialogBuilderArrow`）
- `arkui-plugins/common/predefines.ts`（`CustomDialogNames` 枚举）
- `arkui-plugins/interop-plugins/emit_transformer.ts`（`processProvide`，interop 阶段）

### 转换前的原始代码
同动态工具链

### 转换后的代码
```typescript
// Controller 构造包装为 block expression
let __gensym__ = new CustomDialogController({
  builder: (@memo () => { /* dialog 内容 */ })(),
  baseComponent: this
})
__gensym__ as CustomDialogController
```

### 关键转换逻辑
- `transformCustomDialogController`：提取 builder 属性，通过 `createDialogBuilderArrow`包装为箭头函数并添加 `@memo` 注解
- 注入 `baseComponent: this` 属性
- 生成 `let <gensym> = new CustomDialogController({...}); <gensym> as CustomDialogController` 块表达式

## 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| 基类 | `View`/`ViewPU` | `BaseCustomDialog` |
| Controller 变换 | `jsDialog.setController(mountNode)` 调用 | `baseComponent: this` 属性注入 |
| builder 包装 | 箭头函数内 `new MyDialog(...)` + `setController` | `@memo` 注解箭头函数 + block expression |
| 命名 | `jsDialog` 固定变量名 | `gensym` 生成的变量名 |
