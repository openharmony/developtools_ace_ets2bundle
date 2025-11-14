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

import {
    CustomComponentInterfacePropertyInfo,
    NormalClassAnnotationInfo,
    NormalClassPropertyInfo,
    StructPropertyAnnotationInfo,
    StructPropertyInfo,
} from '../../collectors/ui-collectors/records';
import { DecoratorNames } from '../../common/predefines';
import {
    PropertyCachedTranslator,
    InterfacePropertyTranslator,
    MethodTranslator,
    PropertyTranslator,
    InterfacePropertyCachedTranslator,
    BaseObservedPropertyTranslator,
    InterfacePropertyTypes,
    BaseMethodTranslator,
} from './base';
import { hasDecorator } from './utils';
import {
    StateCachedInterfaceTranslator,
    StateCachedTranslator,
    StateTranslator,
    StateInterfaceTranslator,
} from './state';
import {
    StorageLinkCachedTranslator,
    StorageLinkCachedInterfaceTranslator,
    StorageLinkTranslator,
    StorageLinkInterfaceTranslator,
} from './storagelink';
import {
    LocalStorageLinkCachedTranslator,
    LocalStorageLinkCachedInterfaceTranslator,
    LocalStorageLinkTranslator,
    LocalStorageLinkInterfaceTranslator,
} from './localstoragelink';
import { LinkCachedTranslator, LinkCachedInterfaceTranslator, LinkTranslator, LinkInterfaceTranslator } from './link';
import {
    ObjectLinkCachedTranslator,
    ObjectLinkTranslator,
    ObjectLinkInterfaceTranslator,
    ObjectLinkCachedInterfaceTranslator,
} from './objectlink';
import {
    RegularPropertyCachedTranslator,
    RegularCachedInterfaceTranslator,
    RegularPropertyTranslator,
    RegularInterfaceTranslator,
} from './regularProperty';
import { StaticPropertyCachedTranslator, StaticPropertyTranslator } from './staticProperty';
import { ClassInfo, StructInfo } from '../utils';
import {
    ConsumeCachedTranslator,
    ConsumeCachedInterfaceTranslator,
    ConsumeTranslator,
    ConsumeInterfaceTranslator,
} from './consume';
import {
    ProvideCachedTranslator,
    ProvideCachedInterfaceTranslator,
    ProvideTranslator,
    ProvideInterfaceTranslator,
} from './provide';
import {
    BuilderParamCachedTranslator,
    BuilderParamCachedInterfaceTranslator,
    BuilderParamTranslator,
    BuilderParamInterfaceTranslator,
} from './builderParam';
import {
    PropRefCachedTranslator,
    PropRefCachedInterfaceTranslator,
    PropRefTranslator,
    PropRefInterfaceTranslator,
} from './propRef';
import { ObservedTrackCachedTranslator, ObservedTrackTranslator } from './observedTrack';
import { ClassScopeInfo } from '../struct-translators/utils';
import {
    LocalCachedTranslator,
    LocalCachedInterfaceTranslator,
    LocalTranslator,
    LocalInterfaceTranslator,
} from './local';
import {
    StoragePropRefCachedTranslator,
    StoragePropRefCachedInterfaceTranslator,
    StoragePropRefTranslator,
    StoragePropRefInterfaceTranslator,
} from './storagePropRef';
import {
    LocalStoragePropRefCachedTranslator,
    LocalStoragePropRefCachedInterfaceTranslator,
    LocalStoragePropRefTranslator,
    LocalStoragePropRefInterfaceTranslator,
} from './localStoragePropRef';
import { ObservedV2TraceCachedTranslator, ObservedV2TraceTranslator } from './observedV2Trace';
import {
    ParamCachedTranslator,
    ParamCachedInterfaceTranslator,
    ParamTranslator,
    ParamInterfaceTranslator,
} from './param';
import { OnceCachedTranslator, OnceCachedInterfaceTranslator, OnceTranslator, OnceInterfaceTranslator } from './once';
import {
    ProviderCachedTranslator,
    ProviderCachedInterfaceTranslator,
    ProviderTranslator,
    ProviderInterfaceTranslator,
} from './provider';
import {
    ConsumerCachedTranslator,
    ConsumerCachedInterfaceTranslator,
    ConsumerTranslator,
    ConsumerInterfaceTranslator,
} from './consumer';
import { ComputedTranslator } from './computed';
import { MonitorTranslator } from './monitor';
import { EventCachedInterfaceTranslator, EventCachedTranslator } from './event';
import { RequireCachedTranslator } from './require';

