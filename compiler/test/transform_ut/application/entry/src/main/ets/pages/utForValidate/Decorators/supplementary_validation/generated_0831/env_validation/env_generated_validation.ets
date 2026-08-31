/*
 * Copyright (c) 2026 Huawei Device Co., Ltd.
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

/**
 * Created: 2026-08-31
 * Validates @Env supported system keys, allowed type aliases, child class matching,
 * and environment value propagation into V1 regular properties and V2 @Param properties.
 */

export class WindowSizeLayoutBreakpointInfo {
  widthBreakpoint: WidthBreakpoint = WidthBreakpoint.WIDTH_XS
  heightBreakpoint: HeightBreakpoint = HeightBreakpoint.HEIGHT_SM
}

class CompactBreakpointInfo extends WindowSizeLayoutBreakpointInfo {
  name: string = 'compact'
}

class ExpandedBreakpointInfo extends WindowSizeLayoutBreakpointInfo {
  name: string = 'expanded'
}

class SizeInVP {
  width: number = 0
  height: number = 0
}

class Size {
  width: number = 0
  height: number = 0
}

class UIEnvWindowAvoidAreaInfoVP {
  top: number = 0
  bottom: number = 0
  left: number = 0
  right: number = 0
}

class UIEnvWindowAvoidAreaInfoPX {
  top: number = 0
  bottom: number = 0
  left: number = 0
  right: number = 0
}

type BreakpointAlias = WindowSizeLayoutBreakpointInfo
type WindowSizeAlias = SizeInVP
type PixelSizeAlias = Size
type AvoidAreaAlias = UIEnvWindowAvoidAreaInfoVP
type AvoidAreaPxAlias = UIEnvWindowAvoidAreaInfoPX

@Builder
function EnvInfoText(label: string, value: string): void {
  Row() {
    Text(label).fontSize(12)
    Text(value).fontSize(12)
  }
}

@Builder
function EnvSizeCard(title: string, width: number, height: number): void {
  Column() {
    Text(title).fontSize(14)
    Text('width=' + width.toString()).fontSize(12)
    Text('height=' + height.toString()).fontSize(12)
  }
  .padding(6)
}

@Component
struct EnvRegularReceiver {
  breakInfo: WindowSizeLayoutBreakpointInfo = new WindowSizeLayoutBreakpointInfo()
  avoidArea: UIEnvWindowAvoidAreaInfoVP = new UIEnvWindowAvoidAreaInfoVP()
  displayId: number = 0
  focused: boolean = false

  build() {
    Column() {
      Text('EnvRegularReceiver')
      Text('display=' + this.displayId.toString())
      Text('focused=' + this.focused.toString())
      Text('widthBreakpoint=' + this.breakInfo.widthBreakpoint.toString())
      Text('avoidTop=' + this.avoidArea.top.toString())
    }
  }
}

@ComponentV2
struct EnvParamReceiver {
  @Param breakInfo: WindowSizeLayoutBreakpointInfo = new WindowSizeLayoutBreakpointInfo()
  @Param vpSize: SizeInVP = new SizeInVP()
  @Param pxSize: Size = new Size()
  @Param highlighted: boolean = false

  @Computed get shape(): string {
    return this.vpSize.width.toString() + 'x' + this.vpSize.height.toString()
  }

  build() {
    Column() {
      Text('EnvParamReceiver')
      Text('shape=' + this.shape)
      Text('highlighted=' + this.highlighted.toString())
      Text('px=' + this.pxSize.width.toString() + ':' + this.pxSize.height.toString())
    }
  }
}

@Component
struct EnvBreakpointScenario01 {
  @Env(SystemProperties.BREAK_POINT) breakInfo: BreakpointAlias
  @Env(SystemProperties.WINDOW_AVOID_AREA) avoidArea: UIEnvWindowAvoidAreaInfoVP
  @Env(SystemProperties.WINDOW_AVOID_AREA_PX) avoidAreaPx: UIEnvWindowAvoidAreaInfoPX
  @Env(SystemProperties.WINDOW_SIZE) windowSize: SizeInVP
  @Env(SystemProperties.WINDOW_SIZE_PX) pixelSize: Size
  @Env(SystemProperties.WINDOW_DISPLAY_ID) displayId: number
  @Env(SystemProperties.WINDOW_SYSTEM_DENSITY) density: number
  @Env(SystemProperties.WINDOW_IS_FOCUSED) focused: boolean
  @Env(SystemProperties.WINDOW_IS_HIGHLIGHTED) highlighted: boolean

