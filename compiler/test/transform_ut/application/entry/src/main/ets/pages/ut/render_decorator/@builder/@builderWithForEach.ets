@Builder
function ComB(param: string[]) {
  ForEach(param, item => {
    ComA().backgroundColor('red')
  })
}

@Entry
@Component
struct Index {
  @State arr: string[] = ['1', '2', '3', '4', '5']

  build() {
    Column() {
      ComB(this.arr);
    }
  }
}

@Component
struct ComA {
  build() {
    Row() {
      Text('自定义组件')
        .fontSize(30)
    }
  }
}