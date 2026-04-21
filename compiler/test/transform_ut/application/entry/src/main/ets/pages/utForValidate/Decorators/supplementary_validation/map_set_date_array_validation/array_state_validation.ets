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
class ArrayObservedPacket {
  id: number
  list: number[]

  constructor(id: number) {
    this.id = id
    this.list = [id, id + 1, id + 2, id + 3]
  }
}

@Component
struct ArrayObservedChild {
  @ObjectLink data: ArrayObservedPacket

  build() {
    Column() {
      Text('ArrayObservedChild')
      Text('id=' + this.data.id)
      Text('len=' + this.data.list.length)
      Text('head=' + (this.data.list.length > 0 ? this.data.list[0] : -1))
      Text('tail=' + (this.data.list.length > 0 ? this.data.list[this.data.list.length - 1] : -1))
    }
  }
}

@Component
struct ArrayObservedParent {
  @State data: ArrayObservedPacket = new ArrayObservedPacket(5)

  build() {
    Column() {
      ArrayObservedChild({ data: this.data })
      Text('ArrayObservedParent')
    }
  }
}

@Component
struct ArrayV1PropChild01 {
  @Prop source: number[] = []

  build() {
    Column() {
      Text('ArrayV1PropChild01')
      Text('len=' + this.source.length)
      Text('head=' + (this.source.length > 0 ? this.source[0] : -1))
      Text('v02=' + (this.source.length > 1 ? this.source[1] : -1))
      Text('v03=' + (this.source.length > 2 ? this.source[2] : -1))
    }
  }
}

@Component
struct ArrayV1PropParent01 {
  @State arrState: number[] = [1, 2, 3, 4]

  build() {
    Column() {
      ArrayV1PropChild01({ source: this.arrState })
      Text('ArrayV1PropParent01')
      Text('len=' + this.arrState.length)
    }
  }
}

@Component
struct ArrayV1PropChild02 {
  @Prop source: number[] = []

  build() {
    Column() {
      Text('ArrayV1PropChild02')
      Text('len=' + this.source.length)
      Text('head=' + (this.source.length > 0 ? this.source[0] : -1))
      Text('join=' + this.source.join(','))
      Text('last=' + (this.source.length > 0 ? this.source[this.source.length - 1] : -1))
    }
  }
}

@Component
struct ArrayV1PropParent02 {
  @State arrState: number[] = [2, 3, 4, 5]

  build() {
    Column() {
      ArrayV1PropChild02({ source: this.arrState })
      Text('ArrayV1PropParent02')
      Text('len=' + this.arrState.length)
    }
  }
}

@Component
struct ArrayV1PropChild03 {
  @Prop source: number[] = []

  build() {
    Column() {
      Text('ArrayV1PropChild03')
      Text('len=' + this.source.length)
      Text('head=' + (this.source.length > 0 ? this.source[0] : -1))
      Text('v04=' + (this.source.length > 1 ? this.source[1] : -1))
      Text('v05=' + (this.source.length > 2 ? this.source[2] : -1))
    }
  }
}

@Component
struct ArrayV1PropParent03 {
  @State arrState: number[] = [3, 4, 5, 6]

  build() {
    Column() {
      ArrayV1PropChild03({ source: this.arrState })
      Text('ArrayV1PropParent03')
      Text('len=' + this.arrState.length)
    }
  }
}

@Component
struct ArrayV1PropChild04 {
  @Prop source: number[] = []

  build() {
    Column() {
      Text('ArrayV1PropChild04')
      Text('len=' + this.source.length)
      Text('head=' + (this.source.length > 0 ? this.source[0] : -1))
      Text('join=' + this.source.join(','))
      Text('last=' + (this.source.length > 0 ? this.source[this.source.length - 1] : -1))
    }
  }
}

@Component
struct ArrayV1PropParent04 {
  @State arrState: number[] = [4, 5, 6, 7]

  build() {
    Column() {
      ArrayV1PropChild04({ source: this.arrState })
      Text('ArrayV1PropParent04')
      Text('len=' + this.arrState.length)
    }
  }
}

@Component
struct ArrayV1PropChild05 {
  @Prop source: number[] = []

  build() {
    Column() {
      Text('ArrayV1PropChild05')
      Text('len=' + this.source.length)
      Text('head=' + (this.source.length > 0 ? this.source[0] : -1))
      Text('v06=' + (this.source.length > 1 ? this.source[1] : -1))
      Text('v07=' + (this.source.length > 2 ? this.source[2] : -1))
    }
  }
}

