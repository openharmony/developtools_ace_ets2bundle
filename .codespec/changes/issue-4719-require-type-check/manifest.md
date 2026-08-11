---
id: issue-4719-require-type-check
type: feature
title: "@Require修饰的数据支持类型校验"
spec_schema: ohos-sdd/v1
profile: arkui/toolchain
subprofiles: [compiler]
target_release:
  id: TBD
  status: ready
complexity: simple
lineage: new
status: define
owner: TBD
source_issue: "https://gitcode.com/openharmony/developtools_ace_ets2bundle/issues/4719"
created_at: 2026-08-11
updated_at: 2026-08-11
related: []
related_tasks: []
related_decisions: []
code_refs:
  - "developtools/ace_ets2bundle/compiler/src/" (待确定具体文件)
commits: []
---

# Manifest — @Require修饰的数据支持类型校验

## 需求标识

| 字段 | 内容 |
|------|------|
| 需求ID | REQ-xx-xx-xx-02 |
| 需求名称 | @Require修饰的数据支持类型校验 |
| func_id | TBD |
| feat_id | TBD |
| CodeSpec ID | issue-4719-require-type-check |
| 关联 Issue | https://gitcode.com/openharmony/developtools_ace_ets2bundle/issues/4719 |

## 功能域路径

```text
ArkUI工具链 (Level1) > 编译器静态检查 (Level2) > @Require字段类型校验 (Level3)
```

## 长期规格路径

| 资产 | 路径 |
|------|------|
| 长期 spec | `specs/compiler-require-type-check/spec.md` |
| 长期 design | `specs/compiler-require-type-check/design.md` |
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

- 本需求属于 `developtools/ace_ets2bundle/compiler/` 工具链静态检查能力
- 复杂度为简单，单仓小修
- 新增 WARNING 级别编译告警，不改变现有行为
- 仅检查 `@Require` 修饰的 non-null 类型字段接收显式 `undefined` 的场景

## baseline_approval

| 字段 | 内容 |
|------|------|
| approved | true |
| approver | TBD |
| evidence | 需求范围已明确，验收标准已定义 |
| date | 2026-08-11 |
