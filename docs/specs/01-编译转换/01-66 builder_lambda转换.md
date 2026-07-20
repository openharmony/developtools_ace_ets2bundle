# 功能概述
builder lambda 链式调用的深度转换逻辑，将 @ComponentBuilder 装饰的组件调用展开为 instance calls 数组并重组。

`transformBuilderLambda` 是静态工具链中处理 `@ComponentBuilder` 调用的核心方法，负责将声明式链式调用展开为命令式 builder lambda 包装。

## 动态
### 源码参考位置
动态工具链不涉及 builder lambda 转换。该转换完全由静态工具链处理。

### 关键转换逻辑
- builder lambda 转换是静态工具链（arkui-plugins）特有的机制
- 动态工具链（compiler）中不存在对应的转换路径
- 动态工具链的组件调用通过 `process_component_build.ts` 的 create/pop 模式处理，不涉及 builder lambda 链式展开

## 静态

### 源码参考位置
- `arkui-plugins/ui-plugins/builder-lambda-translators/factory.ts:1093-1158`（`transformBuilderLambda`，完整逻辑）
- `arkui-plugins/ui-plugins/builder-lambda-translators/factory.ts:994-1021`（`builderLambdaReplace`，callee 替换）
- `arkui-plugins/ui-plugins/builder-lambda-translators/factory.ts:1055-1088`（`updateAnimation`，animation 拆分）
- `arkui-plugins/ui-plugins/builder-lambda-translators/factory.ts:237-278`（`createInitLambdaBody`，lambda body 生成）
- `arkui-plugins/ui-plugins/builder-lambda-translators/factory.ts:178-235`（`createStyleLambdaBody`，链式调用重组）
- `arkui-plugins/ui-plugins/builder-lambda-translators/factory.ts:1274-1299`（`createBuilderParameterProxyCall`，参数代理生成）
- `arkui-plugins/ui-plugins/builder-lambda-translators/factory.ts:873-885`（`generateArgsInBuilderLambda`，参数路由）

### 转换前的原始代码
```typescript
@ComponentBuilder
function MyBuilder(content: () => void, style: string) {
  Column()
    .width(style)
    .animation({ duration: 1000 })
    .onClick(content)
}

// 调用处
MyBuilder({ content: this.buildContent, style: '100%' })
```

### 转换后的代码
```typescript
// callee 替换后的调用
__MyBuilder__(
  makeBuilderParameterProxy<MyBuilder>({ content: this.buildContent, style: '100%' },
    new Map<string, () => Any>([...]),
    (updateMap) => { ... })
)

// lambda body（由 createInitLambdaBody 生成）
// - 非函数调用：直接使用 style 箭头参数
// - 函数调用：createComponentInitLambdaBody 包装

// instanceCalls 重组后（animation 被拆分）：
Column
  .animationStart({ duration: 1000 })   // 插入到 animation 之前
  .width('100%')
  .animationStop({ duration: 1000 })     // 替换原 animation 位置
  .onClick(content)
```

### 关键转换逻辑

#### 1. transformBuilderLambda 完整逻辑（line 1093-1158）

