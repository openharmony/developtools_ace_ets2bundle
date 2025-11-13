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
import { checkIsStructMethodFromInfo } from '../../collectors/ui-collectors/utils';
import { ClassInfo, computedField } from '../utils';
import { generateThisBacking, generateGetOrSetCall } from './utils';
import {
    BaseMethodTranslator,
    MethodCacheTranslator,
    MethodCacheTranslatorOptions,
    MethodTranslator,
    MethodTranslatorOptions,
} from './base';
import { factory as UIFactory } from '../ui-factory';
import { factory } from './factory';
import { ComputedCache } from './cache/computedCache';

function fieldWithComputedMethod(
    this: BaseMethodTranslator,
    newName: string,
    originalName: string,
    modifiers: arkts.Es2pandaModifierFlags
): arkts.ClassProperty {
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
                        flags:
                            arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW |
                            arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_HAS_RETURN,
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
    return field;
}

function getterWithComputedMethod(
    this: BaseMethodTranslator,
    newName: string,
    className: string,
    isStatic: boolean
): arkts.MethodDefinition {
    const scriptFunction = this.method.scriptFunction;
    scriptFunction.addFlag(arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_HAS_RETURN);
    scriptFunction.setBody(
        arkts.factory.createBlock([arkts.factory.createReturnStatement(computedGetCall(newName, className, isStatic))])
    );
    return this.method;
}

function computedGetCall(newName: string, className: string, isStatic: boolean): arkts.CallExpression {
    const thisValue: arkts.Expression = isStatic
        ? UIFactory.generateMemberExpression(arkts.factory.createIdentifier(className), newName)
        : generateThisBacking(newName, false, true);
    return generateGetOrSetCall(thisValue, GetSetTypes.GET);
}

export interface IComputedTranslator {
    field(newName: string, originalName: string, isStatic: boolean): arkts.ClassProperty;
    getter(newName: string, isStatic: boolean): arkts.MethodDefinition;
}

export class ComputedTranslator extends MethodTranslator implements IComputedTranslator {
    private isStatic: boolean;

    constructor(options: MethodTranslatorOptions) {
        super(options);
        this.isStatic = this.method.isStatic;
    }

    field(newName: string, originalName: string, isStatic: boolean): arkts.ClassProperty {
        const modifiers = isStatic ? this.method.modifiers : arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PRIVATE;
        return fieldWithComputedMethod.bind(this)(newName, originalName, modifiers);
    }

    getter(newName: string, isStatic: boolean): arkts.MethodDefinition {
        return getterWithComputedMethod.bind(this)(newName, this.classInfo.className, isStatic);
    }

    translateMember(): arkts.AstNode[] {
        const originalName: string = expectName(this.method.name);
        const newName: string = computedField(originalName);
        if (this.classInfo.isFromStruct && !this.isStatic) {
            this.cacheTranslatedInitializer(newName);
        }
        return this.translateWithoutInitializer(newName, originalName);
    }

    cacheTranslatedInitializer(newName: string): void {
        ComputedCache.getInstance().collectComputed(this.classInfo.className, { newName });
    }

    translateWithoutInitializer(newName: string, originalName: string): arkts.AstNode[] {
        const field = this.field(newName, originalName, this.isStatic);
        const getter = this.getter(newName, this.isStatic);
        return [field, getter];
    }
}

export class ComputedCacheTranslator extends MethodCacheTranslator implements IComputedTranslator {
    private isStatic: boolean;

    constructor(options: MethodCacheTranslatorOptions) {
        super(options);
        this.isStatic = this.method.isStatic;
    }

    field(newName: string, originalName: string, isStatic: boolean): arkts.ClassProperty {
        const modifiers = isStatic ? this.methodInfo.modifiers! : arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PRIVATE;
        return fieldWithComputedMethod.bind(this)(newName, originalName, modifiers);
    }

    getter(newName: string, isStatic: boolean): arkts.MethodDefinition {
        let className: string;
        if (checkIsStructMethodFromInfo(this.methodInfo)) {
            className = this.methodInfo.structInfo?.name!;
        } else {
            className = this.methodInfo.classInfo?.name!;
        }
        return getterWithComputedMethod.bind(this)(newName, className, isStatic);
    }

    translateMember(): arkts.AstNode[] {
        const originalName: string = this.methodInfo.name!;
        const newName: string = computedField(originalName);
        this.cacheTranslatedInitializer(newName);
        return this.translateWithoutInitializer(newName, originalName);
    }

    cacheTranslatedInitializer(newName: string): void {
        if (!checkIsStructMethodFromInfo(this.methodInfo) || this.isStatic) {
            return;
        }
        ComputedCache.getInstance().collectComputed(this.methodInfo.structInfo?.name!, { newName });
    }

    translateWithoutInitializer(newName: string, originalName: string): arkts.AstNode[] {
        const field = this.field(newName, originalName, this.isStatic);
        const getter = this.getter(newName, this.isStatic);
        return [field, getter];
    }
}
