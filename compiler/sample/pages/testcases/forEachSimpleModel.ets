@Entry
@Component
struct MyComponent2 {
    @State arr: number[] = [10, 20, 30]

    build() {
        Column() {
            Button() {
                Text('Reverse Array')
                    .fontSize(30)
            }.onClick(() => {
                this.arr.reverse()
            }).width(80).height(40)
            Button() {
                Text('clear Array')
                    .fontSize(30)
            }.onClick(() => {
                this.arr.splice(0, 1)
            }).width(80).height(40)
            Button() {
                Text('replace Array item')
                    .fontSize(30)
            }.onClick(() => {
                this.arr.splice(0, 1, 40)
            }).width(80).height(40)
            Button() {
                Text('replace Array')
                    .fontSize(30)
            }.onClick(() => {
                let newArr = [30, 40, 50]
                this.arr = newArr
            }).width(80).height(40)

            ForEach(this.arr,                         // Parameter 1: array to be iterated
                (item: number) => {               // Parameter 2: item generator
                    Text(`item value: ${item}`)
                        .fontSize(20)
                },
                (item: number) => item.toString() // Parameter 3: unique key generator, which is optional but recommended.
            )
        }.height(800)
    }
}
