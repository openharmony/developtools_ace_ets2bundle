@Entry
@Component
struct HomePreviewComponent {
  private value: string = "hello world"

  build() {
    Text(this.value)
        .fontSize(50)
  }
}

@Preview
@Component
struct HomePreviewComponent_Preview {
  build() {
    Column() {
      HomePreviewComponent();
    }
  }
}