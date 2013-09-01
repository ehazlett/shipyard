$(function() {
    $("a[rel=tooltip]").tooltip();
});
function flash(text, status){
  var msg = $("<div class='alert'></div>");
  msg.addClass('alert-'+status);
  msg.append("<a class='close' href='#' data-dismiss='alert'>x</a>");
  msg.append('<p>'+text+'</p>');
  $("#messages").append(msg);
  $("#messages").removeClass('hide');
  $(".alert").alert();
  $(".alert").delay(5000).fadeOut();
}

function redirect(url) {
    window.location.href = url;
    return false;
}

jQuery.fn.serializeObject = function() {
  var arrayData, objectData;
  arrayData = this.serializeArray();
  objectData = {};
  $.each(arrayData, function() {
    var value;
    if (this.value != null) {
      value = this.value;
    } else {
      value = '';
    }
    if (objectData[this.name] != null) {
      if (!objectData[this.name].push) {
        objectData[this.name] = [objectData[this.name]];
      }
      objectData[this.name].push(value);
    } else {
      objectData[this.name] = value;
    }
  });
  return objectData;
};

