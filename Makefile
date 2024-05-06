
UID := $(shell id -u)
GID := $(shell id -g)
NETWORK := default_minibase
STACK_NAME := dev
IMAGE_HOME := node
build_pulumi:
	docker build -t local/pulumi:latest -f docker/Dockerfile.pulumi .

shell_pulumi:
	docker run -u $(UID) --network $(NETWORK) -it --rm \
	-v $$PWD/ts-iac:/app -v $$PWD/stacks:/home/$(IMAGE_HOME) \
	-w /app local/pulumi:latest /bin/bash -c "cd /app && \
	source venv/bin/activate && /bin/bash"

new_pulumi_python_project:
	docker run -u $(UID) -it --rm -v $$PWD/stacks:/home/$(IMAGE_HOME) -v $$PWD/iac:/app -w /app local/pulumi:latest /bin/sh -c "cd /app && pulumi login --local && pulumi new python $(project_name)"

new_pulumi_typescript_project:
	docker run -u $(UID) -it --rm -v $$PWD/stacks:/home/$(IMAGE_HOME) -v $$PWD/ts-iac:/app -w /app local/pulumi:latest /bin/sh -c "cd /app && pulumi login --local && pulumi new typescript $(project_name)"


clean_pulumi:
	docker run -it --rm -v $$PWD/ts-iac:/app -w /app local/pulumi:latest /bin/bash -c "cd /app && rm -rf venv"
restore_pulumi:
	docker run -u $(UID) -it --rm -v $$PWD/ts-iac:/app -w /app local/pulumi:latest /bin/bash -c "cd /app && python3 -m venv venv \
		&& source venv/bin/activate && pip install -r requirements.txt"

clean_iac:
	cd iac && sudo rm -rf * .*

compose-up:
	COMPOSE_PROJECT_NAME=default docker-compose up -d

compose-down:
	COMPOSE_PROJECT_NAME=default docker-compose down

compose-logs:
	COMPOSE_PROJECT_NAME=default docker-compose logs -f

pulumi_init:
	docker run -u $(UID) --network $(NETWORK) -it --rm \
	-v $$PWD/ts-iac:/app -v $$PWD/stacks:/home/$(IMAGE_HOME) \
	-w /app local/pulumi:latest /bin/bash -c "cd /app && \
	source venv/bin/activate && pulumi login --local && pulumi stack init $(STACK_NAME)"
deploy:
	docker run -u $(UID) --network $(NETWORK) -it --rm \
	-v $$PWD/ts-iac:/app -v $$PWD/stacks:/home/$(IMAGE_HOME) \
	-v $$PWD/django_demo:/django_demo/ \
	-w /app local/pulumi:latest /bin/bash -c "cd /app && \
	source venv/bin/activate && pulumi login --local && pulumi stack select dev || pulumi stack init dev && PULUMI_CONFIG_PASSPHRASE= pulumilocal up -y"
destroy:
	docker run -u $(UID) --network $(NETWORK) -it --rm -v $$PWD/ts-iac:/app -v $$PWD/stacks:/home/$(IMAGE_HOME) -w /app local/pulumi:latest /bin/bash -c "cd /app && \
	source venv/bin/activate && pulumi login --local && pulumi stack select dev || pulumi stack init dev && PULUMI_CONFIG_PASSPHRASE= pulumilocal destroy -y"

sync:
	docker run -u $(UID) --network $(NETWORK) -it --rm -v $$PWD/ts-iac:/app -v $$PWD/stacks:/home/$(IMAGE_HOME) -w /app local/pulumi:latest /bin/bash -c "cd /app && \
	source venv/bin/activate && pulumi login --local && pulumi stack select dev || pulumi stack init dev && pulumi up -y"
cli-aws-s3-ls:
	docker run --network $(NETWORK) -u $(UID) -it --rm -v $$PWD/iac:/app -w /app local/pulumi:latest /bin/bash -c "aws s3 ls --endpoint-url=http://localstack:4566 --region=us-east-1"	
cli-aws-invoke-lambda:
	docker run --network $(NETWORK) -u $(UID) -it --rm -v $$PWD/iac:/app -w /app local/pulumi:latest /bin/bash -c "aws lambda invoke --function-name django_demo_lambda --endpoint-url=http://localstack:4566 --region=us-east-1 /dev/stdout"
build_lambda:
	cd django_demo && make docker_build

quick: destroy compose-down compose-up deploy