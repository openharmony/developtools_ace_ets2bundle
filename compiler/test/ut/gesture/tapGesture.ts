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

exports.source = `
@Entry
@Component
struct MyComponent {
  build() {
    Column() {
      Text("222").width(12)
        .gesture(
          GestureGroup(
            GestureMode.Sequence,
            LongPressGesture()
              .onAction(()=> {
                console.error('long press gesture recognized')
              })
              ,
            PanGesture()
              .onActionStart(()=> {
                  console.error('pan gesture start')
                }),
            GestureGroup(
              GestureMode.Sequence,
              LongPressGesture()
                .onAction(()=> {
                  console.error('long press gesture recognized')
                })
                ,
              PanGesture()
                .onActionStart(()=> {
                    console.error('pan gesture start')
                  })
            )
          )
          .onCancel(()=> {
            console.error('sequence gesture canceled')
          })
        )
        .height(21)
      Text("333").width(33).parallelGesture(
        TapGesture({count: 1, fingers:2})
          .onAction((event)=> {
             console.error('parallel gesture tap gesture recognized')
          })
        )
      Text("444").priorityGesture(
        TapGesture({count: 1, fingers:2})
          .onAction((event)=> {
            console.error('two fingers tap gesture recognized')
          }),
         GestureMask.IgnoreInternal
        )
    }
    .width(12)
    .gesture(
            GestureGroup(
              GestureMode.Sequence,
              LongPressGesture()
                .onAction(()=> {
                  console.error('long press gesture recognized')
                })
                ,
              PanGesture()
                .onActionStart(()=> {
                    console.error('pan gesture start')
                  })
            )
            .onCancel(()=> {
               console.error('sequence gesture canceled')
            })
        )
    .height(21)
  }
}`

exports.expectResult =
`class MyComponent extends View {
    constructor(compilerAssignedUniqueChildId, parent, params) {
        super(compilerAssignedUniqueChildId, parent);
        this.updateWithValueParams(params);
    }
    updateWithValueParams(params) {
    }
    aboutToBeDeleted() {
        SubscriberManager.Get().delete(this.id());
    }
    render() {
        Column.create();
        Column.width(12);
        Gesture.create(GesturePriority.Low);
        GestureGroup.create(GestureMode.Sequence);
        GestureGroup.onCancel(() => {
            console.error('sequence gesture canceled');
        });
        LongPressGesture.create();
        LongPressGesture.onAction(() => {
            console.error('long press gesture recognized');
        });
        LongPressGesture.pop();
        PanGesture.create();
        PanGesture.onActionStart(() => {
            console.error('pan gesture start');
        });
        PanGesture.pop();
        GestureGroup.pop();
        Gesture.pop();
        Column.height(21);
        Text.create("222");
        Text.width(12);
        Gesture.create(GesturePriority.Low);
        GestureGroup.create(GestureMode.Sequence);
        GestureGroup.onCancel(() => {
            console.error('sequence gesture canceled');
        });
        LongPressGesture.create();
        LongPressGesture.onAction(() => {
            console.error('long press gesture recognized');
        });
        LongPressGesture.pop();
        PanGesture.create();
        PanGesture.onActionStart(() => {
            console.error('pan gesture start');
        });
        PanGesture.pop();
        GestureGroup.create(GestureMode.Sequence);
        LongPressGesture.create();
        LongPressGesture.onAction(() => {
            console.error('long press gesture recognized');
        });
        LongPressGesture.pop();
        PanGesture.create();
        PanGesture.onActionStart(() => {
            console.error('pan gesture start');
        });
        PanGesture.pop();
        GestureGroup.pop();
        GestureGroup.pop();
        Gesture.pop();
        Text.height(21);
        Text.pop();
        Text.create("333");
        Text.width(33);
        Gesture.create(GesturePriority.Parallel);
        TapGesture.create({ count: 1, fingers: 2 });
        TapGesture.onAction((event) => {
            console.error('parallel gesture tap gesture recognized');
        });
        TapGesture.pop();
        Gesture.pop();
        Text.pop();
        Text.create("444");
        Gesture.create(GesturePriority.High, GestureMask.IgnoreInternal);
        TapGesture.create({ count: 1, fingers: 2 });
        TapGesture.onAction((event) => {
            console.error('two fingers tap gesture recognized');
        });
        TapGesture.pop();
        Gesture.pop();
        Text.pop();
        Column.pop();
    }
}
loadDocument(new MyComponent("1", undefined, {}));
`
