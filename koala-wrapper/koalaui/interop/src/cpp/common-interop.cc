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
#include <string>
#include <vector>
#include <map>

#ifdef KOALA_INTEROP_MODULE
#undef KOALA_INTEROP_MODULE
#endif

#define KOALA_INTEROP_MODULE InteropNativeModule
#include "common-interop.h"
#include "interop-logging.h"
#include "dynamic-loader.h"


#if KOALA_INTEROP_PROFILER
#include "profiler.h"

InteropProfiler* InteropProfiler::_instance = nullptr;

#endif

using std::string;

#ifdef KOALA_NAPI
// Callback dispatcher MOVED to convertors-napi.cc.
// Let's keep platform-specific parts of the code together

typedef void (*hold_t)(KInt);

KInteropBuffer impl_MaterializeBuffer(KNativePointer data, KLong length, KInt resourceId, KNativePointer holdPtr, KNativePointer releasePtr) {
    auto hold = reinterpret_cast<void(*)(KInt)>(holdPtr);
    auto release = reinterpret_cast<void(*)(KInt)>(releasePtr);
    hold(resourceId);
    return KInteropBuffer { length, data, resourceId, release };
}
KOALA_INTEROP_5(MaterializeBuffer, KInteropBuffer, KNativePointer, KLong, KInt, KNativePointer, KNativePointer)

KNativePointer impl_GetNativeBufferPointer(KInteropBuffer buffer) {
    return buffer.data;
}
KOALA_INTEROP_1(GetNativeBufferPointer, KNativePointer, KInteropBuffer)

#endif

#ifdef KOALA_ETS_NAPI
#include "etsapi.h"

static struct {
    ets_class clazz = nullptr;
    ets_method method = nullptr;
} g_koalaEtsNapiCallbackDispatcher;

bool setKoalaEtsNapiCallbackDispatcher(
    EtsEnv* etsEnv,
    ets_class clazz,
    const char* dispatcherMethodName,
    const char* dispactherMethodSig
) {
    g_koalaEtsNapiCallbackDispatcher.clazz = clazz;
    etsEnv->NewGlobalRef(clazz);
    ets_method method = etsEnv->GetStaticp_method(
        clazz, dispatcherMethodName, dispactherMethodSig
    );
    if (method == nullptr) {
        return false;
    }
    g_koalaEtsNapiCallbackDispatcher.method = method;
    return true;
}

void getKoalaEtsNapiCallbackDispatcher(ets_class* clazz, ets_method* method) {
    *clazz = g_koalaEtsNapiCallbackDispatcher.clazz;
    *method = g_koalaEtsNapiCallbackDispatcher.method;
}
#endif

#ifdef KOALA_JNI
#include "jni.h"
static struct {
    jclass clazz = nullptr;
    jmethodID method = nullptr;
} g_koalaJniCallbackDispatcher;

bool setKoalaJniCallbackDispatcher(
    JNIEnv* jniEnv,
    jclass clazz,
    const char* dispatcherMethodName,
    const char* dispactherMethodSig
) {
    g_koalaJniCallbackDispatcher.clazz = clazz;
    jniEnv->NewGlobalRef(clazz);
    jmethodID method = jniEnv->GetStaticMethodID(
        clazz, dispatcherMethodName, dispactherMethodSig
    );
    if (method == nullptr) {
        return false;
    }
    g_koalaJniCallbackDispatcher.method = method;
    return true;
}

void getKoalaJniCallbackDispatcher(jclass* clazz, jmethodID* method) {
    *clazz = g_koalaJniCallbackDispatcher.clazz;
    *method = g_koalaJniCallbackDispatcher.method;
}
#endif

KInt impl_StringLength(KNativePointer ptr) {
    string* s = reinterpret_cast<string*>(ptr);
    return s->length();
}
KOALA_INTEROP_1(StringLength, KInt, KNativePointer)

