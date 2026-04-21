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

@Observed
class DateObservedPacket {
  id: number
  timestamp: Date

  constructor(id: number) {
    this.id = id
    this.timestamp = new Date(2026, id % 12, (id % 28) + 1)
  }
}

@Component
struct DateObservedChild {
  @ObjectLink data: DateObservedPacket

  build() {
    Column() {
      Text('DateObservedChild')
      Text('id=' + this.data.id)
      Text('year=' + this.data.timestamp.getFullYear())
      Text('month=' + this.data.timestamp.getMonth())
      Text('day=' + this.data.timestamp.getDate())
    }
  }
}

@Component
struct DateObservedParent {
  @State data: DateObservedPacket = new DateObservedPacket(15)

  build() {
    Column() {
      DateObservedChild({ data: this.data })
      Text('DateObservedParent')
    }
  }
}

@Component
struct DateV1PropChild01 {
  @Prop source: Date = new Date(2026, 0, 1)

  build() {
    Column() {
      Text('DateV1PropChild01')
      Text('year=' + this.source.getFullYear())
      Text('month=' + this.source.getMonth())
      Text('day=' + this.source.getDate())
    }
  }
}

@Component
struct DateV1PropParent01 {
  @State dateState: Date = new Date(2026, 1, 2)

  build() {
    Column() {
      DateV1PropChild01({ source: this.dateState })
      Text('DateV1PropParent01')
      Text('year=' + this.dateState.getFullYear())
    }
  }
}

@Component
struct DateV1PropChild02 {
  @Prop source: Date = new Date(2026, 0, 1)

  build() {
    Column() {
      Text('DateV1PropChild02')
      Text('year=' + this.source.getFullYear())
      Text('month=' + this.source.getMonth())
      Text('day=' + this.source.getDate())
    }
  }
}

@Component
struct DateV1PropParent02 {
  @State dateState: Date = new Date(2026, 2, 3)

  build() {
    Column() {
      DateV1PropChild02({ source: this.dateState })
      Text('DateV1PropParent02')
      Text('year=' + this.dateState.getFullYear())
    }
  }
}

@Component
struct DateV1PropChild03 {
  @Prop source: Date = new Date(2026, 0, 1)

  build() {
    Column() {
      Text('DateV1PropChild03')
      Text('year=' + this.source.getFullYear())
      Text('month=' + this.source.getMonth())
      Text('day=' + this.source.getDate())
    }
  }
}

@Component
struct DateV1PropParent03 {
  @State dateState: Date = new Date(2026, 3, 4)

  build() {
    Column() {
      DateV1PropChild03({ source: this.dateState })
      Text('DateV1PropParent03')
      Text('year=' + this.dateState.getFullYear())
    }
  }
}

@Component
struct DateV1PropChild04 {
  @Prop source: Date = new Date(2026, 0, 1)

  build() {
    Column() {
      Text('DateV1PropChild04')
      Text('year=' + this.source.getFullYear())
      Text('month=' + this.source.getMonth())
      Text('day=' + this.source.getDate())
    }
  }
}

@Component
struct DateV1PropParent04 {
  @State dateState: Date = new Date(2026, 4, 5)

  build() {
    Column() {
      DateV1PropChild04({ source: this.dateState })
      Text('DateV1PropParent04')
      Text('year=' + this.dateState.getFullYear())
    }
  }
}

@Component
struct DateV1PropChild05 {
  @Prop source: Date = new Date(2026, 0, 1)

  build() {
    Column() {
      Text('DateV1PropChild05')
      Text('year=' + this.source.getFullYear())
      Text('month=' + this.source.getMonth())
      Text('day=' + this.source.getDate())
    }
  }
}

@Component
struct DateV1PropParent05 {
  @State dateState: Date = new Date(2026, 5, 6)

  build() {
    Column() {
      DateV1PropChild05({ source: this.dateState })
      Text('DateV1PropParent05')
      Text('year=' + this.dateState.getFullYear())
    }
  }
}

@Component
struct DateV1LinkChild01 {
  @Link source: Date

