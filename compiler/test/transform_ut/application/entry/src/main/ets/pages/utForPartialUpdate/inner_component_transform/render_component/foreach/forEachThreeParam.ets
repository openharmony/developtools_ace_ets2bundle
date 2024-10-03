let mKeyGenerator2: (datasource: string, index: number) => string = (item: string, index: number) => 'item' + index

@Entry
@Component
struct foreachThreeParam {
  @State arr: number[] = [10, 20, 30];
  private mKeyGenerator?: (datasource: string, index: number) => string;
  private mKeyGenerator1: (datasource: string, index: number) => string = (item: string, index: number) => 'item' + index;
  build() {
    Column() {
      ForEach(this.arr, ((item: number) => {
        Text(item)
      }), this.mKeyGenerator);
      ForEach(this.arr, ((item: number) => {
        Text(item)
      }), this.mKeyGenerator1);
      ForEach(this.arr, ((item: number) => {
        Text(item)
      }), mKeyGenerator2);
    }
  }
}