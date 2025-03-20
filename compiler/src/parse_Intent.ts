import ts from 'typescript';

type StaticValue = string | number | boolean | null | undefined | StaticValue[] | { [key: string]: StaticValue };

interface Params {
  decoratorFile : string;
  decoratorClass : string;
  decoratorType : string;
  intentName: string;
  domain: string; // 根据实际需求定义具体类型
  displayName : string;
  displayDescription : string;
  llmDescription : string;
  uri : string;
  params : object[];
}

const requiredFields: (keyof Params)[] = ['intentName', 'domain', 'uri', 'displayName'];
const allowedFields = new Set<keyof Params>([
  'decoratorFile', 'decoratorClass', 'decoratorType', 'intentName',
  'domain', 'displayName', 'displayDescription', 'llmDescription', 'uri', 'params'
]);

class ParseIntent {
  constructor() {
    this.intentData = [];
  }
  checker: ts.TypeChecker;
  intentData: any[];

  handleIntent(node: ts.ClassDeclaration, checker: ts.TypeChecker, path : string) {
    this.checker = checker;
    node.modifiers.forEach(decorator => {
      const originalDecortor: string = decorator.getText().replace(/\(.*\)$/, '').trim();
      if (originalDecortor === '@InsightIntentLinkDecorator') {
        const expr = decorator.expression;
        if (ts.isCallExpression(expr)) { // 判断是否为装饰器调用（如 @Intent()）
          const args = expr.arguments; // 提取参数列表（如 ['aaa', 'bbb']）
          const decoratorClass = node.name.text;
          const decoratorType = "InsightIntentLinkDecorator";
          this.analyzeDecoratorArgs(args, path, decoratorClass, decoratorType);
        } else {
          console.error('非调用形式');
        }
      }
    });
  }

  /**
   * 判断符号是否为编译期常量
   * @param symbol 要检查的符号
   * @param checker TypeScript 类型检查器
   */
  isSymbolConstant(symbol: ts.Symbol): boolean {
    const declaration = symbol.valueDeclaration;

    // 1. 必须是 const 声明的变量
    if (!this.isConstVariable(declaration)) {
      return false;
    }

    // 2. 获取初始值表达式
    const varDecl = declaration as ts.VariableDeclaration;
    const initializer = varDecl.initializer;

    // 3. 初始值必须是编译时可确定的常量表达式
    return initializer ? this.isConstantExpression(initializer) : false;
  }

  /**
   * 检查变量声明是否为 const 声明
   */
  isConstVariable(node: ts.Node | undefined): node is ts.VariableDeclaration {
    if (!node || !ts.isVariableDeclaration(node)) {
      return false;
    }

    // 获取父级 VariableDeclarationList 的 const 标志
    const varList = node.parent;
    return ts.isVariableDeclarationList(varList) &&
      (varList.flags & ts.NodeFlags.Const) !== 0;
  }

  /**
   * 递归验证表达式是否为常量
   */
  isConstantExpression(node: ts.Node): boolean {
    // 字面量直接通过
    if (ts.isLiteralExpression(node)) {
      return true;
    }

    // 标识符（变量）需指向常量
    if (ts.isIdentifier(node)) {
      const symbol = this.checker.getSymbolAtLocation(node);
      return symbol ? this.isSymbolConstant(symbol) : false;
    }

    // 数组字面量需所有元素为常量
    if (ts.isArrayLiteralExpression(node)) {
      return node.elements.every(element => this.isConstantExpression(element));
    }

    // 5. 对象字面量需所有元素为常量
    if (ts.isObjectLiteralExpression(node)) {
      return node.properties.every(property => {
        // 处理普通属性赋值 (key: value)
        if (ts.isPropertyAssignment(property)) {
          // 检查属性名（如果是计算属性名需递归）
          const nameIsConst = !ts.isComputedPropertyName(property.name); // 非计算属性名直接通过（如字符串、数字字面量）/ 不允许计算属性

          // 检查属性值
          return nameIsConst && this.isConstantExpression(property.initializer);
        }

        // 拒绝其他形式（如方法、getter/setter）
        return false;
      });
    }

    // 其他类型（如函数调用、动态表达式）直接拒绝 需要抛出编译错误方式参考@sendable，我们自己新建一个报错类
    return false;
  }

