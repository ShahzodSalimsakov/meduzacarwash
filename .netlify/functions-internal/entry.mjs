import * as adapter from '@astrojs/netlify/netlify-functions.js';
import React, { createElement, Component, useState } from 'react';
import ReactDOM from 'react-dom/server';
import { escape } from 'html-escaper';
/* empty css                                 */import i18next, { t, changeLanguage } from 'i18next';
import fsBackend from 'i18next-fs-backend';
import * as url2 from 'url';
import '@proload/core';
import '@proload/plugin-tsm';
import module2 from 'module';
import path2 from 'path';
import localeEmoji from 'locale-emoji';
import ISO6991 from 'iso-639-1';
import PropTypes from 'prop-types';
import mergeClassNames from 'merge-class-names';
import getUserLocale, { getUserLocale as getUserLocale$1 } from 'get-user-locale';
import { getDayStart, getMonthStart, getYearStart, getDecadeStart, getCenturyStart, getPreviousMonthStart, getPreviousYearStart, getPreviousDecadeStart, getPreviousCenturyStart, getNextMonthStart, getNextYearStart, getNextDecadeStart, getNextCenturyStart, getPreviousMonthEnd, getPreviousYearEnd, getPreviousDecadeEnd, getPreviousCenturyEnd, getYear, getMonth, getDayEnd, getMonthEnd, getYearEnd, getDecadeEnd, getCenturyEnd, getDayRange, getMonthRange, getYearRange, getDecadeRange, getCenturyRange, getDaysInMonth, getDate } from '@wojtekmaj/date-utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { jsx, jsxs } from 'react/jsx-runtime';
import { YMaps, Map as Map$1, Placemark } from '@pbe/react-yandex-maps';
import { Tab } from '@headlessui/react';
import 'mime';
import 'cookie';
import 'kleur/colors';
import 'string-width';
import 'path-browserify';

/**
 * Astro passes `children` as a string of HTML, so we need
 * a wrapper `div` to render that content as VNodes.
 *
 * As a bonus, we can signal to React that this subtree is
 * entirely static and will never change via `shouldComponentUpdate`.
 */
const StaticHtml = ({ value, name }) => {
	if (!value) return null;
	return createElement('astro-slot', {
		name,
		suppressHydrationWarning: true,
		dangerouslySetInnerHTML: { __html: value },
	});
};

/**
 * This tells React to opt-out of re-rendering this subtree,
 * In addition to being a performance optimization,
 * this also allows other frameworks to attach to `children`.
 *
 * See https://preactjs.com/guide/v8/external-dom-mutations
 */
StaticHtml.shouldComponentUpdate = () => false;

const slotName$1 = (str) => str.trim().replace(/[-_]([a-z])/g, (_, w) => w.toUpperCase());
const reactTypeof = Symbol.for('react.element');

function errorIsComingFromPreactComponent(err) {
	return (
		err.message &&
		(err.message.startsWith("Cannot read property '__H'") ||
			err.message.includes("(reading '__H')"))
	);
}

async function check$1(Component, props, children) {
	// Note: there are packages that do some unholy things to create "components".
	// Checking the $$typeof property catches most of these patterns.
	if (typeof Component === 'object') {
		const $$typeof = Component['$$typeof'];
		return $$typeof && $$typeof.toString().slice('Symbol('.length).startsWith('react');
	}
	if (typeof Component !== 'function') return false;

	if (Component.prototype != null && typeof Component.prototype.render === 'function') {
		return React.Component.isPrototypeOf(Component) || React.PureComponent.isPrototypeOf(Component);
	}

	let error = null;
	let isReactComponent = false;
	function Tester(...args) {
		try {
			const vnode = Component(...args);
			if (vnode && vnode['$$typeof'] === reactTypeof) {
				isReactComponent = true;
			}
		} catch (err) {
			if (!errorIsComingFromPreactComponent(err)) {
				error = err;
			}
		}

		return React.createElement('div');
	}

	await renderToStaticMarkup$1(Tester, props, children, {});

	if (error) {
		throw error;
	}
	return isReactComponent;
}

async function getNodeWritable() {
	let nodeStreamBuiltinModuleName = 'stream';
	let { Writable } = await import(/* @vite-ignore */ nodeStreamBuiltinModuleName);
	return Writable;
}

async function renderToStaticMarkup$1(Component, props, { default: children, ...slotted }, metadata) {
	delete props['class'];
	const slots = {};
	for (const [key, value] of Object.entries(slotted)) {
		const name = slotName$1(key);
		slots[name] = React.createElement(StaticHtml, { value, name });
	}
	// Note: create newProps to avoid mutating `props` before they are serialized
	const newProps = {
		...props,
		...slots,
	};
	if (children != null) {
		newProps.children = React.createElement(StaticHtml, { value: children });
	}
	const vnode = React.createElement(Component, newProps);
	let html;
	if (metadata && metadata.hydrate) {
		html = ReactDOM.renderToString(vnode);
		if ('renderToReadableStream' in ReactDOM) {
			html = await renderToReadableStreamAsync(vnode);
		} else {
			html = await renderToPipeableStreamAsync(vnode);
		}
	} else {
		if ('renderToReadableStream' in ReactDOM) {
			html = await renderToReadableStreamAsync(vnode);
		} else {
			html = await renderToStaticNodeStreamAsync(vnode);
		}
	}
	return { html };
}

async function renderToPipeableStreamAsync(vnode) {
	const Writable = await getNodeWritable();
	let html = '';
	return new Promise((resolve, reject) => {
		let error = undefined;
		let stream = ReactDOM.renderToPipeableStream(vnode, {
			onError(err) {
				error = err;
				reject(error);
			},
			onAllReady() {
				stream.pipe(
					new Writable({
						write(chunk, _encoding, callback) {
							html += chunk.toString('utf-8');
							callback();
						},
						destroy() {
							resolve(html);
						},
					})
				);
			},
		});
	});
}

async function renderToStaticNodeStreamAsync(vnode) {
	const Writable = await getNodeWritable();
	let html = '';
	return new Promise((resolve, reject) => {
		let stream = ReactDOM.renderToStaticNodeStream(vnode);
		stream.on('error', (err) => {
			reject(err);
		});
		stream.pipe(
			new Writable({
				write(chunk, _encoding, callback) {
					html += chunk.toString('utf-8');
					callback();
				},
				destroy() {
					resolve(html);
				},
			})
		);
	});
}

/**
 * Use a while loop instead of "for await" due to cloudflare and Vercel Edge issues
 * See https://github.com/facebook/react/issues/24169
 */
async function readResult(stream) {
	const reader = stream.getReader();
	let result = '';
	const decoder = new TextDecoder('utf-8');
	while (true) {
		const { done, value } = await reader.read();
		if (done) {
			if (value) {
				result += decoder.decode(value);
			} else {
				// This closes the decoder
				decoder.decode(new Uint8Array());
			}

			return result;
		}
		result += decoder.decode(value, { stream: true });
	}
}

async function renderToReadableStreamAsync(vnode) {
	return await readResult(await ReactDOM.renderToReadableStream(vnode));
}

const _renderer1 = {
	check: check$1,
	renderToStaticMarkup: renderToStaticMarkup$1,
};

const ASTRO_VERSION = "1.6.11";

function createDeprecatedFetchContentFn() {
  return () => {
    throw new Error("Deprecated: Astro.fetchContent() has been replaced with Astro.glob().");
  };
}
function createAstroGlobFn() {
  const globHandler = (importMetaGlobResult, globValue) => {
    let allEntries = [...Object.values(importMetaGlobResult)];
    if (allEntries.length === 0) {
      throw new Error(`Astro.glob(${JSON.stringify(globValue())}) - no matches found.`);
    }
    return Promise.all(allEntries.map((fn) => fn()));
  };
  return globHandler;
}
function createAstro(filePathname, _site, projectRootStr) {
  const site = _site ? new URL(_site) : void 0;
  const referenceURL = new URL(filePathname, `http://localhost`);
  const projectRoot = new URL(projectRootStr);
  return {
    site,
    generator: `Astro v${ASTRO_VERSION}`,
    fetchContent: createDeprecatedFetchContentFn(),
    glob: createAstroGlobFn(),
    resolve(...segments) {
      let resolved = segments.reduce((u, segment) => new URL(segment, u), referenceURL).pathname;
      if (resolved.startsWith(projectRoot.pathname)) {
        resolved = "/" + resolved.slice(projectRoot.pathname.length);
      }
      return resolved;
    }
  };
}

const escapeHTML = escape;
class HTMLBytes extends Uint8Array {
}
Object.defineProperty(HTMLBytes.prototype, Symbol.toStringTag, {
  get() {
    return "HTMLBytes";
  }
});
class HTMLString extends String {
  get [Symbol.toStringTag]() {
    return "HTMLString";
  }
}
const markHTMLString = (value) => {
  if (value instanceof HTMLString) {
    return value;
  }
  if (typeof value === "string") {
    return new HTMLString(value);
  }
  return value;
};
function isHTMLString(value) {
  return Object.prototype.toString.call(value) === "[object HTMLString]";
}
function markHTMLBytes(bytes) {
  return new HTMLBytes(bytes);
}
async function* unescapeChunksAsync(iterable) {
  for await (const chunk of iterable) {
    yield unescapeHTML(chunk);
  }
}
function* unescapeChunks(iterable) {
  for (const chunk of iterable) {
    yield unescapeHTML(chunk);
  }
}
function unescapeHTML(str) {
  if (!!str && typeof str === "object") {
    if (str instanceof Uint8Array) {
      return markHTMLBytes(str);
    } else if (str instanceof Response && str.body) {
      const body = str.body;
      return unescapeChunksAsync(body);
    } else if (typeof str.then === "function") {
      return Promise.resolve(str).then((value) => {
        return unescapeHTML(value);
      });
    } else if (Symbol.iterator in str) {
      return unescapeChunks(str);
    } else if (Symbol.asyncIterator in str) {
      return unescapeChunksAsync(str);
    }
  }
  return markHTMLString(str);
}

var idle_prebuilt_default = `(self.Astro=self.Astro||{}).idle=t=>{const e=async()=>{await(await t())()};"requestIdleCallback"in window?window.requestIdleCallback(e):setTimeout(e,200)},window.dispatchEvent(new Event("astro:idle"));`;

var load_prebuilt_default = `(self.Astro=self.Astro||{}).load=a=>{(async()=>await(await a())())()},window.dispatchEvent(new Event("astro:load"));`;

var media_prebuilt_default = `(self.Astro=self.Astro||{}).media=(s,a)=>{const t=async()=>{await(await s())()};if(a.value){const e=matchMedia(a.value);e.matches?t():e.addEventListener("change",t,{once:!0})}},window.dispatchEvent(new Event("astro:media"));`;

var only_prebuilt_default = `(self.Astro=self.Astro||{}).only=t=>{(async()=>await(await t())())()},window.dispatchEvent(new Event("astro:only"));`;

var visible_prebuilt_default = `(self.Astro=self.Astro||{}).visible=(s,c,n)=>{const r=async()=>{await(await s())()};let i=new IntersectionObserver(e=>{for(const t of e)if(!!t.isIntersecting){i.disconnect(),r();break}});for(let e=0;e<n.children.length;e++){const t=n.children[e];i.observe(t)}},window.dispatchEvent(new Event("astro:visible"));`;

var astro_island_prebuilt_default = `var l;{const c={0:t=>t,1:t=>JSON.parse(t,o),2:t=>new RegExp(t),3:t=>new Date(t),4:t=>new Map(JSON.parse(t,o)),5:t=>new Set(JSON.parse(t,o)),6:t=>BigInt(t),7:t=>new URL(t),8:t=>new Uint8Array(JSON.parse(t)),9:t=>new Uint16Array(JSON.parse(t)),10:t=>new Uint32Array(JSON.parse(t))},o=(t,s)=>{if(t===""||!Array.isArray(s))return s;const[e,n]=s;return e in c?c[e](n):void 0};customElements.get("astro-island")||customElements.define("astro-island",(l=class extends HTMLElement{constructor(){super(...arguments);this.hydrate=()=>{if(!this.hydrator||this.parentElement&&this.parentElement.closest("astro-island[ssr]"))return;const s=this.querySelectorAll("astro-slot"),e={},n=this.querySelectorAll("template[data-astro-template]");for(const r of n){const i=r.closest(this.tagName);!i||!i.isSameNode(this)||(e[r.getAttribute("data-astro-template")||"default"]=r.innerHTML,r.remove())}for(const r of s){const i=r.closest(this.tagName);!i||!i.isSameNode(this)||(e[r.getAttribute("name")||"default"]=r.innerHTML)}const a=this.hasAttribute("props")?JSON.parse(this.getAttribute("props"),o):{};this.hydrator(this)(this.Component,a,e,{client:this.getAttribute("client")}),this.removeAttribute("ssr"),window.removeEventListener("astro:hydrate",this.hydrate),window.dispatchEvent(new CustomEvent("astro:hydrate"))}}connectedCallback(){!this.hasAttribute("await-children")||this.firstChild?this.childrenConnectedCallback():new MutationObserver((s,e)=>{e.disconnect(),this.childrenConnectedCallback()}).observe(this,{childList:!0})}async childrenConnectedCallback(){window.addEventListener("astro:hydrate",this.hydrate);let s=this.getAttribute("before-hydration-url");s&&await import(s),this.start()}start(){const s=JSON.parse(this.getAttribute("opts")),e=this.getAttribute("client");if(Astro[e]===void 0){window.addEventListener(\`astro:\${e}\`,()=>this.start(),{once:!0});return}Astro[e](async()=>{const n=this.getAttribute("renderer-url"),[a,{default:r}]=await Promise.all([import(this.getAttribute("component-url")),n?import(n):()=>()=>{}]),i=this.getAttribute("component-export")||"default";if(!i.includes("."))this.Component=a[i];else{this.Component=a;for(const d of i.split("."))this.Component=this.Component[d]}return this.hydrator=r,this.hydrate},s,this)}attributeChangedCallback(){this.hydrator&&this.hydrate()}},l.observedAttributes=["props"],l))}`;

function determineIfNeedsHydrationScript(result) {
  if (result._metadata.hasHydrationScript) {
    return false;
  }
  return result._metadata.hasHydrationScript = true;
}
const hydrationScripts = {
  idle: idle_prebuilt_default,
  load: load_prebuilt_default,
  only: only_prebuilt_default,
  media: media_prebuilt_default,
  visible: visible_prebuilt_default
};
function determinesIfNeedsDirectiveScript(result, directive) {
  if (result._metadata.hasDirectives.has(directive)) {
    return false;
  }
  result._metadata.hasDirectives.add(directive);
  return true;
}
function getDirectiveScriptText(directive) {
  if (!(directive in hydrationScripts)) {
    throw new Error(`Unknown directive: ${directive}`);
  }
  const directiveScriptText = hydrationScripts[directive];
  return directiveScriptText;
}
function getPrescripts(type, directive) {
  switch (type) {
    case "both":
      return `<style>astro-island,astro-slot{display:contents}</style><script>${getDirectiveScriptText(directive) + astro_island_prebuilt_default}<\/script>`;
    case "directive":
      return `<script>${getDirectiveScriptText(directive)}<\/script>`;
  }
  return "";
}

const defineErrors = (errs) => errs;
const AstroErrorData = defineErrors({
  UnknownCompilerError: {
    title: "Unknown compiler error.",
    code: 1e3
  },
  StaticRedirectNotAvailable: {
    title: "`Astro.redirect` is not available in static mode.",
    code: 3001,
    message: "Redirects are only available when using `output: 'server'`. Update your Astro config if you need SSR features.",
    hint: "See https://docs.astro.build/en/guides/server-side-rendering/#enabling-ssr-in-your-project for more information on how to enable SSR."
  },
  ClientAddressNotAvailable: {
    title: "`Astro.clientAddress` is not available in current adapter.",
    code: 3002,
    message: (adapterName) => `\`Astro.clientAddress\` is not available in the \`${adapterName}\` adapter. File an issue with the adapter to add support.`
  },
  StaticClientAddressNotAvailable: {
    title: "`Astro.clientAddress` is not available in static mode.",
    code: 3003,
    message: "`Astro.clientAddress` is only available when using `output: 'server'`. Update your Astro config if you need SSR features.",
    hint: "See https://docs.astro.build/en/guides/server-side-rendering/#enabling-ssr-in-your-project for more information on how to enable SSR."
  },
  NoMatchingStaticPathFound: {
    title: "No static path found for requested path.",
    code: 3004,
    message: (pathName) => `A \`getStaticPaths()\` route pattern was matched, but no matching static path was found for requested path \`${pathName}\`.`,
    hint: (possibleRoutes) => `Possible dynamic routes being matched: ${possibleRoutes.join(", ")}.`
  },
  OnlyResponseCanBeReturned: {
    title: "Invalid type returned by Astro page.",
    code: 3005,
    message: (route, returnedValue) => `Route ${route ? route : ""} returned a \`${returnedValue}\`. Only a Response can be returned from Astro files.`,
    hint: "See https://docs.astro.build/en/guides/server-side-rendering/#response for more information."
  },
  MissingMediaQueryDirective: {
    title: "Missing value for `client:media` directive.",
    code: 3006,
    message: 'Media query not provided for `client:media` directive. A media query similar to `client:media="(max-width: 600px)"` must be provided'
  },
  NoMatchingRenderer: {
    title: "No matching renderer found.",
    code: 3007,
    message: (componentName, componentExtension, plural, validRenderersCount) => `Unable to render \`${componentName}\`.

${validRenderersCount > 0 ? `There ${plural ? "are." : "is."} ${validRenderersCount} renderer${plural ? "s." : ""} configured in your \`astro.config.mjs\` file,
but ${plural ? "none were." : "it was not."} able to server-side render \`${componentName}\`.` : `No valid renderer was found ${componentExtension ? `for the \`.${componentExtension}\` file extension.` : `for this file extension.`}`}`,
    hint: (probableRenderers) => `Did you mean to enable the ${probableRenderers} integration?

See https://docs.astro.build/en/core-concepts/framework-components/ for more information on how to install and configure integrations.`
  },
  NoClientEntrypoint: {
    title: "No client entrypoint specified in renderer.",
    code: 3008,
    message: (componentName, clientDirective, rendererName) => `\`${componentName}\` component has a \`client:${clientDirective}\` directive, but no client entrypoint was provided by \`${rendererName}\`.`,
    hint: "See https://docs.astro.build/en/reference/integrations-reference/#addrenderer-option for more information on how to configure your renderer."
  },
  NoClientOnlyHint: {
    title: "Missing hint on client:only directive.",
    code: 3009,
    message: (componentName) => `Unable to render \`${componentName}\`. When using the \`client:only\` hydration strategy, Astro needs a hint to use the correct renderer.`,
    hint: (probableRenderers) => `Did you mean to pass \`client:only="${probableRenderers}"\`? See https://docs.astro.build/en/reference/directives-reference/#clientonly for more information on client:only`
  },
  InvalidGetStaticPathParam: {
    title: "Invalid value returned by a `getStaticPaths` path.",
    code: 3010,
    message: (paramType) => `Invalid params given to \`getStaticPaths\` path. Expected an \`object\`, got \`${paramType}\``,
    hint: "See https://docs.astro.build/en/reference/api-reference/#getstaticpaths for more information on getStaticPaths."
  },
  InvalidGetStaticPathsReturn: {
    title: "Invalid value returned by getStaticPaths.",
    code: 3011,
    message: (returnType) => `Invalid type returned by \`getStaticPaths\`. Expected an \`array\`, got \`${returnType}\``,
    hint: "See https://docs.astro.build/en/reference/api-reference/#getstaticpaths for more information on getStaticPaths."
  },
  GetStaticPathsRemovedRSSHelper: {
    title: "getStaticPaths RSS helper is not available anymore.",
    code: 3012,
    message: "The RSS helper has been removed from `getStaticPaths`. Try the new @astrojs/rss package instead.",
    hint: "See https://docs.astro.build/en/guides/rss/ for more information."
  },
  GetStaticPathsExpectedParams: {
    title: "Missing params property on `getStaticPaths` route.",
    code: 3013,
    message: "Missing or empty required `params` property on `getStaticPaths` route.",
    hint: "See https://docs.astro.build/en/reference/api-reference/#getstaticpaths for more information on getStaticPaths."
  },
  GetStaticPathsInvalidRouteParam: {
    title: "Invalid value for `getStaticPaths` route parameter.",
    code: 3014,
    message: (key, value, valueType) => `Invalid getStaticPaths route parameter for \`${key}\`. Expected undefined, a string or a number, received \`${valueType}\` (\`${value}\`)`,
    hint: "See https://docs.astro.build/en/reference/api-reference/#getstaticpaths for more information on getStaticPaths."
  },
  GetStaticPathsRequired: {
    title: "`getStaticPaths()` function required for dynamic routes.",
    code: 3015,
    message: "`getStaticPaths()` function is required for dynamic routes. Make sure that you `export` a `getStaticPaths` function from your dynamic route.",
    hint: `See https://docs.astro.build/en/core-concepts/routing/#dynamic-routes for more information on dynamic routes.

Alternatively, set \`output: "server"\` in your Astro config file to switch to a non-static server build.
See https://docs.astro.build/en/guides/server-side-rendering/ for more information on non-static rendering.`
  },
  ReservedSlotName: {
    title: "Invalid slot name.",
    code: 3016,
    message: (slotName) => `Unable to create a slot named \`${slotName}\`. \`${slotName}\` is a reserved slot name. Please update the name of this slot.`
  },
  NoAdapterInstalled: {
    title: "Cannot use Server-side Rendering without an adapter.",
    code: 3017,
    message: `Cannot use \`output: 'server'\` without an adapter. Please install and configure the appropriate server adapter for your final deployment.`,
    hint: "See https://docs.astro.build/en/guides/server-side-rendering/ for more information."
  },
  NoMatchingImport: {
    title: "No import found for component.",
    code: 3018,
    message: (componentName) => `Could not render \`${componentName}\`. No matching import has been found for \`${componentName}\`.`,
    hint: "Please make sure the component is properly imported."
  },
  UnknownViteError: {
    title: "Unknown Vite Error.",
    code: 4e3
  },
  FailedToLoadModuleSSR: {
    title: "Could not import file.",
    code: 4001,
    message: (importName) => `Could not import \`${importName}\`.`,
    hint: "This is often caused by a typo in the import path. Please make sure the file exists."
  },
  InvalidGlob: {
    title: "Invalid glob pattern.",
    code: 4002,
    message: (globPattern) => `Invalid glob pattern: \`${globPattern}\`. Glob patterns must start with './', '../' or '/'.`,
    hint: "See https://docs.astro.build/en/guides/imports/#glob-patterns for more information on supported glob patterns."
  },
  UnknownCSSError: {
    title: "Unknown CSS Error.",
    code: 5e3
  },
  CSSSyntaxError: {
    title: "CSS Syntax Error.",
    code: 5001
  },
  UnknownMarkdownError: {
    title: "Unknown Markdown Error.",
    code: 6e3
  },
  MarkdownFrontmatterParseError: {
    title: "Failed to parse Markdown frontmatter.",
    code: 6001
  },
  UnknownConfigError: {
    title: "Unknown configuration error.",
    code: 7e3
  },
  ConfigNotFound: {
    title: "Specified configuration file not found.",
    code: 7001,
    message: (configFile) => `Unable to resolve \`--config "${configFile}"\`. Does the file exist?`
  },
  ConfigLegacyKey: {
    title: "Legacy configuration detected.",
    code: 7002,
    message: (legacyConfigKey) => `Legacy configuration detected: \`${legacyConfigKey}\`.`,
    hint: "Please update your configuration to the new format.\nSee https://astro.build/config for more information."
  },
  UnknownError: {
    title: "Unknown Error.",
    code: 99999
  }
});

