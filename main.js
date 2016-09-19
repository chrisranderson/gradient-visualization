// Config

var LINE_FACTOR = 10 // bigger means shorter lines
var SURFACE_OPACITY = .999
var DATA_POINT_COUNT = 50 // resolution of point grid: n^2 points in the surface

// end config

var print = console.log
var pow = Math.pow
var exp = Math.exp

var PLOT_3D_ID = 'plot-3d'
var X_PLOT_ID = 'x-plot'
var Y_PLOT_ID = 'y-plot'

var HALVED = DATA_POINT_COUNT / 2
var x_index = 25
var y_index = 25

var layout_3d = {
  width: 700,
  height: 600,
  margin: {
    l: 20,
    r: 0,
    b: 20,
    t: 0,
  },
  scene: {
    camera: {
      eye: {
        x: -1.25,
        y: -1.25
      }
    }
  }
};

var layout_2d = {
  width: 400,
  height: 100,
  margin: {
    l: 20,
    r: 0,
    b: 20,
    t: 0,
  }
};

function peaks(x, y) {
  var x2 = pow(x, 2)
  return 3 * pow((1 - x), 2) * exp(-x2 - pow(y+1, 2)) - 10 * (x/5 - pow(x, 3) - pow(y, 5)) * exp(-pow(x, 2) - pow(y, 2)) - (1/3) * exp(-pow(x+1, 2) - pow(y, 2))
}

function peaks_d_x(x, y) {
  var x2 = pow(x, 2)
  var y2 = pow(y, 2)
  return -10 * ((1/5) - 3 * x2) * exp(-x2 - y2)- 6 * x * pow((1 - x), 2) * exp(-x2 - pow(y+1, 2))- 6 * (1 - x) * exp(-x2 - pow(y+1, 2))+ 20 * x * exp(-x2 - y2) * (-pow(x, 3) + x/5 - pow(y, 5)) + (2/3) * (x + 1) * exp(-pow(x+1, 2) - y2)
}

function peaks_d_y(x, y) {
  var x2 = pow(x, 2)
  var y2 = pow(y, 2)
  return 50 * pow(y, 4) * exp(-x2 - y2) - 6 * pow(1-x, 2) * (y+1) * exp(-x2 - pow(y+1, 2)) + 20 * y * exp(-x2 - y2) * (-pow(x, 3) + x/5 - pow(y, 5)) + (2/3) * y * exp(-pow(x+1, 2) - y2)
}

function generic_line(color) {
  return {
      type: 'scatter3d',
      mode: 'lines',
      line: {
        width: 6,
        color: color,
      },
      x: [0, 0],
      y: [0, 0],
      z: [0, 0],
      showlegend: false
    }
}

function set_up_manipulators() {
  var x_slider = $('#x-position')
  var y_slider = $('#y-position')

  x_slider.on('change input', function (){
    var new_value = Number(x_slider.val())
    if (new_value != x_index) {
      x_index = new_value
      redraw()
    }
  })

  y_slider.on('change input', function (){
    var new_value = Number(y_slider.val())
    if (new_value != y_index) {
      y_index = new_value
      redraw()
    }
  })

  $('.drawing-pad').on('mousemove', function (event) {
    var pad = $('.drawing-pad')

    var max_x = pad.width()
    var max_y = pad.height()

    var percent_x = event.offsetX / max_x
    var percent_y = 1 - (event.offsetY / max_y)

    x_index = Math.floor(percent_x * DATA_POINT_COUNT)
    y_index = Math.floor(percent_y * DATA_POINT_COUNT)

    redraw()
  })
}

