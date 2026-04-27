/*
 * Copyright (c) 2026 Huawei Device Co., Ltd.
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
import { InsightIntentDecoratorNames } from '../../../../common/predefines';
import { RecordOptions } from '../base';

export interface InsightIntentClassAnnotationInfo extends AnnotationInfo {
    hasInsightIntentLink?: boolean;
    hasInsightIntentPage?: boolean;
    hasInsightIntentFunction?: boolean;
    hasInsightIntentEntry?: boolean;
    hasInsightIntentForm?: boolean;
    hasInsightIntentEntity?: boolean;
}

export interface InsightIntentClassAnnotations extends Annotations {
    [InsightIntentDecoratorNames.LINK]?: arkts.AnnotationUsage;
    [InsightIntentDecoratorNames.PAGE]?: arkts.AnnotationUsage;
    [InsightIntentDecoratorNames.FUNCTION]?: arkts.AnnotationUsage;
    [InsightIntentDecoratorNames.ENTRY]?: arkts.AnnotationUsage;
    [InsightIntentDecoratorNames.FORM]?: arkts.AnnotationUsage;
    [InsightIntentDecoratorNames.ENTITY]?: arkts.AnnotationUsage;
}

export class InsightIntentClassAnnotationRecord extends BaseAnnotationRecord<
    InsightIntentClassAnnotations,
    InsightIntentClassAnnotationInfo
> {
    protected annotationNames: string[];

    constructor(options: RecordOptions) {
        super(options);
        this.shouldIgnoreDecl = false;
        this.annotationNames = [
            InsightIntentDecoratorNames.LINK, 
            InsightIntentDecoratorNames.PAGE,
            InsightIntentDecoratorNames.FUNCTION,
            InsightIntentDecoratorNames.ENTRY,
            InsightIntentDecoratorNames.FORM,
            InsightIntentDecoratorNames.ENTITY
        ];
    }

    updateAnnotationInfoByName(
        info: InsightIntentClassAnnotationInfo, 
        name: string | undefined
    ): InsightIntentClassAnnotationInfo {
        if (!!name && this.annotationNames.includes(name)) {
            info[`has${name}`] = true;
        }
        return info;
    }
}
