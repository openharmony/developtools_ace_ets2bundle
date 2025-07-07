import { Component, Entry } from "@ohos.arkui.component"  // TextAttribute should be insert by ui-plugins
import { StorageProp } from "@ohos.arkui.stateManagement"

class Person{
  name: string = ''
  constructor(name: string){}
}

enum Status {
  Success = 200,
  NotFound = 404,
  ServerError = 500
}

@Entry
@Component
struct MyStateSample {
  @StorageProp('Prop1') arrayB: number[] = [1,2,3];
  @StorageProp('Prop2') objectB: Object = {};
  @StorageProp('Prop3') dateB: Date = new Date('2021-09-09');
  @StorageProp('Prop4') setB: Set<number> = new Set<number>();
  @StorageProp('Prop5') mapB: Map<number, string> = new Map<number, string>();
  @StorageProp('Prop6') unionB: string | undefined = "";
  @StorageProp('Prop7') classB: Person = new Person("Kevin");
  @StorageProp('Prop8') enumB: Status = Status.NotFound;

  build() {}
}