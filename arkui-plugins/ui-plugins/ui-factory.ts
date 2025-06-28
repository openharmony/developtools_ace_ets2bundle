/*
 * Copyright (C) 2025 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as arkts from '@koalaui/libarkts';
import {
    BuilderLambdaNames,
    CustomComponentAnontations,
    CustomComponentNames,
    hasNullOrUndefinedType,
    hasPropertyInAnnotation,
} from './utils';
import { PartialExcept, PartialNested, PartialNestedExcept } from '../common/safe-types';
import { DecoratorNames } from '../common/predefines';
import { needDefiniteOrOptionalModifier } from './property-translators/utils';
import { addMemoAnnotation } from '../collectors/memo-collectors/utils';

export interface ScriptFunctionConfiguration {
    key: arkts.Identifier | undefined;
    body: arkts.AstNode | undefined;
    typeParams: arkts.TSTypeParameterDeclaration | undefined;
    params: readonly arkts.Expression[];
    returnTypeAnnotation: arkts.TypeNode | undefined;
    hasReceiver: boolean;
    flags: arkts.Es2pandaScriptFunctionFlags;
    modifiers: arkts.Es2pandaModifierFlags;
    annotations: arkts.AnnotationUsage[];
}

export interface MethodDefinitionConfiguration {
    key: arkts.Identifier;
    kind: arkts.Es2pandaMethodDefinitionKind;
    function: ScriptFunctionConfiguration;
    overloads: arkts.MethodDefinition[];
    modifiers: arkts.Es2pandaModifierFlags;
    isComputed: boolean;
}

export interface IntrinsicAnnotationDeclarationConfiguration {
    expr: arkts.Identifier;
    properties: arkts.AstNode[];
}

export class factory {
    /**
     * create `instance: <typeName>` as identifier
     */
    static createInstanceIdentifier(typeName: string): arkts.Identifier {
        return arkts.factory.createIdentifier(
            BuilderLambdaNames.STYLE_ARROW_PARAM_NAME,
            factory.createTypeReferenceFromString(typeName)
        );
    }

    /**
     * create `instance: <typeName>` as parameter
     */
    static createInstanceParameter(typeName: string): arkts.ETSParameterExpression {
        return arkts.factory.createParameterDeclaration(factory.createInstanceIdentifier(typeName), undefined);
    }

    /**
     * create `(instance: <typeName>) => void`
     */
    static createStyleLambdaFunctionType(typeName: string): arkts.ETSFunctionType {
        return arkts.factory.createFunctionType(
            arkts.FunctionSignature.createFunctionSignature(
                undefined,
                [factory.createInstanceParameter(typeName)],
                factory.createTypeReferenceFromString(typeName),
                false
            ),
            arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW
        );
    }

    /**
     * create `style: ((instance: <typeName>) => void) | undefined` as identifier
     */
    static createStyleIdentifier(typeName: string): arkts.Identifier {
        return arkts.factory.createIdentifier(
            BuilderLambdaNames.STYLE_PARAM_NAME,
            arkts.factory.createUnionType([
                factory.createStyleLambdaFunctionType(typeName),
                arkts.factory.createETSUndefinedType(),
            ])
        );
    }

    /**
     * create `initializers: <optionsName> | undefined` as identifier
     */
    static createInitializerOptionsIdentifier(optionsName: string): arkts.Identifier {
        return arkts.factory.createIdentifier(
            CustomComponentNames.COMPONENT_INITIALIZERS_NAME,
            arkts.factory.createUnionType([
                factory.createTypeReferenceFromString(optionsName),
                arkts.factory.createETSUndefinedType(),
            ])
        );
    }

    /**
     * create `initializers: <optionsName> | undefined` as parameter
     */
    static createInitializersOptionsParameter(optionsName: string): arkts.ETSParameterExpression {
        return arkts.factory.createParameterDeclaration(
            factory.createInitializerOptionsIdentifier(optionsName),
            undefined
        );
    }

    /**
     * create `content: (() => void) | undefined` as identifier
     */
    static createContentIdentifier(): arkts.Identifier {
        return arkts.factory.createIdentifier(
            BuilderLambdaNames.CONTENT_PARAM_NAME,
            arkts.factory.createUnionType([factory.createLambdaFunctionType(), arkts.factory.createETSUndefinedType()])
        );
    }

    /**
     * create `@memo() content: (() => void) | undefined` as parameter
     */
    static createContentParameter(): arkts.ETSParameterExpression {
        const contentParam: arkts.Identifier = factory.createContentIdentifier();
        const param: arkts.ETSParameterExpression = arkts.factory.createParameterDeclaration(contentParam, undefined);
        addMemoAnnotation(param);
        return param;
    }

    /**
     * create type from string
     */
    static createTypeReferenceFromString(name: string): arkts.TypeNode {
        return arkts.factory.createTypeReference(
            arkts.factory.createTypeReferencePart(arkts.factory.createIdentifier(name))
        );
    }

    /**
     * create complex type from string and type parameter, e.g. `Set<T>`
     */
    static createComplexTypeFromStringAndTypeParameter(name: string, params: arkts.TypeNode[]): arkts.TypeNode {
        return arkts.factory.createTypeReference(
            arkts.factory.createTypeReferencePart(
                arkts.factory.createIdentifier(name),
                arkts.factory.createTSTypeParameterInstantiation(params)
            )
        );
    }

    /**
     * create `(<params>) => <returnType>`. If returnType is not given, then using `void`.
     */
    static createLambdaFunctionType(
        params?: arkts.Expression[],
        returnType?: arkts.TypeNode | undefined
    ): arkts.ETSFunctionType {
        return arkts.factory.createFunctionType(
            arkts.FunctionSignature.createFunctionSignature(
                undefined,
                params ?? [],
                returnType ?? arkts.factory.createPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID),
                false
            ),
            arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW
        );
    }

    /**
     * create `import { <imported> as <local> } ...`.
     */
    static createAdditionalImportSpecifier(imported: string, local: string): arkts.ImportSpecifier {
        return arkts.factory.createImportSpecifier(
            arkts.factory.createIdentifier(imported),
            arkts.factory.createIdentifier(local)
        );
    }

    /**
     * update ScriptFunction with configurations.
     */
    static updateScriptFunction(
        original: arkts.ScriptFunction,
        config: Partial<ScriptFunctionConfiguration>
    ): arkts.ScriptFunction {
        const newFunc: arkts.ScriptFunction = arkts.factory.updateScriptFunction(
            original,
            config.body ?? original.body,
            arkts.factory.createFunctionSignature(
                config.typeParams ?? original.typeParams,
                config.params ?? original.params,
                config.returnTypeAnnotation ?? original.returnTypeAnnotation,
                config.hasReceiver ?? original.hasReceiver
            ),
            config.flags ?? original.flags,
            config.modifiers ?? original.modifiers
        );
        if (!!config.key) {
            newFunc.setIdent(config.key);
        }
        if (!!config.annotations) {
            newFunc.setAnnotations(config.annotations);
        }
        return newFunc;
    }

    /**
     * create ScriptFunction with configurations.
     */
    static createScriptFunction(config: Partial<ScriptFunctionConfiguration>): arkts.ScriptFunction {
        const newFunc: arkts.ScriptFunction = arkts.factory.createScriptFunction(
            config.body ?? undefined,
            arkts.factory.createFunctionSignature(
                config.typeParams ?? undefined,
                config.params ?? [],
                config.returnTypeAnnotation ?? undefined,
                config.hasReceiver ?? false
            ),
            config.flags ?? arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_NONE,
            config.modifiers ?? arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE
        );
        if (!!config.key) {
            newFunc.setIdent(config.key);
        }
        if (!!config.annotations) {
            newFunc.setAnnotations(config.annotations);
        }
        return newFunc;
    }

    /**
     * update MethodDefinition with configurations.
     */
    static updateMethodDefinition(
        original: arkts.MethodDefinition,
        config: PartialNested<MethodDefinitionConfiguration>
    ): arkts.MethodDefinition {
        const key: arkts.Identifier = config.key ?? original.name;
        const newFunc: arkts.ScriptFunction = factory.updateScriptFunction(original.scriptFunction, {
            ...config.function,
            key,
        });
        const newMethod: arkts.MethodDefinition = arkts.factory.updateMethodDefinition(
            original,
            config.kind ?? original.kind,
            key,
            newFunc,
            config.modifiers ?? original.modifiers,
            config.isComputed ?? false
        );
        if (!!config.overloads) {
            newMethod.setOverloads(config.overloads);
        }
        return newMethod;
    }

    /**
     * create MethodDefinition with configurations.
     */
    static createMethodDefinition(config: PartialNested<MethodDefinitionConfiguration>): arkts.MethodDefinition {
        const newFunc: arkts.ScriptFunction = factory.createScriptFunction({
            ...config.function,
            key: config.key,
        });
        const newMethod: arkts.MethodDefinition = arkts.factory.createMethodDefinition(
            config.kind ?? arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_NONE,
            config.key!,
            newFunc,
            config.modifiers ?? arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
            config.isComputed ?? false
        );
        if (!!config.overloads) {
            newMethod.setOverloads(config.overloads);
        }
        return newMethod;
    }

    /**
     * create intrinsic `@Retention({policy:"SOURCE"})` AnnotationDeclaration with configurations.
     */
    static createIntrinsicAnnotationDeclaration(
        config: PartialExcept<IntrinsicAnnotationDeclarationConfiguration, 'expr'>
    ): arkts.AnnotationDeclaration {
        const intrinsicAnnotations: arkts.AnnotationUsage[] = [
            arkts.factory.create1AnnotationUsage(arkts.factory.createIdentifier('Retention'), [
                arkts.factory.createClassProperty(
                    arkts.factory.createIdentifier('policy'),
                    arkts.factory.createStringLiteral('SOURCE'),
                    undefined,
                    arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC,
                    false
                ),
            ]),
        ];
        const newAnnotationDecl: arkts.AnnotationDeclaration = arkts.factory
            .createAnnotationDeclaration(config.expr, config.properties ?? [])
            .setAnnotations(intrinsicAnnotations);
        return newAnnotationDecl;
    }

    /**
     * add alias: <property.key.name> to @Provide annotation when no alias in @Provide({...}).
     */
    static processNoAliasProvideVariable(property: arkts.ClassProperty): void {
        let annotations: readonly arkts.AnnotationUsage[] = property.annotations;
        if (annotations.length === 0) {
            return;
        }
        const newAnnos: arkts.AnnotationUsage[] = annotations.map((anno: arkts.AnnotationUsage) => {
            if (
                !!anno.expr &&
                arkts.isIdentifier(anno.expr) &&
                anno.expr.name === DecoratorNames.PROVIDE &&
                !hasPropertyInAnnotation(anno, 'alias') &&
                property.key &&
                arkts.isIdentifier(property.key)
            ) {
                return arkts.factory.update1AnnotationUsage(anno, anno.expr, [
                    ...anno.properties,
                    factory.createAliasClassProperty(property.key),
                ]);
            } else {
                return anno;
            }
        });
        property.setAnnotations(newAnnos);
    }

    /**
     * create class property : `alias: <value>`.
     */
    static createAliasClassProperty(value: arkts.Identifier): arkts.ClassProperty {
        return arkts.factory.createClassProperty(
            arkts.factory.createIdentifier('alias'),
            arkts.factory.create1StringLiteral(value.name),
            undefined,
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
            false
        );
    }

    /**
     * add optional or definite modifier for class property needs initializing without assignment.
     */
    static PreprocessClassPropertyModifier(st: arkts.AstNode): arkts.AstNode {
        if (arkts.isClassProperty(st) && needDefiniteOrOptionalModifier(st)) {
            if (st.typeAnnotation && hasNullOrUndefinedType(st.typeAnnotation)) {
                st.modifiers |= arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_OPTIONAL;
            } else {
                st.modifiers |= arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_DEFINITE;
            }
        }
        return st;
    }

    /**
     * create class implements : `implements <interfaceName>`.
     */
    static createClassImplements(
        interfaceName: string,
        typeParameters?: arkts.TSTypeParameterInstantiation
    ): arkts.TSClassImplements {
        return arkts.factory.createTSClassImplements(
            arkts.factory.createTypeReference(
                arkts.factory.createTypeReferencePart(arkts.factory.createIdentifier(interfaceName))
            ),
            typeParameters
        );
    }

    /**
     * Generate class implements for struct with struct annotations.
     *
     * @param method method definition node
     */
    static generateImplementsForStruct(annotations: CustomComponentAnontations): arkts.TSClassImplements[] {
        const implementsInfo: arkts.TSClassImplements[] = [];
        if (annotations.entry) {
            implementsInfo.push(factory.createClassImplements(CustomComponentNames.PAGE_LIFE_CYCLE));
        }
        if (annotations.customLayout) {
            implementsInfo.push(factory.createClassImplements(CustomComponentNames.LAYOUT_CALLBACK));
        }
        return implementsInfo;
    }
}
