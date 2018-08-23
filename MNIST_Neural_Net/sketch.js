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
               layer.push(new Node(0, createVector(1000 + (i * 200), Math.floor((windowHeight - 635) / 2) + 18 + (j * 40))));
          }

          node_layers.push(layer);
     }

     let layer = [];
     for (let i = 0; i < 10; i++){
          layer.push(new Node(0, createVector(1400, Math.floor((windowHeight - 395) / 2) + 18 + (i * 40))));
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

function mousePressed(){
     image = grab_image(0);

     for (let i = 0; i < image_pixels.length; i++){
          image_pixels[i].set_value(Math.ceil(image[i]));
     }

     image_loaded = true;
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

               let image_data = set[cur_image * 2];
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
                         if (layer1_line_values.get(x).get(y) < 0)
                              node_line.value = color((layer1_line_values.get(x).get(y) / min) * 255, 0, 0);
                         else node_line.value = color(0, (layer1_line_values.get(x).get(y) / max) * 255, 0);
                         node_lines.push(node_line);
                    }
               }
          }
     }
     else if (anim_state == 3){
          draw_pixels();
          draw_pixels_value();
          draw_node_layers();

          draw_and_move_node_lines();

          if (lines_at_end()){
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
                              if (layer1_line_values.get(x).get(y) < 0)
                                   node_line.value = color((layer1_line_values.get(x).get(y) / min) * 255, 0, 0);
                              else node_line.value = color(0, (layer1_line_values.get(x).get(y) / max) * 255, 0);
                              node_lines.push(node_line);
                         }
                    }
               }
               else {
                    anim_state = 4;
               }
          }
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
function draw_node_value(n){
     for (let i = 0; i < node_layers[n].length; i++){
          node_layers[n][i].draw_value();
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
          if (node_lines[i].tail.dist(node_lines[i].end) > 1)
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
     }

     draw(){
          stroke(0);
          fill(255);
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
          this.speed = 0.01;
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
          else if (this.length > this.max_length && this.tip.dist(this.end) > 1 && !this.reached_end){
               let dir = p5.Vector.sub(this.end, this.start);
               dir = p5.Vector.mult(dir, this.speed);

               this.tip = p5.Vector.add(this.tip, dir);
               this.tail = p5.Vector.add(this.tail, dir);

               this.length = this.tip.dist(this.tail);
          }
          else if(this.tail.dist(this.end) > 1) {
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
