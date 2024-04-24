#!/bin/bash

arch=$(uname -m)
echo "Architecture: $arch"

curl "https://awscli.amazonaws.com/awscli-exe-linux-$arch.zip" -o "awscliv2.zip"
unzip awscliv2.zip
./aws/install
rm -rf aws awscliv2.zip
