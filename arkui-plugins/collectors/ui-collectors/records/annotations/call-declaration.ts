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

import { FunctionAnnotationInfo, FunctionAnnotations } from './function';
import { StructPropertyAnnotationInfo, StructPropertyAnnotations } from './struct-property';
import { StructMethodAnnotationInfo, StructMethodAnnotations } from './struct-method';
import { NormalClassPropertyAnnotationInfo, NormalClassPropertyAnnotations } from './normal-class-property';
import { NormalClassMethodAnnotationInfo, NormalClassMethodAnnotations } from './normal-class-method';
import { BaseAnnotationRecord } from './base';
import { RecordOptions } from '../base';
import { BuilderLambdaNames, DecoratorNames } from '../../../../common/predefines';

export type CallDeclAnnotationInfo = FunctionAnnotationInfo &
    StructPropertyAnnotationInfo &
    StructMethodAnnotationInfo &
    NormalClassPropertyAnnotationInfo &
    NormalClassMethodAnnotationInfo;

export type CallDeclAnnotations = FunctionAnnotations &
    StructPropertyAnnotations &
    StructMethodAnnotations &
    NormalClassPropertyAnnotations &
    NormalClassMethodAnnotations;

export class CallDeclAnnotationRecord extends BaseAnnotationRecord<CallDeclAnnotations, CallDeclAnnotationInfo> {
    protected annotationNames: string[];

    constructor(options: RecordOptions) {
        super(options);
        this.annotationNames = [
            DecoratorNames.BUILDER,
            DecoratorNames.ANIMATABLE_EXTEND,
            BuilderLambdaNames.ANNOTATION_NAME,
            DecoratorNames.STATE,
            DecoratorNames.STORAGE_LINK,
            DecoratorNames.LINK,
            DecoratorNames.PROVIDE,
            DecoratorNames.CONSUME,
            DecoratorNames.OBJECT_LINK,
            DecoratorNames.WATCH,
            DecoratorNames.BUILDER_PARAM,
            DecoratorNames.LOCAL_STORAGE_LINK,
            DecoratorNames.PROP_REF,
            DecoratorNames.STORAGE_PROP_REF,
            DecoratorNames.LOCAL_STORAGE_PROP_REF,
            DecoratorNames.LOCAL,
            DecoratorNames.ONCE,
            DecoratorNames.PARAM,
            DecoratorNames.EVENT,
            DecoratorNames.REQUIRE,
            DecoratorNames.CONSUMER,
            DecoratorNames.PROVIDER,
            DecoratorNames.COMPUTED,
            DecoratorNames.MONITOR,
            DecoratorNames.JSONSTRINGIFYIGNORE,
            DecoratorNames.JSONRENAME,
            DecoratorNames.TRACK,
            DecoratorNames.TRACE,
        ];
    }

    updateAnnotationInfoByName(info: CallDeclAnnotationInfo, name: string | undefined): CallDeclAnnotationInfo {
        if (!!name && this.annotationNames.includes(name)) {
            info[`has${name}`] = true;
        }
        return info;
    }
}