@Component
struct ArrayV1PropParent05 {
  @State arrState: number[] = [5, 6, 7, 8]

  build() {
    Column() {
      ArrayV1PropChild05({ source: this.arrState })
      Text('ArrayV1PropParent05')
      Text('len=' + this.arrState.length)
    }
  }
}

@Component
struct ArrayV1LinkChild01 {
  @Link source: number[]

  build() {
    Column() {
      Text('ArrayV1LinkChild01')
      Text('len=' + this.source.length)
      Text('head=' + (this.source.length > 0 ? this.source[0] : -1))
      Text('tail=' + (this.source.length > 0 ? this.source[this.source.length - 1] : -1))
    }
  }
}

@Component
struct ArrayV1LinkParent01 {
  @State arrState: number[] = [1, 11, 21]

  build() {
    Column() {
      ArrayV1LinkChild01({ source: $arrState })
      Text('ArrayV1LinkParent01')
      Text('len=' + this.arrState.length)
    }
  }
}

@Component
struct ArrayV1LinkChild02 {
  @Link source: number[]

  build() {
    Column() {
      Text('ArrayV1LinkChild02')
      Text('len=' + this.source.length)
      Text('head=' + (this.source.length > 0 ? this.source[0] : -1))
      Text('tail=' + (this.source.length > 0 ? this.source[this.source.length - 1] : -1))
    }
  }
}

@Component
struct ArrayV1LinkParent02 {
  @State arrState: number[] = [2, 12, 22]

  build() {
    Column() {
      ArrayV1LinkChild02({ source: $arrState })
      Text('ArrayV1LinkParent02')
      Text('len=' + this.arrState.length)
    }
  }
}

@Component
struct ArrayV1LinkChild03 {
  @Link source: number[]

  build() {
    Column() {
      Text('ArrayV1LinkChild03')
      Text('len=' + this.source.length)
      Text('head=' + (this.source.length > 0 ? this.source[0] : -1))
      Text('tail=' + (this.source.length > 0 ? this.source[this.source.length - 1] : -1))
    }
  }
}

@Component
struct ArrayV1LinkParent03 {
  @State arrState: number[] = [3, 13, 23]

  build() {
    Column() {
      ArrayV1LinkChild03({ source: $arrState })
      Text('ArrayV1LinkParent03')
      Text('len=' + this.arrState.length)
    }
  }
}

@Component
struct ArrayV1LinkChild04 {
  @Link source: number[]

  build() {
    Column() {
      Text('ArrayV1LinkChild04')
      Text('len=' + this.source.length)
      Text('head=' + (this.source.length > 0 ? this.source[0] : -1))
      Text('tail=' + (this.source.length > 0 ? this.source[this.source.length - 1] : -1))
    }
  }
}

@Component
struct ArrayV1LinkParent04 {
  @State arrState: number[] = [4, 14, 24]

  build() {
    Column() {
      ArrayV1LinkChild04({ source: $arrState })
      Text('ArrayV1LinkParent04')
      Text('len=' + this.arrState.length)
    }
  }
}

@ComponentV2
struct ArrayV2ParamChild01 {
  @Param source: number[] = []

  build() {
    Column() {
      Text('ArrayV2ParamChild01')
      Text('len=' + this.source.length)
      Text('join=' + this.source.join('|'))
      Text('tail=' + (this.source.length > 0 ? this.source[this.source.length - 1] : -1))
    }
  }
}

@ComponentV2
struct ArrayV2ParamParent01 {
  @Local arrState: number[] = [1, 31, 41]

  build() {
    Column() {
      ArrayV2ParamChild01({ source: this.arrState })
      Text('ArrayV2ParamParent01')
      Text('len=' + this.arrState.length)
    }
  }
}

@ComponentV2
struct ArrayV2ParamChild02 {
  @Param source: number[] = []

  build() {
    Column() {
      Text('ArrayV2ParamChild02')
      Text('len=' + this.source.length)
      Text('join=' + this.source.join('|'))
      Text('tail=' + (this.source.length > 0 ? this.source[this.source.length - 1] : -1))
    }
  }
}

@ComponentV2
struct ArrayV2ParamParent02 {
  @Local arrState: number[] = [2, 32, 42]

  build() {
    Column() {
      ArrayV2ParamChild02({ source: this.arrState })
      Text('ArrayV2ParamParent02')
      Text('len=' + this.arrState.length)
    }
  }
}

