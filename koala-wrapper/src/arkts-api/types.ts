/*
 * Copyright (c) 2022-2025 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { global } from './static/global';
import { KInt, KNativePointer, KNativePointer as KPtr, nullptr } from '@koalaui/interop';
import {
    Es2pandaContextState,
    Es2pandaMethodDefinitionKind,
    Es2pandaModifierFlags,
    Es2pandaScriptFunctionFlags,
    Es2pandaTokenType,
    Es2pandaVariableDeclarationKind,
    Es2pandaVariableDeclaratorFlag,
} from '../generated/Es2pandaEnums';
import {
    allFlags,
    arrayOfNullptr,
    assertValidPeer,
    passNode,
    passNodeArray,
    passString,
    unpackNode,
    unpackNodeArray,
    unpackNonNullableNode,
    unpackString,
    updatePeerByNode,
} from './utilities/private';
import { proceedToState, setAllParents } from './utilities/public';
import { Es2pandaAstNodeType } from '../Es2pandaEnums';
import { AstNode } from './peers/AstNode';
import { Config } from './peers/Config';
import { Context } from './peers/Context';
import { nodeByType } from './node-by-type';
import { MemberExpression } from './to-be-generated/MemberExpression';
import {
    AnnotationUsage,
    ArrayExpression,
    BlockStatement,
    ClassDefinition,
    ETSTypeReference,
    ETSTypeReferencePart,
    Expression,
    FunctionExpression,
    FunctionSignature,
    Identifier,
    ImportSpecifier,
    Literal,
    ObjectExpression,
    ScriptFunction,
    StringLiteral,
    TSTypeParameterDeclaration,
    TSTypeParameterInstantiation,
    TypeNode,
} from '../generated';
import { Debugger } from './utilities/debugger';
import { createFunctionExpression, updateFunctionExpression } from './node-utilities/FunctionExpression';

export class EtsScript extends AstNode {
    constructor(peer: KPtr) {
        assertValidPeer(peer, Es2pandaAstNodeType.AST_NODE_TYPE_ETS_MODULE);
        super(peer);
    }

    override get nodeType(): Es2pandaAstNodeType {
        return Es2pandaAstNodeType.AST_NODE_TYPE_ETS_MODULE;
    }

    static fromContext(): EtsScript {
        Debugger.getInstance().phasesDebugLog(`[TS WRAPPER] GET AST FROM CONTEXT`);
        return new EtsScript(
            global.es2panda._ProgramAst(global.context, global.es2panda._ContextProgram(global.context))
        );
    }

    /**
     * @deprecated
     */
    static createFromSource(
        source: string,
        state: Es2pandaContextState = Es2pandaContextState.ES2PANDA_STATE_PARSED
    ): EtsScript {
        if (!global.configIsInitialized()) {
            global.config = Config.createDefault().peer;
        }
        global.compilerContext = Context.createFromString(source);
        proceedToState(state, global.context);
        return new EtsScript(
            global.es2panda._ProgramAst(global.context, global.es2panda._ContextProgram(global.context))
        );
    }

    /**
     * @deprecated
     */
    static updateByStatements(node: EtsScript, statements: readonly AstNode[]): EtsScript {
        global.generatedEs2panda._BlockStatementSetStatements(
            global.context,
            node.peer,
            passNodeArray(statements),
            statements.length
        );
        return node;
    }

    get statements(): readonly AstNode[] {
        return unpackNodeArray(global.generatedEs2panda._BlockStatementStatements(global.context, this.peer));
    }

    set statements(nodes: readonly AstNode[]) {
        global.generatedEs2panda._BlockStatementSetStatements(
            global.context,
            this.peer,
            passNodeArray(nodes),
            nodes.length
        );
    }

    get isNamespace(): boolean {
        return global.generatedEs2panda._ETSModuleIsNamespaceConst(global.context, this.peer);
    }
}

export class ExpressionStatement extends AstNode {
    constructor(peer: KPtr) {
        assertValidPeer(peer, Es2pandaAstNodeType.AST_NODE_TYPE_EXPRESSION_STATEMENT);
        super(peer);
    }

    override get nodeType(): Es2pandaAstNodeType {
        return Es2pandaAstNodeType.AST_NODE_TYPE_EXPRESSION_STATEMENT;
    }

