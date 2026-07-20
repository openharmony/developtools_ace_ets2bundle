# 功能概述
将 `@Component`/`@ComponentV2` 装饰的 `struct` 声明转换为继承基类的 `class` 声明，并生成构造函数、初始化方法、生命周期方法、`render`/`initialRender` 方法等命令式结构。

| 转换规则 | 说明 |
|---|---|
| struct -> class | struct 声明转为 ClassDeclaration，继承 `View`(Legacy)/`ViewPU`(Partial Update)/`ViewV2`(V2) |
| 构造函数生成 | 根据模式生成不同参数签名的构造函数，注入 super 调用和初始化逻辑 |
| 成员方法生成 | 注入 `updateWithValueParams`/`setInitiallyProvidedValue`/`updateStateVars`/`purgeVariableDependenciesOnElmtId`/`rerender` 等方法 |
| build 方法重命名 | Legacy: `build` -> `render`；Partial Update: `build` -> `initialRender`；V2: `build` -> `initialRender` |
| 生命周期方法 | 处理 `aboutToAppear`/`aboutToDisappear`/`aboutToBeDeleted`/`aboutToReuse`/`aboutToRecycle` |
| finalizeConstruction | Partial Update 模式下检测并注入 `finalizeConstruction` 属性 |

## 动态
### 源码参考位置
- `compiler/src/process_component_class.ts:175`（`processComponentClass`）
- `compiler/src/process_component_class.ts:214`（`processMembers`）
- `compiler/src/process_component_class.ts:1409`（`createHeritageClause`）
- `compiler/src/process_component_constructor.ts:87`（`initConstructorParams`）
- `compiler/src/process_component_constructor.ts:158`（`addConstructor`）
- `compiler/src/pre_define.ts:186`（`BASE_COMPONENT_NAME = 'View'`）
- `compiler/src/pre_define.ts:639`（`BASE_COMPONENT_NAME_Partial Update = 'ViewPU'`）

### 转换前的原始代码
```typescript
@Component
struct MyComponent {
  @State count: number = 0
  build() {
    Text('hello')
  }
}
```

### 转换后的代码（Legacy）
```typescript
class MyComponent extends View {
  constructor(compilerAssignedUniqueChildId, parent, params, localStorage) {
    super(compilerAssignedUniqueChildId, parent, localStorage)
    this.updateWithValueParams(params)
    this.__count = new ObservedPropertySimple(0, this, 'count')
    this.declareWatch && this.declareWatch('count', this.onDataChange)
  }
  get count(): number { return this.__count.get() }
  set count(newValue: number) { this.__count.set(newValue) }
  updateWithValueParams(params: MyComponent_Params) {
    if (params !== undefined && params.count !== undefined) {
      this.count = params.count
    }
  }
  aboutToBeDeleted() {
    SubscriberManager.Get().delete(this.id__())
    this.__count.aboutToBeDeleted()
    this.__count = undefined
    super.aboutToBeDeleted()
  }
  render() {
    Text.create('hello')
    Text.pop()
  }
  rerender() {
    this.updateDirtyElements()
  }
}
```

### 转换后的代码（Partial Update）
```typescript
class MyComponent extends ViewPU {
  constructor(parent, params, __localStorage, elmtId, paramsLambda, extraInfo) {
    super(parent, __localStorage, elmtId, extraInfo)
    this.setInitiallyProvidedValue(params)
    this.__count = new ObservedPropertySimplePU(0, this, 'count')
    if (!('finalizeConstruction' in ViewPU.prototype)) {
      Reflect.defineProperty(ViewPU.prototype, 'finalizeConstruction', {
        value: function () { this.finalizeConstructionImpl() },
        writable: false, enumerable: false
      })
    }
    this.finalizeConstruction()
  }
  get count(): number { return this.__count.get() }
  set count(newValue: number) { this.__count.set(newValue) }
  setInitiallyProvidedValue(params: MyComponent_Params) {
    if (params.count !== undefined) { this.count = params.count }
  }
  updateStateVars(params: MyComponent_Params) { /* 更新外部传入的状态变量 */ }
  purgeVariableDependenciesOnElmtId(rmElmtId: number) {
    this.__count.purgeDependencyOnElmtId(rmElmtId)
  }
  initialRender() {
    this.observeComponentCreation2((elmtId, isInitialRender) => {
      Text.create('hello')
      if (!isInitialRender) { Text.pop() }
    }, Text)
  }
  rerender() {
    this.updateDirtyElements()
  }
}
```

