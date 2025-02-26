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

import * as arkts from "@koalaui/libarkts"

export function annotation(name: string): arkts.AnnotationUsage {
    const ident: arkts.Identifier = arkts.factory.createIdentifier(name).setAnnotationUsage();
    const annotation: arkts.AnnotationUsage = arkts.factory.createAnnotationUsage(ident);

    annotation.modifiers = arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_ANNOTATION_USAGE;
    ident.parent = annotation;

    return annotation;
}

export function expectName(node: arkts.AstNode): string {
    if (!arkts.isIdentifier(node)) {
        throw new Error("Expected an identifier, got: " + arkts.nodeType(node).toString());
    }
    return node.name;
}

export function mangle(value: string): string {
    return `__${value}`;
}

export function backingField(originalName: string): string {
    return mangle(`backing_${originalName}`);
}

export function filterDefined<T>(value: (T | undefined)[]): T[] {
    return value.filter((it: T | undefined): it is T => it != undefined);
}

export function collect<T>(...value: (ReadonlyArray<T> | T | undefined)[]): T[] {
    const empty: (T | undefined)[] = []
    return filterDefined(empty.concat(...value))
}
