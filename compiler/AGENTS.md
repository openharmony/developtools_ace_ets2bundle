# AGENTS.md

## 1. 代码地图

本 AGENTS.md 适用于 `compiler/` 子目录及其全部子目录；当前没有更细粒度的子级 AGENTS.md。它是 **动态类型** 的 ArkTS UI 编译工具链，使用 TypeScript Compiler API，运行时不能与 `arkui-plugins/`（静态类型工具链）交叉依赖。

本模块实现 **ArkTS 声明式到命令式变换流水线**，将 ArkTS 源代码（TypeScript 超集，带 `@Component`、`@State` 等装饰器和声明式 UI）转换为命令式 JavaScript，再可选转换为 ABC（Ark Bytecode）供 Ark 虚拟机执行。最重要的架构边界是：**10 插件的 Rollup 链有固定顺序，不能在不理解完整依赖图的情况下更改**。

关键区域：
- `compile_plugin.js`：主入口，按固定顺序导出所有 Rollup 插件。插件链：memoryMonitor -> watchChangeFiles -> etsChecker -> visualTransform -> etsTransform -> apiTransform -> genAbc -> terserPlugin -> babelPlugin -> createProgramPlugin。
- `main.js`：全局可变状态中心（`projectConfig`、`globalProgram`、`resources`、`partialUpdateConfig`、`systemModules`、`sdkConfigs`）。跨所有插件共享，构建间必须通过 `resetMain()` 重置。
- `src/`：核心 TypeScript 源实现。不可直接编辑 `lib/`；必须编辑 `src/` 然后 Babel 转译。
- `src/process_component_build.ts`：**核心变换逻辑**。将声明式 UI `build()` 方法转换为命令式 create/pop 模式。
- `src/validate_ui_syntax.ts`：UI 语法验证。验证装饰器使用、组件继承、状态管理装饰器，收集组件信息到 `componentCollection`、`linkCollection` 等。
- `src/process_ui_syntax.ts`：UI 语法处理。处理 `$$` 语法（双向绑定）、`$$_` 语法、属性/事件绑定、样式属性。
- `src/process_component_class.ts`：组件类处理。识别 `@Component`，生成构造函数，处理生命周期方法（aboutToAppear、aboutToDisappear、aboutToBeDeleted）。
- `src/process_component_member.ts`：组件成员处理。变换状态管理装饰器：@State -> ObservedPropertySimple、@Prop -> SynchedPropertySimpleOneWay、@Link -> SynchedPropertySimpleTwoWay、@Provide/@Consume、@StorageLink/@StorageProp、@Builder -> 静态方法、@CustomDialog、@Watch。
- `src/process_custom_component.ts`：自定义组件处理。处理自定义组件参数、`@Reusable` 装饰器（组件复用）。
- `src/ets_checker.ts`：TypeScript LanguageService 包装。创建 TS Program、解析模块引用、运行 ArkTS Linter、收集源文件、支持增量编译。
- `src/pre_define.ts`：常量和预定义名称（装饰器名、组件方法名、控制流构造）。
- `src/component_map.ts`：内置组件和属性注册表。运行时从 `components/*.json` 读取。
- `src/fast_build/`：新一代 Rollup 构建插件。
  - `ark_compiler/`：ABC 字节码生成（transform.ts、rollup-plugin-gen-abc.ts、generate_module_abc.ts、generate_bundle_abc.ts、common/、module/、bundle/、interop/）。
  - `ets_ui/`：ETS UI 变换（rollup-plugin-ets-typescript.ts、rollup-plugin-ets-checker.ts、arkoala-plugin.ts）。
  - `system_api/`：系统 API 检查（rollup-plugin-system-api.ts、api_check_utils.ts、api_checker/、api_validator/）。
  - `common/`：共享 Rollup 构建工具（init_config.ts、process_project_config.ts、rollup-plugin-watch-change.ts）。
  - `meomry_monitor/`：内存监控插件。
  - `visual/`：Visual/SuperVisual 变换。
- `components/`：JSON 文件定义内置 UI 组件（name、attrs、atomic、parents、children、single、noDebugLine、systemApi）。`component_map.ts` 的数据层。
- `form_components/`：Form 特定组件定义（卡片/Widget 场景子集）。
- `declarations/`：TypeScript 声明文件（.d.ts），从 SDK 接口文件生成。非手写。
- `config/`：混淆白名单和状态管理白名单配置。
- `codegen/`：代码生成工具。
- `insight_intents/`：InsightIntent schema 定义，用于 @InsightIntentPage/@InsightIntentLink 装饰器。
- `server/`：构建流水线服务器（build_pipe_server.js），用于 preview 模式 WebSocket。
- `test/`：测试套件（ark_compiler_ut/、transform_ut/、interop_ui/、ut、pages/）。
- `lib/`：编译后的 JavaScript 输出（从 src/ Babel 转译）。**禁止直接编辑。**
- `docs/knowledge/`：按需加载的 ArkCompiler 领域知识，覆盖流水线、前置转换、ABC 后端、cache/sourceMap、reload 和覆盖边界；文内源码/测试路径相对 `compiler/`。本文件是唯一知识入口，领域文档之间不互相索引。

