# 功能概述
`@Builder` 装饰器标记自定义构建函数，用于封装可复用的声明式 UI 片段，支持全局函数和组件方法两种形式。

## 动态
### 源码参考位置
- `compiler/src/process_component_class.ts:890`（`processComponentMethod`）
- `compiler/src/process_component_class.ts:924`（`isBuilderOrLocalBuilder` 判断）
- `compiler/src/pre_define.ts:121`（`COMPONENT_BUILDER_DECORATOR = '@Builder'`）

### 转换前的原始代码
```typescript
// 全局 Builder
@Builder function myBuilder($$: string) { Text($$) }

// 组件内 Builder
@Component
struct MyComponent {
  @Builder myBuilder($$: string) { Text($$) }
}
```

### 转换后的代码（Legacy）
```typescript
// 全局 Builder：参数追加 parent: any = null
function myBuilder($$: string, parent: any = null) { Text($$) }
// 若 optLazyForEach，再追加 myIds = []

// 组件内 Builder：移除装饰器保留为方法
// 非 localBuilder 追加 parent 参数
myBuilder($$: string, parent: any = null) { Text($$) }
```

### 转换后的代码（Partial Update）
```typescript
// Partial Update 模式下 @LocalBuilder 转为箭头函数属性确保 this 词法绑定
// globalBuilderParamAssignment 从 PUV2ViewBase.contextStack 栈顶取 parent
myBuilder = ($$: string, parent: any = null) => { Text($$) }
```

## 静态
### 源码参考位置
- `arkui-plugins/ui-plugins/builder-lambda-translators/builder-factory.ts:44`（`rewriteBuilderMethod`）
- `arkui-plugins/common/predefines.ts:218`（`DecoratorNames.BUILDER = 'Builder'`）

### 转换前的原始代码
```typescript
@Component
struct MyComponent {
  @Builder myBuilder($$: string) { Text($$) }
}
```

### 转换后的代码
```typescript
// 参数加 @memo(skipUI) 注解
// 方法体重写为 script function
myBuilder($$: string) { Text($$) }
```

> 声明文件参考：`@Builder` 装饰器，Target 包含 FUNCTION / CLASS_METHOD / CLASS_FIELD / TYPE / PARAMETER / TYPE_ALIAS / LAMBDA。

## 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| 全局 Builder | 参数追加 `parent: any = null`，optLazyForEach 追加 `myIds = []` | 参数加 `@memo(skipUI)` 注解 |
| 组件内 Builder | 移除装饰器保留方法，非 localBuilder 追加 parent | `rewriteBuilderMethod` 重写 script function |
| LocalBuilder (Partial Update) | Partial Update 模式转为箭头函数属性确保 this 绑定 | `rewirteBuilderClassProperty` 处理 |
| parent 获取 | 全局从 `contextStack` 栈顶取 | 通过 `@memo` 注解机制 |

## 深度转换逻辑

### 源码参考位置
- `compiler/src/pre_define.ts:121`（`COMPONENT_BUILDER_DECORATOR = '@Builder'`）
- `compiler/src/pre_define.ts:122`（`COMPONENT_LOCAL_BUILDER_DECORATOR = '@LocalBuilder'`）
- `compiler/src/pre_define.ts:686`（`BUILDER_PARAM_PROXY = 'makeBuilderParameterProxy'`）
- `compiler/src/pre_define.ts:707`（`WRAPBUILDER_FUNCTION = 'wrapBuilder'`）
- `compiler/src/process_component_class.ts:997-1017`（`isBuilderOrLocalBuilder`，@Builder/@LocalBuilder 识别）
- `compiler/src/process_component_class.ts:1019-1028`（`localBuilderNode`，@LocalBuilder 转箭头函数属性）
- `compiler/src/process_component_build.ts:633-667`（`transferBuilderCall`，@Builder 调用变换）
- `compiler/src/process_component_build.ts:277-287`（`parseGlobalBuilderParams`，firstParam 机制）
- `compiler/src/process_component_build.ts:319-321`（`forkBuilderParamNode`，全局 @Builder 参数 fork）
- `compiler/src/process_ui_syntax.ts:516-555`（`globalBuilderParamAssignment`，PUV2 parent 取栈顶）
- `compiler/src/process_ui_syntax.ts:601-613`（`initializeMYIDS`，Partial Update 模式 @Builder 的 MYIDS 参数）
- `compiler/src/process_ui_syntax.ts:557-599`（NavigationBuilderRegister 注册，使用 wrapBuilder）

### 全局 @Builder 函数 vs 组件内 @Builder 方法

#### 全局 @Builder 函数

```typescript
@Builder
function MyBuilder(text: string) {
  Text(text)
}
```

