import { Component } from "@ohos.arkui.component"
import { Observed, Track } from "@ohos.arkui.stateManagement"

@Observed
class A {
  propA: number = 1
  trackA: number = 2
}


class G extends A {
  propG: number = 1;
}

@Observed
class H extends G {
  @Track propG: number = 1;
}

@Component
struct MyStateSample {
  build() {}
}