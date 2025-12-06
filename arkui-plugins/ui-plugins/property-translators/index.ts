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
import { InterfacePropertyTranslator, MethodTranslator, PropertyTranslator } from './base';
import { hasDecorator } from './utils';
import { StateInterfaceTranslator, StateTranslator } from './state';
import { StorageLinkInterfaceTranslator, StorageLinkTranslator } from './storagelink';
import { LocalStorageLinkInterfaceTranslator, LocalStorageLinkTranslator } from './localstoragelink';
import { LinkInterfaceTranslator, LinkTranslator } from './link';
import { ObjectLinkInterfaceTranslator, ObjectLinkTranslator } from './objectlink';
import { RegularInterfaceTranslator, RegularPropertyTranslator } from './regularProperty';
import { StaticPropertyTranslator } from './staticProperty';
import { CustomComponentInfo } from '../utils';
import { ConsumeInterfaceTranslator, ConsumeTranslator } from './consume';
import { ProvideInterfaceTranslator, ProvideTranslator } from './provide';
import { BuilderParamInterfaceTranslator, BuilderParamTranslator } from './builderParam';
import { PropRefInterfaceTranslator, PropRefTranslator } from './propRef';
import { ObservedTrackTranslator } from './observedTrack';
import { ClassScopeInfo } from '../struct-translators/utils';
import { LocalInterfaceTranslator, LocalTranslator } from './local';
import { StoragePropRefInterfaceTranslator, StoragePropRefTranslator } from './storagePropRef';
import { LocalStoragePropRefInterfaceTranslator, LocalStoragePropRefTranslator } from './localStoragePropRef';
import { ObservedV2TraceTranslator } from './observedV2Trace';
import { ParamInterfaceTranslator, ParamTranslator } from './param';
import { OnceInterfaceTranslator, OnceTranslator } from './once';
import { ProviderInterfaceTranslator, ProviderTranslator } from './provider';
import { ConsumerInterfaceTranslator, ConsumerTranslator } from './consumer';
import { EventInterfaceTranslator, EventTranslator } from './event';
import { ComputedTranslator } from './computed';
import { MonitorTranslator } from './monitor';

export { PropertyTranslator, InterfacePropertyTranslator };
export type { ClassScopeInfo };

export function classifyStructMembers(
    member: arkts.AstNode,
    structInfo: CustomComponentInfo
): PropertyTranslator | MethodTranslator | undefined {
    if (arkts.isClassProperty(member)) {
        return classifyProperty(member, structInfo);
    } else if (arkts.isMethodDefinition(member)) {
        return classifyMethod(member, true, structInfo.name);
    }
    return undefined;
}

export function classifyProperty(
    property: arkts.AstNode,
    structInfo: CustomComponentInfo
): PropertyTranslator | undefined {
    if (!arkts.isClassProperty(property)) return undefined;
    if (StaticPropertyTranslator.canBeStaticTranslate(property)) {
        return new StaticPropertyTranslator({ property, structInfo });
    }
    let propertyTranslator: PropertyTranslator | undefined = undefined;

    propertyTranslator = classifyV1Property(property, structInfo);
    if (!!propertyTranslator) {
        return propertyTranslator;
    }

    propertyTranslator = classifyV2Property(property, structInfo);
    if (!!propertyTranslator) {
        return propertyTranslator;
    }

    return new RegularPropertyTranslator({ property, structInfo });
}

