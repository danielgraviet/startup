#!/bin/bash

while getopts k:h:s: flag
do
    case "${flag}" in
        k) key=${OPTARG};;
        h) hostname=${OPTARG};;
        s) service=${OPTARG};;
    esac
done

if [[ -z "$key" || -z "$hostname" || -z "$service" ]]; then
    printf "\nMissing required parameter.\n"
    printf "  syntax: deployService.sh -k <pem key file> -h <hostname> -s <service>\n\n"
    exit 1
fi

printf "\n----> Deploying React bundle $service to $hostname with $key\n"

# Step 1: Build the distribution package
printf "\n----> Build the distribution package\n"
rm -rf build dist
mkdir build
mkdir build/service  # Explicitly create service/ directory
npm install
npm run build
cp -r dist build/dist
cp service/index.js build/service/
cp package.json build

# Step 2: Clear previous distribution
printf "\n----> Clearing out previous distribution on the target\n"
ssh -i "$key" ubuntu@$hostname << ENDSSH
rm -rf services/${service}
mkdir -p services/${service}
ENDSSH

# Step 3: Copy to target
printf "\n----> Copy the distribution package to the target\n"
scp -r -i "$key" build/* ubuntu@$hostname:services/$service

# Step 4: Deploy on target
printf "\n----> Deploy the service on the target\n"
ssh -i "$key" ubuntu@$hostname << 'ENDSSH'
export PATH=$PATH:/home/ubuntu/.nvm/versions/node/v20.17.0/bin  # Adjust Node version as needed
cd services/startup
npm install
pm2 restart startup || pm2 start service/index.js --name startup
pm2 save
ENDSSH

# Step 5: Clean up
printf "\n----> Removing local copy of the distribution package\n"
rm -rf build dist