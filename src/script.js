// features yet to be implemented
// zoom - screen
// introduction
// pointer ?
// text fade in fade out temporarily
// header
// info
// loader

import { Graphics, Container, Application, Text, Texture, Matrix, BLEND_MODES, Loader } from 'pixi.js';
import { Assets } from '@pixi/assets';
import {csv} from 'd3-fetch';
import {scalePow} from 'd3-scale';
import * as moment from 'moment';
import {BloomFilter} from 'pixi-filters';
import {Block} from './js/blocks_new.js';
import {textBlock} from './js/textBlock_new.js';
import {loadIcons} from './js/icons.js';
import {bgCodeTicker} from './js/code.js';
import {initTitle, animateTitle, setupTitles} from './js/title.js';

// variables
let blocks = [], textBlocks = [];
let face_base_context, face_data;
let threshold = 20, level = 0;
let textblocks_limit = 100;
let dataWords = [];
let dataIcons = [];
let dataApps = [];
let dataVideos = [];
let bgCodeTickerGraphics = new Graphics();
let plusGraphics = new Graphics();
let outlineGraphics = new Graphics();
let initFlag = true;
let DisketBmpFnt = "";

// const themeColor = 0x93D94E;
const themeColor = 0x0AA5FE;
const themeColor2 = 0x0AA5FE;

// PIXI variables
const textContainer = new Container();
const faceContainer = new Container();

// Create a new app (will auto-add extract plugin to renderer)
const app = new Application({
    width : 1280,
    height: 1811,
    backgroundColor: 0x000000,
    autoDensity: true,
    backgroundAlpha: 0,
    powerPreference: 'high-performance'
 });

 app.renderer.plugins.interaction.interactionFrequency = 50;

 addBackground();

 const cutSize = 80
 outlineGraphics.lineStyle(2, themeColor);
//  outlineGraphics.alpha = 0.3;
 outlineGraphics.position.set(20, 20);
 outlineGraphics.lineTo(app.screen.width-40 - cutSize, 0);
 outlineGraphics.lineTo(app.screen.width-40, cutSize);
 outlineGraphics.lineTo(app.screen.width-40, app.screen.height-40);
 outlineGraphics.lineTo(0, app.screen.height-40);
 outlineGraphics.lineTo(0, 0);
 outlineGraphics.closePath();
 outlineGraphics.zIndex = 8;

const progressLoader = new Text("(LOADING)",{fontFamily : "Disket", fontSize: 40, fill : themeColor, align : 'center', letterSpacing: 20});
progressLoader.position.set(app.screen.width/2, window.innerHeight/2);
progressLoader.anchor.set(0.5);
progressLoader.zIndex = 30;
app.stage.addChild(progressLoader);

let bloom = new BloomFilter(12);
app.stage.filters = [bloom];

 textContainer.zIndex = 10;
 app.stage.addChild(textContainer);

 app.stage.interactive = true;
 app.stage.on('pointermove', e => {
   rendertextContainer(e);
   renderfaceContainer(e);
   });

 faceContainer.zIndex = 20;
 app.stage.addChild(faceContainer);

 app.ticker.autoStart = false;

 //  app.stage.addChild(tex);
 document.body.appendChild(app.view);

 const progressObject = {
   progress: 0,
   get getProgress() {
      return this.progress;
   },
   set value(x) {
       this.progress = x;
       progressLoader.position.set(app.screen.width/2, window.innerHeight/2);
       let loaderText = "LOADING";
       let maskText = "///////";
       let stringProgress = Math.floor(loaderText.length * this.progress / 100);
       progressLoader._text = "(" + maskText.substring(0, stringProgress) + loaderText.substring(stringProgress, loaderText.length) + ")";
       progressLoader.updateText();
       if(this.progress == 100 && initFlag){
         // console.log("in progress cmplete");
         if(initFlag)
           init();
         app.stage.removeChild(progressLoader);
         this.progress = 0;
       }
   }
};

faceContainer.visible = false;
textContainer.visible = false;
bgCodeTickerGraphics.visible = false;
plusGraphics.visible = false;

loadBitmapFont();

function loadFaceBase() {
   // console.log("logging loadFaceBase");
   const face_base = new Image();
   face_base.crossOrigin = "anonymous";
   face_base.src = "./face/face_base.png";

   face_base.addEventListener('load', (e) => {
      let w = app.screen.width;
      let h = face_base.height * app.screen.width / face_base.width;
      face_base.height = h;
      face_base.width = w;

      let canvas = document.createElement('canvas');
      face_base_context = canvas.getContext('2d');
      canvas.width = app.screen.width;
      canvas.height = app.screen.height;
      face_base_context.drawImage(face_base, 0, app.screen.height - face_base.height, face_base.width, face_base.height );
      face_data = face_base_context.getImageData(0, 0, canvas.width, canvas.height).data;

      loadDB();
   });
}

