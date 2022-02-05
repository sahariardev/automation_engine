const {Action} = require("./action");

class ScreenshotAction extends Action {
    constructor(id, previousAction, nextAction, name) {
        super(id, previousAction, nextAction, name);

        this.type = "SCREEN_SHOT";
    }

    static fromJSON(map) {
        return new ScreenshotAction(map['id'], map['previousAction'], map['nextAction'], map['name']);
    }

    async execute(browser) {
        await browser.saveScreenshot('./' + this.id + '-screenshot.png');
    }
}

exports.ScreenshotAction = ScreenshotAction;