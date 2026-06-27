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
import { DecoratorNames } from './predefines';

// MONITOR / SYNCMONITOR

export function findPathArrayFromMonitorAnnotation(
    annotations: readonly arkts.AnnotationUsage[]
): string[] | undefined {
    const monitorAnno: arkts.AnnotationUsage | undefined = annotations.find((anno: arkts.AnnotationUsage) => {
        return (
            anno.expr &&
            arkts.isIdentifier(anno.expr) &&
            anno.expr.name === DecoratorNames.MONITOR &&
            anno.properties.length === 1
        );
    });
    if (!monitorAnno) {
        return undefined;
    }
    return findPathArrayFromMonitorAnnoProperty(monitorAnno.properties.at(0)!)?.map((pair) => pair[1]);
}

export function findPathArrayFromSyncMonitorAnnotation(
    annotations: readonly arkts.AnnotationUsage[]
): string[] | undefined {
    const syncMonitorAnno: arkts.AnnotationUsage | undefined = annotations.find((anno: arkts.AnnotationUsage) => {
        return (
            anno.expr &&
            arkts.isIdentifier(anno.expr) &&
            anno.expr.name === DecoratorNames.SYNC_MONITOR &&
            anno.properties.length === 1
        );
    });
    if (!syncMonitorAnno) {
        return undefined;
    }
    return findPathArrayFromMonitorAnnoProperty(syncMonitorAnno.properties.at(0)!)?.map((pair) => pair[1]);
}

/**
 * Find the path array from `@Monitor`/`@SyncMonitor`.
 * 
 * @param property Annotation property AstNode
 * @returns an array of path strings, or undefined if not found
 */
export function findPathArrayFromMonitorAnnoProperty(property: arkts.AstNode): [arkts.AstNode, string][] | undefined {
    if (!arkts.isClassProperty(property) || !property.value || !arkts.isArrayExpression(property.value)) {
        return undefined;
    }
    const resArr: [arkts.AstNode, string][] = [];
    property.value.elements.forEach((item: arkts.Expression) => {
        if (arkts.isStringLiteral(item)) {
            resArr.push([item, item.str]);
        } else if (arkts.isMemberExpression(item)) {
            const res: string | undefined = getMonitorStrFromMemberExpr(item);
            !!res && resArr.push([item, res]);
        }
    });
    return resArr;
}

/**
 * Handle Enum input in `@Monitor`/`@SyncMonitor` property.
 * 
 * @param node Enum input AstNode
 * @returns path string
 */
function getMonitorStrFromMemberExpr(node: arkts.MemberExpression): string | undefined {
    const property = node.property;
    if (!property) {
        return undefined;
    }
    const decl: arkts.AstNode | undefined = arkts.getPeerIdentifierDecl(property.peer);
    if (!decl || !arkts.isClassProperty(decl) || !decl.value || !arkts.isETSNewClassInstanceExpression(decl.value)) {
        return undefined;
    }
    const args: readonly arkts.Expression[] = decl.value.arguments;
    if (args.length >= 2 && arkts.isStringLiteral(args[1])) {
        return args[1].str;
    }
    return undefined;
}
