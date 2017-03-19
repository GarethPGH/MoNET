  $.fn.serializeObject = function() {
    var array = {};
    var context = this.serializeArray();
    $.each(context, function() {
      var thisValue = (this.value === "true") ? true : this.value;
      thisValue = (thisValue === "false") ? false : thisValue;
      if (array[this.name]) {
        if (!array[this.name].push) {
          array[this.name] = [array[this.name]];
        }
        array[this.name].push(thisValue || '');
      } else {
        array[this.name] = thisValue || '';
      }
    });
    return array;
  };
