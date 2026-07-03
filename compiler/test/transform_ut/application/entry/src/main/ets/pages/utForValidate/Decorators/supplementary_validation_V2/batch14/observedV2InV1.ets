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
 * @ObservedV2 class used as @State type in V1 component.
Tests error 10905348: @State property type cannot be @ObservedV2 class.
V1 state management is incompatible with V2 observed classes.
 */

// --- Error Cases ---

// Error 10905348: @State typed with @ObservedV2 class
@ObservedV2
class V2Model {
  @Trace value: number = 0;
}
@Component
struct V1UsingV2Model {
  @State model: V2Model = new V2Model();
  build() { Column() { Text(this.model.value.toString()) } }
}

// --- Valid Patterns ---

// Valid: @ObservedV2 used with V2 component
@ObservedV2
class ValidV2Model {
  @Trace name: string = "valid";
  @Trace count: number = 42;
  increment(): void { this.count++; }
}

@ComponentV2
struct V2UsingV2Model {
  @Local model: ValidV2Model = new ValidV2Model();
  build() {
    Column() {
      Text(this.model.name)
      Text(this.model.count.toString())
      Button("Add").onClick(() => this.model.increment())
    }
  }
}

// Valid: @Observed class used with V1 component
@Observed
class V1DataModel {
  name: string = "v1data";
  count: number = 10;
}

@Component
struct V1UsingV1Model {
  @State model: V1DataModel = new V1DataModel();
  build() {
    Column() {
      Text(this.model.name)
      Text(this.model.count.toString())
    }
  }
}

// Valid: V2 model with @Trace collection
@ObservedV2
class TaskModel {
  @Trace id: number = 0;
  @Trace title: string = "";
  @Trace completed: boolean = false;
  @Trace priority: number = 0;
  constructor(id: number = 0) { this.id = id; }
}

@ComponentV2
struct TaskList {
  @Local tasks: TaskModel[] = [];
  build() {
    Column() {
      Text("Tasks: " + this.tasks.length.toString())
    }
  }
}

// Valid: Plain class with V1 component
class PlainData {
  value: number = 0;
  label: string = "plain";
}

@Component
struct PlainDataDisplay {
  @State data: PlainData = new PlainData();
  build() {
    Column() {
      Text(this.data.label)
      Text(this.data.value.toString())
    }
  }
}

// Valid: V2 model hierarchy
@ObservedV2
class BaseViewModel {
  @Trace isLoading: boolean = false;
  @Trace error: string = "";
}
@ObservedV2
class DetailViewModel extends BaseViewModel {
  @Trace content: string = "";
  @Trace author: string = "";
}

@ComponentV2
struct DetailView {
  @Local vm: DetailViewModel = new DetailViewModel();
  build() {
    Column() {
      if (this.vm.isLoading) {
        Text("Loading...")
      } else {
        Text(this.vm.content)
        Text("By: " + this.vm.author)
      }
    }
  }
}

@Entry
@Component
struct ObservedV2InV1Entry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
