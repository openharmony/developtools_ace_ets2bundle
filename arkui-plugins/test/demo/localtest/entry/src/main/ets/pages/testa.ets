
import { Text, Column, Component, Entry, Button, ClickEvent } from "@ohos.arkui.component"
import { ClassB } from "./testb";

export class ClassA {
  name: string;
  classMember: ClassB;

  constructor(name: string) {
    this.name = name;
    this.classMember = new ClassB('123', 11);
  }
}
@Component
export struct Main {
  build() {
    Column() {
    }
    .width('100%')
    .height(150)
  }
}