function normalizeLF(code) {
  return code.replace(/\r\n|\r(?!\n)|\n/g, "\n");
}
function getErrorDataByCode(code) {
  const entry = Object.entries(AstroErrorData).find((data) => data[1].code === code);
  if (entry) {
    return {
      name: entry[0],
      data: entry[1]
    };
  }
}

function codeFrame(src, loc) {
  if (!loc || loc.line === void 0 || loc.column === void 0) {
    return "";
  }
  const lines = normalizeLF(src).split("\n").map((ln) => ln.replace(/\t/g, "  "));
  const visibleLines = [];
  for (let n = -2; n <= 2; n++) {
    if (lines[loc.line + n])
      visibleLines.push(loc.line + n);
  }
  let gutterWidth = 0;
  for (const lineNo of visibleLines) {
    let w = `> ${lineNo}`;
    if (w.length > gutterWidth)
      gutterWidth = w.length;
  }
  let output = "";
  for (const lineNo of visibleLines) {
    const isFocusedLine = lineNo === loc.line - 1;
    output += isFocusedLine ? "> " : "  ";
    output += `${lineNo + 1} | ${lines[lineNo]}
`;
    if (isFocusedLine)
      output += `${Array.from({ length: gutterWidth }).join(" ")}  | ${Array.from({
        length: loc.column
      }).join(" ")}^
`;
  }
  return output;
}

class AstroError extends Error {
  constructor(props, ...params) {
    var _a;
    super(...params);
    this.type = "AstroError";
    const { code, name, title, message, stack, location, hint, frame } = props;
    this.errorCode = code;
    if (name) {
      this.name = name;
    } else {
      this.name = ((_a = getErrorDataByCode(this.errorCode)) == null ? void 0 : _a.name) ?? "UnknownError";
    }
    this.title = title;
    if (message)
      this.message = message;
    this.stack = stack ? stack : this.stack;
    this.loc = location;
    this.hint = hint;
    this.frame = frame;
  }
  setErrorCode(errorCode) {
    var _a;
    this.errorCode = errorCode;
    this.name = ((_a = getErrorDataByCode(this.errorCode)) == null ? void 0 : _a.name) ?? "UnknownError";
  }
  setLocation(location) {
    this.loc = location;
  }
  setName(name) {
    this.name = name;
  }
  setMessage(message) {
    this.message = message;
  }
  setHint(hint) {
    this.hint = hint;
  }
  setFrame(source, location) {
    this.frame = codeFrame(source, location);
  }
  static is(err) {
    return err.type === "AstroError";
  }
}

const PROP_TYPE = {
  Value: 0,
  JSON: 1,
  RegExp: 2,
  Date: 3,
  Map: 4,
  Set: 5,
  BigInt: 6,
  URL: 7,
  Uint8Array: 8,
  Uint16Array: 9,
  Uint32Array: 10
};
function serializeArray(value, metadata = {}, parents = /* @__PURE__ */ new WeakSet()) {
  if (parents.has(value)) {
    throw new Error(`Cyclic reference detected while serializing props for <${metadata.displayName} client:${metadata.hydrate}>!

Cyclic references cannot be safely serialized for client-side usage. Please remove the cyclic reference.`);
  }
  parents.add(value);
  const serialized = value.map((v) => {
    return convertToSerializedForm(v, metadata, parents);
  });
  parents.delete(value);
  return serialized;
}
function serializeObject(value, metadata = {}, parents = /* @__PURE__ */ new WeakSet()) {
  if (parents.has(value)) {
    throw new Error(`Cyclic reference detected while serializing props for <${metadata.displayName} client:${metadata.hydrate}>!

Cyclic references cannot be safely serialized for client-side usage. Please remove the cyclic reference.`);
  }
  parents.add(value);
  const serialized = Object.fromEntries(
    Object.entries(value).map(([k, v]) => {
      return [k, convertToSerializedForm(v, metadata, parents)];
    })
  );
  parents.delete(value);
  return serialized;
}
function convertToSerializedForm(value, metadata = {}, parents = /* @__PURE__ */ new WeakSet()) {
  const tag = Object.prototype.toString.call(value);
  switch (tag) {
    case "[object Date]": {
      return [PROP_TYPE.Date, value.toISOString()];
    }
    case "[object RegExp]": {
      return [PROP_TYPE.RegExp, value.source];
    }
    case "[object Map]": {
      return [
        PROP_TYPE.Map,
        JSON.stringify(serializeArray(Array.from(value), metadata, parents))
      ];
    }
    case "[object Set]": {
      return [
        PROP_TYPE.Set,
        JSON.stringify(serializeArray(Array.from(value), metadata, parents))
      ];
    }
    case "[object BigInt]": {
      return [PROP_TYPE.BigInt, value.toString()];
    }
    case "[object URL]": {
      return [PROP_TYPE.URL, value.toString()];
    }
    case "[object Array]": {
      return [PROP_TYPE.JSON, JSON.stringify(serializeArray(value, metadata, parents))];
    }
    case "[object Uint8Array]": {
      return [PROP_TYPE.Uint8Array, JSON.stringify(Array.from(value))];
    }
    case "[object Uint16Array]": {
      return [PROP_TYPE.Uint16Array, JSON.stringify(Array.from(value))];
    }
    case "[object Uint32Array]": {
      return [PROP_TYPE.Uint32Array, JSON.stringify(Array.from(value))];
    }
    default: {
      if (value !== null && typeof value === "object") {
        return [PROP_TYPE.Value, serializeObject(value, metadata, parents)];
      } else {
        return [PROP_TYPE.Value, value];
      }
    }
  }
}
function serializeProps(props, metadata) {
  const serialized = JSON.stringify(serializeObject(props, metadata));
  return serialized;
}

function serializeListValue(value) {
  const hash = {};
  push(value);
  return Object.keys(hash).join(" ");
  function push(item) {
    if (item && typeof item.forEach === "function")
      item.forEach(push);
    else if (item === Object(item))
      Object.keys(item).forEach((name) => {
        if (item[name])
          push(name);
      });
    else {
      item = item === false || item == null ? "" : String(item).trim();
      if (item) {
        item.split(/\s+/).forEach((name) => {
          hash[name] = true;
        });
      }
    }
  }
}
function isPromise(value) {
  return !!value && typeof value === "object" && typeof value.then === "function";
}

const HydrationDirectivesRaw = ["load", "idle", "media", "visible", "only"];
const HydrationDirectives = new Set(HydrationDirectivesRaw);
const HydrationDirectiveProps = new Set(HydrationDirectivesRaw.map((n) => `client:${n}`));
function extractDirectives(displayName, inputProps) {
  let extracted = {
    isPage: false,
    hydration: null,
    props: {}
  };
  for (const [key, value] of Object.entries(inputProps)) {
    if (key.startsWith("server:")) {
      if (key === "server:root") {
        extracted.isPage = true;
      }
    }
    if (key.startsWith("client:")) {
      if (!extracted.hydration) {
        extracted.hydration = {
          directive: "",
          value: "",
          componentUrl: "",
          componentExport: { value: "" }
        };
      }
      switch (key) {
        case "client:component-path": {
          extracted.hydration.componentUrl = value;
          break;
        }
        case "client:component-export": {
          extracted.hydration.componentExport.value = value;
          break;
        }
        case "client:component-hydration": {
          break;
        }
        case "client:display-name": {
          break;
        }
        default: {
          extracted.hydration.directive = key.split(":")[1];
          extracted.hydration.value = value;
          if (!HydrationDirectives.has(extracted.hydration.directive)) {
            throw new Error(
              `Error: invalid hydration directive "${key}". Supported hydration methods: ${Array.from(
                HydrationDirectiveProps
              ).join(", ")}`
            );
          }
          if (extracted.hydration.directive === "media" && typeof extracted.hydration.value !== "string") {
            throw new AstroError(AstroErrorData.MissingMediaQueryDirective);
          }
          break;
        }
      }
    } else if (key === "class:list") {
      if (value) {
        extracted.props[key.slice(0, -5)] = serializeListValue(value);
      }
    } else {
      extracted.props[key] = value;
    }
  }
  for (const sym of Object.getOwnPropertySymbols(inputProps)) {
    extracted.props[sym] = inputProps[sym];
  }
  return extracted;
}
async function generateHydrateScript(scriptOptions, metadata) {
  const { renderer, result, astroId, props, attrs } = scriptOptions;
  const { hydrate, componentUrl, componentExport } = metadata;
  if (!componentExport.value) {
    throw new Error(
      `Unable to resolve a valid export for "${metadata.displayName}"! Please open an issue at https://astro.build/issues!`
    );
  }
  const island = {
    children: "",
    props: {
      uid: astroId
    }
  };
  if (attrs) {
    for (const [key, value] of Object.entries(attrs)) {
      island.props[key] = escapeHTML(value);
    }
  }
  island.props["component-url"] = await result.resolve(decodeURI(componentUrl));
  if (renderer.clientEntrypoint) {
    island.props["component-export"] = componentExport.value;
    island.props["renderer-url"] = await result.resolve(decodeURI(renderer.clientEntrypoint));
    island.props["props"] = escapeHTML(serializeProps(props, metadata));
  }
  island.props["ssr"] = "";
  island.props["client"] = hydrate;
  let beforeHydrationUrl = await result.resolve("astro:scripts/before-hydration.js");
  if (beforeHydrationUrl.length) {
    island.props["before-hydration-url"] = beforeHydrationUrl;
  }
  island.props["opts"] = escapeHTML(
    JSON.stringify({
      name: metadata.displayName,
      value: metadata.hydrateArgs || ""
    })
  );
  return island;
}

function validateComponentProps(props, displayName) {
  var _a;
  if (((_a = (Object.assign({"BASE_URL":"/","MODE":"production","DEV":false,"PROD":true},{_:process.env._,}))) == null ? void 0 : _a.DEV) && props != null) {
    for (const prop of Object.keys(props)) {
      if (HydrationDirectiveProps.has(prop)) {
        console.warn(
          `You are attempting to render <${displayName} ${prop} />, but ${displayName} is an Astro component. Astro components do not render in the client and should not have a hydration directive. Please use a framework component for client rendering.`
        );
      }
    }
  }
}
class AstroComponent {
  constructor(htmlParts, expressions) {
    this.htmlParts = htmlParts;
    this.error = void 0;
    this.expressions = expressions.map((expression) => {
      if (isPromise(expression)) {
        return Promise.resolve(expression).catch((err) => {
          if (!this.error) {
            this.error = err;
            throw err;
          }
        });
      }
      return expression;
    });
  }
  get [Symbol.toStringTag]() {
    return "AstroComponent";
  }
  async *[Symbol.asyncIterator]() {
    const { htmlParts, expressions } = this;
    for (let i = 0; i < htmlParts.length; i++) {
      const html = htmlParts[i];
      const expression = expressions[i];
      yield markHTMLString(html);
      yield* renderChild(expression);
    }
  }
}
function isAstroComponent(obj) {
  return typeof obj === "object" && Object.prototype.toString.call(obj) === "[object AstroComponent]";
}
function isAstroComponentFactory(obj) {
  return obj == null ? false : obj.isAstroComponentFactory === true;
}
async function* renderAstroComponent(component) {
  for await (const value of component) {
    if (value || value === 0) {
      for await (const chunk of renderChild(value)) {
        switch (chunk.type) {
          case "directive": {
            yield chunk;
            break;
          }
          default: {
            yield markHTMLString(chunk);
            break;
          }
        }
      }
    }
  }
}
async function renderToString(result, componentFactory, props, children) {
  const Component = await componentFactory(result, props, children);
  if (!isAstroComponent(Component)) {
    const response = Component;
    throw response;
  }
  let parts = new HTMLParts();
  for await (const chunk of renderAstroComponent(Component)) {
    parts.append(chunk, result);
  }
  return parts.toString();
}
async function renderToIterable(result, componentFactory, displayName, props, children) {
  validateComponentProps(props, displayName);
  const Component = await componentFactory(result, props, children);
  if (!isAstroComponent(Component)) {
    console.warn(
      `Returning a Response is only supported inside of page components. Consider refactoring this logic into something like a function that can be used in the page.`
    );
    const response = Component;
    throw response;
  }
  return renderAstroComponent(Component);
}
async function renderTemplate(htmlParts, ...expressions) {
  return new AstroComponent(htmlParts, expressions);
}

async function* renderChild(child) {
  child = await child;
  if (child instanceof SlotString) {
    if (child.instructions) {
      yield* child.instructions;
    }
    yield child;
  } else if (isHTMLString(child)) {
    yield child;
  } else if (Array.isArray(child)) {
    for (const value of child) {
      yield markHTMLString(await renderChild(value));
    }
  } else if (typeof child === "function") {
    yield* renderChild(child());
  } else if (typeof child === "string") {
    yield markHTMLString(escapeHTML(child));
  } else if (!child && child !== 0) ; else if (child instanceof AstroComponent || Object.prototype.toString.call(child) === "[object AstroComponent]") {
    yield* renderAstroComponent(child);
  } else if (ArrayBuffer.isView(child)) {
    yield child;
  } else if (typeof child === "object" && (Symbol.asyncIterator in child || Symbol.iterator in child)) {
    yield* child;
  } else {
    yield child;
  }
}

const slotString = Symbol.for("astro:slot-string");
class SlotString extends HTMLString {
  constructor(content, instructions) {
    super(content);
    this.instructions = instructions;
    this[slotString] = true;
  }
}
function isSlotString(str) {
  return !!str[slotString];
}
async function renderSlot(_result, slotted, fallback) {
  if (slotted) {
    let iterator = renderChild(slotted);
    let content = "";
    let instructions = null;
    for await (const chunk of iterator) {
      if (chunk.type === "directive") {
        if (instructions === null) {
          instructions = [];
        }
        instructions.push(chunk);
      } else {
        content += chunk;
      }
    }
    return markHTMLString(new SlotString(content, instructions));
  }
  return fallback;
}
async function renderSlots(result, slots = {}) {
  let slotInstructions = null;
  let children = {};
  if (slots) {
    await Promise.all(
      Object.entries(slots).map(
        ([key, value]) => renderSlot(result, value).then((output) => {
          if (output.instructions) {
            if (slotInstructions === null) {
              slotInstructions = [];
            }
            slotInstructions.push(...output.instructions);
          }
          children[key] = output;
        })
      )
    );
  }
  return { slotInstructions, children };
}

const Fragment = Symbol.for("astro:fragment");
const Renderer = Symbol.for("astro:renderer");
const encoder = new TextEncoder();
const decoder = new TextDecoder();
function stringifyChunk(result, chunk) {
  switch (chunk.type) {
    case "directive": {
      const { hydration } = chunk;
      let needsHydrationScript = hydration && determineIfNeedsHydrationScript(result);
      let needsDirectiveScript = hydration && determinesIfNeedsDirectiveScript(result, hydration.directive);
      let prescriptType = needsHydrationScript ? "both" : needsDirectiveScript ? "directive" : null;
      if (prescriptType) {
        let prescripts = getPrescripts(prescriptType, hydration.directive);
        return markHTMLString(prescripts);
      } else {
        return "";
      }
    }
    default: {
      if (isSlotString(chunk)) {
        let out = "";
        const c = chunk;
        if (c.instructions) {
          for (const instr of c.instructions) {
            out += stringifyChunk(result, instr);
          }
        }
        out += chunk.toString();
        return out;
      }
      return chunk.toString();
    }
  }
}
class HTMLParts {
  constructor() {
    this.parts = "";
  }
  append(part, result) {
    if (ArrayBuffer.isView(part)) {
      this.parts += decoder.decode(part);
    } else {
      this.parts += stringifyChunk(result, part);
    }
  }
  toString() {
    return this.parts;
  }
  toArrayBuffer() {
    return encoder.encode(this.parts);
  }
}

const ClientOnlyPlaceholder = "astro-client-only";
class Skip {
  constructor(vnode) {
    this.vnode = vnode;
    this.count = 0;
  }
  increment() {
    this.count++;
  }
  haveNoTried() {
    return this.count === 0;
  }
  isCompleted() {
    return this.count > 2;
  }
}
Skip.symbol = Symbol("astro:jsx:skip");
let originalConsoleError;
let consoleFilterRefs = 0;
async function renderJSX(result, vnode) {
  switch (true) {
    case vnode instanceof HTMLString:
      if (vnode.toString().trim() === "") {
        return "";
      }
      return vnode;
    case typeof vnode === "string":
      return markHTMLString(escapeHTML(vnode));
    case typeof vnode === "function":
      return vnode;
    case (!vnode && vnode !== 0):
      return "";
    case Array.isArray(vnode):
      return markHTMLString(
        (await Promise.all(vnode.map((v) => renderJSX(result, v)))).join("")
      );
  }
  let skip;
  if (vnode.props) {
    if (vnode.props[Skip.symbol]) {
      skip = vnode.props[Skip.symbol];
    } else {
      skip = new Skip(vnode);
    }
  } else {
    skip = new Skip(vnode);
  }
  return renderJSXVNode(result, vnode, skip);
}
async function renderJSXVNode(result, vnode, skip) {
  if (isVNode(vnode)) {
    switch (true) {
      case !vnode.type: {
        throw new Error(`Unable to render ${result._metadata.pathname} because it contains an undefined Component!
Did you forget to import the component or is it possible there is a typo?`);
      }
      case vnode.type === Symbol.for("astro:fragment"):
        return renderJSX(result, vnode.props.children);
      case vnode.type.isAstroComponentFactory: {
        let props = {};
        let slots = {};
        for (const [key, value] of Object.entries(vnode.props ?? {})) {
          if (key === "children" || value && typeof value === "object" && value["$$slot"]) {
            slots[key === "children" ? "default" : key] = () => renderJSX(result, value);
          } else {
            props[key] = value;
          }
        }
        return markHTMLString(await renderToString(result, vnode.type, props, slots));
      }
      case (!vnode.type && vnode.type !== 0):
        return "";
      case (typeof vnode.type === "string" && vnode.type !== ClientOnlyPlaceholder):
        return markHTMLString(await renderElement$1(result, vnode.type, vnode.props ?? {}));
    }
    if (vnode.type) {
      let extractSlots2 = function(child) {
        if (Array.isArray(child)) {
          return child.map((c) => extractSlots2(c));
        }
        if (!isVNode(child)) {
          _slots.default.push(child);
          return;
        }
        if ("slot" in child.props) {
          _slots[child.props.slot] = [..._slots[child.props.slot] ?? [], child];
          delete child.props.slot;
          return;
        }
        _slots.default.push(child);
      };
      if (typeof vnode.type === "function" && vnode.type["astro:renderer"]) {
        skip.increment();
      }
      if (typeof vnode.type === "function" && vnode.props["server:root"]) {
        const output2 = await vnode.type(vnode.props ?? {});
        return await renderJSX(result, output2);
      }
      if (typeof vnode.type === "function") {
        if (skip.haveNoTried() || skip.isCompleted()) {
          useConsoleFilter();
          try {
            const output2 = await vnode.type(vnode.props ?? {});
            let renderResult;
            if (output2 && output2[AstroJSX]) {
              renderResult = await renderJSXVNode(result, output2, skip);
              return renderResult;
            } else if (!output2) {
              renderResult = await renderJSXVNode(result, output2, skip);
              return renderResult;
            }
          } catch (e) {
            if (skip.isCompleted()) {
              throw e;
            }
            skip.increment();
          } finally {
            finishUsingConsoleFilter();
          }
        } else {
          skip.increment();
        }
      }
      const { children = null, ...props } = vnode.props ?? {};
      const _slots = {
        default: []
      };
      extractSlots2(children);
      for (const [key, value] of Object.entries(props)) {
        if (value["$$slot"]) {
          _slots[key] = value;
          delete props[key];
        }
      }
      const slotPromises = [];
      const slots = {};
      for (const [key, value] of Object.entries(_slots)) {
        slotPromises.push(
          renderJSX(result, value).then((output2) => {
            if (output2.toString().trim().length === 0)
              return;
            slots[key] = () => output2;
          })
        );
      }
      await Promise.all(slotPromises);
      props[Skip.symbol] = skip;
      let output;
      if (vnode.type === ClientOnlyPlaceholder && vnode.props["client:only"]) {
        output = await renderComponent(
          result,
          vnode.props["client:display-name"] ?? "",
          null,
          props,
          slots
        );
      } else {
        output = await renderComponent(
          result,
          typeof vnode.type === "function" ? vnode.type.name : vnode.type,
          vnode.type,
          props,
          slots
        );
      }
      if (typeof output !== "string" && Symbol.asyncIterator in output) {
        let parts = new HTMLParts();
        for await (const chunk of output) {
          parts.append(chunk, result);
        }
        return markHTMLString(parts.toString());
      } else {
        return markHTMLString(output);
      }
    }
  }
  return markHTMLString(`${vnode}`);
}
async function renderElement$1(result, tag, { children, ...props }) {
  return markHTMLString(
    `<${tag}${spreadAttributes(props)}${markHTMLString(
      (children == null || children == "") && voidElementNames.test(tag) ? `/>` : `>${children == null ? "" : await renderJSX(result, children)}</${tag}>`
    )}`
  );
}
function useConsoleFilter() {
  consoleFilterRefs++;
  if (!originalConsoleError) {
    originalConsoleError = console.error;
    try {
      console.error = filteredConsoleError;
    } catch (error) {
    }
  }
}
function finishUsingConsoleFilter() {
  consoleFilterRefs--;
}
function filteredConsoleError(msg, ...rest) {
  if (consoleFilterRefs > 0 && typeof msg === "string") {
    const isKnownReactHookError = msg.includes("Warning: Invalid hook call.") && msg.includes("https://reactjs.org/link/invalid-hook-call");
    if (isKnownReactHookError)
      return;
  }
  originalConsoleError(msg, ...rest);
}

