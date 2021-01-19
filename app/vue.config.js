const webpack = require('webpack')

const dateFnsLocales = [
  'ar',
  'bn', // for 'bn_BD'
  'ca', // for 'ca' & 'oc'
  'cs',
  'de',
  'el',
  'en-GB', // for 'en' & 'ne'
  'eo',
  'es',
  'eu',
  'fr', // for 'fr' & 'br'
  'hi',
  'hu',
  'it',
  'nb', // for 'nb_NO'
  'nl',
  'oc',
  'pl',
  'pt',
  'ru',
  'sv',
  'tr',
  'zh_CN' // for 'zh_Hans'
]

module.exports = {
  configureWebpack: {
    plugins: [
      // Will limit the available locales so webpack won't generate chunks for every
      // locales found in `date-fns/locales/` but only those listed.
      new webpack.ContextReplacementPlugin(
        /date-fns[/\\]/,
        new RegExp(`[/\\\\](${dateFnsLocales.join('|')})[/\\\\]index.js$`)
      )
    ]
  },
  pluginOptions: {
    i18n: {
      locale: 'en',
      fallbackLocale: 'en',
      localeDir: 'src/i18n/locales',
      enableInSFC: false
    }
  },
  css: {
    loaderOptions: {
      sass: {
        prependData: '@import "@/scss/globals.scss";'
      }
    }
  },
  publicPath: '/yunohost/admin',
  devServer: {
    https: true,
    disableHostCheck: true,
    proxy: {
      '^/yunohost': {
        target: `https://${process.env.VUE_APP_IP}`,
        ws: true,
        logLevel: 'debug'
      }
    },
    watchOptions: {
      ignored: /node_modules/
    }
  }
}
