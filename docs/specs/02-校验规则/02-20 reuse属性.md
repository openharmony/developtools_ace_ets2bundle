# 规则
校验 `reuse` 属性只能用于 `@ComponentV2`+`@ReusableV2` 组件、`reuseId` 属性不能用于 `@ComponentV2`+`@ReusableV2` 组件。

## 补充说明
- `arkui-plugins/common/predefines.ts:129`（`StructDecoratorNames.REUSABLE_V2`）
- `arkui-plugins/common/predefines.ts:128`（`StructDecoratorNames.REUSABLE`）
## 源码参考位置
- 动态：`compiler/src/process_component_build.ts:3092`（`addComponentAttr`，reuse/reuseId 属性检测） 中的 reuse 属性处理逻辑
- 静态：`arkui-plugins/collectors/ui-collectors/validators/rules/check-reuse-attribute.ts:47`

## 适用对象
- 组件初始化调用（使用 `.reuse()` 或 `.reuseId()` 链式属性的组件调用）

## 报错信息
- 动态：
  - 无对应动态工具链校验
- 静态：
  - `The reuse attribute is only applicable to custom components decorated with both @ComponentV2 and @ReusableV2.`（ERROR）
  - `The reuseId attribute is not applicable to custom components decorated with both @ComponentV2 and @ReusableV2.`（ERROR）

## 错误码
- 无数字错误码（静态工具链使用规则名标识）

## 核心校验规则
1. `reuse` 属性只能用于同时被 `@ComponentV2` 和 `@ReusableV2` 装饰的自定义组件（若不满足，建议改为 `reuseId`）
2. `reuseId` 属性不能用于同时被 `@ComponentV2` 和 `@ReusableV2` 装饰的自定义组件（若满足，建议改为 `reuse`）
3. 提供自动修复：将 `reuse` 改为 `reuseId`，或将 `reuseId` 改为 `reuse`
4. 校验等级为 ERROR（阻断编译）

## 校验实现细节
### 静态工具链实现
源码位于 `check-reuse-attribute.ts`（146 行），通过链式调用分析校验 reuse / reuseId 属性：

#### 1. 元数据获取与前置条件
`_checkReuseAttribute` 获取组件声明信息：
- `structDeclInfo`：优先从 `metadata.rootCallInfo?.structDeclInfo` 获取，回退到 `metadata.structDeclInfo`
- `fromStructInfo`：优先从 `metadata.rootCallInfo?.fromStructInfo` 获取，回退到 `metadata.fromStructInfo`
- 二者缺一则返回（非自定义组件调用）

#### 2. 链式调用遍历（chainingCallInfos）
- 从 `metadata.chainingCallInfos` 或 `metadata.rootCallInfo?.chainingCallInfos` 获取链式调用信息列表
- 遍历所有链式调用，查找 `callName === 'reuse'` 或 `callName === 'reuseId'` 的调用
- 找到第一个匹配的链式调用索引 `reuseChainIdx`，若无则返回

#### 3. 链式调用节点获取
通过 `ChainingCallDataSource.getInstance().chainingCalls.at(reuseChainIdx)` 获取实际的 CallExpression 节点，并从 `structDeclInfo.definitionPtr` 解包得到 `ClassDefinition`，验证其 parent 为 `ClassDeclaration`。

#### 4. 属性名节点提取（getReusePropertyNameNode）
从链式调用的 `callee`（MemberExpression）中提取 `property` 节点，用于精确定位修复建议的范围。若 callee 不是 MemberExpression 则返回 undefined，回退使用整个 CallExpression 作为修复范围。

#### 5. 规则判定（checkReuseAttributeRule）
从 `structDeclInfo.annotationInfo` 获取装饰器状态：
- `hasComponentV2AndReusableV2 = hasComponentV2 && hasReusableV2`
- **规则1**：`propertyName === 'reuse' && !hasComponentV2AndReusableV2` → 报错"reuse 仅适用于 @ComponentV2+@ReusableV2 组件"
- **规则2**：`propertyName === 'reuseId' && hasComponentV2AndReusableV2` → 报错"reuseId 不适用于 @ComponentV2+@ReusableV2 组件"

#### 6. 自动修复建议
- **reuse → reuseId**：`createSuggestion('reuseId', ...getPositionRangeFromNode(decoratedNode), 'Change reuse to reuseId')`，将属性名替换为 reuseId
- **reuseId → reuse**：`createSuggestion('reuse', ...getPositionRangeFromNode(decoratedNode), 'Change reuseId to reuse')`，将属性名替换为 reuse

## 适用场景
### reuse vs reuseId 的区别
- **`reuse`**：V2 复用机制属性，配合 `@ComponentV2` + `@ReusableV2` 使用。通过传入自定义 key 控制复用匹配逻辑，实现跨数据源的组件复用
- **`reuseId`**：V1 复用机制属性，配合 `@Component` + `@Reusable` 使用。通过传入固定 ID 字符串标识复用池，相同 ID 的组件实例共享复用缓存
- 二者不可混用：V1 和 V2 的复用机制实现完全不同，V1 基于运行时 ID 匹配，V2 基于编译期 key 解析

## 自动修复建议
### 修复1：reuse → reuseId
当 `reuse` 用于非 @ComponentV2+@ReusableV2 组件时：
```typescript
// 修复前
@Reusable @Component
struct V1Comp { build() { Text('v1') } }
V1Comp().reuse('v1Key')

// 修复后
V1Comp().reuseId('v1Key')
```

### 修复2：reuseId → reuse
当 `reuseId` 用于 @ComponentV2+@ReusableV2 组件时：
```typescript
// 修复前
@ReusableV2 @ComponentV2
struct V2Comp { build() { Text('v2') } }
V2Comp().reuseId('v2Key')

// 修复后
V2Comp().reuse('v2Key')
```

## 示例代码
### 反例
```typescript
// V1 组件使用 reuse 属性
@Reusable
@Component
struct V1Comp { build() { Text('v1') } }
V1Comp().reuse('v1Key')             // V1 组件不可使用 reuse

// V2+ReusableV2 组件使用 reuseId 属性
@ReusableV2
@ComponentV2
struct V2Comp { build() { Text('v2') } }
V2Comp().reuseId('v2Key')          // V2+ReusableV2 组件不可使用 reuseId
```

### 正例
```typescript
// V1 组件使用 reuseId
@Reusable
@Component
struct V1Comp { build() { Text('v1') } }
V1Comp().reuseId('v1Key')          // V1 组件使用 reuseId

// V2+ReusableV2 组件使用 reuse
@ReusableV2
@ComponentV2
struct V2Comp { build() { Text('v2') } }
V2Comp().reuse('v2Key')           // V2+ReusableV2 组件使用 reuse
```

## 跨工具链一致性
- 此规则仅静态工具链实现，动态工具链无对应校验
- reuse / reuseId 是 V2 复用机制引入的属性，动态工具链（V1 优先）不涉及 V2 属性校验

- `compiler/src/pre_define.ts:31`（`DECORATOR_REUSEABLE = 'Reusable'`，@Reusable 装饰器名常量）

## 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| 校验入口 | `process_component_build.ts` | `check-reuse-attribute.ts:24` |
| 报错条数 | 分散 | 2 条（reuse 仅 V2+ReusableV2、reuseId 不可 V2+ReusableV2） |
| 自动修复 | 无 | 有（建议 reuse↔reuseId 互换） |