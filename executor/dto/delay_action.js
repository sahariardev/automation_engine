const {Action} = require("./action");

class DelayAction extends Action {
    constructor(duration, id, previousAction, nextAction, name) {
        super(id, previousAction, nextAction, name);

        this.duration = duration;
        this.type = "DELAY";
    }

    static fromJSON(map) {
        return new DelayAction(map['duration'], map['id'], map['previousAction'], map['nextAction'], map['name']);
    }

    async execute(browser) {
        await browser.pause(this.duration);
    }
}

exports.DelayAction = DelayAction;