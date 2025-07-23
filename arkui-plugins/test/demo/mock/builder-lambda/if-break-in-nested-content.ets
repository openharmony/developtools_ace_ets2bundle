import { Component, Column, Text } from "@ohos.arkui.component";

import hilog from "@ohos.hilog";

@Component
struct A {
  build() {
    Column() {
        Column() {
            Column() {
                Column() {
                    if (false) {
                        hilog.info(0x0000, "very inside", "1");
                        return;
                        Text("1");
                    }
                }
            }
        }
        if (true) {
            hilog.info(0x0000, "outside column", "2");
            Text("1");
        }
    }
  }
}