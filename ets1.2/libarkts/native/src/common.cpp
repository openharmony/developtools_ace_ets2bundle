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

#include <common.h>
#include <iterator>
#include <regex>
#include <sstream>
#include <utility>
#include <vector>
#include <bitset>

#include "interop-types.h"
#include "memoryTracker.h"

using std::string, std::cout, std::endl, std::vector;
constexpr int AST_NODE_TYPE_LIMIT = 256;
constexpr int MAX_ALLOC_SIZE = 1 << 25;

es2panda_Impl* es2pandaImplementation = nullptr;
static thread_local StageArena g_currentArena;

StageArena* StageArena::Instance()
{
    return &g_currentArena;
}

void StageArena::Add(void* pointer)
{
    if (pointer)
        allocated.push_back(pointer);
}

void StageArena::Cleanup()
{
    if (totalSize > 0 && false)
        printf("cleanup %d objects %d bytes\n", (int)allocated.size(), (int)totalSize);
    for (auto it : allocated) {
        free(it);
    }
    totalSize = 0;
    allocated.clear();
}

StageArena::StageArena()
{
    totalSize = 0;
}

StageArena::~StageArena()
{
    Cleanup();
}

char* StageArena::Strdup(const char* string)
{
    auto* arena = StageArena::Instance();
    auto size = strlen(string) + 1;
    char* memory = (char*)arena->Alloc(size);
    interop_memory_copy(memory, size, string, size);
    return memory;
}

void* StageArena::Alloc(size_t size)
{
    if (size > MAX_ALLOC_SIZE) {
        INTEROP_FATAL("Cannot allocate memory");
    }
    void* result = malloc(size);
    if (!result) {
        INTEROP_FATAL("Cannot allocate memory");
    }
    totalSize += size;
    Add(result);
    return result;
}

#ifdef KOALA_WINDOWS
#include <windows.h>
#define PLUGIN_DIR "windows_host_tools"
#define LIB_PREFIX "lib"
#define LIB_SUFFIX ".dll"
#endif

#if defined(KOALA_LINUX)
#include <dlfcn.h>

#ifdef __x86_64__
#define PLUGIN_DIR "linux_host_tools"
#else
#define PLUGIN_DIR "linux_arm64_host_tools"
#endif

#define LIB_PREFIX "lib"
#define LIB_SUFFIX ".so"
#endif

#if defined(KOALA_MACOS)
#include <dlfcn.h>

#ifdef __x86_64__
#define PLUGIN_DIR "macos_x64_host_tools"
#else
#define PLUGIN_DIR "macos_arm64_host_tools"
#endif

#define LIB_PREFIX "lib"
#define LIB_SUFFIX ".so"
#endif

const char* DEFAULT_SDK_PATH = "../../../incremental/tools/panda/node_modules/@panda/sdk";

const char* LIB_ES2PANDA_PUBLIC_ALT = LIB_PREFIX "es2panda-public" LIB_SUFFIX;
const char* LIB_ES2PANDA_PUBLIC = LIB_PREFIX "es2panda_public" LIB_SUFFIX;
const char* IS_UI_FLAG = "IS_UI_FLAG";
const char* NOT_UI_FLAG = "NOT_UI_FLAG";
const string MODULE_SUFFIX = ".d.ets";
const string ARKUI = "arkui";

#ifdef KOALA_WINDOWS
const char* SEPARATOR = "\\";
#else
const char* SEPARATOR = "/";
#endif
const char* LIB_DIR = "lib";

static std::string ES2PANDA_LIB_PATH = "";

std::string joinPath(vector<string>& paths)
{
    std::string res;
    for (std::size_t i = 0; i < paths.size(); ++i) {
        if (i == 0) {
            res = paths[i];
        } else {
            res += SEPARATOR + paths[i];
        }
    }
    return res;
}

void impl_SetUpSoPath(KStringPtr& soPath)
{
    ES2PANDA_LIB_PATH = std::string(soPath.c_str());
}
KOALA_INTEROP_V1(SetUpSoPath, KStringPtr);

