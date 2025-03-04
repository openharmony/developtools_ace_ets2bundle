"use strict";
/*
 * Copyright (c) 2022-2023 Huawei Device Co., Ltd.
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceHolder = void 0;
class ResourceHolder {
    constructor() {
        this.resources = new Map();
    }
    static instance() {
        if (ResourceHolder._instance == undefined) {
            ResourceHolder._instance = new ResourceHolder();
        }
        return ResourceHolder._instance;
    }
    hold(resourceId) {
        if (!this.resources.has(resourceId))
            throw new Error(`Resource ${resourceId} does not exists, can not hold`);
        this.resources.get(resourceId).holdersCount++;
    }
    release(resourceId) {
        if (!this.resources.has(resourceId))
            throw new Error(`Resource ${resourceId} does not exists, can not release`);
        const resource = this.resources.get(resourceId);
        resource.holdersCount--;
        if (resource.holdersCount <= 0)
            this.resources.delete(resourceId);
    }
    registerAndHold(resource) {
        const resourceId = ResourceHolder.nextResourceId++;
        this.resources.set(resourceId, {
            resource: resource,
            holdersCount: 1,
        });
        return resourceId;
    }
    get(resourceId) {
        if (!this.resources.has(resourceId))
            throw new Error(`Resource ${resourceId} does not exists`);
        return this.resources.get(resourceId).resource;
    }
    has(resourceId) {
        return this.resources.has(resourceId);
    }
}
exports.ResourceHolder = ResourceHolder;
ResourceHolder.nextResourceId = 100;
ResourceHolder._instance = undefined;
//# sourceMappingURL=ResourceManager.js.map