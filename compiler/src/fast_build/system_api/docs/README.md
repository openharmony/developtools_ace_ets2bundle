# system_api 模块总览

> 路径：`compiler/src/fast_build/system_api/`
> 职责：系统 API 导入变换 + API 兼容性校验 + 告警抑制

---

## 1. 模块定位

本模块是 ArkTS 编译工具链 Rollup 插件链中的 **apiTransform** 插件实现，位于插件链第 6 位（etsTransform -> **apiTransform** -> genAbc）。

核心职责分两条业务线：

| 业务线 | 说明 | 核心文件 |
|--------|------|----------|
| **系统 API 变换** | 将 `@ohos.xxx`、`libxxx.so` 等导入语句变换为运行时 `globalThis.requireNapi()` 调用；收集模块/组件使用信息供后续打包 | `rollup-plugin-system-api.ts` |
| **API 兼容性校验** | 基于 JSDoc 标签（`@since`、`@syscap`、`@permission` 等）和 `@Available` 装饰器，校验 API 在目标 SDK 版本下是否可用；支持多种告警抑制策略 | `api_check_define.ts`、`api_check_utils.ts`、`api_checker/`、`api_validator/` |

---

## 2. 文件介绍

```
system_api/
├── rollup-plugin-system-api.ts    # [必读] Rollup 插件入口 + 系统API/libso 变换 + 模块/组件收集
├── api_check_define.ts            # [必读] 常量定义：标签名、错误消息、错误码映射、接口、枚举
├── api_check_permission.ts        # 权限表达式解析器：JsDocCheckService（and/or/括号 递归求值）
├── api_check_utils.ts             # [必读] 核心工具：配置构建、各 check 回调、版本比较、插件系统
├── api_checker/                   # 版本检查器（策略模式）
│   ├── base_version_checker.ts    #   抽象基类 BaseVersionChecker
│   ├── since_version_checker.ts    #   @since JSDoc 检查器
│   └── available_version_checker.ts#   @Available 装饰器检查器
├── api_validator/                 # 告警抑制系统（组合模式）
│   ├── base_warning_suppressor.ts #   抑制器基类
│   ├── since_warning_suppressor.ts#   @since 告警抑制器
│   ├── available_warning_suppressor.ts # @Available 告警抑制器
│   ├── permission_warning_suppressor.ts # @permission 告警抑制器
│   ├── syscap_warning_suppressor.ts     # @syscap 告警抑制器
│   ├── api_validate_node.ts       #   各 Validator 实现（try-catch/undefined/SDK版本/白名单/@SuppressWarnings）
│   ├── api_validate_utils.ts     #   SdkComparisonHelper（SDK 版本比较辅助）
│   └── apiAvailable_validate_utils.ts # apiAvailable() 参数校验
└── docs/                          # 本文档目录
    ├── README.md                  #   本文档
    ├── 01-plugin-and-transform.md #   插件入口与系统API变换
    ├── 02-define-and-permission.md#   常量定义与权限校验
    ├── 03-check-utils.md          #   核心校验工具
    ├── 04-version-checker.md      #   版本检查器（策略模式）
    └── 05-warning-suppressor.md   #   告警抑制系统（组合模式）
```

**必读顺序**：README.md -> 01 -> 02 -> 03 -> 04 -> 05

---

## 3. 架构总览

