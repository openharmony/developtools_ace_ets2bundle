# AGENTS.md

## 1. 代码地图

本 AGENTS.md 适用于 `arkui-plugins/` 子目录。它是 **静态类型** 的 ArkTS UI 编译工具链，基于插件式 AST 变换系统，在 es2panda AST 层操作（不是 `compiler/` 动态类型工具链使用的 TypeScript AST 层）。

本模块实现 **es2panda AST 变换插件**，在 parsed 和 checked 编译阶段将 ArkUI 声明式 UI 源代码转换为命令式 JavaScript。最重要的架构边界是：**所有插件通过 `@koalaui/libarkts` API 操作 es2panda AST，不是 TypeScript AST** — 本模块（静态类型工具链）与 `compiler/`（动态类型工具链）是并行系统，运行时不能交叉依赖。

关键区域：
- `ui-plugins/`：主力 UI 组件变换器。入口 `index.ts` 导出 `uiTransform()`，含 parsed（ComponentTransformer：@Component struct -> class）和 checked（Collector -> CheckedTransformer：状态管理、builder lambda、属性变换器）阶段处理器。包含 `component-transformer.ts`（parsed 阶段）、`checked-transformer.ts`（checked 阶段）、`property-translators/`（35 个文件：state、link、prop、local、param、once、event、computed、monitor 等）、`struct-translators/`、`builder-lambda-translators/`、`entry-translators/`、`insight-intent/`、`interop/`、`memo-collect-cache/`。
- `ui-syntax-plugins/`：ArkUI 语法 linter。入口 `index.ts` 导出 `uiSyntaxLinterTransform()`。包含 `rules/`（64 个 lint 规则文件，覆盖装饰器检查、struct 规则、V1/V2 混用、命名、嵌套）、`processor/`、`transformers/`、`utils/`。
- `memo-plugins/`：缓存变换器（"unmemoize"）。入口 `index.ts` 导出 `unmemoizeTransform()`（仅 checked 阶段，调用 `arkts.recheckSubtree()`）。包含 `function-transformer.ts`（773 行，核心）、`memo-factory.ts`、`parameter-transformer.ts`、`return-transformer.ts`、`signature-transformer.ts`、`internal-transformer.ts`、`import-transformer.ts`、`memo-cache-factory.ts`、`utils.ts`。
- `interop-plugins/`：ArkTS 组件的 struct 到 class interop 桥接。入口 `index.ts` 导出 `interopTransform()`（parsed + checked 阶段）。包含 `decl_transformer.ts`（parsed：struct -> class）、`emit_transformer.ts`（checked：emit 生成）、`arkuiImportList.ts`（179 个 ArkUI 组件/装饰器名称集合）、`types.ts`。
- `collectors/`：ui-plugins 和 ui-syntax-plugins 使用的元数据收集基础设施。包含 `collector.ts`（编排 UI + memo 收集）、`ui-collectors/`（UIVisitor、struct/normal-class/global-class collector、call-record、condition-scope、validators、records）、`memo-collectors/`（MemoVisitor、function-collector）、`utils/`。
- `common/`：共享基础设施（18 个文件）。包含 `plugin-context.ts`（473 行，PluginContext 类桥接构建系统到插件）、`abstract-visitor.ts`（基础 visitor 类）、`program-visitor.ts`（多 visitor 编排器）、`predefines.ts`（771 行，装饰器名、组件名、枚举类型）、`arkts-utils.ts`（507 行，AST 操作工具）、`metadata-collector.ts`、`import-collector.ts`、`log-collector.ts`、`gensym-generator.ts`、`file-manager.ts`、`safe-types.ts`、`cache/`。
- `path.ts`：`@koalaui/libarkts`、interop、common、compat 库的运行时路径解析器。从 `__dirname` 向上查找 koala-wrapper 路径。
- `custom-import-plugin.js`：Babel 插件，将 `import * as arkts from '@koalaui/libarkts'` 替换为动态 `require(getArktsPath())`，用于运行时路径解析。
- `build_ui_plugins.py`：GN `action("gen_ui_plugins")` 调用的 Python 脚本；运行 `npm run compile:plugins`，将输出 + 运行时依赖（ajv）+ compiler 组件复制到目标 gen 目录。