/**
 * shortdash - https://github.com/bibig/node-shorthash
 *
 * @license
 *
 * (The MIT License)
 *
 * Copyright (c) 2013 Bibig <bibig@me.com>
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */
const dictionary = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXY";
const binary = dictionary.length;
function bitwise(str) {
  let hash = 0;
  if (str.length === 0)
    return hash;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash = (hash << 5) - hash + ch;
    hash = hash & hash;
  }
  return hash;
}
function shorthash(text) {
  let num;
  let result = "";
  let integer = bitwise(text);
  const sign = integer < 0 ? "Z" : "";
  integer = Math.abs(integer);
  while (integer >= binary) {
    num = integer % binary;
    integer = Math.floor(integer / binary);
    result = dictionary[num] + result;
  }
  if (integer > 0) {
    result = dictionary[integer] + result;
  }
  return sign + result;
}

const voidElementNames = /^(area|base|br|col|command|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)$/i;
const htmlBooleanAttributes = /^(allowfullscreen|async|autofocus|autoplay|controls|default|defer|disabled|disablepictureinpicture|disableremoteplayback|formnovalidate|hidden|loop|nomodule|novalidate|open|playsinline|readonly|required|reversed|scoped|seamless|itemscope)$/i;
const htmlEnumAttributes = /^(contenteditable|draggable|spellcheck|value)$/i;
const svgEnumAttributes = /^(autoReverse|externalResourcesRequired|focusable|preserveAlpha)$/i;
const STATIC_DIRECTIVES = /* @__PURE__ */ new Set(["set:html", "set:text"]);
const toIdent = (k) => k.trim().replace(/(?:(?!^)\b\w|\s+|[^\w]+)/g, (match, index) => {
  if (/[^\w]|\s/.test(match))
    return "";
  return index === 0 ? match : match.toUpperCase();
});
const toAttributeString = (value, shouldEscape = true) => shouldEscape ? String(value).replace(/&/g, "&#38;").replace(/"/g, "&#34;") : value;
const kebab = (k) => k.toLowerCase() === k ? k : k.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
const toStyleString = (obj) => Object.entries(obj).map(([k, v]) => `${kebab(k)}:${v}`).join(";");
function defineScriptVars(vars) {
  let output = "";
  for (const [key, value] of Object.entries(vars)) {
    output += `const ${toIdent(key)} = ${JSON.stringify(value)};
`;
  }
  return markHTMLString(output);
}
function formatList(values) {
  if (values.length === 1) {
    return values[0];
  }
  return `${values.slice(0, -1).join(", ")} or ${values[values.length - 1]}`;
}
function addAttribute(value, key, shouldEscape = true) {
  if (value == null) {
    return "";
  }
  if (value === false) {
    if (htmlEnumAttributes.test(key) || svgEnumAttributes.test(key)) {
      return markHTMLString(` ${key}="false"`);
    }
    return "";
  }
  if (STATIC_DIRECTIVES.has(key)) {
    console.warn(`[astro] The "${key}" directive cannot be applied dynamically at runtime. It will not be rendered as an attribute.

Make sure to use the static attribute syntax (\`${key}={value}\`) instead of the dynamic spread syntax (\`{...{ "${key}": value }}\`).`);
    return "";
  }
  if (key === "class:list") {
    const listValue = toAttributeString(serializeListValue(value), shouldEscape);
    if (listValue === "") {
      return "";
    }
    return markHTMLString(` ${key.slice(0, -5)}="${listValue}"`);
  }
  if (key === "style" && !(value instanceof HTMLString) && typeof value === "object") {
    return markHTMLString(` ${key}="${toAttributeString(toStyleString(value), shouldEscape)}"`);
  }
  if (key === "className") {
    return markHTMLString(` class="${toAttributeString(value, shouldEscape)}"`);
  }
  if (value === true && (key.startsWith("data-") || htmlBooleanAttributes.test(key))) {
    return markHTMLString(` ${key}`);
  } else {
    return markHTMLString(` ${key}="${toAttributeString(value, shouldEscape)}"`);
  }
}
function internalSpreadAttributes(values, shouldEscape = true) {
  let output = "";
  for (const [key, value] of Object.entries(values)) {
    output += addAttribute(value, key, shouldEscape);
  }
  return markHTMLString(output);
}
function renderElement(name, { props: _props, children = "" }, shouldEscape = true) {
  const { lang: _, "data-astro-id": astroId, "define:vars": defineVars, ...props } = _props;
  if (defineVars) {
    if (name === "style") {
      delete props["is:global"];
      delete props["is:scoped"];
    }
    if (name === "script") {
      delete props.hoist;
      children = defineScriptVars(defineVars) + "\n" + children;
    }
  }
  if ((children == null || children == "") && voidElementNames.test(name)) {
    return `<${name}${internalSpreadAttributes(props, shouldEscape)} />`;
  }
  return `<${name}${internalSpreadAttributes(props, shouldEscape)}>${children}</${name}>`;
}

function componentIsHTMLElement(Component) {
  return typeof HTMLElement !== "undefined" && HTMLElement.isPrototypeOf(Component);
}
async function renderHTMLElement(result, constructor, props, slots) {
  const name = getHTMLElementName(constructor);
  let attrHTML = "";
  for (const attr in props) {
    attrHTML += ` ${attr}="${toAttributeString(await props[attr])}"`;
  }
  return markHTMLString(
    `<${name}${attrHTML}>${await renderSlot(result, slots == null ? void 0 : slots.default)}</${name}>`
  );
}
function getHTMLElementName(constructor) {
  const definedName = customElements.getName(constructor);
  if (definedName)
    return definedName;
  const assignedName = constructor.name.replace(/^HTML|Element$/g, "").replace(/[A-Z]/g, "-$&").toLowerCase().replace(/^-/, "html-");
  return assignedName;
}

const rendererAliases = /* @__PURE__ */ new Map([["solid", "solid-js"]]);
function guessRenderers(componentUrl) {
  const extname = componentUrl == null ? void 0 : componentUrl.split(".").pop();
  switch (extname) {
    case "svelte":
      return ["@astrojs/svelte"];
    case "vue":
      return ["@astrojs/vue"];
    case "jsx":
    case "tsx":
      return ["@astrojs/react", "@astrojs/preact", "@astrojs/solid", "@astrojs/vue (jsx)"];
    default:
      return [
        "@astrojs/react",
        "@astrojs/preact",
        "@astrojs/solid",
        "@astrojs/vue",
        "@astrojs/svelte"
      ];
  }
}
function getComponentType(Component) {
  if (Component === Fragment) {
    return "fragment";
  }
  if (Component && typeof Component === "object" && Component["astro:html"]) {
    return "html";
  }
  if (isAstroComponentFactory(Component)) {
    return "astro-factory";
  }
  return "unknown";
}
async function renderComponent(result, displayName, Component, _props, slots = {}, route) {
  var _a, _b;
  Component = await Component ?? Component;
  switch (getComponentType(Component)) {
    case "fragment": {
      const children2 = await renderSlot(result, slots == null ? void 0 : slots.default);
      if (children2 == null) {
        return children2;
      }
      return markHTMLString(children2);
    }
    case "html": {
      const { slotInstructions: slotInstructions2, children: children2 } = await renderSlots(result, slots);
      const html2 = Component.render({ slots: children2 });
      const hydrationHtml = slotInstructions2 ? slotInstructions2.map((instr) => stringifyChunk(result, instr)).join("") : "";
      return markHTMLString(hydrationHtml + html2);
    }
    case "astro-factory": {
      async function* renderAstroComponentInline() {
        let iterable = await renderToIterable(result, Component, displayName, _props, slots);
        yield* iterable;
      }
      return renderAstroComponentInline();
    }
  }
  if (!Component && !_props["client:only"]) {
    throw new Error(
      `Unable to render ${displayName} because it is ${Component}!
Did you forget to import the component or is it possible there is a typo?`
    );
  }
  const { renderers } = result._metadata;
  const metadata = { displayName };
  const { hydration, isPage, props } = extractDirectives(displayName, _props);
  let html = "";
  let attrs = void 0;
  if (hydration) {
    metadata.hydrate = hydration.directive;
    metadata.hydrateArgs = hydration.value;
    metadata.componentExport = hydration.componentExport;
    metadata.componentUrl = hydration.componentUrl;
  }
  const probableRendererNames = guessRenderers(metadata.componentUrl);
  const validRenderers = renderers.filter((r) => r.name !== "astro:jsx");
  const { children, slotInstructions } = await renderSlots(result, slots);
  let renderer;
  if (metadata.hydrate !== "only") {
    let isTagged = false;
    try {
      isTagged = Component && Component[Renderer];
    } catch {
    }
    if (isTagged) {
      const rendererName = Component[Renderer];
      renderer = renderers.find(({ name }) => name === rendererName);
    }
    if (!renderer) {
      let error;
      for (const r of renderers) {
        try {
          if (await r.ssr.check.call({ result }, Component, props, children)) {
            renderer = r;
            break;
          }
        } catch (e) {
          error ?? (error = e);
        }
      }
      if (!renderer && error) {
        throw error;
      }
    }
    if (!renderer && typeof HTMLElement === "function" && componentIsHTMLElement(Component)) {
      const output = renderHTMLElement(result, Component, _props, slots);
      return output;
    }
  } else {
    if (metadata.hydrateArgs) {
      const passedName = metadata.hydrateArgs;
      const rendererName = rendererAliases.has(passedName) ? rendererAliases.get(passedName) : passedName;
      renderer = renderers.find(
        ({ name }) => name === `@astrojs/${rendererName}` || name === rendererName
      );
    }
    if (!renderer && validRenderers.length === 1) {
      renderer = validRenderers[0];
    }
    if (!renderer) {
      const extname = (_a = metadata.componentUrl) == null ? void 0 : _a.split(".").pop();
      renderer = renderers.filter(
        ({ name }) => name === `@astrojs/${extname}` || name === extname
      )[0];
    }
  }
  if (!renderer) {
    if (metadata.hydrate === "only") {
      throw new AstroError({
        ...AstroErrorData.NoClientOnlyHint,
        message: AstroErrorData.NoClientOnlyHint.message(metadata.displayName),
        hint: AstroErrorData.NoClientOnlyHint.hint(
          probableRendererNames.map((r) => r.replace("@astrojs/", "")).join("|")
        )
      });
    } else if (typeof Component !== "string") {
      const matchingRenderers = validRenderers.filter(
        (r) => probableRendererNames.includes(r.name)
      );
      const plural = validRenderers.length > 1;
      if (matchingRenderers.length === 0) {
        throw new AstroError({
          ...AstroErrorData.NoMatchingRenderer,
          message: AstroErrorData.NoMatchingRenderer.message(
            metadata.displayName,
            (_b = metadata == null ? void 0 : metadata.componentUrl) == null ? void 0 : _b.split(".").pop(),
            plural,
            validRenderers.length
          ),
          hint: AstroErrorData.NoMatchingRenderer.hint(
            formatList(probableRendererNames.map((r) => "`" + r + "`"))
          )
        });
      } else if (matchingRenderers.length === 1) {
        renderer = matchingRenderers[0];
        ({ html, attrs } = await renderer.ssr.renderToStaticMarkup.call(
          { result },
          Component,
          props,
          children,
          metadata
        ));
      } else {
        throw new Error(`Unable to render ${metadata.displayName}!

This component likely uses ${formatList(probableRendererNames)},
but Astro encountered an error during server-side rendering.

Please ensure that ${metadata.displayName}:
1. Does not unconditionally access browser-specific globals like \`window\` or \`document\`.
   If this is unavoidable, use the \`client:only\` hydration directive.
2. Does not conditionally return \`null\` or \`undefined\` when rendered on the server.

If you're still stuck, please open an issue on GitHub or join us at https://astro.build/chat.`);
      }
    }
  } else {
    if (metadata.hydrate === "only") {
      html = await renderSlot(result, slots == null ? void 0 : slots.fallback);
    } else {
      ({ html, attrs } = await renderer.ssr.renderToStaticMarkup.call(
        { result },
        Component,
        props,
        children,
        metadata
      ));
    }
  }
  if (renderer && !renderer.clientEntrypoint && renderer.name !== "@astrojs/lit" && metadata.hydrate) {
    throw new AstroError({
      ...AstroErrorData.NoClientEntrypoint,
      message: AstroErrorData.NoClientEntrypoint.message(
        displayName,
        metadata.hydrate,
        renderer.name
      )
    });
  }
  if (!html && typeof Component === "string") {
    const childSlots = Object.values(children).join("");
    const iterable = renderAstroComponent(
      await renderTemplate`<${Component}${internalSpreadAttributes(props)}${markHTMLString(
        childSlots === "" && voidElementNames.test(Component) ? `/>` : `>${childSlots}</${Component}>`
      )}`
    );
    html = "";
    for await (const chunk of iterable) {
      html += chunk;
    }
  }
  if (!hydration) {
    return async function* () {
      if (slotInstructions) {
        yield* slotInstructions;
      }
      if (isPage || (renderer == null ? void 0 : renderer.name) === "astro:jsx") {
        yield html;
      } else {
        yield markHTMLString(html.replace(/\<\/?astro-slot\>/g, ""));
      }
    }();
  }
  const astroId = shorthash(
    `<!--${metadata.componentExport.value}:${metadata.componentUrl}-->
${html}
${serializeProps(
      props,
      metadata
    )}`
  );
  const island = await generateHydrateScript(
    { renderer, result, astroId, props, attrs },
    metadata
  );
  let unrenderedSlots = [];
  if (html) {
    if (Object.keys(children).length > 0) {
      for (const key of Object.keys(children)) {
        if (!html.includes(key === "default" ? `<astro-slot>` : `<astro-slot name="${key}">`)) {
          unrenderedSlots.push(key);
        }
      }
    }
  } else {
    unrenderedSlots = Object.keys(children);
  }
  const template = unrenderedSlots.length > 0 ? unrenderedSlots.map(
    (key) => `<template data-astro-template${key !== "default" ? `="${key}"` : ""}>${children[key]}</template>`
  ).join("") : "";
  island.children = `${html ?? ""}${template}`;
  if (island.children) {
    island.props["await-children"] = "";
  }
  async function* renderAll() {
    if (slotInstructions) {
      yield* slotInstructions;
    }
    yield { type: "directive", hydration, result };
    yield markHTMLString(renderElement("astro-island", island, false));
  }
  return renderAll();
}

const uniqueElements = (item, index, all) => {
  const props = JSON.stringify(item.props);
  const children = item.children;
  return index === all.findIndex((i) => JSON.stringify(i.props) === props && i.children == children);
};
function renderHead(result) {
  result._metadata.hasRenderedHead = true;
  const styles = Array.from(result.styles).filter(uniqueElements).map((style) => renderElement("style", style));
  result.styles.clear();
  const scripts = Array.from(result.scripts).filter(uniqueElements).map((script, i) => {
    return renderElement("script", script, false);
  });
  const links = Array.from(result.links).filter(uniqueElements).map((link) => renderElement("link", link, false));
  return markHTMLString(links.join("\n") + styles.join("\n") + scripts.join("\n"));
}
async function* maybeRenderHead(result) {
  if (result._metadata.hasRenderedHead) {
    return;
  }
  yield renderHead(result);
}

typeof process === "object" && Object.prototype.toString.call(process) === "[object process]";

function createComponent(cb) {
  cb.isAstroComponentFactory = true;
  return cb;
}
function __astro_tag_component__(Component, rendererName) {
  if (!Component)
    return;
  if (typeof Component !== "function")
    return;
  Object.defineProperty(Component, Renderer, {
    value: rendererName,
    enumerable: false,
    writable: false
  });
}
function spreadAttributes(values, _name, { class: scopedClassName } = {}) {
  let output = "";
  if (scopedClassName) {
    if (typeof values.class !== "undefined") {
      values.class += ` ${scopedClassName}`;
    } else if (typeof values["class:list"] !== "undefined") {
      values["class:list"] = [values["class:list"], scopedClassName];
    } else {
      values.class = scopedClassName;
    }
  }
  for (const [key, value] of Object.entries(values)) {
    output += addAttribute(value, key, true);
  }
  return markHTMLString(output);
}

const AstroJSX = "astro:jsx";
const Empty = Symbol("empty");
const toSlotName = (slotAttr) => slotAttr;
function isVNode(vnode) {
  return vnode && typeof vnode === "object" && vnode[AstroJSX];
}
function transformSlots(vnode) {
  if (typeof vnode.type === "string")
    return vnode;
  const slots = {};
  if (isVNode(vnode.props.children)) {
    const child = vnode.props.children;
    if (!isVNode(child))
      return;
    if (!("slot" in child.props))
      return;
    const name = toSlotName(child.props.slot);
    slots[name] = [child];
    slots[name]["$$slot"] = true;
    delete child.props.slot;
    delete vnode.props.children;
  }
  if (Array.isArray(vnode.props.children)) {
    vnode.props.children = vnode.props.children.map((child) => {
      if (!isVNode(child))
        return child;
      if (!("slot" in child.props))
        return child;
      const name = toSlotName(child.props.slot);
      if (Array.isArray(slots[name])) {
        slots[name].push(child);
      } else {
        slots[name] = [child];
        slots[name]["$$slot"] = true;
      }
      delete child.props.slot;
      return Empty;
    }).filter((v) => v !== Empty);
  }
  Object.assign(vnode.props, slots);
}
function markRawChildren(child) {
  if (typeof child === "string")
    return markHTMLString(child);
  if (Array.isArray(child))
    return child.map((c) => markRawChildren(c));
  return child;
}
function transformSetDirectives(vnode) {
  if (!("set:html" in vnode.props || "set:text" in vnode.props))
    return;
  if ("set:html" in vnode.props) {
    const children = markRawChildren(vnode.props["set:html"]);
    delete vnode.props["set:html"];
    Object.assign(vnode.props, { children });
    return;
  }
  if ("set:text" in vnode.props) {
    const children = vnode.props["set:text"];
    delete vnode.props["set:text"];
    Object.assign(vnode.props, { children });
    return;
  }
}
function createVNode(type, props) {
  const vnode = {
    [Renderer]: "astro:jsx",
    [AstroJSX]: true,
    type,
    props: props ?? {}
  };
  transformSetDirectives(vnode);
  transformSlots(vnode);
  return vnode;
}

const slotName = (str) => str.trim().replace(/[-_]([a-z])/g, (_, w) => w.toUpperCase());
async function check(Component, props, { default: children = null, ...slotted } = {}) {
  if (typeof Component !== "function")
    return false;
  const slots = {};
  for (const [key, value] of Object.entries(slotted)) {
    const name = slotName(key);
    slots[name] = value;
  }
  try {
    const result = await Component({ ...props, ...slots, children });
    return result[AstroJSX];
  } catch (e) {
  }
  return false;
}
async function renderToStaticMarkup(Component, props = {}, { default: children = null, ...slotted } = {}) {
  const slots = {};
  for (const [key, value] of Object.entries(slotted)) {
    const name = slotName(key);
    slots[name] = value;
  }
  const { result } = this;
  const html = await renderJSX(result, createVNode(Component, { ...props, ...slots, children }));
  return { html };
}
var server_default = {
  check,
  renderToStaticMarkup
};

i18next.use(fsBackend).init({"debug": true,"initImmediate": false,"backend": {"loadPath": "./src/locales/{{lng}}.json",},"supportedLngs": ["ru","uz",],"fallbackLng": ["ru","uz",],});

const $$Astro$7 = createAstro("/Users/davr/development/meduzacarwash/src/components/Button.astro", "", "file:///Users/davr/development/meduzacarwash/");
const $$Button = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$7, $$props, $$slots);
  Astro2.self = $$Button;
  return renderTemplate`${maybeRenderHead($$result)}<button class="bg-blue-500 w-full h-14 rounded-lg text-white">
  ${renderSlot($$result, $$slots["default"])}
</button>`;
});

