import { Container, Graphics, Text } from 'pixi.js';
import { app } from "../script.js";

const squareArray = ['(NAME)', '(PROJECT)'];
const titleArray = ['(SUDEV KIYADA)', '(MY MARK ON INTERNET)'];
const coordArray = ["(22.3039° N\n70.8022° E", "(67.0823° N\n32.1882° E", "(PO.TEST° N\nPO.TEST° E"];
let currentCoord = 0;

const titleContainer = new Container();
const titleSquare = new Graphics();
const squareText = new Text('(NAME)', {fontFamily : "Disket", fontSize: 20, fill : 0xFFFFFF, align : 'left'});
const titleText = new Text('(SUDEV KIYADA)', {fontFamily : "Disket", fontSize: 48, fill : 0xFFFFFF, align : 'left'});
const coordText = new Text("22.3039° N\n70.8022° E", {fontFamily : "Disket", fontSize: 20, fill : 0xFFFFFF, align : 'right'});

export function initTitle() {
    titleContainer.position.set(app.screen.width * 0.03, app.screen.width * 0.03);

    titleSquare.beginFill(0xFF2200);
    titleSquare.drawRect(0, 0, 20, 20);
    titleContainer.addChild(titleSquare);

    squareText.position.set(32, -2);
    titleContainer.addChild(squareText);

    titleText.position.set(0, 24);
    titleContainer.addChild(titleText);

    coordText.position.set(app.screen.width * 0.8, 32);
    titleContainer.addChild(coordText);

    app.stage.addChild(titleContainer);
}

export function animateTitle() {
    
    let sqTxt = '';
    if(Math.sin(app.ticker.lastTime/1000) > 0)
        sqTxt = squareArray[0];
    else
        sqTxt = squareArray[1];

    let len = Math.abs(Math.floor(sqTxt.length * Math.abs(Math.sin(app.ticker.lastTime/1000))));

    squareText._text = sqTxt.substring(0, len) + ")";
    squareText.updateText();

    let titleTxt = '';
    if(Math.sin(app.ticker.lastTime/1000) > 0)
        titleTxt = titleArray[0];
    else
        titleTxt = titleArray[1];

    len = Math.abs(Math.floor(titleTxt.length * Math.abs(Math.sin(app.ticker.lastTime/1000))));

    titleText._text = titleTxt.substring(0, len) + ")";
    titleText.updateText();

    let crdText = '';
    crdText = coordArray[currentCoord];
    
    len = Math.abs(Math.floor(crdText.length * Math.abs(Math.sin(app.ticker.lastTime/1000))));

    if(len <= 0.1)
        currentCoord = (currentCoord + 1) % coordArray.length;
    
    coordText._text = crdText.substring(0, len+1) + ")";
    coordText.updateText();
    
    titleSquare.alpha = Math.abs(Math.sin(app.ticker.lastTime/1000));
}

export {titleContainer};