var layers_data;
var test_data_images;
var test_data_labels;
var nn;

var anim_state = 0;

var image_loaded = false;
var anim_decay_rate = 0.075;
var image_pixels = [];
var node_layers = [];
var set;
var timer = 0;
var cur_image = 0;

var node_lines = [];
var current_node = 0;
var layer1_line_values;
var layer2_line_values;
var layer3_line_values;

function preload(){
     layers_data = loadStrings('mnist_tanh_90.txt');
     test_data_images = loadBytes('t10k-images.idx3-ubyte');
     test_data_labels = loadBytes('t10k-labels.idx1-ubyte');
}
function setup() {
     createCanvas(windowWidth, windowHeight);

     nn = new NeuralNetBase(new JSVector([784, 16, 16, 10]));
     nn.m_f = NeuralNetBase.tanh;
     nn.m_f_prime = NeuralNetBase.tanh_prime;

     nn.load(layers_data);
     set = test_set(10000, 1);

     let image_top = Math.floor((windowHeight - 672) / 2);
     let image_top_transformed = Math.floor((windowHeight - 728) / 2);

     for (let y = 0; y < 28; y++){
          for (let x = 0; x < 28; x++){
               let pix = new Pixel(0, createVector(112 + (x * 24), image_top + 12 + (y * 24)));
               pix.pos2 = createVector(112 + (x * 26) - 27, image_top_transformed + 12 + (y * 26));

               pix.target = pix.pos2;

               image_pixels.push(pix);
          }
     }

     for (let i = 0; i < 2; i++){
          let layer = [];

          for (let j = 0; j < 16; j++){
               layer.push(new Node('', createVector(1000 + (i * 200), Math.floor((windowHeight - 635) / 2) + 18 + (j * 40))));
          }

          node_layers.push(layer);
     }

     let layer = [];
     for (let i = 0; i < 10; i++){
          layer.push(new Node('', createVector(1400, Math.floor((windowHeight - 395) / 2) + 18 + (i * 40))));
     }
     node_layers.push(layer);
}
function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
}
function test_set(batches, batch_size){
     let image_pointer = 16;
     let label_pointer = 8;

     let set = [];

     for (let i = 0; i < batches; i++){
          let in_cols = [];
          let out_cols = [];

          for (let j = 0; j < batch_size; j++){
               let pixels = new JSVector([]);
               let label = new JSVector([]);

               for (let k = 0; k < 784; k++){
                    pixels.m_vector.push((test_data_images.bytes[image_pointer] * (2.0 / 255)) - 1.0);
                    image_pointer++;
               }

               let label_val = test_data_labels.bytes[label_pointer];
               label_pointer++;

               for (let k = 0; k < 10; k++){
                    label.m_vector.push(0.0);
               }

               label.m_vector[label_val] = 1.0;

               in_cols.push(pixels);
               out_cols.push(label);
          }

          let in_mat = new JSMatrix(0, 0);
          let out_mat = new JSMatrix(0, 0);

          in_mat.set_columns(in_cols);
          out_mat.set_columns(out_cols);

          set.push(in_mat);
          set.push(out_mat);
     }

     return set;
}

function grab_image(index){
     image = set[index * 2];
     image_array = image.get(0).m_vector.slice();

     cur_image = index;

     for (let i = 0; i < 784; i++){
          image_array[i] = (image_array[i] + 1) * (255 / 2);
     }

     return image_array;
}

