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

#include "common.h"

KBoolean impl_ClassDefinitionIsFromStructConst(KNativePointer contextPtr, KNativePointer instancePtr)
{
    auto context = reinterpret_cast<es2panda_Context *>(contextPtr);
    auto node = reinterpret_cast<es2panda_AstNode*>(instancePtr);
    return GetImpl()->ClassDefinitionIsFromStructConst(context, node);
}
KOALA_INTEROP_2(ClassDefinitionIsFromStructConst, KBoolean, KNativePointer, KNativePointer);

void impl_ClassDefinitionSetFromStructModifier(KNativePointer contextPtr, KNativePointer instancePtr)
{
    auto context = reinterpret_cast<es2panda_Context *>(contextPtr);
    auto node = reinterpret_cast<es2panda_AstNode*>(instancePtr);
    return GetImpl()->ClassDefinitionSetFromStructModifier(context, node);
}
KOALA_INTEROP_V2(ClassDefinitionSetFromStructModifier, KNativePointer, KNativePointer);

KBoolean impl_ImportSpecifierIsRemovableConst(KNativePointer contextPtr, KNativePointer instancePtr)
{
    auto context = reinterpret_cast<es2panda_Context *>(contextPtr);
    auto node = reinterpret_cast<es2panda_AstNode*>(instancePtr);
    return GetImpl()->ImportSpecifierIsRemovableConst(context, node);
}
KOALA_INTEROP_2(ImportSpecifierIsRemovableConst, KBoolean, KNativePointer, KNativePointer);

void impl_ImportSpecifierSetRemovable(KNativePointer contextPtr, KNativePointer instancePtr)
{
    auto context = reinterpret_cast<es2panda_Context *>(contextPtr);
    auto node = reinterpret_cast<es2panda_AstNode*>(instancePtr);
    return GetImpl()->ImportSpecifierSetRemovable(context, node, true);
}
KOALA_INTEROP_V2(ImportSpecifierSetRemovable, KNativePointer, KNativePointer);

KNativePointer impl_AstNodeRecheck(KNativePointer contextPtr, KNativePointer nodePtr)
{
    auto context = reinterpret_cast<es2panda_Context*>(contextPtr);
    auto node = reinterpret_cast<es2panda_AstNode*>(nodePtr);
    GetImpl()->AstNodeRecheck(context, node);
    return nullptr;
}
KOALA_INTEROP_2(AstNodeRecheck, KNativePointer, KNativePointer, KNativePointer)

KNativePointer impl_AstNodeRebind(KNativePointer contextPtr, KNativePointer nodePtr)
{
    auto context = reinterpret_cast<es2panda_Context*>(contextPtr);
    auto node = reinterpret_cast<es2panda_AstNode*>(nodePtr);
    GetImpl()->AstNodeRebind(context, node);
    return nullptr;
}
KOALA_INTEROP_2(AstNodeRebind, KNativePointer, KNativePointer, KNativePointer)

KNativePointer impl_AnnotationAllowedAnnotations(KNativePointer contextPtr, KNativePointer nodePtr, KNativePointer returnLen)
{
    auto context = reinterpret_cast<es2panda_Context*>(contextPtr);
    auto node = reinterpret_cast<es2panda_AstNode*>(nodePtr);
    std::size_t params_len = 0;
    auto annotations = GetImpl()->AnnotationAllowedAnnotations(context, node, &params_len);
    return new std::vector<void*>(annotations, annotations + params_len);
}
KOALA_INTEROP_3(AnnotationAllowedAnnotations, KNativePointer, KNativePointer, KNativePointer, KNativePointer)

KNativePointer impl_AnnotationAllowedAnnotationsConst(KNativePointer contextPtr, KNativePointer nodePtr, KNativePointer returnLen)
{
    auto context = reinterpret_cast<es2panda_Context*>(contextPtr);
    auto node = reinterpret_cast<es2panda_AstNode*>(nodePtr);
    std::size_t params_len = 0;
    auto annotations = GetImpl()->AnnotationAllowedAnnotationsConst(context, node, &params_len);
    return new std::vector<void*>(annotations, annotations + params_len);
}
KOALA_INTEROP_3(AnnotationAllowedAnnotationsConst, KNativePointer, KNativePointer, KNativePointer, KNativePointer)