- 收集于 `validate_ui_syntax.ts`，存储到 `GLOBAL_CUSTOM_BUILDER_METHOD`
- 调用时通过 `wrapBuilder` 包装，确保全局函数可被 NavigationBuilderRegister 注册
- Partial Update 模式下通过 `parseGlobalBuilderParams` 提取 firstParam

#### 组件内 @Builder 方法

```typescript
@Component
struct MyComponent {
  @Builder
  myBuilder(text: string) {
    Text(text)
  }
}
```

- 收集于 `process_component_class.ts`，转换为静态方法
- 调用时通过 `this.myBuilder(...)` 或 `makeBuilderParameterProxy` 处理参数代理

### 转换前代码
```typescript
@Builder
function GlobalBuilder(text: string) {
  Text(text)
}

@Component
struct MyComponent {
  @Builder
  myBuilder(text: string) {
    Text(text)
  }

  @LocalBuilder
  localBuilder() {
    Text('local')
  }

  build() {
    Column() {
      this.myBuilder('hello')
      this.localBuilder()
    }
  }
}
```

### 转换后代码（Partial Update 模式）
```typescript
// 全局 @Builder 包装为 wrapBuilder
const GlobalBuilder = wrapBuilder(function GlobalBuilder(text, myIds) {
  Text.create(text)
  Text.pop()
})

// 组件内 @Builder 转为静态方法
class MyComponent {
  static myBuilder(text, myIds) {
    Text.create(text)
    Text.pop()
  }

  // @LocalBuilder 转为箭头函数属性（确保 this 词法绑定）
  localBuilder = () => {
    Text.create('local')
    Text.pop()
  }

  build() {
    Column.create()
    // @Builder 调用：对象字面量参数 -> makeBuilderParameterProxy
    this.myBuilder(makeBuilderParameterProxy('myBuilder', { text: 'hello' }))
    // @LocalBuilder 调用：直接 this.localBuilder()
    this.localBuilder(null, myIds)
    Column.pop()
  }
}
```

### 关键转换逻辑

#### 1. @Builder/@LocalBuilder 识别（process_component_class.ts:997-1017）

`isBuilderOrLocalBuilder` 遍历装饰器，识别 `@Builder` 和 `@LocalBuilder`：

```typescript
const originalDecortor = decorators[i].getText().replace(/\(.*\)$/, '').replace(/\s*/g, '').trim();
if ([COMPONENT_LOCAL_BUILDER_DECORATOR, COMPONENT_BUILDER_DECORATOR].includes(originalDecortor)) {
  if (originalDecortor === COMPONENT_BUILDER_DECORATOR) {
    builderCondition.isBuilder = true;
  } else {
    builderCondition.isLocalBuilder = true;
  }
  return true;
}
```

- 装饰器文本去除参数和空格后匹配
- `@Builder` 设置 `isBuilder = true`
- `@LocalBuilder` 设置 `isLocalBuilder = true`

#### 2. @LocalBuilder 转箭头函数属性（process_component_class.ts:1019-1028）

```typescript
function localBuilderNode(node: ts.MethodDeclaration, componentBlock: ts.Block): ts.PropertyDeclaration {
  return ts.factory.createPropertyDeclaration(
    undefined, node.name, undefined, undefined,
    ts.factory.createArrowFunction(
      undefined, undefined, node.parameters ? node.parameters : [], undefined,
      ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
      componentBlock
    )
  );
}
```

- 将 `@LocalBuilder` 方法转换为 `PropertyDeclaration`（箭头函数属性）
- **关键设计**：箭头函数捕获外层 `this`，确保 `this` 词法绑定到组件实例
- 静态方法不能被 `@LocalBuilder` 装饰（line 984-993，报错 `10905104`）

#### 3. transferBuilderCall 参数传递（process_component_build.ts:633-667）

`transferBuilderCall` 处理 @Builder 调用的参数：

**对象字面量参数 → makeBuilderParameterProxy（line 639-652）**：
```typescript
if (ts.isObjectLiteralExpression(node.expression.arguments[0])) {
  return ts.factory.createExpressionStatement(ts.factory.updateCallExpression(
    node.expression, newNode, undefined,
    [ts.factory.createCallExpression(
      ts.factory.createIdentifier(BUILDER_PARAM_PROXY), undefined,
      [ts.factory.createStringLiteral(name), traverseBuilderParams(node.expression.arguments[0], isBuilder)]
    )]
  ));
}
```

**非对象参数 → 追加 null 和 myIds（line 657-664）**：
```typescript
return ts.factory.createExpressionStatement(ts.factory.updateCallExpression(
  node.expression, newNode, undefined,
  !(projectConfig.optLazyForEach && (storedFileInfo.processLazyForEach &&
    storedFileInfo.lazyForEachInfo.forEachParameters || isBuilder)) ? node.expression.arguments :
    [...node.expression.arguments, ts.factory.createNull(), ts.factory.createIdentifier(MY_IDS)]
));
```

