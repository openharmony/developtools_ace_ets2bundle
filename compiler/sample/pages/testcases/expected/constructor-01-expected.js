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

class MyStateComponent extends View {
    constructor(inputParams) {
        super();
        this.myState1 = { count: 0 };
        this.myState2 = 0;
        this.myState3 = false;
        this.myState4 = 'Home';
        this.myVar = 0;
        Object.assign(this, inputParams);
        this.createState("myState1");
        this.createState("myState2");
        this.createState("myState3");
        this.createState("myState4");
    }
    render() {
    }
}
loadDocument(new MyStateComponent());
