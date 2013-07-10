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

  var Graph = function() {
    this.nodes = []
  }

  Graph.prototype = {

    // 添加结点.
    add: function(name, data) {
      return this.getNode(name, data);
    },

    getNode: function(name, data) {
      var cacheNodes = this.nodes;
      var temp = {
        name: name
      };

      for (var i = 0, len = cacheNodes.length; i < len; i++) {
        if (cacheNodes[i].equals(temp)) {
          return cacheNodes[i];
        }
      }

      var node = new Node(name);
      node.data = data;
      this.nodes.push(node);
      return node;
    },

    // 获取排序好的模块.
    sort: function() {
      var L = [];
      var S = [];
      this.nodes.forEach(function(node) {
        if (node.inEdges.length == 0) {
          S.push(node);
        }
      });

      while(S.length) {
        var node = S.shift();
        L.push(node);

        while(node.outEdges.length) {
          var e = node.outEdges.shift();
          var m = e.to;
          e.remove();

          if (m.inEdges.length == 0) {
            S.push(m);
          }
        }
      }

      var cycleNodes = this.nodes.filter(function(node) {
        return node.inEdges.length != 0;
      });

      if (cycleNodes.length) {
        printCycleNode(cycleNodes);
        throw new Error('发现模块的循环依赖');
      } else {
        return L.reverse();
      }
    }
  }

  function Node(name) {
    this.name = name;
    this.inEdges = [];
    this.outEdges = [];
    this.depth = 0;
  }

  Node.prototype = {
    addEdge: function(node) {
      var e = new Edge(this, node);
      this.outEdges.push(e);
      node.inEdges.push(e);
      node.setDepth(this.depth + 1);

      return this;
    },

    setDepth: function(depth) {
      if (depth < this.depth) return;
      this.depth = depth;
    },

    equals: function(node) {
      return node.name == this.name;
    }
  }

  function Edge(from, to) {
    this.from = from;
    this.to = to;
  }

  Edge.prototype = {
    equals: function(edge) {
      return edge.from == this.from && edge.to == this.to;
    },

    // remove inEdeges
    remove: function() {
      var toInEdges = this.to.inEdges.slice(0);
      for (var i = 0, len = toInEdges.length; i < len; i++) {
        if (toInEdges[i].equals(this)) {
          remove(this.to.inEdges, toInEdges[i]);
        }
      }
    }
  }

  function Draw(uml, coord) {
    this.uml = uml
    this.states = {}
    this.baseCoord = coord
    this.levelsCoord = {}
    this.levelNodes = {}
  }

  Draw.prototype = {
    draw: function(node) {
      var that = this
      var state = this.createUmlState(node)
      forEach(node.outEdges, function(edge) {
        var subState = that.createUmlState(edge.to)
        state.joint(subState, that.uml.arrow)
        that.draw(edge.to)
      })
    },
    getCoord: function(level) {
      var levelCoord = this.levelsCoord[level] || (this.levelsCoord[level] = {
          x: this.baseCoord.x,
          y: this.baseCoord.y + level * 100,
          width: this.baseCoord.width,
          height: this.baseCoord.height
      })
console.info('----------getCoord-->', level, levelCoord)
      if (!this.levelNodes[level]) return levelCoord
      levelCoord.x = levelCoord.x + 200
      return levelCoord
    },
    createUmlState: function(node) {
      if (this.states[node.name]) return this.states[node.name]

      var opts = {
          rect: this.getCoord(node.depth),
          attrs: {
            fill: "90-#000-green:1-#fff"
          },
          actions: {}
      }

      opts.label = node.name
      var levelNodes = this.levelNodes[node.depth] || (this.levelNodes[node.depth] = [])
      levelNodes.push(node)
      return (this.states[node.name] = this.uml.State.create(opts))
    }
  }


  function forEach(arrs, cb) {
    for (var i = 0, len = arrs.length; i < len; i++) {
      cb(arrs[i], i)
    }
  }

  function indexOf(arr, item) {
    for(var i = 0, len = arr.length; i < len; i++) {
      var node = arr[i];
      if (node.equals(item)) {
        return i;
      }
    }
  }

  function remove(arr, item) {
    arr.splice(arr.indexOf(item), 1);
  }

  function printCycleNode(nodes) {
    console.info(nodes.map(function(node) {
      return node.name;
    }));
  }


  seajs.use('https://raw.github.com/leoner/seajs-health/master/bookmarklet/joint.all.min.js', function() {

    dimension(1024, 800);
    var uml = Joint.dia.uml;
    var paper = Joint.paper("dependencies_graph", 1024, 800);


    function isRoot(id) {
      return /_use_\d+$/.test(id)
    }

    function findRoots() {
      var roots = []
      for (var key in seajs.cache) {
        if (isRoot(key)) {
          roots.push(key)
        }
      }

      // pop plugin use
      roots.pop()
      return roots
    }

    function addDep(node, mod) {
      if (!mod) return

      forEach(mod.dependencies, function(subId) {
        var subNode = graph.add(subId)
        node.addEdge(subNode)
        addDep(subNode, seajs.cache[mod.resolve(subId)])
      })

      window.graph = graph
    }

    var roots = findRoots()
    var graph = new Graph()

    forEach(roots, function(rootId) {
      var mod = seajs.cache[rootId]
      var node = graph.add(rootId)

      addDep(node, mod)
    })

    var rootNodes = []

    forEach(graph.nodes, function(node) {
      if (node.inEdges.length === 0) {
        rootNodes.push(node)
      }
    })

    var coord = {
      x: 20,
      y: 20,
      width: 150,
      height: 60
    }

    forEach(rootNodes, function(rootNode, index) {
      new Draw(uml, {
          x: coord.x + index * 100,
          y: coord.y,
          width: coord.width,
          height: coord.height
        }).draw(rootNode)
    })
  })
}())

