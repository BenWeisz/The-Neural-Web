class NeuralNetBase{
     constructor(schematic){
          this.m_schematic = schematic;
          this.m_f = null;
          this.m_f_prime = null;
          this.m_layers = [];
          this.read_pointer = 0;

          for (let i = 1; i < schematic.dim(); i++){
               let layer = new JSMatrix(schematic.get(i), schematic.get(i - 1) + 1);
               layer = layer.randomize(-1, 1);

               this.m_layers.push(layer);
          }
     }
     feed_forward(input_data){
          let output = [];
          let cur_output = input_data.clone();

          output.push(cur_output);

          for (let i = 0; i < this.m_layers.length; i++){
               let layer = this.m_layers[i];
               let bias_vector = new JSVector([]);

               bias_vector.fill(cur_output.dim()[1], 1.0);
               cur_output = cur_output.append_row(bias_vector);

               cur_output = layer.mul(cur_output);
               output.push(cur_output);

               cur_output = cur_output.map(this.m_f);
          }

          return output;
     }

     read_data_line(data){
          let out = data[this.read_pointer];
          this.read_pointer++;

          return out;
     }

     load(data){
          let schematic = this.read_data_line(data).split(' ');
          schematic.splice(schematic.length - 1, 1);

          for (let i = 0; i < schematic.length; i++){
               schematic[i] = parseInt(schematic[i]);
          }

          let layers = [];

          for (let i = 0; i < schematic.length - 1; i++){
               let layer = new JSMatrix(schematic[i + 1], schematic[i] + 1);
               let column_vectors = [];

               for (let j = 0; j < layer.dim()[1]; j++){
                    let vector = this.read_data_line(data).trim().split(' ');
                    for (let k = 0; k < vector.length; k++){
                         vector[k] = parseFloat(vector[k]);
                    }

                    let col = new JSVector(vector);
                    column_vectors.push(col);
               }

               layer.set_columns(column_vectors);
               layers.push(layer);
          }

          this.m_layers = layers;

          this.read_pointer = 0;

          console.log('Loading Complete!');
     }

     static tanh(x){
          return (1.0 - Math.exp(-2.0 * x)) / (1.0 + Math.exp(-2.0 * x));
     }
     static tanh_prime(x){
          return 1.0 - Math.pow(NeuralNetBase.tanh(x), 2);
     }
}