KNativePointer impl_AstNodeVariableConst(KNativePointer contextPtr, KNativePointer nodePtr)
{
    auto context = reinterpret_cast<es2panda_Context*>(contextPtr);
    auto node = reinterpret_cast<es2panda_AstNode*>(nodePtr);

    return GetImpl()->AstNodeVariableConst(context, node);
}
KOALA_INTEROP_2(AstNodeVariableConst, KNativePointer, KNativePointer, KNativePointer)

KNativePointer impl_VariableDeclaration(KNativePointer contextPtr, KNativePointer variablePtr)
{
    auto context = reinterpret_cast<es2panda_Context*>(contextPtr);
    auto variable = reinterpret_cast<es2panda_Variable*>(variablePtr);

    return GetImpl()->VariableDeclaration(context, variable);
}
KOALA_INTEROP_2(VariableDeclaration, KNativePointer, KNativePointer, KNativePointer)

KNativePointer impl_DeclNode(KNativePointer contextPtr, KNativePointer declPtr)
{
    auto context = reinterpret_cast<es2panda_Context*>(contextPtr);
    auto decl = reinterpret_cast<es2panda_Declaration*>(declPtr);

    return GetImpl()->DeclNode(context, decl);
}
KOALA_INTEROP_2(DeclNode, KNativePointer, KNativePointer, KNativePointer)

KNativePointer impl_AstNodeScopeConst(KNativePointer contextPtr, KNativePointer nodePtr)
{
    auto context = reinterpret_cast<es2panda_Context*>(contextPtr);
    auto node = reinterpret_cast<es2panda_AstNode*>(nodePtr);
    return GetImpl()->AstNodeScopeConst(context, node);
}
KOALA_INTEROP_2(AstNodeScopeConst, KNativePointer, KNativePointer, KNativePointer)

KNativePointer impl_ScopeSetParent(KNativePointer contextPtr, KNativePointer nodePtr, KNativePointer parentPtr)
{
    auto context = reinterpret_cast<es2panda_Context*>(contextPtr);
    auto node = reinterpret_cast<es2panda_Scope*>(nodePtr);
    auto parent = reinterpret_cast<es2panda_Scope*>(parentPtr);
    GetImpl()->ScopeSetParent(context, node, parent);
    return node;
}
KOALA_INTEROP_3(ScopeSetParent, KNativePointer, KNativePointer, KNativePointer, KNativePointer)

KNativePointer impl_CreateNumberLiteral(KNativePointer contextPtr, KDouble value)
{
    auto context = reinterpret_cast<es2panda_Context*>(contextPtr);

    return GetImpl()->CreateNumberLiteral(context, value);
}
KOALA_INTEROP_2(CreateNumberLiteral, KNativePointer, KNativePointer, KDouble)

KNativePointer impl_ETSParserCreateExpression(KNativePointer contextPtr, KStringPtr& sourceCodePtr, KInt flagsT)
{
    auto context = reinterpret_cast<es2panda_Context*>(contextPtr);
    auto flags = static_cast<Es2pandaExpressionParseFlags>(flagsT);

    return GetImpl()->ETSParserCreateExpression(context, getStringCopy(sourceCodePtr), flags);
}
KOALA_INTEROP_3(ETSParserCreateExpression, KNativePointer, KNativePointer, KStringPtr, KInt)

KBoolean impl_IsProgram(KNativePointer contextPtr, KNativePointer nodePtr)
{
    auto context = reinterpret_cast<es2panda_Context*>(contextPtr);
    auto node = reinterpret_cast<es2panda_AstNode*>(nodePtr);
    return GetImpl()->AstNodeIsProgramConst(context, node);
}
KOALA_INTEROP_2(IsProgram, KBoolean, KNativePointer, KNativePointer)

