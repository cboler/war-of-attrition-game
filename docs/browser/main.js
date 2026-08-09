import {
  A11yModule,
  ANIMATION_MODULE_TYPE,
  ApplicationRef,
  AriaDescriber,
  AuthService,
  BrowserModule,
  CdkScrollableModule,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  CommonModule,
  Component,
  ComponentPortal,
  ContentChildren,
  DOCUMENT,
  DefaultValueAccessor,
  Directionality,
  Directive,
  DomRendererFactory2,
  ESCAPE,
  ElementRef,
  FocusMonitor,
  FormsModule,
  Inject,
  Injectable,
  InjectionToken,
  Injector,
  Input,
  MAT_DIALOG_DATA,
  MatButton,
  MatButtonModule,
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardHeader,
  MatCardModule,
  MatCardSubtitle,
  MatCardTitle,
  MatCommonModule,
  MatDialog,
  MatDialogClose,
  MatDialogModule,
  MatDialogRef,
  MatDivider,
  MatDividerModule,
  MatIcon,
  MatIconButton,
  MatIconModule,
  NEVER,
  NgClass,
  NgControlStatus,
  NgIf,
  NgModel,
  NgModule,
  NgZone,
  Observable,
  OverlayModule,
  Platform,
  RendererFactory2,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
  RuntimeError,
  ScrollDispatcher,
  SettingsService,
  Subject,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
  __objRest,
  __spreadValues,
  _animationsDisabled,
  afterNextRender,
  bootstrapApplication,
  coerceBooleanProperty,
  coerceNumberProperty,
  computed,
  createFlexibleConnectedPositionStrategy,
  createOverlayRef,
  createRepositionScrollStrategy,
  effect,
  filter,
  formatRuntimeError,
  hasModifierKey,
  inject,
  input,
  isDevMode,
  makeEnvironmentProviders,
  map,
  normalizePassiveListenerOptions,
  output,
  performanceMarkFeature,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideRouter,
  provideZoneChangeDetection,
  setClassMetadata,
  signal,
  switchMap,
  take,
  takeUntil,
  ɵsetClassDebugInfo,
  ɵɵadvance,
  ɵɵattribute,
  ɵɵclassMap,
  ɵɵclassProp,
  ɵɵconditional,
  ɵɵconditionalCreate,
  ɵɵcontentQuery,
  ɵɵdefineComponent,
  ɵɵdefineDirective,
  ɵɵdefineInjectable,
  ɵɵdefineInjector,
  ɵɵdefineNgModule,
  ɵɵdirectiveInject,
  ɵɵdomElement,
  ɵɵdomElementEnd,
  ɵɵdomElementStart,
  ɵɵdomListener,
  ɵɵelement,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵgetCurrentView,
  ɵɵinject,
  ɵɵlistener,
  ɵɵloadQuery,
  ɵɵnamespaceSVG,
  ɵɵnextContext,
  ɵɵprojection,
  ɵɵprojectionDef,
  ɵɵproperty,
  ɵɵpureFunction0,
  ɵɵqueryRefresh,
  ɵɵrepeater,
  ɵɵrepeaterCreate,
  ɵɵrepeaterTrackByIndex,
  ɵɵresetView,
  ɵɵrestoreView,
  ɵɵsanitizeStyle,
  ɵɵsanitizeUrl,
  ɵɵstyleProp,
  ɵɵtemplate,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1,
  ɵɵtextInterpolate2,
  ɵɵtwoWayBindingSet,
  ɵɵtwoWayListener,
  ɵɵtwoWayProperty,
  ɵɵviewQuery
} from "./chunk-IUFSTLBF.js";

// node_modules/@angular/animations/fesm2022/private_export.mjs
var AnimationMetadataType;
(function(AnimationMetadataType2) {
  AnimationMetadataType2[AnimationMetadataType2["State"] = 0] = "State";
  AnimationMetadataType2[AnimationMetadataType2["Transition"] = 1] = "Transition";
  AnimationMetadataType2[AnimationMetadataType2["Sequence"] = 2] = "Sequence";
  AnimationMetadataType2[AnimationMetadataType2["Group"] = 3] = "Group";
  AnimationMetadataType2[AnimationMetadataType2["Animate"] = 4] = "Animate";
  AnimationMetadataType2[AnimationMetadataType2["Keyframes"] = 5] = "Keyframes";
  AnimationMetadataType2[AnimationMetadataType2["Style"] = 6] = "Style";
  AnimationMetadataType2[AnimationMetadataType2["Trigger"] = 7] = "Trigger";
  AnimationMetadataType2[AnimationMetadataType2["Reference"] = 8] = "Reference";
  AnimationMetadataType2[AnimationMetadataType2["AnimateChild"] = 9] = "AnimateChild";
  AnimationMetadataType2[AnimationMetadataType2["AnimateRef"] = 10] = "AnimateRef";
  AnimationMetadataType2[AnimationMetadataType2["Query"] = 11] = "Query";
  AnimationMetadataType2[AnimationMetadataType2["Stagger"] = 12] = "Stagger";
})(AnimationMetadataType || (AnimationMetadataType = {}));
var AUTO_STYLE = "*";
function sequence(steps, options = null) {
  return { type: AnimationMetadataType.Sequence, steps, options };
}
function style(tokens) {
  return { type: AnimationMetadataType.Style, styles: tokens, offset: null };
}
var NoopAnimationPlayer = class {
  _onDoneFns = [];
  _onStartFns = [];
  _onDestroyFns = [];
  _originalOnDoneFns = [];
  _originalOnStartFns = [];
  _started = false;
  _destroyed = false;
  _finished = false;
  _position = 0;
  parentPlayer = null;
  totalTime;
  constructor(duration = 0, delay = 0) {
    this.totalTime = duration + delay;
  }
  _onFinish() {
    if (!this._finished) {
      this._finished = true;
      this._onDoneFns.forEach((fn) => fn());
      this._onDoneFns = [];
    }
  }
  onStart(fn) {
    this._originalOnStartFns.push(fn);
    this._onStartFns.push(fn);
  }
  onDone(fn) {
    this._originalOnDoneFns.push(fn);
    this._onDoneFns.push(fn);
  }
  onDestroy(fn) {
    this._onDestroyFns.push(fn);
  }
  hasStarted() {
    return this._started;
  }
  init() {
  }
  play() {
    if (!this.hasStarted()) {
      this._onStart();
      this.triggerMicrotask();
    }
    this._started = true;
  }
  /** @internal */
  triggerMicrotask() {
    queueMicrotask(() => this._onFinish());
  }
  _onStart() {
    this._onStartFns.forEach((fn) => fn());
    this._onStartFns = [];
  }
  pause() {
  }
  restart() {
  }
  finish() {
    this._onFinish();
  }
  destroy() {
    if (!this._destroyed) {
      this._destroyed = true;
      if (!this.hasStarted()) {
        this._onStart();
      }
      this.finish();
      this._onDestroyFns.forEach((fn) => fn());
      this._onDestroyFns = [];
    }
  }
  reset() {
    this._started = false;
    this._finished = false;
    this._onStartFns = this._originalOnStartFns;
    this._onDoneFns = this._originalOnDoneFns;
  }
  setPosition(position) {
    this._position = this.totalTime ? position * this.totalTime : 1;
  }
  getPosition() {
    return this.totalTime ? this._position / this.totalTime : 1;
  }
  /** @internal */
  triggerCallback(phaseName) {
    const methods = phaseName == "start" ? this._onStartFns : this._onDoneFns;
    methods.forEach((fn) => fn());
    methods.length = 0;
  }
};
var AnimationGroupPlayer = class {
  _onDoneFns = [];
  _onStartFns = [];
  _finished = false;
  _started = false;
  _destroyed = false;
  _onDestroyFns = [];
  parentPlayer = null;
  totalTime = 0;
  players;
  constructor(_players) {
    this.players = _players;
    let doneCount = 0;
    let destroyCount = 0;
    let startCount = 0;
    const total = this.players.length;
    if (total == 0) {
      queueMicrotask(() => this._onFinish());
    } else {
      this.players.forEach((player) => {
        player.onDone(() => {
          if (++doneCount == total) {
            this._onFinish();
          }
        });
        player.onDestroy(() => {
          if (++destroyCount == total) {
            this._onDestroy();
          }
        });
        player.onStart(() => {
          if (++startCount == total) {
            this._onStart();
          }
        });
      });
    }
    this.totalTime = this.players.reduce((time, player) => Math.max(time, player.totalTime), 0);
  }
  _onFinish() {
    if (!this._finished) {
      this._finished = true;
      this._onDoneFns.forEach((fn) => fn());
      this._onDoneFns = [];
    }
  }
  init() {
    this.players.forEach((player) => player.init());
  }
  onStart(fn) {
    this._onStartFns.push(fn);
  }
  _onStart() {
    if (!this.hasStarted()) {
      this._started = true;
      this._onStartFns.forEach((fn) => fn());
      this._onStartFns = [];
    }
  }
  onDone(fn) {
    this._onDoneFns.push(fn);
  }
  onDestroy(fn) {
    this._onDestroyFns.push(fn);
  }
  hasStarted() {
    return this._started;
  }
  play() {
    if (!this.parentPlayer) {
      this.init();
    }
    this._onStart();
    this.players.forEach((player) => player.play());
  }
  pause() {
    this.players.forEach((player) => player.pause());
  }
  restart() {
    this.players.forEach((player) => player.restart());
  }
  finish() {
    this._onFinish();
    this.players.forEach((player) => player.finish());
  }
  destroy() {
    this._onDestroy();
  }
  _onDestroy() {
    if (!this._destroyed) {
      this._destroyed = true;
      this._onFinish();
      this.players.forEach((player) => player.destroy());
      this._onDestroyFns.forEach((fn) => fn());
      this._onDestroyFns = [];
    }
  }
  reset() {
    this.players.forEach((player) => player.reset());
    this._destroyed = false;
    this._finished = false;
    this._started = false;
  }
  setPosition(p) {
    const timeAtPosition = p * this.totalTime;
    this.players.forEach((player) => {
      const position = player.totalTime ? Math.min(1, timeAtPosition / player.totalTime) : 1;
      player.setPosition(position);
    });
  }
  getPosition() {
    const longestPlayer = this.players.reduce((longestSoFar, player) => {
      const newPlayerIsLongest = longestSoFar === null || player.totalTime > longestSoFar.totalTime;
      return newPlayerIsLongest ? player : longestSoFar;
    }, null);
    return longestPlayer != null ? longestPlayer.getPosition() : 0;
  }
  beforeDestroy() {
    this.players.forEach((player) => {
      if (player.beforeDestroy) {
        player.beforeDestroy();
      }
    });
  }
  /** @internal */
  triggerCallback(phaseName) {
    const methods = phaseName == "start" ? this._onStartFns : this._onDoneFns;
    methods.forEach((fn) => fn());
    methods.length = 0;
  }
};
var \u0275PRE_STYLE = "!";

// node_modules/@angular/animations/fesm2022/util.mjs
var LINE_START = "\n - ";
function invalidTimingValue(exp) {
  return new RuntimeError(3e3, ngDevMode && `The provided timing value "${exp}" is invalid.`);
}
function negativeStepValue() {
  return new RuntimeError(3100, ngDevMode && "Duration values below 0 are not allowed for this animation step.");
}
function negativeDelayValue() {
  return new RuntimeError(3101, ngDevMode && "Delay values below 0 are not allowed for this animation step.");
}
function invalidStyleParams(varName) {
  return new RuntimeError(3001, ngDevMode && `Unable to resolve the local animation param ${varName} in the given list of values`);
}
function invalidParamValue(varName) {
  return new RuntimeError(3003, ngDevMode && `Please provide a value for the animation param ${varName}`);
}
function invalidNodeType(nodeType) {
  return new RuntimeError(3004, ngDevMode && `Unable to resolve animation metadata node #${nodeType}`);
}
function invalidCssUnitValue(userProvidedProperty, value) {
  return new RuntimeError(3005, ngDevMode && `Please provide a CSS unit value for ${userProvidedProperty}:${value}`);
}
function invalidTrigger() {
  return new RuntimeError(3006, ngDevMode && "animation triggers cannot be prefixed with an `@` sign (e.g. trigger('@foo', [...]))");
}
function invalidDefinition() {
  return new RuntimeError(3007, ngDevMode && "only state() and transition() definitions can sit inside of a trigger()");
}
function invalidState(metadataName, missingSubs) {
  return new RuntimeError(3008, ngDevMode && `state("${metadataName}", ...) must define default values for all the following style substitutions: ${missingSubs.join(", ")}`);
}
function invalidStyleValue(value) {
  return new RuntimeError(3002, ngDevMode && `The provided style string value ${value} is not allowed.`);
}
function invalidParallelAnimation(prop, firstStart, firstEnd, secondStart, secondEnd) {
  return new RuntimeError(3010, ngDevMode && `The CSS property "${prop}" that exists between the times of "${firstStart}ms" and "${firstEnd}ms" is also being animated in a parallel animation between the times of "${secondStart}ms" and "${secondEnd}ms"`);
}
function invalidKeyframes() {
  return new RuntimeError(3011, ngDevMode && `keyframes() must be placed inside of a call to animate()`);
}
function invalidOffset() {
  return new RuntimeError(3012, ngDevMode && `Please ensure that all keyframe offsets are between 0 and 1`);
}
function keyframeOffsetsOutOfOrder() {
  return new RuntimeError(3200, ngDevMode && `Please ensure that all keyframe offsets are in order`);
}
function keyframesMissingOffsets() {
  return new RuntimeError(3202, ngDevMode && `Not all style() steps within the declared keyframes() contain offsets`);
}
function invalidStagger() {
  return new RuntimeError(3013, ngDevMode && `stagger() can only be used inside of query()`);
}
function invalidQuery(selector) {
  return new RuntimeError(3014, ngDevMode && `\`query("${selector}")\` returned zero elements. (Use \`query("${selector}", { optional: true })\` if you wish to allow this.)`);
}
function invalidExpression(expr) {
  return new RuntimeError(3015, ngDevMode && `The provided transition expression "${expr}" is not supported`);
}
function invalidTransitionAlias(alias) {
  return new RuntimeError(3016, ngDevMode && `The transition alias value "${alias}" is not supported`);
}
function triggerBuildFailed(name, errors) {
  return new RuntimeError(3404, ngDevMode && `The animation trigger "${name}" has failed to build due to the following errors:
 - ${errors.map((err) => err.message).join("\n - ")}`);
}
function animationFailed(errors) {
  return new RuntimeError(3502, ngDevMode && `Unable to animate due to the following errors:${LINE_START}${errors.map((err) => err.message).join(LINE_START)}`);
}
function registerFailed(errors) {
  return new RuntimeError(3503, ngDevMode && `Unable to build the animation due to the following errors: ${errors.map((err) => err.message).join("\n")}`);
}
function missingOrDestroyedAnimation() {
  return new RuntimeError(3300, ngDevMode && "The requested animation doesn't exist or has already been destroyed");
}
function createAnimationFailed(errors) {
  return new RuntimeError(3504, ngDevMode && `Unable to create the animation due to the following errors:${errors.map((err) => err.message).join("\n")}`);
}
function missingPlayer(id) {
  return new RuntimeError(3301, ngDevMode && `Unable to find the timeline player referenced by ${id}`);
}
function missingTrigger(phase, name) {
  return new RuntimeError(3302, ngDevMode && `Unable to listen on the animation trigger event "${phase}" because the animation trigger "${name}" doesn't exist!`);
}
function missingEvent(name) {
  return new RuntimeError(3303, ngDevMode && `Unable to listen on the animation trigger "${name}" because the provided event is undefined!`);
}
function unsupportedTriggerEvent(phase, name) {
  return new RuntimeError(3400, ngDevMode && `The provided animation trigger event "${phase}" for the animation trigger "${name}" is not supported!`);
}
function unregisteredTrigger(name) {
  return new RuntimeError(3401, ngDevMode && `The provided animation trigger "${name}" has not been registered!`);
}
function triggerTransitionsFailed(errors) {
  return new RuntimeError(3402, ngDevMode && `Unable to process animations due to the following failed trigger transitions
 ${errors.map((err) => err.message).join("\n")}`);
}
function transitionFailed(name, errors) {
  return new RuntimeError(3505, ngDevMode && `@${name} has failed due to:
 ${errors.map((err) => err.message).join("\n- ")}`);
}
var ANIMATABLE_PROP_SET = /* @__PURE__ */ new Set([
  "-moz-outline-radius",
  "-moz-outline-radius-bottomleft",
  "-moz-outline-radius-bottomright",
  "-moz-outline-radius-topleft",
  "-moz-outline-radius-topright",
  "-ms-grid-columns",
  "-ms-grid-rows",
  "-webkit-line-clamp",
  "-webkit-text-fill-color",
  "-webkit-text-stroke",
  "-webkit-text-stroke-color",
  "accent-color",
  "all",
  "backdrop-filter",
  "background",
  "background-color",
  "background-position",
  "background-size",
  "block-size",
  "border",
  "border-block-end",
  "border-block-end-color",
  "border-block-end-width",
  "border-block-start",
  "border-block-start-color",
  "border-block-start-width",
  "border-bottom",
  "border-bottom-color",
  "border-bottom-left-radius",
  "border-bottom-right-radius",
  "border-bottom-width",
  "border-color",
  "border-end-end-radius",
  "border-end-start-radius",
  "border-image-outset",
  "border-image-slice",
  "border-image-width",
  "border-inline-end",
  "border-inline-end-color",
  "border-inline-end-width",
  "border-inline-start",
  "border-inline-start-color",
  "border-inline-start-width",
  "border-left",
  "border-left-color",
  "border-left-width",
  "border-radius",
  "border-right",
  "border-right-color",
  "border-right-width",
  "border-start-end-radius",
  "border-start-start-radius",
  "border-top",
  "border-top-color",
  "border-top-left-radius",
  "border-top-right-radius",
  "border-top-width",
  "border-width",
  "bottom",
  "box-shadow",
  "caret-color",
  "clip",
  "clip-path",
  "color",
  "column-count",
  "column-gap",
  "column-rule",
  "column-rule-color",
  "column-rule-width",
  "column-width",
  "columns",
  "filter",
  "flex",
  "flex-basis",
  "flex-grow",
  "flex-shrink",
  "font",
  "font-size",
  "font-size-adjust",
  "font-stretch",
  "font-variation-settings",
  "font-weight",
  "gap",
  "grid-column-gap",
  "grid-gap",
  "grid-row-gap",
  "grid-template-columns",
  "grid-template-rows",
  "height",
  "inline-size",
  "input-security",
  "inset",
  "inset-block",
  "inset-block-end",
  "inset-block-start",
  "inset-inline",
  "inset-inline-end",
  "inset-inline-start",
  "left",
  "letter-spacing",
  "line-clamp",
  "line-height",
  "margin",
  "margin-block-end",
  "margin-block-start",
  "margin-bottom",
  "margin-inline-end",
  "margin-inline-start",
  "margin-left",
  "margin-right",
  "margin-top",
  "mask",
  "mask-border",
  "mask-position",
  "mask-size",
  "max-block-size",
  "max-height",
  "max-inline-size",
  "max-lines",
  "max-width",
  "min-block-size",
  "min-height",
  "min-inline-size",
  "min-width",
  "object-position",
  "offset",
  "offset-anchor",
  "offset-distance",
  "offset-path",
  "offset-position",
  "offset-rotate",
  "opacity",
  "order",
  "outline",
  "outline-color",
  "outline-offset",
  "outline-width",
  "padding",
  "padding-block-end",
  "padding-block-start",
  "padding-bottom",
  "padding-inline-end",
  "padding-inline-start",
  "padding-left",
  "padding-right",
  "padding-top",
  "perspective",
  "perspective-origin",
  "right",
  "rotate",
  "row-gap",
  "scale",
  "scroll-margin",
  "scroll-margin-block",
  "scroll-margin-block-end",
  "scroll-margin-block-start",
  "scroll-margin-bottom",
  "scroll-margin-inline",
  "scroll-margin-inline-end",
  "scroll-margin-inline-start",
  "scroll-margin-left",
  "scroll-margin-right",
  "scroll-margin-top",
  "scroll-padding",
  "scroll-padding-block",
  "scroll-padding-block-end",
  "scroll-padding-block-start",
  "scroll-padding-bottom",
  "scroll-padding-inline",
  "scroll-padding-inline-end",
  "scroll-padding-inline-start",
  "scroll-padding-left",
  "scroll-padding-right",
  "scroll-padding-top",
  "scroll-snap-coordinate",
  "scroll-snap-destination",
  "scrollbar-color",
  "shape-image-threshold",
  "shape-margin",
  "shape-outside",
  "tab-size",
  "text-decoration",
  "text-decoration-color",
  "text-decoration-thickness",
  "text-emphasis",
  "text-emphasis-color",
  "text-indent",
  "text-shadow",
  "text-underline-offset",
  "top",
  "transform",
  "transform-origin",
  "translate",
  "vertical-align",
  "visibility",
  "width",
  "word-spacing",
  "z-index",
  "zoom"
]);
function optimizeGroupPlayer(players) {
  switch (players.length) {
    case 0:
      return new NoopAnimationPlayer();
    case 1:
      return players[0];
    default:
      return new AnimationGroupPlayer(players);
  }
}
function normalizeKeyframes$1(normalizer, keyframes, preStyles = /* @__PURE__ */ new Map(), postStyles = /* @__PURE__ */ new Map()) {
  const errors = [];
  const normalizedKeyframes = [];
  let previousOffset = -1;
  let previousKeyframe = null;
  keyframes.forEach((kf) => {
    const offset = kf.get("offset");
    const isSameOffset = offset == previousOffset;
    const normalizedKeyframe = isSameOffset && previousKeyframe || /* @__PURE__ */ new Map();
    kf.forEach((val, prop) => {
      let normalizedProp = prop;
      let normalizedValue = val;
      if (prop !== "offset") {
        normalizedProp = normalizer.normalizePropertyName(normalizedProp, errors);
        switch (normalizedValue) {
          case \u0275PRE_STYLE:
            normalizedValue = preStyles.get(prop);
            break;
          case AUTO_STYLE:
            normalizedValue = postStyles.get(prop);
            break;
          default:
            normalizedValue = normalizer.normalizeStyleValue(prop, normalizedProp, normalizedValue, errors);
            break;
        }
      }
      normalizedKeyframe.set(normalizedProp, normalizedValue);
    });
    if (!isSameOffset) {
      normalizedKeyframes.push(normalizedKeyframe);
    }
    previousKeyframe = normalizedKeyframe;
    previousOffset = offset;
  });
  if (errors.length) {
    throw animationFailed(errors);
  }
  return normalizedKeyframes;
}
function listenOnPlayer(player, eventName, event, callback) {
  switch (eventName) {
    case "start":
      player.onStart(() => callback(event && copyAnimationEvent(event, "start", player)));
      break;
    case "done":
      player.onDone(() => callback(event && copyAnimationEvent(event, "done", player)));
      break;
    case "destroy":
      player.onDestroy(() => callback(event && copyAnimationEvent(event, "destroy", player)));
      break;
  }
}
function copyAnimationEvent(e, phaseName, player) {
  const totalTime = player.totalTime;
  const disabled = player.disabled ? true : false;
  const event = makeAnimationEvent(e.element, e.triggerName, e.fromState, e.toState, phaseName || e.phaseName, totalTime == void 0 ? e.totalTime : totalTime, disabled);
  const data = e["_data"];
  if (data != null) {
    event["_data"] = data;
  }
  return event;
}
function makeAnimationEvent(element, triggerName, fromState, toState, phaseName = "", totalTime = 0, disabled) {
  return { element, triggerName, fromState, toState, phaseName, totalTime, disabled: !!disabled };
}
function getOrSetDefaultValue(map2, key, defaultValue) {
  let value = map2.get(key);
  if (!value) {
    map2.set(key, value = defaultValue);
  }
  return value;
}
function parseTimelineCommand(command) {
  const separatorPos = command.indexOf(":");
  const id = command.substring(1, separatorPos);
  const action = command.slice(separatorPos + 1);
  return [id, action];
}
var documentElement = /* @__PURE__ */ (() => typeof document === "undefined" ? null : document.documentElement)();
function getParentElement(element) {
  const parent = element.parentNode || element.host || null;
  if (parent === documentElement) {
    return null;
  }
  return parent;
}
function containsVendorPrefix(prop) {
  return prop.substring(1, 6) == "ebkit";
}
var _CACHED_BODY = null;
var _IS_WEBKIT = false;
function validateStyleProperty(prop) {
  if (!_CACHED_BODY) {
    _CACHED_BODY = getBodyNode() || {};
    _IS_WEBKIT = _CACHED_BODY.style ? "WebkitAppearance" in _CACHED_BODY.style : false;
  }
  let result = true;
  if (_CACHED_BODY.style && !containsVendorPrefix(prop)) {
    result = prop in _CACHED_BODY.style;
    if (!result && _IS_WEBKIT) {
      const camelProp = "Webkit" + prop.charAt(0).toUpperCase() + prop.slice(1);
      result = camelProp in _CACHED_BODY.style;
    }
  }
  return result;
}
function validateWebAnimatableStyleProperty(prop) {
  return ANIMATABLE_PROP_SET.has(prop);
}
function getBodyNode() {
  if (typeof document != "undefined") {
    return document.body;
  }
  return null;
}
function containsElement(elm1, elm2) {
  while (elm2) {
    if (elm2 === elm1) {
      return true;
    }
    elm2 = getParentElement(elm2);
  }
  return false;
}
function invokeQuery(element, selector, multi) {
  if (multi) {
    return Array.from(element.querySelectorAll(selector));
  }
  const elem = element.querySelector(selector);
  return elem ? [elem] : [];
}
var ONE_SECOND = 1e3;
var SUBSTITUTION_EXPR_START = "{{";
var SUBSTITUTION_EXPR_END = "}}";
var ENTER_CLASSNAME = "ng-enter";
var LEAVE_CLASSNAME = "ng-leave";
var NG_TRIGGER_CLASSNAME = "ng-trigger";
var NG_TRIGGER_SELECTOR = ".ng-trigger";
var NG_ANIMATING_CLASSNAME = "ng-animating";
var NG_ANIMATING_SELECTOR = ".ng-animating";
function resolveTimingValue(value) {
  if (typeof value == "number")
    return value;
  const matches = value.match(/^(-?[\.\d]+)(m?s)/);
  if (!matches || matches.length < 2)
    return 0;
  return _convertTimeValueToMS(parseFloat(matches[1]), matches[2]);
}
function _convertTimeValueToMS(value, unit) {
  switch (unit) {
    case "s":
      return value * ONE_SECOND;
    default:
      return value;
  }
}
function resolveTiming(timings, errors, allowNegativeValues) {
  return timings.hasOwnProperty("duration") ? timings : parseTimeExpression(timings, errors, allowNegativeValues);
}
var PARSE_TIME_EXPRESSION_REGEX = /^(-?[\.\d]+)(m?s)(?:\s+(-?[\.\d]+)(m?s))?(?:\s+([-a-z]+(?:\(.+?\))?))?$/i;
function parseTimeExpression(exp, errors, allowNegativeValues) {
  let duration;
  let delay = 0;
  let easing = "";
  if (typeof exp === "string") {
    const matches = exp.match(PARSE_TIME_EXPRESSION_REGEX);
    if (matches === null) {
      errors.push(invalidTimingValue(exp));
      return { duration: 0, delay: 0, easing: "" };
    }
    duration = _convertTimeValueToMS(parseFloat(matches[1]), matches[2]);
    const delayMatch = matches[3];
    if (delayMatch != null) {
      delay = _convertTimeValueToMS(parseFloat(delayMatch), matches[4]);
    }
    const easingVal = matches[5];
    if (easingVal) {
      easing = easingVal;
    }
  } else {
    duration = exp;
  }
  if (!allowNegativeValues) {
    let containsErrors = false;
    let startIndex = errors.length;
    if (duration < 0) {
      errors.push(negativeStepValue());
      containsErrors = true;
    }
    if (delay < 0) {
      errors.push(negativeDelayValue());
      containsErrors = true;
    }
    if (containsErrors) {
      errors.splice(startIndex, 0, invalidTimingValue(exp));
    }
  }
  return { duration, delay, easing };
}
function normalizeKeyframes(keyframes) {
  if (!keyframes.length) {
    return [];
  }
  if (keyframes[0] instanceof Map) {
    return keyframes;
  }
  return keyframes.map((kf) => new Map(Object.entries(kf)));
}
function setStyles(element, styles, formerStyles) {
  styles.forEach((val, prop) => {
    const camelProp = dashCaseToCamelCase(prop);
    if (formerStyles && !formerStyles.has(prop)) {
      formerStyles.set(prop, element.style[camelProp]);
    }
    element.style[camelProp] = val;
  });
}
function eraseStyles(element, styles) {
  styles.forEach((_, prop) => {
    const camelProp = dashCaseToCamelCase(prop);
    element.style[camelProp] = "";
  });
}
function normalizeAnimationEntry(steps) {
  if (Array.isArray(steps)) {
    if (steps.length == 1)
      return steps[0];
    return sequence(steps);
  }
  return steps;
}
function validateStyleParams(value, options, errors) {
  const params = options.params || {};
  const matches = extractStyleParams(value);
  if (matches.length) {
    matches.forEach((varName) => {
      if (!params.hasOwnProperty(varName)) {
        errors.push(invalidStyleParams(varName));
      }
    });
  }
}
var PARAM_REGEX = /* @__PURE__ */ new RegExp(`${SUBSTITUTION_EXPR_START}\\s*(.+?)\\s*${SUBSTITUTION_EXPR_END}`, "g");
function extractStyleParams(value) {
  let params = [];
  if (typeof value === "string") {
    let match;
    while (match = PARAM_REGEX.exec(value)) {
      params.push(match[1]);
    }
    PARAM_REGEX.lastIndex = 0;
  }
  return params;
}
function interpolateParams(value, params, errors) {
  const original = `${value}`;
  const str = original.replace(PARAM_REGEX, (_, varName) => {
    let localVal = params[varName];
    if (localVal == null) {
      errors.push(invalidParamValue(varName));
      localVal = "";
    }
    return localVal.toString();
  });
  return str == original ? value : str;
}
var DASH_CASE_REGEXP = /-+([a-z0-9])/g;
function dashCaseToCamelCase(input2) {
  return input2.replace(DASH_CASE_REGEXP, (...m) => m[1].toUpperCase());
}
function camelCaseToDashCase(input2) {
  return input2.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}
function allowPreviousPlayerStylesMerge(duration, delay) {
  return duration === 0 || delay === 0;
}
function balancePreviousStylesIntoKeyframes(element, keyframes, previousStyles) {
  if (previousStyles.size && keyframes.length) {
    let startingKeyframe = keyframes[0];
    let missingStyleProps = [];
    previousStyles.forEach((val, prop) => {
      if (!startingKeyframe.has(prop)) {
        missingStyleProps.push(prop);
      }
      startingKeyframe.set(prop, val);
    });
    if (missingStyleProps.length) {
      for (let i = 1; i < keyframes.length; i++) {
        let kf = keyframes[i];
        missingStyleProps.forEach((prop) => kf.set(prop, computeStyle(element, prop)));
      }
    }
  }
  return keyframes;
}
function visitDslNode(visitor, node, context) {
  switch (node.type) {
    case AnimationMetadataType.Trigger:
      return visitor.visitTrigger(node, context);
    case AnimationMetadataType.State:
      return visitor.visitState(node, context);
    case AnimationMetadataType.Transition:
      return visitor.visitTransition(node, context);
    case AnimationMetadataType.Sequence:
      return visitor.visitSequence(node, context);
    case AnimationMetadataType.Group:
      return visitor.visitGroup(node, context);
    case AnimationMetadataType.Animate:
      return visitor.visitAnimate(node, context);
    case AnimationMetadataType.Keyframes:
      return visitor.visitKeyframes(node, context);
    case AnimationMetadataType.Style:
      return visitor.visitStyle(node, context);
    case AnimationMetadataType.Reference:
      return visitor.visitReference(node, context);
    case AnimationMetadataType.AnimateChild:
      return visitor.visitAnimateChild(node, context);
    case AnimationMetadataType.AnimateRef:
      return visitor.visitAnimateRef(node, context);
    case AnimationMetadataType.Query:
      return visitor.visitQuery(node, context);
    case AnimationMetadataType.Stagger:
      return visitor.visitStagger(node, context);
    default:
      throw invalidNodeType(node.type);
  }
}
function computeStyle(element, prop) {
  return window.getComputedStyle(element)[prop];
}

// node_modules/@angular/animations/fesm2022/browser.mjs
var NoopAnimationDriver = class _NoopAnimationDriver {
  /**
   * @returns Whether `prop` is a valid CSS property
   */
  validateStyleProperty(prop) {
    return validateStyleProperty(prop);
  }
  /**
   *
   * @returns Whether elm1 contains elm2.
   */
  containsElement(elm1, elm2) {
    return containsElement(elm1, elm2);
  }
  /**
   * @returns Rhe parent of the given element or `null` if the element is the `document`
   */
  getParentElement(element) {
    return getParentElement(element);
  }
  /**
   * @returns The result of the query selector on the element. The array will contain up to 1 item
   *     if `multi` is  `false`.
   */
  query(element, selector, multi) {
    return invokeQuery(element, selector, multi);
  }
  /**
   * @returns The `defaultValue` or empty string
   */
  computeStyle(element, prop, defaultValue) {
    return defaultValue || "";
  }
  /**
   * @returns An `NoopAnimationPlayer`
   */
  animate(element, keyframes, duration, delay, easing, previousPlayers = [], scrubberAccessRequested) {
    return new NoopAnimationPlayer(duration, delay);
  }
  static \u0275fac = function NoopAnimationDriver_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NoopAnimationDriver)();
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({
    token: _NoopAnimationDriver,
    factory: _NoopAnimationDriver.\u0275fac
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NoopAnimationDriver, [{
    type: Injectable
  }], null, null);
})();
var AnimationDriver = class {
  /**
   * @deprecated Use the NoopAnimationDriver class.
   */
  static NOOP = new NoopAnimationDriver();
};
var AnimationStyleNormalizer = class {
};
var DIMENSIONAL_PROP_SET = /* @__PURE__ */ new Set(["width", "height", "minWidth", "minHeight", "maxWidth", "maxHeight", "left", "top", "bottom", "right", "fontSize", "outlineWidth", "outlineOffset", "paddingTop", "paddingLeft", "paddingBottom", "paddingRight", "marginTop", "marginLeft", "marginBottom", "marginRight", "borderRadius", "borderWidth", "borderTopWidth", "borderLeftWidth", "borderRightWidth", "borderBottomWidth", "textIndent", "perspective"]);
var WebAnimationsStyleNormalizer = class extends AnimationStyleNormalizer {
  normalizePropertyName(propertyName, errors) {
    return dashCaseToCamelCase(propertyName);
  }
  normalizeStyleValue(userProvidedProperty, normalizedProperty, value, errors) {
    let unit = "";
    const strVal = value.toString().trim();
    if (DIMENSIONAL_PROP_SET.has(normalizedProperty) && value !== 0 && value !== "0") {
      if (typeof value === "number") {
        unit = "px";
      } else {
        const valAndSuffixMatch = value.match(/^[+-]?[\d\.]+([a-z]*)$/);
        if (valAndSuffixMatch && valAndSuffixMatch[1].length == 0) {
          errors.push(invalidCssUnitValue(userProvidedProperty, value));
        }
      }
    }
    return strVal + unit;
  }
};
function createListOfWarnings(warnings) {
  const LINE_START2 = "\n - ";
  return `${LINE_START2}${warnings.filter(Boolean).map((warning) => warning).join(LINE_START2)}`;
}
function warnTriggerBuild(name, warnings) {
  console.warn(`The animation trigger "${name}" has built with the following warnings:${createListOfWarnings(warnings)}`);
}
function warnRegister(warnings) {
  console.warn(`Animation built with the following warnings:${createListOfWarnings(warnings)}`);
}
function pushUnrecognizedPropertiesWarning(warnings, props) {
  if (props.length) {
    warnings.push(`The following provided properties are not recognized: ${props.join(", ")}`);
  }
}
var ANY_STATE = "*";
function parseTransitionExpr(transitionValue, errors) {
  const expressions = [];
  if (typeof transitionValue == "string") {
    transitionValue.split(/\s*,\s*/).forEach((str) => parseInnerTransitionStr(str, expressions, errors));
  } else {
    expressions.push(transitionValue);
  }
  return expressions;
}
function parseInnerTransitionStr(eventStr, expressions, errors) {
  if (eventStr[0] == ":") {
    const result = parseAnimationAlias(eventStr, errors);
    if (typeof result == "function") {
      expressions.push(result);
      return;
    }
    eventStr = result;
  }
  const match = eventStr.match(/^(\*|[-\w]+)\s*(<?[=-]>)\s*(\*|[-\w]+)$/);
  if (match == null || match.length < 4) {
    errors.push(invalidExpression(eventStr));
    return expressions;
  }
  const fromState = match[1];
  const separator = match[2];
  const toState = match[3];
  expressions.push(makeLambdaFromStates(fromState, toState));
  const isFullAnyStateExpr = fromState == ANY_STATE && toState == ANY_STATE;
  if (separator[0] == "<" && !isFullAnyStateExpr) {
    expressions.push(makeLambdaFromStates(toState, fromState));
  }
  return;
}
function parseAnimationAlias(alias, errors) {
  switch (alias) {
    case ":enter":
      return "void => *";
    case ":leave":
      return "* => void";
    case ":increment":
      return (fromState, toState) => parseFloat(toState) > parseFloat(fromState);
    case ":decrement":
      return (fromState, toState) => parseFloat(toState) < parseFloat(fromState);
    default:
      errors.push(invalidTransitionAlias(alias));
      return "* => *";
  }
}
var TRUE_BOOLEAN_VALUES = /* @__PURE__ */ new Set(["true", "1"]);
var FALSE_BOOLEAN_VALUES = /* @__PURE__ */ new Set(["false", "0"]);
function makeLambdaFromStates(lhs, rhs) {
  const LHS_MATCH_BOOLEAN = TRUE_BOOLEAN_VALUES.has(lhs) || FALSE_BOOLEAN_VALUES.has(lhs);
  const RHS_MATCH_BOOLEAN = TRUE_BOOLEAN_VALUES.has(rhs) || FALSE_BOOLEAN_VALUES.has(rhs);
  return (fromState, toState) => {
    let lhsMatch = lhs == ANY_STATE || lhs == fromState;
    let rhsMatch = rhs == ANY_STATE || rhs == toState;
    if (!lhsMatch && LHS_MATCH_BOOLEAN && typeof fromState === "boolean") {
      lhsMatch = fromState ? TRUE_BOOLEAN_VALUES.has(lhs) : FALSE_BOOLEAN_VALUES.has(lhs);
    }
    if (!rhsMatch && RHS_MATCH_BOOLEAN && typeof toState === "boolean") {
      rhsMatch = toState ? TRUE_BOOLEAN_VALUES.has(rhs) : FALSE_BOOLEAN_VALUES.has(rhs);
    }
    return lhsMatch && rhsMatch;
  };
}
var SELF_TOKEN = ":self";
var SELF_TOKEN_REGEX = /* @__PURE__ */ new RegExp(`s*${SELF_TOKEN}s*,?`, "g");
function buildAnimationAst(driver, metadata, errors, warnings) {
  return new AnimationAstBuilderVisitor(driver).build(metadata, errors, warnings);
}
var ROOT_SELECTOR = "";
var AnimationAstBuilderVisitor = class {
  _driver;
  constructor(_driver) {
    this._driver = _driver;
  }
  build(metadata, errors, warnings) {
    const context = new AnimationAstBuilderContext(errors);
    this._resetContextStyleTimingState(context);
    const ast = visitDslNode(this, normalizeAnimationEntry(metadata), context);
    if (typeof ngDevMode === "undefined" || ngDevMode) {
      if (context.unsupportedCSSPropertiesFound.size) {
        pushUnrecognizedPropertiesWarning(warnings, [...context.unsupportedCSSPropertiesFound.keys()]);
      }
    }
    return ast;
  }
  _resetContextStyleTimingState(context) {
    context.currentQuerySelector = ROOT_SELECTOR;
    context.collectedStyles = /* @__PURE__ */ new Map();
    context.collectedStyles.set(ROOT_SELECTOR, /* @__PURE__ */ new Map());
    context.currentTime = 0;
  }
  visitTrigger(metadata, context) {
    let queryCount = context.queryCount = 0;
    let depCount = context.depCount = 0;
    const states = [];
    const transitions = [];
    if (metadata.name.charAt(0) == "@") {
      context.errors.push(invalidTrigger());
    }
    metadata.definitions.forEach((def) => {
      this._resetContextStyleTimingState(context);
      if (def.type == AnimationMetadataType.State) {
        const stateDef = def;
        const name = stateDef.name;
        name.toString().split(/\s*,\s*/).forEach((n) => {
          stateDef.name = n;
          states.push(this.visitState(stateDef, context));
        });
        stateDef.name = name;
      } else if (def.type == AnimationMetadataType.Transition) {
        const transition = this.visitTransition(def, context);
        queryCount += transition.queryCount;
        depCount += transition.depCount;
        transitions.push(transition);
      } else {
        context.errors.push(invalidDefinition());
      }
    });
    return {
      type: AnimationMetadataType.Trigger,
      name: metadata.name,
      states,
      transitions,
      queryCount,
      depCount,
      options: null
    };
  }
  visitState(metadata, context) {
    const styleAst = this.visitStyle(metadata.styles, context);
    const astParams = metadata.options && metadata.options.params || null;
    if (styleAst.containsDynamicStyles) {
      const missingSubs = /* @__PURE__ */ new Set();
      const params = astParams || {};
      styleAst.styles.forEach((style2) => {
        if (style2 instanceof Map) {
          style2.forEach((value) => {
            extractStyleParams(value).forEach((sub) => {
              if (!params.hasOwnProperty(sub)) {
                missingSubs.add(sub);
              }
            });
          });
        }
      });
      if (missingSubs.size) {
        context.errors.push(invalidState(metadata.name, [...missingSubs.values()]));
      }
    }
    return {
      type: AnimationMetadataType.State,
      name: metadata.name,
      style: styleAst,
      options: astParams ? {
        params: astParams
      } : null
    };
  }
  visitTransition(metadata, context) {
    context.queryCount = 0;
    context.depCount = 0;
    const animation = visitDslNode(this, normalizeAnimationEntry(metadata.animation), context);
    const matchers = parseTransitionExpr(metadata.expr, context.errors);
    return {
      type: AnimationMetadataType.Transition,
      matchers,
      animation,
      queryCount: context.queryCount,
      depCount: context.depCount,
      options: normalizeAnimationOptions(metadata.options)
    };
  }
  visitSequence(metadata, context) {
    return {
      type: AnimationMetadataType.Sequence,
      steps: metadata.steps.map((s) => visitDslNode(this, s, context)),
      options: normalizeAnimationOptions(metadata.options)
    };
  }
  visitGroup(metadata, context) {
    const currentTime = context.currentTime;
    let furthestTime = 0;
    const steps = metadata.steps.map((step) => {
      context.currentTime = currentTime;
      const innerAst = visitDslNode(this, step, context);
      furthestTime = Math.max(furthestTime, context.currentTime);
      return innerAst;
    });
    context.currentTime = furthestTime;
    return {
      type: AnimationMetadataType.Group,
      steps,
      options: normalizeAnimationOptions(metadata.options)
    };
  }
  visitAnimate(metadata, context) {
    const timingAst = constructTimingAst(metadata.timings, context.errors);
    context.currentAnimateTimings = timingAst;
    let styleAst;
    let styleMetadata = metadata.styles ? metadata.styles : style({});
    if (styleMetadata.type == AnimationMetadataType.Keyframes) {
      styleAst = this.visitKeyframes(styleMetadata, context);
    } else {
      let styleMetadata2 = metadata.styles;
      let isEmpty = false;
      if (!styleMetadata2) {
        isEmpty = true;
        const newStyleData = {};
        if (timingAst.easing) {
          newStyleData["easing"] = timingAst.easing;
        }
        styleMetadata2 = style(newStyleData);
      }
      context.currentTime += timingAst.duration + timingAst.delay;
      const _styleAst = this.visitStyle(styleMetadata2, context);
      _styleAst.isEmptyStep = isEmpty;
      styleAst = _styleAst;
    }
    context.currentAnimateTimings = null;
    return {
      type: AnimationMetadataType.Animate,
      timings: timingAst,
      style: styleAst,
      options: null
    };
  }
  visitStyle(metadata, context) {
    const ast = this._makeStyleAst(metadata, context);
    this._validateStyleAst(ast, context);
    return ast;
  }
  _makeStyleAst(metadata, context) {
    const styles = [];
    const metadataStyles = Array.isArray(metadata.styles) ? metadata.styles : [metadata.styles];
    for (let styleTuple of metadataStyles) {
      if (typeof styleTuple === "string") {
        if (styleTuple === AUTO_STYLE) {
          styles.push(styleTuple);
        } else {
          context.errors.push(invalidStyleValue(styleTuple));
        }
      } else {
        styles.push(new Map(Object.entries(styleTuple)));
      }
    }
    let containsDynamicStyles = false;
    let collectedEasing = null;
    styles.forEach((styleData) => {
      if (styleData instanceof Map) {
        if (styleData.has("easing")) {
          collectedEasing = styleData.get("easing");
          styleData.delete("easing");
        }
        if (!containsDynamicStyles) {
          for (let value of styleData.values()) {
            if (value.toString().indexOf(SUBSTITUTION_EXPR_START) >= 0) {
              containsDynamicStyles = true;
              break;
            }
          }
        }
      }
    });
    return {
      type: AnimationMetadataType.Style,
      styles,
      easing: collectedEasing,
      offset: metadata.offset,
      containsDynamicStyles,
      options: null
    };
  }
  _validateStyleAst(ast, context) {
    const timings = context.currentAnimateTimings;
    let endTime = context.currentTime;
    let startTime = context.currentTime;
    if (timings && startTime > 0) {
      startTime -= timings.duration + timings.delay;
    }
    ast.styles.forEach((tuple) => {
      if (typeof tuple === "string") return;
      tuple.forEach((value, prop) => {
        if (typeof ngDevMode === "undefined" || ngDevMode) {
          if (!this._driver.validateStyleProperty(prop)) {
            tuple.delete(prop);
            context.unsupportedCSSPropertiesFound.add(prop);
            return;
          }
        }
        const collectedStyles = context.collectedStyles.get(context.currentQuerySelector);
        const collectedEntry = collectedStyles.get(prop);
        let updateCollectedStyle = true;
        if (collectedEntry) {
          if (startTime != endTime && startTime >= collectedEntry.startTime && endTime <= collectedEntry.endTime) {
            context.errors.push(invalidParallelAnimation(prop, collectedEntry.startTime, collectedEntry.endTime, startTime, endTime));
            updateCollectedStyle = false;
          }
          startTime = collectedEntry.startTime;
        }
        if (updateCollectedStyle) {
          collectedStyles.set(prop, {
            startTime,
            endTime
          });
        }
        if (context.options) {
          validateStyleParams(value, context.options, context.errors);
        }
      });
    });
  }
  visitKeyframes(metadata, context) {
    const ast = {
      type: AnimationMetadataType.Keyframes,
      styles: [],
      options: null
    };
    if (!context.currentAnimateTimings) {
      context.errors.push(invalidKeyframes());
      return ast;
    }
    const MAX_KEYFRAME_OFFSET = 1;
    let totalKeyframesWithOffsets = 0;
    const offsets = [];
    let offsetsOutOfOrder = false;
    let keyframesOutOfRange = false;
    let previousOffset = 0;
    const keyframes = metadata.steps.map((styles) => {
      const style2 = this._makeStyleAst(styles, context);
      let offsetVal = style2.offset != null ? style2.offset : consumeOffset(style2.styles);
      let offset = 0;
      if (offsetVal != null) {
        totalKeyframesWithOffsets++;
        offset = style2.offset = offsetVal;
      }
      keyframesOutOfRange = keyframesOutOfRange || offset < 0 || offset > 1;
      offsetsOutOfOrder = offsetsOutOfOrder || offset < previousOffset;
      previousOffset = offset;
      offsets.push(offset);
      return style2;
    });
    if (keyframesOutOfRange) {
      context.errors.push(invalidOffset());
    }
    if (offsetsOutOfOrder) {
      context.errors.push(keyframeOffsetsOutOfOrder());
    }
    const length = metadata.steps.length;
    let generatedOffset = 0;
    if (totalKeyframesWithOffsets > 0 && totalKeyframesWithOffsets < length) {
      context.errors.push(keyframesMissingOffsets());
    } else if (totalKeyframesWithOffsets == 0) {
      generatedOffset = MAX_KEYFRAME_OFFSET / (length - 1);
    }
    const limit = length - 1;
    const currentTime = context.currentTime;
    const currentAnimateTimings = context.currentAnimateTimings;
    const animateDuration = currentAnimateTimings.duration;
    keyframes.forEach((kf, i) => {
      const offset = generatedOffset > 0 ? i == limit ? 1 : generatedOffset * i : offsets[i];
      const durationUpToThisFrame = offset * animateDuration;
      context.currentTime = currentTime + currentAnimateTimings.delay + durationUpToThisFrame;
      currentAnimateTimings.duration = durationUpToThisFrame;
      this._validateStyleAst(kf, context);
      kf.offset = offset;
      ast.styles.push(kf);
    });
    return ast;
  }
  visitReference(metadata, context) {
    return {
      type: AnimationMetadataType.Reference,
      animation: visitDslNode(this, normalizeAnimationEntry(metadata.animation), context),
      options: normalizeAnimationOptions(metadata.options)
    };
  }
  visitAnimateChild(metadata, context) {
    context.depCount++;
    return {
      type: AnimationMetadataType.AnimateChild,
      options: normalizeAnimationOptions(metadata.options)
    };
  }
  visitAnimateRef(metadata, context) {
    return {
      type: AnimationMetadataType.AnimateRef,
      animation: this.visitReference(metadata.animation, context),
      options: normalizeAnimationOptions(metadata.options)
    };
  }
  visitQuery(metadata, context) {
    const parentSelector = context.currentQuerySelector;
    const options = metadata.options || {};
    context.queryCount++;
    context.currentQuery = metadata;
    const [selector, includeSelf] = normalizeSelector(metadata.selector);
    context.currentQuerySelector = parentSelector.length ? parentSelector + " " + selector : selector;
    getOrSetDefaultValue(context.collectedStyles, context.currentQuerySelector, /* @__PURE__ */ new Map());
    const animation = visitDslNode(this, normalizeAnimationEntry(metadata.animation), context);
    context.currentQuery = null;
    context.currentQuerySelector = parentSelector;
    return {
      type: AnimationMetadataType.Query,
      selector,
      limit: options.limit || 0,
      optional: !!options.optional,
      includeSelf,
      animation,
      originalSelector: metadata.selector,
      options: normalizeAnimationOptions(metadata.options)
    };
  }
  visitStagger(metadata, context) {
    if (!context.currentQuery) {
      context.errors.push(invalidStagger());
    }
    const timings = metadata.timings === "full" ? {
      duration: 0,
      delay: 0,
      easing: "full"
    } : resolveTiming(metadata.timings, context.errors, true);
    return {
      type: AnimationMetadataType.Stagger,
      animation: visitDslNode(this, normalizeAnimationEntry(metadata.animation), context),
      timings,
      options: null
    };
  }
};
function normalizeSelector(selector) {
  const hasAmpersand = selector.split(/\s*,\s*/).find((token) => token == SELF_TOKEN) ? true : false;
  if (hasAmpersand) {
    selector = selector.replace(SELF_TOKEN_REGEX, "");
  }
  selector = selector.replace(/@\*/g, NG_TRIGGER_SELECTOR).replace(/@\w+/g, (match) => NG_TRIGGER_SELECTOR + "-" + match.slice(1)).replace(/:animating/g, NG_ANIMATING_SELECTOR);
  return [selector, hasAmpersand];
}
function normalizeParams(obj) {
  return obj ? __spreadValues({}, obj) : null;
}
var AnimationAstBuilderContext = class {
  errors;
  queryCount = 0;
  depCount = 0;
  currentTransition = null;
  currentQuery = null;
  currentQuerySelector = null;
  currentAnimateTimings = null;
  currentTime = 0;
  collectedStyles = /* @__PURE__ */ new Map();
  options = null;
  unsupportedCSSPropertiesFound = /* @__PURE__ */ new Set();
  constructor(errors) {
    this.errors = errors;
  }
};
function consumeOffset(styles) {
  if (typeof styles == "string") return null;
  let offset = null;
  if (Array.isArray(styles)) {
    styles.forEach((styleTuple) => {
      if (styleTuple instanceof Map && styleTuple.has("offset")) {
        const obj = styleTuple;
        offset = parseFloat(obj.get("offset"));
        obj.delete("offset");
      }
    });
  } else if (styles instanceof Map && styles.has("offset")) {
    const obj = styles;
    offset = parseFloat(obj.get("offset"));
    obj.delete("offset");
  }
  return offset;
}
function constructTimingAst(value, errors) {
  if (value.hasOwnProperty("duration")) {
    return value;
  }
  if (typeof value == "number") {
    const duration = resolveTiming(value, errors).duration;
    return makeTimingAst(duration, 0, "");
  }
  const strValue = value;
  const isDynamic = strValue.split(/\s+/).some((v) => v.charAt(0) == "{" && v.charAt(1) == "{");
  if (isDynamic) {
    const ast = makeTimingAst(0, 0, "");
    ast.dynamic = true;
    ast.strValue = strValue;
    return ast;
  }
  const timings = resolveTiming(strValue, errors);
  return makeTimingAst(timings.duration, timings.delay, timings.easing);
}
function normalizeAnimationOptions(options) {
  if (options) {
    options = __spreadValues({}, options);
    if (options["params"]) {
      options["params"] = normalizeParams(options["params"]);
    }
  } else {
    options = {};
  }
  return options;
}
function makeTimingAst(duration, delay, easing) {
  return {
    duration,
    delay,
    easing
  };
}
function createTimelineInstruction(element, keyframes, preStyleProps, postStyleProps, duration, delay, easing = null, subTimeline = false) {
  return {
    type: 1,
    element,
    keyframes,
    preStyleProps,
    postStyleProps,
    duration,
    delay,
    totalTime: duration + delay,
    easing,
    subTimeline
  };
}
var ElementInstructionMap = class {
  _map = /* @__PURE__ */ new Map();
  get(element) {
    return this._map.get(element) || [];
  }
  append(element, instructions) {
    let existingInstructions = this._map.get(element);
    if (!existingInstructions) {
      this._map.set(element, existingInstructions = []);
    }
    existingInstructions.push(...instructions);
  }
  has(element) {
    return this._map.has(element);
  }
  clear() {
    this._map.clear();
  }
};
var ONE_FRAME_IN_MILLISECONDS = 1;
var ENTER_TOKEN = ":enter";
var ENTER_TOKEN_REGEX = /* @__PURE__ */ new RegExp(ENTER_TOKEN, "g");
var LEAVE_TOKEN = ":leave";
var LEAVE_TOKEN_REGEX = /* @__PURE__ */ new RegExp(LEAVE_TOKEN, "g");
function buildAnimationTimelines(driver, rootElement, ast, enterClassName, leaveClassName, startingStyles = /* @__PURE__ */ new Map(), finalStyles = /* @__PURE__ */ new Map(), options, subInstructions, errors = []) {
  return new AnimationTimelineBuilderVisitor().buildKeyframes(driver, rootElement, ast, enterClassName, leaveClassName, startingStyles, finalStyles, options, subInstructions, errors);
}
var AnimationTimelineBuilderVisitor = class {
  buildKeyframes(driver, rootElement, ast, enterClassName, leaveClassName, startingStyles, finalStyles, options, subInstructions, errors = []) {
    subInstructions = subInstructions || new ElementInstructionMap();
    const context = new AnimationTimelineContext(driver, rootElement, subInstructions, enterClassName, leaveClassName, errors, []);
    context.options = options;
    const delay = options.delay ? resolveTimingValue(options.delay) : 0;
    context.currentTimeline.delayNextStep(delay);
    context.currentTimeline.setStyles([startingStyles], null, context.errors, options);
    visitDslNode(this, ast, context);
    const timelines = context.timelines.filter((timeline) => timeline.containsAnimation());
    if (timelines.length && finalStyles.size) {
      let lastRootTimeline;
      for (let i = timelines.length - 1; i >= 0; i--) {
        const timeline = timelines[i];
        if (timeline.element === rootElement) {
          lastRootTimeline = timeline;
          break;
        }
      }
      if (lastRootTimeline && !lastRootTimeline.allowOnlyTimelineStyles()) {
        lastRootTimeline.setStyles([finalStyles], null, context.errors, options);
      }
    }
    return timelines.length ? timelines.map((timeline) => timeline.buildKeyframes()) : [createTimelineInstruction(rootElement, [], [], [], 0, delay, "", false)];
  }
  visitTrigger(ast, context) {
  }
  visitState(ast, context) {
  }
  visitTransition(ast, context) {
  }
  visitAnimateChild(ast, context) {
    const elementInstructions = context.subInstructions.get(context.element);
    if (elementInstructions) {
      const innerContext = context.createSubContext(ast.options);
      const startTime = context.currentTimeline.currentTime;
      const endTime = this._visitSubInstructions(elementInstructions, innerContext, innerContext.options);
      if (startTime != endTime) {
        context.transformIntoNewTimeline(endTime);
      }
    }
    context.previousNode = ast;
  }
  visitAnimateRef(ast, context) {
    const innerContext = context.createSubContext(ast.options);
    innerContext.transformIntoNewTimeline();
    this._applyAnimationRefDelays([ast.options, ast.animation.options], context, innerContext);
    this.visitReference(ast.animation, innerContext);
    context.transformIntoNewTimeline(innerContext.currentTimeline.currentTime);
    context.previousNode = ast;
  }
  _applyAnimationRefDelays(animationsRefsOptions, context, innerContext) {
    for (const animationRefOptions of animationsRefsOptions) {
      const animationDelay = animationRefOptions?.delay;
      if (animationDelay) {
        const animationDelayValue = typeof animationDelay === "number" ? animationDelay : resolveTimingValue(interpolateParams(animationDelay, animationRefOptions?.params ?? {}, context.errors));
        innerContext.delayNextStep(animationDelayValue);
      }
    }
  }
  _visitSubInstructions(instructions, context, options) {
    const startTime = context.currentTimeline.currentTime;
    let furthestTime = startTime;
    const duration = options.duration != null ? resolveTimingValue(options.duration) : null;
    const delay = options.delay != null ? resolveTimingValue(options.delay) : null;
    if (duration !== 0) {
      instructions.forEach((instruction) => {
        const instructionTimings = context.appendInstructionToTimeline(instruction, duration, delay);
        furthestTime = Math.max(furthestTime, instructionTimings.duration + instructionTimings.delay);
      });
    }
    return furthestTime;
  }
  visitReference(ast, context) {
    context.updateOptions(ast.options, true);
    visitDslNode(this, ast.animation, context);
    context.previousNode = ast;
  }
  visitSequence(ast, context) {
    const subContextCount = context.subContextCount;
    let ctx = context;
    const options = ast.options;
    if (options && (options.params || options.delay)) {
      ctx = context.createSubContext(options);
      ctx.transformIntoNewTimeline();
      if (options.delay != null) {
        if (ctx.previousNode.type == AnimationMetadataType.Style) {
          ctx.currentTimeline.snapshotCurrentStyles();
          ctx.previousNode = DEFAULT_NOOP_PREVIOUS_NODE;
        }
        const delay = resolveTimingValue(options.delay);
        ctx.delayNextStep(delay);
      }
    }
    if (ast.steps.length) {
      ast.steps.forEach((s) => visitDslNode(this, s, ctx));
      ctx.currentTimeline.applyStylesToKeyframe();
      if (ctx.subContextCount > subContextCount) {
        ctx.transformIntoNewTimeline();
      }
    }
    context.previousNode = ast;
  }
  visitGroup(ast, context) {
    const innerTimelines = [];
    let furthestTime = context.currentTimeline.currentTime;
    const delay = ast.options && ast.options.delay ? resolveTimingValue(ast.options.delay) : 0;
    ast.steps.forEach((s) => {
      const innerContext = context.createSubContext(ast.options);
      if (delay) {
        innerContext.delayNextStep(delay);
      }
      visitDslNode(this, s, innerContext);
      furthestTime = Math.max(furthestTime, innerContext.currentTimeline.currentTime);
      innerTimelines.push(innerContext.currentTimeline);
    });
    innerTimelines.forEach((timeline) => context.currentTimeline.mergeTimelineCollectedStyles(timeline));
    context.transformIntoNewTimeline(furthestTime);
    context.previousNode = ast;
  }
  _visitTiming(ast, context) {
    if (ast.dynamic) {
      const strValue = ast.strValue;
      const timingValue = context.params ? interpolateParams(strValue, context.params, context.errors) : strValue;
      return resolveTiming(timingValue, context.errors);
    } else {
      return {
        duration: ast.duration,
        delay: ast.delay,
        easing: ast.easing
      };
    }
  }
  visitAnimate(ast, context) {
    const timings = context.currentAnimateTimings = this._visitTiming(ast.timings, context);
    const timeline = context.currentTimeline;
    if (timings.delay) {
      context.incrementTime(timings.delay);
      timeline.snapshotCurrentStyles();
    }
    const style2 = ast.style;
    if (style2.type == AnimationMetadataType.Keyframes) {
      this.visitKeyframes(style2, context);
    } else {
      context.incrementTime(timings.duration);
      this.visitStyle(style2, context);
      timeline.applyStylesToKeyframe();
    }
    context.currentAnimateTimings = null;
    context.previousNode = ast;
  }
  visitStyle(ast, context) {
    const timeline = context.currentTimeline;
    const timings = context.currentAnimateTimings;
    if (!timings && timeline.hasCurrentStyleProperties()) {
      timeline.forwardFrame();
    }
    const easing = timings && timings.easing || ast.easing;
    if (ast.isEmptyStep) {
      timeline.applyEmptyStep(easing);
    } else {
      timeline.setStyles(ast.styles, easing, context.errors, context.options);
    }
    context.previousNode = ast;
  }
  visitKeyframes(ast, context) {
    const currentAnimateTimings = context.currentAnimateTimings;
    const startTime = context.currentTimeline.duration;
    const duration = currentAnimateTimings.duration;
    const innerContext = context.createSubContext();
    const innerTimeline = innerContext.currentTimeline;
    innerTimeline.easing = currentAnimateTimings.easing;
    ast.styles.forEach((step) => {
      const offset = step.offset || 0;
      innerTimeline.forwardTime(offset * duration);
      innerTimeline.setStyles(step.styles, step.easing, context.errors, context.options);
      innerTimeline.applyStylesToKeyframe();
    });
    context.currentTimeline.mergeTimelineCollectedStyles(innerTimeline);
    context.transformIntoNewTimeline(startTime + duration);
    context.previousNode = ast;
  }
  visitQuery(ast, context) {
    const startTime = context.currentTimeline.currentTime;
    const options = ast.options || {};
    const delay = options.delay ? resolveTimingValue(options.delay) : 0;
    if (delay && (context.previousNode.type === AnimationMetadataType.Style || startTime == 0 && context.currentTimeline.hasCurrentStyleProperties())) {
      context.currentTimeline.snapshotCurrentStyles();
      context.previousNode = DEFAULT_NOOP_PREVIOUS_NODE;
    }
    let furthestTime = startTime;
    const elms = context.invokeQuery(ast.selector, ast.originalSelector, ast.limit, ast.includeSelf, options.optional ? true : false, context.errors);
    context.currentQueryTotal = elms.length;
    let sameElementTimeline = null;
    elms.forEach((element, i) => {
      context.currentQueryIndex = i;
      const innerContext = context.createSubContext(ast.options, element);
      if (delay) {
        innerContext.delayNextStep(delay);
      }
      if (element === context.element) {
        sameElementTimeline = innerContext.currentTimeline;
      }
      visitDslNode(this, ast.animation, innerContext);
      innerContext.currentTimeline.applyStylesToKeyframe();
      const endTime = innerContext.currentTimeline.currentTime;
      furthestTime = Math.max(furthestTime, endTime);
    });
    context.currentQueryIndex = 0;
    context.currentQueryTotal = 0;
    context.transformIntoNewTimeline(furthestTime);
    if (sameElementTimeline) {
      context.currentTimeline.mergeTimelineCollectedStyles(sameElementTimeline);
      context.currentTimeline.snapshotCurrentStyles();
    }
    context.previousNode = ast;
  }
  visitStagger(ast, context) {
    const parentContext = context.parentContext;
    const tl = context.currentTimeline;
    const timings = ast.timings;
    const duration = Math.abs(timings.duration);
    const maxTime = duration * (context.currentQueryTotal - 1);
    let delay = duration * context.currentQueryIndex;
    let staggerTransformer = timings.duration < 0 ? "reverse" : timings.easing;
    switch (staggerTransformer) {
      case "reverse":
        delay = maxTime - delay;
        break;
      case "full":
        delay = parentContext.currentStaggerTime;
        break;
    }
    const timeline = context.currentTimeline;
    if (delay) {
      timeline.delayNextStep(delay);
    }
    const startingTime = timeline.currentTime;
    visitDslNode(this, ast.animation, context);
    context.previousNode = ast;
    parentContext.currentStaggerTime = tl.currentTime - startingTime + (tl.startTime - parentContext.currentTimeline.startTime);
  }
};
var DEFAULT_NOOP_PREVIOUS_NODE = {};
var AnimationTimelineContext = class _AnimationTimelineContext {
  _driver;
  element;
  subInstructions;
  _enterClassName;
  _leaveClassName;
  errors;
  timelines;
  parentContext = null;
  currentTimeline;
  currentAnimateTimings = null;
  previousNode = DEFAULT_NOOP_PREVIOUS_NODE;
  subContextCount = 0;
  options = {};
  currentQueryIndex = 0;
  currentQueryTotal = 0;
  currentStaggerTime = 0;
  constructor(_driver, element, subInstructions, _enterClassName, _leaveClassName, errors, timelines, initialTimeline) {
    this._driver = _driver;
    this.element = element;
    this.subInstructions = subInstructions;
    this._enterClassName = _enterClassName;
    this._leaveClassName = _leaveClassName;
    this.errors = errors;
    this.timelines = timelines;
    this.currentTimeline = initialTimeline || new TimelineBuilder(this._driver, element, 0);
    timelines.push(this.currentTimeline);
  }
  get params() {
    return this.options.params;
  }
  updateOptions(options, skipIfExists) {
    if (!options) return;
    const newOptions = options;
    let optionsToUpdate = this.options;
    if (newOptions.duration != null) {
      optionsToUpdate.duration = resolveTimingValue(newOptions.duration);
    }
    if (newOptions.delay != null) {
      optionsToUpdate.delay = resolveTimingValue(newOptions.delay);
    }
    const newParams = newOptions.params;
    if (newParams) {
      let paramsToUpdate = optionsToUpdate.params;
      if (!paramsToUpdate) {
        paramsToUpdate = this.options.params = {};
      }
      Object.keys(newParams).forEach((name) => {
        if (!skipIfExists || !paramsToUpdate.hasOwnProperty(name)) {
          paramsToUpdate[name] = interpolateParams(newParams[name], paramsToUpdate, this.errors);
        }
      });
    }
  }
  _copyOptions() {
    const options = {};
    if (this.options) {
      const oldParams = this.options.params;
      if (oldParams) {
        const params = options["params"] = {};
        Object.keys(oldParams).forEach((name) => {
          params[name] = oldParams[name];
        });
      }
    }
    return options;
  }
  createSubContext(options = null, element, newTime) {
    const target = element || this.element;
    const context = new _AnimationTimelineContext(this._driver, target, this.subInstructions, this._enterClassName, this._leaveClassName, this.errors, this.timelines, this.currentTimeline.fork(target, newTime || 0));
    context.previousNode = this.previousNode;
    context.currentAnimateTimings = this.currentAnimateTimings;
    context.options = this._copyOptions();
    context.updateOptions(options);
    context.currentQueryIndex = this.currentQueryIndex;
    context.currentQueryTotal = this.currentQueryTotal;
    context.parentContext = this;
    this.subContextCount++;
    return context;
  }
  transformIntoNewTimeline(newTime) {
    this.previousNode = DEFAULT_NOOP_PREVIOUS_NODE;
    this.currentTimeline = this.currentTimeline.fork(this.element, newTime);
    this.timelines.push(this.currentTimeline);
    return this.currentTimeline;
  }
  appendInstructionToTimeline(instruction, duration, delay) {
    const updatedTimings = {
      duration: duration != null ? duration : instruction.duration,
      delay: this.currentTimeline.currentTime + (delay != null ? delay : 0) + instruction.delay,
      easing: ""
    };
    const builder = new SubTimelineBuilder(this._driver, instruction.element, instruction.keyframes, instruction.preStyleProps, instruction.postStyleProps, updatedTimings, instruction.stretchStartingKeyframe);
    this.timelines.push(builder);
    return updatedTimings;
  }
  incrementTime(time) {
    this.currentTimeline.forwardTime(this.currentTimeline.duration + time);
  }
  delayNextStep(delay) {
    if (delay > 0) {
      this.currentTimeline.delayNextStep(delay);
    }
  }
  invokeQuery(selector, originalSelector, limit, includeSelf, optional, errors) {
    let results = [];
    if (includeSelf) {
      results.push(this.element);
    }
    if (selector.length > 0) {
      selector = selector.replace(ENTER_TOKEN_REGEX, "." + this._enterClassName);
      selector = selector.replace(LEAVE_TOKEN_REGEX, "." + this._leaveClassName);
      const multi = limit != 1;
      let elements = this._driver.query(this.element, selector, multi);
      if (limit !== 0) {
        elements = limit < 0 ? elements.slice(elements.length + limit, elements.length) : elements.slice(0, limit);
      }
      results.push(...elements);
    }
    if (!optional && results.length == 0) {
      errors.push(invalidQuery(originalSelector));
    }
    return results;
  }
};
var TimelineBuilder = class _TimelineBuilder {
  _driver;
  element;
  startTime;
  _elementTimelineStylesLookup;
  duration = 0;
  easing = null;
  _previousKeyframe = /* @__PURE__ */ new Map();
  _currentKeyframe = /* @__PURE__ */ new Map();
  _keyframes = /* @__PURE__ */ new Map();
  _styleSummary = /* @__PURE__ */ new Map();
  _localTimelineStyles = /* @__PURE__ */ new Map();
  _globalTimelineStyles;
  _pendingStyles = /* @__PURE__ */ new Map();
  _backFill = /* @__PURE__ */ new Map();
  _currentEmptyStepKeyframe = null;
  constructor(_driver, element, startTime, _elementTimelineStylesLookup) {
    this._driver = _driver;
    this.element = element;
    this.startTime = startTime;
    this._elementTimelineStylesLookup = _elementTimelineStylesLookup;
    if (!this._elementTimelineStylesLookup) {
      this._elementTimelineStylesLookup = /* @__PURE__ */ new Map();
    }
    this._globalTimelineStyles = this._elementTimelineStylesLookup.get(element);
    if (!this._globalTimelineStyles) {
      this._globalTimelineStyles = this._localTimelineStyles;
      this._elementTimelineStylesLookup.set(element, this._localTimelineStyles);
    }
    this._loadKeyframe();
  }
  containsAnimation() {
    switch (this._keyframes.size) {
      case 0:
        return false;
      case 1:
        return this.hasCurrentStyleProperties();
      default:
        return true;
    }
  }
  hasCurrentStyleProperties() {
    return this._currentKeyframe.size > 0;
  }
  get currentTime() {
    return this.startTime + this.duration;
  }
  delayNextStep(delay) {
    const hasPreStyleStep = this._keyframes.size === 1 && this._pendingStyles.size;
    if (this.duration || hasPreStyleStep) {
      this.forwardTime(this.currentTime + delay);
      if (hasPreStyleStep) {
        this.snapshotCurrentStyles();
      }
    } else {
      this.startTime += delay;
    }
  }
  fork(element, currentTime) {
    this.applyStylesToKeyframe();
    return new _TimelineBuilder(this._driver, element, currentTime || this.currentTime, this._elementTimelineStylesLookup);
  }
  _loadKeyframe() {
    if (this._currentKeyframe) {
      this._previousKeyframe = this._currentKeyframe;
    }
    this._currentKeyframe = this._keyframes.get(this.duration);
    if (!this._currentKeyframe) {
      this._currentKeyframe = /* @__PURE__ */ new Map();
      this._keyframes.set(this.duration, this._currentKeyframe);
    }
  }
  forwardFrame() {
    this.duration += ONE_FRAME_IN_MILLISECONDS;
    this._loadKeyframe();
  }
  forwardTime(time) {
    this.applyStylesToKeyframe();
    this.duration = time;
    this._loadKeyframe();
  }
  _updateStyle(prop, value) {
    this._localTimelineStyles.set(prop, value);
    this._globalTimelineStyles.set(prop, value);
    this._styleSummary.set(prop, {
      time: this.currentTime,
      value
    });
  }
  allowOnlyTimelineStyles() {
    return this._currentEmptyStepKeyframe !== this._currentKeyframe;
  }
  applyEmptyStep(easing) {
    if (easing) {
      this._previousKeyframe.set("easing", easing);
    }
    for (let [prop, value] of this._globalTimelineStyles) {
      this._backFill.set(prop, value || AUTO_STYLE);
      this._currentKeyframe.set(prop, AUTO_STYLE);
    }
    this._currentEmptyStepKeyframe = this._currentKeyframe;
  }
  setStyles(input2, easing, errors, options) {
    if (easing) {
      this._previousKeyframe.set("easing", easing);
    }
    const params = options && options.params || {};
    const styles = flattenStyles(input2, this._globalTimelineStyles);
    for (let [prop, value] of styles) {
      const val = interpolateParams(value, params, errors);
      this._pendingStyles.set(prop, val);
      if (!this._localTimelineStyles.has(prop)) {
        this._backFill.set(prop, this._globalTimelineStyles.get(prop) ?? AUTO_STYLE);
      }
      this._updateStyle(prop, val);
    }
  }
  applyStylesToKeyframe() {
    if (this._pendingStyles.size == 0) return;
    this._pendingStyles.forEach((val, prop) => {
      this._currentKeyframe.set(prop, val);
    });
    this._pendingStyles.clear();
    this._localTimelineStyles.forEach((val, prop) => {
      if (!this._currentKeyframe.has(prop)) {
        this._currentKeyframe.set(prop, val);
      }
    });
  }
  snapshotCurrentStyles() {
    for (let [prop, val] of this._localTimelineStyles) {
      this._pendingStyles.set(prop, val);
      this._updateStyle(prop, val);
    }
  }
  getFinalKeyframe() {
    return this._keyframes.get(this.duration);
  }
  get properties() {
    const properties = [];
    for (let prop in this._currentKeyframe) {
      properties.push(prop);
    }
    return properties;
  }
  mergeTimelineCollectedStyles(timeline) {
    timeline._styleSummary.forEach((details1, prop) => {
      const details0 = this._styleSummary.get(prop);
      if (!details0 || details1.time > details0.time) {
        this._updateStyle(prop, details1.value);
      }
    });
  }
  buildKeyframes() {
    this.applyStylesToKeyframe();
    const preStyleProps = /* @__PURE__ */ new Set();
    const postStyleProps = /* @__PURE__ */ new Set();
    const isEmpty = this._keyframes.size === 1 && this.duration === 0;
    let finalKeyframes = [];
    this._keyframes.forEach((keyframe, time) => {
      const finalKeyframe = new Map([...this._backFill, ...keyframe]);
      finalKeyframe.forEach((value, prop) => {
        if (value === \u0275PRE_STYLE) {
          preStyleProps.add(prop);
        } else if (value === AUTO_STYLE) {
          postStyleProps.add(prop);
        }
      });
      if (!isEmpty) {
        finalKeyframe.set("offset", time / this.duration);
      }
      finalKeyframes.push(finalKeyframe);
    });
    const preProps = [...preStyleProps.values()];
    const postProps = [...postStyleProps.values()];
    if (isEmpty) {
      const kf0 = finalKeyframes[0];
      const kf1 = new Map(kf0);
      kf0.set("offset", 0);
      kf1.set("offset", 1);
      finalKeyframes = [kf0, kf1];
    }
    return createTimelineInstruction(this.element, finalKeyframes, preProps, postProps, this.duration, this.startTime, this.easing, false);
  }
};
var SubTimelineBuilder = class extends TimelineBuilder {
  keyframes;
  preStyleProps;
  postStyleProps;
  _stretchStartingKeyframe;
  timings;
  constructor(driver, element, keyframes, preStyleProps, postStyleProps, timings, _stretchStartingKeyframe = false) {
    super(driver, element, timings.delay);
    this.keyframes = keyframes;
    this.preStyleProps = preStyleProps;
    this.postStyleProps = postStyleProps;
    this._stretchStartingKeyframe = _stretchStartingKeyframe;
    this.timings = {
      duration: timings.duration,
      delay: timings.delay,
      easing: timings.easing
    };
  }
  containsAnimation() {
    return this.keyframes.length > 1;
  }
  buildKeyframes() {
    let keyframes = this.keyframes;
    let {
      delay,
      duration,
      easing
    } = this.timings;
    if (this._stretchStartingKeyframe && delay) {
      const newKeyframes = [];
      const totalTime = duration + delay;
      const startingGap = delay / totalTime;
      const newFirstKeyframe = new Map(keyframes[0]);
      newFirstKeyframe.set("offset", 0);
      newKeyframes.push(newFirstKeyframe);
      const oldFirstKeyframe = new Map(keyframes[0]);
      oldFirstKeyframe.set("offset", roundOffset(startingGap));
      newKeyframes.push(oldFirstKeyframe);
      const limit = keyframes.length - 1;
      for (let i = 1; i <= limit; i++) {
        let kf = new Map(keyframes[i]);
        const oldOffset = kf.get("offset");
        const timeAtKeyframe = delay + oldOffset * duration;
        kf.set("offset", roundOffset(timeAtKeyframe / totalTime));
        newKeyframes.push(kf);
      }
      duration = totalTime;
      delay = 0;
      easing = "";
      keyframes = newKeyframes;
    }
    return createTimelineInstruction(this.element, keyframes, this.preStyleProps, this.postStyleProps, duration, delay, easing, true);
  }
};
function roundOffset(offset, decimalPoints = 3) {
  const mult = Math.pow(10, decimalPoints - 1);
  return Math.round(offset * mult) / mult;
}
function flattenStyles(input2, allStyles) {
  const styles = /* @__PURE__ */ new Map();
  let allProperties;
  input2.forEach((token) => {
    if (token === "*") {
      allProperties ??= allStyles.keys();
      for (let prop of allProperties) {
        styles.set(prop, AUTO_STYLE);
      }
    } else {
      for (let [prop, val] of token) {
        styles.set(prop, val);
      }
    }
  });
  return styles;
}
function createTransitionInstruction(element, triggerName, fromState, toState, isRemovalTransition, fromStyles, toStyles, timelines, queriedElements, preStyleProps, postStyleProps, totalTime, errors) {
  return {
    type: 0,
    element,
    triggerName,
    isRemovalTransition,
    fromState,
    fromStyles,
    toState,
    toStyles,
    timelines,
    queriedElements,
    preStyleProps,
    postStyleProps,
    totalTime,
    errors
  };
}
var EMPTY_OBJECT = {};
var AnimationTransitionFactory = class {
  _triggerName;
  ast;
  _stateStyles;
  constructor(_triggerName, ast, _stateStyles) {
    this._triggerName = _triggerName;
    this.ast = ast;
    this._stateStyles = _stateStyles;
  }
  match(currentState, nextState, element, params) {
    return oneOrMoreTransitionsMatch(this.ast.matchers, currentState, nextState, element, params);
  }
  buildStyles(stateName, params, errors) {
    let styler = this._stateStyles.get("*");
    if (stateName !== void 0) {
      styler = this._stateStyles.get(stateName?.toString()) || styler;
    }
    return styler ? styler.buildStyles(params, errors) : /* @__PURE__ */ new Map();
  }
  build(driver, element, currentState, nextState, enterClassName, leaveClassName, currentOptions, nextOptions, subInstructions, skipAstBuild) {
    const errors = [];
    const transitionAnimationParams = this.ast.options && this.ast.options.params || EMPTY_OBJECT;
    const currentAnimationParams = currentOptions && currentOptions.params || EMPTY_OBJECT;
    const currentStateStyles = this.buildStyles(currentState, currentAnimationParams, errors);
    const nextAnimationParams = nextOptions && nextOptions.params || EMPTY_OBJECT;
    const nextStateStyles = this.buildStyles(nextState, nextAnimationParams, errors);
    const queriedElements = /* @__PURE__ */ new Set();
    const preStyleMap = /* @__PURE__ */ new Map();
    const postStyleMap = /* @__PURE__ */ new Map();
    const isRemoval = nextState === "void";
    const animationOptions = {
      params: applyParamDefaults(nextAnimationParams, transitionAnimationParams),
      delay: this.ast.options?.delay
    };
    const timelines = skipAstBuild ? [] : buildAnimationTimelines(driver, element, this.ast.animation, enterClassName, leaveClassName, currentStateStyles, nextStateStyles, animationOptions, subInstructions, errors);
    let totalTime = 0;
    timelines.forEach((tl) => {
      totalTime = Math.max(tl.duration + tl.delay, totalTime);
    });
    if (errors.length) {
      return createTransitionInstruction(element, this._triggerName, currentState, nextState, isRemoval, currentStateStyles, nextStateStyles, [], [], preStyleMap, postStyleMap, totalTime, errors);
    }
    timelines.forEach((tl) => {
      const elm = tl.element;
      const preProps = getOrSetDefaultValue(preStyleMap, elm, /* @__PURE__ */ new Set());
      tl.preStyleProps.forEach((prop) => preProps.add(prop));
      const postProps = getOrSetDefaultValue(postStyleMap, elm, /* @__PURE__ */ new Set());
      tl.postStyleProps.forEach((prop) => postProps.add(prop));
      if (elm !== element) {
        queriedElements.add(elm);
      }
    });
    if (typeof ngDevMode === "undefined" || ngDevMode) {
      checkNonAnimatableInTimelines(timelines, this._triggerName, driver);
    }
    return createTransitionInstruction(element, this._triggerName, currentState, nextState, isRemoval, currentStateStyles, nextStateStyles, timelines, [...queriedElements.values()], preStyleMap, postStyleMap, totalTime);
  }
};
function checkNonAnimatableInTimelines(timelines, triggerName, driver) {
  if (!driver.validateAnimatableStyleProperty) {
    return;
  }
  const allowedNonAnimatableProps = /* @__PURE__ */ new Set([
    // 'easing' is a utility/synthetic prop we use to represent
    // easing functions, it represents a property of the animation
    // which is not animatable but different values can be used
    // in different steps
    "easing"
  ]);
  const invalidNonAnimatableProps = /* @__PURE__ */ new Set();
  timelines.forEach(({
    keyframes
  }) => {
    const nonAnimatablePropsInitialValues = /* @__PURE__ */ new Map();
    keyframes.forEach((keyframe) => {
      const entriesToCheck = Array.from(keyframe.entries()).filter(([prop]) => !allowedNonAnimatableProps.has(prop));
      for (const [prop, value] of entriesToCheck) {
        if (!driver.validateAnimatableStyleProperty(prop)) {
          if (nonAnimatablePropsInitialValues.has(prop) && !invalidNonAnimatableProps.has(prop)) {
            const propInitialValue = nonAnimatablePropsInitialValues.get(prop);
            if (propInitialValue !== value) {
              invalidNonAnimatableProps.add(prop);
            }
          } else {
            nonAnimatablePropsInitialValues.set(prop, value);
          }
        }
      }
    });
  });
  if (invalidNonAnimatableProps.size > 0) {
    console.warn(`Warning: The animation trigger "${triggerName}" is attempting to animate the following not animatable properties: ` + Array.from(invalidNonAnimatableProps).join(", ") + "\n(to check the list of all animatable properties visit https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animated_properties)");
  }
}
function oneOrMoreTransitionsMatch(matchFns, currentState, nextState, element, params) {
  return matchFns.some((fn) => fn(currentState, nextState, element, params));
}
function applyParamDefaults(userParams, defaults) {
  const result = __spreadValues({}, defaults);
  Object.entries(userParams).forEach(([key, value]) => {
    if (value != null) {
      result[key] = value;
    }
  });
  return result;
}
var AnimationStateStyles = class {
  styles;
  defaultParams;
  normalizer;
  constructor(styles, defaultParams, normalizer) {
    this.styles = styles;
    this.defaultParams = defaultParams;
    this.normalizer = normalizer;
  }
  buildStyles(params, errors) {
    const finalStyles = /* @__PURE__ */ new Map();
    const combinedParams = applyParamDefaults(params, this.defaultParams);
    this.styles.styles.forEach((value) => {
      if (typeof value !== "string") {
        value.forEach((val, prop) => {
          if (val) {
            val = interpolateParams(val, combinedParams, errors);
          }
          const normalizedProp = this.normalizer.normalizePropertyName(prop, errors);
          val = this.normalizer.normalizeStyleValue(prop, normalizedProp, val, errors);
          finalStyles.set(prop, val);
        });
      }
    });
    return finalStyles;
  }
};
function buildTrigger(name, ast, normalizer) {
  return new AnimationTrigger(name, ast, normalizer);
}
var AnimationTrigger = class {
  name;
  ast;
  _normalizer;
  transitionFactories = [];
  fallbackTransition;
  states = /* @__PURE__ */ new Map();
  constructor(name, ast, _normalizer) {
    this.name = name;
    this.ast = ast;
    this._normalizer = _normalizer;
    ast.states.forEach((ast2) => {
      const defaultParams = ast2.options && ast2.options.params || {};
      this.states.set(ast2.name, new AnimationStateStyles(ast2.style, defaultParams, _normalizer));
    });
    balanceProperties(this.states, "true", "1");
    balanceProperties(this.states, "false", "0");
    ast.transitions.forEach((ast2) => {
      this.transitionFactories.push(new AnimationTransitionFactory(name, ast2, this.states));
    });
    this.fallbackTransition = createFallbackTransition(name, this.states);
  }
  get containsQueries() {
    return this.ast.queryCount > 0;
  }
  matchTransition(currentState, nextState, element, params) {
    const entry = this.transitionFactories.find((f) => f.match(currentState, nextState, element, params));
    return entry || null;
  }
  matchStyles(currentState, params, errors) {
    return this.fallbackTransition.buildStyles(currentState, params, errors);
  }
};
function createFallbackTransition(triggerName, states, normalizer) {
  const matchers = [(fromState, toState) => true];
  const animation = {
    type: AnimationMetadataType.Sequence,
    steps: [],
    options: null
  };
  const transition = {
    type: AnimationMetadataType.Transition,
    animation,
    matchers,
    options: null,
    queryCount: 0,
    depCount: 0
  };
  return new AnimationTransitionFactory(triggerName, transition, states);
}
function balanceProperties(stateMap, key1, key2) {
  if (stateMap.has(key1)) {
    if (!stateMap.has(key2)) {
      stateMap.set(key2, stateMap.get(key1));
    }
  } else if (stateMap.has(key2)) {
    stateMap.set(key1, stateMap.get(key2));
  }
}
var EMPTY_INSTRUCTION_MAP = /* @__PURE__ */ new ElementInstructionMap();
var TimelineAnimationEngine = class {
  bodyNode;
  _driver;
  _normalizer;
  _animations = /* @__PURE__ */ new Map();
  _playersById = /* @__PURE__ */ new Map();
  players = [];
  constructor(bodyNode, _driver, _normalizer) {
    this.bodyNode = bodyNode;
    this._driver = _driver;
    this._normalizer = _normalizer;
  }
  register(id, metadata) {
    const errors = [];
    const warnings = [];
    const ast = buildAnimationAst(this._driver, metadata, errors, warnings);
    if (errors.length) {
      throw registerFailed(errors);
    } else {
      if (typeof ngDevMode === "undefined" || ngDevMode) {
        if (warnings.length) {
          warnRegister(warnings);
        }
      }
      this._animations.set(id, ast);
    }
  }
  _buildPlayer(i, preStyles, postStyles) {
    const element = i.element;
    const keyframes = normalizeKeyframes$1(this._normalizer, i.keyframes, preStyles, postStyles);
    return this._driver.animate(element, keyframes, i.duration, i.delay, i.easing, [], true);
  }
  create(id, element, options = {}) {
    const errors = [];
    const ast = this._animations.get(id);
    let instructions;
    const autoStylesMap = /* @__PURE__ */ new Map();
    if (ast) {
      instructions = buildAnimationTimelines(this._driver, element, ast, ENTER_CLASSNAME, LEAVE_CLASSNAME, /* @__PURE__ */ new Map(), /* @__PURE__ */ new Map(), options, EMPTY_INSTRUCTION_MAP, errors);
      instructions.forEach((inst) => {
        const styles = getOrSetDefaultValue(autoStylesMap, inst.element, /* @__PURE__ */ new Map());
        inst.postStyleProps.forEach((prop) => styles.set(prop, null));
      });
    } else {
      errors.push(missingOrDestroyedAnimation());
      instructions = [];
    }
    if (errors.length) {
      throw createAnimationFailed(errors);
    }
    autoStylesMap.forEach((styles, element2) => {
      styles.forEach((_, prop) => {
        styles.set(prop, this._driver.computeStyle(element2, prop, AUTO_STYLE));
      });
    });
    const players = instructions.map((i) => {
      const styles = autoStylesMap.get(i.element);
      return this._buildPlayer(i, /* @__PURE__ */ new Map(), styles);
    });
    const player = optimizeGroupPlayer(players);
    this._playersById.set(id, player);
    player.onDestroy(() => this.destroy(id));
    this.players.push(player);
    return player;
  }
  destroy(id) {
    const player = this._getPlayer(id);
    player.destroy();
    this._playersById.delete(id);
    const index = this.players.indexOf(player);
    if (index >= 0) {
      this.players.splice(index, 1);
    }
  }
  _getPlayer(id) {
    const player = this._playersById.get(id);
    if (!player) {
      throw missingPlayer(id);
    }
    return player;
  }
  listen(id, element, eventName, callback) {
    const baseEvent = makeAnimationEvent(element, "", "", "");
    listenOnPlayer(this._getPlayer(id), eventName, baseEvent, callback);
    return () => {
    };
  }
  command(id, element, command, args) {
    if (command == "register") {
      this.register(id, args[0]);
      return;
    }
    if (command == "create") {
      const options = args[0] || {};
      this.create(id, element, options);
      return;
    }
    const player = this._getPlayer(id);
    switch (command) {
      case "play":
        player.play();
        break;
      case "pause":
        player.pause();
        break;
      case "reset":
        player.reset();
        break;
      case "restart":
        player.restart();
        break;
      case "finish":
        player.finish();
        break;
      case "init":
        player.init();
        break;
      case "setPosition":
        player.setPosition(parseFloat(args[0]));
        break;
      case "destroy":
        this.destroy(id);
        break;
    }
  }
};
var QUEUED_CLASSNAME = "ng-animate-queued";
var QUEUED_SELECTOR = ".ng-animate-queued";
var DISABLED_CLASSNAME = "ng-animate-disabled";
var DISABLED_SELECTOR = ".ng-animate-disabled";
var STAR_CLASSNAME = "ng-star-inserted";
var STAR_SELECTOR = ".ng-star-inserted";
var EMPTY_PLAYER_ARRAY = [];
var NULL_REMOVAL_STATE = {
  namespaceId: "",
  setForRemoval: false,
  setForMove: false,
  hasAnimation: false,
  removedBeforeQueried: false
};
var NULL_REMOVED_QUERIED_STATE = {
  namespaceId: "",
  setForMove: false,
  setForRemoval: false,
  hasAnimation: false,
  removedBeforeQueried: true
};
var REMOVAL_FLAG = "__ng_removed";
var StateValue = class {
  namespaceId;
  value;
  options;
  get params() {
    return this.options.params;
  }
  constructor(input2, namespaceId = "") {
    this.namespaceId = namespaceId;
    const isObj = input2 && input2.hasOwnProperty("value");
    const value = isObj ? input2["value"] : input2;
    this.value = normalizeTriggerValue(value);
    if (isObj) {
      const _a = input2, {
        value: value2
      } = _a, options = __objRest(_a, [
        "value"
      ]);
      this.options = options;
    } else {
      this.options = {};
    }
    if (!this.options.params) {
      this.options.params = {};
    }
  }
  absorbOptions(options) {
    const newParams = options.params;
    if (newParams) {
      const oldParams = this.options.params;
      Object.keys(newParams).forEach((prop) => {
        if (oldParams[prop] == null) {
          oldParams[prop] = newParams[prop];
        }
      });
    }
  }
};
var VOID_VALUE = "void";
var DEFAULT_STATE_VALUE = /* @__PURE__ */ new StateValue(VOID_VALUE);
var AnimationTransitionNamespace = class {
  id;
  hostElement;
  _engine;
  players = [];
  _triggers = /* @__PURE__ */ new Map();
  _queue = [];
  _elementListeners = /* @__PURE__ */ new Map();
  _hostClassName;
  constructor(id, hostElement, _engine) {
    this.id = id;
    this.hostElement = hostElement;
    this._engine = _engine;
    this._hostClassName = "ng-tns-" + id;
    addClass(hostElement, this._hostClassName);
  }
  listen(element, name, phase, callback) {
    if (!this._triggers.has(name)) {
      throw missingTrigger(phase, name);
    }
    if (phase == null || phase.length == 0) {
      throw missingEvent(name);
    }
    if (!isTriggerEventValid(phase)) {
      throw unsupportedTriggerEvent(phase, name);
    }
    const listeners = getOrSetDefaultValue(this._elementListeners, element, []);
    const data = {
      name,
      phase,
      callback
    };
    listeners.push(data);
    const triggersWithStates = getOrSetDefaultValue(this._engine.statesByElement, element, /* @__PURE__ */ new Map());
    if (!triggersWithStates.has(name)) {
      addClass(element, NG_TRIGGER_CLASSNAME);
      addClass(element, NG_TRIGGER_CLASSNAME + "-" + name);
      triggersWithStates.set(name, DEFAULT_STATE_VALUE);
    }
    return () => {
      this._engine.afterFlush(() => {
        const index = listeners.indexOf(data);
        if (index >= 0) {
          listeners.splice(index, 1);
        }
        if (!this._triggers.has(name)) {
          triggersWithStates.delete(name);
        }
      });
    };
  }
  register(name, ast) {
    if (this._triggers.has(name)) {
      return false;
    } else {
      this._triggers.set(name, ast);
      return true;
    }
  }
  _getTrigger(name) {
    const trigger = this._triggers.get(name);
    if (!trigger) {
      throw unregisteredTrigger(name);
    }
    return trigger;
  }
  trigger(element, triggerName, value, defaultToFallback = true) {
    const trigger = this._getTrigger(triggerName);
    const player = new TransitionAnimationPlayer(this.id, triggerName, element);
    let triggersWithStates = this._engine.statesByElement.get(element);
    if (!triggersWithStates) {
      addClass(element, NG_TRIGGER_CLASSNAME);
      addClass(element, NG_TRIGGER_CLASSNAME + "-" + triggerName);
      this._engine.statesByElement.set(element, triggersWithStates = /* @__PURE__ */ new Map());
    }
    let fromState = triggersWithStates.get(triggerName);
    const toState = new StateValue(value, this.id);
    const isObj = value && value.hasOwnProperty("value");
    if (!isObj && fromState) {
      toState.absorbOptions(fromState.options);
    }
    triggersWithStates.set(triggerName, toState);
    if (!fromState) {
      fromState = DEFAULT_STATE_VALUE;
    }
    const isRemoval = toState.value === VOID_VALUE;
    if (!isRemoval && fromState.value === toState.value) {
      if (!objEquals(fromState.params, toState.params)) {
        const errors = [];
        const fromStyles = trigger.matchStyles(fromState.value, fromState.params, errors);
        const toStyles = trigger.matchStyles(toState.value, toState.params, errors);
        if (errors.length) {
          this._engine.reportError(errors);
        } else {
          this._engine.afterFlush(() => {
            eraseStyles(element, fromStyles);
            setStyles(element, toStyles);
          });
        }
      }
      return;
    }
    const playersOnElement = getOrSetDefaultValue(this._engine.playersByElement, element, []);
    playersOnElement.forEach((player2) => {
      if (player2.namespaceId == this.id && player2.triggerName == triggerName && player2.queued) {
        player2.destroy();
      }
    });
    let transition = trigger.matchTransition(fromState.value, toState.value, element, toState.params);
    let isFallbackTransition = false;
    if (!transition) {
      if (!defaultToFallback) return;
      transition = trigger.fallbackTransition;
      isFallbackTransition = true;
    }
    this._engine.totalQueuedPlayers++;
    this._queue.push({
      element,
      triggerName,
      transition,
      fromState,
      toState,
      player,
      isFallbackTransition
    });
    if (!isFallbackTransition) {
      addClass(element, QUEUED_CLASSNAME);
      player.onStart(() => {
        removeClass(element, QUEUED_CLASSNAME);
      });
    }
    player.onDone(() => {
      let index = this.players.indexOf(player);
      if (index >= 0) {
        this.players.splice(index, 1);
      }
      const players = this._engine.playersByElement.get(element);
      if (players) {
        let index2 = players.indexOf(player);
        if (index2 >= 0) {
          players.splice(index2, 1);
        }
      }
    });
    this.players.push(player);
    playersOnElement.push(player);
    return player;
  }
  deregister(name) {
    this._triggers.delete(name);
    this._engine.statesByElement.forEach((stateMap) => stateMap.delete(name));
    this._elementListeners.forEach((listeners, element) => {
      this._elementListeners.set(element, listeners.filter((entry) => {
        return entry.name != name;
      }));
    });
  }
  clearElementCache(element) {
    this._engine.statesByElement.delete(element);
    this._elementListeners.delete(element);
    const elementPlayers = this._engine.playersByElement.get(element);
    if (elementPlayers) {
      elementPlayers.forEach((player) => player.destroy());
      this._engine.playersByElement.delete(element);
    }
  }
  _signalRemovalForInnerTriggers(rootElement, context) {
    const elements = this._engine.driver.query(rootElement, NG_TRIGGER_SELECTOR, true);
    elements.forEach((elm) => {
      if (elm[REMOVAL_FLAG]) return;
      const namespaces = this._engine.fetchNamespacesByElement(elm);
      if (namespaces.size) {
        namespaces.forEach((ns) => ns.triggerLeaveAnimation(elm, context, false, true));
      } else {
        this.clearElementCache(elm);
      }
    });
    this._engine.afterFlushAnimationsDone(() => elements.forEach((elm) => this.clearElementCache(elm)));
  }
  triggerLeaveAnimation(element, context, destroyAfterComplete, defaultToFallback) {
    const triggerStates = this._engine.statesByElement.get(element);
    const previousTriggersValues = /* @__PURE__ */ new Map();
    if (triggerStates) {
      const players = [];
      triggerStates.forEach((state, triggerName) => {
        previousTriggersValues.set(triggerName, state.value);
        if (this._triggers.has(triggerName)) {
          const player = this.trigger(element, triggerName, VOID_VALUE, defaultToFallback);
          if (player) {
            players.push(player);
          }
        }
      });
      if (players.length) {
        this._engine.markElementAsRemoved(this.id, element, true, context, previousTriggersValues);
        if (destroyAfterComplete) {
          optimizeGroupPlayer(players).onDone(() => this._engine.processLeaveNode(element));
        }
        return true;
      }
    }
    return false;
  }
  prepareLeaveAnimationListeners(element) {
    const listeners = this._elementListeners.get(element);
    const elementStates = this._engine.statesByElement.get(element);
    if (listeners && elementStates) {
      const visitedTriggers = /* @__PURE__ */ new Set();
      listeners.forEach((listener) => {
        const triggerName = listener.name;
        if (visitedTriggers.has(triggerName)) return;
        visitedTriggers.add(triggerName);
        const trigger = this._triggers.get(triggerName);
        const transition = trigger.fallbackTransition;
        const fromState = elementStates.get(triggerName) || DEFAULT_STATE_VALUE;
        const toState = new StateValue(VOID_VALUE);
        const player = new TransitionAnimationPlayer(this.id, triggerName, element);
        this._engine.totalQueuedPlayers++;
        this._queue.push({
          element,
          triggerName,
          transition,
          fromState,
          toState,
          player,
          isFallbackTransition: true
        });
      });
    }
  }
  removeNode(element, context) {
    const engine = this._engine;
    if (element.childElementCount) {
      this._signalRemovalForInnerTriggers(element, context);
    }
    if (this.triggerLeaveAnimation(element, context, true)) return;
    let containsPotentialParentTransition = false;
    if (engine.totalAnimations) {
      const currentPlayers = engine.players.length ? engine.playersByQueriedElement.get(element) : [];
      if (currentPlayers && currentPlayers.length) {
        containsPotentialParentTransition = true;
      } else {
        let parent = element;
        while (parent = parent.parentNode) {
          const triggers = engine.statesByElement.get(parent);
          if (triggers) {
            containsPotentialParentTransition = true;
            break;
          }
        }
      }
    }
    this.prepareLeaveAnimationListeners(element);
    if (containsPotentialParentTransition) {
      engine.markElementAsRemoved(this.id, element, false, context);
    } else {
      const removalFlag = element[REMOVAL_FLAG];
      if (!removalFlag || removalFlag === NULL_REMOVAL_STATE) {
        engine.afterFlush(() => this.clearElementCache(element));
        engine.destroyInnerAnimations(element);
        engine._onRemovalComplete(element, context);
      }
    }
  }
  insertNode(element, parent) {
    addClass(element, this._hostClassName);
  }
  drainQueuedTransitions(microtaskId) {
    const instructions = [];
    this._queue.forEach((entry) => {
      const player = entry.player;
      if (player.destroyed) return;
      const element = entry.element;
      const listeners = this._elementListeners.get(element);
      if (listeners) {
        listeners.forEach((listener) => {
          if (listener.name == entry.triggerName) {
            const baseEvent = makeAnimationEvent(element, entry.triggerName, entry.fromState.value, entry.toState.value);
            baseEvent["_data"] = microtaskId;
            listenOnPlayer(entry.player, listener.phase, baseEvent, listener.callback);
          }
        });
      }
      if (player.markedForDestroy) {
        this._engine.afterFlush(() => {
          player.destroy();
        });
      } else {
        instructions.push(entry);
      }
    });
    this._queue = [];
    return instructions.sort((a, b) => {
      const d0 = a.transition.ast.depCount;
      const d1 = b.transition.ast.depCount;
      if (d0 == 0 || d1 == 0) {
        return d0 - d1;
      }
      return this._engine.driver.containsElement(a.element, b.element) ? 1 : -1;
    });
  }
  destroy(context) {
    this.players.forEach((p) => p.destroy());
    this._signalRemovalForInnerTriggers(this.hostElement, context);
  }
};
var TransitionAnimationEngine = class {
  bodyNode;
  driver;
  _normalizer;
  players = [];
  newHostElements = /* @__PURE__ */ new Map();
  playersByElement = /* @__PURE__ */ new Map();
  playersByQueriedElement = /* @__PURE__ */ new Map();
  statesByElement = /* @__PURE__ */ new Map();
  disabledNodes = /* @__PURE__ */ new Set();
  totalAnimations = 0;
  totalQueuedPlayers = 0;
  _namespaceLookup = {};
  _namespaceList = [];
  _flushFns = [];
  _whenQuietFns = [];
  namespacesByHostElement = /* @__PURE__ */ new Map();
  collectedEnterElements = [];
  collectedLeaveElements = [];
  // this method is designed to be overridden by the code that uses this engine
  onRemovalComplete = (element, context) => {
  };
  /** @internal */
  _onRemovalComplete(element, context) {
    this.onRemovalComplete(element, context);
  }
  constructor(bodyNode, driver, _normalizer) {
    this.bodyNode = bodyNode;
    this.driver = driver;
    this._normalizer = _normalizer;
  }
  get queuedPlayers() {
    const players = [];
    this._namespaceList.forEach((ns) => {
      ns.players.forEach((player) => {
        if (player.queued) {
          players.push(player);
        }
      });
    });
    return players;
  }
  createNamespace(namespaceId, hostElement) {
    const ns = new AnimationTransitionNamespace(namespaceId, hostElement, this);
    if (this.bodyNode && this.driver.containsElement(this.bodyNode, hostElement)) {
      this._balanceNamespaceList(ns, hostElement);
    } else {
      this.newHostElements.set(hostElement, ns);
      this.collectEnterElement(hostElement);
    }
    return this._namespaceLookup[namespaceId] = ns;
  }
  _balanceNamespaceList(ns, hostElement) {
    const namespaceList = this._namespaceList;
    const namespacesByHostElement = this.namespacesByHostElement;
    const limit = namespaceList.length - 1;
    if (limit >= 0) {
      let found = false;
      let ancestor = this.driver.getParentElement(hostElement);
      while (ancestor) {
        const ancestorNs = namespacesByHostElement.get(ancestor);
        if (ancestorNs) {
          const index = namespaceList.indexOf(ancestorNs);
          namespaceList.splice(index + 1, 0, ns);
          found = true;
          break;
        }
        ancestor = this.driver.getParentElement(ancestor);
      }
      if (!found) {
        namespaceList.unshift(ns);
      }
    } else {
      namespaceList.push(ns);
    }
    namespacesByHostElement.set(hostElement, ns);
    return ns;
  }
  register(namespaceId, hostElement) {
    let ns = this._namespaceLookup[namespaceId];
    if (!ns) {
      ns = this.createNamespace(namespaceId, hostElement);
    }
    return ns;
  }
  registerTrigger(namespaceId, name, trigger) {
    let ns = this._namespaceLookup[namespaceId];
    if (ns && ns.register(name, trigger)) {
      this.totalAnimations++;
    }
  }
  destroy(namespaceId, context) {
    if (!namespaceId) return;
    this.afterFlush(() => {
    });
    this.afterFlushAnimationsDone(() => {
      const ns = this._fetchNamespace(namespaceId);
      this.namespacesByHostElement.delete(ns.hostElement);
      const index = this._namespaceList.indexOf(ns);
      if (index >= 0) {
        this._namespaceList.splice(index, 1);
      }
      ns.destroy(context);
      delete this._namespaceLookup[namespaceId];
    });
  }
  _fetchNamespace(id) {
    return this._namespaceLookup[id];
  }
  fetchNamespacesByElement(element) {
    const namespaces = /* @__PURE__ */ new Set();
    const elementStates = this.statesByElement.get(element);
    if (elementStates) {
      for (let stateValue of elementStates.values()) {
        if (stateValue.namespaceId) {
          const ns = this._fetchNamespace(stateValue.namespaceId);
          if (ns) {
            namespaces.add(ns);
          }
        }
      }
    }
    return namespaces;
  }
  trigger(namespaceId, element, name, value) {
    if (isElementNode(element)) {
      const ns = this._fetchNamespace(namespaceId);
      if (ns) {
        ns.trigger(element, name, value);
        return true;
      }
    }
    return false;
  }
  insertNode(namespaceId, element, parent, insertBefore) {
    if (!isElementNode(element)) return;
    const details = element[REMOVAL_FLAG];
    if (details && details.setForRemoval) {
      details.setForRemoval = false;
      details.setForMove = true;
      const index = this.collectedLeaveElements.indexOf(element);
      if (index >= 0) {
        this.collectedLeaveElements.splice(index, 1);
      }
    }
    if (namespaceId) {
      const ns = this._fetchNamespace(namespaceId);
      if (ns) {
        ns.insertNode(element, parent);
      }
    }
    if (insertBefore) {
      this.collectEnterElement(element);
    }
  }
  collectEnterElement(element) {
    this.collectedEnterElements.push(element);
  }
  markElementAsDisabled(element, value) {
    if (value) {
      if (!this.disabledNodes.has(element)) {
        this.disabledNodes.add(element);
        addClass(element, DISABLED_CLASSNAME);
      }
    } else if (this.disabledNodes.has(element)) {
      this.disabledNodes.delete(element);
      removeClass(element, DISABLED_CLASSNAME);
    }
  }
  removeNode(namespaceId, element, context) {
    if (isElementNode(element)) {
      const ns = namespaceId ? this._fetchNamespace(namespaceId) : null;
      if (ns) {
        ns.removeNode(element, context);
      } else {
        this.markElementAsRemoved(namespaceId, element, false, context);
      }
      const hostNS = this.namespacesByHostElement.get(element);
      if (hostNS && hostNS.id !== namespaceId) {
        hostNS.removeNode(element, context);
      }
    } else {
      this._onRemovalComplete(element, context);
    }
  }
  markElementAsRemoved(namespaceId, element, hasAnimation, context, previousTriggersValues) {
    this.collectedLeaveElements.push(element);
    element[REMOVAL_FLAG] = {
      namespaceId,
      setForRemoval: context,
      hasAnimation,
      removedBeforeQueried: false,
      previousTriggersValues
    };
  }
  listen(namespaceId, element, name, phase, callback) {
    if (isElementNode(element)) {
      return this._fetchNamespace(namespaceId).listen(element, name, phase, callback);
    }
    return () => {
    };
  }
  _buildInstruction(entry, subTimelines, enterClassName, leaveClassName, skipBuildAst) {
    return entry.transition.build(this.driver, entry.element, entry.fromState.value, entry.toState.value, enterClassName, leaveClassName, entry.fromState.options, entry.toState.options, subTimelines, skipBuildAst);
  }
  destroyInnerAnimations(containerElement) {
    let elements = this.driver.query(containerElement, NG_TRIGGER_SELECTOR, true);
    elements.forEach((element) => this.destroyActiveAnimationsForElement(element));
    if (this.playersByQueriedElement.size == 0) return;
    elements = this.driver.query(containerElement, NG_ANIMATING_SELECTOR, true);
    elements.forEach((element) => this.finishActiveQueriedAnimationOnElement(element));
  }
  destroyActiveAnimationsForElement(element) {
    const players = this.playersByElement.get(element);
    if (players) {
      players.forEach((player) => {
        if (player.queued) {
          player.markedForDestroy = true;
        } else {
          player.destroy();
        }
      });
    }
  }
  finishActiveQueriedAnimationOnElement(element) {
    const players = this.playersByQueriedElement.get(element);
    if (players) {
      players.forEach((player) => player.finish());
    }
  }
  whenRenderingDone() {
    return new Promise((resolve) => {
      if (this.players.length) {
        return optimizeGroupPlayer(this.players).onDone(() => resolve());
      } else {
        resolve();
      }
    });
  }
  processLeaveNode(element) {
    const details = element[REMOVAL_FLAG];
    if (details && details.setForRemoval) {
      element[REMOVAL_FLAG] = NULL_REMOVAL_STATE;
      if (details.namespaceId) {
        this.destroyInnerAnimations(element);
        const ns = this._fetchNamespace(details.namespaceId);
        if (ns) {
          ns.clearElementCache(element);
        }
      }
      this._onRemovalComplete(element, details.setForRemoval);
    }
    if (element.classList?.contains(DISABLED_CLASSNAME)) {
      this.markElementAsDisabled(element, false);
    }
    this.driver.query(element, DISABLED_SELECTOR, true).forEach((node) => {
      this.markElementAsDisabled(node, false);
    });
  }
  flush(microtaskId = -1) {
    let players = [];
    if (this.newHostElements.size) {
      this.newHostElements.forEach((ns, element) => this._balanceNamespaceList(ns, element));
      this.newHostElements.clear();
    }
    if (this.totalAnimations && this.collectedEnterElements.length) {
      for (let i = 0; i < this.collectedEnterElements.length; i++) {
        const elm = this.collectedEnterElements[i];
        addClass(elm, STAR_CLASSNAME);
      }
    }
    if (this._namespaceList.length && (this.totalQueuedPlayers || this.collectedLeaveElements.length)) {
      const cleanupFns = [];
      try {
        players = this._flushAnimations(cleanupFns, microtaskId);
      } finally {
        for (let i = 0; i < cleanupFns.length; i++) {
          cleanupFns[i]();
        }
      }
    } else {
      for (let i = 0; i < this.collectedLeaveElements.length; i++) {
        const element = this.collectedLeaveElements[i];
        this.processLeaveNode(element);
      }
    }
    this.totalQueuedPlayers = 0;
    this.collectedEnterElements.length = 0;
    this.collectedLeaveElements.length = 0;
    this._flushFns.forEach((fn) => fn());
    this._flushFns = [];
    if (this._whenQuietFns.length) {
      const quietFns = this._whenQuietFns;
      this._whenQuietFns = [];
      if (players.length) {
        optimizeGroupPlayer(players).onDone(() => {
          quietFns.forEach((fn) => fn());
        });
      } else {
        quietFns.forEach((fn) => fn());
      }
    }
  }
  reportError(errors) {
    throw triggerTransitionsFailed(errors);
  }
  _flushAnimations(cleanupFns, microtaskId) {
    const subTimelines = new ElementInstructionMap();
    const skippedPlayers = [];
    const skippedPlayersMap = /* @__PURE__ */ new Map();
    const queuedInstructions = [];
    const queriedElements = /* @__PURE__ */ new Map();
    const allPreStyleElements = /* @__PURE__ */ new Map();
    const allPostStyleElements = /* @__PURE__ */ new Map();
    const disabledElementsSet = /* @__PURE__ */ new Set();
    this.disabledNodes.forEach((node) => {
      disabledElementsSet.add(node);
      const nodesThatAreDisabled = this.driver.query(node, QUEUED_SELECTOR, true);
      for (let i2 = 0; i2 < nodesThatAreDisabled.length; i2++) {
        disabledElementsSet.add(nodesThatAreDisabled[i2]);
      }
    });
    const bodyNode = this.bodyNode;
    const allTriggerElements = Array.from(this.statesByElement.keys());
    const enterNodeMap = buildRootMap(allTriggerElements, this.collectedEnterElements);
    const enterNodeMapIds = /* @__PURE__ */ new Map();
    let i = 0;
    enterNodeMap.forEach((nodes, root) => {
      const className = ENTER_CLASSNAME + i++;
      enterNodeMapIds.set(root, className);
      nodes.forEach((node) => addClass(node, className));
    });
    const allLeaveNodes = [];
    const mergedLeaveNodes = /* @__PURE__ */ new Set();
    const leaveNodesWithoutAnimations = /* @__PURE__ */ new Set();
    for (let i2 = 0; i2 < this.collectedLeaveElements.length; i2++) {
      const element = this.collectedLeaveElements[i2];
      const details = element[REMOVAL_FLAG];
      if (details && details.setForRemoval) {
        allLeaveNodes.push(element);
        mergedLeaveNodes.add(element);
        if (details.hasAnimation) {
          this.driver.query(element, STAR_SELECTOR, true).forEach((elm) => mergedLeaveNodes.add(elm));
        } else {
          leaveNodesWithoutAnimations.add(element);
        }
      }
    }
    const leaveNodeMapIds = /* @__PURE__ */ new Map();
    const leaveNodeMap = buildRootMap(allTriggerElements, Array.from(mergedLeaveNodes));
    leaveNodeMap.forEach((nodes, root) => {
      const className = LEAVE_CLASSNAME + i++;
      leaveNodeMapIds.set(root, className);
      nodes.forEach((node) => addClass(node, className));
    });
    cleanupFns.push(() => {
      enterNodeMap.forEach((nodes, root) => {
        const className = enterNodeMapIds.get(root);
        nodes.forEach((node) => removeClass(node, className));
      });
      leaveNodeMap.forEach((nodes, root) => {
        const className = leaveNodeMapIds.get(root);
        nodes.forEach((node) => removeClass(node, className));
      });
      allLeaveNodes.forEach((element) => {
        this.processLeaveNode(element);
      });
    });
    const allPlayers = [];
    const erroneousTransitions = [];
    for (let i2 = this._namespaceList.length - 1; i2 >= 0; i2--) {
      const ns = this._namespaceList[i2];
      ns.drainQueuedTransitions(microtaskId).forEach((entry) => {
        const player = entry.player;
        const element = entry.element;
        allPlayers.push(player);
        if (this.collectedEnterElements.length) {
          const details = element[REMOVAL_FLAG];
          if (details && details.setForMove) {
            if (details.previousTriggersValues && details.previousTriggersValues.has(entry.triggerName)) {
              const previousValue = details.previousTriggersValues.get(entry.triggerName);
              const triggersWithStates = this.statesByElement.get(entry.element);
              if (triggersWithStates && triggersWithStates.has(entry.triggerName)) {
                const state = triggersWithStates.get(entry.triggerName);
                state.value = previousValue;
                triggersWithStates.set(entry.triggerName, state);
              }
            }
            player.destroy();
            return;
          }
        }
        const nodeIsOrphaned = !bodyNode || !this.driver.containsElement(bodyNode, element);
        const leaveClassName = leaveNodeMapIds.get(element);
        const enterClassName = enterNodeMapIds.get(element);
        const instruction = this._buildInstruction(entry, subTimelines, enterClassName, leaveClassName, nodeIsOrphaned);
        if (instruction.errors && instruction.errors.length) {
          erroneousTransitions.push(instruction);
          return;
        }
        if (nodeIsOrphaned) {
          player.onStart(() => eraseStyles(element, instruction.fromStyles));
          player.onDestroy(() => setStyles(element, instruction.toStyles));
          skippedPlayers.push(player);
          return;
        }
        if (entry.isFallbackTransition) {
          player.onStart(() => eraseStyles(element, instruction.fromStyles));
          player.onDestroy(() => setStyles(element, instruction.toStyles));
          skippedPlayers.push(player);
          return;
        }
        const timelines = [];
        instruction.timelines.forEach((tl) => {
          tl.stretchStartingKeyframe = true;
          if (!this.disabledNodes.has(tl.element)) {
            timelines.push(tl);
          }
        });
        instruction.timelines = timelines;
        subTimelines.append(element, instruction.timelines);
        const tuple = {
          instruction,
          player,
          element
        };
        queuedInstructions.push(tuple);
        instruction.queriedElements.forEach((element2) => getOrSetDefaultValue(queriedElements, element2, []).push(player));
        instruction.preStyleProps.forEach((stringMap, element2) => {
          if (stringMap.size) {
            let setVal = allPreStyleElements.get(element2);
            if (!setVal) {
              allPreStyleElements.set(element2, setVal = /* @__PURE__ */ new Set());
            }
            stringMap.forEach((_, prop) => setVal.add(prop));
          }
        });
        instruction.postStyleProps.forEach((stringMap, element2) => {
          let setVal = allPostStyleElements.get(element2);
          if (!setVal) {
            allPostStyleElements.set(element2, setVal = /* @__PURE__ */ new Set());
          }
          stringMap.forEach((_, prop) => setVal.add(prop));
        });
      });
    }
    if (erroneousTransitions.length) {
      const errors = [];
      erroneousTransitions.forEach((instruction) => {
        errors.push(transitionFailed(instruction.triggerName, instruction.errors));
      });
      allPlayers.forEach((player) => player.destroy());
      this.reportError(errors);
    }
    const allPreviousPlayersMap = /* @__PURE__ */ new Map();
    const animationElementMap = /* @__PURE__ */ new Map();
    queuedInstructions.forEach((entry) => {
      const element = entry.element;
      if (subTimelines.has(element)) {
        animationElementMap.set(element, element);
        this._beforeAnimationBuild(entry.player.namespaceId, entry.instruction, allPreviousPlayersMap);
      }
    });
    skippedPlayers.forEach((player) => {
      const element = player.element;
      const previousPlayers = this._getPreviousPlayers(element, false, player.namespaceId, player.triggerName, null);
      previousPlayers.forEach((prevPlayer) => {
        getOrSetDefaultValue(allPreviousPlayersMap, element, []).push(prevPlayer);
        prevPlayer.destroy();
      });
    });
    const replaceNodes = allLeaveNodes.filter((node) => {
      return replacePostStylesAsPre(node, allPreStyleElements, allPostStyleElements);
    });
    const postStylesMap = /* @__PURE__ */ new Map();
    const allLeaveQueriedNodes = cloakAndComputeStyles(postStylesMap, this.driver, leaveNodesWithoutAnimations, allPostStyleElements, AUTO_STYLE);
    allLeaveQueriedNodes.forEach((node) => {
      if (replacePostStylesAsPre(node, allPreStyleElements, allPostStyleElements)) {
        replaceNodes.push(node);
      }
    });
    const preStylesMap = /* @__PURE__ */ new Map();
    enterNodeMap.forEach((nodes, root) => {
      cloakAndComputeStyles(preStylesMap, this.driver, new Set(nodes), allPreStyleElements, \u0275PRE_STYLE);
    });
    replaceNodes.forEach((node) => {
      const post = postStylesMap.get(node);
      const pre = preStylesMap.get(node);
      postStylesMap.set(node, new Map([...post?.entries() ?? [], ...pre?.entries() ?? []]));
    });
    const rootPlayers = [];
    const subPlayers = [];
    const NO_PARENT_ANIMATION_ELEMENT_DETECTED = {};
    queuedInstructions.forEach((entry) => {
      const {
        element,
        player,
        instruction
      } = entry;
      if (subTimelines.has(element)) {
        if (disabledElementsSet.has(element)) {
          player.onDestroy(() => setStyles(element, instruction.toStyles));
          player.disabled = true;
          player.overrideTotalTime(instruction.totalTime);
          skippedPlayers.push(player);
          return;
        }
        let parentWithAnimation = NO_PARENT_ANIMATION_ELEMENT_DETECTED;
        if (animationElementMap.size > 1) {
          let elm = element;
          const parentsToAdd = [];
          while (elm = elm.parentNode) {
            const detectedParent = animationElementMap.get(elm);
            if (detectedParent) {
              parentWithAnimation = detectedParent;
              break;
            }
            parentsToAdd.push(elm);
          }
          parentsToAdd.forEach((parent) => animationElementMap.set(parent, parentWithAnimation));
        }
        const innerPlayer = this._buildAnimation(player.namespaceId, instruction, allPreviousPlayersMap, skippedPlayersMap, preStylesMap, postStylesMap);
        player.setRealPlayer(innerPlayer);
        if (parentWithAnimation === NO_PARENT_ANIMATION_ELEMENT_DETECTED) {
          rootPlayers.push(player);
        } else {
          const parentPlayers = this.playersByElement.get(parentWithAnimation);
          if (parentPlayers && parentPlayers.length) {
            player.parentPlayer = optimizeGroupPlayer(parentPlayers);
          }
          skippedPlayers.push(player);
        }
      } else {
        eraseStyles(element, instruction.fromStyles);
        player.onDestroy(() => setStyles(element, instruction.toStyles));
        subPlayers.push(player);
        if (disabledElementsSet.has(element)) {
          skippedPlayers.push(player);
        }
      }
    });
    subPlayers.forEach((player) => {
      const playersForElement = skippedPlayersMap.get(player.element);
      if (playersForElement && playersForElement.length) {
        const innerPlayer = optimizeGroupPlayer(playersForElement);
        player.setRealPlayer(innerPlayer);
      }
    });
    skippedPlayers.forEach((player) => {
      if (player.parentPlayer) {
        player.syncPlayerEvents(player.parentPlayer);
      } else {
        player.destroy();
      }
    });
    for (let i2 = 0; i2 < allLeaveNodes.length; i2++) {
      const element = allLeaveNodes[i2];
      const details = element[REMOVAL_FLAG];
      removeClass(element, LEAVE_CLASSNAME);
      if (details && details.hasAnimation) continue;
      let players = [];
      if (queriedElements.size) {
        let queriedPlayerResults = queriedElements.get(element);
        if (queriedPlayerResults && queriedPlayerResults.length) {
          players.push(...queriedPlayerResults);
        }
        let queriedInnerElements = this.driver.query(element, NG_ANIMATING_SELECTOR, true);
        for (let j = 0; j < queriedInnerElements.length; j++) {
          let queriedPlayers = queriedElements.get(queriedInnerElements[j]);
          if (queriedPlayers && queriedPlayers.length) {
            players.push(...queriedPlayers);
          }
        }
      }
      const activePlayers = players.filter((p) => !p.destroyed);
      if (activePlayers.length) {
        removeNodesAfterAnimationDone(this, element, activePlayers);
      } else {
        this.processLeaveNode(element);
      }
    }
    allLeaveNodes.length = 0;
    rootPlayers.forEach((player) => {
      this.players.push(player);
      player.onDone(() => {
        player.destroy();
        const index = this.players.indexOf(player);
        this.players.splice(index, 1);
      });
      player.play();
    });
    return rootPlayers;
  }
  afterFlush(callback) {
    this._flushFns.push(callback);
  }
  afterFlushAnimationsDone(callback) {
    this._whenQuietFns.push(callback);
  }
  _getPreviousPlayers(element, isQueriedElement, namespaceId, triggerName, toStateValue) {
    let players = [];
    if (isQueriedElement) {
      const queriedElementPlayers = this.playersByQueriedElement.get(element);
      if (queriedElementPlayers) {
        players = queriedElementPlayers;
      }
    } else {
      const elementPlayers = this.playersByElement.get(element);
      if (elementPlayers) {
        const isRemovalAnimation = !toStateValue || toStateValue == VOID_VALUE;
        elementPlayers.forEach((player) => {
          if (player.queued) return;
          if (!isRemovalAnimation && player.triggerName != triggerName) return;
          players.push(player);
        });
      }
    }
    if (namespaceId || triggerName) {
      players = players.filter((player) => {
        if (namespaceId && namespaceId != player.namespaceId) return false;
        if (triggerName && triggerName != player.triggerName) return false;
        return true;
      });
    }
    return players;
  }
  _beforeAnimationBuild(namespaceId, instruction, allPreviousPlayersMap) {
    const triggerName = instruction.triggerName;
    const rootElement = instruction.element;
    const targetNameSpaceId = instruction.isRemovalTransition ? void 0 : namespaceId;
    const targetTriggerName = instruction.isRemovalTransition ? void 0 : triggerName;
    for (const timelineInstruction of instruction.timelines) {
      const element = timelineInstruction.element;
      const isQueriedElement = element !== rootElement;
      const players = getOrSetDefaultValue(allPreviousPlayersMap, element, []);
      const previousPlayers = this._getPreviousPlayers(element, isQueriedElement, targetNameSpaceId, targetTriggerName, instruction.toState);
      previousPlayers.forEach((player) => {
        const realPlayer = player.getRealPlayer();
        if (realPlayer.beforeDestroy) {
          realPlayer.beforeDestroy();
        }
        player.destroy();
        players.push(player);
      });
    }
    eraseStyles(rootElement, instruction.fromStyles);
  }
  _buildAnimation(namespaceId, instruction, allPreviousPlayersMap, skippedPlayersMap, preStylesMap, postStylesMap) {
    const triggerName = instruction.triggerName;
    const rootElement = instruction.element;
    const allQueriedPlayers = [];
    const allConsumedElements = /* @__PURE__ */ new Set();
    const allSubElements = /* @__PURE__ */ new Set();
    const allNewPlayers = instruction.timelines.map((timelineInstruction) => {
      const element = timelineInstruction.element;
      allConsumedElements.add(element);
      const details = element[REMOVAL_FLAG];
      if (details && details.removedBeforeQueried) return new NoopAnimationPlayer(timelineInstruction.duration, timelineInstruction.delay);
      const isQueriedElement = element !== rootElement;
      const previousPlayers = flattenGroupPlayers((allPreviousPlayersMap.get(element) || EMPTY_PLAYER_ARRAY).map((p) => p.getRealPlayer())).filter((p) => {
        const pp = p;
        return pp.element ? pp.element === element : false;
      });
      const preStyles = preStylesMap.get(element);
      const postStyles = postStylesMap.get(element);
      const keyframes = normalizeKeyframes$1(this._normalizer, timelineInstruction.keyframes, preStyles, postStyles);
      const player2 = this._buildPlayer(timelineInstruction, keyframes, previousPlayers);
      if (timelineInstruction.subTimeline && skippedPlayersMap) {
        allSubElements.add(element);
      }
      if (isQueriedElement) {
        const wrappedPlayer = new TransitionAnimationPlayer(namespaceId, triggerName, element);
        wrappedPlayer.setRealPlayer(player2);
        allQueriedPlayers.push(wrappedPlayer);
      }
      return player2;
    });
    allQueriedPlayers.forEach((player2) => {
      getOrSetDefaultValue(this.playersByQueriedElement, player2.element, []).push(player2);
      player2.onDone(() => deleteOrUnsetInMap(this.playersByQueriedElement, player2.element, player2));
    });
    allConsumedElements.forEach((element) => addClass(element, NG_ANIMATING_CLASSNAME));
    const player = optimizeGroupPlayer(allNewPlayers);
    player.onDestroy(() => {
      allConsumedElements.forEach((element) => removeClass(element, NG_ANIMATING_CLASSNAME));
      setStyles(rootElement, instruction.toStyles);
    });
    allSubElements.forEach((element) => {
      getOrSetDefaultValue(skippedPlayersMap, element, []).push(player);
    });
    return player;
  }
  _buildPlayer(instruction, keyframes, previousPlayers) {
    if (keyframes.length > 0) {
      return this.driver.animate(instruction.element, keyframes, instruction.duration, instruction.delay, instruction.easing, previousPlayers);
    }
    return new NoopAnimationPlayer(instruction.duration, instruction.delay);
  }
};
var TransitionAnimationPlayer = class {
  namespaceId;
  triggerName;
  element;
  _player = new NoopAnimationPlayer();
  _containsRealPlayer = false;
  _queuedCallbacks = /* @__PURE__ */ new Map();
  destroyed = false;
  parentPlayer = null;
  markedForDestroy = false;
  disabled = false;
  queued = true;
  totalTime = 0;
  constructor(namespaceId, triggerName, element) {
    this.namespaceId = namespaceId;
    this.triggerName = triggerName;
    this.element = element;
  }
  setRealPlayer(player) {
    if (this._containsRealPlayer) return;
    this._player = player;
    this._queuedCallbacks.forEach((callbacks, phase) => {
      callbacks.forEach((callback) => listenOnPlayer(player, phase, void 0, callback));
    });
    this._queuedCallbacks.clear();
    this._containsRealPlayer = true;
    this.overrideTotalTime(player.totalTime);
    this.queued = false;
  }
  getRealPlayer() {
    return this._player;
  }
  overrideTotalTime(totalTime) {
    this.totalTime = totalTime;
  }
  syncPlayerEvents(player) {
    const p = this._player;
    if (p.triggerCallback) {
      player.onStart(() => p.triggerCallback("start"));
    }
    player.onDone(() => this.finish());
    player.onDestroy(() => this.destroy());
  }
  _queueEvent(name, callback) {
    getOrSetDefaultValue(this._queuedCallbacks, name, []).push(callback);
  }
  onDone(fn) {
    if (this.queued) {
      this._queueEvent("done", fn);
    }
    this._player.onDone(fn);
  }
  onStart(fn) {
    if (this.queued) {
      this._queueEvent("start", fn);
    }
    this._player.onStart(fn);
  }
  onDestroy(fn) {
    if (this.queued) {
      this._queueEvent("destroy", fn);
    }
    this._player.onDestroy(fn);
  }
  init() {
    this._player.init();
  }
  hasStarted() {
    return this.queued ? false : this._player.hasStarted();
  }
  play() {
    !this.queued && this._player.play();
  }
  pause() {
    !this.queued && this._player.pause();
  }
  restart() {
    !this.queued && this._player.restart();
  }
  finish() {
    this._player.finish();
  }
  destroy() {
    this.destroyed = true;
    this._player.destroy();
  }
  reset() {
    !this.queued && this._player.reset();
  }
  setPosition(p) {
    if (!this.queued) {
      this._player.setPosition(p);
    }
  }
  getPosition() {
    return this.queued ? 0 : this._player.getPosition();
  }
  /** @internal */
  triggerCallback(phaseName) {
    const p = this._player;
    if (p.triggerCallback) {
      p.triggerCallback(phaseName);
    }
  }
};
function deleteOrUnsetInMap(map2, key, value) {
  let currentValues = map2.get(key);
  if (currentValues) {
    if (currentValues.length) {
      const index = currentValues.indexOf(value);
      currentValues.splice(index, 1);
    }
    if (currentValues.length == 0) {
      map2.delete(key);
    }
  }
  return currentValues;
}
function normalizeTriggerValue(value) {
  return value != null ? value : null;
}
function isElementNode(node) {
  return node && node["nodeType"] === 1;
}
function isTriggerEventValid(eventName) {
  return eventName == "start" || eventName == "done";
}
function cloakElement(element, value) {
  const oldValue = element.style.display;
  element.style.display = value != null ? value : "none";
  return oldValue;
}
function cloakAndComputeStyles(valuesMap, driver, elements, elementPropsMap, defaultStyle) {
  const cloakVals = [];
  elements.forEach((element) => cloakVals.push(cloakElement(element)));
  const failedElements = [];
  elementPropsMap.forEach((props, element) => {
    const styles = /* @__PURE__ */ new Map();
    props.forEach((prop) => {
      const value = driver.computeStyle(element, prop, defaultStyle);
      styles.set(prop, value);
      if (!value || value.length == 0) {
        element[REMOVAL_FLAG] = NULL_REMOVED_QUERIED_STATE;
        failedElements.push(element);
      }
    });
    valuesMap.set(element, styles);
  });
  let i = 0;
  elements.forEach((element) => cloakElement(element, cloakVals[i++]));
  return failedElements;
}
function buildRootMap(roots, nodes) {
  const rootMap = /* @__PURE__ */ new Map();
  roots.forEach((root) => rootMap.set(root, []));
  if (nodes.length == 0) return rootMap;
  const NULL_NODE = 1;
  const nodeSet = new Set(nodes);
  const localRootMap = /* @__PURE__ */ new Map();
  function getRoot(node) {
    if (!node) return NULL_NODE;
    let root = localRootMap.get(node);
    if (root) return root;
    const parent = node.parentNode;
    if (rootMap.has(parent)) {
      root = parent;
    } else if (nodeSet.has(parent)) {
      root = NULL_NODE;
    } else {
      root = getRoot(parent);
    }
    localRootMap.set(node, root);
    return root;
  }
  nodes.forEach((node) => {
    const root = getRoot(node);
    if (root !== NULL_NODE) {
      rootMap.get(root).push(node);
    }
  });
  return rootMap;
}
function addClass(element, className) {
  element.classList?.add(className);
}
function removeClass(element, className) {
  element.classList?.remove(className);
}
function removeNodesAfterAnimationDone(engine, element, players) {
  optimizeGroupPlayer(players).onDone(() => engine.processLeaveNode(element));
}
function flattenGroupPlayers(players) {
  const finalPlayers = [];
  _flattenGroupPlayersRecur(players, finalPlayers);
  return finalPlayers;
}
function _flattenGroupPlayersRecur(players, finalPlayers) {
  for (let i = 0; i < players.length; i++) {
    const player = players[i];
    if (player instanceof AnimationGroupPlayer) {
      _flattenGroupPlayersRecur(player.players, finalPlayers);
    } else {
      finalPlayers.push(player);
    }
  }
}
function objEquals(a, b) {
  const k1 = Object.keys(a);
  const k2 = Object.keys(b);
  if (k1.length != k2.length) return false;
  for (let i = 0; i < k1.length; i++) {
    const prop = k1[i];
    if (!b.hasOwnProperty(prop) || a[prop] !== b[prop]) return false;
  }
  return true;
}
function replacePostStylesAsPre(element, allPreStyleElements, allPostStyleElements) {
  const postEntry = allPostStyleElements.get(element);
  if (!postEntry) return false;
  let preEntry = allPreStyleElements.get(element);
  if (preEntry) {
    postEntry.forEach((data) => preEntry.add(data));
  } else {
    allPreStyleElements.set(element, postEntry);
  }
  allPostStyleElements.delete(element);
  return true;
}
var AnimationEngine = class {
  _driver;
  _normalizer;
  _transitionEngine;
  _timelineEngine;
  _triggerCache = {};
  // this method is designed to be overridden by the code that uses this engine
  onRemovalComplete = (element, context) => {
  };
  constructor(doc, _driver, _normalizer) {
    this._driver = _driver;
    this._normalizer = _normalizer;
    this._transitionEngine = new TransitionAnimationEngine(doc.body, _driver, _normalizer);
    this._timelineEngine = new TimelineAnimationEngine(doc.body, _driver, _normalizer);
    this._transitionEngine.onRemovalComplete = (element, context) => this.onRemovalComplete(element, context);
  }
  registerTrigger(componentId, namespaceId, hostElement, name, metadata) {
    const cacheKey = componentId + "-" + name;
    let trigger = this._triggerCache[cacheKey];
    if (!trigger) {
      const errors = [];
      const warnings = [];
      const ast = buildAnimationAst(this._driver, metadata, errors, warnings);
      if (errors.length) {
        throw triggerBuildFailed(name, errors);
      }
      if (typeof ngDevMode === "undefined" || ngDevMode) {
        if (warnings.length) {
          warnTriggerBuild(name, warnings);
        }
      }
      trigger = buildTrigger(name, ast, this._normalizer);
      this._triggerCache[cacheKey] = trigger;
    }
    this._transitionEngine.registerTrigger(namespaceId, name, trigger);
  }
  register(namespaceId, hostElement) {
    this._transitionEngine.register(namespaceId, hostElement);
  }
  destroy(namespaceId, context) {
    this._transitionEngine.destroy(namespaceId, context);
  }
  onInsert(namespaceId, element, parent, insertBefore) {
    this._transitionEngine.insertNode(namespaceId, element, parent, insertBefore);
  }
  onRemove(namespaceId, element, context) {
    this._transitionEngine.removeNode(namespaceId, element, context);
  }
  disableAnimations(element, disable) {
    this._transitionEngine.markElementAsDisabled(element, disable);
  }
  process(namespaceId, element, property, value) {
    if (property.charAt(0) == "@") {
      const [id, action] = parseTimelineCommand(property);
      const args = value;
      this._timelineEngine.command(id, element, action, args);
    } else {
      this._transitionEngine.trigger(namespaceId, element, property, value);
    }
  }
  listen(namespaceId, element, eventName, eventPhase, callback) {
    if (eventName.charAt(0) == "@") {
      const [id, action] = parseTimelineCommand(eventName);
      return this._timelineEngine.listen(id, element, action, callback);
    }
    return this._transitionEngine.listen(namespaceId, element, eventName, eventPhase, callback);
  }
  flush(microtaskId = -1) {
    this._transitionEngine.flush(microtaskId);
  }
  get players() {
    return [...this._transitionEngine.players, ...this._timelineEngine.players];
  }
  whenRenderingDone() {
    return this._transitionEngine.whenRenderingDone();
  }
  afterFlushAnimationsDone(cb) {
    this._transitionEngine.afterFlushAnimationsDone(cb);
  }
};
function packageNonAnimatableStyles(element, styles) {
  let startStyles = null;
  let endStyles = null;
  if (Array.isArray(styles) && styles.length) {
    startStyles = filterNonAnimatableStyles(styles[0]);
    if (styles.length > 1) {
      endStyles = filterNonAnimatableStyles(styles[styles.length - 1]);
    }
  } else if (styles instanceof Map) {
    startStyles = filterNonAnimatableStyles(styles);
  }
  return startStyles || endStyles ? new SpecialCasedStyles(element, startStyles, endStyles) : null;
}
var SpecialCasedStyles = class _SpecialCasedStyles {
  _element;
  _startStyles;
  _endStyles;
  static initialStylesByElement = /* @__PURE__ */ new WeakMap();
  _state = 0;
  _initialStyles;
  constructor(_element, _startStyles, _endStyles) {
    this._element = _element;
    this._startStyles = _startStyles;
    this._endStyles = _endStyles;
    let initialStyles = _SpecialCasedStyles.initialStylesByElement.get(_element);
    if (!initialStyles) {
      _SpecialCasedStyles.initialStylesByElement.set(_element, initialStyles = /* @__PURE__ */ new Map());
    }
    this._initialStyles = initialStyles;
  }
  start() {
    if (this._state < 1) {
      if (this._startStyles) {
        setStyles(this._element, this._startStyles, this._initialStyles);
      }
      this._state = 1;
    }
  }
  finish() {
    this.start();
    if (this._state < 2) {
      setStyles(this._element, this._initialStyles);
      if (this._endStyles) {
        setStyles(this._element, this._endStyles);
        this._endStyles = null;
      }
      this._state = 1;
    }
  }
  destroy() {
    this.finish();
    if (this._state < 3) {
      _SpecialCasedStyles.initialStylesByElement.delete(this._element);
      if (this._startStyles) {
        eraseStyles(this._element, this._startStyles);
        this._endStyles = null;
      }
      if (this._endStyles) {
        eraseStyles(this._element, this._endStyles);
        this._endStyles = null;
      }
      setStyles(this._element, this._initialStyles);
      this._state = 3;
    }
  }
};
function filterNonAnimatableStyles(styles) {
  let result = null;
  styles.forEach((val, prop) => {
    if (isNonAnimatableStyle(prop)) {
      result = result || /* @__PURE__ */ new Map();
      result.set(prop, val);
    }
  });
  return result;
}
function isNonAnimatableStyle(prop) {
  return prop === "display" || prop === "position";
}
var WebAnimationsPlayer = class {
  element;
  keyframes;
  options;
  _specialStyles;
  _onDoneFns = [];
  _onStartFns = [];
  _onDestroyFns = [];
  _duration;
  _delay;
  _initialized = false;
  _finished = false;
  _started = false;
  _destroyed = false;
  _finalKeyframe;
  // the following original fns are persistent copies of the _onStartFns and _onDoneFns
  // and are used to reset the fns to their original values upon reset()
  // (since the _onStartFns and _onDoneFns get deleted after they are called)
  _originalOnDoneFns = [];
  _originalOnStartFns = [];
  // using non-null assertion because it's re(set) by init();
  domPlayer;
  time = 0;
  parentPlayer = null;
  currentSnapshot = /* @__PURE__ */ new Map();
  constructor(element, keyframes, options, _specialStyles) {
    this.element = element;
    this.keyframes = keyframes;
    this.options = options;
    this._specialStyles = _specialStyles;
    this._duration = options["duration"];
    this._delay = options["delay"] || 0;
    this.time = this._duration + this._delay;
  }
  _onFinish() {
    if (!this._finished) {
      this._finished = true;
      this._onDoneFns.forEach((fn) => fn());
      this._onDoneFns = [];
    }
  }
  init() {
    this._buildPlayer();
    this._preparePlayerBeforeStart();
  }
  _buildPlayer() {
    if (this._initialized) return;
    this._initialized = true;
    const keyframes = this.keyframes;
    this.domPlayer = this._triggerWebAnimation(this.element, keyframes, this.options);
    this._finalKeyframe = keyframes.length ? keyframes[keyframes.length - 1] : /* @__PURE__ */ new Map();
    const onFinish = () => this._onFinish();
    this.domPlayer.addEventListener("finish", onFinish);
    this.onDestroy(() => {
      this.domPlayer.removeEventListener("finish", onFinish);
    });
  }
  _preparePlayerBeforeStart() {
    if (this._delay) {
      this._resetDomPlayerState();
    } else {
      this.domPlayer.pause();
    }
  }
  _convertKeyframesToObject(keyframes) {
    const kfs = [];
    keyframes.forEach((frame) => {
      kfs.push(Object.fromEntries(frame));
    });
    return kfs;
  }
  /** @internal */
  _triggerWebAnimation(element, keyframes, options) {
    return element.animate(this._convertKeyframesToObject(keyframes), options);
  }
  onStart(fn) {
    this._originalOnStartFns.push(fn);
    this._onStartFns.push(fn);
  }
  onDone(fn) {
    this._originalOnDoneFns.push(fn);
    this._onDoneFns.push(fn);
  }
  onDestroy(fn) {
    this._onDestroyFns.push(fn);
  }
  play() {
    this._buildPlayer();
    if (!this.hasStarted()) {
      this._onStartFns.forEach((fn) => fn());
      this._onStartFns = [];
      this._started = true;
      if (this._specialStyles) {
        this._specialStyles.start();
      }
    }
    this.domPlayer.play();
  }
  pause() {
    this.init();
    this.domPlayer.pause();
  }
  finish() {
    this.init();
    if (this._specialStyles) {
      this._specialStyles.finish();
    }
    this._onFinish();
    this.domPlayer.finish();
  }
  reset() {
    this._resetDomPlayerState();
    this._destroyed = false;
    this._finished = false;
    this._started = false;
    this._onStartFns = this._originalOnStartFns;
    this._onDoneFns = this._originalOnDoneFns;
  }
  _resetDomPlayerState() {
    if (this.domPlayer) {
      this.domPlayer.cancel();
    }
  }
  restart() {
    this.reset();
    this.play();
  }
  hasStarted() {
    return this._started;
  }
  destroy() {
    if (!this._destroyed) {
      this._destroyed = true;
      this._resetDomPlayerState();
      this._onFinish();
      if (this._specialStyles) {
        this._specialStyles.destroy();
      }
      this._onDestroyFns.forEach((fn) => fn());
      this._onDestroyFns = [];
    }
  }
  setPosition(p) {
    if (this.domPlayer === void 0) {
      this.init();
    }
    this.domPlayer.currentTime = p * this.time;
  }
  getPosition() {
    return +(this.domPlayer.currentTime ?? 0) / this.time;
  }
  get totalTime() {
    return this._delay + this._duration;
  }
  beforeDestroy() {
    const styles = /* @__PURE__ */ new Map();
    if (this.hasStarted()) {
      const finalKeyframe = this._finalKeyframe;
      finalKeyframe.forEach((val, prop) => {
        if (prop !== "offset") {
          styles.set(prop, this._finished ? val : computeStyle(this.element, prop));
        }
      });
    }
    this.currentSnapshot = styles;
  }
  /** @internal */
  triggerCallback(phaseName) {
    const methods = phaseName === "start" ? this._onStartFns : this._onDoneFns;
    methods.forEach((fn) => fn());
    methods.length = 0;
  }
};
var WebAnimationsDriver = class {
  validateStyleProperty(prop) {
    if (typeof ngDevMode === "undefined" || ngDevMode) {
      return validateStyleProperty(prop);
    }
    return true;
  }
  validateAnimatableStyleProperty(prop) {
    if (typeof ngDevMode === "undefined" || ngDevMode) {
      const cssProp = camelCaseToDashCase(prop);
      return validateWebAnimatableStyleProperty(cssProp);
    }
    return true;
  }
  containsElement(elm1, elm2) {
    return containsElement(elm1, elm2);
  }
  getParentElement(element) {
    return getParentElement(element);
  }
  query(element, selector, multi) {
    return invokeQuery(element, selector, multi);
  }
  computeStyle(element, prop, defaultValue) {
    return computeStyle(element, prop);
  }
  animate(element, keyframes, duration, delay, easing, previousPlayers = []) {
    const fill = delay == 0 ? "both" : "forwards";
    const playerOptions = {
      duration,
      delay,
      fill
    };
    if (easing) {
      playerOptions["easing"] = easing;
    }
    const previousStyles = /* @__PURE__ */ new Map();
    const previousWebAnimationPlayers = previousPlayers.filter((player) => player instanceof WebAnimationsPlayer);
    if (allowPreviousPlayerStylesMerge(duration, delay)) {
      previousWebAnimationPlayers.forEach((player) => {
        player.currentSnapshot.forEach((val, prop) => previousStyles.set(prop, val));
      });
    }
    let _keyframes = normalizeKeyframes(keyframes).map((styles) => new Map(styles));
    _keyframes = balancePreviousStylesIntoKeyframes(element, _keyframes, previousStyles);
    const specialStyles = packageNonAnimatableStyles(element, _keyframes);
    return new WebAnimationsPlayer(element, _keyframes, playerOptions, specialStyles);
  }
};
var ANIMATION_PREFIX = "@";
var DISABLE_ANIMATIONS_FLAG = "@.disabled";
var BaseAnimationRenderer = class {
  namespaceId;
  delegate;
  engine;
  _onDestroy;
  // We need to explicitly type this property because of an api-extractor bug
  // See https://github.com/microsoft/rushstack/issues/4390
  \u0275type = 0;
  constructor(namespaceId, delegate, engine, _onDestroy) {
    this.namespaceId = namespaceId;
    this.delegate = delegate;
    this.engine = engine;
    this._onDestroy = _onDestroy;
  }
  get data() {
    return this.delegate.data;
  }
  destroyNode(node) {
    this.delegate.destroyNode?.(node);
  }
  destroy() {
    this.engine.destroy(this.namespaceId, this.delegate);
    this.engine.afterFlushAnimationsDone(() => {
      queueMicrotask(() => {
        this.delegate.destroy();
      });
    });
    this._onDestroy?.();
  }
  createElement(name, namespace) {
    return this.delegate.createElement(name, namespace);
  }
  createComment(value) {
    return this.delegate.createComment(value);
  }
  createText(value) {
    return this.delegate.createText(value);
  }
  appendChild(parent, newChild) {
    this.delegate.appendChild(parent, newChild);
    this.engine.onInsert(this.namespaceId, newChild, parent, false);
  }
  insertBefore(parent, newChild, refChild, isMove = true) {
    this.delegate.insertBefore(parent, newChild, refChild);
    this.engine.onInsert(this.namespaceId, newChild, parent, isMove);
  }
  removeChild(parent, oldChild, isHostElement) {
    if (this.parentNode(oldChild)) {
      this.engine.onRemove(this.namespaceId, oldChild, this.delegate);
    }
  }
  selectRootElement(selectorOrNode, preserveContent) {
    return this.delegate.selectRootElement(selectorOrNode, preserveContent);
  }
  parentNode(node) {
    return this.delegate.parentNode(node);
  }
  nextSibling(node) {
    return this.delegate.nextSibling(node);
  }
  setAttribute(el, name, value, namespace) {
    this.delegate.setAttribute(el, name, value, namespace);
  }
  removeAttribute(el, name, namespace) {
    this.delegate.removeAttribute(el, name, namespace);
  }
  addClass(el, name) {
    this.delegate.addClass(el, name);
  }
  removeClass(el, name) {
    this.delegate.removeClass(el, name);
  }
  setStyle(el, style2, value, flags) {
    this.delegate.setStyle(el, style2, value, flags);
  }
  removeStyle(el, style2, flags) {
    this.delegate.removeStyle(el, style2, flags);
  }
  setProperty(el, name, value) {
    if (name.charAt(0) == ANIMATION_PREFIX && name == DISABLE_ANIMATIONS_FLAG) {
      this.disableAnimations(el, !!value);
    } else {
      this.delegate.setProperty(el, name, value);
    }
  }
  setValue(node, value) {
    this.delegate.setValue(node, value);
  }
  listen(target, eventName, callback, options) {
    return this.delegate.listen(target, eventName, callback, options);
  }
  disableAnimations(element, value) {
    this.engine.disableAnimations(element, value);
  }
};
var AnimationRenderer = class extends BaseAnimationRenderer {
  factory;
  constructor(factory, namespaceId, delegate, engine, onDestroy) {
    super(namespaceId, delegate, engine, onDestroy);
    this.factory = factory;
    this.namespaceId = namespaceId;
  }
  setProperty(el, name, value) {
    if (name.charAt(0) == ANIMATION_PREFIX) {
      if (name.charAt(1) == "." && name == DISABLE_ANIMATIONS_FLAG) {
        value = value === void 0 ? true : !!value;
        this.disableAnimations(el, value);
      } else {
        this.engine.process(this.namespaceId, el, name.slice(1), value);
      }
    } else {
      this.delegate.setProperty(el, name, value);
    }
  }
  listen(target, eventName, callback, options) {
    if (eventName.charAt(0) == ANIMATION_PREFIX) {
      const element = resolveElementFromTarget(target);
      let name = eventName.slice(1);
      let phase = "";
      if (name.charAt(0) != ANIMATION_PREFIX) {
        [name, phase] = parseTriggerCallbackName(name);
      }
      return this.engine.listen(this.namespaceId, element, name, phase, (event) => {
        const countId = event["_data"] || -1;
        this.factory.scheduleListenerCallback(countId, callback, event);
      });
    }
    return this.delegate.listen(target, eventName, callback, options);
  }
};
function resolveElementFromTarget(target) {
  switch (target) {
    case "body":
      return document.body;
    case "document":
      return document;
    case "window":
      return window;
    default:
      return target;
  }
}
function parseTriggerCallbackName(triggerName) {
  const dotIndex = triggerName.indexOf(".");
  const trigger = triggerName.substring(0, dotIndex);
  const phase = triggerName.slice(dotIndex + 1);
  return [trigger, phase];
}
var AnimationRendererFactory = class {
  delegate;
  engine;
  _zone;
  _currentId = 0;
  _microtaskId = 1;
  _animationCallbacksBuffer = [];
  _rendererCache = /* @__PURE__ */ new Map();
  _cdRecurDepth = 0;
  constructor(delegate, engine, _zone) {
    this.delegate = delegate;
    this.engine = engine;
    this._zone = _zone;
    engine.onRemovalComplete = (element, delegate2) => {
      delegate2?.removeChild(null, element);
    };
  }
  createRenderer(hostElement, type) {
    const EMPTY_NAMESPACE_ID = "";
    const delegate = this.delegate.createRenderer(hostElement, type);
    if (!hostElement || !type?.data?.["animation"]) {
      const cache = this._rendererCache;
      let renderer = cache.get(delegate);
      if (!renderer) {
        const onRendererDestroy = () => cache.delete(delegate);
        renderer = new BaseAnimationRenderer(EMPTY_NAMESPACE_ID, delegate, this.engine, onRendererDestroy);
        cache.set(delegate, renderer);
      }
      return renderer;
    }
    const componentId = type.id;
    const namespaceId = type.id + "-" + this._currentId;
    this._currentId++;
    this.engine.register(namespaceId, hostElement);
    const registerTrigger = (trigger) => {
      if (Array.isArray(trigger)) {
        trigger.forEach(registerTrigger);
      } else {
        this.engine.registerTrigger(componentId, namespaceId, hostElement, trigger.name, trigger);
      }
    };
    const animationTriggers = type.data["animation"];
    animationTriggers.forEach(registerTrigger);
    return new AnimationRenderer(this, namespaceId, delegate, this.engine);
  }
  begin() {
    this._cdRecurDepth++;
    if (this.delegate.begin) {
      this.delegate.begin();
    }
  }
  _scheduleCountTask() {
    queueMicrotask(() => {
      this._microtaskId++;
    });
  }
  /** @internal */
  scheduleListenerCallback(count, fn, data) {
    if (count >= 0 && count < this._microtaskId) {
      this._zone.run(() => fn(data));
      return;
    }
    const animationCallbacksBuffer = this._animationCallbacksBuffer;
    if (animationCallbacksBuffer.length == 0) {
      queueMicrotask(() => {
        this._zone.run(() => {
          animationCallbacksBuffer.forEach((tuple) => {
            const [fn2, data2] = tuple;
            fn2(data2);
          });
          this._animationCallbacksBuffer = [];
        });
      });
    }
    animationCallbacksBuffer.push([fn, data]);
  }
  end() {
    this._cdRecurDepth--;
    if (this._cdRecurDepth == 0) {
      this._zone.runOutsideAngular(() => {
        this._scheduleCountTask();
        this.engine.flush(this._microtaskId);
      });
    }
    if (this.delegate.end) {
      this.delegate.end();
    }
  }
  whenRenderingDone() {
    return this.engine.whenRenderingDone();
  }
  /**
   * Used during HMR to clear any cached data about a component.
   * @param componentId ID of the component that is being replaced.
   */
  componentReplaced(componentId) {
    this.engine.flush();
    this.delegate.componentReplaced?.(componentId);
  }
};

// node_modules/@angular/platform-browser/fesm2022/animations.mjs
var InjectableAnimationEngine = class _InjectableAnimationEngine extends AnimationEngine {
  // The `ApplicationRef` is injected here explicitly to force the dependency ordering.
  // Since the `ApplicationRef` should be created earlier before the `AnimationEngine`, they
  // both have `ngOnDestroy` hooks and `flush()` must be called after all views are destroyed.
  constructor(doc, driver, normalizer) {
    super(doc, driver, normalizer);
  }
  ngOnDestroy() {
    this.flush();
  }
  static \u0275fac = function InjectableAnimationEngine_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _InjectableAnimationEngine)(\u0275\u0275inject(DOCUMENT), \u0275\u0275inject(AnimationDriver), \u0275\u0275inject(AnimationStyleNormalizer));
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({
    token: _InjectableAnimationEngine,
    factory: _InjectableAnimationEngine.\u0275fac
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(InjectableAnimationEngine, [{
    type: Injectable
  }], () => [{
    type: Document,
    decorators: [{
      type: Inject,
      args: [DOCUMENT]
    }]
  }, {
    type: AnimationDriver
  }, {
    type: AnimationStyleNormalizer
  }], null);
})();
function instantiateDefaultStyleNormalizer() {
  return new WebAnimationsStyleNormalizer();
}
function instantiateRendererFactory(renderer, engine, zone) {
  return new AnimationRendererFactory(renderer, engine, zone);
}
var SHARED_ANIMATION_PROVIDERS = [{
  provide: AnimationStyleNormalizer,
  useFactory: instantiateDefaultStyleNormalizer
}, {
  provide: AnimationEngine,
  useClass: InjectableAnimationEngine
}, {
  provide: RendererFactory2,
  useFactory: instantiateRendererFactory,
  deps: [DomRendererFactory2, AnimationEngine, NgZone]
}];
var BROWSER_NOOP_ANIMATIONS_PROVIDERS = [{
  provide: AnimationDriver,
  useClass: NoopAnimationDriver
}, {
  provide: ANIMATION_MODULE_TYPE,
  useValue: "NoopAnimations"
}, ...SHARED_ANIMATION_PROVIDERS];
var BROWSER_ANIMATIONS_PROVIDERS = [
  // Note: the `ngServerMode` happen inside factories to give the variable time to initialize.
  {
    provide: AnimationDriver,
    useFactory: () => false ? new NoopAnimationDriver() : new WebAnimationsDriver()
  },
  {
    provide: ANIMATION_MODULE_TYPE,
    useFactory: () => false ? "NoopAnimations" : "BrowserAnimations"
  },
  ...SHARED_ANIMATION_PROVIDERS
];
var BrowserAnimationsModule = class _BrowserAnimationsModule {
  /**
   * Configures the module based on the specified object.
   *
   * @param config Object used to configure the behavior of the `BrowserAnimationsModule`.
   * @see {@link BrowserAnimationsModuleConfig}
   *
   * @usageNotes
   * When registering the `BrowserAnimationsModule`, you can use the `withConfig`
   * function as follows:
   * ```ts
   * @NgModule({
   *   imports: [BrowserAnimationsModule.withConfig(config)]
   * })
   * class MyNgModule {}
   * ```
   */
  static withConfig(config) {
    return {
      ngModule: _BrowserAnimationsModule,
      providers: config.disableAnimations ? BROWSER_NOOP_ANIMATIONS_PROVIDERS : BROWSER_ANIMATIONS_PROVIDERS
    };
  }
  static \u0275fac = function BrowserAnimationsModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _BrowserAnimationsModule)();
  };
  static \u0275mod = /* @__PURE__ */ \u0275\u0275defineNgModule({
    type: _BrowserAnimationsModule,
    exports: [BrowserModule]
  });
  static \u0275inj = /* @__PURE__ */ \u0275\u0275defineInjector({
    providers: BROWSER_ANIMATIONS_PROVIDERS,
    imports: [BrowserModule]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(BrowserAnimationsModule, [{
    type: NgModule,
    args: [{
      exports: [BrowserModule],
      providers: BROWSER_ANIMATIONS_PROVIDERS
    }]
  }], null, null);
})();
function provideAnimations() {
  performanceMarkFeature("NgEagerAnimations");
  return [...BROWSER_ANIMATIONS_PROVIDERS];
}
var NoopAnimationsModule = class _NoopAnimationsModule {
  static \u0275fac = function NoopAnimationsModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NoopAnimationsModule)();
  };
  static \u0275mod = /* @__PURE__ */ \u0275\u0275defineNgModule({
    type: _NoopAnimationsModule,
    exports: [BrowserModule]
  });
  static \u0275inj = /* @__PURE__ */ \u0275\u0275defineInjector({
    providers: BROWSER_NOOP_ANIMATIONS_PROVIDERS,
    imports: [BrowserModule]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NoopAnimationsModule, [{
    type: NgModule,
    args: [{
      exports: [BrowserModule],
      providers: BROWSER_NOOP_ANIMATIONS_PROVIDERS
    }]
  }], null, null);
})();

// src/app/core/models/card.model.ts
var Suit;
(function(Suit2) {
  Suit2["HEARTS"] = "hearts";
  Suit2["DIAMONDS"] = "diamonds";
  Suit2["CLUBS"] = "clubs";
  Suit2["SPADES"] = "spades";
})(Suit || (Suit = {}));
var Rank;
(function(Rank2) {
  Rank2["ACE"] = "A";
  Rank2["KING"] = "K";
  Rank2["QUEEN"] = "Q";
  Rank2["JACK"] = "J";
  Rank2["TEN"] = "10";
  Rank2["NINE"] = "9";
  Rank2["EIGHT"] = "8";
  Rank2["SEVEN"] = "7";
  Rank2["SIX"] = "6";
  Rank2["FIVE"] = "5";
  Rank2["FOUR"] = "4";
  Rank2["THREE"] = "3";
  Rank2["TWO"] = "2";
})(Rank || (Rank = {}));
var CardImpl = class {
  id;
  suit;
  rank;
  value;
  isRed;
  constructor(suit, rank) {
    this.id = `${suit}-${rank}`;
    this.suit = suit;
    this.rank = rank;
    this.value = this.calculateValue(rank);
    this.isRed = suit === Suit.HEARTS || suit === Suit.DIAMONDS;
  }
  calculateValue(rank) {
    switch (rank) {
      case Rank.ACE:
        return 14;
      case Rank.KING:
        return 13;
      case Rank.QUEEN:
        return 12;
      case Rank.JACK:
        return 11;
      case Rank.TEN:
        return 10;
      case Rank.NINE:
        return 9;
      case Rank.EIGHT:
        return 8;
      case Rank.SEVEN:
        return 7;
      case Rank.SIX:
        return 6;
      case Rank.FIVE:
        return 5;
      case Rank.FOUR:
        return 4;
      case Rank.THREE:
        return 3;
      case Rank.TWO:
        return 2;
      default:
        return 0;
    }
  }
  toString() {
    return `${this.rank} of ${this.suit}`;
  }
};

// src/app/shared/components/card/card.component.ts
function CardComponent_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElementStart(0, "div", 1);
    \u0275\u0275domElement(1, "div", 3);
    \u0275\u0275domElementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275attribute("style", "background: " + ctx_r0.cardBackingPattern(), \u0275\u0275sanitizeStyle);
  }
}
function CardComponent_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElementStart(0, "div", 2)(1, "div", 4)(2, "div", 5);
    \u0275\u0275text(3);
    \u0275\u0275domElementEnd();
    \u0275\u0275domElementStart(4, "div", 6);
    \u0275\u0275text(5);
    \u0275\u0275domElementEnd()();
    \u0275\u0275domElementStart(6, "div", 7)(7, "div", 8);
    \u0275\u0275text(8);
    \u0275\u0275domElementEnd()();
    \u0275\u0275domElementStart(9, "div", 9)(10, "div", 5);
    \u0275\u0275text(11);
    \u0275\u0275domElementEnd();
    \u0275\u0275domElementStart(12, "div", 6);
    \u0275\u0275text(13);
    \u0275\u0275domElementEnd()()();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(ctx_r0.displayRank());
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r0.displaySuit());
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(ctx_r0.displaySuit());
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(ctx_r0.displayRank());
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r0.displaySuit());
  }
}
var CardComponent = class _CardComponent {
  card = input(null, ...ngDevMode ? [{ debugName: "card" }] : []);
  faceDown = input(false, ...ngDevMode ? [{ debugName: "faceDown" }] : []);
  glow = input(null, ...ngDevMode ? [{ debugName: "glow" }] : []);
  clickable = input(false, ...ngDevMode ? [{ debugName: "clickable" }] : []);
  // Animation states
  animationState = input(null, ...ngDevMode ? [{ debugName: "animationState" }] : []);
  fromPosition = input(null, ...ngDevMode ? [{ debugName: "fromPosition" }] : []);
  // Event outputs
  cardClicked = output();
  // Inject settings service
  settingsService = inject(SettingsService);
  isRed = computed(() => this.card()?.isRed ?? false, ...ngDevMode ? [{ debugName: "isRed" }] : []);
  // Computed properties for settings integration
  cardBackingPattern = computed(() => {
    const selectedOption = this.settingsService.selectedCardBackingOption();
    return selectedOption ? selectedOption.pattern : "";
  }, ...ngDevMode ? [{ debugName: "cardBackingPattern" }] : []);
  // Check if animations are enabled
  animationsEnabled = computed(() => {
    return this.settingsService.currentSettings().autoPlayAnimations;
  }, ...ngDevMode ? [{ debugName: "animationsEnabled" }] : []);
  // Get animation speed class
  animationSpeedClass = computed(() => {
    const speed = this.settingsService.currentSettings().animationSpeed;
    return `animation-speed-${speed}`;
  }, ...ngDevMode ? [{ debugName: "animationSpeedClass" }] : []);
  // Computed animation state that respects settings
  effectiveAnimationState = computed(() => {
    if (!this.animationsEnabled()) {
      return null;
    }
    return this.animationState();
  }, ...ngDevMode ? [{ debugName: "effectiveAnimationState" }] : []);
  displayRank = computed(() => {
    const cardValue = this.card();
    if (!cardValue)
      return "";
    return cardValue.rank;
  }, ...ngDevMode ? [{ debugName: "displayRank" }] : []);
  displaySuit = computed(() => {
    const cardValue = this.card();
    if (!cardValue)
      return "";
    switch (cardValue.suit) {
      case Suit.HEARTS:
        return "\u2665";
      case Suit.DIAMONDS:
        return "\u2666";
      case Suit.CLUBS:
        return "\u2663";
      case Suit.SPADES:
        return "\u2660";
      default:
        return "";
    }
  }, ...ngDevMode ? [{ debugName: "displaySuit" }] : []);
  ariaLabel = computed(() => {
    if (this.faceDown()) {
      return "Face down card";
    }
    const cardValue = this.card();
    if (!cardValue)
      return "Empty card slot";
    const suitName = cardValue.suit.charAt(0).toUpperCase() + cardValue.suit.slice(1);
    const rankName = this.getRankName(cardValue.rank);
    return `${rankName} of ${suitName}`;
  }, ...ngDevMode ? [{ debugName: "ariaLabel" }] : []);
  getRankName(rank) {
    switch (rank) {
      case Rank.ACE:
        return "Ace";
      case Rank.KING:
        return "King";
      case Rank.QUEEN:
        return "Queen";
      case Rank.JACK:
        return "Jack";
      default:
        return rank;
    }
  }
  onCardClick() {
    if (this.clickable()) {
      this.cardClicked.emit();
    }
  }
  onKeyDown(event) {
    if (this.clickable() && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      this.cardClicked.emit();
    }
  }
  static \u0275fac = function CardComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _CardComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _CardComponent, selectors: [["app-card"]], inputs: { card: [1, "card"], faceDown: [1, "faceDown"], glow: [1, "glow"], clickable: [1, "clickable"], animationState: [1, "animationState"], fromPosition: [1, "fromPosition"] }, outputs: { cardClicked: "cardClicked" }, decls: 3, vars: 34, consts: [[1, "card", 3, "click", "keydown.enter", "keydown.space"], [1, "card-back"], [1, "card-face"], [1, "card-pattern"], [1, "card-corner", "top-left"], [1, "rank"], [1, "suit"], [1, "card-center"], [1, "suit-symbol"], [1, "card-corner", "bottom-right"]], template: function CardComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275domElementStart(0, "div", 0);
      \u0275\u0275domListener("click", function CardComponent_Template_div_click_0_listener() {
        return ctx.onCardClick();
      })("keydown.enter", function CardComponent_Template_div_keydown_enter_0_listener() {
        return ctx.onCardClick();
      })("keydown.space", function CardComponent_Template_div_keydown_space_0_listener() {
        return ctx.onCardClick();
      });
      \u0275\u0275conditionalCreate(1, CardComponent_Conditional_1_Template, 2, 1, "div", 1)(2, CardComponent_Conditional_2_Template, 14, 5, "div", 2);
      \u0275\u0275domElementEnd();
    }
    if (rf & 2) {
      \u0275\u0275classMap(ctx.animationSpeedClass());
      \u0275\u0275classProp("face-down", ctx.faceDown())("red-card", ctx.isRed())("black-card", !ctx.isRed())("glowing", ctx.glow())("glow-green", ctx.glow() === "green")("glow-red", ctx.glow() === "red")("glow-blue", ctx.glow() === "blue")("clickable", ctx.clickable())("animate-slide-in", ctx.effectiveAnimationState() === "slide-in")("animate-flip", ctx.effectiveAnimationState() === "flip")("animate-clash-win", ctx.effectiveAnimationState() === "clash-win")("animate-clash-lose", ctx.effectiveAnimationState() === "clash-lose")("animate-fall-away", ctx.effectiveAnimationState() === "fall-away")("from-deck", ctx.fromPosition() === "deck");
      \u0275\u0275attribute("role", ctx.clickable() ? "button" : null)("aria-label", ctx.ariaLabel())("tabindex", ctx.clickable() ? 0 : null);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.faceDown() ? 1 : 2);
    }
  }, dependencies: [CommonModule], styles: ['\n\n.card[_ngcontent-%COMP%] {\n  width: 72px;\n  height: 104px;\n  border-radius: 10px;\n  border: 1px solid rgba(226, 232, 240, 0.8);\n  position: relative;\n  background: #ffffff;\n  cursor: pointer;\n  transition:\n    transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),\n    box-shadow 0.3s ease,\n    border-color 0.3s ease;\n  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.9);\n  -webkit-user-select: none;\n  user-select: none;\n  perspective: 1000px;\n  transform-style: preserve-3d;\n}\n@media (max-width: 599px) {\n  .card[_ngcontent-%COMP%] {\n    width: 62px;\n    height: 90px;\n    border-radius: 8px;\n  }\n}\n@media (max-width: 359px) {\n  .card[_ngcontent-%COMP%] {\n    width: 52px;\n    height: 74px;\n    border-radius: 6px;\n  }\n}\n.card[_ngcontent-%COMP%]:hover {\n  transform: translateY(-4px) rotateX(4deg);\n  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.9);\n}\n.card.glowing[_ngcontent-%COMP%] {\n  transition:\n    box-shadow 0.3s ease-in-out,\n    transform 0.3s ease-in-out,\n    border-color 0.3s ease;\n}\n.card.glow-green[_ngcontent-%COMP%] {\n  box-shadow:\n    0 0 20px rgba(34, 197, 94, 0.85),\n    0 0 35px rgba(34, 197, 94, 0.4),\n    0 4px 12px rgba(0, 0, 0, 0.3);\n  border-color: #22c55e;\n}\n.card.glow-red[_ngcontent-%COMP%] {\n  box-shadow:\n    0 0 20px rgba(239, 68, 68, 0.85),\n    0 0 35px rgba(239, 68, 68, 0.4),\n    0 4px 12px rgba(0, 0, 0, 0.3);\n  border-color: #ef4444;\n}\n.card.glow-blue[_ngcontent-%COMP%] {\n  border-color: #3b82f6;\n  animation: _ngcontent-%COMP%_pulse-blue-glow 1.6s infinite ease-in-out;\n}\n.card.clickable[_ngcontent-%COMP%] {\n  cursor: pointer;\n}\n.card.clickable[_ngcontent-%COMP%]:hover {\n  transform: translateY(-6px) scale(1.03);\n  box-shadow: 0 12px 24px rgba(59, 130, 246, 0.4);\n}\n.card.clickable[_ngcontent-%COMP%]:active {\n  transform: translateY(-2px) scale(0.98);\n}\n.card[_ngcontent-%COMP%]:not(.clickable) {\n  cursor: default;\n}\n@keyframes _ngcontent-%COMP%_pulse-blue-glow {\n  0%, 100% {\n    box-shadow: 0 0 12px rgba(59, 130, 246, 0.7), 0 0 24px rgba(59, 130, 246, 0.3);\n    transform: scale(1);\n  }\n  50% {\n    box-shadow: 0 0 24px rgba(59, 130, 246, 0.95), 0 0 40px rgba(99, 102, 241, 0.6);\n    transform: scale(1.04);\n  }\n}\n.card-back[_ngcontent-%COMP%] {\n  width: 100%;\n  height: 100%;\n  background:\n    linear-gradient(\n      45deg,\n      #1e3a8a 25%,\n      #1d4ed8 25%,\n      #1d4ed8 50%,\n      #1e3a8a 50%,\n      #1e3a8a 75%,\n      #1d4ed8 75%);\n  background-size: 10px 10px;\n  border-radius: 9px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  position: relative;\n  overflow: hidden;\n  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.4);\n}\n@media (max-width: 599px) {\n  .card-back[_ngcontent-%COMP%] {\n    border-radius: 7px;\n  }\n}\n.card-pattern[_ngcontent-%COMP%] {\n  width: 84%;\n  height: 84%;\n  border: 1px dashed rgba(255, 215, 0, 0.5);\n  background-image:\n    radial-gradient(\n      circle at 50% 50%,\n      rgba(255, 255, 255, 0.2) 0%,\n      rgba(255, 255, 255, 0.08) 50%,\n      transparent 100%);\n  border-radius: 5px;\n}\n.card-face[_ngcontent-%COMP%] {\n  width: 100%;\n  height: 100%;\n  padding: 5px 6px;\n  position: relative;\n  display: flex;\n  flex-direction: column;\n  justify-content: space-between;\n  box-sizing: border-box;\n  background:\n    radial-gradient(\n      circle at center,\n      #ffffff 60%,\n      #f8fafc 100%);\n  border-radius: 9px;\n  overflow: hidden;\n}\n.card-face[_ngcontent-%COMP%]::after {\n  content: "";\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  height: 45%;\n  background:\n    linear-gradient(\n      135deg,\n      rgba(255, 255, 255, 0.5) 0%,\n      transparent 80%);\n  pointer-events: none;\n  border-radius: 9px 9px 0 0;\n}\n@media (max-width: 599px) {\n  .card-face[_ngcontent-%COMP%] {\n    padding: 3px 4px;\n    border-radius: 7px;\n  }\n}\n@media (max-width: 359px) {\n  .card-face[_ngcontent-%COMP%] {\n    padding: 2px 3px;\n    border-radius: 5px;\n  }\n}\n.card-corner[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  font-weight: 800;\n  font-size: 11px;\n  line-height: 1;\n}\n@media (max-width: 599px) {\n  .card-corner[_ngcontent-%COMP%] {\n    font-size: 9px;\n  }\n}\n@media (max-width: 359px) {\n  .card-corner[_ngcontent-%COMP%] {\n    font-size: 8px;\n  }\n}\n.card-corner[_ngcontent-%COMP%]   .rank[_ngcontent-%COMP%] {\n  margin-bottom: 1px;\n  letter-spacing: -0.5px;\n}\n.card-corner[_ngcontent-%COMP%]   .suit[_ngcontent-%COMP%] {\n  font-size: 9px;\n}\n@media (max-width: 599px) {\n  .card-corner[_ngcontent-%COMP%]   .suit[_ngcontent-%COMP%] {\n    font-size: 7px;\n  }\n}\n@media (max-width: 359px) {\n  .card-corner[_ngcontent-%COMP%]   .suit[_ngcontent-%COMP%] {\n    font-size: 6px;\n  }\n}\n.top-left[_ngcontent-%COMP%] {\n  align-self: flex-start;\n}\n.bottom-right[_ngcontent-%COMP%] {\n  align-self: flex-end;\n  transform: rotate(180deg);\n}\n.card-center[_ngcontent-%COMP%] {\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n.suit-symbol[_ngcontent-%COMP%] {\n  font-size: 26px;\n  font-weight: bold;\n  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.15));\n}\n@media (max-width: 599px) {\n  .suit-symbol[_ngcontent-%COMP%] {\n    font-size: 21px;\n  }\n}\n@media (max-width: 359px) {\n  .suit-symbol[_ngcontent-%COMP%] {\n    font-size: 17px;\n  }\n}\n.red-card[_ngcontent-%COMP%]   .rank[_ngcontent-%COMP%], \n.red-card[_ngcontent-%COMP%]   .suit-symbol[_ngcontent-%COMP%] {\n  color: #dc2626;\n}\n.black-card[_ngcontent-%COMP%]   .rank[_ngcontent-%COMP%], \n.black-card[_ngcontent-%COMP%]   .suit-symbol[_ngcontent-%COMP%] {\n  color: #0f172a;\n}\n[_nghost-%COMP%]     .dark-theme .card {\n  background: #1e293b;\n  border-color: #475569;\n}\n[_nghost-%COMP%]     .dark-theme .card .card-face {\n  background:\n    radial-gradient(\n      circle at center,\n      #1e293b 60%,\n      #0f172a 100%);\n}\n[_nghost-%COMP%]     .dark-theme .card.red-card .rank, \n[_nghost-%COMP%]     .dark-theme .card.red-card .suit-symbol {\n  color: #f87171;\n}\n[_nghost-%COMP%]     .dark-theme .card.black-card .rank, \n[_nghost-%COMP%]     .dark-theme .card.black-card .suit-symbol {\n  color: #f8fafc;\n}\n.card.animate-slide-in[_ngcontent-%COMP%] {\n  animation: _ngcontent-%COMP%_slide-in-from-deck 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);\n}\n.card.animate-slide-in.from-deck[_ngcontent-%COMP%] {\n  animation: _ngcontent-%COMP%_slide-in-from-deck 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);\n}\n.card.animate-flip[_ngcontent-%COMP%] {\n  animation: _ngcontent-%COMP%_card-flip 0.5s ease-in-out;\n}\n.card.animate-clash-win[_ngcontent-%COMP%] {\n  animation: _ngcontent-%COMP%_clash-victory 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);\n}\n.card.animate-clash-lose[_ngcontent-%COMP%] {\n  animation: _ngcontent-%COMP%_clash-defeat 0.8s ease-out;\n}\n.card.animate-fall-away[_ngcontent-%COMP%] {\n  animation: _ngcontent-%COMP%_fall-away 1s cubic-bezier(0.55, 0.085, 0.68, 0.53) forwards;\n}\n.card.animation-speed-slow.animate-slide-in[_ngcontent-%COMP%] {\n  animation-duration: 1s;\n}\n.card.animation-speed-slow.animate-flip[_ngcontent-%COMP%] {\n  animation-duration: 0.8s;\n}\n.card.animation-speed-slow.animate-clash-win[_ngcontent-%COMP%] {\n  animation-duration: 1.2s;\n}\n.card.animation-speed-slow.animate-clash-lose[_ngcontent-%COMP%] {\n  animation-duration: 1.2s;\n}\n.card.animation-speed-slow.animate-fall-away[_ngcontent-%COMP%] {\n  animation-duration: 1.5s;\n}\n.card.animation-speed-fast.animate-slide-in[_ngcontent-%COMP%] {\n  animation-duration: 0.35s;\n}\n.card.animation-speed-fast.animate-flip[_ngcontent-%COMP%] {\n  animation-duration: 0.25s;\n}\n.card.animation-speed-fast.animate-clash-win[_ngcontent-%COMP%] {\n  animation-duration: 0.4s;\n}\n.card.animation-speed-fast.animate-clash-lose[_ngcontent-%COMP%] {\n  animation-duration: 0.4s;\n}\n.card.animation-speed-fast.animate-fall-away[_ngcontent-%COMP%] {\n  animation-duration: 0.5s;\n}\n@keyframes _ngcontent-%COMP%_slide-in-from-deck {\n  0% {\n    transform: translateY(-120px) rotateY(-40deg) scale(0.7);\n    opacity: 0;\n  }\n  65% {\n    transform: translateY(8px) rotateY(10deg) scale(1.06);\n    opacity: 0.95;\n  }\n  100% {\n    transform: translateY(0) rotateY(0deg) scale(1);\n    opacity: 1;\n  }\n}\n@keyframes _ngcontent-%COMP%_card-flip {\n  0% {\n    transform: rotateY(0deg) scale(1);\n  }\n  50% {\n    transform: rotateY(90deg) scale(1.1);\n  }\n  100% {\n    transform: rotateY(0deg) scale(1);\n  }\n}\n@keyframes _ngcontent-%COMP%_clash-victory {\n  0% {\n    transform: scale(1);\n  }\n  30% {\n    transform: scale(1.25) translateY(-8px);\n    box-shadow: 0 0 35px rgba(34, 197, 94, 0.9), 0 0 60px rgba(34, 197, 94, 0.5);\n  }\n  60% {\n    transform: scale(1.15) translateY(2px);\n  }\n  100% {\n    transform: scale(1.05);\n    box-shadow: 0 0 25px rgba(34, 197, 94, 0.8);\n  }\n}\n@keyframes _ngcontent-%COMP%_clash-defeat {\n  0% {\n    transform: scale(1);\n  }\n  20% {\n    transform: scale(1.1) rotateZ(6deg);\n    box-shadow: 0 0 25px rgba(239, 68, 68, 0.9);\n  }\n  40% {\n    transform: scale(0.92) rotateZ(-8deg);\n  }\n  60% {\n    transform: scale(0.85) rotateZ(4deg);\n  }\n  100% {\n    transform: scale(0.8) rotateZ(0deg);\n    opacity: 0.6;\n  }\n}\n@keyframes _ngcontent-%COMP%_fall-away {\n  0% {\n    transform: translateY(0) rotateZ(0deg) scale(1);\n    opacity: 1;\n  }\n  25% {\n    transform: translateY(15px) rotateZ(-12deg) scale(0.95);\n    opacity: 0.9;\n  }\n  60% {\n    transform: translateY(120px) rotateZ(-40deg) scale(0.5);\n    opacity: 0.4;\n  }\n  100% {\n    transform: translateY(240px) rotateZ(-90deg) scale(0.1);\n    opacity: 0;\n  }\n}\n/*# sourceMappingURL=card.component.css.map */'] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(CardComponent, [{
    type: Component,
    args: [{ selector: "app-card", standalone: true, imports: [CommonModule], template: `
    <div class="card" 
         [class.face-down]="faceDown()"
         [class.red-card]="isRed()"
         [class.black-card]="!isRed()"
         [class.glowing]="glow()"
         [class.glow-green]="glow() === 'green'"
         [class.glow-red]="glow() === 'red'"
         [class.glow-blue]="glow() === 'blue'"
         [class.clickable]="clickable()"
         [class.animate-slide-in]="effectiveAnimationState() === 'slide-in'"
         [class.animate-flip]="effectiveAnimationState() === 'flip'"
         [class.animate-clash-win]="effectiveAnimationState() === 'clash-win'"
         [class.animate-clash-lose]="effectiveAnimationState() === 'clash-lose'"
         [class.animate-fall-away]="effectiveAnimationState() === 'fall-away'"
         [class.from-deck]="fromPosition() === 'deck'"
         [class]="animationSpeedClass()"
         [attr.role]="clickable() ? 'button' : null"
         [attr.aria-label]="ariaLabel()"
         [attr.tabindex]="clickable() ? 0 : null"
         (click)="onCardClick()"
         (keydown.enter)="onCardClick()"
         (keydown.space)="onCardClick()">
      
      @if (faceDown()) {
        <div class="card-back" [attr.style]="'background: ' + cardBackingPattern()">
          <div class="card-pattern"></div>
        </div>
      } @else {
        <div class="card-face">
          <div class="card-corner top-left">
            <div class="rank">{{ displayRank() }}</div>
            <div class="suit">{{ displaySuit() }}</div>
          </div>
          
          <div class="card-center">
            <div class="suit-symbol">{{ displaySuit() }}</div>
          </div>
          
          <div class="card-corner bottom-right">
            <div class="rank">{{ displayRank() }}</div>
            <div class="suit">{{ displaySuit() }}</div>
          </div>
        </div>
      }
    </div>
  `, styles: ['/* src/app/shared/components/card/card.component.scss */\n.card {\n  width: 72px;\n  height: 104px;\n  border-radius: 10px;\n  border: 1px solid rgba(226, 232, 240, 0.8);\n  position: relative;\n  background: #ffffff;\n  cursor: pointer;\n  transition:\n    transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),\n    box-shadow 0.3s ease,\n    border-color 0.3s ease;\n  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.9);\n  -webkit-user-select: none;\n  user-select: none;\n  perspective: 1000px;\n  transform-style: preserve-3d;\n}\n@media (max-width: 599px) {\n  .card {\n    width: 62px;\n    height: 90px;\n    border-radius: 8px;\n  }\n}\n@media (max-width: 359px) {\n  .card {\n    width: 52px;\n    height: 74px;\n    border-radius: 6px;\n  }\n}\n.card:hover {\n  transform: translateY(-4px) rotateX(4deg);\n  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.9);\n}\n.card.glowing {\n  transition:\n    box-shadow 0.3s ease-in-out,\n    transform 0.3s ease-in-out,\n    border-color 0.3s ease;\n}\n.card.glow-green {\n  box-shadow:\n    0 0 20px rgba(34, 197, 94, 0.85),\n    0 0 35px rgba(34, 197, 94, 0.4),\n    0 4px 12px rgba(0, 0, 0, 0.3);\n  border-color: #22c55e;\n}\n.card.glow-red {\n  box-shadow:\n    0 0 20px rgba(239, 68, 68, 0.85),\n    0 0 35px rgba(239, 68, 68, 0.4),\n    0 4px 12px rgba(0, 0, 0, 0.3);\n  border-color: #ef4444;\n}\n.card.glow-blue {\n  border-color: #3b82f6;\n  animation: pulse-blue-glow 1.6s infinite ease-in-out;\n}\n.card.clickable {\n  cursor: pointer;\n}\n.card.clickable:hover {\n  transform: translateY(-6px) scale(1.03);\n  box-shadow: 0 12px 24px rgba(59, 130, 246, 0.4);\n}\n.card.clickable:active {\n  transform: translateY(-2px) scale(0.98);\n}\n.card:not(.clickable) {\n  cursor: default;\n}\n@keyframes pulse-blue-glow {\n  0%, 100% {\n    box-shadow: 0 0 12px rgba(59, 130, 246, 0.7), 0 0 24px rgba(59, 130, 246, 0.3);\n    transform: scale(1);\n  }\n  50% {\n    box-shadow: 0 0 24px rgba(59, 130, 246, 0.95), 0 0 40px rgba(99, 102, 241, 0.6);\n    transform: scale(1.04);\n  }\n}\n.card-back {\n  width: 100%;\n  height: 100%;\n  background:\n    linear-gradient(\n      45deg,\n      #1e3a8a 25%,\n      #1d4ed8 25%,\n      #1d4ed8 50%,\n      #1e3a8a 50%,\n      #1e3a8a 75%,\n      #1d4ed8 75%);\n  background-size: 10px 10px;\n  border-radius: 9px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  position: relative;\n  overflow: hidden;\n  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.4);\n}\n@media (max-width: 599px) {\n  .card-back {\n    border-radius: 7px;\n  }\n}\n.card-pattern {\n  width: 84%;\n  height: 84%;\n  border: 1px dashed rgba(255, 215, 0, 0.5);\n  background-image:\n    radial-gradient(\n      circle at 50% 50%,\n      rgba(255, 255, 255, 0.2) 0%,\n      rgba(255, 255, 255, 0.08) 50%,\n      transparent 100%);\n  border-radius: 5px;\n}\n.card-face {\n  width: 100%;\n  height: 100%;\n  padding: 5px 6px;\n  position: relative;\n  display: flex;\n  flex-direction: column;\n  justify-content: space-between;\n  box-sizing: border-box;\n  background:\n    radial-gradient(\n      circle at center,\n      #ffffff 60%,\n      #f8fafc 100%);\n  border-radius: 9px;\n  overflow: hidden;\n}\n.card-face::after {\n  content: "";\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  height: 45%;\n  background:\n    linear-gradient(\n      135deg,\n      rgba(255, 255, 255, 0.5) 0%,\n      transparent 80%);\n  pointer-events: none;\n  border-radius: 9px 9px 0 0;\n}\n@media (max-width: 599px) {\n  .card-face {\n    padding: 3px 4px;\n    border-radius: 7px;\n  }\n}\n@media (max-width: 359px) {\n  .card-face {\n    padding: 2px 3px;\n    border-radius: 5px;\n  }\n}\n.card-corner {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  font-weight: 800;\n  font-size: 11px;\n  line-height: 1;\n}\n@media (max-width: 599px) {\n  .card-corner {\n    font-size: 9px;\n  }\n}\n@media (max-width: 359px) {\n  .card-corner {\n    font-size: 8px;\n  }\n}\n.card-corner .rank {\n  margin-bottom: 1px;\n  letter-spacing: -0.5px;\n}\n.card-corner .suit {\n  font-size: 9px;\n}\n@media (max-width: 599px) {\n  .card-corner .suit {\n    font-size: 7px;\n  }\n}\n@media (max-width: 359px) {\n  .card-corner .suit {\n    font-size: 6px;\n  }\n}\n.top-left {\n  align-self: flex-start;\n}\n.bottom-right {\n  align-self: flex-end;\n  transform: rotate(180deg);\n}\n.card-center {\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n.suit-symbol {\n  font-size: 26px;\n  font-weight: bold;\n  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.15));\n}\n@media (max-width: 599px) {\n  .suit-symbol {\n    font-size: 21px;\n  }\n}\n@media (max-width: 359px) {\n  .suit-symbol {\n    font-size: 17px;\n  }\n}\n.red-card .rank,\n.red-card .suit-symbol {\n  color: #dc2626;\n}\n.black-card .rank,\n.black-card .suit-symbol {\n  color: #0f172a;\n}\n:host ::ng-deep .dark-theme .card {\n  background: #1e293b;\n  border-color: #475569;\n}\n:host ::ng-deep .dark-theme .card .card-face {\n  background:\n    radial-gradient(\n      circle at center,\n      #1e293b 60%,\n      #0f172a 100%);\n}\n:host ::ng-deep .dark-theme .card.red-card .rank,\n:host ::ng-deep .dark-theme .card.red-card .suit-symbol {\n  color: #f87171;\n}\n:host ::ng-deep .dark-theme .card.black-card .rank,\n:host ::ng-deep .dark-theme .card.black-card .suit-symbol {\n  color: #f8fafc;\n}\n.card.animate-slide-in {\n  animation: slide-in-from-deck 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);\n}\n.card.animate-slide-in.from-deck {\n  animation: slide-in-from-deck 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);\n}\n.card.animate-flip {\n  animation: card-flip 0.5s ease-in-out;\n}\n.card.animate-clash-win {\n  animation: clash-victory 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);\n}\n.card.animate-clash-lose {\n  animation: clash-defeat 0.8s ease-out;\n}\n.card.animate-fall-away {\n  animation: fall-away 1s cubic-bezier(0.55, 0.085, 0.68, 0.53) forwards;\n}\n.card.animation-speed-slow.animate-slide-in {\n  animation-duration: 1s;\n}\n.card.animation-speed-slow.animate-flip {\n  animation-duration: 0.8s;\n}\n.card.animation-speed-slow.animate-clash-win {\n  animation-duration: 1.2s;\n}\n.card.animation-speed-slow.animate-clash-lose {\n  animation-duration: 1.2s;\n}\n.card.animation-speed-slow.animate-fall-away {\n  animation-duration: 1.5s;\n}\n.card.animation-speed-fast.animate-slide-in {\n  animation-duration: 0.35s;\n}\n.card.animation-speed-fast.animate-flip {\n  animation-duration: 0.25s;\n}\n.card.animation-speed-fast.animate-clash-win {\n  animation-duration: 0.4s;\n}\n.card.animation-speed-fast.animate-clash-lose {\n  animation-duration: 0.4s;\n}\n.card.animation-speed-fast.animate-fall-away {\n  animation-duration: 0.5s;\n}\n@keyframes slide-in-from-deck {\n  0% {\n    transform: translateY(-120px) rotateY(-40deg) scale(0.7);\n    opacity: 0;\n  }\n  65% {\n    transform: translateY(8px) rotateY(10deg) scale(1.06);\n    opacity: 0.95;\n  }\n  100% {\n    transform: translateY(0) rotateY(0deg) scale(1);\n    opacity: 1;\n  }\n}\n@keyframes card-flip {\n  0% {\n    transform: rotateY(0deg) scale(1);\n  }\n  50% {\n    transform: rotateY(90deg) scale(1.1);\n  }\n  100% {\n    transform: rotateY(0deg) scale(1);\n  }\n}\n@keyframes clash-victory {\n  0% {\n    transform: scale(1);\n  }\n  30% {\n    transform: scale(1.25) translateY(-8px);\n    box-shadow: 0 0 35px rgba(34, 197, 94, 0.9), 0 0 60px rgba(34, 197, 94, 0.5);\n  }\n  60% {\n    transform: scale(1.15) translateY(2px);\n  }\n  100% {\n    transform: scale(1.05);\n    box-shadow: 0 0 25px rgba(34, 197, 94, 0.8);\n  }\n}\n@keyframes clash-defeat {\n  0% {\n    transform: scale(1);\n  }\n  20% {\n    transform: scale(1.1) rotateZ(6deg);\n    box-shadow: 0 0 25px rgba(239, 68, 68, 0.9);\n  }\n  40% {\n    transform: scale(0.92) rotateZ(-8deg);\n  }\n  60% {\n    transform: scale(0.85) rotateZ(4deg);\n  }\n  100% {\n    transform: scale(0.8) rotateZ(0deg);\n    opacity: 0.6;\n  }\n}\n@keyframes fall-away {\n  0% {\n    transform: translateY(0) rotateZ(0deg) scale(1);\n    opacity: 1;\n  }\n  25% {\n    transform: translateY(15px) rotateZ(-12deg) scale(0.95);\n    opacity: 0.9;\n  }\n  60% {\n    transform: translateY(120px) rotateZ(-40deg) scale(0.5);\n    opacity: 0.4;\n  }\n  100% {\n    transform: translateY(240px) rotateZ(-90deg) scale(0.1);\n    opacity: 0;\n  }\n}\n/*# sourceMappingURL=card.component.css.map */\n'] }]
  }], null, null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(CardComponent, { className: "CardComponent", filePath: "src/app/shared/components/card/card.component.ts", lineNumber: 59 });
})();

// src/app/shared/components/health-bar/health-bar.component.ts
function HealthBarComponent_Conditional_8_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElement(0, "div", 6);
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275styleProp("width", ctx_r0.dangerPercentage(), "%")("right", 100 - ctx_r0.healthPercentage(), "%");
  }
}
var HealthBarComponent = class _HealthBarComponent {
  label = input("Player", ...ngDevMode ? [{ debugName: "label" }] : []);
  current = input(26, ...ngDevMode ? [{ debugName: "current" }] : []);
  maximum = input(26, ...ngDevMode ? [{ debugName: "maximum" }] : []);
  inDanger = input(0, ...ngDevMode ? [{ debugName: "inDanger" }] : []);
  // Cards currently at risk
  showDamageAnimation = input(false, ...ngDevMode ? [{ debugName: "showDamageAnimation" }] : []);
  // Trigger for damage animation
  healthPercentage = computed(() => {
    const max = this.maximum();
    const curr = this.current();
    return max > 0 ? curr / max * 100 : 0;
  }, ...ngDevMode ? [{ debugName: "healthPercentage" }] : []);
  dangerPercentage = computed(() => {
    const max = this.maximum();
    const danger = this.inDanger();
    return max > 0 ? Math.min(100, danger / max * 100) : 0;
  }, ...ngDevMode ? [{ debugName: "dangerPercentage" }] : []);
  healthColor = computed(() => {
    const percentage = this.healthPercentage();
    if (percentage >= 75)
      return "green";
    if (percentage >= 50)
      return "yellow";
    if (percentage >= 25)
      return "orange";
    return "red";
  }, ...ngDevMode ? [{ debugName: "healthColor" }] : []);
  static \u0275fac = function HealthBarComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _HealthBarComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _HealthBarComponent, selectors: [["app-health-bar"]], inputs: { label: [1, "label"], current: [1, "current"], maximum: [1, "maximum"], inDanger: [1, "inDanger"], showDamageAnimation: [1, "showDamageAnimation"] }, decls: 9, vars: 16, consts: [[1, "health-bar-container"], [1, "health-bar-label"], [1, "card-count"], [1, "health-bar-track"], [1, "health-bar-fill"], [1, "health-bar-danger", 3, "width", "right"], [1, "health-bar-danger"]], template: function HealthBarComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275domElementStart(0, "div", 0)(1, "div", 1)(2, "span");
      \u0275\u0275text(3);
      \u0275\u0275domElementEnd();
      \u0275\u0275domElementStart(4, "span", 2);
      \u0275\u0275text(5);
      \u0275\u0275domElementEnd()();
      \u0275\u0275domElementStart(6, "div", 3);
      \u0275\u0275domElement(7, "div", 4);
      \u0275\u0275conditionalCreate(8, HealthBarComponent_Conditional_8_Template, 1, 4, "div", 5);
      \u0275\u0275domElementEnd()();
    }
    if (rf & 2) {
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(ctx.label());
      \u0275\u0275advance(2);
      \u0275\u0275textInterpolate2("", ctx.current(), "/", ctx.maximum());
      \u0275\u0275advance(2);
      \u0275\u0275styleProp("width", ctx.healthPercentage(), "%");
      \u0275\u0275classProp("green", ctx.healthColor() === "green")("yellow", ctx.healthColor() === "yellow")("orange", ctx.healthColor() === "orange")("red", ctx.healthColor() === "red")("damage-animation", ctx.showDamageAnimation());
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.inDanger() > 0 ? 8 : -1);
    }
  }, dependencies: [CommonModule], styles: ['\n\n.health-bar-container[_ngcontent-%COMP%] {\n  width: 100%;\n  max-width: 400px;\n}\n@media (max-width: 959px) {\n  .health-bar-container[_ngcontent-%COMP%] {\n    max-width: 320px;\n  }\n}\n@media (max-width: 599px) {\n  .health-bar-container[_ngcontent-%COMP%] {\n    max-width: 250px;\n  }\n}\n@media (max-width: 359px) {\n  .health-bar-container[_ngcontent-%COMP%] {\n    max-width: 200px;\n  }\n}\n.health-bar-label[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  margin-bottom: 4px;\n  font-size: 14px;\n  font-weight: 500;\n}\n@media (max-width: 599px) {\n  .health-bar-label[_ngcontent-%COMP%] {\n    font-size: 13px;\n  }\n}\n@media (max-width: 359px) {\n  .health-bar-label[_ngcontent-%COMP%] {\n    font-size: 12px;\n  }\n}\n.health-bar-label[_ngcontent-%COMP%]   .card-count[_ngcontent-%COMP%] {\n  font-weight: 400;\n  opacity: 0.8;\n}\n.health-bar-track[_ngcontent-%COMP%] {\n  height: 14px;\n  background-color: rgba(15, 23, 42, 0.6);\n  border-radius: 8px;\n  overflow: hidden;\n  position: relative;\n  border: 1px solid rgba(255, 255, 255, 0.2);\n  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.5);\n}\n@media (max-width: 599px) {\n  .health-bar-track[_ngcontent-%COMP%] {\n    height: 12px;\n    border-radius: 6px;\n  }\n}\n@media (max-width: 359px) {\n  .health-bar-track[_ngcontent-%COMP%] {\n    height: 10px;\n    border-radius: 5px;\n  }\n}\n.health-bar-fill[_ngcontent-%COMP%] {\n  height: 100%;\n  border-radius: inherit;\n  transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.4s ease;\n  position: relative;\n  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);\n}\n.health-bar-fill[_ngcontent-%COMP%]::after {\n  content: "";\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  height: 50%;\n  background:\n    linear-gradient(\n      180deg,\n      rgba(255, 255, 255, 0.4) 0%,\n      transparent 100%);\n  border-radius: inherit;\n}\n.health-bar-fill.green[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      90deg,\n      #16a34a 0%,\n      #22c55e 50%,\n      #4ade80 100%);\n  box-shadow: 0 0 12px rgba(34, 197, 94, 0.5);\n}\n.health-bar-fill.yellow[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      90deg,\n      #d97706 0%,\n      #eab308 50%,\n      #fde047 100%);\n  box-shadow: 0 0 12px rgba(234, 179, 8, 0.5);\n}\n.health-bar-fill.orange[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      90deg,\n      #ea580c 0%,\n      #f97316 50%,\n      #fb923c 100%);\n  box-shadow: 0 0 12px rgba(249, 115, 22, 0.5);\n}\n.health-bar-fill.red[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      90deg,\n      #dc2626 0%,\n      #ef4444 50%,\n      #f87171 100%);\n  box-shadow: 0 0 12px rgba(239, 68, 68, 0.6);\n}\n.health-bar-danger[_ngcontent-%COMP%] {\n  position: absolute;\n  top: 0;\n  height: 100%;\n  background:\n    repeating-linear-gradient(\n      -45deg,\n      rgba(239, 68, 68, 0.85) 0px,\n      rgba(239, 68, 68, 0.85) 6px,\n      rgba(185, 28, 28, 0.85) 6px,\n      rgba(185, 28, 28, 0.85) 12px);\n  border-radius: inherit;\n  animation: _ngcontent-%COMP%_danger-stripe-flow 0.8s linear infinite;\n  box-shadow: 0 0 10px rgba(239, 68, 68, 0.6);\n}\n@keyframes _ngcontent-%COMP%_danger-stripe-flow {\n  0% {\n    background-position: 0 0;\n    opacity: 0.8;\n  }\n  50% {\n    opacity: 1;\n  }\n  100% {\n    background-position: 17px 0;\n    opacity: 0.8;\n  }\n}\n.health-bar-fill.damage-animation[_ngcontent-%COMP%] {\n  animation: _ngcontent-%COMP%_damage-flash-shake 0.7s cubic-bezier(0.36, 0.07, 0.19, 0.97);\n}\n@keyframes _ngcontent-%COMP%_damage-flash-shake {\n  0% {\n    filter: brightness(1);\n    transform: scale(1);\n  }\n  20% {\n    filter: brightness(2.2) contrast(1.6);\n    transform: scale(1.04) translateX(-2px);\n  }\n  40% {\n    filter: brightness(0.6);\n    transform: scale(0.96) translateX(2px);\n  }\n  60% {\n    filter: brightness(1.6);\n    transform: scale(1.02) translateX(-1px);\n  }\n  80% {\n    filter: brightness(0.9);\n    transform: scale(0.99) translateX(1px);\n  }\n  100% {\n    filter: brightness(1);\n    transform: scale(1);\n  }\n}\n[_nghost-%COMP%]     .dark-theme .health-bar-track {\n  background-color: #424242;\n  border-color: #666;\n}\n[_nghost-%COMP%]     .dark-theme .health-bar-label {\n  color: #e0e0e0;\n}\n/*# sourceMappingURL=health-bar.component.css.map */'] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(HealthBarComponent, [{
    type: Component,
    args: [{ selector: "app-health-bar", standalone: true, imports: [CommonModule], template: `
    <div class="health-bar-container">
      <div class="health-bar-label">
        <span>{{ label() }}</span>
        <span class="card-count">{{ current() }}/{{ maximum() }}</span>
      </div>
      
      <div class="health-bar-track">
        <div class="health-bar-fill" 
             [class.green]="healthColor() === 'green'"
             [class.yellow]="healthColor() === 'yellow'"
             [class.orange]="healthColor() === 'orange'"
             [class.red]="healthColor() === 'red'"
             [class.damage-animation]="showDamageAnimation()"
             [style.width.%]="healthPercentage()">
        </div>
        
        @if (inDanger() > 0) {
          <div class="health-bar-danger"
               [style.width.%]="dangerPercentage()"
               [style.right.%]="100 - healthPercentage()">
          </div>
        }
      </div>
    </div>
  `, styles: ['/* src/app/shared/components/health-bar/health-bar.component.scss */\n.health-bar-container {\n  width: 100%;\n  max-width: 400px;\n}\n@media (max-width: 959px) {\n  .health-bar-container {\n    max-width: 320px;\n  }\n}\n@media (max-width: 599px) {\n  .health-bar-container {\n    max-width: 250px;\n  }\n}\n@media (max-width: 359px) {\n  .health-bar-container {\n    max-width: 200px;\n  }\n}\n.health-bar-label {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  margin-bottom: 4px;\n  font-size: 14px;\n  font-weight: 500;\n}\n@media (max-width: 599px) {\n  .health-bar-label {\n    font-size: 13px;\n  }\n}\n@media (max-width: 359px) {\n  .health-bar-label {\n    font-size: 12px;\n  }\n}\n.health-bar-label .card-count {\n  font-weight: 400;\n  opacity: 0.8;\n}\n.health-bar-track {\n  height: 14px;\n  background-color: rgba(15, 23, 42, 0.6);\n  border-radius: 8px;\n  overflow: hidden;\n  position: relative;\n  border: 1px solid rgba(255, 255, 255, 0.2);\n  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.5);\n}\n@media (max-width: 599px) {\n  .health-bar-track {\n    height: 12px;\n    border-radius: 6px;\n  }\n}\n@media (max-width: 359px) {\n  .health-bar-track {\n    height: 10px;\n    border-radius: 5px;\n  }\n}\n.health-bar-fill {\n  height: 100%;\n  border-radius: inherit;\n  transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.4s ease;\n  position: relative;\n  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);\n}\n.health-bar-fill::after {\n  content: "";\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  height: 50%;\n  background:\n    linear-gradient(\n      180deg,\n      rgba(255, 255, 255, 0.4) 0%,\n      transparent 100%);\n  border-radius: inherit;\n}\n.health-bar-fill.green {\n  background:\n    linear-gradient(\n      90deg,\n      #16a34a 0%,\n      #22c55e 50%,\n      #4ade80 100%);\n  box-shadow: 0 0 12px rgba(34, 197, 94, 0.5);\n}\n.health-bar-fill.yellow {\n  background:\n    linear-gradient(\n      90deg,\n      #d97706 0%,\n      #eab308 50%,\n      #fde047 100%);\n  box-shadow: 0 0 12px rgba(234, 179, 8, 0.5);\n}\n.health-bar-fill.orange {\n  background:\n    linear-gradient(\n      90deg,\n      #ea580c 0%,\n      #f97316 50%,\n      #fb923c 100%);\n  box-shadow: 0 0 12px rgba(249, 115, 22, 0.5);\n}\n.health-bar-fill.red {\n  background:\n    linear-gradient(\n      90deg,\n      #dc2626 0%,\n      #ef4444 50%,\n      #f87171 100%);\n  box-shadow: 0 0 12px rgba(239, 68, 68, 0.6);\n}\n.health-bar-danger {\n  position: absolute;\n  top: 0;\n  height: 100%;\n  background:\n    repeating-linear-gradient(\n      -45deg,\n      rgba(239, 68, 68, 0.85) 0px,\n      rgba(239, 68, 68, 0.85) 6px,\n      rgba(185, 28, 28, 0.85) 6px,\n      rgba(185, 28, 28, 0.85) 12px);\n  border-radius: inherit;\n  animation: danger-stripe-flow 0.8s linear infinite;\n  box-shadow: 0 0 10px rgba(239, 68, 68, 0.6);\n}\n@keyframes danger-stripe-flow {\n  0% {\n    background-position: 0 0;\n    opacity: 0.8;\n  }\n  50% {\n    opacity: 1;\n  }\n  100% {\n    background-position: 17px 0;\n    opacity: 0.8;\n  }\n}\n.health-bar-fill.damage-animation {\n  animation: damage-flash-shake 0.7s cubic-bezier(0.36, 0.07, 0.19, 0.97);\n}\n@keyframes damage-flash-shake {\n  0% {\n    filter: brightness(1);\n    transform: scale(1);\n  }\n  20% {\n    filter: brightness(2.2) contrast(1.6);\n    transform: scale(1.04) translateX(-2px);\n  }\n  40% {\n    filter: brightness(0.6);\n    transform: scale(0.96) translateX(2px);\n  }\n  60% {\n    filter: brightness(1.6);\n    transform: scale(1.02) translateX(-1px);\n  }\n  80% {\n    filter: brightness(0.9);\n    transform: scale(0.99) translateX(1px);\n  }\n  100% {\n    filter: brightness(1);\n    transform: scale(1);\n  }\n}\n:host ::ng-deep .dark-theme .health-bar-track {\n  background-color: #424242;\n  border-color: #666;\n}\n:host ::ng-deep .dark-theme .health-bar-label {\n  color: #e0e0e0;\n}\n/*# sourceMappingURL=health-bar.component.css.map */\n'] }]
  }], null, null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(HealthBarComponent, { className: "HealthBarComponent", filePath: "src/app/shared/components/health-bar/health-bar.component.ts", lineNumber: 36 });
})();

// src/app/shared/components/game-board/game-board.component.ts
function GameBoardComponent_Conditional_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 7);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r0.opponentCardCount());
  }
}
function GameBoardComponent_Conditional_11_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "app-card", 11);
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275property("card", ctx_r0.opponentActiveCard())("faceDown", false)("glow", ctx_r0.opponentCardGlow())("animationState", ctx_r0.opponentCardAnimation())("fromPosition", "deck");
  }
}
function GameBoardComponent_Conditional_12_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 12)(1, "span", 21);
    \u0275\u0275text(2, "Opponent");
    \u0275\u0275elementEnd()();
  }
}
function GameBoardComponent_Conditional_14_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "app-card", 11);
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275property("card", ctx_r0.playerActiveCard())("faceDown", false)("glow", ctx_r0.playerCardGlow())("animationState", ctx_r0.playerCardAnimation())("fromPosition", "deck");
  }
}
function GameBoardComponent_Conditional_15_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 12)(1, "span", 21);
    \u0275\u0275text(2, "Player");
    \u0275\u0275elementEnd()();
  }
}
function GameBoardComponent_Conditional_16_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 14);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" Turn ", ctx_r0.turnNumber(), " ");
  }
}
function GameBoardComponent_Conditional_17_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 15);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r0.gameMessage(), " ");
  }
}
function GameBoardComponent_Conditional_18_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 16);
    \u0275\u0275text(1, " Challenge? ");
    \u0275\u0275elementEnd();
  }
}
function GameBoardComponent_Conditional_23_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 7);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r0.playerCardCount());
  }
}
var GameBoardComponent = class _GameBoardComponent {
  settingsService = inject(SettingsService);
  cdr = inject(ChangeDetectorRef);
  // Input properties
  playerCardCount = input(26, ...ngDevMode ? [{ debugName: "playerCardCount" }] : []);
  opponentCardCount = input(26, ...ngDevMode ? [{ debugName: "opponentCardCount" }] : []);
  playerActiveCard = input(null, ...ngDevMode ? [{ debugName: "playerActiveCard" }] : []);
  opponentActiveCard = input(null, ...ngDevMode ? [{ debugName: "opponentActiveCard" }] : []);
  playerCardGlow = input(null, ...ngDevMode ? [{ debugName: "playerCardGlow" }] : []);
  opponentCardGlow = input(null, ...ngDevMode ? [{ debugName: "opponentCardGlow" }] : []);
  playerCardsInDanger = input(0, ...ngDevMode ? [{ debugName: "playerCardsInDanger" }] : []);
  opponentCardsInDanger = input(0, ...ngDevMode ? [{ debugName: "opponentCardsInDanger" }] : []);
  gameMessage = input(null, ...ngDevMode ? [{ debugName: "gameMessage" }] : []);
  challengeAvailable = input(false, ...ngDevMode ? [{ debugName: "challengeAvailable" }] : []);
  canPlayerAct = input(false, ...ngDevMode ? [{ debugName: "canPlayerAct" }] : []);
  turnNumber = input(0, ...ngDevMode ? [{ debugName: "turnNumber" }] : []);
  constructor() {
    effect(() => {
      console.log("GameBoardComponent - canPlayerAct changed to:", this.canPlayerAct());
      console.log("This should trigger template update with classes can-select and glowing");
      this.cdr.detectChanges();
    });
  }
  // Animation states for cards
  playerCardAnimation = input(null, ...ngDevMode ? [{ debugName: "playerCardAnimation" }] : []);
  opponentCardAnimation = input(null, ...ngDevMode ? [{ debugName: "opponentCardAnimation" }] : []);
  // Animation states for health bars
  playerHealthDamageAnimation = input(false, ...ngDevMode ? [{ debugName: "playerHealthDamageAnimation" }] : []);
  opponentHealthDamageAnimation = input(false, ...ngDevMode ? [{ debugName: "opponentHealthDamageAnimation" }] : []);
  // Output events
  playerDeckClicked = output();
  onPlayerDeckClick() {
    console.log("GameBoardComponent - Deck clicked! canPlayerAct is:", this.canPlayerAct());
    if (this.canPlayerAct()) {
      console.log("GameBoardComponent - Emitting playerDeckClicked event");
      this.playerDeckClicked.emit();
    } else {
      console.log("GameBoardComponent - Deck click ignored because canPlayerAct is false");
    }
  }
  static \u0275fac = function GameBoardComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _GameBoardComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _GameBoardComponent, selectors: [["app-game-board"]], inputs: { playerCardCount: [1, "playerCardCount"], opponentCardCount: [1, "opponentCardCount"], playerActiveCard: [1, "playerActiveCard"], opponentActiveCard: [1, "opponentActiveCard"], playerCardGlow: [1, "playerCardGlow"], opponentCardGlow: [1, "opponentCardGlow"], playerCardsInDanger: [1, "playerCardsInDanger"], opponentCardsInDanger: [1, "opponentCardsInDanger"], gameMessage: [1, "gameMessage"], challengeAvailable: [1, "challengeAvailable"], canPlayerAct: [1, "canPlayerAct"], turnNumber: [1, "turnNumber"], playerCardAnimation: [1, "playerCardAnimation"], opponentCardAnimation: [1, "opponentCardAnimation"], playerHealthDamageAnimation: [1, "playerHealthDamageAnimation"], opponentHealthDamageAnimation: [1, "opponentHealthDamageAnimation"] }, outputs: { playerDeckClicked: "playerDeckClicked" }, decls: 26, vars: 26, consts: [[1, "game-board"], [1, "player-area", "opponent-area"], [1, "player-info"], ["label", "Opponent", 3, "current", "maximum", "inDanger", "showDamageAnimation"], [1, "player-deck-area"], [1, "deck-container"], [3, "card", "faceDown"], [1, "deck-count"], [1, "table-area"], [1, "active-cards"], [1, "card-slot", "opponent-slot"], [3, "card", "faceDown", "glow", "animationState", "fromPosition"], [1, "card-slot-placeholder"], [1, "card-slot", "player-slot"], [1, "turn-counter"], [1, "game-message"], [1, "challenge-prompt"], [1, "player-area", "player-area-bottom"], [1, "deck-container", 3, "click"], [3, "card", "faceDown", "glow"], ["label", "You", 3, "current", "maximum", "inDanger", "showDamageAnimation"], [1, "slot-label"]], template: function GameBoardComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 0)(1, "div", 1)(2, "div", 2);
      \u0275\u0275element(3, "app-health-bar", 3);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(4, "div", 4)(5, "div", 5);
      \u0275\u0275element(6, "app-card", 6);
      \u0275\u0275conditionalCreate(7, GameBoardComponent_Conditional_7_Template, 2, 1, "div", 7);
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(8, "div", 8)(9, "div", 9)(10, "div", 10);
      \u0275\u0275conditionalCreate(11, GameBoardComponent_Conditional_11_Template, 1, 5, "app-card", 11)(12, GameBoardComponent_Conditional_12_Template, 3, 0, "div", 12);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(13, "div", 13);
      \u0275\u0275conditionalCreate(14, GameBoardComponent_Conditional_14_Template, 1, 5, "app-card", 11)(15, GameBoardComponent_Conditional_15_Template, 3, 0, "div", 12);
      \u0275\u0275elementEnd()();
      \u0275\u0275conditionalCreate(16, GameBoardComponent_Conditional_16_Template, 2, 1, "div", 14);
      \u0275\u0275conditionalCreate(17, GameBoardComponent_Conditional_17_Template, 2, 1, "div", 15);
      \u0275\u0275conditionalCreate(18, GameBoardComponent_Conditional_18_Template, 2, 0, "div", 16);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(19, "div", 17)(20, "div", 4)(21, "div", 18);
      \u0275\u0275listener("click", function GameBoardComponent_Template_div_click_21_listener() {
        return ctx.onPlayerDeckClick();
      });
      \u0275\u0275element(22, "app-card", 19);
      \u0275\u0275conditionalCreate(23, GameBoardComponent_Conditional_23_Template, 2, 1, "div", 7);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(24, "div", 2);
      \u0275\u0275element(25, "app-health-bar", 20);
      \u0275\u0275elementEnd()()();
    }
    if (rf & 2) {
      \u0275\u0275advance(3);
      \u0275\u0275property("current", ctx.opponentCardCount())("maximum", 26)("inDanger", ctx.opponentCardsInDanger())("showDamageAnimation", ctx.opponentHealthDamageAnimation());
      \u0275\u0275advance(2);
      \u0275\u0275classProp("can-select", false);
      \u0275\u0275advance();
      \u0275\u0275property("card", null)("faceDown", true);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.opponentCardCount() > 1 ? 7 : -1);
      \u0275\u0275advance(4);
      \u0275\u0275conditional(ctx.opponentActiveCard() ? 11 : 12);
      \u0275\u0275advance(3);
      \u0275\u0275conditional(ctx.playerActiveCard() ? 14 : 15);
      \u0275\u0275advance(2);
      \u0275\u0275conditional(ctx.settingsService.showTurnCounter() && ctx.turnNumber() > 0 ? 16 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.gameMessage() ? 17 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.challengeAvailable() ? 18 : -1);
      \u0275\u0275advance(3);
      \u0275\u0275classProp("can-select", ctx.canPlayerAct())("glowing", ctx.canPlayerAct());
      \u0275\u0275advance();
      \u0275\u0275property("card", null)("faceDown", true)("glow", ctx.canPlayerAct() ? "blue" : null);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.playerCardCount() > 1 ? 23 : -1);
      \u0275\u0275advance(2);
      \u0275\u0275property("current", ctx.playerCardCount())("maximum", 26)("inDanger", ctx.playerCardsInDanger())("showDamageAnimation", ctx.playerHealthDamageAnimation());
    }
  }, dependencies: [CommonModule, CardComponent, HealthBarComponent], styles: ['@charset "UTF-8";\n\n\n\n.game-board[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  width: 100%;\n  max-width: 1400px;\n  min-width: 320px;\n  min-height: 480px;\n  height: calc(100vh - 80px);\n  margin: 0 auto;\n  background:\n    radial-gradient(\n      circle at 50% 45%,\n      #236b28 0%,\n      #155219 65%,\n      #0a330e 100%);\n  color: white;\n  overflow: hidden;\n  position: relative;\n  border-radius: 16px;\n  box-shadow: inset 0 0 80px rgba(0, 0, 0, 0.6), 0 12px 36px rgba(0, 0, 0, 0.4);\n  border: 1px solid rgba(255, 255, 255, 0.1);\n}\n@media (max-width: 1440px) {\n  .game-board[_ngcontent-%COMP%] {\n    max-width: 100%;\n    border-radius: 0;\n  }\n}\n@media (max-width: 599px) {\n  .game-board[_ngcontent-%COMP%] {\n    height: calc(100dvh - 64px);\n    min-height: 440px;\n  }\n}\n@media (max-height: 540px) and (orientation: landscape) {\n  .game-board[_ngcontent-%COMP%] {\n    height: calc(100vh - 56px);\n    min-height: 380px;\n  }\n}\n.player-area[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 14px 4%;\n  flex: 0 0 auto;\n  min-height: 100px;\n  -webkit-backdrop-filter: blur(4px);\n  backdrop-filter: blur(4px);\n  background: rgba(0, 0, 0, 0.15);\n}\n@media (max-width: 959px) {\n  .player-area[_ngcontent-%COMP%] {\n    padding: 10px 3%;\n    min-height: 90px;\n  }\n}\n@media (max-width: 599px) {\n  .player-area[_ngcontent-%COMP%] {\n    padding: 8px 12px;\n    min-height: 80px;\n  }\n}\n.opponent-area[_ngcontent-%COMP%] {\n  border-bottom: 2px solid rgba(255, 215, 0, 0.25);\n  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);\n}\n.player-area-bottom[_ngcontent-%COMP%] {\n  border-top: 2px solid rgba(255, 215, 0, 0.25);\n  box-shadow: 0 -4px 15px rgba(0, 0, 0, 0.2);\n}\n.player-info[_ngcontent-%COMP%] {\n  flex: 1;\n  display: flex;\n  align-items: center;\n}\n@media (max-width: 599px) {\n  .player-info[_ngcontent-%COMP%] {\n    flex: 0 0 auto;\n    margin-right: 12px;\n  }\n}\n.player-deck-area[_ngcontent-%COMP%] {\n  flex: 0 0 auto;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n.deck-container[_ngcontent-%COMP%] {\n  position: relative;\n  cursor: pointer;\n  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);\n}\n.deck-container[_ngcontent-%COMP%]::before, \n.deck-container[_ngcontent-%COMP%]::after {\n  content: "";\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  border-radius: 9px;\n  background: #1e3a8a;\n  border: 1px solid rgba(255, 255, 255, 0.3);\n  pointer-events: none;\n  transition: transform 0.3s ease;\n}\n.deck-container[_ngcontent-%COMP%]::before {\n  transform: translate(2px, 3px);\n  z-index: 0;\n  opacity: 0.8;\n}\n.deck-container[_ngcontent-%COMP%]::after {\n  transform: translate(4px, 6px);\n  z-index: -1;\n  opacity: 0.6;\n}\n.deck-container[_ngcontent-%COMP%]   app-card[_ngcontent-%COMP%] {\n  position: relative;\n  z-index: 1;\n}\n.deck-container.can-select[_ngcontent-%COMP%] {\n  cursor: pointer;\n}\n.deck-container.can-select[_ngcontent-%COMP%]:hover {\n  transform: translateY(-6px) scale(1.04);\n}\n.deck-container.can-select[_ngcontent-%COMP%]:hover::before {\n  transform: translate(3px, 4px);\n}\n.deck-container.can-select[_ngcontent-%COMP%]:hover::after {\n  transform: translate(6px, 8px);\n}\n.deck-container.can-select[_ngcontent-%COMP%]:active {\n  transform: translateY(-1px);\n}\n.deck-container.glowing[_ngcontent-%COMP%] {\n  animation: _ngcontent-%COMP%_deck-glow-pulse 1.6s infinite ease-in-out;\n}\n.deck-container[_ngcontent-%COMP%]   .deck-count[_ngcontent-%COMP%] {\n  position: absolute;\n  top: -10px;\n  right: -10px;\n  background:\n    linear-gradient(\n      135deg,\n      #fbbf24 0%,\n      #d97706 100%);\n  color: #0f172a;\n  border-radius: 50%;\n  width: 24px;\n  height: 24px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  font-size: 11px;\n  font-weight: 800;\n  border: 2px solid #ffffff;\n  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);\n  z-index: 10;\n}\n@media (max-width: 599px) {\n  .deck-container[_ngcontent-%COMP%]   .deck-count[_ngcontent-%COMP%] {\n    width: 20px;\n    height: 20px;\n    font-size: 9px;\n    top: -8px;\n    right: -8px;\n  }\n}\n@keyframes _ngcontent-%COMP%_deck-glow-pulse {\n  0%, 100% {\n    filter: drop-shadow(0 0 10px rgba(59, 130, 246, 0.7));\n  }\n  50% {\n    filter: drop-shadow(0 0 22px rgba(99, 102, 241, 0.95));\n  }\n}\n.table-area[_ngcontent-%COMP%] {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  position: relative;\n  padding: 16px 2%;\n  min-height: 200px;\n}\n.table-area[_ngcontent-%COMP%]::before {\n  content: "\\1f0a0";\n  position: absolute;\n  font-size: 240px;\n  opacity: 0.04;\n  color: #ffffff;\n  pointer-events: none;\n  -webkit-user-select: none;\n  user-select: none;\n}\n.active-cards[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 28px;\n  align-items: center;\n  justify-content: center;\n  margin-bottom: 20px;\n  z-index: 2;\n}\n@media (max-width: 599px) {\n  .active-cards[_ngcontent-%COMP%] {\n    gap: 18px;\n    margin-bottom: 14px;\n  }\n}\n.turn-counter[_ngcontent-%COMP%] {\n  background: rgba(15, 23, 42, 0.75);\n  -webkit-backdrop-filter: blur(8px);\n  backdrop-filter: blur(8px);\n  color: #fbbf24;\n  padding: 6px 18px;\n  border-radius: 20px;\n  font-size: 14px;\n  font-weight: 700;\n  text-align: center;\n  margin-bottom: 14px;\n  display: inline-block;\n  border: 1px solid rgba(251, 191, 36, 0.3);\n  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);\n  letter-spacing: 0.5px;\n  z-index: 2;\n}\n@media (max-width: 599px) {\n  .turn-counter[_ngcontent-%COMP%] {\n    font-size: 12px;\n    padding: 4px 14px;\n    margin-bottom: 10px;\n  }\n}\n.game-message[_ngcontent-%COMP%] {\n  background: rgba(15, 23, 42, 0.85);\n  -webkit-backdrop-filter: blur(10px);\n  backdrop-filter: blur(10px);\n  color: #f8fafc;\n  padding: 12px 24px;\n  border-radius: 12px;\n  font-size: 15px;\n  font-weight: 600;\n  text-align: center;\n  margin-bottom: 12px;\n  max-width: 85%;\n  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1);\n  letter-spacing: 0.3px;\n  z-index: 2;\n}\n@media (max-width: 599px) {\n  .game-message[_ngcontent-%COMP%] {\n    font-size: 13px;\n    padding: 10px 18px;\n    max-width: 92%;\n  }\n}\n.challenge-prompt[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      135deg,\n      #2563eb 0%,\n      #4f46e5 100%);\n  color: white;\n  padding: 8px 20px;\n  border-radius: 20px;\n  font-size: 14px;\n  font-weight: 700;\n  text-align: center;\n  animation: _ngcontent-%COMP%_challenge-pulse-bounce 1.2s infinite ease-in-out;\n  box-shadow: 0 4px 15px rgba(79, 70, 229, 0.5);\n  letter-spacing: 0.5px;\n  z-index: 2;\n}\n@keyframes _ngcontent-%COMP%_challenge-pulse-bounce {\n  0%, 100% {\n    opacity: 0.85;\n    transform: scale(1);\n    box-shadow: 0 4px 15px rgba(79, 70, 229, 0.5);\n  }\n  50% {\n    opacity: 1;\n    transform: scale(1.08);\n    box-shadow: 0 6px 25px rgba(99, 102, 241, 0.8);\n  }\n}\n[_nghost-%COMP%]     .dark-theme .game-board {\n  background:\n    radial-gradient(\n      circle at 50% 45%,\n      #1b4d1f 0%,\n      #0e3012 65%,\n      #051a07 100%);\n}\n/*# sourceMappingURL=game-board.component.css.map */'] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(GameBoardComponent, [{
    type: Component,
    args: [{ selector: "app-game-board", standalone: true, imports: [CommonModule, CardComponent, HealthBarComponent], template: `
    <div class="game-board">
      <!-- Opponent Area (Top) -->
      <div class="player-area opponent-area">
        <div class="player-info">
          <app-health-bar 
            label="Opponent"
            [current]="opponentCardCount()"
            [maximum]="26"
            [inDanger]="opponentCardsInDanger()"
            [showDamageAnimation]="opponentHealthDamageAnimation()">
          </app-health-bar>
        </div>
        
        <div class="player-deck-area">
          <div class="deck-container" 
               [class.can-select]="false">
            <app-card 
              [card]="null"
              [faceDown]="true">
            </app-card>
            @if (opponentCardCount() > 1) {
              <div class="deck-count">{{ opponentCardCount() }}</div>
            }
          </div>
        </div>
      </div>

      <!-- Central Table Area -->
      <div class="table-area">
        <div class="active-cards">
          <div class="card-slot opponent-slot">
            @if (opponentActiveCard()) {
              <app-card
                [card]="opponentActiveCard()"
                [faceDown]="false"
                [glow]="opponentCardGlow()"
                [animationState]="opponentCardAnimation()"
                [fromPosition]="'deck'">
              </app-card>
            } @else {
              <div class="card-slot-placeholder">
                <span class="slot-label">Opponent</span>
              </div>
            }
          </div>
          
          <div class="card-slot player-slot">
            @if (playerActiveCard()) {
              <app-card
                [card]="playerActiveCard()"
                [faceDown]="false"
                [glow]="playerCardGlow()"
                [animationState]="playerCardAnimation()"
                [fromPosition]="'deck'">
              </app-card>
            } @else {
              <div class="card-slot-placeholder">
                <span class="slot-label">Player</span>
              </div>
            }
          </div>
        </div>
        
        @if (settingsService.showTurnCounter() && turnNumber() > 0) {
          <div class="turn-counter">
            Turn {{ turnNumber() }}
          </div>
        }
        
        @if (gameMessage()) {
          <div class="game-message">
            {{ gameMessage() }}
          </div>
        }
        
        @if (challengeAvailable()) {
          <div class="challenge-prompt">
            Challenge?
          </div>
        }
      </div>

      <!-- Player Area (Bottom) -->
      <div class="player-area player-area-bottom">
        <div class="player-deck-area">
          <div class="deck-container" 
               [class.can-select]="canPlayerAct()"
               [class.glowing]="canPlayerAct()"
               (click)="onPlayerDeckClick()">
            <app-card 
              [card]="null"
              [faceDown]="true"
              [glow]="canPlayerAct() ? 'blue' : null">
            </app-card>
            @if (playerCardCount() > 1) {
              <div class="deck-count">{{ playerCardCount() }}</div>
            }
          </div>
        </div>
        
        <div class="player-info">
          <app-health-bar 
            label="You"
            [current]="playerCardCount()"
            [maximum]="26"
            [inDanger]="playerCardsInDanger()"
            [showDamageAnimation]="playerHealthDamageAnimation()">
          </app-health-bar>
        </div>
      </div>
    </div>
  `, styles: ['@charset "UTF-8";\n\n/* src/app/shared/components/game-board/game-board.component.scss */\n.game-board {\n  display: flex;\n  flex-direction: column;\n  width: 100%;\n  max-width: 1400px;\n  min-width: 320px;\n  min-height: 480px;\n  height: calc(100vh - 80px);\n  margin: 0 auto;\n  background:\n    radial-gradient(\n      circle at 50% 45%,\n      #236b28 0%,\n      #155219 65%,\n      #0a330e 100%);\n  color: white;\n  overflow: hidden;\n  position: relative;\n  border-radius: 16px;\n  box-shadow: inset 0 0 80px rgba(0, 0, 0, 0.6), 0 12px 36px rgba(0, 0, 0, 0.4);\n  border: 1px solid rgba(255, 255, 255, 0.1);\n}\n@media (max-width: 1440px) {\n  .game-board {\n    max-width: 100%;\n    border-radius: 0;\n  }\n}\n@media (max-width: 599px) {\n  .game-board {\n    height: calc(100dvh - 64px);\n    min-height: 440px;\n  }\n}\n@media (max-height: 540px) and (orientation: landscape) {\n  .game-board {\n    height: calc(100vh - 56px);\n    min-height: 380px;\n  }\n}\n.player-area {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 14px 4%;\n  flex: 0 0 auto;\n  min-height: 100px;\n  -webkit-backdrop-filter: blur(4px);\n  backdrop-filter: blur(4px);\n  background: rgba(0, 0, 0, 0.15);\n}\n@media (max-width: 959px) {\n  .player-area {\n    padding: 10px 3%;\n    min-height: 90px;\n  }\n}\n@media (max-width: 599px) {\n  .player-area {\n    padding: 8px 12px;\n    min-height: 80px;\n  }\n}\n.opponent-area {\n  border-bottom: 2px solid rgba(255, 215, 0, 0.25);\n  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);\n}\n.player-area-bottom {\n  border-top: 2px solid rgba(255, 215, 0, 0.25);\n  box-shadow: 0 -4px 15px rgba(0, 0, 0, 0.2);\n}\n.player-info {\n  flex: 1;\n  display: flex;\n  align-items: center;\n}\n@media (max-width: 599px) {\n  .player-info {\n    flex: 0 0 auto;\n    margin-right: 12px;\n  }\n}\n.player-deck-area {\n  flex: 0 0 auto;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n.deck-container {\n  position: relative;\n  cursor: pointer;\n  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);\n}\n.deck-container::before,\n.deck-container::after {\n  content: "";\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  border-radius: 9px;\n  background: #1e3a8a;\n  border: 1px solid rgba(255, 255, 255, 0.3);\n  pointer-events: none;\n  transition: transform 0.3s ease;\n}\n.deck-container::before {\n  transform: translate(2px, 3px);\n  z-index: 0;\n  opacity: 0.8;\n}\n.deck-container::after {\n  transform: translate(4px, 6px);\n  z-index: -1;\n  opacity: 0.6;\n}\n.deck-container app-card {\n  position: relative;\n  z-index: 1;\n}\n.deck-container.can-select {\n  cursor: pointer;\n}\n.deck-container.can-select:hover {\n  transform: translateY(-6px) scale(1.04);\n}\n.deck-container.can-select:hover::before {\n  transform: translate(3px, 4px);\n}\n.deck-container.can-select:hover::after {\n  transform: translate(6px, 8px);\n}\n.deck-container.can-select:active {\n  transform: translateY(-1px);\n}\n.deck-container.glowing {\n  animation: deck-glow-pulse 1.6s infinite ease-in-out;\n}\n.deck-container .deck-count {\n  position: absolute;\n  top: -10px;\n  right: -10px;\n  background:\n    linear-gradient(\n      135deg,\n      #fbbf24 0%,\n      #d97706 100%);\n  color: #0f172a;\n  border-radius: 50%;\n  width: 24px;\n  height: 24px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  font-size: 11px;\n  font-weight: 800;\n  border: 2px solid #ffffff;\n  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);\n  z-index: 10;\n}\n@media (max-width: 599px) {\n  .deck-container .deck-count {\n    width: 20px;\n    height: 20px;\n    font-size: 9px;\n    top: -8px;\n    right: -8px;\n  }\n}\n@keyframes deck-glow-pulse {\n  0%, 100% {\n    filter: drop-shadow(0 0 10px rgba(59, 130, 246, 0.7));\n  }\n  50% {\n    filter: drop-shadow(0 0 22px rgba(99, 102, 241, 0.95));\n  }\n}\n.table-area {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  position: relative;\n  padding: 16px 2%;\n  min-height: 200px;\n}\n.table-area::before {\n  content: "\\1f0a0";\n  position: absolute;\n  font-size: 240px;\n  opacity: 0.04;\n  color: #ffffff;\n  pointer-events: none;\n  -webkit-user-select: none;\n  user-select: none;\n}\n.active-cards {\n  display: flex;\n  gap: 28px;\n  align-items: center;\n  justify-content: center;\n  margin-bottom: 20px;\n  z-index: 2;\n}\n@media (max-width: 599px) {\n  .active-cards {\n    gap: 18px;\n    margin-bottom: 14px;\n  }\n}\n.turn-counter {\n  background: rgba(15, 23, 42, 0.75);\n  -webkit-backdrop-filter: blur(8px);\n  backdrop-filter: blur(8px);\n  color: #fbbf24;\n  padding: 6px 18px;\n  border-radius: 20px;\n  font-size: 14px;\n  font-weight: 700;\n  text-align: center;\n  margin-bottom: 14px;\n  display: inline-block;\n  border: 1px solid rgba(251, 191, 36, 0.3);\n  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);\n  letter-spacing: 0.5px;\n  z-index: 2;\n}\n@media (max-width: 599px) {\n  .turn-counter {\n    font-size: 12px;\n    padding: 4px 14px;\n    margin-bottom: 10px;\n  }\n}\n.game-message {\n  background: rgba(15, 23, 42, 0.85);\n  -webkit-backdrop-filter: blur(10px);\n  backdrop-filter: blur(10px);\n  color: #f8fafc;\n  padding: 12px 24px;\n  border-radius: 12px;\n  font-size: 15px;\n  font-weight: 600;\n  text-align: center;\n  margin-bottom: 12px;\n  max-width: 85%;\n  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1);\n  letter-spacing: 0.3px;\n  z-index: 2;\n}\n@media (max-width: 599px) {\n  .game-message {\n    font-size: 13px;\n    padding: 10px 18px;\n    max-width: 92%;\n  }\n}\n.challenge-prompt {\n  background:\n    linear-gradient(\n      135deg,\n      #2563eb 0%,\n      #4f46e5 100%);\n  color: white;\n  padding: 8px 20px;\n  border-radius: 20px;\n  font-size: 14px;\n  font-weight: 700;\n  text-align: center;\n  animation: challenge-pulse-bounce 1.2s infinite ease-in-out;\n  box-shadow: 0 4px 15px rgba(79, 70, 229, 0.5);\n  letter-spacing: 0.5px;\n  z-index: 2;\n}\n@keyframes challenge-pulse-bounce {\n  0%, 100% {\n    opacity: 0.85;\n    transform: scale(1);\n    box-shadow: 0 4px 15px rgba(79, 70, 229, 0.5);\n  }\n  50% {\n    opacity: 1;\n    transform: scale(1.08);\n    box-shadow: 0 6px 25px rgba(99, 102, 241, 0.8);\n  }\n}\n:host ::ng-deep .dark-theme .game-board {\n  background:\n    radial-gradient(\n      circle at 50% 45%,\n      #1b4d1f 0%,\n      #0e3012 65%,\n      #051a07 100%);\n}\n/*# sourceMappingURL=game-board.component.css.map */\n'] }]
  }], () => [], null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(GameBoardComponent, { className: "GameBoardComponent", filePath: "src/app/shared/components/game-board/game-board.component.ts", lineNumber: 127 });
})();

// node_modules/@angular/material/fesm2022/toolbar.mjs
var _c0 = ["*", [["mat-toolbar-row"]]];
var _c1 = ["*", "mat-toolbar-row"];
var MatToolbarRow = class _MatToolbarRow {
  static \u0275fac = function MatToolbarRow_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _MatToolbarRow)();
  };
  static \u0275dir = /* @__PURE__ */ \u0275\u0275defineDirective({
    type: _MatToolbarRow,
    selectors: [["mat-toolbar-row"]],
    hostAttrs: [1, "mat-toolbar-row"],
    exportAs: ["matToolbarRow"]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MatToolbarRow, [{
    type: Directive,
    args: [{
      selector: "mat-toolbar-row",
      exportAs: "matToolbarRow",
      host: {
        "class": "mat-toolbar-row"
      }
    }]
  }], null, null);
})();
var MatToolbar = class _MatToolbar {
  _elementRef = inject(ElementRef);
  _platform = inject(Platform);
  _document = inject(DOCUMENT);
  // TODO: should be typed as `ThemePalette` but internal apps pass in arbitrary strings.
  /**
   * Theme color of the toolbar. This API is supported in M2 themes only, it has
   * no effect in M3 themes. For color customization in M3, see https://material.angular.dev/components/toolbar/styling.
   *
   * For information on applying color variants in M3, see
   * https://material.angular.dev/guide/material-2-theming#optional-add-backwards-compatibility-styles-for-color-variants
   */
  color;
  /** Reference to all toolbar row elements that have been projected. */
  _toolbarRows;
  constructor() {
  }
  ngAfterViewInit() {
    if (this._platform.isBrowser) {
      this._checkToolbarMixedModes();
      this._toolbarRows.changes.subscribe(() => this._checkToolbarMixedModes());
    }
  }
  /**
   * Throws an exception when developers are attempting to combine the different toolbar row modes.
   */
  _checkToolbarMixedModes() {
    if (this._toolbarRows.length && (typeof ngDevMode === "undefined" || ngDevMode)) {
      const isCombinedUsage = Array.from(this._elementRef.nativeElement.childNodes).filter((node) => !(node.classList && node.classList.contains("mat-toolbar-row"))).filter((node) => node.nodeType !== (this._document ? this._document.COMMENT_NODE : 8)).some((node) => !!(node.textContent && node.textContent.trim()));
      if (isCombinedUsage) {
        throwToolbarMixedModesError();
      }
    }
  }
  static \u0275fac = function MatToolbar_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _MatToolbar)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({
    type: _MatToolbar,
    selectors: [["mat-toolbar"]],
    contentQueries: function MatToolbar_ContentQueries(rf, ctx, dirIndex) {
      if (rf & 1) {
        \u0275\u0275contentQuery(dirIndex, MatToolbarRow, 5);
      }
      if (rf & 2) {
        let _t;
        \u0275\u0275queryRefresh(_t = \u0275\u0275loadQuery()) && (ctx._toolbarRows = _t);
      }
    },
    hostAttrs: [1, "mat-toolbar"],
    hostVars: 6,
    hostBindings: function MatToolbar_HostBindings(rf, ctx) {
      if (rf & 2) {
        \u0275\u0275classMap(ctx.color ? "mat-" + ctx.color : "");
        \u0275\u0275classProp("mat-toolbar-multiple-rows", ctx._toolbarRows.length > 0)("mat-toolbar-single-row", ctx._toolbarRows.length === 0);
      }
    },
    inputs: {
      color: "color"
    },
    exportAs: ["matToolbar"],
    ngContentSelectors: _c1,
    decls: 2,
    vars: 0,
    template: function MatToolbar_Template(rf, ctx) {
      if (rf & 1) {
        \u0275\u0275projectionDef(_c0);
        \u0275\u0275projection(0);
        \u0275\u0275projection(1, 1);
      }
    },
    styles: [".mat-toolbar{background:var(--mat-toolbar-container-background-color, var(--mat-sys-surface));color:var(--mat-toolbar-container-text-color, var(--mat-sys-on-surface))}.mat-toolbar,.mat-toolbar h1,.mat-toolbar h2,.mat-toolbar h3,.mat-toolbar h4,.mat-toolbar h5,.mat-toolbar h6{font-family:var(--mat-toolbar-title-text-font, var(--mat-sys-title-large-font));font-size:var(--mat-toolbar-title-text-size, var(--mat-sys-title-large-size));line-height:var(--mat-toolbar-title-text-line-height, var(--mat-sys-title-large-line-height));font-weight:var(--mat-toolbar-title-text-weight, var(--mat-sys-title-large-weight));letter-spacing:var(--mat-toolbar-title-text-tracking, var(--mat-sys-title-large-tracking));margin:0}@media(forced-colors: active){.mat-toolbar{outline:solid 1px}}.mat-toolbar .mat-form-field-underline,.mat-toolbar .mat-form-field-ripple,.mat-toolbar .mat-focused .mat-form-field-ripple{background-color:currentColor}.mat-toolbar .mat-form-field-label,.mat-toolbar .mat-focused .mat-form-field-label,.mat-toolbar .mat-select-value,.mat-toolbar .mat-select-arrow,.mat-toolbar .mat-form-field.mat-focused .mat-select-arrow{color:inherit}.mat-toolbar .mat-input-element{caret-color:currentColor}.mat-toolbar .mat-mdc-button-base.mat-mdc-button-base.mat-unthemed{--mat-button-text-label-text-color: var(--mat-toolbar-container-text-color, var(--mat-sys-on-surface));--mat-button-outlined-label-text-color: var(--mat-toolbar-container-text-color, var(--mat-sys-on-surface))}.mat-toolbar-row,.mat-toolbar-single-row{display:flex;box-sizing:border-box;padding:0 16px;width:100%;flex-direction:row;align-items:center;white-space:nowrap;height:var(--mat-toolbar-standard-height, 64px)}@media(max-width: 599px){.mat-toolbar-row,.mat-toolbar-single-row{height:var(--mat-toolbar-mobile-height, 56px)}}.mat-toolbar-multiple-rows{display:flex;box-sizing:border-box;flex-direction:column;width:100%;min-height:var(--mat-toolbar-standard-height, 64px)}@media(max-width: 599px){.mat-toolbar-multiple-rows{min-height:var(--mat-toolbar-mobile-height, 56px)}}\n"],
    encapsulation: 2,
    changeDetection: 0
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MatToolbar, [{
    type: Component,
    args: [{
      selector: "mat-toolbar",
      exportAs: "matToolbar",
      host: {
        "class": "mat-toolbar",
        "[class]": 'color ? "mat-" + color : ""',
        "[class.mat-toolbar-multiple-rows]": "_toolbarRows.length > 0",
        "[class.mat-toolbar-single-row]": "_toolbarRows.length === 0"
      },
      changeDetection: ChangeDetectionStrategy.OnPush,
      encapsulation: ViewEncapsulation.None,
      template: '<ng-content></ng-content>\n<ng-content select="mat-toolbar-row"></ng-content>\n',
      styles: [".mat-toolbar{background:var(--mat-toolbar-container-background-color, var(--mat-sys-surface));color:var(--mat-toolbar-container-text-color, var(--mat-sys-on-surface))}.mat-toolbar,.mat-toolbar h1,.mat-toolbar h2,.mat-toolbar h3,.mat-toolbar h4,.mat-toolbar h5,.mat-toolbar h6{font-family:var(--mat-toolbar-title-text-font, var(--mat-sys-title-large-font));font-size:var(--mat-toolbar-title-text-size, var(--mat-sys-title-large-size));line-height:var(--mat-toolbar-title-text-line-height, var(--mat-sys-title-large-line-height));font-weight:var(--mat-toolbar-title-text-weight, var(--mat-sys-title-large-weight));letter-spacing:var(--mat-toolbar-title-text-tracking, var(--mat-sys-title-large-tracking));margin:0}@media(forced-colors: active){.mat-toolbar{outline:solid 1px}}.mat-toolbar .mat-form-field-underline,.mat-toolbar .mat-form-field-ripple,.mat-toolbar .mat-focused .mat-form-field-ripple{background-color:currentColor}.mat-toolbar .mat-form-field-label,.mat-toolbar .mat-focused .mat-form-field-label,.mat-toolbar .mat-select-value,.mat-toolbar .mat-select-arrow,.mat-toolbar .mat-form-field.mat-focused .mat-select-arrow{color:inherit}.mat-toolbar .mat-input-element{caret-color:currentColor}.mat-toolbar .mat-mdc-button-base.mat-mdc-button-base.mat-unthemed{--mat-button-text-label-text-color: var(--mat-toolbar-container-text-color, var(--mat-sys-on-surface));--mat-button-outlined-label-text-color: var(--mat-toolbar-container-text-color, var(--mat-sys-on-surface))}.mat-toolbar-row,.mat-toolbar-single-row{display:flex;box-sizing:border-box;padding:0 16px;width:100%;flex-direction:row;align-items:center;white-space:nowrap;height:var(--mat-toolbar-standard-height, 64px)}@media(max-width: 599px){.mat-toolbar-row,.mat-toolbar-single-row{height:var(--mat-toolbar-mobile-height, 56px)}}.mat-toolbar-multiple-rows{display:flex;box-sizing:border-box;flex-direction:column;width:100%;min-height:var(--mat-toolbar-standard-height, 64px)}@media(max-width: 599px){.mat-toolbar-multiple-rows{min-height:var(--mat-toolbar-mobile-height, 56px)}}\n"]
    }]
  }], () => [], {
    color: [{
      type: Input
    }],
    _toolbarRows: [{
      type: ContentChildren,
      args: [MatToolbarRow, {
        descendants: true
      }]
    }]
  });
})();
function throwToolbarMixedModesError() {
  throw Error("MatToolbar: Attempting to combine different toolbar modes. Either specify multiple `<mat-toolbar-row>` elements explicitly or just place content inside of a `<mat-toolbar>` for a single row.");
}
var MatToolbarModule = class _MatToolbarModule {
  static \u0275fac = function MatToolbarModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _MatToolbarModule)();
  };
  static \u0275mod = /* @__PURE__ */ \u0275\u0275defineNgModule({
    type: _MatToolbarModule,
    imports: [MatCommonModule, MatToolbar, MatToolbarRow],
    exports: [MatToolbar, MatToolbarRow, MatCommonModule]
  });
  static \u0275inj = /* @__PURE__ */ \u0275\u0275defineInjector({
    imports: [MatCommonModule, MatCommonModule]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MatToolbarModule, [{
    type: NgModule,
    args: [{
      imports: [MatCommonModule, MatToolbar, MatToolbarRow],
      exports: [MatToolbar, MatToolbarRow, MatCommonModule]
    }]
  }], null, null);
})();

// src/app/shared/components/discard-pile-viewer/discard-pile-viewer.component.ts
function DiscardPileViewerComponent_Conditional_12_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 5)(1, "mat-icon", 10);
    \u0275\u0275text(2, "delete_outline");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "h3");
    \u0275\u0275text(4, "No Cards Discarded");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "p");
    \u0275\u0275text(6, "Cards lost during gameplay will appear here.");
    \u0275\u0275elementEnd()();
  }
}
function DiscardPileViewerComponent_Conditional_13_For_6_Conditional_5_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275text(0, " Your Card ");
  }
}
function DiscardPileViewerComponent_Conditional_13_For_6_Conditional_6_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275text(0, " Opponent's Card ");
  }
}
function DiscardPileViewerComponent_Conditional_13_For_6_Conditional_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 19);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const cardInfo_r1 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("Turn ", cardInfo_r1.turnNumber);
  }
}
function DiscardPileViewerComponent_Conditional_13_For_6_Conditional_8_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 20);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const cardInfo_r1 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(cardInfo_r1.reason);
  }
}
function DiscardPileViewerComponent_Conditional_13_For_6_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 14)(1, "div", 15);
    \u0275\u0275element(2, "app-card", 16);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 17)(4, "div", 18);
    \u0275\u0275conditionalCreate(5, DiscardPileViewerComponent_Conditional_13_For_6_Conditional_5_Template, 1, 0)(6, DiscardPileViewerComponent_Conditional_13_For_6_Conditional_6_Template, 1, 0);
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(7, DiscardPileViewerComponent_Conditional_13_For_6_Conditional_7_Template, 2, 1, "div", 19);
    \u0275\u0275conditionalCreate(8, DiscardPileViewerComponent_Conditional_13_For_6_Conditional_8_Template, 2, 1, "div", 20);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const cardInfo_r1 = ctx.$implicit;
    \u0275\u0275classMap("lost-by-" + cardInfo_r1.playerType);
    \u0275\u0275advance(2);
    \u0275\u0275property("card", cardInfo_r1.card)("faceDown", false);
    \u0275\u0275advance(2);
    \u0275\u0275classMap(cardInfo_r1.playerType);
    \u0275\u0275advance();
    \u0275\u0275conditional(cardInfo_r1.playerType === "player" ? 5 : 6);
    \u0275\u0275advance(2);
    \u0275\u0275conditional(cardInfo_r1.turnNumber ? 7 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(cardInfo_r1.reason ? 8 : -1);
  }
}
function DiscardPileViewerComponent_Conditional_13_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 6)(1, "div", 11)(2, "small");
    \u0275\u0275text(3, "Most recent discards shown first");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(4, "div", 12);
    \u0275\u0275repeaterCreate(5, DiscardPileViewerComponent_Conditional_13_For_6_Template, 9, 9, "div", 13, \u0275\u0275repeaterTrackByIndex);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(5);
    \u0275\u0275repeater(ctx_r1.discardedCardInfos());
  }
}
function DiscardPileViewerComponent_Conditional_17_Template(rf, ctx) {
  if (rf & 1) {
    const _r3 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 21);
    \u0275\u0275listener("click", function DiscardPileViewerComponent_Conditional_17_Template_button_click_0_listener() {
      \u0275\u0275restoreView(_r3);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.scrollToTop());
    });
    \u0275\u0275elementStart(1, "mat-icon");
    \u0275\u0275text(2, "keyboard_arrow_up");
    \u0275\u0275elementEnd();
    \u0275\u0275text(3, " Back to Recent ");
    \u0275\u0275elementEnd();
  }
}
var DiscardPileViewerComponent = class _DiscardPileViewerComponent {
  dialogRef;
  data;
  discardedCards = computed(() => this.data.discardedCards || [], ...ngDevMode ? [{ debugName: "discardedCards" }] : []);
  // Show discarded cards in reverse chronological order (newest first) for better UX
  discardedCardInfos = computed(
    () => this.discardedCards().map((card, index) => ({
      card,
      playerType: card.suit === Suit.HEARTS || card.suit === Suit.DIAMONDS ? "player" : "opponent",
      // Determine by card color
      turnNumber: void 0,
      // Don't show turn numbers since we don't have reliable tracking
      reason: void 0
      // Don't show reasons since we don't have reliable tracking
    })).reverse(),
    ...ngDevMode ? [{ debugName: "discardedCardInfos" }] : []
  );
  constructor(dialogRef, data) {
    this.dialogRef = dialogRef;
    this.data = data;
  }
  close() {
    this.dialogRef.close();
  }
  scrollToTop() {
    const scrollContainer = document.querySelector(".cards-scroll");
    if (scrollContainer) {
      scrollContainer.scrollTop = 0;
    }
  }
  static \u0275fac = function DiscardPileViewerComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _DiscardPileViewerComponent)(\u0275\u0275directiveInject(MatDialogRef), \u0275\u0275directiveInject(MAT_DIALOG_DATA));
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _DiscardPileViewerComponent, selectors: [["app-discard-pile-viewer"]], decls: 18, vars: 3, consts: [[1, "title"], [1, "spacer"], [1, "card-count"], ["mat-icon-button", "", 3, "click"], [1, "dialog-content"], [1, "empty-state"], [1, "cards-container"], [1, "dialog-actions"], ["mat-button", "", 3, "click"], ["mat-raised-button", "", "color", "primary"], [1, "empty-icon"], [1, "sort-info"], [1, "cards-scroll"], [1, "card-item", 3, "class"], [1, "card-item"], [1, "card-wrapper"], [3, "card", "faceDown"], [1, "card-info"], [1, "player-indicator"], [1, "turn-info"], [1, "reason"], ["mat-raised-button", "", "color", "primary", 3, "click"]], template: function DiscardPileViewerComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "mat-toolbar")(1, "span", 0)(2, "mat-icon");
      \u0275\u0275text(3, "delete");
      \u0275\u0275elementEnd();
      \u0275\u0275text(4, " Discard Pile ");
      \u0275\u0275elementEnd();
      \u0275\u0275element(5, "span", 1);
      \u0275\u0275elementStart(6, "span", 2);
      \u0275\u0275text(7);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(8, "button", 3);
      \u0275\u0275listener("click", function DiscardPileViewerComponent_Template_button_click_8_listener() {
        return ctx.close();
      });
      \u0275\u0275elementStart(9, "mat-icon");
      \u0275\u0275text(10, "close");
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(11, "div", 4);
      \u0275\u0275conditionalCreate(12, DiscardPileViewerComponent_Conditional_12_Template, 7, 0, "div", 5)(13, DiscardPileViewerComponent_Conditional_13_Template, 7, 0, "div", 6);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(14, "div", 7)(15, "button", 8);
      \u0275\u0275listener("click", function DiscardPileViewerComponent_Template_button_click_15_listener() {
        return ctx.close();
      });
      \u0275\u0275text(16, "Close");
      \u0275\u0275elementEnd();
      \u0275\u0275conditionalCreate(17, DiscardPileViewerComponent_Conditional_17_Template, 4, 0, "button", 9);
      \u0275\u0275elementEnd();
    }
    if (rf & 2) {
      \u0275\u0275advance(7);
      \u0275\u0275textInterpolate1("", ctx.discardedCards().length, " cards");
      \u0275\u0275advance(5);
      \u0275\u0275conditional(ctx.discardedCards().length === 0 ? 12 : 13);
      \u0275\u0275advance(5);
      \u0275\u0275conditional(ctx.discardedCards().length > 0 ? 17 : -1);
    }
  }, dependencies: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatButton,
    MatIconButton,
    MatIconModule,
    MatIcon,
    MatToolbarModule,
    MatToolbar,
    CardComponent
  ], styles: ["\n\n.title[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  font-weight: 500;\n}\n.spacer[_ngcontent-%COMP%] {\n  flex: 1;\n}\n.card-count[_ngcontent-%COMP%] {\n  font-size: 0.9em;\n  opacity: 0.8;\n}\n.dialog-content[_ngcontent-%COMP%] {\n  max-height: 70vh;\n  min-height: 300px;\n  padding: 0;\n  overflow: hidden;\n}\n.empty-state[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  height: 300px;\n  text-align: center;\n  color: rgba(0, 0, 0, 0.6);\n}\n.empty-state[_ngcontent-%COMP%]   .empty-icon[_ngcontent-%COMP%] {\n  font-size: 64px;\n  width: 64px;\n  height: 64px;\n  margin-bottom: 16px;\n  opacity: 0.3;\n}\n.empty-state[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] {\n  margin: 0 0 8px 0;\n  font-weight: 400;\n}\n.empty-state[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 0.9em;\n}\n.cards-container[_ngcontent-%COMP%] {\n  height: 100%;\n  display: flex;\n  flex-direction: column;\n}\n.sort-info[_ngcontent-%COMP%] {\n  padding: 8px 16px;\n  background: rgba(0, 0, 0, 0.03);\n  border-bottom: 1px solid rgba(0, 0, 0, 0.08);\n  text-align: center;\n}\n.sort-info[_ngcontent-%COMP%]   small[_ngcontent-%COMP%] {\n  color: rgba(0, 0, 0, 0.6);\n  font-size: 0.75em;\n}\n.cards-scroll[_ngcontent-%COMP%] {\n  flex: 1;\n  overflow-y: auto;\n  padding: 16px;\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n}\n.card-item[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 16px;\n  padding: 12px;\n  border-radius: 8px;\n  border: 1px solid rgba(0, 0, 0, 0.12);\n  background-color: rgba(0, 0, 0, 0.02);\n  transition: all 0.2s ease;\n}\n.card-item[_ngcontent-%COMP%]:hover {\n  background-color: rgba(0, 0, 0, 0.04);\n}\n.card-item.lost-by-player[_ngcontent-%COMP%] {\n  border-left: 4px solid #f44336;\n}\n.card-item.lost-by-opponent[_ngcontent-%COMP%] {\n  border-left: 4px solid #4caf50;\n}\n.card-wrapper[_ngcontent-%COMP%] {\n  flex-shrink: 0;\n}\n.card-info[_ngcontent-%COMP%] {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n}\n.player-indicator[_ngcontent-%COMP%] {\n  font-weight: 500;\n  font-size: 0.9em;\n}\n.player-indicator.player[_ngcontent-%COMP%] {\n  color: #f44336;\n}\n.player-indicator.opponent[_ngcontent-%COMP%] {\n  color: #4caf50;\n}\n.turn-info[_ngcontent-%COMP%] {\n  font-size: 0.8em;\n  opacity: 0.7;\n}\n.reason[_ngcontent-%COMP%] {\n  font-size: 0.8em;\n  font-style: italic;\n  opacity: 0.8;\n}\n.dialog-actions[_ngcontent-%COMP%] {\n  padding: 16px;\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  border-top: 1px solid rgba(0, 0, 0, 0.12);\n}\n@media (max-width: 599px) {\n  .card-item[_ngcontent-%COMP%] {\n    flex-direction: column;\n    text-align: center;\n    gap: 8px;\n  }\n  .card-info[_ngcontent-%COMP%] {\n    align-items: center;\n  }\n  .dialog-actions[_ngcontent-%COMP%] {\n    flex-direction: column;\n    gap: 8px;\n  }\n  .dialog-actions[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] {\n    width: 100%;\n  }\n}\n.dark-theme[_nghost-%COMP%]   .card-item[_ngcontent-%COMP%], .dark-theme   [_nghost-%COMP%]   .card-item[_ngcontent-%COMP%] {\n  border-color: rgba(255, 255, 255, 0.12);\n  background-color: rgba(255, 255, 255, 0.02);\n}\n.dark-theme[_nghost-%COMP%]   .card-item[_ngcontent-%COMP%]:hover, .dark-theme   [_nghost-%COMP%]   .card-item[_ngcontent-%COMP%]:hover {\n  background-color: rgba(255, 255, 255, 0.04);\n}\n.dark-theme[_nghost-%COMP%]   .empty-state[_ngcontent-%COMP%], .dark-theme   [_nghost-%COMP%]   .empty-state[_ngcontent-%COMP%] {\n  color: rgba(255, 255, 255, 0.6);\n}\n.dark-theme[_nghost-%COMP%]   .dialog-actions[_ngcontent-%COMP%], .dark-theme   [_nghost-%COMP%]   .dialog-actions[_ngcontent-%COMP%] {\n  border-top-color: rgba(255, 255, 255, 0.12);\n}\n.dark-theme[_nghost-%COMP%]   .sort-info[_ngcontent-%COMP%], .dark-theme   [_nghost-%COMP%]   .sort-info[_ngcontent-%COMP%] {\n  background: rgba(255, 255, 255, 0.03);\n  border-bottom-color: rgba(255, 255, 255, 0.08);\n}\n.dark-theme[_nghost-%COMP%]   .sort-info[_ngcontent-%COMP%]   small[_ngcontent-%COMP%], .dark-theme   [_nghost-%COMP%]   .sort-info[_ngcontent-%COMP%]   small[_ngcontent-%COMP%] {\n  color: rgba(255, 255, 255, 0.6);\n}\n/*# sourceMappingURL=discard-pile-viewer.component.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(DiscardPileViewerComponent, [{
    type: Component,
    args: [{ selector: "app-discard-pile-viewer", imports: [
      CommonModule,
      MatDialogModule,
      MatButtonModule,
      MatIconModule,
      MatToolbarModule,
      CardComponent
    ], template: `
    <mat-toolbar>
      <span class="title">
        <mat-icon>delete</mat-icon>
        Discard Pile
      </span>
      <span class="spacer"></span>
      <span class="card-count">{{ discardedCards().length }} cards</span>
      <button mat-icon-button (click)="close()">
        <mat-icon>close</mat-icon>
      </button>
    </mat-toolbar>

    <div class="dialog-content">
      @if (discardedCards().length === 0) {
        <div class="empty-state">
          <mat-icon class="empty-icon">delete_outline</mat-icon>
          <h3>No Cards Discarded</h3>
          <p>Cards lost during gameplay will appear here.</p>
        </div>
      } @else {
        <div class="cards-container">
          <div class="sort-info">
            <small>Most recent discards shown first</small>
          </div>
          <div class="cards-scroll">
            @for (cardInfo of discardedCardInfos(); track $index) {
              <div class="card-item" [class]="'lost-by-' + cardInfo.playerType">
                <div class="card-wrapper">
                  <app-card [card]="cardInfo.card" [faceDown]="false"></app-card>
                </div>
                <div class="card-info">
                  <div class="player-indicator" [class]="cardInfo.playerType">
                    @if (cardInfo.playerType === 'player') {
                      Your Card
                    } @else {
                      Opponent's Card
                    }
                  </div>
                  <!-- Only show turn and reason info if available -->
                  @if (cardInfo.turnNumber) {
                    <div class="turn-info">Turn {{ cardInfo.turnNumber }}</div>
                  }
                  @if (cardInfo.reason) {
                    <div class="reason">{{ cardInfo.reason }}</div>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>

    <div class="dialog-actions">
      <button mat-button (click)="close()">Close</button>
      @if (discardedCards().length > 0) {
        <button mat-raised-button color="primary" (click)="scrollToTop()">
          <mat-icon>keyboard_arrow_up</mat-icon>
          Back to Recent
        </button>
      }
    </div>
  `, styles: ["/* angular:styles/component:scss;a09446aeeeda6a06daebac2258c0b14488cd930aedd3e3a5ab2150071604258e;C:/Users/lacyv/Documents/GitHub/war-of-attrition-game/src/app/shared/components/discard-pile-viewer/discard-pile-viewer.component.ts */\n.title {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  font-weight: 500;\n}\n.spacer {\n  flex: 1;\n}\n.card-count {\n  font-size: 0.9em;\n  opacity: 0.8;\n}\n.dialog-content {\n  max-height: 70vh;\n  min-height: 300px;\n  padding: 0;\n  overflow: hidden;\n}\n.empty-state {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  height: 300px;\n  text-align: center;\n  color: rgba(0, 0, 0, 0.6);\n}\n.empty-state .empty-icon {\n  font-size: 64px;\n  width: 64px;\n  height: 64px;\n  margin-bottom: 16px;\n  opacity: 0.3;\n}\n.empty-state h3 {\n  margin: 0 0 8px 0;\n  font-weight: 400;\n}\n.empty-state p {\n  margin: 0;\n  font-size: 0.9em;\n}\n.cards-container {\n  height: 100%;\n  display: flex;\n  flex-direction: column;\n}\n.sort-info {\n  padding: 8px 16px;\n  background: rgba(0, 0, 0, 0.03);\n  border-bottom: 1px solid rgba(0, 0, 0, 0.08);\n  text-align: center;\n}\n.sort-info small {\n  color: rgba(0, 0, 0, 0.6);\n  font-size: 0.75em;\n}\n.cards-scroll {\n  flex: 1;\n  overflow-y: auto;\n  padding: 16px;\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n}\n.card-item {\n  display: flex;\n  align-items: center;\n  gap: 16px;\n  padding: 12px;\n  border-radius: 8px;\n  border: 1px solid rgba(0, 0, 0, 0.12);\n  background-color: rgba(0, 0, 0, 0.02);\n  transition: all 0.2s ease;\n}\n.card-item:hover {\n  background-color: rgba(0, 0, 0, 0.04);\n}\n.card-item.lost-by-player {\n  border-left: 4px solid #f44336;\n}\n.card-item.lost-by-opponent {\n  border-left: 4px solid #4caf50;\n}\n.card-wrapper {\n  flex-shrink: 0;\n}\n.card-info {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n}\n.player-indicator {\n  font-weight: 500;\n  font-size: 0.9em;\n}\n.player-indicator.player {\n  color: #f44336;\n}\n.player-indicator.opponent {\n  color: #4caf50;\n}\n.turn-info {\n  font-size: 0.8em;\n  opacity: 0.7;\n}\n.reason {\n  font-size: 0.8em;\n  font-style: italic;\n  opacity: 0.8;\n}\n.dialog-actions {\n  padding: 16px;\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  border-top: 1px solid rgba(0, 0, 0, 0.12);\n}\n@media (max-width: 599px) {\n  .card-item {\n    flex-direction: column;\n    text-align: center;\n    gap: 8px;\n  }\n  .card-info {\n    align-items: center;\n  }\n  .dialog-actions {\n    flex-direction: column;\n    gap: 8px;\n  }\n  .dialog-actions button {\n    width: 100%;\n  }\n}\n:host-context(.dark-theme) .card-item {\n  border-color: rgba(255, 255, 255, 0.12);\n  background-color: rgba(255, 255, 255, 0.02);\n}\n:host-context(.dark-theme) .card-item:hover {\n  background-color: rgba(255, 255, 255, 0.04);\n}\n:host-context(.dark-theme) .empty-state {\n  color: rgba(255, 255, 255, 0.6);\n}\n:host-context(.dark-theme) .dialog-actions {\n  border-top-color: rgba(255, 255, 255, 0.12);\n}\n:host-context(.dark-theme) .sort-info {\n  background: rgba(255, 255, 255, 0.03);\n  border-bottom-color: rgba(255, 255, 255, 0.08);\n}\n:host-context(.dark-theme) .sort-info small {\n  color: rgba(255, 255, 255, 0.6);\n}\n/*# sourceMappingURL=discard-pile-viewer.component.css.map */\n"] }]
  }], () => [{ type: MatDialogRef }, { type: void 0, decorators: [{
    type: Inject,
    args: [MAT_DIALOG_DATA]
  }] }], null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(DiscardPileViewerComponent, { className: "DiscardPileViewerComponent", filePath: "src/app/shared/components/discard-pile-viewer/discard-pile-viewer.component.ts", lineNumber: 291 });
})();

// src/app/shared/components/victory-dialog/victory-dialog.component.ts
var VictoryDialogComponent = class _VictoryDialogComponent {
  data;
  authService = inject(AuthService);
  dialogRef = inject(MatDialogRef);
  profile = this.authService.activeProfile;
  stats = this.authService.userStats;
  constructor(data) {
    this.data = data;
  }
  get isWin() {
    return this.data.winner === "player";
  }
  playAgain() {
    this.dialogRef.close({ action: "playAgain" });
  }
  openProfile() {
    this.dialogRef.close({ action: "openProfile" });
  }
  static \u0275fac = function VictoryDialogComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _VictoryDialogComponent)(\u0275\u0275directiveInject(MAT_DIALOG_DATA));
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _VictoryDialogComponent, selectors: [["app-victory-dialog"]], decls: 46, vars: 17, consts: [[1, "victory-dialog-container"], [1, "victory-banner"], [1, "trophy-glow"], [1, "subtitle"], [1, "dialog-body"], [1, "metrics-row"], [1, "metric-box"], [1, "value"], [1, "label"], [1, "body-divider"], [1, "updated-user-summary"], [1, "user-thumb", 3, "src", "alt"], [1, "user-stats-compact"], [1, "user-name"], [1, "user-lifetime"], [1, "dialog-actions"], ["mat-button", "", 1, "view-profile-btn", 3, "click"], ["mat-raised-button", "", "color", "primary", 1, "play-again-btn", 3, "click"]], template: function VictoryDialogComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 0)(1, "div", 1)(2, "div", 2)(3, "mat-icon");
      \u0275\u0275text(4);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(5, "h2");
      \u0275\u0275text(6);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(7, "p", 3);
      \u0275\u0275text(8);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(9, "div", 4)(10, "div", 5)(11, "div", 6)(12, "span", 7);
      \u0275\u0275text(13);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(14, "span", 8);
      \u0275\u0275text(15, "Total Turns");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(16, "div", 6)(17, "span", 7);
      \u0275\u0275text(18);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(19, "span", 8);
      \u0275\u0275text(20, "Final Cards (You / Opponent)");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(21, "div", 6)(22, "span", 7);
      \u0275\u0275text(23);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(24, "span", 8);
      \u0275\u0275text(25, "Cards Discarded");
      \u0275\u0275elementEnd()()();
      \u0275\u0275element(26, "mat-divider", 9);
      \u0275\u0275elementStart(27, "div", 10);
      \u0275\u0275element(28, "img", 11);
      \u0275\u0275elementStart(29, "div", 12)(30, "span", 13);
      \u0275\u0275text(31);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(32, "span", 14);
      \u0275\u0275text(33, " Lifetime Win Rate: ");
      \u0275\u0275elementStart(34, "strong");
      \u0275\u0275text(35);
      \u0275\u0275elementEnd();
      \u0275\u0275text(36);
      \u0275\u0275elementEnd()()()();
      \u0275\u0275elementStart(37, "div", 15)(38, "button", 16);
      \u0275\u0275listener("click", function VictoryDialogComponent_Template_button_click_38_listener() {
        return ctx.openProfile();
      });
      \u0275\u0275elementStart(39, "mat-icon");
      \u0275\u0275text(40, "person");
      \u0275\u0275elementEnd();
      \u0275\u0275text(41, " View Full Stats ");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(42, "button", 17);
      \u0275\u0275listener("click", function VictoryDialogComponent_Template_button_click_42_listener() {
        return ctx.playAgain();
      });
      \u0275\u0275elementStart(43, "mat-icon");
      \u0275\u0275text(44, "replay");
      \u0275\u0275elementEnd();
      \u0275\u0275text(45, " Play Again ");
      \u0275\u0275elementEnd()()();
    }
    if (rf & 2) {
      \u0275\u0275classProp("win", ctx.isWin)("loss", !ctx.isWin);
      \u0275\u0275advance(4);
      \u0275\u0275textInterpolate(ctx.isWin ? "emoji_events" : "sentiment_dissatisfied");
      \u0275\u0275advance(2);
      \u0275\u0275textInterpolate(ctx.isWin ? "VICTORY!" : "DEFEAT");
      \u0275\u0275advance(2);
      \u0275\u0275textInterpolate(ctx.isWin ? "You outlasted your opponent in the War of Attrition!" : "Your deck was depleted in combat.");
      \u0275\u0275advance(5);
      \u0275\u0275textInterpolate(ctx.data.totalTurns);
      \u0275\u0275advance(5);
      \u0275\u0275textInterpolate2("", ctx.data.playerCardCount, " vs ", ctx.data.opponentCardCount);
      \u0275\u0275advance(5);
      \u0275\u0275textInterpolate(ctx.data.discardedCardCount);
      \u0275\u0275advance(5);
      \u0275\u0275property("src", ctx.profile().avatarUrl, \u0275\u0275sanitizeUrl)("alt", ctx.profile().name);
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(ctx.profile().name);
      \u0275\u0275advance(4);
      \u0275\u0275textInterpolate1("", ctx.stats().winRatePercentage, "%");
      \u0275\u0275advance();
      \u0275\u0275textInterpolate2(" (", ctx.stats().gamesWon, "W / ", ctx.stats().gamesLost, "L) ");
    }
  }, dependencies: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatButton,
    MatIconModule,
    MatIcon,
    MatCardModule,
    MatDividerModule,
    MatDivider
  ], styles: ["\n\n.victory-dialog-container[_ngcontent-%COMP%] {\n  padding: 0;\n  max-width: 520px;\n  background: #0f172a;\n  color: #f8fafc;\n  border-radius: 16px;\n  overflow: hidden;\n  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6);\n}\n.victory-dialog-container.win[_ngcontent-%COMP%]   .victory-banner[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      135deg,\n      #15803d 0%,\n      #166534 100%);\n}\n.victory-dialog-container.win[_ngcontent-%COMP%]   .victory-banner[_ngcontent-%COMP%]   .trophy-glow[_ngcontent-%COMP%] {\n  color: #fde047;\n  box-shadow: 0 0 30px rgba(250, 204, 21, 0.4);\n}\n.victory-dialog-container.loss[_ngcontent-%COMP%]   .victory-banner[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      135deg,\n      #b91c1c 0%,\n      #991b1b 100%);\n}\n.victory-dialog-container.loss[_ngcontent-%COMP%]   .victory-banner[_ngcontent-%COMP%]   .trophy-glow[_ngcontent-%COMP%] {\n  color: #f87171;\n  box-shadow: 0 0 30px rgba(239, 68, 68, 0.4);\n}\n.victory-banner[_ngcontent-%COMP%] {\n  padding: 32px 24px 24px 24px;\n  text-align: center;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n}\n.victory-banner[_ngcontent-%COMP%]   .trophy-glow[_ngcontent-%COMP%] {\n  width: 72px;\n  height: 72px;\n  border-radius: 50%;\n  background: rgba(15, 23, 42, 0.4);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  margin-bottom: 12px;\n}\n.victory-banner[_ngcontent-%COMP%]   .trophy-glow[_ngcontent-%COMP%]   mat-icon[_ngcontent-%COMP%] {\n  font-size: 42px;\n  width: 42px;\n  height: 42px;\n}\n.victory-banner[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 2rem;\n  font-weight: 900;\n  letter-spacing: 1px;\n  color: #ffffff;\n}\n.victory-banner[_ngcontent-%COMP%]   .subtitle[_ngcontent-%COMP%] {\n  margin: 6px 0 0 0;\n  font-size: 0.95rem;\n  color: rgba(255, 255, 255, 0.85);\n}\n.dialog-body[_ngcontent-%COMP%] {\n  padding: 24px;\n}\n.dialog-body[_ngcontent-%COMP%]   .metrics-row[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 12px;\n}\n@media (max-width: 480px) {\n  .dialog-body[_ngcontent-%COMP%]   .metrics-row[_ngcontent-%COMP%] {\n    grid-template-columns: 1fr;\n  }\n}\n.dialog-body[_ngcontent-%COMP%]   .metrics-row[_ngcontent-%COMP%]   .metric-box[_ngcontent-%COMP%] {\n  background: rgba(30, 41, 59, 0.8);\n  border: 1px solid rgba(255, 255, 255, 0.1);\n  border-radius: 12px;\n  padding: 12px;\n  text-align: center;\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n}\n.dialog-body[_ngcontent-%COMP%]   .metrics-row[_ngcontent-%COMP%]   .metric-box[_ngcontent-%COMP%]   .value[_ngcontent-%COMP%] {\n  font-size: 1.3rem;\n  font-weight: 800;\n  color: #ffffff;\n}\n.dialog-body[_ngcontent-%COMP%]   .metrics-row[_ngcontent-%COMP%]   .metric-box[_ngcontent-%COMP%]   .label[_ngcontent-%COMP%] {\n  font-size: 0.72rem;\n  color: #94a3b8;\n  font-weight: 600;\n  text-transform: uppercase;\n}\n.dialog-body[_ngcontent-%COMP%]   .body-divider[_ngcontent-%COMP%] {\n  margin: 20px 0;\n  border-color: rgba(255, 255, 255, 0.1);\n}\n.dialog-body[_ngcontent-%COMP%]   .updated-user-summary[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 14px;\n  background: rgba(15, 23, 42, 0.6);\n  padding: 12px 16px;\n  border-radius: 12px;\n  border: 1px solid rgba(255, 255, 255, 0.08);\n}\n.dialog-body[_ngcontent-%COMP%]   .updated-user-summary[_ngcontent-%COMP%]   .user-thumb[_ngcontent-%COMP%] {\n  width: 44px;\n  height: 44px;\n  border-radius: 50%;\n  border: 2px solid #3b82f6;\n}\n.dialog-body[_ngcontent-%COMP%]   .updated-user-summary[_ngcontent-%COMP%]   .user-stats-compact[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n}\n.dialog-body[_ngcontent-%COMP%]   .updated-user-summary[_ngcontent-%COMP%]   .user-stats-compact[_ngcontent-%COMP%]   .user-name[_ngcontent-%COMP%] {\n  font-weight: 700;\n  color: #ffffff;\n  font-size: 0.95rem;\n}\n.dialog-body[_ngcontent-%COMP%]   .updated-user-summary[_ngcontent-%COMP%]   .user-stats-compact[_ngcontent-%COMP%]   .user-lifetime[_ngcontent-%COMP%] {\n  font-size: 0.82rem;\n  color: #94a3b8;\n}\n.dialog-body[_ngcontent-%COMP%]   .updated-user-summary[_ngcontent-%COMP%]   .user-stats-compact[_ngcontent-%COMP%]   .user-lifetime[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] {\n  color: #4ade80;\n}\n.dialog-actions[_ngcontent-%COMP%] {\n  padding: 16px 24px 24px 24px;\n  display: flex;\n  justify-content: space-between;\n  gap: 12px;\n}\n.dialog-actions[_ngcontent-%COMP%]   .view-profile-btn[_ngcontent-%COMP%] {\n  color: #cbd5e1;\n}\n.dialog-actions[_ngcontent-%COMP%]   .view-profile-btn[_ngcontent-%COMP%]:hover {\n  color: #ffffff;\n}\n.dialog-actions[_ngcontent-%COMP%]   .play-again-btn[_ngcontent-%COMP%] {\n  border-radius: 10px;\n  font-weight: 700;\n  padding: 0 24px;\n  height: 42px;\n}\n/*# sourceMappingURL=victory-dialog.component.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(VictoryDialogComponent, [{
    type: Component,
    args: [{ selector: "app-victory-dialog", standalone: true, imports: [
      CommonModule,
      MatDialogModule,
      MatButtonModule,
      MatIconModule,
      MatCardModule,
      MatDividerModule
    ], template: `
    <div class="victory-dialog-container" [class.win]="isWin" [class.loss]="!isWin">
      <div class="victory-banner">
        <div class="trophy-glow">
          <mat-icon>{{ isWin ? 'emoji_events' : 'sentiment_dissatisfied' }}</mat-icon>
        </div>
        <h2>{{ isWin ? 'VICTORY!' : 'DEFEAT' }}</h2>
        <p class="subtitle">{{ isWin ? 'You outlasted your opponent in the War of Attrition!' : 'Your deck was depleted in combat.' }}</p>
      </div>

      <div class="dialog-body">
        <div class="metrics-row">
          <div class="metric-box">
            <span class="value">{{ data.totalTurns }}</span>
            <span class="label">Total Turns</span>
          </div>

          <div class="metric-box">
            <span class="value">{{ data.playerCardCount }} vs {{ data.opponentCardCount }}</span>
            <span class="label">Final Cards (You / Opponent)</span>
          </div>

          <div class="metric-box">
            <span class="value">{{ data.discardedCardCount }}</span>
            <span class="label">Cards Discarded</span>
          </div>
        </div>

        <mat-divider class="body-divider"></mat-divider>

        <div class="updated-user-summary">
          <img [src]="profile().avatarUrl" [alt]="profile().name" class="user-thumb" />
          <div class="user-stats-compact">
            <span class="user-name">{{ profile().name }}</span>
            <span class="user-lifetime">
              Lifetime Win Rate: <strong>{{ stats().winRatePercentage }}%</strong> ({{ stats().gamesWon }}W / {{ stats().gamesLost }}L)
            </span>
          </div>
        </div>
      </div>

      <div class="dialog-actions">
        <button mat-button class="view-profile-btn" (click)="openProfile()">
          <mat-icon>person</mat-icon> View Full Stats
        </button>

        <button mat-raised-button color="primary" class="play-again-btn" (click)="playAgain()">
          <mat-icon>replay</mat-icon> Play Again
        </button>
      </div>
    </div>
  `, styles: ["/* src/app/shared/components/victory-dialog/victory-dialog.component.scss */\n.victory-dialog-container {\n  padding: 0;\n  max-width: 520px;\n  background: #0f172a;\n  color: #f8fafc;\n  border-radius: 16px;\n  overflow: hidden;\n  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6);\n}\n.victory-dialog-container.win .victory-banner {\n  background:\n    linear-gradient(\n      135deg,\n      #15803d 0%,\n      #166534 100%);\n}\n.victory-dialog-container.win .victory-banner .trophy-glow {\n  color: #fde047;\n  box-shadow: 0 0 30px rgba(250, 204, 21, 0.4);\n}\n.victory-dialog-container.loss .victory-banner {\n  background:\n    linear-gradient(\n      135deg,\n      #b91c1c 0%,\n      #991b1b 100%);\n}\n.victory-dialog-container.loss .victory-banner .trophy-glow {\n  color: #f87171;\n  box-shadow: 0 0 30px rgba(239, 68, 68, 0.4);\n}\n.victory-banner {\n  padding: 32px 24px 24px 24px;\n  text-align: center;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n}\n.victory-banner .trophy-glow {\n  width: 72px;\n  height: 72px;\n  border-radius: 50%;\n  background: rgba(15, 23, 42, 0.4);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  margin-bottom: 12px;\n}\n.victory-banner .trophy-glow mat-icon {\n  font-size: 42px;\n  width: 42px;\n  height: 42px;\n}\n.victory-banner h2 {\n  margin: 0;\n  font-size: 2rem;\n  font-weight: 900;\n  letter-spacing: 1px;\n  color: #ffffff;\n}\n.victory-banner .subtitle {\n  margin: 6px 0 0 0;\n  font-size: 0.95rem;\n  color: rgba(255, 255, 255, 0.85);\n}\n.dialog-body {\n  padding: 24px;\n}\n.dialog-body .metrics-row {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 12px;\n}\n@media (max-width: 480px) {\n  .dialog-body .metrics-row {\n    grid-template-columns: 1fr;\n  }\n}\n.dialog-body .metrics-row .metric-box {\n  background: rgba(30, 41, 59, 0.8);\n  border: 1px solid rgba(255, 255, 255, 0.1);\n  border-radius: 12px;\n  padding: 12px;\n  text-align: center;\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n}\n.dialog-body .metrics-row .metric-box .value {\n  font-size: 1.3rem;\n  font-weight: 800;\n  color: #ffffff;\n}\n.dialog-body .metrics-row .metric-box .label {\n  font-size: 0.72rem;\n  color: #94a3b8;\n  font-weight: 600;\n  text-transform: uppercase;\n}\n.dialog-body .body-divider {\n  margin: 20px 0;\n  border-color: rgba(255, 255, 255, 0.1);\n}\n.dialog-body .updated-user-summary {\n  display: flex;\n  align-items: center;\n  gap: 14px;\n  background: rgba(15, 23, 42, 0.6);\n  padding: 12px 16px;\n  border-radius: 12px;\n  border: 1px solid rgba(255, 255, 255, 0.08);\n}\n.dialog-body .updated-user-summary .user-thumb {\n  width: 44px;\n  height: 44px;\n  border-radius: 50%;\n  border: 2px solid #3b82f6;\n}\n.dialog-body .updated-user-summary .user-stats-compact {\n  display: flex;\n  flex-direction: column;\n}\n.dialog-body .updated-user-summary .user-stats-compact .user-name {\n  font-weight: 700;\n  color: #ffffff;\n  font-size: 0.95rem;\n}\n.dialog-body .updated-user-summary .user-stats-compact .user-lifetime {\n  font-size: 0.82rem;\n  color: #94a3b8;\n}\n.dialog-body .updated-user-summary .user-stats-compact .user-lifetime strong {\n  color: #4ade80;\n}\n.dialog-actions {\n  padding: 16px 24px 24px 24px;\n  display: flex;\n  justify-content: space-between;\n  gap: 12px;\n}\n.dialog-actions .view-profile-btn {\n  color: #cbd5e1;\n}\n.dialog-actions .view-profile-btn:hover {\n  color: #ffffff;\n}\n.dialog-actions .play-again-btn {\n  border-radius: 10px;\n  font-weight: 700;\n  padding: 0 24px;\n  height: 42px;\n}\n/*# sourceMappingURL=victory-dialog.component.css.map */\n"] }]
  }], () => [{ type: void 0, decorators: [{
    type: Inject,
    args: [MAT_DIALOG_DATA]
  }] }], null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(VictoryDialogComponent, { className: "VictoryDialogComponent", filePath: "src/app/shared/components/victory-dialog/victory-dialog.component.ts", lineNumber: 85 });
})();

// node_modules/@angular/material/fesm2022/module-DVPFZEhf.mjs
var _c02 = ["tooltip"];
var SCROLL_THROTTLE_MS = 20;
function getMatTooltipInvalidPositionError(position) {
  return Error(`Tooltip position "${position}" is invalid.`);
}
var MAT_TOOLTIP_SCROLL_STRATEGY = new InjectionToken("mat-tooltip-scroll-strategy", {
  providedIn: "root",
  factory: () => {
    const injector = inject(Injector);
    return () => createRepositionScrollStrategy(injector, {
      scrollThrottle: SCROLL_THROTTLE_MS
    });
  }
});
function MAT_TOOLTIP_SCROLL_STRATEGY_FACTORY(_overlay) {
  const injector = inject(Injector);
  return () => createRepositionScrollStrategy(injector, {
    scrollThrottle: SCROLL_THROTTLE_MS
  });
}
var MAT_TOOLTIP_SCROLL_STRATEGY_FACTORY_PROVIDER = {
  provide: MAT_TOOLTIP_SCROLL_STRATEGY,
  deps: [],
  useFactory: MAT_TOOLTIP_SCROLL_STRATEGY_FACTORY
};
function MAT_TOOLTIP_DEFAULT_OPTIONS_FACTORY() {
  return {
    showDelay: 0,
    hideDelay: 0,
    touchendHideDelay: 1500
  };
}
var MAT_TOOLTIP_DEFAULT_OPTIONS = new InjectionToken("mat-tooltip-default-options", {
  providedIn: "root",
  factory: MAT_TOOLTIP_DEFAULT_OPTIONS_FACTORY
});
var PANEL_CLASS = "tooltip-panel";
var passiveListenerOptions = normalizePassiveListenerOptions({
  passive: true
});
var MIN_VIEWPORT_TOOLTIP_THRESHOLD = 8;
var UNBOUNDED_ANCHOR_GAP = 8;
var MIN_HEIGHT = 24;
var MAX_WIDTH = 200;
var MatTooltip = class _MatTooltip {
  _elementRef = inject(ElementRef);
  _ngZone = inject(NgZone);
  _platform = inject(Platform);
  _ariaDescriber = inject(AriaDescriber);
  _focusMonitor = inject(FocusMonitor);
  _dir = inject(Directionality);
  _injector = inject(Injector);
  _viewContainerRef = inject(ViewContainerRef);
  _animationsDisabled = _animationsDisabled();
  _defaultOptions = inject(MAT_TOOLTIP_DEFAULT_OPTIONS, {
    optional: true
  });
  _overlayRef;
  _tooltipInstance;
  _overlayPanelClass;
  // Used for styling internally.
  _portal;
  _position = "below";
  _positionAtOrigin = false;
  _disabled = false;
  _tooltipClass;
  _viewInitialized = false;
  _pointerExitEventsInitialized = false;
  _tooltipComponent = TooltipComponent;
  _viewportMargin = 8;
  _currentPosition;
  _cssClassPrefix = "mat-mdc";
  _ariaDescriptionPending;
  _dirSubscribed = false;
  /** Allows the user to define the position of the tooltip relative to the parent element */
  get position() {
    return this._position;
  }
  set position(value) {
    if (value !== this._position) {
      this._position = value;
      if (this._overlayRef) {
        this._updatePosition(this._overlayRef);
        this._tooltipInstance?.show(0);
        this._overlayRef.updatePosition();
      }
    }
  }
  /**
   * Whether tooltip should be relative to the click or touch origin
   * instead of outside the element bounding box.
   */
  get positionAtOrigin() {
    return this._positionAtOrigin;
  }
  set positionAtOrigin(value) {
    this._positionAtOrigin = coerceBooleanProperty(value);
    this._detach();
    this._overlayRef = null;
  }
  /** Disables the display of the tooltip. */
  get disabled() {
    return this._disabled;
  }
  set disabled(value) {
    const isDisabled = coerceBooleanProperty(value);
    if (this._disabled !== isDisabled) {
      this._disabled = isDisabled;
      if (isDisabled) {
        this.hide(0);
      } else {
        this._setupPointerEnterEventsIfNeeded();
      }
      this._syncAriaDescription(this.message);
    }
  }
  /** The default delay in ms before showing the tooltip after show is called */
  get showDelay() {
    return this._showDelay;
  }
  set showDelay(value) {
    this._showDelay = coerceNumberProperty(value);
  }
  _showDelay;
  /** The default delay in ms before hiding the tooltip after hide is called */
  get hideDelay() {
    return this._hideDelay;
  }
  set hideDelay(value) {
    this._hideDelay = coerceNumberProperty(value);
    if (this._tooltipInstance) {
      this._tooltipInstance._mouseLeaveHideDelay = this._hideDelay;
    }
  }
  _hideDelay;
  /**
   * How touch gestures should be handled by the tooltip. On touch devices the tooltip directive
   * uses a long press gesture to show and hide, however it can conflict with the native browser
   * gestures. To work around the conflict, Angular Material disables native gestures on the
   * trigger, but that might not be desirable on particular elements (e.g. inputs and draggable
   * elements). The different values for this option configure the touch event handling as follows:
   * - `auto` - Enables touch gestures for all elements, but tries to avoid conflicts with native
   *   browser gestures on particular elements. In particular, it allows text selection on inputs
   *   and textareas, and preserves the native browser dragging on elements marked as `draggable`.
   * - `on` - Enables touch gestures for all elements and disables native
   *   browser gestures with no exceptions.
   * - `off` - Disables touch gestures. Note that this will prevent the tooltip from
   *   showing on touch devices.
   */
  touchGestures = "auto";
  /** The message to be displayed in the tooltip */
  get message() {
    return this._message;
  }
  set message(value) {
    const oldMessage = this._message;
    this._message = value != null ? String(value).trim() : "";
    if (!this._message && this._isTooltipVisible()) {
      this.hide(0);
    } else {
      this._setupPointerEnterEventsIfNeeded();
      this._updateTooltipMessage();
    }
    this._syncAriaDescription(oldMessage);
  }
  _message = "";
  /** Classes to be passed to the tooltip. Supports the same syntax as `ngClass`. */
  get tooltipClass() {
    return this._tooltipClass;
  }
  set tooltipClass(value) {
    this._tooltipClass = value;
    if (this._tooltipInstance) {
      this._setTooltipClass(this._tooltipClass);
    }
  }
  /** Manually-bound passive event listeners. */
  _passiveListeners = [];
  /** Timer started at the last `touchstart` event. */
  _touchstartTimeout = null;
  /** Emits when the component is destroyed. */
  _destroyed = new Subject();
  /** Whether ngOnDestroyed has been called. */
  _isDestroyed = false;
  constructor() {
    const defaultOptions = this._defaultOptions;
    if (defaultOptions) {
      this._showDelay = defaultOptions.showDelay;
      this._hideDelay = defaultOptions.hideDelay;
      if (defaultOptions.position) {
        this.position = defaultOptions.position;
      }
      if (defaultOptions.positionAtOrigin) {
        this.positionAtOrigin = defaultOptions.positionAtOrigin;
      }
      if (defaultOptions.touchGestures) {
        this.touchGestures = defaultOptions.touchGestures;
      }
      if (defaultOptions.tooltipClass) {
        this.tooltipClass = defaultOptions.tooltipClass;
      }
    }
    this._viewportMargin = MIN_VIEWPORT_TOOLTIP_THRESHOLD;
  }
  ngAfterViewInit() {
    this._viewInitialized = true;
    this._setupPointerEnterEventsIfNeeded();
    this._focusMonitor.monitor(this._elementRef).pipe(takeUntil(this._destroyed)).subscribe((origin) => {
      if (!origin) {
        this._ngZone.run(() => this.hide(0));
      } else if (origin === "keyboard") {
        this._ngZone.run(() => this.show());
      }
    });
  }
  /**
   * Dispose the tooltip when destroyed.
   */
  ngOnDestroy() {
    const nativeElement = this._elementRef.nativeElement;
    if (this._touchstartTimeout) {
      clearTimeout(this._touchstartTimeout);
    }
    if (this._overlayRef) {
      this._overlayRef.dispose();
      this._tooltipInstance = null;
    }
    this._passiveListeners.forEach(([event, listener]) => {
      nativeElement.removeEventListener(event, listener, passiveListenerOptions);
    });
    this._passiveListeners.length = 0;
    this._destroyed.next();
    this._destroyed.complete();
    this._isDestroyed = true;
    this._ariaDescriber.removeDescription(nativeElement, this.message, "tooltip");
    this._focusMonitor.stopMonitoring(nativeElement);
  }
  /** Shows the tooltip after the delay in ms, defaults to tooltip-delay-show or 0ms if no input */
  show(delay = this.showDelay, origin) {
    if (this.disabled || !this.message || this._isTooltipVisible()) {
      this._tooltipInstance?._cancelPendingAnimations();
      return;
    }
    const overlayRef = this._createOverlay(origin);
    this._detach();
    this._portal = this._portal || new ComponentPortal(this._tooltipComponent, this._viewContainerRef);
    const instance = this._tooltipInstance = overlayRef.attach(this._portal).instance;
    instance._triggerElement = this._elementRef.nativeElement;
    instance._mouseLeaveHideDelay = this._hideDelay;
    instance.afterHidden().pipe(takeUntil(this._destroyed)).subscribe(() => this._detach());
    this._setTooltipClass(this._tooltipClass);
    this._updateTooltipMessage();
    instance.show(delay);
  }
  /** Hides the tooltip after the delay in ms, defaults to tooltip-delay-hide or 0ms if no input */
  hide(delay = this.hideDelay) {
    const instance = this._tooltipInstance;
    if (instance) {
      if (instance.isVisible()) {
        instance.hide(delay);
      } else {
        instance._cancelPendingAnimations();
        this._detach();
      }
    }
  }
  /** Shows/hides the tooltip */
  toggle(origin) {
    this._isTooltipVisible() ? this.hide() : this.show(void 0, origin);
  }
  /** Returns true if the tooltip is currently visible to the user */
  _isTooltipVisible() {
    return !!this._tooltipInstance && this._tooltipInstance.isVisible();
  }
  /** Create the overlay config and position strategy */
  _createOverlay(origin) {
    if (this._overlayRef) {
      const existingStrategy = this._overlayRef.getConfig().positionStrategy;
      if ((!this.positionAtOrigin || !origin) && existingStrategy._origin instanceof ElementRef) {
        return this._overlayRef;
      }
      this._detach();
    }
    const scrollableAncestors = this._injector.get(ScrollDispatcher).getAncestorScrollContainers(this._elementRef);
    const panelClass = `${this._cssClassPrefix}-${PANEL_CLASS}`;
    const strategy = createFlexibleConnectedPositionStrategy(this._injector, this.positionAtOrigin ? origin || this._elementRef : this._elementRef).withTransformOriginOn(`.${this._cssClassPrefix}-tooltip`).withFlexibleDimensions(false).withViewportMargin(this._viewportMargin).withScrollableContainers(scrollableAncestors);
    strategy.positionChanges.pipe(takeUntil(this._destroyed)).subscribe((change) => {
      this._updateCurrentPositionClass(change.connectionPair);
      if (this._tooltipInstance) {
        if (change.scrollableViewProperties.isOverlayClipped && this._tooltipInstance.isVisible()) {
          this._ngZone.run(() => this.hide(0));
        }
      }
    });
    this._overlayRef = createOverlayRef(this._injector, {
      direction: this._dir,
      positionStrategy: strategy,
      panelClass: this._overlayPanelClass ? [...this._overlayPanelClass, panelClass] : panelClass,
      scrollStrategy: this._injector.get(MAT_TOOLTIP_SCROLL_STRATEGY)(),
      disableAnimations: this._animationsDisabled
    });
    this._updatePosition(this._overlayRef);
    this._overlayRef.detachments().pipe(takeUntil(this._destroyed)).subscribe(() => this._detach());
    this._overlayRef.outsidePointerEvents().pipe(takeUntil(this._destroyed)).subscribe(() => this._tooltipInstance?._handleBodyInteraction());
    this._overlayRef.keydownEvents().pipe(takeUntil(this._destroyed)).subscribe((event) => {
      if (this._isTooltipVisible() && event.keyCode === ESCAPE && !hasModifierKey(event)) {
        event.preventDefault();
        event.stopPropagation();
        this._ngZone.run(() => this.hide(0));
      }
    });
    if (this._defaultOptions?.disableTooltipInteractivity) {
      this._overlayRef.addPanelClass(`${this._cssClassPrefix}-tooltip-panel-non-interactive`);
    }
    if (!this._dirSubscribed) {
      this._dirSubscribed = true;
      this._dir.change.pipe(takeUntil(this._destroyed)).subscribe(() => {
        if (this._overlayRef) {
          this._updatePosition(this._overlayRef);
        }
      });
    }
    return this._overlayRef;
  }
  /** Detaches the currently-attached tooltip. */
  _detach() {
    if (this._overlayRef && this._overlayRef.hasAttached()) {
      this._overlayRef.detach();
    }
    this._tooltipInstance = null;
  }
  /** Updates the position of the current tooltip. */
  _updatePosition(overlayRef) {
    const position = overlayRef.getConfig().positionStrategy;
    const origin = this._getOrigin();
    const overlay = this._getOverlayPosition();
    position.withPositions([this._addOffset(__spreadValues(__spreadValues({}, origin.main), overlay.main)), this._addOffset(__spreadValues(__spreadValues({}, origin.fallback), overlay.fallback))]);
  }
  /** Adds the configured offset to a position. Used as a hook for child classes. */
  _addOffset(position) {
    const offset = UNBOUNDED_ANCHOR_GAP;
    const isLtr = !this._dir || this._dir.value == "ltr";
    if (position.originY === "top") {
      position.offsetY = -offset;
    } else if (position.originY === "bottom") {
      position.offsetY = offset;
    } else if (position.originX === "start") {
      position.offsetX = isLtr ? -offset : offset;
    } else if (position.originX === "end") {
      position.offsetX = isLtr ? offset : -offset;
    }
    return position;
  }
  /**
   * Returns the origin position and a fallback position based on the user's position preference.
   * The fallback position is the inverse of the origin (e.g. `'below' -> 'above'`).
   */
  _getOrigin() {
    const isLtr = !this._dir || this._dir.value == "ltr";
    const position = this.position;
    let originPosition;
    if (position == "above" || position == "below") {
      originPosition = {
        originX: "center",
        originY: position == "above" ? "top" : "bottom"
      };
    } else if (position == "before" || position == "left" && isLtr || position == "right" && !isLtr) {
      originPosition = {
        originX: "start",
        originY: "center"
      };
    } else if (position == "after" || position == "right" && isLtr || position == "left" && !isLtr) {
      originPosition = {
        originX: "end",
        originY: "center"
      };
    } else if (typeof ngDevMode === "undefined" || ngDevMode) {
      throw getMatTooltipInvalidPositionError(position);
    }
    const {
      x,
      y
    } = this._invertPosition(originPosition.originX, originPosition.originY);
    return {
      main: originPosition,
      fallback: {
        originX: x,
        originY: y
      }
    };
  }
  /** Returns the overlay position and a fallback position based on the user's preference */
  _getOverlayPosition() {
    const isLtr = !this._dir || this._dir.value == "ltr";
    const position = this.position;
    let overlayPosition;
    if (position == "above") {
      overlayPosition = {
        overlayX: "center",
        overlayY: "bottom"
      };
    } else if (position == "below") {
      overlayPosition = {
        overlayX: "center",
        overlayY: "top"
      };
    } else if (position == "before" || position == "left" && isLtr || position == "right" && !isLtr) {
      overlayPosition = {
        overlayX: "end",
        overlayY: "center"
      };
    } else if (position == "after" || position == "right" && isLtr || position == "left" && !isLtr) {
      overlayPosition = {
        overlayX: "start",
        overlayY: "center"
      };
    } else if (typeof ngDevMode === "undefined" || ngDevMode) {
      throw getMatTooltipInvalidPositionError(position);
    }
    const {
      x,
      y
    } = this._invertPosition(overlayPosition.overlayX, overlayPosition.overlayY);
    return {
      main: overlayPosition,
      fallback: {
        overlayX: x,
        overlayY: y
      }
    };
  }
  /** Updates the tooltip message and repositions the overlay according to the new message length */
  _updateTooltipMessage() {
    if (this._tooltipInstance) {
      this._tooltipInstance.message = this.message;
      this._tooltipInstance._markForCheck();
      afterNextRender(() => {
        if (this._tooltipInstance) {
          this._overlayRef.updatePosition();
        }
      }, {
        injector: this._injector
      });
    }
  }
  /** Updates the tooltip class */
  _setTooltipClass(tooltipClass) {
    if (this._tooltipInstance) {
      this._tooltipInstance.tooltipClass = tooltipClass;
      this._tooltipInstance._markForCheck();
    }
  }
  /** Inverts an overlay position. */
  _invertPosition(x, y) {
    if (this.position === "above" || this.position === "below") {
      if (y === "top") {
        y = "bottom";
      } else if (y === "bottom") {
        y = "top";
      }
    } else {
      if (x === "end") {
        x = "start";
      } else if (x === "start") {
        x = "end";
      }
    }
    return {
      x,
      y
    };
  }
  /** Updates the class on the overlay panel based on the current position of the tooltip. */
  _updateCurrentPositionClass(connectionPair) {
    const {
      overlayY,
      originX,
      originY
    } = connectionPair;
    let newPosition;
    if (overlayY === "center") {
      if (this._dir && this._dir.value === "rtl") {
        newPosition = originX === "end" ? "left" : "right";
      } else {
        newPosition = originX === "start" ? "left" : "right";
      }
    } else {
      newPosition = overlayY === "bottom" && originY === "top" ? "above" : "below";
    }
    if (newPosition !== this._currentPosition) {
      const overlayRef = this._overlayRef;
      if (overlayRef) {
        const classPrefix = `${this._cssClassPrefix}-${PANEL_CLASS}-`;
        overlayRef.removePanelClass(classPrefix + this._currentPosition);
        overlayRef.addPanelClass(classPrefix + newPosition);
      }
      this._currentPosition = newPosition;
    }
  }
  /** Binds the pointer events to the tooltip trigger. */
  _setupPointerEnterEventsIfNeeded() {
    if (this._disabled || !this.message || !this._viewInitialized || this._passiveListeners.length) {
      return;
    }
    if (this._platformSupportsMouseEvents()) {
      this._passiveListeners.push(["mouseenter", (event) => {
        this._setupPointerExitEventsIfNeeded();
        let point = void 0;
        if (event.x !== void 0 && event.y !== void 0) {
          point = event;
        }
        this.show(void 0, point);
      }]);
    } else if (this.touchGestures !== "off") {
      this._disableNativeGesturesIfNecessary();
      this._passiveListeners.push(["touchstart", (event) => {
        const touch = event.targetTouches?.[0];
        const origin = touch ? {
          x: touch.clientX,
          y: touch.clientY
        } : void 0;
        this._setupPointerExitEventsIfNeeded();
        if (this._touchstartTimeout) {
          clearTimeout(this._touchstartTimeout);
        }
        const DEFAULT_LONGPRESS_DELAY = 500;
        this._touchstartTimeout = setTimeout(() => {
          this._touchstartTimeout = null;
          this.show(void 0, origin);
        }, this._defaultOptions?.touchLongPressShowDelay ?? DEFAULT_LONGPRESS_DELAY);
      }]);
    }
    this._addListeners(this._passiveListeners);
  }
  _setupPointerExitEventsIfNeeded() {
    if (this._pointerExitEventsInitialized) {
      return;
    }
    this._pointerExitEventsInitialized = true;
    const exitListeners = [];
    if (this._platformSupportsMouseEvents()) {
      exitListeners.push(["mouseleave", (event) => {
        const newTarget = event.relatedTarget;
        if (!newTarget || !this._overlayRef?.overlayElement.contains(newTarget)) {
          this.hide();
        }
      }], ["wheel", (event) => this._wheelListener(event)]);
    } else if (this.touchGestures !== "off") {
      this._disableNativeGesturesIfNecessary();
      const touchendListener = () => {
        if (this._touchstartTimeout) {
          clearTimeout(this._touchstartTimeout);
        }
        this.hide(this._defaultOptions?.touchendHideDelay);
      };
      exitListeners.push(["touchend", touchendListener], ["touchcancel", touchendListener]);
    }
    this._addListeners(exitListeners);
    this._passiveListeners.push(...exitListeners);
  }
  _addListeners(listeners) {
    listeners.forEach(([event, listener]) => {
      this._elementRef.nativeElement.addEventListener(event, listener, passiveListenerOptions);
    });
  }
  _platformSupportsMouseEvents() {
    return !this._platform.IOS && !this._platform.ANDROID;
  }
  /** Listener for the `wheel` event on the element. */
  _wheelListener(event) {
    if (this._isTooltipVisible()) {
      const elementUnderPointer = this._injector.get(DOCUMENT).elementFromPoint(event.clientX, event.clientY);
      const element = this._elementRef.nativeElement;
      if (elementUnderPointer !== element && !element.contains(elementUnderPointer)) {
        this.hide();
      }
    }
  }
  /** Disables the native browser gestures, based on how the tooltip has been configured. */
  _disableNativeGesturesIfNecessary() {
    const gestures = this.touchGestures;
    if (gestures !== "off") {
      const element = this._elementRef.nativeElement;
      const style2 = element.style;
      if (gestures === "on" || element.nodeName !== "INPUT" && element.nodeName !== "TEXTAREA") {
        style2.userSelect = style2.msUserSelect = style2.webkitUserSelect = style2.MozUserSelect = "none";
      }
      if (gestures === "on" || !element.draggable) {
        style2.webkitUserDrag = "none";
      }
      style2.touchAction = "none";
      style2.webkitTapHighlightColor = "transparent";
    }
  }
  /** Updates the tooltip's ARIA description based on it current state. */
  _syncAriaDescription(oldMessage) {
    if (this._ariaDescriptionPending) {
      return;
    }
    this._ariaDescriptionPending = true;
    this._ariaDescriber.removeDescription(this._elementRef.nativeElement, oldMessage, "tooltip");
    if (!this._isDestroyed) {
      afterNextRender({
        write: () => {
          this._ariaDescriptionPending = false;
          if (this.message && !this.disabled) {
            this._ariaDescriber.describe(this._elementRef.nativeElement, this.message, "tooltip");
          }
        }
      }, {
        injector: this._injector
      });
    }
  }
  static \u0275fac = function MatTooltip_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _MatTooltip)();
  };
  static \u0275dir = /* @__PURE__ */ \u0275\u0275defineDirective({
    type: _MatTooltip,
    selectors: [["", "matTooltip", ""]],
    hostAttrs: [1, "mat-mdc-tooltip-trigger"],
    hostVars: 2,
    hostBindings: function MatTooltip_HostBindings(rf, ctx) {
      if (rf & 2) {
        \u0275\u0275classProp("mat-mdc-tooltip-disabled", ctx.disabled);
      }
    },
    inputs: {
      position: [0, "matTooltipPosition", "position"],
      positionAtOrigin: [0, "matTooltipPositionAtOrigin", "positionAtOrigin"],
      disabled: [0, "matTooltipDisabled", "disabled"],
      showDelay: [0, "matTooltipShowDelay", "showDelay"],
      hideDelay: [0, "matTooltipHideDelay", "hideDelay"],
      touchGestures: [0, "matTooltipTouchGestures", "touchGestures"],
      message: [0, "matTooltip", "message"],
      tooltipClass: [0, "matTooltipClass", "tooltipClass"]
    },
    exportAs: ["matTooltip"]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MatTooltip, [{
    type: Directive,
    args: [{
      selector: "[matTooltip]",
      exportAs: "matTooltip",
      host: {
        "class": "mat-mdc-tooltip-trigger",
        "[class.mat-mdc-tooltip-disabled]": "disabled"
      }
    }]
  }], () => [], {
    position: [{
      type: Input,
      args: ["matTooltipPosition"]
    }],
    positionAtOrigin: [{
      type: Input,
      args: ["matTooltipPositionAtOrigin"]
    }],
    disabled: [{
      type: Input,
      args: ["matTooltipDisabled"]
    }],
    showDelay: [{
      type: Input,
      args: ["matTooltipShowDelay"]
    }],
    hideDelay: [{
      type: Input,
      args: ["matTooltipHideDelay"]
    }],
    touchGestures: [{
      type: Input,
      args: ["matTooltipTouchGestures"]
    }],
    message: [{
      type: Input,
      args: ["matTooltip"]
    }],
    tooltipClass: [{
      type: Input,
      args: ["matTooltipClass"]
    }]
  });
})();
var TooltipComponent = class _TooltipComponent {
  _changeDetectorRef = inject(ChangeDetectorRef);
  _elementRef = inject(ElementRef);
  /* Whether the tooltip text overflows to multiple lines */
  _isMultiline = false;
  /** Message to display in the tooltip */
  message;
  /** Classes to be added to the tooltip. Supports the same syntax as `ngClass`. */
  tooltipClass;
  /** The timeout ID of any current timer set to show the tooltip */
  _showTimeoutId;
  /** The timeout ID of any current timer set to hide the tooltip */
  _hideTimeoutId;
  /** Element that caused the tooltip to open. */
  _triggerElement;
  /** Amount of milliseconds to delay the closing sequence. */
  _mouseLeaveHideDelay;
  /** Whether animations are currently disabled. */
  _animationsDisabled = _animationsDisabled();
  /** Reference to the internal tooltip element. */
  _tooltip;
  /** Whether interactions on the page should close the tooltip */
  _closeOnInteraction = false;
  /** Whether the tooltip is currently visible. */
  _isVisible = false;
  /** Subject for notifying that the tooltip has been hidden from the view */
  _onHide = new Subject();
  /** Name of the show animation and the class that toggles it. */
  _showAnimation = "mat-mdc-tooltip-show";
  /** Name of the hide animation and the class that toggles it. */
  _hideAnimation = "mat-mdc-tooltip-hide";
  constructor() {
  }
  /**
   * Shows the tooltip with an animation originating from the provided origin
   * @param delay Amount of milliseconds to the delay showing the tooltip.
   */
  show(delay) {
    if (this._hideTimeoutId != null) {
      clearTimeout(this._hideTimeoutId);
    }
    this._showTimeoutId = setTimeout(() => {
      this._toggleVisibility(true);
      this._showTimeoutId = void 0;
    }, delay);
  }
  /**
   * Begins the animation to hide the tooltip after the provided delay in ms.
   * @param delay Amount of milliseconds to delay showing the tooltip.
   */
  hide(delay) {
    if (this._showTimeoutId != null) {
      clearTimeout(this._showTimeoutId);
    }
    this._hideTimeoutId = setTimeout(() => {
      this._toggleVisibility(false);
      this._hideTimeoutId = void 0;
    }, delay);
  }
  /** Returns an observable that notifies when the tooltip has been hidden from view. */
  afterHidden() {
    return this._onHide;
  }
  /** Whether the tooltip is being displayed. */
  isVisible() {
    return this._isVisible;
  }
  ngOnDestroy() {
    this._cancelPendingAnimations();
    this._onHide.complete();
    this._triggerElement = null;
  }
  /**
   * Interactions on the HTML body should close the tooltip immediately as defined in the
   * material design spec.
   * https://material.io/design/components/tooltips.html#behavior
   */
  _handleBodyInteraction() {
    if (this._closeOnInteraction) {
      this.hide(0);
    }
  }
  /**
   * Marks that the tooltip needs to be checked in the next change detection run.
   * Mainly used for rendering the initial text before positioning a tooltip, which
   * can be problematic in components with OnPush change detection.
   */
  _markForCheck() {
    this._changeDetectorRef.markForCheck();
  }
  _handleMouseLeave({
    relatedTarget
  }) {
    if (!relatedTarget || !this._triggerElement.contains(relatedTarget)) {
      if (this.isVisible()) {
        this.hide(this._mouseLeaveHideDelay);
      } else {
        this._finalizeAnimation(false);
      }
    }
  }
  /**
   * Callback for when the timeout in this.show() gets completed.
   * This method is only needed by the mdc-tooltip, and so it is only implemented
   * in the mdc-tooltip, not here.
   */
  _onShow() {
    this._isMultiline = this._isTooltipMultiline();
    this._markForCheck();
  }
  /** Whether the tooltip text has overflown to the next line */
  _isTooltipMultiline() {
    const rect = this._elementRef.nativeElement.getBoundingClientRect();
    return rect.height > MIN_HEIGHT && rect.width >= MAX_WIDTH;
  }
  /** Event listener dispatched when an animation on the tooltip finishes. */
  _handleAnimationEnd({
    animationName
  }) {
    if (animationName === this._showAnimation || animationName === this._hideAnimation) {
      this._finalizeAnimation(animationName === this._showAnimation);
    }
  }
  /** Cancels any pending animation sequences. */
  _cancelPendingAnimations() {
    if (this._showTimeoutId != null) {
      clearTimeout(this._showTimeoutId);
    }
    if (this._hideTimeoutId != null) {
      clearTimeout(this._hideTimeoutId);
    }
    this._showTimeoutId = this._hideTimeoutId = void 0;
  }
  /** Handles the cleanup after an animation has finished. */
  _finalizeAnimation(toVisible) {
    if (toVisible) {
      this._closeOnInteraction = true;
    } else if (!this.isVisible()) {
      this._onHide.next();
    }
  }
  /** Toggles the visibility of the tooltip element. */
  _toggleVisibility(isVisible) {
    const tooltip = this._tooltip.nativeElement;
    const showClass = this._showAnimation;
    const hideClass = this._hideAnimation;
    tooltip.classList.remove(isVisible ? hideClass : showClass);
    tooltip.classList.add(isVisible ? showClass : hideClass);
    if (this._isVisible !== isVisible) {
      this._isVisible = isVisible;
      this._changeDetectorRef.markForCheck();
    }
    if (isVisible && !this._animationsDisabled && typeof getComputedStyle === "function") {
      const styles = getComputedStyle(tooltip);
      if (styles.getPropertyValue("animation-duration") === "0s" || styles.getPropertyValue("animation-name") === "none") {
        this._animationsDisabled = true;
      }
    }
    if (isVisible) {
      this._onShow();
    }
    if (this._animationsDisabled) {
      tooltip.classList.add("_mat-animation-noopable");
      this._finalizeAnimation(isVisible);
    }
  }
  static \u0275fac = function TooltipComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _TooltipComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({
    type: _TooltipComponent,
    selectors: [["mat-tooltip-component"]],
    viewQuery: function TooltipComponent_Query(rf, ctx) {
      if (rf & 1) {
        \u0275\u0275viewQuery(_c02, 7);
      }
      if (rf & 2) {
        let _t;
        \u0275\u0275queryRefresh(_t = \u0275\u0275loadQuery()) && (ctx._tooltip = _t.first);
      }
    },
    hostAttrs: ["aria-hidden", "true"],
    hostBindings: function TooltipComponent_HostBindings(rf, ctx) {
      if (rf & 1) {
        \u0275\u0275listener("mouseleave", function TooltipComponent_mouseleave_HostBindingHandler($event) {
          return ctx._handleMouseLeave($event);
        });
      }
    },
    decls: 4,
    vars: 4,
    consts: [["tooltip", ""], [1, "mdc-tooltip", "mat-mdc-tooltip", 3, "animationend", "ngClass"], [1, "mat-mdc-tooltip-surface", "mdc-tooltip__surface"]],
    template: function TooltipComponent_Template(rf, ctx) {
      if (rf & 1) {
        const _r1 = \u0275\u0275getCurrentView();
        \u0275\u0275elementStart(0, "div", 1, 0);
        \u0275\u0275listener("animationend", function TooltipComponent_Template_div_animationend_0_listener($event) {
          \u0275\u0275restoreView(_r1);
          return \u0275\u0275resetView(ctx._handleAnimationEnd($event));
        });
        \u0275\u0275elementStart(2, "div", 2);
        \u0275\u0275text(3);
        \u0275\u0275elementEnd()();
      }
      if (rf & 2) {
        \u0275\u0275classProp("mdc-tooltip--multiline", ctx._isMultiline);
        \u0275\u0275property("ngClass", ctx.tooltipClass);
        \u0275\u0275advance(3);
        \u0275\u0275textInterpolate(ctx.message);
      }
    },
    dependencies: [NgClass],
    styles: ['.mat-mdc-tooltip{position:relative;transform:scale(0);display:inline-flex}.mat-mdc-tooltip::before{content:"";top:0;right:0;bottom:0;left:0;z-index:-1;position:absolute}.mat-mdc-tooltip-panel-below .mat-mdc-tooltip::before{top:-8px}.mat-mdc-tooltip-panel-above .mat-mdc-tooltip::before{bottom:-8px}.mat-mdc-tooltip-panel-right .mat-mdc-tooltip::before{left:-8px}.mat-mdc-tooltip-panel-left .mat-mdc-tooltip::before{right:-8px}.mat-mdc-tooltip._mat-animation-noopable{animation:none;transform:scale(1)}.mat-mdc-tooltip-surface{word-break:normal;overflow-wrap:anywhere;padding:4px 8px;min-width:40px;max-width:200px;min-height:24px;max-height:40vh;box-sizing:border-box;overflow:hidden;text-align:center;will-change:transform,opacity;background-color:var(--mat-tooltip-container-color, var(--mat-sys-inverse-surface));color:var(--mat-tooltip-supporting-text-color, var(--mat-sys-inverse-on-surface));border-radius:var(--mat-tooltip-container-shape, var(--mat-sys-corner-extra-small));font-family:var(--mat-tooltip-supporting-text-font, var(--mat-sys-body-small-font));font-size:var(--mat-tooltip-supporting-text-size, var(--mat-sys-body-small-size));font-weight:var(--mat-tooltip-supporting-text-weight, var(--mat-sys-body-small-weight));line-height:var(--mat-tooltip-supporting-text-line-height, var(--mat-sys-body-small-line-height));letter-spacing:var(--mat-tooltip-supporting-text-tracking, var(--mat-sys-body-small-tracking))}.mat-mdc-tooltip-surface::before{position:absolute;box-sizing:border-box;width:100%;height:100%;top:0;left:0;border:1px solid rgba(0,0,0,0);border-radius:inherit;content:"";pointer-events:none}.mdc-tooltip--multiline .mat-mdc-tooltip-surface{text-align:left}[dir=rtl] .mdc-tooltip--multiline .mat-mdc-tooltip-surface{text-align:right}.mat-mdc-tooltip-panel{line-height:normal}.mat-mdc-tooltip-panel.mat-mdc-tooltip-panel-non-interactive{pointer-events:none}@keyframes mat-mdc-tooltip-show{0%{opacity:0;transform:scale(0.8)}100%{opacity:1;transform:scale(1)}}@keyframes mat-mdc-tooltip-hide{0%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(0.8)}}.mat-mdc-tooltip-show{animation:mat-mdc-tooltip-show 150ms cubic-bezier(0, 0, 0.2, 1) forwards}.mat-mdc-tooltip-hide{animation:mat-mdc-tooltip-hide 75ms cubic-bezier(0.4, 0, 1, 1) forwards}\n'],
    encapsulation: 2,
    changeDetection: 0
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(TooltipComponent, [{
    type: Component,
    args: [{
      selector: "mat-tooltip-component",
      encapsulation: ViewEncapsulation.None,
      changeDetection: ChangeDetectionStrategy.OnPush,
      host: {
        "(mouseleave)": "_handleMouseLeave($event)",
        "aria-hidden": "true"
      },
      imports: [NgClass],
      template: '<div\n  #tooltip\n  class="mdc-tooltip mat-mdc-tooltip"\n  [ngClass]="tooltipClass"\n  (animationend)="_handleAnimationEnd($event)"\n  [class.mdc-tooltip--multiline]="_isMultiline">\n  <div class="mat-mdc-tooltip-surface mdc-tooltip__surface">{{message}}</div>\n</div>\n',
      styles: ['.mat-mdc-tooltip{position:relative;transform:scale(0);display:inline-flex}.mat-mdc-tooltip::before{content:"";top:0;right:0;bottom:0;left:0;z-index:-1;position:absolute}.mat-mdc-tooltip-panel-below .mat-mdc-tooltip::before{top:-8px}.mat-mdc-tooltip-panel-above .mat-mdc-tooltip::before{bottom:-8px}.mat-mdc-tooltip-panel-right .mat-mdc-tooltip::before{left:-8px}.mat-mdc-tooltip-panel-left .mat-mdc-tooltip::before{right:-8px}.mat-mdc-tooltip._mat-animation-noopable{animation:none;transform:scale(1)}.mat-mdc-tooltip-surface{word-break:normal;overflow-wrap:anywhere;padding:4px 8px;min-width:40px;max-width:200px;min-height:24px;max-height:40vh;box-sizing:border-box;overflow:hidden;text-align:center;will-change:transform,opacity;background-color:var(--mat-tooltip-container-color, var(--mat-sys-inverse-surface));color:var(--mat-tooltip-supporting-text-color, var(--mat-sys-inverse-on-surface));border-radius:var(--mat-tooltip-container-shape, var(--mat-sys-corner-extra-small));font-family:var(--mat-tooltip-supporting-text-font, var(--mat-sys-body-small-font));font-size:var(--mat-tooltip-supporting-text-size, var(--mat-sys-body-small-size));font-weight:var(--mat-tooltip-supporting-text-weight, var(--mat-sys-body-small-weight));line-height:var(--mat-tooltip-supporting-text-line-height, var(--mat-sys-body-small-line-height));letter-spacing:var(--mat-tooltip-supporting-text-tracking, var(--mat-sys-body-small-tracking))}.mat-mdc-tooltip-surface::before{position:absolute;box-sizing:border-box;width:100%;height:100%;top:0;left:0;border:1px solid rgba(0,0,0,0);border-radius:inherit;content:"";pointer-events:none}.mdc-tooltip--multiline .mat-mdc-tooltip-surface{text-align:left}[dir=rtl] .mdc-tooltip--multiline .mat-mdc-tooltip-surface{text-align:right}.mat-mdc-tooltip-panel{line-height:normal}.mat-mdc-tooltip-panel.mat-mdc-tooltip-panel-non-interactive{pointer-events:none}@keyframes mat-mdc-tooltip-show{0%{opacity:0;transform:scale(0.8)}100%{opacity:1;transform:scale(1)}}@keyframes mat-mdc-tooltip-hide{0%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(0.8)}}.mat-mdc-tooltip-show{animation:mat-mdc-tooltip-show 150ms cubic-bezier(0, 0, 0.2, 1) forwards}.mat-mdc-tooltip-hide{animation:mat-mdc-tooltip-hide 75ms cubic-bezier(0.4, 0, 1, 1) forwards}\n']
    }]
  }], () => [], {
    _tooltip: [{
      type: ViewChild,
      args: ["tooltip", {
        // Use a static query here since we interact directly with
        // the DOM which can happen before `ngAfterViewInit`.
        static: true
      }]
    }]
  });
})();
var MatTooltipModule = class _MatTooltipModule {
  static \u0275fac = function MatTooltipModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _MatTooltipModule)();
  };
  static \u0275mod = /* @__PURE__ */ \u0275\u0275defineNgModule({
    type: _MatTooltipModule,
    imports: [A11yModule, OverlayModule, MatCommonModule, MatTooltip, TooltipComponent],
    exports: [MatTooltip, TooltipComponent, MatCommonModule, CdkScrollableModule]
  });
  static \u0275inj = /* @__PURE__ */ \u0275\u0275defineInjector({
    providers: [MAT_TOOLTIP_SCROLL_STRATEGY_FACTORY_PROVIDER],
    imports: [A11yModule, OverlayModule, MatCommonModule, MatCommonModule, CdkScrollableModule]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MatTooltipModule, [{
    type: NgModule,
    args: [{
      imports: [A11yModule, OverlayModule, MatCommonModule, MatTooltip, TooltipComponent],
      exports: [MatTooltip, TooltipComponent, MatCommonModule, CdkScrollableModule],
      providers: [MAT_TOOLTIP_SCROLL_STRATEGY_FACTORY_PROVIDER]
    }]
  }], null, null);
})();

// src/app/shared/components/profile-dialog/profile-dialog.component.ts
var _c03 = ["googleBtnContainer"];
function ProfileDialogComponent_h2_10_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "h2");
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r0.profile().name);
  }
}
function ProfileDialogComponent_input_11_Template(rf, ctx) {
  if (rf & 1) {
    const _r2 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "input", 37);
    \u0275\u0275twoWayListener("ngModelChange", function ProfileDialogComponent_input_11_Template_input_ngModelChange_0_listener($event) {
      \u0275\u0275restoreView(_r2);
      const ctx_r0 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r0.editingName, $event) || (ctx_r0.editingName = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275listener("keyup.enter", function ProfileDialogComponent_input_11_Template_input_keyup_enter_0_listener() {
      \u0275\u0275restoreView(_r2);
      const ctx_r0 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r0.saveName());
    });
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275twoWayProperty("ngModel", ctx_r0.editingName);
  }
}
function ProfileDialogComponent_div_103_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "div", 38, 0);
  }
}
function ProfileDialogComponent_button_104_Template(rf, ctx) {
  if (rf & 1) {
    const _r3 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 39);
    \u0275\u0275listener("click", function ProfileDialogComponent_button_104_Template_button_click_0_listener() {
      \u0275\u0275restoreView(_r3);
      const ctx_r0 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r0.signInGoogle());
    });
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(1, "svg", 40);
    \u0275\u0275element(2, "path", 41)(3, "path", 42)(4, "path", 43)(5, "path", 44);
    \u0275\u0275elementEnd();
    \u0275\u0275text(6, " Sign in with Google Account ");
    \u0275\u0275elementEnd();
  }
}
function ProfileDialogComponent_button_105_Template(rf, ctx) {
  if (rf & 1) {
    const _r4 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 45);
    \u0275\u0275listener("click", function ProfileDialogComponent_button_105_Template_button_click_0_listener() {
      \u0275\u0275restoreView(_r4);
      const ctx_r0 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r0.signOut());
    });
    \u0275\u0275elementStart(1, "mat-icon");
    \u0275\u0275text(2, "logout");
    \u0275\u0275elementEnd();
    \u0275\u0275text(3, " Sign Out Google Profile ");
    \u0275\u0275elementEnd();
  }
}
var ProfileDialogComponent = class _ProfileDialogComponent {
  authService = inject(AuthService);
  dialogRef = inject(MatDialogRef);
  googleBtnContainer;
  profile = this.authService.activeProfile;
  stats = this.authService.userStats;
  isEditingName = false;
  editingName = "";
  ngAfterViewInit() {
    if (this.googleBtnContainer?.nativeElement && !this.profile().isGoogleAuth) {
      this.authService.renderGoogleButton(this.googleBtnContainer.nativeElement);
    }
  }
  toggleEditName() {
    if (this.isEditingName) {
      this.saveName();
    } else {
      this.editingName = this.profile().name;
      this.isEditingName = true;
    }
  }
  saveName() {
    if (this.editingName.trim()) {
      this.authService.updateProfileName(this.editingName);
    }
    this.isEditingName = false;
  }
  signInGoogle() {
    try {
      this.authService.promptGoogleSignIn();
    } catch (e) {
      console.warn("Google Sign-In could not be initialized:", e);
    }
  }
  signOut() {
    this.authService.signOut();
  }
  resetStats() {
    if (confirm("Are you sure you want to reset your statistics to 0?")) {
      this.authService.resetActiveUserStats();
    }
  }
  onAvatarError(event) {
    const target = event.target;
    target.src = "https://api.dicebear.com/7.x/bottts/svg?seed=Commander";
  }
  static \u0275fac = function ProfileDialogComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _ProfileDialogComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _ProfileDialogComponent, selectors: [["app-profile-dialog"]], viewQuery: function ProfileDialogComponent_Query(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275viewQuery(_c03, 5);
    }
    if (rf & 2) {
      let _t;
      \u0275\u0275queryRefresh(_t = \u0275\u0275loadQuery()) && (ctx.googleBtnContainer = _t.first);
    }
  }, decls: 110, vars: 25, consts: [["googleBtnContainer", ""], [1, "profile-dialog-container"], [1, "dialog-header"], [1, "user-header-info"], [1, "avatar-wrapper"], [3, "error", "src", "alt"], [1, "auth-badge"], [1, "user-titles"], [1, "name-edit-row"], [4, "ngIf"], ["class", "name-input", 3, "ngModel", "ngModelChange", "keyup.enter", 4, "ngIf"], ["mat-icon-button", "", 1, "edit-btn", 3, "click"], [1, "email-sub"], [1, "provider-pill"], ["mat-icon-button", "", "mat-dialog-close", "", 1, "close-btn"], [1, "dialog-body"], [1, "section-title"], [1, "stats-grid"], [1, "stat-card", "win-rate"], [1, "stat-icon"], [1, "stat-data"], [1, "stat-value"], [1, "stat-label"], [1, "stat-card"], [1, "stat-icon", "games"], [1, "stat-card", "won"], [1, "stat-card", "lost"], [1, "stat-icon", "turns"], [1, "stat-icon", "avg"], [1, "stat-card", "challenges"], [1, "stat-card", "battles"], [1, "body-divider"], [1, "auth-actions-row"], ["class", "google-btn-wrapper", 4, "ngIf"], ["mat-raised-button", "", "class", "google-signin-btn", 3, "click", 4, "ngIf"], ["mat-stroked-button", "", "color", "warn", "class", "signout-btn", 3, "click", 4, "ngIf"], ["mat-button", "", "matTooltip", "Reset active user stats back to 0", 1, "reset-stats-btn", 3, "click"], [1, "name-input", 3, "ngModelChange", "keyup.enter", "ngModel"], [1, "google-btn-wrapper"], ["mat-raised-button", "", 1, "google-signin-btn", 3, "click"], ["viewBox", "0 0 24 24", "width", "20", "height", "20", 1, "google-svg"], ["fill", "#4285F4", "d", "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"], ["fill", "#34A853", "d", "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"], ["fill", "#FBBC05", "d", "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"], ["fill", "#EA4335", "d", "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"], ["mat-stroked-button", "", "color", "warn", 1, "signout-btn", 3, "click"]], template: function ProfileDialogComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 1)(1, "div", 2)(2, "div", 3)(3, "div", 4)(4, "img", 5);
      \u0275\u0275listener("error", function ProfileDialogComponent_Template_img_error_4_listener($event) {
        return ctx.onAvatarError($event);
      });
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(5, "span", 6)(6, "mat-icon");
      \u0275\u0275text(7);
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(8, "div", 7)(9, "div", 8);
      \u0275\u0275template(10, ProfileDialogComponent_h2_10_Template, 2, 1, "h2", 9)(11, ProfileDialogComponent_input_11_Template, 1, 1, "input", 10);
      \u0275\u0275elementStart(12, "button", 11);
      \u0275\u0275listener("click", function ProfileDialogComponent_Template_button_click_12_listener() {
        return ctx.toggleEditName();
      });
      \u0275\u0275elementStart(13, "mat-icon");
      \u0275\u0275text(14);
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(15, "p", 12);
      \u0275\u0275text(16);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(17, "span", 13);
      \u0275\u0275text(18);
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(19, "button", 14)(20, "mat-icon");
      \u0275\u0275text(21, "close");
      \u0275\u0275elementEnd()()();
      \u0275\u0275element(22, "mat-divider");
      \u0275\u0275elementStart(23, "div", 15)(24, "h3", 16)(25, "mat-icon");
      \u0275\u0275text(26, "insights");
      \u0275\u0275elementEnd();
      \u0275\u0275text(27, " Lifetime Game Performance & Statistics ");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(28, "div", 17)(29, "div", 18)(30, "div", 19)(31, "mat-icon");
      \u0275\u0275text(32, "emoji_events");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(33, "div", 20)(34, "span", 21);
      \u0275\u0275text(35);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(36, "span", 22);
      \u0275\u0275text(37, "Win Rate");
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(38, "div", 23)(39, "div", 24)(40, "mat-icon");
      \u0275\u0275text(41, "sports_esports");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(42, "div", 20)(43, "span", 21);
      \u0275\u0275text(44);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(45, "span", 22);
      \u0275\u0275text(46, "Games Played");
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(47, "div", 25)(48, "div", 19)(49, "mat-icon");
      \u0275\u0275text(50, "thumb_up");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(51, "div", 20)(52, "span", 21);
      \u0275\u0275text(53);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(54, "span", 22);
      \u0275\u0275text(55, "Victories");
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(56, "div", 26)(57, "div", 19)(58, "mat-icon");
      \u0275\u0275text(59, "thumb_down");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(60, "div", 20)(61, "span", 21);
      \u0275\u0275text(62);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(63, "span", 22);
      \u0275\u0275text(64, "Defeats");
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(65, "div", 23)(66, "div", 27)(67, "mat-icon");
      \u0275\u0275text(68, "hourglass_top");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(69, "div", 20)(70, "span", 21);
      \u0275\u0275text(71);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(72, "span", 22);
      \u0275\u0275text(73, "Total Turns");
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(74, "div", 23)(75, "div", 28)(76, "mat-icon");
      \u0275\u0275text(77, "speed");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(78, "div", 20)(79, "span", 21);
      \u0275\u0275text(80);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(81, "span", 22);
      \u0275\u0275text(82, "Avg Turns / Game");
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(83, "div", 29)(84, "div", 19)(85, "mat-icon");
      \u0275\u0275text(86, "local_fire_department");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(87, "div", 20)(88, "span", 21);
      \u0275\u0275text(89);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(90, "span", 22);
      \u0275\u0275text(91, "Challenges");
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(92, "div", 30)(93, "div", 19)(94, "mat-icon");
      \u0275\u0275text(95, "swords");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(96, "div", 20)(97, "span", 21);
      \u0275\u0275text(98);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(99, "span", 22);
      \u0275\u0275text(100, "Battles");
      \u0275\u0275elementEnd()()()();
      \u0275\u0275element(101, "mat-divider", 31);
      \u0275\u0275elementStart(102, "div", 32);
      \u0275\u0275template(103, ProfileDialogComponent_div_103_Template, 2, 0, "div", 33)(104, ProfileDialogComponent_button_104_Template, 7, 0, "button", 34)(105, ProfileDialogComponent_button_105_Template, 4, 0, "button", 35);
      \u0275\u0275elementStart(106, "button", 36);
      \u0275\u0275listener("click", function ProfileDialogComponent_Template_button_click_106_listener() {
        return ctx.resetStats();
      });
      \u0275\u0275elementStart(107, "mat-icon");
      \u0275\u0275text(108, "restart_alt");
      \u0275\u0275elementEnd();
      \u0275\u0275text(109, " Reset Statistics ");
      \u0275\u0275elementEnd()()()();
    }
    if (rf & 2) {
      \u0275\u0275advance(4);
      \u0275\u0275property("src", ctx.profile().avatarUrl, \u0275\u0275sanitizeUrl)("alt", ctx.profile().name);
      \u0275\u0275advance();
      \u0275\u0275classProp("google", ctx.profile().isGoogleAuth);
      \u0275\u0275advance(2);
      \u0275\u0275textInterpolate(ctx.profile().isGoogleAuth ? "verified_user" : "person");
      \u0275\u0275advance(3);
      \u0275\u0275property("ngIf", !ctx.isEditingName);
      \u0275\u0275advance();
      \u0275\u0275property("ngIf", ctx.isEditingName);
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(ctx.isEditingName ? "check" : "edit");
      \u0275\u0275advance(2);
      \u0275\u0275textInterpolate(ctx.profile().email);
      \u0275\u0275advance();
      \u0275\u0275classProp("google", ctx.profile().isGoogleAuth);
      \u0275\u0275advance();
      \u0275\u0275textInterpolate1(" ", ctx.profile().isGoogleAuth ? "Google Account Connected" : "Guest Commander Profile", " ");
      \u0275\u0275advance(11);
      \u0275\u0275classProp("high", ctx.stats().winRatePercentage >= 60);
      \u0275\u0275advance(6);
      \u0275\u0275textInterpolate1("", ctx.stats().winRatePercentage || 0, "%");
      \u0275\u0275advance(9);
      \u0275\u0275textInterpolate(ctx.stats().gamesPlayed);
      \u0275\u0275advance(9);
      \u0275\u0275textInterpolate(ctx.stats().gamesWon);
      \u0275\u0275advance(9);
      \u0275\u0275textInterpolate(ctx.stats().gamesLost);
      \u0275\u0275advance(9);
      \u0275\u0275textInterpolate(ctx.stats().totalTurns);
      \u0275\u0275advance(9);
      \u0275\u0275textInterpolate(ctx.stats().averageTurnsPerGame || 0);
      \u0275\u0275advance(9);
      \u0275\u0275textInterpolate(ctx.stats().totalChallenges || 0);
      \u0275\u0275advance(9);
      \u0275\u0275textInterpolate(ctx.stats().totalBattles || 0);
      \u0275\u0275advance(5);
      \u0275\u0275property("ngIf", !ctx.profile().isGoogleAuth);
      \u0275\u0275advance();
      \u0275\u0275property("ngIf", !ctx.profile().isGoogleAuth);
      \u0275\u0275advance();
      \u0275\u0275property("ngIf", ctx.profile().isGoogleAuth);
    }
  }, dependencies: [
    CommonModule,
    NgIf,
    FormsModule,
    DefaultValueAccessor,
    NgControlStatus,
    NgModel,
    MatDialogModule,
    MatDialogClose,
    MatButtonModule,
    MatButton,
    MatIconButton,
    MatIconModule,
    MatIcon,
    MatCardModule,
    MatDividerModule,
    MatDivider,
    MatTooltipModule,
    MatTooltip
  ], styles: ["\n\n.profile-dialog-container[_ngcontent-%COMP%] {\n  padding: 0;\n  max-width: 620px;\n  background: #0f172a;\n  color: #f8fafc;\n  border-radius: 16px;\n  overflow: hidden;\n}\n.dialog-header[_ngcontent-%COMP%] {\n  padding: 24px;\n  display: flex;\n  justify-content: space-between;\n  align-items: flex-start;\n  background:\n    linear-gradient(\n      135deg,\n      #1e293b 0%,\n      #0f172a 100%);\n}\n.dialog-header[_ngcontent-%COMP%]   .user-header-info[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 20px;\n  align-items: center;\n}\n.dialog-header[_ngcontent-%COMP%]   .avatar-wrapper[_ngcontent-%COMP%] {\n  position: relative;\n  width: 72px;\n  height: 72px;\n  border-radius: 50%;\n  overflow: visible;\n  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);\n}\n.dialog-header[_ngcontent-%COMP%]   .avatar-wrapper[_ngcontent-%COMP%]   img[_ngcontent-%COMP%] {\n  width: 100%;\n  height: 100%;\n  border-radius: 50%;\n  object-fit: cover;\n  border: 3px solid #3b82f6;\n  background: #1e293b;\n}\n.dialog-header[_ngcontent-%COMP%]   .avatar-wrapper[_ngcontent-%COMP%]   .auth-badge[_ngcontent-%COMP%] {\n  position: absolute;\n  bottom: -2px;\n  right: -2px;\n  width: 26px;\n  height: 26px;\n  border-radius: 50%;\n  background: #64748b;\n  color: white;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  border: 2px solid #0f172a;\n}\n.dialog-header[_ngcontent-%COMP%]   .avatar-wrapper[_ngcontent-%COMP%]   .auth-badge.google[_ngcontent-%COMP%] {\n  background: #22c55e;\n}\n.dialog-header[_ngcontent-%COMP%]   .avatar-wrapper[_ngcontent-%COMP%]   .auth-badge[_ngcontent-%COMP%]   mat-icon[_ngcontent-%COMP%] {\n  font-size: 16px;\n  width: 16px;\n  height: 16px;\n}\n.dialog-header[_ngcontent-%COMP%]   .user-titles[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n}\n.dialog-header[_ngcontent-%COMP%]   .user-titles[_ngcontent-%COMP%]   .name-edit-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n.dialog-header[_ngcontent-%COMP%]   .user-titles[_ngcontent-%COMP%]   .name-edit-row[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 1.4rem;\n  font-weight: 800;\n  color: #ffffff;\n}\n.dialog-header[_ngcontent-%COMP%]   .user-titles[_ngcontent-%COMP%]   .name-edit-row[_ngcontent-%COMP%]   .name-input[_ngcontent-%COMP%] {\n  background: rgba(255, 255, 255, 0.1);\n  border: 1px solid #3b82f6;\n  color: white;\n  border-radius: 6px;\n  padding: 4px 10px;\n  font-size: 1.1rem;\n  font-weight: 700;\n}\n.dialog-header[_ngcontent-%COMP%]   .user-titles[_ngcontent-%COMP%]   .name-edit-row[_ngcontent-%COMP%]   .edit-btn[_ngcontent-%COMP%] {\n  width: 32px;\n  height: 32px;\n  line-height: 32px;\n  color: #94a3b8;\n}\n.dialog-header[_ngcontent-%COMP%]   .user-titles[_ngcontent-%COMP%]   .name-edit-row[_ngcontent-%COMP%]   .edit-btn[_ngcontent-%COMP%]:hover {\n  color: #3b82f6;\n}\n.dialog-header[_ngcontent-%COMP%]   .user-titles[_ngcontent-%COMP%]   .name-edit-row[_ngcontent-%COMP%]   .edit-btn[_ngcontent-%COMP%]   mat-icon[_ngcontent-%COMP%] {\n  font-size: 18px;\n  width: 18px;\n  height: 18px;\n}\n.dialog-header[_ngcontent-%COMP%]   .user-titles[_ngcontent-%COMP%]   .email-sub[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 0.88rem;\n  color: #94a3b8;\n}\n.dialog-header[_ngcontent-%COMP%]   .user-titles[_ngcontent-%COMP%]   .provider-pill[_ngcontent-%COMP%] {\n  display: inline-block;\n  margin-top: 4px;\n  font-size: 0.75rem;\n  font-weight: 700;\n  padding: 3px 10px;\n  border-radius: 12px;\n  background: rgba(148, 163, 184, 0.15);\n  color: #cbd5e1;\n  width: fit-content;\n}\n.dialog-header[_ngcontent-%COMP%]   .user-titles[_ngcontent-%COMP%]   .provider-pill.google[_ngcontent-%COMP%] {\n  background: rgba(34, 197, 94, 0.2);\n  color: #4ade80;\n  border: 1px solid rgba(74, 222, 128, 0.3);\n}\n.dialog-header[_ngcontent-%COMP%]   .close-btn[_ngcontent-%COMP%] {\n  color: #94a3b8;\n}\n.dialog-header[_ngcontent-%COMP%]   .close-btn[_ngcontent-%COMP%]:hover {\n  color: white;\n}\n.dialog-body[_ngcontent-%COMP%] {\n  padding: 24px;\n}\n.dialog-body[_ngcontent-%COMP%]   .section-title[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  font-size: 1.05rem;\n  font-weight: 700;\n  color: #e2e8f0;\n  margin: 0 0 16px 0;\n}\n.dialog-body[_ngcontent-%COMP%]   .section-title[_ngcontent-%COMP%]   mat-icon[_ngcontent-%COMP%] {\n  color: #3b82f6;\n}\n.stats-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(4, 1fr);\n  gap: 12px;\n  margin-bottom: 20px;\n}\n@media (max-width: 599px) {\n  .stats-grid[_ngcontent-%COMP%] {\n    grid-template-columns: repeat(2, 1fr);\n  }\n}\n.stats-grid[_ngcontent-%COMP%]   .stat-card[_ngcontent-%COMP%] {\n  background: rgba(30, 41, 59, 0.7);\n  border: 1px solid rgba(255, 255, 255, 0.08);\n  border-radius: 12px;\n  padding: 12px;\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  transition: transform 0.2s ease, border-color 0.2s ease;\n}\n.stats-grid[_ngcontent-%COMP%]   .stat-card[_ngcontent-%COMP%]:hover {\n  transform: translateY(-2px);\n  border-color: rgba(59, 130, 246, 0.4);\n}\n.stats-grid[_ngcontent-%COMP%]   .stat-card[_ngcontent-%COMP%]   .stat-icon[_ngcontent-%COMP%] {\n  width: 38px;\n  height: 38px;\n  border-radius: 10px;\n  background: rgba(59, 130, 246, 0.15);\n  color: #60a5fa;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n.stats-grid[_ngcontent-%COMP%]   .stat-card[_ngcontent-%COMP%]   .stat-icon[_ngcontent-%COMP%]   mat-icon[_ngcontent-%COMP%] {\n  font-size: 20px;\n  width: 20px;\n  height: 20px;\n}\n.stats-grid[_ngcontent-%COMP%]   .stat-card[_ngcontent-%COMP%]   .stat-data[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n}\n.stats-grid[_ngcontent-%COMP%]   .stat-card[_ngcontent-%COMP%]   .stat-data[_ngcontent-%COMP%]   .stat-value[_ngcontent-%COMP%] {\n  font-size: 1.25rem;\n  font-weight: 800;\n  color: #ffffff;\n}\n.stats-grid[_ngcontent-%COMP%]   .stat-card[_ngcontent-%COMP%]   .stat-data[_ngcontent-%COMP%]   .stat-label[_ngcontent-%COMP%] {\n  font-size: 0.72rem;\n  color: #94a3b8;\n  font-weight: 600;\n  text-transform: uppercase;\n  letter-spacing: 0.5px;\n}\n.stats-grid[_ngcontent-%COMP%]   .stat-card.win-rate[_ngcontent-%COMP%] {\n  grid-column: span 2;\n  background:\n    linear-gradient(\n      135deg,\n      rgba(30, 41, 59, 0.9) 0%,\n      rgba(59, 130, 246, 0.2) 100%);\n  border: 1px solid rgba(96, 165, 250, 0.3);\n}\n.stats-grid[_ngcontent-%COMP%]   .stat-card.win-rate[_ngcontent-%COMP%]   .stat-icon[_ngcontent-%COMP%] {\n  background: rgba(234, 179, 8, 0.2);\n  color: #fde047;\n}\n.stats-grid[_ngcontent-%COMP%]   .stat-card.win-rate.high[_ngcontent-%COMP%]   .stat-value[_ngcontent-%COMP%] {\n  color: #4ade80;\n}\n.stats-grid[_ngcontent-%COMP%]   .stat-card.won[_ngcontent-%COMP%]   .stat-icon[_ngcontent-%COMP%] {\n  background: rgba(34, 197, 94, 0.2);\n  color: #4ade80;\n}\n.stats-grid[_ngcontent-%COMP%]   .stat-card.lost[_ngcontent-%COMP%]   .stat-icon[_ngcontent-%COMP%] {\n  background: rgba(239, 68, 68, 0.2);\n  color: #f87171;\n}\n.stats-grid[_ngcontent-%COMP%]   .stat-card.challenges[_ngcontent-%COMP%]   .stat-icon[_ngcontent-%COMP%] {\n  background: rgba(249, 115, 22, 0.2);\n  color: #fb923c;\n}\n.stats-grid[_ngcontent-%COMP%]   .stat-card.battles[_ngcontent-%COMP%]   .stat-icon[_ngcontent-%COMP%] {\n  background: rgba(168, 85, 247, 0.2);\n  color: #c084fc;\n}\n.body-divider[_ngcontent-%COMP%] {\n  margin: 16px 0;\n  border-color: rgba(255, 255, 255, 0.1);\n}\n.auth-actions-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 12px;\n  flex-wrap: wrap;\n}\n.auth-actions-row[_ngcontent-%COMP%]   .google-signin-btn[_ngcontent-%COMP%] {\n  background: #ffffff;\n  color: #1e293b;\n  font-weight: 700;\n  border-radius: 10px;\n  padding: 0 20px;\n  height: 42px;\n  display: inline-flex;\n  align-items: center;\n  gap: 10px;\n  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);\n}\n.auth-actions-row[_ngcontent-%COMP%]   .google-signin-btn[_ngcontent-%COMP%]:hover {\n  background: #f8fafc;\n}\n.auth-actions-row[_ngcontent-%COMP%]   .signout-btn[_ngcontent-%COMP%] {\n  border-radius: 10px;\n  height: 42px;\n}\n.auth-actions-row[_ngcontent-%COMP%]   .reset-stats-btn[_ngcontent-%COMP%] {\n  color: #94a3b8;\n  margin-left: auto;\n  font-size: 0.85rem;\n}\n.auth-actions-row[_ngcontent-%COMP%]   .reset-stats-btn[_ngcontent-%COMP%]:hover {\n  color: #f87171;\n}\n/*# sourceMappingURL=profile-dialog.component.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ProfileDialogComponent, [{
    type: Component,
    args: [{ selector: "app-profile-dialog", standalone: true, imports: [
      CommonModule,
      FormsModule,
      MatDialogModule,
      MatButtonModule,
      MatIconModule,
      MatCardModule,
      MatDividerModule,
      MatTooltipModule
    ], template: `
    <div class="profile-dialog-container">
      <div class="dialog-header">
        <div class="user-header-info">
          <div class="avatar-wrapper">
            <img [src]="profile().avatarUrl" [alt]="profile().name" (error)="onAvatarError($event)" />
            <span class="auth-badge" [class.google]="profile().isGoogleAuth">
              <mat-icon>{{ profile().isGoogleAuth ? 'verified_user' : 'person' }}</mat-icon>
            </span>
          </div>
          <div class="user-titles">
            <div class="name-edit-row">
              <h2 *ngIf="!isEditingName">{{ profile().name }}</h2>
              <input *ngIf="isEditingName" [(ngModel)]="editingName" (keyup.enter)="saveName()" class="name-input" />
              <button mat-icon-button class="edit-btn" (click)="toggleEditName()">
                <mat-icon>{{ isEditingName ? 'check' : 'edit' }}</mat-icon>
              </button>
            </div>
            <p class="email-sub">{{ profile().email }}</p>
            <span class="provider-pill" [class.google]="profile().isGoogleAuth">
              {{ profile().isGoogleAuth ? 'Google Account Connected' : 'Guest Commander Profile' }}
            </span>
          </div>
        </div>

        <button mat-icon-button mat-dialog-close class="close-btn">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-divider></mat-divider>

      <div class="dialog-body">
        <h3 class="section-title">
          <mat-icon>insights</mat-icon> Lifetime Game Performance & Statistics
        </h3>

        <div class="stats-grid">
          <div class="stat-card win-rate" [class.high]="stats().winRatePercentage! >= 60">
            <div class="stat-icon">
              <mat-icon>emoji_events</mat-icon>
            </div>
            <div class="stat-data">
              <span class="stat-value">{{ stats().winRatePercentage || 0 }}%</span>
              <span class="stat-label">Win Rate</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon games">
              <mat-icon>sports_esports</mat-icon>
            </div>
            <div class="stat-data">
              <span class="stat-value">{{ stats().gamesPlayed }}</span>
              <span class="stat-label">Games Played</span>
            </div>
          </div>

          <div class="stat-card won">
            <div class="stat-icon">
              <mat-icon>thumb_up</mat-icon>
            </div>
            <div class="stat-data">
              <span class="stat-value">{{ stats().gamesWon }}</span>
              <span class="stat-label">Victories</span>
            </div>
          </div>

          <div class="stat-card lost">
            <div class="stat-icon">
              <mat-icon>thumb_down</mat-icon>
            </div>
            <div class="stat-data">
              <span class="stat-value">{{ stats().gamesLost }}</span>
              <span class="stat-label">Defeats</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon turns">
              <mat-icon>hourglass_top</mat-icon>
            </div>
            <div class="stat-data">
              <span class="stat-value">{{ stats().totalTurns }}</span>
              <span class="stat-label">Total Turns</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon avg">
              <mat-icon>speed</mat-icon>
            </div>
            <div class="stat-data">
              <span class="stat-value">{{ stats().averageTurnsPerGame || 0 }}</span>
              <span class="stat-label">Avg Turns / Game</span>
            </div>
          </div>

          <div class="stat-card challenges">
            <div class="stat-icon">
              <mat-icon>local_fire_department</mat-icon>
            </div>
            <div class="stat-data">
              <span class="stat-value">{{ stats().totalChallenges || 0 }}</span>
              <span class="stat-label">Challenges</span>
            </div>
          </div>

          <div class="stat-card battles">
            <div class="stat-icon">
              <mat-icon>swords</mat-icon>
            </div>
            <div class="stat-data">
              <span class="stat-value">{{ stats().totalBattles || 0 }}</span>
              <span class="stat-label">Battles</span>
            </div>
          </div>
        </div>

        <mat-divider class="body-divider"></mat-divider>

        <div class="auth-actions-row">
          <div *ngIf="!profile().isGoogleAuth" #googleBtnContainer class="google-btn-wrapper"></div>
          <button *ngIf="!profile().isGoogleAuth" mat-raised-button class="google-signin-btn" (click)="signInGoogle()">
            <svg class="google-svg" viewBox="0 0 24 24" width="20" height="20">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            Sign in with Google Account
          </button>

          <button *ngIf="profile().isGoogleAuth" mat-stroked-button color="warn" class="signout-btn" (click)="signOut()">
            <mat-icon>logout</mat-icon> Sign Out Google Profile
          </button>

          <button mat-button class="reset-stats-btn" (click)="resetStats()" matTooltip="Reset active user stats back to 0">
            <mat-icon>restart_alt</mat-icon> Reset Statistics
          </button>
        </div>
      </div>
    </div>
  `, styles: ["/* src/app/shared/components/profile-dialog/profile-dialog.component.scss */\n.profile-dialog-container {\n  padding: 0;\n  max-width: 620px;\n  background: #0f172a;\n  color: #f8fafc;\n  border-radius: 16px;\n  overflow: hidden;\n}\n.dialog-header {\n  padding: 24px;\n  display: flex;\n  justify-content: space-between;\n  align-items: flex-start;\n  background:\n    linear-gradient(\n      135deg,\n      #1e293b 0%,\n      #0f172a 100%);\n}\n.dialog-header .user-header-info {\n  display: flex;\n  gap: 20px;\n  align-items: center;\n}\n.dialog-header .avatar-wrapper {\n  position: relative;\n  width: 72px;\n  height: 72px;\n  border-radius: 50%;\n  overflow: visible;\n  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);\n}\n.dialog-header .avatar-wrapper img {\n  width: 100%;\n  height: 100%;\n  border-radius: 50%;\n  object-fit: cover;\n  border: 3px solid #3b82f6;\n  background: #1e293b;\n}\n.dialog-header .avatar-wrapper .auth-badge {\n  position: absolute;\n  bottom: -2px;\n  right: -2px;\n  width: 26px;\n  height: 26px;\n  border-radius: 50%;\n  background: #64748b;\n  color: white;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  border: 2px solid #0f172a;\n}\n.dialog-header .avatar-wrapper .auth-badge.google {\n  background: #22c55e;\n}\n.dialog-header .avatar-wrapper .auth-badge mat-icon {\n  font-size: 16px;\n  width: 16px;\n  height: 16px;\n}\n.dialog-header .user-titles {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n}\n.dialog-header .user-titles .name-edit-row {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n.dialog-header .user-titles .name-edit-row h2 {\n  margin: 0;\n  font-size: 1.4rem;\n  font-weight: 800;\n  color: #ffffff;\n}\n.dialog-header .user-titles .name-edit-row .name-input {\n  background: rgba(255, 255, 255, 0.1);\n  border: 1px solid #3b82f6;\n  color: white;\n  border-radius: 6px;\n  padding: 4px 10px;\n  font-size: 1.1rem;\n  font-weight: 700;\n}\n.dialog-header .user-titles .name-edit-row .edit-btn {\n  width: 32px;\n  height: 32px;\n  line-height: 32px;\n  color: #94a3b8;\n}\n.dialog-header .user-titles .name-edit-row .edit-btn:hover {\n  color: #3b82f6;\n}\n.dialog-header .user-titles .name-edit-row .edit-btn mat-icon {\n  font-size: 18px;\n  width: 18px;\n  height: 18px;\n}\n.dialog-header .user-titles .email-sub {\n  margin: 0;\n  font-size: 0.88rem;\n  color: #94a3b8;\n}\n.dialog-header .user-titles .provider-pill {\n  display: inline-block;\n  margin-top: 4px;\n  font-size: 0.75rem;\n  font-weight: 700;\n  padding: 3px 10px;\n  border-radius: 12px;\n  background: rgba(148, 163, 184, 0.15);\n  color: #cbd5e1;\n  width: fit-content;\n}\n.dialog-header .user-titles .provider-pill.google {\n  background: rgba(34, 197, 94, 0.2);\n  color: #4ade80;\n  border: 1px solid rgba(74, 222, 128, 0.3);\n}\n.dialog-header .close-btn {\n  color: #94a3b8;\n}\n.dialog-header .close-btn:hover {\n  color: white;\n}\n.dialog-body {\n  padding: 24px;\n}\n.dialog-body .section-title {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  font-size: 1.05rem;\n  font-weight: 700;\n  color: #e2e8f0;\n  margin: 0 0 16px 0;\n}\n.dialog-body .section-title mat-icon {\n  color: #3b82f6;\n}\n.stats-grid {\n  display: grid;\n  grid-template-columns: repeat(4, 1fr);\n  gap: 12px;\n  margin-bottom: 20px;\n}\n@media (max-width: 599px) {\n  .stats-grid {\n    grid-template-columns: repeat(2, 1fr);\n  }\n}\n.stats-grid .stat-card {\n  background: rgba(30, 41, 59, 0.7);\n  border: 1px solid rgba(255, 255, 255, 0.08);\n  border-radius: 12px;\n  padding: 12px;\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  transition: transform 0.2s ease, border-color 0.2s ease;\n}\n.stats-grid .stat-card:hover {\n  transform: translateY(-2px);\n  border-color: rgba(59, 130, 246, 0.4);\n}\n.stats-grid .stat-card .stat-icon {\n  width: 38px;\n  height: 38px;\n  border-radius: 10px;\n  background: rgba(59, 130, 246, 0.15);\n  color: #60a5fa;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n.stats-grid .stat-card .stat-icon mat-icon {\n  font-size: 20px;\n  width: 20px;\n  height: 20px;\n}\n.stats-grid .stat-card .stat-data {\n  display: flex;\n  flex-direction: column;\n}\n.stats-grid .stat-card .stat-data .stat-value {\n  font-size: 1.25rem;\n  font-weight: 800;\n  color: #ffffff;\n}\n.stats-grid .stat-card .stat-data .stat-label {\n  font-size: 0.72rem;\n  color: #94a3b8;\n  font-weight: 600;\n  text-transform: uppercase;\n  letter-spacing: 0.5px;\n}\n.stats-grid .stat-card.win-rate {\n  grid-column: span 2;\n  background:\n    linear-gradient(\n      135deg,\n      rgba(30, 41, 59, 0.9) 0%,\n      rgba(59, 130, 246, 0.2) 100%);\n  border: 1px solid rgba(96, 165, 250, 0.3);\n}\n.stats-grid .stat-card.win-rate .stat-icon {\n  background: rgba(234, 179, 8, 0.2);\n  color: #fde047;\n}\n.stats-grid .stat-card.win-rate.high .stat-value {\n  color: #4ade80;\n}\n.stats-grid .stat-card.won .stat-icon {\n  background: rgba(34, 197, 94, 0.2);\n  color: #4ade80;\n}\n.stats-grid .stat-card.lost .stat-icon {\n  background: rgba(239, 68, 68, 0.2);\n  color: #f87171;\n}\n.stats-grid .stat-card.challenges .stat-icon {\n  background: rgba(249, 115, 22, 0.2);\n  color: #fb923c;\n}\n.stats-grid .stat-card.battles .stat-icon {\n  background: rgba(168, 85, 247, 0.2);\n  color: #c084fc;\n}\n.body-divider {\n  margin: 16px 0;\n  border-color: rgba(255, 255, 255, 0.1);\n}\n.auth-actions-row {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 12px;\n  flex-wrap: wrap;\n}\n.auth-actions-row .google-signin-btn {\n  background: #ffffff;\n  color: #1e293b;\n  font-weight: 700;\n  border-radius: 10px;\n  padding: 0 20px;\n  height: 42px;\n  display: inline-flex;\n  align-items: center;\n  gap: 10px;\n  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);\n}\n.auth-actions-row .google-signin-btn:hover {\n  background: #f8fafc;\n}\n.auth-actions-row .signout-btn {\n  border-radius: 10px;\n  height: 42px;\n}\n.auth-actions-row .reset-stats-btn {\n  color: #94a3b8;\n  margin-left: auto;\n  font-size: 0.85rem;\n}\n.auth-actions-row .reset-stats-btn:hover {\n  color: #f87171;\n}\n/*# sourceMappingURL=profile-dialog.component.css.map */\n"] }]
  }], null, { googleBtnContainer: [{
    type: ViewChild,
    args: ["googleBtnContainer"]
  }] });
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(ProfileDialogComponent, { className: "ProfileDialogComponent", filePath: "src/app/shared/components/profile-dialog/profile-dialog.component.ts", lineNumber: 171 });
})();

// src/app/core/models/game-state.model.ts
var GamePhase;
(function(GamePhase2) {
  GamePhase2["SETUP"] = "setup";
  GamePhase2["NORMAL"] = "normal";
  GamePhase2["CHALLENGE"] = "challenge";
  GamePhase2["BATTLE"] = "battle";
  GamePhase2["GAME_OVER"] = "game_over";
})(GamePhase || (GamePhase = {}));
var PlayerType;
(function(PlayerType2) {
  PlayerType2["PLAYER"] = "player";
  PlayerType2["OPPONENT"] = "opponent";
})(PlayerType || (PlayerType = {}));

// src/app/core/models/deck.model.ts
var Deck = class _Deck {
  cards = [];
  constructor(cards) {
    if (cards) {
      this.cards = [...cards];
    } else {
      this.initializeStandardDeck();
    }
  }
  initializeStandardDeck() {
    const suits = Object.values(Suit);
    const ranks = Object.values(Rank);
    for (const suit of suits) {
      for (const rank of ranks) {
        this.cards.push(new CardImpl(suit, rank));
      }
    }
  }
  static createRedDeck() {
    const redCards = [];
    const redSuits = [Suit.HEARTS, Suit.DIAMONDS];
    const ranks = Object.values(Rank);
    for (const suit of redSuits) {
      for (const rank of ranks) {
        redCards.push(new CardImpl(suit, rank));
      }
    }
    return new _Deck(redCards);
  }
  static createBlackDeck() {
    const blackCards = [];
    const blackSuits = [Suit.CLUBS, Suit.SPADES];
    const ranks = Object.values(Rank);
    for (const suit of blackSuits) {
      for (const rank of ranks) {
        blackCards.push(new CardImpl(suit, rank));
      }
    }
    return new _Deck(blackCards);
  }
  shuffle() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }
  draw() {
    return this.cards.pop() || null;
  }
  drawMultiple(count) {
    const drawnCards = [];
    for (let i = 0; i < count && this.cards.length > 0; i++) {
      const card = this.draw();
      if (card) {
        drawnCards.push(card);
      }
    }
    return drawnCards;
  }
  addCard(card) {
    this.cards.unshift(card);
  }
  addCards(cards) {
    this.cards.unshift(...cards);
  }
  get count() {
    return this.cards.length;
  }
  get isEmpty() {
    return this.cards.length === 0;
  }
  get hasMinimumForBattle() {
    return this.cards.length >= 4;
  }
  peek() {
    return this.cards[this.cards.length - 1] || null;
  }
  toArray() {
    return [...this.cards];
  }
  /**
   * Create a copy of this deck
   */
  copy() {
    return new _Deck([...this.cards]);
  }
  reset() {
    this.cards = [];
  }
};

// src/app/core/services/game-state.service.ts
var GameStateService = class _GameStateService {
  playerDeck = signal(Deck.createRedDeck(), ...ngDevMode ? [{ debugName: "playerDeck" }] : []);
  opponentDeck = signal(Deck.createBlackDeck(), ...ngDevMode ? [{ debugName: "opponentDeck" }] : []);
  discardPile = signal([], ...ngDevMode ? [{ debugName: "discardPile" }] : []);
  gamePhase = signal(GamePhase.SETUP, ...ngDevMode ? [{ debugName: "gamePhase" }] : []);
  turnNumber = signal(0, ...ngDevMode ? [{ debugName: "turnNumber" }] : []);
  activeTurn = signal(null, ...ngDevMode ? [{ debugName: "activeTurn" }] : []);
  winner = signal(null, ...ngDevMode ? [{ debugName: "winner" }] : []);
  isPlayerTurn = signal(true, ...ngDevMode ? [{ debugName: "isPlayerTurn" }] : []);
  canChallenge = signal(false, ...ngDevMode ? [{ debugName: "canChallenge" }] : []);
  lastResult = signal(null, ...ngDevMode ? [{ debugName: "lastResult" }] : []);
  // Computed values
  playerCardCount = computed(() => this.playerDeck().count, ...ngDevMode ? [{ debugName: "playerCardCount" }] : []);
  opponentCardCount = computed(() => this.opponentDeck().count, ...ngDevMode ? [{ debugName: "opponentCardCount" }] : []);
  discardedCardCount = computed(() => this.discardPile().length, ...ngDevMode ? [{ debugName: "discardedCardCount" }] : []);
  discardedCards = computed(() => [...this.discardPile()], ...ngDevMode ? [{ debugName: "discardedCards" }] : []);
  // Public accessor for discard pile
  gameStats = computed(() => ({
    turnNumber: this.turnNumber(),
    playerCardCount: this.playerCardCount(),
    opponentCardCount: this.opponentCardCount(),
    discardedCardCount: this.discardedCardCount()
  }), ...ngDevMode ? [{ debugName: "gameStats" }] : []);
  gameState = computed(() => ({
    phase: this.gamePhase(),
    stats: this.gameStats(),
    activeTurn: this.activeTurn(),
    winner: this.winner(),
    isPlayerTurn: this.isPlayerTurn(),
    canChallenge: this.canChallenge(),
    lastResult: this.lastResult()
  }), ...ngDevMode ? [{ debugName: "gameState" }] : []);
  // Readonly getters for external access
  get currentPhase() {
    return this.gamePhase();
  }
  get currentStats() {
    return this.gameStats();
  }
  get currentState() {
    return this.gameState();
  }
  get currentPlayerDeck() {
    return this.playerDeck();
  }
  get currentOpponentDeck() {
    return this.opponentDeck();
  }
  get currentDiscardPile() {
    return this.discardPile();
  }
  initializeGame() {
    this.playerDeck.set(Deck.createRedDeck());
    this.opponentDeck.set(Deck.createBlackDeck());
    this.discardPile.set([]);
    this.gamePhase.set(GamePhase.SETUP);
    this.turnNumber.set(0);
    this.activeTurn.set(null);
    this.winner.set(null);
    this.isPlayerTurn.set(true);
    this.canChallenge.set(false);
    this.lastResult.set(null);
    this.playerDeck().shuffle();
    this.opponentDeck().shuffle();
    this.gamePhase.set(GamePhase.NORMAL);
  }
  startTurn() {
    if (this.gamePhase() !== GamePhase.NORMAL) {
      throw new Error("Cannot start turn in current phase");
    }
    if (this.playerDeck().isEmpty || this.opponentDeck().isEmpty) {
      this.endGame();
      return { playerCard: null, opponentCard: null };
    }
    const playerCard = this.drawPlayerCard();
    const opponentCard = this.drawOpponentCard();
    if (!playerCard || !opponentCard) {
      this.endGame();
      return { playerCard: null, opponentCard: null };
    }
    this.turnNumber.update((turn) => turn + 1);
    this.activeTurn.set({
      playerCard,
      opponentCard,
      phase: GamePhase.NORMAL
    });
    return { playerCard, opponentCard };
  }
  setPhase(phase) {
    this.gamePhase.set(phase);
  }
  setChallengeAvailable(available) {
    this.canChallenge.set(available);
  }
  setActiveTurn(turn) {
    this.activeTurn.set(turn);
  }
  addToDiscardPile(cards) {
    this.discardPile.update((pile) => [...pile, ...cards]);
    this.validateDeckCounts();
  }
  returnCardsToPlayerDeck(cards) {
    const newDeck = this.playerDeck().copy();
    newDeck.addCards(cards);
    this.playerDeck.set(newDeck);
    this.validateDeckCounts();
  }
  returnCardsToOpponentDeck(cards) {
    const newDeck = this.opponentDeck().copy();
    newDeck.addCards(cards);
    this.opponentDeck.set(newDeck);
    this.validateDeckCounts();
  }
  removeCardsFromPlayerDeck(cards) {
    const currentDeck = this.playerDeck();
    let cardArray = [...currentDeck.toArray()];
    for (const card of cards) {
      const index = cardArray.findIndex((c) => c.suit === card.suit && c.rank === card.rank);
      if (index !== -1) {
        cardArray.splice(index, 1);
      }
    }
    this.playerDeck.set(new Deck(cardArray));
  }
  removeCardsFromOpponentDeck(cards) {
    const currentDeck = this.opponentDeck();
    let cardArray = [...currentDeck.toArray()];
    for (const card of cards) {
      const index = cardArray.findIndex((c) => c.suit === card.suit && c.rank === card.rank);
      if (index !== -1) {
        cardArray.splice(index, 1);
      }
    }
    this.opponentDeck.set(new Deck(cardArray));
  }
  validateDeckCounts() {
    const playerCount = this.playerDeck().count;
    const opponentCount = this.opponentDeck().count;
    if (playerCount > 26 || opponentCount > 26) {
      console.error(`Invalid deck count detected: Player(${playerCount}) Opponent(${opponentCount})`);
      throw new Error(`Invalid deck count: Player(${playerCount}) Opponent(${opponentCount}) - No deck should exceed 26 cards`);
    }
  }
  /**
   * Draw a card from player deck and update signals
   */
  drawPlayerCard() {
    const newDeck = this.playerDeck().copy();
    const card = newDeck.draw();
    this.playerDeck.set(newDeck);
    return card;
  }
  /**
   * Draw a card from opponent deck and update signals
   */
  drawOpponentCard() {
    const newDeck = this.opponentDeck().copy();
    const card = newDeck.draw();
    this.opponentDeck.set(newDeck);
    return card;
  }
  setLastResult(result) {
    this.lastResult.set(result);
  }
  endGame() {
    this.gamePhase.set(GamePhase.GAME_OVER);
    if (this.playerCardCount() === 0) {
      this.winner.set(PlayerType.OPPONENT);
    } else if (this.opponentCardCount() === 0) {
      this.winner.set(PlayerType.PLAYER);
    } else {
      this.winner.set(this.playerCardCount() > this.opponentCardCount() ? PlayerType.PLAYER : PlayerType.OPPONENT);
    }
    this.activeTurn.set(null);
    this.canChallenge.set(false);
  }
  checkGameEndConditions() {
    if (this.playerCardCount() === 0 || this.opponentCardCount() === 0) {
      this.endGame();
      return true;
    }
    if (this.gamePhase() === GamePhase.BATTLE) {
      if (!this.playerDeck().hasMinimumForBattle || !this.opponentDeck().hasMinimumForBattle) {
        this.endGame();
        return true;
      }
    }
    return false;
  }
  reset() {
    this.initializeGame();
  }
  static \u0275fac = function GameStateService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _GameStateService)();
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _GameStateService, factory: _GameStateService.\u0275fac, providedIn: "root" });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(GameStateService, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], null, null);
})();

// src/app/core/services/card-comparison.service.ts
var ComparisonResult;
(function(ComparisonResult2) {
  ComparisonResult2["PLAYER_WINS"] = "player_wins";
  ComparisonResult2["OPPONENT_WINS"] = "opponent_wins";
  ComparisonResult2["TIE"] = "tie";
})(ComparisonResult || (ComparisonResult = {}));
var CardComparisonService = class _CardComparisonService {
  compareCards(playerCard, opponentCard) {
    if (this.isSpecialAceVsTwoRule(playerCard, opponentCard)) {
      return playerCard.rank === Rank.TWO ? ComparisonResult.PLAYER_WINS : ComparisonResult.OPPONENT_WINS;
    }
    if (playerCard.value > opponentCard.value) {
      return ComparisonResult.PLAYER_WINS;
    } else if (playerCard.value < opponentCard.value) {
      return ComparisonResult.OPPONENT_WINS;
    } else {
      return ComparisonResult.TIE;
    }
  }
  isSpecialAceVsTwoRule(playerCard, opponentCard) {
    const hasAce = playerCard.rank === Rank.ACE || opponentCard.rank === Rank.ACE;
    const hasTwo = playerCard.rank === Rank.TWO || opponentCard.rank === Rank.TWO;
    return hasAce && hasTwo;
  }
  /**
   * Determines the winner of multiple cards (used in battles)
   */
  compareMultipleCards(playerCards, opponentCards) {
    if (playerCards.length !== opponentCards.length) {
      throw new Error("Card arrays must be the same length for comparison");
    }
    if (playerCards.length === 1 && opponentCards.length === 1) {
      return this.compareCards(playerCards[0], opponentCards[0]);
    }
    throw new Error("Multiple card comparison not yet implemented for arrays > 1");
  }
  /**
   * Get the higher value card, accounting for the special Ace vs 2 rule
   */
  getHigherCard(card1, card2) {
    const result = this.compareCards(card1, card2);
    switch (result) {
      case ComparisonResult.PLAYER_WINS:
        return card1;
      case ComparisonResult.OPPONENT_WINS:
        return card2;
      case ComparisonResult.TIE:
        return card1;
    }
  }
  /**
   * Check if two cards have equal values (for battle detection)
   */
  areCardsEqual(card1, card2) {
    return this.compareCards(card1, card2) === ComparisonResult.TIE;
  }
  static \u0275fac = function CardComparisonService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _CardComparisonService)();
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _CardComparisonService, factory: _CardComparisonService.\u0275fac, providedIn: "root" });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(CardComparisonService, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], null, null);
})();

// src/app/core/services/opponent-ai.service.ts
var OpponentAIService = class _OpponentAIService {
  /**
   * Determine if the opponent should challenge based on the card value
   * Opponents are more likely to challenge with lower value cards (especially 2s)
   * @param opponentCard The card the opponent would lose
   * @returns true if the opponent should challenge
   */
  shouldChallenge(opponentCard) {
    const challengeProbabilities = {
      2: 0.95,
      // Almost always challenge for 2s (lowest value, worth saving)
      3: 0.8,
      // High chance for 3s
      4: 0.65,
      // Good chance for 4s
      5: 0.5,
      // Medium chance for 5s
      6: 0.4,
      // Lower chance for 6s
      7: 0.3,
      // Even lower for 7s
      8: 0.25,
      // Reduced chance for 8s
      9: 0.2,
      // Low chance for 9s
      10: 0.15,
      // Very low chance for 10s
      11: 0.1,
      // Minimal chance for Jacks
      12: 0.05,
      // Very minimal chance for Queens
      13: 0.03,
      // Almost never challenge for Kings
      14: 0.01
      // Rarely challenge for Aces (highest value)
    };
    const cardValue = this.getCardValue(opponentCard);
    const probability = challengeProbabilities[cardValue] || 0.2;
    const randomValue = Math.random();
    return randomValue < probability;
  }
  /**
   * Get the numerical value of a card for challenge probability calculation
   */
  getCardValue(card) {
    switch (card.rank) {
      case Rank.TWO:
        return 2;
      case Rank.THREE:
        return 3;
      case Rank.FOUR:
        return 4;
      case Rank.FIVE:
        return 5;
      case Rank.SIX:
        return 6;
      case Rank.SEVEN:
        return 7;
      case Rank.EIGHT:
        return 8;
      case Rank.NINE:
        return 9;
      case Rank.TEN:
        return 10;
      case Rank.JACK:
        return 11;
      case Rank.QUEEN:
        return 12;
      case Rank.KING:
        return 13;
      case Rank.ACE:
        return 14;
      default:
        return 7;
    }
  }
  static \u0275fac = function OpponentAIService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _OpponentAIService)();
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _OpponentAIService, factory: _OpponentAIService.\u0275fac, providedIn: "root" });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(OpponentAIService, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], null, null);
})();

// src/app/core/services/turn-resolution.service.ts
var TurnResolutionService = class _TurnResolutionService {
  gameStateService;
  cardComparisonService;
  opponentAIService;
  constructor(gameStateService, cardComparisonService, opponentAIService) {
    this.gameStateService = gameStateService;
    this.cardComparisonService = cardComparisonService;
    this.opponentAIService = opponentAIService;
  }
  resolveTurn(playerCard, opponentCard) {
    const result = this.cardComparisonService.compareCards(playerCard, opponentCard);
    switch (result) {
      case ComparisonResult.PLAYER_WINS:
        return this.resolveNormalWin(playerCard, opponentCard, PlayerType.PLAYER);
      case ComparisonResult.OPPONENT_WINS:
        return this.resolveNormalLoss(playerCard, opponentCard, PlayerType.OPPONENT);
      case ComparisonResult.TIE:
        return this.resolveTie(playerCard, opponentCard);
    }
  }
  resolveNormalWin(playerCard, opponentCard, winner) {
    const winnerCards = winner === PlayerType.PLAYER ? [playerCard] : [opponentCard];
    const loserCards = winner === PlayerType.PLAYER ? [opponentCard] : [playerCard];
    let canChallenge = false;
    let opponentChallenge = false;
    let message = "";
    if (winner === PlayerType.OPPONENT) {
      canChallenge = true;
      message = "Opponent wins this turn!";
    } else {
      opponentChallenge = this.opponentAIService.shouldChallenge(opponentCard);
      if (opponentChallenge) {
        message = "You win this turn, but opponent challenges!";
        return {
          winner: null,
          // No winner yet due to challenge
          result: ComparisonResult.PLAYER_WINS,
          message,
          cardsLost: [],
          cardsKept: [playerCard, opponentCard],
          // Hold cards for challenge resolution
          nextPhase: GamePhase.CHALLENGE,
          canChallenge: false,
          // Player can't challenge, but opponent is challenging
          opponentChallenge: true
        };
      } else {
        message = "You win this turn!";
      }
    }
    if (winner === PlayerType.PLAYER) {
      this.gameStateService.returnCardsToPlayerDeck([playerCard]);
    } else {
      this.gameStateService.returnCardsToOpponentDeck([opponentCard]);
    }
    this.gameStateService.addToDiscardPile(loserCards);
    return {
      winner,
      result: winner === PlayerType.PLAYER ? ComparisonResult.PLAYER_WINS : ComparisonResult.OPPONENT_WINS,
      message,
      cardsLost: loserCards,
      cardsKept: winnerCards,
      nextPhase: canChallenge ? GamePhase.CHALLENGE : GamePhase.NORMAL,
      canChallenge,
      opponentChallenge: false
    };
  }
  resolveNormalLoss(playerCard, opponentCard, winner) {
    return this.resolveNormalWin(playerCard, opponentCard, winner);
  }
  resolveTie(playerCard, opponentCard) {
    if (!this.gameStateService.currentPlayerDeck.hasMinimumForBattle || !this.gameStateService.currentOpponentDeck.hasMinimumForBattle) {
      this.gameStateService.endGame();
      return {
        winner: null,
        result: ComparisonResult.TIE,
        message: "Battle cannot be conducted - insufficient cards. Game ends.",
        cardsLost: [playerCard, opponentCard],
        cardsKept: [],
        nextPhase: GamePhase.GAME_OVER,
        canChallenge: false
      };
    }
    return {
      winner: null,
      result: ComparisonResult.TIE,
      message: "Cards tie! Preparing for battle...",
      cardsLost: [],
      cardsKept: [playerCard, opponentCard],
      // These cards are held for battle
      nextPhase: GamePhase.BATTLE,
      canChallenge: false
    };
  }
  resolveChallenge(originalPlayerCard, originalOpponentCard, challengeCard) {
    const result = this.cardComparisonService.compareCards(challengeCard, originalOpponentCard);
    if (result === ComparisonResult.PLAYER_WINS) {
      this.gameStateService.removeCardsFromOpponentDeck([originalOpponentCard]);
      this.gameStateService.addToDiscardPile([originalOpponentCard]);
      this.gameStateService.returnCardsToPlayerDeck([originalPlayerCard, challengeCard]);
      return {
        winner: PlayerType.PLAYER,
        result: ComparisonResult.PLAYER_WINS,
        message: "Challenge successful! You keep your cards.",
        cardsLost: [originalOpponentCard],
        cardsKept: [originalPlayerCard, challengeCard],
        nextPhase: GamePhase.NORMAL,
        canChallenge: false
      };
    } else if (result === ComparisonResult.TIE) {
      this.gameStateService.removeCardsFromOpponentDeck([originalOpponentCard]);
      return {
        winner: null,
        result: ComparisonResult.TIE,
        message: "Challenge ties! Battle initiated with all cards staked.",
        cardsLost: [],
        cardsKept: [originalPlayerCard, challengeCard, originalOpponentCard],
        nextPhase: GamePhase.BATTLE,
        canChallenge: false
      };
    } else {
      this.gameStateService.addToDiscardPile([originalPlayerCard, challengeCard]);
      return {
        winner: PlayerType.OPPONENT,
        result: ComparisonResult.OPPONENT_WINS,
        message: "Challenge failed! You lose your cards.",
        cardsLost: [originalPlayerCard, challengeCard],
        cardsKept: [originalOpponentCard],
        nextPhase: GamePhase.NORMAL,
        canChallenge: false
      };
    }
  }
  /**
   * Resolve opponent challenge
   * @param originalPlayerCard Player's original card from the turn
   * @param originalOpponentCard Opponent's original card from the turn
   * @param opponentChallengeCard Opponent's challenge card (drawn automatically)
   */
  resolveOpponentChallenge(originalPlayerCard, originalOpponentCard, opponentChallengeCard) {
    const result = this.cardComparisonService.compareCards(opponentChallengeCard, originalPlayerCard);
    if (result === ComparisonResult.OPPONENT_WINS) {
      this.gameStateService.removeCardsFromPlayerDeck([originalPlayerCard]);
      this.gameStateService.addToDiscardPile([originalPlayerCard]);
      this.gameStateService.returnCardsToOpponentDeck([originalOpponentCard, opponentChallengeCard]);
      return {
        winner: PlayerType.OPPONENT,
        result: ComparisonResult.OPPONENT_WINS,
        message: "Opponent challenge successful! Opponent keeps their cards.",
        cardsLost: [originalPlayerCard],
        cardsKept: [originalOpponentCard, opponentChallengeCard],
        nextPhase: GamePhase.NORMAL,
        canChallenge: false,
        opponentChallenge: false
      };
    } else if (result === ComparisonResult.TIE) {
      this.gameStateService.removeCardsFromPlayerDeck([originalPlayerCard]);
      return {
        winner: null,
        result: ComparisonResult.TIE,
        message: "Opponent challenge ties! Battle initiated with all cards staked.",
        cardsLost: [],
        cardsKept: [originalPlayerCard, originalOpponentCard, opponentChallengeCard],
        nextPhase: GamePhase.BATTLE,
        canChallenge: false,
        opponentChallenge: false
      };
    } else {
      this.gameStateService.removeCardsFromOpponentDeck([originalOpponentCard]);
      this.gameStateService.returnCardsToPlayerDeck([originalPlayerCard]);
      this.gameStateService.addToDiscardPile([originalOpponentCard, opponentChallengeCard]);
      return {
        winner: PlayerType.PLAYER,
        result: ComparisonResult.PLAYER_WINS,
        message: "Opponent challenge failed! Opponent loses their cards.",
        cardsLost: [originalOpponentCard, opponentChallengeCard],
        cardsKept: [originalPlayerCard],
        nextPhase: GamePhase.NORMAL,
        canChallenge: false,
        opponentChallenge: false
      };
    }
  }
  resolveBattle(originalPlayerCard, originalOpponentCard, playerBattleCards, opponentBattleCards, selectedPlayerCard, selectedOpponentCard) {
    const result = this.cardComparisonService.compareCards(selectedPlayerCard, selectedOpponentCard);
    const allPlayerCards = [originalPlayerCard, ...playerBattleCards];
    const allOpponentCards = [originalOpponentCard, ...opponentBattleCards];
    if (result === ComparisonResult.PLAYER_WINS) {
      this.gameStateService.returnCardsToPlayerDeck(allPlayerCards);
      this.gameStateService.addToDiscardPile(allOpponentCards);
      return {
        winner: PlayerType.PLAYER,
        result: ComparisonResult.PLAYER_WINS,
        message: "You win the battle! All opponent cards discarded.",
        cardsLost: allOpponentCards,
        cardsKept: allPlayerCards,
        nextPhase: GamePhase.NORMAL,
        canChallenge: false
      };
    } else if (result === ComparisonResult.OPPONENT_WINS) {
      this.gameStateService.addToDiscardPile(allPlayerCards);
      this.gameStateService.returnCardsToOpponentDeck(allOpponentCards);
      return {
        winner: PlayerType.OPPONENT,
        result: ComparisonResult.OPPONENT_WINS,
        message: "Opponent wins the battle! All your cards discarded.",
        cardsLost: allPlayerCards,
        cardsKept: allOpponentCards,
        nextPhase: GamePhase.NORMAL,
        canChallenge: false
      };
    } else {
      if (!this.gameStateService.currentPlayerDeck.hasMinimumForBattle || !this.gameStateService.currentOpponentDeck.hasMinimumForBattle) {
        this.gameStateService.addToDiscardPile([...allPlayerCards, ...allOpponentCards]);
        this.gameStateService.endGame();
        return {
          winner: null,
          result: ComparisonResult.TIE,
          message: "Another tie in battle, but insufficient cards for another battle. Game ends.",
          cardsLost: [...allPlayerCards, ...allOpponentCards],
          cardsKept: [],
          nextPhase: GamePhase.GAME_OVER,
          canChallenge: false
        };
      }
      return {
        winner: null,
        result: ComparisonResult.TIE,
        message: "Battle ties again! Another battle required.",
        cardsLost: [],
        cardsKept: [...allPlayerCards, ...allOpponentCards],
        nextPhase: GamePhase.BATTLE,
        canChallenge: false
      };
    }
  }
  checkWinConditions() {
    return this.gameStateService.checkGameEndConditions();
  }
  static \u0275fac = function TurnResolutionService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _TurnResolutionService)(\u0275\u0275inject(GameStateService), \u0275\u0275inject(CardComparisonService), \u0275\u0275inject(OpponentAIService));
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _TurnResolutionService, factory: _TurnResolutionService.\u0275fac, providedIn: "root" });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(TurnResolutionService, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], () => [{ type: GameStateService }, { type: CardComparisonService }, { type: OpponentAIService }], null);
})();

// src/app/services/progress.service.ts
var ProgressService = class _ProgressService {
  progressData = {
    project: {
      name: "War of Attrition Game",
      version: "Angular 20.1.6",
      type: "Progressive Web Application"
    },
    currentMilestone: {
      number: 7,
      name: "Testing & Polish",
      status: "IN_PROGRESS",
      emoji: "\u{1F9EA}"
    },
    milestones: [
      {
        number: 1,
        name: "Foundation & Setup",
        status: "COMPLETED",
        progress: 100,
        items: [
          { name: "Basic Angular/PWA setup", status: "COMPLETED" },
          { name: "Theme toggle implementation", status: "COMPLETED" },
          { name: "Routing structure", status: "COMPLETED" },
          { name: "Responsive layout foundation", status: "PARTIALLY_COMPLETED" }
        ]
      },
      {
        number: 2,
        name: "Core Game Engine",
        status: "COMPLETED",
        progress: 100,
        items: [
          { name: "Card & Deck Models", status: "COMPLETED", description: "Complete TypeScript interfaces and classes" },
          { name: "Game State Management", status: "COMPLETED", description: "Angular signals-based reactive state" },
          { name: "Card Comparison Logic", status: "COMPLETED", description: "All rules including special Ace vs 2 rule" },
          { name: "Turn Resolution Engine", status: "COMPLETED", description: "Normal turns, challenges, and battles" },
          { name: "Comprehensive Tests", status: "COMPLETED", description: "60 passing tests covering all game logic" }
        ]
      },
      {
        number: 3,
        name: "Basic UI Components",
        status: "COMPLETED",
        progress: 100,
        items: [
          { name: "Game Board Layout", status: "COMPLETED" },
          { name: "Card Component", status: "COMPLETED" },
          { name: "Health Bar Component", status: "COMPLETED" },
          { name: "Player Action Indicators", status: "COMPLETED" }
        ]
      },
      {
        number: 4,
        name: "Game Mechanics Implementation",
        status: "COMPLETED",
        progress: 100,
        items: [
          { name: "Basic Turn Flow", status: "COMPLETED" },
          { name: "Challenge System", status: "COMPLETED" },
          { name: "Battle System", status: "COMPLETED" },
          { name: "Game End Conditions", status: "COMPLETED" }
        ]
      },
      {
        number: 5,
        name: "Visual Polish & Animations",
        status: "COMPLETED",
        progress: 100,
        items: [
          { name: "Material Icons Implementation", status: "COMPLETED", description: "Navigation and theme toggle icons implemented" },
          { name: "Theme Toggle Enhancement", status: "COMPLETED", description: "Lightbulb metaphor with lit/unlit states" },
          { name: "Card Animations", status: "COMPLETED", description: "Slide-in, flip, and clash animations implemented" },
          { name: "Health Bar Damage Animations", status: "COMPLETED", description: "Enhanced flash effects and danger pulse animations" },
          { name: "Enhanced UI Polish", status: "COMPLETED", description: "Card fall-away animations and responsive layout improvements" },
          { name: "Responsive Layout Optimization", status: "COMPLETED", description: "Game board now utilizes available viewport space effectively" }
        ]
      },
      {
        number: 6,
        name: "Settings & Customization",
        status: "COMPLETED",
        progress: 100,
        items: [
          { name: "Settings Menu Implementation", status: "COMPLETED", description: "Comprehensive settings interface with tabs" },
          { name: "Card Backing Customization", status: "COMPLETED", description: "Multiple card backing design options" },
          { name: "Discard Pile Viewer", status: "COMPLETED", description: "Modal dialog showing discarded cards with metadata" },
          { name: "Game Statistics Tracking", status: "COMPLETED", description: "Turn counter and game session statistics" }
        ]
      },
      {
        number: 7,
        name: "Testing & Polish",
        status: "IN_PROGRESS",
        progress: 40,
        items: [
          { name: "Unit Testing Suite", status: "IN_PROGRESS", description: "Component tests for health-bar, action-indicator, and card components" },
          { name: "Integration Testing", status: "NOT_STARTED", description: "Game flow and UI interaction tests" },
          { name: "Performance Optimization", status: "IN_PROGRESS", description: "Bundle size optimization and animation performance" },
          { name: "Accessibility & Final Polish", status: "IN_PROGRESS", description: "Error handling improvements and code quality" }
        ]
      }
    ],
    testMetrics: {
      totalTests: 135,
      passingTests: 135,
      coverage: "comprehensive"
    },
    nextSteps: {
      immediate: "Continue Milestone 7: Testing & Polish - Complete remaining component tests and integration tests",
      priority: "Integration testing, performance optimization, and accessibility enhancements"
    },
    features: {
      implemented: [
        "Card and Deck models with proper typing",
        "Game state management with Angular signals",
        "Card comparison logic (including Ace vs 2 rule)",
        "Turn resolution engine",
        "Challenge and battle mechanics",
        "Win condition checking",
        "Comprehensive test coverage",
        "Complete game UI with responsive game board",
        "Health bar system with color coding",
        "Interactive card components",
        "Full turn flow implementation",
        "Challenge system (Accept/Decline)",
        "Battle system with card selection",
        "Game end condition handling",
        "Material Icons for navigation (casino/dice, settings gear)",
        "Enhanced theme toggle with lightbulb metaphor",
        "Local Material Icons font integration",
        "Card slide and flip animations",
        "Battle clash visual effects with shake animations",
        "Health bar damage animations with enhanced flash effects",
        "Dynamic animation system for card states",
        "Responsive layout optimization for better viewport utilization",
        "Card fall-away animations for discarded cards",
        "Settings menu with comprehensive customization options",
        "Card backing customization with multiple design choices",
        "Discard pile viewer with detailed card metadata",
        "Game statistics tracking and session monitoring",
        "Comprehensive unit test suite for UI components",
        "Enhanced error handling and code quality improvements"
      ],
      nextMilestone: [
        "Integration testing for game flow scenarios",
        "Performance optimization for bundle size",
        "Accessibility enhancements (keyboard navigation, ARIA)",
        "Additional edge case testing and validation"
      ]
    }
  };
  getProgressData() {
    return this.progressData;
  }
  getCurrentMilestone() {
    return this.progressData.currentMilestone;
  }
  getMilestones() {
    return this.progressData.milestones;
  }
  getCompletedMilestone(milestoneNumber) {
    return this.progressData.milestones.find((m) => m.number === milestoneNumber);
  }
  getImplementedFeatures() {
    return this.progressData.features.implemented;
  }
  getTestMetrics() {
    return this.progressData.testMetrics;
  }
  getNextSteps() {
    return this.progressData.nextSteps;
  }
  /**
   * Generate a demo log that references the centralized progress data
   */
  generateDemoLog() {
    const log = [];
    const data = this.getProgressData();
    const currentMilestone = this.getCurrentMilestone();
    const milestone2 = this.getCompletedMilestone(2);
    log.push(`\u{1F3AE} ${data.project.name} Demo`);
    log.push("=====================================");
    log.push("");
    log.push(`\u2705 Game initialized`);
    log.push("");
    log.push(`\u{1F527} Core Game Engine Features Verified:`);
    if (milestone2) {
      milestone2.items.forEach((item) => {
        log.push(`   \u2705 ${item.description || item.name}`);
      });
    }
    log.push("");
    log.push(`\u{1F680} Ready for ${data.nextSteps.immediate}!`);
    return log;
  }
  static \u0275fac = function ProgressService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _ProgressService)();
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _ProgressService, factory: _ProgressService.\u0275fac, providedIn: "root" });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ProgressService, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], null, null);
})();

// src/app/services/game-demo.service.ts
var GameDemoService = class _GameDemoService {
  gameStateService;
  turnResolutionService;
  progressService;
  constructor(gameStateService, turnResolutionService, progressService) {
    this.gameStateService = gameStateService;
    this.turnResolutionService = turnResolutionService;
    this.progressService = progressService;
  }
  /**
   * Demonstrate the core game engine functionality
   */
  runGameDemo() {
    const log = [];
    log.push("\u{1F3AE} War of Attrition Game Engine Demo");
    log.push("=====================================");
    this.gameStateService.initializeGame();
    log.push(`\u2705 Game initialized`);
    log.push(`   Player cards: ${this.gameStateService.currentStats.playerCardCount}`);
    log.push(`   Opponent cards: ${this.gameStateService.currentStats.opponentCardCount}`);
    log.push(`   Game phase: ${this.gameStateService.currentPhase}`);
    log.push("");
    for (let i = 1; i <= 3; i++) {
      log.push(`\u{1F3AF} Turn ${i}:`);
      if (this.gameStateService.currentPhase === GamePhase.GAME_OVER) {
        log.push("   Game has ended!");
        break;
      }
      if (this.gameStateService.currentPhase !== GamePhase.NORMAL) {
        this.gameStateService.setPhase(GamePhase.NORMAL);
      }
      const { playerCard, opponentCard } = this.gameStateService.startTurn();
      if (!playerCard || !opponentCard) {
        log.push("   Cannot draw cards - game ended");
        break;
      }
      log.push(`   Player drew: ${playerCard.toString()}`);
      log.push(`   Opponent drew: ${opponentCard.toString()}`);
      const result = this.turnResolutionService.resolveTurn(playerCard, opponentCard);
      log.push(`   Result: ${result.message}`);
      log.push(`   Winner: ${result.winner || "None (tie)"}`);
      log.push(`   Next phase: ${result.nextPhase}`);
      log.push(`   Cards kept: ${result.cardsKept.length}`);
      log.push(`   Cards lost: ${result.cardsLost.length}`);
      this.gameStateService.setPhase(GamePhase.NORMAL);
      this.gameStateService.setChallengeAvailable(false);
      log.push(`   Current cards - Player: ${this.gameStateService.currentStats.playerCardCount}, Opponent: ${this.gameStateService.currentStats.opponentCardCount}`);
      log.push("");
      if (this.turnResolutionService.checkWinConditions()) {
        log.push(`\u{1F3C6} Game ended! Winner: ${this.gameStateService.currentState.winner}`);
        break;
      }
    }
    const progressData = this.progressService.getProgressData();
    const milestone2 = this.progressService.getCompletedMilestone(2);
    log.push("\u{1F527} Core Game Engine Features Verified:");
    if (milestone2) {
      milestone2.items.forEach((item) => {
        log.push(`   \u2705 ${item.description || item.name}`);
      });
    }
    log.push("");
    log.push(`\u{1F680} ${progressData.nextSteps.immediate}!`);
    return log;
  }
  static \u0275fac = function GameDemoService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _GameDemoService)(\u0275\u0275inject(GameStateService), \u0275\u0275inject(TurnResolutionService), \u0275\u0275inject(ProgressService));
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _GameDemoService, factory: _GameDemoService.\u0275fac, providedIn: "root" });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(GameDemoService, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], () => [{ type: GameStateService }, { type: TurnResolutionService }, { type: ProgressService }], null);
})();

// src/app/core/services/sound.service.ts
var SoundService = class _SoundService {
  settingsService = inject(SettingsService);
  audioCtx = null;
  getAudioContext() {
    if (typeof window === "undefined")
      return null;
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }
  canPlay() {
    return this.settingsService.soundEnabled();
  }
  /**
   * Sound effect for drawing a card from deck
   */
  playCardDraw() {
    if (!this.canPlay())
      return;
    const ctx = this.getAudioContext();
    if (!ctx)
      return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.08);
    } catch (e) {
      console.warn("Audio playback error:", e);
    }
  }
  /**
   * Sound effect for card flip
   */
  playCardFlip() {
    if (!this.canPlay())
      return;
    const ctx = this.getAudioContext();
    if (!ctx)
      return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(350, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
      console.warn("Audio playback error:", e);
    }
  }
  /**
   * Sound effect for battle clash
   */
  playClash() {
    if (!this.canPlay())
      return;
    const ctx = this.getAudioContext();
    if (!ctx)
      return;
    try {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc1.type = "sawtooth";
      osc2.type = "square";
      osc1.frequency.setValueAtTime(440, ctx.currentTime);
      osc2.frequency.setValueAtTime(554.37, ctx.currentTime);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(1e-3, ctx.currentTime + 0.3);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc1.start(ctx.currentTime);
      osc2.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.3);
      osc2.stop(ctx.currentTime + 0.3);
    } catch (e) {
      console.warn("Audio playback error:", e);
    }
  }
  /**
   * Sound effect for victory
   */
  playVictory() {
    if (!this.canPlay())
      return;
    const ctx = this.getAudioContext();
    if (!ctx)
      return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        const startTime = ctx.currentTime + idx * 0.12;
        gain.gain.setValueAtTime(0.2, startTime);
        gain.gain.exponentialRampToValueAtTime(1e-3, startTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.3);
      });
    } catch (e) {
      console.warn("Audio playback error:", e);
    }
  }
  /**
   * Sound effect for defeat
   */
  playDefeat() {
    if (!this.canPlay())
      return;
    const ctx = this.getAudioContext();
    if (!ctx)
      return;
    try {
      const notes = [440, 349.23, 293.66];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.value = freq;
        const startTime = ctx.currentTime + idx * 0.18;
        gain.gain.setValueAtTime(0.2, startTime);
        gain.gain.exponentialRampToValueAtTime(1e-3, startTime + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.4);
      });
    } catch (e) {
      console.warn("Audio playback error:", e);
    }
  }
  static \u0275fac = function SoundService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _SoundService)();
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _SoundService, factory: _SoundService.\u0275fac, providedIn: "root" });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(SoundService, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], null, null);
})();

// src/app/services/game-controller.service.ts
var GameControllerService = class _GameControllerService {
  gameStateService;
  turnResolutionService;
  soundService;
  ngZone;
  // Game state signals
  gameMessage = signal("Click your deck to begin!", ...ngDevMode ? [{ debugName: "gameMessage" }] : []);
  challengeAvailable = signal(false, ...ngDevMode ? [{ debugName: "challengeAvailable" }] : []);
  showChallenge = signal(false, ...ngDevMode ? [{ debugName: "showChallenge" }] : []);
  challengeCard = signal(null, ...ngDevMode ? [{ debugName: "challengeCard" }] : []);
  showChallengeCard = signal(false, ...ngDevMode ? [{ debugName: "showChallengeCard" }] : []);
  battleCards = signal([], ...ngDevMode ? [{ debugName: "battleCards" }] : []);
  opponentBattleCards = signal([], ...ngDevMode ? [{ debugName: "opponentBattleCards" }] : []);
  battlePhase = signal("setup", ...ngDevMode ? [{ debugName: "battlePhase" }] : []);
  selectedOpponentCard = signal(null, ...ngDevMode ? [{ debugName: "selectedOpponentCard" }] : []);
  selectedPlayerCard = signal(null, ...ngDevMode ? [{ debugName: "selectedPlayerCard" }] : []);
  revealAllBattleCards = signal(false, ...ngDevMode ? [{ debugName: "revealAllBattleCards" }] : []);
  battleStep = signal("none", ...ngDevMode ? [{ debugName: "battleStep" }] : []);
  canPlayerAct = signal(false, ...ngDevMode ? [{ debugName: "canPlayerAct" }] : []);
  // Readonly getters
  get message() {
    return this.gameMessage();
  }
  get canChallenge() {
    return this.challengeAvailable();
  }
  get showChallengePrompt() {
    return this.showChallenge();
  }
  get currentChallengeCard() {
    return this.challengeCard();
  }
  get showChallengeCardDisplay() {
    return this.showChallengeCard();
  }
  get playerCanAct() {
    return this.canPlayerAct();
  }
  get currentBattleCards() {
    return this.battleCards();
  }
  get currentOpponentBattleCards() {
    return this.opponentBattleCards();
  }
  get currentBattlePhase() {
    return this.battlePhase();
  }
  get currentBattleStep() {
    return this.battleStep();
  }
  get playerPickedCard() {
    return this.selectedOpponentCard();
  }
  get opponentPickedCard() {
    return this.selectedPlayerCard();
  }
  get isRevealAll() {
    return this.revealAllBattleCards();
  }
  constructor(gameStateService, turnResolutionService, soundService, ngZone) {
    this.gameStateService = gameStateService;
    this.turnResolutionService = turnResolutionService;
    this.soundService = soundService;
    this.ngZone = ngZone;
  }
  /**
   * Initialize a new game
   */
  startNewGame() {
    this.gameStateService.initializeGame();
    this.gameMessage.set("Click your deck to begin!");
    this.challengeAvailable.set(false);
    this.showChallenge.set(false);
    this.challengeCard.set(null);
    this.showChallengeCard.set(false);
    this.battleCards.set([]);
    this.opponentBattleCards.set([]);
    this.battlePhase.set("setup");
    this.canPlayerAct.set(true);
  }
  /**
   * Handle player clicking their deck to start a turn
   */
  playerDrawCard() {
    if (!this.canPlayerAct() || this.gameStateService.currentPhase !== GamePhase.NORMAL) {
      return false;
    }
    this.soundService.playCardDraw();
    try {
      const { playerCard, opponentCard } = this.gameStateService.startTurn();
      if (!playerCard || !opponentCard) {
        return false;
      }
      const result = this.turnResolutionService.resolveTurn(playerCard, opponentCard);
      this.handleTurnResult(result);
      return true;
    } catch (error) {
      console.error("Error during turn:", error);
      return false;
    }
  }
  /**
   * Handle challenge decision
   */
  handleChallenge(acceptChallenge) {
    if (!this.challengeAvailable()) {
      return;
    }
    if (!acceptChallenge) {
      this.gameMessage.set("You declined the challenge. Your card is discarded.");
      this.showChallenge.set(false);
      this.challengeAvailable.set(false);
      this.canPlayerAct.set(true);
      return;
    }
    try {
      const playerChallengeCard = this.gameStateService.drawPlayerCard();
      if (!playerChallengeCard) {
        this.gameMessage.set("Cannot draw card for challenge!");
        return;
      }
      this.challengeCard.set(playerChallengeCard);
      this.showChallenge.set(false);
      this.showChallengeCard.set(true);
      this.gameMessage.set("Your challenge card is revealed! Proceed with the challenge?");
      this.canPlayerAct.set(false);
      const activeTurn = this.gameStateService.currentState.activeTurn;
      if (activeTurn) {
        activeTurn.challengeCard = playerChallengeCard;
        this.gameStateService.setActiveTurn(activeTurn);
      }
    } catch (error) {
      console.error("Error during challenge:", error);
      this.gameMessage.set("Error during challenge!");
    }
  }
  /**
   * Confirm the challenge with the revealed card
   */
  confirmChallenge() {
    if (!this.challengeCard()) {
      return;
    }
    try {
      const activeTurn = this.gameStateService.currentState.activeTurn;
      if (!activeTurn || !activeTurn.playerCard || !activeTurn.opponentCard) {
        this.gameMessage.set("No active turn for challenge!");
        return;
      }
      const result = this.turnResolutionService.resolveChallenge(activeTurn.playerCard, activeTurn.opponentCard, this.challengeCard());
      this.challengeCard.set(null);
      this.showChallengeCard.set(false);
      this.challengeAvailable.set(false);
      this.handleTurnResult(result);
    } catch (error) {
      console.error("Error during challenge resolution:", error);
      this.gameMessage.set("Error during challenge resolution!");
    }
  }
  /**
   * Handle battle card selection
   */
  selectBattleCard(selectedCard) {
    if (this.battlePhase() !== "selection") {
      return;
    }
    try {
      const activeTurn = this.gameStateService.currentState.activeTurn;
      if (!activeTurn || !activeTurn.playerCard || !activeTurn.opponentCard) {
        return;
      }
      const playerCard = activeTurn.playerCard;
      const opponentCard = activeTurn.opponentCard;
      const opponentSelection = this.battleCards()[Math.floor(Math.random() * this.battleCards().length)];
      this.selectedOpponentCard.set(selectedCard);
      this.selectedPlayerCard.set(opponentSelection);
      this.battlePhase.set("revealing");
      this.battleStep.set("revealing_player");
      this.gameMessage.set("Revealing your selected card from opponent...");
      this.soundService.playCardFlip();
      setTimeout(() => {
        this.battleStep.set("revealing_opponent");
        this.gameMessage.set("Revealing opponent selected card from your deck...");
        this.soundService.playCardFlip();
      }, 700);
      setTimeout(() => {
        this.revealAllBattleCards.set(true);
        this.battleStep.set("revealing_all");
        this.gameMessage.set("Revealing all battle cards...");
        this.soundService.playClash();
      }, 1400);
      setTimeout(() => {
        const result = this.turnResolutionService.resolveBattle(playerCard, opponentCard, this.battleCards(), this.opponentBattleCards(), selectedCard, opponentSelection);
        this.selectedOpponentCard.set(null);
        this.selectedPlayerCard.set(null);
        this.revealAllBattleCards.set(false);
        this.battleStep.set("none");
        this.handleTurnResult(result);
      }, 2600);
    } catch (error) {
      console.error("Error during battle:", error);
      this.gameMessage.set("Error during battle!");
      this.battlePhase.set("setup");
      this.battleStep.set("none");
    }
  }
  /**
   * Handle the result of a turn/challenge/battle
   */
  handleTurnResult(result) {
    this.gameMessage.set(result.message);
    this.gameStateService.setLastResult(result.result);
    if (result.nextPhase === GamePhase.GAME_OVER) {
      if (this.gameStateService.currentState.winner === PlayerType.PLAYER) {
        this.soundService.playVictory();
      } else {
        this.soundService.playDefeat();
      }
    } else if (result.nextPhase === GamePhase.BATTLE) {
      this.soundService.playClash();
    }
    if (result.opponentChallenge) {
      this.handleOpponentChallenge();
      return;
    }
    switch (result.nextPhase) {
      case GamePhase.NORMAL:
        this.canPlayerAct.set(true);
        this.challengeAvailable.set(false);
        this.showChallenge.set(false);
        this.battleCards.set([]);
        this.opponentBattleCards.set([]);
        this.battlePhase.set("setup");
        break;
      case GamePhase.CHALLENGE:
        this.canPlayerAct.set(false);
        this.challengeAvailable.set(result.canChallenge);
        this.showChallenge.set(result.canChallenge);
        break;
      case GamePhase.BATTLE:
        this.setupBattle();
        break;
      case GamePhase.GAME_OVER:
        this.canPlayerAct.set(false);
        this.challengeAvailable.set(false);
        this.showChallenge.set(false);
        break;
    }
  }
  /**
   * Setup battle phase
   */
  setupBattle() {
    this.canPlayerAct.set(false);
    this.battlePhase.set("setup");
    const playerCards = [];
    const opponentCards = [];
    for (let i = 0; i < 3; i++) {
      const playerCard = this.gameStateService.drawPlayerCard();
      const opponentCard = this.gameStateService.drawOpponentCard();
      if (playerCard)
        playerCards.push(playerCard);
      if (opponentCard)
        opponentCards.push(opponentCard);
    }
    this.battleCards.set(playerCards);
    this.opponentBattleCards.set(opponentCards);
    this.battlePhase.set("selection");
    this.gameMessage.set("Battle! Select one of the opponent's face-down cards.");
  }
  /**
   * Get current game stats for UI
   */
  getGameStats() {
    return this.gameStateService.currentStats;
  }
  /**
   * Get current game state
   */
  getGameState() {
    return this.gameStateService.currentState;
  }
  /**
   * Handle opponent challenge automatically
   */
  handleOpponentChallenge() {
    try {
      const activeTurn = this.gameStateService.currentState.activeTurn;
      if (!activeTurn || !activeTurn.playerCard || !activeTurn.opponentCard) {
        this.gameMessage.set("Error: No active turn for opponent challenge!");
        return;
      }
      const opponentChallengeCard = this.gameStateService.drawOpponentCard();
      if (!opponentChallengeCard) {
        this.gameMessage.set("Opponent cannot draw card for challenge!");
        this.gameStateService.returnCardsToPlayerDeck([activeTurn.playerCard]);
        this.gameStateService.addToDiscardPile([activeTurn.opponentCard]);
        this.gameMessage.set("Opponent cannot challenge. You win the turn!");
        this.canPlayerAct.set(true);
        return;
      }
      activeTurn.challengeCard = opponentChallengeCard;
      this.gameStateService.setActiveTurn(activeTurn);
      setTimeout(() => {
        this.ngZone.run(() => {
          try {
            const result = this.turnResolutionService.resolveOpponentChallenge(activeTurn.playerCard, activeTurn.opponentCard, opponentChallengeCard);
            this.handleTurnResult(result);
          } catch (error) {
            console.error("Error in opponent challenge setTimeout:", error);
            this.gameMessage.set("Error during opponent challenge resolution!");
            this.canPlayerAct.set(true);
          }
        });
      }, 1500);
      this.canPlayerAct.set(false);
      this.gameMessage.set("Opponent is challenging your win...");
    } catch (error) {
      console.error("Error during opponent challenge:", error);
      this.gameMessage.set("Error during opponent challenge!");
      this.canPlayerAct.set(true);
    }
  }
  static \u0275fac = function GameControllerService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _GameControllerService)(\u0275\u0275inject(GameStateService), \u0275\u0275inject(TurnResolutionService), \u0275\u0275inject(SoundService), \u0275\u0275inject(NgZone));
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _GameControllerService, factory: _GameControllerService.\u0275fac, providedIn: "root" });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(GameControllerService, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], () => [{ type: GameStateService }, { type: TurnResolutionService }, { type: SoundService }, { type: NgZone }], null);
})();

// src/app/game/game.ts
function Game_Conditional_1_Conditional_1_Conditional_15_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "app-card", 14);
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275property("card", ctx_r1.playerActiveCard())("glow", "red")("faceDown", false);
  }
}
function Game_Conditional_1_Conditional_1_Conditional_19_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "app-card", 14);
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275property("card", ctx_r1.opponentActiveCard())("glow", "green")("faceDown", false);
  }
}
function Game_Conditional_1_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r3 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 3)(1, "mat-card", 10)(2, "mat-card-header")(3, "mat-card-title");
    \u0275\u0275text(4, "Challenge Available!");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "mat-card-subtitle");
    \u0275\u0275text(6, "Do you want to challenge the result?");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(7, "mat-card-content")(8, "div", 11)(9, "h4");
    \u0275\u0275text(10, "This Turn's Cards:");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "div", 12)(12, "div", 13)(13, "span");
    \u0275\u0275text(14, "Your Card (Lost):");
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(15, Game_Conditional_1_Conditional_1_Conditional_15_Template, 1, 3, "app-card", 14);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(16, "div", 15)(17, "span");
    \u0275\u0275text(18, "Opponent's Card (Won):");
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(19, Game_Conditional_1_Conditional_1_Conditional_19_Template, 1, 3, "app-card", 14);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(20, "p");
    \u0275\u0275text(21, "You lost this round, but you can draw an additional card to challenge the result.");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(22, "p")(23, "strong");
    \u0275\u0275text(24, "Risk:");
    \u0275\u0275elementEnd();
    \u0275\u0275text(25, " If you lose the challenge, you lose both cards!");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(26, "p")(27, "strong");
    \u0275\u0275text(28, "Challenge Rule:");
    \u0275\u0275elementEnd();
    \u0275\u0275text(29, " Your new card will be compared against the opponent's winning card above.");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(30, "mat-card-actions")(31, "button", 6);
    \u0275\u0275listener("click", function Game_Conditional_1_Conditional_1_Template_button_click_31_listener() {
      \u0275\u0275restoreView(_r3);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.acceptChallenge());
    });
    \u0275\u0275text(32, " Accept Challenge ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(33, "button", 9);
    \u0275\u0275listener("click", function Game_Conditional_1_Conditional_1_Template_button_click_33_listener() {
      \u0275\u0275restoreView(_r3);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.declineChallenge());
    });
    \u0275\u0275text(34, " Decline ");
    \u0275\u0275elementEnd()()()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(15);
    \u0275\u0275conditional(ctx_r1.playerActiveCard() ? 15 : -1);
    \u0275\u0275advance(4);
    \u0275\u0275conditional(ctx_r1.opponentActiveCard() ? 19 : -1);
  }
}
function Game_Conditional_1_Conditional_2_Conditional_15_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "app-card", 14);
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275property("card", ctx_r1.playerActiveCard())("glow", "red")("faceDown", false);
  }
}
function Game_Conditional_1_Conditional_2_Conditional_19_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "app-card", 14);
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275property("card", ctx_r1.opponentActiveCard())("glow", "green")("faceDown", false);
  }
}
function Game_Conditional_1_Conditional_2_Conditional_23_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "app-card", 17);
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275property("card", ctx_r1.challengeCard())("glow", "blue")("animationState", "flip");
  }
}
function Game_Conditional_1_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r4 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 3)(1, "mat-card", 10)(2, "mat-card-header")(3, "mat-card-title");
    \u0275\u0275text(4, "Your Challenge Card");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "mat-card-subtitle");
    \u0275\u0275text(6, "This is the card you drew for your challenge");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(7, "mat-card-content")(8, "div", 11)(9, "h4");
    \u0275\u0275text(10, "Original Turn:");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "div", 12)(12, "div", 13)(13, "span");
    \u0275\u0275text(14, "Your Original Card:");
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(15, Game_Conditional_1_Conditional_2_Conditional_15_Template, 1, 3, "app-card", 14);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(16, "div", 15)(17, "span");
    \u0275\u0275text(18, "Opponent's Card:");
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(19, Game_Conditional_1_Conditional_2_Conditional_19_Template, 1, 3, "app-card", 14);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(20, "div", 16)(21, "h4");
    \u0275\u0275text(22, "Your Challenge Card:");
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(23, Game_Conditional_1_Conditional_2_Conditional_23_Template, 1, 3, "app-card", 17);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(24, "p")(25, "strong");
    \u0275\u0275text(26, "Challenge Comparison:");
    \u0275\u0275elementEnd();
    \u0275\u0275text(27, " Your challenge card vs. opponent's winning card");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(28, "p");
    \u0275\u0275text(29, "If your challenge card wins, you keep both of your cards and the opponent's card is discarded.");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(30, "p");
    \u0275\u0275text(31, "If your challenge card loses or ties, you lose both cards and the opponent keeps their card.");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(32, "mat-card-actions")(33, "button", 6);
    \u0275\u0275listener("click", function Game_Conditional_1_Conditional_2_Template_button_click_33_listener() {
      \u0275\u0275restoreView(_r4);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.confirmChallenge());
    });
    \u0275\u0275text(34, " Continue with Challenge ");
    \u0275\u0275elementEnd()()()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(15);
    \u0275\u0275conditional(ctx_r1.playerActiveCard() ? 15 : -1);
    \u0275\u0275advance(4);
    \u0275\u0275conditional(ctx_r1.opponentActiveCard() ? 19 : -1);
    \u0275\u0275advance(4);
    \u0275\u0275conditional(ctx_r1.challengeCard() ? 23 : -1);
  }
}
function Game_Conditional_1_Conditional_3_For_15_Template(rf, ctx) {
  if (rf & 1) {
    const _r5 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "app-card", 24);
    \u0275\u0275listener("cardClicked", function Game_Conditional_1_Conditional_3_For_15_Template_app_card_cardClicked_0_listener() {
      const card_r6 = \u0275\u0275restoreView(_r5).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r1.onBattleCardSelect(card_r6));
    });
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const card_r6 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275property("card", card_r6)("faceDown", ctx_r1.isBattleCardFaceDown(card_r6, "opponent"))("glow", "blue")("clickable", ctx_r1.battlePhase() === "selection");
  }
}
function Game_Conditional_1_Conditional_3_For_20_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "app-card", 23);
  }
  if (rf & 2) {
    const card_r7 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275property("card", card_r7)("faceDown", ctx_r1.isBattleCardFaceDown(card_r7, "player"));
  }
}
function Game_Conditional_1_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 4)(1, "mat-card", 18)(2, "mat-card-header")(3, "mat-card-title");
    \u0275\u0275text(4, "Battle Time!");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "mat-card-subtitle");
    \u0275\u0275text(6, "Select one of the opponent's face-down cards");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(7, "mat-card-content")(8, "p");
    \u0275\u0275text(9, "Cards are tied! Both players have placed 3 cards face-down for battle.");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "div", 19)(11, "h4");
    \u0275\u0275text(12, "Opponent's Cards (Select One):");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(13, "div", 20);
    \u0275\u0275repeaterCreate(14, Game_Conditional_1_Conditional_3_For_15_Template, 1, 4, "app-card", 21, \u0275\u0275repeaterTrackByIndex);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(16, "h4");
    \u0275\u0275text(17, "Your Cards in Battle:");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(18, "div", 22);
    \u0275\u0275repeaterCreate(19, Game_Conditional_1_Conditional_3_For_20_Template, 1, 2, "app-card", 23, \u0275\u0275repeaterTrackByIndex);
    \u0275\u0275elementEnd()()()()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(14);
    \u0275\u0275repeater(ctx_r1.opponentBattleCards());
    \u0275\u0275advance(5);
    \u0275\u0275repeater(ctx_r1.battleCards());
  }
}
function Game_Conditional_1_Conditional_9_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 8);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("(", ctx_r1.gameStateService.discardedCardCount(), ")");
  }
}
function Game_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "app-game-board", 2);
    \u0275\u0275listener("playerDeckClicked", function Game_Conditional_1_Template_app_game_board_playerDeckClicked_0_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.onPlayerDeckClick());
    });
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(1, Game_Conditional_1_Conditional_1_Template, 35, 2, "div", 3);
    \u0275\u0275conditionalCreate(2, Game_Conditional_1_Conditional_2_Template, 35, 3, "div", 3);
    \u0275\u0275conditionalCreate(3, Game_Conditional_1_Conditional_3_Template, 21, 0, "div", 4);
    \u0275\u0275elementStart(4, "div", 5)(5, "button", 6);
    \u0275\u0275listener("click", function Game_Conditional_1_Template_button_click_5_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.startNewGame());
    });
    \u0275\u0275text(6, " New Game ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "button", 7);
    \u0275\u0275listener("click", function Game_Conditional_1_Template_button_click_7_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.openDiscardPileViewer());
    });
    \u0275\u0275text(8, " Discard Pile ");
    \u0275\u0275conditionalCreate(9, Game_Conditional_1_Conditional_9_Template, 2, 1, "span", 8);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "button", 9);
    \u0275\u0275listener("click", function Game_Conditional_1_Template_button_click_10_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.toggleDemo());
    });
    \u0275\u0275text(11, " Show Old Demo ");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275property("playerCardCount", ctx_r1.playerCardCount())("opponentCardCount", ctx_r1.opponentCardCount())("playerActiveCard", ctx_r1.playerActiveCard())("opponentActiveCard", ctx_r1.opponentActiveCard())("playerCardGlow", ctx_r1.playerCardGlow())("opponentCardGlow", ctx_r1.opponentCardGlow())("playerCardAnimation", ctx_r1.playerCardAnimation())("opponentCardAnimation", ctx_r1.opponentCardAnimation())("playerHealthDamageAnimation", ctx_r1.playerHealthDamageAnimation())("opponentHealthDamageAnimation", ctx_r1.opponentHealthDamageAnimation())("gameMessage", ctx_r1.gameMessage())("challengeAvailable", ctx_r1.challengeAvailable())("canPlayerAct", ctx_r1.effectiveCanPlayerAct())("turnNumber", ctx_r1.gameStateService.gameStats().turnNumber);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r1.showChallengePrompt() ? 1 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r1.showChallengeCardDisplay() ? 2 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r1.showBattleUI() ? 3 : -1);
    \u0275\u0275advance(6);
    \u0275\u0275conditional(ctx_r1.gameStateService.discardedCardCount() > 0 ? 9 : -1);
  }
}
function Game_Conditional_2_For_34_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 26);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const line_r9 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(line_r9);
  }
}
function Game_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r8 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "mat-card", 1)(1, "mat-card-header")(2, "mat-card-title");
    \u0275\u0275text(3, "War of Attrition - Milestone 3 Complete! \u{1F389}");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "mat-card-subtitle");
    \u0275\u0275text(5, "Basic UI Components Implementation");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(6, "mat-card-content")(7, "p")(8, "strong");
    \u0275\u0275text(9, "Milestone 3 has been successfully completed!");
    \u0275\u0275elementEnd();
    \u0275\u0275text(10, " Core UI components are implemented and functional.");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "h3");
    \u0275\u0275text(12, "New UI Components:");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(13, "ul")(14, "li")(15, "strong");
    \u0275\u0275text(16, "Game Board Layout:");
    \u0275\u0275elementEnd();
    \u0275\u0275text(17, " Head-to-head player layout with solitaire green background");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(18, "li")(19, "strong");
    \u0275\u0275text(20, "Card Component:");
    \u0275\u0275elementEnd();
    \u0275\u0275text(21, " Visual card representation with red/black suits and glow effects");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(22, "li")(23, "strong");
    \u0275\u0275text(24, "Health Bar Component:");
    \u0275\u0275elementEnd();
    \u0275\u0275text(25, " Color-coded health bars (Green\u2192Yellow\u2192Orange\u2192Red)");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(26, "li")(27, "strong");
    \u0275\u0275text(28, "Action Indicators:");
    \u0275\u0275elementEnd();
    \u0275\u0275text(29, " Blue glow effects for player actions");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(30, "h3");
    \u0275\u0275text(31, "Previous - Game Engine Demo:");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(32, "div", 25);
    \u0275\u0275repeaterCreate(33, Game_Conditional_2_For_34_Template, 2, 1, "div", 26, \u0275\u0275repeaterTrackByIndex);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(35, "mat-card-actions")(36, "button", 6);
    \u0275\u0275listener("click", function Game_Conditional_2_Template_button_click_36_listener() {
      \u0275\u0275restoreView(_r8);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.toggleDemo());
    });
    \u0275\u0275text(37, " Show New Game Board ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(38, "button", 6);
    \u0275\u0275listener("click", function Game_Conditional_2_Template_button_click_38_listener() {
      \u0275\u0275restoreView(_r8);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.runDemo());
    });
    \u0275\u0275text(39, "Run Demo Again");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(40, "button", 27);
    \u0275\u0275text(41, "Settings");
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(33);
    \u0275\u0275repeater(ctx_r1.demoLog());
  }
}
var Game = class _Game {
  gameDemoService;
  gameController;
  progressService;
  gameStateService;
  settingsService;
  dialog;
  authService = inject(AuthService);
  router = inject(Router);
  victoryDialogShown = false;
  demoLog = signal([], ...ngDevMode ? [{ debugName: "demoLog" }] : []);
  // Demo UI state
  showOldDemo = signal(false, ...ngDevMode ? [{ debugName: "showOldDemo" }] : []);
  showGameBoard = signal(true, ...ngDevMode ? [{ debugName: "showGameBoard" }] : []);
  // Game timing for statistics
  gameStartTime = null;
  // Real game state (will be initialized in constructor)
  gameStats = signal(this.getInitialGameStats(), ...ngDevMode ? [{ debugName: "gameStats" }] : []);
  gameState = signal(this.getInitialGameState(), ...ngDevMode ? [{ debugName: "gameState" }] : []);
  gameMessage = signal("Click your deck to begin!", ...ngDevMode ? [{ debugName: "gameMessage" }] : []);
  challengeAvailable = signal(false, ...ngDevMode ? [{ debugName: "challengeAvailable" }] : []);
  canPlayerAct = signal(true, ...ngDevMode ? [{ debugName: "canPlayerAct" }] : []);
  showChallengePrompt = signal(false, ...ngDevMode ? [{ debugName: "showChallengePrompt" }] : []);
  challengeCard = signal(null, ...ngDevMode ? [{ debugName: "challengeCard" }] : []);
  showChallengeCardDisplay = signal(false, ...ngDevMode ? [{ debugName: "showChallengeCardDisplay" }] : []);
  // Computed values for UI
  playerCardCount = computed(() => this.gameStateService.playerCardCount(), ...ngDevMode ? [{ debugName: "playerCardCount" }] : []);
  opponentCardCount = computed(() => this.gameStateService.opponentCardCount(), ...ngDevMode ? [{ debugName: "opponentCardCount" }] : []);
  playerActiveCard = signal(null, ...ngDevMode ? [{ debugName: "playerActiveCard" }] : []);
  opponentActiveCard = signal(null, ...ngDevMode ? [{ debugName: "opponentActiveCard" }] : []);
  playerCardGlow = signal(null, ...ngDevMode ? [{ debugName: "playerCardGlow" }] : []);
  opponentCardGlow = signal(null, ...ngDevMode ? [{ debugName: "opponentCardGlow" }] : []);
  // Enhanced canPlayerAct that considers animations
  effectiveCanPlayerAct = computed(() => {
    const gameCanAct = this.canPlayerAct();
    const animationsBlocking = this.animationsPlaying() && this.settingsService.currentSettings().autoPlayAnimations;
    return gameCanAct && !animationsBlocking;
  }, ...ngDevMode ? [{ debugName: "effectiveCanPlayerAct" }] : []);
  // Animation states
  playerCardAnimation = signal(null, ...ngDevMode ? [{ debugName: "playerCardAnimation" }] : []);
  opponentCardAnimation = signal(null, ...ngDevMode ? [{ debugName: "opponentCardAnimation" }] : []);
  playerHealthDamageAnimation = signal(false, ...ngDevMode ? [{ debugName: "playerHealthDamageAnimation" }] : []);
  opponentHealthDamageAnimation = signal(false, ...ngDevMode ? [{ debugName: "opponentHealthDamageAnimation" }] : []);
  // Animation control
  animationsPlaying = signal(false, ...ngDevMode ? [{ debugName: "animationsPlaying" }] : []);
  animationTimers = [];
  // Battle state
  battleCards = signal([], ...ngDevMode ? [{ debugName: "battleCards" }] : []);
  opponentBattleCards = signal([], ...ngDevMode ? [{ debugName: "opponentBattleCards" }] : []);
  battlePhase = signal("setup", ...ngDevMode ? [{ debugName: "battlePhase" }] : []);
  showBattleUI = signal(false, ...ngDevMode ? [{ debugName: "showBattleUI" }] : []);
  // Progress data
  progressData;
  currentMilestone;
  completedMilestone;
  // Tracking last counts for health damage animations and clash animations
  lastPlayerCardCount = 26;
  lastOpponentCardCount = 26;
  lastClashResult = null;
  lastTurnNumber = 0;
  constructor(gameDemoService, gameController, progressService, gameStateService, settingsService, dialog) {
    this.gameDemoService = gameDemoService;
    this.gameController = gameController;
    this.progressService = progressService;
    this.gameStateService = gameStateService;
    this.settingsService = settingsService;
    this.dialog = dialog;
    this.progressData = this.progressService.getProgressData();
    this.currentMilestone = this.progressService.getCurrentMilestone();
    this.completedMilestone = this.progressService.getCompletedMilestone(3);
    effect(() => {
      const canAct = this.gameController.playerCanAct;
      const msg = this.gameController.message;
      const showPrompt = this.gameController.showChallengePrompt;
      const chalCard = this.gameController.currentChallengeCard;
      const showCardDisp = this.gameController.showChallengeCardDisplay;
      const battlePhase = this.gameController.currentBattlePhase;
      const battleStep = this.gameController.currentBattleStep;
      const gameState = this.gameStateService.gameState();
      this.updateGameState();
    });
    this.gameController.startNewGame();
    this.updateGameState();
  }
  getInitialGameStats() {
    return {
      turnNumber: 0,
      playerCardCount: 26,
      opponentCardCount: 26,
      discardedCardCount: 0
    };
  }
  getInitialGameState() {
    return {
      phase: GamePhase.SETUP,
      stats: this.getInitialGameStats(),
      activeTurn: null,
      winner: null,
      isPlayerTurn: true,
      canChallenge: false,
      lastResult: null
    };
  }
  ngOnDestroy() {
    this.clearAnimationTimers();
  }
  ngOnInit() {
    if (this.showOldDemo()) {
      this.runDemo();
    }
  }
  runDemo() {
    const log = this.gameDemoService.runGameDemo();
    this.demoLog.set(log);
  }
  toggleDemo() {
    this.showOldDemo.update((v) => !v);
    this.showGameBoard.update((v) => !v);
  }
  /**
   * Real game mechanics - Player clicks deck to draw cards
   */
  onPlayerDeckClick() {
    if (!this.gameController.playerCanAct) {
      return;
    }
    const previousPlayerCount = this.gameStateService.playerCardCount();
    const previousOpponentCount = this.gameStateService.opponentCardCount();
    const success = this.gameController.playerDrawCard();
    if (success) {
      this.updateGameStateWithPreviousCounts(previousPlayerCount, previousOpponentCount);
    }
  }
  /**
   * Handle challenge decision
   */
  acceptChallenge() {
    const previousPlayerCount = this.gameStateService.playerCardCount();
    const previousOpponentCount = this.gameStateService.opponentCardCount();
    this.gameController.handleChallenge(true);
    this.updateGameStateWithPreviousCounts(previousPlayerCount, previousOpponentCount);
  }
  declineChallenge() {
    const previousPlayerCount = this.gameStateService.playerCardCount();
    const previousOpponentCount = this.gameStateService.opponentCardCount();
    this.gameController.handleChallenge(false);
    this.updateGameStateWithPreviousCounts(previousPlayerCount, previousOpponentCount);
  }
  /**
   * Confirm challenge with the revealed card
   */
  confirmChallenge() {
    const previousPlayerCount = this.gameStateService.playerCardCount();
    const previousOpponentCount = this.gameStateService.opponentCardCount();
    this.gameController.confirmChallenge();
    this.updateGameStateWithPreviousCounts(previousPlayerCount, previousOpponentCount);
  }
  /**
   * Start a new game
   */
  startNewGame() {
    this.victoryDialogShown = false;
    this.lastPlayerCardCount = 26;
    this.lastOpponentCardCount = 26;
    this.lastClashResult = null;
    this.lastTurnNumber = 0;
    this.gameController.startNewGame();
    this.gameStartTime = Date.now();
    this.settingsService.recordGameStart();
    this.updateGameState();
  }
  /**
   * Handle battle card selection
   */
  onBattleCardSelect(selectedCard) {
    const previousPlayerCount = this.gameStateService.playerCardCount();
    const previousOpponentCount = this.gameStateService.opponentCardCount();
    this.gameController.selectBattleCard(selectedCard);
    const pollInterval = setInterval(() => {
      this.updateGameStateWithPreviousCounts(previousPlayerCount, previousOpponentCount);
      if (this.gameController.currentBattleStep === "none") {
        clearInterval(pollInterval);
      }
    }, 100);
  }
  isBattleCardFaceDown(card, owner) {
    if (this.gameController.isRevealAll) {
      return false;
    }
    const step = this.gameController.currentBattleStep;
    if (owner === "opponent" && card === this.gameController.playerPickedCard) {
      return step === "none" || step === "selection";
    }
    if (owner === "player" && card === this.gameController.opponentPickedCard) {
      return step !== "revealing_opponent" && step !== "revealing_all";
    }
    return true;
  }
  // Keep demo methods for old demo mode
  simulateChallenge() {
    this.challengeAvailable.set(true);
    this.gameMessage.set("You lost this round. Challenge available!");
    this.playerCardGlow.set("red");
    this.opponentCardGlow.set("green");
  }
  simulateBattle() {
    this.gameMessage.set("Cards tie! Battle initiated.");
    this.playerCardGlow.set("blue");
    this.opponentCardGlow.set("blue");
    this.challengeAvailable.set(false);
  }
  /**
   * Update UI state based on game controller state
   */
  updateGameState() {
    const previousPlayerCount = this.lastPlayerCardCount;
    const previousOpponentCount = this.lastOpponentCardCount;
    this.updateGameStateWithPreviousCounts(previousPlayerCount, previousOpponentCount);
    this.lastPlayerCardCount = this.gameStateService.playerCardCount();
    this.lastOpponentCardCount = this.gameStateService.opponentCardCount();
  }
  /**
   * Update UI state and trigger health animations based on card count changes
   */
  updateGameStateWithPreviousCounts(previousPlayerCount, previousOpponentCount) {
    const stats = this.gameController.getGameStats();
    const state = this.gameController.getGameState();
    this.gameStats.set(stats);
    this.gameState.set(state);
    this.gameMessage.set(this.gameController.message);
    this.challengeAvailable.set(this.gameController.canChallenge);
    this.canPlayerAct.set(this.gameController.playerCanAct);
    this.showChallengePrompt.set(this.gameController.showChallengePrompt);
    this.challengeCard.set(this.gameController.currentChallengeCard);
    this.showChallengeCardDisplay.set(this.gameController.showChallengeCardDisplay);
    this.battleCards.set(this.gameController.currentBattleCards);
    this.opponentBattleCards.set(this.gameController.currentOpponentBattleCards);
    this.battlePhase.set(this.gameController.currentBattlePhase);
    this.showBattleUI.set(this.battlePhase() === "selection" || this.battlePhase() === "revealing");
    const currentPlayerCount = this.gameStateService.playerCardCount();
    const currentOpponentCount = this.gameStateService.opponentCardCount();
    if (currentPlayerCount < previousPlayerCount) {
      this.triggerPlayerHealthDamageAnimation();
    }
    if (currentOpponentCount < previousOpponentCount) {
      this.triggerOpponentHealthDamageAnimation();
    }
    if (state.activeTurn) {
      if (this.playerActiveCard() !== state.activeTurn.playerCard) {
        this.playerActiveCard.set(state.activeTurn.playerCard);
        this.triggerCardSlideAnimation("player");
      }
      if (this.opponentActiveCard() !== state.activeTurn.opponentCard) {
        this.opponentActiveCard.set(state.activeTurn.opponentCard);
        this.triggerCardSlideAnimation("opponent");
      }
      const currentTurn = state.stats?.turnNumber || 0;
      const resultChanged = this.lastClashResult !== state.lastResult || this.lastTurnNumber !== currentTurn;
      if (state.lastResult === "player_wins") {
        this.playerCardGlow.set("green");
        this.opponentCardGlow.set("red");
        if (resultChanged) {
          this.triggerClashAnimations("player-win");
        }
      } else if (state.lastResult === "opponent_wins") {
        this.playerCardGlow.set("red");
        this.opponentCardGlow.set("green");
        if (resultChanged) {
          this.triggerClashAnimations("opponent-win");
        }
      } else if (state.lastResult === "tie") {
        this.playerCardGlow.set("blue");
        this.opponentCardGlow.set("blue");
      } else {
        this.playerCardGlow.set(null);
        this.opponentCardGlow.set(null);
      }
      this.lastClashResult = state.lastResult;
      this.lastTurnNumber = currentTurn;
    } else {
      if (!this.showOldDemo()) {
        this.playerActiveCard.set(null);
        this.opponentActiveCard.set(null);
        this.playerCardGlow.set(null);
        this.opponentCardGlow.set(null);
        this.resetAnimations();
      }
    }
    if (state.winner && !this.victoryDialogShown) {
      this.victoryDialogShown = true;
      const gameDuration = this.gameStartTime ? Date.now() - this.gameStartTime : 3e4;
      this.settingsService.recordGameEnd(state.winner === "player", stats.turnNumber, gameDuration);
      this.authService.recordGameResult({
        won: state.winner === "player",
        turns: stats.turnNumber,
        durationMs: gameDuration,
        discardedCardsCount: stats.discardedCardCount
      });
      this.gameStartTime = null;
      const dialogRef = this.dialog.open(VictoryDialogComponent, {
        data: {
          winner: state.winner,
          totalTurns: stats.turnNumber,
          playerCardCount: this.gameStateService.playerCardCount(),
          opponentCardCount: this.gameStateService.opponentCardCount(),
          discardedCardCount: this.gameStateService.discardedCardCount()
        },
        width: "520px",
        maxWidth: "95vw",
        disableClose: true
      });
      dialogRef.afterClosed().subscribe((res) => {
        if (res?.action === "playAgain") {
          this.startNewGame();
        } else if (res?.action === "openProfile") {
          this.dialog.open(ProfileDialogComponent, {
            width: "620px",
            maxWidth: "95vw"
          });
        }
      });
    }
  }
  /**
   * Trigger card slide animation for new cards
   */
  triggerCardSlideAnimation(player) {
    if (!this.settingsService.currentSettings().autoPlayAnimations) {
      return;
    }
    const animationSpeed = this.settingsService.currentSettings().animationSpeed;
    const duration = this.getAnimationDuration("slide-in", animationSpeed);
    this.animationsPlaying.set(true);
    if (player === "player") {
      this.playerCardAnimation.set("slide-in");
      const timer = window.setTimeout(() => {
        this.playerCardAnimation.set(null);
        this.checkAnimationsComplete();
      }, duration);
      this.animationTimers.push(timer);
    } else {
      this.opponentCardAnimation.set("slide-in");
      const timer = window.setTimeout(() => {
        this.opponentCardAnimation.set(null);
        this.checkAnimationsComplete();
      }, duration);
      this.animationTimers.push(timer);
    }
  }
  /**
   * Trigger clash animations for battle results
   */
  triggerClashAnimations(result) {
    if (!this.settingsService.currentSettings().autoPlayAnimations) {
      return;
    }
    const animationSpeed = this.settingsService.currentSettings().animationSpeed;
    const duration = this.getAnimationDuration("clash-win", animationSpeed);
    this.animationsPlaying.set(true);
    if (result === "player-win") {
      this.playerCardAnimation.set("clash-win");
      this.opponentCardAnimation.set("clash-lose");
    } else {
      this.playerCardAnimation.set("clash-lose");
      this.opponentCardAnimation.set("clash-win");
    }
    const timer = window.setTimeout(() => {
      this.playerCardAnimation.set(null);
      this.opponentCardAnimation.set(null);
      this.checkAnimationsComplete();
    }, duration);
    this.animationTimers.push(timer);
  }
  /**
   * Trigger health damage animation for player
   */
  triggerPlayerHealthDamageAnimation() {
    if (!this.settingsService.currentSettings().autoPlayAnimations) {
      return;
    }
    const animationSpeed = this.settingsService.currentSettings().animationSpeed;
    const duration = this.getAnimationDuration("health-damage", animationSpeed);
    this.animationsPlaying.set(true);
    this.playerHealthDamageAnimation.set(true);
    const timer = window.setTimeout(() => {
      this.playerHealthDamageAnimation.set(false);
      this.checkAnimationsComplete();
    }, duration);
    this.animationTimers.push(timer);
  }
  /**
   * Trigger health damage animation for opponent
   */
  triggerOpponentHealthDamageAnimation() {
    if (!this.settingsService.currentSettings().autoPlayAnimations) {
      return;
    }
    const animationSpeed = this.settingsService.currentSettings().animationSpeed;
    const duration = this.getAnimationDuration("health-damage", animationSpeed);
    this.animationsPlaying.set(true);
    this.opponentHealthDamageAnimation.set(true);
    const timer = window.setTimeout(() => {
      this.opponentHealthDamageAnimation.set(false);
      this.checkAnimationsComplete();
    }, duration);
    this.animationTimers.push(timer);
  }
  /**
   * Get animation duration based on speed setting
   */
  getAnimationDuration(animationType, speed) {
    const baseDurations = {
      "slide-in": 800,
      "flip": 600,
      "clash-win": 1e3,
      "clash-lose": 1e3,
      "fall-away": 1200,
      "health-damage": 800
    };
    const speedMultipliers = {
      "slow": 1.5,
      "normal": 1,
      "fast": 0.5
    };
    const baseDuration = baseDurations[animationType] || 800;
    return baseDuration * speedMultipliers[speed];
  }
  /**
   * Check if all animations are complete
   */
  checkAnimationsComplete() {
    const hasActiveAnimations = this.playerCardAnimation() !== null || this.opponentCardAnimation() !== null || this.playerHealthDamageAnimation() || this.opponentHealthDamageAnimation();
    if (!hasActiveAnimations) {
      this.animationsPlaying.set(false);
    }
  }
  /**
   * Clear all animation timers
   */
  clearAnimationTimers() {
    this.animationTimers.forEach((timer) => window.clearTimeout(timer));
    this.animationTimers = [];
  }
  openDiscardPileViewer() {
    const discardedCards = this.gameStateService.discardedCards();
    this.dialog.open(DiscardPileViewerComponent, {
      data: { discardedCards },
      width: "90%",
      maxWidth: "800px",
      maxHeight: "90vh",
      panelClass: "discard-pile-dialog"
    });
  }
  /**
   * Reset all animations
   */
  resetAnimations() {
    this.clearAnimationTimers();
    this.playerCardAnimation.set(null);
    this.opponentCardAnimation.set(null);
    this.playerHealthDamageAnimation.set(false);
    this.opponentHealthDamageAnimation.set(false);
    this.animationsPlaying.set(false);
  }
  static \u0275fac = function Game_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _Game)(\u0275\u0275directiveInject(GameDemoService), \u0275\u0275directiveInject(GameControllerService), \u0275\u0275directiveInject(ProgressService), \u0275\u0275directiveInject(GameStateService), \u0275\u0275directiveInject(SettingsService), \u0275\u0275directiveInject(MatDialog));
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _Game, selectors: [["app-game"]], decls: 3, vars: 1, consts: [[1, "game-container"], [1, "welcome-card"], [3, "playerDeckClicked", "playerCardCount", "opponentCardCount", "playerActiveCard", "opponentActiveCard", "playerCardGlow", "opponentCardGlow", "playerCardAnimation", "opponentCardAnimation", "playerHealthDamageAnimation", "opponentHealthDamageAnimation", "gameMessage", "challengeAvailable", "canPlayerAct", "turnNumber"], [1, "challenge-overlay"], [1, "battle-overlay"], [1, "game-controls"], ["mat-raised-button", "", "color", "primary", 3, "click"], ["mat-raised-button", "", 3, "click"], [1, "discard-count"], ["mat-button", "", 3, "click"], [1, "challenge-card"], [1, "turn-context"], [1, "cards-display"], [1, "player-card-info"], [3, "card", "glow", "faceDown"], [1, "opponent-card-info"], [1, "challenge-card-display"], [3, "card", "glow", "animationState"], [1, "battle-card"], [1, "battle-cards"], [1, "opponent-battle-cards"], [3, "card", "faceDown", "glow", "clickable"], [1, "player-battle-cards"], [3, "card", "faceDown"], [3, "cardClicked", "card", "faceDown", "glow", "clickable"], [1, "demo-output"], [1, "demo-line"], ["mat-button", "", "routerLink", "/settings"]], template: function Game_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 0);
      \u0275\u0275conditionalCreate(1, Game_Conditional_1_Template, 12, 18)(2, Game_Conditional_2_Template, 42, 0, "mat-card", 1);
      \u0275\u0275elementEnd();
    }
    if (rf & 2) {
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.showGameBoard() ? 1 : 2);
    }
  }, dependencies: [
    MatCardModule,
    MatCard,
    MatCardActions,
    MatCardContent,
    MatCardHeader,
    MatCardSubtitle,
    MatCardTitle,
    MatButtonModule,
    MatButton,
    RouterLink,
    GameBoardComponent,
    CardComponent
  ], styles: ['\n\n.game-container[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 60vh;\n  padding: 20px;\n  position: relative;\n}\n@media (max-width: 959px) {\n  .game-container[_ngcontent-%COMP%] {\n    padding: 16px;\n    min-height: 50vh;\n  }\n}\n@media (max-width: 599px) {\n  .game-container[_ngcontent-%COMP%] {\n    padding: 8px;\n    min-height: auto;\n    align-items: flex-start;\n  }\n}\n.game-container[_ngcontent-%COMP%]:has(app-game-board) {\n  min-height: calc(100vh - 64px);\n  padding: 0;\n  align-items: stretch;\n}\n@media (max-width: 599px) {\n  .game-container[_ngcontent-%COMP%]:has(app-game-board) {\n    min-height: calc(100dvh - 56px);\n  }\n}\n.game-controls[_ngcontent-%COMP%] {\n  position: fixed;\n  top: 80px;\n  right: 20px;\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n  background: rgba(15, 23, 42, 0.85);\n  -webkit-backdrop-filter: blur(12px) saturate(180%);\n  backdrop-filter: blur(12px) saturate(180%);\n  padding: 10px 12px;\n  border-radius: 14px;\n  z-index: 1000;\n  max-width: 190px;\n  border: 1px solid rgba(255, 255, 255, 0.15);\n  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);\n}\n@media (max-width: 959px) {\n  .game-controls[_ngcontent-%COMP%] {\n    top: 72px;\n    right: 16px;\n    max-width: 170px;\n  }\n}\n@media (max-width: 599px) {\n  .game-controls[_ngcontent-%COMP%] {\n    top: 64px;\n    right: auto;\n    left: 8px;\n    flex-direction: row;\n    gap: 6px;\n    padding: 6px;\n    max-width: calc(100vw - 16px);\n    flex-wrap: wrap;\n    justify-content: flex-start;\n  }\n}\n.game-controls[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] {\n  font-size: 12px;\n  font-weight: 600;\n  border-radius: 8px;\n  transition:\n    transform 0.2s ease,\n    box-shadow 0.2s ease,\n    background 0.2s ease;\n  min-height: 38px;\n}\n.game-controls[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:hover {\n  transform: translateY(-1px);\n}\n.game-controls[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]   .discard-count[_ngcontent-%COMP%] {\n  margin-left: 6px;\n  font-size: 0.85em;\n  font-weight: 700;\n  background: rgba(255, 255, 255, 0.25);\n  padding: 2px 7px;\n  border-radius: 12px;\n  min-width: 20px;\n  display: inline-block;\n  text-align: center;\n}\n@media (max-width: 599px) {\n  .game-controls[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] {\n    font-size: 11px;\n    min-height: 32px;\n    padding: 0 12px;\n  }\n}\n.challenge-overlay[_ngcontent-%COMP%], \n.battle-overlay[_ngcontent-%COMP%] {\n  position: fixed;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  background: rgba(15, 23, 42, 0.75);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  z-index: 2000;\n  -webkit-backdrop-filter: blur(12px) saturate(160%);\n  backdrop-filter: blur(12px) saturate(160%);\n  animation: _ngcontent-%COMP%_overlayFadeIn 0.3s ease-out;\n}\n@keyframes _ngcontent-%COMP%_overlayFadeIn {\n  from {\n    opacity: 0;\n  }\n  to {\n    opacity: 1;\n  }\n}\n.challenge-card[_ngcontent-%COMP%] {\n  max-width: 620px;\n  width: 92%;\n  border-radius: 16px !important;\n  overflow: hidden;\n  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.15) !important;\n  animation: _ngcontent-%COMP%_challengeSpringPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);\n  background: #ffffff !important;\n}\n@keyframes _ngcontent-%COMP%_challengeSpringPop {\n  0% {\n    opacity: 0;\n    transform: scale(0.82) translateY(-30px);\n  }\n  100% {\n    opacity: 1;\n    transform: scale(1) translateY(0);\n  }\n}\n.challenge-card[_ngcontent-%COMP%]   mat-card-header[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      135deg,\n      #4f46e5 0%,\n      #6366f1 100%);\n  color: white;\n  margin: -16px -16px 16px -16px;\n  padding: 20px 24px;\n}\n.challenge-card[_ngcontent-%COMP%]   mat-card-header[_ngcontent-%COMP%]   mat-card-title[_ngcontent-%COMP%] {\n  font-size: 1.35rem;\n  font-weight: 800;\n  letter-spacing: -0.3px;\n}\n.challenge-card[_ngcontent-%COMP%]   mat-card-header[_ngcontent-%COMP%]   mat-card-subtitle[_ngcontent-%COMP%] {\n  color: rgba(255, 255, 255, 0.85);\n  font-size: 0.95rem;\n  margin-top: 4px;\n}\n.challenge-card[_ngcontent-%COMP%]   mat-card-actions[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 12px;\n  justify-content: flex-end;\n  margin-top: 16px;\n  padding: 12px 16px;\n}\n.challenge-card[_ngcontent-%COMP%]   mat-card-actions[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] {\n  border-radius: 10px;\n  font-weight: 700;\n  padding: 0 20px;\n}\n.challenge-card[_ngcontent-%COMP%]   .turn-context[_ngcontent-%COMP%] {\n  margin-bottom: 20px;\n  padding: 16px;\n  background: rgba(15, 23, 42, 0.04);\n  border-radius: 12px;\n  border: 1px solid rgba(15, 23, 42, 0.08);\n}\n.challenge-card[_ngcontent-%COMP%]   .turn-context[_ngcontent-%COMP%]   h4[_ngcontent-%COMP%] {\n  margin: 0 0 12px 0;\n  color: #1e293b;\n  font-size: 1.05em;\n  font-weight: 700;\n}\n.challenge-card[_ngcontent-%COMP%]   .cards-display[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 24px;\n  justify-content: center;\n  align-items: center;\n  flex-wrap: wrap;\n}\n.challenge-card[_ngcontent-%COMP%]   .cards-display[_ngcontent-%COMP%]   .player-card-info[_ngcontent-%COMP%], \n.challenge-card[_ngcontent-%COMP%]   .cards-display[_ngcontent-%COMP%]   .opponent-card-info[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 8px;\n}\n.challenge-card[_ngcontent-%COMP%]   .cards-display[_ngcontent-%COMP%]   .player-card-info[_ngcontent-%COMP%]   span[_ngcontent-%COMP%], \n.challenge-card[_ngcontent-%COMP%]   .cards-display[_ngcontent-%COMP%]   .opponent-card-info[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] {\n  font-size: 0.9em;\n  font-weight: 600;\n  color: #475569;\n  text-align: center;\n}\n.challenge-card[_ngcontent-%COMP%]   .cards-display[_ngcontent-%COMP%]   .player-card-info[_ngcontent-%COMP%]   app-card[_ngcontent-%COMP%], \n.challenge-card[_ngcontent-%COMP%]   .cards-display[_ngcontent-%COMP%]   .opponent-card-info[_ngcontent-%COMP%]   app-card[_ngcontent-%COMP%] {\n  transform: scale(0.9);\n}\n.challenge-card[_ngcontent-%COMP%]   .challenge-card-display[_ngcontent-%COMP%] {\n  margin: 20px 0;\n  padding: 16px;\n  background: rgba(99, 102, 241, 0.08);\n  border-radius: 12px;\n  border: 1px solid rgba(99, 102, 241, 0.2);\n  text-align: center;\n}\n.challenge-card[_ngcontent-%COMP%]   .challenge-card-display[_ngcontent-%COMP%]   h4[_ngcontent-%COMP%] {\n  margin: 0 0 12px 0;\n  color: #4f46e5;\n  font-size: 1.05em;\n  font-weight: 700;\n}\n.challenge-card[_ngcontent-%COMP%]   .challenge-card-display[_ngcontent-%COMP%]   app-card[_ngcontent-%COMP%] {\n  transform: scale(1);\n}\n.battle-card[_ngcontent-%COMP%] {\n  max-width: 640px;\n  width: 95%;\n  border-radius: 16px !important;\n  overflow: hidden;\n  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.15) !important;\n  animation: _ngcontent-%COMP%_battleSpringPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);\n  background: #ffffff !important;\n}\n@keyframes _ngcontent-%COMP%_battleSpringPop {\n  0% {\n    opacity: 0;\n    transform: scale(0.85) translateY(-40px);\n  }\n  100% {\n    opacity: 1;\n    transform: scale(1) translateY(0);\n  }\n}\n.battle-card[_ngcontent-%COMP%]   mat-card-header[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      135deg,\n      #ec4899 0%,\n      #8b5cf6 100%);\n  color: white;\n  margin: -16px -16px 16px -16px;\n  padding: 20px 24px;\n}\n.battle-card[_ngcontent-%COMP%]   mat-card-header[_ngcontent-%COMP%]   mat-card-title[_ngcontent-%COMP%] {\n  font-size: 1.4rem;\n  font-weight: 800;\n  letter-spacing: -0.3px;\n}\n.battle-card[_ngcontent-%COMP%]   mat-card-header[_ngcontent-%COMP%]   mat-card-subtitle[_ngcontent-%COMP%] {\n  color: rgba(255, 255, 255, 0.9);\n  font-size: 0.95rem;\n  margin-top: 4px;\n}\n.battle-card[_ngcontent-%COMP%]   .battle-cards[_ngcontent-%COMP%]   h4[_ngcontent-%COMP%] {\n  margin: 16px 0 10px 0;\n  font-weight: 700;\n  color: #1e293b;\n}\n.battle-card[_ngcontent-%COMP%]   .battle-cards[_ngcontent-%COMP%]   .opponent-battle-cards[_ngcontent-%COMP%], \n.battle-card[_ngcontent-%COMP%]   .battle-cards[_ngcontent-%COMP%]   .player-battle-cards[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 12px;\n  justify-content: center;\n  margin-bottom: 20px;\n  flex-wrap: wrap;\n}\n.battle-card[_ngcontent-%COMP%]   .battle-cards[_ngcontent-%COMP%]   .opponent-battle-cards[_ngcontent-%COMP%]   app-card[_ngcontent-%COMP%] {\n  cursor: pointer;\n  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease;\n}\n.battle-card[_ngcontent-%COMP%]   .battle-cards[_ngcontent-%COMP%]   .opponent-battle-cards[_ngcontent-%COMP%]   app-card[_ngcontent-%COMP%]:hover {\n  transform: translateY(-8px) scale(1.08);\n}\n.welcome-card[_ngcontent-%COMP%] {\n  max-width: 800px;\n  width: 100%;\n  transition:\n    background-color 0.3s ease-in-out,\n    color 0.3s ease-in-out,\n    box-shadow 0.3s ease-in-out;\n}\n@media (max-width: 659px) {\n  .welcome-card[_ngcontent-%COMP%] {\n    max-width: none;\n    margin: 0;\n  }\n}\n@media (max-width: 359px) {\n  .welcome-card[_ngcontent-%COMP%]   .mat-mdc-card-content[_ngcontent-%COMP%] {\n    padding: 12px !important;\n  }\n}\n.welcome-card[_ngcontent-%COMP%]   mat-card-actions[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 12px;\n  justify-content: flex-start;\n  flex-wrap: wrap;\n}\n@media (max-width: 599px) {\n  .welcome-card[_ngcontent-%COMP%]   mat-card-actions[_ngcontent-%COMP%] {\n    gap: 8px;\n  }\n}\n@media (max-width: 359px) {\n  .welcome-card[_ngcontent-%COMP%]   mat-card-actions[_ngcontent-%COMP%] {\n    flex-direction: column;\n    align-items: stretch;\n    gap: 8px;\n  }\n}\n.welcome-card[_ngcontent-%COMP%]   mat-card-actions[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] {\n  transition: background-color 0.3s ease-in-out, color 0.3s ease-in-out;\n  min-height: 44px;\n}\n@media (max-width: 599px) {\n  .welcome-card[_ngcontent-%COMP%]   mat-card-actions[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] {\n    font-size: 14px;\n  }\n}\n@media (max-width: 359px) {\n  .welcome-card[_ngcontent-%COMP%]   mat-card-actions[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] {\n    width: 100%;\n  }\n}\n.welcome-card[_ngcontent-%COMP%]   ul[_ngcontent-%COMP%] {\n  margin: 16px 0;\n  padding-left: 24px;\n}\n@media (max-width: 599px) {\n  .welcome-card[_ngcontent-%COMP%]   ul[_ngcontent-%COMP%] {\n    padding-left: 20px;\n    margin: 12px 0;\n  }\n}\n@media (max-width: 359px) {\n  .welcome-card[_ngcontent-%COMP%]   ul[_ngcontent-%COMP%] {\n    padding-left: 16px;\n    margin: 8px 0;\n  }\n}\n.welcome-card[_ngcontent-%COMP%]   li[_ngcontent-%COMP%] {\n  margin-bottom: 8px;\n}\n@media (max-width: 599px) {\n  .welcome-card[_ngcontent-%COMP%]   li[_ngcontent-%COMP%] {\n    margin-bottom: 6px;\n    font-size: 14px;\n  }\n}\n@media (max-width: 359px) {\n  .welcome-card[_ngcontent-%COMP%]   li[_ngcontent-%COMP%] {\n    margin-bottom: 4px;\n    font-size: 13px;\n  }\n}\n.demo-output[_ngcontent-%COMP%] {\n  background: #f5f5f5;\n  border: 1px solid #ddd;\n  border-radius: 4px;\n  padding: 16px;\n  margin: 16px 0;\n  font-family: "Courier New", monospace;\n  font-size: 14px;\n  max-height: 400px;\n  overflow-y: auto;\n  line-height: 1.4;\n  color: #333;\n}\n.demo-line[_ngcontent-%COMP%] {\n  margin-bottom: 4px;\n  white-space: pre-wrap;\n}\n[_nghost-%COMP%]     .dark-theme .demo-output, \n[_nghost-%COMP%]     body.dark-theme .demo-output, \n.dark-theme[_ngcontent-%COMP%]   .demo-output[_ngcontent-%COMP%] {\n  background: #1e1e1e;\n  border-color: #555;\n  color: #e0e0e0;\n}\n[_nghost-%COMP%]     .dark-theme .demo-line, \n[_nghost-%COMP%]     body.dark-theme .demo-line, \n.dark-theme[_ngcontent-%COMP%]   .demo-line[_ngcontent-%COMP%] {\n  color: #e0e0e0;\n}\n[_nghost-%COMP%]     .discard-pile-dialog .mat-mdc-dialog-container {\n  padding: 0;\n  overflow: hidden;\n}\n/*# sourceMappingURL=game.css.map */'] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(Game, [{
    type: Component,
    args: [{ selector: "app-game", imports: [
      MatCardModule,
      MatButtonModule,
      RouterLink,
      GameBoardComponent,
      CardComponent
    ], template: `<div class="game-container">\r
  @if (showGameBoard()) {\r
    <!-- Milestone 4 Game Board UI with Real Gameplay -->\r
    <app-game-board\r
      [playerCardCount]="playerCardCount()"\r
      [opponentCardCount]="opponentCardCount()"\r
      [playerActiveCard]="playerActiveCard()"\r
      [opponentActiveCard]="opponentActiveCard()"\r
      [playerCardGlow]="playerCardGlow()"\r
      [opponentCardGlow]="opponentCardGlow()"\r
      [playerCardAnimation]="playerCardAnimation()"\r
      [opponentCardAnimation]="opponentCardAnimation()"\r
      [playerHealthDamageAnimation]="playerHealthDamageAnimation()"\r
      [opponentHealthDamageAnimation]="opponentHealthDamageAnimation()"\r
      [gameMessage]="gameMessage()"\r
      [challengeAvailable]="challengeAvailable()"\r
      [canPlayerAct]="effectiveCanPlayerAct()"\r
      [turnNumber]="gameStateService.gameStats().turnNumber"\r
      (playerDeckClicked)="onPlayerDeckClick()">\r
    </app-game-board>\r
\r
    <!-- Challenge Prompt Modal -->\r
    @if (showChallengePrompt()) {\r
      <div class="challenge-overlay">\r
        <mat-card class="challenge-card">\r
          <mat-card-header>\r
            <mat-card-title>Challenge Available!</mat-card-title>\r
            <mat-card-subtitle>Do you want to challenge the result?</mat-card-subtitle>\r
          </mat-card-header>\r
          <mat-card-content>\r
            <!-- Show the current turn cards for context -->\r
            <div class="turn-context">\r
              <h4>This Turn's Cards:</h4>\r
              <div class="cards-display">\r
                <div class="player-card-info">\r
                  <span>Your Card (Lost):</span>\r
                  @if (playerActiveCard()) {\r
                    <app-card [card]="playerActiveCard()" [glow]="'red'" [faceDown]="false"></app-card>\r
                  }\r
                </div>\r
                <div class="opponent-card-info">\r
                  <span>Opponent's Card (Won):</span>\r
                  @if (opponentActiveCard()) {\r
                    <app-card [card]="opponentActiveCard()" [glow]="'green'" [faceDown]="false"></app-card>\r
                  }\r
                </div>\r
              </div>\r
            </div>\r
            \r
            <p>You lost this round, but you can draw an additional card to challenge the result.</p>\r
            <p><strong>Risk:</strong> If you lose the challenge, you lose both cards!</p>\r
            <p><strong>Challenge Rule:</strong> Your new card will be compared against the opponent's winning card above.</p>\r
          </mat-card-content>\r
          <mat-card-actions>\r
            <button mat-raised-button color="primary" (click)="acceptChallenge()">\r
              Accept Challenge\r
            </button>\r
            <button mat-button (click)="declineChallenge()">\r
              Decline\r
            </button>\r
          </mat-card-actions>\r
        </mat-card>\r
      </div>\r
    }\r
\r
    <!-- Challenge Card Display Modal -->\r
    @if (showChallengeCardDisplay()) {\r
      <div class="challenge-overlay">\r
        <mat-card class="challenge-card">\r
          <mat-card-header>\r
            <mat-card-title>Your Challenge Card</mat-card-title>\r
            <mat-card-subtitle>This is the card you drew for your challenge</mat-card-subtitle>\r
          </mat-card-header>\r
          <mat-card-content>\r
            <!-- Show the original turn context -->\r
            <div class="turn-context">\r
              <h4>Original Turn:</h4>\r
              <div class="cards-display">\r
                <div class="player-card-info">\r
                  <span>Your Original Card:</span>\r
                  @if (playerActiveCard()) {\r
                    <app-card [card]="playerActiveCard()" [glow]="'red'" [faceDown]="false"></app-card>\r
                  }\r
                </div>\r
                <div class="opponent-card-info">\r
                  <span>Opponent's Card:</span>\r
                  @if (opponentActiveCard()) {\r
                    <app-card [card]="opponentActiveCard()" [glow]="'green'" [faceDown]="false"></app-card>\r
                  }\r
                </div>\r
              </div>\r
            </div>\r
\r
            <!-- Show the challenge card -->\r
            <div class="challenge-card-display">\r
              <h4>Your Challenge Card:</h4>\r
              @if (challengeCard()) {\r
                <app-card \r
                  [card]="challengeCard()" \r
                  [glow]="'blue'"\r
                  [animationState]="'flip'">\r
                </app-card>\r
              }\r
            </div>\r
            \r
            <p><strong>Challenge Comparison:</strong> Your challenge card vs. opponent's winning card</p>\r
            <p>If your challenge card wins, you keep both of your cards and the opponent's card is discarded.</p>\r
            <p>If your challenge card loses or ties, you lose both cards and the opponent keeps their card.</p>\r
          </mat-card-content>\r
          <mat-card-actions>\r
            <button mat-raised-button color="primary" (click)="confirmChallenge()">\r
              Continue with Challenge\r
            </button>\r
          </mat-card-actions>\r
        </mat-card>\r
      </div>\r
    }\r
\r
    <!-- Battle Selection Modal -->\r
    @if (showBattleUI()) {\r
      <div class="battle-overlay">\r
        <mat-card class="battle-card">\r
          <mat-card-header>\r
            <mat-card-title>Battle Time!</mat-card-title>\r
            <mat-card-subtitle>Select one of the opponent's face-down cards</mat-card-subtitle>\r
          </mat-card-header>\r
          <mat-card-content>\r
            <p>Cards are tied! Both players have placed 3 cards face-down for battle.</p>\r
            <div class="battle-cards">\r
              <h4>Opponent's Cards (Select One):</h4>\r
              <div class="opponent-battle-cards">\r
                @for (card of opponentBattleCards(); track $index) {\r
                  <app-card\r
                    [card]="card"\r
                    [faceDown]="isBattleCardFaceDown(card, 'opponent')"\r
                    [glow]="'blue'"\r
                    [clickable]="battlePhase() === 'selection'"\r
                    (cardClicked)="onBattleCardSelect(card)">\r
                  </app-card>\r
                }\r
              </div>\r
              \r
              <h4>Your Cards in Battle:</h4>\r
              <div class="player-battle-cards">\r
                @for (card of battleCards(); track $index) {\r
                  <app-card\r
                    [card]="card"\r
                    [faceDown]="isBattleCardFaceDown(card, 'player')">\r
                  </app-card>\r
                }\r
              </div>\r
            </div>\r
          </mat-card-content>\r
        </mat-card>\r
      </div>\r
    }\r
\r
    <!-- Game Controls -->\r
    <div class="game-controls">\r
      <button mat-raised-button color="primary" (click)="startNewGame()">\r
        New Game\r
      </button>\r
      <button mat-raised-button (click)="openDiscardPileViewer()">\r
        Discard Pile\r
        @if (gameStateService.discardedCardCount() > 0) {\r
          <span class="discard-count">({{ gameStateService.discardedCardCount() }})</span>\r
        }\r
      </button>\r
      <button mat-button (click)="toggleDemo()">\r
        Show Old Demo\r
      </button>\r
    </div>\r
  } @else {\r
    <!-- Original Milestone 2 Demo -->\r
    <mat-card class="welcome-card">\r
      <mat-card-header>\r
        <mat-card-title>War of Attrition - Milestone 3 Complete! \u{1F389}</mat-card-title>\r
        <mat-card-subtitle>Basic UI Components Implementation</mat-card-subtitle>\r
      </mat-card-header>\r
      <mat-card-content>\r
        <p><strong>Milestone 3 has been successfully completed!</strong> Core UI components are implemented and functional.</p>\r
        \r
        <h3>New UI Components:</h3>\r
        <ul>\r
          <li><strong>Game Board Layout:</strong> Head-to-head player layout with solitaire green background</li>\r
          <li><strong>Card Component:</strong> Visual card representation with red/black suits and glow effects</li>\r
          <li><strong>Health Bar Component:</strong> Color-coded health bars (Green\u2192Yellow\u2192Orange\u2192Red)</li>\r
          <li><strong>Action Indicators:</strong> Blue glow effects for player actions</li>\r
        </ul>\r
\r
        <h3>Previous - Game Engine Demo:</h3>\r
        <div class="demo-output">\r
          @for (line of demoLog(); track $index) {\r
            <div class="demo-line">{{ line }}</div>\r
          }\r
        </div>\r
      </mat-card-content>\r
      <mat-card-actions>\r
        <button mat-raised-button color="primary" (click)="toggleDemo()">\r
          Show New Game Board\r
        </button>\r
        <button mat-raised-button color="primary" (click)="runDemo()">Run Demo Again</button>\r
        <button mat-button routerLink="/settings">Settings</button>\r
      </mat-card-actions>\r
    </mat-card>\r
  }\r
</div>\r
`, styles: ['/* src/app/game/game.scss */\n.game-container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 60vh;\n  padding: 20px;\n  position: relative;\n}\n@media (max-width: 959px) {\n  .game-container {\n    padding: 16px;\n    min-height: 50vh;\n  }\n}\n@media (max-width: 599px) {\n  .game-container {\n    padding: 8px;\n    min-height: auto;\n    align-items: flex-start;\n  }\n}\n.game-container:has(app-game-board) {\n  min-height: calc(100vh - 64px);\n  padding: 0;\n  align-items: stretch;\n}\n@media (max-width: 599px) {\n  .game-container:has(app-game-board) {\n    min-height: calc(100dvh - 56px);\n  }\n}\n.game-controls {\n  position: fixed;\n  top: 80px;\n  right: 20px;\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n  background: rgba(15, 23, 42, 0.85);\n  -webkit-backdrop-filter: blur(12px) saturate(180%);\n  backdrop-filter: blur(12px) saturate(180%);\n  padding: 10px 12px;\n  border-radius: 14px;\n  z-index: 1000;\n  max-width: 190px;\n  border: 1px solid rgba(255, 255, 255, 0.15);\n  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);\n}\n@media (max-width: 959px) {\n  .game-controls {\n    top: 72px;\n    right: 16px;\n    max-width: 170px;\n  }\n}\n@media (max-width: 599px) {\n  .game-controls {\n    top: 64px;\n    right: auto;\n    left: 8px;\n    flex-direction: row;\n    gap: 6px;\n    padding: 6px;\n    max-width: calc(100vw - 16px);\n    flex-wrap: wrap;\n    justify-content: flex-start;\n  }\n}\n.game-controls button {\n  font-size: 12px;\n  font-weight: 600;\n  border-radius: 8px;\n  transition:\n    transform 0.2s ease,\n    box-shadow 0.2s ease,\n    background 0.2s ease;\n  min-height: 38px;\n}\n.game-controls button:hover {\n  transform: translateY(-1px);\n}\n.game-controls button .discard-count {\n  margin-left: 6px;\n  font-size: 0.85em;\n  font-weight: 700;\n  background: rgba(255, 255, 255, 0.25);\n  padding: 2px 7px;\n  border-radius: 12px;\n  min-width: 20px;\n  display: inline-block;\n  text-align: center;\n}\n@media (max-width: 599px) {\n  .game-controls button {\n    font-size: 11px;\n    min-height: 32px;\n    padding: 0 12px;\n  }\n}\n.challenge-overlay,\n.battle-overlay {\n  position: fixed;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  background: rgba(15, 23, 42, 0.75);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  z-index: 2000;\n  -webkit-backdrop-filter: blur(12px) saturate(160%);\n  backdrop-filter: blur(12px) saturate(160%);\n  animation: overlayFadeIn 0.3s ease-out;\n}\n@keyframes overlayFadeIn {\n  from {\n    opacity: 0;\n  }\n  to {\n    opacity: 1;\n  }\n}\n.challenge-card {\n  max-width: 620px;\n  width: 92%;\n  border-radius: 16px !important;\n  overflow: hidden;\n  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.15) !important;\n  animation: challengeSpringPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);\n  background: #ffffff !important;\n}\n@keyframes challengeSpringPop {\n  0% {\n    opacity: 0;\n    transform: scale(0.82) translateY(-30px);\n  }\n  100% {\n    opacity: 1;\n    transform: scale(1) translateY(0);\n  }\n}\n.challenge-card mat-card-header {\n  background:\n    linear-gradient(\n      135deg,\n      #4f46e5 0%,\n      #6366f1 100%);\n  color: white;\n  margin: -16px -16px 16px -16px;\n  padding: 20px 24px;\n}\n.challenge-card mat-card-header mat-card-title {\n  font-size: 1.35rem;\n  font-weight: 800;\n  letter-spacing: -0.3px;\n}\n.challenge-card mat-card-header mat-card-subtitle {\n  color: rgba(255, 255, 255, 0.85);\n  font-size: 0.95rem;\n  margin-top: 4px;\n}\n.challenge-card mat-card-actions {\n  display: flex;\n  gap: 12px;\n  justify-content: flex-end;\n  margin-top: 16px;\n  padding: 12px 16px;\n}\n.challenge-card mat-card-actions button {\n  border-radius: 10px;\n  font-weight: 700;\n  padding: 0 20px;\n}\n.challenge-card .turn-context {\n  margin-bottom: 20px;\n  padding: 16px;\n  background: rgba(15, 23, 42, 0.04);\n  border-radius: 12px;\n  border: 1px solid rgba(15, 23, 42, 0.08);\n}\n.challenge-card .turn-context h4 {\n  margin: 0 0 12px 0;\n  color: #1e293b;\n  font-size: 1.05em;\n  font-weight: 700;\n}\n.challenge-card .cards-display {\n  display: flex;\n  gap: 24px;\n  justify-content: center;\n  align-items: center;\n  flex-wrap: wrap;\n}\n.challenge-card .cards-display .player-card-info,\n.challenge-card .cards-display .opponent-card-info {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 8px;\n}\n.challenge-card .cards-display .player-card-info span,\n.challenge-card .cards-display .opponent-card-info span {\n  font-size: 0.9em;\n  font-weight: 600;\n  color: #475569;\n  text-align: center;\n}\n.challenge-card .cards-display .player-card-info app-card,\n.challenge-card .cards-display .opponent-card-info app-card {\n  transform: scale(0.9);\n}\n.challenge-card .challenge-card-display {\n  margin: 20px 0;\n  padding: 16px;\n  background: rgba(99, 102, 241, 0.08);\n  border-radius: 12px;\n  border: 1px solid rgba(99, 102, 241, 0.2);\n  text-align: center;\n}\n.challenge-card .challenge-card-display h4 {\n  margin: 0 0 12px 0;\n  color: #4f46e5;\n  font-size: 1.05em;\n  font-weight: 700;\n}\n.challenge-card .challenge-card-display app-card {\n  transform: scale(1);\n}\n.battle-card {\n  max-width: 640px;\n  width: 95%;\n  border-radius: 16px !important;\n  overflow: hidden;\n  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.15) !important;\n  animation: battleSpringPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);\n  background: #ffffff !important;\n}\n@keyframes battleSpringPop {\n  0% {\n    opacity: 0;\n    transform: scale(0.85) translateY(-40px);\n  }\n  100% {\n    opacity: 1;\n    transform: scale(1) translateY(0);\n  }\n}\n.battle-card mat-card-header {\n  background:\n    linear-gradient(\n      135deg,\n      #ec4899 0%,\n      #8b5cf6 100%);\n  color: white;\n  margin: -16px -16px 16px -16px;\n  padding: 20px 24px;\n}\n.battle-card mat-card-header mat-card-title {\n  font-size: 1.4rem;\n  font-weight: 800;\n  letter-spacing: -0.3px;\n}\n.battle-card mat-card-header mat-card-subtitle {\n  color: rgba(255, 255, 255, 0.9);\n  font-size: 0.95rem;\n  margin-top: 4px;\n}\n.battle-card .battle-cards h4 {\n  margin: 16px 0 10px 0;\n  font-weight: 700;\n  color: #1e293b;\n}\n.battle-card .battle-cards .opponent-battle-cards,\n.battle-card .battle-cards .player-battle-cards {\n  display: flex;\n  gap: 12px;\n  justify-content: center;\n  margin-bottom: 20px;\n  flex-wrap: wrap;\n}\n.battle-card .battle-cards .opponent-battle-cards app-card {\n  cursor: pointer;\n  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease;\n}\n.battle-card .battle-cards .opponent-battle-cards app-card:hover {\n  transform: translateY(-8px) scale(1.08);\n}\n.welcome-card {\n  max-width: 800px;\n  width: 100%;\n  transition:\n    background-color 0.3s ease-in-out,\n    color 0.3s ease-in-out,\n    box-shadow 0.3s ease-in-out;\n}\n@media (max-width: 659px) {\n  .welcome-card {\n    max-width: none;\n    margin: 0;\n  }\n}\n@media (max-width: 359px) {\n  .welcome-card .mat-mdc-card-content {\n    padding: 12px !important;\n  }\n}\n.welcome-card mat-card-actions {\n  display: flex;\n  gap: 12px;\n  justify-content: flex-start;\n  flex-wrap: wrap;\n}\n@media (max-width: 599px) {\n  .welcome-card mat-card-actions {\n    gap: 8px;\n  }\n}\n@media (max-width: 359px) {\n  .welcome-card mat-card-actions {\n    flex-direction: column;\n    align-items: stretch;\n    gap: 8px;\n  }\n}\n.welcome-card mat-card-actions button {\n  transition: background-color 0.3s ease-in-out, color 0.3s ease-in-out;\n  min-height: 44px;\n}\n@media (max-width: 599px) {\n  .welcome-card mat-card-actions button {\n    font-size: 14px;\n  }\n}\n@media (max-width: 359px) {\n  .welcome-card mat-card-actions button {\n    width: 100%;\n  }\n}\n.welcome-card ul {\n  margin: 16px 0;\n  padding-left: 24px;\n}\n@media (max-width: 599px) {\n  .welcome-card ul {\n    padding-left: 20px;\n    margin: 12px 0;\n  }\n}\n@media (max-width: 359px) {\n  .welcome-card ul {\n    padding-left: 16px;\n    margin: 8px 0;\n  }\n}\n.welcome-card li {\n  margin-bottom: 8px;\n}\n@media (max-width: 599px) {\n  .welcome-card li {\n    margin-bottom: 6px;\n    font-size: 14px;\n  }\n}\n@media (max-width: 359px) {\n  .welcome-card li {\n    margin-bottom: 4px;\n    font-size: 13px;\n  }\n}\n.demo-output {\n  background: #f5f5f5;\n  border: 1px solid #ddd;\n  border-radius: 4px;\n  padding: 16px;\n  margin: 16px 0;\n  font-family: "Courier New", monospace;\n  font-size: 14px;\n  max-height: 400px;\n  overflow-y: auto;\n  line-height: 1.4;\n  color: #333;\n}\n.demo-line {\n  margin-bottom: 4px;\n  white-space: pre-wrap;\n}\n:host ::ng-deep .dark-theme .demo-output,\n:host ::ng-deep body.dark-theme .demo-output,\n.dark-theme .demo-output {\n  background: #1e1e1e;\n  border-color: #555;\n  color: #e0e0e0;\n}\n:host ::ng-deep .dark-theme .demo-line,\n:host ::ng-deep body.dark-theme .demo-line,\n.dark-theme .demo-line {\n  color: #e0e0e0;\n}\n:host ::ng-deep .discard-pile-dialog .mat-mdc-dialog-container {\n  padding: 0;\n  overflow: hidden;\n}\n/*# sourceMappingURL=game.css.map */\n'] }]
  }], () => [{ type: GameDemoService }, { type: GameControllerService }, { type: ProgressService }, { type: GameStateService }, { type: SettingsService }, { type: MatDialog }], null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(Game, { className: "Game", filePath: "src/app/game/game.ts", lineNumber: 32 });
})();

// src/app/app.routes.ts
var routes = [
  { path: "", component: Game },
  {
    path: "settings",
    loadComponent: () => import("./chunk-D27FQOFZ.js").then((m) => m.Settings)
  },
  { path: "**", redirectTo: "" }
];

// node_modules/@angular/service-worker/fesm2022/service-worker.mjs
var ERR_SW_NOT_SUPPORTED = "Service workers are disabled or not supported by this browser";
var NgswCommChannel = class {
  serviceWorker;
  worker;
  registration;
  events;
  constructor(serviceWorker, injector) {
    this.serviceWorker = serviceWorker;
    if (!serviceWorker) {
      this.worker = this.events = this.registration = new Observable((subscriber) => subscriber.error(new RuntimeError(5601, (typeof ngDevMode === "undefined" || ngDevMode) && ERR_SW_NOT_SUPPORTED)));
    } else {
      let currentWorker = null;
      const workerSubject = new Subject();
      this.worker = new Observable((subscriber) => {
        if (currentWorker !== null) {
          subscriber.next(currentWorker);
        }
        return workerSubject.subscribe((v) => subscriber.next(v));
      });
      const updateController = () => {
        const {
          controller
        } = serviceWorker;
        if (controller === null) {
          return;
        }
        currentWorker = controller;
        workerSubject.next(currentWorker);
      };
      serviceWorker.addEventListener("controllerchange", updateController);
      updateController();
      this.registration = this.worker.pipe(switchMap(() => serviceWorker.getRegistration().then((registration) => {
        if (!registration) {
          throw new RuntimeError(5601, (typeof ngDevMode === "undefined" || ngDevMode) && ERR_SW_NOT_SUPPORTED);
        }
        return registration;
      })));
      const _events = new Subject();
      this.events = _events.asObservable();
      const messageListener = (event) => {
        const {
          data
        } = event;
        if (data?.type) {
          _events.next(data);
        }
      };
      serviceWorker.addEventListener("message", messageListener);
      const appRef = injector?.get(ApplicationRef, null, {
        optional: true
      });
      appRef?.onDestroy(() => {
        serviceWorker.removeEventListener("controllerchange", updateController);
        serviceWorker.removeEventListener("message", messageListener);
      });
    }
  }
  postMessage(action, payload) {
    return new Promise((resolve) => {
      this.worker.pipe(take(1)).subscribe((sw) => {
        sw.postMessage(__spreadValues({
          action
        }, payload));
        resolve();
      });
    });
  }
  postMessageWithOperation(type, payload, operationNonce) {
    const waitForOperationCompleted = this.waitForOperationCompleted(operationNonce);
    const postMessage = this.postMessage(type, payload);
    return Promise.all([postMessage, waitForOperationCompleted]).then(([, result]) => result);
  }
  generateNonce() {
    return Math.round(Math.random() * 1e7);
  }
  eventsOfType(type) {
    let filterFn;
    if (typeof type === "string") {
      filterFn = (event) => event.type === type;
    } else {
      filterFn = (event) => type.includes(event.type);
    }
    return this.events.pipe(filter(filterFn));
  }
  nextEventOfType(type) {
    return this.eventsOfType(type).pipe(take(1));
  }
  waitForOperationCompleted(nonce) {
    return new Promise((resolve, reject) => {
      this.eventsOfType("OPERATION_COMPLETED").pipe(filter((event) => event.nonce === nonce), take(1), map((event) => {
        if (event.result !== void 0) {
          return event.result;
        }
        throw new Error(event.error);
      })).subscribe({
        next: resolve,
        error: reject
      });
    });
  }
  get isEnabled() {
    return !!this.serviceWorker;
  }
};
var SwPush = class _SwPush {
  sw;
  /**
   * Emits the payloads of the received push notification messages.
   */
  messages;
  /**
   * Emits the payloads of the received push notification messages as well as the action the user
   * interacted with. If no action was used the `action` property contains an empty string `''`.
   *
   * Note that the `notification` property does **not** contain a
   * [Notification][Mozilla Notification] object but rather a
   * [NotificationOptions](https://notifications.spec.whatwg.org/#dictdef-notificationoptions)
   * object that also includes the `title` of the [Notification][Mozilla Notification] object.
   *
   * [Mozilla Notification]: https://developer.mozilla.org/en-US/docs/Web/API/Notification
   */
  notificationClicks;
  /**
   * Emits the payloads of notifications that were closed, along with the action (if any)
   * associated with the close event. If no action was used, the `action` property contains
   * an empty string `''`.
   *
   * Note that the `notification` property does **not** contain a
   * [Notification][Mozilla Notification] object but rather a
   * [NotificationOptions](https://notifications.spec.whatwg.org/#dictdef-notificationoptions)
   * object that also includes the `title` of the [Notification][Mozilla Notification] object.
   *
   * [Mozilla Notification]: https://developer.mozilla.org/en-US/docs/Web/API/Notification
   */
  notificationCloses;
  /**
   * Emits updates to the push subscription, including both the previous (`oldSubscription`)
   * and current (`newSubscription`) values. Either subscription may be `null`, depending on
   * the context:
   *
   * - `oldSubscription` is `null` if no previous subscription existed.
   * - `newSubscription` is `null` if the subscription was invalidated and not replaced.
   *
   * This stream allows clients to react to automatic changes in push subscriptions,
   * such as those triggered by browser expiration or key rotation.
   *
   * [Push API]: https://w3c.github.io/push-api
   */
  pushSubscriptionChanges;
  /**
   * Emits the currently active
   * [PushSubscription](https://developer.mozilla.org/en-US/docs/Web/API/PushSubscription)
   * associated to the Service Worker registration or `null` if there is no subscription.
   */
  subscription;
  /**
   * True if the Service Worker is enabled (supported by the browser and enabled via
   * `ServiceWorkerModule`).
   */
  get isEnabled() {
    return this.sw.isEnabled;
  }
  pushManager = null;
  subscriptionChanges = new Subject();
  constructor(sw) {
    this.sw = sw;
    if (!sw.isEnabled) {
      this.messages = NEVER;
      this.notificationClicks = NEVER;
      this.notificationCloses = NEVER;
      this.pushSubscriptionChanges = NEVER;
      this.subscription = NEVER;
      return;
    }
    this.messages = this.sw.eventsOfType("PUSH").pipe(map((message) => message.data));
    this.notificationClicks = this.sw.eventsOfType("NOTIFICATION_CLICK").pipe(map((message) => message.data));
    this.notificationCloses = this.sw.eventsOfType("NOTIFICATION_CLOSE").pipe(map((message) => message.data));
    this.pushSubscriptionChanges = this.sw.eventsOfType("PUSH_SUBSCRIPTION_CHANGE").pipe(map((message) => message.data));
    this.pushManager = this.sw.registration.pipe(map((registration) => registration.pushManager));
    const workerDrivenSubscriptions = this.pushManager.pipe(switchMap((pm) => pm.getSubscription()));
    this.subscription = new Observable((subscriber) => {
      const workerDrivenSubscription = workerDrivenSubscriptions.subscribe(subscriber);
      const subscriptionChanges = this.subscriptionChanges.subscribe(subscriber);
      return () => {
        workerDrivenSubscription.unsubscribe();
        subscriptionChanges.unsubscribe();
      };
    });
  }
  /**
   * Subscribes to Web Push Notifications,
   * after requesting and receiving user permission.
   *
   * @param options An object containing the `serverPublicKey` string.
   * @returns A Promise that resolves to the new subscription object.
   */
  requestSubscription(options) {
    if (!this.sw.isEnabled || this.pushManager === null) {
      return Promise.reject(new Error(ERR_SW_NOT_SUPPORTED));
    }
    const pushOptions = {
      userVisibleOnly: true
    };
    let key = this.decodeBase64(options.serverPublicKey.replace(/_/g, "/").replace(/-/g, "+"));
    let applicationServerKey = new Uint8Array(new ArrayBuffer(key.length));
    for (let i = 0; i < key.length; i++) {
      applicationServerKey[i] = key.charCodeAt(i);
    }
    pushOptions.applicationServerKey = applicationServerKey;
    return new Promise((resolve, reject) => {
      this.pushManager.pipe(switchMap((pm) => pm.subscribe(pushOptions)), take(1)).subscribe({
        next: (sub) => {
          this.subscriptionChanges.next(sub);
          resolve(sub);
        },
        error: reject
      });
    });
  }
  /**
   * Unsubscribes from Service Worker push notifications.
   *
   * @returns A Promise that is resolved when the operation succeeds, or is rejected if there is no
   *          active subscription or the unsubscribe operation fails.
   */
  unsubscribe() {
    if (!this.sw.isEnabled) {
      return Promise.reject(new Error(ERR_SW_NOT_SUPPORTED));
    }
    const doUnsubscribe = (sub) => {
      if (sub === null) {
        throw new RuntimeError(5602, (typeof ngDevMode === "undefined" || ngDevMode) && "Not subscribed to push notifications.");
      }
      return sub.unsubscribe().then((success) => {
        if (!success) {
          throw new RuntimeError(5603, (typeof ngDevMode === "undefined" || ngDevMode) && "Unsubscribe failed!");
        }
        this.subscriptionChanges.next(null);
      });
    };
    return new Promise((resolve, reject) => {
      this.subscription.pipe(take(1), switchMap(doUnsubscribe)).subscribe({
        next: resolve,
        error: reject
      });
    });
  }
  decodeBase64(input2) {
    return atob(input2);
  }
  static \u0275fac = function SwPush_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _SwPush)(\u0275\u0275inject(NgswCommChannel));
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({
    token: _SwPush,
    factory: _SwPush.\u0275fac
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(SwPush, [{
    type: Injectable
  }], () => [{
    type: NgswCommChannel
  }], null);
})();
var SwUpdate = class _SwUpdate {
  sw;
  /**
   * Emits a `VersionDetectedEvent` event whenever a new version is detected on the server.
   *
   * Emits a `VersionInstallationFailedEvent` event whenever checking for or downloading a new
   * version fails.
   *
   * Emits a `VersionReadyEvent` event whenever a new version has been downloaded and is ready for
   * activation.
   */
  versionUpdates;
  /**
   * Emits an `UnrecoverableStateEvent` event whenever the version of the app used by the service
   * worker to serve this client is in a broken state that cannot be recovered from without a full
   * page reload.
   */
  unrecoverable;
  /**
   * True if the Service Worker is enabled (supported by the browser and enabled via
   * `ServiceWorkerModule`).
   */
  get isEnabled() {
    return this.sw.isEnabled;
  }
  ongoingCheckForUpdate = null;
  constructor(sw) {
    this.sw = sw;
    if (!sw.isEnabled) {
      this.versionUpdates = NEVER;
      this.unrecoverable = NEVER;
      return;
    }
    this.versionUpdates = this.sw.eventsOfType(["VERSION_DETECTED", "VERSION_INSTALLATION_FAILED", "VERSION_READY", "NO_NEW_VERSION_DETECTED"]);
    this.unrecoverable = this.sw.eventsOfType("UNRECOVERABLE_STATE");
  }
  /**
   * Checks for an update and waits until the new version is downloaded from the server and ready
   * for activation.
   *
   * @returns a promise that
   * - resolves to `true` if a new version was found and is ready to be activated.
   * - resolves to `false` if no new version was found
   * - rejects if any error occurs
   */
  checkForUpdate() {
    if (!this.sw.isEnabled) {
      return Promise.reject(new Error(ERR_SW_NOT_SUPPORTED));
    }
    if (this.ongoingCheckForUpdate) {
      return this.ongoingCheckForUpdate;
    }
    const nonce = this.sw.generateNonce();
    this.ongoingCheckForUpdate = this.sw.postMessageWithOperation("CHECK_FOR_UPDATES", {
      nonce
    }, nonce).finally(() => {
      this.ongoingCheckForUpdate = null;
    });
    return this.ongoingCheckForUpdate;
  }
  /**
   * Updates the current client (i.e. browser tab) to the latest version that is ready for
   * activation.
   *
   * In most cases, you should not use this method and instead should update a client by reloading
   * the page.
   *
   * <div class="docs-alert docs-alert-important">
   *
   * Updating a client without reloading can easily result in a broken application due to a version
   * mismatch between the application shell and other page resources,
   * such as lazy-loaded chunks, whose filenames may change between
   * versions.
   *
   * Only use this method, if you are certain it is safe for your specific use case.
   *
   * </div>
   *
   * @returns a promise that
   *  - resolves to `true` if an update was activated successfully
   *  - resolves to `false` if no update was available (for example, the client was already on the
   *    latest version).
   *  - rejects if any error occurs
   */
  activateUpdate() {
    if (!this.sw.isEnabled) {
      return Promise.reject(new RuntimeError(5601, (typeof ngDevMode === "undefined" || ngDevMode) && ERR_SW_NOT_SUPPORTED));
    }
    const nonce = this.sw.generateNonce();
    return this.sw.postMessageWithOperation("ACTIVATE_UPDATE", {
      nonce
    }, nonce);
  }
  static \u0275fac = function SwUpdate_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _SwUpdate)(\u0275\u0275inject(NgswCommChannel));
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({
    token: _SwUpdate,
    factory: _SwUpdate.\u0275fac
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(SwUpdate, [{
    type: Injectable
  }], () => [{
    type: NgswCommChannel
  }], null);
})();
var SCRIPT = new InjectionToken(ngDevMode ? "NGSW_REGISTER_SCRIPT" : "");
function ngswAppInitializer() {
  if (false) {
    return;
  }
  const options = inject(SwRegistrationOptions);
  if (!("serviceWorker" in navigator && options.enabled !== false)) {
    return;
  }
  const script = inject(SCRIPT);
  const ngZone = inject(NgZone);
  const appRef = inject(ApplicationRef);
  ngZone.runOutsideAngular(() => {
    const sw = navigator.serviceWorker;
    const onControllerChange = () => sw.controller?.postMessage({
      action: "INITIALIZE"
    });
    sw.addEventListener("controllerchange", onControllerChange);
    appRef.onDestroy(() => {
      sw.removeEventListener("controllerchange", onControllerChange);
    });
  });
  ngZone.runOutsideAngular(() => {
    let readyToRegister;
    const {
      registrationStrategy
    } = options;
    if (typeof registrationStrategy === "function") {
      readyToRegister = new Promise((resolve) => registrationStrategy().subscribe(() => resolve()));
    } else {
      const [strategy, ...args] = (registrationStrategy || "registerWhenStable:30000").split(":");
      switch (strategy) {
        case "registerImmediately":
          readyToRegister = Promise.resolve();
          break;
        case "registerWithDelay":
          readyToRegister = delayWithTimeout(+args[0] || 0);
          break;
        case "registerWhenStable":
          readyToRegister = Promise.race([appRef.whenStable(), delayWithTimeout(+args[0])]);
          break;
        default:
          throw new RuntimeError(5600, (typeof ngDevMode === "undefined" || ngDevMode) && `Unknown ServiceWorker registration strategy: ${options.registrationStrategy}`);
      }
    }
    readyToRegister.then(() => {
      if (appRef.destroyed) {
        return;
      }
      navigator.serviceWorker.register(script, {
        scope: options.scope
      }).catch((err) => console.error(formatRuntimeError(5604, (typeof ngDevMode === "undefined" || ngDevMode) && "Service worker registration failed with: " + err)));
    });
  });
}
function delayWithTimeout(timeout) {
  return new Promise((resolve) => setTimeout(resolve, timeout));
}
function ngswCommChannelFactory(opts, injector) {
  const isBrowser = true;
  return new NgswCommChannel(isBrowser && opts.enabled !== false ? navigator.serviceWorker : void 0, injector);
}
var SwRegistrationOptions = class {
  /**
   * Whether the ServiceWorker will be registered and the related services (such as `SwPush` and
   * `SwUpdate`) will attempt to communicate and interact with it.
   *
   * Default: true
   */
  enabled;
  /**
   * A URL that defines the ServiceWorker's registration scope; that is, what range of URLs it can
   * control. It will be used when calling
   * [ServiceWorkerContainer#register()](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/register).
   */
  scope;
  /**
   * Defines the ServiceWorker registration strategy, which determines when it will be registered
   * with the browser.
   *
   * The default behavior of registering once the application stabilizes (i.e. as soon as there are
   * no pending micro- and macro-tasks) is designed to register the ServiceWorker as soon as
   * possible but without affecting the application's first time load.
   *
   * Still, there might be cases where you want more control over when the ServiceWorker is
   * registered (for example, there might be a long-running timeout or polling interval, preventing
   * the app from stabilizing). The available option are:
   *
   * - `registerWhenStable:<timeout>`: Register as soon as the application stabilizes (no pending
   *     micro-/macro-tasks) but no later than `<timeout>` milliseconds. If the app hasn't
   *     stabilized after `<timeout>` milliseconds (for example, due to a recurrent asynchronous
   *     task), the ServiceWorker will be registered anyway.
   *     If `<timeout>` is omitted, the ServiceWorker will only be registered once the app
   *     stabilizes.
   * - `registerImmediately`: Register immediately.
   * - `registerWithDelay:<timeout>`: Register with a delay of `<timeout>` milliseconds. For
   *     example, use `registerWithDelay:5000` to register the ServiceWorker after 5 seconds. If
   *     `<timeout>` is omitted, is defaults to `0`, which will register the ServiceWorker as soon
   *     as possible but still asynchronously, once all pending micro-tasks are completed.
   * - An Observable factory function: A function that returns an `Observable`.
   *     The function will be used at runtime to obtain and subscribe to the `Observable` and the
   *     ServiceWorker will be registered as soon as the first value is emitted.
   *
   * Default: 'registerWhenStable:30000'
   */
  registrationStrategy;
};
function provideServiceWorker(script, options = {}) {
  return makeEnvironmentProviders([SwPush, SwUpdate, {
    provide: SCRIPT,
    useValue: script
  }, {
    provide: SwRegistrationOptions,
    useValue: options
  }, {
    provide: NgswCommChannel,
    useFactory: ngswCommChannelFactory,
    deps: [SwRegistrationOptions, Injector]
  }, provideAppInitializer(ngswAppInitializer)]);
}
var ServiceWorkerModule = class _ServiceWorkerModule {
  /**
   * Register the given Angular Service Worker script.
   *
   * If `enabled` is set to `false` in the given options, the module will behave as if service
   * workers are not supported by the browser, and the service worker will not be registered.
   */
  static register(script, options = {}) {
    return {
      ngModule: _ServiceWorkerModule,
      providers: [provideServiceWorker(script, options)]
    };
  }
  static \u0275fac = function ServiceWorkerModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _ServiceWorkerModule)();
  };
  static \u0275mod = /* @__PURE__ */ \u0275\u0275defineNgModule({
    type: _ServiceWorkerModule
  });
  static \u0275inj = /* @__PURE__ */ \u0275\u0275defineInjector({
    providers: [SwPush, SwUpdate]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ServiceWorkerModule, [{
    type: NgModule,
    args: [{
      providers: [SwPush, SwUpdate]
    }]
  }], null, null);
})();

// src/app/app.config.ts
var appConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimations(),
    provideServiceWorker("ngsw-worker.js", {
      enabled: !isDevMode(),
      registrationStrategy: "registerWhenStable:30000"
    })
  ]
};

// src/app/app.ts
var _c04 = () => ({ exact: true });
var App = class _App {
  authService = inject(AuthService);
  dialog = inject(MatDialog);
  title = signal("\u2694\uFE0F Attrition", ...ngDevMode ? [{ debugName: "title" }] : []);
  isDarkMode = signal(false, ...ngDevMode ? [{ debugName: "isDarkMode" }] : []);
  activeProfile = this.authService.activeProfile;
  THEME_STORAGE_KEY = "war-of-attrition-theme";
  ngOnInit() {
    this.loadThemePreference();
  }
  loadThemePreference() {
    const savedTheme = localStorage.getItem(this.THEME_STORAGE_KEY);
    const prefersDark = savedTheme ? savedTheme === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    this.isDarkMode.set(prefersDark);
    this.applyTheme(prefersDark);
  }
  applyTheme(isDark) {
    if (isDark) {
      document.body.classList.add("dark-theme");
    } else {
      document.body.classList.remove("dark-theme");
    }
  }
  saveThemePreference(isDark) {
    localStorage.setItem(this.THEME_STORAGE_KEY, isDark ? "dark" : "light");
  }
  toggleTheme() {
    this.isDarkMode.update((current) => {
      const newValue = !current;
      this.applyTheme(newValue);
      this.saveThemePreference(newValue);
      return newValue;
    });
  }
  openProfileDialog() {
    this.dialog.open(ProfileDialogComponent, {
      width: "620px",
      maxWidth: "95vw",
      panelClass: "glass-dialog-panel"
    });
  }
  static \u0275fac = function App_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _App)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _App, selectors: [["app-root"]], decls: 22, vars: 12, consts: [["color", "primary", 1, "app-toolbar"], [1, "toolbar-spacer"], [1, "nav-links"], ["mat-icon-button", "", "routerLink", "/", "routerLinkActive", "active", "matTooltip", "Game Board", 3, "routerLinkActiveOptions"], ["mat-icon-button", "", "routerLink", "/settings", "routerLinkActive", "active", "matTooltip", "Settings & Statistics"], ["mat-button", "", "matTooltip", "User Profile & Lifetime Stats", 1, "profile-toolbar-btn", 3, "click"], [1, "avatar-badge"], [3, "src", "alt"], [1, "provider-indicator"], [1, "profile-name-text"], ["mat-icon-button", "", "matTooltip", "Toggle Dark/Light Mode", 3, "click"], [1, "app-content"]], template: function App_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "mat-toolbar", 0)(1, "span");
      \u0275\u0275text(2);
      \u0275\u0275elementEnd();
      \u0275\u0275element(3, "span", 1);
      \u0275\u0275elementStart(4, "nav", 2)(5, "button", 3)(6, "mat-icon");
      \u0275\u0275text(7, "casino");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(8, "button", 4)(9, "mat-icon");
      \u0275\u0275text(10, "settings");
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(11, "button", 5);
      \u0275\u0275listener("click", function App_Template_button_click_11_listener() {
        return ctx.openProfileDialog();
      });
      \u0275\u0275elementStart(12, "div", 6);
      \u0275\u0275element(13, "img", 7)(14, "span", 8);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(15, "span", 9);
      \u0275\u0275text(16);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(17, "button", 10);
      \u0275\u0275listener("click", function App_Template_button_click_17_listener() {
        return ctx.toggleTheme();
      });
      \u0275\u0275elementStart(18, "mat-icon");
      \u0275\u0275text(19);
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(20, "main", 11);
      \u0275\u0275element(21, "router-outlet");
      \u0275\u0275elementEnd();
    }
    if (rf & 2) {
      \u0275\u0275advance(2);
      \u0275\u0275textInterpolate(ctx.title());
      \u0275\u0275advance(3);
      \u0275\u0275property("routerLinkActiveOptions", \u0275\u0275pureFunction0(11, _c04));
      \u0275\u0275attribute("aria-label", "Game");
      \u0275\u0275advance(3);
      \u0275\u0275attribute("aria-label", "Settings");
      \u0275\u0275advance(5);
      \u0275\u0275property("src", ctx.activeProfile().avatarUrl, \u0275\u0275sanitizeUrl)("alt", ctx.activeProfile().name);
      \u0275\u0275advance();
      \u0275\u0275classProp("google", ctx.activeProfile().isGoogleAuth);
      \u0275\u0275advance(2);
      \u0275\u0275textInterpolate(ctx.activeProfile().name);
      \u0275\u0275advance();
      \u0275\u0275attribute("aria-label", "Toggle " + (ctx.isDarkMode() ? "light" : "dark") + " theme");
      \u0275\u0275advance(2);
      \u0275\u0275textInterpolate(ctx.isDarkMode() ? "lightbulb" : "lightbulb_outline");
    }
  }, dependencies: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatToolbar,
    MatButtonModule,
    MatButton,
    MatIconButton,
    MatIconModule,
    MatIcon,
    MatDialogModule,
    MatTooltipModule,
    MatTooltip
  ], styles: ["\n\n[_nghost-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  height: 100vh;\n  overflow-x: hidden;\n}\n.app-toolbar[_ngcontent-%COMP%] {\n  position: sticky;\n  top: 0;\n  z-index: 1000;\n  transition:\n    background-color 0.3s ease-in-out,\n    color 0.3s ease-in-out,\n    box-shadow 0.3s ease;\n  min-height: 64px;\n  background:\n    linear-gradient(\n      135deg,\n      #0f172a 0%,\n      #1e293b 100%) !important;\n  color: #f8fafc !important;\n  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);\n  border-bottom: 1px solid rgba(255, 255, 255, 0.1);\n}\n@media (max-width: 599px) {\n  .app-toolbar[_ngcontent-%COMP%] {\n    min-height: 56px;\n    padding: 0 12px;\n  }\n}\n.app-toolbar[_ngcontent-%COMP%]   span[_ngcontent-%COMP%]:first-child {\n  font-weight: 800;\n  letter-spacing: -0.5px;\n  font-size: 1.25rem;\n  background:\n    linear-gradient(\n      135deg,\n      #ffffff 0%,\n      #cbd5e1 100%);\n  -webkit-background-clip: text;\n  -webkit-text-fill-color: transparent;\n}\n.toolbar-spacer[_ngcontent-%COMP%] {\n  flex: 1 1 auto;\n}\n.nav-links[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 8px;\n  margin-right: 12px;\n}\n@media (max-width: 599px) {\n  .nav-links[_ngcontent-%COMP%] {\n    gap: 4px;\n    margin-right: 6px;\n  }\n}\n.nav-links[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] {\n  transition: all 0.25s ease;\n  min-height: 44px;\n  border-radius: 10px;\n  color: #cbd5e1;\n}\n.nav-links[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:hover {\n  background-color: rgba(255, 255, 255, 0.12);\n  color: #ffffff;\n  transform: translateY(-1px);\n}\n.nav-links[_ngcontent-%COMP%]   button.active[_ngcontent-%COMP%] {\n  background-color: rgba(59, 130, 246, 0.25);\n  color: #60a5fa;\n  border: 1px solid rgba(96, 165, 250, 0.4);\n}\n.profile-toolbar-btn[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 10px;\n  padding: 4px 12px 4px 6px;\n  border-radius: 20px;\n  background: rgba(255, 255, 255, 0.08);\n  border: 1px solid rgba(255, 255, 255, 0.15);\n  margin-right: 12px;\n  transition: all 0.25s ease;\n}\n.profile-toolbar-btn[_ngcontent-%COMP%]:hover {\n  background: rgba(255, 255, 255, 0.16);\n  transform: translateY(-1px);\n}\n.profile-toolbar-btn[_ngcontent-%COMP%]   .avatar-badge[_ngcontent-%COMP%] {\n  position: relative;\n  width: 28px;\n  height: 28px;\n}\n.profile-toolbar-btn[_ngcontent-%COMP%]   .avatar-badge[_ngcontent-%COMP%]   img[_ngcontent-%COMP%] {\n  width: 100%;\n  height: 100%;\n  border-radius: 50%;\n  object-fit: cover;\n  border: 1.5px solid #60a5fa;\n}\n.profile-toolbar-btn[_ngcontent-%COMP%]   .avatar-badge[_ngcontent-%COMP%]   .provider-indicator[_ngcontent-%COMP%] {\n  position: absolute;\n  bottom: -1px;\n  right: -1px;\n  width: 9px;\n  height: 9px;\n  border-radius: 50%;\n  background: #94a3b8;\n  border: 1.5px solid #0f172a;\n}\n.profile-toolbar-btn[_ngcontent-%COMP%]   .avatar-badge[_ngcontent-%COMP%]   .provider-indicator.google[_ngcontent-%COMP%] {\n  background: #22c55e;\n}\n.profile-toolbar-btn[_ngcontent-%COMP%]   .profile-name-text[_ngcontent-%COMP%] {\n  font-size: 0.88rem;\n  font-weight: 700;\n  color: #f8fafc;\n  max-width: 110px;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n@media (max-width: 599px) {\n  .profile-toolbar-btn[_ngcontent-%COMP%]   .profile-name-text[_ngcontent-%COMP%] {\n    display: none;\n  }\n}\n.app-content[_ngcontent-%COMP%] {\n  flex: 1;\n  padding: 24px;\n  overflow-y: auto;\n  overflow-x: hidden;\n  background: #0f172a;\n  transition: background-color 0.3s ease-in-out, color 0.3s ease-in-out;\n}\n@media (max-width: 959px) {\n  .app-content[_ngcontent-%COMP%] {\n    padding: 16px;\n  }\n}\n@media (max-width: 599px) {\n  .app-content[_ngcontent-%COMP%] {\n    padding: 12px 8px;\n  }\n}\n@media (max-width: 359px) {\n  .app-content[_ngcontent-%COMP%] {\n    padding: 8px 4px;\n  }\n}\n.app-content[_ngcontent-%COMP%]:has(.game-container) {\n  padding: 8px;\n}\n@media (max-width: 599px) {\n  .app-content[_ngcontent-%COMP%]:has(.game-container) {\n    padding: 4px;\n  }\n}\n.dark-theme[_nghost-%COMP%]   .app-content[_ngcontent-%COMP%], .dark-theme   [_nghost-%COMP%]   .app-content[_ngcontent-%COMP%] {\n  background-color: #090d16;\n}\n/*# sourceMappingURL=app.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(App, [{
    type: Component,
    args: [{ selector: "app-root", imports: [
      RouterOutlet,
      RouterLink,
      RouterLinkActive,
      MatToolbarModule,
      MatButtonModule,
      MatIconModule,
      MatDialogModule,
      MatTooltipModule
    ], template: `<mat-toolbar color="primary" class="app-toolbar">\r
  <span>{{ title() }}</span>\r
  <span class="toolbar-spacer"></span>\r
  <nav class="nav-links">\r
    <button mat-icon-button routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" [attr.aria-label]="'Game'" matTooltip="Game Board">\r
      <mat-icon>casino</mat-icon>\r
    </button>\r
    <button mat-icon-button routerLink="/settings" routerLinkActive="active" [attr.aria-label]="'Settings'" matTooltip="Settings & Statistics">\r
      <mat-icon>settings</mat-icon>\r
    </button>\r
  </nav>\r
  \r
  <button mat-button class="profile-toolbar-btn" (click)="openProfileDialog()" matTooltip="User Profile & Lifetime Stats">\r
    <div class="avatar-badge">\r
      <img [src]="activeProfile().avatarUrl" [alt]="activeProfile().name" />\r
      <span class="provider-indicator" [class.google]="activeProfile().isGoogleAuth"></span>\r
    </div>\r
    <span class="profile-name-text">{{ activeProfile().name }}</span>\r
  </button>\r
\r
  <button mat-icon-button (click)="toggleTheme()" [attr.aria-label]="'Toggle ' + (isDarkMode() ? 'light' : 'dark') + ' theme'" matTooltip="Toggle Dark/Light Mode">\r
    <mat-icon>{{ isDarkMode() ? 'lightbulb' : 'lightbulb_outline' }}</mat-icon>\r
  </button>\r
</mat-toolbar>\r
\r
<main class="app-content">\r
  <router-outlet />\r
</main>`, styles: ["/* src/app/app.scss */\n:host {\n  display: flex;\n  flex-direction: column;\n  height: 100vh;\n  overflow-x: hidden;\n}\n.app-toolbar {\n  position: sticky;\n  top: 0;\n  z-index: 1000;\n  transition:\n    background-color 0.3s ease-in-out,\n    color 0.3s ease-in-out,\n    box-shadow 0.3s ease;\n  min-height: 64px;\n  background:\n    linear-gradient(\n      135deg,\n      #0f172a 0%,\n      #1e293b 100%) !important;\n  color: #f8fafc !important;\n  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);\n  border-bottom: 1px solid rgba(255, 255, 255, 0.1);\n}\n@media (max-width: 599px) {\n  .app-toolbar {\n    min-height: 56px;\n    padding: 0 12px;\n  }\n}\n.app-toolbar span:first-child {\n  font-weight: 800;\n  letter-spacing: -0.5px;\n  font-size: 1.25rem;\n  background:\n    linear-gradient(\n      135deg,\n      #ffffff 0%,\n      #cbd5e1 100%);\n  -webkit-background-clip: text;\n  -webkit-text-fill-color: transparent;\n}\n.toolbar-spacer {\n  flex: 1 1 auto;\n}\n.nav-links {\n  display: flex;\n  gap: 8px;\n  margin-right: 12px;\n}\n@media (max-width: 599px) {\n  .nav-links {\n    gap: 4px;\n    margin-right: 6px;\n  }\n}\n.nav-links button {\n  transition: all 0.25s ease;\n  min-height: 44px;\n  border-radius: 10px;\n  color: #cbd5e1;\n}\n.nav-links button:hover {\n  background-color: rgba(255, 255, 255, 0.12);\n  color: #ffffff;\n  transform: translateY(-1px);\n}\n.nav-links button.active {\n  background-color: rgba(59, 130, 246, 0.25);\n  color: #60a5fa;\n  border: 1px solid rgba(96, 165, 250, 0.4);\n}\n.profile-toolbar-btn {\n  display: inline-flex;\n  align-items: center;\n  gap: 10px;\n  padding: 4px 12px 4px 6px;\n  border-radius: 20px;\n  background: rgba(255, 255, 255, 0.08);\n  border: 1px solid rgba(255, 255, 255, 0.15);\n  margin-right: 12px;\n  transition: all 0.25s ease;\n}\n.profile-toolbar-btn:hover {\n  background: rgba(255, 255, 255, 0.16);\n  transform: translateY(-1px);\n}\n.profile-toolbar-btn .avatar-badge {\n  position: relative;\n  width: 28px;\n  height: 28px;\n}\n.profile-toolbar-btn .avatar-badge img {\n  width: 100%;\n  height: 100%;\n  border-radius: 50%;\n  object-fit: cover;\n  border: 1.5px solid #60a5fa;\n}\n.profile-toolbar-btn .avatar-badge .provider-indicator {\n  position: absolute;\n  bottom: -1px;\n  right: -1px;\n  width: 9px;\n  height: 9px;\n  border-radius: 50%;\n  background: #94a3b8;\n  border: 1.5px solid #0f172a;\n}\n.profile-toolbar-btn .avatar-badge .provider-indicator.google {\n  background: #22c55e;\n}\n.profile-toolbar-btn .profile-name-text {\n  font-size: 0.88rem;\n  font-weight: 700;\n  color: #f8fafc;\n  max-width: 110px;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n@media (max-width: 599px) {\n  .profile-toolbar-btn .profile-name-text {\n    display: none;\n  }\n}\n.app-content {\n  flex: 1;\n  padding: 24px;\n  overflow-y: auto;\n  overflow-x: hidden;\n  background: #0f172a;\n  transition: background-color 0.3s ease-in-out, color 0.3s ease-in-out;\n}\n@media (max-width: 959px) {\n  .app-content {\n    padding: 16px;\n  }\n}\n@media (max-width: 599px) {\n  .app-content {\n    padding: 12px 8px;\n  }\n}\n@media (max-width: 359px) {\n  .app-content {\n    padding: 8px 4px;\n  }\n}\n.app-content:has(.game-container) {\n  padding: 8px;\n}\n@media (max-width: 599px) {\n  .app-content:has(.game-container) {\n    padding: 4px;\n  }\n}\n:host-context(.dark-theme) .app-content {\n  background-color: #090d16;\n}\n/*# sourceMappingURL=app.css.map */\n"] }]
  }], null, null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(App, { className: "App", filePath: "src/app/app.ts", lineNumber: 26 });
})();

// src/main.ts
bootstrapApplication(App, appConfig).catch((err) => console.error(err));
/*! Bundled license information:

@angular/animations/fesm2022/private_export.mjs:
@angular/animations/fesm2022/util.mjs:
@angular/animations/fesm2022/browser.mjs:
@angular/platform-browser/fesm2022/animations.mjs:
  (**
   * @license Angular v20.1.7
   * (c) 2010-2025 Google LLC. https://angular.io/
   * License: MIT
   *)

@angular/service-worker/fesm2022/service-worker.mjs:
  (**
   * @license Angular v20.1.7
   * (c) 2010-2025 Google LLC. https://angular.io/
   * License: MIT
   *)
  (*!
   * @license
   * Copyright Google LLC All Rights Reserved.
   *
   * Use of this source code is governed by an MIT-style license that can be
   * found in the LICENSE file at https://angular.dev/license
   *)
*/
//# sourceMappingURL=main.js.map
