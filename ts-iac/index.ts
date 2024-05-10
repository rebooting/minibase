import {arch} from "os"
import * as aws from "@pulumi/aws";
import {apigateway} from "@pulumi/awsx/classic"; 
import * as pulumi from "@pulumi/pulumi"

// create S3 bucket called minibase-bucket
const bucket = new aws.s3.Bucket("minibase-bucket",{
    bucket: "minibase-bucket",
    forceDestroy: true
});

//upload the docker-compose.yml file to the bucket
const object = new aws.s3.BucketObject("dev_mysite_current_project.tar.gz", {
    bucket: bucket.bucket,
    // source: new pulumi.asset.FileAsset("/dist/dev_mysite_current_project.tar.gz"),
    // key: "dev_mysite_current_project.tar.gz",
    source: new pulumi.asset.FileAsset("/dist/dev_app_current_project.tar.gz"),
    key: "dev_app_current_project.tar.gz",
});

// create iam for lambda
const lambdaRole = new aws.iam.Role("lambdaRole", {
    assumeRolePolicy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [{
            Action: "sts:AssumeRole",
            Effect: "Allow",
            Principal: {
                Service: "lambda.amazonaws.com",
            },
        }],
    }),
});

// create lambda with python 3.11 zip file from ../lambdas/hello.zip
const helloLambda = new aws.lambda.Function("helloLambda", {
    runtime: "python3.11",
    // handler: "main.lambda_handler",
    handler: "handler.lambda_handler",
    role: lambdaRole.arn,
    // code: new pulumi.asset.FileArchive("../lambdas/hello.zip"),
    code: new pulumi.asset.FileArchive("/dist/handler_stub.zip"),
    name: "helloLambda",
    // arm architecture
    packageType: "Zip",
    architectures: ["arm64"],
    environment: {
        variables: {
            S3_ENDPOINT_URL: "http://localhost:4566",
            DEVMODE: "True"
        }
    }
});

// // create api gateway
// const api = new apigateway.API("api", {
//     routes: [{
//         path: "/",
//         method: "GET",
//         eventHandler: helloLambda,
//     }],
// });
// exports.url = api.deployment.invokeUrl;
// // get id of the api gateway
// exports.apiId = api.deployment.restApi
// exports.apiId = api.deployment.executionArn
// // get stage of the api gateway
// exports.stage = api.deployment.stageName;
// exports.localstackApiGatewayEndpoint = pulumi.interpolate`http://localhost:4566/restapis/${api.deployment.restApi}/local/_user_request_/`;

// -------------------------------------------------

// // Create the API Gateway Rest API
// const api = new aws.apigateway.RestApi("api");

// // Create a resource for the root path
// const rootResource = new aws.apigateway.Resource("rootResource", {
//     restApi: api,
//     parentId: api.rootResourceId,
//     pathPart: "{proxy+}",
// });

// // Create a method for the root path
// const rootMethod = new aws.apigateway.Method("rootMethod", {
//     restApi: api,
//     resourceId: rootResource.id,
//     httpMethod: "GET",
//     authorization: "NONE",
// });

// // Create an integration to connect the method to the Lambda function
// const integration = new aws.apigateway.Integration("lambda", {
//     restApi: api,
//     resourceId: rootResource.id,
//     httpMethod: rootMethod.httpMethod,
//     integrationHttpMethod: "POST",
//     type: "AWS_PROXY",
//     uri: helloLambda.invokeArn, // replace with your Lambda function's ARN
// });

// exports.apiId = api.id;

// // construct the localstack ApiGateway endpoint
// // const localstackApiGatewayEndpoint = pulumi.interpolate`http://localhost:4566/restapis/${api.deployment.restApi}/local/_user_request_/`;
// exports.localstackApiGatewayEndpoint = pulumi.interpolate`http://localhost:4566/restapis/${exports.apiId}/local/_user_request_/`;

//--------------------------------------------------

// Create a new REST API
const api = new aws.apigateway.RestApi("myApi", {
    description: "This is my API for demonstration purposes",
});

let apiId=""
let rootResourceId=""

api.id.apply(id => {
    apiId = id
})


// Get the root resource "/" of the REST API



const catchAllResource = api.rootResourceId.apply(rootResourceId => 
    aws.apigateway.getResource({
        restApiId: apiId,
        path: '/',
    })
);


// Create a catch-all proxy resource "{proxy+}" under the root resource "/"
const catchAllproxyResource = new aws.apigateway.Resource("proxyResource", {
    restApi: api.id,
    parentId: catchAllResource.id,
    pathPart: "{proxy+}",
});

// Create a method for the proxy resource. This method will handle any requests to any path
const catchAllproxyMethod = new aws.apigateway.Method("proxyMethod", {
    restApi: api.id,
    resourceId: catchAllproxyResource.id,
    httpMethod: "ANY", // This method will handle any HTTP method
    authorization: "NONE", // No authorization, for demonstration purposes
});

// Create an integration to connect the Lambda function to the proxy resource/method
const lambdaIntegration = new aws.apigateway.Integration("lambdaIntegration", {
    restApi: api.id,
    resourceId: catchAllproxyResource.id,
    httpMethod: catchAllproxyMethod.httpMethod,
    integrationHttpMethod: "POST", // Lambda functions are invoked with POST
    type: "AWS_PROXY", // Use the Lambda proxy integration
    uri: helloLambda.invokeArn,
});


// '/' resource

// create root "/" resource
// const rootResource = new aws.apigateway.Resource("rootResource", {
//     restApi: api.id,
//     parentId: catchAllResource.id,
//     pathPart: "/",
// });

// Create a method for the root resource
const rootMethod = new aws.apigateway.Method("rootMethod",
    {
        restApi: api.id,
        resourceId: api.rootResourceId,
        httpMethod: "ANY",
        authorization: "NONE",
    })

// Create an integration to connect the method to the Lambda function
const rootIntegration = new aws.apigateway.Integration("lambda", {
    restApi: api.id,
    resourceId: api.rootResourceId,
    httpMethod: rootMethod.httpMethod,
    integrationHttpMethod: "POST",
    type: "AWS_PROXY",
    uri: helloLambda.invokeArn,
});





// Deploy the API to a stage
const deployment = new aws.apigateway.Deployment("apiDeployment", {
    restApi: api.id,
}, { ignoreChanges: ["stageName"], dependsOn: [catchAllproxyMethod, lambdaIntegration, rootMethod, rootIntegration]});

// Create a stage, which is an addressable instance of the REST API
const stage = new aws.apigateway.Stage("apiStage", {
    restApi: api.id,
    deployment: deployment.id,
    stageName: "prod",
});

// Export S3 URL for localstack
exports.bucketName = pulumi.interpolate`http://localhost:4566/${bucket.bucket}`;

// Export the URL of the deployed API
exports.localstackApiGatewayEndpoint = pulumi.interpolate`http://localhost:4566/restapis/${api.id}/local/_user_request_/`;

// arn of bucket
exports.bucketArn = bucket.arn