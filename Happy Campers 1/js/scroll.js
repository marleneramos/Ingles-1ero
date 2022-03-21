function matrixToArray(str){
    return str.split('(')[1].split(')')[0].split(',');
};

function getCurrentHeightOf($scroll){
    return $scroll.outerHeight();
}

function hasRoomToScrollUp($scroll){
    if(getTransformYOf($scroll) === 0 || getTransformYOf($scroll) > 0){
        return false;
    }
    else{
        return true;
    }
}
function hasRoomToScrollDown($scroll, $scroll_pane){
    if(Math.abs(getTransformYOf($scroll)) >= $scroll.height()-$scroll_pane.height()){
        
        //swings back
        $scroll.transition({
            y:($scroll.height() - $scroll_pane.height())*-1
        });
        
        return false;
    }
    else{
        return true;
    }
}

function getTransformYOf($scroll){
    
    var _css_name;
    
    if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
        _css_name = '-moz-transform';
    } else if (navigator.userAgent.toLowerCase().indexOf('chrome') > -1 || navigator.userAgent.toLowerCase().indexOf('safari') > -1) {
        _css_name = '-webkit-transform';
        
    } else {
        _css_name = 'transform';
    }
    
    if($scroll.css(_css_name) === 'none'){
        return 0;
    }
    else{
        var array = matrixToArray($scroll.css(_css_name));
        return parseInt(array[5]);
    }
}

function updateScrollEventOf($row){

    var $scroll = $row.parents('.scroll');
    var $scroll_pane = $scroll.parents('.scroll-pane');
    var $uparrow = $scroll_pane.parent().find('.pages-tab-scrolltop');
    var $downarrow = $scroll_pane.parent().find('.pages-tab-scrollbottom');
    var $li = $row.parents('li');
    
    var start = ($('#pages').length)?0:getTransformYOf($scroll);
    
    $uparrow.unbind();
    $downarrow.unbind();
    
    if($li.hasClass('shown')){
        //var window = $li.position().top+$li.height();
        $scroll.transition({
            y: start + $li.position().top*-1
        },function(){
//            var none = hasRoomToScrollDown($scroll, $scroll_pane);
        });
    }
    
    if(hasRoomToScrollUp($scroll)){
        $uparrow.bind('mouseup', function() {
            scrollUpDown('up', $uparrow);
        });
    }
    if(hasRoomToScrollDown($scroll, $scroll_pane)){
        $downarrow.bind('mouseup', function() {
            scrollUpDown('down', $downarrow);
        });
    }
    
}

function getNextScrollAmount($scroll, $scroll_pane, direction){
    
    var _int = 100;
    if(direction === 'up'){
        if( Math.abs(getTransformYOf($scroll)) <= _int ){
            return 0;
        }
        else{
            return parseInt(getTransformYOf($scroll)) + _int;
        }
    }
    else{
        
        //why do i need _int*2 subtracted from the current val??
        var _b = $scroll_pane.height() - parseInt(Math.abs(getTransformYOf($scroll)));
        //console.log(_b);
        //has less than the interval left for scroll to move
        if( _b < _int*2 ){
            //console.log('not enough');
            return ($scroll.height() - $scroll_pane.height())*-1;
        }
        else{
            //console.log('regular');
            return parseInt(getTransformYOf($scroll)) + _int*-1;
        }
        
    }
}

function scrollUpDown(direction, $this) {
    
    var $uparrow = $this.parents('.pages-tabs-scroller').find('.pages-tab-scrolltop');
    var $downarrow = $this.parents('.pages-tabs-scroller').find('.pages-tab-scrollbottom');
    var $scroll_pane = $this.parents('.scrollcontent').find('.scroll-pane');
    var $scroll = $this.parents('.scrollcontent').find('.scroll');
    var _scroll_amount = getNextScrollAmount($scroll, $scroll_pane, direction);
    
    $uparrow.unbind();
    $downarrow.unbind();
    
    $scroll.transition({
        y:_scroll_amount
    },function(){
        
        //edge detect
        if(hasRoomToScrollUp($scroll)){
            $uparrow.bind('mouseup', function() {
                scrollUpDown('up', $this);
            });
        }
        if(hasRoomToScrollDown($scroll, $scroll_pane)){
            $downarrow.bind('mouseup', function() {
                scrollUpDown('down', $this);
            });
        }
    });

}