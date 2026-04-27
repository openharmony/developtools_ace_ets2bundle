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
import { InsightIntentDecoratorNames, StructDecoratorNames } from '../../../../common/predefines';
import { RecordOptions } from '../base';
import { MetaDataCollector } from 'common/metadata-collector';

export interface InsightIntentStructAnnotationInfo extends AnnotationInfo {
    hasInsightIntentPage?: boolean;
}

export interface StructAnnotationInfo extends AnnotationInfo, InsightIntentStructAnnotationInfo {
    hasComponent?: boolean;
    hasComponentV2?: boolean;
    hasEntry?: boolean;
    hasReusable?: boolean;
    hasReusableV2?: boolean;
    hasCustomLayout?: boolean;
    hasCustomDialog?: boolean;
    hasPreview?: boolean;
}

export interface CustomComponentAnnotations extends Annotations {
    [StructDecoratorNames.COMPONENT]?: arkts.AnnotationUsage;
    [StructDecoratorNames.COMPONENT_V2]?: arkts.AnnotationUsage;
    [StructDecoratorNames.ENTRY]?: arkts.AnnotationUsage;
    [StructDecoratorNames.RESUABLE]?: arkts.AnnotationUsage;
    [StructDecoratorNames.RESUABLE_V2]?: arkts.AnnotationUsage;
    [StructDecoratorNames.CUSTOM_LAYOUT]?: arkts.AnnotationUsage;
    [StructDecoratorNames.CUSTOMDIALOG]?: arkts.AnnotationUsage;
    [StructDecoratorNames.PREVIEW]?: arkts.AnnotationUsage;
}

export class CustomComponentAnnotationRecord extends BaseAnnotationRecord<
    CustomComponentAnnotations,
    StructAnnotationInfo
> {
    protected annotationNames: string[];

    constructor(options: RecordOptions) {
        super(options);
        this.annotationNames = Object.values(StructDecoratorNames);
    }

    protected updateIgnoreAnnotationInfo(name: string | undefined): void {
        if (name === undefined) {
            return;
        }
        if (this.shouldHandleInsightIntent && name === InsightIntentDecoratorNames.PAGE) {
            this.updateAnnotationInfo(name);
            return;
        }
        super.updateIgnoreAnnotationInfo(name);
    }

    protected updateIgnoreAnnotations(anno: arkts.AnnotationUsage, name: string | undefined): void {
        if (name === undefined) {
            return;
        }
        if (this.shouldHandleInsightIntent && name === InsightIntentDecoratorNames.PAGE) {
            this.updateAnnotations(anno, name);
            return;
        }
        super.updateAnnotations(anno, name);
    }

    updateAnnotationInfoByName(info: StructAnnotationInfo, name: string | undefined): StructAnnotationInfo {
        switch (name) {
            case StructDecoratorNames.COMPONENT:
                info.hasComponent = true;
                break;
            case StructDecoratorNames.COMPONENT_V2:
                info.hasComponentV2 = true;
                break;
            case StructDecoratorNames.ENTRY:
                info.hasEntry = true;
                break;
            case StructDecoratorNames.RESUABLE:
                info.hasReusable = true;
                break;
            case StructDecoratorNames.RESUABLE_V2:
                info.hasReusableV2 = true;
                break;
            case StructDecoratorNames.CUSTOM_LAYOUT:
                info.hasCustomLayout = true;
                break;
            case StructDecoratorNames.CUSTOMDIALOG:
                info.hasCustomDialog = true;
                break;
            case StructDecoratorNames.PREVIEW:
                info.hasPreview = true;
                break;
            case InsightIntentDecoratorNames.PAGE:
                info.hasInsightIntentPage = true;
                break;
            default:
                return info;
        }
        return info;
    }
}
