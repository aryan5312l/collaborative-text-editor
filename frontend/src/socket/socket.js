import {io} from "socket.io-client";



// export const socket = io("/", {
//     transports: ["websocket"]
// });

export const socket = io("localhost:5000")