# 02 - 常量定义与权限校验

> 文件：`api_check_define.ts`、`api_check_permission.ts`

---

## Part A: api_check_define.ts

本文件是 API 校验子系统的 **常量与类型定义中心**，所有校验标签名、错误消息、错误码、接口和枚举都定义在此。

### 1. 校验标签常量

| 常量 | 值 | 用途 |
|------|----|------|
| `PERMISSION_TAG_CHECK_NAME` | `permission` | 权限校验标签 |
| `SYSTEM_API_TAG_CHECK_NAME` | `systemapi` | 系统 API 标签 |
| `TEST_TAG_CHECK_NAME` | `test` | 测试专用标签 |
| `SYSCAP_TAG_CHECK_NAME` | `syscap` | 设备能力集标签 |
| `FORM_TAG_CHECK_NAME` | `form` | 卡片场景标签 |
| `CROSSPLATFORM_TAG_CHECK_NAME` | `crossplatform` | 跨平台标签 |
| `DEPRECATED_TAG_CHECK_NAME` | `deprecated` | 已废弃标签 |
| `FA_TAG_CHECK_NAME` | `famodelonly` | FA 模式专用标签 |
| `FA_TAG_HUMP_CHECK_NAME` | `FAModelOnly` | FA 模式专用标签（驼峰） |
| `STAGE_TAG_CHECK_NAME` | `stagemodelonly` | Stage 模式专用标签 |
| `STAGE_TAG_HUMP_CHECK_NAME` | `StageModelOnly` | Stage 模式专用标签（驼峰） |
| `ATOMICSERVICE_TAG_CHECK_NAME` | `atomicservice` | AtomicService 标签 |
| `SINCE_TAG_NAME` | `since` | API 引入版本标签 |
| `AVAILABLE_TAG_NAME` | `available` | @Available 装饰器标签 |

### 2. 错误消息模板

错误消息中使用 `$SINCE1`、`$SINCE2`、`$DT`、`$RUNTIMEOS`、`$OSNAME`、`$VERSION` 等占位符，运行时替换。

```typescript
export const SINCE_TAG_CHECK_ERROR = `The '{0}' API is supported since SDK version $SINCE1.
 However, the current compatible SDK version is $SINCE2...`;
// $SINCE1 = API 要求的最低版本
// $SINCE2 = 项目兼容 SDK 版本

export const PERMISSION_TAG_CHECK_ERROR = "To use this API, you need to apply for the permissions: $DT";
// $DT = 缺失的权限列表
```

### 3. 错误码映射 ERROR_CODE_INFO

`ERROR_CODE_INFO` 是 `Map<string, {code, description, solutions}>`，将错误消息模板映射到错误码和处理建议。

| 错误码 | 消息常量 | 描述 |
|--------|----------|------|
| 11706006 | `FORM_TAG_CHECK_ERROR` | 卡片不支持 |
| 11706007 | `CROSSPLATFORM_TAG_CHECK_ERROR` | 跨平台不支持 |
| 11706008 | `FA_TAG_CHECK_ERROR` | FA 模式接口用于 Stage |
| 11706009 | `STAGE_TAG_CHECK_ERROR` | Stage 模式接口用于 FA |
| 11706010 | `ATOMICSERVICE_TAG_CHECK_ERROR` | AtomicService 不支持 |
| 11706011 | `SINCE_TAG_CHECK_ERROR` | API 版本不满足 |
| 11706012 | `AVAILABLE_DECORATOR_WARNING` | @Available 版本不满足 |
| 11706013 | `APIAVAILABLE_CHECK_ERROR` | apiAvailable 参数无效 |
| 11706014 | `APIAVAILABLE_DISTRIBUTIONOS_CONTENT_CHECK_ERROR` | apiAvailable DistributionOS 参数无效 |
| 11706015 | `APIAVAILABLE_TS_FILE_ERROR` | apiAvailable 不能用于 .ts 文件 |
| 11706016 | `AVAILABLE_VERSION_FORMAT_ERROR_PREFIX` | @Available 版本格式错误 |
| 11706017 | `AVAILABLE_OSNAME_ERROR` | @Available OS 名称错误 |

