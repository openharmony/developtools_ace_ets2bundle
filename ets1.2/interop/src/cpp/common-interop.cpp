/*
 * Copyright (c) 2022-2023 Huawei Device Co., Ltd.
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
#include <map>
#include <string>
#include <vector>
#include <atomic>

#ifdef KOALA_INTEROP_MODULE
#undef KOALA_INTEROP_MODULE
#endif

#define KOALA_INTEROP_MODULE InteropNativeModule
#include "common-interop.h"
#include "dynamic-loader.h"
#include "interop-logging.h"
#include "interop-utils.h"
#include "koala-types.h"

#ifdef KOALA_FOREIGN_NAPI
#ifndef KOALA_FOREIGN_NAPI_OHOS
#include <node_api.h>
#else
#include <native_api.h>
#include <native_node_api.h>
#endif
#endif

#if KOALA_INTEROP_PROFILER
#include "profiler.h"

InteropProfiler* InteropProfiler::_instance = nullptr;

#endif

using std::string;

#if defined(KOALA_NAPI) || defined(KOALA_ANI)
// Callback dispatcher MOVED to convertors-napi.cc.
// Let's keep platform-specific parts of the code together

typedef void (*hold_t)(KInt);

KInteropBuffer impl_MaterializeBuffer(
    KNativePointer data, KLong length, KInt resourceId, KNativePointer holdPtr, KNativePointer releasePtr)
{
    auto hold = reinterpret_cast<void (*)(KInt)>(holdPtr);
    if (hold == nullptr) {
        INTEROP_FATAL("MaterializeBuffer failed!")
    }
    hold(resourceId);
    auto release = reinterpret_cast<void (*)(KInt)>(releasePtr);
    return KInteropBuffer { length, data, resourceId, release };
}
KOALA_INTEROP_5(MaterializeBuffer, KInteropBuffer, KNativePointer, KLong, KInt, KNativePointer, KNativePointer)

KNativePointer impl_GetNativeBufferPointer(KInteropBuffer buffer)
{
    return buffer.data;
}
KOALA_INTEROP_1(GetNativeBufferPointer, KNativePointer, KInteropBuffer)

#endif

KInt impl_StringLength(KNativePointer ptr)
{
    string* s = reinterpret_cast<string*>(ptr);
    if (s == nullptr) {
        INTEROP_FATAL("StringLength failed!")
    }
    return s->length();
}
KOALA_INTEROP_1(StringLength, KInt, KNativePointer)

void impl_StringData(KNativePointer ptr, KByte* bytes, KInt size)
{
    string* s = reinterpret_cast<string*>(ptr);
    if (s) {
        interop_memory_copy(bytes, size, s->c_str(), size);
    }
}
KOALA_INTEROP_V3(StringData, KNativePointer, KByte*, KInt)

#ifdef KOALA_JNI
// For Java only yet.
KInteropBuffer impl_StringDataBytes(KVMContext vmContext, KNativePointer ptr)
{
    string* s = reinterpret_cast<std::string*>(ptr);
    KInteropBuffer result = { (int32_t)s->length(), (void*)s->c_str() };
    return result;
}
KOALA_INTEROP_CTX_1(StringDataBytes, KInteropBuffer, KNativePointer)
#endif

KNativePointer impl_StringMake(const KStringPtr& str)
{
    return new string(str.c_str());
}
KOALA_INTEROP_1(StringMake, KNativePointer, KStringPtr)

// For slow runtimes w/o fast encoders.
KInt impl_ManagedStringWrite(const KStringPtr& string, KSerializerBuffer buffer, KInt bufferSize, KInt offset)
{
    KInt requiredSize = offset + string.length() + 1;
    if (bufferSize < requiredSize) {
        INTEROP_FATAL("Buffer size %d is less than than required for writing string %d on offset %d",
            bufferSize, string.length(), offset);
        return -1;
    }
    interop_memory_copy((uint8_t*)buffer + offset, bufferSize, string.c_str(), string.length() + 1);
    return string.length() + 1;
}
KOALA_INTEROP_4(ManagedStringWrite, KInt, KStringPtr, KSerializerBuffer, KInt, KInt)

void stringFinalizer(string* ptr)
{
    delete ptr;
}
KNativePointer impl_GetStringFinalizer()
{
    return fnPtr<string>(stringFinalizer);
}
KOALA_INTEROP_0(GetStringFinalizer, KNativePointer)

void impl_InvokeFinalizer(KNativePointer obj, KNativePointer finalizer)
{
    auto finalizer_f = reinterpret_cast<void (*)(KNativePointer)>(finalizer);
    if (finalizer_f == nullptr) {
        INTEROP_FATAL("Invoke Finalizer failed!")
    }
    finalizer_f(obj);
}
KOALA_INTEROP_V2(InvokeFinalizer, KNativePointer, KNativePointer)

KInteropReturnBuffer impl_GetPtrVector(KNativePointer ptr)
{
    auto vectorPtr = reinterpret_cast<std::vector<void*>*>(ptr);
    if (vectorPtr == nullptr) {
        INTEROP_FATAL("GetPtrVector failed!")
    }
    return KInteropReturnBuffer::from(*vectorPtr, nullptr);
}
KOALA_INTEROP_1(GetPtrVector, KInteropReturnBuffer, KNativePointer)

KInt impl_GetPtrVectorSize(KNativePointer ptr)
{
    auto vectorPtr = reinterpret_cast<std::vector<void*>*>(ptr);
    if (vectorPtr == nullptr) {
        INTEROP_FATAL("GetPtrVectorSize failed!")
    }
    return vectorPtr->size();
}
KOALA_INTEROP_1(GetPtrVectorSize, KInt, KNativePointer)

KNativePointer impl_GetPtrVectorElement(KNativePointer ptr, KInt index)
{
    auto vectorPtr = reinterpret_cast<std::vector<void*>*>(ptr);
    if (vectorPtr == nullptr) {
        INTEROP_FATAL("GetPtrVectorElement failed!")
    }
    auto element = vectorPtr->at(index);
    return nativePtr(element);
}
KOALA_INTEROP_2(GetPtrVectorElement, KNativePointer, KNativePointer, KInt)

inline KUInt unpackUInt(const KByte* bytes)
{
    return (bytes[0] | (bytes[1] << 8) | (bytes[2] << 16) | (bytes[3] << 24));
}

KNativePointer impl_GetGroupedLog(KInt index)
{
    return new std::string(GetDefaultLogger()->getGroupedLog(index));
}
KOALA_INTEROP_1(GetGroupedLog, KNativePointer, KInt)

void impl_StartGroupedLog(KInt index)
{
    GetDefaultLogger()->startGroupedLog(index);
}
KOALA_INTEROP_V1(StartGroupedLog, KInt)

void impl_StopGroupedLog(KInt index)
{
    GetDefaultLogger()->stopGroupedLog(index);
}
KOALA_INTEROP_V1(StopGroupedLog, KInt)

void impl_AppendGroupedLog(KInt index, const KStringPtr& message)
{
    if (GetDefaultLogger()->needGroupedLog(index))
        GetDefaultLogger()->appendGroupedLog(index, message.c_str());
}
KOALA_INTEROP_V2(AppendGroupedLog, KInt, KStringPtr)

void impl_PrintGroupedLog(KInt index)
{
#ifdef KOALA_OHOS
    LOGI("%" LOG_PUBLIC "s", GetDefaultLogger()->getGroupedLog(index));
#else
    fprintf(stdout, "%s\n", GetDefaultLogger()->getGroupedLog(index));
    fflush(stdout);
#endif
}
KOALA_INTEROP_V1(PrintGroupedLog, KInt)

int32_t callCallback(KVMContext context, int32_t methodId, uint8_t* argsData, int32_t argsLength)
{
#if KOALA_USE_NODE_VM || KOALA_USE_HZ_VM || KOALA_USE_PANDA_VM || KOALA_USE_JAVA_VM || KOALA_CJ
    KOALA_INTEROP_CALL_INT(context, methodId, argsLength, argsData);
    return 0;
#else
    return 0;
#endif
}

struct ForeignVMContext {
    KVMContext vmContext;
    int32_t (*callSync)(KVMContext vmContext, int32_t callback, uint8_t* data, int32_t length);
};
typedef KInt (*LoadVirtualMachine_t)(KInt vmKind, const char* bootFiles, const char* userFiles, const char* libraryPath,
    const struct ForeignVMContext* foreignVM);
typedef KNativePointer (*StartApplication_t)(const char* appUrl, const char* appParams, int32_t loopIterationr);
typedef KBoolean (*RunApplication_t)(const KInt arg0, const KInt arg1);
typedef const char* (*EmitEventT)(const KInt type, const KInt target, const KInt arg0, const KInt arg1);
typedef void (*RestartWithT)(const char* page);
typedef const char* (*LoadViewT)(const char* className, const char* params);

typedef KoalaHelperAPI* (*HelperInitT)();

void* GetVmloaderImpl(const char* path, const char* name)
{
    static void* lib = nullptr;
    if (!lib && name) {
        auto aLibrary =
#ifndef KOALA_OHOS // dlopen on OHOS doesn't like paths
            ((path == nullptr) ? "" : std::string(path)) + "/" +
#endif
            libName("vmloader");
        lib = loadLibrary(aLibrary);
        if (!lib) {
            LOGE("Ensure vmloader library %s was built", aLibrary.c_str());
        }
    }
    return findSymbol(lib, name);
}

void* GetHelperImpl(const char* path, const char* name)
{
    static void* lib = nullptr;
    if (!lib && name) {
        auto aLibrary =
#ifndef KOALA_OHOS // dlopen on OHOS doesn't like paths
            std::string(path) + "/" +
#endif
            libName("koalahelper");
        lib = loadLibrary(aLibrary);
        if (!lib) {
            LOGE("Ensure helper library %s was built", aLibrary.c_str());
            return nullptr;
        }
    }
    return findSymbol(lib, name);
}

void logFromHelper(const char* message) {
    fprintf(stderr, "Helper: %s\n", message);
}

KoalaHelperHost helperHost {
    logFromHelper
};
KoalaHelperAPI* helperApi { nullptr };

KInt impl_LoadHelperLibrary(const KStringPtr& libraryPath)
{
    const char* envLibraryPath = std::getenv("KOALA_HELPER_PATH");
    if (envLibraryPath) {
        LOGI("KOALA_HELPER_PATH used %" LOG_PUBLIC "s", envLibraryPath);
    }

    const char* aLibraryPath = envLibraryPath ? envLibraryPath : libraryPath.c_str();
    HelperInitT impl = reinterpret_cast<HelperInitT>(GetHelperImpl(aLibraryPath, "koalaHelperAPI"));
    if (!impl) {
        LOGE("Cannot load helper");
        return 0;
    }
    helperApi = impl();
    if (!helperApi) {
        LOGE("Cannot init helper");
        return 0;
    }
    return helperApi->init(&helperHost);
}
KOALA_INTEROP_1(LoadHelperLibrary, KInt, KStringPtr)

KInt impl_NotifyEventLoop(KInt isStart, KInt expectedLoad)
{
    if (!helperApi) {
        INTEROP_FATAL("LoadHelperLibrary() must be called first");
    }
    return helperApi->notifyEventLoop(isStart, expectedLoad);
}
KOALA_INTEROP_DIRECT_2(NotifyEventLoop, KInt, KInt, KInt)

KInt impl_LoadVirtualMachine(KVMContext vmContext, KInt vmKind, const KStringPtr& bootFiles,
    const KStringPtr& userFiles, const KStringPtr& libraryPath)
{
    const char* envClassPath = std::getenv("PANDA_CLASS_PATH");
    if (envClassPath) {
        LOGI("CLASS PATH updated from env var PANDA_CLASS_PATH, %" LOG_PUBLIC "s", envClassPath);
    }
    const char* bootFilesPath = envClassPath ? envClassPath : bootFiles.c_str();
    const char* nativeLibPath = envClassPath ? envClassPath : libraryPath.c_str();

    LoadVirtualMachine_t impl = nullptr;
    if (!impl) {
        impl = reinterpret_cast<LoadVirtualMachine_t>(GetVmloaderImpl(nativeLibPath, "LoadVirtualMachine"));
    }
    if (!impl) {
        KOALA_INTEROP_THROW_STRING(vmContext, "Cannot load VM", -1);
    }
    const ForeignVMContext foreignVM = { vmContext, &callCallback };
    return impl(vmKind, bootFilesPath, userFiles.c_str(), nativeLibPath, &foreignVM);
}
KOALA_INTEROP_CTX_4(LoadVirtualMachine, KInt, KInt, KStringPtr, KStringPtr, KStringPtr)

KNativePointer impl_StartApplication(const KStringPtr& appUrl, const KStringPtr& appParams, KInt loopIterations)
{
    static StartApplication_t impl = nullptr;
    if (!impl) {
        impl = reinterpret_cast<StartApplication_t>(GetVmloaderImpl(nullptr, "StartApplication"));
    }
    return impl(appUrl.c_str(), appParams.c_str(), loopIterations);
}
KOALA_INTEROP_3(StartApplication, KNativePointer, KStringPtr, KStringPtr, KInt)

KBoolean impl_RunApplication(const KInt arg0, const KInt arg1)
{
    static RunApplication_t impl = nullptr;
    if (!impl) {
        impl = reinterpret_cast<RunApplication_t>(GetVmloaderImpl(nullptr, "RunApplication"));
    }
    return impl(arg0, arg1);
}
KOALA_INTEROP_2(RunApplication, KBoolean, KInt, KInt)

KStringPtr impl_EmitEvent(KVMContext vmContext, KInt type, KInt target, KInt arg0, KInt arg1)
{
    static EmitEventT impl = nullptr;
    if (!impl) {
        impl = reinterpret_cast<EmitEventT>(GetVmloaderImpl(nullptr, "EmitEvent"));
    }
    const char* out = impl(type, target, arg0, arg1);
    if (out == nullptr) {
        return KStringPtr(static_cast<const char*>(nullptr));
    }
    auto size = std::string(out).size();
    KStringPtr result(out, size, true);
    return result;
}
KOALA_INTEROP_CTX_4(EmitEvent, KStringPtr, KInt, KInt, KInt, KInt)

void impl_RestartWith(const KStringPtr& page)
{
    static RestartWithT impl = nullptr;
    if (!impl) {
        impl = reinterpret_cast<RestartWithT>(GetVmloaderImpl(nullptr, "RestartWith"));
    }
    impl(page.c_str());
}
KOALA_INTEROP_V1(RestartWith, KStringPtr)

#ifdef KOALA_ANI
KStringPtr impl_LoadView(const KStringPtr& className, const KStringPtr& params)
{
    static LoadViewT impl = nullptr;
    if (!impl) {
        impl = reinterpret_cast<LoadViewT>(GetVmloaderImpl(nullptr, "LoadView"));
    }
    const char* result = impl(className.c_str(), params.c_str());
    return KStringPtr(result, strlen(result), true);
}
KOALA_INTEROP_2(LoadView, KStringPtr, KStringPtr, KStringPtr)
#endif // KOALA_ANI

KNativePointer impl_Malloc(KLong length)
{
    if (length == 0) {
        INTEROP_FATAL("Zero allocation size. Memory allocation failed!")
    }
    const auto ptr = static_cast<char*>(malloc(length));
    if (ptr == nullptr) {
        INTEROP_FATAL("Memory allocation failed!")
    }
    return ptr;
}
KOALA_INTEROP_DIRECT_1(Malloc, KNativePointer, KLong)

void malloc_finalize(KNativePointer data)
{
    if (data) {
        free(data);
    }
}

KNativePointer impl_GetMallocFinalizer()
{
    return reinterpret_cast<KNativePointer>(malloc_finalize);
}
KOALA_INTEROP_DIRECT_0(GetMallocFinalizer, KNativePointer)

void impl_Free(KNativePointer data)
{
    malloc_finalize(data);
}
KOALA_INTEROP_DIRECT_V1(Free, KNativePointer)

KInt impl_ReadByte(KNativePointer data, KLong index, KLong length)
{
    if (index >= length) {
        INTEROP_FATAL(
            "impl_ReadByte: index %lld is equal or greater than length %lld", (long long)index, (long long)length
        )
    }
    uint8_t* ptr = reinterpret_cast<uint8_t*>(data);
    if (ptr == nullptr) {
        INTEROP_FATAL("Read byte failed!")
    }
    return ptr[index];
}
KOALA_INTEROP_DIRECT_3(ReadByte, KInt, KNativePointer, KLong, KLong)

void impl_WriteByte(KNativePointer data, KInt index, KLong length, KInt value)
{
    if (index >= length) {
        INTEROP_FATAL(
            "impl_WriteByte: index %lld is equal or greater than length %lld", (long long)index, (long long)length
        )
    }
    uint8_t* ptr = reinterpret_cast<uint8_t*>(data);
    if (ptr == nullptr) {
        INTEROP_FATAL("Read byte failed!")
    }
    ptr[index] = value;
}
KOALA_INTEROP_DIRECT_V4(WriteByte, KNativePointer, KLong, KLong, KInt)

void impl_CopyArray(KNativePointer data, KLong length, KByte* array)
{
    if (!array || !data) {
        INTEROP_FATAL("CopyArray called with incorrect nullptr args (array, data)")
    }

    interop_memory_copy(data, length, array, length);
}
KOALA_INTEROP_V3(CopyArray, KNativePointer, KLong, KByte*)

static const int API_KIND_MAX = 100;
static Callback_Caller_t g_callbackCaller[API_KIND_MAX] = { 0 };
static Callback_Caller_Sync_t g_callbackCallerSync[API_KIND_MAX] = { 0 };

inline void CheckValidApiKind(int apiKind)
{
    if (apiKind < 0 || apiKind > API_KIND_MAX) {
        INTEROP_FATAL("Maximum api kind is %d, received %d", API_KIND_MAX, apiKind);
    }
}

template <typename T>
inline void CheckHasCallbackCaller(int apiKind, T const* callbackCallers)
{
    CheckValidApiKind(apiKind);
    if (callbackCallers[apiKind] == nullptr) {
        INTEROP_FATAL("Callback caller for api kind %d was not set", apiKind);
    }
}

template <typename T>
inline void CheckHasNotCallbackCaller(int apiKind, T const* callbackCallers)
{
    CheckValidApiKind(apiKind);
    if (callbackCallers[apiKind] != nullptr) {
        INTEROP_FATAL("Callback caller for api kind %d already was set", apiKind);
    }
}

void SetCallbackCaller(int apiKind, Callback_Caller_t callbackCaller)
{
    CheckHasNotCallbackCaller(apiKind, g_callbackCaller);
    g_callbackCaller[apiKind] = callbackCaller;
}

void impl_CallCallback(KInt apiKind, KInt callbackKind, KSerializerBuffer args, KInt argsSize)
{
    CheckHasCallbackCaller(apiKind, g_callbackCaller);
    g_callbackCaller[apiKind](callbackKind, args, argsSize);
}
KOALA_INTEROP_V4(CallCallback, KInt, KInt, KSerializerBuffer, KInt)

void SetCallbackCallerSync(int apiKind, Callback_Caller_Sync_t callbackCallerSync)
{
    CheckHasNotCallbackCaller(apiKind, g_callbackCallerSync);
    g_callbackCallerSync[apiKind] = callbackCallerSync;
}

void impl_CallCallbackSync(KVMContext vmContext, KInt apiKind, KInt callbackKind, KSerializerBuffer args, KInt argsSize)
{
    CheckHasCallbackCaller(apiKind, g_callbackCallerSync);
    g_callbackCallerSync[apiKind](vmContext, callbackKind, args, argsSize);
}
KOALA_INTEROP_CTX_V4(CallCallbackSync, KInt, KInt, KSerializerBuffer, KInt)

void impl_CallCallbackResourceHolder(KNativePointer holder, KInt resourceId)
{
    auto ptr = reinterpret_cast<void (*)(KInt)>(holder);
    if (ptr == nullptr) {
        INTEROP_FATAL("Call Callback resource holder failed!")
    }
    ptr(resourceId);
}
KOALA_INTEROP_V2(CallCallbackResourceHolder, KNativePointer, KInt)

void impl_CallCallbackResourceReleaser(KNativePointer releaser, KInt resourceId)
{
    auto ptr = reinterpret_cast<void (*)(KInt)>(releaser);
    if (ptr == nullptr) {
        INTEROP_FATAL("Call Callback resource releaser failed!")
    }
    ptr(resourceId);
}
KOALA_INTEROP_V2(CallCallbackResourceReleaser, KNativePointer, KInt)

KInt impl_CallForeignVM(KNativePointer foreignContextRaw, KInt function, KSerializerBuffer data, KInt length)
{
    const ForeignVMContext* foreignContext = (const ForeignVMContext*)foreignContextRaw;
    if (foreignContext == nullptr) {
        INTEROP_FATAL("Call Foreign VM failed!")
    }
    // Improve: set actual callbacks caller/holder/releaser.
    /*
     *(int64_t*)(data + 8) = impl_CallCallbackSync;
     *(int64_t*)(data + 16) = 0;
     *(int64_t*)(data + 24) = 0; */
    return foreignContext->callSync(foreignContext->vmContext, function, reinterpret_cast<uint8_t*>(data), length);
}
KOALA_INTEROP_4(CallForeignVM, KInt, KNativePointer, KInt, KSerializerBuffer, KInt)

