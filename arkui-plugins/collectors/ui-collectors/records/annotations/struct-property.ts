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

export interface StructPropertyAnnotationInfo extends AnnotationInfo {
    hasState?: boolean;
    hasStorageLink?: boolean;
    hasLink?: boolean;
    hasProvide?: boolean;
    hasConsume?: boolean;
    hasObjectLink?: boolean;
    hasWatch?: boolean;
    hasBuilderParam?: boolean;
    hasLocalStorageLink?: boolean;
    hasPropRef?: boolean;
    hasStoragePropRef?: boolean;
    hasLocalStoragePropRef?: boolean;
    hasLocal?: boolean;
    hasOnce?: boolean;
    hasParam?: boolean;
    hasEvent?: boolean;
    hasRequire?: boolean;
    hasConsumer?: boolean;
    hasProvider?: boolean;
}

export interface StructPropertyAnnotations extends Annotations {
    [DecoratorNames.STATE]?: arkts.AnnotationUsage;
    [DecoratorNames.STORAGE_LINK]?: arkts.AnnotationUsage;
    [DecoratorNames.LINK]?: arkts.AnnotationUsage;
    [DecoratorNames.PROVIDE]?: arkts.AnnotationUsage;
    [DecoratorNames.CONSUME]?: arkts.AnnotationUsage;
    [DecoratorNames.OBJECT_LINK]?: arkts.AnnotationUsage;
    [DecoratorNames.WATCH]?: arkts.AnnotationUsage;
    [DecoratorNames.BUILDER_PARAM]?: arkts.AnnotationUsage;
    [DecoratorNames.LOCAL_STORAGE_LINK]?: arkts.AnnotationUsage;
    [DecoratorNames.PROP_REF]?: arkts.AnnotationUsage;
    [DecoratorNames.STORAGE_PROP_REF]?: arkts.AnnotationUsage;
    [DecoratorNames.LOCAL_STORAGE_PROP_REF]?: arkts.AnnotationUsage;
    [DecoratorNames.LOCAL]?: arkts.AnnotationUsage;
    [DecoratorNames.ONCE]?: arkts.AnnotationUsage;
    [DecoratorNames.PARAM]?: arkts.AnnotationUsage;
    [DecoratorNames.EVENT]?: arkts.AnnotationUsage;
    [DecoratorNames.REQUIRE]?: arkts.AnnotationUsage;
    [DecoratorNames.CONSUMER]?: arkts.AnnotationUsage;
    [DecoratorNames.PROVIDER]?: arkts.AnnotationUsage;
}

export class StructPropertyAnnotationRecord extends BaseAnnotationRecord<
    StructPropertyAnnotations,
    StructPropertyAnnotationInfo
> {
    protected annotationNames: string[];

    constructor(options: RecordOptions) {
        super(options);
        this.shouldIgnoreDecl = false;
        this.annotationNames = [
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
        ];
    }

    updateAnnotationInfoByName(
        info: StructPropertyAnnotationInfo,
        name: string | undefined
    ): StructPropertyAnnotationInfo {
        if (!!name && this.annotationNames.includes(name)) {
            info[`has${name}`] = true;
        }
        return info;
    }
}
