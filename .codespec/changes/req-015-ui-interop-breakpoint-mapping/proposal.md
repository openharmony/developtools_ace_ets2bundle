# 需求文档

> 状态：Approved（Define）/ Release Ready。目标仓已校正为工具链 `developtools/ace_ets2bundle/arkui-plugins`；一期范围已明确为增强现有转换前后 range/originalPeer 映射并补齐 Interop 适配。

## 一、原始需求

### 基本信息

| 字段 | 内容 |
|------|------|
| 需求ID | req-015-ui-interop-breakpoint-mapping |
| 需求名称 | UI互操作界面断点调试行列号映射 |
| 来源 | 用户当前会话原始需求 |
| 提出人 | 用户当前会话 |
| 目标发行版本 | TBD |
| Profile | custom/toolchain/arkui-plugins |
| 子模块 | `arkui-plugins/interop-plugins`、`arkui-plugins/ui-plugins`、`arkui-plugins/common` |
| 优先级 | P1 |
| 状态 | Release Ready |

### 原始描述

**原始问题：** 适配语言互操作断点调试功能，增加 UI 互操作界面的 UI 断点调试能力。ArkTS-Sta 调用 ArkTS-Dyn 时，ArkUI 开发者代码会经过 UI-Plugin 转换，需要将转换前的行列号映射到转换后的编译产物位置，类似 TypeScript compiler 的 sourcemap 映射。

**Owner 最新澄清：** 本需求不是新增独立映射文件优先，也不是 `debugLine` 功能本身；一期应增强现有转换前后代码行映射。静态工具链一般以 AST `range` / `originalPeer` 表达源码位置关系；当前 Interop 没有适配，需要修改。若一个源节点生成多个辅助节点，辅助节点需要通过 `setNoDebugLineFlag()` 标记为不落盘行列号，避免断点 step into 在同一源码行重复停留。

**目标代码位置：** `/data/home/l00580606/workspace/sdd/0618_REQ13/openHarmony/developtools/ace_ets2bundle/arkui-plugins`

**工具链定位：** `arkui-plugins` 是静态类型 ArkTS UI 编译工具链，基于 `@koalaui/libarkts` 操作 es2panda AST，在 parsed/checked 阶段将 ArkUI 声明式 UI 源码转换为命令式代码。它与 `compiler/` 动态类型工具链是并行系统，运行时不能交叉依赖。

### 痛点

| 用户类型 | 当前痛点 | 影响 |
|----------|----------|------|
| 应用开发者 | 在 ArkTS-Sta/ArkTS-Dyn UI 互操作场景中，调试位置可能落在 UI-Plugin 转换后的代码 | 断点设置、断点命中、单步和调用栈展示不直观 |
| 工具链开发者 | AST 转换过程中已有 range/original-node 机制，但 Interop 转换未系统保留转换前 range | 后续转换和调试链路消费到错误位置，定位链路不稳定 |
| 调试工具链维护者 | 无法稳定依赖静态 UI 转换后的节点 range 回溯到开发者源码 | 需要人工反查 AST 转换前后代码，调试闭环成本高 |

**期望结果：** 在静态 ArkTS UI 编译转换过程中，Interop 生成或改写的 AST 节点应保留转换前源码 range/original-node 关系；一源多辅助节点场景中的辅助节点应标记 no-debug-line，使后续转换和调试链路能够把 UI 断点、单步和调用栈位置映射回开发者源码。

## 二、背景证据

