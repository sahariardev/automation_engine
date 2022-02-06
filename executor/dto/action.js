class Action {
    constructor(id, previousAction, nextAction, name) {
        this.id = id;
        this.previousAction = previousAction;
        this.nextAction = nextAction;
        this.name = name;
    }

    execute(browser) {
        throw new Error('Unimplemented');
    }
}

exports.Action = Action;