```typescript
static transformBuilderLambda(node: arkts.CallExpression): arkts.Expression {
  let instanceCalls: InstanceCallInfo[] = [];
  let leaf: arkts.CallExpression = node;
  
  // 步骤1：收集 instanceCalls
  while (isStyleChainedCall(leaf) || isStyleWithReceiverCall(leaf)) {
    if (isStyleChainedCall(leaf)) {
      instanceCalls.push({
        isReceiver: false,
        call: arkts.factory.createCallExpression(
          (leaf.callee as arkts.MemberExpression).property,
          leaf.arguments, leaf.typeParams, leaf.isOptional, leaf.hasTrailingComma),
      });
      leaf = (leaf.callee as arkts.MemberExpression).object as arkts.CallExpression;
    }
    if (isStyleWithReceiverCall(leaf)) {
      instanceCalls.push({
        isReceiver: true,
        call: arkts.factory.createCallExpression(leaf.callee, leaf.arguments, ...),
      });
      leaf = leaf.arguments[0] as arkts.CallExpression;
    }
  }
  
  // 步骤2：查找声明
  const decl = findBuilderLambdaDecl(leaf);
  if (!decl) return node;
  const declInfo = findBuilderLambdaDeclInfo(decl);
  
  // 步骤3：callee 替换
  const replace = this.builderLambdaReplace(leaf, declInfo);
  if (!replace || !declInfo) return node;
  
  // 步骤4：lambda body 生成
  const structInfo = !declInfo.isFunctionCall ? getStructCalleeInfoFromCallee(leaf.callee) : {};
  const lambdaBodyInfo = factory.createInitLambdaBody(declInfo, structInfo);
  
  // 步骤5：instanceCalls 重组
  let reuseId: arkts.Expression | undefined;
  const isReuse = !!structInfo?.isFromReuse || !!structInfo?.isFromReuseV2;
  let lambdaBody = lambdaBodyInfo.lambdaBody;
  if (instanceCalls.length > 0 && !!lambdaBodyInfo.lambdaBody) {
    instanceCalls = instanceCalls.reverse();
    this.updateAnimation(instanceCalls);  // animation 拆分
    instanceCalls.forEach((callInfo) => {
      if (isReuse) {
        reuseId = !declInfo.isFunctionCall ? findReuseId(callInfo.call) : undefined;
      }
      const isReuseIdCall = findReuseId(callInfo.call) !== undefined;
      if (isReuseIdCall && !isReuse) return;
      lambdaBody = this.createStyleLambdaBody(lambdaBody!, callInfo);
    });
  }
  lambdaBodyInfo.lambdaBody = lambdaBody;
  lambdaBodyInfo.reuseId = reuseId;
  
  // 步骤6：参数生成和节点更新
  const args = this.generateArgsInBuilderLambda(leaf, lambdaBodyInfo, declInfo);
  const newNode = arkts.factory.updateCallExpression(node, replace, filterDefined(args), ...);
  factory.setBuilderLambdaRange(isTrailingCall, newNode, node);
  InitialBuilderLambdaBodyCache.getInstance().updateAll().reset();
  NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).collect(newNode);
  return newNode;
}
```

#### 2. instanceCalls 数组构建和重组

**收集阶段**（line 1096-1117）：

遍历链式调用，区分两种调用形式：

| 形式 | 条件 | 处理 |
|---|---|---|
| `isStyleChainedCall` | callee 是 MemberExpression | 提取 `property` 作为 call，`isReceiver = false` |
| `isStyleWithReceiverCall` | 有 receiver 参数 | 提取整个 call，`isReceiver = true`，前进到 `arguments[0]` |

收集顺序是从外到内（最外层链式调用先入数组）。

**重组阶段**（line 1135-1148）：

```typescript
if (instanceCalls.length > 0 && !!lambdaBodyInfo.lambdaBody) {
  instanceCalls = instanceCalls.reverse();  // 逆序：从内到外
  this.updateAnimation(instanceCalls);
  instanceCalls.forEach((callInfo) => {
    // reuseId 处理
    if (isReuse) {
      reuseId = !declInfo.isFunctionCall ? findReuseId(callInfo.call) : undefined;
    }
    const isReuseIdCall = findReuseId(callInfo.call) !== undefined;
    if (isReuseIdCall && !isReuse) return;  // 非复用场景跳过 reuseId 调用
    lambdaBody = this.createStyleLambdaBody(lambdaBody!, callInfo);
  });
}
```

- 逆序处理：`instanceCalls.reverse()`，从最内层开始重建
- reuseId 提取：如果是复用组件，从 callInfo 中提取 reuseId
- 跳过 reuseId 调用：非复用场景下跳过 `.reuseId(...)` 调用

#### 3. updateAnimation 把 .animation() 拆分为 animationStart + animationStop（line 1055-1088）

```typescript
static updateAnimation(instanceCalls: InstanceCallInfo[]): void {
  let lastAniIdx = 0;
  let curIdx = 0;
  while (curIdx < instanceCalls.length) {
    if (instanceCalls[curIdx].isReceiver) { curIdx++; continue; }
    const property = instanceCalls[curIdx].call.callee as arkts.Identifier;
    if (property.name === AnimationNames.ANIMATION) {
      const aniStart = arkts.factory.createCallExpression(
        arkts.factory.createIdentifier(AnimationNames.ANIMATION_START),
        instanceCalls[curIdx].call.arguments, undefined, false, false);
      const aniStop = arkts.factory.createCallExpression(
        arkts.factory.createIdentifier(AnimationNames.ANIMATION_STOP),
        instanceCalls[curIdx].call.arguments.map((arg) => arg.clone()), undefined, false, false);
      instanceCalls.splice(lastAniIdx, 0, { isReceiver: false, call: aniStart });
      instanceCalls[curIdx + 1] = { isReceiver: false, call: aniStop };
      curIdx += 2;
      lastAniIdx = curIdx;
    } else {
      curIdx++;
    }
  }
}
```