| 证据类型 | 路径 | 说明 |
|----------|------|------|
| Agent 指南 | `AGENTS.md` | 明确 `compiler/` 是动态类型工具链，`arkui-plugins/` 是静态类型 UI 编译工具链，二者不能交叉依赖 |
| Agent 指南 | `arkui-plugins/AGENTS.md` | 明确插件流水线：interop parsed -> ui parsed/checked -> ui-syntax checked -> memo checked；所有插件基于 `@koalaui/libarkts` |
| 源码核对 | `arkui-plugins/interop-plugins/index.ts:27-35` | `interopTransform()` 定义 parsed 与 checked 两阶段插件入口 |
| 源码核对 | `arkui-plugins/interop-plugins/decl_transformer.ts:27-65` | parsed 阶段将 ArkTS struct 转为 class，目前未显式继承原 struct range/original-node |
| 源码核对 | `arkui-plugins/interop-plugins/decl_transformer.ts:75-103` | `transformMethodDefinition()` 清空 build 方法体，目前未显式保证更新后方法和空 block 的源码 range |
| 源码核对 | `arkui-plugins/ui-plugins/interop/builder-interop.ts`、`arkui-plugins/ui-plugins/interop/interop.ts` | checked 阶段会把互操作 builder/component 调用改写为 `compatibleComponent` 包装，需要为主替换节点和辅助生成节点区分 range 映射与 no-debug-line 标记 |
| 源码核对 | `arkui-plugins/ui-plugins/builder-lambda-translators/factory.ts:1164-1175` | 已有 `setBuilderLambdaRange()` 明确把转换后 call 的 start/end 设为源 UI 调用或 trailing call 所属节点 |
| 源码核对 | `koala-wrapper/src/arkts-api/peers/AstNode.ts:43-52` | AST 节点支持 `originalPeer` 读写 |
| 源码核对 | `koala-wrapper/src/arkts-api/peers/AstNode.ts:177-198` | AST 节点支持 `startPosition`、`endPosition`、`range` 读写 |
| 源码核对 | `koala-wrapper/src/arkts-api/utilities/public.ts:159-167` | `getOriginalNode()` 可从节点回溯 original node |
| 测试核对 | `arkui-plugins/test/demo/interop/builder_interop.ets` | 已有互操作 builder demo，可作为实现验证样例基础 |
| 测试核对 | `arkui-plugins/test/ut/ui-plugins/builder-lambda/debug-line.test.ts` | 已有 debugLine 单测，覆盖转换产物中插入源码位置字符串 |

## 三、范围

**包含：**

- 在 `arkui-plugins/interop-plugins` parsed 阶段保留转换前 struct、class definition、build 方法等关键节点的 range/original-node 关系。
- 在 Interop 相关 checked 阶段生成 `compatibleComponent`、initializer/updater、附加 instantiate 方法等节点时，主替换节点映射回源节点，辅助生成节点设置 `setNoDebugLineFlag()`。
- 复用现有 AST `range`、`originalPeer`、`startPosition`、`endPosition` 能力，不新增生产依赖。
- 补充 `arkui-plugins` 单元测试或 demo 用例，覆盖 Interop range/originalPeer 映射契约。
- 明确映射缺失和无源码位置信息时的降级行为。

**不包含：**

- 不修改 `compiler/` 动态类型工具链，不从 `compiler/` 引入依赖。
- 不直接编辑 `arkui-plugins/lib/` 输出文件；必须修改 TypeScript 源码并通过 `npm run compile` 生成。
- 不更改插件流水线顺序。
- 不新增生产 npm 依赖。
- 不改变 ArkUI 运行时 UI 行为、组件语义、布局或渲染。
- 一期不新增独立 sourcemap/映射表文件；如后续调试器要求文件级 sourcemap，再另立需求或扩展本需求范围。

## 四、初始分级判断

| 判断项 | 结果 | 依据 |
|--------|------|------|
| 复杂度 | 标准 | 单仓工具链变更，但涉及 parsed/checked AST 变换、range/original-node 位置保持和调试信息消费 |
| 涉及仓数量 | 1 个 | `openHarmony/developtools/ace_ets2bundle` |
| 是否涉及 Public/System API | 否 | 工具链内部调试信息增强 |
| 是否涉及安全/性能关键路径 | 否 | 编译期/调试信息能力，不进入运行时 UI 热路径 |
| 是否跨 SIG | 低概率 | 一期只增强工具链 range 映射；调试器集成消费如需新增协议再另行确认 |

## 五、方案探索

| 编号 | 方案概述 | 优势 | 风险/代价 | 选择结论 |
|------|----------|------|-----------|----------|
| A-1 | 增强现有静态 AST range/original-node 映射，在 Interop 生成和更新节点时继承转换前源码 range | 符合静态工具链现有表达方式；改动集中；不新增产物协议 | 需要逐个确认 Interop 关键节点是否会被后续 UI 插件消费 | 选定，一期主方案 |
| A-2 | 对一源多辅助节点调用 `setNoDebugLineFlag()`，主替换节点保留 range/originalPeer | 避免同一源码行对应多个生成节点导致 step into 重复停留；与 range 映射契约互补 | 需要区分主节点和辅助节点，避免误标开发者可断点节点 | 选定，一期配套实现 |
| A-3 | 新增 sourcemap/映射表文件，输出转换前后 file/line/column 对 | 更接近 TypeScript compiler sourcemap，可服务更完整的断点正向映射 | 需要确认输出格式、产物路径、消费方和跨仓调试器接入 | 一期不做，保留后续扩展 |
| A-4 | 仅依赖运行时/IDE 对转换产物反查，不修改 UI-Plugin/Interop | 无工具链改动 | 不能稳定解决 UI-Plugin 转换造成的位置错位 | 放弃 |