const interpolate = (i18nKey, referenceString, namespace = null) => {
  const localizedString = t(i18nKey, { ns: namespace });
  if (localizedString === i18nKey) {
    console.warn(`WARNING(astro-i18next): missing translation key ${i18nKey}.`);
    return referenceString;
  }
  const tagsRegex = /<([\w\d]+)([^>]*)>/gi;
  const referenceStringMatches = referenceString.match(tagsRegex);
  if (!referenceStringMatches) {
    console.warn(
      "WARNING(astro-i18next): default slot does not include any HTML tag to interpolate! You should use the `t` function directly."
    );
    return localizedString;
  }
  const referenceTags = [];
  referenceStringMatches.forEach((tagNode) => {
    const [, name, attributes] = tagsRegex.exec(tagNode);
    referenceTags.push({ name, attributes });
    tagsRegex.exec("");
  });
  let interpolatedString = localizedString;
  for (let index = 0; index < referenceTags.length; index++) {
    const referencedTag = referenceTags[index];
    interpolatedString = interpolatedString.replaceAll(
      `<${index}>`,
      `<${referencedTag.name}${referencedTag.attributes}>`
    );
    interpolatedString = interpolatedString.replaceAll(
      `</${index}>`,
      `</${referencedTag.name}>`
    );
  }
  return interpolatedString;
};
const localizePath = (path = "/", locale = null, base = "/") => {
  if (!locale) {
    locale = i18next.language;
  }
  path = path.replace(/^\/+|\/+$/g, "");
  path = path === "" ? "/" : "/" + path + "/";
  base = base.replace(/^\/+|\/+$/g, "");
  base = base === "" ? "/" : "/" + base + "/";
  path = path.startsWith(base) ? path.slice(base.length) : path.slice(1);
  if (!i18next.options.supportedLngs.includes(locale)) {
    console.warn(
      `WARNING(astro-i18next): "${locale}" locale is not supported, add it to the supportedLngs in your astro config.`
    );
    return base + path;
  }
  let pathSegments = path.split("/");
  if (JSON.stringify(pathSegments) === JSON.stringify([""]) || JSON.stringify(pathSegments) === JSON.stringify(["", ""])) {
    return locale === i18next.options.supportedLngs[0] ? base : `${base}${locale}/`;
  }
  const otherLocales = [...i18next.options.supportedLngs];
  for (const otherLocale of otherLocales) {
    if (pathSegments[0] === otherLocale) {
      pathSegments.shift();
      break;
    }
  }
  if (locale !== i18next.options.supportedLngs[0]) {
    pathSegments = [locale, ...pathSegments];
  }
  return base + pathSegments.join("/");
};
const localizeUrl = (url, locale = null, base = "/") => {
  const [protocol, , host, ...path] = url.split("/");
  const baseUrl = protocol + "//" + host;
  return baseUrl + localizePath(path.join("/"), locale, base);
};

const $$Astro$6 = createAstro("/Users/davr/development/meduzacarwash/node_modules/astro-i18next/src/components/Trans.astro", "", "file:///Users/davr/development/meduzacarwash/");
const $$Trans = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$6, $$props, $$slots);
  Astro2.self = $$Trans;
  const { i18nKey, ns } = Astro2.props;
  const referenceString = await Astro2.slots.render("default");
  return renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": () => renderTemplate`${unescapeHTML(interpolate(i18nKey, referenceString, ns))}` })}
`;
});

module2.createRequire(import.meta.url);
      const __filename = url2.fileURLToPath(import.meta.url);
      path2.dirname(__filename);
var m=(t="/",e=null,s='/')=>{if(e||(e=i18next.language),t=t.replace(/^\/+|\/+$/g,""),t=t===""?"/":"/"+t+"/",s=s.replace(/^\/+|\/+$/g,""),s=s===""?"/":"/"+s+"/",t=t.startsWith(s)?t.slice(s.length):t.slice(1),!i18next.options.supportedLngs.includes(e))return console.warn(`WARNING(astro-i18next): "${e}" locale is not supported, add it to the supportedLngs in your astro config.`),s+t;let n=t.split("/");if(JSON.stringify(n)===JSON.stringify([""])||JSON.stringify(n)===JSON.stringify(["",""]))return e===i18next.options.supportedLngs[0]?s:`${s}${e}/`;let o=[...i18next.options.supportedLngs];for(let r of o)if(n[0]===r){n.shift();break}return e!==i18next.options.supportedLngs[0]&&(n=[e,...n]),s+n.join("/")};

const $$Astro$5 = createAstro("/Users/davr/development/meduzacarwash/node_modules/astro-i18next/src/components/LanguageSelector.astro", "", "file:///Users/davr/development/meduzacarwash/");
const $$LanguageSelector = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$5, $$props, $$slots);
  Astro2.self = $$LanguageSelector;
  const supportedLanguages = i18next.languages;
  const currentLanguage = i18next.language;
  const { pathname } = Astro2.url;
  const { showFlag = false, ...attributes } = Astro2.props;
  return renderTemplate`${maybeRenderHead($$result)}<select onchange="location = this.value;"${spreadAttributes(attributes)}>
  ${supportedLanguages.map((supportedLanguage) => {
    let value = m(pathname, supportedLanguage);
    const flag = showFlag ? localeEmoji(supportedLanguage) + " " : "";
    const nativeName = ISO6991.getNativeName(supportedLanguage);
    const label = flag + nativeName;
    return renderTemplate`<option${addAttribute(value, "value")}${addAttribute(supportedLanguage === currentLanguage, "selected")}>
          ${label}
        </option>`;
  })}
</select>`;
});

const $$Astro$4 = createAstro("/Users/davr/development/meduzacarwash/node_modules/astro-i18next/src/components/HeadHrefLangs.astro", "", "file:///Users/davr/development/meduzacarwash/");
const $$HeadHrefLangs = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$4, $$props, $$slots);
  Astro2.self = $$HeadHrefLangs;
  const supportedLanguages = i18next.languages;
  const currentUrl = Astro2.url.href;
  return renderTemplate`${supportedLanguages.map((supportedLanguage) => renderTemplate`<link rel="alternate"${addAttribute(supportedLanguage, "hreflang")}${addAttribute(localizeUrl(currentUrl, supportedLanguage), "href")}>`)}
