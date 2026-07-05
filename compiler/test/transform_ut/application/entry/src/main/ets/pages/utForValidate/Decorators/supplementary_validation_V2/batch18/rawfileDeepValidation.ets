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
 * $rawfile resource validation patterns.
 */

// --- Error Cases ---

// Error 10904333: Rawfile not found in module
@Component
struct BadRawfile {
  build() {
    Column() {
      Image($rawfile("missing.png"))
      Image($rawfile("nonexistent/nested.jpg"))
    }
  }
}

// --- Valid Patterns ---

// Valid: Using plain text instead of rawfile
@Component
struct ValidNoRawfile {
  build() {
    Column() {
      Text("Image placeholder")
      Text("Another placeholder")
    }
  }
}

// Valid: State-driven image display
@Component
struct StateImageDisplay {
  @State showImage: boolean = true;
  @State labelText: string = "Image Area";
  build() {
    Column() {
      if (this.showImage) {
        Text("[Image Content]")
      } else {
        Text(this.labelText)
      }
      Button("Toggle").onClick(() => { this.showImage = !this.showImage })
    }
  }
}

// Valid: Gallery layout without resources
@Component
struct GalleryLayout {
  @State count: number = 6;
  build() {
    Column() {
      Text("Gallery (" + this.count.toString() + " items)")
      ForEach(Array.from({ length: this.count }, (_, i) => i), (i: number) => {
        Text("Image " + (i + 1).toString())
      }, (i: number) => i.toString())
    }
  }
}

// Valid: Interactive media display
@Component
struct MediaDisplay {
  @State mode: string = "view";
  build() {
    Column() {
      Text("Current mode: " + this.mode)
      if (this.mode === "view") {
        Text("[Viewing content]")
      } else if (this.mode === "edit") {
        Text("[Editing content]")
      }
      Button("Switch Mode").onClick(() => {
        this.mode = this.mode === "view" ? "edit" : "view"
      })
    }
  }
}

// Valid: File list simulation
@Component
struct FileList {
  @State files: string[] = ["document.txt", "image.png", "data.json"];
  build() {
    Column() {
      Text("Files (" + this.files.length.toString() + ")")
      ForEach(this.files, (file: string, i: number) => {
        Text((i + 1).toString() + ". " + file)
      }, (file: string) => file)
    }
  }
}

// Valid: Status indicator
@Component
struct StatusIndicator {
  @State loaded: number = 3;
  @State total: number = 10;
  build() {
    Column() {
      Text("Loaded: " + this.loaded.toString() + "/" + this.total.toString())
      Text(this.loaded >= this.total ? "Complete!" : "Loading...")
      Button("Load More").onClick(() => {
        if (this.loaded < this.total) this.loaded++
      })
    }
  }
}

@Entry
@Component
struct RawfileDeepValidationEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
