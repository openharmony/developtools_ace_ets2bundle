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

import { IObservedObject as IObservedObject } from "arkui.stateManagement.decorator";

import { OBSERVE as OBSERVE } from "arkui.stateManagement.decorator";

import { IMutableStateMeta as IMutableStateMeta } from "arkui.stateManagement.decorator";

import { RenderIdType as RenderIdType } from "arkui.stateManagement.decorator";

import { WatchIdType as WatchIdType } from "arkui.stateManagement.decorator";

import { ISubscribedWatches as ISubscribedWatches } from "arkui.stateManagement.decorator";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

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

@Observed() class mixed1 implements IObservedObject, ISubscribedWatches {
  private subscribedWatches: ISubscribedWatches = STATE_MGMT_FACTORY.makeSubscribedWatches();
  
  public addWatchSubscriber(watchId: WatchIdType): void {
    this.subscribedWatches.addWatchSubscriber(watchId);
  }
  
  public removeWatchSubscriber(watchId: WatchIdType): boolean {
    return this.subscribedWatches.removeWatchSubscriber(watchId);
  }
  
  public executeOnSubscribingWatches(propertyName: string): void {
    this.subscribedWatches.executeOnSubscribingWatches(propertyName);
  }
  
  private ____V1RenderId: RenderIdType = 0;
  
  public setV1RenderId(renderId: RenderIdType): void {
    this.____V1RenderId = renderId;
  }
  
  protected conditionalAddRef(meta: IMutableStateMeta): void {
    if (OBSERVE.shouldAddRef(this.____V1RenderId)) {
      meta.addRef();
    }
  }
  
  private __backing_numA: number = 33;
  
  private __meta_numA: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta();
  
  private __backing_stringA: string = "AA";
  
  private __meta_stringA: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta();
  
  private __backing_booleanA: boolean = true;
  
  private __meta_booleanA: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta();
  
  private __backing_arrayA: Array<number> = [1, 2, 3];
  
  private __meta_arrayA: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta();
  
  private __backing_objectA: Object = {};
  
  private __meta_objectA: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta();
  
  private __backing_dateA: Date = new Date("2021-08-08");
  
  private __meta_dateA: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta();
  
  private __backing_setA: Set<number> = new Set<number>();
  
  private __meta_setA: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta();
  
  private __backing_mapA: Map<number, string> = new Map<number, string>();
  
  private __meta_mapA: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta();
  
  private __backing_unionA: string | undefined = "";
  
  private __meta_unionA: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta();
  
  private __backing_classA: Person = new Person();
  
  private __meta_classA: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta();
  
  private __backing_enumA: Status = Status.NotFound;
  
