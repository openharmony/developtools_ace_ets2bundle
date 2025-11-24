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
import { getAnnotationName } from '../../utils';
import { BaseRecord, RecordOptions } from '../base';

export type Annotations = {
    [K in string]?: arkts.AnnotationUsage;
};

export type AnnotationInfo = {
    [K in string as `has${K}`]?: boolean;
};

export type AnnotationRecord<U extends Annotations, V extends AnnotationInfo> = {
    annotations?: U;
    annotationInfo?: V;
    ignoredAnnotations?: Annotations;
    ignoredAnnotationInfo?: AnnotationInfo;
};

function firstToLower(str: string): string {
    return str.charAt(0).toLowerCase() + str.slice(1);
}

export abstract class BaseAnnotationRecord<
    U extends Annotations = Annotations,
    V extends AnnotationInfo = AnnotationInfo,
> extends BaseRecord<arkts.AnnotationUsage, AnnotationRecord<U, V>> {
    protected abstract annotationNames: string[];
    protected _annotations: U = {} as U;
    protected _annotationInfo: V = {} as V;

    protected _ignoredAnnotations: Annotations = {};
    protected _ignoredAnnotationInfo: AnnotationInfo = {};

    private _allAnnotationsAsIgnored: boolean = false;

    constructor(options: RecordOptions) {
        super(options);
    }

    withAllAnnotationsAsIgnored(): this {
        this._allAnnotationsAsIgnored = true;
        return this;
    }

    public get annotations(): U | undefined {
        if (Object.keys(this._annotations).length === 0) {
            return undefined;
        }
        return this._annotations;
    }

    public get annotationInfo(): V | undefined {
        if (Object.keys(this._annotationInfo).length === 0) {
            return undefined;
        }
        return this._annotationInfo;
    }

    public get ignoredAnnotations(): Annotations | undefined {
        if (Object.keys(this._ignoredAnnotations).length === 0) {
            return undefined;
        }
        return this._ignoredAnnotations;
    }

    public get ignoredAnnotationInfo(): AnnotationInfo | undefined {
        if (Object.keys(this._ignoredAnnotationInfo).length === 0) {
            return undefined;
        }
        return this._ignoredAnnotationInfo;
    }

    private updateAnnotationInfo(name: string | undefined): void {
        const newInfo = this.updateAnnotationInfoByName(this._annotationInfo, name);
        this._annotationInfo = newInfo;
    }

    private updateAnnotations(anno: arkts.AnnotationUsage, name: string | undefined): void {
        if (!!name && !!this._annotationInfo[`has${name}`] && !this._annotations[name]) {
            this._annotations = { ...this._annotations, [name]: anno };
        }
    }

    private updateIgnoreAnnotationInfo(name: string | undefined): void {
        if (!!name && !this.annotationNames.includes(name)) {
            this._ignoredAnnotationInfo[`has${name}`] = true;
        }
    }

    private updateIgnoreAnnotations(anno: arkts.AnnotationUsage, name: string | undefined): void {
        if (!!name && !!this._ignoredAnnotationInfo[`has${name}`] && !this._ignoredAnnotations[name]) {
            this._ignoredAnnotations = { ...this._ignoredAnnotations, [name]: anno };
        }
    }

    collectFromNode(node: arkts.AnnotationUsage): void {
        const name = getAnnotationName(node, this.shouldIgnoreDecl);
        if (!this._allAnnotationsAsIgnored) {
            this.updateAnnotationInfo(name);
            this.updateAnnotations(node, name);
        }
        this.updateIgnoreAnnotationInfo(name);
        this.updateIgnoreAnnotations(node, name);
    }

    refreshOnce(): void {
        const currInfo: AnnotationRecord<U, V> = {
            ...this.info,
            ...(this.annotations && { annotations: this.annotations }),
            ...(this.annotationInfo && { annotationInfo: this.annotationInfo }),
            ...(this.ignoredAnnotations && { ignoredAnnotations: this.ignoredAnnotations }),
            ...(this.ignoredAnnotationInfo && { ignoredAnnotationInfo: this.ignoredAnnotationInfo }),
        };
        this.info = currInfo;
    }

    toJSON(): AnnotationRecord<U, V> {
        this.refresh();
        return {
            ...(this.info?.annotationInfo && { annotationInfo: this.info.annotationInfo }),
        };
    }

    abstract updateAnnotationInfoByName(info: V, name: string | undefined): V;
}
