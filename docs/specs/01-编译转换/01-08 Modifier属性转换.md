# 功能概述
涵盖 `attributeModifier`/`contentModifier`/`menuItemContentModifier` 属性的转换规则。因 modifier 需要 `this` 上下文，动态工具链在通用 `else` 分支中标记 `isAttributeModifier = true`，`createFunction` 生成 `Component.attr.bind(this)(args)` 调用。

| 转换规则 | 说明 |
|---|---|
| attributeModifier/contentModifier/menuItemContentModifier | 生成 `Component.attr.bind(this)(args)`，因 modifier 需要 this 上下文 |
| isAttributeModifier 标记 | 在通用 else 分支中检测属性名，传递给 `createFunction` 的第 4 参数 |
| bind(this) 生成 | `createFunction` 中根据 `isAttributeModifier` 选择 `CallExpression` 嵌套结构 |

## 动态
### 源码参考位置
- `compiler/src/process_component_build.ts:3092-3111`（通用 else 分支，modifier 检测）
- `compiler/src/process_component_build.ts:3096-3099`（attributeModifier 特殊处理）
- `compiler/src/process_component_build.ts:3872-3917`（`createFunction` 函数完整实现）
- `compiler/src/process_component_build.ts:3898-3908`（`bind(this)` 生成逻辑）
- `compiler/src/pre_define.ts:214`（`ATTRIBUTE_ATTRIBUTE_MODIFIER = 'attributeModifier'`）
- `compiler/src/pre_define.ts:215`（`ATTRIBUTE_CONTENT_MODIFIER = 'contentModifier'`）
- `compiler/src/pre_define.ts:216`（`ATTRIBUTE_MENUITEM_CONTENT_MODIFIER = 'menuItemContentModifier'`）
- `compiler/src/pre_define.ts:347`（`BUILDER_ATTR_BIND = 'bind'`）
- `compiler/src/pre_define.ts:641`（`GLOBAL_THIS = 'globalThis'`）

### 转换前的原始代码
```typescript
Button('ok')
  .attributeModifier(this.modifier)
  .contentModifier(this.myModifier)

MenuItem()
  .menuItemContentModifier(this.itemModifier)
```

### 转换后的代码（Legacy）
```typescript
Button.create('ok')
Button.attributeModifier.bind(this)(this.modifier)
Button.contentModifier.bind(this)(this.myModifier)
Button.pop()

MenuItem.create()
MenuItem.menuItemContentModifier.bind(this)(this.itemModifier)
MenuItem.pop()
```

### 转换后的代码（Partial Update）
```typescript
Button.create('ok')
Button.attributeModifier.bind(this)(this.modifier)
Button.contentModifier.bind(this)(this.myModifier)
Button.pop()
```

### 关键转换逻辑
- 属性名检测（line 3095-3099）：
  ```typescript
  let isAttributeModifier: boolean = false;
  if ([ATTRIBUTE_ATTRIBUTE_MODIFIER, ATTRIBUTE_CONTENT_MODIFIER,
    ATTRIBUTE_MENUITEM_CONTENT_MODIFIER].includes(propName)) {
    isAttributeModifier = true;
  }
  ```
  在通用 `else` 分支中，用 `Array.includes(propName)` 检测是否为三种 modifier 属性之一。
- 语句生成（line 3100-3101）：`createFunction(identifierNode, node, temp.arguments, isAttributeModifier)`，将 `isAttributeModifier` 作为第 4 参数传入。
- immutable/update 分配（line 3103-3108）：modifier 属性在非 Recycle/Reuse 组件中进入 `updateStatements`；在 Recycle/Reuse 组件中，若 `filterRegularAttrNode` 为 true 则进入 `immutableStatements`。
- `createFunction` 内部 bind(this) 生成（line 3897-3916）：
  - `isAttributeModifier = true` 时（line 3898-3908）：
    ```
    Component.attr.bind(this)(args)
    ```
    即先构造 `Component.attr` 属性访问，再访问其 `.bind` 属性，然后以 `[this]` 为参数调用 `bind`，最后以 `args` 为参数调用整个表达式。
    ```typescript
    ts.factory.createCallExpression(
      ts.factory.createCallExpression(
        ts.factory.createPropertyAccessExpression(
          ts.factory.createPropertyAccessExpression(node, attrNode),  // Component.attr
          ts.factory.createIdentifier(BUILDER_ATTR_BIND)              // .bind
        ),
        undefined,
        [ts.factory.createThis()]                                     // (this)
      ),
      undefined,
      argumentsArr                                                    // (args)
    )
    ```
  - `isAttributeModifier = false` 时（line 3909-3913）：生成普通 `Component.attr(args)`，不追加 `bind(this)`。
