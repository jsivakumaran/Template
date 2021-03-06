'use strict';

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*!
 * form
 * https://github.com/Voliware/Template
 * Licensed under the MIT license.
 */

/**
 * Templates, serializes, and submits forms
 * @extends Template
 */
var Form = function (_Template) {
	_inherits(Form, _Template);

	/**
  * Constructor
  * @param {object} [options]
  * @param {boolean} [options.feedback=true] - whether to show feedback during submissions
  * @param {string} [options.submitUrl] - the submitUrl or path to submit the form to
  * @param {function} [options.submitRequest=null] - if set, ignores submitUrl and uses this function to submit data
  * @param {number} [options.serializeMode=0] - the mode in which to serialize data
  * @param {number} [options.checkboxMode=0] - the mode in which to serialize checkboxes
  * @param {object} [options.validator] - validator setttings
  * @param {string} [options.validator.api] - the validator api to use
  * @param {object} [options.validator.options] - the validator options
  * @param {object} [options.struct] - the template struct to build the form from, if using a template
  * @param {string} [options.struct.$wrapper='form'] - the form element
  * @param {string} [options.struct.$header='.form-header'] - the header selector
  * @param {string} [options.struct.$body='.form-body'] - the body selector
  * @param {string} [options.struct.$footer='.form-footer'] - the footer selector
  * @param {string} [options.struct.$cancel='.form-cancel'] - the cancel button selector
  * @param {string} [options.struct.$submit='button[type="submit"]'] - the submit button selector
  * @returns {Form}
  */
	function Form(options) {
		var _ret;

		_classCallCheck(this, Form);

		var defaults = {
			feedback: true,
			useTemplate: true,
			submitUrl: "",
			submitRequest: null,
			serializeMode: FormSerializer.serializeMode.toString,
			checkboxMode: FormSerializer.checkboxMode.number,
			// jquery elements for each table components
			struct: {
				$wrapper: 'form',
				$header: '.form-header',
				$body: '.form-body',
				$footer: '.form-footer',
				$cancel: '.form-cancel',
				$submit: 'button[type="submit"]'
			},
			validator: null
		};

		var _this = _possibleConstructorReturn(this, (Form.__proto__ || Object.getPrototypeOf(Form)).call(this, $Util.opts(defaults, options)));

		var self = _this;

		// store serialized data
		_this._serializedData = {};

		// alias
		// this alias just happens to be integral
		// to Wizard, which inherits Form, but
		// overrides $wrapper and thus loses a <form> ref
		_this.$form = _this.$wrapper;

		// components
		_this.formSerializer = new FormSerializer({
			serializeMode: _this.settings.serializeMode,
			checkboxMode: _this.settings.checkboxMode
		});
		_this.validator = null;
		_this.feedback = null;

		// default submit handler
		_this.$wrapper.on('submit', function (e) {
			e.preventDefault();
			self.serializer()._submit();
		});

		// set up validator
		if (_this.settings.validator) _this._setupValidator();

		// set up feedback
		if (_this.settings.feedback) _this._setupFeedback();

		return _ret = _this, _possibleConstructorReturn(_this, _ret);
	}

	/**
  * Default form template
  * @returns {Form}
  * @private
  */


	_createClass(Form, [{
		key: '_useDefaultTemplate',
		value: function _useDefaultTemplate() {
			var template = '<form class="form">' + '<div class="form-header"></div>' + '<div class="form-body"></div>' + '<div class="form-footer">' + '<button type="submit" class="form-submit">Submit</button>' + '<button type="button" class="form-cancel">Cancel</button>' + '</div>' + '</form>';

			this._useTemplate($(template));

			return this;
		}

		/**
   * Attaches a validator to the form
   * @returns {Form}
   * @private
   */

	}, {
		key: '_setupValidator',
		value: function _setupValidator() {
			var v = this.settings.validator;

			switch (v.api) {
				case 'formValidation':
					Form.validators.formValidation.setup(this, v.options);
					break;
			}
			return this;
		}

		/**
   * Setup the feedback
   * @returns {Form}
   * @private
   */

	}, {
		key: '_setupFeedback',
		value: function _setupFeedback() {
			this.feedback = new Feedback();
			this.feedback.$wrapper.prependTo(this.$body);
			return this;
		}

		/**
   * Submits the form
   * @returns {jQuery}
   * @private
   */

	}, {
		key: '_submit',
		value: function _submit() {
			var self = this;

			this.trigger('beforeSubmit');

			if (this.feedback) this.feedback.setFeedback('processing', 'Processing...');

			return this._doSubmit().done(function () {
				self._onDone();
			}).fail(function () {
				self._onFail();
			}).always(function () {
				self._onAlways();
			});
		}

		/**
   * Actual submit function
   * @returns {jQuery}
   * @private
   */

	}, {
		key: '_doSubmit',
		value: function _doSubmit() {
			var s = this.settings;

			if (s.submitRequest) return s.submitRequest(this._serializedData);else return $.post(s.submitUrl, this._serializedData);
		}

		/**
   * Form submission success handler
   * @returns {Form}
   * @private
   */

	}, {
		key: '_onDone',
		value: function _onDone() {
			this.trigger('done');
			if (this.feedback) this.feedback.setFeedback('success', ' Operation was successful');
			return this;
		}

		/**
   * Form submission fail handler
   * @returns {Form}
   * @private
   */

	}, {
		key: '_onFail',
		value: function _onFail() {
			this.trigger('fail');
			if (this.feedback) this.feedback.setFeedback('danger', 'Operation has failed');
			return this;
		}

		/**
   * Form submission always handler
   * @returns {Form}
   * @private
   */

	}, {
		key: '_onAlways',
		value: function _onAlways() {
			this.trigger('always');
			return this;
		}

		/**
   * Populate form fields
   * @param {object} data - collection of properties whos
   * key match an input or select name, and
   * whos value is appropriate for that field
   * @returns {Form}
   */

	}, {
		key: 'populate',
		value: function populate(data) {
			this.$wrapper.populateChildren(data);
			return this;
		}

		/**
   * Serialize the form
   * @returns {Form}
   */

	}, {
		key: 'serializer',
		value: function serializer() {
			this._serializedData = this.formSerializer.serialize(this.$wrapper);
			return this;
		}
	}]);

	return Form;
}(Template);

