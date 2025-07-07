import { Component } from "@ohos.arkui.component"
import { Observed, Track } from "@ohos.arkui.stateManagement"

class Info{}
class E {
  propE: Info = new Info()
  @Track trackE: Info = new Info()
}

@Observed
class E1 {
  propE1: Info = new Info()
  trackE1: Info = new Info()
}

@Component
struct MyStateSample {
  build() {}
}
