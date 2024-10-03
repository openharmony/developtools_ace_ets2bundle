@Component
@Entry
struct MyComponent {
  build() {
    Column() {
      Banner()
      Banner()
       .width(100)
      Banner()
       .width(100)
       .height(200)
      Banner({value: "Hello"})
      Banner({value: "Hello"})
       .width(100)
      Banner({value: "Hello"})
       .width(100)
       .height(200)
    }
  }
}

@Component
struct Banner {
  value: string = "Hello"
  build() {
    Column() {
      Text(this.value)
    }
  }
}