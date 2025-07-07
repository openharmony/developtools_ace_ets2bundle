import { Component, Entry } from "@ohos.arkui.component"  // TextAttribute should be insert by ui-plugins
import { StorageProp } from "@ohos.arkui.stateManagement"

@Entry
@Component
struct MyStateSample {
  @StorageProp('Prop1') numB: number = 43;
  @StorageProp('Prop2') stringB: string = 'BB';
  @StorageProp('Prop3') booleanB: boolean = false;

  build() {}
}