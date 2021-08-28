
@Entry
@Component
struct TestView1 {

  @State
  clicked:number = 0;

  onClicked() {
    this.clicked = this.clicked + 1;
  }

    build() {
    Column(){
      Text("Clicked: " + this.onClicked)
      Image("pages/pictures/0.jpeg")
      .width(800).height(400).margin(50)
      .onClick(this.onClicked.bind(this))
      Text("Test text\ntest text")
      .onClick(this.onClicked.bind(this))
      Row(){
        Text("test")
        Text("test")
        Text("test")
      }
      .onClick(this.onClicked.bind(this))
      Stack(){
        Image("pages/pictures/0.jpeg")
        Text("Test text")
      }
      .onClick(this.onClicked.bind(this))
      Column(){
        Text("test")
        Text("test")
        Text("test")
      }
      .onClick(this.onClicked.bind(this))
    }
    .alignItems(HorizontalAlign.Center)
    } // render
}