`docs/knowledge/` 当前系统化覆盖 fast build 的 ESMODULE + ES2ABC 基础主链。JSBUNDLE 深层逻辑、interop、旧 webpack、混淆和 ts2abc 只有覆盖边界；命中这些分支时按下方专项知识索引加载覆盖边界，不得直接套用主链结论。

查找指引：
- 插件链入口 -> `compile_plugin.js`
- 核心声明式到命令式变换 -> `src/process_component_build.ts`
- UI 语法验证（装饰器检查） -> `src/validate_ui_syntax.ts`
- 状态管理装饰器变换 -> `src/process_component_member.ts`
- 组件类构造函数生成 -> `src/process_component_class.ts`
- 类型检查和文件收集 -> `src/ets_checker.ts`
- 常量和预定义名称 -> `src/pre_define.ts`
- 内置组件注册表 -> `src/component_map.ts`、`components/*.json`
- Rollup 插件实现 -> `src/fast_build/`
- ABC 字节码生成 -> `src/fast_build/ark_compiler/`
- 新增/修改组件 -> `compiler/如何新增或修改组件指导规范.md`、`components/*.json`

## 2. 知识路由

在规划或编辑之前，先分类任务并阅读匹配文档。下表是 `docs/knowledge/` 的唯一索引；领域知识文件不是可选背景，但只加载任务命中的行，不从领域文档继续跳转。

### ArkCompiler 专项知识索引

| 场景、路径、术语或故障关键词 | 必须先读 |
|---|---|
| 插件链、hook、buildStart/buildEnd/cleanUp、跨插件数据流、checker/Program、`compile_plugin.js`、`src/fast_build/ets_ui/`、跨阶段上游产物偏离预期 | `docs/knowledge/fast-build-pipeline.md` |
| Sendable、shared module、import path、kit、lazy import、re-export、相关转换异常、`src/process_sendable.ts`、`src/fast_build/ark_compiler/check_shared_module.ts`、`src/process_kit_import.ts`、`src/process_lazy_import.ts`、`src/import_path_expand.ts` | `docs/knowledge/frontend-transforms.md` |
| ABC 未生成、recordName 错误、genAbc、ModuleSourceFile、ModuleMode、OHM URL、filesInfo、es2abc、`src/fast_build/ark_compiler/`、`src/process_module_files.ts`、`src/ark_utils.ts` | `docs/knowledge/module-and-abc-backend.md` |
| sourceMap 错误、增量结果陈旧、cache、incremental、`gen_hash.json`、`modules.cache`、`src/fast_build/ark_compiler/cache.ts`、`src/fast_build/ark_compiler/generate_sourcemap.ts`、`src/process_module_files.ts` | `docs/knowledge/cache-and-sourcemap.md` |
| reload 不生效、watch、hot/cold reload、changedFileList、symbol table、`src/fast_build/common/rollup-plugin-watch-change.ts`、`src/fast_build/ark_compiler/common/process_ark_config.ts`、`src/fast_build/ark_compiler/module/module_hotreload_mode.ts`、`src/fast_build/ark_compiler/module/module_coldreload_mode.ts` | `docs/knowledge/reload.md` |

### 任务路由
- 核心变换逻辑变更 -> 阅读 `src/process_component_build.ts`、`src/process_component_member.ts`、`src/pre_define.ts`
- 组件定义或属性变更 -> 阅读 `compiler/如何新增或修改组件指导规范.md`（新增/修改组件 JSON 文件和 common_attrs.json 的规则）
- 状态管理装饰器变换 -> 阅读 `src/process_component_member.ts` 和 `src/pre_define.ts` 中的装饰器常量
- UI 语法验证 lint 规则 -> 阅读 `src/validate_ui_syntax.ts` 和 `src/pre_define.ts`
- ABC 字节码生成/编译模式 -> 阅读 `src/fast_build/ark_compiler/` 和 `src/fast_build/ark_compiler/common/ark_define.ts`
- 构建系统/Rollup 插件链 -> 阅读 `compile_plugin.js` 和 `src/fast_build/common/`
- 声明生成 -> 阅读 `build_declarations_file.js`
- 混淆配置 -> 阅读 `config/` 目录和 `src/fast_build/ark_compiler/common/ob_config_resolver.ts`
- 增量编译/热重载 -> 阅读 `src/fast_build/ark_compiler/module/module_hotreload_mode.ts` 和 `src/fast_build/common/process_project_config.ts`

