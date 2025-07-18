import { Text, Column, Component, Color, Curve } from "@ohos.arkui.component"
import { Entry } from "@ohos.arkui.component"

@Entry
@Component
struct AnimatablePropertyExample {
  build() {
    Column() {
      Text("AnimatableProperty")
        .backgroundColor(Color.Red)
        .animation({ duration: 2000, curve: Curve.Ease })
        .fontSize(20)
        .animation({ duration: 2000, curve: Curve.Ease })
        .width("100%")
    }
  }
}