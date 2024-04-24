
UID := $(shell id -u)
GID := $(shell id -g)
NETWORK := default_minibase

build_pulumi:
	docker build -t local/pulumi:latest -f docker/Dockerfile.pulumi .

shell_pulumi:
	docker run -it -u $(UID) --network default_minibase  --rm -v $$PWD/iac:/app -w /app local/pulumi:latest /bin/bash

new_pulumi_python_project:
	docker run -u $(UID) -it --rm -v $$PWD/stacks:/home/pulumi -v $$PWD/iac:/app -w /app local/pulumi:latest /bin/sh -c "cd /app && pulumi login --local && pulumi new python $(project_name)"

clean_pulumi:
	docker run -it --rm -v $$PWD/iac:/app -w /app local/pulumi:latest /bin/bash -c "cd /app && rm -rf venv"
restore_pulumi:
	docker run -u $(UID) -it --rm -v $$PWD/iac:/app -w /app local/pulumi:latest /bin/bash -c "cd /app && python3 -m venv venv \
		&& source venv/bin/activate && pip install -r requirements.txt"

clean_iac:
	cd iac && sudo rm -rf * .*

compose-up:
	COMPOSE_PROJECT_NAME=default docker-compose up -d

compose-down:
	COMPOSE_PROJECT_NAME=default docker-compose down

compose-logs:
	COMPOSE_PROJECT_NAME=default docker-compose logs -f
deploy:
	docker run -u $(UID) --network $(NETWORK) -it --rm -v $$PWD/iac:/app -v $$PWD/stacks:/home/pulumi -w /app local/pulumi:latest /bin/bash -c "cd /app && \
	source venv/bin/activate && pulumi login --local && PULUMI_CONFIG_PASSPHRASE= pulumilocal up -y"
destroy:
	docker run -u $(UID) --network $(NETWORK) -it --rm -v $$PWD/iac:/app -v $$PWD/stacks:/home/pulumi -w /app local/pulumi:latest /bin/bash -c "cd /app && \
	source venv/bin/activate && pulumi login --local && PULUMI_CONFIG_PASSPHRASE= pulumilocal destroy -y"
cli-aws-s3-ls:
	docker run --network $(NETWORK) -u $(UID) -it --rm -v $$PWD/iac:/app -w /app local/pulumi:latest /bin/bash -c "aws s3 ls --endpoint-url=http://localstack:4566 --region=us-east-1"	