  private __meta_enumA: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta();
  
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
    this.conditionalAddRef(this.__meta_numA);
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
    this.conditionalAddRef(this.__meta_stringA);
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
    this.conditionalAddRef(this.__meta_booleanA);
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
    this.conditionalAddRef(this.__meta_arrayA);
    return this.__backing_arrayA;
  }
  
  public set arrayA(newValue: Array<number>) {
    if (((this.__backing_arrayA) !== (newValue))) {
      this.__backing_arrayA = newValue;
      this.__meta_arrayA.fireChange();
      this.executeOnSubscribingWatches("arrayA");
    }
  }
  
  public get objectA(): Object {
    this.conditionalAddRef(this.__meta_objectA);
    return this.__backing_objectA;
  }
  
  public set objectA(newValue: Object) {
    if (((this.__backing_objectA) !== (newValue))) {
      this.__backing_objectA = newValue;
      this.__meta_objectA.fireChange();
      this.executeOnSubscribingWatches("objectA");
    }
  }
  
  public get dateA(): Date {
    this.conditionalAddRef(this.__meta_dateA);
    return this.__backing_dateA;
  }
  
  public set dateA(newValue: Date) {
    if (((this.__backing_dateA) !== (newValue))) {
      this.__backing_dateA = newValue;
      this.__meta_dateA.fireChange();
      this.executeOnSubscribingWatches("dateA");
    }
  }
  
  public get setA(): Set<number> {
    this.conditionalAddRef(this.__meta_setA);
    return this.__backing_setA;
  }
  
  public set setA(newValue: Set<number>) {
    if (((this.__backing_setA) !== (newValue))) {
      this.__backing_setA = newValue;
      this.__meta_setA.fireChange();
      this.executeOnSubscribingWatches("setA");
    }
  }
  
  public get mapA(): Map<number, string> {
    this.conditionalAddRef(this.__meta_mapA);
    return this.__backing_mapA;
  }
  
  public set mapA(newValue: Map<number, string>) {
    if (((this.__backing_mapA) !== (newValue))) {
      this.__backing_mapA = newValue;
      this.__meta_mapA.fireChange();
      this.executeOnSubscribingWatches("mapA");
    }
  }
  
  public get unionA(): string | undefined {
    this.conditionalAddRef(this.__meta_unionA);
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
    this.conditionalAddRef(this.__meta_classA);
    return this.__backing_classA;
  }
  
  public set classA(newValue: Person) {
    if (((this.__backing_classA) !== (newValue))) {
      this.__backing_classA = newValue;
      this.__meta_classA.fireChange();
      this.executeOnSubscribingWatches("classA");
    }
  }
  
  public get enumA(): Status {
    this.conditionalAddRef(this.__meta_enumA);
    return this.__backing_enumA;
  }
  
  public set enumA(newValue: Status) {
    if (((this.__backing_enumA) !== (newValue))) {
      this.__backing_enumA = newValue;
      this.__meta_enumA.fireChange();
      this.executeOnSubscribingWatches("enumA");
    }
  }
  
}

@Observed() class mixed2 implements IObservedObject, ISubscribedWatches {
  private subscribedWatches: ISubscribedWatches = STATE_MGMT_FACTORY.makeSubscribedWatches();
  
  public addWatchSubscriber(watchId: WatchIdType): void {
    this.subscribedWatches.addWatchSubscriber(watchId);
  }
  
  public removeWatchSubscriber(watchId: WatchIdType): boolean {
    return this.subscribedWatches.removeWatchSubscriber(watchId);
  }
  
  public executeOnSubscribingWatches(propertyName: string): void {
    this.subscribedWatches.executeOnSubscribingWatches(propertyName);
  }
  
  private ____V1RenderId: RenderIdType = 0;
  
  public setV1RenderId(renderId: RenderIdType): void {
    this.____V1RenderId = renderId;
  }
  
  protected conditionalAddRef(meta: IMutableStateMeta): void {
    if (OBSERVE.shouldAddRef(this.____V1RenderId)) {
      meta.addRef();
    }
  }
  
  private __meta: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta();
  
  private __backing_numA: number = 33;
  
  private __backing_stringA: string = "AA";
  
  private __backing_booleanA: boolean = true;
  
  private __backing_arrayA: Array<number> = [1, 2, 3];
  
  private __backing_objectA: Object = {};
  
  private __backing_dateA: Date = new Date("2021-08-08");
  
  private __backing_setA: Set<number> = new Set<number>();
  
  private __backing_mapA: Map<number, string> = new Map<number, string>();
  
  private __backing_unionA: string | undefined = "";
  
  private __backing_classA: Person = new Person();
  
  private __backing_enumA: Status = Status.NotFound;
  
  public constructor() {}
  
  public get numA(): number {
    this.conditionalAddRef(this.__meta);
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
    this.conditionalAddRef(this.__meta);
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
    this.conditionalAddRef(this.__meta);
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
    this.conditionalAddRef(this.__meta);
    return this.__backing_arrayA;
  }
  
  public set arrayA(newValue: Array<number>) {
    if (((this.__backing_arrayA) !== (newValue))) {
      this.__backing_arrayA = newValue;
      this.__meta.fireChange();
      this.executeOnSubscribingWatches("arrayA");
    }
  }
  
