// @ts-nocheck
@Entry
@Component
struct Index {
 @Watch('onWatch')message: string = 'Hello'
  build() {
    Row() {}
  }
}
