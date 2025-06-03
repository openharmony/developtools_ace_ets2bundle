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
import { recheck, uiNoRecheck } from '../../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../../utils/shared-types';
import { uiTransform } from '../../../../../ui-plugins';
import { Plugins } from '../../../../../common/plugin-context';

const OBSERVED_DIR_PATH: string = 'decorators/observed-track';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, OBSERVED_DIR_PATH, 'observed-track-complex-type.ets'),
];

const observedTrackTransform: Plugins = {
    name: 'observedTrack',
    parsed: uiTransform().parsed,
}

const pluginTester = new PluginTester('test observed track transform with complex type', buildConfig);

const expectedScript: string = `
import { memo as memo } from "arkui.stateManagement.runtime";
import { IObservedObject as IObservedObject } from "@ohos.arkui.stateManagement";
import { setObservationDepth as setObservationDepth } from "@ohos.arkui.stateManagement";
import { BackingValue as BackingValue } from "@ohos.arkui.stateManagement";
import { MutableStateMeta as MutableStateMeta } from "@ohos.arkui.stateManagement";
import { int32 as int32 } from "@koalaui.runtime.common";
import { WatchIdType as WatchIdType } from "@ohos.arkui.stateManagement";
import { SubscribedWatches as SubscribedWatches } from "@ohos.arkui.stateManagement";
import { EntryPoint as EntryPoint } from "arkui.UserView";
import { CustomComponent as CustomComponent } from "arkui.component.customComponent";
import { Component as Component, Entry as Entry } from "@ohos.arkui.component";
import { Observed as Observed, Track as Track } from "@ohos.arkui.stateManagement";

function main() {}



class Person {
  public constructor() {}
  
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

@Observed() class mixed1 implements IObservedObject {
  private subscribedWatches: SubscribedWatches = new SubscribedWatches();
  
  public addWatchSubscriber(watchId: WatchIdType): void {
    this.subscribedWatches.addWatchSubscriber(watchId);
  }
  
  public removeWatchSubscriber(watchId: WatchIdType): boolean {
    return this.subscribedWatches.removeWatchSubscriber(watchId);
  }
  
  public executeOnSubscribingWatches(propertyName: string): void {
    this.subscribedWatches.executeOnSubscribingWatches(propertyName);
  }
  
  public _permissibleAddRefDepth: int32 = 0;
  
  private __backing_numA: number = 33;
  
  private __meta_numA: MutableStateMeta = new MutableStateMeta("@Track");
  
  private __backing_stringA: string = "AA";
  
  private __meta_stringA: MutableStateMeta = new MutableStateMeta("@Track");
  
  private __backing_booleanA: boolean = true;
  
  private __meta_booleanA: MutableStateMeta = new MutableStateMeta("@Track");
  
  private __backing_arrayA: BackingValue<Array<number>> = new BackingValue<Array<number>>([1, 2, 3]);
  
  private __meta_arrayA: MutableStateMeta = new MutableStateMeta("@Track");
  
  private __backing_objectA: BackingValue<Object> = new BackingValue<Object>({});
  
  private __meta_objectA: MutableStateMeta = new MutableStateMeta("@Track");
  
  private __backing_dateA: BackingValue<Date> = new BackingValue<Date>(new Date("2021-08-08"));
  
  private __meta_dateA: MutableStateMeta = new MutableStateMeta("@Track");
  
  private __backing_setA: BackingValue<Set<number>> = new BackingValue<Set<number>>(new Set<number>());
  
  private __meta_setA: MutableStateMeta = new MutableStateMeta("@Track");
  
  private __backing_mapA: BackingValue<Map<number, string>> = new BackingValue<Map<number, string>>(new Map<number, string>());
  
  private __meta_mapA: MutableStateMeta = new MutableStateMeta("@Track");
  
  private __backing_unionA: string | undefined = "";
  
  private __meta_unionA: MutableStateMeta = new MutableStateMeta("@Track");
  
  private __backing_classA: BackingValue<Person> = new BackingValue<Person>(new Person());
  
  private __meta_classA: MutableStateMeta = new MutableStateMeta("@Track");
  
  private __backing_enumA: BackingValue<Status> = new BackingValue<Status>(Status.NotFound);
  
  private __meta_enumA: MutableStateMeta = new MutableStateMeta("@Track");
  
  public numB: number = 33;
  
  public stringB: string = "AA";
  
  public booleanB: boolean = true;
  
  public arrayB: Array<number> = [1, 2, 3];
  
  public objectB: Object = {};
  
  public dateB: Date = new Date("2021-08-08");
  
  public setB: Set<number> = new Set<number>();
  
  public mapB: Map<number, string> = new Map<number, string>();
  
  public unionB: string | undefined = "";
  
  public classB: Person = new Person();
  
  public enumB: Status = Status.NotFound;
  
  public constructor() {}
  
  public get numA(): number {
    if (((this._permissibleAddRefDepth) > (0))) {
      this.__meta_numA.addRef();
    }
    return this.__backing_numA;
  }
  
  public set numA(newValue: number) {
    if (((this.__backing_numA) !== (newValue))) {
      this.__backing_numA = newValue;
    this.__meta_numA.fireChange();
    this.executeOnSubscribingWatches("numA");
    }
  }
  
  public get stringA(): string {
    if (((this._permissibleAddRefDepth) > (0))) {
      this.__meta_stringA.addRef();
    }
    return this.__backing_stringA;
  }
  
  public set stringA(newValue: string) {
    if (((this.__backing_stringA) !== (newValue))) {
      this.__backing_stringA = newValue;
    this.__meta_stringA.fireChange();
    this.executeOnSubscribingWatches("stringA");
    }
  }
  
  public get booleanA(): boolean {
    if (((this._permissibleAddRefDepth) > (0))) {
      this.__meta_booleanA.addRef();
    }
    return this.__backing_booleanA;
  }
  
  public set booleanA(newValue: boolean) {
    if (((this.__backing_booleanA) !== (newValue))) {
      this.__backing_booleanA = newValue;
    this.__meta_booleanA.fireChange();
    this.executeOnSubscribingWatches("booleanA");
    }
  }
  
  public get arrayA(): Array<number> {
    if (((this._permissibleAddRefDepth) > (0))) {
      this.__meta_arrayA.addRef();
    }
    setObservationDepth(this.__backing_arrayA.value, ((this._permissibleAddRefDepth) - (1)));
    return this.__backing_arrayA.value;
  }
  
  public set arrayA(newValue: Array<number>) {
    if (((this.__backing_arrayA.value) !== (newValue))) {
      this.__backing_arrayA.value = newValue;
    this.__meta_arrayA.fireChange();
    this.executeOnSubscribingWatches("arrayA");
    }
  }
  
  public get objectA(): Object {
    if (((this._permissibleAddRefDepth) > (0))) {
      this.__meta_objectA.addRef();
    }
    setObservationDepth(this.__backing_objectA.value, ((this._permissibleAddRefDepth) - (1)));
    return this.__backing_objectA.value;
  }
  
  public set objectA(newValue: Object) {
    if (((this.__backing_objectA.value) !== (newValue))) {
      this.__backing_objectA.value = newValue;
    this.__meta_objectA.fireChange();
    this.executeOnSubscribingWatches("objectA");
    }
  }
  
  public get dateA(): Date {
    if (((this._permissibleAddRefDepth) > (0))) {
      this.__meta_dateA.addRef();
    }
    setObservationDepth(this.__backing_dateA.value, ((this._permissibleAddRefDepth) - (1)));
    return this.__backing_dateA.value;
  }
  
  public set dateA(newValue: Date) {
    if (((this.__backing_dateA.value) !== (newValue))) {
      this.__backing_dateA.value = newValue;
    this.__meta_dateA.fireChange();
    this.executeOnSubscribingWatches("dateA");
    }
  }
  
  public get setA(): Set<number> {
    if (((this._permissibleAddRefDepth) > (0))) {
      this.__meta_setA.addRef();
    }
    setObservationDepth(this.__backing_setA.value, ((this._permissibleAddRefDepth) - (1)));
    return this.__backing_setA.value;
  }
  
  public set setA(newValue: Set<number>) {
    if (((this.__backing_setA.value) !== (newValue))) {
      this.__backing_setA.value = newValue;
    this.__meta_setA.fireChange();
    this.executeOnSubscribingWatches("setA");
    }
  }
  
  public get mapA(): Map<number, string> {
    if (((this._permissibleAddRefDepth) > (0))) {
      this.__meta_mapA.addRef();
    }
    setObservationDepth(this.__backing_mapA.value, ((this._permissibleAddRefDepth) - (1)));
    return this.__backing_mapA.value;
  }
  
  public set mapA(newValue: Map<number, string>) {
    if (((this.__backing_mapA.value) !== (newValue))) {
      this.__backing_mapA.value = newValue;
    this.__meta_mapA.fireChange();
    this.executeOnSubscribingWatches("mapA");
    }
  }
  
  public get unionA(): string | undefined {
    if (((this._permissibleAddRefDepth) > (0))) {
      this.__meta_unionA.addRef();
    }
    return this.__backing_unionA;
  }
  
  public set unionA(newValue: string | undefined) {
    if (((this.__backing_unionA) !== (newValue))) {
      this.__backing_unionA = newValue;
    this.__meta_unionA.fireChange();
    this.executeOnSubscribingWatches("unionA");
    }
  }
  
  public get classA(): Person {
    if (((this._permissibleAddRefDepth) > (0))) {
      this.__meta_classA.addRef();
    }
    setObservationDepth(this.__backing_classA.value, ((this._permissibleAddRefDepth) - (1)));
    return this.__backing_classA.value;
  }
  
  public set classA(newValue: Person) {
    if (((this.__backing_classA.value) !== (newValue))) {
      this.__backing_classA.value = newValue;
    this.__meta_classA.fireChange();
    this.executeOnSubscribingWatches("classA");
    }
  }
  
  public get enumA(): Status {
    if (((this._permissibleAddRefDepth) > (0))) {
      this.__meta_enumA.addRef();
    }
    setObservationDepth(this.__backing_enumA.value, ((this._permissibleAddRefDepth) - (1)));
    return this.__backing_enumA.value;
  }
  
  public set enumA(newValue: Status) {
    if (((this.__backing_enumA.value) !== (newValue))) {
      this.__backing_enumA.value = newValue;
    this.__meta_enumA.fireChange();
    this.executeOnSubscribingWatches("enumA");
    }
  }
  
}

@Observed() class mixed2 implements IObservedObject {
  private subscribedWatches: SubscribedWatches = new SubscribedWatches();
  
  public addWatchSubscriber(watchId: WatchIdType): void {
    this.subscribedWatches.addWatchSubscriber(watchId);
  }
  
  public removeWatchSubscriber(watchId: WatchIdType): boolean {
    return this.subscribedWatches.removeWatchSubscriber(watchId);
  }
  
  public executeOnSubscribingWatches(propertyName: string): void {
    this.subscribedWatches.executeOnSubscribingWatches(propertyName);
  }
  
  public _permissibleAddRefDepth: int32 = 0;
  
  private __meta: MutableStateMeta = new MutableStateMeta("@Observe properties (no @Track)");
  
  private __backing_numA: number = 33;
  
  private __backing_stringA: string = "AA";
  
  private __backing_booleanA: boolean = true;
  
  private __backing_arrayA: BackingValue<Array<number>> = new BackingValue<Array<number>>([1, 2, 3]);
  
  private __backing_objectA: BackingValue<Object> = new BackingValue<Object>({});
  
  private __backing_dateA: BackingValue<Date> = new BackingValue<Date>(new Date("2021-08-08"));
  
  private __backing_setA: BackingValue<Set<number>> = new BackingValue<Set<number>>(new Set<number>());
  
  private __backing_mapA: BackingValue<Map<number, string>> = new BackingValue<Map<number, string>>(new Map<number, string>());
  
  private __backing_unionA: string | undefined = "";
  
  private __backing_classA: BackingValue<Person> = new BackingValue<Person>(new Person());
  
  private __backing_enumA: BackingValue<Status> = new BackingValue<Status>(Status.NotFound);
  
  public constructor() {}
  
  public get numA(): number {
    if (((this._permissibleAddRefDepth) > (0))) {
      this.__meta.addRef();
    }
    return this.__backing_numA;
  }
  
  public set numA(newValue: number) {
    if (((this.__backing_numA) !== (newValue))) {
      this.__backing_numA = newValue;
    this.__meta.fireChange();
    this.executeOnSubscribingWatches("numA");
    }
  }
  
  public get stringA(): string {
    if (((this._permissibleAddRefDepth) > (0))) {
      this.__meta.addRef();
    }
    return this.__backing_stringA;
  }
  
  public set stringA(newValue: string) {
    if (((this.__backing_stringA) !== (newValue))) {
      this.__backing_stringA = newValue;
    this.__meta.fireChange();
    this.executeOnSubscribingWatches("stringA");
    }
  }
  
  public get booleanA(): boolean {
    if (((this._permissibleAddRefDepth) > (0))) {
      this.__meta.addRef();
    }
    return this.__backing_booleanA;
  }
  
  public set booleanA(newValue: boolean) {
    if (((this.__backing_booleanA) !== (newValue))) {
      this.__backing_booleanA = newValue;
    this.__meta.fireChange();
    this.executeOnSubscribingWatches("booleanA");
    }
  }
  
  public get arrayA(): Array<number> {
    if (((this._permissibleAddRefDepth) > (0))) {
      this.__meta.addRef();
    }
    setObservationDepth(this.__backing_arrayA.value, ((this._permissibleAddRefDepth) - (1)));
    return this.__backing_arrayA.value;
  }
  
  public set arrayA(newValue: Array<number>) {
    if (((this.__backing_arrayA.value) !== (newValue))) {
      this.__backing_arrayA.value = newValue;
    this.__meta.fireChange();
    this.executeOnSubscribingWatches("arrayA");
    }
  }
  
  public get objectA(): Object {
    if (((this._permissibleAddRefDepth) > (0))) {
      this.__meta.addRef();
    }
    setObservationDepth(this.__backing_objectA.value, ((this._permissibleAddRefDepth) - (1)));
    return this.__backing_objectA.value;
  }
  
  public set objectA(newValue: Object) {
    if (((this.__backing_objectA.value) !== (newValue))) {
      this.__backing_objectA.value = newValue;
    this.__meta.fireChange();
    this.executeOnSubscribingWatches("objectA");
    }
  }
  
  public get dateA(): Date {
    if (((this._permissibleAddRefDepth) > (0))) {
      this.__meta.addRef();
    }
    setObservationDepth(this.__backing_dateA.value, ((this._permissibleAddRefDepth) - (1)));
    return this.__backing_dateA.value;
  }
  
  public set dateA(newValue: Date) {
    if (((this.__backing_dateA.value) !== (newValue))) {
      this.__backing_dateA.value = newValue;
    this.__meta.fireChange();
    this.executeOnSubscribingWatches("dateA");
    }
  }
  
  public get setA(): Set<number> {
    if (((this._permissibleAddRefDepth) > (0))) {
      this.__meta.addRef();
    }
    setObservationDepth(this.__backing_setA.value, ((this._permissibleAddRefDepth) - (1)));
    return this.__backing_setA.value;
  }
  
  public set setA(newValue: Set<number>) {
    if (((this.__backing_setA.value) !== (newValue))) {
      this.__backing_setA.value = newValue;
    this.__meta.fireChange();
    this.executeOnSubscribingWatches("setA");
    }
  }
  
  public get mapA(): Map<number, string> {
    if (((this._permissibleAddRefDepth) > (0))) {
      this.__meta.addRef();
    }
    setObservationDepth(this.__backing_mapA.value, ((this._permissibleAddRefDepth) - (1)));
    return this.__backing_mapA.value;
  }
  
  public set mapA(newValue: Map<number, string>) {
    if (((this.__backing_mapA.value) !== (newValue))) {
      this.__backing_mapA.value = newValue;
    this.__meta.fireChange();
    this.executeOnSubscribingWatches("mapA");
    }
  }
  
  public get unionA(): string | undefined {
    if (((this._permissibleAddRefDepth) > (0))) {
      this.__meta.addRef();
    }
    return this.__backing_unionA;
  }
  
  public set unionA(newValue: string | undefined) {
    if (((this.__backing_unionA) !== (newValue))) {
      this.__backing_unionA = newValue;
    this.__meta.fireChange();
    this.executeOnSubscribingWatches("unionA");
    }
  }
  
  public get classA(): Person {
    if (((this._permissibleAddRefDepth) > (0))) {
      this.__meta.addRef();
    }
    setObservationDepth(this.__backing_classA.value, ((this._permissibleAddRefDepth) - (1)));
    return this.__backing_classA.value;
  }
  
  public set classA(newValue: Person) {
    if (((this.__backing_classA.value) !== (newValue))) {
      this.__backing_classA.value = newValue;
    this.__meta.fireChange();
    this.executeOnSubscribingWatches("classA");
    }
  }
  
  public get enumA(): Status {
    if (((this._permissibleAddRefDepth) > (0))) {
      this.__meta.addRef();
    }
    setObservationDepth(this.__backing_enumA.value, ((this._permissibleAddRefDepth) - (1)));
    return this.__backing_enumA.value;
  }
  
  public set enumA(newValue: Status) {
    if (((this.__backing_enumA.value) !== (newValue))) {
      this.__backing_enumA.value = newValue;
    this.__meta.fireChange();
    this.executeOnSubscribingWatches("enumA");
    }
  }
  
}

class mixed3 implements IObservedObject {
  private subscribedWatches: SubscribedWatches = new SubscribedWatches();
  
  public addWatchSubscriber(watchId: WatchIdType): void {
    this.subscribedWatches.addWatchSubscriber(watchId);
  }
  
  public removeWatchSubscriber(watchId: WatchIdType): boolean {
    return this.subscribedWatches.removeWatchSubscriber(watchId);
  }
  
  public executeOnSubscribingWatches(propertyName: string): void {
    this.subscribedWatches.executeOnSubscribingWatches(propertyName);
  }
  
  public _permissibleAddRefDepth: int32 = 0;
  
  private __backing_numA: number = 33;
  
  private __meta_numA: MutableStateMeta = new MutableStateMeta("@Track");
  
  private __backing_stringA: string = "AA";
  
  private __meta_stringA: MutableStateMeta = new MutableStateMeta("@Track");
  
  private __backing_booleanA: boolean = true;
  
  private __meta_booleanA: MutableStateMeta = new MutableStateMeta("@Track");
  
  private __backing_arrayA: BackingValue<Array<number>> = new BackingValue<Array<number>>([1, 2, 3]);
  
  private __meta_arrayA: MutableStateMeta = new MutableStateMeta("@Track");
  
  private __backing_objectA: BackingValue<Object> = new BackingValue<Object>({});
  
  private __meta_objectA: MutableStateMeta = new MutableStateMeta("@Track");
  
  private __backing_dateA: BackingValue<Date> = new BackingValue<Date>(new Date("2021-08-08"));
  
  private __meta_dateA: MutableStateMeta = new MutableStateMeta("@Track");
  
  private __backing_setA: BackingValue<Set<number>> = new BackingValue<Set<number>>(new Set<number>());
  
  private __meta_setA: MutableStateMeta = new MutableStateMeta("@Track");
  
  private __backing_mapA: BackingValue<Map<number, string>> = new BackingValue<Map<number, string>>(new Map<number, string>());
  
  private __meta_mapA: MutableStateMeta = new MutableStateMeta("@Track");
  
  private __backing_unionA: string | undefined = "";
  
  private __meta_unionA: MutableStateMeta = new MutableStateMeta("@Track");
  
  private __backing_classA: BackingValue<Person> = new BackingValue<Person>(new Person());
  
  private __meta_classA: MutableStateMeta = new MutableStateMeta("@Track");
  
  private __backing_enumA: BackingValue<Status> = new BackingValue<Status>(Status.NotFound);
  
  private __meta_enumA: MutableStateMeta = new MutableStateMeta("@Track");
  
  public constructor() {}
  
  public get numA(): number {
    if (((this._permissibleAddRefDepth) > (0))) {
      this.__meta_numA.addRef();
    }
    return this.__backing_numA;
  }
  
  public set numA(newValue: number) {
    if (((this.__backing_numA) !== (newValue))) {
      this.__backing_numA = newValue;
    this.__meta_numA.fireChange();
    this.executeOnSubscribingWatches("numA");
    }
  }
  
  public get stringA(): string {
    if (((this._permissibleAddRefDepth) > (0))) {
      this.__meta_stringA.addRef();
    }
    return this.__backing_stringA;
  }
  
  public set stringA(newValue: string) {
    if (((this.__backing_stringA) !== (newValue))) {
      this.__backing_stringA = newValue;
    this.__meta_stringA.fireChange();
    this.executeOnSubscribingWatches("stringA");
    }
  }
  
  public get booleanA(): boolean {
    if (((this._permissibleAddRefDepth) > (0))) {
      this.__meta_booleanA.addRef();
    }
    return this.__backing_booleanA;
  }
  
  public set booleanA(newValue: boolean) {
    if (((this.__backing_booleanA) !== (newValue))) {
      this.__backing_booleanA = newValue;
    this.__meta_booleanA.fireChange();
    this.executeOnSubscribingWatches("booleanA");
    }
  }
  
  public get arrayA(): Array<number> {
    if (((this._permissibleAddRefDepth) > (0))) {
      this.__meta_arrayA.addRef();
    }
    setObservationDepth(this.__backing_arrayA.value, ((this._permissibleAddRefDepth) - (1)));
    return this.__backing_arrayA.value;
  }
  
  public set arrayA(newValue: Array<number>) {
    if (((this.__backing_arrayA.value) !== (newValue))) {
      this.__backing_arrayA.value = newValue;
    this.__meta_arrayA.fireChange();
    this.executeOnSubscribingWatches("arrayA");
    }
  }
  
  public get objectA(): Object {
    if (((this._permissibleAddRefDepth) > (0))) {
      this.__meta_objectA.addRef();
    }
    setObservationDepth(this.__backing_objectA.value, ((this._permissibleAddRefDepth) - (1)));
    return this.__backing_objectA.value;
  }
  
  public set objectA(newValue: Object) {
    if (((this.__backing_objectA.value) !== (newValue))) {
      this.__backing_objectA.value = newValue;
    this.__meta_objectA.fireChange();
    this.executeOnSubscribingWatches("objectA");
    }
  }
  
  public get dateA(): Date {
    if (((this._permissibleAddRefDepth) > (0))) {
      this.__meta_dateA.addRef();
    }
    setObservationDepth(this.__backing_dateA.value, ((this._permissibleAddRefDepth) - (1)));
    return this.__backing_dateA.value;
  }
  
  public set dateA(newValue: Date) {
    if (((this.__backing_dateA.value) !== (newValue))) {
      this.__backing_dateA.value = newValue;
    this.__meta_dateA.fireChange();
    this.executeOnSubscribingWatches("dateA");
    }
  }
  
  public get setA(): Set<number> {
    if (((this._permissibleAddRefDepth) > (0))) {
      this.__meta_setA.addRef();
    }
    setObservationDepth(this.__backing_setA.value, ((this._permissibleAddRefDepth) - (1)));
    return this.__backing_setA.value;
  }
  
  public set setA(newValue: Set<number>) {
    if (((this.__backing_setA.value) !== (newValue))) {
      this.__backing_setA.value = newValue;
    this.__meta_setA.fireChange();
    this.executeOnSubscribingWatches("setA");
    }
  }
  
  public get mapA(): Map<number, string> {
    if (((this._permissibleAddRefDepth) > (0))) {
      this.__meta_mapA.addRef();
    }
    setObservationDepth(this.__backing_mapA.value, ((this._permissibleAddRefDepth) - (1)));
    return this.__backing_mapA.value;
  }
  
  public set mapA(newValue: Map<number, string>) {
    if (((this.__backing_mapA.value) !== (newValue))) {
      this.__backing_mapA.value = newValue;
    this.__meta_mapA.fireChange();
    this.executeOnSubscribingWatches("mapA");
    }
  }
  
  public get unionA(): string | undefined {
    if (((this._permissibleAddRefDepth) > (0))) {
      this.__meta_unionA.addRef();
    }
    return this.__backing_unionA;
  }
  
  public set unionA(newValue: string | undefined) {
    if (((this.__backing_unionA) !== (newValue))) {
      this.__backing_unionA = newValue;
    this.__meta_unionA.fireChange();
    this.executeOnSubscribingWatches("unionA");
    }
  }
  
  public get classA(): Person {
    if (((this._permissibleAddRefDepth) > (0))) {
      this.__meta_classA.addRef();
    }
    setObservationDepth(this.__backing_classA.value, ((this._permissibleAddRefDepth) - (1)));
    return this.__backing_classA.value;
  }
  
  public set classA(newValue: Person) {
    if (((this.__backing_classA.value) !== (newValue))) {
      this.__backing_classA.value = newValue;
    this.__meta_classA.fireChange();
    this.executeOnSubscribingWatches("classA");
    }
  }
  
  public get enumA(): Status {
    if (((this._permissibleAddRefDepth) > (0))) {
      this.__meta_enumA.addRef();
    }
    setObservationDepth(this.__backing_enumA.value, ((this._permissibleAddRefDepth) - (1)));
    return this.__backing_enumA.value;
  }
  
  public set enumA(newValue: Status) {
    if (((this.__backing_enumA.value) !== (newValue))) {
      this.__backing_enumA.value = newValue;
    this.__meta_enumA.fireChange();
    this.executeOnSubscribingWatches("enumA");
    }
  }
  
}

@Entry({useSharedStorage:false,storage:"",routeName:""}) @Component({freezeWhenInactive:false}) final class MyStateSample extends CustomComponent<MyStateSample, __Options_MyStateSample> {
  public __initializeStruct(initializers: __Options_MyStateSample | undefined, @memo() content: (()=> void) | undefined): void {}
  
  public __updateStruct(initializers: __Options_MyStateSample | undefined): void {}
  
  @memo() public _build(@memo() style: ((instance: MyStateSample)=> MyStateSample) | undefined, @memo() content: (()=> void) | undefined, initializers: __Options_MyStateSample | undefined): void {}
  
  private constructor() {}
  
}

@Entry({useSharedStorage:false,storage:"",routeName:""}) @Component({freezeWhenInactive:false}) export interface __Options_MyStateSample {
  
}

class __EntryWrapper extends EntryPoint {
  @memo() public entry(): void {
    MyStateSample._instantiateImpl(undefined, (() => {
      return new MyStateSample();
    }));
  }
  
  public constructor() {}
  
}
`;

function testObservedOnlyTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test observed track transform with complex type',
    [observedTrackTransform, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testObservedOnlyTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