void impl_StringData(KNativePointer ptr, KByte* bytes, KUInt size) {
    string* s = reinterpret_cast<string*>(ptr);
    if (s) {
#ifdef __STDC_LIB_EXT1__
        errno_t res = memcpy_s(bytes, size, s->c_str(), size);
        if (res != EOK) {
            return;
        }
#else
        memcpy(bytes, s->c_str(), size);
#endif
    }
}
KOALA_INTEROP_V3(StringData, KNativePointer, KByte*, KUInt)


#ifdef KOALA_JNI
// For Java only yet.
KInteropBuffer impl_StringDataBytes(KVMContext vmContext, KNativePointer ptr) {
    string* s = reinterpret_cast<std::string*>(ptr);
    KInteropBuffer result = { (int32_t)s->length(), (void*)s->c_str()};
    return result;
}
KOALA_INTEROP_CTX_1(StringDataBytes, KInteropBuffer, KNativePointer)
#endif

KNativePointer impl_StringMake(const KStringPtr& str) {
    return new string(str.c_str());
}
KOALA_INTEROP_1(StringMake, KNativePointer, KStringPtr)

// For slow runtimes w/o fast encoders.
KInt impl_ManagedStringWrite(const KStringPtr& string, KByte* buffer, KInt offset) {
#ifdef __STDC_LIB_EXT1__
    errno_t res = memcpy_s(buffer + offset, string.length() + 1, string.c_str(), string.length() + 1);
    if (res != EOK) {
        return 0;
    }
#else
    memcpy(buffer + offset, string.c_str(), string.length() + 1);
#endif
    return string.length() + 1;
}
KOALA_INTEROP_3(ManagedStringWrite, KInt, KStringPtr, KByte*, KInt)

void stringFinalizer(string* ptr) {
    delete ptr;
}
KNativePointer impl_GetStringFinalizer() {
    return fnPtr<string>(stringFinalizer);
}
KOALA_INTEROP_0(GetStringFinalizer, KNativePointer)

void impl_InvokeFinalizer(KNativePointer obj, KNativePointer finalizer) {
    auto finalizer_f = reinterpret_cast<void (*)(KNativePointer)>(finalizer);
    finalizer_f(obj);
}
KOALA_INTEROP_V2(InvokeFinalizer, KNativePointer, KNativePointer)

KInt impl_GetPtrVectorSize(KNativePointer ptr) {
    return reinterpret_cast<std::vector<void*>*>(ptr)->size();
}
KOALA_INTEROP_1(GetPtrVectorSize, KInt, KNativePointer)

KNativePointer impl_GetPtrVectorElement(KNativePointer ptr, KInt index) {
    auto vector = reinterpret_cast<std::vector<void*>*>(ptr);
    auto element = vector->at(index);
    return nativePtr(element);
}
KOALA_INTEROP_2(GetPtrVectorElement, KNativePointer, KNativePointer, KInt)

inline KUInt unpackUInt(const KByte* bytes) {
    return (bytes[0] | (bytes[1] << 8) | (bytes[2] << 16) | (bytes[3] << 24));
}

std::vector<KStringPtr> makeStringVector(KStringArray strArray) {
    if (strArray == nullptr) {
        return std::vector<KStringPtr>(0);
    }
    KUInt arraySize = unpackUInt(strArray);
    std::vector<KStringPtr> res(arraySize);
    size_t offset = sizeof(KUInt);
    for (KUInt i = 0; i < arraySize; ++i) {
        int len = unpackUInt(strArray + offset);
        res[i].assign((const char*)(strArray + offset + sizeof(KUInt)), len);
        offset += len + sizeof(KUInt);
    }
    return res;
}

std::vector<KStringPtr> makeStringVector(KNativePointerArray arr, KInt length) {
    if (arr == nullptr) {
        return std::vector<KStringPtr>(0);
    } else {
        std::vector<KStringPtr> res(length);
        char** strings = reinterpret_cast<char**>(arr);
        for (KInt i = 0; i < length; ++i) {
            const char* str = reinterpret_cast<const char*>(strings[i]);
            res[i].assign(str);
        }
        return res;
    }
}

KNativePointer impl_GetGroupedLog(KInt index) {
    return new std::string(GetDefaultLogger()->getGroupedLog(index));
}
KOALA_INTEROP_1(GetGroupedLog, KNativePointer, KInt)

