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
 * V2 decorators incorrectly used in class context.
 */

// --- Error Cases ---

// Error 10905337: @Param in @ObservedV2 class
@ObservedV2
class WithParam { @Param value: string = "test"; }

// Error 10905337: @Local in @ObservedV2 class
@ObservedV2
class WithLocal { @Local data: number = 0; }

// --- Valid Patterns ---

@ObservedV2
class DataProcessor {
  @Trace data: number = 0;
  @Trace label: string = "Processor";
  process(): number { return this.data * 2; }
  reset(): void { this.data = 0; }
}

@ComponentV2
struct ProcessorView {
  @Local processor: DataProcessor = new DataProcessor();
  build() {
    Column() {
      Text(this.processor.label)
      Text("Data: " + this.processor.data.toString())
      Text("Processed: " + this.processor.process().toString())
      Button("Add Data").onClick(() => this.processor.update(this.processor.data + 10))
    }
  }
}

@Observed
class LegacyModel { value: number = 100; name: string = "Legacy"; }

@Component
struct LegacyView {
  @State model: LegacyModel = new LegacyModel();
  build() {
    Column() {
      Text(this.model.name)
      Text("Value: " + this.model.value.toString())
    }
  }
}

@ObservedV2
class TaskModel {
  @Trace title: string = "Task";
  @Trace done: boolean = false;
}

@ComponentV2
struct TaskList {
  @Local tasks: TaskModel[] = [new TaskModel(), new TaskModel()];
  build() {
    Column() {
      Text("Tasks: " + this.tasks.length.toString())
      ForEach(this.tasks, (task: TaskModel, i: number) => {
        Text((i+1).toString() + ". " + task.title + (task.done ? " [Done]" : ""))
      }, (task: TaskModel, i: number) => i.toString())
      Button("Complete First").onClick(() => { if (this.tasks.length > 0) this.tasks[0].done = true })
    }
  }
}

@Entry
@Component
struct V2DecoratorInClassEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
