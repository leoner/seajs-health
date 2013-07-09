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

    dimension(1024, 800);
    var uml = Joint.dia.uml;
    var paper = Joint.paper("dependencies_graph", 1024, 800);

    var rx = 20
    var ry = 20
    var lx = 120
    var ly = 20
    var width = 200
    var height = 60

    var depth = 0

    function getRect(isRoot, level) {
        if (isRoot) {
            return {
                x: rx,
                y: ry+=(250 * level),
                width: width,
                height: height
            }
        } else {
            return {
                x: lx,
                y: ly+=250,
                width: width,
                height: height
            }
        }
    }

    function isRoot(id) {
      return /_use_\d+$/.test(id)
    }

    // TODO cache node
    function createNode(id, level) {

        var opts = {
            rect: getRect(isRoot(id), level),
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

      roots.pop()
      return roots
    }

    function addDep(node, mod) {
      if (!mod) return
      depth++

      var level = depth
      if (mod.dependencies.length) {
        forEach(mod.dependencies, function(dep) {
          var subNode = createNode(dep, level)
          node.joint(subNode, uml.arrow)
          addDep(subNode, seajs.cache[mod.resolve(dep)])
        })
      }
    }

    var roots = findRoots(), mod, node, deps

    forEach(roots, function(root) {
      var mod = seajs.cache[root]
      var node = createNode(root)
      addDep(node, mod)
    })

    function forEach(arrs, cb) {
      for (var i = 0, len = arrs.length; i < len; i++) {
        cb(arrs[i], i)
      }
    }
  })
}())

