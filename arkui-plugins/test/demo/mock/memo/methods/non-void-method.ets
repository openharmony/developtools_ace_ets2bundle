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

@Retention({policy:"SOURCE"}) @interface memo_intrinsic {}
@Retention({policy:"SOURCE"}) @interface memo_entry {}

export declare function __context(): __memo_context_type
export declare function __id(): __memo_id_type

class Test {
	@memo void_method(): void {
	}
	
    @memo string_method_with_return(arg: string): string {
	 	return arg
	}

	@memo method_with_type_parameter<T>(arg: T): T {
		return arg
	}

 	@memo_intrinsic intrinsic_method(): int {
 		return 0
 	}
 
 	@memo_intrinsic intrinsic_method_with_this(): int {
 		this.void_method()
 		return 0
 	}
 
 	@memo_entry memoEntry<R>(__memo_context: __memo_context_type, __memo_id: __memo_id_type, @memo entry: () => R): R {
 		const getContext = () => {
 			return __context()
 		}
 		const getId = () => {
 			return __id()
 		}
 		{
 			const __memo_context = getContext()
 			const __memo_id = getId()
 			return entry()
 		}
 	}
}

class Use {
    @memo test() {
		const test = new Test()

		test.string_method_with_return("a string")
		test.method_with_type_parameter("I'm string")
	}
}