#ifdef KOALA_FOREIGN_NAPI
KVMContext g_foreignVMContext = nullptr;
#endif
void impl_SetForeignVMContext(KNativePointer foreignVMContextRaw)
{
#ifdef KOALA_FOREIGN_NAPI
    if (foreignVMContextRaw == nullptr) {
        g_foreignVMContext = nullptr;
    } else {
        auto foreignContext = (const ForeignVMContext*)foreignVMContextRaw;
        g_foreignVMContext = foreignContext->vmContext;
    }
#endif

    /* supress unused private fields */
    (void)foreignVMContextRaw;
}
KOALA_INTEROP_V1(SetForeignVMContext, KNativePointer)

#define QUOTE2(x) #x

#define QUOTE(x) QUOTE2(x)

void impl_NativeLog(const KStringPtr& str)
{
#ifdef KOALA_OHOS
    LOGI("%{public}s: %{public}s", QUOTE(INTEROP_LIBRARY_NAME), str.c_str());
#else
    fprintf(stdout, "%s: %s\n", QUOTE(INTEROP_LIBRARY_NAME), str.c_str());
    fflush(stdout);
#endif
}
KOALA_INTEROP_V1(NativeLog, KStringPtr)

void resolveDeferred(KVMDeferred* deferred, uint8_t* argsData, int32_t argsLength)
{
#ifdef KOALA_NAPI
    auto status =
        napi_call_threadsafe_function((napi_threadsafe_function)deferred->handler, deferred, napi_tsfn_nonblocking);
    if (status != napi_ok)
        LOGE("cannot call thread-safe function; status=%d", status);
    if (deferred->handler) {
        napi_release_threadsafe_function((napi_threadsafe_function)deferred->handler, napi_tsfn_release);
        deferred->handler = nullptr;
    }
#endif
#ifdef KOALA_ANI
    ani_vm* vm = (ani_vm*)deferred->context;
    ani_env* env = nullptr;
    ani_status status = vm->GetEnv(ANI_VERSION_1, &env);
    if (env == nullptr || status != ANI_OK) {
        status = vm->AttachCurrentThread(nullptr, ANI_VERSION_1, &env);
        CHECK_ANI_FATAL(nullptr, status);
    }
    ani_ref undef = nullptr;
    status = env->GetUndefined(&undef);
    CHECK_ANI_FATAL(env, status);
    status = env->PromiseResolver_Resolve((ani_resolver)deferred->handler, undef);
    CHECK_ANI_FATAL(env, status);
#endif
}

