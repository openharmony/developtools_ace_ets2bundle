[AFTER STRUCT SCRIPT] script:  
import { CustomComponent as CustomComponent } from "@ohos.arkui.component.customComponent";

import { Text as Text, Component as Component } from "@ohos.arkui.component";

import { State as State, Prop as Prop, StorageProp as StorageProp, Provide as Provide, Consume as Consume } from "@ohos.arkui.stateManagement.common";

import { memo as memo } from "@ohos.arkui.StateManagement.runtime";

import { MutableState as MutableState, observableProxy as observableProxy, stateOf as stateOf, propState as propState, AppStorageLinkState as AppStorageLinkState, contextLocalStateOf as contextLocalStateOf, contextLocal as contextLocal } from "@ohos.arkui.stateManagement.runtime";

import { AppStorage as AppStorage } from "@ohos.arkui.stateManagement.storage";

abstract class ETSGLOBAL {
  public static main() {}
  
  public static _$init$_() {}
  
  
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
  public __initializeStruct(initializers: __Options_MyStateSample | undefined, @memo()content: (()=> void) | undefined): void {}
  
  @memo()protected _build(@memo()style: ((instance: MyStateSample)=> MyStateSample) | undefined, @memo()content: (()=> void) | undefined, initializers: __Options_MyStateSample | undefined): void {
    Text("Hello World");
  }
  
  public constructor() {}
  
}

class ConsumeExample extends CustomComponent<ConsumeExample, __Options_ConsumeExample> {
  public __initializeStruct(initializers: __Options_ConsumeExample | undefined, @memo()content: (()=> void) | undefined): void {
    (this).__backing_x = contextLocal<string>("name")
    (this).__backing_prov1 = contextLocal<number>("name1")
    (this).__backing_prov2 = contextLocal<string>("name2")
    (this).__backing_prov3 = contextLocal<Date>("name3")
    (this).__backing_prov4 = contextLocal<null>("name4")
    (this).__backing_prov5 = contextLocal<undefined>("name5")
    (this).__backing_prov6 = contextLocal<object>("name6")
    (this).__backing_prov7 = contextLocal<Model>("name7")
  }
  
  private __backing_x?: MutableState<string>;
  
  private get x(): string {
    return (this).__backing_x.value;
  }
  
  private set x(value: string) {
    (this).__backing_x.value = observableProxy(value)
  }
  
  private __backing_prov1?: MutableState<number>;
  
  private get prov1(): number {
    return (this).__backing_prov1.value;
  }
  
  private set prov1(value: number) {
    (this).__backing_prov1.value = observableProxy(value)
  }
  
  private __backing_prov2?: MutableState<string>;
  
  private get prov2(): string {
    return (this).__backing_prov2.value;
  }
  
  private set prov2(value: string) {
    (this).__backing_prov2.value = observableProxy(value)
  }
  
  private __backing_prov3?: MutableState<Date>;
  
  private get prov3(): Date {
    return (this).__backing_prov3.value;
  }
  
  private set prov3(value: Date) {
    (this).__backing_prov3.value = observableProxy(value)
  }
  
  private __backing_prov4?: MutableState<null>;
  
  private get prov4(): null {
    return (this).__backing_prov4.value;
  }
  
  private set prov4(value: null) {
    (this).__backing_prov4.value = observableProxy(value)
  }
  
  private __backing_prov5?: MutableState<undefined>;
  
  private get prov5(): undefined {
    return (this).__backing_prov5.value;
  }
  
  private set prov5(value: undefined) {
    (this).__backing_prov5.value = observableProxy(value)
  }
  
  private __backing_prov6?: MutableState<object>;
  
  private get prov6(): object {
    return (this).__backing_prov6.value;
  }
  
  private set prov6(value: object) {
    (this).__backing_prov6.value = observableProxy(value)
  }
  
  private __backing_prov7?: MutableState<Model>;
  
  private get prov7(): Model {
    return (this).__backing_prov7.value;
  }
  
  private set prov7(value: Model) {
    (this).__backing_prov7.value = observableProxy(value)
  }
  
  @memo()protected _build(@memo()style: ((instance: ConsumeExample)=> ConsumeExample) | undefined, @memo()content: (()=> void) | undefined, initializers: __Options_ConsumeExample | undefined): void {
    Text((this).x);
  }
  
  public constructor() {}
  
}

interface __Options_MyStateSample {
  
}

interface __Options_ConsumeExample {
  abstract get x(): string
  abstract set x(x?: string)
  abstract get __backing_x(): MutableState<string>
  abstract set __backing_x(__backing_x?: MutableState<string>)
  abstract get prov1(): number
  abstract set prov1(prov1?: number)
  abstract get __backing_prov1(): MutableState<number>
  abstract set __backing_prov1(__backing_prov1?: MutableState<number>)
  abstract get prov2(): string
  abstract set prov2(prov2?: string)
  abstract get __backing_prov2(): MutableState<string>
  abstract set __backing_prov2(__backing_prov2?: MutableState<string>)
  abstract get prov3(): Date
  abstract set prov3(prov3?: Date)
  abstract get __backing_prov3(): MutableState<Date>
  abstract set __backing_prov3(__backing_prov3?: MutableState<Date>)
  abstract get prov4(): null
  abstract set prov4(prov4?: null)
  abstract get __backing_prov4(): MutableState<null>
  abstract set __backing_prov4(__backing_prov4?: MutableState<null>)
  abstract get prov5(): undefined
  abstract set prov5(prov5?: undefined)
  abstract get __backing_prov5(): MutableState<undefined>
  abstract set __backing_prov5(__backing_prov5?: MutableState<undefined>)
  abstract get prov6(): object
  abstract set prov6(prov6?: object)
  abstract get __backing_prov6(): MutableState<object>
  abstract set __backing_prov6(__backing_prov6?: MutableState<object>)
  abstract get prov7(): Model
  abstract set prov7(prov7?: Model)
  abstract get __backing_prov7(): MutableState<Model>
  abstract set __backing_prov7(__backing_prov7?: MutableState<Model>)
  
}


TypeError: Type 'MutableState<Model>' cannot be assigned to type 'MutableState<Model>'
TypeError: Method _build(style: (instance: MyStateSample) => MyStateSample|undefined, content: () => void|undefined, initializers: __Options_MyStateSample|undefined): void in MyStateSample not overriding any method [new.ets:38:22]
Warning: Property 'x' might not have been initialized. [new.ets:46:22]
