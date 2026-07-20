# 功能概述
`@Styles` 装饰器标记可复用的样式函数，封装一组属性设置语句，支持全局函数和组件方法两种形式。

## 动态
### 源码参考位置
- `compiler/src/component_map.ts:122-123`（`INNER_STYLE_FUNCTION`/`GLOBAL_STYLE_FUNCTION`）
- `compiler/src/validate_ui_syntax.ts:1007-1017`（`collectStyles`，全局收集）
- `compiler/src/process_component_class.ts:958-976`（组件内 `@Styles` 收集）
- `compiler/src/process_component_build.ts:3345-3396`（`traverseStateStylesAttr`，stateStyles 中引用展开）
- `compiler/src/pre_define.ts:124`（`COMPONENT_STYLES_DECORATOR = '@Styles'`）

### 转换前的原始代码
```typescript
// 全局 Styles
@Styles function myStyle() { .width(100).height(200) }

// 组件内 Styles
@Component
struct MyComponent {
  @Styles myStyle() { .width(100) }
}
```

### 转换后的代码（Legacy）
```typescript
// 全局：body 缓存到 GLOBAL_STYLE_FUNCTION，节点删除
// 组件内：body 缓存到 INNER_STYLE_FUNCTION，从 class body 中删除
```

### 转换后的代码（Partial Update）
```typescript
// 与 Legacy 相同
// 全局：body 缓存到 GLOBAL_STYLE_FUNCTION
// 组件内：body 缓存到 INNER_STYLE_FUNCTION
```

> 深度逻辑：`@Styles` 在 `stateStyles` 中引用展开（`traverseStateStylesAttr` line 3345-3396），只展开 body 第 1 条语句。

## 静态
### 源码参考位置
- `arkui-plugins/common/predefines.ts:218`（`DecoratorNames.BUILDER`，附近 enum）
- 静态工具链通过样式收集与展开机制处理

### 转换前的原始代码
```typescript
// 全局 Styles
@Styles function myStyle() { .width(100).height(200) }

// 组件内 Styles
@Component
struct MyComponent {
  @Styles myStyle() { .width(100) }
}
```

### 转换后的代码
```typescript
// 静态工具链收集样式 body，在引用处展开
```

## 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| 全局缓存 | `GLOBAL_STYLE_FUNCTION` Map | 样式收集机制 |
| 组件内缓存 | `INNER_STYLE_FUNCTION` Map | 样式收集机制 |
| 节点处理 | 全局节点删除，组件内从 class body 删除 | 在引用处展开 |
| stateStyles 展开 | `traverseStateStylesAttr` 只展开第 1 条语句 | 由静态变换处理 |
| 参数限制 | 不可有参数（错误码 10905105） | 通过 lint 规则约束 |

## 深度转换逻辑

### 源码参考位置
- `compiler/src/validate_ui_syntax.ts:1007-1016`（`collectStyles`，全局 @Styles 收集到 `GLOBAL_STYLE_FUNCTION`）
- `compiler/src/process_component_class.ts:958-976`（组件内 @Styles 收集到 `INNER_STYLE_FUNCTION`）
- `compiler/src/pre_define.ts:124`（`COMPONENT_STYLES_DECORATOR = '@Styles'`）
- `compiler/src/process_component_build.ts:3071-3082`（@Styles 直接作为属性调用的展开）
- `compiler/src/process_component_build.ts:3345-3396`（`traverseStateStylesAttr`，stateStyles 中的 @Styles 引用展开）

### 收集阶段

#### 全局 @Styles（`collectStyles`，validate_ui_syntax.ts:1007-1016）

```typescript
function collectStyles(node: ts.FunctionLikeDeclarationBase): void {
  if (ts.isBlock(node.body) && node.body.statements) {
    if (ts.isFunctionDeclaration(node)) {
      GLOBAL_STYLE_FUNCTION.set(node.name.getText(), node.body);  // 全局函数
    } else {
      INNER_STYLE_FUNCTION.set(node.name.getText(), node.body);    // 方法
    }
    STYLES_ATTRIBUTE.add(node.name.getText());
    BUILDIN_STYLE_NAMES.add(node.name.getText());
  }
}
```

- `GLOBAL_STYLE_FUNCTION`：`Map<string, ts.Block>`，存储全局 `@Styles` 函数的函数体
- 收集时机：在 `validate_ui_syntax.ts` 的验证阶段遍历函数声明时
- 收集条件：必须是 `FunctionDeclaration`（全局函数），且有函数体

#### 组件内 @Styles（process_component_class.ts:958-976）

```typescript
} else if (hasDecorator(node, COMPONENT_STYLES_DECORATOR)) {
  parseStylesNode(node, log);
  if (node.parameters && node.parameters.length === 0) {
    if (ts.isBlock(node.body) && node.body.statements && node.body.statements.length) {
      INNER_STYLE_FUNCTION.set(name, node.body);
      STYLES_ATTRIBUTE.add(name);
      BUILDIN_STYLE_NAMES.add(name);
      decoratorParamSet.add(STYLES);
    }
  } else {
    log.push({ type: LogType.ERROR, message: `'@Styles' decorated functions and methods cannot have arguments.`, ... });
  }
  return undefined;
}
```

- `INNER_STYLE_FUNCTION`：`Map<string, ts.Block>`，存储组件内 `@Styles` 方法的函数体
- 收集时机：在 `process_component_class.ts` 处理组件成员时
- 限制：`@Styles` 方法不能有参数（line 967-973），否则报错 `10905105`
- 原始方法节点返回 `undefined`，即从类体中移除（因为已被收集，后续以展开形式使用）

