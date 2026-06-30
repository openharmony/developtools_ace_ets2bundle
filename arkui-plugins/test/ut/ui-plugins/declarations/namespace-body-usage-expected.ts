const namespace_expectedUIScript: string = `
import { __memo_context_type, __memo_id_type } from "arkui.incremental.runtime.state";

import { WatchIdType } from "arkui.stateManagement.decorator";

import { RenderIdType } from "arkui.stateManagement.decorator";

import { IObservedObject } from "arkui.stateManagement.decorator";

import { ISubscribedWatches } from "arkui.stateManagement.decorator";

import { Memo } from "arkui.incremental.annotation";

import { MemoIntrinsic } from "arkui.incremental.annotation";

import { LinkSourceType } from "arkui.stateManagement.decorator";

import { IStateDecoratedVariable } from "arkui.stateManagement.decorator";

import { ILocalDecoratedVariable } from "arkui.stateManagement.decorator";

import { IParamDecoratedVariable } from "arkui.stateManagement.decorator";

import { Memo } from "arkui.incremental.annotation";

import { ComponentBuilder } from "arkui.component.builder";

import { LocalStorage } from "arkui.stateManagement.storage.localStorage";

import { Builder } from "arkui.component.builder";

import { CustomComponent } from "arkui.component.customComponent";

import { ReusePoolOwnership } from "arkui.component.customComponent";

import { CustomComponentV2 } from "arkui.component.customComponent";

import { BaseCustomDialog } from "arkui.component.customComponent";

import { PageLifeCycle } from "arkui.component.customComponent";

import { CustomDialog, Component, ComponentV2, Entry, BuilderParam, Column, CustomDialogController, Resource, WrappedBuilder, Builder, $r, $rawfile, Resource, AnimatableExtend, TextAttribute, wrapBuilder } from "@ohos.arkui.component";

import { Observed, ObservedV2, Track, Trace, Monitor, Computed, State, Link, Local, Param, Require } from "@ohos.arkui.stateManagement";


export default declare namespace aNamespaceWithBody {
  public static EXPORT_RESOURCE: Resource;
  public static EXPORT_RAWFILE: Resource;
  public static EXPORT_WRAPPED_BUILDER: WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)>;
  public static EXPORT_RESOURCE_WITH_BODY: Resource = $r("app.string.app_icon");
  public static EXPORT_RAWFILE_WITH_BODY: Resource = $rawfile("app.mock.txt");
  @Builder() 
  @Memo() 
  function wrappedBuilder(__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number): void
  
  public static EXPORT_WRAPPED_BUILDER_WITH_BODY: WrappedBuilder<@Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, value: string, size: number)=> void)> = wrapBuilder(wrappedBuilder);
  interface IO {
    get t1(): number
    set t1(t1: number)
    
  }
  
  @Observed() class ExportObserved implements IObservedObject, ISubscribedWatches {
    public addWatchSubscriber(watchId: WatchIdType): void
    
    public removeWatchSubscriber(watchId: WatchIdType): boolean
    
    public executeOnSubscribingWatches(propertyName: string): void
    
    public setV1RenderId(renderId: RenderIdType): void
    
    @JSONRename({newName:"t1"}) public __backing_t1?: number;
    public get t1(): number
    
    public set t1(newValue: number)
    
    public constructor()
    
  }
  
  @Observed() class ExportObservedImpl implements IO, IObservedObject, ISubscribedWatches {
    public addWatchSubscriber(watchId: WatchIdType): void
    
    public removeWatchSubscriber(watchId: WatchIdType): boolean
    
    public executeOnSubscribingWatches(propertyName: string): void
    
    public setV1RenderId(renderId: RenderIdType): void
    
    @JSONRename({newName:"t1"}) public __backing_t1?: number;
    public constructor()
    
    public get t1(): number
    public set t1(t1: number)
    
  }
  
  @Observed() class ExportObservedWithTrack implements IObservedObject, ISubscribedWatches {
    public addWatchSubscriber(watchId: WatchIdType): void
    
    public removeWatchSubscriber(watchId: WatchIdType): boolean
    
    public executeOnSubscribingWatches(propertyName: string): void
    
    public setV1RenderId(renderId: RenderIdType): void
    
    public t1: number;
    @JSONRename({newName:"t2"}) public __backing_t2?: number;
    public get t2(): number
    
    public set t2(newValue: number)
    
    public constructor()
    
  }
  
  class ExportTrackWithoutObserved implements IObservedObject, ISubscribedWatches {
    public addWatchSubscriber(watchId: WatchIdType): void
    
    public removeWatchSubscriber(watchId: WatchIdType): boolean
    
    public executeOnSubscribingWatches(propertyName: string): void
    
    public setV1RenderId(renderId: RenderIdType): void
    
    @JSONRename({newName:"t1"}) public __backing_t1?: number;
    public get t1(): number
    
    public set t1(newValue: number)
    
    public constructor()
    
  }
  
  @Observed() class NonExportObserved implements IObservedObject, ISubscribedWatches {
    public addWatchSubscriber(watchId: WatchIdType): void
    
    public removeWatchSubscriber(watchId: WatchIdType): boolean
    
    public executeOnSubscribingWatches(propertyName: string): void
    
    public setV1RenderId(renderId: RenderIdType): void
    
    @JSONRename({newName:"t1"}) public __backing_t1?: number;
    public get t1(): number
    
    public set t1(newValue: number)
    
    public constructor()
    
  }
  
  @Observed() class NonExportObservedImpl implements IO, IObservedObject, ISubscribedWatches {
    public addWatchSubscriber(watchId: WatchIdType): void
    
    public removeWatchSubscriber(watchId: WatchIdType): boolean
    
    public executeOnSubscribingWatches(propertyName: string): void
    
    public setV1RenderId(renderId: RenderIdType): void
    
    @JSONRename({newName:"t1"}) public __backing_t1?: number;
    public constructor()
    
    public get t1(): number
    public set t1(t1: number)
    
  }
  
  @Observed() class NonExportObservedWithTrack implements IObservedObject, ISubscribedWatches {
    public addWatchSubscriber(watchId: WatchIdType): void
    
    public removeWatchSubscriber(watchId: WatchIdType): boolean
    
    public executeOnSubscribingWatches(propertyName: string): void
    
    public setV1RenderId(renderId: RenderIdType): void
    
    public t1: number;
    @JSONRename({newName:"t2"}) public __backing_t2?: number;
    public get t2(): number
    
    public set t2(newValue: number)
    
    public constructor()
    
  }
  
  class NonExportTrackWithoutObserved implements IObservedObject, ISubscribedWatches {
    public addWatchSubscriber(watchId: WatchIdType): void
    
    public removeWatchSubscriber(watchId: WatchIdType): boolean
    
    public executeOnSubscribingWatches(propertyName: string): void
    
    public setV1RenderId(renderId: RenderIdType): void
    
    @JSONRename({newName:"t1"}) public __backing_t1?: number;
    public get t1(): number
    
    public set t1(newValue: number)
    
    public constructor()
    
  }
  
  @Observed() class ObservedWithBody implements IObservedObject, ISubscribedWatches {
    public addWatchSubscriber(watchId: WatchIdType): void
    
    public removeWatchSubscriber(watchId: WatchIdType): boolean
    
    public executeOnSubscribingWatches(propertyName: string): void
    
    public setV1RenderId(renderId: RenderIdType): void
    
    @JSONRename({newName:"t1"}) public __backing_t1: number = 1;
    public get t1(): number
    
    public set t1(newValue: number)
    
    public constructor() {}
    
  }
  
  @Observed() class ObservedImplWithBody implements IO, IObservedObject, ISubscribedWatches {
    public addWatchSubscriber(watchId: WatchIdType): void
    
    public removeWatchSubscriber(watchId: WatchIdType): boolean
    
    public executeOnSubscribingWatches(propertyName: string): void
    
    public setV1RenderId(renderId: RenderIdType): void
    
    @JSONRename({newName:"t1"}) public __backing_t1: number = 1;
    public constructor() {}
    
    public get t1(): number {
      return this.t1;
    }
    public set t1(t1: number) {
      this.t1 = t1;
      return;
    }
    
  }
  
  @Observed() class ObservedWithTrackWithBody implements IObservedObject, ISubscribedWatches {
    public addWatchSubscriber(watchId: WatchIdType): void
    
    public removeWatchSubscriber(watchId: WatchIdType): boolean
    
    public executeOnSubscribingWatches(propertyName: string): void
    
    public setV1RenderId(renderId: RenderIdType): void
    
    public t1: number = 1;
    @JSONRename({newName:"t2"}) public __backing_t2: number = 2;
    public get t2(): number
    
    public set t2(newValue: number)
    
    public constructor() {}
    
  }
  
  class TrackWithoutObservedWithBody implements IObservedObject, ISubscribedWatches {
    public addWatchSubscriber(watchId: WatchIdType): void
    
    public removeWatchSubscriber(watchId: WatchIdType): boolean
    
    public executeOnSubscribingWatches(propertyName: string): void
    
    public setV1RenderId(renderId: RenderIdType): void
    
    @JSONRename({newName:"t1"}) public __backing_t1: number = 1;
    public get t1(): number
    
    public set t1(newValue: number)
    
    public constructor() {}
    
  }
  
  @Observed() class ExportObservedWithBody implements IObservedObject, ISubscribedWatches {
    public addWatchSubscriber(watchId: WatchIdType): void
    
    public removeWatchSubscriber(watchId: WatchIdType): boolean
    
    public executeOnSubscribingWatches(propertyName: string): void
    
    public setV1RenderId(renderId: RenderIdType): void
    
    @JSONRename({newName:"t1"}) public __backing_t1: number = 1;
    public get t1(): number
    
    public set t1(newValue: number)
    
    public constructor() {}
    
  }
  
  @Observed() class ExportObservedImplWithBody implements IO, IObservedObject, ISubscribedWatches {
    public addWatchSubscriber(watchId: WatchIdType): void
    
    public removeWatchSubscriber(watchId: WatchIdType): boolean
    
    public executeOnSubscribingWatches(propertyName: string): void
    
    public setV1RenderId(renderId: RenderIdType): void
    
    @JSONRename({newName:"t1"}) public __backing_t1: number = 1;
    public constructor() {}
    
    public get t1(): number {
      return this.t1;
    }
    public set t1(t1: number) {
      this.t1 = t1;
      return;
    }
    
  }
  
  @Observed() class ExportObservedWithTrackWithBody implements IObservedObject, ISubscribedWatches {
    public addWatchSubscriber(watchId: WatchIdType): void
    
    public removeWatchSubscriber(watchId: WatchIdType): boolean
    
    public executeOnSubscribingWatches(propertyName: string): void
    
    public setV1RenderId(renderId: RenderIdType): void
    
    public t1: number = 1;
    @JSONRename({newName:"t2"}) public __backing_t2: number = 2;
    public get t2(): number
    
    public set t2(newValue: number)
    
    public constructor() {}
    
  }
  
  class ExportTrackWithoutObservedWithBody implements IObservedObject, ISubscribedWatches {
    public addWatchSubscriber(watchId: WatchIdType): void
    
    public removeWatchSubscriber(watchId: WatchIdType): boolean
    
    public executeOnSubscribingWatches(propertyName: string): void
    
    public setV1RenderId(renderId: RenderIdType): void
    
    @JSONRename({newName:"t1"}) public __backing_t1: number = 1;
    public get t1(): number
    
    public set t1(newValue: number)
    
    public constructor() {}
    
  }
  
  @ObservedV2() class ExportObservedV2 implements IObservedObject, ISubscribedWatches {
    public addWatchSubscriber(watchId: WatchIdType): void
    
    public removeWatchSubscriber(watchId: WatchIdType): boolean
    
    public executeOnSubscribingWatches(propertyName: string): void
    
    public setV1RenderId(renderId: RenderIdType): void
    
    @JSONRename({newName:"t1"}) public __backing_t1?: number;
    public get t1(): number
    
    public set t1(newValue: number)
    
    @Computed() 
    public get computed(): number
    
    @Monitor({value:["t1"]}) 
    public onT1Changed(): void
    
    public constructor()
    
  }
  
  @ObservedV2() class ExportObservedV2Inherit implements IO, IObservedObject, ISubscribedWatches {
    public addWatchSubscriber(watchId: WatchIdType): void
    
    public removeWatchSubscriber(watchId: WatchIdType): boolean
    
    public executeOnSubscribingWatches(propertyName: string): void
    
    public setV1RenderId(renderId: RenderIdType): void
    
    @JSONRename({newName:"t1"}) public __backing_t1?: number;
    public constructor()
    
    public get t1(): number
    public set t1(t1: number)
    
  }
  
  @ObservedV2() class NonExportObservedV2 implements IObservedObject, ISubscribedWatches {
    public addWatchSubscriber(watchId: WatchIdType): void
    
    public removeWatchSubscriber(watchId: WatchIdType): boolean
    
    public executeOnSubscribingWatches(propertyName: string): void
    
    public setV1RenderId(renderId: RenderIdType): void
    
    @JSONRename({newName:"t1"}) public __backing_t1?: number;
    public get t1(): number
    
    public set t1(newValue: number)
    
    @Computed() 
    public get computed(): number
    
    @Monitor({value:["t1"]}) 
    public onT1Changed(): void
    
    public constructor()
    
  }
  
  @ObservedV2() class NonExportObservedV2Inherit implements IO, IObservedObject, ISubscribedWatches {
    public addWatchSubscriber(watchId: WatchIdType): void
    
    public removeWatchSubscriber(watchId: WatchIdType): boolean
    
    public executeOnSubscribingWatches(propertyName: string): void
    
    public setV1RenderId(renderId: RenderIdType): void
    
    @JSONRename({newName:"t1"}) public __backing_t1?: number;
    public constructor()
    
    public get t1(): number
    public set t1(t1: number)
    
  }
  
  @ObservedV2() class ObservedV2WithBody implements IObservedObject, ISubscribedWatches {
    public addWatchSubscriber(watchId: WatchIdType): void
    
    public removeWatchSubscriber(watchId: WatchIdType): boolean
    
    public executeOnSubscribingWatches(propertyName: string): void
    
    public setV1RenderId(renderId: RenderIdType): void
    
    @JSONRename({newName:"t1"}) public __backing_t1: number = 1;
    public get t1(): number
    
    public set t1(newValue: number)
    
    @Computed() 
    public get computed(): number {
      return this.t1;
    }
    
    @Monitor({value:["t1"]}) 
    public onT1Changed(): void {}
    
    public constructor(t1: number) {
      this.t1 = t1;
    }
    
  }
  
  @ObservedV2() class ObservedV2InheritWithBody implements IO, IObservedObject, ISubscribedWatches {
    public addWatchSubscriber(watchId: WatchIdType): void
    
    public removeWatchSubscriber(watchId: WatchIdType): boolean
    
    public executeOnSubscribingWatches(propertyName: string): void
    
    public setV1RenderId(renderId: RenderIdType): void
    
    @JSONRename({newName:"t1"}) public __backing_t1: number = 1;
    public t2: number = 2;
    public constructor(t2: number) {
      this.t2 = t2;
    }
    
    public get t1(): number {
      return this.t1;
    }
    public set t1(t1: number) {
      this.t1 = t1;
      return;
    }
    
  }
  
  @ObservedV2() class ExportObservedV2InheritWithBody implements IO, IObservedObject, ISubscribedWatches {
    public addWatchSubscriber(watchId: WatchIdType): void
    
    public removeWatchSubscriber(watchId: WatchIdType): boolean
    
    public executeOnSubscribingWatches(propertyName: string): void
    
    public setV1RenderId(renderId: RenderIdType): void
    
    @JSONRename({newName:"t1"}) public __backing_t1: number = 1;
    public t2: number = 2;
    public constructor(t2: number) {
      this.t2 = t2;
    }
    
    public get t1(): number {
      return this.t1;
    }
    public set t1(t1: number) {
      this.t1 = t1;
      return;
    }
    
  }
  
  @ObservedV2() class ExportObservedV2WithBody implements IObservedObject, ISubscribedWatches {
    public addWatchSubscriber(watchId: WatchIdType): void
    
    public removeWatchSubscriber(watchId: WatchIdType): boolean
    
    public executeOnSubscribingWatches(propertyName: string): void
    
    public setV1RenderId(renderId: RenderIdType): void
    
    @JSONRename({newName:"t1"}) public __backing_t1: number = 1;
    public get t1(): number
    
    public set t1(newValue: number)
    
    @Computed() 
    public get computed(): number {
      return this.t1;
    }
    
    @Monitor({value:["t1"]}) 
    public onT1Changed(): void {}
    
    public constructor(t1: number) {
      this.t1 = t1;
    }
    
  }
  
  @CustomDialog() final struct ExportCustomDialog extends BaseCustomDialog<ExportCustomDialog, __Options_ExportCustomDialog> {
    @ComponentBuilder() 
    public static $_invoke(initializers?: __Options_ExportCustomDialog, storage?: LocalStorage, @Builder() @Memo() content?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)): ExportCustomDialog
    
    @Link() public someLink: number;
    public controller?: (CustomDialogController | undefined);
    @Memo() 
    public build(__memo_context: __memo_context_type, __memo_id: __memo_id_type): void
    
    public constructor(useSharedStorage?: boolean, storage?: LocalStorage)
    
    @MemoIntrinsic() 
    public static _invoke(__memo_context: __memo_context_type, __memo_id: __memo_id_type, initializers: ((()=> __Options_ExportCustomDialog) | undefined), storage: ((()=> LocalStorage) | undefined), controller: (CustomDialogController | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void
    
  }
  
  @CustomDialog() final struct NonExportCustomDialog extends BaseCustomDialog<NonExportCustomDialog, __Options_NonExportCustomDialog> {
    @ComponentBuilder() 
    public static $_invoke(initializers?: __Options_NonExportCustomDialog, storage?: LocalStorage, @Builder() @Memo() content?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)): NonExportCustomDialog
    
    @Link() public someLink: number;
    public controller?: (CustomDialogController | undefined);
    @Memo() 
    public build(__memo_context: __memo_context_type, __memo_id: __memo_id_type): void
    
    public constructor(useSharedStorage?: boolean, storage?: LocalStorage)
    
    @MemoIntrinsic() 
    public static _invoke(__memo_context: __memo_context_type, __memo_id: __memo_id_type, initializers: ((()=> __Options_NonExportCustomDialog) | undefined), storage: ((()=> LocalStorage) | undefined), controller: (CustomDialogController | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void
    
  }
  
  @CustomDialog() final struct CustomDialogWithBody extends BaseCustomDialog<CustomDialogWithBody, __Options_CustomDialogWithBody> {
    @ComponentBuilder() 
    public static $_invoke(initializers?: __Options_CustomDialogWithBody, storage?: LocalStorage, @Builder() @Memo() content?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)): CustomDialogWithBody
    
    @State() public someState: number;
    public controller: (CustomDialogController | null);
    @Memo() 
    public build(__memo_context: __memo_context_type, __memo_id: __memo_id_type): void {
      Column(){};
    }
    
    public constructor(useSharedStorage?: boolean, storage?: LocalStorage)
    
    @MemoIntrinsic() 
    public static _invoke(__memo_context: __memo_context_type, __memo_id: __memo_id_type, initializers: ((()=> __Options_CustomDialogWithBody) | undefined), storage: ((()=> LocalStorage) | undefined), controller: (CustomDialogController | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void
    
  }
  
  @CustomDialog() final struct ExportCustomDialogWithBody extends BaseCustomDialog<ExportCustomDialogWithBody, __Options_ExportCustomDialogWithBody> {
    @ComponentBuilder() 
    public static $_invoke(initializers?: __Options_ExportCustomDialogWithBody, storage?: LocalStorage, @Builder() @Memo() content?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)): ExportCustomDialogWithBody
    
    @State() public someState: number;
    public controller: (CustomDialogController | null);
    @Memo() 
    public build(__memo_context: __memo_context_type, __memo_id: __memo_id_type): void {
      Column(){};
    }
    
    public constructor(useSharedStorage?: boolean, storage?: LocalStorage)
    
    @MemoIntrinsic() 
    public static _invoke(__memo_context: __memo_context_type, __memo_id: __memo_id_type, initializers: ((()=> __Options_ExportCustomDialogWithBody) | undefined), storage: ((()=> LocalStorage) | undefined), controller: (CustomDialogController | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void
    
  }
  
  @Entry() @Component() final struct ExportEntryStructWithBody extends CustomComponent<ExportEntryStructWithBody, __Options_ExportEntryStructWithBody> implements PageLifeCycle {
    @ComponentBuilder() 
    public static $_invoke(initializers?: __Options_ExportEntryStructWithBody, storage?: LocalStorage, @Builder() @Memo() content?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)): ExportEntryStructWithBody
    
    @Memo() 
    public build(__memo_context: __memo_context_type, __memo_id: __memo_id_type): void {
      Column(){};
    }
    
    public constructor(useSharedStorage?: boolean, storage?: LocalStorage)
    
    @MemoIntrinsic() 
    public static _invoke(__memo_context: __memo_context_type, __memo_id: __memo_id_type, style: (@Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: ExportEntryStructWithBody)=> void) | undefined), initializers: ((()=> __Options_ExportEntryStructWithBody) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void
    
  }
  
  @Component() final struct ExportStructV1 extends CustomComponent<ExportStructV1, __Options_ExportStructV1> {
    @ComponentBuilder() 
    public static $_invoke(initializers?: __Options_ExportStructV1, storage?: LocalStorage, @Builder() @Memo() content?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)): ExportStructV1
    
    @State() public someState: number;
    @BuilderParam() @Memo() public someBuilderParam: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void);
    @Memo() 
    public build(__memo_context: __memo_context_type, __memo_id: __memo_id_type): void
    
    public constructor(useSharedStorage?: boolean, storage?: LocalStorage)
    
    @MemoIntrinsic() 
    public static _invoke(__memo_context: __memo_context_type, __memo_id: __memo_id_type, style: (@Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: ExportStructV1)=> void) | undefined), initializers: ((()=> __Options_ExportStructV1) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void
    
  }
  
  @Component() final struct NonExportStructV1 extends CustomComponent<NonExportStructV1, __Options_NonExportStructV1> {
    @ComponentBuilder() 
    public static $_invoke(initializers?: __Options_NonExportStructV1, storage?: LocalStorage, @Builder() @Memo() content?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)): NonExportStructV1
    
    @State() public someState: number;
    @BuilderParam() @Memo() public someBuilderParam: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void);
    @Memo() 
    public build(__memo_context: __memo_context_type, __memo_id: __memo_id_type): void
    
    public constructor(useSharedStorage?: boolean, storage?: LocalStorage)
    
    @MemoIntrinsic() 
    public static _invoke(__memo_context: __memo_context_type, __memo_id: __memo_id_type, style: (@Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: NonExportStructV1)=> void) | undefined), initializers: ((()=> __Options_NonExportStructV1) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void
    
  }
  
  @Component() final struct StructV1WithBody extends CustomComponent<StructV1WithBody, __Options_StructV1WithBody> {
    @ComponentBuilder() 
    public static $_invoke(initializers?: __Options_StructV1WithBody, storage?: LocalStorage, @Builder() @Memo() content?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)): StructV1WithBody
    
    @State() public someState: number;
    @BuilderParam() @Memo() public someBuilderParam: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void);
    @Memo() 
    public build(__memo_context: __memo_context_type, __memo_id: __memo_id_type): void {
      Column(){};
    }
    
    public constructor(useSharedStorage?: boolean, storage?: LocalStorage)
    
    @MemoIntrinsic() 
    public static _invoke(__memo_context: __memo_context_type, __memo_id: __memo_id_type, style: (@Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: StructV1WithBody)=> void) | undefined), initializers: ((()=> __Options_StructV1WithBody) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void
    
  }
  
  @Component() final struct ExportStructV1WithBody extends CustomComponent<ExportStructV1WithBody, __Options_ExportStructV1WithBody> {
    @ComponentBuilder() 
    public static $_invoke(initializers?: __Options_ExportStructV1WithBody, storage?: LocalStorage, @Builder() @Memo() content?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)): ExportStructV1WithBody
    
    @State() public someState: number;
    @Link() public someLink: number;
    @BuilderParam() @Memo() public someBuilderParam: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void);
    @Memo() 
    public build(__memo_context: __memo_context_type, __memo_id: __memo_id_type): void {
      Column(){};
    }
    
    public constructor(useSharedStorage?: boolean, storage?: LocalStorage)
    
    @MemoIntrinsic() 
    public static _invoke(__memo_context: __memo_context_type, __memo_id: __memo_id_type, style: (@Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: ExportStructV1WithBody)=> void) | undefined), initializers: ((()=> __Options_ExportStructV1WithBody) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: (string | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void
    
  }
  
  @ComponentV2() final struct ExportStructV2 extends CustomComponentV2<ExportStructV2, __Options_ExportStructV2> {
    @ComponentBuilder() 
    public static $_invoke(initializers?: __Options_ExportStructV2, storage?: LocalStorage, @Builder() @Memo() content?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)): ExportStructV2
    
    @Local() public someLocal: number;
    @BuilderParam() @Memo() public someBuilderParam: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void);
    @Computed() 
    public get someComputed(): number
    
    @Monitor({value:["someLocal"]}) 
    public onSomeLocalChanged(): void
    
    @Memo() 
    public build(__memo_context: __memo_context_type, __memo_id: __memo_id_type): void
    
    public constructor()
    
    @MemoIntrinsic() 
    public static _invoke(__memo_context: __memo_context_type, __memo_id: __memo_id_type, style: (@Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: ExportStructV2)=> void) | undefined), initializers: ((()=> __Options_ExportStructV2) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: ((()=> string) | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void
    
  }
  
  @ComponentV2() final struct NonExportStructV2 extends CustomComponentV2<NonExportStructV2, __Options_NonExportStructV2> {
    @ComponentBuilder() 
    public static $_invoke(initializers?: __Options_NonExportStructV2, storage?: LocalStorage, @Builder() @Memo() content?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)): NonExportStructV2
    
    @Local() public someLocal: number;
    @BuilderParam() @Memo() public someBuilderParam: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void);
    @Computed() 
    public get someComputed(): number
    
    @Monitor({value:["someLocal"]}) 
    public onSomeLocalChanged(): void
    
    @Memo() 
    public build(__memo_context: __memo_context_type, __memo_id: __memo_id_type): void
    
    public constructor()
    
    @MemoIntrinsic() 
    public static _invoke(__memo_context: __memo_context_type, __memo_id: __memo_id_type, style: (@Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: NonExportStructV2)=> void) | undefined), initializers: ((()=> __Options_NonExportStructV2) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: ((()=> string) | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void
    
  }
  
  @ComponentV2() final struct StructV2WithBody extends CustomComponentV2<StructV2WithBody, __Options_StructV2WithBody> {
    @ComponentBuilder() 
    public static $_invoke(initializers?: __Options_StructV2WithBody, storage?: LocalStorage, @Builder() @Memo() content?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)): StructV2WithBody
    
    @Local() public someLocal: number;
    @BuilderParam() @Memo() public someBuilderParam: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void);
    @Computed() 
    public get someComputed(): number {
      return this.someLocal;
    }
    
    @Monitor({value:["someLocal"]}) 
    public onSomeLocalChanged(): void {}
    
    @Memo() 
    public build(__memo_context: __memo_context_type, __memo_id: __memo_id_type): void {
      Column(){};
    }
    
    public constructor() {}
    
    @MemoIntrinsic() 
    public static _invoke(__memo_context: __memo_context_type, __memo_id: __memo_id_type, style: (@Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: StructV2WithBody)=> void) | undefined), initializers: ((()=> __Options_StructV2WithBody) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: ((()=> string) | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void
    
  }
  
  @ComponentV2() final struct ExportStructV2WithBody extends CustomComponentV2<ExportStructV2WithBody, __Options_ExportStructV2WithBody> {
    @ComponentBuilder() 
    public static $_invoke(initializers?: __Options_ExportStructV2WithBody, storage?: LocalStorage, @Builder() @Memo() content?: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void)): ExportStructV2WithBody
    
    @Local() public someLocal: number;
    @Param() public someParam: number;
    @Require() @Param() public someRequiredParam: number;
    @BuilderParam() @Memo() public someBuilderParam: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void);
    @Computed() 
    public get someComputed(): number {
      return this.someLocal;
    }
    
    @Monitor({value:["someLocal"]}) 
    public onSomeLocalChanged(): void {}
    
    @Memo() 
    public build(__memo_context: __memo_context_type, __memo_id: __memo_id_type): void {
      Column(){};
    }
    
    public constructor() {}
    
    @MemoIntrinsic() 
    public static _invoke(__memo_context: __memo_context_type, __memo_id: __memo_id_type, style: (@Memo() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: ExportStructV2WithBody)=> void) | undefined), initializers: ((()=> __Options_ExportStructV2WithBody) | undefined), storage: ((()=> LocalStorage) | undefined), reuseId: ((()=> string) | undefined), @Memo() content: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined)): void
    
  }
  
  @Builder() type exportBuilderType = ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void);
  
  type exportBuilderType2 = @Builder() ((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void);
  
  interface IBuilderInArgs {
    mockBuilderMethod1(builderType: exportBuilderType): void
    mockBuilderMethod2(builderType: exportBuilderType2): void
    
  }
  
  @CustomDialog() class __Options_ExportCustomDialog {
    @Link() public someLink: number;
    public __backing_someLink?: LinkSourceType<number>;
    public __options_has_someLink?: boolean;
    public controller?: (CustomDialogController | undefined);
    public __options_has_controller?: boolean;
    public constructor()
    
  }
  
  @CustomDialog() class __Options_NonExportCustomDialog {
    @Link() public someLink: number;
    public __backing_someLink?: LinkSourceType<number>;
    public __options_has_someLink?: boolean;
    public controller?: (CustomDialogController | undefined);
    public __options_has_controller?: boolean;
    public constructor()
    
  }
  
  @CustomDialog() class __Options_CustomDialogWithBody {
    @State() public someState?: number;
    public __backing_someState?: IStateDecoratedVariable<number>;
    public __options_has_someState?: boolean;
    public controller?: (CustomDialogController | null);
    public __options_has_controller?: boolean;
    public constructor()
    
  }
  
  @CustomDialog() class __Options_ExportCustomDialogWithBody {
    @State() public someState?: number;
    public __backing_someState?: IStateDecoratedVariable<number>;
    public __options_has_someState?: boolean;
    public controller?: (CustomDialogController | null);
    public __options_has_controller?: boolean;
    public constructor()
    
  }
  
  @Entry() @Component() class __Options_ExportEntryStructWithBody {
    public constructor()
    
  }
  
  @Component() class __Options_ExportStructV1 {
    @State() public someState?: number;
    public __backing_someState?: IStateDecoratedVariable<number>;
    public __options_has_someState?: boolean;
    @Memo() public someBuilderParam?: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined);
    public __options_has_someBuilderParam?: boolean;
    public constructor()
    
  }
  
  @Component() class __Options_NonExportStructV1 {
    @State() public someState?: number;
    public __backing_someState?: IStateDecoratedVariable<number>;
    public __options_has_someState?: boolean;
    @Memo() public someBuilderParam?: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined);
    public __options_has_someBuilderParam?: boolean;
    public constructor()
    
  }
  
  @Component() class __Options_StructV1WithBody {
    @State() public someState?: number;
    public __backing_someState?: IStateDecoratedVariable<number>;
    public __options_has_someState?: boolean;
    @Memo() public someBuilderParam?: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined);
    public __options_has_someBuilderParam?: boolean;
    public constructor()
    
  }
  
  @Component() class __Options_ExportStructV1WithBody {
    @State() public someState?: number;
    public __backing_someState?: IStateDecoratedVariable<number>;
    public __options_has_someState?: boolean;
    @Link() public someLink: number;
    public __backing_someLink?: LinkSourceType<number>;
    public __options_has_someLink?: boolean;
    @Memo() public someBuilderParam?: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined);
    public __options_has_someBuilderParam?: boolean;
    public constructor()
    
  }
  
  @ComponentV2() class __Options_ExportStructV2 {
    @Local() public someLocal?: number;
    public __backing_someLocal?: ILocalDecoratedVariable<number>;
    public __options_has_someLocal?: boolean;
    @Memo() public someBuilderParam?: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined);
    public __options_has_someBuilderParam?: boolean;
    public constructor()
    
  }
  
  @ComponentV2() class __Options_NonExportStructV2 {
    @Local() public someLocal?: number;
    public __backing_someLocal?: ILocalDecoratedVariable<number>;
    public __options_has_someLocal?: boolean;
    @Memo() public someBuilderParam?: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined);
    public __options_has_someBuilderParam?: boolean;
    public constructor()
    
  }
  
  @ComponentV2() class __Options_StructV2WithBody {
    @Local() public someLocal?: number;
    public __backing_someLocal?: ILocalDecoratedVariable<number>;
    public __options_has_someLocal?: boolean;
    @Memo() public someBuilderParam?: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined);
    public __options_has_someBuilderParam?: boolean;
    public constructor()
    
  }
  
  @ComponentV2() class __Options_ExportStructV2WithBody {
    @Local() public someLocal?: number;
    public __backing_someLocal?: ILocalDecoratedVariable<number>;
    public __options_has_someLocal?: boolean;
    @Param() public someParam?: number;
    public __backing_someParam?: IParamDecoratedVariable<number>;
    public __options_has_someParam?: boolean;
    @Require() @Param() public someRequiredParam: number;
    public __backing_someRequiredParam?: IParamDecoratedVariable<number>;
    public __options_has_someRequiredParam?: boolean;
    @Memo() public someBuilderParam?: (((__memo_context: __memo_context_type, __memo_id: __memo_id_type)=> void) | undefined);
    public __options_has_someBuilderParam?: boolean;
    public constructor()
    
  }
  
}

`;

export { namespace_expectedUIScript };