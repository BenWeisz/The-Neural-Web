var nodes = [];
var positions = [[1170,734],[189,583],[673,873],[885,642],[601,536],[1709,801],[811,409],[1472,391],[455,752],[1382,213],[271,116],[417,646],[1351,669],[196,245],[170,361],[419,856],[1611,679],[1171,90],[1083,875],[525,385]];
var names = ['Bucharest', 'Timisoara', 'Craiova', 'Pitesti', 'Rimniciu Vilcea', 'Eforie', 'Fagaras', 'Vaslui', 'Mehadia', 'Iasi', 'Oradea', 'Lugoj', 'Urziceni', 'Zerind', 'Arad', 'Drobeta', 'Hirsova', 'Neamt', 'Giurgiu', 'Sibiu'];
var conns = [[6, 3, 18, 12], [14, 11], [3, 4, 15], [0, 4, 3], [2, 3, 19], [16], [19, 0], [12, 9], [15, 11], [17], [19, 13], [1, 8], [0, 7, 16], [14, 10], [19, 1, 13], [2, 8], [12, 5], [9], [0], [6, 4, 10, 14]];
var conns_cost = [[87, 9, 17], [92, 9, 7], [142, 7, 12], [98, 12, 16], [86, 16, 5], [85, 12, 0], [90, 0, 18], [101, 0, 3], [211, 0, 6], [99, 6, 19], [151, 19, 10], [71, 10, 13], [75, 13, 14], [140, 14, 19], [118, 14, 1], [111, 1, 11], [70, 11, 8], [75, 8, 15], [120, 15, 2], [138, 2, 3], [146, 2, 4], [97, 3, 4], [80, 4, 19]];
var img;

var weights = [71, 75, 151, 140, 118, 111, 99, 80, 70, 75, 120, 146, 97, 138, 211, 101, 90, 85, 98, 86, 142, 92, 87];
var weights_pos = [[240, 190], [190, 310], [406, 250], [345, 365], [185, 470], [305, 605], [665, 390], [570, 460], [445, 705], [445, 810], [545, 858], [645, 710],
                   [730, 610], [795, 760], [1000, 575], [1020, 680], [1140, 810], [1260, 720], [1480, 667], [1640, 750], [1425, 528], [1435, 310], [1294, 157]];

var start = 2, end = 17;
var path_finding = true;
var paths = [[0, start]];
var visited = [];
var choosing = 0;

function setup() {
     createCanvas(windowWidth, windowHeight);

     var names_pos = [createVector(35, 30), createVector(30, 0), createVector(-10, 40), createVector(-5, -5), createVector(20, -5),
                      createVector(-2, 40), createVector(-7, -7), createVector(32, 17), createVector(32, 17), createVector(32, 17),
                      createVector(32, 17), createVector(32, 17), createVector(-7, 40), createVector(32, 17), createVector(-32, 17),
                      createVector(-7, 40), createVector(-5, -5), createVector(-5, -5), createVector(32, 17), createVector(10, -10)];

     for (let i = 0; i < 20; i++){
          nodes.push(new Node(createVector(positions[i][0], positions[i][1]), conns[i], names[i], names_pos[i]));
     }

     img = loadImage('romania.png');
     nodes[start].state = 1;
     nodes[end].state = 2;

     frameRate(1);
}
function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
}

