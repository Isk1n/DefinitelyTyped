// Type definitions for gemini 5.0
// Project: https://github.com/gemini-testing/gemini
// Definitions by: Oleksii Davydov <https://github.com/Isk1n>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

// For each block of website that will be tested you need to write one or more
// test suites*. Suite consists of few *states* that need to be verified. For
// each state you need to specify *action sequence* that gets block to this
// state.
declare namespace gemini {
    /**
     * Gemini test suite
     * Suites can be nested. In this case, inner suite inherits `url`,
     * `captureElements` from outer. This properties can be overridden in inner
     * suites without affecting the outer. Each new suite causes reload of the
     * browser, even if URL was not changed.
     *
     * @param {string} name The name of the new test suite. Name is displayed in reports and
     * affects screenshots filenames. **Important** Name of test suite can not be empty.
     * @param {(suite: SuiteBuilder) => void} callback Callback, used to set up the suite. Receives a suite
     * builder instance
     */
    export function suite(name: string, callback: (suite: gemini.SuiteBuilder) => void): void;
    export interface SuiteBuilder {
        /**
         * Specifies address of a web page to take screenshots from.
         *
         * URL is relative to `rootUrl` config field.
         * @param {string} url
         * @returns {SuiteBuilder}
         */
        setUrl(url: string): SuiteBuilder,

        /**
         * Specifies CSS selectors of the elements that will be used to determine a region of a web page to capture.
         *
         * Capture region is determined by minimum bounding rect for all of the elements plus their `box-shadow` size.
         *
         * All tests in a suite will fail if none of the elements will be found.
         * @param {(string | string[])} selector
         * @param {...string[]} restSelectors
         * @returns {SuiteBuilder}
         */
        setCaptureElements(selector: string | string[], ...restSelectors: string[]): SuiteBuilder,

        /**
         * Elements, matching specified selectors will be ignored when comparing images.
         *
         *  - `.selector1` — Ignore only the first matched element.
         *  - `{every: '.selector2'}` — Ignore all matched elements. *
         *
         * @param {(string | IgnoreSelector)} selector
         * @param {(...(string | IgnoreSelector)[])} restSelectors
         * @returns {SuiteBuilder}
         */
        ignoreElements(selector: string | IgnoreSelector, ...restSelectors: (string | IgnoreSelector)[]): SuiteBuilder,

        /**
         * Overrides global tolerance value for the whole suite
         *
         * (See toleranceoption description in config documentation for details).
         * https://github.com/gemini-testing/gemini/blob/master/doc/config.md
         *
         * @param {number} value
         * @returns {SuiteBuilder}
         */
        setTolerance(value: number): SuiteBuilder,

        /**
         * Skip all tests and nested suites for:
         *
         * - `skip()` — all browsers;
         *
         * - `skip('id')` — browser with specified `id`;
         *
         * - `skip('id', comment)` — browser with specified `id` and show `comment` in the report;
         *
         * - `skip(/some RegExp/)` — browser with `id` which matches `/some RegExp/`;
         *
         * - `skip(/some RegExp/, comment)` — browser with `id` which matches `/some RegExp/` and show `comment` in the report;
         *
         * - `skip(['id1', /RegExp1/, ...])` — multiple browsers;
         *
         * - `skip(['id1', /RegExp1/, ...], comment)` — multiple browsers and show `comment` in the report.
         *
         * All browsers from subsequent calls to `.skip()` are added to the skip list:
         *
         * ```js
         * suite
         *     .skip('id1')
         *     .skip(/RegExp1/);
         * ```
         *
         * is equivalent to
         *
         * ```js
         * suite.skip([
         *     'id1',
         *     /RegExp1/
         * ]);
         * ```
         *
         * @param {(string | RegExp | (string | RegExp)[])} [browser]
         * @param {string} [comment]
         * @returns {SuiteBuilder}
         */
        skip(browser?: string | RegExp | (string | RegExp)[], comment?: string): SuiteBuilder,