## 静态
### 源码参考位置
- `arkui-plugins/ui-plugins/component-transformer.ts:96`（`ComponentTransformer` 类）
- `arkui-plugins/ui-plugins/component-transformer.ts:356`（`processComponent`）
- `arkui-plugins/ui-plugins/component-transformer.ts:671`（`createNewDefinition`）
- `arkui-plugins/ui-plugins/component-transformer.ts:726`（`generateComponentInnerClass`，生成 `__Options_<Name>` 接口类）
- `arkui-plugins/interop-plugins/decl_transformer.ts:27`（interop 路径：struct -> class）

### 转换前的原始代码
```typescript
@Component
struct MyComponent {
  @State count: number = 0
  build() { Text(this.count.toString()) }
}
```

### 转换后的代码
```typescript
class MyComponent extends CustomComponent<MyComponent, __Options_MyComponent> {
  private __backing_count: IStateDecoratedVariable<number>
  get count(): number { return this.__backing_count!.get() }
  set count(value: number) { this.__backing_count!.set(value) }
  static $_invoke(initializers?, storage?, content?): MyComponent { ... }
  static _invokeImpl(style, initializers, storage, reuseId, content): void { ... }
  __initializeStruct(initializers, content): void {
    this.__backing_count = STATE_MGMT_FACTORY.makeState<number>("count",
      initializers?.count ?? 0)
  }
  __updateStruct(initializers): void { /* 更新 */ }
  __toRecord(): Object { return { count: this.count } }
  resetStateVarsOnReuse(params: Object): void { /* 复用时重置 */ }
  build() { Text(this.count.toString()) }
  static _buildCompatibleNode(options: __Options_MyComponent): void { }
  static __resolveDecoratorSymbols(): void { /* @Env/@CustomEnv 相关常量 */ }
}

interface __Options_MyComponent {
  __options_has_count?: boolean
  count?: number
}
```

### 关键转换逻辑说明
1. parsed 阶段：`ComponentTransformer.visitStruct()` 检测 `arkts.isETSStructDeclaration(node)` 后，调用 `createNewDefinition()` 将 struct 定义转为 class 定义，设置 `extends CustomComponent<MyComp, __Options_MyComp>` 和 implements 列表
2. `generateComponentInnerClass()` 生成 `__Options_<Name>` 内部接口类，包含 `__options_has_<name>` 标志和原始属性
3. interop 路径（`interop-plugins/decl_transformer.ts`）仅做 struct -> class 形态变换，清空 build 方法体

## 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| 基类 | `View`(Legacy) / `ViewPU`(Partial Update) | `CustomComponent` / `CustomComponentV2` / `BaseCustomDialog` |
| 转换阶段 | etsTransform 单阶段 | parsed 阶段（struct -> class）+ checked 阶段（属性变换） |
| build 方法 | 重命名为 `render`(Legacy)/`initialRender`(Partial Update)，内部展开为 create/pop 命令式调用 | 保留为 `build` 方法，声明式体由运行时框架解释 |
| 内部 Options 类 | 无 | 生成 `__Options_<Name>` 接口类保存初始化器 |
| 构造函数 | 直接注入属性初始化代码 | 生成 `__initializeStruct`/`__updateStruct`/`__toRecord` 方法 |
| finalizeConstruction | Partial Update 模式通过 Reflect.defineProperty 注入 | 无此机制 |

## 深度转换逻辑

