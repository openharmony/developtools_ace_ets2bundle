# 05 - 告警抑制系统（组合模式）

> 目录：`api_validator/`
> 文件：`base_warning_suppressor.ts`、`*_warning_suppressor.ts`、`api_validate_node.ts`、`api_validate_utils.ts`、`apiAvailable_validate_utils.ts`

---

## 1. 设计概览

本目录实现告警抑制（warning suppression）系统，使用 **组合模式** 将多种抑制策略组合使用。

```
BaseWarningSuppressor (抽象基类)
  │  validators: CompositeValidator
  │
  ├── SinceWarningSuppressor       (@since)
  │     ├── TryCatchValidator
  │     ├── UndefinedCheckValidator
  │     ├── WhiteListValidator
  │     ├── AvailableComparisonValidator
  │     ├── SdkComparisonValidator
  │     ├── AnnotateSuppressWarningsValidator  (基类提供)
  │     └── CommentSuppressWarningsValidator   (基类提供)
  │
  ├── AvailableWarningSuppressor   (@Available)
  │     ├── AvailableComparisonValidator
  │     ├── SdkComparisonValidator
  │     ├── AnnotateSuppressWarningsValidator  (基类提供)
  │     └── CommentSuppressWarningsValidator   (基类提供)
  │
  ├── PermissionWarningSuppressor  (@permission)
  │     ├── AnnotateSuppressWarningsValidator  (基类提供)
  │     └── CommentSuppressWarningsValidator   (基类提供)
  │
  └── SyscapWarningSuppressor      (@syscap)
        ├── CanIUseValidator
        ├── AnnotateSuppressWarningsValidator  (基类提供)
        └── CommentSuppressWarningsValidator   (基类提供)
```

**核心思想**：
- `CompositeValidator` 组合多个 `NodeValidator`
- 任一 Validator 通过即抑制告警（OR 逻辑）
- 每种告警类型（since/available/permission/syscap）选择不同的 Validator 组合

---

## 2. 核心接口与基类

### 2.1 NodeValidator 接口

```typescript
export interface NodeValidator {
  validate(node: ts.Node): boolean;  // true = 抑制告警, false = 不抑制
  addValidator?(validator: NodeValidator[]): void;
}
```

### 2.2 CompositeValidator

```typescript
export class CompositeValidator implements NodeValidator {
  constructor(private validators: NodeValidator[]) {}

  validate(node: ts.Node): boolean {
    return this.validators.some(validator => validator.validate(node));
    // 任一通过即返回 true
  }

  addValidator(validator: NodeValidator[]): void {
    this.validators.push(...validator);
  }
}
```

### 2.3 BaseValidator 抽象基类

提供所有 Validator 共用的工具方法：

```typescript
export abstract class BaseValidator {
  protected findParentNode(node, predicate): ts.Node | null
  // 向上遍历 AST 查找匹配的父节点

  protected getPrimaryNameFromNode(node): string | undefined
  // 提取节点的主要标识符名称

  protected isUndefinedNode(node): boolean
  // 判断是否为 undefined 字面量

  protected isTargetNode(node, name): boolean
  // 判断节点是否匹配目标名称

  protected isNodeInIfThenBlock(node, ifStatement): boolean
  // 判断节点是否在 if 的 then 块内

  protected normalizePath(path): string
  // 路径规范化（统一分隔符、小写）

  protected checkSuppressWarningsCache(warnName, node, sceneName): boolean
  // @SuppressWarnings 缓存检查
}
```

### 2.4 BaseWarningSuppressor

```typescript
export abstract class BaseWarningSuppressor {
  public validators: CompositeValidator;

  constructor(warnName: string) {
    // 只有在 SUPPRESSWARNINGS_RULE_INFO 中注册的标签才支持注解/注释抑制
    if (SUPPRESSWARNINGS_RULE_INFO.has(warnName)) {
      this.validators = new CompositeValidator([
        new AnnotateSuppressWarningsValidator(warnName),
        new CommentSuppressWarningsValidator(warnName)
      ]);
    } else {
      this.validators = new CompositeValidator([]);
    }
  }
}
```

---

## 3. 各 Warning Suppressor

### 3.1 SinceWarningSuppressor

