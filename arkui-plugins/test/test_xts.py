#!/usr/bin/env python
# -*- coding: utf-8 -*-
# Copyright (c) 2026 Huawei Device Co., Ltd.
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
import json
from pathlib import Path


# Default path to the template - can be overridden by --template argument
DEFAULT_TEMPLATE_PATH = Path(__file__).parent / "demo" / "localtest" / "build_config_template.json"


def find_static_folders(root_dir):
    """Find all directories ending with '_static' under root_dir."""
    root = Path(root_dir)
    if not root.exists():
        print(f"Error: Directory '{root_dir}' does not exist.")
        return []

    static_folders = [p for p in root.rglob("*") if p.is_dir() and p.name.endswith("_static")]
    return static_folders


def get_entry_ability_path(static_folder):
    """Find EntryAbility.ets path in the static folder."""
    entry_ability = static_folder / "entry" / "src" / "main" / "ets" / "entryability" / "EntryAbility.ets"
    if entry_ability.exists():
        return str(entry_ability)
    return None


def get_module_json_path(static_folder):
    """Find module.json5 path in the static folder."""
    module_json = static_folder / "entry" / "src" / "main" / "module.json5"
    if module_json.exists():
        return str(module_json)
    return None


def load_template(template_path):
    """Load the original build_config_template.json."""
    if not template_path.exists():
        raise FileNotFoundError(f"Template file not found: {template_path}")

    with open(template_path, "r") as f:
        return json.load(f)


def modify_template_for_static_folder(template, static_folder):
    """Modify the template config for a specific static folder."""
    static_folder_str = str(static_folder)
    ets_path = static_folder / "entry" / "src" / "main" / "ets"

    # Find required paths
    entry_ability_path = get_entry_ability_path(static_folder)
    module_json_path = get_module_json_path(static_folder)

    if not entry_ability_path or not module_json_path:
        return None

    # Find all .ets files under entry/src/main/ets
    ets_path_str = str(ets_path)
    compile_files = []
    if ets_path.exists():
        for ets_file in ets_path.rglob("*.ets"):
            compile_files.append(str(ets_file))
        compile_files.sort()

    if not compile_files:
        return None

    # Create a copy of the template and modify it
    config = template.copy()

    # Modify the fields according to the git diff
    config["compileFiles"] = compile_files
    config["entryFiles"] = [entry_ability_path]
    config["projectRootPath"] = static_folder_str
    config["moduleRootPath"] = ets_path_str
    config["aceModuleJsonPath"] = ''
    config["buildLoaderJson"] = ''
    config["codeRootPath"] = ets_path_str

    return config


def main():
    parser = argparse.ArgumentParser(
        description="Generate build_config_template.json for XTS _static folders"
    )
    parser.add_argument("--xts-root", required=True, help="Root directory to search for _static folders")
    parser.add_argument("--output-dir", required=True, help="Output directory for generated config files")
    parser.add_argument(
        "--template",
        default=str(DEFAULT_TEMPLATE_PATH),
        help=f"Path to build_config_template.json (default: {DEFAULT_TEMPLATE_PATH})"
    )
    parser.add_argument("--dry-run", action="store_true", help="Print config paths without generating files")
    args = parser.parse_args()

    # Load the original template
    template_path = Path(args.template)
    try:
        template = load_template(template_path)
        print(f"Loaded template from: {template_path}")
    except FileNotFoundError as e:
        print(f"Error: {e}")
        return

    # Find all static folders
    folders = find_static_folders(args.xts_root)

    if not folders:
        print("No folders ending with '_static' found.")
        return

    print(f"Found {len(folders)} folder(s) ending with '_static'")

    # Create output directory
    output_dir = Path(args.output_dir)
    if not args.dry_run:
        output_dir.mkdir(parents=True, exist_ok=True)

    # Generate config for each static folder
    valid_count = 0
    for folder in folders:
        config = modify_template_for_static_folder(template, folder)
        if config is None:
            print(f"  Skipping: {folder} (missing EntryAbility.ets or module.json5)")
            continue

        valid_count += 1
        output_file = output_dir / f"{folder.name}_build_config.json"

        if args.dry_run:
            print(f"  Would generate: {output_file}")
        else:
            with open(output_file, "w") as f:
                json.dump(config, f, indent=2)
            print(f"  Generated: {output_file}")

    print(f"\nSummary: {valid_count}/{len(folders)} folders have valid XTS structure")


if __name__ == "__main__":
    main()
