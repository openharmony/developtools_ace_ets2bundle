---
id: req-015-ui-interop-breakpoint-mapping
type: feature
title: UI互操作界面断点调试行列号映射
spec_schema: ohos-sdd/v1
profile: "custom/toolchain/arkui-plugins"
subprofiles:
  - "arkui-plugins/interop"
  - "arkui-plugins/ui-plugin"
target_release:
  id: TBD
  status: ready
complexity: "standard (static ArkTS UI transform + range mapping)"
lineage: "new-on-legacy"
status: release
owner: "@lixingchi1"
source_issue: ""
created_at: 2026-06-23
updated_at: 2026-07-01
baseline_approval:
  approved: true
  approver: "@lixingchi1"
  evidence: "User confirmed on 2026-06-23: enhance existing before/after code range mapping; static side uses range; Interop has not adapted and must be modified."
related_features: []
related_bugs: []
related_tasks: []
related_decisions:
  - "D-001: Use existing static AST range/original-node mapping as the phase-1 contract; do not add an independent sourcemap artifact in this phase."
  - "D-002: Mark helper nodes generated from one source node with setNoDebugLineFlag so step into does not stop repeatedly on the same source line."
code_refs:
  - OpenHarmony/developtools/ace_ets2bundle/AGENTS.md
  - OpenHarmony/developtools/ace_ets2bundle/arkui-plugins/AGENTS.md
  - OpenHarmony/developtools/ace_ets2bundle/arkui-plugins/interop-plugins/index.ts:27
  - OpenHarmony/developtools/ace_ets2bundle/arkui-plugins/interop-plugins/decl_transformer.ts:27
  - OpenHarmony/developtools/ace_ets2bundle/arkui-plugins/ui-plugins/index.ts:37
  - OpenHarmony/developtools/ace_ets2bundle/arkui-plugins/ui-plugins/builder-lambda-translators/factory.ts:357
  - OpenHarmony/developtools/ace_ets2bundle/arkui-plugins/ui-plugins/builder-lambda-translators/factory.ts:1164
  - OpenHarmony/developtools/ace_ets2bundle/arkui-plugins/common/plugin-context.ts:350
  - OpenHarmony/developtools/ace_ets2bundle/koala-wrapper/src/arkts-api/peers/AstNode.ts:43
  - OpenHarmony/developtools/ace_ets2bundle/koala-wrapper/src/arkts-api/peers/AstNode.ts:177
  - OpenHarmony/developtools/ace_ets2bundle/koala-wrapper/src/arkts-api/peers/AstNode.ts:193
  - OpenHarmony/developtools/ace_ets2bundle/koala-wrapper/src/arkts-api/utilities/public.ts:159
  - OpenHarmony/developtools/ace_ets2bundle/arkui-plugins/test/ut/ui-plugins/builder-lambda/debug-line.test.ts:35
  - OpenHarmony/developtools/ace_ets2bundle/arkui-plugins/test/demo/interop/builder_interop.ets
commits: []
---

# Manifest Notes

本需求已确认是工具链需求，目标代码位于 `developtools/ace_ets2bundle/arkui-plugins`，不是 `arkui_ace_engine`。FuncID/FeatID 属于知识库归档信息，不作为本需求 SDD 流程阻塞项。

Define 阶段的核心出口问题已由 Owner 澄清：一期不新增独立 sourcemap 产物，优先增强静态 ArkTS UI 转换链路中已有的转换前后 range 映射能力。当前差距集中在 `interop-plugins`：Interop 会在 parsed 阶段将 struct 转为 class、改写 build 方法，但未显式保留转换前源码 range/original-node 信息，导致后续 UI-Plugin/debugLine 等消费者可能拿到转换后节点位置。

当前 SDD 已推进到 Release Ready。实现范围聚焦 Interop range/originalPeer 继承，以及一源多辅助节点的 no-debug-line 标记；本需求不修改 `debugLine` 注入逻辑。编译、定向验证、非 Interop checked 回归和完整 `npm run test` 已通过。
