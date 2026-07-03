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
 * @BuilderParam initialization validation.
 */

// --- Error Cases ---

// Error 10905101: @BuilderParam initialized with non-builder
@Component
struct BadBuilderParam {
  @BuilderParam content: () => void = (): void => { Text("inline") };
  build() { Column() { this.content() } }
}

// --- Valid Patterns ---

// Valid: @BuilderParam initialized with @Builder function
@Builder
function validContent() {
  Text("Valid Content")
}

@Component
struct GoodBuilderParam {
  @BuilderParam content: () => void = validContent;
  build() {
    Column() {
      this.content()
    }
  }
}

// Valid: @BuilderParam with default @Builder
@Builder
function defaultHeader() {
  Text("Default Header").fontSize(18)
}

@Component
struct CardComponent {
  @BuilderParam header: () => void = defaultHeader;
  @BuilderParam body: () => void = validContent;
  build() {
    Column() {
      this.header()
      Divider()
      this.body()
    }
  }
}

// Valid: Component passing builder to child
@Builder
function customHeader() {
  Row() {
    Text("Custom").fontWeight(FontWeight.Bold)
  }
}

@Component
struct UsesCard {
  build() {
    Column() {
      CardComponent({ header: customHeader })
      CardComponent()
    }
  }
}

// Valid: @BuilderParam as content slot
@Component
struct Container {
  @BuilderParam content: () => void;
  build() {
    Column() {
      Text("Container Start")
      this.content()
      Text("Container End")
    }
  }
}

@Component
struct UsesContainer {
  build() {
    Column() {
      Container({
        content: (): void => {
          Text("Injected Content")
          Button("Action")
        }
      })
    }
  }
}

// Valid: Multiple @BuilderParam
@Component
struct LayoutWithSlots {
  @BuilderParam header: () => void = defaultHeader;
  @BuilderParam footer: () => void = validContent;
  build() {
    Column() {
      this.header()
      Text("Main content area")
      this.footer()
    }
  }
}

@Component
struct FullLayout {
  build() {
    Column() {
      LayoutWithSlots()
    }
  }
}

@Entry
@Component
struct BuilderParamInitErrorEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
