/*
 * Copyright (c) 2023 Huawei Device Co., Ltd.
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
@Builder
function global() {
  Text('Global Builder')
}

@Entry
@Component
struct Index {
  judge: boolean = true
  @Builder inner(param: string) {
    Text('Inner Builder Text')
      .bindPopup(false, {
        onStateChange: (e) => {},
        builder: global()
      })
    Text('Inner Builder Text2')
      .bindPopup(false, {
        onStateChange: (e) => {},
        builder: this.judge ? global : undefined
      })
  }

  build() {
    Column() {
      Row()
        .bindMenu(this.inner("111"))
      Row()
        .bindMenu(this.judge ? this.inner("111") : global)
      Row()
        .onDragStart((event: DragEvent, extraParams: string) => {
          console.log('Text onDragStarts, ' + extraParams)
          return this.judge ? this.inner : global()
        })
      Row()
        .onDragStart((event: DragEvent, extraParams: string) => {
          console.log('Text onDragStarts, ' + extraParams)
          return {
            builder: this.judge ? this.inner() : undefined
          }
        })
      Text('Text')
        .bindPopup(false, {
          onStateChange: (e) => {},
          builder: undefined
        })
    }
  }
}
`

exports.expectResult =
`"use strict";
function global(parent = null) {
    (parent ? parent : this).observeComponentCreation2((elmtId, isInitialRender) => {
        Text.create('Global Builder');
    }, Text);
    Text.pop();
}
class Index extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1) {
        super(parent, __localStorage, elmtId);
        this.judge = true;
        this.setInitiallyProvidedValue(params);
    }
    setInitiallyProvidedValue(params) {
        if (params.judge !== undefined) {
            this.judge = params.judge;
        }
    }
    updateStateVars(params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
    }
    aboutToBeDeleted() {
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    inner(param, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('Inner Builder Text');
            if (isInitialRender) {
                Text.bindPopup(false, {
                    onStateChange: (e) => { },
                    builder: { builder: () => {
                            global.call(this);
                        } }
                });
            }
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('Inner Builder Text2');
            Text.bindPopup(false, {
                onStateChange: (e) => { },
                builder: this.judge ? { builder: global.bind(this) } : undefined
            });
        }, Text);
        Text.pop();
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.bindMenu({ builder: () => {
                    this.inner.call(this, "111");
                } });
        }, Row);
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.bindMenu(this.judge ? { builder: () => {
                    this.inner.call(this, "111");
                } } : { builder: global.bind(this) });
        }, Row);
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.onDragStart((event, extraParams) => {
                console.log('Text onDragStarts, ' + extraParams);
                return this.judge ? { builder: this.inner.bind(this) } : { builder: () => {
                        global.call(this);
                    } };
            });
        }, Row);
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.onDragStart((event, extraParams) => {
                console.log('Text onDragStarts, ' + extraParams);
                return { builder: this.judge ? { builder: () => {
                            this.inner.call(this);
                        } } : undefined };
            });
        }, Row);
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('Text');
            Text.bindPopup(false, {
                onStateChange: (e) => { },
                builder: undefined
            });
        }, Text);
        Text.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
ViewStackProcessor.StartGetAccessRecordingFor(ViewStackProcessor.AllocateNewElmetIdForNextComponent());
loadDocument(new Index(undefined, {}));
ViewStackProcessor.StopGetAccessRecording();
`