查找指引：
- 组件装饰器变换 -> `ui-plugins/property-translators/`
- struct 到 class parsed 阶段变换 -> `ui-plugins/component-transformer.ts` 或 `interop-plugins/decl_transformer.ts`
- checked 阶段变换编排 -> `ui-plugins/checked-transformer.ts`
- @Memo 变换 -> `memo-plugins/function-transformer.ts`
- 语法 lint 规则 -> `ui-syntax-plugins/rules/`
- 元数据收集逻辑 -> `collectors/`
- 共享工具和常量 -> `common/`
- 运行时路径解析 -> `path.ts`
- 构建配置 -> `BUILD.gn`、`build_ui_plugins.py`

插件流水线顺序（不可更改）：
1. interop-plugin（parsed：struct -> class）
2. ui-plugin（parsed：ComponentTransformer）
   ui-plugin（checked：Collector -> CheckedTransformer）
3. ui-syntax-plugin（checked：lint 规则）
4. memo-plugin（checked：unmemoize + recheck）

## 2. 知识路由

在规划或编辑之前，先分类任务并阅读匹配文档。

### 任务路由
- 组件装饰器变换（@State、@Link、@Prop、@Local、@Param 等） -> 阅读 `ui-plugins/property-translators/` 中对应装饰器文件，及 `common/predefines.ts` 中的装饰器名常量
- struct 到 class 变换 -> 阅读 `ui-plugins/component-transformer.ts` 和 `interop-plugins/`
- @Builder / @BuilderParam 变换 -> 阅读 `ui-plugins/builder-lambda-translators/`
- @Memo 变换 -> 阅读 `memo-plugins/function-transformer.ts` 和 `memo-plugins/memo-factory.ts`
- 语法 lint 规则变更 -> 阅读 `ui-syntax-plugins/rules/` 中的现有规则模式，及 `common/predefines.ts` 中的装饰器/组件名
- Collector 或元数据变更 -> 阅读 `collectors/collector.ts` 和对应子 collector
- 共享工具或常量变更 -> 阅读 `common/predefines.ts`（771 行）和 `common/arkts-utils.ts`
- 运行时路径或构建问题 -> 阅读 `path.ts` 和 `custom-import-plugin.js`
- GN 构建/部署变更 -> 阅读 `BUILD.gn` 和 `build_ui_plugins.py`

### 路径路由
- `ui-plugins/property-translators/` -> 阅读对应装饰器文件；所有 property translator 遵循相同的工厂模式
- `ui-plugins/component-transformer.ts` -> 阅读 `common/predefines.ts`，了解 parsed 阶段使用的装饰器常量
- `ui-syntax-plugins/rules/` -> 阅读附近的现有规则，匹配已建立的模式（visitor-based、诊断输出）
- `memo-plugins/` -> 阅读 `memo-plugins/utils.ts`，了解注解检测模式后再修改 transformer
- `common/predefines.ts` -> 这是装饰器名、组件名、导入源名、枚举类型的唯一事实来源
- `collectors/` -> 阅读 `collectors/collector.ts`，了解收集标志和数据流

### 术语路由

当任务、issue、日志、API 或变更文件涉及以下术语时，在规划前阅读对应文档：

