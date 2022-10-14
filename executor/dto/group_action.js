const {Action} = require("./action");

class GroupAction extends Action {
    constructor(repeat, startAction, dataSourcePath, id, previousAction, nextAction, name) {
        super(id, previousAction, nextAction, name);

        this.repeat = repeat;
        this.startAction = startAction;
        this.dataSourcePath = dataSourcePath;
        this.type = 'GROUP';
    }

    static fromJSON(map) {
        return new GroupAction(map['repeat'], map['startAction'],
            map['dataSourcePath'], map['id'], map['previousAction'], map['nextAction'], map['name']);
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

        var selectedAction = uiObject.selectedAction,
            formSelector = uiObject.formSelector;

        if (!selectedAction) {
            return;
        }

        var props = selectedAction.attrs,
            $form = $(formSelector);

        $form.append(UTIL.getInputTextField('Data source path', 'path', props.dataSourcePath));

        var $path = $('#path');
        $path.on('keyup', function () {
            props.dataSourcePath = $path.val();
        });

        $form.append(UTIL.getInputTextField('Repeat', 'repeat', props.repeat));

        var $repeat = $('#repeat');

        $repeat.on('keyup', function () {
            props.repeat = $repeat.val();
        });

        $form.append(UTIL.getInputTextField('Start Action Name', 'startAction', props.startAction));

        var $startAction = $('#startAction');

        $startAction.on('keyup', function () {
            props.startAction = $startAction.val();
        });
    }

    validate() {
        let message = '',
            actionLabel = this.name || this.id;

        if (!this.name) {
            message += `Action ${actionLabel}: Name required. `;
        }

        if (!this.startAction) {
            message += `Action ${actionLabel}: Start Action required. `;
        }

        // noinspection EqualityComparisonWithCoercionJS
        if (this.repeat == undefined) {
            message += `Action ${actionLabel}: Repeat required. `;
        }

        //todo:: file exit validation

        return message;
    }
}


exports.GroupAction = GroupAction;