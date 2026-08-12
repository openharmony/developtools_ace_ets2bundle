# 规格文档 — @Builder自定义构建函数模块能力增强

## 一、元数据

| 字段 | 内容 |
|------|------|
| 规格ID | SPEC-builder-enhancement-001 |
| 规格名称 | @Builder自定义构建函数模块能力增强规格 |
| CodeSpec ID | issue-4720-builder-enhancement |
| 关联 Issue | https://gitcode.com/openharmony/developtools_ace_ets2bundle/issues/4720 |
| 目标模块 | `developtools/ace_ets2bundle/compiler/` |
| 规格状态 | Draft |
| 创建日期 | 2026-08-11 |

---

## 二、用户故事

### 2.1 故事描述（第1部分）

**作为** ArkUI 应用开发者

**想要** 使用来自namespace导出或动态导入的@Builder函数

**以便** 更灵活地组织代码结构，实现模块化开发

### 2.2 故事描述（第2部分）

**作为** ArkUI 应用开发者

**想要** 在@Builder函数使用不当时获得编译告警

**以便** 及时发现并修正错误的用法，避免运行时问题

### 2.3 故事描述（第3部分）

**想要** 在@Builder函数参数中使用简洁的对象方法简写语法

**以便** 提高代码可读性和开发效率

---

## 三、验收标准

### AC-1.1: 支持namespace中的@Builder函数

**优先级：** P0

**描述：** wrapBuilder/mutableBuilder支持来自namespace导出的@Builder函数

**Given** 文件A.ets定义namespace导出的@Builder函数：
```typescript
@Builder
function globalBuilder(): void {
  Text('Hello from global builder')
}

export default {
  globalBuilder: globalBuilder
}
```

**When** 文件B.ets使用wrapBuilder包装该函数：
```typescript
import * as a from './A'

const wrapped = wrapBuilder(a.globalBuilder)
```

**Then** 编译成功，wrapped对象正确持有对@Builder函数的引用，可正常调用：
```typescript
Column() {
  wrapped.builder()
}
```

**验证方法：** 编译上述代码，检查编译通过且运行时正确渲染。

---

### AC-1.2: 支持动态导入中的@Builder函数

**优先级：** P0

**描述：** wrapBuilder/mutableBuilder支持动态导入的@Builder函数

**Given** 文件A.ets导出@Builder函数：
```typescript
@Builder
export function dynamicBuilder(): void {
  Text('Hello from dynamic builder')
}
```

**When** 使用await import()动态导入并包装：
```typescript
async function loadBuilder() {
  const module = await import('./A')
  return wrapBuilder(module.dynamicBuilder)
}

const wrapped = await loadBuilder()
```

**Then** 编译成功，运行时动态导入的@Builder函数可正常调用。

**验证方法：** 编译上述代码，检查编译通过且运行时正确渲染。

---

### AC-2.1: 断言表达式包裹@Builder函数时告警

**优先级：** P0

**描述：** @Builder函数被非空断言表达式(!)包裹作为API参数时，输出编译告警

**Given** 组件定义@Builder方法：
```typescript
@Component
struct MyComponent {
  @Builder
  myBuilder() {
    Text('Builder content')
  }

  build() {
    Stack() {}
  }
}
```

**When** 使用断言表达式包裹@Builder函数作为bindSheet参数：
```typescript
Stack()
  .bindSheet($$this.isShowSheet, (this.myBuilder())!, { ... })
```

**Then** 编译器输出WARNING：
```
WARNING: @Builder函数被非空断言表达式(!)包裹，可能导致编译转换失败。
建议：直接使用@Builder函数，不要使用表达式包裹。
```

**验证方法：** 编译上述代码，检查告警输出。

---

### AC-2.2: 括号包裹@Builder函数时告警

**优先级：** P0

**描述：** @Builder函数被括号包裹作为API参数时，输出编译告警

**Given** 组件定义@Builder方法（同AC-2.1）

**When** 使用括号包裹@Builder函数作为bindSheet参数：
```typescript
Stack()
  .bindSheet($$this.isShowSheet, (this.myBuilder()), { ... })
```

**Then** 编译器输出WARNING：
```
WARNING: @Builder函数被括号包裹，可能导致编译转换失败。
建议：直接使用@Builder函数，不要使用表达式包裹。
```

**验证方法：** 编译上述代码，检查告警输出。

