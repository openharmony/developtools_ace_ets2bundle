@Entry
@Component
struct Parent {
  private message: string ='Hello';
  
  build() {
    Column() {
      Child({message: $message});
    }
  }
}

@Component
struct Child {
  @Link message: string;
  build() {
    Row() {}
  }
}