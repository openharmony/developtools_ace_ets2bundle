import { Component } from "@ohos.arkui.component"
import { Observed } from "@ohos.arkui.stateManagement"

@Observed
class A {
  propA: number = 1
  trackA: number = 2
}

@Component
struct MyStateSample {
  build() {}
}