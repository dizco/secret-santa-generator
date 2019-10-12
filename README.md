# secret-santa-generator [<img src="https://i.imgur.com/oMcxwZ0.png" alt="Eva Design System" height="20px" />](https://eva.design) [![Build Status](https://dev.azure.com/gabrielbourgault/Secret%20Santa/_apis/build/status/dizco.secret-santa-generator?branchName=master)](https://dev.azure.com/gabrielbourgault/Secret%20Santa/_build/latest?definitionId=11&branchName=master)

### Demo

<a target="_blank" href="https://secretsantagenerator.kiosoft.ca">Live Demo</a>

## Install

1. [Install node](https://nodejs.org/en/), if not already installed. The application has been tested with node 10.16.3 and npm 6.4.1.

2. Clone this repository 
    ```shell
    git clone https://github.com/dizco/secret-santa-generator.git
    ```

3. Navigate to the project folder
    ```shell
    cd secret-santa-generator
    ```

4. Install dependencies
    ```shell
    npm install
    ```

## Running

To run the application, navigate to the project folder and execute the following steps :

1. Open the file `environments/environment.ts`, and edit the values according to your setup.

2. Run!
    ```shell
    npm start
    ```

## Building :construction_worker:

To run development builds :
```shell
npm run build
```

To run production builds :
```shell
npm run build:prod
```

:rocket: Note: To manually deploy to shared hosting, copy the files from the `dist` folder to the root folder of the application. Continuous deployment is hooked on `master` builds using Azure Pipelines and ftp upload.

## Linting

To run tslint :
```shell
npm run lint
```

To run more extensive lint including tslint as well as stylelint (this command is hooked on prepush as well) :
```shell
npm run lint:ci
```

## Testing :heart_eyes:

Run the unit tests in a console with the following command :
```shell
npm run test:singlerun
```

To run tests in watch-mode :
```shell
npm run test
```

To run tests with code coverage :
```shell
npm run test:coverage
```

## How can I support developers?
- Star this GitHub repo :star:
- Create pull requests, submit bugs, suggest new features or documentation updates :wrench:

## ngx-admin
This client is forked off of [ngx-admin](https://github.com/akveo/nebular) v4.0.1 :heart:.

<a target="_blank" href="http://akveo.com/ngx-admin/"><img src="https://i.imgur.com/iJu2YDF.png"/></a>

For more information about UI components, visit the [Nebular repo](https://github.com/akveo/nebular). Further documentation about the intergation of Nebular with ngx-admin can be found [here](https://akveo.github.io/nebular/#/docs/installation/based-on-starter-kit-ngxadmin).

