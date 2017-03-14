/**
 * Created by nwb on 2016/8/31.
 */

/*
 使用范例
 页面需先引入jquery

 var wechatShare=new WeChatShare();
 var shareData ={
 shareConfig:{
 title: "分散测试",
 desc: "宝象金融新产品测试",
 link: location.href,
 imgUrl: "http://bxwd-img.oss-cn-hangzhou.aliyuncs.com/upload/image/1608/0ca304ef-f2f0-4a0c-aaa3-260bbf8f9f30.jpg"
 },
 menuList:{
 menuList: [
 'menuItem:readMode', // 阅读模式
 'menuItem:share:timeline', // 分享到朋友圈
 'menuItem:copyUrl', // 复制链接
 'menuItem:share:appMessage'
 ]
 },
 callback:function(response){
 console.log("ceshi")
 }
 }
 wechatShare.init(shareData);


 //        'menuItem:copyUrl',//复制链接
 //        'menuItem:delete',//删除
 //        'menuItem:originPage',//原网页
 //        'menuItem:readMode',//阅读模式
 //        'menuItem:openWithQQBrowser',//在QQ浏览器中打开
 //        'menuItem:openWithSafari',//在Safari中打开
 //        'menuItem:share:email',//邮件
 //        'menuItem:share:brand',//一些特殊公众号
 //        'menuItem:share:qq',//分享到QQ
 //        'menuItem:share:weiboApp',//分享到Weibo
 //        'menuItem:favorite',//收藏
 //        'menuItem:share:facebook',//分享到FB
 //        'menuItem:share:QZone',//分享到 QQ 空间
 //        'menuItem:editTag',//编辑标签
 //        'menuItem:exposeArticle',//举报
 //        'menuItem:share:timeline',//分享到朋友圈
 //        'menuItem:setFont',//调整字体
 //        'menuItem:share:appMessage']//发送给朋友
 * */

var jumpApp = function(response) {
    try{localStorage.setItem('appFunc',JSON.stringify(response));}catch(r)
    {sessionStorage.setItem('appFunc',JSON.stringify(response));}
}
var baoxiangAppCallback=function(response){

    WeChatShare.callback(response);
}
Object.extend = function(destination, source) {
    for (var property in source) {
        destination[property] = source[property];
    }
    return destination;
}

function WeChatShare() {}
WeChatShare.prototype.init = function(shareData) {
    Object.extend(WeChatShare.shareData, shareData.shareConfig || {});
    var ua = navigator.userAgent.toLowerCase();
    WeChatShare.callback=typeof shareData.callback=="function"?shareData.callback:function(){}
    if(navigator.standalone == true){
        WeChatShare.appShare()
    }else if(ua.indexOf('baoxiang') != -1){
        WeChatShare.appShare()
    }else if(ua.indexOf('micromessenger/') != -1){
        //微信内运行
        WeChatShare.loadjs('//res.wx.qq.com/open/js/jweixin-1.0.0.js',this.share,shareData)
    }
}
WeChatShare.loadjs=function(src,func,shareData)
{
    if(typeof func != 'function')
    {
        console.log('param 2 is not a function!!') ;
        return false ;
    }
    //判断这个js文件存在直接执行回调
    var scripts = document.getElementsByTagName('script') ;
    for(i in scripts)
        if(scripts[i].src == src)
            return func(shareData) ;

    var script = document.createElement('script') ;
    script.type ='text/javascript' ;
    script.src = src ;
    var head = document.getElementsByTagName('head').item(0);
    head.appendChild(script);
    script.onload = function(){
        func(shareData);
    }
}
WeChatShare.appShare=function(){

    try{
        var appFunc = JSON.parse(localStorage['appFunc']);
        if(appFunc&&appFunc.indexOf('share') != -1){
            window.location="baoxiang://share?title="+WeChatShare.shareData.title+"&desc="+WeChatShare.shareData.desc+"&link="+WeChatShare.shareData.link+"&imgUrl="+WeChatShare.shareData.imgUrl
        }else{
            window.setTimeout(function(){
                WeChatShare.appShare()
            },200)
        }
    }catch(r){
        appFunc = sessionStorage['appFunc'] && JSON.parse(sessionStorage['appFunc']);
        if(appFunc&&appFunc.indexOf('share') != -1){
            window.location="baoxiangShare://share?title="+WeChatShare.shareData.title+"&desc="+WeChatShare.shareData.desc+"&link="+WeChatShare.shareData.link+"&imgUrl="+WeChatShare.shareData.imgUrl
        }else{
            window.setTimeout(function(){
                WeChatShare.appShare()
            },200)
        }
    }/*
     */
}

WeChatShare.prototype.share=function(shareData){
    $.ajax({
        url: "/wechat/sign.html",
        data: {url: location.href},
        success: function (data) {
            // 微信分享事件监听
            wx.config({
                debug: false,
                appId: data.appId, // 公众号的唯一标识
                timestamp: data.timestamp, // 生成签名的时间戳
                nonceStr: data.nonceStr, // 生成签名的随机串
                signature: data.signature, // 签名
                jsApiList: [
                    // 所有要调用的 API 都要加到这个列表中
                    'checkJsApi',
                    'onMenuShareTimeline',
                    'onMenuShareAppMessage',
                    'onMenuShareQQ',
                    'hideMenuItems',
                    'hideAllNonBaseMenuItem',
                    'hideOptionMenu',
                    'hideOptionMenu',
                    'showMenuItems',
                    'hideMenuItem'
                ]
            });
            wx.ready(function () {
                //全部屏蔽掉
                if(shareData.menuList){
                    wx.hideOptionMenu()
                    wx.showMenuItems(shareData.menuList);
                }else{
                    wx.hideOptionMenu()
                }
                WeChatShare.shareData.success= function () {
                    var response={
                        isSuccess:true,
                        type:"h5",
                        message:"分享成功"
                    }
                    WeChatShare.callback(response);
                }
                WeChatShare.shareData.fail=function (res) {
                    var response={
                        isSuccess:false,
                        type:"h5",
                        message:"分享失败"
                    }
                    WeChatShare.callback(response);
                }

                //分享到朋友圈
                wx.onMenuShareTimeline(WeChatShare.shareData);
                //分享到微信好友
                wx.onMenuShareAppMessage(WeChatShare.shareData);
                wx.onMenuShareQQ(WeChatShare.shareData);

            });
        }
    });

}


//默认分享内容
var share_desc = '宝象金融(www.bxjr.com)是一家专注于农牧食品业供应链金融领域的互联网金融平台,精耕于供应链金融模式,从而为广大投资者提供高效低风险的互联网理财产品.同时,宝象金融提供包括互联网理财,投资,借款等服务.';

try{
    share_desc = document.querySelector('meta[name="description"]').getAttribute('content');  // by Hsi 20160903 0:22
}catch(r){
    //退级使用
    var meta = document.getElementsByTagName('meta');
    for(i in meta){
        if(typeof meta[i].name!="undefined"&&meta[i].name.toLowerCase()=="description"){
            share_desc = meta[i].content;
        }
    }
}


WeChatShare.shareData = {//默认值
    title: document.title?document.title:"宝象金融_专注于农牧食品业供应链金融的互联网金融平台 - 宝象金融",
    desc: share_desc,
    link: location.href,
    imgUrl: "http://m.bawsun.com/topic/201601/newYear/images/logo.jpg"
};
