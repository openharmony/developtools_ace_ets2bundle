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

/* taken from stdlib */
export function launchJob(f: Function, ...args: FixedArray<Any>): Promise<Any> {
    let resolver: (((v: Any | PromiseLike<Any>) => void) | undefined) = undefined;
    let rejecter: (((error: Error) => void) | undefined) = undefined;
    let p = new Promise<Any>((res, rej) => {
        resolver = res
        rejecter = rej;
    })
    let cb = () => {
        try {
            let v = f.unsafeCall(...args)
            resolver!(v)
        } catch (e) {
            // NOTE(csaba.osztrogonac): remove as cast once e has Error type
            rejecter!(e as Error)
        }
    }
    launch<void, () => void>(cb)
    return p;
}

const traceLock = new Mutex()
export function trace<T>(msg:string, mbVal?:T): T | undefined {
    traceLock.lockGuard(() => console.log(msg))
    return mbVal ?? undefined
}

export class AssertError extends Error {
    constructor(message:string) {
        super(message)
    }
}

export function assert(message:string, condition:boolean) {
    if (!condition) {
        throw new AssertError(message)
    }
}

export async function wait(ms:Int): Promise<void> {
    return new Promise<void>((resolve, _) => {
        setTimeout(() => {
            resolve(undefined)
        }, ms)
    })
}

export async function launchRepeat(times:number, op:() => Promise<Any>) {
    await wait(500)
    for (let i = 0 ; i < times; ++i) {
        try {
            await op()
        } catch (ex) {
            trace(ex.toString())
        }
    }
}

export function spawnMany(count:Int, task: () => void) {
    let i = 0;
    let iLock = new Mutex()
    let resolve: (x:undefined) => void = () => {}
    const p = new Promise<Any>((r) => {
        resolve = r
    })
    const inc = () => {
        iLock.lock()
        ++i
        if (count === i) {
            iLock.unlock()
            resolve(undefined)
            return
        }
        iLock.unlock()
    }
    for (let i = 0; i < count; ++i) {
        launchJob(() => { task() }).finally(() => inc())
    }
    return p
}
