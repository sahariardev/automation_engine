var UTIL = function ($, Konva) {

    var utils = {},
        layer = null,
        stage = null,
        formSelector = '#form-container',
        selectedAction = null,
        arrowX = null,
        arrowY = null,
        firstClickDone = false,
        tempArrow = null,
        idCount = 0;

    var _constant = {
        BOX_WIDTH: 100,
        BOX_HEIGHT: 50,
    }

    var _templates = {
        INPUT_FIELD:
            '<div class="mb-3">' +
            '  <label class="form-label"></label>' +
            '  <input class="form-control" />' +
            '</div>',
        SUBMIT_BODY:
            '<button type="submit" class="btn btn-primary mb-3">Submit</button>',
        ACTION_SELECT:
            '<div class="mb-3">' +
            '   <label class="form-label">Action Type</label>' +
            '   <select class="form-select action-select common-action" aria-label="Default">' +
            '       <option selected>Please Select</option>' +
            '   </select>' +
            '</div>',
        VALUE_TYPE:
            '<div class="mb-3">' +
            '  <label class="form-label">Value Type</label>' +
            '  <select class="form-select rf-select value-type">' +
            '     <option value="static" selected>Static</option>' +
            '     <option value="random">Generate Random</option>' +
            '     <option value="ds">From Data Source</option>' +
            '  </select>' +
            '</div>',
        NEXT_ACTION:
            '<div class="mb-3 common-action">' +
            '  <label class="form-label common-action">Select Next Action</label>' +
            '  <select class="form-select rf-select next-action">' +
            '     <option value="ps" selected>Please Select</option>' +
            '  </select>' +
            '</div>'
    }

    var actions = {
        FILL: {
            displayName: 'Fill',
            value: 'Fill'
        },
        Click: {
            displayName: 'Click',
            value: 'Click'
        },
        GROUP: {
            displayName: 'Group',
            value: 'GROUP'
        },
        START: {
            displayName: 'Start',
            value: 'START'
        }
    }

    function _init(l, s) {
        if (!layer && l) {
            layer = l;
        }

        if (!stage && s) {
            stage = s;
        }
    }

    function _getRect(x, y, type, elem) {
        idCount++;
        var group = new Konva.Group({
            x: x,
            y: y,
            draggable: true,
            type: type,
            id: idCount,
            elementType: 'action'
        });

        if (elem) {
            Object.assign(group.attrs, elem);
        }

        var box = new Konva.Rect({
            x: 0,
            y: 0,
            width: _constant.BOX_WIDTH,
            height: _constant.BOX_HEIGHT,
            // fill: '#262626',
            fill: '#90ea8e',
            shadowBlur: 5,
        });

        group.add(box);

        group.on('click', function (e) {
            if (selectedBtn == 0) {
                selectedAction = this;
                _getFillForm(this.attrs);

            }
        });

        group.on('dragmove', function () {
            if (selectedBtn == 0) {

                var prevActionId = group.attrs.previousAction,
                    nextActionId = group.attrs.nextAction;

                if (prevActionId) {
                    _destroyArrow(prevActionId);
                    _createActionRelationArrow(_getActionRect(prevActionId), group);
                }

                if (nextActionId) {
                    _destroyArrow(group.attrs.id);
                    _createActionRelationArrow(group, _getActionRect(nextActionId));
                }
            }

        })

        layer.add(group);
    }

    function _destroyArrow(fromId) {
        var arrow = _getArrowUsingFromActionId(fromId);

        if (arrow) {
            arrow.destroy();
        }
    }

    function _createArrow(x1, y1, x2, y2, from, to) {

        var arrow = new Konva.Arrow({
            points: [x1, y1, x2, y2],
            pointerLength: 5,
            pointerWidth: 5,
            // fill: 'gray',
            fill: 'white',
            stroke: 'white',
            // stroke: 'gray',
            strokeWidth: 2,
            from: from,
            to: to,
            elementType: 'connect'
        });

        layer.add(arrow);

        return arrow;
    }

    function _getFillForm(props) {

        $(formSelector).html('');
        var name = '';

        if (props.name) {
            name = props.name;
        }

        $(formSelector).append(_getInputTextField('Action Name', 'name', name));

        var $name = $('#name');

        $name.addClass('common-action').attr('maxlength', 40);

        $name.on('keyup', function () {
            if (selectedAction) {

                selectedAction.getChildren().forEach(function (child) {
                    if (child.attrs.elementType === 'text') {
                        child.destroy();
                    }
                });

                selectedAction.add(_getText(0, 0, $name.val()));
                props.name = $name.val();
            }
        });
        $(formSelector).append(_getNextAction());
        $(formSelector).append(_getActionSelectTemplate());

        const $action = $('.action-select');
        if (props.type) {
            $action.val(props.type)
            $action.trigger('change');
        }
    }

    function _getText(x, y, text) {
        return new Konva.Text({
            x: x,
            y: y,
            text: text,
            fontSize: 12,
            fontFamily: 'Calibri',
            fill: '#0e4a0b',
            width: _constant.BOX_WIDTH,
            padding: 10,
            align: 'center',
            elementType: 'text'
        });
    }

    function _getNextAction() {
        var actionRectList = _getAvailableForNextAction(),
            $nextActionContainer = $(_templates.NEXT_ACTION);

        actionRectList.forEach(function (actionRect) {
            var props = actionRect.attrs;

            $nextActionContainer
                .find('select')
                .append($('<option>', {value: props.id})
                    .html(props.id + (props.name ? '-' + props.name : '')));
        });

        $nextActionContainer.find('select').on('change', function () {

            if (selectedAction.attrs.nextAction) {
                _getActionRect(selectedAction.attrs.nextAction).attrs.previousAction = null;
                selectedAction.attrs.nextAction = null;
                var arrow = _getArrowUsingFromActionId(selectedAction.attrs.id);

                if (arrow) {
                    arrow.destroy();
                }
            }

            if ($(this).val() !== 'ps') {
                var nextActionRect = _getActionRect(parseInt($(this).val()));

                if (!nextActionRect || !selectedAction) {
                    return;
                }

                nextActionRect.attrs.previousAction = selectedAction.attrs.id;
                selectedAction.attrs.nextAction = nextActionRect.attrs.id;

                _createActionRelationArrow(selectedAction, nextActionRect);
            }
        });

        return $nextActionContainer;
    }

    function _createActionRelationArrow(fromActionRect, toActionRect) {
        if (!fromActionRect || !toActionRect) {
            return;
        }

        var fromActionRectPos = {
                x: fromActionRect.attrs.x,
                y: fromActionRect.attrs.y,
            },
            nextActionRectPos = {
                x: toActionRect.attrs.x,
                y: toActionRect.attrs.y,
            },
            fromActionPositions = {
                TOP: {
                    x: fromActionRectPos.x + _constant.BOX_WIDTH / 2,
                    y: fromActionRectPos.y
                },
                BOTTOM: {
                    x: fromActionRectPos.x + _constant.BOX_WIDTH / 2,
                    y: fromActionRectPos.y + _constant.BOX_HEIGHT
                }
            },

            nextActionPositions = {
                TOP: {
                    x: nextActionRectPos.x + _constant.BOX_WIDTH / 2,
                    y: nextActionRectPos.y
                },
                BOTTOM: {
                    x: nextActionRectPos.x + _constant.BOX_WIDTH / 2,
                    y: nextActionRectPos.y + _constant.BOX_HEIGHT
                }
            },

            fromPosition = 'BOTTOM',
            nextPosition = 'TOP';

        if (fromActionRectPos.y > nextActionRectPos.y) {
            fromPosition = 'TOP';
            nextPosition = 'BOTTOM'
        }

        _createArrow(
            fromActionPositions[fromPosition].x,
            fromActionPositions[fromPosition].y,
            nextActionPositions[nextPosition].x,
            nextActionPositions[nextPosition].y,
            fromActionRect.attrs.id,
            toActionRect.attrs.id
        );
    }

    function _getInputTextField(label, id, value) {
        var $textInputField = $(_templates.INPUT_FIELD);
        $textInputField.find('.form-label').attr('for', id).html(label);
        $textInputField.find('.form-control').attr('id', id).attr('type', 'TEXT');

        if (value) {
            $textInputField.find('.form-control').val(value);
        }

        return $textInputField;
    }

    function _getSubmitButton() {
        return $(_templates.SUBMIT_BODY);
    }

    function _getActionSelectTemplate() {
        var $actionTemplate = $(_templates.ACTION_SELECT),
            $actionContainer = $actionTemplate.find('.action-select');

        Object.keys(actions).forEach(function (key) {
            $actionContainer.append($('<option>',
                {value: actions[key].value})
                .html(actions[key].displayName));
        });

        $actionContainer.on('change', function () {
            if (selectedAction) {
                selectedAction.attrs.type = $(this).val();
            }
            _generateExtendedForm($(this).val());
        });

        return $actionTemplate;
    }

    function _generateExtendedForm(type) {
        _cleanExtendedForm();

        var uiObject = {
            type: type,
            selectedAction: selectedAction,
            formSelector: formSelector
        };

        // noinspection JSUnresolvedVariable
        ActionFactory.generateUi(uiObject);
    }

    //unused method will remove in future
    function _generateExtendedClickForm() {
        if (!selectedAction) {
            return;
        }

        var props = selectedAction.attrs,
            $form = $(formSelector);

        $form.append(_getInputTextField('Path', 'path', props.path));
        var $path = $('#path');

        $path.on('keyup', function () {
            props.path = $path.val();
        });
    }

    //unused method will remove in future
    function _generateExtendedFillForm() {
        if (!selectedAction) {
            return;
        }

        var props = selectedAction.attrs;

        var $form = $(formSelector);

        $form.append(_getInputTextField('Path', 'path', props.path));
        var $path = $('#path');

        props.valueType = 'static';

        $form.append(
            _getSelectValueTypeSection(
                function (val) {
                    props.valueType = val;
                },
                function ($valueContainer) {
                    props.value = $valueContainer.val();

                    $valueContainer.on('keyup', function () {
                        console.log($valueContainer.val());
                        props.value = $valueContainer.val();
                    });
                }
            )
        );

        $path.on('keyup', function () {
            props.path = $path.val();
        });
    }

    function _cleanExtendedForm() {
        var $form = $(formSelector),
            $children = $form.children();

        $children.each(function () {
            if ($(this).find('.common-action').length === 0) {
                $(this).remove();
            }
        });
    }

    function _getSelectValueTypeSection(valueTypeChangeCallback, valueChangeCallBack) {
        var $container = $('<div>');

        $container.append($(_templates.VALUE_TYPE));
        $container.append(_getInputTextField('Value', 'value', selectedAction.attrs.value));
        valueChangeCallBack($container.find('#value'));

        $container.find('.value-type').on('change', function () {
            var val = $(this).val();

            valueTypeChangeCallback(val);

            $container.find('#value').val('');

            //ds stands for dataSource
            if (val === 'ds') {
                $container.find('#value').parent().remove();
            } else {
                if ($container.find('#value').length === 0) {
                    $container.append(_getInputTextField('Value', 'value'));
                }

                if (val === 'random') {
                    $container.find('#value').val(_randomStringGenerator(10));
                }

                valueChangeCallBack($container.find('#value'));
            }

        });

        return $container;
    }

    function _randomStringGenerator(length) {
        var result = '',
            characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
            charactersLength = characters.length;

        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() *
                charactersLength));
        }
        return result;
    }

    function _getCurrentState() {
        return selectedAction;
    }

    function _getAllActions() {
        return stage.getChildren()[0].getChildren()
            .filter(x => x.attrs && x.attrs.elementType && x.attrs.elementType === 'action');
    }

    function _cleanStage() {
        while (stage.getChildren()[0]
        && stage.getChildren()[0].getChildren()
        && stage.getChildren()[0].getChildren().length > 0) {
            stage.getChildren()[0].getChildren()[0].destroy();
        }
    }

    function _getActionRect(id) {
        var actionRect = _getAllActions().filter(x => x.attrs.id === id);

        if (actionRect.length !== 0) {
            return actionRect[0];
        }

        return null;
    }

    function _getAllArrow() {
        return stage.getChildren()[0].getChildren()
            .filter(x => x.attrs && x.attrs.elementType && x.attrs.elementType === 'connect');
    }

    function _getArrowUsingFromActionId(id) {
        var arrows = _getAllArrow().filter(arrow => arrow.attrs.from === id);

        if (arrows.length !== 0) {
            return arrows[0];
        }

        return null;
    }

    function _getAvailableForNextAction() {
        return _getAllActions().filter(action => !action.attrs.previousAction)
            .filter(action => action.attrs.id !== selectedAction.attrs.id);
    }

    function _loadStage(children) {
        if (!children) {
            return;
        }

        for (var i = 0; i < children.length; i++) {
            var elem = JSON.parse(children[i]).attrs;

            if (elem.elementType === 'action') {
                _getRect(elem.x, elem.y, elem.type, elem);
            }
        }

        _getAllActions().forEach(function (action) {
            if (!action) {
                return;
            }

            var props = action.attrs;

            action.add(_getText(0, 0, props.name));

            if (props.previousAction) {

                console.log("previous action is", _getActionRect(props.previousAction));
                _createActionRelationArrow(_getActionRect(props.previousAction), action);
            }
        });
    }

    utils.getRect = _getRect;
    utils.init = _init;
    utils.getFillForm = _getFillForm;
    utils.getCurrenState = _getCurrentState;
    utils.getAllActions = _getAllActions;
    utils.getInputTextField = _getInputTextField;
    utils.getSelectValueTypeSection = _getSelectValueTypeSection;
    utils.cleanStage = _cleanStage;
    utils.loadStage = _loadStage;

    utils.PATH_SEPERATOR = process.platform === "win32" ?  "\\" : "/";

    return utils;

}(jQuery, Konva);