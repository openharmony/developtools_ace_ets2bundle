import { Component, Entry } from "@ohos.arkui.component"
import { Observed, Track } from "@ohos.arkui.stateManagement"

class Person{
}

enum Status {
  Success = 200,
  NotFound = 404,
  ServerError = 500
}

@Observed
class mixed1 {
  @Track numA: number = 33;
  @Track stringA: string = 'AA';
  @Track booleanA: boolean = true;
  @Track arrayA: number[] = [1,2,3];
  @Track objectA: Object = {};
  @Track dateA: Date = new Date('2021-08-08');
  @Track setA: Set<number> = new Set<number>();
  @Track mapA: Map<number, string> = new Map<number, string>();
  @Track unionA: string | undefined = "";
  @Track classA: Person = new Person();
  @Track enumA: Status = Status.NotFound;

  numB: number = 33;
  stringB: string = 'AA';
  booleanB: boolean = true;
  arrayB: number[] = [1,2,3];
  objectB: Object = {};
  dateB: Date = new Date('2021-08-08');
  setB: Set<number> = new Set<number>();
  mapB: Map<number, string> = new Map<number, string>();
  unionB: string | undefined = "";
  classB: Person = new Person();
  enumB: Status = Status.NotFound;
}

@Observed
class mixed2 {
  numA: number = 33;
  stringA: string = 'AA';
  booleanA: boolean = true;
  arrayA: number[] = [1,2,3];
  objectA: Object = {};
  dateA: Date = new Date('2021-08-08');
  setA: Set<number> = new Set<number>();
  mapA: Map<number, string> = new Map<number, string>();
  unionA: string | undefined = "";
  classA: Person = new Person();
  enumA: Status = Status.NotFound;
}

class mixed3 {
  @Track numA: number = 33;
  @Track stringA: string = 'AA';
  @Track booleanA: boolean = true;
  @Track arrayA: number[] = [1,2,3];
  @Track objectA: Object = {};
  @Track dateA: Date = new Date('2021-08-08');
  @Track setA: Set<number> = new Set<number>();
  @Track mapA: Map<number, string> = new Map<number, string>();
  @Track unionA: string | undefined = "";
  @Track classA: Person = new Person();
  @Track enumA: Status = Status.NotFound;
}


@Entry
@Component
struct MyStateSample {
  build() {

  }
}