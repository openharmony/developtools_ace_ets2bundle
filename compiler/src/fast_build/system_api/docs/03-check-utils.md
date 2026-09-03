# 03 - 核心校验工具

> 文件：`api_check_utils.ts`（2848 行，本模块最大的文件）

本文件是 API 兼容性校验子系统的 **核心枢纽**，承担以下职责：
1. 构建 JSDoc 校验配置（`getJsDocNodeCheckConfig`）
2. 各标签的 check 回调函数
3. 版本比较与格式校验函数（含插件系统）
4. `@Available` 装饰器解析
5. `apiAvailable()` API 校验
6. 错误诊断信息构建

---

## 1. 配置构建：getJsDocNodeCheckConfig

这是被 `ets_checker.ts` 调用的核心入口，根据文件路径和项目配置构建 JSDoc 校验配置。

```typescript
export function getJsDocNodeCheckConfig(fileName: string, sourceFileName: string): ts.JsDocNodeCheckConfig
```

### 1.0 入参说明

本函数由 tsc 在 JSDoc 校验阶段通过自定义 LanguageServiceHost 回调调用。调用链如下：

**tsc 侧（`third_party_typescript/src/compiler/checker.ts`）**：

```typescript
// 1. 每次校验一个源文件时，记录当前文件名
function checkSourceFile(node: SourceFile) {
  jsDocFileCheckInfo = host.getFileCheckedModuleInfo(node.fileName);
  jsDocFileCheckInfo.currentFileName = node.fileName;  // ← 引用方文件
  checkSourceFileWorker(node);
}

// 2. 遇到标识符引用时，找到其声明文件，调用回调获取校验配置
function checkIdentifierJsDoc(node: Identifier, sourceSymbol: Symbol): void {
  const sourceSymbolSourceFile = getSourceFileOfNode(sourceSymbol.valueDeclaration);  // ← 声明方文件
  const checkParam = getJsDocNodeCheckedConfig(jsDocFileCheckInfo, sourceSymbolSourceFile.fileName);
  ...
  sourceSymbol.declarations?.forEach(declaration => {
    expressionCheckByJsDoc(declaration, node, sourceFile, checkParam.checkConfig);
    //                     ↑ 声明        ↑ 引用节点  ↑ 引用方源文件
  });
}
```

**ets_checker 侧（透传）**：

```typescript
getJsDocNodeCheckedConfig: (fileCheckedInfo: ts.FileCheckModuleInfo, sourceFileName: string) => {
  return getJsDocNodeCheckConfig(fileCheckedInfo.currentFileName, sourceFileName);
},
getFileCheckedModuleInfo: (containFilePath: string) => {
  return { fileNeedCheck: true, checkPayload: undefined, currentFileName: containFilePath };
},
```

**参数语义**：

| 参数 | 来源 | 角色 | 含义 | 示例 |
|------|------|------|------|------|
| `fileName` | `fileCheckedInfo.currentFileName` ← `checkSourceFile(node)` 的 `node.fileName` | **引用方** | tsc 当前正在校验的源文件，即包含 API 调用标识符的编译文件 | 项目源文件：`/project/src/main/ets/pages/Index.ets` |
| `sourceFileName` | `sourceSymbolSourceFile.fileName` ← `getSourceFileOfNode(sourceSymbol.valueDeclaration)` | **声明方** | 被引用 API 的声明所在文件，即含 JSDoc 标签的声明文件 | SDK 声明：`/sdk/@ohos.network.d.ts`；项目模块：`/project/src/main/ets/utils/Helper.ets` |

> 简言之：`fileName` 是"谁在用"，`sourceFileName` 是"用的东西声明在哪"。JSDoc 标签从声明方（`sourceFileName`）的 declaration 上读取（见 `expressionCheckByJsDoc` 中的 `getJSDocTags(declaration)`），而校验条件（卡片/测试目录/编译模式等）取决于引用方（`fileName`）的项目上下文。

**调用场景示例**：

- 项目文件引用 SDK API：`Index.ets` 调用 `@ohos.network.d.ts` 中的接口
  - `getJsDocNodeCheckConfig("Index.ets", "@ohos.network.d.ts")`
  - 校验 `@ohos.network.d.ts` 声明上的 `@since`/`@syscap` 等标签在 `Index.ets` 的项目配置下是否合规

