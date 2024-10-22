@Entry
@Component
struct ValidateWatchParamIndex {
  @State @Watch(111) message: string = 'Hello'
  build() {
    Row() {}
  }
}