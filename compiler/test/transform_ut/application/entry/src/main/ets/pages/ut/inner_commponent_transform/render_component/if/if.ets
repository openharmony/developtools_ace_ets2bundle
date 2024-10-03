import { TestComponent } from '../../../../../test/TestComponent';
import { Animal } from '../../../../../test/TsModule';

@Entry
@Component
struct MyComponent {
  private pass: boolean = true
  private count: number = 10
  build() {
    Column() {
      if(this.pass) {
        if (this.count < 0) {
          Text('count is negative')
            .fontSize(32)
        } else if (this.count % 2 === 0) {
          Divider()
          Text('even')
            .fontSize(32)
        } else {
          Divider()
          Text('odd')
            .fontSize(32)
        }
      }else{
        Text('fail')
          .fontSize(32)
      }

      if(Animal.Dog){
        TestComponent({content: 'if (import enum)'})
        Divider()
      }
    }
  }
}