@Entry
@Component
struct HomePreviewComponent {
  private value1: string = "hello world 1"
  private value2: string = "hello world 2"
  private value3: string = "hello world 3"

  build() {
    Column() {
      Row() {
        Text(this.value1)
        Text(this.value2)
        Text(this.value3)
      }
      Row() {
        Button() {
          Text(this.value1)
            .fontSize(20)
        }
        .width(100)
        .height(20)
        Text(this.value2)
          .fontSize(100)
        Text(this.value3)
      }
      .width(20)
    }
    .height(500)
  }
}

@Preview
@Component
struct HomePreviewComponent_Preview {
  build() {
    Column() {
      HomePreviewComponent()
    }
  }
}