```
                        ┌─────────────────────────────────────┐
                        │   rollup-plugin-system-api.ts       │
                        │   (apiTransform 插件)                │
                        │                                     │
  源码 .ets/.ts ──────► │  load()      → 收集 allFiles         │
                        │  buildStart() → 判断收集模式          │
                        │  transform() → 系统 API 变换 +       │
                        │                 libso 变换            │
                        │  beforeBuildEnd() → 组件收集          │
                        │  buildEnd()   → 模块收集 + kit 替换    │
                        │  cleanUp()   → 重置全局状态           │
                        └──────────┬──────────────────────────┘
                                   │
                    ┌──────────────┴───────────────┐
                    ▼                              ▼
          ┌─────────────────┐          ┌──────────────────────┐
          │  系统API变换     │          │  API 兼容性校验        │
          │                  │          │ (由 ets_checker 触发)  │
          │ @ohos.xxx →      │          │                       │
          │  requireNapi()   │          │  getJsDocNodeCheckConfig()
          │ libxxx.so →      │          │       │               │
          │  requireNapi()   │          │       ▼               │
          └─────────────────┘          │  各 check 回调          │
                                       │  (checkSinceValue,     │
                                       │   checkAvailableDecorator,
                                       │   checkPermissionValue │
                                       │   ...)                 │
                                       └──────┬────────────────┘
                                              │
                              ┌───────────────┼───────────────┐
                              ▼               ▼               ▼
                    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
                    │ api_checker/  │ │ api_check_   │ │ api_validator/│
                    │ 版本检查器     │ │ permission  │ │ 告警抑制器    │
                    │ (策略模式)     │ │ 权限解析     │ │ (组合模式)    │
                    │                │ │              │ │              │
                    │ BaseVersion    │ │ JsDocCheck   │ │ BaseWarning  │
                    │  Checker       │ │  Service     │ │  Suppressor  │
                    │  ├ Since       │ │ (and/or/括号)│ │  ├ Since     │
                    │  └ Available   │ │              │ │  ├ Available │
                    └──────────────┘ └──────────────┘ │  ├ Permission│
                                                       │  └ Syscap    │
                                                       └──────────────┘
```

---

## 4. 调用链路分析

本模块有两条独立的执行链路：**系统 API 变换**走 Rollup 插件 hook，**API 兼容性校验**走 tsc checker 回调。

### 4.1 系统 API 变换链路（Rollup 插件 hook）

```
compile_plugin.js
  │  按 fixed order 加载 apiTransform（第 6 位）
  ▼
rollup-plugin-system-api.ts: apiTransform()
  │
  ├─ load(id)                          ← Rollup 加载每个模块时触发
  │    └─ allFiles.add(path.join(id))      收集所有源文件路径
  │
  ├─ buildStart()                      ← 构建开始时触发
  │    └─ 根据 projectConfig 判断:
  │         isCrossplatform → needModuleCollection = true, needComponentCollection = true
  │         widgetCompile   → needModuleCollection = false, needComponentCollection = true
  │
  ├─ transform(code, id)               ← 每个文件变换时触发（核心）
  │    ├─ 判断 shouldEmitJsFlag（.js / shouldEmitJsFlagById / 非 esmodule）
  │    ├─ 判断编译模式:
  │    │    esmodule   → processSystemApiAndLibso(code, id, useOSFiles)
  │    │                 ├─ import x = require('@ohos.y') → import x from '@ohos.y'
  │    │                 ├─ libxxx.so → 保留原样，记录到 useOSFiles
  │    │                 └─ 收集系统模块到 appImportModuleCollection
  │    │    非esmodule → processSystemApi(code, id) + processLibso(code, id, useOSFiles)
  │    │                 ├─ @ohos.xxx → var x = globalThis.requireNapi('xxx')
  │    │                 └─ libxxx.so → var x = globalThis.requireNapi('xxx', true)
  │    └─ return { code, map }
  │
  ├─ beforeBuildEnd()                  ← 构建结束前触发
  │    └─ if needComponentCollection:
  │         ├─ getAllComponentsOrModules(allFiles, 'component_collection.json')
  │         ├─ mergeModuleOrComponentCollection(COMPONENT)  ← 跨平台合并
  │         └─ writeCollectionFile(..., 'component_collection.json')
  │
  ├─ buildEnd()                        ← 构建结束时触发
  │    ├─ if isPreview && useOSFiles.size > 0:
  │    │    writeUseOSFiles(useOSFiles)
  │    └─ if needModuleCollection:
  │         ├─ replaceKitModules()                        ← Kit 导入替换为实际模块
  │         ├─ getAllComponentsOrModules(allFiles, 'module_collection.json')
  │         ├─ mergeModuleOrComponentCollection(MODULE)   ← 跨平台合并
  │         └─ writeCollectionFile(..., 'module_collection.json')
  │
  └─ cleanUp()                         ← 构建清理时触发
       └─ allFiles.clear() / appImportModuleCollection.clear()
          useOSFiles.clear() / kitModules.clear()
```

### 4.2 API 兼容性校验链路（tsc checker 回调）

tsc 在类型检查阶段遇到标识符引用时，通过自定义 LanguageServiceHost 回调进入本模块。

**触发入口**：`rollup-plugin-ets-checker.ts`（etsChecker 插件，插件链第 3 位）的 `buildStart()` hook。

