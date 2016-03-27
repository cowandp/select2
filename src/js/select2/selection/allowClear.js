define([
  'jquery',
  '../keys'
], function ($, KEYS) {
  function AllowClear () { }

  AllowClear.prototype.bind = function (decorated, container, $container) {
    var self = this;

    decorated.call(this, container, $container);

    if (this.placeholder == null) {
      if (this.options.get('debug') && window.console && console.error) {
        console.error(
          'Select2: The `allowClear` option should be used in combination ' +
          'with the `placeholder` option.'
        );
      }
    }

    this.$selection.on('mousedown', '.select2-selection__clear',
      function (evt) {
        self._handleClear(evt);
    });

    container.on('keypress', function (evt) {
      self._handleKeyboardClear(evt, container);
    });
  };

  AllowClear.prototype._handleClear = function (_, evt) {
    // Ignore the event if it is disabled
    if (this.options.get('disabled')) {
      return;
    }

    var $clear = this.$selection.find('.select2-selection__clear');

    // Ignore the event if nothing has been selected
    if ($clear.length === 0) {
      return;
    }

    evt.stopPropagation();

    var data = $clear.data('data');

    for (var d = 0; d < data.length; d++) {
      var unselectData = {
        data: data[d]
      };

      // Trigger the `unselect` event, so people can prevent it from being
      // cleared.
      this.trigger('unselect', unselectData);

      // If the event was prevented, don't clear it out.
      if (unselectData.prevented) {
        return;
      }
    }

    this.$element.val(this.placeholder.id).trigger('change');

    this.trigger('toggle', {});
  };

  AllowClear.prototype._handleKeyboardClear = function (_, evt, container) {
    if (container.isOpen()) {
      return;
    }

    if (evt.which == KEYS.DELETE || evt.which == KEYS.BACKSPACE) {
      this._handleClear(evt);
      evt.preventDefault();
    }
  };

  AllowClear.prototype.update = function (decorated, data) {
    decorated.call(this, data);

    var self = this;

    if (this.$selection.find('.select2-selection__placeholder').length > 0 ||
        data.length === 0) {
      return;
    }

    var escapeMarkup = this.options.get('escapeMarkup');
    var clearLabel = this.options.get('translations').get("clearButtonLabel");
    var currentAriaLabel = this.$element.attr('aria-labelledby') || "";

    var $remove = $(
      '<span aria-labelledby="' + currentAriaLabel + ' select2-selection__clear-label" tabindex="0" role="button" class="select2-selection__clear">' +
        '&times;' + '<span id="select2-selection__clear-label" class="select2-hidden-accessible">' + escapeMarkup(clearLabel()) + '</span>' +
      '</span>'
    );
    $remove.data('data', data);

    this.$selection.find('.select2-selection__rendered').prepend($remove);

    $remove.on('keydown',
      function (evt) {
        if (evt.which === KEYS.ENTER || evt.which === KEYS.SPACE) {
          self._handleClear(evt);
          evt.preventDefault();
        }
      });

    $remove.on('blur', function(evt){
      self._handleBlur(evt);
    });

    $remove.on('focus', function(evt){
      self.trigger('focus', evt);
    });
  };

  return AllowClear;
});
