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

export interface StructMethodAnnotationInfo extends AnnotationInfo {
    hasComponentBuilder?: boolean;
    hasBuilder?: boolean;
    hasComputed?: boolean;
    hasMonitor?: boolean;
}

export interface StructMethodAnnotations extends Annotations {
    [BuilderLambdaNames.ANNOTATION_NAME]?: arkts.AnnotationUsage;
    [DecoratorNames.BUILDER]?: arkts.AnnotationUsage;
    [DecoratorNames.COMPUTED]?: arkts.AnnotationUsage;
    [DecoratorNames.MONITOR]?: arkts.AnnotationUsage;
}

export class StructMethodAnnotationRecord extends BaseAnnotationRecord<
    StructMethodAnnotations,
    StructMethodAnnotationInfo
> {
    protected annotationNames: string[];

    constructor(options: RecordOptions) {
        super(options);
        this.annotationNames = [
            BuilderLambdaNames.ANNOTATION_NAME,
            DecoratorNames.BUILDER,
            DecoratorNames.COMPUTED,
            DecoratorNames.MONITOR,
        ];
    }

    updateAnnotationInfoByName(info: StructMethodAnnotationInfo, name: string | undefined): StructMethodAnnotationInfo {
        switch (name) {
            case BuilderLambdaNames.ANNOTATION_NAME:
                info.hasComponentBuilder = true;
                break;
            case DecoratorNames.BUILDER:
                info.hasBuilder = true;
                break;
            case DecoratorNames.COMPUTED:
                info.hasComputed = true;
                break;
            case DecoratorNames.MONITOR:
                info.hasMonitor = true;
                break;
            default:
                return info;
        }
        return info;
    }
}
