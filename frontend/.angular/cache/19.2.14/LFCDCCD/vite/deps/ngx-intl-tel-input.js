import {
  require_libphonenumber
} from "./chunk-BPCHOBCM.js";
import {
  AnimationBuilder
} from "./chunk-BF7I4TNP.js";
import {
  animate,
  style
} from "./chunk-SZJPLAKF.js";
import {
  DefaultValueAccessor,
  FormsModule,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  NgControl,
  NgControlStatus,
  NgModel,
  ReactiveFormsModule
} from "./chunk-ZXOJZ6TS.js";
import {
  CommonModule,
  NgClass,
  NgForOf,
  NgIf
} from "./chunk-AY24CEL3.js";
import {
  DOCUMENT,
  isPlatformBrowser
} from "./chunk-XAUQXKOI.js";
import {
  ApplicationRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ComponentFactoryResolver$1,
  Directive,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Inject,
  Injectable,
  Injector,
  Input,
  NgModule,
  NgZone,
  Output,
  PLATFORM_ID,
  Renderer2,
  RendererFactory2,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  forwardRef,
  setClassMetadata,
  ɵɵNgOnChangesFeature,
  ɵɵProvidersFeature,
  ɵɵadvance,
  ɵɵattribute,
  ɵɵclassProp,
  ɵɵdefineComponent,
  ɵɵdefineDirective,
  ɵɵdefineInjectable,
  ɵɵdefineInjector,
  ɵɵdefineNgModule,
  ɵɵdirectiveInject,
  ɵɵelement,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵgetCurrentView,
  ɵɵinject,
  ɵɵlistener,
  ɵɵloadQuery,
  ɵɵnextContext,
  ɵɵprojection,
  ɵɵprojectionDef,
  ɵɵproperty,
  ɵɵpureFunction1,
  ɵɵqueryRefresh,
  ɵɵreference,
  ɵɵresetView,
  ɵɵrestoreView,
  ɵɵtemplate,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1,
  ɵɵtwoWayBindingSet,
  ɵɵtwoWayListener,
  ɵɵtwoWayProperty,
  ɵɵviewQuery
} from "./chunk-FF22HASU.js";
import {
  animationFrameScheduler,
  fromEvent,
  merge
} from "./chunk-WPM5VTLQ.js";
import "./chunk-PEBH6BBU.js";
import {
  Subject,
  filter,
  of
} from "./chunk-4S3KYZTJ.js";
import {
  __spreadProps,
  __spreadValues,
  __toESM
} from "./chunk-KBUIKKCC.js";

// node_modules/ngx-intl-tel-input/fesm2022/ngx-intl-tel-input.mjs
var lpn = __toESM(require_libphonenumber(), 1);

// node_modules/ngx-bootstrap/utils/fesm2022/ngx-bootstrap-utils.mjs
var Trigger = class {
  constructor(open, close) {
    this.open = open;
    this.close = close || open;
  }
  isManual() {
    return this.open === "manual" || this.close === "manual";
  }
};
var DEFAULT_ALIASES = {
  hover: ["mouseover", "mouseout"],
  focus: ["focusin", "focusout"]
};
function parseTriggers(triggers, aliases = DEFAULT_ALIASES) {
  const trimmedTriggers = (triggers || "").trim();
  if (trimmedTriggers.length === 0) {
    return [];
  }
  const parsedTriggers = trimmedTriggers.split(/\s+/).map((trigger) => trigger.split(":")).map((triggerPair) => {
    const alias = aliases[triggerPair[0]] || triggerPair;
    return new Trigger(alias[0], alias[1]);
  });
  const manualTriggers = parsedTriggers.filter((triggerPair) => triggerPair.isManual());
  if (manualTriggers.length > 1) {
    throw new Error("Triggers parse error: only one manual trigger is allowed");
  }
  if (manualTriggers.length === 1 && parsedTriggers.length > 1) {
    throw new Error("Triggers parse error: manual trigger can't be mixed with other triggers");
  }
  return parsedTriggers;
}
function listenToTriggersV2(renderer, options) {
  const parsedTriggers = parseTriggers(options.triggers);
  const target = options.target;
  if (parsedTriggers.length === 1 && parsedTriggers[0].isManual()) {
    return Function.prototype;
  }
  const listeners = [];
  const _registerHide = [];
  const registerHide = () => {
    _registerHide.forEach((fn) => listeners.push(fn()));
    _registerHide.length = 0;
  };
  parsedTriggers.forEach((trigger) => {
    const useToggle = trigger.open === trigger.close;
    const showFn = useToggle ? options.toggle : options.show;
    if (!useToggle && trigger.close && options.hide) {
      const triggerClose = trigger.close;
      const optionsHide = options.hide;
      const _hide = () => renderer.listen(target, triggerClose, optionsHide);
      _registerHide.push(_hide);
    }
    if (showFn) {
      listeners.push(renderer.listen(target, trigger.open, () => showFn(registerHide)));
    }
  });
  return () => {
    listeners.forEach((unsubscribeFn) => unsubscribeFn());
  };
}
function registerOutsideClick(renderer, options) {
  if (!options.outsideClick) {
    return Function.prototype;
  }
  return renderer.listen("document", "click", (event) => {
    if (options.target && options.target.contains(event.target)) {
      return;
    }
    if (options.targets && options.targets.some((target) => target.contains(event.target))) {
      return;
    }
    if (options.hide) {
      options.hide();
    }
  });
}
function registerEscClick(renderer, options) {
  if (!options.outsideEsc) {
    return Function.prototype;
  }
  return renderer.listen("document", "keyup.esc", (event) => {
    if (options.target && options.target.contains(event.target)) {
      return;
    }
    if (options.targets && options.targets.some((target) => target.contains(event.target))) {
      return;
    }
    if (options.hide) {
      options.hide();
    }
  });
}
var win = typeof window !== "undefined" && window || {};
var document2 = win.document;
var location = win.location;
var gc = win.gc ? () => win.gc() : () => null;
var performance = win.performance ? win.performance : null;
var Event = win.Event;
var MouseEvent = win.MouseEvent;
var KeyboardEvent = win.KeyboardEvent;
var EventTarget = win.EventTarget;
var History = win.History;
var Location = win.Location;
var EventListener = win.EventListener;
var BsVerions;
(function(BsVerions2) {
  BsVerions2["isBs4"] = "bs4";
  BsVerions2["isBs5"] = "bs5";
})(BsVerions || (BsVerions = {}));
var guessedVersion;
function _guessBsVersion() {
  const spanEl = win.document.createElement("span");
  spanEl.innerText = "testing bs version";
  spanEl.classList.add("d-none");
  spanEl.classList.add("pl-1");
  win.document.head.appendChild(spanEl);
  const checkPadding = win.getComputedStyle(spanEl).paddingLeft;
  if (checkPadding && parseFloat(checkPadding)) {
    win.document.head.removeChild(spanEl);
    return "bs4";
  }
  win.document.head.removeChild(spanEl);
  return "bs5";
}
function setTheme(theme) {
  guessedVersion = theme;
}
function isBs4() {
  if (guessedVersion) return guessedVersion === "bs4";
  guessedVersion = _guessBsVersion();
  return guessedVersion === "bs4";
}
function isBs5() {
  if (guessedVersion) return guessedVersion === "bs5";
  guessedVersion = _guessBsVersion();
  return guessedVersion === "bs5";
}
function getBsVer() {
  return {
    isBs4: isBs4(),
    isBs5: isBs5()
  };
}
var _hideMsg = typeof console === "undefined" || !("warn" in console);

