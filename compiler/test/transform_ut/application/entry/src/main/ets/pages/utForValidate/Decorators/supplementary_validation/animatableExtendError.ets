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
 * Test case: @AnimatableExtend decorator usage
 * Purpose: Demonstrate correct @AnimatableExtend decorator usage
 */

// ============================================
// Correct @AnimatableExtend usage examples
// ============================================

@AnimatableExtend(Text)
function animatableTextExtend() {
  .fontSize(20)
  .fontWeight(FontWeight.Bold);
}

@AnimatableExtend(Column)
function animatableColumnExtend() {
  .width(200)
  .height(100);
}

@Component
struct AnimatableExtendTest {
  @State message: string = "AnimatableExtend Test";

  build() {
    Column() {
      Text("@AnimatableExtend Usage")
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20);
      
      Text("Animated Text")
        .animatableTextExtend();
      
      Column() {
        Text("Animated Column");
      }
      .animatableColumnExtend()
      .margin(10);
      
      Column() {
        Text("@AnimatableExtend Usage:")
          .fontSize(16)
          .fontWeight(FontWeight.Bold);
        
        Text("✓ Used for animatable properties")
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

// Additional examples
@AnimatableExtend(Button)
function animatableButtonExtend() {
  .width(150)
  .height(50);
}

@Entry
@Component
struct AnimatableExtendEntry {
  @State title: string = "@AnimatableExtend Examples";
  
  build() {
    Column() {
      Text(this.title)
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20);
      
      AnimatableExtendTest();
      
      // Additional example
      Button("Animated Button")
        .animatableButtonExtend()
        .margin(10);
      
      // Description section
      Column() {
        Text("Animation Support:")
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .margin(5);
        
        Text("Properties that can be animated:")
          .fontSize(14)
          .margin(3);
        
        Text("• Width and height")
          .fontSize(12)
          .fontColor(Color.Gray);
        
        Text("• Font size")
          .fontSize(12)
          .fontColor(Color.Gray);
        
        Text("• Opacity")
          .fontSize(12)
          .fontColor(Color.Gray);
      }
      .width("90%")
      .padding(15)
      .backgroundColor("#FFF3E0")
      .margin(10);
    }
    .width("100%")
    .height("100%")
    .backgroundColor(Color.White);
  }
}