### 源码参考位置
- `arkui-plugins/ui-plugins/component-transformer.ts:356-424`（`processComponent`，完整逻辑）
- `arkui-plugins/ui-plugins/component-transformer.ts:726-752`（`generateComponentInnerClass`，`__Options_<Name>` 接口类生成）
- `arkui-plugins/ui-plugins/component-transformer.ts:754-782`（`createInterfaceInnerMember`，成员结构生成）
- `arkui-plugins/ui-plugins/component-transformer.ts:318-354`（`createStaticMethod`，`_buildCompatibleNode` 静态方法）
- `arkui-plugins/ui-plugins/struct-translators/factory.ts:2018-2061`（`createInvokeMethod`，`_invokeImpl` 静态方法）
- `arkui-plugins/ui-plugins/component-transformer.ts:671-724`（`createNewDefinition`，新类定义生成）
- `arkui-plugins/ui-plugins/component-transformer.ts:632-669`（`generateResolveDecoratorSymbolsMethod`，@Env/@CustomEnv 类型检查）

### 转换前代码
```typescript
@Component
struct MyComponent {
  @State count: number = 0
  @Local name: string = ''  // V2
  @Env('fontColor') fontColor: string  // @since 24
  @CustomEnv('customKey') customValue: number  // @since 26

  build() {
    Text(`${this.count}`)
  }
}
```

### 转换后代码
```typescript
// 1. 原始 struct -> class（带泛型继承）
class MyComponent extends PUV2ViewBase<MyComponent, __MyComponent__> {
  // 组件成员...
  
  // 2. _invokeImpl 静态方法
  static _invokeImpl(initializers, storage, content) { ... }
  
  // 3. _buildCompatibleNode 静态方法
  static _buildCompatibleNode(options: __MyComponent__) { }
   
  // 4. __resolveDecoratorSymbols 静态方法
  public static __resolveDecoratorSymbols(): void {
    const __env_fontColor: ReadonlySystemEnvKey<string> = ReadonlyEnvKey.fontColor;
    const __customEnv_customValue: CustomEnvKey<number> = customKey;
  }
}

// 5. __Options_<Name> 内部接口类
class __MyComponent__ {
  // 原始成员
  count?: number;
  name?: string;
  fontColor?: string;
  // backing field（如果有类型注解的装饰器）
  // optionsHas 标记
  __count?: number;  // backingField
}
```

### 关键转换逻辑

#### 1. processComponent 完整逻辑（line 356-424）

```typescript
processComponent(node: arkts.ClassDeclaration | arkts.ETSStructDeclaration):
  arkts.ClassDeclaration | arkts.ETSStructDeclaration {
  const scopeInfo = this.scopeInfos[this.scopeInfos.length - 1];
  const className = node.definition?.ident?.name;
  if (!className || scopeInfo?.name !== className) return node;
  
  const structPropAnnoMap = new Map();
  const definition: arkts.ClassDefinition = node.definition!;
  
  if (arkts.isETSStructDeclaration(node)) {
    // 验证：struct 不能继承或实现接口
    if (definition.super || definition.implements.length !== 0) {
      LogCollector.getInstance().collectLogInfo({ message: `Structs are not allowed to inherit...`, level: LogType.ERROR });
      return node;
    }
    this.validateBuildMethod(node, className);
    
    // 收集 struct 属性，生成 inner class 成员
    const innerClassFields: arkts.AstNode[] = [];
    definition.body.forEach((it) => {
      if (!arkts.isClassProperty(it)) return;
      const structPropAnnoRecord = parseStructPropertyAnnotations(it, true);
      structPropAnnoMap.set(it.peer, structPropAnnoRecord);
      innerClassFields.push(...this.createInterfaceInnerMember(it, structPropAnnoRecord));
    });
    this.structMembersMap.set(className, innerClassFields);
  }
   
  // 生成内部接口类
  const customComponentInnerClass = this.generateComponentInnerClass(className, modifiers, annotations, isDecl);
  NamespaceProcessor.getInstance().addInnerClassToCurrentNamespace(customComponentInnerClass);
   
  // 处理 @Entry 注解
  if (!MetaDataCollector.getInstance().isDeclaration && !!scopeInfo.annotations?.entry) {
    this.validateEntryParams(scopeInfo.annotations);
    this.entryAnnoInfo.push({ name: className, ... });
  }
   
  // 生成新类定义
  const newDefinition = this.createNewDefinition(node, className, definition, structPropAnnoMap);
   
  if (arkts.isETSStructDeclaration(node)) {
    newDefinition.setFromStructModifier();
    return arkts.factory.createClassDeclaration(newDefinition, node.modifierFlags);
  } else {
    return arkts.factory.updateClassDeclaration(node, newDefinition);
  }
}
```

