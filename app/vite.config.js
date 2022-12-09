import { fileURLToPath, URL } from 'url';
import { defineConfig, loadEnv } from 'vite'
import fs from 'fs'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd())

  const config = {
    define: {
      'process.env': {}
    },
    resolve:{
      alias:[
        // this is required for the SCSS modules imports with `~` (node_modules)
        { find: /^~(.*)$/, replacement: '$1' },
        { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
        { find: 'vue', replacement: '@vue/compat' },
      ]
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
            @import "@/scss/_variables.scss";
          `
        }
      }
    },
    plugins: [
      vue({
        template: {
          compilerOptions: {
            compatConfig: {
              MODE: 2
            }
          }
        }
      })
    ],
  }

  if (mode === 'production') {
    return {
      ...config,
      base: '/yunohost/admin',
    }
  } else if (mode === 'development') {
    return {
      ...config,
      server: {
        port: 8080,
        host: env.VITE_IP,
        https: {
          // Use already created cert from yunohost instance
          key: fs.readFileSync('/etc/yunohost/certs/yunohost.org/key.pem'),
          cert: fs.readFileSync('/etc/yunohost/certs/yunohost.org/crt.pem'),
        },
        fs: {
          // Needed for special ynh-dev context where node_modules is symlinked
          allow: [
            '/ynh-dev/yunohost-admin/app',
            '/var/cache/ynh-dev/yunohost-admin/node_modules'
          ]
        },
        proxy: {
          '/yunohost': {
            target: `https://${env.VITE_IP}`,
            ws: true,
            logLevel: 'info',
            secure: false,
          },
        },
      }
    }
  }
})
