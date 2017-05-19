/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 28);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

var path = __webpack_require__(1);
var fs = __webpack_require__(0);
var assert = __webpack_require__(25);

// file.mkdirs
//
// Given a path to a directory, create it, and all the intermediate directories
// as well
// 
// @path: the path to create
// @mode: the file mode to create the directory with:
//    ex: file.mkdirs("/tmp/dir", 755, function () {})
// @callback: called when finished.
exports.mkdirs = function (_path, mode, callback) {
  _path = exports.path.abspath(_path);

  var dirs = _path.split(path.sep);
  var walker = [dirs.shift()];

  // walk
  // @ds:  A list of directory names
  // @acc: An accumulator of walked dirs
  // @m:   The mode
  // @cb:  The callback
  var walk = function (ds, acc, m, cb) {
    if (ds.length > 0) {
      var d = ds.shift();

      acc.push(d);
      var dir = acc.join(path.sep);

      // look for dir on the fs, if it doesn't exist then create it, and 
      // continue our walk, otherwise if it's a file, we have a name
      // collision, so exit.
      fs.stat(dir, function (err, stat) {
        // if the directory doesn't exist then create it
        if (err) {
          // 2 means it's wasn't there
          if (err.errno == 2 || err.errno == 34) {
            fs.mkdir(dir, m, function (erro) {
              if (erro && erro.errno != 17 && erro.errno != 34) {
                return cb(erro);
              } else {
                return walk(ds, acc, m, cb);
              }
            });
          } else {
            return cb(err);
          }
        } else {
          if (stat.isDirectory()) {
            return walk(ds, acc, m, cb);
          } else {
            return cb(new Error("Failed to mkdir " + dir + ": File exists\n"));
          }
        }
      });
    } else {
      return cb();
    }
  };
  return walk(dirs, walker, mode, callback);
};

// file.mkdirsSync
//
// Synchronus version of file.mkdirs
//
// Given a path to a directory, create it, and all the intermediate directories
// as well
// 
// @path: the path to create
// @mode: the file mode to create the directory with:
//    ex: file.mkdirs("/tmp/dir", 755, function () {})
exports.mkdirsSync = function (_path, mode) {
  if (_path[0] !== path.sep) {
    _path = path.join(process.cwd(), _path)
  }

  var dirs = _path.split(path.sep);
  var walker = [dirs.shift()];

  dirs.reduce(function (acc, d) {
    acc.push(d);
    var dir = acc.join(path.sep);
    
    try {
      var stat = fs.statSync(dir);
      if (!stat.isDirectory()) {
        throw "Failed to mkdir " + dir + ": File exists";
      }
    } catch (err) {
      fs.mkdirSync(dir, mode);
    }
    return acc;
  }, walker);
};

// file.walk
//
// Given a path to a directory, walk the fs below that directory
// 
// @start: the path to startat
// @callback: called for each new directory we enter
//    ex: file.walk("/tmp", function(error, path, dirs, name) {})
//
//    path is the current directory we're in
//    dirs is the list of directories below it
//    names is the list of files in it
//
exports.walk = function (start, callback) {
  fs.lstat(start, function (err, stat) {
    if (err) { return callback(err) }
    if (stat.isDirectory()) {

      fs.readdir(start, function (err, files) {
        var coll = files.reduce(function (acc, i) {
          var abspath = path.join(start, i);

          if (fs.statSync(abspath).isDirectory()) {
            exports.walk(abspath, callback);
            acc.dirs.push(abspath);
          } else {
            acc.names.push(abspath);
          }

          return acc;
        }, {"names": [], "dirs": []});

        return callback(null, start, coll.dirs, coll.names);
      });
    } else {
      return callback(new Error("path: " + start + " is not a directory"));
    }
  });
};

// file.walkSync
//
// Synchronus version of file.walk
//
// Given a path to a directory, walk the fs below that directory
// 
// @start: the path to startat
// @callback: called for each new directory we enter
//    ex: file.walk("/tmp", function(error, path, dirs, name) {})
//
//    path is the current directory we're in
//    dirs is the list of directories below it
//    names is the list of files in it
//
exports.walkSync = function (start, callback) {
  var stat = fs.statSync(start);

  if (stat.isDirectory()) {
    var filenames = fs.readdirSync(start);

    var coll = filenames.reduce(function (acc, name) {
      var abspath = path.join(start, name);

      if (fs.statSync(abspath).isDirectory()) {
        acc.dirs.push(name);
      } else {
        acc.names.push(name);
      }

      return acc;
    }, {"names": [], "dirs": []});

    callback(start, coll.dirs, coll.names);

    coll.dirs.forEach(function (d) {
      var abspath = path.join(start, d);
      exports.walkSync(abspath, callback);
    });

  } else {
    throw new Error("path: " + start + " is not a directory");
  }
};

exports.path = {};

exports.path.abspath = function (to) {
  var from;
  switch (to.charAt(0)) {
    case "~": from = process.env.HOME; to = to.substr(1); break
    case path.sep: from = ""; break
    default : from = process.cwd(); break
  }
  return path.join(from, to);
}

exports.path.relativePath = function (base, compare) {
  base = base.split(path.sep);
  compare = compare.split(path.sep);

  if (base[0] == "") {
    base.shift();
  }

  if (compare[0] == "") {
    compare.shift();
  }

  var l = compare.length;

  for (var i = 0; i < l; i++) {
    if (!base[i] || (base[i] != compare[i])) {
      return compare.slice(i).join(path.sep);
    }
  }

  return ""
};

exports.path.join = function (head, tail) {
  if (head == "") {
    return tail;
  } else {
    return path.join(head, tail);
  }
};



/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Iteration = __webpack_require__(4);

module.exports = ArrayIterator;
function ArrayIterator(iterable, start, stop, step) {
    this.array = iterable;
    this.start = start || 0;
    this.stop = stop || Infinity;
    this.step = step || 1;
}

ArrayIterator.prototype.next = function () {
    var iteration;
    if (this.start < Math.min(this.array.length, this.stop)) {
        iteration = new Iteration(this.array[this.start], false, this.start);
        this.start += this.step;
    } else {
        iteration =  new Iteration(undefined, true);
    }
    return iteration;
};



/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = Iteration;
function Iteration(value, done, index) {
    this.value = value;
    this.done = done;
    this.index = index;
}

Iteration.prototype.equals = function (other) {
    return (
        typeof other == 'object' &&
        other.value === this.value &&
        other.done === this.done &&
        other.index === this.index
    );
};



/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* vim:ts=4:sts=4:sw=4: */
/*!
 *
 * Copyright 2009-2013 Kris Kowal under the terms of the MIT
 * license found at http://github.com/kriskowal/q/raw/master/LICENSE
 *
 * With parts by Tyler Close
 * Copyright 2007-2009 Tyler Close under the terms of the MIT X license found
 * at http://www.opensource.org/licenses/mit-license.html
 * Forked at ref_send.js version: 2009-05-11
 *
 * With parts by Mark Miller
 * Copyright (C) 2011 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
/*global -WeakMap */


var hasStacks = false;
try {
    throw new Error();
} catch (e) {
    hasStacks = !!e.stack;
}

// All code after this point will be filtered from stack traces reported
// by Q.
var qStartingLine = captureLine();
var qFileName;

var WeakMap = __webpack_require__(23);
var iterate = __webpack_require__(13);
var asap = __webpack_require__(8);

function isObject(value) {
    return value === Object(value);
}

// long stack traces

var STACK_JUMP_SEPARATOR = "From previous event:";

function makeStackTraceLong(error, promise) {
    // If possible, transform the error stack trace by removing Node and Q
    // cruft, then concatenating with the stack trace of `promise`. See #57.
    if (hasStacks &&
        promise.stack &&
        typeof error === "object" &&
        error !== null &&
        error.stack &&
        error.stack.indexOf(STACK_JUMP_SEPARATOR) === -1
    ) {
        var stacks = [];
        for (var p = promise; !!p && handlers.get(p); p = handlers.get(p).became) {
            if (p.stack) {
                stacks.unshift(p.stack);
            }
        }
        stacks.unshift(error.stack);

        var concatedStacks = stacks.join("\n" + STACK_JUMP_SEPARATOR + "\n");
        error.stack = filterStackString(concatedStacks);
    }
}

function filterStackString(stackString) {
    if (Q.isIntrospective) {
        return stackString;
    }
    var lines = stackString.split("\n");
    var desiredLines = [];
    for (var i = 0; i < lines.length; ++i) {
        var line = lines[i];

        if (!isInternalFrame(line) && !isNodeFrame(line) && line) {
            desiredLines.push(line);
        }
    }
    return desiredLines.join("\n");
}

function isNodeFrame(stackLine) {
    return stackLine.indexOf("(module.js:") !== -1 ||
           stackLine.indexOf("(node.js:") !== -1;
}

function getFileNameAndLineNumber(stackLine) {
    // Named functions: "at functionName (filename:lineNumber:columnNumber)"
    // In IE10 function name can have spaces ("Anonymous function") O_o
    var attempt1 = /at .+ \((.+):(\d+):(?:\d+)\)$/.exec(stackLine);
    if (attempt1) {
        return [attempt1[1], Number(attempt1[2])];
    }

    // Anonymous functions: "at filename:lineNumber:columnNumber"
    var attempt2 = /at ([^ ]+):(\d+):(?:\d+)$/.exec(stackLine);
    if (attempt2) {
        return [attempt2[1], Number(attempt2[2])];
    }

    // Firefox style: "function@filename:lineNumber or @filename:lineNumber"
    var attempt3 = /.*@(.+):(\d+)$/.exec(stackLine);
    if (attempt3) {
        return [attempt3[1], Number(attempt3[2])];
    }
}

function isInternalFrame(stackLine) {
    var fileNameAndLineNumber = getFileNameAndLineNumber(stackLine);

    if (!fileNameAndLineNumber) {
        return false;
    }

    var fileName = fileNameAndLineNumber[0];
    var lineNumber = fileNameAndLineNumber[1];

    return fileName === qFileName &&
        lineNumber >= qStartingLine &&
        lineNumber <= qEndingLine;
}

// discover own file name and line number range for filtering stack
// traces
function captureLine() {
    if (!hasStacks) {
        return;
    }

    try {
        throw new Error();
    } catch (e) {
        var lines = e.stack.split("\n");
        var firstLine = lines[0].indexOf("@") > 0 ? lines[1] : lines[2];
        var fileNameAndLineNumber = getFileNameAndLineNumber(firstLine);
        if (!fileNameAndLineNumber) {
            return;
        }

        qFileName = fileNameAndLineNumber[0];
        return fileNameAndLineNumber[1];
    }
}

function deprecate(callback, name, alternative) {
    return function Q_deprecate() {
        if (
            typeof console !== "undefined" &&
            typeof console.warn === "function"
        ) {
            if (alternative) {
                console.warn(
                    name + " is deprecated, use " + alternative + " instead.",
                    new Error("").stack
                );
            } else {
                console.warn(
                    name + " is deprecated.",
                    new Error("").stack
                );
            }
        }
        return callback.apply(this, arguments);
    };
}

// end of long stack traces

var handlers = new WeakMap();

function Q_getHandler(promise) {
    var handler = handlers.get(promise);
    if (!handler || !handler.became) {
        return handler;
    }
    handler = follow(handler);
    handlers.set(promise, handler);
    return handler;
}

function follow(handler) {
    if (!handler.became) {
        return handler;
    } else {
        handler.became = follow(handler.became);
        return handler.became;
    }
}

var theViciousCycleError = new Error("Can't resolve a promise with itself");
var theViciousCycleRejection = Q_reject(theViciousCycleError);
var theViciousCycle = Q_getHandler(theViciousCycleRejection);

var thenables = new WeakMap();

/**
 * Coerces a value to a promise. If the value is a promise, pass it through
 * unaltered. If the value has a `then` method, it is presumed to be a promise
 * but not one of our own, so it is treated as a “thenable” promise and this
 * returns a promise that stands for it. Otherwise, this returns a promise that
 * has already been fulfilled with the value.
 * @param value promise, object with a then method, or a fulfillment value
 * @returns {Promise} the same promise as given, or a promise for the given
 * value
 */
module.exports = Q;
function Q(value) {
    // If the object is already a Promise, return it directly.  This enables
    // the resolve function to both be used to created references from objects,
    // but to tolerably coerce non-promises to promises.
    if (Q_isPromise(value)) {
        return value;
    } else if (isThenable(value)) {
        if (!thenables.has(value)) {
            thenables.set(value, new Promise(new Thenable(value)));
        }
        return thenables.get(value);
    } else {
        return new Promise(new Fulfilled(value));
    }
}

/**
 * Controls whether or not long stack traces will be on
 * @type {boolean}
 */
Q.longStackSupport = false;

/**
 * Returns a promise that has been rejected with a reason, which should be an
 * instance of `Error`.
 * @param {Error} error reason for the failure.
 * @returns {Promise} rejection
 */
Q.reject = Q_reject;
function Q_reject(error) {
    return new Promise(new Rejected(error));
}

/**
 * Constructs a {promise, resolve, reject} object.
 *
 * `resolve` is a callback to invoke with a more resolved value for the
 * promise. To fulfill the promise, invoke `resolve` with any value that is
 * not a thenable. To reject the promise, invoke `resolve` with a rejected
 * thenable, or invoke `reject` with the reason directly. To resolve the
 * promise to another thenable, thus putting it in the same state, invoke
 * `resolve` with that other thenable.
 *
 * @returns {{promise, resolve, reject}} a deferred
 */
Q.defer = defer;
function defer() {

    var handler = new Pending();
    var promise = new Promise(handler);
    var deferred = new Deferred(promise);

    if (Q.longStackSupport && hasStacks) {
        try {
            throw new Error();
        } catch (e) {
            // NOTE: don't try to use `Error.captureStackTrace` or transfer the
            // accessor around; that causes memory leaks as per GH-111. Just
            // reify the stack trace as a string ASAP.
            //
            // At the same time, cut off the first line; it's always just
            // "[object Promise]\n", as per the `toString`.
            promise.stack = e.stack.substring(e.stack.indexOf("\n") + 1);
        }
    }

    return deferred;
}

// TODO
/**
 */
Q.when = function Q_when(value, fulfilled, rejected, ms) {
    return Q(value).then(fulfilled, rejected, ms);
};

/**
 * Turns an array of promises into a promise for an array.  If any of the
 * promises gets rejected, the whole array is rejected immediately.
 * @param {Array.<Promise>} an array (or promise for an array) of values (or
 * promises for values)
 * @returns {Promise.<Array>} a promise for an array of the corresponding values
 */
// By Mark Miller
// http://wiki.ecmascript.org/doku.php?id=strawman:concurrency&rev=1308776521#allfulfilled
Q.all = Q_all;
function Q_all(questions) {
    // XXX deprecated behavior
    if (Q_isPromise(questions)) {
        if (
            typeof console !== "undefined" &&
            typeof console.warn === "function"
        ) {
            console.warn("Q.all no longer directly unwraps a promise. Use Q(array).all()");
        }
        return Q(questions).all();
    }
    var countDown = 0;
    var deferred = defer();
    var answers = Array(questions.length);
    var estimates = [];
    var estimate = -Infinity;
    var setEstimate;
    Array.prototype.forEach.call(questions, function Q_all_each(promise, index) {
        var handler;
        if (
            Q_isPromise(promise) &&
            (handler = Q_getHandler(promise)).state === "fulfilled"
        ) {
            answers[index] = handler.value;
        } else {
            ++countDown;
            promise = Q(promise);
            promise.then(
                function Q_all_eachFulfilled(value) {
                    answers[index] = value;
                    if (--countDown === 0) {
                        deferred.resolve(answers);
                    }
                },
                deferred.reject
            );

            promise.observeEstimate(function Q_all_eachEstimate(newEstimate) {
                var oldEstimate = estimates[index];
                estimates[index] = newEstimate;
                if (newEstimate > estimate) {
                    estimate = newEstimate;
                } else if (oldEstimate === estimate && newEstimate <= estimate) {
                    // There is a 1/length chance that we will need to perform
                    // this O(length) walk, so amortized O(1)
                    computeEstimate();
                }
                if (estimates.length === questions.length && estimate !== setEstimate) {
                    deferred.setEstimate(estimate);
                    setEstimate = estimate;
                }
            });

        }
    });

    function computeEstimate() {
        estimate = -Infinity;
        for (var index = 0; index < estimates.length; index++) {
            if (estimates[index] > estimate) {
                estimate = estimates[index];
            }
        }
    }

    if (countDown === 0) {
        deferred.resolve(answers);
    }

    return deferred.promise;
}

/**
 * @see Promise#allSettled
 */
Q.allSettled = Q_allSettled;
function Q_allSettled(questions) {
    // XXX deprecated behavior
    if (Q_isPromise(questions)) {
        if (
            typeof console !== "undefined" &&
            typeof console.warn === "function"
        ) {
            console.warn("Q.allSettled no longer directly unwraps a promise. Use Q(array).allSettled()");
        }
        return Q(questions).allSettled();
    }
    return Q_all(questions.map(function Q_allSettled_each(promise) {
        promise = Q(promise);
        function regardless() {
            return promise.inspect();
        }
        return promise.then(regardless, regardless);
    }));
}

/**
 * Returns a promise for the given value (or promised value), some
 * milliseconds after it resolved. Passes rejections immediately.
 * @param {Any*} promise
 * @param {Number} milliseconds
 * @returns a promise for the resolution of the given promise after milliseconds
 * time has elapsed since the resolution of the given promise.
 * If the given promise rejects, that is passed immediately.
 */
Q.delay = function Q_delay(object, timeout) {
    if (timeout === void 0) {
        timeout = object;
        object = void 0;
    }
    return Q(object).delay(timeout);
};

/**
 * Causes a promise to be rejected if it does not get fulfilled before
 * some milliseconds time out.
 * @param {Any*} promise
 * @param {Number} milliseconds timeout
 * @param {String} custom error message (optional)
 * @returns a promise for the resolution of the given promise if it is
 * fulfilled before the timeout, otherwise rejected.
 */
Q.timeout = function Q_timeout(object, ms, message) {
    return Q(object).timeout(ms, message);
};

/**
 * Spreads the values of a promised array of arguments into the
 * fulfillment callback.
 * @param fulfilled callback that receives variadic arguments from the
 * promised array
 * @param rejected callback that receives the exception if the promise
 * is rejected.
 * @returns a promise for the return value or thrown exception of
 * either callback.
 */
Q.spread = Q_spread;
function Q_spread(value, fulfilled, rejected) {
    return Q(value).spread(fulfilled, rejected);
}

/**
 * If two promises eventually fulfill to the same value, promises that value,
 * but otherwise rejects.
 * @param x {Any*}
 * @param y {Any*}
 * @returns {Any*} a promise for x and y if they are the same, but a rejection
 * otherwise.
 *
 */
Q.join = function Q_join(x, y) {
    return Q.spread([x, y], function Q_joined(x, y) {
        if (x === y) {
            // TODO: "===" should be Object.is or equiv
            return x;
        } else {
            throw new Error("Can't join: not the same: " + x + " " + y);
        }
    });
};

/**
 * Returns a promise for the first of an array of promises to become fulfilled.
 * @param answers {Array} promises to race
 * @returns {Promise} the first promise to be fulfilled
 */
Q.race = Q_race;
function Q_race(answerPs) {
    return new Promise(function(deferred) {
        answerPs.forEach(function(answerP) {
            Q(answerP).then(deferred.resolve, deferred.reject);
        });
    });
}

/**
 * Calls the promised function in a future turn.
 * @param object    promise or immediate reference for target function
 * @param ...args   array of application arguments
 */
Q.try = function Q_try(callback) {
    return Q(callback).dispatch("call", [[]]);
};

/**
 * TODO
 */
Q.function = Promise_function;
function Promise_function(wrapped) {
    return function promiseFunctionWrapper() {
        var args = new Array(arguments.length);
        for (var index = 0; index < arguments.length; index++) {
            args[index] = arguments[index];
        }
        return Q(wrapped).apply(this, args);
    };
}

/**
 * The promised function decorator ensures that any promise arguments
 * are settled and passed as values (`this` is also settled and passed
 * as a value).  It will also ensure that the result of a function is
 * always a promise.
 *
 * @example
 * var add = Q.promised(function (a, b) {
 *     return a + b;
 * });
 * add(Q(a), Q(B));
 *
 * @param {function} callback The function to decorate
 * @returns {function} a function that has been decorated.
 */
Q.promised = function Q_promised(callback) {
    return function promisedMethod() {
        var args = new Array(arguments.length);
        for (var index = 0; index < arguments.length; index++) {
            args[index] = arguments[index];
        }
        return Q_spread(
            [this, Q_all(args)],
            function Q_promised_spread(self, args) {
                return callback.apply(self, args);
            }
        );
    };
};

/**
 */
Q.passByCopy = // TODO XXX experimental
Q.push = function (value) {
    if (Object(value) === value && !Q_isPromise(value)) {
        passByCopies.set(value, true);
    }
    return value;
};

Q.isPortable = function (value) {
    return Object(value) === value && passByCopies.has(value);
};

var passByCopies = new WeakMap();

/**
 * The async function is a decorator for generator functions, turning
 * them into asynchronous generators. Although generators are only
 * part of the newest ECMAScript 6 drafts, this code does not cause
 * syntax errors in older engines. This code should continue to work
 * and will in fact improve over time as the language improves.
 *
 * ES6 generators are currently part of V8 version 3.19 with the
 * `--harmony-generators` runtime flag enabled. This function does not
 * support the former, Pythonic generators that were only implemented
 * by SpiderMonkey.
 *
 * Decorates a generator function such that:
 *  - it may yield promises
 *  - execution will continue when that promise is fulfilled
 *  - the value of the yield expression will be the fulfilled value
 *  - it returns a promise for the return value (when the generator
 *    stops iterating)
 *  - the decorated function returns a promise for the return value
 *    of the generator or the first rejected promise among those
 *    yielded.
 *  - if an error is thrown in the generator, it propagates through
 *    every following yield until it is caught, or until it escapes
 *    the generator function altogether, and is translated into a
 *    rejection for the promise returned by the decorated generator.
 */
Q.async = Q_async;
function Q_async(makeGenerator) {
    return function spawn() {
        // when verb is "send", arg is a value
        // when verb is "throw", arg is an exception
        function continuer(verb, arg) {
            var iteration;
            try {
                iteration = generator[verb](arg);
            } catch (exception) {
                return Q_reject(exception);
            }
            if (iteration.done) {
                return Q(iteration.value);
            } else {
                return Q(iteration.value).then(callback, errback);
            }
        }
        var generator = makeGenerator.apply(this, arguments);
        var callback = continuer.bind(continuer, "next");
        var errback = continuer.bind(continuer, "throw");
        return callback();
    };
}

/**
 * The spawn function is a small wrapper around async that immediately
 * calls the generator and also ends the promise chain, so that any
 * unhandled errors are thrown instead of forwarded to the error
 * handler. This is useful because it's extremely common to run
 * generators at the top-level to work with libraries.
 */
Q.spawn = Q_spawn;
function Q_spawn(makeGenerator) {
    Q_async(makeGenerator)().done();
}


// Thus begins the section dedicated to the Promise

/**
 * TODO
 */
Q.Promise = Promise;
function Promise(handler) {
    if (!(this instanceof Promise)) {
        return new Promise(handler);
    }
    if (typeof handler === "function") {
        var setup = handler;
        var deferred = defer();
        handler = Q_getHandler(deferred.promise);
        try {
            setup(deferred.resolve, deferred.reject, deferred.setEstimate);
        } catch (error) {
            deferred.reject(error);
        }
    }
    handlers.set(this, handler);
}

