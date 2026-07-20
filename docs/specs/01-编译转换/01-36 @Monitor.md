# 功能概述
`@Monitor` 装饰器标记 V2 组件的监听方法，当指定的响应式属性路径发生变化时自动回调，通过 `IMonitor` 参数获取变更详情。

## 动态
### 源码参考位置
- `compiler/src/process_struct_componentV2.ts:521`（`parseMethodDeclaration`）
- `compiler/src/process_struct_componentV2.ts:811`（`generateResetMonitor`）
- `compiler/src/pre_define.ts:99`（`COMPONENTV2_MONITOR_DECORATOR`）

### 转换前的原始代码
```typescript
@ComponentV2
struct MyComponent {
  @Local count: number = 0
  @Monitor('count') onCountChange(monitor: IMonitor) { /* ... */ }
  build() { Text(`${this.count}`) }
}
```

### 转换后的代码（Legacy）
V2 装饰器仅支持 Partial Update 模式，无 Legacy 输出。

### 转换后的代码（Partial Update）
```typescript
class MyComponent extends ViewV2 {
  count: number = 0
  onCountChange(monitor: IMonitor) { /* ... */ }
  constructor(parent, params, __localStorage, elmtId, paramsLambda, extraInfo) {
    super(parent, elmtId, extraInfo)
    this.count = ('count' in params) ? params.count : 0
    this.finalizeConstruction()
  }
  resetStateVarsOnReuse(params: Object) {
    this.resetMonitorsOnReuse()
  }
  initialRender() { /* 命令式 */ }
  rerender() { this.updateDirtyElements() }
}
```

### 关键转换逻辑
- `parseMethodDeclaration`（line 521-540）：检测 `@Monitor` 装饰器，将方法名加入 `structInfo.monitorDecoratorSet`（line 531）。
- `generateResetMonitor`（line 811-820）：生成 `this.resetMonitorsOnReuse()` 调用，在 `resetStateVarsOnReuse` 中重置所有 monitor。
- 保留为普通方法，监听逻辑由运行时框架通过装饰器元数据处理。

## 静态
### 源码参考位置
- `arkui-plugins/ui-plugins/property-translators/monitor.ts:30`（`fieldWithMonitorMethod`）
- `arkui-plugins/ui-plugins/property-translators/monitor.ts:49`（`monitorInfo`）
- `arkui-plugins/ui-plugins/property-translators/factory.ts:929`（`generateinitAssignment`）
- `arkui-plugins/common/annotation-utils.ts`（`findPathArrayFromMonitorAnnotation`）

### 转换前的原始代码
```typescript
@ComponentV2
struct MyComponent {
  @Local count: number = 0
  @Monitor('count') onCountChange(monitor: IMonitor) { /* ... */ }
  build() { Text(`${this.count}`) }
}
```

### 转换后的代码
```typescript
class MyComponent extends CustomComponentV2 {
  private __backing_monitor_onCountChange: IMonitorDecoratedVariable | undefined

  __initializeStruct(initializers, content): void {
    this.__backing_monitor_onCountChange = STATE_MGMT_FACTORY.makeMonitor(
      [{ path: "count", valueCallback: () => this.count }],
      (m) => { this.onCountChange(m) },
      { owner: this, functionName: "onCountChange" }
    )
  }
  onCountChange(monitor: IMonitor) { /* ... */ }
}
```

### 深度逻辑
- `findPathArrayFromMonitorAnnotation` 提取路径数组，每个路径生成 `{ path, valueCallback, enableWildcard? }`。
- 路径以 `.*` 后缀结尾时，在 API >= 26 时启用通配符匹配（`enableWildcard = true`）。
- `makeMonitor` 的参数：路径数组（含 valueCallback 回调）、监听回调箭头函数、配置对象（owner 和 functionName）。
- 声明文件：`@Monitor(path: string[])`，`IMonitorDecoratedVariable`（含 `path: string[]`、`resetOnReuse()`）。

## 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| 监听注册 | 运行时框架通过装饰器元数据处理 | `STATE_MGMT_FACTORY.makeMonitor` 工厂 |
| 复用重置 | `this.resetMonitorsOnReuse()` | `createResetOnReuseStmt` 重新创建 |
| 路径解析 | 运行时解析 | `findPathArrayFromMonitorAnnotation` 编译期提取 |
| 通配符 | API >= 26 启用 | `.*` 后缀检测，API >= 26 启用 |
| 声明接口 | 无 | `IMonitorDecoratedVariable` |
