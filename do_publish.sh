#/bin/bash

rm -r build build.tar
npm run build
tar -czf ./build.tar ./build
gcloud compute scp ./build.tar penguin:~/