/**
 * Turns an array of promises into a promise for an array.  If any of the
 * promises gets rejected, the whole array is rejected immediately.
 * @param {Array.<Promise>} an array (or promise for an array) of values (or
 * promises for values)
 * @returns {Promise.<Array>} a promise for an array of the corresponding values
 */
Promise.all = Q_all;

/**
 * Returns a promise for the first of an array of promises to become fulfilled.
 * @param answers {Array} promises to race
 * @returns {Promise} the first promise to be fulfilled
 */
Promise.race = Q_race;

/**
 * Coerces a value to a promise. If the value is a promise, pass it through
 * unaltered. If the value has a `then` method, it is presumed to be a promise
 * but not one of our own, so it is treated as a “thenable” promise and this
 * returns a promise that stands for it. Otherwise, this returns a promise that
 * has already been fulfilled with the value.
 * @param value promise, object with a then method, or a fulfillment value
 * @returns {Promise} the same promise as given, or a promise for the given
 * value
 */
Promise.resolve = Promise_resolve;
function Promise_resolve(value) {
    return Q(value);
}

/**
 * Returns a promise that has been rejected with a reason, which should be an
 * instance of `Error`.
 * @param reason value describing the failure
 * @returns {Promise} rejection
 */
Promise.reject = Q_reject;

/**
 * @returns {boolean} whether the given value is a promise.
 */
Q.isPromise = Q_isPromise;
function Q_isPromise(object) {
    return isObject(object) && !!handlers.get(object);
}

/**
 * @returns {boolean} whether the given value is an object with a then method.
 * @private
 */
function isThenable(object) {
    return isObject(object) && typeof object.then === "function";
}

/**
 * Synchronously produces a snapshot of the internal state of the promise.  The
 * object will have a `state` property. If the `state` is `"pending"`, there
 * will be no further information. If the `state` is `"fulfilled"`, there will
 * be a `value` property. If the state is `"rejected"` there will be a `reason`
 * property.  If the promise was constructed from a “thenable” and `then` nor
 * any other method has been dispatched on the promise has been called, the
 * state will be `"pending"`. The state object will not be updated if the
 * state changes and changing it will have no effect on the promise. Every
 * call to `inspect` produces a unique object.
 * @returns {{state: string, value?, reason?}}
 */
Promise.prototype.inspect = function Promise_inspect() {
    // the second layer captures only the relevant "state" properties of the
    // handler to prevent leaking the capability to access or alter the
    // handler.
    return Q_getHandler(this).inspect();
};

/**
 * @returns {boolean} whether the promise is waiting for a result.
 */
Promise.prototype.isPending = function Promise_isPending() {
    return Q_getHandler(this).state === "pending";
};

/**
 * @returns {boolean} whether the promise has ended in a result and has a
 * fulfillment value.
 */
Promise.prototype.isFulfilled = function Promise_isFulfilled() {
    return Q_getHandler(this).state === "fulfilled";
};

/**
 * @returns {boolean} whether the promise has ended poorly and has a reason for
 * its rejection.
 */
Promise.prototype.isRejected = function Promise_isRejected() {
    return Q_getHandler(this).state === "rejected";
};

/**
 * TODO
 */
Promise.prototype.toBePassed = function Promise_toBePassed() {
    return Q_getHandler(this).state === "passed";
};

/**
 * @returns {string} merely `"[object Promise]"`
 */
Promise.prototype.toString = function Promise_toString() {
    return "[object Promise]";
};

/**
 * Creates a new promise, waits for this promise to be resolved, and informs
 * either the fullfilled or rejected handler of the result. Whatever result
 * comes of the fulfilled or rejected handler, a value returned, a promise
 * returned, or an error thrown, becomes the resolution for the promise
 * returned by `then`.
 *
 * @param fulfilled
 * @param rejected
 * @returns {Promise} for the result of `fulfilled` or `rejected`.
 */
Promise.prototype.then = function Promise_then(fulfilled, rejected, ms) {
    var self = this;
    var deferred = defer();

    var _fulfilled;
    if (typeof fulfilled === "function") {
        _fulfilled = function Promise_then_fulfilled(value) {
            try {
                deferred.resolve(fulfilled.call(void 0, value));
            } catch (error) {
                deferred.reject(error);
            }
        };
    } else {
        _fulfilled = deferred.resolve;
    }

    var _rejected;
    if (typeof rejected === "function") {
        _rejected = function Promise_then_rejected(error) {
            try {
                deferred.resolve(rejected.call(void 0, error));
            } catch (newError) {
                deferred.reject(newError);
            }
        };
    } else {
        _rejected = deferred.reject;
    }

    this.done(_fulfilled, _rejected);

    if (ms !== void 0) {
        var updateEstimate = function Promise_then_updateEstimate() {
            deferred.setEstimate(self.getEstimate() + ms);
        };
        this.observeEstimate(updateEstimate);
        updateEstimate();
    }

    return deferred.promise;
};

/**
 * Terminates a chain of promises, forcing rejections to be
 * thrown as exceptions.
 * @param fulfilled
 * @param rejected
 */
Promise.prototype.done = function Promise_done(fulfilled, rejected) {
    var self = this;
    var done = false;   // ensure the untrusted promise makes at most a
                        // single call to one of the callbacks
    asap(function Promise_done_task() {
        var _fulfilled;
        if (typeof fulfilled === "function") {
            if (Q.onerror) {
                _fulfilled = function Promise_done_fulfilled(value) {
                    if (done) {
                        return;
                    }
                    done = true;
                    try {
                        fulfilled.call(void 0, value);
                    } catch (error) {
                        // fallback to rethrow is still necessary because
                        // _fulfilled is not called in the same event as the
                        // above guard.
                        (Q.onerror || Promise_rethrow)(error);
                    }
                };
            } else {
                _fulfilled = function Promise_done_fulfilled(value) {
                    if (done) {
                        return;
                    }
                    done = true;
                    fulfilled.call(void 0, value);
                };
            }
        }

        var _rejected;
        if (typeof rejected === "function" && Q.onerror) {
            _rejected = function Promise_done_rejected(error) {
                if (done) {
                    return;
                }
                done = true;
                makeStackTraceLong(error, self);
                try {
                    rejected.call(void 0, error);
                } catch (newError) {
                    (Q.onerror || Promise_rethrow)(newError);
                }
            };
        } else if (typeof rejected === "function") {
            _rejected = function Promise_done_rejected(error) {
                if (done) {
                    return;
                }
                done = true;
                makeStackTraceLong(error, self);
                rejected.call(void 0, error);
            };
        } else {
            _rejected = Q.onerror || Promise_rethrow;
        }

        if (typeof process === "object" && process.domain) {
            _rejected = process.domain.bind(_rejected);
        }

        Q_getHandler(self).dispatch(_fulfilled, "then", [_rejected]);
    });
};

function Promise_rethrow(error) {
    throw error;
}

/**
 * TODO
 */
Promise.prototype.thenResolve = function Promise_thenResolve(value) {
    // Wrapping ahead of time to forestall multiple wrappers.
    value = Q(value);
    // Using all is necessary to aggregate the estimated time to completion.
    return Q_all([this, value]).then(function Promise_thenResolve_resolved() {
        return value;
    }, null, 0);
    // 0: does not contribute significantly to the estimated time to
    // completion.
};

/**
 * TODO
 */
Promise.prototype.thenReject = function Promise_thenReject(error) {
    return this.then(function Promise_thenReject_resolved() {
        throw error;
    }, null, 0);
    // 0: does not contribute significantly to the estimated time to
    // completion.
};

/**
 * TODO
 */
Promise.prototype.all = function Promise_all() {
    return this.then(Q_all);
};

/**
 * Turns an array of promises into a promise for an array of their states (as
 * returned by `inspect`) when they have all settled.
 * @param {Array[Any*]} values an array (or promise for an array) of values (or
 * promises for values)
 * @returns {Array[State]} an array of states for the respective values.
 */
Promise.prototype.allSettled = function Promise_allSettled() {
    return this.then(Q_allSettled);
};

/**
 * TODO
 */
Promise.prototype.catch = function Promise_catch(rejected) {
    return this.then(void 0, rejected);
};

/**
 * TODO
 */
Promise.prototype.finally = function Promise_finally(callback, ms) {
    if (!callback) {
        return this;
    }
    callback = Q(callback);
    return this.then(function (value) {
        return callback.call().then(function Promise_finally_fulfilled() {
            return value;
        });
    }, function (reason) {
        // TODO attempt to recycle the rejection with "this".
        return callback.call().then(function Promise_finally_rejected() {
            throw reason;
        });
    }, ms);
};

/**
 * TODO
 */
Promise.prototype.observeEstimate = function Promise_observeEstimate(emit) {
    this.rawDispatch(null, "estimate", [emit]);
    return this;
};

/**
 * TODO
 */
Promise.prototype.getEstimate = function Promise_getEstimate() {
    return Q_getHandler(this).estimate;
};

/**
 * TODO
 */
Promise.prototype.dispatch = function Promise_dispatch(op, args) {
    var deferred = defer();
    this.rawDispatch(deferred.resolve, op, args);
    return deferred.promise;
};

/**
 */
Promise.prototype.rawDispatch = function Promise_rawDispatch(resolve, op, args) {
    var self = this;
    asap(function Promise_dispatch_task() {
        Q_getHandler(self).dispatch(resolve, op, args);
    });
};

/**
 * TODO
 */
Promise.prototype.get = function Promise_get(name) {
    return this.dispatch("get", [name]);
};

/**
 * TODO
 */
Promise.prototype.invoke = function Promise_invoke(name /*...args*/) {
    var args = new Array(arguments.length - 1);
    for (var index = 1; index < arguments.length; index++) {
        args[index - 1] = arguments[index];
    }
    return this.dispatch("invoke", [name, args]);
};

/**
 * TODO
 */
Promise.prototype.apply = function Promise_apply(thisp, args) {
    return this.dispatch("call", [args, thisp]);
};

/**
 * TODO
 */
Promise.prototype.call = function Promise_call(thisp /*, ...args*/) {
    var args = new Array(Math.max(0, arguments.length - 1));
    for (var index = 1; index < arguments.length; index++) {
        args[index - 1] = arguments[index];
    }
    return this.dispatch("call", [args, thisp]);
};

/**
 * TODO
 */
Promise.prototype.bind = function Promise_bind(thisp /*, ...args*/) {
    var self = this;
    var args = new Array(Math.max(0, arguments.length - 1));
    for (var index = 1; index < arguments.length; index++) {
        args[index - 1] = arguments[index];
    }
    return function Promise_bind_bound(/*...args*/) {
        var boundArgs = args.slice();
        for (var index = 0; index < arguments.length; index++) {
            boundArgs[boundArgs.length] = arguments[index];
        }
        return self.dispatch("call", [boundArgs, thisp]);
    };
};

/**
 * TODO
 */
Promise.prototype.keys = function Promise_keys() {
    return this.dispatch("keys", []);
};

/**
 * TODO
 */
Promise.prototype.iterate = function Promise_iterate() {
    return this.dispatch("iterate", []);
};

/**
 * TODO
 */
Promise.prototype.spread = function Promise_spread(fulfilled, rejected, ms) {
    return this.all().then(function Promise_spread_fulfilled(array) {
        return fulfilled.apply(void 0, array);
    }, rejected, ms);
};

/**
 * Causes a promise to be rejected if it does not get fulfilled before
 * some milliseconds time out.
 * @param {Number} milliseconds timeout
 * @param {String} custom error message (optional)
 * @returns a promise for the resolution of the given promise if it is
 * fulfilled before the timeout, otherwise rejected.
 */
Promise.prototype.timeout = function Promsie_timeout(ms, message) {
    var deferred = defer();
    var timeoutId = setTimeout(function Promise_timeout_task() {
        deferred.reject(new Error(message || "Timed out after " + ms + " ms"));
    }, ms);

    this.then(function Promise_timeout_fulfilled(value) {
        clearTimeout(timeoutId);
        deferred.resolve(value);
    }, function Promise_timeout_rejected(error) {
        clearTimeout(timeoutId);
        deferred.reject(error);
    });

    return deferred.promise;
};

/**
 * Returns a promise for the given value (or promised value), some
 * milliseconds after it resolved. Passes rejections immediately.
 * @param {Any*} promise
 * @param {Number} milliseconds
 * @returns a promise for the resolution of the given promise after milliseconds
 * time has elapsed since the resolution of the given promise.
 * If the given promise rejects, that is passed immediately.
 */
Promise.prototype.delay = function Promise_delay(ms) {
    return this.then(function Promise_delay_fulfilled(value) {
        var deferred = defer();
        deferred.setEstimate(Date.now() + ms);
        setTimeout(function Promise_delay_task() {
            deferred.resolve(value);
        }, ms);
        return deferred.promise;
    }, null, ms);
};

/**
 * TODO
 */
Promise.prototype.pull = function Promise_pull() {
    return this.dispatch("pull", []);
};

/**
 * TODO
 */
Promise.prototype.pass = function Promise_pass() {
    if (!this.toBePassed()) {
        return new Promise(new Passed(this));
    } else {
        return this;
    }
};


// Thus begins the portion dedicated to the deferred

var promises = new WeakMap();

function Deferred(promise) {
    this.promise = promise;
    // A deferred has an intrinsic promise, denoted by its hidden handler
    // property.  The promise property of the deferred may be assigned to a
    // different promise (as it is in a Queue), but the intrinsic promise does
    // not change.
    promises.set(this, promise);
    var self = this;
    var resolve = this.resolve;
    this.resolve = function (value) {
        resolve.call(self, value);
    };
    var reject = this.reject;
    this.reject = function (error) {
        reject.call(self, error);
    };
}

/**
 * TODO
 */
Deferred.prototype.resolve = function Deferred_resolve(value) {
    var handler = Q_getHandler(promises.get(this));
    if (!handler.messages) {
        return;
    }
    handler.become(Q(value));
};

/**
 * TODO
 */
Deferred.prototype.reject = function Deferred_reject(reason) {
    var handler = Q_getHandler(promises.get(this));
    if (!handler.messages) {
        return;
    }
    handler.become(Q_reject(reason));
};

/**
 * TODO
 */
Deferred.prototype.setEstimate = function Deferred_setEstimate(estimate) {
    estimate = +estimate;
    if (estimate !== estimate) {
        estimate = Infinity;
    }
    if (estimate < 1e12 && estimate !== -Infinity) {
        throw new Error("Estimate values should be a number of miliseconds in the future");
    }
    var handler = Q_getHandler(promises.get(this));
    // TODO There is a bit of capability leakage going on here. The Deferred
    // should only be able to set the estimate for its original
    // Pending, not for any handler that promise subsequently became.
    if (handler.setEstimate) {
        handler.setEstimate(estimate);
    }
};

// Thus ends the public interface

// Thus begins the portion dedicated to handlers

function Fulfilled(value) {
    this.value = value;
    this.estimate = Date.now();
}

Fulfilled.prototype.state = "fulfilled";

Fulfilled.prototype.inspect = function Fulfilled_inspect() {
    return {state: "fulfilled", value: this.value};
};

Fulfilled.prototype.dispatch = function Fulfilled_dispatch(
    resolve, op, operands
) {
    var result;
    if (
        op === "then" ||
        op === "get" ||
        op === "call" ||
        op === "invoke" ||
        op === "keys" ||
        op === "iterate" ||
        op === "pull"
    ) {
        try {
            result = this[op].apply(this, operands);
        } catch (exception) {
            result = Q_reject(exception);
        }
    } else if (op === "estimate") {
        operands[0].call(void 0, this.estimate);
    } else {
        var error = new Error(
            "Fulfilled promises do not support the " + op + " operator"
        );
        result = Q_reject(error);
    }
    if (resolve) {
        resolve(result);
    }
};

Fulfilled.prototype.then = function Fulfilled_then() {
    return this.value;
};

Fulfilled.prototype.get = function Fulfilled_get(name) {
    return this.value[name];
};

Fulfilled.prototype.call = function Fulfilled_call(args, thisp) {
    return this.callInvoke(this.value, args, thisp);
};

Fulfilled.prototype.invoke = function Fulfilled_invoke(name, args) {
    return this.callInvoke(this.value[name], args, this.value);
};

Fulfilled.prototype.callInvoke = function Fulfilled_callInvoke(callback, args, thisp) {
    var waitToBePassed;
    for (var index = 0; index < args.length; index++) {
        if (Q_isPromise(args[index]) && args[index].toBePassed()) {
            waitToBePassed = waitToBePassed || [];
            waitToBePassed.push(args[index]);
        }
    }
    if (waitToBePassed) {
        var self = this;
        return Q_all(waitToBePassed).then(function () {
            return self.callInvoke(callback, args.map(function (arg) {
                if (Q_isPromise(arg) && arg.toBePassed()) {
                    return arg.inspect().value;
                } else {
                    return arg;
                }
            }), thisp);
        });
    } else {
        return callback.apply(thisp, args);
    }
};

Fulfilled.prototype.keys = function Fulfilled_keys() {
    return Object.keys(this.value);
};

Fulfilled.prototype.iterate = function Fulfilled_iterate() {
    return iterate(this.value);
};

Fulfilled.prototype.pull = function Fulfilled_pull() {
    var result;
    if (Object(this.value) === this.value) {
        result = Array.isArray(this.value) ? [] : {};
        for (var name in this.value) {
            result[name] = this.value[name];
        }
    } else {
        result = this.value;
    }
    return Q.push(result);
};


function Rejected(reason) {
    this.reason = reason;
    this.estimate = Infinity;
}

Rejected.prototype.state = "rejected";

Rejected.prototype.inspect = function Rejected_inspect() {
    return {state: "rejected", reason: this.reason};
};

Rejected.prototype.dispatch = function Rejected_dispatch(
    resolve, op, operands
) {
    var result;
    if (op === "then") {
        result = this.then(resolve, operands[0]);
    } else {
        result = this;
    }
    if (resolve) {
        resolve(result);
    }
};

Rejected.prototype.then = function Rejected_then(
    resolve, rejected
) {
    return rejected ? rejected(this.reason) : this;
};


function Pending() {
    // if "messages" is an "Array", that indicates that the promise has not yet
    // been resolved.  If it is "undefined", it has been resolved.  Each
    // element of the messages array is itself an array of complete arguments to
    // forward to the resolved promise.  We coerce the resolution value to a
    // promise using the `resolve` function because it handles both fully
    // non-thenable values and other thenables gracefully.
    this.messages = [];
    this.observers = [];
    this.estimate = Infinity;
}

Pending.prototype.state = "pending";

Pending.prototype.inspect = function Pending_inspect() {
    return {state: "pending"};
};

Pending.prototype.dispatch = function Pending_dispatch(resolve, op, operands) {
    this.messages.push([resolve, op, operands]);
    if (op === "estimate") {
        this.observers.push(operands[0]);
        var self = this;
        asap(function Pending_dispatch_task() {
            operands[0].call(void 0, self.estimate);
        });
    }
};

Pending.prototype.become = function Pending_become(promise) {
    this.became = theViciousCycle;
    var handler = Q_getHandler(promise);
    this.became = handler;

    handlers.set(promise, handler);
    this.promise = void 0;

    this.messages.forEach(function Pending_become_eachMessage(message) {
        // makeQ does not have this asap call, so it must be queueing events
        // downstream. TODO look at makeQ to ascertain
        asap(function Pending_become_eachMessage_task() {
            var handler = Q_getHandler(promise);
            handler.dispatch.apply(handler, message);
        });
    });

    this.messages = void 0;
    this.observers = void 0;
};

Pending.prototype.setEstimate = function Pending_setEstimate(estimate) {
    if (this.observers) {
        var self = this;
        self.estimate = estimate;
        this.observers.forEach(function Pending_eachObserver(observer) {
            asap(function Pending_setEstimate_eachObserver_task() {
                observer.call(void 0, estimate);
            });
        });
    }
};

function Thenable(thenable) {
    this.thenable = thenable;
    this.became = null;
    this.estimate = Infinity;
}

Thenable.prototype.state = "thenable";

Thenable.prototype.inspect = function Thenable_inspect() {
    return {state: "pending"};
};

Thenable.prototype.cast = function Thenable_cast() {
    if (!this.became) {
        var deferred = defer();
        var thenable = this.thenable;
        asap(function Thenable_cast_task() {
            try {
                thenable.then(deferred.resolve, deferred.reject);
            } catch (exception) {
                deferred.reject(exception);
            }
        });
        this.became = Q_getHandler(deferred.promise);
    }
    return this.became;
};

Thenable.prototype.dispatch = function Thenable_dispatch(resolve, op, args) {
    this.cast().dispatch(resolve, op, args);
};


function Passed(promise) {
    this.promise = promise;
}

Passed.prototype.state = "passed";

Passed.prototype.inspect = function Passed_inspect() {
    return this.promise.inspect();
};

Passed.prototype.dispatch = function Passed_dispatch(resolve, op, args) {
    return this.promise.rawDispatch(resolve, op, args);
};


// Thus begins the Q Node.js bridge

/**
 * Calls a method of a Node-style object that accepts a Node-style
 * callback, forwarding the given variadic arguments, plus a provided
 * callback argument.
 * @param object an object that has the named method
 * @param {String} name name of the method of object
 * @param ...args arguments to pass to the method; the callback will
 * be provided by Q and appended to these arguments.
 * @returns a promise for the value or error
 */
Q.ninvoke = function Q_ninvoke(object, name /*...args*/) {
    var args = new Array(Math.max(0, arguments.length - 1));
    for (var index = 2; index < arguments.length; index++) {
        args[index - 2] = arguments[index];
    }
    var deferred = Q.defer();
    args[index - 2] = deferred.makeNodeResolver();
    Q(object).dispatch("invoke", [name, args]).catch(deferred.reject);
    return deferred.promise;
};

Promise.prototype.ninvoke = function Promise_ninvoke(name /*...args*/) {
    var args = new Array(arguments.length);
    for (var index = 1; index < arguments.length; index++) {
        args[index - 1] = arguments[index];
    }
    var deferred = Q.defer();
    args[index - 1] = deferred.makeNodeResolver();
    this.dispatch("invoke", [name, args]).catch(deferred.reject);
    return deferred.promise;
};

/**
 * Wraps a Node.js continuation passing function and returns an equivalent
 * version that returns a promise.
 * @example
 * Q.denodeify(FS.readFile)(__filename, "utf-8")
 * .then(console.log)
 * .done()
 */
Q.denodeify = function Q_denodeify(callback, pattern) {
    return function denodeified() {
        var args = new Array(arguments.length + 1);
        var index = 0;
        for (; index < arguments.length; index++) {
            args[index] = arguments[index];
        }
        var deferred = Q.defer();
        args[index] = deferred.makeNodeResolver(pattern);
        Q(callback).apply(this, args).catch(deferred.reject);
        return deferred.promise;
    };
};

/**
 * Creates a Node.js-style callback that will resolve or reject the deferred
 * promise.
 * @param unpack `true` means that the Node.js-style-callback accepts a
 * fixed or variable number of arguments and that the deferred should be resolved
 * with an array of these value arguments, or rejected with the error argument.
 * An array of names means that the Node.js-style-callback accepts a fixed
 * number of arguments, and that the resolution should be an object with
 * properties corresponding to the given names and respective value arguments.
 * @returns a nodeback
 */
