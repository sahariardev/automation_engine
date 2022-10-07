const {Action} = require("./action");

class StartAction extends Action {
    constructor(id, nextAction, name, hideElem) {
        super(id, null, nextAction, name);

        this.hideElem = hideElem;
        this.type = "START";
    }

    static fromJSON(map) {
        return new StartAction(map['id'], map['nextAction'], map['name'], map['hideElem']);
    }

    execute(browser) {

    }

    /*
    * This method is used to build ui, calling it from node server will cause exception
    * */
    static generateUi(uiObject) {

    }

}

exports.StartAction = StartAction;