void* TryLibrary(const char* name)
{
    void* res = nullptr;
    std::vector<std::string> pathArray;

    // find by SetUpSoPath
    if (!ES2PANDA_LIB_PATH.empty()) {
        pathArray = { ES2PANDA_LIB_PATH, LIB_DIR, name };
        res = loadLibrary(joinPath(pathArray));
        if (res) {
            return res;
        }
    }

    // find by set PANDA_SDK_PATH
    char* envValue = getenv("PANDA_SDK_PATH");
    if (envValue) {
        pathArray = { envValue, PLUGIN_DIR, LIB_DIR, name };
        res = loadLibrary(joinPath(pathArray));
        if (res) {
            return res;
        }
    }

    // find by set LD_LIBRARY_PATH
    pathArray = { name };
    res = loadLibrary(joinPath(pathArray));
    if (res) {
        return res;
    }

    // find by DEFAULT_SDK_PATH
    pathArray = { DEFAULT_SDK_PATH, PLUGIN_DIR, LIB_DIR, name };
    res = loadLibrary(joinPath(pathArray));
    if (res) {
        return res;
    }

    return nullptr;
}

void* FindLibrary()
{
    void* res = nullptr;

    res = TryLibrary(LIB_ES2PANDA_PUBLIC);
    if (res) {
        return res;
    }

    res = TryLibrary(LIB_ES2PANDA_PUBLIC_ALT);
    if (res) {
        return res;
    }

    return nullptr;
}

es2panda_Impl* GetImplSlow()
{
    if (es2pandaImplementation) {
        return es2pandaImplementation;
    }
    auto library = FindLibrary();
    if (!library) {
        INTEROP_FATAL("No library (common.cpp): %s and %s", LIB_ES2PANDA_PUBLIC, LIB_ES2PANDA_PUBLIC_ALT);
    }
    auto symbol = findSymbol(library, "es2panda_GetImpl");
    if (!symbol) {
        INTEROP_FATAL("no entry point: es2panda_GetImpl");
    }
    es2pandaImplementation = reinterpret_cast<es2panda_Impl* (*)(int)>(symbol)(ES2PANDA_LIB_VERSION);
    return es2pandaImplementation;
}

string getString(KStringPtr ptr)
{
    return ptr.data();
}

const char** getStringArray(KStringArray& ptr)
{
    return const_cast<const char**>(ptr.get()); // release()?
}

char* getStringCopy(KStringPtr& ptr)
{
    return StageArena::Strdup(ptr.c_str() ? ptr.c_str() : "");
}

void impl_DestroyConfig(KNativePointer config)
{
    const auto _config = reinterpret_cast<es2panda_Config*>(config);
    // panda prints diagnostics here and do not clone our strings
    // so keep arena alive until this moment.
    GetImpl()->DestroyConfig(_config);
    StageArena::Instance()->Cleanup();
    printf("[libarkts native] Arena cleaned up!\n");
}
KOALA_INTEROP_V1(DestroyConfig, KNativePointer)

void impl_ClassDefinitionSetBody(
    KNativePointer context, KNativePointer receiver, KNativePointerArray body, KUInt bodyLength)
{
    const auto _context = reinterpret_cast<es2panda_Context*>(context);
    const auto _receiver = reinterpret_cast<es2panda_AstNode*>(receiver);
    const auto _body = reinterpret_cast<es2panda_AstNode**>(body);
    const auto _bodyLength = static_cast<KUInt>(bodyLength);
    GetImpl()->ClassDefinitionClearBody(_context, _receiver);
    for (size_t i = 0; i < _bodyLength; i++) {
        GetImpl()->ClassDefinitionEmplaceBody(_context, _receiver, _body[i]);
    }
}
KOALA_INTEROP_V4(ClassDefinitionSetBody, KNativePointer, KNativePointer, KNativePointerArray, KUInt)

/*
Improve: NOT FROM API (shouldn't be there)
------------------------------------------------------------------------------------------------------------------------
*/

es2panda_AstNode* cachedParentNode;
es2panda_Context* cachedContext;

static void changeParent(es2panda_AstNode* child)
{
    GetImpl()->AstNodeSetParent(cachedContext, child, cachedParentNode);
}

static void SetRightParent(es2panda_AstNode* node, void* arg)
{
    es2panda_Context* ctx = static_cast<es2panda_Context*>(arg);
    cachedContext = ctx;
    cachedParentNode = node;

    GetImpl()->AstNodeIterateConst(ctx, node, changeParent);
}

KNativePointer impl_AstNodeUpdateAll(KNativePointer contextPtr, KNativePointer programPtr)
{
    auto context = reinterpret_cast<es2panda_Context*>(contextPtr);
    auto program = reinterpret_cast<es2panda_AstNode*>(programPtr);

    GetImpl()->AstNodeForEach(program, SetRightParent, context);
    return program;
}
KOALA_INTEROP_2(AstNodeUpdateAll, KNativePointer, KNativePointer, KNativePointer)

