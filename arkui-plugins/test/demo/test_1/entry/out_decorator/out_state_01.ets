[AFTER STRUCT SCRIPT] script:  
import { CustomComponent as CustomComponent } from "@ohos.arkui.component.customComponent";

import { Text as Text, Component as Component } from "@ohos.arkui.component";

import { State as State } from "@ohos.arkui.stateManagement.common";

import { memo as memo } from "@ohos.arkui.StateManagement.runtime";

import { MutableState as MutableState, observableProxy as observableProxy, stateOf as stateOf } from "@ohos.arkui.stateManagement.runtime";

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
    (this).__backing_state1 = stateOf<number>(((initializers?.state1) ?? (0.0)))
    (this).__backing_state2 = stateOf<string>(((initializers?.state2) ?? ("str")))
    (this).__backing_state3 = stateOf<Date>(((initializers?.state3) ?? (new Date("2021-08-08"))))
    (this).__backing_state4 = stateOf<null>(((initializers?.state4) ?? (null)))
    (this).__backing_state5 = stateOf<undefined>(((initializers?.state5) ?? (undefined)))
    (this).__backing_state6 = stateOf<object>(((initializers?.state6) ?? ({})))
    (this).__backing_state7 = stateOf<Model>(((initializers?.state7) ?? (new Model("Hello", new Person("World")))))
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
  
  private __backing_state3?: MutableState<Date>;
  
  private get state3(): Date {
    return (this).__backing_state3.value;
  }
  
  private set state3(value: Date) {
    (this).__backing_state3.value = observableProxy(value)
  }
  
  private __backing_state4?: MutableState<null>;
  
  private get state4(): null {
    return (this).__backing_state4.value;
  }
  
  private set state4(value: null) {
    (this).__backing_state4.value = observableProxy(value)
  }
  
  private __backing_state5?: MutableState<undefined>;
  
  private get state5(): undefined {
    return (this).__backing_state5.value;
  }
  
  private set state5(value: undefined) {
    (this).__backing_state5.value = observableProxy(value)
  }
  
  private __backing_state6?: MutableState<object>;
  
  private get state6(): object {
    return (this).__backing_state6.value;
  }
  
  private set state6(value: object) {
    (this).__backing_state6.value = observableProxy(value)
  }
  
  private __backing_state7?: MutableState<Model>;
  
  private get state7(): Model {
    return (this).__backing_state7.value;
  }
  
  private set state7(value: Model) {
    (this).__backing_state7.value = observableProxy(value)
  }
  
  @memo()protected _build(@memo()style: ((instance: MyStateSample)=> MyStateSample) | undefined, @memo()content: (()=> void) | undefined, initializers: __Options_MyStateSample | undefined): void {
    Text("Hello World");
  }
  
  public constructor() {}
  
}

interface __Options_MyStateSample {
  abstract get state1(): number
  abstract set state1(state1?: number)
  abstract get __backing_state1(): MutableState<number>
  abstract set __backing_state1(__backing_state1?: MutableState<number>)
  abstract get state2(): string
  abstract set state2(state2?: string)
  abstract get __backing_state2(): MutableState<string>
  abstract set __backing_state2(__backing_state2?: MutableState<string>)
  abstract get state3(): Date
  abstract set state3(state3?: Date)
  abstract get __backing_state3(): MutableState<Date>
  abstract set __backing_state3(__backing_state3?: MutableState<Date>)
  abstract get state4(): null
  abstract set state4(state4?: null)
  abstract get __backing_state4(): MutableState<null>
  abstract set __backing_state4(__backing_state4?: MutableState<null>)
  abstract get state5(): undefined
  abstract set state5(state5?: undefined)
  abstract get __backing_state5(): MutableState<undefined>
  abstract set __backing_state5(__backing_state5?: MutableState<undefined>)
  abstract get state6(): object
  abstract set state6(state6?: object)
  abstract get __backing_state6(): MutableState<object>
  abstract set __backing_state6(__backing_state6?: MutableState<object>)
  abstract get state7(): Model
  abstract set state7(state7?: Model)
  abstract get __backing_state7(): MutableState<Model>
  abstract set __backing_state7(__backing_state7?: MutableState<Model>)
  
}


[UI PLUGIN] AFTER CHECKED EXIT
plugin checked finished
[TS WRAPPER] PROCEED TO STATE:  7
TypeError: Value is possibly nullish.
TypeError: Value is possibly nullish.
TypeError: Value is possibly nullish.
TypeError: Value is possibly nullish.
TypeError: Value is possibly nullish.
TypeError: Value is possibly nullish.
TypeError: Value is possibly nullish.
TypeError: Type 'MutableState<Model>' cannot be assigned to type 'MutableState<Model>'
TypeError: Type 'Model' is not compatible with the enclosing method's return type 'Model'
TypeError: Type 'Model' cannot be assigned to type 'Model'
TypeError: Method _build(style: (instance: MyStateSample) => MyStateSample|undefined, content: () => void|undefined, initializers: __Options_MyStateSample|undefined): void in MyStateSample not overriding any method [new.ets:37:22]
"/home/y00896775/workspace/blue_oh_code/code-1108/out/sdk/ohos-sdk/linux/ets/ets1.2/build-tools/ets2panda/bin/ark_link" --output "/home/y00896775/workspace/blue_oh_code/code-1108/developtools/ace_ets2bundle/arkui-plugins/test/demo/test_1/dist/modules_static.abc" -- @"demo/test_1/dist/cache/fileInfo.txt"
