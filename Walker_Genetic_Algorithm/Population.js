/* Vars
 * p - Population Max
 * m - Mutation Rate
 * s - Starting Vector
 * e - Ending Vector
 * g - Generation Count
 * p - Perfect Score
 */

function Population(p, m, s, e){
     this.population = [];
     this.matingPool = [];
     this.g = 0;
     this.e = e;
     this.s = s;
     this.m = m;
     this.p = p;
     this.max = 0;
     this.species = [];

     for(var i = 0; i < p; i++){
          this.population[i] = new Agent(s, e);
          this.population[i].generateMovementPattern();
     }

     this.calcFitness = function(){
          for(var i = 0; i < this.population.length; i++)
               this.population[i].calcFitness();
     }

     this.calculateSpecies = function(){
          this.species = [];

          for(var i = 0; i < 4; i++){
               var sum = 0;
               for(var j = 0; j < this.population.length; j++){
                    if(this.population[j].maxDirProb == i)
                         sum++;
               }

               this.species.push(sum);
          }
     }

     this.naturalSelection = function(){
          //Clear Mating Pool
          this.matingPool = [];
          this.calcFitness();

          //Calculate Max Fitness For Mapping
          var maxFitness = 0;
          for(var i = 0; i < this.population.length; i++){
               if(this.population[i].fitness > maxFitness)
                    maxFitness = this.population[i].fitness;
          }
          this.max = maxFitness;

          for(var i = 0; i < this.population.length; i++){
               var fitness = map(this.population[i].fitness, 0, maxFitness, 0, 1);
               var n = floor(fitness * 100);
               for(var j = 0; j < n; j++){
                    this.matingPool.push(this.population[i]);
                    //console.log(this.population[i]);
               }
          }
     }

     this.mate = function(){
          for(var i = 0; i < this.population.length; i++){
               var a = floor(random(this.matingPool.length));
               var b = floor(random(this.matingPool.length));

               //alert(a + " " + b + " length: " + this.matingPool.length);
               //console.log(this.population);

               var partnerA = this.matingPool[a];
               var partnerB = this.matingPool[b];

               var child = partnerA.crossOver(partnerA);

               child.mutate(this.mutationRate);
               this.population[i] = child;
          }

          this.g++;
     }
}
