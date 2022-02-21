const {Action} = require("./action");

class ScreenshotAction extends Action {
    constructor(id, previousAction, nextAction, name) {
        super(id, previousAction, nextAction, name);

        this.type = "SCREENSHOT";
    }

    static fromJSON(map) {
        return new ScreenshotAction(map['id'], map['previousAction'], map['nextAction'], map['name']);
    }

    /*
    * This method is used to build ui, calling it from node server will cause exception
    * */
    static generateUi(uiObject) {

    }

    async execute(browser) {
        await browser.saveScreenshot('./' + this.name + '-screenshot.png');
    }

    validate() {
        let message = '';

        if (!this.name) {
            message += `Action ${this.id}: Name required`;
        }

        return message;
    }
}

exports.ScreenshotAction = ScreenshotAction;