export { BaseObservedPropertyTranslator, PropertyTranslator, PropertyCachedTranslator, InterfacePropertyTranslator };
export type { ClassScopeInfo };

export function classifyStructMembers(
    member: arkts.AstNode,
    structInfo: StructInfo
): PropertyTranslator | MethodTranslator | undefined {
    if (arkts.isClassProperty(member)) {
        return classifyProperty(member, structInfo);
    } else if (arkts.isMethodDefinition(member)) {
        return classifyMethod(member, { isFromStruct: true, className: structInfo.name });
    }
    return undefined;
}

export function classifyProperty(
    property: arkts.AstNode,
    structInfo: StructInfo
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
    structInfo: StructInfo
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
    structInfo: StructInfo
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
    return undefined;
}

export function classifyObservedClassProperty(
    property: arkts.ClassProperty,
    classScopeInfo: ClassScopeInfo
): BaseObservedPropertyTranslator | undefined {
    if (classScopeInfo.isObservedV2) {
        return new ObservedV2TraceTranslator({ property, classScopeInfo });
    }
    if (classScopeInfo.isObserved || classScopeInfo.classHasTrack) {
        return new ObservedTrackTranslator({ property, classScopeInfo });
    }
    return undefined;
}

export function classifyMethod(method: arkts.AstNode, classInfo: ClassInfo): MethodTranslator | undefined {
    if (!arkts.isMethodDefinition(method)) {
        return undefined;
    }
    if (hasDecorator(method, DecoratorNames.COMPUTED)) {
        return new ComputedTranslator({ method, classInfo });
    }
    if (hasDecorator(method, DecoratorNames.MONITOR)) {
        return new MonitorTranslator({ method, classInfo });
    }
    return undefined;
}

export function classifyInObservedClass(
    member: arkts.AstNode,
    classScopeInfo: ClassScopeInfo
): BaseObservedPropertyTranslator | BaseMethodTranslator | undefined {
    if (arkts.isClassProperty(member)) {
        return classifyObservedClassProperty(member, classScopeInfo);
    } else if (arkts.isMethodDefinition(member)) {
        return classifyMethod(member, { isFromStruct: false, className: classScopeInfo.className });
    }
    return undefined;
}

export function classifyPropertyFromInfo(
    node: arkts.ClassProperty,
    metadata: StructPropertyInfo
): PropertyCachedTranslator | undefined {
    if (!metadata.structInfo || !!metadata.structInfo.isDecl) {
        return undefined;
    }
    if (StaticPropertyCachedTranslator.canBeStaticTranslate(node, metadata)) {
        return new StaticPropertyCachedTranslator({ property: node, propertyInfo: metadata });
    }
    const annotationInfo = metadata.annotationInfo;
    if (!annotationInfo) {
        return new RegularPropertyCachedTranslator({ property: node, propertyInfo: metadata });
    }
    let propertyTranslator: PropertyCachedTranslator | undefined;
    propertyTranslator = classifyV1PropertyFromInfo(node, metadata);
    if (!!propertyTranslator) {
        return propertyTranslator;
    }
    propertyTranslator = classifyV2PropertyFromInfo(node, metadata);
    if (!!propertyTranslator) {
        return propertyTranslator;
    }
    return undefined;
}

