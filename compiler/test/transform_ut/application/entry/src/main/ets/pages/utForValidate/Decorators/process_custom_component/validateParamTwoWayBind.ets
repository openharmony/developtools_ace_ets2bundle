const gloabel_value: string = "Foo"
const obj = {
  gloabel_value:  "Foo"
}
@Entry
@ComponentV2
struct validateParamTwoWayBind {
  @Local local_value: string = "Foo"
  obj = {
    gloabel_value:  "Foo"
  }
  aa() {
    return {
      gloabel_value:  "Foo"
    }
  }
  bb() {
    return "Foo";
  }
  build() {
    Column() {
      testParamChild1({value: this.local_value!!})
      testParamChild2({paramValue: this.obj?.gloabel_value!!})
      testParamChild2({paramValue: this.aa()?.gloabel_value!!})
      testParamChild2({paramValue: this.bb()!!})
      testParamChild2({paramValue: "hello"!!})
    }
  }
}

@ComponentV2
struct testParamChild1 {
  @Param value: string = "hello"
  build() {}
}

@ComponentV2
struct testParamChild2 {
  @Param paramValue: string = "hello"
  @Event $paramValue: (value: string) => void = (value: string) => {}
  build() {}
}
