@Entry
@Component
struct SheetSizeExample1 {
  @State detents: [(SheetSize | Length), (SheetSize | Length)?, (SheetSize | Length)?] = [SheetSize.MEDIUM, SheetSize.LARGE, SheetSize.FIT_CONTENT];
  @State isShow: boolean = false;
  @State dismiss: string = "Init";

  @Builder
  myBuilder() {
  }

  build() {
    Column() {
      Button("transition modal 1")
        .bindSheet($$this.isShow, this.myBuilder(), {
          detents: this.detents,
          backgroundColor: Color.Gray,
          blurStyle: BlurStyle.Thick,
          showClose: true,
          title: { title: "title", subtitle: "subtitle" },
          preferType: SheetType.CENTER,
          shouldDismiss: ((sheetDismiss: SheetDismiss) => {
            console.log("bind sheet shouldDismiss")
            sheetDismiss.dismiss()
            this.dismiss = "dismiss succ"
          })
        })
    }
    .justifyContent(FlexAlign.Start)
  }
}