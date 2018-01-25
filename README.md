# SwiftStack Client: Metadata Search Plugin Example

## What Is This?
It's a quick example of a SwiftStack Client custom metadata search plugin, written using [angular.js](https://angularjs.org).

![](https://github.com/swiftstack/swiftclientgui-mdsearch-plugin/blob/master/static/example.png)

SwiftStack Client provides a native "Metadata Search" tool, which allows you to search for objects in Swift when you've enabled [Metadata Search](https://www.swiftstack.com/docs/admin/cluster_management/metadata_sync.html).

That said, Elasticsearch is powerful and complicated, and you may well want to write your own search applications to find data, whilst still allowing SwiftStack Client to carry out data operations against your object store. That's where this comes in.

## How do I use it?
You'll need to ensure node.js is installed on your machine - details can be found [here](https://nodejs.org/en/download/). 

Clone this repo:
```
https://github.com/swiftstack/swiftclientgui-mdsearch-plugin.git
```

...then, install the required node.js modules:
```
$ npm install 
```

Last, spin up the webpage on port 3000 locally:
```
$ node app.js
```

You'll probably want to test that you can reach the app at `http://localhost:3000` in your browser at this point.

Assuming all is well, tell SwiftStack client to allow it as a custom search plugin:

1. Fire up SwiftStack Client.
2. Hit the settings icon (cog wheel, top right).
3. Go to "Advanced".
3. Set the 'metadataSearchPluginURI' property to the URI this app is running at (`http://localhost:3000` if you run both on the same machine).

To use it from the client, you will need to have a Swift container accessible with metadata search enabled. 

1. Tell SwiftStack client this container is metadata-search enabled by setting the header `x-container-meta-com-swiftstack-mdsync-elasticsearch-uri` to the elasticsearch index endpoint used to index the container (you can do this in the client via the **Container Properties** screen).
2. Open the container in SwiftStack client.
3. The standard **Metadata Search** button will be replaced with a dropdown. Click it, and select **Custom Metadata Search** to bring up a dialog with this app in place of the usual search tool.

Finally, add a JSON elasticsearch query to the textbox, and when ready click **Run Search** either in the iframe or on the client. Your query will be validated as you run it.

If you need a sample query to get started, you could try something like:
```
{"query_string":{"fields":["foo.keyword"],"query":"bar"}}
```

## How does it work?
When the **metadataSearchPluginURI** property is set in SwiftStack client, and when you click the **Custom Metadata Search** button, the client will show this web app in an iframe instead of the native search tool.

From that point onwards, everything is handled by a [`postMessage()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) based interface. See below for details.

## How do I write a search plugin?
Your plugin can be any webpage that can generate JSON. The JSON you create on the page will be sent to SwiftStack client via `postMessage()`.

On page load, Client will send an **swiftstackclient-init-data** message with information about the elasticsearch endpoint and any previous search you ran (which you can choose to discard if you want).

Then you can, optionally:

 - Validate the message by sending a **swiftstackclient-validation-request** message (and listening for a response);
 - Tell the client to run your search with a **swiftstackclient-search-request** message (optionally, you can also listen for a response).

Examples of doing this are in [`ui.js`](https://github.com/swiftstack/swiftclientgui-mdsearch-plugin/blob/master/ui.js), and the interface is below.

Quite possibly the easiest way to write a plugin is to start with this one as a base, and develop it further to meet your needs.

## Interface
We use `postMessage()` to communicate from the parent window (SwiftStack Client) to your webapp (a child iframe). 

For examples of this, see `ui.js`.

### Recieving Messages

To receive messages:

 - Your page should listen for window message events from the Client.
 - Each incoming event will have a `data.type` property telling you what kind of message this is. 

So, for example, this code near the start of your page should do the job:

```
window.addEventListener('message', function(e) {
  var data = JSON.parse(e.data);
  if (data.type === 'swiftstackclient-init-data') { 
    // Do Something
  } else if (data.type === 'swiftstackclient-validation-response') { 
    // Do something else.
  } else if (data.type === 'swiftstackclient-search-response') { 
    // Do a final thing.
  }
});
```

### Sending Messages
To send messages, use `postMessage()` and target the `parent` of your window. To send a `swiftstackclient-validation-request` message, for example:

```
var data = {
  'query': JSON.parse(myElasticSearchQuery),
  'type': 'swiftstackclient-validation-request'
}
parent.postMessage(JSON.stringify(postData),'*');
```

Events you can listen for or send are described below:

## `postMessage()` interface

### swiftstackclient-init-data

You will always recieve a swiftstackclient-init-data message on page load, from SwiftStack Client. The postMessage event will have a `data` property with these attributes:

  - `type`: "swiftstackclient-init-data"
  - `elasticURI `: The URI to the elastic endpoint SwiftStack client is currently using
  - `query `: The previous elasticsearch query you ran, if any, as an object.

### swiftstackclient-validation-request

You can **send** a validation request at any time. The postMessage data must be an object with these properties:

  - `type`: "swiftstackclient-validation-request"
  - `query`: Your elasticsearch query as an object.

You should then listen for a `swiftstackclient-validation-response` reply from the client:

### swiftstackclient-validation-response

When validation completes, the client will send this message. The postMessage event will have a `data` property with these attributes:

  - `type`: "swiftstackclient-validation-response"
  - `validated`: `true` if the query validated OK; `false` otherwise.
  - `error`: The error message as a string from elasticsearch, if any.

### swiftstackclient-search-request

You can **send** a search request at any time, even if you know your query to be invalid. The postMessage data must be an object with these properties:

  - `type`: "swiftstackclient-search-request"
  - `query`: Your elasticsearch query as an object.

You can optionally then listen for a `swiftstackclient-search-response` reply from the client:

### swiftstackclient-search-response

When a search is dispatched to elasticsearch (not completed, necessarily), the client will send this message. The postMessage event will have a `data` property with these attributes:

  - `type`: "swiftstackclient-search-response"

Thanks!


Questions? straill@swiftstack.com






