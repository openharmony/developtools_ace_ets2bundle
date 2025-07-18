import { Component } from "@ohos.arkui.component"
import { Observed, ObjectLink } from "@ohos.arkui.stateManagement"

@Observed
class A {}

@Component
struct MyStateSample {

  @ObjectLink objectlinkvar: A;

  build() {}
}