---

### AC-2.3: 嵌套条件表达式包裹@Builder函数时告警

**优先级：** P1

**描述：** @Builder函数被括号包裹的嵌套条件表达式（三元运算符且内部包含函数调用）包裹作为API参数时，输出编译告警

**说明：** 简单三元表达式（如`this.isUseA ? this.builderA : this.builderB`，无括号包裹且无函数调用）原本就支持编译转换，无需告警。

**Given** 组件定义多个@Builder方法：
```typescript
@Component
struct MyComponent {
  isUseA: boolean = true

  @Builder
  builderA() {
    Text('Builder A')
  }

  @Builder
  builderB() {
    Text('Builder B')
  }

  build() {
    Stack() {}
  }
}
```

**When** 使用条件表达式选择@Builder函数作为bindSheet参数：
```typescript
Stack()
  .bindSheet($$this.isShowSheet, (this.isUseA ? this.builderA() : this.builderB()), { ... })
```

**Then** 编译器输出WARNING：
```
WARNING: @Builder函数被条件表达式包裹，可能导致编译转换失败。
建议：直接使用@Builder函数，不要使用表达式包裹。
```

**验证方法：** 编译上述代码，检查告警输出。

---

### AC-3.1: @Builder函数参数支持对象方法简写

**优先级：** P0

**描述：** @Builder函数的参数对象支持方法简写语法，编译时转换为标准函数表达式

**Given** 定义带参数的@Builder函数：
```typescript
class ButtonConfig {
  onClick: () => void = () => {}
}

@Builder
function MyButton(config: ButtonConfig) {
  Button('Click me')
    .onClick(config.onClick)
}
```

**When** 使用方法简写语法传入参数：
```typescript
MyButton({
  onClick() {
    console.log('Button clicked')
  }
})
```

**Then** 编译成功，编译器将方法简写转换为：
```typescript
MyButton({
  onClick: function() {
    console.log('Button clicked')
  }
})
```

**验证方法：** 编译上述代码，检查编译通过且运行时点击按钮正确输出日志。

---

### AC-3.2: 非@Builder函数参数不进行方法简写转换

**优先级：** P1

**描述：** 非@Builder函数的参数对象不进行方法简写转换，保持原样

**Given** 定义普通函数（非@Builder）：
```typescript
function regularFunc(config: ButtonConfig) {
  // 处理config
}
```

**When** 使用方法简写语法传入参数：
```typescript
regularFunc({
  onClick() {
    console.log('Clicked')
  }
})
```

**Then** 编译器不进行转换，保持方法简写语法（或按TypeScript默认规则处理）。

**验证方法：** 编译上述代码，确认不会进行@Builder特定的方法简写转换。

---

## 四、规则定义

### 4.1 Builder参数来源规则

| 规则ID | 来源类型 | 示例 | 状态 |
|--------|----------|------|------|
| R-B001 | 直接引用 | `wrapBuilder(globalBuilder)` | 已支持 |
| R-B002 | 属性访问 | `wrapBuilder(this.builder)` | 已支持 |
| R-B003 | **namespace成员** | **`wrapBuilder(a.globalBuilder)`** | **新增** |
| R-B004 | **动态导入** | **`wrapBuilder((await import('./A')).globalBuilder)`** | **新增** |

### 4.2 包裹表达式告警规则

| 规则ID | 包裹类型 | 表达式示例 | 告警 |
|--------|----------|-----------|------|
| R-W001 | 非空断言 | `this.builder()!` | WARNING |
| R-W002 | 括号包裹 | `(this.builder())` | WARNING |
| R-W003 | 嵌套条件表达式 | `(a ? b1() : b2())` | WARNING |
| R-W004 | 类型断言 | `this.builder() as any` | WARNING |

### 4.3 方法简写转换规则

| 规则ID | 规则 | 说明 |
|--------|------|------|
| R-M001 | 仅@Builder参数 | 只在@Builder函数参数上下文中转换 |
| R-M002 | 方法简写识别 | 识别`onClick() {...}`语法 |
| R-M003 | 转换为目标 | 转换为`onClick: function() {...}` |

---

## 五、场景库

### 场景1: 模块化@Builder函数组织

**背景：** 开发者希望将@Builder函数按功能模块组织，使用namespace导出