  build() {
    Column() {
      Text('EnvBreakpointScenario01')
      EnvInfoText('break', this.breakInfo.widthBreakpoint.toString())
      EnvInfoText('height', this.breakInfo.heightBreakpoint.toString())
      EnvInfoText('density', this.density.toString())
      EnvSizeCard('vp01', this.windowSize.width, this.windowSize.height)
      EnvSizeCard('px01', this.pixelSize.width, this.pixelSize.height)
      EnvRegularReceiver({
        breakInfo: this.breakInfo,
        avoidArea: this.avoidArea,
        displayId: this.displayId,
        focused: this.focused
      })
      EnvParamReceiver({
        breakInfo: this.breakInfo,
        vpSize: this.windowSize,
        pxSize: this.pixelSize,
        highlighted: this.highlighted
      })
      Text('avoidPxBottom=' + this.avoidAreaPx.bottom.toString())
    }
  }
}

@Component
struct EnvBreakpointScenario02 {
  @Env(SystemProperties.BREAK_POINT) breakInfo: ExpandedBreakpointInfo
  @Env(SystemProperties.WINDOW_AVOID_AREA) avoidArea: AvoidAreaAlias
  @Env(SystemProperties.WINDOW_AVOID_AREA_PX) avoidAreaPx: AvoidAreaPxAlias
  @Env(SystemProperties.WINDOW_SIZE) windowSize: WindowSizeAlias
  @Env(SystemProperties.WINDOW_SIZE_PX) pixelSize: PixelSizeAlias
  @Env(SystemProperties.WINDOW_DISPLAY_ID) displayId: number
  @Env(SystemProperties.WINDOW_SYSTEM_DENSITY) density: number
  @Env(SystemProperties.WINDOW_IS_FOCUSED) focused: boolean
  @Env(SystemProperties.WINDOW_IS_HIGHLIGHTED) highlighted: boolean

  build() {
    Column() {
      Text('EnvBreakpointScenario02')
      EnvInfoText('break', this.breakInfo.widthBreakpoint.toString())
      EnvInfoText('height', this.breakInfo.heightBreakpoint.toString())
      EnvInfoText('density', this.density.toString())
      EnvSizeCard('vp02', this.windowSize.width, this.windowSize.height)
      EnvSizeCard('px02', this.pixelSize.width, this.pixelSize.height)
      EnvRegularReceiver({
        breakInfo: this.breakInfo,
        avoidArea: this.avoidArea,
        displayId: this.displayId,
        focused: this.focused
      })
      EnvParamReceiver({
        breakInfo: this.breakInfo,
        vpSize: this.windowSize,
        pxSize: this.pixelSize,
        highlighted: this.highlighted
      })
      Text('avoidPxBottom=' + this.avoidAreaPx.bottom.toString())
    }
  }
}

@Component
struct EnvBreakpointScenario03 {
  @Env(SystemProperties.BREAK_POINT) breakInfo: CompactBreakpointInfo
  @Env(SystemProperties.WINDOW_AVOID_AREA) avoidArea: UIEnvWindowAvoidAreaInfoVP
  @Env(SystemProperties.WINDOW_AVOID_AREA_PX) avoidAreaPx: UIEnvWindowAvoidAreaInfoPX
  @Env(SystemProperties.WINDOW_SIZE) windowSize: SizeInVP
  @Env(SystemProperties.WINDOW_SIZE_PX) pixelSize: Size
  @Env(SystemProperties.WINDOW_DISPLAY_ID) displayId: number
  @Env(SystemProperties.WINDOW_SYSTEM_DENSITY) density: number
  @Env(SystemProperties.WINDOW_IS_FOCUSED) focused: boolean
  @Env(SystemProperties.WINDOW_IS_HIGHLIGHTED) highlighted: boolean

