let selectedBtn = 0;

const btnMap = {
    0: 'MOVE',
    1: 'DRAW',
    5: 'DELETE',
    2: 'PLAY',
    3: 'SAVE',
    4: 'LOAD',
    6: 'AUTHOR',
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

    if (![2, 3, 4, 6].includes(parseInt(selectedBtnKey))) {
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

    //will remove next
    // if (selectedBtn == 2) {
    //     console.log('hw');
    //     var actionsRect = UTIL.getAllActions(),
    //         actionList = [];
    //
    //     UTIL.getAllActions().forEach(function (rect) {
    //         var props = rect.attrs;
    //         // noinspection JSUnresolvedVariable
    //         console.log("props is",props);
    //         actionList.push(ActionFactory.getAction(props));
    //     });
    //
    //     var data = {
    //         actions: actionList,
    //         siteUrl: $('#siteUrl').val()
    //     }
    //
    //     if (valid(data)) {
    //         ipcRenderer.send('clicked', JSON.stringify(data));
    //     }
    // }
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

    if (!errorMessage) {
        if (!startActionCount || startActionCount > 1) {
            errorMessage += 'Multiple/Invalid Start Action';
        }

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

function showConfirmationModal(body, title, yesCallback) {
    var $confirmation = $('#confirmation-modal');
    $confirmation.find('.modal-title').html(title);
    $confirmation.find('.modal-body').html(body);

    if (yesCallback) {
        $confirmation.find('#modal-yes-btn').click(function () {
            yesCallback();
        });
    } else {
        $confirmation.find('#modal-yes-btn').click(function () {
            console.log('no callback assigned');
        });
    }

    $confirmation.modal('show');
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
        actionsRect:UTIL.getActionForSave(),
        siteUrl: $('#siteUrl').val()
    };

    //set parent of all visible items parent to main

    ipcRenderer.send('saveFile', JSON.stringify(data));
});

$('#load').click(function () {

    ipcRenderer.send('loadFile');
});

$('#author').click(function () {

    var body =
        `
        <div>
            <div> Sahariar Alam Khandoker</div>
            <div>Follow me on:
                <span id="github-link"><i class="bi bi-github"></i></span> 
                <span id="instagram-link"><i class="bi bi-instagram"></i></span> 
            </div>
            <div>Report Bug on: rifatsahariar@gmail.com</div>
        </div>
    `;

    showModal(body, 'Author');
});

$('#play').click(function () {
    var actionsRect = UTIL.getAllActions(),
        actionList = [];

    UTIL.getAllActions().forEach(function (rect) {
        var props = rect.attrs;
        // noinspection JSUnresolvedVariable

        if (props && props.type === 'Fill' && props.valueType === 'ds') {
            props.value = '#READ_FROM_SOURCE#';
        }

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

$('#group-cancel').click(function () {
    UTIL.popParent();
    _processLoadingStage(null, {fileContent: UTIL.getCurrentStageSavedData()});
    UTIL.hideGroupBtns();
});

$('#group-done').click(function () {
    UTIL.saveGroupAction();
    _processLoadingStage(null, {fileContent : UTIL.getCurrentStageSavedData()});
    UTIL.hideGroupBtns();
});

ipcRenderer.on('fileLoaded', function (event, data) {
    UTIL.cleanStage();

    data = data.fileContent;

    $('#siteUrl').val(data.siteUrl);

    if (data && data.actionsRect) {
        UTIL.loadStage(UTIL.assignActionUID(data.actionsRect));
    }
});

function _processLoadingStage(event, data) {
    UTIL.cleanStage();

    data = data.fileContent;

    $('#siteUrl').val(data.siteUrl);

    if (data && data.actionsRect) {
        UTIL.loadStage(data.actionsRect);
    }
}

$(document).on('click', '#github-link', function (event) {
    shell.openExternal('https://github.com/sahariardev');
});

$(document).on('click', '#instagram-link', function (event) {
    shell.openExternal('https://www.instagram.com/s.a.khandoker/');
});
