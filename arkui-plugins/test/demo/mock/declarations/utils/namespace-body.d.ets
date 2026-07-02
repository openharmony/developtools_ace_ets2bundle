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
    TextAttribute, 
    wrapBuilder
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


namespace aNamespaceWithBody {
    // class-observed
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
        t1: number = 1;
    }

    @Observed
    class ExportObservedImplWithBody implements IO {
        t1: number = 1;
    }

    @Observed
    class ExportObservedWithTrackWithBody {
        t1: number = 1;
        @Track t2: number = 2;
    }

    class ExportTrackWithoutObservedWithBody {
        @Track t1: number = 1;
    }

    // class-observedV2
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
        @Trace t1: number = 1;
        t2: number = 2;

        constructor(t2: number) {
            this.t2 = t2;
        }
    }

    @ObservedV2
    class ExportObservedV2WithBody {
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

    // constant
    declare const EXPORT_RESOURCE: Resource;

    declare const EXPORT_RAWFILE: Resource;

    declare const EXPORT_WRAPPED_BUILDER: WrappedBuilder<@Builder (value: string, size: number) => void>;

    const EXPORT_RESOURCE_WITH_BODY: Resource = $r('app.string.app_icon');

    const EXPORT_RAWFILE_WITH_BODY: Resource = $rawfile('app.mock.txt');

    @Builder
    declare function wrappedBuilder(value: string, size: number): void;

    const EXPORT_WRAPPED_BUILDER_WITH_BODY: WrappedBuilder<@Builder (value: string, size: number) => void> = wrapBuilder(wrappedBuilder);

    // struct-dialog
    @CustomDialog
    declare struct ExportCustomDialog {
        @Link someLink: number;
        controller?: CustomDialogController;

        @Builder
        build(): void;
    }

    @CustomDialog
    declare struct NonExportCustomDialog {
        @Link someLink: number;
        controller?: CustomDialogController;

        @Builder
        build(): void;
    }

    @CustomDialog 
    struct CustomDialogWithBody {
        @State someState: number = 1;
        controller: CustomDialogController | null = new CustomDialogController({
            builder: NonExportCustomDialog({
                someLink: this.someState
            })
        });

        build(): void {
            Column() {}
        }
    }

    @CustomDialog
    struct ExportCustomDialogWithBody {
        @State someState: number = 1;
        controller: CustomDialogController | null = new CustomDialogController({
            builder: NonExportCustomDialog({
                someLink: this.someState
            })
        });

        build(): void {
            Column() {}
        }
    }

    // struct-entry
    @Entry
    @Component
    struct ExportEntryStructWithBody {
        build(): void {
            Column() {}
        }
    }

    // struct-v1
    @Component
    declare struct ExportStructV1 {
        @State someState: number;

        @BuilderParam someBuilderParam: () => void;

        @Builder
        build(): void;
    }

    @Component
    declare struct NonExportStructV1 {
        @State someState: number;

        @BuilderParam someBuilderParam: () => void;

        @Builder
        build(): void;
    }

    @Component
    struct StructV1WithBody {
        @State someState: number = 1;

        @BuilderParam someBuilderParam: () => void;

        build(): void {
            Column() {}
        }
    }

    @Component
    struct ExportStructV1WithBody {
        @State someState: number = 1;
        @Link someLink: number;

        @BuilderParam someBuilderParam: () => void;

        build(): void {
            Column() {}
        }
    }

    // struct-v2
    @ComponentV2
    declare struct ExportStructV2 {
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
    declare struct NonExportStructV2 {
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
    struct StructV2WithBody {
        @Local someLocal: number = 1;

        @BuilderParam someBuilderParam: () => void;

        @Computed
        get someComputed(): number {
            return this.someLocal;
        }

        @Monitor(['someLocal'])
        onSomeLocalChanged(): void {}

        build(): void {
            Column() {}
        }
    }

    @ComponentV2
    struct ExportStructV2WithBody {
        @Local someLocal: number = 1;
        @Param someParam: number = 2;
        @Require @Param someRequiredParam: number;

        @BuilderParam someBuilderParam: () => void;

        @Computed
        get someComputed(): number {
            return this.someLocal;
        }

        @Monitor(['someLocal'])
        onSomeLocalChanged(): void {}

        build(): void {
            Column() {}
        }
    }

    // ts-type
    @Builder type exportBuilderType = () => void;

    type exportBuilderType2 = @Builder () => void;

    interface IBuilderInArgs {
        mockBuilderMethod1(builderType: exportBuilderType): void;
        mockBuilderMethod2(builderType: exportBuilderType2): void;
    }
}

export default aNamespaceWithBody;
