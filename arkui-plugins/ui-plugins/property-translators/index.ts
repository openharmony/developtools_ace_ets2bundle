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

import { PropertyTranslator } from './base';
import { DecoratorNames, hasDecorator } from './utils';
import { StateTranslator } from './state';
import { PropTranslator } from './prop';
import { StorageLinkTranslator } from './storagelink';
import { LocalStorageLinkTranslator } from './localstoragelink';
import { LinkTranslator } from './link';
import { ObjectLinkTranslator } from './objectlink';
import { LocalStoragePropTranslator } from './localstorageprop';
import { regularPropertyTranslator } from './regularProperty';
import { staticPropertyTranslator } from './staticProperty';
import { isStatic } from '../utils';
import { StoragePropTranslator } from './storageProp';
import { ConsumeTranslator } from './consume';
import { ProvideTranslator } from './provide';
import { BuilderParamTranslator } from './builderParam';
import { ObservedTrackTranslator } from './observedTrack';
import { ClassScopeInfo } from 'ui-plugins/checked-transformer';

export { PropertyTranslator };

export function classifyProperty(member: arkts.AstNode, structName: string): PropertyTranslator | undefined {
    if (!arkts.isClassProperty(member)) return undefined;
    if (isStatic(member)) return new staticPropertyTranslator(member, structName);

    if (hasDecorator(member, DecoratorNames.STATE)) {
        return new StateTranslator(member, structName);
    }
    if (hasDecorator(member, DecoratorNames.STORAGE_LINK)) {
        return new StorageLinkTranslator(member, structName);
    }
    if (hasDecorator(member, DecoratorNames.LOCAL_STORAGE_LINK)) {
        return new LocalStorageLinkTranslator(member, structName);
    }
    if (hasDecorator(member, DecoratorNames.LINK)) {
        return new LinkTranslator(member, structName);
    }
    if (hasDecorator(member, DecoratorNames.OBJECT_LINK)) {
        return new ObjectLinkTranslator(member, structName);
    }
    if (hasDecorator(member, DecoratorNames.LOCAL_STORAGE_PROP)) {
        return new LocalStoragePropTranslator(member, structName);
    }
    if (hasDecorator(member, DecoratorNames.STORAGE_PROP)) {
        return new StoragePropTranslator(member, structName);
    }
    if (hasDecorator(member, DecoratorNames.PROP)) {
        return new PropTranslator(member, structName);
    }
    if (hasDecorator(member, DecoratorNames.PROVIDE)) {
        return new ProvideTranslator(member, structName);
    }
    if (hasDecorator(member, DecoratorNames.CONSUME)) {
        return new ConsumeTranslator(member, structName);
    }
    if (hasDecorator(member, DecoratorNames.BUILDER_PARAM)) {
        return new BuilderParamTranslator(member, structName);
    }

    return new regularPropertyTranslator(member, structName);
}

export function classifyObservedTrack(member: arkts.AstNode, classScopeInfo: ClassScopeInfo): ObservedTrackTranslator | undefined {
    if (!arkts.isClassProperty(member)) {
        return undefined;
    }
    return new ObservedTrackTranslator(member, classScopeInfo);
}