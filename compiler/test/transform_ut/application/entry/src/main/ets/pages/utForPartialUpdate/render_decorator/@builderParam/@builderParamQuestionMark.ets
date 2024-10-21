@Component
struct ChildComponent {
  @BuilderParam trailing?: () => void;

  build() {
    Column(){
      this.trailing?.();
    }
  }
}


@Entry
@Component
struct Index {
  @State message: string = 'Hello World';

  build() {
    Row() {
      Column() {
        Text(this.message)
          .fontSize(50)
          .fontWeight(FontWeight.Bold)
        ChildComponent()
      }
      .width('100%')
    }
    .height('100%')
  }
}