  public get objectA(): Object {
    this.conditionalAddRef(this.__meta);
    return this.__backing_objectA;
  }
  
  public set objectA(newValue: Object) {
    if (((this.__backing_objectA) !== (newValue))) {
      this.__backing_objectA = newValue;
      this.__meta.fireChange();
      this.executeOnSubscribingWatches("objectA");
    }
  }
  
  public get dateA(): Date {
    this.conditionalAddRef(this.__meta);
    return this.__backing_dateA;
  }
  
  public set dateA(newValue: Date) {
    if (((this.__backing_dateA) !== (newValue))) {
      this.__backing_dateA = newValue;
      this.__meta.fireChange();
      this.executeOnSubscribingWatches("dateA");
    }
  }
  
  public get setA(): Set<number> {
    this.conditionalAddRef(this.__meta);
    return this.__backing_setA;
  }
  
  public set setA(newValue: Set<number>) {
    if (((this.__backing_setA) !== (newValue))) {
      this.__backing_setA = newValue;
      this.__meta.fireChange();
      this.executeOnSubscribingWatches("setA");
    }
  }
  
  public get mapA(): Map<number, string> {
    this.conditionalAddRef(this.__meta);
    return this.__backing_mapA;
  }
  
  public set mapA(newValue: Map<number, string>) {
    if (((this.__backing_mapA) !== (newValue))) {
      this.__backing_mapA = newValue;
      this.__meta.fireChange();
      this.executeOnSubscribingWatches("mapA");
    }
  }
  
  public get unionA(): string | undefined {
    this.conditionalAddRef(this.__meta);
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
    this.conditionalAddRef(this.__meta);
    return this.__backing_classA;
  }
  
  public set classA(newValue: Person) {
    if (((this.__backing_classA) !== (newValue))) {
      this.__backing_classA = newValue;
      this.__meta.fireChange();
      this.executeOnSubscribingWatches("classA");
    }
  }
  
  public get enumA(): Status {
    this.conditionalAddRef(this.__meta);
    return this.__backing_enumA;
  }
  
  public set enumA(newValue: Status) {
    if (((this.__backing_enumA) !== (newValue))) {
      this.__backing_enumA = newValue;
      this.__meta.fireChange();
      this.executeOnSubscribingWatches("enumA");
    }
  }
  
}

class mixed3 implements IObservedObject, ISubscribedWatches {
  private subscribedWatches: ISubscribedWatches = STATE_MGMT_FACTORY.makeSubscribedWatches();
  
  public addWatchSubscriber(watchId: WatchIdType): void {
    this.subscribedWatches.addWatchSubscriber(watchId);
  }
  
  public removeWatchSubscriber(watchId: WatchIdType): boolean {
    return this.subscribedWatches.removeWatchSubscriber(watchId);
  }
  
  public executeOnSubscribingWatches(propertyName: string): void {
    this.subscribedWatches.executeOnSubscribingWatches(propertyName);
  }
  
  private ____V1RenderId: RenderIdType = 0;
  
  public setV1RenderId(renderId: RenderIdType): void {
    this.____V1RenderId = renderId;
  }
  
  protected conditionalAddRef(meta: IMutableStateMeta): void {
    if (OBSERVE.shouldAddRef(this.____V1RenderId)) {
      meta.addRef();
    }
  }
  
  private __backing_numA: number = 33;
  
  private __meta_numA: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta();
  
  private __backing_stringA: string = "AA";
  
  private __meta_stringA: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta();
  
  private __backing_booleanA: boolean = true;
  
  private __meta_booleanA: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta();
  
  private __backing_arrayA: Array<number> = [1, 2, 3];
  
  private __meta_arrayA: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta();
  
  private __backing_objectA: Object = {};
  
  private __meta_objectA: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta();
  
  private __backing_dateA: Date = new Date("2021-08-08");
  
