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
 * Valid @Entry component patterns.
 */

// --- Valid Patterns ---

@Component
struct HomePage {
  @State username: string = "Guest";
  build() {
    Column() {
      Text("Home Page")
      Text("Welcome, " + this.username)
    }
  }
}

@Component
struct SettingsPage {
  @State darkMode: boolean = false;
  @State notifications: boolean = true;
  build() {
    Column() {
      Text("Settings")
      Text("Dark Mode: " + this.darkMode.toString())
      Text("Notifications: " + this.notifications.toString())
      Button("Toggle Dark").onClick(() => { this.darkMode = !this.darkMode })
      Button("Toggle Notif").onClick(() => { this.notifications = !this.notifications })
    }
  }
}

@Component
struct ProfilePage {
  @State name: string = "John";
  @State age: number = 30;
  @State email: string = "john@example.com";
  build() {
    Column() {
      Text("Profile").fontSize(20).fontWeight(FontWeight.Bold)
      Divider()
      Text("Name: " + this.name)
      Text("Age: " + this.age.toString())
      Text("Email: " + this.email)
    }
  }
}

@Component
struct DashboardPage {
  @State users: number = 100;
  @State revenue: number = 5000;
  @State orders: number = 250;
  build() {
    Column() {
      Text("Dashboard").fontSize(20).fontWeight(FontWeight.Bold)
      Text("Users: " + this.users.toString())
      Text("Revenue: $" + this.revenue.toString())
      Text("Orders: " + this.orders.toString())
    }
  }
}

@Component
struct AboutPage {
  build() {
    Column() {
      Text("About This App").fontSize(18)
      Text("Version 2.0.0")
      Text("Build 2026.01")
      Text("Copyright 2026")
    }
  }
}

@Component
struct HelpPage {
  @State expandedSection: number = 0;
  build() {
    Column() {
      Text("Help Center").fontSize(18)
      Text("Section: " + this.expandedSection.toString())
      Button("Next Section").onClick(() => {
        this.expandedSection = (this.expandedSection + 1) % 4
      })
    }
  }
}

@Component
struct ContactPage {
  @State subject: string = "General Inquiry";
  @State submitted: boolean = false;
  build() {
    Column() {
      Text("Contact Us")
      Text("Subject: " + this.subject)
      Text(this.submitted ? "Submitted!" : "Not submitted")
      Button("Submit").onClick(() => { this.submitted = true })
    }
  }
}

@Entry
@Component
struct EntryValidPatternsEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
