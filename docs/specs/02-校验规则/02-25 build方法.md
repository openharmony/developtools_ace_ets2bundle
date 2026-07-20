# 规则
校验 struct 必须有且仅有一个无参数的 `build` 方法。

## 补充说明
- `compiler/src/pre_define.ts:206`（`COMPONENT_IF = 'If'`，build 方法相关常量）
- `compiler/src/validate_ui_syntax.ts:3467`（`validateStmgmtKeywords`）
- `compiler/src/validate_ui_syntax.ts:3415`（`validateStaticBlock`）
## 源码参考位置
- 动态：`compiler/src/validate_ui_syntax.ts:3394-3413`（`validateStateVariable` 中涉及方法校验）
- 静态：`arkui-plugins/collectors/ui-collectors/validators/rules/check-validate-build-in-struct.ts:25`

## 适用对象
struct 声明（`@Component` / `@ComponentV2` 装饰的 struct）

## 报错信息
- 动态：通过 `processComponentClass` 中的 build 方法处理隐式校验
- 静态：
  - `The 'build' method can not have arguments.`（ERROR）
  - `The struct '{{structName}}' must have at least and at most one 'build' method.`（ERROR）

## 错误码
- 无数字错误码（静态工具链使用规则名标识）

## 核心校验规则
1. struct 必须有且仅有一个 `build` 方法
2. `build` 方法不可有参数
3. 若缺少 build 方法，提供添加空 build 方法的自动修复
4. 若 build 方法有参数，提供移除参数的自动修复
5. 校验等级为 ERROR（阻断编译）

## 校验实现细节
### 静态工具链实现
源码位于 `check-validate-build-in-struct.ts`（92 行），在 `ClassDeclaration` 节点上执行 build 方法校验：

#### 1. build 方法遍历
`_checkValidateBuildInStruct` 遍历 `node.definition.body` 中的所有成员：
- 通过 `arkts.isMethodDefinition(item)` 筛选方法定义节点
- 通过 `item.id.name === 'build'` 匹配 build 方法名
- 使用 `hasBuild` 标志记录是否找到至少一个 build 方法

#### 2. 参数校验
当找到 build 方法时，检查 `item.function.params.length`：
- 若参数数量不为 0，遍历所有参数节点
- 对每个参数节点报告 ERROR "build 方法不可有参数"
- 通过 `getStartAndEndPosition(params, firstParam)` 计算参数范围：从首个参数 `startPosition` 到末个参数 `endPosition`
- 生成修复建议：`createSuggestion('', start, end, 'Remove the parameters of the build function')`，用空字符串替换整个参数区域

#### 3. 缺失 build 方法校验
遍历结束后若 `hasBuild` 为 false：
- 获取 struct 名称标识符 `node.definition.ident`
- 计算插入位置：`arkts.createSourcePosition(node.endPosition.getIndex() - 1, node.endPosition.getLine())`，即 struct 闭合 `}` 前的位置
- 报告 ERROR "struct 必须有且仅有一个 build 方法"
- 生成修复建议：`createSuggestion('build() {\n}\n', position, position, 'Add a build function to the custom component')`，在 struct 末尾插入空 build 方法

#### 4. 多个 build 方法处理
- 当前代码通过 `hasBuild` 标志仅记录首个 build 方法，不显式报告多个 build 方法的情况
- 多个同名 build 方法由 es2panda 解析器在语法分析阶段报错（重复方法定义），此规则不重复检测

### 动态工具链实现
`compiler/src/validate_ui_syntax.ts` 在 `processComponentClass` 中通过变换流程隐式校验 build 方法存在性，缺失时编译变换失败。

## 适用场景
- `build()` 是 ArkUI 声明式 UI 的核心渲染入口，每个组件必须有且仅有一个
- build 方法无参数：组件渲染数据来自状态变量和 @Param/@Prop 传参，不接受直接调用参数
- 缺失 build 方法会导致组件无法渲染
- 有参数的 build 方法会导致渲染调用签名不匹配

## 自动修复建议
### 修复1：添加 build 方法
当 struct 缺少 build 方法时，在 struct 闭合括号前插入：
```typescript
// 修复前
@Component
struct NoBuild {
}
// 修复后
@Component
struct NoBuild {
  build() {
}
}
```
修复动作：`createSuggestion('build() {\n}\n', position, position, 'Add a build function')`

### 修复2：移除 build 方法参数
当 build 方法有参数时，移除所有参数：
```typescript
// 修复前
@Component
struct MyComp {
  build(param: string) {
    Text(param)
  }
}
// 修复后
@Component
struct MyComp {
  build() {
    Text(param)
  }
}
```
修复动作：`createSuggestion('', firstParam.startPosition, lastParam.endPosition, 'Remove the parameters')`，用空字符串覆盖从首个参数到末个参数的完整范围。

## 示例代码
### 反例
```typescript
@Component
struct NoBuild {
  // 缺少 build 方法
}

@Component
struct BuildWithArgs {
  build(param: string) {    // build 有参数
    Text('hello')
  }
}

@Component
struct MultipleBuild {
  build() { Text('first') }
  build() { Text('second') }  // 多个 build
}
```

### 正例
```typescript
@Component
struct MyComp {
  build() {
    Text('hello')
  }
}
```

## 跨工具链一致性
- 动态工具链（compiler）通过变换流程隐式校验 build 方法存在性
- 静态工具链（arkui-plugins）显式校验 build 方法存在性和参数约束，并提供两种自动修复建议
- 多个 build 方法由 es2panda 解析器在语法层处理，两条工具链不重复检测

## 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| 校验入口 | `validate_ui_syntax.ts:3394`（`validateStateVariable`） | `check-validate-build-in-struct.ts:25` |
| 报错条数 | 分散 | 2 条（不可有参数 + 必须有且仅有一个） |
| 自动修复 | 无 | 有（建议移除参数 / 添加 build 方法） |