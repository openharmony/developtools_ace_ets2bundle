/*
 * Copyright (c) 2026 Huawei Device Co., Ltd.
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

/**
 * Test case: @Extend decorator usage
 * Purpose: Demonstrate correct @Extend decorator usage
 */

// ============================================
// Correct @Extend usage examples
// ============================================

@Extend(Text)
function textExtend() {
  .fontSize(20)
  .fontWeight(FontWeight.Bold)
  .fontColor(Color.Blue);
}

@Extend(Button)
function buttonExtend() {
  .width(200)
  .height(50)
  .backgroundColor(Color.Green);
}

@Component
struct ExtendUsageTest {
  @State message: string = "Extend Test";

  build() {
    Column() {
      Text("@Extend Usage Test")
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20);
      
      Text("Extended Text")
        .textExtend();
      
      Button("Extended Button")
        .buttonExtend()
        .margin(10);
      
      // Description
      Column() {
        Text("@Extend Usage:")
          .fontSize(16)
          .fontWeight(FontWeight.Bold);
        
        Text("✓ @Extend(Component) function myStyle() { ... }")
          .fontSize(12)
          .fontColor(Color.Green);
      }
      .width("90%")
      .padding(10)
      .backgroundColor("#E8F5E9")
      .margin(10);
    }
    .width("100%")
    .height("100%")
    .backgroundColor(Color.White);
  }
}

// Additional @Extend examples
@Extend(Image)
function imageExtend() {
  .width(100)
  .height(100)
  .borderRadius(10);
}

@Extend(Row)
function rowExtend() {
  .width("100%")
  .height(60)
  .backgroundColor("#F5F5F5")
  .padding(10);
}

@Entry
@Component
struct ExtendDecoratorEntry {
  @State title: string = "@Extend Decorator Examples";
  
  build() {
    Column() {
      Text(this.title)
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20);
      
      ExtendUsageTest();
      
      // Additional usage examples
      Row() {
        Text("Extended Row")
          .fontSize(16);
      }
      .rowExtend()
      .margin(10);
      
      // Documentation section
      Column() {
        Text("Best Practices:")
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .margin(5);
        
        Text("1. Use @Extend to create reusable styles")
          .fontSize(12)
          .fontColor(Color.Gray);
        
        Text("2. Apply to specific component types")
          .fontSize(12)
          .fontColor(Color.Gray);
        
        Text("3. Keep style functions simple")
          .fontSize(12)
          .fontColor(Color.Gray);
      }
      .width("90%")
      .padding(15)
      .backgroundColor("#E3F2FD")
      .margin(10);
    }
    .width("100%")
    .height("100%")
    .backgroundColor(Color.White);
  }
}
