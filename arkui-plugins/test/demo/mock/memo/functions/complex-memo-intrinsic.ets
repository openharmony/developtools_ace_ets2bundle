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

import { Memo } from 'arkui.incremental.annotation';
@Retention({policy:"SOURCE"}) @interface memo_intrinsic {}

interface IA<T> {
  ccc: boolean;
}

class A<T> implements IA<T> {
  bbb: Map<string, boolean> = new Map<string, boolean>();
  ddd: Map<string, number> = new Map<string, number>();
  ccc: boolean = false;

  aaa(value: number): void {}
}

export type SimpleArray<T> = Array<T> | ReadonlyArray<T> | Readonly<Array<T>>;

@memo_intrinsic
export declare function factory<Value>(compute: () => Value): Value;

export function cb(callback?: () => void) {
    if (callback) return;
}

@memo_intrinsic
export function impl<T>(
  @Memo
  style: ((attributes: IA<T>) => void) | undefined,
  arr: SimpleArray<T>,
  err: string = 'error message'
): void {
  const s = factory(() => {
      return new A<T>();
  });
  s.aaa(arr.length);
  style?.(s);
  if (!s.bbb.get('some_key')) {
      throw new Error(err);
  }
  if (s.ccc) {
      cb(() =>
          s.ddd.forEach((s: number, t: string) => {
            console.log(err);
            return;
          })
      );
  } else {
    return;
  }
}

class Use {
  @Memo test() {
    const style = @Memo (attributes: IA<number>) => {};
    const arr: Array<number> = [1, 2, 3, 4];
    impl(style, arr);
  }
}