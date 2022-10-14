const {Action} = require("./action");

class FillAction extends Action {
    constructor(path, value, id, previousAction, nextAction, name) {
        super(id, previousAction, nextAction, name);

        this.path = path;
        this.value = value;
        this.type = "FILL";
    }

    static fromJSON(map) {
        return new FillAction(map['path'], map['value'], map['id'], map['previousAction'], map['nextAction'], map['name']);
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

        $form.append(UTIL.getInputTextField('Path', 'path', props.path));
        var $path = $('#path');

        props.valueType = 'static';

        $form.append(
            UTIL.getSelectValueTypeSection(
                function (val) {
                    props.valueType = val;
                },
                function ($valueContainer) {
                    props.value = $valueContainer.val();

                    $valueContainer.on('keyup', function () {
                        props.value = $valueContainer.val();
                    });
                }
            )
        );

        $path.on('keyup', function () {
            props.path = $path.val();
        });
    }

    async execute(browser) {
        let input = await browser.$(this.path);

        // noinspection JSUnresolvedFunction
        await input.addValue(this.value);
    }

    validate() {
        let message = '',
            actionLabel = this.name || this.id;

        if (!this.name) {
            message += `Action ${actionLabel}: Name required. `;
        }

        if (!this.path) {
            message += `Action ${actionLabel}: Path required. `;
        }

        if (!this.value) {
            message += `Action ${actionLabel}: Value required. `;
        }

        return message;
    }
}

exports.FillAction = FillAction;