  build() {
    Column() {
      Text('DateV1LinkChild01')
      Text('year=' + this.source.getFullYear())
      Text('month=' + this.source.getMonth())
      Text('day=' + this.source.getDate())
    }
  }
}

@Component
struct DateV1LinkParent01 {
  @State dateState: Date = new Date(2026, 4, 9)

  build() {
    Column() {
      DateV1LinkChild01({ source: $dateState })
      Text('DateV1LinkParent01')
      Text('year=' + this.dateState.getFullYear())
    }
  }
}

@Component
struct DateV1LinkChild02 {
  @Link source: Date

  build() {
    Column() {
      Text('DateV1LinkChild02')
      Text('year=' + this.source.getFullYear())
      Text('month=' + this.source.getMonth())
      Text('day=' + this.source.getDate())
    }
  }
}

@Component
struct DateV1LinkParent02 {
  @State dateState: Date = new Date(2026, 5, 10)

  build() {
    Column() {
      DateV1LinkChild02({ source: $dateState })
      Text('DateV1LinkParent02')
      Text('year=' + this.dateState.getFullYear())
    }
  }
}

@Component
struct DateV1LinkChild03 {
  @Link source: Date

  build() {
    Column() {
      Text('DateV1LinkChild03')
      Text('year=' + this.source.getFullYear())
      Text('month=' + this.source.getMonth())
      Text('day=' + this.source.getDate())
    }
  }
}

@Component
struct DateV1LinkParent03 {
  @State dateState: Date = new Date(2026, 6, 11)

  build() {
    Column() {
      DateV1LinkChild03({ source: $dateState })
      Text('DateV1LinkParent03')
      Text('year=' + this.dateState.getFullYear())
    }
  }
}

@Component
struct DateV1LinkChild04 {
  @Link source: Date

  build() {
    Column() {
      Text('DateV1LinkChild04')
      Text('year=' + this.source.getFullYear())
      Text('month=' + this.source.getMonth())
      Text('day=' + this.source.getDate())
    }
  }
}

@Component
struct DateV1LinkParent04 {
  @State dateState: Date = new Date(2026, 7, 12)

  build() {
    Column() {
      DateV1LinkChild04({ source: $dateState })
      Text('DateV1LinkParent04')
      Text('year=' + this.dateState.getFullYear())
    }
  }
}

@ComponentV2
struct DateV2ParamChild01 {
  @Param source: Date = new Date(2026, 0, 1)

  build() {
    Column() {
      Text('DateV2ParamChild01')
      Text('year=' + this.source.getFullYear())
      Text('month=' + this.source.getMonth())
      Text('day=' + this.source.getDate())
    }
  }
}

@ComponentV2
struct DateV2ParamParent01 {
  @Local dateState: Date = new Date(2026, 6, 15)

  build() {
    Column() {
      DateV2ParamChild01({ source: this.dateState })
      Text('DateV2ParamParent01')
      Text('year=' + this.dateState.getFullYear())
    }
  }
}

@ComponentV2
struct DateV2ParamChild02 {
  @Param source: Date = new Date(2026, 0, 1)

  build() {
    Column() {
      Text('DateV2ParamChild02')
      Text('year=' + this.source.getFullYear())
      Text('month=' + this.source.getMonth())
      Text('day=' + this.source.getDate())
    }
  }
}

@ComponentV2
struct DateV2ParamParent02 {
  @Local dateState: Date = new Date(2026, 7, 16)

  build() {
    Column() {
      DateV2ParamChild02({ source: this.dateState })
      Text('DateV2ParamParent02')
      Text('year=' + this.dateState.getFullYear())
    }
  }
}

@ComponentV2
struct DateV2ParamChild03 {
  @Param source: Date = new Date(2026, 0, 1)

  build() {
    Column() {
      Text('DateV2ParamChild03')
      Text('year=' + this.source.getFullYear())
      Text('month=' + this.source.getMonth())
      Text('day=' + this.source.getDate())
    }
  }
}

