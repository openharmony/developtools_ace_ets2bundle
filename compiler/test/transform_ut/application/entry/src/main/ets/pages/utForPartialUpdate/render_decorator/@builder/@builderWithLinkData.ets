@Component
struct TitleComp {
  @Link title: string
  build() {
    Text(this.title)
  }
}

@Entry
@Component
struct TestPage{
  @State value: string = 'hello world'
  @Builder
  TitleCompView() {
    TitleComp({title: $value})
  }
  build() {
    Flex() {
      this.TitleCompView()
    }
  }
}