Deferred.prototype.makeNodeResolver = function (unpack) {
    var resolve = this.resolve;
    if (unpack === true) {
        return function variadicNodebackToResolver(error) {
            if (error) {
                resolve(Q_reject(error));
            } else {
                var value = new Array(Math.max(0, arguments.length - 1));
                for (var index = 1; index < arguments.length; index++) {
                    value[index - 1] = arguments[index];
                }
                resolve(value);
            }
        };
    } else if (unpack) {
        return function namedArgumentNodebackToResolver(error) {
            if (error) {
                resolve(Q_reject(error));
            } else {
                var value = {};
                for (var index = 0; index < unpack.length; index++) {
                    value[unpack[index]] = arguments[index + 1];
                }
                resolve(value);
            }
        };
    } else {
        return function nodebackToResolver(error, value) {
            if (error) {
                resolve(Q_reject(error));
            } else {
                resolve(value);
            }
        };
    }
};

/**
 * TODO
 */
Promise.prototype.nodeify = function Promise_nodeify(nodeback) {
    if (nodeback) {
        this.done(function (value) {
            nodeback(null, value);
        }, nodeback);
    } else {
        return this;
    }
};


// DEPRECATED

Q.nextTick = deprecate(asap, "nextTick", "asap package");

Q.resolve = deprecate(Q, "resolve", "Q");

Q.fulfill = deprecate(Q, "fulfill", "Q");

Q.isPromiseAlike = deprecate(isThenable, "isPromiseAlike", "(not supported)");

Q.fail = deprecate(function (value, rejected) {
    return Q(value).catch(rejected);
}, "Q.fail", "Q(value).catch");

Q.fin = deprecate(function (value, regardless) {
    return Q(value).finally(regardless);
}, "Q.fin", "Q(value).finally");

Q.progress = deprecate(function (value) {
    return value;
}, "Q.progress", "no longer supported");

Q.thenResolve = deprecate(function (promise, value) {
    return Q(promise).thenResolve(value);
}, "thenResolve", "Q(value).thenResolve");

Q.thenReject = deprecate(function (promise, reason) {
    return Q(promise).thenResolve(reason);
}, "thenResolve", "Q(value).thenResolve");

Q.isPending = deprecate(function (value) {
    return Q(value).isPending();
}, "isPending", "Q(value).isPending");

Q.isFulfilled = deprecate(function (value) {
    return Q(value).isFulfilled();
}, "isFulfilled", "Q(value).isFulfilled");

Q.isRejected = deprecate(function (value) {
    return Q(value).isRejected();
}, "isRejected", "Q(value).isRejected");

Q.master = deprecate(function (value) {
    return value;
}, "master", "no longer necessary");

Q.makePromise = function () {
    throw new Error("makePromise is no longer supported");
};

Q.dispatch = deprecate(function (value, op, operands) {
    return Q(value).dispatch(op, operands);
}, "dispatch", "Q(value).dispatch");

Q.get = deprecate(function (object, name) {
    return Q(object).get(name);
}, "get", "Q(value).get");

Q.keys = deprecate(function (object) {
    return Q(object).keys();
}, "keys", "Q(value).keys");

Q.post = deprecate(function (object, name, args) {
    return Q(object).post(name, args);
}, "post", "Q(value).invoke (spread arguments)");

Q.mapply = deprecate(function (object, name, args) {
    return Q(object).post(name, args);
}, "post", "Q(value).invoke (spread arguments)");

Q.send = deprecate(function (object, name) {
    return Q(object).post(name, Array.prototype.slice.call(arguments, 2));
}, "send", "Q(value).invoke");

Q.set = function () {
    throw new Error("Q.set no longer supported");
};

Q.delete = function () {
    throw new Error("Q.delete no longer supported");
};

Q.nearer = deprecate(function (value) {
    if (Q_isPromise(value) && value.isFulfilled()) {
        return value.inspect().value;
    } else {
        return value;
    }
}, "nearer", "inspect().value (+nuances)");

Q.fapply = deprecate(function (callback, args) {
    return Q(callback).dispatch("call", [args]);
}, "fapply", "Q(callback).apply(thisp, args)");

Q.fcall = deprecate(function (callback /*, ...args*/) {
    return Q(callback).dispatch("call", [Array.prototype.slice.call(arguments, 1)]);
}, "fcall", "Q(callback).call(thisp, ...args)");

Q.fbind = deprecate(function (object /*...args*/) {
    var promise = Q(object);
    var args = Array.prototype.slice.call(arguments, 1);
    return function fbound() {
        return promise.dispatch("call", [
            args.concat(Array.prototype.slice.call(arguments)),
            this
        ]);
    };
}, "fbind", "bind with thisp");

Q.promise = deprecate(Promise, "promise", "Promise");

Promise.prototype.fapply = deprecate(function (args) {
    return this.dispatch("call", [args]);
}, "fapply", "apply with thisp");

Promise.prototype.fcall = deprecate(function (/*...args*/) {
    return this.dispatch("call", [Array.prototype.slice.call(arguments)]);
}, "fcall", "try or call with thisp");

Promise.prototype.fail = deprecate(function (rejected) {
    return this.catch(rejected);
}, "fail", "catch");

Promise.prototype.fin = deprecate(function (regardless) {
    return this.finally(regardless);
}, "fin", "finally");

Promise.prototype.set = function () {
    throw new Error("Promise set no longer supported");
};

Promise.prototype.delete = function () {
    throw new Error("Promise delete no longer supported");
};

Deferred.prototype.notify = deprecate(function () {
}, "notify", "no longer supported");

Promise.prototype.progress = deprecate(function () {
    return this;
}, "progress", "no longer supported");

// alternative proposed by Redsandro, dropped in favor of post to streamline
// the interface
Promise.prototype.mapply = deprecate(function (name, args) {
    return this.dispatch("invoke", [name, args]);
}, "mapply", "invoke");

Promise.prototype.fbind = deprecate(function () {
    return Q.fbind.apply(Q, [void 0].concat(Array.prototype.slice.call(arguments)));
}, "fbind", "bind(thisp, ...args)");

// alternative proposed by Mark Miller, dropped in favor of invoke
Promise.prototype.send = deprecate(function () {
    return this.dispatch("invoke", [name, Array.prototype.slice.call(arguments, 1)]);
}, "send", "invoke");

// alternative proposed by Redsandro, dropped in favor of invoke
Promise.prototype.mcall = deprecate(function () {
    return this.dispatch("invoke", [name, Array.prototype.slice.call(arguments, 1)]);
}, "mcall", "invoke");

Promise.prototype.passByCopy = deprecate(function (value) {
    return value;
}, "passByCopy", "Q.passByCopy");

// Deprecated Node.js bridge promise methods

Q.nfapply = deprecate(function (callback, args) {
    var deferred = Q.defer();
    var nodeArgs = Array.prototype.slice.call(args);
    nodeArgs.push(deferred.makeNodeResolver());
    Q(callback).apply(this, nodeArgs).catch(deferred.reject);
    return deferred.promise;
}, "nfapply");

Promise.prototype.nfapply = deprecate(function (args) {
    return Q.nfapply(this, args);
}, "nfapply");

Q.nfcall = deprecate(function (callback /*...args*/) {
    var args = Array.prototype.slice.call(arguments, 1);
    return Q.nfapply(callback, args);
}, "nfcall");

Promise.prototype.nfcall = deprecate(function () {
    var args = new Array(arguments.length);
    for (var index = 0; index < arguments.length; index++) {
        args[index] = arguments[index];
    }
    return Q.nfapply(this, args);
}, "nfcall");

Q.nfbind = deprecate(function (callback /*...args*/) {
    var baseArgs = Array.prototype.slice.call(arguments, 1);
    return function () {
        var nodeArgs = baseArgs.concat(Array.prototype.slice.call(arguments));
        var deferred = Q.defer();
        nodeArgs.push(deferred.makeNodeResolver());
        Q(callback).apply(this, nodeArgs).catch(deferred.reject);
        return deferred.promise;
    };
}, "nfbind", "denodeify (with caveats)");

Promise.prototype.nfbind = deprecate(function () {
    var args = new Array(arguments.length);
    for (var index = 0; index < arguments.length; index++) {
        args[index] = arguments[index];
    }
    return Q.nfbind(this, args);
}, "nfbind", "denodeify (with caveats)");

Q.nbind = deprecate(function (callback, thisp /*...args*/) {
    var baseArgs = Array.prototype.slice.call(arguments, 2);
    return function () {
        var nodeArgs = baseArgs.concat(Array.prototype.slice.call(arguments));
        var deferred = Q.defer();
        nodeArgs.push(deferred.makeNodeResolver());
        function bound() {
            return callback.apply(thisp, arguments);
        }
        Q(bound).apply(this, nodeArgs).catch(deferred.reject);
        return deferred.promise;
    };
}, "nbind", "denodeify (with caveats)");

Q.npost = deprecate(function (object, name, nodeArgs) {
    var deferred = Q.defer();
    nodeArgs.push(deferred.makeNodeResolver());
    Q(object).dispatch("invoke", [name, nodeArgs]).catch(deferred.reject);
    return deferred.promise;
}, "npost", "ninvoke (with spread arguments)");

Promise.prototype.npost = deprecate(function (name, args) {
    return Q.npost(this, name, args);
}, "npost", "Q.ninvoke (with caveats)");

Q.nmapply = deprecate(Q.nmapply, "nmapply", "q/node nmapply");
Promise.prototype.nmapply = deprecate(Promise.prototype.npost, "nmapply", "Q.nmapply");

Q.nsend = deprecate(Q.ninvoke, "nsend", "q/node ninvoke");
Q.nmcall = deprecate(Q.ninvoke, "nmcall", "q/node ninvoke");
Promise.prototype.nsend = deprecate(Promise.prototype.ninvoke, "nsend", "q/node ninvoke");
Promise.prototype.nmcall = deprecate(Promise.prototype.ninvoke, "nmcall", "q/node ninvoke");

// All code before this point will be filtered from stack traces.
var qEndingLine = captureLine();



/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(27);


/***/ }),
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__node_modules_jsonlint_lib_jsonlint_js__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__node_modules_jsonlint_lib_jsonlint_js___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__node_modules_jsonlint_lib_jsonlint_js__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_exports_loader_jdd_node_modules_jdd_jdd_js__ = __webpack_require__(10);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_exports_loader_jdd_node_modules_jdd_jdd_js___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_exports_loader_jdd_node_modules_jdd_jdd_js__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_fs__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_fs___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_fs__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_file__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_file___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_file__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_path__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_path___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4_path__);







var jsonPath = __WEBPACK_IMPORTED_MODULE_4_path__["join"]('..', "test", "f1.json");
var doc1 = JSON.parse(__WEBPACK_IMPORTED_MODULE_2_fs__["readFileSync"](jsonPath, "utf8"));
jsonPath = __WEBPACK_IMPORTED_MODULE_4_path__["join"]('..', "test", "f2.json");
var doc2 = JSON.parse(__WEBPACK_IMPORTED_MODULE_2_fs__["readFileSync"](jsonPath, "utf8"));

//console.log(doc1, doc2);

var config1 = __WEBPACK_IMPORTED_MODULE_1_exports_loader_jdd_node_modules_jdd_jdd_js___default.a.createConfig();
var config2 = __WEBPACK_IMPORTED_MODULE_1_exports_loader_jdd_node_modules_jdd_jdd_js___default.a.createConfig();
__WEBPACK_IMPORTED_MODULE_1_exports_loader_jdd_node_modules_jdd_jdd_js___default.a.formatAndDecorate(config1, doc1);
__WEBPACK_IMPORTED_MODULE_1_exports_loader_jdd_node_modules_jdd_jdd_js___default.a.formatAndDecorate(config2, doc2);
config1.currentPath = [];
config2.currentPath = [];

__WEBPACK_IMPORTED_MODULE_1_exports_loader_jdd_node_modules_jdd_jdd_js___default.a.diffVal(doc1, config1, doc2, config2);
__WEBPACK_IMPORTED_MODULE_1_exports_loader_jdd_node_modules_jdd_jdd_js___default.a.processDiffs();
console.log(__WEBPACK_IMPORTED_MODULE_1_exports_loader_jdd_node_modules_jdd_jdd_js___default.a.diffs);



//console.log();


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var rawAsap = __webpack_require__(9);
var freeTasks = [];

/**
 * Calls a task as soon as possible after returning, in its own event, with
 * priority over IO events. An exception thrown in a task can be handled by
 * `process.on("uncaughtException") or `domain.on("error")`, but will otherwise
 * crash the process. If the error is handled, all subsequent tasks will
 * resume.
 *
 * @param {{call}} task A callable object, typically a function that takes no
 * arguments.
 */
module.exports = asap;
function asap(task) {
    var rawTask;
    if (freeTasks.length) {
        rawTask = freeTasks.pop();
    } else {
        rawTask = new RawTask();
    }
    rawTask.task = task;
    rawTask.domain = process.domain;
    rawAsap(rawTask);
}

function RawTask() {
    this.task = null;
    this.domain = null;
}

RawTask.prototype.call = function () {
    if (this.domain) {
        this.domain.enter();
    }
    var threw = true;
    try {
        this.task.call();
        threw = false;
        // If the task throws an exception (presumably) Node.js restores the
        // domain stack for the next event.
        if (this.domain) {
            this.domain.exit();
        }
    } finally {
        // We use try/finally and a threw flag to avoid messing up stack traces
        // when we catch and release errors.
        if (threw) {
            // In Node.js, uncaught exceptions are considered fatal errors.
            // Re-throw them to interrupt flushing!
            // Ensure that flushing continues if an uncaught exception is
            // suppressed listening process.on("uncaughtException") or
            // domain.on("error").
            rawAsap.requestFlush();
        }
        // If the task threw an error, we do not want to exit the domain here.
        // Exiting the domain would prevent the domain from catching the error.
        this.task = null;
        this.domain = null;
        freeTasks.push(this);
    }
};



/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var domain; // The domain module is executed on demand
var hasSetImmediate = typeof setImmediate === "function";

// Use the fastest means possible to execute a task in its own turn, with
// priority over other events including network IO events in Node.js.
//
// An exception thrown by a task will permanently interrupt the processing of
// subsequent tasks. The higher level `asap` function ensures that if an
// exception is thrown by a task, that the task queue will continue flushing as
// soon as possible, but if you use `rawAsap` directly, you are responsible to
// either ensure that no exceptions are thrown from your task, or to manually
// call `rawAsap.requestFlush` if an exception is thrown.
module.exports = rawAsap;
function rawAsap(task) {
    if (!queue.length) {
        requestFlush();
        flushing = true;
    }
    // Avoids a function call
    queue[queue.length] = task;
}

var queue = [];
// Once a flush has been requested, no further calls to `requestFlush` are
// necessary until the next `flush` completes.
var flushing = false;
// The position of the next task to execute in the task queue. This is
// preserved between calls to `flush` so that it can be resumed if
// a task throws an exception.
var index = 0;
// If a task schedules additional tasks recursively, the task queue can grow
// unbounded. To prevent memory excaustion, the task queue will periodically
// truncate already-completed tasks.
var capacity = 1024;

// The flush function processes all tasks that have been scheduled with
// `rawAsap` unless and until one of those tasks throws an exception.
// If a task throws an exception, `flush` ensures that its state will remain
// consistent and will resume where it left off when called again.
// However, `flush` does not make any arrangements to be called again if an
// exception is thrown.
function flush() {
    while (index < queue.length) {
        var currentIndex = index;
        // Advance the index before calling the task. This ensures that we will
        // begin flushing on the next task the task throws an error.
        index = index + 1;
        queue[currentIndex].call();
        // Prevent leaking memory for long chains of recursive calls to `asap`.
        // If we call `asap` within tasks scheduled by `asap`, the queue will
        // grow, but to avoid an O(n) walk for every task we execute, we don't
        // shift tasks off the queue after they have been executed.
        // Instead, we periodically shift 1024 tasks off the queue.
        if (index > capacity) {
            // Manually shift all values starting at the index back to the
            // beginning of the queue.
            for (var scan = 0, newLength = queue.length - index; scan < newLength; scan++) {
                queue[scan] = queue[scan + index];
            }
            queue.length -= index;
            index = 0;
        }
    }
    queue.length = 0;
    index = 0;
    flushing = false;
}

