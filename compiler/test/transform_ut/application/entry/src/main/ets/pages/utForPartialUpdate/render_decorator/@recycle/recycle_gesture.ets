@Reusable
@Component
struct GestureTest {
  @State count: number = 0
  @State width_value: string = "100%"

  build() {
    Flex({ direction: FlexDirection.Column, alignItems: ItemAlign.Center, justifyContent: FlexAlign.SpaceBetween }) {
      Text('LongPress onAction:' + this.count)
      .height(100)
      .width(width_value)
    }
    .height(100).width(this.width_value).padding(60).border({ width:1 }).margin(30)
    .gesture(
      LongPressGesture({ repeat: true })
        .onAction((event: GestureEvent) => {
          if (event.repeat) { this.count++ }
        })
        .onActionEnd(() => {
          this.count = 0
        })
    )
  }
}