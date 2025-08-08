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
import { GetSetDumper, dumpGetterSetter, dumpAnnotation } from '../../../../utils/simplify-dump';
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

import { ColumnAttribute as ColumnAttribute } from "arkui.component.column";

import { DatePickerAttribute as DatePickerAttribute } from "arkui.component.datePicker";

import { DatePickerImpl as DatePickerImpl } from "arkui.component.datePicker";

import { Memo as Memo } from "arkui.incremental.annotation";

import { ButtonAttribute as ButtonAttribute } from "arkui.component.button";

import { ButtonImpl as ButtonImpl } from "arkui.component.button";

import { ColumnImpl as ColumnImpl } from "arkui.component.column";

import { NavInterface as NavInterface } from "arkui.component.customComponent";

import { PageLifeCycle as PageLifeCycle } from "arkui.component.customComponent";

import { EntryPoint as EntryPoint } from "arkui.component.customComponent";

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
  public __initializeStruct(initializers: (__Options_DateComponent | undefined), @Memo() content: ((()=> void) | undefined)): void {
    if (({let gensym___27735436 = initializers;
    (((gensym___27735436) == (null)) ? undefined : gensym___27735436.__options_has_selectedDate)})) {
      this.__backing_selectedDate = STATE_MGMT_FACTORY.makeLink<Date>(this, "selectedDate", initializers!.__backing_selectedDate!);
    }
  }
  
  public __updateStruct(initializers: (__Options_DateComponent | undefined)): void {}
  
  private __backing_selectedDate?: ILinkDecoratedVariable<Date>;
  
  public get selectedDate(): Date {
    return this.__backing_selectedDate!.get();
  }
  
  public set selectedDate(value: Date) {
    this.__backing_selectedDate!.set(value);
  }
  
  @Memo() 
  public build() {
    ColumnImpl(@Memo() ((instance: ColumnAttribute): void => {
      instance.setColumnOptions(undefined).applyAttributesFinish();
      return;
    }), @Memo() (() => {
      ButtonImpl(@Memo() ((instance: ButtonAttribute): void => {
        instance.setButtonOptions("child increase the year by 1", undefined).onClick(((e: ClickEvent) => {
          this.selectedDate.setFullYear(((this.selectedDate.getFullYear()) + (1)));
        })).applyAttributesFinish();
        return;
      }), undefined);
      ButtonImpl(@Memo() ((instance: ButtonAttribute): void => {
        instance.setButtonOptions("child update the new date", undefined).margin(10).onClick(((e: ClickEvent) => {
          this.selectedDate = new Date("2023-09-09");
        })).applyAttributesFinish();
        return;
      }), undefined);
      DatePickerImpl(@Memo() ((instance: DatePickerAttribute): void => {
        instance.setDatePickerOptions({
          start: new Date("1970-1-1"),
          end: new Date("2100-1-1"),
          selected: this.selectedDate,
        }).applyAttributesFinish();
        return;
      }), undefined);
    }));
  }
  
  public constructor() {}

  static {
  
  }
}

@Entry({useSharedStorage:false,storage:"",routeName:""}) @Component() final struct ParentComponent extends CustomComponent<ParentComponent, __Options_ParentComponent> implements PageLifeCycle {
  public __initializeStruct(initializers: (__Options_ParentComponent | undefined), @Memo() content: ((()=> void) | undefined)): void {
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
  
  @Memo() 
  public build() {
    ColumnImpl(@Memo() ((instance: ColumnAttribute): void => {
      instance.setColumnOptions(undefined).applyAttributesFinish();
      return;
    }), @Memo() (() => {
      ButtonImpl(@Memo() ((instance: ButtonAttribute): void => {
        instance.setButtonOptions("parent increase the month by 1", undefined).margin(10).onClick(((e: ClickEvent) => {
          this.parentSelectedDate.setMonth(((this.parentSelectedDate.getMonth()) + (1)));
        })).applyAttributesFinish();
        return;
      }), undefined);
      ButtonImpl(@Memo() ((instance: ButtonAttribute): void => {
        instance.setButtonOptions("parent update the new date", undefined).margin(10).onClick(((e: ClickEvent) => {
          this.parentSelectedDate = new Date("2023-07-07");
        })).applyAttributesFinish();
        return;
      }), undefined);
      DatePickerImpl(@Memo() ((instance: DatePickerAttribute): void => {
        instance.setDatePickerOptions({
          start: new Date("1970-1-1"),
          end: new Date("2100-1-1"),
          selected: this.parentSelectedDate,
        }).applyAttributesFinish();
        return;
      }), undefined);
      DateComponent._instantiateImpl(undefined, (() => {
        return new DateComponent();
      }), {
        __backing_selectedDate: this.__backing_parentSelectedDate,
        __options_has_selectedDate: true,
      }, undefined, undefined);
    }));
  }
  
  public constructor() {}

  static {
  
  }
}

class __EntryWrapper extends EntryPoint {
  @Memo() 
  public entry(): void {
    ParentComponent._instantiateImpl(undefined, (() => {
      return new ParentComponent();
    }), undefined, undefined, undefined);
  }
  
  public constructor() {}
  
}

@Component() export interface __Options_DateComponent {
  ${dumpGetterSetter(GetSetDumper.BOTH, 'selectedDate', '(Date | undefined)', [dumpAnnotation('Link')])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_selectedDate', '(LinkSourceType<Date> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_selectedDate', '(boolean | undefined)')}
  
}

@Entry({useSharedStorage:false,storage:"",routeName:""}) @Component() export interface __Options_ParentComponent {
  ${dumpGetterSetter(GetSetDumper.BOTH, 'parentSelectedDate', '(Date | undefined)', [dumpAnnotation('State')])}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__backing_parentSelectedDate', '(IStateDecoratedVariable<Date> | undefined)')}
  ${dumpGetterSetter(GetSetDumper.BOTH, '__options_has_parentSelectedDate', '(boolean | undefined)')}
  
}
`;

function testParsedAndCheckedTransformer(this: PluginTestContext): void {
    expect(parseDumpSrc(this.scriptSnapshot ?? '')).toBe(parseDumpSrc(expectedScript));
}

pluginTester.run(
    'test @Link decorated variables passing',
    [parsedTransform, beforeUINoRecheck, uiNoRecheck, recheck],
    {
        'checked:ui-no-recheck': [testParsedAndCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
