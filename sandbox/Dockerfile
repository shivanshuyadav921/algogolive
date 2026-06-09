FROM alpine:3.18

# Install compilers and runtimes
RUN apk add --no-cache \
    g++ \
    make \
    python3 \
    nodejs \
    bash

WORKDIR /sandbox

# Executed as a temporary container mount by the sandbox service
CMD ["/bin/bash"]