**处理流程**：
1. 匹配 scopeInfo 中的组件名
2. 验证 struct 约束（不继承、不实现接口）
3. 验证 build 方法（有且仅有一个，无参数）
4. 收集 struct 属性，生成 `innerClassFields`
5. 生成 `__Options_<Name>` 内部接口类
6. 处理 @Entry 注解（路由名等）
7. 生成新类定义（含泛型继承）

#### 2. generateComponentInnerClass 生成的 __Options_<Name> 接口类（line 726-752）

```typescript
generateComponentInnerClass(name: string, modifiers: arkts.Es2pandaModifierFlags,
  annotations?: readonly arkts.AnnotationUsage[], isDecl?: boolean): arkts.ClassDeclaration {
  const ctor = EntryFactory.generateConstructor(isDecl);
  const definition: arkts.ClassDefinition = arkts.factory.createClassDefinition(
    arkts.factory.createIdentifier(getCustomComponentOptionsName(name)),  // __Options_<Name>
    undefined, undefined, [], undefined, undefined,
    [...(this.structMembersMap.get(name) || []), ctor],  // innerClassFields + constructor
    arkts.Es2pandaClassDefinitionModifiers.CLASS_DEFINITION_MODIFIERS_CLASS_DECL |
      arkts.Es2pandaClassDefinitionModifiers.CLASS_DEFINITION_MODIFIERS_DECLARATION |
      arkts.Es2pandaClassDefinitionModifiers.CLASS_DEFINITION_MODIFIERS_ID_REQUIRED,
    modifiers
  ).setCtor(ctor).setAnnotations(annotations ?? []);
  return arkts.factory.createClassDeclaration(definition);
}
```

- 类名：`getCustomComponentOptionsName(name)` → `__Options_<Name>`（如 `__Options_MyComponent`）
- 成员：来自 `structMembersMap` 的 `innerClassFields` + 构造函数
- 修饰符：CLASS_DECL | DECLARATION | ID_REQUIRED
- 携带原始 struct 的注解

#### 3. createInterfaceInnerMember 生成的成员结构（line 754-782）

```typescript
createInterfaceInnerMember(
  member: arkts.ClassProperty,
  annotationRecord: AnnotationRecord<StructPropertyAnnotations, StructPropertyAnnotationInfo> | undefined
): arkts.AstNode[] {
  const annotations = collectAnnotationsFromInfo(annotationRecord);
  const isRequired = checkIsRequiredPropertyFromAnnotationInfo(annotationRecord);
  const originalName = expectName(member.key);
   
  // 原始成员（可选属性）
  const originalMember = PropertyFactory.createOptionalClassProperty({
    name: originalName,
    propertyType: member.typeAnnotation?.clone(),
    modifiers: arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC,
    isRequired
  }).setAnnotations(annotations);
   
  const optionsHasMember = UIFactory.createOptionsHasMember(originalName);
   
  // 如果有类型注解的装饰器（如 @State），生成 backing field
  const typedAnnotations = collectAnnotationForBackingFromInfo(annotationRecord);
  if (typedAnnotations.length > 0) {
    const newName = backingField(originalName);  // __<originalName>
    const newMember = PropertyFactory.createOptionalClassProperty({
      name: newName,
      propertyType: member.typeAnnotation?.clone(),
      modifiers: arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC
    }).setAnnotations(typedAnnotations);
    return [originalMember, newMember, optionsHasMember];
  }
  return [originalMember, optionsHasMember];
}
```

**生成的成员**：

| 成员 | 说明 | 条件 |
|---|---|---|
| `originalMember` | 原始属性名（可选） | 总是生成 |
| `newMember`（backing field） | `__<originalName>` | 有类型注解装饰器时 |
| `optionsHasMember` | `has<Name>` 布尔标记 | 总是生成 |

#### 4. createNewDefinition 生成的新类定义（line 671-724）

