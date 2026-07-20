# 功能概述
将 `$rawfile('filename')` 资源引用转换为包含类型 30000（rawfile）和文件名的资源对象。支持模块内 rawfile 引用、HSP 跨模块 rawfile 引用（`[moduleName].filename` 格式）和字符串拼接路径。HSP 跨模块引用时进行 `checkHspRawfileParam` 校验，确保目标模块和资源存在。
| 转换规则 | 说明 |
|---|---|
| 资源类型 | `RESOURCE_TYPE.rawfile = 30000` |
| 模块内引用 | `{ id: -1, type: 30000, params: ['filename'], bundleName, moduleName }` |
| HSP 跨模块引用 | `[moduleName].filename` 格式，`resourceData[0]` 为模块名 |
| id 值 | 固定 `-1`（rawfile 无编译期 ID，运行时解析） |
| HSP 校验 | `checkHspRawfileSource` + `checkHspRawfileParam` 验证模块名和资源存在性 |
| 字符串拼接 | 支持模板字符串和 `+` 拼接，路径整体作为 params |

## 动态
### 源码参考位置
- `compiler/src/process_ui_syntax.ts:778-782`（`isResource`，识别 `$rawfile` 调用）
- `compiler/src/process_ui_syntax.ts:791-828`（`processResourceData`，资源数据处理入口）
- `compiler/src/process_ui_syntax.ts:801-811`（`$rawfile` 分支处理）
- `compiler/src/process_ui_syntax.ts:869-898`（`isResourcefile`，rawfile 校验和 HSP 收集）
- `compiler/src/process_ui_syntax.ts:900-913`（`checkHspRawfileParam`，HSP 跨模块资源校验）
- `compiler/src/process_ui_syntax.ts:915-926`（`checkHspRawfileSource`，HSP 模块名校验）
- `compiler/src/process_ui_syntax.ts:1029-1066`（`createResourceParam`，资源对象构造）
- `compiler/src/pre_define.ts:303`（`RESOURCE_RAWFILE = '$rawfile'`）
- `compiler/src/pre_define.ts:323`（`RESOURCE_TYPE.rawfile = 30000`）

### 转换前的原始代码
```typescript
Image($rawfile('logo.png'))
Image($rawfile('images/bg/' + this.filename))
Image($rawfile('[sharedModule].icon.png'))
```

### 转换后的代码（Legacy 和 Partial Update）
```typescript
Image({ id: -1, type: 30000, params: ['logo.png'],
      bundleName: 'com.example.app', moduleName: 'entry' })
Image({ id: -1, type: 30000, params: ['images/bg/' + this.filename],
      bundleName: 'com.example.app', moduleName: 'entry' })
Image({ id: -1, type: 30000, params: ['icon.png'],
      bundleName: 'com.example.app', moduleName: 'sharedModule' })
```

### 关键转换逻辑
- **`isResource`**（line 778-782）：识别 `$rawfile` 和 `$r` 调用。
  ```typescript
  return ts.isCallExpression(node) && ts.isIdentifier(node.expression) &&
    (node.expression.escapedText.toString() === RESOURCE ||
     node.expression.escapedText.toString() === RESOURCE_RAWFILE) && node.arguments.length > 0;
  ```

- **`processResourceData`**（line 791-828）：资源数据处理入口。
  - 参数类型检查（line 795-798）：支持 `StringLiteral` 和 `NoSubstitutionTemplateLiteral`（模板字符串）。
  - `resourceData` 解析（line 799）：`node.arguments[0].text.trim().split('.')` 按点分割。
  - `isResourceModule` 判定（line 800）：`/^\[.*\]$/g.test(resourceData[0])` 检测是否为 `[moduleName]` 格式的跨模块引用。
  - **`$rawfile` 分支**（line 801-811）：
    - 调用 `isResourcefile` 进行校验和 HSP 资源收集。
    - 若 `isCorrectResources.booleanValue` 为 true（模板字符串场景），调用 `createResourceParamWithVariable` 返回变量形式。
    - **HSP 跨模块引用**（line 807-808）：`isResourceModule` 为 true 时，`createResourceParam(-1, RESOURCE_TYPE.rawfile, [node.arguments[0]], resourceData[0], true)`，`resourceData[0]` 即 `[moduleName]` 作为 `resourceModuleName`。
    - **模块内引用**（line 809-810）：`createResourceParam(0, RESOURCE_TYPE.rawfile, [node.arguments[0]], '', false)`，`resourceModuleName` 为空字符串。