- 项目文件引用项目文件：`Index.ets` 引用 `Helper.ets` 中带 `@Available` 的函数
  - `getJsDocNodeCheckConfig("Index.ets", "Helper.ets")`
  - 校验 `Helper.ets` 声明上的 `@Available` 装饰器版本是否兼容

- 当引用方与声明方为同一文件时（文件内部自引用），两参数相同

**入参在函数内的用途**：

| 参数 | 角色 | 派生值 | 用途 |
|------|------|--------|------|
| `fileName` | 引用方 | `path.basename(fileName)` → `apiName` | 判断引用方本身是否为系统模块（`systemModules.includes(apiName)`）→ 是则跳过全部校验 |
| `fileName` | 引用方 | `/(?<!\.d)\.ts$/g.test(fileName)` | 判断引用方是否为 `.ts` 文件 → 配合声明方为 ArkUI 依赖时，添加 "Cannot find name" 校验 |
| `fileName` | 引用方 | `isCardFile(fileName)` | 判断引用方是否为卡片入口文件 → 添加 `@form` 校验 |
| `fileName` | 引用方 | `ts.sys.resolvePath(fileName)` | 判断引用方是否在 `ohosTest` 目录外 → 添加 `@test` 校验 |
| `sourceFileName` | 声明方 | `isArkuiDependence(sourceFileName)` | 判断声明方是否为 ArkUI 声明文件 → 添加 "Cannot find name" 校验 / 全量标签校验 |
| `sourceFileName` | 声明方 | `checkFileHasAvailableByFileName(sourceFileName)` | 判断声明方是否为含 `@Available` 的项目文件 → 添加 `@Available` 校验 |
| `sourceFileName` | 声明方 | `allModulesPaths.includes(sourceFileName)` | 判断声明方是否为项目模块 → 添加全量标签校验 |
| `sourceFileName` | 声明方 | `path.basename(sourceFileName)` → `sourceBaseName` | 排除 `common_ts_ets_api.d.ts`、`global.d.ts`、`@ohos.annotation.d.ets` |

### 1.1 配置构建流程

```
getJsDocNodeCheckConfig(fileName, sourceFileName)
  │
  ├─ 1. 检查缓存 jsDocNodeCheckConfigCache
  │     (Map<fileName, Map<sourceFileName, config>>)
  │
  ├─ 2. .ts 文件且引用了 ArkUI 依赖 → getFindModuleCheckConfig
  │     （"Cannot find name 'xxx'" 检查）
  │
  ├─ 3. systemModules 中有该 API → 直接返回空配置
  │
  ├─ 4. 文件含 @Available → getAvailableCheckConfig
  │     （@Available 装饰器版本检查）
  │
  └─ 5. 否则，按条件添加各标签配置：
       ├─ getDeprecatedCheckConfig     (始终)
       ├─ getSystemApiCheckConfig      (始终)
       ├─ getSinceCheckConfig          (始终，非 @ohos.annotation.d.ets)
       ├─ getSyscapCheckConfig         (有 deviceTypes 时)
       ├─ getTestCheckConfig           (非 ohosTest 目录)
       ├─ getPermissionCheckConfig     (始终)
       ├─ getFormCheckConfig           (卡片文件时)
       ├─ getCrossplatformCheckConfig  (跨平台编译时)
       ├─ getFAModuleCheckConfig       (FA 模式编译时)
       │   / getStageModuleCheckConfig (Stage 模式编译时)
       └─ getAtomicserviceCheckConfig  (AtomicService + 版本>=11 时)
```

### 1.2 配置项结构

每个 check 配置是一个 `JsDocNodeCheckConfigItemInterface`：

```typescript
interface JsDocNodeCheckConfigItemInterface {
  tagName: string[];                          // 要检查的标签名
  message: string;                            // 错误消息模板
  type: ts.DiagnosticCategory;                // Warning / Error
  tagNameShouldExisted: boolean;              // true=标签应存在(不存在则报错), false=标签不应存在
  checkJsDocSuppressorValidCallback?: (jsDocTags, config, node?, declaration?) => boolean
  // 告警抑制回调：返回 true 表示需要告警，false 表示无需告警
}
```

### 1.3 缓存机制

```typescript
const jsDocNodeCheckConfigCache: Map<string, Map<string, ts.JsDocNodeCheckConfig>>
```

