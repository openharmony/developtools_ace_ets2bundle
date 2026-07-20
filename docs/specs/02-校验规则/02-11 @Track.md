# 规则
校验 `@Track` 装饰器只能用于 class 成员变量，且不可用于 `@ObservedV2` 装饰的类（应使用 `@Trace`）。

## 源码参考位置
- 动态：`compiler/src/validate_ui_syntax.ts:1189`（`validateClassDecorator`）
  - `compiler/src/validate_ui_syntax.ts:1202`（`validateMemberInClass`，@Track 成员校验） 中的 `@Track` 装饰器校验逻辑
- 静态：`arkui-plugins/collectors/ui-collectors/validators/rules/check-track-decorator.ts:54`

## 适用对象
- class 的成员变量
- struct 成员属性/方法
- 接口声明
- 全局属性/函数

## 报错信息
- 动态：
  - `'@Track' can only be used in class decorated with '@Observed'.`（错误码 10905347）
- 静态：
  - `The '@Track' annotation can decorate only member variables of a class.`（ERROR）
  - `'@Track' cannot be used with classes decorated by '@ObservedV2'. Use the '@Trace' annotation instead.`（ERROR）

## 错误码
- 10905347：@Track 不在 @Observed class 中

## 核心校验规则
1. `@Track` 只能用于 class 的成员变量（不可用于 struct 属性、方法、接口、全局属性/函数）
2. `@Track` 不可用于被 `@ObservedV2` 装饰的类（应改用 `@Trace`）
3. 校验等级为 ERROR（阻断编译）

## 校验实现细节
### 静态工具链实现
源码位于 `check-track-decorator.ts`（201 行），按 AST 节点类型分发到不同校验函数：

#### 1. 节点类型分发
`_checkTrackDecorator` 通过 `checkByType` Map 分发：
- `AST_NODE_TYPE_CLASS_PROPERTY` -> `checkTrackInClassProperty`
- `AST_NODE_TYPE_METHOD_DEFINITION` -> `checkTrackInMethodDefinition`
- `AST_NODE_TYPE_TS_INTERFACE_DECLARATION` -> `checkInvalidTrackInInterface`

#### 2. ClassProperty 校验（checkTrackInClassProperty）
根据 metadata 进一步区分三种场景：
- **struct 属性**（`checkIsStructPropertyFromInfo`）：从 `ignoredAnnotationInfo?.hasTrack` 获取 @Track 装饰器，若存在则报错"只能用于 class 成员变量"并建议移除
- **普通 class 属性**（`checkIsNormalClassPropertyFromInfo`）：双重条件判断 `annotationInfo?.hasTrack && classInfo?.annotationInfo?.hasObservedV2`，即 @Track 存在 **且** 所属 class 被 @ObservedV2 装饰时，报错"不可用于 @ObservedV2 类，应改用 @Trace"并建议移除
- **全局属性**（`checkInvalidTrackInGlobalProperty`）：直接检查 AST 节点的 `annotations` 字段（因全局属性可能元数据不完整），报错"只能用于 class 成员变量"

#### 3. MethodDefinition 校验（checkTrackInMethodDefinition）
三种场景均报错"只能用于 class 成员变量"：
- struct 方法（`checkInvalidTrackInStructMethod`）：从 `ignoredAnnotationInfo?.hasTrack` 获取
- 普通 class 方法（`checkInvalidTrackInClassMethod`）：同上
- 全局函数（`checkInvalidTrackInFunction`）：同上

#### 4. 接口校验（checkInvalidTrackInInterface）
直接检查 `TSInterfaceDeclaration` 节点的 `annotations` 字段中是否存在 @Track（通过 `getAnnotationUsageByName`），若存在则报错"只能用于 class 成员变量"。

#### 5. 元数据获取差异
- struct 属性/方法/全局属性/方法使用 `ignoredAnnotationInfo` 和 `ignoredAnnotations`（这些场景下 @Track 被忽略，不参与变换）
- 普通 class 属性使用 `annotationInfo` 和 `annotations`（@Track 在普通 class 中是合法装饰器，参与变换）
- 全局属性和接口直接检查原始 AST annotations（无元数据层）

## 适用场景
- `@Track` 是 V1 观察模式装饰器，配合 `@Observed` 使用，实现嵌套对象属性的精确追踪
- `@ObservedV2` + `@Trace` 是 V2 观察模式，功能替代 `@Observed` + `@Track`
- `@Track` 不可用于 struct：struct 是 ArkUI 组件声明，非数据模型类
- `@Track` 不可用于 @ObservedV2 类：V2 观察模式有自己的属性追踪装饰器 `@Trace`，二者机制不兼容

## 自动修复建议
### 修复1：移除 @Track 装饰器
当 @Track 用于 struct 属性、方法、接口、全局属性等非法位置时：
```typescript
// 修复前
@Component
struct MyComp {
  @Track prop: number = 0
}
// 修复后
@Component
struct MyComp {
  prop: number = 0
}
```
修复动作由 `createSuggestion('', ...getPositionRangeFromAnnotation(trackNode), 'Remove the annotation')` 生成。

### 修复2：替换为 @Trace
当 @Track 用于 @ObservedV2 类时，应移除 @Track 并添加 @Trace：
```typescript
// 修复前
@ObservedV2
class MyV2Data {
  @Track count: number = 0
}
// 修复后
@ObservedV2
class MyV2Data {
  @Trace count: number = 0
}
```
当前仅提供移除 @Track 的建议，需手动添加 @Trace。

## 示例代码
### 反例
```typescript
@ObservedV2
class MyV2Data {
  @Track count: number = 0      // @ObservedV2 类中不可用 @Track，应改用 @Trace
}

@Component
struct MyComp {
  @Track prop: number = 0       // struct 中不可用 @Track
}
```

### 正例
```typescript
@Observed
class MyData {
  @Track count: number = 0      // @Observed 类中使用 @Track
}

@ObservedV2
class MyV2Data {
  @Trace count: number = 0     // @ObservedV2 类中使用 @Trace
}
```

## 跨工具链一致性
- 动态工具链（compiler）校验 @Track 必须在 @Observed class 中（错误码 10905347）
- 静态工具链（arkui-plugins）扩展覆盖 struct/方法/接口/全局属性的非法使用检测，以及 @ObservedV2 类的 @Trace 替换提示
- 两条工具链均为 ERROR 级别

- `compiler/src/pre_define.ts:72`（`CLASS_TRACK_DECORATOR = 'Track'`）

- `arkui-plugins/ui-plugins/property-translators/observedTrack.ts:39`（`ObservedTrackTranslator`，@Track/@Observed 转换器）

## 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| 校验入口 | `validate_ui_syntax.ts:1189`（`validateClassDecorator`） | `check-track-decorator.ts:40` |
| 报错条数 | 分散 | 2 条（不可用于 @ObservedV2 + 仅 class 成员变量） |
| 自动修复 | 无 | 有（建议移除 @Track） |