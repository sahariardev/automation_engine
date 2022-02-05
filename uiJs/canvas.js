let selectedBtn = 0;

const btnMap = {
    0: 'FILL',
    1: 'CLICK',
    2: 'PLAY',
    3: 'SAVE'
}


$(function () {

    $('#form-container').css('height', window.innerHeight);

    updateSelectedBtn($("." + btnMap[selectedBtn].toLowerCase()));
    $('.rf-btn').click(function () {
        updateSelectedBtn($(this));
    });

    $('.save').click(function () {
        $('#save-input').click();
    });
});

function updateSelectedBtn($selector) {
    for (const [key, value] of Object.entries(btnMap)) {
        if ($selector.attr('class').split(" ").indexOf(value.toLocaleLowerCase()) >= 0) {
            selectedBtn = key;
        }
    }

    $('.rf-btn').css('border-bottom', '4px white solid');
    $selector.css('border-bottom', '4px blue solid');
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

        ipcRenderer.send('clicked', JSON.stringify({
            actions: actionList,
            siteUrl: 'https://www.google.com/'
        }));
    }
});

$('#save').click(function () {

    console.log("here I am vro");
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

ipcRenderer.on('fileLoaded', function (event, data) {
    UTIL.cleanStage();
    console.log(data);
    data = data.fileContent;
    if (data && data.actionsRect) {
        UTIL.loadStage(data.actionsRect);
    }
    // bind events
});



