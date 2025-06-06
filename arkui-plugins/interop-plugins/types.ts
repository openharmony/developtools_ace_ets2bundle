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

namespace interop {
    export type NativePointer = number;

    export interface PluginContext {
        setArkTSAst(ast: Node): void;
        getArkTSAst(): Node | undefined;
        setArkTSProgram(program: Node): void;
        getArkTSProgram(): Node | undefined;
        setProjectConfig(projectConfig: Node): void;
        getProjectConfig(): Node | undefined;
    }

    export interface ArktsObject {
        readonly peer: NativePointer;
    }

    export interface Node extends ArktsObject {
        get originalPeer(): NativePointer;
        set originalPeer(peer: NativePointer);
        dumpJson(): string;
        dumpSrc(): string;
    }

    export interface EtsScript extends Node {}

    export interface Plugin {
        name: string;
        parsed?(context: PluginContext): EtsScript | undefined;
        checked?(context: PluginContext): EtsScript | undefined;
    }

    export type TransfromerName = string & { __TransfromerNameBrand: any };

    export interface EmitTransformerOptions {
        arkui: TransfromerName;
    }

    export interface DeclTransformerOptions {
        arkui: TransfromerName;
    }
}
