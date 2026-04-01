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
    hasComponentInit?: boolean;
    hasComponentAppear?: boolean;
    hasComponentBuilt?: boolean;
    hasComponentDisappear?: boolean;
    hasComponentReuse?: boolean;
    hasComponentRecycle?: boolean;
}

export interface StructMethodAnnotations extends Annotations {
    [BuilderLambdaNames.ANNOTATION_NAME]?: arkts.AnnotationUsage;
    [DecoratorNames.BUILDER]?: arkts.AnnotationUsage;
    [DecoratorNames.COMPUTED]?: arkts.AnnotationUsage;
    [DecoratorNames.MONITOR]?: arkts.AnnotationUsage;
    [DecoratorNames.COMPONENT_INIT]?: arkts.AnnotationUsage;
    [DecoratorNames.COMPONENT_APPEAR]?: arkts.AnnotationUsage;
    [DecoratorNames.COMPONENT_BUILT]?: arkts.AnnotationUsage;
    [DecoratorNames.COMPONENT_DISAPPEAR]?: arkts.AnnotationUsage;
    [DecoratorNames.COMPONENT_REUSE]?: arkts.AnnotationUsage;
    [DecoratorNames.COMPONENT_RECYCLE]?: arkts.AnnotationUsage;
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
            DecoratorNames.COMPONENT_INIT,
            DecoratorNames.COMPONENT_APPEAR,
            DecoratorNames.COMPONENT_BUILT,
            DecoratorNames.COMPONENT_DISAPPEAR,
            DecoratorNames.COMPONENT_REUSE,
            DecoratorNames.COMPONENT_RECYCLE
        ];
    }

    updateAnnotationInfoByName(info: StructMethodAnnotationInfo, name: string | undefined): StructMethodAnnotationInfo {
        if (!!name && this.annotationNames.includes(name)) {
            info[`has${name}`] = true;
        }
        return info;
    }
}
