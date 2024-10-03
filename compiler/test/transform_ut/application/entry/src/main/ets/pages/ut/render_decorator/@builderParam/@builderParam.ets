import { CustomContainerExport } from '../../../../test/TestComponent';
@Component
struct CustomContainer {
  header: string = "";
  @BuilderParam content: () => void;
  @BuilderParam callContent: any;
  footer: string = "";
  build() {
    Column() {
      Text(this.header)
      this.content()
      this.callContent()
      Text(this.footer)
    }
  }
}

@Component
struct CustomContainer2 {
  header: string = "";
  @BuilderParam content: () => void;
  build() {
    Column() {
      Text(this.header)
      this.content()
    }
  }
}

@Builder function specificWithParam(label1: string, label2: string) {
  Column() {
    Text(label1).fontSize(50)
    Text(label2).fontSize(50)
  }
}

@Entry
@Component
struct CustomContainerUser {
  @State text: string = 'header'
  @Builder specificParam() {
    Column() {
      Text("content").fontSize(50)
    }
  }
  @Builder callSpecificParam(label1: string, label2: string) {
    Column() {
      Text(label1).fontSize(50)
      Text(label2).fontSize(50)
    }
  }

  build() {
    Column() {
      CustomContainerExport({
        header: this.text,
      }){
        Column(){
          specificWithParam("111", "22")
        }.onClick(()=>{
          this.text = "changeHeader"
        })
      }
      Row(){
        CustomContainer({
          header: this.text,
          content: this.specificParam,
          callContent: this.callSpecificParam("callContent1", 'callContent2'),
          footer: "Footer",
        })
      }
      Row(){
        CustomContainer2({
          header: this.text,
        }){
          Column(){
            this.callSpecificParam("111", '222')
          }.onClick(()=>{
            this.text = "changeHeader"
          })
        }
      }
    }
  }
}