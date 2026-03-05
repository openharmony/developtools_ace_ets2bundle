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
 * Test case: @Styles decorator usage
 * Purpose: Demonstrate correct @Styles decorator usage
 */

// ============================================
// Correct @Styles usage examples
// ============================================

@Styles
function myTextStyle() {
  .fontSize(18)
  .fontColor(Color.Blue);
}

@Styles
function myButtonStyle() {
  .width(150)
  .height(40)
  .backgroundColor(Color.Green);
}

@Component
struct StylesUsageTest {
  @State message: string = "Styles Test";

  build() {
    Column() {
      Text("@Styles Usage Test")
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20);
      
      Text("Styled Text")
        .myTextStyle();
      
      Button("Styled Button")
        .myButtonStyle()
        .margin(10);
      
      Column() {
        Text("@Styles Usage:")
          .fontSize(16)
          .fontWeight(FontWeight.Bold);
        
        Text("✓ @Styles function myStyle() { ... }")
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

// Additional @Styles examples
@Styles
function cardStyle() {
  .width("90%")
  .padding(15)
  .backgroundColor(Color.White)
  .borderRadius(10)
  .shadow({ radius: 5, color: "#20000000" });
}

@Entry
@Component
struct StylesDecoratorEntry {
  @State title: string = "@Styles Decorator Examples";
  
  build() {
    Column() {
      Text(this.title)
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20);
      
      StylesUsageTest();
      
      // Additional examples
      Column() {
        Text("Card with @Styles")
          .fontSize(16);
      }
      .cardStyle()
      .margin(10);
      
      // Guidelines section
      Column() {
        Text("@Styles Guidelines:")
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .margin(5);
        
        Text("1. Define reusable style functions")
          .fontSize(12)
          .fontColor(Color.Gray);
        
        Text("2. Apply consistent styling")
          .fontSize(12)
          .fontColor(Color.Gray);
        
        Text("3. Use for common UI patterns")
          .fontSize(12)
          .fontColor(Color.Gray);
        
        Text("4. Keep styles focused and simple")
          .fontSize(12)
          .fontColor(Color.Gray);
      }
      .width("90%")
      .padding(15)
      .backgroundColor("#F3E5F5")
      .margin(10);
    }
    .width("100%")
    .height("100%")
    .backgroundColor(Color.White);
  }
}
