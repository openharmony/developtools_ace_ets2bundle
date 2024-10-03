// @ts-nocheck
@Entry
@Component
struct Index {
  @State arr: string[] = ['10', '20', '30'];

  build() {
    Column({ space: 5 }) {
      ForEach(this.arr, () =>{}, '111')
    }
  }
}