        /**
         * Run all tests and nested suites in specified browsers:
         *
         *   - `browsers('id')` — browser with specified `id`;
         *
         *   - `browsers(/some RegExp/)` — browser `id` which matches `/some RegExp/`;
         *
         *   - `browsers(['id1', /RegExp1/, ...])` — multiple browsers.
         *
         * @param {(string | RegExp | (string | RegExp)[])} browser
         * @returns {SuiteBuilder}
         */
        browsers(browser: string | RegExp | (string | RegExp)[]): SuiteBuilder,

        /**
         *  Defines a new
         *  state to capture. Optional callback describes a sequence of actions to bring
         *  the page to this state, starting from a **previous** state of the suite.
         *  States are executed one after another in order of definition without browser
         *  reload in between.
         *
         *  Callback accepts two arguments:
         *   * `actions` — chainable object that should be used to specify a series of
         *     actions to perform.
         *
         *   * `find(selector)` —  use this function to search for an element to act on.
         *     Search is lazy and actually will be performed the first time element is
         *     needed. Search will be performed once for each `find` call, so if you
         *     need to perform multiple actions on the same element, save the result to
         *     some variable:
         *
         *     ```js
         *     .capture('name', function(actions, find) {
         *         var button = find('.button');
         *         actions.mouseDown(button)
         *             .mouseUp(button);
         *     });
         *     ```
         *
         *    Options parameter allows you to override a `tolerance` value for one test:
         *
         *    ```js
         *    .capture('name', {tolerance: 30}, function(actions, find) {
         *
         *    });
         *    ```
         * (See toleranceoption description in config documentation for details).
         * https://github.com/gemini-testing/gemini/blob/master/doc/config.md
         *
         * @param {string} stateName
         * @param {CaptureOptions} [options]
         * @param {((actions: Actions, find: (selector: string | string[]) => Found) => void)} [callback]
         * @returns {SuiteBuilder}
         */
        capture(this: SuiteBuilder, stateName: string, optionsOrCallback?: CaptureOptions | ActionsFindCallback, callback?: ActionsFindCallback): SuiteBuilder,


        /**
         * Use this function to execute some code
         * before the first state. The arguments of a callback are the same as for
         * `capture` callback. Context is shared between `before` callback and all of
         * suite's state callbacks, so you can use this hook to lookup for an element
         * only once for the whole suite:
         *
         * ```js
         * suite
         *     .before(function(actions, find) {
         *         this.button = find('.buttons');
         *     })
         *     .capture('hovered', function(actions, find) {
         *         actions.mouseMove(this.button);
         *     })
         *     .capture('pressed', function(actions, find) {
         *         actions.mouseDown(this.button);
         *     });
         * ```
         *
         * @param {ActionsFindCallback} callback
         * @returns {SuiteBuilder}
         */
        before(this: SuiteBuilder, callback: ActionsFindCallback): SuiteBuilder,


        /**
         * Use this function to execute some code
         * after the last state. The arguments of a callback are the same as for
         * `capture` and `before` callbacks and context is shared between all of them.
         *
         * @param {ActionsFindCallback} callback
         * @returns {SuiteBuilder}
         */
        after(this: SuiteBuilder, callback: ActionsFindCallback): SuiteBuilder,

    }

    /**
 * Add `system.ctx` field to your configuration file:
 *
 * ```js
 * module.exports = {
 *     // ...
 *     system: {
 *         ctx: {
 *             foo: 'bar'
 *         }
 *     }
 * };
 * ```
 *
 * `ctx` will be available in tests via `gemini.ctx` method:
 *
 * ```js
 * console.log(gemini.ctx); // {foo: 'bar'}
 * ```
 *
 * **Recommendation**: use `ctx` in your tests in favor of global variables.
 */
    export const ctx: object;

    // Suite builder methods



    export interface IgnoreSelector {
        /**
         * Ignore all matched elements
         *
         * @type {string}
         */
        every: string
    }

    export interface CaptureOptions {
        /**
         * (See toleranceoption description in config documentation for details).
         * https://github.com/gemini-testing/gemini/blob/master/doc/config.md
         *
         * @type {number}
         */
        tolerance: number
    }

