import { Component, Entry, Reusable, Column, Text, Button, ClickEvent, FontWeight} from "@ohos.arkui.component"
import { State } from "@ohos.arkui.stateManagement" 

class Message {
  value: string | undefined;

  constructor(value: string) {
    this.value = value;
  }
}

@Entry
@Component
struct Index {
  @State display: boolean = true;

  build() {
    Column() {
      Button('Hello')
        .fontSize(30)
        .fontWeight(FontWeight.Bold)
        .onClick((e: ClickEvent) => {
          this.display = !this.display;
        })
      if (this.display) {
        // 如果只有一个复用的组件，可以不用设置reuseId
        Child({ message: new Message('Child') })
      }
    }
    .height("100%")
    .width('100%')
  }
}

@Reusable
@Component
struct Child {
  @State message: Message = new Message('AboutToReuse');

  aboutToReuse(params: Record<string, ESObject>) {
    console.info("Recycle ====Child==");
    //this.message = params.message as Message;
  }

  build() {
    Column() {
      Text(this.message.value)
        .fontSize(30)
    }
    .borderWidth(1)
    .height(100)
  }
}