  build() {
    Column() {
      Text('EnvBreakpointScenario03')
      EnvInfoText('break', this.breakInfo.widthBreakpoint.toString())
      EnvInfoText('height', this.breakInfo.heightBreakpoint.toString())
      EnvInfoText('density', this.density.toString())
      EnvSizeCard('vp03', this.windowSize.width, this.windowSize.height)
      EnvSizeCard('px03', this.pixelSize.width, this.pixelSize.height)
      EnvRegularReceiver({
        breakInfo: this.breakInfo,
        avoidArea: this.avoidArea,
        displayId: this.displayId,
        focused: this.focused
      })
      EnvParamReceiver({
        breakInfo: this.breakInfo,
        vpSize: this.windowSize,
        pxSize: this.pixelSize,
        highlighted: this.highlighted
      })
      Text('avoidPxBottom=' + this.avoidAreaPx.bottom.toString())
    }
  }
}

@Component
struct EnvBreakpointScenario04 {
  @Env(SystemProperties.BREAK_POINT) breakInfo: BreakpointAlias
  @Env(SystemProperties.WINDOW_AVOID_AREA) avoidArea: AvoidAreaAlias
  @Env(SystemProperties.WINDOW_AVOID_AREA_PX) avoidAreaPx: AvoidAreaPxAlias
  @Env(SystemProperties.WINDOW_SIZE) windowSize: WindowSizeAlias
  @Env(SystemProperties.WINDOW_SIZE_PX) pixelSize: PixelSizeAlias
  @Env(SystemProperties.WINDOW_DISPLAY_ID) displayId: number
  @Env(SystemProperties.WINDOW_SYSTEM_DENSITY) density: number
  @Env(SystemProperties.WINDOW_IS_FOCUSED) focused: boolean
  @Env(SystemProperties.WINDOW_IS_HIGHLIGHTED) highlighted: boolean

  build() {
    Column() {
      Text('EnvBreakpointScenario04')
      EnvInfoText('break', this.breakInfo.widthBreakpoint.toString())
      EnvInfoText('height', this.breakInfo.heightBreakpoint.toString())
      EnvInfoText('density', this.density.toString())
      EnvSizeCard('vp04', this.windowSize.width, this.windowSize.height)
      EnvSizeCard('px04', this.pixelSize.width, this.pixelSize.height)
      EnvRegularReceiver({
        breakInfo: this.breakInfo,
        avoidArea: this.avoidArea,
        displayId: this.displayId,
        focused: this.focused
      })
      EnvParamReceiver({
        breakInfo: this.breakInfo,
        vpSize: this.windowSize,
        pxSize: this.pixelSize,
        highlighted: this.highlighted
      })
      Text('avoidPxBottom=' + this.avoidAreaPx.bottom.toString())
    }
  }
}

@Component
struct EnvBreakpointScenario05 {
  @Env(SystemProperties.BREAK_POINT) breakInfo: ExpandedBreakpointInfo
  @Env(SystemProperties.WINDOW_AVOID_AREA) avoidArea: UIEnvWindowAvoidAreaInfoVP
  @Env(SystemProperties.WINDOW_AVOID_AREA_PX) avoidAreaPx: UIEnvWindowAvoidAreaInfoPX
  @Env(SystemProperties.WINDOW_SIZE) windowSize: SizeInVP
  @Env(SystemProperties.WINDOW_SIZE_PX) pixelSize: Size
  @Env(SystemProperties.WINDOW_DISPLAY_ID) displayId: number
  @Env(SystemProperties.WINDOW_SYSTEM_DENSITY) density: number
  @Env(SystemProperties.WINDOW_IS_FOCUSED) focused: boolean
  @Env(SystemProperties.WINDOW_IS_HIGHLIGHTED) highlighted: boolean

  build() {
    Column() {
      Text('EnvBreakpointScenario05')
      EnvInfoText('break', this.breakInfo.widthBreakpoint.toString())
      EnvInfoText('height', this.breakInfo.heightBreakpoint.toString())
      EnvInfoText('density', this.density.toString())
      EnvSizeCard('vp05', this.windowSize.width, this.windowSize.height)
      EnvSizeCard('px05', this.pixelSize.width, this.pixelSize.height)
      EnvRegularReceiver({
        breakInfo: this.breakInfo,
        avoidArea: this.avoidArea,
        displayId: this.displayId,
        focused: this.focused
      })
      EnvParamReceiver({
        breakInfo: this.breakInfo,
        vpSize: this.windowSize,
        pxSize: this.pixelSize,
        highlighted: this.highlighted
      })
      Text('avoidPxBottom=' + this.avoidAreaPx.bottom.toString())
    }
  }
}

