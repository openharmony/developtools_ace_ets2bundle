@Entry
@Component
struct AttributeCheckIndex {
  @State arr: string[] = ['10', '20', '30'];

  build() {
    Column({ space: 5 }) {
      ForEach(this.arr, () =>{}, (item: string) => item).h
    }
  }
}