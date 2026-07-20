# 功能概述
`@InsightIntent` 系列（7 个装饰器）用于声明意图（Intent）元数据，编译器在 AST 遍历时检测装饰器、校验规则、提取意图数据写入 `module.json` 的 `extractInsightIntents` 字段，并移除装饰器。

## 动态
### 源码参考位置
- `compiler/src/pre_define.ts:84-90`（7 个 InsightIntent 装饰器常量）
- `compiler/src/process_ui_syntax.ts:333`（struct 节点检测 `detectInsightIntent`）
- `compiler/src/process_ui_syntax.ts:445`（class 节点检测 `detectInsightIntent`）
- `compiler/src/userIntents_parser/parseUserIntents.ts:127-158`（`detectInsightIntent` 主入口）
- `compiler/src/userIntents_parser/parseUserIntents.ts:191`（`handleIntent`）
- `compiler/src/userIntents_parser/parseUserIntents.ts:160-189`（`initInsightIntent`）
- `compiler/src/userIntents_parser/intentType.ts`（意图数据类型定义）
- `compiler/src/fast_build/ets_ui/rollup-plugin-ets-typescript.ts:254-256`（写入 `module.json`）

### 装饰器列表

| 装饰器 | 常量 | 适用目标 | 用途 |
|---|---|---|---|
| `@InsightIntentPage` | `COMPONENT_USER_INTENTS_DECORATOR_PAGE` | struct 页面 | 声明页面意图，含 `pagePath`/`navigationId` |
| `@InsightIntentLink` | `COMPONENT_USER_INTENTS_DECORATOR_LINK` | class | 声明 URI 链接意图，含 `uri` |
| `@InsightIntentEntry` | `COMPONENT_USER_INTENTS_DECORATOR_ENTRY` | class | 声明入口执行意图，含 `abilityName`/`executeMode` |
| `@InsightIntentFunction` | `COMPONENT_USER_INTENTS_DECORATOR_FUNCTION` | class | 声明函数执行意图，含函数列表 |
| `@InsightIntentFunctionMethod` | `COMPONENT_USER_INTENTS_DECORATOR_METHOD` | static method | 标记函数方法，必须在 `@InsightIntentFunction` 类内 |
| `@InsightIntentEntity` | `COMPONENT_USER_INTENTS_DECORATOR_ENTITY` | class | 声明实体类，须实现 `IntentEntity` |
| `@InsightIntentForm` | `COMPONENT_USER_INTENTS_DECORATOR_FORM` | FormExtensionAbility | 声明卡片意图 |

### 转换前的原始代码
```typescript
@InsightIntentPage({ pagePath: 'pages/MyPage', intentName: 'myPageIntent' })
@Entry
@Component
struct MyPage {
  build() { Text('hello') }
}

@InsightIntentFunction({ intentName: 'myFuncIntent' })
class MyExecutor {
  @InsightIntentFunctionMethod
  static execute(param: string): string {
    return param;
  }
}

@InsightIntentEntity({ intentName: 'myEntity' })
class MyEntity implements InsightIntent.IntentEntity {
  name: string = 'test';
}
```

### 转换后的代码（Legacy）
```typescript
// @InsightIntentPage struct: 装饰器被移除，struct 正常变换
struct MyPage {
  build() { Text('hello') }
}
// → class MyPage extends View { ... }

// @InsightIntentFunction class: 装饰器被移除
class MyExecutor {
  static execute(param: string): string {
    return param;
  }
}

// @InsightIntentEntity class: 装饰器被移除
class MyEntity implements InsightIntent.IntentEntity {
  name: string = 'test';
}

// module.json 中追加 extractInsightIntents 字段
```

### 转换后的代码（Partial Update）
```typescript
// Partial Update 模式行为一致，装饰器移除后 struct -> class 变换正常进行
class MyPage extends ViewPU { ... }
class MyExecutor { ... }
class MyEntity implements InsightIntent.IntentEntity { ... }
```

### 关键转换逻辑

