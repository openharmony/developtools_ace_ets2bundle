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
import { recheck, uiNoRecheck } from '../../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../../utils/shared-types';
import { uiTransform } from '../../../../../ui-plugins';
import { Plugins } from '../../../../../common/plugin-context';

const BUILDER_LAMBDA_DIR_PATH: string = 'decorators/link';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, BUILDER_LAMBDA_DIR_PATH, 'state-to-link.ets'),
];

const pluginTester = new PluginTester('test @Link decorated variables passing', buildConfig);

const parsedTransform: Plugins = {
    name: 'state-to-link',
    parsed: uiTransform().parsed
};

const expectedScript: string = `
import { IStateDecoratedVariable as IStateDecoratedVariable } from "arkui.stateManagement.decorator";

import { STATE_MGMT_FACTORY as STATE_MGMT_FACTORY } from "arkui.stateManagement.decorator";

import { LinkSourceType as LinkSourceType } from "arkui.stateManagement.decorator";

import { ILinkDecoratedVariable as ILinkDecoratedVariable } from "arkui.stateManagement.decorator";

import { memo as memo } from "arkui.stateManagement.runtime";

import { ButtonAttribute as ButtonAttribute } from "arkui.component.button";

import { NavInterface as NavInterface } from "arkui.UserView";

import { PageLifeCycle as PageLifeCycle } from "arkui.component.customComponent";

import { EntryPoint as EntryPoint } from "arkui.UserView";


import { CustomComponent as CustomComponent } from "arkui.component.customComponent";

import { Component as Component, Entry as Entry, Column as Column, Button as Button, DatePicker as DatePicker, ClickEvent as ClickEvent } from "@ohos.arkui.component";

import { Link as Link, State as State } from "@ohos.arkui.stateManagement";

function main() {}

__EntryWrapper.RegisterNamedRouter("", new __EntryWrapper(), ({
  bundleName: "com.example.mock",
  moduleName: "entry",
  pagePath: "../../../decorators/link/state-to-link",
  pageFullPath: "test/demo/mock/decorators/link/state-to-link",
  integratedHsp: "false",
  } as NavInterface));

@Component() final struct DateComponent extends CustomComponent<DateComponent, __Options_DateComponent> {
  public __initializeStruct(initializers: (__Options_DateComponent | undefined), @memo() content: ((()=> void) | undefined)): void {
    if (({let gensym___164314175 = initializers;
    (((gensym___164314175) == (null)) ? undefined : gensym___164314175.__backing_selectedDate)})) {
      this.__backing_selectedDate = STATE_MGMT_FACTORY.makeLink<Date>(this, "selectedDate", initializers!.__backing_selectedDate!);
    };
  }

  public __updateStruct(initializers: (__Options_DateComponent | undefined)): void {}

  private __backing_selectedDate?: ILinkDecoratedVariable<Date>;

  public get selectedDate(): Date {
    return this.__backing_selectedDate!.get();
  }

  public set selectedDate(value: Date) {
    this.__backing_selectedDate!.set(value);
  }

  @memo() public build() {
    Column(undefined, undefined, @memo() (() => {
      Button(@memo() ((instance: ButtonAttribute): void => {
        instance.onClick(((e: ClickEvent) => {
          this.selectedDate.setFullYear(((this.selectedDate.getFullYear()) + (1)));
        }));
        return;
      }), "child increase the year by 1", undefined, undefined);
      Button(@memo() ((instance: ButtonAttribute): void => {
        instance.margin(10).onClick(((e: ClickEvent) => {
          this.selectedDate = new Date("2023-09-09");
        }));
        return;
      }), "child update the new date", undefined, undefined);
      DatePicker(undefined, {
        start: new Date("1970-1-1"),
        end: new Date("2100-1-1"),
        selected: this.selectedDate,
      }, undefined);
    }));
  }

  public constructor() {}
  
}

@Entry({useSharedStorage:false,storage:"",routeName:""}) @Component() final struct ParentComponent extends CustomComponent<ParentComponent, __Options_ParentComponent> implements PageLifeCycle {
  public __initializeStruct(initializers: (__Options_ParentComponent | undefined), @memo() content: ((()=> void) | undefined)): void {
    this.__backing_parentSelectedDate = STATE_MGMT_FACTORY.makeState<Date>(this, "parentSelectedDate", ((({let gensym___80922148 = initializers;
    (((gensym___80922148) == (null)) ? undefined : gensym___80922148.parentSelectedDate)})) ?? (new Date("2021-08-08"))));
  }

  public __updateStruct(initializers: (__Options_ParentComponent | undefined)): void {}

  private __backing_parentSelectedDate?: IStateDecoratedVariable<Date>;

  public get parentSelectedDate(): Date {
    return this.__backing_parentSelectedDate!.get();
  }

  public set parentSelectedDate(value: Date) {
    this.__backing_parentSelectedDate!.set(value);
  }

  @memo() public build() {
    Column(undefined, undefined, @memo() (() => {
      Button(@memo() ((instance: ButtonAttribute): void => {
        instance.margin(10).onClick(((e: ClickEvent) => {
          this.parentSelectedDate.setMonth(((this.parentSelectedDate.getMonth()) + (1)));
        }));
        return;
      }), "parent increase the month by 1", undefined, undefined);
      Button(@memo() ((instance: ButtonAttribute): void => {
        instance.margin(10).onClick(((e: ClickEvent) => {
          this.parentSelectedDate = new Date("2023-07-07");
        }));
        return;
      }), "parent update the new date", undefined, undefined);
      DatePicker(undefined, {
        start: new Date("1970-1-1"),
        end: new Date("2100-1-1"),
        selected: this.parentSelectedDate,
      }, undefined);
      DateComponent._instantiateImpl(undefined, (() => {
        return new DateComponent();
      }), {
        __backing_selectedDate: this.__backing_parentSelectedDate,
      }, undefined, undefined);
    }));
  }

  public constructor() {}

}

@Retention({policy:"SOURCE"}) @interface __Link_intrinsic {}

@Component() export interface __Options_DateComponent {
  @__Link_intrinsic() set selectedDate(selectedDate: (Date | undefined))

  @__Link_intrinsic() get selectedDate(): (Date | undefined)
  set __backing_selectedDate(__backing_selectedDate: (LinkSourceType<Date> | undefined))

  get __backing_selectedDate(): (LinkSourceType<Date> | undefined)

}

@Entry({useSharedStorage:false,storage:"",routeName:""}) @Component() export interface __Options_ParentComponent {
  set parentSelectedDate(parentSelectedDate: (Date | undefined))

  get parentSelectedDate(): (Date | undefined)
  set __backing_parentSelectedDate(__backing_parentSelectedDate: (IStateDecoratedVariable<Date> | undefined))

  get __backing_parentSelectedDate(): (IStateDecoratedVariable<Date> | undefined)

}

class __EntryWrapper extends EntryPoint {
  @memo() public entry(): void {
    ParentComponent._instantiateImpl(undefined, (() => {
      return new ParentComponent();
    }), undefined, undefined, undefined);
  }

  public constructor() {}

}
`;

function testParsedAndCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test @Link decorated variables passing',
    [parsedTransform, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testParsedAndCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
