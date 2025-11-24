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
import { AbstractVisitor, VisitorOptions } from '../../common/abstract-visitor';
import {
    NormalClassMethodInfo,
    NormalClassMethodRecord,
    NormalClassPropertyInfo,
    NormalClassPropertyRecord,
    NormalClassRecord,
} from './records';
import { BaseRecord } from './records/base';
import { BuiltInNames, EntryWrapperNames, NodeCacheNames } from '../../common/predefines';
import { formatBuiltInInheritPropertyName, getArkUIAnnotationNames } from './utils';
import { NormalClassMethodValidator, NormalClassPropertyValidator, ValidatorBuilder } from './validators';

export interface NormalClassCollectorOptions extends VisitorOptions {
    classRecord: NormalClassRecord;
    shouldIgnoreDecl?: boolean;
}

type RecordCollection<T extends arkts.AstNode, S extends Record<string, unknown>, U extends BaseRecord<T, S>> = {
    node: T;
    info: S;
    record: U;
};

type MethodRecordCollection = RecordCollection<arkts.MethodDefinition, NormalClassMethodInfo, NormalClassMethodRecord>;

type PropertyRecordCollection = RecordCollection<
    arkts.ClassProperty,
    NormalClassPropertyInfo,
    NormalClassPropertyRecord
>;

export class NormalClassCollector extends AbstractVisitor {
    private _classRecord: NormalClassRecord;
    public shouldIgnoreDecl: boolean;

    private _rememberedMethods: MethodRecordCollection[];
    private _rememberedProperties: PropertyRecordCollection[];

    constructor(options: NormalClassCollectorOptions) {
        super(options);
        this._classRecord = options.classRecord;
        this.shouldIgnoreDecl = options.shouldIgnoreDecl ?? false;
        this._rememberedMethods = [];
        this._rememberedProperties = [];
    }

    private canRememberPropertyFromInfo(info: NormalClassPropertyInfo): boolean {
        if (info.classInfo?.annotationInfo?.hasObserved) {
            return true;
        }
        if (info.classInfo?.annotationInfo?.hasObservedV2) {
            return true;
        }
        return false;
    }

    private canCollectPropertyFromInfo(info: NormalClassPropertyInfo): boolean {
        if (getArkUIAnnotationNames(info.annotations, info.annotationInfo).length > 0) {
            return true;
        }
        return false;
    }

    private canRememberMethodFromInfo(info: NormalClassMethodInfo): boolean {
        const kind: arkts.Es2pandaMethodDefinitionKind | undefined = info.kind;
        if (!kind) {
            return false;
        }
        return (
            kind === arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_GET ||
            kind === arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_SET
        );
    }

    private canCollectMethodFromInfo(info: NormalClassMethodInfo): boolean {
        if (info.classInfo?.name === EntryWrapperNames.WRAPPER_CLASS_NAME) {
            return true;
        }
        if (getArkUIAnnotationNames(info.annotations, info.annotationInfo).length > 0) {
            return true;
        }
        return false;
    }

    private findTrackPropertyInObservedClass(info: NormalClassPropertyInfo): boolean {
        return !!info.classInfo?.annotationInfo?.hasObserved && !!info.annotationInfo?.hasTrack;
    }

    private collectClassFromTrackProperty(classDecl: arkts.ClassDeclaration, info: NormalClassPropertyInfo): void {
        if (!info.annotationInfo?.hasTrack) {
            return;
        }
        this._classRecord.setHasTrackProperty(true);
        arkts.NodeCacheFactory.getInstance().getCache(NodeCacheNames.UI).collect(classDecl, this._classRecord.toJSON());
    }

    private collectProperty(
        node: arkts.ClassProperty,
        withInfoCallback?: (node: arkts.ClassProperty, info: NormalClassPropertyInfo) => void
    ): void {
        const propertyRecord = new NormalClassPropertyRecord({
            classRecord: this._classRecord,
            shouldIgnoreDecl: this.shouldIgnoreDecl,
        });
        propertyRecord.collect(node);

        const propertyInfo = propertyRecord.toRecord();
        if (!propertyInfo) {
            return;
        }
        if (this.canCollectPropertyFromInfo(propertyInfo)) {
            arkts.NodeCacheFactory.getInstance().getCache(NodeCacheNames.UI).collect(node, propertyRecord.toJSON());
        }
        if (this.canRememberPropertyFromInfo(propertyInfo)) {
            this._rememberedProperties.push({ info: propertyInfo, node, record: propertyRecord });
        }
        withInfoCallback?.(node, propertyInfo);
        ValidatorBuilder.build(NormalClassPropertyValidator).checkIsViolated(node, propertyInfo);
    }