两级缓存：`fileName -> sourceFileName -> config`，避免重复构建配置。

---

## 2. Check 回调函数

每个 check 回调函数签名统一：`(jsDocTags, config, node?, declaration?) => boolean`，返回 `true` 表示**需要告警**，`false` 表示**无需告警**。

### 2.1 checkSinceValue

```typescript
function checkSinceValue(jsDocTags, config, node, declaration): boolean
```

**流程**：
1. 检查前置条件（有 `@since` 标签、有 `compatibleSdkVersion`、有 node/declaration）
2. 创建 `SinceJSDocChecker`，调用 `checkTargetVersion(jsDocNode)`
3. 如果不兼容（返回 true），创建 `SinceWarningSuppressor`
4. 调用 `suppressor.isApiVersionHandled(node)` 检查是否被抑制
5. 填充错误消息（替换 `$SINCE1`、`$SINCE2`）
6. 返回是否需要告警

### 2.2 checkAvailableDecorator

```typescript
function checkAvailableDecorator(jsDocTags, config, node, declaration): boolean
```

与 `checkSinceValue` 类似，但使用 `AvailableAnnotationChecker` 和 `AvailableWarningSuppressor`。

额外逻辑：
- 节点去重缓存 `availableNodeCheckConfigCache`
- 检查源文件和声明文件都在项目根目录下

### 2.3 checkPermissionValue

```typescript
function checkPermissionValue(jsDocTags, config, node, declaration): boolean
```

**流程**：
1. 过滤出 `@permission` 标签
2. 对每个权限标签：
   - 提取版本范围 `[since x - y]`，如果不在范围内则跳过
   - 调用 `JsDocCheckService.validPermission` 求值权限表达式
   - 如果权限满足，跳过
   - 否则创建 `PermissionWarningSuppressor` 检查是否被抑制
3. 收集所有未满足的权限，拼接错误消息

### 2.4 checkSyscapAbility

```typescript
export function checkSyscapAbility(jsDocTags, config, node, declaration): boolean
```

**流程**：
1. 提取 `@syscap` 标签值
2. 检查是否在 `syscapIntersectionSet` 中（默认不在则需要告警）
3. 如果需要告警，创建 `SyscapWarningSuppressor` 检查抑制
4. 如果默认不需要告警，检查外部 `externalApiCheckerMap` 扩展校验器

### 2.5 check 回调

| 函数 | 标签 | 逻辑摘要 |
|------|------|----------|
| `checkSystemApiValue` | `@systemapi` | 有标签则告警；支持版本范围检查 |
| `checkFormValue` | `@form` | 卡片场景有标签则告警 |
| `checkCrossplatformValue` | `@crossplatform` | 跨平台场景有标签则告警 + 收集外部模块 |
| `checkAtomicserviceValue` | `@atomicservice` | AtomicService 场景有标签则告警 |
| `checkFaModelOnlyValue` | `@famodelonly` | Stage 模式下有标签则告警 |
| `checkStageModuleValue` | `@stagemodelonly` | FA 模式下有标签则告警 |
| `checkTestValue` | `@test` | 非 ohosTest 目录有标签则告警 |
| `checkCrossplatformValueMerge` | `@crossplatform` | 内部逻辑，配合外部模块收集 |

### 2.6 版本范围提取

```typescript
function extractVersionRange(commentText): { start: string, end: string } | undefined
// 匹配 [since x.y.z - a.b.c] 格式

function checkVersionRangeIntersection(versionRange): boolean
// 检查版本范围是否与项目 SDK 版本范围相交
```

---

## 3. 版本比较函数

### 3.1 核心比较

```typescript
export function comparePointVersion(firstVersion: string, secondVersion: string): ComparisonResult
```

逐段比较 M.S.F 版本号，返回 `Less(-1)` / `Equal(0)` / `Greater(1)`。

支持格式：
- 整数：`21` → `[21, 0, 0]`
- M.S.F：`5.0.0` → `[5, 0, 0]`
- 遇到 NaN 返回 `Less`

### 3.2 格式校验函数

