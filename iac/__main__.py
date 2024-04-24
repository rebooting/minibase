"""A Python Pulumi program"""

import pulumi
import pulumi_aws as aws

# Create an AWS resource (S3 Bucket)
bucket = aws.s3.Bucket('my-bucket')

# Export the name of the bucket
pulumi.export('bucket_name', bucket.id)