export function classifyV1Property(
    property: arkts.ClassProperty,
    structInfo: CustomComponentInfo
): PropertyTranslator | undefined {
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
    if (hasDecorator(property, DecoratorNames.LOCAL_STORAGE_PROP_REF)) {
        return new LocalStoragePropRefTranslator({ property, structInfo });
    }
    if (hasDecorator(property, DecoratorNames.STORAGE_PROP_REF)) {
        return new StoragePropRefTranslator({ property, structInfo });
    }
    if (hasDecorator(property, DecoratorNames.PROP_REF)) {
        return new PropRefTranslator({ property, structInfo });
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

    return undefined;
}

export function classifyV2Property(
    property: arkts.ClassProperty,
    structInfo: CustomComponentInfo
): PropertyTranslator | undefined {
    if (hasDecorator(property, DecoratorNames.LOCAL)) {
        return new LocalTranslator({ property, structInfo });
    }
    if (hasDecorator(property, DecoratorNames.ONCE)) {
        return new OnceTranslator({ property, structInfo });
    }
    if (hasDecorator(property, DecoratorNames.PARAM)) {
        return new ParamTranslator({ property, structInfo });
    }
    if (hasDecorator(property, DecoratorNames.PROVIDER)) {
        return new ProviderTranslator({ property, structInfo });
    }
    if (hasDecorator(property, DecoratorNames.CONSUMER)) {
        return new ConsumerTranslator({ property, structInfo });
    }
    if (hasDecorator(property, DecoratorNames.EVENT)) {
        return new EventTranslator({ property, structInfo });
    }
    return undefined;
}

export function classifyPropertyInInterface(property: arkts.AstNode): InterfacePropertyTranslator | undefined {
    let interfacePropertyTranslater: InterfacePropertyTranslator | undefined = undefined;

    interfacePropertyTranslater = classifyV1PropertyInInterface(property);
    if (!!interfacePropertyTranslater) {
        return interfacePropertyTranslater;
    }

    interfacePropertyTranslater = classifyV2PropertyInInterface(property);
    if (!!interfacePropertyTranslater) {
        return interfacePropertyTranslater;
    }

    if (RegularInterfaceTranslator.canBeTranslated(property)) {
        return new RegularInterfaceTranslator({ property });
    }
    return undefined;
}

export function classifyV1PropertyInInterface(property: arkts.AstNode): InterfacePropertyTranslator | undefined {
    if (StateInterfaceTranslator.canBeTranslated(property)) {
        return new StateInterfaceTranslator({ property });
    }
    if (LinkInterfaceTranslator.canBeTranslated(property)) {
        return new LinkInterfaceTranslator({ property });
    }
    if (PropRefInterfaceTranslator.canBeTranslated(property)) {
        return new PropRefInterfaceTranslator({ property });
    }
    if (ProvideInterfaceTranslator.canBeTranslated(property)) {
        return new ProvideInterfaceTranslator({ property });
    }
    if (ConsumeInterfaceTranslator.canBeTranslated(property)) {
        return new ConsumeInterfaceTranslator({ property });
    }
    if (StorageLinkInterfaceTranslator.canBeTranslated(property)) {
        return new StorageLinkInterfaceTranslator({ property });
    }
    if (StoragePropRefInterfaceTranslator.canBeTranslated(property)) {
        return new StoragePropRefInterfaceTranslator({ property });
    }
    if (LocalStoragePropRefInterfaceTranslator.canBeTranslated(property)) {
        return new LocalStoragePropRefInterfaceTranslator({ property });
    }
    if (BuilderParamInterfaceTranslator.canBeTranslated(property)) {
        return new BuilderParamInterfaceTranslator({ property });
    }
    if (LocalStorageLinkInterfaceTranslator.canBeTranslated(property)) {
        return new LocalStorageLinkInterfaceTranslator({ property });
    }
    if (ObjectLinkInterfaceTranslator.canBeTranslated(property)) {
        return new ObjectLinkInterfaceTranslator({ property });
    }
    return undefined;
}

export function classifyV2PropertyInInterface(property: arkts.AstNode): InterfacePropertyTranslator | undefined {
    if (LocalInterfaceTranslator.canBeTranslated(property)) {
        return new LocalInterfaceTranslator({ property });
    }
    if (OnceInterfaceTranslator.canBeTranslated(property)) {
        return new OnceInterfaceTranslator({ property });
    }
    if (ParamInterfaceTranslator.canBeTranslated(property)) {
        return new ParamInterfaceTranslator({ property });
    }
    if (ProviderInterfaceTranslator.canBeTranslated(property)) {
        return new ProviderInterfaceTranslator({ property });
    }
    if (ConsumerInterfaceTranslator.canBeTranslated(property)) {
        return new ConsumerInterfaceTranslator({ property });
    }
    if (EventInterfaceTranslator.canBeTranslated(property)) {
         return new EventInterfaceTranslator({ property });
    }
    return undefined;
}

export type ObservedTranslator = ObservedV2TraceTranslator | ObservedTrackTranslator;

export function classifyObservedClassProperty(
    member: arkts.ClassProperty,
    classScopeInfo: ClassScopeInfo
): ObservedTranslator | undefined {
    if (classScopeInfo.isObservedV2) {
        return new ObservedV2TraceTranslator(member, classScopeInfo);
    }
    if (classScopeInfo.isObserved || classScopeInfo.classHasTrack) {
        return new ObservedTrackTranslator(member, classScopeInfo);
    }
    return undefined;
}

export function classifyMethod(
    member: arkts.AstNode,
    isFromStruct: boolean,
    className: string
): MethodTranslator | undefined {
    if (!arkts.isMethodDefinition(member)) {
        return undefined;
    }
    if (hasDecorator(member, DecoratorNames.COMPUTED)) {
        return new ComputedTranslator(member, { isFromStruct, className });
    }
    if (hasDecorator(member, DecoratorNames.MONITOR)) {
        return new MonitorTranslator(member, { isFromStruct, className });
    }
    return undefined;
}

export function classifyInObservedClass(
    member: arkts.AstNode,
    classScopeInfo: ClassScopeInfo
): ObservedTranslator | MethodTranslator | undefined {
    if (arkts.isClassProperty(member)) {
        return classifyObservedClassProperty(member, classScopeInfo);
    } else if (arkts.isMethodDefinition(member)) {
        return classifyMethod(member, false, classScopeInfo.className);
    }
    return undefined;
}
