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
    CustomComponentInnerClassPropertyInfo,
    NormalClassAnnotationInfo,
    NormalClassPropertyInfo,
    StructPropertyAnnotationInfo,
    StructPropertyInfo,
} from '../../collectors/ui-collectors/records';
import { DecoratorNames } from '../../common/predefines';
import {
    PropertyCachedTranslator,
    InnerClassPropertyTranslator,
    MethodTranslator,
    PropertyTranslator,
    InnerClassPropertyCachedTranslator,
    BaseObservedPropertyTranslator,
    InnerClassPropertyTypes,
    BaseMethodTranslator,
} from './base';
import { hasDecorator } from './utils';
import {
    StateCachedInnerClassTranslator,
    StateCachedTranslator,
    StateTranslator,
    StateInnerClassTranslator,
} from './state';
import {
    StorageLinkCachedTranslator,
    StorageLinkCachedInnerClassTranslator,
    StorageLinkTranslator,
    StorageLinkInnerClassTranslator,
} from './storagelink';
import {
    LocalStorageLinkCachedTranslator,
    LocalStorageLinkCachedInnerClassTranslator,
    LocalStorageLinkTranslator,
    LocalStorageLinkInnerClassTranslator,
} from './localstoragelink';
import { LinkCachedTranslator, LinkCachedInnerClassTranslator, LinkTranslator, LinkInnerClassTranslator } from './link';
import {
    ObjectLinkCachedTranslator,
    ObjectLinkTranslator,
    ObjectLinkInnerClassTranslator,
    ObjectLinkCachedInnerClassTranslator,
} from './objectlink';
import {
    RegularPropertyCachedTranslator,
    RegularCachedInnerClassTranslator,
    RegularPropertyTranslator,
    RegularInnerClassTranslator,
} from './regularProperty';
import { StaticPropertyCachedTranslator, StaticPropertyTranslator } from './staticProperty';
import { ClassInfo, CustomComponentInfo } from '../utils';
import {
    ConsumeCachedTranslator,
    ConsumeCachedInnerClassTranslator,
    ConsumeTranslator,
    ConsumeInnerClassTranslator,
} from './consume';
import {
    ProvideCachedTranslator,
    ProvideCachedInnerClassTranslator,
    ProvideTranslator,
    ProvideInnerClassTranslator,
} from './provide';
import {
    BuilderParamCachedTranslator,
    BuilderParamCachedInnerClassTranslator,
    BuilderParamTranslator,
    BuilderParamInnerClassTranslator,
} from './builderParam';
import {
    PropRefCachedTranslator,
    PropRefCachedInnerClassTranslator,
    PropRefTranslator,
    PropRefInnerClassTranslator,
} from './propRef';
import { ObservedTrackCachedTranslator, ObservedTrackTranslator } from './observedTrack';
import { checkIsDeclFromStructInfo, ClassScopeInfo } from '../struct-translators/utils';
import {
    LocalCachedTranslator,
    LocalCachedInnerClassTranslator,
    LocalTranslator,
    LocalInnerClassTranslator,
} from './local';
import {
    StoragePropRefCachedTranslator,
    StoragePropRefCachedInnerClassTranslator,
    StoragePropRefTranslator,
    StoragePropRefInnerClassTranslator,
} from './storagePropRef';
import {
    LocalStoragePropRefCachedTranslator,
    LocalStoragePropRefCachedInnerClassTranslator,
    LocalStoragePropRefTranslator,
    LocalStoragePropRefInnerClassTranslator,
} from './localStoragePropRef';
import { ObservedV2TraceCachedTranslator, ObservedV2TraceTranslator } from './observedV2Trace';
import {
    ParamCachedTranslator,
    ParamCachedInnerClassTranslator,
    ParamTranslator,
    ParamInnerClassTranslator,
} from './param';
import { OnceCachedTranslator, OnceCachedInnerClassTranslator, OnceTranslator, OnceInnerClassTranslator } from './once';
import {
    ProviderCachedTranslator,
    ProviderCachedInnerClassTranslator,
    ProviderTranslator,
    ProviderInnerClassTranslator,
} from './provider';
import {
    ConsumerCachedTranslator,
    ConsumerCachedInnerClassTranslator,
    ConsumerTranslator,
    ConsumerInnerClassTranslator,
} from './consumer';
import { ComputedTranslator } from './computed';
import { MonitorTranslator } from './monitor';
import {
    EventCachedInnerClassTranslator,
    EventCachedTranslator,
    EventTranslator,
    EventInnerClassTranslator
} from './event';
import { RequireCachedTranslator } from './require';
import { EnvTranslator, EnvInnerClassTranslator, EnvCachedTranslator, EnvCachedInnerClassTranslator } from './env';
import { CustomEnvCachedTranslator, CustomEnvCachedInnerClassTranslator } from './customEnv';
import { ComponentLifecycleTranslator } from './componentLifecycle';
import { SyncMonitorTranslator } from './syncMonitor';

