// features yet to be implemented
// zoom - screen
// introduction
// pointer ?
// text fade in fade out temporarily
// header
// info
// loader

import * as PIXI from 'pixi.js';
import * as d3 from 'd3';
import * as moment from 'moment';
import {BloomFilter} from 'pixi-filters';
import {Block} from './js/blocks_new.js';
import {textBlock} from './js/textBlock_new.js';
import {loader, texData, loadIcons} from './js/icons.js';
import {bgCodeTicker} from './js/code.js';
import {initTitle, animateTitle} from './js/title.js';

// variables
let blocks = [], textBlocks = [];
let face_base_context, face_data;
let threshold = 20, level = 0;
let textblocks_limit = 100;
let dataWords = [];
let dataIcons = [];
let dataApps = [];
let dataVideos = [];
let bgCodeTickerGraphics = new PIXI.Graphics();
let plusGraphics = new PIXI.Graphics();
let outlineGraphics = new PIXI.Graphics();
let scanlineTexture;

// const themeColor = 0x93D94E;
const themeColor = 0x0AA5FE;
const themeColor2 = 0x0AA5FE;

// PIXI variables
const textContainer = new PIXI.Container();
const faceContainer = new PIXI.Container();

// Create a new app (will auto-add extract plugin to renderer)
const app = new PIXI.Application({
    width : 1280,
    height: 1811,
    backgroundColor: 0x000000
 });

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

const progressLoader = new PIXI.Text("(LOADING)",{fontFamily : "Disket", fontSize: 40, fill : themeColor, align : 'center', letterSpacing: 20});
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
       if(this.progress >= 100){
         init();
         app.stage.removeChild(progressLoader);
       }
   }
};

faceContainer.visible = false;
textContainer.visible = false;
bgCodeTickerGraphics.visible = false;
plusGraphics.visible = false;

 loadFaceBase();

function loadFaceBase() {
   console.log("logging loadFaceBase");
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
   console.log("Adding DB");
   d3.csv('assets/tags.csv').then(function(data) {
      data.forEach(function (d){
       dataWords.push({tag: d.tag, frequency: d.frequency});
      });

      progressObject.value = progressObject.getProgress + 10;
   });

   d3.csv('assets/vidsCompact.csv').then(function(data) {
      data.forEach(function (d){

         let time = moment(d.time).toDate();
         let title = d.videoTitle;
         let publisher = d.publisher;
         let tags = d.proTags

       dataVideos.push({time, title, publisher, tags});
      });

      progressObject.value = progressObject.getProgress + 10;
   });
    
   d3.csv('assets/icons_dataset.csv').then(function(data) {
      data.forEach(function (d){

         if(d.playTitle != "Unknown"){
            let playTitle = d.playTitle;
            let iconName = d.processedTitle

             dataIcons.push({playTitle, iconName});
         }
      });
         console.log(texData);
         progressObject.value = progressObject.getProgress + 10;
         loadIcons();
   });

   d3.csv('assets/appData.csv').then(function(data) {
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
   initTitle();
   app.stage.addChild(outlineGraphics);
   app.stage.sortableChildren = true;
   addBGCodeTicker();
   introTags(app.ticker.lastTime);

   let b = new Block(0, app.screen.height - app.screen.width, app.screen.width, 0);
   blocks.push(b);

   for(let i = 0; i < 6; i++) {

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

      // console.log("divided to level :" + level);
   };

   const texture2 = PIXI.Texture.from('./img/plus.svg');
   // plusGraphics.blendMode = PIXI.BLEND_MODES.MULTIPLY;
   plusGraphics.beginTextureFill({texture: texture2, matrix: new PIXI.Matrix(0.16, 0, 0, 0.16, 0, 0)});
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
      blocks.forEach(block => block.shimmer());
      bgCodeTickerAnimate();
      if(Math.random() < 0.03)
         tickerText();
      textBlocks.forEach(block => block.shimmer());
   });
}

