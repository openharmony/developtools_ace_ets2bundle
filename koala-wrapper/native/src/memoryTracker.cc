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

#include "memoryTracker.h"

#include <cstdint>
#include <fstream>
#include <iostream>
#include <sstream>
#include <system_error>
#include <vector>
#include <regex>

#ifdef _WIN32
    #include <windows.h>
    #include <psapi.h>
#elif defined(__APPLE__)
    #include <mach/mach.h>
    #include <sys/resource.h>
#elif defined(__linux__)
    #include <sys/resource.h>
    #include <unistd.h>
#endif

constexpr const char* UNIT_K = "kB";
constexpr size_t BYTES_PER_KB = 1024;
constexpr const char* MEMORY_STATUS_FILE = "/proc/self/status";
const std::regex VM_RSS_REGEX(R"#(VmRSS:\s*(\d+)\s*([kKmMgG]?B))#",
    std::regex_constants::ECMAScript | std::regex_constants::icase);
const std::regex VM_SIZE_REGEX(R"#(VmSize:\s*(\d+)\s*([kKmMgG]?B))#",
    std::regex_constants::ECMAScript | std::regex_constants::icase);

constexpr int MATCH_GROUP_VALUE = 1;
constexpr int MATCH_GROUP_UNIT = 2;
constexpr int MATCH_GROUP_SIZE = 3;

#if defined(_WIN32)
MemoryStats GetMemoryStats()
{
    MemoryStats stats = {0, 0, 0, 0, 0};
    PROCESS_MEMORY_COUNTERS_EX pmc;
    if (GetProcessMemoryInfo(GetCurrentProcess(),
        reinterpret_cast<PROCESS_MEMORY_COUNTERS*>(&pmc), sizeof(pmc))) {
        stats.currentRss = pmc.WorkingSetSize;
        stats.peakRss = pmc.PeakWorkingSetSize;
        stats.currentVss = pmc.PrivateUsage; // 私有内存使用量
        stats.pageFaultsMinor = pmc.PageFaultCount;
        // Windows API不直接提供主缺页错误计数
        stats.pageFaultsMajor = 0;
    }
    return stats;
}

#elif defined(__APPLE__)
MemoryStats GetMemoryStats()
{
    MemoryStats stats = {0, 0, 0, 0, 0};
    struct rusage ru;
    if (getrusage(RUSAGE_SELF, &ru) == 0) {
        stats.currentRss = 0; // macOS需要专用API获取当前内存
        stats.peakRss = ru.ru_maxrss; // macOS返回字节
        stats.pageFaultsMinor = ru.ru_minflt;
        stats.pageFaultsMajor = ru.ru_majflt;

        // 获取当前内存使用 (macOS专用API)
        task_basic_info info;
        mach_msg_type_number_t count = TASK_BASIC_INFO_64_COUNT;
        if (task_info(mach_task_self(), TASK_BASIC_INFO_64,
            (task_info_t)&info, &count) == KERN_SUCCESS) {
            stats.currentRss = info.resident_size; // 物理内存使用量
            stats.currentVss = info.virtual_size;  // 虚拟内存总量
        }
    }
    return stats;
}

#elif defined(__linux__)
MemoryStats GetMemoryStats()
{
    MemoryStats stats = {0, 0, 0, 0, 0};
    struct rusage ru;
    if (getrusage(RUSAGE_SELF, &ru) == 0) {
        stats.peakRss = static_cast<size_t>(ru.ru_maxrss) * BYTES_PER_KB; // KB -> 字节
        stats.pageFaultsMinor = ru.ru_minflt;
        stats.pageFaultsMajor = ru.ru_majflt;
    }
    std::ifstream statusFile(MEMORY_STATUS_FILE);
    if (!statusFile) {
        return stats;
    }
    std::string line;
    std::smatch matches;
    while (std::getline(statusFile, line)) {
        if (std::regex_match(line, matches, VM_RSS_REGEX) && matches.size() >= MATCH_GROUP_SIZE) {
            stats.currentRss = std::stoull(matches[MATCH_GROUP_VALUE].str());
            std::string unit = matches[MATCH_GROUP_UNIT].str();
            if (unit == UNIT_K) {
                stats.currentRss *= BYTES_PER_KB;
            }
        } else if (std::regex_match(line, matches, VM_SIZE_REGEX) && matches.size() >= MATCH_GROUP_SIZE) {
            stats.currentVss = std::stoull(matches[MATCH_GROUP_VALUE].str());
            std::string unit = matches[MATCH_GROUP_UNIT].str();
            if (unit == UNIT_K) {
                stats.currentVss *= BYTES_PER_KB;
            }
        }
    }
    return stats;
}
#endif

void MemoryTracker::Reset()
{
    baseline = GetMemoryStats();
}

MemoryStats MemoryTracker::GetDelta()
{
    MemoryStats current = GetMemoryStats();
    MemoryStats delta = {
        current.currentRss - baseline.currentRss,
        current.peakRss - baseline.peakRss,
        current.currentVss - baseline.currentVss,
        current.pageFaultsMinor - baseline.pageFaultsMinor,
        current.pageFaultsMajor - baseline.pageFaultsMajor
    };
    return delta;
}

template<typename Func>
MemoryStats MemoryTracker::MeasureMemory(Func&& func)
{
    Reset();
    auto preStats = GetMemoryStats();
    func();
    auto postStats = GetMemoryStats();

    return {
        postStats.currentRss - preStats.currentRss,
        postStats.peakRss - preStats.peakRss,
        postStats.currentVss - preStats.currentVss,
        postStats.pageFaultsMinor - preStats.pageFaultsMinor,
        postStats.pageFaultsMajor - preStats.pageFaultsMajor
    };
}

void MemoryTracker::Report(MemoryStats stats)
{
    auto formatBytes = [](size_t bytes) -> std::string {
        const double kb = BYTES_PER_KB;
        const double mb = kb * BYTES_PER_KB;
        const double gb = mb * BYTES_PER_KB;

        if (bytes > gb) return std::to_string(bytes / gb) + " GB";
        if (bytes > mb) return std::to_string(bytes / mb) + " MB";
        if (bytes > kb) return std::to_string(bytes / kb) + " KB";
        return std::to_string(bytes) + " B";
    };

    std::cout << "Current RSS: " << formatBytes(stats.currentRss) << "\n" << std::endl;
    std::cout << "Peak RSS   : " << formatBytes(stats.peakRss) << "\n" << std::endl;
    std::cout << "VSS        : " << formatBytes(stats.currentVss) << "\n" << std::endl;
    std::cout << "FaultsMinor: " << stats.pageFaultsMinor << "\n" << std::endl;
    std::cout << "FaultsMajor: " << stats.pageFaultsMajor << "\n" << std::endl;
    return;
}