    static create(expression: AstNode): ExpressionStatement {
        return new ExpressionStatement(
            global.generatedEs2panda._CreateExpressionStatement(global.context, expression.peer)
        );
    }

    static update(node: ExpressionStatement, expression: AstNode): ExpressionStatement {
        return new ExpressionStatement(
            global.generatedEs2panda._UpdateExpressionStatement(global.context, node.peer, expression.peer)
        );
    }

    get expression(): AstNode {
        return unpackNonNullableNode(
            global.generatedEs2panda._ExpressionStatementGetExpressionConst(global.context, this.peer)
        );
    }
    /** @deprecated */
    setExpression(expr?: Expression): this {
        global.generatedEs2panda._ExpressionStatementSetExpression(global.context, this.peer, passNode(expr));
        return this;
    }
}

// TODO:
//  the CallExpression idl Create signature doesn't include the trailing block at all.
//  Need to clarify with the compiler people if they will provide create signature with a trailing block argument.
export class CallExpression extends Expression {
    constructor(peer: KPtr) {
        assertValidPeer(peer, Es2pandaAstNodeType.AST_NODE_TYPE_CALL_EXPRESSION);
        super(peer);
        this.expression = unpackNonNullableNode(
            global.generatedEs2panda._CallExpressionCallee(global.context, this.peer)
        );
        this.typeParams = unpackNode(global.generatedEs2panda._CallExpressionTypeParams(global.context, this.peer));
        this.typeArguments = this.typeParams
            ? unpackNodeArray(
                  global.generatedEs2panda._TSTypeParameterInstantiationParamsConst(
                      global.context,
                      this.typeParams.peer
                  )
              )
            : undefined;
        this.arguments = unpackNodeArray(global.generatedEs2panda._CallExpressionArguments(global.context, this.peer));
    }

    override get nodeType(): Es2pandaAstNodeType {
        return Es2pandaAstNodeType.AST_NODE_TYPE_CALL_EXPRESSION;
    }

    static create(
        expression: AstNode,
        typeArguments: readonly TypeNode[] | undefined,
        args: readonly AstNode[] | undefined,
        isOptional: boolean = false,
        trailingComma: boolean = false
    ): CallExpression {
        const peer = global.generatedEs2panda._CreateCallExpression(
            global.context,
            passNode(expression),
            passNodeArray(args),
            args?.length ?? 0,
            typeArguments
                ? passNode(TSTypeParameterInstantiation.createTSTypeParameterInstantiation(typeArguments))
                : nullptr,
            isOptional,
            trailingComma
        );
        return new CallExpression(peer);
    }

    static update(
        node: CallExpression,
        expression: AstNode,
        typeArguments: readonly TypeNode[] | undefined,
        args: readonly AstNode[] | undefined,
        isOptional: boolean = false,
        trailingComma: boolean = false
    ): CallExpression {
        const peer = global.es2panda._UpdateCallExpression(
            global.context,
            node.peer,
            passNode(expression),
            passNodeArray(args),
            args?.length ?? 0,
            typeArguments
                ? passNode(TSTypeParameterInstantiation.createTSTypeParameterInstantiation(typeArguments))
                : nullptr,
            isOptional,
            trailingComma
        );
        return new CallExpression(peer);
    }

    get trailingBlock(): BlockStatement | undefined {
        return unpackNode(global.generatedEs2panda._CallExpressionTrailingBlockConst(global.context, this.peer));
    }

    setTralingBlock(trailingBlock: BlockStatement | undefined): this {
        if (!trailingBlock) return this;
        global.generatedEs2panda._CallExpressionSetTrailingBlock(global.context, this.peer, trailingBlock.peer);
        return this;
    }

    /** @deprecated */
    setCallee(callee?: Expression): this {
        global.generatedEs2panda._CallExpressionSetCallee(global.context, this.peer, passNode(callee));
        return this;
    }

    /** @deprecated */
    setTypeParams(typeParams?: TSTypeParameterInstantiation): this {
        global.generatedEs2panda._CallExpressionSetTypeParams(global.context, this.peer, passNode(typeParams));
        return this;
    }

    get hasTrailingComma(): boolean {
        return global.generatedEs2panda._CallExpressionHasTrailingCommaConst(global.context, this.peer);
    }

    get isTrailingCall(): boolean {
        return global.es2panda._CallExpressionIsTrailingCallConst(global.context, this.peer);
    }

