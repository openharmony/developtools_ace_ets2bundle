# AGENTS.md

## 1. 代码地图

本 AGENTS.md 适用于仓库根目录（`ace_ets2bundle`）。子目录 `arkui-plugins/` 和 `compiler/` 包含各自的 AGENTS.md 文件，具有更具体的规则。

本仓库实现 **OpenHarmony ArkTS 编译工具链**（ace_ets2bundle）。核心职责是将 ArkTS 声明式 UI 源代码转换为命令式 JavaScript，再转换为 ABC（Ark Bytecode）供 Ark 虚拟机执行。最重要的架构边界是：**compiler 是动态类型的 UI 编译工具链（基于 TypeScript AST），arkui-plugins 是静态类型的 UI 编译工具链（基于 es2panda AST）** — 它们是并行系统，运行时不能交叉依赖。

关键区域：
- `compiler/`：**动态类型**的 ArkTS UI 编译工具链，使用 TypeScript Compiler API。包含 53 个 TypeScript 源文件、Rollup/Webpack 插件链、组件定义、声明生成。有独立 AGENTS.md。
- `arkui-plugins/`：**静态类型**的 ArkTS UI 编译工具链，基于插件式 AST 变换系统，使用 `@koalaui/libarkts`（es2panda 绑定）。包含 ui-plugins、interop-plugins、memo-plugins、ui-syntax-plugins、collectors 和 common 基础设施。有独立 AGENTS.md。
- `ets1.2/`：下一代 ArkTS 1.2 编译基础设施（Koala/Arkoala）。包含 libarkts（程序化 es2panda 访问）、interop（C++/JS 桥接）、common、compat、build-common。
- `koala-wrapper/`：es2panda C++ 编译器前端的 TypeScript 包装绑定。提供 `@koalaui/libarkts` 作为 Node.js 原生插件。是 libarkts 的独立/SDK 分发版本，后续将由 `ets1.2/libarkts` 逐渐替代。
- `BUILD.gn`：根 GN 构建文件，编排所有构建动作（Babel 转译、声明生成、系统资源生成、SDK wrapper 构建、UI 插件构建、组件/声明复制）。
- `build_ets_loader_library.py`：Python 脚本，编排 5 步 compiler 构建流水线（Babel -> Uglify -> JSON copy -> Declarations -> KitConfigs）。
- `generateSysResource.py`：生成 `sysResource.js`（系统资源 ID，偏移量 `0x7800000`）。
- `install_arkguard_tsc_declgen.py`：将 TypeScript、arkguard、declgen npm 包解压到 compiler/node_modules/。

高频修改路径：
- `compiler/src/process_component_build.ts`、`compiler/src/validate_ui_syntax.ts`：核心变换和验证逻辑，组件相关变更最常涉及
- `arkui-plugins/ui-plugins/property-translators/`：状态管理装饰器变换器，新装饰器或属性变更最常涉及
- `arkui-plugins/common/predefines.ts`：装饰器/组件名常量，跨所有插件引用
- `compiler/components/*.json`：内置组件定义，组件新增/修改最常涉及

查找指引：
- 编译器转换逻辑 -> `compiler/`（详见其 AGENTS.md）
- ArkUI 插件转换逻辑 -> `arkui-plugins/`（详见其 AGENTS.md）
- 下一代 ArkTS 1.2 编译器 -> `ets1.2/`
- es2panda 原生绑定 -> `koala-wrapper/`
- GN 构建配置 -> `BUILD.gn`、`koala_integration.gni`
- 构建编排脚本 -> `build_ets_loader_library.py`、`generateSysResource.py`、`install_arkguard_tsc_declgen.py`

## 2. 知识路由

在规划或编辑之前，先分类任务并阅读匹配文档。

### 知识库索引
- 知识库入口 -> `docs/kb/README.md`
- 架构概述 -> `docs/kb/01-架构.md`
- 装饰器速查 -> `docs/kb/02-装饰器速查.md`
- 校验规则速查 -> `docs/kb/03-校验规则速查.md`
- 组件速查 -> `docs/kb/04-组件速查.md`
- 常见任务导航 -> `docs/kb/05-常见任务导航.md`
- 工具链能力总览 -> `docs/specs/README.md`

