# 功能概述
`@ReusableV2` 装饰器标记可复用的 V2 自定义组件，配合 `@ComponentV2` 使用，使组件实例可被回收并在 `reuseOrCreateNewComponent` 时复用。

## 动态
### 源码参考位置
- `compiler/src/process_struct_componentV2.ts:135-153`（`processStructComponentV2` 中 `ReusableV2` 处理）
- `compiler/src/process_struct_componentV2.ts:155-200`（`createReusableV2ReflectFunction`）
- `compiler/src/pre_define.ts:77`（`REUSABLE_V2_INNER_DECORATOR`）
- `compiler/src/pre_define.ts:664`（`IS_REUSABLE_ = 'isReusable_'`）

### 转换前的原始代码
```typescript
@ReusableV2
@ComponentV2
struct MyReusableV2 {
  build() { Text('v2 reusable') }
}

// 使用处
@ComponentV2
struct Parent {
  build() {
    MyReusableV2({ /* params */ })
  }
}
```

### 转换后的代码（Legacy）
V2 装饰器仅支持 Partial Update 模式，无 Legacy 输出。

### 转换后的代码（Partial Update）
```typescript
@__ReusableV2_Inner_Decorator__
class MyReusableV2 extends ViewV2 {
  build() { /* 命令式 */ }
}

// 注入的 reflect 函数
function __ReusableV2_Inner_Decorator__(BaseClass) {
  Reflect.defineProperty(BaseClass.prototype, 'isReusable_', {
    get: () => true
  })
}

// 使用处
class Parent extends ViewV2 {
  build() { /* 命令式 */ }
  initialRender() {
    this.reuseOrCreateNewComponent({
      componentClass: MyReusableV2,
      getReuseId: /* ... */,
      extraInfo: /* ... */
    }, /* ... */)
  }
}
```

### 关键转换逻辑
- `processStructComponentV2`（line 135-153）：检测 `isReusableV2`，注入 `@__ReusableV2_Inner_Decorator__` 装饰器。
- `createReusableV2ReflectFunction`（line 155-200）：生成 reflect 函数，通过 `Reflect.defineProperty` 在原型上设置 `isReusable_` getter 返回 `true`。
- 使用处通过 `this.reuseOrCreateNewComponent` 替换直接构造，实现组件复用。

## 静态
### 源码参考位置
- `arkui-plugins/common/predefines.ts:129`（`DecoratorNames.RESUABLE_V2 = 'ReusableV2'`）

### 转换前的原始代码
```typescript
@ReusableV2
@ComponentV2
struct MyReusableV2 {
  build() { Text('v2 reusable') }
}
```

### 转换后的代码
```typescript
// 静态工具链中 @ReusableV2 与 @ComponentV2 配合处理
// struct -> class 转换后标记为可复用 V2 组件
class MyReusableV2 extends CustomComponentV2<MyReusableV2, __Options_MyReusableV2> {
  // ...
}
```

### 深度逻辑
- `@ReusableV2` 必须与 `@ComponentV2` 同时使用。
- 动态工具链通过注入内部装饰器 `@__ReusableV2_Inner_Decorator__` 实现 `isReusable_` 标记。
- 声明文件：`@ReusableV2`，@since 26.0.0。

## 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| 可复用标记 | 注入 `@__ReusableV2_Inner_Decorator__` + `Reflect.defineProperty` | struct -> class 转换时标记 |
| 原型方法 | `isReusable_` getter | 由 `CustomComponentV2` 基类处理 |
| 使用处 | `this.reuseOrCreateNewComponent` | 静态组件创建逻辑 |
| 声明接口 | 无 | `@ReusableV2`，@since 26.0.0 |
