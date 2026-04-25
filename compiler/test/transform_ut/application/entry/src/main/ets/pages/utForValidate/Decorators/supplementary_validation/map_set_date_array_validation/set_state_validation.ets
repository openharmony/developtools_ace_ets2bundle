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
class SetObservedPacket {
  id: number
  tags: Set<string>

  constructor(id: number) {
    this.id = id
    this.tags = new Set([
      'tag_' + id.toString(),
      'tag_' + (id + 1).toString(),
      'tag_' + (id + 2).toString()
    ])
  }
}

@Component
struct SetObservedChild {
  @ObjectLink data: SetObservedPacket

  build() {
    Column() {
      Text('SetObservedChild')
      Text('id=' + this.data.id)
      Text('size=' + this.data.tags.size)
      Text('values=' + Array.from(this.data.tags.values()).join(','))
    }
  }
}

@Component
struct SetObservedParent {
  @State data: SetObservedPacket = new SetObservedPacket(7)

  build() {
    Column() {
      SetObservedChild({ data: this.data })
      Text('SetObservedParent')
    }
  }
}

@Component
struct SetV1PropChild01 {
  @Prop source: Set<string> = new Set()

  build() {
    Column() {
      Text('SetV1PropChild01')
      Text('size=' + this.source.size)
      Text('has s01=' + this.source.has('s01'))
      Text('first=' + (Array.from(this.source.values())[0] ?? 'none'))
      Text('has s03=' + this.source.has('s03'))
    }
  }
}

@Component
struct SetV1PropParent01 {
  @State setState: Set<string> = new Set([
    's01',
    's02',
    's03'
  ])

  build() {
    Column() {
      SetV1PropChild01({ source: this.setState })
      Text('SetV1PropParent01')
      Text('size=' + this.setState.size)
    }
  }
}

@Component
struct SetV1PropChild02 {
  @Prop source: Set<string> = new Set()

  build() {
    Column() {
      Text('SetV1PropChild02')
      Text('size=' + this.source.size)
      Text('has s02=' + this.source.has('s02'))
      Text('values=' + Array.from(this.source.values()).join(','))
      Text('has s03=' + this.source.has('s03'))
    }
  }
}

@Component
struct SetV1PropParent02 {
  @State setState: Set<string> = new Set([
    's02',
    's03',
    's04'
  ])

  build() {
    Column() {
      SetV1PropChild02({ source: this.setState })
      Text('SetV1PropParent02')
      Text('size=' + this.setState.size)
    }
  }
}

@Component
struct SetV1PropChild03 {
  @Prop source: Set<string> = new Set()

  build() {
    Column() {
      Text('SetV1PropChild03')
      Text('size=' + this.source.size)
      Text('has s03=' + this.source.has('s03'))
      Text('first=' + (Array.from(this.source.values())[0] ?? 'none'))
      Text('has s05=' + this.source.has('s05'))
    }
  }
}

@Component
struct SetV1PropParent03 {
  @State setState: Set<string> = new Set([
    's03',
    's04',
    's05'
  ])

  build() {
    Column() {
      SetV1PropChild03({ source: this.setState })
      Text('SetV1PropParent03')
      Text('size=' + this.setState.size)
    }
  }
}

@Component
struct SetV1PropChild04 {
  @Prop source: Set<string> = new Set()

  build() {
    Column() {
      Text('SetV1PropChild04')
      Text('size=' + this.source.size)
      Text('has s04=' + this.source.has('s04'))
      Text('values=' + Array.from(this.source.values()).join(','))
      Text('has s05=' + this.source.has('s05'))
    }
  }
}

@Component
struct SetV1PropParent04 {
  @State setState: Set<string> = new Set([
    's04',
    's05',
    's06'
  ])

  build() {
    Column() {
      SetV1PropChild04({ source: this.setState })
      Text('SetV1PropParent04')
      Text('size=' + this.setState.size)
    }
  }
}

@Component
struct SetV1PropChild05 {
  @Prop source: Set<string> = new Set()

  build() {
    Column() {
      Text('SetV1PropChild05')
      Text('size=' + this.source.size)
      Text('has s05=' + this.source.has('s05'))
      Text('first=' + (Array.from(this.source.values())[0] ?? 'none'))
      Text('has s07=' + this.source.has('s07'))
    }
  }
}

@Component
struct SetV1PropParent05 {
  @State setState: Set<string> = new Set([
    's05',
    's06',
    's07'
  ])

  build() {
    Column() {
      SetV1PropChild05({ source: this.setState })
      Text('SetV1PropParent05')
      Text('size=' + this.setState.size)
    }
  }
}

@Component
struct SetV1PropChild06 {
  @Prop source: Set<string> = new Set()

  build() {
    Column() {
      Text('SetV1PropChild06')
      Text('size=' + this.source.size)
      Text('has s06=' + this.source.has('s06'))
      Text('values=' + Array.from(this.source.values()).join(','))
      Text('has s07=' + this.source.has('s07'))
    }
  }
}

@Component
struct SetV1PropParent06 {
  @State setState: Set<string> = new Set([
    's06',
    's07',
    's08'
  ])

  build() {
    Column() {
      SetV1PropChild06({ source: this.setState })
      Text('SetV1PropParent06')
      Text('size=' + this.setState.size)
    }
  }
}

@ComponentV2
struct SetV2ParamChild01 {
  @Param source: Set<string> = new Set()

  build() {
    Column() {
      Text('SetV2ParamChild01')
      Text('size=' + this.source.size)
      Text('first=' + (Array.from(this.source.values())[0] ?? 'none'))
      Text('has ss21=' + this.source.has('ss21'))
    }
  }
}

