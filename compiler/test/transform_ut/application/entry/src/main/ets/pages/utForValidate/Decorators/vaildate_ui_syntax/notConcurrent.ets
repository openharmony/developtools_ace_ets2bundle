@Entry
@Concurrent
struct NotConcurrentIndexDecorator{
  build(){
    Column(){
      Text('hello')
    }
    .margin(10)
  }
}