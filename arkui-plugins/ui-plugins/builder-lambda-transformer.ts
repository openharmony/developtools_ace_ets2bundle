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

import * as arkts from "@koalaui/libarkts"
import { AbstractVisitor } from "../common/abstract-visitor";
import {
    BuilderLambdaNames,
    findBuilderLambdaDecl,
    findBuilderLambdaInCall,
    hasModifierFlag,
    isBuilderLambdaAnnotation,
    isBuilderLambdaCall
} from "./utils";
import {
    annotation,
    filterDefined,
    removeAnnotationByName
} from "../common/arkts-utils";

function createStyleArgInBuilderLambda(
    lambdaBody: arkts.Expression | undefined,
    typeNode: arkts.TypeNode | undefined,
): arkts.UndefinedLiteral | arkts.ArrowFunctionExpression {
    if (!lambdaBody) {
        return arkts.factory.createUndefinedLiteral();
    }

    const styleLambdaParam: arkts.ETSParameterExpression = arkts.factory.createParameterDeclaration(
        arkts.factory.createIdentifier(
            BuilderLambdaNames.STYLE_ARROW_PARAM_NAME, 
            typeNode
        ),
        undefined
    );

    const body: arkts.BlockStatement = arkts.factory.createBlock([
        arkts.factory.createExpressionStatement(lambdaBody),
        arkts.factory.createReturnStatement()
    ]);

    const func = arkts.factory.createScriptFunction(
        body,
        arkts.FunctionSignature.createFunctionSignature(
            undefined,
            [styleLambdaParam],
            arkts.factory.createPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID),
            false
        ),
        arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW,
        arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC | arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_STATIC
    )

    return arkts.factory.createArrowFunction(func);
}

function createStyleArgInBuilderLambdaDecl(
    typeNode: arkts.TypeNode | undefined
): arkts.ETSParameterExpression {
    const styleLambdaParam: arkts.ETSParameterExpression = arkts.factory.createParameterDeclaration(
        arkts.factory.createIdentifier(
            BuilderLambdaNames.STYLE_ARROW_PARAM_NAME, 
            typeNode
        ),
        undefined
    );
    const funcType = arkts.factory.createFunctionType(
        arkts.FunctionSignature.createFunctionSignature(
            undefined,
            [styleLambdaParam],
            arkts.factory.createPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID),
            false
        ),
        arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW
    )
    const optionalFuncType = arkts.factory.createUnionType([
        funcType,
        arkts.factory.createETSUndefinedType()
    ]);
    const parameter = arkts.factory.createParameterDeclaration(
        arkts.factory.createIdentifier(
            BuilderLambdaNames.STYLE_PARAM_NAME, 
            funcType
        ).setOptional(true),
        undefined
    );
    parameter.annotations = [annotation("memo")];
    return parameter;
}

function updateFactoryArgInBuilderLambda(
    arg: arkts.Expression | undefined,
    typeNode: arkts.TypeNode | undefined
): arkts.ArrowFunctionExpression | undefined {
    if (!arg || !arkts.isArrowFunctionExpression(arg)) {
        throw new Error("first argument in $_instantiate is undefined");
    };

    const func: arkts.ScriptFunction = arg.scriptFunction;
    const updateFunc = arkts.factory.updateScriptFunction(
        func,
        func.body,
        arkts.FunctionSignature.createFunctionSignature(
            func.typeParams,
            func.params,
            typeNode,
            false
        ),
        func.flags,
        func.modifiers
    )
    if (!!func.id) {
        updateFunc.setIdent(func.id);
    }
    // const updateFunc: arkts.ScriptFunction = arkts.factory.updateScriptFunction(
    //     func,
    //     func.body,
    //     func.scriptFunctionFlags,
    //     func.modifiers,
    //     false,
    //     func.ident,
    //     func.parameters,
    //     func.typeParamsDecl,
    //     typeNode
    // );
    return arkts.factory.updateArrowFunction(
        arg,
        updateFunc
    );
}

function updateContentBodyInBuilderLambda(
    statement: arkts.Statement,
    isExternal?: boolean
): arkts.Statement {
    if (
        arkts.isExpressionStatement(statement)
        && arkts.isCallExpression(statement.expression) 
        && isBuilderLambda(statement.expression, isExternal)
    ) {
        return arkts.factory.updateExpressionStatement(
            statement,
            transformBuilderLambda(statement.expression)
        );
    }
    return statement;
}