```
compile_plugin.js
  │  按固定顺序加载插件，etsChecker 为第 3 位
  ▼
rollup-plugin-ets-checker.ts: etsChecker().buildStart()           ← 触发入口
  │
  ├─ configureSyscapInfo(this.share.projectConfig)                 ← system_api/api_check_utils.ts
  │    初始化 syscapIntersectionSet / syscapUnionSet
  │
  ├─ configurePermission(this.share.projectConfig)                 ← system_api/api_check_utils.ts
  │    初始化 requestPermissions / definePermissions
  │
  └─ serviceChecker(rootFileNames, logger, ..., this.share)        ← ets_checker.ts:762
       │
       ├─ createLanguageService(rootFileNames, resolveModulePaths, ...)  ← ets_checker.ts:400
       │    │
       │    └─ 构建 ts.LanguageServiceHost，注册自定义回调:
       │         ├─ getJsDocNodeCheckedConfig(fileCheckedInfo, sourceFileName)
       │         │    → getJsDocNodeCheckConfig(fileCheckedInfo.currentFileName, sourceFileName)
       │         │      ← system_api/api_check_utils.ts:908
       │         │
       │         ├─ getFileCheckedModuleInfo(containFilePath)
       │         │    → return { fileNeedCheck: true, currentFileName: containFilePath }
       │         │
       │         ├─ getJsDocNodeConditionCheckResult(...)
       │         │    → getJsDocNodeConditionCheckResult(...)  ← system_api/api_check_utils.ts
       │         │
       │         ├─ isApiAvailableVersionSpecifications(...)
       │         │    → isApiAvailableVersionSpecifications(...)  ← system_api/api_check_utils.ts
       │         │
       │         ├─ isSourceRetentionDeclarationValid(...)
       │         │    → isSourceRetentionDeclarationValid(...)  ← system_api/api_check_utils.ts
       │         │
       │         └─ isSourceRetentionAnnotationContentValid(...)
       │              → isSourceRetentionAnnotationContentValid(...)  ← system_api/api_check_utils.ts
       │
       ├─ languageService.getBuilderProgram()                      创建 tsc BuilderProgram
       │    └─ globalProgram.program = builderProgram.getProgram()
       │
       ├─ traverseProgramSourceFiles()                             收集源文件
       │
       ├─ runArkTSLinter()                                         运行 ArkTS Linter
       │    │
       │    ▼ 触发 tsc 类型检查（third_party_typescript/src/compiler/checker.ts）
       │    │
       │    ├─ checkSourceFile(node)                               ← tsc 校验每个源文件时
       │    │    └─ jsDocFileCheckInfo = host.getFileCheckedModuleInfo(node.fileName)
       │    │         └─ ets_checker.ts: return { fileNeedCheck: true, currentFileName: node.fileName }
       │    │            ← jsDocFileCheckInfo.currentFileName = 引用方文件路径
       │    │
       │    ├─ checkIdentifierJsDoc(node, sourceSymbol)            ← tsc 遇到标识符引用时
       │    │    │                                              (也通过 propertyAccessExpressionConditionCheck 进入)
       │    │    ├─ sourceSymbolSourceFile = getSourceFileOfNode(sourceSymbol.valueDeclaration)
       │    │    │  ← 声明方文件路径
       │    │    │
       │    │    ├─ checkParam = getJsDocNodeCheckedConfig(jsDocFileCheckInfo, sourceSymbolSourceFile.fileName)
       │    │    │    │
       │    │    │    ▼ ets_checker.ts (LanguageServiceHost 回调:434)
       │    │    │    getJsDocNodeCheckedConfig(fileCheckedInfo, sourceFileName)
       │    │    │      └─ getJsDocNodeCheckConfig(fileCheckedInfo.currentFileName, sourceFileName)
       │    │    │         │
       │    │    │         ▼ system_api/api_check_utils.ts:908
       │    │    │         根据 fileName（引用方）和 sourceFileName（声明方）构建校验配置:
       │    │    │         ├─ 缓存命中 → 直接返回
       │    │    │         ├─ fileName 为 .ts 且声明方为 ArkUI → 添加 "Cannot find name" 检查
       │    │    │         ├─ 声明方为系统模块 → 返回空配置（跳过）
       │    │    │         ├─ 声明方含 @Available → 添加 @Available 校验
       │    │    │         └─ 声明方为项目模块/ArkUI → 添加全量标签校验
       │    │    │              (@deprecated, @systemapi, @since, @syscap, @test, @permission,
       │    │    │               @form, @crossplatform, @famodelonly/@stagemodelonly, @atomicservice)
       │    │    │
       │    │    │    ← 返回 { nodeNeedCheck, checkConfig[] }
       │    │    │
       │    │    └─ expressionCheckByJsDoc(declaration, node, sourceFile, checkParam.checkConfig)
       │    │         │                              ↑引用节点    ↑引用方源文件
       │    │         │  ↑ 声明（含 JSDoc 标签）
       │    │         │
       │    │         ├─ jsDocTags = getJSDocTags(declaration)       ← 从声明方读取 JSDoc 标签
       │    │         │
       │    │         └─ for each config in checkConfig:
       │    │              ├─ config.checkJsDocSpecialValidCallback(jsDocTags, config, node, declaration)
       │    │              │   │
       │    │              │   │  ====== 各 check 回调进入 ======
       │    │              │   │
       │    │              │   ├─ checkSinceValue (api_check_utils.ts:1225)
       │    │              │   │    ├─ SinceJSDocChecker.checkTargetVersion(jsDocNode)
       │    │              │   │    │    ├─ parseVersion() → 提取 @since 版本
       │    │              │   │    │    └─ compare() → versionCompareFunction(minApi, sdk, Trigger)
       │    │              │   │    ├─ if 不兼容:
       │    │              │   │    │    SinceWarningSuppressor.isApiVersionHandled(node)
       │    │              │   │    │      └─ CompositeValidator.validate(node)  ← 任一通过即抑制
       │    │              │   │    │           ├─ TryCatchValidator
       │    │              │   │    │           ├─ UndefinedCheckValidator
       │    │              │   │    │           ├─ WhiteListValidator
       │    │              │   │    │           ├─ AvailableComparisonValidator
       │    │              │   │    │           ├─ SdkComparisonValidator
       │    │              │   │    │           ├─ AnnotateSuppressWarningsValidator
       │    │              │   │    │           └─ CommentSuppressWarningsValidator
       │    │              │   │    └─ return true（需告警）/ false（已抑制）
       │    │              │   │
       │    │              │   ├─ checkAvailableDecorator (api_check_utils.ts:1157)
       │    │              │   │    ├─ AvailableAnnotationChecker.checkTargetVersion(declaration)
       │    │              │   │    │    ├─ parseVersion() → extractMinApiFromDecorator()
       │    │              │   │    │    └─ compare() → valueChecker(availableVersion, sdk, Trigger)
       │    │              │   │    ├─ if 不兼容:
       │    │              │   │    │    AvailableWarningSuppressor.isApiVersionHandled(node)
       │    │              │   │    │      └─ AvailableComparisonValidator / SdkComparisonValidator
       │    │              │   │    │         + Annotate/Comment SuppressWarningsValidator
       │    │              │   │    └─ return true / false
       │    │              │   │
       │    │              │   ├─ checkPermissionValue (api_check_utils.ts:1695)
       │    │              │   │    ├─ 提取版本范围 [since x - y] → 不相交则跳过
       │    │              │   │    ├─ JsDocCheckService.validPermission(comment, permissionsArray)
       │    │              │   │    │    └─ 递归求值 and/or/括号 权限表达式
       │    │              │   │    ├─ if 权限不满足:
       │    │              │   │    │    PermissionWarningSuppressor.isApiVersionHandled(node)
       │    │              │   │    │      └─ Annotate/Comment SuppressWarningsValidator
       │    │              │   │    └─ return true / false
       │    │              │   │
       │    │              │   ├─ checkSyscapAbility (api_check_utils.ts:1603)
       │    │              │   │    ├─ 检查 syscapIntersectionSet 是否支持
       │    │              │   │    ├─ if 不支持:
       │    │              │   │    │    SyscapWarningSuppressor.isApiVersionHandled(node)
       │    │              │   │    │      └─ CanIUseValidator + Annotate/Comment SuppressWarnings
       │    │              │   │    └─ return true / false
       │    │              │   │
       │    │              │   └─ check 回调（checkFormValue, checkTestValue, ...）
       │    │              │      └─ 版本范围检查 / 直接返回是否需告警
       │    │              │
       │    │              │  ====== check 回调结束 ======
       │    │              │
       │    │              ├─ if callback 返回 true（需告警）:
       │    │              │    └─ collectDiagnostics(config, node, diagnostic)  ← 生成 tsc 诊断
       │    │              └─ if callback 返回 false（已抑制）:
       │    │                   └─ continue（跳过，不生成诊断）
       │    │
       │    └─ 诊断结果汇集到 tsc 诊断列表
       │
       └─ printDiagnostic()                                          输出诊断结果
```

