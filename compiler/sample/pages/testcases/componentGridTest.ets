@Entry
@Component
struct GridRootView {
    changeColor:boolean = true;
    dataArrayA:string[] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    @State itemColor:number = 0xffff00;

    build(){
        Column(){
            Text('--------------- Grid : foreach test --------------->')
            Grid(){
                ForEach(
                    this.dataArrayA, //Data array
                    (item) => {
                        GridItem(){
                            Text(item)
                        }.width(100).height(50).backgroundColor(0x00ff00)
                    },
                    item => item
                )
            }
            .height(100).width(650)
            .columnsTemplate("1fr 1fr 1fr 1fr 1fr 1fr 1fr").columnsGap(50) //Grid
            Text('--------------- Grid : item start-end test --------------->')
            Grid(){
                GridItem(){
                    Text('1').fontSize(11)
                }
                .height(100).width(150).backgroundColor(0x00ff00).borderWidth(2.0)
                GridItem(){
                    Text('2').fontSize(22)
                }
                .height(100).width(150).backgroundColor(0x00ffff).borderWidth(2.0).borderStyle(2)
                GridItem(){
                    Text('3').fontSize(33)
                }
                .height(100).width(150).backgroundColor(0x0000ff).borderWidth(2.0).borderColor(0xff46f7).borderStyle(1)
                GridItem(){
                    Text('click me').fontSize(24)
                }
                .height(100).width(150).backgroundColor(this.itemColor).borderWidth(2.0).borderColor(0xff46f7).borderStyle(3)
                .onClick(() => {
                    if (this.changeColor == true) {
                        this.itemColor = 0x0000ff;
                    } else {
                        this.itemColor = 0xffff00;
                    }
                    this.changeColor = !this.changeColor;
                })
            }
            .width(350).height(250)
            .columnsTemplate("1fr 1fr 1fr").rowsTemplate("1fr 1fr").columnsGap(50).rowsGap(50)
        }
    }
}