@Component
struct EnvBreakpointScenario06 {
  @Env(SystemProperties.BREAK_POINT) breakInfo: CompactBreakpointInfo
  @Env(SystemProperties.WINDOW_AVOID_AREA) avoidArea: AvoidAreaAlias
  @Env(SystemProperties.WINDOW_AVOID_AREA_PX) avoidAreaPx: AvoidAreaPxAlias
  @Env(SystemProperties.WINDOW_SIZE) windowSize: WindowSizeAlias
  @Env(SystemProperties.WINDOW_SIZE_PX) pixelSize: PixelSizeAlias
  @Env(SystemProperties.WINDOW_DISPLAY_ID) displayId: number
  @Env(SystemProperties.WINDOW_SYSTEM_DENSITY) density: number
  @Env(SystemProperties.WINDOW_IS_FOCUSED) focused: boolean
  @Env(SystemProperties.WINDOW_IS_HIGHLIGHTED) highlighted: boolean

  build() {
    Column() {
      Text('EnvBreakpointScenario06')
      EnvInfoText('break', this.breakInfo.widthBreakpoint.toString())
      EnvInfoText('height', this.breakInfo.heightBreakpoint.toString())
      EnvInfoText('density', this.density.toString())
      EnvSizeCard('vp06', this.windowSize.width, this.windowSize.height)
      EnvSizeCard('px06', this.pixelSize.width, this.pixelSize.height)
      EnvRegularReceiver({
        breakInfo: this.breakInfo,
        avoidArea: this.avoidArea,
        displayId: this.displayId,
        focused: this.focused
      })
      EnvParamReceiver({
        breakInfo: this.breakInfo,
        vpSize: this.windowSize,
        pxSize: this.pixelSize,
        highlighted: this.highlighted
      })
      Text('avoidPxBottom=' + this.avoidAreaPx.bottom.toString())
    }
  }
}

@Component
struct EnvBreakpointScenario07 {
  @Env(SystemProperties.BREAK_POINT) breakInfo: BreakpointAlias
  @Env(SystemProperties.WINDOW_AVOID_AREA) avoidArea: UIEnvWindowAvoidAreaInfoVP
  @Env(SystemProperties.WINDOW_AVOID_AREA_PX) avoidAreaPx: UIEnvWindowAvoidAreaInfoPX
  @Env(SystemProperties.WINDOW_SIZE) windowSize: SizeInVP
  @Env(SystemProperties.WINDOW_SIZE_PX) pixelSize: Size
  @Env(SystemProperties.WINDOW_DISPLAY_ID) displayId: number
  @Env(SystemProperties.WINDOW_SYSTEM_DENSITY) density: number
  @Env(SystemProperties.WINDOW_IS_FOCUSED) focused: boolean
  @Env(SystemProperties.WINDOW_IS_HIGHLIGHTED) highlighted: boolean

  build() {
    Column() {
      Text('EnvBreakpointScenario07')
      EnvInfoText('break', this.breakInfo.widthBreakpoint.toString())
      EnvInfoText('height', this.breakInfo.heightBreakpoint.toString())
      EnvInfoText('density', this.density.toString())
      EnvSizeCard('vp07', this.windowSize.width, this.windowSize.height)
      EnvSizeCard('px07', this.pixelSize.width, this.pixelSize.height)
      EnvRegularReceiver({
        breakInfo: this.breakInfo,
        avoidArea: this.avoidArea,
        displayId: this.displayId,
        focused: this.focused
      })
      EnvParamReceiver({
        breakInfo: this.breakInfo,
        vpSize: this.windowSize,
        pxSize: this.pixelSize,
        highlighted: this.highlighted
      })
      Text('avoidPxBottom=' + this.avoidAreaPx.bottom.toString())
    }
  }
}