/**
 * Used in finding "XXX" in BuilderLambda("XXX")
 * @deprecated
 */
function builderLambdaArgumentName(annotation: arkts.AnnotationUsage): string | undefined {
    if (!isBuilderLambdaAnnotation(annotation)) return undefined;

    const property = annotation.properties.at(0);
    if (!property || !arkts.isClassProperty(property)) return undefined;
    if (!property.value || !arkts.isStringLiteral(property.value)) return undefined;

    return property.value.str;
}

function builderLambdaFunctionName(node: arkts.CallExpression): string | undefined {
    const annotation = findBuilderLambdaInCall(node);
    if (!annotation) return undefined;
    console.log("[BUILDER LAMBDA CALL] annotation: ", annotation.dumpSrc());
    if (arkts.isIdentifier(node.expression)) {
        return node.expression.name;
    }
    if (
        arkts.isMemberExpression(node.expression)
        && arkts.isIdentifier(node.expression.property)
        && node.expression.property.name === BuilderLambdaNames.ORIGIN_METHOD_NAME
    ) {
        return BuilderLambdaNames.TRANSFORM_METHOD_NAME
    }
    return undefined;
}

function replaceBuilderLambdaDeclMethodName(name: string | undefined): string | undefined {
    if (!!name && name === BuilderLambdaNames.ORIGIN_METHOD_NAME) {
        return BuilderLambdaNames.TRANSFORM_METHOD_NAME
    }
    return undefined;
}

function callIsGoodForBuilderLambda(leaf: arkts.CallExpression): boolean {
    const node = leaf.expression;
    return arkts.isIdentifier(node) || arkts.isMemberExpression(node);
}

function builderLambdaType(
    leaf: arkts.CallExpression,
    isFunctionCall: boolean
): arkts.TypeNode | undefined {
    if (!callIsGoodForBuilderLambda(leaf)) return undefined;
    const node = leaf.expression;

    let name: string | undefined;
    if (arkts.isIdentifier(node)) {
        name = node.name;
    }
    if (arkts.isMemberExpression(node) && arkts.isIdentifier(node.object)) {
        name = node.object.name;
    }

    if (!name) return undefined;

    // TODO: it should be the return type of the function annotated with the @BuilderLambda
    return arkts.factory.createTypeReference(
        arkts.factory.createTypeReferencePart(
            arkts.factory.createIdentifier(
                isFunctionCall ? `${name}Attribute`: name
            )
        )
    );
}

function builderLambdaMethodDeclType(
    method: arkts.MethodDefinition
): arkts.TypeNode | undefined {
    if (!method || !method.scriptFunction) return undefined;
    return method.scriptFunction.returnTypeAnnotation;
}

function getBuilderLambdaArgNumFromDecl(node: arkts.CallExpression): number | undefined {
    const decl = findBuilderLambdaDecl(node);
    if (!decl) return undefined;

    if (arkts.isMethodDefinition(decl)) {
        const params = decl.scriptFunction.params;
        return params.length;
    }

    return undefined;
}

function builderLambdaReplace(leaf: arkts.CallExpression): arkts.Identifier | arkts.MemberExpression | undefined {
    if (!callIsGoodForBuilderLambda(leaf)) return undefined;
	const node = leaf.expression;

    const funcName = builderLambdaFunctionName(leaf);
    if (!funcName) return undefined;

    if (arkts.isIdentifier(node)) {
        return arkts.factory.createIdentifier(funcName);
    }
    if (arkts.isMemberExpression(node)) {
        return arkts.factory.createMemberExpression(
            node.object,
            arkts.factory.createIdentifier(funcName),
            arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
            node.computed,
            node.optional
        )
    }
    return undefined;
}

