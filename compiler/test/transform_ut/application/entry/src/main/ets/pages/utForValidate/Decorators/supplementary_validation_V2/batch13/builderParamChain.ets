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
 * @BuilderParam with @Builder function chain. Tests valid @BuilderParam initialization.
 */

// --- Valid Patterns ---

// Valid: @Builder function for initialization
@Builder
function titleBuilder() { Text("Title") }

// Valid: Component with @BuilderParam
@Component
struct CardComponent {
  @BuilderParam title: () => void = titleBuilder;
  build() {
    Column() {
      this.title()
      Text("Card body")
    }
  }
}

// Valid: Another @Builder function
@Builder
function iconBuilder() { Text("[ICON]") }

// Valid: Component with multiple @BuilderParam
@Component
struct LayoutComponent {
  @BuilderParam header: () => void = titleBuilder;
  @BuilderParam footer: () => void = iconBuilder;
  build() {
    Column() {
      this.header()
      Text("Main content area")
      this.footer()
    }
  }
}

// Valid: Using component with custom builder
@Builder
function customHeader() {
  Row() {
    Text("Custom Header")
    Text("Right Side")
  }
}

@Component
struct UsesCard {
  build() {
    Column() {
      CardComponent({ title: customHeader })
      CardComponent()
    }
  }
}

// Valid: @BuilderParam with content slot
@Component
struct ContainerBox {
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
      ContainerBox({
        content: (): void => {
          Text("Injected content")
          Text("More content")
        }
      })
    }
  }
}

// Valid: Complete builder chain usage
@Component
struct CompleteChainPage {
  build() {
    Column() {
      LayoutComponent()
      ContainerBox({
        content: (): void => {
          Text("Dynamic content")
          Button("Action")
        }
      })
    }
  }
}

@Entry
@Component
struct BuilderParamChainEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
