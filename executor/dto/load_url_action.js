const {Action} = require("./action");

class LoadUrlAction extends Action {
    constructor(url, id, previousAction, nextAction, name) {
        super(id, previousAction, nextAction, name);

        this.url = url;
        this.type = "LOAD_URL";
    }

    static fromJSON(map) {
        return new LoadUrlAction(map['url'], map['id'], map['previousAction'], map['nextAction'], map['name']);
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

        $form.append(UTIL.getInputTextField('url', 'url', props.url));
        var $url = $form.find('#url');

        $url.on('keyup', function () {
            props.url = $url.val();
        });
    }

    async execute(browser) {
        await browser.url(this.url);
    }

    validate() {
        let message = '',
            actionLabel = this.name || this.id;

        if (!this.name) {
            message += `Action ${actionLabel}: Name required. `;
        }

        if (!this.url) {
            message += `Action ${actionLabel}: URL required. `;
        }

        return message;
    }
}

exports.LoadUrlAction = LoadUrlAction;