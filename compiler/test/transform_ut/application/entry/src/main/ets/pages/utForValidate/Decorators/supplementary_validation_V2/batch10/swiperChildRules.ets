/*
 * Copyright (c) 2026 Huawei Device Co., Ltd.
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

/**
 * Swiper component nesting patterns.
Tests valid Swiper usage with multiple child components.
Swiper allows direct child components as slides.
 */

// --- Valid Patterns ---

// Valid: Swiper with multiple Text children as slides
@Component
struct SwiperValidUse {
  build() {
    Swiper() {
      Text("page 1")
      Text("page 2")
      Text("page 3")
    }
  }
}

// Valid: Swiper with styled content
@Component
struct SwiperStyledContent {
  build() {
    Swiper() {
      Column() {
        Text("Slide 1").fontSize(24)
        Text("Description for slide 1")
      }
      Column() {
        Text("Slide 2").fontSize(24)
        Text("Description for slide 2")
      }
    }
  }
}

// Valid: Swiper with images
@Component
struct SwiperWithImages {
  build() {
    Swiper() {
      Image($r("app.media.icon")).width("100%")
      Image($r("app.media.icon")).width("100%")
    }
  }
}

// Valid: Swiper with ForEach
@Component
struct SwiperWithForEach {
  @State pages: string[] = ["Page A", "Page B", "Page C", "Page D"];
  build() {
    Swiper() {
      ForEach(this.pages, (page: string) => {
        Text(page).fontSize(20)
      }, (page: string) => page)
    }
  }
}

// Valid: Swiper with mixed content types
@Component
struct SwiperMixedContent {
  build() {
    Swiper() {
      Text("Simple text slide")
      Column() {
        Text("Complex slide")
        Button("Action")
      }
      Row() {
        Text("Row slide left")
        Text("Row slide right")
      }
    }
  }
}

// Valid: Swiper with configuration
@Component
struct SwiperConfigured {
  build() {
    Swiper() {
      Text("First")
      Text("Second")
      Text("Third")
    }
    .autoPlay(true)
    .interval(3000)
    .loop(true)
  }
}

@Entry
@Component
struct SwiperChildRulesEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