rawAsap.requestFlush = requestFlush;
function requestFlush() {
    // Ensure flushing is not bound to any domain.
    // It is not sufficient to exit the domain, because domains exist on a stack.
    // To execute code outside of any domain, the following dance is necessary.
    var parentDomain = process.domain;
    if (parentDomain) {
        if (!domain) {
            // Lazy execute the domain module.
            // Only employed if the user elects to use domains.
            domain = __webpack_require__(26);
        }
        domain.active = process.domain = null;
    }

    // `setImmediate` is slower that `process.nextTick`, but `process.nextTick`
    // cannot handle recursion.
    // `requestFlush` will only be called recursively from `asap.js`, to resume
    // flushing after an error is thrown into a domain.
    // Conveniently, `setImmediate` was introduced in the same version
    // `process.nextTick` started throwing recursion errors.
    if (flushing && hasSetImmediate) {
        setImmediate(flush);
    } else {
        process.nextTick(flush);
    }

    if (parentDomain) {
        domain.active = process.domain = parentDomain;
    }
}


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(_) {/******************************************************************************* 
 * 
 * Copyright 2015-2017 Zack Grossbart
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 ******************************************************************************/


/**
 * The jdd object handles all of the functions for the main page.  It finds the diffs and manages
 * the interactions of displaying them.
 */
/*global jdd:true */
var jdd = {

    LEFT: 'left',
    RIGHT: 'right',

    EQUALITY: 'eq',
    TYPE: 'type',
    MISSING: 'missing',
    diffs: [],
    requestCount: 0,

    /**
     * Find the differences between the two objects and recurse into their sub objects.
     */
    findDiffs: function(/*Object*/ config1, /*Object*/ data1, /*Object*/ config2, /*Object*/ data2) {
       config1.currentPath.push('/');
       config2.currentPath.push('/');

       var key;
       var val;

       if (data1.length < data2.length) {
           /*
            * This means the second data has more properties than the first.
            * We need to find the extra ones and create diffs for them.
            */
           for (key in data2) {
               if (data2.hasOwnProperty(key)) {
                   val = data1[key];
                   if (!data1.hasOwnProperty(key)) {
                       jdd.diffs.push(jdd.generateDiff(config1, jdd.generatePath(config1),
                                                       config2, jdd.generatePath(config2, '/' + key),
                                                       'The right side of this object has more items than the left side', jdd.MISSING));
                   }
               }
           }
       }

       /*
        * Now we're going to look for all the properties in object one and
        * compare them to object two
        */
       for (key in data1) {
           if (data1.hasOwnProperty(key)) {
               val = data1[key];

               config1.currentPath.push(key);
    
               if (!data2.hasOwnProperty(key)) {
                   /*
                    * This means that the first data has a property which
                    * isn't present in the second data
                    */
                   jdd.diffs.push(jdd.generateDiff(config1, jdd.generatePath(config1),
                                                   config2, jdd.generatePath(config2),
                                                   'Missing property <code>' + key + '</code> from the object on the right side', jdd.MISSING));
                } else {
                    config2.currentPath.push(key);
                
                    jdd.diffVal(data1[key], config1, data2[key], config2);
                    config2.currentPath.pop();
                }
                config1.currentPath.pop();
           }
       }

       config1.currentPath.pop();
       config2.currentPath.pop();

       /*
        * Now we want to look at all the properties in object two that
        * weren't in object one and generate diffs for them.
        */
       for (key in data2) {
           if (data2.hasOwnProperty(key)) {
               val = data1[key];

               if (!data1.hasOwnProperty(key)) {
                   jdd.diffs.push(jdd.generateDiff(config1, jdd.generatePath(config1),
                                                   config2, jdd.generatePath(config2, key),
                                                   'Missing property <code>' + key + '</code> from the object on the left side', jdd.MISSING));
               }
           }
       }
    },

    /**
     * Generate the differences between two values.  This handles differences of object
     * types and actual values.
     */
    diffVal: function(val1, config1, val2, config2) { 

        if (_.isArray(val1)) {
            jdd.diffArray(val1, config1, val2, config2);
        } else if (_.isObject(val1)) {
            if (_.isArray(val2) || _.isString(val2) || _.isNumber(val2) || _.isBoolean(val2)) {
                jdd.diffs.push(jdd.generateDiff(config1, jdd.generatePath(config1),
                                                config2, jdd.generatePath(config2),
                                                'Both types should be objects', jdd.TYPE));
            } else {
                jdd.findDiffs(config1, val1, config2, val2);
            }
        } else if (_.isString(val1)) {
            if (!_.isString(val2)) {
                jdd.diffs.push(jdd.generateDiff(config1, jdd.generatePath(config1),
                                                config2, jdd.generatePath(config2),
                                               'Both types should be strings', jdd.TYPE));
            } else if (val1 !== val2) {
                jdd.diffs.push(jdd.generateDiff(config1, jdd.generatePath(config1),
                                                config2, jdd.generatePath(config2),
                                               'Both sides should be equal strings', jdd.EQUALITY));
            }
        } else if (_.isNumber(val1)) {
            if (!_.isNumber(val2)) {
                jdd.diffs.push(jdd.generateDiff(config1, jdd.generatePath(config1),
                                                config2, jdd.generatePath(config2),
                                               'Both types should be numbers', jdd.TYPE));
            } else if (val1 !== val2) {
                jdd.diffs.push(jdd.generateDiff(config1, jdd.generatePath(config1),
                                                config2, jdd.generatePath(config2),
                                               'Both sides should be equal numbers', jdd.EQUALITY));
            }
        } else if (_.isBoolean(val1)) {
            jdd.diffBool(val1, config1, val2, config2);
        } 
    },

    /**
     * Arrays are more complex because we need to recurse into them and handle different length
     * issues so we handle them specially in this function.
     */
    diffArray: function(val1, config1, val2, config2) {
        if (!_.isArray(val2)) {
           jdd.diffs.push(jdd.generateDiff(config1, jdd.generatePath(config1),
                                           config2, jdd.generatePath(config2),
                                           'Both types should be arrays', jdd.TYPE));
        }

        if (val1.length < val2.length) {
            /*
             * Then there were more elements on the right side and we need to 
             * generate those differences.
             */
            for (var i = val1.length; i < val2.length; i++) {
                jdd.diffs.push(jdd.generateDiff(config1, jdd.generatePath(config1),
                                                config2, jdd.generatePath(config2, '[' + i + ']'),
                                                'Missing element <code>' + i + '</code> from the array on the left side', jdd.MISSING));
            }
        }
        _.each(val1, function(arrayVal, index) {
            if (val2.length <= index) {
                jdd.diffs.push(jdd.generateDiff(config1, jdd.generatePath(config1, '[' + index + ']'),
                                                config2, jdd.generatePath(config2),
                                                'Missing element <code>' + index + '</code> from the array on the right side', jdd.MISSING));
            } else {
                config1.currentPath.push('/[' + index + ']');                
                config2.currentPath.push('/[' + index + ']');
                
                if (_.isArray(val2)) {
                    /*
                     * If both sides are arrays then we want to diff them.
                     */
                    jdd.diffVal(val1[index], config1, val2[index], config2);
                } 
                config1.currentPath.pop();
                config2.currentPath.pop();
            }
        });
    },

    /**
     * We handle boolean values specially because we can show a nicer message for them.
     */
    diffBool: function(val1, config1, val2, config2) { 
        if (!_.isBoolean(val2)) {
            jdd.diffs.push(jdd.generateDiff(config1, jdd.generatePath(config1),
                                            config2, jdd.generatePath(config2),
                                            'Both types should be booleans', jdd.TYPE));
        } else if (val1 !== val2) {
            if (val1) {
                jdd.diffs.push(jdd.generateDiff(config1, jdd.generatePath(config1),
                                                config2, jdd.generatePath(config2),
                                                'The left side is <code>true</code> and the right side is <code>false</code>', jdd.EQUALITY));
            } else {
                jdd.diffs.push(jdd.generateDiff(config1, jdd.generatePath(config1),
                                                config2, jdd.generatePath(config2),
                                                'The left side is <code>false</code> and the right side is <code>true</code>', jdd.EQUALITY));
            }
        }
    },

    /**
     * Format the object into the output stream and decorate the data tree with 
     * the data about this object.
     */
    formatAndDecorate: function(/*Object*/ config, /*Object*/ data) {
        if (_.isArray(data)) {
            jdd.formatAndDecorateArray(config, data);
            return;
        }
        
        jdd.startObject(config);
        config.currentPath.push('/');
        
        var props = jdd.getSortedProperties(data);
        
        /*
         * If the first set has more than the second then we will catch it
         * when we compare values.  However, if the second has more then
         * we need to catch that here.
         */
        
        _.each(props, function(key) {
            config.out += jdd.newLine(config) + jdd.getTabs(config.indent) + '"' + key + '": ';
            config.currentPath.push(key);
            config.paths.push({
                path: jdd.generatePath(config),
                line: config.line
            });
            jdd.formatVal(data[key], config);
            config.currentPath.pop();
        });

        jdd.finishObject(config);
        config.currentPath.pop();
    },
    
    /**
     * Format the array into the output stream and decorate the data tree with 
     * the data about this object.
     */
    formatAndDecorateArray: function(/*Object*/ config, /*Array*/ data) {
        jdd.startArray(config);
        
        /*
         * If the first set has more than the second then we will catch it
         * when we compare values.  However, if the second has more then
         * we need to catch that here.
         */
        
        _.each(data, function(arrayVal, index) {
            config.out += jdd.newLine(config) + jdd.getTabs(config.indent);
            config.paths.push({
                path: jdd.generatePath(config, '[' + index + ']'),
                line: config.line
            });

            config.currentPath.push('/[' + index + ']');
            jdd.formatVal(arrayVal, config);
            config.currentPath.pop();
        });

        jdd.finishArray(config);
        config.currentPath.pop();
    },
    
    /**
     * Generate the start of the an array in the output stream and push in the new path
     */
    startArray: function(config) {
        config.indent++;
        config.out += '[';

        if (config.paths.length === 0) {
            /*
             * Then we are at the top of the array and we want to add 
             * a path for it.
             */
            config.paths.push({
                path: jdd.generatePath(config),
                line: config.line
            });
        }
        
        if (config.indent === 0) {
            config.indent++;
        }
    },
    
    /**
     * Finish the array, outdent, and pop off all the path
     */
    finishArray: function(config) {
        if (config.indent === 0) {
            config.indent--;
        }

        jdd.removeTrailingComma(config);

        config.indent--;
        config.out += jdd.newLine(config) + jdd.getTabs(config.indent) + ']';
        if (config.indent !== 0) {
            config.out += ',';
        } else {
            config.out += jdd.newLine(config);
        }
    },

    /**
     * Generate the start of the an object in the output stream and push in the new path
     */
    startObject: function(config) {
        config.indent++;
        config.out += '{';

        if (config.paths.length === 0) {
            /*
             * Then we are at the top of the object and we want to add 
             * a path for it.
             */
            config.paths.push({
                path: jdd.generatePath(config),
                line: config.line
            });
        }
        
        if (config.indent === 0) {
            config.indent++;
        }
    },

    /**
     * Finish the object, outdent, and pop off all the path
     */
    finishObject: function(config) {
        if (config.indent === 0) {
            config.indent--;
        }

        jdd.removeTrailingComma(config);

        config.indent--;
        config.out += jdd.newLine(config) + jdd.getTabs(config.indent) + '}';
        if (config.indent !== 0) {
            config.out += ',';
        } else {
            config.out += jdd.newLine(config);
        }
    },

    /**
     * Format a specific value into the output stream.
     */
    formatVal: function(val, config) { 
        if (_.isArray(val)) {
            config.out += '[';
            
            config.indent++;
            _.each(val, function(arrayVal, index) {
                config.out += jdd.newLine(config) + jdd.getTabs(config.indent);
                config.paths.push({
                    path: jdd.generatePath(config, '[' + index + ']'),
                    line: config.line
                });

                config.currentPath.push('/[' + index + ']');
                jdd.formatVal(arrayVal, config);
                config.currentPath.pop();
            });
            jdd.removeTrailingComma(config);
            config.indent--;

            config.out += jdd.newLine(config) + jdd.getTabs(config.indent) + ']' + ',';
        } else if (_.isObject(val)) {
            jdd.formatAndDecorate(config, val);
        } else if (_.isString(val)) {
            config.out += '"' + val.replace('\"', '\\"') + '",';
        } else if (_.isNumber(val)) {
            config.out += val + ',';
        } else if (_.isBoolean(val)) {
            config.out += val + ',';
        } else if (_.isNull(val)) {
            config.out += 'null,';
        } 
    },

    /**
     * Generate a JSON path based on the specific configuration and an optional property.
     */
    generatePath: function(config, prop) {
        var s = '';
        _.each(config.currentPath, function(path) {
            s += path;
        });

        if (prop) {
            s += '/' + prop;
        }

        if (s.length === 0) {
            return '/';
        } else {
            return s;
        }
    },

    /**
     * Add a new line to the output stream
     */
    newLine: function(config) {
        config.line++;
        return '\n';
    },

    /**
     * Sort all the relevant properties and return them in an alphabetical sort by property key
     */
    getSortedProperties: function(/*Object*/ obj) {
        var props = [];

        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                props.push(prop);
            }
        }

        props = props.sort(function(a, b) {
            return a.localeCompare(b);
        });

        return props;
    },

    /**
     * Generate the diff and verify that it matches a JSON path
     */
    generateDiff: function(config1, path1, config2, path2, /*String*/ msg, type) {
        if (path1 !== '/' && path1.charAt(path1.length - 1) === '/') {
            path1 = path1.substring(0, path1.length - 1);
        }

        if (path2 !== '/' && path2.charAt(path2.length - 1) === '/') {
            path2 = path2.substring(0, path2.length - 1);
        }

        var pathObj1 = _.find(config1.paths, function(path) {
            return path.path === path1;
        });

        var pathObj2 = _.find(config2.paths, function(path) {
            return path.path === path2;
        });

        if (!pathObj1) {
            throw 'Unable to find line number for (' + msg + '): ' + path1;
        }

        if (!pathObj2) {
            throw 'Unable to find line number for (' + msg + '): ' + path2;
        }

        return {
            path1: pathObj1,
            path2: pathObj2,
            type: type,
            msg: msg
        };
    },

    /**
     * Get the current indent level
     */
    getTabs: function(/*int*/ indent) {
        var s = '';
        for (var i = 0; i < indent; i++) {
            s += '    ';
        }

        return s;
    },

    /**
     * Remove the trailing comma from the output.
     */
    removeTrailingComma: function(config) {
        /*
         * Remove the trailing comma
         */
        if (config.out.charAt(config.out.length - 1) === ',') {
            config.out = config.out.substring(0, config.out.length - 1);
        }
    },

    /**
     * Create a config object for holding differences
     */
    createConfig: function() {
        return {
            out: '',
            indent: -1,
            currentPath: [],
            paths: [],
            line: 1
        };
    },

    /**
     * Format the output pre tags.
     */
    formatPRETags: function() {
        _.each($('pre'), function(pre) {
            var codeBlock = $('<pre class="codeBlock"></pre>');
            var lineNumbers = $('<div class="gutter"></div>');
            codeBlock.append(lineNumbers);

            var codeLines = $('<div></div>');
            codeBlock.append(codeLines);

            var addLine = function(line, index) {
                var div = $('<div class="codeLine line' + (index + 1) + '"></div>');
                lineNumbers.append($('<span class="line-number">' + (index + 1) + '.</span>'));

                var span = $('<span class="code"></span');
                span.text(line);
                div.append(span);

                codeLines.append(div);
            };

            var lines = $(pre).text().split('\n');
            _.each(lines, addLine);
            
            codeBlock.addClass($(pre).attr('class'));
            codeBlock.attr('id', $(pre).attr('id'));

            $(pre).replaceWith(codeBlock);
        });
    },

    /**
     * Format the text edits which handle the JSON input
     */
    formatTextAreas: function() {
        _.each($('textarea'), function(textarea) {
            var codeBlock = $('<div class="codeBlock"></div>');
            var lineNumbers = $('<div class="gutter"></div>');
            codeBlock.append(lineNumbers);

            var addLine = function(line, index) {
                lineNumbers.append($('<span class="line-number">' + (index + 1) + '.</span>'));
            };

            var lines = $(textarea).val().split('\n');
            _.each(lines, addLine);
            
            $(textarea).replaceWith(codeBlock);
            codeBlock.append(textarea);
        });
    },

    handleDiffClick: function (line, side) {
        var diffs = _.filter(jdd.diffs, function(diff) {
            if (side === jdd.LEFT) {
                return line === diff.path1.line;
            } else if (side === jdd.RIGHT) {
                return line === diff.path2.line;
            } else {
                return line === diff.path1.line || line === diff.path2.line;
            }
        });

        $('pre.left span.code').removeClass('selected');
        $('pre.right span.code').removeClass('selected');
        $('ul.toolbar').text('');

        _.each(diffs, function(diff) {
            $('pre.left div.line' + diff.path1.line + ' span.code').addClass('selected');
            $('pre.right div.line' + diff.path2.line + ' span.code').addClass('selected');
        });

        if (side === jdd.LEFT || side === jdd.RIGHT) {
            jdd.currentDiff = _.findIndex(jdd.diffs, function(diff) {
                return diff.path1.line === line;
            });
        }

        if (jdd.currentDiff === -1) {
            jdd.currentDiff = _.findIndex(jdd.diffs, function(diff) {
                return diff.path2.line === line;
            });
        }

        var buttons = $('<div id="buttons"><div>');
        var prev = $('<a href="#" title="Previous difference" id="prevButton">&lt;</a>');
        prev.addClass('disabled');
        prev.click(function(e) {
            e.preventDefault();
            jdd.highlightPrevDiff();
        });
        buttons.append(prev);

        buttons.append('<span id="prevNextLabel"></span>');

        var next = $('<a href="#" title="Next difference" id="nextButton">&gt;</a>');
        next.click(function(e) {
            e.preventDefault();
            jdd.highlightNextDiff();
        });
        buttons.append(next);

        $('ul.toolbar').append(buttons);
        jdd.updateButtonStyles();

        jdd.showDiffDetails(diffs);
    },

    highlightPrevDiff: function() {
        if (jdd.currentDiff > 0) {
            jdd.currentDiff--;
            jdd.highlightDiff(jdd.currentDiff);
            jdd.scrollToDiff(jdd.diffs[jdd.currentDiff]);

            jdd.updateButtonStyles();
        }
    },

    highlightNextDiff: function() {
        if (jdd.currentDiff < jdd.diffs.length - 1) {
            jdd.currentDiff++;
            jdd.highlightDiff(jdd.currentDiff);
            jdd.scrollToDiff(jdd.diffs[jdd.currentDiff]);

            jdd.updateButtonStyles();
        }
    },

    updateButtonStyles: function() {
        $('#prevButton').removeClass('disabled');
        $('#nextButton').removeClass('disabled');

        $('#prevNextLabel').text((jdd.currentDiff + 1) + ' of ' + (jdd.diffs.length));
        
        if (jdd.currentDiff === 1) {
            $('#prevButton').addClass('disabled');
        } else if (jdd.currentDiff === jdd.diffs.length - 1) {
            $('#nextButton').addClass('disabled');
        }
    },

    /**
     * Highlight the diff at the specified index
     */
    highlightDiff: function(index) {
        jdd.handleDiffClick(jdd.diffs[index].path1.line, jdd.BOTH);
    },

    /**
     * Show the details of the specified diff
     */
    showDiffDetails: function(diffs) {
         _.each(diffs, function(diff) {
             var li = $('<li></li>');
             li.html(diff.msg);
             $('ul.toolbar').append(li);

             li.click(function() {
                 jdd.scrollToDiff(diff);
             });

         });
    },

    /**
     * Scroll the specified diff to be visible
     */
    scrollToDiff: function(diff) {
        $('html, body').animate({
            scrollTop: $('pre.left div.line' + diff.path1.line + ' span.code').offset().top
        }, 0);
    },

    /**
     * Process the specified diff
     */
    processDiffs: function() {
         var left = [];
         var right = [];

        _.each(jdd.diffs, function(diff, index) {
            $('pre.left div.line' + diff.path1.line + ' span.code').addClass(diff.type).addClass('diff');
            if (_.indexOf(left, diff.path1.line) === -1) {
                $('pre.left div.line' + diff.path1.line + ' span.code').click(function() {
                    jdd.handleDiffClick(diff.path1.line, jdd.LEFT);
                });
                left.push(diff.path1.line);
            }

            $('pre.right div.line' + diff.path2.line + ' span.code').addClass(diff.type).addClass('diff');
            if (_.indexOf(right, diff.path2.line) === -1) {
                $('pre.right div.line' + diff.path2.line + ' span.code').click(function() {
                    jdd.handleDiffClick(diff.path2.line, jdd.RIGHT);
                });
                right.push(diff.path2.line);
            }
        });

        jdd.diffs = jdd.diffs.sort(function(a, b) {
            return a.path1.line - b.path1.line;
        });

    },

    /**
     * Validate the input against the JSON parser
     */
    validateInput: function(json, side) {
         try {
            var result = jsl.parser.parse(json);

            if (side === jdd.LEFT) {
                $('#errorLeft').text('').hide();
                $('#textarealeft').removeClass('error');
            } else {
                $('#errorRight').text('').hide();
                $('#textarearight').removeClass('error');
            }

            return true;
        } catch (parseException) {
            if (side === jdd.LEFT) {
                $('#errorLeft').text(parseException.message).show();
                $('#textarealeft').addClass('error');
            } else {
                $('#errorRight').text(parseException.message).show();
                $('#textarearight').addClass('error');
            }
            return false;
        }
    },

    /**
     * Handle the file uploads
     */
    handleFiles: function(files, side) {
        var reader = new FileReader();

        reader.onload = (function(theFile) {
            return function(e) {
                if (side === jdd.LEFT) {
                    $('#textarealeft').val(e.target.result);
                } else {
                    $('#textarearight').val(e.target.result);
                }
            };
        })(files[0]);
        
        reader.readAsText(files[0]);
    },
    
    setupNewDiff: function() {
        $('div.initContainer').show();
        $('div.diffcontainer').hide();
        $('div.diffcontainer pre').text('');
        $('ul.toolbar').text('');
    },

    /**
     * Generate the report section with the diff
     */
    generateReport: function() {
         var report = $('#report');

        report.text('');

        var newDiff = $('<button>Perform a new diff</button>');
        report.append(newDiff);
        newDiff.click(function() {
            jdd.setupNewDiff();
        });

        if (jdd.diffs.length === 0) {
            report.append('<span>The two files were semantically  identical.</span>');
            return;
        }

        var typeCount = 0;
        var eqCount = 0;
        var missingCount = 0;

        _.each(jdd.diffs, function(diff) {
            if (diff.type === jdd.EQUALITY) {
                eqCount++;
            } else if (diff.type === jdd.MISSING) {
                missingCount++;
            } else if (diff.type === jdd.TYPE) {
                typeCount++;
            }
        });

        var title = $('<div class="reportTitle"></div>');
        if (jdd.diffs.length === 1) {
            title.text('Found ' + (jdd.diffs.length) + ' difference');
        } else {
            title.text('Found ' + (jdd.diffs.length) + ' differences');
        }
        
        report.prepend(title);

        var filterBlock = $('<span class="filterBlock">Show:</span>');

        /*
         * The missing checkbox
         */
        if (missingCount > 0) {
            var missing = $('<label><input id="showMissing" type="checkbox" name="checkbox" value="value" checked="true"></label>');
            if (missingCount === 1) {
                missing.append(missingCount + ' missing property');
            } else {
                missing.append(missingCount + ' missing properties');
            }
            missing.children('input').click(function() {
                if (!$(this).prop('checked')) {
                    $('span.code.diff.missing').addClass('missing_off').removeClass('missing');
                } else {
                    $('span.code.diff.missing_off').addClass('missing').removeClass('missing_off');
                }
            });
            filterBlock.append(missing);
        }

        /*
         * The types checkbox
         */
        if (typeCount > 0) {
            var types = $('<label><input id="showTypes" type="checkbox" name="checkbox" value="value" checked="true"></label>');
            if (typeCount === 1) {
                types.append(typeCount + ' incorrect type');
            } else {
                types.append(typeCount + ' incorrect types');
            }
    
            types.children('input').click(function() {
                if (!$(this).prop('checked')) {
                    $('span.code.diff.type').addClass('type_off').removeClass('type');
                } else {
                    $('span.code.diff.type_off').addClass('type').removeClass('type_off');
                }
            });
            filterBlock.append(types);
        }

        /*
         * The equals checkbox
         */
        if (eqCount > 0) {
            var eq = $('<label><input id="showEq" type="checkbox" name="checkbox" value="value" checked="true"></label>');
            if (eqCount === 1) {
                eq.append(eqCount + ' unequal value');
            } else {
                eq.append(eqCount + ' unequal values');
            }
            eq.children('input').click(function() {
                if (!$(this).prop('checked')) {
                    $('span.code.diff.eq').addClass('eq_off').removeClass('eq');
                } else {
                    $('span.code.diff.eq_off').addClass('eq').removeClass('eq_off');
                }
            });
            filterBlock.append(eq);
        }

        report.append(filterBlock);


    },

    /**
     * Implement the compare button and complete the compare process
     */
    compare: function() {

        if (jdd.requestCount !== 0) {
            /*
             * This means we have a pending request and we just need to wait for that to finish.
             */
            return;
        }

        $('body').addClass('progress');
        $('#compare').prop('disabled', true);
        
        var loadUrl = function(id, errId) {
            if ($('#' + id).val().trim().substring(0, 4).toLowerCase() === 'http') {
                jdd.requestCount++;
                $.post('proxy.php', 
                       {
                           'url': $('#' + id).val().trim()
                       }, function (responseObj) {
                           if (responseObj.error) {
                               $('#' + errId).text(responseObj.result).show();
                               $('#' + id).addClass('error');
                               $('body').removeClass('progress');
                               $('#compare').prop('disabled', false);
                           } else {
                               $('#' + id).val(responseObj.content);
                                jdd.requestCount--;
                                jdd.compare();
                            }
                       }, 'json');
                return true;
            } else {
                return false;
            }
        };
        
        if (loadUrl('textarealeft', 'errorLeft')) {
            return;
        }
        
        if (loadUrl('textarearight', 'errorRight')) {
            return;
        }

        /*
         * We'll start by running the text through JSONlint since it gives
         * much better error messages.
         */
         var leftValid = jdd.validateInput($('#textarealeft').val(), jdd.LEFT);
         var rightValid = jdd.validateInput($('#textarearight').val(), jdd.RIGHT);

        if (!leftValid || !rightValid) {
            $('body').removeClass('progress');
            $('#compare').prop('disabled', false);
            return;
        }

        $('div.initContainer').hide();
        $('div.diffcontainer').show();

        jdd.diffs = [];

        var left = JSON.parse($('#textarealeft').val());
        var right = JSON.parse($('#textarearight').val());

        
        var config = jdd.createConfig();
        jdd.formatAndDecorate(config, left);
        $('#out').text(config.out);
        
        var config2 = jdd.createConfig();
        jdd.formatAndDecorate(config2, right);
        $('#out2').text(config2.out);

        jdd.formatPRETags();
    
        config.currentPath = [];
        config2.currentPath = [];
    
        jdd.diffVal(left, config, right, config2);
        jdd.processDiffs();
        jdd.generateReport();
        
        //console.log('diffs: ' + JSON.stringify(jdd.diffs));

        if (jdd.diffs.length > 0) {
            jdd.highlightDiff(0);
            jdd.currentDiff = 0;
            jdd.updateButtonStyles();
        }

        $('body').removeClass('progress');
        $('#compare').prop('disabled', false);

        /*
         * We want to switch the toolbar bar between fixed and absolute position when you 
         * scroll so you can get the maximum number of toolbar items.
         */
        var toolbarTop = $('#toolbar').offset().top - 15;
        $(window).scroll(function() {
            if (toolbarTop < $(window).scrollTop()) {
                $('#toolbar').css('position', 'fixed').css('top', '10px');
            } else {
                $('#toolbar').css('position', 'absolute').css('top', '');
            }
        });

    },

    /**
     * Load in the sample data
     */
    loadSampleData: function() {
         $('#textarealeft').val('{"Aidan Gillen": {"array": ["Game of Thron\\"es","The Wire"],"string": "some string","int": 2,"aboolean": true, "boolean": true,"object": {"foo": "bar","object1": {"new prop1": "new prop value"},"object2": {"new prop1": "new prop value"},"object3": {"new prop1": "new prop value"},"object4": {"new prop1": "new prop value"}}},"Amy Ryan": {"one": "In Treatment","two": "The Wire"},"Annie Fitzgerald": ["Big Love","True Blood"],"Anwan Glover": ["Treme","The Wire"],"Alexander Skarsgard": ["Generation Kill","True Blood"], "Clarke Peters": null}');
/*$('#textarealeft').val('[{  "OBJ_ID": "CN=Kate Smith,OU=Users,OU=Willow,DC=cloudaddc,DC=qalab,DC=cam,DC=novell,DC=com",  "userAccountControl": "512",  "objectGUID": "b3067a77-875b-4208-9ee3-39128adeb654",  "lastLogon": "0",  "sAMAccountName": "ksmith",  "userPrincipalName": "ksmith@cloudaddc.qalab.cam.novell.com",  "distinguishedName": "CN=Kate Smith,OU=Users,OU=Willow,DC=cloudaddc,DC=qalab,DC=cam,DC=novell,DC=com"},{  "OBJ_ID": "CN=Timothy Swan,OU=Users,OU=Willow,DC=cloudaddc,DC=qalab,DC=cam,DC=novell,DC=com",  "userAccountControl": "512",  "objectGUID": "c3f7dae9-9b4f-4d55-a1ec-bf9ef45061c3",  "lastLogon": "130766915788304915",  "sAMAccountName": "tswan",  "userPrincipalName": "tswan@cloudaddc.qalab.cam.novell.com",  "distinguishedName": "CN=Timothy Swan,OU=Users,OU=Willow,DC=cloudaddc,DC=qalab,DC=cam,DC=novell,DC=com"}]');
$('#textarearight').val('{"foo":[{  "OBJ_ID": "CN=Timothy Swan,OU=Users,OU=Willow,DC=cloudaddc,DC=qalab,DC=cam,DC=novell,DC=com",  "userAccountControl": "512",  "objectGUID": "c3f7dae9-9b4f-4d55-a1ec-bf9ef45061c3",  "lastLogon": "130766915788304915",  "sAMAccountName": "tswan",  "userPrincipalName": "tswan@cloudaddc.qalab.cam.novell.com",  "distinguishedName": "CN=Timothy Swan,OU=Users,OU=Willow,DC=cloudaddc,DC=qalab,DC=cam,DC=novell,DC=com"}]}');*/
         $('#textarearight').val('{"Aidan Gillen": {"array": ["Game of Thrones","The Wire"],"string": "some string","int": "2","otherint": 4, "aboolean": "true", "boolean": false,"object": {"foo": "bar"}},"Amy Ryan": ["In Treatment","The Wire"],"Annie Fitzgerald": ["True Blood","Big Love","The Sopranos","Oz"],"Anwan Glover": ["Treme","The Wire"],"Alexander Skarsg?rd": ["Generation Kill","True Blood"],"Alice Farmer": ["The Corner","Oz","The Wire"]}');
    },
    
    getParameterByName: function(name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)'),
            results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }
};



