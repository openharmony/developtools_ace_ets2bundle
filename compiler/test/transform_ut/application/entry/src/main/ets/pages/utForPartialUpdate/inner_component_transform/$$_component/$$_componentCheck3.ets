@Styles function globalFancy1() {
    .width(150)
    .height(100)
    .backgroundColor(Color.Pink)
  }
  
  @Entry
  @Component
  struct Index {
    @State applyToAll: boolean = false;
  @Styles globalFancy() {
    .width(150)
    .height(100)
    .backgroundColor(Color.Pink)
  }
    build() {
      Column() {
        if (1) {
          Row() {
            Checkbox()
              .select($$this.applyToAll)
              .shape(CheckBoxShape.ROUNDED_SQUARE)
              .selectedColor('red')
              .unselectedColor('red')
              .globalFancy1()
              .globalFancy()
              .mark({
                strokeColor: 'red'
              })
              .width(30)
              .height(30)
          }
        }
      }
    }
  }