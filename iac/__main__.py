"""A Python Pulumi program"""

import pulumi
import pulumi_aws as aws
import platform

architecture = 'x86_64' if platform.machine() == 'x86_64' else 'arm64'

# # Create an AWS resource (S3 Bucket)
# bucket = aws.s3.Bucket('my-bucket')

# # Export the name of the bucket
# pulumi.export('bucket_name', bucket.id)


# Create an IAM role for the Lambda function
lambda_role = aws.iam.Role('lambda-role',
    assume_role_policy="""{
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Principal": {
                    "Service": "lambda.amazonaws.com"
                },
                "Action": "sts:AssumeRole"
            }
        ]
    }"""
)

# Attach the necessary policies to the IAM role
aws.iam.RolePolicyAttachment('lambda-role-policy',
    role=lambda_role.name,
    policy_arn='arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole'
)

# Export the ARN of the IAM role
pulumi.export('lambda_role_arn', lambda_role.arn)

# Create an AWS Lambda function
lambda_function = aws.lambda_.Function('django_demo_lambda',
    runtime='python3.11',
    handler='handler.lambda_handler',
    code=pulumi.AssetArchive({
        '.': pulumi.FileArchive('/django_demo/django-demo-dev.zip')
    }),
    role=lambda_role.arn,
    architectures=["arm64"],
    package_type='Zip',
    name='django_demo_lambda',
)

# Export the ARN of the Lambda function
pulumi.export('lambda_arn', lambda_function.arn)



# Create an API Gateway
api_gateway = aws.apigateway.RestApi('api-gateway')

# Create a resource for the root path
root_resource = aws.apigateway.Resource('root-resource',
    rest_api=api_gateway.id,
    parent_id=api_gateway.root_resource_id,
    path_part='/'
)

# Create a method for the root resource
root_method = aws.apigateway.Method('root-method',
    rest_api=api_gateway.id,
    resource_id=root_resource.id,
    http_method='ANY',
    authorization='NONE',
    api_key_required=False,
    integration=aws.apigateway.IntegrationArgs(
        type="AWS_PROXY",
        http_method='ANY',
        uri=lambda_function.invoke_arn,
        integration_http_method='ANY',
        resource_id=root_resource.id,
        rest_api=api_gateway.id,
    ),
    # opts=pulumi.ResourceOptions(depends_on=[lambda_function])
)

# # Deploy the API Gateway
# deployment = aws.apigateway.Deployment('api-gateway-deployment',
#     rest_api=api_gateway.id,
#     stage_name='prod'
# )

# # Export the API Gateway URL
# pulumi.export('api_gateway_url', deployment.invoke_url)
