@Component
struct Banner {
  private value1: string = "hello world 4"
  private value2: string = "hello world 5"
  private value3: string = "hello world 6"

  build() {
    Column() {
      Text(this.value1)
      Text(this.value2)
      Text(this.value3)
    }
  }
}

@Component
@Entry
struct MyComponent {
  private value1: string = "hello world 1"
  private value2: string = "hello world 2"
  private value3: string = "hello world 3"
  @State private idx:number = 0

  build() {
    Column() {
      Text(this.value1)
      Text(this.value2)
      Text(this.value3)
      Banner()
    }
  }
}