void rejectDeferred(KVMDeferred* deferred, const char* message)
{
#ifdef KOALA_NAPI
    if (deferred->handler) {
        napi_release_threadsafe_function((napi_threadsafe_function)deferred->handler, napi_tsfn_release);
        deferred->handler = nullptr;
    }
#endif
#ifdef KOALA_ANI
    if (deferred->handler) {
        ani_vm* vm = (ani_vm*)deferred->context;
        ani_env* env = nullptr;
        ani_status status = vm->GetEnv(ANI_VERSION_1, &env);
        if (env == nullptr || status != ANI_OK) {
            status = vm->AttachCurrentThread(nullptr, ANI_VERSION_1, &env);
            CHECK_ANI_FATAL(nullptr, status);
        }
        status = env->PromiseResolver_Reject((ani_resolver)deferred->handler, nullptr);
        CHECK_ANI_FATAL(env, status);
        deferred->handler = nullptr;
    }
#endif
}

#ifdef KOALA_NAPI
void resolveDeferredImpl(napi_env env, napi_value js_callback, KVMDeferred* deferred, void* data)
{
    napi_value undefined = nullptr;
    napi_get_undefined(env, &undefined);
    auto status = napi_resolve_deferred(env, (napi_deferred)deferred->context, undefined);
    if (status != napi_ok)
        LOGE("cannot resolve deferred; status=%d", status);
    delete deferred;
}
#endif

