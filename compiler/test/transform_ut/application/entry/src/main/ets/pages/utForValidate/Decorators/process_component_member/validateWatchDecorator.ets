@Entry
@Component
struct ValidateWatchDecoratorIndex {
  @Watch('onWatch')message: string = 'Hello'
  build() {
    Row() {}
  }
}