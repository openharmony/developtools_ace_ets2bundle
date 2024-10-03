function aa() {
  return 'red'
}

function dd() {
  return {
    ee: 30
  }
}

@Entry
@Component
struct Index {
  @State applyToAll: boolean = false;
  build() {
    Column() {
      if (1) {
        Row() {
          Checkbox()
            .select($$this.applyToAll)
            .shape(CheckBoxShape.ROUNDED_SQUARE)
            .selectedColor(xx())
            .unselectedColor(bb().cc)
            .mark({
              strokeColor: aa()
            })
            .globalFancy1()
            .globalFancy()
            .mark({
              strokeColor: 'red'
            })
            .width(dd().ee)
            .height(30)
        }
      }
    }
  }
  @Styles globalFancy() {
    .width(150)
    .height(100)
    .backgroundColor(Color.Pink)
  }
}
function xx() {
  return 'red';
}
function bb() {
  return {
    cc: 'red'
  }
}
@Styles function globalFancy1() {
  .width(150)
  .height(100)
  .backgroundColor(Color.Pink)
}