- `BUILDER_ATTR_BIND = 'bind'`（pre_define.ts:347）：常量名，与 Builder 属性的 bind 调用共用同一常量。
- `globalThisArr` 排除（line 3876）：modifier 属性不走 `globalThis.xxx` 路径，因为 `isAttributeModifier` 分支不检查 `globalThisArr`。

## 静态
### 源码参考位置
- `arkui-plugins/ui-plugins/property-translators/regularProperty.ts:111`（`initializeStructWithCustomDialogControllerInit`，CustomDialogController 属性）

### 转换前的原始代码
同动态工具链

### 转换后的代码
modifier 属性作为组件方法调用保留在 builder lambda 体中，不生成 `bind(this)` 包装。

## 接口声明交叉验证

### XxxModifier 空类体设计

SDK 声明中的 Modifier 类遵循统一模式：

```typescript
class XxxModifier implements XxxAttribute, AttributeModifier<XxxAttribute> {
  // 空类体 — 方法实现由运行时 dynamic dispatch 提供
}
```

| 组成部分 | 说明 |
|---|---|
| `class XxxModifier` | 类名：`<ComponentName>Modifier` |
| `implements XxxAttribute` | 实现组件对应的 Attribute 接口 |
| `implements AttributeModifier<XxxAttribute>` | 实现 AttributeModifier 泛型接口 |
| 空类体 | 不包含任何方法实现 |

**关键设计**：Modifier 类的类体为空，方法实现由运行时 **dynamic dispatch（动态分发）** 提供。Modifier 类仅作为类型约束和接口标记，运行时通过 `AttributeModifier` 的 `applyNormalAttribute` 等方法分发属性修改。

代表性 Modifier 类：

| Modifier 类 | 实现接口 | 对应组件 | JSON 属性来源 |
|---|---|---|---|
| `TextModifier` | `TextAttribute` + `AttributeModifier<TextAttribute>` | Text | `text.json` 的 `attrs` |
| `ButtonModifier` | `ButtonAttribute` + `AttributeModifier<ButtonAttribute>` | Button | `button.json` 的 `attrs` |
| `CommonModifier` | `CommonAttribute` + `AttributeModifier<CommonAttribute>` | 通用属性 | `common_attrs.json` |

### AttributeModifier vs ContentModifier 区别

| 维度 | AttributeModifier | ContentModifier |
|---|---|---|
| 声明 | `interface AttributeModifier<T>` | `interface ContentModifier<T>` |
| 修改对象 | 属性（颜色、大小、字体等） | 内容（Button 文本、Image 图片源等） |
| 泛型参数 | `XxxAttribute` 接口类型 | 内容类型（如 `string`、`ResourceStr`） |
| 调用方式 | `component.attributeModifier(new XxxModifier())` | `component.contentModifier(new XxxContentModifier())` |
| 分发方法 | `applyNormalAttribute`/`applyPressedAttribute`/`applyFocusedAttribute` 等（多种状态） | 单一分发 |
| 对应 JSON 字段 | `attributeModifier` | `contentModifier` |
| 动态工具链常量 | `ATTRIBUTE_ATTRIBUTE_MODIFIER`（`pre_define.ts:214`） | `ATTRIBUTE_CONTENT_MODIFIER`（`pre_define.ts:215`） |
| 动态工具链处理 | `isAttributeModifier = true`（统一处理） | `isAttributeModifier = true`（统一处理） |

## 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| attributeModifier | `bind(this)` 调用 | 无特殊处理 |
| bind(this) 生成 | `createFunction` 中 `isAttributeModifier` 分支 | 无此机制 |
| 支持的 modifier | `attributeModifier`/`contentModifier`/`menuItemContentModifier` | 无独立 modifier 处理 |
