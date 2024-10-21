class BottomControllerParam {
    playedTime: string = '';
    totalTime: string = '';
    playedTimeNumber: number = 0;
}

@Entry
@Component
export struct VideoPlayer {
    private totalTime: string = '';
    @State currentPlayedTime: string = "00:00";
    @State currentPlayedTimeNumber: number = 1;

    @Builder
    bottomController($$: BottomControllerParam) {
        Column() {
            Text('Hello' + $$.playedTimeNumber)
                .fontSize(13)
                .margin({ left: 4, bottom: 12 })
                .id("played_time")

            TextInput({ text: $$.totalTime, placeholder: 'builder test' })
                .placeholderColor(Color.Grey)
                .placeholderFont({ size: 14, weight: 400 })
                .caretColor(Color.Blue)
                .width(300)

            Slider({
                value: $$.playedTimeNumber,
                min: 0,
                max: 1000,
                step: 1,
                style: SliderStyle.OutSet
            })
            .width('100%')
            .margin({ left: 8, right: 8 })
            .trackColor(Color.Gray)
            .showSteps(true)
            .id("slider")
        }
    }

    build() {
        Column() {
            this.bottomController(
                {
                    playedTime: this.currentPlayedTime,
                    totalTime: this.totalTime,
                    playedTimeNumber: this.currentPlayedTimeNumber
                }
            )
        }
    }
}