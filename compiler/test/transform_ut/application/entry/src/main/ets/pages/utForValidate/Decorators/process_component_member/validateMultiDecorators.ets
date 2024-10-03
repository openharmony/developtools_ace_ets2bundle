// @ts-nocheck
@Entry
@Component
struct Index {
 @StorageLink('languageCode')@StorageProp('languageCode') lang: string = 'en'
  build() {
    Row() {}
  }
}