### 4.3 两条链路的关系

```
                          Rollup 插件链
                               │
      ┌────────────────────────┼────────────────────────┐
      ▼                                                 ▼
 etsChecker 插件                                    apiTransform 插件
 (第 3 位)                                          (第 6 位)
 rollup-plugin-ets-checker.ts                       rollup-plugin-system-api.ts
      │                                                 │
      │ buildStart()                                    │ transform()
      │ ├─ configureSyscapInfo()                        │ ├─ processSystemApi()
      │ │   ← system_api/api_check_utils.ts             │ │   @ohos.xxx → requireNapi()
      │ ├─ configurePermission()                        │ ├─ processLibso()
      │ │   ← system_api/api_check_utils.ts             │ │   libxxx.so → requireNapi()
      │ └─ serviceChecker()                             │ └─ 收集 module/component
      │     ← ets_checker.ts                            │
      │     ├─ createLanguageService()                  │
      │     │   注册 host 回调 ─────────┐               │
      │     │     getJsDocNodeCheckedConfig → system_api │
      │     │     getFileCheckedModuleInfo              │
      │     │     isApiAvailableVersionSpecifications    │
      │     │     isSourceRetentionDeclarationValid     │
      │     │     isSourceRetentionAnnotationContentValid│
      │     │                          │                │
      │     ├─ getBuilderProgram()      │               │
      │     │   创建 tsc Program        │               │
      │     │                           │               │
      │     └─ runArkTSLinter()         │               │
      │         │                       │               │
      │         ▼                       │               │
      │     tsc 类型检查                 │               │
      │      ├─ checkSourceFile         │               │
      │      │   → host.getFileCheckedModuleInfo ──┘    │
      │      │      (记录引用方文件)                      │
      │      │                                           │
      │      ├─ checkIdentifierJsDoc                    │
      │      │   → host.getJsDocNodeCheckedConfig       │
      │      │     → getJsDocNodeCheckConfig(引用方, 声明方)
      │      │     → expressionCheckByJsDoc(声明, 引用节点, ...)
      │      │       → check 回调 → 版本检查器 → 告警抑制器
      │      │                                           │
      │      └─ 诊断结果 ←────────────────────────────── │
      │                                                 │
      └─ printDiagnostic()                              │
          输出诊断结果                                    │
```