export { BaseObservedPropertyTranslator, PropertyTranslator, PropertyCachedTranslator, InnerClassPropertyTranslator };
export type { ClassScopeInfo };

/**
 * @deprecated
 */
export function classifyStructMembers(
    member: arkts.AstNode,
    structInfo: CustomComponentInfo
): PropertyTranslator | MethodTranslator | undefined {
    if (arkts.isClassProperty(member)) {
        return classifyProperty(member, structInfo);
    } else if (arkts.isMethodDefinition(member)) {
        return classifyMethod(member, { isFromStruct: true, className: structInfo.name });
    }
    return undefined;
}

/**
 * @deprecated
 */
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

/**
 * @deprecated
 */
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

/**
 * @deprecated
 */
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
    if (hasDecorator(property, DecoratorNames.ENV)) {
        return new EnvTranslator({ property, structInfo });
    }
    return undefined;
}

/**
 * @deprecated
 */
export function classifyPropertyInInnerClass(property: arkts.AstNode): InnerClassPropertyTranslator | undefined {
    let InnerClassPropertyTranslater: InnerClassPropertyTranslator | undefined = undefined;

    InnerClassPropertyTranslater = classifyV1PropertyInInnerClass(property);
    if (!!InnerClassPropertyTranslater) {
        return InnerClassPropertyTranslater;
    }

    InnerClassPropertyTranslater = classifyV2PropertyInInnerClass(property);
    if (!!InnerClassPropertyTranslater) {
        return InnerClassPropertyTranslater;
    }

    if (RegularInnerClassTranslator.canBeTranslated(property)) {
        return new RegularInnerClassTranslator({ property });
    }
    return undefined;
}

/**
 * @deprecated
 */
export function classifyV1PropertyInInnerClass(property: arkts.AstNode): InnerClassPropertyTranslator | undefined {
    if (StateInnerClassTranslator.canBeTranslated(property)) {
        return new StateInnerClassTranslator({ property });
    }
    if (LinkInnerClassTranslator.canBeTranslated(property)) {
        return new LinkInnerClassTranslator({ property });
    }
    if (PropRefInnerClassTranslator.canBeTranslated(property)) {
        return new PropRefInnerClassTranslator({ property });
    }
    if (ProvideInnerClassTranslator.canBeTranslated(property)) {
        return new ProvideInnerClassTranslator({ property });
    }
    if (ConsumeInnerClassTranslator.canBeTranslated(property)) {
        return new ConsumeInnerClassTranslator({ property });
    }
    if (StorageLinkInnerClassTranslator.canBeTranslated(property)) {
        return new StorageLinkInnerClassTranslator({ property });
    }
    if (StoragePropRefInnerClassTranslator.canBeTranslated(property)) {
        return new StoragePropRefInnerClassTranslator({ property });
    }
    if (LocalStoragePropRefInnerClassTranslator.canBeTranslated(property)) {
        return new LocalStoragePropRefInnerClassTranslator({ property });
    }
    if (BuilderParamInnerClassTranslator.canBeTranslated(property)) {
        return new BuilderParamInnerClassTranslator({ property });
    }
    if (LocalStorageLinkInnerClassTranslator.canBeTranslated(property)) {
        return new LocalStorageLinkInnerClassTranslator({ property });
    }
    if (ObjectLinkInnerClassTranslator.canBeTranslated(property)) {
        return new ObjectLinkInnerClassTranslator({ property });
    }
    if (EnvInnerClassTranslator.canBeTranslated(property)) {
        return new EnvInnerClassTranslator({ property });
    }
    return undefined;
}