- 当处于 LazyForEach 优化或 @Builder 场景时，追加 `null`（reuseId 占位）和 `myIds`（元素 ID 数组）
- 非优化模式下保持原参数

#### 4. parseGlobalBuilderParams 的 firstParam 机制（line 277-287）

```typescript
export function parseGlobalBuilderParams(parameters: ts.NodeArray<ts.ParameterDeclaration>,
  builderParamsResult: BuilderParamsResult) : void {
  if (partialUpdateConfig.partialUpdateMode && parameters.length && parameters.length === 1 &&
    ts.isIdentifier(parameters[0].name)) {
    builderParamsResult.firstParam = parameters[0];
  }
}
```

- 仅在 Partial Update 模式下生效
- 全局 @Builder 必须有且仅有 1 个参数
- 参数名必须是 `Identifier`（非解构）
- 提取的 `firstParam` 用于：
  - `forkBuilderParamNode`（line 319-321）：在全局 @Builder 代码块前插入参数 fork 语句
  - `createCustomComponent`（process_custom_component.ts:796-800）：为优化模式组件追加参数

#### 5. globalBuilderParamAssignment 从 PUV2ViewBase.contextStack 栈顶取 parent（process_ui_syntax.ts:516-555）

```typescript
export function globalBuilderParamAssignment(): ts.VariableStatement {
  const contextStackCondition = ts.factory.createPropertyAccessExpression(
    ts.factory.createIdentifier(PUV2_VIEW_BASE),
    ts.factory.createIdentifier(CONTEXT_STACK)
  );
  return ts.factory.createVariableStatement(undefined,
    ts.factory.createVariableDeclarationList([
      ts.factory.createVariableDeclaration(
        ts.factory.createIdentifier(COMPONENT_CONSTRUCTOR_PARENT), undefined, undefined,
        ts.factory.createConditionalExpression(
          ts.factory.createBinaryExpression(
            contextStackCondition,
            ts.factory.createToken(ts.SyntaxKind.AmpersandAmpersandToken),
            ts.factory.createPropertyAccessExpression(contextStackCondition, ts.factory.createIdentifier(LENGTH))
          ),
          ts.factory.createToken(ts.SyntaxKind.QuestionToken),
          ts.factory.createElementAccessExpression(contextStackCondition,
            ts.factory.createBinaryExpression(
              ts.factory.createPropertyAccessExpression(contextStackCondition, ts.factory.createIdentifier(LENGTH)),
              ts.factory.createToken(ts.SyntaxKind.MinusToken),
              ts.factory.createNumericLiteral('1')
            )
          ),
          ts.factory.createToken(ts.SyntaxKind.ColonToken),
          ts.factory.createNull()
        )
      )
    ], ts.NodeFlags.Const));
}
```

生成代码等价于：
```typescript
const parent = (PUV2ViewBase.contextStack && PUV2ViewBase.contextStack.length)
  ? PUV2ViewBase.contextStack[PUV2ViewBase.contextStack.length - 1]
  : null;
```

- 从 `PUV2ViewBase.contextStack` 栈顶获取 parent 组件
- 用于全局 @Builder 中 `this` 的绑定上下文

#### 6. initializeMYIDS 参数（process_ui_syntax.ts:601-613）

```typescript
export function initializeMYIDS(): ts.ParameterDeclaration {
  return ts.factory.createParameterDeclaration(
    undefined, undefined,
    ts.factory.createIdentifier(MY_IDS), undefined, undefined,
    ts.factory.createArrayLiteralExpression([], false)
  );
}
```

- 生成 `myIds = []` 参数声明
- Partial Update 模式下 @Builder 方法追加此参数，用于元素 ID 追踪

#### 7. NavigationBuilderRegister 注册（process_ui_syntax.ts:557-599）

```typescript
function createNavigationRegister(routerInfo: RouterInfo): ts.Statement {
  return ts.factory.createExpressionStatement(ts.factory.createCallExpression(
    ts.factory.createIdentifier(constantDefine.NAVIGATION_BUILDER_REGISTER), undefined,
    [
      ts.factory.createStringLiteral(routerInfo.name),
      ts.factory.createCallExpression(
        ts.factory.createIdentifier(WRAPBUILDER_FUNCTION), undefined,
        [ts.factory.createIdentifier(routerInfo.buildFunction)]
      )
    ]
  ));
}
```

- 生成 `NavigationBuilderRegister('routeName', wrapBuilder(buildFunction))`
- `wrapBuilder` 将全局 @Builder 函数包装为可注册的 builder 对象
- 整体包裹在 `typeof NavigationBuilderRegister === 'function'` 判断中

### 静态变换逻辑

