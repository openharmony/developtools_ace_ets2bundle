import { Component } from "@ohos.arkui.component"
import { Observed } from "@ohos.arkui.stateManagement"
 interface PropInterface {
  propF: number
}

interface trackInterface {
  trackF: number
}

@Observed
class F implements PropInterface, trackInterface {
  propF: number = 1
  trackF: number = 2
}

@Component
struct MyStateSample {
  build() {}
}