Form.validators = {

	/**
  * formValidation api
  */
	formValidation: {
		api: 'formValidation',
		options: {
			framework: 'bootstrap',
			excluded: [':disabled', ':hidden', ':not(:visible)'],
			icon: {
				valid: 'glyphicon glyphicon-ok',
				invalid: 'glyphicon glyphicon-remove',
				validating: 'glyphicon glyphicon-refresh'
			}
		},

		/**
   * formValidation setup
   * @param {Form} form
   * @param {object} options
   */
		setup: function setup(form, options) {
			form.$wrapper.off('submit');
			form.$wrapper.formValidation(options).on('success.form.fv', function (e) {
				e.preventDefault();
				form.serializer()._submit();
			});
			form.validator = form.$wrapper.data('formValidation');
		}
	}
};
/*!
 * formSerializer
 * https://github.com/Voliware/Template
 * Licensed under the MIT license.
 */

/**
 * Serializes a form
 */

var FormSerializer = function () {

	/**
  * Construtor
  * @param {object} [options]
  * @param {number} [options.checkboxMode=0] - the mode in which to serialize checkboxes
  * @param {number} [options.mode=0] - the mode in which to serialize data
  * mode in which to serialize checkboxes
  * @returns {FormSerializer}
  */
	function FormSerializer(options) {
		_classCallCheck(this, FormSerializer);

		var defaults = {
			checkboxMode: FormSerializer.checkboxMode.number,
			serializeMode: FormSerializer.serializeMode.toString
		};
		this.settings = $Util.opts(defaults, options);

		return this;
	}

	/**
  * Get either the [name]
  * or [data-name] attr of an element
  * @param {jQuery} $el
  * @returns {string}
  * @private
  */


	_createClass(FormSerializer, [{
		key: '_getElName',
		value: function _getElName($el) {
			if (typeof $el.attr('name') !== "undefined") return $el.attr('name');
			if (typeof $el.data('name') !== "undefined") return $el.data('name');

			console.error("FormSerializer._getElName: field has no name or data-name attribute");
			return '';
		}

		/**
   * Convert a checkbox
   * @param {jQuery} $checkbox
   * @param {number} mode
   * @returns {boolean|number|string}
   * @private
   */

	}, {
		key: '_convertCheckbox',
		value: function _convertCheckbox($checkbox, mode) {
			var checked = $checkbox.is(':checked');
			switch (mode) {
				case FormSerializer.checkboxMode.boolean:
					return checked;
					break;
				case FormSerializer.checkboxMode.number:
					return checked ? 1 : 0;
					break;
				case FormSerializer.checkboxMode.string:
					return checked ? '1' : '0';
					break;
				case FormSerializer.checkboxMode.onOff:
					return checked ? 'on' : 'off';
					break;
			}
		}

		/**
   * Serialize a form
   * @param {jQuery} $form
   * @returns {object|string}
   */

	}, {
		key: 'serialize',
		value: function serialize($form) {
			var self = this;
			var formData = new FormSerializerData();
			var data = {};

			$form.find('input, select').each(function (i, e) {
				var $el = $(e);
				var name = "";
				var order = -1;
				var type = "";
				var tag = "";
				var val = "";

				if ($el.data('serialize') === false) return true;

				// get the tag (input or select)
				tag = $el[0].nodeName.toLowerCase();

				// find the name
				name = self._getElName($el);
				if (typeof name === 'undefined') return true;

				// see if it needs to be serialized in some order
				if (typeof $el.data('order') !== "undefined") order = $el.data('order');

				// handle <input>s
				if (tag === 'input') {
					type = $el.attr('type');
					if (typeof type === 'undefined') return console.error("FormSerializer.serialize: input" + name + " must have a type");

					switch (type) {
						case 'checkbox':
							val = self._convertCheckbox($el, this.settings.checkboxMode);
							break;
						case 'file':
							var files = $el.get(0).files;
							if (files.length === 0) {
								return true;
							}
							val = files[0];
							break;
						default:
							val = $el.val();
							break;
					}
				}
				// handle <select>s
				else if (tag === 'select') {
						val = $el.val();
					} else {
						console.error('FormSerializer.serialize: only inputs and selects can be serialized');
					}

				data[name] = {
					val: val,
					order: order
				};
			});

			formData.set(data);

			switch (this.settings.serializeMode) {
				default:
				case FormSerializer.serializeMode.toString:
					return formData.toString();
					break;
				case FormSerializer.serializeMode.toOrderedString:
					return formData.toOrderedString();
					break;
				case FormSerializer.serializeMode.toObject:
					return formData.toObject();
					break;
			}
		}
	}]);

	return FormSerializer;
}();

