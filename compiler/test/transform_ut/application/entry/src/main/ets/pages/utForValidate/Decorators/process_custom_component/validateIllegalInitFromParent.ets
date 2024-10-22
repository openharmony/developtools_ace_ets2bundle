@Entry
@Component
struct ValidateIllegalInitFromParentParent {
  private message: string ='Hello';

  build() {
    Column() {
      ValidateIllegalInitFromParentChild({message: $message});
    }
  }
}

@Component
struct ValidateIllegalInitFromParentChild {
  @Link message: string;
  build() {
    Row() {}
  }
}