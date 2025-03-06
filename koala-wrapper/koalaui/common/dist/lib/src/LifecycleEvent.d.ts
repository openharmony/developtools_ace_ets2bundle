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

export declare enum LifecycleEventKind {
    SHOW_FRAME = 0,
    HIDE_FRAME = 1,
    CLOSE_FRAME = 2,
    ON_APPEAR = 3,
    ON_DISAPPEAR = 4,
    SHOW_COMPONENT = 5,
    HIDE_COMPONENT = 6,
    BACK = 7,
    FOCUS_FRAME = 8,
    UNFOCUS_FRAME = 9
}
export declare class LifecycleEvent {
    kind: LifecycleEventKind;
    constructor(kind: LifecycleEventKind);
}
//# sourceMappingURL=LifecycleEvent.d.ts.map