[AFTER STRUCT SCRIPT] script:  
import { CustomComponent as CustomComponent } from "@ohos.arkui.component.customComponent";

import { Text as Text, Component as Component } from "@ohos.arkui.component";

import { State as State, Prop as Prop, StorageProp as StorageProp } from "@ohos.arkui.stateManagement.common";

import { memo as memo } from "@ohos.arkui.StateManagement.runtime";

import { MutableState as MutableState, observableProxy as observableProxy, stateOf as stateOf, propState as propState, AppStorageLinkState as AppStorageLinkState } from "@ohos.arkui.stateManagement.runtime";

import { AppStorage as AppStorage } from "@ohos.arkui.stateManagement.storage";

abstract class ETSGLOBAL {
  public static main() {}
  
  public static _$init$_() {
    AppStorage.setOrCreate("PropA1", 47);
  }
  
  
}

class Person {
  public name: string;
  
  public constructor(name: string) {
    (this).name = name;
  }
  
}

class Model {
  public value: string;
  
  public name: Person;
  
  public constructor(value: string, person: Person) {
    (this).value = value;
    (this).name = person;
  }
  
}

class MyStateSample extends CustomComponent<MyStateSample, __Options_MyStateSample> {
  public __initializeStruct(initializers: __Options_MyStateSample | undefined, @memo()content: (()=> void) | undefined): void {
    (this).__backing_appPro1 = propState<number>(AppStorageLinkState<number>("PropA1", 0.0).value)
    (this).__backing_appPro2 = propState<string>(AppStorageLinkState<string>("PropA2", "str").value)
    (this).__backing_appPro3 = propState<Date>(AppStorageLinkState<Date>("PropA3", new Date("2021-08-08")).value)
    (this).__backing_appPro4 = propState<null>(AppStorageLinkState<null>("PropA4", null).value)
    (this).__backing_appPro5 = propState<undefined>(AppStorageLinkState<undefined>("PropA5", undefined).value)
    (this).__backing_appPro6 = propState<object>(AppStorageLinkState<object>("PropA6", {}).value)
    (this).__backing_appPro7 = propState<Model>(AppStorageLinkState<Model>("PropA7", new Model("Hello", new Person("World"))).value)
  }
  
  @memo()public __updateStruct(initializers: __Options_MyStateSample | undefined): void {
    (this).__backing_appPro1.value = AppStorageLinkState<number>("PropA1", 0.0).value
    (this).__backing_appPro2.value = AppStorageLinkState<string>("PropA2", "str").value
    (this).__backing_appPro3.value = AppStorageLinkState<Date>("PropA3", new Date("2021-08-08")).value
    (this).__backing_appPro4.value = AppStorageLinkState<null>("PropA4", null).value
    (this).__backing_appPro5.value = AppStorageLinkState<undefined>("PropA5", undefined).value
    (this).__backing_appPro6.value = AppStorageLinkState<object>("PropA6", {}).value
    (this).__backing_appPro7.value = AppStorageLinkState<Model>("PropA7", new Model("Hello", new Person("World"))).value
  }
  
  private __backing_appPro1?: MutableState<number>;
  
  private get appPro1(): number {
    return (this).__backing_appPro1.value;
  }
  
  private set appPro1(value: number) {
    (this).__backing_appPro1.value = observableProxy(value)
  }
  
  private __backing_appPro2?: MutableState<string>;
  
  private get appPro2(): string {
    return (this).__backing_appPro2.value;
  }
  
  private set appPro2(value: string) {
    (this).__backing_appPro2.value = observableProxy(value)
  }
  
  private __backing_appPro3?: MutableState<Date>;
  
  private get appPro3(): Date {
    return (this).__backing_appPro3.value;
  }
  
  private set appPro3(value: Date) {
    (this).__backing_appPro3.value = observableProxy(value)
  }
  
  private __backing_appPro4?: MutableState<null>;
  
  private get appPro4(): null {
    return (this).__backing_appPro4.value;
  }
  
  private set appPro4(value: null) {
    (this).__backing_appPro4.value = observableProxy(value)
  }
  
  private __backing_appPro5?: MutableState<undefined>;
  
  private get appPro5(): undefined {
    return (this).__backing_appPro5.value;
  }
  
  private set appPro5(value: undefined) {
    (this).__backing_appPro5.value = observableProxy(value)
  }
  
  private __backing_appPro6?: MutableState<object>;
  
  private get appPro6(): object {
    return (this).__backing_appPro6.value;
  }
  
  private set appPro6(value: object) {
    (this).__backing_appPro6.value = observableProxy(value)
  }
  
  private __backing_appPro7?: MutableState<Model>;
  
  private get appPro7(): Model {
    return (this).__backing_appPro7.value;
  }
  
  private set appPro7(value: Model) {
    (this).__backing_appPro7.value = observableProxy(value)
  }
  
  @memo()protected _build(@memo()style: ((instance: MyStateSample)=> MyStateSample) | undefined, @memo()content: (()=> void) | undefined, initializers: __Options_MyStateSample | undefined): void {
    Text("Hello World");
  }
  
  public constructor() {}
  
}

class Parent extends CustomComponent<Parent, __Options_Parent> {
  public __initializeStruct(initializers: __Options_Parent | undefined, @memo()content: (()=> void) | undefined): void {
    (this).__backing_state1 = stateOf<number>(((initializers?.state1) ?? (5.8)))
    (this).__backing_state2 = stateOf<string>(((initializers?.state2) ?? ("str99999999999")))
    (this).__backing_state3 = stateOf<Model>(((initializers?.state3) ?? (new Model("Hello", new Person("World999999999999")))))
    (this).__backing_appPro6 = propState<object>(AppStorageLinkState<object>("PropA6", {}).value)
  }
  
