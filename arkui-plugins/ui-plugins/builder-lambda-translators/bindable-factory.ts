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
    static updateBindableStyleArguments(
        arg: arkts.CallExpression | arkts.TSAsExpression,
        param: arkts.ETSParameterExpression
    ): arkts.Expression {
        let _type: arkts.TypeNode | undefined;
        let _call: arkts.CallExpression;
        if (arkts.isTSAsExpression(arg)) {
            _type = arg.typeAnnotation;
            _call = arg.expr as arkts.CallExpression;
        } else {
            _type = this.findBindableTypeFromType(param.type as arkts.TypeNode);
            _call = arg;
        }
        const bindableArg = _call.arguments.at(0);
        if (!bindableArg) {
            return arg;
        }
        const obj: arkts.ObjectExpression = this.generateBindableObjectExpr(bindableArg, _type);
        if (!_type) {
            return obj;
        }
        return arkts.factory.createTSAsExpression(obj, _type, false);
    }

    /**
     * find `Bindable<...>` type from possible union type.
     */
    static findBindableTypeFromType(node: arkts.TypeNode | undefined): arkts.TypeNode | undefined {
        if (!node) {
            return undefined;
        }
        if (arkts.isETSUnionType(node)) {
            for (const type of node.types) {
                const bindableType = this.findBindableTypeFromType(type);
                if (!!bindableType) {
                    return bindableType;
                }
            }
            return undefined;
        }
        if (arkts.isETSTypeReference(node)) {
            const part = node.part;
            if (!part || !arkts.isETSTypeReferencePart(part) || !part.typeParams) {
                return undefined;
            }
            const name = part.name;
            if (!name || !arkts.isIdentifier(name) || name.name !== BindableNames.BINDABLE) {
                return undefined;
            }
            return node;
        }
        return undefined;
    }

    /**
     * generate bindable rewrite object expression.
     */
    static generateBindableObjectExpr(
        bindableArg: arkts.Expression,
        valueType: arkts.TypeNode | undefined
    ): arkts.ObjectExpression {
        ImportCollector.getInstance().collectImport(BindableNames.BINDABLE);
        return arkts.factory.createObjectExpression(
            arkts.Es2pandaAstNodeType.AST_NODE_TYPE_OBJECT_EXPRESSION,
            [this.generateValueProperty(bindableArg), this.generateOnChangeArrowFunc(bindableArg, valueType)],
            false
        );
    }

    /**
     * generate `value: <bindableArg>` in object.
     */
    static generateValueProperty(bindableArg: arkts.Expression): arkts.Property {
        return arkts.factory.createProperty(arkts.factory.createIdentifier(BindableNames.VALUE), bindableArg.clone());
    }

    /**
     * generate `onChange: (value: <bindableType>) => <bindableArg> = value` in object.
     */
    static generateOnChangeArrowFunc(
        bindableArg: arkts.Expression,
        bindableType: arkts.TypeNode | undefined
    ): arkts.Property {
        const ident = arkts.factory.createIdentifier(BindableNames.VALUE);
        const valueType = this.findInnerTypeFromBindableType(bindableType as arkts.ETSTypeReference);
        if (!!valueType) {
            ident.setTsTypeAnnotation(valueType.clone());
        }
        return arkts.factory.createProperty(
            arkts.factory.createIdentifier(BindableNames.ON_CHANGE),
            PropertyFactory.createArrowFunctionWithParamsAndBody(
                undefined,
                [arkts.factory.createParameterDeclaration(ident, undefined)],
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
            )
        );
    }

    /**
     * find `xxx` type from `Bindable<xxx>` type
     */
    static findInnerTypeFromBindableType(node: arkts.ETSTypeReference | undefined): arkts.TypeNode | undefined {
        if (!node) {
            return undefined;
        }
        const part = node.part as arkts.ETSTypeReferencePart;
        return part.typeParams?.params.at(0);
    }

    /**
     * find value type from bindable property, e.g. find type of `text` from `text: $$(...)`
     */
    static findBindablePropertyValueType(property: arkts.Property): arkts.TypeNode | undefined {
        const key = property.key;
        const decl = key ? arkts.getDecl(key) : undefined;
        if (!decl) {
            return undefined;
        }
        if (arkts.isClassProperty(decl)) {
            return decl.typeAnnotation;
        }
        if (arkts.isMethodDefinition(decl)) {
            const kind = decl.kind;
            if (kind === arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_GET) {
                return decl.scriptFunction.returnTypeAnnotation;
            }
            if (kind === arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_SET) {
                const param = decl.scriptFunction.params.at(0) as arkts.ETSParameterExpression | undefined;
                return param?.type as arkts.TypeNode | undefined;
            }
        }
        return undefined;
    }

    /**
     * update bindableProperty, e.g. `text: $$(this.text)` => `text: { value: xxx , onChange: xxx }`.
     */
    static updateBindableProperty(
        prop: arkts.Property,
        value: arkts.CallExpression | arkts.TSAsExpression
    ): arkts.Property {
        let _type: arkts.TypeNode | undefined;
        let _value: arkts.CallExpression;
        if (arkts.isTSAsExpression(value)) {
            _type = value.typeAnnotation;
            _value = value.expr as arkts.CallExpression;
        } else {
            _type = this.findBindableTypeFromType(this.findBindablePropertyValueType(prop));
            _value = value;
        }
        const bindableArg = _value.arguments.at(0);
        if (!bindableArg) {
            return prop;
        }
        const obj: arkts.ObjectExpression = this.generateBindableObjectExpr(bindableArg, _type);
        if (!_type) {
            return arkts.factory.updateProperty(prop, prop.key, obj);
        }
        return arkts.factory.updateProperty(prop, prop.key, arkts.factory.createTSAsExpression(obj, _type, false));
    }

    /**
     * generate `Bindable<valueType>`
     * @deprecated
     */
    static createBindableType(valueType: arkts.TypeNode): arkts.ETSTypeReference {
        const transformedKey = BindableNames.BINDABLE;
        ImportCollector.getInstance().collectImport(transformedKey);
        return arkts.factory.createTypeReference(
            arkts.factory.createTypeReferencePart(
                arkts.factory.createIdentifier(transformedKey),
                arkts.factory.createTSTypeParameterInstantiation([valueType.clone()])
            )
        );
    }
}
