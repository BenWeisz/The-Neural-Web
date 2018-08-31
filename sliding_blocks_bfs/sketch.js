var blocks = [];
var block_size;
var rad, spacing;
var empty_pos = 15;

var anim_decay_rate = 0.2;

var b_solve;

var path = [];
var cur_move_index = 0;
var timer = 0;

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

     b_solve = new Button('Solve', createVector((windowWidth / 2) - (windowWidth / 30.72), (windowHeight / 2) - (block_size * 2) + (4 * (block_size + spacing))), color(19, 193, 135), createVector(windowWidth / 15.36, windowWidth / 32));
}
function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
}

function draw(){
     background(255);

     if (path.length != 0){
          if (cur_move_index == path.length){
               path = [];
               cur_move_index = 0;
          }
          else if (timer <= 0){
               timer = 30;
               let cur_move = path[cur_move_index];
               let ind;

               for (let i = 0; i < 16; i++){
                    if (blocks[i].num == cur_move){
                         ind = i;
                         break;
                    }
               }

               let empty_temp = empty_pos;
               empty_pos = blocks[ind].grid_pos;
               blocks[ind].grid_pos = empty_temp;
               blocks[ind].target = createVector((windowWidth / 2) - (block_size * 2) + ((blocks[ind].grid_pos % 4) * (block_size + spacing)), (windowHeight / 2) - (block_size * 2) + ((Math.floor(blocks[ind].grid_pos / 4)) * (block_size + spacing)));

               cur_move_index++;
          }

          timer--;
     }

     for (let i = 0; i < 15; i++){
          blocks[i].move();
          blocks[i].draw();
     }

     b_solve.draw();
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

     b_solve.check_pressed();
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

function heuristic(grid){
     let score = 0;

     for (let i = 0; i < 15; i++){
          let grid_pos = 0;

          for (let j = 0; j < 16; j++){
               if (grid[j] == i){
                    grid_pos = j;
                    break;
               }
          }

          let dx = Math.abs((i % 4) - (grid_pos % 4));
          let dy = Math.abs(Math.floor(i / 4) - Math.floor(grid_pos / 4));

          score += dx + dy;
     }

     return score;
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
          text(this.num + 1, this.pos.x, this.pos.y);
     }

     move(){
          let dist = p5.Vector.sub(this.target, this.pos);
          dist = p5.Vector.mult(dist, anim_decay_rate);

          this.pos = p5.Vector.add(this.pos, dist);
     }
}
class Button{
     constructor(txt, pos, color, dim){
          this.txt = txt;
          this.pos = pos;
          this.color = color;
          this.dim = dim;
     }

     draw(){
          noStroke();
          fill(this.color);
          rect(this.pos.x - Math.floor(this.dim.x / 2), this.pos.y - Math.floor(this.dim.y / 2), this.dim.x, this.dim.y, 5);

          fill(0);
          stroke(this.color);
          textAlign(CENTER);
          text(this.txt, this.pos.x, this.pos.y + 3);
     }

     check_pressed(){
          if (mouseX > this.pos.x - Math.floor(this.dim.x / 2) && mouseX < this.pos.x + Math.floor(this.dim.x / 2)){
               if (mouseY > this.pos.y - Math.floor(this.dim.y / 2) && mouseY < this.pos.y + Math.floor(this.dim.y / 2)){
                    path = solve();
                    console.log(path);
               }
          }
     }
}

function solve(){
     // Get grid setup as 16 element array
     let grid = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1];
     let goal = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, -1];

     for (let i = 0; i < 15; i++){
          grid[blocks[i].grid_pos] = blocks[i].num;
     }

     let visited = [];
     let paths = [[heuristic(grid), grid]];
     let optimal_path;

     alert('Solving, Please Wait...');

     //BFS For Path
     while (true){
          let next = next_path(paths);
          if (at_goal(next)){
               optimal_path = next;
               break;
          }

          let moves = next_moves(next[next.length - 1]);
          for (let i = 0; i < moves.length; i++){
               if (!visited_state(visited, moves[i])){
                    visited.push(moves[i]);

                    let new_path = next.slice();
                    new_path.push(moves[i]);
                    new_path[0] += heuristic(moves[i]);

                    paths.push(new_path);
               }
          }
     }

     let path = [];
     for (let i = 1; i < optimal_path.length - 1; i++){
          let empty_pos = 0;
          for (let j = 0; j < 16; j++){
               if (optimal_path[i][j] == -1){
                    empty_pos = j;
                    break;
               }
          }

          path.push(optimal_path[i + 1][empty_pos]);
     }

     alert('Solved!');

     return path;
}
function next_path(paths){
     let min = 100000000000000;
     let min_index = 0;

     for (let i = 0; i < paths.length; i++){
          if (paths[i][0] < min){
               min = paths[i][0];
               min_index = i;
          }
     }

     return paths.splice(min_index, 1)[0];
}
function next_moves(cur){
     let moves = [];
     let move_indicies = [];

     let empty = 0;
     for (let i = 0; i < 16; i++){
          if (cur[i] == -1){
               empty = i;
               break;
          }
     }

     if (empty - 4 >= 0)
          move_indicies.push(empty - 4);
     if (empty + 4 <= 15)
          move_indicies.push(empty + 4);
     if (empty % 4 != 0)
          move_indicies.push(empty - 1);
     if ((empty % 4) - 3 != 0)
          move_indicies.push(empty + 1);

     for (let i = 0; i < move_indicies.length; i++){
          let temp = cur.slice();
          temp[empty] = cur[move_indicies[i]];
          temp[move_indicies[i]] = -1;

          moves.push(temp);
     }

     return moves;
}
function at_goal(path){
     let goal = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, -1];
     let last_step = path[path.length - 1];

     for (let i = 0; i < 16; i++){
          if (last_step[i] != goal[i])
               return false;
     }

     return true;
}
function visited_state(visited, state){
     for (let i = 0; i < visited.length; i++){
          let cur = visited[i];
          let same = true;

          for (let j = 0; j < 16; j++){
               if (cur[j] != state[j]){
                    same = false;
                    break;
               }
          }

          if (same == true)
               return true;
     }

     return false;
}
