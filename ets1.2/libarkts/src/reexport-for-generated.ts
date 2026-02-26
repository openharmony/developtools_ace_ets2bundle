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
export { KNativePointer } from '@koalaui/interop';
export { ArktsObject, isSameNativeObject } from './arkts-api/peers/ArktsObject';
export { AstNode } from './arkts-api/peers/AstNode';
export { Config } from './arkts-api/peers/Config';
export { Context, GlobalContext } from './arkts-api/peers/Context';
export { NodeCache } from './arkts-api/node-cache';
export { ExternalSource } from './arkts-api/peers/ExternalSource';
export {
    passNode,
    unpackNonNullableNode,
    unpackNodeArray,
    passNodeArray,
    passStringArray,
    unpackNode,
    unpackString,
    updateNodeByNode,
    unpackNativeObjectArray,
} from './arkts-api/utilities/private';
export { nodeByType } from './arkts-api/class-by-peer';
export { global } from './arkts-api/static/global';
export { Es2pandaMemberExpressionKind } from '../generated/Es2pandaEnums';
export * from './arkts-api/utilities/extensions';
