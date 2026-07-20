# 功能概述
Visual/SuperVisual 转换在编译流水线的前端将 `.visual` 文件解析生成的 ETS 代码（导入、变量、函数、build 内容、aboutToAppear）注入到对应 `.ets` 源文件中，通过 `visualMap` 和 `slotMap` 维护行号偏移并生成 sourcemap。

## 动态
### 源码参考位置
- `compiler/src/process_visual.ts:66-77`（`visualTransform`，Rollup 插件入口）
- `compiler/src/process_visual.ts:79-94`（`parseVisual`，含 `sourceReplace` + `validateUISyntax`）
- `compiler/src/process_visual.ts:96-108`（`parseStatement`，遍历 struct 声明）
- `compiler/src/process_visual.ts:110-127`（`parseMember`，检测空 build 方法）
- `compiler/src/process_visual.ts:129-137`（`insertVisualCode`，四步注入主控）
- `compiler/src/process_visual.ts:139-148`（`insertImport`，注入导入语句）
- `compiler/src/process_visual.ts:150-156`（`insertVarAndFunc`，注入变量和函数）
- `compiler/src/process_visual.ts:158-162`（`insertBuild`，注入 build 方法内容）
- `compiler/src/process_visual.ts:164-181`（`insertAboutToAppear`，注入/追加 aboutToAppear）
- `compiler/src/process_visual.ts:183-203`（`insertVisualCodeAfterPos`，位置后插入）
- `compiler/src/process_visual.ts:205-223`（`insertVisualCodeBeforePos`，位置前插入）
- `compiler/src/process_visual.ts:225-271`（`generateSourceMapForNewAndOriEtsFile`，sourcemap 生成）
- `compiler/src/process_visual.ts:285-321`（`findVisualFile`，查找 .visual 文件路径）
- `compiler/src/process_visual.ts:323-332`（`getVisualContent`，解析 .visual 文件）
- `compiler/src/process_visual.ts:334-363`（`getParsedContent`，主入口）
- `compiler/src/process_visual.ts:365-368`（`clearVisualSlotMap`，清理映射）
- `compiler/src/pre_define.ts:356`（`MODULE_VISUAL_PATH = 'src/main/supervisual'`）
- `compiler/src/pre_define.ts:534`（`SUPERVISUAL = './supervisual'`）
- `compiler/src/pre_define.ts:535`（`SUPERVISUAL_SOURCEMAP_EXT = '.visual.js.map'`）

### 转换前的原始代码
```typescript
// pages/MyPage.ets（源文件，build 方法为空）
@Entry
@Component
struct MyPage {
  aboutToAppear() {
    // 已有的逻辑
    this.initData();
  }
  build() {
  }
}

// 对应的 supervisual/pages/MyPage.visual 文件（JSON 格式）
// 由 genETS 解析后生成 visualContent 对象：
// {
//   etsImport: "import mediaquery from '@ohos.mediaquery'",
//   etsVariable: "private mq: mediaquery.MediaQueryListener",
//   etsFunction: "updateUI() { this.text = 'updated' }",
//   build: "Text('hello').fontSize(20)",
//   aboutToAppear: "this.mq = mediaquery.matchMediaSync(...)"
// }
```

### 转换后的代码（Legacy）
```typescript
// 注入后的 MyPage.ets
import mediaquery from '@ohos.mediaquery';

@Entry
@Component
struct MyPage {
  private mq: mediaquery.MediaQueryListener
  updateUI() { this.text = 'updated' }
  aboutToAppear() {
    this.initData();
    this.mq = mediaquery.matchMediaSync(...)
  }
  build() {
    Text('hello').fontSize(20)
  }
}
```

### 转换后的代码（Partial Update）
```typescript
// Visual 转换不区分 Legacy 和 Partial Update，注入逻辑一致
// 注入后由后续 etsTransform 插件进行 struct → class 变换
import mediaquery from '@ohos.mediaquery';

@Entry
@Component
struct MyPage {
  private mq: mediaquery.MediaQueryListener
  updateUI() { this.text = 'updated' }
  aboutToAppear() {
    this.initData();
    this.mq = mediaquery.matchMediaSync(...)
  }
  build() {
    Text('hello').fontSize(20)
  }
}
```

### 关键转换逻辑

#### 1. visualTransform（line 66-77）Rollup 插件入口
```typescript
export function visualTransform(code: string, id: string, logger: any) {
  const content = getParsedContent(code, path.normalize(id), log);
  if (!content) return code;  // 无 .visual 文件则不变换
  generateSourceMapForNewAndOriEtsFile(path.normalize(id), code);
  return content;
}
```
- 在 Rollup 插件链中位于 `etsChecker` 之后、`etsTransform` 之前
- 对每个 `.ets` 文件查找对应的 `.visual` 文件

