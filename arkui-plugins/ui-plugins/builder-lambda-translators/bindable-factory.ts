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
import { BindableNames } from '../../common/predefines';
import { ImportCollector } from '../../common/import-collector';

import { factory as PropertyFactory } from '../property-translators/factory';

export class BindableFactory {
    /**
     * transform bundable arguments in style node, e.g. `Radio().checked($$(this.checked))` => `Radio().checked({value: xxx, onChange: xxx})`.
     */
    static updateBindableStyleArguments(arg: arkts.CallExpression | arkts.TSAsExpression): arkts.Expression {
        let _call: arkts.CallExpression;
        if (arkts.isTSAsExpression(arg)) {
            _call = arg.expr as arkts.CallExpression;
        } else {
            _call = arg;
        }
        const bindableArg = _call.arguments.at(0);
        if (!bindableArg) {
            return arg;
        }
        return BindableFactory.generateMakeBindableCall(bindableArg);
    }

    /**
     * generate bindable rewrite call.
     */
    static generateMakeBindableCall(bindableArg: arkts.Expression): arkts.CallExpression {
        ImportCollector.getInstance().collectImport(BindableNames.MAKE_BINDABLE);
        return arkts.factory.createCallExpression(
            arkts.factory.createIdentifier(BindableNames.MAKE_BINDABLE),
            undefined,
            [
                bindableArg,
                PropertyFactory.createArrowFunctionWithParamsAndBody(
                    undefined,
                    [
                        arkts.factory.createParameterDeclaration(
                            arkts.factory.createIdentifier(BindableNames.VALUE),
                            undefined
                        ),
                    ],
                    undefined,
                    false,
                    [
                        arkts.factory.createExpressionStatement(
                            arkts.factory.createAssignmentExpression(
                                bindableArg.clone(),
                                arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_SUBSTITUTION,
                                arkts.factory.createIdentifier(BindableNames.VALUE)
                            )
                        ),
                    ]
                ),
            ]
        );
    }

    /**
     * update bindableProperty, e.g. `text: $$(this.text)` => `text: { value: xxx , onChange: xxx }`.
     */
    static updateBindableProperty(
        prop: arkts.Property,
        value: arkts.CallExpression | arkts.TSAsExpression
    ): arkts.Property {
        let _value: arkts.CallExpression;
        if (arkts.isTSAsExpression(value)) {
            _value = value.expr as arkts.CallExpression;
        } else {
            _value = value;
        }
        const bindableArg = _value.arguments.at(0);
        if (!bindableArg) {
            return prop;
        }
        return arkts.factory.updateProperty(prop, prop.key, BindableFactory.generateMakeBindableCall(bindableArg));
    }
}
