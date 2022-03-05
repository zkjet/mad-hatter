SHELL := bash
.SHELLFLAGS := -eu -o pipefail -c
.PHONY: start clean

arch := $(shell uname -p)

start:
	docker-compose down
ifeq ($(arch),arm)
	export DOCKERFILE=Dockerfile.arm && docker-compose up --build
else
	docker-compose up --build
endif

clean:
	rm -r ./dist
	rm -r ./node_modules