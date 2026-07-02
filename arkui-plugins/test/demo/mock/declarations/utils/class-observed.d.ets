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

@Observed
declare class ExportObserved {
    t1: number;
}

@Observed
declare class ExportObservedImpl implements IO {
    t1: number;
}

@Observed
declare class ExportObservedWithTrack {
    t1: number;
    @Track t2: number;
}

declare class ExportTrackWithoutObserved {
    @Track t1: number;
}

@Observed
declare class NonExportObserved {
    t1: number;
}

@Observed
declare class NonExportObservedImpl implements IO {
    t1: number;
}

@Observed
declare class NonExportObservedWithTrack {
    t1: number;
    @Track t2: number;
}

declare class NonExportTrackWithoutObserved {
    @Track t1: number;
}

@Observed
class ObservedWithBody {
    t1: number = 1;
}

@Observed
class ObservedImplWithBody implements IO {
    t1: number = 1;
}

@Observed
class ObservedWithTrackWithBody {
    t1: number = 1;
    @Track t2: number = 2;
}

class TrackWithoutObservedWithBody {
    @Track t1: number = 1;
}

@Observed
class ExportObservedWithBody {
    t1: number;
}

@Observed
class ExportObservedImplWithBody implements IO {
    t1: number;
}

@Observed
class ExportObservedWithTrackWithBody {
    t1: number;
    @Track t2: number;
}

class ExportTrackWithoutObservedWithBody {
    @Track t1: number;
}

export { 
    IO, 
    ExportObserved, 
    ExportObservedImpl, 
    ExportObservedWithTrack, 
    ExportTrackWithoutObserved,
    ExportObservedWithBody,
    ExportObservedImplWithBody,
    ExportObservedWithTrackWithBody,
    ExportTrackWithoutObservedWithBody
};
