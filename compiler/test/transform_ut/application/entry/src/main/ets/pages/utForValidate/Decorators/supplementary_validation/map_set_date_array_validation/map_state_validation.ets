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
class MapObservedPacket {
  id: number
  bucket: Map<string, number>

  constructor(id: number) {
    this.id = id
    this.bucket = new Map([
      ['id', id],
      ['double', id * 2],
      ['triple', id * 3]
    ])
  }
}

@Component
struct MapObservedChild {
  @ObjectLink data: MapObservedPacket

  build() {
    Column() {
      Text('MapObservedChild')
      Text('id=' + this.data.id)
      Text('size=' + this.data.bucket.size)
      Text('double=' + (this.data.bucket.get('double') ?? -1))
    }
  }
}

@Component
struct MapObservedParent {
  @State data: MapObservedPacket = new MapObservedPacket(9)

  build() {
    Column() {
      MapObservedChild({ data: this.data })
      Text('MapObservedParent')
    }
  }
}

@Component
struct MapV1PropChild01 {
  @Prop source: Map<string, number> = new Map()

  build() {
    Column() {
      Text('MapV1PropChild01')
      Text('size=' + this.source.size)
      Text('has m01=' + this.source.has('m01'))
      Text('m02=' + (this.source.get('m02') ?? -1))
      Text('m03=' + (this.source.get('m03') ?? -1))
    }
  }
}

@Component
struct MapV1PropParent01 {
  @State mapState: Map<string, number> = new Map([
    ['m01', 1],
    ['m02', 2],
    ['m03', 3]
  ])

  build() {
    Column() {
      MapV1PropChild01({ source: this.mapState })
      Text('MapV1PropParent01')
      Text('size=' + this.mapState.size)
    }
  }
}

@Component
struct MapV1PropChild02 {
  @Prop source: Map<string, number> = new Map()

  build() {
    Column() {
      Text('MapV1PropChild02')
      Text('size=' + this.source.size)
      Text('has m02=' + this.source.has('m02'))
      Text('keys=' + Array.from(this.source.keys()).join(','))
      Text('values=' + Array.from(this.source.values()).join(','))
    }
  }
}

@Component
struct MapV1PropParent02 {
  @State mapState: Map<string, number> = new Map([
    ['m02', 2],
    ['m03', 3],
    ['m04', 4]
  ])

  build() {
    Column() {
      MapV1PropChild02({ source: this.mapState })
      Text('MapV1PropParent02')
      Text('size=' + this.mapState.size)
    }
  }
}

@Component
struct MapV1PropChild03 {
  @Prop source: Map<string, number> = new Map()

  build() {
    Column() {
      Text('MapV1PropChild03')
      Text('size=' + this.source.size)
      Text('has m03=' + this.source.has('m03'))
      Text('m04=' + (this.source.get('m04') ?? -1))
      Text('m05=' + (this.source.get('m05') ?? -1))
    }
  }
}

@Component
struct MapV1PropParent03 {
  @State mapState: Map<string, number> = new Map([
    ['m03', 3],
    ['m04', 4],
    ['m05', 5]
  ])

  build() {
    Column() {
      MapV1PropChild03({ source: this.mapState })
      Text('MapV1PropParent03')
      Text('size=' + this.mapState.size)
    }
  }
}

@Component
struct MapV1PropChild04 {
  @Prop source: Map<string, number> = new Map()

  build() {
    Column() {
      Text('MapV1PropChild04')
      Text('size=' + this.source.size)
      Text('has m04=' + this.source.has('m04'))
      Text('keys=' + Array.from(this.source.keys()).join(','))
      Text('values=' + Array.from(this.source.values()).join(','))
    }
  }
}

@Component
struct MapV1PropParent04 {
  @State mapState: Map<string, number> = new Map([
    ['m04', 4],
    ['m05', 5],
    ['m06', 6]
  ])

