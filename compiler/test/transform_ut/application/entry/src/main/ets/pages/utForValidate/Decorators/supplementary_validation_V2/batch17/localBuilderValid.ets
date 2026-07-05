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
 * Valid @LocalBuilder method patterns in V2.
 */

// --- Valid Patterns ---

@ComponentV2
struct WithLocalBuilder {
  @LocalBuilder
  buildContent() { Text("content") }
  build() { Column() { this.buildContent() } }
}

@ComponentV2
struct ConditionalLocalBuilder {
  @Local isLoading: boolean = false;
  @LocalBuilder
  stateContent() {
    if (this.isLoading) {
      Text("Loading...")
    } else {
      Text("Content loaded!")
    }
  }
  build() { Column() { this.stateContent() } }
}

@ComponentV2
struct MultiLocalBuilder {
  @Local title: string = "Dashboard";
  @Local count: number = 0;
  @LocalBuilder
  headerContent() {
    Text(this.title).fontSize(20).fontWeight(FontWeight.Bold)
  }
  @LocalBuilder
  counterContent() {
    Text("Count: " + this.count.toString())
    Button("Add").onClick(() => this.count++)
  }
  build() {
    Column() {
      this.headerContent()
      this.counterContent()
    }
  }
}

@ComponentV2
struct ListLocalBuilder {
  @Local items: string[] = ["Alpha", "Beta", "Gamma"];
  @LocalBuilder
  itemList() {
    ForEach(this.items, (item: string) => {
      Text(item).padding(5)
    }, (item: string) => item)
  }
  build() { Column() { this.itemList() } }
}

@ComponentV2
struct FormLocalBuilder {
  @Local inputText: string = "";
  @LocalBuilder
  inputField() {
    Column() {
      Text("Input: " + this.inputText)
      Button("Clear").onClick(() => { this.inputText = "" })
    }
  }
  build() {
    Column() {
      this.inputField()
      Button("Submit")
    }
  }
}

@ComponentV2
struct CardLocalBuilder {
  @Local cardTitle: string = "Card";
  @Local cardContent: string = "Content";
  @LocalBuilder
  cardView() {
    Column() {
      Text(this.cardTitle).fontWeight(FontWeight.Bold)
      Divider()
      Text(this.cardContent)
    }
    .padding(12)
  }
  build() { Column() { this.cardView() } }
}

@Entry
@Component
struct LocalBuilderValidEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
