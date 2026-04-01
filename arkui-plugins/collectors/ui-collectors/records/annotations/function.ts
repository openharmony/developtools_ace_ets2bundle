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

export interface FunctionAnnotationInfo extends AnnotationInfo {
    hasBuilder?: boolean;
    hasAnimatableExtend?: boolean;
    hasComponentBuilder?: boolean;
}

export interface FunctionAnnotations extends Annotations {
    [DecoratorNames.BUILDER]?: arkts.AnnotationUsage;
    [DecoratorNames.ANIMATABLE_EXTEND]?: arkts.AnnotationUsage;
    [BuilderLambdaNames.ANNOTATION_NAME]?: arkts.AnnotationUsage;
}

export class FunctionAnnotationRecord extends BaseAnnotationRecord<FunctionAnnotations, FunctionAnnotationInfo> {
    protected annotationNames: string[];

    constructor(options: RecordOptions) {
        super(options);
        this.annotationNames = [
            DecoratorNames.BUILDER,
            DecoratorNames.ANIMATABLE_EXTEND,
            BuilderLambdaNames.ANNOTATION_NAME,
        ];
    }

    updateAnnotationInfoByName(info: FunctionAnnotationInfo, name: string | undefined): FunctionAnnotationInfo {
        switch (name) {
            case DecoratorNames.BUILDER:
                info.hasBuilder = true;
                break;
            case DecoratorNames.ANIMATABLE_EXTEND:
                info.hasAnimatableExtend = true;
                break;
            case BuilderLambdaNames.ANNOTATION_NAME:
                info.hasComponentBuilder = true;
                break;
            default:
                return info;
        }
        return info;
    }
}
