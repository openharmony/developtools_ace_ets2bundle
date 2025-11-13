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

import { createGetter, createSetter, hasDecorator } from './utils';
import { PropertyCachedTranslator, PropertyTranslator } from './base';
import { backingField, expectName } from '../../common/arkts-utils';
import { isStatic } from '../utils';
import { DecoratorNames } from '../../common/predefines';
import { StructPropertyInfo } from '../../collectors/ui-collectors/records';

export class StaticPropertyTranslator extends PropertyTranslator {
    protected hasInitializeStruct: boolean = false;
    protected hasUpdateStruct: boolean = false;
    protected hasToRecord: boolean = false;
    protected hasField: boolean = true;
    protected hasGetter: boolean = false;
    protected hasSetter: boolean = false;

    translateMember(): arkts.AstNode[] {
        const originalName: string = expectName(this.property.key);
        const newName: string = backingField(originalName);
        return this.translateWithoutInitializer(newName, originalName);
    }

    field(newName: string, originalName?: string, metadata?: arkts.AstNodeCacheValueMetadata): arkts.ClassProperty {
        return this.property;
    }

    getter(newName: string, originalName: string, metadata?: arkts.AstNodeCacheValueMetadata): arkts.MethodDefinition {
        throw new Error(`static property ${originalName} has no getter.`);
    }

    setter(newName: string, originalName: string, metadata?: arkts.AstNodeCacheValueMetadata): arkts.MethodDefinition {
        throw new Error(`static property ${originalName} has no setter.`);
    }

    initializeStruct(
        newName: string,
        originalName: string,
        metadata?: arkts.AstNodeCacheValueMetadata
    ): arkts.Statement | undefined {
        return undefined;
    }

    static canBeStaticTranslate(node: arkts.ClassProperty): boolean {
        return isStatic(node) && !hasDecorator(node, DecoratorNames.LOCAL);
    }
}

export class StaticPropertyCachedTranslator extends PropertyCachedTranslator {
    translateMember(): arkts.AstNode[] {
        if (!this.propertyInfo || !this.propertyInfo.structInfo) {
            return [];
        }
        if (!this.propertyInfo.name) {
            return [];
        }
        const originalName = this.propertyInfo.name;
        const newName: string = backingField(originalName);
        const res = this.translateWithoutInitializer(newName, originalName);
        return res;
    }

    protected cacheTranslatedInitializer(
        newName: string,
        originalName: string,
        metadata?: arkts.AstNodeCacheValueMetadata
    ): void {}

    protected translateWithoutInitializer(
        newName: string,
        originalName: string,
        metadata?: arkts.AstNodeCacheValueMetadata
    ): arkts.AstNode[] {
        const field = this.field(newName, originalName, metadata);
        return [field];
    }

    field(newName: string, originalName?: string, metadata?: arkts.AstNodeCacheValueMetadata): arkts.ClassProperty {
        return this.property;
    }

    getter(newName: string, originalName: string, metadata?: arkts.AstNodeCacheValueMetadata): arkts.MethodDefinition {
        throw new Error(`static property ${originalName} has no getter.`);
    }

    setter(newName: string, originalName: string, metadata?: arkts.AstNodeCacheValueMetadata): arkts.MethodDefinition {
        throw new Error(`static property ${originalName} has no setter.`);
    }

    initializeStruct(
        newName: string,
        originalName: string,
        metadata?: arkts.AstNodeCacheValueMetadata
    ): arkts.Statement | undefined {
        return undefined;
    }

    static canBeStaticTranslate(node: arkts.ClassProperty, propertyInfo: StructPropertyInfo): boolean {
        return isStatic(node) && !propertyInfo.annotationInfo?.hasLocal;
    }
}
