/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
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

import * as arkts from "@koalaui/libarkts";
import { AbstractVisitor } from "../common/abstract-visitor";
import { hasBuilderLambdaAnnotation } from "./utils";

interface ComponentInfo {
    argsNum: number;
}

type ComponentCollection = Map<string, ComponentInfo> 

export class NameCollector extends AbstractVisitor {
    private components: ComponentCollection;
    private static instance: NameCollector;

    private constructor() {
        super();
        this.components = new Map();
    }

    static getInstance(): NameCollector {
        if (!this.instance) {
            this.instance = new NameCollector();
        }
        return this.instance;
    }

    getComponents(): string[] {
        return Array.from(this.components.keys());
    }

    getComponentInfo(componentName: string): ComponentInfo | undefined {
        return this.components.get(componentName);
    }

    collectInfoFromComponentFunction(component: arkts.ScriptFunction): void {
        if (!component.id) return;

        const name: string = component.id.name;
        const argsNum: number = component.params.length;
        this.components.set(name, { argsNum });
    }

    reset(): void {
        super.reset();
        this.components.clear();
    }

    findComponentFunction(node: arkts.FunctionDeclaration): arkts.ScriptFunction | undefined {
        const isDeclareAndExport: boolean = arkts.hasModifierFlag(
            node, 
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_DECLARE 
            | arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_EXPORT
        )
        if (!isDeclareAndExport) return undefined;

        const isComponentBuilder = hasBuilderLambdaAnnotation(node);
        if (!isComponentBuilder) return undefined;
        if (!node.scriptFunction.id) return undefined;

        return node.scriptFunction;
    }

    visitor(node: arkts.AstNode): arkts.AstNode { 
        const newNode = this.visitEachChild(node);
        if (arkts.isFunctionDeclaration(newNode)) {
            const component = this.findComponentFunction(newNode);
            if (!!component) {
                this.collectInfoFromComponentFunction(component);
            }
        }
        return newNode;
    }
}