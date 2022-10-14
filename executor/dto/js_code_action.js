const {Action} = require("./action");

class JsCodeAction extends Action {
    constructor(script, id, previousAction, nextAction, name) {
        super(id, previousAction, nextAction, name);

        this.script = script;
        this.type = "JS_CODE";
    }

    static fromJSON(map) {
        return new JsCodeAction(map['script'], map['id'], map['previousAction'], map['nextAction'], map['name']);
    }

    /*
    * This method is used to build ui, calling it from node server will cause exception
    * */
    static generateUi(uiObject) {
        if (!window) {
            throw new Error('Window is not defined');
        }

        if (!$) {
            throw new Error('jQuery is not defined');
        }

        if (!UTIL) {
            throw new Error('UTILS is not defined');
        }

        if (!uiObject.selectedAction) {
            return;
        }

        var props = uiObject.selectedAction.attrs,
            $form = $(uiObject.formSelector);

        $form.append(UTIL.getInputTextAreaField('Script', 'script', props.script));
        var $script = $form.find('#script');

        $script.on('keyup', function () {
            props.script = $script.val();
        });
    }

    async execute(browser) {

        var f = new Function(this.script);

        await browser.execute(f);
    }

    validate() {
        let message = '',
            actionLabel = this.name || this.id;

        if (!this.name) {
            message += `Action ${actionLabel}: Name required. `;
        }

        if (!this.script) {
            message += `Action ${actionLabel}: Script required. `;
        }

        return message;
    }
}

exports.JsCodeAction = JsCodeAction;