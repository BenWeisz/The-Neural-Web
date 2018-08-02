/* Vars
 * s - Starting Vector
 * e - Ending Vector
 */
 function Agent(s, e){
     this.pos = createVector(s.x, s.y);
     this.fitness;
     this.spd = 1;
     this.width = 1;

     this.movementPattern = [];
     this.maxDirProb = 0;
     this.genes = [];
     this.sum = 0.0;

     this.restart = false;

     //Generate Movement Porbability
     for(var i = 0; i < 4; i++){
          this.genes[i] = random(1);
          this.sum += this.genes[i];
     }

     //Map Probabilities On Domain 0.0 To 1.0
     for(var i = 0; i < 4; i++)
          this.genes[i] /= this.sum;

     this.generateMovementPattern = function(){
          var max = 0;
          for(var i = 0; i < 4; i++){
               if(this.genes[i] > max){
                    max = this.genes[i];
                    this.maxDirProb = i;
               }
          }

          for(var i = 0; i < 4; i++){
               var probability = map(this.genes[i], 0, max, 0, 1);
               var n = floor(probability * 100);
               for(var j = 0; j < n; j++)
                    this.movementPattern.push(i);
          }
     }

     this.update = function(){
          var dir = this.movementPattern[floor(random(this.movementPattern.length))];

          if(dir == 0)
               this.pos.add(createVector(0, -this.spd));
          else if(dir == 1)
               this.pos.add(createVector(this.spd, 0));
          else if(dir == 2)
               this.pos.add(createVector(0, this.spd));
          else if(dir == 3)
               this.pos.add(createVector(-this.spd, 0));

          if(this.pos.x < this.width)
               this.pos.x = this.width;
          else if(this.pos.x > width - this.width)
               this.pos.x = width - this.width;

          if(this.pos.y < this.width)
               this.pos.y = this.width;
          else if(this.pos.y > height - this.width)
               this.pos.y = height - this.width;

          if(this.pos.dist(e) < 5)
               this.restart = true;
     }

     this.show = function(){
          if(this.maxDirProb == 0)
               stroke(255, 0, 0);
          else if(this.maxDirProb == 1)
               stroke(0, 255, 0);
          else if(this.maxDirProb == 2)
               stroke(0, 0, 255);
          else if(this.maxDirProb == 3)
               stroke(148, 0, 211);

          point(this.pos.x, this.pos.y);
     }

     this.calcFitness = function(){
          this.fitness = 1 - (this.pos.dist(e) / e.dist(createVector(0, 0)));
     }

     this.crossOver = function(partner){
          var child = new Agent(s, e);

          for(var i = 0; i < 4; i++)
               child.genes[i] = (this.genes[i] + partner.genes[i]) / 2;

          return child;
     }

     this.mutate = function(rate){
          if(random(1) < rate){
               this.sum = 0.0;

               for(var i = 0; i < 4; i++){
                    this.genes[i] = random(1);
                    this.sum += this.genes[i];
               }

               for(var i = 0; i < 4; i++)
                    this.genes[i] /= this.sum;
          }

          this.generateMovementPattern();
     }
}
