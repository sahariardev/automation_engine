const {StartAction} = require("./start_action");
const {GroupAction} = require("./group_action");
const {CloseAction} = require("./close_action");
const {DelayAction} = require("./delay_action");
const {FillAction} = require("./fill_action");
const {ScreenshotAction} = require("./screenshot_action");
const {ClickAction} = require("./click_action");

class ActionFactory {

    static getAction(actionJsonObject) {
        if (!actionJsonObject.type) {
            throw new Error("Invalid type!");
        }

        switch (actionJsonObject.type.toUpperCase()) {
            case  'CLICK' :
                return ClickAction.fromJSON(actionJsonObject);
            case 'SCREENSHOT' :
                return ScreenshotAction.fromJSON(actionJsonObject);
            case 'FILL' :
                return FillAction.fromJSON(actionJsonObject);
            case 'DELAY':
                return DelayAction.fromJSON(actionJsonObject);
            case 'CLOSE':
                return CloseAction.fromJSON(actionJsonObject);
            case 'GROUP':
                return GroupAction.fromJSON(actionJsonObject);
            case 'START':
                return StartAction.fromJSON(actionJsonObject);
        }
    }

    static generateUi(uiObject) {
        if (!uiObject || !uiObject.type) {
            return;
        }

        switch (uiObject.type.toUpperCase()) {
            case  'CLICK' :
                return ClickAction.generateUi(uiObject);
            case  'FILL' :
                return FillAction.generateUi(uiObject);
            case  'GROUP' :
                return GroupAction.generateUi(uiObject);
            case  'START' :
                return StartAction.generateUi(uiObject);
            default:
                throw new Error("Unsupported type = " + uiObject.type);
        }
    }
}

exports.ActionFactory = ActionFactory;