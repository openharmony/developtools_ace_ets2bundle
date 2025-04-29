/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
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

import * as path from 'path';
import { PluginTestContext, PluginTester } from '../../../../utils/plugin-tester';
import { BuildConfig, mockBuildConfig } from '../../../../utils/artkts-config';
import { getRootPath, MOCK_ENTRY_DIR_PATH } from '../../../../utils/path-config';
import { parseDumpSrc } from '../../../../utils/parse-string';
import { uiNoRecheck } from '../../../../utils/plugins';
import { uiTransform } from '../../../../../ui-plugins';
import { Plugins } from '../../../../../common/plugin-context';

const STORAGELINK_DIR_PATH: string = 'decorators/storagelink';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, STORAGELINK_DIR_PATH, 'storagelink-complex-type.ets'),
];

const storageLinkTransform: Plugins = {
    name: 'storageLink',
    parsed: uiTransform().parsed,
}

const pluginTester = new PluginTester('test storagelink complex type transform', buildConfig);

const expectedScript: string = `
import { __memo_id_type as __memo_id_type } from "@ohos.arkui.stateManagement";

import { __memo_context_type as __memo_context_type } from "@ohos.arkui.stateManagement";

import { memo as memo } from "@ohos.arkui.stateManagement";

import { StorageLinkDecoratedVariable as StorageLinkDecoratedVariable } from "@ohos.arkui.stateManagement";

import { EntryPoint as EntryPoint } from "@ohos.arkui.component";

import { CustomComponent as CustomComponent } from "@ohos.arkui.component";

import { Component as Component, Entry as Entry } from "@ohos.arkui.component";

import { StorageLink as StorageLink } from "@ohos.arkui.stateManagement";

function main() {}



class Person {
  public name: string = "";
  
  public constructor(name: string) {}
  
}

final class Status extends BaseEnum<int> {
  private readonly #ordinal: int;
  
  private static <cctor>() {}
  
  public constructor(ordinal: int, value: int) {
    super(value);
    (this).#ordinal = ordinal;
  }
  
  public static readonly Success: Status = new Status(0, 200);
  
  public static readonly NotFound: Status = new Status(1, 404);
  
  public static readonly ServerError: Status = new Status(2, 500);
  
  private static readonly #NamesArray: String[] = ["Success", "NotFound", "ServerError"];
  
  private static readonly #ValuesArray: int[] = [200, 404, 500];
  
  private static readonly #StringValuesArray: String[] = ["200", "404", "500"];
  
  private static readonly #ItemsArray: Status[] = [Status.Success, Status.NotFound, Status.ServerError];
  
  public getName(): String {
    return Status.#NamesArray[(this).#ordinal];
  }
  
  public static getValueOf(name: String): Status {
    for (let i = 0;((i) < (Status.#NamesArray.length));(++i)) {
      if (((name) == (Status.#NamesArray[i]))) {
        return Status.#ItemsArray[i];
      }
    }
    throw new Error((("No enum constant Status.") + (name)));
  }
  
  public static fromValue(value: int): Status {
    for (let i = 0;((i) < (Status.#ValuesArray.length));(++i)) {
      if (((value) == (Status.#ValuesArray[i]))) {
        return Status.#ItemsArray[i];
      }
    }
    throw new Error((("No enum Status with value ") + (value)));
  }
  
  public valueOf(): int {
    return Status.#ValuesArray[(this).#ordinal];
  }
  
  public toString(): String {
    return Status.#StringValuesArray[(this).#ordinal];
  }
  
  public static values(): Status[] {
    return Status.#ItemsArray;
  }
  
  public getOrdinal(): int {
    return (this).#ordinal;
  }
  
  public static $_get(e: Status): String {
    return e.getName();
  }
  
}

@Entry({useSharedStorage:false,storage:"",routeName:""}) @Component({freezeWhenInactive:false}) final class MyStateSample extends CustomComponent<MyStateSample, __Options_MyStateSample> {
  public __initializeStruct(initializers: __Options_MyStateSample | undefined, @memo() content: (()=> void) | undefined): void {
    (this).__backing_arrayA = new StorageLinkDecoratedVariable<Array<number>>("Prop1", "arrayA", [1, 2, 3])
    (this).__backing_objectA = new StorageLinkDecoratedVariable<Object>("Prop2", "objectA", {})
    (this).__backing_dateA = new StorageLinkDecoratedVariable<Date>("Prop3", "dateA", new Date("2021-08-08"))
    (this).__backing_setA = new StorageLinkDecoratedVariable<Set<number>>("Prop4", "setA", new Set<number>())
    (this).__backing_mapA = new StorageLinkDecoratedVariable<Map<number, string>>("Prop5", "mapA", new Map<number, string>())
    (this).__backing_unionA = new StorageLinkDecoratedVariable<string | undefined>("Prop6", "unionA", "")
    (this).__backing_classA = new StorageLinkDecoratedVariable<Person>("Prop7", "classA", new Person("John"))
    (this).__backing_enumA = new StorageLinkDecoratedVariable<Status>("Prop8", "enumA", Status.NotFound)
  }
  
  public __updateStruct(initializers: __Options_MyStateSample | undefined): void {}
  
  private __backing_arrayA?: StorageLinkDecoratedVariable<Array<number>>;
  
  public get arrayA(): Array<number> {
    return (this).__backing_arrayA!.get();
  }
  
  public set arrayA(value: Array<number>) {
    (this).__backing_arrayA!.set(value);
  }
  
  private __backing_objectA?: StorageLinkDecoratedVariable<Object>;
  
  public get objectA(): Object {
    return (this).__backing_objectA!.get();
  }
  
  public set objectA(value: Object) {
    (this).__backing_objectA!.set(value);
  }
  
  private __backing_dateA?: StorageLinkDecoratedVariable<Date>;
  
  public get dateA(): Date {
    return (this).__backing_dateA!.get();
  }
  
  public set dateA(value: Date) {
    (this).__backing_dateA!.set(value);
  }
  
  private __backing_setA?: StorageLinkDecoratedVariable<Set<number>>;
  
  public get setA(): Set<number> {
    return (this).__backing_setA!.get();
  }
  
  public set setA(value: Set<number>) {
    (this).__backing_setA!.set(value);
  }
  
  private __backing_mapA?: StorageLinkDecoratedVariable<Map<number, string>>;
  
  public get mapA(): Map<number, string> {
    return (this).__backing_mapA!.get();
  }
  
  public set mapA(value: Map<number, string>) {
    (this).__backing_mapA!.set(value);
  }
  
  private __backing_unionA?: StorageLinkDecoratedVariable<string | undefined>;
  
  public get unionA(): string | undefined {
    return (this).__backing_unionA!.get();
  }
  
  public set unionA(value: string | undefined) {
    (this).__backing_unionA!.set(value);
  }
  
  private __backing_classA?: StorageLinkDecoratedVariable<Person>;
  
  public get classA(): Person {
    return (this).__backing_classA!.get();
  }
  
  public set classA(value: Person) {
    (this).__backing_classA!.set(value);
  }
  
  private __backing_enumA?: StorageLinkDecoratedVariable<Status>;
  
  public get enumA(): Status {
    return (this).__backing_enumA!.get();
  }
  
  public set enumA(value: Status) {
    (this).__backing_enumA!.set(value);
  }
  
  @memo() public _build(@memo() style: ((instance: MyStateSample)=> MyStateSample) | undefined, @memo() content: (()=> void) | undefined, initializers: __Options_MyStateSample | undefined): void {}
  
  public constructor() {}
  
}

interface __Options_MyStateSample {
  set arrayA(arrayA: Array<number> | undefined)
  
  get arrayA(): Array<number> | undefined
  set __backing_arrayA(__backing_arrayA: StorageLinkDecoratedVariable<Array<number>> | undefined)
  
  get __backing_arrayA(): StorageLinkDecoratedVariable<Array<number>> | undefined
  set objectA(objectA: Object | undefined)
  
  get objectA(): Object | undefined
  set __backing_objectA(__backing_objectA: StorageLinkDecoratedVariable<Object> | undefined)
  
  get __backing_objectA(): StorageLinkDecoratedVariable<Object> | undefined
  set dateA(dateA: Date | undefined)
  
  get dateA(): Date | undefined
  set __backing_dateA(__backing_dateA: StorageLinkDecoratedVariable<Date> | undefined)
  
  get __backing_dateA(): StorageLinkDecoratedVariable<Date> | undefined
  set setA(setA: Set<number> | undefined)
  
  get setA(): Set<number> | undefined
  set __backing_setA(__backing_setA: StorageLinkDecoratedVariable<Set<number>> | undefined)
  
  get __backing_setA(): StorageLinkDecoratedVariable<Set<number>> | undefined
  set mapA(mapA: Map<number, string> | undefined)
  
  get mapA(): Map<number, string> | undefined
  set __backing_mapA(__backing_mapA: StorageLinkDecoratedVariable<Map<number, string>> | undefined)
  
  get __backing_mapA(): StorageLinkDecoratedVariable<Map<number, string>> | undefined
  set unionA(unionA: string | undefined | undefined)
  
  get unionA(): string | undefined | undefined
  set __backing_unionA(__backing_unionA: StorageLinkDecoratedVariable<string | undefined> | undefined)
  
  get __backing_unionA(): StorageLinkDecoratedVariable<string | undefined> | undefined
  set classA(classA: Person | undefined)
  
  get classA(): Person | undefined
  set __backing_classA(__backing_classA: StorageLinkDecoratedVariable<Person> | undefined)
  
  get __backing_classA(): StorageLinkDecoratedVariable<Person> | undefined
  set enumA(enumA: Status | undefined)
  
  get enumA(): Status | undefined
  set __backing_enumA(__backing_enumA: StorageLinkDecoratedVariable<Status> | undefined)
  
  get __backing_enumA(): StorageLinkDecoratedVariable<Status> | undefined
  
}

class __EntryWrapper extends EntryPoint {
  @memo() public entry(): void {
    MyStateSample._instantiateImpl(undefined, (() => {
      return new MyStateSample();
    }), undefined, undefined, undefined);
  }
  
  public constructor() {}
  
}

`;

function testStorageLinkTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test storagelink complex type transform',
    [storageLinkTransform, uiNoRecheck],
    {
        checked: [testStorageLinkTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
