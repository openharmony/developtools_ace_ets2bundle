let __generate__Id = 0;
function generateId() {
    return "importSystemApi_" + ++__generate__Id;
}
import router from "@system.router";
import app from "@system.router";
import fetch from "@system.fetch";
import http from '@ohos.net.http';
class A {
    pushPage() {
        router.push({
            uri: 'pages/routerpage2/routerpage2',
            params: {
                data1: 'message',
                data2: {
                    data3: [123, 456, 789]
                }
            }
        });
    }
}
class Info {
    getInfo() {
        let info = app.getInfo();
        console.log(JSON.stringify(info));
    }
}
const json = {
    data: {
        responseData: 'NA',
        url: "test_url",
    },
    fetch: function () {
        var that = this;
        fetch.fetch({
            url: that.url,
            success: function (response) {
                console.info("fetch success");
                that.responseData = JSON.stringify(response);
            },
            fail: function () {
                console.info("fetch fail");
            }
        });
    }
};
let httpRequest = http.createHttp();
//# sourceMappingURL=importSystemApi.js.map