void impl_AstNodeSetChildrenParentPtr(KNativePointer contextPtr, KNativePointer nodePtr)
{
    auto context = reinterpret_cast<es2panda_Context*>(contextPtr);
    auto node = reinterpret_cast<es2panda_AstNode*>(nodePtr);
    cachedParentNode = node;

    GetImpl()->AstNodeIterateConst(context, node, changeParent);
}
KOALA_INTEROP_V2(AstNodeSetChildrenParentPtr, KNativePointer, KNativePointer)

void impl_AstNodeOnUpdate(KNativePointer context, KNativePointer newNode, KNativePointer replacedNode)
{
    auto _context = reinterpret_cast<es2panda_Context*>(context);
    auto _newNode = reinterpret_cast<es2panda_AstNode*>(newNode);
    auto _replacedNode = reinterpret_cast<es2panda_AstNode*>(replacedNode);

    // Assign original
    auto _original = GetImpl()->AstNodeOriginalNodeConst(_context, _replacedNode);
    if (!_original) {
        _original = _replacedNode;
    }
    GetImpl()->AstNodeSetOriginalNode(_context, _newNode, _original);

    // Assign new node parent
    auto _parent = GetImpl()->AstNodeParent(_context, _replacedNode);
    if (_parent) {
        GetImpl()->AstNodeSetParent(_context, _newNode, _parent);
    }

    // Redirect children parent pointer to this node
    impl_AstNodeSetChildrenParentPtr(context, newNode);
}
KOALA_INTEROP_V3(AstNodeOnUpdate, KNativePointer, KNativePointer, KNativePointer)

KNativePointer impl_JumpFromETSTypeReferenceToTSTypeAliasDeclarationTypeAnnotation(
    KNativePointer context, KNativePointer etsTypeReference
) {
    auto _context = reinterpret_cast<es2panda_Context*>(context);
    auto _node = reinterpret_cast<es2panda_AstNode*>(etsTypeReference);
    auto _name = GetImpl()->ETSTypeReferencePartName(_context,
        GetImpl()->ETSTypeReferencePart(_context, _node)
    );
    auto _decl = GetImpl()->DeclarationFromIdentifier(_context, _name);
    if (_decl && GetImpl()->IsTSTypeAliasDeclaration(_decl)) {
        return GetImpl()->TSTypeAliasDeclarationTypeAnnotationConst(_context, _decl);
    }
    return nullptr;
}
KOALA_INTEROP_2(JumpFromETSTypeReferenceToTSTypeAliasDeclarationTypeAnnotation,
    KNativePointer, KNativePointer, KNativePointer)

static thread_local std::vector<es2panda_AstNode*> cachedChildren;

static void visitChild(es2panda_AstNode* node)
{
    cachedChildren.emplace_back(node);
}

KNativePointer impl_AstNodeChildren(KNativePointer contextPtr, KNativePointer nodePtr)
{
    auto context = reinterpret_cast<es2panda_Context*>(contextPtr);
    auto node = reinterpret_cast<es2panda_AstNode*>(nodePtr);
    cachedContext = context;
    cachedChildren.clear();

    GetImpl()->AstNodeIterateConst(context, node, visitChild);
    return StageArena::Clone(cachedChildren);
}
KOALA_INTEROP_2(AstNodeChildren, KNativePointer, KNativePointer, KNativePointer);

struct Pattern {
    es2panda_Context* context;
    std::string key;
    std::string value;
    es2panda_Impl* impl;
    bool isWildcard = false;
    std::regex regex;

    Pattern(const Pattern&) = delete;
    Pattern& operator=(const Pattern&) = default;

    Pattern(Pattern&& other) noexcept
        : context(other.context),
        key(std::move(other.key)),
        value(std::move(other.value)),
        impl(other.impl),
        isWildcard(other.isWildcard),
        regex(other.regex)
        {
            other.isWildcard = false;
        }

    Pattern& operator=(Pattern&& other) noexcept
    {
        context = other.context;
        key = std::move(other.key);
        value = std::move(other.value);
        impl = other.impl;
        isWildcard = other.isWildcard;
        regex = other.regex;
        other.isWildcard = false;
        return *this;
    }

