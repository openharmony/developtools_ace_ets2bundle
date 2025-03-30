import { memo, __memo_context_type, __memo_id_type } from "@ohos.arkui.stateManagement" // should be insert by ui-plugins
import { Text, TextAttribute, Column, Component, Button, ButtonAttribute, ClickEvent, UserView } from "@ohos.arkui.component"  // TextAttribute should be insert by ui-plugins
import hilog from '@ohos.hilog'

@Component
export struct MyStateSample {
  message: string = "Click";
  build() {
    Column(undefined) {
      Text("Hello World").fontSize(20)
      Button(this.message).backgroundColor("#FFFF00FF")
        .onClick((e: ClickEvent) => {
          hilog.info(0x0000, 'testTag', 'On Click');
        })
      Child()
    }
  }
}

@Component
export struct Child {
  stateVar: string = "Child";
  build() {
    Text(this.stateVar).fontSize(50)
  }
}
