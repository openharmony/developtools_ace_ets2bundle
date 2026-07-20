# 规则
校验 build 方法和 @Builder 方法/函数内不可修改状态变量（no-variables-change-in-build）。

## 补充说明
- `compiler/src/process_component_build.ts:469`（`processComponentChild`）
- `compiler/src/process_component_class.ts:890`（`processComponentMethod`）
- `compiler/src/process_component_member.ts:634`（`processWatch`）
- `compiler/src/validate_ui_syntax.ts:3514`（`handleLifecycleDecorator`）
## 源码参考位置
- 动态：`compiler/src/validate_ui_syntax.ts`（build 内变量修改检测分散在多个函数中） 中的 build 方法变量修改检查逻辑
- 静态：
  - `arkui-plugins/collectors/ui-collectors/validators/rules/check-no-variables-change-in-build.ts:32`

## 适用对象
- struct 的 `build()` 方法内的语句
- struct 中 `@Builder` 装饰的方法内的语句
- 全局 `@Builder` 装饰的函数内的语句

## 报错信息
- 静态：
  - `State variables cannot be modified during the build process.`（ERROR 或 WARN，取决于被修改变量是否为状态变量）

## 错误码
- 无数字错误码（静态工具链使用规则名标识）

## 核心校验规则
1. build 方法 / @Builder 方法内不可修改状态变量（赋值表达式、自增/自减、复合赋值等）
2. 校验等级区分：被修改变量为状态变量（含装饰器）时报 ERROR，普通变量报 WARN
3. 箭头函数内的修改不报错（事件回调中修改是允许的）

## 校验实现细节
### 静态工具链实现
源码位于 `check-no-variables-change-in-build.ts`（503 行），包含完整的 AST 遍历和类型解析逻辑：

#### 1. 入口分发
`_checkNoVariablesChangeInBuild` 根据 `metadata` 判断：
- struct 方法 -> `checkInStructMethod`：仅处理名为 `build` 的方法或带 `@Builder` 注解的方法
- 全局函数 -> `checkInGlobalFunction`：仅处理带 `@Builder` 注解的函数

#### 2. this.xxx 赋值/自增检测（validateDirectModification）
检测形如 `this.count = 1` 或 `this.count++` 的修改：
- 判定左侧是否为 `MemberExpression`，且 `object` 为 `ThisExpression`，`property` 为 `Identifier`
- 通过 `arkts.getPeerIdentifierDecl(left.property.peer)` 解析属性声明节点
- 调用 `getNodeAnnotationNames(decl)` 获取属性上的装饰器列表
- **有装饰器（状态变量）→ ERROR；无装饰器 → WARN**

#### 3. this.xxx.yyy.zzz 路径解析（validateNestedModification）
检测形如 `this.obj.prop.sub = 1` 的嵌套属性修改：
- `extractPropertyNames(left)` 递归提取属性路径数组（如 `['this', 'obj', 'prop', 'sub']`）
- `findPropertyInStruct(structDef, propertyNames[0])` 在 struct 定义中查找第一个属性
- `checkRemainState(propertyNames.slice(1), firstProp.typeAnnotation)` 沿类型链递归解析剩余路径：
  - **union 类型**：`handleUnionType` 遍历联合类型成员，要求每个成员类型都满足状态条件
  - **Array 类型**：`getArrayElementType` 提取元素类型后递归检查
  - **class/struct 类型**：`resolveTypeToClass` 通过 `getPeerIdentifierDecl` 解析类型引用到 ClassDeclaration/ETSStructDeclaration，`checkClassMembers` 检查类成员是否有装饰器
  - **继承链**：`checkSuperClass` 沿 `super` 引用向上解析父类属性
- **首个属性有装饰器且全路径状态变量 → ERROR；否则 → WARN**

#### 4. rememberVariable.value 修改检测（validateRememberModification）
检测形如 `myVar.value = 1` 的修改（`rememberVariable(...)` 返回的 MutableVariable）：
- `collectRememberVariables(body)` 扫描 build 方法体内的 `VariableDeclaration`，识别 `rememberVariable(...)` 调用并记录变量名
- 修改检测：路径长度 >= 2，首段为已记录的 remember 变量名，第二段为 `'value'`
- **始终报 WARN**（remember 变量非严格状态变量）

#### 5. 箭头函数内修改豁免（isInEventHandlerCallback）
- `traverseBody` 遍历到 `AssignmentExpression` 或 `UpdateExpression` 时，先调用 `isInEventHandlerCallback(child)`
- 该函数沿 `parent` 链向上遍历，统计 `ArrowFunctionExpression` 节点数量
- **arrowCount >= 1 时跳过报告**（事件回调中修改状态变量是合法的）

## 适用场景
- build 方法和 @Builder 方法在渲染期间执行，修改状态变量会触发递归渲染，导致无限循环
- 状态变量修改应放在生命周期方法（`aboutToAppear`、`aboutToDisappear`）或事件回调中
- 普通变量修改虽不致命但仍属反模式，以 WARN 提示

## 自动修复建议
- 将状态变量修改移至 `aboutToAppear()` 等生命周期方法
- 若修改逻辑属于事件处理，包装在箭头函数回调中（如按钮 `onClick(() => { this.count = 1 })`）
- 对于 remember 变量，考虑使用 `@Local` 等替代方案

## 示例代码
### 反例
```typescript
@Component
struct MyComp {
  @State count: number = 0
  build() {
    this.count = 1              // build 方法内修改变量
    Text(this.count.toString())
  }
}
```

### 正例
```typescript
@Component
struct MyComp {
  @State count: number = 0
  aboutToAppear() {
    this.count = 1              // 在生命周期方法中修改
  }
  build() {
    Text(this.count.toString())
  }
}
```

## 跨工具链一致性
- 动态工具链（compiler）校验 build 方法内变量修改
- 静态工具链（arkui-plugins）扩展覆盖 @Builder 方法和全局 @Builder 函数，并提供 ERROR/WARN 分级
- 静态工具链的 `isInEventHandlerCallback` 豁免逻辑是动态工具链未实现的深度检测

## 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| 校验入口 | `validate_ui_syntax.ts`（分散校验） | `check-no-variables-change-in-build.ts:32` |
| 检测范围 | build 方法 + @Builder 方法/函数 | 同动态 |
| 箭头函数豁免 | 箭头函数内修改不报错 | 同动态 |