```typescript
createNewDefinition(node, className, definition, structPropAnnoMap): arkts.ClassDefinition {
  const staticMethodBody: arkts.AstNode[] = [];
  const isExportClass = arkts.hasModifierFlag(node, arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_EXPORT);
   
  // _buildCompatibleNode 静态方法（仅 export 类）
  if (isExportClass) {
    const buildCompatibleNode = this.createStaticMethod(definition);
    if (!!buildCompatibleNode) staticMethodBody.push(buildCompatibleNode);
  }
   
  // __resolveDecoratorSymbols 静态方法
  const resolveMethod = this.generateResolveDecoratorSymbolsMethod(definition);
  if (resolveMethod) staticMethodBody.push(resolveMethod);
   
  const extendsName = getComponentExtendsName(scopeInfo.annotations, this.componentType);
  return arkts.factory.createClassDefinition(
    definition.ident,                           // 类名
    undefined, undefined,
    [...definition.implements, ...UIFactory.generateImplementsForStruct(scopeInfo.annotations)],
    undefined,
    // 泛型继承：extendsName<T, __Options_T>
    arkts.factory.createETSTypeReference(
      arkts.factory.createETSTypeReferencePart(
        arkts.factory.createIdentifier(extendsName),
        arkts.factory.createTSTypeParameterInstantiation([
          UIFactory.createTypeReferenceFromString(className),
          UIFactory.createTypeReferenceFromString(`${COMPONENT_INTERFACE_PREFIX}${className}`),
        ])
      )
    ),
    [
      StructFactory.createInvokeMethod(className, isDecl),  // _invokeImpl
      ...definition.body.map((st) => {
        // 预处理属性修饰符
        if (!scopeInfo.isDecl && arkts.isClassProperty(st)) {
          UIFactory.preprocessClassPropertyModifier(st, structPropAnnoMap.get(st.peer));
        }
        return StructFactory.updateStructConstructor(st, scopeInfo);
      }),
      ...staticMethodBody,  // _buildCompatibleNode + __resolveDecoratorSymbols
    ],
    definition.modifiers,
    arkts.classDefinitionFlags(definition) | arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_FINAL,
    definition.annotations
  );
}
```

**新类定义包含**：
1. 泛型继承：`extends PUV2ViewBase<ClassName, __Options_ClassName>`
2. `_invokeImpl` 静态方法
3. 原始成员（预处理修饰符后）
4. `_buildCompatibleNode` 静态方法（仅 export 类）
5. `__resolveDecoratorSymbols` 静态方法（有 @Env/@CustomEnv 时）
6. `FINAL` 修饰符

#### 5. _invokeImpl 静态方法生成（struct-translators/factory.ts:2018-2061）

```typescript
static createInvokeMethod(structName: string, isDecl: boolean, isFromLegacy?: boolean): arkts.MethodDefinition {
  const annotations = !isFromLegacy ? [annotation(BuilderLambdaNames.ANNOTATION_NAME)] : [];
  const initializerParam = this.createInitializerParamInInvoke(structName);
  const storageParam = this.createStorageParamInInvoke();
  const contentParam = this.createContentParamInInvoke();
   
  const body = isDecl ? undefined : arkts.factory.createBlockStatement([
    arkts.factory.createThrowStatement(
      arkts.factory.createETSNewClassInstanceExpression(
        arkts.factory.createIdentifier(TypeNames.ERROR),
        [arkts.factory.createStringLiteral('Declare interface')]
      )
    )
  ]);
   
  return UIFactory.createMethodDefinition({
    key: arkts.factory.createIdentifier(BuilderLambdaNames.ORIGIN_METHOD_NAME),  // _invokeImpl
    kind: METHOD_DEFINITION_KIND_METHOD,
    function: {
      key: arkts.factory.createIdentifier(BuilderLambdaNames.ORIGIN_METHOD_NAME),
      body, params: [initializerParam, storageParam, contentParam],
      returnTypeAnnotation: UIFactory.createTypeReferenceFromString(structName),
      flags: SCRIPT_FUNCTION_FLAGS_METHOD,
      modifiers: isDecl ? STATIC | DECLARE | PUBLIC : STATIC,
      annotations,
    },
    modifiers,
  });
}
```

