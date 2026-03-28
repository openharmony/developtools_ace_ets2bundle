/*
 * Copyright (c) 2024 Huawei Device Co., Ltd.
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

import { ArktsObject } from './ArktsObject';
import { compiler, Program } from '../../../generated';
import { global } from '../static/global';
import { KNativePointer, nullptr, KBoolean } from '@koalaui/interop';
import { Config } from './Config';
import { filterSource } from '../../utils';
import { AstNode } from './AstNode';

// Perhaps, this file would become generated some time later
// Please, do not add hard logic here

export class Context extends ArktsObject {
    constructor(peer: KNativePointer) {
        super(peer);
    }

    static createFromString(source: string): Context {
        return compiler.createContextFromString(global.configObj, source, global.filePath);
    }

    static createCacheContextFromFile(
        configPtr: KNativePointer,
        fileName: string,
        globalContextPtr: KNativePointer,
        isExternal: KBoolean
    ): Context {
        return compiler.createCacheContextFromFile(new Config(configPtr), fileName, new GlobalContext(globalContextPtr), isExternal);
    }

    static createFromFile(filePath: string): Context {
        return compiler.createContextFromFile(global.configObj, filePath);
    }

    static createCacheFromFile(filePath: string, config: Config, globalContext: GlobalContext, isExternal: boolean): Context {
        return compiler.createCacheContextFromFile(config, filePath, globalContext, isExternal);
    }

    // NOTE: this API is deprecated
    static createContextGenerateAbcForExternalSourceFiles(filenames: string[]): Context {
        return this.createContextSimultaneousMode(filenames);
    }

    static createContextSimultaneousMode(filenames: string[]): Context {
        return compiler.createContextSimultaneousMode(global.configObj, filenames);
    }

    static createFromStringWithHistory(source: string): Context {
        return compiler.createContextFromStringWithHistory(global.configObj, source, global.filePath);
    }

    destroy(): void {
        compiler.destroyContext();
    }

    /** @deprecated */
    static destroyAndRecreate(ast: AstNode): Context {
        console.log('[TS WRAPPER] DESTROY AND RECREATE');
        const source = filterSource(ast.dumpSrc());
        compiler.destroyContext();
        return global.compilerContext = Context.createFromString(source);
    }

    get program(): Program {
        return compiler.contextProgram();
    }
}

export class GlobalContext extends ArktsObject {
    constructor(peer: KNativePointer) {
        super(peer);
    }

    static create(config: Config, externalFileList: string[]): GlobalContext {
        return compiler.createGlobalContext(config, externalFileList, false);
    }

    destroy() {
        compiler.destroyGlobalContext();
    }
}