void impl_StartGroupedLog(KInt index) {
    GetDefaultLogger()->startGroupedLog(index);
}
KOALA_INTEROP_V1(StartGroupedLog, KInt)

void impl_StopGroupedLog(KInt index) {
    GetDefaultLogger()->stopGroupedLog(index);
}
KOALA_INTEROP_V1(StopGroupedLog, KInt)

void impl_AppendGroupedLog(KInt index, const KStringPtr& message) {
    if (GetDefaultLogger()->needGroupedLog(index))
        GetDefaultLogger()->appendGroupedLog(index, message.c_str());
}
KOALA_INTEROP_V2(AppendGroupedLog, KInt, KStringPtr)

void impl_PrintGroupedLog(KInt index) {
#ifdef KOALA_OHOS
    LOGI("%" LOG_PUBLIC "s", GetDefaultLogger()->getGroupedLog(index));
#else
    fprintf(stdout, "%s\n", GetDefaultLogger()->getGroupedLog(index));
    fflush(stdout);
#endif
}
KOALA_INTEROP_V1(PrintGroupedLog, KInt)

int32_t callCallback(KVMContext context, int32_t methodId, uint8_t* argsData, int32_t argsLength) {
#if KOALA_USE_NODE_VM || KOALA_USE_HZ_VM || KOALA_USE_PANDA_VM || KOALA_USE_JAVA_VM || KOALA_CJ
    KOALA_INTEROP_CALL_INT(context, methodId, argsLength, argsData);
#else
    return 0;
#endif
}

struct ForeignVMContext {
    KVMContext vmContext;
    int32_t (*callSync)(KVMContext vmContext, int32_t callback, uint8_t* data, int32_t length);
};
typedef KInt (*LoadVirtualMachine_t)(KInt vmKind, const char* classPath, const char* libraryPath, const struct ForeignVMContext* foreignVM);
typedef KNativePointer (*StartApplication_t)(const char* appUrl, const char* appParams);
typedef KBoolean (*RunApplication_t)(const KInt arg0, const KInt arg1);
typedef const char* (*EmitEvent_t)(const KInt type, const KInt target, const KInt arg0, const KInt arg1);
typedef void (*RestartWith_t)(const char* page);

void* getImpl(const char* path, const char* name) {
    static void* lib = nullptr;
    if (!lib && name) {
        auto name =
#ifndef KOALA_OHOS // dlopen on OHOS doesn't like paths
            std::string(path) + "/" +
#endif
            libName("vmloader");
        lib = loadLibrary(name);
        if (!lib) {
            fprintf(stderr, "Ensure vmloader library %s was built\n", name.c_str());
        }
    }
    return findSymbol(lib, name);
}

KInt impl_LoadVirtualMachine(KVMContext vmContext, KInt vmKind, const KStringPtr& classPath, const KStringPtr& libraryPath) {
    const char* envClassPath = std::getenv("PANDA_CLASS_PATH");
    if (envClassPath) {
        LOGI("CLASS PATH updated from env var PANDA_CLASS_PATH, %" LOG_PUBLIC "s", envClassPath);
    }
    const char* appClassPath = envClassPath ? envClassPath : classPath.c_str();
    const char* nativeLibPath = envClassPath ? envClassPath : libraryPath.c_str();

    static LoadVirtualMachine_t impl = nullptr;
    if (!impl) impl = reinterpret_cast<LoadVirtualMachine_t>(getImpl(nativeLibPath, "LoadVirtualMachine"));
    if (!impl) KOALA_INTEROP_THROW_STRING(vmContext, "Cannot load VM", -1);
    const ForeignVMContext foreignVM = {
        vmContext, &callCallback
    };
    return impl(vmKind, appClassPath, nativeLibPath, &foreignVM);
}
KOALA_INTEROP_CTX_3(LoadVirtualMachine, KInt, KInt, KStringPtr, KStringPtr)

KNativePointer impl_StartApplication(const KStringPtr& appUrl, const KStringPtr& appParams) {
    static StartApplication_t impl = nullptr;
    if (!impl) impl = reinterpret_cast<StartApplication_t>(getImpl(nullptr, "StartApplication"));
    return impl(appUrl.c_str(), appParams.c_str());
}
KOALA_INTEROP_2(StartApplication, KNativePointer, KStringPtr, KStringPtr)