var c = 0;
function mousePressed(){
     image = grab_image(c);

     for (let i = 0; i < image_pixels.length; i++){
          image_pixels[i].set_value(Math.ceil(image[i]));
          image_pixels[i].target = image_pixels[i].pos2;
          image_pixels[i].pos = image_pixels[i].pos1;
     }

     image_loaded = true;

     c++;
     anim_state = 0;

     for (let i = 0; i < 3; i++){
          for (let j = 0; j < node_layers[i].length; j++){
               node_layers[i][j].value = '';
               node_layers[i][j].colour = 255;
          }
     }

     current_node = 0;

     node_lines = [];
}
function draw() {
     background(255);

     if (anim_state == 0){
          draw_image_box();
          draw_node_layers();

          if (image_loaded == true){
               anim_state = 1;
               timer = 60;
          }
     }
     else if (anim_state == 1){
          draw_pixels();

          draw_node_layers();

          if (timer <= 0){
               timer = 0;
               anim_state = 2;
          }

          timer--;
     }
     else if (anim_state == 2){
          move_pixels();
          draw_pixels();
          draw_pixels_value();

          draw_node_layers();

          let dist = image_pixels[0].pos.dist(image_pixels[0].target);
          if (dist < 0.1){
               anim_state = 3;

               let image_data = set[cur_image * 2].clone();
               image_data.get(0).m_vector.push(1);

               layer1_line_values = nn.m_layers[0].clone();
               for (let i = 0; i < layer1_line_values.dim()[1]; i++){
                    layer1_line_values.set(i, layer1_line_values.get(i).mul(image_data.get(0).get(i)));
               }

               let min = 0;
               let max = 0;
               for (let i = 0; i < layer1_line_values.dim()[1]; i++){
                    for (let j = 0; j < layer1_line_values.dim()[0]; j++){
                         if (layer1_line_values.get(i).get(j) > max)
                              max = layer1_line_values.get(i).get(j);
                         if (layer1_line_values.get(i).get(j) < min)
                              min = layer1_line_values.get(i).get(j);
                    }
               }

               let image_top_transformed = Math.floor((windowHeight - 728) / 2);
               for (let y = 0; y < 28; y++){
                    for (let x = 0; x < 28; x++){
                         let node_line = new Line(createVector(112 + (x * 26) - 27, image_top_transformed + 12 + (y * 26)), createVector(1000, Math.floor((windowHeight - 635) / 2) + 18 + (current_node * 40)), 100);
                         if (layer1_line_values.get(x + (y * 28)).get(current_node) < 0)
                              node_line.value = color((layer1_line_values.get(x + (y * 28)).get(current_node) / min) * 255, 0, 0);
                         else node_line.value = color(0, (layer1_line_values.get(x + (y* 28)).get(current_node) / max) * 255, 0);
                         node_lines.push(node_line);
                    }
               }
          }
     }
     else if (anim_state == 3){
          draw_pixels();
          draw_pixels_value();
          draw_node_layers();
          draw_node_values();

          draw_and_move_node_lines();

          if (lines_at_end()){
               let row_sum = 0;
               for (let i = 0; i < layer1_line_values.dim()[1]; i++){
                    row_sum += layer1_line_values.get(i).get(current_node);
               }

               node_layers[0][current_node].value = round(row_sum * 100) / 100;

               current_node++;

               if(current_node != 16){
                    let min = 0;
                    let max = 0;
                    for (let i = 0; i < layer1_line_values.dim()[1]; i++){
                         for (let j = 0; j < layer1_line_values.dim()[0]; j++){
                              if (layer1_line_values.get(i).get(j) > max)
                                   max = layer1_line_values.get(i).get(j);
                              if (layer1_line_values.get(i).get(j) < min)
                                   min = layer1_line_values.get(i).get(j);
                         }
                    }

                    node_lines = [];
                    let image_top_transformed = Math.floor((windowHeight - 728) / 2);
                    for (let y = 0; y < 28; y++){
                         for (let x = 0; x < 28; x++){
                              let node_line = new Line(createVector(112 + (x * 26) - 27, image_top_transformed + 12 + (y * 26)), createVector(1000, Math.floor((windowHeight - 635) / 2) + 18 + (current_node * 40)), 100);
                              if (layer1_line_values.get(x + (y * 28)).get(current_node) < 0)
                                   node_line.value = color((layer1_line_values.get(x + (y * 28)).get(current_node) / min) * 255, 0, 0);
                              else node_line.value = color(0, (layer1_line_values.get(x + (y * 28)).get(current_node) / max) * 255, 0);
                              node_lines.push(node_line);
                         }
                    }
               }
               else {
                    anim_state = 4;

                    for (let i = 0; i < image_pixels.length; i++){
                         image_pixels[i].target = image_pixels[i].pos1;
                         image_pixels[i].target_colour = image_pixels[i].value;
                    }

                    timer = 120;
               }
          }
     }
     else if (anim_state == 4) {
          draw_pixels();
          draw_pixels_value();
          draw_node_layers();
          draw_node_values();
          move_pixels();

          if (timer <= 0){
               anim_state = 5;

               let values = nn.feed_forward(set[cur_image * 2]);
               let layer_values = values[1].map(NeuralNetBase.tanh).get(0);

               for (let i = 0; i < node_layers[0].length; i++){
                    node_layers[0][i].value = floor(layer_values.get(i) * 100) / 100;
                    node_layers[0][i].colour = color(107, 156, 234);
               }

               timer = 60;
          }

          timer--;
     }
     else if (anim_state == 5){
          draw_pixels();
          draw_node_layers();
          draw_node_values();

          if (timer <= 0){
               anim_state = 6;
               timer = 0;

               current_node = 0;
               node_lines = [];

               let in_data = nn.feed_forward(set[cur_image * 2])[1];
               in_data = in_data.map(NeuralNetBase.tanh);
               in_data.get(0).m_vector.push(1);

               layer2_line_values = nn.m_layers[1].clone();
               for (let i = 0; i < layer2_line_values.dim()[1]; i++){
                    layer2_line_values.set(i, layer2_line_values.get(i).mul(in_data.get(0).get(i)));
               }

               let min = 0;
               let max = 0;
               for (let i = 0; i < layer2_line_values.dim()[1]; i++){
                    for (let j = 0; j < layer2_line_values.dim()[0]; j++){
                         if (layer2_line_values.get(i).get(j) > max)
                              max = layer2_line_values.get(i).get(j);
                         if (layer2_line_values.get(i).get(j) < min)
                              min = layer2_line_values.get(i).get(j);
                    }
               }

               for (let y = 0; y < 16; y++){
                    let node_line = new Line(createVector(1000, Math.floor((windowHeight - 635) / 2) + 18 + (40 * y)), createVector(1200, Math.floor((windowHeight - 635) / 2) + 18 + (current_node * 40)), 100);
                    if (layer2_line_values.get(y).get(current_node) < 0)
                         node_line.value = color((layer2_line_values.get(y).get(current_node) / min) * 255, 0, 0);
                    else node_line.value = color(0, (layer2_line_values.get(y).get(current_node) / max) * 255, 0);
                    node_lines.push(node_line);
               }
          }

          timer--;
     }
     else if (anim_state == 6){
          draw_pixels();
          draw_node_layers();
          draw_node_values();

          draw_and_move_node_lines();

          if (lines_at_end()){
               let row_sum = 0;
               for (let i = 0; i < layer2_line_values.dim()[1]; i++){
                    row_sum += layer2_line_values.get(i).get(current_node);
               }

               node_layers[1][current_node].value = round(row_sum * 100) / 100;

               current_node++;

               if(current_node != 16){
                    let min = 0;
                    let max = 0;
                    for (let i = 0; i < layer2_line_values.dim()[1]; i++){
                         for (let j = 0; j < layer2_line_values.dim()[0]; j++){
                              if (layer2_line_values.get(i).get(j) > max)
                                   max = layer2_line_values.get(i).get(j);
                              if (layer2_line_values.get(i).get(j) < min)
                                   min = layer2_line_values.get(i).get(j);
                         }
                    }

                    node_lines = [];
                    for (let y = 0; y < 16; y++){
                         let node_line = new Line(createVector(1000, Math.floor((windowHeight - 635) / 2) + 18 + (40 * y)), createVector(1200, Math.floor((windowHeight - 635) / 2) + 18 + (current_node * 40)), 100);
                         if (layer2_line_values.get(y).get(current_node) < 0)
                              node_line.value = color((layer2_line_values.get(y).get(current_node) / min) * 255, 0, 0);
                         else node_line.value = color(0, (layer2_line_values.get(y).get(current_node) / max) * 255, 0);
                         node_lines.push(node_line);
                    }
               }
               else {
                    anim_state = 7;
                    timer = 120;
               }
          }
     }
     else if (anim_state == 7) {
          draw_pixels();
          draw_node_layers();
          draw_node_values();

          if (timer <= 0){
               anim_state = 8;

               let values = nn.feed_forward(set[cur_image * 2]);
               let layer_values = values[2].map(NeuralNetBase.tanh).get(0);

               for (let i = 0; i < node_layers[1].length; i++){
                    node_layers[1][i].value = floor(layer_values.get(i) * 100) / 100;
                    node_layers[1][i].colour = color(107, 156, 234);
               }

               timer = 60;
          }

          timer--;
     }
     else if (anim_state == 8){
          draw_pixels();
          draw_node_layers();
          draw_node_values();

          if (timer <= 0){
               anim_state = 9;
               timer = 0;

               current_node = 0;
               node_lines = [];

               let in_data = nn.feed_forward(set[cur_image * 2])[2];
               in_data = in_data.map(NeuralNetBase.tanh);
               in_data.get(0).m_vector.push(1);

               layer3_line_values = nn.m_layers[2].clone();
               for (let i = 0; i < layer3_line_values.dim()[1]; i++){
                    layer3_line_values.set(i, layer3_line_values.get(i).mul(in_data.get(0).get(i)));
               }

               let min = 0;
               let max = 0;
               for (let i = 0; i < layer3_line_values.dim()[1]; i++){
                    for (let j = 0; j < layer3_line_values.dim()[0]; j++){
                         if (layer3_line_values.get(i).get(j) > max)
                              max = layer3_line_values.get(i).get(j);
                         if (layer3_line_values.get(i).get(j) < min)
                              min = layer3_line_values.get(i).get(j);
                    }
               }

               for (let y = 0; y < 16; y++){
                    let node_line = new Line(createVector(1200, Math.floor((windowHeight - 635) / 2) + 18 + (40 * y)), createVector(1400, Math.floor((windowHeight - 395) / 2) + 18 + (current_node * 40)), 100);
                    if (layer3_line_values.get(y).get(current_node) < 0)
                         node_line.value = color((layer3_line_values.get(y).get(current_node) / min) * 255, 0, 0);
                    else node_line.value = color(0, (layer3_line_values.get(y).get(current_node) / max) * 255, 0);
                    node_lines.push(node_line);
               }
          }

          timer--;
     }
     else if (anim_state == 9){
          draw_pixels();
          draw_node_layers();
          draw_node_values();

          draw_and_move_node_lines();

          if (lines_at_end()){
               let row_sum = 0;
               for (let i = 0; i < layer3_line_values.dim()[1]; i++){
                    row_sum += layer3_line_values.get(i).get(current_node);
               }

               node_layers[2][current_node].value = round(row_sum * 100) / 100;

               current_node++;

               if(current_node != 10){
                    let min = 0;
                    let max = 0;
                    for (let i = 0; i < layer3_line_values.dim()[1]; i++){
                         for (let j = 0; j < layer3_line_values.dim()[0]; j++){
                              if (layer3_line_values.get(i).get(j) > max)
                                   max = layer3_line_values.get(i).get(j);
                              if (layer3_line_values.get(i).get(j) < min)
                                   min = layer3_line_values.get(i).get(j);
                         }
                    }

                    node_lines = [];
                    for (let y = 0; y < 16; y++){
                         let node_line = new Line(createVector(1200, Math.floor((windowHeight - 635) / 2) + 18 + (40 * y)), createVector(1400, Math.floor((windowHeight - 395) / 2) + 18 + (current_node * 40)), 100);
                         if (layer3_line_values.get(y).get(current_node) < 0)
                              node_line.value = color((layer3_line_values.get(y).get(current_node) / min) * 255, 0, 0);
                         else node_line.value = color(0, (layer3_line_values.get(y).get(current_node) / max) * 255, 0);
                         node_lines.push(node_line);
                    }
               }
               else {
                    anim_state = 10;
                    timer = 120;
               }
          }
     }
     else if(anim_state == 10){
          draw_pixels();
          draw_node_layers();
          draw_node_values();

          if (timer <= 0){
               anim_state = 11;

               let values = nn.feed_forward(set[cur_image * 2]);
               let layer_values = values[3].map(NeuralNetBase.tanh).get(0);

               for (let i = 0; i < node_layers[2].length; i++){
                    node_layers[2][i].value = floor(layer_values.get(i) * 100) / 100;
                    node_layers[2][i].colour = color(107, 156, 234);
               }

               timer = 60;
          }

          timer--;
     }
     else if (anim_state == 11){
          draw_pixels();
          draw_node_layers();
          draw_node_values();

          if (timer <= 0){
               anim_state = 12;

               let label = 0;
               for (let i = 0; i < 10; i++){
                    if (set[(cur_image * 2) + 1].get(0).get(i) == 1){
                         label = i;
                         break;
                    }
               }

               let output = nn.feed_forward(set[cur_image * 2])[3];
               output = output.map(NeuralNetBase.tanh).get(0).m_vector;

               let max = -2;
               let guess = 0;
               for (let i = 0; i < 10; i++){
                    if (output[i] > max){
                         guess = i;
                         max = output[i];
                    }
               }

               let evaluation;
               if (label != guess)
                    evaluation = color(237, 23, 23);
               else evaluation = color(1, 186, 32);

               node_layers[2][guess].colour = evaluation;

               timer = 60;
          }

          timer--;
     }
     else if (anim_state == 12){
          draw_pixels();
          draw_node_layers();
          draw_node_values();

          if (timer <= 0){
               anim_state = 13;

               for (let i = 0; i < 10; i++){
                    node_layers[2][i].value = i;
               }
          }

          timer--;
     }
     else if (anim_state == 13){
          draw_pixels();
          draw_node_layers();
          draw_node_values();
     }
}
function draw_image_box(){
     let height_offset = Math.floor((windowHeight - 672) / 2);

     stroke(0);
     fill(255);
     rect(100, height_offset, 672, 672);
}
function draw_layer_circles(){

}
function draw_pixels(){
     for(let i = 0; i < image_pixels.length; i++){
          image_pixels[i].draw();
     }
}
function move_pixels(){
     for(let i = 0; i < image_pixels.length; i++){
          image_pixels[i].move();
     }
}
function draw_pixels_value(){
     for(let i = 0; i < image_pixels.length; i++){
          image_pixels[i].draw_value();
     }
}
function draw_node_layers(){
     for (let n = 0; n < node_layers.length; n++){
          for (let i = 0; i < node_layers[n].length; i++){
               node_layers[n][i].draw();
          }
     }
}
function draw_node_values(){
     for (let i = 0; i < node_layers.length; i++){
          for (let j = 0; j < node_layers[i].length; j++){
               node_layers[i][j].draw_value();
          }
     }
}
function draw_and_move_node_lines(){
     for (let i = 0; i < node_lines.length; i++){
          node_lines[i].move();
          node_lines[i].draw();
     }
}
function lines_at_end(){
     for (let i = 0; i < node_lines.length; i++){
          if (node_lines[i].tail.dist(node_lines[i].end) > 12)
               return false;
     }

     return true;
}

