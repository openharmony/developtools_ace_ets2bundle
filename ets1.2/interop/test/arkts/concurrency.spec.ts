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
import { launchJob, assert, launchRepeat, spawnMany } from "./utils"

///

function readWrite() {
    const encoder = SerializerBase.hold()
    try {
        for (let i = 0; i < 100; ++i) {
            encoder.writeInt32(i)
        }
        const decoder = new DeserializerBase(encoder.asBuffer(), encoder.length())
        for (let i = 0; i < 100; ++i) {
            const item = decoder.readInt32()
            assert("Elements are not equal", item === i)
        }
    } catch (ex) {
        throw ex
    } finally {
        encoder.release()
    }
}

function testSerialize() {
    console.log('test serialize')
    return launchJob(async () => {
        await launchRepeat(1000, () => {
            return launchJob(() => {
                return spawnMany(4, readWrite)
            })
        })
    })
}

///

interface SerializedDataBox {
    buffer: FixedArray<byte>
    length: int
}

function testCallbacks() {
    console.log('test callbacks')

    return launchRepeat(1000, () => {
        return launchJob(async () => {
            let online = true
            const queueMutex = new Mutex()
            const queue: SerializedDataBox[] = []
            const enqueue = (box: SerializedDataBox) => {
                queueMutex.lockGuard(() => {
                    queue.push(box)
                })
            }
            const dequeue = (): SerializedDataBox | undefined => {
                let r: SerializedDataBox | undefined = undefined
                queueMutex.lockGuard(() => {
                    r = queue.pop()
                })
                return r
            }

            const listener = launchJob(() => {
                while (true) {
                    const item = dequeue()
                    if (item === undefined && !online) {
                        return
                    }
                    if (item === undefined) {
                        continue
                    }
                    const decoder = new DeserializerBase(item.buffer, item.length)
                    const resourceId = decoder.readInt32()
                    const func = (ResourceHolder.instance().get(resourceId) as ((x: Int) => void))
                    func(10)
                }
            })
            const producer = launchJob(() => {
                const funcs: ((x: Int) => void)[] = [
                    (x:Int) => { x = x * 2; },
                    (x:Int) => { x = x + 2; },
                    (x:Int) => { x = x - 2; },
                    (x:Int) => { x = x / 2; },
                ]
                for (const fun of funcs) {
                    const s = SerializerBase.hold()
                    s.holdAndWriteCallback(fun)
                    enqueue({
                        buffer: s.toArray(),
                        length: s.length(),
                    })
                    s.release()
                }
                online = false
            })

            await producer
            await listener
        })
    })
}

///

async function tests() {
    await testSerialize()
    await testCallbacks()
}

export function main() {
    tests()
}
