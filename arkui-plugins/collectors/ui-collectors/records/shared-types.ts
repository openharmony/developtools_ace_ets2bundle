/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
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

import { ArrowFunctionInfo } from './arrow-function';
import { FunctionInfo } from './function';
import { CallInfo } from './function-call';
import { NewClassInstanceInfo } from './new-class-instance';
import { NormalClassInfo } from './normal-class';
import { NormalClassMethodInfo } from './normal-class-method';
import { NormalClassPropertyInfo } from './normal-class-property';
import { NormalInterfaceInfo } from './normal-interface';
import { NormalInterfacePropertyInfo } from './normal-interface-property';
import { ParameterInfo } from './parameter';
import { PropertyInfo } from './property';
import { CustomComponentInfo } from './struct';
import { CustomComponentInterfaceInfo } from './struct-interface';
import { CustomComponentInterfacePropertyInfo } from './struct-interface-property';
import { StructMethodInfo } from './struct-method';
import { StructPropertyInfo } from './struct-property';

export type ClassDeclarationRecordInfo = NormalClassInfo | CustomComponentInfo;

export type MethodDefinitionRecordInfo =
    | FunctionInfo
    | NormalClassMethodInfo
    | StructMethodInfo
    | NormalInterfacePropertyInfo
    | CustomComponentInterfacePropertyInfo;

export type ClassPropertyRecordInfo = NormalClassPropertyInfo | StructPropertyInfo;

export type TSInterfaceDeclarationRecordInfo = NormalInterfaceInfo | CustomComponentInterfaceInfo;

export type CallExpressionRecordInfo = CallInfo;

export type ETSParameterExpressionRecordInfo = ParameterInfo;

export type ArrowFunctionExpressionRecordInfo = ArrowFunctionInfo;

export type PropertyRecordInfo = PropertyInfo;

export type ETSNewClassInstanceExpressionRecordInfo = NewClassInstanceInfo;

export type RecordInfo =
    | MethodDefinitionRecordInfo
    | ClassPropertyRecordInfo
    | ClassDeclarationRecordInfo
    | TSInterfaceDeclarationRecordInfo
    | CallExpressionRecordInfo
    | ETSParameterExpressionRecordInfo
    | ArrowFunctionExpressionRecordInfo
    | PropertyRecordInfo
    | ETSNewClassInstanceExpressionRecordInfo;
