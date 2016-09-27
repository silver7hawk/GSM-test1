/* jQuery plugin themeswitcher
---------------------------------------------------------------------*/
$.fn.themeswitcher = function(settings){
	var options = jQuery.extend({
		loadTheme: null,
		initialText: 'Switch Theme',
		width: 150,
		height: 200,
		buttonPreText: 'Theme: ',
		closeOnSelect: true,
		buttonHeight: 14,
		cookieName: 'jquery-ui-theme',
		onOpen: function(){},
		onClose: function(){},
		onSelect: function(){}
	}, settings);

	//markup 
var button = $('<a href="#" class="jquery-ui-themeswitcher-trigger"><span class="jquery-ui-themeswitcher-icon"></span><span class="jquery-ui-themeswitcher-title">' + options.initialText + '</span><div id="tsDiv"></div></a>');
	var switcherpane = $('<div class="jquery-ui-themeswitcher"><div id="themeGallery">	<ul> '
                       // + '<li><a href="http://jqueryui.com/themeroller/css/parseTheme.css.php?ffDefault=Trebuchet+MS,+Tahoma,+Verdana,+Arial,+sans-serif&amp;fwDefault=bold&amp;fsDefault=1.1em&amp;cornerRadius=4px&amp;bgColorHeader=f6a828&amp;bgTextureHeader=12_gloss_wave.png&amp;bgImgOpacityHeader=35&amp;borderColorHeader=e78f08&amp;fcHeader=ffffff&amp;iconColorHeader=ffffff&amp;bgColorContent=eeeeee&amp;bgTextureContent=03_highlight_soft.png&amp;bgImgOpacityContent=100&amp;borderColorContent=dddddd&amp;fcContent=333333&amp;iconColorContent=222222&amp;bgColorDefault=f6f6f6&amp;bgTextureDefault=02_glass.png&amp;bgImgOpacityDefault=100&amp;borderColorDefault=cccccc&amp;fcDefault=1c94c4&amp;iconColorDefault=ef8c08&amp;bgColorHover=fdf5ce&amp;bgTextureHover=02_glass.png&amp;bgImgOpacityHover=100&amp;borderColorHover=fbcb09&amp;fcHover=c77405&amp;iconColorHover=ef8c08&amp;bgColorActive=ffffff&amp;bgTextureActive=02_glass.png&amp;bgImgOpacityActive=65&amp;borderColorActive=fbd850&amp;fcActive=eb8f00&amp;iconColorActive=ef8c08&amp;bgColorHighlight=ffe45c&amp;bgTextureHighlight=03_highlight_soft.png&amp;bgImgOpacityHighlight=75&amp;borderColorHighlight=fed22f&amp;fcHighlight=363636&amp;iconColorHighlight=228ef1&amp;bgColorError=b81900&amp;bgTextureError=08_diagonals_thick.png&amp;bgImgOpacityError=18&amp;borderColorError=cd0a0a&amp;fcError=ffffff&amp;iconColorError=ffd27a&amp;bgColorOverlay=666666&amp;bgTextureOverlay=08_diagonals_thick.png&amp;bgImgOpacityOverlay=20&amp;opacityOverlay=50&amp;bgColorShadow=000000&amp;bgTextureShadow=01_flat.png&amp;bgImgOpacityShadow=10&amp;opacityShadow=20&amp;thicknessShadow=5px&amp;offsetTopShadow=-5px&amp;offsetLeftShadow=-5px&amp;cornerRadiusShadow=5px">			<img src="css/images/lightness.png" alt="UI Lightness" title="UI Lightness" />			<span class="themeName">UI lightness</span>		</a></li>	'
					    + '<li><a href="css/themes/ui-lightness/jquery-ui.css"><img src="css/images/lightness.png" alt="UI Lightness" title="UI Lightness" /><span class="themeName">UI lightness</span></a></li>'
                        + '<li><a href="css/themes/ui-darkness/jquery-ui.css"><img src="css/images/darkness.png" alt="UI Darkness" title="UI Darkness" /><span class="themeName">UI darkness</span></a></li>'
                        + '<li><a href="css/themes/smoothness/jquery-ui.css"><img src="css/images/smoothness.png" alt="Smoothness" title="Smoothness" /><span class="themeName">Smoothness</span></a></li>'
                        + '<li><a href="css/themes/start/jquery-ui.css"><img src="css/images/start.png" alt="Start" title="Start" /><span class="themeName">Start</span></a></li>'
                      //  + '<li><a href="http://jqueryui.com/themeroller/css/parseTheme.css.php?ffDefault=Segoe+UI%2C+Arial%2C+sans-serif&amp;fwDefault=bold&amp;fsDefault=1.1em&amp;cornerRadius=6px&amp;bgColorHeader=333333&amp;bgTextureHeader=12_gloss_wave.png&amp;bgImgOpacityHeader=25&amp;borderColorHeader=333333&amp;fcHeader=ffffff&amp;iconColorHeader=ffffff&amp;bgColorContent=000000&amp;bgTextureContent=05_inset_soft.png&amp;bgImgOpacityContent=25&amp;borderColorContent=666666&amp;fcContent=ffffff&amp;iconColorContent=cccccc&amp;bgColorDefault=555555&amp;bgTextureDefault=02_glass.png&amp;bgImgOpacityDefault=20&amp;borderColorDefault=666666&amp;fcDefault=eeeeee&amp;iconColorDefault=cccccc&amp;bgColorHover=0078a3&amp;bgTextureHover=02_glass.png&amp;bgImgOpacityHover=40&amp;borderColorHover=59b4d4&amp;fcHover=ffffff&amp;iconColorHover=ffffff&amp;bgColorActive=f58400&amp;bgTextureActive=05_inset_soft.png&amp;bgImgOpacityActive=30&amp;borderColorActive=ffaf0f&amp;fcActive=ffffff&amp;iconColorActive=222222&amp;bgColorHighlight=eeeeee&amp;bgTextureHighlight=03_highlight_soft.png&amp;bgImgOpacityHighlight=80&amp;borderColorHighlight=cccccc&amp;fcHighlight=2e7db2&amp;iconColorHighlight=4b8e0b&amp;bgColorError=ffc73d&amp;bgTextureError=02_glass.png&amp;bgImgOpacityError=40&amp;borderColorError=ffb73d&amp;fcError=111111&amp;iconColorError=a83300&amp;bgColorOverlay=5c5c5c&amp;bgTextureOverlay=01_flat.png&amp;bgImgOpacityOverlay=50&amp;opacityOverlay=80&amp;bgColorShadow=cccccc&amp;bgTextureShadow=01_flat.png&amp;bgImgOpacityShadow=30&amp;opacityShadow=60&amp;thicknessShadow=7px&amp;offsetTopShadow=-7px&amp;offsetLeftShadow=-7px&amp;cornerRadiusShadow=8px">			<img src="css/images/darkness.png" alt="UI Darkness" title="UI Darkness" />			<span class="themeName">UI darkness</span>		</a></li>	'
                      //  + '<li><a href="http://jqueryui.com/themeroller/css/parseTheme.css.php?ffDefault=Verdana,Arial,sans-serif&amp;fwDefault=normal&amp;fsDefault=1.1em&amp;cornerRadius=4px&amp;bgColorHeader=cccccc&amp;bgTextureHeader=03_highlight_soft.png&amp;bgImgOpacityHeader=75&amp;borderColorHeader=aaaaaa&amp;fcHeader=222222&amp;iconColorHeader=222222&amp;bgColorContent=ffffff&amp;bgTextureContent=01_flat.png&amp;bgImgOpacityContent=75&amp;borderColorContent=aaaaaa&amp;fcContent=222222&amp;iconColorContent=222222&amp;bgColorDefault=e6e6e6&amp;bgTextureDefault=02_glass.png&amp;bgImgOpacityDefault=75&amp;borderColorDefault=d3d3d3&amp;fcDefault=555555&amp;iconColorDefault=888888&amp;bgColorHover=dadada&amp;bgTextureHover=02_glass.png&amp;bgImgOpacityHover=75&amp;borderColorHover=999999&amp;fcHover=212121&amp;iconColorHover=454545&amp;bgColorActive=ffffff&amp;bgTextureActive=02_glass.png&amp;bgImgOpacityActive=65&amp;borderColorActive=aaaaaa&amp;fcActive=212121&amp;iconColorActive=454545&amp;bgColorHighlight=fbf9ee&amp;bgTextureHighlight=02_glass.png&amp;bgImgOpacityHighlight=55&amp;borderColorHighlight=fcefa1&amp;fcHighlight=363636&amp;iconColorHighlight=2e83ff&amp;bgColorError=fef1ec&amp;bgTextureError=02_glass.png&amp;bgImgOpacityError=95&amp;borderColorError=cd0a0a&amp;fcError=cd0a0a&amp;iconColorError=cd0a0a&amp;bgColorOverlay=aaaaaa&amp;bgTextureOverlay=01_flat.png&amp;bgImgOpacityOverlay=0&amp;opacityOverlay=30&amp;bgColorShadow=aaaaaa&amp;bgTextureShadow=01_flat.png&amp;bgImgOpacityShadow=0&amp;opacityShadow=30&amp;thicknessShadow=8px&amp;offsetTopShadow=-8px&amp;offsetLeftShadow=-8px&amp;cornerRadiusShadow=8px">			<img src="css/images/smoothness.png" alt="Smoothness" title="Smoothness" />			<span class="themeName">Smoothness</span>		</a></li>	'
                      //  + '<li><a href="http://jqueryui.com/themeroller/css/parseTheme.css.php?ffDefault=Verdana%2CArial%2Csans-serif&amp;fwDefault=normal&amp;fsDefault=1.1em&amp;cornerRadius=5px&amp;bgColorHeader=2191c0&amp;bgTextureHeader=12_gloss_wave.png&amp;bgImgOpacityHeader=75&amp;borderColorHeader=4297d7&amp;fcHeader=eaf5f7&amp;iconColorHeader=d8e7f3&amp;bgColorContent=fcfdfd&amp;bgTextureContent=06_inset_hard.png&amp;bgImgOpacityContent=100&amp;borderColorContent=a6c9e2&amp;fcContent=222222&amp;iconColorContent=0078ae&amp;bgColorDefault=0078ae&amp;bgTextureDefault=02_glass.png&amp;bgImgOpacityDefault=45&amp;borderColorDefault=77d5f7&amp;fcDefault=ffffff&amp;iconColorDefault=e0fdff&amp;bgColorHover=79c9ec&amp;bgTextureHover=02_glass.png&amp;bgImgOpacityHover=75&amp;borderColorHover=448dae&amp;fcHover=026890&amp;iconColorHover=056b93&amp;bgColorActive=6eac2c&amp;bgTextureActive=12_gloss_wave.png&amp;bgImgOpacityActive=50&amp;borderColorActive=acdd4a&amp;fcActive=ffffff&amp;iconColorActive=f5e175&amp;bgColorHighlight=f8da4e&amp;bgTextureHighlight=02_glass.png&amp;bgImgOpacityHighlight=55&amp;borderColorHighlight=fcd113&amp;fcHighlight=915608&amp;iconColorHighlight=f7a50d&amp;bgColorError=e14f1c&amp;bgTextureError=12_gloss_wave.png&amp;bgImgOpacityError=45&amp;borderColorError=cd0a0a&amp;fcError=ffffff&amp;iconColorError=fcd113&amp;bgColorOverlay=aaaaaa&amp;bgTextureOverlay=01_flat.png&amp;bgImgOpacityOverlay=75&amp;opacityOverlay=30&amp;bgColorShadow=999999&amp;bgTextureShadow=01_flat.png&amp;bgImgOpacityShadow=55&amp;opacityShadow=45&amp;thicknessShadow=0px&amp;offsetTopShadow=5px&amp;offsetLeftShadow=5px&amp;cornerRadiusShadow=5px">			<img src="css/images/start.png" alt="Start" title="Start" />			<span class="themeName">Start</span>		</a></li>	'			

                        +'</ul></div></div>').find('div').removeAttr('id');
	
	//button events
	button.click(
		function(){
			if(switcherpane.is(':visible')){ switcherpane.spHide(); }
			else{ switcherpane.spShow(); }
					return false;
		}
	);
	
	//menu events (mouseout didn't work...)
	switcherpane.hover(
		function(){},
		function(){if(switcherpane.is(':visible')){$(this).spHide();}}
	);

	//show/hide panel functions
	$.fn.spShow = function(){ $(this)./*css({top: button.offset().top + options.buttonHeight + 6, left: button.offset().left}).*/slideToggle("slow"); button.css(button_active); options.onOpen(); }
	$.fn.spHide = function(){ $(this).slideUp(1000, function(){options.onClose();}); button.css(button_default); }
	
		
	/* Theme Loading
	---------------------------------------------------------------------*/
	switcherpane.find('a').click(function(){
		updateCSS( $(this).attr('href') );
		var themeName = $(this).find('span').text();
		button.find('.jquery-ui-themeswitcher-title').text( options.buttonPreText + themeName );
		$.cookie(options.cookieName, themeName);
		options.onSelect();
		if(options.closeOnSelect && switcherpane.is(':visible')){ switcherpane.spHide(); }
		return false;
	});
	
	//function to append a new theme stylesheet with the new style changes
	function updateCSS(locStr){
		var cssLink = $('<link href="'+locStr+'" type="text/css" rel="Stylesheet" class="ui-theme" />');
		$("head").append(cssLink);
		
		
		if( $("link.ui-theme").size() > 3){
			$("link.ui-theme:first").remove();
		}	
	}	
	
	/* Inline CSS 
	---------------------------------------------------------------------*/
	var button_default = {
		fontFamily: 'Trebuchet MS, Verdana, sans-serif',
		fontSize: '11px',
		color: '#666',
		background: '#eee url(css/themes/images/buttonbg.png) 50% 50% repeat-x',
		border: '1px solid #ccc',
		'-moz-border-radius': '6px',
		'-webkit-border-radius': '6px',
		textDecoration: 'none',
		padding: '3px 3px 3px 8px',
		width: options.width - 11,//minus must match left and right padding 
		display: 'block',
		height: options.buttonHeight,
		outline: '0'
	};
	var button_hover = {
		'borderColor':'#bbb',
		'background': '#f0f0f0',
		cursor: 'pointer',
		color: '#444'
	};
	var button_active = {
		color: '#aaa',
		background: '#000',
		border: '1px solid #ccc',
		borderBottom: 0,
		'-moz-border-radius-bottomleft': 0,
		'-webkit-border-bottom-left-radius': 0,
		'-moz-border-radius-bottomright': 0,
		'-webkit-border-bottom-right-radius': 0,
		outline: '0'
	};
	
	
	
	//button css
	button.css(button_default)
	.hover(
		function(){ 
			$(this).css(button_hover); 
		},
		function(){ 
		 if( !switcherpane.is(':animated') && switcherpane.is(':hidden') ){	$(this).css(button_default);  }
		}	
	)
	.find('.jquery-ui-themeswitcher-icon').css({
		float: 'right',
		width: '16px',
		height: '16px',
		background: 'url(css/themes/images/icon_color_arrow.gif) 50% 50% no-repeat'
	});	
	//pane css
	switcherpane.css({
		position: 'absolute',
		//float: 'left',
		fontFamily: 'Trebuchet MS, Verdana, sans-serif',
		fontSize: '12px',
		background: '#000',
		color: '#fff',
		padding: '8px 3px 3px',
		border: '1px solid #ccc',
		'-moz-border-radius-bottomleft': '6px',
		'-webkit-border-bottom-left-radius': '6px',
		'-moz-border-radius-bottomright': '6px',
		'-webkit-border-bottom-right-radius': '6px',
		//borderTop: 0,
		zIndex: 999999,
        left: '0',
        //bottom: '0',
        width: options.width - 6,//minus must match left and right padding,

        height:150, 
        
        position:'absolute',
        bottom: 0

	})
	.find('ul').css({
		listStyle: 'none',
		margin: '0',
		padding: '0',
		overflow: 'auto',
		height: options.height
	}).end()
	.find('li').hover(
		function(){ 
			$(this).css({
				'borderColor':'#555',
				'background': 'url(css/themes/images/menuhoverbg.png) 50% 50% repeat-x',
				cursor: 'pointer'
			}); 
		},
		function(){ 
			$(this).css({
				'borderColor':'#111',
				'background': '#000',
				cursor: 'auto'
			}); 
		}
	).css({
		width: options.width-30,
		height: '',
		padding: '2px',
		margin: '1px',
		border: '1px solid #111',
		'-moz-border-radius': '4px',
		clear: 'left',
		float: 'left'
	}).end()
	.find('a').css({
		color: '#aaa',
		textDecoration: 'none',
		float: 'left',
		width: '100%',
		outline: '0'
	}).end()
	.find('img').css({
		float: 'left',
		border: '1px solid #333',
		margin: '0 2px'
	}).end()
	.find('.themeName').css({
		float: 'left',
		margin: '3px 0'
	}).end();
	


	$(this).append(button);
	$('#tsDiv').append(switcherpane);
	switcherpane.hide();
	if( $.cookie(options.cookieName) || options.loadTheme ){
		var themeName = $.cookie(options.cookieName) || options.loadTheme;
		switcherpane.find('a:contains('+ themeName +')').trigger('click');
	}

	return this;
};




/**
 * Cookie plugin
 *
 * Copyright (c) 2006 Klaus Hartl (stilbuero.de)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 */
jQuery.cookie = function(name, value, options) {
    if (typeof value != 'undefined') { // name and value given, set cookie
        options = options || {};
        if (value === null) {
            value = '';
            options.expires = -1;
        }
        var expires = '';
        if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
            var date;
            if (typeof options.expires == 'number') {
                date = new Date();
                date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
            } else {
                date = options.expires;
            }
            expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
        }
        // CAUTION: Needed to parenthesize options.path and options.domain
        // in the following expressions, otherwise they evaluate to undefined
        // in the packed version for some reason...
        var path = options.path ? '; path=' + (options.path) : '';
        var domain = options.domain ? '; domain=' + (options.domain) : '';
        var secure = options.secure ? '; secure' : '';
        document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
    } else { // only name given, get cookie
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
};