KBoolean impl_RunApplication(const KInt arg0, const KInt arg1) {
    static RunApplication_t impl = nullptr;
    if (!impl) impl = reinterpret_cast<RunApplication_t>(getImpl(nullptr, "RunApplication"));
    return impl(arg0, arg1);
}
KOALA_INTEROP_2(RunApplication, KBoolean, KInt, KInt)

KStringPtr impl_EmitEvent(KVMContext vmContext, KInt type, KInt target, KInt arg0, KInt arg1) {
    static EmitEvent_t impl = nullptr;
    if (!impl) impl = reinterpret_cast<EmitEvent_t>(getImpl(nullptr, "EmitEvent"));
    const char* out = impl(type, target, arg0, arg1);
    auto size = std::string(out).size();
    KStringPtr result(out, size, true);
    return result;
}
KOALA_INTEROP_CTX_4(EmitEvent, KStringPtr, KInt, KInt, KInt, KInt)

void impl_RestartWith(const KStringPtr& page) {
    static RestartWith_t impl = nullptr;
    if (!impl) impl = reinterpret_cast<RestartWith_t>(getImpl(nullptr, "RestartWith"));
    impl(page.c_str());
}
KOALA_INTEROP_V1(RestartWith, KStringPtr)

static Callback_Caller_t g_callbackCaller = nullptr;
void setCallbackCaller(Callback_Caller_t callbackCaller) {
    g_callbackCaller = callbackCaller;
}

void impl_CallCallback(KInt callbackKind, KByte* args, KInt argsSize) {
    if (g_callbackCaller) {
        g_callbackCaller(callbackKind, args, argsSize);
    }
}
KOALA_INTEROP_V3(CallCallback, KInt, KByte*, KInt)

static Callback_Caller_Sync_t g_callbackCallerSync = nullptr;
void setCallbackCallerSync(Callback_Caller_Sync_t callbackCallerSync) {
    g_callbackCallerSync = callbackCallerSync;
}

void impl_CallCallbackSync(KVMContext vmContext, KInt callbackKind, KByte* args, KInt argsSize) {
    if (g_callbackCallerSync) {
        g_callbackCallerSync(vmContext, callbackKind, args, argsSize);
    }
}
KOALA_INTEROP_CTX_V3(CallCallbackSync, KInt, KByte*, KInt)

void impl_CallCallbackResourceHolder(KNativePointer holder, KInt resourceId) {
    reinterpret_cast<void(*)(KInt)>(holder)(resourceId);
}
KOALA_INTEROP_V2(CallCallbackResourceHolder, KNativePointer, KInt)

void impl_CallCallbackResourceReleaser(KNativePointer releaser, KInt resourceId) {
    reinterpret_cast<void(*)(KInt)>(releaser)(resourceId);
}
KOALA_INTEROP_V2(CallCallbackResourceReleaser, KNativePointer, KInt)

KInt impl_CallForeignVM(KNativePointer foreignContextRaw, KInt function, KByte* data, KInt length) {
    const ForeignVMContext* foreignContext = (const ForeignVMContext*)foreignContextRaw;
    // TODO: set actuall callbacks caller/holder/releaser.
    /*
    *(int64_t*)(data + 8) = impl_CallCallbackSync;
    *(int64_t*)(data + 16) = 0;
    *(int64_t*)(data + 24) = 0; */
    return foreignContext->callSync(foreignContext->vmContext, function, data, length);
}
KOALA_INTEROP_4(CallForeignVM, KInt, KNativePointer, KInt, KByte*, KInt)


#define QUOTE(x) #x

void impl_NativeLog(const KStringPtr& str) {
#ifdef KOALA_OHOS
    LOGI("%{public}s: %{public}s", QUOTE(INTEROP_LIBRARY_NAME), str.c_str());
#else
    fprintf(stdout, "%s: %s\n", QUOTE(INTEROP_LIBRARY_NAME), str.c_str());
    fflush(stdout);
#endif
}
KOALA_INTEROP_V1(NativeLog, KStringPtr)



