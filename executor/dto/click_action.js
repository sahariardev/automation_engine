const {Action} = require("./action");

class ClickAction extends Action {
    constructor(path, id, previousAction, nextAction, name) {
        super(id, previousAction, nextAction, name);

        this.path = path;
        this.type = "CLICK";
    }

    static fromJSON(map) {
        return new ClickAction(map['path'], map['id'], map['previousAction'], map['nextAction'], map['name']);
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

        $form.append(UTIL.getInputTextField('Path', 'path', props.path));
        var $path = $form.find('#path');

        $path.on('keyup', function () {
            props.path = $path.val();
        });
    }

    async execute(browser) {
        const btn = await browser.$(this.path);
        // noinspection JSUnresolvedFunction
        await btn.click();
    }

    validate() {
        let message = '',
            actionLabel = this.name || this.id;

        if (!this.name) {
            message += `Action ${actionLabel}: Name required. `;
        }

        if (!this.path) {
            message += `Action ${actionLabel}: Path required. `;
        }

        return message;
    }
}

exports.ClickAction = ClickAction;