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

import { DecoratorNames } from '../../common/predefines';
import { InterfacePropertyTranslator, PropertyTranslator } from './base';
import { hasDecorator } from './utils';
import { StateInterfaceTranslator, StateTranslator } from './state';
import { PropInterfaceTranslator, PropTranslator } from './prop';
import { StorageLinkInterfaceTranslator, StorageLinkTranslator } from './storagelink';
import { LocalStorageLinkInterfaceTranslator, LocalStorageLinkTranslator } from './localstoragelink';
import { LinkInterfaceTranslator, LinkTranslator } from './link';
import { ObjectLinkInterfaceTranslator, ObjectLinkTranslator } from './objectlink';
import { LocalStoragePropInterfaceTranslator, LocalStoragePropTranslator } from './localstorageprop';
import { RegularInterfaceTranslator, RegularPropertyTranslator } from './regularProperty';
import { staticPropertyTranslator } from './staticProperty';
import { CustomComponentInfo, isStatic } from '../utils';
import { StoragePropInterfaceTranslator, StoragePropTranslator } from './storageProp';
import { ConsumeInterfaceTranslator, ConsumeTranslator } from './consume';
import { ProvideInterfaceTranslator, ProvideTranslator } from './provide';
import { BuilderParamInterfaceTranslator, BuilderParamTranslator } from './builderParam';
import { ObservedTrackTranslator } from './observedTrack';
import { ClassScopeInfo } from './types';

export { PropertyTranslator, InterfacePropertyTranslator };
export type { ClassScopeInfo };

export function classifyProperty(
    property: arkts.AstNode,
    structInfo: CustomComponentInfo
): PropertyTranslator | undefined {
    if (!arkts.isClassProperty(property)) return undefined;
    if (isStatic(property)) return new staticPropertyTranslator({ property, structInfo });

    if (hasDecorator(property, DecoratorNames.STATE)) {
        return new StateTranslator({ property, structInfo });
    }
    if (hasDecorator(property, DecoratorNames.STORAGE_LINK)) {
        return new StorageLinkTranslator({ property, structInfo });
    }
    if (hasDecorator(property, DecoratorNames.LOCAL_STORAGE_LINK)) {
        return new LocalStorageLinkTranslator({ property, structInfo });
    }
    if (hasDecorator(property, DecoratorNames.LINK)) {
        return new LinkTranslator({ property, structInfo });
    }
    if (hasDecorator(property, DecoratorNames.OBJECT_LINK)) {
        return new ObjectLinkTranslator({ property, structInfo });
    }
    if (hasDecorator(property, DecoratorNames.LOCAL_STORAGE_PROP)) {
        return new LocalStoragePropTranslator({ property, structInfo });
    }
    if (hasDecorator(property, DecoratorNames.STORAGE_PROP)) {
        return new StoragePropTranslator({ property, structInfo });
    }
    if (hasDecorator(property, DecoratorNames.PROP)) {
        return new PropTranslator({ property, structInfo });
    }
    if (hasDecorator(property, DecoratorNames.PROVIDE)) {
        return new ProvideTranslator({ property, structInfo });
    }
    if (hasDecorator(property, DecoratorNames.CONSUME)) {
        return new ConsumeTranslator({ property, structInfo });
    }
    if (hasDecorator(property, DecoratorNames.BUILDER_PARAM)) {
        return new BuilderParamTranslator({ property, structInfo });
    }

    return new RegularPropertyTranslator({ property, structInfo });
}

export function classifyPropertyInInterface(property: arkts.AstNode): InterfacePropertyTranslator | undefined {
    if (StateInterfaceTranslator.canBeTranslated(property)) {
        return new StateInterfaceTranslator({ property });
    }
    if (LinkInterfaceTranslator.canBeTranslated(property)) {
        return new LinkInterfaceTranslator({ property });
    }
    if (PropInterfaceTranslator.canBeTranslated(property)) {
        return new PropInterfaceTranslator({ property });
    }
    if (ProvideInterfaceTranslator.canBeTranslated(property)) {
        return new ProvideInterfaceTranslator({ property });
    }
    if (ConsumeInterfaceTranslator.canBeTranslated(property)) {
        return new ConsumeInterfaceTranslator({ property });
    }
    if (StoragePropInterfaceTranslator.canBeTranslated(property)) {
        return new StoragePropInterfaceTranslator({ property });
    }
    if (StorageLinkInterfaceTranslator.canBeTranslated(property)) {
        return new StorageLinkInterfaceTranslator({ property });
    }
    if (BuilderParamInterfaceTranslator.canBeTranslated(property)) {
        return new BuilderParamInterfaceTranslator({ property });
    }
    if (LocalStoragePropInterfaceTranslator.canBeTranslated(property)) {
        return new LocalStoragePropInterfaceTranslator({ property });
    }
    if (LocalStorageLinkInterfaceTranslator.canBeTranslated(property)) {
        return new LocalStorageLinkInterfaceTranslator({ property });
    }
    if (ObjectLinkInterfaceTranslator.canBeTranslated(property)) {
        return new ObjectLinkInterfaceTranslator({ property });
    }
    if (RegularInterfaceTranslator.canBeTranslated(property)) {
        return new RegularInterfaceTranslator({ property });
    }
    return undefined;
}

export function classifyObservedTrack(
    member: arkts.AstNode,
    classScopeInfo: ClassScopeInfo
): ObservedTrackTranslator | undefined {
    if (!arkts.isClassProperty(member)) {
        return undefined;
    }
    return new ObservedTrackTranslator(member, classScopeInfo);
}
