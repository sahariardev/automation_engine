class SelectAction {
    constructor(selector) {
        this.selector = selector;
        this.name = 'SELECT';
    }
}

class PutAction {
    constructor(value) {
        this.value = value;
        this.name = 'PUT';
    }
}

exports.SelectAction = SelectAction;
exports.PutAction = PutAction;