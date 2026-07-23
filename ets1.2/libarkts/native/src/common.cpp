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
#include <unordered_set>

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

char* StageArena::Strdup(const char* original)
{
    auto* arena = StageArena::Instance();
    auto size = strlen(original) + 1;
    char* memory = (char*)arena->Alloc(size);
    interop_memory_copy(memory, size, original, size);
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
    if (_body != nullptr) {
        for (size_t i = 0; i < _bodyLength; i++) {
            GetImpl()->ClassDefinitionEmplaceBody(_context, _receiver, _body[i]);
        }
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
            other.context = nullptr;
            other.impl = nullptr;
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
        other.context = nullptr;
        other.impl = nullptr;
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
    if (types != nullptr) {
        for (int i = 0; i < typesSize; i++) {
            typesMask.set(types[i]);
        }
    }
    std::vector<es2panda_AstNode *> result;
    FilterArgs args = { GetImpl(), _context, &typesMask, &result };
    GetImpl()->AstNodeForEach(_node, filterByType, &args);
    return StageArena::CloneVector(result.data(), result.size());
}
KOALA_INTEROP_4(FilterNodes3, KNativePointer, KNativePointer, KNativePointer, KInt*, KInt)

KNativePointer impl_GetAnnotationDeclarationProperties(KNativePointer contextPtr, KNativePointer annotationUsagePtr)
{
    const auto _context = reinterpret_cast<es2panda_Context*>(contextPtr);
    const auto _annotationUsage = reinterpret_cast<es2panda_AstNode*>(annotationUsagePtr);
    if (!GetImpl()->IsAnnotationUsage(_annotationUsage)) {
        return nullptr;
    }
    size_t usagePropsLen = 0;
    auto **usageProps = GetImpl()->AnnotationUsageIrPropertiesConst(_context, _annotationUsage, &usagePropsLen);
    auto *expr = GetImpl()->AnnotationUsageIrExpr(_context, _annotationUsage);
    if (expr == nullptr || !GetImpl()->IsIdentifier(expr)) {
        return nullptr;
    }
    auto *variable = GetImpl()->AstNodeVariableConst(_context, expr);
    if (variable == nullptr) {
        return nullptr;
    }
    auto *decl = GetImpl()->VariableDeclaration(_context, variable);
    if (decl == nullptr) {
        return nullptr;
    }
    auto *declNode = GetImpl()->DeclNode(_context, decl);
    if (declNode == nullptr) {
        return nullptr;
    }
    size_t declPropsLen = 0;
    auto **declProps = GetImpl()->AnnotationDeclarationPropertiesConst(_context, declNode, &declPropsLen);
    if (declProps == nullptr) {
        return nullptr;
    }
    auto mergedProperties = new std::vector<void*>();
    for (size_t i = 0; i < declPropsLen; i++) {
        auto *declPropKey = GetImpl()->ClassElementKey(_context, declProps[i]);
        const char *declPropName = GetImpl()->IdentifierName(_context, declPropKey);
        void *selectedProp = declProps[i];
        for (size_t j = 0; j < usagePropsLen; j++) {
            auto *usagePropKey = GetImpl()->ClassElementKey(_context, usageProps[j]);
            const char *usagePropName = GetImpl()->IdentifierName(_context, usagePropKey);
            if (strcmp(declPropName, usagePropName) == 0) {
                selectedProp = usageProps[j];
                break;
            }
        }
        mergedProperties->push_back(selectedProp);
    }
    return mergedProperties;
}
KOALA_INTEROP_2(GetAnnotationDeclarationProperties, KNativePointer, KNativePointer, KNativePointer);

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

static KNativePointer findPropertyInClassDefinition(
    KNativePointer context, KNativePointer classInstance, char *keyName);

static KNativePointer findPropertyInTSInterfaceDeclaration(
    KNativePointer context, KNativePointer classInstance, char *keyName);

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

/*
------------------------------------------------------------------------------------------------------------------------
*/

// AstNode Resolvers

struct ClassPropertyResolver {
    es2panda_Context* context;
    es2panda_Impl* impl;
    es2panda_AstNode* prop;
    es2panda_AstNode* cls;
    std::vector<es2panda_AstNode*> types;
    std::unordered_set<es2panda_AstNode*> seenTypes;

    ClassPropertyResolver(const ClassPropertyResolver&) = delete;
    ClassPropertyResolver& operator=(const ClassPropertyResolver&) = delete;

    ClassPropertyResolver(ClassPropertyResolver&& other) noexcept
        : context(other.context),
          impl(other.impl),
          prop(other.prop),
          cls(other.cls),
          types(std::move(other.types)),
          seenTypes(std::move(other.seenTypes))
    {
        // Leave source in a valid but empty state
        other.context = nullptr;
        other.impl = nullptr;
        other.prop = nullptr;
        other.cls = nullptr;
    }

    ClassPropertyResolver& operator=(ClassPropertyResolver&& other) noexcept
    {
        if (this != &other) {
            context = other.context;
            impl = other.impl;
            prop = other.prop;
            cls = other.cls;
            types = std::move(other.types);
            seenTypes = std::move(other.seenTypes);
            // Leave source in a valid but empty state
            other.context = nullptr;
            other.impl = nullptr;
            other.prop = nullptr;
            other.cls = nullptr;
        }
        return *this;
    }

    ClassPropertyResolver(es2panda_Context* ctx, es2panda_AstNode* property, es2panda_AstNode* classDef)
        : context(ctx), impl(nullptr), prop(property), cls(classDef)
    {
        // Validate context before getting impl
        if (context != nullptr) {
            impl = GetImpl();
        }
        // Only proceed if we have valid pointers
        if (IsValid()) {
            UnwrapTypeAnnotation();
        }
    }

    ~ClassPropertyResolver() = default;

    // Check if in valid state (not moved-from and properly initialized)
    bool IsValid() const
    {
        return context != nullptr && impl != nullptr;
    }

    // Check if declaration is one of expected types
    bool MatchType(es2panda_AstNode* declaration) const
    {
        if (declaration == nullptr || !IsValid()) {
            return false;
        }
        auto type = impl->AstNodeTypeConst(context, declaration);
        return type == Es2pandaAstNodeType::AST_NODE_TYPE_TS_TYPE_ALIAS_DECLARATION ||
               type == Es2pandaAstNodeType::AST_NODE_TYPE_CLASS_DEFINITION ||
               type == Es2pandaAstNodeType::AST_NODE_TYPE_TS_INTERFACE_DECLARATION ||
               type == Es2pandaAstNodeType::AST_NODE_TYPE_STRUCT_DECLARATION ||
               type == Es2pandaAstNodeType::AST_NODE_TYPE_TS_ENUM_DECLARATION;
    }

    // Helper: Get alias type annotation from ETSTypeReference
    // Returns the type annotation if the type reference resolves to a type alias declaration, nullptr otherwise
    es2panda_AstNode* GetAliasTypeAnnotationFromTypeReference(es2panda_AstNode* typeReference) const
    {
        if (!IsValid() || typeReference == nullptr) {
            return nullptr;
        }
        if (!impl->IsETSTypeReference(typeReference)) {
            return nullptr;
        }
        auto* part = impl->ETSTypeReferencePart(context, typeReference);
        if (part == nullptr) {
            return nullptr;
        }
        auto* name = impl->ETSTypeReferencePartName(context, part);
        if (name == nullptr) {
            return nullptr;
        }
        auto* declaration = impl->DeclarationFromIdentifier(context, name);
        if (declaration == nullptr || !impl->IsTSTypeAliasDeclaration(declaration)) {
            return nullptr;
        }
        return impl->TSTypeAliasDeclarationTypeAnnotationConst(context, declaration);
    }

    // Recursively unwrap type annotations to get direct types
    void UnwrapTypeAnnotation(es2panda_AstNode* typeAnnotation = nullptr)
    {
        if (!IsValid() || prop == nullptr) {
            return;
        }
        if (typeAnnotation == nullptr) {
            // Get type annotation from class property
            typeAnnotation = impl->ClassPropertyTypeAnnotationConst(context, prop);
            if (typeAnnotation == nullptr) {
                return;
            }
        }
        auto nodeType = impl->AstNodeTypeConst(context, typeAnnotation);
        // Handle ETSUnionType - flatten the union types
        if (nodeType == Es2pandaAstNodeType::AST_NODE_TYPE_ETS_UNION_TYPE) {
            size_t unionTypesLen = 0;
            auto** unionTypes = impl->ETSUnionTypeIrTypesConst(context, typeAnnotation, &unionTypesLen);
            if (unionTypes == nullptr) {
                return;
            }
            for (size_t i = 0; i < unionTypesLen; i++) {
                // Recursively unwrap each type in union
                if (unionTypes[i] != nullptr) {
                    UnwrapTypeAnnotation(unionTypes[i]);
                }
            }
            return;
        }
        // Handle ETSTypeReference - resolve to declaration
        if (impl->IsETSTypeReference(typeAnnotation)) {
            auto aliasTypeAnnotation = GetAliasTypeAnnotationFromTypeReference(typeAnnotation);
            if (aliasTypeAnnotation != nullptr) {
                UnwrapTypeAnnotation(aliasTypeAnnotation);
                return;
            }
        }
        // Handle TSTypeAliasDeclaration - resolve to its type annotation
        if (impl->IsTSTypeAliasDeclaration(typeAnnotation)) {
            auto aliasTypeAnnotation = impl->TSTypeAliasDeclarationTypeAnnotationConst(context, typeAnnotation);
            if (aliasTypeAnnotation != nullptr) {
                UnwrapTypeAnnotation(aliasTypeAnnotation);
                return;
            }
        }
        // If we've reached a direct type (not union/alias), add it (check duplicates)
        if (typeAnnotation != nullptr && seenTypes.find(typeAnnotation) == seenTypes.end()) {
            seenTypes.insert(typeAnnotation);
            types.push_back(typeAnnotation);
        }
    }

    // Get collected types (const accessor for interop use)
    const std::vector<es2panda_AstNode*>& GetTypes() const
    {
        return types;
    }

    // Get number of collected types
    size_t GetTypeCount() const
    {
        return types.size();
    }
};

/* Resolves types from getter MethodDefinition (extracts return type annotation) */
struct MethodDefinitionResolver {
    es2panda_Context* context;
    es2panda_Impl* impl;
    es2panda_AstNode* method;
    std::vector<es2panda_AstNode*> types;
    std::unordered_set<es2panda_AstNode*> seenTypes;

    MethodDefinitionResolver(const MethodDefinitionResolver&) = delete;
    MethodDefinitionResolver& operator=(const MethodDefinitionResolver&) = delete;

    MethodDefinitionResolver(MethodDefinitionResolver&& other) noexcept
        : context(other.context),
          impl(other.impl),
          method(other.method),
          types(std::move(other.types)),
          seenTypes(std::move(other.seenTypes))
    {
        other.context = nullptr;
        other.impl = nullptr;
        other.method = nullptr;
    }

    MethodDefinitionResolver& operator=(MethodDefinitionResolver&& other) noexcept
    {
        if (this != &other) {
            context = other.context;
            impl = other.impl;
            method = other.method;
            types = std::move(other.types);
            seenTypes = std::move(other.seenTypes);
            other.context = nullptr;
            other.impl = nullptr;
            other.method = nullptr;
        }
        return *this;
    }

    MethodDefinitionResolver(es2panda_Context* ctx, es2panda_AstNode* methodDefinition)
        : context(ctx), impl(nullptr), method(methodDefinition)
    {
        if (context != nullptr) {
            impl = GetImpl();
        }
        if (IsValid()) {
            UnwrapTypeAnnotation();
        }
    }

    ~MethodDefinitionResolver() = default;

    bool IsValid() const
    {
        return context != nullptr && impl != nullptr;
    }

    // Check if declaration is one of expected types
    bool MatchType(es2panda_AstNode* declaration) const
    {
        if (declaration == nullptr || !IsValid()) {
            return false;
        }
        auto type = impl->AstNodeTypeConst(context, declaration);
        return type == Es2pandaAstNodeType::AST_NODE_TYPE_TS_TYPE_ALIAS_DECLARATION ||
               type == Es2pandaAstNodeType::AST_NODE_TYPE_CLASS_DEFINITION ||
               type == Es2pandaAstNodeType::AST_NODE_TYPE_TS_INTERFACE_DECLARATION ||
               type == Es2pandaAstNodeType::AST_NODE_TYPE_STRUCT_DECLARATION ||
               type == Es2pandaAstNodeType::AST_NODE_TYPE_TS_ENUM_DECLARATION;
    }

    // Helper: Get alias type annotation from ETSTypeReference
    // Returns the type annotation if the type reference resolves to a type alias declaration, nullptr otherwise
    es2panda_AstNode* GetAliasTypeAnnotationFromTypeReference(es2panda_AstNode* typeReference) const
    {
        if (!IsValid() || typeReference == nullptr) {
            return nullptr;
        }
        if (!impl->IsETSTypeReference(typeReference)) {
            return nullptr;
        }
        auto* part = impl->ETSTypeReferencePart(context, typeReference);
        if (part == nullptr) {
            return nullptr;
        }
        auto* name = impl->ETSTypeReferencePartName(context, part);
        if (name == nullptr) {
            return nullptr;
        }
        auto* declaration = impl->DeclarationFromIdentifier(context, name);
        if (declaration == nullptr || !impl->IsTSTypeAliasDeclaration(declaration)) {
            return nullptr;
        }
        return impl->TSTypeAliasDeclarationTypeAnnotationConst(context, declaration);
    }

    // Recursively unwrap type annotations to get direct types
    void UnwrapTypeAnnotation(es2panda_AstNode* typeAnnotation = nullptr)
    {
        if (!IsValid() || method == nullptr) {
            return;
        }
        if (typeAnnotation == nullptr) {
            // Get return type annotation from getter method's function
            if (!impl->IsMethodDefinition(method)) {
                return;
            }
            auto* func = impl->MethodDefinitionFunction(context, method);
            if (func == nullptr) {
                return;
            }
            typeAnnotation = impl->ScriptFunctionReturnTypeAnnotation(context, func);
            if (typeAnnotation == nullptr) {
                return;
            }
        }
        auto nodeType = impl->AstNodeTypeConst(context, typeAnnotation);
        // Handle ETSUnionType - flatten the union types
        if (nodeType == Es2pandaAstNodeType::AST_NODE_TYPE_ETS_UNION_TYPE) {
            size_t unionTypesLen = 0;
            auto** unionTypes = impl->ETSUnionTypeIrTypesConst(context, typeAnnotation, &unionTypesLen);
            if (unionTypes == nullptr) {
                return;
            }
            for (size_t i = 0; i < unionTypesLen; i++) {
                if (unionTypes[i] != nullptr) {
                    UnwrapTypeAnnotation(unionTypes[i]);
                }
            }
            return;
        }
        // Handle ETSTypeReference - resolve to declaration
        if (impl->IsETSTypeReference(typeAnnotation)) {
            auto aliasTypeAnnotation = GetAliasTypeAnnotationFromTypeReference(typeAnnotation);
            if (aliasTypeAnnotation != nullptr) {
                UnwrapTypeAnnotation(aliasTypeAnnotation);
                return;
            }
        }
        // Handle TSTypeAliasDeclaration - resolve to its type annotation
        if (impl->IsTSTypeAliasDeclaration(typeAnnotation)) {
            auto typeAlias = impl->TSTypeAliasDeclarationTypeAnnotationConst(context, typeAnnotation);
            if (typeAlias != nullptr) {
                UnwrapTypeAnnotation(typeAlias);
                return;
            }
        }
        if (typeAnnotation != nullptr && seenTypes.find(typeAnnotation) == seenTypes.end()) {
            seenTypes.insert(typeAnnotation);
            types.push_back(typeAnnotation);
        }
    }

    // Get collected types (const accessor for interop use)
    const std::vector<es2panda_AstNode*>& GetTypes() const
    {
        return types;
    }

    // Get number of collected types
    size_t GetTypeCount() const
    {
        return types.size();
    }
};

/* Resolves properties from ClassDefinition (handles inheritance from parent classes) */
struct ClassDefinitionResolver {
    es2panda_Context* context;
    es2panda_Impl* impl;
    es2panda_AstNode* classDef;
    std::vector<es2panda_AstNode*> properties;
    std::unordered_set<std::string> seenPropertyNames;

    ClassDefinitionResolver(const ClassDefinitionResolver&) = delete;
    ClassDefinitionResolver& operator=(const ClassDefinitionResolver&) = delete;

    ClassDefinitionResolver(ClassDefinitionResolver&& other) noexcept
        : context(other.context),
          impl(other.impl),
          classDef(other.classDef),
          properties(std::move(other.properties)),
          seenPropertyNames(std::move(other.seenPropertyNames))
    {
        // Leave source in a valid but empty state
        other.context = nullptr;
        other.impl = nullptr;
        other.classDef = nullptr;
    }

    ClassDefinitionResolver& operator=(ClassDefinitionResolver&& other) noexcept
    {
        if (this != &other) {
            context = other.context;
            impl = other.impl;
            classDef = other.classDef;
            properties = std::move(other.properties);
            seenPropertyNames = std::move(other.seenPropertyNames);
            // Leave source in a valid but empty state
            other.context = nullptr;
            other.impl = nullptr;
            other.classDef = nullptr;
        }
        return *this;
    }

    ClassDefinitionResolver(es2panda_Context* ctx, es2panda_AstNode* classDefinition)
        : context(ctx), impl(nullptr), classDef(classDefinition)
    {
        // Validate context before getting impl
        if (context != nullptr) {
            impl = GetImpl();
        }
        // Only proceed if we have valid pointers
        if (IsValid()) {
            CollectProperties();
        }
    }

    ~ClassDefinitionResolver() = default;

    // Check if in valid state (not moved-from and properly initialized)
    bool IsValid() const
    {
        return context != nullptr && impl != nullptr;
    }

    bool IsGetterOrSetterMethod(es2panda_AstNode* member) const
    {
        if (!IsValid() || member == nullptr) {
            return 0;
        }
        bool isGetterOrSetterMethod = impl->IsMethodDefinition(member) &&
        (
            impl->MethodDefinitionIsGetterConst(context, member) ||
            impl->MethodDefinitionIsSetterConst(context, member)
        );
        return isGetterOrSetterMethod;
    }

    // Get property name from ClassProperty or MethodDefinition
    const char* GetPropertyName(es2panda_AstNode* member) const
    {
        if (!IsValid() || member == nullptr) {
            return nullptr;
        }
        const char* propName = nullptr;
        if (impl->IsClassProperty(member)) {
            // Handle ClassProperty
            auto* key = impl->ClassElementKey(context, member);
            if (key != nullptr && impl->IsIdentifier(key)) {
                propName = impl->IdentifierNameConst(context, key);
            }
        } else if (impl->IsMethodDefinition(member)) {
            // Handle MethodDefinition (getter/setter methods)
            // Only collect getter/setter methods as properties
            if (IsGetterOrSetterMethod(member)) {
                auto* key = impl->ClassElementKey(context, member);
                if (key != nullptr && impl->IsIdentifier(key)) {
                    propName = impl->IdentifierNameConst(context, key);
                }
            }
        }
        return propName;
    }

    // Helper: Collect properties from class body with proper deduplication
    // Returns vector of properties with ClassProperty taking priority over getters for same name
    std::vector<es2panda_AstNode*> CollectPropertiesFromClassBody(es2panda_AstNode* classDefinition)
    {
        std::vector<es2panda_AstNode*> classProperties;
        if (!IsValid() || classDefinition == nullptr) {
            return classProperties;
        }
        if (!impl->IsClassDefinition(classDefinition)) {
            return classProperties;
        }
        size_t bodySize = 0;
        auto** body = impl->ClassDefinitionBody(context, classDefinition, &bodySize);
        if (body == nullptr) {
            return classProperties;
        }
        // Map to track properties by name (ClassProperty takes priority over getters)
        std::unordered_map<std::string, es2panda_AstNode*> propertyMap;
        for (size_t i = 0; i < bodySize; i++) {
            auto* member = body[i];
            if (member == nullptr) {
                continue;
            }
            // Only process ClassProperty and getter/setter MethodDefinition
            bool isPropertyMember = impl->IsClassProperty(member);
            bool isMethodMember = IsGetterOrSetterMethod(member);
            if (!isPropertyMember && !isMethodMember) {
                continue;
            }
            const char* propName = GetPropertyName(member);
            if (propName == nullptr) {
                continue;
            }
            std::string propNameStr(propName);
            auto it = propertyMap.find(propNameStr);
            if (it == propertyMap.end()) {
                // First time seeing this property name
                propertyMap[propNameStr] = member;
            } else {
                // Property name already exists
                es2panda_AstNode* existing = it->second;
                // If existing is a getter and new is a ClassProperty, replace it
                // (ClassProperty has higher priority than getter on the same level)
                if (impl->IsMethodDefinition(existing) && isPropertyMember) {
                    it->second = member;
                }
                // If existing is a ClassProperty, keep it (don't replace with getter)
                // If both are getters or both are properties, keep the first one seen
            }
        }
        // Convert map to vector
        for (const auto& entry : propertyMap) {
            classProperties.push_back(entry.second);
        }
        return classProperties;
    }

    // Helper: Get the super class declaration from a class definition
    // Returns the super class declaration if found and is a valid class definition, nullptr otherwise
    es2panda_AstNode* GetSuperClassDeclaration(es2panda_AstNode* classDefinition)
    {
        if (!IsValid() || classDefinition == nullptr) {
            return nullptr;
        }
        if (!impl->IsClassDefinition(classDefinition)) {
            return nullptr;
        }
        auto* superClass = impl->ClassDefinitionSuper(context, classDefinition);
        if (superClass == nullptr || !impl->IsETSTypeReference(superClass)) {
            return nullptr;
        }
        auto* superPart = impl->ETSTypeReferencePart(context, superClass);
        if (superPart == nullptr) {
            return nullptr;
        }
        auto* superName = impl->ETSTypeReferencePartName(context, superPart);
        if (superName == nullptr) {
            return nullptr;
        }
        auto* superDecl = impl->DeclarationFromIdentifier(context, superName);
        if (superDecl != nullptr && impl->IsClassDefinition(superDecl)) {
            return superDecl;
        }
        return nullptr;
    }

    // Collect all class properties from ClassDefinition and parent classes
    void CollectProperties()
    {
        if (!IsValid() || classDef == nullptr) {
            return;
        }
        if (!impl->IsClassDefinition(classDef)) {
            return;
        }
        size_t bodySize = 0;
        auto** body = impl->ClassDefinitionBody(context, classDef, &bodySize);
        if (body == nullptr) {
            return;
        }
        // First, collect properties from parent classes (added if not overridden)
        auto* superDecl = GetSuperClassDeclaration(classDef);
        if (superDecl != nullptr) {
            // Collect parent properties recursively
            CollectPropertiesFrom(superDecl);
        }
        // Then, collect properties from this class (child overrides parent)
        std::vector<es2panda_AstNode*> currProperties = CollectPropertiesFromClassBody(classDef);
        for (auto* member : currProperties) {
            if (member == nullptr) {
                continue;
            }
            const char* propName = GetPropertyName(member);
            if (propName == nullptr) {
                continue;
            }
            std::string propNameStr(propName);
            // Check if this property was already seen from a parent class
            auto it = seenPropertyNames.find(propNameStr);
            if (it == seenPropertyNames.end()) {
                seenPropertyNames.insert(propNameStr);
                properties.push_back(member);
                continue;
            }
            // Property exists in parent, replace it with child's version
            // Find and remove the parent's version
            for (auto propIt = properties.begin(); propIt != properties.end(); ++propIt) {
                const char* existingPropName = GetPropertyName(*propIt);
                if (existingPropName != nullptr && propNameStr == existingPropName) {
                    properties.erase(propIt);
                    break;
                }
            }
            seenPropertyNames.insert(propNameStr);
            properties.push_back(member);
        }
    }

    // Helper: Collect properties from specific class definition (for parent classes)
    void CollectPropertiesFrom(es2panda_AstNode* classDefinition)
    {
        if (!IsValid() || classDefinition == nullptr) {
            return;
        }
        if (!impl->IsClassDefinition(classDefinition)) {
            return;
        }
        // First, recursively collect from this class's parent (if any)
        auto* superDecl = GetSuperClassDeclaration(classDefinition);
        if (superDecl != nullptr) {
            CollectPropertiesFrom(superDecl);
        }
        // Then collect properties from this class using the helper method
        // This ensures ClassProperty takes priority over getter methods within the same class
        std::vector<es2panda_AstNode*> currentClassProperties = CollectPropertiesFromClassBody(classDefinition);
        for (auto* member : currentClassProperties) {
            if (member == nullptr) {
                continue;
            }
            const char* propName = GetPropertyName(member);
            if (propName == nullptr) {
                continue;
            }
            std::string propNameStr(propName);
            // Only add if not already seen (i.e., not overridden by child class)
            if (seenPropertyNames.find(propNameStr) == seenPropertyNames.end()) {
                seenPropertyNames.insert(propNameStr);
                properties.push_back(member);
            }
        }
    }

    // Get the collected property pointers (for interop use)
    const std::vector<es2panda_AstNode*>& GetProperties() const
    {
        return properties;
    }
};

/* Resolves properties from TSInterfaceDeclaration (handles inheritance from parent interfaces) */
struct TSInterfaceDeclarationResolver {
    es2panda_Context* context;
    es2panda_Impl* impl;
    es2panda_AstNode* interfaceDecl;
    std::vector<es2panda_AstNode*> properties;
    std::unordered_set<std::string> seenPropertyNames;

    TSInterfaceDeclarationResolver(const TSInterfaceDeclarationResolver&) = delete;
    TSInterfaceDeclarationResolver& operator=(const TSInterfaceDeclarationResolver&) = delete;

    TSInterfaceDeclarationResolver(es2panda_Context* ctx, es2panda_AstNode* interfaceDeclaration)
        : context(ctx), impl(nullptr), interfaceDecl(interfaceDeclaration)
    {
        if (context != nullptr) {
            impl = GetImpl();
        }
        if (IsValid()) {
            CollectProperties();
        }
    }

    ~TSInterfaceDeclarationResolver() = default;

    bool IsValid() const
    {
        return context != nullptr && impl != nullptr;
    }

    // Get property name from ClassProperty or MethodDefinition
    const char* GetPropertyName(es2panda_AstNode* member) const
    {
        if (!IsValid() || member == nullptr) {
            return nullptr;
        }

        const char* propName = nullptr;

        // Handle ClassProperty
        if (impl->IsClassProperty(member)) {
            auto* key = impl->ClassElementKey(context, member);
            if (key != nullptr && impl->IsIdentifier(key)) {
                propName = impl->IdentifierNameConst(context, key);
            }
        } else if (impl->IsMethodDefinition(member)) {
            // Handle MethodDefinition (getter/setter methods)
            // Only collect getter/setter methods as properties
            if (IsGetterOrSetterMethod(member)) {
                auto* key = impl->ClassElementKey(context, member);
                if (key != nullptr && impl->IsIdentifier(key)) {
                    propName = impl->IdentifierNameConst(context, key);
                }
            }
        }

        return propName;
    }

    // Helper: Get interface declaration from TSInterfaceHeritage node
    // Returns the interface declaration if found and valid, nullptr otherwise
    es2panda_AstNode* GetInterfaceDeclarationFromHeritage(es2panda_AstNode* heritage) const
    {
        if (!IsValid() || heritage == nullptr) {
            return nullptr;
        }
        if (!impl->IsTSInterfaceHeritage(heritage)) {
            return nullptr;
        }
        auto* heritageExpr = impl->TSInterfaceHeritageExpr(context, heritage);
        if (heritageExpr == nullptr || !impl->IsETSTypeReference(heritageExpr)) {
            return nullptr;
        }
        auto* heritagePart = impl->ETSTypeReferencePart(context, heritageExpr);
        if (heritagePart == nullptr) {
            return nullptr;
        }
        auto* heritageName = impl->ETSTypeReferencePartName(context, heritagePart);
        if (heritageName == nullptr) {
            return nullptr;
        }
        auto* declaration = impl->DeclarationFromIdentifier(context, heritageName);
        if (declaration != nullptr && impl->IsTSInterfaceDeclaration(declaration)) {
            return declaration;
        }
        return nullptr;
    }

    bool IsGetterOrSetterMethod(es2panda_AstNode* member) const
    {
        if (!IsValid() || member == nullptr) {
            return 0;
        }
        bool isGetterOrSetterMethod = impl->IsMethodDefinition(member) &&
        (
            impl->MethodDefinitionIsGetterConst(context, member) ||
            impl->MethodDefinitionIsSetterConst(context, member)
        );
        return isGetterOrSetterMethod;
    }

    // Helper: Collect properties from interface body with proper deduplication
    // Returns vector of properties with ClassProperty taking priority over getters for same name
    std::vector<es2panda_AstNode*> CollectPropertiesFromInterfaceBody(es2panda_AstNode* interfaceDeclaration)
    {
        std::vector<es2panda_AstNode*> interfaceProperties;
        if (!IsValid() || interfaceDeclaration == nullptr) {
            return interfaceProperties;
        }
        if (!impl->IsTSInterfaceDeclaration(interfaceDeclaration)) {
            return interfaceProperties;
        }
        auto* body = impl->TSInterfaceDeclarationBody(context, interfaceDeclaration);
        if (body == nullptr) {
            return interfaceProperties;
        }
        size_t bodySize = 0;
        auto** bodyMembers = impl->TSInterfaceBodyBodyConst(context, body, &bodySize);
        if (bodyMembers == nullptr) {
            return interfaceProperties;
        }
        // Map to track properties by name (ClassProperty takes priority over getters)
        std::unordered_map<std::string, es2panda_AstNode*> propertyMap;
        for (size_t i = 0; i < bodySize; i++) {
            auto* member = bodyMembers[i];
            if (member == nullptr) {
                continue;
            }
            // Only process ClassProperty and getter/setter MethodDefinition
            bool isPropertyMember = impl->IsClassProperty(member);
            bool isMethodMember = IsGetterOrSetterMethod(member);
            if (!isPropertyMember && !isMethodMember) {
                continue;
            }
            const char* propName = GetPropertyName(member);
            if (propName == nullptr) {
                continue;
            }
            std::string propNameStr(propName);
            auto it = propertyMap.find(propNameStr);
            if (it == propertyMap.end()) {
                // First time seeing this property name
                propertyMap[propNameStr] = member;
            } else {
                // Property name already exists
                es2panda_AstNode* existing = it->second;
                // If existing is a getter and new is a ClassProperty, replace it
                // (ClassProperty has higher priority than getter on the same level)
                if (impl->IsMethodDefinition(existing) && isPropertyMember) {
                    it->second = member;
                }
                // If existing is a ClassProperty, keep it (don't replace with getter)
                // If both are getters or both are properties, keep the first one seen
            }
        }
        // Convert map to vector
        for (const auto& entry : propertyMap) {
            interfaceProperties.push_back(entry.second);
        }
        return interfaceProperties;
    }

    // Collect all interface properties including getter methods
    void CollectProperties()
    {
        if (!IsValid() || interfaceDecl == nullptr) {
            return;
        }
        if (!impl->IsTSInterfaceDeclaration(interfaceDecl)) {
            return;
        }
        // First, collect properties from extended interfaces (parent interfaces)
        size_t extendsLen = 0;
        auto** extends = impl->TSInterfaceDeclarationExtends(context, interfaceDecl, &extendsLen);
        if (extends != nullptr) {
            for (size_t i = 0; i < extendsLen; i++) {
                auto* extendDecl = GetInterfaceDeclarationFromHeritage(extends[i]);
                if (extendDecl != nullptr) {
                    CollectPropertiesFrom(extendDecl);
                }
            }
        }
        // Then, collect properties from this interface using the helper method
        // This ensures ClassProperty takes priority over getter methods within the same interface
        std::vector<es2panda_AstNode*> interfaceProps = CollectPropertiesFromInterfaceBody(interfaceDecl);
        for (auto* member : interfaceProps) {
            if (member == nullptr) {
                continue;
            }
            const char* propName = GetPropertyName(member);
            if (propName == nullptr) {
                continue;
            }
            std::string propNameStr(propName);
            // Only add if not already seen (child interfaces override parent)
            if (seenPropertyNames.find(propNameStr) == seenPropertyNames.end()) {
                seenPropertyNames.insert(propNameStr);
                properties.push_back(member);
            }
        }
    }

    // Helper to collect properties from a specific interface declaration
    void CollectPropertiesFrom(es2panda_AstNode* interfaceDecl)
    {
        if (!IsValid() || interfaceDecl == nullptr) {
            return;
        }
        if (!impl->IsTSInterfaceDeclaration(interfaceDecl)) {
            return;
        }
        // Use the helper method to collect properties with proper deduplication
        // This ensures ClassProperty takes priority over getter methods within the same interface
        std::vector<es2panda_AstNode*> interfaceProps = CollectPropertiesFromInterfaceBody(interfaceDecl);
        for (auto* member : interfaceProps) {
            if (member == nullptr) {
                continue;
            }
            const char* propName = GetPropertyName(member);
            if (propName == nullptr) {
                continue;
            }
            std::string propNameStr(propName);
            // Only add if not already seen (child interfaces override parent)
            if (seenPropertyNames.find(propNameStr) == seenPropertyNames.end()) {
                seenPropertyNames.insert(propNameStr);
                properties.push_back(member);
            }
        }
    }

    // Get the collected property pointers (for interop use)
    const std::vector<es2panda_AstNode*>& GetProperties() const
    {
        return properties;
    }
};

/**
 * Resolves element type from array type node (supports T[] and Array<T> syntax).
 * Unwraps type aliases and union types.
 */
struct ArrayTypeResolver {
    es2panda_Context* context;
    es2panda_Impl* impl;
    es2panda_AstNode* typeNode;
    es2panda_AstNode* elementType;
    std::vector<es2panda_AstNode*> resolvedElementTypes;
    std::unordered_set<es2panda_AstNode*> seenTypes;

    ArrayTypeResolver(const ArrayTypeResolver&) = delete;
    ArrayTypeResolver& operator=(const ArrayTypeResolver&) = delete;

    ArrayTypeResolver(ArrayTypeResolver&& other) noexcept
        : context(other.context),
          impl(other.impl),
          typeNode(other.typeNode),
          elementType(other.elementType),
          resolvedElementTypes(std::move(other.resolvedElementTypes)),
          seenTypes(std::move(other.seenTypes))
    {
        other.context = nullptr;
        other.impl = nullptr;
        other.typeNode = nullptr;
        other.elementType = nullptr;
    }

    ArrayTypeResolver& operator=(ArrayTypeResolver&& other) noexcept
    {
        if (this != &other) {
            context = other.context;
            impl = other.impl;
            typeNode = other.typeNode;
            elementType = other.elementType;
            resolvedElementTypes = std::move(other.resolvedElementTypes);
            seenTypes = std::move(other.seenTypes);
            other.context = nullptr;
            other.impl = nullptr;
            other.typeNode = nullptr;
            other.elementType = nullptr;
        }
        return *this;
    }

    ArrayTypeResolver(es2panda_Context* ctx, es2panda_AstNode* type)
        : context(ctx), impl(nullptr), typeNode(type), elementType(nullptr)
    {
        if (context != nullptr) {
            impl = GetImpl();
        }
        if (IsValid()) {
            ResolveElementType();
            // If we found an element type, unwrap it (handle type aliases and unions)
            if (elementType != nullptr) {
                UnwrapElementType(elementType);
            }
        }
    }

    ~ArrayTypeResolver() = default;

    bool IsValid() const
    {
        return context != nullptr && impl != nullptr && typeNode != nullptr;
    }

    // Helper: Get alias type annotation from ETSTypeReference
    // Returns the type annotation if the type reference resolves to a type alias declaration, nullptr otherwise
    es2panda_AstNode* GetAliasTypeAnnotationFromTypeReference(es2panda_AstNode* typeReference) const
    {
        if (!IsValid() || typeReference == nullptr) {
            return nullptr;
        }
        if (!impl->IsETSTypeReference(typeReference)) {
            return nullptr;
        }
        auto* part = impl->ETSTypeReferencePart(context, typeReference);
        if (part == nullptr) {
            return nullptr;
        }
        auto* name = impl->ETSTypeReferencePartName(context, part);
        if (name == nullptr) {
            return nullptr;
        }
        auto* declaration = impl->DeclarationFromIdentifier(context, name);
        if (declaration == nullptr || !impl->IsTSTypeAliasDeclaration(declaration)) {
            return nullptr;
        }
        return impl->TSTypeAliasDeclarationTypeAnnotationConst(context, declaration);
    }

    // Helper: Get the element type parameter from Array<T> type reference
    // Returns the first type parameter if this is an Array<T> type reference, nullptr otherwise
    es2panda_AstNode* GetArrayElementTypeParam(es2panda_AstNode* typeReference) const
    {
        if (!IsValid() || typeReference == nullptr) {
            return nullptr;
        }
        if (!impl->IsETSTypeReference(typeReference)) {
            return nullptr;
        }
        auto* part = impl->ETSTypeReferencePart(context, typeReference);
        if (part == nullptr) {
            return nullptr;
        }
        auto* name = impl->ETSTypeReferencePartName(context, part);
        if (name == nullptr || !impl->IsIdentifier(name)) {
            return nullptr;
        }
        const char* nameStr = impl->IdentifierNameConst(context, name);
        if (nameStr == nullptr || strcmp(nameStr, "Array") != 0) {
            return nullptr;
        }
        auto* typeParams = impl->ETSTypeReferencePartTypeParams(context, part);
        if (typeParams == nullptr) {
            return nullptr;
        }
        // Get the first type parameter (the element type of Array<T>)
        size_t paramsLen = 0;
        auto** params = impl->TSTypeParameterInstantiationParamsConst(context, typeParams, &paramsLen);
        if (params != nullptr && paramsLen > 0) {
            return params[0];
        }
        return nullptr;
    }

    // Unwrap element type to handle type aliases and union types
    void UnwrapElementType(es2panda_AstNode* type)
    {
        if (!IsValid() || type == nullptr) {
            return;
        }
        // Prevent infinite recursion for circular type references
        if (seenTypes.count(type) > 0) {
            return;
        }
        seenTypes.insert(type);
        auto nodeType = impl->AstNodeTypeConst(context, type);
        // Handle ETSUnionType - flatten the union types
        if (nodeType == Es2pandaAstNodeType::AST_NODE_TYPE_ETS_UNION_TYPE) {
            size_t unionTypesLen = 0;
            auto** unionTypes = impl->ETSUnionTypeIrTypesConst(context, type, &unionTypesLen);
            if (unionTypes == nullptr) {
                return;
            }
            for (size_t i = 0; i < unionTypesLen; i++) {
                if (unionTypes[i] != nullptr) {
                    UnwrapElementType(unionTypes[i]);
                }
            }
            return;
        }
        // Handle ETSTypeReference - resolve to declaration
        if (impl->IsETSTypeReference(type)) {
            auto aliasTypeAnnotation = GetAliasTypeAnnotationFromTypeReference(type);
            if (aliasTypeAnnotation != nullptr) {
                UnwrapElementType(aliasTypeAnnotation);
                return;
            }
        }
        // Handle TSTypeAliasDeclaration - resolve to its type annotation
        if (impl->IsTSTypeAliasDeclaration(type)) {
            auto aliasTypeAnnotation = impl->TSTypeAliasDeclarationTypeAnnotationConst(context, type);
            if (aliasTypeAnnotation != nullptr) {
                UnwrapElementType(aliasTypeAnnotation);
                return;
            }
        }
        // If we've reached a direct type (not a union or alias), add it to the vector
        resolvedElementTypes.push_back(type);
    }

    void ResolveElementType()
    {
        if (!IsValid()) {
            return;
        }
        auto nodeType = impl->AstNodeTypeConst(context, typeNode);
        // Handle TSArrayType (T[] syntax) - e.g., string[]
        if (nodeType == Es2pandaAstNodeType::AST_NODE_TYPE_TS_ARRAY_TYPE) {
            elementType = const_cast<es2panda_AstNode*>(impl->TSArrayTypeElementTypeConst(context, typeNode));
            return;
        }
        // Handle ETSTypeReference with name "Array" (Array<T> syntax)
        if (nodeType == Es2pandaAstNodeType::AST_NODE_TYPE_ETS_TYPE_REFERENCE) {
            auto* elementTypeParam = GetArrayElementTypeParam(typeNode);
            if (elementTypeParam != nullptr) {
                elementType = const_cast<es2panda_AstNode*>(elementTypeParam);
            }
        }
        // If not an array type, elementType remains nullptr
    }

    const std::vector<es2panda_AstNode*>& GetResolvedElementTypes() const
    {
        return resolvedElementTypes;
    }
};

KNativePointer impl_ResolveClassPropertyTypes(KNativePointer contextPtr, KNativePointer propertyPtr)
{
    const auto _context = reinterpret_cast<es2panda_Context*>(contextPtr);
    const auto _property = reinterpret_cast<es2panda_AstNode*>(propertyPtr);

    // Validate input parameters
    if (_context == nullptr || _property == nullptr) {
        return StageArena::CloneVector(static_cast<es2panda_AstNode**>(nullptr), 0);
    }

    // Validate node is a class property
    es2panda_Impl* impl = GetImpl();
    if (impl == nullptr || !impl->IsClassProperty(_property)) {
        return StageArena::CloneVector(static_cast<es2panda_AstNode**>(nullptr), 0);
    }

    // Use ClassPropertyResolver struct for safe type collection (handles null checks internally)
    ClassPropertyResolver typeResolver(_context, _property, nullptr);

    // Double-check struct is valid after construction (defensive programming)
    if (!typeResolver.IsValid()) {
        return StageArena::CloneVector(static_cast<es2panda_AstNode**>(nullptr), 0);
    }

    // Get collected types using accessor method
    const auto& types = typeResolver.GetTypes();
    return StageArena::CloneVector(types.data(), types.size());
}
KOALA_INTEROP_2(ResolveClassPropertyTypes, KNativePointer, KNativePointer, KNativePointer);

KNativePointer impl_ResolveClassDefinitionProperties(KNativePointer contextPtr, KNativePointer classDefPtr)
{
    const auto _context = reinterpret_cast<es2panda_Context*>(contextPtr);
    const auto _classDef = reinterpret_cast<es2panda_AstNode*>(classDefPtr);

    // Validate input parameters
    if (_context == nullptr || _classDef == nullptr) {
        return StageArena::CloneVector(static_cast<es2panda_AstNode**>(nullptr), 0);
    }

    // Validate node is a class definition
    es2panda_Impl* impl = GetImpl();
    if (impl == nullptr || !impl->IsClassDefinition(_classDef)) {
        return StageArena::CloneVector(static_cast<es2panda_AstNode**>(nullptr), 0);
    }

    // Use ClassDefinitionResolver struct for safe property collection
    ClassDefinitionResolver classResolver(_context, _classDef);

    // Double-check the struct is valid after construction (defensive programming)
    if (!classResolver.IsValid()) {
        return StageArena::CloneVector(static_cast<es2panda_AstNode**>(nullptr), 0);
    }

    // Get collected properties using accessor method
    const auto& properties = classResolver.GetProperties();

    // Convert to format suitable for return to TypeScript
    return StageArena::CloneVector(properties.data(), properties.size());
}
KOALA_INTEROP_2(ResolveClassDefinitionProperties, KNativePointer, KNativePointer, KNativePointer);

KNativePointer impl_ResolveTSInterfaceDeclarationProperties(KNativePointer contextPtr, KNativePointer interfaceDeclPtr)
{
    const auto _context = reinterpret_cast<es2panda_Context*>(contextPtr);
    const auto _interfaceDecl = reinterpret_cast<es2panda_AstNode*>(interfaceDeclPtr);

    // Validate input parameters
    if (_context == nullptr || _interfaceDecl == nullptr) {
        return StageArena::CloneVector(static_cast<es2panda_AstNode**>(nullptr), 0);
    }

    // Validate node is a TSInterfaceDeclaration
    es2panda_Impl* impl = GetImpl();
    if (impl == nullptr || !impl->IsTSInterfaceDeclaration(_interfaceDecl)) {
        return StageArena::CloneVector(static_cast<es2panda_AstNode**>(nullptr), 0);
    }

    // Use TSInterfaceDeclarationResolver struct for safe property collection
    TSInterfaceDeclarationResolver interfaceResolver(_context, _interfaceDecl);

    if (!interfaceResolver.IsValid()) {
        return StageArena::CloneVector(static_cast<es2panda_AstNode**>(nullptr), 0);
    }

    // Get collected properties using accessor method
    const auto& properties = interfaceResolver.GetProperties();

    // Convert to format suitable for return to TypeScript
    return StageArena::CloneVector(properties.data(), properties.size());
}
KOALA_INTEROP_2(ResolveTSInterfaceDeclarationProperties, KNativePointer, KNativePointer, KNativePointer);

KNativePointer impl_ResolveMethodDefinitionTypes(KNativePointer contextPtr, KNativePointer methodPtr)
{
    const auto _context = reinterpret_cast<es2panda_Context*>(contextPtr);
    const auto _method = reinterpret_cast<es2panda_AstNode*>(methodPtr);

    // Validate input parameters
    if (_context == nullptr || _method == nullptr) {
        return StageArena::CloneVector(static_cast<es2panda_AstNode**>(nullptr), 0);
    }

    // Validate node is a method definition
    es2panda_Impl* impl = GetImpl();
    if (impl == nullptr || !impl->IsMethodDefinition(_method)) {
        return StageArena::CloneVector(static_cast<es2panda_AstNode**>(nullptr), 0);
    }

    // Only handle getter/setter methods
    if (
        !impl->MethodDefinitionIsGetterConst(_context, _method) &&
        !impl->MethodDefinitionIsSetterConst(_context, _method)
    ) {
        return StageArena::CloneVector(static_cast<es2panda_AstNode**>(nullptr), 0);
    }

    // Use MethodDefinitionResolver struct for safe type collection
    MethodDefinitionResolver typeResolver(_context, _method);

    // Double-check the struct is valid after construction
    if (!typeResolver.IsValid()) {
        return StageArena::CloneVector(static_cast<es2panda_AstNode**>(nullptr), 0);
    }

    // Get collected types using accessor method
    const auto& types = typeResolver.GetTypes();
    return StageArena::CloneVector(types.data(), types.size());
}
KOALA_INTEROP_2(ResolveMethodDefinitionTypes, KNativePointer, KNativePointer, KNativePointer);

KNativePointer impl_ResolveArrayLikeType(KNativePointer contextPtr, KNativePointer typeNodePtr)
{
    const auto _context = reinterpret_cast<es2panda_Context*>(contextPtr);
    const auto _typeNode = reinterpret_cast<es2panda_AstNode*>(typeNodePtr);

    if (_context == nullptr || _typeNode == nullptr) {
        return StageArena::CloneVector(static_cast<es2panda_AstNode**>(nullptr), 0);
    }

    // Use ArrayTypeResolver struct for safe type resolution
    ArrayTypeResolver resolver(_context, _typeNode);

    // Get the resolved element types (returns empty vector if not an array-like type)
    const auto& types = resolver.GetResolvedElementTypes();
    return StageArena::CloneVector(types.data(), types.size());
}
KOALA_INTEROP_2(ResolveArrayLikeType, KNativePointer, KNativePointer, KNativePointer);

// Helper: Check if an ETSTypeReference's name matches the given target name
static bool TypeReferenceNameEquals(es2panda_Impl* impl,
    es2panda_Context* context,
    es2panda_AstNode* typeReference,
    const char* targetName)
{
    if (impl == nullptr || context == nullptr || typeReference == nullptr || targetName == nullptr) {
        return false;
    }
    auto* part = impl->ETSTypeReferencePart(context, typeReference);
    if (part == nullptr) {
        return false;
    }
    auto* name = impl->ETSTypeReferencePartName(context, part);
    if (name == nullptr || !impl->IsIdentifier(name)) {
        return false;
    }
    const char* nameStr = impl->IdentifierNameConst(context, name);
    if (nameStr == nullptr) {
        return false;
    }
    return strcmp(nameStr, targetName) == 0;
}

// Helper: Get the super class declaration from a class definition (standalone version)
static es2panda_AstNode* GetSuperClassDeclaration(es2panda_Impl* impl,
    es2panda_Context* context,
    es2panda_AstNode* classDefinition)
{
    if (impl == nullptr || context == nullptr || classDefinition == nullptr) {
        return nullptr;
    }
    if (!impl->IsClassDefinition(classDefinition)) {
        return nullptr;
    }
    auto* superClass = impl->ClassDefinitionSuper(context, classDefinition);
    if (superClass == nullptr || !impl->IsETSTypeReference(superClass)) {
        return nullptr;
    }
    auto* superPart = impl->ETSTypeReferencePart(context, superClass);
    if (superPart == nullptr) {
        return nullptr;
    }
    auto* superName = impl->ETSTypeReferencePartName(context, superPart);
    if (superName == nullptr) {
        return nullptr;
    }
    auto* superDecl = impl->DeclarationFromIdentifier(context, superName);
    if (superDecl != nullptr && impl->IsClassDefinition(superDecl)) {
        return superDecl;
    }
    return nullptr;
}

/**
 * Find superClass expression in inheritance chain with given base class name.
 * Returns the superClass ETSTypeReference expression (not ClassDefinition).
 */
KNativePointer impl_ClassDefinitionFindSuperClassByName(KNativePointer contextPtr,
    KNativePointer classDefPtr,
    KStringPtr& baseClassName)
{
    const auto _context = reinterpret_cast<es2panda_Context*>(contextPtr);
    const auto _classDef = reinterpret_cast<es2panda_AstNode*>(classDefPtr);
    if (_context == nullptr || _classDef == nullptr) {
        return nullptr;
    }
    es2panda_Impl* impl = GetImpl();
    if (impl == nullptr) {
        return nullptr;
    }
    // Validate node is a class definition
    if (!impl->IsClassDefinition(_classDef)) {
        return nullptr;
    }
    const auto targetName = getStringCopy(baseClassName);
    // Start with the current class
    es2panda_AstNode* currentClass = _classDef;
    std::unordered_set<es2panda_AstNode*> visited;  // Prevent infinite loops for circular inheritance
    while (currentClass != nullptr && visited.find(currentClass) == visited.end()) {
        visited.insert(currentClass);
        // Get superClass (parent class) - this is the "extends" clause
        auto* superClass = impl->ClassDefinitionSuper(_context, currentClass);
        if (superClass == nullptr || !impl->IsETSTypeReference(superClass)) {
            break;
        }
        // Check if superClass name matches target
        if (TypeReferenceNameEquals(impl, _context, superClass, targetName)) {
            // Found! Return superClass expression (ETSTypeReference)
            return superClass;
        }
        // Get super class declaration and continue traversal
        auto* superDecl = GetSuperClassDeclaration(impl, _context, currentClass);
        if (superDecl == nullptr) {
            break;
        }
        // Continue with parent class
        currentClass = superDecl;
    }
    return nullptr;
}
KOALA_INTEROP_3(ClassDefinitionFindSuperClassByName, KNativePointer, KNativePointer, KNativePointer, KStringPtr);

static KNativePointer findPropertyInClassDefinition(KNativePointer context, KNativePointer classInstance, char *keyName)
{
    const auto _context = reinterpret_cast<es2panda_Context*>(context);
    const auto _instance = reinterpret_cast<es2panda_AstNode*>(classInstance);

    // Use ClassDefinitionResolver struct for safe property collection
    ClassDefinitionResolver classResolver(_context, _instance);

    // Double-check the struct is valid after construction (defensive programming)
    if (!classResolver.IsValid()) {
        return nullptr;
    }

    // Get collected properties using accessor method
    const auto& properties = classResolver.GetProperties();
    for (auto* member : properties) {
        if (member == nullptr) {
            continue;
        }
        const auto _key = reinterpret_cast<es2panda_AstNode*>(GetImpl()->ClassElementKey(_context, member));
        if (_key == nullptr) {
            continue;
        }
        if (strcmp(GetImpl()->IdentifierName(_context, _key), keyName) == 0) {
            return member;
        }
    }
    return nullptr;
}

static KNativePointer findPropertyInTSInterfaceDeclaration(
    KNativePointer context, KNativePointer classInstance, char *keyName)
{
    const auto _context = reinterpret_cast<es2panda_Context*>(context);
    const auto _instance = reinterpret_cast<es2panda_AstNode*>(classInstance);

    // Use TSInterfaceDeclarationResolver struct for safe property collection
    TSInterfaceDeclarationResolver interfaceResolver(_context, _instance);

    if (!interfaceResolver.IsValid()) {
        return nullptr;
    }

    // Get collected properties using accessor method
    const auto& properties = interfaceResolver.GetProperties();
    for (auto* member : properties) {
        if (member == nullptr) {
            continue;
        }
        const auto _key = reinterpret_cast<es2panda_AstNode*>(GetImpl()->ClassElementKey(_context, member));
        if (_key == nullptr) {
            continue;
        }
        if (strcmp(GetImpl()->IdentifierName(_context, _key), keyName) == 0) {
            return member;
        }
    }
    return nullptr;
}