@ComponentV2
struct SetV2ParamParent01 {
  @Local setState: Set<string> = new Set([
    'ss01',
    'ss21'
  ])

  build() {
    Column() {
      SetV2ParamChild01({ source: this.setState })
      Text('SetV2ParamParent01')
      Text('size=' + this.setState.size)
    }
  }
}

@ComponentV2
struct SetV2ParamChild02 {
  @Param source: Set<string> = new Set()

  build() {
    Column() {
      Text('SetV2ParamChild02')
      Text('size=' + this.source.size)
      Text('values=' + Array.from(this.source.values()).join('|'))
      Text('has ss02=' + this.source.has('ss02'))
    }
  }
}

@ComponentV2
struct SetV2ParamParent02 {
  @Local setState: Set<string> = new Set([
    'ss02',
    'ss22'
  ])

  build() {
    Column() {
      SetV2ParamChild02({ source: this.setState })
      Text('SetV2ParamParent02')
      Text('size=' + this.setState.size)
    }
  }
}

@ComponentV2
struct SetV2ParamChild03 {
  @Param source: Set<string> = new Set()

  build() {
    Column() {
      Text('SetV2ParamChild03')
      Text('size=' + this.source.size)
      Text('first=' + (Array.from(this.source.values())[0] ?? 'none'))
      Text('has ss23=' + this.source.has('ss23'))
    }
  }
}

@ComponentV2
struct SetV2ParamParent03 {
  @Local setState: Set<string> = new Set([
    'ss03',
    'ss23'
  ])

  build() {
    Column() {
      SetV2ParamChild03({ source: this.setState })
      Text('SetV2ParamParent03')
      Text('size=' + this.setState.size)
    }
  }
}

@ComponentV2
struct SetV2ParamChild04 {
  @Param source: Set<string> = new Set()

  build() {
    Column() {
      Text('SetV2ParamChild04')
      Text('size=' + this.source.size)
      Text('values=' + Array.from(this.source.values()).join('|'))
      Text('has ss04=' + this.source.has('ss04'))
    }
  }
}

@ComponentV2
struct SetV2ParamParent04 {
  @Local setState: Set<string> = new Set([
    'ss04',
    'ss24'
  ])

  build() {
    Column() {
      SetV2ParamChild04({ source: this.setState })
      Text('SetV2ParamParent04')
      Text('size=' + this.setState.size)
    }
  }
}

@ComponentV2
struct SetV2EventChild01 {
  @Param source: Set<string> = new Set()
  @Event onChange: (value: Set<string>) => void = (value: Set<string>) => {}

  build() {
    Column() {
      Text('SetV2EventChild01')
      Text('size=' + this.source.size)
      Text('values=' + Array.from(this.source.values()).join(':'))
      Text('has se01=' + this.source.has('se01'))
    }
  }
}

@ComponentV2
struct SetV2EventParent01 {
  @Local setState: Set<string> = new Set([
    'se01',
    'se41'
  ])

  build() {
    Column() {
      SetV2EventChild01({
        source: this.setState,
        onChange: (value: Set<string>) => { this.setState = value }
      })
      Text('SetV2EventParent01')
      Text('size=' + this.setState.size)
    }
  }
}

@ComponentV2
struct SetV2EventChild02 {
  @Param source: Set<string> = new Set()
  @Event onChange: (value: Set<string>) => void = (value: Set<string>) => {}

  build() {
    Column() {
      Text('SetV2EventChild02')
      Text('size=' + this.source.size)
      Text('values=' + Array.from(this.source.values()).join(':'))
      Text('has se02=' + this.source.has('se02'))
    }
  }
}

@ComponentV2
struct SetV2EventParent02 {
  @Local setState: Set<string> = new Set([
    'se02',
    'se42'
  ])

  build() {
    Column() {
      SetV2EventChild02({
        source: this.setState,
        onChange: (value: Set<string>) => { this.setState = value }
      })
      Text('SetV2EventParent02')
      Text('size=' + this.setState.size)
    }
  }
}

@ComponentV2
struct SetV2EventChild03 {
  @Param source: Set<string> = new Set()
  @Event onChange: (value: Set<string>) => void = (value: Set<string>) => {}

  build() {
    Column() {
      Text('SetV2EventChild03')
      Text('size=' + this.source.size)
      Text('values=' + Array.from(this.source.values()).join(':'))
      Text('has se03=' + this.source.has('se03'))
    }
  }
}

@ComponentV2
struct SetV2EventParent03 {
  @Local setState: Set<string> = new Set([
    'se03',
    'se43'
  ])

  build() {
    Column() {
      SetV2EventChild03({
        source: this.setState,
        onChange: (value: Set<string>) => { this.setState = value }
      })
      Text('SetV2EventParent03')
      Text('size=' + this.setState.size)
    }
  }
}

@Entry
@Component
struct SetStateValidationEntry {
  @State title: string = 'Set State Validation'

  build() {
    Column() {
      Text(this.title)
      SetObservedParent()

      SetV1PropParent01()
      SetV1PropParent02()
      SetV1PropParent03()
      SetV1PropParent04()
      SetV1PropParent05()
      SetV1PropParent06()

      SetV2ParamParent01()
      SetV2ParamParent02()
      SetV2ParamParent03()
      SetV2ParamParent04()

      SetV2EventParent01()
      SetV2EventParent02()
      SetV2EventParent03()
    }
  }
}
