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
 * Panel component usage patterns.
Tests valid Panel with child components.
Panel is a container that can show/hide content.
 */

// --- Valid Patterns ---

// Valid: Panel with child content
@Component
struct PanelWithChildren {
  build() {
    Panel(true) {
      Text("panel child")
    }
  }
}

// Valid: Panel with multiple children
@Component
struct PanelMultiChild {
  build() {
    Panel(true) {
      Column() {
        Text("Panel Title").fontSize(20)
        Text("Panel Content")
        Button("Close")
      }
    }
  }
}

// Valid: Panel with mode configuration
@Component
struct PanelWithMode {
  build() {
    Panel(true) {
      Text("Foldable Panel Content")
    }
    .mode(PanelMode.Foldable)
  }
}

// Valid: Panel with styled content
@Component
struct PanelStyled {
  build() {
    Panel(true) {
      Column() {
        Text("Settings").fontWeight(FontWeight.Bold)
        Text("Option 1")
        Text("Option 2")
        Text("Option 3")
      }
    }
  }
}

// Valid: Panel with interactive content
@Component
struct PanelInteractive {
  @State value: string = "initial";
  build() {
    Panel(true) {
      Column() {
        Text("Current: " + this.value)
        Button("Update").onClick(() => {
          this.value = "updated"
        })
      }
    }
  }
}

// Valid: Panel half mode
@Component
struct PanelHalfMode {
  build() {
    Panel(true) {
      Text("Half panel content")
    }
    .mode(PanelMode.Half)
  }
}

@Entry
@Component
struct PanelChildRulesEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
