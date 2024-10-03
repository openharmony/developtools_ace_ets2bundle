@Entry
@Reusable
@Component
struct childTest {
  @Styles
  stylesGesture() {
    .gesture(
      GestureGroup(GestureMode.Parallel,
        TapGesture({ count: 2 })
          .onAction(() => {
          })
      )
    )
  }

  build() {
    Column() {
      Text("hello")
        .stylesGesture()
    }
  }
}