    Pattern(es2panda_Context* context, const std::string& part) : context(context), impl(GetImpl())
    {
        std::istringstream stream(part);
        std::getline(stream, key, '=');
        std::getline(stream, value, '=');
        isWildcard = value.find('*') != std::string::npos;
        if (isWildcard) {
            this->regex = std::regex(value);
        }
    }

    ~Pattern() = default;

    bool match(es2panda_AstNode* node) const
    {
        if (key == "type") {
            return matchByType(node, impl->AstNodeTypeConst(context, node));
        }
        if (key == "annotation") {
            return matchByAnnotation(node, impl->AstNodeTypeConst(context, node));
        }
        return false;
    }

    bool matchByType(es2panda_AstNode* node, Es2pandaAstNodeType type) const
    {
        switch (type) {
            case Es2pandaAstNodeType::AST_NODE_TYPE_METHOD_DEFINITION:
                return value == "method";
            case Es2pandaAstNodeType::AST_NODE_TYPE_SCRIPT_FUNCTION:
                return value == "function";
            case Es2pandaAstNodeType::AST_NODE_TYPE_STRUCT_DECLARATION:
                return value == "struct";
            case Es2pandaAstNodeType::AST_NODE_TYPE_CALL_EXPRESSION:
                return value == "call";
            case Es2pandaAstNodeType::AST_NODE_TYPE_ETS_IMPORT_DECLARATION:
                return value == "import";
            case Es2pandaAstNodeType::AST_NODE_TYPE_ASSIGNMENT_EXPRESSION:
                return value == "assignment";
            default:
                return false;
        }
    }

    bool matchByAnnotation(es2panda_AstNode* node, Es2pandaAstNodeType type) const
    {
        std::size_t length = 0;
        es2panda_AstNode** result = nullptr;
        switch (type) {
            case Es2pandaAstNodeType::AST_NODE_TYPE_SCRIPT_FUNCTION: {
                result = impl->ScriptFunctionAnnotations(context, node, &length);
                break;
            }
            case Es2pandaAstNodeType::AST_NODE_TYPE_FUNCTION_DECLARATION: {
                result = impl->FunctionDeclarationAnnotations(context, node, &length);
                break;
            }
            case Es2pandaAstNodeType::AST_NODE_TYPE_ARROW_FUNCTION_EXPRESSION: {
                result = impl->ArrowFunctionExpressionAnnotations(context, node, &length);
                break;
            }
            case Es2pandaAstNodeType::AST_NODE_TYPE_ETS_FUNCTION_TYPE: {
                result = impl->TypeNodeAnnotations(context, node, &length);
                break;
            }
            case Es2pandaAstNodeType::AST_NODE_TYPE_TS_TYPE_ALIAS_DECLARATION: {
                result = impl->TSTypeAliasDeclarationAnnotations(context, node, &length);
                break;
            }
            case Es2pandaAstNodeType::AST_NODE_TYPE_VARIABLE_DECLARATION: {
                result = impl->VariableDeclarationAnnotations(context, node, &length);
                break;
            }
            case Es2pandaAstNodeType::AST_NODE_TYPE_ETS_UNION_TYPE: {
                result = impl->TypeNodeAnnotations(context, node, &length);
                break;
            }
            case Es2pandaAstNodeType::AST_NODE_TYPE_CLASS_PROPERTY: {
                result = impl->ClassPropertyAnnotations(context, node, &length);
                break;
            }
            case Es2pandaAstNodeType::AST_NODE_TYPE_ETS_PARAMETER_EXPRESSION: {
                result = impl->ETSParameterExpressionAnnotations(context, node, &length);
                break;
            }
            default:
                return false;
        }

        bool found = false;
        for (std::size_t i = 0; i < length && result; i++) {
            es2panda_AstNode* ident = impl->AnnotationUsageIrGetBaseNameConst(context, result[i]);
            found |= MatchWildcard(value, impl->IdentifierNameConst(context, ident));
        }
        return found;
    }

    bool MatchWildcard(const std::string& pattern, const char* foundValue) const
    {
        if (!isWildcard) {
            return pattern == foundValue;
        }

        return std::regex_search(foundValue, this->regex);
    }
};

struct Matcher {
    es2panda_Context* context;
    const char* query;
    std::vector<Pattern> patterns;
    es2panda_Impl* impl;
    Matcher(es2panda_Context* context, const char* query) : context(context), query(query), impl(GetImpl())
    {
        std::istringstream stream(query);
        std::string item;
        while (std::getline(stream, item, ';')) {
            patterns.emplace_back(std::forward<Pattern>(Pattern(context, item)));
        }
    }
    bool match(es2panda_AstNode* node)
    {
        bool result = true;
        for (const auto& pattern : patterns) {
            result &= pattern.match(node);
        }
        return result;
    }
};

