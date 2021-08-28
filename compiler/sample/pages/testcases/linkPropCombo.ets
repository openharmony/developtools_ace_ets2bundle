@Component
@Entry
struct ParentView {
    @State counter:number = 0;
    build() {
        Column() {
            ChildA({counterVal: this.counter})
            ChildB({counterRef: $counter})
        }
    }
}

@Component
struct ChildA {
    @Prop counterVal: number;
    build() {
        Button() {
            Text(`ChildA: (${this.counterVal}) +1`)
        }
        .onClick(() => this.counterVal += 1)
    }
}

@Component
struct ChildB {
    @Link counterRef: number;
    build() {
        Button() {
            Text(`ChildB: (${this.counterRef}) +1`)
        }
        .onClick(() => this.counterRef += 1)
    }
}