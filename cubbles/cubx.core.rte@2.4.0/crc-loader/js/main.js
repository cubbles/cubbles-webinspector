/*globals cubx, location*/
(function () {
  'use strict';
  // define global namespace cubx
  window.cubx = {
    // preserve externally defined CRCInit
    'CRCInit': window.cubx && window.cubx.CRCInit ? window.cubx.CRCInit : {},
    'utils': {
      /**
       * Utility function to get nested property (usage: get(window, 'cubx.CRCInit.loadCif')
       * @param {object} obj
       * @param {string} key nested property
       * @returns {*} undefined, if property does not exist
       */
      'get': function (obj, key) {
        return key.split('.').reduce(function (o, x) {
          return (typeof o === 'undefined' || o === null) ? o : o[ x ];
        }, obj);
      }
    }
  };
})();

/*eslint-disable */
// @formatter:off
// --------------------------------------------------------------------------------------- ES6 Promises polyfill include ---------------------------------------------- //
if (window.Promise !== 'function') {
  /*!
   * @overview es6-promise - a tiny implementation of Promises/A+.
   * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
   * @license   Licensed under MIT license
   *            See https://raw.githubusercontent.com/jakearchibald/es6-promise/master/LICENSE
   * @version   3.2.2+35df15ea
   */
  (function(){"use strict";function t(t){return"function"==typeof t||"object"==typeof t&&null!==t}function e(t){return"function"==typeof t}function n(t){G=t}function r(t){Q=t}function o(){return function(){process.nextTick(a)}}function i(){return function(){B(a)}}function s(){var t=0,e=new X(a),n=document.createTextNode("");return e.observe(n,{characterData:!0}),function(){n.data=t=++t%2}}function u(){var t=new MessageChannel;return t.port1.onmessage=a,function(){t.port2.postMessage(0)}}function c(){return function(){setTimeout(a,1)}}function a(){for(var t=0;J>t;t+=2){var e=tt[t],n=tt[t+1];e(n),tt[t]=void 0,tt[t+1]=void 0}J=0}function f(){try{var t=require,e=t("vertx");return B=e.runOnLoop||e.runOnContext,i()}catch(n){return c()}}function l(t,e){var n=this,r=new this.constructor(p);void 0===r[rt]&&k(r);var o=n._state;if(o){var i=arguments[o-1];Q(function(){x(o,r,i,n._result)})}else E(n,r,t,e);return r}function h(t){var e=this;if(t&&"object"==typeof t&&t.constructor===e)return t;var n=new e(p);return g(n,t),n}function p(){}function _(){return new TypeError("You cannot resolve a promise with itself")}function d(){return new TypeError("A promises callback cannot return that same promise.")}function v(t){try{return t.then}catch(e){return ut.error=e,ut}}function y(t,e,n,r){try{t.call(e,n,r)}catch(o){return o}}function m(t,e,n){Q(function(t){var r=!1,o=y(n,e,function(n){r||(r=!0,e!==n?g(t,n):S(t,n))},function(e){r||(r=!0,j(t,e))},"Settle: "+(t._label||" unknown promise"));!r&&o&&(r=!0,j(t,o))},t)}function b(t,e){e._state===it?S(t,e._result):e._state===st?j(t,e._result):E(e,void 0,function(e){g(t,e)},function(e){j(t,e)})}function w(t,n,r){n.constructor===t.constructor&&r===et&&constructor.resolve===nt?b(t,n):r===ut?j(t,ut.error):void 0===r?S(t,n):e(r)?m(t,n,r):S(t,n)}function g(e,n){e===n?j(e,_()):t(n)?w(e,n,v(n)):S(e,n)}function A(t){t._onerror&&t._onerror(t._result),T(t)}function S(t,e){t._state===ot&&(t._result=e,t._state=it,0!==t._subscribers.length&&Q(T,t))}function j(t,e){t._state===ot&&(t._state=st,t._result=e,Q(A,t))}function E(t,e,n,r){var o=t._subscribers,i=o.length;t._onerror=null,o[i]=e,o[i+it]=n,o[i+st]=r,0===i&&t._state&&Q(T,t)}function T(t){var e=t._subscribers,n=t._state;if(0!==e.length){for(var r,o,i=t._result,s=0;s<e.length;s+=3)r=e[s],o=e[s+n],r?x(n,r,o,i):o(i);t._subscribers.length=0}}function M(){this.error=null}function P(t,e){try{return t(e)}catch(n){return ct.error=n,ct}}function x(t,n,r,o){var i,s,u,c,a=e(r);if(a){if(i=P(r,o),i===ct?(c=!0,s=i.error,i=null):u=!0,n===i)return void j(n,d())}else i=o,u=!0;n._state!==ot||(a&&u?g(n,i):c?j(n,s):t===it?S(n,i):t===st&&j(n,i))}function C(t,e){try{e(function(e){g(t,e)},function(e){j(t,e)})}catch(n){j(t,n)}}function O(){return at++}function k(t){t[rt]=at++,t._state=void 0,t._result=void 0,t._subscribers=[]}function Y(t){return new _t(this,t).promise}function q(t){var e=this;return new e(I(t)?function(n,r){for(var o=t.length,i=0;o>i;i++)e.resolve(t[i]).then(n,r)}:function(t,e){e(new TypeError("You must pass an array to race."))})}function F(t){var e=this,n=new e(p);return j(n,t),n}function D(){throw new TypeError("You must pass a resolver function as the first argument to the promise constructor")}function K(){throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.")}function L(t){this[rt]=O(),this._result=this._state=void 0,this._subscribers=[],p!==t&&("function"!=typeof t&&D(),this instanceof L?C(this,t):K())}function N(t,e){this._instanceConstructor=t,this.promise=new t(p),this.promise[rt]||k(this.promise),I(e)?(this._input=e,this.length=e.length,this._remaining=e.length,this._result=new Array(this.length),0===this.length?S(this.promise,this._result):(this.length=this.length||0,this._enumerate(),0===this._remaining&&S(this.promise,this._result))):j(this.promise,U())}function U(){return new Error("Array Methods must be provided an Array")}function W(){var t;if("undefined"!=typeof global)t=global;else if("undefined"!=typeof self)t=self;else try{t=Function("return this")()}catch(e){throw new Error("polyfill failed because global object is unavailable in this environment")}var n=t.Promise;(!n||"[object Promise]"!==Object.prototype.toString.call(n.resolve())||n.cast)&&(t.Promise=pt)}var z;z=Array.isArray?Array.isArray:function(t){return"[object Array]"===Object.prototype.toString.call(t)};var B,G,H,I=z,J=0,Q=function(t,e){tt[J]=t,tt[J+1]=e,J+=2,2===J&&(G?G(a):H())},R="undefined"!=typeof window?window:void 0,V=R||{},X=V.MutationObserver||V.WebKitMutationObserver,Z="undefined"==typeof self&&"undefined"!=typeof process&&"[object process]"==={}.toString.call(process),$="undefined"!=typeof Uint8ClampedArray&&"undefined"!=typeof importScripts&&"undefined"!=typeof MessageChannel,tt=new Array(1e3);H=Z?o():X?s():$?u():void 0===R&&"function"==typeof require?f():c();var et=l,nt=h,rt=Math.random().toString(36).substring(16),ot=void 0,it=1,st=2,ut=new M,ct=new M,at=0,ft=Y,lt=q,ht=F,pt=L;L.all=ft,L.race=lt,L.resolve=nt,L.reject=ht,L._setScheduler=n,L._setAsap=r,L._asap=Q,L.prototype={constructor:L,then:et,"catch":function(t){return this.then(null,t)}};var _t=N;N.prototype._enumerate=function(){for(var t=this.length,e=this._input,n=0;this._state===ot&&t>n;n++)this._eachEntry(e[n],n)},N.prototype._eachEntry=function(t,e){var n=this._instanceConstructor,r=n.resolve;if(r===nt){var o=v(t);if(o===et&&t._state!==ot)this._settledAt(t._state,e,t._result);else if("function"!=typeof o)this._remaining--,this._result[e]=t;else if(n===pt){var i=new n(p);w(i,t,o),this._willSettleAt(i,e)}else this._willSettleAt(new n(function(e){e(t)}),e)}else this._willSettleAt(r(t),e)},N.prototype._settledAt=function(t,e,n){var r=this.promise;r._state===ot&&(this._remaining--,t===st?j(r,n):this._result[e]=n),0===this._remaining&&S(r,this._result)},N.prototype._willSettleAt=function(t,e){var n=this;E(t,void 0,function(t){n._settledAt(it,e,t)},function(t){n._settledAt(st,e,t)})};var dt=W,vt={Promise:pt,polyfill:dt};"function"==typeof define&&define.amd?define(function(){return vt}):"undefined"!=typeof module&&module.exports?module.exports=vt:"undefined"!=typeof this&&(this.ES6Promise=vt),dt()}).call(this);
}
// --------------------------------------------------------------------------------------- End of ES6 Promises polyfill include ---------------------------------------------- //

// --------------------------------------------------------------------------------------- RequireJS include ------------------------------------------------- //
/*
 Note: RequireJS is included here manually to simplify CRC-Loader development.
 The other option is to concat 'require.js' and 'main.js' within a build step. This is implemented
 within 'tasks/configs/common.js' but deactivated within 'Gruntfile.js'

 Important: We moved 'requirejs', 'require' and 'define' into the 'cubx.amd' namespace to avoid problems with the
 following scenarios:
 1) A npm-package has been "browser-enabled" and checks for an existing 'require' functions that is provided by node.js.
 2) One wants to integrate the CRC-Loader into 3rd-party application that always provides an AMD loader like
 require.js or almond.js.
 Confluence is such an example that includes a 'almond.js' lib - so 'requirejs', 'require' and 'define' a
 re always defined; but unfortunately the CRC-Loader does not work as expected.
 */

/*
 RequireJS 2.1.15 Copyright (c) 2010-2014, The Dojo Foundation All Rights Reserved.
 Available via the MIT or new BSD license.
 see: http://github.com/jrburke/requirejs for details
 */
window.cubx.amd = {
    requirejs: undefined,
    require: undefined,
    define: undefined
};

(function(ba) {function G(b) {return "[object Function]" === K.call(b)}function H(b) {return "[object Array]" === K.call(b)}function v(b, c) {if (b) {var d;for (d = 0; d < b.length && (!b[d] || !c(b[d],d,b)); d += 1);}}function T(b, c) {if (b) {var d;for (d = b.length - 1; -1 < d && (!b[d] || !c(b[d],d,b)); d -= 1);}}function t(b, c) {return fa.call(b,c)}function m(b, c) {return t(b,c) && b[c]}function B(b, c) {for (var d in b)if (t(b,d) && c(b[d],d))break}function U(b, c, d, e) {c && B(c,function(c, g) {if (d || !t(b,g))e && "object" === typeof c && c && !H(c) && !G(c) && !(c instanceof
RegExp) ? (b[g] || (b[g] = {}),U(b[g],c,d,e)) : b[g] = c});return b}function u(b, c) {return function() {return c.apply(b,arguments)}}function ca(b) {throw b;}function da(b) {if (!b)return b;var c = ba;v(b.split("."),function(b) {c = c[b]});return c}function C(b, c, d, e) {c = Error(c + "\nhttp://requirejs.org/docs/errors.html#" + b);c.requireType = b;c.requireModules = e;d && (c.originalError = d);return c}function ga(b) {function c(a, k, b) {var f,l,c,d,e,g,i,p,k = k && k.split("/"),h = j.map,n = h && h["*"];if (a) {a = a.split("/");l = a.length - 1;j.nodeIdCompat &&
Q.test(a[l]) && (a[l] = a[l].replace(Q,""));"." === a[0].charAt(0) && k && (l = k.slice(0,k.length - 1),a = l.concat(a));l = a;for (c = 0; c < l.length; c++)if (d = l[c],"." === d)l.splice(c,1),c -= 1;else if (".." === d && !(0 === c || 1 == c && ".." === l[2] || ".." === l[c - 1]) && 0 < c)l.splice(c - 1,2),c -= 2;a = a.join("/")}if (b && h && (k || n)) {l = a.split("/");c = l.length;a:for (; 0 < c; c -= 1) {e = l.slice(0,c).join("/");if (k)for (d = k.length; 0 < d; d -= 1)if (b = m(h,k.slice(0,d).join("/")))if (b = m(b,e)) {f = b;g = c;break a}!i && (n && m(n,e)) && (i = m(n,e),p = c)}!f && i && (f = i,g = p);f && (l.splice(0,
    g,f),a = l.join("/"))}return (f = m(j.pkgs,a)) ? f : a}function d(a) {z && v(document.getElementsByTagName("script"),function(k) {if (k.getAttribute("data-requiremodule") === a && k.getAttribute("data-requirecontext") === i.contextName)return k.parentNode.removeChild(k),!0})}function e(a) {var k = m(j.paths,a);if (k && H(k) && 1 < k.length)return k.shift(),i.require.undef(a),i.makeRequire(null,{skipMap: !0})([a]),!0}function n(a) {var k,c = a ? a.indexOf("!") : -1;-1 < c && (k = a.substring(0,c),a = a.substring(c + 1,a.length));return [k,a]}function p(a,
    k, b, f) {var l,d,e = null,g = k ? k.name : null,j = a,p = !0,h = "";a || (p = !1,a = "_@r" + (K += 1));a = n(a);e = a[0];a = a[1];e && (e = c(e,g,f),d = m(r,e));a && (e ? h = d && d.normalize ? d.normalize(a,function(a) {return c(a,g,f)}) : -1 === a.indexOf("!") ? c(a,g,f) : a : (h = c(a,g,f),a = n(h),e = a[0],h = a[1],b = !0,l = i.nameToUrl(h)));b = e && !d && !b ? "_unnormalized" + (O += 1) : "";return {prefix: e,name: h,parentMap: k,unnormalized: !!b,url: l,originalName: j,isDefine: p,id: (e ? e + "!" + h : h) + b}}function s(a) {var k = a.id,b = m(h,k);b || (b = h[k] = new i.Module(a));return b}function q(a,
    k, b) {var f = a.id,c = m(h,f);if (t(r,f) && (!c || c.defineEmitComplete))"defined" === k && b(r[f]);else if (c = s(a),c.error && "error" === k)b(c.error);else c.on(k,b)}function w(a, b) {var c = a.requireModules,f = !1;if (b)b(a);else if (v(c,function(b) {if (b = m(h,b))b.error = a,b.events.error && (f = !0,b.emit("error",a))}),!f)g.onError(a)}function x() {R.length && (ha.apply(A,[A.length,0].concat(R)),R = [])}function y(a) {delete h[a];delete V[a]}function F(a, b, c) {var f = a.map.id;a.error ? a.emit("error",a.error) : (b[f] = !0,v(a.depMaps,function(f,
    d) {var e = f.id,g = m(h,e);g && (!a.depMatched[d] && !c[e]) && (m(b,e) ? (a.defineDep(d,r[e]),a.check()) : F(g,b,c))}),c[f] = !0)}function D() {var a,b,c = (a = 1E3 * j.waitSeconds) && i.startTime + a < (new Date).getTime(),f = [],l = [],g = !1,h = !0;if (!W) {W = !0;B(V,function(a) {var i = a.map,j = i.id;if (a.enabled && (i.isDefine || l.push(a),!a.error))if (!a.inited && c)e(j) ? g = b = !0 : (f.push(j),d(j));else if (!a.inited && (a.fetched && i.isDefine) && (g = !0,!i.prefix))return h = !1});if (c && f.length)return a = C("timeout","Load timeout for modules: " + f,null,
    f),a.contextName = i.contextName,w(a);h && v(l,function(a) {F(a,{},{})});if ((!c || b) && g)if ((z || ea) && !X)X = setTimeout(function() {X = 0;D()},50);W = !1}}function E(a) {t(r,a[0]) || s(p(a[0],null,!0)).init(a[1],a[2])}function I(a) {var a = a.currentTarget || a.srcElement,b = i.onScriptLoad;a.detachEvent && !Y ? a.detachEvent("onreadystatechange",b) : a.removeEventListener("load",b,!1);b = i.onScriptError;(!a.detachEvent || Y) && a.removeEventListener("error",b,!1);return {node: a,id: a && a.getAttribute("data-requiremodule")}}function J() {var a;
    for (x(); A.length;) {a = A.shift();if (null === a[0])return w(C("mismatch","Mismatched anonymous define() module: " + a[a.length - 1]));E(a)}}var W,Z,i,L,X,j = {waitSeconds: 7,baseUrl: "./",paths: {},bundles: {},pkgs: {},shim: {},config: {}},h = {},V = {},$ = {},A = [],r = {},S = {},aa = {},K = 1,O = 1;L = {require: function(a) {return a.require ? a.require : a.require = i.makeRequire(a.map)},exports: function(a) {a.usingExports = !0;if (a.map.isDefine)return a.exports ? r[a.map.id] = a.exports : a.exports = r[a.map.id] = {}},module: function(a) {return a.module ?
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     a.module : a.module = {id: a.map.id,uri: a.map.url,config: function() {return m(j.config,a.map.id) || {}},exports: a.exports || (a.exports = {})}}};Z = function(a) {this.events = m($,a.id) || {};this.map = a;this.shim = m(j.shim,a.id);this.depExports = [];this.depMaps = [];this.depMatched = [];this.pluginMaps = {};this.depCount = 0};Z.prototype = {init: function(a, b, c, f) {f = f || {};if (!this.inited) {this.factory = b;if (c)this.on("error",c);else this.events.error && (c = u(this,function(a) {this.emit("error",a)}));this.depMaps = a && a.slice(0);this.errback =
    c;this.inited = !0;this.ignore = f.ignore;f.enabled || this.enabled ? this.enable() : this.check()}},defineDep: function(a, b) {this.depMatched[a] || (this.depMatched[a] = !0,this.depCount -= 1,this.depExports[a] = b)},fetch: function() {if (!this.fetched) {this.fetched = !0;i.startTime = (new Date).getTime();var a = this.map;if (this.shim)i.makeRequire(this.map,{enableBuildCallback: !0})(this.shim.deps || [],u(this,function() {return a.prefix ? this.callPlugin() : this.load()}));else return a.prefix ? this.callPlugin() : this.load()}},load: function() {var a =
    this.map.url;S[a] || (S[a] = !0,i.load(this.map.id,a))},check: function() {if (this.enabled && !this.enabling) {var a,b,c = this.map.id;b = this.depExports;var f = this.exports,l = this.factory;if (this.inited)if (this.error)this.emit("error",this.error);else {if (!this.defining) {this.defining = !0;if (1 > this.depCount && !this.defined) {if (G(l)) {if (this.events.error && this.map.isDefine || g.onError !== ca)try {f = i.execCb(c,l,b,f)}catch (d) {a = d}else f = i.execCb(c,l,b,f);this.map.isDefine && void 0 === f && ((b = this.module) ? f = b.exports : this.usingExports &&
(f = this.exports));if (a)return a.requireMap = this.map,a.requireModules = this.map.isDefine ? [this.map.id] : null,a.requireType = this.map.isDefine ? "define" : "require",w(this.error = a)}else f = l;this.exports = f;if (this.map.isDefine && !this.ignore && (r[c] = f,g.onResourceLoad))g.onResourceLoad(i,this.map,this.depMaps);y(c);this.defined = !0}this.defining = !1;this.defined && !this.defineEmitted && (this.defineEmitted = !0,this.emit("defined",this.exports),this.defineEmitComplete = !0)}}else this.fetch()}},callPlugin: function() {var a =
    this.map,b = a.id,d = p(a.prefix);this.depMaps.push(d);q(d,"defined",u(this,function(f) {var l,d;d = m(aa,this.map.id);var e = this.map.name,P = this.map.parentMap ? this.map.parentMap.name : null,n = i.makeRequire(a.parentMap,{enableBuildCallback: !0});if (this.map.unnormalized) {if (f.normalize && (e = f.normalize(e,function(a) {return c(a,P,!0)}) || ""),f = p(a.prefix + "!" + e,this.map.parentMap),q(f,"defined",u(this,function(a) {this.init([],function() {return a},null,{enabled: !0,ignore: !0})})),d = m(h,f.id)) {this.depMaps.push(f);
    if (this.events.error)d.on("error",u(this,function(a) {this.emit("error",a)}));d.enable()}}else d ? (this.map.url = i.nameToUrl(d),this.load()) : (l = u(this,function(a) {this.init([],function() {return a},null,{enabled: !0})}),l.error = u(this,function(a) {this.inited = !0;this.error = a;a.requireModules = [b];B(h,function(a) {0 === a.map.id.indexOf(b + "_unnormalized") && y(a.map.id)});w(a)}),l.fromText = u(this,function(f, c) {var d = a.name,e = p(d),P = M;c && (f = c);P && (M = !1);s(e);t(j.config,b) && (j.config[d] = j.config[b]);try {g.exec(f)}catch (h) {return w(C("fromtexteval",
    "fromText eval for " + b + " failed: " + h,h,[b]))}P && (M = !0);this.depMaps.push(e);i.completeLoad(d);n([d],l)}),f.load(a.name,n,l,j))}));i.enable(d,this);this.pluginMaps[d.id] = d},enable: function() {V[this.map.id] = this;this.enabling = this.enabled = !0;v(this.depMaps,u(this,function(a, b) {var c,f;if ("string" === typeof a) {a = p(a,this.map.isDefine ? this.map : this.map.parentMap,!1,!this.skipMap);this.depMaps[b] = a;if (c = m(L,a.id)) {this.depExports[b] = c(this);return }this.depCount += 1;q(a,"defined",u(this,function(a) {this.defineDep(b,
    a);this.check()}));this.errback && q(a,"error",u(this,this.errback))}c = a.id;f = h[c];!t(L,c) && (f && !f.enabled) && i.enable(a,this)}));B(this.pluginMaps,u(this,function(a) {var b = m(h,a.id);b && !b.enabled && i.enable(a,this)}));this.enabling = !1;this.check()},on: function(a, b) {var c = this.events[a];c || (c = this.events[a] = []);c.push(b)},emit: function(a, b) {v(this.events[a],function(a) {a(b)});"error" === a && delete this.events[a]}};i = {config: j,contextName: b,registry: h,defined: r,urlFetched: S,defQueue: A,Module: Z,makeModuleMap: p,
    nextTick: g.nextTick,onError: w,configure: function(a) {a.baseUrl && "/" !== a.baseUrl.charAt(a.baseUrl.length - 1) && (a.baseUrl += "/");var b = j.shim,c = {paths: !0,bundles: !0,config: !0,map: !0};B(a,function(a, b) {c[b] ? (j[b] || (j[b] = {}),U(j[b],a,!0,!0)) : j[b] = a});a.bundles && B(a.bundles,function(a, b) {v(a,function(a) {a !== b && (aa[a] = b)})});a.shim && (B(a.shim,function(a, c) {H(a) && (a = {deps: a});if ((a.exports || a.init) && !a.exportsFn)a.exportsFn = i.makeShimExports(a);b[c] = a}),j.shim = b);a.packages && v(a.packages,function(a) {var b,
        a = "string" === typeof a ? {name: a} : a;b = a.name;a.location && (j.paths[b] = a.location);j.pkgs[b] = a.name + "/" + (a.main || "main").replace(ia,"").replace(Q,"")});B(h,function(a, b) {!a.inited && !a.map.unnormalized && (a.map = p(b))});if (a.deps || a.callback)i.require(a.deps || [],a.callback)},makeShimExports: function(a) {return function() {var b;a.init && (b = a.init.apply(ba,arguments));return b || a.exports && da(a.exports)}},makeRequire: function(a, e) {function j(c, d, m) {var n,q;e.enableBuildCallback && (d && G(d)) && (d.__requireJsBuild =
        !0);if ("string" === typeof c) {if (G(d))return w(C("requireargs","Invalid require call"),m);if (a && t(L,c))return L[c](h[a.id]);if (g.get)return g.get(i,c,a,j);n = p(c,a,!1,!0);n = n.id;return !t(r,n) ? w(C("notloaded",'Module name "' + n + '" has not been loaded yet for context: ' + b + (a ? "" : ". Use require([])"))) : r[n]}J();i.nextTick(function() {J();q = s(p(null,a));q.skipMap = e.skipMap;q.init(c,d,m,{enabled: !0});D()});return j}e = e || {};U(j,{isBrowser: z,toUrl: function(b) {var d,e = b.lastIndexOf("."),k = b.split("/")[0];if (-1 !==
        e && (!("." === k || ".." === k) || 1 < e))d = b.substring(e,b.length),b = b.substring(0,e);return i.nameToUrl(c(b,a && a.id,!0),d,!0)},defined: function(b) {return t(r,p(b,a,!1,!0).id)},specified: function(b) {b = p(b,a,!1,!0).id;return t(r,b) || t(h,b)}});a || (j.undef = function(b) {x();var c = p(b,a,!0),e = m(h,b);d(b);delete r[b];delete S[c.url];delete $[b];T(A,function(a, c) {a[0] === b && A.splice(c,1)});e && (e.events.defined && ($[b] = e.events),y(b))});return j},enable: function(a) {m(h,a.id) && s(a).enable()},completeLoad: function(a) {var b,
        c,d = m(j.shim,a) || {},g = d.exports;for (x(); A.length;) {c = A.shift();if (null === c[0]) {c[0] = a;if (b)break;b = !0}else c[0] === a && (b = !0);E(c)}c = m(h,a);if (!b && !t(r,a) && c && !c.inited) {if (j.enforceDefine && (!g || !da(g)))return e(a) ? void 0 : w(C("nodefine","No define call for " + a,null,[a]));E([a,d.deps || [],d.exportsFn])}D()},nameToUrl: function(a, b, c) {var d,e,h;(d = m(j.pkgs,a)) && (a = d);if (d = m(aa,a))return i.nameToUrl(d,b,c);if (g.jsExtRegExp.test(a))d = a + (b || "");else {d = j.paths;a = a.split("/");for (e = a.length; 0 < e; e -= 1)if (h = a.slice(0,
            e).join("/"),h = m(d,h)) {H(h) && (h = h[0]);a.splice(0,e,h);break}d = a.join("/");d += b || (/^data\:|\?/.test(d) || c ? "" : ".js");d = ("/" === d.charAt(0) || d.match(/^[\w\+\.\-]+:/) ? "" : j.baseUrl) + d}return j.urlArgs ? d + ((-1 === d.indexOf("?") ? "?" : "&") + j.urlArgs) : d},load: function(a, b) {g.load(i,a,b)},execCb: function(a, b, c, d) {return b.apply(d,c)},onScriptLoad: function(a) {if ("load" === a.type || ja.test((a.currentTarget || a.srcElement).readyState))N = null,a = I(a),i.completeLoad(a.id)},onScriptError: function(a) {var b = I(a);if (!e(b.id))return w(C("scripterror",
        "Script error for: " + b.id,a,[b.id]))}};i.require = i.makeRequire();return i}var g,x,y,D,I,E,N,J,s,O,ka = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg,la = /[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g,Q = /\.js$/,ia = /^\.\//;x = Object.prototype;var K = x.toString,fa = x.hasOwnProperty,ha = Array.prototype.splice,z = !!("undefined" !== typeof window && "undefined" !== typeof navigator && window.document),ea = !z && "undefined" !== typeof importScripts,ja = z && "PLAYSTATION 3" === navigator.platform ? /^complete$/ : /^(complete|loaded)$/,
    Y = "undefined" !== typeof opera && "[object Opera]" === opera.toString(),F = {},q = {},R = [],M = !1;if ("undefined" === typeof cubx.amd.define) {if ("undefined" !== typeof cubx.amd.requirejs) {if (G(cubx.amd.requirejs))return;q = cubx.amd.requirejs;cubx.amd.requirejs = void 0}"undefined" !== typeof cubx.amd.require && !G(cubx.amd.require) && (q = cubx.amd.require,cubx.amd.require = void 0);g = cubx.amd.requirejs = function(b, c, d, e) {var n,p = "_";!H(b) && "string" !== typeof b && (n = b,H(c) ? (b = c,c = d,d = e) : b = []);n && n.context && (p = n.context);(e = m(F,p)) || (e = F[p] = g.s.newContext(p));n && e.configure(n);return e.require(b,c,d)};g.config = function(b) {return g(b)};
    g.nextTick = "undefined" !== typeof setTimeout ? function(b) {setTimeout(b,4)} : function(b) {b()};cubx.amd.require || (cubx.amd.require = g);g.version = "2.1.15";g.jsExtRegExp = /^\/|:|\?|\.js$/;g.isBrowser = z;x = g.s = {contexts: F,newContext: ga};g({});v(["toUrl","undef","defined","specified"],function(b) {g[b] = function() {var c = F._;return c.require[b].apply(c,arguments)}});if (z && (y = x.head = document.getElementsByTagName("head")[0],D = document.getElementsByTagName("base")[0]))y = x.head = D.parentNode;g.onError = ca;g.createNode = function(b) {var c =
        b.xhtml ? document.createElementNS("http://www.w3.org/1999/xhtml","html:script") : document.createElement("script");c.type = b.scriptType || "text/javascript";c.charset = "utf-8";c.async = !0;return c};g.load = function(b, c, d) {var e = b && b.config || {};if (z)return e = g.createNode(e,c,d),e.setAttribute("data-requirecontext",b.contextName),e.setAttribute("data-requiremodule",c),e.attachEvent && !(e.attachEvent.toString && 0 > e.attachEvent.toString().indexOf("[native code")) && !Y ? (M = !0,e.attachEvent("onreadystatechange",b.onScriptLoad)) :
                                                                                                                                                                                                                                                                                                                                                                                                          (e.addEventListener("load",b.onScriptLoad,!1),e.addEventListener("error",b.onScriptError,!1)),e.src = d,J = e,D ? y.insertBefore(e,D) : y.appendChild(e),J = null,e;if (ea)try {importScripts(d),b.completeLoad(c)}catch (m) {b.onError(C("importscripts","importScripts failed for " + c + " at " + d,m,[c]))}};z && !q.skipDataMain && T(document.getElementsByTagName("script"),function(b) {y || (y = b.parentNode);if (I = b.getAttribute("data-main"))return s = I,q.baseUrl || (E = s.split("/"),s = E.pop(),O = E.length ? E.join("/") + "/" : "./",q.baseUrl =
        O),s = s.replace(Q,""),g.jsExtRegExp.test(s) && (s = I),q.deps = q.deps ? q.deps.concat(s) : [s],!0});cubx.amd.define = function(b, c, d) {var e,g;"string" !== typeof b && (d = c,c = b,b = null);H(c) || (d = c,c = null);!c && G(d) && (c = [],d.length && (d.toString().replace(ka,"").replace(la,function(b, d) {c.push(d)}),c = (1 === d.length ? ["require"] : ["require","exports","module"]).concat(c)));if (M) {if (!(e = J))N && "interactive" === N.readyState || T(document.getElementsByTagName("script"),function(b) {if ("interactive" === b.readyState)return N = b}),e = N;e && (b ||
    (b = e.getAttribute("data-requiremodule")),g = F[e.getAttribute("data-requirecontext")])}(g ? g.defQueue : R).push([b,c,d])};cubx.amd.define.amd = {jQuery: !0};g.exec = function(b) {return eval(b)};g(q)}})(this);

// --------------------------------------------------------------------------------------- End of RequireJS include ------------------------------------------------- //
// @formatter:on
/* eslint-enable */

(function () {
  'use strict';

  // get configs from the documents script-tag
  var crcLoaderElement;
  var crcLoaderUrl;
  Array.prototype.forEach.call(document.querySelectorAll('script[src]'), function (scriptElement) {
    // get the loader url itself
    var src = scriptElement.getAttribute('src');
    if (src.match(/crc-loader/)) {
      crcLoaderElement = scriptElement;
      crcLoaderUrl = src;
    }
  });
  // check for a alternative baseUrl to load WebPackages from and append / to end of base url if there is no
  var baseUrl = crcLoaderElement.getAttribute('data-crc-baseUrl');
  if (baseUrl && baseUrl.lastIndexOf('/') !== baseUrl.length - 1) {
    baseUrl = baseUrl + '/';
  }
  var crcLoaderBaseUrl = crcLoaderUrl.replace(/\/js\/main\.js$/, '');
  var crcBaseUrl = crcLoaderBaseUrl.replace(/\/crc-loader$/, '/crc');
  var webpackageBaseUrl = baseUrl || crcLoaderBaseUrl.replace(/\/[a-zA-Z0-9-\.@]*\/crc-loader$/, '/');
  window.cubx.CRCInit.webpackageBaseUrl = webpackageBaseUrl;
  var rteWebpackageId = crcLoaderBaseUrl.substring(0, crcLoaderBaseUrl.lastIndexOf('/'));
  window.cubx.CRCInit.rteWebpackageId = rteWebpackageId.substring(rteWebpackageId.lastIndexOf('/') + 1);

  /*
   * Set option 'loadCIF' (default == 'true')
   */
  (function () {
    // fow backwards compatibility also test for attribute "data-CRCInit.loadCIF"
    var attributeName = 'data-CRCInit.loadCIF';
    var loadCIFAttr = crcLoaderElement.getAttribute(attributeName);
    attributeName = 'data-crcinit-loadcif';
    loadCIFAttr = loadCIFAttr || crcLoaderElement.getAttribute(attributeName);
    var defaultValue = 'true';
    var loadCIF = loadCIFAttr || defaultValue;
    cubx.CRCInit.loadCIF = loadCIF;
    if ([ 'true', 'false' ].indexOf(loadCIFAttr) > -1) {
      console.warn(
        'Expected CRCLoader attribute "' + attributeName + '" to be "true" or "false". ' +
        'Got "' + loadCIFAttr + '". ' +
        'Going to use default value "' + defaultValue + '".');
    }
  })();

  /*
   *
   */
  (function () {
    var attributeName = 'data-cubx-startevent';
    var startEventName = crcLoaderElement.getAttribute(attributeName);
    var defaultValue = 'DOMContentLoaded';
    cubx.CRCInit.startEvent = startEventName || cubx.CRCInit.startEvent || defaultValue;
    document.addEventListener(cubx.CRCInit.startEvent, function () {
      cubx.CRCInit.startEventArrived = true;
    });
  })();

  /*
   *
   */
  (function () {
    if (cubx.CRCInit.allowAbsoluteResourceUrls) {
      return;
    }
    // fow backwards compatibility also test for attribute "allow-absolute-resource-urls"
    var attributeName = 'allow-absolute-resource-urls';
    var allowAbsoluteResourceUrls = crcLoaderElement.getAttribute(attributeName);
    attributeName = 'data-cubx-allow-absolute-resource-urls';
    allowAbsoluteResourceUrls = allowAbsoluteResourceUrls || crcLoaderElement.getAttribute(attributeName);
    var defaultValue = false;
    cubx.CRCInit.allowAbsoluteResourceUrls = allowAbsoluteResourceUrls || defaultValue;
  })();

  /*
   * Set option 'runtimeMode' (default == 'prod')
   */
  function getURLParameter (name) {
    // jshint elision: true
    /* eslint-disable no-sparse-arrays */
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) ||
      [ , '' ])[ 1 ].replace(/\+/g, '%20')) || null;
    /* eslint-enable no-sparse-arrays */
  }

  (function () {
    var parameterName = 'runtimeMode';
    var parameterValue = getURLParameter(parameterName);
    var defaultValue = 'prod';
    parameterValue = parameterValue || defaultValue;
    var allowedValues = [ 'dev', 'prod' ];
    if (allowedValues.indexOf(parameterValue) > -1) {
      window.cubx.CRCInit.runtimeMode = parameterValue;
    } else {
      console.warn(
        'Expected URLParameter "' + parameterName + '" to be one of ' +
        JSON.stringify(allowedValues) + '. Got "' + parameterValue + '".' +
        'Going to use "' + defaultValue + '".');
    }
  })();

  /*
   * requireJS
   */
  cubx.amd.require.config({
    paths: {
      'crcLoader': crcLoaderBaseUrl + '/modules/crcLoader/CRCLoader',
      'dependencyTagTransformer': crcLoaderBaseUrl + '/modules/dependencyTagTransformer/dependencyTagTransformer',
      'polyfills': crcLoaderBaseUrl + '/modules/polyfills/polyfills',
      // crc modules definition block starts here
      'crc': crcLoaderBaseUrl + '/../crc/modules/crc/CRC',
      'storageManager': crcLoaderBaseUrl + '/../crc/modules/storageManager/storageManager',
      'text': crcLoaderBaseUrl + '/../crc/modules/text/text',
      'dependencyManager': crcLoaderBaseUrl + '/../crc/modules/dependencyManager/depMgr',
      'cache': crcLoaderBaseUrl + '/../crc/modules/cache/cache',
      'componentResolver': crcLoaderBaseUrl + '/../crc/modules/componentResolver/componentResolver',
      'utils': crcLoaderBaseUrl + '/../crc/modules/utils/utils',
      'eventFactory': crcLoaderBaseUrl + '/../crc/modules/eventFactory/eventFactory',
      'responseCache': crcLoaderBaseUrl + '/../crc/modules/responseCache/responseCache',
      'manifestConverter': crcLoaderBaseUrl + '/../crc/modules/manifestConverter/manifestConverter',
      'axios': crcLoaderBaseUrl + '/../crc/modules/axios/axios.min',
      'dependencyTree': crcLoaderBaseUrl + '/../crc/modules/dependencyTree/dependencyTree'
    }
  });

  /*
   * Do the basic bootstrap by getting CRCLoader module.
   */
  cubx.amd.require([ 'crcLoader' ], function (crcLoader) {
    // set CRCLoader to cubx namespace
    cubx.CRCLoader = crcLoader;

    crcLoader.setCRCLoaderResourcesBaseUrl(crcLoaderBaseUrl);
    crcLoader.setWebpackageBaseUrl(webpackageBaseUrl);
    crcLoader.setCRCBaseUrl(crcBaseUrl);
    crcLoader.run();
  });
})();
