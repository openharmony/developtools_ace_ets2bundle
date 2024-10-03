@Entry
@Component
@Concurrent
struct StylesDuplicate{
  @State message:string = 'Hello Word'
  build(){
    Row(){
      Column(){
      }
      .width('100%')
    }
    .height('100%')
  }
}