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
import { PluginTestContext, PluginTester } from '../../../../utils/plugin-tester';
import { BuildConfig, mockBuildConfig } from '../../../../utils/artkts-config';
import { getRootPath, MOCK_ENTRY_DIR_PATH } from '../../../../utils/path-config';
import { parseDumpSrc } from '../../../../utils/parse-string';
import { uiNoRecheck } from '../../../../utils/plugins';
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
import { __memo_id_type as __memo_id_type } from "@ohos.arkui.stateManagement";
import { __memo_context_type as __memo_context_type } from "@ohos.arkui.stateManagement";
import { memo as memo } from "@ohos.arkui.stateManagement";
import { StateDecoratedVariable as StateDecoratedVariable } from "@ohos.arkui.stateManagement";
import { DecoratedV1VariableBase as DecoratedV1VariableBase } from "@ohos.arkui.stateManagement";
import { LinkDecoratedVariable as LinkDecoratedVariable } from "@ohos.arkui.stateManagement";
import { DatePickerAttribute as DatePickerAttribute } from "@ohos.arkui.component";
import { ButtonAttribute as ButtonAttribute } from "@ohos.arkui.component";
import { ColumnAttribute as ColumnAttribute } from "@ohos.arkui.component";
import { EntryPoint as EntryPoint } from "@ohos.arkui.component";
import { CustomComponent as CustomComponent } from "@ohos.arkui.component";
import { Component as Component, Entry as Entry, Column as Column, Button as Button, DatePicker as DatePicker } from "@ohos.arkui.component";
import { Link as Link, State as State } from "@ohos.arkui.stateManagement";

function main() {}

@Component({freezeWhenInactive:false}) final class DateComponent extends CustomComponent<DateComponent, __Options_DateComponent> {
  public __initializeStruct(initializers: __Options_DateComponent | undefined, @memo() content: (()=> void) | undefined): void {
    if (({let gensym___164314175 = initializers;
    (((gensym___164314175) == (null)) ? undefined : gensym___164314175.__backing_selectedDate)})) {
      (this).__backing_selectedDate = new LinkDecoratedVariable<Date>("selectedDate", initializers!.__backing_selectedDate!);
    };
  }
  public __updateStruct(initializers: __Options_DateComponent | undefined): void {}
  private __backing_selectedDate?: LinkDecoratedVariable<Date>;
  public get selectedDate(): Date {
    return (this).__backing_selectedDate!.get();
  }
  public set selectedDate(value: Date) {
    (this).__backing_selectedDate!.set(value);
  }
  @memo() public _build(@memo() style: ((instance: DateComponent)=> DateComponent) | undefined, @memo() content: (()=> void) | undefined, initializers: __Options_DateComponent | undefined): void {
    Column(undefined, undefined, (() => {
      Button(((instance: ButtonAttribute): void => {
        instance.onClick((() => {
          (this).selectedDate.setFullYear((((this).selectedDate.getFullYear()) + (1)));
        }));
        return;
      }), "child increase the year by 1", undefined, undefined);
      Button(((instance: ButtonAttribute): void => {
        instance.margin(10).onClick((() => {
          (this).selectedDate = new Date("2023-09-09");
        }));
        return;
      }), "child update the new date", undefined, undefined);
      DatePicker(undefined, {
        start: new Date("1970-1-1"),
        end: new Date("2100-1-1"),
        selected: (this).selectedDate,
      }, undefined);
    }));
  }
  public constructor() {}
  
}

@Entry({useSharedStorage:false,storage:"",routeName:""}) @Component({freezeWhenInactive:false}) final class ParentComponent extends CustomComponent<ParentComponent, __Options_ParentComponent> {
  public __initializeStruct(initializers: __Options_ParentComponent | undefined, @memo() content: (()=> void) | undefined): void {
    (this).__backing_parentSelectedDate = new StateDecoratedVariable<Date>("parentSelectedDate", ((({let gensym___80922148 = initializers;
    (((gensym___80922148) == (null)) ? undefined : gensym___80922148.parentSelectedDate)})) ?? (new Date("2021-08-08"))));
  }
  public __updateStruct(initializers: __Options_ParentComponent | undefined): void {}
  private __backing_parentSelectedDate?: StateDecoratedVariable<Date>;
  public get parentSelectedDate(): Date {
    return (this).__backing_parentSelectedDate!.get();
  }
  public set parentSelectedDate(value: Date) {
    (this).__backing_parentSelectedDate!.set(value);
  }
  @memo() public _build(@memo() style: ((instance: ParentComponent)=> ParentComponent) | undefined, @memo() content: (()=> void) | undefined, initializers: __Options_ParentComponent | undefined): void {
    Column(undefined, undefined, (() => {
      Button(((instance: ButtonAttribute): void => {
        instance.margin(10).onClick((() => {
          (this).parentSelectedDate.setMonth((((this).parentSelectedDate.getMonth()) + (1)));
        }));
        return;
      }), "parent increase the month by 1", undefined, undefined);
      Button(((instance: ButtonAttribute): void => {
        instance.margin(10).onClick((() => {
          (this).parentSelectedDate = new Date("2023-07-07");
        }));
        return;
      }), "parent update the new date", undefined, undefined);
      DatePicker(undefined, {
        start: new Date("1970-1-1"),
        end: new Date("2100-1-1"),
        selected: (this).parentSelectedDate,
      }, undefined);
      DateComponent._instantiateImpl(undefined, (() => {
        return new DateComponent();
      }), ({
        __backing_selectedDate: (this).__backing_parentSelectedDate,
      } as __Options_DateComponent), undefined, undefined);
    }));
  }
  public constructor() {}
}

interface __Options_DateComponent {
  abstract set selectedDate(selectedDate: Date | undefined)
  abstract get selectedDate(): Date | undefined
  abstract set __backing_selectedDate(__backing_selectedDate: DecoratedV1VariableBase<Date> | undefined)
  abstract get __backing_selectedDate(): DecoratedV1VariableBase<Date> | undefined
}

interface __Options_ParentComponent {
  abstract set parentSelectedDate(parentSelectedDate: Date | undefined)
  abstract get parentSelectedDate(): Date | undefined
  abstract set __backing_parentSelectedDate(__backing_parentSelectedDate: StateDecoratedVariable<Date> | undefined)
  abstract get __backing_parentSelectedDate(): StateDecoratedVariable<Date> | undefined
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
    [parsedTransform, uiNoRecheck],
    {
        checked: [testParsedAndCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