void resolveDeferred(KVMDeferred* deferred, uint8_t* argsData, int32_t argsLength) {
#ifdef KOALA_NAPI
    auto status = napi_call_threadsafe_function((napi_threadsafe_function)deferred->handler, deferred, napi_tsfn_nonblocking);
    if (status != napi_ok) LOGE("cannot call thread-safe function; status=%d", status);
    napi_release_threadsafe_function((napi_threadsafe_function)deferred->handler, napi_tsfn_release);
#endif
}

void rejectDeferred(KVMDeferred* deferred, const char* message) {
#ifdef KOALA_NAPI
    napi_release_threadsafe_function((napi_threadsafe_function)deferred->handler, napi_tsfn_release);
    delete deferred;
#endif
}

#ifdef KOALA_NAPI
void resolveDeferredImpl(napi_env env, napi_value js_callback, KVMDeferred* deferred, void* data) {
    napi_value undefined = nullptr;
    napi_get_undefined(env, &undefined);
    auto status = napi_resolve_deferred(env, (napi_deferred)deferred->context, undefined);
    if (status != napi_ok) LOGE("cannot resolve deferred; status=%d", status);
    delete deferred;
}
#endif

KVMDeferred* CreateDeferred(KVMContext vmContext, KVMObjectHandle* promiseHandle) {
    KVMDeferred* deferred = new KVMDeferred();
    deferred->resolve = resolveDeferred;
    deferred->reject = rejectDeferred;
#ifdef KOALA_NAPI
    // TODO: move to interop!
    napi_env env = (napi_env)vmContext;
    napi_value promise;
    napi_value resourceName;
    napi_create_string_utf8(env, "Async", 5, &resourceName);
    auto status = napi_create_promise(env, (napi_deferred*)&deferred->context, &promise);
    if (status != napi_ok) LOGE("cannot make a promise; status=%d", status);
    status = napi_create_threadsafe_function(env,
        nullptr,
        nullptr,
        resourceName,
        0,
        1,
        nullptr,
        nullptr,
        deferred,
        (napi_threadsafe_function_call_js)resolveDeferredImpl,
        (napi_threadsafe_function*)&deferred->handler);
    if (status != napi_ok) LOGE("cannot make threadsafe function; status=%d", status);
    *promiseHandle = (KVMObjectHandle)promise;
#endif
    return deferred;
}

#if defined(KOALA_ETS_NAPI) || defined(KOALA_NAPI) || defined(KOALA_JNI) || defined(KOALA_CJ)
// Allocate, so CTX versions.
KStringPtr impl_Utf8ToString(KVMContext vmContext, KByte* data, KInt offset, KInt length) {
    KStringPtr result((const char*)(data + offset), length, false);
    return result;
}
KOALA_INTEROP_CTX_3(Utf8ToString, KStringPtr, KByte*, KInt, KInt)

KStringPtr impl_StdStringToString(KVMContext vmContext, KNativePointer stringPtr) {
    std::string* string = reinterpret_cast<std::string*>(stringPtr);
    KStringPtr result(string->c_str(), string->size(), false);
    return result;
}
KOALA_INTEROP_CTX_1(StdStringToString, KStringPtr, KNativePointer)
#endif

#if defined(KOALA_JNI) || defined(KOALA_NAPI) || defined(KOALA_CJ)
KInteropReturnBuffer impl_RawReturnData(KVMContext vmContext, KInt v1, KInt v2) {
    void* data = new int8_t[v1];
#ifdef __STDC_LIB_EXT1__
    errno_t res = memset_s(data, v1, v2, v1);
    if (res != EOK) {
        LOGE("RawReturnData failed");
    }
#else
    memset(data, v2, v1);
#endif
    KInteropReturnBuffer buffer = { v1, data, [](KNativePointer ptr, KInt) { delete[] (int8_t*)ptr; }};
    return buffer;
}
KOALA_INTEROP_CTX_2(RawReturnData, KInteropReturnBuffer, KInt, KInt)
#endif
