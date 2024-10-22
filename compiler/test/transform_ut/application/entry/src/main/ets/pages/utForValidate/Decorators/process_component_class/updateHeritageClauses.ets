class TestCase {
  private name: string;
  constructor(name: string) {
    this.name = name;
  }
}
@Entry
@Component
struct UpdateHeritageClausesIndex extends TestCase{
  build() {
    Row(){}
  }
}