### 任务路由
- 编译器或转换逻辑变更 -> 阅读 `compiler/AGENTS.md`；规格 `docs/kb/02-装饰器速查.md` → `docs/specs/01-XX`
- ArkUI 插件或 AST 级转换变更 -> 阅读 `arkui-plugins/AGENTS.md`；规格 `docs/kb/02-装饰器速查.md` → `docs/specs/01-XX`
- 校验规则变更 -> 阅读 `arkui-plugins/AGENTS.md`；规格 `docs/kb/03-校验规则速查.md` → `docs/specs/02-XX`
- 组件定义或属性变更 -> 阅读 `compiler/如何新增或修改组件指导规范.md`；规格 `docs/kb/04-组件速查.md` → `docs/specs/01-09`
- ArkTS 1.2 / libarkts / es2panda 绑定变更 -> 阅读 `ets1.2/libarkts/` 源码和 `koala-wrapper/src/arkts-api/`
- 构建系统或 GN 配置变更 -> 阅读 `BUILD.gn` 和 `koala_integration.gni`
- 系统资源或 ID 变更 -> 阅读 `generateSysResource.py` 和 `id_defined.json`

### 路径路由
- `docs/specs/` -> 阅读 `docs/specs/README.md`（工具链能力总览）
- `docs/kb/` -> 阅读 `docs/kb/README.md`（知识库入口）
- `compiler/src/` -> 阅读 `compiler/AGENTS.md`
- `compiler/components/` -> 阅读 `compiler/如何新增或修改组件指导规范.md`
- `arkui-plugins/ui-plugins/` -> 阅读 `arkui-plugins/AGENTS.md`
- `arkui-plugins/common/` -> 阅读 `arkui-plugins/AGENTS.md`
- `ets1.2/libarkts/` -> 阅读 `ets1.2/` 源码（尚无 AGENTS.md）
- `koala-wrapper/native/` -> 阅读 koala-wrapper C++ 桥接源码

### 术语路由

当任务、issue、日志、API 或变更文件涉及以下术语时，在规划前阅读对应文档：

