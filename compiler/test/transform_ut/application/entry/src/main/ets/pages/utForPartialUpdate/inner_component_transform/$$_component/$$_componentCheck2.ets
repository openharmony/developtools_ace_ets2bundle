@Styles function globalFancy1() {
    .width(150)
    .height(100)
    .backgroundColor(Color.Pink)
  }
  
  @Entry
  @Component
  struct TextInputExample {
    @State text: string = ''
  
    @Styles globalFancy() {
      .width(150)
      .height(100)
      .backgroundColor(Color.Pink)
    }
  
    build() {
      Column({ space: 20 }) {
        Text(this.text)
        TextInput({ text: $$this.text })
        .placeholderColor(Color.Grey)
        .placeholderFont({ size: 14, weight: 400 })
        .globalFancy1()
        .globalFancy()
        .caretColor(Color.Blue)
        .width(300)
      }.width('100%').height('100%').justifyContent(FlexAlign.Center)
    }
  }