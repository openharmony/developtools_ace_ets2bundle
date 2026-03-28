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

import argparse
import os
import shutil
import subprocess
import sys
import tarfile


def copy_files(source_path, dest_path, is_file=False):
    try:
        if is_file or os.path.isfile(source_path):
            os.makedirs(os.path.dirname(dest_path), exist_ok=True)
            shutil.copy(source_path, dest_path)
        else:
            shutil.copytree(source_path, dest_path, dirs_exist_ok=True,
                symlinks=True)
    except Exception as err:
        raise Exception("Copy files failed. Error: " + str(err)) from err


def run_cmd(cmd, execution_path=None):
    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE,
                           stdin=subprocess.PIPE,
                           stderr=subprocess.PIPE,
                           cwd=execution_path)
    stdout, stderr = proc.communicate(timeout=1000)
    if proc.returncode != 0:
        raise Exception(stderr.decode())


def build(options):
    build_cmd = [options.npm, 'run', 'compile:plugins']
    run_cmd(build_cmd, options.source_path)

def copy_runtime_deps(source_path, output_path, deps):
    """Copy specific npm packages and their dependencies."""
    for dep in deps:
        # Try to copy from arkui-plugins' node_modules first
        dep_path = os.path.join(source_path, 'node_modules', dep)
        # If not found, try to copy from compiler's node_modules
        if not os.path.exists(dep_path):
            dep_path = os.path.join(source_path, '../compiler/node_modules', dep)
        
        if os.path.exists(dep_path):
            dest_path = os.path.join(output_path, 'node_modules', dep)
            try:
                copy_files(dep_path, dest_path)
            except Exception as e:
                print(f"Warning: Failed to copy {dep}: {e}")


def copy_output(options):
    run_cmd(['rm', '-rf', options.output_path])
    copy_files(os.path.join(options.source_path, 'lib'),
               os.path.join(options.output_path, 'lib'))

    copy_files(os.path.join(options.source_path, '../compiler/components'),
               os.path.join(options.output_path, 'lib/components'))

    # Copy InsightIntent schemas and configurations
    insight_intents_src = os.path.join(options.source_path, '../compiler/insight_intents/schema/PlayGame_1.0.1.json')
    if os.path.exists(insight_intents_src):
        copy_files(insight_intents_src,
                   os.path.join(options.output_path, 'lib/insight_intents/schema/PlayGame_1.0.1.json'), True)

    copy_files(os.path.join(options.source_path, 'package.json'),
               os.path.join(options.output_path, 'package.json'), True)

    # Copy specific runtime dependencies to avoid SDK packaging issues
    # Only copy necessary packages instead of entire node_modules
    # These will be copied from either arkui-plugins or compiler's node_modules
    runtime_deps = [
        'ajv',
        'fast-deep-equal',  # ajv dependency
        'fast-uri',  # ajv dependency
        'json-schema-traverse',  # ajv dependency
        'require-from-string',  # ajv dependency
    ]
    copy_runtime_deps(options.source_path, options.output_path, runtime_deps)


def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument('--npm', help='path to a npm exetuable')
    parser.add_argument('--source_path', help='path to build system source')
    parser.add_argument('--output_path', help='path to output')
    parser.add_argument('--root_out_dir', help='path to root out')
    parser.add_argument('--current_os', help='current_os')

    options = parser.parse_args()
    return options


def main():
    options = parse_args()

    build(options)
    copy_output(options)


if __name__ == '__main__':
    sys.exit(main())