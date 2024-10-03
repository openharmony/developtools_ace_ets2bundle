@Entry
@Component
struct TestParent {
  @State state_value: string = "hello state_value"

  build() {
    Column() {
      V1()
      V1({})
    }
  }
}

@ComponentV2
struct V2 {
  @Local local_value: string = "hello local_value"
  build() {
    Column() {
      V1()
      V1({})
      V1({link_value: this.local_value})
      V1({link_value: "hello"})
    }
  }
}

@Component
struct V1 {
  @Link link_value: string
  build() {
    Text("hello V1")
  }
}