| 术语 | 风险提示 | 阅读 | 规格文档 |
|---|---|---|---|
| ArkTS | 带声明式 UI 的 TypeScript 超集，不是标准 TypeScript | `compiler/AGENTS.md`；关键源文件：`compiler/src/pre_define.ts` | — |
| ABC / Ark Bytecode | Ark VM 的最终输出格式；生成流水线复杂 | `compiler/AGENTS.md`；关键源文件：`compiler/src/fast_build/ark_compiler/common/ark_define.ts` | — |
| @Component / @State / @Link / @Prop | 状态管理装饰器，有严格的转换规则 | `compiler/AGENTS.md`（动态类型工具链）或 `arkui-plugins/AGENTS.md`（静态类型工具链），取决于修改哪个模块；关键源文件：`compiler/src/pre_define.ts`、`arkui-plugins/common/predefines.ts` | `docs/kb/02-装饰器速查.md` |
| es2panda | C++ 编译器前端；插件在其 AST 上操作，不是 TypeScript AST | `arkui-plugins/AGENTS.md`；关键源文件：`arkui-plugins/common/abstract-visitor.ts` | — |
| Koala / libarkts / arkoala | es2panda AST 的 TypeScript 绑定；存在两个版本（koala-wrapper 和 ets1.2/libarkts），koala-wrapper 后续将由 ets1.2/libarkts 逐渐替代 | `arkui-plugins/AGENTS.md` 或 `ets1.2/libarkts/` 源码；关键源文件：`arkui-plugins/path.ts` | — |
| ESMODULE / JSBUNDLE | 两种编译模式，输出结构不同；不可混淆 | `compiler/AGENTS.md`；关键源文件：`compiler/src/fast_build/ark_compiler/common/ark_define.ts` | — |
| Partial Update | 渲染优化模式；影响组件转换逻辑 | `compiler/AGENTS.md`；关键源文件：`compiler/src/process_component_build.ts` | — |
| @Reusable / @ReusableV2 | 组件复用装饰器；影响生命周期和内存管理转换 | `compiler/AGENTS.md` 或 `arkui-plugins/AGENTS.md`；关键源文件：`compiler/src/process_custom_component.ts` | `docs/kb/02-装饰器速查.md` |
| HAR / HSP | 包格式；决定编译模式（ESMODULE） | `compiler/AGENTS.md`；关键源文件：`compiler/src/fast_build/ark_compiler/common/ark_define.ts` | — |
| @Memo | 缓存注解；unmemoize 插件在转换后必须重新检查子树 | `arkui-plugins/AGENTS.md`；关键源文件：`arkui-plugins/memo-plugins/function-transformer.ts` | `docs/kb/02-装饰器速查.md` |
| @ComponentV2 / @Local / @Param / @Once / @Event | V2 状态管理装饰器；不可与 V1 装饰器混用 | `arkui-plugins/AGENTS.md`；关键源文件：`arkui-plugins/ui-plugins/property-translators/local.ts`、`param.ts` | `docs/kb/02-装饰器速查.md` |
| @Builder / @BuilderParam | 自定义构建函数装饰器；生成静态方法和 lambda 包装器 | `arkui-plugins/AGENTS.md`；关键源文件：`arkui-plugins/ui-plugins/builder-lambda-translators/` | `docs/kb/02-装饰器速查.md` |
| interop | ArkTS 组件的 struct 到 class 桥接；有独立插件流水线 | `arkui-plugins/AGENTS.md`；关键源文件：`arkui-plugins/interop-plugins/decl_transformer.ts` | — |
| component_map / component JSON | JSON 格式的内置组件注册表；必须遵循严格 schema | `compiler/如何新增或修改组件指导规范.md` | `docs/kb/04-组件速查.md` |
| arkguard | JS 混淆工具；通过安装脚本安装，不是 npm install | `install_arkguard_tsc_declgen.py` | — |
| declgen | 声明生成器；通过安装脚本安装 | `install_arkguard_tsc_declgen.py` | — |

在计划中声明：
- 任务类别（哪个模块/子系统）
- 已读文档
- 发现的约束
- compiler/ 还是 arkui-plugins/ 是正确的目标

## 3. 约束边界

### 架构/领域不变量
- compiler（TypeScript AST）和 arkui-plugins（es2panda AST）是并行转换系统；运行时不互相调用。
- arkui-plugins 依赖 koala-wrapper 的 `@koalaui/libarkts`；koala-wrapper 必须先于 arkui-plugins 构建。
- koala-wrapper 原生 C++ 插件依赖 `ets_frontend:libes2panda_public`；es2panda 库必须在构建 koala-wrapper 前可用。
- ets1.2/libarkts 原生共享库依赖 interop C++ 源码和 Panda SDK；这些必须在 libarkts 原生编译前构建/重新生成。
- `compile_plugin.js` 中 Rollup 插件链顺序固定，不可在不理解依赖流的情况下更改（memoryMonitor -> watchChangeFiles -> etsChecker -> visualTransform -> etsTransform -> apiTransform -> genAbc -> terserPlugin -> babelPlugin -> createProgramPlugin）。
- `src/` -> `lib/` 是单向 Babel 转译流水线；`lib/` 不可直接编辑。
- `compiler/main.js` 持有跨所有插件共享的全局可变状态；构建间必须通过 `resetMain()` 重置。
- `components/*.json` 是组件定义的数据层；`component_map.ts` 在运行时读取。
- `declarations/*.d.ts` 通过 `build_declarations_file.js` 从 SDK 接口文件生成；非手写。

