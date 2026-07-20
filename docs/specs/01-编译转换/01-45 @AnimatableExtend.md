# 功能概述
`@AnimatableExtend` 装饰器为指定组件扩展可动画的自定义属性，支持属性值的动画过渡。动态工具链在函数声明阶段将函数体包装为 `if (isInitialRender) { createAnimatableProperty(...) } else { updateAnimatableProperty(...) }` 结构，追加 `elmtId`、`isInitialRender`、`parent` 三个参数。`createAnimatableProperty` 在首次渲染时注册动画属性并传入回调闭包，`updateAnimatableProperty` 在后续渲染时更新属性值。

| 转换规则 | 说明 |
|---|---|
| 参数追加 | `elmtId`、`isInitialRender`、`parent`（注意 `parent` 而非 `this`） |
| 函数体包装 | `if (isInitialRender) { createAnimatableProperty(...) + 原始语句 } else { updateAnimatableProperty(...) }` |
| createAnimatableProperty | 首次渲染时调用，参数为 `funcName`、原始参数、闭包箭头函数 |
| updateAnimatableProperty | 后续渲染时调用，参数为 `funcName`、原始参数 |
| 闭包内容 | `startGetAccessRecordingFor(elmtId)` → `GetAndPushFrameNode` → 原始属性语句 → `stopGetAccessRecording()` → `finishUpdateFunc` |

## 动态
### 源码参考位置
- `compiler/src/process_ui_syntax.ts:1231-1243`（`processAnimatableExtend`，主入口）
- `compiler/src/process_ui_syntax.ts:1245-1254`（`createAnimatableParameterNode`，追加参数）
- `compiler/src/process_ui_syntax.ts:1256-1282`（`createAnimatableBody`，函数体包装）
- `compiler/src/process_ui_syntax.ts:1284-1307`（`createAnimatableProperty`，create 调用生成）
- `compiler/src/pre_define.ts:125`（`COMPONENT_ANIMATABLE_EXTEND_DECORATOR = '@AnimatableExtend'`）
- `compiler/src/pre_define.ts:141`（`CREATE_ANIMATABLE_PROPERTY = 'createAnimatableProperty'`）
- `compiler/src/pre_define.ts:142`（`UPDATE_ANIMATABLE_PROPERTY = 'updateAnimatableProperty'`）
- `compiler/src/pre_define.ts:143`（`GET_AND_PUSH_FRAME_NODE = 'GetAndPushFrameNode'`）
- `compiler/src/pre_define.ts:144`（`FINISH_UPDATE_FUNC = 'finishUpdateFunc'`）
- `compiler/src/pre_define.ts:608`（`ISINITIALRENDER = 'isInitialRender'`）
- `compiler/src/pre_define.ts:609`（`ELMTID = 'elmtId'`）
- `compiler/src/pre_define.ts:225`（`COMPONENT_CONSTRUCTOR_PARENT = 'parent'`）

### 转换前的原始代码
```typescript
@AnimatableExtend(Text)
function myAnimProp(value: number) {
  .width(value)
}

// 使用处
Text('hello')
  .myAnimProp(100)
```

### 转换后的代码（Legacy）
```typescript
function __Text__myAnimProp(value: number, elmtId: number, isInitialRender: boolean, parent) {
  if (isInitialRender) {
    Text.createAnimatableProperty('myAnimProp', value, (value) => {
      ViewStackProcessor.startGetAccessRecordingFor(elmtId);
      ViewStackProcessor.GetAndPushFrameNode();
      Text.width(value);
      ViewStackProcessor.stopGetAccessRecording();
      // finishUpdateFunc
    });
  } else {
    Text.updateAnimatableProperty('myAnimProp', value);
  }
}
```

### 转换后的代码（Partial Update）
```typescript
// 与 Legacy 一致
function __Text__myAnimProp(value: number, elmtId: number, isInitialRender: boolean, parent) {
  if (isInitialRender) {
    Text.createAnimatableProperty('myAnimProp', value, (value) => { ... });
  } else {
    Text.updateAnimatableProperty('myAnimProp', value);
  }
}
```

