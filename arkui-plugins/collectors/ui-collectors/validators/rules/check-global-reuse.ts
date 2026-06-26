 /*
* Copyright (c) 2026 Huawei Device Co., Ltd.
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
import { BaseValidator } from '../base';
import { CustomComponentInfo } from '../../records';
import { GlobalReusePoolNames, LogType, StructDecoratorNames } from '../../../../common/predefines';
import { getPerfName, performanceLog } from '../../../../common/debug';

const REUSABLE_DECORATOR_NAMES: Set<string> = new Set([
    StructDecoratorNames.RESUABLE,
    StructDecoratorNames.RESUABLE_V2,
]);

export const checkGlobalReuse = performanceLog(
    _checkGlobalReuse,
    getPerfName([0, 0, 0, 0, 0], 'checkGlobalReuse')
);

function _checkGlobalReuse(
    this: BaseValidator<arkts.ClassDeclaration, CustomComponentInfo>,
    node: arkts.ClassDeclaration
): void {
    const metadata = this.context ?? {};
    const componentAnno = metadata.annotations?.[StructDecoratorNames.COMPONENT] ??
        metadata.annotations?.[StructDecoratorNames.COMPONENT_V2];
    if (!componentAnno) {
        return;
    }
    const poolAcceptsValue = getPoolAcceptsValue(componentAnno);
    if (!poolAcceptsValue) {
        return;
    }
    if (poolAcceptsValue.elements.length === 0) {
        return;
    }
    const structName = metadata.name;
    if (!structName) {
        return;
    }
    checkPoolAcceptsNotSelf.bind(this)(componentAnno, poolAcceptsValue, structName);
    checkPoolAcceptsResolvesToStruct.bind(this)(componentAnno, node, poolAcceptsValue, structName);
}

function getPropertyInAnnotation(annotation: arkts.AnnotationUsage, propertyName: string): arkts.AstNode | undefined {
    return annotation.properties.find(
        (annoProp: arkts.AstNode) =>
            arkts.isClassProperty(annoProp) &&
            annoProp.key &&
            arkts.isIdentifier(annoProp.key) &&
            annoProp.key.name === propertyName
    );
}

function getPoolAcceptsValue(
    componentAnno: arkts.AnnotationUsage
): arkts.ArrayExpression | undefined {
    const prop = getPropertyInAnnotation(componentAnno, GlobalReusePoolNames.POOL_ACCEPTS);
    if (!prop || !arkts.isClassProperty(prop) || !prop.value || !arkts.isArrayExpression(prop.value)) {
        return undefined;
    }
    return prop.value;
}

// poolAccepts cannot contain the current struct name
function checkPoolAcceptsNotSelf(
    this: BaseValidator<arkts.ClassDeclaration, CustomComponentInfo>,
    componentAnno: arkts.AnnotationUsage,
    poolAcceptsValue: arkts.ArrayExpression,
    structName: string
): void {
    for (const elem of poolAcceptsValue.elements) {
        if (arkts.isStringLiteral(elem) && elem.str === structName) {
            this.report({
                node: componentAnno,
                level: LogType.ERROR,
                message: `'${structName}' cannot list itself in poolAccepts. The pool is not yet ready when '${structName}' is being constructed`,
            });
        }
    }
}

function getETSModule(node: arkts.AstNode): arkts.ETSModule | undefined {
    const program = arkts.getProgramFromAstNode(node);
    const astNode = program?.ast;
    if (astNode && arkts.isETSModule(astNode)) {
        return astNode;
    }
    return undefined;
}

function collectSameFileStructNames(script: arkts.ETSModule): Set<string> {
    const names = new Set<string>();
    for (const stmt of script.statements) {
        if (arkts.isClassDeclaration(stmt) && stmt.definition?.ident) {
            names.add(stmt.definition.ident.name);
        }
    }
    return names;
}

function resolveImportedStructDecl(
    script: arkts.ETSModule,
    targetName: string
): arkts.ClassDefinition | undefined {
    for (const stmt of script.statements) {
        if (!arkts.isImportDeclaration(stmt) || !stmt.specifiers) {
            continue;
        }
        for (const spec of stmt.specifiers) {
            if (!arkts.isImportSpecifier(spec) || !spec.local || !arkts.isIdentifier(spec.local)) {
                continue;
            }
            if (spec.local.name !== targetName) {
                continue;
            }
            const decl = arkts.getPeerIdentifierDecl(spec.local.peer);
            if (decl && arkts.isClassDefinition(decl)) {
                return decl;
            }
        }
    }
    return undefined;
}

function resolveStructDecl(
    script: arkts.ETSModule,
    sameFileStructs: Set<string>,
    targetName: string
): arkts.ClassDefinition | undefined {
    if (sameFileStructs.has(targetName)) {
        for (const stmt of script.statements) {
            if (arkts.isClassDeclaration(stmt) && stmt.definition?.ident && stmt.definition.ident.name === targetName) {
                return stmt.definition;
            }
        }
    }
    return resolveImportedStructDecl(script, targetName);
}

// each name in poolAccepts must resolve to a struct decorated with @Reusable or @ReusableV2
function checkPoolAcceptsResolvesToStruct(
    this: BaseValidator<arkts.ClassDeclaration, CustomComponentInfo>,
    componentAnno: arkts.AnnotationUsage,
    node: arkts.ClassDeclaration,
    poolAcceptsValue: arkts.ArrayExpression,
    structName: string
): void {
    const script = getETSModule(node);
    if (!script) {
        return;
    }
    const sameFileStructs = collectSameFileStructNames(script);
    for (const elem of poolAcceptsValue.elements) {
        if (!arkts.isStringLiteral(elem)) {
            continue;
        }
        const name = elem.str;
        if (name === structName) {
            continue;
        }
        const resolvedDecl = resolveStructDecl(script, sameFileStructs, name);
        if (!resolvedDecl || !hasReusableAnnotation(resolvedDecl)) {
            this.report({
                node: componentAnno,
                level: LogType.ERROR,
                message: `'${name}' is not a '@Reusable' or '@ReusableV2' component and cannot be added to 'poolAccepts'.`,
            });
        }
    }
}

function hasReusableAnnotation(classDef: arkts.ClassDefinition): boolean {
    const annotations = classDef.annotations ?? [];
    return annotations.some(anno => {
        if (!anno.expr || !arkts.isIdentifier(anno.expr)) {
            return false;
        }
        return REUSABLE_DECORATOR_NAMES.has(anno.expr.name);
    });
}
