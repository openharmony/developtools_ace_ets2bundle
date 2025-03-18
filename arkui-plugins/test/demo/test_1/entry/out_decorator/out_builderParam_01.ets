[AFTER STRUCT SCRIPT] script:  
import { CustomComponent as CustomComponent } from "@ohos.arkui.component.customComponent";

import { Text as Text, Component as Component } from "@ohos.arkui.component";

import { State as State, Prop as Prop, StorageProp as StorageProp, Provide as Provide, Consume as Consume } from "@ohos.arkui.stateManagement.common";

import { memo as memo } from "@ohos.arkui.StateManagement.runtime";

import { MutableState as MutableState, observableProxy as observableProxy, stateOf as stateOf, propState as propState, AppStorageLinkState as AppStorageLinkState, contextLocalStateOf as contextLocalStateOf, contextLocal as contextLocal } from "@ohos.arkui.stateManagement.runtime";

import { AppStorage as AppStorage } from "@ohos.arkui.stateManagement.storage";

import { Builder as Builder, BuilderParam as BuilderParam } from "@ohos.arkui.component.common";

abstract class ETSGLOBAL {
  public static main() {}
  
  public static _$init$_() {}
  
  @memo()public static overBuilder() {}
  
  
}

class MyStateSample extends CustomComponent<MyStateSample, __Options_MyStateSample> {
  public __initializeStruct(initializers: __Options_MyStateSample | undefined, @memo()content: (()=> void) | undefined): void {
    (this).__backing_builder = content
    (this).__backing_builder2 = content
  }
  
  @memo()public __updateStruct(initializers: __Options_MyStateSample | undefined): void {
    (this).__backing_builder = initializers?.builder
    (this).__backing_builder2 = initializers?.builder2
  }
  
  private __backing_builder?: Function;
  
  private get builder(): Function {
    return (this).__backing_builder;
  }
  
  private set builder(@memo()value: Function) {
    (this).__backing_builder = value
  }
  
  private __backing_builder2?: Function;
  
  private get builder2(): Function {
    return (this).__backing_builder2;
  }
  
  private set builder2(@memo()value: Function) {
    (this).__backing_builder2 = value
  }
  
  @memo()public localBuilder() {}
  
  @memo()protected _build(@memo()style: ((instance: MyStateSample)=> MyStateSample) | undefined, @memo()content: (()=> void) | undefined, initializers: __Options_MyStateSample | undefined): void {
    Text("Hello World");
  }
  
  public constructor() {}
  
}

interface __Options_MyStateSample {
  @memo()abstract get builder(): Function
  @memo()abstract set builder(builder?: Function)
  @memo()abstract get builder2(): Function
  @memo()abstract set builder2(builder2?: Function)
  
}


[UI PLUGIN] AFTER CHECKED EXIT
plugin checked finished
[TS WRAPPER] PROCEED TO STATE:  7
TypeError: Type '() => void|undefined' cannot be assigned to type 'Function'
TypeError: Type '() => void|undefined' cannot be assigned to type 'Function'
TypeError: Value is possibly nullish.
TypeError: Value is possibly nullish.
TypeError: Method _build(style: (instance: MyStateSample) => MyStateSample|undefined, content: () => void|undefined, initializers: __Options_MyStateSample|undefined): void in MyStateSample not overriding any method [new.ets:26:22]
"/home/y00896775/workspace/blue_oh_code/code-1108/out/sdk/ohos-sdk/linux/ets/ets1.2/build-tools/ets2panda/bin/ark_link" --output "/home/y00896775/workspace/blue_oh_code/code-1108/developtools/ace_ets2bundle/arkui-plugins/test/demo/test_1/dist/modules_static.abc" -- @"demo/test_1/dist/cache/fileInfo.txt"