    readonly expression: AstNode; // Expression
    readonly typeArguments: readonly TypeNode[] | undefined;
    readonly arguments: readonly Expression[];
    readonly typeParams: TSTypeParameterInstantiation | undefined;
}

export class AssignmentExpression extends AstNode {
    constructor(peer: KPtr) {
        assertValidPeer(peer, Es2pandaAstNodeType.AST_NODE_TYPE_ASSIGNMENT_EXPRESSION);
        super(peer);
    }

    override get nodeType(): Es2pandaAstNodeType {
        return Es2pandaAstNodeType.AST_NODE_TYPE_ASSIGNMENT_EXPRESSION;
    }

    static create(left: AstNode, assignmentOperator: Es2pandaTokenType, right: AstNode): AssignmentExpression {
        return new AssignmentExpression(
            global.generatedEs2panda._CreateAssignmentExpression(
                global.context,
                passNode(left),
                passNode(right),
                assignmentOperator
            )
        );
    }

    static update(
        node: AssignmentExpression,
        left: AstNode,
        assignmentOperator: Es2pandaTokenType,
        right: AstNode
    ): AssignmentExpression {
        return new AssignmentExpression(
            global.generatedEs2panda._UpdateAssignmentExpression(
                global.context,
                node.peer,
                passNode(left),
                passNode(right),
                assignmentOperator
            )
        );
    }

    get left(): Expression | undefined {
        return unpackNode(global.generatedEs2panda._AssignmentExpressionLeftConst(global.context, this.peer));
    }
    get right(): Expression | undefined {
        return unpackNode(global.generatedEs2panda._AssignmentExpressionRightConst(global.context, this.peer));
    }
    get operatorType(): Es2pandaTokenType {
        return global.generatedEs2panda._AssignmentExpressionOperatorTypeConst(global.context, this.peer);
    }
    /** @deprecated */
    setRight(expr?: Expression): this {
        global.generatedEs2panda._AssignmentExpressionSetRight(global.context, this.peer, passNode(expr));
        expr!.parent = this;
        return this;
    }
    /** @deprecated */
    setLeft(expr?: Expression): this {
        global.generatedEs2panda._AssignmentExpressionSetLeft(global.context, this.peer, passNode(expr));
        expr!.parent = this;
        return this;
    }
    setOperatorType(operatorType: Es2pandaTokenType): this {
        global.generatedEs2panda._AssignmentExpressionSetOperatorType(global.context, this.peer, operatorType);
        return this;
    }
}

export class TSUnionType extends AstNode {
    constructor(peer: KPtr) {
        assertValidPeer(peer, Es2pandaAstNodeType.AST_NODE_TYPE_TS_UNION_TYPE);
        super(peer);
        this.types = unpackNodeArray(global.generatedEs2panda._TSUnionTypeTypesConst(global.context, this.peer));
    }

    override get nodeType(): Es2pandaAstNodeType {
        return Es2pandaAstNodeType.AST_NODE_TYPE_TS_UNION_TYPE;
    }

    static create(node: undefined | TSUnionType, types: AstNode[]): TSUnionType {
        return new TSUnionType(
            updatePeerByNode(
                global.generatedEs2panda._CreateTSUnionType(global.context, passNodeArray(types), types.length),
                node
            )
        );
    }

    readonly types: readonly AstNode[];
}

export class NumberLiteral extends Literal {
    constructor(peer: KPtr) {
        assertValidPeer(peer, Es2pandaAstNodeType.AST_NODE_TYPE_NUMBER_LITERAL);
        super(peer);
        this.value = 0.0;
    }

    override get nodeType(): Es2pandaAstNodeType {
        return Es2pandaAstNodeType.AST_NODE_TYPE_NUMBER_LITERAL;
    }

    static create(value: number): NumberLiteral {
        return new NumberLiteral(global.es2panda._CreateNumberLiteral(global.context, value));
    }

    protected override dumpMessage(): string {
        return ` <value: ${this.value}>`;
    }

    readonly value: number = 0.0;
}

export class ArrowFunctionExpression extends Expression {
    constructor(peer: KPtr) {
        assertValidPeer(peer, Es2pandaAstNodeType.AST_NODE_TYPE_ARROW_FUNCTION_EXPRESSION);
        super(peer);
        this.scriptFunction = unpackNonNullableNode(
            global.generatedEs2panda._ArrowFunctionExpressionFunction(global.context, this.peer)
        );
    }