function draw(){
     background(255);
     image(img, -140, -200, img.width * 1.5, img.height * 1.5);

     draw_weights();

     for (let i = 0; i < nodes.length; i++){
          nodes[i].draw_conns();
     }
     draw_paths();

     for (let i = 0; i < nodes.length; i++){
          nodes[i].draw();
     }

     //Path Finding Algorithm
     if (path_finding){
          let cur_path_root = next_path();
          if (cur_path_root[cur_path_root.length - 1] == end) {
               path_finding = false;
               paths = []
               paths.push(cur_path_root);
          }

          if (path_finding){
               for (let i = 0; i < conns[cur_path_root[cur_path_root.length - 1]].length; i++){
                    if (visited.indexOf(conns[cur_path_root[cur_path_root.length - 1]][i]) == -1){
                         visited.push(conns[cur_path_root[cur_path_root.length - 1]][i]);

                         let new_path = cur_path_root.slice();
                         new_path[0] += conn_cost(cur_path_root[cur_path_root.length - 1], conns[cur_path_root[cur_path_root.length - 1]][i]);
                         new_path.push(conns[cur_path_root[cur_path_root.length - 1]][i]);

                         paths.push(new_path);
                    }
               }
          }
     }
}
function mousePressed(){
     for (let i = 0; i < nodes.length; i++){
          if (mouseX > nodes[i].pos.x - 12 && mouseX < nodes[i].pos.x + 12){
               if (mouseY > nodes[i].pos.y - 12 && mouseY < nodes[i].pos.y + 12){
                    if ((nodes[i].state == 1 || nodes[i].state == 2) && choosing == 0){
                         choosing = nodes[i].state;
                         nodes[i].state = 0;
                         paths = [[0, start]]
                         path_finding = false;
                    }
                    else if (nodes[i].state == 0 && choosing != 0){
                         nodes[i].state = choosing;
                         choosing = 0;

                         if (nodes[i].state == 1)
                              start = names.indexOf(nodes[i].name);
                         else if (nodes[i].state == 2)
                              end = names.indexOf(nodes[i].name);

                         paths = [[0, start]];
                         path_finding = true;
                         visited = [];
                    }
               }
          }
     }
}

function draw_paths(){
     strokeWeight(3);

     for (let i = 0; i < paths.length; i++){
          stroke(40, 113, 239);
          fill(40, 113, 239);

          for (let j = 1; j < paths[i].length - 1; j++){
               line(positions[paths[i][j]][0], positions[paths[i][j]][1], positions[paths[i][j + 1]][0], positions[paths[i][j + 1]][1]);
          }

          if (path_finding){
               stroke(237, 233, 16);
               fill(237, 233, 16);
          }

          if(paths[i].length != 2)
               line(positions[paths[i][paths[i].length - 2]][0], positions[paths[i][paths[i].length - 2]][1], positions[paths[i][paths[i].length - 1]][0], positions[paths[i][paths[i].length - 1]][1]);
     }
}
function draw_weights(){
     fill(0);
     stroke(0);

     for (let i = 0; i < weights.length; i++){
          text(weights[i], weights_pos[i][0], weights_pos[i][1]);
     }
}
function conn_cost(node1, node2){
     for (let i = 0; i < conns_cost.length; i++){
          if ((conns_cost[i][1] == node1 && conns_cost[i][2] == node2) || (conns_cost[i][1] == node2 && conns_cost[i][2] == node1))
               return conns_cost[i][0];
     }
}
function next_path(){
     let min = 100000000000000000;
     let min_index = 0;

     for (let i = 0; i < paths.length; i++){
          if (paths[i][0] < min){
               min = paths[i][0];
               min_index = i;
          }
     }

     let next = paths.splice(min_index, 1)[0];
     return next;
}

class Node{
     constructor(pos, conns, name, name_pos){
          this.pos = pos;
          this.conns = conns;
          this.name = name;
          this.name_pos = name_pos;
          this.state = 0;
     }

     draw(){
          strokeWeight(1);

          stroke(0);
          if (this.state == 0)
               fill(255);
          else if(this.state == 1)
               fill(0, 255, 0);
          else if (this.state == 2)
               fill(255, 0, 0);

          rect(this.pos.x - 12, this.pos.y - 12, 25, 25);

          fill(0);
          stroke(255);
          text(this.name, this.pos.x - 12 + this.name_pos.x, this.pos.y - 12 + this.name_pos.y);
     }
     draw_conns(){
          strokeWeight(1);
          fill(0);
          stroke(0);

          for (let i = 0; i < this.conns.length; i++){
               line(this.pos.x, this.pos.y, positions[this.conns[i]][0], positions[this.conns[i]][1]);
          }
     }
}
