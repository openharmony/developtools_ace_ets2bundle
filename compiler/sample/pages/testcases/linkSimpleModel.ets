@Component
@Entry
struct Player {
    @State isPlaying: boolean = false
    build() {
        Column() {
            PlayButton({ buttonPlaying: $isPlaying })
            Text(`Player is ${this.isPlaying? '':'not'} playing`)
        }
    }
}

@Component
struct PlayButton {
    @Link buttonPlaying: boolean
    build() {
        Column() {
            Button() {
                Image(this.buttonPlaying? "play.png": "pause.png")
            }.onClick(() => {
                this.buttonPlaying = !this.buttonPlaying
            })
        }
    }
}
