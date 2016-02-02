window.$ = window.jQuery = require('./jquery.js');
var spawn = require('child_process').spawn;
$(document).ready( function(){
  $('input:text, input[type="search"]').each(function(idx, input){
    $(input).bind('click',function(event){
      invokeOnScreen();
    });
    $(input).bind('focus',function(event){
      invokeOnScreen();
    });
    $(input).bind('blur',function(event){
      killOnScreen();
    });
  });
  $('form').each(function(idx, form){
    $(form).bind('submit',function(event){
      killOnScreen();
    });
  });
});
var invokeOnScreen = function(){
  spawn('onscreen',[]);
}
var killOnScreen = function(){
  spawn('kill_onscreen',[]);
}
