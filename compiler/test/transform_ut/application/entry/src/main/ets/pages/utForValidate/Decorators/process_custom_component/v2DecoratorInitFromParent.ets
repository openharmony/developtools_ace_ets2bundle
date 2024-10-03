@Entry
@ComponentV2
struct v2DecoratorInitFromParent {
  build() {
    Column() {
      testParamChild()
      testChild({
        regular_value: "hello",
        local_value: "hello",
        provider_value: "hello",
        consumer_value: "hello"
      })
    }
  }
}

@ComponentV2
struct testParamChild {
  @Require @Param param_value: string = "hello"
  build() {}
}

@ComponentV2
struct testChild {
  regular_value: string = "hello"
  @Local local_value: string = "hello"
  @Provider() provider_value: string = "hello"
  @Consumer() consumer_value: string = "hello"
  build() {}
}