```typescript
export class SinceWarningSuppressor extends BaseWarningSuppressor {
  constructor(projectCompatibleSdkVersion, minRequiredVersion, typeChecker?, declaration?) {
    super(SINCE_TAG_NAME);
    this.validators.addValidator([
      new TryCatchValidator(),
      new UndefinedCheckValidator(),
      new WhiteListValidator(declaration),
      new AvailableComparisonValidator(projectCompatibleSdkVersion, minRequiredVersion, typeChecker),
      new SdkComparisonValidator(projectCompatibleSdkVersion, minRequiredVersion, typeChecker, undefined, declaration)
    ]);
  }
}
```

### 3.2 AvailableWarningSuppressor

```typescript
export class AvailableWarningSuppressor extends BaseWarningSuppressor {
  constructor(projectCompatibleSdkVersion, minRequiredVersion, minAvailableVersion, typeChecker?, declaration?) {
    super(AVAILABLE_TAG_NAME);
    this.validators.addValidator([
      new AvailableComparisonValidator(projectCompatibleSdkVersion, minRequiredVersion, typeChecker, minAvailableVersion),
      new SdkComparisonValidator(projectCompatibleSdkVersion, minRequiredVersion, typeChecker, minAvailableVersion, declaration)
    ]);
  }
}
```

> **注意**：`@Available` 不支持 try-catch 和 undefined 检查抑制。

### 3.3 PermissionWarningSuppressor

```typescript
export class PermissionWarningSuppressor extends BaseWarningSuppressor {
  constructor() {
    super(PERMISSION_TAG_CHECK_NAME);
    // 仅基类提供的注解/注释抑制
  }
}
```

### 3.4 SyscapWarningSuppressor

```typescript
export class SyscapWarningSuppressor extends BaseWarningSuppressor {
  constructor(jsDocTags, config) {
    super(SYSCAP_TAG_CHECK_NAME);
    this.validators.addValidator([
      new CanIUseValidator(jsDocTags, config)
    ]);
  }
}
```

---

## 4. 各 Validator 实现

### 4.1 TryCatchValidator

**抑制策略**：API 调用在 `try` 块内。

```typescript
export class TryCatchValidator extends BaseValidator {
  validate(node): boolean {
    // 向上查找 TryStatement 父节点
    // 确认 node 在 tryBlock 范围内
  }
}
```

**示例**：
```typescript
try {
  newApi();  // 抑制 @since 告警
} catch (e) {}
```

### 4.2 UndefinedCheckValidator

**抑制策略**：API 调用在 `if (xxx !== undefined)` 条件块内。

```typescript
export class UndefinedCheckValidator extends BaseValidator {
  validate(node): boolean {
    // 1. 提取节点名称
    // 2. 向上查找 IfStatement 父节点
    // 3. 检查条件表达式是否为 `name !== undefined` 或 `undefined !== name`
  }
}
```

**示例**：
```typescript
if (newApi !== undefined) {
  newApi();  // 抑制 @since 告警
}
```

### 4.3 SdkComparisonValidator

**抑制策略**：API 调用在 SDK 版本比较的 if 条件块内。

```typescript
export class SdkComparisonValidator extends BaseValidator {
  constructor(compatibleSdkVersion, minRequiredVersion, typeChecker?, minAvailableVersion?, declaration?) {
    // 创建 SdkComparisonHelper
  }

  validate(node): boolean {
    // 1. 检查文件是否含 deviceInfo（缓存 fileDeviceCheckPlugin）
    // 2. 向上查找 IfStatement 父节点
    // 3. 确认 node 在 thenStatement 块内
    // 4. 检查条件表达式：
    //    a. isApiAvailableHelper: deviceInfo.apiAvailable('xx') 调用
    //    b. isSdkComparisonHelper: deviceInfo.sdkApiVersion >= 21 等比较
  }
}
```

**支持的比较形式**：
- `deviceInfo.sdkApiVersion >= 21`（OpenHarmony）
- `deviceInfo.distributionOSApiVersion >= 60000`（DistributionOS）
- `deviceInfo.apiAvailable('26.0.0')`（apiAvailable 调用）

### 4.4 AvailableComparisonValidator

**抑制策略**：调用点的外层 `@Available` 装饰器版本 >= API 声明版本。

