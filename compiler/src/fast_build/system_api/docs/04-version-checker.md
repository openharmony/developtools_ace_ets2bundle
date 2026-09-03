# 04 - 版本检查器（策略模式）

> 目录：`api_checker/`
> 文件：`base_version_checker.ts`、`since_version_checker.ts`、`available_version_checker.ts`

---

## 1. 设计概览

本目录使用 **策略模式 + 模板方法模式** 实现版本兼容性检查：

```
              ComparisonStrategy (接口)
                      │
           BaseVersionChecker (抽象基类)
           ├── parseVersion()    [抽象，子类实现]
           ├── compare()         [抽象，子类实现]
           ├── checkTargetVersion()  [模板方法]
           ├── getMinApiVersion()
           └── getSdkVersion()
                  │
        ┌─────────┴──────────┐
        │                     │
  SinceJSDocChecker     AvailableAnnotationChecker
  (@since JSDoc)        (@Available 装饰器)
```

**核心思想**：
- `checkTargetVersion()` 是模板方法，定义流程：`parseVersion()` → `compare()`
- 子类只需实现 `parseVersion()`（从不同注解提取版本）和 `compare()`（版本比较逻辑）
- 版本比较和格式校验函数通过插件系统加载，支持运行时切换

---

## 2. base_version_checker.ts

### 2.1 ComparisonStrategy 接口

```typescript
export interface ComparisonStrategy {
  checkTargetVersion(targetVersion: ts.Node): boolean;
  getMinApiVersion(): string;
}
```

> **注意**：`compare()` 故意不在接口中。它是 protected 方法，所有子类共用同一比较逻辑。

### 2.2 BaseVersionChecker 抽象基类

```typescript
export abstract class BaseVersionChecker implements ComparisonStrategy {
  protected typeChecker?: ts.TypeChecker;
  protected minApiVersion: string = '';
  protected versionValidFunction: FormatCheckerFunction;
  protected versionCompareFunction: ValueCheckerFunction;
  protected sdkVersion: string;

  // 子类必须实现
  protected abstract parseVersion(node: ts.Node | ts.Declaration): boolean;
  protected abstract compare(): boolean;

  // 模板方法
  public checkTargetVersion(targetVersion?: ts.Node): boolean {
    // 1. parseVersion 提取版本 → 设置 minApiVersion
    // 2. compare 比较版本 → 返回是否不兼容
  }

  public getMinApiVersion(): string;
  public getSdkVersion(): string;
}
```

### 2.3 关键设计决策

1. **`compare()` 是 protected 而非 public**：所有子类使用相同的比较逻辑（通过 `versionCompareFunction`），不需要暴露给外部
2. **`versionCompareFunction` 可替换**：通过插件系统加载，默认为 `defaultValueChecker`
3. **`sdkVersion` 初始化**：优先使用 `originCompatibleSdkVersion`，回退到 `compatibleSdkVersion`

---

## 3. since_version_checker.ts

### 3.1 SinceJSDocChecker

检查 `@since` JSDoc 标签标注的 API 是否兼容当前 SDK 版本。

```typescript
export class SinceJSDocChecker extends BaseVersionChecker {
  private jsDocTags?: readonly ts.JSDocTag[];

  constructor(typeChecker?: ts.TypeChecker) {
    super(typeChecker);
    this.init();  // 加载比较函数
  }
}
```

### 3.2 init() 初始化

```typescript
private init(): void {
  // 1. 设置 SDK 版本
  this.sdkVersion = projectConfig.originCompatibleSdkVersion || projectConfig.compatibleSdkVersion;

  // 2. 加载 valueChecker（版本比较函数）
  //    从 externalApiCheckPlugin 加载，回退到 defaultValueChecker
  this.versionCompareFunction = getValueChecker(SINCE_TAG_NAME);

  // 3. 加载 formatChecker（格式校验函数）
  //    @since 无 FormatValidation 插件配置，始终使用默认
  this.versionValidFunction = getFormatChecker(SINCE_TAG_NAME) || defaultFormatCheckerCompatibileIntegerAndMSF;
}
```

