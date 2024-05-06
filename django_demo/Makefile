
PROJECT_NAME := sample
VENV_LOCATION := ~/venv
VENV_ACTIVATE := . $(VENV_LOCATION)/bin/activate
APP_NAME := sample_app
run:
	$(VENV_ACTIVATE) && python manage.py runserver
new-django-project:
	$(VENV_ACTIVATE) && django-admin startproject $(PROJECT_NAME) .

new-django-app:
	$(VENV_ACTIVATE) && python manage.py startapp $(APP_NAME)

venv:
	python3 -m venv ~/venv
restore: venv
	$(VENV_ACTIVATE) && pip install -r requirements.txt


migrate:
	$(VENV_ACTIVATE) && python manage.py migrate

zappa_pack:
	$(VENV_ACTIVATE) && zappa package dev

docker_build:
	docker build -t localhost/django_sample -f Dockerfile.build .
	docker create --name lambda_artefact localhost/django_sample echo
	docker cp lambda_artefact:/app/django-demo-dev.zip django-demo-dev.zip
	docker rm lambda_artefact
	