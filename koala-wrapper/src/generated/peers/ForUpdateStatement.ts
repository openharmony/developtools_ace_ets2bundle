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

import {
    global,
    passNode,
    unpackNode,
    assertValidPeer,
    AstNode,
    KNativePointer,
    nodeByType,
    Es2pandaAstNodeType,
} from '../../reexport-for-generated';
import { Expression } from './Expression';
import { LoopStatement } from './LoopStatement';
import { Statement } from './Statement';

export class ForUpdateStatement extends LoopStatement {
    constructor(pointer: KNativePointer) {
        assertValidPeer(pointer, Es2pandaAstNodeType.AST_NODE_TYPE_FOR_UPDATE_STATEMENT);
        super(pointer);
    }
    static createForUpdateStatement(
        init?: AstNode,
        test?: Expression,
        update?: Expression,
        body?: Statement
    ): ForUpdateStatement {
        return new ForUpdateStatement(
            global.generatedEs2panda._CreateForUpdateStatement(
                global.context,
                passNode(init),
                passNode(test),
                passNode(update),
                passNode(body)
            )
        );
    }

    static updateForUpdateStatement(
        original: ForUpdateStatement,
        init?: AstNode,
        test?: Expression,
        update?: Expression,
        body?: Statement
    ): ForUpdateStatement {
        return new ForUpdateStatement(
            global.generatedEs2panda._UpdateForUpdateStatement(
                global.context,
                passNode(original),
                passNode(init),
                passNode(test),
                passNode(update),
                passNode(body)
            )
        );
    }

    get init(): AstNode | undefined {
        return unpackNode(global.generatedEs2panda._ForUpdateStatementInit(global.context, this.peer));
    }
    get test(): Expression | undefined {
        return unpackNode(global.generatedEs2panda._ForUpdateStatementTest(global.context, this.peer));
    }
    get update(): Expression | undefined {
        return unpackNode(global.generatedEs2panda._ForUpdateStatementUpdateConst(global.context, this.peer));
    }
    get body(): Statement | undefined {
        return unpackNode(global.generatedEs2panda._ForUpdateStatementBody(global.context, this.peer));
    }
    protected readonly brandForUpdateStatement: undefined;
}

export function isForUpdateStatement(node: object | undefined): node is ForUpdateStatement {
    return node instanceof ForUpdateStatement;
}

if (!nodeByType.has(Es2pandaAstNodeType.AST_NODE_TYPE_FOR_UPDATE_STATEMENT)) {
    nodeByType.set(Es2pandaAstNodeType.AST_NODE_TYPE_FOR_UPDATE_STATEMENT, ForUpdateStatement);
}
