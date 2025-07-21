import { Component, Entry, Column, Text, ClickEvent } from "@ohos.arkui.component"
import { StorageProp, AppStorage } from "@ohos.arkui.stateManagement"

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
  @StorageProp('PropA') storageProp: number = 1;
  @StorageProp('PropB') storagePropObject: Data = new Data(1);

  build() {
    Column() {
      Text(`From AppStorage ${this.storageProp}`)
        .onClick((e: ClickEvent) => {
          this.storageProp += 1;
        })

      Text(`From AppStorage ${this.storagePropObject.code}`)
        .onClick((e: ClickEvent) => {
          this.storagePropObject.code += 1;
        })
      }
  }
}