static KNativePointer DoFilterNodes(es2panda_Context* _context,
                                    es2panda_AstNode* _node,
                                    const char* _filters,
                                    bool deeperAfterMatch)
{
    std::vector<es2panda_AstNode*> result;
    es2panda_Impl* impl = GetImpl();
    Matcher matcher(_context, _filters);
    std::vector<es2panda_AstNode*> queue;
    queue.push_back(_node);
    while (queue.size() > 0) {
        auto* current = queue.back();
        queue.pop_back();
        bool isMatch = matcher.match(current);
        if (isMatch) {
            result.push_back(current);
        }
        if (!isMatch || deeperAfterMatch) {
            impl->AstNodeIterateConst(_context, current, visitChild);
            for (auto it = cachedChildren.rbegin(); it != cachedChildren.rend(); ++it) {
                queue.push_back(*it);
            }
            cachedChildren.clear();
        }
    }
    return StageArena::CloneVector(result.data(), result.size());
}

KNativePointer impl_FilterNodes(
    KNativePointer context, KNativePointer node, const KStringPtr& filters, KBoolean deeperAfterMatch)
{
    auto* _node = reinterpret_cast<es2panda_AstNode*>(node);
    auto* _context = reinterpret_cast<es2panda_Context*>(context);
    return DoFilterNodes(_context, _node, filters.c_str(), static_cast<bool>(deeperAfterMatch));
}
KOALA_INTEROP_4(FilterNodes, KNativePointer, KNativePointer, KNativePointer, KStringPtr, KBoolean)

struct FilterArgs {
    es2panda_Impl *impl;
    es2panda_Context *context;
    std::bitset<AST_NODE_TYPE_LIMIT> *typesMask;
    std::vector<es2panda_AstNode *> *result;
};

void filterByType(es2panda_AstNode *node, void *argsPointer)
{
    FilterArgs *args = reinterpret_cast<FilterArgs *>(argsPointer);
    auto type = args->impl->AstNodeTypeConst(args->context, node);
    if ((*args->typesMask)[type]) {
        args->result->push_back(node);
    }
}

KNativePointer impl_FilterNodes2(KNativePointer context, KNativePointer node, KInt type)
{
    auto _node = reinterpret_cast<es2panda_AstNode*>(node);
    auto _context = reinterpret_cast<es2panda_Context*>(context);
    std::bitset<AST_NODE_TYPE_LIMIT> typesMask;
    typesMask.set(type);
    std::vector<es2panda_AstNode *> result;
    FilterArgs args = { GetImpl(), _context, &typesMask, &result };
    GetImpl()->AstNodeForEach(_node, filterByType, &args);
    return StageArena::CloneVector(result.data(), result.size());
}
KOALA_INTEROP_3(FilterNodes2, KNativePointer, KNativePointer, KNativePointer, KInt)

KNativePointer impl_FilterNodes3(KNativePointer context, KNativePointer node, KInt* types, KInt typesSize)
{
    auto _node = reinterpret_cast<es2panda_AstNode*>(node);
    auto _context = reinterpret_cast<es2panda_Context*>(context);
    std::bitset<AST_NODE_TYPE_LIMIT> typesMask;
    for (int i = 0; i < typesSize; i++) {
        typesMask.set(types[i]);
    }
    std::vector<es2panda_AstNode *> result;
    FilterArgs args = { GetImpl(), _context, &typesMask, &result };
    GetImpl()->AstNodeForEach(_node, filterByType, &args);
    return StageArena::CloneVector(result.data(), result.size());
}
KOALA_INTEROP_4(FilterNodes3, KNativePointer, KNativePointer, KNativePointer, KInt*, KInt)

/*
------------------------------------------------------------------------------------------------------------------------
*/

// From koala-wrapper
// Improve: check if some code should be generated

static bool isUIHeaderFile(es2panda_Context* context, es2panda_Program* program)
{
    auto result = GetImpl()->ProgramFileNameWithExtensionConst(context, program);
    string fileNameWithExtension(result);
    result = GetImpl()->ProgramModuleNameConst(context, program);
    string moduleName(result);

    return fileNameWithExtension.length() >= MODULE_SUFFIX.length() &&
           fileNameWithExtension.substr(fileNameWithExtension.length() - MODULE_SUFFIX.length()) == MODULE_SUFFIX &&
           moduleName.find(ARKUI) != std::string::npos;
}