jQuery(document).ready(function() {
    $('#compare').click(function() {
        jdd.compare();
    });
    
    if (jdd.getParameterByName('left')) {
        $('#textarealeft').val(jdd.getParameterByName('left'));
    }
    
    if (jdd.getParameterByName('right')) {
        $('#textarearight').val(jdd.getParameterByName('right'));
    }
    
    if (jdd.getParameterByName('left') && jdd.getParameterByName('right')) {
        jdd.compare();
    }
    

    $('#sample').click(function(e) {
        e.preventDefault();
        jdd.loadSampleData();
    });

    $(document).keydown(function(event) {
        if (event.keyCode === 78 || event.keyCode === 39) {
            /*
             * The N key or right arrow key
             */
            jdd.highlightNextDiff();
        } else if (event.keyCode === 80 || event.keyCode === 37) {
            /*
             * The P key or left arrow key
             */
            jdd.highlightPrevDiff();
        }
    });
});


/*** EXPORTS FROM exports-loader ***/
module.exports = jdd;
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(22)))

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(module) {/* Jison generated parser */
var jsonlint = (function(){
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"JSONString":3,"STRING":4,"JSONNumber":5,"NUMBER":6,"JSONNullLiteral":7,"NULL":8,"JSONBooleanLiteral":9,"TRUE":10,"FALSE":11,"JSONText":12,"JSONValue":13,"EOF":14,"JSONObject":15,"JSONArray":16,"{":17,"}":18,"JSONMemberList":19,"JSONMember":20,":":21,",":22,"[":23,"]":24,"JSONElementList":25,"$accept":0,"$end":1},
terminals_: {2:"error",4:"STRING",6:"NUMBER",8:"NULL",10:"TRUE",11:"FALSE",14:"EOF",17:"{",18:"}",21:":",22:",",23:"[",24:"]"},
productions_: [0,[3,1],[5,1],[7,1],[9,1],[9,1],[12,2],[13,1],[13,1],[13,1],[13,1],[13,1],[13,1],[15,2],[15,3],[20,3],[19,1],[19,3],[16,2],[16,3],[25,1],[25,3]],
performAction: function anonymous(yytext,yyleng,yylineno,yy,yystate,$$,_$) {

var $0 = $$.length - 1;
switch (yystate) {
case 1: // replace escaped characters with actual character
          this.$ = yytext.replace(/\\(\\|")/g, "$"+"1")
                     .replace(/\\n/g,'\n')
                     .replace(/\\r/g,'\r')
                     .replace(/\\t/g,'\t')
                     .replace(/\\v/g,'\v')
                     .replace(/\\f/g,'\f')
                     .replace(/\\b/g,'\b');
        
break;
case 2:this.$ = Number(yytext);
break;
case 3:this.$ = null;
break;
case 4:this.$ = true;
break;
case 5:this.$ = false;
break;
case 6:return this.$ = $$[$0-1];
break;
case 13:this.$ = {};
break;
case 14:this.$ = $$[$0-1];
break;
case 15:this.$ = [$$[$0-2], $$[$0]];
break;
case 16:this.$ = {}; this.$[$$[$0][0]] = $$[$0][1];
break;
case 17:this.$ = $$[$0-2]; $$[$0-2][$$[$0][0]] = $$[$0][1];
break;
case 18:this.$ = [];
break;
case 19:this.$ = $$[$0-1];
break;
case 20:this.$ = [$$[$0]];
break;
case 21:this.$ = $$[$0-2]; $$[$0-2].push($$[$0]);
break;
}
},
table: [{3:5,4:[1,12],5:6,6:[1,13],7:3,8:[1,9],9:4,10:[1,10],11:[1,11],12:1,13:2,15:7,16:8,17:[1,14],23:[1,15]},{1:[3]},{14:[1,16]},{14:[2,7],18:[2,7],22:[2,7],24:[2,7]},{14:[2,8],18:[2,8],22:[2,8],24:[2,8]},{14:[2,9],18:[2,9],22:[2,9],24:[2,9]},{14:[2,10],18:[2,10],22:[2,10],24:[2,10]},{14:[2,11],18:[2,11],22:[2,11],24:[2,11]},{14:[2,12],18:[2,12],22:[2,12],24:[2,12]},{14:[2,3],18:[2,3],22:[2,3],24:[2,3]},{14:[2,4],18:[2,4],22:[2,4],24:[2,4]},{14:[2,5],18:[2,5],22:[2,5],24:[2,5]},{14:[2,1],18:[2,1],21:[2,1],22:[2,1],24:[2,1]},{14:[2,2],18:[2,2],22:[2,2],24:[2,2]},{3:20,4:[1,12],18:[1,17],19:18,20:19},{3:5,4:[1,12],5:6,6:[1,13],7:3,8:[1,9],9:4,10:[1,10],11:[1,11],13:23,15:7,16:8,17:[1,14],23:[1,15],24:[1,21],25:22},{1:[2,6]},{14:[2,13],18:[2,13],22:[2,13],24:[2,13]},{18:[1,24],22:[1,25]},{18:[2,16],22:[2,16]},{21:[1,26]},{14:[2,18],18:[2,18],22:[2,18],24:[2,18]},{22:[1,28],24:[1,27]},{22:[2,20],24:[2,20]},{14:[2,14],18:[2,14],22:[2,14],24:[2,14]},{3:20,4:[1,12],20:29},{3:5,4:[1,12],5:6,6:[1,13],7:3,8:[1,9],9:4,10:[1,10],11:[1,11],13:30,15:7,16:8,17:[1,14],23:[1,15]},{14:[2,19],18:[2,19],22:[2,19],24:[2,19]},{3:5,4:[1,12],5:6,6:[1,13],7:3,8:[1,9],9:4,10:[1,10],11:[1,11],13:31,15:7,16:8,17:[1,14],23:[1,15]},{18:[2,17],22:[2,17]},{18:[2,15],22:[2,15]},{22:[2,21],24:[2,21]}],
defaultActions: {16:[2,6]},
parseError: function parseError(str, hash) {
    throw new Error(str);
},
parse: function parse(input) {
    var self = this,
        stack = [0],
        vstack = [null], // semantic value stack
        lstack = [], // location stack
        table = this.table,
        yytext = '',
        yylineno = 0,
        yyleng = 0,
        recovering = 0,
        TERROR = 2,
        EOF = 1;

    //this.reductionCount = this.shiftCount = 0;

    this.lexer.setInput(input);
    this.lexer.yy = this.yy;
    this.yy.lexer = this.lexer;
    if (typeof this.lexer.yylloc == 'undefined')
        this.lexer.yylloc = {};
    var yyloc = this.lexer.yylloc;
    lstack.push(yyloc);

    if (typeof this.yy.parseError === 'function')
        this.parseError = this.yy.parseError;

    function popStack (n) {
        stack.length = stack.length - 2*n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }

    function lex() {
        var token;
        token = self.lexer.lex() || 1; // $end = 1
        // if token isn't its numeric value, convert
        if (typeof token !== 'number') {
            token = self.symbols_[token] || token;
        }
        return token;
    }

    var symbol, preErrorSymbol, state, action, a, r, yyval={},p,len,newState, expected;
    while (true) {
        // retreive state number from top of stack
        state = stack[stack.length-1];

        // use default actions if available
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol == null)
                symbol = lex();
            // read action for current state and first input
            action = table[state] && table[state][symbol];
        }

        // handle parse error
        _handle_error:
        if (typeof action === 'undefined' || !action.length || !action[0]) {

            if (!recovering) {
                // Report error
                expected = [];
                for (p in table[state]) if (this.terminals_[p] && p > 2) {
                    expected.push("'"+this.terminals_[p]+"'");
                }
                var errStr = '';
                if (this.lexer.showPosition) {
                    errStr = 'Parse error on line '+(yylineno+1)+":\n"+this.lexer.showPosition()+"\nExpecting "+expected.join(', ') + ", got '" + this.terminals_[symbol]+ "'";
                } else {
                    errStr = 'Parse error on line '+(yylineno+1)+": Unexpected " +
                                  (symbol == 1 /*EOF*/ ? "end of input" :
                                              ("'"+(this.terminals_[symbol] || symbol)+"'"));
                }
                this.parseError(errStr,
                    {text: this.lexer.match, token: this.terminals_[symbol] || symbol, line: this.lexer.yylineno, loc: yyloc, expected: expected});
            }

            // just recovered from another error
            if (recovering == 3) {
                if (symbol == EOF) {
                    throw new Error(errStr || 'Parsing halted.');
                }

                // discard current lookahead and grab another
                yyleng = this.lexer.yyleng;
                yytext = this.lexer.yytext;
                yylineno = this.lexer.yylineno;
                yyloc = this.lexer.yylloc;
                symbol = lex();
            }

            // try to recover from error
            while (1) {
                // check for error recovery rule in this state
                if ((TERROR.toString()) in table[state]) {
                    break;
                }
                if (state == 0) {
                    throw new Error(errStr || 'Parsing halted.');
                }
                popStack(1);
                state = stack[stack.length-1];
            }

            preErrorSymbol = symbol; // save the lookahead token
            symbol = TERROR;         // insert generic error symbol as new lookahead
            state = stack[stack.length-1];
            action = table[state] && table[state][TERROR];
            recovering = 3; // allow 3 real symbols to be shifted before reporting a new error
        }

        // this shouldn't happen, unless resolve defaults are off
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error('Parse Error: multiple actions possible at state: '+state+', token: '+symbol);
        }

        switch (action[0]) {

            case 1: // shift
                //this.shiftCount++;

                stack.push(symbol);
                vstack.push(this.lexer.yytext);
                lstack.push(this.lexer.yylloc);
                stack.push(action[1]); // push state
                symbol = null;
                if (!preErrorSymbol) { // normal execution/no error
                    yyleng = this.lexer.yyleng;
                    yytext = this.lexer.yytext;
                    yylineno = this.lexer.yylineno;
                    yyloc = this.lexer.yylloc;
                    if (recovering > 0)
                        recovering--;
                } else { // error just occurred, resume old lookahead f/ before error
                    symbol = preErrorSymbol;
                    preErrorSymbol = null;
                }
                break;

            case 2: // reduce
                //this.reductionCount++;

                len = this.productions_[action[1]][1];

                // perform semantic action
                yyval.$ = vstack[vstack.length-len]; // default to $$ = $1
                // default location, uses first token for firsts, last for lasts
                yyval._$ = {
                    first_line: lstack[lstack.length-(len||1)].first_line,
                    last_line: lstack[lstack.length-1].last_line,
                    first_column: lstack[lstack.length-(len||1)].first_column,
                    last_column: lstack[lstack.length-1].last_column
                };
                r = this.performAction.call(yyval, yytext, yyleng, yylineno, this.yy, action[1], vstack, lstack);

                if (typeof r !== 'undefined') {
                    return r;
                }

                // pop off stack
                if (len) {
                    stack = stack.slice(0,-1*len*2);
                    vstack = vstack.slice(0, -1*len);
                    lstack = lstack.slice(0, -1*len);
                }

                stack.push(this.productions_[action[1]][0]);    // push nonterminal (reduce)
                vstack.push(yyval.$);
                lstack.push(yyval._$);
                // goto new state = table[STATE][NONTERMINAL]
                newState = table[stack[stack.length-2]][stack[stack.length-1]];
                stack.push(newState);
                break;

            case 3: // accept
                return true;
        }

    }

    return true;
}};
/* Jison generated lexer */
var lexer = (function(){
var lexer = ({EOF:1,
parseError:function parseError(str, hash) {
        if (this.yy.parseError) {
            this.yy.parseError(str, hash);
        } else {
            throw new Error(str);
        }
    },
setInput:function (input) {
        this._input = input;
        this._more = this._less = this.done = false;
        this.yylineno = this.yyleng = 0;
        this.yytext = this.matched = this.match = '';
        this.conditionStack = ['INITIAL'];
        this.yylloc = {first_line:1,first_column:0,last_line:1,last_column:0};
        return this;
    },
input:function () {
        var ch = this._input[0];
        this.yytext+=ch;
        this.yyleng++;
        this.match+=ch;
        this.matched+=ch;
        var lines = ch.match(/\n/);
        if (lines) this.yylineno++;
        this._input = this._input.slice(1);
        return ch;
    },
unput:function (ch) {
        this._input = ch + this._input;
        return this;
    },
more:function () {
        this._more = true;
        return this;
    },
less:function (n) {
        this._input = this.match.slice(n) + this._input;
    },
pastInput:function () {
        var past = this.matched.substr(0, this.matched.length - this.match.length);
        return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
    },
upcomingInput:function () {
        var next = this.match;
        if (next.length < 20) {
            next += this._input.substr(0, 20-next.length);
        }
        return (next.substr(0,20)+(next.length > 20 ? '...':'')).replace(/\n/g, "");
    },
showPosition:function () {
        var pre = this.pastInput();
        var c = new Array(pre.length + 1).join("-");
        return pre + this.upcomingInput() + "\n" + c+"^";
    },
next:function () {
        if (this.done) {
            return this.EOF;
        }
        if (!this._input) this.done = true;

        var token,
            match,
            tempMatch,
            index,
            col,
            lines;
        if (!this._more) {
            this.yytext = '';
            this.match = '';
        }
        var rules = this._currentRules();
        for (var i=0;i < rules.length; i++) {
            tempMatch = this._input.match(this.rules[rules[i]]);
            if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
                match = tempMatch;
                index = i;
                if (!this.options.flex) break;
            }
        }
        if (match) {
            lines = match[0].match(/\n.*/g);
            if (lines) this.yylineno += lines.length;
            this.yylloc = {first_line: this.yylloc.last_line,
                           last_line: this.yylineno+1,
                           first_column: this.yylloc.last_column,
                           last_column: lines ? lines[lines.length-1].length-1 : this.yylloc.last_column + match[0].length}
            this.yytext += match[0];
            this.match += match[0];
            this.yyleng = this.yytext.length;
            this._more = false;
            this._input = this._input.slice(match[0].length);
            this.matched += match[0];
            token = this.performAction.call(this, this.yy, this, rules[index],this.conditionStack[this.conditionStack.length-1]);
            if (this.done && this._input) this.done = false;
            if (token) return token;
            else return;
        }
        if (this._input === "") {
            return this.EOF;
        } else {
            this.parseError('Lexical error on line '+(this.yylineno+1)+'. Unrecognized text.\n'+this.showPosition(), 
                    {text: "", token: null, line: this.yylineno});
        }
    },
lex:function lex() {
        var r = this.next();
        if (typeof r !== 'undefined') {
            return r;
        } else {
            return this.lex();
        }
    },
begin:function begin(condition) {
        this.conditionStack.push(condition);
    },
popState:function popState() {
        return this.conditionStack.pop();
    },
_currentRules:function _currentRules() {
        return this.conditions[this.conditionStack[this.conditionStack.length-1]].rules;
    },
topState:function () {
        return this.conditionStack[this.conditionStack.length-2];
    },
pushState:function begin(condition) {
        this.begin(condition);
    }});
lexer.options = {};
lexer.performAction = function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {

var YYSTATE=YY_START
switch($avoiding_name_collisions) {
case 0:/* skip whitespace */
break;
case 1:return 6
break;
case 2:yy_.yytext = yy_.yytext.substr(1,yy_.yyleng-2); return 4
break;
case 3:return 17
break;
case 4:return 18
break;
case 5:return 23
break;
case 6:return 24
break;
case 7:return 22
break;
case 8:return 21
break;
case 9:return 10
break;
case 10:return 11
break;
case 11:return 8
break;
case 12:return 14
break;
case 13:return 'INVALID'
break;
}
};
lexer.rules = [/^(?:\s+)/,/^(?:(-?([0-9]|[1-9][0-9]+))(\.[0-9]+)?([eE][-+]?[0-9]+)?\b)/,/^(?:"(?:\\[\\"bfnrt/]|\\u[a-fA-F0-9]{4}|[^\\\0-\x09\x0a-\x1f"])*")/,/^(?:\{)/,/^(?:\})/,/^(?:\[)/,/^(?:\])/,/^(?:,)/,/^(?::)/,/^(?:true\b)/,/^(?:false\b)/,/^(?:null\b)/,/^(?:$)/,/^(?:.)/];
lexer.conditions = {"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,9,10,11,12,13],"inclusive":true}};


;
return lexer;})()
parser.lexer = lexer;
return parser;
})();
if (true) {
exports.parser = jsonlint;
exports.parse = function () { return jsonlint.parse.apply(jsonlint, arguments); }
exports.main = function commonjsMain(args) {
    if (!args[1])
        throw new Error('Usage: '+args[0]+' FILE');
    if (typeof process !== 'undefined') {
        var source = __webpack_require__(0).readFileSync(__webpack_require__(1).join(process.cwd(), args[1]), "utf8");
    } else {
        var cwd = __webpack_require__(2).path(__webpack_require__(2).cwd());
        var source = cwd.join(args[1]).read({charset: "utf-8"});
    }
    return exports.parser.parse(source);
}
if (typeof module !== 'undefined' && __webpack_require__.c[__webpack_require__.s] === module) {
  exports.main(typeof process !== 'undefined' ? process.argv.slice(1) : __webpack_require__(21).args);
}
}
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(24)(module)))

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Iteration = __webpack_require__(4);
var ArrayIterator = __webpack_require__(3);

module.exports = ObjectIterator;
function ObjectIterator(iterable, start, stop, step) {
    this.object = iterable;
    this.keysIterator = new ArrayIterator(Object.keys(iterable), start, stop, step);
}

ObjectIterator.prototype.next = function () {
    var iteration = this.keysIterator.next();
    if (iteration.done) {
        return iteration;
    }
    var key = iteration.value;
    return new Iteration(this.object[key], false, key);
};



/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var ArrayIterator = __webpack_require__(3);
var ObjectIterator = __webpack_require__(12);

module.exports = iterate;
function iterate(iterable, start, stop, step) {
    if (!iterable) {
        return empty;
    } else if (Array.isArray(iterable)) {
        return new ArrayIterator(iterable, start, stop, step);
    } else if (typeof iterable.next === "function") {
        return iterable;
    } else if (typeof iterable.iterate === "function") {
        return iterable.iterate(start, stop, step);
    } else if (typeof iterable === "object") {
        return new ObjectIterator(iterable);
    } else {
        throw new TypeError("Can't iterate " + iterable);
    }
}



/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*eslint no-console:[0]*/
/*global console*/


var Q = __webpack_require__(5);
var URL = __webpack_require__(6);
var Identifier = __webpack_require__(16);
var Module = __webpack_require__(18);
var Resource = __webpack_require__(20);
var parseDependencies = __webpack_require__(19);
var compile = __webpack_require__(15);
var has = Object.prototype.hasOwnProperty;

module.exports = System;

function System(location, description, options) {
    var self = this;
    options = options || {};
    description = description || {};
    self.name = description.name || "";
    self.location = location;
    self.description = description;
    self.dependencies = {};
    self.main = null;
    self.resources = options.resources || {}; // by system.name / module.id
    self.modules = options.modules || {}; // by system.name/module.id
    self.systemLocations = options.systemLocations || {}; // by system.name;
    self.systems = options.systems || {}; // by system.name
    self.systemLoadedPromises = options.systemLoadedPromises || {}; // by system.name
    self.buildSystem = options.buildSystem; // or self if undefined
    self.strategy = options.strategy || 'nested';
    self.analyzers = {js: self.analyzeJavaScript};
    self.compilers = {js: self.compileJavaScript};
    self.translators = {json: self.translateJson};
    self.internalRedirects = {};
    self.externalRedirects = {};
    self.node = !!options.node;
    self.browser = !!options.browser;
    self.parent = options.parent;
    self.root = options.root || self;
    // TODO options.optimize
    // TODO options.instrument
    self.systems[self.name] = self;
    self.systemLocations[self.name] = self.location;
    self.systemLoadedPromises[self.name] = Q(self);

    if (options.name != null && options.name !== description.name) {
        console.warn(
            "Package loaded by name " + JSON.stringify(options.name) +
            " bears name " + JSON.stringify(description.name)
        );
    }

    // The main property of the description can only create an internal
    // redirect, as such it normalizes absolute identifiers to relative.
    // All other redirects, whether from internal or external identifiers, can
    // redirect to either internal or external identifiers.
    self.main = description.main || "index.js";
    self.internalRedirects[".js"] = "./" + Identifier.resolve(self.main, "");

    // Overlays:
    if (options.browser) { self.overlayBrowser(description); }
    if (options.node) { self.overlayNode(description); }

    // Dependencies:
    if (description.dependencies) {
        self.addDependencies(description.dependencies);
    }
    if (self.root === self && description.devDependencies) {
        self.addDependencies(description.devDependencies);
    }

    // Local per-extension overrides:
    if (description.extensions) { self.addExtensions(description.extensions); }
    if (description.translators) { self.addTranslators(description.translators); }
    if (description.analyzers) { self.addAnalyzers(description.analyzers); }
    if (description.compilers) { self.addCompilers(description.compilers); }
    if (description.redirects) { self.addRedirects(description.redirects); }
}

System.load = function loadSystem(location, options) {
    var self = this;
    return self.prototype.loadSystemDescription(location, "<anonymous>")
    .then(function (description) {
        return new self(location, description, options);
    });
};

System.prototype.import = function importModule(rel, abs) {
    var self = this;
    return self.load(rel, abs)
    .then(function onModuleLoaded() {
        self.root.main = self.lookup(rel, abs);
        return self.require(rel, abs);
    });
};

// system.require(rel, abs) must be called only after the module and its
// transitive dependencies have been loaded, as guaranteed by system.load(rel,
// abs)
System.prototype.require = function require(rel, abs) {
    var self = this;

    // Apart from resolving relative identifiers, this also normalizes absolute
    // identifiers.
    var res = Identifier.resolve(rel, abs);
    if (Identifier.isAbsolute(rel)) {
        if (self.externalRedirects[res] === false) {
            return {};
        }
        if (self.externalRedirects[res]) {
            return self.require(self.externalRedirects[res], res);
        }
        var head = Identifier.head(rel);
        var tail = Identifier.tail(rel);
        if (self.dependencies[head]) {
            return self.getSystem(head, abs).requireInternalModule(tail, abs);
        } else if (self.modules[head]) {
            return self.requireInternalModule(rel, abs, self.modules[rel]);
        } else {
            var via = abs ? " via " + JSON.stringify(abs) : "";
            throw new Error("Can't require " + JSON.stringify(rel) + via + " in " + JSON.stringify(self.name));
        }
    } else {
        return self.requireInternalModule(rel, abs);
    }
};