### 路径路由
- 修改 `src/process_component_build.ts` 时 -> 也必须阅读 `src/pre_define.ts`（装饰器常量）
- 修改 `src/validate_ui_syntax.ts` 时 -> 也必须阅读 `src/pre_define.ts`（装饰器常量）
- 修改 `src/fast_build/ark_compiler/` 时 -> 先阅读 `src/fast_build/ark_compiler/common/ark_define.ts`（编译模式定义）和 `src/fast_build/ark_compiler/rollup-plugin-gen-abc.ts`（入口）
- 修改 `src/fast_build/ets_ui/` 时 -> 先阅读 `src/fast_build/ets_ui/rollup-plugin-ets-typescript.ts` 和 `src/fast_build/ets_ui/rollup-plugin-ets-checker.ts`（入口）
- 修改 `components/*.json` 时 -> 阅读 `compiler/如何新增或修改组件指导规范.md`
- 修改 `declarations/*.d.ts` 时 -> 阅读 `build_declarations_file.js`（不要直接编辑声明）
- 修改 `src/pre_define.ts` 时 -> 这是装饰器/方法/控制流常量的唯一事实来源，影响全局
- 修改 `main.js` 时 -> 也必须阅读 `src/fast_build/common/process_project_config.ts`（配置初始化）
- 修改 `compile_plugin.js` 时 -> 必须理解完整插件链依赖图

### 术语路由

当任务、issue、日志、API 或变更文件涉及以下术语时，在规划前阅读对应文档：

| 术语 | 风险提示 | 阅读 |
|---|---|---|
| ArkTS | 带声明式 UI 的 TypeScript 超集，不是标准 TypeScript | `src/pre_define.ts`、`src/validate_ui_syntax.ts` |
| ABC / Ark Bytecode | Ark VM 的最终输出格式；生成流水线复杂 | `src/fast_build/ark_compiler/common/ark_define.ts` |
| ESMODULE | 按模块编译模式（HAR/HSP）；生成独立 .abc 文件 | `src/fast_build/ark_compiler/common/ark_define.ts` |
| JSBUNDLE | 打包编译模式（应用发布）；生成单一 .abc 包并激活 babelPlugin | `src/fast_build/ark_compiler/common/ark_define.ts` |
| @Component / @State / @Link / @Prop | V1 状态管理装饰器，有严格变换规则 | `src/pre_define.ts`、`src/process_component_member.ts` |
| @ComponentV2 / @Local / @Param / @Once / @Event | V2 状态管理装饰器；不可与 V1 装饰器混用 | `src/validate_ui_syntax.ts` |
| @Reusable / @ReusableV2 | 组件复用装饰器；影响生命周期和内存管理 | `src/process_custom_component.ts` |
| @Builder / @BuilderParam | 自定义构建函数装饰器；生成静态方法 | `src/pre_define.ts`、`src/process_component_member.ts` |
| Partial Update | 渲染优化模式；使用 elmtId 跟踪；影响组件变换 | `src/process_component_build.ts`、`src/process_custom_component.ts` |
| HAR / HSP | 包格式；决定 ESMODULE 编译模式 | `src/fast_build/ark_compiler/common/ark_define.ts` |
| component_map / component JSON | 内置组件注册表；必须遵循严格 JSON schema | `compiler/如何新增或修改组件指导规范.md` |
| common_attrs | common_attrs.json 中的共享/公共属性；变更需同步所有组件 | `compiler/如何新增或修改组件指导规范.md` |
| genAbc / gen_abc_plugin | ABC 字节码生成插件；有 module 和 bundle 两种模式 | `src/fast_build/ark_compiler/` |
| etsChecker / checker | 使用 TS LanguageService 的类型检查插件 | `src/ets_checker.ts` |
| etsTransform | 核心变换插件；编排所有组件处理 | `src/fast_build/ets_ui/rollup-plugin-ets-typescript.ts` |
| projectConfig | main.js 中的全局构建配置对象；跨所有插件共享 | `main.js` |
| resetMain | 构建间必须调用以重置全局可变状态 | `main.js` |
| arkguard | JS 混淆工具；通过安装脚本安装，不是 npm install | `install_arkguard_tsc_declgen.py` |
| declgen | 声明生成器；通过安装脚本安装 | `install_arkguard_tsc_declgen.py` |
| InsightIntent | 来自 @InsightIntentPage/@InsightIntentLink 的意图/导航元数据 | `insight_intents/`、`src/fast_build/ets_ui/` |

