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

export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

type PartialArray<T> = T extends readonly any[] | any[] ? T | undefined : T;
type PartialAstNode<T> = T extends arkts.AstNode ? T | undefined : T;
type PartialObject<T> = T extends object ? { [P in keyof T]?: T[P] } : T;
type PartialPrimitive<T> = T;

export type PartialNested<T> = {
    [P in keyof T]?: T[P] extends readonly any[] | any[]
        ? PartialArray<T[P]>
        : T[P] extends arkts.AstNode
        ? PartialAstNode<T[P]>
        : T[P] extends object
        ? PartialObject<T[P]>
        : PartialPrimitive<T[P]>;
};

type NestedKey<T, K extends string | number | symbol> = {
    [P in keyof T]: P extends K ? T[P] : T[P] extends object ? NestedKey<T[P], K> : T[P];
  };

export type PickNested<T, K extends keyof T> = {
    [P in keyof T]: P extends K ? T[P] : T[P] extends object ? NestedKey<T[P], K> : T[P];
};

export type PartialNestedExcept<T, K extends keyof T> = PartialNested<Omit<T, K>> & PickNested<T, K>;

export type AstNodePointer = arkts.AstNode['peer'];