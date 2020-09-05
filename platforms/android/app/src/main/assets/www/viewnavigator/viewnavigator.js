/*
THIS SOFTWARE IS PROVIDED BY ANDREW M. TRICE ''AS IS'' AND ANY EXPRESS OR IMPLIED
WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL ANDREW M. TRICE OR
CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/


var ViewNavigator = function( target,section, backLinkCSS, bindToWindow ) {

	this.supportsBackKey = true; //phonegap on android only
	this.animating = false;
	this.animationX = 150;
	this.animationDuration = 1000;
	this.history = [];
	this.scroller = null;
	this.headerPadding = 5;
	
	this.uniqueId = this.guid();
	
	var regexp = new RegExp("Windows Phone OS 7");	
	this.winPhone = (navigator.userAgent.search(regexp) >= 0);
	
	this.rootElement = $('<div class="viewNavigator_root"></div>');
	this.header = $('<div class="viewNavigator_'+section+'"></div>');

	this.subHeader = $('<div></div>');
	this.content = $('<div class="viewNavigator_'+section+'content" id="contentRoot"></div>');
	this.footer = $('<div></div>');
	this.rootElement.append( this.header );
	this.rootElement.append( this.subHeader );
	this.rootElement.append( this.content );
	this.rootElement.append( this.footer );
	
	this.parent = $( target );
	
	this.backLinkCSS = backLinkCSS ? backLinkCSS : "viewNavigator_backButton";
	
	var self = this;
	//$(window).resize( function(event){ self.resizeContent() } );
	//alert( this.parent.toString() );
	//this.parent.resize( function(event){ self.resizeContent() } );
	
	if ( bindToWindow != false ) {
		$(window).resize( function(event){ self.resizeContent() } );
	}
	else {
		this.parent.resize( function(event){ self.resizeContent() } );
	}
	
	this.parent.append( this.rootElement );
	
	if ( window.viewNavigators == null || window.viewNavigators == undefined ) {
		window.viewNavigators = {};
	}
	window.viewNavigators[ this.uniqueId ] = this; 

}

ViewNavigator.prototype.replaceView = function( viewDescriptor ) {
	if (this.animating)
		return;
	viewDescriptor.animation = "pushEffecta"
	
	//this is a hack to mimic behavior of pushView, then pop off the "current" from the history
	this.history.push( viewDescriptor );
	this.updateView( viewDescriptor );
	this.history.pop();
	this.history.pop();
	this.history.push( viewDescriptor );
}
ViewNavigator.prototype.currentView = function() {
    if (this.animating)
        return;
    var currentViewDescriptor = this.history[ this.history.length-1];
    return currentViewDescriptor;
}

ViewNavigator.prototype.pushView = function( viewDescriptor ) {
	if (this.animating)
		return;
	viewDescriptor.animation = "pushEffecta"
	this.history.push( viewDescriptor );
	this.updateView( viewDescriptor );
}

ViewNavigator.prototype.popView = function() {

	if (this.animating || this.history.length <= 1 )
		return this.history.length;
	
	var currentViewDescriptor = this.history[ this.history.length-1];
	if ( currentViewDescriptor.backCallback ) {
		currentViewDescriptor.backCallback();
	}
		
	this.history.pop();	
	var viewDescriptor = this.history[ this.history.length-1 ];
	viewDescriptor.animation = "popEffecta"
	this.updateView( viewDescriptor );
}

ViewNavigator.prototype.setHeaderPadding = function( amount ) {
	this.headerPadding = amount;
	if ( this.headerBacklink ) {
		this.headerBacklink.css("left", amount);
	}
}

ViewNavigator.prototype.updateView = function( viewDescriptor ) {
	
	this.animating = true;
	
    
	
	this.contentPendingRemove = this.contentViewHolder;
	this.headerContentPendingRemove = this.headerContent;
viewDescriptor.section = viewDescriptor.section ? viewDescriptor.section : "header";
	
	this.headerContent = $('<div class="top-bar"></div>');
	this.headerTitle = $('<h1 class="top-bar-title" style="white-space: nowrap; overflow:hidden;margin-left:25%; margin-right:20%;text-overflow: ellipsis;">' + viewDescriptor.title + "</h1>");
	this.headerContent.append( this.headerTitle );
	if(viewDescriptor.title!='Navigation')
	{
		//var menuButton = $('<ul><li class="header-button left icon-list " id="menuButton' + linkGuid + '" onclick="menuKeyDown()"></li>');
		//this.headerContent.append(menuButton);
  	   
	}
	else
	{
		//var menuButton = $('<li class="viewNavigator_header_backlink viewNavigator_backButtonPosition viewNavigator_menuButton" id="menuButton' + linkGuid + '" onclick="menuKeyDown()">(X)</li>');
		//this.headerContent.append(menuButton);	
	}
	
	var linkGuid = this.guid();
	if ( viewDescriptor.backLabel ) {
		//this.headerBacklink = $('<li class="header-button right " id="link' + linkGuid + '" onclick="backButton()">'+ viewDescriptor.backLabel + '</li></ul>');
        this.headerBacklink = $('<a class="top-bar-link left icon-back" href="#" onclick="backButton()">'+ viewDescriptor.backLabel + '</a>');
		this.headerContent.append( this.headerBacklink );
		
		//this is for proper handling in splitviewnavigator
		this.setHeaderPadding( this.headerPadding );

        if ( viewDescriptor.favLabel && viewDescriptor.fav==false ) {
            this.headerFavlink = $('<a href="#" class="top-bar-link right icon-only icon-plus" onclick="addToFolder('+viewDescriptor.question+')">'+ viewDescriptor.backLabel + '</a>');
            this.headerContent.append( this.headerFavlink );
        }
        else if ( viewDescriptor.favLabel && viewDescriptor.fav!=false ) {
            this.headerFavlink = $('<a href="#" class="top-bar-link right icon-only icon-remove" onclick="removeFromFav('+viewDescriptor.question+')">'+ viewDescriptor.backLabel + '</a>');
            this.headerContent.append( this.headerFavlink );
        }
        else if (viewDescriptor.folder!=false && viewDescriptor.folder!=undefined) {
            this.headerFavlink = $('<a href="#" class="top-bar-link right icon-only icon-remove" onclick="removeFolder('+viewDescriptor.folder+')">'+ viewDescriptor.backLabel + '</a>');
            this.headerContent.append( this.headerFavlink );
        }
        this.setHeaderPadding( this.headerPadding );
	}

	else
	{
		this.headerBacklink = $('</ul>');
		this.headerContent.append( this.headerBacklink );
	}
	
	var id = this.guid();
    if(viewDescriptor.colour == 'f5f5f5'){
        this.contentViewHolder = $('<div class="viewNavigator_contentHolder" style="background: #f5f5f5;" id="' + id + '" ></div>');
    }
    else{
        this.contentViewHolder = $('<div class="viewNavigator_contentHolder" style="background: #ffffff;" id="' + id + '"></div>');
    }

	this.contentViewHolder.append( viewDescriptor.view );
	this.resizeContent();
	
	if ( this.contentPendingRemove ){ 
        this.contentPendingRemove.stop()
	}
	if ( this.headerContentPendingRemove ) {
        this.headerContentPendingRemove.stop()
	}
	this.headerContent.stop()
	//this.subHeader.stop()
	this.contentViewHolder.stop()
	
	
	
	if ( this.scroller != null ) {
	    var scrollY = this.scroller.y;
        this.scroller.destroy();
        this.scroller = null;
        
        if (this.contentPendingRemove) {
            //logNow( scrollY );
            
            //use this to mantain scroll position when scroller is destroyed
            var children = $( this.contentPendingRemove.children()[0] );
            children.attr( "scrollY", scrollY );
            var originalTopMargin = children.css( "margin-top" );
            children.attr( "originalTopMargin", originalTopMargin );
            
            var cssString = "translate3d(0px, "+(parseInt( scrollY ) + parseInt( originalTopMargin )).toString()+"px, 0px)";
            children.css( "-webkit-transform", cssString );
            
           // children.css( "margin-top", (parseInt( scrollY ) + parseInt( originalTopMargin )).toString() + "px" );
        } 
    }
	
	$(this.contentPendingRemove).click(function(){ return false; });
	
    
	if ( viewDescriptor.animation == "popEffect" ) {
		
		this.contentViewHolder.css( "left", -this.contentViewHolder.width() );
		this.contentViewHolder.css( "opacity", 1 );
    	this.content.prepend( this.contentViewHolder );
    	
		this.headerContent.css( "left", -this.animationX );
		this.headerContent.css( "opacity", 0 );
		this.header.append( this.headerContent );
    	
    	var func = this.animationCompleteHandler(this.contentPendingRemove, this.headerContentPendingRemove, this.headerContent, this.contentViewHolder );
    	
 	   	this.contentPendingRemove.animate({
   	 			left:this.contentViewHolder.width(),
    			avoidTransforms:false,
    			useTranslate3d: true
    		}, this.animationDuration*0.8);
    		
    	//remove this to change back
 	   	this.contentViewHolder.animate({
   	 			left:0,
    			avoidTransforms:false,
    			useTranslate3d: true
    		}, this.animationDuration/2);
    		
    	this.headerContentPendingRemove.animate({
   	 			left:this.animationX,
    			opacity:0,
    			avoidTransforms:false,
    			useTranslate3d: true
    		}, this.animationDuration, func );
    		
    	this.headerContent.animate({
   	 			left:0,
    			opacity:1,
    			avoidTransforms:false,
    			useTranslate3d: true
    		}, this.animationDuration/2 );
    		
    	
    	//using a timeout to get around inconsistent response times for webkittransitionend event
        //var func = this.animationCompleteHandler(this.contentPendingRemove, this.headerContentPendingRemove, this.headerContent, this.contentViewHolder );
    	//setTimeout( func, this.animationDuration+90 );
	}
/*	else if ( this.history.length > 1 ) {*/
		else if ( false) {
	
		this.contentViewHolder.css( "left", this.contentViewHolder.width() );
		this.contentViewHolder.css( "opacity", 1 );
		
    	this.content.append( this.contentViewHolder );
    	
		this.headerContent.css( "left", this.animationX );
		this.headerContent.css( "opacity", 0 );
		this.header.append( this.headerContent );

        var func = this.animationCompleteHandler(this.contentPendingRemove, this.headerContentPendingRemove, this.headerContent, this.contentViewHolder );

 	   	this.contentViewHolder.animate({
   	 			left:0,
    			avoidTransforms:false,
    			useTranslate3d: true
    		}, this.animationDuration*0.75);
    	
 	   	this.contentPendingRemove.animate({
   	 			left:-this.contentViewHolder.width()/2,
    			avoidTransforms:false,
    			useTranslate3d: true
    		}, this.animationDuration, func);
    		
    	this.headerContent.animate({
   	 			left:0,
    			opacity:1,
    			avoidTransforms:false,
    			useTranslate3d: true
    		}, this.animationDuration*0.75);
    		
    	this.headerContentPendingRemove.animate({
   	 			left:-this.animationX,
    			opacity:0,
    			avoidTransforms:false,
    			useTranslate3d: true
    		}, this.animationDuration );
    		
    	//using a timeout to get around inconsistent response times for webkittransitionend event
    	//var func = this.animationCompleteHandler(this.contentPendingRemove, this.headerContentPendingRemove, this.headerContent, this.contentViewHolder );
    	//setTimeout( func, this.animationDuration+90 );
	}
	else {
		//$("#sidebar").css( "opacity", 1 );
		if(viewDescriptor.tabs=='Y')
		{
			var subHead=$('<nav class="top-bar-sub tabs tabs-three"><a id = "sub1" class="tabs-link" href="#" onclick="renderCategories()">Categories</a><a id ="sub2" class="tabs-link" href="#" onclick="renderFolders(0,20)">My Folders</a><a id ="sub3" class="tabs-link" href="#" onclick="loadNext(\'%\',0,20,\'latest\')">Latest Q&A</a></nav><div class="searchBox" style="display:none;"></div>');

	       this.subHeader.html(subHead);
		}
        var cate = '';
        if(viewDescriptor.category==undefined){
            cate = '%';
        }
        else{
        	cate = viewDescriptor.category;
        }
        logNow("Cate is "+cate);
        var htmlStr = $('<nav class="bottom-bar bottom-bar-four"><a href="#" class="bottom-bar-link icon-home" onclick="renderHome()" id="foot1">Home</a><a href="#" class="bottom-bar-link icon-alt" onclick="loadNext(\'%\',0,20,\'random32\')" id="foot2">Shuffle!</a><a href="#" class="bottom-bar-link icon-search" onclick="renderSearch(\'' + cate + '\')" id="foot3">Search</a><a href="#" class="bottom-bar-link icon-settings" id="foot4" onclick="renderSettings()">Settings</a></nav>"');
        this.footer.html(htmlStr);
		this.contentViewHolder.css( "left", 0 );
		this.contentViewHolder.css( "opacity", 1 );
    	this.content.html( this.contentViewHolder );

		this.headerContent.css( "left", 0 );
		this.headerContent.css( "opacity", 1 );
		this.header.html( this.headerContent );
	
		this.animating = false;
		//$('#listDiv').css('padding-top','44px');
    	//$('#listDiv2').css('padding-top','44px');
		$('.searchBox').css('display','none');
		this.resetScroller();
//		$("#sidebar").css( "opacity", 100 );
	}
	
    if ( viewDescriptor.backLabel ) {
    	new NoClickDelay( this.headerBacklink.get()[0] );
	}
	
	if ( viewDescriptor.showCallback ) {
	    viewDescriptor.showCallback();
	}
}


