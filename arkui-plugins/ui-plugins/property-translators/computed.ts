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

import { expectName } from '../../common/arkts-utils';
import { GetSetTypes, StateManagementTypes } from '../../common/predefines';
import { AbstractVisitor } from '../../common/abstract-visitor';
import { ClassInfo, computedField } from '../utils';
import { generateThisBacking, generateGetOrSetCall } from './utils';
import { MethodTranslator } from './base';
import { InitializerConstructor } from './types';
import { factory as UIFactory } from '../ui-factory';
import { factory } from './factory';

export class ComputedTranslator extends MethodTranslator implements InitializerConstructor {
    private isStatic: boolean;

    constructor(method: arkts.MethodDefinition, classInfo: ClassInfo) {
        super(method, classInfo);
        this.isStatic = this.method.isStatic;
    }

    translateMember(): arkts.AstNode[] {
        const originalName: string = expectName(this.method.name);
        const newName: string = computedField(originalName);
        if (!this.returnType) {
            this.returnType = getGetterReturnType(this.method);
        }
        return this.translateWithoutInitializer(newName, originalName);
    }

    cacheTranslatedInitializer(newName: string): void {}

    translateWithoutInitializer(newName: string, originalName: string): arkts.AstNode[] {
        const modifiers = this.isStatic ? this.method.modifiers : arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PRIVATE;
        const field: arkts.ClassProperty = arkts.factory.createClassProperty(
            arkts.factory.createIdentifier(newName),
            factory.generateStateMgmtFactoryCall(
                StateManagementTypes.MAKE_COMPUTED,
                this.returnType,
                [
                    arkts.factory.createArrowFunction(
                        UIFactory.createScriptFunction({
                            body: this.method.scriptFunction.body?.clone(),
                            modifiers: modifiers,
                            flags: arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW,
                        })
                    ),
                    arkts.factory.createStringLiteral(originalName),
                ],
                false
            ),
            undefined,
            modifiers,
            false
        );

        const originGetter: arkts.MethodDefinition = UIFactory.updateMethodDefinition(this.method, {
            function: {
                returnTypeAnnotation: this.returnType,
                body: arkts.factory.createBlock([
                    arkts.factory.createReturnStatement(this.generateComputedGet(newName)),
                ]),
            },
        });

        return [field, originGetter];
    }

    generateComputedGet(newName: string): arkts.CallExpression {
        const thisValue: arkts.Expression = this.isStatic
            ? UIFactory.generateMemberExpression(arkts.factory.createIdentifier(this.classInfo.className), newName)
            : generateThisBacking(newName, false, true);
        return generateGetOrSetCall(thisValue, GetSetTypes.GET);
    }
}

function getGetterReturnType(method: arkts.MethodDefinition): arkts.TypeNode | undefined {
    const body = method.scriptFunction.body;
    if (!body || !arkts.isBlockStatement(body) || body.statements.length <= 0) {
        return undefined;
    }
    let returnType: arkts.TypeNode | undefined = undefined;
    const returnTransformer = new ReturnTransformer();
    returnTransformer.visitor(body);
    const typeArray = returnTransformer.types;
    if (typeArray.length <= 0) {
        returnType = undefined;
    } else if (typeArray.length === 1) {
        returnType = typeArray.at(0);
    } else {
        returnType = arkts.factory.createUnionType(typeArray);
    }
    returnTransformer.reset();
    return returnType?.clone();
}

class ReturnTransformer extends AbstractVisitor {
    private _types: arkts.TypeNode[] = [];

    reset(): void {
        super.reset();
        this._types = [];
    }

    visitor(beforeChildren: arkts.AstNode): arkts.AstNode {
        const node = this.visitEachChild(beforeChildren);
        if (arkts.isReturnStatement(node) && node.argument) {
            const type = arkts.createTypeNodeFromTsType(node.argument);
            if (!!type && arkts.isTypeNode(type)) {
                this._types.push(type);
            }
            return node;
        }
        return node;
    }

    get types(): arkts.TypeNode[] {
        return this._types;
    }
}
