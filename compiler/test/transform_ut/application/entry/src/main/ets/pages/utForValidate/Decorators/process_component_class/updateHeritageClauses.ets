class TestCase {
  private name: string;
  constructor(name) {
    this.name = name;
  }
 }
// @ts-nocheck
@Entry
@Component
struct Index extends TestCase{
  build() {
    Row(){}
  }
}
