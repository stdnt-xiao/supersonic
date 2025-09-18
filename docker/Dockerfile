FROM openjdk:21-jdk

# Set the working directory in the container
WORKDIR /usr/src/app

# Argument to pass in the supersonic version at build time
ARG SUPERSONIC_VERSION

COPY assembly/build/supersonic-standalone-1.0.0-SNAPSHOT /usr/src/app/supersonic-standalone-1.0.0-SNAPSHOT

# Set the working directory to the supersonic installation directory
WORKDIR /usr/src/app/supersonic-standalone-1.0.0-SNAPSHOT

# Expose the default port
EXPOSE 9080
# Command to run the supersonic daemon
RUN chmod +x bin/*.sh
RUN sed -i 's/\r$//' bin/*.sh
CMD ["bash", "-c", "bin/supersonic-daemon.sh restart standalone  && tail -f /dev/null"]