**`DIAGNOSTIC_SDK_CODE_MAP`**：SDK 子系统代码映射，key 为 `'28007'`。

### 4. 告警抑制规则映射

```typescript
// 标签名 -> 抑制规则关键字
SUPPRESSWARNINGS_RULE_INFO = Map {
  'since'      -> 'SuppressWarnings',
  'available'  -> 'SuppressWarnings',
  'syscap'     -> 'SuppressWarnings',
  'permission' -> 'SuppressWarnings'
}

// 标签名 -> @SuppressWarnings 注解中的规则类型
ANNOTATION_RULE_INFO = Map {
  'since'      -> 'SuppressWarningsType.COMPATIBILITY',
  'available'  -> 'SuppressWarningsType.COMPATIBILITY',
  'syscap'     -> 'SuppressWarningsType.SYSCAP',
  'permission' -> 'SuppressWarningsType.PERMISSION'
}
```

> 只有在这两个 Map 中注册的标签名，才支持 `@SuppressWarnings` 注解/注释抑制。

### 5. 核心接口与枚举

#### 5.1 版本比较相关

```typescript
// 比较结果
enum ComparisonResult { Less = -1, Equal = 0, Greater = 1 }

// 触发场景
enum ComparisonSenario {
  Trigger = 0,           // 生成告警
  SuppressByOHVersion = 1,    // 抑制：OpenHarmony 版本比较
  SuppressByOtherOSVersion = 2 // 抑制：非OH OS 版本比较
}

// 版本比较函数类型
type ValueCheckerFunction = (sinceVersion, targetVersion, triggerScene) => VersionValidationResult
type FormatCheckerFunction = (version: string) => VersionValidationResult

// 解析后的版本结构
interface ParsedVersion {
  os?: string;          // OS 名称
  version: string;      // 版本号
  formatVersion: string; // 格式化版本（含 OS）
  raw: string;          // 原始字符串
}
```

#### 5.2 设备差异类型

```typescript
enum DeviceDiffType {
  SINCE = 'since',
  SYSCAP = 'syscap',
  NONE = 'none'
}
```

#### 5.3 跨平台合并类型

```typescript
enum MergeCrossplatformModuleType {
  MODULE = 'module',
  COMPONENT = 'component'
}

interface CrossplatformModuleData {
  module: string[];
  component: string[];
}
```

#### 5.4 错误诊断相关

```typescript
interface SdkHvigorLogInfo {
  code: string;
  description: string;
  cause: string;
  position: string;
  solutions: string[];
  moreInfo?: { cn: string; en: string };
}

class SdkHvigorErrorInfo implements SdkHvigorLogInfo { ... }

class BuildDiagnosticInfo {
  code: number;
  description: string;
  positionMessage: string;
  message: string;
  solutions: string[];
  // setCode/getCode/setDescription/... 链式 setter
}
```

#### 5.5 @since 告警级别配置

```typescript
SINCE_LEVEL_WARNING = 'warn'
SINCE_LEVEL_ERROR = 'error'

SINCE_LEVEL_CONFIG = Map {
  'warn'  -> ts.DiagnosticCategory.Warning,
  'error' -> ts.DiagnosticCategory.Error
}
```

开发者可在 `build-profile.json5` 中配置 `apiCompatibilityCheck` 改变 @since 告警级别。

### 6. 白名单

本模块定义了两个白名单，用途不同：

#### 6.1 API_INTERFACE_WHITE_LIST（接口白名单）

```typescript
// API 接口白名单：文件名 -> 允许的 API 名称列表
API_INTERFACE_WHITE_LIST = Map {
  '@arkts.lang.d.ets': ['RetentionPolicy', 'Retention', 'SOURCE', 'BYTECODE'],
  '@ohos.deviceInfo.d.ts': ['apiAvailable']
}
```

