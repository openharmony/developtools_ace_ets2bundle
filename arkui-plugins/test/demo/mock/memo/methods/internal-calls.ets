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

import { memo, __memo_context_type, __memo_id_type } from "@ohos.arkui.stateManagement"

export declare function __context(): __memo_context_type
export declare function __id(): __memo_id_type
type MemoType = @memo () => void

class Test {
    @memo void_method(): void {
	}

    @memo internal_call() {
		this.void_method()
	}

    @memo method_with_internals() {
		__context()
		__id()
	}

    memo_lambda() {
		@memo () => {
			
		}
	}

	@memo memo_variables() {
		@memo const f = (): number => {
			return 123
		}, g = (x: number): number => {
			return 123 + x
		}

		const h = @memo (): number => {
			return 1
		}

		f()
		g(1)
		h()
	}

    @memo args_with_default_values(
		arg1: int = 10,
		arg2: () => int = () => { return 20 },
		arg3: int = arg1,
		arg4?: int
	): void {
		console.log(arg1, arg2, arg3, arg4)
		console.log(arg2())
	}

	@memo optional_args(
		arg1?: int,
		arg2?: () => int
	) {
		console.log(arg1)
		console.log(arg2)
		console.log(arg2?.())
	}

    @memo type_alias(
		arg: MemoType
	) {
		arg()
	}
}