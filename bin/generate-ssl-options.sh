#!/usr/bin/env bash
#
# Script to generate private RSA key and a self-signed certificate under src/main/resources/localhost-ssl.
# These resources are for local HTTPS only and must not be committed.

localhost_ssl_folder="src/main/resources/localhost-ssl"
export RANDFILE="${TMPDIR:-/tmp}/openssl-rand"

if [ ! -f "$localhost_ssl_folder"/localhost.key ] || [ ! -f "$localhost_ssl_folder"/localhost.crt ]
then
  mkdir -p "$localhost_ssl_folder"

  if [[ $OSTYPE == "darwin"* ]]
  then
    openssl req \
      -nodes \
      -x509 \
      -newkey rsa:4096 \
      -keyout "$localhost_ssl_folder"/localhost.key \
      -out "$localhost_ssl_folder"/localhost.crt \
      -sha256 \
      -days 3650 \
      -subj "/C=GB/ST=A/L=B/O=C/OU=D/CN=localhost" \
      -extensions v3_new \
      -config <(cat /System/Library/OpenSSL/openssl.cnf \
      <(printf '[v3_new]\nsubjectAltName=DNS:localhost,IP:127.0.0.1\nextendedKeyUsage=serverAuth'))
  else
    openssl req \
      -nodes \
      -x509 \
      -newkey rsa:4096 \
      -keyout "$localhost_ssl_folder"/localhost.key \
      -out "$localhost_ssl_folder"/localhost.crt \
      -sha256 \
      -days 3650 \
      -subj "/C=GB/ST=A/L=B/O=C/OU=D/CN=localhost" \
      -addext "subjectAltName = DNS:localhost,IP:127.0.0.1" \
      -addext "extendedKeyUsage = serverAuth"
  fi
fi