@Component
struct EnvBreakpointScenario08 {
  @Env(SystemProperties.BREAK_POINT) breakInfo: ExpandedBreakpointInfo
  @Env(SystemProperties.WINDOW_AVOID_AREA) avoidArea: AvoidAreaAlias
  @Env(SystemProperties.WINDOW_AVOID_AREA_PX) avoidAreaPx: AvoidAreaPxAlias
  @Env(SystemProperties.WINDOW_SIZE) windowSize: WindowSizeAlias
  @Env(SystemProperties.WINDOW_SIZE_PX) pixelSize: PixelSizeAlias
  @Env(SystemProperties.WINDOW_DISPLAY_ID) displayId: number
  @Env(SystemProperties.WINDOW_SYSTEM_DENSITY) density: number
  @Env(SystemProperties.WINDOW_IS_FOCUSED) focused: boolean
  @Env(SystemProperties.WINDOW_IS_HIGHLIGHTED) highlighted: boolean

  build() {
    Column() {
      Text('EnvBreakpointScenario08')
      EnvInfoText('break', this.breakInfo.widthBreakpoint.toString())
      EnvInfoText('height', this.breakInfo.heightBreakpoint.toString())
      EnvInfoText('density', this.density.toString())
      EnvSizeCard('vp08', this.windowSize.width, this.windowSize.height)
      EnvSizeCard('px08', this.pixelSize.width, this.pixelSize.height)
      EnvRegularReceiver({
        breakInfo: this.breakInfo,
        avoidArea: this.avoidArea,
        displayId: this.displayId,
        focused: this.focused
      })
      EnvParamReceiver({
        breakInfo: this.breakInfo,
        vpSize: this.windowSize,
        pxSize: this.pixelSize,
        highlighted: this.highlighted
      })
      Text('avoidPxBottom=' + this.avoidAreaPx.bottom.toString())
    }
  }
}

@Component
struct EnvBreakpointScenario09 {
  @Env(SystemProperties.BREAK_POINT) breakInfo: CompactBreakpointInfo
  @Env(SystemProperties.WINDOW_AVOID_AREA) avoidArea: UIEnvWindowAvoidAreaInfoVP
  @Env(SystemProperties.WINDOW_AVOID_AREA_PX) avoidAreaPx: UIEnvWindowAvoidAreaInfoPX
  @Env(SystemProperties.WINDOW_SIZE) windowSize: SizeInVP
  @Env(SystemProperties.WINDOW_SIZE_PX) pixelSize: Size
  @Env(SystemProperties.WINDOW_DISPLAY_ID) displayId: number
  @Env(SystemProperties.WINDOW_SYSTEM_DENSITY) density: number
  @Env(SystemProperties.WINDOW_IS_FOCUSED) focused: boolean
  @Env(SystemProperties.WINDOW_IS_HIGHLIGHTED) highlighted: boolean

  build() {
    Column() {
      Text('EnvBreakpointScenario09')
      EnvInfoText('break', this.breakInfo.widthBreakpoint.toString())
      EnvInfoText('height', this.breakInfo.heightBreakpoint.toString())
      EnvInfoText('density', this.density.toString())
      EnvSizeCard('vp09', this.windowSize.width, this.windowSize.height)
      EnvSizeCard('px09', this.pixelSize.width, this.pixelSize.height)
      EnvRegularReceiver({
        breakInfo: this.breakInfo,
        avoidArea: this.avoidArea,
        displayId: this.displayId,
        focused: this.focused
      })
      EnvParamReceiver({
        breakInfo: this.breakInfo,
        vpSize: this.windowSize,
        pxSize: this.pixelSize,
        highlighted: this.highlighted
      })
      Text('avoidPxBottom=' + this.avoidAreaPx.bottom.toString())
    }
  }
}

@Component
struct EnvBreakpointScenario10 {
  @Env(SystemProperties.BREAK_POINT) breakInfo: BreakpointAlias
  @Env(SystemProperties.WINDOW_AVOID_AREA) avoidArea: AvoidAreaAlias
  @Env(SystemProperties.WINDOW_AVOID_AREA_PX) avoidAreaPx: AvoidAreaPxAlias
  @Env(SystemProperties.WINDOW_SIZE) windowSize: WindowSizeAlias
  @Env(SystemProperties.WINDOW_SIZE_PX) pixelSize: PixelSizeAlias
  @Env(SystemProperties.WINDOW_DISPLAY_ID) displayId: number
  @Env(SystemProperties.WINDOW_SYSTEM_DENSITY) density: number
  @Env(SystemProperties.WINDOW_IS_FOCUSED) focused: boolean
  @Env(SystemProperties.WINDOW_IS_HIGHLIGHTED) highlighted: boolean