```typescript
export class AvailableComparisonValidator extends BaseValidator {
  constructor(compatibleSdkVersion, minRequiredVersion, typeChecker, minAvailableVersion?) {
    // 加载 formatChecker 和 valueChecker
  }

  validate(node): boolean {
    // 1. 检查文件含 @Available（checkFileHasAvailableByFileName）
    // 2. 向上查找 @Available 装饰器（getValidDecoratorFromNode）
    // 3. 提取父级版本（extractMinApiFromDecorator）
    // 4. 比较父级版本 vs API 声明版本
    //    - 父级版本更高 → 抑制告警
  }
}
```

**示例**：
```typescript
@Available({minApiVersion: '27'})
function apiAvailableFunc() {
  foo.gaveName1();  // foo 声明 @Available(26)，父级 27 >= 26 → 抑制
}
```

### 4.5 AnnotateSuppressWarningsValidator

**抑制策略**：`@SuppressWarnings` 装饰器包含对应规则。

```typescript
export class AnnotateSuppressWarningsValidator extends BaseValidator {
  constructor(warnName: string) { ... }

  validate(node): boolean {
    // 1. 缓存检查：文件是否含 @SuppressWarnings 注解
    // 2. 向上查找 @SuppressWarnings 装饰器
    // 3. 检查 rules 数组是否包含对应规则
    //    - since/available → SuppressWarningsType.COMPATIBILITY
    //    - syscap → SuppressWarningsType.SYSCAP
    //    - permission → SuppressWarningsType.PERMISSION
  }
}
```

**示例**：
```typescript
@Suppress({rules: [SuppressWarningsType.COMPATIBILITY]})
function test() {
  wifiManager.startScan();  // 抑制 @since 告警
}
```

### 4.6 CommentSuppressWarningsValidator

**抑制策略**：`// @SuppressWarnings` 注释包含对应规则。

```typescript
export class CommentSuppressWarningsValidator extends BaseValidator {
  constructor(warnName: string) { ... }

  validate(node): boolean {
    // 1. 缓存检查：文件是否含 // @SuppressWarnings 注释
    // 2. 获取节点前导注释
    //    - 处理链式调用场景（getChainCallNode）
    //    - 处理普通调用场景（findNodeParentStatement）
    // 3. 检查注释是否匹配规则：
    //    - 含 `@SuppressWarnings`
    //    - 含 `compatibility`（since/available）
    //    - 含 `syscap`
    //    - 含 `permission`
  }
}
```

**示例**：
```typescript
// @SuppressWarnings compatibility
newApi();  // 抑制 @since 告警

// 链式调用
Button('test')
  .id('test')
  // @SuppressWarnings compatibility
  .fontSize('xxx')  // 抑制 @since 告警
```

**链式调用特殊处理**：支持在链式调用的中间节点添加注释抑制。

### 4.7 CanIUseValidator

**抑制策略**：`canIUse('xxx')` 条件块。

```typescript
export class CanIUseValidator extends BaseValidator {
  constructor(jsDocTags, config) { ... }

  validate(node): boolean {
    // 1. 检查文件是否含 canIUse() 调用
    // 2. 获取 @syscap 标签值
    // 3. 向上查找 IfStatement 父节点
    // 4. 检查条件是否为 canIUse('syscap值')
    // 5. 如果未通过，执行 syscap 条件检查
  }
}
```

**示例**：
```typescript
if (canIUse('SystemCapability.xxx')) {
  newApi();  // 抑制 @syscap 告警
}
```

### 4.8 WhiteListValidator

**抑制策略**：API 声明在 `API_INTERFACE_WHITE_LIST` 白名单中。

```typescript
export class WhiteListValidator extends BaseValidator {
  constructor(declaration: ts.Declaration) { ... }

  validate(node): boolean {
    return this.checkWhiteList();
  }

  private checkWhiteList(): boolean {
    // 1. 获取声明（declaration）所在的源文件
    // 2. 将文件路径相对于 projectConfig.globalModulePaths 取相对路径
    // 3. 用相对路径作为 key 查询 API_INTERFACE_WHITE_LIST
    // 4. 检查 API 名称是否在返回的列表中
  }
}
```

**白名单定义**（`api_check_define.ts`）：
```typescript
API_INTERFACE_WHITE_LIST = Map {
  '@arkts.lang.d.ets': ['RetentionPolicy', 'Retention', 'SOURCE', 'BYTECODE'],
  '@ohos.deviceInfo.d.ts': ['apiAvailable']
}
```

