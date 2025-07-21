import { Component, Reusable} from "@ohos.arkui.component"
import { State, Link } from "@ohos.arkui.stateManagement" 

@Component
struct MyStateSample {
  build() {
    Child({ num: 5 } )
  }
}

@Component
@Reusable
struct Child {
  @Link num: number = 1
  @State num1: number = 2
  build() {
      
  }
}