// node_modules/ngx-bootstrap/positioning/fesm2022/ngx-bootstrap-positioning.mjs
var MapPlacementInToRL;
(function(MapPlacementInToRL2) {
  MapPlacementInToRL2["top"] = "top";
  MapPlacementInToRL2["bottom"] = "bottom";
  MapPlacementInToRL2["left"] = "left";
  MapPlacementInToRL2["right"] = "right";
  MapPlacementInToRL2["auto"] = "auto";
  MapPlacementInToRL2["end"] = "right";
  MapPlacementInToRL2["start"] = "left";
  MapPlacementInToRL2["top left"] = "top left";
  MapPlacementInToRL2["top right"] = "top right";
  MapPlacementInToRL2["right top"] = "right top";
  MapPlacementInToRL2["right bottom"] = "right bottom";
  MapPlacementInToRL2["bottom right"] = "bottom right";
  MapPlacementInToRL2["bottom left"] = "bottom left";
  MapPlacementInToRL2["left bottom"] = "left bottom";
  MapPlacementInToRL2["left top"] = "left top";
  MapPlacementInToRL2["top start"] = "top left";
  MapPlacementInToRL2["top end"] = "top right";
  MapPlacementInToRL2["end top"] = "right top";
  MapPlacementInToRL2["end bottom"] = "right bottom";
  MapPlacementInToRL2["bottom end"] = "bottom right";
  MapPlacementInToRL2["bottom start"] = "bottom left";
  MapPlacementInToRL2["start bottom"] = "start bottom";
  MapPlacementInToRL2["start top"] = "left top";
})(MapPlacementInToRL || (MapPlacementInToRL = {}));
var PlacementForBs5;
(function(PlacementForBs52) {
  PlacementForBs52["top"] = "top";
  PlacementForBs52["bottom"] = "bottom";
  PlacementForBs52["left"] = "start";
  PlacementForBs52["right"] = "end";
  PlacementForBs52["auto"] = "auto";
  PlacementForBs52["end"] = "end";
  PlacementForBs52["start"] = "start";
  PlacementForBs52["top left"] = "top start";
  PlacementForBs52["top right"] = "top end";
  PlacementForBs52["right top"] = "end top";
  PlacementForBs52["right bottom"] = "end bottom";
  PlacementForBs52["bottom right"] = "bottom end";
  PlacementForBs52["bottom left"] = "bottom start";
  PlacementForBs52["left bottom"] = "start bottom";
  PlacementForBs52["left top"] = "start top";
  PlacementForBs52["top start"] = "top start";
  PlacementForBs52["top end"] = "top end";
  PlacementForBs52["end top"] = "end top";
  PlacementForBs52["end bottom"] = "end bottom";
  PlacementForBs52["bottom end"] = "bottom end";
  PlacementForBs52["bottom start"] = "bottom start";
  PlacementForBs52["start bottom"] = "start bottom";
  PlacementForBs52["start top"] = "start top";
})(PlacementForBs5 || (PlacementForBs5 = {}));
function getStyleComputedProperty(element, property) {
  if (element.nodeType !== 1) {
    return [];
  }
  const window2 = element.ownerDocument.defaultView;
  const css = window2?.getComputedStyle(element, null);
  return property ? css && css[property] : css;
}
function getOffsetParent(element) {
  if (!element) {
    return document.documentElement;
  }
  const noOffsetParent = null;
  let offsetParent = element?.offsetParent;
  let sibling = void 0;
  while (offsetParent === noOffsetParent && element.nextElementSibling && sibling !== element.nextElementSibling) {
    sibling = element.nextElementSibling;
    offsetParent = sibling.offsetParent;
  }
  const nodeName = offsetParent && offsetParent.nodeName;
  if (!nodeName || nodeName === "BODY" || nodeName === "HTML") {
    return sibling ? sibling.ownerDocument.documentElement : document.documentElement;
  }
  if (offsetParent && ["TH", "TD", "TABLE"].indexOf(offsetParent.nodeName) !== -1 && getStyleComputedProperty(offsetParent, "position") === "static") {
    return getOffsetParent(offsetParent);
  }
  return offsetParent;
}
function isOffsetContainer(element) {
  const {
    nodeName
  } = element;
  if (nodeName === "BODY") {
    return false;
  }
  return nodeName === "HTML" || getOffsetParent(element.firstElementChild) === element;
}
function getRoot(node) {
  if (node.parentNode !== null) {
    return getRoot(node.parentNode);
  }
  return node;
}
function findCommonOffsetParent(element1, element2) {
  if (!element1 || !element1.nodeType || !element2 || !element2.nodeType) {
    return document.documentElement;
  }
  const order = element1.compareDocumentPosition(element2) & Node.DOCUMENT_POSITION_FOLLOWING;
  const start = order ? element1 : element2;
  const end = order ? element2 : element1;
  const range = document.createRange();
  range.setStart(start, 0);
  range.setEnd(end, 0);
  const commonAncestorContainer = range.commonAncestorContainer;
  if (element1 !== commonAncestorContainer && element2 !== commonAncestorContainer || start.contains(end)) {
    if (isOffsetContainer(commonAncestorContainer)) {
      return commonAncestorContainer;
    }
    return getOffsetParent(commonAncestorContainer);
  }
  const element1root = getRoot(element1);
  if (element1root.host) {
    return findCommonOffsetParent(element1root.host, element2);
  } else {
    return findCommonOffsetParent(element1, getRoot(element2).host);
  }
}
function getFixedPositionOffsetParent(element) {
  if (!element || !element.parentElement) {
    return document.documentElement;
  }
  let el = element.parentElement;
  while (el?.parentElement && getStyleComputedProperty(el, "transform") === "none") {
    el = el.parentElement;
  }
  return el || document.documentElement;
}
function getBordersSize(styles, axis) {
  const sideA = axis === "x" ? "Left" : "Top";
  const sideB = sideA === "Left" ? "Right" : "Bottom";
  return parseFloat(styles[`border${sideA}Width`]) + parseFloat(styles[`border${sideB}Width`]);
}
function getSize(axis, body, html) {
  const _body = body;
  const _html = html;
  return Math.max(_body[`offset${axis}`], _body[`scroll${axis}`], _html[`client${axis}`], _html[`offset${axis}`], _html[`scroll${axis}`], 0);
}
function getWindowSizes(document3) {
  const body = document3.body;
  const html = document3.documentElement;
  return {
    height: getSize("Height", body, html),
    width: getSize("Width", body, html)
  };
}
function getClientRect(offsets) {
  return __spreadProps(__spreadValues({}, offsets), {
    right: (offsets.left || 0) + offsets.width,
    bottom: (offsets.top || 0) + offsets.height
  });
}
function isNumeric(n) {
  return n !== "" && !isNaN(parseFloat(n)) && isFinite(Number(n));
}
function isNumber(value) {
  return typeof value === "number" || Object.prototype.toString.call(value) === "[object Number]";
}
function getBoundingClientRect(element) {
  const rect = element.getBoundingClientRect();
  if (!(rect && isNumber(rect.top) && isNumber(rect.left) && isNumber(rect.bottom) && isNumber(rect.right))) {
    return rect;
  }
  const result = {
    left: rect.left,
    top: rect.top,
    width: rect.right - rect.left,
    height: rect.bottom - rect.top
  };
  const sizes = element.nodeName === "HTML" ? getWindowSizes(element.ownerDocument) : void 0;
  const width = sizes?.width || element.clientWidth || isNumber(rect.right) && isNumber(result.left) && rect.right - result.left || 0;
  const height = sizes?.height || element.clientHeight || isNumber(rect.bottom) && isNumber(result.top) && rect.bottom - result.top || 0;
  let horizScrollbar = element.offsetWidth - width;
  let vertScrollbar = element.offsetHeight - height;
  if (horizScrollbar || vertScrollbar) {
    const styles = getStyleComputedProperty(element);
    horizScrollbar -= getBordersSize(styles, "x");
    vertScrollbar -= getBordersSize(styles, "y");
    result.width -= horizScrollbar;
    result.height -= vertScrollbar;
  }
  return getClientRect(result);
}
function getOffsetRectRelativeToArbitraryNode(children, parent, fixedPosition = false) {
  const isHTML = parent.nodeName === "HTML";
  const childrenRect = getBoundingClientRect(children);
  const parentRect = getBoundingClientRect(parent);
  const styles = getStyleComputedProperty(parent);
  const borderTopWidth = parseFloat(styles.borderTopWidth);
  const borderLeftWidth = parseFloat(styles.borderLeftWidth);
  if (fixedPosition && isHTML) {
    parentRect.top = Math.max(parentRect.top ?? 0, 0);
    parentRect.left = Math.max(parentRect.left ?? 0, 0);
  }
  const offsets = getClientRect({
    top: (childrenRect.top ?? 0) - (parentRect.top ?? 0) - borderTopWidth,
    left: (childrenRect.left ?? 0) - (parentRect.left ?? 0) - borderLeftWidth,
    width: childrenRect.width,
    height: childrenRect.height
  });
  offsets.marginTop = 0;
  offsets.marginLeft = 0;
  if (isHTML) {
    const marginTop = parseFloat(styles.marginTop);
    const marginLeft = parseFloat(styles.marginLeft);
    if (isNumber(offsets.top)) {
      offsets.top -= borderTopWidth - marginTop;
    }
    if (isNumber(offsets.bottom)) {
      offsets.bottom -= borderTopWidth - marginTop;
    }
    if (isNumber(offsets.left)) {
      offsets.left -= borderLeftWidth - marginLeft;
    }
    if (isNumber(offsets.right)) {
      offsets.right -= borderLeftWidth - marginLeft;
    }
    offsets.marginTop = marginTop;
    offsets.marginLeft = marginLeft;
  }
  return offsets;
}
function getParentNode(element) {
  if (element.nodeName === "HTML") {
    return element;
  }
  return element.parentNode || element.host;
}
function getScrollParent(element) {
  if (!element) {
    return document.body;
  }
  switch (element.nodeName) {
    case "HTML":
    case "BODY":
      return element.ownerDocument.body;
    case "#document":
      return element.body;
    default:
  }
  const {
    overflow,
    overflowX,
    overflowY
  } = getStyleComputedProperty(element);
  if (/(auto|scroll|overlay)/.test(String(overflow) + String(overflowY) + String(overflowX))) {
    return element;
  }
  return getScrollParent(getParentNode(element));
}
function getScroll(element, side = "top") {
  const upperSide = side === "top" ? "scrollTop" : "scrollLeft";
  const nodeName = element.nodeName;
  if (nodeName === "BODY" || nodeName === "HTML") {
    const html = element.ownerDocument.documentElement;
    const scrollingElement = element.ownerDocument.scrollingElement || html;
    return scrollingElement[upperSide];
  }
  return element[upperSide];
}
function getViewportOffsetRectRelativeToArtbitraryNode(element, excludeScroll = false) {
  const html = element.ownerDocument.documentElement;
  const relativeOffset = getOffsetRectRelativeToArbitraryNode(element, html);
  const width = Math.max(html.clientWidth, window.innerWidth || 0);
  const height = Math.max(html.clientHeight, window.innerHeight || 0);
  const scrollTop = !excludeScroll ? getScroll(html) : 0;
  const scrollLeft = !excludeScroll ? getScroll(html, "left") : 0;
  const offset = {
    top: scrollTop - Number(relativeOffset?.top) + Number(relativeOffset?.marginTop),
    left: scrollLeft - Number(relativeOffset?.left) + Number(relativeOffset?.marginLeft),
    width,
    height
  };
  return getClientRect(offset);
}
function isFixed(element) {
  const nodeName = element.nodeName;
  if (nodeName === "BODY" || nodeName === "HTML") {
    return false;
  }
  if (getStyleComputedProperty(element, "position") === "fixed") {
    return true;
  }
  return isFixed(getParentNode(element));
}
function getBoundaries(target, host, padding = 0, boundariesElement, fixedPosition = false) {
  let boundaries = {
    top: 0,
    left: 0
  };
  const offsetParent = fixedPosition ? getFixedPositionOffsetParent(target) : findCommonOffsetParent(target, host);
  if (boundariesElement === "viewport") {
    boundaries = getViewportOffsetRectRelativeToArtbitraryNode(offsetParent, fixedPosition);
  } else {
    let boundariesNode;
    if (boundariesElement === "scrollParent") {
      boundariesNode = getScrollParent(getParentNode(host));
      if (boundariesNode.nodeName === "BODY") {
        boundariesNode = target.ownerDocument.documentElement;
      }
    } else if (boundariesElement === "window") {
      boundariesNode = target.ownerDocument.documentElement;
    } else {
      boundariesNode = boundariesElement;
    }
    const offsets = getOffsetRectRelativeToArbitraryNode(boundariesNode, offsetParent, fixedPosition);
    if (offsets && boundariesNode.nodeName === "HTML" && !isFixed(offsetParent)) {
      const {
        height,
        width
      } = getWindowSizes(target.ownerDocument);
      if (isNumber(boundaries.top) && isNumber(offsets.top) && isNumber(offsets.marginTop)) {
        boundaries.top += offsets.top - offsets.marginTop;
      }
      if (isNumber(boundaries.top)) {
        boundaries.bottom = Number(height) + Number(offsets.top);
      }
      if (isNumber(boundaries.left) && isNumber(offsets.left) && isNumber(offsets.marginLeft)) {
        boundaries.left += offsets.left - offsets.marginLeft;
      }
      if (isNumber(boundaries.top)) {
        boundaries.right = Number(width) + Number(offsets.left);
      }
    } else if (offsets) {
      boundaries = offsets;
    }
  }
  if (isNumber(boundaries.left)) {
    boundaries.left += padding;
  }
  if (isNumber(boundaries.top)) {
    boundaries.top += padding;
  }
  if (isNumber(boundaries.right)) {
    boundaries.right -= padding;
  }
  if (isNumber(boundaries.bottom)) {
    boundaries.bottom -= padding;
  }
  return boundaries;
}
function getArea({
  width,
  height
}) {
  return width * height;
}
function computeAutoPlacement(placement, refRect, target, host, allowedPositions = ["top", "bottom", "right", "left"], boundariesElement = "viewport", padding = 0) {
  if (placement.indexOf("auto") === -1) {
    return placement;
  }
  const boundaries = getBoundaries(target, host, padding, boundariesElement);
  const rects = {
    top: {
      width: boundaries?.width ?? 0,
      height: (refRect?.top ?? 0) - (boundaries?.top ?? 0)
    },
    right: {
      width: (boundaries?.right ?? 0) - (refRect?.right ?? 0),
      height: boundaries?.height ?? 0
    },
    bottom: {
      width: boundaries?.width ?? 0,
      height: (boundaries?.bottom ?? 0) - (refRect?.bottom ?? 0)
    },
    left: {
      width: (refRect.left ?? 0) - (boundaries?.left ?? 0),
      height: boundaries?.height ?? 0
    }
  };
  const sortedAreas = Object.keys(rects).map((key) => __spreadProps(__spreadValues({
    position: key
  }, rects[key]), {
    area: getArea(rects[key])
  })).sort((a, b) => b.area - a.area);
  let filteredAreas = sortedAreas.filter(({
    width,
    height
  }) => {
    return width >= target.clientWidth && height >= target.clientHeight;
  });
  filteredAreas = filteredAreas.filter(({
    position
  }) => {
    return allowedPositions.some((allowedPosition) => {
      return allowedPosition === position;
    });
  });
  const computedPlacement = filteredAreas.length > 0 ? filteredAreas[0].position : sortedAreas[0].position;
  const variation = placement.split(" ")[1];
  target.className = target.className.replace(/bs-tooltip-auto/g, `bs-tooltip-${getBsVer().isBs5 ? PlacementForBs5[computedPlacement] : computedPlacement}`);
  return computedPlacement + (variation ? `-${variation}` : "");
}
function getOffsets(data) {
  return {
    width: data.offsets.target.width,
    height: data.offsets.target.height,
    left: Math.floor(data.offsets.target.left ?? 0),
    top: Math.round(data.offsets.target.top ?? 0),
    bottom: Math.round(data.offsets.target.bottom ?? 0),
    right: Math.floor(data.offsets.target.right ?? 0)
  };
}
function getOppositePlacement(placement) {
  const hash = {
    left: "right",
    right: "left",
    bottom: "top",
    top: "bottom"
  };
  return placement.replace(/left|right|bottom|top/g, (matched) => hash[matched]);
}
function getOppositeVariation(variation) {
  if (variation === "right") {
    return "left";
  } else if (variation === "left") {
    return "right";
  }
  return variation;
}
var parse = (value, def = 0) => value ? parseFloat(value) : def;
function getOuterSizes(element) {
  const window2 = element.ownerDocument.defaultView;
  const styles = window2?.getComputedStyle(element);
  const x = parse(styles?.marginTop) + parse(styles?.marginBottom);
  const y = parse(styles?.marginLeft) + parse(styles?.marginRight);
  return {
    width: Number(element.offsetWidth) + y,
    height: Number(element.offsetHeight) + x
  };
}
function getReferenceOffsets(target, host, fixedPosition) {
  const commonOffsetParent = fixedPosition ? getFixedPositionOffsetParent(target) : findCommonOffsetParent(target, host);
  return getOffsetRectRelativeToArbitraryNode(host, commonOffsetParent, fixedPosition);
}
function getTargetOffsets(target, hostOffsets, position) {
  const placement = position.split(" ")[0];
  const targetRect = getOuterSizes(target);
  const targetOffsets = {
    width: targetRect.width,
    height: targetRect.height
  };
  const isHoriz = ["right", "left"].indexOf(placement) !== -1;
  const mainSide = isHoriz ? "top" : "left";
  const secondarySide = isHoriz ? "left" : "top";
  const measurement = isHoriz ? "height" : "width";
  const secondaryMeasurement = !isHoriz ? "height" : "width";
  targetOffsets[mainSide] = (hostOffsets[mainSide] ?? 0) + hostOffsets[measurement] / 2 - targetRect[measurement] / 2;
  targetOffsets[secondarySide] = placement === secondarySide ? (hostOffsets[secondarySide] ?? 0) - targetRect[secondaryMeasurement] : hostOffsets[getOppositePlacement(secondarySide)] ?? 0;
  return targetOffsets;
}
function isModifierEnabled(options, modifierName) {
  return !!options.modifiers[modifierName]?.enabled;
}
var availablePositions = {
  top: ["top", "top start", "top end"],
  bottom: ["bottom", "bottom start", "bottom end"],
  start: ["start", "start top", "start bottom"],
  end: ["end", "end top", "end bottom"]
};
function checkPopoverMargin(placement, checkPosition) {
  if (!getBsVer().isBs5) {
    return false;
  }
  return availablePositions[checkPosition].includes(placement);
}
function checkMargins(placement) {
  if (!getBsVer().isBs5) {
    return "";
  }
  if (checkPopoverMargin(placement, "end")) {
    return "ms-2";
  }
  if (checkPopoverMargin(placement, "start")) {
    return "me-2";
  }
  if (checkPopoverMargin(placement, "top")) {
    return "mb-2";
  }
  if (checkPopoverMargin(placement, "bottom")) {
    return "mt-2";
  }
  return "";
}
function updateContainerClass(data, renderer) {
  const target = data.instance.target;
  let containerClass = target.className;
  const dataPlacement = getBsVer().isBs5 ? PlacementForBs5[data.placement] : data.placement;
  if (data.placementAuto) {
    containerClass = containerClass.replace(/bs-popover-auto/g, `bs-popover-${dataPlacement}`);
    containerClass = containerClass.replace(/ms-2|me-2|mb-2|mt-2/g, "");
    containerClass = containerClass.replace(/bs-tooltip-auto/g, `bs-tooltip-${dataPlacement}`);
    containerClass = containerClass.replace(/\sauto/g, ` ${dataPlacement}`);
    if (containerClass.indexOf("popover") !== -1) {
      containerClass = containerClass + " " + checkMargins(dataPlacement);
    }
    if (containerClass.indexOf("popover") !== -1 && containerClass.indexOf("popover-auto") === -1) {
      containerClass += " popover-auto";
    }
    if (containerClass.indexOf("tooltip") !== -1 && containerClass.indexOf("tooltip-auto") === -1) {
      containerClass += " tooltip-auto";
    }
  }
  containerClass = containerClass.replace(/left|right|top|bottom|end|start/g, `${dataPlacement.split(" ")[0]}`);
  if (renderer) {
    renderer.setAttribute(target, "class", containerClass);
    return;
  }
  target.className = containerClass;
}
function setStyles(element, styles, renderer) {
  if (!element || !styles) {
    return;
  }
  Object.keys(styles).forEach((prop) => {
    let unit = "";
    if (["width", "height", "top", "right", "bottom", "left"].indexOf(prop) !== -1 && isNumeric(styles[prop])) {
      unit = "px";
    }
    if (renderer) {
      renderer.setStyle(element, prop, `${String(styles[prop])}${unit}`);
      return;
    }
    element.style[prop] = String(styles[prop]) + unit;
  });
}
function arrow(data) {
  let targetOffsets = data.offsets.target;
  const arrowElement = data.instance.target.querySelector(".arrow");
  if (!arrowElement) {
    return data;
  }
  const isVertical = ["left", "right"].indexOf(data.placement.split(" ")[0]) !== -1;
  const len = isVertical ? "height" : "width";
  const sideCapitalized = isVertical ? "Top" : "Left";
  const side = sideCapitalized.toLowerCase();
  const altSide = isVertical ? "left" : "top";
  const opSide = isVertical ? "bottom" : "right";
  const arrowElementSize = getOuterSizes(arrowElement)[len];
  const placementVariation = data.placement.split(" ")[1];
  if ((data.offsets.host[opSide] ?? 0) - arrowElementSize < (targetOffsets[side] ?? 0)) {
    targetOffsets[side] -= (targetOffsets[side] ?? 0) - ((data.offsets.host[opSide] ?? 0) - arrowElementSize);
  }
  if (Number(data.offsets.host[side]) + Number(arrowElementSize) > (targetOffsets[opSide] ?? 0)) {
    targetOffsets[side] += Number(data.offsets.host[side]) + Number(arrowElementSize) - Number(targetOffsets[opSide]);
  }
  targetOffsets = getClientRect(targetOffsets);
  const css = getStyleComputedProperty(data.instance.target);
  const targetMarginSide = parseFloat(css[`margin${sideCapitalized}`]) || 0;
  const targetBorderSide = parseFloat(css[`border${sideCapitalized}Width`]) || 0;
  let center;
  if (!placementVariation) {
    center = Number(data.offsets.host[side]) + Number(data.offsets.host[len] / 2 - arrowElementSize / 2);
  } else {
    const targetBorderRadius = parseFloat(css["borderRadius"]) || 0;
    const targetSideArrowOffset = Number(targetMarginSide + targetBorderSide + targetBorderRadius);
    center = side === placementVariation ? Number(data.offsets.host[side]) + targetSideArrowOffset : Number(data.offsets.host[side]) + Number(data.offsets.host[len] - targetSideArrowOffset);
  }
  let sideValue = center - (targetOffsets[side] ?? 0) - targetMarginSide - targetBorderSide;
  sideValue = Math.max(Math.min(targetOffsets[len] - (arrowElementSize + 5), sideValue), 0);
  data.offsets.arrow = {
    [side]: Math.round(sideValue),
    [altSide]: ""
    // make sure to unset any eventual altSide value from the DOM node
  };
  data.instance.arrow = arrowElement;
  return data;
}
function flip(data) {
  data.offsets.target = getClientRect(data.offsets.target);
  if (!isModifierEnabled(data.options, "flip")) {
    data.offsets.target = __spreadValues(__spreadValues({}, data.offsets.target), getTargetOffsets(data.instance.target, data.offsets.host, data.placement));
    return data;
  }
  const boundaries = getBoundaries(
    data.instance.target,
    data.instance.host,
    0,
    // padding
    "viewport",
    false
    // positionFixed
  );
  let placement = data.placement.split(" ")[0];
  let variation = data.placement.split(" ")[1] || "";
  const offsetsHost = data.offsets.host;
  const target = data.instance.target;
  const host = data.instance.host;
  const adaptivePosition = computeAutoPlacement("auto", offsetsHost, target, host, data.options.allowedPositions);
  const flipOrder = [placement, adaptivePosition];
  flipOrder.forEach((step, index) => {
    if (placement !== step || flipOrder.length === index + 1) {
      return;
    }
    placement = data.placement.split(" ")[0];
    const overlapsRef = placement === "left" && Math.floor(data.offsets.target.right ?? 0) > Math.floor(data.offsets.host.left ?? 0) || placement === "right" && Math.floor(data.offsets.target.left ?? 0) < Math.floor(data.offsets.host.right ?? 0) || placement === "top" && Math.floor(data.offsets.target.bottom ?? 0) > Math.floor(data.offsets.host.top ?? 0) || placement === "bottom" && Math.floor(data.offsets.target.top ?? 0) < Math.floor(data.offsets.host.bottom ?? 0);
    const overflowsLeft = Math.floor(data.offsets.target.left ?? 0) < Math.floor(boundaries.left ?? 0);
    const overflowsRight = Math.floor(data.offsets.target.right ?? 0) > Math.floor(boundaries.right ?? 0);
    const overflowsTop = Math.floor(data.offsets.target.top ?? 0) < Math.floor(boundaries.top ?? 0);
    const overflowsBottom = Math.floor(data.offsets.target.bottom ?? 0) > Math.floor(boundaries.bottom ?? 0);
    const overflowsBoundaries = placement === "left" && overflowsLeft || placement === "right" && overflowsRight || placement === "top" && overflowsTop || placement === "bottom" && overflowsBottom;
    const isVertical = ["top", "bottom"].indexOf(placement) !== -1;
    const flippedVariation = isVertical && variation === "left" && overflowsLeft || isVertical && variation === "right" && overflowsRight || !isVertical && variation === "left" && overflowsTop || !isVertical && variation === "right" && overflowsBottom;
    if (overlapsRef || overflowsBoundaries || flippedVariation) {
      if (overlapsRef || overflowsBoundaries) {
        placement = flipOrder[index + 1];
      }
      if (flippedVariation) {
        variation = getOppositeVariation(variation);
      }
      data.placement = placement + (variation ? ` ${variation}` : "");
      data.offsets.target = __spreadValues(__spreadValues({}, data.offsets.target), getTargetOffsets(data.instance.target, data.offsets.host, data.placement));
    }
  });
  return data;
}
function initData(targetElement, hostElement, position, options) {
  if (!targetElement || !hostElement) {
    return;
  }
  const hostElPosition = getReferenceOffsets(targetElement, hostElement);
  if (!position.match(/^(auto)*\s*(left|right|top|bottom|start|end)*$/) && !position.match(/^(left|right|top|bottom|start|end)*(?: (left|right|top|bottom|start|end))*$/)) {
    position = "auto";
  }
  const placementAuto = !!position.match(/auto/g);
  let placement = position.match(/auto\s(left|right|top|bottom|start|end)/) ? position.split(" ")[1] || "auto" : position;
  const matches = placement.match(/^(left|right|top|bottom|start|end)* ?(?!\1)(left|right|top|bottom|start|end)?/);
  if (matches) {
    placement = matches[1] + (matches[2] ? ` ${matches[2]}` : "");
  }
  if (["left right", "right left", "top bottom", "bottom top"].indexOf(placement) !== -1) {
    placement = "auto";
  }
  placement = computeAutoPlacement(placement, hostElPosition, targetElement, hostElement, options ? options.allowedPositions : void 0);
  const targetOffset = getTargetOffsets(targetElement, hostElPosition, placement);
  return {
    options: options || {
      modifiers: {}
    },
    instance: {
      target: targetElement,
      host: hostElement,
      arrow: void 0
    },
    offsets: {
      target: targetOffset,
      host: hostElPosition,
      arrow: void 0
    },
    positionFixed: false,
    placement,
    placementAuto
  };
}
function preventOverflow(data) {
  if (!isModifierEnabled(data.options, "preventOverflow")) {
    return data;
  }
  const transformProp = "transform";
  const targetStyles = data.instance.target.style;
  const {
    top,
    left,
    [transformProp]: transform
  } = targetStyles;
  targetStyles.top = "";
  targetStyles.left = "";
  targetStyles[transformProp] = "";
  const boundaries = getBoundaries(
    data.instance.target,
    data.instance.host,
    0,
    // padding
    data.options.modifiers.preventOverflow?.boundariesElement || "scrollParent",
    false
    // positionFixed
  );
  targetStyles.top = top;
  targetStyles.left = left;
  targetStyles[transformProp] = transform;
  const order = ["left", "right", "top", "bottom"];
  const check = {
    primary(placement) {
      let value = data.offsets.target[placement];
      if ((data.offsets.target[placement] ?? 0) < (boundaries[placement] ?? 0)) {
        value = Math.max(data.offsets.target[placement] ?? 0, boundaries[placement] ?? 0);
      }
      return {
        [placement]: value
      };
    },
    secondary(placement) {
      const isPlacementHorizontal = placement === "right";
      const mainSide = isPlacementHorizontal ? "left" : "top";
      const measurement = isPlacementHorizontal ? "width" : "height";
      let value = data.offsets.target[mainSide];
      if ((data.offsets.target[placement] ?? 0) > (boundaries[placement] ?? 0)) {
        value = Math.min(data.offsets.target[mainSide] ?? 0, (boundaries[placement] ?? 0) - data.offsets.target[measurement]);
      }
      return {
        [mainSide]: value
      };
    }
  };
  order.forEach((placement) => {
    const side = ["left", "top", "start"].indexOf(placement) !== -1 ? check["primary"] : check["secondary"];
    data.offsets.target = __spreadValues(__spreadValues({}, data.offsets.target), side(placement));
  });
  return data;
}
function shift(data) {
  const placement = data.placement;
  const basePlacement = placement.split(" ")[0];
  const shiftVariation = placement.split(" ")[1];
  if (shiftVariation) {
    const {
      host,
      target
    } = data.offsets;
    const isVertical = ["bottom", "top"].indexOf(basePlacement) !== -1;
    const side = isVertical ? "left" : "top";
    const measurement = isVertical ? "width" : "height";
    const shiftOffsets = {
      start: {
        [side]: host[side]
      },
      end: {
        [side]: (host[side] ?? 0) + host[measurement] - target[measurement]
      }
    };
    data.offsets.target = __spreadValues(__spreadValues({}, target), {
      [side]: side === shiftVariation ? shiftOffsets.start[side] : shiftOffsets.end[side]
    });
  }
  return data;
}
var Positioning = class {
  position(hostElement, targetElement) {
    return this.offset(
      hostElement,
      targetElement
      /*, false*/
    );
  }
  offset(hostElement, targetElement) {
    return getReferenceOffsets(targetElement, hostElement);
  }
  positionElements(hostElement, targetElement, position, appendToBody, options) {
    const chainOfModifiers = [flip, shift, preventOverflow, arrow];
    const _position = MapPlacementInToRL[position];
    const data = initData(targetElement, hostElement, _position, options);
    if (!data) {
      return;
    }
    return chainOfModifiers.reduce((modifiedData, modifier) => modifier(modifiedData), data);
  }
};
var positionService = new Positioning();
function positionElements(hostElement, targetElement, placement, appendToBody, options, renderer) {
  const data = positionService.positionElements(hostElement, targetElement, placement, appendToBody, options);
  if (!data) {
    return;
  }
  const offsets = getOffsets(data);
  setStyles(targetElement, {
    "will-change": "transform",
    top: "0px",
    left: "0px",
    transform: `translate3d(${offsets.left}px, ${offsets.top}px, 0px)`
  }, renderer);
  if (data.instance.arrow) {
    setStyles(data.instance.arrow, data.offsets.arrow, renderer);
  }
  updateContainerClass(data, renderer);
}
var PositioningService = class _PositioningService {
  constructor(ngZone, rendererFactory, platformId) {
    this.update$$ = new Subject();
    this.positionElements = /* @__PURE__ */ new Map();
    this.isDisabled = false;
    if (isPlatformBrowser(platformId)) {
      ngZone.runOutsideAngular(() => {
        this.triggerEvent$ = merge(fromEvent(window, "scroll", {
          passive: true
        }), fromEvent(window, "resize", {
          passive: true
        }), of(0, animationFrameScheduler), this.update$$);
        this.triggerEvent$.subscribe(() => {
          if (this.isDisabled) {
            return;
          }
          this.positionElements.forEach((positionElement) => {
            positionElements(_getHtmlElement(positionElement.target), _getHtmlElement(positionElement.element), positionElement.attachment, positionElement.appendToBody, this.options, rendererFactory.createRenderer(null, null));
          });
        });
      });
    }
  }
  position(options) {
    this.addPositionElement(options);
  }
  get event$() {
    return this.triggerEvent$;
  }
  disable() {
    this.isDisabled = true;
  }
  enable() {
    this.isDisabled = false;
  }
  addPositionElement(options) {
    this.positionElements.set(_getHtmlElement(options.element), options);
  }
  calcPosition() {
    this.update$$.next(null);
  }
  deletePositionElement(elRef) {
    this.positionElements.delete(_getHtmlElement(elRef));
  }
  setOptions(options) {
    this.options = options;
  }
  static {
    this.ɵfac = function PositioningService_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || _PositioningService)(ɵɵinject(NgZone), ɵɵinject(RendererFactory2), ɵɵinject(PLATFORM_ID));
    };
  }
  static {
    this.ɵprov = ɵɵdefineInjectable({
      token: _PositioningService,
      factory: _PositioningService.ɵfac,
      providedIn: "root"
    });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(PositioningService, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], () => [{
    type: NgZone
  }, {
    type: RendererFactory2
  }, {
    type: void 0,
    decorators: [{
      type: Inject,
      args: [PLATFORM_ID]
    }]
  }], null);
})();
function _getHtmlElement(element) {
  if (typeof element === "string") {
    return document.querySelector(element);
  }
  if (element instanceof ElementRef) {
    return element.nativeElement;
  }
  return element ?? null;
}