**匹配逻辑**：
- 输入：API 的 `declaration` 节点
- 取 `declaration.name` 的文本作为 API 名称
- 取 `declaration` 源文件路径，相对 `projectConfig.globalModulePaths` 计算相对路径
- 查 `API_INTERFACE_WHITE_LIST[相对路径]` 是否包含该 API 名称
- 命中则返回 `true`（抑制告警）

**使用场景**：某些 SDK 内部接口（如 `@arkts.lang` 注解、`deviceInfo.apiAvailable`）本身不需要 `@since` 版本兼容性检查，通过白名单跳过。

> 详见 [02-define-and-permission.md](02-define-and-permission.md) §6.1。

---

## 5. SdkComparisonHelper

> 文件：`api_validate_utils.ts`

`SdkComparisonHelper` 封装了 SDK 版本比较的核心逻辑，被 `SdkComparisonValidator` 使用。

### 5.1 两个核心方法

```typescript
// 检查 SDK 版本比较表达式（如 deviceInfo.sdkApiVersion >= 21）
public isSdkComparisonHelper(expression: ts.Expression): boolean

// 检查 apiAvailable 调用表达式（如 deviceInfo.apiAvailable('26.0.0')）
public isApiAvailableHelper(expression: ts.Expression): boolean
```

### 5.2 isSdkComparisonHelper 流程

```
1. 提取表达式文本，匹配 deviceInfoChecker 中的 API 名
2. 检查 @since 版本是否符合 MSF 格式规则（checkSinceMSFVersionMajor）
3. 排除 OpenHarmony 运行时不支持的 API（distributionOSApiVersion）
4. 提取比较部分（extractComparisonParts）
   - 识别操作符（>, >=, <, <=, ==, ===, !=, !==）
   - 识别 API 位置（left/right）
   - 解析声明值（resolveDeclarationValue）
5. 验证 SDK 版本兼容性（validateSdkVersionCompatibility）
   - 计算赋值版本（calculateAssignedSdkVersion）
   - 根据运行时选择比较方式
   - OpenHarmony：comparePointVersion
   - 非OH OS：valueChecker + scenario
6. 验证 API 标识符来源合法（isValidSdkDeclaration）
   - 检查是否来自 @ohos.deviceInfo.d.ts
```

### 5.3 运算符处理

```typescript
private calculateAssignedSdkVersion(operator, comparisonValue, apiPosition): number | null
```

| 操作符 | API 在左 | API 在右 | 行为 |
|--------|---------|---------|------|
| `>` | comparisonValue + 1 | 翻转为 `<` → null | |
| `>=` | comparisonValue | 翻转为 `<=` → null | |
| `<` | null（无法确定） | 翻转为 `>` → comparisonValue + 1 | |
| `<=` | null（无法确定） | 翻转为 `>=` → comparisonValue | |
| `==`/`===` | comparisonValue | comparisonValue | |
| `!=`/`!==` | null（无法确定） | null（无法确定） | |

> 无法确定版本时返回 null → 不抑制告警。

### 5.4 isApiAvailableHelper 流程

```
1. 匹配 deviceInfoChecker 中的 API 名
2. 前置检查（validateApiAvailablePreCheck）
   - 必须是 CallExpression
   - 必须有 1 个参数
   - OpenHarmony 不支持 distributionOSApiVersion
3. 参数校验（validateApiAvailableArgument）
4. 版本比较（compareApiAvailableVersion）
   - 整数/MSF 格式分支处理
   - DistributionOS 版本校验
```

---

## 6. apiAvailable_validate_utils.ts

校验 `apiAvailable()` 调用参数的合法性。

### 6.1 入口函数

```typescript
export function validateApiAvailableArgument(options: ValidateApiAvailableArgumentOptions): ApiAvailableResult
```

### 6.2 参数类型处理

| 参数类型 | 校验内容 |
|----------|----------|
| null/undefined | 直接报错（APIAVAILABLE_NULLORUNDEFINED_FORMAT_ERROR） |
| 数字 | 必须是十进制整数，1-25（OpenHarmony）/非OH规则（DistributionOS） |
| 字符串 | OpenHarmony：MSF 格式且 M>=26；DistributionOS：MSF 或 M.S.F(X) |

### 6.3 OpenHarmony 字符串校验

```typescript
function checkStringOpenHarmony(content: string): ApiAvailableResult
// 仅允许数字和点
// 必须是 M.S.F 格式
// M 必须 >= 26
```