`;
});

const $$Astro$3 = createAstro("/Users/davr/development/meduzacarwash/src/layouts/Layout.astro", "", "file:///Users/davr/development/meduzacarwash/");
const $$Layout = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$3, $$props, $$slots);
  Astro2.self = $$Layout;
  const { title } = Astro2.props;
  return renderTemplate`<html lang="en">
  <head>
    <meta charset="utf-8">
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <meta name="viewport" content="width=device-width">
    <meta name="generator"${addAttribute(Astro2.generator, "content")}>
    <title>${title}</title>
  ${renderHead($$result)}</head>
  <body class="container mx-auto p-8">
    <img src="/images/logo.png" width="100" height="100" class="mx-auto">
    ${renderComponent($$result, "LanguageSelector", $$LanguageSelector, { "showFlag": true, "class": "my-select-class" })}
    ${renderSlot($$result, $$slots["default"])}
  </body></html>`;
});

var _CALENDAR_TYPE_LOCALE;

function _toConsumableArray$2(arr) { return _arrayWithoutHoles$2(arr) || _iterableToArray$2(arr) || _unsupportedIterableToArray$2(arr) || _nonIterableSpread$2(); }

function _nonIterableSpread$2() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray$2(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$2(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$2(o, minLen); }

function _iterableToArray$2(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles$2(arr) { if (Array.isArray(arr)) return _arrayLikeToArray$2(arr); }

function _arrayLikeToArray$2(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _defineProperty$d(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var CALENDAR_TYPES = {
  ARABIC: 'Arabic',
  HEBREW: 'Hebrew',
  ISO_8601: 'ISO 8601',
  US: 'US'
};
var CALENDAR_TYPE_LOCALES = (_CALENDAR_TYPE_LOCALE = {}, _defineProperty$d(_CALENDAR_TYPE_LOCALE, CALENDAR_TYPES.US, ['en-CA', 'en-US', 'es-AR', 'es-BO', 'es-CL', 'es-CO', 'es-CR', 'es-DO', 'es-EC', 'es-GT', 'es-HN', 'es-MX', 'es-NI', 'es-PA', 'es-PE', 'es-PR', 'es-SV', 'es-VE', 'pt-BR']), _defineProperty$d(_CALENDAR_TYPE_LOCALE, CALENDAR_TYPES.ARABIC, [// ar-LB, ar-MA intentionally missing
'ar', 'ar-AE', 'ar-BH', 'ar-DZ', 'ar-EG', 'ar-IQ', 'ar-JO', 'ar-KW', 'ar-LY', 'ar-OM', 'ar-QA', 'ar-SA', 'ar-SD', 'ar-SY', 'ar-YE', 'dv', 'dv-MV', 'ps', 'ps-AR']), _defineProperty$d(_CALENDAR_TYPE_LOCALE, CALENDAR_TYPES.HEBREW, ['he', 'he-IL']), _CALENDAR_TYPE_LOCALE);
var WEEKDAYS = _toConsumableArray$2(Array(7)).map(function (el, index) {
  return index;
});

var formatterCache = new Map();

function getFormatter(options) {
  return function (locale, date) {
    var localeWithDefault = locale || getUserLocale();

    if (!formatterCache.has(localeWithDefault)) {
      formatterCache.set(localeWithDefault, new Map());
    }

    var formatterCacheLocale = formatterCache.get(localeWithDefault);

    if (!formatterCacheLocale.has(options)) {
      formatterCacheLocale.set(options, new Intl.DateTimeFormat(localeWithDefault, options).format);
    }

    return formatterCacheLocale.get(options)(date);
  };
}
/**
 * Changes the hour in a Date to ensure right date formatting even if DST is messed up.
 * Workaround for bug in WebKit and Firefox with historical dates.
 * For more details, see:
 * https://bugs.chromium.org/p/chromium/issues/detail?id=750465
 * https://bugzilla.mozilla.org/show_bug.cgi?id=1385643
 *
 * @param {Date} date Date.
 */


function toSafeHour(date) {
  var safeDate = new Date(date);
  return new Date(safeDate.setHours(12));
}

function getSafeFormatter(options) {
  return function (locale, date) {
    return getFormatter(options)(locale, toSafeHour(date));
  };
}
var formatDayOptions = {
  day: 'numeric'
};
var formatLongDateOptions = {
  day: 'numeric',
  month: 'long',
  year: 'numeric'
};
var formatMonthOptions = {
  month: 'long'
};
var formatMonthYearOptions = {
  month: 'long',
  year: 'numeric'
};
var formatShortWeekdayOptions = {
  weekday: 'short'
};
var formatWeekdayOptions = {
  weekday: 'long'
};
var formatYearOptions = {
  year: 'numeric'
};
var formatDay = getSafeFormatter(formatDayOptions);
var formatLongDate = getSafeFormatter(formatLongDateOptions);
var formatMonth = getSafeFormatter(formatMonthOptions);
var formatMonthYear = getSafeFormatter(formatMonthYearOptions);
var formatShortWeekday = getSafeFormatter(formatShortWeekdayOptions);
var formatWeekday = getSafeFormatter(formatWeekdayOptions);
var formatYear = getSafeFormatter(formatYearOptions);

var SUNDAY = WEEKDAYS[0];
var FRIDAY = WEEKDAYS[5];
var SATURDAY = WEEKDAYS[6];
/* Simple getters - getting a property of a given point in time */

function getDayOfWeek(date) {
  var calendarType = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : CALENDAR_TYPES.ISO_8601;
  var weekday = date.getDay();

  switch (calendarType) {
    case CALENDAR_TYPES.ISO_8601:
      // Shifts days of the week so that Monday is 0, Sunday is 6
      return (weekday + 6) % 7;

    case CALENDAR_TYPES.ARABIC:
      return (weekday + 1) % 7;

    case CALENDAR_TYPES.HEBREW:
    case CALENDAR_TYPES.US:
      return weekday;

    default:
      throw new Error('Unsupported calendar type.');
  }
}
/**
 * Century
 */

function getBeginOfCenturyYear(date) {
  var beginOfCentury = getCenturyStart(date);
  return getYear(beginOfCentury);
}
/**
 * Decade
 */

function getBeginOfDecadeYear(date) {
  var beginOfDecade = getDecadeStart(date);
  return getYear(beginOfDecade);
}
/**
 * Week
 */

/**
 * Returns the beginning of a given week.
 *
 * @param {Date} date Date.
 * @param {string} calendarType Calendar type. Can be ISO 8601 or US.
 */

function getBeginOfWeek(date) {
  var calendarType = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : CALENDAR_TYPES.ISO_8601;
  var year = getYear(date);
  var monthIndex = getMonth(date);
  var day = date.getDate() - getDayOfWeek(date, calendarType);
  return new Date(year, monthIndex, day);
}
/**
 * Gets week number according to ISO 8601 or US standard.
 * In ISO 8601, Arabic and Hebrew week 1 is the one with January 4.
 * In US calendar week 1 is the one with January 1.
 *
 * @param {Date} date Date.
 * @param {string} calendarType Calendar type. Can be ISO 8601 or US.
 */

function getWeekNumber(date) {
  var calendarType = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : CALENDAR_TYPES.ISO_8601;
  var calendarTypeForWeekNumber = calendarType === CALENDAR_TYPES.US ? CALENDAR_TYPES.US : CALENDAR_TYPES.ISO_8601;
  var beginOfWeek = getBeginOfWeek(date, calendarType);
  var year = getYear(date) + 1;
  var dayInWeekOne;
  var beginOfFirstWeek; // Look for the first week one that does not come after a given date

  do {
    dayInWeekOne = new Date(year, 0, calendarTypeForWeekNumber === CALENDAR_TYPES.ISO_8601 ? 4 : 1);
    beginOfFirstWeek = getBeginOfWeek(dayInWeekOne, calendarType);
    year -= 1;
  } while (date < beginOfFirstWeek);

  return Math.round((beginOfWeek - beginOfFirstWeek) / (8.64e7 * 7)) + 1;
}
/**
 * Others
 */

/**
 * Returns the beginning of a given range.
 *
 * @param {string} rangeType Range type (e.g. 'day')
 * @param {Date} date Date.
 */

function getBegin(rangeType, date) {
  switch (rangeType) {
    case 'century':
      return getCenturyStart(date);

    case 'decade':
      return getDecadeStart(date);

    case 'year':
      return getYearStart(date);

    case 'month':
      return getMonthStart(date);

    case 'day':
      return getDayStart(date);

    default:
      throw new Error("Invalid rangeType: ".concat(rangeType));
  }
}
function getBeginPrevious(rangeType, date) {
  switch (rangeType) {
    case 'century':
      return getPreviousCenturyStart(date);

    case 'decade':
      return getPreviousDecadeStart(date);

    case 'year':
      return getPreviousYearStart(date);

    case 'month':
      return getPreviousMonthStart(date);

    default:
      throw new Error("Invalid rangeType: ".concat(rangeType));
  }
}
function getBeginNext(rangeType, date) {
  switch (rangeType) {
    case 'century':
      return getNextCenturyStart(date);

    case 'decade':
      return getNextDecadeStart(date);

    case 'year':
      return getNextYearStart(date);

    case 'month':
      return getNextMonthStart(date);

    default:
      throw new Error("Invalid rangeType: ".concat(rangeType));
  }
}
var getBeginPrevious2 = function getBeginPrevious2(rangeType, date) {
  switch (rangeType) {
    case 'decade':
      return getPreviousDecadeStart(date, -100);

    case 'year':
      return getPreviousYearStart(date, -10);

    case 'month':
      return getPreviousMonthStart(date, -12);

    default:
      throw new Error("Invalid rangeType: ".concat(rangeType));
  }
};
var getBeginNext2 = function getBeginNext2(rangeType, date) {
  switch (rangeType) {
    case 'decade':
      return getNextDecadeStart(date, 100);

    case 'year':
      return getNextYearStart(date, 10);

    case 'month':
      return getNextMonthStart(date, 12);

    default:
      throw new Error("Invalid rangeType: ".concat(rangeType));
  }
};
/**
 * Returns the end of a given range.
 *
 * @param {string} rangeType Range type (e.g. 'day')
 * @param {Date} date Date.
 */

function getEnd(rangeType, date) {
  switch (rangeType) {
    case 'century':
      return getCenturyEnd(date);

    case 'decade':
      return getDecadeEnd(date);

    case 'year':
      return getYearEnd(date);

    case 'month':
      return getMonthEnd(date);

    case 'day':
      return getDayEnd(date);

    default:
      throw new Error("Invalid rangeType: ".concat(rangeType));
  }
}
function getEndPrevious(rangeType, date) {
  switch (rangeType) {
    case 'century':
      return getPreviousCenturyEnd(date);

    case 'decade':
      return getPreviousDecadeEnd(date);

    case 'year':
      return getPreviousYearEnd(date);

    case 'month':
      return getPreviousMonthEnd(date);

    default:
      throw new Error("Invalid rangeType: ".concat(rangeType));
  }
}
var getEndPrevious2 = function getEndPrevious2(rangeType, date) {
  switch (rangeType) {
    case 'decade':
      return getPreviousDecadeEnd(date, -100);

    case 'year':
      return getPreviousYearEnd(date, -10);

    case 'month':
      return getPreviousMonthEnd(date, -12);

    default:
      throw new Error("Invalid rangeType: ".concat(rangeType));
  }
};
/**
 * Returns an array with the beginning and the end of a given range.
 *
 * @param {string} rangeType Range type (e.g. 'day')
 * @param {Date} date Date.
 */

function getRange(rangeType, date) {
  switch (rangeType) {
    case 'century':
      return getCenturyRange(date);

    case 'decade':
      return getDecadeRange(date);

    case 'year':
      return getYearRange(date);

    case 'month':
      return getMonthRange(date);

    case 'day':
      return getDayRange(date);

    default:
      throw new Error("Invalid rangeType: ".concat(rangeType));
  }
}
/**
 * Creates a range out of two values, ensuring they are in order and covering entire period ranges.
 *
 * @param {string} rangeType Range type (e.g. 'day')
 * @param {Date} date1 First date.
 * @param {Date} date2 Second date.
 */

function getValueRange(rangeType, date1, date2) {
  var rawNextValue = [date1, date2].sort(function (a, b) {
    return a - b;
  });
  return [getBegin(rangeType, rawNextValue[0]), getEnd(rangeType, rawNextValue[1])];
}

function toYearLabel(locale) {
  var formatYear$1 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : formatYear;
  var dates = arguments.length > 2 ? arguments[2] : undefined;
  return dates.map(function (date) {
    return formatYear$1(locale, date);
  }).join(' – ');
}
/**
 * Returns a string labelling a century of a given date.
 * For example, for 2017 it will return 2001-2100.
 *
 * @param {Date|String|Number} date Date or a year as a string or as a number.
 */


function getCenturyLabel(locale, formatYear, date) {
  return toYearLabel(locale, formatYear, getCenturyRange(date));
}
/**
 * Returns a string labelling a century of a given date.
 * For example, for 2017 it will return 2011-2020.
 *
 * @param {Date|String|Number} date Date or a year as a string or as a number.
 */

function getDecadeLabel(locale, formatYear, date) {
  return toYearLabel(locale, formatYear, getDecadeRange(date));
}
/**
 * Returns a boolean determining whether a given date is on Saturday or Sunday.
 *
 * @param {Date} date Date.
 */

function isWeekend(date) {
  var calendarType = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : CALENDAR_TYPES.ISO_8601;
  var weekday = date.getDay();

  switch (calendarType) {
    case CALENDAR_TYPES.ARABIC:
    case CALENDAR_TYPES.HEBREW:
      return weekday === FRIDAY || weekday === SATURDAY;

    case CALENDAR_TYPES.ISO_8601:
    case CALENDAR_TYPES.US:
      return weekday === SATURDAY || weekday === SUNDAY;

    default:
      throw new Error('Unsupported calendar type.');
  }
}

function _typeof$2(obj) { "@babel/helpers - typeof"; return _typeof$2 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof$2(obj); }
var calendarTypes = Object.values(CALENDAR_TYPES);
var allViews$1 = ['century', 'decade', 'year', 'month'];
var isCalendarType = PropTypes.oneOf(calendarTypes);
var isClassName = PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]);
var isMinDate = function isMinDate(props, propName, componentName) {
  var minDate = props[propName];

  if (!minDate) {
    return null;
  }

  if (!(minDate instanceof Date)) {
    return new Error("Invalid prop `".concat(propName, "` of type `").concat(_typeof$2(minDate), "` supplied to `").concat(componentName, "`, expected instance of `Date`."));
  }

  var maxDate = props.maxDate;

  if (maxDate && minDate > maxDate) {
    return new Error("Invalid prop `".concat(propName, "` of type `").concat(_typeof$2(minDate), "` supplied to `").concat(componentName, "`, minDate cannot be larger than maxDate."));
  }

  return null;
};
var isMaxDate = function isMaxDate(props, propName, componentName) {
  var maxDate = props[propName];

  if (!maxDate) {
    return null;
  }

  if (!(maxDate instanceof Date)) {
    return new Error("Invalid prop `".concat(propName, "` of type `").concat(_typeof$2(maxDate), "` supplied to `").concat(componentName, "`, expected instance of `Date`."));
  }

  var minDate = props.minDate;

  if (minDate && maxDate < minDate) {
    return new Error("Invalid prop `".concat(propName, "` of type `").concat(_typeof$2(maxDate), "` supplied to `").concat(componentName, "`, maxDate cannot be smaller than minDate."));
  }

  return null;
};
var isRef = PropTypes.oneOfType([PropTypes.func, PropTypes.shape({
  current: PropTypes.any
})]);
var isValue = PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.arrayOf(PropTypes.instanceOf(Date))]);
var isViews = PropTypes.arrayOf(PropTypes.oneOf(allViews$1));
var isView = function isView(props, propName, componentName) {
  var view = props[propName];
  var views = props.views;
  var allowedViews = views || allViews$1;

  if (view !== undefined && allowedViews.indexOf(view) === -1) {
    return new Error("Invalid prop `".concat(propName, "` of value `").concat(view, "` supplied to `").concat(componentName, "`, expected one of [").concat(allowedViews.map(function (a) {
      return "\"".concat(a, "\"");
    }).join(', '), "]."));
  } // Everything is fine


  return null;
};

isView.isRequired = function (props, propName, componentName) {
  var view = props[propName];

  if (!view) {
    return new Error("The prop `".concat(propName, "` is marked as required in `").concat(componentName, "`, but its value is `").concat(view, "`."));
  }

  return isView(props, propName, componentName);
};

var tileGroupProps = {
  activeStartDate: PropTypes.instanceOf(Date).isRequired,
  hover: PropTypes.instanceOf(Date),
  locale: PropTypes.string,
  maxDate: isMaxDate,
  minDate: isMinDate,
  onClick: PropTypes.func,
  onMouseOver: PropTypes.func,
  tileClassName: PropTypes.oneOfType([PropTypes.func, isClassName]),
  tileContent: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
  value: isValue,
  valueType: PropTypes.string
};
var tileProps = {
  activeStartDate: PropTypes.instanceOf(Date).isRequired,
  classes: PropTypes.arrayOf(PropTypes.string).isRequired,
  date: PropTypes.instanceOf(Date).isRequired,
  locale: PropTypes.string,
  maxDate: isMaxDate,
  minDate: isMinDate,
  onClick: PropTypes.func,
  onMouseOver: PropTypes.func,
  style: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
  tileClassName: PropTypes.oneOfType([PropTypes.func, isClassName]),
  tileContent: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
  tileDisabled: PropTypes.func
};

var className$6 = 'react-calendar__navigation';
function Navigation(_ref) {
  var activeStartDate = _ref.activeStartDate,
      drillUp = _ref.drillUp,
      _ref$formatMonthYear = _ref.formatMonthYear,
      formatMonthYear$1 = _ref$formatMonthYear === void 0 ? formatMonthYear : _ref$formatMonthYear,
      _ref$formatYear = _ref.formatYear,
      formatYear$1 = _ref$formatYear === void 0 ? formatYear : _ref$formatYear,
      locale = _ref.locale,
      maxDate = _ref.maxDate,
      minDate = _ref.minDate,
      _ref$navigationAriaLa = _ref.navigationAriaLabel,
      navigationAriaLabel = _ref$navigationAriaLa === void 0 ? '' : _ref$navigationAriaLa,
      navigationAriaLive = _ref.navigationAriaLive,
      navigationLabel = _ref.navigationLabel,
      _ref$next2AriaLabel = _ref.next2AriaLabel,
      next2AriaLabel = _ref$next2AriaLabel === void 0 ? '' : _ref$next2AriaLabel,
      _ref$next2Label = _ref.next2Label,
      next2Label = _ref$next2Label === void 0 ? '»' : _ref$next2Label,
      _ref$nextAriaLabel = _ref.nextAriaLabel,
      nextAriaLabel = _ref$nextAriaLabel === void 0 ? '' : _ref$nextAriaLabel,
      _ref$nextLabel = _ref.nextLabel,
      nextLabel = _ref$nextLabel === void 0 ? '›' : _ref$nextLabel,
      _ref$prev2AriaLabel = _ref.prev2AriaLabel,
      prev2AriaLabel = _ref$prev2AriaLabel === void 0 ? '' : _ref$prev2AriaLabel,
      _ref$prev2Label = _ref.prev2Label,
      prev2Label = _ref$prev2Label === void 0 ? '«' : _ref$prev2Label,
      _ref$prevAriaLabel = _ref.prevAriaLabel,
      prevAriaLabel = _ref$prevAriaLabel === void 0 ? '' : _ref$prevAriaLabel,
      _ref$prevLabel = _ref.prevLabel,
      prevLabel = _ref$prevLabel === void 0 ? '‹' : _ref$prevLabel,
      setActiveStartDate = _ref.setActiveStartDate,
      showDoubleView = _ref.showDoubleView,
      view = _ref.view,
      views = _ref.views;
  var drillUpAvailable = views.indexOf(view) > 0;
  var shouldShowPrevNext2Buttons = view !== 'century';
  var previousActiveStartDate = getBeginPrevious(view, activeStartDate);
  var previousActiveStartDate2 = shouldShowPrevNext2Buttons && getBeginPrevious2(view, activeStartDate);
  var nextActiveStartDate = getBeginNext(view, activeStartDate);
  var nextActiveStartDate2 = shouldShowPrevNext2Buttons && getBeginNext2(view, activeStartDate);

  var prevButtonDisabled = function () {
    if (previousActiveStartDate.getFullYear() < 0) {
      return true;
    }

    var previousActiveEndDate = getEndPrevious(view, activeStartDate);
    return minDate && minDate >= previousActiveEndDate;
  }();

  var prev2ButtonDisabled = shouldShowPrevNext2Buttons && function () {
    if (previousActiveStartDate2.getFullYear() < 0) {
      return true;
    }

    var previousActiveEndDate = getEndPrevious2(view, activeStartDate);
    return minDate && minDate >= previousActiveEndDate;
  }();

  var nextButtonDisabled = maxDate && maxDate < nextActiveStartDate;
  var next2ButtonDisabled = shouldShowPrevNext2Buttons && maxDate && maxDate < nextActiveStartDate2;

  function onClickPrevious() {
    setActiveStartDate(previousActiveStartDate, 'prev');
  }

  function onClickPrevious2() {
    setActiveStartDate(previousActiveStartDate2, 'prev2');
  }

  function onClickNext() {
    setActiveStartDate(nextActiveStartDate, 'next');
  }

  function onClickNext2() {
    setActiveStartDate(nextActiveStartDate2, 'next2');
  }

  function renderLabel(date) {
    var label = function () {
      switch (view) {
        case 'century':
          return getCenturyLabel(locale, formatYear$1, date);

        case 'decade':
          return getDecadeLabel(locale, formatYear$1, date);

        case 'year':
          return formatYear$1(locale, date);

        case 'month':
          return formatMonthYear$1(locale, date);

        default:
          throw new Error("Invalid view: ".concat(view, "."));
      }
    }();

    return navigationLabel ? navigationLabel({
      date: date,
      label: label,
      locale: locale || getUserLocale$1(),
      view: view
    }) : label;
  }

  function renderButton() {
    var labelClassName = "".concat(className$6, "__label");
    return /*#__PURE__*/React.createElement("button", {
      "aria-label": navigationAriaLabel,
      "aria-live": navigationAriaLive,
      className: labelClassName,
      disabled: !drillUpAvailable,
      onClick: drillUp,
      style: {
        flexGrow: 1
      },
      type: "button"
    }, /*#__PURE__*/React.createElement("span", {
      className: "".concat(labelClassName, "__labelText ").concat(labelClassName, "__labelText--from")
    }, renderLabel(activeStartDate)), showDoubleView && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
      className: "".concat(labelClassName, "__divider")
    }, " \u2013 "), /*#__PURE__*/React.createElement("span", {
      className: "".concat(labelClassName, "__labelText ").concat(labelClassName, "__labelText--to")
    }, renderLabel(nextActiveStartDate))));
  }

  return /*#__PURE__*/React.createElement("div", {
    className: className$6
  }, prev2Label !== null && shouldShowPrevNext2Buttons && /*#__PURE__*/React.createElement("button", {
    "aria-label": prev2AriaLabel,
    className: "".concat(className$6, "__arrow ").concat(className$6, "__prev2-button"),
    disabled: prev2ButtonDisabled,
    onClick: onClickPrevious2,
    type: "button"
  }, prev2Label), prevLabel !== null && /*#__PURE__*/React.createElement("button", {
    "aria-label": prevAriaLabel,
    className: "".concat(className$6, "__arrow ").concat(className$6, "__prev-button"),
    disabled: prevButtonDisabled,
    onClick: onClickPrevious,
    type: "button"
  }, prevLabel), renderButton(), nextLabel !== null && /*#__PURE__*/React.createElement("button", {
    "aria-label": nextAriaLabel,
    className: "".concat(className$6, "__arrow ").concat(className$6, "__next-button"),
    disabled: nextButtonDisabled,
    onClick: onClickNext,
    type: "button"
  }, nextLabel), next2Label !== null && shouldShowPrevNext2Buttons && /*#__PURE__*/React.createElement("button", {
    "aria-label": next2AriaLabel,
    className: "".concat(className$6, "__arrow ").concat(className$6, "__next2-button"),
    disabled: next2ButtonDisabled,
    onClick: onClickNext2,
    type: "button"
  }, next2Label));
}
Navigation.propTypes = {
  activeStartDate: PropTypes.instanceOf(Date).isRequired,
  drillUp: PropTypes.func.isRequired,
  formatMonthYear: PropTypes.func,
  formatYear: PropTypes.func,
  locale: PropTypes.string,
  maxDate: PropTypes.instanceOf(Date),
  minDate: PropTypes.instanceOf(Date),
  navigationAriaLabel: PropTypes.string,
  navigationAriaLive: PropTypes.string,
  navigationLabel: PropTypes.func,
  next2AriaLabel: PropTypes.string,
  next2Label: PropTypes.node,
  nextAriaLabel: PropTypes.string,
  nextLabel: PropTypes.node,
  prev2AriaLabel: PropTypes.string,
  prev2Label: PropTypes.node,
  prevAriaLabel: PropTypes.string,
  prevLabel: PropTypes.node,
  setActiveStartDate: PropTypes.func.isRequired,
  showDoubleView: PropTypes.bool,
  view: isView.isRequired,
  views: isViews.isRequired
};

var _excluded$9 = ["children", "className", "direction", "count", "offset", "style", "wrap"];

function _extends$c() { _extends$c = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$c.apply(this, arguments); }

function ownKeys$c(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$c(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys$c(Object(source), !0).forEach(function (key) { _defineProperty$c(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys$c(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty$c(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties$9(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose$9(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose$9(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function toPercent(num) {
  return "".concat(num, "%");
}

function Flex(_ref) {
  var children = _ref.children,
      className = _ref.className,
      direction = _ref.direction,
      count = _ref.count,
      offset = _ref.offset,
      style = _ref.style,
      wrap = _ref.wrap,
      otherProps = _objectWithoutProperties$9(_ref, _excluded$9);

  return /*#__PURE__*/React.createElement("div", _extends$c({
    className: className,
    style: _objectSpread$c({
      display: 'flex',
      flexDirection: direction,
      flexWrap: wrap ? 'wrap' : 'no-wrap'
    }, style)
  }, otherProps), React.Children.map(children, function (child, index) {
    return /*#__PURE__*/React.cloneElement(child, _objectSpread$c(_objectSpread$c({}, child.props), {}, {
      style: {
        flexBasis: toPercent(100 / count),
        flexShrink: 0,
        flexGrow: 0,
        overflow: 'hidden',
        marginLeft: offset && index === 0 ? toPercent(100 * offset / count) : null
      }
    }));
  }));
}
Flex.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  count: PropTypes.number.isRequired,
  direction: PropTypes.string,
  offset: PropTypes.number,
  style: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
  wrap: PropTypes.bool
};

function _toConsumableArray$1(arr) { return _arrayWithoutHoles$1(arr) || _iterableToArray$1(arr) || _unsupportedIterableToArray$1(arr) || _nonIterableSpread$1(); }

function _nonIterableSpread$1() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray$1(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$1(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$1(o, minLen); }

function _iterableToArray$1(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles$1(arr) { if (Array.isArray(arr)) return _arrayLikeToArray$1(arr); }

function _arrayLikeToArray$1(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
/**
 * Returns a value no smaller than min and no larger than max.
 *
 * @param {*} value Value to return.
 * @param {*} min Minimum return value.
 * @param {*} max Maximum return value.
 */

function between(value, min, max) {
  if (min && min > value) {
    return min;
  }

  if (max && max < value) {
    return max;
  }

  return value;
}
function isValueWithinRange(value, range) {
  return range[0] <= value && range[1] >= value;
}
function isRangeWithinRange(greaterRange, smallerRange) {
  return greaterRange[0] <= smallerRange[0] && greaterRange[1] >= smallerRange[1];
}
function doRangesOverlap(range1, range2) {
  return isValueWithinRange(range1[0], range2) || isValueWithinRange(range1[1], range2);
}

function getRangeClassNames(valueRange, dateRange, baseClassName) {
  var isRange = doRangesOverlap(dateRange, valueRange);
  var classes = [];

  if (isRange) {
    classes.push(baseClassName);
    var isRangeStart = isValueWithinRange(valueRange[0], dateRange);
    var isRangeEnd = isValueWithinRange(valueRange[1], dateRange);

    if (isRangeStart) {
      classes.push("".concat(baseClassName, "Start"));
    }

    if (isRangeEnd) {
      classes.push("".concat(baseClassName, "End"));
    }

    if (isRangeStart && isRangeEnd) {
      classes.push("".concat(baseClassName, "BothEnds"));
    }
  }

  return classes;
}

function getTileClasses() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      value = _ref.value,
      valueType = _ref.valueType,
      date = _ref.date,
      dateType = _ref.dateType,
      hover = _ref.hover;

  var className = 'react-calendar__tile';
  var classes = [className];

  if (!date) {
    return classes;
  }

  if (!Array.isArray(date) && !dateType) {
    throw new Error('getTileClasses(): Unable to get tile activity classes because one or more required arguments were not passed.');
  }

  var now = new Date();
  var dateRange = Array.isArray(date) ? date : getRange(dateType, date);

  if (isValueWithinRange(now, dateRange)) {
    classes.push("".concat(className, "--now"));
  }

  if (!value) {
    return classes;
  }

  if (!Array.isArray(value) && !valueType) {
    throw new Error('getTileClasses(): Unable to get tile activity classes because one or more required arguments were not passed.');
  }

  var valueRange = Array.isArray(value) ? value : getRange(valueType, value);

  if (isRangeWithinRange(valueRange, dateRange)) {
    classes.push("".concat(className, "--active"));
  } else if (doRangesOverlap(valueRange, dateRange)) {
    classes.push("".concat(className, "--hasActive"));
  }

  var valueRangeClassNames = getRangeClassNames(valueRange, dateRange, "".concat(className, "--range"));
  classes.push.apply(classes, _toConsumableArray$1(valueRangeClassNames));
  var valueArray = [].concat(value);

  if (hover && valueArray.length === 1) {
    var hoverRange = hover > valueRange[0] ? [valueRange[0], hover] : [hover, valueRange[0]];
    var hoverRangeClassNames = getRangeClassNames(hoverRange, dateRange, "".concat(className, "--hover"));
    classes.push.apply(classes, _toConsumableArray$1(hoverRangeClassNames));
  }

  return classes;
}

var _excluded$8 = ["className", "count", "dateTransform", "dateType", "end", "hover", "offset", "start", "step", "tile", "value", "valueType"];

function ownKeys$b(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$b(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys$b(Object(source), !0).forEach(function (key) { _defineProperty$b(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys$b(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty$b(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _extends$b() { _extends$b = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$b.apply(this, arguments); }

function _objectWithoutProperties$8(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose$8(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose$8(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }
function TileGroup(_ref) {
  var className = _ref.className,
      _ref$count = _ref.count,
      count = _ref$count === void 0 ? 3 : _ref$count,
      dateTransform = _ref.dateTransform,
      dateType = _ref.dateType,
      end = _ref.end,
      hover = _ref.hover,
      offset = _ref.offset,
      start = _ref.start,
      _ref$step = _ref.step,
      step = _ref$step === void 0 ? 1 : _ref$step,
      Tile = _ref.tile,
      value = _ref.value,
      valueType = _ref.valueType,
      tileProps = _objectWithoutProperties$8(_ref, _excluded$8);

  var tiles = [];

  for (var point = start; point <= end; point += step) {
    var date = dateTransform(point);
    tiles.push( /*#__PURE__*/React.createElement(Tile, _extends$b({
      key: date.getTime(),
      classes: getTileClasses({
        value: value,
        valueType: valueType,
        date: date,
        dateType: dateType,
        hover: hover
      }),
      date: date,
      point: point
    }, tileProps)));
  }

  return /*#__PURE__*/React.createElement(Flex, {
    className: className,
    count: count,
    offset: offset,
    wrap: true
  }, tiles);
}
TileGroup.propTypes = _objectSpread$b(_objectSpread$b({}, tileGroupProps), {}, {
  activeStartDate: PropTypes.instanceOf(Date),
  count: PropTypes.number,
  dateTransform: PropTypes.func.isRequired,
  dateType: PropTypes.string,
  offset: PropTypes.number,
  step: PropTypes.number,
  tile: PropTypes.func.isRequired
});

function _typeof$1(obj) { "@babel/helpers - typeof"; return _typeof$1 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof$1(obj); }

function ownKeys$a(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$a(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys$a(Object(source), !0).forEach(function (key) { _defineProperty$a(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys$a(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _classCallCheck$1(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties$1(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass$1(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties$1(Constructor.prototype, protoProps); if (staticProps) _defineProperties$1(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _inherits$1(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf$1(subClass, superClass); }

function _setPrototypeOf$1(o, p) { _setPrototypeOf$1 = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf$1(o, p); }

function _createSuper$1(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$1(); return function _createSuperInternal() { var Super = _getPrototypeOf$1(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf$1(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn$1(this, result); }; }

function _possibleConstructorReturn$1(self, call) { if (call && (_typeof$1(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized$1(self); }

function _assertThisInitialized$1(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct$1() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf$1(o) { _getPrototypeOf$1 = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf$1(o); }

function _defineProperty$a(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function datesAreDifferent(date1, date2) {
  return date1 && !date2 || !date1 && date2 || date1 && date2 && date1.getTime() !== date2.getTime();
}

function getValue$1(nextProps, prop) {
  var activeStartDate = nextProps.activeStartDate,
      date = nextProps.date,
      view = nextProps.view;
  return typeof prop === 'function' ? prop({
    activeStartDate: activeStartDate,
    date: date,
    view: view
  }) : prop;
}

var Tile = /*#__PURE__*/function (_Component) {
  _inherits$1(Tile, _Component);

  var _super = _createSuper$1(Tile);

  function Tile() {
    var _this;

    _classCallCheck$1(this, Tile);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty$a(_assertThisInitialized$1(_this), "state", {});

    return _this;
  }

  _createClass$1(Tile, [{
    key: "render",
    value: function render() {
      var _this$props = this.props,
          activeStartDate = _this$props.activeStartDate,
          children = _this$props.children,
          classes = _this$props.classes,
          date = _this$props.date,
          formatAbbr = _this$props.formatAbbr,
          locale = _this$props.locale,
          maxDate = _this$props.maxDate,
          maxDateTransform = _this$props.maxDateTransform,
          minDate = _this$props.minDate,
          minDateTransform = _this$props.minDateTransform,
          onClick = _this$props.onClick,
          onMouseOver = _this$props.onMouseOver,
          style = _this$props.style,
          tileDisabled = _this$props.tileDisabled,
          view = _this$props.view;
      var _this$state = this.state,
          tileClassName = _this$state.tileClassName,
          tileContent = _this$state.tileContent;
      return /*#__PURE__*/React.createElement("button", {
        className: mergeClassNames(classes, tileClassName),
        disabled: minDate && minDateTransform(minDate) > date || maxDate && maxDateTransform(maxDate) < date || tileDisabled && tileDisabled({
          activeStartDate: activeStartDate,
          date: date,
          view: view
        }),
        onClick: onClick && function (event) {
          return onClick(date, event);
        },
        onFocus: onMouseOver && function () {
          return onMouseOver(date);
        },
        onMouseOver: onMouseOver && function () {
          return onMouseOver(date);
        },
        style: style,
        type: "button"
      }, formatAbbr ? /*#__PURE__*/React.createElement("abbr", {
        "aria-label": formatAbbr(locale, date)
      }, children) : children, tileContent);
    }
  }], [{
    key: "getDerivedStateFromProps",
    value: function getDerivedStateFromProps(nextProps, prevState) {
      var activeStartDate = nextProps.activeStartDate,
          tileClassName = nextProps.tileClassName,
          tileContent = nextProps.tileContent;
      var nextState = {};

      if (tileClassName !== prevState.tileClassNameProps || datesAreDifferent(activeStartDate, prevState.activeStartDateProps)) {
        nextState.tileClassName = getValue$1(nextProps, tileClassName);
        nextState.tileClassNameProps = tileClassName;
      }

      if (tileContent !== prevState.tileContentProps || datesAreDifferent(activeStartDate, prevState.activeStartDateProps)) {
        nextState.tileContent = getValue$1(nextProps, tileContent);
        nextState.tileContentProps = tileContent;
      }

      nextState.activeStartDateProps = activeStartDate;
      return nextState;
    }
  }]);

  return Tile;
}(Component);
Tile.propTypes = _objectSpread$a(_objectSpread$a({}, tileProps), {}, {
  children: PropTypes.node.isRequired,
  formatAbbr: PropTypes.func,
  maxDateTransform: PropTypes.func.isRequired,
  minDateTransform: PropTypes.func.isRequired
});

var _excluded$7 = ["classes", "formatYear"];

function ownKeys$9(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$9(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys$9(Object(source), !0).forEach(function (key) { _defineProperty$9(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys$9(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty$9(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _extends$a() { _extends$a = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$a.apply(this, arguments); }

function _objectWithoutProperties$7(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose$7(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose$7(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }
var className$5 = 'react-calendar__century-view__decades__decade';
function Decade(_ref) {
  var classes = _ref.classes,
      _ref$formatYear = _ref.formatYear,
      formatYear$1 = _ref$formatYear === void 0 ? formatYear : _ref$formatYear,
      otherProps = _objectWithoutProperties$7(_ref, _excluded$7);

  var date = otherProps.date,
      locale = otherProps.locale;
  return /*#__PURE__*/React.createElement(Tile, _extends$a({}, otherProps, {
    classes: [].concat(classes, className$5),
    maxDateTransform: getDecadeEnd,
    minDateTransform: getDecadeStart,
    view: "century"
  }), getDecadeLabel(locale, formatYear$1, date));
}
Decade.propTypes = _objectSpread$9(_objectSpread$9({}, tileProps), {}, {
  formatYear: PropTypes.func
});

function ownKeys$8(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$8(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys$8(Object(source), !0).forEach(function (key) { _defineProperty$8(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys$8(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty$8(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _extends$9() { _extends$9 = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$9.apply(this, arguments); }
function Decades(props) {
  var activeStartDate = props.activeStartDate;
  var start = getBeginOfCenturyYear(activeStartDate);
  var end = start + 99;
  return /*#__PURE__*/React.createElement(TileGroup, _extends$9({}, props, {
    className: "react-calendar__century-view__decades",
    dateTransform: getDecadeStart,
    dateType: "decade",
    end: end,
    start: start,
    step: 10,
    tile: Decade
  }));
}
Decades.propTypes = _objectSpread$8({}, tileGroupProps);

function CenturyView(props) {
  function renderDecades() {
    return /*#__PURE__*/React.createElement(Decades, props);
  }

  return /*#__PURE__*/React.createElement("div", {
    className: "react-calendar__century-view"
  }, renderDecades());
}

var _excluded$6 = ["classes", "formatYear"];

function ownKeys$7(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$7(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys$7(Object(source), !0).forEach(function (key) { _defineProperty$7(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys$7(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty$7(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _extends$8() { _extends$8 = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$8.apply(this, arguments); }

function _objectWithoutProperties$6(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose$6(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose$6(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }
var className$4 = 'react-calendar__decade-view__years__year';
function Year(_ref) {
  var classes = _ref.classes,
      _ref$formatYear = _ref.formatYear,
      formatYear$1 = _ref$formatYear === void 0 ? formatYear : _ref$formatYear,
      otherProps = _objectWithoutProperties$6(_ref, _excluded$6);

  var date = otherProps.date,
      locale = otherProps.locale;
  return /*#__PURE__*/React.createElement(Tile, _extends$8({}, otherProps, {
    classes: [].concat(classes, className$4),
    maxDateTransform: getYearEnd,
    minDateTransform: getYearStart,
    view: "decade"
  }), formatYear$1(locale, date));
}
Year.propTypes = _objectSpread$7(_objectSpread$7({}, tileProps), {}, {
  formatYear: PropTypes.func
});

function ownKeys$6(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$6(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys$6(Object(source), !0).forEach(function (key) { _defineProperty$6(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys$6(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty$6(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _extends$7() { _extends$7 = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$7.apply(this, arguments); }
function Years(props) {
  var activeStartDate = props.activeStartDate;
  var start = getBeginOfDecadeYear(activeStartDate);
  var end = start + 9;
  return /*#__PURE__*/React.createElement(TileGroup, _extends$7({}, props, {
    className: "react-calendar__decade-view__years",
    dateTransform: function dateTransform(year) {
      var date = new Date();
      date.setFullYear(year, 0, 1);
      date.setHours(0, 0, 0, 0);
      return date;
    },
    dateType: "year",
    end: end,
    start: start,
    tile: Year
  }));
}
Years.propTypes = _objectSpread$6({}, tileGroupProps);

function DecadeView(props) {
  function renderYears() {
    return /*#__PURE__*/React.createElement(Years, props);
  }

  return /*#__PURE__*/React.createElement("div", {
    className: "react-calendar__decade-view"
  }, renderYears());
}

var _excluded$5 = ["classes", "formatMonth", "formatMonthYear"];

function ownKeys$5(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$5(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys$5(Object(source), !0).forEach(function (key) { _defineProperty$5(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys$5(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty$5(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _extends$6() { _extends$6 = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$6.apply(this, arguments); }

function _objectWithoutProperties$5(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose$5(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose$5(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }
var className$3 = 'react-calendar__year-view__months__month';
function Month(_ref) {
  var classes = _ref.classes,
      _ref$formatMonth = _ref.formatMonth,
      formatMonth$1 = _ref$formatMonth === void 0 ? formatMonth : _ref$formatMonth,
      _ref$formatMonthYear = _ref.formatMonthYear,
      formatMonthYear$1 = _ref$formatMonthYear === void 0 ? formatMonthYear : _ref$formatMonthYear,
      otherProps = _objectWithoutProperties$5(_ref, _excluded$5);

  var date = otherProps.date,
      locale = otherProps.locale;
  return /*#__PURE__*/React.createElement(Tile, _extends$6({}, otherProps, {
    classes: [].concat(classes, className$3),
    formatAbbr: formatMonthYear$1,
    maxDateTransform: getMonthEnd,
    minDateTransform: getMonthStart,
    view: "year"
  }), formatMonth$1(locale, date));
}
Month.propTypes = _objectSpread$5(_objectSpread$5({}, tileProps), {}, {
  formatMonth: PropTypes.func,
  formatMonthYear: PropTypes.func
});

function ownKeys$4(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$4(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys$4(Object(source), !0).forEach(function (key) { _defineProperty$4(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys$4(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty$4(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _extends$5() { _extends$5 = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$5.apply(this, arguments); }
function Months(props) {
  var activeStartDate = props.activeStartDate;
  var start = 0;
  var end = 11;
  var year = getYear(activeStartDate);
  return /*#__PURE__*/React.createElement(TileGroup, _extends$5({}, props, {
    className: "react-calendar__year-view__months",
    dateTransform: function dateTransform(monthIndex) {
      var date = new Date();
      date.setFullYear(year, monthIndex, 1);
      date.setHours(0, 0, 0, 0);
      return date;
    },
    dateType: "month",
    end: end,
    start: start,
    tile: Month
  }));
}
Months.propTypes = _objectSpread$4(_objectSpread$4({}, tileGroupProps), {}, {
  locale: PropTypes.string
});

function YearView(props) {
  function renderMonths() {
    return /*#__PURE__*/React.createElement(Months, props);
  }

  return /*#__PURE__*/React.createElement("div", {
    className: "react-calendar__year-view"
  }, renderMonths());
}

var _excluded$4 = ["formatDay", "formatLongDate", "calendarType", "classes", "currentMonthIndex"];

function ownKeys$3(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$3(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys$3(Object(source), !0).forEach(function (key) { _defineProperty$3(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys$3(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty$3(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _extends$4() { _extends$4 = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$4.apply(this, arguments); }

function _objectWithoutProperties$4(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose$4(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose$4(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }
var className$2 = 'react-calendar__month-view__days__day';
function Day(_ref) {
  var _ref$formatDay = _ref.formatDay,
      formatDay$1 = _ref$formatDay === void 0 ? formatDay : _ref$formatDay,
      _ref$formatLongDate = _ref.formatLongDate,
      formatLongDate$1 = _ref$formatLongDate === void 0 ? formatLongDate : _ref$formatLongDate,
      calendarType = _ref.calendarType,
      classes = _ref.classes,
      currentMonthIndex = _ref.currentMonthIndex,
      otherProps = _objectWithoutProperties$4(_ref, _excluded$4);

  var date = otherProps.date,
      locale = otherProps.locale;
  return /*#__PURE__*/React.createElement(Tile, _extends$4({}, otherProps, {
    classes: [].concat(classes, className$2, isWeekend(date, calendarType) ? "".concat(className$2, "--weekend") : null, date.getMonth() !== currentMonthIndex ? "".concat(className$2, "--neighboringMonth") : null),
    formatAbbr: formatLongDate$1,
    maxDateTransform: getDayEnd,
    minDateTransform: getDayStart,
    view: "month"
  }), formatDay$1(locale, date));
}
Day.propTypes = _objectSpread$3(_objectSpread$3({}, tileProps), {}, {
  currentMonthIndex: PropTypes.number.isRequired,
  formatDay: PropTypes.func,
  formatLongDate: PropTypes.func
});

var _excluded$3 = ["showFixedNumberOfWeeks", "showNeighboringMonth"];

function ownKeys$2(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$2(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys$2(Object(source), !0).forEach(function (key) { _defineProperty$2(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys$2(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty$2(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _extends$3() { _extends$3 = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$3.apply(this, arguments); }

function _objectWithoutProperties$3(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose$3(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose$3(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }
function Days(props) {
  var activeStartDate = props.activeStartDate,
      calendarType = props.calendarType;

  var showFixedNumberOfWeeks = props.showFixedNumberOfWeeks,
      showNeighboringMonth = props.showNeighboringMonth,
      otherProps = _objectWithoutProperties$3(props, _excluded$3);

  var year = getYear(activeStartDate);
  var monthIndex = getMonth(activeStartDate);
  var hasFixedNumberOfWeeks = showFixedNumberOfWeeks || showNeighboringMonth;
  var dayOfWeek = getDayOfWeek(activeStartDate, calendarType);
  var offset = hasFixedNumberOfWeeks ? 0 : dayOfWeek;
  /**
   * Defines on which day of the month the grid shall start. If we simply show current
   * month, we obviously start on day one, but if showNeighboringMonth is set to
   * true, we need to find the beginning of the week the first day of the month is in.
   */

  var start = (hasFixedNumberOfWeeks ? -dayOfWeek : 0) + 1;
  /**
   * Defines on which day of the month the grid shall end. If we simply show current
   * month, we need to stop on the last day of the month, but if showNeighboringMonth
   * is set to true, we need to find the end of the week the last day of the month is in.
   */

  var end = function () {
    if (showFixedNumberOfWeeks) {
      // Always show 6 weeks
      return start + 6 * 7 - 1;
    }

    var daysInMonth = getDaysInMonth(activeStartDate);

    if (showNeighboringMonth) {
      var activeEndDate = new Date();
      activeEndDate.setFullYear(year, monthIndex, daysInMonth);
      activeEndDate.setHours(0, 0, 0, 0);
      var daysUntilEndOfTheWeek = 7 - getDayOfWeek(activeEndDate, calendarType) - 1;
      return daysInMonth + daysUntilEndOfTheWeek;
    }

    return daysInMonth;
  }();

  return /*#__PURE__*/React.createElement(TileGroup, _extends$3({}, otherProps, {
    className: "react-calendar__month-view__days",
    count: 7,
    currentMonthIndex: monthIndex,
    dateTransform: function dateTransform(day) {
      var date = new Date();
      date.setFullYear(year, monthIndex, day);
      date.setHours(0, 0, 0, 0);
      return date;
    },
    dateType: "day",
    end: end,
    offset: offset,
    start: start,
    tile: Day
  }));
}
Days.propTypes = _objectSpread$2({
  calendarType: isCalendarType.isRequired,
  showFixedNumberOfWeeks: PropTypes.bool,
  showNeighboringMonth: PropTypes.bool
}, tileGroupProps);

var className$1 = 'react-calendar__month-view__weekdays';
var weekdayClassName = "".concat(className$1, "__weekday");
function Weekdays(props) {
  var calendarType = props.calendarType,
      _props$formatShortWee = props.formatShortWeekday,
      formatShortWeekday$1 = _props$formatShortWee === void 0 ? formatShortWeekday : _props$formatShortWee,
      _props$formatWeekday = props.formatWeekday,
      formatWeekday$1 = _props$formatWeekday === void 0 ? formatWeekday : _props$formatWeekday,
      locale = props.locale,
      onMouseLeave = props.onMouseLeave;
  var anyDate = new Date();
  var beginOfMonth = getMonthStart(anyDate);
  var year = getYear(beginOfMonth);
  var monthIndex = getMonth(beginOfMonth);
  var weekdays = [];

  for (var weekday = 1; weekday <= 7; weekday += 1) {
    var weekdayDate = new Date(year, monthIndex, weekday - getDayOfWeek(beginOfMonth, calendarType));
    var abbr = formatWeekday$1(locale, weekdayDate);
    weekdays.push( /*#__PURE__*/React.createElement("div", {
      key: weekday,
      className: mergeClassNames(weekdayClassName, isWeekend(weekdayDate, calendarType) && "".concat(weekdayClassName, "--weekend"))
    }, /*#__PURE__*/React.createElement("abbr", {
      "aria-label": abbr,
      title: abbr
    }, formatShortWeekday$1(locale, weekdayDate).replace('.', ''))));
  }

  return /*#__PURE__*/React.createElement(Flex, {
    className: className$1,
    count: 7,
    onFocus: onMouseLeave,
    onMouseOver: onMouseLeave
  }, weekdays);
}
Weekdays.propTypes = {
  calendarType: isCalendarType.isRequired,
  formatShortWeekday: PropTypes.func,
  formatWeekday: PropTypes.func,
  locale: PropTypes.string,
  onMouseLeave: PropTypes.func
};

var _excluded$2 = ["date", "onClickWeekNumber", "weekNumber"];

function _extends$2() { _extends$2 = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$2.apply(this, arguments); }

function ownKeys$1(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$1(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys$1(Object(source), !0).forEach(function (key) { _defineProperty$1(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys$1(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty$1(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties$2(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose$2(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose$2(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }
var className = 'react-calendar__tile';
function WeekNumber(_ref) {
  var date = _ref.date,
      onClickWeekNumber = _ref.onClickWeekNumber,
      weekNumber = _ref.weekNumber,
      otherProps = _objectWithoutProperties$2(_ref, _excluded$2);

  var props = _objectSpread$1({
    className: className
  }, otherProps);

  var children = /*#__PURE__*/React.createElement("span", null, weekNumber);
  return onClickWeekNumber ? /*#__PURE__*/React.createElement("button", _extends$2({}, props, {
    onClick: function onClick(event) {
      return onClickWeekNumber(weekNumber, date, event);
    },
    type: "button"
  }), children) : /*#__PURE__*/React.createElement("div", props, children);
}
WeekNumber.propTypes = {
  date: PropTypes.instanceOf(Date).isRequired,
  onClickWeekNumber: PropTypes.func,
  weekNumber: PropTypes.node.isRequired
};

function WeekNumbers(props) {
  var activeStartDate = props.activeStartDate,
      calendarType = props.calendarType,
      onClickWeekNumber = props.onClickWeekNumber,
      onMouseLeave = props.onMouseLeave,
      showFixedNumberOfWeeks = props.showFixedNumberOfWeeks;

  var numberOfWeeks = function () {
    if (showFixedNumberOfWeeks) {
      return 6;
    }

    var numberOfDays = getDaysInMonth(activeStartDate);
    var startWeekday = getDayOfWeek(activeStartDate, calendarType);
    var days = numberOfDays - (7 - startWeekday);
    return 1 + Math.ceil(days / 7);
  }();

  var dates = function () {
    var year = getYear(activeStartDate);
    var monthIndex = getMonth(activeStartDate);
    var day = getDate(activeStartDate);
    var result = [];

    for (var index = 0; index < numberOfWeeks; index += 1) {
      result.push(getBeginOfWeek(new Date(year, monthIndex, day + index * 7), calendarType));
    }

    return result;
  }();

  var weekNumbers = dates.map(function (date) {
    return getWeekNumber(date, calendarType);
  });
  return /*#__PURE__*/React.createElement(Flex, {
    className: "react-calendar__month-view__weekNumbers",
    count: numberOfWeeks,
    direction: "column",
    onFocus: onMouseLeave,
    onMouseOver: onMouseLeave,
    style: {
      flexBasis: 'calc(100% * (1 / 8)',
      flexShrink: 0
    }
  }, weekNumbers.map(function (weekNumber, weekIndex) {
    return /*#__PURE__*/React.createElement(WeekNumber, {
      key: weekNumber,
      date: dates[weekIndex],
      onClickWeekNumber: onClickWeekNumber,
      weekNumber: weekNumber
    });
  }));
}
WeekNumbers.propTypes = {
  activeStartDate: PropTypes.instanceOf(Date).isRequired,
  calendarType: isCalendarType.isRequired,
  onClickWeekNumber: PropTypes.func,
  onMouseLeave: PropTypes.func,
  showFixedNumberOfWeeks: PropTypes.bool
};

var _excluded$1 = ["calendarType", "formatShortWeekday", "formatWeekday", "onClickWeekNumber", "showWeekNumbers"];

function _extends$1() { _extends$1 = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$1.apply(this, arguments); }

function _objectWithoutProperties$1(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose$1(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose$1(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function getCalendarTypeFromLocale(locale) {
  return Object.keys(CALENDAR_TYPE_LOCALES).find(function (calendarType) {
    return CALENDAR_TYPE_LOCALES[calendarType].includes(locale);
  }) || CALENDAR_TYPES.ISO_8601;
}

function MonthView(props) {
  var activeStartDate = props.activeStartDate,
      locale = props.locale,
      onMouseLeave = props.onMouseLeave,
      showFixedNumberOfWeeks = props.showFixedNumberOfWeeks;

  var _props$calendarType = props.calendarType,
      calendarType = _props$calendarType === void 0 ? getCalendarTypeFromLocale(locale) : _props$calendarType,
      formatShortWeekday = props.formatShortWeekday,
      formatWeekday = props.formatWeekday,
      onClickWeekNumber = props.onClickWeekNumber,
      showWeekNumbers = props.showWeekNumbers,
      childProps = _objectWithoutProperties$1(props, _excluded$1);

  function renderWeekdays() {
    return /*#__PURE__*/React.createElement(Weekdays, {
      calendarType: calendarType,
      formatShortWeekday: formatShortWeekday,
      formatWeekday: formatWeekday,
      locale: locale,
      onMouseLeave: onMouseLeave
    });
  }

  function renderWeekNumbers() {
    if (!showWeekNumbers) {
      return null;
    }

    return /*#__PURE__*/React.createElement(WeekNumbers, {
      activeStartDate: activeStartDate,
      calendarType: calendarType,
      onClickWeekNumber: onClickWeekNumber,
      onMouseLeave: onMouseLeave,
      showFixedNumberOfWeeks: showFixedNumberOfWeeks
    });
  }

  function renderDays() {
    return /*#__PURE__*/React.createElement(Days, _extends$1({
      calendarType: calendarType
    }, childProps));
  }

  var className = 'react-calendar__month-view';
  return /*#__PURE__*/React.createElement("div", {
    className: mergeClassNames(className, showWeekNumbers ? "".concat(className, "--weekNumbers") : '')
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end'
    }
  }, renderWeekNumbers(), /*#__PURE__*/React.createElement("div", {
    style: {
      flexGrow: 1,
      width: '100%'
    }
  }, renderWeekdays(), renderDays())));
}
MonthView.propTypes = {
  activeStartDate: PropTypes.instanceOf(Date).isRequired,
  calendarType: isCalendarType,
  formatShortWeekday: PropTypes.func,
  formatWeekday: PropTypes.func,
  locale: PropTypes.string,
  onClickWeekNumber: PropTypes.func,
  onMouseLeave: PropTypes.func,
  showFixedNumberOfWeeks: PropTypes.bool,
  showWeekNumbers: PropTypes.bool
};

var _excluded = ["activeStartDate", "defaultActiveStartDate", "defaultValue", "defaultView", "maxDetail", "minDetail", "value", "view"];

function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
var defaultMinDate = new Date();
defaultMinDate.setFullYear(1, 0, 1);
defaultMinDate.setHours(0, 0, 0, 0);
var defaultMaxDate = new Date(8.64e15);
var baseClassName = 'react-calendar';
var allViews = ['century', 'decade', 'year', 'month'];
var allValueTypes = [].concat(_toConsumableArray(allViews.slice(1)), ['day']);

function toDate(value) {
  if (value instanceof Date) {
    return value;
  }

  return new Date(value);
}
/**
 * Returns views array with disallowed values cut off.
 */


function getLimitedViews(minDetail, maxDetail) {
  return allViews.slice(allViews.indexOf(minDetail), allViews.indexOf(maxDetail) + 1);
}
/**
 * Determines whether a given view is allowed with currently applied settings.
 */


function isViewAllowed(view, minDetail, maxDetail) {
  var views = getLimitedViews(minDetail, maxDetail);
  return views.indexOf(view) !== -1;
}
/**
 * Gets either provided view if allowed by minDetail and maxDetail, or gets
 * the default view if not allowed.
 */


function getView(view, minDetail, maxDetail) {
  if (isViewAllowed(view, minDetail, maxDetail)) {
    return view;
  }

  return maxDetail;
}
/**
 * Returns value type that can be returned with currently applied settings.
 */


function getValueType(maxDetail) {
  return allValueTypes[allViews.indexOf(maxDetail)];
}

function getValue(value, index) {
  if (!value) {
    return null;
  }

  var rawValue = Array.isArray(value) && value.length === 2 ? value[index] : value;

  if (!rawValue) {
    return null;
  }

  var valueDate = toDate(rawValue);

  if (isNaN(valueDate.getTime())) {
    throw new Error("Invalid date: ".concat(value));
  }

  return valueDate;
}

function getDetailValue(_ref, index) {
  var value = _ref.value,
      minDate = _ref.minDate,
      maxDate = _ref.maxDate,
      maxDetail = _ref.maxDetail;
  var valuePiece = getValue(value, index);

  if (!valuePiece) {
    return null;
  }

  var valueType = getValueType(maxDetail);
  var detailValueFrom = [getBegin, getEnd][index](valueType, valuePiece);
  return between(detailValueFrom, minDate, maxDate);
}

var getDetailValueFrom = function getDetailValueFrom(args) {
  return getDetailValue(args, 0);
};

var getDetailValueTo = function getDetailValueTo(args) {
  return getDetailValue(args, 1);
};

var getDetailValueArray = function getDetailValueArray(args) {
  var value = args.value;

  if (Array.isArray(value)) {
    return value;
  }

  return [getDetailValueFrom, getDetailValueTo].map(function (fn) {
    return fn(args);
  });
};

function getActiveStartDate(props) {
  var maxDate = props.maxDate,
      maxDetail = props.maxDetail,
      minDate = props.minDate,
      minDetail = props.minDetail,
      value = props.value,
      view = props.view;
  var rangeType = getView(view, minDetail, maxDetail);
  var valueFrom = getDetailValueFrom({
    value: value,
    minDate: minDate,
    maxDate: maxDate,
    maxDetail: maxDetail
  }) || new Date();
  return getBegin(rangeType, valueFrom);
}

function getInitialActiveStartDate(props) {
  var activeStartDate = props.activeStartDate,
      defaultActiveStartDate = props.defaultActiveStartDate,
      defaultValue = props.defaultValue,
      defaultView = props.defaultView,
      maxDetail = props.maxDetail,
      minDetail = props.minDetail,
      value = props.value,
      view = props.view,
      otherProps = _objectWithoutProperties(props, _excluded);

  var rangeType = getView(view, minDetail, maxDetail);
  var valueFrom = activeStartDate || defaultActiveStartDate;

  if (valueFrom) {
    return getBegin(rangeType, valueFrom);
  }

  return getActiveStartDate(_objectSpread({
    maxDetail: maxDetail,
    minDetail: minDetail,
    value: value || defaultValue,
    view: view || defaultView
  }, otherProps));
}

var getIsSingleValue = function getIsSingleValue(value) {
  return value && [].concat(value).length === 1;
};

var Calendar$1 = /*#__PURE__*/function (_Component) {
  _inherits(Calendar, _Component);

  var _super = _createSuper(Calendar);

  function Calendar() {
    var _this;

    _classCallCheck(this, Calendar);

    for (var _len = arguments.length, _args = new Array(_len), _key = 0; _key < _len; _key++) {
      _args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(_args));

    _defineProperty(_assertThisInitialized(_this), "state", {
      activeStartDate: _this.props.defaultActiveStartDate,
      value: _this.props.defaultValue,
      view: _this.props.defaultView
    });

    _defineProperty(_assertThisInitialized(_this), "setStateAndCallCallbacks", function (nextState, event, callback) {
      var _assertThisInitialize = _assertThisInitialized(_this),
          previousActiveStartDate = _assertThisInitialize.activeStartDate,
          previousView = _assertThisInitialize.view;

      var _this$props = _this.props,
          allowPartialRange = _this$props.allowPartialRange,
          onActiveStartDateChange = _this$props.onActiveStartDateChange,
          onChange = _this$props.onChange,
          onViewChange = _this$props.onViewChange,
          selectRange = _this$props.selectRange;
      var prevArgs = {
        activeStartDate: previousActiveStartDate,
        view: previousView
      };

      _this.setState(nextState, function () {
        var args = {
          action: nextState.action,
          activeStartDate: nextState.activeStartDate || _this.activeStartDate,
          value: nextState.value || _this.value,
          view: nextState.view || _this.view
        };

        function shouldUpdate(key) {
          return (// Key must exist, and…
            key in nextState && ( // …key changed from undefined to defined or the other way around, or…
            _typeof(nextState[key]) !== _typeof(prevArgs[key]) || ( // …value changed.
            nextState[key] instanceof Date ? nextState[key].getTime() !== prevArgs[key].getTime() : nextState[key] !== prevArgs[key]))
          );
        }

        if (shouldUpdate('activeStartDate')) {
          if (onActiveStartDateChange) onActiveStartDateChange(args);
        }

        if (shouldUpdate('view')) {
          if (onViewChange) onViewChange(args);
        }

        if (shouldUpdate('value')) {
          if (onChange) {
            if (selectRange) {
              var isSingleValue = getIsSingleValue(nextState.value);

              if (!isSingleValue) {
                onChange(nextState.value, event);
              } else if (allowPartialRange) {
                onChange([nextState.value], event);
              }
            } else {
              onChange(nextState.value, event);
            }
          }
        }

        if (callback) callback(args);
      });
    });

    _defineProperty(_assertThisInitialized(_this), "setActiveStartDate", function (nextActiveStartDate, action) {
      _this.setStateAndCallCallbacks({
        action: action,
        activeStartDate: nextActiveStartDate
      });
    });

    _defineProperty(_assertThisInitialized(_this), "drillDown", function (nextActiveStartDate, event) {
      if (!_this.drillDownAvailable) {
        return;
      }

      _this.onClickTile(nextActiveStartDate, event);

      var _assertThisInitialize2 = _assertThisInitialized(_this),
          view = _assertThisInitialize2.view,
          views = _assertThisInitialize2.views;

      var onDrillDown = _this.props.onDrillDown;
      var nextView = views[views.indexOf(view) + 1];

      _this.setStateAndCallCallbacks({
        action: 'drillDown',
        activeStartDate: nextActiveStartDate,
        view: nextView
      }, undefined, onDrillDown);
    });

    _defineProperty(_assertThisInitialized(_this), "drillUp", function () {
      if (!_this.drillUpAvailable) {
        return;
      }

      var _assertThisInitialize3 = _assertThisInitialized(_this),
          activeStartDate = _assertThisInitialize3.activeStartDate,
          view = _assertThisInitialize3.view,
          views = _assertThisInitialize3.views;

      var onDrillUp = _this.props.onDrillUp;
      var nextView = views[views.indexOf(view) - 1];
      var nextActiveStartDate = getBegin(nextView, activeStartDate);

      _this.setStateAndCallCallbacks({
        action: 'drillUp',
        activeStartDate: nextActiveStartDate,
        view: nextView
      }, undefined, onDrillUp);
    });

    _defineProperty(_assertThisInitialized(_this), "onChange", function (value, event) {
      var _assertThisInitialize4 = _assertThisInitialized(_this),
          previousValue = _assertThisInitialize4.value;

      var _this$props2 = _this.props,
          goToRangeStartOnSelect = _this$props2.goToRangeStartOnSelect,
          selectRange = _this$props2.selectRange;

      _this.onClickTile(value, event);

      var isFirstValueInRange = selectRange && !getIsSingleValue(previousValue);
      var nextValue;

      if (selectRange) {
        // Range selection turned on
        var _assertThisInitialize5 = _assertThisInitialized(_this),
            valueType = _assertThisInitialize5.valueType;

        if (isFirstValueInRange) {
          // Value has 0 or 2 elements - either way we're starting a new array
          // First value
          nextValue = getBegin(valueType, value);
        } else {
          // Second value
          nextValue = getValueRange(valueType, previousValue, value);
        }
      } else {
        // Range selection turned off
        nextValue = _this.getProcessedValue(value);
      }

      var nextActiveStartDate = // Range selection turned off
      !selectRange || // Range selection turned on, first value
      isFirstValueInRange || // Range selection turned on, second value, goToRangeStartOnSelect toggled on
      goToRangeStartOnSelect ? getActiveStartDate(_objectSpread(_objectSpread({}, _this.props), {}, {
        value: nextValue
      })) : null;
      event.persist();

      _this.setStateAndCallCallbacks({
        action: 'onChange',
        activeStartDate: nextActiveStartDate,
        value: nextValue
      }, event);
    });

    _defineProperty(_assertThisInitialized(_this), "onClickTile", function (value, event) {
      var _assertThisInitialize6 = _assertThisInitialized(_this),
          view = _assertThisInitialize6.view;

      var _this$props3 = _this.props,
          onClickDay = _this$props3.onClickDay,
          onClickDecade = _this$props3.onClickDecade,
          onClickMonth = _this$props3.onClickMonth,
          onClickYear = _this$props3.onClickYear;

      var callback = function () {
        switch (view) {
          case 'century':
            return onClickDecade;

          case 'decade':
            return onClickYear;

          case 'year':
            return onClickMonth;

          case 'month':
            return onClickDay;

          default:
            throw new Error("Invalid view: ".concat(view, "."));
        }
      }();

      if (callback) callback(value, event);
    });

    _defineProperty(_assertThisInitialized(_this), "onMouseOver", function (value) {
      _this.setState(function (prevState) {
        if (prevState.hover && prevState.hover.getTime() === value.getTime()) {
          return null;
        }

        return {
          hover: value
        };
      });
    });

    _defineProperty(_assertThisInitialized(_this), "onMouseLeave", function () {
      _this.setState({
        hover: null
      });
    });

    return _this;
  }

  _createClass(Calendar, [{
    key: "activeStartDate",
    get: function get() {
      var activeStartDateProps = this.props.activeStartDate;
      var activeStartDateState = this.state.activeStartDate;
      return activeStartDateProps || activeStartDateState || getInitialActiveStartDate(this.props);
    }
  }, {
    key: "value",
    get: function get() {
      var _this$props4 = this.props,
          selectRange = _this$props4.selectRange,
          valueProps = _this$props4.value;
      var valueState = this.state.value; // In the middle of range selection, use value from state

      if (selectRange && getIsSingleValue(valueState)) {
        return valueState;
      }

      return valueProps !== undefined ? valueProps : valueState;
    }
  }, {
    key: "valueType",
    get: function get() {
      var maxDetail = this.props.maxDetail;
      return getValueType(maxDetail);
    }
  }, {
    key: "view",
    get: function get() {
      var _this$props5 = this.props,
          minDetail = _this$props5.minDetail,
          maxDetail = _this$props5.maxDetail,
          viewProps = _this$props5.view;
      var viewState = this.state.view;
      return getView(viewProps || viewState, minDetail, maxDetail);
    }
  }, {
    key: "views",
    get: function get() {
      var _this$props6 = this.props,
          minDetail = _this$props6.minDetail,
          maxDetail = _this$props6.maxDetail;
      return getLimitedViews(minDetail, maxDetail);
    }
  }, {
    key: "hover",
    get: function get() {
      var selectRange = this.props.selectRange;
      var hover = this.state.hover;
      return selectRange ? hover : null;
    }
  }, {
    key: "drillDownAvailable",
    get: function get() {
      var view = this.view,
          views = this.views;
      return views.indexOf(view) < views.length - 1;
    }
  }, {
    key: "drillUpAvailable",
    get: function get() {
      var view = this.view,
          views = this.views;
      return views.indexOf(view) > 0;
    }
    /**
     * Gets current value in a desired format.
     */

  }, {
    key: "getProcessedValue",
    value: function getProcessedValue(value) {
      var _this$props7 = this.props,
          minDate = _this$props7.minDate,
          maxDate = _this$props7.maxDate,
          maxDetail = _this$props7.maxDetail,
          returnValue = _this$props7.returnValue;

      var processFunction = function () {
        switch (returnValue) {
          case 'start':
            return getDetailValueFrom;

          case 'end':
            return getDetailValueTo;

          case 'range':
            return getDetailValueArray;

          default:
            throw new Error('Invalid returnValue.');
        }
      }();

      return processFunction({
        value: value,
        minDate: minDate,
        maxDate: maxDate,
        maxDetail: maxDetail
      });
    }
  }, {
    key: "renderContent",
    value: function renderContent(next) {
      var currentActiveStartDate = this.activeStartDate,
          onMouseOver = this.onMouseOver,
          valueType = this.valueType,
          value = this.value,
          view = this.view;
      var _this$props8 = this.props,
          calendarType = _this$props8.calendarType,
          locale = _this$props8.locale,
          maxDate = _this$props8.maxDate,
          minDate = _this$props8.minDate,
          selectRange = _this$props8.selectRange,
          tileClassName = _this$props8.tileClassName,
          tileContent = _this$props8.tileContent,
          tileDisabled = _this$props8.tileDisabled;
      var hover = this.hover;
      var activeStartDate = next ? getBeginNext(view, currentActiveStartDate) : getBegin(view, currentActiveStartDate);
      var onClick = this.drillDownAvailable ? this.drillDown : this.onChange;
      var commonProps = {
        activeStartDate: activeStartDate,
        hover: hover,
        locale: locale,
        maxDate: maxDate,
        minDate: minDate,
        onClick: onClick,
        onMouseOver: selectRange ? onMouseOver : null,
        tileClassName: tileClassName,
        tileContent: tileContent,
        tileDisabled: tileDisabled,
        value: value,
        valueType: valueType
      };

      switch (view) {
        case 'century':
          {
            var formatYear = this.props.formatYear;
            return /*#__PURE__*/React.createElement(CenturyView, _extends({
              formatYear: formatYear
            }, commonProps));
          }

        case 'decade':
          {
            var _formatYear = this.props.formatYear;
            return /*#__PURE__*/React.createElement(DecadeView, _extends({
              formatYear: _formatYear
            }, commonProps));
          }

        case 'year':
          {
            var _this$props9 = this.props,
                formatMonth = _this$props9.formatMonth,
                formatMonthYear = _this$props9.formatMonthYear;
            return /*#__PURE__*/React.createElement(YearView, _extends({
              formatMonth: formatMonth,
              formatMonthYear: formatMonthYear
            }, commonProps));
          }

        case 'month':
          {
            var _this$props10 = this.props,
                formatDay = _this$props10.formatDay,
                formatLongDate = _this$props10.formatLongDate,
                formatShortWeekday = _this$props10.formatShortWeekday,
                formatWeekday = _this$props10.formatWeekday,
                onClickWeekNumber = _this$props10.onClickWeekNumber,
                showDoubleView = _this$props10.showDoubleView,
                showFixedNumberOfWeeks = _this$props10.showFixedNumberOfWeeks,
                showNeighboringMonth = _this$props10.showNeighboringMonth,
                showWeekNumbers = _this$props10.showWeekNumbers;
            var onMouseLeave = this.onMouseLeave;
            return /*#__PURE__*/React.createElement(MonthView, _extends({
              calendarType: calendarType,
              formatDay: formatDay,
              formatLongDate: formatLongDate,
              formatShortWeekday: formatShortWeekday,
              formatWeekday: formatWeekday,
              onClickWeekNumber: onClickWeekNumber,
              onMouseLeave: selectRange ? onMouseLeave : null,
              showFixedNumberOfWeeks: typeof showFixedNumberOfWeeks !== 'undefined' ? showFixedNumberOfWeeks : showDoubleView,
              showNeighboringMonth: showNeighboringMonth,
              showWeekNumbers: showWeekNumbers
            }, commonProps));
          }

        default:
          throw new Error("Invalid view: ".concat(view, "."));
      }
    }
  }, {
    key: "renderNavigation",
    value: function renderNavigation() {
      var showNavigation = this.props.showNavigation;

      if (!showNavigation) {
        return null;
      }

      var activeStartDate = this.activeStartDate,
          view = this.view,
          views = this.views;
      var _this$props11 = this.props,
          formatMonthYear = _this$props11.formatMonthYear,
          formatYear = _this$props11.formatYear,
          locale = _this$props11.locale,
          maxDate = _this$props11.maxDate,
          minDate = _this$props11.minDate,
          navigationAriaLabel = _this$props11.navigationAriaLabel,
          navigationAriaLive = _this$props11.navigationAriaLive,
          navigationLabel = _this$props11.navigationLabel,
          next2AriaLabel = _this$props11.next2AriaLabel,
          next2Label = _this$props11.next2Label,
          nextAriaLabel = _this$props11.nextAriaLabel,
          nextLabel = _this$props11.nextLabel,
          prev2AriaLabel = _this$props11.prev2AriaLabel,
          prev2Label = _this$props11.prev2Label,
          prevAriaLabel = _this$props11.prevAriaLabel,
          prevLabel = _this$props11.prevLabel,
          showDoubleView = _this$props11.showDoubleView;
      return /*#__PURE__*/React.createElement(Navigation, {
        activeStartDate: activeStartDate,
        drillUp: this.drillUp,
        formatMonthYear: formatMonthYear,
        formatYear: formatYear,
        locale: locale,
        maxDate: maxDate,
        minDate: minDate,
        navigationAriaLabel: navigationAriaLabel,
        navigationAriaLive: navigationAriaLive,
        navigationLabel: navigationLabel,
        next2AriaLabel: next2AriaLabel,
        next2Label: next2Label,
        nextAriaLabel: nextAriaLabel,
        nextLabel: nextLabel,
        prev2AriaLabel: prev2AriaLabel,
        prev2Label: prev2Label,
        prevAriaLabel: prevAriaLabel,
        prevLabel: prevLabel,
        setActiveStartDate: this.setActiveStartDate,
        showDoubleView: showDoubleView,
        view: view,
        views: views
      });
    }
  }, {
    key: "render",
    value: function render() {
      var _this$props12 = this.props,
          className = _this$props12.className,
          inputRef = _this$props12.inputRef,
          selectRange = _this$props12.selectRange,
          showDoubleView = _this$props12.showDoubleView;
      var onMouseLeave = this.onMouseLeave,
          value = this.value;
      var valueArray = [].concat(value);
      return /*#__PURE__*/React.createElement("div", {
        className: mergeClassNames(baseClassName, selectRange && valueArray.length === 1 && "".concat(baseClassName, "--selectRange"), showDoubleView && "".concat(baseClassName, "--doubleView"), className),
        ref: inputRef
      }, this.renderNavigation(), /*#__PURE__*/React.createElement("div", {
        className: "".concat(baseClassName, "__viewContainer"),
        onBlur: selectRange ? onMouseLeave : null,
        onMouseLeave: selectRange ? onMouseLeave : null
      }, this.renderContent(), showDoubleView && this.renderContent(true)));
    }
  }]);

  return Calendar;
}(Component);
Calendar$1.defaultProps = {
  goToRangeStartOnSelect: true,
  maxDate: defaultMaxDate,
  maxDetail: 'month',
  minDate: defaultMinDate,
  minDetail: 'century',
  returnValue: 'start',
  showNavigation: true,
  showNeighboringMonth: true
};
var isActiveStartDate = PropTypes.instanceOf(Date);
var isLooseValue = PropTypes.oneOfType([PropTypes.string, isValue]);
Calendar$1.propTypes = {
  activeStartDate: isActiveStartDate,
  allowPartialRange: PropTypes.bool,
  calendarType: isCalendarType,
  className: isClassName,
  defaultActiveStartDate: isActiveStartDate,
  defaultValue: isLooseValue,
  defaultView: isView,
  formatDay: PropTypes.func,
  formatLongDate: PropTypes.func,
  formatMonth: PropTypes.func,
  formatMonthYear: PropTypes.func,
  formatShortWeekday: PropTypes.func,
  formatWeekday: PropTypes.func,
  formatYear: PropTypes.func,
  goToRangeStartOnSelect: PropTypes.bool,
  inputRef: isRef,
  locale: PropTypes.string,
  maxDate: isMaxDate,
  maxDetail: PropTypes.oneOf(allViews),
  minDate: isMinDate,
  minDetail: PropTypes.oneOf(allViews),
  navigationAriaLabel: PropTypes.string,
  navigationAriaLive: PropTypes.oneOf(['off', 'polite', 'assertive']),
  navigationLabel: PropTypes.func,
  next2AriaLabel: PropTypes.string,
  next2Label: PropTypes.node,
  nextAriaLabel: PropTypes.string,
  nextLabel: PropTypes.node,
  onActiveStartDateChange: PropTypes.func,
  onChange: PropTypes.func,
  onClickDay: PropTypes.func,
  onClickDecade: PropTypes.func,
  onClickMonth: PropTypes.func,
  onClickWeekNumber: PropTypes.func,
  onClickYear: PropTypes.func,
  onDrillDown: PropTypes.func,
  onDrillUp: PropTypes.func,
  onViewChange: PropTypes.func,
  prev2AriaLabel: PropTypes.string,
  prev2Label: PropTypes.node,
  prevAriaLabel: PropTypes.string,
  prevLabel: PropTypes.node,
  returnValue: PropTypes.oneOf(['start', 'end', 'range']),
  selectRange: PropTypes.bool,
  showDoubleView: PropTypes.bool,
  showFixedNumberOfWeeks: PropTypes.bool,
  showNavigation: PropTypes.bool,
  showNeighboringMonth: PropTypes.bool,
  showWeekNumbers: PropTypes.bool,
  tileClassName: PropTypes.oneOfType([PropTypes.func, isClassName]),
  tileContent: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
  tileDisabled: PropTypes.func,
  value: isLooseValue,
  view: isView
};

const Calendar = Calendar$1;

function CalendarComponent() {
  const [value, onChange] = useState(new Date());
  return /* @__PURE__ */ jsx("div", {
    className: "mx-6",
    children: /* @__PURE__ */ jsx(Calendar, {
      onChange,
      value,
      onClickDay: (value2, event) => console.log(value2),
      className: "shadow-md rounded-xl",
      tileClassName: "rounded-xl",
      showNeighboringMonth: false,
      minDate: new Date(),
      prevLabel: /* @__PURE__ */ jsx(FontAwesomeIcon, {
        icon: faChevronLeft
      }),
      nextLabel: /* @__PURE__ */ jsx(FontAwesomeIcon, {
        icon: faChevronRight
      }),
      prev2Label: null,
      next2Label: null,
      locale: "ru-RU"
    })
  });
}
__astro_tag_component__(CalendarComponent, "@astrojs/react");

const $$Astro$2 = createAstro("/Users/davr/development/meduzacarwash/src/components/Title.astro", "", "file:///Users/davr/development/meduzacarwash/");
const $$Title = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$Title;
  return renderTemplate`${maybeRenderHead($$result)}<div class="font-semibold text-gray-500 py-4">
  ${renderSlot($$result, $$slots["default"])}
