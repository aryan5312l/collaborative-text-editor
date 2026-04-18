import {io} from "socket.io-client";

const URL = import.meta.env.DEV
    ? "http://localhost:5000"
    : "/";

const token = localStorage.getItem("token");

export const socket = io(URL, {
    transports: ["websocket"],
    auth: {
        token: token
    }
});