module.exports = {
  pluginOptions: {
    i18n: {
      locale: 'en',
      fallbackLocale: 'en',
      localeDir: 'locales',
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
  devServer: {
    proxy: {
      '^/api': {
        target: process.env.API_URL
      }
    }
  }
}
