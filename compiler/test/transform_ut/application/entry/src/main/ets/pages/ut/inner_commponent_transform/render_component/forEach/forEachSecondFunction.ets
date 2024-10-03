@Entry
@Component
struct MyComponent {
  @State arr: number[] = [10, 20, 30];
  build() {
    Column({ space: 5 }) {
      Button('Reverse Array')
        .onClick(() => {
          this.arr.reverse();
        })
      ForEach(this.arr, ((item: number) => {
        Text('item').fontSize(18)
        Divider().strokeWidth(2)
      }), (item: number) => item.toString())
    }.width("100%").height("100%")
  }
}