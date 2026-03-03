/*
 * Copyright (c) 2024-2025 Huawei Device Co., Ltd.
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

#include <mutex>
#include <set>
#include <string>

#include "common.h"

/** XXX: If you add or remove methods that exist in C API,
 * please change generator/options.json5 accordingly.
 */

KNativePointer impl_ETSParserCreateExpression(KNativePointer contextPtr, KStringPtr& sourceCodePtr, KInt flagsT)
{
    auto context = reinterpret_cast<es2panda_Context*>(contextPtr);
    auto flags = static_cast<Es2pandaExpressionParseFlags>(flagsT);

    return GetImpl()->ETSParserCreateExpression(context, getStringCopy(sourceCodePtr), flags);
}
KOALA_INTEROP_3(ETSParserCreateExpression, KNativePointer, KNativePointer, KStringPtr, KInt)

static KNativePointer impl_ProgramSourceFilePath(KNativePointer contextPtr, KNativePointer instancePtr)
{
    auto context = reinterpret_cast<es2panda_Context*>(contextPtr);
    auto&& instance = reinterpret_cast<es2panda_Program*>(instancePtr);
    auto&& result = GetImpl()->ProgramSourceFilePathConst(context, instance);
    return StageArena::Strdup(result);
}
KOALA_INTEROP_2(ProgramSourceFilePath, KNativePointer, KNativePointer, KNativePointer);

KNativePointer impl_ETSParserBuildImportDeclaration(KNativePointer context, KInt importKinds,
    KNativePointerArray specifiers, KUInt specifiersSequenceLength, KNativePointer source, KNativePointer program)
{
    const auto _context = reinterpret_cast<es2panda_Context*>(context);
    const auto _kinds = static_cast<Es2pandaImportKinds>(importKinds);
    const auto _specifiers = reinterpret_cast<es2panda_AstNode**>(specifiers);
    const auto _specifiersSequenceLength = static_cast<size_t>(specifiersSequenceLength);
    const auto _source = reinterpret_cast<es2panda_AstNode*>(source);
    const auto _program = reinterpret_cast<es2panda_Program*>(program);

    return GetImpl()->ETSParserBuildImportDeclaration(
        _context, _kinds, _specifiers, _specifiersSequenceLength, _source, _program);
}
KOALA_INTEROP_6(ETSParserBuildImportDeclaration, KNativePointer, KNativePointer, KInt, KNativePointerArray, KUInt,
    KNativePointer, KNativePointer)

KNativePointer impl_ETSParserGetImportPathManager(KNativePointer contextPtr)
{
    auto context = reinterpret_cast<es2panda_Context*>(contextPtr);
    return GetImpl()->ETSParserGetImportPathManager(context);
}
KOALA_INTEROP_1(ETSParserGetImportPathManager, KNativePointer, KNativePointer);

KInt impl_SourcePositionCol(KNativePointer context, KNativePointer instance)
{
    auto&& _context_ = reinterpret_cast<es2panda_Context*>(context);
    auto&& _instance_ = reinterpret_cast<es2panda_SourcePosition*>(instance);
    return GetImpl()->SourcePositionCol(_context_, _instance_);
}
KOALA_INTEROP_2(SourcePositionCol, KInt, KNativePointer, KNativePointer);

KNativePointer impl_ConfigGetOptions(KNativePointer config)
{
    const auto _config = reinterpret_cast<es2panda_Config*>(config);
    auto result = GetImpl()->ConfigGetOptions(_config);
    return (void*)result;
}
KOALA_INTEROP_1(ConfigGetOptions, KNativePointer, KNativePointer)

KNativePointer impl_OptionsArkTsConfig(KNativePointer context, KNativePointer options)
{
    const auto _context = reinterpret_cast<es2panda_Context*>(context);
    const auto _options = reinterpret_cast<es2panda_Options*>(options);
    auto result = GetImpl()->OptionsUtilArkTSConfigConst(_context, _options);
    return (void*)result;
}
KOALA_INTEROP_2(OptionsArkTsConfig, KNativePointer, KNativePointer, KNativePointer)

// From koala-wrapper
// Improve: check if some code should be generated

std::set<std::string> globalStructInfo;
#ifdef _GLIBCXX_HAS_GTHREADS
std::mutex g_structMutex;
#endif

void impl_InsertGlobalStructInfo(KNativePointer contextPtr, KStringPtr& instancePtr)
{
#ifdef _GLIBCXX_HAS_GTHREADS
    std::lock_guard<std::mutex> lock(g_structMutex);
#endif
    globalStructInfo.insert(getStringCopy(instancePtr));
    return;
}
KOALA_INTEROP_V2(InsertGlobalStructInfo, KNativePointer, KStringPtr);

KBoolean impl_HasGlobalStructInfo(KNativePointer contextPtr, KStringPtr& instancePtr)
{
#ifdef _GLIBCXX_HAS_GTHREADS
    std::lock_guard<std::mutex> lock(g_structMutex);
#endif
    return globalStructInfo.count(getStringCopy(instancePtr));
}
KOALA_INTEROP_2(HasGlobalStructInfo, KBoolean, KNativePointer, KStringPtr);

KNativePointer impl_ETSParserGetGlobalProgramAbsName(KNativePointer contextPtr)
{
    auto context = reinterpret_cast<es2panda_Context*>(contextPtr);
    auto program = GetImpl()->ETSParserGetGlobalProgramConst(context);
    auto result = GetImpl()->ProgramAbsoluteNameConst(context, program);
    return new std::string(result); // O_o
}
KOALA_INTEROP_1(ETSParserGetGlobalProgramAbsName, KNativePointer, KNativePointer)

KNativePointer impl_CreateDiagnosticKind(KNativePointer context, KStringPtr& message, KInt type)
{
    const auto _context = reinterpret_cast<es2panda_Context*>(context);
    const auto _message = getStringCopy(message);
    const auto _type = static_cast<es2panda_PluginDiagnosticType>(type);
    return const_cast<es2panda_DiagnosticKind*>(GetImpl()->CreateDiagnosticKind(_context, _message, _type));
}
KOALA_INTEROP_3(CreateDiagnosticKind, KNativePointer, KNativePointer, KStringPtr, KInt)

KNativePointer impl_AnnotationUsageIrPropertiesPtrConst(KNativePointer context, KNativePointer receiver)
{
    const auto _context = reinterpret_cast<es2panda_Context*>(context);
    const auto _receiver = reinterpret_cast<es2panda_AstNode*>(receiver);
    std::size_t length;
    auto result = GetImpl()->AnnotationUsageIrPropertiesPtrConst(_context, _receiver, &length);
    return StageArena::CloneVector(result, length);
}
KOALA_INTEROP_2(AnnotationUsageIrPropertiesPtrConst, KNativePointer, KNativePointer, KNativePointer);
