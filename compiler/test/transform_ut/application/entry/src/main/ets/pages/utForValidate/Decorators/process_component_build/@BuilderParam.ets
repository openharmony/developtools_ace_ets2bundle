@Component
struct CustomContainer {
  // @BuilderParam closer: () => void

  build() {
    Row() {}
  }
}

@Entry
@Component
struct CustomContainerUser {

  build() {
    Column() {
      CustomContainer() {

      }
    }
  }
}