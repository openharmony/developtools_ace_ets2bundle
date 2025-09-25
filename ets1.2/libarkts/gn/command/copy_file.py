#!/usr/bin/env python
# -*- coding: utf-8 -*-
# Copyright (c) 2025 Huawei Device Co., Ltd.
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

import os
import sys
import shutil


def copy_files(source_path, dest_path):
    try:
        if not os.path.isdir(source_path):
            os.makedirs(os.path.dirname(dest_path), exist_ok=True)
            shutil.copy(source_path, dest_path)
        else:
            shutil.copytree(source_path, dest_path, dirs_exist_ok=True, symlinks=True)
    except Exception as err:
        raise Exception("Copy files failed. Error: " + str(err)) from err


def main():
    dst = sys.argv[-1]
    srcs = sys.argv[1:-1]

    for src in srcs:
        copy_files(src, dst)


if __name__ == '__main__':
    sys.exit(main())