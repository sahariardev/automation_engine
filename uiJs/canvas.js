let selectedBtn = 0;

const btnMap = {
    0: 'MOVE',
    1: 'DRAW',
    2: 'PLAY',
    3: 'SAVE',
    4: 'LOAD',
}

$(function () {

    $('#form-container').css('height', window.innerHeight);

    updateSelectedBtn($("." + btnMap[selectedBtn].toLowerCase()));

    $('.rf-btn').click(function () {
        updateSelectedBtn($(this));
    });

});

function updateSelectedBtn($selector) {
    let selectedBtnKey;

    for (const [key, value] of Object.entries(btnMap)) {
        if ($selector.attr('class').split(" ").indexOf(value.toLocaleLowerCase()) >= 0) {
            selectedBtnKey = key;

            break;
        }
    }

    if (![2, 3, 4].includes(parseInt(selectedBtnKey))) {
        selectedBtn = selectedBtnKey;
        console.log(selectedBtnKey);

        $('.rf-btn').css('border-bottom', '4px #90ea8e solid');
        $selector.css('border-bottom', '4px white solid');
    }

}

let stage = new Konva.Stage({
    container: 'container',
    width: window.innerWidth,
    height: window.innerHeight,
    draggable: true
});

var scaleBy = 1.01;
window.addEventListener('wheel', (e) => {
    var oldScale = stage.scaleX();
    var mousePointTo = {
        x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
        y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale,
    };
    var newScale = e.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;
    stage.scale({x: newScale, y: newScale});
    var newPos = {
        x: -(mousePointTo.x - stage.getPointerPosition().x / newScale) * newScale,
        y: -(mousePointTo.y - stage.getPointerPosition().y / newScale) * newScale
    };
    stage.position(newPos);

    stage.batchDraw();
});

const layer = new Konva.Layer();
stage.add(layer);

UTIL.init(layer, stage);

stage.on('click', function (e) {

    var x = (stage.getPointerPosition().x - stage.position().x) / stage.scaleX(),
        y = (stage.getPointerPosition().y - stage.position().y) / stage.scaleX();

    if (selectedBtn == 1) {
        UTIL.getRect(x, y, 'FILL');
    }

    if (selectedBtn == 2) {
        var actionsRect = UTIL.getAllActions(),
            actionList = [];

        UTIL.getAllActions().forEach(function (rect) {
            var props = rect.attrs;
            // noinspection JSUnresolvedVariable
            actionList.push(ActionFactory.getAction(props));
        });

        var data = {
            actions: actionList,
            siteUrl: $('#siteUrl').val()
        }

        if (valid(data)) {
            ipcRenderer.send('clicked', JSON.stringify(data));
        }
    }
});

function valid(data) {

    var errorMessage = '';

    if (!data.siteUrl) {
        errorMessage += "Invalid site address.";
    }

    var startActionCount = 0;

    var actionName = {};

    var groupActionList = [];

    if (!data.actions || data.actions.length === 0) {
        errorMessage += "No action available.";
    }

    if (!errorMessage) {
        data.actions.forEach(function (action) {
            if (!action.type) {
                errorMessage += ` Action Type required: ${action.name};`
            } else {
                if (action.type === 'START') {
                    startActionCount++;
                }

                if (actionName[action.name]) {
                    errorMessage += `Duplicate action name: ${action.name};`
                } else {
                    actionName[action.name] = 1;
                }

                if (action.type === 'GROUP') {
                    groupActionList.add(action);
                }

                if (action.validate) {
                    errorMessage += action.validate();
                }
            }
        });
    }

    if (!startActionCount || startActionCount > 1) {
        errorMessage += 'Multiple Start Action';
    }

    if (!errorMessage) {
        groupActionList.forEach(function (action) {

            if (!actionName[action.startAction]
                || action.name === action.startAction
                || action.name.trim() === action.startAction.trim()) {

                errorMessage += `Invalid Start Action name for group action : ${action.name}`;
            }

            if (!isValidFile(action.dataSourcePath)) {
                errorMessage += `Invalid data Source Path for group action : ${action.name}`;
            }
        });
    }

    if (errorMessage) {
        showModal(errorMessage, 'Error');
    }

    return errorMessage === "";
}

function showModal(body, title) {
    var $mainModal = $('#mainModal');
    $mainModal.find('.modal-title').html(title);
    $mainModal.find('.modal-body').html(body);

    $mainModal.modal('show');
}

function isValidFile(fileName) {
    if (!fileName) {
        return true;
    }

    if (!fileName.endsWith('.csv')) {
        return false;
    }

    //todo:file exist check
}

$('#save').click(function () {

    var data = {
        actionsRect: UTIL.getAllActions(),
        siteUrl: $('#siteUrl').val(),
        fileName: $('#directoryPath').val() + UTIL.PATH_SEPERATOR + $('#fileName').val()
    };

    ipcRenderer.send('saveFile', JSON.stringify(data));

});

$('#load').click(function () {
    ipcRenderer.send('loadFile', $('#directoryPath').val() + UTIL.PATH_SEPERATOR + $('#fileName').val());
});

$('#play').click(function () {
    var actionsRect = UTIL.getAllActions(),
        actionList = [];

    UTIL.getAllActions().forEach(function (rect) {
        var props = rect.attrs;
        // noinspection JSUnresolvedVariable
        actionList.push(ActionFactory.getAction(props));
    });

    var data = {
        actions: actionList,
        siteUrl: $('#siteUrl').val()
    }

    if (valid(data)) {
        ipcRenderer.send('clicked', JSON.stringify(data));
    }
});

ipcRenderer.on('fileLoaded', function (event, data) {
    UTIL.cleanStage();
    console.log(data);

    data = data.fileContent;

    $('#siteUrl').val(data.siteUrl);

    if (data && data.actionsRect) {
        UTIL.loadStage(data.actionsRect);
    }
    // bind events
});