静态工具链中 @Builder 通过 `common/predefines.ts` 的 `DecoratorNames.BUILDER` 识别，在 checked 阶段由 `builder-lambda-translators/factory.ts` 处理 lambda 包装和参数代理。

### 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| @LocalBuilder 处理 | 转箭头函数属性确保 this 绑定 | 由 builder-lambda-translators 处理 |
| 参数代理 | `makeBuilderParameterProxy` | `createBuilderParameterProxyCall` |
| parent 获取 | `globalBuilderParamAssignment` 从 contextStack | 从 structInfo 获取 |
| MYIDS | `initializeMYIDS()` 参数 | 由 NodeCacheFactory 管理 |
| wrapBuilder | `wrapBuilder(buildFunction)` | `createBuilderWithTrailingLambdaDecl` |

## Builder构造器组件

部分内置组件的 create 参数需要特殊的 builder 变换处理，通过 `CUSTOM_BUILDER_CONSTRUCTORS`、`CREATE_BIND_COMPONENT` 和 `BIND_OBJECT_PROPERTY` 三个集合控制。

### 源码参考位置
- `compiler/src/component_map.ts:159`（`CUSTOM_BUILDER_CONSTRUCTORS`）
- `compiler/src/pre_define.ts:526`（`CREATE_BIND_COMPONENT`）
- `compiler/src/pre_define.ts:369-383`（`BIND_OBJECT_PROPERTY`）
- `compiler/src/process_component_build.ts:2274-2286`（`checkArguments` 中 builder 参数变换）
- `compiler/src/process_component_build.ts:3982-3986`（`checkCreateArgumentBuilder` 判断）
- `compiler/src/process_component_build.ts:2526-2528`（`isBuilderArgument` 中 `BIND_OBJECT_PROPERTY` 检测）

### CUSTOM_BUILDER_CONSTRUCTORS

| 组件 | 特殊处理 |
|---|---|
| `MenuItem` | create 参数中条件表达式走 `processConditionalBuilder`，builder 节点走 `parseBuilderNode` |
| `MenuItemGroup` | 同上 |
| `Refresh` | 同上 |
| `WaterFlow` | 同上 |
| `Radio` | 同上 |
| `Checkbox` | 同上 |

### 转换前的原始代码
```typescript
MenuItem({ builder: this.menuBuilder })
Refresh({ refreshing: $$this.isRefreshing, builder: this.refreshBuilder })
```

### 转换后的代码
```typescript
MenuItem(createBuilderParameterProxy({ builder: this.menuBuilder }))
Refresh(createBuilderParameterProxy({ refreshing: {...}, builder: this.refreshBuilder }))
```

### CREATE_BIND_COMPONENT

| 组件 | 特殊处理 |
|---|---|
| `ListItemGroup` | create 调用参数走 `transformBuilder` 全量 builder 变换 |
| `Refresh` | 同上（同时也在 `CUSTOM_BUILDER_CONSTRUCTORS` 中） |

`checkCreateArgumentBuilder`（line 3982-3986）：当组件在 `CREATE_BIND_COMPONENT` 中且 `type === COMPONENT_CREATE_FUNCTION` 时，调用 `transformBuilder` 对所有参数执行 `parseCreateParameterBuilder` 变换。

### BIND_OBJECT_PROPERTY

`BIND_OBJECT_PROPERTY` 定义哪些组件的哪些属性的参数需要 builder 检测（`isBuilderArgument` 判断）：

| 组件 | builder 属性 |
|---|---|
| `Navigation` | `title` |
| `NavDestination` | `title` |
| `ListItem` / `ArcListItem` | `swipeAction` |
| `MenuItem` / `MenuItemGroup` | `create`（COMPONENT_CREATE_FUNCTION） |
| `Refresh` / `WaterFlow` | `create` |
| `Radio` / `Checkbox` | `create` |
| `Web` | `bindSelectionMenu` |
| 所有组件（ALL_COMPONENTS） | `bindMenu`、`bindContextMenu`、`bindContextMenuByResponseType`、`bindContextMenuByIsShow`、`bindContextMenuWithResponse`、`bindSheet`、`dragPreview` |

### 关键转换逻辑
1. `checkArguments`（line 2274-2286）：`CUSTOM_BUILDER_CONSTRUCTORS` 中的组件，create 参数逐个检测：条件表达式→`processConditionalBuilder`，builder 节点→`parseBuilderNode`，否则原样 push
2. `checkCreateArgumentBuilder`（line 3982-3986）：`CREATE_BIND_COMPONENT` 中的组件，create 参数走 `transformBuilder` 全量变换
3. `isBuilderArgument`（line 2526-2528）：参数为对象字面量时，检查 `BIND_OBJECT_PROPERTY` 中该组件是否有该属性，是则触发 builder 参数处理