### 转换前代码

```typescript
// 全局 @Styles
@Styles
function globalFillStyle() {
  .backgroundColor(Color.Red)
  .width(100)
}

@Component
struct MyComponent {
  // 组件内 @Styles
  @Styles
  innerStyle() {
    .backgroundColor(Color.Blue)
    .height(50)
  }

  build() {
    Column() {
      Text('hello')
        .apply(globalFillStyle)   // @Styles 直接作为属性调用
    }
    .stateStyles({
      normal: this.innerStyle(),  // @Styles 在 stateStyles 中引用
      pressed: this.innerStyle()
    })
  }
}
```

### 转换后代码
```typescript
// 全局 @Styles 收集到 GLOBAL_STYLE_FUNCTION['globalFillStyle']
// 组件内 @Styles 收集到 INNER_STYLE_FUNCTION['innerStyle']

// build() 内展开后：
Column.create()
Text.create('hello')
Text.backgroundColor(Color.Red)   // 来自 globalFillStyle 的第 1 条语句
Text.width(100)                   // 注意：只展开第 1 条语句
Text.pop()
Column.stateStyles({              // stateStyles 中的 @Styles 引用展开
  normal: {                       // this.innerStyle() 展开为第 1 条语句
    .backgroundColor(Color.Blue)
  },
  pressed: { ... }
})
Column.pop()
```

### 关键转换逻辑

#### 1. @Styles 直接作为属性调用的展开（line 3071-3082）

在 `addComponentAttr` 中，当属性名 `propName` 存在于 `GLOBAL_STYLE_FUNCTION` 或 `INNER_STYLE_FUNCTION` 时：

```typescript
} else if (GLOBAL_STYLE_FUNCTION.has(propName) || INNER_STYLE_FUNCTION.has(propName)) {
  const styleBlock: ts.Block =
      INNER_STYLE_FUNCTION.get(propName) || GLOBAL_STYLE_FUNCTION.get(propName);
  if (styleBlock.statements.length > 0) {
    bindComponentAttr(styleBlock.statements[0] as ts.ExpressionStatement, identifierNode,
      statements, log, false, true, newImmutableStatements);
    if (isRecycleComponent) {
      bindComponentAttr(styleBlock.statements[0] as ts.ExpressionStatement, identifierNode,
        updateStatements, log, false, true, newImmutableStatements, true);
    }
  }
  lastStatement.kind = true;
}
```

- **关键限制**：只展开 `styleBlock.statements[0]`（第 1 条语句），后续语句被忽略
- `INNER_STYLE_FUNCTION` 优先于 `GLOBAL_STYLE_FUNCTION`（先取内部，再取全局）
- 如果是 RecycleComponent，同时展开到 `updateStatements`（line 3077-3080）

#### 2. @Styles 在 stateStyles 中的引用展开（line 3345-3396）

`traverseStateStylesAttr` 遍历 `stateStyles` 参数对象的属性，逆序处理（`reverse()`，line 3348）：

1. **组件内 @Styles 引用**（line 3353-3362）：
   - 识别 `this.xxx()` 形式的 `PropertyAccessExpression`
   - 从 `INNER_STYLE_FUNCTION` 取出对应 `Block`
   - 调用 `bindComponentAttr` 展开 `statements[0]`

2. **全局 @Styles 引用**（line 3363-3371）：
   - 识别标识符形式 `xxx`
   - 从 `GLOBAL_STYLE_FUNCTION` 取出对应 `Block`
   - 同样展开 `statements[0]`

3. **对象字面量直接写样式**（line 3372-3382）：
   - 识别只有一个属性的 `ObjectLiteralExpression`
   - 直接展开该属性的 `initializer`

4. **ViewStackProcessor 状态切换**（line 3388-3394）：
   - 每个属性处理后追加 `ViewStackProcessor.visualState(state)`
   - RecycleComponent 时同时推入 `updateStatements`

5. **Hovered 兼容**（line 3349-3351）：
   - 如果属性名为 `hovered` 且 `!isCompatibleVersionOverTarget(26)`，跳过处理

### 限制

1. **只展开第 1 条语句**：无论 @Styles 函数体有多少条语句，只取 `statements[0]` 展开。这是设计限制，确保样式展开为单一属性调用。
2. **参数限制**：`@Styles` 方法和函数不能有参数（line 960-973），否则报错 `10905105`。
3. **收集后移除**：组件内 `@Styles` 方法在收集后从类体中移除（返回 `undefined`），不生成实例方法。
4. **RecycleComponent 双重展开**：在复用组件场景下，@Styles 需要同时展开到 `statements` 和 `updateStatements`，确保复用时样式重新应用。

### 静态变换逻辑

静态工具链中 @Styles 通过 `common/predefines.ts` 的 `DecoratorNames` 识别，在 checked 阶段由 property-translators 处理展开逻辑。

### 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| 收集位置 | `GLOBAL_STYLE_FUNCTION`/`INNER_STYLE_FUNCTION` Map | Collector 元数据收集 |
| 展开方式 | `bindComponentAttr` 递归展开 `statements[0]` | property-translators 在 checked 阶段展开 |
| 限制 | 只展开第 1 条语句 | 类似限制，由 AST 遍历保证 |
| stateStyles 处理 | `traverseStateStylesAttr` 逆序遍历 | 由 builder-lambda 链处理 |
