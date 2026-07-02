# Define Gate

> 结论：Approved。目标仓已从 `arkui_ace_engine` 校正为 `developtools/ace_ets2bundle/arkui-plugins`；FuncID/FeatID 不再作为流程阻塞项；一期映射契约已确认：增强现有转换前后 range 映射并补齐 Interop 适配。

## 信息检索记录

| 来源 | 读取/查询 | 关键发现 | 结果 |
|------|-----------|----------|------|
| 用户输入 | 2026-06-23 说明 | 需求属于工具链，代码位置在 `openHarmony/developtools/ace_ets2bundle/arkui-plugins` | 通过 |
| 用户输入 | 2026-06-23 澄清 | 增强现有转换前后代码行映射；静态一般以 range 表达；当前 Interop 未适配，需要修改 | 通过 |
| AGENTS | `AGENTS.md` | `compiler/` 与 `arkui-plugins/` 是并行系统；本需求应选静态类型 UI 工具链 `arkui-plugins` | 通过 |
| AGENTS | `arkui-plugins/AGENTS.md` | 插件流水线固定，所有 AST 操作基于 `@koalaui/libarkts`，不得编辑 `lib/` 输出 | 通过 |
| 源码 | `interop-plugins/index.ts` | `interop-plugin` 有 parsed/checked 两阶段入口 | 通过 |
| 源码 | `interop-plugins/decl_transformer.ts` | struct -> class 和 build 方法清空是 Interop range 适配的主要切入点 | 通过 |
| 源码 | `koala-wrapper/src/arkts-api/peers/AstNode.ts` | AST 节点有 `originalPeer`、`startPosition`、`endPosition`、`range` 能力 | 通过 |
| 源码 | `builder-lambda-translators/factory.ts` | 现有 `createDebugLineStatement()` 基于 `sourceNode.startPosition` 生成源码位置字符串，`setBuilderLambdaRange()` 已有 range 拷贝模式 | 通过 |
| 测试 | `test/ut/ui-plugins/builder-lambda/debug-line.test.ts` | 已有 debugLine 转换产物快照测试 | 通过 |
| 测试 | `test/demo/interop/builder_interop.ets` | 已有 Interop builder demo，可作为实现期验证基础 | 通过 |

## 检查表

| 检查项 | 结果 | 证据/缺口 | 后续动作 |
|--------|------|-----------|----------|
| 原始问题和期望结果已记录 | 通过 | `proposal.md` 已记录工具链版需求描述 | 无 |
| 目标仓和子目录已确认 | 通过 | 用户明确 `ace_ets2bundle/arkui-plugins` | 无 |
| 目标 Agent 指南已读取 | 通过 | 根 `AGENTS.md` 和 `arkui-plugins/AGENTS.md` | 无 |
| compiler/arkui-plugins 边界已确认 | 通过 | 本需求选择 `arkui-plugins`，不改 `compiler/` | 无 |
| 初始范围/非范围已记录 | 通过 | `proposal.md` 范围 | 无 |
| 现有实现事实已源码核对 | 通过 | `range/originalPeer/debugLine/setBuilderLambdaRange` 均已核对 | 无 |
| P0/P1 AC 已形成 | 通过 | `proposal.md` AC-1 至 AC-5 | Specify 阶段细化 |
| API 变更已评估 | 通过 | 不涉及 Public/System/C API | Design 阶段复核 |
| 映射产物契约已确认 | 通过 | 一期增强现有 range 映射；不新增独立 sourcemap | 无 |
| 验证边界已确认 | 部分通过 | 已知可用 `npm run compile`、`npm run test`；具体 fixture 在实现阶段确定 | Plan 阶段跟进 |

## 审批记录

| 字段 | 内容 |
|------|------|
| 阶段 | Define |
| 决策 | Approved |
| 审批人 | @lixingchi1 |
| 证据 | 用户确认静态侧以 range 为主，当前 Interop 未适配，需要修改 |
| 下一阶段 | Specify/Design/Plan |
| 重检范围 | Interop range 继承点、debugLine source 解析、自动化测试 fixture |

禁止事项：不得修改 `arkui-plugins/lib/`，不得更改插件流水线顺序，不得引入 `compiler/` 依赖，不得新增生产 npm 依赖。
