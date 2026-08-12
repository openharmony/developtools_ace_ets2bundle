---
id: issue-4720-builder-enhancement
type: feature
title: "@Builder自定义构建函数模块能力增强"
spec_schema: ohos-sdd/v1
profile: arkui/toolchain
subprofiles: [compiler/checker, compiler/transform]
target_release:
  id: TBD
  status: ready
complexity: standard
lineage: new
status: define
owner: TBD
source_issue: "https://gitcode.com/openharmony/developtools_ace_ets2bundle/issues/4720"
created_at: 2026-08-11
updated_at: 2026-08-11
related: []
related_tasks: []
related_decisions: []
code_refs:
  - "developtools/ace_ets2bundle/compiler/src/process_component_build.ts"
  - "developtools/ace_ets2bundle/compiler/src/checker/"
  - "developtools/ace_ets2bundle/compiler/src/transform/"
commits: []
---

# Manifest — @Builder自定义构建函数模块能力增强

## 需求标识

| 字段 | 内容 |
|------|------|
| 需求ID | REQ-xx-xx-xx-03 |
| 需求名称 | @Builder自定义构建函数模块能力增强 |
| func_id | TBD |
| feat_id | TBD |
| CodeSpec ID | issue-4720-builder-enhancement |
| 关联 Issue | https://gitcode.com/openharmony/developtools_ace_ets2bundle/issues/4720 |

## 功能域路径

```text
ArkUI工具链 (Level1) > 编译器@Builder转换 (Level2) > @Builder能力增强 (Level3)
```

## 长期规格路径

| 资产 | 路径 |
|------|------|
| 长期 spec | `specs/builder-enhancement/spec.md` |
| 长期 design | `specs/builder-enhancement/design.md` |
| SpecTest feature | 编译器单测验证 |

## 阶段状态

| 阶段 | 状态 | 产物 |
|------|------|------|
| 定义 (Stage 1) | Approved | proposal.md |
| 规格说明 (Stage 2) | Complete | design.md, spec.md |
| 设计 (Stage 3) | Pending | - |
| 计划 (Stage 4) | Pending | - |
| 发布闭环 (Stage 5) | Pending | - |

### 核心结论

- 本需求属于 `developtools/ace_ets2bundle/compiler/` 工具链@Builder转换能力增强
- 复杂度为标准级别，单仓特性
- 包含3个独立部分：wrapBuilder参数来源扩展、不支持场景告警、方法参数简写支持
- 不涉及TypeScript编译器核心修改、Runtime API变更、IDE工具变更

## baseline_approval

| 字段 | 内容 |
|------|------|
| approved | true |
| approver | 用户 |
| evidence | 需求范围已明确，8个验收标准已定义，6个澄清问题已解决 |
| date | 2026-08-11 |