System.prototype.requireInternalModule = function requireInternalModule(rel, abs, module) {
    var self = this;

    var res = Identifier.resolve(rel, abs);
    var id = self.normalizeIdentifier(res);
    if (self.internalRedirects[id]) {
        return self.require(self.internalRedirects[id], id);
    }

    module = module || self.lookupInternalModule(id);

    // check for load error
    if (module.error) {
        var error = module.error;
        var via = abs ? " via " + JSON.stringify(abs) : "";
        error.message = (
            "Can't require module " + JSON.stringify(module.id) +
            via +
            " in " + JSON.stringify(self.name || self.location) +
            " because " + error.message
        );
        throw error;
    }

    // do not reinitialize modules
    if (module.exports != null) {
        return module.exports;
    }

    // do not initialize modules that do not define a factory function
    if (typeof module.factory !== "function") {
        throw new Error(
            "Can't require module " + JSON.stringify(module.filename) +
            ". No exports. No exports factory."
        );
    }

    module.require = self.makeRequire(module.id, self.root.main);
    module.exports = {};

    // Execute the factory function:
    module.factory.call(
        // in the context of the module:
        null, // this (defaults to global, except in strict mode)
        module.require,
        module.exports,
        module,
        module.filename,
        module.dirname
    );

    return module.exports;
};

System.prototype.makeRequire = function makeRequire(abs, main) {
    var self = this;
    function require(rel) {
        return self.require(rel, abs);
    }
    require.main = main;
    return require;
};

// System:

// Should only be called if the system is known to have already been loaded by
// system.loadSystem.
System.prototype.getSystem = function getSystem(rel, abs) {
    var via;
    var hasDependency = this.dependencies[rel];
    if (!hasDependency) {
        via = abs ? " via " + JSON.stringify(abs) : "";
        throw new Error(
            "Can't get dependency " + JSON.stringify(rel) +
            " in package named " + JSON.stringify(this.name) + via
        );
    }
    var dependency = this.systems[rel];
    if (!dependency) {
        via = abs ? " via " + JSON.stringify(abs) : "";
        throw new Error(
            "Can't get dependency " + JSON.stringify(rel) +
            " in package named " + JSON.stringify(this.name) + via
        );
    }
    return dependency;
};

System.prototype.loadSystem = function (name, abs) {
    var self = this;
    //var hasDependency = self.dependencies[name];
    //if (!hasDependency) {
    //    var error = new Error("Can't load module " + JSON.stringify(name));
    //    error.module = true;
    //    throw error;
    //}
    var loadingSystem = self.systemLoadedPromises[name];
    if (!loadingSystem) {
        loadingSystem = self.actuallyLoadSystem(name, abs);
        self.systemLoadedPromises[name] = loadingSystem;
    }
    return loadingSystem;
};

System.prototype.loadSystemDescription = function loadSystemDescription(location, name) {
    var self = this;
    var descriptionLocation = URL.resolve(location, "package.json");
    return self.read(descriptionLocation, "utf-8", "application/json")
    .then(function (json) {
        try {
            return JSON.parse(json);
        } catch (error) {
            error.message = error.message + " in " +
                JSON.stringify(descriptionLocation);
            throw error;
        }
    }, function (error) {
        error.message = "Can't load package " + JSON.stringify(name) + " at " +
            JSON.stringify(location) + " because " + error.message;
        throw error;
    });
};

System.prototype.actuallyLoadSystem = function (name, abs) {
    var self = this;
    var System = self.constructor;
    var location = self.systemLocations[name];
    if (!location) {
        var via = abs ? " via " + JSON.stringify(abs) : "";
        throw new Error(
            "Can't load package " + JSON.stringify(name) + via +
            " because it is not a declared dependency"
        );
    }
    var buildSystem;
    if (self.buildSystem) {
        buildSystem = self.buildSystem.actuallyLoadSystem(name, abs);
    }
    return Q.all([
        self.loadSystemDescription(location, name),
        buildSystem
    ]).spread(function onDescriptionAndBuildSystem(description, buildSystem) {
        var system = new System(location, description, {
            parent: self,
            root: self.root,
            name: name,
            resources: self.resources,
            modules: self.modules,
            systems: self.systems,
            systemLocations: self.systemLocations,
            systemLoadedPromises: self.systemLoadedPromises,
            buildSystem: buildSystem,
            browser: self.browser,
            node: self.node,
            strategy: inferStrategy(description)
        });
        self.systems[system.name] = system;
        return system;
    });
};

System.prototype.getBuildSystem = function getBuildSystem() {
    var self = this;
    return self.buildSystem || self;
};

// Module:

System.prototype.normalizeIdentifier = function (id) {
    var self = this;
    var extension = Identifier.extension(id);
    if (
        !has.call(self.translators, extension) &&
        !has.call(self.analyzers, extension) &&
        !has.call(self.compilers, extension) &&
        extension !== "js" &&
        extension !== "json"
    ) {
        id += ".js";
    }
    return id;
};

System.prototype.load = function load(rel, abs) {
    var self = this;
    return self.deepLoad(rel, abs)
    .then(function () {
        return self.deepCompile(rel, abs, {});
    });
};

System.prototype.deepCompile = function deepCompile(rel, abs, memo) {
    var self = this;

    var res = Identifier.resolve(rel, abs);
    if (Identifier.isAbsolute(rel)) {
        if (self.externalRedirects[res]) {
            return self.deepCompile(self.externalRedirects[res], res, memo);
        }
        var head = Identifier.head(rel);
        var tail = Identifier.tail(rel);
        if (self.dependencies[head]) {
            var system = self.getSystem(head, abs);
            return system.compileInternalModule(tail, "", memo);
        } else {
            // XXX no clear idea what to do in this load case.
            // Should never reject, but should cause require to produce an
            // error.
            return Q();
        }
    } else {
        return self.compileInternalModule(rel, abs, memo);
    }
};

System.prototype.compileInternalModule = function compileInternalModule(rel, abs, memo) {
    var self = this;

    var res = Identifier.resolve(rel, abs);
    var id = self.normalizeIdentifier(res);
    if (self.internalRedirects[id]) {
        return self.deepCompile(self.internalRedirects[id], "", memo);
    }
    var module = self.lookupInternalModule(id, abs);

    // Break the cycle of violence
    if (memo[module.key]) {
        return Q();
    }
    memo[module.key] = true;

    if (module.compiled) {
        return Q();
    }
    module.compiled = true;
    return Q.try(function () {
        return Q.all(module.dependencies.map(function (dependency) {
            return self.deepCompile(dependency, module.id, memo);
        }));
    }).then(function () {
        return self.translate(module);
    }).then(function () {
        return self.compile(module);
    }).catch(function (error) {
        module.error = error;
    });
};

// Loads a module and its transitive dependencies.
System.prototype.deepLoad = function deepLoad(rel, abs, memo) {
    var self = this;
    var res = Identifier.resolve(rel, abs);
    if (Identifier.isAbsolute(rel)) {
        if (self.externalRedirects[res]) {
            return self.deepLoad(self.externalRedirects[res], res, memo);
        }
        var head = Identifier.head(rel);
        var tail = Identifier.tail(rel);
        if (self.dependencies[head]) {
            return self.loadSystem(head, abs).invoke("loadInternalModule", tail, "", memo);
        } else {
            // XXX no clear idea what to do in this load case.
            // Should never reject, but should cause require to produce an
            // error.
            return Q();
        }
    } else {
        return self.loadInternalModule(rel, abs, memo);
    }
};

System.prototype.loadInternalModule = function loadInternalModule(rel, abs, memo) {
    var self = this;

    var res = Identifier.resolve(rel, abs);
    var id = self.normalizeIdentifier(res);
    if (self.internalRedirects[id]) {
        return self.deepLoad(self.internalRedirects[id], "", memo);
    }

    // Extension must be captured before normalization since it is used to
    // determine whether to attempt to fallback to index.js for identifiers
    // that might refer to directories.
    var extension = Identifier.extension(res);

    var module = self.lookupInternalModule(id, abs);

    // Break the cycle of violence
    memo = memo || {};
    if (memo[module.key]) {
        return Q();
    }
    memo[module.key] = true;

    // Return a memoized load
    if (module.loadedPromise) {
        return module.loadedPromise;
    }
    module.loadedPromise = Q.try(function () {
        if (module.factory == null && module.exports == null) {
            return self.read(module.location, "utf-8")
            .then(function (text) {
                module.text = text;
                return self.finishLoadingModule(module, memo);
            }, fallback);
        }
    });

    function fallback(error) {
        var redirect = Identifier.resolve("./index.js", res);
        module.redirect = redirect;
        if (!error || error.notFound && extension === "") {
            return self.loadInternalModule(redirect, abs, memo)
            .catch(function (fallbackError) {
                module.redirect = null;
                // Prefer the original error
                module.error = error || fallbackError;
            });
        } else {
            module.error = error;
        }
    }

    return module.loadedPromise;
};

System.prototype.finishLoadingModule = function finishLoadingModule(module, memo) {
    var self = this;
    return Q.try(function () {
        return self.analyze(module);
    }).then(function () {
        return Q.all(module.dependencies.map(function onDependency(dependency) {
            return self.deepLoad(dependency, module.id, memo);
        }));
    });
};

System.prototype.lookup = function lookup(rel, abs) {
    var self = this;
    var res = Identifier.resolve(rel, abs);
    if (Identifier.isAbsolute(rel)) {
        if (self.externalRedirects[res]) {
            return self.lookup(self.externalRedirects[res], res);
        }
        var head = Identifier.head(res);
        var tail = Identifier.tail(res);
        if (self.dependencies[head]) {
            return self.getSystem(head, abs).lookupInternalModule(tail, "");
        } else if (self.modules[head] && !tail) {
            return self.modules[head];
        } else {
            var via = abs ? " via " + JSON.stringify(abs) : "";
            throw new Error(
                "Can't look up " + JSON.stringify(rel) + via +
                " in " + JSON.stringify(self.location) +
                " because there is no external module or dependency by that name"
            );
        }
    } else {
        return self.lookupInternalModule(rel, abs);
    }
};

System.prototype.lookupInternalModule = function lookupInternalModule(rel, abs) {
    var self = this;

    var res = Identifier.resolve(rel, abs);
    var id = self.normalizeIdentifier(res);

    if (self.internalRedirects[id]) {
        return self.lookup(self.internalRedirects[id], res);
    }

    var filename = self.name + "/" + id;
    // This module system is case-insensitive, but mandates that a module must
    // be consistently identified by the same case convention to avoid problems
    // when migrating to case-sensitive file systems.
    var key = filename.toLowerCase();
    var module = self.modules[key];

    if (module && module.redirect && module.redirect !== module.id) {
        return self.lookupInternalModule(module.redirect);
    }

    if (!module) {
        module = new Module();
        module.id = id;
        module.extension = Identifier.extension(id);
        module.location = URL.resolve(self.location, id);
        module.filename = filename;
        module.dirname = Identifier.dirname(filename);
        module.key = key;
        module.system = self;
        module.modules = self.modules;
        self.modules[key] = module;
    }

    if (module.filename !== filename) {
        module.error = new Error(
            "Can't refer to single module with multiple case conventions: " +
            JSON.stringify(filename) + " and " +
            JSON.stringify(module.filename)
        );
    }

    return module;
};

System.prototype.addExtensions = function (map) {
    var extensions = Object.keys(map);
    for (var index = 0; index < extensions.length; index++) {
        var extension = extensions[index];
        var id = map[extension];
        this.analyzers[extension] = this.makeLoadStep(id, "analyze");
        this.translators[extension] = this.makeLoadStep(id, "translate");
        this.compilers[extension] = this.makeLoadStep(id, "compile");
    }
};

System.prototype.makeLoadStep = function makeLoadStep(id, name) {
    var self = this;
    return function moduleLoaderStep(module) {
        return self.getBuildSystem()
        .import(id)
        .then(function (exports) {
            if (exports[name]) {
                return exports[name](module);
            }
        });
    };
};

// Translate:

System.prototype.translate = function translate(module) {
    var self = this;
    if (
        module.text != null &&
        module.extension != null &&
        self.translators[module.extension]
    ) {
        return self.translators[module.extension](module);
    }
};

System.prototype.addTranslators = function addTranslators(translators) {
    var self = this;
    var extensions = Object.keys(translators);
    for (var index = 0; index < extensions.length; index++) {
        var extension = extensions[index];
        var id = translators[extension];
        self.addTranslator(extension, id);
    }
};

System.prototype.addTranslator = function (extension, id) {
    var self = this;
    self.translators[extension] = self.makeTranslator(id);
};

System.prototype.makeTranslator = function makeTranslator(id) {
    var self = this;
    return function translate(module) {
        return self.getBuildSystem()
        .import(id)
        .then(function onTranslatorImported(translate) {
            if (typeof translate !== "function") {
                throw new Error(
                    "Can't translate " + JSON.stringify(module.id) +
                    " because " + JSON.stringify(id) + " did not export a function"
                );
            }
            module.extension = "js";
            return translate(module);
        });
    };
};

// Analyze:

System.prototype.analyze = function analyze(module) {
    if (
        module.text != null &&
        module.extension != null &&
        this.analyzers[module.extension]
    ) {
        return this.analyzers[module.extension](module);
    }
};

System.prototype.analyzeJavaScript = function analyzeJavaScript(module) {
    module.dependencies.push.apply(module.dependencies, parseDependencies(module.text));
};

System.prototype.addAnalyzers = function addAnalyzers(analyzers) {
    var self = this;
    var extensions = Object.keys(analyzers);
    for (var index = 0; index < extensions.length; index++) {
        var extension = extensions[index];
        var id = analyzers[extension];
        self.addAnalyzer(extension, id);
    }
};

System.prototype.addAnalyzer = function (extension, id) {
    var self = this;
    self.analyzers[extension] = self.makeAnalyzer(id);
};

System.prototype.makeAnalyzer = function makeAnalyzer(id) {
    var self = this;
    return function analyze(module) {
        return self.getBuildSystem()
        .import(id)
        .then(function onAnalyzerImported(analyze) {
            if (typeof analyze !== "function") {
                throw new Error(
                    "Can't analyze " + JSON.stringify(module.id) +
                    " because " + JSON.stringify(id) + " did not export a function"
                );
            }
            return analyze(module);
        });
    };
};

// Compile:

System.prototype.compile = function (module) {
    var self = this;
    if (
        module.factory == null &&
        module.redirect == null &&
        module.exports == null &&
        module.extension != null &&
        self.compilers[module.extension]
    ) {
        return self.compilers[module.extension](module);
    }
};

System.prototype.compileJavaScript = function compileJavaScript(module) {
    return compile(module);
};

System.prototype.translateJson = function translateJson(module) {
    module.text = "module.exports = " + module.text.trim() + ";\n";
};

System.prototype.addCompilers = function addCompilers(compilers) {
    var self = this;
    var extensions = Object.keys(compilers);
    for (var index = 0; index < extensions.length; index++) {
        var extension = extensions[index];
        var id = compilers[extension];
        self.addCompiler(extension, id);
    }
};

System.prototype.addCompiler = function (extension, id) {
    var self = this;
    self.compilers[extension] = self.makeCompiler(id);
};

System.prototype.makeCompiler = function makeCompiler(id) {
    var self = this;
    return function compile(module) {
        return self.getBuildSystem()
        .import(id)
        .then(function (compile) {
            return compile(module);
        });
    };
};

// Resource:

System.prototype.getResource = function getResource(rel, abs) {
    var self = this;
    if (Identifier.isAbsolute(rel)) {
        var head = Identifier.head(rel);
        var tail = Identifier.tail(rel);
        return self.getSystem(head, abs).getInternalResource(tail);
    } else {
        return self.getInternalResource(Identifier.resolve(rel, abs));
    }
};

System.prototype.locateResource = function locateResource(rel, abs) {
    var self = this;
    if (Identifier.isAbsolute(rel)) {
        var head = Identifier.head(rel);
        var tail = Identifier.tail(rel);
        return self.loadSystem(head, abs)
        .then(function onSystemLoaded(subsystem) {
            return subsystem.getInternalResource(tail);
        });
    } else {
        return Q(self.getInternalResource(Identifier.resolve(rel, abs)));
    }
};

System.prototype.getInternalResource = function getInternalResource(id) {
    var self = this;
    // TODO redirects
    var filename = self.name + "/" + id;
    var key = filename.toLowerCase();
    var resource = self.resources[key];
    if (!resource) {
        resource = new Resource();
        resource.id = id;
        resource.filename = filename;
        resource.dirname = Identifier.dirname(filename);
        resource.key = key;
        resource.location = URL.resolve(self.location, id);
        resource.system = self;
        self.resources[key] = resource;
    }
    return resource;
};

// Dependencies:

System.prototype.addDependencies = function addDependencies(dependencies) {
    var self = this;
    var names = Object.keys(dependencies);
    for (var index = 0; index < names.length; index++) {
        var name = names[index];
        self.dependencies[name] = true;
        if (!self.systemLocations[name]) {
            var location;
            if (this.strategy === 'flat') {
                location = URL.resolve(self.root.location, "node_modules/" + name + "/");
            } else {
                location = URL.resolve(self.location, "node_modules/" + name + "/");
            }
            self.systemLocations[name] = location;
        }
    }
};

// Redirects:

System.prototype.addRedirects = function addRedirects(redirects) {
    var self = this;
    var sources = Object.keys(redirects);
    for (var index = 0; index < sources.length; index++) {
        var source = sources[index];
        var target = redirects[source];
        self.addRedirect(source, target);
    }
};

System.prototype.addRedirect = function addRedirect(source, target) {
    var self = this;
    if (Identifier.isAbsolute(source)) {
        self.externalRedirects[source] = target;
    } else {
        source = self.normalizeIdentifier(Identifier.resolve(source));
        self.internalRedirects[source] = target;
    }
};

// Etc:

System.prototype.overlayBrowser = function overlayBrowser(description) {
    var self = this;
    if (typeof description.browser === "string") {
        self.addRedirect("", description.browser);
    } else if (description.browser && typeof description.browser === "object") {
        self.addRedirects(description.browser);
    }
};

System.prototype.inspect = function () {
    var self = this;
    return {type: "system", location: self.location};
};

function inferStrategy(description) {
    // The existence of an _args property in package.json distinguishes
    // packages that were installed with npm version 3 or higher.
    if (description._args) {
        return 'flat';
    }
    return 'nested';
}


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = compile;

// By using a named "eval" most browsers will execute in the global scope.
// http://www.davidflanagan.com/2010/12/global-eval-in.html
// Unfortunately execScript doesn't always return the value of the evaluated expression (at least in Chrome)
var globalEval = /*this.execScript ||*/eval;
// For Firebug evaled code isn't debuggable otherwise
// http://code.google.com/p/fbug/issues/detail?id=2198
if (global.navigator && global.navigator.userAgent.indexOf("Firefox") >= 0) {
    globalEval = new Function("_", "return eval(_)");
}

function compile(module) {

    // Here we use a couple tricks to make debugging better in various browsers:
    // TODO: determine if these are all necessary / the best options
    // 1. name the function with something inteligible since some debuggers display the first part of each eval (Firebug)
    // 2. append the "//# sourceURL=filename" hack (Safari, Chrome, Firebug)
    //  * http://pmuellr.blogspot.com/2009/06/debugger-friendly.html
    //  * http://blog.getfirebug.com/2009/08/11/give-your-eval-a-name-with-sourceurl/
    //      TODO: investigate why this isn't working in Firebug.
    // 3. set displayName property on the factory function (Safari, Chrome)

    var displayName = module.filename.replace(/[^\w\d]|^\d/g, "_");

    try {
        module.factory = globalEval(
            "(function " +
            displayName +
             "(require, exports, module, __filename, __dirname) {" +
            module.text +
            "//*/\n})\n//# sourceURL=" +
            module.system.location + module.id
        );
    } catch (exception) {
        exception.message = exception.message + " in " + module.filename;
        throw exception;
    }

    // This should work and would be simpler, but Firebug does not show scripts executed via "new Function()" constructor.
    // TODO: sniff browser?
    // module.factory = new Function("require", "exports", "module", module.text + "\n//*/"+sourceURLComment);

    module.factory.displayName = module.filename;
}


/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.isAbsolute = isAbsolute;
function isAbsolute(path) {
    return (
        path !== "" &&
        path.lastIndexOf("./", 0) < 0 &&
        path.lastIndexOf("../", 0) < 0
    );
}

exports.isBare = isBare;
function isBare(id) {
    var lastSlash = id.lastIndexOf("/");
    return id.indexOf(".", lastSlash) < 0;
}

// TODO @user/name package names

exports.head = head;
function head(id) {
    var firstSlash = id.indexOf("/");
    if (firstSlash < 0) { return id; }
    return id.slice(0, firstSlash);
}

exports.tail = tail;
function tail(id) {
    var firstSlash = id.indexOf("/");
    if (firstSlash < 0) { return ""; }
    return id.slice(firstSlash + 1);
}

exports.extension = extension;
function extension(id) {
    var lastSlash = id.lastIndexOf("/");
    var lastDot = id.lastIndexOf(".");
    if (lastDot <= lastSlash) { return ""; }
    return id.slice(lastDot + 1);
}

exports.dirname = dirname;
function dirname(id) {
    var lastSlash = id.lastIndexOf("/");
    if (lastSlash < 0) {
        return id;
    }
    return id.slice(0, lastSlash);
}

exports.basename = basename;
function basename(id) {
    var lastSlash = id.lastIndexOf("/");
    if (lastSlash < 0) {
        return id;
    }
    return id.slice(lastSlash + 1);
}

exports.resolve = resolve;
function resolve(rel, abs) {
    abs = abs || "";
    var source = rel.split("/");
    var target = [];
    var parts;
    if (source.length && source[0] === "." || source[0] === "..") {
        parts = abs.split("/");
        parts.pop();
        source.unshift.apply(source, parts);
    }
    for (var index = 0; index < source.length; index++) {
        if (source[index] === "..") {
            if (target.length) {
                target.pop();
            }
        } else if (source[index] !== "" && source[index] !== ".") {
            target.push(source[index]);
        }
    }
    return target.join("/");
}


/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*eslint-env node*/


var URL = __webpack_require__(6);

exports.current = function current() {
    return URL.resolve("file:///", process.cwd() + "/");
};

exports.toPath = function toPath(location) {
    var parsed = URL.parse(location);
    return parsed.path;
};

exports.fromFile = function fromFile(path) {
    var self = this;
    return URL.resolve(self.current(), path);
};

exports.fromDirectory = function fromDirectory(path) {
    var self = this;
    if (path.indexOf("/", path.length - 1) < 0) {
        path += "/";
    }
    path = self.fromFile(path);
    return path;
};


/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = Module;

function Module() {
    this.id = null;
    this.extension = null;
    this.system = null;
    this.key = null;
    this.filename = null;
    this.dirname = null;
    this.exports = null;
    this.redirect = null;
    this.text = null;
    this.factory = null;
    this.dependencies = [];
    this.loadedPromise = null;
    // for bundles
    this.index = null;
    this.bundled = false;
}


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = parseDependencies;
function parseDependencies(text) {
    var dependsUpon = {};
    String(text).replace(/(?:^|[^\w\$_.])require\s*\(\s*["']([^"']*)["']\s*\)/g, function(_, id) {
        dependsUpon[id] = true;
    });
    return Object.keys(dependsUpon);
}


/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = Resource;

function Resource() {
    this.id = null;
    this.filename = null;
    this.dirname = null;
    this.key = null;
    this.location = null;
    this.system = null;
}


/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*eslint-env node*/


