import { Component, Entry } from "@ohos.arkui.component"
import { StorageLink } from "@ohos.arkui.stateManagement"

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
  @StorageLink('Prop1') arrayA: number[] = [1,2,3];
  @StorageLink('Prop2') objectA: Object = {};
  @StorageLink('Prop3') dateA: Date = new Date('2021-08-08');
  @StorageLink('Prop4') setA: Set<number> = new Set<number>();
  @StorageLink('Prop5') mapA: Map<number, string> = new Map<number, string>();
  @StorageLink('Prop6') unionA: string | undefined = "";
  @StorageLink('Prop7') classA: Person = new Person("John");
  @StorageLink('Prop8') enumA: Status = Status.NotFound;

  build() {}
}