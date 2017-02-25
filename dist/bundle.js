(function(FuseBox){FuseBox.$fuse$=FuseBox;
FuseBox.pkg("default", {}, function(___scope___){
___scope___.file("components/Graph.coffee", function(exports, require, module, __filename, __dirname){ 

var Graph, noflo,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

noflo = require("../lib/NoFlo");

Graph = (function(superClass) {
  extend(Graph, superClass);

  function Graph(metadata1) {
    this.metadata = metadata1;
    this.network = null;
    this.ready = true;
    this.started = false;
    this.starting = false;
    this.baseDir = null;
    this.loader = null;
    this.load = 0;
    this.inPorts = new noflo.InPorts({
      graph: {
        datatype: 'all',
        description: 'NoFlo graph definition to be used with the subgraph component',
        required: true,
        immediate: true
      }
    });
    this.outPorts = new noflo.OutPorts;
    this.inPorts.on('graph', 'data', (function(_this) {
      return function(data) {
        return _this.setGraph(data);
      };
    })(this));
  }

  Graph.prototype.setGraph = function(graph) {
    this.ready = false;
    if (typeof graph === 'object') {
      if (typeof graph.addNode === 'function') {
        return this.createNetwork(graph, (function(_this) {
          return function(err) {
            if (err) {
              return _this.error(err);
            }
          };
        })(this));
      }
      noflo.graph.loadJSON(graph, (function(_this) {
        return function(err, instance) {
          if (err) {
            return _this.error(err);
          }
          instance.baseDir = _this.baseDir;
          return _this.createNetwork(instance, function(err) {
            if (err) {
              return _this.error(err);
            }
          });
        };
      })(this));
      return;
    }
    if (graph.substr(0, 1) !== "/" && graph.substr(1, 1) !== ":" && process && process.cwd) {
      graph = (process.cwd()) + "/" + graph;
    }
    return graph = noflo.graph.loadFile(graph, (function(_this) {
      return function(err, instance) {
        if (err) {
          return _this.error(err);
        }
        instance.baseDir = _this.baseDir;
        return _this.createNetwork(instance, function(err) {
          if (err) {
            return _this.error(err);
          }
        });
      };
    })(this));
  };

  Graph.prototype.createNetwork = function(graph) {
    this.description = graph.properties.description || '';
    this.icon = graph.properties.icon || this.icon;
    if (!graph.name) {
      graph.name = this.nodeId;
    }
    graph.componentLoader = this.loader;
    return noflo.createNetwork(graph, (function(_this) {
      return function(err, network) {
        var contexts;
        _this.network = network;
        if (err) {
          return _this.error(err);
        }
        _this.emit('network', _this.network);
        contexts = [];
        _this.network.on('start', function() {
          var ctx;
          ctx = {};
          contexts.push(ctx);
          return _this.activate(ctx);
        });
        _this.network.on('end', function() {
          var ctx;
          ctx = contexts.pop();
          if (!ctx) {
            return;
          }
          return _this.deactivate(ctx);
        });
        return _this.network.connect(function(err) {
          var name, node, notReady, ref;
          if (err) {
            return _this.error(err);
          }
          notReady = false;
          ref = _this.network.processes;
          for (name in ref) {
            node = ref[name];
            if (!_this.checkComponent(name, node)) {
              notReady = true;
            }
          }
          if (!notReady) {
            return _this.setToReady();
          }
        });
      };
    })(this), true);
  };

  Graph.prototype.checkComponent = function(name, process) {
    if (!process.component.isReady()) {
      process.component.once("ready", (function(_this) {
        return function() {
          _this.checkComponent(name, process);
          return _this.setToReady();
        };
      })(this));
      return false;
    }
    this.findEdgePorts(name, process);
    return true;
  };

  Graph.prototype.isExportedInport = function(port, nodeName, portName) {
    var exported, i, len, priv, pub, ref, ref1;
    ref = this.network.graph.inports;
    for (pub in ref) {
      priv = ref[pub];
      if (!(priv.process === nodeName && priv.port === portName)) {
        continue;
      }
      return pub;
    }
    ref1 = this.network.graph.exports;
    for (i = 0, len = ref1.length; i < len; i++) {
      exported = ref1[i];
      if (!(exported.process === nodeName && exported.port === portName)) {
        continue;
      }
      this.network.graph.checkTransactionStart();
      this.network.graph.removeExport(exported["public"]);
      this.network.graph.addInport(exported["public"], exported.process, exported.port, exported.metadata);
      this.network.graph.checkTransactionEnd();
      return exported["public"];
    }
    return false;
  };

  Graph.prototype.isExportedOutport = function(port, nodeName, portName) {
    var exported, i, len, priv, pub, ref, ref1;
    ref = this.network.graph.outports;
    for (pub in ref) {
      priv = ref[pub];
      if (!(priv.process === nodeName && priv.port === portName)) {
        continue;
      }
      return pub;
    }
    ref1 = this.network.graph.exports;
    for (i = 0, len = ref1.length; i < len; i++) {
      exported = ref1[i];
      if (!(exported.process === nodeName && exported.port === portName)) {
        continue;
      }
      this.network.graph.checkTransactionStart();
      this.network.graph.removeExport(exported["public"]);
      this.network.graph.addOutport(exported["public"], exported.process, exported.port, exported.metadata);
      this.network.graph.checkTransactionEnd();
      return exported["public"];
    }
    return false;
  };

  Graph.prototype.setToReady = function() {
    if (typeof process !== 'undefined' && process.execPath && process.execPath.indexOf('node') !== -1) {
      return process.nextTick((function(_this) {
        return function() {
          _this.ready = true;
          return _this.emit('ready');
        };
      })(this));
    } else {
      return setTimeout((function(_this) {
        return function() {
          _this.ready = true;
          return _this.emit('ready');
        };
      })(this), 0);
    }
  };

  Graph.prototype.findEdgePorts = function(name, process) {
    var inPorts, outPorts, port, portName, targetPortName;
    inPorts = process.component.inPorts.ports || process.component.inPorts;
    outPorts = process.component.outPorts.ports || process.component.outPorts;
    for (portName in inPorts) {
      port = inPorts[portName];
      targetPortName = this.isExportedInport(port, name, portName);
      if (targetPortName === false) {
        continue;
      }
      this.inPorts.add(targetPortName, port);
      this.inPorts[targetPortName].once('connect', (function(_this) {
        return function() {
          if (_this.starting) {
            return;
          }
          if (_this.isStarted()) {
            return;
          }
          return _this.start(function() {});
        };
      })(this));
    }
    for (portName in outPorts) {
      port = outPorts[portName];
      targetPortName = this.isExportedOutport(port, name, portName);
      if (targetPortName === false) {
        continue;
      }
      this.outPorts.add(targetPortName, port);
    }
    return true;
  };

  Graph.prototype.isReady = function() {
    return this.ready;
  };

  Graph.prototype.isSubgraph = function() {
    return true;
  };

  Graph.prototype.setUp = function(callback) {
    this.starting = true;
    if (!this.isReady()) {
      this.once('ready', (function(_this) {
        return function() {
          return _this.setUp(callback);
        };
      })(this));
      return;
    }
    if (!this.network) {
      return callback(null);
    }
    return this.network.start(function(err) {
      if (err) {
        return callback(err);
      }
      this.starting = false;
      return callback();
    });
  };

  Graph.prototype.tearDown = function(callback) {
    this.starting = false;
    if (!this.network) {
      return callback(null);
    }
    return this.network.stop(function(err) {
      if (err) {
        return callback(err);
      }
      return callback();
    });
  };

  return Graph;

})(noflo.Component);

exports.getComponent = function(metadata) {
  return new Graph(metadata);
};

});
___scope___.file("lib/ArrayPort.coffee", function(exports, require, module, __filename, __dirname){ 

var ArrayPort, platform, port,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

port = require("./Port");

platform = require('./Platform');

ArrayPort = (function(superClass) {
  extend(ArrayPort, superClass);

  function ArrayPort(type) {
    this.type = type;
    platform.deprecated('noflo.ArrayPort is deprecated. Please port to noflo.InPort/noflo.OutPort and use addressable: true');
    ArrayPort.__super__.constructor.call(this, this.type);
  }

  ArrayPort.prototype.attach = function(socket, socketId) {
    if (socketId == null) {
      socketId = null;
    }
    if (socketId === null) {
      socketId = this.sockets.length;
    }
    this.sockets[socketId] = socket;
    return this.attachSocket(socket, socketId);
  };

  ArrayPort.prototype.connect = function(socketId) {
    if (socketId == null) {
      socketId = null;
    }
    if (socketId === null) {
      if (!this.sockets.length) {
        throw new Error((this.getId()) + ": No connections available");
      }
      this.sockets.forEach(function(socket) {
        if (!socket) {
          return;
        }
        return socket.connect();
      });
      return;
    }
    if (!this.sockets[socketId]) {
      throw new Error((this.getId()) + ": No connection '" + socketId + "' available");
    }
    return this.sockets[socketId].connect();
  };

  ArrayPort.prototype.beginGroup = function(group, socketId) {
    if (socketId == null) {
      socketId = null;
    }
    if (socketId === null) {
      if (!this.sockets.length) {
        throw new Error((this.getId()) + ": No connections available");
      }
      this.sockets.forEach((function(_this) {
        return function(socket, index) {
          if (!socket) {
            return;
          }
          return _this.beginGroup(group, index);
        };
      })(this));
      return;
    }
    if (!this.sockets[socketId]) {
      throw new Error((this.getId()) + ": No connection '" + socketId + "' available");
    }
    if (this.isConnected(socketId)) {
      return this.sockets[socketId].beginGroup(group);
    }
    this.sockets[socketId].once("connect", (function(_this) {
      return function() {
        return _this.sockets[socketId].beginGroup(group);
      };
    })(this));
    return this.sockets[socketId].connect();
  };

  ArrayPort.prototype.send = function(data, socketId) {
    if (socketId == null) {
      socketId = null;
    }
    if (socketId === null) {
      if (!this.sockets.length) {
        throw new Error((this.getId()) + ": No connections available");
      }
      this.sockets.forEach((function(_this) {
        return function(socket, index) {
          if (!socket) {
            return;
          }
          return _this.send(data, index);
        };
      })(this));
      return;
    }
    if (!this.sockets[socketId]) {
      throw new Error((this.getId()) + ": No connection '" + socketId + "' available");
    }
    if (this.isConnected(socketId)) {
      return this.sockets[socketId].send(data);
    }
    this.sockets[socketId].once("connect", (function(_this) {
      return function() {
        return _this.sockets[socketId].send(data);
      };
    })(this));
    return this.sockets[socketId].connect();
  };

  ArrayPort.prototype.endGroup = function(socketId) {
    if (socketId == null) {
      socketId = null;
    }
    if (socketId === null) {
      if (!this.sockets.length) {
        throw new Error((this.getId()) + ": No connections available");
      }
      this.sockets.forEach((function(_this) {
        return function(socket, index) {
          if (!socket) {
            return;
          }
          return _this.endGroup(index);
        };
      })(this));
      return;
    }
    if (!this.sockets[socketId]) {
      throw new Error((this.getId()) + ": No connection '" + socketId + "' available");
    }
    return this.sockets[socketId].endGroup();
  };

  ArrayPort.prototype.disconnect = function(socketId) {
    var i, len, ref, socket;
    if (socketId == null) {
      socketId = null;
    }
    if (socketId === null) {
      if (!this.sockets.length) {
        throw new Error((this.getId()) + ": No connections available");
      }
      ref = this.sockets;
      for (i = 0, len = ref.length; i < len; i++) {
        socket = ref[i];
        if (!socket) {
          return;
        }
        socket.disconnect();
      }
      return;
    }
    if (!this.sockets[socketId]) {
      return;
    }
    return this.sockets[socketId].disconnect();
  };

  ArrayPort.prototype.isConnected = function(socketId) {
    var connected;
    if (socketId == null) {
      socketId = null;
    }
    if (socketId === null) {
      connected = false;
      this.sockets.forEach(function(socket) {
        if (!socket) {
          return;
        }
        if (socket.isConnected()) {
          return connected = true;
        }
      });
      return connected;
    }
    if (!this.sockets[socketId]) {
      return false;
    }
    return this.sockets[socketId].isConnected();
  };

  ArrayPort.prototype.isAddressable = function() {
    return true;
  };

  ArrayPort.prototype.isAttached = function(socketId) {
    var i, len, ref, socket;
    if (socketId === void 0) {
      ref = this.sockets;
      for (i = 0, len = ref.length; i < len; i++) {
        socket = ref[i];
        if (socket) {
          return true;
        }
      }
      return false;
    }
    if (this.sockets[socketId]) {
      return true;
    }
    return false;
  };

  return ArrayPort;

})(port.Port);

exports.ArrayPort = ArrayPort;

});
___scope___.file("lib/AsyncComponent.coffee", function(exports, require, module, __filename, __dirname){ 

var AsyncComponent, component, platform, port,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

port = require("./Port");

component = require("./Component");

platform = require('./Platform');

AsyncComponent = (function(superClass) {
  extend(AsyncComponent, superClass);

  function AsyncComponent(inPortName, outPortName, errPortName) {
    this.inPortName = inPortName != null ? inPortName : "in";
    this.outPortName = outPortName != null ? outPortName : "out";
    this.errPortName = errPortName != null ? errPortName : "error";
    this.error = bind(this.error, this);
    platform.deprecated('noflo.AsyncComponent is deprecated. Please port to Process API');
    if (!this.inPorts[this.inPortName]) {
      throw new Error("no inPort named '" + this.inPortName + "'");
    }
    if (!this.outPorts[this.outPortName]) {
      throw new Error("no outPort named '" + this.outPortName + "'");
    }
    this.load = 0;
    this.q = [];
    this.errorGroups = [];
    this.outPorts.load = new port.Port();
    this.inPorts[this.inPortName].on("begingroup", (function(_this) {
      return function(group) {
        if (_this.load > 0) {
          return _this.q.push({
            name: "begingroup",
            data: group
          });
        }
        _this.errorGroups.push(group);
        return _this.outPorts[_this.outPortName].beginGroup(group);
      };
    })(this));
    this.inPorts[this.inPortName].on("endgroup", (function(_this) {
      return function() {
        if (_this.load > 0) {
          return _this.q.push({
            name: "endgroup"
          });
        }
        _this.errorGroups.pop();
        return _this.outPorts[_this.outPortName].endGroup();
      };
    })(this));
    this.inPorts[this.inPortName].on("disconnect", (function(_this) {
      return function() {
        if (_this.load > 0) {
          return _this.q.push({
            name: "disconnect"
          });
        }
        _this.outPorts[_this.outPortName].disconnect();
        _this.errorGroups = [];
        if (_this.outPorts.load.isAttached()) {
          return _this.outPorts.load.disconnect();
        }
      };
    })(this));
    this.inPorts[this.inPortName].on("data", (function(_this) {
      return function(data) {
        if (_this.q.length > 0) {
          return _this.q.push({
            name: "data",
            data: data
          });
        }
        return _this.processData(data);
      };
    })(this));
  }

  AsyncComponent.prototype.processData = function(data) {
    this.incrementLoad();
    return this.doAsync(data, (function(_this) {
      return function(err) {
        if (err) {
          _this.error(err, _this.errorGroups, _this.errPortName);
        }
        return _this.decrementLoad();
      };
    })(this));
  };

  AsyncComponent.prototype.incrementLoad = function() {
    this.load++;
    if (this.outPorts.load.isAttached()) {
      this.outPorts.load.send(this.load);
    }
    if (this.outPorts.load.isAttached()) {
      return this.outPorts.load.disconnect();
    }
  };

  AsyncComponent.prototype.doAsync = function(data, callback) {
    return callback(new Error("AsyncComponents must implement doAsync"));
  };

  AsyncComponent.prototype.decrementLoad = function() {
    if (this.load === 0) {
      throw new Error("load cannot be negative");
    }
    this.load--;
    if (this.outPorts.load.isAttached()) {
      this.outPorts.load.send(this.load);
    }
    if (this.outPorts.load.isAttached()) {
      this.outPorts.load.disconnect();
    }
    if (typeof process !== 'undefined' && process.execPath && process.execPath.indexOf('node') !== -1) {
      return process.nextTick((function(_this) {
        return function() {
          return _this.processQueue();
        };
      })(this));
    } else {
      return setTimeout((function(_this) {
        return function() {
          return _this.processQueue();
        };
      })(this), 0);
    }
  };

  AsyncComponent.prototype.processQueue = function() {
    var event, processedData;
    if (this.load > 0) {
      return;
    }
    processedData = false;
    while (this.q.length > 0) {
      event = this.q[0];
      switch (event.name) {
        case "begingroup":
          if (processedData) {
            return;
          }
          this.outPorts[this.outPortName].beginGroup(event.data);
          this.errorGroups.push(event.data);
          this.q.shift();
          break;
        case "endgroup":
          if (processedData) {
            return;
          }
          this.outPorts[this.outPortName].endGroup();
          this.errorGroups.pop();
          this.q.shift();
          break;
        case "disconnect":
          if (processedData) {
            return;
          }
          this.outPorts[this.outPortName].disconnect();
          if (this.outPorts.load.isAttached()) {
            this.outPorts.load.disconnect();
          }
          this.errorGroups = [];
          this.q.shift();
          break;
        case "data":
          this.processData(event.data);
          this.q.shift();
          processedData = true;
      }
    }
  };

  AsyncComponent.prototype.tearDown = function(callback) {
    this.q = [];
    this.errorGroups = [];
    return callback();
  };

  AsyncComponent.prototype.error = function(e, groups, errorPort) {
    var group, i, j, len, len1;
    if (groups == null) {
      groups = [];
    }
    if (errorPort == null) {
      errorPort = 'error';
    }
    if (this.outPorts[errorPort] && (this.outPorts[errorPort].isAttached() || !this.outPorts[errorPort].isRequired())) {
      for (i = 0, len = groups.length; i < len; i++) {
        group = groups[i];
        this.outPorts[errorPort].beginGroup(group);
      }
      this.outPorts[errorPort].send(e);
      for (j = 0, len1 = groups.length; j < len1; j++) {
        group = groups[j];
        this.outPorts[errorPort].endGroup();
      }
      this.outPorts[errorPort].disconnect();
      return;
    }
    throw e;
  };

  return AsyncComponent;

})(component.Component);

exports.AsyncComponent = AsyncComponent;

});
___scope___.file("lib/BasePort.coffee", function(exports, require, module, __filename, __dirname){ 

var BasePort, EventEmitter, validTypes,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

EventEmitter = require('events').EventEmitter;

validTypes = ['all', 'string', 'number', 'int', 'object', 'array', 'boolean', 'color', 'date', 'bang', 'function', 'buffer', 'stream'];

BasePort = (function(superClass) {
  extend(BasePort, superClass);

  function BasePort(options) {
    this.handleOptions(options);
    this.sockets = [];
    this.node = null;
    this.name = null;
  }

  BasePort.prototype.handleOptions = function(options) {
    if (!options) {
      options = {};
    }
    if (!options.datatype) {
      options.datatype = 'all';
    }
    if (options.required === void 0) {
      options.required = false;
    }
    if (options.datatype === 'integer') {
      options.datatype = 'int';
    }
    if (validTypes.indexOf(options.datatype) === -1) {
      throw new Error("Invalid port datatype '" + options.datatype + "' specified, valid are " + (validTypes.join(', ')));
    }
    if (options.type && options.type.indexOf('/') === -1) {
      throw new Error("Invalid port type '" + options.type + "' specified. Should be URL or MIME type");
    }
    return this.options = options;
  };

  BasePort.prototype.getId = function() {
    if (!(this.node && this.name)) {
      return 'Port';
    }
    return this.node + " " + (this.name.toUpperCase());
  };

  BasePort.prototype.getDataType = function() {
    return this.options.datatype;
  };

  BasePort.prototype.getDescription = function() {
    return this.options.description;
  };

  BasePort.prototype.attach = function(socket, index) {
    if (index == null) {
      index = null;
    }
    if (!this.isAddressable() || index === null) {
      index = this.sockets.length;
    }
    this.sockets[index] = socket;
    this.attachSocket(socket, index);
    if (this.isAddressable()) {
      this.emit('attach', socket, index);
      return;
    }
    return this.emit('attach', socket);
  };

  BasePort.prototype.attachSocket = function() {};

  BasePort.prototype.detach = function(socket) {
    var index;
    index = this.sockets.indexOf(socket);
    if (index === -1) {
      return;
    }
    this.sockets[index] = void 0;
    if (this.isAddressable()) {
      this.emit('detach', socket, index);
      return;
    }
    return this.emit('detach', socket);
  };

  BasePort.prototype.isAddressable = function() {
    if (this.options.addressable) {
      return true;
    }
    return false;
  };

  BasePort.prototype.isBuffered = function() {
    if (this.options.buffered) {
      return true;
    }
    return false;
  };

  BasePort.prototype.isRequired = function() {
    if (this.options.required) {
      return true;
    }
    return false;
  };

  BasePort.prototype.isAttached = function(socketId) {
    if (socketId == null) {
      socketId = null;
    }
    if (this.isAddressable() && socketId !== null) {
      if (this.sockets[socketId]) {
        return true;
      }
      return false;
    }
    if (this.sockets.length) {
      return true;
    }
    return false;
  };

  BasePort.prototype.listAttached = function() {
    var attached, i, idx, len, ref, socket;
    attached = [];
    ref = this.sockets;
    for (idx = i = 0, len = ref.length; i < len; idx = ++i) {
      socket = ref[idx];
      if (!socket) {
        continue;
      }
      attached.push(idx);
    }
    return attached;
  };

  BasePort.prototype.isConnected = function(socketId) {
    var connected;
    if (socketId == null) {
      socketId = null;
    }
    if (this.isAddressable()) {
      if (socketId === null) {
        throw new Error((this.getId()) + ": Socket ID required");
      }
      if (!this.sockets[socketId]) {
        throw new Error((this.getId()) + ": Socket " + socketId + " not available");
      }
      return this.sockets[socketId].isConnected();
    }
    connected = false;
    this.sockets.forEach(function(socket) {
      if (!socket) {
        return;
      }
      if (socket.isConnected()) {
        return connected = true;
      }
    });
    return connected;
  };

  BasePort.prototype.canAttach = function() {
    return true;
  };

  return BasePort;

})(EventEmitter);

module.exports = BasePort;

});
___scope___.file("lib/Component.coffee", function(exports, require, module, __filename, __dirname){ 

var Component, EventEmitter, IP, ProcessContext, ProcessInput, ProcessOutput, debug, debugBrackets, debugSend, ports,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  slice = [].slice;

EventEmitter = require('events').EventEmitter;

ports = require('./Ports');

IP = require('./IP');

debug = require('debug')('noflo:component');

debugBrackets = require('debug')('noflo:component:brackets');

debugSend = require('debug')('noflo:component:send');

Component = (function(superClass) {
  extend(Component, superClass);

  Component.prototype.description = '';

  Component.prototype.icon = null;

  function Component(options) {
    this.error = bind(this.error, this);
    var ref, ref1, ref2;
    if (!options) {
      options = {};
    }
    if (!options.inPorts) {
      options.inPorts = {};
    }
    if (options.inPorts instanceof ports.InPorts) {
      this.inPorts = options.inPorts;
    } else {
      this.inPorts = new ports.InPorts(options.inPorts);
    }
    if (!options.outPorts) {
      options.outPorts = {};
    }
    if (options.outPorts instanceof ports.OutPorts) {
      this.outPorts = options.outPorts;
    } else {
      this.outPorts = new ports.OutPorts(options.outPorts);
    }
    if (options.icon) {
      this.icon = options.icon;
    }
    if (options.description) {
      this.description = options.description;
    }
    this.started = false;
    this.load = 0;
    this.ordered = (ref = options.ordered) != null ? ref : false;
    this.autoOrdering = (ref1 = options.autoOrdering) != null ? ref1 : null;
    this.outputQ = [];
    this.bracketContext = {
      "in": {},
      out: {}
    };
    this.activateOnInput = (ref2 = options.activateOnInput) != null ? ref2 : true;
    this.forwardBrackets = {
      "in": ['out', 'error']
    };
    if ('forwardBrackets' in options) {
      this.forwardBrackets = options.forwardBrackets;
    }
    if (typeof options.process === 'function') {
      this.process(options.process);
    }
  }

  Component.prototype.getDescription = function() {
    return this.description;
  };

  Component.prototype.isReady = function() {
    return true;
  };

  Component.prototype.isSubgraph = function() {
    return false;
  };

  Component.prototype.setIcon = function(icon) {
    this.icon = icon;
    return this.emit('icon', this.icon);
  };

  Component.prototype.getIcon = function() {
    return this.icon;
  };

  Component.prototype.error = function(e, groups, errorPort, scope) {
    var group, i, j, len1, len2;
    if (groups == null) {
      groups = [];
    }
    if (errorPort == null) {
      errorPort = 'error';
    }
    if (scope == null) {
      scope = null;
    }
    if (this.outPorts[errorPort] && (this.outPorts[errorPort].isAttached() || !this.outPorts[errorPort].isRequired())) {
      for (i = 0, len1 = groups.length; i < len1; i++) {
        group = groups[i];
        this.outPorts[errorPort].openBracket(group, {
          scope: scope
        });
      }
      this.outPorts[errorPort].data(e, {
        scope: scope
      });
      for (j = 0, len2 = groups.length; j < len2; j++) {
        group = groups[j];
        this.outPorts[errorPort].closeBracket(group, {
          scope: scope
        });
      }
      return;
    }
    throw e;
  };

  Component.prototype.setUp = function(callback) {
    return callback();
  };

  Component.prototype.tearDown = function(callback) {
    return callback();
  };

  Component.prototype.start = function(callback) {
    if (this.isStarted()) {
      return callback();
    }
    return this.setUp((function(_this) {
      return function(err) {
        if (err) {
          return callback(err);
        }
        _this.started = true;
        _this.emit('start');
        return callback(null);
      };
    })(this));
  };

  Component.prototype.shutdown = function(callback) {
    var finalize;
    finalize = (function(_this) {
      return function() {
        var i, inPort, inPorts, len1;
        inPorts = _this.inPorts.ports || _this.inPorts;
        for (i = 0, len1 = inPorts.length; i < len1; i++) {
          inPort = inPorts[i];
          inPort.clear();
        }
        _this.bracketContext = {
          "in": {},
          out: {}
        };
        if (!_this.isStarted()) {
          return callback();
        }
        _this.started = false;
        _this.emit('end');
        return callback();
      };
    })(this);
    return this.tearDown((function(_this) {
      return function(err) {
        var checkLoad;
        if (err) {
          return callback(err);
        }
        if (_this.load > 0) {
          checkLoad = function(load) {
            if (load > 0) {
              return;
            }
            this.removeListener('deactivate', checkLoad);
            return finalize();
          };
          _this.on('deactivate', checkLoad);
          return;
        }
        return finalize();
      };
    })(this));
  };

  Component.prototype.isStarted = function() {
    return this.started;
  };

  Component.prototype.prepareForwarding = function() {
    var i, inPort, len1, outPort, outPorts, ref, results, tmp;
    ref = this.forwardBrackets;
    results = [];
    for (inPort in ref) {
      outPorts = ref[inPort];
      if (!(inPort in this.inPorts.ports)) {
        delete this.forwardBrackets[inPort];
        continue;
      }
      tmp = [];
      for (i = 0, len1 = outPorts.length; i < len1; i++) {
        outPort = outPorts[i];
        if (outPort in this.outPorts.ports) {
          tmp.push(outPort);
        }
      }
      if (tmp.length === 0) {
        results.push(delete this.forwardBrackets[inPort]);
      } else {
        results.push(this.forwardBrackets[inPort] = tmp);
      }
    }
    return results;
  };

  Component.prototype.isLegacy = function() {
    if (this.handle) {
      return false;
    }
    if (this._wpData) {
      return false;
    }
    return true;
  };

  Component.prototype.process = function(handle) {
    var fn, name, port, ref;
    if (typeof handle !== 'function') {
      throw new Error("Process handler must be a function");
    }
    if (!this.inPorts) {
      throw new Error("Component ports must be defined before process function");
    }
    this.prepareForwarding();
    this.handle = handle;
    ref = this.inPorts.ports;
    fn = (function(_this) {
      return function(name, port) {
        if (!port.name) {
          port.name = name;
        }
        return port.on('ip', function(ip) {
          return _this.handleIP(ip, port);
        });
      };
    })(this);
    for (name in ref) {
      port = ref[name];
      fn(name, port);
    }
    return this;
  };

  Component.prototype.isForwardingInport = function(port) {
    var portName;
    if (typeof port === 'string') {
      portName = port;
    } else {
      portName = port.name;
    }
    if (portName in this.forwardBrackets) {
      return true;
    }
    return false;
  };

  Component.prototype.isForwardingOutport = function(inport, outport) {
    var inportName, outportName;
    if (typeof inport === 'string') {
      inportName = inport;
    } else {
      inportName = inport.name;
    }
    if (typeof outport === 'string') {
      outportName = outport;
    } else {
      outportName = outport.name;
    }
    if (!this.forwardBrackets[inportName]) {
      return false;
    }
    if (this.forwardBrackets[inportName].indexOf(outportName) !== -1) {
      return true;
    }
    return false;
  };

  Component.prototype.isOrdered = function() {
    if (this.ordered) {
      return true;
    }
    if (this.autoOrdering) {
      return true;
    }
    return false;
  };

  Component.prototype.handleIP = function(ip, port) {
    var buf, context, dataPackets, e, input, output, result;
    if (!port.options.triggering) {
      return;
    }
    if (ip.type === 'openBracket' && this.autoOrdering === null && !this.ordered) {
      debug(this.nodeId + " port '" + port.name + "' entered auto-ordering mode");
      this.autoOrdering = true;
    }
    result = {};
    if (this.isForwardingInport(port)) {
      if (ip.type === 'openBracket') {
        return;
      }
      if (ip.type === 'closeBracket') {
        buf = port.getBuffer(ip.scope, ip.index);
        dataPackets = buf.filter(function(ip) {
          return ip.type === 'data';
        });
        if (this.outputQ.length >= this.load && dataPackets.length === 0) {
          if (buf[0] !== ip) {
            return;
          }
          port.get(ip.scope, ip.index);
          context = this.getBracketContext('in', port.name, ip.scope, ip.index).pop();
          context.closeIp = ip;
          debugBrackets(this.nodeId + " closeBracket-C from '" + context.source + "' to " + context.ports + ": '" + ip.data + "'");
          result = {
            __resolved: true,
            __bracketClosingAfter: [context]
          };
          this.outputQ.push(result);
          this.processOutputQueue();
        }
        if (!dataPackets.length) {
          return;
        }
      }
    }
    context = new ProcessContext(ip, this, port, result);
    input = new ProcessInput(this.inPorts, context);
    output = new ProcessOutput(this.outPorts, context);
    try {
      this.handle(input, output, context);
    } catch (error1) {
      e = error1;
      this.deactivate(context);
      output.sendDone(e);
    }
    if (context.activated) {
      return;
    }
    if (port.isAddressable()) {
      debug(this.nodeId + " packet on '" + port.name + "[" + ip.index + "]' didn't match preconditions: " + ip.type);
      return;
    }
    debug(this.nodeId + " packet on '" + port.name + "' didn't match preconditions: " + ip.type);
  };

  Component.prototype.getBracketContext = function(type, port, scope, idx) {
    var index, name, portsList, ref;
    ref = ports.normalizePortName(port), name = ref.name, index = ref.index;
    if (idx != null) {
      index = idx;
    }
    portsList = type === 'in' ? this.inPorts : this.outPorts;
    if (portsList[name].isAddressable()) {
      port = name + "[" + index + "]";
    }
    if (!this.bracketContext[type][port]) {
      this.bracketContext[type][port] = {};
    }
    if (!this.bracketContext[type][port][scope]) {
      this.bracketContext[type][port][scope] = [];
    }
    return this.bracketContext[type][port][scope];
  };

  Component.prototype.addToResult = function(result, port, ip, before) {
    var idx, index, method, name, ref;
    if (before == null) {
      before = false;
    }
    ref = ports.normalizePortName(port), name = ref.name, index = ref.index;
    method = before ? 'unshift' : 'push';
    if (this.outPorts[name].isAddressable()) {
      idx = index ? parseInt(index) : ip.index;
      if (!result[name]) {
        result[name] = {};
      }
      if (!result[name][idx]) {
        result[name][idx] = [];
      }
      ip.index = idx;
      result[name][idx][method](ip);
      return;
    }
    if (!result[name]) {
      result[name] = [];
    }
    return result[name][method](ip);
  };

  Component.prototype.getForwardableContexts = function(inport, outport, contexts) {
    var forwardable, index, name, ref;
    ref = ports.normalizePortName(outport), name = ref.name, index = ref.index;
    forwardable = [];
    contexts.forEach((function(_this) {
      return function(ctx, idx) {
        var outContext;
        if (!_this.isForwardingOutport(inport, name)) {
          return;
        }
        if (ctx.ports.indexOf(outport) !== -1) {
          return;
        }
        outContext = _this.getBracketContext('out', name, ctx.ip.scope, index)[idx];
        if (outContext) {
          if (outContext.ip.data === ctx.ip.data && outContext.ports.indexOf(outport) !== -1) {
            return;
          }
        }
        return forwardable.push(ctx);
      };
    })(this));
    return forwardable;
  };

  Component.prototype.addBracketForwards = function(result) {
    var context, i, ipClone, j, k, l, len1, len2, len3, len4, port, ref, ref1, ref2, ref3, ref4, ref5;
    if ((ref = result.__bracketClosingBefore) != null ? ref.length : void 0) {
      ref1 = result.__bracketClosingBefore;
      for (i = 0, len1 = ref1.length; i < len1; i++) {
        context = ref1[i];
        debugBrackets(this.nodeId + " closeBracket-A from '" + context.source + "' to " + context.ports + ": '" + context.closeIp.data + "'");
        if (!context.ports.length) {
          continue;
        }
        ref2 = context.ports;
        for (j = 0, len2 = ref2.length; j < len2; j++) {
          port = ref2[j];
          ipClone = context.closeIp.clone();
          this.addToResult(result, port, ipClone, true);
          this.getBracketContext('out', port, ipClone.scope).pop();
        }
      }
    }
    if (result.__bracketContext) {
      Object.keys(result.__bracketContext).reverse().forEach((function(_this) {
        return function(inport) {
          var ctx, datas, forwardedOpens, idx, idxIps, ip, ips, k, l, len3, len4, len5, m, outport, portIdentifier, results, unforwarded;
          context = result.__bracketContext[inport];
          if (!context.length) {
            return;
          }
          results = [];
          for (outport in result) {
            ips = result[outport];
            if (outport.indexOf('__') === 0) {
              continue;
            }
            if (_this.outPorts[outport].isAddressable()) {
              for (idx in ips) {
                idxIps = ips[idx];
                datas = idxIps.filter(function(ip) {
                  return ip.type === 'data';
                });
                if (!datas.length) {
                  continue;
                }
                portIdentifier = outport + "[" + idx + "]";
                unforwarded = _this.getForwardableContexts(inport, portIdentifier, context);
                if (!unforwarded.length) {
                  continue;
                }
                forwardedOpens = [];
                for (k = 0, len3 = unforwarded.length; k < len3; k++) {
                  ctx = unforwarded[k];
                  debugBrackets(_this.nodeId + " openBracket from '" + inport + "' to '" + portIdentifier + "': '" + ctx.ip.data + "'");
                  ipClone = ctx.ip.clone();
                  ipClone.index = parseInt(idx);
                  forwardedOpens.push(ipClone);
                  ctx.ports.push(portIdentifier);
                  _this.getBracketContext('out', outport, ctx.ip.scope, idx).push(ctx);
                }
                forwardedOpens.reverse();
                for (l = 0, len4 = forwardedOpens.length; l < len4; l++) {
                  ip = forwardedOpens[l];
                  _this.addToResult(result, outport, ip, true);
                }
              }
              continue;
            }
            datas = ips.filter(function(ip) {
              return ip.type === 'data';
            });
            if (!datas.length) {
              continue;
            }
            unforwarded = _this.getForwardableContexts(inport, outport, context);
            if (!unforwarded.length) {
              continue;
            }
            forwardedOpens = [];
            for (m = 0, len5 = unforwarded.length; m < len5; m++) {
              ctx = unforwarded[m];
              debugBrackets(_this.nodeId + " openBracket from '" + inport + "' to '" + outport + "': '" + ctx.ip.data + "'");
              forwardedOpens.push(ctx.ip.clone());
              ctx.ports.push(outport);
              _this.getBracketContext('out', outport, ctx.ip.scope).push(ctx);
            }
            forwardedOpens.reverse();
            results.push((function() {
              var len6, n, results1;
              results1 = [];
              for (n = 0, len6 = forwardedOpens.length; n < len6; n++) {
                ip = forwardedOpens[n];
                results1.push(this.addToResult(result, outport, ip, true));
              }
              return results1;
            }).call(_this));
          }
          return results;
        };
      })(this));
    }
    if ((ref3 = result.__bracketClosingAfter) != null ? ref3.length : void 0) {
      ref4 = result.__bracketClosingAfter;
      for (k = 0, len3 = ref4.length; k < len3; k++) {
        context = ref4[k];
        debugBrackets(this.nodeId + " closeBracket-B from '" + context.source + "' to " + context.ports + ": '" + context.closeIp.data + "'");
        if (!context.ports.length) {
          continue;
        }
        ref5 = context.ports;
        for (l = 0, len4 = ref5.length; l < len4; l++) {
          port = ref5[l];
          ipClone = context.closeIp.clone();
          this.addToResult(result, port, ipClone, false);
          this.getBracketContext('out', port, ipClone.scope).pop();
        }
      }
    }
    delete result.__bracketClosingBefore;
    delete result.__bracketContext;
    return delete result.__bracketClosingAfter;
  };

  Component.prototype.processOutputQueue = function() {
    var i, idx, idxIps, ip, ips, j, len1, len2, port, portIdentifier, result, results;
    results = [];
    while (this.outputQ.length > 0) {
      result = this.outputQ[0];
      if (!result.__resolved) {
        break;
      }
      this.addBracketForwards(result);
      for (port in result) {
        ips = result[port];
        if (port.indexOf('__') === 0) {
          continue;
        }
        if (this.outPorts.ports[port].isAddressable()) {
          for (idx in ips) {
            idxIps = ips[idx];
            idx = parseInt(idx);
            if (!this.outPorts.ports[port].isAttached(idx)) {
              continue;
            }
            for (i = 0, len1 = idxIps.length; i < len1; i++) {
              ip = idxIps[i];
              portIdentifier = port + "[" + ip.index + "]";
              if (ip.type === 'openBracket') {
                debugSend(this.nodeId + " sending " + portIdentifier + " < '" + ip.data + "'");
              } else if (ip.type === 'closeBracket') {
                debugSend(this.nodeId + " sending " + portIdentifier + " > '" + ip.data + "'");
              } else {
                debugSend(this.nodeId + " sending " + portIdentifier + " DATA");
              }
              this.outPorts[port].sendIP(ip);
            }
          }
          continue;
        }
        if (!this.outPorts.ports[port].isAttached()) {
          continue;
        }
        for (j = 0, len2 = ips.length; j < len2; j++) {
          ip = ips[j];
          portIdentifier = port;
          if (ip.type === 'openBracket') {
            debugSend(this.nodeId + " sending " + portIdentifier + " < '" + ip.data + "'");
          } else if (ip.type === 'closeBracket') {
            debugSend(this.nodeId + " sending " + portIdentifier + " > '" + ip.data + "'");
          } else {
            debugSend(this.nodeId + " sending " + portIdentifier + " DATA");
          }
          this.outPorts[port].sendIP(ip);
        }
      }
      results.push(this.outputQ.shift());
    }
    return results;
  };

  Component.prototype.activate = function(context) {
    if (context.activated) {
      return;
    }
    context.activated = true;
    context.deactivated = false;
    this.load++;
    this.emit('activate', this.load);
    if (this.ordered || this.autoOrdering) {
      return this.outputQ.push(context.result);
    }
  };

  Component.prototype.deactivate = function(context) {
    if (context.deactivated) {
      return;
    }
    context.deactivated = true;
    context.activated = false;
    if (this.isOrdered()) {
      this.processOutputQueue();
    }
    this.load--;
    return this.emit('deactivate', this.load);
  };

  return Component;

})(EventEmitter);

exports.Component = Component;

ProcessContext = (function() {
  function ProcessContext(ip1, nodeInstance, port1, result1) {
    this.ip = ip1;
    this.nodeInstance = nodeInstance;
    this.port = port1;
    this.result = result1;
    this.scope = this.ip.scope;
    this.activated = false;
    this.deactivated = false;
  }

  ProcessContext.prototype.activate = function() {
    if (this.result.__resolved || this.nodeInstance.outputQ.indexOf(this.result) === -1) {
      this.result = {};
    }
    return this.nodeInstance.activate(this);
  };

  ProcessContext.prototype.deactivate = function() {
    if (!this.result.__resolved) {
      this.result.__resolved = true;
    }
    return this.nodeInstance.deactivate(this);
  };

  return ProcessContext;

})();

ProcessInput = (function() {
  function ProcessInput(ports1, context1) {
    this.ports = ports1;
    this.context = context1;
    this.nodeInstance = this.context.nodeInstance;
    this.ip = this.context.ip;
    this.port = this.context.port;
    this.result = this.context.result;
    this.scope = this.context.scope;
  }

  ProcessInput.prototype.activate = function() {
    if (this.context.activated) {
      return;
    }
    if (this.nodeInstance.isOrdered()) {
      this.result.__resolved = false;
    }
    this.nodeInstance.activate(this.context);
    if (this.port.isAddressable()) {
      return debug(this.nodeInstance.nodeId + " packet on '" + this.port.name + "[" + this.ip.index + "]' caused activation " + this.nodeInstance.load + ": " + this.ip.type);
    } else {
      return debug(this.nodeInstance.nodeId + " packet on '" + this.port.name + "' caused activation " + this.nodeInstance.load + ": " + this.ip.type);
    }
  };

  ProcessInput.prototype.attached = function() {
    var args, i, len1, port, res;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    if (!args.length) {
      args = ['in'];
    }
    res = [];
    for (i = 0, len1 = args.length; i < len1; i++) {
      port = args[i];
      res.push(this.ports[port].listAttached());
    }
    if (args.length === 1) {
      return res.pop();
    }
    return res;
  };

  ProcessInput.prototype.has = function() {
    var args, i, len1, port, validate;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    if (!args.length) {
      args = ['in'];
    }
    if (typeof args[args.length - 1] === 'function') {
      validate = args.pop();
    } else {
      validate = function() {
        return true;
      };
    }
    for (i = 0, len1 = args.length; i < len1; i++) {
      port = args[i];
      if (Array.isArray(port)) {
        if (!this.ports[port[0]].isAddressable()) {
          throw new Error("Non-addressable ports, access must be with string " + port[0]);
        }
        if (!this.ports[port[0]].has(this.scope, port[1], validate)) {
          return false;
        }
        continue;
      }
      if (this.ports[port].isAddressable()) {
        throw new Error("For addressable ports, access must be with array [" + port + ", idx]");
      }
      if (!this.ports[port].has(this.scope, validate)) {
        return false;
      }
    }
    return true;
  };

  ProcessInput.prototype.hasData = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    if (!args.length) {
      args = ['in'];
    }
    args.push(function(ip) {
      return ip.type === 'data';
    });
    return this.has.apply(this, args);
  };

  ProcessInput.prototype.hasStream = function() {
    var args, dataBrackets, hasData, i, len1, port, portBrackets, validate, validateStream;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    if (!args.length) {
      args = ['in'];
    }
    if (typeof args[args.length - 1] === 'function') {
      validateStream = args.pop();
    } else {
      validateStream = function() {
        return true;
      };
    }
    for (i = 0, len1 = args.length; i < len1; i++) {
      port = args[i];
      portBrackets = [];
      dataBrackets = [];
      hasData = false;
      validate = function(ip) {
        if (ip.type === 'openBracket') {
          portBrackets.push(ip.data);
          return false;
        }
        if (ip.type === 'data') {
          hasData = validateStream(ip, portBrackets);
          if (!portBrackets.length) {
            return hasData;
          }
          return false;
        }
        if (ip.type === 'closeBracket') {
          portBrackets.pop();
          if (portBrackets.length) {
            return false;
          }
          if (!hasData) {
            return false;
          }
          return true;
        }
      };
      if (!this.has(port, validate)) {
        return false;
      }
    }
    return true;
  };

  ProcessInput.prototype.get = function() {
    var args, i, idx, ip, len1, port, portname, res;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    this.activate();
    if (!args.length) {
      args = ['in'];
    }
    res = [];
    for (i = 0, len1 = args.length; i < len1; i++) {
      port = args[i];
      if (Array.isArray(port)) {
        portname = port[0], idx = port[1];
        if (!this.ports[portname].isAddressable()) {
          throw new Error('Non-addressable ports, access must be with string portname');
        }
      } else {
        portname = port;
        if (this.ports[portname].isAddressable()) {
          throw new Error('For addressable ports, access must be with array [portname, idx]');
        }
      }
      if (this.nodeInstance.isForwardingInport(portname)) {
        ip = this.__getForForwarding(portname, idx);
        res.push(ip);
        continue;
      }
      ip = this.ports[portname].get(this.scope, idx);
      res.push(ip);
    }
    if (args.length === 1) {
      return res[0];
    } else {
      return res;
    }
  };

  ProcessInput.prototype.__getForForwarding = function(port, idx) {
    var context, dataIp, i, ip, len1, prefix;
    prefix = [];
    dataIp = null;
    while (true) {
      ip = this.ports[port].get(this.scope, idx);
      if (!ip) {
        break;
      }
      if (ip.type === 'data') {
        dataIp = ip;
        break;
      }
      prefix.push(ip);
    }
    for (i = 0, len1 = prefix.length; i < len1; i++) {
      ip = prefix[i];
      if (ip.type === 'closeBracket') {
        if (!this.result.__bracketClosingBefore) {
          this.result.__bracketClosingBefore = [];
        }
        context = this.nodeInstance.getBracketContext('in', port, this.scope, idx).pop();
        context.closeIp = ip;
        this.result.__bracketClosingBefore.push(context);
        continue;
      }
      if (ip.type === 'openBracket') {
        this.nodeInstance.getBracketContext('in', port, this.scope, idx).push({
          ip: ip,
          ports: [],
          source: port
        });
        continue;
      }
    }
    if (!this.result.__bracketContext) {
      this.result.__bracketContext = {};
    }
    this.result.__bracketContext[port] = this.nodeInstance.getBracketContext('in', port, this.scope, idx).slice(0);
    return dataIp;
  };

  ProcessInput.prototype.getData = function() {
    var args, datas, i, len1, packet, port;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    if (!args.length) {
      args = ['in'];
    }
    datas = [];
    for (i = 0, len1 = args.length; i < len1; i++) {
      port = args[i];
      packet = this.get(port);
      if (packet == null) {
        datas.push(packet);
        continue;
      }
      while (packet.type !== 'data') {
        packet = this.get(port);
        if (!packet) {
          break;
        }
      }
      datas.push(packet.data);
    }
    if (args.length === 1) {
      return datas.pop();
    }
    return datas;
  };

  ProcessInput.prototype.getStream = function() {
    var args, datas, hasData, i, ip, len1, port, portBrackets, portPackets;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    if (!args.length) {
      args = ['in'];
    }
    datas = [];
    for (i = 0, len1 = args.length; i < len1; i++) {
      port = args[i];
      portBrackets = [];
      portPackets = [];
      hasData = false;
      ip = this.get(port);
      if (!ip) {
        datas.push(void 0);
      }
      while (ip) {
        if (ip.type === 'openBracket') {
          if (!portBrackets.length) {
            portPackets = [];
            hasData = false;
          }
          portBrackets.push(ip.data);
          portPackets.push(ip);
        }
        if (ip.type === 'data') {
          portPackets.push(ip);
          hasData = true;
          if (!portBrackets.length) {
            break;
          }
        }
        if (ip.type === 'closeBracket') {
          portPackets.push(ip);
          portBrackets.pop();
          if (hasData && !portBrackets.length) {
            break;
          }
        }
        ip = this.get(port);
      }
      datas.push(portPackets);
    }
    if (args.length === 1) {
      return datas.pop();
    }
    return datas;
  };

  return ProcessInput;

})();

ProcessOutput = (function() {
  function ProcessOutput(ports1, context1) {
    this.ports = ports1;
    this.context = context1;
    this.nodeInstance = this.context.nodeInstance;
    this.ip = this.context.ip;
    this.result = this.context.result;
    this.scope = this.context.scope;
  }

  ProcessOutput.prototype.isError = function(err) {
    return err instanceof Error || Array.isArray(err) && err.length > 0 && err[0] instanceof Error;
  };

  ProcessOutput.prototype.error = function(err) {
    var e, i, j, len1, len2, multiple, results;
    multiple = Array.isArray(err);
    if (!multiple) {
      err = [err];
    }
    if ('error' in this.ports && (this.ports.error.isAttached() || !this.ports.error.isRequired())) {
      if (multiple) {
        this.sendIP('error', new IP('openBracket'));
      }
      for (i = 0, len1 = err.length; i < len1; i++) {
        e = err[i];
        this.sendIP('error', e);
      }
      if (multiple) {
        return this.sendIP('error', new IP('closeBracket'));
      }
    } else {
      results = [];
      for (j = 0, len2 = err.length; j < len2; j++) {
        e = err[j];
        throw e;
      }
      return results;
    }
  };

  ProcessOutput.prototype.sendIP = function(port, packet) {
    var ip;
    if (!IP.isIP(packet)) {
      ip = new IP('data', packet);
    } else {
      ip = packet;
    }
    if (this.scope !== null && ip.scope === null) {
      ip.scope = this.scope;
    }
    if (this.nodeInstance.outPorts[port].isAddressable() && ip.index === null) {
      throw new Error('Sending packets to addressable ports requires specifying index');
    }
    if (this.nodeInstance.isOrdered()) {
      this.nodeInstance.addToResult(this.result, port, ip);
      return;
    }
    return this.nodeInstance.outPorts[port].sendIP(ip);
  };

  ProcessOutput.prototype.send = function(outputMap) {
    var componentPorts, i, len1, mapIsInPorts, packet, port, ref, results;
    if (this.isError(outputMap)) {
      return this.error(outputMap);
    }
    componentPorts = [];
    mapIsInPorts = false;
    ref = Object.keys(this.ports.ports);
    for (i = 0, len1 = ref.length; i < len1; i++) {
      port = ref[i];
      if (port !== 'error' && port !== 'ports' && port !== '_callbacks') {
        componentPorts.push(port);
      }
      if (!mapIsInPorts && (outputMap != null) && typeof outputMap === 'object' && Object.keys(outputMap).indexOf(port) !== -1) {
        mapIsInPorts = true;
      }
    }
    if (componentPorts.length === 1 && !mapIsInPorts) {
      this.sendIP(componentPorts[0], outputMap);
      return;
    }
    if (componentPorts.length > 1 && !mapIsInPorts) {
      throw new Error('Port must be specified for sending output');
    }
    results = [];
    for (port in outputMap) {
      packet = outputMap[port];
      results.push(this.sendIP(port, packet));
    }
    return results;
  };

  ProcessOutput.prototype.sendDone = function(outputMap) {
    this.send(outputMap);
    return this.done();
  };

  ProcessOutput.prototype.pass = function(data, options) {
    var key, val;
    if (options == null) {
      options = {};
    }
    if (!('out' in this.ports)) {
      throw new Error('output.pass() requires port "out" to be present');
    }
    for (key in options) {
      val = options[key];
      this.ip[key] = val;
    }
    this.ip.data = data;
    this.sendIP('out', this.ip);
    return this.done();
  };

  ProcessOutput.prototype.done = function(error) {
    var buf, context, contexts, ctx, ip, isLast, nodeContext, port, ref;
    this.result.__resolved = true;
    this.nodeInstance.activate(this.context);
    if (error) {
      this.error(error);
    }
    isLast = (function(_this) {
      return function() {
        var len, load, pos, resultsOnly;
        resultsOnly = _this.nodeInstance.outputQ.filter(function(q) {
          if (!q.__resolved) {
            return true;
          }
          if (Object.keys(q).length === 2 && q.__bracketClosingAfter) {
            return false;
          }
          return true;
        });
        pos = resultsOnly.indexOf(_this.result);
        len = resultsOnly.length;
        load = _this.nodeInstance.load;
        if (pos === len - 1) {
          return true;
        }
        if (pos === -1 && load === len + 1) {
          return true;
        }
        if (len <= 1 && load === 1) {
          return true;
        }
        return false;
      };
    })(this);
    if (this.nodeInstance.isOrdered() && isLast()) {
      ref = this.nodeInstance.bracketContext["in"];
      for (port in ref) {
        contexts = ref[port];
        if (!contexts[this.scope]) {
          continue;
        }
        nodeContext = contexts[this.scope];
        if (!nodeContext.length) {
          continue;
        }
        context = nodeContext[nodeContext.length - 1];
        buf = this.nodeInstance.inPorts[context.source].getBuffer(context.ip.scope, context.ip.index);
        while (true) {
          if (!buf.length) {
            break;
          }
          if (buf[0].type !== 'closeBracket') {
            break;
          }
          ip = this.nodeInstance.inPorts[context.source].get(context.ip.scope, context.ip.index);
          ctx = nodeContext.pop();
          ctx.closeIp = ip;
          if (!this.result.__bracketClosingAfter) {
            this.result.__bracketClosingAfter = [];
          }
          this.result.__bracketClosingAfter.push(ctx);
        }
      }
    }
    debug(this.nodeInstance.nodeId + " finished processing " + this.nodeInstance.load);
    return this.nodeInstance.deactivate(this.context);
  };

  return ProcessOutput;

})();

});
___scope___.file("lib/ComponentLoader.coffee", function(exports, require, module, __filename, __dirname){ 

var ComponentLoader, EventEmitter, fbpGraph, internalSocket, registerLoader,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

internalSocket = require('./InternalSocket');

fbpGraph = require('fbp-graph');

EventEmitter = require('events').EventEmitter;

registerLoader = require('./loader/register');

ComponentLoader = (function(superClass) {
  extend(ComponentLoader, superClass);

  function ComponentLoader(baseDir, options) {
    this.baseDir = baseDir;
    this.options = options != null ? options : {};
    this.components = null;
    this.libraryIcons = {};
    this.processing = false;
    this.ready = false;
    if (typeof this.setMaxListeners === 'function') {
      this.setMaxListeners(0);
    }
  }

  ComponentLoader.prototype.getModulePrefix = function(name) {
    if (!name) {
      return '';
    }
    if (name === 'noflo') {
      return '';
    }
    if (name[0] === '@') {
      name = name.replace(/\@[a-z\-]+\//, '');
    }
    return name.replace('noflo-', '');
  };

  ComponentLoader.prototype.listComponents = function(callback) {
    if (this.processing) {
      this.once('ready', (function(_this) {
        return function() {
          return callback(null, _this.components);
        };
      })(this));
      return;
    }
    if (this.components) {
      return callback(null, this.components);
    }
    this.ready = false;
    this.processing = true;
    this.components = {};
    registerLoader.register(this, (function(_this) {
      return function(err) {
        if (err) {
          if (callback) {
            return callback(err);
          }
          throw err;
        }
        _this.processing = false;
        _this.ready = true;
        _this.emit('ready', true);
        if (callback) {
          return callback(null, _this.components);
        }
      };
    })(this));
  };

  ComponentLoader.prototype.load = function(name, callback, metadata) {
    var component, componentName;
    if (!this.ready) {
      this.listComponents((function(_this) {
        return function(err) {
          if (err) {
            return callback(err);
          }
          return _this.load(name, callback, metadata);
        };
      })(this));
      return;
    }
    component = this.components[name];
    if (!component) {
      for (componentName in this.components) {
        if (componentName.split('/')[1] === name) {
          component = this.components[componentName];
          break;
        }
      }
      if (!component) {
        callback(new Error("Component " + name + " not available with base " + this.baseDir));
        return;
      }
    }
    if (this.isGraph(component)) {
      if (typeof process !== 'undefined' && process.execPath && process.execPath.indexOf('node') !== -1) {
        process.nextTick((function(_this) {
          return function() {
            return _this.loadGraph(name, component, callback, metadata);
          };
        })(this));
      } else {
        setTimeout((function(_this) {
          return function() {
            return _this.loadGraph(name, component, callback, metadata);
          };
        })(this), 0);
      }
      return;
    }
    return this.createComponent(name, component, metadata, (function(_this) {
      return function(err, instance) {
        if (err) {
          return callback(err);
        }
        if (!instance) {
          callback(new Error("Component " + name + " could not be loaded."));
          return;
        }
        if (name === 'Graph') {
          instance.baseDir = _this.baseDir;
        }
        if (typeof name === 'string') {
          instance.componentName = name;
        }
        _this.setIcon(name, instance);
        return callback(null, instance);
      };
    })(this));
  };

  ComponentLoader.prototype.createComponent = function(name, component, metadata, callback) {
    var implementation, instance;
    implementation = component;
    if (!implementation) {
      return callback(new Error("Component " + name + " not available"));
    }
    if (typeof implementation === 'string') {
      if (typeof registerLoader.dynamicLoad === 'function') {
        registerLoader.dynamicLoad(name, implementation, metadata, callback);
        return;
      }
      return callback(Error("Dynamic loading of " + implementation + " for component " + name + " not available on this platform."));
    }
    if (typeof implementation.getComponent === 'function') {
      instance = implementation.getComponent(metadata);
    } else if (typeof implementation === 'function') {
      instance = implementation(metadata);
    } else {
      callback(new Error("Invalid type " + (typeof implementation) + " for component " + name + "."));
      return;
    }
    return callback(null, instance);
  };

  ComponentLoader.prototype.isGraph = function(cPath) {
    if (typeof cPath === 'object' && cPath instanceof fbpGraph.Graph) {
      return true;
    }
    if (typeof cPath === 'object' && cPath.processes && cPath.connections) {
      return true;
    }
    if (typeof cPath !== 'string') {
      return false;
    }
    return cPath.indexOf('.fbp') !== -1 || cPath.indexOf('.json') !== -1;
  };

  ComponentLoader.prototype.loadGraph = function(name, component, callback, metadata) {
    return this.createComponent(name, this.components['Graph'], metadata, (function(_this) {
      return function(err, graph) {
        var graphSocket;
        if (err) {
          return callback(err);
        }
        graphSocket = internalSocket.createSocket();
        graph.loader = _this;
        graph.baseDir = _this.baseDir;
        graph.inPorts.graph.attach(graphSocket);
        graphSocket.send(component);
        graphSocket.disconnect();
        graph.inPorts.remove('graph');
        _this.setIcon(name, graph);
        return callback(null, graph);
      };
    })(this));
  };

  ComponentLoader.prototype.setIcon = function(name, instance) {
    var componentName, library, ref;
    if (!instance.getIcon || instance.getIcon()) {
      return;
    }
    ref = name.split('/'), library = ref[0], componentName = ref[1];
    if (componentName && this.getLibraryIcon(library)) {
      instance.setIcon(this.getLibraryIcon(library));
      return;
    }
    if (instance.isSubgraph()) {
      instance.setIcon('sitemap');
      return;
    }
    instance.setIcon('square');
  };

  ComponentLoader.prototype.getLibraryIcon = function(prefix) {
    if (this.libraryIcons[prefix]) {
      return this.libraryIcons[prefix];
    }
    return null;
  };

  ComponentLoader.prototype.setLibraryIcon = function(prefix, icon) {
    return this.libraryIcons[prefix] = icon;
  };

  ComponentLoader.prototype.normalizeName = function(packageId, name) {
    var fullName, prefix;
    prefix = this.getModulePrefix(packageId);
    fullName = prefix + "/" + name;
    if (!packageId) {
      fullName = name;
    }
    return fullName;
  };

  ComponentLoader.prototype.registerComponent = function(packageId, name, cPath, callback) {
    var fullName;
    fullName = this.normalizeName(packageId, name);
    this.components[fullName] = cPath;
    if (callback) {
      return callback();
    }
  };

  ComponentLoader.prototype.registerGraph = function(packageId, name, gPath, callback) {
    return this.registerComponent(packageId, name, gPath, callback);
  };

  ComponentLoader.prototype.registerLoader = function(loader, callback) {
    return loader(this, callback);
  };

  ComponentLoader.prototype.setSource = function(packageId, name, source, language, callback) {
    if (!registerLoader.setSource) {
      return callback(new Error('setSource not allowed'));
    }
    if (!this.ready) {
      this.listComponents((function(_this) {
        return function(err) {
          if (err) {
            return callback(err);
          }
          return _this.setSource(packageId, name, source, language, callback);
        };
      })(this));
      return;
    }
    return registerLoader.setSource(this, packageId, name, source, language, callback);
  };

  ComponentLoader.prototype.getSource = function(name, callback) {
    if (!registerLoader.getSource) {
      return callback(new Error('getSource not allowed'));
    }
    if (!this.ready) {
      this.listComponents((function(_this) {
        return function(err) {
          if (err) {
            return callback(err);
          }
          return _this.getSource(name, callback);
        };
      })(this));
      return;
    }
    return registerLoader.getSource(this, name, callback);
  };

  ComponentLoader.prototype.clear = function() {
    this.components = null;
    this.ready = false;
    return this.processing = false;
  };

  return ComponentLoader;

})(EventEmitter);

exports.ComponentLoader = ComponentLoader;

});
___scope___.file("lib/Helpers.coffee", function(exports, require, module, __filename, __dirname){ 

var IP, InternalSocket, OutPortWrapper, StreamReceiver, StreamSender, checkDeprecation, checkWirePatternPreconditions, checkWirePatternPreconditionsInput, checkWirePatternPreconditionsParams, debug, getGroupContext, getInputData, getOutputProxy, handleInputCollation, isArray, legacyWirePattern, platform, populateParams, processApiWirePattern, reorderBuffer, setupBracketForwarding, setupControlPorts, setupErrorHandler, setupSendDefaults, utils,
  slice = [].slice,
  hasProp = {}.hasOwnProperty;

StreamSender = require('./Streams').StreamSender;

StreamReceiver = require('./Streams').StreamReceiver;

InternalSocket = require('./InternalSocket');

IP = require('./IP');

platform = require('./Platform');

utils = require('./Utils');

debug = require('debug')('noflo:helpers');

isArray = function(obj) {
  if (Array.isArray) {
    return Array.isArray(obj);
  }
  return Object.prototype.toString.call(arg) === '[object Array]';
};

exports.MapComponent = function(component, func, config) {
  platform.deprecated('noflo.helpers.MapComponent is deprecated. Please port to Process API');
  if (!config) {
    config = {};
  }
  if (!config.inPort) {
    config.inPort = 'in';
  }
  if (!config.outPort) {
    config.outPort = 'out';
  }
  if (!component.forwardBrackets) {
    component.forwardBrackets = {};
  }
  component.forwardBrackets[config.inPort] = [config.outPort];
  return component.process(function(input, output) {
    var data, groups, outProxy;
    if (!input.hasData(config.inPort)) {
      return;
    }
    data = input.getData(config.inPort);
    groups = getGroupContext(component, config.inPort, input);
    outProxy = getOutputProxy([config.outPort], output);
    func(data, groups, outProxy);
    return output.done();
  });
};

exports.WirePattern = function(component, config, proc) {
  var inPorts, outPorts, ref, setup;
  inPorts = 'in' in config ? config["in"] : 'in';
  if (!isArray(inPorts)) {
    inPorts = [inPorts];
  }
  outPorts = 'out' in config ? config.out : 'out';
  if (!isArray(outPorts)) {
    outPorts = [outPorts];
  }
  if (!('error' in config)) {
    config.error = 'error';
  }
  if (!('async' in config)) {
    config.async = false;
  }
  if (!('ordered' in config)) {
    config.ordered = true;
  }
  if (!('group' in config)) {
    config.group = false;
  }
  if (!('field' in config)) {
    config.field = null;
  }
  if (!('forwardGroups' in config)) {
    config.forwardGroups = false;
  }
  if (config.forwardGroups) {
    if (typeof config.forwardGroups === 'string') {
      config.forwardGroups = [config.forwardGroups];
    }
    if (typeof config.forwardGroups === 'boolean') {
      config.forwardGroups = inPorts;
    }
  }
  if (!('receiveStreams' in config)) {
    config.receiveStreams = false;
  }
  if (config.receiveStreams) {
    throw new Error('WirePattern receiveStreams is deprecated');
  }
  if (!('sendStreams' in config)) {
    config.sendStreams = false;
  }
  if (config.sendStreams) {
    throw new Error('WirePattern sendStreams is deprecated');
  }
  if (config.async) {
    config.sendStreams = outPorts;
  }
  if (!('params' in config)) {
    config.params = [];
  }
  if (typeof config.params === 'string') {
    config.params = [config.params];
  }
  if (!('name' in config)) {
    config.name = '';
  }
  if (!('dropInput' in config)) {
    config.dropInput = false;
  }
  if (!('arrayPolicy' in config)) {
    config.arrayPolicy = {
      "in": 'any',
      params: 'all'
    };
  }
  config.inPorts = inPorts;
  config.outPorts = outPorts;
  checkDeprecation(config, proc);
  if (config.legacy || (typeof process !== "undefined" && process !== null ? (ref = process.env) != null ? ref.NOFLO_WIREPATTERN_LEGACY : void 0 : void 0)) {
    platform.deprecated('noflo.helpers.WirePattern legacy mode is deprecated');
    setup = legacyWirePattern;
  } else {
    setup = processApiWirePattern;
  }
  return setup(component, config, proc);
};

processApiWirePattern = function(component, config, func) {
  setupControlPorts(component, config);
  setupSendDefaults(component);
  setupBracketForwarding(component, config);
  component.ordered = config.ordered;
  return component.process(function(input, output, context) {
    var data, errorHandler, groups, outProxy, postpone, resume;
    if (!checkWirePatternPreconditions(config, input, output)) {
      return;
    }
    component.params = populateParams(config, input);
    data = getInputData(config, input);
    groups = getGroupContext(component, config.inPorts[0], input);
    if (groups.length > 3) {
      process.exit(0);
    }
    outProxy = getOutputProxy(config.outPorts, output);
    debug("WirePattern Process API call with", data, groups, component.params, context.scope);
    postpone = function() {
      throw new Error('noflo.helpers.WirePattern postpone is deprecated');
    };
    resume = function() {
      throw new Error('noflo.helpers.WirePattern resume is deprecated');
    };
    if (!config.async) {
      errorHandler = setupErrorHandler(component, config, output);
      func.call(component, data, groups, outProxy, postpone, resume, input.scope);
      if (output.result.__resolved) {
        return;
      }
      errorHandler();
      output.done();
      return;
    }
    errorHandler = setupErrorHandler(component, config, output);
    return func.call(component, data, groups, outProxy, function(err) {
      errorHandler();
      return output.done(err);
    }, postpone, resume, input.scope);
  });
};

checkDeprecation = function(config, func) {
  if (config.group) {
    platform.deprecated('noflo.helpers.WirePattern group option is deprecated. Please port to Process API');
  }
  if (config.field) {
    platform.deprecated('noflo.helpers.WirePattern field option is deprecated. Please port to Process API');
  }
  if (func.length > 4) {
    platform.deprecated('noflo.helpers.WirePattern postpone and resume are deprecated. Please port to Process API');
  }
  if (!config.async) {
    platform.deprecated('noflo.helpers.WirePattern synchronous is deprecated. Please port to Process API');
  }
};

setupControlPorts = function(component, config) {
  var j, len, param, ref, results;
  ref = config.params;
  results = [];
  for (j = 0, len = ref.length; j < len; j++) {
    param = ref[j];
    results.push(component.inPorts[param].options.control = true);
  }
  return results;
};

setupBracketForwarding = function(component, config) {
  var inPort, inPorts, j, k, len, len1, outPort, ref;
  component.forwardBrackets = {};
  if (!config.forwardGroups) {
    return;
  }
  inPorts = config.inPorts;
  if (isArray(config.forwardGroups)) {
    inPorts = config.forwardGroups;
  }
  for (j = 0, len = inPorts.length; j < len; j++) {
    inPort = inPorts[j];
    component.forwardBrackets[inPort] = [];
    ref = config.outPorts;
    for (k = 0, len1 = ref.length; k < len1; k++) {
      outPort = ref[k];
      component.forwardBrackets[inPort].push(outPort);
    }
    if (component.outPorts.error) {
      component.forwardBrackets[inPort].push('error');
    }
  }
};

setupErrorHandler = function(component, config, output) {
  var errorHandler, errors, failHandler, sendErrors;
  errors = [];
  errorHandler = function(e, groups) {
    if (groups == null) {
      groups = [];
    }
    platform.deprecated('noflo.helpers.WirePattern error method is deprecated. Please send error to callback instead');
    errors.push({
      err: e,
      groups: groups
    });
    return component.hasErrors = true;
  };
  failHandler = function(e, groups) {
    if (e == null) {
      e = null;
    }
    if (groups == null) {
      groups = [];
    }
    platform.deprecated('noflo.helpers.WirePattern fail method is deprecated. Please send error to callback instead');
    if (e) {
      errorHandler(e, groups);
    }
    sendErrors();
    return output.done();
  };
  sendErrors = function() {
    if (!errors.length) {
      return;
    }
    if (config.name) {
      output.sendIP('error', new IP('openBracket', config.name));
    }
    errors.forEach(function(e) {
      var grp, j, k, len, len1, ref, ref1, results;
      ref = e.groups;
      for (j = 0, len = ref.length; j < len; j++) {
        grp = ref[j];
        output.sendIP('error', new IP('openBracket', grp));
      }
      output.sendIP('error', new IP('data', e.err));
      ref1 = e.groups;
      results = [];
      for (k = 0, len1 = ref1.length; k < len1; k++) {
        grp = ref1[k];
        results.push(output.sendIP('error', new IP('closeBracket', grp)));
      }
      return results;
    });
    if (config.name) {
      output.sendIP('error', new IP('closeBracket', config.name));
    }
    component.hasErrors = false;
    return errors = [];
  };
  component.hasErrors = false;
  component.error = errorHandler;
  component.fail = failHandler;
  return sendErrors;
};

setupSendDefaults = function(component) {
  var portsWithDefaults;
  portsWithDefaults = Object.keys(component.inPorts.ports).filter(function(p) {
    if (!component.inPorts[p].options.control) {
      return false;
    }
    if (!component.inPorts[p].hasDefault()) {
      return false;
    }
    return true;
  });
  return component.sendDefaults = function() {
    platform.deprecated('noflo.helpers.WirePattern sendDefaults method is deprecated. Please start with a Network');
    return portsWithDefaults.forEach(function(port) {
      var tempSocket;
      tempSocket = InternalSocket.createSocket();
      component.inPorts[port].attach(tempSocket);
      tempSocket.send();
      tempSocket.disconnect();
      return component.inPorts[port].detach(tempSocket);
    });
  };
};

populateParams = function(config, input) {
  var idx, j, k, len, len1, paramPort, params, ref, ref1;
  if (!config.params.length) {
    return;
  }
  params = {};
  ref = config.params;
  for (j = 0, len = ref.length; j < len; j++) {
    paramPort = ref[j];
    if (input.ports[paramPort].isAddressable()) {
      params[paramPort] = {};
      ref1 = input.attached(paramPort);
      for (k = 0, len1 = ref1.length; k < len1; k++) {
        idx = ref1[k];
        if (!input.hasData([paramPort, idx])) {
          continue;
        }
        params[paramPort][idx] = input.getData([paramPort, idx]);
      }
      continue;
    }
    params[paramPort] = input.getData(paramPort);
  }
  return params;
};

reorderBuffer = function(buffer, matcher) {
  var brackets, idx, ip, j, k, len, len1, results, substream, substreamBrackets, substreamIdx;
  substream = null;
  brackets = [];
  substreamBrackets = [];
  for (idx = j = 0, len = buffer.length; j < len; idx = ++j) {
    ip = buffer[idx];
    if (ip.type === 'openBracket') {
      brackets.push(ip.data);
      substreamBrackets.push(ip);
      continue;
    }
    if (ip.type === 'closeBracket') {
      brackets.pop();
      if (substream) {
        substream.push(ip);
      }
      if (substreamBrackets.length) {
        substreamBrackets.pop();
      }
      if (substream && !substreamBrackets.length) {
        break;
      }
      continue;
    }
    if (!matcher(ip, brackets)) {
      substreamBrackets = [];
      continue;
    }
    substream = substreamBrackets.slice(0);
    substream.push(ip);
  }
  substreamIdx = buffer.indexOf(substream[0]);
  if (substreamIdx === 0) {
    return;
  }
  buffer.splice(substreamIdx, substream.length);
  substream.reverse();
  results = [];
  for (k = 0, len1 = substream.length; k < len1; k++) {
    ip = substream[k];
    results.push(buffer.unshift(ip));
  }
  return results;
};

handleInputCollation = function(data, config, input, port, idx) {
  var buf;
  if (!config.group && !config.field) {
    return;
  }
  if (config.group) {
    buf = input.ports[port].getBuffer(input.scope, idx);
    reorderBuffer(buf, function(ip, brackets) {
      var grp, j, len, ref;
      ref = input.collatedBy.brackets;
      for (idx = j = 0, len = ref.length; j < len; idx = ++j) {
        grp = ref[idx];
        if (brackets[idx] !== grp) {
          return false;
        }
      }
      return true;
    });
  }
  if (config.field) {
    data[config.field] = input.collatedBy.field;
    buf = input.ports[port].getBuffer(input.scope, idx);
    return reorderBuffer(buf, function(ip) {
      return ip.data[config.field] === data[config.field];
    });
  }
};

getInputData = function(config, input) {
  var data, idx, j, k, len, len1, port, ref, ref1;
  data = {};
  ref = config.inPorts;
  for (j = 0, len = ref.length; j < len; j++) {
    port = ref[j];
    if (input.ports[port].isAddressable()) {
      data[port] = {};
      ref1 = input.attached(port);
      for (k = 0, len1 = ref1.length; k < len1; k++) {
        idx = ref1[k];
        if (!input.hasData([port, idx])) {
          continue;
        }
        handleInputCollation(data, config, input, port, idx);
        data[port][idx] = input.getData([port, idx]);
      }
      continue;
    }
    if (!input.hasData(port)) {
      continue;
    }
    handleInputCollation(data, config, input, port);
    data[port] = input.getData(port);
  }
  if (config.inPorts.length === 1) {
    return data[config.inPorts[0]];
  }
  return data;
};

getGroupContext = function(component, port, input) {
  var ref, ref1;
  if (((ref = input.result.__bracketContext) != null ? ref[port] : void 0) == null) {
    return [];
  }
  if ((ref1 = input.collatedBy) != null ? ref1.brackets : void 0) {
    return input.collatedBy.brackets;
  }
  return input.result.__bracketContext[port].filter(function(c) {
    return c.source === port;
  }).map(function(c) {
    return c.ip.data;
  });
};

getOutputProxy = function(ports, output) {
  var outProxy;
  outProxy = {};
  ports.forEach(function(port) {
    return outProxy[port] = {
      connect: function() {},
      beginGroup: function(group, idx) {
        var ip;
        ip = new IP('openBracket', group);
        ip.index = idx;
        return output.sendIP(port, ip);
      },
      send: function(data, idx) {
        var ip;
        ip = new IP('data', data);
        ip.index = idx;
        return output.sendIP(port, ip);
      },
      endGroup: function(group, idx) {
        var ip;
        ip = new IP('closeBracket', group);
        ip.index = idx;
        return output.sendIP(port, ip);
      },
      disconnect: function() {}
    };
  });
  if (ports.length === 1) {
    return outProxy[ports[0]];
  }
  return outProxy;
};

checkWirePatternPreconditions = function(config, input, output) {
  var attached, idx, inputsOk, j, k, len, len1, packetsDropped, paramsOk, port, ref;
  paramsOk = checkWirePatternPreconditionsParams(config, input);
  inputsOk = checkWirePatternPreconditionsInput(config, input);
  if (config.dropInput && !paramsOk) {
    packetsDropped = false;
    ref = config.inPorts;
    for (j = 0, len = ref.length; j < len; j++) {
      port = ref[j];
      if (input.ports[port].isAddressable()) {
        attached = input.attached(port);
        if (!attached.length) {
          continue;
        }
        for (k = 0, len1 = attached.length; k < len1; k++) {
          idx = attached[k];
          while (input.has([port, idx])) {
            packetsDropped = true;
            input.get([port, idx]).drop();
          }
        }
        continue;
      }
      while (input.has(port)) {
        packetsDropped = true;
        input.get(port).drop();
      }
    }
    if (packetsDropped) {
      output.done();
    }
  }
  return inputsOk && paramsOk;
};

checkWirePatternPreconditionsParams = function(config, input) {
  var attached, j, len, param, ref, withData;
  ref = config.params;
  for (j = 0, len = ref.length; j < len; j++) {
    param = ref[j];
    if (!input.ports[param].isRequired()) {
      continue;
    }
    if (input.ports[param].isAddressable()) {
      attached = input.attached(param);
      if (!attached.length) {
        return false;
      }
      withData = attached.filter(function(idx) {
        return input.hasData([param, idx]);
      });
      if (config.arrayPolicy.params === 'all') {
        if (withData.length !== attached.length) {
          return false;
        }
        continue;
      }
      if (!withData.length) {
        return false;
      }
      continue;
    }
    if (!input.hasData(param)) {
      return false;
    }
  }
  return true;
};

checkWirePatternPreconditionsInput = function(config, input) {
  var attached, bracketsAtPorts, checkBrackets, checkPacket, checkPort, j, len, port, ref, withData;
  if (config.group) {
    bracketsAtPorts = {};
    input.collatedBy = {
      brackets: [],
      ready: false
    };
    checkBrackets = function(left, right) {
      var bracket, idx, j, len;
      for (idx = j = 0, len = left.length; j < len; idx = ++j) {
        bracket = left[idx];
        if (right[idx] !== bracket) {
          return false;
        }
      }
      return true;
    };
    checkPacket = function(ip, brackets) {
      var bracketId, bracketsToCheck;
      bracketsToCheck = brackets.slice(0);
      if (config.group instanceof RegExp) {
        bracketsToCheck = bracketsToCheck.slice(0, 1);
        if (!bracketsToCheck.length) {
          return false;
        }
        if (!config.group.test(bracketsToCheck[0])) {
          return false;
        }
      }
      if (input.collatedBy.ready) {
        return checkBrackets(input.collatedBy.brackets, bracketsToCheck);
      }
      bracketId = bracketsToCheck.join(':');
      if (!bracketsAtPorts[bracketId]) {
        bracketsAtPorts[bracketId] = [];
      }
      if (bracketsAtPorts[bracketId].indexOf(port) === -1) {
        bracketsAtPorts[bracketId].push(port);
      }
      if (config.inPorts.indexOf(port) !== config.inPorts.length - 1) {
        return true;
      }
      if (bracketsAtPorts[bracketId].length !== config.inPorts.length) {
        return false;
      }
      if (input.collatedBy.ready) {
        return false;
      }
      input.collatedBy.ready = true;
      input.collatedBy.brackets = bracketsToCheck;
      return true;
    };
  }
  if (config.field) {
    input.collatedBy = {
      field: void 0,
      ready: false
    };
  }
  checkPort = function(port) {
    var buf, dataBrackets, hasData, hasMatching, ip, j, len, portBrackets;
    if (!config.group && !config.field) {
      return input.hasData(port);
    }
    if (config.group) {
      portBrackets = [];
      dataBrackets = [];
      hasMatching = false;
      buf = input.ports[port].getBuffer(input.scope);
      for (j = 0, len = buf.length; j < len; j++) {
        ip = buf[j];
        if (ip.type === 'openBracket') {
          portBrackets.push(ip.data);
          continue;
        }
        if (ip.type === 'closeBracket') {
          portBrackets.pop();
          if (portBrackets.length) {
            continue;
          }
          if (!hasData) {
            continue;
          }
          hasMatching = true;
          continue;
        }
        hasData = checkPacket(ip, portBrackets);
        continue;
      }
      return hasMatching;
    }
    if (config.field) {
      return input.hasStream(port, function(ip) {
        if (!input.collatedBy.ready) {
          input.collatedBy.field = ip.data[config.field];
          input.collatedBy.ready = true;
          return true;
        }
        return ip.data[config.field] === input.collatedBy.field;
      });
    }
  };
  ref = config.inPorts;
  for (j = 0, len = ref.length; j < len; j++) {
    port = ref[j];
    if (input.ports[port].isAddressable()) {
      attached = input.attached(port);
      if (!attached.length) {
        return false;
      }
      withData = attached.filter(function(idx) {
        return checkPort([port, idx]);
      });
      if (config.arrayPolicy['in'] === 'all') {
        if (withData.length !== attached.length) {
          return false;
        }
        continue;
      }
      if (!withData.length) {
        return false;
      }
      continue;
    }
    if (!checkPort(port)) {
      return false;
    }
  }
  return true;
};

OutPortWrapper = (function() {
  function OutPortWrapper(port1, scope1) {
    this.port = port1;
    this.scope = scope1;
  }

  OutPortWrapper.prototype.connect = function(socketId) {
    if (socketId == null) {
      socketId = null;
    }
    return this.port.openBracket(null, {
      scope: this.scope
    }, socketId);
  };

  OutPortWrapper.prototype.beginGroup = function(group, socketId) {
    if (socketId == null) {
      socketId = null;
    }
    return this.port.openBracket(group, {
      scope: this.scope
    }, socketId);
  };

  OutPortWrapper.prototype.send = function(data, socketId) {
    if (socketId == null) {
      socketId = null;
    }
    return this.port.sendIP('data', data, {
      scope: this.scope
    }, socketId, false);
  };

  OutPortWrapper.prototype.endGroup = function(group, socketId) {
    if (socketId == null) {
      socketId = null;
    }
    return this.port.closeBracket(group, {
      scope: this.scope
    }, socketId);
  };

  OutPortWrapper.prototype.disconnect = function(socketId) {
    if (socketId == null) {
      socketId = null;
    }
    return this.endGroup(socketId);
  };

  OutPortWrapper.prototype.isConnected = function() {
    return this.port.isConnected();
  };

  OutPortWrapper.prototype.isAttached = function() {
    return this.port.isAttached();
  };

  return OutPortWrapper;

})();

legacyWirePattern = function(component, config, proc) {
  var _wp, baseTearDown, closeGroupOnOuts, collectGroups, disconnectOuts, fn, fn1, gc, j, k, l, len, len1, len2, len3, len4, m, n, name, port, processQueue, ref, ref1, ref2, ref3, ref4, resumeTaskQ, sendGroupToOuts, setParamsScope;
  if (!('gcFrequency' in config)) {
    config.gcFrequency = 100;
  }
  if (!('gcTimeout' in config)) {
    config.gcTimeout = 300;
  }
  collectGroups = config.forwardGroups;
  if (collectGroups !== false && config.group) {
    collectGroups = true;
  }
  ref = config.inPorts;
  for (j = 0, len = ref.length; j < len; j++) {
    name = ref[j];
    if (!component.inPorts[name]) {
      throw new Error("no inPort named '" + name + "'");
    }
  }
  ref1 = config.outPorts;
  for (k = 0, len1 = ref1.length; k < len1; k++) {
    name = ref1[k];
    if (!component.outPorts[name]) {
      throw new Error("no outPort named '" + name + "'");
    }
  }
  disconnectOuts = function() {
    var l, len2, p, ref2, results;
    ref2 = config.outPorts;
    results = [];
    for (l = 0, len2 = ref2.length; l < len2; l++) {
      p = ref2[l];
      if (component.outPorts[p].isConnected()) {
        results.push(component.outPorts[p].disconnect());
      } else {
        results.push(void 0);
      }
    }
    return results;
  };
  sendGroupToOuts = function(grp) {
    var l, len2, p, ref2, results;
    ref2 = config.outPorts;
    results = [];
    for (l = 0, len2 = ref2.length; l < len2; l++) {
      p = ref2[l];
      results.push(component.outPorts[p].beginGroup(grp));
    }
    return results;
  };
  closeGroupOnOuts = function(grp) {
    var l, len2, p, ref2, results;
    ref2 = config.outPorts;
    results = [];
    for (l = 0, len2 = ref2.length; l < len2; l++) {
      p = ref2[l];
      results.push(component.outPorts[p].endGroup(grp));
    }
    return results;
  };
  component.requiredParams = [];
  component.defaultedParams = [];
  component.gcCounter = 0;
  component._wpData = {};
  _wp = function(scope) {
    if (!(scope in component._wpData)) {
      component._wpData[scope] = {};
      component._wpData[scope].groupedData = {};
      component._wpData[scope].groupedGroups = {};
      component._wpData[scope].groupedDisconnects = {};
      component._wpData[scope].outputQ = [];
      component._wpData[scope].taskQ = [];
      component._wpData[scope].params = {};
      component._wpData[scope].completeParams = [];
      component._wpData[scope].receivedParams = [];
      component._wpData[scope].defaultsSent = false;
      component._wpData[scope].disconnectData = {};
      component._wpData[scope].disconnectQ = [];
      component._wpData[scope].groupBuffers = {};
      component._wpData[scope].keyBuffers = {};
      component._wpData[scope].gcTimestamps = {};
    }
    return component._wpData[scope];
  };
  component.params = {};
  setParamsScope = function(scope) {
    return component.params = _wp(scope).params;
  };
  processQueue = function(scope) {
    var flushed, key, stream, streams, tmp;
    while (_wp(scope).outputQ.length > 0) {
      streams = _wp(scope).outputQ[0];
      flushed = false;
      if (streams === null) {
        disconnectOuts();
        flushed = true;
      } else {
        if (config.outPorts.length === 1) {
          tmp = {};
          tmp[config.outPorts[0]] = streams;
          streams = tmp;
        }
        for (key in streams) {
          stream = streams[key];
          if (stream.resolved) {
            stream.flush();
            flushed = true;
          }
        }
      }
      if (flushed) {
        _wp(scope).outputQ.shift();
      }
      if (!flushed) {
        return;
      }
    }
  };
  if (config.async) {
    if ('load' in component.outPorts) {
      component.load = 0;
    }
    component.beforeProcess = function(scope, outs) {
      if (config.ordered) {
        _wp(scope).outputQ.push(outs);
      }
      component.load++;
      component.emit('activate', component.load);
      if ('load' in component.outPorts && component.outPorts.load.isAttached()) {
        component.outPorts.load.send(component.load);
        return component.outPorts.load.disconnect();
      }
    };
    component.afterProcess = function(scope, err, outs) {
      processQueue(scope);
      component.load--;
      if ('load' in component.outPorts && component.outPorts.load.isAttached()) {
        component.outPorts.load.send(component.load);
        component.outPorts.load.disconnect();
      }
      return component.emit('deactivate', component.load);
    };
  }
  component.sendDefaults = function(scope) {
    var l, len2, param, ref2, tempSocket;
    if (component.defaultedParams.length > 0) {
      ref2 = component.defaultedParams;
      for (l = 0, len2 = ref2.length; l < len2; l++) {
        param = ref2[l];
        if (_wp(scope).receivedParams.indexOf(param) === -1) {
          tempSocket = InternalSocket.createSocket();
          component.inPorts[param].attach(tempSocket);
          tempSocket.send();
          tempSocket.disconnect();
          component.inPorts[param].detach(tempSocket);
        }
      }
    }
    return _wp(scope).defaultsSent = true;
  };
  resumeTaskQ = function(scope) {
    var results, task, temp;
    if (_wp(scope).completeParams.length === component.requiredParams.length && _wp(scope).taskQ.length > 0) {
      temp = _wp(scope).taskQ.slice(0);
      _wp(scope).taskQ = [];
      results = [];
      while (temp.length > 0) {
        task = temp.shift();
        results.push(task());
      }
      return results;
    }
  };
  ref2 = config.params;
  for (l = 0, len2 = ref2.length; l < len2; l++) {
    port = ref2[l];
    if (!component.inPorts[port]) {
      throw new Error("no inPort named '" + port + "'");
    }
    if (component.inPorts[port].isRequired()) {
      component.requiredParams.push(port);
    }
    if (component.inPorts[port].hasDefault()) {
      component.defaultedParams.push(port);
    }
  }
  ref3 = config.params;
  fn = function(port) {
    var inPort;
    inPort = component.inPorts[port];
    return inPort.handle = function(ip) {
      var event, index, payload, scope;
      event = ip.type;
      payload = ip.data;
      scope = ip.scope;
      index = ip.index;
      if (event !== 'data') {
        return;
      }
      if (inPort.isAddressable()) {
        if (!(port in _wp(scope).params)) {
          _wp(scope).params[port] = {};
        }
        _wp(scope).params[port][index] = payload;
        if (config.arrayPolicy.params === 'all' && Object.keys(_wp(scope).params[port]).length < inPort.listAttached().length) {
          return;
        }
      } else {
        _wp(scope).params[port] = payload;
      }
      if (_wp(scope).completeParams.indexOf(port) === -1 && component.requiredParams.indexOf(port) > -1) {
        _wp(scope).completeParams.push(port);
      }
      _wp(scope).receivedParams.push(port);
      return resumeTaskQ(scope);
    };
  };
  for (m = 0, len3 = ref3.length; m < len3; m++) {
    port = ref3[m];
    fn(port);
  }
  component.dropRequest = function(scope, key) {
    if (key in _wp(scope).disconnectData) {
      delete _wp(scope).disconnectData[key];
    }
    if (key in _wp(scope).groupedData) {
      delete _wp(scope).groupedData[key];
    }
    if (key in _wp(scope).groupedGroups) {
      return delete _wp(scope).groupedGroups[key];
    }
  };
  gc = function() {
    var current, key, len4, n, ref4, results, scope, val;
    component.gcCounter++;
    if (component.gcCounter % config.gcFrequency === 0) {
      ref4 = Object.keys(component._wpData);
      results = [];
      for (n = 0, len4 = ref4.length; n < len4; n++) {
        scope = ref4[n];
        current = new Date().getTime();
        results.push((function() {
          var ref5, results1;
          ref5 = _wp(scope).gcTimestamps;
          results1 = [];
          for (key in ref5) {
            val = ref5[key];
            if ((current - val) > (config.gcTimeout * 1000)) {
              component.dropRequest(scope, key);
              results1.push(delete _wp(scope).gcTimestamps[key]);
            } else {
              results1.push(void 0);
            }
          }
          return results1;
        })());
      }
      return results;
    }
  };
  ref4 = config.inPorts;
  fn1 = function(port) {
    var inPort, needPortGroups;
    inPort = component.inPorts[port];
    needPortGroups = collectGroups instanceof Array && collectGroups.indexOf(port) !== -1;
    return inPort.handle = function(ip) {
      var data, foundGroup, g, groupLength, groups, grp, i, index, key, len5, len6, len7, len8, o, obj, out, outs, payload, postpone, postponedToQ, q, r, ref5, ref6, ref7, ref8, reqId, requiredLength, resume, s, scope, t, task, tmp, u, whenDone, whenDoneGroups, wrp;
      index = ip.index;
      payload = ip.data;
      scope = ip.scope;
      if (!(port in _wp(scope).groupBuffers)) {
        _wp(scope).groupBuffers[port] = [];
      }
      if (!(port in _wp(scope).keyBuffers)) {
        _wp(scope).keyBuffers[port] = null;
      }
      switch (ip.type) {
        case 'openBracket':
          if (payload === null) {
            return;
          }
          _wp(scope).groupBuffers[port].push(payload);
          if (config.forwardGroups && (collectGroups === true || needPortGroups) && !config.async) {
            return sendGroupToOuts(payload);
          }
          break;
        case 'closeBracket':
          _wp(scope).groupBuffers[port] = _wp(scope).groupBuffers[port].slice(0, _wp(scope).groupBuffers[port].length - 1);
          if (config.forwardGroups && (collectGroups === true || needPortGroups) && !config.async) {
            closeGroupOnOuts(payload);
          }
          if (_wp(scope).groupBuffers[port].length === 0) {
            if (config.inPorts.length === 1) {
              if (config.async || config.StreamSender) {
                if (config.ordered) {
                  _wp(scope).outputQ.push(null);
                  return processQueue(scope);
                } else {
                  return _wp(scope).disconnectQ.push(true);
                }
              } else {
                return disconnectOuts();
              }
            } else {
              foundGroup = false;
              key = _wp(scope).keyBuffers[port];
              if (!(key in _wp(scope).disconnectData)) {
                _wp(scope).disconnectData[key] = [];
              }
              for (i = o = 0, ref5 = _wp(scope).disconnectData[key].length; 0 <= ref5 ? o < ref5 : o > ref5; i = 0 <= ref5 ? ++o : --o) {
                if (!(port in _wp(scope).disconnectData[key][i])) {
                  foundGroup = true;
                  _wp(scope).disconnectData[key][i][port] = true;
                  if (Object.keys(_wp(scope).disconnectData[key][i]).length === config.inPorts.length) {
                    _wp(scope).disconnectData[key].shift();
                    if (config.async || config.StreamSender) {
                      if (config.ordered) {
                        _wp(scope).outputQ.push(null);
                        processQueue(scope);
                      } else {
                        _wp(scope).disconnectQ.push(true);
                      }
                    } else {
                      disconnectOuts();
                    }
                    if (_wp(scope).disconnectData[key].length === 0) {
                      delete _wp(scope).disconnectData[key];
                    }
                  }
                  break;
                }
              }
              if (!foundGroup) {
                obj = {};
                obj[port] = true;
                return _wp(scope).disconnectData[key].push(obj);
              }
            }
          }
          break;
        case 'data':
          if (config.inPorts.length === 1 && !inPort.isAddressable()) {
            data = payload;
            groups = _wp(scope).groupBuffers[port];
          } else {
            key = '';
            if (config.group && _wp(scope).groupBuffers[port].length > 0) {
              key = _wp(scope).groupBuffers[port].toString();
              if (config.group instanceof RegExp) {
                reqId = null;
                ref6 = _wp(scope).groupBuffers[port];
                for (q = 0, len5 = ref6.length; q < len5; q++) {
                  grp = ref6[q];
                  if (config.group.test(grp)) {
                    reqId = grp;
                    break;
                  }
                }
                key = reqId ? reqId : '';
              }
            } else if (config.field && typeof payload === 'object' && config.field in payload) {
              key = payload[config.field];
            }
            _wp(scope).keyBuffers[port] = key;
            if (!(key in _wp(scope).groupedData)) {
              _wp(scope).groupedData[key] = [];
            }
            if (!(key in _wp(scope).groupedGroups)) {
              _wp(scope).groupedGroups[key] = [];
            }
            foundGroup = false;
            requiredLength = config.inPorts.length;
            if (config.field) {
              ++requiredLength;
            }
            for (i = r = 0, ref7 = _wp(scope).groupedData[key].length; 0 <= ref7 ? r < ref7 : r > ref7; i = 0 <= ref7 ? ++r : --r) {
              if (!(port in _wp(scope).groupedData[key][i]) || (component.inPorts[port].isAddressable() && config.arrayPolicy["in"] === 'all' && !(index in _wp(scope).groupedData[key][i][port]))) {
                foundGroup = true;
                if (component.inPorts[port].isAddressable()) {
                  if (!(port in _wp(scope).groupedData[key][i])) {
                    _wp(scope).groupedData[key][i][port] = {};
                  }
                  _wp(scope).groupedData[key][i][port][index] = payload;
                } else {
                  _wp(scope).groupedData[key][i][port] = payload;
                }
                if (needPortGroups) {
                  _wp(scope).groupedGroups[key][i] = utils.unique(slice.call(_wp(scope).groupedGroups[key][i]).concat(slice.call(_wp(scope).groupBuffers[port])));
                } else if (collectGroups === true) {
                  _wp(scope).groupedGroups[key][i][port] = _wp(scope).groupBuffers[port];
                }
                if (component.inPorts[port].isAddressable() && config.arrayPolicy["in"] === 'all' && Object.keys(_wp(scope).groupedData[key][i][port]).length < component.inPorts[port].listAttached().length) {
                  return;
                }
                groupLength = Object.keys(_wp(scope).groupedData[key][i]).length;
                if (groupLength === requiredLength) {
                  data = (_wp(scope).groupedData[key].splice(i, 1))[0];
                  if (config.inPorts.length === 1 && inPort.isAddressable()) {
                    data = data[port];
                  }
                  groups = (_wp(scope).groupedGroups[key].splice(i, 1))[0];
                  if (collectGroups === true) {
                    groups = utils.intersection.apply(null, utils.getValues(groups));
                  }
                  if (_wp(scope).groupedData[key].length === 0) {
                    delete _wp(scope).groupedData[key];
                  }
                  if (_wp(scope).groupedGroups[key].length === 0) {
                    delete _wp(scope).groupedGroups[key];
                  }
                  if (config.group && key) {
                    delete _wp(scope).gcTimestamps[key];
                  }
                  break;
                } else {
                  return;
                }
              }
            }
            if (!foundGroup) {
              obj = {};
              if (config.field) {
                obj[config.field] = key;
              }
              if (component.inPorts[port].isAddressable()) {
                obj[port] = {};
                obj[port][index] = payload;
              } else {
                obj[port] = payload;
              }
              if (config.inPorts.length === 1 && component.inPorts[port].isAddressable() && (config.arrayPolicy["in"] === 'any' || component.inPorts[port].listAttached().length === 1)) {
                data = obj[port];
                groups = _wp(scope).groupBuffers[port];
              } else {
                _wp(scope).groupedData[key].push(obj);
                if (needPortGroups) {
                  _wp(scope).groupedGroups[key].push(_wp(scope).groupBuffers[port]);
                } else if (collectGroups === true) {
                  tmp = {};
                  tmp[port] = _wp(scope).groupBuffers[port];
                  _wp(scope).groupedGroups[key].push(tmp);
                } else {
                  _wp(scope).groupedGroups[key].push([]);
                }
                if (config.group && key) {
                  _wp(scope).gcTimestamps[key] = new Date().getTime();
                }
                return;
              }
            }
          }
          if (config.dropInput && _wp(scope).completeParams.length !== component.requiredParams.length) {
            return;
          }
          outs = {};
          ref8 = config.outPorts;
          for (s = 0, len6 = ref8.length; s < len6; s++) {
            name = ref8[s];
            wrp = new OutPortWrapper(component.outPorts[name], scope);
            if (config.async || config.sendStreams && config.sendStreams.indexOf(name) !== -1) {
              wrp;
              outs[name] = new StreamSender(wrp, config.ordered);
            } else {
              outs[name] = wrp;
            }
          }
          if (config.outPorts.length === 1) {
            outs = outs[config.outPorts[0]];
          }
          if (!groups) {
            groups = [];
          }
          groups = (function() {
            var len7, results, t;
            results = [];
            for (t = 0, len7 = groups.length; t < len7; t++) {
              g = groups[t];
              if (g !== null) {
                results.push(g);
              }
            }
            return results;
          })();
          whenDoneGroups = groups.slice(0);
          whenDone = function(err) {
            var disconnect, len7, out, outputs, t;
            if (err) {
              component.error(err, whenDoneGroups, 'error', scope);
            }
            if (typeof component.fail === 'function' && component.hasErrors) {
              component.fail(null, [], scope);
            }
            outputs = outs;
            if (config.outPorts.length === 1) {
              outputs = {};
              outputs[port] = outs;
            }
            disconnect = false;
            if (_wp(scope).disconnectQ.length > 0) {
              _wp(scope).disconnectQ.shift();
              disconnect = true;
            }
            for (name in outputs) {
              out = outputs[name];
              if (config.forwardGroups && config.async) {
                for (t = 0, len7 = whenDoneGroups.length; t < len7; t++) {
                  i = whenDoneGroups[t];
                  out.endGroup();
                }
              }
              if (disconnect) {
                out.disconnect();
              }
              if (config.async || config.StreamSender) {
                out.done();
              }
            }
            if (typeof component.afterProcess === 'function') {
              return component.afterProcess(scope, err || component.hasErrors, outs);
            }
          };
          if (typeof component.beforeProcess === 'function') {
            component.beforeProcess(scope, outs);
          }
          if (config.forwardGroups && config.async) {
            if (config.outPorts.length === 1) {
              for (t = 0, len7 = groups.length; t < len7; t++) {
                g = groups[t];
                outs.beginGroup(g);
              }
            } else {
              for (name in outs) {
                out = outs[name];
                for (u = 0, len8 = groups.length; u < len8; u++) {
                  g = groups[u];
                  out.beginGroup(g);
                }
              }
            }
          }
          exports.MultiError(component, config.name, config.error, groups, scope);
          debug("WirePattern Legacy API call with", data, groups, component.params, scope);
          if (config.async) {
            postpone = function() {};
            resume = function() {};
            postponedToQ = false;
            task = function() {
              setParamsScope(scope);
              return proc.call(component, data, groups, outs, whenDone, postpone, resume, scope);
            };
            postpone = function(backToQueue) {
              if (backToQueue == null) {
                backToQueue = true;
              }
              postponedToQ = backToQueue;
              if (backToQueue) {
                return _wp(scope).taskQ.push(task);
              }
            };
            resume = function() {
              if (postponedToQ) {
                return resumeTaskQ();
              } else {
                return task();
              }
            };
          } else {
            task = function() {
              setParamsScope(scope);
              proc.call(component, data, groups, outs, null, null, null, scope);
              return whenDone();
            };
          }
          _wp(scope).taskQ.push(task);
          resumeTaskQ(scope);
          return gc();
      }
    };
  };
  for (n = 0, len4 = ref4.length; n < len4; n++) {
    port = ref4[n];
    fn1(port);
  }
  baseTearDown = component.tearDown;
  component.tearDown = function(callback) {
    component.requiredParams = [];
    component.defaultedParams = [];
    component.gcCounter = 0;
    component._wpData = {};
    component.params = {};
    return baseTearDown.call(component, callback);
  };
  return component;
};

exports.GroupedInput = exports.WirePattern;

exports.CustomError = function(message, options) {
  var err;
  err = new Error(message);
  return exports.CustomizeError(err, options);
};

exports.CustomizeError = function(err, options) {
  var key, val;
  for (key in options) {
    if (!hasProp.call(options, key)) continue;
    val = options[key];
    err[key] = val;
  }
  return err;
};

exports.MultiError = function(component, group, errorPort, forwardedGroups, scope) {
  var baseTearDown;
  if (group == null) {
    group = '';
  }
  if (errorPort == null) {
    errorPort = 'error';
  }
  if (forwardedGroups == null) {
    forwardedGroups = [];
  }
  if (scope == null) {
    scope = null;
  }
  platform.deprecated('noflo.helpers.MultiError is deprecated. Send errors to error port instead');
  component.hasErrors = false;
  component.errors = [];
  if (component.name && !group) {
    group = component.name;
  }
  if (!group) {
    group = 'Component';
  }
  component.error = function(e, groups) {
    if (groups == null) {
      groups = [];
    }
    component.errors.push({
      err: e,
      groups: forwardedGroups.concat(groups)
    });
    return component.hasErrors = true;
  };
  component.fail = function(e, groups) {
    var error, grp, j, k, l, len, len1, len2, ref, ref1, ref2;
    if (e == null) {
      e = null;
    }
    if (groups == null) {
      groups = [];
    }
    if (e) {
      component.error(e, groups);
    }
    if (!component.hasErrors) {
      return;
    }
    if (!(errorPort in component.outPorts)) {
      return;
    }
    if (!component.outPorts[errorPort].isAttached()) {
      return;
    }
    if (group) {
      component.outPorts[errorPort].openBracket(group, {
        scope: scope
      });
    }
    ref = component.errors;
    for (j = 0, len = ref.length; j < len; j++) {
      error = ref[j];
      ref1 = error.groups;
      for (k = 0, len1 = ref1.length; k < len1; k++) {
        grp = ref1[k];
        component.outPorts[errorPort].openBracket(grp, {
          scope: scope
        });
      }
      component.outPorts[errorPort].data(error.err, {
        scope: scope
      });
      ref2 = error.groups;
      for (l = 0, len2 = ref2.length; l < len2; l++) {
        grp = ref2[l];
        component.outPorts[errorPort].closeBracket(grp, {
          scope: scope
        });
      }
    }
    if (group) {
      component.outPorts[errorPort].closeBracket(group, {
        scope: scope
      });
    }
    component.hasErrors = false;
    return component.errors = [];
  };
  baseTearDown = component.tearDown;
  component.tearDown = function(callback) {
    component.hasErrors = false;
    component.errors = [];
    return baseTearDown.call(component, callback);
  };
  return component;
};

});
___scope___.file("lib/InPort.coffee", function(exports, require, module, __filename, __dirname){ 

var BasePort, IP, InPort, platform,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

BasePort = require('./BasePort');

IP = require('./IP');

platform = require('./Platform');

InPort = (function(superClass) {
  extend(InPort, superClass);

  function InPort(options, process) {
    this.process = null;
    if (!process && typeof options === 'function') {
      process = options;
      options = {};
    }
    if (options == null) {
      options = {};
    }
    if (options.buffered == null) {
      options.buffered = false;
    }
    if (options.control == null) {
      options.control = false;
    }
    if (options.triggering == null) {
      options.triggering = true;
    }
    if (!process && options && options.process) {
      process = options.process;
      delete options.process;
    }
    if (process) {
      platform.deprecated('InPort process callback is deprecated. Please use Process API or the InPort handle option');
      if (typeof process !== 'function') {
        throw new Error('process must be a function');
      }
      this.process = process;
    }
    if (options.handle) {
      platform.deprecated('InPort handle callback is deprecated. Please use Process API');
      if (typeof options.handle !== 'function') {
        throw new Error('handle must be a function');
      }
      this.handle = options.handle;
      delete options.handle;
    }
    InPort.__super__.constructor.call(this, options);
    this.prepareBuffer();
  }

  InPort.prototype.attachSocket = function(socket, localId) {
    if (localId == null) {
      localId = null;
    }
    if (this.hasDefault()) {
      if (this.handle) {
        socket.setDataDelegate((function(_this) {
          return function() {
            return new IP('data', _this.options["default"]);
          };
        })(this));
      } else {
        socket.setDataDelegate((function(_this) {
          return function() {
            return _this.options["default"];
          };
        })(this));
      }
    }
    socket.on('connect', (function(_this) {
      return function() {
        return _this.handleSocketEvent('connect', socket, localId);
      };
    })(this));
    socket.on('begingroup', (function(_this) {
      return function(group) {
        return _this.handleSocketEvent('begingroup', group, localId);
      };
    })(this));
    socket.on('data', (function(_this) {
      return function(data) {
        _this.validateData(data);
        return _this.handleSocketEvent('data', data, localId);
      };
    })(this));
    socket.on('endgroup', (function(_this) {
      return function(group) {
        return _this.handleSocketEvent('endgroup', group, localId);
      };
    })(this));
    socket.on('disconnect', (function(_this) {
      return function() {
        return _this.handleSocketEvent('disconnect', socket, localId);
      };
    })(this));
    return socket.on('ip', (function(_this) {
      return function(ip) {
        return _this.handleIP(ip, localId);
      };
    })(this));
  };

  InPort.prototype.handleIP = function(ip, id) {
    var buf;
    if (this.process) {
      return;
    }
    if (this.options.control && ip.type !== 'data') {
      return;
    }
    ip.owner = this.nodeInstance;
    if (this.isAddressable()) {
      ip.index = id;
    }
    buf = this.prepareBufferForIP(ip);
    buf.push(ip);
    if (this.options.control && buf.length > 1) {
      buf.shift();
    }
    if (this.handle) {
      this.handle(ip, this.nodeInstance);
    }
    return this.emit('ip', ip, id);
  };

  InPort.prototype.handleSocketEvent = function(event, payload, id) {
    if (this.isBuffered()) {
      this.buffer.push({
        event: event,
        payload: payload,
        id: id
      });
      if (this.isAddressable()) {
        if (this.process) {
          this.process(event, id, this.nodeInstance);
        }
        this.emit(event, id);
      } else {
        if (this.process) {
          this.process(event, this.nodeInstance);
        }
        this.emit(event);
      }
      return;
    }
    if (this.process) {
      if (this.isAddressable()) {
        this.process(event, payload, id, this.nodeInstance);
      } else {
        this.process(event, payload, this.nodeInstance);
      }
    }
    if (this.isAddressable()) {
      return this.emit(event, payload, id);
    }
    return this.emit(event, payload);
  };

  InPort.prototype.hasDefault = function() {
    return this.options["default"] !== void 0;
  };

  InPort.prototype.prepareBuffer = function() {
    this.buffer = [];
    if (this.isAddressable()) {
      this.indexedBuffer = {};
    }
    return this.scopedBuffer = {};
  };

  InPort.prototype.prepareBufferForIP = function(ip) {
    if (this.isAddressable()) {
      if (ip.scope != null) {
        if (!(ip.scope in this.scopedBuffer)) {
          this.scopedBuffer[ip.scope] = [];
        }
        if (!(ip.index in this.scopedBuffer[ip.scope])) {
          this.scopedBuffer[ip.scope][ip.index] = [];
        }
        return this.scopedBuffer[ip.scope][ip.index];
      }
      if (!(ip.index in this.indexedBuffer)) {
        this.indexedBuffer[ip.index] = [];
      }
      return this.indexedBuffer[ip.index];
    }
    if (ip.scope != null) {
      if (!(ip.scope in this.scopedBuffer)) {
        this.scopedBuffer[ip.scope] = [];
      }
      return this.scopedBuffer[ip.scope];
    }
    return this.buffer;
  };

  InPort.prototype.validateData = function(data) {
    if (!this.options.values) {
      return;
    }
    if (this.options.values.indexOf(data) === -1) {
      throw new Error("Invalid data='" + data + "' received, not in [" + this.options.values + "]");
    }
  };

  InPort.prototype.receive = function() {
    platform.deprecated('InPort.receive is deprecated. Use InPort.get instead');
    if (!this.isBuffered()) {
      throw new Error('Receive is only possible on buffered ports');
    }
    return this.buffer.shift();
  };

  InPort.prototype.contains = function() {
    platform.deprecated('InPort.contains is deprecated. Use InPort.has instead');
    if (!this.isBuffered()) {
      throw new Error('Contains query is only possible on buffered ports');
    }
    return this.buffer.filter(function(packet) {
      if (packet.event === 'data') {
        return true;
      }
    }).length;
  };

  InPort.prototype.getBuffer = function(scope, idx) {
    if (this.isAddressable()) {
      if (scope != null) {
        if (!(scope in this.scopedBuffer)) {
          return void 0;
        }
        if (!(idx in this.scopedBuffer[scope])) {
          return void 0;
        }
        return this.scopedBuffer[scope][idx];
      }
      if (!(idx in this.indexedBuffer)) {
        return void 0;
      }
      return this.indexedBuffer[idx];
    }
    if (scope != null) {
      if (!(scope in this.scopedBuffer)) {
        return void 0;
      }
      return this.scopedBuffer[scope];
    }
    return this.buffer;
  };

  InPort.prototype.get = function(scope, idx) {
    var buf;
    buf = this.getBuffer(scope, idx);
    if (!(buf != null ? buf.length : void 0)) {
      return void 0;
    }
    if (this.options.control) {
      return buf[buf.length - 1];
    } else {
      return buf.shift();
    }
  };

  InPort.prototype.has = function(scope, idx, validate) {
    var buf, i, len, packet;
    if (!this.isAddressable()) {
      validate = idx;
      idx = null;
    }
    buf = this.getBuffer(scope, idx);
    if (!(buf != null ? buf.length : void 0)) {
      return false;
    }
    for (i = 0, len = buf.length; i < len; i++) {
      packet = buf[i];
      if (validate(packet)) {
        return true;
      }
    }
    return false;
  };

  InPort.prototype.length = function(scope, idx) {
    var buf;
    buf = this.getBuffer(scope, idx);
    if (!buf) {
      return 0;
    }
    return buf.length;
  };

  InPort.prototype.ready = function(scope, idx) {
    return this.length(scope) > 0;
  };

  InPort.prototype.clear = function() {
    return this.prepareBuffer();
  };

  return InPort;

})(BasePort);

module.exports = InPort;

});
___scope___.file("lib/InternalSocket.coffee", function(exports, require, module, __filename, __dirname){ 

var EventEmitter, IP, InternalSocket,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

EventEmitter = require('events').EventEmitter;

IP = require('./IP');

InternalSocket = (function(superClass) {
  extend(InternalSocket, superClass);

  InternalSocket.prototype.regularEmitEvent = function(event, data) {
    return this.emit(event, data);
  };

  InternalSocket.prototype.debugEmitEvent = function(event, data) {
    var error;
    try {
      return this.emit(event, data);
    } catch (error1) {
      error = error1;
      if (error.id && error.metadata && error.error) {
        if (this.listeners('error').length === 0) {
          throw error.error;
        }
        this.emit('error', error);
        return;
      }
      if (this.listeners('error').length === 0) {
        throw error;
      }
      return this.emit('error', {
        id: this.to.process.id,
        error: error,
        metadata: this.metadata
      });
    }
  };

  function InternalSocket(metadata) {
    this.metadata = metadata != null ? metadata : {};
    this.brackets = [];
    this.connected = false;
    this.dataDelegate = null;
    this.debug = false;
    this.emitEvent = this.regularEmitEvent;
  }

  InternalSocket.prototype.connect = function() {
    if (this.connected) {
      return;
    }
    this.connected = true;
    return this.emitEvent('connect', null);
  };

  InternalSocket.prototype.disconnect = function() {
    if (!this.connected) {
      return;
    }
    this.connected = false;
    return this.emitEvent('disconnect', null);
  };

  InternalSocket.prototype.isConnected = function() {
    return this.connected;
  };

  InternalSocket.prototype.send = function(data) {
    if (data === void 0 && typeof this.dataDelegate === 'function') {
      data = this.dataDelegate();
    }
    return this.handleSocketEvent('data', data);
  };

  InternalSocket.prototype.post = function(ip, autoDisconnect) {
    if (autoDisconnect == null) {
      autoDisconnect = true;
    }
    if (ip === void 0 && typeof this.dataDelegate === 'function') {
      ip = this.dataDelegate();
    }
    if (!this.isConnected() && this.brackets.length === 0) {
      this.connect();
    }
    this.handleSocketEvent('ip', ip, false);
    if (autoDisconnect && this.isConnected() && this.brackets.length === 0) {
      return this.disconnect();
    }
  };

  InternalSocket.prototype.beginGroup = function(group) {
    return this.handleSocketEvent('begingroup', group);
  };

  InternalSocket.prototype.endGroup = function() {
    return this.handleSocketEvent('endgroup');
  };

  InternalSocket.prototype.setDataDelegate = function(delegate) {
    if (typeof delegate !== 'function') {
      throw Error('A data delegate must be a function.');
    }
    return this.dataDelegate = delegate;
  };

  InternalSocket.prototype.setDebug = function(active) {
    this.debug = active;
    return this.emitEvent = this.debug ? this.debugEmitEvent : this.regularEmitEvent;
  };

  InternalSocket.prototype.getId = function() {
    var fromStr, toStr;
    fromStr = function(from) {
      return from.process.id + "() " + (from.port.toUpperCase());
    };
    toStr = function(to) {
      return (to.port.toUpperCase()) + " " + to.process.id + "()";
    };
    if (!(this.from || this.to)) {
      return "UNDEFINED";
    }
    if (this.from && !this.to) {
      return (fromStr(this.from)) + " -> ANON";
    }
    if (!this.from) {
      return "DATA -> " + (toStr(this.to));
    }
    return (fromStr(this.from)) + " -> " + (toStr(this.to));
  };

  InternalSocket.prototype.legacyToIp = function(event, payload) {
    if (IP.isIP(payload)) {
      return payload;
    }
    switch (event) {
      case 'begingroup':
        return new IP('openBracket', payload);
      case 'endgroup':
        return new IP('closeBracket');
      case 'data':
        return new IP('data', payload);
      default:
        return null;
    }
  };

  InternalSocket.prototype.ipToLegacy = function(ip) {
    var legacy;
    switch (ip.type) {
      case 'openBracket':
        return legacy = {
          event: 'begingroup',
          payload: ip.data
        };
      case 'data':
        return legacy = {
          event: 'data',
          payload: ip.data
        };
      case 'closeBracket':
        return legacy = {
          event: 'endgroup',
          payload: ip.data
        };
    }
  };

  InternalSocket.prototype.handleSocketEvent = function(event, payload, autoConnect) {
    var ip, isIP, legacy;
    if (autoConnect == null) {
      autoConnect = true;
    }
    isIP = event === 'ip' && IP.isIP(payload);
    ip = isIP ? payload : this.legacyToIp(event, payload);
    if (!ip) {
      return;
    }
    if (!this.isConnected() && autoConnect && this.brackets.length === 0) {
      this.connect();
    }
    if (event === 'begingroup') {
      this.brackets.push(payload);
    }
    if (isIP && ip.type === 'openBracket') {
      this.brackets.push(ip.data);
    }
    if (event === 'endgroup') {
      if (this.brackets.length === 0) {
        return;
      }
      ip.data = this.brackets.pop();
      payload = ip.data;
    }
    if (isIP && payload.type === 'closeBracket') {
      if (this.brackets.length === 0) {
        return;
      }
      this.brackets.pop();
    }
    this.emitEvent('ip', ip);
    if (!(ip && ip.type)) {
      return;
    }
    if (isIP) {
      legacy = this.ipToLegacy(ip);
      event = legacy.event;
      payload = legacy.payload;
    }
    if (event === 'connect') {
      this.connected = true;
    }
    if (event === 'disconnect') {
      this.connected = false;
    }
    return this.emitEvent(event, payload);
  };

  return InternalSocket;

})(EventEmitter);

exports.InternalSocket = InternalSocket;

exports.createSocket = function() {
  return new InternalSocket;
};

});
___scope___.file("lib/IP.coffee", function(exports, require, module, __filename, __dirname){ 

var IP;

module.exports = IP = (function() {
  IP.types = ['data', 'openBracket', 'closeBracket'];

  IP.isIP = function(obj) {
    return obj && typeof obj === 'object' && obj._isIP === true;
  };

  function IP(type, data, options) {
    var key, val;
    this.type = type != null ? type : 'data';
    this.data = data != null ? data : null;
    if (options == null) {
      options = {};
    }
    this._isIP = true;
    this.scope = null;
    this.owner = null;
    this.clonable = false;
    this.index = null;
    for (key in options) {
      val = options[key];
      this[key] = val;
    }
  }

  IP.prototype.clone = function() {
    var ip, key, ref, val;
    ip = new IP(this.type);
    ref = this;
    for (key in ref) {
      val = ref[key];
      if (['owner'].indexOf(key) !== -1) {
        continue;
      }
      if (val === null) {
        continue;
      }
      if (typeof val === 'object') {
        ip[key] = JSON.parse(JSON.stringify(val));
      } else {
        ip[key] = val;
      }
    }
    return ip;
  };

  IP.prototype.move = function(owner) {
    this.owner = owner;
  };

  IP.prototype.drop = function() {
    var key, ref, results, val;
    ref = this;
    results = [];
    for (key in ref) {
      val = ref[key];
      results.push(delete this[key]);
    }
    return results;
  };

  return IP;

})();

});
___scope___.file("lib/loader/ComponentIo.coffee", function(exports, require, module, __filename, __dirname){ 

var customLoader, fbpGraph, platform, utils;

utils = require('../Utils');

fbpGraph = require('fbp-graph');

platform = require('../Platform');

customLoader = {
  checked: [],
  getModuleDependencies: function(loader, dependencies, callback) {
    var dependency;
    if (!(dependencies != null ? dependencies.length : void 0)) {
      return callback(null);
    }
    dependency = dependencies.shift();
    dependency = dependency.replace('/', '-');
    return this.getModuleComponents(loader, dependency, (function(_this) {
      return function(err) {
        return _this.getModuleDependencies(loader, dependencies, callback);
      };
    })(this));
  },
  getModuleComponents: function(loader, moduleName, callback) {
    var definition, e;
    if (this.checked.indexOf(moduleName) !== -1) {
      return callback();
    }
    this.checked.push(moduleName);
    try {
      definition = require("/" + moduleName + "/component.json");
    } catch (error) {
      e = error;
      if (moduleName.substr(0, 1) === '/' && moduleName.length > 1) {
        return this.getModuleComponents(loader, "noflo-" + (moduleName.substr(1)), callback);
      }
      return callback(e);
    }
    if (!definition.noflo) {
      return callback();
    }
    if (!definition.dependencies) {
      return callback();
    }
    return this.getModuleDependencies(loader, Object.keys(definition.dependencies), function(err) {
      var cPath, def, loaderPath, name, prefix, ref, ref1;
      if (err) {
        return callback(err);
      }
      prefix = loader.getModulePrefix(definition.name);
      if (definition.noflo.icon) {
        loader.setLibraryIcon(prefix, definition.noflo.icon);
      }
      if (moduleName[0] === '/') {
        moduleName = moduleName.substr(1);
      }
      if (definition.noflo.components) {
        ref = definition.noflo.components;
        for (name in ref) {
          cPath = ref[name];
          if (cPath.indexOf('.coffee') !== -1) {
            cPath = cPath.replace('.coffee', '.js');
          }
          if (cPath.substr(0, 2) === './') {
            cPath = cPath.substr(2);
          }
          loader.registerComponent(prefix, name, "/" + moduleName + "/" + cPath);
        }
      }
      if (definition.noflo.graphs) {
        ref1 = definition.noflo.graphs;
        for (name in ref1) {
          cPath = ref1[name];
          def = require("/" + moduleName + "/" + cPath);
          loader.registerGraph(prefix, name, def);
        }
      }
      if (definition.noflo.loader) {
        loaderPath = "/" + moduleName + "/" + definition.noflo.loader;
        customLoader = require(loaderPath);
        loader.registerLoader(customLoader, callback);
        return;
      }
      return callback();
    });
  }
};

exports.register = function(loader, callback) {
  platform.deprecated('Component.io is deprecated. Please make browser builds using webpack instead. grunt-noflo-browser provides a simple setup for this');
  customLoader.checked = [];
  return setTimeout(function() {
    return customLoader.getModuleComponents(loader, loader.baseDir, callback);
  }, 1);
};

exports.dynamicLoad = function(name, cPath, metadata, callback) {
  var e, implementation, instance;
  try {
    implementation = require(cPath);
  } catch (error) {
    e = error;
    callback(e);
    return;
  }
  if (typeof implementation.getComponent === 'function') {
    instance = implementation.getComponent(metadata);
  } else if (typeof implementation === 'function') {
    instance = implementation(metadata);
  } else {
    callback(new Error("Unable to instantiate " + cPath));
    return;
  }
  if (typeof name === 'string') {
    instance.componentName = name;
  }
  return callback(null, instance);
};

exports.setSource = function(loader, packageId, name, source, language, callback) {
  var e, implementation;
  if (language === 'coffeescript') {
    if (!window.CoffeeScript) {
      return callback(new Error('CoffeeScript compiler not available'));
    }
    try {
      source = CoffeeScript.compile(source, {
        bare: true
      });
    } catch (error) {
      e = error;
      return callback(e);
    }
  } else if (language === 'es6' || language === 'es2015') {
    if (!window.babel) {
      return callback(new Error('Babel compiler not available'));
    }
    try {
      source = babel.transform(source).code;
    } catch (error) {
      e = error;
      return callback(e);
    }
  }
  try {
    source = source.replace("require('noflo')", "require('../NoFlo')");
    source = source.replace('require("noflo")', 'require("../NoFlo")');
    implementation = eval("(function () { var exports = {}; " + source + "; return exports; })()");
  } catch (error) {
    e = error;
    return callback(e);
  }
  if (!(implementation || implementation.getComponent)) {
    return callback(new Error('Provided source failed to create a runnable component'));
  }
  return loader.registerComponent(packageId, name, implementation, callback);
};

exports.getSource = function(loader, name, callback) {
  var component, componentName, nameParts, path;
  component = loader.components[name];
  if (!component) {
    for (componentName in loader.components) {
      if (componentName.split('/')[1] === name) {
        component = loader.components[componentName];
        name = componentName;
        break;
      }
    }
    if (!component) {
      return callback(new Error("Component " + name + " not installed"));
    }
  }
  if (typeof component !== 'string') {
    return callback(new Error("Can't provide source for " + name + ". Not a file"));
  }
  nameParts = name.split('/');
  if (nameParts.length === 1) {
    nameParts[1] = nameParts[0];
    nameParts[0] = '';
  }
  if (loader.isGraph(component)) {
    fbpGraph.graph.loadFile(component, function(err, graph) {
      if (err) {
        return callback(err);
      }
      if (!graph) {
        return callback(new Error('Unable to load graph'));
      }
      return callback(null, {
        name: nameParts[1],
        library: nameParts[0],
        code: JSON.stringify(graph.toJSON()),
        language: 'json'
      });
    });
    return;
  }
  path = window.require.resolve(component);
  if (!path) {
    return callback(new Error("Component " + name + " is not resolvable to a path"));
  }
  return callback(null, {
    name: nameParts[1],
    library: nameParts[0],
    code: window.require.modules[path].toString(),
    language: utils.guessLanguageFromFilename(component)
  });
};

});
___scope___.file("lib/loader/NodeJs.coffee", function(exports, require, module, __filename, __dirname){ 

var CoffeeScript, dynamicLoader, fbpGraph, fs, manifest, manifestLoader, path, registerModules, registerSubgraph, utils;

path = require('path');

fs = require('fs');

manifest = require('fbp-manifest');

utils = require('../Utils');

fbpGraph = require('fbp-graph');

CoffeeScript = require('coffee-script');

if (typeof CoffeeScript.register !== 'undefined') {
  CoffeeScript.register();
}

registerModules = function(loader, modules, callback) {
  var c, compatible, componentLoaders, done, i, j, len, len1, loaderPath, m, ref, ref1;
  compatible = modules.filter(function(m) {
    var ref;
    return (ref = m.runtime) === 'noflo' || ref === 'noflo-nodejs';
  });
  componentLoaders = [];
  for (i = 0, len = compatible.length; i < len; i++) {
    m = compatible[i];
    if (m.icon) {
      loader.setLibraryIcon(m.name, m.icon);
    }
    if ((ref = m.noflo) != null ? ref.loader : void 0) {
      loaderPath = path.resolve(loader.baseDir, m.base, m.noflo.loader);
      componentLoaders.push(loaderPath);
    }
    ref1 = m.components;
    for (j = 0, len1 = ref1.length; j < len1; j++) {
      c = ref1[j];
      loader.registerComponent(m.name, c.name, path.resolve(loader.baseDir, c.path));
    }
  }
  if (!componentLoaders.length) {
    return callback(null);
  }
  done = function() {
    if (--componentLoaders.length < 1) {
      return callback.apply(this, arguments);
    }
  };
  return componentLoaders.forEach((function(_this) {
    return function(loaderPath) {
      var cLoader;
      cLoader = require(loaderPath);
      return loader.registerLoader(cLoader, function(err) {
        if (err) {
          return callback(err);
        }
        return done(null);
      });
    };
  })(this));
};

manifestLoader = {
  writeCache: function(loader, options, manifest, callback) {
    var filePath;
    filePath = path.resolve(loader.baseDir, options.manifest);
    return fs.writeFile(filePath, JSON.stringify(manifest, null, 2), {
      encoding: 'utf-8'
    }, callback);
  },
  readCache: function(loader, options, callback) {
    options.discover = false;
    return manifest.load.load(loader.baseDir, options, callback);
  },
  prepareManifestOptions: function(loader) {
    var options;
    if (!loader.options) {
      loader.options = {};
    }
    options = {};
    options.runtimes = loader.options.runtimes || [];
    if (options.runtimes.indexOf('noflo') === -1) {
      options.runtimes.push('noflo');
    }
    options.recursive = typeof loader.options.recursive === 'undefined' ? true : loader.options.recursive;
    if (!options.manifest) {
      options.manifest = 'fbp.json';
    }
    return options;
  },
  listComponents: function(loader, manifestOptions, callback) {
    return this.readCache(loader, manifestOptions, (function(_this) {
      return function(err, manifest) {
        if (err) {
          if (!loader.options.discover) {
            return callback(err);
          }
          dynamicLoader.listComponents(loader, manifestOptions, function(err, modules) {
            if (err) {
              return callback(err);
            }
            return _this.writeCache(loader, manifestOptions, {
              version: 1,
              modules: modules
            }, function(err) {
              if (err) {
                return callback(err);
              }
              return callback(null, modules);
            });
          });
          return;
        }
        return registerModules(loader, manifest.modules, function(err) {
          if (err) {
            return callback(err);
          }
          return callback(null, manifest.modules);
        });
      };
    })(this));
  }
};

dynamicLoader = {
  listComponents: function(loader, manifestOptions, callback) {
    manifestOptions.discover = true;
    return manifest.list.list(loader.baseDir, manifestOptions, (function(_this) {
      return function(err, modules) {
        if (err) {
          return callback(err);
        }
        return registerModules(loader, modules, function(err) {
          if (err) {
            return callback(err);
          }
          return callback(null, modules);
        });
      };
    })(this));
  }
};

registerSubgraph = function(loader) {
  var graphPath;
  if (path.extname(__filename) === '.js') {
    graphPath = path.resolve(__dirname, '../../src/components/Graph.coffee');
  } else {
    graphPath = path.resolve(__dirname, '../../components/Graph.coffee');
  }
  return loader.registerComponent(null, 'Graph', graphPath);
};

exports.register = function(loader, callback) {
  var manifestOptions, ref;
  manifestOptions = manifestLoader.prepareManifestOptions(loader);
  if ((ref = loader.options) != null ? ref.cache : void 0) {
    manifestLoader.listComponents(loader, manifestOptions, function(err, modules) {
      if (err) {
        return callback(err);
      }
      registerSubgraph(loader);
      return callback(null, modules);
    });
    return;
  }
  return dynamicLoader.listComponents(loader, manifestOptions, function(err, modules) {
    if (err) {
      return callback(err);
    }
    registerSubgraph(loader);
    return callback(null, modules);
  });
};

exports.dynamicLoad = function(name, cPath, metadata, callback) {
  var e, implementation, instance;
  try {
    implementation = require(cPath);
  } catch (error) {
    e = error;
    callback(e);
    return;
  }
  if (typeof implementation.getComponent === 'function') {
    instance = implementation.getComponent(metadata);
  } else if (typeof implementation === 'function') {
    instance = implementation(metadata);
  } else {
    callback(new Error("Unable to instantiate " + cPath));
    return;
  }
  if (typeof name === 'string') {
    instance.componentName = name;
  }
  return callback(null, instance);
};

exports.setSource = function(loader, packageId, name, source, language, callback) {
  var Module, babel, e, implementation, moduleImpl, modulePath;
  Module = require('module');
  if (language === 'coffeescript') {
    try {
      source = CoffeeScript.compile(source, {
        bare: true
      });
    } catch (error) {
      e = error;
      return callback(e);
    }
  } else if (language === 'es6' || language === 'es2015') {
    try {
      babel = require('babel-core');
      source = babel.transform(source).code;
    } catch (error) {
      e = error;
      return callback(e);
    }
  }
  try {
    modulePath = path.resolve(loader.baseDir, "./components/" + name + ".js");
    moduleImpl = new Module(modulePath, module);
    moduleImpl.paths = Module._nodeModulePaths(path.dirname(modulePath));
    moduleImpl.filename = modulePath;
    moduleImpl._compile(source, modulePath);
    implementation = moduleImpl.exports;
  } catch (error) {
    e = error;
    return callback(e);
  }
  if (!(implementation || implementation.getComponent)) {
    return callback(new Error('Provided source failed to create a runnable component'));
  }
  return loader.registerComponent(packageId, name, implementation, callback);
};

exports.getSource = function(loader, name, callback) {
  var component, componentName, nameParts;
  component = loader.components[name];
  if (!component) {
    for (componentName in loader.components) {
      if (componentName.split('/')[1] === name) {
        component = loader.components[componentName];
        name = componentName;
        break;
      }
    }
    if (!component) {
      return callback(new Error("Component " + name + " not installed"));
    }
  }
  nameParts = name.split('/');
  if (nameParts.length === 1) {
    nameParts[1] = nameParts[0];
    nameParts[0] = '';
  }
  if (loader.isGraph(component)) {
    if (typeof component === 'object') {
      if (typeof component.toJSON === 'function') {
        callback(null, {
          name: nameParts[1],
          library: nameParts[0],
          code: JSON.stringify(component.toJSON()),
          language: 'json'
        });
        return;
      }
      return callback(new Error("Can't provide source for " + name + ". Not a file"));
    }
    fbpGraph.graph.loadFile(component, function(err, graph) {
      if (err) {
        return callback(err);
      }
      if (!graph) {
        return callback(new Error('Unable to load graph'));
      }
      return callback(null, {
        name: nameParts[1],
        library: nameParts[0],
        code: JSON.stringify(graph.toJSON()),
        language: 'json'
      });
    });
    return;
  }
  if (typeof component !== 'string') {
    return callback(new Error("Can't provide source for " + name + ". Not a file"));
  }
  return fs.readFile(component, 'utf-8', function(err, code) {
    if (err) {
      return callback(err);
    }
    return callback(null, {
      name: nameParts[1],
      library: nameParts[0],
      language: utils.guessLanguageFromFilename(component),
      code: code
    });
  });
};

});
___scope___.file("lib/loader/register.coffee", function(exports, require, module, __filename, __dirname){ 

var isBrowser;

isBrowser = require('../Platform').isBrowser;

if (isBrowser()) {
  module.exports = require('./ComponentIo');
} else {
  module.exports = require('./NodeJs');
}

});
___scope___.file("lib/Network.coffee", function(exports, require, module, __filename, __dirname){ 

var EventEmitter, Network, componentLoader, graph, internalSocket, platform, utils,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

internalSocket = require("./InternalSocket");

graph = require("fbp-graph");

EventEmitter = require('events').EventEmitter;

platform = require('./Platform');

componentLoader = require('./ComponentLoader');

utils = require('./Utils');

Network = (function(superClass) {
  extend(Network, superClass);

  Network.prototype.processes = {};

  Network.prototype.connections = [];

  Network.prototype.initials = [];

  Network.prototype.defaults = [];

  Network.prototype.graph = null;

  Network.prototype.startupDate = null;

  function Network(graph, options) {
    this.options = options != null ? options : {};
    this.processes = {};
    this.connections = [];
    this.initials = [];
    this.nextInitials = [];
    this.defaults = [];
    this.graph = graph;
    this.started = false;
    this.debug = true;
    this.eventBuffer = [];
    if (!platform.isBrowser()) {
      this.baseDir = graph.baseDir || process.cwd();
    } else {
      this.baseDir = graph.baseDir || '/';
    }
    this.startupDate = null;
    if (graph.componentLoader) {
      this.loader = graph.componentLoader;
    } else {
      this.loader = new componentLoader.ComponentLoader(this.baseDir, this.options);
    }
  }

  Network.prototype.uptime = function() {
    if (!this.startupDate) {
      return 0;
    }
    return new Date() - this.startupDate;
  };

  Network.prototype.getActiveProcesses = function() {
    var active, name, process, ref;
    active = [];
    if (!this.started) {
      return active;
    }
    ref = this.processes;
    for (name in ref) {
      process = ref[name];
      if (process.component.load > 0) {
        active.push(name);
      }
      if (process.component.__openConnections > 0) {
        active.push(name);
      }
    }
    return active;
  };

  Network.prototype.bufferedEmit = function(event, payload) {
    var ev, i, len, ref;
    if (event === 'error' || event === 'process-error' || event === 'end') {
      this.emit(event, payload);
      return;
    }
    if (!this.isStarted() && event !== 'end') {
      this.eventBuffer.push({
        type: event,
        payload: payload
      });
      return;
    }
    this.emit(event, payload);
    if (event === 'start') {
      ref = this.eventBuffer;
      for (i = 0, len = ref.length; i < len; i++) {
        ev = ref[i];
        this.emit(ev.type, ev.payload);
      }
      return this.eventBuffer = [];
    }
  };

  Network.prototype.load = function(component, metadata, callback) {
    return this.loader.load(component, callback, metadata);
  };

  Network.prototype.addNode = function(node, callback) {
    var process;
    if (this.processes[node.id]) {
      callback(null, this.processes[node.id]);
      return;
    }
    process = {
      id: node.id
    };
    if (!node.component) {
      this.processes[process.id] = process;
      callback(null, process);
      return;
    }
    return this.load(node.component, node.metadata, (function(_this) {
      return function(err, instance) {
        var inPorts, name, outPorts, port;
        if (err) {
          return callback(err);
        }
        instance.nodeId = node.id;
        process.component = instance;
        process.componentName = node.component;
        inPorts = process.component.inPorts.ports || process.component.inPorts;
        outPorts = process.component.outPorts.ports || process.component.outPorts;
        for (name in inPorts) {
          port = inPorts[name];
          port.node = node.id;
          port.nodeInstance = instance;
          port.name = name;
        }
        for (name in outPorts) {
          port = outPorts[name];
          port.node = node.id;
          port.nodeInstance = instance;
          port.name = name;
        }
        if (instance.isSubgraph()) {
          _this.subscribeSubgraph(process);
        }
        _this.subscribeNode(process);
        _this.processes[process.id] = process;
        return callback(null, process);
      };
    })(this));
  };

  Network.prototype.removeNode = function(node, callback) {
    if (!this.processes[node.id]) {
      return callback(new Error("Node " + node.id + " not found"));
    }
    return this.processes[node.id].component.shutdown((function(_this) {
      return function(err) {
        if (err) {
          return callback(err);
        }
        delete _this.processes[node.id];
        return callback(null);
      };
    })(this));
  };

  Network.prototype.renameNode = function(oldId, newId, callback) {
    var inPorts, name, outPorts, port, process;
    process = this.getNode(oldId);
    if (!process) {
      return callback(new Error("Process " + oldId + " not found"));
    }
    process.id = newId;
    inPorts = process.component.inPorts.ports || process.component.inPorts;
    outPorts = process.component.outPorts.ports || process.component.outPorts;
    for (name in inPorts) {
      port = inPorts[name];
      if (!port) {
        continue;
      }
      port.node = newId;
    }
    for (name in outPorts) {
      port = outPorts[name];
      if (!port) {
        continue;
      }
      port.node = newId;
    }
    this.processes[newId] = process;
    delete this.processes[oldId];
    return callback(null);
  };

  Network.prototype.getNode = function(id) {
    return this.processes[id];
  };

  Network.prototype.connect = function(done) {
    var callStack, edges, initializers, nodes, serialize, setDefaults, subscribeGraph;
    if (done == null) {
      done = function() {};
    }
    callStack = 0;
    serialize = (function(_this) {
      return function(next, add) {
        return function(type) {
          return _this["add" + type](add, function(err) {
            if (err) {
              return done(err);
            }
            callStack++;
            if (callStack % 100 === 0) {
              setTimeout(function() {
                return next(type);
              }, 0);
              return;
            }
            return next(type);
          });
        };
      };
    })(this);
    subscribeGraph = (function(_this) {
      return function() {
        _this.subscribeGraph();
        return done();
      };
    })(this);
    setDefaults = utils.reduceRight(this.graph.nodes, serialize, subscribeGraph);
    initializers = utils.reduceRight(this.graph.initializers, serialize, function() {
      return setDefaults("Defaults");
    });
    edges = utils.reduceRight(this.graph.edges, serialize, function() {
      return initializers("Initial");
    });
    nodes = utils.reduceRight(this.graph.nodes, serialize, function() {
      return edges("Edge");
    });
    return nodes("Node");
  };

  Network.prototype.connectPort = function(socket, process, port, index, inbound) {
    if (inbound) {
      socket.to = {
        process: process,
        port: port,
        index: index
      };
      if (!(process.component.inPorts && process.component.inPorts[port])) {
        throw new Error("No inport '" + port + "' defined in process " + process.id + " (" + (socket.getId()) + ")");
        return;
      }
      if (process.component.inPorts[port].isAddressable()) {
        return process.component.inPorts[port].attach(socket, index);
      }
      return process.component.inPorts[port].attach(socket);
    }
    socket.from = {
      process: process,
      port: port,
      index: index
    };
    if (!(process.component.outPorts && process.component.outPorts[port])) {
      throw new Error("No outport '" + port + "' defined in process " + process.id + " (" + (socket.getId()) + ")");
      return;
    }
    if (process.component.outPorts[port].isAddressable()) {
      return process.component.outPorts[port].attach(socket, index);
    }
    return process.component.outPorts[port].attach(socket);
  };

  Network.prototype.subscribeGraph = function() {
    var graphOps, processOps, processing, registerOp;
    graphOps = [];
    processing = false;
    registerOp = function(op, details) {
      return graphOps.push({
        op: op,
        details: details
      });
    };
    processOps = (function(_this) {
      return function(err) {
        var cb, op;
        if (err) {
          if (_this.listeners('process-error').length === 0) {
            throw err;
          }
          _this.bufferedEmit('process-error', err);
        }
        if (!graphOps.length) {
          processing = false;
          return;
        }
        processing = true;
        op = graphOps.shift();
        cb = processOps;
        switch (op.op) {
          case 'renameNode':
            return _this.renameNode(op.details.from, op.details.to, cb);
          default:
            return _this[op.op](op.details, cb);
        }
      };
    })(this);
    this.graph.on('addNode', function(node) {
      registerOp('addNode', node);
      if (!processing) {
        return processOps();
      }
    });
    this.graph.on('removeNode', function(node) {
      registerOp('removeNode', node);
      if (!processing) {
        return processOps();
      }
    });
    this.graph.on('renameNode', function(oldId, newId) {
      registerOp('renameNode', {
        from: oldId,
        to: newId
      });
      if (!processing) {
        return processOps();
      }
    });
    this.graph.on('addEdge', function(edge) {
      registerOp('addEdge', edge);
      if (!processing) {
        return processOps();
      }
    });
    this.graph.on('removeEdge', function(edge) {
      registerOp('removeEdge', edge);
      if (!processing) {
        return processOps();
      }
    });
    this.graph.on('addInitial', function(iip) {
      registerOp('addInitial', iip);
      if (!processing) {
        return processOps();
      }
    });
    return this.graph.on('removeInitial', function(iip) {
      registerOp('removeInitial', iip);
      if (!processing) {
        return processOps();
      }
    });
  };

  Network.prototype.subscribeSubgraph = function(node) {
    var emitSub;
    if (!node.component.isReady()) {
      node.component.once('ready', (function(_this) {
        return function() {
          return _this.subscribeSubgraph(node);
        };
      })(this));
      return;
    }
    if (!node.component.network) {
      return;
    }
    node.component.network.setDebug(this.debug);
    emitSub = (function(_this) {
      return function(type, data) {
        if (type === 'process-error' && _this.listeners('process-error').length === 0) {
          if (data.id && data.metadata && data.error) {
            throw data.error;
          }
          throw data;
        }
        if (!data) {
          data = {};
        }
        if (data.subgraph) {
          if (!data.subgraph.unshift) {
            data.subgraph = [data.subgraph];
          }
          data.subgraph = data.subgraph.unshift(node.id);
        } else {
          data.subgraph = [node.id];
        }
        return _this.bufferedEmit(type, data);
      };
    })(this);
    node.component.network.on('connect', function(data) {
      return emitSub('connect', data);
    });
    node.component.network.on('begingroup', function(data) {
      return emitSub('begingroup', data);
    });
    node.component.network.on('data', function(data) {
      return emitSub('data', data);
    });
    node.component.network.on('endgroup', function(data) {
      return emitSub('endgroup', data);
    });
    node.component.network.on('disconnect', function(data) {
      return emitSub('disconnect', data);
    });
    node.component.network.on('ip', function(data) {
      return emitSub('ip', data);
    });
    return node.component.network.on('process-error', function(data) {
      return emitSub('process-error', data);
    });
  };

  Network.prototype.subscribeSocket = function(socket, source) {
    socket.on('ip', (function(_this) {
      return function(ip) {
        return _this.bufferedEmit('ip', {
          id: socket.getId(),
          type: ip.type,
          socket: socket,
          data: ip.data,
          metadata: socket.metadata
        });
      };
    })(this));
    socket.on('connect', (function(_this) {
      return function() {
        if (source && source.component.isLegacy()) {
          if (!source.component.__openConnections) {
            source.component.__openConnections = 0;
          }
          source.component.__openConnections++;
        }
        return _this.bufferedEmit('connect', {
          id: socket.getId(),
          socket: socket,
          metadata: socket.metadata
        });
      };
    })(this));
    socket.on('begingroup', (function(_this) {
      return function(group) {
        return _this.bufferedEmit('begingroup', {
          id: socket.getId(),
          socket: socket,
          group: group,
          metadata: socket.metadata
        });
      };
    })(this));
    socket.on('data', (function(_this) {
      return function(data) {
        return _this.bufferedEmit('data', {
          id: socket.getId(),
          socket: socket,
          data: data,
          metadata: socket.metadata
        });
      };
    })(this));
    socket.on('endgroup', (function(_this) {
      return function(group) {
        return _this.bufferedEmit('endgroup', {
          id: socket.getId(),
          socket: socket,
          group: group,
          metadata: socket.metadata
        });
      };
    })(this));
    socket.on('disconnect', (function(_this) {
      return function() {
        _this.bufferedEmit('disconnect', {
          id: socket.getId(),
          socket: socket,
          metadata: socket.metadata
        });
        if (source && source.component.isLegacy()) {
          source.component.__openConnections--;
          if (source.component.__openConnections < 0) {
            source.component.__openConnections = 0;
          }
          if (source.component.__openConnections === 0) {
            return _this.checkIfFinished();
          }
        }
      };
    })(this));
    return socket.on('error', (function(_this) {
      return function(event) {
        if (_this.listeners('process-error').length === 0) {
          if (event.id && event.metadata && event.error) {
            throw event.error;
          }
          throw event;
        }
        return _this.bufferedEmit('process-error', event);
      };
    })(this));
  };

  Network.prototype.subscribeNode = function(node) {
    node.component.on('deactivate', (function(_this) {
      return function(load) {
        if (load > 0) {
          return;
        }
        return _this.checkIfFinished();
      };
    })(this));
    if (!node.component.getIcon) {
      return;
    }
    return node.component.on('icon', (function(_this) {
      return function() {
        return _this.bufferedEmit('icon', {
          id: node.id,
          icon: node.component.getIcon()
        });
      };
    })(this));
  };

  Network.prototype.addEdge = function(edge, callback) {
    var from, socket, to;
    socket = internalSocket.createSocket(edge.metadata);
    socket.setDebug(this.debug);
    from = this.getNode(edge.from.node);
    if (!from) {
      return callback(new Error("No process defined for outbound node " + edge.from.node));
    }
    if (!from.component) {
      return callback(new Error("No component defined for outbound node " + edge.from.node));
    }
    if (!from.component.isReady()) {
      from.component.once("ready", (function(_this) {
        return function() {
          return _this.addEdge(edge, callback);
        };
      })(this));
      return;
    }
    to = this.getNode(edge.to.node);
    if (!to) {
      return callback(new Error("No process defined for inbound node " + edge.to.node));
    }
    if (!to.component) {
      return callback(new Error("No component defined for inbound node " + edge.to.node));
    }
    if (!to.component.isReady()) {
      to.component.once("ready", (function(_this) {
        return function() {
          return _this.addEdge(edge, callback);
        };
      })(this));
      return;
    }
    this.subscribeSocket(socket, from);
    this.connectPort(socket, to, edge.to.port, edge.to.index, true);
    this.connectPort(socket, from, edge.from.port, edge.from.index, false);
    this.connections.push(socket);
    return callback();
  };

  Network.prototype.removeEdge = function(edge, callback) {
    var connection, i, len, ref, results;
    ref = this.connections;
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      connection = ref[i];
      if (!connection) {
        continue;
      }
      if (!(edge.to.node === connection.to.process.id && edge.to.port === connection.to.port)) {
        continue;
      }
      connection.to.process.component.inPorts[connection.to.port].detach(connection);
      if (edge.from.node) {
        if (connection.from && edge.from.node === connection.from.process.id && edge.from.port === connection.from.port) {
          connection.from.process.component.outPorts[connection.from.port].detach(connection);
        }
      }
      this.connections.splice(this.connections.indexOf(connection), 1);
      results.push(callback());
    }
    return results;
  };

  Network.prototype.addDefaults = function(node, callback) {
    var key, port, process, ref, socket;
    process = this.processes[node.id];
    if (!process.component.isReady()) {
      if (process.component.setMaxListeners) {
        process.component.setMaxListeners(0);
      }
      process.component.once("ready", (function(_this) {
        return function() {
          return _this.addDefaults(process, callback);
        };
      })(this));
      return;
    }
    ref = process.component.inPorts.ports;
    for (key in ref) {
      port = ref[key];
      if (typeof port.hasDefault === 'function' && port.hasDefault() && !port.isAttached()) {
        socket = internalSocket.createSocket();
        socket.setDebug(this.debug);
        this.subscribeSocket(socket);
        this.connectPort(socket, process, key, void 0, true);
        this.connections.push(socket);
        this.defaults.push(socket);
      }
    }
    return callback();
  };

  Network.prototype.addInitial = function(initializer, callback) {
    var init, socket, to;
    socket = internalSocket.createSocket(initializer.metadata);
    socket.setDebug(this.debug);
    this.subscribeSocket(socket);
    to = this.getNode(initializer.to.node);
    if (!to) {
      return callback(new Error("No process defined for inbound node " + initializer.to.node));
    }
    if (!(to.component.isReady() || to.component.inPorts[initializer.to.port])) {
      if (to.component.setMaxListeners) {
        to.component.setMaxListeners(0);
      }
      to.component.once("ready", (function(_this) {
        return function() {
          return _this.addInitial(initializer, callback);
        };
      })(this));
      return;
    }
    this.connectPort(socket, to, initializer.to.port, initializer.to.index, true);
    this.connections.push(socket);
    init = {
      socket: socket,
      data: initializer.from.data
    };
    this.initials.push(init);
    this.nextInitials.push(init);
    if (this.isStarted()) {
      this.sendInitials();
    }
    return callback();
  };

  Network.prototype.removeInitial = function(initializer, callback) {
    var connection, i, init, j, k, len, len1, len2, ref, ref1, ref2;
    ref = this.connections;
    for (i = 0, len = ref.length; i < len; i++) {
      connection = ref[i];
      if (!connection) {
        continue;
      }
      if (!(initializer.to.node === connection.to.process.id && initializer.to.port === connection.to.port)) {
        continue;
      }
      connection.to.process.component.inPorts[connection.to.port].detach(connection);
      this.connections.splice(this.connections.indexOf(connection), 1);
      ref1 = this.initials;
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        init = ref1[j];
        if (!init) {
          continue;
        }
        if (init.socket !== connection) {
          continue;
        }
        this.initials.splice(this.initials.indexOf(init), 1);
      }
      ref2 = this.nextInitials;
      for (k = 0, len2 = ref2.length; k < len2; k++) {
        init = ref2[k];
        if (!init) {
          continue;
        }
        if (init.socket !== connection) {
          continue;
        }
        this.nextInitials.splice(this.nextInitials.indexOf(init), 1);
      }
    }
    return callback();
  };

  Network.prototype.sendInitial = function(initial) {
    initial.socket.connect();
    initial.socket.send(initial.data);
    return initial.socket.disconnect();
  };

  Network.prototype.sendInitials = function(callback) {
    var send;
    if (!callback) {
      callback = function() {};
    }
    send = (function(_this) {
      return function() {
        var i, initial, len, ref;
        ref = _this.initials;
        for (i = 0, len = ref.length; i < len; i++) {
          initial = ref[i];
          _this.sendInitial(initial);
        }
        _this.initials = [];
        return callback();
      };
    })(this);
    if (typeof process !== 'undefined' && process.execPath && process.execPath.indexOf('node') !== -1) {
      return process.nextTick(send);
    } else {
      return setTimeout(send, 0);
    }
  };

  Network.prototype.isStarted = function() {
    return this.started;
  };

  Network.prototype.isRunning = function() {
    if (!this.started) {
      return false;
    }
    return this.getActiveProcesses().length > 0;
  };

  Network.prototype.startComponents = function(callback) {
    var count, id, length, onProcessStart, process, ref, results;
    if (!callback) {
      callback = function() {};
    }
    count = 0;
    length = this.processes ? Object.keys(this.processes).length : 0;
    onProcessStart = function(err) {
      if (err) {
        return callback(err);
      }
      count++;
      if (count === length) {
        return callback();
      }
    };
    if (!(this.processes && Object.keys(this.processes).length)) {
      return callback();
    }
    ref = this.processes;
    results = [];
    for (id in ref) {
      process = ref[id];
      if (process.component.isStarted()) {
        onProcessStart();
        continue;
      }
      if (process.component.start.length === 0) {
        platform.deprecated('component.start method without callback is deprecated');
        process.component.start();
        onProcessStart();
        continue;
      }
      results.push(process.component.start(onProcessStart));
    }
    return results;
  };

  Network.prototype.sendDefaults = function(callback) {
    var i, len, ref, socket;
    if (!callback) {
      callback = function() {};
    }
    if (!this.defaults.length) {
      return callback();
    }
    ref = this.defaults;
    for (i = 0, len = ref.length; i < len; i++) {
      socket = ref[i];
      if (socket.to.process.component.inPorts[socket.to.port].sockets.length !== 1) {
        continue;
      }
      socket.connect();
      socket.send();
      socket.disconnect();
    }
    return callback();
  };

  Network.prototype.start = function(callback) {
    if (!callback) {
      platform.deprecated('Calling network.start() without callback is deprecated');
      callback = function() {};
    }
    if (this.debouncedEnd) {
      this.abortDebounce = true;
    }
    if (this.started) {
      this.stop((function(_this) {
        return function(err) {
          if (err) {
            return callback(err);
          }
          return _this.start(callback);
        };
      })(this));
      return;
    }
    this.initials = this.nextInitials.slice(0);
    this.eventBuffer = [];
    return this.startComponents((function(_this) {
      return function(err) {
        if (err) {
          return callback(err);
        }
        return _this.sendInitials(function(err) {
          if (err) {
            return callback(err);
          }
          return _this.sendDefaults(function(err) {
            if (err) {
              return callback(err);
            }
            _this.setStarted(true);
            return callback(null);
          });
        });
      };
    })(this));
  };

  Network.prototype.stop = function(callback) {
    var connection, count, i, id, len, length, onProcessEnd, process, ref, ref1, results;
    if (!callback) {
      platform.deprecated('Calling network.stop() without callback is deprecated');
      callback = function() {};
    }
    if (this.debouncedEnd) {
      this.abortDebounce = true;
    }
    if (!this.started) {
      return callback(null);
    }
    ref = this.connections;
    for (i = 0, len = ref.length; i < len; i++) {
      connection = ref[i];
      if (!connection.isConnected()) {
        continue;
      }
      connection.disconnect();
    }
    count = 0;
    length = this.processes ? Object.keys(this.processes).length : 0;
    onProcessEnd = (function(_this) {
      return function(err) {
        if (err) {
          return callback(err);
        }
        count++;
        if (count === length) {
          _this.setStarted(false);
          return callback();
        }
      };
    })(this);
    if (!(this.processes && Object.keys(this.processes).length)) {
      this.setStarted(false);
      return callback();
    }
    ref1 = this.processes;
    results = [];
    for (id in ref1) {
      process = ref1[id];
      if (!process.component.isStarted()) {
        onProcessEnd();
        continue;
      }
      if (process.component.shutdown.length === 0) {
        platform.deprecated('component.shutdown method without callback is deprecated');
        process.component.shutdown();
        onProcessEnd();
        continue;
      }
      results.push(process.component.shutdown(onProcessEnd));
    }
    return results;
  };

  Network.prototype.setStarted = function(started) {
    if (this.started === started) {
      return;
    }
    if (!started) {
      this.started = false;
      this.bufferedEmit('end', {
        start: this.startupDate,
        end: new Date,
        uptime: this.uptime()
      });
      return;
    }
    if (!this.startupDate) {
      this.startupDate = new Date;
    }
    this.started = true;
    return this.bufferedEmit('start', {
      start: this.startupDate
    });
  };

  Network.prototype.checkIfFinished = function() {
    if (this.isRunning()) {
      return;
    }
    delete this.abortDebounce;
    if (!this.debouncedEnd) {
      this.debouncedEnd = utils.debounce((function(_this) {
        return function() {
          if (_this.abortDebounce) {
            return;
          }
          return _this.setStarted(false);
        };
      })(this), 50);
    }
    return this.debouncedEnd();
  };

  Network.prototype.getDebug = function() {
    return this.debug;
  };

  Network.prototype.setDebug = function(active) {
    var i, instance, len, process, processId, ref, ref1, results, socket;
    if (active === this.debug) {
      return;
    }
    this.debug = active;
    ref = this.connections;
    for (i = 0, len = ref.length; i < len; i++) {
      socket = ref[i];
      socket.setDebug(active);
    }
    ref1 = this.processes;
    results = [];
    for (processId in ref1) {
      process = ref1[processId];
      instance = process.component;
      if (instance.isSubgraph()) {
        results.push(instance.network.setDebug(active));
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  return Network;

})(EventEmitter);

exports.Network = Network;

});
___scope___.file("lib/NoFlo.coffee", function(exports, require, module, __filename, __dirname){ 

var fbpGraph, ports;

fbpGraph = require('fbp-graph');

exports.graph = fbpGraph.graph;

exports.Graph = fbpGraph.Graph;

exports.journal = fbpGraph.journal;

exports.Journal = fbpGraph.Journal;

exports.Network = require('./Network').Network;

exports.isBrowser = require('./Platform').isBrowser;

exports.ComponentLoader = require('./ComponentLoader').ComponentLoader;

exports.Component = require('./Component').Component;

exports.AsyncComponent = require('./AsyncComponent').AsyncComponent;

exports.helpers = require('./Helpers');

exports.streams = require('./Streams');

ports = require('./Ports');

exports.InPorts = ports.InPorts;

exports.OutPorts = ports.OutPorts;

exports.InPort = require('./InPort');

exports.OutPort = require('./OutPort');

exports.Port = require('./Port').Port;

exports.ArrayPort = require('./ArrayPort').ArrayPort;

exports.internalSocket = require('./InternalSocket');

exports.IP = require('./IP');

exports.createNetwork = function(graph, callback, options) {
  var network, networkReady;
  if (typeof options !== 'object') {
    options = {
      delay: options
    };
  }
  if (typeof callback !== 'function') {
    callback = function(err) {
      if (err) {
        throw err;
      }
    };
  }
  network = new exports.Network(graph, options);
  networkReady = function(network) {
    return network.start(function(err) {
      if (err) {
        return callback(err);
      }
      return callback(null, network);
    });
  };
  network.loader.listComponents(function(err) {
    if (err) {
      return callback(err);
    }
    if (graph.nodes.length === 0) {
      return networkReady(network);
    }
    if (options.delay) {
      callback(null, network);
      return;
    }
    return network.connect(function(err) {
      if (err) {
        return callback(err);
      }
      return networkReady(network);
    });
  });
  return network;
};

exports.loadFile = function(file, options, callback) {
  var baseDir;
  if (!callback) {
    callback = options;
    baseDir = null;
  }
  if (callback && typeof options !== 'object') {
    options = {
      baseDir: options
    };
  }
  return exports.graph.loadFile(file, function(err, net) {
    if (err) {
      return callback(err);
    }
    if (options.baseDir) {
      net.baseDir = options.baseDir;
    }
    return exports.createNetwork(net, callback, options);
  });
};

exports.saveFile = function(graph, file, callback) {
  return exports.graph.save(file, function() {
    return callback(file);
  });
};

});
___scope___.file("lib/OutPort.coffee", function(exports, require, module, __filename, __dirname){ 

var BasePort, IP, OutPort,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

BasePort = require('./BasePort');

IP = require('./IP');

OutPort = (function(superClass) {
  extend(OutPort, superClass);

  function OutPort(options) {
    this.cache = {};
    OutPort.__super__.constructor.call(this, options);
  }

  OutPort.prototype.attach = function(socket, index) {
    if (index == null) {
      index = null;
    }
    OutPort.__super__.attach.call(this, socket, index);
    if (this.isCaching() && (this.cache[index] != null)) {
      return this.send(this.cache[index], index);
    }
  };

  OutPort.prototype.connect = function(socketId) {
    var i, len, results, socket, sockets;
    if (socketId == null) {
      socketId = null;
    }
    sockets = this.getSockets(socketId);
    this.checkRequired(sockets);
    results = [];
    for (i = 0, len = sockets.length; i < len; i++) {
      socket = sockets[i];
      if (!socket) {
        continue;
      }
      results.push(socket.connect());
    }
    return results;
  };

  OutPort.prototype.beginGroup = function(group, socketId) {
    var sockets;
    if (socketId == null) {
      socketId = null;
    }
    sockets = this.getSockets(socketId);
    this.checkRequired(sockets);
    return sockets.forEach(function(socket) {
      if (!socket) {
        return;
      }
      return socket.beginGroup(group);
    });
  };

  OutPort.prototype.send = function(data, socketId) {
    var sockets;
    if (socketId == null) {
      socketId = null;
    }
    sockets = this.getSockets(socketId);
    this.checkRequired(sockets);
    if (this.isCaching() && data !== this.cache[socketId]) {
      this.cache[socketId] = data;
    }
    return sockets.forEach(function(socket) {
      if (!socket) {
        return;
      }
      return socket.send(data);
    });
  };

  OutPort.prototype.endGroup = function(socketId) {
    var i, len, results, socket, sockets;
    if (socketId == null) {
      socketId = null;
    }
    sockets = this.getSockets(socketId);
    this.checkRequired(sockets);
    results = [];
    for (i = 0, len = sockets.length; i < len; i++) {
      socket = sockets[i];
      if (!socket) {
        continue;
      }
      results.push(socket.endGroup());
    }
    return results;
  };

  OutPort.prototype.disconnect = function(socketId) {
    var i, len, results, socket, sockets;
    if (socketId == null) {
      socketId = null;
    }
    sockets = this.getSockets(socketId);
    this.checkRequired(sockets);
    results = [];
    for (i = 0, len = sockets.length; i < len; i++) {
      socket = sockets[i];
      if (!socket) {
        continue;
      }
      results.push(socket.disconnect());
    }
    return results;
  };

  OutPort.prototype.sendIP = function(type, data, options, socketId, autoConnect) {
    var i, ip, len, pristine, ref, socket, sockets;
    if (autoConnect == null) {
      autoConnect = true;
    }
    if (IP.isIP(type)) {
      ip = type;
      socketId = ip.index;
    } else {
      ip = new IP(type, data, options);
    }
    sockets = this.getSockets(socketId);
    this.checkRequired(sockets);
    if (this.isCaching() && data !== ((ref = this.cache[socketId]) != null ? ref.data : void 0)) {
      this.cache[socketId] = ip;
    }
    pristine = true;
    for (i = 0, len = sockets.length; i < len; i++) {
      socket = sockets[i];
      if (!socket) {
        continue;
      }
      if (pristine) {
        socket.post(ip, autoConnect);
        pristine = false;
      } else {
        if (ip.clonable) {
          ip = ip.clone();
        }
        socket.post(ip, autoConnect);
      }
    }
    return this;
  };

  OutPort.prototype.openBracket = function(data, options, socketId) {
    if (data == null) {
      data = null;
    }
    if (options == null) {
      options = {};
    }
    if (socketId == null) {
      socketId = null;
    }
    return this.sendIP('openBracket', data, options, socketId);
  };

  OutPort.prototype.data = function(data, options, socketId) {
    if (options == null) {
      options = {};
    }
    if (socketId == null) {
      socketId = null;
    }
    return this.sendIP('data', data, options, socketId);
  };

  OutPort.prototype.closeBracket = function(data, options, socketId) {
    if (data == null) {
      data = null;
    }
    if (options == null) {
      options = {};
    }
    if (socketId == null) {
      socketId = null;
    }
    return this.sendIP('closeBracket', data, options, socketId);
  };

  OutPort.prototype.checkRequired = function(sockets) {
    if (sockets.length === 0 && this.isRequired()) {
      throw new Error((this.getId()) + ": No connections available");
    }
  };

  OutPort.prototype.getSockets = function(socketId) {
    if (this.isAddressable()) {
      if (socketId === null) {
        throw new Error((this.getId()) + " Socket ID required");
      }
      if (!this.sockets[socketId]) {
        return [];
      }
      return [this.sockets[socketId]];
    }
    return this.sockets;
  };

  OutPort.prototype.isCaching = function() {
    if (this.options.caching) {
      return true;
    }
    return false;
  };

  return OutPort;

})(BasePort);

module.exports = OutPort;

});
___scope___.file("lib/Platform.coffee", function(exports, require, module, __filename, __dirname){ 

exports.isBrowser = function() {
  if (typeof process !== 'undefined' && process.execPath && process.execPath.match(/node|iojs/)) {
    return false;
  }
  return true;
};

exports.deprecated = function(message) {
  if (exports.isBrowser()) {
    if (window.NOFLO_FATAL_DEPRECATED) {
      throw new Error(message);
    }
    console.warn(message);
    return;
  }
  if (process.env.NOFLO_FATAL_DEPRECATED) {
    throw new Error(message);
  }
  return console.warn(message);
};

});
___scope___.file("lib/Port.coffee", function(exports, require, module, __filename, __dirname){ 

var EventEmitter, Port, platform,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

EventEmitter = require('events').EventEmitter;

platform = require('./Platform');

Port = (function(superClass) {
  extend(Port, superClass);

  Port.prototype.description = '';

  Port.prototype.required = true;

  function Port(type) {
    this.type = type;
    platform.deprecated('noflo.Port is deprecated. Please port to noflo.InPort/noflo.OutPort');
    if (!this.type) {
      this.type = 'all';
    }
    if (this.type === 'integer') {
      this.type = 'int';
    }
    this.sockets = [];
    this.from = null;
    this.node = null;
    this.name = null;
  }

  Port.prototype.getId = function() {
    if (!(this.node && this.name)) {
      return 'Port';
    }
    return this.node + " " + (this.name.toUpperCase());
  };

  Port.prototype.getDataType = function() {
    return this.type;
  };

  Port.prototype.getDescription = function() {
    return this.description;
  };

  Port.prototype.attach = function(socket) {
    this.sockets.push(socket);
    return this.attachSocket(socket);
  };

  Port.prototype.attachSocket = function(socket, localId) {
    if (localId == null) {
      localId = null;
    }
    this.emit("attach", socket, localId);
    this.from = socket.from;
    if (socket.setMaxListeners) {
      socket.setMaxListeners(0);
    }
    socket.on("connect", (function(_this) {
      return function() {
        return _this.emit("connect", socket, localId);
      };
    })(this));
    socket.on("begingroup", (function(_this) {
      return function(group) {
        return _this.emit("begingroup", group, localId);
      };
    })(this));
    socket.on("data", (function(_this) {
      return function(data) {
        return _this.emit("data", data, localId);
      };
    })(this));
    socket.on("endgroup", (function(_this) {
      return function(group) {
        return _this.emit("endgroup", group, localId);
      };
    })(this));
    return socket.on("disconnect", (function(_this) {
      return function() {
        return _this.emit("disconnect", socket, localId);
      };
    })(this));
  };

  Port.prototype.connect = function() {
    var i, len, ref, results, socket;
    if (this.sockets.length === 0) {
      throw new Error((this.getId()) + ": No connections available");
    }
    ref = this.sockets;
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      socket = ref[i];
      results.push(socket.connect());
    }
    return results;
  };

  Port.prototype.beginGroup = function(group) {
    if (this.sockets.length === 0) {
      throw new Error((this.getId()) + ": No connections available");
    }
    return this.sockets.forEach(function(socket) {
      if (socket.isConnected()) {
        return socket.beginGroup(group);
      }
      socket.once('connect', function() {
        return socket.beginGroup(group);
      });
      return socket.connect();
    });
  };

  Port.prototype.send = function(data) {
    if (this.sockets.length === 0) {
      throw new Error((this.getId()) + ": No connections available");
    }
    return this.sockets.forEach(function(socket) {
      if (socket.isConnected()) {
        return socket.send(data);
      }
      socket.once('connect', function() {
        return socket.send(data);
      });
      return socket.connect();
    });
  };

  Port.prototype.endGroup = function() {
    var i, len, ref, results, socket;
    if (this.sockets.length === 0) {
      throw new Error((this.getId()) + ": No connections available");
    }
    ref = this.sockets;
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      socket = ref[i];
      results.push(socket.endGroup());
    }
    return results;
  };

  Port.prototype.disconnect = function() {
    var i, len, ref, results, socket;
    if (this.sockets.length === 0) {
      throw new Error((this.getId()) + ": No connections available");
    }
    ref = this.sockets;
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      socket = ref[i];
      results.push(socket.disconnect());
    }
    return results;
  };

  Port.prototype.detach = function(socket) {
    var index;
    if (this.sockets.length === 0) {
      return;
    }
    if (!socket) {
      socket = this.sockets[0];
    }
    index = this.sockets.indexOf(socket);
    if (index === -1) {
      return;
    }
    if (this.isAddressable()) {
      this.sockets[index] = void 0;
      this.emit('detach', socket, index);
      return;
    }
    this.sockets.splice(index, 1);
    return this.emit("detach", socket);
  };

  Port.prototype.isConnected = function() {
    var connected;
    connected = false;
    this.sockets.forEach(function(socket) {
      if (socket.isConnected()) {
        return connected = true;
      }
    });
    return connected;
  };

  Port.prototype.isAddressable = function() {
    return false;
  };

  Port.prototype.isRequired = function() {
    return this.required;
  };

  Port.prototype.isAttached = function() {
    if (this.sockets.length > 0) {
      return true;
    }
    return false;
  };

  Port.prototype.listAttached = function() {
    var attached, i, idx, len, ref, socket;
    attached = [];
    ref = this.sockets;
    for (idx = i = 0, len = ref.length; i < len; idx = ++i) {
      socket = ref[idx];
      if (!socket) {
        continue;
      }
      attached.push(idx);
    }
    return attached;
  };

  Port.prototype.canAttach = function() {
    return true;
  };

  Port.prototype.clear = function() {};

  return Port;

})(EventEmitter);

exports.Port = Port;

});
___scope___.file("lib/Ports.coffee", function(exports, require, module, __filename, __dirname){ 

var EventEmitter, InPort, InPorts, OutPort, OutPorts, Ports,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

EventEmitter = require('events').EventEmitter;

InPort = require('./InPort');

OutPort = require('./OutPort');

Ports = (function(superClass) {
  extend(Ports, superClass);

  Ports.prototype.model = InPort;

  function Ports(ports) {
    var name, options;
    this.ports = {};
    if (!ports) {
      return;
    }
    for (name in ports) {
      options = ports[name];
      this.add(name, options);
    }
  }

  Ports.prototype.add = function(name, options, process) {
    if (name === 'add' || name === 'remove') {
      throw new Error('Add and remove are restricted port names');
    }
    if (!name.match(/^[a-z0-9_\.\/]+$/)) {
      throw new Error("Port names can only contain lowercase alphanumeric characters and underscores. '" + name + "' not allowed");
    }
    if (this.ports[name]) {
      this.remove(name);
    }
    if (typeof options === 'object' && options.canAttach) {
      this.ports[name] = options;
    } else {
      this.ports[name] = new this.model(options, process);
    }
    this[name] = this.ports[name];
    this.emit('add', name);
    return this;
  };

  Ports.prototype.remove = function(name) {
    if (!this.ports[name]) {
      throw new Error("Port " + name + " not defined");
    }
    delete this.ports[name];
    delete this[name];
    this.emit('remove', name);
    return this;
  };

  return Ports;

})(EventEmitter);

exports.InPorts = InPorts = (function(superClass) {
  extend(InPorts, superClass);

  function InPorts() {
    return InPorts.__super__.constructor.apply(this, arguments);
  }

  InPorts.prototype.on = function(name, event, callback) {
    if (!this.ports[name]) {
      throw new Error("Port " + name + " not available");
    }
    return this.ports[name].on(event, callback);
  };

  InPorts.prototype.once = function(name, event, callback) {
    if (!this.ports[name]) {
      throw new Error("Port " + name + " not available");
    }
    return this.ports[name].once(event, callback);
  };

  return InPorts;

})(Ports);

exports.OutPorts = OutPorts = (function(superClass) {
  extend(OutPorts, superClass);

  function OutPorts() {
    return OutPorts.__super__.constructor.apply(this, arguments);
  }

  OutPorts.prototype.model = OutPort;

  OutPorts.prototype.connect = function(name, socketId) {
    if (!this.ports[name]) {
      throw new Error("Port " + name + " not available");
    }
    return this.ports[name].connect(socketId);
  };

  OutPorts.prototype.beginGroup = function(name, group, socketId) {
    if (!this.ports[name]) {
      throw new Error("Port " + name + " not available");
    }
    return this.ports[name].beginGroup(group, socketId);
  };

  OutPorts.prototype.send = function(name, data, socketId) {
    if (!this.ports[name]) {
      throw new Error("Port " + name + " not available");
    }
    return this.ports[name].send(data, socketId);
  };

  OutPorts.prototype.endGroup = function(name, socketId) {
    if (!this.ports[name]) {
      throw new Error("Port " + name + " not available");
    }
    return this.ports[name].endGroup(socketId);
  };

  OutPorts.prototype.disconnect = function(name, socketId) {
    if (!this.ports[name]) {
      throw new Error("Port " + name + " not available");
    }
    return this.ports[name].disconnect(socketId);
  };

  return OutPorts;

})(Ports);

exports.normalizePortName = function(name) {
  var matched, port;
  port = {
    name: name
  };
  if (name.indexOf('[') === -1) {
    return port;
  }
  matched = name.match(/(.*)\[([0-9]+)\]/);
  if (!(matched != null ? matched.length : void 0)) {
    return name;
  }
  port.name = matched[1];
  port.index = matched[2];
  return port;
};

});
___scope___.file("lib/Streams.coffee", function(exports, require, module, __filename, __dirname){ 

var IP, StreamReceiver, StreamSender, Substream;

IP = (function() {
  function IP(data1) {
    this.data = data1;
  }

  IP.prototype.sendTo = function(port) {
    return port.send(this.data);
  };

  IP.prototype.getValue = function() {
    return this.data;
  };

  IP.prototype.toObject = function() {
    return this.data;
  };

  return IP;

})();

exports.IP = IP;

Substream = (function() {
  function Substream(key) {
    this.key = key;
    this.value = [];
  }

  Substream.prototype.push = function(value) {
    return this.value.push(value);
  };

  Substream.prototype.sendTo = function(port) {
    var i, ip, len, ref;
    port.beginGroup(this.key);
    ref = this.value;
    for (i = 0, len = ref.length; i < len; i++) {
      ip = ref[i];
      if (ip instanceof Substream || ip instanceof IP) {
        ip.sendTo(port);
      } else {
        port.send(ip);
      }
    }
    return port.endGroup(this.key);
  };

  Substream.prototype.getKey = function() {
    return this.key;
  };

  Substream.prototype.getValue = function() {
    var hasKeys, i, ip, len, obj, ref, res, val;
    switch (this.value.length) {
      case 0:
        return null;
      case 1:
        if (typeof this.value[0].getValue === 'function') {
          if (this.value[0] instanceof Substream) {
            obj = {};
            obj[this.value[0].key] = this.value[0].getValue();
            return obj;
          } else {
            return this.value[0].getValue();
          }
        } else {
          return this.value[0];
        }
        break;
      default:
        res = [];
        hasKeys = false;
        ref = this.value;
        for (i = 0, len = ref.length; i < len; i++) {
          ip = ref[i];
          val = typeof ip.getValue === 'function' ? ip.getValue() : ip;
          if (ip instanceof Substream) {
            obj = {};
            obj[ip.key] = ip.getValue();
            res.push(obj);
          } else {
            res.push(val);
          }
        }
        return res;
    }
  };

  Substream.prototype.toObject = function() {
    var obj;
    obj = {};
    obj[this.key] = this.getValue();
    return obj;
  };

  return Substream;

})();

exports.Substream = Substream;

StreamSender = (function() {
  function StreamSender(port1, ordered) {
    this.port = port1;
    this.ordered = ordered != null ? ordered : false;
    this.q = [];
    this.resetCurrent();
    this.resolved = false;
  }

  StreamSender.prototype.resetCurrent = function() {
    this.level = 0;
    this.current = null;
    return this.stack = [];
  };

  StreamSender.prototype.beginGroup = function(group) {
    var stream;
    this.level++;
    stream = new Substream(group);
    this.stack.push(stream);
    this.current = stream;
    return this;
  };

  StreamSender.prototype.endGroup = function() {
    var parent, value;
    if (this.level > 0) {
      this.level--;
    }
    value = this.stack.pop();
    if (this.level === 0) {
      this.q.push(value);
      this.resetCurrent();
    } else {
      parent = this.stack[this.stack.length - 1];
      parent.push(value);
      this.current = parent;
    }
    return this;
  };

  StreamSender.prototype.send = function(data) {
    if (this.level === 0) {
      this.q.push(new IP(data));
    } else {
      this.current.push(new IP(data));
    }
    return this;
  };

  StreamSender.prototype.done = function() {
    if (this.ordered) {
      this.resolved = true;
    } else {
      this.flush();
    }
    return this;
  };

  StreamSender.prototype.disconnect = function() {
    this.q.push(null);
    return this;
  };

  StreamSender.prototype.flush = function() {
    var i, ip, len, ref, res;
    res = false;
    if (this.q.length > 0) {
      ref = this.q;
      for (i = 0, len = ref.length; i < len; i++) {
        ip = ref[i];
        if (ip === null) {
          if (this.port.isConnected()) {
            this.port.disconnect();
          }
        } else {
          ip.sendTo(this.port);
        }
      }
      res = true;
    }
    this.q = [];
    return res;
  };

  StreamSender.prototype.isAttached = function() {
    return this.port.isAttached();
  };

  return StreamSender;

})();

exports.StreamSender = StreamSender;

StreamReceiver = (function() {
  function StreamReceiver(port1, buffered, process) {
    this.port = port1;
    this.buffered = buffered != null ? buffered : false;
    this.process = process != null ? process : null;
    this.q = [];
    this.resetCurrent();
    this.port.process = (function(_this) {
      return function(event, payload, index) {
        var stream;
        switch (event) {
          case 'connect':
            if (typeof _this.process === 'function') {
              return _this.process('connect', index);
            }
            break;
          case 'begingroup':
            _this.level++;
            stream = new Substream(payload);
            if (_this.level === 1) {
              _this.root = stream;
              _this.parent = null;
            } else {
              _this.parent = _this.current;
            }
            return _this.current = stream;
          case 'endgroup':
            if (_this.level > 0) {
              _this.level--;
            }
            if (_this.level === 0) {
              if (_this.buffered) {
                _this.q.push(_this.root);
                _this.process('readable', index);
              } else {
                if (typeof _this.process === 'function') {
                  _this.process('data', _this.root, index);
                }
              }
              return _this.resetCurrent();
            } else {
              _this.parent.push(_this.current);
              return _this.current = _this.parent;
            }
            break;
          case 'data':
            if (_this.level === 0) {
              return _this.q.push(new IP(payload));
            } else {
              return _this.current.push(new IP(payload));
            }
            break;
          case 'disconnect':
            if (typeof _this.process === 'function') {
              return _this.process('disconnect', index);
            }
        }
      };
    })(this);
  }

  StreamReceiver.prototype.resetCurrent = function() {
    this.level = 0;
    this.root = null;
    this.current = null;
    return this.parent = null;
  };

  StreamReceiver.prototype.read = function() {
    if (this.q.length === 0) {
      return void 0;
    }
    return this.q.shift();
  };

  return StreamReceiver;

})();

exports.StreamReceiver = StreamReceiver;

});
___scope___.file("lib/Utils.coffee", function(exports, require, module, __filename, __dirname){ 

var clone, contains, createReduce, debounce, getKeys, getValues, guessLanguageFromFilename, intersection, isArray, isObject, optimizeCb, reduceRight, unique;

clone = function(obj) {
  var flags, key, newInstance;
  if ((obj == null) || typeof obj !== 'object') {
    return obj;
  }
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  if (obj instanceof RegExp) {
    flags = '';
    if (obj.global != null) {
      flags += 'g';
    }
    if (obj.ignoreCase != null) {
      flags += 'i';
    }
    if (obj.multiline != null) {
      flags += 'm';
    }
    if (obj.sticky != null) {
      flags += 'y';
    }
    return new RegExp(obj.source, flags);
  }
  newInstance = new obj.constructor();
  for (key in obj) {
    newInstance[key] = clone(obj[key]);
  }
  return newInstance;
};

guessLanguageFromFilename = function(filename) {
  if (/.*\.coffee$/.test(filename)) {
    return 'coffeescript';
  }
  return 'javascript';
};

isArray = function(obj) {
  if (Array.isArray) {
    return Array.isArray(obj);
  }
  return Object.prototype.toString.call(arg) === '[object Array]';
};

isObject = function(obj) {
  var type;
  type = typeof obj;
  return type === 'function' || type === 'object' && !!obj;
};

unique = function(array) {
  var k, key, output, ref, results, value;
  output = {};
  for (key = k = 0, ref = array.length; 0 <= ref ? k < ref : k > ref; key = 0 <= ref ? ++k : --k) {
    output[array[key]] = array[key];
  }
  results = [];
  for (key in output) {
    value = output[key];
    results.push(value);
  }
  return results;
};

optimizeCb = function(func, context, argCount) {
  if (context === void 0) {
    return func;
  }
  switch ((argCount === null ? 3 : argCount)) {
    case 1:
      return function(value) {
        return func.call(context, value);
      };
    case 2:
      return function(value, other) {
        return func.call(context, value, other);
      };
    case 3:
      return function(value, index, collection) {
        return func.call(context, value, index, collection);
      };
    case 4:
      return function(accumulator, value, index, collection) {
        return func.call(context, accumulator, value, index, collection);
      };
  }
  return function() {
    return func.apply(context, arguments);
  };
};

createReduce = function(dir) {
  var iterator;
  iterator = function(obj, iteratee, memo, keys, index, length) {
    var currentKey;
    while (index >= 0 && index < length) {
      currentKey = keys ? keys[index] : index;
      memo = iteratee(memo, obj[currentKey], currentKey, obj);
      index += dir;
    }
    return memo;
  };
  return function(obj, iteratee, memo, context) {
    var index, keys, length;
    iteratee = optimizeCb(iteratee, context, 4);
    keys = Object.keys(obj);
    length = (keys || obj).length;
    index = dir > 0 ? 0 : length - 1;
    if (arguments.length < 3) {
      memo = obj[keys ? keys[index] : index];
      index += dir;
    }
    return iterator(obj, iteratee, memo, keys, index, length);
  };
};

reduceRight = createReduce(-1);

debounce = function(func, wait, immediate) {
  var args, context, later, result, timeout, timestamp;
  timeout = void 0;
  args = void 0;
  context = void 0;
  timestamp = void 0;
  result = void 0;
  later = function() {
    var last;
    last = Date.now - timestamp;
    if (last < wait && last >= 0) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;
      if (!immediate) {
        result = func.apply(context, args);
        if (!timeout) {
          context = args = null;
        }
      }
    }
  };
  return function() {
    var callNow;
    context = this;
    args = arguments;
    timestamp = Date.now;
    callNow = immediate && !timeout;
    if (!timeout) {
      timeout = setTimeout(later, wait);
    }
    if (callNow) {
      result = func.apply(context, args);
      context = args = null;
    }
    return result;
  };
};

getKeys = function(obj) {
  var key, keys;
  if (!isObject(obj)) {
    return [];
  }
  if (Object.keys) {
    return Object.keys(obj);
  }
  keys = [];
  for (key in obj) {
    if (obj.has(key)) {
      keys.push(key);
    }
  }
  return keys;
};

getValues = function(obj) {
  var i, keys, length, values;
  keys = getKeys(obj);
  length = keys.length;
  values = Array(length);
  i = 0;
  while (i < length) {
    values[i] = obj[keys[i]];
    i++;
  }
  return values;
};

contains = function(obj, item, fromIndex) {
  if (!isArray(obj)) {
    obj = getValues(obj);
  }
  if (typeof fromIndex !== 'number' || guard) {
    fromIndex = 0;
  }
  return obj.indexOf(item) >= 0;
};

intersection = function(array) {
  var argsLength, i, item, j, k, l, ref, ref1, result;
  result = [];
  argsLength = arguments.length;
  for (i = k = 0, ref = array.length; 0 <= ref ? k <= ref : k >= ref; i = 0 <= ref ? ++k : --k) {
    item = array[i];
    if (contains(result, item)) {
      continue;
    }
    for (j = l = 1, ref1 = argsLength; 1 <= ref1 ? l <= ref1 : l >= ref1; j = 1 <= ref1 ? ++l : --l) {
      if (!contains(arguments[j], item)) {
        break;
      }
    }
    if (j === argsLength) {
      result.push(item);
    }
  }
  return result;
};

exports.clone = clone;

exports.guessLanguageFromFilename = guessLanguageFromFilename;

exports.optimizeCb = optimizeCb;

exports.reduceRight = reduceRight;

exports.debounce = debounce;

exports.unique = unique;

exports.intersection = intersection;

exports.getValues = getValues;

});
});
})
(function(e){if(e.FuseBox)return e.FuseBox;var r="undefined"!=typeof window&&window.navigator;r&&(window.global=window),e=r&&"undefined"==typeof __fbx__dnm__?e:module.exports;var n=r?window.__fsbx__=window.__fsbx__||{}:global.$fsbx=global.$fsbx||{};r||(global.require=require);var t=n.p=n.p||{},i=n.e=n.e||{},a=function(e){var r=e.charCodeAt(0);if(r>=97&&r<=122||64===r){if(64===r){var n=e.split("/"),t=n.splice(2,n.length).join("/");return[n[0]+"/"+n[1],t||void 0]}var i=e.indexOf("/");if(i===-1)return[e];var a=e.substring(0,i),o=e.substring(i+1);return[a,o]}},o=function(e){return e.substring(0,e.lastIndexOf("/"))||"./"},f=function(){for(var e=[],r=0;r<arguments.length;r++)e[r]=arguments[r];for(var n=[],t=0,i=arguments.length;t<i;t++)n=n.concat(arguments[t].split("/"));for(var a=[],t=0,i=n.length;t<i;t++){var o=n[t];o&&"."!==o&&(".."===o?a.pop():a.push(o))}return""===n[0]&&a.unshift(""),a.join("/")||(a.length?"/":".")},u=function(e){var r=e.match(/\.(\w{1,})$/);if(r){var n=r[1];return n?e:e+".js"}return e+".js"},s=function(e){if(r){var n,t=document,i=t.getElementsByTagName("head")[0];/\.css$/.test(e)?(n=t.createElement("link"),n.rel="stylesheet",n.type="text/css",n.href=e):(n=t.createElement("script"),n.type="text/javascript",n.src=e,n.async=!0),i.insertBefore(n,i.firstChild)}},l=function(e,r){for(var n in e)e.hasOwnProperty(n)&&r(n,e[n])},c=function(e){return{server:require(e)}},v=function(e,n){var i=n.path||"./",o=n.pkg||"default",s=a(e);if(s&&(i="./",o=s[0],n.v&&n.v[o]&&(o=o+"@"+n.v[o]),e=s[1]),e)if(126===e.charCodeAt(0))e=e.slice(2,e.length),i="./";else if(!r&&47===e.charCodeAt(0))return c(e);var l=t[o];if(!l){if(r)throw'Package was not found "'+o+'"';return c(o+(e?"/"+e:""))}e||(e="./"+l.s.entry);var v,d=f(i,e),p=u(d),g=l.f[p];return!g&&p.indexOf("*")>-1&&(v=p),g||v||(p=f(d,"/","index.js"),g=l.f[p],g||(p=d+".js",g=l.f[p]),g||(g=l.f[d+".jsx"]),g||(p=d+"/index.jsx",g=l.f[p])),{file:g,wildcard:v,pkgName:o,versions:l.v,filePath:d,validPath:p}},d=function(e,n){if(!r)return n(/\.(js|json)$/.test(e)?global.require(e):"");var t;t=new XMLHttpRequest,t.onreadystatechange=function(){if(4==t.readyState)if(200==t.status){var r=t.getResponseHeader("Content-Type"),i=t.responseText;/json/.test(r)?i="module.exports = "+i:/javascript/.test(r)||(i="module.exports = "+JSON.stringify(i));var a=f("./",e);m.dynamic(a,i),n(m.import(e,{}))}else console.error(e+" was not found upon request"),n(void 0)},t.open("GET",e,!0),t.send()},p=function(e,r){var n=i[e];if(n)for(var t in n){var a=n[t].apply(null,r);if(a===!1)return!1}},g=function(e,n){if(void 0===n&&(n={}),58===e.charCodeAt(4)||58===e.charCodeAt(5))return s(e);var i=v(e,n);if(i.server)return i.server;var a=i.file;if(i.wildcard){var f=new RegExp(i.wildcard.replace(/\*/g,"@").replace(/[.?*+^$[\]\\(){}|-]/g,"\\$&").replace(/@/g,"[a-z0-9$_-]+"),"i"),u=t[i.pkgName];if(u){var l={};for(var c in u.f)f.test(c)&&(l[c]=g(i.pkgName+"/"+c));return l}}if(!a){var m="function"==typeof n,h=p("async",[e,n]);if(h===!1)return;return d(e,function(e){if(m)return n(e)})}var x=i.validPath,_=i.pkgName;if(a.locals&&a.locals.module)return a.locals.module.exports;var w=a.locals={},y=o(x);w.exports={},w.module={exports:w.exports},w.require=function(e,r){return g(e,{pkg:_,path:y,v:i.versions})},w.require.main={filename:r?"./":global.require.main.filename,paths:r?[]:global.require.main.paths};var b=[w.module.exports,w.require,w.module,x,y,_];p("before-import",b);var j=a.fn;return j.apply(0,b),p("after-import",b),w.module.exports},m=function(){function n(){}return n.global=function(e,n){var t=r?window:global;return void 0===n?t[e]:void(t[e]=n)},n.import=function(e,r){return g(e,r)},n.on=function(e,r){i[e]=i[e]||[],i[e].push(r)},n.exists=function(e){try{var r=v(e,{});return void 0!==r.file}catch(e){return!1}},n.remove=function(e){var r=v(e,{}),n=t[r.pkgName];n&&n.f[r.validPath]&&delete n.f[r.validPath]},n.main=function(e){return this.mainFile=e,n.import(e,{})},n.expose=function(r){var n=function(n){var t=r[n],i=t.alias,a=g(t.pkg);"*"===i?l(a,function(r,n){return e[r]=n}):"object"==typeof i?l(i,function(r,n){return e[n]=a[r]}):e[i]=a};for(var t in r)n(t)},n.dynamic=function(r,n,t){var i=t&&t.pkg||"default";this.pkg(i,{},function(t){t.file(r,function(r,t,i,a,o){var f=new Function("__fbx__dnm__","exports","require","module","__filename","__dirname","__root__",n);f(!0,r,t,i,a,o,e)})})},n.flush=function(e){var r=t.default;for(var n in r.f){var i=!e||e(n);if(i){var a=r.f[n];delete a.locals}}},n.pkg=function(e,r,n){if(t[e])return n(t[e].s);var i=t[e]={},a=i.f={};i.v=r;var o=i.s={file:function(e,r){a[e]={fn:r}}};return n(o)},n.addPlugin=function(e){this.plugins.push(e)},n}();return m.packages=t,m.isBrowser=void 0!==r,m.isServer=!r,m.plugins=[],e.FuseBox=m}(this))