var Q = __webpack_require__(5);
var FS = __webpack_require__(0);
var Path = __webpack_require__(1);
var Location = __webpack_require__(17);
var CommonSystem = __webpack_require__(14);

var node = [
    "child_process",
    "cluster",
    "crypto",
    "dns",
    "domain",
    "event_emitter",
    "fs",
    "http",
    "https",
    "net",
    "os",
    "path",
    "punycode",
    "querystring",
    "readline",
    "repl",
    "smalloc",
    "stream",
    "string_decoder",
    "tls",
    "tty",
    "url",
    "util",
    "vm",
    "zlib"
];

module.exports = NodeSystem;

function NodeSystem(location, description, options) {
    var self = this;
    CommonSystem.call(self, location, description, options);
}

NodeSystem.prototype = Object.create(CommonSystem.prototype);
NodeSystem.prototype.constructor = NodeSystem;

NodeSystem.load = CommonSystem.load;

NodeSystem.prototype.read = function read(location, charset) {
    var path = Location.toPath(location);
    return Q.ninvoke(FS, "readFile", path, charset || "utf8")
    .catch(function (error) {
        if (error.code === "ENOENT") {
            error.notFound = true;
        }
        throw error;
    });
};

NodeSystem.prototype.overlayNode = function overlayNode() {
    var self = this;
    node.forEach(function (id) {
        self.modules[id] = {factory: function (require, exports, module) {
            module.exports = require(id);
        }};
    });
};

NodeSystem.findSystem = function findSystem(directory) {
    var self = this;
    if (directory === Path.dirname(directory)) {
        return Q.reject(new Error("Can't find package"));
    }
    var descriptionLocation = Path.join(directory, "package.json");
    return Q.ninvoke(FS, "stat", descriptionLocation)
    .then(function (stat) {
        return stat.isFile();
    }, function () {
        return false;
    }).then(function (isFile) {
        if (isFile) {
            return directory;
        } else {
            return self.findSystem(Path.dirname(directory));
        }
    });
};

NodeSystem.findSystemLocationAndModuleId = function findSystemLocationAndModuleId(path) {
    var self = this;
    path = Path.resolve(process.cwd(), path);
    var directory = Path.dirname(path);
    return self.findSystem(directory)
    .then(function (packageDirectory) {
        var modulePath = Path.relative(packageDirectory, path);
        return {
            location: Location.fromDirectory(packageDirectory),
            id: "./" + modulePath
        };
    }, function () {
        throw new Error("Can't find package " + JSON.stringify(path));
    });
};