  build() {
    Column() {
      Text('EnvBreakpointScenario10')
      EnvInfoText('break', this.breakInfo.widthBreakpoint.toString())
      EnvInfoText('height', this.breakInfo.heightBreakpoint.toString())
      EnvInfoText('density', this.density.toString())
      EnvSizeCard('vp10', this.windowSize.width, this.windowSize.height)
      EnvSizeCard('px10', this.pixelSize.width, this.pixelSize.height)
      EnvRegularReceiver({
        breakInfo: this.breakInfo,
        avoidArea: this.avoidArea,
        displayId: this.displayId,
        focused: this.focused
      })
      EnvParamReceiver({
        breakInfo: this.breakInfo,
        vpSize: this.windowSize,
        pxSize: this.pixelSize,
        highlighted: this.highlighted
      })
      Text('avoidPxBottom=' + this.avoidAreaPx.bottom.toString())
    }
  }
}

@Component
struct EnvBreakpointScenario11 {
  @Env(SystemProperties.BREAK_POINT) breakInfo: ExpandedBreakpointInfo
  @Env(SystemProperties.WINDOW_AVOID_AREA) avoidArea: UIEnvWindowAvoidAreaInfoVP
  @Env(SystemProperties.WINDOW_AVOID_AREA_PX) avoidAreaPx: UIEnvWindowAvoidAreaInfoPX
  @Env(SystemProperties.WINDOW_SIZE) windowSize: SizeInVP
  @Env(SystemProperties.WINDOW_SIZE_PX) pixelSize: Size
  @Env(SystemProperties.WINDOW_DISPLAY_ID) displayId: number
  @Env(SystemProperties.WINDOW_SYSTEM_DENSITY) density: number
  @Env(SystemProperties.WINDOW_IS_FOCUSED) focused: boolean
  @Env(SystemProperties.WINDOW_IS_HIGHLIGHTED) highlighted: boolean

  build() {
    Column() {
      Text('EnvBreakpointScenario11')
      EnvInfoText('break', this.breakInfo.widthBreakpoint.toString())
      EnvInfoText('height', this.breakInfo.heightBreakpoint.toString())
      EnvInfoText('density', this.density.toString())
      EnvSizeCard('vp11', this.windowSize.width, this.windowSize.height)
      EnvSizeCard('px11', this.pixelSize.width, this.pixelSize.height)
      EnvRegularReceiver({
        breakInfo: this.breakInfo,
        avoidArea: this.avoidArea,
        displayId: this.displayId,
        focused: this.focused
      })
      EnvParamReceiver({
        breakInfo: this.breakInfo,
        vpSize: this.windowSize,
        pxSize: this.pixelSize,
        highlighted: this.highlighted
      })
      Text('avoidPxBottom=' + this.avoidAreaPx.bottom.toString())
    }
  }
}

@Component
struct EnvBreakpointScenario12 {
  @Env(SystemProperties.BREAK_POINT) breakInfo: CompactBreakpointInfo
  @Env(SystemProperties.WINDOW_AVOID_AREA) avoidArea: AvoidAreaAlias
  @Env(SystemProperties.WINDOW_AVOID_AREA_PX) avoidAreaPx: AvoidAreaPxAlias
  @Env(SystemProperties.WINDOW_SIZE) windowSize: WindowSizeAlias
  @Env(SystemProperties.WINDOW_SIZE_PX) pixelSize: PixelSizeAlias
  @Env(SystemProperties.WINDOW_DISPLAY_ID) displayId: number
  @Env(SystemProperties.WINDOW_SYSTEM_DENSITY) density: number
  @Env(SystemProperties.WINDOW_IS_FOCUSED) focused: boolean
  @Env(SystemProperties.WINDOW_IS_HIGHLIGHTED) highlighted: boolean

