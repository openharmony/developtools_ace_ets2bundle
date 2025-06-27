/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
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

import * as arkts from '@koalaui/libarkts';
import { expectNameInTypeReference } from '../../../common/arkts-utils';
import { collectTypeRecordFromParameter, collectTypeRecordFromTypeParameterDeclaration, collectTypeRecordFromTypeParameterInstantiation, ParameterRecord, TypeParameterTypeRecord, TypeRecord } from '../../utils/collect-types';
import { MetaDataCollector } from '../../../common/metadata-collector';
import { ARKUI_FOREACH_SOURCE_NAME, DecoratorNames, InnerComponentNames } from '../../../common/predefines';
import { BaseRecord, RecordOptions } from './base';
import { AstNodePointer } from '../../../common/safe-types';
import { isDeclFromArkUI } from '../utils';
import { hasMemoAnnotation, MemoAstNode } from '../../memo-collectors/utils';

export type InnerComponentFunctionInfo = ComponentAttributeInfo & ComponentInfo & {
    hasLastTrailingLambda?: boolean;
};

export type ComponentInfo = {
    paramRecords?: ParameterRecord[];
    typeParameters?: TypeParameterTypeRecord[];
    hasRestParameter?: boolean;
    hasReceiver?: boolean;
}

export type ComponentAttributeInfo = {
    attributeName?: string;
    attributeTypeParams?: TypeRecord[];
}

/**
 * find attribute info from component method
 */
export function findAttributeInfoFromComponentMethod(component: arkts.MethodDefinition): ComponentAttributeInfo | undefined {
    const type = component.scriptFunction.returnTypeAnnotation;
    const name = expectNameInTypeReference(type);
    if (!name) {
        return undefined;
    }
    return {
        attributeName: name.name,
        attributeTypeParams: collectTypeRecordFromTypeParameterInstantiation(
            (name.parent as arkts.ETSTypeReferencePart).typeParams
        ),
    };
}

export function findBuilderName(node: arkts.TypeNode | arkts.ETSParameterExpression, ignoreDecl: boolean = false): boolean {
    const builderAnnoExpr = node.annotations.find((anno) => {
        const expr = anno.expr;
        if (!expr || !arkts.isIdentifier(expr)) {
            return true;
        }
        const name = expr.name;
        if (name === DecoratorNames.BUILDER) {
            const decl = arkts.getPeerIdentifierDecl(expr!.peer);
            if (!decl) {
                return false;
            }
            if (!ignoreDecl && !isDeclFromArkUI(decl)) {
                return false;
            }
            return true;
        }
        return name === 'memo' || name === 'Memo';
    });
    return !!builderAnnoExpr;
}

export function checkIsTrailingLambdaType(typeNode: arkts.AstNode | undefined, ignoreDecl: boolean = false, shouldIgnoreAnnotation: boolean = false): boolean {
    if (!typeNode) {
        return false;
    }
    const queue: arkts.AstNode[] = [typeNode];
    const visitedNames: AstNodePointer[] = [];
    let hasTrailingLambdaType: boolean = false;
    let hasBuilderAnnotation: boolean = shouldIgnoreAnnotation;
    let otherTypeLength: number = 0;
    while (queue.length > 0 && otherTypeLength === 0 && !(hasTrailingLambdaType && hasBuilderAnnotation)) {
        const node = queue.shift()!;
        if (arkts.isETSFunctionType(node)) {
            hasTrailingLambdaType ||= node.params.length === 0 && !!node.returnType && node.returnType.dumpSrc() === 'void';
            hasBuilderAnnotation ||= findBuilderName(node, ignoreDecl);
            if (!hasTrailingLambdaType && !hasBuilderAnnotation) {
                otherTypeLength ++;
            }
        } else if (arkts.isETSUnionType(node)) {
            queue.push(...node.types);
            hasBuilderAnnotation ||= findBuilderName(node, ignoreDecl);
        } else if (arkts.isETSTypeReference(node)) {
            const name = expectNameInTypeReference(node);
            if (!name) {
                continue;
            }
            const decl = !!name ? arkts.getPeerIdentifierDecl(name.peer) : undefined;
            if (!decl || !arkts.isTSTypeAliasDeclaration(decl) || visitedNames.includes(decl.peer)) {
                continue;
            }
            visitedNames.push(decl.peer);
            const type = decl.typeAnnotation;
            if (!type) {
                continue;
            }
            queue.push(type);
            hasBuilderAnnotation ||= findBuilderName(node, ignoreDecl);
        } else if (!arkts.isETSUndefinedType(node)) {
            otherTypeLength ++;
        }
    }
    return hasTrailingLambdaType && hasBuilderAnnotation && otherTypeLength === 0;
}

/**
 * check whether the last parameter is trailing lambda in components.
 */