| 术语 | 风险提示 | 阅读 |
|---|---|---|
| es2panda | C++ 编译器前端；插件在其 AST 上操作，不是 TypeScript AST | `common/abstract-visitor.ts`、`common/program-visitor.ts` |
| @koalaui/libarkts / Koala | es2panda AST 的 TypeScript 绑定；提供 factory、nodeType、visitEachChild、recheckSubtree | `path.ts`、`custom-import-plugin.js` |
| parsed 阶段 / checked 阶段 | 两个编译阶段；parsed 阶段插件修改结构，checked 阶段插件修改语义（类型检查后） | `ui-plugins/index.ts`、`interop-plugins/index.ts` |
| @Component / @ComponentV2 | 组件装饰器；parsed 阶段 struct 到 class，checked 阶段属性变换 | `ui-plugins/component-transformer.ts`、`ui-plugins/property-translators/` |
| @State / @Prop / @Link / @ObjectLink | V1 状态管理装饰器；各有专属 property-transformer | `ui-plugins/property-translators/state.ts`、`propRef.ts`、`link.ts` |
| @Local / @Param / @Once / @Event | V2 状态管理装饰器；不可与同一组件中与 V1 装饰器混用 | `ui-plugins/property-translators/local.ts`、`param.ts` |
| @Builder / @BuilderParam | 自定义构建函数装饰器；生成静态方法和 lambda 包装器 | `ui-plugins/builder-lambda-translators/` |
| @Memo / unmemoize | 缓存注解；变换后必须调用 recheckSubtree | `memo-plugins/index.ts`、`memo-plugins/function-transformer.ts` |
| @Entry | Entry 装饰器；生成路由/导航模块元数据 | `ui-plugins/entry-translators/` |
| interop / struct 到 class | struct 到 class 桥接；有独立 interop 插件流水线 | `interop-plugins/decl_transformer.ts`、`interop-plugins/emit_transformer.ts` |
| NodeCacheFactory / 缓存 | 增量编译缓存；跨插件共享 UI 和 MEMO 缓存 | `common/cache/astNodeRevisitCache.ts` |
| Collector / UIVisitor / MemoVisitor | checked 阶段变换前的元数据收集 | `collectors/collector.ts`、`collectors/ui-collectors/ui-visitor.ts` |
| PluginContext | 构建系统到插件的桥接；持有 AST、program、config、context 指针 | `common/plugin-context.ts` |
| recheckSubtree | AST 修改后在 checked 阶段必须调用，触发重新类型检查 | `memo-plugins/index.ts` |
| arkuiImportList | 179 个 ArkUI 组件/装饰器名称集合，interop 插件用于识别目标 | `interop-plugins/arkuiImportList.ts` |

在计划中声明：
- 任务类别（哪个插件/子模块）
- 已读文档
- 发现约束
- parsed 阶段还是 checked 阶段哪个是正确目标

## 3. 约束边界

### 架构/领域不变量
- 所有插件通过 `@koalaui/libarkts` 操作 es2panda AST；不可直接使用 TypeScript Compiler API。
- 插件流水线顺序固定：interop（parsed）-> ui（parsed+checked）-> ui-syntax（checked）-> memo（checked）。更改顺序会影响变换正确性。
- `common/` 提供共享基础设施（AbstractVisitor、ProgramVisitor、PluginContext、predefines），是所有插件的基础，不是插件本身。
- `collectors/` 为 ui-plugins 和 ui-syntax-plugins 提供元数据；Collector 类根据使用场景以用不同标志实例化。
- `common/predefines.ts` 是装饰器名、组件名、导入源名、枚举类型的唯一事实来源；不要在其他地方硬编码这些值。
- `path.ts` 和 `custom-import-plugin.js` 将编译输出与源码树 node_modules 解耦；`@koalaui/libarkts` 导入必须通过此机制解析。
- @Memo 变换必须调用 `arkts.recheckSubtree()`；跳过 recheck 会导致类型检查过期状态（stale type-check）。
- V1 和 V2 状态管理装饰器不可在同一组件中混用；ui-syntax-plugins 通过 lint 规则强制。
- koala-wrapper 必须先于 arkui-plugins 构建；`@koalaui/libarkts` 是直接依赖。koala-wrapper 后续将由 `ets1.2/libarkts` 逐渐替代。

