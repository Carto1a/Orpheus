// import helpers from "../helpers/helpers.js";
// import config from "./config.js";
// import embed from "../embeds/embeds.js";
// import { getVoiceConnection } from "@s/voice";
// import { PermissionsBitField } from "js";
// import trackSearch from "../searchSongs/index.js";

import { sendMessage } from "../discord/index.js";
import { WSMessageObject } from "../discord/types.js";
import { ProcessedQuery } from "../types.js";
import Logger from "../logger/index.js";
import DWS from "../websocket.js";

function commandConfig(event_data: WSMessageObject, command_data: ProcessedQuery) {
	Logger.debug("config");
	sendMessage(event_data.channel_id, <string>command_data.command);
}

function commandJoin(message: WSMessageObject, command_data: ProcessedQuery) {
	Logger.debug("join");
	sendMessage(message.channel_id, "tentando se conectar");
	DWS.requestVoiceChannel(message);
}

function commandPlay(message: WSMessageObject, command_data: ProcessedQuery) {

}

// function commandSkip(event_data, command_data) {

// }

// function commandPause(event_data, command_data) {

// }

// function commandResume(event_data, command_data) {

// }

function commandStop(message: WSMessageObject, command_data: ProcessedQuery) {

}

// function commandQueue(event_data, command_data) {

// }

// function commandClearQueue(event_data, command_data) {

// }

function commandLeave(message: WSMessageObject, command_data: ProcessedQuery) {

}

// function commandLoop(event_data, command_data) {

// }

// function commandPlaying(event_data, command_data) {

// }

// function commandVoltar(event_data, command_data) {

// }

// function commandRemove(event_data, command_data) {

// }

// function commandKill(event_data, command_data) {

// }

// function commandPing(event_data, command_data) {

// }

// function commandEmoji(event_data, command_data) {

// }

// function commandDump(event_data, command_data) {

// }

function commandDefault(event_data: WSMessageObject, command: string | undefined) {
	Logger.debug("comando não existe");
	sendMessage(event_data.channel_id, `Not a valid command ${command}`);
}

let commands: Record<string, (x: WSMessageObject, y: ProcessedQuery) => void> = {
	"config": commandConfig,
	"join": commandJoin,
	"play": commandPlay,
	"stop": commandStop,
	"leave": commandLeave
}

async function messageEvent(event_data: WSMessageObject, query: ProcessedQuery) {
	let player;
	let queue;
	let current;

	let func = commands[<string>query.command];
	if (func != undefined) {
		func(event_data, query);
	} else {
		commandDefault(event_data, query.command);
	}
}

// switch (command) {
//   case "config":
//     if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
//       message.reply("need Administrator permissions");
//       return;
//     }
//     config.commandSwith(query, message);
//     break;
//   case "join":
//     helpers.connectToChannel(message);
//     break;
//   case "play":
//     getVoiceConnection(message.guildId) ? false : helpers.connectToChannel(message);
//     trackSearch.search({ query, message, args });
//     break;
//   case "skip":
//     let skip;
//     skip = args[0] == undefined ? 1 : parseInt(args[0]);
//     if (skip == NaN) {
//       message.reply(`Argumento Invalito ${args[0]}`);
//       return;
//     }
//     current = global.guildcache.getmeta("current", message.guildId);
//     queue = global.guildcache.getmeta("queue", message.guildId);
//     skip = skip >= queue.length ? queue.length - (current - 1) - 2 : skip;
//     global.guildcache.setmeta("current", message.guildId, current + skip);
//     message.reply({ embeds: [embed.skip(skip)] });
//     helpers.playQueue(message.guildId);
//     break;
//   case "pause":
//     player = global.guildcache.getmeta("player", message.guildId);
//     player.pause();
//     break;
//   case "resume":
//     player = global.guildcache.getmeta("player", message.guildId);
//     player.unpause();
//     break;
//   case "stop":
//     Logger.debug("stop");
//     break;
//   case "queue":
//     message.guildName = message.guild.name;
//     message.guildImgURL = message.guild.iconURL();
//     message.reply({ embeds: [await embed.queue(message)] });
//     break;
//   case "clearqueue":
//     queue = global.guildcache.getmeta("queue", message.guildId);
//     current = global.guildcache.getmeta("current", message.guildId);
//     global.guildcache.setmeta("queue", message.guildId, [queue[current]]);
//     global.guildcache.setmeta("current", message.guildId, 0);
//     break;
//   case "leave":
//     queue = global.guildcache.getmeta("queue", message.guildId);
//     current = global.guildcache.getmeta("current", message.guildId);
//     global.guildcache.setmeta("queue", message.guildId, [queue[current]]);
//     global.guildcache.setmeta("current", message.guildId, 0);
//     let connection = global.guildcache.getmeta("connection", message.guildId);
//     connection.destroy();
//     break;
//   case "loop":
//     Logger.debug("nao feito");
//     break;
//   case "playing":
//     queue = global.guildcache.getmeta("queue", message.guildId);
//     current = global.guildcache.getmeta("current", message.guildId);
//     message.reply(queue[current].snippet.title);
//     break;
//   case "voltar":
//     global.guildcache.setmeta(
//       "current",
//       message.guildId,
//       global.guildcache.getmeta("current", message.guildId) - 1,
//     );
//     helpers.playQueue(message);
//     break;
//   case "remove":
//     Logger.debug("nao feito");
//     break;
//   case "kill":
//     message.reply("tchau");
//     process.exit();
//     break;
//   case "ping":
//     Logger.debug("nao feito");
//     break;
//   case "emoji":
//     Logger.debug("nao feito");
//     break;
//   case "dump":
//     global.guildcache.dump();
//     break;
//   default:
//     message.reply(`Not a valid command ${command}`);
// }
// }

export default { messageEvent };