KVMDeferred* CreateDeferred(KVMContext vmContext, KVMObjectHandle* promiseHandle)
{
    KVMDeferred* deferred = new KVMDeferred();
    deferred->resolve = resolveDeferred;
    deferred->reject = rejectDeferred;
#ifdef KOALA_NAPI
    // Improve: move to interop!
    napi_env env = (napi_env)vmContext;
    napi_value promise;
    napi_value resourceName;
    napi_create_string_utf8(env, "Async", sizeof("Async"), &resourceName);
    auto status = napi_create_promise(env, (napi_deferred*)&deferred->context, &promise);
    if (status != napi_ok) {
        LOGE("cannot make a promise; status=%d", status);
        delete deferred;
        return nullptr;
    }
    status = napi_create_threadsafe_function(env, nullptr, nullptr, resourceName, 0, 1, nullptr, nullptr, deferred,
        (napi_threadsafe_function_call_js)resolveDeferredImpl, (napi_threadsafe_function*)&deferred->handler);
    if (status != napi_ok) {
        LOGE("cannot make threadsafe function; status=%d", status);
        delete deferred;
        return nullptr;
    }
    *promiseHandle = (KVMObjectHandle)promise;
#endif
#ifdef KOALA_ANI
    ani_env* env = (ani_env*)vmContext;
    ani_object promise = nullptr;
    ani_resolver resolver = nullptr;
    ani_status status = env->Promise_New(&resolver, &promise);
    deferred->handler = resolver;
    CHECK_ANI_FATAL(env, status);
    *promiseHandle = (KVMObjectHandle)promise;
    ani_vm* vm = nullptr;
    status = env->GetVM(&vm);
    CHECK_ANI_FATAL(env, status);
    deferred->context = vm;
#endif
    return deferred;
}

