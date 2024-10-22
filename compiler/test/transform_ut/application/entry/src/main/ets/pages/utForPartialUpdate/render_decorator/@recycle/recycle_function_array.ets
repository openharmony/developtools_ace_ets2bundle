@Entry
@Component
struct RecycleFuncArrHomeComponent {
  @State value: number = 1
  build() {
    Column() {
      RecycleFuncArrChild({propvalue: this.value, linkvalue: this.value})
    }
  }
}

@Reusable
@Component
struct RecycleFuncArrChild {
  @State state_value: number = 1;
  reguar_value: string = "hello"
  build() {
    Column() {
      Circle()
        .onClick(() => {
          console.log("hello")
        })
        .strokeDashArray(["hello", this.reguar_value])
        .height(100)
      Circle()
        .strokeDashArray([this.state_value])
      Text("hello")
        .onClick(() => {
          console.log("hello")
        })
    }
  }
}