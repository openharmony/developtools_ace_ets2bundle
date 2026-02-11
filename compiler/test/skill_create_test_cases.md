# 技能：ai能力创建 OpenHarmony ArkUI 校验验证测试用例

## 技能描述
此技能用于为 OpenHarmony Ace_ets2bundle 编译器创建验证测试用例。测试用例用于验证编译器对 ArkUI ETS 语法和装饰器的错误检测能力。

## 使用场景
当需要为 ArkUI 编译器创建新的验证测试用例时使用此技能。

## 测试用例结构

### 目录结构
```
compiler/test/transform_ut/application/entry/src/main/ets/pages/utForValidate/Decorators/ai_generated_test_cases/
├── validateDecoratorOnClass.ets
├── validateDecoratorInBuildMethod.ets
├── validateLinkInRegularComponent.ets
├── validateLinkWithDefaultValue.ets
├── validateObjectLinkWithDefaultValue.ets
├── validatePropWithComplexType.ets
├── validateDecoratorOnStaticMember.ets
├── validateProviderConsumerMismatch.ets
├── validateWatchNonExistentMethod.ets
└── validateDuplicateEntryInFile.ets
```

### 测试文件模板

```typescript
/*
 * Copyright (c) 2024 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * 测试场景：[描述测试场景]
 * 预期错误：[描述预期的编译错误]
 */

// 测试代码
```

## 配置文件

### 1. pathConfig.ts
路径：`compiler/test/helpers/pathConfig.ts`

添加测试用例路径：
```typescript
'Decorators/ai_generated_test_cases/validateYourTestName',
```

### 2. transform_ut_error.json
路径：`compiler/test/transform_ut_error.json`

添加错误定义：
```json
"validateYourTestName": [
    {
        "message": "错误消息文本",
        "type": "ERROR",
        "code": "10905XXX"
    }
]
```

## 常见错误码

| 错误码 | 错误描述 |
|--------|----------|
| 10905402 | A struct must be decorated with '@Component' before it can use built-in decorators |
| 10905337 | Only struct can be decorated with '@Entry' |
| 10905313 | The static variable of struct cannot be used together with built-in decorators |
| 10905304 | The '@Link' property cannot be specified a default value |
| 10905301 | The method 'XXX' decorated by @Watch does not exist |
| 10905231 | Only one struct can be decorated with '@Entry' in one file |
| 10905209 | Only UI component syntax can be written here |
| 10905210 | In an '@Entry' decorated component, the 'build' method can have only one root node |

## 基础装饰器规则

### @Entry
- 只能用于 struct，不能用于 class
- 一个文件中只能有一个 @Entry 装饰的 struct
- 必须与 @Component 一起使用

### @Component
- 只能用于 struct
- 必须包含 build() 方法
- build() 方法不能有参数

### @State
- 用于组件内部状态管理
- 不能用于静态成员
- 必须有默认值

### @Prop
- 用于父组件向子组件单向传递数据
- 支持复杂类型（class、interface、enum、Array、object）
- 可以有默认值

### @Link
- 用于父子组件双向绑定
- 不能有默认值
- 必须由父组件传递

### @ObjectLink
- 用于观察嵌套对象变化
- 对象类必须用 @Observed 装饰
- 不能有默认值

### @Provide/@Consume
- 用于跨组件层级传递数据
- 必须配对使用相同名称

### @Watch
- 用于监听状态变量变化
- 必须指定存在的回调方法名

## 创建新测试用例步骤

1. **确定测试场景**：明确要测试的错误场景
2. **创建 .ets 文件**：在 ai_generated_test_cases 目录下创建测试文件
3. **编写测试代码**：包含完整的 UI 组件和状态管理代码
4. **注册测试路径**：在 pathConfig.ts 中添加路径
5. **定义错误信息**：在 transform_ut_error.json 中添加预期错误
6. **运行测试验证**：执行 `npm run etsTest` 验证测试通过

## 测试运行命令

```bash
# 运行所有测试
npm run etsTest
```

## 注意事项

1. **错误匹配算法**：测试错误必须与编译器输出一致
2. **代码完整性**：测试文件应包含完整的 UI 代码，展示真实使用场景
3. **注释说明**：每个测试文件顶部应有中文注释说明测试场景和预期错误
