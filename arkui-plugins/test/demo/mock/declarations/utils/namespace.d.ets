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

import { 
    CustomDialog, 
    Component, 
    ComponentV2, 
    Entry, 
    BuilderParam, 
    Column, 
    CustomDialogController, 
    Resource, 
    WrappedBuilder, 
    Builder, 
    $r, 
    $rawfile, 
    Resource, 
    AnimatableExtend, 
    TextAttribute 
} from "@ohos.arkui.component";
import { 
    Observed, 
    ObservedV2, 
    Track, 
    Trace, 
    Monitor, 
    Computed, 
    State, 
    Link, 
    Local, 
    Param, 
    Require
} from "@ohos.arkui.stateManagement";

declare namespace aNamespace {
    // class-observed
    interface IO {
        t1: number;
    }

    @Observed
    class ExportObserved {
        t1: number;
    }

    @Observed
    class ExportObservedImpl implements IO {
        t1: number;
    }

    @Observed
    class ExportObservedWithTrack {
        t1: number;
        @Track t2: number;
    }

    class ExportTrackWithoutObserved {
        @Track t1: number;
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

    // class-observedV2
    @ObservedV2
    class ExportObservedV2 {
        @Trace t1: number;
        
        @Computed
        get computed(): number;
        
        @Monitor(['t1'])
        onT1Changed(): void;   
    }

    @ObservedV2
    class ExportObservedV2Inherit implements IO {
        @Trace t1: number;
    }

    @ObservedV2
    class ExportObservedV2InheritWithBody implements IO {
        @Trace t1: number;
        t2: number;

        constructor(t2: number)
    }

    @ObservedV2
    class ExportObservedV2WithBody {
        @Trace t1: number;

        @Computed
        get computed(): number;

        @Monitor(['t1'])
        onT1Changed(): void;

        constructor(t1: number)
    }

    // constant
    const EXPORT_RESOURCE: Resource;

    const EXPORT_RAWFILE: Resource;

    const EXPORT_WRAPPED_BUILDER: WrappedBuilder<@Builder (value: string, size: number) => void>;

    // struct-dialog
    @CustomDialog
    struct ExportCustomDialog {
        @Link someLink: number;
        controller?: CustomDialogController;

        @Builder
        build(): void;
    }

    @CustomDialog
    struct ExportCustomDialogWithBody {
        @State someState: number;
        controller: CustomDialogController | null;

        @Builder
        build(): void;
    }

    // struct-entry
    @Entry
    @Component
    struct ExportEntryStruct {
        @Builder
        build(): void;
    }

    // struct-v1
    @Component
    struct ExportStructV1 {
        @State someState: number;

        @BuilderParam someBuilderParam: () => void;

        @Builder
        build(): void;
    }

    @Component
    struct ExportStructV1WithBody {
        @State someState: number;
        @Link someLink: number;

        @BuilderParam someBuilderParam: () => void;

        @Builder
        build(): void;
    }

    // struct-v2
    @ComponentV2
    struct ExportStructV2 {
        @Local someLocal: number;

        @BuilderParam someBuilderParam: () => void;

        @Computed
        get someComputed(): number;

        @Monitor(['someLocal'])
        onSomeLocalChanged(): void;

        @Builder
        build(): void;
    }

    @ComponentV2
    struct ExportStructV2WithBody {
        @Local someLocal: number;
        @Param someParam: number;
        @Require @Param someRequiredParam: number;

        @BuilderParam someBuilderParam: () => void;

        @Computed
        get someComputed(): number;

        @Monitor(['someLocal'])
        onSomeLocalChanged(): void;

        @Builder
        build(): void;
    }

    // ts-type
    @Builder type exportBuilderType = () => void;

    type exportBuilderType2 = @Builder () => void;

    interface IBuilderInArgs {
        mockBuilderMethod1(builderType: exportBuilderType): void;
        mockBuilderMethod2(builderType: exportBuilderType2): void;
    }
}

export default aNamespace;