class KoalaWork {
protected:
    InteropVMContext vmContext;
#ifdef KOALA_FOREIGN_NAPI
    KVMContext foreignVMContext;
#endif
    void* vmWork;
    void* handle;
    void (*execute)(void* handle);
    void (*complete)(void* handle);

public:
    KoalaWork(InteropVMContext vmContext, InteropNativePointer handle, void (*execute)(InteropNativePointer handle),
        void (*complete)(InteropNativePointer handle));
    ~KoalaWork();
    void Queue();
    void Execute();
    void Cancel();
    void Complete();
};
static void DoQueue(void* handle)
{
    ((KoalaWork*)handle)->Queue();
}
static void DoCancel(void* handle)
{
    ((KoalaWork*)handle)->Cancel();
}

InteropAsyncWork koalaCreateWork(InteropVMContext vmContext, InteropNativePointer handle,
    void (*execute)(InteropNativePointer handle), void (*complete)(InteropNativePointer handle))
{
    return {
        new KoalaWork(vmContext, handle, execute, complete),
        DoQueue,
        DoCancel,
    };
}

const InteropAsyncWorker* GetAsyncWorker()
{
    static InteropAsyncWorker worker = { koalaCreateWork };
    return &worker;
}

KoalaWork::~KoalaWork() {
#if defined(KOALA_NAPI)
    if (vmWork) {
        napi_env env = (napi_env)vmContext;
        napi_cancel_async_work(env, (napi_async_work)vmWork);
    }
#endif
}