KBoolean impl_IsBlockStatement(KNativePointer nodePtr)
{
    auto node = reinterpret_cast<es2panda_AstNode*>(nodePtr);
    return GetImpl()->IsBlockStatement(node);
}
KOALA_INTEROP_1(IsBlockStatement, KBoolean, KNativePointer)

KNativePointer impl_ProceedToState(KNativePointer contextPtr, KInt state)
{
    auto context = reinterpret_cast<es2panda_Context*>(contextPtr);
    return GetImpl()->ProceedToState(context, intToState(state));
}
KOALA_INTEROP_2(ProceedToState, KNativePointer, KNativePointer, KInt)

KNativePointer impl_ContextProgram(KNativePointer contextPtr)
{
    auto context = reinterpret_cast<es2panda_Context*>(contextPtr);
    return GetImpl()->ContextProgram(context);
}
KOALA_INTEROP_1(ContextProgram, KNativePointer, KNativePointer)

KNativePointer impl_ProgramAst(KNativePointer contextPtr, KNativePointer programPtr)
{
    auto context = reinterpret_cast<es2panda_Context*>(programPtr);
    auto program = reinterpret_cast<es2panda_Program*>(programPtr);
    return GetImpl()->ProgramAst(context, program);
}
KOALA_INTEROP_2(ProgramAst, KNativePointer, KNativePointer, KNativePointer)

KBoolean impl_IsIdentifier(KNativePointer nodePtr)
{
    auto node = reinterpret_cast<es2panda_AstNode*>(nodePtr);
    return GetImpl()->IsIdentifier(node);
}
KOALA_INTEROP_1(IsIdentifier, KBoolean, KNativePointer)

KNativePointer impl_CreateContextFromString(KNativePointer configPtr, KStringPtr& sourcePtr, KStringPtr& filenamePtr)
{
    auto config = reinterpret_cast<es2panda_Config*>(configPtr);
    return GetImpl()->CreateContextFromString(config, sourcePtr.data(), filenamePtr.data());
}
KOALA_INTEROP_3(CreateContextFromString, KNativePointer, KNativePointer, KStringPtr, KStringPtr)

KNativePointer impl_CreateContextFromFile(KNativePointer configPtr, KStringPtr& filenamePtr)
{
    auto config = reinterpret_cast<es2panda_Config*>(configPtr);
    return GetImpl()->CreateContextFromFile(config, getStringCopy(filenamePtr));
}
KOALA_INTEROP_2(CreateContextFromFile, KNativePointer, KNativePointer, KStringPtr)

KInt impl_ContextState(KNativePointer contextPtr)
{
    auto context = reinterpret_cast<es2panda_Context*>(contextPtr);

    return static_cast<KInt>(GetImpl()->ContextState(context));
}
KOALA_INTEROP_1(ContextState, KInt, KNativePointer)

KNativePointer impl_ContextErrorMessage(KNativePointer contextPtr)
{
    auto context = reinterpret_cast<es2panda_Context*>(contextPtr);

    return new string(GetImpl()->ContextErrorMessage(context));
}
KOALA_INTEROP_1(ContextErrorMessage, KNativePointer, KNativePointer)

KNativePointer impl_GetAllErrorMessages(KNativePointer contextPtr)
{
    auto context = reinterpret_cast<es2panda_Context*>(contextPtr);

    return new string(GetImpl()->GetAllErrorMessages(context));
}
KOALA_INTEROP_1(GetAllErrorMessages, KNativePointer, KNativePointer)

KNativePointer impl_CallExpressionSignature(KNativePointer context, KNativePointer classInstance)
{
    const auto _context = reinterpret_cast<es2panda_Context*>(context);
    const auto _classInstance = reinterpret_cast<es2panda_AstNode*>(classInstance);
    const auto result = GetImpl()->CallExpressionSignature(_context, _classInstance);
    return result;
}
KOALA_INTEROP_2(CallExpressionSignature, KNativePointer, KNativePointer, KNativePointer)

