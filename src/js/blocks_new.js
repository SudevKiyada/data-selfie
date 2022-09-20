import { Graphics, filters, BLEND_MODES, Matrix, Sprite, Texture } from 'pixi.js';
import { select } from 'd3-selection';
import { scaleTime } from 'd3-scale';
import {extent} from 'd3-array';
import * as moment from 'moment';
import {app, blocks, faceContainer, face_data, face_base_context, threshold, dataApps, themeColor2, themeColor} from '../script.js';
import { texData } from './icons.js';

export class Block{
  
    constructor(x, y, s, l){
      this.id = "Lvl" + l + "" + x + "" + y + "" + s;
      this.x = x;
      this.y = y;
      this.size = s;
      this.ico = null;
      this.meanR = null;
      this.meanG = null;
      this.meanB = null;
      this.meanA = 255;
      this.level = l;
      this.mouse = false;
      this.toDestroy = false;
      this.toDivide = false;
      this.graphics = new Sprite(Texture.WHITE);
      this.tAlpha = 0.02;
      this.iconName = null;
      this.playTitle = "AA";
      this.iconsLoadedFlag = false;
      this.iconIndex = null;

      this.findMean();
      this.breakable = (this.size <= 4) ? false : this.test();
      this.box();
    }
    
    box(){
        if(this.graphics){
            faceContainer.removeChild(this.graphics);
        }
        
        if(this.iconsLoadedFlag){
            this.graphics.texture = this.ico;
            this.graphics.position.set(this.x + 0.05 * this.size, this.y + 0.05 * this.size);
            this.graphics.height = 0.9 * this.size;
            this.graphics.width = 0.9 * this.size;
            this.graphics.alpha = this.tAlpha;
        } else{
            this.graphics.alpha = 0.3;
        }

        const colorMatrix = new filters.ColorMatrixFilter();
        colorMatrix.desaturate();
        colorMatrix.contrast(0.7, true);
        const colorMatrix2 = new filters.ColorMatrixFilter();
        colorMatrix2.tint(themeColor2);

        this.graphics.zIndex = this.level / 6 * 20;

        this.graphics.filters = [colorMatrix, colorMatrix2];

        this.graphics.blendMode = BLEND_MODES.ADD;

        // Opt-in to interactivity
        if(true){
            this.graphics.interactive = true;

            // Shows hand cursor
            this.graphics.buttonMode = true;


            // this.graphics.on('pointerover', (event) => {
            //     this.displayStats(event);
            // });

            this.graphics.on('pointerout', () => {
                this.hideStats();
            });
        }

        faceContainer.addChild(this.graphics);
    }
    
    findMean(){
      let rAvg = 0, gAvg = 0, bAvg = 0, aAvg = 0;

      try {
        let color_data = face_base_context.getImageData(this.x, this.y, this.size, this.size).data;

        for(let i = 0; i < color_data.length; i += 4){
            rAvg += color_data[i];
            gAvg += color_data[i + 1];
            bAvg += color_data[i + 2];
            aAvg += color_data[i + 3];
        }

        this.meanR = Math.floor(rAvg / (color_data.length / 4));
        this.meanG = Math.floor(gAvg / (color_data.length / 4));
        this.meanB = Math.floor(bAvg / (color_data.length / 4));
        this.meanA = Math.floor(aAvg / (color_data.length / 4));

        // console.log(Math.floor((((this.meanR + this.meanG + this.meanB) / 3) * 841) / 255));
            this.iconIndex = (blocks.length + Math.floor(Math.random() * texData.length)) % texData.length;
            
            if(this.iconName == null){
                this.iconName = texData[this.iconIndex].name;
                this.playTitle = texData[this.iconIndex].playTitle;
            }

            if(texData[this.iconIndex].texture != null){
                this.iconsLoadedFlag = true;
                this.loadTexture();
            }

            // if(texData[this.iconIndex].texture != null)
            //     this.iconsLoadedFlag = true;
        }
        catch(err) {
            console.log(err);
            console.log(this);
        }
    }

    loadTexture() {
        if(this.iconsLoadedFlag){
            this.ico = texData[this.iconIndex].texture;

            this.tAlpha = this.meanA < 40 ? this.meanA/255 : ((this.meanR + this.meanG + this.meanB) / (3 * 255) * 1 + 0.0);
        }
    }
    
    divide(){
        let ind = blocks.indexOf(this);
        if(ind != -1)
            this.toDestroy = true;

        faceContainer.removeChild(this.graphics);
      
      let b = new Block(this.x, this.y, Math.floor(this.size/2), this.level + 1);
      blocks.push(b);
  
      b = new Block(this.x + Math.floor(this.size/2), this.y, (this.size/2), this.level + 1);
      blocks.push(b);
  
      b = new Block(this.x, this.y + Math.floor(this.size/2), (this.size/2), this.level + 1);
      blocks.push(b);
  
      b = new Block(this.x + Math.floor(this.size/2), this.y + Math.floor(this.size/2), (this.size/2), this.level + 1);
      blocks.push(b);
    }

