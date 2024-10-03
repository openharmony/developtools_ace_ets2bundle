// @ts-nocheck
@Entry
@Component
struct Index {
 @State @Watch(111) message: string = 'Hello'
  build() {
    Row() {}
  }
}
