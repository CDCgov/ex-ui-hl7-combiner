docker-build:
	docker build \
		-t ex-ui-hl7-combiner \
		--rm \
		--build-arg SECURE_MODE=false \
		--build-arg COMBINER_URL= \
		--build-arg HL7_UTILS_URL= \
		--build-arg IDENTITY_URL= \
		.

docker-run: docker-start
docker-start:
	docker-compose up -d
	docker run \
		-d \
		-p 5000:8080 \
		--network=ex-ui-hl7-combiner_default \
		--name ex-ui-hl7-combiner_main \
		ex-ui-hl7-combiner

docker-stop:
	docker stop ex-ui-hl7-combiner_main || true
	docker rm ex-ui-hl7-combiner_main || true
	docker-compose down

docker-restart:
	make docker-stop 2>/dev/null || true
	make docker-start