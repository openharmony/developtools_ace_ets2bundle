# 需求文档 — @Builder自定义构建函数模块能力增强

## 一、原始需求

### 基本信息

| 字段 | 内容 |
|------|------|
| 需求ID | REQ-xx-xx-xx-03 |
| 需求名称 | @Builder自定义构建函数模块能力增强 |
| 来源 | 编译器工具链需求 |
| CodeSpec ID | issue-4720-builder-enhancement |
| 关联 Issue | https://gitcode.com/openharmony/developtools_ace_ets2bundle/issues/4720 |
| 目标仓 | `developtools/ace_ets2bundle` |
| 目标模块 | `compiler/` |
| 优先级 | P1 |
| 状态 | Baselined |

### 原始描述

增强@Builder自定义构建函数模块能力，共分为三个独立部分：

**第1部分：wrapBuilder/mutableBuilder 新增支持场景**

1. **namespace中的@Builder函数**：
   ```typescript
   // 文件A.ets
   @Builder
   function globalBuilder(): void { ... }
   export default { globalBuilder: globalBuilder }

   // 文件B.ets
   import * as a from './A'
   wrapBuilder(a.globalBuilder)
   ```

2. **动态导入文件中的@Builder函数**：
   ```typescript
   // 文件A.ets
   @Builder
   export function globalBuilder(): void { ... }

   // 文件B.ets
   wrapBuilder((await import('./A')).globalBuilder)
   ```

**第2部分：不支持场景告警**

@Builder函数转换位置在断言表达式（例如`this.builder()!`）、组合表达式（例如`(this.builder())`、`(this.isUseA ? this.builderA(): this.builderB())`）下不满足编译转换条件，需要新增告警：

```typescript
Stack()
  .bindSheet(this.isShowSheet, (this.builder()), { ... })
```

**第3部分：方法参数简写支持**

@Builder函数调用点的参数传入新增支持方法参数传入：

```typescript
class A {
  onClick: () => void = () => {};
}

@Builder
function builder(a: A): void { }

// 新增支持
builder({
  onClick() {
    ...
  }
})

// 转换为
builder({
  onClick: function() {
    ...
  }
})
```

### 背景与痛点

| 用户类型 | 当前痛点 | 影响 |
|----------|----------|------|
| ArkUI 应用开发者 | wrapBuilder仅支持直接引用的@Builder函数，无法使用namespace导出或动态导入的构建器 | 限制代码组织方式和模块化能力 |
| ArkUI 应用开发者 | @Builder函数被包裹时无告警，开发者难以理解为何转换失败 | 调试困难，开发体验差 |
| ArkUI 应用开发者 | 对象参数必须使用完整函数表达式，语法冗长 | 代码可读性下降 |

### 初始范围

**包含：**

1. wrapBuilder/mutableBuilder 新增支持2种参数来源
   - namespace中的@Builder函数
   - 动态导入(await import())中的@Builder函数

2. @Builder函数作为API参数时被包裹的场景告警
   - 断言表达式包裹（`this.builder()!`）
   - 组合表达式包裹（`(this.builder())`）
   - 嵌套条件表达式包裹（`(this.isUseA ? this.builderA() : this.builderB())`）

3. @Builder函数参数对象方法简写转换
   - 仅限@Builder函数参数场景
   - 转换为标准函数表达式

**不包含：**

1. TypeScript编译器核心修改
2. Runtime API变更
3. IDE/语法检查工具变更
4. 非@Builder函数的方法简写转换

### 初始假设

| 假设 | 类型 | 验证方式 | 状态 |
|------|------|----------|------|
| wrapBuilder和mutableBuilder需要同时支持新场景 | 技术 | 需求澄清 | 已确认 |
| 动态导入使用await import()语法 | 需求 | 需求澄清 | 已确认 |
| 不支持场景应给出编译告警而非错误 | 需求 | 需求澄清 | 已确认 |
| 方法简写转换仅限@Builder函数参数 | 需求 | 需求澄清 | 已确认 |

---

## 二、澄清记录

### 待澄清问题

| 编号 | 问题 | 为什么需要澄清 | 状态 |
|------|------|----------------|------|
| Q-1 | 3个部分是否都需要在同一版本实现？ | 决定工作范围和优先级 | 已澄清：全部实现 |
| Q-2 | 第2部分告警针对的具体场景是什么？ | 决定告警逻辑 | 已澄清：@Builder函数作为API参数时被包裹 |
| Q-3 | 第3部分方法简写转换的适用范围？ | 决定转换触发条件 | 已澄清：仅@Builder函数参数 |
| Q-4 | 动态导入使用哪种语法？ | 决定语法支持范围 | 已澄清：await import() |
| Q-5 | 不支持场景的编译器行为？ | 决定严重程度 | 已澄清：编译告警 |
| Q-6 | 排除哪些内容？ | 明确边界 | 已澄清：TS编译器核心/Runtime/IDE工具 |

