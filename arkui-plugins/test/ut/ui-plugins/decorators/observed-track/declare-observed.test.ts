/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as path from 'path';
import { PluginTester } from '../../../../utils/plugin-tester';
import { mockBuildConfig } from '../../../../utils/artkts-config';
import { getRootPath, MOCK_ENTRY_DIR_PATH } from '../../../../utils/path-config';
import { parseDumpSrc } from '../../../../utils/parse-string';
import { beforeUINoRecheck, recheck, uiNoRecheck } from '../../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../../utils/shared-types';
import { uiTransform } from '../../../../../ui-plugins';
import { Plugins } from '../../../../../common/plugin-context';

const OBSERVED_DIR_PATH: string = 'decorators/observed-track';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, OBSERVED_DIR_PATH, 'declare-observed.ets'),
];

const declaredObservedClassTransform: Plugins = {
    name: 'declaredObservedClass',
    parsed: uiTransform().parsed,
}

const pluginTester = new PluginTester('test declared observed class', buildConfig);

const expectedScript: string = `
import { ISubscribedWatches as ISubscribedWatches } from "arkui.stateManagement.decorator";

import { IObservedObject as IObservedObject } from "arkui.stateManagement.decorator";

import { RenderIdType as RenderIdType } from "arkui.stateManagement.decorator";

import { WatchIdType as WatchIdType } from "arkui.stateManagement.decorator";

import { Observed as Observed, Track as Track } from "@ohos.arkui.stateManagement";

function main() {}


@Observed() export declare class A implements IObservedObject, ISubscribedWatches {
  public addWatchSubscriber(watchId: WatchIdType): void
  
  public removeWatchSubscriber(watchId: WatchIdType): boolean
  
  public executeOnSubscribingWatches(propertyName: string): void
  
  public setV1RenderId(renderId: RenderIdType): void
  
  public hasTrackA: number;
  public noTrack: number;
  public constructor()
  
}

export declare class B implements IObservedObject, ISubscribedWatches {
  public addWatchSubscriber(watchId: WatchIdType): void
  
  public removeWatchSubscriber(watchId: WatchIdType): boolean
  
  public executeOnSubscribingWatches(propertyName: string): void
  
  public setV1RenderId(renderId: RenderIdType): void
  
  @Track() public hasTrackB: number;
  public constructor()
  
}

@Observed() export declare class C implements IObservedObject, ISubscribedWatches {
  public addWatchSubscriber(watchId: WatchIdType): void
  
  public removeWatchSubscriber(watchId: WatchIdType): boolean
  
  public executeOnSubscribingWatches(propertyName: string): void
  
  public setV1RenderId(renderId: RenderIdType): void
  
  @Track() public hasTrackC: number;
  public constructor(hasTrackC: number)
  
}
`;

function testDeclaredObservedClassTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test declared observed class transform',
    [declaredObservedClassTransform, beforeUINoRecheck, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testDeclaredObservedClassTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
