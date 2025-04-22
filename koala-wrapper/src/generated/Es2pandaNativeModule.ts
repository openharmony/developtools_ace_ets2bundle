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

import {
    KNativePointer,
    KStringPtr,
    KUInt,
    KInt,
    KBoolean,
    KDouble,
    KFloat,
    KLong
} from "@koalaui/interop"

// TODO: this type should be in interop
export type KNativePointerArray = BigUint64Array

export class Es2pandaNativeModule {
    _CreateLabelledStatement(context: KNativePointer, ident: KNativePointer, body: KNativePointer): KNativePointer {
        throw new Error("'CreateLabelledStatement was not overloaded by native module initialization")
    }
    _UpdateLabelledStatement(context: KNativePointer, original: KNativePointer, ident: KNativePointer, body: KNativePointer): KNativePointer {
        throw new Error("'UpdateLabelledStatement was not overloaded by native module initialization")
    }
    _LabelledStatementBodyConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'LabelledStatementBodyConst was not overloaded by native module initialization")
    }
    _LabelledStatementIdentConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'LabelledStatementIdentConst was not overloaded by native module initialization")
    }
    _LabelledStatementIdent(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'LabelledStatementIdent was not overloaded by native module initialization")
    }
    _LabelledStatementGetReferencedStatementConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'LabelledStatementGetReferencedStatementConst was not overloaded by native module initialization")
    }
    _CreateThrowStatement(context: KNativePointer, argument: KNativePointer): KNativePointer {
        throw new Error("'CreateThrowStatement was not overloaded by native module initialization")
    }
    _UpdateThrowStatement(context: KNativePointer, original: KNativePointer, argument: KNativePointer): KNativePointer {
        throw new Error("'UpdateThrowStatement was not overloaded by native module initialization")
    }
    _ThrowStatementArgumentConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ThrowStatementArgumentConst was not overloaded by native module initialization")
    }
    _CreateClassProperty(context: KNativePointer, key: KNativePointer, value: KNativePointer, typeAnnotation: KNativePointer, modifiers: KInt, isComputed: KBoolean): KNativePointer {
        throw new Error("'CreateClassProperty was not overloaded by native module initialization")
    }
    _UpdateClassProperty(context: KNativePointer, original: KNativePointer, key: KNativePointer, value: KNativePointer, typeAnnotation: KNativePointer, modifiers: KInt, isComputed: KBoolean): KNativePointer {
        throw new Error("'UpdateClassProperty was not overloaded by native module initialization")
    }
    _ClassPropertyTypeAnnotationConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ClassPropertyTypeAnnotationConst was not overloaded by native module initialization")
    }
    _ClassPropertySetTypeAnnotation(context: KNativePointer, receiver: KNativePointer, typeAnnotation: KNativePointer): void {
        throw new Error("'ClassPropertySetTypeAnnotation was not overloaded by native module initialization")
    }
    _ClassPropertyAnnotations(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ClassPropertyAnnotations was not overloaded by native module initialization")
    }
    _ClassPropertyAnnotationsConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ClassPropertyAnnotationsConst was not overloaded by native module initialization")
    }
    _ClassPropertySetAnnotations(context: KNativePointer, receiver: KNativePointer, annotations: BigUint64Array, annotationsSequenceLength: KUInt): void {
        throw new Error("'ClassPropertySetAnnotations was not overloaded by native module initialization")
    }
    _CreateTSVoidKeyword(context: KNativePointer): KNativePointer {
        throw new Error("'CreateTSVoidKeyword was not overloaded by native module initialization")
    }
    _UpdateTSVoidKeyword(context: KNativePointer, original: KNativePointer): KNativePointer {
        throw new Error("'UpdateTSVoidKeyword was not overloaded by native module initialization")
    }
    _CreateETSFunctionTypeIr(context: KNativePointer, signature: KNativePointer, funcFlags: KInt): KNativePointer {
        throw new Error("'CreateETSFunctionTypeIr was not overloaded by native module initialization")
    }
    _UpdateETSFunctionTypeIr(context: KNativePointer, original: KNativePointer, signature: KNativePointer, funcFlags: KInt): KNativePointer {
        throw new Error("'UpdateETSFunctionTypeIr was not overloaded by native module initialization")
    }
    _ETSFunctionTypeIrTypeParamsConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ETSFunctionTypeIrTypeParamsConst was not overloaded by native module initialization")
    }
    _ETSFunctionTypeIrTypeParams(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ETSFunctionTypeIrTypeParams was not overloaded by native module initialization")
    }
    _ETSFunctionTypeIrParamsConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ETSFunctionTypeIrParamsConst was not overloaded by native module initialization")
    }
    _ETSFunctionTypeIrReturnTypeConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ETSFunctionTypeIrReturnTypeConst was not overloaded by native module initialization")
    }
    _ETSFunctionTypeIrReturnType(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ETSFunctionTypeIrReturnType was not overloaded by native module initialization")
    }
    _ETSFunctionTypeIrFunctionalInterface(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ETSFunctionTypeIrFunctionalInterface was not overloaded by native module initialization")
    }
    _ETSFunctionTypeIrFunctionalInterfaceConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ETSFunctionTypeIrFunctionalInterfaceConst was not overloaded by native module initialization")
    }
    _ETSFunctionTypeIrSetFunctionalInterface(context: KNativePointer, receiver: KNativePointer, functionalInterface: KNativePointer): void {
        throw new Error("'ETSFunctionTypeIrSetFunctionalInterface was not overloaded by native module initialization")
    }
    _ETSFunctionTypeIrFlags(context: KNativePointer, receiver: KNativePointer): KInt {
        throw new Error("'ETSFunctionTypeIrFlags was not overloaded by native module initialization")
    }
    _ETSFunctionTypeIrIsThrowingConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'ETSFunctionTypeIrIsThrowingConst was not overloaded by native module initialization")
    }
    _ETSFunctionTypeIrIsRethrowingConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'ETSFunctionTypeIrIsRethrowingConst was not overloaded by native module initialization")
    }
    _ETSFunctionTypeIrIsExtensionFunctionConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'ETSFunctionTypeIrIsExtensionFunctionConst was not overloaded by native module initialization")
    }
    _CreateTSTypeOperator(context: KNativePointer, type: KNativePointer, operatorType: KInt): KNativePointer {
        throw new Error("'CreateTSTypeOperator was not overloaded by native module initialization")
    }
    _UpdateTSTypeOperator(context: KNativePointer, original: KNativePointer, type: KNativePointer, operatorType: KInt): KNativePointer {
        throw new Error("'UpdateTSTypeOperator was not overloaded by native module initialization")
    }
    _TSTypeOperatorTypeConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSTypeOperatorTypeConst was not overloaded by native module initialization")
    }
    _TSTypeOperatorIsReadonlyConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'TSTypeOperatorIsReadonlyConst was not overloaded by native module initialization")
    }
    _TSTypeOperatorIsKeyofConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'TSTypeOperatorIsKeyofConst was not overloaded by native module initialization")
    }
    _TSTypeOperatorIsUniqueConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'TSTypeOperatorIsUniqueConst was not overloaded by native module initialization")
    }
    _CreateIfStatement(context: KNativePointer, test: KNativePointer, consequent: KNativePointer, alternate: KNativePointer): KNativePointer {
        throw new Error("'CreateIfStatement was not overloaded by native module initialization")
    }
    _UpdateIfStatement(context: KNativePointer, original: KNativePointer, test: KNativePointer, consequent: KNativePointer, alternate: KNativePointer): KNativePointer {
        throw new Error("'UpdateIfStatement was not overloaded by native module initialization")
    }
    _IfStatementTestConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'IfStatementTestConst was not overloaded by native module initialization")
    }
    _IfStatementTest(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'IfStatementTest was not overloaded by native module initialization")
    }
    _IfStatementConsequentConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'IfStatementConsequentConst was not overloaded by native module initialization")
    }
    _IfStatementConsequent(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'IfStatementConsequent was not overloaded by native module initialization")
    }
    _IfStatementAlternate(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'IfStatementAlternate was not overloaded by native module initialization")
    }
    _IfStatementAlternateConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'IfStatementAlternateConst was not overloaded by native module initialization")
    }
    _CreateTSConstructorType(context: KNativePointer, signature: KNativePointer, abstract: KBoolean): KNativePointer {
        throw new Error("'CreateTSConstructorType was not overloaded by native module initialization")
    }
    _UpdateTSConstructorType(context: KNativePointer, original: KNativePointer, signature: KNativePointer, abstract: KBoolean): KNativePointer {
        throw new Error("'UpdateTSConstructorType was not overloaded by native module initialization")
    }
    _TSConstructorTypeTypeParamsConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSConstructorTypeTypeParamsConst was not overloaded by native module initialization")
    }
    _TSConstructorTypeTypeParams(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSConstructorTypeTypeParams was not overloaded by native module initialization")
    }
    _TSConstructorTypeParamsConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSConstructorTypeParamsConst was not overloaded by native module initialization")
    }
    _TSConstructorTypeReturnTypeConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSConstructorTypeReturnTypeConst was not overloaded by native module initialization")
    }
    _TSConstructorTypeReturnType(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSConstructorTypeReturnType was not overloaded by native module initialization")
    }
    _TSConstructorTypeAbstractConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'TSConstructorTypeAbstractConst was not overloaded by native module initialization")
    }
    _CreateDecorator(context: KNativePointer, expr: KNativePointer): KNativePointer {
        throw new Error("'CreateDecorator was not overloaded by native module initialization")
    }
    _UpdateDecorator(context: KNativePointer, original: KNativePointer, expr: KNativePointer): KNativePointer {
        throw new Error("'UpdateDecorator was not overloaded by native module initialization")
    }
    _DecoratorExprConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'DecoratorExprConst was not overloaded by native module initialization")
    }
    _CreateTSEnumDeclaration(context: KNativePointer, key: KNativePointer, members: BigUint64Array, membersSequenceLength: KUInt, isConst: KBoolean, isStatic: KBoolean, isDeclare: KBoolean): KNativePointer {
        throw new Error("'CreateTSEnumDeclaration was not overloaded by native module initialization")
    }
    _UpdateTSEnumDeclaration(context: KNativePointer, original: KNativePointer, key: KNativePointer, members: BigUint64Array, membersSequenceLength: KUInt, isConst: KBoolean, isStatic: KBoolean, isDeclare: KBoolean): KNativePointer {
        throw new Error("'UpdateTSEnumDeclaration was not overloaded by native module initialization")
    }
    _TSEnumDeclarationKeyConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSEnumDeclarationKeyConst was not overloaded by native module initialization")
    }
    _TSEnumDeclarationKey(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSEnumDeclarationKey was not overloaded by native module initialization")
    }
    _TSEnumDeclarationMembersConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSEnumDeclarationMembersConst was not overloaded by native module initialization")
    }
    _TSEnumDeclarationInternalNameConst(context: KNativePointer, receiver: KNativePointer): KStringPtr {
        throw new Error("'TSEnumDeclarationInternalNameConst was not overloaded by native module initialization")
    }
    _TSEnumDeclarationSetInternalName(context: KNativePointer, receiver: KNativePointer, internalName: KStringPtr): void {
        throw new Error("'TSEnumDeclarationSetInternalName was not overloaded by native module initialization")
    }
    _TSEnumDeclarationBoxedClassConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSEnumDeclarationBoxedClassConst was not overloaded by native module initialization")
    }
    _TSEnumDeclarationSetBoxedClass(context: KNativePointer, receiver: KNativePointer, wrapperClass: KNativePointer): void {
        throw new Error("'TSEnumDeclarationSetBoxedClass was not overloaded by native module initialization")
    }
    _TSEnumDeclarationIsConstConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'TSEnumDeclarationIsConstConst was not overloaded by native module initialization")
    }
    _TSEnumDeclarationDecoratorsConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSEnumDeclarationDecoratorsConst was not overloaded by native module initialization")
    }
    _CreateTSNeverKeyword(context: KNativePointer): KNativePointer {
        throw new Error("'CreateTSNeverKeyword was not overloaded by native module initialization")
    }
    _UpdateTSNeverKeyword(context: KNativePointer, original: KNativePointer): KNativePointer {
        throw new Error("'UpdateTSNeverKeyword was not overloaded by native module initialization")
    }
    _CreateImportDefaultSpecifier(context: KNativePointer, local: KNativePointer): KNativePointer {
        throw new Error("'CreateImportDefaultSpecifier was not overloaded by native module initialization")
    }
    _UpdateImportDefaultSpecifier(context: KNativePointer, original: KNativePointer, local: KNativePointer): KNativePointer {
        throw new Error("'UpdateImportDefaultSpecifier was not overloaded by native module initialization")
    }
    _ImportDefaultSpecifierLocalConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ImportDefaultSpecifierLocalConst was not overloaded by native module initialization")
    }
    _ImportDefaultSpecifierLocal(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ImportDefaultSpecifierLocal was not overloaded by native module initialization")
    }
    _CreateObjectExpression(context: KNativePointer, nodeType: KInt, properties: BigUint64Array, propertiesSequenceLength: KUInt, trailingComma: KBoolean): KNativePointer {
        throw new Error("'CreateObjectExpression was not overloaded by native module initialization")
    }
    _UpdateObjectExpression(context: KNativePointer, original: KNativePointer, nodeType: KInt, properties: BigUint64Array, propertiesSequenceLength: KUInt, trailingComma: KBoolean): KNativePointer {
        throw new Error("'UpdateObjectExpression was not overloaded by native module initialization")
    }
    _ObjectExpressionPropertiesConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ObjectExpressionPropertiesConst was not overloaded by native module initialization")
    }
    _ObjectExpressionIsDeclarationConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'ObjectExpressionIsDeclarationConst was not overloaded by native module initialization")
    }
    _ObjectExpressionIsOptionalConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'ObjectExpressionIsOptionalConst was not overloaded by native module initialization")
    }
    _ObjectExpressionDecoratorsConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ObjectExpressionDecoratorsConst was not overloaded by native module initialization")
    }
    _ObjectExpressionValidateExpression(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ObjectExpressionValidateExpression was not overloaded by native module initialization")
    }
    _ObjectExpressionConvertibleToObjectPattern(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'ObjectExpressionConvertibleToObjectPattern was not overloaded by native module initialization")
    }
    _ObjectExpressionSetDeclaration(context: KNativePointer, receiver: KNativePointer): void {
        throw new Error("'ObjectExpressionSetDeclaration was not overloaded by native module initialization")
    }
    _ObjectExpressionSetOptional(context: KNativePointer, receiver: KNativePointer, optional_arg: KBoolean): void {
        throw new Error("'ObjectExpressionSetOptional was not overloaded by native module initialization")
    }
    _ObjectExpressionTypeAnnotationConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ObjectExpressionTypeAnnotationConst was not overloaded by native module initialization")
    }
    _ObjectExpressionSetTsTypeAnnotation(context: KNativePointer, receiver: KNativePointer, typeAnnotation: KNativePointer): void {
        throw new Error("'ObjectExpressionSetTsTypeAnnotation was not overloaded by native module initialization")
    }
    _CreateImportSpecifier(context: KNativePointer, imported: KNativePointer, local: KNativePointer): KNativePointer {
        throw new Error("'CreateImportSpecifier was not overloaded by native module initialization")
    }
    _UpdateImportSpecifier(context: KNativePointer, original: KNativePointer, imported: KNativePointer, local: KNativePointer): KNativePointer {
        throw new Error("'UpdateImportSpecifier was not overloaded by native module initialization")
    }
    _ImportSpecifierImported(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ImportSpecifierImported was not overloaded by native module initialization")
    }
    _ImportSpecifierImportedConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ImportSpecifierImportedConst was not overloaded by native module initialization")
    }
    _ImportSpecifierLocal(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ImportSpecifierLocal was not overloaded by native module initialization")
    }
    _ImportSpecifierLocalConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ImportSpecifierLocalConst was not overloaded by native module initialization")
    }
    _CreateConditionalExpression(context: KNativePointer, test: KNativePointer, consequent: KNativePointer, alternate: KNativePointer): KNativePointer {
        throw new Error("'CreateConditionalExpression was not overloaded by native module initialization")
    }
    _UpdateConditionalExpression(context: KNativePointer, original: KNativePointer, test: KNativePointer, consequent: KNativePointer, alternate: KNativePointer): KNativePointer {
        throw new Error("'UpdateConditionalExpression was not overloaded by native module initialization")
    }
    _ConditionalExpressionTestConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ConditionalExpressionTestConst was not overloaded by native module initialization")
    }
    _ConditionalExpressionTest(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ConditionalExpressionTest was not overloaded by native module initialization")
    }
    _ConditionalExpressionSetTest(context: KNativePointer, receiver: KNativePointer, expr: KNativePointer): void {
        throw new Error("'ConditionalExpressionSetTest was not overloaded by native module initialization")
    }
    _ConditionalExpressionConsequentConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ConditionalExpressionConsequentConst was not overloaded by native module initialization")
    }
    _ConditionalExpressionConsequent(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ConditionalExpressionConsequent was not overloaded by native module initialization")
    }
    _ConditionalExpressionSetConsequent(context: KNativePointer, receiver: KNativePointer, expr: KNativePointer): void {
        throw new Error("'ConditionalExpressionSetConsequent was not overloaded by native module initialization")
    }
    _ConditionalExpressionAlternateConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ConditionalExpressionAlternateConst was not overloaded by native module initialization")
    }
    _ConditionalExpressionAlternate(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ConditionalExpressionAlternate was not overloaded by native module initialization")
    }
    _ConditionalExpressionSetAlternate(context: KNativePointer, receiver: KNativePointer, expr: KNativePointer): void {
        throw new Error("'ConditionalExpressionSetAlternate was not overloaded by native module initialization")
    }
    _CreateCallExpression(context: KNativePointer, callee: KNativePointer, _arguments: BigUint64Array, _argumentsSequenceLength: KUInt, typeParams: KNativePointer, optional_arg: KBoolean, trailingComma: KBoolean): KNativePointer {
        throw new Error("'CreateCallExpression was not overloaded by native module initialization")
    }
    _CreateCallExpression1(context: KNativePointer, other: KNativePointer): KNativePointer {
        throw new Error("'CreateCallExpression1 was not overloaded by native module initialization")
    }
    _UpdateCallExpression1(context: KNativePointer, original: KNativePointer, other: KNativePointer): KNativePointer {
        throw new Error("'UpdateCallExpression1 was not overloaded by native module initialization")
    }
    _CallExpressionCalleeConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'CallExpressionCalleeConst was not overloaded by native module initialization")
    }
    _CallExpressionCallee(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'CallExpressionCallee was not overloaded by native module initialization")
    }
    _CallExpressionSetCallee(context: KNativePointer, receiver: KNativePointer, callee: KNativePointer): void {
        throw new Error("'CallExpressionSetCallee was not overloaded by native module initialization")
    }
    _CallExpressionTypeParamsConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'CallExpressionTypeParamsConst was not overloaded by native module initialization")
    }
    _CallExpressionTypeParams(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'CallExpressionTypeParams was not overloaded by native module initialization")
    }
    _CallExpressionArgumentsConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'CallExpressionArgumentsConst was not overloaded by native module initialization")
    }
    _CallExpressionArguments(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'CallExpressionArguments was not overloaded by native module initialization")
    }
    _CallExpressionHasTrailingCommaConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'CallExpressionHasTrailingCommaConst was not overloaded by native module initialization")
    }
    _CallExpressionSetTypeParams(context: KNativePointer, receiver: KNativePointer, typeParams: KNativePointer): void {
        throw new Error("'CallExpressionSetTypeParams was not overloaded by native module initialization")
    }
    _CallExpressionSetTrailingBlock(context: KNativePointer, receiver: KNativePointer, block: KNativePointer): void {
        throw new Error("'CallExpressionSetTrailingBlock was not overloaded by native module initialization")
    }
    _CallExpressionIsExtensionAccessorCall(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'CallExpressionIsExtensionAccessorCall was not overloaded by native module initialization")
    }
    _CallExpressionTrailingBlockConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'CallExpressionTrailingBlockConst was not overloaded by native module initialization")
    }
    _CallExpressionSetIsTrailingBlockInNewLine(context: KNativePointer, receiver: KNativePointer, isNewLine: KBoolean): void {
        throw new Error("'CallExpressionSetIsTrailingBlockInNewLine was not overloaded by native module initialization")
    }
    _CallExpressionIsTrailingBlockInNewLineConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'CallExpressionIsTrailingBlockInNewLineConst was not overloaded by native module initialization")
    }
    _CallExpressionIsETSConstructorCallConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'CallExpressionIsETSConstructorCallConst was not overloaded by native module initialization")
    }
    _CreateBigIntLiteral(context: KNativePointer, src: KStringPtr): KNativePointer {
        throw new Error("'CreateBigIntLiteral was not overloaded by native module initialization")
    }
    _UpdateBigIntLiteral(context: KNativePointer, original: KNativePointer, src: KStringPtr): KNativePointer {
        throw new Error("'UpdateBigIntLiteral was not overloaded by native module initialization")
    }
    _BigIntLiteralStrConst(context: KNativePointer, receiver: KNativePointer): KStringPtr {
        throw new Error("'BigIntLiteralStrConst was not overloaded by native module initialization")
    }
    _ClassElementId(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ClassElementId was not overloaded by native module initialization")
    }
    _ClassElementIdConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ClassElementIdConst was not overloaded by native module initialization")
    }
    _ClassElementKey(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ClassElementKey was not overloaded by native module initialization")
    }
    _ClassElementKeyConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ClassElementKeyConst was not overloaded by native module initialization")
    }
    _ClassElementValue(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ClassElementValue was not overloaded by native module initialization")
    }
    _ClassElementSetValue(context: KNativePointer, receiver: KNativePointer, value: KNativePointer): void {
        throw new Error("'ClassElementSetValue was not overloaded by native module initialization")
    }
    _ClassElementValueConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ClassElementValueConst was not overloaded by native module initialization")
    }
    _ClassElementIsPrivateElementConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'ClassElementIsPrivateElementConst was not overloaded by native module initialization")
    }
    _ClassElementDecoratorsConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ClassElementDecoratorsConst was not overloaded by native module initialization")
    }
    _ClassElementIsComputedConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'ClassElementIsComputedConst was not overloaded by native module initialization")
    }
    _ClassElementAddDecorator(context: KNativePointer, receiver: KNativePointer, decorator: KNativePointer): void {
        throw new Error("'ClassElementAddDecorator was not overloaded by native module initialization")
    }
    _ClassElementToPrivateFieldKindConst(context: KNativePointer, receiver: KNativePointer, isStatic: KBoolean): KInt {
        throw new Error("'ClassElementToPrivateFieldKindConst was not overloaded by native module initialization")
    }
    _CreateTSImportType(context: KNativePointer, param: KNativePointer, typeParams: KNativePointer, qualifier: KNativePointer, isTypeof: KBoolean): KNativePointer {
        throw new Error("'CreateTSImportType was not overloaded by native module initialization")
    }
    _UpdateTSImportType(context: KNativePointer, original: KNativePointer, param: KNativePointer, typeParams: KNativePointer, qualifier: KNativePointer, isTypeof: KBoolean): KNativePointer {
        throw new Error("'UpdateTSImportType was not overloaded by native module initialization")
    }
    _TSImportTypeParamConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSImportTypeParamConst was not overloaded by native module initialization")
    }
    _TSImportTypeTypeParamsConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSImportTypeTypeParamsConst was not overloaded by native module initialization")
    }
    _TSImportTypeQualifierConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSImportTypeQualifierConst was not overloaded by native module initialization")
    }
    _TSImportTypeIsTypeofConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'TSImportTypeIsTypeofConst was not overloaded by native module initialization")
    }
    _CreateTaggedTemplateExpression(context: KNativePointer, tag: KNativePointer, quasi: KNativePointer, typeParams: KNativePointer): KNativePointer {
        throw new Error("'CreateTaggedTemplateExpression was not overloaded by native module initialization")
    }
    _UpdateTaggedTemplateExpression(context: KNativePointer, original: KNativePointer, tag: KNativePointer, quasi: KNativePointer, typeParams: KNativePointer): KNativePointer {
        throw new Error("'UpdateTaggedTemplateExpression was not overloaded by native module initialization")
    }
    _TaggedTemplateExpressionTagConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TaggedTemplateExpressionTagConst was not overloaded by native module initialization")
    }
    _TaggedTemplateExpressionQuasiConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TaggedTemplateExpressionQuasiConst was not overloaded by native module initialization")
    }
    _TaggedTemplateExpressionTypeParamsConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TaggedTemplateExpressionTypeParamsConst was not overloaded by native module initialization")
    }
    _CreateFunctionDeclaration(context: KNativePointer, func: KNativePointer, annotations: BigUint64Array, annotationsSequenceLength: KUInt, isAnonymous: KBoolean): KNativePointer {
        throw new Error("'CreateFunctionDeclaration was not overloaded by native module initialization")
    }
    _UpdateFunctionDeclaration(context: KNativePointer, original: KNativePointer, func: KNativePointer, annotations: BigUint64Array, annotationsSequenceLength: KUInt, isAnonymous: KBoolean): KNativePointer {
        throw new Error("'UpdateFunctionDeclaration was not overloaded by native module initialization")
    }
    _CreateFunctionDeclaration1(context: KNativePointer, func: KNativePointer, isAnonymous: KBoolean): KNativePointer {
        throw new Error("'CreateFunctionDeclaration1 was not overloaded by native module initialization")
    }
    _UpdateFunctionDeclaration1(context: KNativePointer, original: KNativePointer, func: KNativePointer, isAnonymous: KBoolean): KNativePointer {
        throw new Error("'UpdateFunctionDeclaration1 was not overloaded by native module initialization")
    }
    _FunctionDeclarationFunction(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'FunctionDeclarationFunction was not overloaded by native module initialization")
    }
    _FunctionDeclarationIsAnonymousConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'FunctionDeclarationIsAnonymousConst was not overloaded by native module initialization")
    }
    _FunctionDeclarationFunctionConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'FunctionDeclarationFunctionConst was not overloaded by native module initialization")
    }
    _FunctionDeclarationAnnotations(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'FunctionDeclarationAnnotations was not overloaded by native module initialization")
    }
    _FunctionDeclarationAnnotationsConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'FunctionDeclarationAnnotationsConst was not overloaded by native module initialization")
    }
    _FunctionDeclarationSetAnnotations(context: KNativePointer, receiver: KNativePointer, annotations: BigUint64Array, annotationsSequenceLength: KUInt): void {
        throw new Error("'FunctionDeclarationSetAnnotations was not overloaded by native module initialization")
    }
    _CreateETSTypeReference(context: KNativePointer, part: KNativePointer): KNativePointer {
        throw new Error("'CreateETSTypeReference was not overloaded by native module initialization")
    }
    _UpdateETSTypeReference(context: KNativePointer, original: KNativePointer, part: KNativePointer): KNativePointer {
        throw new Error("'UpdateETSTypeReference was not overloaded by native module initialization")
    }
    _ETSTypeReferencePart(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ETSTypeReferencePart was not overloaded by native module initialization")
    }
    _ETSTypeReferencePartConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ETSTypeReferencePartConst was not overloaded by native module initialization")
    }
    _ETSTypeReferenceBaseNameConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ETSTypeReferenceBaseNameConst was not overloaded by native module initialization")
    }
    _CreateTSTypeReference(context: KNativePointer, typeName: KNativePointer, typeParams: KNativePointer): KNativePointer {
        throw new Error("'CreateTSTypeReference was not overloaded by native module initialization")
    }
    _UpdateTSTypeReference(context: KNativePointer, original: KNativePointer, typeName: KNativePointer, typeParams: KNativePointer): KNativePointer {
        throw new Error("'UpdateTSTypeReference was not overloaded by native module initialization")
    }
    _TSTypeReferenceTypeParamsConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSTypeReferenceTypeParamsConst was not overloaded by native module initialization")
    }
    _TSTypeReferenceTypeNameConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSTypeReferenceTypeNameConst was not overloaded by native module initialization")
    }
    _TSTypeReferenceBaseNameConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSTypeReferenceBaseNameConst was not overloaded by native module initialization")
    }
    _CreateImportSource(context: KNativePointer, source: KNativePointer, resolvedSource: KNativePointer, hasDecl: KBoolean): KNativePointer {
        throw new Error("'CreateImportSource was not overloaded by native module initialization")
    }
    _ImportSourceSourceConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ImportSourceSourceConst was not overloaded by native module initialization")
    }
    _ImportSourceSource(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ImportSourceSource was not overloaded by native module initialization")
    }
    _ImportSourceResolvedSourceConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ImportSourceResolvedSourceConst was not overloaded by native module initialization")
    }
    _ImportSourceResolvedSource(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ImportSourceResolvedSource was not overloaded by native module initialization")
    }
    _ImportSourceHasDeclConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'ImportSourceHasDeclConst was not overloaded by native module initialization")
    }
    _CreateNamedType(context: KNativePointer, name: KNativePointer): KNativePointer {
        throw new Error("'CreateNamedType was not overloaded by native module initialization")
    }
    _UpdateNamedType(context: KNativePointer, original: KNativePointer, name: KNativePointer): KNativePointer {
        throw new Error("'UpdateNamedType was not overloaded by native module initialization")
    }
    _NamedTypeNameConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'NamedTypeNameConst was not overloaded by native module initialization")
    }
    _NamedTypeTypeParamsConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'NamedTypeTypeParamsConst was not overloaded by native module initialization")
    }
    _NamedTypeIsNullableConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'NamedTypeIsNullableConst was not overloaded by native module initialization")
    }
    _NamedTypeSetNullable(context: KNativePointer, receiver: KNativePointer, nullable: KBoolean): void {
        throw new Error("'NamedTypeSetNullable was not overloaded by native module initialization")
    }
    _NamedTypeSetNext(context: KNativePointer, receiver: KNativePointer, next: KNativePointer): void {
        throw new Error("'NamedTypeSetNext was not overloaded by native module initialization")
    }
    _NamedTypeSetTypeParams(context: KNativePointer, receiver: KNativePointer, typeParams: KNativePointer): void {
        throw new Error("'NamedTypeSetTypeParams was not overloaded by native module initialization")
    }
    _NumberLiteralStrConst(context: KNativePointer, receiver: KNativePointer): KStringPtr {
        throw new Error("'NumberLiteralStrConst was not overloaded by native module initialization")
    }
    _CreateTSFunctionType(context: KNativePointer, signature: KNativePointer): KNativePointer {
        throw new Error("'CreateTSFunctionType was not overloaded by native module initialization")
    }
    _UpdateTSFunctionType(context: KNativePointer, original: KNativePointer, signature: KNativePointer): KNativePointer {
        throw new Error("'UpdateTSFunctionType was not overloaded by native module initialization")
    }
    _TSFunctionTypeTypeParamsConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSFunctionTypeTypeParamsConst was not overloaded by native module initialization")
    }
    _TSFunctionTypeTypeParams(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSFunctionTypeTypeParams was not overloaded by native module initialization")
    }
    _TSFunctionTypeParamsConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSFunctionTypeParamsConst was not overloaded by native module initialization")
    }
    _TSFunctionTypeReturnTypeConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSFunctionTypeReturnTypeConst was not overloaded by native module initialization")
    }
    _TSFunctionTypeReturnType(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSFunctionTypeReturnType was not overloaded by native module initialization")
    }
    _TSFunctionTypeSetNullable(context: KNativePointer, receiver: KNativePointer, nullable: KBoolean): void {
        throw new Error("'TSFunctionTypeSetNullable was not overloaded by native module initialization")
    }
    _CreateTemplateElement(context: KNativePointer): KNativePointer {
        throw new Error("'CreateTemplateElement was not overloaded by native module initialization")
    }
    _UpdateTemplateElement(context: KNativePointer, original: KNativePointer): KNativePointer {
        throw new Error("'UpdateTemplateElement was not overloaded by native module initialization")
    }
    _CreateTemplateElement1(context: KNativePointer, raw: KStringPtr, cooked: KStringPtr): KNativePointer {
        throw new Error("'CreateTemplateElement1 was not overloaded by native module initialization")
    }
    _UpdateTemplateElement1(context: KNativePointer, original: KNativePointer, raw: KStringPtr, cooked: KStringPtr): KNativePointer {
        throw new Error("'UpdateTemplateElement1 was not overloaded by native module initialization")
    }
    _TemplateElementRawConst(context: KNativePointer, receiver: KNativePointer): KStringPtr {
        throw new Error("'TemplateElementRawConst was not overloaded by native module initialization")
    }
    _TemplateElementCookedConst(context: KNativePointer, receiver: KNativePointer): KStringPtr {
        throw new Error("'TemplateElementCookedConst was not overloaded by native module initialization")
    }
    _CreateTSInterfaceDeclaration(context: KNativePointer, _extends: BigUint64Array, _extendsSequenceLength: KUInt, id: KNativePointer, typeParams: KNativePointer, body: KNativePointer, isStatic: KBoolean, isExternal: KBoolean): KNativePointer {
        throw new Error("'CreateTSInterfaceDeclaration was not overloaded by native module initialization")
    }
    _UpdateTSInterfaceDeclaration(context: KNativePointer, original: KNativePointer, _extends: BigUint64Array, _extendsSequenceLength: KUInt, id: KNativePointer, typeParams: KNativePointer, body: KNativePointer, isStatic: KBoolean, isExternal: KBoolean): KNativePointer {
        throw new Error("'UpdateTSInterfaceDeclaration was not overloaded by native module initialization")
    }
    _TSInterfaceDeclarationBody(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSInterfaceDeclarationBody was not overloaded by native module initialization")
    }
    _TSInterfaceDeclarationBodyConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSInterfaceDeclarationBodyConst was not overloaded by native module initialization")
    }
    _TSInterfaceDeclarationId(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSInterfaceDeclarationId was not overloaded by native module initialization")
    }
    _TSInterfaceDeclarationIdConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSInterfaceDeclarationIdConst was not overloaded by native module initialization")
    }
    _TSInterfaceDeclarationInternalNameConst(context: KNativePointer, receiver: KNativePointer): KStringPtr {
        throw new Error("'TSInterfaceDeclarationInternalNameConst was not overloaded by native module initialization")
    }
    _TSInterfaceDeclarationSetInternalName(context: KNativePointer, receiver: KNativePointer, internalName: KStringPtr): void {
        throw new Error("'TSInterfaceDeclarationSetInternalName was not overloaded by native module initialization")
    }
    _TSInterfaceDeclarationIsStaticConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'TSInterfaceDeclarationIsStaticConst was not overloaded by native module initialization")
    }
    _TSInterfaceDeclarationIsFromExternalConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'TSInterfaceDeclarationIsFromExternalConst was not overloaded by native module initialization")
    }
    _TSInterfaceDeclarationTypeParamsConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSInterfaceDeclarationTypeParamsConst was not overloaded by native module initialization")
    }
    _TSInterfaceDeclarationTypeParams(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSInterfaceDeclarationTypeParams was not overloaded by native module initialization")
    }
    _TSInterfaceDeclarationExtends(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSInterfaceDeclarationExtends was not overloaded by native module initialization")
    }
    _TSInterfaceDeclarationExtendsConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSInterfaceDeclarationExtendsConst was not overloaded by native module initialization")
    }
    _TSInterfaceDeclarationDecoratorsConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSInterfaceDeclarationDecoratorsConst was not overloaded by native module initialization")
    }
    _TSInterfaceDeclarationGetAnonClass(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSInterfaceDeclarationGetAnonClass was not overloaded by native module initialization")
    }
    _TSInterfaceDeclarationGetAnonClassConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSInterfaceDeclarationGetAnonClassConst was not overloaded by native module initialization")
    }
    _TSInterfaceDeclarationSetAnonClass(context: KNativePointer, receiver: KNativePointer, anonClass: KNativePointer): void {
        throw new Error("'TSInterfaceDeclarationSetAnonClass was not overloaded by native module initialization")
    }
    _TSInterfaceDeclarationAnnotations(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSInterfaceDeclarationAnnotations was not overloaded by native module initialization")
    }
    _TSInterfaceDeclarationAnnotationsConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSInterfaceDeclarationAnnotationsConst was not overloaded by native module initialization")
    }
    _TSInterfaceDeclarationSetAnnotations(context: KNativePointer, receiver: KNativePointer, annotations: BigUint64Array, annotationsSequenceLength: KUInt): void {
        throw new Error("'TSInterfaceDeclarationSetAnnotations was not overloaded by native module initialization")
    }
    _CreateVariableDeclaration(context: KNativePointer, kind: KInt, declarators: BigUint64Array, declaratorsSequenceLength: KUInt): KNativePointer {
        throw new Error("'CreateVariableDeclaration was not overloaded by native module initialization")
    }
    _UpdateVariableDeclaration(context: KNativePointer, original: KNativePointer, kind: KInt, declarators: BigUint64Array, declaratorsSequenceLength: KUInt): KNativePointer {
        throw new Error("'UpdateVariableDeclaration was not overloaded by native module initialization")
    }
    _VariableDeclarationDeclaratorsConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'VariableDeclarationDeclaratorsConst was not overloaded by native module initialization")
    }
    _VariableDeclarationKindConst(context: KNativePointer, receiver: KNativePointer): KInt {
        throw new Error("'VariableDeclarationKindConst was not overloaded by native module initialization")
    }
    _VariableDeclarationDecoratorsConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'VariableDeclarationDecoratorsConst was not overloaded by native module initialization")
    }
    _VariableDeclarationGetDeclaratorByNameConst(context: KNativePointer, receiver: KNativePointer, name: KStringPtr): KNativePointer {
        throw new Error("'VariableDeclarationGetDeclaratorByNameConst was not overloaded by native module initialization")
    }
    _VariableDeclarationAnnotations(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'VariableDeclarationAnnotations was not overloaded by native module initialization")
    }
    _VariableDeclarationAnnotationsConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'VariableDeclarationAnnotationsConst was not overloaded by native module initialization")
    }
    _VariableDeclarationSetAnnotations(context: KNativePointer, receiver: KNativePointer, annotations: BigUint64Array, annotationsSequenceLength: KUInt): void {
        throw new Error("'VariableDeclarationSetAnnotations was not overloaded by native module initialization")
    }
    _CreateUndefinedLiteral(context: KNativePointer): KNativePointer {
        throw new Error("'CreateUndefinedLiteral was not overloaded by native module initialization")
    }
    _UpdateUndefinedLiteral(context: KNativePointer, original: KNativePointer): KNativePointer {
        throw new Error("'UpdateUndefinedLiteral was not overloaded by native module initialization")
    }
    _CreateMemberExpression(context: KNativePointer, object_arg: KNativePointer, property: KNativePointer, kind: KInt, computed: KBoolean, optional_arg: KBoolean): KNativePointer {
        throw new Error("'CreateMemberExpression was not overloaded by native module initialization")
    }
    _UpdateMemberExpression(context: KNativePointer, original: KNativePointer, object_arg: KNativePointer, property: KNativePointer, kind: KInt, computed: KBoolean, optional_arg: KBoolean): KNativePointer {
        throw new Error("'UpdateMemberExpression was not overloaded by native module initialization")
    }
    _MemberExpressionObject(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'MemberExpressionObject was not overloaded by native module initialization")
    }
    _MemberExpressionObjectConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'MemberExpressionObjectConst was not overloaded by native module initialization")
    }
    _MemberExpressionSetObject(context: KNativePointer, receiver: KNativePointer, object_arg: KNativePointer): void {
        throw new Error("'MemberExpressionSetObject was not overloaded by native module initialization")
    }
    _MemberExpressionSetProperty(context: KNativePointer, receiver: KNativePointer, prop: KNativePointer): void {
        throw new Error("'MemberExpressionSetProperty was not overloaded by native module initialization")
    }
    _MemberExpressionProperty(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'MemberExpressionProperty was not overloaded by native module initialization")
    }
    _MemberExpressionPropertyConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'MemberExpressionPropertyConst was not overloaded by native module initialization")
    }
    _MemberExpressionIsComputedConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'MemberExpressionIsComputedConst was not overloaded by native module initialization")
    }
    _MemberExpressionKindConst(context: KNativePointer, receiver: KNativePointer): KInt {
        throw new Error("'MemberExpressionKindConst was not overloaded by native module initialization")
    }
    _MemberExpressionAddMemberKind(context: KNativePointer, receiver: KNativePointer, kind: KInt): void {
        throw new Error("'MemberExpressionAddMemberKind was not overloaded by native module initialization")
    }
    _MemberExpressionHasMemberKindConst(context: KNativePointer, receiver: KNativePointer, kind: KInt): KBoolean {
        throw new Error("'MemberExpressionHasMemberKindConst was not overloaded by native module initialization")
    }
    _MemberExpressionRemoveMemberKind(context: KNativePointer, receiver: KNativePointer, kind: KInt): void {
        throw new Error("'MemberExpressionRemoveMemberKind was not overloaded by native module initialization")
    }
    _MemberExpressionIsIgnoreBoxConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'MemberExpressionIsIgnoreBoxConst was not overloaded by native module initialization")
    }
    _MemberExpressionSetIgnoreBox(context: KNativePointer, receiver: KNativePointer): void {
        throw new Error("'MemberExpressionSetIgnoreBox was not overloaded by native module initialization")
    }
    _MemberExpressionIsPrivateReferenceConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'MemberExpressionIsPrivateReferenceConst was not overloaded by native module initialization")
    }
    _CreateTSClassImplements(context: KNativePointer, expression: KNativePointer, typeParameters: KNativePointer): KNativePointer {
        throw new Error("'CreateTSClassImplements was not overloaded by native module initialization")
    }
    _UpdateTSClassImplements(context: KNativePointer, original: KNativePointer, expression: KNativePointer, typeParameters: KNativePointer): KNativePointer {
        throw new Error("'UpdateTSClassImplements was not overloaded by native module initialization")
    }
    _CreateTSClassImplements1(context: KNativePointer, expression: KNativePointer): KNativePointer {
        throw new Error("'CreateTSClassImplements1 was not overloaded by native module initialization")
    }
    _UpdateTSClassImplements1(context: KNativePointer, original: KNativePointer, expression: KNativePointer): KNativePointer {
        throw new Error("'UpdateTSClassImplements1 was not overloaded by native module initialization")
    }
    _TSClassImplementsExpr(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSClassImplementsExpr was not overloaded by native module initialization")
    }
    _TSClassImplementsExprConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSClassImplementsExprConst was not overloaded by native module initialization")
    }
    _TSClassImplementsTypeParametersConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSClassImplementsTypeParametersConst was not overloaded by native module initialization")
    }
    _CreateTSObjectKeyword(context: KNativePointer): KNativePointer {
        throw new Error("'CreateTSObjectKeyword was not overloaded by native module initialization")
    }
    _UpdateTSObjectKeyword(context: KNativePointer, original: KNativePointer): KNativePointer {
        throw new Error("'UpdateTSObjectKeyword was not overloaded by native module initialization")
    }
    _CreateETSUnionTypeIr(context: KNativePointer, types: BigUint64Array, typesSequenceLength: KUInt): KNativePointer {
        throw new Error("'CreateETSUnionTypeIr was not overloaded by native module initialization")
    }
    _UpdateETSUnionTypeIr(context: KNativePointer, original: KNativePointer, types: BigUint64Array, typesSequenceLength: KUInt): KNativePointer {
        throw new Error("'UpdateETSUnionTypeIr was not overloaded by native module initialization")
    }
    _ETSUnionTypeIrTypesConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ETSUnionTypeIrTypesConst was not overloaded by native module initialization")
    }
    _CreateTSPropertySignature(context: KNativePointer, key: KNativePointer, typeAnnotation: KNativePointer, computed: KBoolean, optional_arg: KBoolean, readonly_arg: KBoolean): KNativePointer {
        throw new Error("'CreateTSPropertySignature was not overloaded by native module initialization")
    }
    _UpdateTSPropertySignature(context: KNativePointer, original: KNativePointer, key: KNativePointer, typeAnnotation: KNativePointer, computed: KBoolean, optional_arg: KBoolean, readonly_arg: KBoolean): KNativePointer {
        throw new Error("'UpdateTSPropertySignature was not overloaded by native module initialization")
    }
    _TSPropertySignatureKeyConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSPropertySignatureKeyConst was not overloaded by native module initialization")
    }
    _TSPropertySignatureKey(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSPropertySignatureKey was not overloaded by native module initialization")
    }
    _TSPropertySignatureComputedConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'TSPropertySignatureComputedConst was not overloaded by native module initialization")
    }
    _TSPropertySignatureOptionalConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'TSPropertySignatureOptionalConst was not overloaded by native module initialization")
    }
    _TSPropertySignatureReadonlyConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'TSPropertySignatureReadonlyConst was not overloaded by native module initialization")
    }
    _TSPropertySignatureTypeAnnotationConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSPropertySignatureTypeAnnotationConst was not overloaded by native module initialization")
    }
    _TSPropertySignatureSetTsTypeAnnotation(context: KNativePointer, receiver: KNativePointer, typeAnnotation: KNativePointer): void {
        throw new Error("'TSPropertySignatureSetTsTypeAnnotation was not overloaded by native module initialization")
    }
    _CreateTSConditionalType(context: KNativePointer, checkType: KNativePointer, extendsType: KNativePointer, trueType: KNativePointer, falseType: KNativePointer): KNativePointer {
        throw new Error("'CreateTSConditionalType was not overloaded by native module initialization")
    }
    _UpdateTSConditionalType(context: KNativePointer, original: KNativePointer, checkType: KNativePointer, extendsType: KNativePointer, trueType: KNativePointer, falseType: KNativePointer): KNativePointer {
        throw new Error("'UpdateTSConditionalType was not overloaded by native module initialization")
    }
    _TSConditionalTypeCheckTypeConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSConditionalTypeCheckTypeConst was not overloaded by native module initialization")
    }
    _TSConditionalTypeExtendsTypeConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSConditionalTypeExtendsTypeConst was not overloaded by native module initialization")
    }
    _TSConditionalTypeTrueTypeConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSConditionalTypeTrueTypeConst was not overloaded by native module initialization")
    }
    _TSConditionalTypeFalseTypeConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSConditionalTypeFalseTypeConst was not overloaded by native module initialization")
    }
    _CreateTSLiteralType(context: KNativePointer, literal: KNativePointer): KNativePointer {
        throw new Error("'CreateTSLiteralType was not overloaded by native module initialization")
    }
    _UpdateTSLiteralType(context: KNativePointer, original: KNativePointer, literal: KNativePointer): KNativePointer {
        throw new Error("'UpdateTSLiteralType was not overloaded by native module initialization")
    }
    _TSLiteralTypeLiteralConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSLiteralTypeLiteralConst was not overloaded by native module initialization")
    }
    _CreateTSTypeAliasDeclaration(context: KNativePointer, id: KNativePointer, typeParams: KNativePointer, typeAnnotation: KNativePointer): KNativePointer {
        throw new Error("'CreateTSTypeAliasDeclaration was not overloaded by native module initialization")
    }
    _UpdateTSTypeAliasDeclaration(context: KNativePointer, original: KNativePointer, id: KNativePointer, typeParams: KNativePointer, typeAnnotation: KNativePointer): KNativePointer {
        throw new Error("'UpdateTSTypeAliasDeclaration was not overloaded by native module initialization")
    }
    _CreateTSTypeAliasDeclaration1(context: KNativePointer, id: KNativePointer): KNativePointer {
        throw new Error("'CreateTSTypeAliasDeclaration1 was not overloaded by native module initialization")
    }
    _UpdateTSTypeAliasDeclaration1(context: KNativePointer, original: KNativePointer, id: KNativePointer): KNativePointer {
        throw new Error("'UpdateTSTypeAliasDeclaration1 was not overloaded by native module initialization")
    }
    _TSTypeAliasDeclarationId(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSTypeAliasDeclarationId was not overloaded by native module initialization")
    }
    _TSTypeAliasDeclarationIdConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSTypeAliasDeclarationIdConst was not overloaded by native module initialization")
    }
    _TSTypeAliasDeclarationTypeParamsConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSTypeAliasDeclarationTypeParamsConst was not overloaded by native module initialization")
    }
    _TSTypeAliasDeclarationDecoratorsConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSTypeAliasDeclarationDecoratorsConst was not overloaded by native module initialization")
    }
    _TSTypeAliasDeclarationSetTypeParameters(context: KNativePointer, receiver: KNativePointer, typeParams: KNativePointer): void {
        throw new Error("'TSTypeAliasDeclarationSetTypeParameters was not overloaded by native module initialization")
    }
    _TSTypeAliasDeclarationAnnotations(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSTypeAliasDeclarationAnnotations was not overloaded by native module initialization")
    }
    _TSTypeAliasDeclarationAnnotationsConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSTypeAliasDeclarationAnnotationsConst was not overloaded by native module initialization")
    }
    _TSTypeAliasDeclarationSetAnnotations(context: KNativePointer, receiver: KNativePointer, annotations: BigUint64Array, annotationsSequenceLength: KUInt): void {
        throw new Error("'TSTypeAliasDeclarationSetAnnotations was not overloaded by native module initialization")
    }
    _TSTypeAliasDeclarationTypeAnnotationConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSTypeAliasDeclarationTypeAnnotationConst was not overloaded by native module initialization")
    }
    _TSTypeAliasDeclarationSetTsTypeAnnotation(context: KNativePointer, receiver: KNativePointer, typeAnnotation: KNativePointer): void {
        throw new Error("'TSTypeAliasDeclarationSetTsTypeAnnotation was not overloaded by native module initialization")
    }
    _CreateDebuggerStatement(context: KNativePointer): KNativePointer {
        throw new Error("'CreateDebuggerStatement was not overloaded by native module initialization")
    }
    _UpdateDebuggerStatement(context: KNativePointer, original: KNativePointer): KNativePointer {
        throw new Error("'UpdateDebuggerStatement was not overloaded by native module initialization")
    }
    _CreateReturnStatement(context: KNativePointer): KNativePointer {
        throw new Error("'CreateReturnStatement was not overloaded by native module initialization")
    }
    _UpdateReturnStatement(context: KNativePointer, original: KNativePointer): KNativePointer {
        throw new Error("'UpdateReturnStatement was not overloaded by native module initialization")
    }
    _CreateReturnStatement1(context: KNativePointer, argument: KNativePointer): KNativePointer {
        throw new Error("'CreateReturnStatement1 was not overloaded by native module initialization")
    }
    _UpdateReturnStatement1(context: KNativePointer, original: KNativePointer, argument: KNativePointer): KNativePointer {
        throw new Error("'UpdateReturnStatement1 was not overloaded by native module initialization")
    }
    _ReturnStatementArgument(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ReturnStatementArgument was not overloaded by native module initialization")
    }
    _ReturnStatementArgumentConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ReturnStatementArgumentConst was not overloaded by native module initialization")
    }
    _ReturnStatementSetArgument(context: KNativePointer, receiver: KNativePointer, arg: KNativePointer): void {
        throw new Error("'ReturnStatementSetArgument was not overloaded by native module initialization")
    }
    _CreateExportDefaultDeclaration(context: KNativePointer, decl: KNativePointer, exportEquals: KBoolean): KNativePointer {
        throw new Error("'CreateExportDefaultDeclaration was not overloaded by native module initialization")
    }
    _UpdateExportDefaultDeclaration(context: KNativePointer, original: KNativePointer, decl: KNativePointer, exportEquals: KBoolean): KNativePointer {
        throw new Error("'UpdateExportDefaultDeclaration was not overloaded by native module initialization")
    }
    _ExportDefaultDeclarationDecl(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ExportDefaultDeclarationDecl was not overloaded by native module initialization")
    }
    _ExportDefaultDeclarationDeclConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ExportDefaultDeclarationDeclConst was not overloaded by native module initialization")
    }
    _ExportDefaultDeclarationIsExportEqualsConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'ExportDefaultDeclarationIsExportEqualsConst was not overloaded by native module initialization")
    }
    _CreateScriptFunction(context: KNativePointer, databody: KNativePointer, datasignature: KNativePointer, datafuncFlags: KInt, dataflags: KInt): KNativePointer {
        throw new Error("'CreateScriptFunction was not overloaded by native module initialization")
    }
    _UpdateScriptFunction(context: KNativePointer, original: KNativePointer, databody: KNativePointer, datasignature: KNativePointer, datafuncFlags: KInt, dataflags: KInt): KNativePointer {
        throw new Error("'UpdateScriptFunction was not overloaded by native module initialization")
    }
    _ScriptFunctionIdConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ScriptFunctionIdConst was not overloaded by native module initialization")
    }
    _ScriptFunctionId(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ScriptFunctionId was not overloaded by native module initialization")
    }
    _ScriptFunctionParamsConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ScriptFunctionParamsConst was not overloaded by native module initialization")
    }
    _ScriptFunctionParams(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ScriptFunctionParams was not overloaded by native module initialization")
    }
    _ScriptFunctionReturnStatementsConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ScriptFunctionReturnStatementsConst was not overloaded by native module initialization")
    }
    _ScriptFunctionReturnStatements(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ScriptFunctionReturnStatements was not overloaded by native module initialization")
    }
    _ScriptFunctionTypeParamsConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ScriptFunctionTypeParamsConst was not overloaded by native module initialization")
    }
    _ScriptFunctionTypeParams(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ScriptFunctionTypeParams was not overloaded by native module initialization")
    }
    _ScriptFunctionBodyConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ScriptFunctionBodyConst was not overloaded by native module initialization")
    }
    _ScriptFunctionBody(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ScriptFunctionBody was not overloaded by native module initialization")
    }
    _ScriptFunctionAddReturnStatement(context: KNativePointer, receiver: KNativePointer, returnStatement: KNativePointer): void {
        throw new Error("'ScriptFunctionAddReturnStatement was not overloaded by native module initialization")
    }
    _ScriptFunctionSetBody(context: KNativePointer, receiver: KNativePointer, body: KNativePointer): void {
        throw new Error("'ScriptFunctionSetBody was not overloaded by native module initialization")
    }
    _ScriptFunctionReturnTypeAnnotationConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ScriptFunctionReturnTypeAnnotationConst was not overloaded by native module initialization")
    }
    _ScriptFunctionReturnTypeAnnotation(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ScriptFunctionReturnTypeAnnotation was not overloaded by native module initialization")
    }
    _ScriptFunctionSetReturnTypeAnnotation(context: KNativePointer, receiver: KNativePointer, node: KNativePointer): void {
        throw new Error("'ScriptFunctionSetReturnTypeAnnotation was not overloaded by native module initialization")
    }
    _ScriptFunctionIsEntryPointConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'ScriptFunctionIsEntryPointConst was not overloaded by native module initialization")
    }
    _ScriptFunctionIsGeneratorConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'ScriptFunctionIsGeneratorConst was not overloaded by native module initialization")
    }
    _ScriptFunctionIsAsyncFuncConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'ScriptFunctionIsAsyncFuncConst was not overloaded by native module initialization")
    }
    _ScriptFunctionIsAsyncImplFuncConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'ScriptFunctionIsAsyncImplFuncConst was not overloaded by native module initialization")
    }
    _ScriptFunctionIsArrowConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'ScriptFunctionIsArrowConst was not overloaded by native module initialization")
    }
    _ScriptFunctionIsOverloadConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'ScriptFunctionIsOverloadConst was not overloaded by native module initialization")
    }
    _ScriptFunctionIsExternalOverloadConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'ScriptFunctionIsExternalOverloadConst was not overloaded by native module initialization")
    }
    _ScriptFunctionIsConstructorConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'ScriptFunctionIsConstructorConst was not overloaded by native module initialization")
    }
    _ScriptFunctionIsGetterConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'ScriptFunctionIsGetterConst was not overloaded by native module initialization")
    }
    _ScriptFunctionIsSetterConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'ScriptFunctionIsSetterConst was not overloaded by native module initialization")
    }
    _ScriptFunctionIsExtensionAccessorConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'ScriptFunctionIsExtensionAccessorConst was not overloaded by native module initialization")
    }
    _ScriptFunctionIsMethodConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'ScriptFunctionIsMethodConst was not overloaded by native module initialization")
    }
    _ScriptFunctionIsProxyConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'ScriptFunctionIsProxyConst was not overloaded by native module initialization")
    }
    _ScriptFunctionIsStaticBlockConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'ScriptFunctionIsStaticBlockConst was not overloaded by native module initialization")
    }
    _ScriptFunctionIsEnumConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'ScriptFunctionIsEnumConst was not overloaded by native module initialization")
    }
    _ScriptFunctionIsHiddenConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'ScriptFunctionIsHiddenConst was not overloaded by native module initialization")
    }
    _ScriptFunctionIsExternalConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'ScriptFunctionIsExternalConst was not overloaded by native module initialization")
    }
    _ScriptFunctionIsImplicitSuperCallNeededConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'ScriptFunctionIsImplicitSuperCallNeededConst was not overloaded by native module initialization")
    }
    _ScriptFunctionHasBodyConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'ScriptFunctionHasBodyConst was not overloaded by native module initialization")
    }
    _ScriptFunctionHasRestParameterConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'ScriptFunctionHasRestParameterConst was not overloaded by native module initialization")
    }
    _ScriptFunctionHasReturnStatementConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'ScriptFunctionHasReturnStatementConst was not overloaded by native module initialization")
    }
    _ScriptFunctionHasThrowStatementConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'ScriptFunctionHasThrowStatementConst was not overloaded by native module initialization")
    }
    _ScriptFunctionIsThrowingConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'ScriptFunctionIsThrowingConst was not overloaded by native module initialization")
    }
    _ScriptFunctionIsRethrowingConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'ScriptFunctionIsRethrowingConst was not overloaded by native module initialization")
    }
    _ScriptFunctionIsDynamicConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'ScriptFunctionIsDynamicConst was not overloaded by native module initialization")
    }
    _ScriptFunctionIsExtensionMethodConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'ScriptFunctionIsExtensionMethodConst was not overloaded by native module initialization")
    }
    _ScriptFunctionFlagsConst(context: KNativePointer, receiver: KNativePointer): KInt {
        throw new Error("'ScriptFunctionFlagsConst was not overloaded by native module initialization")
    }
    _ScriptFunctionHasReceiverConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'ScriptFunctionHasReceiverConst was not overloaded by native module initialization")
    }
    _ScriptFunctionSetIdent(context: KNativePointer, receiver: KNativePointer, id: KNativePointer): void {
        throw new Error("'ScriptFunctionSetIdent was not overloaded by native module initialization")
    }
    _ScriptFunctionAddFlag(context: KNativePointer, receiver: KNativePointer, flags: KInt): void {
        throw new Error("'ScriptFunctionAddFlag was not overloaded by native module initialization")
    }
    _ScriptFunctionAddModifier(context: KNativePointer, receiver: KNativePointer, flags: KInt): void {
        throw new Error("'ScriptFunctionAddModifier was not overloaded by native module initialization")
    }
    _ScriptFunctionFormalParamsLengthConst(context: KNativePointer, receiver: KNativePointer): KUInt {
        throw new Error("'ScriptFunctionFormalParamsLengthConst was not overloaded by native module initialization")
    }
    _ScriptFunctionAnnotations(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ScriptFunctionAnnotations was not overloaded by native module initialization")
    }
    _ScriptFunctionAnnotationsConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ScriptFunctionAnnotationsConst was not overloaded by native module initialization")
    }
    _ScriptFunctionSetAnnotations(context: KNativePointer, receiver: KNativePointer, annotations: BigUint64Array, annotationsSequenceLength: KUInt): void {
        throw new Error("'ScriptFunctionSetAnnotations was not overloaded by native module initialization")
    }
    _CreateClassDefinition(context: KNativePointer, ident: KNativePointer, typeParams: KNativePointer, superTypeParams: KNativePointer, _implements: BigUint64Array, _implementsSequenceLength: KUInt, ctor: KNativePointer, superClass: KNativePointer, body: BigUint64Array, bodySequenceLength: KUInt, modifiers: KInt, flags: KInt): KNativePointer {
        throw new Error("'CreateClassDefinition was not overloaded by native module initialization")
    }
    _UpdateClassDefinition(context: KNativePointer, original: KNativePointer, ident: KNativePointer, typeParams: KNativePointer, superTypeParams: KNativePointer, _implements: BigUint64Array, _implementsSequenceLength: KUInt, ctor: KNativePointer, superClass: KNativePointer, body: BigUint64Array, bodySequenceLength: KUInt, modifiers: KInt, flags: KInt): KNativePointer {
        throw new Error("'UpdateClassDefinition was not overloaded by native module initialization")
    }
    _CreateClassDefinition1(context: KNativePointer, ident: KNativePointer, body: BigUint64Array, bodySequenceLength: KUInt, modifiers: KInt, flags: KInt): KNativePointer {
        throw new Error("'CreateClassDefinition1 was not overloaded by native module initialization")
    }
    _UpdateClassDefinition1(context: KNativePointer, original: KNativePointer, ident: KNativePointer, body: BigUint64Array, bodySequenceLength: KUInt, modifiers: KInt, flags: KInt): KNativePointer {
        throw new Error("'UpdateClassDefinition1 was not overloaded by native module initialization")
    }
    _CreateClassDefinition2(context: KNativePointer, ident: KNativePointer, modifiers: KInt, flags: KInt): KNativePointer {
        throw new Error("'CreateClassDefinition2 was not overloaded by native module initialization")
    }
    _UpdateClassDefinition2(context: KNativePointer, original: KNativePointer, ident: KNativePointer, modifiers: KInt, flags: KInt): KNativePointer {
        throw new Error("'UpdateClassDefinition2 was not overloaded by native module initialization")
    }
    _ClassDefinitionIdentConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ClassDefinitionIdentConst was not overloaded by native module initialization")
    }
    _ClassDefinitionIdent(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ClassDefinitionIdent was not overloaded by native module initialization")
    }
    _ClassDefinitionSetIdent(context: KNativePointer, receiver: KNativePointer, ident: KNativePointer): void {
        throw new Error("'ClassDefinitionSetIdent was not overloaded by native module initialization")
    }
    _ClassDefinitionInternalNameConst(context: KNativePointer, receiver: KNativePointer): KStringPtr {
        throw new Error("'ClassDefinitionInternalNameConst was not overloaded by native module initialization")
    }
    _ClassDefinitionSetInternalName(context: KNativePointer, receiver: KNativePointer, internalName: KStringPtr): void {
        throw new Error("'ClassDefinitionSetInternalName was not overloaded by native module initialization")
    }
    _ClassDefinitionSuper(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ClassDefinitionSuper was not overloaded by native module initialization")
    }
    _ClassDefinitionSuperConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ClassDefinitionSuperConst was not overloaded by native module initialization")
    }
    _ClassDefinitionSetSuper(context: KNativePointer, receiver: KNativePointer, superClass: KNativePointer): void {
        throw new Error("'ClassDefinitionSetSuper was not overloaded by native module initialization")
    }
    _ClassDefinitionIsGlobalConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'ClassDefinitionIsGlobalConst was not overloaded by native module initialization")
    }
    _ClassDefinitionIsLocalConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'ClassDefinitionIsLocalConst was not overloaded by native module initialization")
    }
    _ClassDefinitionIsExternConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'ClassDefinitionIsExternConst was not overloaded by native module initialization")
    }
    _ClassDefinitionIsFromExternalConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'ClassDefinitionIsFromExternalConst was not overloaded by native module initialization")
    }
    _ClassDefinitionIsInnerConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'ClassDefinitionIsInnerConst was not overloaded by native module initialization")
    }
    _ClassDefinitionIsGlobalInitializedConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'ClassDefinitionIsGlobalInitializedConst was not overloaded by native module initialization")
    }
    _ClassDefinitionIsClassDefinitionCheckedConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'ClassDefinitionIsClassDefinitionCheckedConst was not overloaded by native module initialization")
    }
    _ClassDefinitionIsAnonymousConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'ClassDefinitionIsAnonymousConst was not overloaded by native module initialization")
    }
    _ClassDefinitionIsNamespaceTransformedConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'ClassDefinitionIsNamespaceTransformedConst was not overloaded by native module initialization")
    }
    _ClassDefinitionIsModuleConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'ClassDefinitionIsModuleConst was not overloaded by native module initialization")
    }
    _ClassDefinitionSetGlobalInitialized(context: KNativePointer, receiver: KNativePointer): void {
        throw new Error("'ClassDefinitionSetGlobalInitialized was not overloaded by native module initialization")
    }
    _ClassDefinitionSetInnerModifier(context: KNativePointer, receiver: KNativePointer): void {
        throw new Error("'ClassDefinitionSetInnerModifier was not overloaded by native module initialization")
    }
    _ClassDefinitionSetClassDefinitionChecked(context: KNativePointer, receiver: KNativePointer): void {
        throw new Error("'ClassDefinitionSetClassDefinitionChecked was not overloaded by native module initialization")
    }
    _ClassDefinitionSetAnonymousModifier(context: KNativePointer, receiver: KNativePointer): void {
        throw new Error("'ClassDefinitionSetAnonymousModifier was not overloaded by native module initialization")
    }
    _ClassDefinitionSetNamespaceTransformed(context: KNativePointer, receiver: KNativePointer): void {
        throw new Error("'ClassDefinitionSetNamespaceTransformed was not overloaded by native module initialization")
    }
    _ClassDefinitionModifiersConst(context: KNativePointer, receiver: KNativePointer): KInt {
        throw new Error("'ClassDefinitionModifiersConst was not overloaded by native module initialization")
    }
    _ClassDefinitionSetModifiers(context: KNativePointer, receiver: KNativePointer, modifiers: KInt): void {
        throw new Error("'ClassDefinitionSetModifiers was not overloaded by native module initialization")
    }
    _ClassDefinitionAddProperties(context: KNativePointer, receiver: KNativePointer, body: BigUint64Array, bodySequenceLength: KUInt): void {
        throw new Error("'ClassDefinitionAddProperties was not overloaded by native module initialization")
    }
    _ClassDefinitionBody(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ClassDefinitionBody was not overloaded by native module initialization")
    }
    _ClassDefinitionBodyConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ClassDefinitionBodyConst was not overloaded by native module initialization")
    }
    _ClassDefinitionCtor(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ClassDefinitionCtor was not overloaded by native module initialization")
    }
    _ClassDefinitionSetCtor(context: KNativePointer, receiver: KNativePointer, ctor: KNativePointer): void {
        throw new Error("'ClassDefinitionSetCtor was not overloaded by native module initialization")
    }
    _ClassDefinitionImplements(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ClassDefinitionImplements was not overloaded by native module initialization")
    }
    _ClassDefinitionImplementsConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ClassDefinitionImplementsConst was not overloaded by native module initialization")
    }
    _ClassDefinitionTypeParamsConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ClassDefinitionTypeParamsConst was not overloaded by native module initialization")
    }
    _ClassDefinitionTypeParams(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ClassDefinitionTypeParams was not overloaded by native module initialization")
    }
    _ClassDefinitionSetTypeParams(context: KNativePointer, receiver: KNativePointer, typeParams: KNativePointer): void {
        throw new Error("'ClassDefinitionSetTypeParams was not overloaded by native module initialization")
    }
    _ClassDefinitionSuperTypeParamsConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ClassDefinitionSuperTypeParamsConst was not overloaded by native module initialization")
    }
    _ClassDefinitionSuperTypeParams(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ClassDefinitionSuperTypeParams was not overloaded by native module initialization")
    }
    _ClassDefinitionLocalTypeCounter(context: KNativePointer, receiver: KNativePointer): KInt {
        throw new Error("'ClassDefinitionLocalTypeCounter was not overloaded by native module initialization")
    }
    _ClassDefinitionLocalIndexConst(context: KNativePointer, receiver: KNativePointer): KInt {
        throw new Error("'ClassDefinitionLocalIndexConst was not overloaded by native module initialization")
    }
    _ClassDefinitionLocalPrefixConst(context: KNativePointer, receiver: KNativePointer): KStringPtr {
        throw new Error("'ClassDefinitionLocalPrefixConst was not overloaded by native module initialization")
    }
    _ClassDefinitionSetOrigEnumDecl(context: KNativePointer, receiver: KNativePointer, enumDecl: KNativePointer): void {
        throw new Error("'ClassDefinitionSetOrigEnumDecl was not overloaded by native module initialization")
    }
    _ClassDefinitionOrigEnumDeclConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ClassDefinitionOrigEnumDeclConst was not overloaded by native module initialization")
    }
    _ClassDefinitionGetAnonClass(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ClassDefinitionGetAnonClass was not overloaded by native module initialization")
    }
    _ClassDefinitionSetAnonClass(context: KNativePointer, receiver: KNativePointer, anonClass: KNativePointer): void {
        throw new Error("'ClassDefinitionSetAnonClass was not overloaded by native module initialization")
    }
    _ClassDefinitionCtorConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ClassDefinitionCtorConst was not overloaded by native module initialization")
    }
    _ClassDefinitionHasPrivateMethodConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'ClassDefinitionHasPrivateMethodConst was not overloaded by native module initialization")
    }
    _ClassDefinitionHasComputedInstanceFieldConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'ClassDefinitionHasComputedInstanceFieldConst was not overloaded by native module initialization")
    }
    _ClassDefinitionHasMatchingPrivateKeyConst(context: KNativePointer, receiver: KNativePointer, name: KStringPtr): KBoolean {
        throw new Error("'ClassDefinitionHasMatchingPrivateKeyConst was not overloaded by native module initialization")
    }
    _ClassDefinitionAnnotations(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ClassDefinitionAnnotations was not overloaded by native module initialization")
    }
    _ClassDefinitionAnnotationsConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ClassDefinitionAnnotationsConst was not overloaded by native module initialization")
    }
    _ClassDefinitionSetAnnotations(context: KNativePointer, receiver: KNativePointer, annotations: BigUint64Array, annotationsSequenceLength: KUInt): void {
        throw new Error("'ClassDefinitionSetAnnotations was not overloaded by native module initialization")
    }
    _CreateArrayExpression(context: KNativePointer, elements: BigUint64Array, elementsSequenceLength: KUInt): KNativePointer {
        throw new Error("'CreateArrayExpression was not overloaded by native module initialization")
    }
    _UpdateArrayExpression(context: KNativePointer, original: KNativePointer, elements: BigUint64Array, elementsSequenceLength: KUInt): KNativePointer {
        throw new Error("'UpdateArrayExpression was not overloaded by native module initialization")
    }
    _CreateArrayExpression1(context: KNativePointer, nodeType: KInt, elements: BigUint64Array, elementsSequenceLength: KUInt, trailingComma: KBoolean): KNativePointer {
        throw new Error("'CreateArrayExpression1 was not overloaded by native module initialization")
    }
    _UpdateArrayExpression1(context: KNativePointer, original: KNativePointer, nodeType: KInt, elements: BigUint64Array, elementsSequenceLength: KUInt, trailingComma: KBoolean): KNativePointer {
        throw new Error("'UpdateArrayExpression1 was not overloaded by native module initialization")
    }
    _ArrayExpressionElementsConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ArrayExpressionElementsConst was not overloaded by native module initialization")
    }
    _ArrayExpressionElements(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ArrayExpressionElements was not overloaded by native module initialization")
    }
    _ArrayExpressionSetElements(context: KNativePointer, receiver: KNativePointer, elements: BigUint64Array, elementsSequenceLength: KUInt): void {
        throw new Error("'ArrayExpressionSetElements was not overloaded by native module initialization")
    }
    _ArrayExpressionIsDeclarationConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'ArrayExpressionIsDeclarationConst was not overloaded by native module initialization")
    }
    _ArrayExpressionIsOptionalConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'ArrayExpressionIsOptionalConst was not overloaded by native module initialization")
    }
    _ArrayExpressionSetDeclaration(context: KNativePointer, receiver: KNativePointer): void {
        throw new Error("'ArrayExpressionSetDeclaration was not overloaded by native module initialization")
    }
    _ArrayExpressionSetOptional(context: KNativePointer, receiver: KNativePointer, optional_arg: KBoolean): void {
        throw new Error("'ArrayExpressionSetOptional was not overloaded by native module initialization")
    }
    _ArrayExpressionDecoratorsConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ArrayExpressionDecoratorsConst was not overloaded by native module initialization")
    }
    _ArrayExpressionConvertibleToArrayPattern(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'ArrayExpressionConvertibleToArrayPattern was not overloaded by native module initialization")
    }
    _ArrayExpressionValidateExpression(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ArrayExpressionValidateExpression was not overloaded by native module initialization")
    }
    _ArrayExpressionHandleNestedArrayExpression(context: KNativePointer, receiver: KNativePointer, currentElement: KNativePointer, isPreferredTuple: KBoolean, idx: KUInt): KBoolean {
        throw new Error("'ArrayExpressionHandleNestedArrayExpression was not overloaded by native module initialization")
    }
    _ArrayExpressionTypeAnnotationConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ArrayExpressionTypeAnnotationConst was not overloaded by native module initialization")
    }
    _ArrayExpressionSetTsTypeAnnotation(context: KNativePointer, receiver: KNativePointer, typeAnnotation: KNativePointer): void {
        throw new Error("'ArrayExpressionSetTsTypeAnnotation was not overloaded by native module initialization")
    }
    _CreateTSInterfaceBody(context: KNativePointer, body: BigUint64Array, bodySequenceLength: KUInt): KNativePointer {
        throw new Error("'CreateTSInterfaceBody was not overloaded by native module initialization")
    }
    _UpdateTSInterfaceBody(context: KNativePointer, original: KNativePointer, body: BigUint64Array, bodySequenceLength: KUInt): KNativePointer {
        throw new Error("'UpdateTSInterfaceBody was not overloaded by native module initialization")
    }
    _TSInterfaceBodyBodyPtr(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSInterfaceBodyBodyPtr was not overloaded by native module initialization")
    }
    _TSInterfaceBodyBody(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSInterfaceBodyBody was not overloaded by native module initialization")
    }
    _TSInterfaceBodyBodyConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSInterfaceBodyBodyConst was not overloaded by native module initialization")
    }
    _CreateTSTypeQuery(context: KNativePointer, exprName: KNativePointer): KNativePointer {
        throw new Error("'CreateTSTypeQuery was not overloaded by native module initialization")
    }
    _UpdateTSTypeQuery(context: KNativePointer, original: KNativePointer, exprName: KNativePointer): KNativePointer {
        throw new Error("'UpdateTSTypeQuery was not overloaded by native module initialization")
    }
    _TSTypeQueryExprNameConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSTypeQueryExprNameConst was not overloaded by native module initialization")
    }
    _CreateTSBigintKeyword(context: KNativePointer): KNativePointer {
        throw new Error("'CreateTSBigintKeyword was not overloaded by native module initialization")
    }
    _UpdateTSBigintKeyword(context: KNativePointer, original: KNativePointer): KNativePointer {
        throw new Error("'UpdateTSBigintKeyword was not overloaded by native module initialization")
    }
    _CreateProperty(context: KNativePointer, key: KNativePointer, value: KNativePointer): KNativePointer {
        throw new Error("'CreateProperty was not overloaded by native module initialization")
    }
    _UpdateProperty(context: KNativePointer, original: KNativePointer, key: KNativePointer, value: KNativePointer): KNativePointer {
        throw new Error("'UpdateProperty was not overloaded by native module initialization")
    }
    _CreateProperty1(context: KNativePointer, kind: KInt, key: KNativePointer, value: KNativePointer, isMethod: KBoolean, isComputed: KBoolean): KNativePointer {
        throw new Error("'CreateProperty1 was not overloaded by native module initialization")
    }
    _UpdateProperty1(context: KNativePointer, original: KNativePointer, kind: KInt, key: KNativePointer, value: KNativePointer, isMethod: KBoolean, isComputed: KBoolean): KNativePointer {
        throw new Error("'UpdateProperty1 was not overloaded by native module initialization")
    }
    _PropertyKey(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'PropertyKey was not overloaded by native module initialization")
    }
    _PropertyKeyConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'PropertyKeyConst was not overloaded by native module initialization")
    }
    _PropertyValueConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'PropertyValueConst was not overloaded by native module initialization")
    }
    _PropertyValue(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'PropertyValue was not overloaded by native module initialization")
    }
    _PropertyKindConst(context: KNativePointer, receiver: KNativePointer): KInt {
        throw new Error("'PropertyKindConst was not overloaded by native module initialization")
    }
    _PropertyIsMethodConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'PropertyIsMethodConst was not overloaded by native module initialization")
    }
    _PropertyIsShorthandConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'PropertyIsShorthandConst was not overloaded by native module initialization")
    }
    _PropertyIsComputedConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'PropertyIsComputedConst was not overloaded by native module initialization")
    }
    _PropertyIsAccessorConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'PropertyIsAccessorConst was not overloaded by native module initialization")
    }
    _PropertyIsAccessorKind(context: KNativePointer, receiver: KNativePointer, kind: KInt): KBoolean {
        throw new Error("'PropertyIsAccessorKind was not overloaded by native module initialization")
    }
    _PropertyConvertibleToPatternProperty(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'PropertyConvertibleToPatternProperty was not overloaded by native module initialization")
    }
    _PropertyValidateExpression(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'PropertyValidateExpression was not overloaded by native module initialization")
    }
    _CreateVariableDeclarator(context: KNativePointer, flag: KInt, ident: KNativePointer): KNativePointer {
        throw new Error("'CreateVariableDeclarator was not overloaded by native module initialization")
    }
    _UpdateVariableDeclarator(context: KNativePointer, original: KNativePointer, flag: KInt, ident: KNativePointer): KNativePointer {
        throw new Error("'UpdateVariableDeclarator was not overloaded by native module initialization")
    }
    _CreateVariableDeclarator1(context: KNativePointer, flag: KInt, ident: KNativePointer, init: KNativePointer): KNativePointer {
        throw new Error("'CreateVariableDeclarator1 was not overloaded by native module initialization")
    }
    _UpdateVariableDeclarator1(context: KNativePointer, original: KNativePointer, flag: KInt, ident: KNativePointer, init: KNativePointer): KNativePointer {
        throw new Error("'UpdateVariableDeclarator1 was not overloaded by native module initialization")
    }
    _VariableDeclaratorInit(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'VariableDeclaratorInit was not overloaded by native module initialization")
    }
    _VariableDeclaratorInitConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'VariableDeclaratorInitConst was not overloaded by native module initialization")
    }
    _VariableDeclaratorSetInit(context: KNativePointer, receiver: KNativePointer, init: KNativePointer): void {
        throw new Error("'VariableDeclaratorSetInit was not overloaded by native module initialization")
    }
    _VariableDeclaratorId(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'VariableDeclaratorId was not overloaded by native module initialization")
    }
    _VariableDeclaratorIdConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'VariableDeclaratorIdConst was not overloaded by native module initialization")
    }
    _VariableDeclaratorFlag(context: KNativePointer, receiver: KNativePointer): KInt {
        throw new Error("'VariableDeclaratorFlag was not overloaded by native module initialization")
    }
    _CreateStringLiteral(context: KNativePointer): KNativePointer {
        throw new Error("'CreateStringLiteral was not overloaded by native module initialization")
    }
    _UpdateStringLiteral(context: KNativePointer, original: KNativePointer): KNativePointer {
        throw new Error("'UpdateStringLiteral was not overloaded by native module initialization")
    }
    _CreateStringLiteral1(context: KNativePointer, str: KStringPtr): KNativePointer {
        throw new Error("'CreateStringLiteral1 was not overloaded by native module initialization")
    }
    _UpdateStringLiteral1(context: KNativePointer, original: KNativePointer, str: KStringPtr): KNativePointer {
        throw new Error("'UpdateStringLiteral1 was not overloaded by native module initialization")
    }
    _StringLiteralStrConst(context: KNativePointer, receiver: KNativePointer): KStringPtr {
        throw new Error("'StringLiteralStrConst was not overloaded by native module initialization")
    }
    _CreateTSTypeAssertion(context: KNativePointer, typeAnnotation: KNativePointer, expression: KNativePointer): KNativePointer {
        throw new Error("'CreateTSTypeAssertion was not overloaded by native module initialization")
    }
    _UpdateTSTypeAssertion(context: KNativePointer, original: KNativePointer, typeAnnotation: KNativePointer, expression: KNativePointer): KNativePointer {
        throw new Error("'UpdateTSTypeAssertion was not overloaded by native module initialization")
    }
    _TSTypeAssertionGetExpressionConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSTypeAssertionGetExpressionConst was not overloaded by native module initialization")
    }
    _TSTypeAssertionTypeAnnotationConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSTypeAssertionTypeAnnotationConst was not overloaded by native module initialization")
    }
    _TSTypeAssertionSetTsTypeAnnotation(context: KNativePointer, receiver: KNativePointer, typeAnnotation: KNativePointer): void {
        throw new Error("'TSTypeAssertionSetTsTypeAnnotation was not overloaded by native module initialization")
    }
    _CreateTSExternalModuleReference(context: KNativePointer, expr: KNativePointer): KNativePointer {
        throw new Error("'CreateTSExternalModuleReference was not overloaded by native module initialization")
    }
    _UpdateTSExternalModuleReference(context: KNativePointer, original: KNativePointer, expr: KNativePointer): KNativePointer {
        throw new Error("'UpdateTSExternalModuleReference was not overloaded by native module initialization")
    }
    _TSExternalModuleReferenceExprConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSExternalModuleReferenceExprConst was not overloaded by native module initialization")
    }
    _CreateTSUndefinedKeyword(context: KNativePointer): KNativePointer {
        throw new Error("'CreateTSUndefinedKeyword was not overloaded by native module initialization")
    }
    _UpdateTSUndefinedKeyword(context: KNativePointer, original: KNativePointer): KNativePointer {
        throw new Error("'UpdateTSUndefinedKeyword was not overloaded by native module initialization")
    }
    _CreateETSTuple(context: KNativePointer): KNativePointer {
        throw new Error("'CreateETSTuple was not overloaded by native module initialization")
    }
    _UpdateETSTuple(context: KNativePointer, original: KNativePointer): KNativePointer {
        throw new Error("'UpdateETSTuple was not overloaded by native module initialization")
    }
    _CreateETSTuple1(context: KNativePointer, size: KUInt): KNativePointer {
        throw new Error("'CreateETSTuple1 was not overloaded by native module initialization")
    }
    _UpdateETSTuple1(context: KNativePointer, original: KNativePointer, size: KUInt): KNativePointer {
        throw new Error("'UpdateETSTuple1 was not overloaded by native module initialization")
    }
    _CreateETSTuple2(context: KNativePointer, typeList: BigUint64Array, typeListSequenceLength: KUInt): KNativePointer {
        throw new Error("'CreateETSTuple2 was not overloaded by native module initialization")
    }
    _UpdateETSTuple2(context: KNativePointer, original: KNativePointer, typeList: BigUint64Array, typeListSequenceLength: KUInt): KNativePointer {
        throw new Error("'UpdateETSTuple2 was not overloaded by native module initialization")
    }
    _ETSTupleGetTupleSizeConst(context: KNativePointer, receiver: KNativePointer): KUInt {
        throw new Error("'ETSTupleGetTupleSizeConst was not overloaded by native module initialization")
    }
    _ETSTupleGetTupleTypeAnnotationsListConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ETSTupleGetTupleTypeAnnotationsListConst was not overloaded by native module initialization")
    }
    _ETSTupleHasSpreadTypeConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'ETSTupleHasSpreadTypeConst was not overloaded by native module initialization")
    }
    _ETSTupleSetSpreadType(context: KNativePointer, receiver: KNativePointer, newSpreadType: KNativePointer): void {
        throw new Error("'ETSTupleSetSpreadType was not overloaded by native module initialization")
    }
    _ETSTupleSetTypeAnnotationsList(context: KNativePointer, receiver: KNativePointer, typeNodeList: BigUint64Array, typeNodeListSequenceLength: KUInt): void {
        throw new Error("'ETSTupleSetTypeAnnotationsList was not overloaded by native module initialization")
    }
    _TryStatementFinallyBlockConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TryStatementFinallyBlockConst was not overloaded by native module initialization")
    }
    _TryStatementBlockConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TryStatementBlockConst was not overloaded by native module initialization")
    }
    _TryStatementHasFinalizerConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'TryStatementHasFinalizerConst was not overloaded by native module initialization")
    }
    _TryStatementHasDefaultCatchClauseConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'TryStatementHasDefaultCatchClauseConst was not overloaded by native module initialization")
    }
    _TryStatementCatchClausesConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TryStatementCatchClausesConst was not overloaded by native module initialization")
    }
    _TryStatementFinallyCanCompleteNormallyConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'TryStatementFinallyCanCompleteNormallyConst was not overloaded by native module initialization")
    }
    _TryStatementSetFinallyCanCompleteNormally(context: KNativePointer, receiver: KNativePointer, finallyCanCompleteNormally: KBoolean): void {
        throw new Error("'TryStatementSetFinallyCanCompleteNormally was not overloaded by native module initialization")
    }
    _AstNodeIsProgramConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'AstNodeIsProgramConst was not overloaded by native module initialization")
    }
    _AstNodeIsStatementConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'AstNodeIsStatementConst was not overloaded by native module initialization")
    }
    _AstNodeIsExpressionConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'AstNodeIsExpressionConst was not overloaded by native module initialization")
    }
    _AstNodeIsTypedConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'AstNodeIsTypedConst was not overloaded by native module initialization")
    }
    _AstNodeAsTyped(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'AstNodeAsTyped was not overloaded by native module initialization")
    }
    _AstNodeAsTypedConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'AstNodeAsTypedConst was not overloaded by native module initialization")
    }
    _AstNodeIsBrokenStatementConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'AstNodeIsBrokenStatementConst was not overloaded by native module initialization")
    }
    _AstNodeAsExpression(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'AstNodeAsExpression was not overloaded by native module initialization")
    }
    _AstNodeAsExpressionConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'AstNodeAsExpressionConst was not overloaded by native module initialization")
    }
    _AstNodeAsStatement(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'AstNodeAsStatement was not overloaded by native module initialization")
    }
    _AstNodeAsStatementConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'AstNodeAsStatementConst was not overloaded by native module initialization")
    }
    _AstNodeTypeConst(context: KNativePointer, receiver: KNativePointer): KInt {
        throw new Error("'AstNodeTypeConst was not overloaded by native module initialization")
    }
    _AstNodeParent(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'AstNodeParent was not overloaded by native module initialization")
    }
    _AstNodeParentConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'AstNodeParentConst was not overloaded by native module initialization")
    }
    _AstNodeSetParent(context: KNativePointer, receiver: KNativePointer, parent: KNativePointer): void {
        throw new Error("'AstNodeSetParent was not overloaded by native module initialization")
    }
    _AstNodeDecoratorsPtrConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'AstNodeDecoratorsPtrConst was not overloaded by native module initialization")
    }
    _AstNodeAddDecorators(context: KNativePointer, receiver: KNativePointer, decorators: BigUint64Array, decoratorsSequenceLength: KUInt): void {
        throw new Error("'AstNodeAddDecorators was not overloaded by native module initialization")
    }
    _AstNodeCanHaveDecoratorConst(context: KNativePointer, receiver: KNativePointer, inTs: KBoolean): KBoolean {
        throw new Error("'AstNodeCanHaveDecoratorConst was not overloaded by native module initialization")
    }
    _AstNodeIsReadonlyConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'AstNodeIsReadonlyConst was not overloaded by native module initialization")
    }
    _AstNodeIsReadonlyTypeConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'AstNodeIsReadonlyTypeConst was not overloaded by native module initialization")
    }
    _AstNodeIsOptionalDeclarationConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'AstNodeIsOptionalDeclarationConst was not overloaded by native module initialization")
    }
    _AstNodeIsDefiniteConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'AstNodeIsDefiniteConst was not overloaded by native module initialization")
    }
    _AstNodeIsConstructorConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'AstNodeIsConstructorConst was not overloaded by native module initialization")
    }
    _AstNodeIsOverrideConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'AstNodeIsOverrideConst was not overloaded by native module initialization")
    }
    _AstNodeSetOverride(context: KNativePointer, receiver: KNativePointer): void {
        throw new Error("'AstNodeSetOverride was not overloaded by native module initialization")
    }
    _AstNodeIsAsyncConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'AstNodeIsAsyncConst was not overloaded by native module initialization")
    }
    _AstNodeIsSynchronizedConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'AstNodeIsSynchronizedConst was not overloaded by native module initialization")
    }
    _AstNodeIsNativeConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'AstNodeIsNativeConst was not overloaded by native module initialization")
    }
    _AstNodeIsConstConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'AstNodeIsConstConst was not overloaded by native module initialization")
    }
    _AstNodeIsStaticConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'AstNodeIsStaticConst was not overloaded by native module initialization")
    }
    _AstNodeIsFinalConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'AstNodeIsFinalConst was not overloaded by native module initialization")
    }
    _AstNodeIsAbstractConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'AstNodeIsAbstractConst was not overloaded by native module initialization")
    }
    _AstNodeIsPublicConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'AstNodeIsPublicConst was not overloaded by native module initialization")
    }
    _AstNodeIsProtectedConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'AstNodeIsProtectedConst was not overloaded by native module initialization")
    }
    _AstNodeIsPrivateConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'AstNodeIsPrivateConst was not overloaded by native module initialization")
    }
    _AstNodeIsInternalConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'AstNodeIsInternalConst was not overloaded by native module initialization")
    }
    _AstNodeIsExportedConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'AstNodeIsExportedConst was not overloaded by native module initialization")
    }
    _AstNodeIsDefaultExportedConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'AstNodeIsDefaultExportedConst was not overloaded by native module initialization")
    }
    _AstNodeIsExportedTypeConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'AstNodeIsExportedTypeConst was not overloaded by native module initialization")
    }
    _AstNodeIsDeclareConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'AstNodeIsDeclareConst was not overloaded by native module initialization")
    }
    _AstNodeIsInConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'AstNodeIsInConst was not overloaded by native module initialization")
    }
    _AstNodeIsOutConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'AstNodeIsOutConst was not overloaded by native module initialization")
    }
    _AstNodeIsSetterConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'AstNodeIsSetterConst was not overloaded by native module initialization")
    }
    _AstNodeAddModifier(context: KNativePointer, receiver: KNativePointer, flags: KInt): void {
        throw new Error("'AstNodeAddModifier was not overloaded by native module initialization")
    }
    _AstNodeClearModifier(context: KNativePointer, receiver: KNativePointer, flags: KInt): void {
        throw new Error("'AstNodeClearModifier was not overloaded by native module initialization")
    }
    _AstNodeModifiers(context: KNativePointer, receiver: KNativePointer): KInt {
        throw new Error("'AstNodeModifiers was not overloaded by native module initialization")
    }
    _AstNodeModifiersConst(context: KNativePointer, receiver: KNativePointer): KInt {
        throw new Error("'AstNodeModifiersConst was not overloaded by native module initialization")
    }
    _AstNodeHasExportAliasConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'AstNodeHasExportAliasConst was not overloaded by native module initialization")
    }
    _AstNodeAsClassElement(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'AstNodeAsClassElement was not overloaded by native module initialization")
    }
    _AstNodeAsClassElementConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'AstNodeAsClassElementConst was not overloaded by native module initialization")
    }
    _AstNodeIsScopeBearerConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'AstNodeIsScopeBearerConst was not overloaded by native module initialization")
    }
    _AstNodeClearScope(context: KNativePointer, receiver: KNativePointer): void {
        throw new Error("'AstNodeClearScope was not overloaded by native module initialization")
    }
    _AstNodeGetTopStatement(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'AstNodeGetTopStatement was not overloaded by native module initialization")
    }
    _AstNodeGetTopStatementConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'AstNodeGetTopStatementConst was not overloaded by native module initialization")
    }
    _AstNodeClone(context: KNativePointer, receiver: KNativePointer, parent: KNativePointer): KNativePointer {
        throw new Error("'AstNodeClone was not overloaded by native module initialization")
    }
    _AstNodeDumpJSONConst(context: KNativePointer, receiver: KNativePointer): KStringPtr {
        throw new Error("'AstNodeDumpJSONConst was not overloaded by native module initialization")
    }
    _AstNodeDumpEtsSrcConst(context: KNativePointer, receiver: KNativePointer): KStringPtr {
        throw new Error("'AstNodeDumpEtsSrcConst was not overloaded by native module initialization")
    }
    _AstNodeDumpConst(context: KNativePointer, receiver: KNativePointer, dumper: KNativePointer): void {
        throw new Error("'AstNodeDumpConst was not overloaded by native module initialization")
    }
    _AstNodeDumpConst1(context: KNativePointer, receiver: KNativePointer, dumper: KNativePointer): void {
        throw new Error("'AstNodeDumpConst1 was not overloaded by native module initialization")
    }
    _AstNodeSetTransformedNode(context: KNativePointer, receiver: KNativePointer, transformationName: KStringPtr, transformedNode: KNativePointer): void {
        throw new Error("'AstNodeSetTransformedNode was not overloaded by native module initialization")
    }
    _AstNodeSetOriginalNode(context: KNativePointer, receiver: KNativePointer, originalNode: KNativePointer): void {
        throw new Error("'AstNodeSetOriginalNode was not overloaded by native module initialization")
    }
    _AstNodeOriginalNodeConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'AstNodeOriginalNodeConst was not overloaded by native module initialization")
    }
    _CreateUnaryExpression(context: KNativePointer, argument: KNativePointer, unaryOperator: KInt): KNativePointer {
        throw new Error("'CreateUnaryExpression was not overloaded by native module initialization")
    }
    _UpdateUnaryExpression(context: KNativePointer, original: KNativePointer, argument: KNativePointer, unaryOperator: KInt): KNativePointer {
        throw new Error("'UpdateUnaryExpression was not overloaded by native module initialization")
    }
    _UnaryExpressionOperatorTypeConst(context: KNativePointer, receiver: KNativePointer): KInt {
        throw new Error("'UnaryExpressionOperatorTypeConst was not overloaded by native module initialization")
    }
    _UnaryExpressionArgument(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'UnaryExpressionArgument was not overloaded by native module initialization")
    }
    _UnaryExpressionArgumentConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'UnaryExpressionArgumentConst was not overloaded by native module initialization")
    }
    _CreateForInStatement(context: KNativePointer, left: KNativePointer, right: KNativePointer, body: KNativePointer): KNativePointer {
        throw new Error("'CreateForInStatement was not overloaded by native module initialization")
    }
    _UpdateForInStatement(context: KNativePointer, original: KNativePointer, left: KNativePointer, right: KNativePointer, body: KNativePointer): KNativePointer {
        throw new Error("'UpdateForInStatement was not overloaded by native module initialization")
    }
    _ForInStatementLeft(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ForInStatementLeft was not overloaded by native module initialization")
    }
    _ForInStatementLeftConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ForInStatementLeftConst was not overloaded by native module initialization")
    }
    _ForInStatementRight(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ForInStatementRight was not overloaded by native module initialization")
    }
    _ForInStatementRightConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ForInStatementRightConst was not overloaded by native module initialization")
    }
    _ForInStatementBody(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ForInStatementBody was not overloaded by native module initialization")
    }
    _ForInStatementBodyConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ForInStatementBodyConst was not overloaded by native module initialization")
    }
    _CreateThisExpression(context: KNativePointer): KNativePointer {
        throw new Error("'CreateThisExpression was not overloaded by native module initialization")
    }
    _UpdateThisExpression(context: KNativePointer, original: KNativePointer): KNativePointer {
        throw new Error("'UpdateThisExpression was not overloaded by native module initialization")
    }
    _CreateTSMethodSignature(context: KNativePointer, key: KNativePointer, signature: KNativePointer, computed: KBoolean, optional_arg: KBoolean): KNativePointer {
        throw new Error("'CreateTSMethodSignature was not overloaded by native module initialization")
    }
    _UpdateTSMethodSignature(context: KNativePointer, original: KNativePointer, key: KNativePointer, signature: KNativePointer, computed: KBoolean, optional_arg: KBoolean): KNativePointer {
        throw new Error("'UpdateTSMethodSignature was not overloaded by native module initialization")
    }
    _TSMethodSignatureKeyConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSMethodSignatureKeyConst was not overloaded by native module initialization")
    }
    _TSMethodSignatureKey(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSMethodSignatureKey was not overloaded by native module initialization")
    }
    _TSMethodSignatureTypeParamsConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSMethodSignatureTypeParamsConst was not overloaded by native module initialization")
    }
    _TSMethodSignatureTypeParams(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSMethodSignatureTypeParams was not overloaded by native module initialization")
    }
    _TSMethodSignatureParamsConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSMethodSignatureParamsConst was not overloaded by native module initialization")
    }
    _TSMethodSignatureReturnTypeAnnotationConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSMethodSignatureReturnTypeAnnotationConst was not overloaded by native module initialization")
    }
    _TSMethodSignatureReturnTypeAnnotation(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSMethodSignatureReturnTypeAnnotation was not overloaded by native module initialization")
    }
    _TSMethodSignatureComputedConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'TSMethodSignatureComputedConst was not overloaded by native module initialization")
    }
    _TSMethodSignatureOptionalConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'TSMethodSignatureOptionalConst was not overloaded by native module initialization")
    }
    _CreateBinaryExpression(context: KNativePointer, left: KNativePointer, right: KNativePointer, operatorType: KInt): KNativePointer {
        throw new Error("'CreateBinaryExpression was not overloaded by native module initialization")
    }
    _UpdateBinaryExpression(context: KNativePointer, original: KNativePointer, left: KNativePointer, right: KNativePointer, operatorType: KInt): KNativePointer {
        throw new Error("'UpdateBinaryExpression was not overloaded by native module initialization")
    }
    _BinaryExpressionLeftConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'BinaryExpressionLeftConst was not overloaded by native module initialization")
    }
    _BinaryExpressionLeft(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'BinaryExpressionLeft was not overloaded by native module initialization")
    }
    _BinaryExpressionRightConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'BinaryExpressionRightConst was not overloaded by native module initialization")
    }
    _BinaryExpressionRight(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'BinaryExpressionRight was not overloaded by native module initialization")
    }
    _BinaryExpressionResultConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'BinaryExpressionResultConst was not overloaded by native module initialization")
    }
    _BinaryExpressionResult(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'BinaryExpressionResult was not overloaded by native module initialization")
    }
    _BinaryExpressionOperatorTypeConst(context: KNativePointer, receiver: KNativePointer): KInt {
        throw new Error("'BinaryExpressionOperatorTypeConst was not overloaded by native module initialization")
    }
    _BinaryExpressionIsLogicalConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'BinaryExpressionIsLogicalConst was not overloaded by native module initialization")
    }
    _BinaryExpressionIsLogicalExtendedConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'BinaryExpressionIsLogicalExtendedConst was not overloaded by native module initialization")
    }
    _BinaryExpressionIsBitwiseConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'BinaryExpressionIsBitwiseConst was not overloaded by native module initialization")
    }
    _BinaryExpressionIsArithmeticConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'BinaryExpressionIsArithmeticConst was not overloaded by native module initialization")
    }
    _BinaryExpressionSetLeft(context: KNativePointer, receiver: KNativePointer, expr: KNativePointer): void {
        throw new Error("'BinaryExpressionSetLeft was not overloaded by native module initialization")
    }
    _BinaryExpressionSetRight(context: KNativePointer, receiver: KNativePointer, expr: KNativePointer): void {
        throw new Error("'BinaryExpressionSetRight was not overloaded by native module initialization")
    }
    _BinaryExpressionSetResult(context: KNativePointer, receiver: KNativePointer, expr: KNativePointer): void {
        throw new Error("'BinaryExpressionSetResult was not overloaded by native module initialization")
    }
    _BinaryExpressionSetOperator(context: KNativePointer, receiver: KNativePointer, operatorType: KInt): void {
        throw new Error("'BinaryExpressionSetOperator was not overloaded by native module initialization")
    }
    _CreateSuperExpression(context: KNativePointer): KNativePointer {
        throw new Error("'CreateSuperExpression was not overloaded by native module initialization")
    }
    _UpdateSuperExpression(context: KNativePointer, original: KNativePointer): KNativePointer {
        throw new Error("'UpdateSuperExpression was not overloaded by native module initialization")
    }
    _CreateAssertStatement(context: KNativePointer, test: KNativePointer, second: KNativePointer): KNativePointer {
        throw new Error("'CreateAssertStatement was not overloaded by native module initialization")
    }
    _UpdateAssertStatement(context: KNativePointer, original: KNativePointer, test: KNativePointer, second: KNativePointer): KNativePointer {
        throw new Error("'UpdateAssertStatement was not overloaded by native module initialization")
    }
    _AssertStatementTestConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'AssertStatementTestConst was not overloaded by native module initialization")
    }
    _AssertStatementTest(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'AssertStatementTest was not overloaded by native module initialization")
    }
    _AssertStatementSecondConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'AssertStatementSecondConst was not overloaded by native module initialization")
    }
    _CreateTSStringKeyword(context: KNativePointer): KNativePointer {
        throw new Error("'CreateTSStringKeyword was not overloaded by native module initialization")
    }
    _UpdateTSStringKeyword(context: KNativePointer, original: KNativePointer): KNativePointer {
        throw new Error("'UpdateTSStringKeyword was not overloaded by native module initialization")
    }
    _CreateAssignmentExpression(context: KNativePointer, left: KNativePointer, right: KNativePointer, assignmentOperator: KInt): KNativePointer {
        throw new Error("'CreateAssignmentExpression was not overloaded by native module initialization")
    }
    _UpdateAssignmentExpression(context: KNativePointer, original: KNativePointer, left: KNativePointer, right: KNativePointer, assignmentOperator: KInt): KNativePointer {
        throw new Error("'UpdateAssignmentExpression was not overloaded by native module initialization")
    }
    _CreateAssignmentExpression1(context: KNativePointer, type: KInt, left: KNativePointer, right: KNativePointer, assignmentOperator: KInt): KNativePointer {
        throw new Error("'CreateAssignmentExpression1 was not overloaded by native module initialization")
    }
    _UpdateAssignmentExpression1(context: KNativePointer, original: KNativePointer, type: KInt, left: KNativePointer, right: KNativePointer, assignmentOperator: KInt): KNativePointer {
        throw new Error("'UpdateAssignmentExpression1 was not overloaded by native module initialization")
    }
    _AssignmentExpressionLeftConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'AssignmentExpressionLeftConst was not overloaded by native module initialization")
    }
    _AssignmentExpressionLeft(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'AssignmentExpressionLeft was not overloaded by native module initialization")
    }
    _AssignmentExpressionRight(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'AssignmentExpressionRight was not overloaded by native module initialization")
    }
    _AssignmentExpressionRightConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'AssignmentExpressionRightConst was not overloaded by native module initialization")
    }
    _AssignmentExpressionSetRight(context: KNativePointer, receiver: KNativePointer, expr: KNativePointer): void {
        throw new Error("'AssignmentExpressionSetRight was not overloaded by native module initialization")
    }
    _AssignmentExpressionSetLeft(context: KNativePointer, receiver: KNativePointer, expr: KNativePointer): void {
        throw new Error("'AssignmentExpressionSetLeft was not overloaded by native module initialization")
    }
    _AssignmentExpressionResultConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'AssignmentExpressionResultConst was not overloaded by native module initialization")
    }
    _AssignmentExpressionResult(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'AssignmentExpressionResult was not overloaded by native module initialization")
    }
    _AssignmentExpressionOperatorTypeConst(context: KNativePointer, receiver: KNativePointer): KInt {
        throw new Error("'AssignmentExpressionOperatorTypeConst was not overloaded by native module initialization")
    }
    _AssignmentExpressionSetOperatorType(context: KNativePointer, receiver: KNativePointer, tokenType: KInt): KInt {
        throw new Error("'AssignmentExpressionSetOperatorType was not overloaded by native module initialization")
    }
    _AssignmentExpressionSetResult(context: KNativePointer, receiver: KNativePointer, expr: KNativePointer): void {
        throw new Error("'AssignmentExpressionSetResult was not overloaded by native module initialization")
    }
    _AssignmentExpressionIsLogicalExtendedConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'AssignmentExpressionIsLogicalExtendedConst was not overloaded by native module initialization")
    }
    _AssignmentExpressionSetIgnoreConstAssign(context: KNativePointer, receiver: KNativePointer): void {
        throw new Error("'AssignmentExpressionSetIgnoreConstAssign was not overloaded by native module initialization")
    }
    _AssignmentExpressionIsIgnoreConstAssignConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'AssignmentExpressionIsIgnoreConstAssignConst was not overloaded by native module initialization")
    }
    _AssignmentExpressionConvertibleToAssignmentPatternLeft(context: KNativePointer, receiver: KNativePointer, mustBePattern: KBoolean): KBoolean {
        throw new Error("'AssignmentExpressionConvertibleToAssignmentPatternLeft was not overloaded by native module initialization")
    }
    _AssignmentExpressionConvertibleToAssignmentPatternRight(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'AssignmentExpressionConvertibleToAssignmentPatternRight was not overloaded by native module initialization")
    }
    _AssignmentExpressionConvertibleToAssignmentPattern(context: KNativePointer, receiver: KNativePointer, mustBePattern: KBoolean): KBoolean {
        throw new Error("'AssignmentExpressionConvertibleToAssignmentPattern was not overloaded by native module initialization")
    }
    _CreateExpressionStatement(context: KNativePointer, expr: KNativePointer): KNativePointer {
        throw new Error("'CreateExpressionStatement was not overloaded by native module initialization")
    }
    _UpdateExpressionStatement(context: KNativePointer, original: KNativePointer, expr: KNativePointer): KNativePointer {
        throw new Error("'UpdateExpressionStatement was not overloaded by native module initialization")
    }
    _ExpressionStatementGetExpressionConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ExpressionStatementGetExpressionConst was not overloaded by native module initialization")
    }
    _ExpressionStatementGetExpression(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ExpressionStatementGetExpression was not overloaded by native module initialization")
    }
    _ExpressionStatementSetExpression(context: KNativePointer, receiver: KNativePointer, expr: KNativePointer): void {
        throw new Error("'ExpressionStatementSetExpression was not overloaded by native module initialization")
    }
    _ETSModuleIdent(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ETSModuleIdent was not overloaded by native module initialization")
    }
    _ETSModuleIdentConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ETSModuleIdentConst was not overloaded by native module initialization")
    }
    _ETSModuleIsETSScriptConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'ETSModuleIsETSScriptConst was not overloaded by native module initialization")
    }
    _ETSModuleIsNamespaceConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'ETSModuleIsNamespaceConst was not overloaded by native module initialization")
    }
    _ETSModuleIsNamespaceChainLastNodeConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'ETSModuleIsNamespaceChainLastNodeConst was not overloaded by native module initialization")
    }
    _ETSModuleSetNamespaceChainLastNode(context: KNativePointer, receiver: KNativePointer): void {
        throw new Error("'ETSModuleSetNamespaceChainLastNode was not overloaded by native module initialization")
    }
    _ETSModuleAnnotations(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ETSModuleAnnotations was not overloaded by native module initialization")
    }
    _ETSModuleAnnotationsConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ETSModuleAnnotationsConst was not overloaded by native module initialization")
    }
    _ETSModuleSetAnnotations(context: KNativePointer, receiver: KNativePointer, annotations: BigUint64Array, annotationsSequenceLength: KUInt): void {
        throw new Error("'ETSModuleSetAnnotations was not overloaded by native module initialization")
    }
    _CreateMetaProperty(context: KNativePointer, kind: KInt): KNativePointer {
        throw new Error("'CreateMetaProperty was not overloaded by native module initialization")
    }
    _UpdateMetaProperty(context: KNativePointer, original: KNativePointer, kind: KInt): KNativePointer {
        throw new Error("'UpdateMetaProperty was not overloaded by native module initialization")
    }
    _MetaPropertyKindConst(context: KNativePointer, receiver: KNativePointer): KInt {
        throw new Error("'MetaPropertyKindConst was not overloaded by native module initialization")
    }
    _CreateTSArrayType(context: KNativePointer, elementType: KNativePointer): KNativePointer {
        throw new Error("'CreateTSArrayType was not overloaded by native module initialization")
    }
    _UpdateTSArrayType(context: KNativePointer, original: KNativePointer, elementType: KNativePointer): KNativePointer {
        throw new Error("'UpdateTSArrayType was not overloaded by native module initialization")
    }
    _TSArrayTypeElementTypeConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSArrayTypeElementTypeConst was not overloaded by native module initialization")
    }
    _CreateTSSignatureDeclaration(context: KNativePointer, kind: KInt, signature: KNativePointer): KNativePointer {
        throw new Error("'CreateTSSignatureDeclaration was not overloaded by native module initialization")
    }
    _UpdateTSSignatureDeclaration(context: KNativePointer, original: KNativePointer, kind: KInt, signature: KNativePointer): KNativePointer {
        throw new Error("'UpdateTSSignatureDeclaration was not overloaded by native module initialization")
    }
    _TSSignatureDeclarationTypeParamsConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSSignatureDeclarationTypeParamsConst was not overloaded by native module initialization")
    }
    _TSSignatureDeclarationTypeParams(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSSignatureDeclarationTypeParams was not overloaded by native module initialization")
    }
    _TSSignatureDeclarationParamsConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSSignatureDeclarationParamsConst was not overloaded by native module initialization")
    }
    _TSSignatureDeclarationReturnTypeAnnotationConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSSignatureDeclarationReturnTypeAnnotationConst was not overloaded by native module initialization")
    }
    _TSSignatureDeclarationReturnTypeAnnotation(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSSignatureDeclarationReturnTypeAnnotation was not overloaded by native module initialization")
    }
    _TSSignatureDeclarationKindConst(context: KNativePointer, receiver: KNativePointer): KInt {
        throw new Error("'TSSignatureDeclarationKindConst was not overloaded by native module initialization")
    }
    _CreateExportAllDeclaration(context: KNativePointer, source: KNativePointer, exported: KNativePointer): KNativePointer {
        throw new Error("'CreateExportAllDeclaration was not overloaded by native module initialization")
    }
    _UpdateExportAllDeclaration(context: KNativePointer, original: KNativePointer, source: KNativePointer, exported: KNativePointer): KNativePointer {
        throw new Error("'UpdateExportAllDeclaration was not overloaded by native module initialization")
    }
    _ExportAllDeclarationSourceConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ExportAllDeclarationSourceConst was not overloaded by native module initialization")
    }
    _ExportAllDeclarationExportedConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ExportAllDeclarationExportedConst was not overloaded by native module initialization")
    }
    _CreateExportSpecifier(context: KNativePointer, local: KNativePointer, exported: KNativePointer): KNativePointer {
        throw new Error("'CreateExportSpecifier was not overloaded by native module initialization")
    }
    _UpdateExportSpecifier(context: KNativePointer, original: KNativePointer, local: KNativePointer, exported: KNativePointer): KNativePointer {
        throw new Error("'UpdateExportSpecifier was not overloaded by native module initialization")
    }
    _ExportSpecifierLocalConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ExportSpecifierLocalConst was not overloaded by native module initialization")
    }
    _ExportSpecifierExportedConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ExportSpecifierExportedConst was not overloaded by native module initialization")
    }
    _CreateTSTupleType(context: KNativePointer, elementTypes: BigUint64Array, elementTypesSequenceLength: KUInt): KNativePointer {
        throw new Error("'CreateTSTupleType was not overloaded by native module initialization")
    }
    _UpdateTSTupleType(context: KNativePointer, original: KNativePointer, elementTypes: BigUint64Array, elementTypesSequenceLength: KUInt): KNativePointer {
        throw new Error("'UpdateTSTupleType was not overloaded by native module initialization")
    }
    _TSTupleTypeElementTypeConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSTupleTypeElementTypeConst was not overloaded by native module initialization")
    }
    _CreateFunctionExpression(context: KNativePointer, func: KNativePointer): KNativePointer {
        throw new Error("'CreateFunctionExpression was not overloaded by native module initialization")
    }
    _UpdateFunctionExpression(context: KNativePointer, original: KNativePointer, func: KNativePointer): KNativePointer {
        throw new Error("'UpdateFunctionExpression was not overloaded by native module initialization")
    }
    _CreateFunctionExpression1(context: KNativePointer, namedExpr: KNativePointer, func: KNativePointer): KNativePointer {
        throw new Error("'CreateFunctionExpression1 was not overloaded by native module initialization")
    }
    _UpdateFunctionExpression1(context: KNativePointer, original: KNativePointer, namedExpr: KNativePointer, func: KNativePointer): KNativePointer {
        throw new Error("'UpdateFunctionExpression1 was not overloaded by native module initialization")
    }
    _FunctionExpressionFunctionConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'FunctionExpressionFunctionConst was not overloaded by native module initialization")
    }
    _FunctionExpressionFunction(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'FunctionExpressionFunction was not overloaded by native module initialization")
    }
    _FunctionExpressionIsAnonymousConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'FunctionExpressionIsAnonymousConst was not overloaded by native module initialization")
    }
    _FunctionExpressionId(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'FunctionExpressionId was not overloaded by native module initialization")
    }
    _CreateTSIndexSignature(context: KNativePointer, param: KNativePointer, typeAnnotation: KNativePointer, readonly_arg: KBoolean): KNativePointer {
        throw new Error("'CreateTSIndexSignature was not overloaded by native module initialization")
    }
    _UpdateTSIndexSignature(context: KNativePointer, original: KNativePointer, param: KNativePointer, typeAnnotation: KNativePointer, readonly_arg: KBoolean): KNativePointer {
        throw new Error("'UpdateTSIndexSignature was not overloaded by native module initialization")
    }
    _TSIndexSignatureParamConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSIndexSignatureParamConst was not overloaded by native module initialization")
    }
    _TSIndexSignatureTypeAnnotationConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSIndexSignatureTypeAnnotationConst was not overloaded by native module initialization")
    }
    _TSIndexSignatureReadonlyConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'TSIndexSignatureReadonlyConst was not overloaded by native module initialization")
    }
    _TSIndexSignatureKindConst(context: KNativePointer, receiver: KNativePointer): KInt {
        throw new Error("'TSIndexSignatureKindConst was not overloaded by native module initialization")
    }
    _CreateTSModuleDeclaration(context: KNativePointer, name: KNativePointer, body: KNativePointer, declare: KBoolean, _global: KBoolean): KNativePointer {
        throw new Error("'CreateTSModuleDeclaration was not overloaded by native module initialization")
    }
    _UpdateTSModuleDeclaration(context: KNativePointer, original: KNativePointer, name: KNativePointer, body: KNativePointer, declare: KBoolean, _global: KBoolean): KNativePointer {
        throw new Error("'UpdateTSModuleDeclaration was not overloaded by native module initialization")
    }
    _TSModuleDeclarationNameConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSModuleDeclarationNameConst was not overloaded by native module initialization")
    }
    _TSModuleDeclarationBodyConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSModuleDeclarationBodyConst was not overloaded by native module initialization")
    }
    _TSModuleDeclarationGlobalConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'TSModuleDeclarationGlobalConst was not overloaded by native module initialization")
    }
    _TSModuleDeclarationIsExternalOrAmbientConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'TSModuleDeclarationIsExternalOrAmbientConst was not overloaded by native module initialization")
    }
    _CreateImportDeclaration(context: KNativePointer, source: KNativePointer, specifiers: BigUint64Array, specifiersSequenceLength: KUInt, importKind: KInt): KNativePointer {
        throw new Error("'CreateImportDeclaration was not overloaded by native module initialization")
    }
    _UpdateImportDeclaration(context: KNativePointer, original: KNativePointer, source: KNativePointer, specifiers: BigUint64Array, specifiersSequenceLength: KUInt, importKind: KInt): KNativePointer {
        throw new Error("'UpdateImportDeclaration was not overloaded by native module initialization")
    }
    _ImportDeclarationSourceConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ImportDeclarationSourceConst was not overloaded by native module initialization")
    }
    _ImportDeclarationSource(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ImportDeclarationSource was not overloaded by native module initialization")
    }
    _ImportDeclarationSpecifiersConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ImportDeclarationSpecifiersConst was not overloaded by native module initialization")
    }
    _ImportDeclarationSpecifiers(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ImportDeclarationSpecifiers was not overloaded by native module initialization")
    }
    _ImportDeclarationIsTypeKindConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'ImportDeclarationIsTypeKindConst was not overloaded by native module initialization")
    }
    _CreateTSParenthesizedType(context: KNativePointer, type: KNativePointer): KNativePointer {
        throw new Error("'CreateTSParenthesizedType was not overloaded by native module initialization")
    }
    _UpdateTSParenthesizedType(context: KNativePointer, original: KNativePointer, type: KNativePointer): KNativePointer {
        throw new Error("'UpdateTSParenthesizedType was not overloaded by native module initialization")
    }
    _TSParenthesizedTypeTypeConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSParenthesizedTypeTypeConst was not overloaded by native module initialization")
    }
    _CreateCharLiteral(context: KNativePointer): KNativePointer {
        throw new Error("'CreateCharLiteral was not overloaded by native module initialization")
    }
    _UpdateCharLiteral(context: KNativePointer, original: KNativePointer): KNativePointer {
        throw new Error("'UpdateCharLiteral was not overloaded by native module initialization")
    }
    _CreateETSPackageDeclaration(context: KNativePointer, name: KNativePointer): KNativePointer {
        throw new Error("'CreateETSPackageDeclaration was not overloaded by native module initialization")
    }
    _UpdateETSPackageDeclaration(context: KNativePointer, original: KNativePointer, name: KNativePointer): KNativePointer {
        throw new Error("'UpdateETSPackageDeclaration was not overloaded by native module initialization")
    }
    _UpdateETSImportDeclaration(context: KNativePointer, original: KNativePointer, source: KNativePointer, specifiers: BigUint64Array, specifiersSequenceLength: KUInt, importKind: KInt): KNativePointer {
        throw new Error("'UpdateETSImportDeclaration was not overloaded by native module initialization")
    }
    _ETSImportDeclarationHasDeclConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'ETSImportDeclarationHasDeclConst was not overloaded by native module initialization")
    }
    _ETSImportDeclarationIsPureDynamicConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'ETSImportDeclarationIsPureDynamicConst was not overloaded by native module initialization")
    }
    _ETSImportDeclarationAssemblerName(context: KNativePointer, receiver: KNativePointer): KStringPtr {
        throw new Error("'ETSImportDeclarationAssemblerName was not overloaded by native module initialization")
    }
    _ETSImportDeclarationAssemblerNameConst(context: KNativePointer, receiver: KNativePointer): KStringPtr {
        throw new Error("'ETSImportDeclarationAssemblerNameConst was not overloaded by native module initialization")
    }
    _ETSImportDeclarationSourceConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ETSImportDeclarationSourceConst was not overloaded by native module initialization")
    }
    _ETSImportDeclarationResolvedSource(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ETSImportDeclarationResolvedSource was not overloaded by native module initialization")
    }
    _ETSImportDeclarationResolvedSourceConst(context: KNativePointer, receiver: KNativePointer): KStringPtr {
        throw new Error("'ETSImportDeclarationResolvedSourceConst was not overloaded by native module initialization")
    }
    _CreateETSStructDeclaration(context: KNativePointer, def: KNativePointer): KNativePointer {
        throw new Error("'CreateETSStructDeclaration was not overloaded by native module initialization")
    }
    _UpdateETSStructDeclaration(context: KNativePointer, original: KNativePointer, def: KNativePointer): KNativePointer {
        throw new Error("'UpdateETSStructDeclaration was not overloaded by native module initialization")
    }
    _CreateTSModuleBlock(context: KNativePointer, statements: BigUint64Array, statementsSequenceLength: KUInt): KNativePointer {
        throw new Error("'CreateTSModuleBlock was not overloaded by native module initialization")
    }
    _UpdateTSModuleBlock(context: KNativePointer, original: KNativePointer, statements: BigUint64Array, statementsSequenceLength: KUInt): KNativePointer {
        throw new Error("'UpdateTSModuleBlock was not overloaded by native module initialization")
    }
    _TSModuleBlockStatementsConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSModuleBlockStatementsConst was not overloaded by native module initialization")
    }
    _CreateETSNewArrayInstanceExpression(context: KNativePointer, typeReference: KNativePointer, dimension: KNativePointer): KNativePointer {
        throw new Error("'CreateETSNewArrayInstanceExpression was not overloaded by native module initialization")
    }
    _UpdateETSNewArrayInstanceExpression(context: KNativePointer, original: KNativePointer, typeReference: KNativePointer, dimension: KNativePointer): KNativePointer {
        throw new Error("'UpdateETSNewArrayInstanceExpression was not overloaded by native module initialization")
    }
    _ETSNewArrayInstanceExpressionTypeReference(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ETSNewArrayInstanceExpressionTypeReference was not overloaded by native module initialization")
    }
    _ETSNewArrayInstanceExpressionTypeReferenceConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ETSNewArrayInstanceExpressionTypeReferenceConst was not overloaded by native module initialization")
    }
    _ETSNewArrayInstanceExpressionDimension(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ETSNewArrayInstanceExpressionDimension was not overloaded by native module initialization")
    }
    _ETSNewArrayInstanceExpressionDimensionConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ETSNewArrayInstanceExpressionDimensionConst was not overloaded by native module initialization")
    }
    _ETSNewArrayInstanceExpressionSetDimension(context: KNativePointer, receiver: KNativePointer, dimension: KNativePointer): void {
        throw new Error("'ETSNewArrayInstanceExpressionSetDimension was not overloaded by native module initialization")
    }
    _CreateAnnotationDeclaration(context: KNativePointer, expr: KNativePointer): KNativePointer {
        throw new Error("'CreateAnnotationDeclaration was not overloaded by native module initialization")
    }
    _UpdateAnnotationDeclaration(context: KNativePointer, original: KNativePointer, expr: KNativePointer): KNativePointer {
        throw new Error("'UpdateAnnotationDeclaration was not overloaded by native module initialization")
    }
    _CreateAnnotationDeclaration1(context: KNativePointer, expr: KNativePointer, properties: BigUint64Array, propertiesSequenceLength: KUInt): KNativePointer {
        throw new Error("'CreateAnnotationDeclaration1 was not overloaded by native module initialization")
    }
    _UpdateAnnotationDeclaration1(context: KNativePointer, original: KNativePointer, expr: KNativePointer, properties: BigUint64Array, propertiesSequenceLength: KUInt): KNativePointer {
        throw new Error("'UpdateAnnotationDeclaration1 was not overloaded by native module initialization")
    }
    _AnnotationDeclarationInternalNameConst(context: KNativePointer, receiver: KNativePointer): KStringPtr {
        throw new Error("'AnnotationDeclarationInternalNameConst was not overloaded by native module initialization")
    }
    _AnnotationDeclarationSetInternalName(context: KNativePointer, receiver: KNativePointer, internalName: KStringPtr): void {
        throw new Error("'AnnotationDeclarationSetInternalName was not overloaded by native module initialization")
    }
    _AnnotationDeclarationExprConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'AnnotationDeclarationExprConst was not overloaded by native module initialization")
    }
    _AnnotationDeclarationExpr(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'AnnotationDeclarationExpr was not overloaded by native module initialization")
    }
    _AnnotationDeclarationProperties(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'AnnotationDeclarationProperties was not overloaded by native module initialization")
    }
    _AnnotationDeclarationPropertiesConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'AnnotationDeclarationPropertiesConst was not overloaded by native module initialization")
    }
    _AnnotationDeclarationPropertiesPtrConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'AnnotationDeclarationPropertiesPtrConst was not overloaded by native module initialization")
    }
    _AnnotationDeclarationAddProperties(context: KNativePointer, receiver: KNativePointer, properties: BigUint64Array, propertiesSequenceLength: KUInt): void {
        throw new Error("'AnnotationDeclarationAddProperties was not overloaded by native module initialization")
    }
    _AnnotationDeclarationIsSourceRetentionConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'AnnotationDeclarationIsSourceRetentionConst was not overloaded by native module initialization")
    }
    _AnnotationDeclarationIsBytecodeRetentionConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'AnnotationDeclarationIsBytecodeRetentionConst was not overloaded by native module initialization")
    }
    _AnnotationDeclarationIsRuntimeRetentionConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'AnnotationDeclarationIsRuntimeRetentionConst was not overloaded by native module initialization")
    }
    _AnnotationDeclarationSetSourceRetention(context: KNativePointer, receiver: KNativePointer): void {
        throw new Error("'AnnotationDeclarationSetSourceRetention was not overloaded by native module initialization")
    }
    _AnnotationDeclarationSetBytecodeRetention(context: KNativePointer, receiver: KNativePointer): void {
        throw new Error("'AnnotationDeclarationSetBytecodeRetention was not overloaded by native module initialization")
    }
    _AnnotationDeclarationSetRuntimeRetention(context: KNativePointer, receiver: KNativePointer): void {
        throw new Error("'AnnotationDeclarationSetRuntimeRetention was not overloaded by native module initialization")
    }
    _AnnotationDeclarationGetBaseNameConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'AnnotationDeclarationGetBaseNameConst was not overloaded by native module initialization")
    }
    _AnnotationDeclarationAnnotations(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'AnnotationDeclarationAnnotations was not overloaded by native module initialization")
    }
    _AnnotationDeclarationAnnotationsConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'AnnotationDeclarationAnnotationsConst was not overloaded by native module initialization")
    }
    _AnnotationDeclarationSetAnnotations(context: KNativePointer, receiver: KNativePointer, annotations: BigUint64Array, annotationsSequenceLength: KUInt): void {
        throw new Error("'AnnotationDeclarationSetAnnotations was not overloaded by native module initialization")
    }
    _CreateAnnotationUsageIr(context: KNativePointer, expr: KNativePointer): KNativePointer {
        throw new Error("'CreateAnnotationUsageIr was not overloaded by native module initialization")
    }
    _UpdateAnnotationUsageIr(context: KNativePointer, original: KNativePointer, expr: KNativePointer): KNativePointer {
        throw new Error("'UpdateAnnotationUsageIr was not overloaded by native module initialization")
    }
    _CreateAnnotationUsageIr1(context: KNativePointer, expr: KNativePointer, properties: BigUint64Array, propertiesSequenceLength: KUInt): KNativePointer {
        throw new Error("'CreateAnnotationUsageIr1 was not overloaded by native module initialization")
    }
    _UpdateAnnotationUsageIr1(context: KNativePointer, original: KNativePointer, expr: KNativePointer, properties: BigUint64Array, propertiesSequenceLength: KUInt): KNativePointer {
        throw new Error("'UpdateAnnotationUsageIr1 was not overloaded by native module initialization")
    }
    _AnnotationUsageIrExpr(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'AnnotationUsageIrExpr was not overloaded by native module initialization")
    }
    _AnnotationUsageIrProperties(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'AnnotationUsageIrProperties was not overloaded by native module initialization")
    }
    _AnnotationUsageIrPropertiesConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'AnnotationUsageIrPropertiesConst was not overloaded by native module initialization")
    }
    _AnnotationUsageIrPropertiesPtrConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'AnnotationUsageIrPropertiesPtrConst was not overloaded by native module initialization")
    }
    _AnnotationUsageIrAddProperty(context: KNativePointer, receiver: KNativePointer, property: KNativePointer): void {
        throw new Error("'AnnotationUsageIrAddProperty was not overloaded by native module initialization")
    }
    _AnnotationUsageIrSetProperties(context: KNativePointer, receiver: KNativePointer, properties: BigUint64Array, propertiesSequenceLength: KUInt): void {
        throw new Error("'AnnotationUsageIrSetProperties was not overloaded by native module initialization")
    }
    _AnnotationUsageIrGetBaseNameConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'AnnotationUsageIrGetBaseNameConst was not overloaded by native module initialization")
    }
    _CreateEmptyStatement(context: KNativePointer): KNativePointer {
        throw new Error("'CreateEmptyStatement was not overloaded by native module initialization")
    }
    _UpdateEmptyStatement(context: KNativePointer, original: KNativePointer): KNativePointer {
        throw new Error("'UpdateEmptyStatement was not overloaded by native module initialization")
    }
    _CreateWhileStatement(context: KNativePointer, test: KNativePointer, body: KNativePointer): KNativePointer {
        throw new Error("'CreateWhileStatement was not overloaded by native module initialization")
    }
    _UpdateWhileStatement(context: KNativePointer, original: KNativePointer, test: KNativePointer, body: KNativePointer): KNativePointer {
        throw new Error("'UpdateWhileStatement was not overloaded by native module initialization")
    }
    _WhileStatementTestConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'WhileStatementTestConst was not overloaded by native module initialization")
    }
    _WhileStatementTest(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'WhileStatementTest was not overloaded by native module initialization")
    }
    _WhileStatementBodyConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'WhileStatementBodyConst was not overloaded by native module initialization")
    }
    _WhileStatementBody(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'WhileStatementBody was not overloaded by native module initialization")
    }
    _CreateFunctionSignature(context: KNativePointer, typeParams: KNativePointer, params: BigUint64Array, paramsSequenceLength: KUInt, returnTypeAnnotation: KNativePointer, hasReceiver: KBoolean): KNativePointer {
        throw new Error("'CreateFunctionSignature was not overloaded by native module initialization")
    }
    _FunctionSignatureParamsConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'FunctionSignatureParamsConst was not overloaded by native module initialization")
    }
    _FunctionSignatureParams(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'FunctionSignatureParams was not overloaded by native module initialization")
    }
    _FunctionSignatureTypeParams(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'FunctionSignatureTypeParams was not overloaded by native module initialization")
    }
    _FunctionSignatureTypeParamsConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'FunctionSignatureTypeParamsConst was not overloaded by native module initialization")
    }
    _FunctionSignatureReturnType(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'FunctionSignatureReturnType was not overloaded by native module initialization")
    }
    _FunctionSignatureSetReturnType(context: KNativePointer, receiver: KNativePointer, type: KNativePointer): void {
        throw new Error("'FunctionSignatureSetReturnType was not overloaded by native module initialization")
    }
    _FunctionSignatureReturnTypeConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'FunctionSignatureReturnTypeConst was not overloaded by native module initialization")
    }
    _FunctionSignatureClone(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'FunctionSignatureClone was not overloaded by native module initialization")
    }
    _FunctionSignatureHasReceiverConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'FunctionSignatureHasReceiverConst was not overloaded by native module initialization")
    }
    _CreateChainExpression(context: KNativePointer, expression: KNativePointer): KNativePointer {
        throw new Error("'CreateChainExpression was not overloaded by native module initialization")
    }
    _UpdateChainExpression(context: KNativePointer, original: KNativePointer, expression: KNativePointer): KNativePointer {
        throw new Error("'UpdateChainExpression was not overloaded by native module initialization")
    }
    _ChainExpressionGetExpressionConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ChainExpressionGetExpressionConst was not overloaded by native module initialization")
    }
    _ChainExpressionGetExpression(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ChainExpressionGetExpression was not overloaded by native module initialization")
    }
    _CreateTSIntersectionType(context: KNativePointer, types: BigUint64Array, typesSequenceLength: KUInt): KNativePointer {
        throw new Error("'CreateTSIntersectionType was not overloaded by native module initialization")
    }
    _UpdateTSIntersectionType(context: KNativePointer, original: KNativePointer, types: BigUint64Array, typesSequenceLength: KUInt): KNativePointer {
        throw new Error("'UpdateTSIntersectionType was not overloaded by native module initialization")
    }
    _TSIntersectionTypeTypesConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSIntersectionTypeTypesConst was not overloaded by native module initialization")
    }
    _CreateUpdateExpression(context: KNativePointer, argument: KNativePointer, updateOperator: KInt, isPrefix: KBoolean): KNativePointer {
        throw new Error("'CreateUpdateExpression was not overloaded by native module initialization")
    }
    _UpdateUpdateExpression(context: KNativePointer, original: KNativePointer, argument: KNativePointer, updateOperator: KInt, isPrefix: KBoolean): KNativePointer {
        throw new Error("'UpdateUpdateExpression was not overloaded by native module initialization")
    }
    _UpdateExpressionOperatorTypeConst(context: KNativePointer, receiver: KNativePointer): KInt {
        throw new Error("'UpdateExpressionOperatorTypeConst was not overloaded by native module initialization")
    }
    _UpdateExpressionArgument(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'UpdateExpressionArgument was not overloaded by native module initialization")
    }
    _UpdateExpressionArgumentConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'UpdateExpressionArgumentConst was not overloaded by native module initialization")
    }
    _UpdateExpressionIsPrefixConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'UpdateExpressionIsPrefixConst was not overloaded by native module initialization")
    }
    _CreateBlockExpression(context: KNativePointer, statements: BigUint64Array, statementsSequenceLength: KUInt): KNativePointer {
        throw new Error("'CreateBlockExpression was not overloaded by native module initialization")
    }
    _UpdateBlockExpression(context: KNativePointer, original: KNativePointer, statements: BigUint64Array, statementsSequenceLength: KUInt): KNativePointer {
        throw new Error("'UpdateBlockExpression was not overloaded by native module initialization")
    }
    _BlockExpressionStatementsConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'BlockExpressionStatementsConst was not overloaded by native module initialization")
    }
    _BlockExpressionStatements(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'BlockExpressionStatements was not overloaded by native module initialization")
    }
    _BlockExpressionAddStatements(context: KNativePointer, receiver: KNativePointer, statements: BigUint64Array, statementsSequenceLength: KUInt): void {
        throw new Error("'BlockExpressionAddStatements was not overloaded by native module initialization")
    }
    _BlockExpressionAddStatement(context: KNativePointer, receiver: KNativePointer, statement: KNativePointer): void {
        throw new Error("'BlockExpressionAddStatement was not overloaded by native module initialization")
    }
    _CreateTSTypeLiteral(context: KNativePointer, members: BigUint64Array, membersSequenceLength: KUInt): KNativePointer {
        throw new Error("'CreateTSTypeLiteral was not overloaded by native module initialization")
    }
    _UpdateTSTypeLiteral(context: KNativePointer, original: KNativePointer, members: BigUint64Array, membersSequenceLength: KUInt): KNativePointer {
        throw new Error("'UpdateTSTypeLiteral was not overloaded by native module initialization")
    }
    _TSTypeLiteralMembersConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSTypeLiteralMembersConst was not overloaded by native module initialization")
    }
    _CreateTSTypeParameter(context: KNativePointer, name: KNativePointer, constraint: KNativePointer, defaultType: KNativePointer): KNativePointer {
        throw new Error("'CreateTSTypeParameter was not overloaded by native module initialization")
    }
    _UpdateTSTypeParameter(context: KNativePointer, original: KNativePointer, name: KNativePointer, constraint: KNativePointer, defaultType: KNativePointer): KNativePointer {
        throw new Error("'UpdateTSTypeParameter was not overloaded by native module initialization")
    }
    _CreateTSTypeParameter1(context: KNativePointer, name: KNativePointer, constraint: KNativePointer, defaultType: KNativePointer, flags: KInt): KNativePointer {
        throw new Error("'CreateTSTypeParameter1 was not overloaded by native module initialization")
    }
    _UpdateTSTypeParameter1(context: KNativePointer, original: KNativePointer, name: KNativePointer, constraint: KNativePointer, defaultType: KNativePointer, flags: KInt): KNativePointer {
        throw new Error("'UpdateTSTypeParameter1 was not overloaded by native module initialization")
    }
    _TSTypeParameterNameConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSTypeParameterNameConst was not overloaded by native module initialization")
    }
    _TSTypeParameterName(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSTypeParameterName was not overloaded by native module initialization")
    }
    _TSTypeParameterConstraint(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSTypeParameterConstraint was not overloaded by native module initialization")
    }
    _TSTypeParameterConstraintConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSTypeParameterConstraintConst was not overloaded by native module initialization")
    }
    _TSTypeParameterSetConstraint(context: KNativePointer, receiver: KNativePointer, constraint: KNativePointer): void {
        throw new Error("'TSTypeParameterSetConstraint was not overloaded by native module initialization")
    }
    _TSTypeParameterDefaultTypeConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSTypeParameterDefaultTypeConst was not overloaded by native module initialization")
    }
    _TSTypeParameterSetDefaultType(context: KNativePointer, receiver: KNativePointer, defaultType: KNativePointer): void {
        throw new Error("'TSTypeParameterSetDefaultType was not overloaded by native module initialization")
    }
    _TSTypeParameterAnnotations(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSTypeParameterAnnotations was not overloaded by native module initialization")
    }
    _TSTypeParameterAnnotationsConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSTypeParameterAnnotationsConst was not overloaded by native module initialization")
    }
    _TSTypeParameterSetAnnotations(context: KNativePointer, receiver: KNativePointer, annotations: BigUint64Array, annotationsSequenceLength: KUInt): void {
        throw new Error("'TSTypeParameterSetAnnotations was not overloaded by native module initialization")
    }
    _CreateTSBooleanKeyword(context: KNativePointer): KNativePointer {
        throw new Error("'CreateTSBooleanKeyword was not overloaded by native module initialization")
    }
    _UpdateTSBooleanKeyword(context: KNativePointer, original: KNativePointer): KNativePointer {
        throw new Error("'UpdateTSBooleanKeyword was not overloaded by native module initialization")
    }
    _CreateSpreadElement(context: KNativePointer, nodeType: KInt, argument: KNativePointer): KNativePointer {
        throw new Error("'CreateSpreadElement was not overloaded by native module initialization")
    }
    _UpdateSpreadElement(context: KNativePointer, original: KNativePointer, nodeType: KInt, argument: KNativePointer): KNativePointer {
        throw new Error("'UpdateSpreadElement was not overloaded by native module initialization")
    }
    _SpreadElementArgumentConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'SpreadElementArgumentConst was not overloaded by native module initialization")
    }
    _SpreadElementArgument(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'SpreadElementArgument was not overloaded by native module initialization")
    }
    _SpreadElementIsOptionalConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'SpreadElementIsOptionalConst was not overloaded by native module initialization")
    }
    _SpreadElementDecoratorsConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'SpreadElementDecoratorsConst was not overloaded by native module initialization")
    }
    _SpreadElementSetOptional(context: KNativePointer, receiver: KNativePointer, optional_arg: KBoolean): void {
        throw new Error("'SpreadElementSetOptional was not overloaded by native module initialization")
    }
    _SpreadElementValidateExpression(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'SpreadElementValidateExpression was not overloaded by native module initialization")
    }
    _SpreadElementConvertibleToRest(context: KNativePointer, receiver: KNativePointer, isDeclaration: KBoolean, allowPattern: KBoolean): KBoolean {
        throw new Error("'SpreadElementConvertibleToRest was not overloaded by native module initialization")
    }
    _SpreadElementTypeAnnotationConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'SpreadElementTypeAnnotationConst was not overloaded by native module initialization")
    }
    _SpreadElementSetTsTypeAnnotation(context: KNativePointer, receiver: KNativePointer, typeAnnotation: KNativePointer): void {
        throw new Error("'SpreadElementSetTsTypeAnnotation was not overloaded by native module initialization")
    }
    _CreateTSTypePredicate(context: KNativePointer, parameterName: KNativePointer, typeAnnotation: KNativePointer, asserts: KBoolean): KNativePointer {
        throw new Error("'CreateTSTypePredicate was not overloaded by native module initialization")
    }
    _UpdateTSTypePredicate(context: KNativePointer, original: KNativePointer, parameterName: KNativePointer, typeAnnotation: KNativePointer, asserts: KBoolean): KNativePointer {
        throw new Error("'UpdateTSTypePredicate was not overloaded by native module initialization")
    }
    _TSTypePredicateParameterNameConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSTypePredicateParameterNameConst was not overloaded by native module initialization")
    }
    _TSTypePredicateTypeAnnotationConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSTypePredicateTypeAnnotationConst was not overloaded by native module initialization")
    }
    _TSTypePredicateAssertsConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'TSTypePredicateAssertsConst was not overloaded by native module initialization")
    }
    _CreateImportNamespaceSpecifier(context: KNativePointer, local: KNativePointer): KNativePointer {
        throw new Error("'CreateImportNamespaceSpecifier was not overloaded by native module initialization")
    }
    _UpdateImportNamespaceSpecifier(context: KNativePointer, original: KNativePointer, local: KNativePointer): KNativePointer {
        throw new Error("'UpdateImportNamespaceSpecifier was not overloaded by native module initialization")
    }
    _ImportNamespaceSpecifierLocal(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ImportNamespaceSpecifierLocal was not overloaded by native module initialization")
    }
    _ImportNamespaceSpecifierLocalConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ImportNamespaceSpecifierLocalConst was not overloaded by native module initialization")
    }
    _CreateExportNamedDeclaration(context: KNativePointer, source: KNativePointer, specifiers: BigUint64Array, specifiersSequenceLength: KUInt): KNativePointer {
        throw new Error("'CreateExportNamedDeclaration was not overloaded by native module initialization")
    }
    _UpdateExportNamedDeclaration(context: KNativePointer, original: KNativePointer, source: KNativePointer, specifiers: BigUint64Array, specifiersSequenceLength: KUInt): KNativePointer {
        throw new Error("'UpdateExportNamedDeclaration was not overloaded by native module initialization")
    }
    _CreateExportNamedDeclaration1(context: KNativePointer, decl: KNativePointer, specifiers: BigUint64Array, specifiersSequenceLength: KUInt): KNativePointer {
        throw new Error("'CreateExportNamedDeclaration1 was not overloaded by native module initialization")
    }
    _UpdateExportNamedDeclaration1(context: KNativePointer, original: KNativePointer, decl: KNativePointer, specifiers: BigUint64Array, specifiersSequenceLength: KUInt): KNativePointer {
        throw new Error("'UpdateExportNamedDeclaration1 was not overloaded by native module initialization")
    }
    _CreateExportNamedDeclaration2(context: KNativePointer, decl: KNativePointer): KNativePointer {
        throw new Error("'CreateExportNamedDeclaration2 was not overloaded by native module initialization")
    }
    _UpdateExportNamedDeclaration2(context: KNativePointer, original: KNativePointer, decl: KNativePointer): KNativePointer {
        throw new Error("'UpdateExportNamedDeclaration2 was not overloaded by native module initialization")
    }
    _ExportNamedDeclarationDeclConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ExportNamedDeclarationDeclConst was not overloaded by native module initialization")
    }
    _ExportNamedDeclarationSourceConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ExportNamedDeclarationSourceConst was not overloaded by native module initialization")
    }
    _ExportNamedDeclarationSpecifiersConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ExportNamedDeclarationSpecifiersConst was not overloaded by native module initialization")
    }
    _CreateETSParameterExpression(context: KNativePointer, identOrSpread: KNativePointer, isOptional: KBoolean): KNativePointer {
        throw new Error("'CreateETSParameterExpression was not overloaded by native module initialization")
    }
    _UpdateETSParameterExpression(context: KNativePointer, original: KNativePointer, identOrSpread: KNativePointer, isOptional: KBoolean): KNativePointer {
        throw new Error("'UpdateETSParameterExpression was not overloaded by native module initialization")
    }
    _CreateETSParameterExpression1(context: KNativePointer, identOrSpread: KNativePointer, initializer: KNativePointer): KNativePointer {
        throw new Error("'CreateETSParameterExpression1 was not overloaded by native module initialization")
    }
    _UpdateETSParameterExpression1(context: KNativePointer, original: KNativePointer, identOrSpread: KNativePointer, initializer: KNativePointer): KNativePointer {
        throw new Error("'UpdateETSParameterExpression1 was not overloaded by native module initialization")
    }
    _ETSParameterExpressionNameConst(context: KNativePointer, receiver: KNativePointer): KStringPtr {
        throw new Error("'ETSParameterExpressionNameConst was not overloaded by native module initialization")
    }
    _ETSParameterExpressionIdentConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ETSParameterExpressionIdentConst was not overloaded by native module initialization")
    }
    _ETSParameterExpressionIdent(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ETSParameterExpressionIdent was not overloaded by native module initialization")
    }
    _ETSParameterExpressionSetIdent(context: KNativePointer, receiver: KNativePointer, ident: KNativePointer): void {
        throw new Error("'ETSParameterExpressionSetIdent was not overloaded by native module initialization")
    }
    _ETSParameterExpressionRestParameterConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ETSParameterExpressionRestParameterConst was not overloaded by native module initialization")
    }
    _ETSParameterExpressionRestParameter(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ETSParameterExpressionRestParameter was not overloaded by native module initialization")
    }
    _ETSParameterExpressionInitializerConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ETSParameterExpressionInitializerConst was not overloaded by native module initialization")
    }
    _ETSParameterExpressionInitializer(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ETSParameterExpressionInitializer was not overloaded by native module initialization")
    }
    _ETSParameterExpressionSetLexerSaved(context: KNativePointer, receiver: KNativePointer, s: KStringPtr): void {
        throw new Error("'ETSParameterExpressionSetLexerSaved was not overloaded by native module initialization")
    }
    _ETSParameterExpressionLexerSavedConst(context: KNativePointer, receiver: KNativePointer): KStringPtr {
        throw new Error("'ETSParameterExpressionLexerSavedConst was not overloaded by native module initialization")
    }
    _ETSParameterExpressionTypeAnnotationConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ETSParameterExpressionTypeAnnotationConst was not overloaded by native module initialization")
    }
    _ETSParameterExpressionTypeAnnotation(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ETSParameterExpressionTypeAnnotation was not overloaded by native module initialization")
    }
    _ETSParameterExpressionSetTypeAnnotation(context: KNativePointer, receiver: KNativePointer, typeNode: KNativePointer): void {
        throw new Error("'ETSParameterExpressionSetTypeAnnotation was not overloaded by native module initialization")
    }
    _ETSParameterExpressionIsOptionalConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'ETSParameterExpressionIsOptionalConst was not overloaded by native module initialization")
    }
    _ETSParameterExpressionSetOptional(context: KNativePointer, receiver: KNativePointer, value: KBoolean): void {
        throw new Error("'ETSParameterExpressionSetOptional was not overloaded by native module initialization")
    }
    _ETSParameterExpressionSetInitializer(context: KNativePointer, receiver: KNativePointer, initExpr: KNativePointer): void {
        throw new Error("'ETSParameterExpressionSetInitializer was not overloaded by native module initialization")
    }
    _ETSParameterExpressionIsRestParameterConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'ETSParameterExpressionIsRestParameterConst was not overloaded by native module initialization")
    }
    _ETSParameterExpressionGetRequiredParamsConst(context: KNativePointer, receiver: KNativePointer): KUInt {
        throw new Error("'ETSParameterExpressionGetRequiredParamsConst was not overloaded by native module initialization")
    }
    _ETSParameterExpressionSetRequiredParams(context: KNativePointer, receiver: KNativePointer, value: KUInt): void {
        throw new Error("'ETSParameterExpressionSetRequiredParams was not overloaded by native module initialization")
    }
    _ETSParameterExpressionAnnotations(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ETSParameterExpressionAnnotations was not overloaded by native module initialization")
    }
    _ETSParameterExpressionAnnotationsConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ETSParameterExpressionAnnotationsConst was not overloaded by native module initialization")
    }
    _ETSParameterExpressionSetAnnotations(context: KNativePointer, receiver: KNativePointer, annotations: BigUint64Array, annotationsSequenceLength: KUInt): void {
        throw new Error("'ETSParameterExpressionSetAnnotations was not overloaded by native module initialization")
    }
    _CreateTSTypeParameterInstantiation(context: KNativePointer, params: BigUint64Array, paramsSequenceLength: KUInt): KNativePointer {
        throw new Error("'CreateTSTypeParameterInstantiation was not overloaded by native module initialization")
    }
    _UpdateTSTypeParameterInstantiation(context: KNativePointer, original: KNativePointer, params: BigUint64Array, paramsSequenceLength: KUInt): KNativePointer {
        throw new Error("'UpdateTSTypeParameterInstantiation was not overloaded by native module initialization")
    }
    _TSTypeParameterInstantiationParamsConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSTypeParameterInstantiationParamsConst was not overloaded by native module initialization")
    }
    _CreateNullLiteral(context: KNativePointer): KNativePointer {
        throw new Error("'CreateNullLiteral was not overloaded by native module initialization")
    }
    _UpdateNullLiteral(context: KNativePointer, original: KNativePointer): KNativePointer {
        throw new Error("'UpdateNullLiteral was not overloaded by native module initialization")
    }
    _CreateTSInferType(context: KNativePointer, typeParam: KNativePointer): KNativePointer {
        throw new Error("'CreateTSInferType was not overloaded by native module initialization")
    }
    _UpdateTSInferType(context: KNativePointer, original: KNativePointer, typeParam: KNativePointer): KNativePointer {
        throw new Error("'UpdateTSInferType was not overloaded by native module initialization")
    }
    _TSInferTypeTypeParamConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSInferTypeTypeParamConst was not overloaded by native module initialization")
    }
    _CreateSwitchCaseStatement(context: KNativePointer, test: KNativePointer, consequent: BigUint64Array, consequentSequenceLength: KUInt): KNativePointer {
        throw new Error("'CreateSwitchCaseStatement was not overloaded by native module initialization")
    }
    _UpdateSwitchCaseStatement(context: KNativePointer, original: KNativePointer, test: KNativePointer, consequent: BigUint64Array, consequentSequenceLength: KUInt): KNativePointer {
        throw new Error("'UpdateSwitchCaseStatement was not overloaded by native module initialization")
    }
    _SwitchCaseStatementTest(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'SwitchCaseStatementTest was not overloaded by native module initialization")
    }
    _SwitchCaseStatementTestConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'SwitchCaseStatementTestConst was not overloaded by native module initialization")
    }
    _SwitchCaseStatementConsequentConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'SwitchCaseStatementConsequentConst was not overloaded by native module initialization")
    }
    _CreateYieldExpression(context: KNativePointer, argument: KNativePointer, isDelegate: KBoolean): KNativePointer {
        throw new Error("'CreateYieldExpression was not overloaded by native module initialization")
    }
    _UpdateYieldExpression(context: KNativePointer, original: KNativePointer, argument: KNativePointer, isDelegate: KBoolean): KNativePointer {
        throw new Error("'UpdateYieldExpression was not overloaded by native module initialization")
    }
    _YieldExpressionHasDelegateConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'YieldExpressionHasDelegateConst was not overloaded by native module initialization")
    }
    _YieldExpressionArgumentConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'YieldExpressionArgumentConst was not overloaded by native module initialization")
    }
    _CreateTSImportEqualsDeclaration(context: KNativePointer, id: KNativePointer, moduleReference: KNativePointer, isExport: KBoolean): KNativePointer {
        throw new Error("'CreateTSImportEqualsDeclaration was not overloaded by native module initialization")
    }
    _UpdateTSImportEqualsDeclaration(context: KNativePointer, original: KNativePointer, id: KNativePointer, moduleReference: KNativePointer, isExport: KBoolean): KNativePointer {
        throw new Error("'UpdateTSImportEqualsDeclaration was not overloaded by native module initialization")
    }
    _TSImportEqualsDeclarationIdConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSImportEqualsDeclarationIdConst was not overloaded by native module initialization")
    }
    _TSImportEqualsDeclarationModuleReferenceConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSImportEqualsDeclarationModuleReferenceConst was not overloaded by native module initialization")
    }
    _TSImportEqualsDeclarationIsExportConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'TSImportEqualsDeclarationIsExportConst was not overloaded by native module initialization")
    }
    _CreateBooleanLiteral(context: KNativePointer, value: KBoolean): KNativePointer {
        throw new Error("'CreateBooleanLiteral was not overloaded by native module initialization")
    }
    _UpdateBooleanLiteral(context: KNativePointer, original: KNativePointer, value: KBoolean): KNativePointer {
        throw new Error("'UpdateBooleanLiteral was not overloaded by native module initialization")
    }
    _BooleanLiteralValueConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'BooleanLiteralValueConst was not overloaded by native module initialization")
    }
    _CreateTSNumberKeyword(context: KNativePointer): KNativePointer {
        throw new Error("'CreateTSNumberKeyword was not overloaded by native module initialization")
    }
    _UpdateTSNumberKeyword(context: KNativePointer, original: KNativePointer): KNativePointer {
        throw new Error("'UpdateTSNumberKeyword was not overloaded by native module initialization")
    }
    _CreateClassStaticBlock(context: KNativePointer, value: KNativePointer): KNativePointer {
        throw new Error("'CreateClassStaticBlock was not overloaded by native module initialization")
    }
    _UpdateClassStaticBlock(context: KNativePointer, original: KNativePointer, value: KNativePointer): KNativePointer {
        throw new Error("'UpdateClassStaticBlock was not overloaded by native module initialization")
    }
    _ClassStaticBlockFunction(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ClassStaticBlockFunction was not overloaded by native module initialization")
    }
    _ClassStaticBlockFunctionConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ClassStaticBlockFunctionConst was not overloaded by native module initialization")
    }
    _ClassStaticBlockNameConst(context: KNativePointer, receiver: KNativePointer): KStringPtr {
        throw new Error("'ClassStaticBlockNameConst was not overloaded by native module initialization")
    }
    _CreateTSNonNullExpression(context: KNativePointer, expr: KNativePointer): KNativePointer {
        throw new Error("'CreateTSNonNullExpression was not overloaded by native module initialization")
    }
    _UpdateTSNonNullExpression(context: KNativePointer, original: KNativePointer, expr: KNativePointer): KNativePointer {
        throw new Error("'UpdateTSNonNullExpression was not overloaded by native module initialization")
    }
    _TSNonNullExpressionExprConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSNonNullExpressionExprConst was not overloaded by native module initialization")
    }
    _TSNonNullExpressionExpr(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSNonNullExpressionExpr was not overloaded by native module initialization")
    }
    _TSNonNullExpressionSetExpr(context: KNativePointer, receiver: KNativePointer, expr: KNativePointer): void {
        throw new Error("'TSNonNullExpressionSetExpr was not overloaded by native module initialization")
    }
    _CreatePrefixAssertionExpression(context: KNativePointer, expr: KNativePointer, type: KNativePointer): KNativePointer {
        throw new Error("'CreatePrefixAssertionExpression was not overloaded by native module initialization")
    }
    _UpdatePrefixAssertionExpression(context: KNativePointer, original: KNativePointer, expr: KNativePointer, type: KNativePointer): KNativePointer {
        throw new Error("'UpdatePrefixAssertionExpression was not overloaded by native module initialization")
    }
    _PrefixAssertionExpressionExprConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'PrefixAssertionExpressionExprConst was not overloaded by native module initialization")
    }
    _PrefixAssertionExpressionTypeConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'PrefixAssertionExpressionTypeConst was not overloaded by native module initialization")
    }
    _CreateClassExpression(context: KNativePointer, def: KNativePointer): KNativePointer {
        throw new Error("'CreateClassExpression was not overloaded by native module initialization")
    }
    _UpdateClassExpression(context: KNativePointer, original: KNativePointer, def: KNativePointer): KNativePointer {
        throw new Error("'UpdateClassExpression was not overloaded by native module initialization")
    }
    _ClassExpressionDefinitionConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ClassExpressionDefinitionConst was not overloaded by native module initialization")
    }
    _CreateForOfStatement(context: KNativePointer, left: KNativePointer, right: KNativePointer, body: KNativePointer, isAwait: KBoolean): KNativePointer {
        throw new Error("'CreateForOfStatement was not overloaded by native module initialization")
    }
    _UpdateForOfStatement(context: KNativePointer, original: KNativePointer, left: KNativePointer, right: KNativePointer, body: KNativePointer, isAwait: KBoolean): KNativePointer {
        throw new Error("'UpdateForOfStatement was not overloaded by native module initialization")
    }
    _ForOfStatementLeft(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ForOfStatementLeft was not overloaded by native module initialization")
    }
    _ForOfStatementLeftConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ForOfStatementLeftConst was not overloaded by native module initialization")
    }
    _ForOfStatementRight(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ForOfStatementRight was not overloaded by native module initialization")
    }
    _ForOfStatementRightConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ForOfStatementRightConst was not overloaded by native module initialization")
    }
    _ForOfStatementBody(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ForOfStatementBody was not overloaded by native module initialization")
    }
    _ForOfStatementBodyConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ForOfStatementBodyConst was not overloaded by native module initialization")
    }
    _ForOfStatementIsAwaitConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'ForOfStatementIsAwaitConst was not overloaded by native module initialization")
    }
    _CreateTemplateLiteral(context: KNativePointer, quasis: BigUint64Array, quasisSequenceLength: KUInt, expressions: BigUint64Array, expressionsSequenceLength: KUInt, multilineString: KStringPtr): KNativePointer {
        throw new Error("'CreateTemplateLiteral was not overloaded by native module initialization")
    }
    _UpdateTemplateLiteral(context: KNativePointer, original: KNativePointer, quasis: BigUint64Array, quasisSequenceLength: KUInt, expressions: BigUint64Array, expressionsSequenceLength: KUInt, multilineString: KStringPtr): KNativePointer {
        throw new Error("'UpdateTemplateLiteral was not overloaded by native module initialization")
    }
    _TemplateLiteralQuasisConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TemplateLiteralQuasisConst was not overloaded by native module initialization")
    }
    _TemplateLiteralExpressionsConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TemplateLiteralExpressionsConst was not overloaded by native module initialization")
    }
    _TemplateLiteralGetMultilineStringConst(context: KNativePointer, receiver: KNativePointer): KStringPtr {
        throw new Error("'TemplateLiteralGetMultilineStringConst was not overloaded by native module initialization")
    }
    _CreateTSUnionType(context: KNativePointer, types: BigUint64Array, typesSequenceLength: KUInt): KNativePointer {
        throw new Error("'CreateTSUnionType was not overloaded by native module initialization")
    }
    _UpdateTSUnionType(context: KNativePointer, original: KNativePointer, types: BigUint64Array, typesSequenceLength: KUInt): KNativePointer {
        throw new Error("'UpdateTSUnionType was not overloaded by native module initialization")
    }
    _TSUnionTypeTypesConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSUnionTypeTypesConst was not overloaded by native module initialization")
    }
    _CreateTSUnknownKeyword(context: KNativePointer): KNativePointer {
        throw new Error("'CreateTSUnknownKeyword was not overloaded by native module initialization")
    }
    _UpdateTSUnknownKeyword(context: KNativePointer, original: KNativePointer): KNativePointer {
        throw new Error("'UpdateTSUnknownKeyword was not overloaded by native module initialization")
    }
    _CreateIdentifier(context: KNativePointer): KNativePointer {
        throw new Error("'CreateIdentifier was not overloaded by native module initialization")
    }
    _UpdateIdentifier(context: KNativePointer, original: KNativePointer): KNativePointer {
        throw new Error("'UpdateIdentifier was not overloaded by native module initialization")
    }
    _CreateIdentifier1(context: KNativePointer, name: KStringPtr): KNativePointer {
        throw new Error("'CreateIdentifier1 was not overloaded by native module initialization")
    }
    _UpdateIdentifier1(context: KNativePointer, original: KNativePointer, name: KStringPtr): KNativePointer {
        throw new Error("'UpdateIdentifier1 was not overloaded by native module initialization")
    }
    _CreateIdentifier2(context: KNativePointer, name: KStringPtr, typeAnnotation: KNativePointer): KNativePointer {
        throw new Error("'CreateIdentifier2 was not overloaded by native module initialization")
    }
    _UpdateIdentifier2(context: KNativePointer, original: KNativePointer, name: KStringPtr, typeAnnotation: KNativePointer): KNativePointer {
        throw new Error("'UpdateIdentifier2 was not overloaded by native module initialization")
    }
    _IdentifierNameConst(context: KNativePointer, receiver: KNativePointer): KStringPtr {
        throw new Error("'IdentifierNameConst was not overloaded by native module initialization")
    }
    _IdentifierName(context: KNativePointer, receiver: KNativePointer): KStringPtr {
        throw new Error("'IdentifierName was not overloaded by native module initialization")
    }
    _IdentifierSetName(context: KNativePointer, receiver: KNativePointer, newName: KStringPtr): void {
        throw new Error("'IdentifierSetName was not overloaded by native module initialization")
    }
    _IdentifierDecoratorsConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'IdentifierDecoratorsConst was not overloaded by native module initialization")
    }
    _IdentifierIsErrorPlaceHolderConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'IdentifierIsErrorPlaceHolderConst was not overloaded by native module initialization")
    }
    _IdentifierIsOptionalConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'IdentifierIsOptionalConst was not overloaded by native module initialization")
    }
    _IdentifierSetOptional(context: KNativePointer, receiver: KNativePointer, optional_arg: KBoolean): void {
        throw new Error("'IdentifierSetOptional was not overloaded by native module initialization")
    }
    _IdentifierIsReferenceConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'IdentifierIsReferenceConst was not overloaded by native module initialization")
    }
    _IdentifierIsTdzConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'IdentifierIsTdzConst was not overloaded by native module initialization")
    }
    _IdentifierSetTdz(context: KNativePointer, receiver: KNativePointer): void {
        throw new Error("'IdentifierSetTdz was not overloaded by native module initialization")
    }
    _IdentifierSetAccessor(context: KNativePointer, receiver: KNativePointer): void {
        throw new Error("'IdentifierSetAccessor was not overloaded by native module initialization")
    }
    _IdentifierIsAccessorConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'IdentifierIsAccessorConst was not overloaded by native module initialization")
    }
    _IdentifierSetMutator(context: KNativePointer, receiver: KNativePointer): void {
        throw new Error("'IdentifierSetMutator was not overloaded by native module initialization")
    }
    _IdentifierIsMutatorConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'IdentifierIsMutatorConst was not overloaded by native module initialization")
    }
    _IdentifierIsReceiverConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'IdentifierIsReceiverConst was not overloaded by native module initialization")
    }
    _IdentifierIsPrivateIdentConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'IdentifierIsPrivateIdentConst was not overloaded by native module initialization")
    }
    _IdentifierSetPrivate(context: KNativePointer, receiver: KNativePointer, isPrivate: KBoolean): void {
        throw new Error("'IdentifierSetPrivate was not overloaded by native module initialization")
    }
    _IdentifierIsIgnoreBoxConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'IdentifierIsIgnoreBoxConst was not overloaded by native module initialization")
    }
    _IdentifierSetIgnoreBox(context: KNativePointer, receiver: KNativePointer): void {
        throw new Error("'IdentifierSetIgnoreBox was not overloaded by native module initialization")
    }
    _IdentifierIsAnnotationDeclConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'IdentifierIsAnnotationDeclConst was not overloaded by native module initialization")
    }
    _IdentifierSetAnnotationDecl(context: KNativePointer, receiver: KNativePointer): void {
        throw new Error("'IdentifierSetAnnotationDecl was not overloaded by native module initialization")
    }
    _IdentifierIsAnnotationUsageConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'IdentifierIsAnnotationUsageConst was not overloaded by native module initialization")
    }
    _IdentifierSetAnnotationUsage(context: KNativePointer, receiver: KNativePointer): void {
        throw new Error("'IdentifierSetAnnotationUsage was not overloaded by native module initialization")
    }
    _IdentifierCloneReference(context: KNativePointer, receiver: KNativePointer, parent: KNativePointer): KNativePointer {
        throw new Error("'IdentifierCloneReference was not overloaded by native module initialization")
    }
    _IdentifierValidateExpression(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'IdentifierValidateExpression was not overloaded by native module initialization")
    }
    _IdentifierTypeAnnotationConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'IdentifierTypeAnnotationConst was not overloaded by native module initialization")
    }
    _IdentifierSetTsTypeAnnotation(context: KNativePointer, receiver: KNativePointer, typeAnnotation: KNativePointer): void {
        throw new Error("'IdentifierSetTsTypeAnnotation was not overloaded by native module initialization")
    }
    _CreateOpaqueTypeNode1(context: KNativePointer): KNativePointer {
        throw new Error("'CreateOpaqueTypeNode1 was not overloaded by native module initialization")
    }
    _UpdateOpaqueTypeNode1(context: KNativePointer, original: KNativePointer): KNativePointer {
        throw new Error("'UpdateOpaqueTypeNode1 was not overloaded by native module initialization")
    }
    _CreateBlockStatement(context: KNativePointer, statementList: BigUint64Array, statementListSequenceLength: KUInt): KNativePointer {
        throw new Error("'CreateBlockStatement was not overloaded by native module initialization")
    }
    _UpdateBlockStatement(context: KNativePointer, original: KNativePointer, statementList: BigUint64Array, statementListSequenceLength: KUInt): KNativePointer {
        throw new Error("'UpdateBlockStatement was not overloaded by native module initialization")
    }
    _BlockStatementStatementsConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'BlockStatementStatementsConst was not overloaded by native module initialization")
    }
    _BlockStatementStatements(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'BlockStatementStatements was not overloaded by native module initialization")
    }
    _BlockStatementSetStatements(context: KNativePointer, receiver: KNativePointer, statementList: BigUint64Array, statementListSequenceLength: KUInt): void {
        throw new Error("'BlockStatementSetStatements was not overloaded by native module initialization")
    }
    _BlockStatementAddTrailingBlock(context: KNativePointer, receiver: KNativePointer, stmt: KNativePointer, trailingBlock: KNativePointer): void {
        throw new Error("'BlockStatementAddTrailingBlock was not overloaded by native module initialization")
    }
    _CreateDirectEvalExpression(context: KNativePointer, callee: KNativePointer, _arguments: BigUint64Array, _argumentsSequenceLength: KUInt, typeParams: KNativePointer, optional_arg: KBoolean, parserStatus: KUInt): KNativePointer {
        throw new Error("'CreateDirectEvalExpression was not overloaded by native module initialization")
    }
    _UpdateDirectEvalExpression(context: KNativePointer, original: KNativePointer, callee: KNativePointer, _arguments: BigUint64Array, _argumentsSequenceLength: KUInt, typeParams: KNativePointer, optional_arg: KBoolean, parserStatus: KUInt): KNativePointer {
        throw new Error("'UpdateDirectEvalExpression was not overloaded by native module initialization")
    }
    _CreateTSTypeParameterDeclaration(context: KNativePointer, params: BigUint64Array, paramsSequenceLength: KUInt, requiredParams: KUInt): KNativePointer {
        throw new Error("'CreateTSTypeParameterDeclaration was not overloaded by native module initialization")
    }
    _UpdateTSTypeParameterDeclaration(context: KNativePointer, original: KNativePointer, params: BigUint64Array, paramsSequenceLength: KUInt, requiredParams: KUInt): KNativePointer {
        throw new Error("'UpdateTSTypeParameterDeclaration was not overloaded by native module initialization")
    }
    _TSTypeParameterDeclarationParamsConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSTypeParameterDeclarationParamsConst was not overloaded by native module initialization")
    }
    _TSTypeParameterDeclarationAddParam(context: KNativePointer, receiver: KNativePointer, param: KNativePointer): void {
        throw new Error("'TSTypeParameterDeclarationAddParam was not overloaded by native module initialization")
    }
    _TSTypeParameterDeclarationRequiredParamsConst(context: KNativePointer, receiver: KNativePointer): KUInt {
        throw new Error("'TSTypeParameterDeclarationRequiredParamsConst was not overloaded by native module initialization")
    }
    _CreateMethodDefinition(context: KNativePointer, kind: KInt, key: KNativePointer, value: KNativePointer, modifiers: KInt, isComputed: KBoolean): KNativePointer {
        throw new Error("'CreateMethodDefinition was not overloaded by native module initialization")
    }
    _UpdateMethodDefinition(context: KNativePointer, original: KNativePointer, kind: KInt, key: KNativePointer, value: KNativePointer, modifiers: KInt, isComputed: KBoolean): KNativePointer {
        throw new Error("'UpdateMethodDefinition was not overloaded by native module initialization")
    }
    _MethodDefinitionKindConst(context: KNativePointer, receiver: KNativePointer): KInt {
        throw new Error("'MethodDefinitionKindConst was not overloaded by native module initialization")
    }
    _MethodDefinitionIsConstructorConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'MethodDefinitionIsConstructorConst was not overloaded by native module initialization")
    }
    _MethodDefinitionIsExtensionMethodConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'MethodDefinitionIsExtensionMethodConst was not overloaded by native module initialization")
    }
    _MethodDefinitionOverloadsConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'MethodDefinitionOverloadsConst was not overloaded by native module initialization")
    }
    _MethodDefinitionBaseOverloadMethodConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'MethodDefinitionBaseOverloadMethodConst was not overloaded by native module initialization")
    }
    _MethodDefinitionBaseOverloadMethod(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'MethodDefinitionBaseOverloadMethod was not overloaded by native module initialization")
    }
    _MethodDefinitionAsyncPairMethodConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'MethodDefinitionAsyncPairMethodConst was not overloaded by native module initialization")
    }
    _MethodDefinitionAsyncPairMethod(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'MethodDefinitionAsyncPairMethod was not overloaded by native module initialization")
    }
    _MethodDefinitionSetOverloads(context: KNativePointer, receiver: KNativePointer, overloads: BigUint64Array, overloadsSequenceLength: KUInt): void {
        throw new Error("'MethodDefinitionSetOverloads was not overloaded by native module initialization")
    }
    _MethodDefinitionClearOverloads(context: KNativePointer, receiver: KNativePointer): void {
        throw new Error("'MethodDefinitionClearOverloads was not overloaded by native module initialization")
    }
    _MethodDefinitionAddOverload(context: KNativePointer, receiver: KNativePointer, overload: KNativePointer): void {
        throw new Error("'MethodDefinitionAddOverload was not overloaded by native module initialization")
    }
    _MethodDefinitionSetBaseOverloadMethod(context: KNativePointer, receiver: KNativePointer, baseOverloadMethod: KNativePointer): void {
        throw new Error("'MethodDefinitionSetBaseOverloadMethod was not overloaded by native module initialization")
    }
    _MethodDefinitionSetAsyncPairMethod(context: KNativePointer, receiver: KNativePointer, method: KNativePointer): void {
        throw new Error("'MethodDefinitionSetAsyncPairMethod was not overloaded by native module initialization")
    }
    _MethodDefinitionHasOverload(context: KNativePointer, receiver: KNativePointer, overload: KNativePointer): KBoolean {
        throw new Error("'MethodDefinitionHasOverload was not overloaded by native module initialization")
    }
    _MethodDefinitionFunction(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'MethodDefinitionFunction was not overloaded by native module initialization")
    }
    _MethodDefinitionFunctionConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'MethodDefinitionFunctionConst was not overloaded by native module initialization")
    }
    _CreateTSNullKeyword(context: KNativePointer): KNativePointer {
        throw new Error("'CreateTSNullKeyword was not overloaded by native module initialization")
    }
    _UpdateTSNullKeyword(context: KNativePointer, original: KNativePointer): KNativePointer {
        throw new Error("'UpdateTSNullKeyword was not overloaded by native module initialization")
    }
    _CreateTSInterfaceHeritage(context: KNativePointer, expr: KNativePointer): KNativePointer {
        throw new Error("'CreateTSInterfaceHeritage was not overloaded by native module initialization")
    }
    _UpdateTSInterfaceHeritage(context: KNativePointer, original: KNativePointer, expr: KNativePointer): KNativePointer {
        throw new Error("'UpdateTSInterfaceHeritage was not overloaded by native module initialization")
    }
    _TSInterfaceHeritageExpr(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSInterfaceHeritageExpr was not overloaded by native module initialization")
    }
    _TSInterfaceHeritageExprConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSInterfaceHeritageExprConst was not overloaded by native module initialization")
    }
    _ExpressionIsGroupedConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'ExpressionIsGroupedConst was not overloaded by native module initialization")
    }
    _ExpressionSetGrouped(context: KNativePointer, receiver: KNativePointer): void {
        throw new Error("'ExpressionSetGrouped was not overloaded by native module initialization")
    }
    _ExpressionAsLiteralConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ExpressionAsLiteralConst was not overloaded by native module initialization")
    }
    _ExpressionAsLiteral(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ExpressionAsLiteral was not overloaded by native module initialization")
    }
    _ExpressionIsLiteralConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'ExpressionIsLiteralConst was not overloaded by native module initialization")
    }
    _ExpressionIsTypeNodeConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'ExpressionIsTypeNodeConst was not overloaded by native module initialization")
    }
    _ExpressionIsAnnotatedExpressionConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'ExpressionIsAnnotatedExpressionConst was not overloaded by native module initialization")
    }
    _ExpressionAsTypeNode(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ExpressionAsTypeNode was not overloaded by native module initialization")
    }
    _ExpressionAsTypeNodeConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ExpressionAsTypeNodeConst was not overloaded by native module initialization")
    }
    _ExpressionAsAnnotatedExpression(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ExpressionAsAnnotatedExpression was not overloaded by native module initialization")
    }
    _ExpressionAsAnnotatedExpressionConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ExpressionAsAnnotatedExpressionConst was not overloaded by native module initialization")
    }
    _ExpressionIsBrokenExpressionConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'ExpressionIsBrokenExpressionConst was not overloaded by native module initialization")
    }
    _ExpressionToStringConst(context: KNativePointer, receiver: KNativePointer): KStringPtr {
        throw new Error("'ExpressionToStringConst was not overloaded by native module initialization")
    }
    _AnnotatedExpressionTypeAnnotationConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'AnnotatedExpressionTypeAnnotationConst was not overloaded by native module initialization")
    }
    _AnnotatedExpressionSetTsTypeAnnotation(context: KNativePointer, receiver: KNativePointer, typeAnnotation: KNativePointer): void {
        throw new Error("'AnnotatedExpressionSetTsTypeAnnotation was not overloaded by native module initialization")
    }
    _MaybeOptionalExpressionIsOptionalConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'MaybeOptionalExpressionIsOptionalConst was not overloaded by native module initialization")
    }
    _MaybeOptionalExpressionClearOptional(context: KNativePointer, receiver: KNativePointer): void {
        throw new Error("'MaybeOptionalExpressionClearOptional was not overloaded by native module initialization")
    }
    _CreateSrcDumper(context: KNativePointer, node: KNativePointer): KNativePointer {
        throw new Error("'CreateSrcDumper was not overloaded by native module initialization")
    }
    _SrcDumperAdd(context: KNativePointer, receiver: KNativePointer, str: KStringPtr): void {
        throw new Error("'SrcDumperAdd was not overloaded by native module initialization")
    }
    _SrcDumperAdd1(context: KNativePointer, receiver: KNativePointer, i: KInt): void {
        throw new Error("'SrcDumperAdd1 was not overloaded by native module initialization")
    }
    _SrcDumperAdd2(context: KNativePointer, receiver: KNativePointer, l: KLong): void {
        throw new Error("'SrcDumperAdd2 was not overloaded by native module initialization")
    }
    _SrcDumperAdd3(context: KNativePointer, receiver: KNativePointer, f: KFloat): void {
        throw new Error("'SrcDumperAdd3 was not overloaded by native module initialization")
    }
    _SrcDumperAdd4(context: KNativePointer, receiver: KNativePointer, d: KDouble): void {
        throw new Error("'SrcDumperAdd4 was not overloaded by native module initialization")
    }
    _SrcDumperStrConst(context: KNativePointer, receiver: KNativePointer): KStringPtr {
        throw new Error("'SrcDumperStrConst was not overloaded by native module initialization")
    }
    _SrcDumperIncrIndent(context: KNativePointer, receiver: KNativePointer): void {
        throw new Error("'SrcDumperIncrIndent was not overloaded by native module initialization")
    }
    _SrcDumperDecrIndent(context: KNativePointer, receiver: KNativePointer): void {
        throw new Error("'SrcDumperDecrIndent was not overloaded by native module initialization")
    }
    _SrcDumperEndl(context: KNativePointer, receiver: KNativePointer, num: KUInt): void {
        throw new Error("'SrcDumperEndl was not overloaded by native module initialization")
    }
    _CreateETSClassLiteral(context: KNativePointer, expr: KNativePointer): KNativePointer {
        throw new Error("'CreateETSClassLiteral was not overloaded by native module initialization")
    }
    _UpdateETSClassLiteral(context: KNativePointer, original: KNativePointer, expr: KNativePointer): KNativePointer {
        throw new Error("'UpdateETSClassLiteral was not overloaded by native module initialization")
    }
    _ETSClassLiteralExprConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ETSClassLiteralExprConst was not overloaded by native module initialization")
    }
    _CreateBreakStatement(context: KNativePointer): KNativePointer {
        throw new Error("'CreateBreakStatement was not overloaded by native module initialization")
    }
    _UpdateBreakStatement(context: KNativePointer, original: KNativePointer): KNativePointer {
        throw new Error("'UpdateBreakStatement was not overloaded by native module initialization")
    }
    _CreateBreakStatement1(context: KNativePointer, ident: KNativePointer): KNativePointer {
        throw new Error("'CreateBreakStatement1 was not overloaded by native module initialization")
    }
    _UpdateBreakStatement1(context: KNativePointer, original: KNativePointer, ident: KNativePointer): KNativePointer {
        throw new Error("'UpdateBreakStatement1 was not overloaded by native module initialization")
    }
    _BreakStatementIdentConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'BreakStatementIdentConst was not overloaded by native module initialization")
    }
    _BreakStatementIdent(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'BreakStatementIdent was not overloaded by native module initialization")
    }
    _BreakStatementTargetConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'BreakStatementTargetConst was not overloaded by native module initialization")
    }
    _BreakStatementSetTarget(context: KNativePointer, receiver: KNativePointer, target: KNativePointer): void {
        throw new Error("'BreakStatementSetTarget was not overloaded by native module initialization")
    }
    _CreateRegExpLiteral(context: KNativePointer, pattern: KStringPtr, flags: KInt, flagsStr: KStringPtr): KNativePointer {
        throw new Error("'CreateRegExpLiteral was not overloaded by native module initialization")
    }
    _UpdateRegExpLiteral(context: KNativePointer, original: KNativePointer, pattern: KStringPtr, flags: KInt, flagsStr: KStringPtr): KNativePointer {
        throw new Error("'UpdateRegExpLiteral was not overloaded by native module initialization")
    }
    _RegExpLiteralPatternConst(context: KNativePointer, receiver: KNativePointer): KStringPtr {
        throw new Error("'RegExpLiteralPatternConst was not overloaded by native module initialization")
    }
    _RegExpLiteralFlagsConst(context: KNativePointer, receiver: KNativePointer): KInt {
        throw new Error("'RegExpLiteralFlagsConst was not overloaded by native module initialization")
    }
    _CreateTSMappedType(context: KNativePointer, typeParameter: KNativePointer, typeAnnotation: KNativePointer, readonly_arg: KInt, optional_arg: KInt): KNativePointer {
        throw new Error("'CreateTSMappedType was not overloaded by native module initialization")
    }
    _UpdateTSMappedType(context: KNativePointer, original: KNativePointer, typeParameter: KNativePointer, typeAnnotation: KNativePointer, readonly_arg: KInt, optional_arg: KInt): KNativePointer {
        throw new Error("'UpdateTSMappedType was not overloaded by native module initialization")
    }
    _TSMappedTypeTypeParameter(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSMappedTypeTypeParameter was not overloaded by native module initialization")
    }
    _TSMappedTypeTypeAnnotation(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSMappedTypeTypeAnnotation was not overloaded by native module initialization")
    }
    _TSMappedTypeReadonly(context: KNativePointer, receiver: KNativePointer): KInt {
        throw new Error("'TSMappedTypeReadonly was not overloaded by native module initialization")
    }
    _TSMappedTypeOptional(context: KNativePointer, receiver: KNativePointer): KInt {
        throw new Error("'TSMappedTypeOptional was not overloaded by native module initialization")
    }
    _CreateTSAnyKeyword(context: KNativePointer): KNativePointer {
        throw new Error("'CreateTSAnyKeyword was not overloaded by native module initialization")
    }
    _UpdateTSAnyKeyword(context: KNativePointer, original: KNativePointer): KNativePointer {
        throw new Error("'UpdateTSAnyKeyword was not overloaded by native module initialization")
    }
    _CreateClassDeclaration(context: KNativePointer, def: KNativePointer): KNativePointer {
        throw new Error("'CreateClassDeclaration was not overloaded by native module initialization")
    }
    _UpdateClassDeclaration(context: KNativePointer, original: KNativePointer, def: KNativePointer): KNativePointer {
        throw new Error("'UpdateClassDeclaration was not overloaded by native module initialization")
    }
    _ClassDeclarationDefinition(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ClassDeclarationDefinition was not overloaded by native module initialization")
    }
    _ClassDeclarationDefinitionConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ClassDeclarationDefinitionConst was not overloaded by native module initialization")
    }
    _ClassDeclarationDecoratorsConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ClassDeclarationDecoratorsConst was not overloaded by native module initialization")
    }
    _CreateTSIndexedAccessType(context: KNativePointer, objectType: KNativePointer, indexType: KNativePointer): KNativePointer {
        throw new Error("'CreateTSIndexedAccessType was not overloaded by native module initialization")
    }
    _UpdateTSIndexedAccessType(context: KNativePointer, original: KNativePointer, objectType: KNativePointer, indexType: KNativePointer): KNativePointer {
        throw new Error("'UpdateTSIndexedAccessType was not overloaded by native module initialization")
    }
    _TSIndexedAccessTypeObjectTypeConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSIndexedAccessTypeObjectTypeConst was not overloaded by native module initialization")
    }
    _TSIndexedAccessTypeIndexTypeConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSIndexedAccessTypeIndexTypeConst was not overloaded by native module initialization")
    }
    _CreateTSQualifiedName(context: KNativePointer, left: KNativePointer, right: KNativePointer): KNativePointer {
        throw new Error("'CreateTSQualifiedName was not overloaded by native module initialization")
    }
    _UpdateTSQualifiedName(context: KNativePointer, original: KNativePointer, left: KNativePointer, right: KNativePointer): KNativePointer {
        throw new Error("'UpdateTSQualifiedName was not overloaded by native module initialization")
    }
    _TSQualifiedNameLeftConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSQualifiedNameLeftConst was not overloaded by native module initialization")
    }
    _TSQualifiedNameLeft(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSQualifiedNameLeft was not overloaded by native module initialization")
    }
    _TSQualifiedNameRightConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSQualifiedNameRightConst was not overloaded by native module initialization")
    }
    _TSQualifiedNameRight(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSQualifiedNameRight was not overloaded by native module initialization")
    }
    _TSQualifiedNameNameConst(context: KNativePointer, receiver: KNativePointer): KStringPtr {
        throw new Error("'TSQualifiedNameNameConst was not overloaded by native module initialization")
    }
    _TSQualifiedNameResolveLeftMostQualifiedName(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSQualifiedNameResolveLeftMostQualifiedName was not overloaded by native module initialization")
    }
    _TSQualifiedNameResolveLeftMostQualifiedNameConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSQualifiedNameResolveLeftMostQualifiedNameConst was not overloaded by native module initialization")
    }
    _CreateAwaitExpression(context: KNativePointer, argument: KNativePointer): KNativePointer {
        throw new Error("'CreateAwaitExpression was not overloaded by native module initialization")
    }
    _UpdateAwaitExpression(context: KNativePointer, original: KNativePointer, argument: KNativePointer): KNativePointer {
        throw new Error("'UpdateAwaitExpression was not overloaded by native module initialization")
    }
    _AwaitExpressionArgumentConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'AwaitExpressionArgumentConst was not overloaded by native module initialization")
    }
    _CreateValidationInfo(context: KNativePointer): KNativePointer {
        throw new Error("'CreateValidationInfo was not overloaded by native module initialization")
    }
    _ValidationInfoFailConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'ValidationInfoFailConst was not overloaded by native module initialization")
    }
    _CreateContinueStatement(context: KNativePointer): KNativePointer {
        throw new Error("'CreateContinueStatement was not overloaded by native module initialization")
    }
    _UpdateContinueStatement(context: KNativePointer, original: KNativePointer): KNativePointer {
        throw new Error("'UpdateContinueStatement was not overloaded by native module initialization")
    }
    _CreateContinueStatement1(context: KNativePointer, ident: KNativePointer): KNativePointer {
        throw new Error("'CreateContinueStatement1 was not overloaded by native module initialization")
    }
    _UpdateContinueStatement1(context: KNativePointer, original: KNativePointer, ident: KNativePointer): KNativePointer {
        throw new Error("'UpdateContinueStatement1 was not overloaded by native module initialization")
    }
    _ContinueStatementIdentConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ContinueStatementIdentConst was not overloaded by native module initialization")
    }
    _ContinueStatementIdent(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ContinueStatementIdent was not overloaded by native module initialization")
    }
    _ContinueStatementTargetConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ContinueStatementTargetConst was not overloaded by native module initialization")
    }
    _ContinueStatementSetTarget(context: KNativePointer, receiver: KNativePointer, target: KNativePointer): void {
        throw new Error("'ContinueStatementSetTarget was not overloaded by native module initialization")
    }
    _CreateETSNewMultiDimArrayInstanceExpression(context: KNativePointer, typeReference: KNativePointer, dimensions: BigUint64Array, dimensionsSequenceLength: KUInt): KNativePointer {
        throw new Error("'CreateETSNewMultiDimArrayInstanceExpression was not overloaded by native module initialization")
    }
    _UpdateETSNewMultiDimArrayInstanceExpression(context: KNativePointer, original: KNativePointer, typeReference: KNativePointer, dimensions: BigUint64Array, dimensionsSequenceLength: KUInt): KNativePointer {
        throw new Error("'UpdateETSNewMultiDimArrayInstanceExpression was not overloaded by native module initialization")
    }
    _CreateETSNewMultiDimArrayInstanceExpression1(context: KNativePointer, other: KNativePointer): KNativePointer {
        throw new Error("'CreateETSNewMultiDimArrayInstanceExpression1 was not overloaded by native module initialization")
    }
    _UpdateETSNewMultiDimArrayInstanceExpression1(context: KNativePointer, original: KNativePointer, other: KNativePointer): KNativePointer {
        throw new Error("'UpdateETSNewMultiDimArrayInstanceExpression1 was not overloaded by native module initialization")
    }
    _ETSNewMultiDimArrayInstanceExpressionTypeReference(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ETSNewMultiDimArrayInstanceExpressionTypeReference was not overloaded by native module initialization")
    }
    _ETSNewMultiDimArrayInstanceExpressionTypeReferenceConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ETSNewMultiDimArrayInstanceExpressionTypeReferenceConst was not overloaded by native module initialization")
    }
    _ETSNewMultiDimArrayInstanceExpressionDimensions(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ETSNewMultiDimArrayInstanceExpressionDimensions was not overloaded by native module initialization")
    }
    _ETSNewMultiDimArrayInstanceExpressionDimensionsConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ETSNewMultiDimArrayInstanceExpressionDimensionsConst was not overloaded by native module initialization")
    }
    _CreateTSNamedTupleMember(context: KNativePointer, label: KNativePointer, elementType: KNativePointer, optional_arg: KBoolean): KNativePointer {
        throw new Error("'CreateTSNamedTupleMember was not overloaded by native module initialization")
    }
    _UpdateTSNamedTupleMember(context: KNativePointer, original: KNativePointer, label: KNativePointer, elementType: KNativePointer, optional_arg: KBoolean): KNativePointer {
        throw new Error("'UpdateTSNamedTupleMember was not overloaded by native module initialization")
    }
    _TSNamedTupleMemberLabelConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSNamedTupleMemberLabelConst was not overloaded by native module initialization")
    }
    _TSNamedTupleMemberElementType(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSNamedTupleMemberElementType was not overloaded by native module initialization")
    }
    _TSNamedTupleMemberElementTypeConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSNamedTupleMemberElementTypeConst was not overloaded by native module initialization")
    }
    _TSNamedTupleMemberIsOptionalConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'TSNamedTupleMemberIsOptionalConst was not overloaded by native module initialization")
    }
    _CreateImportExpression(context: KNativePointer, source: KNativePointer): KNativePointer {
        throw new Error("'CreateImportExpression was not overloaded by native module initialization")
    }
    _UpdateImportExpression(context: KNativePointer, original: KNativePointer, source: KNativePointer): KNativePointer {
        throw new Error("'UpdateImportExpression was not overloaded by native module initialization")
    }
    _ImportExpressionSource(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ImportExpressionSource was not overloaded by native module initialization")
    }
    _ImportExpressionSourceConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ImportExpressionSourceConst was not overloaded by native module initialization")
    }
    _CreateAstDumper(context: KNativePointer, node: KNativePointer, sourceCode: KStringPtr): KNativePointer {
        throw new Error("'CreateAstDumper was not overloaded by native module initialization")
    }
    _AstDumperModifierToString(context: KNativePointer, receiver: KNativePointer, flags: KInt): KStringPtr {
        throw new Error("'AstDumperModifierToString was not overloaded by native module initialization")
    }
    _AstDumperTypeOperatorToString(context: KNativePointer, receiver: KNativePointer, operatorType: KInt): KStringPtr {
        throw new Error("'AstDumperTypeOperatorToString was not overloaded by native module initialization")
    }
    _AstDumperStrConst(context: KNativePointer, receiver: KNativePointer): KStringPtr {
        throw new Error("'AstDumperStrConst was not overloaded by native module initialization")
    }
    _CreateETSNullTypeIr(context: KNativePointer): KNativePointer {
        throw new Error("'CreateETSNullTypeIr was not overloaded by native module initialization")
    }
    _UpdateETSNullTypeIr(context: KNativePointer, original: KNativePointer): KNativePointer {
        throw new Error("'UpdateETSNullTypeIr was not overloaded by native module initialization")
    }
    _CreateETSUndefinedTypeIr(context: KNativePointer): KNativePointer {
        throw new Error("'CreateETSUndefinedTypeIr was not overloaded by native module initialization")
    }
    _UpdateETSUndefinedTypeIr(context: KNativePointer, original: KNativePointer): KNativePointer {
        throw new Error("'UpdateETSUndefinedTypeIr was not overloaded by native module initialization")
    }
    _CreateTypeofExpression(context: KNativePointer, argument: KNativePointer): KNativePointer {
        throw new Error("'CreateTypeofExpression was not overloaded by native module initialization")
    }
    _UpdateTypeofExpression(context: KNativePointer, original: KNativePointer, argument: KNativePointer): KNativePointer {
        throw new Error("'UpdateTypeofExpression was not overloaded by native module initialization")
    }
    _TypeofExpressionArgumentConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TypeofExpressionArgumentConst was not overloaded by native module initialization")
    }
    _CreateTSEnumMember(context: KNativePointer, key: KNativePointer, init: KNativePointer): KNativePointer {
        throw new Error("'CreateTSEnumMember was not overloaded by native module initialization")
    }
    _UpdateTSEnumMember(context: KNativePointer, original: KNativePointer, key: KNativePointer, init: KNativePointer): KNativePointer {
        throw new Error("'UpdateTSEnumMember was not overloaded by native module initialization")
    }
    _CreateTSEnumMember1(context: KNativePointer, key: KNativePointer, init: KNativePointer, isGenerated: KBoolean): KNativePointer {
        throw new Error("'CreateTSEnumMember1 was not overloaded by native module initialization")
    }
    _UpdateTSEnumMember1(context: KNativePointer, original: KNativePointer, key: KNativePointer, init: KNativePointer, isGenerated: KBoolean): KNativePointer {
        throw new Error("'UpdateTSEnumMember1 was not overloaded by native module initialization")
    }
    _TSEnumMemberKeyConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSEnumMemberKeyConst was not overloaded by native module initialization")
    }
    _TSEnumMemberKey(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSEnumMemberKey was not overloaded by native module initialization")
    }
    _TSEnumMemberInitConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSEnumMemberInitConst was not overloaded by native module initialization")
    }
    _TSEnumMemberInit(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSEnumMemberInit was not overloaded by native module initialization")
    }
    _TSEnumMemberIsGeneratedConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'TSEnumMemberIsGeneratedConst was not overloaded by native module initialization")
    }
    _TSEnumMemberNameConst(context: KNativePointer, receiver: KNativePointer): KStringPtr {
        throw new Error("'TSEnumMemberNameConst was not overloaded by native module initialization")
    }
    _CreateSwitchStatement(context: KNativePointer, discriminant: KNativePointer, cases: BigUint64Array, casesSequenceLength: KUInt): KNativePointer {
        throw new Error("'CreateSwitchStatement was not overloaded by native module initialization")
    }
    _UpdateSwitchStatement(context: KNativePointer, original: KNativePointer, discriminant: KNativePointer, cases: BigUint64Array, casesSequenceLength: KUInt): KNativePointer {
        throw new Error("'UpdateSwitchStatement was not overloaded by native module initialization")
    }
    _SwitchStatementDiscriminantConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'SwitchStatementDiscriminantConst was not overloaded by native module initialization")
    }
    _SwitchStatementDiscriminant(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'SwitchStatementDiscriminant was not overloaded by native module initialization")
    }
    _SwitchStatementCasesConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'SwitchStatementCasesConst was not overloaded by native module initialization")
    }
    _SwitchStatementCases(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'SwitchStatementCases was not overloaded by native module initialization")
    }
    _CreateDoWhileStatement(context: KNativePointer, body: KNativePointer, test: KNativePointer): KNativePointer {
        throw new Error("'CreateDoWhileStatement was not overloaded by native module initialization")
    }
    _UpdateDoWhileStatement(context: KNativePointer, original: KNativePointer, body: KNativePointer, test: KNativePointer): KNativePointer {
        throw new Error("'UpdateDoWhileStatement was not overloaded by native module initialization")
    }
    _DoWhileStatementBodyConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'DoWhileStatementBodyConst was not overloaded by native module initialization")
    }
    _DoWhileStatementBody(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'DoWhileStatementBody was not overloaded by native module initialization")
    }
    _DoWhileStatementTestConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'DoWhileStatementTestConst was not overloaded by native module initialization")
    }
    _DoWhileStatementTest(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'DoWhileStatementTest was not overloaded by native module initialization")
    }
    _CreateCatchClause(context: KNativePointer, param: KNativePointer, body: KNativePointer): KNativePointer {
        throw new Error("'CreateCatchClause was not overloaded by native module initialization")
    }
    _UpdateCatchClause(context: KNativePointer, original: KNativePointer, param: KNativePointer, body: KNativePointer): KNativePointer {
        throw new Error("'UpdateCatchClause was not overloaded by native module initialization")
    }
    _CatchClauseParam(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'CatchClauseParam was not overloaded by native module initialization")
    }
    _CatchClauseParamConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'CatchClauseParamConst was not overloaded by native module initialization")
    }
    _CatchClauseBody(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'CatchClauseBody was not overloaded by native module initialization")
    }
    _CatchClauseBodyConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'CatchClauseBodyConst was not overloaded by native module initialization")
    }
    _CatchClauseIsDefaultCatchClauseConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'CatchClauseIsDefaultCatchClauseConst was not overloaded by native module initialization")
    }
    _CreateSequenceExpression(context: KNativePointer, sequence_arg: BigUint64Array, sequence_argSequenceLength: KUInt): KNativePointer {
        throw new Error("'CreateSequenceExpression was not overloaded by native module initialization")
    }
    _UpdateSequenceExpression(context: KNativePointer, original: KNativePointer, sequence_arg: BigUint64Array, sequence_argSequenceLength: KUInt): KNativePointer {
        throw new Error("'UpdateSequenceExpression was not overloaded by native module initialization")
    }
    _SequenceExpressionSequenceConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'SequenceExpressionSequenceConst was not overloaded by native module initialization")
    }
    _SequenceExpressionSequence(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'SequenceExpressionSequence was not overloaded by native module initialization")
    }
    _CreateArrowFunctionExpression(context: KNativePointer, func: KNativePointer): KNativePointer {
        throw new Error("'CreateArrowFunctionExpression was not overloaded by native module initialization")
    }
    _UpdateArrowFunctionExpression(context: KNativePointer, original: KNativePointer, func: KNativePointer): KNativePointer {
        throw new Error("'UpdateArrowFunctionExpression was not overloaded by native module initialization")
    }
    _CreateArrowFunctionExpression1(context: KNativePointer, other: KNativePointer): KNativePointer {
        throw new Error("'CreateArrowFunctionExpression1 was not overloaded by native module initialization")
    }
    _UpdateArrowFunctionExpression1(context: KNativePointer, original: KNativePointer, other: KNativePointer): KNativePointer {
        throw new Error("'UpdateArrowFunctionExpression1 was not overloaded by native module initialization")
    }
    _ArrowFunctionExpressionFunctionConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ArrowFunctionExpressionFunctionConst was not overloaded by native module initialization")
    }
    _ArrowFunctionExpressionFunction(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ArrowFunctionExpressionFunction was not overloaded by native module initialization")
    }
    _ArrowFunctionExpressionCreateTypeAnnotation(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ArrowFunctionExpressionCreateTypeAnnotation was not overloaded by native module initialization")
    }
    _ArrowFunctionExpressionAnnotations(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ArrowFunctionExpressionAnnotations was not overloaded by native module initialization")
    }
    _ArrowFunctionExpressionAnnotationsConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ArrowFunctionExpressionAnnotationsConst was not overloaded by native module initialization")
    }
    _ArrowFunctionExpressionSetAnnotations(context: KNativePointer, receiver: KNativePointer, annotations: BigUint64Array, annotationsSequenceLength: KUInt): void {
        throw new Error("'ArrowFunctionExpressionSetAnnotations was not overloaded by native module initialization")
    }
    _CreateOmittedExpression(context: KNativePointer): KNativePointer {
        throw new Error("'CreateOmittedExpression was not overloaded by native module initialization")
    }
    _UpdateOmittedExpression(context: KNativePointer, original: KNativePointer): KNativePointer {
        throw new Error("'UpdateOmittedExpression was not overloaded by native module initialization")
    }
    _CreateETSNewClassInstanceExpression(context: KNativePointer, typeReference: KNativePointer, _arguments: BigUint64Array, _argumentsSequenceLength: KUInt): KNativePointer {
        throw new Error("'CreateETSNewClassInstanceExpression was not overloaded by native module initialization")
    }
    _UpdateETSNewClassInstanceExpression(context: KNativePointer, original: KNativePointer, typeReference: KNativePointer, _arguments: BigUint64Array, _argumentsSequenceLength: KUInt): KNativePointer {
        throw new Error("'UpdateETSNewClassInstanceExpression was not overloaded by native module initialization")
    }
    _CreateETSNewClassInstanceExpression1(context: KNativePointer, other: KNativePointer): KNativePointer {
        throw new Error("'CreateETSNewClassInstanceExpression1 was not overloaded by native module initialization")
    }
    _UpdateETSNewClassInstanceExpression1(context: KNativePointer, original: KNativePointer, other: KNativePointer): KNativePointer {
        throw new Error("'UpdateETSNewClassInstanceExpression1 was not overloaded by native module initialization")
    }
    _ETSNewClassInstanceExpressionGetTypeRefConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ETSNewClassInstanceExpressionGetTypeRefConst was not overloaded by native module initialization")
    }
    _ETSNewClassInstanceExpressionGetArguments(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ETSNewClassInstanceExpressionGetArguments was not overloaded by native module initialization")
    }
    _ETSNewClassInstanceExpressionGetArgumentsConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ETSNewClassInstanceExpressionGetArgumentsConst was not overloaded by native module initialization")
    }
    _ETSNewClassInstanceExpressionSetArguments(context: KNativePointer, receiver: KNativePointer, _arguments: BigUint64Array, _argumentsSequenceLength: KUInt): void {
        throw new Error("'ETSNewClassInstanceExpressionSetArguments was not overloaded by native module initialization")
    }
    _ETSNewClassInstanceExpressionAddToArgumentsFront(context: KNativePointer, receiver: KNativePointer, expr: KNativePointer): void {
        throw new Error("'ETSNewClassInstanceExpressionAddToArgumentsFront was not overloaded by native module initialization")
    }
    _CreateTSAsExpression(context: KNativePointer, expression: KNativePointer, typeAnnotation: KNativePointer, isConst: KBoolean): KNativePointer {
        throw new Error("'CreateTSAsExpression was not overloaded by native module initialization")
    }
    _UpdateTSAsExpression(context: KNativePointer, original: KNativePointer, expression: KNativePointer, typeAnnotation: KNativePointer, isConst: KBoolean): KNativePointer {
        throw new Error("'UpdateTSAsExpression was not overloaded by native module initialization")
    }
    _TSAsExpressionExprConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSAsExpressionExprConst was not overloaded by native module initialization")
    }
    _TSAsExpressionExpr(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSAsExpressionExpr was not overloaded by native module initialization")
    }
    _TSAsExpressionSetExpr(context: KNativePointer, receiver: KNativePointer, expr: KNativePointer): void {
        throw new Error("'TSAsExpressionSetExpr was not overloaded by native module initialization")
    }
    _TSAsExpressionIsConstConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'TSAsExpressionIsConstConst was not overloaded by native module initialization")
    }
    _TSAsExpressionSetUncheckedCast(context: KNativePointer, receiver: KNativePointer, isUncheckedCast: KBoolean): void {
        throw new Error("'TSAsExpressionSetUncheckedCast was not overloaded by native module initialization")
    }
    _TSAsExpressionTypeAnnotationConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSAsExpressionTypeAnnotationConst was not overloaded by native module initialization")
    }
    _TSAsExpressionSetTsTypeAnnotation(context: KNativePointer, receiver: KNativePointer, typeAnnotation: KNativePointer): void {
        throw new Error("'TSAsExpressionSetTsTypeAnnotation was not overloaded by native module initialization")
    }
    _CreateForUpdateStatement(context: KNativePointer, init: KNativePointer, test: KNativePointer, update: KNativePointer, body: KNativePointer): KNativePointer {
        throw new Error("'CreateForUpdateStatement was not overloaded by native module initialization")
    }
    _ForUpdateStatementInit(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ForUpdateStatementInit was not overloaded by native module initialization")
    }
    _ForUpdateStatementInitConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ForUpdateStatementInitConst was not overloaded by native module initialization")
    }
    _ForUpdateStatementTest(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ForUpdateStatementTest was not overloaded by native module initialization")
    }
    _ForUpdateStatementTestConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ForUpdateStatementTestConst was not overloaded by native module initialization")
    }
    _ForUpdateStatementUpdateConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ForUpdateStatementUpdateConst was not overloaded by native module initialization")
    }
    _ForUpdateStatementBody(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ForUpdateStatementBody was not overloaded by native module initialization")
    }
    _ForUpdateStatementBodyConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ForUpdateStatementBodyConst was not overloaded by native module initialization")
    }
    _CreateETSTypeReferencePart(context: KNativePointer, name: KNativePointer, typeParams: KNativePointer, prev: KNativePointer): KNativePointer {
        throw new Error("'CreateETSTypeReferencePart was not overloaded by native module initialization")
    }
    _UpdateETSTypeReferencePart(context: KNativePointer, original: KNativePointer, name: KNativePointer, typeParams: KNativePointer, prev: KNativePointer): KNativePointer {
        throw new Error("'UpdateETSTypeReferencePart was not overloaded by native module initialization")
    }
    _CreateETSTypeReferencePart1(context: KNativePointer, name: KNativePointer): KNativePointer {
        throw new Error("'CreateETSTypeReferencePart1 was not overloaded by native module initialization")
    }
    _UpdateETSTypeReferencePart1(context: KNativePointer, original: KNativePointer, name: KNativePointer): KNativePointer {
        throw new Error("'UpdateETSTypeReferencePart1 was not overloaded by native module initialization")
    }
    _ETSTypeReferencePartPrevious(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ETSTypeReferencePartPrevious was not overloaded by native module initialization")
    }
    _ETSTypeReferencePartPreviousConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ETSTypeReferencePartPreviousConst was not overloaded by native module initialization")
    }
    _ETSTypeReferencePartName(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ETSTypeReferencePartName was not overloaded by native module initialization")
    }
    _ETSTypeReferencePartTypeParams(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ETSTypeReferencePartTypeParams was not overloaded by native module initialization")
    }
    _ETSTypeReferencePartNameConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ETSTypeReferencePartNameConst was not overloaded by native module initialization")
    }
    _ETSReExportDeclarationGetETSImportDeclarationsConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ETSReExportDeclarationGetETSImportDeclarationsConst was not overloaded by native module initialization")
    }
    _ETSReExportDeclarationGetETSImportDeclarations(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ETSReExportDeclarationGetETSImportDeclarations was not overloaded by native module initialization")
    }
    _ETSReExportDeclarationGetProgramPathConst(context: KNativePointer, receiver: KNativePointer): KStringPtr {
        throw new Error("'ETSReExportDeclarationGetProgramPathConst was not overloaded by native module initialization")
    }
    _CreateETSPrimitiveType(context: KNativePointer, type: KInt): KNativePointer {
        throw new Error("'CreateETSPrimitiveType was not overloaded by native module initialization")
    }
    _UpdateETSPrimitiveType(context: KNativePointer, original: KNativePointer, type: KInt): KNativePointer {
        throw new Error("'UpdateETSPrimitiveType was not overloaded by native module initialization")
    }
    _ETSPrimitiveTypeGetPrimitiveTypeConst(context: KNativePointer, receiver: KNativePointer): KInt {
        throw new Error("'ETSPrimitiveTypeGetPrimitiveTypeConst was not overloaded by native module initialization")
    }
    _TypeNodeAnnotations(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TypeNodeAnnotations was not overloaded by native module initialization")
    }
    _TypeNodeAnnotationsConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TypeNodeAnnotationsConst was not overloaded by native module initialization")
    }
    _TypeNodeSetAnnotations(context: KNativePointer, receiver: KNativePointer, annotations: BigUint64Array, annotationsSequenceLength: KUInt): void {
        throw new Error("'TypeNodeSetAnnotations was not overloaded by native module initialization")
    }
    _CreateNewExpression(context: KNativePointer, callee: KNativePointer, _arguments: BigUint64Array, _argumentsSequenceLength: KUInt): KNativePointer {
        throw new Error("'CreateNewExpression was not overloaded by native module initialization")
    }
    _UpdateNewExpression(context: KNativePointer, original: KNativePointer, callee: KNativePointer, _arguments: BigUint64Array, _argumentsSequenceLength: KUInt): KNativePointer {
        throw new Error("'UpdateNewExpression was not overloaded by native module initialization")
    }
    _NewExpressionCalleeConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'NewExpressionCalleeConst was not overloaded by native module initialization")
    }
    _NewExpressionArgumentsConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'NewExpressionArgumentsConst was not overloaded by native module initialization")
    }
    _CreateTSParameterProperty(context: KNativePointer, accessibility: KInt, parameter: KNativePointer, readonly_arg: KBoolean, isStatic: KBoolean, isExport: KBoolean): KNativePointer {
        throw new Error("'CreateTSParameterProperty was not overloaded by native module initialization")
    }
    _UpdateTSParameterProperty(context: KNativePointer, original: KNativePointer, accessibility: KInt, parameter: KNativePointer, readonly_arg: KBoolean, isStatic: KBoolean, isExport: KBoolean): KNativePointer {
        throw new Error("'UpdateTSParameterProperty was not overloaded by native module initialization")
    }
    _TSParameterPropertyAccessibilityConst(context: KNativePointer, receiver: KNativePointer): KInt {
        throw new Error("'TSParameterPropertyAccessibilityConst was not overloaded by native module initialization")
    }
    _TSParameterPropertyReadonlyConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'TSParameterPropertyReadonlyConst was not overloaded by native module initialization")
    }
    _TSParameterPropertyIsStaticConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'TSParameterPropertyIsStaticConst was not overloaded by native module initialization")
    }
    _TSParameterPropertyIsExportConst(context: KNativePointer, receiver: KNativePointer): KBoolean {
        throw new Error("'TSParameterPropertyIsExportConst was not overloaded by native module initialization")
    }
    _TSParameterPropertyParameterConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'TSParameterPropertyParameterConst was not overloaded by native module initialization")
    }
    _CreateETSWildcardType(context: KNativePointer, typeReference: KNativePointer, flags: KInt): KNativePointer {
        throw new Error("'CreateETSWildcardType was not overloaded by native module initialization")
    }
    _UpdateETSWildcardType(context: KNativePointer, original: KNativePointer, typeReference: KNativePointer, flags: KInt): KNativePointer {
        throw new Error("'UpdateETSWildcardType was not overloaded by native module initialization")
    }
    _ETSWildcardTypeTypeReference(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ETSWildcardTypeTypeReference was not overloaded by native module initialization")
    }
    _ETSWildcardTypeTypeReferenceConst(context: KNativePointer, receiver: KNativePointer): KNativePointer {
        throw new Error("'ETSWildcardTypeTypeReferenceConst was not overloaded by native module initialization")
    }
    _CreateTSThisType(context: KNativePointer): KNativePointer {
        throw new Error("'CreateTSThisType was not overloaded by native module initialization")
    }
    _UpdateTSThisType(context: KNativePointer, original: KNativePointer): KNativePointer {
        throw new Error("'UpdateTSThisType was not overloaded by native module initialization")
    }
    _CreateInterfaceDecl(context: KNativePointer, name: KStringPtr): KNativePointer {
        throw new Error("'CreateInterfaceDecl was not overloaded by native module initialization")
    }
    _CreateInterfaceDecl1(context: KNativePointer, name: KStringPtr, declNode: KNativePointer): KNativePointer {
        throw new Error("'CreateInterfaceDecl1 was not overloaded by native module initialization")
    }
    _CreateFunctionDecl(context: KNativePointer, name: KStringPtr, node: KNativePointer): KNativePointer {
        throw new Error("'CreateFunctionDecl was not overloaded by native module initialization")
    }
}
