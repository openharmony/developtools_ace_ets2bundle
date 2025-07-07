import { Component, Entry } from "@ohos.arkui.component"
import { StorageLink } from "@ohos.arkui.stateManagement"

@Entry
@Component
struct MyStateSample {
  @StorageLink('Prop1') numA: number = 33;
  @StorageLink('Prop2') stringA: string = 'AA';
  @StorageLink('Prop3') booleanA: boolean = true;
 
  build() {}
}