export function classifyV1PropertyFromInfo(
    node: arkts.ClassProperty,
    metadata: StructPropertyInfo
): PropertyCachedTranslator | undefined {
    const property: arkts.ClassProperty = node;
    const propertyInfo: StructPropertyInfo = metadata;
    const annotationInfo: StructPropertyAnnotationInfo = metadata.annotationInfo!;
    if (annotationInfo.hasState) {
        return new StateCachedTranslator({ property, propertyInfo });
    }
    if (annotationInfo.hasStorageLink) {
        return new StorageLinkCachedTranslator({ property, propertyInfo });
    }
    if (annotationInfo.hasLocalStorageLink) {
        return new LocalStorageLinkCachedTranslator({ property, propertyInfo });
    }
    if (annotationInfo.hasLink) {
        return new LinkCachedTranslator({ property, propertyInfo });
    }
    if (annotationInfo.hasObjectLink) {
        return new ObjectLinkCachedTranslator({ property, propertyInfo });
    }
    if (annotationInfo.hasLocalStoragePropRef) {
        return new LocalStoragePropRefCachedTranslator({ property, propertyInfo });
    }
    if (annotationInfo.hasStoragePropRef) {
        return new StoragePropRefCachedTranslator({ property, propertyInfo });
    }
    if (annotationInfo.hasPropRef) {
        return new PropRefCachedTranslator({ property, propertyInfo });
    }
    if (annotationInfo.hasProvide) {
        return new ProvideCachedTranslator({ property, propertyInfo });
    }
    if (annotationInfo.hasConsume) {
        return new ConsumeCachedTranslator({ property, propertyInfo });
    }
    if (annotationInfo.hasBuilderParam) {
        return new BuilderParamCachedTranslator({ property, propertyInfo });
    }
    return undefined;
}

export function classifyV2PropertyFromInfo(
    node: arkts.ClassProperty,
    metadata: StructPropertyInfo
): PropertyCachedTranslator | undefined {
    const property: arkts.ClassProperty = node;
    const propertyInfo: StructPropertyInfo = metadata;
    const annotationInfo: StructPropertyAnnotationInfo = metadata.annotationInfo!;
    if (annotationInfo.hasLocal) {
        return new LocalCachedTranslator({ property, propertyInfo });
    }
    if (annotationInfo.hasOnce) {
        return new OnceCachedTranslator({ property, propertyInfo });
    }
    if (annotationInfo.hasParam) {
        return new ParamCachedTranslator({ property, propertyInfo });
    }
    if (annotationInfo.hasProvider) {
        return new ProviderCachedTranslator({ property, propertyInfo });
    }
    if (annotationInfo.hasConsumer) {
        return new ConsumerCachedTranslator({ property, propertyInfo });
    }
    if (annotationInfo.hasEvent) {
        return new EventCachedTranslator({ property, propertyInfo });
    }
    if (annotationInfo.hasRequire) {
        return new RequireCachedTranslator({ property, propertyInfo });
    }
    return undefined;
}

export function classifyPropertyInInterfaceFromInfo<T extends InterfacePropertyTypes>(
    property: T,
    metadata?: CustomComponentInterfacePropertyInfo
): InterfacePropertyCachedTranslator<T> | undefined {
    const propertyInfo = metadata;
    let interfacePropertyTranslater: InterfacePropertyCachedTranslator<T> | undefined;
    interfacePropertyTranslater = classifyV1PropertyInInterfaceFromInfo(property, propertyInfo);
    if (!!interfacePropertyTranslater) {
        return interfacePropertyTranslater;
    }
    interfacePropertyTranslater = classifyV2PropertyInInterfaceFromInfo(property, propertyInfo);
    if (!!interfacePropertyTranslater) {
        return interfacePropertyTranslater;
    }
    if (RegularCachedInterfaceTranslator.canBeTranslated(property, propertyInfo)) {
        return new RegularCachedInterfaceTranslator({ property, propertyInfo });
    }
    return undefined;
}

