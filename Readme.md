# Minibase

This project is an attempt to have a convenient local loop for development for lambada functions based on Python and Pulumi

Currently it's capable of setting up a local environment with a localstack instance and an S3 demo.

It's very WIP.

Why Minibase? Because it's a play on the Airbase project my colleague is working on.

## Quickstart
### build the pulumi image

```make build_pulumi```

### start the localstack instance

```make compose-up```

if running for the first time

``` make restore_pulumi```


###this deploys the S3 bucket to localstack

```make deploy```

### to verify it's existence run

```make cli-aws-s3-ls ```

example output:

2024-04-24 16:43:33 my-bucket-0a3132b

### to destroy the stack run

```make destroy```