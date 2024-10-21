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

@Reusable
@Component
struct TestBuilderReusable {
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

@Builder
function testInnerComponent(value: string) {
  Column() {
    TestBuilderReusable()
    TestBuilderReusable().height(value)
  }
}