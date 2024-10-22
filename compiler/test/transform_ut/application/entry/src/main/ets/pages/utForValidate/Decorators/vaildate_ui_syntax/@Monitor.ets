@Entry
@Component
struct MonitorHomeComponent {

  build() {
    Column() {}
  }
}

class Test1 {
  @Monitor("aa") onChange() {

  }
}
declare const Custom: () => MethodDecorator
@ObservedV2
class Test2 {
  @Monitor("aa") @Custom() onChange() {

  }
}