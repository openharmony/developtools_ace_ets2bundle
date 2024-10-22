@Entry
@Component
struct ValidateNonLinkWithDollarParent {
  @State message: string ='Hello';

  build() {
    Column() {
      ValidateNonLinkWithDollarChild({message: $message});
    }
  }
}

@Component
struct ValidateNonLinkWithDollarChild {
  @Prop message: string;
  build() {
    Row() {}
  }
}