/**
 * @deprecated
 */
export function classifyV2PropertyInInnerClass(property: arkts.AstNode): InnerClassPropertyTranslator | undefined {
    if (LocalInnerClassTranslator.canBeTranslated(property)) {
        return new LocalInnerClassTranslator({ property });
    }
    if (OnceInnerClassTranslator.canBeTranslated(property)) {
        return new OnceInnerClassTranslator({ property });
    }
    if (ParamInnerClassTranslator.canBeTranslated(property)) {
        return new ParamInnerClassTranslator({ property });
    }
    if (ProviderInnerClassTranslator.canBeTranslated(property)) {
        return new ProviderInnerClassTranslator({ property });
    }
    if (ConsumerInnerClassTranslator.canBeTranslated(property)) {
        return new ConsumerInnerClassTranslator({ property });
    }
    if (EventInnerClassTranslator.canBeTranslated(property)) {
        return new EventInnerClassTranslator({ property });
    }
    return undefined;
}

/**
 * @deprecated
 */
export type ObservedTranslator = ObservedV2TraceTranslator | ObservedTrackTranslator;

/**
 * @deprecated
 */
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

/**
 * @deprecated
 */
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
    if (hasDecorator(method, DecoratorNames.SYNC_MONITOR)) {
        return new SyncMonitorTranslator({method, classInfo});
    }
    if (hasDecorator(method, DecoratorNames.COMPONENT_INIT) ||
        hasDecorator(method, DecoratorNames.COMPONENT_APPEAR) ||
        hasDecorator(method, DecoratorNames.COMPONENT_BUILT) ||
        hasDecorator(method, DecoratorNames.COMPONENT_DISAPPEAR) ||
        hasDecorator(method, DecoratorNames.COMPONENT_REUSE) ||
        hasDecorator(method, DecoratorNames.COMPONENT_RECYCLE) ||
        hasDecorator(method, DecoratorNames.COMPONENT_ACTIVE) ||
        hasDecorator(method, DecoratorNames.COMPONENT_INACTIVE)) {
        return new ComponentLifecycleTranslator({ method, classInfo });
    }
    return undefined;
}