在计划中声明：
- 任务类别（哪个源文件或插件）
- 已读文档
- 发现约束
- 变更影响 ESMODULE、JSBUNDLE 还是两者
- 正确目标是 `compiler/` 还是 `arkui-plugins/`

## 3. 约束边界

### 架构/领域不变量
- `compile_plugin.js` 中 Rollup 插件链顺序固定：memoryMonitor -> watchChangeFiles -> etsChecker -> visualTransform -> etsTransform -> apiTransform -> genAbc -> terserPlugin -> babelPlugin -> createProgramPlugin。更改顺序影响构建正确性。
- `src/` -> `lib/` 是单向 Babel 转译流水线。`lib/` 不可直接编辑；必须编辑 `src/` 然后运行 `npm run build`。
- `main.js` 持有全局可变状态（`projectConfig`、`globalProgram`、`resources`、`partialUpdateConfig`、`systemModules`、`sdkConfigs`），跨所有插件共享。构建间必须通过 `resetMain()` 重置。
- `components/*.json` 是组件定义的数据层；`component_map.ts` 在运行时读取。组件 JSON schema 字段必须遵循 `如何新增或修改组件指导规范.md` 中的规范。
- `declarations/*.d.ts` 通过 `build_declarations_file.js` 从 SDK 接口文件生成；非手写。
- ESMODULE 和 JSBUNDLE 是根本不同的编译模式。ESMODULE 生成按模块 .abc 文件；JSBUNDLE 生成单一 .abc 包并激活 babelPlugin 进行 CommonJS 变换。不可混淆。
- V1（@State、@Prop、@Link 等）和 V2（@Local、@Param、@Once、@Event 等）状态管理装饰器不可在同一组件中混用。`validate_ui_syntax.ts` 强制执行此规则。
- compiler（动态类型，TypeScript AST）和 arkui-plugins（静态类型，es2panda AST）是并行系统；运行时不能交叉依赖。
- TypeScript、arkguard 和 declgen 通过 `install_arkguard_tsc_declgen.py` 从预解压 .tgz 包安装；不是通过 `npm install` 安装。
- 新增跨插件状态时必须明确初始化点、唯一所有者、消费者和 `cleanUp` 时机，避免跨构建污染。
- 专项知识仅系统化覆盖 fast build ESMODULE + ES2ABC 基础主链；JSBUNDLE 深层逻辑、interop、旧 webpack、混淆和 ts2abc 必须独立分析。

### 禁止事项
- 禁止直接编辑 `lib/` 文件；必须编辑 `src/` 然后运行 `npm run build`。
- 禁止在不理解完整依赖图的情况下更改 `compile_plugin.js` 中插件链顺序。
- 禁止未经明确批准添加新的生产 npm 依赖。
- 禁止直接修改 `declarations/*.d.ts`；必须更新 SDK 接口文件并通过 `npm run generateDeclarations` 重新生成。
- 禁止在未更新 `如何新增或修改组件指导规范.md` 的情况下修改 `components/*.json` schema 字段（`name`、`attrs`、`atomic`、`parents`、`children`、`single`、`noDebugLine`、`systemApi`）。
- 禁止绕过现有验证、linting 或语法检查来让测试通过。
- 禁止混淆 ESMODULE 和 JSBUNDLE 编译模式。
- 禁止在同一组件中混用 V1 和 V2 状态管理装饰器。
- 禁止在未同步所有引用组件的情况下删除 `common_attrs.json` 条目。
- 禁止硬编码装饰器名；必须使用 `src/pre_define.ts` 中的常量。
- 禁止在未理解 hook 和数据依赖时移动插件、前置 transformer 或跨阶段能力。
- 禁止只检查 `genAbc` 就断言 ABC 问题根因；必须追踪 checker、transform、ModuleSourceFile 和后端描述。
- 禁止混淆 TS/ETS lazy import 与 JS lazy import 接入点。
- 禁止只修改 reload mode 而忽略 checker -> watch -> changedFileList -> config -> mode 数据链。