    override get nodeType(): Es2pandaAstNodeType {
        return Es2pandaAstNodeType.AST_NODE_TYPE_ARROW_FUNCTION_EXPRESSION;
    }

    static create(func: ScriptFunction): ArrowFunctionExpression {
        return new ArrowFunctionExpression(
            global.generatedEs2panda._CreateArrowFunctionExpression(global.context, passNode(func))
        );
    }

    static update(node: ArrowFunctionExpression, func: ScriptFunction): ArrowFunctionExpression {
        return new ArrowFunctionExpression(
            global.generatedEs2panda._UpdateArrowFunctionExpression(global.context, node.peer, passNode(func))
        );
    }

    get annotations(): AnnotationUsage[] {
        return unpackNodeArray(global.generatedEs2panda._ArrowFunctionExpressionAnnotations(global.context, this.peer));
    }

    setAnnotations(annotations: AnnotationUsage[]): this {
        global.generatedEs2panda._ArrowFunctionExpressionSetAnnotations(
            global.context,
            this.peer,
            passNodeArray(annotations),
            annotations.length
        );
        return this;
    }

    readonly scriptFunction: ScriptFunction;
}

export class FunctionDeclaration extends AstNode {
    constructor(peer: KPtr) {
        assertValidPeer(peer, Es2pandaAstNodeType.AST_NODE_TYPE_FUNCTION_DECLARATION);
        super(peer);
        this.scriptFunction = unpackNonNullableNode(
            global.generatedEs2panda._FunctionDeclarationFunction(global.context, this.peer)
        );
        this.parameters = unpackNodeArray(
            global.generatedEs2panda._ScriptFunctionParams(global.context, this.scriptFunction.peer)
        );
        this.name = unpackNode(global.generatedEs2panda._ScriptFunctionId(global.context, this.scriptFunction.peer));
        this.body = unpackNode(global.generatedEs2panda._ScriptFunctionBody(global.context, this.scriptFunction.peer));
        this.typeParamsDecl = unpackNode(
            global.generatedEs2panda._ScriptFunctionTypeParams(global.context, this.scriptFunction.peer)
        );
        this.returnType = unpackNode(
            global.generatedEs2panda._ScriptFunctionReturnTypeAnnotation(global.context, this.scriptFunction.peer)
        );
        this.isAnon = global.generatedEs2panda._FunctionDeclarationIsAnonymousConst(global.context, this.peer);
    }

    override get nodeType(): Es2pandaAstNodeType {
        return Es2pandaAstNodeType.AST_NODE_TYPE_FUNCTION_DECLARATION;
    }

    static create(
        scriptFunction: ScriptFunction,
        isAnon: boolean,
        annotations?: AnnotationUsage[]
    ): FunctionDeclaration {
        const res = new FunctionDeclaration(
            global.es2panda._CreateFunctionDeclaration(
                global.context,
                scriptFunction.peer,
                // TODO: support annotations
                arrayOfNullptr,
                0,
                isAnon
            )
        );
        // TODO: maybe wrong
        res.modifiers = scriptFunction.modifiers;
        if (annotations) {
            res.annotations = annotations;
        }
        return res;
    }

    static update(
        node: FunctionDeclaration,
        scriptFunction: ScriptFunction,
        isAnon: boolean,
        annotations?: AnnotationUsage[]
    ): FunctionDeclaration {
        const res = new FunctionDeclaration(
            global.generatedEs2panda._UpdateFunctionDeclaration(
                global.context,
                node.peer,
                scriptFunction.peer,
                // TODO: support annotations
                passNodeArray(annotations),
                0,
                isAnon
            )
        );
        if (annotations) {
            res.annotations = annotations;
        }
        return res;
    }

    get annotations(): AnnotationUsage[] {
        return unpackNodeArray(
            global.generatedEs2panda._FunctionDeclarationAnnotationsConst(global.context, this.peer)
        );
    }

    set annotations(newAnnotations: AnnotationUsage[]) {
        global.generatedEs2panda._FunctionDeclarationSetAnnotations(
            global.context,
            this.peer,
            passNodeArray(newAnnotations),
            newAnnotations.length
        );
    }