function createOrUpdateArgInBuilderLambda(
    arg: arkts.Expression | undefined,
    isExternal?: boolean
) {
    if (!arg) {
        return arkts.factory.createUndefinedLiteral();
    }

    if (arkts.isArrowFunctionExpression(arg)) {
        const func: arkts.ScriptFunction = arg.scriptFunction;
        const updateFunc = arkts.factory.updateScriptFunction(
            func,
            !!func.body && arkts.isBlockStatement(func.body) ? arkts.factory.updateBlock(
                func.body,
                func.body.statements.map(
                    (st) => updateContentBodyInBuilderLambda(st, isExternal)
                )
            ) : undefined,
            arkts.FunctionSignature.createFunctionSignature(
                func.typeParams,
                func.params,
                func.returnTypeAnnotation,
                false
            ),
            func.flags,
            func.modifiers
        )
        if (!!func.id) {
            updateFunc.setIdent(func.id);
        }

        // const updateFunc: arkts.ScriptFunction = arkts.factory.updateScriptFunction(
        //     func,
        //     func.body ? arkts.factory.updateBlock(
        //         func.body,
        //         func.body.statements.map(
        //             (st) => updateContentBodyInBuilderLambda(st, isExternal)
        //         )
        //     ) : undefined,
        //     func.scriptFunctionFlags,
        //     func.modifiers,
        //     false,
        //     func.ident,
        //     func.parameters,
        //     func.typeParamsDecl,
        //     func.returnTypeAnnotation
        // );

        return arkts.factory.updateArrowFunction(
            arg,
            updateFunc
        );
    }
    return arg;
}

function transformBuilderLambda(node: arkts.CallExpression, isExternal?: boolean): arkts.AstNode {
    let instanceCalls: arkts.CallExpression[] = [];
    let leaf: arkts.CallExpression = node;
    let isFunctionCall: boolean = false;

    while (true
        && arkts.isMemberExpression(leaf.expression)
        && arkts.isIdentifier(leaf.expression.property)
        && arkts.isCallExpression(leaf.expression.object)
    ) {
        isFunctionCall = arkts.isIdentifier(leaf.expression.property);
        instanceCalls.push(
            arkts.factory.createCallExpression(
                leaf.expression.property,
                undefined,
                leaf.arguments
            )
        );
        leaf = leaf.expression.object;
    }

    const replace: arkts.Identifier | arkts.MemberExpression | undefined 
        = builderLambdaReplace(leaf);
    const argNum: number | undefined = getBuilderLambdaArgNumFromDecl(leaf);
    if (!replace || !argNum) return node;

    let lambdaBody: arkts.Identifier | arkts.CallExpression | undefined;
    if (instanceCalls.length > 0) {
        instanceCalls = instanceCalls.reverse();
        lambdaBody = arkts.factory.createIdentifier(BuilderLambdaNames.STYLE_ARROW_PARAM_NAME);
        instanceCalls.forEach((call)=> {
            if (!arkts.isIdentifier(call.expression)) {
                throw new Error('call expression should be identifier');
            }
            lambdaBody = arkts.factory.createCallExpression(
                arkts.factory.createMemberExpression(
                    lambdaBody!,
                    call.expression,
                    arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                    false,
                    false
                ),
                undefined,
                call.arguments
            );
        });
    }

    const typeNode: arkts.TypeNode | undefined = builderLambdaType(leaf, isFunctionCall);
    const args: (arkts.AstNode | undefined)[] = [
        createStyleArgInBuilderLambda(lambdaBody, typeNode)
    ]

    let index = 0;
    if (!isFunctionCall) {
        args.push(updateFactoryArgInBuilderLambda(leaf.arguments.at(index), typeNode));
        index ++;
    }
    while (index < argNum) {
        args.push(createOrUpdateArgInBuilderLambda(leaf.arguments.at(index), isExternal));
        index ++;
    }

    return arkts.factory.updateCallExpression(
        node,
        replace,
        undefined,
        filterDefined(args)
    );
}

