import {app, blocks, textContainer, face_data, face_base_context, level, threshold, textBlocks, dataWords, dataVideos, themeColor} from './script.js';

const tsb = document.getElementById("textSidebar");

const symbols = "хфплиждФГŒþøæåß×»§";

export class textBlock{
  
    constructor(x, y, s, txt, ind){
      this.x = x;
      this.y = y;
      this.size = s;
      this.textO = txt;
      this.text = '(' + txt + ')';
      this.index = ind;
      this.mouse = false;
      this.toAdd = false;
      this.tAlpha = 1;
      this.clock = 0;
      this.tickerCtr = 0;
      // this.bg = random(["chartreuse", "orangered", "red", "yellow", "deepskyblue"]);

      this.w = 0;
      this.h = 0;

      this.bx = 0;
      this.by = 0;

      this.top = 0;
      this.left = 0;
      this.right = 0;
      this.bottom = 0;
      this.graphics = 0;

      this.draw();
    }

    draw() {
      this.graphics = new PIXI.Text(this.text,{fontFamily : "Disket", fontSize: this.size, fill : themeColor, align : 'center'});
      this.graphics.alpha = this.tAlpha;
      this.graphics.position.x = this.x;
      this.graphics.position.y = this.y;
      this.graphics.anchor.set(0.5, 0.5);
      this.graphics.zIndex = this.size / 120 * 20;

      this.giveBounds();

      if(this.test()){
        // Opt-in to interactivity
        this.graphics.interactive = true;

        // Shows hand cursor
        this.graphics.buttonMode = true;

        this.graphics.on('pointerover', (event) => {
            this.displayStats(event);
            this.graphics.style._fill = "white";
            this.graphics.updateText();
        });

        this.graphics.on('pointerdown', (event) => {
          this.persistStats();
          this.graphics.style._fill = "white";
          this.graphics.updateText();
        });


        this.graphics.on('pointerout', () => {
          this.hideStats();
          let style = new PIXI.TextStyle({fontFamily : "Disket", fontSize: this.size, fill : themeColor, align : 'center'});
          this.graphics.style = style;
          this.graphics.updateText();
        });

        textContainer.addChild(this.graphics);
      } else {
        this.graphics.destroy();
      }
    }

    giveBounds(){
      let bounds = this.graphics.getBounds();

      this.w = bounds.width;
      this.h = bounds.height;

      this.bx = bounds.x;
      this.by = bounds.y;

      this.top = Math.floor(this.by);
      this.left = Math.floor(this.bx);
      this.right = Math.floor(this.bx + this.w);
      this.bottom = Math.floor(this.by + this.h);

      // console.log(this);
    }

    display(){
        push();
        translate(this.bx, this.by);
        // rotate(this.angle);
        // fill(this.mousse ? "black" : this.bg);
        noStroke();
        // rect(-0.05 * this.w, -0.15 * this.h, this.w, this.h);
        // rect(0, 0, this.w, this.h);
        // this.mousse ? blendMode(BLEND) : blendMode(MULTIPLY);
        let c1 = color("#3cbcfc");
        let c2 = color("black");
        let c3 = lerpColor(c2, c1, map(this.size, 0, 48, 0.7, 1));
        this.mousse ? fill(255) : fill(c3);
        textSize(this.size);
        textFont(font);
        text(this.text, (this.x - this.bx), (this.y - this.by));
        pop();
    }

    test() {
      let flag = true;
 
     // check collision with all the textblocks
     if(textBlocks.length > 0)
       textBlocks.forEach( block => {
         if(this.right > block.left && this.left < block.right && this.bottom > block.top && this.top < block.bottom){
           flag = false;
         }
       });
 
       if(flag == true){
         let midPoints = 4;
         let d = this.w;
 
         // check if whole textblock is inside the canvas
         if(this.left < 0.03*app.screen.width || this.right > 0.97*app.screen.width || this.bottom > (app.screen.height - 0.03 * app.screen.width) || this.top < 0.1 * app.screen.width){
           flag = false;
         }
 
         if(this.left < 0.03*app.screen.width || this.right > 0.97*app.screen.width || this.bottom > (app.screen.height - 0.03 * app.screen.width) || this.top < 0.1 * app.screen.width){
           flag = false;
         }
 
         // check if text block's midpoint is on colored pixel
         for(let i = 0; i <= midPoints; i++){
           let mU = new PIXI.Point(Math.floor(this.left + d * i/midPoints), this.top);
           let mB = new PIXI.Point(Math.floor(this.left + d * i/midPoints), this.bottom);
 
           if(face_data[(mU.y * app.screen.width + mU.x) * 4 + 3] > 0){
             flag = false;
             continue;
           }
 
           if(face_data[(mB.y * app.screen.width + mB.x) * 4 + 3] > 0){
             flag = false;
             continue;
           }
         }
       }

       if(flag)
        this.toAdd = true;

       return flag;
    }

