/*
 * Copyright (c) 2022-2025 Huawei Device Co., Ltd.
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

import * as fs from "node:fs"
import * as path from "node:path"
import { global } from "./arkts-api/static/global"
import { isNumber, throwError, withWarning, filterSource } from "./utils"
import { Es2pandaContextState } from "./generated/Es2pandaEnums"
import { AstNode, Config, Context, EtsScript, proceedToState } from "./arkts-api"

import * as arkts from "./arkts-api"
export {arkts, global as arktsGlobal}
