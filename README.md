# wa-task-batch-service

## Getting Started

### Prerequisites

Running the application requires the following tools to be installed in your environment:

  * [Node.js](https://nodejs.org/) v18.0.0 or later
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

Due to the simplicity of this application, just checking that the application starts successfully (yarn start:dev) is enough
to be confident that it will work. You should see console output similar to the below:

```
1. Ensure wa-task-monitor service is up.
    (Its dependent services also need to be up I.e. wa-workflow-api & wa-taskmanagement-service).

2. Set up the following environment variables on your local wa-task-batch-service path terminal.
    export ALLOW_CONFIG_MUTATIONS=true
    export JOB_NAME=INITIATION

3. The s2s.secret is exclusively read from the config at runtime. For testing the application start-up locally to verify no issues:
    edit s2s-service.ts file & set the s2s.secret to the s2s.secret value in the dev.yaml file.

4. Execute the following commands up to yarn start:dev and verify the start up is as below;
rm -rf node_modules
yarn install
yarn start:dev
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

5. To verify the startup is successful & able to call the task-monitor service endpoint with "INITIATE" job name;

7. Follow either a OR b below to specify the job name(for local testing only & use a valid job name, e.g INITIATION)
    a.Set the following environment variable on your local wa-task-batch-service path terminal
    export JOB_NAME=INITIATION
    OR
    b.In the dev.yaml file, set the job:name to INITIATION.

6. Execute the following commands up to yarn start:dev and verify the start up is as below;
rm -rf node_modules
yarn install
yarn start:dev
[nodemon] 3.1.0
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): src/main/**/*
[nodemon] watching extensions: ts,js
[nodemon] starting `ts-node ./src/main/server.ts`
2024-05-24T09:45:50+01:00 - info: [applicationRunner] Attempting to read properties from volume: '/mnt/secrets/'
2024-05-24T09:45:50+01:00 - info: [applicationRunner] Could not find properties to load, check your config, you can ignore this if you don't expect any
Info: [services/task-monitor-service.ts]: environment variable job.name value is INITIATION
Info: [services/task-monitor-service.ts]: Attempting to create a job for task INITIATION
Info: [services/s2s-service.ts]: Attempting to request a S2S token
2024-05-24T09:45:51+01:00 - info: [server] Application started: http://localhost:9999
Info: [services/s2s-service.ts]: Received S2S token
Info: [services/task-monitor-service.ts]: Status: 200
Info: [services/task-monitor-service.ts]: Response: {"job_details":{"name":"INITIATION"}}
Info: [utils/exit.ts]: Job will now exit with code 0
[nodemon] clean exit - waiting for changes before restart

** The expectation is that you should get no error on "yarn start:dev" service startup
(Note: If you locally get further start-up errors specifying service url or job name could not be resolved then set the following
    environment variables;
    export WA_TASK_MONITOR_SERVICE_URL=http://localhost:{Specify the wa-wa-task-monitor service port number here}
    export JOB_NAME=INITIATION)

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