function generate_data (min_x, max_x) {
  var x_data = []
  var y_data = []
  var x_range = max_x - min_x
  var z_data = []
  var z_x_derivative_data = []
  var z_y_derivative_data = []
  var domain = []

  for (var y = 0; y < DATA_POINT_COUNT; y++) {
    x_data[y] = []
    y_data[y] = []
    z_data[y] = []
    z_x_derivative_data[y] = []
    z_y_derivative_data[y] = []
    var percentage_y = y / DATA_POINT_COUNT
    var actual_y = min_x + percentage_y * x_range
    domain[y] = actual_y

    for (var x = 0; x < DATA_POINT_COUNT; x++) {
      var percentage_x = x / DATA_POINT_COUNT
      var actual_x = min_x + percentage_x * x_range

      x_data[y][x] = actual_x
      y_data[y][x] = actual_y

      // z_data[y][x] = Math.pow(actual_x, 3) + Math.pow(actual_y, 2)
      // z_x_derivative_data[y][x] = 2 * Math.pow(actual_x, 2)
      // z_y_derivative_data[y][x] = 2 * actual_y

      z_data[y][x] = peaks(actual_x, actual_y)
      z_x_derivative_data[y][x] = peaks_d_x(actual_x, actual_y)
      z_y_derivative_data[y][x] = peaks_d_y(actual_x, actual_y)
    }
  }

  return [x_data, y_data, z_data, z_x_derivative_data, z_y_derivative_data, domain]
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

function x_data_slice(data) {
  return data[y_index]
}

function y_data_slice(transposed_data) {
  return transposed_data[x_index]
}

set_up_manipulators()

var all_data = generate_data(-4, 4)

var x_data = all_data[0]
var y_data = all_data[1]
var z_data = all_data[2]
var z_x_derivative_data = all_data[3]
var z_y_derivative_data = all_data[4]
var domain = all_data[5]
var z_data_t = transpose(z_data)
var x = x_data[y_index][x_index]
var y = y_data[y_index][x_index]
var z = z_data[y_index][x_index]
var z_x = z_x_derivative_data[y_index][x_index]
var z_y = z_y_derivative_data[y_index][x_index]

var data = [
  {
    type: 'surface', // 3d surface
    x: x_data,
    y: y_data,
    z: z_data,
    opacity: SURFACE_OPACITY,
    colorscale: 'Viridis',
    showscale: false
  }, { 
    type: 'scatter3d', // orange dot
    x: x,
    y: y,
    z: z,
    showlegend: false
  }, 
  generic_line('#D22'), // x
  generic_line('#22D'), // y
  generic_line('#D2D')  // xy
];

Plotly.newPlot(PLOT_3D_ID, data, layout_3d);

Plotly.newPlot(X_PLOT_ID, [{ // x graph
  type: 'scatter',
  x: domain,
  y: x_data_slice(z_data),
  showlegend: false,
}, {
  type: 'scatter', // x graph orange dot
  mode: 'markers',
  x: [x],
  y: [z],
  showlegend: false
}], layout_2d)

Plotly.newPlot(Y_PLOT_ID, [{ // y graph
  type: 'scatter',
  x: domain,
  y: y_data_slice(z_data_t),
  showlegend: false
}, {
  type: 'scatter', // y graph orange dot
  mode: 'markers',
  x: [y],
  y: [z],
  showlegend: false
}], layout_2d)

redraw()

function redraw() {
  var x = x_data[y_index][x_index]
  var y = y_data[y_index][x_index]
  var z = z_data[y_index][x_index]
  var z_x = z_x_derivative_data[y_index][x_index]
  var z_y = z_y_derivative_data[y_index][x_index]

  var graph = document.getElementById(PLOT_3D_ID)

  // orange dot
  graph.data[1].x = [x]
  graph.data[1].y = [y]
  graph.data[1].z = [z]

  // x derivative
  z_x_length = z_x / LINE_FACTOR
  graph.data[2].x = [x, x - z_x_length]
  graph.data[2].y = [y, y]
  graph.data[2].z = [z, z - z_x * z_x_length]

  // y derivative
  z_y_length = z_y / LINE_FACTOR
  graph.data[3].x = [x, x],
  graph.data[3].y = [y, y - z_y_length]
  graph.data[3].z = [z, z - z_y * z_y_length]

  // gradient
  graph.data[4].x = [x, graph.data[2].x[1]]
  graph.data[4].y = [y, graph.data[3].y[1]]
  graph.data[4].z = [z, -z + graph.data[3].z[1] + graph.data[2].z[1]]

  var x_graph = document.getElementById(X_PLOT_ID)

  x_graph.data[0].y = x_data_slice(z_data)
  x_graph.data[1].x = [x]
  x_graph.data[1].y = [z]

  var x_graph = document.getElementById(Y_PLOT_ID)

  x_graph.data[0].y = y_data_slice(z_data_t)
  x_graph.data[1].x = [y]
  x_graph.data[1].y = [z]
 
  Plotly.redraw(PLOT_3D_ID)
  Plotly.redraw(X_PLOT_ID)
  Plotly.redraw(Y_PLOT_ID)
}