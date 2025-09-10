/**
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

#ifndef KOALA_MEMORY_TRACKER
#define KOALA_MEMORY_TRACKER

#include <cstddef>
#include <string>

// 内存统计结构体
struct MemoryStats {
    size_t currentRss = 0;      // 当前驻留集大小 (字节)
    size_t peakRss = 0;         // 峰值驻留集大小 (字节)
    size_t currentVss = 0;      // 当前虚拟内存大小 (字节)
    size_t pageFaultsMinor = 0; // 小页错误次数
    size_t pageFaultsMajor = 0; // 大页错误次数
};

class MemoryTracker {
public:
    MemoryTracker()
    {
        Reset();
    }

    void Reset();
    MemoryStats GetDelta();

    template<typename Func>
    MemoryStats MeasureMemory(Func&& func);

    void Report(MemoryStats stats);

private:
    MemoryStats baseline;
};

MemoryStats GetMemoryStats();

#endif
