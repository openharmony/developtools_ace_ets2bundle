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
 * Complex @Builder with conditional rendering patterns.
Tests valid @Builder methods with if/else logic inside components.
@Builder methods can contain conditional UI logic.
 */

// --- Valid Patterns ---

// Valid: @Builder with conditional rendering
@Component
struct ComplexBuilderUse {
  @State isLoading: boolean = false;
  @State data: string = "content";
  @Builder
  contentBuilder() {
    if (this.isLoading) {
      Text("Loading...")
    } else {
      Text(this.data)
    }
  }
  build() { Column() { this.contentBuilder() } }
}

// Valid: @Builder with multiple branches
@Component
struct MultiBranchBuilder {
  @State status: string = "idle";
  @Builder
  statusBuilder() {
    if (this.status === "loading") {
      Column() {
        Text("Loading...")
        Text("Please wait")
      }
    } else if (this.status === "success") {
      Column() {
        Text("Success!")
        Text("Data loaded")
      }
    } else {
      Text("Idle - click to start")
    }
  }
  build() { Column() { this.statusBuilder() } }
}

// Valid: @Builder with ForEach
@Component
struct BuilderWithList {
  @State items: string[] = ["A", "B", "C"];
  @Builder
  listBuilder() {
    ForEach(this.items, (item: string) => {
      Text(item)
    }, (item: string) => item)
  }
  build() { Column() { this.listBuilder() } }
}

// Valid: @Builder with styled content
@Component
struct StyledBuilder {
  @State title: string = "Styled Title";
  @Builder
  styledHeader() {
    Column() {
      Text(this.title)
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .fontColor(Color.Blue)
      Divider().margin(10)
    }
  }
  build() {
    Column() {
      this.styledHeader()
      Text("Body content below header")
    }
  }
}

// Valid: @Builder with button interactions
@Component
struct InteractiveBuilder {
  @State count: number = 0;
  @Builder
  counterBuilder() {
    Column() {
      Text("Count: " + this.count.toString())
      Row() {
        Button("-").onClick(() => this.count--)
        Button("+").onClick(() => this.count++)
      }
    }
  }
  build() { Column() { this.counterBuilder() } }
}

// Valid: Global @Builder function
@Builder
function globalCard(title: string, content: string) {
  Column() {
    Text(title).fontWeight(FontWeight.Bold)
    Text(content).fontSize(14)
  }
}

@Component
struct UsesGlobalCard {
  build() {
    Column() {
      globalCard("Card 1", "First card content")
      globalCard("Card 2", "Second card content")
    }
  }
}

@Entry
@Component
struct ComplexBuilderEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
