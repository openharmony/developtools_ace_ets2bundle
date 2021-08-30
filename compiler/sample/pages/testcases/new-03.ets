@Component
struct Banner {
  private value1: string = "hello world 2";

  build() {
    Column() {
      Text(this.value1);
    }
  }
}

@Component
@Entry
struct MyComponent5 {
  private value1: string = "hello world 1"

  build() {
    Column() {
      Text(this.value1)
      Banner()
    }
  }
}