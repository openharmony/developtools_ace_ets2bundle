@Entry
@Component
struct TestBuilder1 {
  build() {
    Column() {
      Text("hello")
    }
  }
  @Builder
  innerBuidler(value: string) {
    Column() {
      Text("hello")
    }
  }
}

@Component
struct TestBuilderChild {
  build() {
    Column() {
      Text("hello")
    }
  }
  @Builder
  innerBuidler(value: object) {
    Column() {
      Text("hello")
    }
  }
}

@Builder
function testIfIdComponent(value: number) {
  Column() {
    if (value) {
      TestBuilderChild()
        .id('id14')
      Text('111')
    }
  }
}