**Given:**
```typescript
// builders/CommonBuilders.ets
@Builder
export function HeaderBuilder(title: string) {
  Text(title).fontSize(24)
}

export default {
  HeaderBuilder
}
```

**When:**
```typescript
import * as CommonBuilders from './builders/CommonBuilders'

@Entry
@Component
struct MainPage {
  build() {
    Column() {
      CommonBuilders.HeaderBuilder('Welcome')
    }
  }
}
```

**Then:** 编译成功，页面正确显示标题

---

### 场景2: 动态加载@Builder函数

**背景：** 开发者希望根据用户权限动态加载不同的UI组件

**Given:**
```typescript
// builders/AdminBuilders.ets
@Builder
export function AdminPanel() {
  Text('Admin Panel')
}

// builders/UserBuilders.ets
@Builder
export function UserPanel() {
  Text('User Panel')
}
```

**When:**
```typescript
async function loadPanelBuilder(): WrappedBuilder<Object> {
  const isAdmin = checkAdmin()
  const module = await import(isAdmin ? './builders/AdminBuilders' : './builders/UserBuilders')
  return wrapBuilder(isAdmin ? module.AdminPanel : module.UserPanel)
}
```

**Then:** 编译成功，运行时根据权限加载对应的面板

---

### 场景3: 错误用法告警

**背景：** 开发者不小心使用了括号包裹的@Builder函数

**Given:**
```typescript
@Component
struct MyComponent {
  @State isShow: boolean = false

  @Builder
  sheetBuilder() {
    Text('Sheet Content')
  }

  build() {
    Stack() {}
      .bindSheet($$this.isShow, (this.sheetBuilder()), { height: 200 })
  }
}
```

**When:** 编译上述代码

**Then:** 输出WARNING告警，提示去掉括号

---

### 场景4: 简洁的回调写法

**背景：** 开发者希望用简洁的方式定义按钮回调

**Given:**
```typescript
@Builder
function ActionButton(label: string, config: { onClick: () => void }) {
  Button(label)
    .onClick(config.onClick)
}
```

**When:**
```typescript
Column() {
  ActionButton('Save', {
    onClick() {
      console.log('Saving...')
    }
  })
  ActionButton('Cancel', {
    onClick() {
      console.log('Cancelled')
    }
  })
}
```

**Then:** 编译成功，点击按钮正确输出日志

---

## 六、不涉及项确认

| 项目 | 状态 | 说明 |
|------|------|------|
| TypeScript编译器核心修改 | ✓ 不涉及 | 仅修改ace_ets2bundle层的AST转换 |
| Runtime API变更 | ✓ 不涉及 | 不新增或修改运行时API |
| IDE/语法检查工具 | ✓ 不涉及 | 仅影响编译器行为 |
| 非@Builder的方法简写 | ✓ 不涉及 | 转换仅限@Builder参数 |
| Promise import()语法 | ✓ 不涉及 | 仅支持await import() |

---

## 七、告警信息规范

### 7.1 告警级别

WARNING（不阻止编译）

### 7.2 告警消息模板

**断言表达式告警：**
```
WARNING: @Builder函数被非空断言表达式(!)包裹，可能导致编译转换失败。
建议：直接使用@Builder函数，不要使用表达式包裹。
```

**括号包裹告警：**
```
WARNING: @Builder函数被括号包裹，可能导致编译转换失败。
建议：直接使用@Builder函数，不要使用表达式包裹。
```

**嵌套条件表达式告警：**
```
WARNING: @Builder函数被嵌套条件表达式包裹，可能导致编译转换失败。
建议：直接使用@Builder函数，不要使用表达式包裹。
```

### 7.3 告警位置

告警位置指向包裹表达式的位置，便于开发者定位和修正。

---

## 八、API影响分析

### 8.1 不影响的API

- `wrapBuilder()` 函数签名不变
- `mutableBuilder()` 函数签名不变
- `WrappedBuilder<T>` 类不变
- `MutableBuilder<T>` 类不变

### 8.2 不影响的行为

- 现有正确用法继续正常工作
- 仅新增支持场景和告警

---

## 九、参考资料

| 资源 | 说明 |
|------|------|
| `design.md` | 详细设计文档 |
| `proposal.md` | 需求澄清文档 |
| `compiler/src/process_component_build.ts` | @Builder转换核心逻辑 |
| `compiler/src/checker/` | 验证规则模块 |
| `compiler/src/transform/` | AST转换模块 |
