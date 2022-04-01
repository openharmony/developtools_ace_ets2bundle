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

/**
 * ACE @ Web Helsinki
 *
 * eDSL version of this application
 *
 * ( unverified due to lack of working eDSL transpiler )
 *
 * For comparison, the plain JS version of this app that works with ACE-Diff can be found here
 *
 * This is the ouput the eDSL transpiler should generate.
 */
let tasks: Array<any> = [
  { label: "Wash the car" },
  { label: "Buy some milk" },
  { label: "Make the report" },
  { label: "Buy flight tickets" },
  { label: "Update profile" },
  { label: "Change tyres" },
  { label: "Walk the dog" },
  { label: "Feed the dog" },
  { label: "Paint the walls" },
  { label: "Wash dishes" },
  { label: "Water flowers" },
  { label: "Call parents" },
  { label: "Refactor: align_component.cpp" },
  { label: "Refactor: align_component.h" },
  { label: "Refactor: arc_component.cpp" },
  { label: "Refactor: arc_component.h" },
  { label: "Refactor: block_component.cpp" },
  { label: "Refactor: block_component.h" },
  { label: "Refactor: box_base_component.cpp" },
  { label: "Refactor: box_base_component.h" },
  { label: "Refactor: box_component.cpp" },
  { label: "Refactor: box_component.h" },
  { label: "Refactor: bubble_component.cpp" },
  { label: "Refactor: bubble_component.h" },
  { label: "Refactor: button_component.cpp" },
  { label: "Refactor: button_component.h" },
  { label: "Refactor: calendar_component.cpp" },
  { label: "Refactor: calendar_component.h" },
  { label: "Refactor: calendar_data_adapter.cpp" },
  { label: "Refactor: calendar_data_adapter.h" },
  { label: "Refactor: chart_component.cpp" },
  { label: "Refactor: chart_component.h" },
  { label: "Refactor: checkable_component.cpp" },
  { label: "Refactor: checkable_component.h" },
  { label: "Refactor: clip_component.cpp" },
  { label: "Refactor: clip_component.h" },
  { label: "Refactor: component.cpp" },
  { label: "Refactor: component_group.h" },
  { label: "Refactor: component.h" },
  { label: "Refactor: composed_component.cpp" },
  { label: "Refactor: composed_component.h" },
  { label: "Refactor: constants.cpp" },
  { label: "Refactor: constants.h" },
  { label: "Refactor: sole_child_component.h" },
  { label: "Refactor: stack_component.h" },
  { label: "Refactor: stage_component.h" },
  { label: "Refactor: swiper_component.h" },
  { label: "Refactor: tab_bar_component.cpp" },
  { label: "Refactor: tab_bar_component.h" },
  { label: "Refactor: tab_bar_indicator_component.cpp" },
  { label: "Refactor: tab_bar_indicator_component.h" },
  { label: "Refactor: tab_bar_item_component.cpp" },
  { label: "Refactor: tab_bar_item_component.h" },
  { label: "Refactor: tab_content_component.cpp" },
  { label: "Refactor: tab_content_component.h" },
  { label: "Refactor: tab_controller.cpp" },
  { label: "Refactor: tab_controller.h" },
  { label: "Refactor: test" },
  { label: "Refactor: text_component.cpp" },
  { label: "Refactor: text_component.h" },
  { label: "Refactor: text_field_component.cpp" },
  { label: "Refactor: text_field_component.h" },
  { label: "Refactor: text_field_controller.cpp" },
  { label: "Refactor: text_field_controller.h" },
  { label: "Refactor: text_overlay_component.cpp" },
  { label: "Refactor: text_overlay_component.h" },
  { label: "Refactor: text_span_component.cpp" },
  { label: "Refactor: text_span_component.h" },
  { label: "Refactor: texture_component.cpp" },
  { label: "Refactor: texture_component.h" },
  { label: "Refactor: toast_component.cpp" },
  { label: "Refactor: toast_component.h" },
  { label: "Refactor: toggle_component.cpp" },
  { label: "Refactor: toggle_component.h" },
  { label: "Refactor: touch_listener_component.h" },
  { label: "Refactor: track_component.cpp" },
  { label: "Refactor: track_component.h" },
  { label: "Refactor: transform_component.cpp" },
  { label: "Refactor: transform_component.h" },
  { label: "Refactor: transition_component.cpp" },
  { label: "Refactor: transition_component.h" },
  { label: "Refactor: triangle_component.cpp" },
  { label: "Refactor: triangle_component.h" },
  { label: "Refactor: tween_component.cpp" },
  { label: "Refactor: tween_component.h" },
  { label: "Refactor: video_component.cpp" },
  { label: "Refactor: video_component.h" },
  { label: "Refactor: watch_slider_component.cpp" },
  { label: "Refactor: watch_slider_component.h" },
  { label: "Refactor: wrap_component.h" },
  { /* not used */ }
]

// Add ID for each task
tasks.forEach(function (item, index) {
  item.id = index
  tasks[index] = item
})

let tasksCount: number = tasks.length - 1
let screenCount: number = 20

@Entry
@Component
struct RootView {
  @State idx: number = 0

  build() {
    Column () {
      Column() {
        Row() {
          Button("Next task")
            .onClick(() => {
              if (this.idx < tasksCount - screenCount)
                this.idx++
            })
          Button("Prev task")
            .onClick(() => {
              if (this.idx > 0)
                this.idx--
            })
        }
      }
      ForEach(
          /* first parameter is an expression of type array.
            the point of not just using an array here is to clarify ForEach can not just perate on the
            source array (as repeat implementation in ACE-Light did) */
          tasks.slice(this.idx, this.idx + screenCount),

          /* the third, builder function take an item as input and creates a single View from it */
          item => {
            Text((item.id + 1) + " : " + item.label)
          },

          /* second parameter is an arrow function that takes an item as input
          and returns a persistent nique id (or key ) */
          item => item.id
      ) // ForEach
      Text("--- Page navigation ---")
      Row() {
        Button("First")
        .onClick(() => this.idx = 0)
        Button("End")
          .onClick(() => this.idx = tasksCount - screenCount)
      }
    }
  } // build
}  // struct
