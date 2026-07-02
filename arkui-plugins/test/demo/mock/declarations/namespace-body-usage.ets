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

import { Text, Column, Component, ComponentV2, Entry, Builder, BuilderParam, Resource, $r, $rawfile, CustomDialogController } from "@ohos.arkui.component"
import { Observed, ObservedV2, Track, Trace, Monitor, Computed, Local, State } from "@ohos.arkui.stateManagement";
import aNamespaceWithBody from "./utils/namespace-body"

// class-observed
class SomeObClass extends aNamespaceWithBody.ExportObserved implements aNamespaceWithBody.IO {
  someMethod(): void {
    console.log(this.t1);
  }

  constructor(t1: number) {
    super();
    this.t1 = t1;
  }
}

class SomeObClassImpl extends aNamespaceWithBody.ExportObservedImpl {
  someMethod(): void {
    console.log(this.t1);
  }

  constructor(t1: number) {
    super();
    this.t1 = t1;
  }
}

class SomeObClassWithTrack extends aNamespaceWithBody.ExportObservedWithTrack {
  t1: number = 1;

  constructor(t2: number) {
    super();
    this.t2 = t2;
  }
}

class SomeTrClassInherit extends aNamespaceWithBody.ExportTrackWithoutObserved {
  
}

const SomeObClassVar = new SomeObClass(1);
const SomeObClassImplVar = new SomeObClassImpl(2);
const SomeObClassWithTrackVar = new SomeObClassWithTrack(3);
const SomeTrClassInheritVar = new SomeTrClassInherit();

const ExportObservedWithBodyVar = new aNamespaceWithBody.ExportObservedWithBody();
const ExportObservedImplWithBodyVar = new aNamespaceWithBody.ExportObservedImplWithBody();
const ExportObservedWithTrackWithBodyVar = new aNamespaceWithBody.ExportObservedWithTrackWithBody();
const ExportTrackWithoutObservedWithBodyVar = new aNamespaceWithBody.ExportTrackWithoutObservedWithBody();

// class-observedV2
class SomeObV2Class extends aNamespaceWithBody.ExportObservedV2 implements aNamespaceWithBody.IO {
  someMethod(): void {
    console.log(this.t1);
  }

  constructor(t1: number) {
    super();
    this.t1 = t1;
  }
}

class SomeObV2ClassImpl extends aNamespaceWithBody.ExportObservedV2Inherit {
  someMethod(): void {
    console.log(this.t1);
  }

  constructor(t1: number) {
    super();
    this.t1 = t1;
  }
}

const SomeObV2ClassVar = new SomeObV2Class(1);
const SomeObV2ClassImplVar = new SomeObV2ClassImpl(2);

const ExportObservedV2WithBodyVar = new aNamespaceWithBody.ExportObservedV2WithBody(1);
const ExportObservedV2InheritWithBodyVar = new aNamespaceWithBody.ExportObservedV2InheritWithBody(2);

// constant
aNamespaceWithBody.EXPORT_RAWFILE = $rawfile('app.mock.txt');

@Builder
function ConstantBuilder(): void {
    Text(aNamespaceWithBody.EXPORT_RESOURCE);
    aNamespaceWithBody.EXPORT_WRAPPED_BUILDER.builder('name', 1);
}

@Component
struct ConstantStruct {
  @State stateVar: Resource = aNamespaceWithBody.EXPORT_RESOURCE;

  build() {}
}

// struct-dialog
@Builder
function aBuilder(): void {
  aNamespaceWithBody.ExportCustomDialogWithBody({ controller: null });
  aNamespaceWithBody.ExportEntryStructWithBody();
  aNamespaceWithBody.ExportStructV1();
}

@Component
struct DialogStruct {
  @State aNumber: number = 1;
  controller: CustomDialogController | null = new CustomDialogController({
    builder: aNamespaceWithBody.ExportCustomDialog({ someLink: this.aNumber })
  })

  build() {
    Column() {
      aNamespaceWithBody.ExportCustomDialog({ someLink: this.aNumber });
      aNamespaceWithBody.ExportCustomDialogWithBody({ controller: this.controller });
    }
  }
}

// struct-entry
@Entry
@Component
struct EntryStructWithBody {
  build() {
    Column() {
      aNamespaceWithBody.ExportEntryStructWithBody();
    }
  }
}

// struct-v1
@Component
struct V1Struct {
  @State aNumber: number = 1;

  build() {
    Column() {
      aNamespaceWithBody.ExportStructV1();
      aNamespaceWithBody.ExportStructV1WithBody({ someLink: this.aNumber });
    }
  }
}

// struct-v2
@Builder
function aBuilder1(someRequiredParam: number): void {
  aNamespaceWithBody.ExportStructV2WithBody({ someRequiredParam: someRequiredParam });
}

@ComponentV2
struct V2Struct {
  @Local aNumber: number = 1;

  build() {
    Column() {
      aNamespaceWithBody.ExportStructV2();
      aNamespaceWithBody.ExportStructV2WithBody({ someParam: this.aNumber, someRequiredParam: this.aNumber });
    }
  }
}

// ts-type
function mockFunction(obj: aNamespaceWithBody.IBuilderInArgs): void {
    obj.mockBuilderMethod1(() => {});
    obj.mockBuilderMethod2(() => {});
}