### 讨论记录

| 日期 | 参与人 | 讨论主题 | 结论 | 后续动作 |
|------|--------|----------|------|----------|
| 2026-08-11 | - | 实现范围确认 | 3个部分全部实现 | 纳入规格 |
| 2026-08-11 | - | 告警场景确认 | @Builder函数作为API参数被包裹时告警 | 纳入规格 |
| 2026-08-11 | - | 方法简写范围确认 | 仅@Builder函数参数 | 纳入规格 |
| 2026-08-11 | - | 动态导入语法确认 | await import() | 纳入规格 |
| 2026-08-11 | - | 错误处理方式确认 | 编译告警级别 | 纳入规格 |

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
- [x] 基线已审批

---

## 三、需求基线

### 基线结论

| 字段 | 内容 |
|------|------|
| 基线状态 | **通过** |
| 基线日期 | 2026-08-11 |
| 复杂度级别 | **标准** |
| 进入规格阶段 | 是 |

### 范围确认

**包含范围（已确认）：**

1. **第1部分：wrapBuilder/mutableBuilder 新增支持（2个子场景）**
   - namespace中的@Builder函数：`wrapBuilder(a.globalBuilder)`
   - 动态导入中的@Builder函数：`wrapBuilder((await import('./A')).globalBuilder)`

2. **第2部分：不支持场景告警（3种表达式类型）**
   - 断言表达式包裹：`this.builder()!`
   - 组合表达式包裹：`(this.builder())`
   - 嵌套条件表达式包裹：`(this.isUseA ? this.builderA() : this.builderB())`
   - 告警级别：编译告警（WARNING）
   - 注：简单三元表达式（如`this.isUseA ? this.builderA : this.builderB`，无括号包裹且无函数调用）原本就支持编译转换，无需告警

3. **第3部分：方法参数简写转换**
   - 转换范围：仅@Builder函数参数
   - 转换规则：`onClick() {...}` → `onClick: function() {...}`

**不包含范围（已确认）：**

1. TypeScript编译器核心修改
2. Runtime API变更
3. IDE/语法检查工具变更
4. 非@Builder函数的方法简写转换

### 验收标准概览

| AC编号 | 描述 | 优先级 |
|--------|------|--------|
| AC-1.1 | 支持namespace中的@Builder函数作为wrapBuilder参数 | P0 |
| AC-1.2 | 支持动态导入中的@Builder函数作为wrapBuilder参数 | P0 |
| AC-2.1 | 断言表达式包裹@Builder函数时告警 | P0 |
| AC-2.2 | 组合表达式包裹@Builder函数时告警 | P0 |
| AC-2.3 | 条件表达式包裹@Builder函数时告警 | P1 |
| AC-3.1 | @Builder函数参数支持对象方法简写转换 | P0 |
| AC-3.2 | 非@Builder函数参数不进行方法简写转换 | P1 |

### 实现建议

1. **第1部分实现**（compiler/src/）：
   - 在 `process_component_build.ts` 中扩展 wrapBuilder/mutableBuilder 参数解析
   - 支持 namespace 成员访问、动态导入表达式、CustomBuilder返回类型
   - 新增类型判断函数

2. **第2部分实现**（compiler/src/checker/）：
   - 新增表达式包裹检测逻辑
   - 识别断言表达式、组合表达式、条件表达式
   - 输出 WARNING 级别告警信息

3. **第3部分实现**（compiler/src/transform/）：
   - 在 AST 转换阶段识别对象方法简写
   - 仅在@Builder函数调用上下文中进行转换
   - 转换为标准函数表达式

### 风险与依赖

| 风险/依赖 | 影响 | 缓解措施 |
|-----------|------|----------|
| namespace和动态导入的@Builder函数识别复杂度 | 代码正确性 | 完善单元测试覆盖 |
| 方法简写转换可能影响非预期场景 | 回归风险 | 严格限制转换范围到@Builder参数 |
| 现有代码可能触发新告警 | 用户感知变化 | 告警级别为WARNING，不阻止编译 |

---

## 四、相关链接

| 资源 | 链接 |
|------|------|
| GitCode Issue | https://gitcode.com/openharmony/developtools_ace_ets2bundle/issues/4720 |
| 相关文件 | `compiler/src/process_component_build.ts`, `compiler/src/checker/`, `compiler/src/transform/` |
| 参考模式 | 编译器AST转换模式 |
