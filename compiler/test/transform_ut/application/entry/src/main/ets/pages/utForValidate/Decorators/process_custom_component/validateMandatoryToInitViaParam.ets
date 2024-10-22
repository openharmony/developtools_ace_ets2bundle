@Entry
@Component
struct ValidateMandatoryToInitViaParamParent {
  @State message: string ='Hello';

  build() {
    Column() {
      ValidateMandatoryToInitViaParamChild();
    }
  }
}

@Component
struct ValidateMandatoryToInitViaParamChild {
  @Link message: string
  build() {
    Row() {}
  }
}