**拆分逻辑**：
- 遍历 instanceCalls，查找 `.animation(args)` 调用
- 生成 `animationStart(args)` 和 `animationStop(args.clone())`
- `animationStart` 插入到 `lastAniIdx` 位置（动画之前）
- `animationStop` 替换原 `animation` 位置（`curIdx + 1`）
- 参数 `clone()`：确保 aniStop 的参数是独立副本

#### 4. createInitLambdaBody 的 lambda body 生成（line 237-278）

```typescript
static createInitLambdaBody(
  declInfo: BuilderLambdaDeclInfo,
  structInfo: StructCalleeInfo | undefined
): BuilderLambdaStyleBodyInfo {
  const lambdaBodyInfo: BuilderLambdaStyleBodyInfo = {
    lambdaBody: undefined, initCallPtr: undefined, reuseId: undefined,
    defaultReuseId: undefined, structEntryStroage: undefined,
  };
  
  // CustomDialog 不生成 lambda body
  if (!!structInfo?.isFromCustomDialog) return lambdaBodyInfo;
  
  // V1 Reusable：默认 reuseId = structName 字面量
  if (!!structInfo?.isFromReuse && !!structInfo?.structName && !structInfo?.isFromEntry) {
    lambdaBodyInfo.defaultReuseId = arkts.factory.createStringLiteral(structInfo.structName);
  }
  // V2 ReusableV2：默认 reuseId = () => structName 箭头函数
  if (!!structInfo?.isFromReuseV2 && !!structInfo?.structName && !structInfo?.isFromEntry) {
    lambdaBodyInfo.defaultReuseId = arkts.factory.createArrowFunctionExpression(
      UIFactory.createScriptFunction({
        body: arkts.factory.createBlockStatement([
          arkts.factory.createReturnStatement(arkts.factory.createStringLiteral(structInfo.structName))
        ]),
        flags: SCRIPT_FUNCTION_FLAGS_ARROW | SCRIPT_FUNCTION_FLAGS_HAS_RETURN,
      }));
  }
  // Entry storage 提取
  if (!!structInfo?.structEntryStroage && arkts.isStringLiteral(structInfo.structEntryStroage)) {
    lambdaBodyInfo.structEntryStroage = structInfo.structEntryStroage.str;
  }
  
  const lambdaBody = arkts.factory.createIdentifier(BuilderLambdaNames.STYLE_ARROW_PARAM_NAME);
  InitialBuilderLambdaBodyCache.getInstance().collect({ node: lambdaBody });
  
  // 函数调用 vs 非函数调用的 body 差异
  if (isFunctionCall) {
    lambdaBodyInfo.lambdaBody = this.createComponentInitLambdaBody(lambdaBody, name, hasReceiver);
  } else {
    lambdaBodyInfo.lambdaBody = lambdaBody;  // 直接使用 style 箭头参数
  }
  lambdaBodyInfo.initCallPtr = lambdaBodyInfo.lambdaBody.peer;
  return lambdaBodyInfo;
}
```

**V1 vs V2 reuseId 差异**：
- V1 `@Reusable`：`defaultReuseId = "structName"`（字符串字面量）
- V2 `@ReusableV2`：`defaultReuseId = () => "structName"`（箭头函数）

#### 5. builderLambdaReplace 的 callee 替换逻辑（line 994-1021）

```typescript
static builderLambdaReplace(
  leaf: arkts.CallExpression,
  declInfo: BuilderLambdaDeclInfo | undefined
): arkts.Identifier | arkts.MemberExpression | undefined {
  if (!callIsGoodForBuilderLambda(leaf) || !declInfo) return undefined;
  const node = leaf.callee;
  const funcName = builderLambdaFunctionName(leaf);
  if (!funcName) return undefined;
  
  // Identifier 形式（全局函数调用）
  if (arkts.isIdentifier(node) && !!declInfo.moduleName) {
    ImportCollector.getInstance().collectSource(funcName, declInfo.moduleName);
    ImportCollector.getInstance().collectImport(funcName);
    return arkts.factory.createIdentifier(funcName);
  }
  // MemberExpression 形式（方法调用）
  if (arkts.isMemberExpression(node)) {
    return arkts.factory.createMemberExpression(
      declInfo.superName !== undefined ? arkts.factory.createIdentifier(declInfo.superName) : node.object,
      arkts.factory.createIdentifier(funcName),
      arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
      node.isComputed, node.isOptional);
  }
  return undefined;
}
```

