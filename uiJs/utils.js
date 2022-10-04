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
        defaultParent = 'main',
        parentStack = [defaultParent],
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
        INPUT_TEXTAREA:
            '<div class="mb-3">' +
            '  <label class="form-label"></label>' +
            '  <textarea  class="form-control" rows="3"></textarea>' +
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
        },
        JS_CODE: {
            displayName: 'Script',
            value: 'JS_CODE'
        },
        SCREENSHOT: {
            displayName: 'Screenshot',
            value: 'SCREENSHOT'
        },
        DELAY: {
            displayName: 'Wait',
            value: 'DELAY'
        },
        LOAD_URL: {
            displayName: 'Load',
            value: 'LOAD_URL'
        },
    }

    function _init(l, s) {
        if (!layer && l) {
            layer = l;
        }

        if (!stage && s) {
            stage = s;
        }
    }

    function _getRect(x, y, type, elem, hideElem) {
        var group = new Konva.Group({
            x: x,
            y: y,
            draggable: true,
            type: type,
            elementType: 'action',
            visible: true
        });

        if (elem) {
            if (elem.parent === defaultParent) {
                elem.parent = _getParent();
            }

            Object.assign(group.attrs, elem);
        } else {
            group.attrs.id = v4();
            group.attrs.parent = _getParent();
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

        if (hideElem) {
            group.hide();
            group.attrs.hideElem = true;

        } else {
            group.show();
            group.attrs.hideElem = false;
        }

        group.on('click', function (e) {
            if (selectedBtn == 0) {
                selectedAction = this;
                _getFillForm(this.attrs);

            } else if (selectedBtn == 5) {
                var prevActionId = group.attrs.previousAction,
                    nextActionId = group.attrs.nextAction;
                if (prevActionId) {
                    var prevAction = _getActionRect(prevActionId);
                    prevAction.attrs.nextAction = null;
                    _destroyArrow(prevActionId);
                }

                if (nextActionId) {
                    var nextAction = _getActionRect(nextActionId);
                    nextAction.attrs.previousAction = null;
                    _destroyArrow(group.attrs.id);
                }

                var parent = group.attrs.id,
                    allChild = _getAllChildActions(_getAllActions(), parent);

                allChild.forEach(action => action.destroy());
                group.destroy();

            }
        });

        group.on('dblclick', function (e) {
            if (selectedBtn == 0) {
                selectedAction = this;
                if (selectedAction.attrs.type === 'GROUP') {
                    _saveCurrentStage();
                    _cleanStage();
                    _showGroupBtn();
                    var allActions = _getAllSavedActions();
                    _setParent(selectedAction.attrs.id);
                    var renderableActions = _getAllChildActions(allActions, _getParent(),
                        action => JSON.parse(action), action => JSON.stringify(action));
                    _loadStage(renderableActions);
                }
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
                    .html((props.name ?  props.name : 'No name given')));
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
                var nextActionRect = _getActionRect($(this).val());

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

    function _getInputTextAreaField(label, id, value) {
        var $textareaInputField = $(_templates.INPUT_TEXTAREA);
        $textareaInputField.find('.form-label').attr('for', id).html(label);
        $textareaInputField.find('.form-control').attr('id', id);

        if (value) {
            $textareaInputField.find('.form-control').val(value);
        }

        return $textareaInputField;
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

        var parent = _getParent();

        for (var i = 0; i < children.length; i++) {
            var elem = JSON.parse(children[i]).attrs;

            if (elem.parent === defaultParent) {
                elem.parent = parent;
            }

            var hideElem = elem.parent !== parent;

            if (elem.elementType === 'action') {
                _getRect(elem.x, elem.y, elem.type, elem, hideElem);
            }
        }

        _getAllActions().forEach(function (action) {
            if (!action) {
                return;
            }

            var props = action.attrs;

            if (props.hideElem) {
                return;
            }

            action.add(_getText(0, 0, props.name));

            if (props.previousAction) {

                _createActionRelationArrow(_getActionRect(props.previousAction), action);
            }
        });
    }

    function _getCurrentStateJSONStr() {
        var data = {
            actionsRect: _getAllActions(),
            siteUrl: $('#siteUrl').val()
        };

        return JSON.stringify(data);
    }

    function _saveCurrentStage(stageData) {
        stageData = stageData || _getCurrentStateJSONStr();

        localStorage.setItem(_getParent(), stageData);
    }

    function _getCurrentStageSavedData() {
        return JSON.parse(localStorage.getItem(_getParent()));
    }

    function _getAllSavedActions() {
        return _getCurrentStageSavedData().actionsRect;
    }

    function _getActionForSave() {
        return _getAllActions().map(action => {
            if (!action.attrs.hideElem) {
                action.attrs.parent = defaultParent;
            }

            return action;
        });
    }

    //todo: need to rethink this
    function _getAllChildActions(allActions, selectedParent, deserializer, serializer) {
        var parent = selectedParent || _getParent(),
            allRelatedParents = [],
            tempParents = [parent];

        while (true) {
            var children = [];

            for (var i = 0; i < allActions.length; i++) {
                var action = allActions[i];

                if (deserializer) {
                    action = deserializer(action);
                }

                if (tempParents.indexOf(action.attrs.parent) >= 0) {
                    children.push(action);
                }
            }

            allRelatedParents = allRelatedParents.concat(tempParents);

            if (children.length === 0) {
                break;
            }

            tempParents = children.map(action => action.attrs.id);
        }

        return allActions.map(action => {
            if (deserializer) {
                return deserializer(action);
            }

            return action;
        }).filter(action => allRelatedParents.indexOf(action.attrs.parent) >= 0).map(action => {
            if (serializer) {
                return serializer(action);
            }

            return action;
        });
    }

    function _getParent() {
        if (parentStack && parentStack.length) {
            return parentStack[parentStack.length - 1];
        }

        return defaultParent;
    }

    function _setParent(parent) {
        parentStack.push(parent);
    }

    function _popParent() {
        parentStack.pop();
    }

    function _saveGroupAction() {
        var parent = _getParent();

        _popParent();

        var actions = _getAllActions(),
            savedData = _getCurrentStageSavedData(),
            savedActions = savedData.actionsRect.map(action => JSON.parse(action));

        var deletableActionsId = _getAllChildActions(savedActions, parent).map(action => {
                console.log("Delete :: ", action.attrs.name + "--" + action.attrs.id);
                return action.attrs.id;
            }),
            cleanedSavedActions = savedActions.filter(action => {
                console.log(deletableActionsId);
                console.log(action.attrs.id, deletableActionsId.indexOf(action.attrs.id));

                return deletableActionsId.indexOf(action.attrs.id) < 0;
            });

        cleanedSavedActions.forEach(function (action) {
            console.log(action.attrs.name + "-->" + action.attrs.id);
        });

        var parentAction = cleanedSavedActions.filter(action => action.attrs.id === parent),
            startAction = actions.filter(action => action.attrs.type === 'START' && !action.attrs.hideElem);

        //todo:: run all validation for "run" command

        if (startAction.length != 1) {
            //show validation

            return;
        }

        parentAction[0].attrs.startAction = startAction[0].attrs.name;

        var allActions = cleanedSavedActions.map(action => JSON.stringify(action)).concat(actions);

        savedData.actionsRect = allActions;
        _saveCurrentStage(JSON.stringify(savedData));
    }

    function _hideGroupBtns() {
        if (_getParent() == defaultParent) {
            $('.sub-menu').hide();
        }
    }

    function _showGroupBtn() {
        $('.sub-menu').show();
    }

    function _assignActionId(actions) {
        var idMapper = [];

        actions.forEach(action => {
            action = JSON.parse(action);
            if (idMapper.indexOf(action.attrs.id) < 0) {
                idMapper[action.attrs.id] = v4();
            }
        });

        return actions.map(action => {
            action = JSON.parse(action)

            action.attrs.id = idMapper[action.attrs.id];
            action.attrs.previousAction = idMapper[action.attrs.previousAction];
            action.attrs.nextAction = idMapper[action.attrs.nextAction];

            if (action.attrs.parent !== defaultParent) {
                action.attrs.parent = idMapper[action.attrs.parent];
            }

            return JSON.stringify(action);
        });
    }

    utils.getRect = _getRect;
    utils.init = _init;
    utils.getFillForm = _getFillForm;
    utils.getCurrenState = _getCurrentState;
    utils.getAllActions = _getAllActions;
    utils.getInputTextField = _getInputTextField;
    utils.getInputTextAreaField = _getInputTextAreaField;
    utils.getSelectValueTypeSection = _getSelectValueTypeSection;
    utils.cleanStage = _cleanStage;
    utils.loadStage = _loadStage;
    utils.hideGroupBtns = _hideGroupBtns;
    utils.getCurrentStageSavedData = _getCurrentStageSavedData;
    utils.saveGroupAction = _saveGroupAction;
    utils.popParent = _popParent;
    utils.getAllChildActions = _getAllChildActions;
    utils.getActionForSave = _getActionForSave;
    utils.assignActionId = _assignActionId;

    utils.PATH_SEPERATOR = process.platform === "win32" ? "\\" : "/";

    return utils;

}(jQuery, Konva);