| 函数 | 用途 | 规则 |
|------|------|------|
| `defaultFormatChecker` | 通用格式校验 | 主版本 1-999，可选次版本和补丁版本 |
| `defaultFormatCheckerCompatibileIntegerAndMSF` | OpenHarmony 格式校验 | 整数 1-999 或 M.S.F，M>=26 |
| `checkMSFVersionMajor` | M.S.F 主版本校验 | M.S.F 格式时 M 必须 >= 26 |
| `checkIntegerMoreVersion` | 整数版本校验 | 整数格式时必须 < 26 |

### 3.3 版本解析

```typescript
export function parseVersionString(raw: string): ParsedVersion | null
// "21" → { os: "OpenHarmony", version: "21" }
// "OpenHarmony 5.0.0" → { os: "OpenHarmony", version: "5.0.0" }
// "5.0.3(22)" → { os: "OpenHarmony", version: "5.0.3(22)" }

export function extractMinApiFromDecorator(dec): ParsedVersion | null
// 从 @Available({minApiVersion: "21"}) 装饰器中提取版本
```

---

## 4. 插件系统

本模块支持从外部插件加载版本比较和格式校验函数。

### 4.1 初始化

```typescript
export function initComparisonFunctions(): void
```

为每个 OS + tag 组合初始化 valueChecker 和 formatChecker：

```
for tag in ['since', 'available']:
  initValueChecker(osName, tag)
  if tag === 'available':
    initFormatChecker(osName, tag)
```

### 4.2 插件加载

```typescript
export function initValueChecker(osName: string, tag: string): void
```

插件 key 格式：`{osName}/{tag}/CompatibilityCheck`（新格式）或 `{osName}/{tag}`（旧格式）

**加载策略**：
1. 先尝试新格式 key
2. 再尝试旧格式 key
3. 从 `externalApiCheckPlugin` 获取插件路径
4. `require(plugin.path)` 加载，取 `plugin.functionName`
5. 失败则使用默认实现 `defaultValueChecker`

### 4.3 获取函数

```typescript
export function getValueChecker(tag: string): ValueCheckerFunction
// key: `${runtimeOS}/${tag}`，回退到 defaultValueChecker

export function getFormatChecker(tag: string = 'available'): FormatCheckerFunction
// key: `${runtimeOS}/${tag}`，回退到 defaultFormatCheckerCompatibileIntegerAndMSF
```

### 4.4 闭源版本检查

```typescript
export function isCheckDistributionOSVersion(tag: string, version: string): DistributionOSApiAvailableVersionResult
```

调用闭源脚本（通过 `externalApiCheckPlugin`）匹配 DistributionOS 的 apiAvailable 版本号。

---

## 5. @Available 装饰器处理

### 5.1 装饰器识别

```typescript
export const isAvailableDecorator = (decorator: ts.Decorator): boolean
```

判断条件：
1. 装饰器名为 `Available`
2. 能提取 `minApiVersion` 属性
3. 版本格式校验通过

### 5.2 装饰器查找

```typescript
export function getValidDecoratorFromNode(node, predicate): ts.Decorator | null
```

递归向上查找节点及其父节点的装饰器，支持 `ts.canHaveDecorators` 和 `ts.canHaveIllegalDecorators` 两种情况。

### 5.3 版本层级校验

```typescript
export function isSourceRetentionAnnotationContentValid(annotation): ts.ConditionCheckResult
```

检查 `@Available` 装饰器的内容：
1. 校验 `minApiVersion` 格式
2. 检查父节点是否有更高版本（`checkParentVersionHierarchy`）
3. 如果父节点版本更高，返回 `AVAILABLE_SCOPE_ERROR`（不必要的内层注解）

### 5.4 版本比较

```typescript
export function compareVersions(parentAvailableVersion, curAvailableVersion): boolean
```

根据 OS 类型选择场景：
- OpenHarmony → `ComparisonSenario.SuppressByOHVersion`
- 非OH OS → `ComparisonSenario.SuppressByOtherOSVersion`

---

## 6. apiAvailable() 校验

### 6.1 语句识别

```typescript
export function isApiAvailableStatement(node: ts.Node): boolean
// 通过 typeChecker 检查是否为 deviceInfo.apiAvailable() 调用

export function isApiAvailableGetTypeOfNodeStatement(node, typeOfNodeFunc): boolean
// 类似，但通过外部传入的 typeOfNodeFunc 获取类型
```

### 6.2 规范校验

