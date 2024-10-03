@Entry
@Component
struct IFView {
  @State toggle1: boolean = false;
  @State toggle2: boolean = false;
  @State toggle3: boolean = false;

  build() {
    Column() {
      if (this.toggle1) {
        Text('toggle1')
      } else if(this.toggle2) {
        Text('toggle2')
      } else if (this.toggle3) {
        Text('toggle3')
      } else {
        Text('toggle no thing')
      }
      if (this.toggle1) {
        Text('toggle1 Single')
      }
    }
  }
}