export function checkIsTrailingLambdaInLastParam(params: readonly arkts.Expression[], ignoreDecl: boolean = false): boolean {
    if (params.length === 0) {
        return false;
    }
    const lastParam = params.at(params.length - 1)! as arkts.ETSParameterExpression;
    const hasBuilder = findBuilderName(lastParam, ignoreDecl);
    return checkIsTrailingLambdaType(lastParam.type, ignoreDecl, hasBuilder);
}

/**
 * Determine whether the node is ForEach method declaration or call expression.
 *
 * @param node method definition node.
 * @param sourceName external source name.
 */
export function isForEach(name: string | undefined, sourceName?: string): boolean {
    const externalSourceName = sourceName ?? MetaDataCollector.getInstance().externalSourceName;
    return name === InnerComponentNames.FOR_EACH && externalSourceName === ARKUI_FOREACH_SOURCE_NAME;
}

export class InnerComponentFunctionRecord extends BaseRecord<arkts.MethodDefinition, InnerComponentFunctionInfo> {
    private paramRecords?: ParameterRecord[];
    private typeParameters?: TypeParameterTypeRecord[];
    private hasRestParameter?: boolean;
    private hasReceiver?: boolean;
    private attributeName?: string;
    private attributeTypeParams?: TypeRecord[];
    private hasLastTrailingLambda?: boolean;

    constructor(options: RecordOptions) {
        super(options);
    }

    private preprocessParam(
        param: arkts.ETSParameterExpression,
        index: number,
        name: string
    ): arkts.ETSParameterExpression {
        if (index === 0 && isForEach(name) && !!param.type && arkts.isTypeNode(param.type)) {
            const lambdaType = arkts.factory.createFunctionType(
                arkts.FunctionSignature.createFunctionSignature(
                    undefined,
                    [],
                    param.type.clone(),
                    false
                ),
                arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW
            );
            return arkts.factory.createParameterDeclaration(
                arkts.factory.createIdentifier(param.identifier.name, lambdaType),
                undefined
            );
        }
        return param;
    }

    collectFromNode(node: arkts.MethodDefinition): void {
        const attributeInfo = findAttributeInfoFromComponentMethod(node);
        if (!attributeInfo) {
            return;
        }
        const name: string = node.name.name;
        const func = node.scriptFunction;
        const hasRestParameter = func.hasRestParameter;
        const hasReceiver = func.hasReceiver;
        const typeParameters = collectTypeRecordFromTypeParameterDeclaration(func.typeParams);
        const params = func.params as arkts.ETSParameterExpression[];
        const paramRecords: ParameterRecord[] = [];
        const hasLastTrailingLambda = checkIsTrailingLambdaInLastParam(params, this.shouldIgnoreDecl);
        params.forEach((p, index) => {
            if (index === params.length - 1 && hasLastTrailingLambda) {
                return;
            }
            const record = collectTypeRecordFromParameter(this.preprocessParam(p, index, name));
            paramRecords.push(record);
        });
        this.attributeName = attributeInfo.attributeName;
        this.attributeTypeParams = attributeInfo.attributeTypeParams;
        this.paramRecords = paramRecords;
        this.typeParameters = typeParameters;
        this.hasRestParameter = hasRestParameter;
        this.hasReceiver = hasReceiver;
        this.hasLastTrailingLambda = hasLastTrailingLambda;
    }

    refreshOnce(): void {
        let currInfo = this.info ?? {};
        currInfo = {
            ...currInfo,
            ...(this.attributeName && { attributeName: this.attributeName }),
            ...(this.attributeTypeParams && { attributeTypeParams: this.attributeTypeParams }),
            ...(this.paramRecords && { paramRecords: this.paramRecords }),
            ...(this.typeParameters && { typeParameters: this.typeParameters }),
            ...(this.hasRestParameter && { hasRestParameter: this.hasRestParameter }),
            ...(this.hasReceiver && { hasReceiver: this.hasReceiver }),
            ...(this.hasLastTrailingLambda && { hasLastTrailingLambda: this.hasLastTrailingLambda }),
        };
        this.info = currInfo;
    }

    toJSON(): InnerComponentFunctionInfo {
        this.refresh();
        return {
            ...(this.info?.attributeName && { attributeName: this.info.attributeName }),
            ...(this.info?.attributeTypeParams && { attributeTypeParams: this.info.attributeTypeParams }),
            ...(this.info?.paramRecords && { paramRecords: this.info.paramRecords }),
            ...(this.info?.typeParameters && { typeParameters: this.info.typeParameters }),
            ...(this.info?.hasRestParameter && { hasRestParameter: this.info.hasRestParameter }),
            ...(this.info?.hasReceiver && { hasReceiver: this.info.hasReceiver }),
            ...(this.info?.hasLastTrailingLambda && { hasLastTrailingLambda: this.info.hasLastTrailingLambda }),
        };
    }
}
