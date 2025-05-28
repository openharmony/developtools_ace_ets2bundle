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

import * as arkts from '@koalaui/libarkts';


/**
 * create and insert `import { <imported> as <local> } from <source>` to the top of script's statements.
 */
export function createAndInsertImportDeclaration(
    source: arkts.StringLiteral,
    imported: arkts.Identifier,
    local: arkts.Identifier,
    importKind: arkts.Es2pandaImportKinds,
    program: arkts.Program
): void {
    const importDecl: arkts.ETSImportDeclaration = arkts.factory.createImportDeclaration(
        source,
        [arkts.factory.createImportSpecifier(imported, local)],
        importKind,
        program,
        arkts.Es2pandaImportFlags.IMPORT_FLAGS_NONE
    );
    arkts.importDeclarationInsert(importDecl, program);
    return;
}

export function annotation(name: string): arkts.AnnotationUsage {
    const ident: arkts.Identifier = arkts.factory.createIdentifier(name).setAnnotationUsage();
    const annotation: arkts.AnnotationUsage = arkts.factory.createAnnotationUsage(ident);

    annotation.modifiers = arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_ANNOTATION_USAGE;
    ident.parent = annotation;

    return annotation;
}

export function isAnnotation(node: arkts.AnnotationUsage, annoName: string) {
    return node.expr !== undefined && arkts.isIdentifier(node.expr) && node.expr.name === annoName;
}

export function removeAnnotationByName(
    annotations: readonly arkts.AnnotationUsage[],
    annoName: string
): arkts.AnnotationUsage[] {
    return annotations.filter((it) => !isAnnotation(it, annoName));
}

export function expectName(node: arkts.AstNode | undefined): string {
    if (!node) {
        throw new Error('Expected an identifier, got empty node');
    }
    if (!arkts.isIdentifier(node)) {
        throw new Error('Expected an identifier, got: ' + arkts.nodeType(node).toString());
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
    const empty: (T | undefined)[] = [];
    return filterDefined(empty.concat(...value));
}

export function matchPrefix(prefixCollection: (string | RegExp)[], name: string): boolean {
    for (const prefix of prefixCollection) {
        let regex: RegExp;

        if (typeof prefix === 'string') {
            regex = new RegExp('^' + prefix);
        } else {
            regex = new RegExp('^' + prefix.source);
        }

        if (regex.test(name)) {
            return true;
        }
    }
    return false;
}

export function moveToFront<T>(arr: T[], idx: number): T[] {
    if (idx < 0 || idx >= arr.length) {
        throw new Error(`Index ${idx} is out of bounds for array of length ${arr.length}`);
    }

    const copy = [...arr];
    const [item] = copy.splice(idx, 1);
    return [item, ...copy];
}