### 禁止事项
- 禁止从 `compiler/src/` 或 `compiler/lib/` 导入；arkui-plugins（静态类型工具链）和 compiler（动态类型工具链）是并行系统。
- 禁止在不理解 inter-plugin 依赖的情况下更改插件流水线顺序。
- 禁止硬编码装饰器名、组件名、导入源；必须使用 `common/predefines.ts` 中的常量。
- 禁止在 checked 阶段插件中跳过 `arkts.recheckSubtree()` AST 修改。
- 禁止未经明确批准添加新的生产 npm 依赖。
- 禁止直接修改 `koala-wrapper/src/generated/` 或任何 `lib/` 输出中的生成文件。
- 禁止绕过 ui-syntax-plugins lint 规则来让测试通过。
- 禁止创建子目录间的反向依赖（正确方向：common -> collectors -> ui-plugins；不可逆转）。
- 禁止在同一组件变换中混用 V1 和 V2 装饰器 property translator。

### 历史坑与反模式
- Agent 常误以为 arkui-plugins 和 compiler 可交叉引用：二者是并行系统，arkui-plugins（静态类型工具链）用 es2panda AST，compiler（动态类型工具链）用 TypeScript AST，运行时不能互相调用。
- Agent 常在 checked 阶段插件中遗漏 `arkts.recheckSubtree()`：AST 修改后必须调用 recheck，否则类型检查进入过期状态（stale type-check）。
- Agent 常硬编码装饰器名而不使用 `common/predefines.ts` 常量：如写 '@Component' 而不用 `DecoratorNames.COMPONENT_DECORATOR`。
- Agent 常将 parsed 阶段和 checked 阶段的变换逻辑混淆：parsed 阶段修改结构（struct -> class），checked 阶段修改语义（属性/状态变换），两者的入口和调用时机不同。
- Agent 常在 V1/V2 装饰器混用检查中遗漏：ui-syntax-plugins 有专门的 `old-new-decorator-mix-use-check.ts` 和 `componentV2-mix-check.ts` 规则，Agent 修改 property-translators 时必须确保不引入新的混用路径。

### 需确认事项
- 添加新的 npm 依赖。
- 更改插件流水线顺序。
- 添加新的装饰器类型或变换规则。
- 更改 PluginContext、AbstractVisitor 或 ProgramVisitor API。
- 修改 `common/predefines.ts` 常量（影响所有插件）。
- 更改 Babel custom-import-plugin 路径解析机制。
- 删除兼容性 shim 或旧版 transformer 支持。
- 修改 GN 构建配置或 `build_ui_plugins.py`。

## 4. 验证闭环

### 最小检查
- 构建 arkui-plugins：`npm run compile`
- 清理构建：`npm run compile:clean && npm run compile`
- 运行测试：`npm run test`
- CI 测试：`npm run test:ci`

### 任务特定检查
- property translator 变更 -> 运行 `npm run test`，聚焦 ui-plugins 测试区域；验证特定装饰器变换
- memo 插件变更 -> 运行 `npm run test`，聚焦 memo-plugins 测试区域；验证变换后 recheckSubtree 调用
- 语法 lint 规则变更 -> 运行 `npm run test`，聚焦 ui-syntax 测试区域；验证规则产生正确诊断
- collector 变更 -> 运行 `npm run test`；验证 ui-plugins 和 ui-syntax-plugins 都正确收集元数据
- common/predefines 变更 -> 运行完整 `npm run test`；验证所有引用变更常量的插件
- path/Babel 解析变更 -> 运行 `npm run compile` 和 `npm run test`；验证运行时 @koalaui/libarkts 解析正确
- interop 插件变更 -> 运行 `npm run test`，聚焦 interop 测试区域；验证 struct 到 class 变换和 emit 生成

### 完成定义
任务仅在以下条件满足时视为完成：
- 请求的行为已实现。
- `npm run compile` 无错误通过。
- `npm run test` 在受影响插件区域通过，或给出了无法运行的原因。
- 最终回答包含变更文件、验证结果和剩余风险。
- 不包含无关的格式化、重构或顺手变更。

### 最终回复格式
完成非平凡任务时，回答必须包含：
- 变更摘要
- 变更文件列表
- 运行的验证命令及结果
- 兼容性、架构或跨模块影响（如适用）
- 剩余风险或待跟进项