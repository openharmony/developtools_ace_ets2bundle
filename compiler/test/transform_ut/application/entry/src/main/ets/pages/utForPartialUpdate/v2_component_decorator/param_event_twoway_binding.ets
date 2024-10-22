@Entry
@ComponentV2
struct HomeComponent {
  @Local local_value: string = "Foo"

  build() {
    Column() {
      TestParam({
        paramValue: this.local_value!!,
        paramValue1: "hello HomeComponent"
      })
      TestParam1({
        paramValue: "hello HomeComponent",
        myEvent: (newVal: string) => { this.local_value = newVal },
        myEvent1: (newVal: string) => this.local_value = newVal
      })
    }
  }
}

@ComponentV2
struct TestParam {
  // Two way binding
  @Param paramValue: string = "hello TestParam"
  @Event $paramValue: (value: string) => void = (value: string) => {}
  @Require @Param paramValue1: string
  
  build() {}
}

@ComponentV2
struct TestParam1 {
  @Param paramValue: string = "hello TestParam1"
  @Event myEvent: (newVal: number) => void = (newVal: number) => {}
  @Event myEvent1: (newVal: number) => void
  
  build() {}
}