#if defined(KOALA_NAPI)
static void DoExecute(napi_env env, void* handle)
{
    ((KoalaWork*)handle)->Execute();
}
static void DoComplete(napi_env env, napi_status status, void* handle)
{
    ((KoalaWork*)handle)->Complete();
}
KoalaWork::KoalaWork(InteropVMContext vmContext, InteropNativePointer handle,
    void (*execute)(InteropNativePointer handle), void (*complete)(InteropNativePointer handle))
    : vmContext(vmContext), handle(handle), execute(execute), complete(complete)
{
    napi_env env = (napi_env)vmContext;
    napi_value resourceName = nullptr;
    napi_create_string_utf8(env, "KoalaAsyncOperation", NAPI_AUTO_LENGTH, &resourceName);
    napi_create_async_work(env, nullptr, resourceName, DoExecute, DoComplete, this, (napi_async_work*)&vmWork);
    /* supress unused private fields */
    (void)vmContext;
    (void)vmWork;
}
void KoalaWork::Queue()
{
    napi_env env = (napi_env)vmContext;
    napi_queue_async_work(env, (napi_async_work)vmWork);
    vmWork = nullptr;
}
void KoalaWork::Execute()
{
    execute(handle);
}
void KoalaWork::Cancel()
{
    napi_env env = (napi_env)vmContext;
    napi_cancel_async_work(env, (napi_async_work)vmWork);
    vmWork = nullptr;
}
void KoalaWork::Complete()
{
    complete(handle);
    delete this;
}
#else
#ifdef KOALA_FOREIGN_NAPI
static void DoExecute(napi_env env, void* handle)
{
    ((KoalaWork*)handle)->Execute();
}
static void DoComplete(napi_env env, napi_status status, void* handle)
{
    ((KoalaWork*)handle)->Complete();
}
#endif
KoalaWork::KoalaWork(InteropVMContext vmContext, InteropNativePointer handle,
    void (*execute)(InteropNativePointer handle), void (*complete)(InteropNativePointer handle))
    : vmContext(vmContext), handle(handle), execute(execute), complete(complete)
{
#ifdef KOALA_FOREIGN_NAPI
    if (g_foreignVMContext == nullptr) {
        INTEROP_FATAL("Can not launch async work while foreign VM context is not available. Please ensure you have "
                      "called SetForeignVMContext")
    }
    foreignVMContext = g_foreignVMContext;
    napi_env env = (napi_env)foreignVMContext;
    napi_value resourceName = nullptr;
    napi_create_string_utf8(env, "KoalaAsyncOperation", NAPI_AUTO_LENGTH, &resourceName);
    napi_create_async_work(env, nullptr, resourceName, DoExecute, DoComplete, this, (napi_async_work*)&vmWork);
#endif
    /* supress unused private fields */
    (void)vmContext;
    (void)vmWork;
}
void KoalaWork::Queue()
{
#ifdef KOALA_FOREIGN_NAPI
    napi_env env = (napi_env)foreignVMContext;
    napi_queue_async_work(env, (napi_async_work)vmWork);
#else
    Execute();
    Complete();
#endif
}