  build() {
    Column() {
      MapV1PropChild04({ source: this.mapState })
      Text('MapV1PropParent04')
      Text('size=' + this.mapState.size)
    }
  }
}

@Component
struct MapV1PropChild05 {
  @Prop source: Map<string, number> = new Map()

  build() {
    Column() {
      Text('MapV1PropChild05')
      Text('size=' + this.source.size)
      Text('has m05=' + this.source.has('m05'))
      Text('m06=' + (this.source.get('m06') ?? -1))
      Text('m07=' + (this.source.get('m07') ?? -1))
    }
  }
}

@Component
struct MapV1PropParent05 {
  @State mapState: Map<string, number> = new Map([
    ['m05', 5],
    ['m06', 6],
    ['m07', 7]
  ])

  build() {
    Column() {
      MapV1PropChild05({ source: this.mapState })
      Text('MapV1PropParent05')
      Text('size=' + this.mapState.size)
    }
  }
}

@Component
struct MapV1PropChild06 {
  @Prop source: Map<string, number> = new Map()

  build() {
    Column() {
      Text('MapV1PropChild06')
      Text('size=' + this.source.size)
      Text('has m06=' + this.source.has('m06'))
      Text('keys=' + Array.from(this.source.keys()).join(','))
      Text('values=' + Array.from(this.source.values()).join(','))
    }
  }
}

@Component
struct MapV1PropParent06 {
  @State mapState: Map<string, number> = new Map([
    ['m06', 6],
    ['m07', 7],
    ['m08', 8]
  ])

  build() {
    Column() {
      MapV1PropChild06({ source: this.mapState })
      Text('MapV1PropParent06')
      Text('size=' + this.mapState.size)
    }
  }
}

@ComponentV2
struct MapV2ParamChild01 {
  @Param source: Map<string, number> = new Map()

  build() {
    Column() {
      Text('MapV2ParamChild01')
      Text('size=' + this.source.size)
      Text('mk01=' + (this.source.get('mk01') ?? -1))
      Text('mk21=' + (this.source.get('mk21') ?? -1))
    }
  }
}

@ComponentV2
struct MapV2ParamParent01 {
  @Local mapState: Map<string, number> = new Map([
    ['mk01', 1],
    ['mk21', 21]
  ])

  build() {
    Column() {
      MapV2ParamChild01({ source: this.mapState })
      Text('MapV2ParamParent01')
      Text('size=' + this.mapState.size)
    }
  }
}

@ComponentV2
struct MapV2ParamChild02 {
  @Param source: Map<string, number> = new Map()

  build() {
    Column() {
      Text('MapV2ParamChild02')
      Text('size=' + this.source.size)
      Text('keys=' + Array.from(this.source.keys()).join('|'))
      Text('values=' + Array.from(this.source.values()).join('|'))
    }
  }
}

@ComponentV2
struct MapV2ParamParent02 {
  @Local mapState: Map<string, number> = new Map([
    ['mk02', 2],
    ['mk22', 22]
  ])

  build() {
    Column() {
      MapV2ParamChild02({ source: this.mapState })
      Text('MapV2ParamParent02')
      Text('size=' + this.mapState.size)
    }
  }
}

@ComponentV2
struct MapV2ParamChild03 {
  @Param source: Map<string, number> = new Map()

  build() {
    Column() {
      Text('MapV2ParamChild03')
      Text('size=' + this.source.size)
      Text('mk03=' + (this.source.get('mk03') ?? -1))
      Text('mk23=' + (this.source.get('mk23') ?? -1))
    }
  }
}

@ComponentV2
struct MapV2ParamParent03 {
  @Local mapState: Map<string, number> = new Map([
    ['mk03', 3],
    ['mk23', 23]
  ])

  build() {
    Column() {
      MapV2ParamChild03({ source: this.mapState })
      Text('MapV2ParamParent03')
      Text('size=' + this.mapState.size)
    }
  }
}

@ComponentV2
struct MapV2ParamChild04 {
  @Param source: Map<string, number> = new Map()

