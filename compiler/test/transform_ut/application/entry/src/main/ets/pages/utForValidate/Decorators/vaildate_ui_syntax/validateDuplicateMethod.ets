// declare const CustomMethod: PropertyDecorator;

@Entry
@Component
struct ValidateDuplicateMethodHomeComponent {
  build() {
    Column() {}
  }
}
@Builder
@Builder
function testFunction4() {
  Text("testFunction1")
}

@CustomMethod
@CustomMethod
function testFunction5() {
  console.log("testFunction2")
}

@Component
struct TestComponent {

  build() {}

  @Builder
  @Builder
  testMethod() {
    Text("testMethod")
  }

  @Styles
  @Styles
  testMethod2() {
    .width(100)
  }
}

@ComponentV2
struct TestComponent1 {

  build() {}

  @Builder
  @Builder
  testMethod() {
    Text("testMethod")
  }

  @Styles
  @Styles
  testMethod2() {
    .width(100)
  }

  @Monitor("aa")
  @Monitor("aa")
  testMethod3() {
    console.log("testMethod3")
  }

  @Computed
  @Computed
  get fullName() {
    return "hello"
  }
}