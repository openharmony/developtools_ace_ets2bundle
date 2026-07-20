# 功能概述
`@Require` 装饰器标记状态变量为必填项，放宽被修饰装饰器的默认值要求（父组件必须传值），本身不生成运行时代码。通过 `isRequireCanReleaseMandatoryDecorators` 在默认值校验阶段放行，通过 `validateRequireDecorator` 校验装饰器组合合法性。

| 转换规则 | 说明 |
|---|---|
| 运行时代码 | @Require 本身不生成任何运行时代码 |
| 默认值放宽 | `isRequireCanReleaseMandatoryDecorators` 返回 true 时，被修饰装饰器可省略默认值 |
| 可配合装饰器 | `@Prop`、`@BuilderParam`、`@State`、`@Provide`、`@Watch`（`SUPPORT_REQUIRE_DECORATOR`） |
| 放宽范围 | `requireCanReleaseMandatoryDecorators`：`@Prop`、`@BuilderParam` + `observedPropertyDecorators`（@State/@StorageLink/@StorageProp 等） |
| 装饰器数量 | 最多 2 个（`DECORATOR_LENGTH = 2`），即 `@Require` + 一个支持装饰器 |
| 禁止组合 | `@Link`、`@ObjectLink`、`@Env` 不可与 @Require 配合（`forbiddenSpecifyDefaultValueDecorators`） |

## 动态
### 源码参考位置
- `compiler/src/process_component_member.ts:546-555`（`isRequireCanReleaseMandatoryDecorators`，默认值放宽判定）
- `compiler/src/process_component_member.ts:557-562`（`validatePropertyDecorator`，多装饰器校验入口）
- `compiler/src/process_component_member.ts:564-576`（`validateRequireDecorator`，组合校验）
- `compiler/src/process_component_member.ts:157-159`（`requireCanReleaseMandatoryDecorators` Set 定义）
- `compiler/src/process_component_member.ts:161-162`（`forbiddenSpecifyDefaultValueDecorators` Set 定义）
- `compiler/src/process_component_member.ts:164-165`（`mandatoryToInitViaParamDecorators` Set 定义）
- `compiler/src/pre_define.ts:50`（`COMPONENT_REQUIRE_DECORATOR = '@Require'`）

### 转换前的原始代码
```typescript
@Component
struct MyComponent {
  @Require @Prop value: number

  @Require @BuilderParam builderParam: (x: number) => void

  @Require @State @Watch('onChange') count: number
}
```

### 转换后的代码（Legacy）
```typescript
// @Require 本身不生成运行时代码，仅放宽被修饰装饰器的默认值要求
this.__value = new SynchedPropertySimpleOneWay(params.value, this, 'value')

// @BuilderParam 通过 setBuilderParam 设置
this.builderParam = ...

// @State + @Watch 组合
this.__count = new ObservedPropertySimple(params.count, this, 'count')
```

### 转换后的代码（Partial Update）
```typescript
// @Require 本身不生成运行时代码
this.__value = new SynchedPropertySimpleOneWayPU(params.value, this, 'value')
```

> 校验：只能与 `@Prop`/`@BuilderParam`/`@State`/`@Provide`/`@Watch` 组合，且最多两个装饰器（`SUPPORT_REQUIRE_DECORATOR` 列表，`DECORATOR_LENGTH = 2`）。

### 关键转换逻辑
- **`isRequireCanReleaseMandatoryDecorators`**（line 546-555）：判定是否放宽默认值要求。
  ```typescript
  function isRequireCanReleaseMandatoryDecorators(node: ts.PropertyDeclaration, decoratorName: string): boolean {
    if (decoratorName === COMPONENT_REQUIRE_DECORATOR) {
      return true;  // @Require 自身直接返回 true
    }
    const decoratorIsNotMandatory: boolean = ts.getAllDecorators(node).find(
      (decorator: ts.Decorator) => decorator.getText() === COMPONENT_REQUIRE_DECORATOR) &&
      requireCanReleaseMandatoryDecorators.has(decoratorName);
    return decoratorIsNotMandatory;
  }
  ```
  - `decoratorName === '@Require'`：直接返回 `true`，@Require 本身无需默认值。
  - 其他装饰器：检查属性上是否存在 `@Require` 装饰器，且当前装饰器在 `requireCanReleaseMandatoryDecorators` Set 中。
  - `requireCanReleaseMandatoryDecorators`（line 157-159）：
    ```typescript
    new Set([COMPONENT_PROP_DECORATOR, COMPONENT_BUILDERPARAM_DECORATOR, ...observedPropertyDecorators])
    ```
    包含 `@Prop`、`@BuilderParam` 和所有 observed 属性装饰器（`@State`、`@StorageLink`、`@StorageProp`、`@LocalStorageLink`、`@LocalStorageProp` 等）。
  - **不在放宽范围中的装饰器**：`@Link`、`@ObjectLink`、`@Env`（`forbiddenSpecifyDefaultValueDecorators`，line 161-162），这些装饰器本身就不允许设置默认值，@Require 无法放宽。

