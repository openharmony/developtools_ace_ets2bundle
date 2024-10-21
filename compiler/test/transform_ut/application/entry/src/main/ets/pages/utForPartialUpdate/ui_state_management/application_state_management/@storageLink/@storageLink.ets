let varA = AppStorage.Link('varA')
let envLang = AppStorage.Prop('languageCode')

@Entry
@Component
struct MyComponent {
  @StorageLink('varA') varA: number = 2
  @StorageProp('languageCode') lang: string = 'en'
  private label: string = 'count'

  private aboutToAppear() {
    this.label = (this.lang === 'zh') ? '数' : 'Count'
  }

  build() {
    Row({ space: 20 }) {
      Button(this.label + ': ' + this.varA)
        .onClick(() => {
          AppStorage.Set<number>('varA', AppStorage.Get<number>('varA') + 1)
        })
      Button('lang: ' + this.lang)
        .onClick(() => {
          if (this.lang === 'zh') {
            AppStorage.Set<string>('languageCode', 'en')
          } else {
            AppStorage.Set<string>('languageCode', 'zh')
          }
          this.label = (this.lang === 'zh') ? '数' : 'Count'
        })
    }
  }
}