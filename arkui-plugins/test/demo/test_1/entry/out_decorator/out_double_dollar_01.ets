[AFTER STRUCT SCRIPT] script:  
import { CustomComponent as CustomComponent } from "@ohos.arkui.component.customComponent";

import { Text as Text, Component as Component } from "@ohos.arkui.component";

import { State as State, Prop as Prop, StorageProp as StorageProp } from "@ohos.arkui.stateManagement.common";

import { memo as memo } from "@ohos.arkui.StateManagement.runtime";

import { MutableState as MutableState, observableProxy as observableProxy, stateOf as stateOf, propState as propState, AppStorageLinkState as AppStorageLinkState } from "@ohos.arkui.stateManagement.runtime";

import { AppStorage as AppStorage } from "@ohos.arkui.stateManagement.storage";

import { Builder as Builder, BuilderParam as BuilderParam } from "@ohos.arkui.component.common";

abstract class ETSGLOBAL {
  public static main() {}
  
  public static _$init$_() {}
  
  @memo()public static BuildChild($$: BuildChildInterface) {
    Text("${$$.width}");
  }
  
  
}

class MyStateSample extends CustomComponent<MyStateSample, __Options_MyStateSample> {
  public __initializeStruct(initializers: __Options_MyStateSample | undefined, @memo()content: (()=> void) | undefined): void {}
  
  @memo()protected _build(@memo()style: ((instance: MyStateSample)=> MyStateSample) | undefined, @memo()content: (()=> void) | undefined, initializers: __Options_MyStateSample | undefined): void {
    Text("Hello World");
  }
  
  public constructor() {}
  
}

interface BuildChildInterface {
  abstract get width(): number
  abstract set width(width: number)
  
}

interface __Options_MyStateSample {
  
}


[UI PLUGIN] AFTER CHECKED EXIT
plugin checked finished
[TS WRAPPER] PROCEED TO STATE:  7
TypeError: Method _build(style: (instance: MyStateSample) => MyStateSample|undefined, content: () => void|undefined, initializers: __Options_MyStateSample|undefined): void in MyStateSample not overriding any method [new.ets:24:22]
"/home/y00896775/workspace/blue_oh_code/code-1108/out/sdk/ohos-sdk/linux/ets/ets1.2/build-tools/ets2panda/bin/ark_link" --output "/home/y00896775/workspace/blue_oh_code/code-1108/developtools/ace_ets2bundle/arkui-plugins/test/demo/test_1/dist/modules_static.abc" -- @"demo/test_1/dist/cache/fileInfo.txt"