**用途**：用于 `WhiteListValidator` 的告警抑制（见 [05-warning-suppressor.md](05-warning-suppressor.md) §4.8）。

**匹配规则**：
1. 取 API 声明所在的源文件路径
2. 将该路径相对于 `projectConfig.globalModulePaths` 取相对路径，统一为正斜杠
3. 用相对路径作为 key 查询 `API_INTERFACE_WHITE_LIST`
4. 检查 API 名称是否在返回的列表中

**匹配示例**：
```
声明文件: /sdk/@arkts.lang.d.ets
globalModulePaths: ['/sdk/']
相对路径: @arkts.lang.d.ets
API 名称: RetentionPolicy
→ 命中白名单，抑制 @since 告警
```

**使用场景**：仅用于 `@since` 告警抑制。某些 SDK 内部接口（如 `@arkts.lang` 的注解相关接口、`deviceInfo.apiAvailable`）本身不需要版本兼容性检查，通过白名单跳过。

#### 6.2 GLOBAL_DECLARE_WHITE_LIST（全局声明白名单）

```typescript
// 全局声明白名单：允许在 .ts 文件中使用的全局类型名
GLOBAL_DECLARE_WHITE_LIST = Set {
  'Context', 'PointerStyle', 'PixelMap', 'UnifiedData',
  'Summary', 'UniformDataType', 'IntentionCode', 'NavDestinationInfo',
  'UIContext', 'Resource', 'WebviewController'
}
```

**用途**：用于 `checkTypeReference()`（见 [03-check-utils.md](03-check-utils.md)）的类型引用检查。

**匹配规则**：
1. 仅对 `.ts` 文件生效（`.d.ts` 和 `.ets` 不检查）
2. 检查类型引用的声明来源是否为 OHOS 系统模块路径（`ohosSystemModulePaths`）
3. 如果类型名在 `GLOBAL_DECLARE_WHITE_LIST` 中，且声明来自系统模块，则产生 "Cannot find name 'xxx'" 告警

**使用场景**：`.ts` 文件中不应直接引用 OHOS 系统模块中定义的全局类型。这些类型（如 `Context`、`Resource`、`PixelMap` 等）虽然被声明为全局可用，但在 `.ts` 文件中引用时会导致编译问题，因此需要告警提示。

> **注意**：两个白名单的作用方向相反 —— `API_INTERFACE_WHITE_LIST` 是**放行**（抑制告警），`GLOBAL_DECLARE_WHITE_LIST` 是**拦截**（产生告警）。

### 7. 常量速查

| 常量 | 值 | 说明 |
|------|----|------|
| `RUNTIME_OS_OH` | `'OpenHarmony'` | OpenHarmony 运行时标识 |
| `CANIUSE_FUNCTION_NAME` | `'canIUse'` | canIUse 函数名 |
| `VERSION_CHECK_FUNCTION_NAME` | `'isApiVersionGreaterOrEqual'` | 版本检查函数名 |
| `AVAILABLE_FILE_NAME` | `'@ohos.annotation.d.ets'` | @Available 装饰器声明文件 |
| `STAGE_COMPILE_MODE` | `'moduleJson'` | Stage 模式编译标识 |
| `ATOMICSERVICE_BUNDLE_TYPE` | `'atomicService'` | AtomicService 包类型 |
| `ATOMICSERVICE_TAG_CHECK_VERSION` | `11` | AtomicService 校验起始版本 |
| `MSF_INTEGER_VERSION` | `26` | M.S.F 格式与整数格式的分界版本 |
| `MSF_SANDF_VERSION` | `99` | M.S.F 中 S 和 F 的最大值 |
| `SDK_SUBSYSTEM_CODE` | `'117'` | SDK 子系统代码 |
| `ERROR_DESCRIPTION` | `'ArkTS Compiler Error'` | 错误描述前缀 |
| `CONSTANT_STEP_0/1/2/3` | `0/1/2/3` | 数组索引常量 |