KNativePointer impl_SignatureFunction(KNativePointer context, KNativePointer classInstance)
{
    const auto _context = reinterpret_cast<es2panda_Context*>(context);
    const auto _classInstance = reinterpret_cast<es2panda_Signature*>(classInstance);
    const auto result = GetImpl()->SignatureFunction(_context, _classInstance);
    return result;
}
KOALA_INTEROP_2(SignatureFunction, KNativePointer, KNativePointer, KNativePointer)

KNativePointer impl_DeclarationFromIdentifier(KNativePointer context, KNativePointer identifier)
{
    const auto _context = reinterpret_cast<es2panda_Context*>(context);
    const auto _identifier = reinterpret_cast<es2panda_AstNode*>(identifier);
    const auto result = GetImpl()->DeclarationFromIdentifier(_context, _identifier);
    return result;
}
KOALA_INTEROP_2(DeclarationFromIdentifier, KNativePointer, KNativePointer, KNativePointer)

static KNativePointer impl_ProgramExternalSources(KNativePointer contextPtr, KNativePointer instancePtr)
{
    auto context = reinterpret_cast<es2panda_Context*>(contextPtr);
    auto&& instance = reinterpret_cast<es2panda_Program *>(instancePtr);
    std::size_t source_len = 0;
    auto external_sources = GetImpl()->ProgramExternalSources(context, instance, &source_len);
    return new std::vector<void*>(external_sources, external_sources + source_len);
}
KOALA_INTEROP_2(ProgramExternalSources, KNativePointer, KNativePointer, KNativePointer);

static KNativePointer impl_ExternalSourceName(KNativePointer instance)
{
    auto&& _instance_ = reinterpret_cast<es2panda_ExternalSource *>(instance);
    auto&& _result_ = GetImpl()->ExternalSourceName(_instance_);
    return new std::string(_result_);
}
KOALA_INTEROP_1(ExternalSourceName, KNativePointer, KNativePointer);

static KNativePointer impl_ExternalSourcePrograms(KNativePointer instance)
{
    auto&& _instance_ = reinterpret_cast<es2panda_ExternalSource *>(instance);
    std::size_t program_len = 0;
    auto programs = GetImpl()->ExternalSourcePrograms(_instance_, &program_len);
    return new std::vector<void*>(programs, programs + program_len);
}
KOALA_INTEROP_1(ExternalSourcePrograms, KNativePointer, KNativePointer);

KNativePointer impl_CreateContextGenerateAbcForExternalSourceFiles(
    KNativePointer configPtr, KInt fileNamesCount, KStringArray fileNames)
{
    auto config = reinterpret_cast<es2panda_Config *>(configPtr);
    const std::size_t headerLen = 4;
    const char **argv =
        new const char *[static_cast<unsigned int>(fileNamesCount)];
    std::size_t position = headerLen;
    std::size_t strLen;
    for (std::size_t i = 0; i < static_cast<std::size_t>(fileNamesCount); ++i) {
        strLen = unpackUInt(fileNames + position);
        position += headerLen;
        argv[i] = strdup(std::string(reinterpret_cast<const char *>(fileNames + position),
            strLen).c_str());
        position += strLen;
    }
    auto context = GetImpl()->CreateContextGenerateAbcForExternalSourceFiles(
        config, fileNamesCount, argv);
    delete[] argv;
    return context;
}
KOALA_INTEROP_3(CreateContextGenerateAbcForExternalSourceFiles, KNativePointer, KNativePointer, KInt, KStringArray)

KBoolean impl_IsClassProperty(KNativePointer nodePtr)
{
    auto node = reinterpret_cast<es2panda_AstNode*>(nodePtr);
    return GetImpl()->IsClassProperty(node);
}
KOALA_INTEROP_1(IsClassProperty, KBoolean, KNativePointer)

KBoolean impl_IsETSUnionType(KNativePointer nodePtr)
{
    auto node = reinterpret_cast<es2panda_AstNode*>(nodePtr);
    return GetImpl()->IsETSUnionType(node);
}
KOALA_INTEROP_1(IsETSUnionType, KBoolean, KNativePointer)