class Pixel{
     constructor(value, pos){
          this.value = value;
          this.pos = pos;
          this.target = null;

          this.pos1 = this.pos;
          this.pos2 = null;

          this.cur_colour = value;

          if (this.value < 127)
               this.target_colour = 255;
          else this.target_colour = 0;
     }

     set_value(value){
          this.value = value;
          this.cur_colour = value;

          if (this.value < 127)
               this.target_colour = 255;
          else this.target_colour = 0;
     }
     move(){
          let dist = p5.Vector.sub(this.target, this.pos);
          dist = p5.Vector.mult(dist, anim_decay_rate);

          this.pos = p5.Vector.add(this.pos, dist);

          let colour_dist = this.target_colour - this.cur_colour;
          colour_dist *= anim_decay_rate;
          this.cur_colour += colour_dist;
     }
     draw(){
          noStroke();
          fill(this.value);
          rect(this.pos.x - 12, this.pos.y - 12, 24, 24);
     }
     draw_value(){
          fill(this.cur_colour);
          noStroke();
          textAlign(CENTER);

          text(this.value, this.pos.x, this.pos.y + 4);
     }
}
class Node{
     constructor(value, pos){
          this.pos = pos;
          this.value = value;
          this.colour = 255;
     }

     draw(){
          stroke(0);
          fill(this.colour);
          ellipse(this.pos.x, this.pos.y, 35, 35);
     }
     draw_value(){
          fill(0);
          textAlign(CENTER);

          text(this.value, this.pos.x, this.pos.y + 4);
     }
}
class Line{
     constructor(start, end, max_length){
          this.start = start;
          this.tip = start;
          this.end = end;
          this.tail = start;
          this.max_length = max_length;
          this.length = 0;
          this.speed = 0.03;
          this.reached_end = false;
          this.value = 0;
     }

     move(){
          if (this.tail.equals(this.start) && this.length < this.max_length && !this.reached_end){
               let dir = p5.Vector.sub(this.end, this.start);
               dir = p5.Vector.mult(dir, this.speed);

               this.tip = p5.Vector.add(this.tip, dir);
               this.length = this.tip.dist(this.tail);
          }
          else if (this.length > this.max_length && this.tip.dist(this.end) > 12 && !this.reached_end){
               let dir = p5.Vector.sub(this.end, this.start);
               dir = p5.Vector.mult(dir, this.speed);

               this.tip = p5.Vector.add(this.tip, dir);
               this.tail = p5.Vector.add(this.tail, dir);

               this.length = this.tip.dist(this.tail);
          }
          else if(this.tail.dist(this.end) > 12) {
               let dir = p5.Vector.sub(this.end, this.start);
               dir = p5.Vector.mult(dir, this.speed);

               this.tail = p5.Vector.add(this.tail, dir);

               this.length = this.tip.dist(this.tail);

               this.reached_end = true;
          }
     }

     draw(){
          fill(this.value);
          stroke(this.value);
          line(this.tail.x, this.tail.y, this.tip.x, this.tip.y);
     }
}
