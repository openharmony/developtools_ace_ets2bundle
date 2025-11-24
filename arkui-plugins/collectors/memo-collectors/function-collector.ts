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
import { AbstractVisitor } from '../../common/abstract-visitor';
import { NodeCacheNames } from '../../common/predefines';
import {
    checkIsMemoFromMemoableInfo,
    collectMemoableInfoInFunctionReturnType,
    collectMemoableInfoInScriptFunction,
    collectMemoableInfoInVariableDeclarator,
    collectMemoableInfoMapInFunctionParams,
    collectMemoScriptFunctionBody,
    collectScriptFunctionReturnTypeFromInfo,
    findIdentifierFromCallee,
    getDeclResolveAlias,
    MemoableInfo,
} from './utils';

export class MemoFunctionCollector extends AbstractVisitor {
    private returnMemoableInfo: MemoableInfo | undefined;
    private paramMemoableInfoMap: Map<arkts.AstNode['peer'], MemoableInfo> | undefined;
    private _disableCollectReturn: boolean = false;
    private _shouldCollectReturn: boolean = true;

    private get shouldCollectReturn(): boolean {
        if (this._disableCollectReturn) {
            return false;
        }
        return this._shouldCollectReturn;
    }

    private set shouldCollectReturn(newValue: boolean) {
        if (this._disableCollectReturn) {
            return;
        }
        this._shouldCollectReturn = newValue;
    }

    private disableCollectReturnBeforeCallback(callbackFn: () => void): void {
        const tempValue = this.shouldCollectReturn;
        this.shouldCollectReturn = false;
        callbackFn();
        this.shouldCollectReturn = tempValue;
    }

