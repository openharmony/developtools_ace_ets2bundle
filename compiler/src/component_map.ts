/*
 * Copyright (c) 2021 Huawei Device Co., Ltd.
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

export const COMPONENT_MAP: any = {
  FormComponent: {
    atomic: true,
    attrs: [
      'size', 'moduleName', 'dimension', 'allowUpdate', 'visibility',
      'onAcquired', 'onError', 'onRouter'
    ]
  },
  Image: {
    atomic: true,
    attrs: [
      'alt', 'objectFit', 'matchTextDirection', 'fitOriginalSize', 'objectRepeat', 'renderMode', 'interpolation',
      'onComplete', 'onError', 'onFinish', 'sourceSize', 'fillColor', 'autoResize'
    ]
  },
  ImageAnimator: {
    atomic: true,
    attrs: [
      'images', 'state', 'duration', 'reverse', 'fixedSize', 'preDecode', 'fillMode', 'iterations', 'onStart',
      'onPause', 'onRepeat', 'onCancel', 'onFinish'
    ]
  },
  Animator: {
    atomic: true,
    attrs: [
      'state', 'duration', 'curve', 'delay', 'fillMode', 'iterations', 'playMode', 'motion', 'onStart',
      'onPause', 'onRepeat', 'onCancel', 'onFinish', 'onFrame'
    ]
  },
  Refresh: {
    atomic: true,
    attrs: [
      'refreshing', 'offset', 'friction',
      'onStateChange', 'onRefreshing'
    ]
  },
  SpringProp: {
    atomic: true
  },
  SpringMotion: {
    atomic: true
  },
  FrictionMotion: {
    atomic: true
  },
  ScrollMotion: {
    atomic: true
  },
  Text: {
    children: ['Span'],
    attrs: [
      'fontColor', 'fontSize', 'fontStyle', 'fontWeight', 'textAlign', 'lineHeight', 'textOverflow', 'maxLines',
      'decoration', 'letterSpacing', 'textCase', 'baselineOffset', 'minFontSize', 'maxFontSize'
    ]
  },
  TextPicker: {
    atomic: true,
    attrs: ['defaultPickerItemHeight', 'onAccept', 'onCancel', 'onChange']
  },
  DatePicker: {
    atomic: true,
    attrs: ['lunar', 'onChange', 'useMilitaryTime']
  },
  Span: {
    atomic: true,
    attrs: [
      'fontColor', 'fontSize', 'fontStyle', 'fontFamily', 'fontWeight', 'decoration', 'letterSpacing', 'textCase'
    ]
  },
  Button: {
    attrs: ['type', 'stateEffect', 'fontColor', 'fontSize', 'fontWeight']
  },
  Divider: {
    atomic: true,
    attrs: ['color', 'vertical', 'strokeWidth', 'lineCap']
  },
  Piece: {
    atomic: true,
    attrs: ['iconPosition']
  },
  Slider: {
    atomic: true,
    attrs: ['blockColor', 'trackColor', 'selectedColor', 'minLabel','maxLabel', 'showSteps', 'showTips', 'onChange']
  },
  Counter: {
    attrs: [
      'onStateChange', 'onInc',
      'onDec', 'height', 'width'
    ]
  },
  Row: {
    attrs: ['alignItems']
  },
  Column: {
    attrs: ['alignItems']
  },
  Stack: {
    attrs: ['alignContent']
  },
  List: {
    children: ['ListItem', 'Section'],
    attrs: [
      'listDirection', 'scrollBar', 'edgeEffect', 'divider', 'editMode', 'cachedCount', 'chainAnimation',
      'onScroll', 'onReachStart', 'onReachEnd', 'onScrollStop', 'onItemDelete', 'onItemMove'
    ]
  },
  ListItem: {
    parents: ['List'],
    single: true,
    attrs: ['sticky', 'editable']
  },
  Grid: {
    children: ['GridItem'],
    attrs: ['columnsTemplate', 'rowsTemplate', 'columnsGap', 'rowsGap', 'scrollBar', 'scrollBarWidth', 'scrollBarColor']
  },
  GridItem: {
    parents: ['Grid'],
    single: true,
    attrs: ['rowStart', 'rowEnd', 'columnStart', 'columnEnd', 'forceRebuild']
  },
  GridContainer: {
    attrs: ['columns', 'sizeType', 'gutter', 'margin']
  },
  Hyperlink: {
    attrs: ['color']
  },
  Swiper: {
    attrs: [
      'index', 'autoPlay', 'interval', 'indicator',
      'loop', 'duration', 'vertical', 'itemSpace', 'displayMode', 'onChange'
    ]
  },
  Rating: {
    attrs: ['stars', 'stepSize', 'starStyle', 'onChange']
  },
  Calendar: {
    attrs: [
      'date', 'showLunar', 'startOfWeek', 'offDays', 'onSelectChange', 'onRequestData',
      'currentData', 'preData', 'nextData', 'needSlide', 'showHoliday', 'direction',
      'currentDayStyle', 'nonCurrentDayStyle', 'todayStyle', 'weekStyle', 'workStateStyle'
    ]
  },
  Panel: {
    attrs: [
      'type', 'mode', 'dragBar', 'fullHeight',
      'halfHeight', 'miniHeight', 'show', 'onChange'
    ]
  },
  Navigator: {
    single: true,
    attrs: ['target', 'type', 'params', 'active']
  },
  Sheet: {
    children: ['Section'],
    attrs: []
  },
  Section: {
    attrs: []
  },
  QRCode: {
    attrs: ['color', 'backgroundColor']
  },
  Flex: {
    attrs: []
  },
  LoadingProgress: {
    atomic: true,
    attrs: ['color']
  },
  NavigationView: {
    attrs: []
  },
  Scroll: {
    attrs: [
      'scrollable', 'onScroll', 'onScrollEdge', 'onScrollEnd', 'scrollBar', 'scrollBarColor',
      'scrollBarWidth', 'edgeEffect'
    ]
  },
  Shape: {
    children: ['Rect', 'Path', 'Circle', 'Ellipse', 'Shape', 'Polyline', 'Polygon', 'Image', 'Text'],
    attrs: [
      'stroke', 'fill', 'strokeDashOffset', 'strokeLineCap',
      'strokeLineJoin', 'strokeMiterLimit', 'strokeOpacity',
      'fillOpacity', 'strokeWidth', 'antiAlias', 'strokeDashArray',
      'viewPort'
    ]
  },
  Progress: {
    atomic: true,
    attrs: [
      'value', 'color', 'cricularStyle'
    ]
  },
  Rect: {
    atomic: true,
    attrs: [
      'radiusWidth', 'radiusHeight', 'radius'
    ]
  },
  Path: {
    atomic: true,
    attrs: [
      'commands'
    ]
  },
  Circle: {
    atomic: true
  },
  Ellipse: {
    atomic: true
  },
  Camera: {
    atomic: true,
    attrs: ['devicePosition']
  },
  Tabs: {
    children: ['TabContent'],
    attrs: [
      'vertical', 'scrollable', 'barMode', 'barWidth', 'barHeight', 'animationDuration',
      'onChange'
    ]
  },
  TabContent: {
    parents: ['Tabs'],
    attrs: ['tabBar']
  },
  PageTransitionEnter: {
    atomic: true,
    attrs: ['onEnter']
  },
  PageTransitionExit: {
    atomic: true,
    attrs: ['onExit']
  },
  Blank: {
    parents: ['Row', 'Column'],
    automic: true,
    attrs: ['color']
  },
  RowSplit: {
    attrs: ['resizeable']
  },
  ColumnSplit: {
    attrs: ['resizeable']
  },
  Toggle: {
    attrs: ['onChange', 'selectedColor', 'swithPointStyle']
  },
  AlertDialog: {
    attrs: ['show']
  },
  ActionSheet: {
    attrs: ['show']
  },
  Video: {
    atomic: true,
    attrs: [
      'muted', 'autoPlay', 'controls', 'loop', 'objectFit', 'onSeeking', 'onFullscreenChange',
      'onStart', 'onPause', 'onPrepared', 'onFinish', 'onSeeked', 'onUpdate', 'onError'
    ]
  },
  AbilityComponent: {
    attrs: ['onReady', 'onDestroy', 'onAbilityCreated', 'onAbilityMoveToFront', 'onAbilityWillRemove']
  },
  AlphabetIndexer: {
    attrs: [
      'onSelected', 'selectedColor', 'popupColor', 'selectedBackgroundColor', 'popupBackground', 'usingPopup',
      'selectedFont', 'popupFont', 'itemSize', 'font', 'color', 'alignStyle'
    ]
  },
  Radio: {
    atomic: true,
    attrs: ['checked', 'onChange']
  },
  GeometryView: {
    atomic: true
  },
  DataPanel: {
    atomic: false,
    attrs: ['closeEffect']
  },
  Badge: {
    atomics: true,
    attrs: []
  },
  Line: {
    atomic: true,
    attrs: [
      'startPoint','endPoint'
    ]
  },
  Polygon: {
    atomic: true,
    attrs: ['points']
  },
  Polyline: {
    atomic: true,
    attrs: ['points']
  },
  Gauge: {
    atomic: true,
    attrs: ['value', 'startAngle', 'endAngle', 'colors', 'strokeWidth', 'labelTextConfig', 'labelColorConfig']
  },
  TextArea: {
    atomic: true,
    attrs: [
      'placeholderColor', 'placeholderFont', 'textAlign', 'caretColor', 'correction', 'onChange'
    ]
  },
  TextInput: {
    atomic: true,
    attrs: [
      'textInputType', 'placeholderColor', 'placeholderFont', 'textInputAction', 'inputFilter', 'caretColor',
      'correction', 'onEditChanged', 'onSubmit', 'onChange'
    ]
  },
  Marquee: {
    atomic: true,
    attrs: ['onStart', 'onBounce', 'onFinish']
  },
  Menu: {
    children: ['Option'],
    attrs: ['show', 'showPosition'],
  },
  Option: {
    parents: ['Menu'],
    attrs: [],
  },
};

const COMMON_ATTRS: Set<string> = new Set([
  'width', 'height', 'size', 'constraintSize', 'layoutPriority', 'layoutWeight',
  'padding', 'paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom',
  'margin', 'marginLeft', 'marginRight', 'marginTop', 'marginBottom',
  'border', 'borderStyle', 'borderWidth', 'borderColor', 'borderRadius',
  'backgroundColor', 'backgroundImage', 'backgroundImageSize', 'backgroundImagePosition',
  'opacity', 'animation', 'transition',
  'navigationTitle', 'navigationSubTitle', 'hideNavigationBar', 'hideNavigationBackButton',
  'toolBar', 'hideToolBar', 'onClick', 'onTouch', 'onKeyEvent', 'onHover',
  'blur', 'backdropBlur', 'windowBlur', 'translate', 'rotate', 'scale', 'transform',
  'onAppear', 'onDisAppear', 'visibility', 'flexBasis', 'flexShrink', 'flexGrow', 'alignSelf',
  'useAlign', 'zIndex', 'sharedTransition', 'direction', 'align', 'position', 'markAnchor', 'offset',
  'enabled', 'aspectRatio', 'displayPriority',
  'onDrag', 'onDragEnter', 'onDragMove', 'onDragLeave', 'onDrop',
  'overlay', 'linearGradient', 'sweepGradient', 'radialGradient',
  'gridOffset', 'gridSpan', 'useSizeType',
  'motionPath', 'clip', 'shadow', 'mask',
  'accessibilityGroup', 'accessibilityText', 'accessibilityDescription',
  'accessibilityImportance', 'onAccessibility', 'grayscale', 'brightness', 'contrast',
  'saturate', 'geometryTransition',
  'bindPopup', 'colorBlend', 'invert', 'sepia', 'hueRotate'
]);
const TRANSITION_COMMON_ATTRS: Set<string> = new Set([
  'slide', 'translate', 'scale', 'opacity'
]);
export const GESTURE_ATTRS: Set<string> = new Set([
  'gesture', 'parallelGesture', 'priorityGesture'
]);

export const forbiddenUseStateType: Set<string> = new Set(['Scroller', 'SwiperScroller']);

export const INNER_COMPONENT_NAMES: Set<string> = new Set();
export const BUILDIN_CONTAINER_COMPONENT: Set<string> = new Set();
export const BUILDIN_STYLE_NAMES: Set<string> = new Set([
  ...COMMON_ATTRS, ...GESTURE_ATTRS, ...TRANSITION_COMMON_ATTRS
]);
export const AUTOMIC_COMPONENT: Set<string> = new Set();
export const SINGLE_CHILD_COMPONENT: Set<string> = new Set();
export const SPECIFIC_CHILD_COMPONENT: Map<string, Set<string>> = new Map();
export const GESTURE_TYPE_NAMES: Set<string> = new Set([
  'TapGesture', 'LongPressGesture', 'PanGesture', 'PinchGesture', 'RotationGesture', 'GestureGroup'
]);
export const CUSTOM_BUILDER_METHOD: Set<string> = new Set();

export interface ExtendParamterInterfance {
  attribute: string,
  parameterCount: number
}
export const EXTEND_ATTRIBUTE: Map<string, Set<ExtendParamterInterfance>> = new Map();

export const JS_BIND_COMPONENTS: Set<string> = new Set([
  ...GESTURE_TYPE_NAMES, 'Gesture',
  'PanGestureOption', 'CustomDialogController', 'Storage', 'Scroller', 'SwiperController',
  'TabsController', 'CalendarController', 'AbilityController', 'VideoController'
]);

(function initComponent() {
  Object.keys(COMPONENT_MAP).forEach((componentName) => {
    INNER_COMPONENT_NAMES.add(componentName);
    JS_BIND_COMPONENTS.add(componentName);
    if (!COMPONENT_MAP[componentName].atomic) {
      BUILDIN_CONTAINER_COMPONENT.add(componentName);
    } else {
      AUTOMIC_COMPONENT.add(componentName);
    }
    if (COMPONENT_MAP[componentName].single) {
      SINGLE_CHILD_COMPONENT.add(componentName);
    }
    if (COMPONENT_MAP[componentName].children) {
      SPECIFIC_CHILD_COMPONENT.set(componentName,
        new Set([...COMPONENT_MAP[componentName].children]));
    }
    if (COMPONENT_MAP[componentName].attrs && COMPONENT_MAP[componentName].attrs.length) {
      COMPONENT_MAP[componentName].attrs.forEach((item) => {
        BUILDIN_STYLE_NAMES.add(item);
      });
    }
  });
})();
