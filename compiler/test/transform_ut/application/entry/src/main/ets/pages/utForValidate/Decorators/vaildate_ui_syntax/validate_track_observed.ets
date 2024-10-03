@Entry
@Component
struct ValidateTrackObservedHomeComponent {
  @Trace value: string = '';
  build() {
    Column() {
      Text("hello")
    }
    .height(500)
  }
}

@ObservedV2
@Component
struct child {
  build() {
    Text("")
  }
}

class A {
  @Trace value: string = '';
}

@ObservedV2
class B {
  @Trace value: string = '';
}