### 6.4 DistributionOS 字符串校验

```typescript
function checkStringDistributionOS(content, isCheckDistributionOSVersion): ApiAvailableResult
// 仅允许数字、点和括号
// 必须是 M.S.F 格式
// M >= 26 时不允许括号
// M < 26 时调用闭源脚本校验
```

---

## 7. 抑制策略适用矩阵

| Validator | since | available | permission | syscap |
|-----------|:-----:|:---------:|:----------:|:------:|
| TryCatchValidator | ✓ | ✗ | ✗ | ✗ |
| UndefinedCheckValidator | ✓ | ✗ | ✗ | ✗ |
| SdkComparisonValidator | ✓ | ✓ | ✗ | ✗ |
| AvailableComparisonValidator | ✓ | ✓ | ✗ | ✗ |
| AnnotateSuppressWarningsValidator | ✓ | ✓ | ✓ | ✓ |
| CommentSuppressWarningsValidator | ✓ | ✓ | ✓ | ✓ |
| CanIUseValidator | ✗ | ✗ | ✗ | ✓ |
| WhiteListValidator | ✓ | ✗ | ✗ | ✗ |

---

## 8. 关键函数索引

| 类/方法 | 文件 | 行号 | 职责 |
|---------|------|------|------|
| `NodeValidator` | api_validate_node.ts | :53 | 验证器接口 |
| `CompositeValidator` | api_validate_node.ts | :72 | 组合验证器（OR 逻辑） |
| `BaseValidator` | api_validate_node.ts | :120 | 验证器基类 |
| `TryCatchValidator` | api_validate_node.ts | :268 | try-catch 抑制 |
| `UndefinedCheckValidator` | api_validate_node.ts | :312 | undefined 检查抑制 |
| `SdkComparisonValidator` | api_validate_node.ts | :393 | SDK 版本比较抑制 |
| `AvailableComparisonValidator` | api_validate_node.ts | :553 | @Available 父级版本抑制 |
| `AnnotateSuppressWarningsValidator` | api_validate_node.ts | :694 | @SuppressWarnings 注解抑制 |
| `CommentSuppressWarningsValidator` | api_validate_node.ts | :823 | // @SuppressWarnings 注释抑制 |
| `CanIUseValidator` | api_validate_node.ts | :1096 | canIUse() 条件抑制 |
| `WhiteListValidator` | api_validate_node.ts | :1257 | 白名单抑制 |
| `SdkComparisonHelper` | api_validate_utils.ts | :49 | SDK 版本比较辅助类 |
| `validateApiAvailableArgument` | apiAvailable_validate_utils.ts | :151 | apiAvailable 参数校验 |
| `BaseWarningSuppressor` | base_warning_suppressor.ts | :31 | 抑制器基类 |
| `SinceWarningSuppressor` | since_warning_suppressor.ts | :39 | @since 抑制器 |
| `AvailableWarningSuppressor` | available_warning_suppressor.ts | :35 | @Available 抑制器 |
| `PermissionWarningSuppressor` | permission_warning_suppressor.ts | :24 | @permission 抑制器 |
| `SyscapWarningSuppressor` | syscap_warning_suppressor.ts | :25 | @syscap 抑制器 |

---

## 9. 扩展指南

### 9.1 新增 Validator

1. 实现 `NodeValidator` 接口（或继承 `BaseValidator`）
2. 实现 `validate(node): boolean` 方法
3. 在对应 suppressor 的构造函数中通过 `addValidator` 注册

### 9.2 新增 Warning Suppressor

1. 继承 `BaseWarningSuppressor`
2. 在构造函数中调用 `super(tagName)` 并 `addValidator` 注册需要的 Validator
3. 如果需要支持 `@SuppressWarnings` 注解/注释抑制，确认 `SUPPRESSWARNINGS_RULE_INFO` 中已注册该标签
4. 在 `api_check_utils.ts` 的 check 回调中创建并调用新 suppressor

### 9.3 新增 suppressWarnings 规则

1. 在 `api_check_define.ts` 的 `SUPPRESSWARNINGS_RULE_INFO` 中添加标签
2. 在 `ANNOTATION_RULE_INFO` 中添加对应的 `@SuppressWarnings` 规则类型
3. 在 `CommentSuppressWarningsValidator.checkCommentsMessage` 中添加匹配逻辑
