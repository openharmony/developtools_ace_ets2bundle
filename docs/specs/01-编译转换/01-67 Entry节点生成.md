# 功能概述
入口节点生成是 `@Entry` struct 编译的最后一步：编译器根据编译模式、卡片配置、路由参数和存储选项，生成 `loadDocument`/`registerNamedRoute`/`loadEtsCard` 调用，并处理 Preview 分支和 SharedStorage 路由。

## 动态
### 源码参考位置
- `compiler/src/process_ui_syntax.ts:1506-1535`（`createEntryNode`，入口判断主控）
- `compiler/src/process_ui_syntax.ts:1537-1577`（`createEntryFunction`，Legacy vs Partial Update 分支）
- `compiler/src/process_ui_syntax.ts:1579-1626`（`createLoadPageConditionalJudgMent`，路由/存储条件判断）
- `compiler/src/process_ui_syntax.ts:1628-1676`（`generateLoadDocumentEntrance`，四种组合分支）
- `compiler/src/process_ui_syntax.ts:1804-1825`（`createLoadDocumentWithRoute`）
- `compiler/src/process_ui_syntax.ts:1827-1858`（`loadDocumentWithRoute`）
- `compiler/src/process_ui_syntax.ts:1860-1894`（`createRegisterNamedRoute`）
- `compiler/src/process_ui_syntax.ts:1916-1935`（`createLoadDocument`）
- `compiler/src/process_ui_syntax.ts:2264-2273`（`createSharedStorageWithRoute`）
- `compiler/src/process_ui_syntax.ts:1896-1914`（`createStartGetAccessRecording`）
- `compiler/src/process_ui_syntax.ts:1937-1948`（`createStopGetAccessRecording`）
- `compiler/src/process_ui_syntax.ts:1950-1971`（`addStorageParam`）
- `compiler/src/process_ui_syntax.ts:2223-2230`（`addCardStringliteral`）
- `compiler/src/pre_define.ts:161`（`PAGE_ENTRY_FUNCTION_NAME = 'loadDocument'`）
- `compiler/src/pre_define.ts:667`（`CARD_ENTRY_FUNCTION_NAME = 'loadEtsCard'`）
- `compiler/src/pre_define.ts:696`（`REGISTER_NAMED_ROUTE = 'registerNamedRoute'`）

### 转换前的原始代码
```typescript
// 场景1：简单 Entry
@Entry
struct MyPage {
  build() { Text('hello') }
}

// 场景2：带路由名的 Entry
@Entry({ routeName: 'myRoute' })
struct MyRoute {
  build() { Text('route') }
}

// 场景3：带 LocalStorage 的 Entry
@Entry('myStorage')
struct MyStoragePage {
  build() { Text('storage') }
}

// 场景4：带 SharedStorage 的 Entry
@Entry({ useSharedStorage: true })
struct MySharedPage {
  build() { Text('shared') }
}
```

### 转换后的代码（Legacy）
```typescript
// 场景1：简单 Entry → loadDocument
loadDocument(new MyPage('1', undefined, {}));

// 场景2：带路由名 → registerNamedRoute
registerNamedRoute(
  () => new MyRoute('1', undefined, {}),
  routeNameNode,
  { bundleName: '...', moduleName: '...', pagePath: '...', pageFullPath: '...', integratedHsp: '...', ... }
);

// 场景3：带 LocalStorage → loadDocument + storage
loadDocument(new MyStoragePage('1', undefined, {}, myStorage));

// 场景4：卡片场景 → loadEtsCard
loadEtsCard(new MyCard('1', undefined, {}, 'bundleName/moduleName/cardRelativePath'));
```

### 转换后的代码（Partial Update）
```typescript
// 场景1：简单 Entry（minAPIVersion > 10）→ registerNamedRoute
registerNamedRoute(
  () => new MyPage(undefined, {}),
  '',
  { bundleName: '...', moduleName: '...', pagePath: '...', ... }
);

// 场景1：简单 Entry（minAPIVersion <= 10）→ loadDocument + AccessRecording
ViewStackProcessor.StartGetAccessRecordingFor(
  ViewStackProcessor.AllocateNewElmetIdForNextComponent()
);
loadDocument(new MyPage(undefined, {}));
ViewStackProcessor.StopGetAccessRecording();

// 场景2：带路由名 → block + registerNamedRoute
{
  assignRouteNameAndStorage(routeNameNode);
  registerNamedRoute(
    () => new MyRoute(undefined, {}),
    routeNameNode,
    { ... }
  );
}

// 场景3：带 LocalStorage + routeName + storage → if 分支判断
if (routeNameNode && storageNode) { ... }
else if (routeNameNode && !storageNode) { ... }
else if (!routeNameNode && storageNode) { ... }

// 场景4：SharedStorage → createSharedStorageWithRoute
const newArray = [undefined, {}, getSharedForVariable(entryOptionNode, false)];
loadDocumentWithRoute(..., newArray, ...);
```

