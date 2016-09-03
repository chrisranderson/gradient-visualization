var print = console.log

var PLOT_3D_ID = 'plot-3d'
var X_PLOT_ID = 'x-plot'
var Y_PLOT_ID = 'y-plot'

var LINE_FACTOR = 100 // bigger means shorter lines
var DATA_POINT_COUNT = 100
var HALVED = DATA_POINT_COUNT / 2
var x_position = 25
var y_position = 25

function generate_data () {
  var z_data = []
  var z_x_derivative_data = []
  var z_y_derivative_data = []
  var range = []

  for (var y = 0; y < DATA_POINT_COUNT; y++) {
    range[y] = y
    z_data[y] = []
    z_x_derivative_data[y] = []
    z_y_derivative_data[y] = []

    for (var x = 0; x < DATA_POINT_COUNT; x++) {
      // z_data[y][x] = Math.pow(x - HALVED, 3) + 20*Math.pow(y - HALVED, 2)
      // z_x_derivative_data[y][x] = 2 * Math.pow((x - HALVED), 2)
      // z_y_derivative_data[y][x] = 20 * 2 * (y - HALVED)
      
      z_data[y][x] = Math.pow(x - HALVED, 3) + 20*Math.pow(y - HALVED, 2)
      z_x_derivative_data[y][x] = 2 * Math.pow((x - HALVED), 2)
      z_y_derivative_data[y][x] = 20 * 2 * (y - HALVED)
    }
  }

  return [z_data, z_x_derivative_data, z_y_derivative_data, range]
}

function transpose (data) {
  output = []

  for (var y = 0; y < DATA_POINT_COUNT; y++) {
    output[y] = []
  }

  for (var y = 0; y < DATA_POINT_COUNT; y++) {
    for (var x = 0; x < DATA_POINT_COUNT; x++) {
      output[x][y] = z_data[y][x]
    }
  }

  return output
}


var all_data = generate_data()

var z_data = all_data[0]
var z_x_derivative_data = all_data[1]
var z_y_derivative_data = all_data[2]
var range = all_data[3]

z_data_t = transpose(z_data)

function x_data(data) {
  return data[y_position]
}

function y_data(transposed_data) {
  return transposed_data[x_position]
}

var x_slider = $('#x-position')
var y_slider = $('#y-position')

x_slider.on('change mousemove', function (){
  var new_value = Number(x_slider.val())
  if (new_value != x_position) {
    x_position = new_value
    redraw()
  }
})

y_slider.on('change mousemove', function (){
  var new_value = Number(y_slider.val())
  if (new_value != y_position) {
    y_position = new_value
    redraw()
  }
})

var z = z_data[y_position][x_position]
var z_x = z_x_derivative_data[y_position][x_position]
var z_y = z_y_derivative_data[y_position][x_position]

var data = [
  {
    type: 'surface',
    z: z_data,
    opacity: .9999,
    colorscale: 'Viridis',
    showscale: false
  }, 
  {
    type: 'scatter3d',
    x: [x_position],
    y: [y_position],
    z: [Number(z_data[y_position][x_position])],
    showlegend: false
  },
  {
    type: 'scatter3d',
    mode: 'lines',
    line: {
      width: 6,
      color: '#D22',
    },
    x: [x_position, x_position - 10],
    y: [y_position, y_position],
    z: [z,          z - z_x * 10],
    showlegend: false

  },
  {
    type: 'scatter3d',
    mode: 'lines',
    line: {
    width: 6,
    color: '#22D',
    },
    x: [x_position, x_position],
    y: [y_position, y_position+10],
    z: [z,          z + z_y * 10],
    showlegend: false
  }, 
  {
    type: 'scatter3d',
    mode: 'lines',
    line: {
      width: 6,
      color: '#D2D'
    },
    x: [x_position, x_position-10],
    y: [y_position, y_position+10],
    z: [z,          z + (z_y * 10) - (z_x * 10) ],
    showlegend: false
}];


var layout = {
  autosize: false,
  width: 600,
  height: 400,
  margin: {
    l: 20,
    r: 0,
    b: 20,
    t: 0,
  }
};

Plotly.newPlot(PLOT_3D_ID, data, layout);

Plotly.newPlot(X_PLOT_ID, [{
  type: 'scatter',
  x: range,
  y: x_data(z_data)
}, {
  type: 'scatter',
  mode: 'markers',
  x: [x_position],
  y: [x_data(z_data)[x_position]]
}], layout)

Plotly.newPlot(Y_PLOT_ID, [{
  type: 'scatter',
  x: range,
  y: y_data(z_data_t)
}, {
  type: 'scatter',
  mode: 'markers',
  x: [y_position],
  y: [y_data(z_data_t)[y_position]]
}], layout)

redraw()

function redraw() {
  var z = z_data[y_position][x_position]
  var z_x = z_x_derivative_data[y_position][x_position]
  var z_y = z_y_derivative_data[y_position][x_position]

  var graph = document.getElementById(PLOT_3D_ID)

  graph.data[1].x = [x_position]
  graph.data[1].y = [y_position]
  graph.data[1].z = [z]

  // x derivative
  z_x_length = z_x / LINE_FACTOR
  graph.data[2].x = [x_position, x_position - z_x_length]
  graph.data[2].y = [y_position, y_position]
  graph.data[2].z = [z,          z - z_x * z_x_length]

  // y derivative
  z_y_length = z_y / LINE_FACTOR
  graph.data[3].x = [x_position, x_position],
  graph.data[3].y = [y_position, y_position - z_y_length]
  graph.data[3].z = [z,          z - z_y * z_y_length]

  // gradient
  graph.data[4].x = [x_position, graph.data[2].x[1]]
  graph.data[4].y = [y_position, graph.data[3].y[1]]
  graph.data[4].z = [z,          -z + graph.data[3].z[1] + graph.data[2].z[1]]

  var x_graph = document.getElementById(X_PLOT_ID)

  x_graph.data[0].y = x_data(z_data)
  x_graph.data[1].x = [x_position]
  x_graph.data[1].y = [x_data(z_data)[x_position]]

  var x_graph = document.getElementById(Y_PLOT_ID)

  x_graph.data[0].y = y_data(z_data_t)
  x_graph.data[1].x = [y_position]
  x_graph.data[1].y = [y_data(z_data_t)[y_position]]
 
  Plotly.redraw(PLOT_3D_ID)
  Plotly.redraw(X_PLOT_ID)
  Plotly.redraw(Y_PLOT_ID)
}

$('.drawing-pad').on('mousemove', function (event) {
  var pad = $('.drawing-pad')

  var max_x = pad.width()
  var max_y = pad.height()

  var percent_x = event.offsetX / max_x
  var percent_y = 1 - (event.offsetY / max_y)

  x_position = Math.floor(percent_x * DATA_POINT_COUNT)
  y_position = Math.floor(percent_y * DATA_POINT_COUNT)

  redraw()
})