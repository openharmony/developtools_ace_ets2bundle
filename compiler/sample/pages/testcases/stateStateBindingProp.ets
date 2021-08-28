class GreenButtonState {
    width:number = 0;

    constructor(width:number) {
        this.width = width;
    }
}

@Component
struct GreenButton {
    @Link greenButtonState:GreenButtonState;

    build() {
        Button("Green Button")
        .width(this.greenButtonState.width)
        .height(150.0)
        .backgroundColor("#00ff00")
        .onClick(() => {
            this.greenButtonState.width = (this.greenButtonState.width < 700) ? this.greenButtonState.width + 125 : 100;
            console.log("onClick handler on GreenButton, updated value this.greenButtonState.width: " + this.greenButtonState.width);
        })
    }
}

@Component
struct RedButton {
    @State redButtonState:number = 100;

    build() {
        Button("Red Button")
        .width(this.redButtonState)
        .height(150.0)
        .backgroundColor("#ff0000")
        .onClick(() => {
            this.redButtonState = (this.redButtonState < 700) ? this.redButtonState + 80 : 100;
            console.log("onClick handler on RedButton, updated value this.redButtonState: " + this.redButtonState);
        })
    }
}

@Component
struct YellowButton {
    @Prop yellowButtonState:number;

    build(){
        Button("Yellow Button")
        .width(this.yellowButtonState)
        .height(150.0)
        .backgroundColor("#ffff00")
        .onClick(() => {
            this.yellowButtonState += 50.0;
            console.log("onClick handler on YellowButton, updated value this.yellowButtonState: " + this.yellowButtonState);
        })
    }
}

@Entry
@Component
struct ShufflingContainer {
    @State shuffle:boolean = false;
    @State greenButtonState:GreenButtonState = new GreenButtonState(300);
    @State yellowButtonProp:number = 100;

    build() {
        Column(){
           Button(`Parent View: ${this.shuffle ? 'Shuffle to Red before Green' : 'Shuffle to Green before Red'}`)
            .width(700.0)
            .height(150.0)
            .onClick(() => {
                this.shuffle = !this.shuffle
                console.log("onClick handler on ShufflingContainer, updated value this.shuffle: " + this.shuffle);
            }) //Button "B1"
            Button("Parent View: Set yellowButtonProp")
            .width(700.0)
            .height(150.0)
            .onClick(() => {
                this.yellowButtonProp = (this.yellowButtonProp < 700) ? this.yellowButtonProp + 100 : 100;
                console.log("onClick handler on ShufflingContainer, updated value of yellowButtonProp: " + this.yellowButtonProp);
            }) //Button "B2"
            if(this.shuffle) {
                GreenButton({ greenButtonState: $greenButtonState })
                RedButton()
                YellowButton({ yellowButtonState: this.yellowButtonProp })
            } else {
                RedButton()
                YellowButton({ yellowButtonState: this.yellowButtonProp })
                GreenButton({ greenButtonState: $greenButtonState })
            }
        }
    }
}