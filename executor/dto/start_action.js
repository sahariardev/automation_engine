const {Action} = require("./action");

class StartAction extends Action {
    constructor(id, nextAction, name) {
        super(id, null, nextAction, name);

        this.type = "START";
    }

    static fromJSON(map) {
        return new StartAction(map['id'], map['nextAction'], map['name']);
    }

    /*
    * This method is used to build ui, calling it from node server will cause exception
    * */
    static generateUi(uiObject) {

    }

}

exports.StartAction = StartAction;