KBoolean impl_ProgramCanSkipPhases(KNativePointer context, KNativePointer program)
{
    KStringPtr isUiFlag(IS_UI_FLAG);
    KStringPtr notUiFlag(NOT_UI_FLAG);
    const auto _context = reinterpret_cast<es2panda_Context*>(context);
    const auto _program = reinterpret_cast<es2panda_Program*>(program);
    if (isUIHeaderFile(_context, _program)) {
        return false;
    }
    std::size_t sourceLen;
    const auto externalSources =
        reinterpret_cast<es2panda_ExternalSource**>(GetImpl()->ProgramExternalSources(_context, _program, &sourceLen));
    for (std::size_t i = 0; i < sourceLen; ++i) {
        std::size_t programLen;
        auto programs = GetImpl()->ExternalSourcePrograms(externalSources[i], &programLen);
        for (std::size_t j = 0; j < programLen; ++j) {
            if (isUIHeaderFile(_context, programs[j])) {
                return false;
            }
        }
    }
    return true;
}
KOALA_INTEROP_2(ProgramCanSkipPhases, KBoolean, KNativePointer, KNativePointer)

KNativePointer impl_AstNodeProgram(KNativePointer contextPtr, KNativePointer instancePtr)
{
    auto _context = reinterpret_cast<es2panda_Context*>(contextPtr);
    auto _receiver = reinterpret_cast<es2panda_AstNode*>(instancePtr);

    if (GetImpl()->AstNodeIsProgramConst(_context, _receiver)) {
        return GetImpl()->ETSModuleProgram(_context, _receiver);
    }
    auto parent = GetImpl()->AstNodeParent(_context, _receiver);
    if (parent == nullptr) {
        return nullptr;
    }
    return impl_AstNodeProgram(_context, parent);
}
KOALA_INTEROP_2(AstNodeProgram, KNativePointer, KNativePointer, KNativePointer)

// This api could be generated (as combination of 2 briges) after namespace util is generated
KInt impl_GetCompilationMode(KNativePointer configPtr)
{
    auto _config = reinterpret_cast<es2panda_Config*>(configPtr);
    auto _options = const_cast<es2panda_Options*>(GetImpl()->ConfigGetOptions(_config));
    return GetImpl()->OptionsUtilGetCompilationModeConst(nullptr, _options);
}
KOALA_INTEROP_1(GetCompilationMode, KInt, KNativePointer)

KNativePointer impl_CreateTypeNodeFromTsType(KNativePointer context, KNativePointer nodePtr)
{
    const auto _context = reinterpret_cast<es2panda_Context*>(context);
    const auto _nodePtr = reinterpret_cast<es2panda_AstNode*>(nodePtr);
    auto _tsType = GetImpl()->TypedTsType(_context, _nodePtr);
    if (_tsType == nullptr) {
        _tsType = GetImpl()->ExpressionTsType(_context, _nodePtr);
    }
    if (_tsType == nullptr) {
        return nullptr;
    }
    const auto _nodeTsType = reinterpret_cast<es2panda_Type*>(_tsType);
    auto _typeAnnotation = GetImpl()->CreateOpaqueTypeNode(_context, _nodeTsType);
    return _typeAnnotation;
}
KOALA_INTEROP_2(CreateTypeNodeFromTsType, KNativePointer, KNativePointer, KNativePointer)

MemoryTracker tracker;
void impl_MemoryTrackerReset(KNativePointer context)
{
    tracker.Reset();
}
KOALA_INTEROP_V1(MemoryTrackerReset, KNativePointer);

void impl_MemoryTrackerGetDelta(KNativePointer context)
{
    tracker.Report(tracker.GetDelta());
}
KOALA_INTEROP_V1(MemoryTrackerGetDelta, KNativePointer);

void impl_MemoryTrackerPrintCurrent(KNativePointer context)
{
    tracker.Report(GetMemoryStats());
}
KOALA_INTEROP_V1(MemoryTrackerPrintCurrent, KNativePointer);

