@Entry
@Component
struct ValidateForbiddenUseStateTypeIndex {
  @State message: CustomDialogController = new CustomDialogController({
    builder: CustomDialogExampleTwo(),
    alignment: DialogAlignment.Bottom,
    offset: { dx: 0, dy: -25 } })
  build() {
    Row() {}
  }
}

@CustomDialog
struct CustomDialogExampleTwo {
  controllerTwo?: CustomDialogController
  build() {
    Column() {
      Text('我是第二个弹窗')
        .fontSize(30)
        .height(100)
    }
  }
}