export function classifyV1PropertyInInterfaceFromInfo<T extends InterfacePropertyTypes>(
    property: T,
    metadata?: CustomComponentInterfacePropertyInfo
): InterfacePropertyCachedTranslator<T> | undefined {
    const propertyInfo = metadata;
    if (StateCachedInterfaceTranslator.canBeTranslated(property, propertyInfo)) {
        return new StateCachedInterfaceTranslator({ property, propertyInfo });
    }
    if (LinkCachedInterfaceTranslator.canBeTranslated(property, propertyInfo)) {
        return new LinkCachedInterfaceTranslator({ property, propertyInfo });
    }
    if (PropRefCachedInterfaceTranslator.canBeTranslated(property, propertyInfo)) {
        return new PropRefCachedInterfaceTranslator({ property, propertyInfo });
    }
    if (ProvideCachedInterfaceTranslator.canBeTranslated(property, propertyInfo)) {
        return new ProvideCachedInterfaceTranslator({ property, propertyInfo });
    }
    if (ConsumeCachedInterfaceTranslator.canBeTranslated(property, propertyInfo)) {
        return new ConsumeCachedInterfaceTranslator({ property, propertyInfo });
    }
    if (StorageLinkCachedInterfaceTranslator.canBeTranslated(property, propertyInfo)) {
        return new StorageLinkCachedInterfaceTranslator({ property, propertyInfo });
    }
    if (StoragePropRefCachedInterfaceTranslator.canBeTranslated(property, propertyInfo)) {
        return new StoragePropRefCachedInterfaceTranslator({ property, propertyInfo });
    }
    if (LocalStoragePropRefCachedInterfaceTranslator.canBeTranslated(property, propertyInfo)) {
        return new LocalStoragePropRefCachedInterfaceTranslator({ property, propertyInfo });
    }
    if (BuilderParamCachedInterfaceTranslator.canBeTranslated(property, propertyInfo)) {
        return new BuilderParamCachedInterfaceTranslator({ property, propertyInfo });
    }
    if (LocalStorageLinkCachedInterfaceTranslator.canBeTranslated(property, propertyInfo)) {
        return new LocalStorageLinkCachedInterfaceTranslator({ property, propertyInfo });
    }
    if (ObjectLinkCachedInterfaceTranslator.canBeTranslated(property, propertyInfo)) {
        return new ObjectLinkCachedInterfaceTranslator({ property, propertyInfo });
    }
    return undefined;
}

export function classifyV2PropertyInInterfaceFromInfo<T extends InterfacePropertyTypes>(
    property: T,
    metadata?: CustomComponentInterfacePropertyInfo
): InterfacePropertyCachedTranslator<T> | undefined {
    const propertyInfo = metadata;
    if (LocalCachedInterfaceTranslator.canBeTranslated(property, propertyInfo)) {
        return new LocalCachedInterfaceTranslator({ property, propertyInfo });
    }
    if (OnceCachedInterfaceTranslator.canBeTranslated(property, propertyInfo)) {
        return new OnceCachedInterfaceTranslator({ property, propertyInfo });
    }
    if (ParamCachedInterfaceTranslator.canBeTranslated(property, propertyInfo)) {
        return new ParamCachedInterfaceTranslator({ property, propertyInfo });
    }
    if (ProviderCachedInterfaceTranslator.canBeTranslated(property, propertyInfo)) {
        return new ProviderCachedInterfaceTranslator({ property, propertyInfo });
    }
    if (ConsumerCachedInterfaceTranslator.canBeTranslated(property, propertyInfo)) {
        return new ConsumerCachedInterfaceTranslator({ property, propertyInfo });
    }
    if (EventCachedInterfaceTranslator.canBeTranslated(property, propertyInfo)) {
        return new EventCachedInterfaceTranslator({ property, propertyInfo });
    }
    return undefined;
}

export function classifyObservedClassPropertyFromInfo(
    property: arkts.ClassProperty,
    propertyInfo: NormalClassPropertyInfo
): BaseObservedPropertyTranslator | undefined {
    const classAnnotationInfo: NormalClassAnnotationInfo | undefined = propertyInfo.classInfo?.annotationInfo;
    if (classAnnotationInfo?.hasObservedV2) {
        return new ObservedV2TraceCachedTranslator({ property, propertyInfo });
    }
    if (classAnnotationInfo?.hasObserved || propertyInfo.annotationInfo?.hasTrack) {
        return new ObservedTrackCachedTranslator({ property, propertyInfo });
    }
    return undefined;
}
