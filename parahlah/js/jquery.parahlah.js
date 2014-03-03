/* ------------------------------------------------
 *
 * jQuery parahlah v1.0.0
 * (roy@bocistudio.com)
 *
 * ------------------------------------------------
 * Requirements:
 * ------------------------------------------------
 *
 * - jQuery
 * - Modernizr (transforms + transforms3d)
 *
 * ------------------------------------------------
 * Usage:
 * ------------------------------------------------
 *
 * $('#el').parahlah();
 *
 * ------------------------------------------------
 */

(function($) {
  var defaults = {
    speed: 0.8,
    debug: false,
    scrollElement: null,
    autoHeight: true
  };
  $.fn.extend({
    parahlah: function(options){
      if(typeof Modernizr === 'undefined'){
        alert('jquery.parahlah.js: Modernizr 2D transforms and 3D transforms required');
        return;
      }
      
      if(typeof options === 'string'){
        if(!$(this).data('parahlah')) return;
        var
          result,
          args = Array.prototype.slice.call(arguments, 1);
        this.each(function(){
          var data = $(this).data('parahlah');
          if($.isFunction(data[options])){
            var r = data[options].apply(data, args);
            if(typeof result === 'undefined') result = r;
          }
        });
        
        return (typeof result === 'undefined') ? this : result;
      } else {
        this.each(function(){
          if($(this).data('parahlah')) return;
          options = $.extend({}, defaults, options);
          var i = new Parahlah(this, options);
          $(this).data('parahlah', i);
        });
        return this;
      }
    }
  });

  function Parahlah(el, options){
    var t = this;

    var $el, $target, scrollSpace, minY;

    function _initialize(){
      options = $.extend({}, defaults, options);
      $el = $(el);
      if(!$el.length){
        _log('Element didn\'t exist:', el);
        return;
      }

      $target = $($el.data('parahTarget') || $el.parent()).addClass('parahlah-target');
      if($el.data('parahSpeed'))
        options.speed = $el.data('parahSpeed');
      if(typeof $el.data('parahAutoHeight') !== 'undefined')
        options.autoHeight = $el.data('parahAutoHeight');

      if(!options.scrollElement)
        options.scrollElement = document;

      _updateTargetRelativeData();
      _doScroll();
      if(!$.parahlah.isiOS()){
        _bindEvents();
      }
    }

    function _updateTargetRelativeData(){
      if(options.autoHeight){
        scrollSpace = $target.height() * options.speed;

        var height = scrollSpace*2 + Math.max(scrollSpace, $target.height());
        $el.css({height: height});
      }

      minY = $target.offset().top - $(window).height();
    }

    function _doScroll(){
      var
        scrollTop = $(options.scrollElement).scrollTop(),
        windowHeight = (options.autoHeight) ? $(window).height() : 0;
      if(scrollTop >= minY){
        _translate(-((scrollTop - $target.offset().top + windowHeight) * options.speed));
      } else {
        _translate(0);
      }
    }

    function _bindEvents(){
      $target.on('parahlah-resize', _updateTargetRelativeData);

      $(options.scrollElement).on('scroll', _doScroll);

      $(window).on('resize', _doScroll);
    }

    function _unbindEvents(){
      $target.off('parahlah-resize', _updateTargetRelativeData);
      $(options.scrollElement).off('scroll', _doScroll);
      $(window).off('resize', _doScroll);
    }

    function _translate(to){
      return $.fn.css.apply($el, $.parahlah.translate(to));
    }

    function _log(obj){
      if(options.debug)
        console.log(obj);
    }

    _initialize();
  }

  $.parahlah = {
    isiOS: function(){
      return navigator.userAgent.match(/(iPad|iPhone|iPod)/g);
    },
    translate3d: function(to, axis){
      var unit = (typeof to === 'number') ? 'px' : '';
      return ['transform', 'translate3d(' + ((axis == 'x') ? to+unit+', 0' : '0, '+to+unit) + ', 0)']
    },
    translate2d: function(to, axis){
      var unit = (typeof to === 'number') ? 'px' : '';
      return ['transform', 'translate' + ((axis == 'x') ? 'X' : 'Y') + '('+to+unit+')']
    },
    translateMargin: function(to, axis){
      return ['margin-' + ((axis == 'x') ? 'left' : 'top'), to]
    },
    translate: function(to, axis){
      return (Modernizr.csstransforms3d) ?
        $.parahlah.translate3d(to, axis) :
        (Modernizr.csstransforms) ?
          $.parahlah.translate2d(to, axis) :
          $.parahlah.translateMargin(to, axis); // TODO: not sure if it's better to use top or margin-top
    }
  }
})(jQuery);