function loadDB() {
   // console.log("Adding DB");
   csv('assets/tags.csv').then(function(data) {
      data.forEach(function (d){
       dataWords.push({tag: d.tag, frequency: d.frequency});
      });

      progressObject.value = progressObject.getProgress + 10;
   });

   csv('assets/vidsCompact.csv').then(function(data) {
      data.forEach(function (d){

         let time = moment(d.time).toDate();
         let title = d.videoTitle;
         let publisher = d.publisher;
         let tags = d.proTags

       dataVideos.push({time, title, publisher, tags});
      });

      arrangeWords();

      progressObject.value = progressObject.getProgress + 10;
   });
    
   csv('assets/icons_dataset.csv').then(function(data) {
      data.forEach(function (d){

         if(d.playTitle != "Unknown"){
            let playTitle = d.playTitle;
            let iconName = d.processedTitle

             dataIcons.push({playTitle, iconName});
         }
      });
         // console.log(texData);
         progressObject.value = progressObject.getProgress + 10;
         loadIcons();
   });

   csv('assets/appData.csv').then(function(data) {
      data.forEach(function (d){
         let time = moment(d.time).toDate();
         let text = d.title;
         let operation = d.operation;
         let link = d.titleUrl;
         let playTitle = d.playTitle;
         let iconName = d.processedTitle

         dataApps.push({playTitle, iconName, operation, time, text, link});
      });
      progressObject.value = progressObject.getProgress + 10;
   });
}

export function init() {
   initFlag = false;
   // console.log("Inside init");
   initTitle();
   app.stage.addChild(outlineGraphics);
   app.stage.sortableChildren = true;
   addBGCodeTicker();
   introTags(app.ticker.lastTime);

   let b = new Block(0, app.screen.height - app.screen.width, app.screen.width, 0);
   blocks.push(b);

   window.onmousedown = (() => {
      if(level < 6) {

         blocks.forEach((block, index) => {
            if(block.level < 6 && block.test())
               block.divide();
         });

         function chkDestroy(blk) {
            return blk.toDestroy == false;
         }

         let tempBlock = blocks.filter(chkDestroy);
         blocks = [];
         blocks = [...tempBlock];

         level++;

         for(let i = (textBlocks.length / 6 * (level-1)); i <= (textBlocks.length / 6 * (level) ); i++){
            let j = Math.floor(i);
            textBlocks[j].graphics.visible = true;
         }

         // console.log("divided to level :" + level);
      }
   });

   const texture2 = Texture.from('./img/plus.svg');
   // plusGraphics.blendMode = BLEND_MODES.MULTIPLY;
   plusGraphics.beginTextureFill({texture: texture2, matrix: new Matrix(0.16, 0, 0, 0.16, 0, 0)});
   plusGraphics.drawRect(0, 0, app.screen.width, app.screen.height);
   plusGraphics.alpha = 0.1;
   plusGraphics.zIndex = 1;
   app.stage.addChild(plusGraphics);

   faceContainer.visible = true;
   textContainer.visible = true;
   bgCodeTickerGraphics.visible = true;
   plusGraphics.visible = true;

   app.ticker.start();
   app.ticker.add(d => {
      animateTitle();
      // if(textBlocks.length < textblocks_limit)
      //    for(let i = 0; i < 3; i++){
      //       arrangeWords();
      //    }  
      // blocks.forEach(block => block.shimmer());
      // bgCodeTickerAnimate();
      if(Math.random() < 0.01)
         tickerText();
      // textBlocks.forEach(block => block.shimmer());
   });
}

function addBackground() {
   const graphics = new Graphics();
   graphics.beginFill(0x000405);
   graphics.drawRect(0, 0, app.screen.width, app.screen.height);
   app.stage.addChild(graphics);

   Assets.add('scanline', './img/scanline.png');

   const texturesPromise = Assets.load(['scanline']);

   texturesPromise.then((textures) => {
      // console.log("scanline loaded");
      let scanlineGraphics = new Graphics();
      scanlineGraphics.blendMode = BLEND_MODES.MULTIPLY;
      scanlineGraphics.beginTextureFill({texture: textures['scanline'], matrix: new Matrix(0.5, 0, 0, 0.5, 0, 0)});
      scanlineGraphics.drawRect(0, 0, app.screen.width, app.screen.height);
      scanlineGraphics.alpha = 0.3;
      scanlineGraphics.zIndex = 100;
      app.stage.addChild(scanlineGraphics);
   });

}

function addBGCodeTicker() {
   bgCodeTickerGraphics = new Text(bgCodeTicker,{fontFamily : "Disket", fontSize: 14, fill : 0xffffff28, align : 'left'});
   bgCodeTickerGraphics.zIndex = 3;
   app.stage.addChild(bgCodeTickerGraphics);
}

function tickerText(){
   let textToTicker = [];

   if(textBlocks.length){
   while(textToTicker.length < 1){
      let rndmTextBlock = Math.floor(Math.random() * textBlocks.length);
      // console.log(rndmTextBlock, textBlocks.length);
      textBlocks[rndmTextBlock].clock = app.ticker.lastTime;
      textToTicker.push(textBlocks[rndmTextBlock]);
   }
   }

   textToTicker.forEach(block => {
      if(!block.animating)
        block.animateText()
   });
}