KBoolean impl_IsETSFunctionType(KNativePointer nodePtr)
{
    auto node = reinterpret_cast<es2panda_AstNode*>(nodePtr);
    return GetImpl()->IsETSFunctionType(node);
}
KOALA_INTEROP_1(IsETSFunctionType, KBoolean, KNativePointer)

KInt impl_GenerateTsDeclarationsFromContext(KNativePointer contextPtr, KStringPtr &outputDeclEts, KStringPtr &outputEts,
                                            KBoolean exportAll)
{
    auto context = reinterpret_cast<es2panda_Context *>(contextPtr);
    return GetImpl()->GenerateTsDeclarationsFromContext(context, outputDeclEts.data(), outputEts.data(), exportAll);
}
KOALA_INTEROP_4(GenerateTsDeclarationsFromContext, KInt, KNativePointer, KStringPtr, KStringPtr, KBoolean)

void impl_InsertETSImportDeclarationAndParse(KNativePointer context, KNativePointer program,
                                             KNativePointer importDeclaration)
{
    const auto _context = reinterpret_cast<es2panda_Context*>(context);
    const auto _program = reinterpret_cast<es2panda_Program *>(program);
    const auto _ast = reinterpret_cast<es2panda_AstNode*>(importDeclaration);
    GetImpl()->InsertETSImportDeclarationAndParse(_context, _program, _ast);
    return ;
}
KOALA_INTEROP_V3(InsertETSImportDeclarationAndParse, KNativePointer, KNativePointer, KNativePointer);

KNativePointer impl_ETSParserGetImportPathManager(KNativePointer contextPtr)
{
    auto context = reinterpret_cast<es2panda_Context*>(contextPtr);
    return GetImpl()->ETSParserGetImportPathManager(context);
}
KOALA_INTEROP_1(ETSParserGetImportPathManager, KNativePointer, KNativePointer);

KNativePointer impl_CreateSourcePosition(KNativePointer context, KInt index, KInt line)
{
    auto&& _context_ = reinterpret_cast<es2panda_Context *>(context);
    return GetImpl()->CreateSourcePosition(_context_, index, line);
}
KOALA_INTEROP_3(CreateSourcePosition, KNativePointer, KNativePointer, KInt, KInt);

KInt impl_SourcePositionIndex(KNativePointer context, KNativePointer instance)
{
    auto&& _context_ = reinterpret_cast<es2panda_Context *>(context);
    auto&& _instance_ = reinterpret_cast<es2panda_SourcePosition *>(instance);
    return GetImpl()->SourcePositionIndex(_context_, _instance_);
}
KOALA_INTEROP_2(SourcePositionIndex, KInt, KNativePointer, KNativePointer);

KInt impl_SourcePositionLine(KNativePointer context, KNativePointer instance)
{
    auto&& _context_ = reinterpret_cast<es2panda_Context *>(context);
    auto&& _instance_ = reinterpret_cast<es2panda_SourcePosition *>(instance);
    return GetImpl()->SourcePositionLine(_context_, _instance_);
}
KOALA_INTEROP_2(SourcePositionLine, KInt, KNativePointer, KNativePointer);

KNativePointer impl_CreateSourceRange(KNativePointer context, KNativePointer start, KNativePointer end)
{
    auto&& _context_ = reinterpret_cast<es2panda_Context *>(context);
    auto&& _start_ = reinterpret_cast<es2panda_SourcePosition *>(start);
    auto&& _end_ = reinterpret_cast<es2panda_SourcePosition *>(end);
    return GetImpl()->CreateSourceRange(_context_, _start_, _end_);
}
KOALA_INTEROP_3(CreateSourceRange, KNativePointer, KNativePointer, KNativePointer, KNativePointer);

KNativePointer impl_CreateETSStringLiteralType(KNativePointer contextPtr, KStringPtr& str)
{
    auto context = reinterpret_cast<es2panda_Context*>(contextPtr);
    const auto _str = getStringCopy(str);
    return GetImpl()->CreateETSStringLiteralType(context, _str);
}
KOALA_INTEROP_2(CreateETSStringLiteralType, KNativePointer, KNativePointer, KStringPtr)