**取舍理由：** 用户已明确“静态一般是指 range，Interop 没有适配”，且本需求与 `debugLine` 无关。因此一期以 AST range/original-node 继承为契约，同时对一源多辅助节点设置 no-debug-line，不引入独立 sourcemap 文件。

## 六、澄清记录

### 已澄清

| 编号 | 问题 | 结论 | 证据 |
|------|------|------|------|
| Q-1 | 目标仓是否是 `arkui_ace_engine`？ | 否，目标是工具链仓 `openHarmony/developtools/ace_ets2bundle/arkui-plugins` | 用户 2026-06-23 明确说明 |
| Q-2 | FuncID/FeatID 是否阻塞本需求？ | 不阻塞；该字段偏 ArkUI 知识库归档，本需求按工具链流程推进 | 用户 2026-06-23 明确说明“这个不关键” |
| Q-3 | 是否需要读取目标仓 AGENTS？ | 已读取根目录和 `arkui-plugins/AGENTS.md` | 本轮执行记录 |
| Q-4 | 本需求一期映射产物契约是什么？ | 增强现有转换前后代码行映射；静态侧以 range 为主；补 Interop 适配，不新增独立 sourcemap | 用户 2026-06-23 明确说明 |

### 待跟进

| 编号 | 问题 | 为什么需要跟进 | 状态 |
|------|------|----------------|------|
| F-1 | 最小互操作自动化样例最终选 `builder_interop.ets` 还是新增专用 range-mapping fixture？ | 决定测试输入文件和维护成本 | 已选新增专用 `range-mapping.ets` |
| F-2 | 调试器侧是否后续需要文件级 sourcemap/映射表？ | 决定是否另起扩展需求 | 一期非阻塞 |

## 七、用户故事与 AC

| Story ID | 用户故事 | 优先级 |
|----------|----------|--------|
| US-1 | 作为 ArkTS-Sta 应用开发者，我想在 UI 互操作源码上设置断点后看到源码位置，以便不被 UI-Plugin 生成代码干扰 | P0 |
| US-2 | 作为工具链开发者，我想在 Interop AST 转换过程中保留转换前后 range 关系，以便后续 UI 插件或调试信息能消费稳定位置 | P0 |
| US-3 | 作为调试工具维护者，我想在映射缺失时安全降级，以便不影响现有编译和调试流程 | P1 |

| AC编号 | 验收标准 | 类型 | 关联Story |
|--------|----------|------|-----------|
| AC-1 | WHEN Interop 将 ArkTS-Sta UI struct 转为 class THEN 转换后的 class/class definition 应保留原 struct/definition 的 range 或 original-node 关系 | 正常 | US-2 |
| AC-2 | WHEN Interop 改写 build 方法或生成空方法体 THEN 更新后的 method/function/block 应保留可回溯到原 build 方法的 range 或 original-node 关系 | 正常 | US-2 |
| AC-3 | WHEN 一个源 Interop 节点生成多个包装/辅助节点 THEN 主替换节点保留源 range/originalPeer，辅助节点设置 no-debug-line，避免同一源码行重复停留 | 正常 | US-1 |
| AC-4 | WHEN 源码位置信息缺失 THEN 转换应安全回退到现有行为，不影响编译产物 | 异常 | US-3 |
| AC-5 | WHEN 非 Interop 的现有 UI 转换场景执行 THEN 既有 builder lambda range 行为不发生回归 | 回归 | US-3 |

## 八、Define 结论

- [x] 目标仓和子目录已确认
- [x] 目标 AGENTS 已读取
- [x] 初始范围和非范围已记录
- [x] 现有 range/original-node/debugLine 链路已源码核对
- [x] AC 已形成
- [x] 映射产物契约已确认：一期增强现有 range 映射，补 Interop 适配

**结论:** Approved。已进入 Specify/Design/Plan。
