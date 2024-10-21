@CustomDialog
struct DialogExample {
  @Prop count: number
  @Link isPlaying: boolean
  controller: CustomDialogController;
  termsToAccept: string = ""
  action1: () => void;
  action2: (x: number, s: string) => void;

  build() {
    Column(){
      Row(){
        Button('current count is: ' + this.count)
          .onClick(() => {
            this.count++;
          })
      }
      Row(){
        Button(this.isPlaying ? 'play' : 'pause')
          .onClick(() => {
            this.isPlaying = !this.isPlaying;
          })
      }
      Row() {
        Button ("Option A")
          .onClick(() => {
            this.controller.close();
            this.action1();
          })
        Button ("Option B")
          .onClick(() => {
            this.controller.close();
            this.action2(47, "Option B is great choice");
          })
      }
    }
  }
}

@Entry
@Component
struct CustomDialogUser {
  @State countInitValue: number = 10;
  @State playingInitValue: boolean = false;
  dialogController : CustomDialogController = new CustomDialogController({
    builder: DialogExample({
      termsToAccept: "Please accept the terms.",
      action1: this.onAccept,
      action2: this.existApp,
      count: this.countInitValue,
      isPlaying: $playingInitValue
    }),
    cancel: this.existApp,
    autoCancel: false
  });

  onAccept() {
    console.log("onAccept");
  }
  existApp() {
    console.log("Cancel dialog!");
  }

  build() {
    Column() {
      Text('current countInitValue is: ' + this.countInitValue)
        .fontSize(20)
      Text('current playingInitValue is: ' + this.playingInitValue)
        .fontSize(20)
      Button("Click to open Dialog -1")
        .onClick(() => {
          this.countInitValue--;
          this.dialogController.open()
        })
      Button("Click to close Dialog +1")
        .onClick(() => {
          this.countInitValue++;
          this.dialogController.close()
        })
    }
  }
}