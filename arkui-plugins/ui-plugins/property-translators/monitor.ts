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
import { DecoratorNames, MonitorNames, StateManagementTypes } from '../../common/predefines';
import { monitorField } from '../utils';
import { generateThisBacking, PropertyCache, collectStateManagementTypeImport } from './utils';
import { MethodTranslator } from './base';
import { InitializerConstructor } from './types';
import { factory as UIFactory } from '../ui-factory';
import { factory } from './factory';

export class MonitorTranslator extends MethodTranslator implements InitializerConstructor {
    translateMember(): arkts.AstNode[] {
        const originalName: string = expectName(this.method.name);
        const newName: string = monitorField(originalName);
        this.cacheTranslatedInitializer(newName, originalName);
        return this.translateWithoutInitializer(newName, originalName);
    }

    cacheTranslatedInitializer(newName: string, originalName: string): void {
        const monitorAssign: arkts.AstNode = this.generateinitAssignment(newName, originalName);
        if (this.classInfo.isFromStruct) {
            PropertyCache.getInstance().collectInitializeStruct(this.classInfo.className, [monitorAssign]);
        } else {
            PropertyCache.getInstance().collectContructor(this.classInfo.className, [monitorAssign]);
        }
    }

    translateWithoutInitializer(newName: string, originalName: string): arkts.AstNode[] {
        collectStateManagementTypeImport(StateManagementTypes.MONITOR_DECORATED);
        const field: arkts.ClassProperty = arkts.factory.createClassProperty(
            arkts.factory.createIdentifier(newName),
            undefined,
            arkts.factory.createUnionType([
                UIFactory.createTypeReferenceFromString(StateManagementTypes.MONITOR_DECORATED),
                arkts.factory.createETSUndefinedType(),
            ]),
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PRIVATE,
            false
        );

        return [field];
    }

    generateinitAssignment(newName: string, originalName: string): arkts.ExpressionStatement {
        const monitorItem: string[] | undefined = this.getValueInMonitorAnnotation();
        const thisValue: arkts.Expression = generateThisBacking(newName, false, false);
        const right: arkts.CallExpression = factory.generateStateMgmtFactoryCall(
            StateManagementTypes.MAKE_MONITOR,
            undefined,
            [this.generatePathArg(monitorItem), this.generateLambdaArg(originalName)],
            false
        );
        return arkts.factory.createExpressionStatement(
            arkts.factory.createAssignmentExpression(
                thisValue,
                arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_SUBSTITUTION,
                right
            )
        );
    }

    generatePathArg(monitorItem: string[] | undefined): arkts.ArrayExpression {
        if (!monitorItem || monitorItem.length <= 0) {
            return arkts.factory.createArrayExpression([]);
        }
        const params = monitorItem.map((itemName: string) => {
            return factory.createMonitorPathsInfoParameter(itemName);
        });
        return arkts.factory.createArrayExpression(params);
    }

    generateLambdaArg(originalName: string): arkts.ArrowFunctionExpression {
        return arkts.factory.createArrowFunction(
            UIFactory.createScriptFunction({
                params: [UIFactory.createParameterDeclaration(MonitorNames.M_PARAM, MonitorNames.I_MONITOR)],
                body: arkts.factory.createBlock([
                    arkts.factory.createExpressionStatement(
                        arkts.factory.createCallExpression(generateThisBacking(originalName), undefined, [
                            arkts.factory.createIdentifier(MonitorNames.M_PARAM),
                        ])
                    ),
                ]),
                flags: arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW,
            })
        );
    }

    getValueInMonitorAnnotation(): string[] | undefined {
        const annotations: readonly arkts.AnnotationUsage[] = this.method.scriptFunction.annotations;
        for (let i = 0; i < annotations.length; i++) {
            const anno: arkts.AnnotationUsage = annotations[i];
            if (
                anno.expr &&
                arkts.isIdentifier(anno.expr) &&
                anno.expr.name === DecoratorNames.MONITOR &&
                anno.properties.length === 1
            ) {
                return this.getArrayFromAnnoProperty(anno.properties[0]);
            }
        }
        return undefined;
    }

    getArrayFromAnnoProperty(property: arkts.AstNode): string[] | undefined {
        if (arkts.isClassProperty(property) && property.value && arkts.isArrayExpression(property.value)) {
            const resArr: string[] = [];
            property.value.elements.forEach((item: arkts.Expression) => {
                if (arkts.isStringLiteral(item)) {
                    resArr.push(item.str);
                }
            });
            return resArr;
        }
        return undefined;
    }
}