  build() {
    Column() {
      Text('MapV2ParamChild04')
      Text('size=' + this.source.size)
      Text('keys=' + Array.from(this.source.keys()).join('|'))
      Text('values=' + Array.from(this.source.values()).join('|'))
    }
  }
}

@ComponentV2
struct MapV2ParamParent04 {
  @Local mapState: Map<string, number> = new Map([
    ['mk04', 4],
    ['mk24', 24]
  ])

  build() {
    Column() {
      MapV2ParamChild04({ source: this.mapState })
      Text('MapV2ParamParent04')
      Text('size=' + this.mapState.size)
    }
  }
}

@ComponentV2
struct MapV2EventChild01 {
  @Param source: Map<string, number> = new Map()
  @Event onChange: (value: Map<string, number>) => void = (value: Map<string, number>) => {}

  build() {
    Column() {
      Text('MapV2EventChild01')
      Text('size=' + this.source.size)
      Text('keys=' + Array.from(this.source.keys()).join(':'))
      Text('values=' + Array.from(this.source.values()).join(':'))
    }
  }
}

@ComponentV2
struct MapV2EventParent01 {
  @Local mapState: Map<string, number> = new Map([
    ['me01', 1],
    ['me41', 41]
  ])

  build() {
    Column() {
      MapV2EventChild01({
        source: this.mapState,
        onChange: (value: Map<string, number>) => { this.mapState = value }
      })
      Text('MapV2EventParent01')
      Text('size=' + this.mapState.size)
    }
  }
}

@ComponentV2
struct MapV2EventChild02 {
  @Param source: Map<string, number> = new Map()
  @Event onChange: (value: Map<string, number>) => void = (value: Map<string, number>) => {}

  build() {
    Column() {
      Text('MapV2EventChild02')
      Text('size=' + this.source.size)
      Text('keys=' + Array.from(this.source.keys()).join(':'))
      Text('values=' + Array.from(this.source.values()).join(':'))
    }
  }
}

@ComponentV2
struct MapV2EventParent02 {
  @Local mapState: Map<string, number> = new Map([
    ['me02', 2],
    ['me42', 42]
  ])

  build() {
    Column() {
      MapV2EventChild02({
        source: this.mapState,
        onChange: (value: Map<string, number>) => { this.mapState = value }
      })
      Text('MapV2EventParent02')
      Text('size=' + this.mapState.size)
    }
  }
}

@ComponentV2
struct MapV2EventChild03 {
  @Param source: Map<string, number> = new Map()
  @Event onChange: (value: Map<string, number>) => void = (value: Map<string, number>) => {}

  build() {
    Column() {
      Text('MapV2EventChild03')
      Text('size=' + this.source.size)
      Text('keys=' + Array.from(this.source.keys()).join(':'))
      Text('values=' + Array.from(this.source.values()).join(':'))
    }
  }
}

@ComponentV2
struct MapV2EventParent03 {
  @Local mapState: Map<string, number> = new Map([
    ['me03', 3],
    ['me43', 43]
  ])

  build() {
    Column() {
      MapV2EventChild03({
        source: this.mapState,
        onChange: (value: Map<string, number>) => { this.mapState = value }
      })
      Text('MapV2EventParent03')
      Text('size=' + this.mapState.size)
    }
  }
}

@Entry
@Component
struct MapStateValidationEntry {
  @State title: string = 'Map State Validation'

  build() {
    Column() {
      Text(this.title)
      MapObservedParent()

      MapV1PropParent01()
      MapV1PropParent02()
      MapV1PropParent03()
      MapV1PropParent04()
      MapV1PropParent05()
      MapV1PropParent06()

      MapV2ParamParent01()
      MapV2ParamParent02()
      MapV2ParamParent03()
      MapV2ParamParent04()

      MapV2EventParent01()
      MapV2EventParent02()
      MapV2EventParent03()
    }
  }
}
