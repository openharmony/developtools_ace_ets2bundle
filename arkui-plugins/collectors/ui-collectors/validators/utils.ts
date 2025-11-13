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
import { getAnnotationName } from '../utils';

export function isAnnotatedProperty(node: arkts.AstNode, annotationName: string, ignoreDecl: boolean = false): node is arkts.ClassProperty {
    if (!arkts.isClassProperty(node)) {
        return false;
    }
    return !!getAnnotationByName(node.annotations, annotationName, ignoreDecl);
}

export function getAnnotationByName(
    annotations: readonly arkts.AnnotationUsage[],
    name: string,
    ignoreDecl: boolean = false
): arkts.AnnotationUsage | undefined {
    return annotations.find((annotation: arkts.AnnotationUsage): boolean => {
        return getAnnotationName(annotation, ignoreDecl) === name;
    });
}

export function coerceToAstNode<T extends arkts.AstNode>(node: arkts.AstNode): T {
    return node as T;
}
