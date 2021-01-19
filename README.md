# YunoHost Admin

[YunoHost](https://yunohost.org) administration web interface (JS client for the API).

This client is a part of the YunoHost project, and can not be installed directly. Please visit the YunoHost website for [installation instructions](https://yunohost.org/install).

## Bug tracker

Please report issues on the [YunoHost bugtracker](https://github.com/YunoHost/issues).

## Translate

[![Translation status](https://translate.yunohost.org/widgets/yunohost/-/287x66-white.png)](https://translate.yunohost.org/engage/yunohost/?utm_source=widget)

## Contributing

Feel free to improve the plugin and send a pull request.

In order to contribute you will need to setup a development environment using [ynh-dev](https://github.com/YunoHost/ynh-dev) (see the README).
Once you have a environment running and are attached to it (with `./ynh-dev start`) you will be able to run:

```
$ ./ynh-dev use-git yunohost-admin
```

This command will install all dependencies and start a dev server (based on [webpack-dev-server](https://github.com/webpack/webpack-dev-server)) with Hot-Module-Replacement (live updates on code modification without reloading the page nor rebuilding the whole code). After the build step, click on the "Network:" link and you are good to go.

You can also install [Vue Devtools](https://addons.mozilla.org/fr/firefox/addon/vue-js-devtools/) (module for Firefox but also exists for Chromium/Chrome) if you want component trees, performance views and so on.

On a YunoHost instance, the web admin files are located at `/usr/share/yunohost/admin`.

## Dependencies

* [Vue.js](https://vuejs.org/v2/guide/)
* [BootstrapVue](https://bootstrap-vue.org/docs)
* [Vue i18n](https://kazupon.github.io/vue-i18n/started.html)
* [Vue Router](https://router.vuejs.org/guide/)
* [Vuex](https://vuex.vuejs.org/)
* [Vuelidate](https://vuelidate.js.org/#getting-started)
* [date-fns](https://date-fns.org/v2.16.1/docs/Getting-Started)
* [Fork Awesome](https://forkaweso.me/Fork-Awesome/icons/) for icons
* [FiraGO](https://bboxtype.com/typefaces/FiraGO/#!layout=specimen) and [Fira Code](https://github.com/tonsky/FiraCode) for fonts