    readonly scriptFunction: ScriptFunction;
    readonly parameters: readonly AstNode[];
    readonly name?: Identifier;
    readonly body?: BlockStatement;
    readonly typeParamsDecl?: TSTypeParameterDeclaration;
    readonly returnType?: AstNode;
    readonly isAnon: boolean;
}

export class ETSParameterExpression extends Expression {
    constructor(peer: KPtr) {
        assertValidPeer(peer, Es2pandaAstNodeType.AST_NODE_TYPE_ETS_PARAMETER_EXPRESSION);
        super(peer);
    }

    override get nodeType(): Es2pandaAstNodeType {
        return Es2pandaAstNodeType.AST_NODE_TYPE_ETS_PARAMETER_EXPRESSION;
    }

    static create(identifier: Identifier, initializer: AstNode | undefined): ETSParameterExpression {
        if (initializer !== undefined) {
            return new ETSParameterExpression(
                global.generatedEs2panda._CreateETSParameterExpression1(
                    global.context,
                    passNode(identifier),
                    passNode(initializer)
                )
            );
        }
        return new ETSParameterExpression(
            global.generatedEs2panda._CreateETSParameterExpression(global.context, passNode(identifier), false)
        );
    }

    static update(
        node: ETSParameterExpression,
        identifier: Identifier,
        initializer: AstNode | undefined
    ): ETSParameterExpression {
        if (initializer !== undefined) {
            return new ETSParameterExpression(
                global.generatedEs2panda._UpdateETSParameterExpression1(
                    global.context,
                    node.peer,
                    passNode(identifier),
                    passNode(initializer)
                )
            );
        }
        return new ETSParameterExpression(
            global.generatedEs2panda._UpdateETSParameterExpression(
                global.context,
                node.peer,
                passNode(identifier),
                false
            )
        );
    }

    get annotations(): AnnotationUsage[] {
        return unpackNodeArray(global.es2panda._ETSParameterExpressionAnnotations(global.context, this.peer, nullptr));
    }

    set annotations(newAnnotations: AnnotationUsage[]) {
        global.es2panda._ETSParameterExpressionSetAnnotations(
            global.context,
            this.peer,
            passNodeArray(newAnnotations),
            newAnnotations.length
        );
    }

    get type(): AstNode | undefined {
        return unpackNode(global.generatedEs2panda._ETSParameterExpressionTypeAnnotation(global.context, this.peer));
    }

    set type(t: AstNode | undefined) {
        if (t === undefined) return;
        global.generatedEs2panda._ETSParameterExpressionSetTypeAnnotation(global.context, this.peer, t.peer);
    }

    get optional(): boolean {
        return global.generatedEs2panda._ETSParameterExpressionIsOptionalConst(global.context, this.peer);
    }

    get initializer(): Expression | undefined {
        return unpackNode(global.generatedEs2panda._ETSParameterExpressionInitializerConst(global.context, this.peer));
    }

    /** @deprecated */
    setInitializer(initExpr?: Expression): this {
        global.generatedEs2panda._ETSParameterExpressionSetInitializer(global.context, this.peer, passNode(initExpr));
        return this;
    }

    setOptional(value: boolean): this {
        global.generatedEs2panda._ETSParameterExpressionSetOptional(global.context, this.peer, value);
        return this;
    }

    get identifier(): Identifier {
        return unpackNonNullableNode(
            global.generatedEs2panda._ETSParameterExpressionIdentConst(global.context, this.peer)
        );
    }

    /** @deprecated */
    setIdent(ident?: Identifier): this {
        global.generatedEs2panda._ETSParameterExpressionSetIdent(global.context, this.peer, passNode(ident));
        return this;
    }
}

export class StructDeclaration extends AstNode {
    constructor(peer: KPtr) {
        assertValidPeer(peer, Es2pandaAstNodeType.AST_NODE_TYPE_STRUCT_DECLARATION);
        super(peer);
        // TODO: is struct definition the same as struct definition?
        this.definition = unpackNonNullableNode(
            global.generatedEs2panda._ClassDeclarationDefinition(global.context, this.peer)
        );
    }

    override get nodeType(): Es2pandaAstNodeType {
        return Es2pandaAstNodeType.AST_NODE_TYPE_STRUCT_DECLARATION;
    }

    static create(definition: ClassDefinition): StructDeclaration {
        return new StructDeclaration(
            global.generatedEs2panda._CreateETSStructDeclaration(global.context, passNode(definition))
        );
    }

