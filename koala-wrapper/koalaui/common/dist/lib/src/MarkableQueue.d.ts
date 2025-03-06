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

export interface MarkableQueue {
    /** Sets the new marker to the queue. */
    setMarker(): void;
    /** Adds the given callback to the queue. */
    addCallback(callback: () => void): void;
    /** Calls all accumulated callbacks to the latest set marker. */
    callCallbacks(): void;
    /** Clears the queue. */
    clear(): void;
}
/**
 * Creates a new markable queue to safely process callbacks across several threads or tasks.
 * @param reversed - `true` changes the order of calling callbacks
 */
export declare function markableQueue(reversed?: boolean): MarkableQueue;
//# sourceMappingURL=MarkableQueue.d.ts.map