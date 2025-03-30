export LD_LIBRARY_PATH=/srv/workspace/lxc_9e212deb5/code/out/sdk/ohos-sdk/linux/ets/ets1.2/build-tools/ets2panda/lib/

rm -rf /srv/workspace/lxc_9e212deb5/code/developtools/ace_ets2bundle/arkui-plugins/test/declgenV1OutPath/*
rm -rf /srv/workspace/lxc_9e212deb5/code/developtools/ace_ets2bundle/arkui-plugins/test/declgenBridgeCodePath/*


cd /srv/workspace/lxc_9e212deb5/code/arkcompiler/ets_frontend/ets2panda/driver/build_system
npm run build_debug

rm -rf /srv/workspace/lxc_9e212deb5/code/out/sdk/ohos-sdk/linux/ets/ets1.2/build-tools/driver/build-system/dist/*
mv /srv/workspace/lxc_9e212deb5/code/arkcompiler/ets_frontend/ets2panda/driver/build_system/dist/* /srv/workspace/lxc_9e212deb5/code/out/sdk/ohos-sdk/linux/ets/ets1.2/build-tools/driver/build-system/dist/


cd /srv/workspace/lxc_9e212deb5/code/developtools/ace_ets2bundle/arkui-plugins
npm run compile:plugins

rm -rf /srv/workspace/lxc_9e212deb5/code/out/sdk/ohos-sdk/linux/ets/ets1.2/build-tools/ui-plugins/lib/*
mv /srv/workspace/lxc_9e212deb5/code/developtools/ace_ets2bundle/arkui-plugins/lib/* /srv/workspace/lxc_9e212deb5/code/out/sdk/ohos-sdk/linux/ets/ets1.2/build-tools/ui-plugins/lib/


cd /srv/workspace/lxc_9e212deb5/code/developtools/ace_ets2bundle/arkui-plugins/test
npm run localtest_all