    animateText() {
      this.interval = setInterval(() => {
        let len = Math.abs(Math.floor(this.text.length * Math.sin((app.ticker.lastTime - this.clock)/1000 + 2/3 * Math.PI)));
        this.graphics._text = this.text.substring(0, len-1) + symbols[Math.floor(Math.random() * symbols.length)] + ")";
        this.graphics.updateText();

        if(len >= this.textO.length - 2){
          clearInterval(this.interval);
          this.graphics._text = this.text;
          this.graphics.updateText();
        }
      }, 30);
    }

    
    shimmer() {
      if(Math.random() < 0.05 && this.tAlpha > 0.15)
            this.graphics.alpha = 1 - Math.random() * 0.2;
    }

    displayStats(event) {
      let tag_name = document.getElementById("Tag");
      tag_name.innerHTML = '#' + this.textO;

      let pInstances = document.getElementById("instances");
      pInstances.innerHTML = 'This tag has appeared <span style="color: red; font-weight: bold;"> ' + dataWords.filter(tag => tag.tag == this.textO)[0].frequency + '</span> times between 2018 and now.';

      let dataset = dataVideos.filter(vid => vid.tags.includes(this.textO));

      let extent = [new Date(2018, 1, 1), new Date()];

      let svg = d3.select("#tagGraph")
                  .style("margin-top", '8px')
                  .style("width", 'inherit')
                  .style("height", '80px');

      svg.selectAll("*").remove();

      let timeScale = d3.scaleTime()
                .domain(extent)
                .range([20, document.getElementById("Tag").offsetWidth - 20]);
      
      let chart = svg.append("g");

      // add on hover to display each video details
      chart.selectAll("circle")
            .data(dataset)
            .enter().append("rect")
            .attr("width", 1)
            .attr("height", 30)
            .attr("opacity", 0.1)
            .attr("fill", "red")
            .attr("x", function(d) { return timeScale(d.time);})
            .attr("y", 0)
            .on('mouseover', (event, d) => {
              tag_name.innerHTML = d.title;
              pInstances.innerHTML = d.publisher + " | " + moment(d.time).format("LL");
            })
            .on('mouseout', (event, d) => {
              tag_name.innerHTML = '#' + this.textO;
              pInstances.innerHTML = 'This tag has appeared <span style="color: red;"> ' + dataWords.filter(tag => tag.tag == this.textO)[0].frequency + '</span> times between 2018 and now.';
            });

      let axis = svg.append("g");

      axis.selectAll("marks")
          .data([0, document.getElementById("Tag").offsetWidth-2]).enter()
          .append("rect")
          .attr("width", 1)
          .attr("height", 30)
          .attr("opacity", 0.2)
          .attr("fill", "white")
          .attr("x", function(d) { return d;})
          .attr("y", 0);

      axis.append("text")
          .attr("x", 0)
          .attr("y", 64)
          .attr("fill", "white")
          .attr("class", "axis")
          .text(2018)
          .attr("text-anchor", "start")
          .attr("font-size", "20px");

      axis.append("text")
          .attr("x", document.getElementById("Tag").offsetWidth)
          .attr("y", 64)
          .attr("fill", "white")
          .attr("class", "axis")
          .text("Now")
          .attr("text-anchor", "end")
          .attr("font-size", "20px");

        tsb.classList.remove("persist");
        tsb.classList.remove("inactive");
        tsb.classList.add("active");

        tsb.style.left = (event.data.originalEvent.clientX + 40) + "px";
        tsb.style.top = (event.data.originalEvent.clientY - 40) + "px";

        let tsbBottom = tsb.getBoundingClientRect().bottom;
        let bHeight = document.documentElement.clientHeight;

        if(tsbBottom > bHeight){
          let diff = tsbBottom - bHeight;

          tsb.style.top = (event.clientY - 64 - diff) + "px";
        }
    }

  hideStats() {
    tsb.classList.remove("active");
    tsb.classList.add("inactive");
  }

  persistStats() {
    if(tsb.classList.contains("persist")){
      tsb.classList.remove("persist");
    } else {
      tsb.classList.add("persist");
    }
  }

}