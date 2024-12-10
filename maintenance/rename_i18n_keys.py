import argparse
import json
from collections import OrderedDict
from pathlib import Path
from typing import cast
from clean_locales import (
    ALL_LOCALES,
    get_flatten_keys,
    get_locale_json,
    save_locale_json,
)


def _parse_cli_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(add_help=False)
    parser.add_argument(
        "--keys",
        default=None,
        help="A key replace like 'my.previous.key:my.new.k",
    )
    parser.add_argument(
        "--all",
        action="store_true",
        default=False,
        help="Apply changes to all locales (default: only en.json)",
    )
    parser.add_argument(
        "--file", default=None, help="File path with 'current:new' keys on each lines"
    )

    return parser.parse_args()


def get_keys(params: argparse.Namespace) -> list[tuple[str, str]]:
    keys = []

    if params.file:
        file = Path(params.file)
        assert file.exists(), "file does'nt exists."
        with file.open() as fp:
            keys = fp.readlines()

    if params.keys:
        keys.append(params.keys)

    keys = [ks.strip() for ks in keys]
    keys = [ks for ks in keys if ks]

    return [cast(tuple[str, str], tuple(key.split(":", 1))) for key in keys]


def pop_key(keys: list[str], data: OrderedDict) -> str:
    k, *rest = keys

    if rest:
        v = pop_key(rest, data[k])
        if not data[k]:
            data.pop(k)
        return v
    else:
        return data.pop(k)


def insert_key(keys: list[str], data: OrderedDict, v: str) -> None:
    k, *rest = keys

    if rest:
        if k not in data:
            data[k] = {}
        insert_key(rest, data[k], v)
    else:
        if k in data:
            data[k] += "||" + v
        else:
            data[k] = v


if __name__ == "__main__":
    params = _parse_cli_args()
    keys = get_keys(params)
    locales = ALL_LOCALES if params.all else set(["en"])

    for locale in locales:
        locale_data = get_locale_json(locale)
        locale_keys = get_flatten_keys(locale_data)
        for k1, k2 in keys:
            if k1 not in locale_keys:
                print(f"[WARNING] key '{k1}' doesn't exists in file.")
                continue

            v = pop_key(k1.split("."), locale_data)
            insert_key(k2.split("."), locale_data, v)

        save_locale_json(locale, locale_data, sort=locale == "en")
