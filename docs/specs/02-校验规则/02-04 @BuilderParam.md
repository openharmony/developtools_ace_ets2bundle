# 规则
校验尾随闭包调用的组件必须有且仅有一个 @BuilderParam 属性（ArkTS 1.1）或至少一个 @BuilderParam 且最后一个无参数（ArkTS 1.2）；@BuilderParam 不可同时作为参数和尾随闭包。

## 源码参考位置
- 动态：`compiler/src/process_component_build.ts:855`（尾随闭包校验）
- 静态：`arkui-plugins/collectors/ui-collectors/validators/rules/check-builder-param.ts:23`

## 适用对象
组件初始化调用（使用尾随闭包语法的组件调用）

## 报错信息
- 动态：`In the trailing lambda case, '${name}' must have one and only one property decorated with @BuilderParam`
- 静态：
  - `In the trailing lambda case, '{{structName}}' must have one and only one property decorated with @BuilderParam, and its @BuilderParam expects no parameter.`
  - `In the trailing lambda case, '{{structName}}' must have at least one property decorated with @BuilderParam, and its last @BuilderParam expects no parameter.`
  - `The @BuilderParam decorated parameter '{{paramName}}' cannot be passed as both a parameter and a trailing closure simultaneously.`
  - `@BuilderParam decorated parameter '{{paramName}}' is used as a trailing closure so the function cannot have any parameters.`

## 错误码
- 无数字错误码（静态工具链使用规则名标识）

## 核心校验规则
1. 使用尾随闭包语法的组件必须有 @BuilderParam 属性
2. ArkTS 1.1：必须有且仅有一个 @BuilderParam，且无参数
3. ArkTS 1.2：必须至少有一个 @BuilderParam，且最后一个 @BuilderParam 无参数
4. @BuilderParam 不可同时作为命名参数和尾随闭包传入
5. 被用作尾随闭包的 @BuilderParam 不可有函数参数

## 示例代码
### 反例
```typescript
@Component
struct NoBuilderParam {
  build() { Text('hello') }
}
NoBuilderParam() { Text('child') }        // 无 @BuilderParam

@Component
struct MultipleBuilderParam {
  @BuilderParam a: () => void
  @BuilderParam b: () => void
  build() { this.a?.(); this.b?.() }
}
MultipleBuilderParam() { Text('child') }  // 多个 @BuilderParam

@Component
struct ParamAndClosure {
  @BuilderParam content: () => void
  build() { this.content?.() }
}
ParamAndClosure({ content: myBuilder }) { Text('child') }  // 同时作为参数和闭包
```

### 正例
```typescript
@Component
struct WithBuilderParam {
  @BuilderParam content: () => void
  build() { this.content?.() }
}
WithBuilderParam() { Text('child') }      // 尾随闭包注入 content
```

## 校验实现细节

### ArkTS 1.1 vs 1.2 差异
- **ArkTS 1.1**（`metadata.isDeclFromLegacy` 为 true）：struct 必须有且仅有 1 个 `@BuilderParam` 属性（`builderParamProperties.length !== 1` 时报错），且该 `@BuilderParam` 无参数
- **ArkTS 1.2**（非 legacy）：struct 至少有 1 个 `@BuilderParam`（`length === 0` 时报错），且最后一个 `@BuilderParam` 无参数
- 判定 `@BuilderParam` 是否有参数通过 `hasFunctionTypeParams`：检查 `ETSFunctionType` 的 params 中是否存在非 optional 的参数

### 尾随闭包与命名参数同时传递的冲突检测
`checkBuilderParamArgsConflict` 提取组件调用 `CallExpression` 第一个参数（`ObjectExpression`）中的属性名，若某个属性名匹配到 `@BuilderParam` 且该 `@BuilderParam` 是最后一个（即被用作尾随闭包），报错：
```
The @BuilderParam decorated parameter '${lastBuilderParam.name}' cannot be passed as both a parameter and a trailing closure simultaneously.
```

### 源码位置
`arkui-plugins/collectors/ui-collectors/validators/rules/check-builder-param.ts:23`

## 静态
### 源码参考位置
- `arkui-plugins/collectors/ui-collectors/validators/rules/check-builder-param.ts:23`
### 静态工具链处理
静态工具链通过 `check-builder-param.ts` 校验尾随闭包调用的 @BuilderParam 规则，区分 ArkTS 1.1（仅 1 个 @BuilderParam）和 1.2（至少 1 个且最后一个无参数）版本差异。报错通过 `this.report()` 输出，无数字错误码。

- `compiler/src/pre_define.ts:49`（`COMPONENT_BUILDERPARAM_DECORATOR = '@BuilderParam'`）

## 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| 校验入口 | `process_component_build.ts:855`（尾随闭包校验） | `check-builder-param.ts:23` |
| ArkTS 版本差异 | 不区分 | 区分 ArkTS 1.1（仅 1 个 @BuilderParam）和 1.2（至少 1 个） |
| 自动修复 | 无 | 无 |