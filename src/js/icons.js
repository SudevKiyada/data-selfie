import * as PIXI from 'pixi.js';
import { Assets } from '@pixi/assets';
import * as d3 from 'd3';
import { dataIcons, init, progressObject, arrangeWords } from "../script.js";

let icons = [];

let texData = [];
let loader = new PIXI.Loader();
let url = "./icons/";
let oldProgressValue;

export function loadIcons() {
  let icoNameArray = [];
  dataIcons.forEach(icon => {
    icons.push(icon.iconName);
    Assets.add(icon.iconName, url + icon.iconName + '.jpg');
    icoNameArray.push(icon.iconName);
  })

  // loader.load();
  console.log("logging loadIcons");
  oldProgressValue = progressObject.getProgress;

  const texturesPromise = Assets.load(icoNameArray);

  texturesPromise.then((textures) => {
    dataIcons.forEach((icon, ind) =>{
      let texture = textures[icon.iconName];
      texture.defaultAnchor.set(0.5, 0.5);
  
      let name = icon.iconName;
      let playTitle = icon.playTitle;
      let obj = {texture, name, playTitle};
  
      texData.push(Object.assign({}, obj));
    });
  
    console.log(`Completed loading ${icons.length} icons`);
    arrangeWords();
  });
}

// loader.onProgress.add((e) => {
//   progressObject.value = oldProgressValue + (e.progress/2);
// });

// loader.onComplete.add(() => {
//   dataIcons.forEach((icon, ind) =>{
//     let texture = loader.resources[url + icon.iconName + '.jpg'].texture;
//     texture.defaultAnchor.set(0.5, 0.5);

//     let name = icon.iconName;
//     let playTitle = icon.playTitle;
//     let obj = {texture, name, playTitle};

//     texData.push(Object.assign({}, obj));
//   });

//   progressObject.value = oldProgressValue + 50;

//   console.log(`Completed loading ${icons.length} icons`);
//   arrangeWords();
// });

export {loader, texData};


// -----------------------------------------------------------------------------------
// to calculate avg
// const img = new Image();
// img.crossOrigin = "anonymous";
// img.src = url + iconNames[iconData.length];

// img.addEventListener('load', (e) => {
//     let obj = new Object(), avg = 0, count = 0, data;
//   let canvas = document.createElement('canvas');
//   let context  = canvas.getContext('2d');
//   canvas.width = img.width;
//   canvas.height = img.height;
//   context.drawImage(img, 0, 0, img.width, img.height );
//   data = context.getImageData(0, 0, canvas.width, canvas.height).data;
// -----------------------------------------------------------------------------------