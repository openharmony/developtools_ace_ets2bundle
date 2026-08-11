---
id: issue-4718-list-size-warning
type: feature
title: "List 组件尺寸设置编译告警"
spec_schema: ohos-sdd/v1
profile: arkui/toolchain
subprofiles: [compiler]
target_release:
  id: TBD
  status: ready
complexity: simple
lineage: new
status: specify
owner: TBD
source_issue: "https://gitcode.com/openharmony/developtools_ace_ets2bundle/issues/4718"
created_at: 2026-08-11
updated_at: 2026-08-11
related: []
related_tasks: []
related_decisions: []
code_refs:
  - "developtools/ace_ets2bundle/compiler/src/process_component_build.ts"
  - "developtools/ace_ets2bundle/compiler/components/list.json"
  - "developtools/ace_ets2bundle/compiler/components/common_attrs.json"
  - "developtools/ace_ets2bundle/compiler/src/log_message_collection.ts"
commits: []
---

# Manifest — List 组件尺寸设置编译告警

## 需求标识

| 字段 | 内容 |
|------|------|
| 需求ID | REQ-xx-xx-xx-01 |
| 需求名称 | List 组件尺寸设置编译告警 |
| func_id | TBD |
| feat_id | TBD |
| CodeSpec ID | issue-4718-list-size-warning |
| 关联 Issue | https://gitcode.com/openharmony/developtools_ace_ets2bundle/issues/4718 |

## 功能域路径

```text
ArkUI工具链 (Level1) > 编译器静态检查 (Level2) > List 组件尺寸检查 (Level3)
```

## 长期规格路径

| 资产 | 路径 |
|------|------|
| 长期 spec | `specs/compiler-list-size-warning/spec.md` |
| 长期 design | `specs/compiler-list-size-warning/design.md` |
| SpecTest feature | 编译器单测验证 |

## 阶段状态

| 阶段 | 状态 | 产物 |
|------|------|------|
| 定义 (Stage 1) | Approved | proposal.md |
| 规格说明 (Stage 2) | In Progress | spec.md |
| 设计 (Stage 3) | Pending | design.md |
| 计划 (Stage 4) | Pending | execution-plan.md |
| 发布闭环 (Stage 5) | Pending | - |

### 核心结论

- 本需求属于 `developtools/ace_ets2bundle/compiler/` 工具链静态检查能力
- 复杂度为简单，仅修改 `process_component_build.ts`
- 新增 WARNING 级别编译告警，不改变现有行为
- 支持 `layoutWeight` 和有效尺寸属性作为不告警条件

## baseline_approval

| 字段 | 内容 |
|------|------|
| approved | true |
| approver | TBD |
| evidence | 需求范围已明确，验收标准已定义 |
| date | 2026-08-11 |