// node_modules/ngx-bootstrap/component-loader/fesm2022/ngx-bootstrap-component-loader.mjs
var ContentRef = class {
  constructor(nodes, viewRef, componentRef) {
    this.nodes = nodes;
    this.viewRef = viewRef;
    this.componentRef = componentRef;
  }
};
var ComponentLoader = class {
  /**
   * Do not use this directly, it should be instanced via
   * `ComponentLoadFactory.attach`
   * @internal
   */
  constructor(_viewContainerRef, _renderer, _elementRef, _injector, _componentFactoryResolver, _ngZone, _applicationRef, _posService, _document) {
    this._viewContainerRef = _viewContainerRef;
    this._renderer = _renderer;
    this._elementRef = _elementRef;
    this._injector = _injector;
    this._componentFactoryResolver = _componentFactoryResolver;
    this._ngZone = _ngZone;
    this._applicationRef = _applicationRef;
    this._posService = _posService;
    this._document = _document;
    this.onBeforeShow = new EventEmitter();
    this.onShown = new EventEmitter();
    this.onBeforeHide = new EventEmitter();
    this.onHidden = new EventEmitter();
    this._providers = [];
    this._isHiding = false;
    this.containerDefaultSelector = "body";
    this._listenOpts = {};
    this._globalListener = Function.prototype;
  }
  get isShown() {
    if (this._isHiding) {
      return false;
    }
    return !!this._componentRef;
  }
  attach(compType) {
    this._componentFactory = this._componentFactoryResolver.resolveComponentFactory(compType);
    return this;
  }
  // todo: add behaviour: to target element, `body`, custom element
  to(container) {
    this.container = container || this.container;
    return this;
  }
  position(opts) {
    if (!opts) {
      return this;
    }
    this.attachment = opts.attachment || this.attachment;
    this._elementRef = opts.target || this._elementRef;
    return this;
  }
  provide(provider) {
    this._providers.push(provider);
    return this;
  }
  // todo: appendChild to element or document.querySelector(this.container)
  show(opts = {}) {
    this._subscribePositioning();
    this._innerComponent = void 0;
    if (!this._componentRef) {
      this.onBeforeShow.emit();
      this._contentRef = this._getContentRef(opts.content, opts.context, opts.initialState);
      const injector = Injector.create({
        providers: this._providers,
        parent: this._injector
      });
      if (!this._componentFactory) {
        return;
      }
      this._componentRef = this._componentFactory.create(injector, this._contentRef.nodes);
      this._applicationRef.attachView(this._componentRef.hostView);
      this.instance = this._componentRef.instance;
      Object.assign(this._componentRef.instance, opts);
      if (this.container instanceof ElementRef) {
        this.container.nativeElement.appendChild(this._componentRef.location.nativeElement);
      }
      if (typeof this.container === "string" && typeof this._document !== "undefined") {
        const selectedElement = this._document.querySelector(this.container) || this._document.querySelector(this.containerDefaultSelector);
        if (!selectedElement) {
          return;
        }
        selectedElement.appendChild(this._componentRef.location.nativeElement);
      }
      if (!this.container && this._elementRef && this._elementRef.nativeElement.parentElement) {
        this._elementRef.nativeElement.parentElement.appendChild(this._componentRef.location.nativeElement);
      }
      if (this._contentRef.componentRef) {
        this._innerComponent = this._contentRef.componentRef.instance;
        this._contentRef.componentRef.changeDetectorRef.markForCheck();
        this._contentRef.componentRef.changeDetectorRef.detectChanges();
      }
      this._componentRef.changeDetectorRef.markForCheck();
      this._componentRef.changeDetectorRef.detectChanges();
      this.onShown.emit(opts.id ? {
        id: opts.id
      } : this._componentRef.instance);
    }
    this._registerOutsideClick();
    return this._componentRef;
  }
  hide(id) {
    if (!this._componentRef) {
      return this;
    }
    this._posService.deletePositionElement(this._componentRef.location);
    this.onBeforeHide.emit(this._componentRef.instance);
    const componentEl = this._componentRef.location.nativeElement;
    componentEl.parentNode?.removeChild(componentEl);
    this._contentRef?.componentRef?.destroy();
    if (this._viewContainerRef && this._contentRef?.viewRef) {
      this._viewContainerRef.remove(this._viewContainerRef.indexOf(this._contentRef.viewRef));
    }
    this._contentRef?.viewRef?.destroy();
    this._componentRef?.destroy();
    this._contentRef = void 0;
    this._componentRef = void 0;
    this._removeGlobalListener();
    this.onHidden.emit(id ? {
      id
    } : null);
    return this;
  }
  toggle() {
    if (this.isShown) {
      this.hide();
      return;
    }
    this.show();
  }
  dispose() {
    if (this.isShown) {
      this.hide();
    }
    this._unsubscribePositioning();
    if (this._unregisterListenersFn) {
      this._unregisterListenersFn();
    }
  }
  listen(listenOpts) {
    this.triggers = listenOpts.triggers || this.triggers;
    this._listenOpts.outsideClick = listenOpts.outsideClick;
    this._listenOpts.outsideEsc = listenOpts.outsideEsc;
    listenOpts.target = listenOpts.target || this._elementRef?.nativeElement;
    const hide = this._listenOpts.hide = () => listenOpts.hide ? listenOpts.hide() : void this.hide();
    const show = this._listenOpts.show = (registerHide) => {
      listenOpts.show ? listenOpts.show(registerHide) : this.show(registerHide);
      registerHide();
    };
    const toggle = (registerHide) => {
      this.isShown ? hide() : show(registerHide);
    };
    if (this._renderer) {
      this._unregisterListenersFn = listenToTriggersV2(this._renderer, {
        target: listenOpts.target,
        triggers: listenOpts.triggers,
        show,
        hide,
        toggle
      });
    }
    return this;
  }
  _removeGlobalListener() {
    if (this._globalListener) {
      this._globalListener();
      this._globalListener = Function.prototype;
    }
  }
  attachInline(vRef, template) {
    if (vRef && template) {
      this._inlineViewRef = vRef.createEmbeddedView(template);
    }
    return this;
  }
  _registerOutsideClick() {
    if (!this._componentRef || !this._componentRef.location) {
      return;
    }
    let unsubscribeOutsideClick = Function.prototype;
    let unsubscribeEscClick = Function.prototype;
    if (this._listenOpts.outsideClick) {
      const target = this._componentRef.location.nativeElement;
      setTimeout(() => {
        if (this._renderer && this._elementRef) {
          unsubscribeOutsideClick = registerOutsideClick(this._renderer, {
            targets: [target, this._elementRef.nativeElement],
            outsideClick: this._listenOpts.outsideClick,
            hide: () => this._listenOpts.hide && this._listenOpts.hide()
          });
        }
      });
    }
    if (this._listenOpts.outsideEsc && this._renderer && this._elementRef) {
      const target = this._componentRef.location.nativeElement;
      unsubscribeEscClick = registerEscClick(this._renderer, {
        targets: [target, this._elementRef.nativeElement],
        outsideEsc: this._listenOpts.outsideEsc,
        hide: () => this._listenOpts.hide && this._listenOpts.hide()
      });
    }
    this._globalListener = () => {
      unsubscribeOutsideClick();
      unsubscribeEscClick();
    };
  }
  getInnerComponent() {
    return this._innerComponent;
  }
  _subscribePositioning() {
    if (this._zoneSubscription || !this.attachment) {
      return;
    }
    this.onShown.subscribe(() => {
      this._posService.position({
        element: this._componentRef?.location,
        target: this._elementRef,
        attachment: this.attachment,
        appendToBody: this.container === "body"
      });
    });
    this._zoneSubscription = this._ngZone.onStable.subscribe(() => {
      if (!this._componentRef) {
        return;
      }
      this._posService.calcPosition();
    });
  }
  _unsubscribePositioning() {
    if (!this._zoneSubscription) {
      return;
    }
    this._zoneSubscription.unsubscribe();
    this._zoneSubscription = void 0;
  }
  _getContentRef(content, context, initialState) {
    if (!content) {
      return new ContentRef([]);
    }
    if (content instanceof TemplateRef) {
      if (this._viewContainerRef) {
        const _viewRef = this._viewContainerRef.createEmbeddedView(content, context);
        _viewRef.markForCheck();
        return new ContentRef([_viewRef.rootNodes], _viewRef);
      }
      const viewRef = content.createEmbeddedView({});
      this._applicationRef.attachView(viewRef);
      return new ContentRef([viewRef.rootNodes], viewRef);
    }
    if (typeof content === "function") {
      const contentCmptFactory = this._componentFactoryResolver.resolveComponentFactory(content);
      const modalContentInjector = Injector.create({
        providers: this._providers,
        parent: this._injector
      });
      const componentRef = contentCmptFactory.create(modalContentInjector);
      Object.assign(componentRef.instance, initialState);
      this._applicationRef.attachView(componentRef.hostView);
      return new ContentRef([[componentRef.location.nativeElement]], componentRef.hostView, componentRef);
    }
    const nodes = this._renderer ? [this._renderer.createText(`${content}`)] : [];
    return new ContentRef([nodes]);
  }
};
var ComponentLoaderFactory = class _ComponentLoaderFactory {
  constructor(_componentFactoryResolver, _ngZone, _injector, _posService, _applicationRef, _document) {
    this._componentFactoryResolver = _componentFactoryResolver;
    this._ngZone = _ngZone;
    this._injector = _injector;
    this._posService = _posService;
    this._applicationRef = _applicationRef;
    this._document = _document;
  }
  /**
   *
   * @param _elementRef
   * @param _viewContainerRef
   * @param _renderer
   */
  createLoader(_elementRef, _viewContainerRef, _renderer) {
    return new ComponentLoader(_viewContainerRef, _renderer, _elementRef, this._injector, this._componentFactoryResolver, this._ngZone, this._applicationRef, this._posService, this._document);
  }
  static {
    this.ɵfac = function ComponentLoaderFactory_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || _ComponentLoaderFactory)(ɵɵinject(ComponentFactoryResolver$1), ɵɵinject(NgZone), ɵɵinject(Injector), ɵɵinject(PositioningService), ɵɵinject(ApplicationRef), ɵɵinject(DOCUMENT));
    };
  }
  static {
    this.ɵprov = ɵɵdefineInjectable({
      token: _ComponentLoaderFactory,
      factory: _ComponentLoaderFactory.ɵfac,
      providedIn: "root"
    });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ComponentLoaderFactory, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], () => [{
    type: ComponentFactoryResolver$1
  }, {
    type: NgZone
  }, {
    type: Injector
  }, {
    type: PositioningService
  }, {
    type: ApplicationRef
  }, {
    type: Document,
    decorators: [{
      type: Inject,
      args: [DOCUMENT]
    }]
  }], null);
})();

