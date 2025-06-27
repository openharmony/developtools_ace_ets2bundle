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
import {
    addMemoAnnotation,
    collectMemoFromCallExpression,
    findCanAddMemoFromArrowFunction,
    findCanAddMemoFromClassProperty,
    findCanAddMemoFromMethod,
    findCanAddMemoFromParameter,
    findCanAddMemoFromProperty,
    findCanAddMemoFromTypeAlias,
} from './utils';

export function findAndCollectMemoableNode(node: arkts.AstNode): arkts.AstNode {
    const type = arkts.nodeType(node);
    if (collectByType.has(type)) {
        return collectByType.get(type)!(node);
    }
    return node;
}

export class factory {
    static findAndCollectMemoableProperty(node: arkts.Property): arkts.Property {
        if (findCanAddMemoFromProperty(node)) {
            addMemoAnnotation(node.value! as arkts.ArrowFunctionExpression);
        }
        return node;
    }

    static findAndCollectMemoableClassProperty(node: arkts.ClassProperty): arkts.ClassProperty {
        if (findCanAddMemoFromClassProperty(node)) {
            addMemoAnnotation(node);
        }
        return node;
    }

    static findAndCollectMemoableTypeAlias(node: arkts.TSTypeAliasDeclaration): arkts.TSTypeAliasDeclaration {
        if (findCanAddMemoFromTypeAlias(node)) {
            addMemoAnnotation(node);
        }
        return node;
    }

    static findAndCollectMemoableParameter(node: arkts.ETSParameterExpression): arkts.ETSParameterExpression {
        if (findCanAddMemoFromParameter(node)) {
            addMemoAnnotation(node);
        }
        return node;
    }

    static findAndCollectMemoableMethod(node: arkts.MethodDefinition): arkts.MethodDefinition {
        if (findCanAddMemoFromMethod(node)) {
            addMemoAnnotation(node.scriptFunction);
        }
        return node;
    }

    static findAndCollectMemoableArrowFunction(node: arkts.ArrowFunctionExpression): arkts.ArrowFunctionExpression {
        if (findCanAddMemoFromArrowFunction(node)) {
            addMemoAnnotation(node.scriptFunction);
        }
        return node;
    }

    static findAndCollectMemoableCallExpression(node: arkts.CallExpression): arkts.CallExpression {
        collectMemoFromCallExpression(node);
        return node;
    }
}

type CollectFactoryFn = (node: any) => arkts.AstNode;

const collectByType = new Map<arkts.Es2pandaAstNodeType, CollectFactoryFn>([
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_PROPERTY, factory.findAndCollectMemoableProperty],
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_CLASS_PROPERTY, factory.findAndCollectMemoableClassProperty],
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_TS_TYPE_ALIAS_DECLARATION, factory.findAndCollectMemoableTypeAlias],
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ETS_PARAMETER_EXPRESSION, factory.findAndCollectMemoableParameter],
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_METHOD_DEFINITION, factory.findAndCollectMemoableMethod],
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ARROW_FUNCTION_EXPRESSION, factory.findAndCollectMemoableArrowFunction],
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_CALL_EXPRESSION, factory.findAndCollectMemoableCallExpression],
]);
