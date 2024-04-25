# Minibase

This project is an attempt to have a convenient local loop for development for lambada functions based on Python and deployed with Pulumi Python.

Currently it's capable of setting up a local environment with a localstack instance and provisioning a S3 bucket.

It's very WIP.

Why Minibase? Because it's a play on the Airbase project my colleague (https://github.com/eliotlim/) is working on.

Requirements:
- Docker
- Docker-compose
- Make
- some Linux VM or WSL2 ( this was developed on WSL2)

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