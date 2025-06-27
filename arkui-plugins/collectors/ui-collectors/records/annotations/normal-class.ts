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
import { DecoratorNames } from '../../../../common/predefines';
import { RecordOptions } from '../base';

export interface NormalClassAnnotationInfo extends AnnotationInfo {
    hasObserved?: boolean;
    hasObservedV2?: boolean;
}

export interface NormalClassAnnotations extends Annotations {
    [DecoratorNames.OBSERVED]?: arkts.AnnotationUsage;
    [DecoratorNames.OBSERVED_V2]?: arkts.AnnotationUsage;
}

export class NormalClassAnnotationRecord extends BaseAnnotationRecord<
    NormalClassAnnotations,
    NormalClassAnnotationInfo
> {
    protected annotationNames: string[];

    constructor(options: RecordOptions) {
        super(options);
        this.annotationNames = [DecoratorNames.OBSERVED, DecoratorNames.OBSERVED_V2];
    }

    updateAnnotationInfoByName(info: NormalClassAnnotationInfo, name: string | undefined): NormalClassAnnotationInfo {
        switch (name) {
            case DecoratorNames.OBSERVED:
                info.hasObserved = true;
                break;
            case DecoratorNames.OBSERVED_V2:
                info.hasObservedV2 = true;
                break;
            default:
                return info;
        }
        return info;
    }
}
