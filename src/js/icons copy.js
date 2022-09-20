import { Assets } from '@pixi/assets';
import { dataIcons, progressObject, blocks, arrangeWords } from "../script.js";

let icons = [];

let texData = [];
let url = "./icons/";
let oldProgressValue;

let iconsLoadedFlag = false;

export function loadIcons() {
  let icoNameArray = [];
  dataIcons.forEach(icon => {
    icons.push(icon.iconName);
    Assets.add(icon.iconName, url + icon.iconName + '.jpg');
    icoNameArray.push(icon.iconName);

    let name = icon.iconName;
    let playTitle = icon.playTitle;
    let obj = {texture: null, name, playTitle};

    texData.push(Object.assign({}, obj));

    const texturesPromise = Assets.load([icon.iconName]);

    texturesPromise.then((textures) => {
      let ind = texData.findIndex(x => x.name == icon.iconName);
      texData[ind].texture = textures[icon.iconName];

      let b = blocks.filter(block => block.iconName == icon.iconName);
      b.forEach(block => {
        block.iconsLoadedFlag = true;
        block.loadTexture();
        block.box();
      });
    });

  })

  // loader.load();
  // console.log("logging loadIcons");
  oldProgressValue = progressObject.getProgress;
  // console.log("to arrWords:", texData.length);

  // const texturesPromise = Assets.load(icoNameArray);

  // texturesPromise.then((textures) => {
  //   dataIcons.forEach((icon, ind) =>{
  //     let texture = textures[icon.iconName];
  //     // texture.defaultAnchor.set(0.5, 0.5);
  
  //     let name = icon.iconName;
  //     let playTitle = icon.playTitle;
  //     let obj = {texture, name, playTitle};
  
  //     texData.push(Object.assign({}, obj));
  //   });

  //   iconsLoadedFlag = true;
  //   console.log("loaded icons");

  //   blocks.forEach(block => {
  //     block.findMean();
  //     block.box();
  //   });
  
    // console.log(`Completed loading ${icons.length} icons`);
  // });
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

export {texData, iconsLoadedFlag};


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