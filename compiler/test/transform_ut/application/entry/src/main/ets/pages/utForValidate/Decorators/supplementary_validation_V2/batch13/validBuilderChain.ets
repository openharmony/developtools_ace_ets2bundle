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
 * Valid @Builder function chain patterns. Tests multiple @Builder functions used together.
 */

// --- Valid Patterns ---

// Valid: @Builder for header
@Builder
function headerBuilder() {
  Text("Header").fontSize(20)
}

// Valid: @Builder for content
@Builder
function contentBuilder() {
  Text("Content").fontSize(16)
}

// Valid: @Builder for footer
@Builder
function footerBuilder() {
  Text("Footer").fontSize(12)
}

// Valid: Component using builder chain
@Component
struct BuilderChain {
  build() {
    Column() {
      headerBuilder()
      contentBuilder()
      footerBuilder()
    }
  }
}

// Valid: @Builder with parameters
@Builder
function itemBuilder(label: string, value: number) {
  Row() {
    Text(label)
    Text(value.toString())
  }
}

// Valid: Component using parameterized builders
@Component
struct ItemList {
  build() {
    Column() {
      itemBuilder("Count", 42)
      itemBuilder("Score", 95)
      itemBuilder("Level", 7)
    }
  }
}

// Valid: Nested builders
@Builder
function sectionBuilder(title: string) {
  Column() {
    Text(title).fontWeight(FontWeight.Bold)
    Divider()
  }
}

@Component
struct SectionedPage {
  build() {
    Column() {
      sectionBuilder("Section 1")
      Text("Content for section 1")
      sectionBuilder("Section 2")
      Text("Content for section 2")
    }
  }
}

// Valid: Builder with conditional
@Component
struct ConditionalBuilder {
  @State showDetails: boolean = false;
  @Builder
  detailContent() {
    if (this.showDetails) {
      Column() {
        Text("Detail 1")
        Text("Detail 2")
      }
    }
  }
  build() {
    Column() {
      Text("Main content")
      this.detailContent()
      Button("Toggle Details").onClick(() => {
        this.showDetails = !this.showDetails
      })
    }
  }
}

// Valid: Full page using builders
@Component
struct FullPageWithBuilders {
  @State userCount: number = 10;
  build() {
    Column() {
      headerBuilder()
      itemBuilder("Users", this.userCount)
      footerBuilder()
    }
  }
}

@Entry
@Component
struct ValidBuilderChainEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
