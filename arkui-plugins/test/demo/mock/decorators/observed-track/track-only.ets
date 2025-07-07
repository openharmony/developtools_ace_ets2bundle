import { Component } from "@ohos.arkui.component"
import { Track } from "@ohos.arkui.stateManagement"

class C {
  propC: number = 1
  @Track trackC: number = 2
}

@Component
struct MyStateSample {
  build() {}
}