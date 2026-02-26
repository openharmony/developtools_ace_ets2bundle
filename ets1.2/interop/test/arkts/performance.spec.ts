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
import { DeserializerBase, ResourceHolder, SerializerBase } from "@koalaui/interop"

const TEST_PERF_ITERATIONS = 1000
const TEST_PERF_CYCLES = 100
function testPerf() {
    const results: Double[] = []
    for (let i = 0; i < TEST_PERF_ITERATIONS; ++i) {
        const cycleStart = Chrono.nanoNow().toDouble()
        for (let cycle = 0; cycle < TEST_PERF_CYCLES; ++cycle) {
            const encoder = SerializerBase.hold()
            for (let c = 0; c < 10; ++c) {
                encoder.writeInt32(c * 42)
            }
            encoder.writeString("HELLO")
            encoder.holdAndWriteCallback(() => {})

            const decoder = new DeserializerBase(encoder.asBuffer(), encoder.length())
            for (let c = 0; c < 10; ++c) {
                decoder.readInt32()
            }
            decoder.readString()
            /* callback */
            decoder.readInt32()
            decoder.readPointer()
            decoder.readPointer()
            decoder.readPointer()
            decoder.readPointer()

            encoder.release()
        }
        const cycleEnd = Chrono.nanoNow().toDouble()
        const dt = (cycleEnd - cycleStart) / 1_000_000 / TEST_PERF_CYCLES
        results.push(dt)
    }

    let avg: Double = 0
    let max: Double = 0
    let min: Double = 0
    for (const result of results) {
        avg += result / TEST_PERF_ITERATIONS
        max = Math.max(max, result)
        min = Math.min(min, result)
    }

    console.log('>> PERF', '\nAVG:', `${avg.toFixed(6)}ms`, '\nMAX:', `${max.toFixed(6)}ms`, '\nMIN:', `${min.toFixed(6)}ms`)
}

export function main() {
    testPerf()
}
