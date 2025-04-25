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
import { BuilderLambdaNames, CustomComponentNames, hasPropertyInAnnotation } from './utils';
import { annotation } from '../common/arkts-utils';
import { DecoratorNames } from './property-translators/utils';

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
     * create `@memo() style: ((instance: <typeName>) => void) | undefined` as parameter
     */
    static createStyleParameter(typeName: string): arkts.ETSParameterExpression {
        const styleParam: arkts.Identifier = factory.createStyleIdentifier(typeName);
        const param = arkts.factory.createParameterDeclaration(styleParam, undefined);
        param.annotations = [annotation('memo')];
        return param;
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
        const param = arkts.factory.createParameterDeclaration(contentParam, undefined);
        param.annotations = [annotation('memo')];
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
     * create and insert `import { <imported> as <local> } from <source>` to the top of script's statements.
     */
    static createAndInsertImportDeclaration(
        source: arkts.StringLiteral,
        imported: arkts.Identifier,
        local: arkts.Identifier,
        importKind: arkts.Es2pandaImportKinds,
        program: arkts.Program
    ): void {
        const importDecl: arkts.ETSImportDeclaration = arkts.factory.createImportDeclaration(
            source,
            [arkts.factory.createImportSpecifier(imported, local)],
            importKind,
            program,
            arkts.Es2pandaImportFlags.IMPORT_FLAGS_NONE
        );
        arkts.importDeclarationInsert(importDecl, program);
        return;
    }

    /*
     * create `import { <imported> as <local> } ...`.
     */
    static createAdditionalImportSpecifier(imported: string, local: string): arkts.ImportSpecifier {
        return arkts.factory.createImportSpecifier(
            arkts.factory.createIdentifier(imported),
            arkts.factory.createIdentifier(local)
        );
    }

    /*
     * create `constructor() {}`.
     */
    static createConstructorMethod(member: arkts.MethodDefinition): arkts.MethodDefinition {
        return arkts.factory.createMethodDefinition(
            arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_CONSTRUCTOR,
            member.name,
            arkts.factory.createFunctionExpression(member.scriptFunction),
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_CONSTRUCTOR,
            false
        );
    }

    /*
     * create `@memo() _build(<>)`.
     */
    static transformBuildMethodWithOriginBuild(
        method: arkts.MethodDefinition,
        typeName: string,
        optionsName: string,
        isDecl?: boolean
    ): arkts.MethodDefinition {
        const updateKey: arkts.Identifier = arkts.factory.createIdentifier(CustomComponentNames.COMPONENT_BUILD);

        const scriptFunction: arkts.ScriptFunction = method.scriptFunction;
        const updateScriptFunction = arkts.factory
            .createScriptFunction(
                scriptFunction.body,
                arkts.FunctionSignature.createFunctionSignature(
                    scriptFunction.typeParams,
                    [
                        factory.createStyleParameter(typeName),
                        factory.createContentParameter(),
                        factory.createInitializersOptionsParameter(optionsName),
                    ],
                    arkts.factory.createPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID),
                    false
                ),
                scriptFunction.flags,
                scriptFunction.modifiers
            )
            .setAnnotations([annotation('memo')]);

        const modifiers: arkts.Es2pandaModifierFlags = isDecl
            ? arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_ABSTRACT
            : arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC;
        return arkts.factory.createMethodDefinition(
            arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_METHOD,
            updateKey,
            arkts.factory.createFunctionExpression(updateScriptFunction),
            modifiers,
            false
        );
    }

    /*
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

    /*
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
}
