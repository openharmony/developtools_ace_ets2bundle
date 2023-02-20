/*
 * Copyright (c) 2022 Huawei Device Co., Ltd.
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
import { CustomContainerExport } from './test/pages/TestComponent';
@Component
struct CustomContainer {
  header: string = "";
  @BuilderParam content: () => void;
  @BuilderParam callContent: any;
  footer: string = "";
  build() {
    Column() {
      Text(this.header)
      this.content()
      this.callContent()
      Text(this.footer)
    }
  }
}

@Component
struct CustomContainer2 {
  header: string = "";
  @BuilderParam content: () => void;
  build() {
    Column() {
      Text(this.header)
      this.content()
    }
  }
}

@Builder function specificWithParam(label1: string, label2: string) {
  Column() {
    Text(label1).fontSize(50)
    Text(label2).fontSize(50)
  }
}

@Entry
@Component
struct CustomContainerUser {
  @State text: string = 'header'
  @Builder specificParam() {
    Column() {
      Text("content").fontSize(50)
    }
  }
  @Builder callSpecificParam(label1: string, label2: string) {
    Column() {
      Text(label1).fontSize(50)
      Text(label2).fontSize(50)
    }
  }

  build() {
    Column() {
      CustomContainerExport({
        header: this.text,
      }){
        Column(){
          specificWithParam("111", "22")
        }.onClick(()=>{
          this.text = "changeHeader"
        })
      }
      Row(){
        CustomContainer({
          header: this.text,
          content: this.specificParam,
          callContent: this.callSpecificParam("callContent1", 'callContent2'),
          footer: "Footer",
        })
      }
      Row(){
        CustomContainer2({
          header: this.text,
        }){
          Column(){
            this.callSpecificParam("111", '222')
          }.onClick(()=>{
            this.text = "changeHeader"
          })
        }
      }
    }
  }
}
`
exports.expectResult =
`"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TestComponent_1 = require("./test/pages/TestComponent");
class CustomContainer extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1) {
        super(parent, __localStorage, elmtId);
        this.header = "";
        this.content = undefined;
        this.callContent = undefined;
        this.footer = "";
        this.setInitiallyProvidedValue(params);
    }
    setInitiallyProvidedValue(params) {
        if (params.header !== undefined) {
            this.header = params.header;
        }
        if (params.content !== undefined) {
            this.content = params.content;
        }
        if (params.callContent !== undefined) {
            this.callContent = params.callContent;
        }
        if (params.footer !== undefined) {
            this.footer = params.footer;
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
    initialRender() {
        this.observeComponentCreation((elmtId, isInitialRender) => {
            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
            Column.create();
            if (!isInitialRender) {
                Column.pop();
            }
            ViewStackProcessor.StopGetAccessRecording();
        });
        this.observeComponentCreation((elmtId, isInitialRender) => {
            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
            Text.create(this.header);
            if (!isInitialRender) {
                Text.pop();
            }
            ViewStackProcessor.StopGetAccessRecording();
        });
        Text.pop();
        this.content.bind(this)();
        this.callContent.bind(this)();
        this.observeComponentCreation((elmtId, isInitialRender) => {
            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
            Text.create(this.footer);
            if (!isInitialRender) {
                Text.pop();
            }
            ViewStackProcessor.StopGetAccessRecording();
        });
        Text.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
class CustomContainer2 extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1) {
        super(parent, __localStorage, elmtId);
        this.header = "";
        this.content = undefined;
        this.setInitiallyProvidedValue(params);
    }
    setInitiallyProvidedValue(params) {
        if (params.header !== undefined) {
            this.header = params.header;
        }
        if (params.content !== undefined) {
            this.content = params.content;
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
    initialRender() {
        this.observeComponentCreation((elmtId, isInitialRender) => {
            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
            Column.create();
            if (!isInitialRender) {
                Column.pop();
            }
            ViewStackProcessor.StopGetAccessRecording();
        });
        this.observeComponentCreation((elmtId, isInitialRender) => {
            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
            Text.create(this.header);
            if (!isInitialRender) {
                Text.pop();
            }
            ViewStackProcessor.StopGetAccessRecording();
        });
        Text.pop();
        this.content.bind(this)();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
function specificWithParam(label1, label2, parent = null) {
    (parent ? parent : this).observeComponentCreation((elmtId, isInitialRender) => {
        ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
        Column.create();
        if (!isInitialRender) {
            Column.pop();
        }
        ViewStackProcessor.StopGetAccessRecording();
    });
    (parent ? parent : this).observeComponentCreation((elmtId, isInitialRender) => {
        ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
        Text.create(label1);
        Text.fontSize(50);
        if (!isInitialRender) {
            Text.pop();
        }
        ViewStackProcessor.StopGetAccessRecording();
    });
    Text.pop();
    (parent ? parent : this).observeComponentCreation((elmtId, isInitialRender) => {
        ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
        Text.create(label2);
        Text.fontSize(50);
        if (!isInitialRender) {
            Text.pop();
        }
        ViewStackProcessor.StopGetAccessRecording();
    });
    Text.pop();
    Column.pop();
}
class CustomContainerUser extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1) {
        super(parent, __localStorage, elmtId);
        this.__text = new ObservedPropertySimplePU('header', this, "text");
        this.setInitiallyProvidedValue(params);
    }
    setInitiallyProvidedValue(params) {
        if (params.text !== undefined) {
            this.text = params.text;
        }
    }
    updateStateVars(params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__text.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__text.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    get text() {
        return this.__text.get();
    }
    set text(newValue) {
        this.__text.set(newValue);
    }
    specificParam(parent = null) {
        this.observeComponentCreation((elmtId, isInitialRender) => {
            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
            Column.create();
            if (!isInitialRender) {
                Column.pop();
            }
            ViewStackProcessor.StopGetAccessRecording();
        });
        this.observeComponentCreation((elmtId, isInitialRender) => {
            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
            Text.create("content");
            Text.fontSize(50);
            if (!isInitialRender) {
                Text.pop();
            }
            ViewStackProcessor.StopGetAccessRecording();
        });
        Text.pop();
        Column.pop();
    }
    callSpecificParam(label1, label2, parent = null) {
        this.observeComponentCreation((elmtId, isInitialRender) => {
            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
            Column.create();
            if (!isInitialRender) {
                Column.pop();
            }
            ViewStackProcessor.StopGetAccessRecording();
        });
        this.observeComponentCreation((elmtId, isInitialRender) => {
            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
            Text.create(label1);
            Text.fontSize(50);
            if (!isInitialRender) {
                Text.pop();
            }
            ViewStackProcessor.StopGetAccessRecording();
        });
        Text.pop();
        this.observeComponentCreation((elmtId, isInitialRender) => {
            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
            Text.create(label2);
            Text.fontSize(50);
            if (!isInitialRender) {
                Text.pop();
            }
            ViewStackProcessor.StopGetAccessRecording();
        });
        Text.pop();
        Column.pop();
    }
    initialRender() {
        this.observeComponentCreation((elmtId, isInitialRender) => {
            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
            Column.create();
            if (!isInitialRender) {
                Column.pop();
            }
            ViewStackProcessor.StopGetAccessRecording();
        });
        {
            this.observeComponentCreation((elmtId, isInitialRender) => {
                ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                if (isInitialRender) {
                    ViewPU.create(new TestComponent_1.CustomContainerExport(this, {
                        header: this.text,
                        closer: () => {
                            this.observeComponentCreation((elmtId, isInitialRender) => {
                                ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                                Column.create();
                                Column.onClick(() => {
                                    this.text = "changeHeader";
                                });
                                if (!isInitialRender) {
                                    Column.pop();
                                }
                                ViewStackProcessor.StopGetAccessRecording();
                            });
                            specificWithParam.bind(this)("111", "22");
                            Column.pop();
                        }
                    }, undefined, elmtId));
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {});
                }
                ViewStackProcessor.StopGetAccessRecording();
            });
        }
        this.observeComponentCreation((elmtId, isInitialRender) => {
            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
            Row.create();
            if (!isInitialRender) {
                Row.pop();
            }
            ViewStackProcessor.StopGetAccessRecording();
        });
        {
            this.observeComponentCreation((elmtId, isInitialRender) => {
                ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                if (isInitialRender) {
                    ViewPU.create(new CustomContainer(this, {
                        header: this.text,
                        content: this.specificParam,
                        callContent: this.callSpecificParam("callContent1", 'callContent2'),
                        footer: "Footer",
                    }, undefined, elmtId));
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {});
                }
                ViewStackProcessor.StopGetAccessRecording();
            });
        }
        Row.pop();
        this.observeComponentCreation((elmtId, isInitialRender) => {
            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
            Row.create();
            if (!isInitialRender) {
                Row.pop();
            }
            ViewStackProcessor.StopGetAccessRecording();
        });
        {
            this.observeComponentCreation((elmtId, isInitialRender) => {
                ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                if (isInitialRender) {
                    ViewPU.create(new CustomContainer2(this, {
                        header: this.text,
                        content: () => {
                            this.observeComponentCreation((elmtId, isInitialRender) => {
                                ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                                Column.create();
                                Column.onClick(() => {
                                    this.text = "changeHeader";
                                });
                                if (!isInitialRender) {
                                    Column.pop();
                                }
                                ViewStackProcessor.StopGetAccessRecording();
                            });
                            this.callSpecificParam.bind(this)("111", '222');
                            Column.pop();
                        }
                    }, undefined, elmtId));
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {});
                }
                ViewStackProcessor.StopGetAccessRecording();
            });
        }
        Row.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
ViewStackProcessor.StartGetAccessRecordingFor(ViewStackProcessor.AllocateNewElmetIdForNextComponent());
loadDocument(new CustomContainerUser(undefined, {}));
ViewStackProcessor.StopGetAccessRecording();
`