function addBackground() {
   const graphics = new PIXI.Graphics();
   graphics.beginFill(0x000405);
   graphics.drawRect(0, 0, app.screen.width, app.screen.height);
   app.stage.addChild(graphics);

   scanlineTexture = PIXI.Texture.from('./img/scanline.png');
   let scanlineLoader = new PIXI.Loader();

   scanlineLoader.add('./img/scanline.png');

   scanlineLoader.load();

   scanlineLoader.onComplete.add(() => {
      console.log("scanline loaded");
      let scanlineGraphics = new PIXI.Graphics();
      scanlineGraphics.blendMode = PIXI.BLEND_MODES.MULTIPLY;
      scanlineGraphics.beginTextureFill({texture: scanlineLoader.resources['./img/scanline.png'].texture, matrix: new PIXI.Matrix(0.5, 0, 0, 0.5, 0, 0)});
      scanlineGraphics.drawRect(0, 0, app.screen.width, app.screen.height);
      scanlineGraphics.alpha = 0.3;
      scanlineGraphics.zIndex = 100;
      app.stage.addChild(scanlineGraphics);
   });

}

function addBGCodeTicker() {
   bgCodeTickerGraphics = new PIXI.Text(bgCodeTicker,{fontFamily : "Disket", fontSize: 14, fill : 0xffffff28, align : 'left'});
   bgCodeTickerGraphics.zIndex = 3;
   app.stage.addChild(bgCodeTickerGraphics);
}

function tickerText(){
   let textToTicker = [];

   while(textToTicker.length < 1){
      let rndmTextBlock = Math.floor(Math.random() * textblocks_limit);
      textBlocks[rndmTextBlock].clock = app.ticker.lastTime;
      textToTicker.push(textBlocks[rndmTextBlock]);
   }

   textToTicker.forEach(block => block.animateText());
}

export function arrangeWords(){ 
   let oldProgressValue = progressObject.getProgress;
   while(textBlocks.length < textblocks_limit){
     if(textBlocks.length % 100 == 0)
      console.log("Done printing " + textBlocks.length + " textblocks.");
 
     let str = dataWords[textBlocks.length].tag;
     let sizeScale = d3.scalePow()
               .exponent(2)
               .domain([0, 3725])
               .range([11, 80]);
     let tb = new textBlock(Math.random() * app.screen.width, Math.random() * app.screen.height, sizeScale(dataWords[textBlocks.length].frequency), str, textBlocks.length);
 
     if(tb.toAdd){
       textBlocks.push(tb);
       progressObject.value = oldProgressValue + (textBlocks.length/textblocks_limit) * 30;
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
 
   console.log("Done printing " + textblocks_limit + " textblocks.");
   // createLetterBase();
}

function imageProcessing(path) {
   let tex = loader.resources[path].texture;
   tex.defaultAnchor.set(0.5, 0.5);

   return tex;

   // to count average color value of icon
   // const img = new Image();
   // img.crossOrigin = "anonymous";
   // img.src = url + iconNames[iconData.length];

   // img.addEventListener('load', (e) => {
   //    let obj = new Object(), avg = 0, count = 0, data;
   //    let canvas = document.createElement('canvas');
   //    let context  = canvas.getContext('2d');
   //    canvas.width = img.width;
   //    canvas.height = img.height;
   //    context.drawImage(img, 0, 0, img.width, img.height );
   //    data = context.getImageData(0, 0, canvas.width, canvas.height).data;
   
   //    for(let i = 0; i < data.length; i+= 4){
   //    avg += (data[i] + data[i+1] + data[i+2]) / 3;
   //    count++;
   //    }

   //    avg = (avg / count);
   //    obj = {index: iconData.length, texture: tex, average: avg};
   // });
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
      block.graphics.position.set((mx / app.screen.width) * (-1 * block.level**2) + block.level**2/2, (my / app.screen.height) * (-1 * block.level**2) + block.level**2/2);
   });

   // faceContainer.x = mx / app.screen.width * (-60) + 30;
   // faceContainer.y = my / app.screen.height * (-60) + 30;
}

export {app, blocks, textContainer, faceContainer, face_data, face_base_context, level, threshold, textBlocks, dataIcons, dataApps, dataVideos, dataWords, themeColor, themeColor2, progressObject};