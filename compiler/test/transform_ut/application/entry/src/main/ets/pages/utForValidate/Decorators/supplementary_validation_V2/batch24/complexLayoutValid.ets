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
 * Valid complex layout patterns.
 */

// --- Valid Patterns ---
// Valid: Stat card
@Component
struct StatCard {
  @Prop label: string;
  @Prop value: number;
  build() {
    Column() {
      Text(this.label).fontSize(12).fontColor(Color.Gray)
      Text(this.value.toString()).fontSize(24).fontWeight(FontWeight.Bold)
    }
    .padding(16)
  }
}

// Valid: User card
@Component
struct UserCard {
  @Prop name: string;
  @Prop role: string;
  build() {
    Column() {
      Text(this.name).fontWeight(FontWeight.Bold)
      Text(this.role).fontSize(12).fontColor(Color.Gray)
    }
    .padding(12)
  }
}

// Valid: List item
@Component
struct ListItemComp {
  @Prop text: string;
  @Prop index: number;
  build() {
    Row() {
      Text("#" + this.index.toString())
      Text(this.text).layoutWeight(1)
    }
    .padding(8)
  }
}

// Valid: Tab page
@Component
struct TabPage {
  @Prop title: string;
  @Prop content: string;
  build() {
    Column() {
      Text(this.title).fontWeight(FontWeight.Bold)
      Text(this.content)
    }
  }
}

// Valid: Form field
@Component
struct FormField {
  @Prop label: string;
  @Prop value: string;
  build() {
    Column() {
      Text(this.label).fontSize(12).fontColor(Color.Gray)
      Text(this.value || "(empty)")
    }
    .padding(8)
  }
}

// Valid: Counter
@Component
struct CounterComp {
  @State count: number = 0;
  build() {
    Column() {
      Text("Count: " + this.count.toString())
      Row() {
        Button("-").onClick(() => this.count--)
        Button("+").onClick(() => this.count++)
      }
    }
  }
}

// Valid: Status badge
@Component
struct StatusBadge {
  @Prop status: string;
  build() {
    Text(this.status)
      .padding(4).borderRadius(4)
      .backgroundColor(this.status === "active" ? Color.Green : Color.Gray)
  }
}

// Valid: Dashboard
@Component
struct DashboardComp {
  @State users: number = 100;
  @State revenue: number = 5000;
  build() {
    Column() {
      Text("Dashboard").fontSize(18).fontWeight(FontWeight.Bold)
      Text("Users: " + this.users.toString())
      Text("Revenue: $" + this.revenue.toString())
      StatCard({ label: "Total", value: this.users })
    }
  }
}

@Entry
@Component
struct ComplexLayoutValidEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