// node_modules/ngx-bootstrap/dropdown/fesm2022/ngx-bootstrap-dropdown.mjs
var _c0 = ["*"];
var _c1 = (a0) => ({
  dropdown: a0
});
var BsDropdownConfig = class _BsDropdownConfig {
  constructor() {
    this.autoClose = true;
    this.insideClick = false;
    this.isAnimated = false;
    this.stopOnClickPropagation = false;
  }
  static {
    this.ɵfac = function BsDropdownConfig_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || _BsDropdownConfig)();
    };
  }
  static {
    this.ɵprov = ɵɵdefineInjectable({
      token: _BsDropdownConfig,
      factory: _BsDropdownConfig.ɵfac,
      providedIn: "root"
    });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(BsDropdownConfig, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], null, null);
})();
var BsDropdownState = class _BsDropdownState {
  constructor() {
    this.direction = "down";
    this.autoClose = true;
    this.insideClick = false;
    this.isAnimated = false;
    this.stopOnClickPropagation = false;
    this.isOpenChange = new EventEmitter();
    this.isDisabledChange = new EventEmitter();
    this.toggleClick = new EventEmitter();
    this.counts = 0;
    this.dropdownMenu = new Promise((resolve) => {
      this.resolveDropdownMenu = resolve;
    });
  }
  static {
    this.ɵfac = function BsDropdownState_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || _BsDropdownState)();
    };
  }
  static {
    this.ɵprov = ɵɵdefineInjectable({
      token: _BsDropdownState,
      factory: _BsDropdownState.ɵfac,
      providedIn: "platform"
    });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(BsDropdownState, [{
    type: Injectable,
    args: [{
      providedIn: "platform"
    }]
  }], () => [], null);
})();
var DROPDOWN_ANIMATION_TIMING = "220ms cubic-bezier(0, 0, 0.2, 1)";
var dropdownAnimation = [style({
  height: 0,
  overflow: "hidden"
}), animate(DROPDOWN_ANIMATION_TIMING, style({
  height: "*",
  overflow: "hidden"
}))];
var BsDropdownContainerComponent = class _BsDropdownContainerComponent {
  get direction() {
    return this._state.direction;
  }
  constructor(_state, cd, _renderer, _element, _builder) {
    this._state = _state;
    this.cd = cd;
    this._renderer = _renderer;
    this._element = _element;
    this.isOpen = false;
    this._factoryDropDownAnimation = _builder.build(dropdownAnimation);
    this._subscription = _state.isOpenChange.subscribe((value) => {
      this.isOpen = value;
      const dropdown = this._element.nativeElement.querySelector(".dropdown-menu");
      this._renderer.addClass(this._element.nativeElement.querySelector("div"), "open");
      if (dropdown) {
        this._renderer.addClass(dropdown, "show");
        if (dropdown.classList.contains("dropdown-menu-right") || dropdown.classList.contains("dropdown-menu-end")) {
          this._renderer.setStyle(dropdown, "left", "auto");
          this._renderer.setStyle(dropdown, "right", "0");
        }
        if (this.direction === "up") {
          this._renderer.setStyle(dropdown, "top", "auto");
          this._renderer.setStyle(dropdown, "transform", "translateY(-101%)");
        }
      }
      if (dropdown && this._state.isAnimated) {
        this._factoryDropDownAnimation.create(dropdown).play();
      }
      this.cd.markForCheck();
      this.cd.detectChanges();
    });
  }
  /** @internal */
  _contains(el) {
    return this._element.nativeElement.contains(el);
  }
  ngOnDestroy() {
    this._subscription.unsubscribe();
  }
  static {
    this.ɵfac = function BsDropdownContainerComponent_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || _BsDropdownContainerComponent)(ɵɵdirectiveInject(BsDropdownState), ɵɵdirectiveInject(ChangeDetectorRef), ɵɵdirectiveInject(Renderer2), ɵɵdirectiveInject(ElementRef), ɵɵdirectiveInject(AnimationBuilder));
    };
  }
  static {
    this.ɵcmp = ɵɵdefineComponent({
      type: _BsDropdownContainerComponent,
      selectors: [["bs-dropdown-container"]],
      hostAttrs: [2, "display", "block", "position", "absolute", "z-index", "1040"],
      ngContentSelectors: _c0,
      decls: 2,
      vars: 9,
      consts: [[3, "ngClass"]],
      template: function BsDropdownContainerComponent_Template(rf, ctx) {
        if (rf & 1) {
          ɵɵprojectionDef();
          ɵɵelementStart(0, "div", 0);
          ɵɵprojection(1);
          ɵɵelementEnd();
        }
        if (rf & 2) {
          ɵɵclassProp("dropup", ctx.direction === "up")("show", ctx.isOpen)("open", ctx.isOpen);
          ɵɵproperty("ngClass", ɵɵpureFunction1(7, _c1, ctx.direction === "down"));
        }
      },
      dependencies: [NgClass],
      encapsulation: 2,
      changeDetection: 0
    });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(BsDropdownContainerComponent, [{
    type: Component,
    args: [{
      selector: "bs-dropdown-container",
      changeDetection: ChangeDetectionStrategy.OnPush,
      standalone: true,
      imports: [NgClass],
      host: {
        style: "display:block;position: absolute;z-index: 1040"
      },
      template: `
    <div [class.dropup]="direction === 'up'"
         [ngClass]="{dropdown: direction === 'down'}"
         [class.show]="isOpen"
         [class.open]="isOpen"><ng-content></ng-content>
    </div>
  `
    }]
  }], () => [{
    type: BsDropdownState
  }, {
    type: ChangeDetectorRef
  }, {
    type: Renderer2
  }, {
    type: ElementRef
  }, {
    type: AnimationBuilder
  }], null);
})();
var BsDropdownDirective = class _BsDropdownDirective {
  /**
   * Indicates that dropdown will be closed on item or document click,
   * and after pressing ESC
   */
  set autoClose(value) {
    this._state.autoClose = value;
  }
  get autoClose() {
    return this._state.autoClose;
  }
  /**
   * Indicates that dropdown will be animated
   */
  set isAnimated(value) {
    this._state.isAnimated = value;
  }
  get isAnimated() {
    return this._state.isAnimated;
  }
  /**
   * This attribute indicates that the dropdown shouldn't close on inside click when autoClose is set to true
   */
  set insideClick(value) {
    this._state.insideClick = value;
  }
  get insideClick() {
    return this._state.insideClick;
  }
  /**
   * Disables dropdown toggle and hides dropdown menu if opened
   */
  set isDisabled(value) {
    this._isDisabled = value;
    this._state.isDisabledChange.emit(value);
    if (value) {
      this.hide();
    }
  }
  get isDisabled() {
    return this._isDisabled;
  }
  /**
   * Returns whether or not the popover is currently being shown
   */
  get isOpen() {
    if (this._showInline) {
      return this._isInlineOpen;
    }
    return this._dropdown.isShown;
  }
  set isOpen(value) {
    if (value) {
      this.show();
    } else {
      this.hide();
    }
  }
  get _showInline() {
    return !this.container;
  }
  constructor(_elementRef, _renderer, _viewContainerRef, _cis, _state, _config, _builder) {
    this._elementRef = _elementRef;
    this._renderer = _renderer;
    this._viewContainerRef = _viewContainerRef;
    this._cis = _cis;
    this._state = _state;
    this._config = _config;
    this.dropup = false;
    this._isInlineOpen = false;
    this._isDisabled = false;
    this._subscriptions = [];
    this._isInited = false;
    this._state.autoClose = this._config.autoClose;
    this._state.insideClick = this._config.insideClick;
    this._state.isAnimated = this._config.isAnimated;
    this._state.stopOnClickPropagation = this._config.stopOnClickPropagation;
    this._factoryDropDownAnimation = _builder.build(dropdownAnimation);
    this._dropdown = this._cis.createLoader(this._elementRef, this._viewContainerRef, this._renderer).provide({
      provide: BsDropdownState,
      useValue: this._state
    });
    this.onShown = this._dropdown.onShown;
    this.onHidden = this._dropdown.onHidden;
    this.isOpenChange = this._state.isOpenChange;
  }
  ngOnInit() {
    if (this._isInited) {
      return;
    }
    this._isInited = true;
    this._dropdown.listen({
      // because of dropdown inline mode
      outsideClick: false,
      triggers: this.triggers,
      show: () => this.show()
    });
    this._subscriptions.push(this._state.toggleClick.subscribe((value) => this.toggle(value)));
    this._subscriptions.push(this._state.isDisabledChange.pipe(filter((value) => value)).subscribe(() => this.hide()));
  }
  /**
   * Opens an element’s popover. This is considered a “manual” triggering of
   * the popover.
   */
  show() {
    if (this.isOpen || this.isDisabled) {
      return;
    }
    if (this._showInline) {
      if (!this._inlinedMenu) {
        this._state.dropdownMenu.then((dropdownMenu) => {
          this._dropdown.attachInline(dropdownMenu.viewContainer, dropdownMenu.templateRef);
          this._inlinedMenu = this._dropdown._inlineViewRef;
          this.addBs4Polyfills();
          if (this._inlinedMenu) {
            this._renderer.addClass(this._inlinedMenu.rootNodes[0].parentNode, "open");
          }
          this.playAnimation();
        }).catch();
      }
      this.addBs4Polyfills();
      this._isInlineOpen = true;
      this.onShown.emit(true);
      this._state.isOpenChange.emit(true);
      this.playAnimation();
      return;
    }
    this._state.dropdownMenu.then((dropdownMenu) => {
      const _dropup = this.dropup || typeof this.dropup !== "undefined" && this.dropup;
      this._state.direction = _dropup ? "up" : "down";
      const _placement = this.placement || (_dropup ? "top start" : "bottom start");
      this._dropdown.attach(BsDropdownContainerComponent).to(this.container).position({
        attachment: _placement
      }).show({
        content: dropdownMenu.templateRef,
        placement: _placement
      });
      this._state.isOpenChange.emit(true);
    }).catch();
  }
  /**
   * Closes an element’s popover. This is considered a “manual” triggering of
   * the popover.
   */
  hide() {
    if (!this.isOpen) {
      return;
    }
    if (this._showInline) {
      this.removeShowClass();
      this.removeDropupStyles();
      this._isInlineOpen = false;
      this.onHidden.emit(true);
    } else {
      this._dropdown.hide();
    }
    this._state.isOpenChange.emit(false);
  }
  /**
   * Toggles an element’s popover. This is considered a “manual” triggering of
   * the popover. With parameter <code>true</code> allows toggling, with parameter <code>false</code>
   * only hides opened dropdown. Parameter usage will be removed in ngx-bootstrap v3
   */
  toggle(value) {
    if (this.isOpen || !value) {
      return this.hide();
    }
    return this.show();
  }
  /** @internal */
  _contains(event) {
    return this._elementRef.nativeElement.contains(event.target) || this._dropdown.instance && this._dropdown.instance._contains(event.target);
  }
  navigationClick(event) {
    const ref = this._elementRef.nativeElement.querySelector(".dropdown-menu");
    if (!ref) {
      return;
    }
    const firstActive = this._elementRef.nativeElement.ownerDocument.activeElement;
    const allRef = ref.querySelectorAll(".dropdown-item");
    switch (event.keyCode) {
      case 38:
        if (this._state.counts > 0) {
          allRef[--this._state.counts].focus();
        }
        break;
      case 40:
        if (this._state.counts + 1 < allRef.length) {
          if (firstActive.classList !== allRef[this._state.counts].classList) {
            allRef[this._state.counts].focus();
          } else {
            allRef[++this._state.counts].focus();
          }
        }
        break;
      default:
    }
    event.preventDefault();
  }
  ngOnDestroy() {
    for (const sub of this._subscriptions) {
      sub.unsubscribe();
    }
    this._dropdown.dispose();
  }
  addBs4Polyfills() {
    this.addShowClass();
    this.checkRightAlignment();
    this.addDropupStyles();
  }
  playAnimation() {
    if (this._state.isAnimated && this._inlinedMenu) {
      setTimeout(() => {
        if (this._inlinedMenu) {
          this._factoryDropDownAnimation.create(this._inlinedMenu.rootNodes[0]).play();
        }
      });
    }
  }
  addShowClass() {
    if (this._inlinedMenu && this._inlinedMenu.rootNodes[0]) {
      this._renderer.addClass(this._inlinedMenu.rootNodes[0], "show");
    }
  }
  removeShowClass() {
    if (this._inlinedMenu && this._inlinedMenu.rootNodes[0]) {
      this._renderer.removeClass(this._inlinedMenu.rootNodes[0], "show");
    }
  }
  checkRightAlignment() {
    if (this._inlinedMenu && this._inlinedMenu.rootNodes[0]) {
      const isRightAligned = this._inlinedMenu.rootNodes[0].classList.contains("dropdown-menu-right") || this._inlinedMenu.rootNodes[0].classList.contains("dropdown-menu-end");
      this._renderer.setStyle(this._inlinedMenu.rootNodes[0], "left", isRightAligned ? "auto" : "0");
      this._renderer.setStyle(this._inlinedMenu.rootNodes[0], "right", isRightAligned ? "0" : "auto");
    }
  }
  addDropupStyles() {
    if (this._inlinedMenu && this._inlinedMenu.rootNodes[0]) {
      this._renderer.setStyle(this._inlinedMenu.rootNodes[0], "top", this.dropup ? "auto" : "100%");
      this._renderer.setStyle(this._inlinedMenu.rootNodes[0], "transform", this.dropup ? "translateY(-101%)" : "translateY(0)");
      this._renderer.setStyle(this._inlinedMenu.rootNodes[0], "bottom", "auto");
    }
  }
  removeDropupStyles() {
    if (this._inlinedMenu && this._inlinedMenu.rootNodes[0]) {
      this._renderer.removeStyle(this._inlinedMenu.rootNodes[0], "top");
      this._renderer.removeStyle(this._inlinedMenu.rootNodes[0], "transform");
      this._renderer.removeStyle(this._inlinedMenu.rootNodes[0], "bottom");
    }
  }
  static {
    this.ɵfac = function BsDropdownDirective_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || _BsDropdownDirective)(ɵɵdirectiveInject(ElementRef), ɵɵdirectiveInject(Renderer2), ɵɵdirectiveInject(ViewContainerRef), ɵɵdirectiveInject(ComponentLoaderFactory), ɵɵdirectiveInject(BsDropdownState), ɵɵdirectiveInject(BsDropdownConfig), ɵɵdirectiveInject(AnimationBuilder));
    };
  }
  static {
    this.ɵdir = ɵɵdefineDirective({
      type: _BsDropdownDirective,
      selectors: [["", "bsDropdown", ""], ["", "dropdown", ""]],
      hostVars: 6,
      hostBindings: function BsDropdownDirective_HostBindings(rf, ctx) {
        if (rf & 1) {
          ɵɵlistener("keydown.arrowDown", function BsDropdownDirective_keydown_arrowDown_HostBindingHandler($event) {
            return ctx.navigationClick($event);
          })("keydown.arrowUp", function BsDropdownDirective_keydown_arrowUp_HostBindingHandler($event) {
            return ctx.navigationClick($event);
          });
        }
        if (rf & 2) {
          ɵɵclassProp("dropup", ctx.dropup)("open", ctx.isOpen)("show", ctx.isOpen);
        }
      },
      inputs: {
        placement: "placement",
        triggers: "triggers",
        container: "container",
        dropup: "dropup",
        autoClose: "autoClose",
        isAnimated: "isAnimated",
        insideClick: "insideClick",
        isDisabled: "isDisabled",
        isOpen: "isOpen"
      },
      outputs: {
        isOpenChange: "isOpenChange",
        onShown: "onShown",
        onHidden: "onHidden"
      },
      exportAs: ["bs-dropdown"],
      features: [ɵɵProvidersFeature([BsDropdownState, ComponentLoaderFactory, BsDropdownConfig])]
    });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(BsDropdownDirective, [{
    type: Directive,
    args: [{
      selector: "[bsDropdown], [dropdown]",
      exportAs: "bs-dropdown",
      providers: [BsDropdownState, ComponentLoaderFactory, BsDropdownConfig],
      standalone: true,
      host: {
        "[class.dropup]": "dropup",
        "[class.open]": "isOpen",
        "[class.show]": "isOpen"
      }
    }]
  }], () => [{
    type: ElementRef
  }, {
    type: Renderer2
  }, {
    type: ViewContainerRef
  }, {
    type: ComponentLoaderFactory
  }, {
    type: BsDropdownState
  }, {
    type: BsDropdownConfig
  }, {
    type: AnimationBuilder
  }], {
    placement: [{
      type: Input
    }],
    triggers: [{
      type: Input
    }],
    container: [{
      type: Input
    }],
    dropup: [{
      type: Input
    }],
    autoClose: [{
      type: Input
    }],
    isAnimated: [{
      type: Input
    }],
    insideClick: [{
      type: Input
    }],
    isDisabled: [{
      type: Input
    }],
    isOpen: [{
      type: Input
    }],
    isOpenChange: [{
      type: Output
    }],
    onShown: [{
      type: Output
    }],
    onHidden: [{
      type: Output
    }],
    navigationClick: [{
      type: HostListener,
      args: ["keydown.arrowDown", ["$event"]]
    }, {
      type: HostListener,
      args: ["keydown.arrowUp", ["$event"]]
    }]
  });
})();
var BsDropdownMenuDirective = class _BsDropdownMenuDirective {
  constructor(_state, _viewContainer, _templateRef) {
    _state.resolveDropdownMenu({
      templateRef: _templateRef,
      viewContainer: _viewContainer
    });
  }
  static {
    this.ɵfac = function BsDropdownMenuDirective_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || _BsDropdownMenuDirective)(ɵɵdirectiveInject(BsDropdownState), ɵɵdirectiveInject(ViewContainerRef), ɵɵdirectiveInject(TemplateRef));
    };
  }
  static {
    this.ɵdir = ɵɵdefineDirective({
      type: _BsDropdownMenuDirective,
      selectors: [["", "bsDropdownMenu", ""], ["", "dropdownMenu", ""]],
      exportAs: ["bs-dropdown-menu"]
    });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(BsDropdownMenuDirective, [{
    type: Directive,
    args: [{
      selector: "[bsDropdownMenu],[dropdownMenu]",
      exportAs: "bs-dropdown-menu",
      standalone: true
    }]
  }], () => [{
    type: BsDropdownState
  }, {
    type: ViewContainerRef
  }, {
    type: TemplateRef
  }], null);
})();
var BsDropdownToggleDirective = class _BsDropdownToggleDirective {
  constructor(_changeDetectorRef, _dropdown, _element, _renderer, _state) {
    this._changeDetectorRef = _changeDetectorRef;
    this._dropdown = _dropdown;
    this._element = _element;
    this._renderer = _renderer;
    this._state = _state;
    this.isOpen = false;
    this._subscriptions = [];
    this._subscriptions.push(this._state.isOpenChange.subscribe((value) => {
      this.isOpen = value;
      if (value) {
        this._documentClickListener = this._renderer.listen("document", "click", (event) => {
          if (this._state.autoClose && event.button !== 2 && !this._element.nativeElement.contains(event.target) && !(this._state.insideClick && this._dropdown._contains(event))) {
            this._state.toggleClick.emit(false);
            this._changeDetectorRef.detectChanges();
          }
        });
        this._escKeyUpListener = this._renderer.listen(this._element.nativeElement, "keyup.esc", () => {
          if (this._state.autoClose) {
            this._state.toggleClick.emit(false);
            this._changeDetectorRef.detectChanges();
          }
        });
      } else {
        this._documentClickListener && this._documentClickListener();
        this._escKeyUpListener && this._escKeyUpListener();
      }
    }));
    this._subscriptions.push(this._state.isDisabledChange.subscribe((value) => this.isDisabled = value || void 0));
  }
  onClick(event) {
    if (this._state.stopOnClickPropagation) {
      event.stopPropagation();
    }
    if (this.isDisabled) {
      return;
    }
    this._state.toggleClick.emit(true);
  }
  ngOnDestroy() {
    if (this._documentClickListener) {
      this._documentClickListener();
    }
    if (this._escKeyUpListener) {
      this._escKeyUpListener();
    }
    for (const sub of this._subscriptions) {
      sub.unsubscribe();
    }
  }
  static {
    this.ɵfac = function BsDropdownToggleDirective_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || _BsDropdownToggleDirective)(ɵɵdirectiveInject(ChangeDetectorRef), ɵɵdirectiveInject(BsDropdownDirective), ɵɵdirectiveInject(ElementRef), ɵɵdirectiveInject(Renderer2), ɵɵdirectiveInject(BsDropdownState));
    };
  }
  static {
    this.ɵdir = ɵɵdefineDirective({
      type: _BsDropdownToggleDirective,
      selectors: [["", "bsDropdownToggle", ""], ["", "dropdownToggle", ""]],
      hostVars: 3,
      hostBindings: function BsDropdownToggleDirective_HostBindings(rf, ctx) {
        if (rf & 1) {
          ɵɵlistener("click", function BsDropdownToggleDirective_click_HostBindingHandler($event) {
            return ctx.onClick($event);
          });
        }
        if (rf & 2) {
          ɵɵattribute("aria-haspopup", true)("disabled", ctx.isDisabled)("aria-expanded", ctx.isOpen);
        }
      },
      exportAs: ["bs-dropdown-toggle"]
    });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(BsDropdownToggleDirective, [{
    type: Directive,
    args: [{
      selector: "[bsDropdownToggle],[dropdownToggle]",
      exportAs: "bs-dropdown-toggle",
      host: {
        "[attr.aria-haspopup]": "true"
      },
      standalone: true
    }]
  }], () => [{
    type: ChangeDetectorRef
  }, {
    type: BsDropdownDirective
  }, {
    type: ElementRef
  }, {
    type: Renderer2
  }, {
    type: BsDropdownState
  }], {
    isDisabled: [{
      type: HostBinding,
      args: ["attr.disabled"]
    }],
    isOpen: [{
      type: HostBinding,
      args: ["attr.aria-expanded"]
    }],
    onClick: [{
      type: HostListener,
      args: ["click", ["$event"]]
    }]
  });
})();
var BsDropdownModule = class _BsDropdownModule {
  // @deprecated method not required anymore, will be deleted in v19.0.0
  static forRoot() {
    return {
      ngModule: _BsDropdownModule,
      providers: []
    };
  }
  static {
    this.ɵfac = function BsDropdownModule_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || _BsDropdownModule)();
    };
  }
  static {
    this.ɵmod = ɵɵdefineNgModule({
      type: _BsDropdownModule,
      imports: [BsDropdownDirective, BsDropdownContainerComponent, BsDropdownMenuDirective, BsDropdownToggleDirective],
      exports: [BsDropdownMenuDirective, BsDropdownToggleDirective, BsDropdownDirective]
    });
  }
  static {
    this.ɵinj = ɵɵdefineInjector({});
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(BsDropdownModule, [{
    type: NgModule,
    args: [{
      imports: [BsDropdownDirective, BsDropdownContainerComponent, BsDropdownMenuDirective, BsDropdownToggleDirective],
      exports: [BsDropdownMenuDirective, BsDropdownToggleDirective, BsDropdownDirective]
    }]
  }], null, null);
})();