    private collectMemoAstNode(node: arkts.AstNode, info: MemoableInfo): void {
        if (checkIsMemoFromMemoableInfo(info, false)) {
            arkts.NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).collect(node);
        }
    }

    private collectCallWithDeclaredPeerInParamMap(node: arkts.CallExpression, peer: arkts.AstNode['peer']): void {
        const memoableInfo = this.paramMemoableInfoMap!.get(peer)!;
        if (checkIsMemoFromMemoableInfo(memoableInfo, true)) {
            arkts.NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).collect(node);
        }
    }

    private collectCallWithDeclaredIdInVariableDeclarator(
        node: arkts.CallExpression,
        declarator: arkts.VariableDeclarator
    ): void {
        const shouldCollect =
            arkts.NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).has(declarator) ||
            (!!declarator.initializer &&
                arkts.NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).has(declarator.initializer));
        if (shouldCollect) {
            arkts.NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).collect(node);
        }
    }

    private visitVariableDeclarator(node: arkts.VariableDeclarator): arkts.AstNode {
        let memoableInfo: MemoableInfo;
        if (this.paramMemoableInfoMap?.has(node.name.peer)) {
            memoableInfo = this.paramMemoableInfoMap.get(node.name.peer)!;
        } else {
            memoableInfo = collectMemoableInfoInVariableDeclarator(node);
        }
        this.collectMemoAstNode(node, memoableInfo);
        if (!node.initializer) {
            return node;
        }
        if (arkts.isArrowFunctionExpression(node.initializer)) {
            const func = node.initializer.scriptFunction;
            const localInfo = collectMemoableInfoInScriptFunction(func);
            const hasMemo =
                checkIsMemoFromMemoableInfo(memoableInfo, false) || localInfo.hasBuilder || localInfo.hasMemo;
            const shouldCollectParameter = hasMemo && !localInfo.hasMemoEntry && !localInfo.hasMemoIntrinsic;
            const shouldCollectReturn = hasMemo;
            const returnMemoableInfo = collectMemoableInfoInFunctionReturnType(func);
            collectScriptFunctionReturnTypeFromInfo(func, returnMemoableInfo);
            const [paramMemoableInfoMap, gensymCount] = collectMemoableInfoMapInFunctionParams(
                func,
                !!shouldCollectParameter
            );
            const body = func.body;
            if (!!body && arkts.isBlockStatement(body)) {
                collectMemoScriptFunctionBody(
                    body,
                    returnMemoableInfo,
                    paramMemoableInfoMap,
                    gensymCount,
                    !shouldCollectReturn
                );
            }
            return node;
        }
        this.shouldCollectReturn = !!memoableInfo.hasMemo || !!memoableInfo.hasBuilder;
        this.visitor(node.initializer);
        return node;
    }

    private visitCallExpression(node: arkts.CallExpression): arkts.AstNode {
        if (arkts.NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).has(node)) {
            this.disableCollectReturnBeforeCallback(() => {
                this.visitEachChild(node);
            });
            return node;
        }
        const expr = findIdentifierFromCallee(node.expression);
        const decl = (expr && getDeclResolveAlias(expr)) ?? node.expression;
        if (!decl) {
            this.disableCollectReturnBeforeCallback(() => {
                this.visitEachChild(node);
            });
            return node;
        }
        if (arkts.NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).has(decl)) {
            arkts.NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).collect(node);
        }
        if (this.paramMemoableInfoMap?.has(decl.peer)) {
            this.collectCallWithDeclaredPeerInParamMap(node, decl.peer);
        } else if (arkts.isEtsParameterExpression(decl) && this.paramMemoableInfoMap?.has(decl.identifier.peer)) {
            this.collectCallWithDeclaredPeerInParamMap(node, decl.identifier.peer);
        } else if (arkts.isIdentifier(decl) && !!decl.parent && arkts.isVariableDeclarator(decl.parent)) {
            this.collectCallWithDeclaredIdInVariableDeclarator(node, decl.parent);
        }
        this.disableCollectReturnBeforeCallback(() => {
            this.visitEachChild(node);
        });
        return node;
    }

    private visitIdentifier(node: arkts.Identifier): arkts.AstNode {
        const decl = getDeclResolveAlias(node);
        if (!decl) {
            return node;
        }
        let memoableInfo: MemoableInfo | undefined;
        if (this.paramMemoableInfoMap?.has(decl.peer)) {
            memoableInfo = this.paramMemoableInfoMap.get(decl.peer);
        } else if (arkts.isEtsParameterExpression(decl) && this.paramMemoableInfoMap?.has(decl.identifier.peer)) {
            memoableInfo = this.paramMemoableInfoMap.get(decl.identifier.peer);
        }
        if (!!memoableInfo) {
            arkts.NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).collect(node);
        }
        return node;
    }

    private visitReturnStatement(node: arkts.ReturnStatement): arkts.AstNode {
        if (!!this.returnMemoableInfo && !!node.argument && arkts.isArrowFunctionExpression(node.argument)) {
            this.collectMemoAstNode(node.argument, this.returnMemoableInfo);
        }
        arkts.NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).collect(node);
        this.visitEachChild(node);
        return node;
    }

    registerReturnInfo(info: MemoableInfo): this {
        this.returnMemoableInfo = info;
        return this;
    }

    registerParamInfoMap(infoMap: Map<arkts.AstNode['peer'], MemoableInfo>): this {
        this.paramMemoableInfoMap = infoMap;
        return this;
    }

    disableCollectReturn(): this {
        this._disableCollectReturn = true;
        return this;
    }

    enableCollectReturn(): this {
        this._disableCollectReturn = false;
        return this;
    }

    reset(): void {
        this.returnMemoableInfo = undefined;
        this.paramMemoableInfoMap = undefined;
        this._shouldCollectReturn = true;
        this._disableCollectReturn = false;
    }

    visitor(node: arkts.AstNode): arkts.AstNode {
        if (arkts.isVariableDeclarator(node)) {
            return this.visitVariableDeclarator(node);
        }
        if (arkts.isCallExpression(node)) {
            return this.visitCallExpression(node);
        }
        if (!!this.paramMemoableInfoMap && arkts.isIdentifier(node)) {
            return this.visitIdentifier(node);
        }
        if (arkts.isReturnStatement(node) && this.shouldCollectReturn) {
            return this.visitReturnStatement(node);
        }
        if (
            arkts.isArrowFunctionExpression(node) &&
            !arkts.NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).has(node) &&
            !arkts.NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).has(node.scriptFunction)
        ) {
            this.shouldCollectReturn = false;
        }
        return this.visitEachChild(node);
    }
}