### 关键转换逻辑
- **`processAnimatableExtend`**（line 1231-1243）：主入口函数。
  - `bindComponentAttr`（line 1233-1234）：将函数体第一条语句（样式调用）通过 `bindComponentAttr` 绑定到组件类型上，生成 `attrArray` 语句数组。
  - 参数追加（line 1238）：`[...node.parameters, ...createAnimatableParameterNode()]`，在原始参数后追加三个参数。
  - 函数体替换（line 1240-1242）：`createAnimatableBody(componentName, node.name, node.parameters, statementArray)` 生成新的函数体语句。

- **`createAnimatableParameterNode`**（line 1245-1254）：生成三个追加参数声明。
  - `elmtId`（`ELMTID`，line 1248）
  - `isInitialRender`（`ISINITIALRENDER`，line 1250）
  - `parent`（`COMPONENT_CONSTRUCTOR_PARENT`，line 1252）— 注意是 `parent` 而非 `this`，与 `@Extend` 的 `this` 不同。

- **`createAnimatableBody`**（line 1256-1282）：生成 `if-else` 结构。
  - `paramNode` 收集（line 1258-1263）：从 `parameters` 中提取所有 `Identifier` 参数名。
  - `if (isInitialRender)` 分支（line 1265-1270）：
    - `createAnimatableProperty(...)` 调用
    - `...attrArray`：原始样式属性语句（如 `Text.width(value)`）
  - `else` 分支（line 1271-1279）：
    - `Text.updateAnimatableProperty('myAnimProp', ...paramNode)` — 以函数名字符串和原始参数调用。

- **`createAnimatableProperty`**（line 1284-1307）：生成 `createAnimatableProperty` 调用。
  - 调用目标：`Text.createAnimatableProperty`（`Component.createAnimatableProperty`）
  - 参数列表（line 1292-1303）：
    1. `funcName.escapedText.toString()` — 函数名字符串（如 `'myAnimProp'`）
    2. `...paramNode` — 原始参数（如 `value`）
    3. 箭头函数闭包 — 参数为 `parameters`（与原函数参数一致），函数体包含：
       - `startGetAccessRecordingFor(elmtId)` — `createViewStackProcessorStatement(STARTGETACCESSRECORDINGFOR, ELMTID)`
       - `GetAndPushFrameNode()` — `createAnimatableFrameNode(componentName)`
       - `...attrArray` — 原始样式属性语句
       - `stopGetAccessRecording()` — `createViewStackProcessorStatement(STOPGETACCESSRECORDING)`
       - `createAnimatableUpdateFunc()` — finishUpdateFunc 回调

- **调用阶段** — `addComponentAttr` 中 `@AnimatableExtend` 分支（line 3031-3058）：
  - `isExtendFunctionNode` 返回 `CHECK_COMPONENT_ANIMATABLE_EXTEND_DECORATOR` 时，`functionName = propName`（直接用属性名，不重命名），追加 `[...temp.arguments, elmtId, isInitialRender, this]` 参数。
  - 注意：调用处追加的是 `this`（非 `parent`），而函数声明处追加的参数名是 `parent`。这是设计如此，`this` 在调用时传入，在函数签名中绑定到 `parent` 参数。

## 静态
### 源码参考位置
- `arkui-plugins/ui-plugins/struct-translators/factory.ts:695`（`createOrSetAniProperty`）
- `arkui-plugins/common/predefines.ts:227`（`DecoratorNames.ANIMATABLE_EXTEND = 'AnimatableExtend'`）

### 转换前的原始代码
```typescript
@AnimatableExtend(Text)
function myAnimProp(value: number) {
  .width(value)
}
```

### 转换后的代码
```typescript
// 生成 __createOrSetAnimatableProperty 泛型方法
// 参数: functionName: string, callback: ...
```

## 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| 方法生成 | `createAnimatableProperty`/`updateAnimatableProperty` | `__createOrSetAnimatableProperty` 泛型方法 |
| 参数追加 | `elmtId`, `isInitialRender`, `parent`（声明处）；`this`（调用处） | `functionName`, `callback` |
| 实现机制 | 函数级重命名 + 参数追加 + if-else 包装 | 结构级方法生成 |
| if-else 分支 | `isInitialRender` 区分 create/update | 无 if-else，泛型方法统一处理 |