// node_modules/ngx-intl-tel-input/fesm2022/ngx-intl-tel-input.mjs
var _c02 = ["countryList"];
var _c12 = (a0) => ({
  disabled: a0
});
function NgxIntlTelInputComponent_div_4_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "div", 10);
    ɵɵtext(1);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext();
    ɵɵadvance();
    ɵɵtextInterpolate1("+", ctx_r1.selectedCountry.dialCode, "");
  }
}
function NgxIntlTelInputComponent_div_6_div_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r3 = ɵɵgetCurrentView();
    ɵɵelementStart(0, "div", 17)(1, "input", 18);
    ɵɵtwoWayListener("ngModelChange", function NgxIntlTelInputComponent_div_6_div_1_Template_input_ngModelChange_1_listener($event) {
      ɵɵrestoreView(_r3);
      const ctx_r1 = ɵɵnextContext(2);
      ɵɵtwoWayBindingSet(ctx_r1.countrySearchText, $event) || (ctx_r1.countrySearchText = $event);
      return ɵɵresetView($event);
    });
    ɵɵlistener("keyup", function NgxIntlTelInputComponent_div_6_div_1_Template_input_keyup_1_listener() {
      ɵɵrestoreView(_r3);
      const ctx_r1 = ɵɵnextContext(2);
      return ɵɵresetView(ctx_r1.searchCountry());
    })("click", function NgxIntlTelInputComponent_div_6_div_1_Template_input_click_1_listener($event) {
      ɵɵrestoreView(_r3);
      return ɵɵresetView($event.stopPropagation());
    });
    ɵɵelementEnd()();
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext(2);
    ɵɵadvance();
    ɵɵtwoWayProperty("ngModel", ctx_r1.countrySearchText);
    ɵɵproperty("placeholder", ctx_r1.searchCountryPlaceholder);
  }
}
function NgxIntlTelInputComponent_div_6_li_4_Template(rf, ctx) {
  if (rf & 1) {
    const _r4 = ɵɵgetCurrentView();
    ɵɵelementStart(0, "li", 19);
    ɵɵlistener("click", function NgxIntlTelInputComponent_div_6_li_4_Template_li_click_0_listener() {
      const country_r5 = ɵɵrestoreView(_r4).$implicit;
      const ctx_r1 = ɵɵnextContext(2);
      const focusable_r6 = ɵɵreference(8);
      return ɵɵresetView(ctx_r1.onCountrySelect(country_r5, focusable_r6));
    });
    ɵɵelementStart(1, "div", 20);
    ɵɵelement(2, "div", 5);
    ɵɵelementEnd();
    ɵɵelementStart(3, "span", 21);
    ɵɵtext(4);
    ɵɵelementEnd();
    ɵɵelementStart(5, "span", 22);
    ɵɵtext(6);
    ɵɵelementEnd()();
  }
  if (rf & 2) {
    const country_r5 = ctx.$implicit;
    ɵɵproperty("id", country_r5.htmlId + "-preferred");
    ɵɵadvance(2);
    ɵɵproperty("ngClass", country_r5.flagClass);
    ɵɵadvance(2);
    ɵɵtextInterpolate(country_r5.name);
    ɵɵadvance(2);
    ɵɵtextInterpolate1("+", country_r5.dialCode, "");
  }
}
function NgxIntlTelInputComponent_div_6_li_5_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "li", 23);
  }
}
function NgxIntlTelInputComponent_div_6_li_6_Template(rf, ctx) {
  if (rf & 1) {
    const _r7 = ɵɵgetCurrentView();
    ɵɵelementStart(0, "li", 24);
    ɵɵlistener("click", function NgxIntlTelInputComponent_div_6_li_6_Template_li_click_0_listener() {
      const country_r8 = ɵɵrestoreView(_r7).$implicit;
      const ctx_r1 = ɵɵnextContext(2);
      const focusable_r6 = ɵɵreference(8);
      return ɵɵresetView(ctx_r1.onCountrySelect(country_r8, focusable_r6));
    });
    ɵɵelementStart(1, "div", 20);
    ɵɵelement(2, "div", 5);
    ɵɵelementEnd();
    ɵɵelementStart(3, "span", 21);
    ɵɵtext(4);
    ɵɵelementEnd();
    ɵɵelementStart(5, "span", 22);
    ɵɵtext(6);
    ɵɵelementEnd()();
  }
  if (rf & 2) {
    const country_r8 = ctx.$implicit;
    ɵɵproperty("id", country_r8.htmlId);
    ɵɵadvance(2);
    ɵɵproperty("ngClass", country_r8.flagClass);
    ɵɵadvance(2);
    ɵɵtextInterpolate(country_r8.name);
    ɵɵadvance(2);
    ɵɵtextInterpolate1("+", country_r8.dialCode, "");
  }
}
function NgxIntlTelInputComponent_div_6_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "div", 11);
    ɵɵtemplate(1, NgxIntlTelInputComponent_div_6_div_1_Template, 2, 2, "div", 12);
    ɵɵelementStart(2, "ul", 13, 1);
    ɵɵtemplate(4, NgxIntlTelInputComponent_div_6_li_4_Template, 7, 4, "li", 14)(5, NgxIntlTelInputComponent_div_6_li_5_Template, 1, 0, "li", 15)(6, NgxIntlTelInputComponent_div_6_li_6_Template, 7, 4, "li", 16);
    ɵɵelementEnd()();
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext();
    ɵɵadvance();
    ɵɵproperty("ngIf", ctx_r1.searchCountryFlag && ctx_r1.searchCountryField);
    ɵɵadvance(3);
    ɵɵproperty("ngForOf", ctx_r1.preferredCountriesInDropDown);
    ɵɵadvance();
    ɵɵproperty("ngIf", ctx_r1.preferredCountriesInDropDown == null ? null : ctx_r1.preferredCountriesInDropDown.length);
    ɵɵadvance();
    ɵɵproperty("ngForOf", ctx_r1.allCountries);
  }
}
var CountryISO;
(function(CountryISO2) {
  CountryISO2["Afghanistan"] = "af";
  CountryISO2["Albania"] = "al";
  CountryISO2["Algeria"] = "dz";
  CountryISO2["AmericanSamoa"] = "as";
  CountryISO2["Andorra"] = "ad";
  CountryISO2["Angola"] = "ao";
  CountryISO2["Anguilla"] = "ai";
  CountryISO2["AntiguaAndBarbuda"] = "ag";
  CountryISO2["Argentina"] = "ar";
  CountryISO2["Armenia"] = "am";
  CountryISO2["Aruba"] = "aw";
  CountryISO2["Australia"] = "au";
  CountryISO2["Austria"] = "at";
  CountryISO2["Azerbaijan"] = "az";
  CountryISO2["Bahamas"] = "bs";
  CountryISO2["Bahrain"] = "bh";
  CountryISO2["Bangladesh"] = "bd";
  CountryISO2["Barbados"] = "bb";
  CountryISO2["Belarus"] = "by";
  CountryISO2["Belgium"] = "be";
  CountryISO2["Belize"] = "bz";
  CountryISO2["Benin"] = "bj";
  CountryISO2["Bermuda"] = "bm";
  CountryISO2["Bhutan"] = "bt";
  CountryISO2["Bolivia"] = "bo";
  CountryISO2["BosniaAndHerzegovina"] = "ba";
  CountryISO2["Botswana"] = "bw";
  CountryISO2["Brazil"] = "br";
  CountryISO2["BritishIndianOceanTerritory"] = "io";
  CountryISO2["BritishVirginIslands"] = "vg";
  CountryISO2["Brunei"] = "bn";
  CountryISO2["Bulgaria"] = "bg";
  CountryISO2["BurkinaFaso"] = "bf";
  CountryISO2["Burundi"] = "bi";
  CountryISO2["Cambodia"] = "kh";
  CountryISO2["Cameroon"] = "cm";
  CountryISO2["Canada"] = "ca";
  CountryISO2["CapeVerde"] = "cv";
  CountryISO2["CaribbeanNetherlands"] = "bq";
  CountryISO2["CaymanIslands"] = "ky";
  CountryISO2["CentralAfricanRepublic"] = "cf";
  CountryISO2["Chad"] = "td";
  CountryISO2["Chile"] = "cl";
  CountryISO2["China"] = "cn";
  CountryISO2["ChristmasIsland"] = "cx";
  CountryISO2["Cocos"] = "cc";
  CountryISO2["Colombia"] = "co";
  CountryISO2["Comoros"] = "km";
  CountryISO2["CongoDRCJamhuriYaKidemokrasiaYaKongo"] = "cd";
  CountryISO2["CongoRepublicCongoBrazzaville"] = "cg";
  CountryISO2["CookIslands"] = "ck";
  CountryISO2["CostaRica"] = "cr";
  CountryISO2["CôteDIvoire"] = "ci";
  CountryISO2["Croatia"] = "hr";
  CountryISO2["Cuba"] = "cu";
  CountryISO2["Curaçao"] = "cw";
  CountryISO2["Cyprus"] = "cy";
  CountryISO2["CzechRepublic"] = "cz";
  CountryISO2["Denmark"] = "dk";
  CountryISO2["Djibouti"] = "dj";
  CountryISO2["Dominica"] = "dm";
  CountryISO2["DominicanRepublic"] = "do";
  CountryISO2["Ecuador"] = "ec";
  CountryISO2["Egypt"] = "eg";
  CountryISO2["ElSalvador"] = "sv";
  CountryISO2["EquatorialGuinea"] = "gq";
  CountryISO2["Eritrea"] = "er";
  CountryISO2["Estonia"] = "ee";
  CountryISO2["Ethiopia"] = "et";
  CountryISO2["FalklandIslands"] = "fk";
  CountryISO2["FaroeIslands"] = "fo";
  CountryISO2["Fiji"] = "fj";
  CountryISO2["Finland"] = "fi";
  CountryISO2["France"] = "fr";
  CountryISO2["FrenchGuiana"] = "gf";
  CountryISO2["FrenchPolynesia"] = "pf";
  CountryISO2["Gabon"] = "ga";
  CountryISO2["Gambia"] = "gm";
  CountryISO2["Georgia"] = "ge";
  CountryISO2["Germany"] = "de";
  CountryISO2["Ghana"] = "gh";
  CountryISO2["Gibraltar"] = "gi";
  CountryISO2["Greece"] = "gr";
  CountryISO2["Greenland"] = "gl";
  CountryISO2["Grenada"] = "gd";
  CountryISO2["Guadeloupe"] = "gp";
  CountryISO2["Guam"] = "gu";
  CountryISO2["Guatemala"] = "gt";
  CountryISO2["Guernsey"] = "gg";
  CountryISO2["Guinea"] = "gn";
  CountryISO2["GuineaBissau"] = "gw";
  CountryISO2["Guyana"] = "gy";
  CountryISO2["Haiti"] = "ht";
  CountryISO2["Honduras"] = "hn";
  CountryISO2["HongKong"] = "hk";
  CountryISO2["Hungary"] = "hu";
  CountryISO2["Iceland"] = "is";
  CountryISO2["India"] = "in";
  CountryISO2["Indonesia"] = "id";
  CountryISO2["Iran"] = "ir";
  CountryISO2["Iraq"] = "iq";
  CountryISO2["Ireland"] = "ie";
  CountryISO2["IsleOfMan"] = "im";
  CountryISO2["Israel"] = "il";
  CountryISO2["Italy"] = "it";
  CountryISO2["Jamaica"] = "jm";
  CountryISO2["Japan"] = "jp";
  CountryISO2["Jersey"] = "je";
  CountryISO2["Jordan"] = "jo";
  CountryISO2["Kazakhstan"] = "kz";
  CountryISO2["Kenya"] = "ke";
  CountryISO2["Kiribati"] = "ki";
  CountryISO2["Kosovo"] = "xk";
  CountryISO2["Kuwait"] = "kw";
  CountryISO2["Kyrgyzstan"] = "kg";
  CountryISO2["Laos"] = "la";
  CountryISO2["Latvia"] = "lv";
  CountryISO2["Lebanon"] = "lb";
  CountryISO2["Lesotho"] = "ls";
  CountryISO2["Liberia"] = "lr";
  CountryISO2["Libya"] = "ly";
  CountryISO2["Liechtenstein"] = "li";
  CountryISO2["Lithuania"] = "lt";
  CountryISO2["Luxembourg"] = "lu";
  CountryISO2["Macau"] = "mo";
  CountryISO2["Macedonia"] = "mk";
  CountryISO2["Madagascar"] = "mg";
  CountryISO2["Malawi"] = "mw";
  CountryISO2["Malaysia"] = "my";
  CountryISO2["Maldives"] = "mv";
  CountryISO2["Mali"] = "ml";
  CountryISO2["Malta"] = "mt";
  CountryISO2["MarshallIslands"] = "mh";
  CountryISO2["Martinique"] = "mq";
  CountryISO2["Mauritania"] = "mr";
  CountryISO2["Mauritius"] = "mu";
  CountryISO2["Mayotte"] = "yt";
  CountryISO2["Mexico"] = "mx";
  CountryISO2["Micronesia"] = "fm";
  CountryISO2["Moldova"] = "md";
  CountryISO2["Monaco"] = "mc";
  CountryISO2["Mongolia"] = "mn";
  CountryISO2["Montenegro"] = "me";
  CountryISO2["Montserrat"] = "ms";
  CountryISO2["Morocco"] = "ma";
  CountryISO2["Mozambique"] = "mz";
  CountryISO2["Myanmar"] = "mm";
  CountryISO2["Namibia"] = "na";
  CountryISO2["Nauru"] = "nr";
  CountryISO2["Nepal"] = "np";
  CountryISO2["Netherlands"] = "nl";
  CountryISO2["NewCaledonia"] = "nc";
  CountryISO2["NewZealand"] = "nz";
  CountryISO2["Nicaragua"] = "ni";
  CountryISO2["Niger"] = "ne";
  CountryISO2["Nigeria"] = "ng";
  CountryISO2["Niue"] = "nu";
  CountryISO2["NorfolkIsland"] = "nf";
  CountryISO2["NorthKorea"] = "kp";
  CountryISO2["NorthernMarianaIslands"] = "mp";
  CountryISO2["Norway"] = "no";
  CountryISO2["Oman"] = "om";
  CountryISO2["Pakistan"] = "pk";
  CountryISO2["Palau"] = "pw";
  CountryISO2["Palestine"] = "ps";
  CountryISO2["Panama"] = "pa";
  CountryISO2["PapuaNewGuinea"] = "pg";
  CountryISO2["Paraguay"] = "py";
  CountryISO2["Peru"] = "pe";
  CountryISO2["Philippines"] = "ph";
  CountryISO2["Poland"] = "pl";
  CountryISO2["Portugal"] = "pt";
  CountryISO2["PuertoRico"] = "pr";
  CountryISO2["Qatar"] = "qa";
  CountryISO2["Réunion"] = "re";
  CountryISO2["Romania"] = "ro";
  CountryISO2["Russia"] = "ru";
  CountryISO2["Rwanda"] = "rw";
  CountryISO2["SaintBarthélemy"] = "bl";
  CountryISO2["SaintHelena"] = "sh";
  CountryISO2["SaintKittsAndNevis"] = "kn";
  CountryISO2["SaintLucia"] = "lc";
  CountryISO2["SaintMartin"] = "mf";
  CountryISO2["SaintPierreAndMiquelon"] = "pm";
  CountryISO2["SaintVincentAndTheGrenadines"] = "vc";
  CountryISO2["Samoa"] = "ws";
  CountryISO2["SanMarino"] = "sm";
  CountryISO2["SãoToméAndPríncipe"] = "st";
  CountryISO2["SaudiArabia"] = "sa";
  CountryISO2["Senegal"] = "sn";
  CountryISO2["Serbia"] = "rs";
  CountryISO2["Seychelles"] = "sc";
  CountryISO2["SierraLeone"] = "sl";
  CountryISO2["Singapore"] = "sg";
  CountryISO2["SintMaarten"] = "sx";
  CountryISO2["Slovakia"] = "sk";
  CountryISO2["Slovenia"] = "si";
  CountryISO2["SolomonIslands"] = "sb";
  CountryISO2["Somalia"] = "so";
  CountryISO2["SouthAfrica"] = "za";
  CountryISO2["SouthKorea"] = "kr";
  CountryISO2["SouthSudan"] = "ss";
  CountryISO2["Spain"] = "es";
  CountryISO2["SriLanka"] = "lk";
  CountryISO2["Sudan"] = "sd";
  CountryISO2["Suriname"] = "sr";
  CountryISO2["SvalbardAndJanMayen"] = "sj";
  CountryISO2["Swaziland"] = "sz";
  CountryISO2["Sweden"] = "se";
  CountryISO2["Switzerland"] = "ch";
  CountryISO2["Syria"] = "sy";
  CountryISO2["Taiwan"] = "tw";
  CountryISO2["Tajikistan"] = "tj";
  CountryISO2["Tanzania"] = "tz";
  CountryISO2["Thailand"] = "th";
  CountryISO2["TimorLeste"] = "tl";
  CountryISO2["Togo"] = "tg";
  CountryISO2["Tokelau"] = "tk";
  CountryISO2["Tonga"] = "to";
  CountryISO2["TrinidadAndTobago"] = "tt";
  CountryISO2["Tunisia"] = "tn";
  CountryISO2["Turkey"] = "tr";
  CountryISO2["Turkmenistan"] = "tm";
  CountryISO2["TurksAndCaicosIslands"] = "tc";
  CountryISO2["Tuvalu"] = "tv";
  CountryISO2["USVirginIslands"] = "vi";
  CountryISO2["Uganda"] = "ug";
  CountryISO2["Ukraine"] = "ua";
  CountryISO2["UnitedArabEmirates"] = "ae";
  CountryISO2["UnitedKingdom"] = "gb";
  CountryISO2["UnitedStates"] = "us";
  CountryISO2["Uruguay"] = "uy";
  CountryISO2["Uzbekistan"] = "uz";
  CountryISO2["Vanuatu"] = "vu";
  CountryISO2["VaticanCity"] = "va";
  CountryISO2["Venezuela"] = "ve";
  CountryISO2["Vietnam"] = "vn";
  CountryISO2["WallisAndFutuna"] = "wf";
  CountryISO2["WesternSahara"] = "eh";
  CountryISO2["Yemen"] = "ye";
  CountryISO2["Zambia"] = "zm";
  CountryISO2["Zimbabwe"] = "zw";
  CountryISO2["ÅlandIslands"] = "ax";
})(CountryISO || (CountryISO = {}));
var CountryCode = class _CountryCode {
  constructor() {
    this.allCountries = [["Afghanistan (‫افغانستان‬‎)", CountryISO.Afghanistan, "93"], ["Albania (Shqipëri)", CountryISO.Albania, "355"], ["Algeria (‫الجزائر‬‎)", CountryISO.Algeria, "213"], ["American Samoa", "as", "1", 1, ["684"]], ["Andorra", CountryISO.Andorra, "376"], ["Angola", CountryISO.Angola, "244"], ["Anguilla", "ai", "1", 1, ["264"]], ["Antigua and Barbuda", "ag", "1", 1, ["268"]], ["Argentina", CountryISO.Argentina, "54"], ["Armenia (Հայաստան)", CountryISO.Armenia, "374"], ["Aruba", CountryISO.Aruba, "297"], ["Australia", CountryISO.Australia, "61", 0], ["Austria (Österreich)", CountryISO.Austria, "43"], ["Azerbaijan (Azərbaycan)", CountryISO.Azerbaijan, "994"], ["Bahamas", "bs", "1", 1, ["242"]], ["Bahrain (‫البحرين‬‎)", CountryISO.Bahrain, "973"], ["Bangladesh (বাংলাদেশ)", CountryISO.Bangladesh, "880"], ["Barbados", "bb", "1", 1, ["246"]], ["Belarus (Беларусь)", CountryISO.Belarus, "375"], ["Belgium (België)", CountryISO.Belgium, "32"], ["Belize", CountryISO.Belize, "501"], ["Benin (Bénin)", CountryISO.Benin, "229"], ["Bermuda", "bm", "1", 1, ["441"]], ["Bhutan (འབྲུག)", CountryISO.Bhutan, "975"], ["Bolivia", CountryISO.Bolivia, "591"], ["Bosnia and Herzegovina (Босна и Херцеговина)", CountryISO.BosniaAndHerzegovina, "387"], ["Botswana", CountryISO.Botswana, "267"], ["Brazil (Brasil)", CountryISO.Brazil, "55"], ["British Indian Ocean Territory", CountryISO.BritishIndianOceanTerritory, "246"], ["British Virgin Islands", "vg", "1", 1, ["284"]], ["Brunei", CountryISO.Brunei, "673"], ["Bulgaria (България)", CountryISO.Bulgaria, "359"], ["Burkina Faso", CountryISO.BurkinaFaso, "226"], ["Burundi (Uburundi)", CountryISO.Burundi, "257"], ["Cambodia (កម្ពុជា)", CountryISO.Cambodia, "855"], ["Cameroon (Cameroun)", CountryISO.Cameroon, "237"], ["Canada", CountryISO.Canada, "1", 1, ["204", "226", "236", "249", "250", "289", "306", "343", "365", "387", "403", "416", "418", "431", "437", "438", "450", "506", "514", "519", "548", "579", "581", "587", "604", "613", "639", "647", "672", "705", "709", "742", "778", "780", "782", "807", "819", "825", "867", "873", "902", "905"]], ["Cape Verde (Kabu Verdi)", CountryISO.CapeVerde, "238"], ["Caribbean Netherlands", CountryISO.CaribbeanNetherlands, "599", 1], ["Cayman Islands", "ky", "1", 1, ["345"]], ["Central African Republic (République centrafricaine)", CountryISO.CentralAfricanRepublic, "236"], ["Chad (Tchad)", CountryISO.Chad, "235"], ["Chile", CountryISO.Chile, "56"], ["China (中国)", CountryISO.China, "86"], ["Christmas Island", CountryISO.ChristmasIsland, "61", 2], ["Cocos (Keeling) Islands", CountryISO.Cocos, "61", 1], ["Colombia", CountryISO.Colombia, "57"], ["Comoros (‫جزر القمر‬‎)", CountryISO.Comoros, "269"], ["Congo (DRC) (Jamhuri ya Kidemokrasia ya Kongo)", CountryISO.CongoDRCJamhuriYaKidemokrasiaYaKongo, "243"], ["Congo (Republic) (Congo-Brazzaville)", CountryISO.CongoRepublicCongoBrazzaville, "242"], ["Cook Islands", CountryISO.CookIslands, "682"], ["Costa Rica", CountryISO.CostaRica, "506"], ["Côte d’Ivoire", CountryISO.CôteDIvoire, "225"], ["Croatia (Hrvatska)", CountryISO.Croatia, "385"], ["Cuba", CountryISO.Cuba, "53"], ["Curaçao", CountryISO.Curaçao, "599", 0], ["Cyprus (Κύπρος)", CountryISO.Cyprus, "357"], ["Czech Republic (Česká republika)", CountryISO.CzechRepublic, "420"], ["Denmark (Danmark)", CountryISO.Denmark, "45"], ["Djibouti", CountryISO.Djibouti, "253"], ["Dominica", CountryISO.Dominica, "1767"], ["Dominican Republic (República Dominicana)", CountryISO.DominicanRepublic, "1", 2, ["809", "829", "849"]], ["Ecuador", CountryISO.Ecuador, "593"], ["Egypt (‫مصر‬‎)", CountryISO.Egypt, "20"], ["El Salvador", CountryISO.ElSalvador, "503"], ["Equatorial Guinea (Guinea Ecuatorial)", CountryISO.EquatorialGuinea, "240"], ["Eritrea", CountryISO.Eritrea, "291"], ["Estonia (Eesti)", CountryISO.Estonia, "372"], ["Ethiopia", CountryISO.Ethiopia, "251"], ["Falkland Islands (Islas Malvinas)", CountryISO.FalklandIslands, "500"], ["Faroe Islands (Føroyar)", CountryISO.FaroeIslands, "298"], ["Fiji", CountryISO.Fiji, "679"], ["Finland (Suomi)", CountryISO.Finland, "358", 0], ["France", CountryISO.France, "33"], ["French Guiana (Guyane française)", CountryISO.FrenchGuiana, "594"], ["French Polynesia (Polynésie française)", CountryISO.FrenchPolynesia, "689"], ["Gabon", CountryISO.Gabon, "241"], ["Gambia", CountryISO.Gambia, "220"], ["Georgia (საქართველო)", CountryISO.Georgia, "995"], ["Germany (Deutschland)", CountryISO.Germany, "49"], ["Ghana (Gaana)", CountryISO.Ghana, "233"], ["Gibraltar", CountryISO.Gibraltar, "350"], ["Greece (Ελλάδα)", CountryISO.Greece, "30"], ["Greenland (Kalaallit Nunaat)", CountryISO.Greenland, "299"], ["Grenada", CountryISO.Grenada, "1473"], ["Guadeloupe", CountryISO.Guadeloupe, "590", 0], ["Guam", "gu", "1", 1, ["671"]], ["Guatemala", CountryISO.Guatemala, "502"], ["Guernsey", CountryISO.Guernsey, "44", 1, [1481]], ["Guinea (Guinée)", CountryISO.Guinea, "224"], ["Guinea-Bissau (Guiné Bissau)", CountryISO.GuineaBissau, "245"], ["Guyana", CountryISO.Guyana, "592"], ["Haiti", CountryISO.Haiti, "509"], ["Honduras", CountryISO.Honduras, "504"], ["Hong Kong (香港)", CountryISO.HongKong, "852"], ["Hungary (Magyarország)", CountryISO.Hungary, "36"], ["Iceland (Ísland)", CountryISO.Iceland, "354"], ["India (भारत)", CountryISO.India, "91"], ["Indonesia", CountryISO.Indonesia, "62"], ["Iran (‫ایران‬‎)", CountryISO.Iran, "98"], ["Iraq (‫العراق‬‎)", CountryISO.Iraq, "964"], ["Ireland", CountryISO.Ireland, "353"], ["Isle of Man", CountryISO.IsleOfMan, "44", 2, [1624]], ["Israel (‫ישראל‬‎)", CountryISO.Israel, "972"], ["Italy (Italia)", CountryISO.Italy, "39", 0], ["Jamaica", "jm", "1", 1, ["876"]], ["Japan (日本)", CountryISO.Japan, "81"], ["Jersey", CountryISO.Jersey, "44", 3, [1534]], ["Jordan (‫الأردن‬‎)", CountryISO.Jordan, "962"], ["Kazakhstan (Казахстан)", CountryISO.Kazakhstan, "7", 1], ["Kenya", CountryISO.Kenya, "254"], ["Kiribati", CountryISO.Kiribati, "686"], ["Kosovo", CountryISO.Kosovo, "383"], ["Kuwait (‫الكويت‬‎)", CountryISO.Kuwait, "965"], ["Kyrgyzstan (Кыргызстан)", CountryISO.Kyrgyzstan, "996"], ["Laos (ລາວ)", CountryISO.Laos, "856"], ["Latvia (Latvija)", CountryISO.Latvia, "371"], ["Lebanon (‫لبنان‬‎)", CountryISO.Lebanon, "961"], ["Lesotho", CountryISO.Lesotho, "266"], ["Liberia", CountryISO.Liberia, "231"], ["Libya (‫ليبيا‬‎)", CountryISO.Libya, "218"], ["Liechtenstein", CountryISO.Liechtenstein, "423"], ["Lithuania (Lietuva)", CountryISO.Lithuania, "370"], ["Luxembourg", CountryISO.Luxembourg, "352"], ["Macau (澳門)", CountryISO.Macau, "853"], ["Macedonia (FYROM) (Македонија)", CountryISO.Macedonia, "389"], ["Madagascar (Madagasikara)", CountryISO.Madagascar, "261"], ["Malawi", CountryISO.Malawi, "265"], ["Malaysia", CountryISO.Malaysia, "60"], ["Maldives", CountryISO.Maldives, "960"], ["Mali", CountryISO.Mali, "223"], ["Malta", CountryISO.Malta, "356"], ["Marshall Islands", CountryISO.MarshallIslands, "692"], ["Martinique", CountryISO.Martinique, "596"], ["Mauritania (‫موريتانيا‬‎)", CountryISO.Mauritania, "222"], ["Mauritius (Moris)", CountryISO.Mauritius, "230"], ["Mayotte", CountryISO.Mayotte, "262", 1], ["Mexico (México)", CountryISO.Mexico, "52"], ["Micronesia", CountryISO.Micronesia, "691"], ["Moldova (Republica Moldova)", CountryISO.Moldova, "373"], ["Monaco", CountryISO.Monaco, "377"], ["Mongolia (Монгол)", CountryISO.Mongolia, "976"], ["Montenegro (Crna Gora)", CountryISO.Montenegro, "382"], ["Montserrat", "ms", "1", 1, ["664"]], ["Morocco (‫المغرب‬‎)", CountryISO.Morocco, "212", 0], ["Mozambique (Moçambique)", CountryISO.Mozambique, "258"], ["Myanmar (Burma) (မြန်မာ)", CountryISO.Myanmar, "95"], ["Namibia (Namibië)", CountryISO.Namibia, "264"], ["Nauru", CountryISO.Nauru, "674"], ["Nepal (नेपाल)", CountryISO.Nepal, "977"], ["Netherlands (Nederland)", CountryISO.Netherlands, "31"], ["New Caledonia (Nouvelle-Calédonie)", CountryISO.NewCaledonia, "687"], ["New Zealand", CountryISO.NewZealand, "64"], ["Nicaragua", CountryISO.Nicaragua, "505"], ["Niger (Nijar)", CountryISO.Niger, "227"], ["Nigeria", CountryISO.Nigeria, "234"], ["Niue", CountryISO.Niue, "683"], ["Norfolk Island", CountryISO.NorfolkIsland, "672"], ["North Korea (조선 민주주의 인민 공화국)", CountryISO.NorthKorea, "850"], ["Northern Mariana Islands", CountryISO.NorthernMarianaIslands, "1670"], ["Norway (Norge)", CountryISO.Norway, "47", 0], ["Oman (‫عُمان‬‎)", CountryISO.Oman, "968"], ["Pakistan (‫پاکستان‬‎)", CountryISO.Pakistan, "92"], ["Palau", CountryISO.Palau, "680"], ["Palestine (‫فلسطين‬‎)", CountryISO.Palestine, "970"], ["Panama (Panamá)", CountryISO.Panama, "507"], ["Papua New Guinea", CountryISO.PapuaNewGuinea, "675"], ["Paraguay", CountryISO.Paraguay, "595"], ["Peru (Perú)", CountryISO.Peru, "51"], ["Philippines", CountryISO.Philippines, "63"], ["Poland (Polska)", CountryISO.Poland, "48"], ["Portugal", CountryISO.Portugal, "351"], ["Puerto Rico", CountryISO.PuertoRico, "1", 3, ["787", "939"]], ["Qatar (‫قطر‬‎)", CountryISO.Qatar, "974"], ["Réunion (La Réunion)", CountryISO.Réunion, "262", 0], ["Romania (România)", CountryISO.Romania, "40"], ["Russia (Россия)", CountryISO.Russia, "7", 0], ["Rwanda", CountryISO.Rwanda, "250"], ["Saint Barthélemy (Saint-Barthélemy)", CountryISO.SaintBarthélemy, "590", 1], ["Saint Helena", CountryISO.SaintHelena, "290"], ["Saint Kitts and Nevis", CountryISO.SaintKittsAndNevis, "1869"], ["Saint Lucia", "lc", "1", 1, ["758"]], ["Saint Martin (Saint-Martin (partie française))", CountryISO.SaintMartin, "590", 2], ["Saint Pierre and Miquelon (Saint-Pierre-et-Miquelon)", CountryISO.SaintPierreAndMiquelon, "508"], ["Saint Vincent and the Grenadines", "vc", "1", 1, ["784"]], ["Samoa", CountryISO.Samoa, "685"], ["San Marino", CountryISO.SanMarino, "378"], ["São Tomé and Príncipe (São Tomé e Príncipe)", CountryISO.SãoToméAndPríncipe, "239"], ["Saudi Arabia (‫المملكة العربية السعودية‬‎)", CountryISO.SaudiArabia, "966"], ["Senegal (Sénégal)", CountryISO.Senegal, "221"], ["Serbia (Србија)", CountryISO.Serbia, "381"], ["Seychelles", CountryISO.Seychelles, "248"], ["Sierra Leone", CountryISO.SierraLeone, "232"], ["Singapore", CountryISO.Singapore, "65"], ["Sint Maarten", "sx", "1", 1, ["721"]], ["Slovakia (Slovensko)", CountryISO.Slovakia, "421"], ["Slovenia (Slovenija)", CountryISO.Slovenia, "386"], ["Solomon Islands", CountryISO.SolomonIslands, "677"], ["Somalia (Soomaaliya)", CountryISO.Somalia, "252"], ["South Africa", CountryISO.SouthAfrica, "27"], ["South Korea (대한민국)", CountryISO.SouthKorea, "82"], ["South Sudan (‫جنوب السودان‬‎)", CountryISO.SouthSudan, "211"], ["Spain (España)", CountryISO.Spain, "34"], ["Sri Lanka (ශ්‍රී ලංකාව)", CountryISO.SriLanka, "94"], ["Sudan (‫السودان‬‎)", CountryISO.Sudan, "249"], ["Suriname", CountryISO.Suriname, "597"], ["Svalbard and Jan Mayen", CountryISO.SvalbardAndJanMayen, "47", 1], ["Swaziland", CountryISO.Swaziland, "268"], ["Sweden (Sverige)", CountryISO.Sweden, "46"], ["Switzerland (Schweiz)", CountryISO.Switzerland, "41"], ["Syria (‫سوريا‬‎)", CountryISO.Syria, "963"], ["Taiwan (台灣)", CountryISO.Taiwan, "886"], ["Tajikistan", CountryISO.Tajikistan, "992"], ["Tanzania", CountryISO.Tanzania, "255"], ["Thailand (ไทย)", CountryISO.Thailand, "66"], ["Timor-Leste", CountryISO.TimorLeste, "670"], ["Togo", CountryISO.Togo, "228"], ["Tokelau", CountryISO.Tokelau, "690"], ["Tonga", CountryISO.Tonga, "676"], ["Trinidad and Tobago", "tt", "1", 1, ["868"]], ["Tunisia (‫تونس‬‎)", CountryISO.Tunisia, "216"], ["Turkey (Türkiye)", CountryISO.Turkey, "90"], ["Turkmenistan", CountryISO.Turkmenistan, "993"], ["Turks and Caicos Islands", CountryISO.TurksAndCaicosIslands, "1649"], ["Tuvalu", CountryISO.Tuvalu, "688"], ["U.S. Virgin Islands", "vi", "1", 1, ["340"]], ["Uganda", CountryISO.Uganda, "256"], ["Ukraine (Україна)", CountryISO.Ukraine, "380"], ["United Arab Emirates (‫الإمارات العربية المتحدة‬‎)", CountryISO.UnitedArabEmirates, "971"], ["United Kingdom", CountryISO.UnitedKingdom, "44", 0], ["United States", CountryISO.UnitedStates, "1", 0], ["Uruguay", CountryISO.Uruguay, "598"], ["Uzbekistan (Oʻzbekiston)", CountryISO.Uzbekistan, "998"], ["Vanuatu", CountryISO.Vanuatu, "678"], ["Vatican City (Città del Vaticano)", CountryISO.VaticanCity, "39", 1], ["Venezuela", CountryISO.Venezuela, "58"], ["Vietnam (Việt Nam)", CountryISO.Vietnam, "84"], ["Wallis and Futuna", CountryISO.WallisAndFutuna, "681"], ["Western Sahara (‫الصحراء الغربية‬‎)", CountryISO.WesternSahara, "212", 1], ["Yemen (‫اليمن‬‎)", CountryISO.Yemen, "967"], ["Zambia", CountryISO.Zambia, "260"], ["Zimbabwe", CountryISO.Zimbabwe, "263"], ["Åland Islands", CountryISO.ÅlandIslands, "358", 1]];
  }
  static {
    this.ɵfac = function CountryCode_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || _CountryCode)();
    };
  }
  static {
    this.ɵprov = ɵɵdefineInjectable({
      token: _CountryCode,
      factory: _CountryCode.ɵfac
    });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(CountryCode, [{
    type: Injectable
  }], null, null);
})();
var SearchCountryField;
(function(SearchCountryField2) {
  SearchCountryField2["DialCode"] = "dialCode";
  SearchCountryField2["Iso2"] = "iso2";
  SearchCountryField2["Name"] = "name";
  SearchCountryField2["All"] = "all";
})(SearchCountryField || (SearchCountryField = {}));
var phoneNumberValidator = (control) => {
  if (!control.value) {
    return;
  }
  const el = control.nativeElement;
  const inputBox = el ? el.querySelector('input[type="tel"]') : void 0;
  if (inputBox) {
    const id = inputBox.id;
    const isCheckValidation = inputBox.getAttribute("validation");
    if (isCheckValidation === "true") {
      const isRequired = control.errors && control.errors.required === true;
      const error = {
        validatePhoneNumber: {
          valid: false
        }
      };
      inputBox.setCustomValidity("Invalid field.");
      let number;
      try {
        number = lpn.PhoneNumberUtil.getInstance().parse(control.value.number, control.value.countryCode);
      } catch (e) {
        if (isRequired) {
          return error;
        } else {
          inputBox.setCustomValidity("");
        }
      }
      if (control.value) {
        if (!number) {
          return error;
        } else {
          if (!lpn.PhoneNumberUtil.getInstance().isValidNumberForRegion(number, control.value.countryCode)) {
            return error;
          } else {
            inputBox.setCustomValidity("");
          }
        }
      }
    } else if (isCheckValidation === "false") {
      inputBox.setCustomValidity("");
      control.clearValidators();
    }
  }
  return;
};
var PhoneNumberFormat2;
(function(PhoneNumberFormat3) {
  PhoneNumberFormat3["International"] = "INTERNATIONAL";
  PhoneNumberFormat3["National"] = "NATIONAL";
})(PhoneNumberFormat2 || (PhoneNumberFormat2 = {}));
var NativeElementInjectorDirective = class _NativeElementInjectorDirective {
  constructor(controlDir, host) {
    this.controlDir = controlDir;
    this.host = host;
  }
  ngOnInit() {
    if (this.controlDir.control) {
      this.controlDir.control["nativeElement"] = this.host.nativeElement;
    }
  }
  static {
    this.ɵfac = function NativeElementInjectorDirective_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || _NativeElementInjectorDirective)(ɵɵdirectiveInject(NgControl), ɵɵdirectiveInject(ElementRef));
    };
  }
  static {
    this.ɵdir = ɵɵdefineDirective({
      type: _NativeElementInjectorDirective,
      selectors: [["", "ngModel", ""], ["", "formControl", ""], ["", "formControlName", ""]],
      standalone: false
    });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NativeElementInjectorDirective, [{
    type: Directive,
    args: [{
      // tslint:disable-next-line: directive-selector
      selector: "[ngModel], [formControl], [formControlName]"
    }]
  }], () => [{
    type: NgControl
  }, {
    type: ElementRef
  }], null);
})();
var NgxIntlTelInputComponent = class _NgxIntlTelInputComponent {
  constructor(countryCodeData) {
    this.countryCodeData = countryCodeData;
    this.value = "";
    this.preferredCountries = [];
    this.enablePlaceholder = true;
    this.numberFormat = PhoneNumberFormat2.International;
    this.cssClass = "form-control";
    this.onlyCountries = [];
    this.enableAutoCountrySelect = true;
    this.searchCountryFlag = false;
    this.searchCountryField = [SearchCountryField.All];
    this.searchCountryPlaceholder = "Search Country";
    this.selectFirstCountry = true;
    this.phoneValidation = true;
    this.inputId = "phone";
    this.separateDialCode = false;
    this.countryChange = new EventEmitter();
    this.selectedCountry = {
      areaCodes: void 0,
      dialCode: "",
      htmlId: "",
      flagClass: "",
      iso2: "",
      name: "",
      placeHolder: "",
      priority: 0
    };
    this.phoneNumber = "";
    this.allCountries = [];
    this.preferredCountriesInDropDown = [];
    this.phoneUtil = lpn.PhoneNumberUtil.getInstance();
    this.disabled = false;
    this.errors = ["Phone number is required."];
    this.countrySearchText = "";
    this.onTouched = () => {
    };
    this.propagateChange = (_) => {
    };
    setTheme("bs4");
  }
  ngOnInit() {
    this.init();
  }
  ngOnChanges(changes) {
    const selectedISO = changes["selectedCountryISO"];
    if (this.allCountries && selectedISO && selectedISO.currentValue !== selectedISO.previousValue) {
      this.updateSelectedCountry();
    }
    if (changes["preferredCountries"]) {
      this.updatePreferredCountries();
    }
    this.checkSeparateDialCodeStyle();
  }
  /*
    This is a wrapper method to avoid calling this.ngOnInit() in writeValue().
    Ref: http://codelyzer.com/rules/no-life-cycle-call/
  */
  init() {
    this.fetchCountryData();
    if (this.preferredCountries.length) {
      this.updatePreferredCountries();
    }
    if (this.onlyCountries.length) {
      this.allCountries = this.allCountries.filter((c) => this.onlyCountries.includes(c.iso2));
    }
    if (this.selectFirstCountry) {
      if (this.preferredCountriesInDropDown.length) {
        this.setSelectedCountry(this.preferredCountriesInDropDown[0]);
      } else {
        this.setSelectedCountry(this.allCountries[0]);
      }
    }
    this.updateSelectedCountry();
    this.checkSeparateDialCodeStyle();
  }
  setSelectedCountry(country) {
    this.selectedCountry = country;
    this.countryChange.emit(country);
  }
  /**
   * Search country based on country name, iso2, dialCode or all of them.
   */
  searchCountry() {
    if (!this.countrySearchText) {
      this.countryList.nativeElement.querySelector(".iti__country-list li").scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest"
      });
      return;
    }
    const countrySearchTextLower = this.countrySearchText.toLowerCase();
    const country = this.allCountries.filter((c) => {
      if (this.searchCountryField.indexOf(SearchCountryField.All) > -1) {
        if (c.iso2.toLowerCase().startsWith(countrySearchTextLower)) {
          return c;
        }
        if (c.name.toLowerCase().startsWith(countrySearchTextLower)) {
          return c;
        }
        if (c.dialCode.startsWith(this.countrySearchText)) {
          return c;
        }
      } else {
        if (this.searchCountryField.indexOf(SearchCountryField.Iso2) > -1) {
          if (c.iso2.toLowerCase().startsWith(countrySearchTextLower)) {
            return c;
          }
        }
        if (this.searchCountryField.indexOf(SearchCountryField.Name) > -1) {
          if (c.name.toLowerCase().startsWith(countrySearchTextLower)) {
            return c;
          }
        }
        if (this.searchCountryField.indexOf(SearchCountryField.DialCode) > -1) {
          if (c.dialCode.startsWith(this.countrySearchText)) {
            return c;
          }
        }
      }
    });
    if (country.length > 0) {
      const el = this.countryList.nativeElement.querySelector("#" + country[0].htmlId);
      if (el) {
        el.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "nearest"
        });
      }
    }
    this.checkSeparateDialCodeStyle();
  }
  onPhoneNumberChange() {
    let countryCode;
    if (this.phoneNumber && typeof this.phoneNumber === "object") {
      const numberObj = this.phoneNumber;
      this.phoneNumber = numberObj.number;
      countryCode = numberObj.countryCode;
    }
    this.value = this.phoneNumber;
    countryCode = countryCode || this.selectedCountry.iso2;
    const number = this.getParsedNumber(this.phoneNumber, countryCode);
    if (this.enableAutoCountrySelect) {
      countryCode = number && number.getCountryCode() ? (
        // @ts-ignore
        this.getCountryIsoCode(number.getCountryCode(), number)
      ) : this.selectedCountry.iso2;
      if (countryCode && countryCode !== this.selectedCountry.iso2) {
        const newCountry = this.allCountries.slice().sort((a, b) => {
          return a.priority - b.priority;
        }).find((c) => c.iso2 === countryCode);
        if (newCountry) {
          this.selectedCountry = newCountry;
        }
      }
    }
    countryCode = countryCode ? countryCode : this.selectedCountry.iso2;
    this.checkSeparateDialCodeStyle();
    if (!this.value) {
      this.propagateChange(null);
    } else {
      const intlNo = number ? this.phoneUtil.format(number, lpn.PhoneNumberFormat.INTERNATIONAL) : "";
      if (this.separateDialCode && intlNo) {
        this.value = this.removeDialCode(intlNo);
      }
      this.propagateChange({
        number: this.value,
        internationalNumber: intlNo,
        nationalNumber: number ? this.phoneUtil.format(number, lpn.PhoneNumberFormat.NATIONAL) : "",
        e164Number: number ? this.phoneUtil.format(number, lpn.PhoneNumberFormat.E164) : "",
        countryCode: countryCode.toUpperCase(),
        dialCode: "+" + this.selectedCountry.dialCode
      });
    }
  }
  onCountrySelect(country, el) {
    this.setSelectedCountry(country);
    this.checkSeparateDialCodeStyle();
    if (this.phoneNumber && this.phoneNumber.length > 0) {
      this.value = this.phoneNumber;
      const number = this.getParsedNumber(this.phoneNumber, this.selectedCountry.iso2);
      const intlNo = number ? this.phoneUtil.format(number, lpn.PhoneNumberFormat.INTERNATIONAL) : "";
      if (this.separateDialCode && intlNo) {
        this.value = this.removeDialCode(intlNo);
      }
      this.propagateChange({
        number: this.value,
        internationalNumber: intlNo,
        nationalNumber: number ? this.phoneUtil.format(number, lpn.PhoneNumberFormat.NATIONAL) : "",
        e164Number: number ? this.phoneUtil.format(number, lpn.PhoneNumberFormat.E164) : "",
        countryCode: this.selectedCountry.iso2.toUpperCase(),
        dialCode: "+" + this.selectedCountry.dialCode
      });
    } else {
      this.propagateChange(null);
    }
    el.focus();
  }
  onInputKeyPress(event) {
    const allowedChars = /[0-9\+\-\(\)\ ]/;
    const allowedCtrlChars = /[axcv]/;
    const allowedOtherKeys = ["ArrowLeft", "ArrowUp", "ArrowRight", "ArrowDown", "Home", "End", "Insert", "Delete", "Backspace"];
    if (!allowedChars.test(event.key) && !(event.ctrlKey && allowedCtrlChars.test(event.key)) && !allowedOtherKeys.includes(event.key)) {
      event.preventDefault();
    }
  }
  registerOnChange(fn) {
    this.propagateChange = fn;
  }
  registerOnTouched(fn) {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled) {
    this.disabled = isDisabled;
  }
  writeValue(obj) {
    if (obj === void 0) {
      this.init();
    }
    this.phoneNumber = obj;
    setTimeout(() => {
      this.onPhoneNumberChange();
    }, 1);
  }
  resolvePlaceholder() {
    let placeholder = "";
    if (this.customPlaceholder) {
      placeholder = this.customPlaceholder;
    } else if (this.selectedCountry.placeHolder) {
      placeholder = this.selectedCountry.placeHolder;
      if (this.separateDialCode) {
        placeholder = this.removeDialCode(placeholder);
      }
    }
    return placeholder;
  }
  /* --------------------------------- Helpers -------------------------------- */
  /**
   * Returns parse PhoneNumber object.
   * @param phoneNumber string
   * @param countryCode string
   */
  getParsedNumber(phoneNumber, countryCode) {
    let number;
    try {
      number = this.phoneUtil.parse(phoneNumber, countryCode.toUpperCase());
    } catch (e) {
    }
    return number;
  }
  /**
   * Adjusts input alignment based on the dial code presentation style.
   */
  checkSeparateDialCodeStyle() {
    if (this.separateDialCode && this.selectedCountry) {
      const cntryCd = this.selectedCountry.dialCode;
      this.separateDialCodeClass = "separate-dial-code iti-sdc-" + (cntryCd.length + 1);
    } else {
      this.separateDialCodeClass = "";
    }
  }
  /**
   * Cleans dialcode from phone number string.
   * @param phoneNumber string
   */
  removeDialCode(phoneNumber) {
    const number = this.getParsedNumber(phoneNumber, this.selectedCountry.iso2);
    phoneNumber = this.phoneUtil.format(number, lpn.PhoneNumberFormat[this.numberFormat]);
    if (phoneNumber.startsWith("+") && this.separateDialCode) {
      phoneNumber = phoneNumber.substr(phoneNumber.indexOf(" ") + 1);
    }
    return phoneNumber;
  }
  /**
   * Sifts through all countries and returns iso code of the primary country
   * based on the number provided.
   * @param countryCode country code in number format
   * @param number PhoneNumber object
   */
  getCountryIsoCode(countryCode, number) {
    const rawNumber = number["values_"]["2"].toString();
    const countries = this.allCountries.filter((c) => c.dialCode === countryCode.toString());
    const mainCountry = countries.find((c) => c.areaCodes === void 0);
    const secondaryCountries = countries.filter((c) => c.areaCodes !== void 0);
    let matchedCountry = mainCountry ? mainCountry.iso2 : void 0;
    secondaryCountries.forEach((country) => {
      country.areaCodes.forEach((areaCode) => {
        if (rawNumber.startsWith(areaCode)) {
          matchedCountry = country.iso2;
        }
      });
    });
    return matchedCountry;
  }
  /**
   * Gets formatted example phone number from phoneUtil.
   * @param countryCode string
   */
  getPhoneNumberPlaceHolder(countryCode) {
    try {
      return this.phoneUtil.format(this.phoneUtil.getExampleNumber(countryCode), lpn.PhoneNumberFormat[this.numberFormat]);
    } catch (e) {
      return e;
    }
  }
  /**
   * Clearing the list to avoid duplicates (https://github.com/webcat12345/ngx-intl-tel-input/issues/248)
   */
  fetchCountryData() {
    this.allCountries = [];
    this.countryCodeData.allCountries.forEach((c) => {
      const country = {
        name: c[0].toString(),
        iso2: c[1].toString(),
        dialCode: c[2].toString(),
        priority: +c[3] || 0,
        areaCodes: c[4] || void 0,
        htmlId: `iti-0__item-${c[1].toString()}`,
        flagClass: `iti__${c[1].toString().toLocaleLowerCase()}`,
        placeHolder: ""
      };
      if (this.enablePlaceholder) {
        country.placeHolder = this.getPhoneNumberPlaceHolder(country.iso2.toUpperCase());
      }
      this.allCountries.push(country);
    });
  }
  /**
   * Populates preferredCountriesInDropDown with prefferred countries.
   */
  updatePreferredCountries() {
    if (this.preferredCountries.length) {
      this.preferredCountriesInDropDown = [];
      this.preferredCountries.forEach((iso2) => {
        const preferredCountry = this.allCountries.filter((c) => {
          return c.iso2 === iso2;
        });
        this.preferredCountriesInDropDown.push(preferredCountry[0]);
      });
    }
  }
  /**
   * Updates selectedCountry.
   */
  updateSelectedCountry() {
    if (this.selectedCountryISO) {
      this.selectedCountry = this.allCountries.find((c) => {
        return c.iso2.toLowerCase() === this.selectedCountryISO.toLowerCase();
      });
      if (this.selectedCountry) {
        if (this.phoneNumber) {
          this.onPhoneNumberChange();
        } else {
          this.propagateChange(null);
        }
      }
    }
  }
  static {
    this.ɵfac = function NgxIntlTelInputComponent_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || _NgxIntlTelInputComponent)(ɵɵdirectiveInject(CountryCode));
    };
  }
  static {
    this.ɵcmp = ɵɵdefineComponent({
      type: _NgxIntlTelInputComponent,
      selectors: [["ngx-intl-tel-input"]],
      viewQuery: function NgxIntlTelInputComponent_Query(rf, ctx) {
        if (rf & 1) {
          ɵɵviewQuery(_c02, 5);
        }
        if (rf & 2) {
          let _t;
          ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.countryList = _t.first);
        }
      },
      inputs: {
        value: "value",
        preferredCountries: "preferredCountries",
        enablePlaceholder: "enablePlaceholder",
        customPlaceholder: "customPlaceholder",
        numberFormat: "numberFormat",
        cssClass: "cssClass",
        onlyCountries: "onlyCountries",
        enableAutoCountrySelect: "enableAutoCountrySelect",
        searchCountryFlag: "searchCountryFlag",
        searchCountryField: "searchCountryField",
        searchCountryPlaceholder: "searchCountryPlaceholder",
        maxLength: "maxLength",
        selectFirstCountry: "selectFirstCountry",
        selectedCountryISO: "selectedCountryISO",
        phoneValidation: "phoneValidation",
        inputId: "inputId",
        separateDialCode: "separateDialCode"
      },
      outputs: {
        countryChange: "countryChange"
      },
      standalone: false,
      features: [ɵɵProvidersFeature([CountryCode, {
        provide: NG_VALUE_ACCESSOR,
        // tslint:disable-next-line:no-forward-ref
        useExisting: forwardRef(() => _NgxIntlTelInputComponent),
        multi: true
      }, {
        provide: NG_VALIDATORS,
        useValue: phoneNumberValidator,
        multi: true
      }]), ɵɵNgOnChangesFeature],
      decls: 9,
      vars: 14,
      consts: [["focusable", ""], ["countryList", ""], [1, "iti", "iti--allow-dropdown", 3, "ngClass"], ["dropdown", "", 1, "iti__flag-container", 3, "ngClass", "isDisabled"], ["dropdownToggle", "", 1, "iti__selected-flag", "dropdown-toggle"], [1, "iti__flag", 3, "ngClass"], ["class", "selected-dial-code", 4, "ngIf"], [1, "iti__arrow"], ["class", "dropdown-menu iti__dropdown-content", 4, "dropdownMenu"], ["type", "tel", "autocomplete", "off", 1, "iti__tel-input", 3, "blur", "keypress", "ngModelChange", "id", "ngClass", "ngModel", "disabled", "placeholder"], [1, "selected-dial-code"], [1, "dropdown-menu", "iti__dropdown-content"], ["class", "search-container", 4, "ngIf"], [1, "iti__country-list"], ["class", "iti__country iti__preferred", 3, "id", "click", 4, "ngFor", "ngForOf"], ["class", "iti__divider", 4, "ngIf"], ["class", "iti__country iti__standard", 3, "id", "click", 4, "ngFor", "ngForOf"], [1, "search-container"], ["id", "country-search-box", "autofocus", "", 3, "ngModelChange", "keyup", "click", "ngModel", "placeholder"], [1, "iti__country", "iti__preferred", 3, "click", "id"], [1, "iti__flag-box"], [1, "iti__country-name"], [1, "iti__dial-code"], [1, "iti__divider"], [1, "iti__country", "iti__standard", 3, "click", "id"]],
      template: function NgxIntlTelInputComponent_Template(rf, ctx) {
        if (rf & 1) {
          const _r1 = ɵɵgetCurrentView();
          ɵɵelementStart(0, "div", 2)(1, "div", 3)(2, "div", 4);
          ɵɵelement(3, "div", 5);
          ɵɵtemplate(4, NgxIntlTelInputComponent_div_4_Template, 2, 1, "div", 6);
          ɵɵelement(5, "div", 7);
          ɵɵelementEnd();
          ɵɵtemplate(6, NgxIntlTelInputComponent_div_6_Template, 7, 4, "div", 8);
          ɵɵelementEnd();
          ɵɵelementStart(7, "input", 9, 0);
          ɵɵlistener("blur", function NgxIntlTelInputComponent_Template_input_blur_7_listener() {
            ɵɵrestoreView(_r1);
            return ɵɵresetView(ctx.onTouched());
          })("keypress", function NgxIntlTelInputComponent_Template_input_keypress_7_listener($event) {
            ɵɵrestoreView(_r1);
            return ɵɵresetView(ctx.onInputKeyPress($event));
          });
          ɵɵtwoWayListener("ngModelChange", function NgxIntlTelInputComponent_Template_input_ngModelChange_7_listener($event) {
            ɵɵrestoreView(_r1);
            ɵɵtwoWayBindingSet(ctx.phoneNumber, $event) || (ctx.phoneNumber = $event);
            return ɵɵresetView($event);
          });
          ɵɵlistener("ngModelChange", function NgxIntlTelInputComponent_Template_input_ngModelChange_7_listener() {
            ɵɵrestoreView(_r1);
            return ɵɵresetView(ctx.onPhoneNumberChange());
          });
          ɵɵelementEnd()();
        }
        if (rf & 2) {
          ɵɵproperty("ngClass", ctx.separateDialCodeClass);
          ɵɵadvance();
          ɵɵproperty("ngClass", ɵɵpureFunction1(12, _c12, ctx.disabled))("isDisabled", ctx.disabled);
          ɵɵadvance(2);
          ɵɵproperty("ngClass", ctx.selectedCountry.flagClass || "");
          ɵɵadvance();
          ɵɵproperty("ngIf", ctx.separateDialCode);
          ɵɵadvance(3);
          ɵɵproperty("id", ctx.inputId)("ngClass", ctx.cssClass);
          ɵɵtwoWayProperty("ngModel", ctx.phoneNumber);
          ɵɵproperty("disabled", ctx.disabled)("placeholder", ctx.resolvePlaceholder());
          ɵɵattribute("maxLength", ctx.maxLength)("validation", ctx.phoneValidation);
        }
      },
      dependencies: [NgClass, NgForOf, NgIf, DefaultValueAccessor, NgControlStatus, NgModel, BsDropdownMenuDirective, BsDropdownToggleDirective, BsDropdownDirective, NativeElementInjectorDirective],
      styles: ['.dropup[_ngcontent-%COMP%], .dropright[_ngcontent-%COMP%], .dropdown[_ngcontent-%COMP%], .dropleft[_ngcontent-%COMP%]{position:relative}.dropdown-toggle[_ngcontent-%COMP%]{white-space:nowrap}.dropdown-toggle[_ngcontent-%COMP%]:after{display:inline-block;margin-left:.255em;vertical-align:.255em;content:"";border-top:.3em solid;border-right:.3em solid transparent;border-bottom:0;border-left:.3em solid transparent}.dropdown-toggle[_ngcontent-%COMP%]:empty:after{margin-left:0}.dropdown-menu[_ngcontent-%COMP%]{position:absolute;top:100%;left:0;z-index:1000;display:none;float:left;min-width:10rem;padding:.5rem 0;margin:.125rem 0 0;font-size:1rem;color:#212529;text-align:left;list-style:none;background-color:#fff;background-clip:padding-box;border:1px solid rgba(0,0,0,.15);border-radius:.25rem}.dropdown-menu-left[_ngcontent-%COMP%]{right:auto;left:0}.dropdown-menu-right[_ngcontent-%COMP%]{right:0;left:auto}@media (min-width: 576px){.dropdown-menu-sm-left[_ngcontent-%COMP%]{right:auto;left:0}.dropdown-menu-sm-right[_ngcontent-%COMP%]{right:0;left:auto}}@media (min-width: 768px){.dropdown-menu-md-left[_ngcontent-%COMP%]{right:auto;left:0}.dropdown-menu-md-right[_ngcontent-%COMP%]{right:0;left:auto}}@media (min-width: 992px){.dropdown-menu-lg-left[_ngcontent-%COMP%]{right:auto;left:0}.dropdown-menu-lg-right[_ngcontent-%COMP%]{right:0;left:auto}}@media (min-width: 1200px){.dropdown-menu-xl-left[_ngcontent-%COMP%]{right:auto;left:0}.dropdown-menu-xl-right[_ngcontent-%COMP%]{right:0;left:auto}}.dropup[_ngcontent-%COMP%]   .dropdown-menu[_ngcontent-%COMP%]{top:auto;bottom:100%;margin-top:0;margin-bottom:.125rem}.dropup[_ngcontent-%COMP%]   .dropdown-toggle[_ngcontent-%COMP%]:after{display:inline-block;margin-left:.255em;vertical-align:.255em;content:"";border-top:0;border-right:.3em solid transparent;border-bottom:.3em solid;border-left:.3em solid transparent}.dropup[_ngcontent-%COMP%]   .dropdown-toggle[_ngcontent-%COMP%]:empty:after{margin-left:0}.dropright[_ngcontent-%COMP%]   .dropdown-menu[_ngcontent-%COMP%]{top:0;right:auto;left:100%;margin-top:0;margin-left:.125rem}.dropright[_ngcontent-%COMP%]   .dropdown-toggle[_ngcontent-%COMP%]:after{display:inline-block;margin-left:.255em;vertical-align:.255em;content:"";border-top:.3em solid transparent;border-right:0;border-bottom:.3em solid transparent;border-left:.3em solid}.dropright[_ngcontent-%COMP%]   .dropdown-toggle[_ngcontent-%COMP%]:empty:after{margin-left:0}.dropright[_ngcontent-%COMP%]   .dropdown-toggle[_ngcontent-%COMP%]:after{vertical-align:0}.dropleft[_ngcontent-%COMP%]   .dropdown-menu[_ngcontent-%COMP%]{top:0;right:100%;left:auto;margin-top:0;margin-right:.125rem}.dropleft[_ngcontent-%COMP%]   .dropdown-toggle[_ngcontent-%COMP%]:after{display:inline-block;margin-left:.255em;vertical-align:.255em;content:""}.dropleft[_ngcontent-%COMP%]   .dropdown-toggle[_ngcontent-%COMP%]:after{display:none}.dropleft[_ngcontent-%COMP%]   .dropdown-toggle[_ngcontent-%COMP%]:before{display:inline-block;margin-right:.255em;vertical-align:.255em;content:"";border-top:.3em solid transparent;border-right:.3em solid;border-bottom:.3em solid transparent}.dropleft[_ngcontent-%COMP%]   .dropdown-toggle[_ngcontent-%COMP%]:empty:after{margin-left:0}.dropleft[_ngcontent-%COMP%]   .dropdown-toggle[_ngcontent-%COMP%]:before{vertical-align:0}.dropdown-menu[x-placement^=top][_ngcontent-%COMP%], .dropdown-menu[x-placement^=right][_ngcontent-%COMP%], .dropdown-menu[x-placement^=bottom][_ngcontent-%COMP%], .dropdown-menu[x-placement^=left][_ngcontent-%COMP%]{right:auto;bottom:auto}.dropdown-divider[_ngcontent-%COMP%]{height:0;margin:.5rem 0;overflow:hidden;border-top:1px solid #e9ecef}.dropdown-item[_ngcontent-%COMP%]{display:block;width:100%;padding:.25rem 1.5rem;clear:both;font-weight:400;color:#212529;text-align:inherit;white-space:nowrap;background-color:transparent;border:0}.dropdown-item[_ngcontent-%COMP%]:hover, .dropdown-item[_ngcontent-%COMP%]:focus{color:#16181b;text-decoration:none;background-color:#f8f9fa}.dropdown-item.active[_ngcontent-%COMP%], .dropdown-item[_ngcontent-%COMP%]:active{color:#fff;text-decoration:none;background-color:#007bff}.dropdown-item.disabled[_ngcontent-%COMP%], .dropdown-item[_ngcontent-%COMP%]:disabled{color:#6c757d;pointer-events:none;background-color:transparent}.dropdown-menu.show[_ngcontent-%COMP%]{display:block}.dropdown-header[_ngcontent-%COMP%]{display:block;padding:.5rem 1.5rem;margin-bottom:0;font-size:.875rem;color:#6c757d;white-space:nowrap}.dropdown-item-text[_ngcontent-%COMP%]{display:block;padding:.25rem 1.5rem;color:#212529}', "li.iti__country[_ngcontent-%COMP%]:hover{background-color:#0000000d}.iti__selected-flag.dropdown-toggle[_ngcontent-%COMP%]:after{content:none}.iti__flag-container.disabled[_ngcontent-%COMP%]{cursor:default!important}.iti.iti--allow-dropdown[_ngcontent-%COMP%]   .flag-container.disabled[_ngcontent-%COMP%]:hover   .iti__selected-flag[_ngcontent-%COMP%]{background:none}.iti__dropdown-content[_ngcontent-%COMP%]{border:1px solid #ccc;width:fit-content;padding:1px;border-collapse:collapse}.search-container[_ngcontent-%COMP%]{position:relative}.search-container[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]{width:100%;border:none;border-bottom:1px solid #ccc;padding-left:10px}.search-icon[_ngcontent-%COMP%]{position:absolute;z-index:2;width:25px;margin:1px 10px}.iti__country-list[_ngcontent-%COMP%]{position:relative;border:none}.iti[_ngcontent-%COMP%]   input#country-search-box[_ngcontent-%COMP%]{padding-left:6px}.iti[_ngcontent-%COMP%]   .selected-dial-code[_ngcontent-%COMP%]{margin-left:6px}.iti.separate-dial-code[_ngcontent-%COMP%]   .iti__selected-flag[_ngcontent-%COMP%], .iti.separate-dial-code.iti--allow-dropdown.iti-sdc-2[_ngcontent-%COMP%]   .iti__selected-flag[_ngcontent-%COMP%], .iti.separate-dial-code.iti--allow-dropdown.iti-sdc-3[_ngcontent-%COMP%]   .iti__selected-flag[_ngcontent-%COMP%], .iti.separate-dial-code.iti--allow-dropdown.iti-sdc-4[_ngcontent-%COMP%]   .iti__selected-flag[_ngcontent-%COMP%]{width:93px}.iti.separate-dial-code[_ngcontent-%COMP%]   input[_ngcontent-%COMP%], .iti.separate-dial-code.iti--allow-dropdown.iti-sdc-2[_ngcontent-%COMP%]   input[_ngcontent-%COMP%], .iti.separate-dial-code.iti--allow-dropdown.iti-sdc-3[_ngcontent-%COMP%]   input[_ngcontent-%COMP%], .iti.separate-dial-code.iti--allow-dropdown.iti-sdc-4[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]{padding-left:98px}"]
    });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NgxIntlTelInputComponent, [{
    type: Component,
    args: [{
      selector: "ngx-intl-tel-input",
      providers: [CountryCode, {
        provide: NG_VALUE_ACCESSOR,
        // tslint:disable-next-line:no-forward-ref
        useExisting: forwardRef(() => NgxIntlTelInputComponent),
        multi: true
      }, {
        provide: NG_VALIDATORS,
        useValue: phoneNumberValidator,
        multi: true
      }],
      template: `<div class="iti iti--allow-dropdown" [ngClass]="separateDialCodeClass">
  <div
    class="iti__flag-container"
    dropdown
    [ngClass]="{ disabled: disabled }"
    [isDisabled]="disabled"
  >
    <div class="iti__selected-flag dropdown-toggle" dropdownToggle>
      <div class="iti__flag" [ngClass]="selectedCountry.flagClass || ''"></div>
      <div *ngIf="separateDialCode" class="selected-dial-code">+{{ selectedCountry.dialCode }}</div>
      <div class="iti__arrow"></div>
    </div>
    <div *dropdownMenu class="dropdown-menu iti__dropdown-content">
      <div class="search-container" *ngIf="searchCountryFlag && searchCountryField">
        <input
          id="country-search-box"
          [(ngModel)]="countrySearchText"
          (keyup)="searchCountry()"
          (click)="$event.stopPropagation()"
          [placeholder]="searchCountryPlaceholder"
          autofocus
        />
      </div>
      <ul class="iti__country-list" #countryList>
        <li
          class="iti__country iti__preferred"
          *ngFor="let country of preferredCountriesInDropDown"
          (click)="onCountrySelect(country, focusable)"
          [id]="country.htmlId + '-preferred'"
        >
          <div class="iti__flag-box">
            <div class="iti__flag" [ngClass]="country.flagClass"></div>
          </div>
          <span class="iti__country-name">{{ country.name }}</span>
          <span class="iti__dial-code">+{{ country.dialCode }}</span>
        </li>
        <li class="iti__divider" *ngIf="preferredCountriesInDropDown?.length"></li>
        <li
          class="iti__country iti__standard"
          *ngFor="let country of allCountries"
          (click)="onCountrySelect(country, focusable)"
          [id]="country.htmlId"
        >
          <div class="iti__flag-box">
            <div class="iti__flag" [ngClass]="country.flagClass"></div>
          </div>
          <span class="iti__country-name">{{ country.name }}</span>
          <span class="iti__dial-code">+{{ country.dialCode }}</span>
        </li>
      </ul>
    </div>
  </div>
  <input
    type="tel"
    [id]="inputId"
    autocomplete="off"
    class="iti__tel-input"
    [ngClass]="cssClass"
    (blur)="onTouched()"
    (keypress)="onInputKeyPress($event)"
    [(ngModel)]="phoneNumber"
    (ngModelChange)="onPhoneNumberChange()"
    [disabled]="disabled"
    [placeholder]="resolvePlaceholder()"
    [attr.maxLength]="maxLength"
    [attr.validation]="phoneValidation"
    #focusable
  />
</div>
`,
      styles: ['.dropup,.dropright,.dropdown,.dropleft{position:relative}.dropdown-toggle{white-space:nowrap}.dropdown-toggle:after{display:inline-block;margin-left:.255em;vertical-align:.255em;content:"";border-top:.3em solid;border-right:.3em solid transparent;border-bottom:0;border-left:.3em solid transparent}.dropdown-toggle:empty:after{margin-left:0}.dropdown-menu{position:absolute;top:100%;left:0;z-index:1000;display:none;float:left;min-width:10rem;padding:.5rem 0;margin:.125rem 0 0;font-size:1rem;color:#212529;text-align:left;list-style:none;background-color:#fff;background-clip:padding-box;border:1px solid rgba(0,0,0,.15);border-radius:.25rem}.dropdown-menu-left{right:auto;left:0}.dropdown-menu-right{right:0;left:auto}@media (min-width: 576px){.dropdown-menu-sm-left{right:auto;left:0}.dropdown-menu-sm-right{right:0;left:auto}}@media (min-width: 768px){.dropdown-menu-md-left{right:auto;left:0}.dropdown-menu-md-right{right:0;left:auto}}@media (min-width: 992px){.dropdown-menu-lg-left{right:auto;left:0}.dropdown-menu-lg-right{right:0;left:auto}}@media (min-width: 1200px){.dropdown-menu-xl-left{right:auto;left:0}.dropdown-menu-xl-right{right:0;left:auto}}.dropup .dropdown-menu{top:auto;bottom:100%;margin-top:0;margin-bottom:.125rem}.dropup .dropdown-toggle:after{display:inline-block;margin-left:.255em;vertical-align:.255em;content:"";border-top:0;border-right:.3em solid transparent;border-bottom:.3em solid;border-left:.3em solid transparent}.dropup .dropdown-toggle:empty:after{margin-left:0}.dropright .dropdown-menu{top:0;right:auto;left:100%;margin-top:0;margin-left:.125rem}.dropright .dropdown-toggle:after{display:inline-block;margin-left:.255em;vertical-align:.255em;content:"";border-top:.3em solid transparent;border-right:0;border-bottom:.3em solid transparent;border-left:.3em solid}.dropright .dropdown-toggle:empty:after{margin-left:0}.dropright .dropdown-toggle:after{vertical-align:0}.dropleft .dropdown-menu{top:0;right:100%;left:auto;margin-top:0;margin-right:.125rem}.dropleft .dropdown-toggle:after{display:inline-block;margin-left:.255em;vertical-align:.255em;content:""}.dropleft .dropdown-toggle:after{display:none}.dropleft .dropdown-toggle:before{display:inline-block;margin-right:.255em;vertical-align:.255em;content:"";border-top:.3em solid transparent;border-right:.3em solid;border-bottom:.3em solid transparent}.dropleft .dropdown-toggle:empty:after{margin-left:0}.dropleft .dropdown-toggle:before{vertical-align:0}.dropdown-menu[x-placement^=top],.dropdown-menu[x-placement^=right],.dropdown-menu[x-placement^=bottom],.dropdown-menu[x-placement^=left]{right:auto;bottom:auto}.dropdown-divider{height:0;margin:.5rem 0;overflow:hidden;border-top:1px solid #e9ecef}.dropdown-item{display:block;width:100%;padding:.25rem 1.5rem;clear:both;font-weight:400;color:#212529;text-align:inherit;white-space:nowrap;background-color:transparent;border:0}.dropdown-item:hover,.dropdown-item:focus{color:#16181b;text-decoration:none;background-color:#f8f9fa}.dropdown-item.active,.dropdown-item:active{color:#fff;text-decoration:none;background-color:#007bff}.dropdown-item.disabled,.dropdown-item:disabled{color:#6c757d;pointer-events:none;background-color:transparent}.dropdown-menu.show{display:block}.dropdown-header{display:block;padding:.5rem 1.5rem;margin-bottom:0;font-size:.875rem;color:#6c757d;white-space:nowrap}.dropdown-item-text{display:block;padding:.25rem 1.5rem;color:#212529}\n', "li.iti__country:hover{background-color:#0000000d}.iti__selected-flag.dropdown-toggle:after{content:none}.iti__flag-container.disabled{cursor:default!important}.iti.iti--allow-dropdown .flag-container.disabled:hover .iti__selected-flag{background:none}.iti__dropdown-content{border:1px solid #ccc;width:fit-content;padding:1px;border-collapse:collapse}.search-container{position:relative}.search-container input{width:100%;border:none;border-bottom:1px solid #ccc;padding-left:10px}.search-icon{position:absolute;z-index:2;width:25px;margin:1px 10px}.iti__country-list{position:relative;border:none}.iti input#country-search-box{padding-left:6px}.iti .selected-dial-code{margin-left:6px}.iti.separate-dial-code .iti__selected-flag,.iti.separate-dial-code.iti--allow-dropdown.iti-sdc-2 .iti__selected-flag,.iti.separate-dial-code.iti--allow-dropdown.iti-sdc-3 .iti__selected-flag,.iti.separate-dial-code.iti--allow-dropdown.iti-sdc-4 .iti__selected-flag{width:93px}.iti.separate-dial-code input,.iti.separate-dial-code.iti--allow-dropdown.iti-sdc-2 input,.iti.separate-dial-code.iti--allow-dropdown.iti-sdc-3 input,.iti.separate-dial-code.iti--allow-dropdown.iti-sdc-4 input{padding-left:98px}\n"]
    }]
  }], () => [{
    type: CountryCode
  }], {
    value: [{
      type: Input
    }],
    preferredCountries: [{
      type: Input
    }],
    enablePlaceholder: [{
      type: Input
    }],
    customPlaceholder: [{
      type: Input
    }],
    numberFormat: [{
      type: Input
    }],
    cssClass: [{
      type: Input
    }],
    onlyCountries: [{
      type: Input
    }],
    enableAutoCountrySelect: [{
      type: Input
    }],
    searchCountryFlag: [{
      type: Input
    }],
    searchCountryField: [{
      type: Input
    }],
    searchCountryPlaceholder: [{
      type: Input
    }],
    maxLength: [{
      type: Input
    }],
    selectFirstCountry: [{
      type: Input
    }],
    selectedCountryISO: [{
      type: Input
    }],
    phoneValidation: [{
      type: Input
    }],
    inputId: [{
      type: Input
    }],
    separateDialCode: [{
      type: Input
    }],
    countryChange: [{
      type: Output
    }],
    countryList: [{
      type: ViewChild,
      args: ["countryList"]
    }]
  });
})();
var dropdownModuleForRoot = BsDropdownModule.forRoot();
var NgxIntlTelInputModule = class _NgxIntlTelInputModule {
  static {
    this.ɵfac = function NgxIntlTelInputModule_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || _NgxIntlTelInputModule)();
    };
  }
  static {
    this.ɵmod = ɵɵdefineNgModule({
      type: _NgxIntlTelInputModule,
      declarations: [NgxIntlTelInputComponent, NativeElementInjectorDirective],
      imports: [CommonModule, FormsModule, ReactiveFormsModule, BsDropdownModule],
      exports: [NgxIntlTelInputComponent, NativeElementInjectorDirective]
    });
  }
  static {
    this.ɵinj = ɵɵdefineInjector({
      imports: [CommonModule, FormsModule, ReactiveFormsModule, dropdownModuleForRoot]
    });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NgxIntlTelInputModule, [{
    type: NgModule,
    args: [{
      declarations: [NgxIntlTelInputComponent, NativeElementInjectorDirective],
      imports: [CommonModule, FormsModule, ReactiveFormsModule, dropdownModuleForRoot],
      exports: [NgxIntlTelInputComponent, NativeElementInjectorDirective]
    }]
  }], null, null);
})();
export {
  CountryISO,
  NativeElementInjectorDirective,
  NgxIntlTelInputComponent,
  NgxIntlTelInputModule,
  PhoneNumberFormat2 as PhoneNumberFormat,
  SearchCountryField,
  dropdownModuleForRoot
};
/*! Bundled license information:

ngx-bootstrap/utils/fesm2022/ngx-bootstrap-utils.mjs:
  (**
   * @license
   * Copyright Google Inc. All Rights Reserved.
   *
   * Use of this source code is governed by an MIT-style license that can be
   * found in the LICENSE file at https://angular.io/license
   *)
*/
//# sourceMappingURL=ngx-intl-tel-input.js.map