</div>`;
});

function MapComponent() {
  return /* @__PURE__ */ jsx("div", {
    className: "py-4",
    children: /* @__PURE__ */ jsx(YMaps, {
      children: /* @__PURE__ */ jsx("div", {
        children: /* @__PURE__ */ jsx(Map$1, {
          defaultState: {
            center: [41.311153, 69.279729],
            zoom: 12
          },
          type: "module",
          width: "100%",
          children: /* @__PURE__ */ jsx(Placemark, {
            geometry: [41.311153, 69.279729]
          })
        })
      })
    })
  });
}
__astro_tag_component__(MapComponent, "@astrojs/react");

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}
function WashTypeComponent() {
  let [categories] = useState([{
    id: 1,
    title: t("main.standard"),
    vehicles: [{
      id: 1,
      title: "Sedan",
      price: "80000 sum",
      image: "/images/icons/1.png"
    }, {
      id: 2,
      title: "pickup",
      price: "100000 sum",
      image: "/images/icons/2.png"
    }, {
      id: 3,
      title: "Sedan",
      price: "80000 sum",
      image: "/images/icons/3.png"
    }, {
      id: 4,
      title: "pickup",
      price: "100000 sum",
      image: "/images/icons/4.png"
    }],
    additionalOptions: [{
      id: 1,
      title: "Interior",
      price: "10000 sum",
      image: "/images/icons/5.png"
    }, {
      id: 2,
      title: "Exterior",
      price: "10000 sum",
      image: "/images/icons/6.png"
    }]
  }, {
    id: 2,
    title: t("main.other"),
    vehicles: [{
      id: 1,
      title: "area",
      price: "80000 kv.m"
    }]
  }]);
  const [accessElectricity, setAccessElectricity] = useState(true);
  return /* @__PURE__ */ jsxs("div", {
    className: "",
    children: [categories && /* @__PURE__ */ jsxs(Tab.Group, {
      children: [/* @__PURE__ */ jsx(Tab.List, {
        className: "flex space-x-1 rounded-xl bg-gray-200 p-1",
        children: categories.map((category) => /* @__PURE__ */ jsx(Tab, {
          className: ({
            selected
          }) => classNames("w-full rounded-lg py-2.5  font-medium leading-5", "focus:outline-none", selected ? "bg-white shadow" : "bg-gray-200"),
          children: category.id
        }, category.id))
      }), /* @__PURE__ */ jsx(Tab.Panels, {
        className: "mt-8",
        children: categories.map((category) => /* @__PURE__ */ jsx(Tab.Panel, {
          className: classNames("rounded-xl bg-white", " focus:outline-none "),
          children: /* @__PURE__ */ jsxs("div", {
            className: "grid grid-cols-2 gap-10",
            children: [category.vehicles && category.vehicles.map((vehicle) => /* @__PURE__ */ jsx("div", {
              className: "border rounded-2xl p-4",
              children: /* @__PURE__ */ jsxs("div", {
                className: "w-max mx-auto",
                children: [/* @__PURE__ */ jsx("div", {
                  className: "flex-shrink-0",
                  children: /* @__PURE__ */ jsx("img", {
                    className: "h-20 w-20 rounded-full",
                    src: vehicle.image,
                    alt: ""
                  })
                }), /* @__PURE__ */ jsxs("div", {
                  className: "",
                  children: [/* @__PURE__ */ jsx("div", {
                    className: "text-sm font-medium text-gray-900",
                    children: vehicle.title
                  }), /* @__PURE__ */ jsx("div", {
                    className: "",
                    children: vehicle.price
                  })]
                })]
              })
            }, vehicle.id)), categories[0].id === 1 && category.additionalOptions && /* @__PURE__ */ jsx("div", {
              className: "font-semibold text-gray-500 col-span-2",
              children: t("main.additionalOptions")
            }), category.additionalOptions && category.additionalOptions.map((option) => /* @__PURE__ */ jsx("div", {
              className: "border rounded-2xl p-4",
              children: /* @__PURE__ */ jsxs("div", {
                className: "w-max mx-auto",
                children: [/* @__PURE__ */ jsx("div", {
                  className: "flex-shrink-0",
                  children: /* @__PURE__ */ jsx("img", {
                    className: "h-20 w-20 rounded-full",
                    src: "/images/icons/1.png",
                    alt: ""
                  })
                }), /* @__PURE__ */ jsxs("div", {
                  className: "",
                  children: [/* @__PURE__ */ jsx("div", {
                    className: "text-sm font-medium text-gray-900",
                    children: option.title
                  }), /* @__PURE__ */ jsx("div", {
                    className: "",
                    children: option.price
                  })]
                })]
              })
            }, option.id))]
          })
        }, category.id))
      })]
    }), /* @__PURE__ */ jsx("div", {
      className: "py-4",
      children: t("main.isThreeAccessToElectricity")
    }), /* @__PURE__ */ jsxs("div", {
      className: "flex space-x-1 rounded-xl bg-gray-200 p-1 mt-2 text-center",
      children: [/* @__PURE__ */ jsx("div", {
        className: accessElectricity ? "w-full rounded-lg py-2.5  font-medium leading-5 bg-white shadow" : "w-full rounded-lg py-2.5  font-medium leading-5 shadow bg-gray-200",
        children: t("main.yes")
      }), /* @__PURE__ */ jsx("div", {
        className: "w-full rounded-lg py-2.5  font-medium leading-5 bg-gray-200",
        children: t("main.no")
      })]
    }), /* @__PURE__ */ jsx("div", {
      className: "py-4",
      children: t("main.paymentMethod")
    }), /* @__PURE__ */ jsxs("div", {
      className: "flex space-x-1 rounded-xl bg-gray-200 p-1 mt-2 text-center",
      children: [/* @__PURE__ */ jsx("div", {
        className: accessElectricity ? "w-full rounded-lg py-2.5  font-medium leading-5 bg-white shadow" : "w-full rounded-lg py-2.5  font-medium leading-5 shadow bg-gray-200",
        children: t("main.inCash")
      }), /* @__PURE__ */ jsx("div", {
        className: "w-full rounded-lg py-2.5  font-medium leading-5 bg-gray-200",
        children: t("main.online")
      })]
    })]
  });
}
__astro_tag_component__(WashTypeComponent, "@astrojs/react");

const $$Astro$1 = createAstro("/Users/davr/development/meduzacarwash/src/pages/index.astro", "", "file:///Users/davr/development/meduzacarwash/");
const $$Index$1 = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$Index$1;
  changeLanguage("ru");
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Main" }, { "default": () => renderTemplate`${renderComponent($$result, "Title", $$Title, {}, { "default": () => renderTemplate`${t("main.specifyDateAndTime")}` })}${renderComponent($$result, "CalendarComponent", CalendarComponent, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/davr/development/meduzacarwash/src/components/CalendarComponent", "client:component-export": "default" })}${renderComponent($$result, "Title", $$Title, {}, { "default": () => renderTemplate`${t("main.specifyALocation")}` })}${renderComponent($$result, "Button", $$Button, {}, { "default": () => renderTemplate`${t("main.determineLocation")}` })}${renderComponent($$result, "MapComponent", MapComponent, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/davr/development/meduzacarwash/src/components/MapComponent", "client:component-export": "default" })}${renderComponent($$result, "Title", $$Title, {}, { "default": () => renderTemplate`${t("main.specifyTypeOfSink")}` })}${renderComponent($$result, "WashTypeComponent", WashTypeComponent, {})}` })}`;
});

