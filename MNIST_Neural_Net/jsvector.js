class JSVector {
     constructor(vector){
          if (vector.constructor.name == 'Array'){
               this.m_vector = vector;
          } else {
               alert('The Argument Passed Was Not An Array!');
          }
     }

     get(i){
          return this.m_vector[i];
     }
     set(i, v){
          this.m_vector[i] = v;
     }
     dim(){
          return this.m_vector.length;
     }
     clone(){
          return new JSVector(this.m_vector.slice(0));
     }
     add(other){
          if (other.constructor.name == 'JSVector'){
               if (this.dim() == other.dim()){
                    let t = this.clone();

                    for(let i = 0; i < t.dim(); i++){
                         t.set(i, t.get(i) + other.get(i));
                    }

                    return t;
               }
               else {
                    alert('The Argument JSVector Is Of The Wrong Size!');
               }
          }
          else {
               alert('The Argument Passed Was Not A JSVector!');
          }
     }
     sub(other){
          if (other.constructor.name == 'JSVector'){
               if (this.dim() == other.dim()){
                    let t = this.clone();

                    for(let i = 0; i < t.dim(); i++){
                         t.set(i, t.get(i) - other.get(i));
                    }

                    return t;
               }
               else {
                    alert('The Argument JSVector Is Of The Wrong Size!');
               }
          }
          else {
               alert('The Argument Passed Was Not A JSVector!');
          }
     }
     mul(c){
          if (c.constructor.name == 'Number'){
               let t = this.clone();

               for(let i = 0; i < t.dim(); i++){
                    t.set(i, t.get(i) * c);
               }

               return t;
          }
          else {
               alert('The Argument Passed Was Not A Number!');
          }
     }
     div(c){
          if (c.constructor.name == 'Number'){
               let t = this.clone();

               for(let i = 0; i < t.dim(); i++){
                    t.set(i, t.get(i) / c);
               }

               return t;
          }
          else {
               alert('The Argument Passed Was Not A Number!');
          }
     }

     fill(n, v){
          let t = []
          for (let i = 0; i < n; i++){
               t.push(v);
          }

          this.m_vector = t;
     }
     dot(other){
          if (other.constructor.name == 'JSVector'){
               if (this.dim() == other.dim()){
                    let dot_product = 0.0;

                    for(let i = 0; i < this.dim(); i++){
                         dot_product += this.get(i) * other.get(i);
                    }

                    return dot_product;
               }
               else {
                    alert('The Argument JSVector Is Of The Wrong Size!');
               }
          }
          else {
               alert('The Argument Passed Was Not A JSVector!');
          }
     }
     norm(){
          return Math.pow(this.dot(this), 0.5);
     }
     unit(){
          let t = this.clone();
          t = t.div(this.norm());

          return t;
     }
     map(f){
          let t = this.clone();

          for (let i = 0; i < this.dim(); i++){
               t.set(i, f(t.get(i)));
          }

          return t;
     }
     randomize(min, max){
          let t = this.clone();
          for (let i = 0; i < this.dim(); i++){
               t.set(i, min + (Math.random() * (max - min)));
          }

          return t;
     }
     print(){
          console.log(this.m_vector);
     }
}
