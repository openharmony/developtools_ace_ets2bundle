/*
 * Copyright (c) 2022-2025 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as arkts from '@koalaui/libarkts';

export class NamespaceProcessor {
    private static instance_: NamespaceProcessor | undefined = undefined;
    private componentInnerClassesStack_: arkts.ClassDeclaration[][];
    private totalInnerClassesCnt_: number;

    private constructor() {
        this.componentInnerClassesStack_ = [];
        this.totalInnerClassesCnt_ = 0;
    }

    public static getInstance(): NamespaceProcessor {
        if (this.instance_ === undefined) {
            this.instance_ = new NamespaceProcessor();
        }
        return this.instance_;
    }

    public reset(): void {
        this.componentInnerClassesStack_ = [];
        this.totalInnerClassesCnt_ = 0;
    }

    public get totalInnerClassesCnt(): number {
        return this.totalInnerClassesCnt_;
    }

    public enter(): void {
        this.componentInnerClassesStack_.push([]);
    }

    public exit(): void {
        this.componentInnerClassesStack_.pop();
    }

    public get currentNamepaceInnerClasses(): arkts.ClassDeclaration[] {
        return this.componentInnerClassesStack_[this.componentInnerClassesStack_.length - 1];
    }

    public addInnerClassToCurrentNamespace(cls: arkts.ClassDeclaration): void {
        this.currentNamepaceInnerClasses.push(cls);
        ++this.totalInnerClassesCnt_;
    }

    public updateCurrentNamespace(node: arkts.ETSModule): arkts.ETSModule {
        return arkts.factory.updateETSModule(node, [...node.statements, ...this.currentNamepaceInnerClasses]);
    }
}