### 历史坑与反模式
- Agent 常直接编辑 `lib/` 文件：`lib/` 是 Babel 转译输出，必须编辑 `src/` 然后运行 `npm run build`。已有多次误操作案例。
- Agent 常混淆 ESMODULE 和 JSBUNDLE 输出结构：ESMODULE 按模块生成独立 .abc（用于 HAR/HSP），JSBUNDLE 打包成单一 .abc 并激活 babelPlugin（用于应用发布）。
- Agent 常硬编码装饰器名而不使用 `src/pre_define.ts` 常量：如写 '@State' 而不用 `COMPONENT_STATE_DECORATOR`。
- Agent 常忘记在构建间调用 `resetMain()`：`main.js` 持有全局可变状态，不重置会导致状态残留和构建错误。
- Agent 常在修改组件属性时遗漏 `common_attrs.json` 同步：通用属性变更必须同步更新 `common_attrs.json`，否则其他组件的属性校验会失败。
- Agent 常误判 compiler 和 arkui-plugins 可交叉引用：compiler（动态类型工具链）用 TypeScript AST，arkui-plugins（静态类型工具链）用 es2panda AST，运行时不能互相调用。

### 需确认事项
- 添加新的 npm 依赖。
- 更改公共 API 语义或组件装饰器变换行为。
- 更改插件链顺序或添加新插件。
- 更改编译模式（ESMODULE vs JSBUNDLE）行为。
- 更改 GN 构建配置或 `build_ets_loader_library.py` 流水线。
- 删除兼容性 shim、迁移逻辑或旧版 webpack 支持。
- 更改组件 JSON schema 或添加/删除内置组件。
- 修改 `common_attrs.json`（影响所有组件）。
- 更改持久化 cache、filesInfo 或 es2abc 输入格式。

## 4. 验证闭环

命令均从 `compiler/` 执行。`npm run build` 会生成 `lib/` 和声明相关产物；`npm run lint` 带 `--fix` 会写回 `src/`；`arkTest`/`etsTest` 自带 build 并可能写临时目录或 fixture。在脏工作区运行前必须确认并检查差异。

### 最小检查
- 构建 compiler 模块：`npm run build`
- Lint compiler：`npm run lint`
- 只读 Lint：`./node_modules/.bin/eslint ./src --ext .ts`
- 运行 compiler 测试：`npm test`
- 运行特定测试套件：
  - Ark 编译器测试：`npm run arkTest`
  - Transform 测试：`npm run etsTest`

`npm test` 默认运行 UI/transform 回归，不包含 `arkTest`。

### 任务特定检查
- 仅文档变更 -> 校验 Markdown 链接和路径，运行 `git diff --check`；无需生成 `lib/`
- 源码变换变更 -> 运行 `npm run build` 然后 `npm test`
- 组件 JSON 变更 -> 运行 `npm run build` 然后 `npm test`；验证 component_map 加载
- 声明变更 -> 运行 `npm run generateDeclarations`
- 组件属性变更 -> 运行 `npm run build` 然后 `npm test`；验证 common_attrs.json 同步
- ESMODULE/JSBUNDLE 模式变更 -> 同时运行 `npm run arkTest` 和 `npm run etsTest`
- 混淆配置变更 -> 运行 `npm run build` 然后进行 release 模式构建
- 增量编译变更 -> 运行 `npm test` 并验证热重载场景
- ESLint 规则变更 -> 对所有 src/ 文件运行 `npm run lint`
- fast build 前置转换、ABC 后端、cache/sourceMap/reload 变更 -> 运行 `npm run arkTest`，并按命中领域文档的“代码和测试”选择邻近测试
- 聚焦单个 `arkTest` 文件或 `--grep` 用例 -> 按 build → kit config → Babel 转译测试 → Mocha 的顺序执行；无论成功失败都运行 `npm run run:cleanArkTest`，且清理不得掩盖测试失败码
- UI 语义或装饰器变更 -> 运行 `npm run etsTest`；跨后端行为再运行 `npm run arkTest`
- 公共声明/API 变更 -> 审查生成声明、签名和生命周期兼容性；仓库没有独立兼容性脚本时在最终报告说明

### 完成定义
以下 build/lint/test 要求适用于源码任务；仅文档任务按上面的文档检查替代。

任务仅在以下条件满足时视为完成：
- 请求的行为已实现。
- `npm run build` 无错误通过。
- `npm run lint` 通过。
- `npm test` 在受影响区域通过，或给出了无法运行的原因。
- 最终回答包含变更文件、验证结果和剩余风险。
- 不包含无关的格式化、重构或顺手变更。

### 最终回复格式
完成非平凡任务时，回答必须包含：
- 变更摘要
- 变更文件列表
- 运行的验证命令及结果
- 兼容性、编译模式或跨模块影响（如适用）
- 剩余风险或待跟进项
