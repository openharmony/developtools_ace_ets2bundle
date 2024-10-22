declare const Hi: PropertyDecorator;
@Entry
@Component
struct ValidateCustomDecoratorIndex {
  @State @Hi message: string = 'Hello'
  build() {
    Row() {}
  }
}