/**
 * Mode in which to convert checkboxes
 */


FormSerializer.checkboxMode = {
	boolean: 0,
	number: 1,
	string: 2,
	onOff: 3
};

/**
 * Mode in which to serialize data
 */
FormSerializer.serializeMode = {
	toString: 0,
	toOrderedString: 1,
	toObject: 2
};
/*!
 * formSerializerData
 * https://github.com/Voliware/Template
 * Licensed under the MIT license.
 */

/**
 * An object that holds form data
 * and can output it in different ways
 */

var FormSerializerData = function () {

	/**
  * Constructor
  * @param {object} [data={}]
  * @returns {FormSerializerData}
  */
	function FormSerializerData(data) {
		_classCallCheck(this, FormSerializerData);

		this.data = data || {};
		return this;
	}

	/**
  * Set the data
  * @param {object} data
  * @returns {FormSerializerData}
  */


	_createClass(FormSerializerData, [{
		key: 'set',
		value: function set(data) {
			this.data = data;
			return this;
		}

		/**
   * Convert the data to a serialized string
   * @returns {string}
   */

	}, {
		key: 'toString',
		value: function toString() {
			var data = "";
			var c = 0;
			var len = Object.keys(this.data).length;
			Util.each(this.data, function (i, e) {
				data += i + "=" + e.val;
				if (c++ < len - 1) data += "&";
			});
			return data;
		}

		/**
   * Convert the data to an
   * ordered serialized string
   * @returns {string}
   */

	}, {
		key: 'toOrderedString',
		value: function toOrderedString() {
			var data = "";
			var ordered = [];
			var unordered = [];
			Util.each(this.data, function (i, e) {
				var obj = {
					name: i,
					val: e.val
				};
				if (e.order > -1) ordered[e.order] = obj;else unordered.push(obj);
			});

			var len = ordered.length;
			for (var i = 0; i < len; i++) {
				data += ordered[i].name + '=' + ordered[i].val;
				if (i < len) data += "&";
			}

			len = unordered.length;
			for (i = 0; i < len; i++) {
				data += unordered[i].name + '=' + unordered[i].val;
				if (i < len - 1) data += "&";
			}

			return data;
		}

		/**
   * Convert the data to an object
   * @returns {object}
   */

	}, {
		key: 'toObject',
		value: function toObject() {
			var data = {};
			Util.each(this.data, function (i, e) {
				// convert string numbers to real numbers
				data[i] = isNaN(e.val) ? e.val : parseInt(e.val);
			});
			return data;
		}
	}]);

	return FormSerializerData;
}();
/*!
 * wizard
 * https://github.com/Voliware/Template
 * Licensed under the MIT license.
 */

