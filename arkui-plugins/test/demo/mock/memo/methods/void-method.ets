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

class A {
	x: int
	y: int
}

class Test {
    @Memo void_method(): void {
	}

    @Memo a_method_with_implicit_return_type() {
	}

	@Memo void_method_with_arg(arg: string) {
	}

	@Memo void_method_with_return(arg: string) {
	 	return
	}

    @Memo static static_method_with_type_parameter<T>(arg: T): void {
		return
	}

    @Memo obj_arg(arg: A) {

	}
}

class Use {
    @Memo test() {
		const test = new Test()

		test.void_method()
		test.void_method_with_arg("an arg")
		test.void_method_with_return("a value")
		Test.static_method_with_type_parameter("I'm static")

		test.obj_arg({ x: 1, y: 2 })
	}
}
