import WebSocket, { CloseEvent, ErrorEvent, MessageEvent } from "ws";
import helpers from "./helpers/helpers.js";
import commands from "./commands/index.js";
import { WebsocketStateEvent, WebsocketPaylod, MessageObject } from "./discord/types.js";
import { ProcessedQuery } from "./types.js";
import Logger from "./logger/index.js";

let ws: WebSocket;

let init_payload: WebsocketPaylod = {
	op: 2,
	d: {
		token: process.env.DISCORD_TOKEN,
		intents: 34433,
		properties: {
			os: "linux",
			browser: "chrome",
			device: "chrome",
		},
	},
};

let socket_state: WebsocketStateEvent = {
	reconnect: false,
	session_id: "",
	resume_gateway_url: "",
};

// Websocket receiver events
function message_create(event_data: MessageObject) {
	let prefix: string = "!";
	if (event_data.author.bot) return;
	if (event_data.content.slice(0, prefix.length) != prefix) return;

	const { command, query, args }: ProcessedQuery = helpers.processQuery(event_data.content, prefix);
	Logger.debug(`Message from ${event_data.author.username}: ${event_data.content}`);
	Logger.debug(`args: ${args} | command: ${command} | query: ${query}`);

	commands.messageEvent(event_data, { command, query, args });
}

function ready(event_data: any) {
	socket_state.session_id = event_data.session_id;
	socket_state.resume_gateway_url = event_data.resume_gateway_url;
	Logger.info(`Logged in as ${event_data.user.username}!`);
}

function guild_create(event_data: any) {
	// Logger.debug(event_data);
	let id = event_data.id;
	let name = event_data.name;
	Logger.info(`id: ${id} name: ${name}`);
}

function defaultEvent() {
	Logger.debug("não implementado");
}

const events: Record<string, (x: any) => void> = {
	"MESSAGE_CREATE": message_create,
	"READY": ready,
	"GUILD_CREATE": guild_create
	// "VOICE_SERVER_UPDATE"
}

function handlerEvent(payload_event: WebsocketPaylod): void {
	const { t, d, s }: WebsocketPaylod = payload_event;
	Logger.debug(JSON.stringify(payload_event));

	let event_name = t;
	let event_data = d;
	socket_state.last_event = s;

	Logger.debug(event_name);
	let func = events[<string>event_name];
	if (func != undefined) {
		func(event_data)
	} else {
		defaultEvent();
	}
}
// Websocket receiver events

// Websocket transmitter events
function requestVoiceChannel(guild_id: string, channel_id: string) {
	let payload: WebsocketPaylod = {
		op: 4,
		d: {
			guild_id,
			channel_id,
			self_mute: false,
			self_deaf: false
		}
	};
	ws.send(JSON.stringify(payload));
}

// Websocket transmitter events
// TODO: resolver caso a conecção so zombized
function handlerMessage({ t, op, d, s }: WebsocketPaylod): void {
	Logger.debug("Opcode: " + op);
	switch (op) {
		case 0:
			handlerEvent({ t, op, d, s});
			break;
		case 1:
			// TODO: colocar alguma coisa no d
			ws.send(JSON.stringify({ op: 1, d: null }));
			break;
		case 7:
			Logger.debug("Reconnect");
			// tentar reconectar
			socket_state.reconnect = true;
			connect();
			break;
		case 9:
			Logger.debug("Invalid Session");
			if (d) {
				// tentar reconectar
				socket_state.reconnect = true;
				connect();
			} else {
				// tentar conectar
				socket_state.reconnect = false;
				connect();
			}
			break;

		case 10:
			const { heartbeat_interval } = d;
			setInterval(() => {
				// TODO: colocar alguma coisa no d
				ws.send(JSON.stringify({ op: 1, d: null }));
			}, heartbeat_interval);

			break;

		case 11:
			Logger.trace("Heartbeat ACK");
			break;
	}
}

function connect() {
	if (socket_state.reconnect) {
		ws = new WebSocket(socket_state.resume_gateway_url + "/?v=10&encoding=json");
		ws.addEventListener("open", () => {
			let resume_payload: WebsocketPaylod = {
				op: 6,
				d: {
					token: process.env.DISCORD_TOKEN,
					session_id: socket_state.session_id,
					seq: socket_state.last_event,
				},
			};
			ws.send(JSON.stringify(resume_payload));
			socket_state.reconnect = false;
		});
	} else {
		ws = new WebSocket("wss://gateway.discord.gg/?v=10&encoding=json");
		ws.addEventListener("open", () => {
			Logger.info("WebSocket open");
			ws.send(JSON.stringify(init_payload));
		});
	}

	ws.addEventListener("close", (event: CloseEvent) => {
		Logger.debug(`WebSocket closed with code ${event.code}, reason: ${event.reason}`);
		Logger.debug(event);
		// tentar reconectar
		socket_state.reconnect = true;
		connect();
	});

	ws.addEventListener("error", (event: ErrorEvent) => {
		Logger.debug("WebSocket error...");
		Logger.debug(event.type);
		Logger.debug(event.error);
		Logger.debug(event.message + '\n');
	});

	ws.addEventListener("message", function incoming(data: any) {
		let x: string = data.data;
		let payload: WebsocketPaylod = JSON.parse(x);
		handlerMessage(payload);
	});
}

connect();
export {
	requestVoiceChannel,
};
//export default ws;