    /**
     * describes a sequence of actions to bring
     *  the page to this state, starting from a **previous** state of the suite.
     *  States are executed one after another in order of definition without browser
     *  reload in between.
     *
     *  Callback accepts two arguments:
     *   * `actions` — chainable object that should be used to specify a series of
     *     actions to perform.
     *
     *   * `find(selector)` —  use this function to search for an element to act on.
     *     Search is lazy and actually will be performed the first time element is
     *     needed. Search will be performed once for each `find` call, so if you
     *     need to perform multiple actions on the same element, save the result to
     *     some variable:
     *
     * @param {Actions} actions
     * @param {((selector: string | string[]) => Found)} find
     */
    export type ActionsFindCallback = (actions: Actions, find: Find) => void

    export type Find = (selector: string | string[]) => Found

    export interface Found {
        /**
         * Search is lazy and actually will be performed the first time element is
         * needed. Search will be performed once for each `find` call, so if you
         * need to perform multiple actions on the same element, save the result to
         * some variable:
         *
         * @type {(string | string[])}
         */
        readonly _selector: string | string[]
    }

    /**
     * By calling methods of the `actions` argument of a callback you can program
     * a series of steps to bring the block to desired state. All calls are chainable
     * and next step is always executed after previous one has completed.
     *
     * @interface Actions
     */
    export interface Actions {
        /**
         * Mouse click at the center of the element.
         *
         * @param {(string | Found)} element
         */
        click(element: string | Found): Actions,

        /**
         * Mouse double click at the center of the element.
         *
         * @param {(string | Found)} element
         */
        doubleClick(element: string | Found): Actions,

        /**
         * Press a mouse button at the center of the element.
         *
         * @param {(string | Found)} element
         * @param {MouseButton} [button]
         */
        mouseDown(element: string | Found, button?: MouseButton): Actions,

        /**
         * release previously pressed mouse button. If element is specified, move mouse to element and release then.
         *
         * @param {(string | Found)} [element]
         * @param {MouseButton} [button]
         * @returns {Actions}
         */
        mouseUp(element?: string | Found, button?: MouseButton): Actions,

        /**
         * move mouse to the given element. Offset is
         * specified relatively to the top left corner of the element. If not
         * specified, mouse will be moved to the center of the element.
         *
         * @param {(string | Found)} element
         * @param {Coords} [offset]
         */
        mouseMove(element: string | Found, offset?: Coords): Actions,

        /**
         * drag `element` to other `dragTo` element.
         *
         * @param {(string | Found)} element
         * @param {(string | Found)} dragTo
         */
        dragAndDrop(element: string | Found, dragTo: string | Found): Actions,

        /**
         * flick starting anywhere on the screen using `speed.x` and `speed.y` speed.
         * flick element with starting point at its center by `offsets.x` and `offset.y` offsets.
         *
         * @param {Coords} speed
         * @param {Coords} swipe
         * @param {(string | Found)} element
         */
        flick(speed: Coords, swipe: Coords, element: string | Found): Actions,

        /**
         * run specified function in a browser. The
         * argument of a function is the browser's `window` object:
         *
         * ```js
         * actions.executeJS(function(window) {
         *     window.alert('Hello!');
         * });
         * ```
         *
         *  Note that function is executed in a browser context, so any references to
         *  outer scope of callback won't work.
         *
         *  :warning: `window.scrollTo` does not work in Opera@12.16 (see [details](https://github.com/operasoftware/operaprestodriver/issues/108)).
         *
         * @param {(window: any) => void} jscript
         */
        executeJS(jscript: (window: any) => void): Actions,

        /**
         * wait for specified amount of time before next action. If it is the last action in sequence, delay the screenshot for this amount of time.
         *
         * @param {number} milliseconds
         */
        wait(milliseconds: number): Actions,

