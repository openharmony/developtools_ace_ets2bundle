import { ClassC } from "./testc";
export class ClassB {
  name: string;
  age: number;
  classMember: ClassC

  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
    this.classMember = new ClassC('123', 11);
  }
}