### 8. 版本比较函数缓存

```typescript
export const comparisonFunctions = {
  valueChecker: new Map<string, ValueCheckerFunction>(),   // key: "OpenHarmony/since"
  formatChecker: new Map<string, FormatCheckerFunction>()  // key: "OpenHarmony/available"
};
```

由 `initComparisonFunctions()` 初始化，支持从外部插件加载或使用默认实现。

---

## Part B: api_check_permission.ts

本文件实现 `JsDocCheckService`，用于解析和求值 `@permission` JSDoc 标签中的权限表达式。

### 1. 权限表达式语法

```
@permission ohos.permission.A
@permission ohos.permission.A and ohos.permission.B
@permission ohos.permission.A or ohos.permission.B
@permission (ohos.permission.A or ohos.permission.B) and ohos.permission.C
```

支持运算符：
- `and`：与（两个权限都需要）
- `or`：或（任一权限即可）
- `()`：括号分组

### 2. 核心类 JsDocCheckService

```typescript
export class JsDocCheckService {
  // 入口：校验权限表达式是否满足
  static validPermission(comment: string, permissionsArray: string[]): boolean
}
```

**参数**：
- `comment`：`@permission` 标签的注释内容（权限表达式）
- `permissionsArray`：项目配置中申请的权限列表

**返回**：`true` = 权限满足，`false` = 权限不满足

### 3. 解析算法

```
STEP1: 分词
  ├─ 按空格分割
  ├─ 按 '(' 分割
  ├─ 按 ')' 分割
  └─ 按 '\n' 分割
  → 得到 token 队列 permissionsQueue

STEP2: 递归求值
  ├─ 如果队列含 '(' ')' → groupWithParenthesis 分组
  │   ├─ 括号内子队列递归求值
  │   └─ 括号外正常处理
  └─ 如果不含括号 → getPermissionVaildAtoms 原子求值
```

### 3.1 状态机

```typescript
enum PermissionVaildTokenState {
  Init,              // 初始
  LeftParenthesis,  // 左括号
  RightParenthesis, // 右括号
  PermissionChar,   // 权限名
  And,              // and 运算符
  Or,               // or 运算符
}

interface PermissionVaildCalcInfo {
  valid: boolean;                  // 最终结果
  currentToken: PermissionVaildTokenState; // 当前 token 类型
  finish: boolean;                 // 是否结束
  currentPermissionMatch: boolean; // 当前匹配结果
}
```

### 3.2 求值逻辑

- **and 运算**：`inValidAndExpression` — 前后两个权限都必须满足
- **or 运算**：`inValidOrExpression` — 前后两个权限只要有一个满足即可
- **单个权限**：`validPermissionItem` — 检查权限名是否在 `permissionsArray` 中

### 4. 使用场景

在 `api_check_utils.ts` 的 `checkPermissionValue` 中调用：

```typescript
if (JsDocCheckService.validPermission(comment, permissionsArray)) {
  continue; // 权限满足，不报错
}
// 权限不满足，收集错误信息
```

### 5. PermissionModule 接口

```typescript
export interface PermissionModule {
  modulePath: string;
  testPermissions: string[];  // 测试权限
  permissions: string[];       // 正式权限
}
```

### 6. 注意事项

1. **空白 token 过滤**：分词后过滤空字符串
2. **括号嵌套**：支持多层括号嵌套，通过 `groupWithParenthesis` 递归处理
3. **权限名匹配**：精确匹配，`atomStackItem === ''` 视为满足（兼容空 token）
4. **版本范围**：`@permission` 标签支持 `[since x.y.z - a.b.c]` 版本范围，由 `checkPermissionValue` 中先提取版本范围再求值