    private canSkipCollectRememberProperty(info: NormalClassPropertyInfo, hasTrackInObservedClass: boolean): boolean {
        const hasObservedV2 = info.classInfo?.annotationInfo?.hasObservedV2;
        if (!!hasObservedV2) {
            return !info.annotationInfo?.hasTrace;
        }
        const hasTrack = info.annotationInfo?.hasTrack;
        const hasObserved = info.classInfo?.annotationInfo?.hasObserved;
        return !hasTrack && (!!hasTrackInObservedClass || !hasObserved);
    }

    private collectRememberedProperty(
        collection: PropertyRecordCollection,
        shouldSkip: (collection: PropertyRecordCollection) => boolean,
        withCollectCallback?: (collection: PropertyRecordCollection) => void
    ): void {
        if (shouldSkip(collection)) {
            return;
        }
        const { node, record } = collection;
        arkts.NodeCacheFactory.getInstance().getCache(NodeCacheNames.UI).collect(node, record.toJSON());
        withCollectCallback?.(collection);
    }

    private setInheritPropertyRecord(
        collection: PropertyRecordCollection,
        inheritPropertyRecords: Map<string, NormalClassPropertyRecord>
    ): Map<string, NormalClassPropertyRecord> {
        const { info, record } = collection;
        const name = info.name!;
        if (name.startsWith(BuiltInNames.IMPLEMENT_PROPETY_PREFIX)) {
            const propertyName: string = formatBuiltInInheritPropertyName(name);
            inheritPropertyRecords.set(propertyName, record);
        }
        return inheritPropertyRecords;
    }

    private collectMethod(node: arkts.MethodDefinition): void {
        const methodRecord = new NormalClassMethodRecord({
            classRecord: this._classRecord,
            shouldIgnoreDecl: this.shouldIgnoreDecl,
        });
        methodRecord.collect(node);

        const methodInfo = methodRecord.toRecord();
        if (!methodInfo) {
            return;
        }

        if (this.canCollectMethodFromInfo(methodInfo)) {
            arkts.NodeCacheFactory.getInstance().getCache(NodeCacheNames.UI).collect(node, methodRecord.toJSON());
        } else if (this.canRememberMethodFromInfo(methodInfo)) {
            this._rememberedMethods.push({ info: methodInfo, node, record: methodRecord });
        }
        ValidatorBuilder.build(NormalClassMethodValidator).checkIsViolated(node, methodInfo);
    }

    private collectRememberedMethod(
        collection: MethodRecordCollection,
        inheritPropertyRecords?: Map<string, NormalClassPropertyRecord>
    ): void {
        const { info, node, record } = collection;
        const name = info.name!;
        if (!inheritPropertyRecords?.has(name)) {
            return;
        }
        const propertyRecord = inheritPropertyRecords.get(name)!;
        const methodInfo = record.withInheritPropertyRecord(propertyRecord).toJSON();
        arkts.NodeCacheFactory.getInstance().getCache(NodeCacheNames.UI).collect(node, methodInfo);
    }

    reset(): void {
        super.reset();
        this._rememberedMethods = [];
        this._rememberedProperties = [];
    }

    visitor(node: arkts.ClassDeclaration): arkts.ClassDeclaration {
        let _hasTrackInObservedClass: boolean = false;
        let _inheritPropertyRecords: Map<string, NormalClassPropertyRecord> = new Map();
        node.definition?.body.forEach((st) => {
            if (arkts.isClassProperty(st)) {
                this.collectProperty(st, (_node, info) => {
                    this.collectClassFromTrackProperty(node, info);
                    _hasTrackInObservedClass ||= this.findTrackPropertyInObservedClass(info);
                });
            } else if (arkts.isMethodDefinition(st)) {
                this.collectMethod(st);
                st.overloads.forEach((o) => this.collectMethod(o));
            }
        });
        this._rememberedProperties.forEach((collection) => {
            this.collectRememberedProperty(
                collection,
                (c) => {
                    const { info } = c;
                    return this.canSkipCollectRememberProperty(info, _hasTrackInObservedClass);
                },
                (c) => {
                    _inheritPropertyRecords = this.setInheritPropertyRecord(c, _inheritPropertyRecords);
                }
            );
        });
        this._rememberedMethods.forEach((collection) => {
            this.collectRememberedMethod(collection, _inheritPropertyRecords);
        });
        return node;
    }
}
