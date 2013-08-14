/**
 * TODO 1. create dependencies tree
 * TODO 2. draw graph
 */
(function() {
  var div = document.createElement('div')
  var id = 'dependencies_graph'

  div.setAttribute('id', id)
  document.body.appendChild(div)

  function dimension(w, h) {
    var graph = document.getElementById(id)

    graph.style.width = w + 'px'
    graph.style.height = h + 'px'
    graph.style.border = '1px solid blue'
    graph.style.margin = '150px'
  }
  var d3 = 'http://localhost:8000/bookmarklet/d3.v3.min.js'
  // var app = 'https://raw.github.com/leoner/seajs-health/master/bookmarklet/app.js'
   var app = 'http://localhost:8000/bookmarklet/app.js'
  var d3Css = 'http://localhost:8000/bookmarklet/d3.css'
  var health = 'http://localhost:8000/src/seajs-health.js'

  seajs.use([d3, health, d3Css], function() {
     seajs.use(app, function() {
        console.info('111')
     })

  })
}())