        /**
         * waits until element, matched
         * by `selector` will become visible. Fails if element does not appear after
         * `timeout` milliseconds (1000 by default).
         *
         * @param {(string | string[])} selector
         * @param {number} [timeout]
         */
        waitForElementToShow(selector: string | string[], timeout?: number): Actions,

        /**
         * waits until element, matched
         * by `selector` will become invisible or will be completely removed from DOM.
         * Fails if element still visible after `timeout` milliseconds (1000 by
         * default).
         *
         * @param {(string | string[])} selector
         * @param {number} [timeout]
         */
        waitForElementToHide(selector: string | string[], timeout?: number): Actions,

        /**
         * waits until specified
         * function return `true`. Function will be executed in browser context, so any
         * references to outer scope won't work. Fails if after `timeout` milliseconds
         * function still returns `false` (1000 by default).
         *
         * @param {(window: object) => void} jscript
         * @param {number} [timeout]
         */
        waitForJSCondition(jscript: (window: object) => void, timeout?: number): Actions,

        /**
         * send a series of keyboard strokes to the
      specified element or currently active element on a page.

       You can send a special key using one of the provided constants, i.e:

       ```js
       actions.sendKeys(gemini.ARROW_DOWN);
       ```
         *
         * @param {(string | Found | (string | Found)[])} element
         * @param {(string | Keys)} key
         */
        sendKeys(element: string | Found | (string | Found)[], key: string | Keys): Actions,


        /**
         * send file to the specified `input[type=file]`
      element. `path` must exist at local system (the one which `gemini` is
      executed on).
         *
         * @param {(string | Found | (string | Found)[])} element
         * @param {string} path
         * @returns {Actions}
         */
        sendFile(element: string | Found | (string | Found)[], path: string): Actions,


        /**
         * set a focus to a specified element.
         *
         * @param {(string | Found | (string | Found)[])} element
         * @returns {Actions}
         */
        focus(element: string | Found | (string | Found)[]): Actions,


        /**
         * change browser window dimensions. :warning: You can't set specific resolutions for browser Opera or mobile platforms. They use only full-screen resolution.
         *
         * @param {number} width
         * @param {number} height
         * @returns {Actions}
         */
        setWindowSize(width: number, height: number): Actions,

        /**
         * tap specified element on touch enabled device.
         *
         * @param {(string | Found | (string | Found)[])} element
         * @returns {Actions}
         */
        tap(element: string | Found | (string | Found)[]): Actions,


        /**
         * change orientation on touch enabled device (from `PORTRAIT` to `LANDSCAPE` and vice versa). :warning: Does not work on mobile emulation.
         *
         * @returns {Actions}
         */
        changeOrientation(): Actions,



    }

    /**
     * Possible button values are: 0 — left, 1 — middle, 2 — right. By
     * default, left button is used.
     *
     * @enum {number}
     */
    export enum MouseButton {
        left,
        middle,
        right
    }

    export interface Coords {
        x: number,
        y: number
    }

