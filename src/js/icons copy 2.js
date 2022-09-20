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

    let name = icon.iconName;
    let playTitle = icon.playTitle;
    let w = 0, h = 0, x = 0, y = 0;
    let obj = {texture: null, name, playTitle, x, y, w, h};

    texData.push(Object.assign({}, obj));
  });

    for(let i = 1; i <= 14; i++){
      Assets.add('atlas' + i,"./assets/atlas/texture-" + i + ".json");
      icoNameArray.push('atlas' + i);
    }

    const texturesPromise = Assets.load(icoNameArray);

    texturesPromise.then((textures) => {
      for(const atlas in textures){
        for(const tex in textures[atlas].textures){
          let texName = tex.replace('.jpg', '');
          let texDataObj = texData.filter(d => d.name == texName)[0];
          let tt = texData.indexOf(texDataObj);
          texData[tt].texture = textures[atlas].textures[tex];

          let frame = textures[atlas].data.frames[tex].frame;
          texData[tt].x = frame.x;
          texData[tt].y = frame.y;
          texData[tt].w = frame.w;
          texData[tt].h = frame.h;

          let b = blocks.filter(block => block.iconName == icon.iconName);
          b.forEach(block => {
            block.iconsLoadedFlag = true;
            block.loadTexture();
            block.box();
          });
        }
      }
    });



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