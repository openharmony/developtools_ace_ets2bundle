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
 * @Builder with non-UI content restrictions.
 */

// --- Error Cases ---

// Error 10905209: Non-UI statement in builder
@Builder
function builderWithVarDecl() {
  let temp: number = 42;
  Text("value: " + temp.toString())
}

// --- Valid Patterns ---

// Valid: @Builder with only UI content
@Builder
function cleanBuilder() {
  Column() {
    Text("Title").fontSize(20)
    Text("Subtitle").fontSize(14)
  }
}

// Valid: @Builder with ForEach
@Builder
function listBuilder(items: string[]) {
  Column() {
    ForEach(items, (item: string) => {
      Text(item).padding(4)
    }, (item: string) => item)
  }
}

// Valid: @Builder with if-else
@Builder
function statusBuilder(status: string) {
  if (status === "success") {
    Row() {
      Text("OK").fontColor(Color.Green)
    }
  } else {
    Row() {
      Text("Error").fontColor(Color.Red)
    }
  }
}

// Valid: @Builder for header
@Builder
function headerBuilder(title: string, subtitle: string) {
  Column() {
    Text(title).fontSize(22).fontWeight(FontWeight.Bold)
    Text(subtitle).fontSize(14).fontColor(Color.Gray)
  }
  .padding({ top: 16, bottom: 8 })
}

// Valid: @Builder for button group
@Builder
function buttonGroupBuilder() {
  Row() {
    Button("Cancel").backgroundColor(Color.Gray)
    Button("OK").backgroundColor(Color.Blue)
  }
  .justifyContent(FlexAlign.End)
}

// Valid: @Builder using other builders
@Builder
function pageBuilder() {
  Column() {
    headerBuilder("Page Title", "Page subtitle")
    cleanBuilder()
    statusBuilder("success")
    buttonGroupBuilder()
  }
}

@Component
struct BuilderShowcase {
  build() {
    Column() {
      pageBuilder()
    }
  }
}

// Valid: @Builder with ForEach and condition
@Builder
function dynamicListBuilder(items: string[], showIndex: boolean) {
  Column() {
    ForEach(items, (item: string, index: number) => {
      Row() {
        if (showIndex) {
          Text((index + 1).toString() + ". ")
        }
        Text(item)
      }
    }, (item: string) => item)
  }
}

@Entry
@Component
struct BuilderNonUIContentEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
