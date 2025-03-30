#!/bin/bash

if [ "$1" == "--init" ]; then
    cd ../../../third_party/typescript
    npm install
    npm run build
    npm run release
    npm pack

    typescript_file=$(ls ohos-typescript-*.tgz | head -n 1)
    cp $typescript_file ../../developtools/ace_ets2bundle/compiler
    cp $typescript_file ../../arkcompiler/ets_frontend/arkguard
    rm $typescript_file
    git restore .

    cd ../../arkcompiler/ets_frontend/arkguard
    npm install

    rm -rf ./node_modules/typescript
    typescript_file=$(ls ohos-typescript-*.tgz | head -n 1)
    tar -xzf $typescript_file -C ./node_modules/
    mv ./node_modules/package ./node_modules/typescript

    npm run build
    npm pack
    arkguard_file=$(ls arkguard-*.tgz | head -n 1)
    mv $arkguard_file ../../../developtools/ace_ets2bundle/compiler
    rm $typescript_file
    git restore .

    cd ../../../developtools/ace_ets2bundle/compiler
    npm install
    npm install nyc
    npm install jscpd
    npm install eslint
fi

rm -rf ./node_modules/arkguard
rm -rf ./node_modules/typescript

arkguard_file=$(ls arkguard-*.tgz | head -n 1)
tar -xzf $arkguard_file -C ./node_modules/
mv ./node_modules/package ./node_modules/arkguard

typescript_file=$(ls ohos-typescript-*.tgz | head -n 1)
tar -xzf $typescript_file -C ./node_modules/
mv ./node_modules/package ./node_modules/typescript

# rm $arkguard_file
# rm $typescript_file