> **关键点**：
> - **入口**：`rollup-plugin-ets-checker.ts`（etsChecker 插件，第 3 位）的 `buildStart()` hook 是 API 兼容性校验的真正触发入口
> - **宿主**：`ets_checker.ts` 的 `serviceChecker()` → `createLanguageService()` 创建 tsc LanguageService 并注册 host 回调，回调实现委托到 `system_api/api_check_utils.ts`
> - **执行者**：tsc `checker.ts` 在类型检查阶段调用 host 回调，进入 system_api 模块的 check 回调 → 版本检查器 → 告警抑制器
> - **独立性**：apiTransform 插件（第 6 位）的系统 API 变换与校验链路独立，仅做导入语句替换。两者通过 `main.js` 全局状态（如 `projectConfig`、缓存等）间接关联，但执行时机和代码路径不同

---

## 5. 关键概念

### 5.1 编译模式

| 模式 | 说明 | 变换行为 |
|------|------|----------|
| `esmodule` | HAR/HSP 按模块编译 | `processSystemApiAndLibso`：保留 `import` 语法，仅收集 + 规范化路径 |
| 非 esmodule | 应用发布打包 | `processSystemApi` + `processLibso`：替换为 `var xxx = globalThis.requireNapi(...)` |

### 5.2 校验标签

