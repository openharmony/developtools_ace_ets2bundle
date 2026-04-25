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

import * as arkts from '@koalaui/libarkts';
import { AnnotationInfo, Annotations, BaseAnnotationRecord } from './base';
import { BuilderLambdaNames, DecoratorNames } from '../../../../common/predefines';
import { RecordOptions } from '../base';

export interface ParameterAnnotationInfo extends AnnotationInfo {
    hasBuilder?: boolean;
}

export interface ParameterAnnotations extends Annotations {
    [DecoratorNames.BUILDER]?: arkts.AnnotationUsage;
}

export class ParameterAnnotationRecord extends BaseAnnotationRecord<ParameterAnnotations, ParameterAnnotationInfo> {
    protected annotationNames: string[];

    constructor(options: RecordOptions) {
        super(options);
        this.shouldIgnoreDecl = false;
        this.annotationNames = [DecoratorNames.BUILDER];
    }

    updateAnnotationInfoByName(info: ParameterAnnotationInfo, name: string | undefined): ParameterAnnotationInfo {
        switch (name) {
            case DecoratorNames.BUILDER:
                info.hasBuilder = true;
                break;
            default:
                return info;
        }
        return info;
    }
}
