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

import { float32 } from "@koalaui/compat";
export declare class Point3 {
    x: float32;
    y: float32;
    z: float32;
    constructor(x: float32, y: float32, z: float32);
    subtract(value: Point3): Point3;
    cross(value: Point3): Point3;
    normalize(): Point3;
}
//# sourceMappingURL=Point3.d.ts.map