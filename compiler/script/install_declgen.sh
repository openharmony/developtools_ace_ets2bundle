#!/bin/bash
# Copyright (c) 2025 Huawei Device Co., Ltd.
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

#!/bin/bash
set -e

if [ ! -d "../compiler" ]; then
    echo "Error: must run this script in ace_ets2bundle/compiler root directory"
    exit 1
fi

CURRENT_DIR=$(pwd)

DECLGEN_ROOT_DIR="../../../arkcompiler/runtime_core/static_core/plugins/ets/tools/declgen_ts2sts"

cd "$DECLGEN_ROOT_DIR" || { echo "Failed to change directory to $DECLGEN_ROOT_DIR"; exit 1; }

npm install
npm run build

# Generate the npm package using `npm pack`
if npm pack; then
    tarball=$(ls *.tgz)  # Get the generated tarball file name
    if [ -f "$tarball" ]; then
        # Move the tarball to the original directory
        mv "$tarball" "$CURRENT_DIR/"

        # Go back to the original directory and extract the tarball
        cd "$CURRENT_DIR"
        tar -xvzf "$tarball"

        # Rename the extracted directory (assuming it is named after the package)
        extracted_dir=$(tar -tf "$tarball" | head -n 1 | cut -f1 -d"/")  # Get the extracted folder name
        mv "$extracted_dir" "./node_modules/declgen"  # Rename to 'declgen'

        # Optionally, remove the tarball after extraction
        rm "$tarball"

        echo "Build successfully packed, extracted, and renamed to 'declgen' in $CURRENT_DIR"
    else
        echo "Error: No tarball found, cannot proceed"
        exit 1
    fi
else
    echo "Error: npm pack failed"
    exit 1
fi