  build() {
    Column() {
      Text('EnvBreakpointScenario12')
      EnvInfoText('break', this.breakInfo.widthBreakpoint.toString())
      EnvInfoText('height', this.breakInfo.heightBreakpoint.toString())
      EnvInfoText('density', this.density.toString())
      EnvSizeCard('vp12', this.windowSize.width, this.windowSize.height)
      EnvSizeCard('px12', this.pixelSize.width, this.pixelSize.height)
      EnvRegularReceiver({
        breakInfo: this.breakInfo,
        avoidArea: this.avoidArea,
        displayId: this.displayId,
        focused: this.focused
      })
      EnvParamReceiver({
        breakInfo: this.breakInfo,
        vpSize: this.windowSize,
        pxSize: this.pixelSize,
        highlighted: this.highlighted
      })
      Text('avoidPxBottom=' + this.avoidAreaPx.bottom.toString())
    }
  }
}

@Component
struct EnvBreakpointScenario13 {
  @Env(SystemProperties.BREAK_POINT) breakInfo: BreakpointAlias
  @Env(SystemProperties.WINDOW_AVOID_AREA) avoidArea: UIEnvWindowAvoidAreaInfoVP
  @Env(SystemProperties.WINDOW_AVOID_AREA_PX) avoidAreaPx: UIEnvWindowAvoidAreaInfoPX
  @Env(SystemProperties.WINDOW_SIZE) windowSize: SizeInVP
  @Env(SystemProperties.WINDOW_SIZE_PX) pixelSize: Size
  @Env(SystemProperties.WINDOW_DISPLAY_ID) displayId: number
  @Env(SystemProperties.WINDOW_SYSTEM_DENSITY) density: number
  @Env(SystemProperties.WINDOW_IS_FOCUSED) focused: boolean
  @Env(SystemProperties.WINDOW_IS_HIGHLIGHTED) highlighted: boolean

  build() {
    Column() {
      Text('EnvBreakpointScenario13')
      EnvInfoText('break', this.breakInfo.widthBreakpoint.toString())
      EnvInfoText('height', this.breakInfo.heightBreakpoint.toString())
      EnvInfoText('density', this.density.toString())
      EnvSizeCard('vp13', this.windowSize.width, this.windowSize.height)
      EnvSizeCard('px13', this.pixelSize.width, this.pixelSize.height)
      EnvRegularReceiver({
        breakInfo: this.breakInfo,
        avoidArea: this.avoidArea,
        displayId: this.displayId,
        focused: this.focused
      })
      EnvParamReceiver({
        breakInfo: this.breakInfo,
        vpSize: this.windowSize,
        pxSize: this.pixelSize,
        highlighted: this.highlighted
      })
      Text('avoidPxBottom=' + this.avoidAreaPx.bottom.toString())
    }
  }
}

@Component
struct EnvBreakpointScenario14 {
  @Env(SystemProperties.BREAK_POINT) breakInfo: ExpandedBreakpointInfo
  @Env(SystemProperties.WINDOW_AVOID_AREA) avoidArea: AvoidAreaAlias
  @Env(SystemProperties.WINDOW_AVOID_AREA_PX) avoidAreaPx: AvoidAreaPxAlias
  @Env(SystemProperties.WINDOW_SIZE) windowSize: WindowSizeAlias
  @Env(SystemProperties.WINDOW_SIZE_PX) pixelSize: PixelSizeAlias
  @Env(SystemProperties.WINDOW_DISPLAY_ID) displayId: number
  @Env(SystemProperties.WINDOW_SYSTEM_DENSITY) density: number
  @Env(SystemProperties.WINDOW_IS_FOCUSED) focused: boolean
  @Env(SystemProperties.WINDOW_IS_HIGHLIGHTED) highlighted: boolean

  build() {
    Column() {
      Text('EnvBreakpointScenario14')
      EnvInfoText('break', this.breakInfo.widthBreakpoint.toString())
      EnvInfoText('height', this.breakInfo.heightBreakpoint.toString())
      EnvInfoText('density', this.density.toString())
      EnvSizeCard('vp14', this.windowSize.width, this.windowSize.height)
      EnvSizeCard('px14', this.pixelSize.width, this.pixelSize.height)
      EnvRegularReceiver({
        breakInfo: this.breakInfo,
        avoidArea: this.avoidArea,
        displayId: this.displayId,
        focused: this.focused
      })
      EnvParamReceiver({
        breakInfo: this.breakInfo,
        vpSize: this.windowSize,
        pxSize: this.pixelSize,
        highlighted: this.highlighted
      })
      Text('avoidPxBottom=' + this.avoidAreaPx.bottom.toString())
    }
  }
}