void KoalaWork::Execute()
{
    execute(handle);
}
void KoalaWork::Cancel()
{
#ifdef KOALA_FOREIGN_NAPI
    napi_env env = (napi_env)foreignVMContext;
    napi_cancel_async_work(env, (napi_async_work)vmWork);
#else
    INTEROP_FATAL("Cancelling async work is disabled for any VM except of Node")
#endif
}
void KoalaWork::Complete()
{
    complete(handle);
    delete this;
}
#endif

#if defined(KOALA_ANI)
KStringPtr impl_Utf8ToString(KVMContext vmContext, KNativePointer data, KInt offset, KInt length)
{
    KStringPtr result((const char*)data + offset, length, false);
    return result;
}
KOALA_INTEROP_CTX_3(Utf8ToString, KStringPtr, KNativePointer, KInt, KInt)
#elif defined(KOALA_NAPI) || defined(KOALA_JNI) || defined(KOALA_CJ)
// Allocate, so CTX versions.
KStringPtr impl_Utf8ToString(KVMContext vmContext, KByte* data, KInt offset, KInt length)
{
    KStringPtr result((const char*)(data + offset), length, false);
    return result;
}
KOALA_INTEROP_CTX_3(Utf8ToString, KStringPtr, KByte*, KInt, KInt)
#endif

#if defined(KOALA_NAPI) || defined(KOALA_ANI)
KStringPtr impl_RawUtf8ToString(KVMContext vmContext, KNativePointer data)
{
    auto stringPtr = (const char*)data;
    if (stringPtr == nullptr) {
        INTEROP_FATAL("RawUtf8ToString failed!")
    }
    KStringPtr result(stringPtr, strlen(stringPtr), false);
    return result;
}
KOALA_INTEROP_CTX_1(RawUtf8ToString, KStringPtr, KNativePointer)
#endif

#if defined(KOALA_ANI)
KNativePointer impl_AllocAtomic(KInt initial)
{
    return new std::atomic_int(initial);
}
KOALA_INTEROP_DIRECT_1(AllocAtomic, KNativePointer, KInt)

void impl_FreeAtomic(KNativePointer rawReference)
{
    auto* reference = reinterpret_cast<std::atomic_int*>(rawReference);
    delete reference;
}
KOALA_INTEROP_DIRECT_V1(FreeAtomic, KNativePointer)

KBoolean impl_CompareAndSwapAtomic(KNativePointer rawReference, KInt expectedValue, KInt newValue)
{
    auto* reference = reinterpret_cast<std::atomic_int*>(rawReference);
    return reference->compare_exchange_strong(expectedValue, newValue);
}
KOALA_INTEROP_DIRECT_3(CompareAndSwapAtomic, KBoolean, KNativePointer, KInt, KInt)
#endif

#if defined(KOALA_NAPI) || defined(KOALA_JNI) || defined(KOALA_CJ) || defined(KOALA_ANI) || \
    defined(KOALA_KOTLIN)
KStringPtr impl_StdStringToString(KVMContext vmContext, KNativePointer stringPtr)
{
    std::string* string = reinterpret_cast<std::string*>(stringPtr);
    KStringPtr result(string ? string->c_str() : nullptr, string ? string->size() : 0, false);
    return result;
}
KOALA_INTEROP_CTX_1(StdStringToString, KStringPtr, KNativePointer)

#endif

// REASON of having dispatchers here instead of convertors-smth.cpp: there must be only one definition
// of g_dispatcher variable for all of .so files. When variable is defined in different .so libraries
// it becomes impossible to invoke dispatcher all .so except of single one, that suddenly was linked to
// InteropNativeModule.
#if KOALA_USE_NODE_VM || KOALA_USE_HZ_VM
static napi_ref g_koalaNapiCallbackDispatcher = nullptr;

