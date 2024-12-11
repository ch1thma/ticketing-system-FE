class WebSocketService {
    constructor(url) {
      this.socket = new WebSocket(url); // or `io(url)` if using socket.io-client
    }
  
    onMessage(callback) {
      this.socket.onmessage = (event) => {
        callback(event.data)
      };
    }
  
    sendMessage(message) {
      this.socket.send(JSON.stringify(message));
    }
  
    closeConnection() {
      this.socket.close();
    }
  }
  
  export default WebSocketService;
  