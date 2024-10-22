@Entry
@Component
struct ValidateHasIllegalDecoratorInEntryIndex {
  @Prop message: string = 'Hello'
  build() {
    Row() {}
  }
}