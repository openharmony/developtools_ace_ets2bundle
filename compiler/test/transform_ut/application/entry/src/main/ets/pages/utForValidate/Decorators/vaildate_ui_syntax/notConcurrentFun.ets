@Entry
@Component
struct notConcurrentFun{
  @Concurrent conFun(){}
  build(){
    Row(){
      Column(){
      }
      .width('100%')
    }
    .height('100%')
  }
}
function conFun() {
  throw new Error('Function not implemented.')
}