ViewNavigator.prototype.destroyScroller = function() {
  
	if ( !this.winPhone ) {
		if ( this.scroller != null ) {
			this.scroller.destroy();
			this.scroller = null;
		}
    }
}

var version = "";

ViewNavigator.prototype.resetScroller = function() {
	logNow("RESET CALLED");
	if(window.device != null && window.device.platform == "Android"){
		 //version = window.device.version.replace(/\./g,"");
        version = getAndroidVersion();
		 logNow("VERSION IS "+version);
	}    
    var id = this.contentViewHolder.attr( "id" );
    var currentViewDescriptor = this.history[ this.history.length-1];
    this.destroyScroller();
	if ( !this.winPhone && version!="" && version <=402 && false) {
		if ( id && !(currentViewDescriptor && currentViewDescriptor.scroll == false)) {
			var self = this;
			if ( 'ontouchstart' in window ){
                setTimeout( function() { 
                	//logNow("RESET EXECUTED");
                    
                    //use this to mantain scroll position when scroller is destroyed
                    var targetDiv = $( $("#"+id ).children()[0] );
                    var scrollY= targetDiv.attr( "scrollY" );
                    var originalTopMargin = targetDiv.attr( "originalTopMargin" );
                    if ( currentViewDescriptor.maintainScrollPosition !== false && scrollY != undefined && scrollY != "" ){
                      //  logNow( "resetScroller scrollY: " + scrollY)
                        targetDiv.css( "margin-top", originalTopMargin );
                      //  var cssString = "translate3d(0px, "+(originalTopMargin).toString()+"px, 0px)";
                        //targetDiv.css( "-webkit-transform", cssString );
                    }
                    logNow("ID IS "+id);
                    self.scroller = new IScroll( "#"+id, {click: false});
                    if ( currentViewDescriptor.maintainScrollPosition !== false && scrollY != undefined && scrollY != "" ) {
                        self.scroller.scrollTo( 0, parseInt( scrollY ) );
                    }
                }, 10 );
                //this.scroller = new iScroll( id );
			} 
			else {
			    var target = $("#"+id );
			    target.css( "overflow", "scroll" );
			    
			}
		}
    }
}


