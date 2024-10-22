@Entry
@Component
struct ValidateMultiDecoratorsIndex {
  @StorageLink('languageCode')@StorageProp('languageCode') lang: string = 'en'
  build() {
    Row() {}
  }
}