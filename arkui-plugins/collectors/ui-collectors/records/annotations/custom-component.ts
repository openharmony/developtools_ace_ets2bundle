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
import { StructDecoratorNames } from '../../../../common/predefines';
import { RecordOptions } from '../base';

export interface StructAnnotationInfo extends AnnotationInfo {
    hasComponent?: boolean;
    hasComponentV2?: boolean;
    hasEntry?: boolean;
    hasReusable?: boolean;
    hasReusableV2?: boolean;
    hasCustomLayout?: boolean;
    hasCustomDialog?: boolean;
}

export interface CustomComponentAnnotations extends Annotations {
    [StructDecoratorNames.COMPONENT]?: arkts.AnnotationUsage;
    [StructDecoratorNames.COMPONENT_V2]?: arkts.AnnotationUsage;
    [StructDecoratorNames.ENTRY]?: arkts.AnnotationUsage;
    [StructDecoratorNames.RESUABLE]?: arkts.AnnotationUsage;
    [StructDecoratorNames.RESUABLE_V2]?: arkts.AnnotationUsage;
    [StructDecoratorNames.CUSTOM_LAYOUT]?: arkts.AnnotationUsage;
    [StructDecoratorNames.CUSTOMDIALOG]?: arkts.AnnotationUsage;
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
            default:
                return info;
        }
        return info;
    }
}
