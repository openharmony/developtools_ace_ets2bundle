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

const STORAGEPROP_DIR_PATH: string = 'decorators/storageprop';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, STORAGEPROP_DIR_PATH, 'storageprop-complex-type.ets'),
];

const storagePropTransform: Plugins = {
    name: 'storageprop',
    parsed: uiTransform().parsed,
}

const pluginTester = new PluginTester('test storageprop complex type transform', buildConfig);

const expectedScript: string = `
import { __memo_id_type as __memo_id_type } from "arkui.stateManagement.runtime";

import { __memo_context_type as __memo_context_type } from "arkui.stateManagement.runtime";

import { memo as memo } from "arkui.stateManagement.runtime";

import { StoragePropDecoratedVariable as StoragePropDecoratedVariable } from "@ohos.arkui.stateManagement";

import { EntryPoint as EntryPoint } from "arkui.UserView";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Component as Component, Entry as Entry } from "@ohos.arkui.component";

import { StorageProp as StorageProp } from "@ohos.arkui.stateManagement";

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
    this.#ordinal = ordinal;
  }
  
  public static readonly Success: Status = new Status(0, 200);
  
  public static readonly NotFound: Status = new Status(1, 404);
  
  public static readonly ServerError: Status = new Status(2, 500);
  
  private static readonly #NamesArray: String[] = ["Success", "NotFound", "ServerError"];
  
  private static readonly #ValuesArray: int[] = [200, 404, 500];
  
  private static readonly #StringValuesArray: String[] = ["200", "404", "500"];
  
  private static readonly #ItemsArray: Status[] = [Status.Success, Status.NotFound, Status.ServerError];
  
  public getName(): String {
    return Status.#NamesArray[this.#ordinal];
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
    return Status.#ValuesArray[this.#ordinal];
  }
  
  public toString(): String {
    return Status.#StringValuesArray[this.#ordinal];
  }
  
  public static values(): Status[] {
    return Status.#ItemsArray;
  }
  
  public getOrdinal(): int {
    return this.#ordinal;
  }
  
  public static $_get(e: Status): String {
    return e.getName();
  }
  
}

@Entry({useSharedStorage:false,storage:"",routeName:""}) @Component({freezeWhenInactive:false}) final class MyStateSample extends CustomComponent<MyStateSample, __Options_MyStateSample> {
  public __initializeStruct(initializers: __Options_MyStateSample | undefined, @memo() content: (()=> void) | undefined): void {
    this.__backing_arrayB = new StoragePropDecoratedVariable<Array<number>>("Prop1", "arrayB", [1, 2, 3])
    this.__backing_objectB = new StoragePropDecoratedVariable<Object>("Prop2", "objectB", {})
    this.__backing_dateB = new StoragePropDecoratedVariable<Date>("Prop3", "dateB", new Date("2021-09-09"))
    this.__backing_setB = new StoragePropDecoratedVariable<Set<number>>("Prop4", "setB", new Set<number>())
    this.__backing_mapB = new StoragePropDecoratedVariable<Map<number, string>>("Prop5", "mapB", new Map<number, string>())
    this.__backing_unionB = new StoragePropDecoratedVariable<string | undefined>("Prop6", "unionB", "")
    this.__backing_classB = new StoragePropDecoratedVariable<Person>("Prop7", "classB", new Person("Kevin"))
    this.__backing_enumB = new StoragePropDecoratedVariable<Status>("Prop8", "enumB", Status.NotFound)
  }
  
  public __updateStruct(initializers: __Options_MyStateSample | undefined): void {}
  
  private __backing_arrayB?: StoragePropDecoratedVariable<Array<number>>;
  
  public get arrayB(): Array<number> {
    return this.__backing_arrayB!.get();
  }
  
  public set arrayB(value: Array<number>) {
    this.__backing_arrayB!.set(value);
  }
  
  private __backing_objectB?: StoragePropDecoratedVariable<Object>;
  
  public get objectB(): Object {
    return this.__backing_objectB!.get();
  }
  
  public set objectB(value: Object) {
    this.__backing_objectB!.set(value);
  }
  
  private __backing_dateB?: StoragePropDecoratedVariable<Date>;
  
  public get dateB(): Date {
    return this.__backing_dateB!.get();
  }
  
  public set dateB(value: Date) {
    this.__backing_dateB!.set(value);
  }
  
  private __backing_setB?: StoragePropDecoratedVariable<Set<number>>;
  
  public get setB(): Set<number> {
    return this.__backing_setB!.get();
  }
  
  public set setB(value: Set<number>) {
    this.__backing_setB!.set(value);
  }
  
  private __backing_mapB?: StoragePropDecoratedVariable<Map<number, string>>;
  
  public get mapB(): Map<number, string> {
    return this.__backing_mapB!.get();
  }
  
  public set mapB(value: Map<number, string>) {
    this.__backing_mapB!.set(value);
  }
  
  private __backing_unionB?: StoragePropDecoratedVariable<string | undefined>;
  
  public get unionB(): string | undefined {
    return this.__backing_unionB!.get();
  }
  
  public set unionB(value: string | undefined) {
    this.__backing_unionB!.set(value);
  }
  
  private __backing_classB?: StoragePropDecoratedVariable<Person>;
  
  public get classB(): Person {
    return this.__backing_classB!.get();
  }
  
  public set classB(value: Person) {
    this.__backing_classB!.set(value);
  }
  
  private __backing_enumB?: StoragePropDecoratedVariable<Status>;
  
  public get enumB(): Status {
    return this.__backing_enumB!.get();
  }
  
  public set enumB(value: Status) {
    this.__backing_enumB!.set(value);
  }
  
  @memo() public _build(@memo() style: ((instance: MyStateSample)=> MyStateSample) | undefined, @memo() content: (()=> void) | undefined, initializers: __Options_MyStateSample | undefined): void {}
  
  public constructor() {}
  
}

interface __Options_MyStateSample {
  set arrayB(arrayB: Array<number> | undefined)
  
  get arrayB(): Array<number> | undefined
  set __backing_arrayB(__backing_arrayB: StoragePropDecoratedVariable<Array<number>> | undefined)
  
  get __backing_arrayB(): StoragePropDecoratedVariable<Array<number>> | undefined
  set objectB(objectB: Object | undefined)
  
  get objectB(): Object | undefined
  set __backing_objectB(__backing_objectB: StoragePropDecoratedVariable<Object> | undefined)
  
  get __backing_objectB(): StoragePropDecoratedVariable<Object> | undefined
  set dateB(dateB: Date | undefined)
  
  get dateB(): Date | undefined
  set __backing_dateB(__backing_dateB: StoragePropDecoratedVariable<Date> | undefined)
  
  get __backing_dateB(): StoragePropDecoratedVariable<Date> | undefined
  set setB(setB: Set<number> | undefined)
  
  get setB(): Set<number> | undefined
  set __backing_setB(__backing_setB: StoragePropDecoratedVariable<Set<number>> | undefined)
  
  get __backing_setB(): StoragePropDecoratedVariable<Set<number>> | undefined
  set mapB(mapB: Map<number, string> | undefined)
  
  get mapB(): Map<number, string> | undefined
  set __backing_mapB(__backing_mapB: StoragePropDecoratedVariable<Map<number, string>> | undefined)
  
  get __backing_mapB(): StoragePropDecoratedVariable<Map<number, string>> | undefined
  set unionB(unionB: string | undefined | undefined)
  
  get unionB(): string | undefined | undefined
  set __backing_unionB(__backing_unionB: StoragePropDecoratedVariable<string | undefined> | undefined)
  
  get __backing_unionB(): StoragePropDecoratedVariable<string | undefined> | undefined
  set classB(classB: Person | undefined)
  
  get classB(): Person | undefined
  set __backing_classB(__backing_classB: StoragePropDecoratedVariable<Person> | undefined)
  
  get __backing_classB(): StoragePropDecoratedVariable<Person> | undefined
  set enumB(enumB: Status | undefined)
  
  get enumB(): Status | undefined
  set __backing_enumB(__backing_enumB: StoragePropDecoratedVariable<Status> | undefined)
  
  get __backing_enumB(): StoragePropDecoratedVariable<Status> | undefined
  
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

function testStoragePropTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test storageprop complex type transform',
    [storagePropTransform, uiNoRecheck],
    {
        checked: [testStoragePropTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
