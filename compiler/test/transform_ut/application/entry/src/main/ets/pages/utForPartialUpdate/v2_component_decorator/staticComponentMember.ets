@Entry
@ComponentV2
struct HomeComponent {
  build() {
    Column() { 
    }
  }
}

@Builder
function testBuilder() {
  Text("testBuilder")
}

@ComponentV2
struct ChildComponent {
  @Local static local_value: string = "hello"
  @Param static param_value: string = "hello"
  @Event static event_value: Function = () => {}
  @Provider() static provider_value: number = 0
  @Consumer("a") static consumer_value: boolean = true
  @BuilderParam static builder_value: Function = testBuilder

  @Monitor("local_value")
  static testMonitor() {}

  @Computed
  static get fullName() {
    return ChildComponent.param_value
  }

  build() {
    Column() {}
  }
}