function transformBuilderLambdaMethodDecl(node: arkts.MethodDefinition): arkts.AstNode {
    const func: arkts.ScriptFunction = node.scriptFunction;

    const typeNode: arkts.TypeNode | undefined = builderLambdaMethodDeclType(node);
    const updateFunc = arkts.factory.updateScriptFunction(
        func,
        func.body,
        arkts.FunctionSignature.createFunctionSignature(
            func.typeParams,
            [
                createStyleArgInBuilderLambdaDecl(typeNode),
                ...func.params
            ],
            func.returnTypeAnnotation,
            false
        ),
        func.flags,
        func.modifiers
    ).setAnnotations(
        removeAnnotationByName(func.annotations, BuilderLambdaNames.ANNOTATION_NAME)
    );
    if (!!func.id) {
        updateFunc.setIdent(func.id);
    }
    // const updateFunc: arkts.ScriptFunction = arkts.factory.updateScriptFunction(
    //     func,
    //     func.body,
    //     func.scriptFunctionFlags,
    //     func.modifiers,
    //     true,
    //     func.ident,
    //     [
    //         createStyleArgInBuilderLambdaDecl(typeNode),
    //         ...func.parameters
    //     ],
    //     func.typeParamsDecl,
    //     func.returnTypeAnnotation,
    //     removeAnnotationByName(func.annotations, BuilderLambdaNames.ANNOTATION_NAME)
    // );

    return arkts.factory.updateMethodDefinition(
        node,
        node.kind,
        arkts.factory.updateIdentifier(
            node.name,
            replaceBuilderLambdaDeclMethodName(node.name.name) ?? node.name.name
        ),
        arkts.factory.createFunctionExpression(updateFunc),
        node.modifiers,
        false // TODO: how do I get it?
    )
}

function isBuilderLambda(node: arkts.AstNode, isExternal?: boolean): boolean {
    const builderLambdaCall: arkts.AstNode | undefined = getDeclForBuilderLambda(node);
    return !!builderLambdaCall;
}

function isBuilderLambdaMethodDecl(node: arkts.AstNode, isExternal?: boolean): boolean {
    const builderLambdaMethodDecl: arkts.AstNode | undefined = getDeclForBuilderLambdaMethodDecl(node);
    return !!builderLambdaMethodDecl;
}

function getDeclForBuilderLambdaMethodDecl(node: arkts.AstNode, isExternal?: boolean): arkts.AstNode | undefined  {
    if (!node || !arkts.isMethodDefinition(node)) return undefined;

    const isBuilderLambda: boolean = !!node.name && isBuilderLambdaCall(node.name);
    const isMethodDecl: boolean = !!node.scriptFunction 
        && hasModifierFlag(node.scriptFunction, arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_DECLARE);
    if (
        isBuilderLambda
        && isMethodDecl
    ) {
        return node;
    }
    return undefined;
}

function getDeclForBuilderLambda(node: arkts.AstNode, isExternal?: boolean): arkts.AstNode | undefined {
    if (!node || !arkts.isCallExpression(node)) return undefined;

    let currNode: arkts.AstNode = node;
    while ( 
        !!currNode 
        && arkts.isCallExpression(currNode)
        && !!currNode.expression
        && arkts.isMemberExpression(currNode.expression)
    ) {
        const _node: arkts.MemberExpression = currNode.expression;

        if (
            !!_node.property
            && arkts.isIdentifier(_node.property)
            && isBuilderLambdaCall(_node.property)
        ) {
            return node;
        }

        if (
            !!_node.object 
            && arkts.isCallExpression(_node.object)
            && isBuilderLambdaCall(_node.object)
        ) {
            return node;
        }

        currNode = _node.object;
    }

    return undefined;
}

export class BuilderLambdaTransformer extends AbstractVisitor {
    visitEachChild(node: arkts.AstNode): arkts.AstNode {
        if (arkts.isCallExpression(node) && isBuilderLambda(node, this.isExternal)) {
            return node;
        }
        if (arkts.isMethodDefinition(node) && isBuilderLambdaMethodDecl(node, this.isExternal)) {
            return node;
        }

        return super.visitEachChild(node);
    }

    visitor(beforeChildren: arkts.AstNode): arkts.AstNode {
        const node = this.visitEachChild(beforeChildren)

        if (arkts.isCallExpression(node) && isBuilderLambda(node, this.isExternal)) {
            const lambda = transformBuilderLambda(node, this.isExternal);
            // arkts.recheckSubtree(lambda);
            return lambda;
        }
        if (arkts.isMethodDefinition(node) && isBuilderLambdaMethodDecl(node, this.isExternal)) {
            const lambda = transformBuilderLambdaMethodDecl(node);
            return lambda;
        }

        return node;
    }
}
