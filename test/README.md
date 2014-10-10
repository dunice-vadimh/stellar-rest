You can edit in config.json

1. Configuring to connect to a running rippled 

  "stellard_servers": [
    "wss://live.stellar.org:9001"
  ]
   
2. Configuring to launch and connect to a local rippled 

    Run as root 

	rippled -a  
     
    from the /test2 directory so that rippled will read in the /test2/rippled.cfg 

     "stellard_servers": [
        "ws://localhost:5006"
      ]


3. Configuring to run tests without a rippled using the built-in test "rippled mock" server

     "stellard_servers": [
        "ws://localhost:5150"
      ]


_server_info-test.js can use either hosted, local, or mock

_get_payment-test.js can use local or mock
