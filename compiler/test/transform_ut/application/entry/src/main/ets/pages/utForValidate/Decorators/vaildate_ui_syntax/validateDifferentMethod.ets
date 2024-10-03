declare const CustomMethod: PropertyDecorator;

@Entry
@Component
struct ValidateDifferentMethodHomeComponent {
  build() {
    Column() {}
  }
}
@Builder
@Styles
function testFunction() {
  Text("testFunction")
}

@Builder
@CustomMethod
function testFunction1() {
  Text("testFunction1")
}

@Builder
function testFunction2() {
  Text("testFunction2")
}

@Styles
function testFunction3() {
  .width(100)
}

@Component
struct ValidateDifferentMethodTestComponent {
  build() {

  }

  @Builder
  @Styles
  testMethod() {

  }

  @Builder
  @CustomMethod
  testMethod1() {

  }
}

@ComponentV2
struct ValidateDifferentMethodTestComponent1 {
  build() {

  }

  @Builder
  @Monitor("aa")
  testMethod2() {

  }

  @Builder
  @Computed
  testMethod3() {

  }

  @Builder
  @Styles
  testMethod5() {

  }
}