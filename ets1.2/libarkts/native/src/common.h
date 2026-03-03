/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
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

#ifndef COMMON_H
#define COMMON_H

#include <iostream>
#include <string>
#include <vector>

#include "common-interop.h"
#include "dynamic-loader.h"
#include "es2panda_lib.h"
#include "interop-utils.h"
#include "stdexcept"

using std::string, std::cout, std::endl, std::vector;

extern es2panda_Impl* es2pandaImplementation;

es2panda_Impl* GetImplSlow();
inline es2panda_Impl* GetImpl()
{
    if (es2pandaImplementation) {
        return es2pandaImplementation;
    }
    return GetImplSlow();
}

string getString(KStringPtr ptr);
const char** getStringArray(KStringArray& ptr);

char* getStringCopy(KStringPtr& ptr);

inline KUInt unpackUInt(const KByte* bytes)
{
    const KUInt BYTE_0 = 0;
    const KUInt BYTE_1 = 1;
    const KUInt BYTE_2 = 2;
    const KUInt BYTE_3 = 3;

    const KUInt BYTE_1_SHIFT = 8;
    const KUInt BYTE_2_SHIFT = 16;
    const KUInt BYTE_3_SHIFT = 24;
    return (bytes[BYTE_0] | (bytes[BYTE_1] << BYTE_1_SHIFT) | (bytes[BYTE_2] << BYTE_2_SHIFT) |
            (bytes[BYTE_3] << BYTE_3_SHIFT));
}

es2panda_ContextState intToState(KInt state);

class StageArena {
    std::vector<void*> allocated;
    size_t totalSize;

public:
    StageArena();
    ~StageArena();
    static StageArena* Instance();
    template<typename T>
    static T* Alloc()
    {
        auto* arena = StageArena::Instance();
        void* memory = arena->Alloc(sizeof(T));
        return new (memory) T();
    }
    template<class T, class T1>
    static T* Alloc(T1 arg1)
    {
        auto* arena = StageArena::Instance();
        void* memory = arena->Alloc(sizeof(T));
        return new (memory) T(std::forward(arg1));
    }
    template<class T, class T1, class T2>
    static T* Alloc(T1 arg1, T2 arg2)
    {
        auto* arena = StageArena::Instance();
        void* memory = arena->Alloc(sizeof(T));
        return new (memory) T(arg1, arg2);
    }
    template<typename T>
    static T* AllocArray(size_t count)
    {
        auto* arena = StageArena::Instance();
        // align?
        void* memory = arena->Alloc(sizeof(T) * count);
        return new (memory) T();
    }
    template<class T>
    static T* Clone(const T& arg)
    {
        auto* arena = StageArena::Instance();
        void* memory = arena->Alloc(sizeof(T));
        return new (memory) T(arg);
    }
    template<class T>
    static std::vector<const void*>* CloneVector(const T* arg, size_t count)
    {
        return Alloc<std::vector<const void*>, const T*, const T*>(arg, arg + count);
    }
    void* Alloc(size_t size);
    static char* Strdup(const char* original);
    void Add(void* pointer);
    void Cleanup();
};

#endif // COMMON_H