@ComponentV2
struct DateV2ParamParent03 {
  @Local dateState: Date = new Date(2026, 8, 17)

  build() {
    Column() {
      DateV2ParamChild03({ source: this.dateState })
      Text('DateV2ParamParent03')
      Text('year=' + this.dateState.getFullYear())
    }
  }
}

@ComponentV2
struct DateV2ParamChild04 {
  @Param source: Date = new Date(2026, 0, 1)

  build() {
    Column() {
      Text('DateV2ParamChild04')
      Text('year=' + this.source.getFullYear())
      Text('month=' + this.source.getMonth())
      Text('day=' + this.source.getDate())
    }
  }
}

@ComponentV2
struct DateV2ParamParent04 {
  @Local dateState: Date = new Date(2026, 9, 18)

  build() {
    Column() {
      DateV2ParamChild04({ source: this.dateState })
      Text('DateV2ParamParent04')
      Text('year=' + this.dateState.getFullYear())
    }
  }
}

@ComponentV2
struct DateV2EventChild01 {
  @Param source: Date = new Date(2026, 0, 1)
  @Event onChange: (value: Date) => void = (value: Date) => {}

  build() {
    Column() {
      Text('DateV2EventChild01')
      Text('year=' + this.source.getFullYear())
      Text('month=' + this.source.getMonth())
      Text('day=' + this.source.getDate())
    }
  }
}

@ComponentV2
struct DateV2EventParent01 {
  @Local dateState: Date = new Date(2026, 8, 19)

  build() {
    Column() {
      DateV2EventChild01({
        source: this.dateState,
        onChange: (value: Date) => { this.dateState = value }
      })
      Text('DateV2EventParent01')
      Text('year=' + this.dateState.getFullYear())
    }
  }
}

@ComponentV2
struct DateV2EventChild02 {
  @Param source: Date = new Date(2026, 0, 1)
  @Event onChange: (value: Date) => void = (value: Date) => {}

  build() {
    Column() {
      Text('DateV2EventChild02')
      Text('year=' + this.source.getFullYear())
      Text('month=' + this.source.getMonth())
      Text('day=' + this.source.getDate())
    }
  }
}

@ComponentV2
struct DateV2EventParent02 {
  @Local dateState: Date = new Date(2026, 9, 20)

  build() {
    Column() {
      DateV2EventChild02({
        source: this.dateState,
        onChange: (value: Date) => { this.dateState = value }
      })
      Text('DateV2EventParent02')
      Text('year=' + this.dateState.getFullYear())
    }
  }
}

@ComponentV2
struct DateV2EventChild03 {
  @Param source: Date = new Date(2026, 0, 1)
  @Event onChange: (value: Date) => void = (value: Date) => {}

  build() {
    Column() {
      Text('DateV2EventChild03')
      Text('year=' + this.source.getFullYear())
      Text('month=' + this.source.getMonth())
      Text('day=' + this.source.getDate())
    }
  }
}

@ComponentV2
struct DateV2EventParent03 {
  @Local dateState: Date = new Date(2026, 10, 21)

  build() {
    Column() {
      DateV2EventChild03({
        source: this.dateState,
        onChange: (value: Date) => { this.dateState = value }
      })
      Text('DateV2EventParent03')
      Text('year=' + this.dateState.getFullYear())
    }
  }
}

@Entry
@Component
struct DateStateValidationEntry {
  @State title: string = 'Date State Validation'

  build() {
    Column() {
      Text(this.title)
      DateObservedParent()

      DateV1PropParent01()
      DateV1PropParent02()
      DateV1PropParent03()
      DateV1PropParent04()
      DateV1PropParent05()

      DateV1LinkParent01()
      DateV1LinkParent02()
      DateV1LinkParent03()
      DateV1LinkParent04()

      DateV2ParamParent01()
      DateV2ParamParent02()
      DateV2ParamParent03()
      DateV2ParamParent04()

      DateV2EventParent01()
      DateV2EventParent02()
      DateV2EventParent03()
    }
  }
}
