import { Component } from "@ohos.arkui.component"
import { Observed, Track } from "@ohos.arkui.stateManagement"

@Observed
class B {
  propB: number = 1
  @Track trackB: number = 2
}

@Component
struct MyStateSample {
  build() {}
}