/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;//     Underscore.js 1.8.3
//     http://underscorejs.org
//     (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind,
    nativeCreate       = Object.create;

  // Naked function reference for surrogate-prototype-swapping.
  var Ctor = function(){};

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object.
  if (true) {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.8.3';

  // Internal function that returns an efficient (for current engines) version
  // of the passed-in callback, to be repeatedly applied in other Underscore
  // functions.
  var optimizeCb = function(func, context, argCount) {
    if (context === void 0) return func;
    switch (argCount == null ? 3 : argCount) {
      case 1: return function(value) {
        return func.call(context, value);
      };
      case 2: return function(value, other) {
        return func.call(context, value, other);
      };
      case 3: return function(value, index, collection) {
        return func.call(context, value, index, collection);
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(context, accumulator, value, index, collection);
      };
    }
    return function() {
      return func.apply(context, arguments);
    };
  };

  // A mostly-internal function to generate callbacks that can be applied
  // to each element in a collection, returning the desired result — either
  // identity, an arbitrary callback, a property matcher, or a property accessor.
  var cb = function(value, context, argCount) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return optimizeCb(value, context, argCount);
    if (_.isObject(value)) return _.matcher(value);
    return _.property(value);
  };
  _.iteratee = function(value, context) {
    return cb(value, context, Infinity);
  };

  // An internal function for creating assigner functions.
  var createAssigner = function(keysFunc, undefinedOnly) {
    return function(obj) {
      var length = arguments.length;
      if (length < 2 || obj == null) return obj;
      for (var index = 1; index < length; index++) {
        var source = arguments[index],
            keys = keysFunc(source),
            l = keys.length;
        for (var i = 0; i < l; i++) {
          var key = keys[i];
          if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
        }
      }
      return obj;
    };
  };

  // An internal function for creating a new object that inherits from another.
  var baseCreate = function(prototype) {
    if (!_.isObject(prototype)) return {};
    if (nativeCreate) return nativeCreate(prototype);
    Ctor.prototype = prototype;
    var result = new Ctor;
    Ctor.prototype = null;
    return result;
  };

  var property = function(key) {
    return function(obj) {
      return obj == null ? void 0 : obj[key];
    };
  };

  // Helper for collection methods to determine whether a collection
  // should be iterated as an array or as an object
  // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
  // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
  var getLength = property('length');
  var isArrayLike = function(collection) {
    var length = getLength(collection);
    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
  };

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles raw objects in addition to array-likes. Treats all
  // sparse array-likes as if they were dense.
  _.each = _.forEach = function(obj, iteratee, context) {
    iteratee = optimizeCb(iteratee, context);
    var i, length;
    if (isArrayLike(obj)) {
      for (i = 0, length = obj.length; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {
      var keys = _.keys(obj);
      for (i = 0, length = keys.length; i < length; i++) {
        iteratee(obj[keys[i]], keys[i], obj);
      }
    }
    return obj;
  };

  // Return the results of applying the iteratee to each element.
  _.map = _.collect = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length,
        results = Array(length);
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      results[index] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  // Create a reducing function iterating left or right.
  function createReduce(dir) {
    // Optimized iterator function as using arguments.length
    // in the main function will deoptimize the, see #1991.
    function iterator(obj, iteratee, memo, keys, index, length) {
      for (; index >= 0 && index < length; index += dir) {
        var currentKey = keys ? keys[index] : index;
        memo = iteratee(memo, obj[currentKey], currentKey, obj);
      }
      return memo;
    }

    return function(obj, iteratee, memo, context) {
      iteratee = optimizeCb(iteratee, context, 4);
      var keys = !isArrayLike(obj) && _.keys(obj),
          length = (keys || obj).length,
          index = dir > 0 ? 0 : length - 1;
      // Determine the initial value if none is provided.
      if (arguments.length < 3) {
        memo = obj[keys ? keys[index] : index];
        index += dir;
      }
      return iterator(obj, iteratee, memo, keys, index, length);
    };
  }

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`.
  _.reduce = _.foldl = _.inject = createReduce(1);

  // The right-associative version of reduce, also known as `foldr`.
  _.reduceRight = _.foldr = createReduce(-1);

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var key;
    if (isArrayLike(obj)) {
      key = _.findIndex(obj, predicate, context);
    } else {
      key = _.findKey(obj, predicate, context);
    }
    if (key !== void 0 && key !== -1) return obj[key];
  };

  // Return all the elements that pass a truth test.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    predicate = cb(predicate, context);
    _.each(obj, function(value, index, list) {
      if (predicate(value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, _.negate(cb(predicate)), context);
  };

  // Determine whether all of the elements match a truth test.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (!predicate(obj[currentKey], currentKey, obj)) return false;
    }
    return true;
  };

  // Determine if at least one element in the object matches a truth test.
  // Aliased as `any`.
  _.some = _.any = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (predicate(obj[currentKey], currentKey, obj)) return true;
    }
    return false;
  };

  // Determine if the array or object contains a given item (using `===`).
  // Aliased as `includes` and `include`.
  _.contains = _.includes = _.include = function(obj, item, fromIndex, guard) {
    if (!isArrayLike(obj)) obj = _.values(obj);
    if (typeof fromIndex != 'number' || guard) fromIndex = 0;
    return _.indexOf(obj, item, fromIndex) >= 0;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      var func = isFunc ? method : value[method];
      return func == null ? func : func.apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matcher(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matcher(attrs));
  };

  // Return the maximum element (or element-based computation).
  _.max = function(obj, iteratee, context) {
    var result = -Infinity, lastComputed = -Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value > result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iteratee, context) {
    var result = Infinity, lastComputed = Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value < result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed < lastComputed || computed === Infinity && result === Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Shuffle a collection, using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function(obj) {
    var set = isArrayLike(obj) ? obj : _.values(obj);
    var length = set.length;
    var shuffled = Array(length);
    for (var index = 0, rand; index < length; index++) {
      rand = _.random(0, index);
      if (rand !== index) shuffled[index] = shuffled[rand];
      shuffled[rand] = set[index];
    }
    return shuffled;
  };

  // Sample **n** random values from a collection.
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (!isArrayLike(obj)) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // Sort the object's values by a criterion produced by an iteratee.
  _.sortBy = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iteratee(value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) {
    return function(obj, iteratee, context) {
      var result = {};
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index) {
        var key = iteratee(value, index, obj);
        behavior(result, value, key);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key].push(value); else result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, value, key) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key]++; else result[key] = 1;
  });

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (isArrayLike(obj)) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return isArrayLike(obj) ? obj.length : _.keys(obj).length;
  };

  // Split a collection into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var pass = [], fail = [];
    _.each(obj, function(value, key, obj) {
      (predicate(value, key, obj) ? pass : fail).push(value);
    });
    return [pass, fail];
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[0];
    return _.initial(array, array.length - n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[array.length - 1];
    return _.rest(array, Math.max(0, array.length - n));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, n == null || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, strict, startIndex) {
    var output = [], idx = 0;
    for (var i = startIndex || 0, length = getLength(input); i < length; i++) {
      var value = input[i];
      if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
        //flatten current level of array or arguments object
        if (!shallow) value = flatten(value, shallow, strict);
        var j = 0, len = value.length;
        output.length += len;
        while (j < len) {
          output[idx++] = value[j++];
        }
      } else if (!strict) {
        output[idx++] = value;
      }
    }
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, false);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
    if (!_.isBoolean(isSorted)) {
      context = iteratee;
      iteratee = isSorted;
      isSorted = false;
    }
    if (iteratee != null) iteratee = cb(iteratee, context);
    var result = [];
    var seen = [];
    for (var i = 0, length = getLength(array); i < length; i++) {
      var value = array[i],
          computed = iteratee ? iteratee(value, i, array) : value;
      if (isSorted) {
        if (!i || seen !== computed) result.push(value);
        seen = computed;
      } else if (iteratee) {
        if (!_.contains(seen, computed)) {
          seen.push(computed);
          result.push(value);
        }
      } else if (!_.contains(result, value)) {
        result.push(value);
      }
    }
    return result;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(flatten(arguments, true, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var result = [];
    var argsLength = arguments.length;
    for (var i = 0, length = getLength(array); i < length; i++) {
      var item = array[i];
      if (_.contains(result, item)) continue;
      for (var j = 1; j < argsLength; j++) {
        if (!_.contains(arguments[j], item)) break;
      }
      if (j === argsLength) result.push(item);
    }
    return result;
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = flatten(arguments, true, true, 1);
    return _.filter(array, function(value){
      return !_.contains(rest, value);
    });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    return _.unzip(arguments);
  };

  // Complement of _.zip. Unzip accepts an array of arrays and groups
  // each array's elements on shared indices
  _.unzip = function(array) {
    var length = array && _.max(array, getLength).length || 0;
    var result = Array(length);

    for (var index = 0; index < length; index++) {
      result[index] = _.pluck(array, index);
    }
    return result;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    var result = {};
    for (var i = 0, length = getLength(list); i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // Generator function to create the findIndex and findLastIndex functions
  function createPredicateIndexFinder(dir) {
    return function(array, predicate, context) {
      predicate = cb(predicate, context);
      var length = getLength(array);
      var index = dir > 0 ? 0 : length - 1;
      for (; index >= 0 && index < length; index += dir) {
        if (predicate(array[index], index, array)) return index;
      }
      return -1;
    };
  }

  // Returns the first index on an array-like that passes a predicate test
  _.findIndex = createPredicateIndexFinder(1);
  _.findLastIndex = createPredicateIndexFinder(-1);

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iteratee, context) {
    iteratee = cb(iteratee, context, 1);
    var value = iteratee(obj);
    var low = 0, high = getLength(array);
    while (low < high) {
      var mid = Math.floor((low + high) / 2);
      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
    }
    return low;
  };

  // Generator function to create the indexOf and lastIndexOf functions
  function createIndexFinder(dir, predicateFind, sortedIndex) {
    return function(array, item, idx) {
      var i = 0, length = getLength(array);
      if (typeof idx == 'number') {
        if (dir > 0) {
            i = idx >= 0 ? idx : Math.max(idx + length, i);
        } else {
            length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
        }
      } else if (sortedIndex && idx && length) {
        idx = sortedIndex(array, item);
        return array[idx] === item ? idx : -1;
      }
      if (item !== item) {
        idx = predicateFind(slice.call(array, i, length), _.isNaN);
        return idx >= 0 ? idx + i : -1;
      }
      for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
        if (array[idx] === item) return idx;
      }
      return -1;
    };
  }

  // Return the position of the first occurrence of an item in an array,
  // or -1 if the item is not included in the array.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
  _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (stop == null) {
      stop = start || 0;
      start = 0;
    }
    step = step || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = Array(length);

    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Determines whether to execute a function as a constructor
  // or a normal function with the provided arguments
  var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
    var self = baseCreate(sourceFunc.prototype);
    var result = sourceFunc.apply(self, args);
    if (_.isObject(result)) return result;
    return self;
  };

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
    var args = slice.call(arguments, 2);
    var bound = function() {
      return executeBound(func, bound, context, this, args.concat(slice.call(arguments)));
    };
    return bound;
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder, allowing any combination of arguments to be pre-filled.
  _.partial = function(func) {
    var boundArgs = slice.call(arguments, 1);
    var bound = function() {
      var position = 0, length = boundArgs.length;
      var args = Array(length);
      for (var i = 0; i < length; i++) {
        args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return executeBound(func, bound, this, this, args);
    };
    return bound;
  };

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = function(obj) {
    var i, length = arguments.length, key;
    if (length <= 1) throw new Error('bindAll must be passed function names');
    for (i = 1; i < length; i++) {
      key = arguments[i];
      obj[key] = _.bind(obj[key], obj);
    }
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memoize = function(key) {
      var cache = memoize.cache;
      var address = '' + (hasher ? hasher.apply(this, arguments) : key);
      if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
      return cache[address];
    };
    memoize.cache = {};
    return memoize;
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){
      return func.apply(null, args);
    }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = _.partial(_.delay, _, 1);

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};
    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };
    return function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = _.now() - timestamp;

      if (last < wait && last >= 0) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          if (!timeout) context = args = null;
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      timestamp = _.now();
      var callNow = immediate && !timeout;
      if (!timeout) timeout = setTimeout(later, wait);
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a negated version of the passed-in predicate.
  _.negate = function(predicate) {
    return function() {
      return !predicate.apply(this, arguments);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var args = arguments;
    var start = args.length - 1;
    return function() {
      var i = start;
      var result = args[start].apply(this, arguments);
      while (i--) result = args[i].call(this, result);
      return result;
    };
  };

  // Returns a function that will only be executed on and after the Nth call.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Returns a function that will only be executed up to (but not including) the Nth call.
  _.before = function(times, func) {
    var memo;
    return function() {
      if (--times > 0) {
        memo = func.apply(this, arguments);
      }
      if (times <= 1) func = null;
      return memo;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = _.partial(_.before, 2);

  // Object Functions
  // ----------------

  // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
  var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
  var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
                      'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

  function collectNonEnumProps(obj, keys) {
    var nonEnumIdx = nonEnumerableProps.length;
    var constructor = obj.constructor;
    var proto = (_.isFunction(constructor) && constructor.prototype) || ObjProto;

    // Constructor is a special case.
    var prop = 'constructor';
    if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

    while (nonEnumIdx--) {
      prop = nonEnumerableProps[nonEnumIdx];
      if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
        keys.push(prop);
      }
    }
  }

  // Retrieve the names of an object's own properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve all the property names of an object.
  _.allKeys = function(obj) {
    if (!_.isObject(obj)) return [];
    var keys = [];
    for (var key in obj) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Returns the results of applying the iteratee to each element of the object
  // In contrast to _.map it returns an object
  _.mapObject = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys =  _.keys(obj),
          length = keys.length,
          results = {},
          currentKey;
      for (var index = 0; index < length; index++) {
        currentKey = keys[index];
        results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
      }
      return results;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = createAssigner(_.allKeys);

  // Assigns a given object with all the own properties in the passed-in object(s)
  // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
  _.extendOwn = _.assign = createAssigner(_.keys);

  // Returns the first key on an object that passes a predicate test
  _.findKey = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = _.keys(obj), key;
    for (var i = 0, length = keys.length; i < length; i++) {
      key = keys[i];
      if (predicate(obj[key], key, obj)) return key;
    }
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(object, oiteratee, context) {
    var result = {}, obj = object, iteratee, keys;
    if (obj == null) return result;
    if (_.isFunction(oiteratee)) {
      keys = _.allKeys(obj);
      iteratee = optimizeCb(oiteratee, context);
    } else {
      keys = flatten(arguments, false, false, 1);
      iteratee = function(value, key, obj) { return key in obj; };
      obj = Object(obj);
    }
    for (var i = 0, length = keys.length; i < length; i++) {
      var key = keys[i];
      var value = obj[key];
      if (iteratee(value, key, obj)) result[key] = value;
    }
    return result;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj, iteratee, context) {
    if (_.isFunction(iteratee)) {
      iteratee = _.negate(iteratee);
    } else {
      var keys = _.map(flatten(arguments, false, false, 1), String);
      iteratee = function(value, key) {
        return !_.contains(keys, key);
      };
    }
    return _.pick(obj, iteratee, context);
  };

  // Fill in a given object with default properties.
  _.defaults = createAssigner(_.allKeys, true);

  // Creates an object that inherits from the given prototype object.
  // If additional properties are provided then they will be added to the
  // created object.
  _.create = function(prototype, props) {
    var result = baseCreate(prototype);
    if (props) _.extendOwn(result, props);
    return result;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Returns whether an object has a given set of `key:value` pairs.
  _.isMatch = function(object, attrs) {
    var keys = _.keys(attrs), length = keys.length;
    if (object == null) return !length;
    var obj = Object(object);
    for (var i = 0; i < length; i++) {
      var key = keys[i];
      if (attrs[key] !== obj[key] || !(key in obj)) return false;
    }
    return true;
  };


  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className !== toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
      case '[object RegExp]':
      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return '' + a === '' + b;
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive.
        // Object(NaN) is equivalent to NaN
        if (+a !== +a) return +b !== +b;
        // An `egal` comparison is performed for other numeric values.
        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a === +b;
    }

    var areArrays = className === '[object Array]';
    if (!areArrays) {
      if (typeof a != 'object' || typeof b != 'object') return false;

      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
                               _.isFunction(bCtor) && bCtor instanceof bCtor)
                          && ('constructor' in a && 'constructor' in b)) {
        return false;
      }
    }
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

    // Initializing stack of traversed objects.
    // It's done here since we only need them for objects and arrays comparison.
    aStack = aStack || [];
    bStack = bStack || [];
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] === a) return bStack[length] === b;
    }

    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);

    // Recursively compare objects and arrays.
    if (areArrays) {
      // Compare array lengths to determine if a deep comparison is necessary.
      length = a.length;
      if (length !== b.length) return false;
      // Deep compare the contents, ignoring non-numeric properties.
      while (length--) {
        if (!eq(a[length], b[length], aStack, bStack)) return false;
      }
    } else {
      // Deep compare objects.
      var keys = _.keys(a), key;
      length = keys.length;
      // Ensure that both objects contain the same number of properties before comparing deep equality.
      if (_.keys(b).length !== length) return false;
      while (length--) {
        // Deep compare each member
        key = keys[length];
        if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return true;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
    return _.keys(obj).length === 0;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError.
  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) === '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE < 9), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return _.has(obj, 'callee');
    };
  }

  // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
  // IE 11 (#1621), and in Safari 8 (#1929).
  if (typeof /./ != 'function' && typeof Int8Array != 'object') {
    _.isFunction = function(obj) {
      return typeof obj == 'function' || false;
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj !== +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return obj != null && hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iteratees.
  _.identity = function(value) {
    return value;
  };

  // Predicate-generating functions. Often useful outside of Underscore.
  _.constant = function(value) {
    return function() {
      return value;
    };
  };

  _.noop = function(){};

  _.property = property;

  // Generates a function for a given object that returns a given property.
  _.propertyOf = function(obj) {
    return obj == null ? function(){} : function(key) {
      return obj[key];
    };
  };

  // Returns a predicate for checking whether an object has a given set of
  // `key:value` pairs.
  _.matcher = _.matches = function(attrs) {
    attrs = _.extendOwn({}, attrs);
    return function(obj) {
      return _.isMatch(obj, attrs);
    };
  };

  // Run a function **n** times.
  _.times = function(n, iteratee, context) {
    var accum = Array(Math.max(0, n));
    iteratee = optimizeCb(iteratee, context, 1);
    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function() {
    return new Date().getTime();
  };

   // List of HTML entities for escaping.
  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  };
  var unescapeMap = _.invert(escapeMap);

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  var createEscaper = function(map) {
    var escaper = function(match) {
      return map[match];
    };
    // Regexes for identifying a key that needs to be escaped
    var source = '(?:' + _.keys(map).join('|') + ')';
    var testRegexp = RegExp(source);
    var replaceRegexp = RegExp(source, 'g');
    return function(string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  };
  _.escape = createEscaper(escapeMap);
  _.unescape = createEscaper(unescapeMap);

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property, fallback) {
    var value = object == null ? void 0 : object[property];
    if (value === void 0) {
      value = fallback;
    }
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

  var escapeChar = function(match) {
    return '\\' + escapes[match];
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  // NB: `oldSettings` only exists for backwards compatibility.
  _.template = function(text, settings, oldSettings) {
    if (!settings && oldSettings) settings = oldSettings;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escaper, escapeChar);
      index = offset + match.length;

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }

      // Adobe VMs need the match returned to produce the correct offest.
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + 'return __p;\n';

    try {
      var render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled source as a convenience for precompilation.
    var argument = settings.variable || 'obj';
    template.source = 'function(' + argument + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function. Start chaining a wrapped Underscore object.
  _.chain = function(obj) {
    var instance = _(obj);
    instance._chain = true;
    return instance;
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(instance, obj) {
    return instance._chain ? _(obj).chain() : obj;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    _.each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result(this, func.apply(_, args));
      };
    });
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
      return result(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  _.each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result(this, method.apply(this._wrapped, arguments));
    };
  });

  // Extracts the result from a wrapped and chained object.
  _.prototype.value = function() {
    return this._wrapped;
  };

  // Provide unwrapping proxy for some methods used in engine operations
  // such as arithmetic and JSON stringification.
  _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

  _.prototype.toString = function() {
    return '' + this._wrapped;
  };

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (true) {
    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function() {
      return _;
    }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  }
}.call(this));


/***/ }),
/* 23 */
/***/ (function(module, exports) {

// Copyright (C) 2011 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Install a leaky WeakMap emulation on platforms that
 * don't provide a built-in one.
 *
 * <p>Assumes that an ES5 platform where, if {@code WeakMap} is
 * already present, then it conforms to the anticipated ES6
 * specification. To run this file on an ES5 or almost ES5
 * implementation where the {@code WeakMap} specification does not
 * quite conform, run <code>repairES5.js</code> first.
 *
 * <p>Even though WeakMapModule is not global, the linter thinks it
 * is, which is why it is in the overrides list below.
 *
 * <p>NOTE: Before using this WeakMap emulation in a non-SES
 * environment, see the note below about hiddenRecord.
 *
 * @author Mark S. Miller
 * @requires crypto, ArrayBuffer, Uint8Array, navigator, console
 * @overrides WeakMap, ses, Proxy
 * @overrides WeakMapModule
 */

/**
 * This {@code WeakMap} emulation is observably equivalent to the
 * ES-Harmony WeakMap, but with leakier garbage collection properties.
 *
 * <p>As with true WeakMaps, in this emulation, a key does not
 * retain maps indexed by that key and (crucially) a map does not
 * retain the keys it indexes. A map by itself also does not retain
 * the values associated with that map.
 *
 * <p>However, the values associated with a key in some map are
 * retained so long as that key is retained and those associations are
 * not overridden. For example, when used to support membranes, all
 * values exported from a given membrane will live for the lifetime
 * they would have had in the absence of an interposed membrane. Even
 * when the membrane is revoked, all objects that would have been
 * reachable in the absence of revocation will still be reachable, as
 * far as the GC can tell, even though they will no longer be relevant
 * to ongoing computation.
 *
 * <p>The API implemented here is approximately the API as implemented
 * in FF6.0a1 and agreed to by MarkM, Andreas Gal, and Dave Herman,
 * rather than the offially approved proposal page. TODO(erights):
 * upgrade the ecmascript WeakMap proposal page to explain this API
 * change and present to EcmaScript committee for their approval.
 *
 * <p>The first difference between the emulation here and that in
 * FF6.0a1 is the presence of non enumerable {@code get___, has___,
 * set___, and delete___} methods on WeakMap instances to represent
 * what would be the hidden internal properties of a primitive
 * implementation. Whereas the FF6.0a1 WeakMap.prototype methods
 * require their {@code this} to be a genuine WeakMap instance (i.e.,
 * an object of {@code [[Class]]} "WeakMap}), since there is nothing
 * unforgeable about the pseudo-internal method names used here,
 * nothing prevents these emulated prototype methods from being
 * applied to non-WeakMaps with pseudo-internal methods of the same
 * names.
 *
 * <p>Another difference is that our emulated {@code
 * WeakMap.prototype} is not itself a WeakMap. A problem with the
 * current FF6.0a1 API is that WeakMap.prototype is itself a WeakMap
 * providing ambient mutability and an ambient communications
 * channel. Thus, if a WeakMap is already present and has this
 * problem, repairES5.js wraps it in a safe wrappper in order to
 * prevent access to this channel. (See
 * PATCH_MUTABLE_FROZEN_WEAKMAP_PROTO in repairES5.js).
 */

/**
 * If this is a full <a href=
 * "http://code.google.com/p/es-lab/wiki/SecureableES5"
 * >secureable ES5</a> platform and the ES-Harmony {@code WeakMap} is
 * absent, install an approximate emulation.
 *
 * <p>If WeakMap is present but cannot store some objects, use our approximate
 * emulation as a wrapper.
 *
 * <p>If this is almost a secureable ES5 platform, then WeakMap.js
 * should be run after repairES5.js.
 *
 * <p>See {@code WeakMap} for documentation of the garbage collection
 * properties of this WeakMap emulation.
 */
(function WeakMapModule() {
  "use strict";

  if (typeof ses !== 'undefined' && ses.ok && !ses.ok()) {
    // already too broken, so give up
    return;
  }

  /**
   * In some cases (current Firefox), we must make a choice betweeen a
   * WeakMap which is capable of using all varieties of host objects as
   * keys and one which is capable of safely using proxies as keys. See
   * comments below about HostWeakMap and DoubleWeakMap for details.
   *
   * This function (which is a global, not exposed to guests) marks a
   * WeakMap as permitted to do what is necessary to index all host
   * objects, at the cost of making it unsafe for proxies.
   *
   * Do not apply this function to anything which is not a genuine
   * fresh WeakMap.
   */
  function weakMapPermitHostObjects(map) {
    // identity of function used as a secret -- good enough and cheap
    if (map.permitHostObjects___) {
      map.permitHostObjects___(weakMapPermitHostObjects);
    }
  }
  if (typeof ses !== 'undefined') {
    ses.weakMapPermitHostObjects = weakMapPermitHostObjects;
  }

  // IE 11 has no Proxy but has a broken WeakMap such that we need to patch
  // it using DoubleWeakMap; this flag tells DoubleWeakMap so.
  var doubleWeakMapCheckSilentFailure = false;

  // Check if there is already a good-enough WeakMap implementation, and if so
  // exit without replacing it.
  if (typeof WeakMap === 'function') {
    var HostWeakMap = WeakMap;
    // There is a WeakMap -- is it good enough?
    if (typeof navigator !== 'undefined' &&
        /Firefox/.test(navigator.userAgent)) {
      // We're now *assuming not*, because as of this writing (2013-05-06)
      // Firefox's WeakMaps have a miscellany of objects they won't accept, and
      // we don't want to make an exhaustive list, and testing for just one
      // will be a problem if that one is fixed alone (as they did for Event).

      // If there is a platform that we *can* reliably test on, here's how to
      // do it:
      //  var problematic = ... ;
      //  var testHostMap = new HostWeakMap();
      //  try {
      //    testHostMap.set(problematic, 1);  // Firefox 20 will throw here
      //    if (testHostMap.get(problematic) === 1) {
      //      return;
      //    }
      //  } catch (e) {}

    } else {
      // IE 11 bug: WeakMaps silently fail to store frozen objects.
      var testMap = new HostWeakMap();
      var testObject = Object.freeze({});
      testMap.set(testObject, 1);
      if (testMap.get(testObject) !== 1) {
        doubleWeakMapCheckSilentFailure = true;
        // Fall through to installing our WeakMap.
      } else {
        module.exports = WeakMap;
        return;
      }
    }
  }

  var hop = Object.prototype.hasOwnProperty;
  var gopn = Object.getOwnPropertyNames;
  var defProp = Object.defineProperty;
  var isExtensible = Object.isExtensible;

  /**
   * Security depends on HIDDEN_NAME being both <i>unguessable</i> and
   * <i>undiscoverable</i> by untrusted code.
   *
   * <p>Given the known weaknesses of Math.random() on existing
   * browsers, it does not generate unguessability we can be confident
   * of.
   *
   * <p>It is the monkey patching logic in this file that is intended
   * to ensure undiscoverability. The basic idea is that there are
   * three fundamental means of discovering properties of an object:
   * The for/in loop, Object.keys(), and Object.getOwnPropertyNames(),
   * as well as some proposed ES6 extensions that appear on our
   * whitelist. The first two only discover enumerable properties, and
   * we only use HIDDEN_NAME to name a non-enumerable property, so the
   * only remaining threat should be getOwnPropertyNames and some
   * proposed ES6 extensions that appear on our whitelist. We monkey
   * patch them to remove HIDDEN_NAME from the list of properties they
   * returns.
   *
   * <p>TODO(erights): On a platform with built-in Proxies, proxies
   * could be used to trap and thereby discover the HIDDEN_NAME, so we
   * need to monkey patch Proxy.create, Proxy.createFunction, etc, in
   * order to wrap the provided handler with the real handler which
   * filters out all traps using HIDDEN_NAME.
   *
   * <p>TODO(erights): Revisit Mike Stay's suggestion that we use an
   * encapsulated function at a not-necessarily-secret name, which
   * uses the Stiegler shared-state rights amplification pattern to
   * reveal the associated value only to the WeakMap in which this key
   * is associated with that value. Since only the key retains the
   * function, the function can also remember the key without causing
   * leakage of the key, so this doesn't violate our general gc
   * goals. In addition, because the name need not be a guarded
   * secret, we could efficiently handle cross-frame frozen keys.
   */
  var HIDDEN_NAME_PREFIX = 'weakmap:';
  var HIDDEN_NAME = HIDDEN_NAME_PREFIX + 'ident:' + Math.random() + '___';

  if (typeof crypto !== 'undefined' &&
      typeof crypto.getRandomValues === 'function' &&
      typeof ArrayBuffer === 'function' &&
      typeof Uint8Array === 'function') {
    var ab = new ArrayBuffer(25);
    var u8s = new Uint8Array(ab);
    crypto.getRandomValues(u8s);
    HIDDEN_NAME = HIDDEN_NAME_PREFIX + 'rand:' +
      Array.prototype.map.call(u8s, function(u8) {
        return (u8 % 36).toString(36);
      }).join('') + '___';
  }

  function isNotHiddenName(name) {
    return !(
        name.substr(0, HIDDEN_NAME_PREFIX.length) == HIDDEN_NAME_PREFIX &&
        name.substr(name.length - 3) === '___');
  }

  /**
   * Monkey patch getOwnPropertyNames to avoid revealing the
   * HIDDEN_NAME.
   *
   * <p>The ES5.1 spec requires each name to appear only once, but as
   * of this writing, this requirement is controversial for ES6, so we
   * made this code robust against this case. If the resulting extra
   * search turns out to be expensive, we can probably relax this once
   * ES6 is adequately supported on all major browsers, iff no browser
   * versions we support at that time have relaxed this constraint
   * without providing built-in ES6 WeakMaps.
   */
  defProp(Object, 'getOwnPropertyNames', {
    value: function fakeGetOwnPropertyNames(obj) {
      return gopn(obj).filter(isNotHiddenName);
    }
  });

  /**
   * getPropertyNames is not in ES5 but it is proposed for ES6 and
   * does appear in our whitelist, so we need to clean it too.
   */
  if ('getPropertyNames' in Object) {
    var originalGetPropertyNames = Object.getPropertyNames;
    defProp(Object, 'getPropertyNames', {
      value: function fakeGetPropertyNames(obj) {
        return originalGetPropertyNames(obj).filter(isNotHiddenName);
      }
    });
  }

  /**
   * <p>To treat objects as identity-keys with reasonable efficiency
   * on ES5 by itself (i.e., without any object-keyed collections), we
   * need to add a hidden property to such key objects when we
   * can. This raises several issues:
   * <ul>
   * <li>Arranging to add this property to objects before we lose the
   *     chance, and
   * <li>Hiding the existence of this new property from most
   *     JavaScript code.
   * <li>Preventing <i>certification theft</i>, where one object is
   *     created falsely claiming to be the key of an association
   *     actually keyed by another object.
   * <li>Preventing <i>value theft</i>, where untrusted code with
   *     access to a key object but not a weak map nevertheless
   *     obtains access to the value associated with that key in that
   *     weak map.
   * </ul>
   * We do so by
   * <ul>
   * <li>Making the name of the hidden property unguessable, so "[]"
   *     indexing, which we cannot intercept, cannot be used to access
   *     a property without knowing the name.
   * <li>Making the hidden property non-enumerable, so we need not
   *     worry about for-in loops or {@code Object.keys},
   * <li>monkey patching those reflective methods that would
   *     prevent extensions, to add this hidden property first,
   * <li>monkey patching those methods that would reveal this
   *     hidden property.
   * </ul>
   * Unfortunately, because of same-origin iframes, we cannot reliably
   * add this hidden property before an object becomes
   * non-extensible. Instead, if we encounter a non-extensible object
   * without a hidden record that we can detect (whether or not it has
   * a hidden record stored under a name secret to us), then we just
   * use the key object itself to represent its identity in a brute
   * force leaky map stored in the weak map, losing all the advantages
   * of weakness for these.
   */
  function getHiddenRecord(key) {
    if (key !== Object(key)) {
      throw new TypeError('Not an object: ' + key);
    }
    var hiddenRecord = key[HIDDEN_NAME];
    if (hiddenRecord && hiddenRecord.key === key) { return hiddenRecord; }
    if (!isExtensible(key)) {
      // Weak map must brute force, as explained in doc-comment above.
      return void 0;
    }

    // The hiddenRecord and the key point directly at each other, via
    // the "key" and HIDDEN_NAME properties respectively. The key
    // field is for quickly verifying that this hidden record is an
    // own property, not a hidden record from up the prototype chain.
    //
    // NOTE: Because this WeakMap emulation is meant only for systems like
    // SES where Object.prototype is frozen without any numeric
    // properties, it is ok to use an object literal for the hiddenRecord.
    // This has two advantages:
    // * It is much faster in a performance critical place
    // * It avoids relying on Object.create(null), which had been
    //   problematic on Chrome 28.0.1480.0. See
    //   https://code.google.com/p/google-caja/issues/detail?id=1687
    hiddenRecord = { key: key };

    // When using this WeakMap emulation on platforms where
    // Object.prototype might not be frozen and Object.create(null) is
    // reliable, use the following two commented out lines instead.
    // hiddenRecord = Object.create(null);
    // hiddenRecord.key = key;

    // Please contact us if you need this to work on platforms where
    // Object.prototype might not be frozen and
    // Object.create(null) might not be reliable.

    try {
      defProp(key, HIDDEN_NAME, {
        value: hiddenRecord,
        writable: false,
        enumerable: false,
        configurable: false
      });
      return hiddenRecord;
    } catch (error) {
      // Under some circumstances, isExtensible seems to misreport whether
      // the HIDDEN_NAME can be defined.
      // The circumstances have not been isolated, but at least affect
      // Node.js v0.10.26 on TravisCI / Linux, but not the same version of
      // Node.js on OS X.
      return void 0;
    }
  }

  /**
   * Monkey patch operations that would make their argument
   * non-extensible.
   *
   * <p>The monkey patched versions throw a TypeError if their
   * argument is not an object, so it should only be done to functions
   * that should throw a TypeError anyway if their argument is not an
   * object.
   */
  (function(){
    var oldFreeze = Object.freeze;
    defProp(Object, 'freeze', {
      value: function identifyingFreeze(obj) {
        getHiddenRecord(obj);
        return oldFreeze(obj);
      }
    });
    var oldSeal = Object.seal;
    defProp(Object, 'seal', {
      value: function identifyingSeal(obj) {
        getHiddenRecord(obj);
        return oldSeal(obj);
      }
    });
    var oldPreventExtensions = Object.preventExtensions;
    defProp(Object, 'preventExtensions', {
      value: function identifyingPreventExtensions(obj) {
        getHiddenRecord(obj);
        return oldPreventExtensions(obj);
      }
    });
  })();

  function constFunc(func) {
    func.prototype = null;
    return Object.freeze(func);
  }

  var calledAsFunctionWarningDone = false;
  function calledAsFunctionWarning() {
    // Future ES6 WeakMap is currently (2013-09-10) expected to reject WeakMap()
    // but we used to permit it and do it ourselves, so warn only.
    if (!calledAsFunctionWarningDone && typeof console !== 'undefined') {
      calledAsFunctionWarningDone = true;
      console.warn('WeakMap should be invoked as new WeakMap(), not ' +
          'WeakMap(). This will be an error in the future.');
    }
  }

  var nextId = 0;

  var OurWeakMap = function() {
    if (!(this instanceof OurWeakMap)) {  // approximate test for new ...()
      calledAsFunctionWarning();
    }

    // We are currently (12/25/2012) never encountering any prematurely
    // non-extensible keys.
    var keys = []; // brute force for prematurely non-extensible keys.
    var values = []; // brute force for corresponding values.
    var id = nextId++;

    function get___(key, opt_default) {
      var index;
      var hiddenRecord = getHiddenRecord(key);
      if (hiddenRecord) {
        return id in hiddenRecord ? hiddenRecord[id] : opt_default;
      } else {
        index = keys.indexOf(key);
        return index >= 0 ? values[index] : opt_default;
      }
    }

    function has___(key) {
      var hiddenRecord = getHiddenRecord(key);
      if (hiddenRecord) {
        return id in hiddenRecord;
      } else {
        return keys.indexOf(key) >= 0;
      }
    }

    function set___(key, value) {
      var index;
      var hiddenRecord = getHiddenRecord(key);
      if (hiddenRecord) {
        hiddenRecord[id] = value;
      } else {
        index = keys.indexOf(key);
        if (index >= 0) {
          values[index] = value;
        } else {
          // Since some browsers preemptively terminate slow turns but
          // then continue computing with presumably corrupted heap
          // state, we here defensively get keys.length first and then
          // use it to update both the values and keys arrays, keeping
          // them in sync.
          index = keys.length;
          values[index] = value;
          // If we crash here, values will be one longer than keys.
          keys[index] = key;
        }
      }
      return this;
    }

    function delete___(key) {
      var hiddenRecord = getHiddenRecord(key);
      var index, lastIndex;
      if (hiddenRecord) {
        return id in hiddenRecord && delete hiddenRecord[id];
      } else {
        index = keys.indexOf(key);
        if (index < 0) {
          return false;
        }
        // Since some browsers preemptively terminate slow turns but
        // then continue computing with potentially corrupted heap
        // state, we here defensively get keys.length first and then use
        // it to update both the keys and the values array, keeping
        // them in sync. We update the two with an order of assignments,
        // such that any prefix of these assignments will preserve the
        // key/value correspondence, either before or after the delete.
        // Note that this needs to work correctly when index === lastIndex.
        lastIndex = keys.length - 1;
        keys[index] = void 0;
        // If we crash here, there's a void 0 in the keys array, but
        // no operation will cause a "keys.indexOf(void 0)", since
        // getHiddenRecord(void 0) will always throw an error first.
        values[index] = values[lastIndex];
        // If we crash here, values[index] cannot be found here,
        // because keys[index] is void 0.
        keys[index] = keys[lastIndex];
        // If index === lastIndex and we crash here, then keys[index]
        // is still void 0, since the aliasing killed the previous key.
        keys.length = lastIndex;
        // If we crash here, keys will be one shorter than values.
        values.length = lastIndex;
        return true;
      }
    }

    return Object.create(OurWeakMap.prototype, {
      get___:    { value: constFunc(get___) },
      has___:    { value: constFunc(has___) },
      set___:    { value: constFunc(set___) },
      delete___: { value: constFunc(delete___) }
    });
  };

  OurWeakMap.prototype = Object.create(Object.prototype, {
    get: {
      /**
       * Return the value most recently associated with key, or
       * opt_default if none.
       */
      value: function get(key, opt_default) {
        return this.get___(key, opt_default);
      },
      writable: true,
      configurable: true
    },

    has: {
      /**
       * Is there a value associated with key in this WeakMap?
       */
      value: function has(key) {
        return this.has___(key);
      },
      writable: true,
      configurable: true
    },

    set: {
      /**
       * Associate value with key in this WeakMap, overwriting any
       * previous association if present.
       */
      value: function set(key, value) {
        return this.set___(key, value);
      },
      writable: true,
      configurable: true
    },

    'delete': {
      /**
       * Remove any association for key in this WeakMap, returning
       * whether there was one.
       *
       * <p>Note that the boolean return here does not work like the
       * {@code delete} operator. The {@code delete} operator returns
       * whether the deletion succeeds at bringing about a state in
       * which the deleted property is absent. The {@code delete}
       * operator therefore returns true if the property was already
       * absent, whereas this {@code delete} method returns false if
       * the association was already absent.
       */
      value: function remove(key) {
        return this.delete___(key);
      },
      writable: true,
      configurable: true
    }
  });

  if (typeof HostWeakMap === 'function') {
    (function() {
      // If we got here, then the platform has a WeakMap but we are concerned
      // that it may refuse to store some key types. Therefore, make a map
      // implementation which makes use of both as possible.

      // In this mode we are always using double maps, so we are not proxy-safe.
      // This combination does not occur in any known browser, but we had best
      // be safe.
      if (doubleWeakMapCheckSilentFailure && typeof Proxy !== 'undefined') {
        Proxy = undefined;
      }

      function DoubleWeakMap() {
        if (!(this instanceof OurWeakMap)) {  // approximate test for new ...()
          calledAsFunctionWarning();
        }

        // Preferable, truly weak map.
        var hmap = new HostWeakMap();

        // Our hidden-property-based pseudo-weak-map. Lazily initialized in the
        // 'set' implementation; thus we can avoid performing extra lookups if
        // we know all entries actually stored are entered in 'hmap'.
        var omap = undefined;

        // Hidden-property maps are not compatible with proxies because proxies
        // can observe the hidden name and either accidentally expose it or fail
        // to allow the hidden property to be set. Therefore, we do not allow
        // arbitrary WeakMaps to switch to using hidden properties, but only
        // those which need the ability, and unprivileged code is not allowed
        // to set the flag.
        //
        // (Except in doubleWeakMapCheckSilentFailure mode in which case we
        // disable proxies.)
        var enableSwitching = false;

        function dget(key, opt_default) {
          if (omap) {
            return hmap.has(key) ? hmap.get(key)
                : omap.get___(key, opt_default);
          } else {
            return hmap.get(key, opt_default);
          }
        }

        function dhas(key) {
          return hmap.has(key) || (omap ? omap.has___(key) : false);
        }

        var dset;
        if (doubleWeakMapCheckSilentFailure) {
          dset = function(key, value) {
            hmap.set(key, value);
            if (!hmap.has(key)) {
              if (!omap) { omap = new OurWeakMap(); }
              omap.set(key, value);
            }
            return this;
          };
        } else {
          dset = function(key, value) {
            if (enableSwitching) {
              try {
                hmap.set(key, value);
              } catch (e) {
                if (!omap) { omap = new OurWeakMap(); }
                omap.set___(key, value);
              }
            } else {
              hmap.set(key, value);
            }
            return this;
          };
        }

        function ddelete(key) {
          var result = !!hmap['delete'](key);
          if (omap) { return omap.delete___(key) || result; }
          return result;
        }

        return Object.create(OurWeakMap.prototype, {
          get___:    { value: constFunc(dget) },
          has___:    { value: constFunc(dhas) },
          set___:    { value: constFunc(dset) },
          delete___: { value: constFunc(ddelete) },
          permitHostObjects___: { value: constFunc(function(token) {
            if (token === weakMapPermitHostObjects) {
              enableSwitching = true;
            } else {
              throw new Error('bogus call to permitHostObjects___');
            }
          })}
        });
      }
      DoubleWeakMap.prototype = OurWeakMap.prototype;
      module.exports = DoubleWeakMap;

      // define .constructor to hide OurWeakMap ctor
      Object.defineProperty(WeakMap.prototype, 'constructor', {
        value: WeakMap,
        enumerable: false,  // as default .constructor is
        configurable: true,
        writable: true
      });
    })();
  } else {
    // There is no host WeakMap, so we must use the emulation.

    // Emulated WeakMaps are incompatible with native proxies (because proxies
    // can observe the hidden name), so we must disable Proxy usage (in
    // ArrayLike and Domado, currently).
    if (typeof Proxy !== 'undefined') {
      Proxy = undefined;
    }

    module.exports = OurWeakMap;
  }
})();


/***/ }),
/* 24 */
/***/ (function(module, exports) {

module.exports = function(module) {
	if(!module.webpackPolyfill) {
		module.deprecate = function() {};
		module.paths = [];
		// module.parent = undefined by default
		if(!module.children) module.children = [];
		Object.defineProperty(module, "loaded", {
			enumerable: true,
			get: function() {
				return module.l;
			}
		});
		Object.defineProperty(module, "id", {
			enumerable: true,
			get: function() {
				return module.i;
			}
		});
		module.webpackPolyfill = 1;
	}
	return module;
};


/***/ }),
/* 25 */
/***/ (function(module, exports) {

module.exports = require("assert");

/***/ }),
/* 26 */
/***/ (function(module, exports) {

module.exports = require("domain");

/***/ }),
/* 27 */
/***/ (function(module, exports) {

module.exports = require("url");

/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(7);


/***/ })
/******/ ]);