@Component
@Entry
struct MyComponent1 {
  private value1: string = "hello world 1"
  private value2: string = "hello world 2"
  private value3: string = "hello world 3"

  constructor() {
      console.info('into constructor');
  }

  build() {
    new Column() {
      new Text(this.value1)
      Text(this.value2)
      Text(this.value3)
    }
  }
}