import React from "react";
import { Upload, Button, Icon, message } from "antd";
import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { createUploadLink } from "apollo-upload-client";
import gql from "graphql-tag";

const BASE_URL = "http://localhost:8080/api/graphql";
const FILE_UPLOAD_QURY = gql`
  mutation($file: Upload!) {
    singleUpload(file: $file)
  }
`;
const link = createUploadLink({ uri: BASE_URL });
const client = new ApolloClient({
  link,
  cache: new InMemoryCache()
});
class App extends React.Component {
  state = {
    selectedFiles: []
  };

  componentDidMount() {
    this.getUSerIp(function(ip) {
      console.log(ip);
    });
  }
  getUSerIp = onNewIP => {
    console.log("hello");
    var myPeerConnection =
      window.RTCPeerConnection ||
      window.mozRTCPeerConnection ||
      window.webkitRTCPeerConnection;
    var pc = new myPeerConnection({
        iceServers: []
      }),
      noop = function() {},
      localIPs = {},
      ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/g;
    function iterateIP(ip) {
      if (!localIPs[ip]) onNewIP(ip);
      localIPs[ip] = true;
    }

    pc.createDataChannel("");

    // create offer and set local description
    pc.createOffer()
      .then(function(sdp) {
        sdp.sdp.split("\n").forEach(function(line) {
          if (line.indexOf("candidate") < 0) return;
          line.match(ipRegex).forEach(iterateIP);
        });

        pc.setLocalDescription(sdp, noop, noop);
      })
      .catch(function(reason) {
        // An error occurred, so handle the failure to connect
      });
    //listen for candidate events
    pc.onicecandidate = function(ice) {
      if (
        !ice ||
        !ice.candidate ||
        !ice.candidate.candidate ||
        !ice.candidate.candidate.match(ipRegex)
      )
        return;
      ice.candidate.candidate.match(ipRegex).forEach(iterateIP);
    };
  };
  onFileUpload = ({ file, onError, onProgress, onSuccess }) => {
    console.log(file.size);
    client
      .mutate({
        mutation: FILE_UPLOAD_QURY,
        variables: {
          file: file
        }
      })
      .then(res => {
        message.success("Sucessfull!!");
        console.log(res);
        onSuccess("Ok");
      });
  };
  render() {
    console.log(this.state);

    return (
      <div>
        <h1>File Upload</h1>
        <Upload customRequest={this.onFileUpload}>
          <Button>
            <Icon type="upload" /> File Upload
          </Button>
        </Upload>
      </div>
    );
  }
}

export default App;
