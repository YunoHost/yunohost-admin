## Setup

```bash
# clone this repo outside of the lxc (didn't try from inside for now)

# from yunohost-admin/app

# add a .env file with your lxc ip:
echo "VUE_APP_IP='Y.O.U.R.I.P'" > .env

# install dependencies
npm install
```

### Run in development
```bash
# from yunohost-admin/app
npm run serve

# go to https://localhost:8080/ and login
```
