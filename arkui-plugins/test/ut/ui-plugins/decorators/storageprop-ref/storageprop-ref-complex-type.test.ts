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
import { PluginTester } from '../../../../utils/plugin-tester';
import { mockBuildConfig } from '../../../../utils/artkts-config';
import { getRootPath, MOCK_ENTRY_DIR_PATH } from '../../../../utils/path-config';
import { parseDumpSrc } from '../../../../utils/parse-string';
import { uiNoRecheck, recheck, beforeUINoRecheck } from '../../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../../utils/shared-types';
import { dumpGetterSetter, GetSetDumper, dumpConstructor, dumpAnnotation } from '../../../../utils/simplify-dump';
import { uiTransform } from '../../../../../ui-plugins';
import { Plugins } from '../../../../../common/plugin-context';

const STORAGEPROP_DIR_PATH: string = 'decorators/storageprop-ref';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, STORAGEPROP_DIR_PATH, 'storageprop-ref-complex-type.ets'),
];

const storagePropTransform: Plugins = {
    name: 'parsedTrans',
    parsed: uiTransform().parsed,
}

const pluginTester = new PluginTester('test @StoragePropRef complex type transform', buildConfig);

const expectedScript: string = `
import { MemoIntrinsic as MemoIntrinsic } from "arkui.incremental.annotation";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { IStoragePropRefDecoratedVariable as IStoragePropRefDecoratedVariable } from "arkui.stateManagement.decorator";

import { Memo as Memo } from "arkui.incremental.annotation";

import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Builder as Builder } from "arkui.component.builder";

import { LocalStorage as LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { ComponentBuilder as ComponentBuilder } from "arkui.component.builder";

import { Component as Component } from "@ohos.arkui.component";

import { StoragePropRef as StoragePropRef } from "@ohos.arkui.stateManagement";

function main() {}

class Person {
  public name: string = "";

  public constructor(name: string) {}

}

final class Status extends BaseEnum<int> {
  private readonly #ordinal: int;

  private static <cctor>() {}

  private constructor(ordinal: int, value: int) {
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
    for (let i = ((Status.#NamesArray.length) - (1));((i) >= (0));(--i)) {
      if (((name) == (Status.#NamesArray[i]))) {
        return Status.#ItemsArray[i];
      }
    }
    throw new Error((("No enum constant Status.") + (name)));
  }

  public static fromValue(value: int): Status {
    for (let i = ((Status.#ValuesArray.length) - (1));((i) >= (0));(--i)) {
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

@Component() final struct MyStateSample extends CustomComponent<MyStateSample, __Options_MyStateSample> {
  public __initializeStruct(initializers: (__Options_MyStateSample | undefined), @Memo() content: ((()=> void) | undefined)): void {
    this.__backing_arrayB = STATE_MGMT_FACTORY.makeStoragePropRef<Array<number>>(this, "Prop1", "arrayB", [1, 2, 3]);
    this.__backing_objectB = STATE_MGMT_FACTORY.makeStoragePropRef<Object>(this, "Prop2", "objectB", {});
    this.__backing_dateB = STATE_MGMT_FACTORY.makeStoragePropRef<Date>(this, "Prop3", "dateB", new Date("2021-09-09"));
    this.__backing_setB = STATE_MGMT_FACTORY.makeStoragePropRef<Set<number>>(this, "Prop4", "setB", new Set<number>());
    this.__backing_mapB = STATE_MGMT_FACTORY.makeStoragePropRef<Map<number, string>>(this, "Prop5", "mapB", new Map<number, string>());
    this.__backing_classB = STATE_MGMT_FACTORY.makeStoragePropRef<Person>(this, "Prop7", "classB", new Person("Kevin"));
    this.__backing_enumB = STATE_MGMT_FACTORY.makeStoragePropRef<Status>(this, "Prop8", "enumB", Status.NotFound);
  }

  public __updateStruct(initializers: (__Options_MyStateSample | undefined)): void {}

  public resetStateVarsOnReuse(initializers: (__Options_MyStateSample | undefined)): void {
    this.__backing_arrayB!.resetOnReuse();
    this.__backing_objectB!.resetOnReuse();
    this.__backing_dateB!.resetOnReuse();
    this.__backing_setB!.resetOnReuse();
    this.__backing_mapB!.resetOnReuse();
    this.__backing_classB!.resetOnReuse();
    this.__backing_enumB!.resetOnReuse();
  }
  @MemoIntrinsic() 
  public static _invoke(style: (@Memo() ((instance: MyStateSample)=> void) | undefined), initializers: ((()=> __Options_MyStateSample) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: ((()=> void) | undefined)): void {
    CustomComponent._invokeImpl<MyStateSample, __Options_MyStateSample>(style, ((): MyStateSample => {
    return new MyStateSample(false, ({let gensym___<some_random_number> = storage;
    (((gensym___<some_random_number>) == (null)) ? undefined : gensym___<some_random_number>())}));
    }), initializers, reuseId, content);
  }
  @ComponentBuilder() 
  public static $_invoke(initializers?: __Options_MyStateSample, storage?: LocalStorage, @Builder() content?: (()=> void)): MyStateSample {
    throw new Error("Declare interface");
  }
  private __backing_arrayB?: IStoragePropRefDecoratedVariable<Array<number>>;

  public get arrayB(): Array<number> {
    return this.__backing_arrayB!.get();
  }

  public set arrayB(value: Array<number>) {
    this.__backing_arrayB!.set(value);
  }

  private __backing_objectB?: IStoragePropRefDecoratedVariable<Object>;

  public get objectB(): Object {
    return this.__backing_objectB!.get();
  }

  public set objectB(value: Object) {
    this.__backing_objectB!.set(value);
  }

  private __backing_dateB?: IStoragePropRefDecoratedVariable<Date>;

  public get dateB(): Date {
    return this.__backing_dateB!.get();
  }

  public set dateB(value: Date) {
    this.__backing_dateB!.set(value);
  }

  private __backing_setB?: IStoragePropRefDecoratedVariable<Set<number>>;

  public get setB(): Set<number> {
    return this.__backing_setB!.get();
  }

  public set setB(value: Set<number>) {
    this.__backing_setB!.set(value);
  }

  private __backing_mapB?: IStoragePropRefDecoratedVariable<Map<number, string>>;

  public get mapB(): Map<number, string> {
    return this.__backing_mapB!.get();
  }

  public set mapB(value: Map<number, string>) {
    this.__backing_mapB!.set(value);
  }

  private __backing_classB?: IStoragePropRefDecoratedVariable<Person>;

  public get classB(): Person {
    return this.__backing_classB!.get();
  }

  public set classB(value: Person) {
    this.__backing_classB!.set(value);
  }

  private __backing_enumB?: IStoragePropRefDecoratedVariable<Status>;

  public get enumB(): Status {
    return this.__backing_enumB!.get();
  }

  public set enumB(value: Status) {
    this.__backing_enumB!.set(value);
  }

  @Memo() 
  public build() {}
  protected constructor(useSharedStorage?: boolean, storage?: LocalStorage) {
    super(useSharedStorage, storage);
  }
  static {
  }
}

@Component() class __Options_MyStateSample {
  @StoragePropRef({value:"Prop1"}) public arrayB?: Array<number>;
  public __backing_arrayB?: IStoragePropRefDecoratedVariable<Array<number>>;
  public __options_has_arrayB?: boolean;
  @StoragePropRef({value:"Prop2"}) public objectB?: Object;
  public __backing_objectB?: IStoragePropRefDecoratedVariable<Object>;
  public __options_has_objectB?: boolean;
  @StoragePropRef({value:"Prop3"}) public dateB?: Date;
  public __backing_dateB?: IStoragePropRefDecoratedVariable<Date>;
  public __options_has_dateB?: boolean;
  @StoragePropRef({value:"Prop4"}) public setB?: Set<number>;
  public __backing_setB?: IStoragePropRefDecoratedVariable<Set<number>>;
  public __options_has_setB?: boolean;
  @StoragePropRef({value:"Prop5"}) public mapB?: Map<number, string>;
  public __backing_mapB?: IStoragePropRefDecoratedVariable<Map<number, string>>;
  public __options_has_mapB?: boolean;
  @StoragePropRef({value:"Prop7"}) public classB?: Person;
  public __backing_classB?: IStoragePropRefDecoratedVariable<Person>;
  public __options_has_classB?: boolean;
  @StoragePropRef({value:"Prop8"}) public enumB?: Status;
  public __backing_enumB?: IStoragePropRefDecoratedVariable<Status>;
  public __options_has_enumB?: boolean;
  public constructor() {}
}
`;

function testStoragePropTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test @StoragePropRef complex type transform',
    [storagePropTransform, beforeUINoRecheck, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testStoragePropTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
