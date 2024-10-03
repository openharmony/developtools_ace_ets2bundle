@Extend Text.fancy(color:string){
  .backgroundColor(color)
}

@Extend Text.superFancy(size:number){
  .fontSize(size)
  .fancy(Color.Red)
}

@Extend(Button) function fancybut(color:string|Color){
  .backgroundColor(color)
  .width(200)
  .height(100)
}

@Entry
@Component
struct FancyUse {
  build() {
    Column(){
      Row() {
        Text("Just Fancy").fancy(Color.Yellow)
        Text("Super Fancy Text").superFancy(24)
        Button("Fancy Button").fancybut(Color.Green)
      }
      Row({ space: 10 }) {
        Text("Fancy")
          .fancytext(24)
      }
    }
  }
}

@Extend(Text) function fancytext(fontSize: number) {
  .fontColor(Color.Red)
  .fontSize(fontSize)
  .fontStyle(FontStyle.Italic)
}