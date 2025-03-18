[AFTER STRUCT SCRIPT] script:  
import { CustomComponent as CustomComponent } from "@ohos.arkui.component.customComponent";

import { Text as Text, Component as Component } from "@ohos.arkui.component";

import { State as State, Prop as Prop } from "@ohos.arkui.stateManagement.common";

import { memo as memo } from "@ohos.arkui.StateManagement.runtime";

import { MutableState as MutableState, observableProxy as observableProxy, stateOf as stateOf, propState as propState } from "@ohos.arkui.stateManagement.runtime";

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
  public __initializeStruct(initializers: __Options_MyStateSample | undefined, @memo()content: (()=> void) | undefined): void {
    (this).__backing_pro1 = propState<number>(0.0)
    (this).__backing_pro2 = propState<string>("str")
    (this).__backing_pro3 = propState<Date>(new Date("2021-08-08"))
    (this).__backing_pro4 = propState<null>(null)
    (this).__backing_pro5 = propState<undefined>(undefined)
    (this).__backing_pro6 = propState<object>({})
    (this).__backing_pro7 = propState<Model>(new Model("Hello", new Person("World")))
  }
  
  @memo()public __updateStruct(initializers: __Options_MyStateSample | undefined): void {
    (this).__backing_pro1.value = initializers?.pro1
    (this).__backing_pro2.value = initializers?.pro2
    (this).__backing_pro3.value = initializers?.pro3
    (this).__backing_pro4.value = initializers?.pro4
    (this).__backing_pro5.value = initializers?.pro5
    (this).__backing_pro6.value = initializers?.pro6
    (this).__backing_pro7.value = initializers?.pro7
  }
  
  private __backing_pro1?: MutableState<number>;
  
  private get pro1(): number {
    return (this).__backing_pro1.value;
  }
  
  private set pro1(value: number) {
    (this).__backing_pro1.value = observableProxy(value)
  }
  
  private __backing_pro2?: MutableState<string>;
  
  private get pro2(): string {
    return (this).__backing_pro2.value;
  }
  
  private set pro2(value: string) {
    (this).__backing_pro2.value = observableProxy(value)
  }
  
  private __backing_pro3?: MutableState<Date>;
  
  private get pro3(): Date {
    return (this).__backing_pro3.value;
  }
  
  private set pro3(value: Date) {
    (this).__backing_pro3.value = observableProxy(value)
  }
  
  private __backing_pro4?: MutableState<null>;
  
  private get pro4(): null {
    return (this).__backing_pro4.value;
  }
  
  private set pro4(value: null) {
    (this).__backing_pro4.value = observableProxy(value)
  }
  
  private __backing_pro5?: MutableState<undefined>;
  
  private get pro5(): undefined {
    return (this).__backing_pro5.value;
  }
  
  private set pro5(value: undefined) {
    (this).__backing_pro5.value = observableProxy(value)
  }
  
  private __backing_pro6?: MutableState<object>;
  
  private get pro6(): object {
    return (this).__backing_pro6.value;
  }
  
  private set pro6(value: object) {
    (this).__backing_pro6.value = observableProxy(value)
  }
  
  private __backing_pro7?: MutableState<Model>;
  
  private get pro7(): Model {
    return (this).__backing_pro7.value;
  }
  
  private set pro7(value: Model) {
    (this).__backing_pro7.value = observableProxy(value)
  }
  
  @memo()protected _build(@memo()style: ((instance: MyStateSample)=> MyStateSample) | undefined, @memo()content: (()=> void) | undefined, initializers: __Options_MyStateSample | undefined): void {
    Text("Hello World");
  }
  
  public constructor() {}
  
}

interface __Options_MyStateSample {
  abstract get pro1(): number
  abstract set pro1(pro1?: number)
  abstract get __backing_pro1(): MutableState<number>
  abstract set __backing_pro1(__backing_pro1?: MutableState<number>)
  abstract get pro2(): string
  abstract set pro2(pro2?: string)
  abstract get __backing_pro2(): MutableState<string>
  abstract set __backing_pro2(__backing_pro2?: MutableState<string>)
  abstract get pro3(): Date
  abstract set pro3(pro3?: Date)
  abstract get __backing_pro3(): MutableState<Date>
  abstract set __backing_pro3(__backing_pro3?: MutableState<Date>)
  abstract get pro4(): null
  abstract set pro4(pro4?: null)
  abstract get __backing_pro4(): MutableState<null>
  abstract set __backing_pro4(__backing_pro4?: MutableState<null>)
  abstract get pro5(): undefined
  abstract set pro5(pro5?: undefined)
  abstract get __backing_pro5(): MutableState<undefined>
  abstract set __backing_pro5(__backing_pro5?: MutableState<undefined>)
  abstract get pro6(): object
  abstract set pro6(pro6?: object)
  abstract get __backing_pro6(): MutableState<object>
  abstract set __backing_pro6(__backing_pro6?: MutableState<object>)
  abstract get pro7(): Model
  abstract set pro7(pro7?: Model)
  abstract get __backing_pro7(): MutableState<Model>
  abstract set __backing_pro7(__backing_pro7?: MutableState<Model>)
  
}


[UI PLUGIN] AFTER CHECKED EXIT
plugin checked finished
[TS WRAPPER] PROCEED TO STATE:  7
TypeError: Type 'MutableState<Model>' cannot be assigned to type 'MutableState<Model>'
TypeError: Value is possibly nullish.
TypeError: Value is possibly nullish.
TypeError: Value is possibly nullish.
TypeError: Value is possibly nullish.
TypeError: Value is possibly nullish.
TypeError: Value is possibly nullish.
TypeError: Value is possibly nullish.
TypeError: Type 'Model' is not compatible with the enclosing method's return type 'Model'
TypeError: Type 'Model' cannot be assigned to type 'Model'
TypeError: Method _build(style: (instance: MyStateSample) => MyStateSample|undefined, content: () => void|undefined, initializers: __Options_MyStateSample|undefined): void in MyStateSample not overriding any method [new.ets:37:22]
"/home/y00896775/workspace/blue_oh_code/code-1108/out/sdk/ohos-sdk/linux/ets/ets1.2/build-tools/ets2panda/bin/ark_link" --output "/home/y00896775/workspace/blue_oh_code/code-1108/developtools/ace_ets2bundle/arkui-plugins/test/demo/test_1/dist/modules_static.abc" -- @"demo/test_1/dist/cache/fileInfo.txt"