### 3.3 parseVersion() 版本提取

```typescript
protected parseVersion(node: ts.Node): boolean {
  // 优先级 1：使用外部设置的 jsDocTags
  if (this.jsDocTags?.length > 0) {
    return this._parseSinceFromTags(this.jsDocTags, node);
  }

  // 优先级 2：从节点的 jsDoc 数组提取
  const jsDocs = node.jsDoc;
  for (const doc of jsDocs) {
    if (this._parseSinceFromTags(doc.tags, node)) {
      return true;  // 找到第一个 @since 即返回
    }
  }
}
```

`_parseSinceFromTags` 核心逻辑：
1. 遍历所有 JSDoc 标签
2. 找到 `tagName === 'since'` 的标签
3. 提取注释作为版本字符串
4. 用 `defaultFormatChecker` 校验格式
5. 设置 `this.minApiVersion`

### 3.4 compare() 版本比较

```typescript
protected compare(): boolean {
  const compareResult = this.versionCompareFunction(
    this.minApiVersion,   // @since 要求的版本
    this.sdkVersion,      // 当前 SDK 版本
    ComparisonSenario.Trigger  // 触发场景：生成告警
  );
  return !compareResult.result;  // 返回 true = 不兼容
}
```

### 3.5 外部设置标签

```typescript
public setJSDocTags(jsDocTags: readonly ts.JSDocTag[]): void
```

允许外部传入预提取的 JSDoc 标签，避免重复提取。

---

## 4. available_version_checker.ts

### 4.1 AvailableAnnotationChecker

检查 `@Available({minApiVersion: "xx"})` 装饰器标注的 API 是否兼容当前 SDK 版本。

```typescript
export class AvailableAnnotationChecker extends BaseVersionChecker {
  private formatChecker: FormatCheckerFunction;
  private availableVersion: ParsedVersion;  // 解析后的版本（含 OS 信息）

  constructor(typeChecker?: ts.TypeChecker) {
    super(typeChecker);
    this.init();
  }
}
```

### 4.2 init() 初始化

```typescript
private init(): void {
  // 1. 设置 SDK 版本
  this.sdkVersion = projectConfig.originCompatibleSdkVersion || projectConfig.compatibleSdkVersion;

  // 2. 加载 valueChecker（版本比较函数）
  this.versionCompareFunction = getValueChecker(AVAILABLE_TAG_NAME);

  // 3. 加载 formatChecker（格式校验函数）
  //    @Available 有 FormatValidation 插件配置
  this.formatChecker = getFormatChecker(AVAILABLE_TAG_NAME) || defaultFormatCheckerCompatibileIntegerAndMSF;
  this.versionValidFunction = this.formatChecker;
}
```

### 4.3 parseVersion() 装饰器提取

```typescript
protected parseVersion(node: ts.Node): boolean {
  // 1. 查找 @Available 装饰器
  const decorator = getValidDecoratorFromNode(node, isAvailableDecorator);

  // 2. 提取 minApiVersion
  const minApi = extractMinApiFromDecorator(decorator);

  // 3. 设置版本信息
  this.minApiVersion = minApi.version;        // 版本号字符串
  this.availableVersion = minApi;            // 完整解析结果（含 OS）
}
```

### 4.4 compare() 版本比较

```typescript
protected compare(): boolean {
  const compareResult = this.versionCompareFunction(
    getVersionByValueChecker(this.availableVersion, this.versionCompareFunction),
    // ↑ 如果用默认 checker，返回 version；否则返回 formatVersion（含 OS）
    this.sdkVersion,
    ComparisonSenario.Trigger
  );
  return !compareResult.result;
}
```

### 4.5 getAvailableVersion()

```typescript
public getAvailableVersion(): ParsedVersion
```

返回解析后的完整版本信息，供 `AvailableWarningSuppressor` 使用。

---

## 5. @since vs @Available 对比

