@Entry
@Component
struct AddLog {
  @Trace log: string = 'Hello Word!';

  build() {
    Row() {
      Column() {
        Text(this.log)
          .fontSize(50)
          .fontWeight(FontWeight.Bold)
      }
      .width('100%')
    }
    .height('100%')
  }
}

@ObservedV2
class C {
  @Trace onChange() {}
}