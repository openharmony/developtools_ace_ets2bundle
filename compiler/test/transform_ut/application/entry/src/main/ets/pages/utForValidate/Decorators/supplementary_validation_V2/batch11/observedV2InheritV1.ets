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
 * @ObservedV2 class inheriting from @Observed class.
Tests error 10905225: @ObservedV2 cannot inherit from @Observed.
The V2 observation system cannot extend V1 observed classes.
 */

// --- Error Cases ---

// Error 10905225: @ObservedV2 inheriting from @Observed
@Observed
class V1Root {
  count: number = 0;
}
@ObservedV2
class V2ExtendsV1 extends V1Root {
  @Trace label: string = "test";
}

// --- Valid Patterns ---

// Valid: Separate V1 and V2 class hierarchies
@Observed
class V1DataModel {
  name: string = "v1data";
  count: number = 0;
}

@ObservedV2
class V2DataModel {
  @Trace name: string = "v2data";
  @Trace count: number = 0;
}

// Valid: V2 hierarchy with @Trace at each level
@ObservedV2
class BaseEntity {
  @Trace id: number = 0;
  @Trace createdAt: string = "2026-01-01";
}

@ObservedV2
class NamedEntity extends BaseEntity {
  @Trace name: string = "entity";
}

@ObservedV2
class UserEntity extends NamedEntity {
  @Trace email: string = "user@example.com";
  @Trace role: string = "member";
}

// Valid: Using V2 models in components
@ComponentV2
struct EntityDisplay {
  @Param user: UserEntity = new UserEntity();
  build() {
    Column() {
      Text(this.user.name)
      Text(this.user.email)
      Text("Role: " + this.user.role)
    }
  }
}

// Valid: V1 model used separately
@Component
struct V1ModelDisplay {
  @State data: V1DataModel = new V1DataModel();
  build() {
    Column() {
      Text(this.data.name)
      Text("Count: " + this.data.count.toString())
    }
  }
}

@Entry
@Component
struct ObservedV2InheritV1Entry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
