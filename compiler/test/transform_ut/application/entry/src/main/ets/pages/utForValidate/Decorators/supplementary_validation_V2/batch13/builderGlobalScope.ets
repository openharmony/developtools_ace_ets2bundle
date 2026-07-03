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
 * @Builder global function usage patterns. Tests valid @Builder function declarations.
 */

// --- Valid Patterns ---

// Valid: @Builder function with parameter
@Builder
function globalBuilder(param: string) {
  Text(param)
}

// Valid: @Builder function without parameters
@Builder
function simpleBuilder() {
  Text("Simple Builder Content")
}

// Valid: Using @Builder in component
@Component
struct UsesGlobalBuilder {
  @State msg: string = "hello";
  build() {
    Column() {
      globalBuilder(this.msg)
      simpleBuilder()
    }
  }
}

// Valid: @Builder with multiple components
@Builder
function cardBuilder(title: string, content: string) {
  Column() {
    Text(title).fontSize(18).fontWeight(FontWeight.Bold)
    Text(content).fontSize(14)
  }
}

// Valid: Multiple @Builder functions
@Builder
function headerBuilder() {
  Row() {
    Text("Logo")
    Text("Menu")
  }
}

@Builder
function footerBuilder() {
  Row() {
    Text("Copyright 2026")
    Text("About")
  }
}

// Valid: Component using multiple builders
@Component
struct FullPageBuilder {
  @State cardTitle: string = "Card Title";
  @State cardContent: string = "Card content goes here";
  build() {
    Column() {
      headerBuilder()
      cardBuilder(this.cardTitle, this.cardContent)
      footerBuilder()
    }
  }
}

// Valid: Builder with conditional
@Builder
function statusBuilder(isActive: boolean) {
  if (isActive) {
    Text("Active").fontColor(Color.Green)
  } else {
    Text("Inactive").fontColor(Color.Red)
  }
}

@Component
struct StatusComponent {
  @State active: boolean = true;
  build() {
    Column() {
      statusBuilder(this.active)
      Button("Toggle").onClick(() => {
        this.active = !this.active
      })
    }
  }
}

@Entry
@Component
struct BuilderGlobalScopeEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