### 禁止事项
- 禁止直接编辑 `lib/` 文件；必须编辑 `src/` 然后运行 `npm run build`。
- 禁止在不理解完整依赖图的情况下更改 `compile_plugin.js` 中插件链顺序。
- 禁止未经明确批准添加新的生产 npm 依赖；构建系统使用预解压的包（arkguard、typescript、declgen）。
- 禁止直接修改生成文件（`declarations/*.d.ts`、`koala-wrapper/src/generated/`、`ets1.2/libarkts/src/generated/`）；必须更新源规范并重新生成。
- 禁止绕过现有验证、linting 或语法检查来让测试通过。
- 禁止混淆 ESMODULE 和 JSBUNDLE 编译模式；它们产生根本不同的输出结构。
- 禁止在同一组件中混用 V1（@State、@Prop、@Link 等）和 V2（@Local、@Param、@Once、@Event 等）状态管理装饰器。
- 禁止在未更新 `compiler/如何新增或修改组件指导规范.md` 的情况下更改公共组件 JSON schema 字段（`name`、`attrs`、`atomic`、`parents`、`children`、`single`、`noDebugLine`、`systemApi`）。

### 历史坑与反模式
- Agent 常误判 compiler 和 arkui-plugins 可交叉引用：二者是并行系统，compiler（动态类型工具链）用 TypeScript AST，arkui-plugins（静态类型工具链）用 es2panda AST，运行时不能互相调用。
- Agent 常在 compiler/ 中直接编辑 `lib/` 文件：`lib/` 是 Babel 转译输出，必须编辑 `src/` 然后运行 `npm run build`。
- Agent 常混淆 ESMODULE 和 JSBUNDLE 输出结构：ESMODULE 按模块生成独立 .abc，JSBUNDLE 打包成单一 .abc 并激活 babelPlugin。
- Agent 常在 arkui-plugins checked 阶段插件中遗漏 `arkts.recheckSubtree()`：AST 修改后必须 recheck，否则类型检查过期。
- Agent 常硬编码装饰器名而不使用常量文件：compiler 用 `src/pre_define.ts`，arkui-plugins 用 `common/predefines.ts`。
- Agent 常在 compiler 和 arkui-plugins 之间误选目标：修改动态类型工具链选 compiler/，修改静态类型工具链选 arkui-plugins/。

### 需确认事项
- 添加新的 npm 依赖。
- 更改公共 API 语义或组件装饰器转换行为。
- 更改插件链顺序或添加新插件。
- 更改编译模式（ESMODULE vs JSBUNDLE）行为。
- 更改 GN 构建配置或构建流水线脚本。
- 删除兼容性 shim、迁移逻辑或旧版 webpack 支持。
- 更改组件 JSON schema 或添加/删除内置组件。
- 修改 es2panda 原生桥接 C++ 代码。

## 4. 验证闭环

### 最小检查
- 构建 compiler 模块：`cd compiler && npm run build`
- 构建 arkui-plugins：`cd arkui-plugins && npm run compile`
- Lint compiler：`cd compiler && npm run lint`
- 运行 compiler 测试：`cd compiler && npm test`
- 运行 arkui-plugins 测试：`cd arkui-plugins && npm run test`

### 任务特定检查
- Compiler 源码变更 -> 在 compiler/ 中运行 `npm run build` 然后 `npm test`
- ArkUI 插件源码变更 -> 在 arkui-plugins/ 中运行 `npm run compile` 然后 `npm run test`
- 组件 JSON 变更 -> 在 compiler/ 中运行 `npm run build` 然后 `npm test`；验证 component_map 加载
- 声明变更 -> 在 compiler/ 中运行 `npm run generateDeclarations`
- GN 构建变更 -> 验证受影响目标的完整 GN 构建通过
- 原生 C++ 变更 -> 验证共享库编译且 Node.js 插件正确加载

### 完成定义
任务仅在以下条件满足时视为完成：
- 请求的行为已实现。
- 相关的构建/测试/lint 检查已运行，或给出了无法运行的原因。
- 最终回答包含变更文件、验证结果和剩余风险。
- 不包含无关的格式化、重构或顺手变更。

### 最终回复格式
完成非平凡任务时，回答必须包含：
- 变更摘要
- 变更文件列表
- 运行的验证命令及结果
- 兼容性、架构或跨模块影响（如适用）
- 剩余风险或待跟进项