// Defining suites
// tslint:disable only-arrow-functions
gemini.suite('button', function(suite) {
    suite
        .setUrl('/path/to/page')
        .setCaptureElements('.button')
        .before(function(actions, find) {
            this.button = find('.buttons');
        })
        .capture('plain')
        .capture('hovered', function(actions, find) {
            actions.mouseMove(this.button);
        })
        .capture('pressed', function(actions, find) {
            actions.mouseDown(this.button);
        })
        .capture('clicked', function(actions, find) {
            actions.mouseUp(this.button);
        });

    suite.before((actions, find) => {});

    suite.setCaptureElements(['.selector1', '.selector2']);
    suite.setCaptureElements('.selector1', '.selector2');

    suite.ignoreElements('.selector1', {
        every: '.selector2'
    }, '.selector3');

    suite.setTolerance(3.5);

    suite.skip();

    suite.capture('as', {
        tolerance: 1
    });

    suite.capture('asd', function(action, find) {});

    suite
        .skip('id1')
        .skip(/RegExp1/);

    suite.skip([
        'id1',
        /RegExp1/,
    ], 'comment');

    suite.browsers('12').browsers(/121/).browsers(['12', /1212/]);

    suite.capture('asdf', (actions, find) => {
        find('asdf');
    });

    suite
        .capture('name', function(actions, find) {
            const button = find('.button');
            actions.mouseDown(button)
                .mouseUp(button);
        })
        .capture('name', { tolerance: 30 });

    suite
        .before(function(actions, find) {
            this.button = find('.buttons');
        })
        .capture('hovered', function(actions, find) {
            actions.mouseMove(this.button);
        })
        .capture('pressed', function(actions, find) {
            actions.mouseDown(this.button);
        });

    gemini.ctx;
});
