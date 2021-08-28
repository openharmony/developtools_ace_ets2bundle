// Customize the status data class.
class Model {
    value: string = '';
    constructor(value: string) {
        this.value = value;
    }
}

@Entry
@Component
struct EntryComponent {
    build() {
        Column(){
            MyComponentState() //MyComponent1 in this document
            MyComponentState() //MyComponent2 in this document
        }
    }
}

@Component
struct MyComponentState {

    @State title: Model = new Model('Hello World')
    @State count: number = 0
    private toggle: boolean = true

    build() {

        Column(){
            Text(`${this.title.value}`)
            Button()
                .onClick(() => {
                    this.toggle != this.toggle;
                    this.title.value = this.toggle ? 'Hello World' : 'Hello Ace';
                }) // Modify the internal status data of MyComponent using the anonymous method.

            Button() {
                Text(`click times: ${this.count}`)
                    .fontSize(10)
            }.onClick(() => {
                this.count += 1
            })
        }

    }
}
