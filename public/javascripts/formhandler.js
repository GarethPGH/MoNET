  $.fn.serializeObject = function() {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
      var thisValue = (this.value === "true") ? true : this.value;
      thisValue = (thisValue === "false") ? false : thisValue;
      if (o[this.name]) {
        if (!o[this.name].push) {
          o[this.name] = [o[this.name]];
        }
        o[this.name].push(thisValue || '');
      } else {
        o[this.name] = thisValue || '';
      }
    });
    return o;
  };