- **`isResourcefile`**（line 869-898）：rawfile 校验和 HSP 资源收集。
  - 模块内资源检查（line 875-888）：`storedFileInfo.resourcesArr` 中不存在时报错 `'No such '${resourceText}' resource in current module.'`（code `10904333`）。存在时收集到 `resourcesForFiles`。
  - **HSP 跨模块校验**（line 890-897）：
    ```typescript
    if (isResourceModule && projectConfig.hspResourcesMap && rawfileResources.keys() &&
      !previewLog.isAcceleratePreview && process.env.compileMode === 'moduleJson') {
      const resourceDataFirst: string = resourceData[0].replace(/^\[/, '').replace(/\]$/, '').trim();
      const needCheckResource: boolean = checkHspRawfileSource(resourceDataFirst, node);
      const resourceParam: string = getAfterFirstDotRegex(resourceText);
      needCheckResource && checkHspRawfileParam(resourceDataFirst, resourceParam, node);
    }
    ```
    条件：HSP 模式 + `hspResourcesMap` 存在 + `rawfileResources` 非空 + 非 AcceleratePreview + moduleJson 编译模式。

- **`checkHspRawfileSource`**（line 915-926）：校验 HSP 模块名是否存在。
  ```typescript
  const collectedHspNames: string[] = Array.from(rawfileResources.keys());
  if (!collectedHspNames.length || !collectedHspNames.includes(resourceDataFirst)) {
    transformLog.errors.push({
      message: `Unknown resource source '[${resourceDataFirst}]'.`,
      type: LogType.WARN, ...
    });
    return false;
  }
  return true;
  ```
  从 `rawfileResources` Map 的 keys 中检查模块名是否存在。不存在时报 WARN `'Unknown resource source'`。

- **`checkHspRawfileParam`**（line 900-913）：校验 HSP 跨模块 rawfile 资源是否存在。
  ```typescript
  if (!rawfileResources.has(resourceDataFirst)) {
    return;  // 模块不存在则跳过（已由 checkHspRawfileSource 报错）
  }
  const hspRawfiles: string[] | undefined = rawfileResources.get(resourceDataFirst);
  if (hspRawfiles && Array.isArray(hspRawfiles) && !hspRawfiles.includes(resourceParam)) {
    transformLog.errors.push({
      message: `No such '[${resourceDataFirst}].${resourceParam}' resource.`,
      type: LogType.WARN, ...
    });
  }
  ```
  从 `rawfileResources` Map 获取目标模块的资源列表，检查目标资源文件是否在列表中。不存在时报 WARN。

- **`createResourceParam`**（line 1029-1066）：构造资源对象字面量。
  - `resourceType === RESOURCE_TYPE.rawfile`（line 1043）：使用 `id: -1` 键值对（`resourceIdKeyValue`）。
  - `addBundleAndModuleParam`（line 1061）：追加 `bundleName` 和 `moduleName` 属性。
  - 最终生成 `{ id: -1, type: 30000, params: [...args], bundleName: '...', moduleName: '...' }` 对象。

## 静态
### 源码参考位置
- `arkui-plugins/ui-plugins/struct-translators/factory.ts:1008`（`transformResource`）
- `arkui-plugins/ui-plugins/struct-translators/factory.ts:1186`（`generateTransformedResourceCall`）
- `arkui-plugins/common/predefines.ts:110`（`Dollars.DOLLAR_RAWFILE = '$rawfile'`）
- `arkui-plugins/common/predefines.ts:111`（`Dollars.TRANSFORM_DOLLAR_RAWFILE = '_rawfile'`）

### 转换前的原始代码
```typescript
Image($rawfile('logo.png'))
```

### 转换后的代码
```typescript
Image(_rawfile(30000, 'bundleName', 'moduleName', 'logo.png'))
```

## 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| 输出形式 | 对象字面量 `{ id: -1, type: 30000, params: [...] }` | 函数调用 `_rawfile(30000, bundleName, moduleName, filename)` |
| id 值 | 固定 -1 | 不传 id 参数 |
| HSP 校验 | `checkHspRawfileSource` + `checkHspRawfileParam` | 无此校验 |
| 模块名传递 | `bundleName` + `moduleName` 属性 | 函数第 2、3 参数 |