// Improve: shall we pass name in globalThis instead of object reference?
napi_value Node_SetCallbackDispatcher(napi_env env, napi_callback_info cbinfo)
{
    fprintf(stderr, "Node_SetCallbackDispatcher!\n");

    CallbackInfo info(env, cbinfo);
    napi_value dispatcher = info[0];
    napi_value result = makeVoid(env);
    napi_status status = napi_create_reference(env, dispatcher, 1, &g_koalaNapiCallbackDispatcher);
    KOALA_NAPI_THROW_IF_FAILED(env, status, result);

    return result;
}
MAKE_NODE_EXPORT(KOALA_INTEROP_MODULE, SetCallbackDispatcher)

napi_value Node_CleanCallbackDispatcher(napi_env env, napi_callback_info cbinfo)
{
    napi_value result = makeVoid(env);
    if (g_koalaNapiCallbackDispatcher) {
        napi_status status = napi_delete_reference(env, g_koalaNapiCallbackDispatcher);
        g_koalaNapiCallbackDispatcher = nullptr;
        KOALA_NAPI_THROW_IF_FAILED(env, status, result);
    }
    return result;
}
MAKE_NODE_EXPORT(KOALA_INTEROP_MODULE, CleanCallbackDispatcher)

napi_value getKoalaNapiCallbackDispatcher(napi_env env)
{
    if (!g_koalaNapiCallbackDispatcher) {
        abort();
    }
    napi_value value;
    napi_status status = napi_get_reference_value(env, g_koalaNapiCallbackDispatcher, &value);
    KOALA_NAPI_THROW_IF_FAILED(env, status, makeVoid(env));
    return value;
}
#elif KOALA_USE_JSC_VM
// pass
#elif KOALA_USE_JAVA_VM
#include "jni.h"
static struct {
    jobject dispatcher = nullptr;
    jclass clazz = nullptr;
    jmethodID method = nullptr;
} g_koalaJniCallbackDispatcher;

bool setKoalaJniCallbackDispatcher(
    JNIEnv* jniEnv, jclass clazz, const char* dispatcherMethodName, const char* dispatcherMethodSig)
{
    g_koalaJniCallbackDispatcher.clazz = clazz;
    g_koalaJniCallbackDispatcher.dispatcher = jniEnv->NewGlobalRef(clazz);
    jmethodID method = jniEnv->GetStaticMethodID(clazz, dispatcherMethodName, dispatcherMethodSig);
    if (method == nullptr) {
        return false;
    }
    g_koalaJniCallbackDispatcher.method = method;
    return true;
}

void clearCallbackDispathcer() {
    jniEnv->DeleteGlobalRef(g_koalaJniCallbackDispatcher.dispatcher);
    g_koalaJniCallbackDispatcher.dispatcher = nullptr;
}

void getKoalaJniCallbackDispatcher(jclass* clazz, jmethodID* method)
{
    *clazz = g_koalaJniCallbackDispatcher.clazz;
    *method = g_koalaJniCallbackDispatcher.method;
}
#elif KOALA_WASM
// pass
#elif KOALA_CJ
// pass
#elif KOALA_ANI
static struct {
    ani_class clazz = nullptr;
    ani_static_method method = nullptr;
} g_koalaANICallbackDispatcher;

bool setKoalaANICallbackDispatcher(
    ani_env* aniEnv, ani_class clazz, const char* dispatcherMethodName, const char* dispatcherMethodSig)
{
    g_koalaANICallbackDispatcher.clazz = clazz;
    CHECK_ANI_FATAL(aniEnv, aniEnv->Class_FindStaticMethod(
        clazz, dispatcherMethodName, dispatcherMethodSig, &g_koalaANICallbackDispatcher.method));
    if (g_koalaANICallbackDispatcher.method == nullptr) {
        return false;
    }
    return true;
}

void getKoalaANICallbackDispatcher(ani_class* clazz, ani_static_method* method)
{
    *clazz = g_koalaANICallbackDispatcher.clazz;
    *method = g_koalaANICallbackDispatcher.method;
}
#elif KOALA_LANG_KT
typedef KInt (*KoalaCallbackDispatcher_t)(KInt id, KInt length, KSerializerBuffer buffer);
static KoalaCallbackDispatcher_t g_koalaKotlinCallbackDispatcher = nullptr;

void callKoalaKotlinCallbackVoid(KInt id, KInt length, KSerializerBuffer buffer)
{
    g_koalaKotlinCallbackDispatcher(id, length, buffer);
}

KInt callKoalaKotlinCallbackInt(KInt id, KInt length, KSerializerBuffer buffer)
{
    return g_koalaKotlinCallbackDispatcher(id, length, buffer);
}

void impl_SetKoalaKotlinCallbackDispatcher(KNativePointer ptr)
{
    g_koalaKotlinCallbackDispatcher = reinterpret_cast<KoalaCallbackDispatcher_t>(ptr);
}
KOALA_INTEROP_V1(SetKoalaKotlinCallbackDispatcher, KNativePointer)
#else
#error "One of above branches must be taken"
#endif
