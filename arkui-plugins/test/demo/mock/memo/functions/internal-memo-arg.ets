/*
 * Copyright (C) 2025 Huawei Device Co., Ltd.
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

import { Memo} from "arkui.incremental.annotation";
import { __memo_context_type, __memo_id_type } from "arkui.incremental.runtime.state";
import { StateContext, IncrementalScope } from "arkui.incremental.runtime.state";

export declare class IncrementalNode { }
export declare interface ControlledScope { }
export declare interface StateManager extends StateContext { 
  readonly node: IncrementalNode | undefined;
  valueBy<Value>(name: string, global?: boolean): Value;
  scopeEx<Value>(
    id: int,
    paramCount?: int,
    create?: () => IncrementalNode,
    compute?: () => Value,
    cleanup?: (value: Value | undefined) => void,
    once?: boolean,
    reuseKey?: string
  ): IncrementalScope<Value>;
  controlledScope(id: int, invalidate: () => void): ControlledScope;
}

@Retention({policy:"SOURCE"}) @interface memo_intrinsic {}
@Retention({policy:"SOURCE"}) @interface memo_entry {}

export declare function __context(): __memo_context_type
export declare function __id(): __memo_id_type

@memo_entry() export function memoEntry<R>(__memo_context: __memo_context_type, __memo_id: __memo_id_type, @Memo() entry: (()=> R)): R {
  return entry();
}

@memo_entry() export function memoEntry1<T, R>(__memo_context: __memo_context_type, __memo_id: __memo_id_type, @Memo() entry: ((arg: T)=> R), arg: T): R {
  return entry(arg);
}

@memo_entry() export function memoEntry2<T1, T2, R>(__memo_context: __memo_context_type, __memo_id: __memo_id_type, @Memo() entry: ((arg1: T1, arg2: T2)=> R), arg1: T1, arg2: T2): R {
  return entry(arg1, arg2);
}

export class MemoCallbackContext {
  private readonly context: __memo_context_type;
  
  private readonly id: __memo_id_type;
  
  private constructor(context: __memo_context_type, id: __memo_id_type) {
    this.context = context;
    this.id = id;
  }
  
  @Memo() public static Make(): MemoCallbackContext {
    return new MemoCallbackContext(__context(), __id());
  }  
}

@memo_intrinsic() export function contextLocalValue<Value>(name: string): Value {
  return (__context() as StateManager).valueBy<Value>(name);
}

@memo_intrinsic() export function contextLocalScope<Value>(name: string, value: Value, @Memo() content: (()=> void)) {
  const scope = __context().scope<undefined>(__id(), 1);
  scope.param<Value>(0, value);
  if (scope.unchanged) {
    scope.cached;
  } else {
    content();
    scope.recache();
  }
}

@memo_intrinsic() export function NodeAttach<Node extends IncrementalNode>(create: (()=> Node), @Memo() update: ((node: Node)=> void), reuseKey?: string): void {
  const scope = (__context() as StateManager).scopeEx<undefined>(__id(), 0, create, undefined, undefined, undefined, reuseKey);
  if (scope.unchanged) {
    scope.cached;
  } else {
    try {
      if (!reuseKey) {
        update(((__context() as StateManager).node as Node))
      } else {
        memoEntry(__context(), 0, (() => {
          update(((__context() as StateManager).node as Node));
        }))
      }
    } finally {
      scope.recache();
    }
  }
}

@memo_intrinsic() export function rememberControlledScope(invalidate: (()=> void)): ControlledScope {
  return (__context() as StateManager).controlledScope(__id(), invalidate);
}

@Memo() export function Repeat(count: int, @Memo() action: ((index: int)=> void)) {
  for (let i = 0;((i) < (count));(i++)) {
    memoEntry1<int, void>(__context(), i, action, i);
  }
}

export class CustomComponent {
  @Memo() public static _instantiateImpl(): void {
    const context: StateManager = (__context() as StateManager);
  }
}