@ComponentV2
struct ArrayV2ParamChild03 {
  @Param source: number[] = []

  build() {
    Column() {
      Text('ArrayV2ParamChild03')
      Text('len=' + this.source.length)
      Text('join=' + this.source.join('|'))
      Text('tail=' + (this.source.length > 0 ? this.source[this.source.length - 1] : -1))
    }
  }
}

@ComponentV2
struct ArrayV2ParamParent03 {
  @Local arrState: number[] = [3, 33, 43]

  build() {
    Column() {
      ArrayV2ParamChild03({ source: this.arrState })
      Text('ArrayV2ParamParent03')
      Text('len=' + this.arrState.length)
    }
  }
}

@ComponentV2
struct ArrayV2ParamChild04 {
  @Param source: number[] = []

  build() {
    Column() {
      Text('ArrayV2ParamChild04')
      Text('len=' + this.source.length)
      Text('join=' + this.source.join('|'))
      Text('tail=' + (this.source.length > 0 ? this.source[this.source.length - 1] : -1))
    }
  }
}

@ComponentV2
struct ArrayV2ParamParent04 {
  @Local arrState: number[] = [4, 34, 44]

  build() {
    Column() {
      ArrayV2ParamChild04({ source: this.arrState })
      Text('ArrayV2ParamParent04')
      Text('len=' + this.arrState.length)
    }
  }
}

@ComponentV2
struct ArrayV2EventChild01 {
  @Param source: number[] = []
  @Event onChange: (value: number[]) => void = (value: number[]) => {}

  build() {
    Column() {
      Text('ArrayV2EventChild01')
      Text('len=' + this.source.length)
      Text('join=' + this.source.join(':'))
      Text('head=' + (this.source.length > 0 ? this.source[0] : -1))
    }
  }
}

@ComponentV2
struct ArrayV2EventParent01 {
  @Local arrState: number[] = [1, 51, 61]

  build() {
    Column() {
      ArrayV2EventChild01({
        source: this.arrState,
        onChange: (value: number[]) => { this.arrState = value }
      })
      Text('ArrayV2EventParent01')
      Text('len=' + this.arrState.length)
    }
  }
}

@ComponentV2
struct ArrayV2EventChild02 {
  @Param source: number[] = []
  @Event onChange: (value: number[]) => void = (value: number[]) => {}

  build() {
    Column() {
      Text('ArrayV2EventChild02')
      Text('len=' + this.source.length)
      Text('join=' + this.source.join(':'))
      Text('head=' + (this.source.length > 0 ? this.source[0] : -1))
    }
  }
}

@ComponentV2
struct ArrayV2EventParent02 {
  @Local arrState: number[] = [2, 52, 62]

  build() {
    Column() {
      ArrayV2EventChild02({
        source: this.arrState,
        onChange: (value: number[]) => { this.arrState = value }
      })
      Text('ArrayV2EventParent02')
      Text('len=' + this.arrState.length)
    }
  }
}

@ComponentV2
struct ArrayV2EventChild03 {
  @Param source: number[] = []
  @Event onChange: (value: number[]) => void = (value: number[]) => {}

  build() {
    Column() {
      Text('ArrayV2EventChild03')
      Text('len=' + this.source.length)
      Text('join=' + this.source.join(':'))
      Text('head=' + (this.source.length > 0 ? this.source[0] : -1))
    }
  }
}

@ComponentV2
struct ArrayV2EventParent03 {
  @Local arrState: number[] = [3, 53, 63]

  build() {
    Column() {
      ArrayV2EventChild03({
        source: this.arrState,
        onChange: (value: number[]) => { this.arrState = value }
      })
      Text('ArrayV2EventParent03')
      Text('len=' + this.arrState.length)
    }
  }
}

@Entry
@Component
struct ArrayStateValidationEntry {
  @State title: string = 'Array State Validation'

  build() {
    Column() {
      Text(this.title)
      ArrayObservedParent()

      ArrayV1PropParent01()
      ArrayV1PropParent02()
      ArrayV1PropParent03()
      ArrayV1PropParent04()
      ArrayV1PropParent05()

      ArrayV1LinkParent01()
      ArrayV1LinkParent02()
      ArrayV1LinkParent03()
      ArrayV1LinkParent04()

      ArrayV2ParamParent01()
      ArrayV2ParamParent02()
      ArrayV2ParamParent03()
      ArrayV2ParamParent04()

      ArrayV2EventParent01()
      ArrayV2EventParent02()
      ArrayV2EventParent03()
    }
  }
}