    export const NULL = '\uE000';
    export const CANCEL = '\uE001';
    export const HELP = '\uE002';
    export const BACK_SPACE = '\uE003';
    export const TAB = '\uE004';
    export const CLEAR = '\uE005';
    export const RETURN = '\uE006';
    export const ENTER = '\uE007';
    export const SHIFT = '\uE008';
    export const LEFT_SHIFT = '\uE008';
    export const CONTROL = '\uE009';
    export const LEFT_CONTROL = '\uE009';
    export const ALT = '\uE00A';
    export const LEFT_ALT = '\uE00A';
    export const PAUSE = '\uE00B';
    export const ESCAPE = '\uE00C';
    export const SPACE = '\uE00D';
    export const PAGE_UP = '\uE00E';
    export const PAGE_DOWN = '\uE00F';
    export const END = '\uE010';
    export const HOME = '\uE011';
    export const LEFT = '\uE012';
    export const ARROW_LEFT = '\uE012';
    export const UP = '\uE013';
    export const ARROW_UP = '\uE013';
    export const RIGHT = '\uE014';
    export const ARROW_RIGHT = '\uE014';
    export const DOWN = '\uE015';
    export const ARROW_DOWN = '\uE015';
    export const INSERT = '\uE016';
    export const DELETE = '\uE017';
    export const SEMICOLON = '\uE018';
    export const EQUALS = '\uE019';
    export const NUMPAD0 = '\uE01A';
    export const NUMPAD1 = '\uE01B';
    export const NUMPAD2 = '\uE01C';
    export const NUMPAD3 = '\uE01D';
    export const NUMPAD4 = '\uE01E';
    export const NUMPAD5 = '\uE01F';
    export const NUMPAD6 = '\uE020';
    export const NUMPAD7 = '\uE021';
    export const NUMPAD8 = '\uE022';
    export const NUMPAD9 = '\uE023';
    export const MULTIPLY = '\uE024';
    export const ADD = '\uE025';
    export const SEPARATOR = '\uE026';
    export const SUBTRACT = '\uE027';
    export const DECIMAL = '\uE028';
    export const DIVIDE = '\uE029';
    export const F1 = '\uE031';
    export const F2 = '\uE032';
    export const F3 = '\uE033';
    export const F4 = '\uE034';
    export const F5 = '\uE035';
    export const F6 = '\uE036';
    export const F7 = '\uE037';
    export const F8 = '\uE038';
    export const F9 = '\uE039';
    export const F10 = '\uE03A';
    export const F11 = '\uE03B';
    export const F12 = '\uE03C';
    export const COMMAND = '\uE03D';
    export const META = '\uE03D';
    export const ZENKAKU_HANKAKU = '\uE040';

    export enum Keys {
        NULL = '\uE000',
        CANCEL = '\uE001',
        HELP = '\uE002',
        BACK_SPACE = '\uE003',
        TAB = '\uE004',
        CLEAR = '\uE005',
        RETURN = '\uE006',
        ENTER = '\uE007',
        SHIFT = '\uE008',
        LEFT_SHIFT = '\uE008',
        CONTROL = '\uE009',
        LEFT_CONTROL = '\uE009',
        ALT = '\uE00A',
        LEFT_ALT = '\uE00A',
        PAUSE = '\uE00B',
        ESCAPE = '\uE00C',
        SPACE = '\uE00D',
        PAGE_UP = '\uE00E',
        PAGE_DOWN = '\uE00F',
        END = '\uE010',
        HOME = '\uE011',
        LEFT = '\uE012',
        ARROW_LEFT = '\uE012',
        UP = '\uE013',
        ARROW_UP = '\uE013',
        RIGHT = '\uE014',
        ARROW_RIGHT = '\uE014',
        DOWN = '\uE015',
        ARROW_DOWN = '\uE015',
        INSERT = '\uE016',
        DELETE = '\uE017',
        SEMICOLON = '\uE018',
        EQUALS = '\uE019',
        NUMPAD0 = '\uE01A',
        NUMPAD1 = '\uE01B',
        NUMPAD2 = '\uE01C',
        NUMPAD3 = '\uE01D',
        NUMPAD4 = '\uE01E',
        NUMPAD5 = '\uE01F',
        NUMPAD6 = '\uE020',
        NUMPAD7 = '\uE021',
        NUMPAD8 = '\uE022',
        NUMPAD9 = '\uE023',
        MULTIPLY = '\uE024',
        ADD = '\uE025',
        SEPARATOR = '\uE026',
        SUBTRACT = '\uE027',
        DECIMAL = '\uE028',
        DIVIDE = '\uE029',
        F1 = '\uE031',
        F2 = '\uE032',
        F3 = '\uE033',
        F4 = '\uE034',
        F5 = '\uE035',
        F6 = '\uE036',
        F7 = '\uE037',
        F8 = '\uE038',
        F9 = '\uE039',
        F10 = '\uE03A',
        F11 = '\uE03B',
        F12 = '\uE03C',
        COMMAND = '\uE03D',
        META = '\uE03D',
        ZENKAKU_HANKAKU = '\uE040'
    }
}
