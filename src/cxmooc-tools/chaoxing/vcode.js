const common = require('../common');
const serverConfig = require('../../config');
const until = require('./util');

module.exports = function () {
    let self = this;
    this.monitorVcode = function () {
        //验证码监控加载
        //作业处验证码
        if (document.getElementById('imgVerCode')) {
            $('#imgVerCode').on('load', function () {
                if($('#imgVerCode').attr('src').indexOf('?')<0){
                    //节约可能的一次打码
                    return;
                }
                console.log('准备打码...');
                let notic = until.signleLine('cxmooc自动打码中...', 'dama', $('#sub').parents('td'));
                let img = document.getElementById('imgVerCode');
                getVcode('/img/code?' + new Date().getTime(), img, function (code, msg) {
                    if (code === undefined) {
                        $(notic).html(msg);
                        return;
                    }
                    $(notic).html('cxmooc打码成功,准备提交');
                    $('input#code').val(code);
                    setTimeout(function () {
                        $('a#sub').click();
                    }, 2000);
                }, true);
            });
        }
        //异常验证码
        let yc = document.getElementById('ccc');
        if (yc != undefined) {
            yc.onclick = function () {
                getVcode('/processVerifyPng.ac?t=' + Math.floor(2147483647 * Math.random()), yc, function (code, msg) {
                    if (code === undefined) {
                        alert(msg);
                        return;
                    }
                    document.getElementById('ucode').value = code;
                    setTimeout(function () {
                        document.getElementsByClassName('submit')[0].click();
                    }, 2000);
                });
            }
        }
        //保障账号安全验证码
        window.showChapterVerificationCodeTip = window.showChapterVerificationCode || 0;
        window.chapterVerifyCode = function () {
            let notic = until.signleLine('cxmooc自动打码中...', 'dama1', $('.DySearch'));
            $(notic).css('float', 'left');
            let img = $('.fl[name=chapterNumVerCode]');
            if (img.length <= 0) {
                return;
            }
            img = img[0];
            getVcode('/verifyCode/studychapter?' + (new Date()).valueOf(), img, function (code, msg) {
                if (code === undefined) {
                    $(notic).html(msg);
                    return;
                }
                $(notic).html('cxmooc打码成功,准备提交');
                $('input#identifyCodeRandom').val(code);
                setTimeout(function () {
                    continueGetTeacherAjax();
                }, 2000);
            });
        }
    }

    function getVcode(url, img, callback, show) {
        let vcodeimg = show ? img : document.createElement('img');
        let dmStart = function () {
            let base64 = common.getImageBase64(vcodeimg, 'jpeg');
            if (!show) {
                img.src = base64;
            }
            common.gm_post(serverConfig.url + 'vcode', 'img=' + encodeURIComponent(base64.substr('data:image/jpeg;base64,'.length)), false, function (ret) {
                let json = JSON.parse(ret);
                if (json.code == -2) {
                    callback(undefined, json.msg);
                    //TODO:无权限
                } else if (json.msg) {
                    callback(json.msg);
                } else {
                    getVcode(url, img, callback);
                }
            }).error(function () {
                callback(undefined, '网络请求失败');
            });
        }
        if (show) {
            dmStart();
        } else {
            vcodeimg.onload = dmStart;
            vcodeimg.src = url;
        }
    }

    self.monitorVcode();

}