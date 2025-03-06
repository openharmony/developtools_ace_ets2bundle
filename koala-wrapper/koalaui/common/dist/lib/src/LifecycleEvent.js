"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LifecycleEvent = exports.LifecycleEventKind = void 0;
var LifecycleEventKind;
(function (LifecycleEventKind) {
    LifecycleEventKind[LifecycleEventKind["SHOW_FRAME"] = 0] = "SHOW_FRAME";
    LifecycleEventKind[LifecycleEventKind["HIDE_FRAME"] = 1] = "HIDE_FRAME";
    LifecycleEventKind[LifecycleEventKind["CLOSE_FRAME"] = 2] = "CLOSE_FRAME";
    LifecycleEventKind[LifecycleEventKind["ON_APPEAR"] = 3] = "ON_APPEAR";
    LifecycleEventKind[LifecycleEventKind["ON_DISAPPEAR"] = 4] = "ON_DISAPPEAR";
    LifecycleEventKind[LifecycleEventKind["SHOW_COMPONENT"] = 5] = "SHOW_COMPONENT";
    LifecycleEventKind[LifecycleEventKind["HIDE_COMPONENT"] = 6] = "HIDE_COMPONENT";
    LifecycleEventKind[LifecycleEventKind["BACK"] = 7] = "BACK";
    LifecycleEventKind[LifecycleEventKind["FOCUS_FRAME"] = 8] = "FOCUS_FRAME";
    LifecycleEventKind[LifecycleEventKind["UNFOCUS_FRAME"] = 9] = "UNFOCUS_FRAME";
})(LifecycleEventKind = exports.LifecycleEventKind || (exports.LifecycleEventKind = {}));
class LifecycleEvent {
    constructor(kind) {
        this.kind = kind;
    }
}
exports.LifecycleEvent = LifecycleEvent;
//# sourceMappingURL=LifecycleEvent.js.map