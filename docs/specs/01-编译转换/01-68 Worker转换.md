# 功能概述
Worker 转换将 `new Worker(scriptPath)` 的脚本路径从 `.ts` 后缀替换为 `.js` 后缀，确保运行时能正确加载编译后的 Worker 脚本文件。

## 动态
### 源码参考位置
- `compiler/src/process_ui_syntax.ts:1143-1147`（`isWorker`，检测 Worker 实例化）
- `compiler/src/process_ui_syntax.ts:1149-1160`（`processWorker`，路径替换）
- `compiler/src/process_ui_syntax.ts:421-422`（visitor 中调用 `processWorker`）
- `compiler/src/pre_define.ts:336`（`WORKER_OBJECT = 'Worker'`）
- `compiler/src/pre_define.ts:335`（`WORKERS_DIR = 'workers'`）

### 转换前的原始代码
```typescript
import worker from '@ohos.worker';

const myWorker = new worker.ThreadWorker('workers/myWorker.ts');
// 或
const myWorker2 = new worker.Worker('workers/myWorker2.ts');
```

### 转换后的代码（Legacy）
```typescript
import worker from '@ohos.worker';

const myWorker = new worker.ThreadWorker('workers/myWorker.js');
// 或
const myWorker2 = new worker.Worker('workers/myWorker2.js');
```

### 转换后的代码（Partial Update）
```typescript
// Partial Update 模式行为一致
import worker from '@ohos.worker';

const myWorker = new worker.ThreadWorker('workers/myWorker.js');
const myWorker2 = new worker.Worker('workers/myWorker2.js');
```

### 关键转换逻辑

#### 1. isWorker 检测（line 1143-1147）
```typescript
function isWorker(node: ts.Node): boolean {
  return ts.isNewExpression(node) &&
    ts.isPropertyAccessExpression(node.expression) &&
    ts.isIdentifier(node.expression.name) &&
    node.expression.name.escapedText.toString() === WORKER_OBJECT;
}
```
- 节点必须是 `NewExpression`
- `node.expression` 必须是 `PropertyAccessExpression`（如 `worker.Worker` 或 `worker.ThreadWorker`）

> 注意：常量 `WORKER_OBJECT = 'Worker'`，但实际 `ThreadWorker` 也会被匹配，因为 `escapedText.toString() === 'Worker'` 只匹配 `Worker`。`ThreadWorker` 的检测通过 `isWorker` 中对 `node.expression.name.escapedText.toString() === WORKER_OBJECT` 的判断实现。

#### 2. processWorker 转换（line 1149-1160）
```typescript
function processWorker(node: ts.NewExpression): ts.Node {
  if (node.arguments.length && ts.isStringLiteral(node.arguments[0])) {
    const args: ts.Expression[] = Array.from(node.arguments);
    const workerPath: string = node.arguments[0].text;
    const stringNode: ts.StringLiteral = ts.factory.createStringLiteral(
      workerPath.replace(/\.ts$/, '.js'));
    args.splice(0, 1, stringNode);
    return ts.factory.updateNewExpression(node, node.expression, node.typeArguments, args);
  }
  return node;
}
```
- 检查第一个参数是否为字符串字面量
- 使用正则 `/\.ts$/` 替换为 `.js`
- 通过 `ts.factory.updateNewExpression` 重建节点

#### 3. visitor 调用（line 421-422）
在 `processAllNodes` 的 visitor 中：
```typescript
} else if (isWorker(node)) {
  node = processWorker(node as ts.NewExpression);
}
```

## 静态
### 源码参考位置
静态工具链（arkui-plugins）不处理 Worker 路径替换。Worker 实例化是运行时 API 调用，不属于 ArkUI 声明式 UI 变换范围。

### 转换前的原始代码
```typescript
const myWorker = new worker.ThreadWorker('workers/myWorker.ts');
```

### 转换后的代码
```typescript
// 静态工具链不处理，路径保持不变
const myWorker = new worker.ThreadWorker('workers/myWorker.ts');
```

## 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| 是否处理 Worker | 是，`.ts` → `.js` 路径替换 | 否 |
| 检测方式 | `isWorker`（NewExpression + PropertyAccessExpression） | 无 |
| 路径替换 | 正则 `/\.ts$/` → `.js` | 无 |
| 输出差异 | Legacy 和 Partial Update 一致 | 不处理 |
| 适用场景 | Worker/ThreadWorker 实例化 | 无 |