ViewNavigator.prototype.refreshScroller = function() {
    
	if ( !this.winPhone ) {
		if ( this.scroller != null ) {
			this.scroller.refresh();
		}
    }
}

ViewNavigator.prototype.animationCompleteHandler = function(removalTarget, headerRemovalTarget, headerView, contentView) {
	var self = this;
	return function() {
		self.animating = false;
        self.resetScroller();
		if ( removalTarget ) {
			removalTarget.unbind( "click" );
			removalTarget.detach();
		}
		if ( headerRemovalTarget ) {
			headerRemovalTarget.unbind( "click" );
			headerRemovalTarget.detach(); 
		}
	}
}

ViewNavigator.prototype.resizeContent = function(event) {

	var targetWidth = this.parent.width();
	if ( this.headerContent )
		this.headerContent.width( targetWidth );
	if ( this.contentViewHolder )
		this.contentViewHolder.width( targetWidth );
}


//GUID logic from http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript

ViewNavigator.prototype.S4 = function() {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1); 
}
 
ViewNavigator.prototype.guid = function() {
	return ('a'+this.S4() + this.S4() + "-" + this.S4() + "-4" + this.S4().substr(0,3) + "-" + this.S4() + "-" + this.S4() + this.S4() + this.S4()).toLowerCase();
}



/*  PHONEGAP INTEGRATION */
/*
//android+phonegap specific back button support - will only work if phonegap is used on android (www.phonegap.com)
if ( typeof PhoneGap != 'undefined' ) { 
	document.addEventListener("deviceready", onDeviceReady, false);
}

function onDeviceReady() {
   document.addEventListener("backbutton", onBackKey, false);
}

function onBackKey( event ) {
	event.preventDefault();
	window.viewNavigator.popView();
	for ( var x=0; x<window.backKeyViewNavigators.length; x++ ) {
		window.backKeyViewNavigators[x].popView();
	}
}
*/
	
//block page scrolling

	 if ( !this.winPhone && version!="" && version <=402 ) {
		logNow("DISABLING TOUCHMOVE -VN "+version);
		 document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);	 
	 }




