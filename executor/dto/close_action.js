const {Action} = require("./action");

class CloseAction extends Action {
    constructor(id, previousAction, name) {
        super(id, previousAction, name);

        this.type = "CLOSE";
    }

    static fromJSON(map) {
        return new CloseAction(map['id'], map['previousAction'], map['name']);
    }

    async execute(browser) {
        await browser.deleteSession();
    }
}

exports.CloseAction = CloseAction;