static KNativePointer findPropertyInClassDefinition(KNativePointer context, KNativePointer classInstance, char *keyName)
{
    const auto _context = reinterpret_cast<es2panda_Context*>(context);
    const auto _instance = reinterpret_cast<es2panda_AstNode*>(classInstance);
    std::size_t bodySize = 0;
    const auto _body = GetImpl()->ClassDefinitionBody(_context, _instance, &bodySize);
    if (_body == nullptr) {
        return nullptr;
    }
    const auto _bodyInstance = reinterpret_cast<es2panda_AstNode**>(_body);
    for (std::size_t i = 0; i < bodySize; i++) {
        const auto _member = reinterpret_cast<es2panda_AstNode*>(_bodyInstance[i]);
        const auto _key = reinterpret_cast<es2panda_AstNode*>(GetImpl()->ClassElementKey(_context, _member));
        if (strcmp(GetImpl()->IdentifierName(_context, _key), keyName) == 0) {
            return _member;
        }
    }
    return nullptr;
}

static KNativePointer findPropertyInTSInterfaceDeclaration(
    KNativePointer context, KNativePointer classInstance, char *keyName)
{
    const auto _context = reinterpret_cast<es2panda_Context*>(context);
    const auto _instance = reinterpret_cast<es2panda_AstNode*>(classInstance);
    const auto _body = GetImpl()->TSInterfaceDeclarationBody(_context, _instance);
    if (_body == nullptr) {
        return nullptr;
    }
    const auto _bodyInstance = reinterpret_cast<es2panda_AstNode*>(_body);
    std::size_t bodySize = 0;
    const auto _bodyBody = GetImpl()->TSInterfaceBodyBodyConst(_context, _bodyInstance, &bodySize);
    if (_bodyBody == nullptr) {
        return nullptr;
    }
    const auto _bodyBodyInstance = reinterpret_cast<es2panda_AstNode**>(_bodyBody);
    for (std::size_t i = 0; i < bodySize; i++) {
        const auto _member = reinterpret_cast<es2panda_AstNode*>(_bodyBodyInstance[i]);
        const auto _key = reinterpret_cast<es2panda_AstNode*>(GetImpl()->ClassElementKey(_context, _member));
        if (strcmp(GetImpl()->IdentifierName(_context, _key), keyName) == 0) {
            return _member;
        }
    }
    return nullptr;
}

KNativePointer impl_ClassVariableDeclaration(KNativePointer context, KNativePointer classInstance);

KNativePointer impl_DeclarationFromProperty(KNativePointer context, KNativePointer property)
{
    const auto _context = reinterpret_cast<es2panda_Context*>(context);
    const auto _property = reinterpret_cast<es2panda_AstNode*>(property);
    auto _key = GetImpl()->PropertyKey(_context, _property);
    if (_key == nullptr) {
        return nullptr;
    }
    auto _parent = GetImpl()->AstNodeParent(_context, _property);
    if (_parent == nullptr) {
        return nullptr;
    }
    const auto _parentInstance = reinterpret_cast<es2panda_AstNode*>(_parent);
    auto _decl = impl_ClassVariableDeclaration(_context, _parentInstance);
    if (_decl == nullptr) {
        return nullptr;
    }
    const auto _declInstance = reinterpret_cast<es2panda_AstNode*>(_decl);
    const auto _keyInstance = reinterpret_cast<es2panda_AstNode*>(_key);
    auto _keyName = GetImpl()->IdentifierName(_context, _keyInstance);
    if (GetImpl()->IsClassDefinition(_declInstance)) {
        return findPropertyInClassDefinition(_context, _declInstance, _keyName);
    }
    if (GetImpl()->IsTSInterfaceDeclaration(_declInstance)) {
        return findPropertyInTSInterfaceDeclaration(_context, _declInstance, _keyName);
    }
    return nullptr;
}
KOALA_INTEROP_2(DeclarationFromProperty, KNativePointer, KNativePointer, KNativePointer);

KNativePointer impl_DeclarationFromMemberExpression(KNativePointer context, KNativePointer nodePtr)
{
    const auto _context = reinterpret_cast<es2panda_Context*>(context);
    const auto _node = reinterpret_cast<es2panda_AstNode*>(nodePtr);
    auto _object = GetImpl()->MemberExpressionObject(_context, _node);
    auto _property = GetImpl()->MemberExpressionProperty(_context, _node);
    if (_property == nullptr) {
        return nullptr;
    }
    const auto _propertyInstance = reinterpret_cast<es2panda_AstNode*>(_property);
    if (GetImpl()->IsNumberLiteral(_propertyInstance) && _object != nullptr) {
        const auto _objectInstance = reinterpret_cast<es2panda_AstNode*>(_object);
        if (GetImpl()->IsMemberExpression(_objectInstance)) {
        return impl_DeclarationFromMemberExpression(_context, _objectInstance);
        }
        return GetImpl()->DeclarationFromIdentifier(_context, _objectInstance);
    }
    if (GetImpl()->IsMemberExpression(_propertyInstance)) {
        return impl_DeclarationFromMemberExpression(_context, _propertyInstance);
    }
    return GetImpl()->DeclarationFromIdentifier(_context, _propertyInstance);
}
KOALA_INTEROP_2(DeclarationFromMemberExpression, KNativePointer, KNativePointer, KNativePointer);

