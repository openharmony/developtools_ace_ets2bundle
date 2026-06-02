/*
 * Copyright (c) 2026 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
export declare namespace Scalar {
  type BLOCK_FOLDED = 'BLOCK_FOLDED';
  type BLOCK_LITERAL = 'BLOCK_LITERAL';
  type PLAIN = 'PLAIN';
  type QUOTE_DOUBLE = 'QUOTE_DOUBLE';
  type QUOTE_SINGLE = 'QUOTE_SINGLE';
  type Type = BLOCK_FOLDED | BLOCK_LITERAL | PLAIN | QUOTE_DOUBLE | QUOTE_SINGLE;
}

export declare class Scalar<T = ESObject> {
  static readonly BLOCK_FOLDED: string;
  static readonly BLOCK_LITERAL: string;
  static readonly PLAIN: string;
  static readonly QUOTE_DOUBLE: string;
  static readonly QUOTE_SINGLE: string;
  value: T;
  type?: Scalar.Type;
}