KNativePointer impl_ProgramFileNameConst(KNativePointer contextPtr, KNativePointer programPtr)
{
    auto context = reinterpret_cast<es2panda_Context*>(contextPtr);
    auto program = reinterpret_cast<es2panda_Program*>(programPtr);
    auto result = GetImpl()->ProgramFileNameConst(context, program);
    return new std::string(result);
}
KOALA_INTEROP_2(ProgramFileNameConst, KNativePointer, KNativePointer, KNativePointer)

KNativePointer impl_ProgramFileNameWithExtensionConst(KNativePointer contextPtr, KNativePointer programPtr)
{
    auto context = reinterpret_cast<es2panda_Context*>(contextPtr);
    auto program = reinterpret_cast<es2panda_Program*>(programPtr);
    auto result = GetImpl()->ProgramFileNameWithExtensionConst(context, program);
    return new std::string(result);
}
KOALA_INTEROP_2(ProgramFileNameWithExtensionConst, KNativePointer, KNativePointer, KNativePointer)

KNativePointer impl_ETSParserGetGlobalProgramAbsName(KNativePointer contextPtr)
{
    auto context = reinterpret_cast<es2panda_Context*>(contextPtr);
    auto result = GetImpl()->ETSParserGetGlobalProgramAbsName(context);
    return new std::string(result);
}
KOALA_INTEROP_1(ETSParserGetGlobalProgramAbsName, KNativePointer, KNativePointer)

KNativePointer impl_ClassVariableDeclaration(KNativePointer context, KNativePointer classInstance)
{
    const auto _context = reinterpret_cast<es2panda_Context*>(context);
    const auto _classInstance = reinterpret_cast<es2panda_AstNode*>(classInstance);
    auto _typedTsType = GetImpl()->TypedTsType(_context, _classInstance);
    if (_typedTsType == nullptr) {
        return nullptr;
    }
    const auto _instanceType = reinterpret_cast<es2panda_Type*>(_typedTsType);
    auto _typeVar = GetImpl()->TypeVariable(_context, _instanceType);
    if (_typeVar == nullptr) {
        return nullptr;
    }
    const auto result = reinterpret_cast<es2panda_Declaration*>(GetImpl()->VariableDeclaration(_context, _typeVar));
    const auto declNode = GetImpl()->DeclNode(_context, result);
    return declNode;
}
KOALA_INTEROP_2(ClassVariableDeclaration, KNativePointer, KNativePointer, KNativePointer)

KBoolean impl_IsMethodDefinition(KNativePointer nodePtr)
{
    auto node = reinterpret_cast<es2panda_AstNode*>(nodePtr);
    return GetImpl()->IsMethodDefinition(node);
}
KOALA_INTEROP_1(IsMethodDefinition, KBoolean, KNativePointer)

KNativePointer impl_CreateETSImportDeclaration(KNativePointer context, KNativePointer source,
                                               KNativePointerArray specifiers, KUInt specifiersSequenceLength,
                                               KInt importKind, KNativePointer programPtr, KInt flags)
{
    const auto _context = reinterpret_cast<es2panda_Context*>(context);
    const auto _source = reinterpret_cast<es2panda_AstNode*>(source);
    const auto _specifiers = reinterpret_cast<es2panda_AstNode**>(specifiers);
    const auto _specifiersSequenceLength = static_cast<KUInt>(specifiersSequenceLength);
    const auto _importKind = static_cast<Es2pandaImportKinds>(importKind);
    const auto _program = reinterpret_cast<es2panda_Program*>(programPtr);
    const auto _flags = static_cast<Es2pandaImportFlags>(flags);
    auto result = GetImpl()->ETSParserBuildImportDeclaration(_context, _importKind, _specifiers,
                                                             _specifiersSequenceLength, _source, _program, _flags);
    return result;
}
KOALA_INTEROP_7(CreateETSImportDeclaration, KNativePointer, KNativePointer, KNativePointer, KNativePointerArray,
                KUInt, KInt, KNativePointer, KInt)

