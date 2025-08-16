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
import * as fs from 'fs';

export default function writeAnnotationFile(inputPath: string, outputPath: string): void {
  if (!outputPath) {
    outputPath = inputPath;
  }

  fs.writeFileSync(path.resolve(outputPath, ANNOTATION_FILENAME), ANNOTATION, 'utf8');
}

const ANNOTATION_FILENAME: string = '@ohos.arkui.GlobalAnnotation.d.ets';

const ANNOTATION: string = `
@Retention({policy: "SOURCE"})
export declare @interface State {};

@Retention({policy: "SOURCE"})
export declare @interface Prop {};

@Retention({policy: "SOURCE"})
export declare @interface Link {};

@Retention({policy: "SOURCE"})
export declare @interface Observed {};

@Retention({policy: "SOURCE"})
export declare @interface Track {};

@Retention({policy: "SOURCE"})
export declare @interface ObjectLink {};

@Retention({policy: "SOURCE"})
export declare @interface StorageProp {
  property: string;
};

@Retention({policy: "SOURCE"})
export declare @interface StorageLink {
  property: string;
};

@Retention({policy: "SOURCE"})
export declare @interface LocalStorageProp {
  property: string;
};

@Retention({policy: "SOURCE"})
export declare @interface LocalStorageLink {
  property: string;
};

@Retention({policy: "SOURCE"})
export declare @interface Provide {
  alias: string = "";
  allowOverride: boolean = false;
};

@Retention({policy: "SOURCE"})
export declare @interface Consume {
  alias: string = "";
};

@Retention({policy: "SOURCE"})
export declare @interface Watch {
  callback: string;
};

@Retention({policy: "SOURCE"})
export declare @interface Require {};

@Retention({policy: "SOURCE"})
export declare @interface Local {};

@Retention({policy: "SOURCE"})
export declare @interface Param {};

@Retention({policy: "SOURCE"})
export declare @interface Once {};

@Retention({policy: "SOURCE"})
export declare @interface Event {};

@Retention({policy: "SOURCE"})
export declare @interface Provider {
  alias: string = "";
};

@Retention({policy: "SOURCE"})
export declare @interface Consumer {
  alias: string = "";
};

@Retention({policy: "SOURCE"})
export declare @interface Monitor {
  path: string[];
};

@Retention({policy: "SOURCE"})
export declare @interface Computed {};

@Retention({policy: "SOURCE"})
export declare @interface ObservedV2 {};

@Retention({policy: "SOURCE"})
export declare @interface Trace {};

@Retention({policy: "SOURCE"})
export declare @interface Builder {}

@Retention({policy: "SOURCE"})
export declare @interface BuilderParam {}

@Retention({policy: "SOURCE"})
export declare @interface AnimatableExtend {}

@Retention({policy: "SOURCE"})
export declare @interface Styles {}

@Retention({policy: "SOURCE"})
export declare @interface Extend {
  extend: Any
}

@Retention({policy: "SOURCE"})
export declare @interface Type {
  type: Any
}

@Retention({policy: "SOURCE"})
export @interface Reusable {}

@Retention({policy: "SOURCE"})
export @interface ReusableV2 {}

@Retention({policy: "SOURCE"})
export @interface Entry {
  routeName: string = "";
  storage: string = "";
  useSharedStorage: boolean = false;
}

@Retention({policy: "SOURCE"})
export @interface Component {}

@Retention({policy: "SOURCE"})
export @interface ComponentV2 {}

@Retention({policy: "SOURCE"})
export @interface CustomDialog {}
`;