const $$file$1 = "/Users/davr/development/meduzacarwash/src/pages/index.astro";
const $$url$1 = "";

const _page0 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Index$1,
	file: $$file$1,
	url: $$url$1
}, Symbol.toStringTag, { value: 'Module' }));

const $$Astro = createAstro("/Users/davr/development/meduzacarwash/src/pages/uz/index.astro", "", "file:///Users/davr/development/meduzacarwash/");
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  changeLanguage("uz");
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Main" }, { "default": () => renderTemplate`${renderComponent($$result, "Title", $$Title, {}, { "default": () => renderTemplate`${t("main.specifyDateAndTime")}` })}${renderComponent($$result, "CalendarComponent", CalendarComponent, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/davr/development/meduzacarwash/src/components/CalendarComponent", "client:component-export": "default" })}${renderComponent($$result, "Title", $$Title, {}, { "default": () => renderTemplate`${t("main.specifyALocation")}` })}${renderComponent($$result, "Button", $$Button, {}, { "default": () => renderTemplate`${t("main.determineLocation")}` })}${renderComponent($$result, "MapComponent", MapComponent, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/davr/development/meduzacarwash/src/components/MapComponent", "client:component-export": "default" })}${renderComponent($$result, "Title", $$Title, {}, { "default": () => renderTemplate`${t("main.specifyTypeOfSink")}` })}${renderComponent($$result, "WashTypeComponent", WashTypeComponent, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/davr/development/meduzacarwash/src/components/WashTypeComponent", "client:component-export": "default" })}` })}`;
});

