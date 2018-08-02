var popmax = 500;
var mutationRate = 0.01;
var population;

var start;
var end;

var cycle = 0;
var generationLength = 900;

var stats_cycles;
var stats_best_fitness;
var stats_gen;
var stats_red, stats_green, stats_blue, stats_purple;

function setup() {
     var cnv = createCanvas(734, 550);
     cnv.parent("sketch");

     var header = createP("Walker AI");
     header.parent("head");

     stats_gen = createP("Generation: ");
     stats_gen.parent("stats");
     stats_gen.position(80, 130);

     stats_cycles = createP("Cycles: ");
     stats_cycles.parent("stats");
     stats_cycles.position(80, 200);

     stats_best_fitness = createP("Best Fitness: ");
     stats_best_fitness.position(80, 270);
     stats_best_fitness.parent("stats");

     stats_red = createP("Red Species: ");
     stats_red.position(80, 340);
     stats_red.parent("stats");

     stats_green = createP("Green Species: ");
     stats_green.position(80, 410);
     stats_green.parent("stats");

     stats_blue = createP("Blue Species: ");
     stats_blue.position(80, 480);
     stats_blue.parent("stats");

     stats_purple = createP("Purple Species: ");
     stats_purple.position(80, 550);
     stats_purple.parent("stats");

     //Starting and Ending Positions for Agents
     start = createVector(100, 100);
     end = createVector(width - 100, height - 100);

     population = new Population(popmax, mutationRate, start, end);

     background(245, 245, 245);
     noStroke();
}

function draw() {
     background(245, 245, 245);

     //Starting and Ending Points
     fill(200, 100, 100);
     ellipse(start.x, start.y, 10, 10);
     fill(100, 200, 100);
     ellipse(end.x, end.y, 10, 10);

     if(cycle >= generationLength){
          population.naturalSelection();
          population.mate();
          cycle = 0;
     }

     strokeWeight(2);
     for(var i = 0; i < population.population.length; i++){
          population.population[i].update();
          population.population[i].show();

          if(population.population[i].restart)
               cycle = generationLength;
     }
     noStroke();

     stats_cycles.html("Cycles: " + cycle);
     stats_best_fitness.html("Best Fitness: " + (floor(population.max * 10000.0) / 100.0) + "%");
     stats_gen.html("Generation: " + population.g);

     population.calculateSpecies();
     stats_red.html("Red Species: " + population.species[0]);
     stats_green.html("Green Species: " + population.species[1]);
     stats_blue.html("Blue Species: " + population.species[2]);
     stats_purple.html("Purple Species: " + population.species[3]);

     cycle++;
}
