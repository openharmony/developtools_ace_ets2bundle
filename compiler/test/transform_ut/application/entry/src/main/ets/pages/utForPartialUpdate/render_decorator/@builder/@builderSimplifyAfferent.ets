const test_value: string = "hello";

@Entry
@Component
struct testDemo {
  build() {
    Column(){
      Text('main page')
        .fontSize(50)
        .fontWeight(FontWeight.Bold)
      overBuilder({test_value})
    }
  }
}

interface typeTmp {
  test_value: string;
}

@Builder function overBuilder($$: typeTmp) {
  Column(){
    Text($$.test_value)
      .fontSize(40)
      .fontWeight(FontWeight.Bold)
  }
}