  private __meta_dateA: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta();
  
  private __backing_setA: Set<number> = new Set<number>();
  
  private __meta_setA: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta();
  
  private __backing_mapA: Map<number, string> = new Map<number, string>();
  
  private __meta_mapA: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta();
  
  private __backing_unionA: string | undefined = "";
  
  private __meta_unionA: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta();
  
  private __backing_classA: Person = new Person();
  
  private __meta_classA: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta();
  
  private __backing_enumA: Status = Status.NotFound;
  
  private __meta_enumA: IMutableStateMeta = STATE_MGMT_FACTORY.makeMutableStateMeta();
  
  public constructor() {}
  
  public get numA(): number {
    this.conditionalAddRef(this.__meta_numA);
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
    this.conditionalAddRef(this.__meta_stringA);
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
    this.conditionalAddRef(this.__meta_booleanA);
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
    this.conditionalAddRef(this.__meta_arrayA);
    return this.__backing_arrayA;
  }
  
  public set arrayA(newValue: Array<number>) {
    if (((this.__backing_arrayA) !== (newValue))) {
      this.__backing_arrayA = newValue;
      this.__meta_arrayA.fireChange();
      this.executeOnSubscribingWatches("arrayA");
    }
  }
  
  public get objectA(): Object {
    this.conditionalAddRef(this.__meta_objectA);
    return this.__backing_objectA;
  }
  
  public set objectA(newValue: Object) {
    if (((this.__backing_objectA) !== (newValue))) {
      this.__backing_objectA = newValue;
      this.__meta_objectA.fireChange();
      this.executeOnSubscribingWatches("objectA");
    }
  }
  
  public get dateA(): Date {
    this.conditionalAddRef(this.__meta_dateA);
    return this.__backing_dateA;
  }
  
  public set dateA(newValue: Date) {
    if (((this.__backing_dateA) !== (newValue))) {
      this.__backing_dateA = newValue;
      this.__meta_dateA.fireChange();
      this.executeOnSubscribingWatches("dateA");
    }
  }
  
  public get setA(): Set<number> {
    this.conditionalAddRef(this.__meta_setA);
    return this.__backing_setA;
  }
  
  public set setA(newValue: Set<number>) {
    if (((this.__backing_setA) !== (newValue))) {
      this.__backing_setA = newValue;
      this.__meta_setA.fireChange();
      this.executeOnSubscribingWatches("setA");
    }
  }
  
  public get mapA(): Map<number, string> {
    this.conditionalAddRef(this.__meta_mapA);
    return this.__backing_mapA;
  }
  
  public set mapA(newValue: Map<number, string>) {
    if (((this.__backing_mapA) !== (newValue))) {
      this.__backing_mapA = newValue;
      this.__meta_mapA.fireChange();
      this.executeOnSubscribingWatches("mapA");
    }
  }
  
  public get unionA(): string | undefined {
    this.conditionalAddRef(this.__meta_unionA);
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
    this.conditionalAddRef(this.__meta_classA);
    return this.__backing_classA;
  }
  
  public set classA(newValue: Person) {
    if (((this.__backing_classA) !== (newValue))) {
      this.__backing_classA = newValue;
      this.__meta_classA.fireChange();
      this.executeOnSubscribingWatches("classA");
    }
  }
  
  public get enumA(): Status {
    this.conditionalAddRef(this.__meta_enumA);
    return this.__backing_enumA;
  }
  
  public set enumA(newValue: Status) {
    if (((this.__backing_enumA) !== (newValue))) {
      this.__backing_enumA = newValue;
      this.__meta_enumA.fireChange();
      this.executeOnSubscribingWatches("enumA");
    }
  }
  
}

@Entry({useSharedStorage:false,storage:"",routeName:""}) @Component({freezeWhenInactive:false}) final struct MyStateSample extends CustomComponent<MyStateSample, __Options_MyStateSample> {
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
