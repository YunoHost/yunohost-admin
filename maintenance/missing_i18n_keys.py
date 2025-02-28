#!/usr/bin/env python3
#
# Copyright (c) 2024 YunoHost Contributors
#
# This file is part of YunoHost (see https://yunohost.org)
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as
# published by the Free Software Foundation, either version 3 of the
# License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program. If not, see <http://www.gnu.org/licenses/>.
#

import glob
import json
import os
import re
import sys

ROOT = os.path.dirname(__file__) + "/../"
LOCALE_FOLDER = ROOT + "app/src/i18n/locales/"
REFERENCE_FILE = LOCALE_FOLDER + "en.json"

###############################################################################
#   Find used keys in python code                                             #
###############################################################################


def find_expected_string_keys():

    p1 = re.compile(r'[^a-z]v-t="\'([\w\.]+)\'')
    p2 = re.compile(r'[c\W]t\(\s*[`\']([\w\.]+)[`\']')
    p3 = re.compile(r'trad: \'([\w\.]+)\'')
    p4 = re.compile(r'i18n: ([\w\.\?]+)')

    files = glob.glob(ROOT + "app/src/*.vue")
    files.extend(glob.glob(ROOT + "app/src/*/*.vue"))
    files.extend(glob.glob(ROOT + "app/src/*/*/*.vue"))
    files.extend(glob.glob(ROOT + "app/src/*/*/*/*.vue"))
    files.extend(glob.glob(ROOT + "app/src/*.ts"))
    files.extend(glob.glob(ROOT + "app/src/*/*.ts"))
    files.extend(glob.glob(ROOT + "app/src/*/*/*.ts"))

    for file in files:
        content = open(file).read()
        for m in p1.findall(content):
            if m.endswith(".") or m.endswith("_"):
                continue
            yield m
        for m in p2.findall(content):
            if m.endswith(".") or m.endswith("_"):
                continue
            yield m
        for m in p3.findall(content):
            if m.endswith(".") or m.endswith("_"):
                continue
            yield m
        for m in p4.findall(content):
            yield m

###############################################################################
#   Compare keys used and keys defined                                        #
###############################################################################


if len(sys.argv) <= 1 or sys.argv[1] not in ["--check", "--fix"]:
    print("Please specify --check or --fix")
    sys.exit(1)

expected_string_keys = set(find_expected_string_keys())

reference_file = json.loads(open(REFERENCE_FILE).read())
keys_defined = set()
for key, value in reference_file.items():
    if isinstance(value, str):
        keys_defined.add(key)
        continue
    for subkey, subvalue in value.items():
        if isinstance(subvalue, str):
            keys_defined.add(f"{key}.{subkey}")
            continue
        for subsubkey, subsubvalue in subvalue.items():
            if isinstance(subsubvalue, str):
                keys_defined.add(f"{key}.{subkey}.{subsubkey}")
                continue
            for subsubsubkey, subsubsubvalue in subsubvalue.items():
                if isinstance(subsubsubvalue, str):
                    keys_defined.add(f"{key}.{subkey}.{subsubkey}.{subsubsubkey}")
                    continue
                for subsubsubsubkey, subsubsubsubvalue in subsubsubvalue.items():
                    keys_defined.add(f"{key}.{subkey}.{subsubkey}.{subsubsubkey}.{subsubsubsubkey}")


unused_keys = keys_defined.difference(expected_string_keys)
unused_keys = sorted(unused_keys)

undefined_keys = expected_string_keys.difference(keys_defined)
undefined_keys = sorted(undefined_keys)

mode = sys.argv[1].strip("-")
if mode == "check":
    # Unused keys are not too problematic, will be automatically
    # removed by the other autoreformat script,
    # but still informative to display them
    if unused_keys:
        print(
            "Those i18n keys appears unused:\n" "    - " + "\n    - ".join(unused_keys)
        )

    if undefined_keys:
        print(
            "Those i18n keys should be defined in en.json:\n"
            "    - " + "\n    - ".join(undefined_keys)
        )
        sys.exit(1)

elif mode == "fix":
    j = json.loads(open(REFERENCE_FILE).read())
    for key in undefined_keys:
        j[key] = "FIXME"
    for key in unused_keys:
        del j[key]

    json.dump(
        j,
        open(REFERENCE_FILE, "w"),
        indent=4,
        ensure_ascii=False,
        sort_keys=True,
    )