@ComponentV2
struct EnvV2Scenario01 {
  @Local title: string = 'Env V2 01'
  @Local refreshCount: number = 1
  @Param routeName: string = 'env-01'

  @Computed get caption(): string {
    return this.routeName + ':' + this.refreshCount.toString()
  }

  @Monitor('refreshCount')
  onRefreshCountChange(): void {
    console.log('env refresh changed 01')
  }

  build() {
    Column() {
      Text(this.title)
      Text(this.caption)
      Button('Refresh 01').onClick(() => {
        this.refreshCount++
      })
    }
  }
}

@ComponentV2
struct EnvV2Scenario02 {
  @Local title: string = 'Env V2 02'
  @Local refreshCount: number = 2
  @Param routeName: string = 'env-02'

  @Computed get caption(): string {
    return this.routeName + ':' + this.refreshCount.toString()
  }

  @Monitor('refreshCount')
  onRefreshCountChange(): void {
    console.log('env refresh changed 02')
  }

  build() {
    Column() {
      Text(this.title)
      Text(this.caption)
      Button('Refresh 02').onClick(() => {
        this.refreshCount++
      })
    }
  }
}

@ComponentV2
struct EnvV2Scenario03 {
  @Local title: string = 'Env V2 03'
  @Local refreshCount: number = 3
  @Param routeName: string = 'env-03'

  @Computed get caption(): string {
    return this.routeName + ':' + this.refreshCount.toString()
  }

  @Monitor('refreshCount')
  onRefreshCountChange(): void {
    console.log('env refresh changed 03')
  }

  build() {
    Column() {
      Text(this.title)
      Text(this.caption)
      Button('Refresh 03').onClick(() => {
        this.refreshCount++
      })
    }
  }
}

@ComponentV2
struct EnvV2Scenario04 {
  @Local title: string = 'Env V2 04'
  @Local refreshCount: number = 4
  @Param routeName: string = 'env-04'

  @Computed get caption(): string {
    return this.routeName + ':' + this.refreshCount.toString()
  }

  @Monitor('refreshCount')
  onRefreshCountChange(): void {
    console.log('env refresh changed 04')
  }

  build() {
    Column() {
      Text(this.title)
      Text(this.caption)
      Button('Refresh 04').onClick(() => {
        this.refreshCount++
      })
    }
  }
}

@ComponentV2
struct EnvV2Scenario05 {
  @Local title: string = 'Env V2 05'
  @Local refreshCount: number = 5
  @Param routeName: string = 'env-05'

  @Computed get caption(): string {
    return this.routeName + ':' + this.refreshCount.toString()
  }

  @Monitor('refreshCount')
  onRefreshCountChange(): void {
    console.log('env refresh changed 05')
  }

  build() {
    Column() {
      Text(this.title)
      Text(this.caption)
      Button('Refresh 05').onClick(() => {
        this.refreshCount++
      })
    }
  }
}

@Entry
@Component
struct EnvGenerated0831Entry {
  build() {
    Scroll() {
      Column() {
        Text('Generated @Env Validation 0831').fontSize(20)
        EnvBreakpointScenario01()
        EnvBreakpointScenario02()
        EnvBreakpointScenario03()
        EnvBreakpointScenario04()
        EnvBreakpointScenario05()
        EnvBreakpointScenario06()
        EnvBreakpointScenario07()
        EnvBreakpointScenario08()
        EnvBreakpointScenario09()
        EnvBreakpointScenario10()
        EnvBreakpointScenario11()
        EnvBreakpointScenario12()
        EnvBreakpointScenario13()
        EnvBreakpointScenario14()
        EnvV2Scenario01({ routeName: 'environment-01' })
        EnvV2Scenario02({ routeName: 'environment-02' })
        EnvV2Scenario03({ routeName: 'environment-03' })
        EnvV2Scenario04({ routeName: 'environment-04' })
        EnvV2Scenario05({ routeName: 'environment-05' })
      }
    }
  }
}
