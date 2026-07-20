# 功能概述
Import 转换处理 ArkTS 源码中的导入声明，包括：路径展开（`import_path_expand.ts`，将聚合导入拆解为按文件的精确导入）、Lazy Import（`process_lazy_import.ts`，自动添加 `lazy` 关键字）、Kit Import（`process_kit_import.ts`，将 `@kit.*` 转为 `@ohos.*` 导入）和通用导入处理（`process_import.ts`，收集组件/装饰器信息）。

## 动态
### 源码参考位置
- `compiler/src/process_import.ts:104-161`（`processImport`，通用导入处理）
- `compiler/src/process_import.ts:176`（`visitAllNode`，遍历导入文件 AST 收集信息）
- `compiler/src/process_lazy_import.ts:60-80`（`transformLazyImport`，lazy import 变换）
- `compiler/src/process_lazy_import.ts:98-170`（`updateImportDecl`，单条导入声明更新）
- `compiler/src/process_kit_import.ts:78-100`（`processKitImport`，Kit 导入变换）
- `compiler/src/import_path_expand.ts:41-66`（`expandAllImportPaths`，路径展开 transformer）
- `compiler/src/import_path_expand.ts:68-80`（`transformImportDecl`，单条导入拆解）
- `compiler/src/process_ui_syntax.ts:321-330`（ESMODULE 模式下 `processImportModule` 调用）

### 转换前的原始代码
```typescript
// 场景1：Kit Import
import { ability, ErrorCode } from '@kit.AbilityKit';

// 场景2：普通命名导入
import { MyComponent } from './MyComponent';

// 场景3：自动 Lazy Import
import { heavyModule } from './heavyModule';

// 场景4：路径展开
import { CompA, CompB } from '@ohos.myPackage';
```

### 转换后的代码（Legacy）
```typescript
// 场景1：Kit → ohos 导入
import ability from '@ohos.ability.ability';
import ErrorCode from '@ohos.ability.errorCode';

// 场景2：普通导入（收集组件信息，不变换）
import { MyComponent } from './MyComponent';

// 场景3：自动 Lazy Import
import lazy { heavyModule } from './heavyModule';

// 场景4：路径展开（拆解为按文件导入）
import { CompA } from '@ohos.myPackage/CompA';
import { CompB } from '@ohos.myPackage/CompB';
```

### 转换后的代码（Partial Update）
```typescript
// ESMODULE + rollup 模式下使用 processImportModule
// 场景1：Kit → ohos 导入（不变）
import ability from '@ohos.ability.ability';
import ErrorCode from '@ohos.ability.errorCode';

// 场景2：普通导入（ESMODULE 模式下由 Rollup 处理路径解析）
import { MyComponent } from './MyComponent';

// 场景3：自动 Lazy Import（不变）
import lazy { heavyModule } from './heavyModule';

// 场景4：路径展开（不变）
import { CompA } from '@ohos.myPackage/CompA';
import { CompB } from '@ohos.myPackage/CompB';
```

### 关键转换逻辑

#### 1. processImport（通用导入处理，line 104-161）
- **适用模式**：非 ESMODULE 或非 rollup 模式
- **职责**：
  - 解析 `ImportDeclaration`/`ImportEqualsDeclaration`/`ExportDeclaration`
  - 提取 defaultName 和 namedBindings
  - 收集组件名到 `asName` 映射
  - 递归访问导入文件 AST，收集 `@Entry`/`@Component`/`@Reusable`/`@ReusableV2`/`@Builder` 信息
  - 收集 struct/class 装饰器信息到 `componentCollection`/`linkCollection` 等

#### 2. processImportModule（ESMODULE 模式，line 321-325）
- **适用模式**：`compileMode === 'esmodule'` 且 `compileTool === 'rollup'`
- **职责**：ESMODULE 模式下路径解析由 Rollup 处理，`processImportModule` 仅收集信息

#### 3. transformLazyImport（Lazy Import，line 60-80）
- **适用场景**：`autoLazyImport` 开启时
- **支持的变换**：
  - `import { x } from '...'` → `import lazy { x } from '...'`
  - `import y, { x } from '...'` → `import lazy y, { x } from '...'`
  - `import y from '...'` → `import lazy y from '...'`
- **排除场景**：
  - `import '...'`（副作用导入）
  - `import type { t } from '...'`（类型导入）
  - `import lazy { x } from '...'`（已有 lazy）
  - `import * as ns from '...'`（命名空间导入）
  - `import ... from 'xxx.json'`（JSON 导入）
- **类型/值分离**（有 resolver 时）：
  - `import { type t, x } from '...'` → `import lazy { x } from '...'; import { type t } from '...'`
  - 通过 `splitImportBindings` 分离类型和值绑定

#### 4. lazyImportReExportCheck（再导出检查，line 204-223）
- **模式**：
  - `noCheck`：不检查
  - `strict`：报错（ERROR）
  - `compatible`：警告（WARN）
- 收集 lazy import 符号，检查是否被再导出（`export default`/`export { x }`）

#### 5. processKitImport（Kit 导入变换，line 78-100）
- **检测**：`moduleRequest.startsWith('@kit.')`
- **处理**：
  - 从 SDK 配置文件读取 Kit 定义
  - `KitInfo.processKitInfo`：将 Kit 符号映射到对应的 `@ohos.*` 模块
  - 生成对应的 `@ohos.*` import 声明列表
- **示例**：`@kit.AbilityKit` → `@ohos.ability.ability` + `@ohos.ability.errorCode`

#### 6. expandAllImportPaths（路径展开，line 41-66）
- **条件**：`projectConfig.expandImportPath.enable === true`
- **排除**：
  - 相对路径（`./` 开头）
  - 系统模块（`@ohos.*`/`@sdkConfigPrefix.*`）
  - `.so` 库
  - exclude 列表中的模块
  - HSP/HAR 映射中的模块
- **变换**：通过 TypeChecker 解析导入符号的源文件路径，拆解聚合导入为按文件的精确导入

## 静态
### 源码参考位置
静态工具链（arkui-plugins）的导入处理通过 `common/import-collector.ts` 和 interop 插件的 `arkuiImportList.ts` 处理 ArkUI 相关导入，但不处理 Kit/Lazy/路径展开。

### 转换前的原始代码
```typescript
import { ability } from '@kit.AbilityKit';
import { MyComponent } from './MyComponent';
```

### 转换后的代码
```typescript
// 静态工具链不处理 Kit/Lazy/路径展开
// struct -> class 变换后由 interop 插件处理 ArkUI 导入
import { ability } from '@kit.AbilityKit';
import { MyComponent } from './MyComponent';
```

## 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| Kit Import 变换 | `processKitImport` → `@ohos.*` | 不处理 |
| Lazy Import | `transformLazyImport` 自动加 lazy | 不处理 |
| 路径展开 | `expandAllImportPaths` 拆解聚合导入 | 不处理 |
| 再导出检查 | `lazyImportReExportCheck` | 无 |
| 组件信息收集 | `processImport` 递归收集 | `import-collector.ts` |
| ArkUI 导入 | 不特殊处理 | `arkuiImportList.ts` 识别 179 个组件 |
| 适用模式 | Legacy + ESMODULE | parsed + checked 阶段 |
