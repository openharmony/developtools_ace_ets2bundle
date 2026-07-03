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
 * ListItem and ListItemGroup nesting rules.
Tests error 10905201 (wrong parent) and 10905219 (wrong child type).
ListItem must be in List or ListItemGroup; ListItemGroup must be in List.
 */

// --- Error Cases ---

// Error 10905201: ListItem not in List/ListItemGroup
@Component
struct ListItemInColumn {
  build() {
    Column() {
      ListItem() { Text("item in column") }
    }
  }
}

// Error 10905219 + 10905201: ListItemGroup with wrong child and wrong parent
@Component
struct ListItemGroupInColumn {
  build() {
    Column() {
      ListItemGroup() { Text("group in column") }
    }
  }
}

// --- Valid Patterns ---

// Valid: ListItem inside List
@Component
struct ValidListItem {
  build() {
    List() {
      ListItem() { Text("List Item 1") }
      ListItem() { Text("List Item 2") }
      ListItem() { Text("List Item 3") }
    }
  }
}

// Valid: ListItemGroup inside List with ListItem children
@Component
struct ValidListItemGroup {
  build() {
    List() {
      ListItemGroup() {
        ListItem() { Text("Group 1 - Item 1") }
        ListItem() { Text("Group 1 - Item 2") }
      }
      ListItemGroup() {
        ListItem() { Text("Group 2 - Item 1") }
      }
    }
  }
}

// Valid: Simple List with multiple items
@Component
struct ValidSimpleList {
  @State items: string[] = ["Apple", "Banana", "Cherry"];
  build() {
    List() {
      ForEach(this.items, (item: string) => {
        ListItem() { Text(item) }
      }, (item: string) => item)
    }
  }
}

// Valid: List with styled items
@Component
struct ValidStyledList {
  build() {
    List() {
      ListItem() {
        Row() {
          Text("Item Title").fontWeight(FontWeight.Bold)
          Text("Value")
        }
      }
      ListItem() {
        Text("Simple item").fontSize(14)
      }
    }
  }
}

// Valid: List with mixed content
@Component
struct ValidMixedList {
  build() {
    List() {
      ListItem() { Text("Section Header").fontWeight(FontWeight.Bold) }
      ListItem() { Text("Item 1") }
      ListItem() { Text("Item 2") }
      ListItem() { Text("Item 3") }
    }
  }
}

@Entry
@Component
struct ListItemRulesEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
