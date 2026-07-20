# 功能概述
`@SyncMonitor` 装饰器标记 V2 组件的同步监听方法，与 `@Monitor` 类似但通配符总是启用，且不依赖 API 版本，报错级别为 ERROR。

## 动态
### 源码参考位置
- `compiler/src/process_struct_componentV2.ts:535`（`parseMethodDeclaration` 中 `@SyncMonitor` 分支）
- `compiler/src/pre_define.ts:99`（`COMPONENTV2_SYNC_MONITOR_DECORATOR`）

### 转换前的原始代码
```typescript
@ComponentV2
struct MyComponent {
  @Local count: number = 0
  @SyncMonitor('count') onSyncChange(monitor: IMonitor) { /* ... */ }
  build() { Text(`${this.count}`) }
}
```

### 转换后的代码（Legacy）
V2 装饰器仅支持 Partial Update 模式，无 Legacy 输出。

### 转换后的代码（Partial Update）
```typescript
class MyComponent extends ViewV2 {
  count: number = 0
  onSyncChange(monitor: IMonitor) { /* ... */ }
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
- `parseMethodDeclaration`（line 535）：检测 `@SyncMonitor` 装饰器，将方法名加入 `structInfo.syncMonitorDecoratorSet`（line 535），设置 `hasSyncMonitor = true`。
- `hasRequire && hasSyncMonitor` 时调用 `checkRequireDecoratorV2` 校验 `@Require` 不能与 `@SyncMonitor` 同时使用。
- 保留为普通方法，同步监听逻辑由运行时框架处理。

## 静态
### 源码参考位置
- `arkui-plugins/ui-plugins/property-translators/syncMonitor.ts:30`（`fieldWithSyncMonitorMethod`）
- `arkui-plugins/ui-plugins/property-translators/syncMonitor.ts:49`（`syncMonitorInfo`）
- `arkui-plugins/ui-plugins/property-translators/factory.ts:1140`（`generateSyncMonitorAssignment`）
- `arkui-plugins/common/annotation-utils.ts`（`findPathArrayFromSyncMonitorAnnotation`）

### 转换前的原始代码
```typescript
@ComponentV2
struct MyComponent {
  @Local count: number = 0
  @SyncMonitor('count') onSyncChange(monitor: IMonitor) { /* ... */ }
  build() { Text(`${this.count}`) }
}
```

### 转换后的代码
```typescript
class MyComponent extends CustomComponentV2 {
  private __backing_syncMonitor_onSyncChange: IMonitorDecoratedVariable | undefined

  __initializeStruct(initializers, content): void {
    this.__backing_syncMonitor_onSyncChange = STATE_MGMT_FACTORY.makeSyncMonitor(
      [{ path: "count", valueCallback: () => this.count }],
      (m) => { this.onSyncChange(m) },
      { owner: this, functionName: "onSyncChange" }
    )
  }
  onSyncChange(monitor: IMonitor) { /* ... */ }
}
```

### 深度逻辑
- `findPathArrayFromSyncMonitorAnnotation` 提取路径数组。
- 与 `@Monitor` 的关键差异：**通配符总是启用**（不依赖 API 版本），报错级别为 ERROR 而非 WARN。
- `makeSyncMonitor` 的参数结构与 `makeMonitor` 相同：路径数组、回调箭头函数、配置对象。
- 声明文件：`@SyncMonitor(path: string[])`，@since 26.0.0。

## 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| 监听注册 | 运行时框架通过装饰器元数据处理 | `STATE_MGMT_FACTORY.makeSyncMonitor` 工厂 |
| 通配符 | 运行时总是启用 | 编译期总是启用（不检测 API 版本） |
| 报错级别 | WARN | ERROR |
| 与 @Monitor 的区别 | 记录到不同的 set | 使用不同的工厂方法和路径解析函数 |
| 声明接口 | 无 | `IMonitorDecoratedVariable` |
