#!/usr/bin/env python
# -*- coding: utf-8 -*-
# Copyright (c) 2023 Huawei Device Co., Ltd.
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import json
import os
import sys
import subprocess
import shutil
import tarfile


def extract(package_path, dest_path, package_name):
    dest_package_path = os.path.join(dest_path, package_name)
    if (os.path.exists(dest_package_path)):
        return
    try:
        with tarfile.open(package_path, 'r:gz') as tar:
            tar.extractall(path=dest_path)
    except tarfile.TarError as e:
        print(f'Error extracting files: {e}')
    package_path = os.path.join(dest_path, 'package')
    if not (os.path.exists(dest_package_path)):
        # The default name of the decompressed npm package is package. It needs to be renamed to the specified name.
        shutil.copytree(package_path, dest_package_path, symlinks=True, dirs_exist_ok=True)
        shutil.rmtree(package_path)


def run(args):
    tsc_path = args[0]
    arkguard_path = args[1]
    source_path = args[2]
    node_modules_path = os.path.join(source_path, "node_modules")
    extract(tsc_path, node_modules_path, 'typescript')
    extract(arkguard_path, node_modules_path, 'arkguard')


if __name__ == "__main__":
    run(sys.argv[1:])