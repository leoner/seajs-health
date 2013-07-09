(function() {
  var div = document.createElement('div')
  var id = 'dependencies_graph'

  div.setAttribute('id', id)
  document.body.appendChild(div)

  function dimension(w, h) {
    var graph = document.getElementById(id)
    graph.style.width = w + 'px';
    graph.style.height = h + 'px';
  }

  seajs.use('https://raw.github.com/leoner/seajs-health/master/bookmarklet/joint.all.min.js', function() {

    dimension(800, 400);

    var uml = Joint.dia.uml;
    var paper = Joint.paper("dependencies_graph", 800, 900);

    var s1 = uml.State.create({
      rect: {x: 100, y: 50, width: 100, height: 60},
      label: "state 1",
      attrs: {
        fill: "90-#000-green:1-#fff"
      },
      actions: {
        method: "show()",
        attr: "id"
      }
    })

    var s2 = uml.State.create({
      rect: {x: 290, y: 50, width: 100, height: 60},
      label: "state 2",
      attrs: {
        fill: "90-#000-red:1-#fff"
      },
      actions: {
        method: "hide()",
        attr: "elem"
      }
    })

    s1.joint(s2, uml.arrow)
  })
}())