```typescript
export function isApiAvailableVersionSpecifications(node, typeOfNodeFunc): ts.ConditionCheckResult
```

**校验内容**：
1. 缓存检查 `checkApiAvailableCache`：文件内容是否含 `.apiAvailable`
2. 节点类型检查：必须是 CallExpression
3. 参数检查：必须有 1 个参数
4. 类型检查：必须是 `deviceInfo.apiAvailable`
5. 参数格式校验：委托给 `validateApiAvailableArgument`

### 6.3 ts 文件限制

```typescript
// apiAvailable 不能用于 .ts 文件
APIAVAILABLE_TS_FILE_ERROR = 'apiAvailable cannot be used in .ts files. Please use .ets files instead.'
```

---

## 7. 工具函数

### 7.1 文件判断

| 函数 | 用途 |
|------|------|
| `isCardFile(file)` | 判断是否为卡片入口文件 |
| `isArkuiDependence(file)` | 判断是否为 ArkUI 声明文件路径（带缓存 `arkuiDependenceMap`） |
| `checkFileHasAvailableByFileName(sourceFileName)` | 判断项目文件内容是否含 `@Available`（带缓存 `fileAvailableCheckPlugin`） |

### 7.2 类型检查

```typescript
export function checkTypeReference(node: ts.TypeReferenceNode, transformLog: IFileLog): void
// .ts 文件中引用 ArkUI 依赖类型时告警
```

### 7.3 模块路径

```typescript
export function getRealModulePath(apiDirs, moduleName, exts): ResolveModuleInfo
// 在 apiDirs 中查找 moduleName + ext 的真实路径

export function moduleRequestCallback(moduleRequest, _, moduleType, systemKey): string
// 处理扩展 SDK 模块的请求路径，含 @bundle 版本检查
```

### 7.4 Syscap 配置

```typescript
export function configureSyscapInfo(config: SystemConfig): void
// 从 device-define/*.json 读取设备 SysCap 列表
// 计算 syscapIntersectionSet（交集）和 syscapUnionSet（并集）
```

### 7.5 权限配置

```typescript
export function configurePermission(config: PermissionsConfig): void
// 从配置中提取 requestPermissions 和 definePermissions
```

### 7.6 错误诊断

```typescript
export function sdkBuildErrorInfoFromDiagnostic(positionMessage, message): SdkHvigorErrorInfo | undefined
// 将 tsc 诊断信息转换为 hvigor 格式错误

function buildErrorDiagnostic(positionMessage, message): BuildDiagnosticInfo | undefined
// 根据 message 中的 error code 查找 ERROR_CODE_INFO，构建诊断信息

function processDescriptionPlaceholders(code, cause, description): string
// 处理描述中的 $ApiVersion 占位符
```

---

## 8. 关键函数索引

| 函数 | 行号 | 职责 |
|------|------|------|
| `getJsDocNodeCheckConfig` | :908 | **核心入口**：构建 JSDoc 校验配置 |
| `getAvailableCheckConfig` | :541 | 构建 @Available 校验配置 |
| `getSinceCheckConfig` | :593 | 构建 @since 校验配置 |
| `getPermissionCheckConfig` | :646 | 构建 @permission 校验配置 |
| `checkSinceValue` | :1225 | @since check 回调 |
| `checkAvailableDecorator` | :1157 | @Available check 回调 |
| `checkPermissionValue` | :1695 | @permission check 回调 |
| `checkSyscapAbility` | :1603 | @syscap check 回调 |
| `comparePointVersion` | :2137 | 版本比较 |
| `parseVersionString` | :2293 | 版本字符串解析 |
| `extractMinApiFromDecorator` | :2332 | 从 @Available 提取版本 |
| `initComparisonFunctions` | :1408 | 初始化插件系统 |
| `getValueChecker` | :1512 | 获取版本比较函数 |
| `getFormatChecker` | :1526 | 获取格式校验函数 |
| `isApiAvailableStatement` | :2771 | 识别 apiAvailable() 调用 |
| `isApiAvailableVersionSpecifications` | :2539 | apiAvailable 规范校验 |
| `checkFileHasAvailableByFileName` | :2720 | 文件含 @Available 检查 |
| `configureSyscapInfo` | :1049 | SysCap 配置初始化 |
| `sdkBuildErrorInfoFromDiagnostic` | :2259 | 错误诊断构建 |