| 特性 | SinceJSDocChecker | AvailableAnnotationChecker |
|------|-------------------|----------------------------|
| 注解类型 | JSDoc 标签 `@since` | 装饰器 `@Available({minApiVersion})` |
| 版本来源 | JSDoc comment | 装饰器参数对象 |
| 格式校验 | 始终用默认 | 支持外部插件 |
| 版本信息 | `string` | `ParsedVersion`（含 OS） |
| 比较函数 | `getValueChecker('since')` | `getValueChecker('available')` |
| 多标签处理 | 取第一个 `@since` | 取第一个有效 `@Available` |

---

## 6. 使用示例

### 6.1 @since 检查

```typescript
// 源码
/**
 * @since 21
 */
export function newApi() { ... }

// 检查流程
const checker = new SinceJSDocChecker(typeChecker);
const hasIncompatibility = checker.checkTargetVersion(jsDocNode);
if (hasIncompatibility) {
  const minVersion = checker.getMinApiVersion();  // "21"
  const sdkVersion = checker.getSdkVersion();      // e.g. "20"
  // 告警：API 要求 21，当前 SDK 20
}
```

### 6.2 @Available 检查

```typescript
// 源码
@Available({ minApiVersion: "21" })
export function newApi() { ... }

// 检查流程
const checker = new AvailableAnnotationChecker(typeChecker);
const hasIncompatibility = checker.checkTargetVersion(declaration);
if (hasIncompatibility) {
  const minVersion = checker.getMinApiVersion();     // "21"
  const availableVersion = checker.getAvailableVersion(); // ParsedVersion
  const sdkVersion = checker.getSdkVersion();          // e.g. "20"
  // 告警：API 要求 21，当前 SDK 20
}
```

---

## 7. 扩展指南

### 新增版本检查器

1. 继承 `BaseVersionChecker`
2. 在 `init()` 中加载比较函数
3. 实现 `parseVersion()`：从新注解类型提取版本
4. 实现 `compare()`：调用 `versionCompareFunction` 比较

```typescript
export class NewAnnotationChecker extends BaseVersionChecker {
  constructor(typeChecker?: ts.TypeChecker) {
    super(typeChecker);
    this.init();
  }

  private init(): void {
    this.sdkVersion = projectConfig.compatibleSdkVersion;
    this.versionCompareFunction = getValueChecker('newTag');
  }

  protected parseVersion(node: ts.Node): boolean {
    // 从 node 提取版本，设置 this.minApiVersion
    // 返回 true 如果找到注解
  }

  protected compare(): boolean {
    const result = this.versionCompareFunction(this.minApiVersion, this.sdkVersion, ComparisonSenario.Trigger);
    return !result.result;
  }
}
```

---

## 8. 关键函数索引

| 类/方法 | 文件 | 行号 | 职责 |
|---------|------|------|------|
| `ComparisonStrategy` | base_version_checker.ts | :37 | 策略接口 |
| `BaseVersionChecker` | base_version_checker.ts | :66 | 抽象基类 |
| `BaseVersionChecker.checkTargetVersion` | base_version_checker.ts | :134 | 模板方法入口 |
| `SinceJSDocChecker` | since_version_checker.ts | :41 | @since 检查器 |
| `SinceJSDocChecker.init` | since_version_checker.ts | :66 | 初始化 |
| `SinceJSDocChecker.parseVersion` | since_version_checker.ts | :119 | 从 JSDoc 提取版本 |
| `SinceJSDocChecker.compare` | since_version_checker.ts | :162 | 版本比较 |
| `AvailableAnnotationChecker` | available_version_checker.ts | :47 | @Available 检查器 |
| `AvailableAnnotationChecker.init` | available_version_checker.ts | :68 | 初始化 |
| `AvailableAnnotationChecker.parseVersion` | available_version_checker.ts | :106 | 从装饰器提取版本 |
| `AvailableAnnotationChecker.compare` | available_version_checker.ts | :140 | 版本比较 |