### 关键转换逻辑

#### 1. createEntryNode（line 1506-1535）主控流程
```
if (previewComponent.length > 0 && isPreview)
  → createPreviewComponentFunction（见 01-69 @Preview 文档）
else if (entryComponent exists)
  if (!partialUpdateMode)
    → createEntryFunction（返回单个 ExpressionStatement）
  else
    → createEntryFunction（返回 Statement[]，含 AccessRecording）
else
  → 返回原节点不变
```

#### 2. createEntryFunction（line 1537-1577）
- 构造 `newArray = [id.toString(), undefined, {}]`（Legacy）或 `[undefined, {}]`（Partial Update）
- `addStorageParam` 读取 LocalStorage 名称/节点
- 若有 `localStorageName && entryNodeKey`：追加 entryNodeKey
- `addCardStringliteral`：卡片场景追加 bundleName/moduleName/cardRelativePath
- Legacy：返回 `loadDocument(new MyPage(...))` 或 `loadEtsCard(...)`
- Partial Update + 卡片：返回 `[StartGetAccessRecording, loadDocument, StopGetAccessRecording]`
- Partial Update + 非卡片：返回 `createLoadPageConditionalJudgMent(...)`

#### 3. generateLoadDocumentEntrance（line 1628-1676）四分支
| routeName | storage | 分支 |
|---|---|---|
| 有 | 无 | `createLoadDocumentWithRoute(..., hasRouteName=true)` |
| 无 | 无 | `createLoadDocumentWithRoute(..., hasRouteName=false, shouldCreateAccsessRecording=true)` |
| 无 | 有 | `createLoadDocumentWithRoute(..., hasStorage=true)` |
| 有 | 有 | `judgeRouteNameAndStorage`（if 分支） |

每个分支根据 `isComponentPreview` 决定是返回数组还是 `ts.factory.createBlock`。

#### 4. createRegisterNamedRoute（line 1860-1894）
```typescript
registerNamedRoute(
  () => new MyPage(undefined, {}),  // 箭头函数包装
  routeNameNode,                    // 路由名
  {
    bundleName: '...',             // routerBundleOrModule
    moduleName: '...',
    pagePath: '...',                // routerOrNavPathWrite
    pageFullPath: '...',
    integratedHsp: '...',
    ...routerModuleType
  }
)
```

#### 5. createSharedStorageWithRoute（line 2264-2273）
当 `useSharedStorage: true` 时：
- `createGetSharedForVariable(entryOptionNode, false)` 获取 SharedStorage
- 追加到 newArray：`[undefined, {}, getSharedForVariable]`
- 调用 `loadDocumentWithRoute` 处理

#### 6. AccessRecording（Partial Update 模式）
- `createStartGetAccessRecording`：`ViewStackProcessor.StartGetAccessRecordingFor(ViewStackProcessor.AllocateNewElmetIdForNextComponent())`
- `createStopGetAccessRecording`：`ViewStackProcessor.StopGetAccessRecording()`
- 在 Partial Update 模式下包裹 entry 创建调用，确保 elmtId 分配

## 静态
### 源码参考位置
静态工具链通过 `arkui-plugins/ui-plugins/entry-translators/` 处理 `@Entry` 装饰器。

### 转换前的原始代码
```typescript
@Entry
struct MyPage {
  build() { Text('hello') }
}
```

### 转换后的代码
```typescript
// 静态工具链在 parsed 阶段 struct -> class，checked 阶段生成 entry 注册
class MyPage extends CustomComponent {
  static entryName: string = 'MyPage'
  initialRender() { /* 命令式 */ }
}
// entry 注册由框架运行时处理
```

## 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| entry 函数 | `loadDocument`/`loadEtsCard`/`registerNamedRoute` | 框架运行时注册 |
| routeName 处理 | `generateLoadDocumentEntrance` 四分支 | entry-translators 处理 |
| SharedStorage | `createSharedStorageWithRoute` | 无独立处理 |
| AccessRecording | Partial Update 模式包裹 | 无 |
| 卡片支持 | `addCardStringliteral` + `loadEtsCard` | 无 |
| API 版本分支 | `minAPIVersion > 10` 走 registerNamedRoute | 无 |
| Preview 分支 | `createPreviewComponentFunction` | 无 |
