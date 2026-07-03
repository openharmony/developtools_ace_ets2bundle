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
 * @Type decorator inside @Observed class.
Tests valid @Type usage for nested object serialization.
@Type specifies the class type for serialization of nested objects.
 */

// --- Valid Patterns ---

// Valid: @Type with class reference in @Observed
class MyType {
  serialize(): string { return ""; }
}

@Observed
class ObservedWithType {
  @Type(MyType) data: string = "test";
}

// Valid: @Observed class without @Type
@Observed
class SimpleObserved {
  count: number = 0;
  name: string = "simple";
}

// Valid: Multiple @Type decorators
class Address {
  city: string = "";
  zip: string = "";
}

class Contact {
  phone: string = "";
  email: string = "";
}

@Observed
class PersonModel {
  @Type(Address) address: Address = new Address();
  @Type(Contact) contact: Contact = new Contact();
  name: string = "person";
}

// Valid: @Observed class with methods
@Observed
class ItemModel {
  @Type(MyType) metadata: string = "";
  id: number = 0;
  title: string = "";
  constructor(id: number, title: string) {
    this.id = id;
    this.title = title;
  }
  getInfo(): string { return this.title + " (#" + this.id.toString() + ")"; }
}

// Valid: Using @Observed model in @Component
@Component
struct ObservedModelDisplay {
  @State person: PersonModel = new PersonModel();
  build() {
    Column() {
      Text("Name: " + this.person.name)
      Text("City: " + this.person.address.city)
      Text("Email: " + this.person.contact.email)
    }
  }
}

// Valid: Simple observed data display
@Component
struct SimpleObservedDisplay {
  @State item: SimpleObserved = new SimpleObserved();
  build() {
    Column() {
      Text(this.item.name)
      Text("Count: " + this.item.count.toString())
    }
  }
}

@Entry
@Component
struct TypeInObservedEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
