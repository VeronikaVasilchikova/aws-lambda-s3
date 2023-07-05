# automated-settlements_create-lease-offers.kafene.com

This AWS Lambda function, created using the [serverless framework](https://www.serverless.com/framework/docs), [Node.js](https://nodejs.org/en/docs) and [TypeScript](https://www.typescriptlang.org/), is designed to handle events triggered by an AWS S3 bucket. It performs API requests to four endpoints of the 'kafene_api' to process data from uploaded '.csv' files.

## Prerequisites

### Nodejs

1. Install NodeJS (version >= 18.16.0) from [official website](https://nodejs.org/) or using [Node Version Manager (NVM)](https://github.com/nvm-sh/nvm).
2. Install [serverless](https://www.npmjs.com/package/serverless) package globally.

### AWS Cli

In order for Serverless framework to work, you need to install AWS CLI and setup an AWS profile on your machine. 

1. Follow official guide to install AWS CLI https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html
2. Configure AWS profile https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html
3. Verify that everything is setup correctly. (Execute command to get a list of all buckets - `aws s3api list-buckets` or `aws s3api list-buckets --profile profile_name`, if you setup a non-default profile)

__*Note:*__ If you have an existing AWS profile setup on your machine, but want to use a different one for working with a Serverless framework, add a flag `--aws-profile serverless_profile_name` to every command you would like to execute.

## Functionality

The Lambda function has the following functionality:

1. **Trigger**: The Lambda function is triggered by the already existing AWS S3 bucket 'automated-settlement-segments' whenever a '.csv' file is uploaded.

2. **Event Handling**: Upon receiving an S3 event, the Lambda function is invoked and retrieves the uploaded file from the S3 bucket.

3. **Data Processing**: The function processes the data from the '.csv' file and makes API requests to the following endpoints of the 'kafene_api':

   - `lease-offers`: Adds multiple rows to the 'lease_offers' PostgreSQL table.
   - `lease-offers-deactivate`: Deactivates all expired items in the 'lease_offers' PostgreSQL table.
   - `paylink`: Generates paylinks per utm_medium (sms/email) and saves them to the 'paylink' PostgreSQL table.
   - `application-timeline`: Adds multiple rows to the 'application_timeline' PostgreSQL table.

4. **Integration**: The Lambda function integrates with the 'kafene_api' by making HTTP requests to the specified endpoints.

## Deploy (AWS)

### Manually > using terminal

To deploy Serverless project to run `serverless deploy`.

* To connect to AWS Cloud, Serverless framework will try to use **default** AWS profile from your machine.
   If you want to use different profile, you can pass `--aws-profile cutom_profile` flag.
   Alternatively, you can configure Serverless framework with your credentials 
   `serverless config credentials --provider aws --key AWS_ACCESS_KEY_ID --secret AWS_SECRET_ACCESS_KEY` and then these credentials will be used for connection to AWS.

* If you specify `stage: "${opt:stage, 'dev'}"`, by default `serverless deploy` would deploy your code to `dev` stage.
  To deploy to a different stage, pass `--stage TARGET_STAGE` with deploy command.

* If you run `deploy` command multiple times, already deployed resources would **NOT** be recreated. If your Serverless config contains changes, only they will be applied.

__*Note:*__: IAM Role used for deployment should have **ALL** necessary permissions for Serverless project, otherwise, deploy will fail.

More info:
[Deploying to AWS - Documentation](https://www.serverless.com/framework/docs/providers/aws/guide/deploying)

### Manually > using Github action

Deploy the latest changes to AWS by manually running Github action [Serverless Deploy](https://github.com/----/actions/workflows/serverless-deploy.yml) for **dev** or **prod** environment.