**参数**：
- `initializers: (() => __Options_<structName>) | undefined`
- `storage: (() => LocalStorage) | undefined`
- `content: @Builder (() => void) | undefined`（带 @Builder 注解）

**body**：
- 声明模式：`undefined`（无 body）
- 实现模式：`throw new Error('Declare interface')`

#### 6. _buildCompatibleNode 静态方法生成（line 318-354）

```typescript
createStaticMethod(definition: arkts.ClassDefinition): arkts.MethodDefinition {
  const isDecl = MetaDataCollector.getInstance().isDeclaration ||
    arkts.hasModifierFlag(definition, arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_DECLARE);
  let modifiers = arkts.classDefinitionFlags(definition) |
    arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC |
    arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_STATIC;
  if (isDecl && !arkts.hasModifierFlag(definition, arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_DECLARE)) {
    modifiers |= arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_DECLARE;
  }
  const body = isDecl ? undefined : arkts.factory.createBlockStatement([arkts.factory.createReturnStatement()]);
  const param = arkts.factory.createETSParameterExpression(
    arkts.factory.createIdentifier(CustomComponentNames.OPTIONS,
      UIFactory.createTypeReferenceFromString(getCustomComponentOptionsName(definition.ident!.name))),
    false);
   
  return UIFactory.createMethodDefinition({
    key: arkts.factory.createIdentifier(CustomComponentNames.BUILDCOMPATIBLENODE),  // _buildCompatibleNode
    // ...
  });
}
```

- 方法名：`CustomComponentNames.BUILDCOMPATIBLENODE` → `_buildCompatibleNode`
- 参数：`options: __Options_<ClassName>`
- body：声明模式 `undefined`，实现模式 `return;`
- 修饰符：PUBLIC | STATIC（声明模式加 DECLARE）

#### 7. __resolveDecoratorSymbols 方法生成（line 632-669）

```typescript
generateResolveDecoratorSymbolsMethod(definition: arkts.ClassDefinition): arkts.MethodDefinition | undefined {
  const bodyStatements: arkts.Statement[] = [
    ...this.generateEnvTypeCheckStatements(definition),      // @Env 类型检查
    ...this.generateCustomEnvTypeCheckStatements(definition), // @CustomEnv 类型检查
  ];
  if (bodyStatements.length === 0) return undefined;  // 无 @Env/@CustomEnv 时不生成
   
  const body = arkts.factory.createBlockStatement(bodyStatements);
  return arkts.factory.createMethodDefinition(
    METHOD_DEFINITION_KIND_METHOD,
    arkts.factory.createIdentifier(CustomComponentNames.RESOLVE_DECORATOR_SYMBOLS_METHOD),
    // ... PUBLIC | STATIC
  );
}
```

**@Env 类型检查**（line 506-578）：
- 识别 `@Env('WritableEnvKey.xxx')` 或 `@Env('ReadonlyEnvKey.xxx')` 格式
- 生成 `const __env_<prop>: <SystemEnvKeyType> = WritableEnvKey.xxx;`
- 收集 `WritableEnvKey`/`ReadonlyEnvKey` 和 `WritableSystemEnvKey`/`ReadonlySystemEnvKey` 的 import

**@CustomEnv 类型检查**（line 581-630）：
- 识别 `@CustomEnv('customKeyId')` 格式
- 生成 `const __customEnv_<prop>: CustomEnvKey<Type> = customKeyId;`
- 收集 `CustomEnvKey` 的 import

**只有当 struct 中存在 @Env 或 @CustomEnv 装饰的属性时，才生成此方法**。

### 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| struct -> class | `processComponentClass` 生成构造函数 | `processComponent` 生成完整 class |
| 内部接口类 | 不生成 | `__Options_<Name>` 内部类 |
| _invokeImpl | 不生成 | 静态方法，统一组件创建入口 |
| _buildCompatibleNode | 不生成 | export 类的兼容节点方法 |
| __resolveDecoratorSymbols | 不生成 | @Env/@CustomEnv 类型检查 |
| 泛型继承 | 不使用 | `extends PUV2ViewBase<T, __Options_T>` |
| backing field | 不生成 | `__<propName>` 后备字段 |