/**
 * @deprecated
 */
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
    if (annotationInfo.hasEnv) {
        return new EnvCachedTranslator({ property, propertyInfo });
    }
    if (annotationInfo.hasCustomEnv) {
        return new CustomEnvCachedTranslator({ property, propertyInfo });
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

export function classifyPropertyInInnerClassFromInfo<T extends InnerClassPropertyTypes>(
    property: T,
    metadata?: CustomComponentInnerClassPropertyInfo
): InnerClassPropertyCachedTranslator<T> | undefined {
    const propertyInfo = metadata;
    let InnerClassPropertyTranslater: InnerClassPropertyCachedTranslator<T> | undefined;
    InnerClassPropertyTranslater = classifyV1PropertyInInnerClassFromInfo(property, propertyInfo);
    if (!!InnerClassPropertyTranslater) {
        return InnerClassPropertyTranslater;
    }
    InnerClassPropertyTranslater = classifyV2PropertyInInnerClassFromInfo(property, propertyInfo);
    if (!!InnerClassPropertyTranslater) {
        return InnerClassPropertyTranslater;
    }
    if (RegularCachedInnerClassTranslator.canBeTranslated(property, propertyInfo)) {
        return new RegularCachedInnerClassTranslator({ property, propertyInfo });
    }
    return undefined;
}

export function classifyV1PropertyInInnerClassFromInfo<T extends InnerClassPropertyTypes>(
    property: T,
    metadata?: CustomComponentInnerClassPropertyInfo
): InnerClassPropertyCachedTranslator<T> | undefined {
    const propertyInfo = metadata;
    if (StateCachedInnerClassTranslator.canBeTranslated(property, propertyInfo)) {
        return new StateCachedInnerClassTranslator({ property, propertyInfo });
    }
    if (LinkCachedInnerClassTranslator.canBeTranslated(property, propertyInfo)) {
        return new LinkCachedInnerClassTranslator({ property, propertyInfo });
    }
    if (PropRefCachedInnerClassTranslator.canBeTranslated(property, propertyInfo)) {
        return new PropRefCachedInnerClassTranslator({ property, propertyInfo });
    }
    if (ProvideCachedInnerClassTranslator.canBeTranslated(property, propertyInfo)) {
        return new ProvideCachedInnerClassTranslator({ property, propertyInfo });
    }
    if (ConsumeCachedInnerClassTranslator.canBeTranslated(property, propertyInfo)) {
        return new ConsumeCachedInnerClassTranslator({ property, propertyInfo });
    }
    if (StorageLinkCachedInnerClassTranslator.canBeTranslated(property, propertyInfo)) {
        return new StorageLinkCachedInnerClassTranslator({ property, propertyInfo });
    }
    if (StoragePropRefCachedInnerClassTranslator.canBeTranslated(property, propertyInfo)) {
        return new StoragePropRefCachedInnerClassTranslator({ property, propertyInfo });
    }
    if (LocalStoragePropRefCachedInnerClassTranslator.canBeTranslated(property, propertyInfo)) {
        return new LocalStoragePropRefCachedInnerClassTranslator({ property, propertyInfo });
    }
    if (BuilderParamCachedInnerClassTranslator.canBeTranslated(property, propertyInfo)) {
        return new BuilderParamCachedInnerClassTranslator({ property, propertyInfo });
    }
    if (LocalStorageLinkCachedInnerClassTranslator.canBeTranslated(property, propertyInfo)) {
        return new LocalStorageLinkCachedInnerClassTranslator({ property, propertyInfo });
    }
    if (ObjectLinkCachedInnerClassTranslator.canBeTranslated(property, propertyInfo)) {
        return new ObjectLinkCachedInnerClassTranslator({ property, propertyInfo });
    }
    if (EnvCachedInnerClassTranslator.canBeTranslated(property, propertyInfo)) {
        return new EnvCachedInnerClassTranslator({ property, propertyInfo });
    }
    if (CustomEnvCachedInnerClassTranslator.canBeTranslated(property, propertyInfo)) {
        return new CustomEnvCachedInnerClassTranslator({ property, propertyInfo });
    }
    return undefined;
}

export function classifyV2PropertyInInnerClassFromInfo<T extends InnerClassPropertyTypes>(
    property: T,
    metadata?: CustomComponentInnerClassPropertyInfo
): InnerClassPropertyCachedTranslator<T> | undefined {
    const propertyInfo = metadata;
    if (LocalCachedInnerClassTranslator.canBeTranslated(property, propertyInfo)) {
        return new LocalCachedInnerClassTranslator({ property, propertyInfo });
    }
    if (OnceCachedInnerClassTranslator.canBeTranslated(property, propertyInfo)) {
        return new OnceCachedInnerClassTranslator({ property, propertyInfo });
    }
    if (ParamCachedInnerClassTranslator.canBeTranslated(property, propertyInfo)) {
        return new ParamCachedInnerClassTranslator({ property, propertyInfo });
    }
    if (ProviderCachedInnerClassTranslator.canBeTranslated(property, propertyInfo)) {
        return new ProviderCachedInnerClassTranslator({ property, propertyInfo });
    }
    if (ConsumerCachedInnerClassTranslator.canBeTranslated(property, propertyInfo)) {
        return new ConsumerCachedInnerClassTranslator({ property, propertyInfo });
    }
    if (EventCachedInnerClassTranslator.canBeTranslated(property, propertyInfo)) {
        return new EventCachedInnerClassTranslator({ property, propertyInfo });
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
