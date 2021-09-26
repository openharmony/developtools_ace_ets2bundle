/*
 * Copyright (c) 2021 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
