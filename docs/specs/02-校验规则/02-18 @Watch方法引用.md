# 规则
校验 `@Watch` 装饰器的参数必须指向 struct 中已存在的方法名，否则报错并提供自动添加方法的修复建议。

## 源码参考位置
- 动态：
  - `compiler/src/process_component_member.ts:634-668`（`processWatch` 函数，检查参数是否为 `StringLiteral` 且方法是否存在）
  - `compiler/src/process_component_member.ts:1492-1499`（`validateWatchParam` 函数，检查参数是否为字符串）
- 静态：
  - `arkui-plugins/collectors/ui-collectors/validators/rules/check-watch-decorator-function.ts:36`

## 适用对象
`@Watch` 装饰的自定义组件成员属性（@Component struct 的 ClassProperty）

## 报错信息
- 动态：
  - `'@Watch' cannot be used with ${argument}. Apply it only to parameters that correspond to existing methods.`（ERROR，错误码 10905301）
  - `'@Watch' cannot be used with '${paramName}'. Apply it only to 'string' parameters.`（WARN/ERROR，错误码 10905311）
- 静态：
  - `'@watch' cannot be used with '${parameterName}'. Apply it only to parameters that correspond to existing methods.`（ERROR）

## 错误码
- 10905301：@Watch 参数指向的方法名不存在（动态）
- 10905311：@Watch 参数不是字符串类型（动态）

## 核心校验规则
1. 收集 struct 中所有方法名：遍历 `ClassDefinition.body`，筛选 `MethodDefinition` 且 `Identifier` 非空的成员，记录方法名
2. 遍历 struct 中所有 `ClassProperty` 成员，查找其上的 `@Watch` 装饰器
3. 对 `@Watch` 装饰器的每个属性参数：
   - 跳过非 `ClassProperty` 或非 `StringLiteral` 的参数（类型校验由 Type Error 拦截）
   - 提取参数字符串 `parameterName`
   - 若 `parameterName` 为空或已存在于方法名集合中，则通过校验
   - 否则报 ERROR：`@Watch` 不能用于该参数，只能应用于对应已存在方法的参数
4. 自动修复建议：在成员属性结束位置（`member.endPosition`）插入对应方法骨架 `\n${parameterName}(){\n}`

## 示例代码
### 反例
```typescript
@Component
struct MyComp {
  @State count: number = 0
  @Watch('onCountChange')     // 错误：struct 中不存在 onCountChange 方法
  count: number = 0
  build() { }
}
```

### 正例
```typescript
@Component
struct MyComp {
  @State @Watch('onCountChange')
  count: number = 0

  onCountChange(): void {     // 方法已存在
    console.log('count changed')
  }
  build() { }
}
```

## 校验实现细节

### 字符串字面量 vs 标识符参数的差异
`@Watch` 装饰器的参数必须是字符串字面量（`StringLiteral`）。`validateWatchDecorator` 遍历 `@Watch` 的 properties 时，跳过非 `ClassProperty` 或 value 非 `StringLiteral` 的参数（类型校验由 Type Error 拦截，本规则不做校验）。仅提取 `element.value.str` 作为 `parameterName` 进行后续方法名匹配。

### FixSuggestion 自动添加方法的详情
当 `parameterName` 不为空且不存在于 struct 方法名集合中时，报 ERROR 并提供自动修复建议：
- 修复内容：`\n${parameterName}(){\n}`（在成员属性结束位置 `member.endPosition` 插入方法骨架）
- 修复描述：`Add a watch function to the custom component`
- 插入位置：`member.endPosition`（属性声明结束处）

### 方法名收集
`getMethodNames` 遍历 `ClassDefinition.body`，筛选 `MethodDefinition` 且 `Identifier` 非空的成员，记录方法名，用于后续参数匹配。

### 源码位置
`arkui-plugins/collectors/ui-collectors/validators/rules/check-watch-decorator-function.ts:24`

## 静态
### 源码参考位置
- `arkui-plugins/collectors/ui-collectors/validators/rules/check-watch-decorator-function.ts:24`
### 静态工具链处理
静态工具链通过 `check-watch-decorator-function.ts` 校验 @Watch 参数必须指向 struct 中已存在的方法名。支持 `FixSuggestion`（建议添加对应方法 `{parameterName}(){\n}`）。

## 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| 校验入口 | `validate_ui_syntax.ts`（分散校验） | `check-watch-decorator-function.ts:24` |
| 自动修复 | 无 | 有（建议添加对应方法 `{parameterName}(){\n}`） |