#### 2. getParsedContent（line 334-363）主入口
1. 检查 `projectConfig.aceSuperVisualPath` 是否存在
2. 检查是否有 entryComponent 或 customComponents
3. `findVisualFile` 查找 `.visual` 文件路径
4. `getVisualContent` 通过 `genETS` 解析 `.visual` 文件
5. `clearVisualSlotMap` 清理映射
6. 创建 SourceFile，遍历 statements 调用 `parseStatement`

#### 3. findVisualFile（line 285-321）路径解析
- 将 `.ets` 路径中的 `projectPath` 替换为 `aceSuperVisualPath`
- 将 `MODULE_ETS_PATH`（`src/main/ets`）替换为 `MODULE_VISUAL_PATH`（`src/main/supervisual`）
- 后缀 `.ets` → `.visual`
- 若直接路径不存在，从 projectRootPath 推导模块名后重新构建路径

#### 4. parseMember（line 110-127）空 build 检测
```typescript
if (member.name.getText() === 'build') {
  if (buildBody.replace(/\ +/g, '').replace(/[\r\n]/g, '') === 'build(){}') {
    // 空 build → 注入 visual 代码
    newContent = insertVisualCode(statement, member, visualContent, newContent);
  } else {
    // 非空 build → 报错
    log.push({ type: ERROR, message: 'the build function of the entry component must be empty.' });
  }
}
```
- 当存在 `.visual` 文件时，`build()` 方法必须为空
- 空方法检测：去除空格和换行后匹配 `'build(){}'`

#### 5. insertVisualCode（line 129-137）四步注入
```typescript
newContent = insertImport(visualContent, newContent);         // 1. 导入
newContent = insertVarAndFunc(member, visualContent, ...);     // 2. 变量和函数
newContent = insertBuild(member, visualContent, ...);          // 3. build 内容
newContent = insertAboutToAppear(statement, member, ...);      // 4. aboutToAppear
```

#### 6. 注入策略

| 函数 | 注入位置 | 来源字段 | 说明 |
|---|---|---|---|
| `insertImport` | 文件开头 | `etsImport` | 媒体查询等导入语句 |
| `insertVarAndFunc` | build 方法前 | `etsVariable` + `etsFunction` | 私有变量和方法声明 |
| `insertBuild` | build 方法体内（`{` 之后） | `build` | 声明式 UI 内容 |
| `insertAboutToAppear` | 已有方法体内 或 build 前 | `aboutToAppear` | 生命周期逻辑 |

#### 7. insertAboutToAppear（line 164-181）
- 若已有 `aboutToAppear` 方法：在其 body 内追加 `visualContent.aboutToAppear`（`insertVisualCodeAfterPos`）
- 若无：在 build 方法前创建新方法 `aboutToAppear() { ... }`（`insertVisualCodeBeforePos`）

#### 8. 行号映射和 sourcemap
- `visualMap`：`Map<number, number>`，原始行号 → 注入行数偏移
- `slotMap`：`Map<number, number>`，插入位置 → 插入内容长度
- `insertVisualCodeAfterPos`/`insertVisualCodeBeforePos`：每次插入时更新映射
- `generateSourceMapForNewAndOriEtsFile`：遍历每行，根据 `visualMap` 计算新行号，生成 `.visual.js.map`

#### 9. parseVisual（line 79-94）替代入口
- 在非 Rollup 模式下使用
- 额外调用 `sourceReplace` 和 `validateUISyntax` 进行源码替换和语法校验

## 静态
### 源码参考位置
静态工具链（arkui-plugins）不处理 Visual/SuperVisual 转换。Visual 转换是动态工具链特有的前端预处理步骤，在 Rollup 插件链的 `visualTransform` 阶段执行，发生在 es2panda AST 变换之前。

### 转换前的原始代码
```typescript
// 不适用 — 静态工具链不处理 Visual 文件
```

### 转换后的代码
```typescript
// 不适用 — 静态工具链不处理 Visual 文件
```

## 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| 是否处理 Visual | 是，`visualTransform` 插件 | 否 |
| .visual 文件解析 | `genETS` | 无 |
| 代码注入 | 四步注入（import/var/build/aboutToAppear） | 无 |
| 行号映射 | `visualMap` + `slotMap` | 无 |
| sourcemap | `.visual.js.map` | 无 |
| 空 build 校验 | 必须为空 | 无 |
| 插件链位置 | etsChecker 之后，etsTransform 之前 | 无 |
| 适用模式 | Legacy + ESMODULE | 无 |
| 文件查找 | `findVisualFile` 路径替换 | 无 |
