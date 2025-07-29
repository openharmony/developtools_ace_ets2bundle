import { ClassA } from "./testa";
import { ClassD } from "./testd";
export class ClassC {
  name: string;
  age: number;
  classMember: ClassA;

  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
    this.classMember = new ClassA('123');
  }
}