- 全局函数调用：替换为 `funcName` Identifier，并收集 import
- 方法调用：替换为 `object.funcName` MemberExpression
- `declInfo.superName`：如果存在 super 类，替换 object 为 superName

#### 6. makeBuilderParameterProxy 调用生成（line 1274-1299）

```typescript
static createBuilderParameterProxyCall(
  node: arkts.ObjectExpression,
  decl: arkts.ClassDefinition | arkts.TSInterfaceDeclaration,
  typeRef: arkts.TypeNode,
  isFromClass: boolean
): arkts.CallExpression {
  const typeMap = getObjectInstanceDeclTypeMap(decl);
  const entries = flatObjectExpressionToEntries(node);
  const objectArg = isFromClass ? arkts.factory.createObjectExpression([]) : node;
  const newMapArg = this.createInitMapArgInBuilderParameterProxyCall(entries, typeMap);
  const updateArg = this.createUpdateArgInBuilderParameterProxyCall(typeRef.clone(), entries, typeMap, isFromClass);
  ImportCollector.getInstance().collectSource(StateManagementTypes.MAKE_BUILDER_PARAM_PROXY, ARKUI_BUILDER_SOURCE_NAME);
  ImportCollector.getInstance().collectImport(StateManagementTypes.MAKE_BUILDER_PARAM_PROXY);
  return arkts.factory.createCallExpression(
    arkts.factory.createIdentifier(StateManagementTypes.MAKE_BUILDER_PARAM_PROXY),
    [objectArg, newMapArg, updateArg],
    arkts.factory.createTSTypeParameterInstantiation([typeRef]),
    false, false);
}
```

生成 `makeBuilderParameterProxy<TypeRef>(objectArg, newMap, updateMap)`：
- `objectArg`：原始对象字面量或空对象（fromClass）
- `newMapArg`：`new Map<string, () => Any>([...])`，初始化映射
- `updateArg`：更新函数映射
- `typeRef`：泛型类型参数

#### 7. generateArgsInBuilderLambda 参数路由（line 873-885）

```typescript
static generateArgsInBuilderLambda(
  leaf: arkts.CallExpression,
  lambdaBodyInfo: BuilderLambdaStyleBodyInfo,
  declInfo: BuilderLambdaDeclInfo
): (arkts.Expression | undefined)[] {
  if (declInfo.isFunctionCall) {
    if (declInfo.isCustomFunctionCall) {
      return this.generateCustomInnerComponentArgsInBuilderLambda(leaf, lambdaBodyInfo, declInfo);
    }
    return this.generateComponentArgsInBuilderLambda(leaf, lambdaBodyInfo, declInfo);
  }
  return this.generateCustomComponentArgsInBuilderLambda(leaf, lambdaBodyInfo, declInfo);
}
```

**三种参数生成路径**：

| 条件 | 方法 | 说明 |
|---|---|---|
| `isFunctionCall && isCustomFunctionCall` | `generateCustomInnerComponentArgsInBuilderLambda` | 自定义内部组件 |
| `isFunctionCall` | `generateComponentArgsInBuilderLambda` | 内置组件 |
| 非 `isFunctionCall` | `generateCustomComponentArgsInBuilderLambda` | 自定义组件 |

### 转换前的原始代码
```typescript
Column()
  .margin(10)
  .myBuilder({ title: 'hello' })
```
### 转换后的代码（Legacy）
```typescript
// 链式调用展开为 instance calls 数组并重组
myBuilder_transformed(makeBuilderParameterProxy({ title: 'hello' }))
  .margin(10)
```
### 转换后的代码（Partial Update）
builder lambda 转换不区分 Legacy/Partial Update 模式，转换逻辑由静态工具链统一处理。

## 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| 链式展开 | 不展开链式调用 | `instanceCalls` 收集 + 逆序重组 |
| animation 处理 | null 占位 + hasAnimationAttr | `updateAnimation` 拆分为 start/stop |
| callee 替换 | `builderCallNode` | `builderLambdaReplace` |
| lambda body | 不生成 | `createInitLambdaBody` |
| 参数代理 | `makeBuilderParameterProxy` | `createBuilderParameterProxyCall` |
| reuseId | 不提取 | V1 字面量 / V2 箭头函数 |
