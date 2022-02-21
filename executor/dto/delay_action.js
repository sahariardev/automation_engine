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

        $form.append(UTIL.getInputTextField('Duration(ms)', 'duration', props.duration));
        var $duration = $form.find('#duration');

        $duration.on('keyup', function () {
            props.duration = $duration.val();
        });
    }

    async execute(browser) {
        await browser.pause(this.duration);
    }

    validate() {
        let message = '';

        if (!this.name) {
            message += `Action ${this.id}: Name required`;
        }

        if (!this.duration) {
            message += `Action ${this.id}: Duration required`;
        }

        return message;
    }
}

exports.DelayAction = DelayAction;