  @memo()public __updateStruct(initializers: __Options_Parent | undefined): void {
    (this).__backing_appPro6.value = AppStorageLinkState<object>("PropA6", {}).value
  }
  
  private __backing_state1?: MutableState<number>;
  
  private get state1(): number {
    return (this).__backing_state1.value;
  }
  
  private set state1(value: number) {
    (this).__backing_state1.value = observableProxy(value)
  }
  
  private __backing_state2?: MutableState<string>;
  
  private get state2(): string {
    return (this).__backing_state2.value;
  }
  
  private set state2(value: string) {
    (this).__backing_state2.value = observableProxy(value)
  }
  
  private __backing_state3?: MutableState<Model>;
  
  private get state3(): Model {
    return (this).__backing_state3.value;
  }
  
  private set state3(value: Model) {
    (this).__backing_state3.value = observableProxy(value)
  }
  
  private __backing_appPro6?: MutableState<object>;
  
  private get appPro6(): object {
    return (this).__backing_appPro6.value;
  }
  
  private set appPro6(value: object) {
    (this).__backing_appPro6.value = observableProxy(value)
  }
  
  @memo()protected _build(@memo()style: ((instance: Parent)=> Parent) | undefined, @memo()content: (()=> void) | undefined, initializers: __Options_Parent | undefined): void {
    MyStateSample.$_instantiate(((): S => {
      return new MyStateSample();
    }), ({
      appPro1: (this).state1,
      appPro2: (this).state2,
      appPro7: (this).state3,
    } as __Options_MyStateSample));
  }
  
  public constructor() {}
  
}

interface __Options_MyStateSample {
  abstract get appPro1(): number
  abstract set appPro1(appPro1?: number)
  abstract get __backing_appPro1(): MutableState<number>
  abstract set __backing_appPro1(__backing_appPro1?: MutableState<number>)
  abstract get appPro2(): string
  abstract set appPro2(appPro2?: string)
  abstract get __backing_appPro2(): MutableState<string>
  abstract set __backing_appPro2(__backing_appPro2?: MutableState<string>)
  abstract get appPro3(): Date
  abstract set appPro3(appPro3?: Date)
  abstract get __backing_appPro3(): MutableState<Date>
  abstract set __backing_appPro3(__backing_appPro3?: MutableState<Date>)
  abstract get appPro4(): null
  abstract set appPro4(appPro4?: null)
  abstract get __backing_appPro4(): MutableState<null>
  abstract set __backing_appPro4(__backing_appPro4?: MutableState<null>)
  abstract get appPro5(): undefined
  abstract set appPro5(appPro5?: undefined)
  abstract get __backing_appPro5(): MutableState<undefined>
  abstract set __backing_appPro5(__backing_appPro5?: MutableState<undefined>)
  abstract get appPro6(): object
  abstract set appPro6(appPro6?: object)
  abstract get __backing_appPro6(): MutableState<object>
  abstract set __backing_appPro6(__backing_appPro6?: MutableState<object>)
  abstract get appPro7(): Model
  abstract set appPro7(appPro7?: Model)
  abstract get __backing_appPro7(): MutableState<Model>
  abstract set __backing_appPro7(__backing_appPro7?: MutableState<Model>)
  
}

interface __Options_Parent {
  abstract get state1(): number
  abstract set state1(state1?: number)
  abstract get __backing_state1(): MutableState<number>
  abstract set __backing_state1(__backing_state1?: MutableState<number>)
  abstract get state2(): string
  abstract set state2(state2?: string)
  abstract get __backing_state2(): MutableState<string>
  abstract set __backing_state2(__backing_state2?: MutableState<string>)
  abstract get state3(): Model
  abstract set state3(state3?: Model)
  abstract get __backing_state3(): MutableState<Model>
  abstract set __backing_state3(__backing_state3?: MutableState<Model>)
  abstract get appPro6(): object
  abstract set appPro6(appPro6?: object)
  abstract get __backing_appPro6(): MutableState<object>
  abstract set __backing_appPro6(__backing_appPro6?: MutableState<object>)
  
}


[UI PLUGIN] AFTER CHECKED EXIT
plugin checked finished
[TS WRAPPER] PROCEED TO STATE:  7
TypeError: Type 'MutableState<Model>' cannot be assigned to type 'MutableState<Model>'
TypeError: Type 'Model' cannot be assigned to type 'Model'
TypeError: Type 'Model' is not compatible with the enclosing method's return type 'Model'
TypeError: Type 'Model' cannot be assigned to type 'Model'
TypeError: Value is possibly nullish.
TypeError: Value is possibly nullish.
TypeError: Value is possibly nullish.
TypeError: Type 'MutableState<Model>' cannot be assigned to type 'MutableState<Model>'
TypeError: Type 'Model' is not compatible with the enclosing method's return type 'Model'
TypeError: Type 'Model' cannot be assigned to type 'Model'
TypeError: Method _build(style: (instance: MyStateSample) => MyStateSample|undefined, content: () => void|undefined, initializers: __Options_MyStateSample|undefined): void in MyStateSample not overriding any method [new.ets:40:22]
TypeError: Method _build(style: (instance: Parent) => Parent|undefined, content: () => void|undefined, initializers: __Options_Parent|undefined): void in Parent not overriding any method [new.ets:56:15]
TypeError: Cannot find type 'S'. [customComponent.d.ets:35:24]
"/home/y00896775/workspace/blue_oh_code/code-1108/out/sdk/ohos-sdk/linux/ets/ets1.2/build-tools/ets2panda/bin/ark_link" --output "/home/y00896775/workspace/blue_oh_code/code-1108/developtools/ace_ets2bundle/arkui-plugins/test/demo/test_1/dist/modules_static.abc" -- @"demo/test_1/dist/cache/fileInfo.txt"
