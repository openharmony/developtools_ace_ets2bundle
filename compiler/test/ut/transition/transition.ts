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
struct HomeComponent {
    @State scale: number = 1
    @State opacity: number = 1
    build() {
        Column() {
            Text('hello world')
                .fontColor(Color.Red)
        }.scale(this.scale)
         .opacity(this.opacity)
    }
    pageTransition() {
        PageTransitionEnter({type: RouteType.Push, duration: 1200})
            .slide(SlideEffect.Left)
        PageTransitionEnter({type: RouteType.Pop, duration: 1200, curve: Curve.Linear})
            .onEnter((type: RouteType, progress: number) => {
                this.scale = 1
                this.opacity = progress
            })
        PageTransitionExit({type: RouteType.Push, curve: Curve.Linear})
            .translate({x: 100.0, y: 100.0})
            .opacity(0)
        PageTransitionExit({type: RouteType.Pop, duration: 1500, curve: Curve.Ease})
            .onExit((type: RouteType, progress: number) => {
            this.scale = 1 - progress
            this.opacity = 1
            })
    }
}`

exports.expectResult =
`"use strict";
class HomeComponent extends View {
    constructor(compilerAssignedUniqueChildId, parent, params) {
        super(compilerAssignedUniqueChildId, parent);
        this.__scale = new ObservedPropertySimple(1, this, "scale");
        this.__opacity = new ObservedPropertySimple(1, this, "opacity");
        this.updateWithValueParams(params);
    }
    updateWithValueParams(params) {
        if (params.scale !== undefined) {
            this.scale = params.scale;
        }
        if (params.opacity !== undefined) {
            this.opacity = params.opacity;
        }
    }
    aboutToBeDeleted() {
        this.__scale.aboutToBeDeleted();
        this.__opacity.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id());
    }
    get scale() {
        return this.__scale.get();
    }
    set scale(newValue) {
        this.__scale.set(newValue);
    }
    get opacity() {
        return this.__opacity.get();
    }
    set opacity(newValue) {
        this.__opacity.set(newValue);
    }
    render() {
        Column.create();
        Column.scale(this.scale);
        Column.opacity(this.opacity);
        Text.create('hello world');
        Text.fontColor(Color.Red);
        Text.pop();
        Column.pop();
    }
    pageTransition() {
        PageTransition.create();
        PageTransitionEnter.create({ type: RouteType.Push, duration: 1200 });
        PageTransitionEnter.slide(SlideEffect.Left);
        PageTransitionEnter.create({ type: RouteType.Pop, duration: 1200, curve: Curve.Linear });
        PageTransitionEnter.onEnter((type, progress) => {
            this.scale = 1;
            this.opacity = progress;
        });
        PageTransitionExit.create({ type: RouteType.Push, curve: Curve.Linear });
        PageTransitionExit.translate({ x: 100.0, y: 100.0 });
        PageTransitionExit.opacity(0);
        PageTransitionExit.create({ type: RouteType.Pop, duration: 1500, curve: Curve.Ease });
        PageTransitionExit.onExit((type, progress) => {
            this.scale = 1 - progress;
            this.opacity = 1;
        });
        PageTransition.pop();
    }
}
loadDocument(new HomeComponent("1", undefined, {}));
`