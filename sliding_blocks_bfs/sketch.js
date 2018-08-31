var blocks = [];
var block_size;
var rad, spacing;
var empty_pos = 15;

var anim_decay_rate = 0.2;

function setup() {
     createCanvas(windowWidth, windowHeight);

     block_size = windowWidth / 12.8;
     rad = windowWidth / 274.29;
     spacing = windowWidth / 192;

     for (let y = 0; y < 4; y++){
          for (let x = 0; x < 4; x++){
               blocks.push(new Block(createVector((windowWidth / 2) - (block_size * 2) + (x * (block_size + spacing)), (windowHeight / 2) - (block_size * 2) + (y * (block_size + spacing))), block_size, (y * 4) + x));
          }
     }

     blocks.pop();
}
function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
}

function draw(){
     background(255);

     for (let i = 0; i < 15; i++){
          blocks[i].move();
          blocks[i].draw();
     }
}

function mousePressed(){
     let moveables = get_moveables();

     for (let i = 0; i < 15; i++){
          if (mouseX > blocks[i].pos.x - (blocks[i].size / 2) && mouseX < blocks[i].pos.x + (blocks[i].size / 2)){
               if (mouseY > blocks[i].pos.y - (blocks[i].size / 2) && mouseY < blocks[i].pos.y + (blocks[i].size / 2)){
                    if (moveables.indexOf(blocks[i].num) != -1) {
                         let block_pos = blocks[i].grid_pos;
                         blocks[i].grid_pos = empty_pos;
                         empty_pos = block_pos;

                         blocks[i].target = createVector((windowWidth / 2) - (block_size * 2) + ((blocks[i].grid_pos % 4) * (block_size + spacing)), (windowHeight / 2) - (block_size * 2) + ((Math.floor(blocks[i].grid_pos / 4)) * (block_size + spacing)));
                    }
               }
          }
     }
}

function get_moveables(){
     let move_index = [];

     if (empty_pos - 4 >= 0)
          move_index.push(empty_pos - 4);
     if (empty_pos + 4 <= 15)
          move_index.push(empty_pos + 4);
     if (empty_pos % 4 != 0)
          move_index.push(empty_pos - 1);
     if ((empty_pos % 4) - 3 != 0)
          move_index.push(empty_pos + 1);

     let moveables = [];
     for (let i = 0; i < move_index.length; i++){
          for (let j = 0; j < 15; j++){
               if (blocks[j].grid_pos == move_index[i]){
                    moveables.push(blocks[j].num);
                    break;
               }
          }
     }

     return moveables;
}

class Block{
     constructor(pos, size, num){
          this.pos = pos;
          this.size = size;
          this.num = num;
          this.grid_pos = num;
          this.target = pos;
     }

     draw(){
          fill(200);
          noStroke();

          rect(this.pos.x - Math.floor(this.size / 2), this.pos.y - Math.floor(this.size / 2), this.size, this.size, rad);
          textAlign(CENTER);

          fill(0);
          stroke(200);
          text(this.num, this.pos.x, this.pos.y);
     }

     move(){
          let dist = p5.Vector.sub(this.target, this.pos);
          dist = p5.Vector.mult(dist, anim_decay_rate);

          this.pos = p5.Vector.add(this.pos, dist);
     }
}
