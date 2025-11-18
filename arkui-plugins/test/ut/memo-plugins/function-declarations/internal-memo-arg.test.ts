/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
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

import * as path from 'path';
import { PluginTester } from '../../../utils/plugin-tester';
import { mockBuildConfig, mockProjectConfig } from '../../../utils/artkts-config';
import { getRootPath, MOCK_ENTRY_DIR_PATH } from '../../../utils/path-config';
import { parseDumpSrc } from '../../../utils/parse-string';
import { beforeMemoNoRecheck, memoNoRecheck, recheck } from '../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../utils/shared-types';
import { ProjectConfig } from '../../../../common/plugin-context';

const FUNCTION_DIR_PATH: string = 'memo/functions';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, FUNCTION_DIR_PATH, 'internal-memo-arg.ets'),
];

const projectConfig: ProjectConfig = mockProjectConfig();
projectConfig.frameworkMode = 'frameworkMode';

const pluginTester = new PluginTester('test internal memo argument calls', buildConfig, projectConfig);

const expectedScript: string = `

import { __memo_context_type as __memo_context_type, __memo_id_type as __memo_id_type } from "arkui.incremental.runtime.state";

import { memo as memo } from "arkui.stateManagement.runtime";

import { __memo_context_type as __memo_context_type, __memo_id_type as __memo_id_type } from "arkui.incremental.runtime.state";

import { StateContext as StateContext, IncrementalScope as IncrementalScope } from "arkui.incremental.runtime.state";

function main() {}

export function __context(): __memo_context_type

export function __id(): __memo_id_type

@memo_entry() export function memoEntry<R>(__memo_context: __memo_context_type, __memo_id: __memo_id_type, @Memo() entry: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> R)): R {
  return entry(__memo_context, ((__memo_id) + (75311131)));
}

@memo_entry() export function memoEntry1<T, R>(__memo_context: __memo_context_type, __memo_id: __memo_id_type, @Memo() entry: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, arg: T)=> R), arg: T): R {
  return entry(__memo_context, ((__memo_id) + (168506859)), arg);
}

@memo_entry() export function memoEntry2<T1, T2, R>(__memo_context: __memo_context_type, __memo_id: __memo_id_type, @Memo() entry: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, arg1: T1, arg2: T2)=> R), arg1: T1, arg2: T2): R {
  return entry(__memo_context, ((__memo_id) + (76962895)), arg1, arg2);
}

@memo_intrinsic() export function contextLocalValue<Value>(__memo_context: __memo_context_type, __memo_id: __memo_id_type, name: string): Value {
  return (__memo_context as StateManager).valueBy<Value>(name);
}

@memo_intrinsic() export function contextLocalScope<Value>(__memo_context: __memo_context_type, __memo_id: __memo_id_type, name: string, value: Value, @Memo() content: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)) {
  const scope = __memo_context.scope<undefined>(__memo_id, 1);
  if (scope.unchanged) {
    scope.cached;
  } else {
    content(__memo_context, ((__memo_id) + (2633070)));
    scope.recache();
  }
}

@memo_intrinsic() export function NodeAttach<Node extends IncrementalNode>(__memo_context: __memo_context_type, __memo_id: __memo_id_type, create: (()=> Node), @Memo() update: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, node: Node)=> void), reuseKey?: string): void {
  const scope = (__memo_context as StateManager).scopeEx<undefined>(__memo_id, 0, create, undefined, undefined, undefined, reuseKey);
  if (scope.unchanged) {
    scope.cached;
  } else {
    try {
      if (!reuseKey) {
        update(__memo_context, ((__memo_id) + (6025780)), ((__memo_context as StateManager).node as Node));
      } else {
        memoEntry(__memo_context, 0, ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => {
          const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (31840240)), 0);
          if (__memo_scope.unchanged) {
            __memo_scope.cached;
            return;
          }
          update(__memo_context, ((__memo_id) + (253864074)), ((__memo_context as StateManager).node as Node));
          {
            __memo_scope.recache();
            return;
          }
        }));
      }
    } finally {
      scope.recache();
    }
  }
}

@memo_intrinsic() export function rememberControlledScope(__memo_context: __memo_context_type, __memo_id: __memo_id_type, invalidate: (()=> void)): ControlledScope {
  return (__memo_context as StateManager).controlledScope(__memo_id, invalidate);
}

@Memo() export function Repeat(__memo_context: __memo_context_type, __memo_id: __memo_id_type, count: int, @Memo() action: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, index: int)=> void)) {
  const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (200707415)), 2);
  const __memo_parameter_count = __memo_scope.param(0, count), __memo_parameter_action = __memo_scope.param(1, action);
  if (__memo_scope.unchanged) {
    __memo_scope.cached;
    return;
  }
  for (let i = 0;((i) < (__memo_parameter_count.value));(i++)) {
    memoEntry1<int, void>(__memo_context, i, __memo_parameter_action.value, i);
  }
  {
    __memo_scope.recache();
    return;
  }
}

export declare class IncrementalNode {
  public constructor() {}
}

export declare interface ControlledScope {
}

export declare interface StateManager extends StateContext {
  get node(): (IncrementalNode | undefined)
  valueBy<Value>(name: string, global?: boolean): Value
  scopeEx<Value>(id: int, paramCount?: int, create?: (()=> IncrementalNode), compute?: (()=> Value), cleanup?: ((value: (Value | undefined))=> void), once?: boolean, reuseKey?: string): IncrementalScope<Value>
  controlledScope(id: int, invalidate: (()=> void)): ControlledScope
}

@Retention({policy:"SOURCE"}) @interface memo_intrinsic {}

@Retention({policy:"SOURCE"}) @interface memo_entry {}

export class MemoCallbackContext {
  private readonly context: __memo_context_type;

  private readonly id: __memo_id_type;

  private constructor(context: __memo_context_type, id: __memo_id_type) {
    this.context = context;
    this.id = id;
  }

  @Memo() public static Make(__memo_context: __memo_context_type, __memo_id: __memo_id_type): MemoCallbackContext {
    const __memo_scope = __memo_context.scope<MemoCallbackContext>(((__memo_id) + (41727473)), 0);
    if (__memo_scope.unchanged) {
      return __memo_scope.cached;
    }
    return __memo_scope.recache(new MemoCallbackContext(__memo_context, __memo_id));
  }

}

export class CustomComponent {
  @Memo() public static _instantiateImpl(__memo_context: __memo_context_type, __memo_id: __memo_id_type): void {
    const __memo_scope = __memo_context.scope<undefined>(((__memo_id) + (214802466)), 0);
    if (__memo_scope.unchanged) {
      __memo_scope.cached;
      return;
    }
    const context: StateManager = (__memo_context as StateManager);
    {
      __memo_scope.recache();
      return;
    }
  }

  public constructor() {}

}
`;

function testMemoTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'transform internal __context() and __id() calls in functions',
    [beforeMemoNoRecheck, memoNoRecheck, recheck],
    {
        'checked:memo-no-recheck': [testMemoTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