KNativePointer impl_DeclarationFromAstNode(KNativePointer context, KNativePointer nodePtr)
{
    const auto _context = reinterpret_cast<es2panda_Context*>(context);
    const auto _node = reinterpret_cast<es2panda_AstNode*>(nodePtr);
    if (GetImpl()->IsMemberExpression(_node)) {
        return impl_DeclarationFromMemberExpression(_context, _node);
    }
    if (GetImpl()->IsObjectExpression(_node)) {
        return impl_ClassVariableDeclaration(_context, _node);
    }
    if (GetImpl()->IsProperty(_node)) {
        return impl_DeclarationFromProperty(_context, _node);
    }
    return GetImpl()->DeclarationFromIdentifier(_context, _node);
}
KOALA_INTEROP_2(DeclarationFromAstNode, KNativePointer, KNativePointer, KNativePointer);

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

thread_local KBoolean targetChildFound = false;
thread_local es2panda_AstNode *targetInnerChild = nullptr;
thread_local KInt targetAstNodeType = -1;

static void findNodeInnerChild(es2panda_AstNode *node)
{
    if (targetInnerChild == node) {
        targetChildFound = true;
    }
}

KBoolean impl_AstNodeFindNodeInInnerChild(
    KNativePointer contextPtr, KNativePointer instancePtr, KNativePointer tartgetPtr)
{
    if (tartgetPtr == nullptr) {
        return false;
    }
    auto _context = reinterpret_cast<es2panda_Context*>(contextPtr);
    auto _receiver = reinterpret_cast<es2panda_AstNode*>(instancePtr);
    auto _target = reinterpret_cast<es2panda_AstNode*>(tartgetPtr);
    targetChildFound = false;
    targetInnerChild = _target;
    GetImpl()->AstNodeIterateConst(_context, _receiver, findNodeInnerChild);
    return targetChildFound;
}
KOALA_INTEROP_3(AstNodeFindNodeInInnerChild, KBoolean, KNativePointer, KNativePointer, KNativePointer);

static void findInnerChild(es2panda_AstNode *node, void *arg)
{
    auto *context = static_cast<es2panda_Context *>(arg);
    if (targetAstNodeType == GetImpl()->AstNodeTypeConst(context, node)) {
        targetInnerChild = node;
    }
}

KNativePointer impl_AstNodeFindInnerChild(KNativePointer contextPtr, KNativePointer instancePtr, KInt AstNodeType)
{
    auto _context = reinterpret_cast<es2panda_Context*>(contextPtr);
    auto _receiver = reinterpret_cast<es2panda_AstNode*>(instancePtr);
    targetAstNodeType = AstNodeType;

    GetImpl()->AstNodeForEach(_receiver, findInnerChild, _context);
    return targetInnerChild;
}
KOALA_INTEROP_3(AstNodeFindInnerChild, KNativePointer, KNativePointer, KNativePointer, KInt);

KNativePointer impl_AstNodeFindOuterParent(KNativePointer contextPtr, KNativePointer instancePtr, KInt AstNodeType)
{
    auto _context = reinterpret_cast<es2panda_Context*>(contextPtr);
    auto _receiver = reinterpret_cast<es2panda_AstNode*>(instancePtr);
    if (GetImpl()->AstNodeIsProgramConst(_context, _receiver)) {
        return nullptr;
    }
    if (AstNodeType == GetImpl()->AstNodeTypeConst(_context, _receiver)) {
        return _receiver;
    }
    auto parent = GetImpl()->AstNodeParent(_context, _receiver);
    if (parent == nullptr) {
        return nullptr;
    }
    return impl_AstNodeFindOuterParent(_context, parent, AstNodeType);
}
KOALA_INTEROP_3(AstNodeFindOuterParent, KNativePointer, KNativePointer, KNativePointer, KInt);
