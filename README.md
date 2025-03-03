<h1 align="center">YunoHost Admin</h1>

<div align="center">
  
![Version](https://img.shields.io/github/v/tag/yunohost/yunohost-admin?label=version&sort=semver)
[![Tests status](https://github.com/YunoHost/yunohost-admin/actions/workflows/eslint.yml/badge.svg)](https://github.com/YunoHost/yunohost-admin/actions/workflows/eslint.yml)
[![Project license](https://img.shields.io/gitlab/license/yunohost/yunohost)](https://github.com/YunoHost/yunohost/blob/dev/LICENSE)

[YunoHost](https://yunohost.org) administration web interface (VueJS client for the API).

This client is a part of the YunoHost project, and can not be installed directly.  
Please visit the YunoHost website for [installation instructions](https://yunohost.org/install).

![Web admin interface screenshot](./doc/admin_home_light.jpg)
</div>

## Issues

- [Please report issues on YunoHost bugtracker](https://github.com/YunoHost/issues).

## Translation

You can help translate Yunohost-Admin on our [translation platform](https://translate.yunohost.org/engage/yunohost/?utm_source=widget)

<div align="center"><img alt="View of the translation rate for the different languages available in YunoHost" src="https://translate.yunohost.org/widgets/yunohost/-/admin/horizontal-auto.svg" alt="Translation status" /></div>

## Developpers

Contributions are welcome!

In order to contribute you will need to setup a development environment using [ynh-dev](https://github.com/YunoHost/ynh-dev) (see the README).  
Once you have a environment running and are attached to it (with `./ynh-dev start`) you will be able to run:

```bash
./ynh-dev use-git yunohost-admin
```

This command will install all dependencies and start a dev server (based on [webpack-dev-server](https://github.com/webpack/webpack-dev-server)) with Hot-Module-Replacement (live updates on code modification without reloading the page nor rebuilding the whole code). After the build step, click on the "Network:" link and you are good to go.

You can also install [Vue Devtools](https://addons.mozilla.org/fr/firefox/addon/vue-js-devtools/) (module for Firefox but also exists for Chromium/Chrome) if you want component trees, performance views and so on.

On a YunoHost instance, the web admin files are located at `/usr/share/yunohost/admin`.

### Debugging

To log SSE messages, type `localStorage.setItem('debug', true)` in the console and reload the page. Type `localStorage.removeItem('debug')` to deactivate it.

### Translation maintenance

#### Cleaning

To clean locales from unused keys:
```
python3 maintenance/clean_locales.py
```
This will also reorder keys in `en.json`.

#### Renaming

If you need to rename a key or more (from 'my.current.key' to 'my.new.key' for example).

From a string

```bash
python3 rename_i18n_keys.py --keys my.current.key:my.new.key
```

#### From a file
```bash
python3 rename_i18n_keys.py --file input.txt
```
input.txt
```
my.current.key:my.new.key
my.other.key:my.new.other.key
```

By default it renames keys only in the `en.json`, pass `--all` to apply changes to all locales file.