/**
 * Templates, serializes, submits,
 * and controls a form wizard
 * @extends Form
 */


var Wizard = function (_Form) {
	_inherits(Wizard, _Form);

	/**
  * Constructor
  * @param  {object} [options]
  * @param  {object} [options.struct]
  * @param  {string} [options.struct.$wrapper='.wizard'] - wizard wrapper
  * @param  {string} [options.struct.$navs='ul.nav > li'] - navigation list
  * @param  {string} [options.struct.$tabs='.tab-pane'] - tab container
  * @param  {string} [options.struct.$next='li.next'] - next button
  * @param  {string} [options.struct.$pager='ul.pager'] - pager container
  * @param  {string} [options.struct.$previous='li.previous'] - previous button
  * @returns {Wizard}
  */
	function Wizard(options) {
		var _ret2;

		_classCallCheck(this, Wizard);

		var defaults = {
			struct: {
				$wrapper: '.wizard',
				$navs: 'ul.nav > li',
				$tabs: '.tab-pane',
				$next: 'li.next',
				$pager: 'ul.pager',
				$previous: 'li.previous'
			}
		};

		var _this2 = _possibleConstructorReturn(this, (Wizard.__proto__ || Object.getPrototypeOf(Wizard)).call(this, $Util.opts(defaults, options)));

		_this2.stepCount = _this2.$tabs.length;
		_this2.step = 0;

		// show or hide pagination and form buttons
		_this2.toggleSubmitButton(_this2.stepCount === 1);
		_this2.togglePreviousButton(false);
		_this2.toggleNextButton(_this2.stepCount > 1);

		_this2._setHandlers();

		return _ret2 = _this2, _possibleConstructorReturn(_this2, _ret2);
	}

	/**
  * Set pagination and form button handlers
  * @returns {Wizard}
  * @private
  */


	_createClass(Wizard, [{
		key: '_setHandlers',
		value: function _setHandlers() {
			var self = this;
			// next
			this.$next.click(function () {
				self._getNextNav().find('a').click();
				self.validatePreviousTab();
			});
			// prev
			this.$previous.click(function () {
				self._getPreviousNav().find('a').click();
				self.validateNextTab();
			});
			// submit
			this.$submit.click(function () {
				self.validateAllTabs();
			});
			// navs
			this.$navs.each(function (i, e) {
				$(e).click(function () {
					self._setPagination(i);
					var x = i;
					// nav clicked is ahead
					if (i > self.step) {
						for (x; x > 0; x--) {
							self.validateTab(self._getTab(x));
						}
					}
					// nav clicked is behind
					else if (i < self.step) {
							for (x; x < self.step + 1; x++) {
								self.validateTab(self._getTab(x));
							}
						}
					self.step = i;
				});
			});
			return this;
		}

		/**
   * Create an empty wizard
   * @returns {Wizard}
   * @private
   */

	}, {
		key: '_useDefaultTemplate',
		value: function _useDefaultTemplate() {
			_get(Wizard.prototype.__proto__ || Object.getPrototypeOf(Wizard.prototype), '_useDefaultTemplate', this).call(this);

			// to avoid duplicate $wrapper's (Wizard inherits Form)
			// set this.$form to Form's $wrapper
			this.$form = this.$wrapper;

			// components
			this.$wrapper = $('<div class="wizard"></div>');
			this.$navs = $('<ul class="nav"></ul>');
			this.$tabs = $('<div class="tab-pane"></div>');
			this.$pager = $('<ul class="pager"></ul>');
			this.$next = $('<li class="next"><a href="#">Next</a></li>');
			this.$previous = $('<li class="previous"><a href="#">Previous</a></li>');

			// build
			this.$pager.append(this.$previous, this.$next, this.$submit);
			this.$footer.append(this.$pager);
			this.$form.append(this.$tabs, this.$footer);
			this.$wrapper.append(this.$navs, this.$form);

			return this;
		}

		/**
   * Attaches a validator to the form
   * @returns {Form}
   * @private
   */

	}, {
		key: '_validatorFactory',
		value: function _validatorFactory() {
			var v = this.settings.validator;
			switch (v.api) {
				case 'formValidation':
					Wizard.validators.formValidation.setup(this, v.options);
					break;
			}
			return _get(Wizard.prototype.__proto__ || Object.getPrototypeOf(Wizard.prototype), '_validatorFactory', this).call(this);
		}

		// control

		/**
   * Show or hide pagination 
   * buttons according to step
   * @param {number} step - the step 
   * @private
   */

	}, {
		key: '_setPagination',
		value: function _setPagination(step) {
			// simply hide everything first
			this.togglePreviousButton(false);
			this.toggleNextButton(false);
			this.toggleSubmitButton(false);

			switch (step) {
				// first step
				case 0:
					this.togglePreviousButton(false);
					if (this.stepCount === 1) this.toggleSubmitButton();else if (this.stepCount > 1) this.toggleNextButton();
					break;
				// last step
				case this.stepCount - 1:
					this.toggleSubmitButton();
					if (this.stepCount > 1) this.togglePreviousButton();
					break;
				// inbetween steps
				default:
					if (this.stepCount > 1) {
						this.toggleNextButton();
						this.togglePreviousButton();
					}
					break;
			}
		}

		// navs

		/**
   * Get a nav element by index
   * @param {number} index
   * @returns {jQuery}
   * @private
   */

	}, {
		key: '_getNav',
		value: function _getNav(index) {
			return $(this.$navs.get(index));
		}

		/**
   * Get a nav from a tab element
   * @param {jQuery} $tab
   * @returns {jQuery}
   * @private
   */

	}, {
		key: '_getNavFromTab',
		value: function _getNavFromTab($tab) {
			var index = this.$tabs.index($tab);
			return this._getNav(index);
		}

		/**
   * Get the previous nav
   * @returns {jQuery}
   * @private
   */

	}, {
		key: '_getPreviousNav',
		value: function _getPreviousNav() {
			return $(this.$navs.get(this.step - 1));
		}

		/**
   * Get the current nav
   * @returns {jQuery}
   * @private
   */

	}, {
		key: '_getCurrentNav',
		value: function _getCurrentNav() {
			return $(this.$navs.get(this.step));
		}

		/**
   * Get the next nav
   * @returns {jQuery}
   * @private
   */

	}, {
		key: '_getNextNav',
		value: function _getNextNav() {
			return $(this.$navs.get(this.step + 1));
		}

		/**
   * Toggle a nav as invalid
   * @param {jQuery} $nav
   * @param {boolean} state
   * @returns {Wizard}
   * @private
   */

	}, {
		key: '_toggleNavInvalid',
		value: function _toggleNavInvalid($nav) {
			var state = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

			$nav.toggleClass('wizard-tab invalid', state);
			return this;
		}

		// tabs

		/**
   * Get a tab based on index
   * @param {jQuery} index
   * @returns {jQuery}
   * @private
   */

	}, {
		key: '_getTab',
		value: function _getTab(index) {
			return $(this.$tabs.get(index));
		}

		/**
   * Get the current tab
   * @returns {jQuery}
   * @private
   */

	}, {
		key: '_getCurrentTab',
		value: function _getCurrentTab() {
			return $(this.$tabs.get(this.step));
		}

		/**
   * Get the next tab
   * @returns {jQuery|null}
   * @private
   */

	}, {
		key: '_getNextTab',
		value: function _getNextTab() {
			return this.step !== this.stepCount ? $(this.$tabs.get(this.step + 1)) : null;
		}

		/**
   * Get the previous tab
   * @returns {jQuery|null}
   * @private
   */

	}, {
		key: '_getPreviousTab',
		value: function _getPreviousTab() {
			return this.step > 0 ? $(this.$tabs.get(this.step - 1)) : null;
		}

		/**
   * Validate a tab
   * @param {jQuery} $tab
   * @returns {boolean}
   */

	}, {
		key: 'validateTab',
		value: function validateTab($tab) {
			var api = this.settings.validator.api;
			var valid = true;
			if (api === 'formValidation') {
				this.validator.validateContainer($tab);
				valid = this.validator.isValidContainer($tab);
			} else {
				console.log("Wizard.validateTab: no support for api: " + api);
			}
			var $nav = this._getNavFromTab($tab);
			this._toggleNavInvalid($nav, !valid);
			return valid;
		}

		/**
   * Validate the current tab
   * @returns {boolean}
   */

	}, {
		key: 'validateCurrentTab',
		value: function validateCurrentTab() {
			var $tab = this._getCurrentTab();
			return this.validateTab($tab);
		}

		/**
   * Validate the previous tab
   * @returns {boolean}
   */

	}, {
		key: 'validatePreviousTab',
		value: function validatePreviousTab() {
			var $tab = this._getPreviousTab();
			return this.validateTab($tab);
		}

		/**
   * Validate the next tab
   * @returns {boolean}
   */

	}, {
		key: 'validateNextTab',
		value: function validateNextTab() {
			var $tab = this._getNextTab();
			return this.validateTab($tab);
		}

		/**
   * Validate all tabs
   * @returns {boolean}
   */

	}, {
		key: 'validateAllTabs',
		value: function validateAllTabs() {
			var self = this;
			var valid = true;
			$.each(this.tabs, function (i, e) {
				var $tab = $(e);
				self.validator.validateContainer($tab);
				valid = self.validator.isValidContainer($tab);
				self._toggleNavInvalid(self._getNav(i), !valid);
			});
			return valid;
		}

		// buttons

		/**
   * Toggle the next button
   * @param {boolean} state
   * @returns {Wizard}
   */

	}, {
		key: 'toggleNextButton',
		value: function toggleNextButton() {
			var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

			this.$next.toggle(state);
			return this;
		}

		/**
   * Toggle the previous button
   * @param {boolean} state
   * @returns {Wizard}
   */

	}, {
		key: 'togglePreviousButton',
		value: function togglePreviousButton() {
			var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

			this.$previous.toggle(state);
			return this;
		}

		/**
   * Toggle the submit button
   * @param {boolean} state
   * @returns {Wizard}
   */

	}, {
		key: 'toggleSubmitButton',
		value: function toggleSubmitButton() {
			var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

			this.$submit.toggle(state);
			return this;
		}
	}]);

	return Wizard;
}(Form);

// must validate hidden tabs 


Wizard.validators.formValidation.options.excluded = [':disabled'];