# wa-task-batch-service

## Getting Started

### Prerequisites

Running the application requires the following tools to be installed in your environment:

  * [Node.js](https://nodejs.org/) v12.0.0 or later
  * [yarn](https://yarnpkg.com/)
  * [Docker](https://www.docker.com)

### Running the application

Install dependencies by executing the following commands. It is important during testing to delete node_modules
folder before running these commands, or the dependencies can be cached and the application will fail in production

 ```bash
$ yarn install
 ```
Bundle:

```bash
$ yarn webpack
```

Run:

```bash
yarn start:dev
```


### Running with Docker

Create docker image:

```bash
  docker-compose build
```

Run the application by executing the following command:

```bash
  docker-compose up
```

This will start the frontend container exposing the application's port
(set to `9999` in this template app).



## Developing

### Code style

We use [ESLint](https://github.com/typescript-eslint/typescript-eslint)
alongside [sass-lint](https://github.com/sasstools/sass-lint)

Running the linting with auto fix:
```bash
$ yarn lint --fix
```

### Running Tests

Due to the simplicity of this application, just checking that the application starts successfully is enough
to be confident that it will work. You should see console output similar to the below:

```
rm -rf node_modules
yarn install
yarn start:dev
yarn run v1.22.18
$ NODE_ENV=dev nodemon --config nodemon.json
[nodemon] 2.0.19
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): src/main/**/*
[nodemon] watching extensions: ts,js
[nodemon] starting `ts-node ./src/main/server.ts`
ApplicationInsights:APPINSIGHTS_INSTRUMENTATIONKEY is in path of deprecation, please use APPLICATIONINSIGHTS_CONNECTION_STRING env variable to setup the SDK. []
2022-07-15T11:21:46+01:00 - info: [applicationRunner] Attempting to read properties from volume: '/mnt/secrets/'
2022-07-15T11:21:46+01:00 - info: [applicationRunner] Could not find properties to load, check your config, you can ignore this if you don't expect any
Info: [services/task-monitor-service.ts]: Attempting to create a job for task undefined
Info: [services/s2s-service.ts]: Attempting to request a S2S token
2022-07-15T11:21:46+01:00 - info: [server] Application started: http://localhost:9999
Info: [services/s2s-service.ts]: Received S2S token
Info: [services/task-monitor-service.ts]: Status: 200
Info: [services/task-monitor-service.ts]: Response: {"job_details":{}}
Info: [utils/exit.ts]: Job will now exit with code 0
[nodemon] clean exit - waiting for changes before restart
```

### Security

#### CSRF prevention

[Cross-Site Request Forgery](https://github.com/pillarjs/understanding-csrf) prevention has already been
set up in this template, at the application level. However, you need to make sure that CSRF token
is present in every HTML form that requires it. For that purpose you can use the `csrfProtection` macro,
included in this template app. Your njk file would look like this:

```
{% from "macros/csrf.njk" import csrfProtection %}
...
<form ...>
  ...
    {{ csrfProtection(csrfToken) }}
  ...
</form>
...
```

#### Helmet

This application uses [Helmet](https://helmetjs.github.io/), which adds various security-related HTTP headers
to the responses. Apart from default Helmet functions, following headers are set:

* [Referrer-Policy](https://helmetjs.github.io/docs/referrer-policy/)
* [Content-Security-Policy](https://helmetjs.github.io/docs/csp/)

There is a configuration section related with those headers, where you can specify:
* `referrerPolicy` - value of the `Referrer-Policy` header


Here's an example setup:

```json
    "security": {
      "referrerPolicy": "origin",
    }
```

Make sure you have those values set correctly for your application.

### Healthcheck

The application exposes a health endpoint (https://localhost:9999/health), created with the use of
[Nodejs Healthcheck](https://github.com/hmcts/nodejs-healthcheck) library. This endpoint is defined
in [health.ts](src/main/routes/health.ts) file. Make sure you adjust it correctly in your application.
In particular, remember to replace the sample check with checks specific to your frontend app,
e.g. the ones verifying the state of each service it depends on.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