    test() {
        let flag = false;

        for(let j = 0; j < this.size; j++){
            for(let i = 0; i < this.size; i++){
                let ind = ((this.y + j) * app.screen.width + (this.x + i)) * 4;
                if( ((face_data[ind] - this.meanR) > threshold) || ((face_data[ind+1] - this.meanG) > threshold) || ((face_data[ind+2] - this.meanB) > threshold)){
                    flag = true;
                    break;
                }
            }
        }

        return flag;
    }

    shimmer() {
        if(Math.random() < 0.05 && this.tAlpha > 0.15)
            this.graphics.alpha = this.tAlpha + Math.random() * 0.2;
    }

    displayStats(event) {
        let icon = document.getElementById("icon");
        icon.src = `./icons/${this.iconName}.jpg`;

        let icon_name = document.getElementById("icon_name");
        icon_name.innerHTML = this.playTitle;

        let svg = select("#appGraph")
          .style("margin-top", '8px')
          .style("width", 'inherit')
          .style("height", '84px');

        svg.selectAll("*").remove();

        let tempDiv = document.getElementById("icon_history");

        if(tempDiv)
            tempDiv.remove();

        let div = document.createElement("div");
        div.setAttribute("id", "icon_history");
        div.setAttribute("class", "info");

        let dates = [], operations = [], ind = this.ico;

        let dataset = dataApps.filter(ico => ico.playTitle == this.playTitle);

        dataset.forEach(function (icon){
            let d = icon.time;
            dates.push(d);
            (icon.operation == "Uninstalled") ? operations.push("Uninstalled") : operations.push("Installed");
        });

        let extnt = extent(dates);

        svg.append("svg");

        let timeScale = scaleTime()
                .domain(extnt)
                .range([0, document.getElementById("icon_name").offsetWidth - 3]);
        
        let chart = svg.append("g");

        chart.selectAll("circle")
            .data(dates)
            .enter().append("rect")
            .attr("fill", function(d, i) { return (operations[i] == "Uninstalled") ? "red" : "green";})
            .attr("x", function(d, i) { return timeScale(d);})
            .attr("y", 0)
            .attr('width', 2)
            .attr('height', 30)
            .attr("opacity", 1);

        let axis = svg.append("g");

        axis.append("text")
                  .attr("x", 0)
                  .attr("y", 48)
                  .attr("fill", "white")
                  .attr("class", "axis")
                  .text(moment(extnt[0]).format('DD-MM-YYYY'))
                  .attr("text-anchor", "start")
                  .attr("font-size", "16px");

        axis.append("text")
            .attr("x", document.getElementById("icon_name").offsetWidth)
            .attr("y", 48)
            .attr("fill", "white")
            .attr("class", "axis")
            .text(moment(extnt[1]).format('DD-MM-YYYY'))
            .attr("text-anchor", "end")
            .attr("font-size", "16px");

        axis.append("circle")
            .attr("cx", 5)
            .attr("cy", 72)
            .attr("fill", "green")
            .attr("r", 5);

        axis.append("text")
            .attr("x", 16)
            .attr("y", 78)
            .attr("fill", "white")
            .attr("class", "axis")
            .text('Installed on')
            .attr("text-anchor", "start")
            .attr("font-size", "14px");

        axis.append("circle")
            .attr("cx", 160)
            .attr("cy", 72)
            .attr("fill", "red")
            .attr("r", 5);

        axis.append("text")
            .attr("x", 170)
            .attr("y", 78)
            .attr("fill", "white")
            .attr("class", "axis")
            .text('Uninstalled on')
            .attr("text-anchor", "start")
            .attr("font-size", "14px");

        let sb = document.getElementById("sidebar");
        sb.appendChild(div);
        sb.classList.remove("inactive");
        sb.classList.add("active");

        sb.style.left = (event.data.originalEvent.clientX + 40) + "px";
        sb.style.top = (event.data.originalEvent.clientY - 40) + "px";

      let sbBottom = sb.getBoundingClientRect().bottom;
      let bHeight = document.documentElement.clientHeight;

      if(sbBottom > bHeight){
        let diff = sbBottom - bHeight;

        sb.style.top = (event.clientY - 64 - diff) + "px";
      }
    }

    hideStats() {
        let sb = document.getElementById("sidebar");
        sb.classList.remove("active");
        sb.classList.add("inactive");
    }


}