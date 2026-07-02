---
id: issue-4600-ui-interop-breakpoint-mapping
type: feature
title: "互操作断点调试需求"
spec_schema: ohos-sdd/v1
profile: arkui
subprofiles: [arkui/toolchain, arkui-plugins/interop, arkui-plugins/ui-plugin]
target_release:
  id: TBD
  status: ready
complexity: standard
lineage: new-on-legacy
status: release
owner: "@lixingchi1"
source_issue: "https://gitcode.com/openharmony/developtools_ace_ets2bundle/issues/4600"
created_at: 2026-06-23
updated_at: 2026-07-02
related: []
related_tasks:
  - TASK-001
  - TASK-002
  - TASK-003
  - TASK-004
related_decisions:
  - D-001
  - D-002
code_refs:
  - "developtools/ace_ets2bundle/arkui-plugins/interop-plugins/decl_transformer.ts"
  - "developtools/ace_ets2bundle/arkui-plugins/ui-plugins/interop/interop.ts"
  - "developtools/ace_ets2bundle/arkui-plugins/ui-plugins/interop/builder-interop.ts"
  - "developtools/ace_ets2bundle/arkui-plugins/ui-plugins/interop/legacy-transformer.ts"
  - "developtools/ace_ets2bundle/koala-wrapper/src/arkts-api/peers/AstNode.ts"
commits: []
---

# Manifest — 互操作断点调试需求

## 需求标识

| 字段 | 内容 |
|------|------|
| 需求ID | REQ-09-02-01-01 |
| 需求名称 | 互操作断点调试需求 |
| func_id | 09-02-01 |
| feat_id | Feat-01 |
| CodeSpec ID | issue-4600-ui-interop-breakpoint-mapping |
| 关联 Issue | https://gitcode.com/openharmony/developtools_ace_ets2bundle/issues/4600 |

## 功能域路径

```text
ArkUI工具链 (L1) > 静态ArkTS转换 (L2) > UI互操作调试信息 (L3, 09-02-01)
```

## 长期规格路径

| 资产 | 路径 |
|------|------|
| 长期 spec | `specs/09-02-01-ui-interop-debug-range/Feat-01-range-mapping-spec.md` |
| 长期 design | `specs/09-02-01-ui-interop-debug-range/design.md` |
| SpecTest feature | N/A（工具链 AST 转换能力，使用 arkui-plugins Jest/编译回归验证） |

## 阶段状态

| 阶段 | 状态 | 产物 |
|------|------|------|
| 定义 (Stage 1) | Approved | proposal.md, evidence/gates/gate-define.md |
| 规格说明 (Stage 2) | Approved | spec.md, evidence/gates/gate-specify.md |
| 设计 (Stage 3) | Approved | design.md, evidence/gates/gate-design.md |
| 计划 (Stage 4) | Approved | execution-plan.md, evidence/gates/gate-plan.md |
| 发布闭环 (Stage 5) | Release Ready | evidence/reviews/* |

### 核心结论

- 本需求属于 `developtools/ace_ets2bundle/arkui-plugins` 工具链能力，不涉及运行时 UI 语义。
- 一期不新增独立 sourcemap 文件，不修改 `debugLine` 注入逻辑。
- 以 AST `range` / `originalPeer` 继承作为转换前后源码位置映射契约。
- 一源多节点场景下，辅助生成节点使用 `setNoDebugLineFlag()`，避免断点单步在同一源码行重复停靠。

## baseline_approval

| 字段 | 内容 |
|------|------|
| approved | true |
| approver | @lixingchi1 |
| evidence | Owner 确认：本需求与 debugLine 无关，仅需设置正确 range，并对一源多节点的辅助节点设置 no-debug-line |
| date | 2026-06-24 |
