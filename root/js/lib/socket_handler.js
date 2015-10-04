// JavaScript Document

/*
	=========================================
	constructor
	=========================================

	new SocketHandler(socketUrl, callback)

	params:
		socketUrl (string): socket url
		callback (function) (optional): callback for success/fail

	=========================================
	public methods
	=========================================
	on(eventName, callback)

	usage: add a event listener
	params:
		eventName (string): event name
		callback (function) (optional): callback(success:boolean)

	-----------------------------------------
	remove(eventName)

	usage: remove a event listener
	params:
		eventName (string): event name

	-----------------------------------------
	send(command, params, callback)

	usage: send a command to server
	params:
		command (string): command name
		params (object): params for this command
		callback (function): callback(response:object)

	 -----------------------------------------
	 close()

	 usage: close connect
	 params:

	 -----------------------------------------

 */

(function(){
	
"use strict";

function SocketHandler(_url, _cb_connected)
{
	var _p = SocketHandler.prototype = this;
	
	var _socket;
	var _listenerDic = {};
	var _responseDic = {};
	
	_p.io = null;
	_p.connected = false;

	connect();

	/* ============================== */

	_p.on = function(eventName, cb)
	{	
		if(!_listenerDic[eventName]) _listenerDic[eventName] = [];
		_listenerDic[eventName].push(cb);

		return _p;
	};
	
	_p.remove = function(eventName, cb)
	{
		if(!_listenerDic[eventName]) {console.log("event name: " + eventName + " is not registed"); return; }
		var array = _listenerDic[eventName];

		if(cb != null)
		{
			var index = array.indexOf(cb);
			console.log("index = " + index);
			if (index != -1)
			{
				array.splice(index, 1);
				if (array.length == 0) delete _listenerDic[eventName];
			}
		}
		else
		{
			_listenerDic[eventName] = [];
		}

		return _p;
	};

	_p.send = function(cmd, jsonParams, cb_response)
	{
		if(!_p.connected) return;
		var obj = {cmd:cmd};
		obj.params = jsonParams;

		if(cb_response != null)	obj.timestamp = listenResponse(cmd, cb_response);

		_socket.send(JSON.stringify(obj));

		return _p;
	};

	_p.close = function()
	{
		_socket.close();
	};

	/** listen response **/
	function listenResponse(eventName, cb)
	{
		var date = new Date();
		var timestamp = "t" + date.getTime();

		if(!_responseDic[eventName]) _responseDic[eventName] = {};
		_responseDic[eventName][timestamp] = cb;

		return timestamp;
	}

	function dispatchResponse(obj, params)
	{
		var funcObj = _responseDic[obj.cmd];

		if(funcObj != null)
		{
			var func = funcObj[obj.timestamp];
			func.apply(null, [params]);

			delete funcObj[obj.timestamp];
		}
	}

	function dispatchEvent(eventName, params)
	{
		var array = _listenerDic[eventName];
		if(array)
		{
			for(var i=0;i<array.length;i++)
			{
				array[i].apply(null, params);
			}
		}
	}
	/** end **/
	
	function connect()
	{
		if(_socket){ console.log("socket connect already called"); return; }
		
		_p.io = _socket = new eio.Socket(_url, {forceJSONP:true});


		
		_socket.on("open", function()
		{
			_p.connected = true;
			if(_cb_connected != null)
			{
				_cb_connected.apply(null, [true]);
			}

            _socket.on("error", function(data)
            {
                if(data.description == 0 && _cb_connected != null)
                {
                    _cb_connected.apply(null, [false]);
                    _cb_connected = null;
                }

            });

            //console.log(_p.io);

            _socket.on('message', function (data)
            {
                //console.info("data = " + data);

                var obj;
                try{ obj = JSON.parse(data); }
                catch(e)
                {
                    console.log("none json message");
                    return;
                }

                if(obj.type == "event")
                {
                    dispatchEvent(obj.cmd, [obj.params]);
                }
                else if(obj.type == "response")
                {
                    dispatchResponse(obj, obj.params);
                }
            });

            _socket.on('close', function (evt) {
                _p.connected = false;
                dispatchEvent("close", [evt]);
                console.log("connect lost");
            });


            _socket.on('flush', function () {
                //console.log("on flush");
            });

            _socket.on('drain', function () {
                //console.log("on drain");
            });



		});
	}
}

window.SocketHandler = SocketHandler;

}());