/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
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
// SyncMonitor Test

let y: string

function getFunc(): string {
  return y;
}

enum A {
  local = 'LocalOne'
}

let x: string = getFunc();

const localTwo: string = 'localTwo';
const localOne: string = localTwo

@Entry
@ComponentV2
struct Index {
  @Local @SyncMonitor('syncMonitorKey') syncMonitorValue: string = 'Hello'

  build() {
    Row() {
      Coma()
      ComV2()
      ComV21()
      DocSampleNestedClass()
      ComC()
    }
  }
}

@ComponentV2
struct Coma {
  @Local @SyncMonitor('syncMonitorKey') syncMonitorValue: string = 'Hello'
  @SyncMonitor(this.syncMonitorValue) syncMonitorOne: string = 'Hello'
  @SyncMonitor(localOne) syncMonitorTwo: string = 'Hello'
  @SyncMonitor(A.local) syncMonitorThree: string = 'Hello'

  build() {

  }
}

@Component
struct ComV2 {
  @State state: string = 'Hello'

  @SyncMonitor('state')
  onValueChange() {
  }

  build() {

  }
}

@Observed
class User {
  @Track id: number = 1
  @Track name: string = '1'

  @SyncMonitor('id', 'name')
  onValueChange() {
  }
}

@ComponentV2
struct ComV21 {
  @Local local: string = '1';
  @Param param: number = 1;
  value: string = 'hello'
  @Local testOne: User = new User()

  @SyncMonitor('value', 'nodefineVal')
  onValueChange() {
  }

  @SyncMonitor('value.*')
  onValueChange1() {
  }

  build() {

  }
}

@ObservedV2
class Person {
  @Track firstName: string = 'first'
  @Track lastName: string = 'last'
}

@ObservedV2
class Class1 {
  @Trace person: Person = new Person()
}

@ObservedV2
class Class0 {
  @Trace class1: Class1 = new Class1()
}

@ComponentV2
struct DocSampleNestedClass {
  @Local class0: Class0 = new Class0()

  @SyncMonitor('class0.class1.person')
  onPersonChange() {

  }

  @SyncMonitor('myTest')
  onPersonChange1() {

  }

  @Computed
  get myTest(): number {
    return 5;
  }

  build() {
    Column() {
      Button('#1 Class0 = new Class')
        .onClick(() => {
          this.class0 = new Class0()
        })

      Button('#2 Class0 = new Class, keep Class1')
        .onClick(() => {
          let newClass0 = new Class0()
          newClass0.class1.person = (this.class0 as Class0).class1.person;
          this.class0 = newClass0
        })

      Button('#3 Class0.class1 = new Class1')
        .onClick(() => {
          (this.class0 as Class0).class1 = new Class1();
        })

      Button('#4 Class0.class1.person = new Person')
        .onClick(() => {
          (this.class0 as Class0).class1.person = new Person();
        })

      Button('#5 Class0....person.last update')
        .onClick(() => {
          if (typeof (this.class0) === 'object') {
            (this.class0 as Class0).class1.person.lastName += '+';
          } else {

          }
        })
      Button('#6 Class0 toggle number <=> new Class0')
        .onClick(() => {

        })
    }
  }
}

@ComponentV2
struct ComC {
  @SyncMonitor('obsObj.*')
  syncMonitor1() {
  }

  @SyncMonitor('a[1].*')
  syncMonitor2() {
  }

  @SyncMonitor('*.propA')
  syncMonitor3() {
  }

  @SyncMonitor('obsObj.*.*')
  syncMonitor4() {
  }

  @SyncMonitor('obsObj.**')
  syncMonitor5() {
  }

  @SyncMonitor('*')
  syncMonitor6() {
  }

  @SyncMonitor('**')
  syncMonitor7() {
  }

  @SyncMonitor('*.*')
  syncMonitor8() {
  }

  @SyncMonitor('Obj*')
  syncMonitor9() {
  }

  @SyncMonitor('Obj.......*')
  syncMonitor10() {
  }

  build() {
    Row() {

    }
  }
}