    static update(node: StructDeclaration, definition: ClassDefinition): StructDeclaration {
        return new StructDeclaration(
            global.generatedEs2panda._UpdateETSStructDeclaration(global.context, node.peer, passNode(definition))
        );
    }

    readonly definition: ClassDefinition;
}

export class MethodDefinition extends AstNode {
    constructor(peer: KPtr, key?: KPtr) {
        assertValidPeer(peer, Es2pandaAstNodeType.AST_NODE_TYPE_METHOD_DEFINITION);
        super(peer);
        this.kind = global.generatedEs2panda._MethodDefinitionKindConst(global.context, this.peer);
        this.funcExpr = unpackNonNullableNode(global.generatedEs2panda._ClassElementValue(global.context, this.peer));
        this.scriptFunction = this.funcExpr.function!;
        assertValidPeer(this.scriptFunction.peer, Es2pandaAstNodeType.AST_NODE_TYPE_SCRIPT_FUNCTION);

        // Somehow the scriptFunction cannot attach method's key to its ident after checker
        if (key) {
            assertValidPeer(key, Es2pandaAstNodeType.AST_NODE_TYPE_IDENTIFIER);
            const _name = unpackNonNullableNode(key);
            this.scriptFunction = this.scriptFunction.setIdent(_name as Identifier);
        }

        this.name = unpackNonNullableNode(
            global.generatedEs2panda._ScriptFunctionId(global.context, this.scriptFunction.peer)
        );
        this.kind = global.generatedEs2panda._MethodDefinitionKindConst(global.context, this.peer);
    }

    override get nodeType(): Es2pandaAstNodeType {
        return Es2pandaAstNodeType.AST_NODE_TYPE_METHOD_DEFINITION;
    }

    static create(
        kind: Es2pandaMethodDefinitionKind,
        key: AstNode,
        value: ScriptFunction,
        modifiers: KInt,
        isComputed: boolean
    ): MethodDefinition {
        return new MethodDefinition(
            global.generatedEs2panda._CreateMethodDefinition(
                global.context,
                kind,
                passNode(key),
                passNode(createFunctionExpression(value)),
                modifiers,
                isComputed
            ),
            key.peer
        );
    }

    static update(
        node: MethodDefinition,
        kind: Es2pandaMethodDefinitionKind,
        key: AstNode,
        value: ScriptFunction,
        modifiers: KInt,
        isComputed: boolean
    ): MethodDefinition {
        return new MethodDefinition(
            global.generatedEs2panda._UpdateMethodDefinition(
                global.context,
                node.peer,
                kind,
                passNode(key),
                passNode(updateFunctionExpression(node.funcExpr, value)),
                modifiers,
                isComputed
            ),
            key.peer
        );
    }

    // TODO: does not work
    isConstructor(): boolean {
        return global.generatedEs2panda._MethodDefinitionIsConstructorConst(global.context, this.peer);
    }

    get overloads(): readonly MethodDefinition[] {
        return unpackNodeArray(global.generatedEs2panda._MethodDefinitionOverloadsConst(global.context, this.peer));
    }

    setOverloads(overloads: readonly MethodDefinition[]): this {
        global.generatedEs2panda._MethodDefinitionSetOverloads(
            global.context,
            this.peer,
            passNodeArray(overloads),
            overloads.length
        );
        return this;
    }

    setBaseOverloadMethod(baseOverloadMethod?: MethodDefinition): this {
        global.generatedEs2panda._MethodDefinitionSetBaseOverloadMethod(
            global.context,
            this.peer,
            passNode(baseOverloadMethod)
        );
        return this;
    }

    readonly kind: Es2pandaMethodDefinitionKind;
    readonly scriptFunction: ScriptFunction;
    readonly name: Identifier;
    readonly funcExpr: FunctionExpression;
}

export class VariableDeclaration extends AstNode {
    constructor(peer: KPtr) {
        assertValidPeer(peer, Es2pandaAstNodeType.AST_NODE_TYPE_VARIABLE_DECLARATION);
        super(peer);
        this.declarationKind = global.generatedEs2panda._VariableDeclarationKindConst(global.context, this.peer);
        this.declarators = unpackNodeArray(
            global.generatedEs2panda._VariableDeclarationDeclaratorsConst(global.context, this.peer)
        );
    }

