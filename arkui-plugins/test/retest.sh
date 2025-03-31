export LD_LIBRARY_PATH=/home/z00576141/workspace/lxc/code/out/sdk/ohos-sdk/linux/ets/ets1.2/build-tools/ets2panda/lib/

rm -rf /home/z00576141/workspace/lxc/code/developtools/ace_ets2bundle/arkui-plugins/test/declgenV1OutPath/*
rm -rf /home/z00576141/workspace/lxc/code/developtools/ace_ets2bundle/arkui-plugins/test/declgenBridgeCodePath/*


cd /home/z00576141/workspace/lxc/code/arkcompiler/ets_frontend/ets2panda/driver/build_system
npm run build_debug

rm -rf /home/z00576141/workspace/lxc/code/out/sdk/ohos-sdk/linux/ets/ets1.2/build-tools/driver/build-system/dist/*
mv /home/z00576141/workspace/lxc/code/arkcompiler/ets_frontend/ets2panda/driver/build_system/dist/* /home/z00576141/workspace/lxc/code/out/sdk/ohos-sdk/linux/ets/ets1.2/build-tools/driver/build-system/dist/


cd /home/z00576141/workspace/lxc/code/developtools/ace_ets2bundle/arkui-plugins
npm run compile:plugins

rm -rf /home/z00576141/workspace/lxc/code/out/sdk/ohos-sdk/linux/ets/ets1.2/build-tools/ui-plugins/lib/*
mv /home/z00576141/workspace/lxc/code/developtools/ace_ets2bundle/arkui-plugins/lib/* /home/z00576141/workspace/lxc/code/out/sdk/ohos-sdk/linux/ets/ets1.2/build-tools/ui-plugins/lib/


cd /home/z00576141/workspace/lxc/code/developtools/ace_ets2bundle/arkui-plugins/test
npm run localtest_all