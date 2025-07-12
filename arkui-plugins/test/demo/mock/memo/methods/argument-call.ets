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

import { memo } from "arkui.stateManagement.runtime";

class Test {
    @memo lambda_arg(@memo arg: () => void) {

	}

	@memo lambda_arg_with_arg(@memo arg: (value: string) => string) {

	}

    @memo memo_content(@memo content: () => void) {
		content()
	}

    @memo compute_test(
		@memo arg1: (() => void) | undefined,
		arg2: (() => void) | undefined,
		content: (() => void) | undefined
	): void {

	}
}

class Use {
    @memo test() {
		const test = new Test()

		test.lambda_arg((): void => {})
		test.lambda_arg_with_arg((value: string): string => value)

		test.compute_test(() => {}, () => {}, () => {})
	}
}