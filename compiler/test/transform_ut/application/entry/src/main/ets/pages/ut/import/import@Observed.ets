import { ClassB as ClassA } from '../../../test/import@Observed'
@Component
struct ViewA {
  label: string = 'ViewA1'
  @ObjectLink a: ClassA

  build() {
    Row() {
      Button('ViewA'+ JSON.stringify(this.label) + 'this.a.c='+JSON.stringify(this.a.c))
        .onClick(() => {
          this.a.c += 1
        })
    }.margin({ top: 10 })
  }
}

@Entry
@Component
struct ViewB {
  @State arrA: ClassA[] = [new ClassA(0), new ClassA(0)]

  build() {
    Column() {
      ForEach(this.arrA, (item) => {
        ViewA({ label: JSON.stringify(item.id), a: item })
      }, (item) => item.id.toString())
      ViewA({ label: JSON.stringify(this.arrA[0]), a: this.arrA[0] })
      ViewA({ label: JSON.stringify(this.arrA[this.arrA.length - 1]), a: this.arrA[this.arrA.length - 1] })

      Button('ViewB: reset array')
        .margin({ top: 10 })
        .onClick(() => {
          this.arrA = [new ClassA(0), new ClassA(0)]
        })
      Button('ViewB: push')
        .margin({ top: 10 })
        .onClick(() => {
          this.arrA.push(new ClassA(0))
        })
      Button('ViewB: shift')
        .margin({ top: 10 })
        .onClick(() => {
          this.arrA.shift()
        })
    }.width('100%')
  }
}