  // --------------------------
  // 2. 校验必选参数是否缺失
  // --------------------------
  validateRequiredParameters(
    node: ts.ObjectLiteralExpression,
    requiredFields: (keyof Params)[]
  ) {
    // 从 AST 节点提取所有有效参数名
    const existingParams = new Set<keyof Params>();

    for (const prop of node.properties) {
      if (
        ts.isPropertyAssignment(prop) &&       // 仅处理普通属性赋值
        ts.isIdentifier(prop.name) &&          // 仅处理标识符作为属性名
        allowedFields.has(prop.name.text)       // 验证是否为合法参数名
      ) {
        existingParams.add(prop.name.text as keyof Params);
      }
    }

    // 检查必选参数
    const missingFields = requiredFields.filter(f => !existingParams.has(f));
    if (missingFields.length > 0) {
      throw Error(`[Error] 缺少必选参数: ${missingFields.join(', ')}\n + 
      节点位置: ${node.getStart()}~${node.getEnd()}`).message;
    }
  }

// --------------------------
// 3. 校验参数类型
// --------------------------
  validateParameterTypes(
    node: ts.ObjectLiteralExpression,
    typeValidators: Record<keyof Params, (value: ts.Expression) => boolean>
  ) {
    node.properties.forEach(prop => {
      if (!ts.isPropertyAssignment(prop) || !ts.isIdentifier(prop.name)) return;

      const paramName = prop.name.text as keyof Params;
      const validator = typeValidators[paramName];

      if (validator && !validator(prop.initializer)) {
        throw Error(`[Error] 参数类型错误: "${paramName}"`).message;
      }
    });
  }

  analyzeDecoratorArgs(args: ts.NodeArray<ts.Expression>, path : string, decoratorClass:string, decoratorType:string) {
    args.forEach(arg => {
      // 做参数检查
      const symbol = this.checker.getSymbolAtLocation(arg);
      const declaration = symbol?.valueDeclaration;
      this.validateRequiredParameters(declaration.initializer, requiredFields);
      const res = this.parseStaticObject(arg);
      let intentObj = {};
      Object.assign(intentObj, {
        'decoratorFile': path
      });
      Object.assign(intentObj, {
        'decoratorClass': decoratorClass,
      });
      Object.assign(intentObj, {
        'decoratorType': decoratorType
      })
      Object.assign(intentObj, res)
      this.intentData.push(res);
      console.log(JSON.stringify(this.intentData, null, 2));
    });
  }

  parseStaticObject(node: ts.Node): StaticValue | undefined {
    if (ts.isStringLiteral(node)) {
      return node.text;
    }
    if (ts.isNumericLiteral(node)) {
      return parseFloat(node.text);
    }
    if (node.kind === ts.SyntaxKind.TrueKeyword) {
      return true;
    }
    if (node.kind === ts.SyntaxKind.FalseKeyword) {
      return false;
    }
    if (node.kind === ts.SyntaxKind.NullKeyword) {
      return null;
    }
    if (node.kind === ts.SyntaxKind.UndefinedKeyword) {
      return undefined;
    }

    // 参数是变量引用
    if (ts.isIdentifier(node)) {
      const isStaic = this.isConstantExpression(node);
      if (isStaic) {
        const symbol = this.checker.getSymbolAtLocation(node);
        const declaration = symbol?.valueDeclaration;
        return this.parseStaticObject(declaration.initializer);
      }
    }

    // 处理数组
    if (ts.isArrayLiteralExpression(node)) {
      return this.processArrayElements(node.elements);
    }

    // 处理对象字面量
    if (ts.isObjectLiteralExpression(node)) {
      return this.processObjectElements(node);
    }

    return undefined;
  }

  processObjectElements(elements: ts.ObjectLiteralExpression): { [key: string]: StaticValue } {
    const obj: { [key: string]: StaticValue } = {};
    for (const prop of elements.properties) {
      // 处理普通属性
      if (ts.isPropertyAssignment(prop)) {
        const key = this.parsePropertyKey(prop.name);
        const value = this.parseStaticObject(prop.initializer);
        if (key !== undefined && value !== undefined) {
          obj[key] = value;
        }
      }

      // 处理展开运算符
      if (ts.isSpreadAssignment(prop)) {
        const spreadObj = this.parseStaticObject(prop.expression);
        if (typeof spreadObj === 'object' && spreadObj !== null) {
          Object.assign(obj, spreadObj);
        }
      }
    }
    return obj;
  }
  processArrayElements(elements: readonly ts.Node[]): StaticValue[] {
    const parsedElements: StaticValue[] = [];

    elements.forEach((element) => {
      if (ts.isSpreadElement(element)) {
        const spreadValue = this.parseStaticObject(element.expression);
        if (Array.isArray(spreadValue)) {
          parsedElements.push(...spreadValue);
        }
      } else {
        const value = this.parseStaticObject(element);
        if (value !== undefined) {
          parsedElements.push(value);
        }
      }
    });

    return parsedElements;
  }
  // 辅助函数：解析属性名
  parsePropertyKey(node: ts.PropertyName): string | undefined {
    // 字面量属性名 (如 "key" 或 123)
    if (ts.isLiteralExpression(node)) {
      return node.text;
    }

    // 标识符属性名 (如 key)
    if (ts.isIdentifier(node)) {
      return node.text;
    }

    return undefined;
  }
}

export default new ParseIntent();