export function arrangeWords(){ 
   let oldProgressValue = progressObject.getProgress;
 
   while(textBlocks.length < textblocks_limit){
     let str = dataWords[textBlocks.length].tag;
     let sizeScale = scalePow()
               .exponent(2)
               .domain([0, 3725])
               .range([11, 80]);
     let tb = new textBlock(Math.random() * app.screen.width, Math.random() * app.screen.height, sizeScale(dataWords[textBlocks.length].frequency), str, textBlocks.length);
 
     if(tb.toAdd){
       textBlocks.push(tb);
       tb.graphics.visible = false;
     }
   }
 
   // let ct = 0;
   // while(ct < 2000){
   //   if(textBlocks.length % 100 == 0)
   //   console.log("Done printing " + textBlocks.length + " textblocks.");

   //   let str = dataWords[textBlocks.length].tag;
   //   let sizeScale = d3.scalePow()
   //             .exponent(2)
   //             .domain([0, 3725])
   //             .range([11, 32]);
   //   let tb = new textBlock(Math.random() * app.screen.width, Math.random() * app.screen.height, sizeScale(dataWords[textBlocks.length].frequency), str, textBlocks.length);

   //   if(tb.toAdd)
   //     textBlocks.push(tb);
 
   //   ct++;
   // }

   if (initFlag)
     progressObject.value = 100;
   // createLetterBase();
}

function loadBitmapFont() {
   app.loader.add('Disket', './assets/disket.fnt').load((e) => {
      console.log("font added");
      DisketBmpFnt = e.resources['Disket'];
      setupTitles();
      loadFaceBase();
   });
}

function introTags(clock){
   let interval = setInterval(() => {
      let alpha = Math.abs((Math.sin((app.ticker.lastTime - clock)/2000 + 0)));

      textBlocks.forEach(block => block.graphics.alpha = alpha);
      blocks.forEach(block => block.graphics.alpha = alpha * block.tAlpha);

      if(alpha > 0.9){
        clearInterval(interval);
        textBlocks.forEach(block => block.graphics.alpha = 1);
        blocks.forEach(block => block.graphics.alpha = block.tAlpha);
      }
    }, 100);
}

function bgCodeTickerAnimate() {
   let len = Math.abs(Math.floor(bgCodeTicker.length * Math.sin((app.ticker.lastTime)/3000 + 2/3 * Math.PI)));
   bgCodeTickerGraphics._text = bgCodeTicker.substring(0, len-1) + "_";
   bgCodeTickerGraphics.updateText();
}

function rendertextContainer(event) {
   let mx = event.data.originalEvent.clientX;
   let my = event.data.originalEvent.clientY;

   textBlocks.forEach(block => {
      block.graphics.x = block.x + mx / app.screen.width * (-40 + 2 * block.graphics.zIndex) + 1 * block.graphics.zIndex;
   });
   // textContainer.x = mx / app.screen.width * (-30) + 15;
   textContainer.y = my / app.screen.height * (-40) + 20;
}

function renderfaceContainer(event) {
   let mx = event.data.originalEvent.clientX;
   let my = event.data.originalEvent.clientY;

   blocks.forEach(block => {
      block.graphics.position.set((mx / app.screen.width) * (-1 * block.level**2) + block.level**2/2 + block.x + block.size * 0.05, (my / app.screen.height) * (-1 * block.level**2) + block.level**2/2 + block.y + block.size * 0.05);
   });

   // faceContainer.x = mx / app.screen.width * (-60) + 30;
   // faceContainer.y = my / app.screen.height * (-60) + 30;
}

export {app, blocks, textContainer, faceContainer, DisketBmpFnt, face_data, face_base_context, level, threshold, textBlocks, dataIcons, dataApps, dataVideos, dataWords, themeColor, themeColor2, progressObject};

// export function arrangeWords(){ 
//    let oldProgressValue = progressObject.getProgress;
 
//      let str = dataWords[textBlocks.length].tag;
//      let sizeScale = d3.scalePow()
//                .exponent(2)
//                .domain([0, 3725])
//                .range([11, 80]);
//      let tb = new textBlock(Math.random() * app.screen.width, Math.random() * app.screen.height, sizeScale(dataWords[textBlocks.length].frequency), str, textBlocks.length);
 
//      if(tb.toAdd){
//        textBlocks.push(tb);
//      }
 
//    // let ct = 0;
//    // while(ct < 2000){
//    //   if(textBlocks.length % 100 == 0)
//    //   console.log("Done printing " + textBlocks.length + " textblocks.");

//    //   let str = dataWords[textBlocks.length].tag;
//    //   let sizeScale = d3.scalePow()
//    //             .exponent(2)
//    //             .domain([0, 3725])
//    //             .range([11, 32]);
//    //   let tb = new textBlock(Math.random() * app.screen.width, Math.random() * app.screen.height, sizeScale(dataWords[textBlocks.length].frequency), str, textBlocks.length);

//    //   if(tb.toAdd)
//    //     textBlocks.push(tb);
 
//    //   ct++;
//    // }

//    if (initFlag)
//      progressObject.value = 100;
//    // createLetterBase();
// }