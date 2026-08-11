# 需求文档 — List 组件尺寸设置编译告警

## 一、原始需求

### 基本信息

| 字段 | 内容 |
|------|------|
| 需求ID | REQ-xx-xx-xx-01 |
| 需求名称 | List 组件尺寸设置编译告警 |
| 来源 | 编译器工具链需求 |
| CodeSpec ID | issue-4718-list-size-warning |
| 关联 Issue | https://gitcode.com/openharmony/developtools_ace_ets2bundle/issues/4718 |
| 目标仓 | `developtools/ace_ets2bundle` |
| 目标模块 | `compiler/` |
| 优先级 | P1 |
| 状态 | Baselined |

### 原始描述

为 List 组件添加尺寸属性缺失的编译告警，提醒开发者在 List 组件上设置适当的尺寸属性或使用 `layoutWeight`。

### 背景与痛点

| 用户类型 | 当前痛点 | 影响 |
|----------|----------|------|
| ArkUI 应用开发者 | List 组件未设置尺寸属性时，运行时可能出现布局异常，但编译时无提示 | 布局问题难以早期发现，调试成本高 |
| 编译器工具链开发者 | 缺少对 List 组件尺寸属性的静态检查能力 | 无法在编译阶段提前预警常见布局错误 |

### 初始范围

**包含：**

- List 组件尺寸属性缺失的编译告警
- 支持 `layoutWeight` 属性的识别（有此属性时不告警）
- 支持各方向尺寸属性的识别：
  - 垂直方向（`listDirection` 为 `Vertical` 或默认）：`height`、`size`、`constraintSize.maxHeight`、`aspectRatio`
  - 水平方向（`listDirection` 为 `Horizontal`）：`width`、`size`、`constraintSize.maxWidth`、`aspectRatio`
- 约束：`constraintSize.minHeight` 和 `constraintSize.minWidth` 单独存在时仍触发告警
- 编译器 WARNING 级别告警

**不包含：**

- 其它容器组件（Grid、WaterFlow、Swiper 等）的类似检查
- ListItem 或 ListItemGroup 组件的检查
- 运行时组件行为的修改
- UI 框架渲染逻辑的修改
- 新增 API 或公共接口

### 初始假设

| 假设 | 类型 | 验证方式 | 状态 |
|------|------|----------|------|
| List 组件属性在编译阶段可静态获取 | 技术 | 代码核对 | 待验证 |
| `layoutWeight` 属性可作为尺寸设置的替代条件 | 需求 | 需求澄清 | 已确认 |
| 告警级别为 WARNING 而非 ERROR | 需求 | 需求澄清 | 已确认 |
| 仅 `constraintSize.max*` 属性有效，min 属性无效 | 需求 | 需求澄清 | 已确认 |

---

## 二、澄清记录

### 待澄清问题

| 编号 | 问题 | 为什么需要澄清 | 状态 |
|------|------|----------------|------|
| Q-1 | 是否需要支持其它容器组件 | 决定影响面 | 已澄清：仅 List 组件 |
| Q-2 | `layoutWeight` 是否可作为替代条件 | 决定告警逻辑 | 已澄清：是 |
| Q-3 | `constraintSize` 的 min 属性是否有效 | 决定属性识别规则 | 已澄清：仅 max 属性有效 |
| Q-4 | 告警级别是 WARNING 还是 ERROR | 决定严重程度 | 已澄清：WARNING |

### 讨论记录

| 日期 | 参与人 | 讨论主题 | 结论 | 后续动作 |
|------|--------|----------|------|----------|
| 2026-08-11 | - | 需求范围 | 仅针对 List 组件，不扩展到其它容器 | 按简单复杂度推进 |
| 2026-08-11 | - | 属性识别规则 | layoutWeight 或有效尺寸属性任一满足即可不告警 | 纳入规格 |
| 2026-08-11 | - | constraintSize 处理 | 仅 max* 属性有效，min 属性无效 | 纳入规格 |

### 方案探索

| 编号 | 方案概述 | 优势 | 风险/代价 | 选择结论 |
|------|----------|------|-----------|----------|
| A-1 | 在 `bindComponentAttr` 中创建独立上下文对象收集属性 | 结构清晰，易于维护 | 需新增接口定义 | 选择 |
| A-2 | 内联检查逻辑 | 实现简单 | 代码耦合，难以扩展 | 不选 |

**取舍理由：** A-1 提供了清晰的数据结构，便于后续扩展和维护，符合现有代码组织模式。

### 子系统影响

| 问题 | 回答 | 状态 |
|------|------|------|
| 涉及哪些子系统？ | `developtools/ace_ets2bundle/compiler/` | 已确认 |
| 是否跨仓？ | 否 | 已确认 |
| 是否涉及公共 API？ | 否 | 已确认 |
| 是否影响运行时？ | 否 | 已确认 |

### 进入规格阶段条件

- [x] 原始问题和期望结果已记录
- [x] 需求来源和责任人已明确
- [x] 初始范围和不包含项已记录
- [x] 关键假设和待澄清问题已列出
- [x] 技术方案方向已收敛

---

## 三、需求基线

### 基线结论

| 字段 | 内容 |
|------|------|
| 基线状态 | **通过** |
| 基线日期 | 2026-08-11 |
| 复杂度级别 | **简单** |
| 进入规格阶段 | 是 |

### 范围确认

**包含范围（已确认）：**

1. List 组件尺寸属性缺失的编译告警
2. `layoutWeight` 属性作为替代条件
3. 方向相关的尺寸属性识别
4. `constraintSize` 仅 max 属性有效
5. WARNING 级别告警

**不包含范围（已确认）：**

1. 其它容器组件
2. ListItem 组件检查
3. 运行时行为修改
4. 新增公共 API

### 验收标准概览

| AC编号 | 描述 | 优先级 |
|--------|------|--------|
| AC-1 | List 无尺寸属性时告警 | P0 |
| AC-2 | 有 layoutWeight 时不告警 | P0 |
| AC-3 | 有有效尺寸属性时不告警 | P0 |
| AC-4 | constraintSize 的 min 属性不触发满足条件 | P1 |

### 实现建议

1. 在 `compiler/src/process_component_build.ts` 的 `bindComponentAttr` 函数中添加检查逻辑
2. 创建 `ListSizeCheckContext` 接口用于收集属性信息
3. 参考 `log_message_collection.ts` 中现有检查函数的模式
4. 使用 `addLog` 工具函数输出 WARNING

### 风险与依赖

| 风险/依赖 | 影响 | 缓解措施 |
|-----------|------|----------|
| 现有 List 组件代码可能产生新告警 | 用户感知变化 | 告警级别为 WARNING，不阻止编译 |
| 属性识别规则复杂度 | 代码正确性 | 完善测试用例矩阵 |

---

## 四、相关链接

| 资源 | 链接 |
|------|------|
| GitCode Issue | https://gitcode.com/openharmony/developtools_ace_ets2bundle/issues/4718 |
| 相关文件 | `compiler/src/process_component_build.ts` |
| 参考模式 | `compiler/src/log_message_collection.ts` |
