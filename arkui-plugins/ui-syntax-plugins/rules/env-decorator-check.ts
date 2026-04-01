/*
 * Copyright (c) 2026 Huawei Device Co., Ltd.
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
import {
    PresetDecorators,
    hasAnnotation,
    getClassPropertyAnnotationNames,
    getClassPropertyName,
    findDecorator,
    ENV_TYPE_ARG_MAP,
    isComponentBuilder,
} from '../utils';
import { AbstractUISyntaxRule } from './ui-syntax-rule';

const V1_STATE_DECORATORS: string[] = [
    PresetDecorators.STATE,
    PresetDecorators.PROP_REF,
    PresetDecorators.LINK,
    PresetDecorators.PROVIDE,
    PresetDecorators.CONSUME,
    PresetDecorators.OBSERVED_V1,
    PresetDecorators.OBJECT_LINK,
    PresetDecorators.WATCH,
    PresetDecorators.TRACK,
    PresetDecorators.REUSABLE_V1,
];

const V2_STATE_DECORATORS: string[] = [
    PresetDecorators.LOCAL,
    PresetDecorators.PARAM,
    PresetDecorators.ONCE,
    PresetDecorators.EVENT,
    PresetDecorators.PROVIDER,
    PresetDecorators.CONSUMER,
    PresetDecorators.OBSERVED_V2,
    PresetDecorators.TRACE,
    PresetDecorators.MONITOR,
    PresetDecorators.COMPUTED,
    PresetDecorators.TYPE,
    PresetDecorators.REUSABLE_V2,
];

const INCOMPATIBLE_DECORATORS: string[] = [
    ...V1_STATE_DECORATORS,
    ...V2_STATE_DECORATORS,
    PresetDecorators.REQUIRE,
];

const ENV_TYPE_KEYS = [...ENV_TYPE_ARG_MAP.values()];

interface EnvTypeName {
  currentTypeName: string;
}
class EnvDecoratorCheckRule extends AbstractUISyntaxRule {
    public setup(): Record<string, string> {
        return {
            envOnlyInComponentOrComponentV2: `The '@Env' annotation can only be used in structs decorated with either '@Component' or '@ComponentV2'.`,
            envCannotHaveDefault: `The '@Env' property cannot be specified a default value.`,
            envInvalidParameter: `Invalid parameter. State variables decorated with '@Env' of '{{typeName}}' can only accept {{enumName}}.`,
            envInvalidType: `The '@Env' annotation can only decorate 'WindowSizeLayoutBreakpointInfo', 'SizeInVP', 'Size', 'UIEnvWindowAvoidAreaInfoVP', 'UIEnvWindowAvoidAreaInfoPX' classes and their child classes.`,
            envMultipleAnnotationsV1: `The property '{{propName}}' cannot have multiple state management annotations.`,
            envMultipleAnnotationsV2: `The member property or method can not be decorated by multiple built-in annotations.`,
            envOnlyInitParamInV2: `Within structs decorated with '@ComponentV2', '@Env' can only initialize variables decorated with '@Param'.`,
            envOnlyInitRegularInV1: `Within structs decorated with '@Component', '@Env' can only initialize regular(non-decorated) variables.`,
        };
    }

    public parsed(node: arkts.AstNode): void {
        if (arkts.isStructDeclaration(node)) {
            const hasComponent = hasAnnotation(node.definition.annotations, PresetDecorators.COMPONENT_V1);
            const hasComponentV2 = hasAnnotation(node.definition.annotations, PresetDecorators.COMPONENT_V2);
            this.checkEnvUsagePositionInStruct(node, hasComponent, hasComponentV2);
            this.checkDecoratorCombination(node, hasComponentV2);
            return;
        }

        if (arkts.isClassProperty(node)) {
            this.checkEnvInitialization(node);
        }
    }
    
    // Reports error when @Env decorator is used in non-component structs.
    private checkEnvUsagePositionInStruct(node: arkts.StructDeclaration, hasComponent: boolean, hasComponentV2: boolean): void {
        if (hasComponent || hasComponentV2) {
            return;
        }
        
        for (const member of node.definition.body) {
            if (!arkts.isClassProperty(member)) {
                continue;
            }

            const envDecorator = findDecorator(member, PresetDecorators.ENV);
            if (envDecorator) {
                this.report({
                    node: envDecorator,
                    message: this.messages.envOnlyInComponentOrComponentV2,
                });
            }
        }
    }

    // Reports error when @Env decorated property has a default value.
    private checkEnvInitialization(node: arkts.ClassProperty): void {
        const envDecorator = findDecorator(node, PresetDecorators.ENV);
        if (!envDecorator) {
            return;
        }

        if (node.value) {
            this.report({
                node: envDecorator,
                message: this.messages.envCannotHaveDefault,
            });
        }
    }

    // Reports error when @Env decorator is combined with other specific decorators.
    private checkDecoratorCombination(node: arkts.StructDeclaration, isComponentV2: boolean): void {
        for (const member of node.definition.body) {
            if (!arkts.isClassProperty(member)) {
                continue;
            }

            const envDecorator = findDecorator(member, PresetDecorators.ENV);
            if (!envDecorator) {
                continue;
            }

            const annotationNames = getClassPropertyAnnotationNames(member);
            const otherDecorator = annotationNames.find(name =>
                name !== PresetDecorators.ENV && INCOMPATIBLE_DECORATORS.includes(name)
            );

            if (!otherDecorator) {
                continue;
            }

            const messageKey = isComponentV2
                ? this.messages.envMultipleAnnotationsV2
                : this.messages.envMultipleAnnotationsV1;

            this.report({
                node: envDecorator,
                message: messageKey,
                data: { propName: getClassPropertyName(member) || '' },
            });
        }
    }

    // Reports error when @Env variable initializes a state-decorated property in @Component structs.
    // Reports error when @Env variable initializes a non-@Param property in @ComponentV2 structs.
    private checkStructPropertyDefinition(node: arkts.CallExpression): void {
        if (!node.expression || !arkts.isMemberExpression(node.expression) || !isComponentBuilder(node.expression)) {
            return;
        }
        if (!arkts.isIdentifier(node.expression.object)) {
            return;
        }
        const structDecl = arkts.getDecl(node.expression.object);
        if (!structDecl || !arkts.isClassDefinition(structDecl)) {
            return;
        }

        const args = node.arguments;
        if (args.length === 0 || !arkts.isObjectExpression(node.arguments[0])) {
            return;
        }

        const properties = node.arguments[0].properties;
        if (properties.length === 0 || !arkts.isProperty(properties[0])) {
            return;
        }

        const paramKey = properties[0].key;
        const paramValue = properties[0].value;
        if (!paramKey || !paramValue || !arkts.isIdentifier(paramKey)) {
            return;
        }
        
        const keyDecl = this.getPropertyFromStruct(structDecl, paramKey.name);
        const valueDecl = arkts.getDecl(paramValue);
        if (!keyDecl || !valueDecl) {
            return;
        }

        if (!arkts.isClassProperty(valueDecl) || !findDecorator(valueDecl, PresetDecorators.ENV)) {
            return;
        }

        this.checkEnvInitializationInComponent(structDecl, keyDecl, properties[0]);
    }

    private checkEnvInitializationInComponent(structDecl: arkts.ClassDefinition, keyDecl: arkts.ClassProperty, propertyNode: arkts.Property): void {
        const annotationNames = getClassPropertyAnnotationNames(keyDecl);
        const hasComponent = hasAnnotation(structDecl.annotations, PresetDecorators.COMPONENT_V1);
        const hasComponentV2 = hasAnnotation(structDecl.annotations, PresetDecorators.COMPONENT_V2);
        if (hasComponent) {
            this.checkEnvInitInComponentV1(annotationNames, propertyNode);
        }
        if (hasComponentV2) {
            this.checkEnvInitInComponentV2(annotationNames, propertyNode);
        }
    }

    private checkEnvInitInComponentV1(annotationNames: string[], propertyNode: arkts.Property): void {
        const hasStateDecorator = annotationNames.some(name =>
            V1_STATE_DECORATORS.includes(name) || V2_STATE_DECORATORS.includes(name)
        );
        if (hasStateDecorator) {
            this.report({
                node: propertyNode,
                message: this.messages.envOnlyInitRegularInV1,
            });
        }
    }

    private checkEnvInitInComponentV2(annotationNames: string[], propertyNode: arkts.Property): void {
        const hasParamDecorator = annotationNames.some(name => name === PresetDecorators.PARAM);
        if (!hasParamDecorator) {
            this.report({
                node: propertyNode,
                message: this.messages.envOnlyInitParamInV2,
            });
        }
    }

    private getPropertyFromStruct(decl: arkts.ClassDefinition, propName: string): arkts.ClassProperty | undefined {
        for (const member of decl.body) {
            if (!arkts.isClassProperty(member) || !member.key || !arkts.isIdentifier(member.key)) {
                continue;
            }

            if (member.key.name === propName) {
                return member;
            }
        }
        return undefined;
    }

    // Reports error when @Env decorated property has invalid type.
    // Reports error when @Env parameter does not match the property type.
    private checkEnvVariableType(node: arkts.ClassProperty): void {
        const envDecorator = findDecorator(node, PresetDecorators.ENV);
        if (!envDecorator) {
            return;
        }

        const propType = node.typeAnnotation;
        if (!propType) {
            this.report({
                node: node,
                message: this.messages.envInvalidType,
            });
            return;
        }

        if (!arkts.isETSTypeReference(propType)) {
            return;
        }
        const envTypeName: EnvTypeName = { currentTypeName: '' };
        if (!this.isEnvVariableTypeValid(propType, envTypeName)) {
            this.report({
                node: node,
                message: this.messages.envInvalidType,
            });
            return;
        }

        const expectedKey = ENV_TYPE_ARG_MAP.get(envTypeName.currentTypeName);
        if (!expectedKey) {
            return;
        }
         
        const envKey = this.extractEnvKey(envDecorator);
        if (!envKey || !ENV_TYPE_KEYS.includes(envKey)) {
            return;
        }

        if (ENV_TYPE_ARG_MAP.get(envTypeName.currentTypeName) !== envKey) {
            this.report({
                node: node,
                message: this.messages.envInvalidParameter,
                data: {
                    typeName: envTypeName.currentTypeName,
                    enumName: expectedKey
                }
            });
        }
    }

    private isEnvVariableTypeValid(propType: arkts.ETSTypeReference, envTypeName: EnvTypeName): boolean {
        if (!propType.part || !propType.part.name) {
            return false;
        }

        let typeDecl: arkts.AstNode | undefined = undefined;
        if (arkts.isIdentifier(propType.part.name)) {
            typeDecl = arkts.getDecl(propType.part.name);
        } else if (arkts.isTSQualifiedName(propType.part.name) && propType.part.name.right) {
            typeDecl = arkts.getDecl(propType.part.name.right);
        }

        if (!typeDecl) {
            return false;
        }

        if (arkts.isTSInterfaceDeclaration(typeDecl)) {
            const typeName = typeDecl.id?.name;
            if (!!typeName && ENV_TYPE_ARG_MAP.has(typeName)) {
                envTypeName.currentTypeName = typeName;
                return true;
            }
            return false;
        }

        if (arkts.isClassDefinition(typeDecl)) {
            const typeName = typeDecl.ident?.name;
            if (!!typeName && ENV_TYPE_ARG_MAP.has(typeName)) {
                envTypeName.currentTypeName = typeName;
                return true;
            }
            let isValidSuper: boolean = false;
            let isValidImplements: boolean = false;
            if (!!typeDecl.implements) {
                const typeImplements = typeDecl.implements;
                isValidImplements = typeImplements.some((typeImplement) => {
                    return typeImplement.expr &&
                           arkts.isETSTypeReference(typeImplement.expr) &&
                           this.isEnvVariableTypeValid(typeImplement.expr, envTypeName)
                });
            }
            if (!isValidImplements && !!typeDecl.super && arkts.isETSTypeReference(typeDecl.super)) {
                isValidSuper =  this.isEnvVariableTypeValid(typeDecl.super, envTypeName);
            }
            return isValidSuper || isValidImplements;
        }

        return false;
    }

    private extractEnvKey(decorator: arkts.AnnotationUsage): string | undefined {
        if (decorator.properties.length !== 1 || !arkts.isClassProperty(decorator.properties[0])) {
            return undefined;
        }

        const value = decorator.properties[0].value;
        return value?.dumpSrc();
    }
}

export default EnvDecoratorCheckRule;
