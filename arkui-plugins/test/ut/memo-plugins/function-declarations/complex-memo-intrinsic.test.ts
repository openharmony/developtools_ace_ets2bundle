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
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, FUNCTION_DIR_PATH, 'complex-memo-intrinsic.ets'),
];

const projectConfig: ProjectConfig = mockProjectConfig();
projectConfig.frameworkMode = 'frameworkMode';

const pluginTester = new PluginTester('test complex memo intrinsic function', buildConfig, projectConfig);

const expectedScript: string = `

import { __memo_context_type as __memo_context_type, __memo_id_type as __memo_id_type } from "arkui.stateManagement.runtime";

import { memo as memo } from "arkui.stateManagement.runtime";

function main() {}


@memo_intrinsic() export function factory<Value>(__memo_context: __memo_context_type, __memo_id: __memo_id_type, compute: (()=> Value)): Value

export function cb(callback?: (()=> void)) {
  if (callback) {
    return;
  }
}

@memo_intrinsic() export function impl<T>(__memo_context: __memo_context_type, __memo_id: __memo_id_type, @memo() style: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type, attributes: IA<T>)=> void) | undefined), arr: SimpleArray<T>, gensym%%_1?: string): void {
  let err: string = (((gensym%%_1) !== (undefined)) ? gensym%%_1 : ("error message" as string));
  const s = factory(__memo_context, ((__memo_id) + (90010973)), (() => {
    return new A<T>();
  }));
  s.aaa(arr.length);
  ({let gensym%%_68 = style;
  (((gensym%%_68) == (null)) ? undefined : gensym%%_68(__memo_context, ((__memo_id) + (222201816)), s))});
  if (!(s.bbb.get("some_key"))) {
    throw new Error(err);
  }
  if (s.ccc) {
    cb((() => {
      return s.ddd.forEach(((s: number, t: string) => {
        console.log(err);
        return;
      }));
    }));
  } else {
    return;
  }
}

@Retention({policy:"SOURCE"}) @interface memo_intrinsic {}

interface IA<T> {
  set ccc(ccc: boolean)
  
  get ccc(): boolean
  
}

class A<T>  implements IA<T> {
  public bbb: Map<string, boolean> = new Map<string, boolean>();
  
  public ddd: Map<string, number> = new Map<string, number>();
  
  public aaa(value: number): void {}
  
  public constructor() {}
  
  private _$property$_ccc: boolean = false;
  
  set ccc(_$property$_ccc: boolean) {
    this._$property$_ccc = _$property$_ccc;
    return;
  }
  
  public get ccc(): boolean {
    return this._$property$_ccc;
  }
  
}

export type SimpleArray<T> = (Array<T> | ReadonlyArray<T> | Readonly<Array<T>>);

class Use {
  @memo() public test(__memo_context: __memo_context_type, __memo_id: __memo_id_type) {
    const __memo_scope = __memo_context.scope<void>(((__memo_id) + (228150357)), 0);
    if (__memo_scope.unchanged) {
      __memo_scope.cached;
      return;
    }
    const style = @memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, attributes: IA<number>) => {
      const __memo_scope = __memo_context.scope<void>(((__memo_id) + (237001330)), 1);
      const __memo_parameter_attributes = __memo_scope.param(0, attributes);
      if (__memo_scope.unchanged) {
        __memo_scope.cached;
        return;
      }
      {
        __memo_scope.recache();
        return;
      }
    });
    const arr = [1, 2, 3, 4];
    impl(__memo_context, ((__memo_id) + (158199735)), style, arr);
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
    'transform complex @memo_intrinsic calls in functions',
    [beforeMemoNoRecheck, memoNoRecheck, recheck],
    {
        'checked:memo-no-recheck': [testMemoTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