#### 1. detectInsightIntent（line 127-158）
| 步骤 | 说明 |
|---|---|
| `initInsightIntent` | 初始化缓存路径、文件路径映射、增量编译标志 |
| 装饰器检测 | 检查节点是否有 6 个定义装饰器之一（不含 `@InsightIntentFunctionMethod`） |
| `@InsightIntentFunctionMethod` 校验 | 若类无 `@InsightIntentFunction` 但方法有 `@InsightIntentFunctionMethod`，报错 10110013 |
| `handleIntent` | 提取装饰器参数（intentName/pagePath/uri 等），校验类型和继承关系 |
| `removeDecorator` | 移除所有 InsightIntent 装饰器 |

#### 2. 校验规则

| 装饰器 | 校验 | 错误码 |
|---|---|---|
| `@InsightIntentPage` | 必须应用于 struct 页面 | - |
| `@InsightIntentPage` | pagePath 须匹配实际页面路径 | - |
| `@InsightIntentFunctionMethod` | 必须在 `@InsightIntentFunction` 类内 | 10110013 |
| `@InsightIntentFunctionMethod` | 方法必须为 static | - |
| `@InsightIntentFunction` | 类必须 exported | - |
| `@InsightIntentEntry` | 类必须 default export | - |
| `@InsightIntentEntry` | 须继承 `InsightIntentEntryExecutor` | - |
| `@InsightIntentEntity` | 须实现 `InsightIntent.IntentEntity` | - |
| `@InsightIntentForm` | 须应用于 `formExtensionAbility` | - |
| `@InsightIntentForm` | formName 须匹配注册的 widget | - |

#### 3. 输出
- 意图数据收集到 `this.intentData` 数组。
- `writeUserIntentJsonFile`（rollup-plugin-ets-typescript.ts:256）：将意图数据写入 `module.json` 的 `extractInsightIntents` 字段。
- 支持缓存和增量编译（`insight_compile_cache.json`）。
- 支持 HAR 意图合并（`harIntentDataObj`）。

## 静态
### 源码参考位置
- `arkui-plugins/ui-plugins/insight-intent/insight-intent-collector.ts`（收集意图数据）
- `arkui-plugins/ui-plugins/insight-intent/insight-intent-handler.ts`（处理意图元数据）
- `arkui-plugins/ui-plugins/insight-intent/resource-source-cache.ts`（资源缓存）
- `arkui-plugins/common/predefines.ts`（`INSIGHT_INTENT_FILE_NAME` 常量）

### 转换前的原始代码
```typescript
@InsightIntentPage({ pagePath: 'pages/MyPage', intentName: 'myPageIntent' })
@Entry
@Component
struct MyPage {
  build() { Text('hello') }
}
```

### 转换后的代码
```typescript
// 静态工具链在 checked 阶段收集 InsightIntent 元数据，移除装饰器
class MyPage extends CustomComponent {
  initialRender() { /* 命令式 */ }
}
// 意图元数据输出到 INSIGHT_INTENT_FILE_NAME 指定的 JSON 文件
```

### 静态工具链收集逻辑
- `InsightIntentLinkData`：含 `uri` 字段
- `InsightIntentEntryData`：含 `abilityName`/`executeMode`
- `InsightIntentPageData`：含 `pagePath`/`navigationId`/`navDestinationName`
- `InsightIntentFunctionData`：含 `functionName`/`functionParamList`
- 通过 `insight-intent-collector.ts` 在 checked 阶段遍历 es2panda AST 收集

## 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| 装饰器检测 | `detectInsightIntent`（TS AST） | `insight-intent-collector.ts`（es2panda AST） |
| 校验规则 | 8+ 校验，含继承和导出检查 | 收集为主，校验由 linter 规则 |
| 输出 | `module.json` 的 `extractInsightIntents` | `INSIGHT_INTENT_FILE_NAME` 指定 JSON |
| 缓存/增量 | `insight_compile_cache.json` | 无独立缓存 |
| HAR 合并 | `harIntentDataObj` 合并 | 无 |
| 装饰器移除 | `removeDecorator` | collector 移除 |
| struct 变换 | `processComponentClass` | `component-transformer.ts` |