- **`validatePropertyDecorator`**（line 557-562）：多装饰器校验入口。
  ```typescript
  if (propertyDecorators.length > 1 && !validateRequireDecorator(propertyDecorators)) {
    validateMultiDecorators(name, log);  // 不满足 @Require 组合规则时报错
  }
  ```
  当装饰器数量 > 1 时，先检查是否满足 @Require 组合规则，不满足才报多装饰器错误。

- **`validateRequireDecorator`**（line 570-576）：校验 @Require 装饰器组合合法性。
  ```typescript
  const DECORATOR_LENGTH: number = 2;
  const SUPPORT_REQUIRE_DECORATOR: string[] = [COMPONENT_PROP_DECORATOR,
    COMPONENT_BUILDERPARAM_DECORATOR, COMPONENT_STATE_DECORATOR, COMPONENT_PROVIDE_DECORATOR,
    COMPONENT_WATCH_DECORATOR
  ];

  function validateRequireDecorator(propertyDecorators: string[]): boolean {
    const isSupportRequire: boolean = propertyDecorators.some((item: string) => {
      return SUPPORT_REQUIRE_DECORATOR.includes(item);
    });
    return propertyDecorators.length === DECORATOR_LENGTH &&
      propertyDecorators.includes(COMPONENT_REQUIRE_DECORATOR) && isSupportRequire;
  }
  ```
  三个条件同时满足才合法：
  1. `propertyDecorators.length === 2`：**最多两个装饰器**（`@Require` + 一个支持装饰器）。
  2. `propertyDecorators.includes('@Require')`：必须包含 `@Require`。
  3. `isSupportRequire`：另一个装饰器必须在 `SUPPORT_REQUIRE_DECORATOR` 列表中（`@Prop`/`@BuilderParam`/`@State`/`@Provide`/`@Watch`）。

  **注意**：`SUPPORT_REQUIRE_DECORATOR` 与 `requireCanReleaseMandatoryDecorators` 的范围不同：
  - `SUPPORT_REQUIRE_DECORATOR`：5 个装饰器（@Prop/@BuilderParam/@State/@Provide/@Watch），用于校验组合合法性。
  - `requireCanReleaseMandatoryDecorators`：@Prop/@BuilderParam + observedPropertyDecorators（更大范围），用于放宽默认值。

  这意味着 `@Require @StorageLink` 组合在校验阶段不通过（`@StorageLink` 不在 `SUPPORT_REQUIRE_DECORATOR` 中），即使 `@StorageLink` 在 `requireCanReleaseMandatoryDecorators` 中。

## 静态
### 源码参考位置
- `arkui-plugins/ui-plugins/property-translators/require.ts:49`（`RequireTranslator`）
- `arkui-plugins/common/predefines.ts:50`（compiler 端常量）

### 转换前的原始代码
```typescript
@Component
struct MyComponent {
  @Require @Prop value: number
}
```

### 转换后的代码
```typescript
// @Require 通过 initializeOptions 标记必填，不生成独立代码
__initializeStruct(initializers, content): void {
  // initializeOptions = { isRequired: true, shouldCheckNonNull: false }
  this.__backing_value = STATE_MGMT_FACTORY.makePropRef<number>("value",
    initializers?.value ?? 0, watchCb?)
}
```

## 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| 运行时代码 | 不生成 | 不生成 |
| 实现方式 | 放宽被修饰装饰器的默认值要求 | `initializeOptions = { isRequired: true, shouldCheckNonNull: false }` |
| 校验 | `validateRequireDecorator` 校验装饰器组合 | `RequireTranslator` 继承 `RegularPropertyTranslator` |
| 组合限制 | 最多两个装饰器，仅限 `SUPPORT_REQUIRE_DECORATOR` 5 种 | `hasUpdateStruct = false` |
| 放宽范围 | `requireCanReleaseMandatoryDecorators`（@Prop/@BuilderParam + observedPropertyDecorators） | `isRequired` 标记 |
