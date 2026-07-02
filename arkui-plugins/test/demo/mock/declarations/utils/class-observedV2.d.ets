/*
 * Copyright (C) 2026 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Observed, ObservedV2, Track, Trace, Monitor, Computed } from "@ohos.arkui.stateManagement";

interface IO {
    t1: number;
}

@ObservedV2
declare class ExportObservedV2 {
    @Trace t1: number;
    
    @Computed
    get computed(): number;
    
    @Monitor(['t1'])
    onT1Changed(): void;   
}

@ObservedV2
declare class ExportObservedV2Inherit implements IO {
    @Trace t1: number;
}

@ObservedV2
declare class NonExportObservedV2 {
    @Trace t1: number;
    
    @Computed
    get computed(): number;
    
    @Monitor(['t1'])
    onT1Changed(): void;   
}

@ObservedV2
declare class NonExportObservedV2Inherit implements IO {
    @Trace t1: number;
}

@ObservedV2
class ObservedV2WithBody {
    @Trace t1: number = 1;

    @Computed
    get computed(): number {
        return this.t1;
    }

    @Monitor(['t1'])
    onT1Changed(): void {

    }

    constructor(t1: number) {
        this.t1 = t1;
    }
}

@ObservedV2
class ObservedV2InheritWithBody implements IO {
    @Trace t1: number = 1;
    t2: number = 2;

    constructor(t2: number) {
        this.t2 = t2;
    }
}


@ObservedV2
class ExportObservedV2InheritWithBody implements IO {
    @Trace t1: number;
    t2: number;

    constructor(t2: number) {
        this.t2 = t2;
    }
}

@ObservedV2
class ExportObservedV2WithBody {
    @Trace t1: number;

    @Computed
    get computed(): number {
        return this.t1;
    }

    @Monitor(['t1'])
    onT1Changed(): void {

    }

    constructor(t1: number) {
        this.t1 = t1;
    }
}

export {
    IO,
    ExportObservedV2,
    ExportObservedV2Inherit,
    ExportObservedV2WithBody,
    ExportObservedV2InheritWithBody
};