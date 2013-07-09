(function() {
  var div = document.createElement('div')
  var id = 'dependencies_graph'

  div.setAttribute('id', id)
  document.body.appendChild(div)

  function dimension(w, h) {
    var graph = document.getElementById(id)
    graph.style.width = w + 'px';
    graph.style.height = h + 'px';
    graph.style.border = '1px solid blue'
    graph.style.margin= '150px'
  }


  seajs.use('https://raw.github.com/leoner/seajs-health/master/bookmarklet/joint.all.min.js', function() {

    dimension(800, 400);
    var uml = Joint.dia.uml;
    var paper = Joint.paper("dependencies_graph", 800, 400);

    var rx = 20
    var ry = 20
    var lx = 120
    var ly = 20
    var width = 100
    var height = 60

    function getRect(isRoot) {
        if (isRoot) {
            return {
                x: rx,
                y: ry+=150,
                width: width,
                height: height
            }
        } else {
            return {
                x: lx,
                y: ly+=150,
                width: width,
                height: height
            }
        }
    }

    function isRoot(id) {
      return /_use_\d+$/.test(id)
    }

    function createNode(id, methods, attrs) {

        var opts = {
            rect: getRect(isRoot(id)),
            attrs: {
              fill: "90-#000-green:1-#fff"
            },
            actions: {}
        }

        opts.label = id

        return uml.State.create(opts)
    }

    function findRoots() {
      var roots = []
      for (var key in seajs.cache) {
        if (isRoot(key)) {
          roots.push(key)
        }
      }
      return roots
    }

    var roots = findRoots(), mod, node, deps

    for(var i = 0, len = roots.length; i < len; i++) {
      mod = seajs.cache[roots[i]]
      node = createNode(roots[i])
      deps  = mod.dependencies

      // Temp solution
      deps.forEach(function(dep) {
         mod.joint(createNode(dep), uml.arrow)
      })
    }
  })
}())

