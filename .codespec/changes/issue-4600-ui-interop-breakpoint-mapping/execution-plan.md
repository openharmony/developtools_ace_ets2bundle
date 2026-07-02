# 执行计划 — 互操作断点调试需求

## 计划元数据

| 字段 | 内容 |
|------|------|
| 关联需求 | REQ-09-02-01-01 |
| 关联设计 | design.md (DESIGN-09-02-01-01) |
| 关联 Spec | spec.md (FEAT-09-02-01-01) |
| CodeSpec ID | issue-4600-ui-interop-breakpoint-mapping |
| 关联 Issue | https://gitcode.com/openharmony/developtools_ace_ets2bundle/issues/4600 |
| 复杂度 | 标准 |
| 状态 | Release Ready |

## 执行策略

按转换链路自底向上推进：先收敛 common helper，再覆盖 Interop parsed 阶段，随后覆盖 checked/legacy 互操作辅助节点，最后补齐测试和回归验证。

## 任务拆解

### Task 1: Source mapping helper 收敛

**目标：** 建立统一 helper，封装 range/originalPeer 继承、安全降级和 no-debug-line 标记。

**关联 AC：** AC-1.4, AC-2.3, AC-3.1, AC-3.2

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `arkui-plugins/common/source-mapping.ts` | 新增 | 统一封装源码位置继承和 no-debug-line 标记 |
| `arkui-plugins/test/ut/common/source-mapping.test.ts` | 新增 | 覆盖 helper 正常、缺失位置、安全降级、递归标记 |

**验证方式：** `npx jest test/ut/common/source-mapping.test.ts`

---

### Task 2: Interop parsed 阶段 range/originalPeer 映射

**目标：** struct -> class、class definition、build method/function/body 转换后保留源位置。

**依赖：** Task 1

**关联 AC：** AC-1.1, AC-1.2, AC-1.3

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `arkui-plugins/interop-plugins/decl_transformer.ts` | 修改 | 在 parsed 转换点应用 source mapping helper |
| `arkui-plugins/test/ut/interop-plugins/range-mapping.test.ts` | 新增 | 验证 struct/class/build 映射 |

**验证方式：** `npx jest test/ut/interop-plugins/range-mapping.test.ts`

---

### Task 3: Interop checked/legacy 主辅节点处理

**目标：** 主替换节点继承源位置，辅助生成节点设置 no-debug-line。

**依赖：** Task 1

**关联 AC：** AC-2.1, AC-2.2, AC-3.1, AC-3.2, AC-3.3

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `arkui-plugins/ui-plugins/interop/interop.ts` | 修改 | 主替换节点继承源位置 |
| `arkui-plugins/ui-plugins/interop/builder-interop.ts` | 修改 | helper/包装节点标记 no-debug-line |
| `arkui-plugins/ui-plugins/interop/legacy-transformer.ts` | 修改 | legacy 生成节点补齐主辅策略 |
| `arkui-plugins/test/demo/mock/interop/range-mapping.ets` | 新增 | Interop range-mapping fixture |

**验证方式：** Interop 定向 Jest + 非 Interop checked 回归

---

### Task 4: 回归验证和发布闭环

**目标：** 确认本需求不破坏既有 UI 转换行为，并归档验证证据。

**依赖：** Task 1, Task 2, Task 3

**关联 AC：** AC-4.1, AC-4.2, AC-4.3

| 验证项 | 命令 / 方式 | 期望 |
|--------|-------------|------|
| 编译 | `cd arkui-plugins && npm run compile` | 通过 |
| 定向单测 | `npx jest test/ut/common/source-mapping.test.ts` | 通过 |
| Interop 单测 | `npx jest test/ut/interop-plugins/range-mapping.test.ts` | 通过 |
| 非 Interop 回归 | builder-lambda/debug-line、navigation、wrap-builder 定向用例 | 通过 |
| 完整测试 | `cd arkui-plugins && npm run test` | 通过 |
| SDD 证据 | `.codespec/changes/issue-4600-ui-interop-breakpoint-mapping/evidence/reviews/*` | 归档 |

## 当前验证结果

| 项 | 结果 |
|----|------|
| `npm run compile` | 通过 |
| `source-mapping.test.ts` | 7/7 通过 |
| `range-mapping.test.ts` | 1/1 通过 |
| 非 Interop 定向回归 | 通过 |
| 完整 `npm run test` | 193/193 suites，236/236 tests 通过 |
| `ohos_sdk_pre` 环境验证 | 通过 |