| 标签 | 常量 | 校验内容 | 告警级别 |
|------|------|----------|----------|
| `@since` | `SINCE_TAG_NAME` | API 引入版本是否 > 兼容 SDK 版本 | warn/error（可配） |
| `@Available` | `AVAILABLE_TAG_NAME` | `@Available({minApiVersion})` 装饰器版本校验 | warn/error（可配） |
| `@syscap` | `SYSCAP_TAG_CHECK_NAME` | 设备能力集是否支持该 API | warning |
| `@permission` | `PERMISSION_TAG_CHECK_NAME` | 权限表达式（and/or/括号）是否满足 | warning |
| `@systemapi` | `SYSTEM_API_TAG_CHECK_NAME` | 是否使用了系统 API | warning |
| `@test` | `TEST_TAG_CHECK_NAME` | 是否在测试目录外使用了测试 API | warning |
| `@form` | `FORM_TAG_CHECK_NAME` | 卡片场景是否使用了不支持的 API | error |
| `@crossplatform` | `CROSSPLATFORM_TAG_CHECK_NAME` | 跨平台场景是否使用了不支持的 API | error/warning |
| `@famodelonly` | `FA_TAG_CHECK_NAME` | FA 模式专用 API 在 Stage 模式使用 | error |
| `@stagemodelonly` | `STAGE_TAG_CHECK_NAME` | Stage 模式专用 API 在 FA 模式使用 | error |
| `@atomicservice` | `ATOMICSERVICE_TAG_CHECK_NAME` | AtomicService 场景不支持该 API | error |
| `@deprecated` | `DEPRECATED_TAG_CHECK_NAME` | 使用了已废弃 API | warning |

### 5.3 告警抑制策略

开发者可通过以下方式抑制告警（不报错）：

| 策略 | 适用标签 | 示例 |
|------|----------|------|
| try-catch 包裹 | `@since` | `try { newApi() } catch(e) {}` |
| undefined 检查 | `@since` | `if (newApi !== undefined) { newApi() }` |
| SDK 版本比较 | `@since`、`@Available` | `if (deviceInfo.sdkApiVersion >= 21) { newApi() }` |
| `@Available` 父级版本更高 | `@since`、`@Available` | 父函数 `@Available(26)` 内调用子 `@Available(24)` |
| `@SuppressWarnings` 注解 | `@since`、`@Available`、`@syscap`、`@permission` | `@SuppressWarnings({rules: [...]})` |
| `// @SuppressWarnings` 注释 | `@since`、`@Available`、`@syscap`、`@permission` | `// @SuppressWarnings compatibility` |
| `canIUse()` 条件 | `@syscap` | `if (canIUse('xxx')) { ... }` |
| 白名单 | `@since`、`@Available` | `API_INTERFACE_WHITE_LIST` 中声明的接口 |

### 5.4 版本格式

| 格式 | 示例 | 说明 |
|------|------|------|
| 整数 | `21` | 传统版本号 |
| M.S.F | `5.0.0` | 主版本.次版本.特性版本 |
| M.S.F(X) | `5.0.3(22)` | 括号内为实际比较值 |
| OS 前缀 | `OpenHarmony 21` | 带 OS 名称的版本 |

---

## 6. 全局状态依赖

本模块依赖 `main.js` 中的全局可变状态：

| 全局变量 | 用途 |
|----------|------|
| `projectConfig` | 构建配置（compatibleSdkVersion、runtimeOS、compileMode 等） |
| `systemModules` | 系统模块列表 |
| `sdkConfigs` / `extendSdkConfigs` | SDK 前缀配置 |
| `sdkConfigPrefix` | SDK 前缀（如 `ohos`） |
| `globalProgram` | TS Program 实例 |
| `ohosSystemModulePaths` / `ohosSystemModuleSubDirPaths` | OHOS 系统模块路径 |
| `allModulesPaths` | 所有模块路径 |
| `crossplatformExternalModule` | 跨平台外部模块收集 |
| `crossplatformDepsConfig` | 跨平台依赖配置 |
| `externalApiCheckPlugin` | 外部 API 检查插件 |
| `externalApiCheckerMap` | 外部 API checker 映射 |
| `externalApiMethodPlugin` | 外部 API 方法插件 |
| `fileAvailableCheckPlugin` | 文件 Available 检查缓存 |
| `fileApiAvailableCheckPlugin` | 文件 apiAvailable 检查缓存 |
| `fileDeviceCheckPlugin` | 文件 deviceInfo 检查缓存 |
| `suppressWarningsCheckPlugin` | SuppressWarnings 检查缓存 |

