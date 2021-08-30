@Component
@Entry
struct Parent {
    @State arr: number[] = [1, 2, 3]
    build() {
        Column() {
            Child({items: $arr})
            ForEach(this.arr,
                item => {Text(`${item}`)},
                item => item)
        }
    }
}

@Component
struct Child {
    @Link items: number[]
    build() {
        Column() {
            Button() {
                Text("Button1: push")
            }.onClick(() => {
                this.items.push(100)
            })
            Button() {
                Text("Button2: replace whole item")
            }.onClick(() => {
                this.items = [100, 200, 300]
            })
        }
    }
}