    override get nodeType(): Es2pandaAstNodeType {
        return Es2pandaAstNodeType.AST_NODE_TYPE_VARIABLE_DECLARATION;
    }

    static create(
        modifiers: KInt,
        kind: Es2pandaVariableDeclarationKind,
        declarators: readonly VariableDeclarator[]
    ): VariableDeclaration {
        const peer = global.generatedEs2panda._CreateVariableDeclaration(
            global.context,
            kind,
            passNodeArray(declarators),
            declarators.length
        );
        global.generatedEs2panda._AstNodeClearModifier(global.context, peer, allFlags);
        global.generatedEs2panda._AstNodeAddModifier(global.context, peer, modifiers);
        return new VariableDeclaration(peer);
    }

    static update(
        node: VariableDeclaration,
        modifiers: KInt,
        kind: Es2pandaVariableDeclarationKind,
        declarators: readonly VariableDeclarator[]
    ): VariableDeclaration {
        const peer = global.generatedEs2panda._UpdateVariableDeclaration(
            global.context,
            node.peer,
            kind,
            passNodeArray(declarators),
            declarators.length
        );
        global.generatedEs2panda._AstNodeClearModifier(global.context, peer, allFlags);
        global.generatedEs2panda._AstNodeAddModifier(global.context, peer, modifiers);
        return new VariableDeclaration(peer);
    }

    get annotations(): readonly AnnotationUsage[] {
        return unpackNodeArray(
            global.generatedEs2panda._VariableDeclarationAnnotationsConst(global.context, this.peer)
        );
    }
    /** @deprecated */
    setAnnotations(annotations: readonly AnnotationUsage[]): this {
        global.generatedEs2panda._VariableDeclarationSetAnnotations(
            global.context,
            this.peer,
            passNodeArray(annotations),
            annotations.length
        );
        return this;
    }

    readonly declarationKind: Es2pandaVariableDeclarationKind;
    readonly declarators: readonly VariableDeclarator[];
}

export class VariableDeclarator extends AstNode {
    constructor(peer: KPtr) {
        assertValidPeer(peer, Es2pandaAstNodeType.AST_NODE_TYPE_VARIABLE_DECLARATOR);
        super(peer);
        this.name = unpackNonNullableNode(global.generatedEs2panda._VariableDeclaratorId(global.context, this.peer));
    }

    override get nodeType(): Es2pandaAstNodeType {
        return Es2pandaAstNodeType.AST_NODE_TYPE_VARIABLE_DECLARATOR;
    }

    static create(
        flag: Es2pandaVariableDeclaratorFlag,
        name: Identifier,
        initializer: AstNode | undefined
    ): VariableDeclarator {
        const peer = global.generatedEs2panda._CreateVariableDeclarator(global.context, flag, passNode(name));
        if (initializer !== undefined) {
            global.generatedEs2panda._VariableDeclaratorSetInit(global.context, peer, initializer.peer);
        }
        return new VariableDeclarator(peer);
    }

    static update(
        node: VariableDeclarator,
        flag: Es2pandaVariableDeclaratorFlag,
        name: Identifier,
        initializer: AstNode | undefined
    ): VariableDeclarator {
        const peer = global.generatedEs2panda._UpdateVariableDeclarator(
            global.context,
            node.peer,
            flag,
            passNode(name)
        );
        if (initializer !== undefined) {
            global.generatedEs2panda._VariableDeclaratorSetInit(global.context, peer, initializer.peer);
        }
        return new VariableDeclarator(peer);
    }

    get initializer(): AstNode | undefined {
        return unpackNode(global.generatedEs2panda._VariableDeclaratorInit(global.context, this.peer));
    }

    /** @deprecated */
    setInit(init?: Expression): this {
        global.generatedEs2panda._VariableDeclaratorSetInit(global.context, this.peer, passNode(init));
        return this;
    }

    get flag(): Es2pandaVariableDeclaratorFlag {
        return global.generatedEs2panda._VariableDeclaratorFlag(global.context, this.peer);
    }

    readonly name: Identifier;
}

export class SuperExpression extends AstNode {
    constructor(peer: KPtr) {
        assertValidPeer(peer, Es2pandaAstNodeType.AST_NODE_TYPE_SUPER_EXPRESSION);
        super(peer);
        this.id = unpackNode(global.generatedEs2panda._TSInterfaceDeclarationId(global.context, this.peer));
    }

