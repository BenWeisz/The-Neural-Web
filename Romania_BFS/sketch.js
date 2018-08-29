var nodes = [];
var positions = [[1170,734],[189,583],[673,873],[885,642],[601,536],[1709,801],[811,409],[1472,391],[455,752],[1382,213],[271,116],[417,646],[1351,669],[196,245],[170,361],[419,856],[1611,679],[1171,90],[1083,875],[525,385]];
var names = ['Bucharest', 'Timisoara', 'Craiova', 'Pitesti', 'Rimniciu Vilcea', 'Eforie', 'Fagaras', 'Vaslui', 'Mehadia', 'Iasi', 'Oradea', 'Lugoj', 'Urziceni', 'Zerind', 'Arad', 'Drobeta', 'Hirsova', 'Neamt', 'Giurgiu', 'Sibiu'];
var conns = [[6, 3, 18, 12], [14, 11], [3, 4, 15], [0, 4, 3], [2, 3, 19], [16], [19, 0], [12, 9], [15, 11], [17], [19, 13], [1, 8], [0, 7, 16], [14, 10], [19, 1, 13], [2, 8], [12, 5], [9], [0], [6, 4, 10, 14]];
var path = [[0, 3], [3, 4], [4, 19]];

function setup() {
     createCanvas(windowWidth, windowHeight);

     var names_pos = [createVector(35, 30), createVector(30, 0), createVector(-10, 40), createVector(-5, -5), createVector(20, -5),
                      createVector(-2, 40), createVector(-7, -7), createVector(32, 17), createVector(32, 17), createVector(32, 17),
                      createVector(32, 17), createVector(32, 17), createVector(-7, 40), createVector(32, 17), createVector(-32, 17),
                      createVector(-7, 40), createVector(-5, -5), createVector(-5, -5), createVector(32, 17), createVector(10, -10)];

     for (let i = 0; i < 20; i++){
          nodes.push(new Node(createVector(positions[i][0], positions[i][1]), conns[i], names[i], names_pos[i]));
     }
}
function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
}

function draw(){
     background(255);

     draw_path();

     for (let i = 0; i < nodes.length; i++){
          nodes[i].draw_conns();
     }
     for (let i = 0; i < nodes.length; i++){
          nodes[i].draw();
     }
}
function draw_path(){
     strokeWeight(3);
     stroke(0);
     fill(0);

     for (let i = 0; i < path.length; i++)
          line(positions[path[i][0]][0], positions[path[i][0]][1], positions[path[i][1]][0], positions[path[i][1]][1]);
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
