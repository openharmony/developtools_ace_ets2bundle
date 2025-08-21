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
import { DeclarationCollector } from './declaration-collector';
import { ARKUI_IMPORT_PREFIX_NAMES, DecoratorNames } from './predefines';
import * as fs from 'fs';

export function coerceToAstNode<T extends arkts.AstNode>(node: arkts.AstNode): T {
    return node as T;
}

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

export function isNumeric(str: string): boolean {
    return /^\d+$/.test(str);
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

export function isDecoratorAnnotation(
    anno: arkts.AnnotationUsage,
    decoratorName: DecoratorNames,
    ignoreDecl?: boolean
): boolean {
    if (!(!!anno.expr && arkts.isIdentifier(anno.expr) && anno.expr.name === decoratorName)) {
        return false;
    }
    if (!ignoreDecl) {
        const decl = arkts.getDecl(anno.expr);
        if (!decl) {
            return false;
        }
        const moduleName: string = arkts.getProgramFromAstNode(decl).moduleName;
        if (!moduleName || !matchPrefix(ARKUI_IMPORT_PREFIX_NAMES, moduleName)) {
            return false;
        }
        DeclarationCollector.getInstance().collect(decl);
    }
    return true;
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

/**
 * Performs the specified action for each argument in a `arkts.CallExpression`'s arguments array 
 * paired with corresponding parameter from the function declaration node.  
 * 
 * @param args An arguments array from a `arkts.CallExpression` node.
 * @param params A parameters array from a function declaration node.
 * @param callbackFn A function that accepts up to three arguments. forEach calls the callbackfn function one time for each element in the array.
 * @param options Additional options field that accepts special conditions of calls and function, used for pairing arguments with parameters.
 */
export function forEachArgWithParam(
    args: readonly arkts.Expression[],
    params: readonly arkts.Expression[],
    callbackFn: (arg: arkts.Expression | undefined, param: arkts.Expression, index?: number) => void,
    options?: { isTrailingCall?: boolean; hasReceiver?: boolean; hasRestParameter?: boolean }
): void {
    const argLen: number = args.length;
    const paramLen: number = params.length;
    if (argLen === 0 || paramLen === 0) {
        return;
    }
    const hasRestParam: boolean = !!options?.hasRestParameter;
    const isTrailingCall: boolean = !!options?.isTrailingCall;
    const maxLen = hasRestParam ? argLen : paramLen;
    let index: number = 0;
    while (index < maxLen - 1) {
        const param = params.at(index) ?? params.at(paramLen - 1)!;
        const argument = isTrailingCall && index >= argLen - 1 ? undefined : args.at(index);
        callbackFn(argument, param, index);
        index++;
    }
    const lastParam = params.at(paramLen - 1)!;
    const lastIndex = isTrailingCall ? argLen - 1 : maxLen - 1;
    const lastArg = args.at(lastIndex);
    callbackFn(lastArg, lastParam, maxLen - 1);
}

export function toUnixPath(path: string): string {
    return path.replace(/\\/g, '/');
}

export function readFirstLineSync(filePath: string): string | null {
    const fd = fs.openSync(filePath, 'r');
    const buffer = Buffer.alloc(256);
    const bytesRead = fs.readSync(fd, buffer, 0, buffer.length, 0);
    fs.closeSync(fd);

    const content = buffer.toString('utf-8', 0, bytesRead);
    const firstLine = content.split(/\r?\n/, 1)[0].trim();

    return firstLine;
}