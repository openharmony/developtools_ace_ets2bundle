@Component
@Entry
struct MyComponent3 {
  private value1: string = "hello world 1"
  private value2: string = "hello world 2"
  private value3: string = "hello world 3"

  build() {
    Column() {
      Text(this.value1)
      Text(this.value2)
      Text(this.value3)
    }
  }
}