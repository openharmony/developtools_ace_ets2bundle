@Extend(Text,Image) function fancyText(weightValue: number, color: Color) {
  .fontStyle(FontStyle.Italic)
  .fontWeight(weightValue)
  .backgroundColor(color)
}

@Entry
@Component
struct ExtendOneChildSummerpockets {
  build(){
  }
}