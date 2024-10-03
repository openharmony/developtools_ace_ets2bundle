@Entry
@Component
struct Parent {
  @State message: string ='Hello';
  
  build() {
    Column() {
      Child({message: $message});
    }
  }
}

@Component
struct Child {
  @Prop message: string;
  build() {
    Row() {}
  }
}