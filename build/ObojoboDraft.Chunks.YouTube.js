/******/ ;(function(modules) {
	// webpackBootstrap
	/******/ // The module cache
	/******/ var installedModules = {} // The require function
	/******/
	/******/ /******/ function __webpack_require__(moduleId) {
		/******/
		/******/ // Check if module is in cache
		/******/ if (installedModules[moduleId]) {
			/******/ return installedModules[moduleId].exports
			/******/
		} // Create a new module (and put it into the cache)
		/******/ /******/ var module = (installedModules[moduleId] = {
			/******/ i: moduleId,
			/******/ l: false,
			/******/ exports: {}
			/******/
		}) // Execute the module function
		/******/
		/******/ /******/ modules[moduleId].call(
			module.exports,
			module,
			module.exports,
			__webpack_require__
		) // Flag the module as loaded
		/******/
		/******/ /******/ module.l = true // Return the exports of the module
		/******/
		/******/ /******/ return module.exports
		/******/
	} // expose the modules object (__webpack_modules__)
	/******/
	/******/
	/******/ /******/ __webpack_require__.m = modules // expose the module cache
	/******/
	/******/ /******/ __webpack_require__.c = installedModules // identity function for calling harmony imports with the correct context
	/******/
	/******/ /******/ __webpack_require__.i = function(value) {
		return value
	} // define getter function for harmony exports
	/******/
	/******/ /******/ __webpack_require__.d = function(exports, name, getter) {
		/******/ if (!__webpack_require__.o(exports, name)) {
			/******/ Object.defineProperty(exports, name, {
				/******/ configurable: false,
				/******/ enumerable: true,
				/******/ get: getter
				/******/
			})
			/******/
		}
		/******/
	} // getDefaultExport function for compatibility with non-harmony modules
	/******/
	/******/ /******/ __webpack_require__.n = function(module) {
		/******/ var getter =
			module && module.__esModule
				? /******/ function getDefault() {
						return module['default']
					}
				: /******/ function getModuleExports() {
						return module
					}
		/******/ __webpack_require__.d(getter, 'a', getter)
		/******/ return getter
		/******/
	} // Object.prototype.hasOwnProperty.call
	/******/
	/******/ /******/ __webpack_require__.o = function(object, property) {
		return Object.prototype.hasOwnProperty.call(object, property)
	} // __webpack_public_path__
	/******/
	/******/ /******/ __webpack_require__.p = 'build/' // Load entry module and return exports
	/******/
	/******/ /******/ return __webpack_require__((__webpack_require__.s = 174))
	/******/
})(
	/************************************************************************/
	/******/ {
		/***/ /***/ 0: function(module, exports) {
			module.exports = Common

			/***/
		},

		/***/ /***/ 152: function(module, exports) {
			// removed by extract-text-webpack-plugin
			/***/
		},

		/***/ /***/ 174: function(module, exports, __webpack_require__) {
			module.exports = __webpack_require__(39)

			/***/
		},

		/***/ /***/ 39: function(module, exports, __webpack_require__) {
			'use strict'

			var _Common = __webpack_require__(0)

			var _Common2 = _interopRequireDefault(_Common)

			var _adapter = __webpack_require__(79)

			var _adapter2 = _interopRequireDefault(_adapter)

			var _viewerComponent = __webpack_require__(80)

			var _viewerComponent2 = _interopRequireDefault(_viewerComponent)

			function _interopRequireDefault(obj) {
				return obj && obj.__esModule ? obj : { default: obj }
			}

			var SelectionHandler = _Common2.default.chunk.focusableChunk.FocusableSelectionHandler

			_Common2.default.Store.registerModel('ObojoboDraft.Chunks.YouTube', {
				type: 'chunk',
				adapter: _adapter2.default,
				componentClass: _viewerComponent2.default,
				selectionHandler: new SelectionHandler()
			})

			/***/
		},

		/***/ /***/ 79: function(module, exports, __webpack_require__) {
			'use strict'

			Object.defineProperty(exports, '__esModule', {
				value: true
			})
			var Adapter = {
				construct: function construct(model, attrs) {
					if (
						__guard__(attrs != null ? attrs.content : undefined, function(x) {
							return x.videoId
						}) != null
					) {
						model.modelState.videoId = attrs.content.videoId
					} else {
						model.modelState.videoId = null
					}
				},
				clone: function clone(model, _clone) {
					_clone.modelState.videoId = model.modelState.videoId
				},
				toJSON: function toJSON(model, json) {
					json.content.videoId = model.modelState.videoId
				},
				toText: function toText(model) {
					return 'https://www.youtube.com/watch?v=' + model.modelState.videoId
				}
			}

			exports.default = Adapter

			function __guard__(value, transform) {
				return typeof value !== 'undefined' && value !== null ? transform(value) : undefined
			}

			/***/
		},

		/***/ /***/ 80: function(module, exports, __webpack_require__) {
			'use strict'

			Object.defineProperty(exports, '__esModule', {
				value: true
			})

			var _createClass = (function() {
				function defineProperties(target, props) {
					for (var i = 0; i < props.length; i++) {
						var descriptor = props[i]
						descriptor.enumerable = descriptor.enumerable || false
						descriptor.configurable = true
						if ('value' in descriptor) descriptor.writable = true
						Object.defineProperty(target, descriptor.key, descriptor)
					}
				}
				return function(Constructor, protoProps, staticProps) {
					if (protoProps) defineProperties(Constructor.prototype, protoProps)
					if (staticProps) defineProperties(Constructor, staticProps)
					return Constructor
				}
			})()

			__webpack_require__(152)

			var _Common = __webpack_require__(0)

			var _Common2 = _interopRequireDefault(_Common)

			function _interopRequireDefault(obj) {
				return obj && obj.__esModule ? obj : { default: obj }
			}

			function _classCallCheck(instance, Constructor) {
				if (!(instance instanceof Constructor)) {
					throw new TypeError('Cannot call a class as a function')
				}
			}

			function _possibleConstructorReturn(self, call) {
				if (!self) {
					throw new ReferenceError("this hasn't been initialised - super() hasn't been called")
				}
				return call && (typeof call === 'object' || typeof call === 'function') ? call : self
			}

			function _inherits(subClass, superClass) {
				if (typeof superClass !== 'function' && superClass !== null) {
					throw new TypeError(
						'Super expression must either be null or a function, not ' + typeof superClass
					)
				}
				subClass.prototype = Object.create(superClass && superClass.prototype, {
					constructor: { value: subClass, enumerable: false, writable: true, configurable: true }
				})
				if (superClass)
					Object.setPrototypeOf
						? Object.setPrototypeOf(subClass, superClass)
						: (subClass.__proto__ = superClass)
			}

			var OboComponent = _Common2.default.components.OboComponent

			var YouTube = (function(_React$Component) {
				_inherits(YouTube, _React$Component)

				function YouTube() {
					_classCallCheck(this, YouTube)

					return _possibleConstructorReturn(
						this,
						(YouTube.__proto__ || Object.getPrototypeOf(YouTube)).apply(this, arguments)
					)
				}

				_createClass(YouTube, [
					{
						key: 'render',
						value: function render() {
							var data = this.props.model.modelState

							return React.createElement(
								OboComponent,
								{ model: this.props.model, moduleData: this.props.moduleData },
								React.createElement(
									'div',
									{ className: 'obojobo-draft--chunks--you-tube viewer' },
									React.createElement('iframe', {
										src: 'https://www.youtube.com/embed/' + data.videoId,
										frameBorder: '0',
										allowFullScreen: 'true'
									})
								)
							)
						}
					}
				])

				return YouTube
			})(React.Component)

			exports.default = YouTube

			/***/
		}

		/******/
	}
)
