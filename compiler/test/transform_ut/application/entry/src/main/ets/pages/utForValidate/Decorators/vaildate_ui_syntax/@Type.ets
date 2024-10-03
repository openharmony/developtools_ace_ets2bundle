import { Type } from '@ohos.arkui.StateManagement';

class A {
  p: number = 1;
}

@Entry
@Component
struct AddLog {
  @Type(A) log: string = 'Hello Word!';

  build() {
    Row() {
      Column() {
        Text(this.log)
          .fontSize(50)
          .fontWeight(FontWeight.Bold)
      }
      .width('100%')
    }
    .height('100%')
  }
}

@Sendable
class C1 {
  @Type(A) onChange() {}
}

@Observed
class C2 {
  @Type(A) p: A = new A;
}

@ObservedV2
class C3 {
  @Type(A) onChange() {}
}