var request = require('request');
var parseString = require('xml2js').parseString;

const timelineUrl = {
    url: 'http://www.data.jma.go.jp/developer/xml/feed/extra_l.xml',
    method: 'GET'
}

eachInfomationUrl = {
    url: '',
    method: 'GET'
}

subEachInfomaitionUrl = {
    url: '',
    method: 'GET'
}

targetPrefecture = "広島地方気象台";
var flag = 0;
var much = -1;

Warning = {};
var beforeWarning = {};
var Warning = {};
var time = "";

const getWarning = () =>{
    return new Promise((resolve,reject)=>{
        request(timelineUrl, (err, res, body) => {
            if (err) {
                reject("failed.");
            } else {
                parseString(body, (err, data) => {
                    var length = Object.keys(data.feed.entry).length;
                    for (var i = 0; i < length; i++) {
                        var Prefecture = data.feed.entry[i]["author"][0].name[0];
                        if (Prefecture == targetPrefecture) {
                            if (flag == 0) {
                                much = i;
                                eachInfomationUrl.url = data.feed.entry[i]["link"][0].$.href;
                                flag = 1;
                            } if (flag == 1) {
                                subEachInfomaitionUrl.url = data.feed.entry[i]["link"][0].$.href;
                                flag = 2;
                            }
                        }
                    }
                    request(eachInfomationUrl, (err, res, body) => {
                        if (err || much == -1) {
                            reject("failed.");
                        } else {
                            beforeWarning = JSON.parse(JSON.stringify(Warning));
                            parseString(body, (err, data) => {
                                if (data.Report.Head[0].InfoKind[0] == "気象警報・注意報" || data.Report.Head[0].InfoKind[0] == "広島県気象警報・注意報" && !err) {
                                    Warning = {};
                                    var Area = data.Report.Body[0].Warning[3].Item[0];
                                    time = data.Report.Head[0].TargetDateTime[0];
                                    for (var i = 0; i < Object.keys(Area.Kind).length; i++) {
                                        Warning[Area.Kind[i].Name[0]] = Area.Kind[i].Status[0];     
                                    }
                                    resolve(JSON.stringify(Warning));
                                } else {
                                    request(subEachInfomaitionUrl, (err1, res1, body1) => {
                                        parseString(body1, (err3, data1) => {
                                            if (data1.Report.Head[0].InfoKind[0] == "気象警報・注意報" || data1.Report.Head[0].InfoKind[0] == "広島県気象警報・注意報" && !err3) {
                                                Warning = {};
                                                Area = data1.Report.Body[0].Warning[3].Item[0];
                                                time = data1.Report.Head[0].TargetDateTime[0];
                                                for (var i = 0; i < Object.keys(Area.Kind).length; i++) {
                                                    Warning[Area.Kind[i].Name[0]] = Area.Kind[i].Status[0];
                                                }
                                                resolve(JSON.stringify(Warning));
                                            } else {
                                                reject("failed.");
                                            }
                                        });
                                    });
                                }
                            });
                        }
                    });
                })
            }
        })
    })
}

exports.getWarning = getWarning;