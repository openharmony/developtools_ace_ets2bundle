# 功能概述
`@Preview` 装饰器标记组件用于预览模式，编译器生成 `getPreviewComponentFlag` 条件分支调用 `storePreviewComponents` 和 `previewComponent`，使 IDE Preview 可独立渲染被标记的 struct。

## 动态
### 源码参考位置
- `compiler/src/pre_define.ts:27`（`COMPONENT_DECORATOR_PREVIEW = '@Preview'`）
- `compiler/src/process_ui_syntax.ts:1981`（`createPreviewComponentFunction`）
- `compiler/src/process_ui_syntax.ts:1506`（`createEntryNode`，判断是否走 preview 分支）
- `compiler/src/process_ui_syntax.ts:2034`（`storePreviewComponents`）
- `compiler/src/process_ui_syntax.ts:1537`（`createEntryFunction`）
- `compiler/src/process_ui_syntax.ts:2223`（`addCardStringliteral`，卡片路径处理）
- `compiler/src/validate_ui_syntax.ts`（Preview 收集逻辑，`componentCollection.previewComponent`）

### 转换前的原始代码
```typescript
@Preview({ title: 'My Preview' })
@Component
struct MyComp {
  build() {
    Text('hello')
  }
}

@Entry
struct MyPage {
  build() {
    MyComp()
  }
}
```

### 转换后的代码（Legacy）
```typescript
// 当 isPreview=true 且 previewComponent.length > 0 时，createEntryNode 走 preview 分支
if (getPreviewComponentFlag()) {
  storePreviewComponents(1, 'MyComp', new MyComp(undefined, {}, ));
  previewComponent();
} else {
  loadDocument(new MyPage(undefined, {}));
}
```

### 转换后的代码（Partial Update）
```typescript
// Partial Update 模式下 newArray 不含 id 字符串，仅 [undefined, {}]
if (getPreviewComponentFlag()) {
  storePreviewComponents(1, 'MyComp', new MyComp(undefined, {}));
  previewComponent();
} else {
  // createLoadPageConditionalJudgMent 分支：registerNamedRoute 或 loadDocument
  ViewStackProcessor.StartGetAccessRecordingFor(
    ViewStackProcessor.AllocateNewElmetIdForNextComponent()
  );
  loadDocument(new MyComp(undefined, {}));
  ViewStackProcessor.StopGetAccessRecording();
}
```

### 关键转换逻辑
1. **入口判断**（`createEntryNode:1512`）：当 `componentCollection.previewComponent.length === 0` 或非 `projectConfig.isPreview` 时走普通 entry 分支；否则调用 `createPreviewComponentFunction`。
2. **参数数组构造**（`createPreviewComponentFunction:1983-1992`）：
   - Legacy 模式：`[id.toString(), undefined, {}]`（含编译器分配的 id）
   - Partial Update 模式：`[undefined, {}]`（不含 id）
3. **Storage 参数**（`addStorageParam:1993`）：读取 `componentCollection.localStorageName`/`localStorageNode`，有则追加到 newArray。
4. **storePreviewComponents**（line 2034）：遍历 `componentCollection.previewComponent`，为每个预览组件构造 `new componentName(...)` 并配对 `[componentName, newExpression]` 压入 `argsArr`。
5. **cardRelativePath**：若 `projectConfig.cardObj` 存在当前文件的卡片路径，则通过 `addCardStringliteral` 将 `bundleName/moduleName/cardRelativePath` 追加到参数末尾，调用 `loadEtsCard` 而非 `loadDocument`。
6. **entryNodeKey**：`@Entry(storageName)` 中的标识符参数，在 Partial Update 模式下追加到 newArray 末尾。

## 静态
### 源码参考位置
静态工具链（arkui-plugins）不处理 `@Preview` 装饰器，预览逻辑仅由动态工具链实现。

### 转换前的原始代码
```typescript
@Preview({ title: 'My Preview' })
@Component
struct MyComp {
  build() { Text('hello') }
}
```

### 转换后的代码
```typescript
// 静态工具链不处理 @Preview，struct -> class 变换后 @Preview 装饰器被移除
class MyComp extends CustomComponent {
  initialRender() { /* 命令式 */ }
}
```

## 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| 是否处理 @Preview | 是，生成 preview 调用链 | 否，不处理 |
| Preview 组件收集 | `componentCollection.previewComponent` | 无 |
| 条件分支生成 | `if (getPreviewComponentFlag())` | 无 |
| 卡片路径支持 | `addCardStringliteral` + `loadEtsCard` | 无 |
| Partial Update 差异 | newArray 不含 id，走 `registerNamedRoute`/`loadDocument` | 无 |
