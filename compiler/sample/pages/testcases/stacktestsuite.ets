/*
 * Copyright (c) 2021 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

class Test {
    align:number = 0;
    fit:number = 0;
    overflow:number = 0;
    text:number = 0;
    width:number = 0;
    constructor(align:number, fit:number, overflow:number, text:number, width:number) {
      this.align = align;
      this.fit = fit;
      this.overflow = overflow;
      this.text = text;
      this.width = width;
    }
}

@Entry
@Component
struct TestView {

    @State
    currentTest:Test = new Test(0, 0, 0, 0, 0);

    aligns:string[] = [
        "TopLeft",
        "TopCenter",
        "TopRight",
        "CenterLeft",
        "Center",
        "CenterRight",
        "BottomLeft",
        "BottomCenter",
        "BottomRight"
    ];

    stackFits:string[] = [
        "Keep",
        "Stretch",
        "Inherit",
        "FirstChild"
    ];

    overflows:string[] = [
        "Clip",
        "Observable"
    ];

    texts:string[] = [
        "Test text",
        "This is a very long text for demonstration purposes."
    ];

    widths:number[] = [
        200,
        500,
        800
    ];

    alignToText(align) {
        if (align >= this.aligns.length)
            return "Unknown (" + align + ")";

        return "Align." + this.aligns[align] + "(" + /*Align[this.aligns[align]]*/ + ")";
    } // alignToText

    fitToText(fit) {
        if (fit >= this.stackFits.length)
            return "Unknown (" + fit + ")";

        return "StackFit." + this.stackFits[fit] + "(" + /*StackFit[this.stackFits[fit]]*/ + ")";
    }

    overflowToText(overflow) {
        if (overflow >= this.overflows.length)
            return "Unknown (" + overflow + ")";

        return "Overflow." + this.overflows[overflow] + "(" + /*Overflow[this.overflows[overflow]]*/ + ")";
    }

    build() {
        Column(){
            Row(){
                Button("Alignment")
                .onClick(() => {
                    this.currentTest.align = (this.currentTest.align + 1) % this.aligns.length;
                })
                Text(this.alignToText(this.currentTest.align))
            }
            Row(){
                Button("Fit")
                .onClick(() => {
                    this.currentTest.fit = (this.currentTest.fit + 1) % this.stackFits.length;
                })
                Text(this.fitToText(this.currentTest.fit))
            }
            Row(){
                Button("Overflow")
                .onClick(() => {
                    this.currentTest.overflow = (this.currentTest.overflow + 1) % this.overflows.length;
                })
                Text(this.overflowToText(this.currentTest.overflow))
            }
            Row(){
                Button("Text")
                .onClick(() => {
                    this.currentTest.text = (this.currentTest.text + 1) % this.texts.length;
                })
                Text(this.texts[this.currentTest.text])
            }
            Row(){
                Button("Width")
                .onClick(() => {
                    this.currentTest.width = (this.currentTest.width + 1) % this.widths.length;
                })
                Text("" + this.widths[this.currentTest.width])
            }
            Stack(){
                Column(){

                }
                .width(350).height(400).backgroundColor(0xaaaaaa)
                Text(this.texts[this.currentTest.text]).backgroundColor(0x00aaff).fontColor("#ffffff")
                .width(this.widths[this.currentTest.width])
            }
            //.alignment(Align[this.aligns[this.currentTest.align]]).stackFit(StackFit[this.stackFits[this.currentTest.fit]])
            //.Overflow(Overflow[this.overflows[this.currentTest.overflow]]).backgroundColor(0x0000cd).width(500.0).height(400.0)
            Stack(){
                Text("test1")
                Text("Test2")
            }
        }
        .alignItems(HorizontalAlign.Center)
    }
}
