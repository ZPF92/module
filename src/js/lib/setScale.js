'use strict';
;!function(top){
    var doc=top.document;
    top.SetScale=function(nWidth){
        this.obj=doc.querySelector('meta[name^=v]');
        this.viewWidth=top.screen.width;
        this.viewHeight=top.screen.height;
        this.initWidth=nWidth;
        this.scale=1;
        this.init()['orientation' in window ?'change':'resize']();
    };    
    SetScale.prototype={
    	constructor:SetScale,	
        init:function(){
            doc.addEventListener('DOMContentLoaded',function(){
				this.scale=this.viewWidth/this.initWidth;
            	this.obj.content='width='+this.initWidth+',initial-scale='+this.scale+',user-scalable=no,target-densitydpi=device-dpi';	
			}.bind(this),false);
            return this;
        },
        resize:function(){
            top.addEventListener('resize',function(){
                this.scale=top.screen.width/this.initWidth;
                this.obj.content='width='+this.initWidth+',initial-scale='+this.scale+',user-scalable=no,target-densitydpi=device-dpi';    
            }.bind(this),false);    
        },
        change:function(){
            top.addEventListener('orientationchange',function(){
                var rotate=(top.orientation+90)/90%2;
                if(!rotate){
                    this.scale=this.viewHeight/this.initWidth;
                    this.obj.content='width='+this.initWidth+',initial-scale='+this.scale+',user-scalable=no,target-densitydpi=device-dpi';    
                }else{
                    this.scale=this.viewWidth/this.initWidth;
                    this.obj.content='width='+this.initWidth+',initial-scale='+this.scale+',user-scalable=no,target-densitydpi=device-dpi';    
                }
            }.bind(this),false);        
        },    
    };
    new SetScale(320);
}(parent);