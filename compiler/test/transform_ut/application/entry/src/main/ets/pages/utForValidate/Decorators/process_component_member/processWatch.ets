@Entry
@Component
struct Index {
  @State @Watch('onWatch') message: Array<string> = ['1','2','3','4','5']
  build() {
    Row() {}
  }
}