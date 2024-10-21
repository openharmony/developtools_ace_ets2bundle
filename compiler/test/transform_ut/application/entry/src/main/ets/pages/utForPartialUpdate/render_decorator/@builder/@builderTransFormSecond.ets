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
function commonBuilder() {}

@Builder
function testInnerComponent(value: string) {
  Column() {
    commonBuilder()
    TestBuilderChild()
    TestBuilderChild().width(value)
    Text(value)
    Text("hello testInnerComponent")
  }
}