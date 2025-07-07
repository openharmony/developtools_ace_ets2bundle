import { Component, Entry, Column, Text, ClickEvent } from "@ohos.arkui.component"
import { StorageLink, AppStorage } from "@ohos.arkui.stateManagement"

class Data {
  code: number;

  constructor(code: number) {
    this.code = code;
  }
}

AppStorage.setOrCreate('PropA', 47);
AppStorage.setOrCreate('PropB', new Data(50));


@Entry
@Component
struct Index {
  @StorageLink('PropA') storageLink: number = 1;
  @StorageLink('PropB') storageLinkObject: Data = new Data(1);

  build() {
    Column() {
      Text(`From AppStorage ${this.storageLink}`)
        .onClick((e: ClickEvent) => {
          this.storageLink += 1;
        })

      Text(`From AppStorage ${this.storageLinkObject.code}`)
        .onClick((e: ClickEvent) => {
          this.storageLinkObject.code += 1;
        })
      }
  }
}