KNativePointer impl_AstNodeRangeConst(KNativePointer context, KNativePointer node)
{
    const auto _context = reinterpret_cast<es2panda_Context*>(context);
    const auto _node = reinterpret_cast<es2panda_AstNode*>(node);
    auto result = GetImpl()->AstNodeRangeConst(_context, _node);
    return (void*)result;
}
KOALA_INTEROP_2(AstNodeRangeConst, KNativePointer, KNativePointer, KNativePointer)

KNativePointer impl_SourceRangeStart(KNativePointer context, KNativePointer range)
{
    const auto _context = reinterpret_cast<es2panda_Context*>(context);
    const auto _range = reinterpret_cast<es2panda_SourceRange*>(range);
    auto result = GetImpl()->SourceRangeStart(_context, _range);
    return result;
}
KOALA_INTEROP_2(SourceRangeStart, KNativePointer, KNativePointer, KNativePointer)

KNativePointer impl_SourceRangeEnd(KNativePointer context, KNativePointer range)
{
    const auto _context = reinterpret_cast<es2panda_Context*>(context);
    const auto _range = reinterpret_cast<es2panda_SourceRange*>(range);
    auto result = GetImpl()->SourceRangeEnd(_context, _range);
    return result;
}
KOALA_INTEROP_2(SourceRangeEnd, KNativePointer, KNativePointer, KNativePointer)
bool impl_ClassPropertyIsDefaultAccessModifierConst(KNativePointer context, KNativePointer receiver)
{
    const auto _context = reinterpret_cast<es2panda_Context*>(context);
    const auto _receiver = reinterpret_cast<es2panda_AstNode*>(receiver);
    return GetImpl()->ClassPropertyIsDefaultAccessModifierConst(_context, _receiver);
}
KOALA_INTEROP_2(ClassPropertyIsDefaultAccessModifierConst, KBoolean, KNativePointer, KNativePointer);

KNativePointer impl_AstNodeStartConst(KNativePointer context, KNativePointer receiver)
{
    const auto _context = reinterpret_cast<es2panda_Context*>(context);
    const auto _receiver = reinterpret_cast<es2panda_AstNode*>(receiver);
    return const_cast<es2panda_SourcePosition *>(GetImpl()->AstNodeStartConst(_context, _receiver));
}
KOALA_INTEROP_2(AstNodeStartConst, KNativePointer, KNativePointer, KNativePointer);

KNativePointer impl_AstNodeEndConst(KNativePointer context, KNativePointer receiver)
{
    const auto _context = reinterpret_cast<es2panda_Context*>(context);
    const auto _receiver = reinterpret_cast<es2panda_AstNode*>(receiver);
    return const_cast<es2panda_SourcePosition *>(GetImpl()->AstNodeEndConst(_context, _receiver));
}
KOALA_INTEROP_2(AstNodeEndConst, KNativePointer, KNativePointer, KNativePointer);

KBoolean impl_IsArrayExpression(KNativePointer nodePtr)
{
    auto node = reinterpret_cast<es2panda_AstNode*>(nodePtr);
    return GetImpl()->IsArrayExpression(node);
}
KOALA_INTEROP_1(IsArrayExpression, KBoolean, KNativePointer)

inline KUInt unpackUInt(const KByte* bytes)
{
    const KUInt BYTE_0 = 0;
    const KUInt BYTE_1 = 1;
    const KUInt BYTE_2 = 2;
    const KUInt BYTE_3 = 3;

    const KUInt BYTE_1_SHIFT = 8;
    const KUInt BYTE_2_SHIFT = 16;
    const KUInt BYTE_3_SHIFT = 24;
    return (bytes[BYTE_0] | (bytes[BYTE_1] << BYTE_1_SHIFT)
        | (bytes[BYTE_2] << BYTE_2_SHIFT) | (bytes[BYTE_3] << BYTE_3_SHIFT)
    );
}
