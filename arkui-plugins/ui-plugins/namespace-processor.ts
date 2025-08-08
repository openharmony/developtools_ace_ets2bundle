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
    private componentInterfacesStack_: arkts.TSInterfaceDeclaration[][];
    private totalInterfacesCnt_: number;

    private constructor() {
        this.componentInterfacesStack_ = [];
        this.totalInterfacesCnt_ = 0;
    }

    public static getInstance(): NamespaceProcessor {
        if (this.instance_ === undefined) {
            this.instance_ = new NamespaceProcessor();
        }
        return this.instance_;
    }

    public reset(): void {
        this.componentInterfacesStack_ = [];
        this.totalInterfacesCnt_ = 0;
    }

    public get totalInterfacesCnt(): number {
        return this.totalInterfacesCnt_;
    }

    public enter(): void {
        this.componentInterfacesStack_.push([]);
    }

    public exit(): void {
        this.componentInterfacesStack_.pop();
    }

    public get currentNamepaceInterfaces(): arkts.TSInterfaceDeclaration[] {
        return this.componentInterfacesStack_[this.componentInterfacesStack_.length - 1];
    }

    public addInterfaceToCurrentNamespace(interf: arkts.TSInterfaceDeclaration): void {
        this.currentNamepaceInterfaces.push(interf);
        ++this.totalInterfacesCnt_;
    }

    public updateCurrentNamespace(node: arkts.ETSModule): arkts.ETSModule {
        return arkts.factory.updateETSModule(node, [...node.statements, ...this.currentNamepaceInterfaces], node.ident, node.getNamespaceFlag(), node.program);
    }
}