const $$file = "/Users/davr/development/meduzacarwash/src/pages/uz/index.astro";
const $$url = "/uz";

const _page1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Index,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const pageMap = new Map([['src/pages/index.astro', _page0],['src/pages/uz/index.astro', _page1],]);
const renderers = [Object.assign({"name":"astro:jsx","serverEntrypoint":"astro/jsx/server.js","jsxImportSource":"astro"}, { ssr: server_default }),Object.assign({"name":"@astrojs/react","clientEntrypoint":"@astrojs/react/client.js","serverEntrypoint":"@astrojs/react/server.js","jsxImportSource":"react"}, { ssr: _renderer1 }),];

if (typeof process !== "undefined") {
  if (process.argv.includes("--verbose")) ; else if (process.argv.includes("--silent")) ; else ;
}

const SCRIPT_EXTENSIONS = /* @__PURE__ */ new Set([".js", ".ts"]);
new RegExp(
  `\\.(${Array.from(SCRIPT_EXTENSIONS).map((s) => s.slice(1)).join("|")})($|\\?)`
);

const STYLE_EXTENSIONS = /* @__PURE__ */ new Set([
  ".css",
  ".pcss",
  ".postcss",
  ".scss",
  ".sass",
  ".styl",
  ".stylus",
  ".less"
]);
new RegExp(
  `\\.(${Array.from(STYLE_EXTENSIONS).map((s) => s.slice(1)).join("|")})($|\\?)`
);

/**
 * Tokenize input string.
 */
function lexer(str) {
    var tokens = [];
    var i = 0;
    while (i < str.length) {
        var char = str[i];
        if (char === "*" || char === "+" || char === "?") {
            tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
            continue;
        }
        if (char === "\\") {
            tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
            continue;
        }
        if (char === "{") {
            tokens.push({ type: "OPEN", index: i, value: str[i++] });
            continue;
        }
        if (char === "}") {
            tokens.push({ type: "CLOSE", index: i, value: str[i++] });
            continue;
        }
        if (char === ":") {
            var name = "";
            var j = i + 1;
            while (j < str.length) {
                var code = str.charCodeAt(j);
                if (
                // `0-9`
                (code >= 48 && code <= 57) ||
                    // `A-Z`
                    (code >= 65 && code <= 90) ||
                    // `a-z`
                    (code >= 97 && code <= 122) ||
                    // `_`
                    code === 95) {
                    name += str[j++];
                    continue;
                }
                break;
            }
            if (!name)
                throw new TypeError("Missing parameter name at ".concat(i));
            tokens.push({ type: "NAME", index: i, value: name });
            i = j;
            continue;
        }
        if (char === "(") {
            var count = 1;
            var pattern = "";
            var j = i + 1;
            if (str[j] === "?") {
                throw new TypeError("Pattern cannot start with \"?\" at ".concat(j));
            }
            while (j < str.length) {
                if (str[j] === "\\") {
                    pattern += str[j++] + str[j++];
                    continue;
                }
                if (str[j] === ")") {
                    count--;
                    if (count === 0) {
                        j++;
                        break;
                    }
                }
                else if (str[j] === "(") {
                    count++;
                    if (str[j + 1] !== "?") {
                        throw new TypeError("Capturing groups are not allowed at ".concat(j));
                    }
                }
                pattern += str[j++];
            }
            if (count)
                throw new TypeError("Unbalanced pattern at ".concat(i));
            if (!pattern)
                throw new TypeError("Missing pattern at ".concat(i));
            tokens.push({ type: "PATTERN", index: i, value: pattern });
            i = j;
            continue;
        }
        tokens.push({ type: "CHAR", index: i, value: str[i++] });
    }
    tokens.push({ type: "END", index: i, value: "" });
    return tokens;
}
/**
 * Parse a string for the raw tokens.
 */
function parse(str, options) {
    if (options === void 0) { options = {}; }
    var tokens = lexer(str);
    var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a;
    var defaultPattern = "[^".concat(escapeString(options.delimiter || "/#?"), "]+?");
    var result = [];
    var key = 0;
    var i = 0;
    var path = "";
    var tryConsume = function (type) {
        if (i < tokens.length && tokens[i].type === type)
            return tokens[i++].value;
    };
    var mustConsume = function (type) {
        var value = tryConsume(type);
        if (value !== undefined)
            return value;
        var _a = tokens[i], nextType = _a.type, index = _a.index;
        throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
    };
    var consumeText = function () {
        var result = "";
        var value;
        while ((value = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR"))) {
            result += value;
        }
        return result;
    };
    while (i < tokens.length) {
        var char = tryConsume("CHAR");
        var name = tryConsume("NAME");
        var pattern = tryConsume("PATTERN");
        if (name || pattern) {
            var prefix = char || "";
            if (prefixes.indexOf(prefix) === -1) {
                path += prefix;
                prefix = "";
            }
            if (path) {
                result.push(path);
                path = "";
            }
            result.push({
                name: name || key++,
                prefix: prefix,
                suffix: "",
                pattern: pattern || defaultPattern,
                modifier: tryConsume("MODIFIER") || "",
            });
            continue;
        }
        var value = char || tryConsume("ESCAPED_CHAR");
        if (value) {
            path += value;
            continue;
        }
        if (path) {
            result.push(path);
            path = "";
        }
        var open = tryConsume("OPEN");
        if (open) {
            var prefix = consumeText();
            var name_1 = tryConsume("NAME") || "";
            var pattern_1 = tryConsume("PATTERN") || "";
            var suffix = consumeText();
            mustConsume("CLOSE");
            result.push({
                name: name_1 || (pattern_1 ? key++ : ""),
                pattern: name_1 && !pattern_1 ? defaultPattern : pattern_1,
                prefix: prefix,
                suffix: suffix,
                modifier: tryConsume("MODIFIER") || "",
            });
            continue;
        }
        mustConsume("END");
    }
    return result;
}
/**
 * Compile a string to a template function for the path.
 */
function compile(str, options) {
    return tokensToFunction(parse(str, options), options);
}
/**
 * Expose a method for transforming tokens into the path function.
 */
function tokensToFunction(tokens, options) {
    if (options === void 0) { options = {}; }
    var reFlags = flags(options);
    var _a = options.encode, encode = _a === void 0 ? function (x) { return x; } : _a, _b = options.validate, validate = _b === void 0 ? true : _b;
    // Compile all the tokens into regexps.
    var matches = tokens.map(function (token) {
        if (typeof token === "object") {
            return new RegExp("^(?:".concat(token.pattern, ")$"), reFlags);
        }
    });
    return function (data) {
        var path = "";
        for (var i = 0; i < tokens.length; i++) {
            var token = tokens[i];
            if (typeof token === "string") {
                path += token;
                continue;
            }
            var value = data ? data[token.name] : undefined;
            var optional = token.modifier === "?" || token.modifier === "*";
            var repeat = token.modifier === "*" || token.modifier === "+";
            if (Array.isArray(value)) {
                if (!repeat) {
                    throw new TypeError("Expected \"".concat(token.name, "\" to not repeat, but got an array"));
                }
                if (value.length === 0) {
                    if (optional)
                        continue;
                    throw new TypeError("Expected \"".concat(token.name, "\" to not be empty"));
                }
                for (var j = 0; j < value.length; j++) {
                    var segment = encode(value[j], token);
                    if (validate && !matches[i].test(segment)) {
                        throw new TypeError("Expected all \"".concat(token.name, "\" to match \"").concat(token.pattern, "\", but got \"").concat(segment, "\""));
                    }
                    path += token.prefix + segment + token.suffix;
                }
                continue;
            }
            if (typeof value === "string" || typeof value === "number") {
                var segment = encode(String(value), token);
                if (validate && !matches[i].test(segment)) {
                    throw new TypeError("Expected \"".concat(token.name, "\" to match \"").concat(token.pattern, "\", but got \"").concat(segment, "\""));
                }
                path += token.prefix + segment + token.suffix;
                continue;
            }
            if (optional)
                continue;
            var typeOfMessage = repeat ? "an array" : "a string";
            throw new TypeError("Expected \"".concat(token.name, "\" to be ").concat(typeOfMessage));
        }
        return path;
    };
}
/**
 * Escape a regular expression string.
 */
function escapeString(str) {
    return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
/**
 * Get the flags for a regexp from the options.
 */
function flags(options) {
    return options && options.sensitive ? "" : "i";
}

function getRouteGenerator(segments, addTrailingSlash) {
  const template = segments.map((segment) => {
    return "/" + segment.map((part) => {
      if (part.spread) {
        return `:${part.content.slice(3)}(.*)?`;
      } else if (part.dynamic) {
        return `:${part.content}`;
      } else {
        return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      }
    }).join("");
  }).join("");
  let trailing = "";
  if (addTrailingSlash === "always" && segments.length) {
    trailing = "/";
  }
  const toPath = compile(template + trailing);
  return toPath;
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  return {
    ...serializedManifest,
    assets,
    routes
  };
}

const _manifest = Object.assign(deserializeManifest({"adapterName":"@astrojs/netlify/functions","routes":[{"file":"","links":["assets/index.0cb4ac7a.css"],"scripts":[],"routeData":{"route":"/","type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/index.0cb4ac7a.css"],"scripts":[],"routeData":{"route":"/uz","type":"page","pattern":"^\\/uz\\/?$","segments":[[{"content":"uz","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/uz/index.astro","pathname":"/uz","_meta":{"trailingSlash":"ignore"}}}],"base":"/","markdown":{"drafts":false,"syntaxHighlight":"shiki","shikiConfig":{"langs":[],"theme":"github-dark","wrap":false},"remarkPlugins":[],"rehypePlugins":[],"remarkRehype":{},"extendDefaultPlugins":false,"isAstroFlavoredMd":false},"pageMap":null,"renderers":[],"entryModules":{"\u0000@astrojs-ssr-virtual-entry":"entry.mjs","/Users/davr/development/meduzacarwash/src/components/CalendarComponent":"CalendarComponent.2b4c6a82.js","/Users/davr/development/meduzacarwash/src/components/MapComponent":"MapComponent.045dcee0.js","/Users/davr/development/meduzacarwash/src/components/WashTypeComponent":"WashTypeComponent.17661319.js","@astrojs/react/client.js":"client.c057a9c1.js","astro:scripts/before-hydration.js":""},"assets":["/assets/index.0cb4ac7a.css","/CalendarComponent.2b4c6a82.js","/MapComponent.045dcee0.js","/WashTypeComponent.17661319.js","/client.c057a9c1.js","/favicon.svg","/chunks/index.e080a5c3.js","/chunks/jsx-runtime.ab6f8511.js","/images/archive.zip","/images/logo.png","/images/icons/1.png","/images/icons/2.png","/images/icons/3.png","/images/icons/4.png","/images/icons/5.png","/images/icons/6.png","/images/icons/7.png","/images/icons/8.png","/images/icons/9.png"]}), {
	pageMap: pageMap,
	renderers: renderers
});
const _args = {};

const _exports = adapter.createExports(_manifest, _args);
const handler = _exports['handler'];

const _start = 'start';
if(_start in adapter) {
	adapter[_start](_manifest, _args);
}

export { handler };