> **注意**：构建间必须通过 `resetMain()` 重置全局状态。本插件在 `cleanUp()` 中清理自身局部状态（`allFiles`、`appImportModuleCollection`、`useOSFiles`、`kitModules`）。

---

## 7. 外部依赖关系

### 被调用方
- `compile_plugin.js`：按固定顺序加载 apiTransform 插件
- `rollup-plugin-ets-checker.ts`（etsChecker 插件）：API 兼容性校验的触发入口，在 `buildStart()` 中调用 `configureSyscapInfo` / `configurePermission` 并通过 `serviceChecker` 创建 tsc LanguageService 注册 host 回调
- `ets_checker.ts`：`createLanguageService` 注册 host 回调（`getJsDocNodeCheckedConfig` 等），tsc 在类型检查阶段回调进入本模块的 `getJsDocNodeCheckConfig` 等

### 依赖方
- `pre_define.ts`：`NATIVE_MODULE`、`ARKUI_X_PLUGIN`、`GLOBAL_THIS_REQUIRE_NATIVE_MODULE`、`GLOBAL_THIS_REQUIRE_NAPI`
- `utils.ts`：`writeUseOSFiles`、`writeCollectionFile`、`getAllComponentsOrModules`、`LogType`、`IFileLog` 等
- `ets_checker.ts`：`appComponentCollection`、`ResolveModuleInfo`
- `ark_compiler/utils.ts`：`hasTsNoCheckOrTsIgnoreFiles`
- `ets_ui/rollup-plugin-ets-typescript.ts`：`shouldEmitJsFlagById`

---

## 8. 快速上手

### 8.1 新开发常见任务

| 任务 | 阅读文档 | 关键入口 |
|------|----------|----------|
| 修改系统 API 变换逻辑 | [01-plugin-and-transform.md](01-plugin-and-transform.md) | `processSystemApi`、`processSystemApiAndLibso` |
| 新增校验标签 | [02-define-and-permission.md](02-define-and-permission.md) + [03-check-utils.md](03-check-utils.md) | `api_check_define.ts` 加常量 + `getJsDocNodeCheckConfig` 加配置 |
| 修改版本比较逻辑 | [04-version-checker.md](04-version-checker.md) | `base_version_checker.ts` 的 `compare()` |
| 新增告警抑制策略 | [05-warning-suppressor.md](05-warning-suppressor.md) | `api_validate_node.ts` 加 Validator + 对应 suppressor |
| 修改权限表达式解析 | [02-define-and-permission.md](02-define-and-permission.md) | `api_check_permission.ts` 的 `JsDocCheckService` |
| 修改错误码/消息 | [02-define-and-permission.md](02-define-and-permission.md) | `ERROR_CODE_INFO` 映射表 |

### 8.2 开发约束

1. **禁止直接编辑 `lib/`**：必须编辑 `src/` 然后运行 `npm run build`
2. **禁止硬编码装饰器/标签名**：必须使用 `api_check_define.ts` 中的常量
3. **全局状态必须重置**：构建间通过 `resetMain()` 重置
4. **不要混淆 ESMODULE 和 JSBUNDLE**：变换逻辑因编译模式不同
5. **新增校验标签时**：需同步更新 `ERROR_CODE_INFO` 错误码映射
6. **新增告警抑制策略时**：确认 `SUPPRESSWARNINGS_RULE_INFO` 中是否需要注册

### 8.3 验证命令

```bash
# 从 compiler/ 目录执行
npm run build          # 构建，生成 lib/
npm run lint           # ESLint 检查
npm test               # 运行测试
```

---

## 9. 设计模式总结

| 模式 | 应用位置 | 说明 |
|------|----------|------|
| **策略模式** | `api_checker/` | `BaseVersionChecker` 定义算法骨架，`SinceJSDocChecker`/`AvailableAnnotationChecker` 实现具体版本解析 |
| **组合模式** | `api_validator/` | `CompositeValidator` 组合多个 `NodeValidator`，任一通过即抑制告警 |
| **模板方法** | `base_version_checker.ts` | `checkTargetVersion()` 定义流程：`parseVersion()` -> `compare()` |
| **工厂方法** | `api_check_utils.ts` | `getJsDocNodeCheckConfig` 根据文件/项目配置构建校验配置 |
| **插件架构** | `api_check_utils.ts` | `initComparisonFunctions` 从外部插件加载版本比较/格式校验函数 |