    override get nodeType(): Es2pandaAstNodeType {
        return Es2pandaAstNodeType.AST_NODE_TYPE_SUPER_EXPRESSION;
    }

    static create(): SuperExpression {
        return new SuperExpression(global.generatedEs2panda._CreateSuperExpression(global.context));
    }

    readonly id?: Identifier;
}

export class ETSStringLiteralType extends TypeNode {
    constructor(peer: KPtr) {
        assertValidPeer(peer, Es2pandaAstNodeType.AST_NODE_TYPE_ETS_STRING_LITERAL_TYPE);
        super(peer);
    }

    override get nodeType(): Es2pandaAstNodeType {
        return Es2pandaAstNodeType.AST_NODE_TYPE_ETS_STRING_LITERAL_TYPE;
    }

    static create(str: string): ETSStringLiteralType {
        return new ETSStringLiteralType(global.es2panda._CreateETSStringLiteralType(global.context, passString(str)));
    }

    static update(original: ETSStringLiteralType | undefined, value: string): ETSStringLiteralType {
        return new ETSStringLiteralType(global.es2panda._UpdateETSStringLiteralType(global.context, passNode(original), value));
    }
}

const pairs: [Es2pandaAstNodeType, { new (peer: KNativePointer): AstNode }][] = [
    [Es2pandaAstNodeType.AST_NODE_TYPE_ETS_MODULE, EtsScript],
    [Es2pandaAstNodeType.AST_NODE_TYPE_IDENTIFIER, Identifier],
    [Es2pandaAstNodeType.AST_NODE_TYPE_NUMBER_LITERAL, NumberLiteral],
    [Es2pandaAstNodeType.AST_NODE_TYPE_EXPRESSION_STATEMENT, ExpressionStatement],
    [Es2pandaAstNodeType.AST_NODE_TYPE_FUNCTION_DECLARATION, FunctionDeclaration],
    [Es2pandaAstNodeType.AST_NODE_TYPE_SCRIPT_FUNCTION, ScriptFunction],
    [Es2pandaAstNodeType.AST_NODE_TYPE_BLOCK_STATEMENT, BlockStatement],
    [Es2pandaAstNodeType.AST_NODE_TYPE_ETS_PARAMETER_EXPRESSION, ETSParameterExpression],
    [Es2pandaAstNodeType.AST_NODE_TYPE_TS_TYPE_PARAMETER_DECLARATION, TSTypeParameterDeclaration],
    [Es2pandaAstNodeType.AST_NODE_TYPE_CALL_EXPRESSION, CallExpression],
    [Es2pandaAstNodeType.AST_NODE_TYPE_MEMBER_EXPRESSION, MemberExpression],
    [Es2pandaAstNodeType.AST_NODE_TYPE_ARROW_FUNCTION_EXPRESSION, ArrowFunctionExpression],
    [Es2pandaAstNodeType.AST_NODE_TYPE_STRUCT_DECLARATION, StructDeclaration],
    [Es2pandaAstNodeType.AST_NODE_TYPE_METHOD_DEFINITION, MethodDefinition],
    [Es2pandaAstNodeType.AST_NODE_TYPE_ASSIGNMENT_EXPRESSION, AssignmentExpression],
    [Es2pandaAstNodeType.AST_NODE_TYPE_VARIABLE_DECLARATION, VariableDeclaration],
    [Es2pandaAstNodeType.AST_NODE_TYPE_VARIABLE_DECLARATOR, VariableDeclarator],
    [Es2pandaAstNodeType.AST_NODE_TYPE_FUNCTION_EXPRESSION, FunctionExpression],
    [Es2pandaAstNodeType.AST_NODE_TYPE_ETS_TYPE_REFERENCE, ETSTypeReference],
    [Es2pandaAstNodeType.AST_NODE_TYPE_ETS_TYPE_REFERENCE_PART, ETSTypeReferencePart],
    [Es2pandaAstNodeType.AST_NODE_TYPE_OBJECT_EXPRESSION, ObjectExpression],
    [Es2pandaAstNodeType.AST_NODE_TYPE_ARRAY_EXPRESSION, ArrayExpression],
];
pairs.forEach(([nodeType, astNode]) => nodeByType.set(nodeType, astNode));
