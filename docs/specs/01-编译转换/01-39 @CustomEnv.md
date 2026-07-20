# 功能概述
`@CustomEnv` 装饰器标记 V2 组件的自定义环境变量属性，从 `CustomEnvKey.create<T>()` 创建的全局常量读取值，支持运行时动态更新。

## 动态
### 源码参考位置
- `compiler/src/validate_ui_syntax.ts:2750-2770`（`checkCustomEnvDecoratorInterop`）
- `compiler/src/validate_ui_syntax.ts:2899-2921`（校验逻辑）
- `compiler/src/pre_define.ts:99`（`COMPONENT_CUSTOM_ENV_DECORATOR = '@CustomEnv'`）

### 转换前的原始代码
```typescript
const myKey = CustomEnvKey.create<string>()

@ComponentV2
struct MyComponent {
  @CustomEnv({ value: myKey }) myEnv: string = 'default'
  build() { Text(this.myEnv) }
}
```

### 转换后的代码（Legacy）
V2 装饰器仅支持 Partial Update 模式，无 Legacy 输出。

### 转换后的代码（Partial Update）
```typescript
// 动态工具链仅校验，不生成代码
class MyComponent extends ViewV2 {
  myEnv: string = 'default'
  constructor(parent, params, __localStorage, elmtId, paramsLambda, extraInfo) {
    super(parent, elmtId, extraInfo)
    this.finalizeConstruction()
  }
  initialRender() { /* 命令式 */ }
  rerender() { this.updateDirtyElements() }
}
```

### 关键转换逻辑
- `checkCustomEnvDecoratorInterop`（line 2750-2770）：校验 `@CustomEnv` 的 key 必须是 `CustomEnvKey.create<T>()` 创建的全局常量。
- 校验属性类型必须与 key 的泛型类型一致。
- 不生成额外代码，仅校验。

## 静态
### 源码参考位置
- `arkui-plugins/ui-plugins/property-translators/customEnv.ts:34`（`getCustomEnvKey`）
- `arkui-plugins/ui-plugins/property-translators/customEnv.ts:52`（`initializeStructWithCustomEnvProperty`）
- `arkui-plugins/ui-plugins/property-translators/customEnv.ts:84`（`CustomEnvCachedTranslator`）
- `arkui-plugins/common/predefines.ts`（`DecoratorNames.CUSTOM_ENV = 'CustomEnv'`）

### 转换前的原始代码
```typescript
const myKey = CustomEnvKey.create<string>()

@ComponentV2
struct MyComponent {
  @CustomEnv({ value: myKey }) myEnv: string = 'default'
  build() { Text(this.myEnv) }
}
```

### 转换后的代码
```typescript
class MyComponent extends CustomComponentV2 {
  private __backing_myEnv: ICustomEnvDecoratedVariable<string>
  get myEnv(): string { return this.__backing_myEnv!.get() }

  __initializeStruct(initializers, content): void {
    this.__backing_myEnv = STATE_MGMT_FACTORY.makeCustomEnv<string>(myKey, "myEnv", "default")
  }

  static __resolveDecoratorSymbols(): void {
    const __customEnv_myEnv: CustomEnvKey<string> = myKey
  }
}
```

### 深度逻辑
- `makeType = MAKE_CUSTOM_ENV`，`hasSetter = false`（不生成 setter，自定义环境变量只读）。
- 工厂参数：env key 表达式、属性名、默认值。
- parsed 阶段生成 `static __resolveDecoratorSymbols(): void`，声明 `const __customEnv_<name>: CustomEnvKey<T> = key`。
- `getCustomEnvKey`（line 34-50）：从注解中提取 `value` 属性作为 env key。
- 支持可选的 `watchFunc` 属性（当 `isWatched` 时）。
- 声明文件：`@CustomEnv(value: string)`，@since 26.0.0。

## 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| 代码生成 | 不生成代码，仅校验 | backing field + getter + 工厂调用 |
| key 校验 | `CustomEnvKey.create<T>()` 类型一致性 | `getCustomEnvKey` 从注解提取 |
| setter | 无 | `hasSetter = false`，不生成 setter |
| 符号解析 | 无 | `__resolveDecoratorSymbols` 静态方法 |
| 声明接口 | 无 | `@CustomEnv(value: string)`，@since 26.0.0 |
