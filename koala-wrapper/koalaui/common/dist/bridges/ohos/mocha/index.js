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
exports.startTests = void 0;
const hypium_1 = require("@ohos/hypium");
globalThis.__OpenHarmony = true;
const suiteMap = new Map();
suite = (title, fn) => {
    suiteMap.set(title, fn);
};
suiteSetup = (title, fn) => {
    (0, hypium_1.beforeEach)(fn);
};
test = ((title, fn) => {
    (0, hypium_1.it)(fn ? title : `[SKIP] ${title}`, hypium_1.Size.MEDIUMTEST, fn ? fn : () => { });
});
test.skip = (title, fn) => {
    (0, hypium_1.it)(`[SKIP] ${title}`, hypium_1.Size.MEDIUMTEST, () => { });
};
performance = {
    now: () => {
        return Date.now();
    }
};
function startTests(generateGolden = false) {
    globalThis.__generateGolden = generateGolden;
    suiteMap.forEach((fn, title) => {
        (0, hypium_1.describe)(title, function () {
            fn();
        });
    });
}
exports.startTests = startTests;
//# sourceMappingURL=index.js.map