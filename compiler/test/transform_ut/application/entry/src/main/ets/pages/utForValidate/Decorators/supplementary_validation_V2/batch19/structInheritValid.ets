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
 * Valid struct inheritance and composition patterns.
 */

// --- Valid Patterns ---

// Valid: Using composition instead of inheritance
@Component
struct BaseLayout {
  build() {
    Column() {
      Text("Base Layout Header")
    }
  }
}

@Component
struct ExtendedLayout {
  build() {
    Column() {
      BaseLayout()
      Text("Extended Content")
    }
  }
}

// Valid: Child component composition
@Component
struct ButtonBar {
  build() {
    Row() {
      Button("OK")
      Button("Cancel")
    }
  }
}

@Component
struct Toolbar {
  build() {
    Row() {
      Text("App Title").layoutWeight(1)
      ButtonBar()
    }
  }
}

// Valid: Nested composition
@Component
struct StatusBadge {
  @Prop status: string;
  build() {
    Text(this.status)
      .padding(4)
      .borderRadius(4)
      .backgroundColor(this.status === "active" ? Color.Green : Color.Gray)
  }
}

@Component
struct UserRow {
  @Prop name: string;
  @Prop status: string;
  build() {
    Row() {
      Text(this.name).layoutWeight(1)
      StatusBadge({ status: this.status })
    }
  }
}

@Component
struct UserList {
  build() {
    Column() {
      UserRow({ name: "Alice", status: "active" })
      UserRow({ name: "Bob", status: "inactive" })
      UserRow({ name: "Charlie", status: "active" })
    }
  }
}

// Valid: Dialog composition
@CustomDialog
struct CustomConfirmDialog {
  controller: CustomDialogController;
  @Prop message: string;
  build() {
    Column() {
      Text("Confirm")
      Text(this.message)
      Row() {
        Button("Cancel").onClick(() => this.controller.close())
        Button("OK").onClick(() => this.controller.close())
      }
    }
  }
}

// Valid: Page composition
@Component
struct PageHeader {
  @Prop title: string;
  build() {
    Column() {
      Text(this.title).fontSize(22).fontWeight(FontWeight.Bold)
      Divider()
    }
  }
}

@Component
struct PageContent {
  build() {
    Column() {
      Text("Main content area")
      Text("Additional content")
    }
  }
}

@Component
struct PageFooter {
  build() {
    Column() {
      Divider()
      Text("Page Footer")
    }
  }
}

@Entry
@Component
struct StructInheritValidEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
