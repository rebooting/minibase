
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
	$(VENV_ACTIVATE) && STATIC_DEPS=true pip install -r requirements.txt
	# $(VENV_ACTIVATE) && pip install --prefer-binary numpy

migrate:
	$(VENV_ACTIVATE) && python manage.py migrate

zappa_pack:
	$(VENV_ACTIVATE) && zappa package dev 

docker_build:
	rm -f django-demo-dev.tgz
	rm -f handler_stub.zip
	rm -f ../dist/dev_app_current_project.tar.gz
	rm -f ../dist/handler_stub.zip
	docker build  --progress=plain -t localhost/django_sample -f Dockerfile.build .
	docker create --name lambda_artefact localhost/django_sample echo
	docker cp lambda_artefact:/app/django-demo-dev.tgz django-demo-dev.tgz
	docker cp lambda_artefact:/app/handler_stub.zip handler_stub.zip
	# docker cp lambda_artefact:/app/venv.tgz venv.tgz
	docker rm lambda_artefact
	mv django-demo-dev.tgz ../dist/dev_app_current_project.tar.gz
	mv handler_stub.zip ../dist/handler_stub.zip
	# mv venv.tgz ../dist/venv.tgz

hack_zappa:
	unzip handler_stub.zip zappa_settings.py
	# Replace the line in the file
	 sed -i "s|ARCHIVE_PATH=.*|ARCHIVE_PATH='s3://localhost:4566/minibase-bucket/django-demo-dev.tgz'|" zappa_settings.py
	# Replace the file in the zip
	zip -u handler_stub.zip zappa_settings.py