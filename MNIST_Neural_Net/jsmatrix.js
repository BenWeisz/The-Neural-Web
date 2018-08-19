class JSMatrix{
     constructor(m, n){
          this.m_display_precision = 3;
          this.m_columns = [];

          for (let i = 0; i < n; i++){
               let t = new JSVector([]);
               t.fill(m, 0.0);

               this.m_columns.push(t);
          }
     }
     set_columns(columns){
          if (columns.constructor.name == 'Array'){
               if (columns.length != 0){
                    if (columns[0].constructor.name == 'JSVector'){
                         this.m_columns = columns;
                    }
                    else {
                         alert('The Passed Arguement Must Be An Array Of JSVectors!');
                    }
               }
               else {
                    this.m_columns = [];
               }
          }
          else {
               alert('The Passed Arguement Must Be An Array Of JSVectors!');
          }
     }
     dim(){
          if (this.m_columns.length == 0){
               return [0, 0];
          }
          else {
               return [this.m_columns[0].dim(), this.m_columns.length];
          }
     }
     get(i){
          return this.m_columns[i];
     }
     set(i, v){
          if (i >= 0){
               if (v.constructor.name == 'JSVector'){
                    this.m_columns[i] = v;
               }
               else {
                    alert('Value Passed Must Be A JSVector!');
               }
          }
          else {
               alert('Index Passed Must Be Positive!');
          }
     }
     transpose(){
          let size = this.dim();
          let t = new JSMatrix(size[1], size[0]);

          for (let y = 0; y < size[0]; y++){
               for (let x = 0; x < size[1]; x++){
                    t.get(y).set(x, this.get(x).get(y));
               }
          }

          return t;
     }
     row(m){
          let size = this.dim();
          let t = new JSVector([]);

          for (let i = 0; i < size[1]; i++){
               t.m_vector.push(this.get(i).get(m));
          }

          return t;
     }
     add(other){
          if (other.constructor.name == 'JSMatrix'){
               let this_size = this.dim();
               let other_size = other.dim();

               if (JSON.stringify(this_size) === JSON.stringify(other_size)){
                    let t = new JSMatrix(this_size[0], this_size[1]);

                    for (let y = 0; y < this_size[0]; y++){
                         for (let x = 0; x < this_size[1]; x++){
                              t.get(x).set(y, this.get(x).get(y) + other.get(x).get(y));
                         }
                    }

                    return t;
               }
               else {
                    alert('The JSMatrix Passed Is Of A Different Dimension!');
               }
          }
          else {
               alert('The Argument Passed Must Be A JSMatrix!');
          }
     }
     sub(other){
          if (other.constructor.name == 'JSMatrix'){
               let this_size = this.dim();
               let other_size = other.dim();

               if (JSON.stringify(this_size) === JSON.stringify(other_size)){
                    let t = new JSMatrix(this_size[0], this_size[1]);

                    for (let y = 0; y < this_size[0]; y++){
                         for (let x = 0; x < this_size[1]; x++){
                              t.get(x).set(y, this.get(x).get(y) - other.get(x).get(y));
                         }
                    }

                    return t;
               }
               else {
                    alert('The JSMatrix Passed Is Of A Different Dimension!');
               }
          }
          else {
               alert('The Argument Passed Must Be A JSMatrix!');
          }
     }
     mul(o){
          if (o.constructor.name == 'Number'){
               let t = this.clone();

               for (let x = 0; x < this.dim()[1]; x++){
                    t.set(x, t.get(i).mul(o));
               }

               return t;
          }
          else if (o.constructor.name == 'JSMatrix') {
               let this_size = this.dim();
               let other_size = o.dim();

               if (this_size[1] == other_size[0]){
                    let t = new JSMatrix(this_size[0], other_size[1]);

                    for (let y = 0; y < this_size[0]; y++){
                         for (let x = 0; x < other_size[1]; x++){
                              t.get(x).set(y, this.row(y).dot(o.get(x)));
                         }
                    }

                    return t;
               }
               else {
                    alert('The Passed JSMatrix Is Of The Wrong Dimension!');
               }
          }
          else {
               alert('The Passed Argument Must Be A Number!');
          }
     }
     map(f){
          let t = this.clone();

          for (let x = 0; x < this.dim()[1]; x++){
               t.set(x, t.get(x).map(f));
          }

          return t;
     }
     clone(){
          let t_cols = []

          for (let x = 0; x < this.dim()[1]; x++){
               t_cols.push(this.get(x).clone());
          }

          let t = new JSMatrix(0, 0);
          t.set_columns(t_cols);

          return t;
     }
     randomize(min, max){
          let t = this.clone();

          for (let x = 0; x < this.dim()[1]; x++){
               t.set(x, t.get(x).randomize(min, max));
          }

          return t;
     }
     hadamard_product(other){
          if (other.constructor.name == 'JSMatrix'){
               let this_size = this.dim();
               let other_size = other.dim();

               if (JSON.stringify(this_size) === JSON.stringify(other_size)){
                    let t = this.clone();

                    for (let y = 0; y < this_size[0]; y++){
                         for (let x = 0; x < this_size[1]; x++){
                              t.get(x).set(y, t.get(x).get(y) * other.get(x).get(y));
                         }
                    }

                    return t;
               }
               else {
                    alert('The Passed JSMatrix Must Have The Same Dimensions!');
               }
          }
          else {
               alert('The Passed Arguement Must Be A JSMatrix!');
          }
     }
     normalize(){
          let size = this.dim();
          let high = 0;

          for (let y = 0; y < size[0]; y++){
               for (let x = 0; x < size[1]; x++){
                    if (this.get(x).get(y) > high){
                         high = this.get(x).get(y);
                    }
               }
          }

          let t = this.clone();
          for (let x = 0; x < size[1]; x++){
               t.set(x, t.get(x).div(high));
          }

          return t;
     }
     to_matrix(vec){
          if (vec.constructor.name == 'JSVector'){
               let t = new JSMatrix(0, 0);
               t.set_columns([vec]);

               return t;
          }
          else {
               alert('The Passed Argument Must Be A JSVector!');
          }
     }
     append_row(vec){
          if (vec.constructor.name == 'JSVector'){
               if (vec.dim() == this.dim()[1]){
                    let t = this.clone();

                    for (let x = 0; x < this.dim()[1]; x++){
                         t.get(x).m_vector.push(vec.get(x));
                    }

                    return t;
               }
               else {
                    alert('The Passed Argument Must Be Of The Correct Dimension!');
               }
          }
          else {
               alert('The Passed Argument Must Be A JSVector!');
          }
     }
     remove_row(i){
          let t = this.clone();

          for (let x = 0; x < this.dim()[1]; x++){
               t.get(x).m_vector.splice(i, 1);
          }

          return t;
     }
     append_column(vec){
          if (vec.constructor.name == 'JSVector'){
               if (vec.dim() == this.dim()[0]){
                    let t = this.clone();
                    t.m_columns.push(vec);

                    return t;
               }
               else {
                    alert('The Passed Argument Must Be Of The Correct Dimension!');
               }
          }
          else {
               alert('The Passed Arguement Must Be A JSVector!');
          }
     }
     print(){
          let size = this.dim();
          let out = '';

          let max_digits = new JSVector([]);
          max_digits.fill(size[1], 0.0);

          for (let x = 0; x < size[1]; x++){
               let high = 0;

               for (let y = 0; y < size[0]; y++){
                    let abs = Math.abs(this.get(x).get(y));
                    let log = Math.log10(abs);

                    if (Math.pow(10, log) == Math.pow(10, Math.floor(log)))
                         log++;
                    if (log < 0)
                         log = 1;

                    let t = Math.ceil(log);

                    if (t > high)
                         high = t;
               }

               max_digits.set(x, high);
          }

          let space_width = 2;
          for (let i = 0; i < size[1]; i++){
               space_width += max_digits.get(i);
          }

          space_width += (3 + this.m_display_precision) * size[1];

          out += '(';
          for (let i = 0; i < space_width; i++){
               out += ' ';
          }
          out += ')';
          console.log(out);

          out = '';

          for (let y = 0; y < size[0]; y++){
               out += '|'

               for (let x = 0; x < size[1]; x++){
                    if (this.get(x).get(y) >= 0)
                         out += '  ';
                    else out += ' ';

                    out += this.get(x).get(y).toFixed(this.m_display_precision);

                    let abs = Math.abs(this.get(x).get(y));
                    let log = Math.log10(abs);

                    if (Math.pow(10, log) == Math.pow(10, Math.floor(log)))
                         log++;
                    if (log < 0)
                         log = 1;

                    let digits = Math.ceil(log);

                    for (let i = 0; i < max_digits.get(i) - digits; i++){
                         out += ' ';
                    }
               }

               out += '  |';
               console.log(out);
               out = '';
          }

          out = '(';
          for (let i = 0; i < space_width; i++){
               out += ' ';
          }
          out += ')';
          console.log(out);
     }
}
