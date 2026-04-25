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
import { ConsistentResourceMap, ProjectConfig, ResourceInfo, UIComponents, RouterInfo } from './plugin-context';
import { ImportInfo, collectFileImportsByProgram } from './import-info';

export class MetaDataCollector {
    public resourceInfo: ResourceInfo | undefined;
    public projectConfig: ProjectConfig | undefined;
    public fileAbsName: string | undefined;
    public externalSourceName: string | undefined;
    public routerInfo: Map<string, RouterInfo[]> = new Map<string, RouterInfo[]>();
    public componentsInfo: UIComponents | undefined;
    public consistentResourceMap: ConsistentResourceMap | undefined;
    public mainPageNames: string[] | undefined;
    private importsInfoCache: ImportInfo | undefined;
    private static instance: MetaDataCollector | null = null;

    static getInstance(): MetaDataCollector {
        if (!this.instance) {
            this.instance = new MetaDataCollector();
        }
        return this.instance;
    }

    setProjectConfig(config: ProjectConfig | undefined): this {
        this.projectConfig = config;
        return this;
    }

    setAbsName(fileName: string | undefined): this {
        this.fileAbsName = fileName;
        return this;
    }

    setExternalSourceName(externalSourceName: string | undefined): this {
        this.externalSourceName = externalSourceName;
        return this;
    }

    setRouterInfo(routerInfo: Map<string, RouterInfo[]>): this {
        this.routerInfo = routerInfo;
        return this;
    }

    setResourceInfo(resourceInfo: ResourceInfo | undefined): this {
        this.resourceInfo = resourceInfo;
        return this;
    }

    setComponentsInfo(componentsInfo: UIComponents | undefined): this {
        this.componentsInfo = componentsInfo;
        return this;
    }

    setConsistentResourceMap(resourceMap: ConsistentResourceMap | undefined): this {
        this.consistentResourceMap = resourceMap;
        return this;
    }

    setMainPages(mainPages: string[] | undefined): this {
        this.mainPageNames = mainPages;
        return this;
    }

    setImportsInfo(importsInfoCache: ImportInfo | undefined): this {
        this.importsInfoCache = importsInfoCache;
        return this;
    }

    getImportsInfo(program: arkts.Program | undefined): ImportInfo | undefined {
        if (!program) {
            return undefined;
        }
        if (this.importsInfoCache && this.fileAbsName === program.absName) {
            return this.importsInfoCache;
        }
        this.importsInfoCache = collectFileImportsByProgram(program);
        return this.importsInfoCache;
    }

    reset(): void {
        this.projectConfig = undefined;
        this.fileAbsName = undefined;
        this.externalSourceName = undefined;
        this.routerInfo.clear();
        this.resourceInfo = undefined;
        this.componentsInfo = undefined;
        this.consistentResourceMap = undefined;
        this.mainPageNames = undefined;
        this.importsInfoCache = undefined;
    }
}