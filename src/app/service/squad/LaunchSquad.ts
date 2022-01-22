import {
	DMChannel,
	GuildMember,
	MessageActionRow,
	MessageSelectMenu,
	MessageEmbed, TextChannel, User, Message, MessageButton,
} from 'discord.js';
import { CommandContext } from 'slash-create';
import Log, { LogUtils } from '../../utils/Log';
import SquadUtils from '../../utils/SquadUtils';
import ValidationError from '../../errors/ValidationError';
import client from '../../app';
import channelIds from '../constants/channelIds';
import { Db } from 'mongodb';
import dbInstance from '../../utils/MongoDbUtils';
import constants from '../constants/constants';
import { randomUUID } from 'crypto';

export default async (member: GuildMember, ctx?: CommandContext): Promise<void> => {
	ctx?.send(`Hi, ${ctx.user.mention}! I sent you a DM with more information.`);

	await getTitle(member);
};

const getTitle = async (member: GuildMember): Promise<void> => {
	const dmChannel: DMChannel = await member.user.createDM();

	const getTitlePrompt = await dmChannel.send({ content: 'Let\'s assemble a Squad! What is the title of your project?' });

	const collector = dmChannel.createMessageCollector({ max: 1, time: (5000 * 60), dispose: true });

	collector.on('collect', async (msg) => {

		try {
			await SquadUtils.validateTitle(member, msg.content);

			await getDescription(member, msg.content);

			return;

		} catch (e) {
			if (e instanceof ValidationError) {
				await getTitle(member);
			}
			return;
		}
	});

	collector.on('end', async (_, reason) => {

		// if getTitlePrompt is not the last message, time out silently.
		if ((getTitlePrompt.id === dmChannel.lastMessage.id) && (reason === 'time')) {
			try {
				await dmChannel.send('The conversation timed out.');
			} catch (e) {
				Log.debug(`Squad getTitle collector timed out, unable to send dm, error msg: ${e}`);
			}
		}
		if (!['time'].includes(reason)) {
			Log.debug(`Squad getTitle collector stopped for unknown reason: ${reason}`);
		}
	});
};

const getDescription = async (member: GuildMember, title: string): Promise<void> => {
	const dmChannel: DMChannel = await member.user.createDM();

	const getDescriptionPrompt = await dmChannel.send({ content: 'A short description perhaps?' });

	const collector = dmChannel.createMessageCollector({ max: 1, time: (5000 * 60), dispose: true });

	collector.on('collect', async (msg) => {

		try {
			await SquadUtils.validateSummary(member, msg.content);

			const squadEmbed = createEmbed(member, title, msg.content);

			await dmChannel.send({ content: 'Preview: ', embeds: [squadEmbed] });

			await xPostConfirm(member, title, msg.content, squadEmbed);

			return;

		} catch (e) {
			if (e instanceof ValidationError) {
				await getDescription(member, title);
			}

			return;
		}
	});

	collector.on('end', async (_, reason) => {

		// if getTitlePrompt is not the last message, time out silently.
		if ((getDescriptionPrompt.id === dmChannel.lastMessage.id) && (reason === 'time')) {
			try {
				await dmChannel.send('The conversation timed out.');
			} catch (e) {
				Log.debug(`Squad getDescription collector timed out, unable to send dm, error msg: ${e}`);
			}
		}
		if (!['time'].includes(reason)) {
			Log.debug(`Squad getDescription collector stopped for unknown reason: ${reason}`);
		}
	});
};

const xPostConfirm = async (member, title, description, squadEmbed): Promise<void> => {
	const dmChannel: DMChannel = await member.user.createDM();

	const xPostConfirmMsg = await dmChannel.send({ content: 'Would you like to cross post the Squad in other channels? \n' +
	'👍 - Post now, without cross posting\n' +
	'📮 - Select cross post channels\n' +
	'🔃 - Start over\n' +
	'❌ - Abort' });

	const filter = (reaction, user) => {
		return ['👍', '📮', '❌', '🔃'].includes(reaction.emoji.name) && !user.bot;
	};

	await xPostConfirmMsg.react('👍');
	await xPostConfirmMsg.react('📮');
	await xPostConfirmMsg.react('🔃');
	await xPostConfirmMsg.react('❌');

	const collector = xPostConfirmMsg.createReactionCollector({ filter, max: 1, time: (3000 * 60), dispose: true });

	collector.on('end', async (collected, reason) => {
		if (reason === 'limit') {
			for (const reac of collected.values()) {
				const users = await reac.users.fetch();

				if (users.has(member.user.id)) {
					if (reac.emoji.name === '📮') {
						await createMultiSelect(member, title, description, squadEmbed);

						return;
					} else if (reac.emoji.name === '👍') {
						await postSquad(member, squadEmbed, []);

						return;
					} else if (reac.emoji.name === '🔃') {
						await dmChannel.send({ content: 'Let\'s start over.' });

						await getTitle(member);

						return;
					} else if (reac.emoji.name === '❌') {
						await dmChannel.send({ content: 'Command cancelled.' });

						return;
					}
				}
			}
		} else {
			if ((xPostConfirmMsg.id === dmChannel.lastMessage.id) && (reason === 'time')) {
				try {
					await dmChannel.send('The conversation timed out.');
				} catch (e) {
					Log.debug(`Squad xPostConfirmMsg reaction collector timed out, unable to send dm, error msg: ${e}`);
				}
			}
			if (!['time'].includes(reason)) {
				Log.debug(`Squad xPostConfirmMsg collector stopped for unknown reason: ${reason}`);
			}
		}
	});
};

const finalConfirm = async (member, squadEmbed, xChannelList): Promise<void> => {
	const dmChannel: DMChannel = await member.user.createDM();

	await dmChannel.send({ content: 'the following channels were selected:\n' });

	if (xChannelList.length > 0) {
		for (const chan of xChannelList) {
			await dmChannel.send({ content: `<#${chan}>\n` });
		}
	}

	const finalConfirmMsg = await dmChannel.send({ content:
			'👍 - Good to go, post now.\n' +
			'🔃 - I want to change something else - start over\n' +
			'❌ - Abort' });

	const filter = (reaction, user) => {
		return ['👍', '❌', '🔃'].includes(reaction.emoji.name) && !user.bot;
	};

	await finalConfirmMsg.react('👍');
	await finalConfirmMsg.react('🔃');
	await finalConfirmMsg.react('❌');

	const collector = finalConfirmMsg.createReactionCollector({ filter, max: 1, time: (3000 * 60), dispose: true });

	collector.on('end', async (collected, reason) => {
		if (reason === 'limit') {
			for (const reac of collected.values()) {
				const users = await reac.users.fetch();

				if (users.has(member.user.id)) {
					if (reac.emoji.name === '👍') {
						await postSquad(member, squadEmbed, xChannelList);

						return;
					} else if (reac.emoji.name === '🔃') {
						await dmChannel.send({ content: 'Let\'s start over.' });

						await getTitle(member);

						return;
					} else if (reac.emoji.name === '❌') {
						await dmChannel.send({ content: 'Command cancelled.' });

						return;
					}
				}
			}
		} else {
			if ((finalConfirmMsg.id === dmChannel.lastMessage.id) && (reason === 'time')) {
				try {
					await dmChannel.send('The conversation timed out.');
				} catch (e) {
					Log.debug(`Squad finalConfirmMsg reaction collector timed out, unable to send dm, error msg: ${e}`);
				}
			}
			if (!['time'].includes(reason)) {
				Log.debug(`Squad finalConfirmMsg collector stopped for unknown reason: ${reason}`);
			}
		}
	});
};

const postSquad = async (member, squadEmbed, xChannelList): Promise<void> => {

	await dbCreateSquad(squadEmbed, member.user.id);

	const dmChannel: DMChannel = await member.user.createDM();

	const squadChannel: TextChannel = await client.channels.fetch(channelIds.scoapSquad) as TextChannel;

	const squadMsg = await squadChannel.send({ embeds: [squadEmbed] });

	await squadMsg.react('🙋');
	await squadMsg.react('❌');

	if (xChannelList.length > 0) {
		for (const chan of xChannelList) {
			const xPostChannel: TextChannel = await client.channels.fetch(chan) as TextChannel;

			try {
				await xPostChannel.send({ embeds: [squadEmbed] });

				await xPostChannel.send({ content: `To join the squad, raise your hand here: <${squadMsg.url}>\n` });

			} catch (e) {
				LogUtils.logError(`failed to cross post in channel ${chan}`, e);
			}
		}
	}

	await dmChannel.send(`All done! Your squad assemble has been posted. Check it out in <#${channelIds.scoapSquad}>`);

};

const dbCreateSquad = async (squadEmbed, userId) => {
	const updateDoc = { _id: squadEmbed.footer.text, authorId: userId, title: squadEmbed.title, description: squadEmbed.description, claimedBy: {}, created: squadEmbed.timestamp };

	const db: Db = await dbInstance.connect(constants.DB_NAME_DEGEN);

	const dbSquad = db.collection(constants.DB_COLLECTION_SQUAD);

	await dbSquad.insertOne(updateDoc);
};

const dbClaimSquad = async (squadId, userId, toggle) => {
	const db: Db = await dbInstance.connect(constants.DB_NAME_DEGEN);

	const dbSquad = db.collection(constants.DB_COLLECTION_SQUAD);

	const record = await dbSquad.findOne({ '_id': squadId });

	const insertDoc = record.claimedBy;

	switch(toggle) {
	case 'CLAIM':
		insertDoc[userId] = Date.now();
		break;
	case 'UNCLAIM':
		delete insertDoc[userId];
		break;
	}
	await dbSquad.updateOne({ _id: squadId }, { $set: { claimedBy: insertDoc } }, { upsert: true });
};

export const claimSquad = async (user: User, squadMsg: Message, toggle: string): Promise<void> => {
	const updateEmbed = squadMsg.embeds[0].addField('\u200b', `🙋 - <@${user.id}>`, false);

	await dbClaimSquad(updateEmbed.footer.text, user.id, toggle);

	await squadMsg.edit({ embeds:[updateEmbed] });
};

export const unclaimSquad = async (user: User, squadMsg: Message, toggle: string): Promise<void> => {
	const fields = squadMsg.embeds[0].fields;

	fields.splice(fields.findIndex(matchesEl), 1);

	function matchesEl(el) {
		return el.value === `🙋 - <@${user.id}>`;
	}

	const updateEmbed = squadMsg.embeds[0];

	updateEmbed.fields = fields;

	await dbClaimSquad(updateEmbed.footer.text, user.id, toggle);

	await squadMsg.edit({ embeds:[updateEmbed] });
};

const createEmbed = (member: GuildMember, title: string, description: string): MessageEmbed => {
	return new MessageEmbed()
		.setAuthor(member.user.username)
		.setTitle(title)
		.setDescription(description)
		.setFooter(randomUUID())
		.setTimestamp();
};

// const selectChannel = async (member) => {
// 	const dmChannel: DMChannel = await member.user.createDM();
//
// 	await dmChannel.send({ content: 'You will be presented with two lists of channels.\n\n' +
// 			'Your selection from `CURRENT CHANNELS` list will be removed from the shortlist.\n' +
// 			'Your selection from `AVAILABLE CHANNELS` list will be added to the shortlist.\n\n' +
// 			'You can select channels by responding with their corresponding index number after the prompt.\n' +
// 			'Your response should be a comma delimited list of channel indices e.g. `1,10,5,7` - consisting of both, channels to add AND channels to remove (if any).\n\n' +
// 			'The total number of channels in the shortlist is limited to 25. Please ensure that:\n' +
// 			'`(current channels + your selection from AVAILABLE CHANNELS - your selection from CURRENT CHANNELS) <=25`' });
//
// 	await dmChannel.send({ content: 'List of `CURRENT CHANNELS`' });
//
// 	const channelShortlist = await dbChannelShortlist();
//
// 	await dmChannel.send({ content: 'List of `AVAILABLE CHANNELS`' });
//
// 	const channels = await member.guild.channels.fetch();
//
// 	const channelArray = [];
//
// 	for (const channel of channels.values()) {
// 		if (!channel.isThread()) {
// 			channelArray.push(channel.id);
// 		}
// 	}
//
// 	for (const [index, channel] of channelArray.entries()) {
// 		await dmChannel.send({ content: `${index} <#${channel}>` });
// 	}
//
// 	const getChannelsPrompt = await dmChannel.send({ content: 'Your selection please' });
//
// 	const collector = dmChannel.createMessageCollector({ max: 1, time: (5000 * 60), dispose: true });
//
// 	collector.on('collect', async (msg) => {
//
// 		try {
// 			// validate
//
// 			await dbAddChannelsToShortlist(msg.content, channelShortlist, channelArray);
//
// 			return;
//
// 		} catch (e) {
// 			if (e instanceof ValidationError) {
// 				await selectChannel(member);
// 			}
// 			return;
// 		}
// 	});
//
// 	collector.on('end', async (_, reason) => {
//
// 		// if getChannelsPrompt is not the last message, time out silently.
// 		if ((getChannelsPrompt.id === dmChannel.lastMessage.id) && (reason === 'time')) {
// 			try {
// 				await dmChannel.send('The conversation timed out.');
// 			} catch (e) {
// 				Log.debug(`Squad selectChannel collector timed out, unable to send dm, error msg: ${e}`);
// 			}
// 		}
// 		if (!['time'].includes(reason)) {
// 			Log.debug(`Squad selectChannel collector stopped for unknown reason: ${reason}`);
// 		}
// 	});
// };
//
// const dbAddChannelsToShortlist = async (input, channelShortlist, channelArray) => {
// 	const index = input.split(',');
// 	console.log(index);
// 	console.log(channelShortlist);
// 	for (const val of index.values()) {
// 		console.log(val);
// 		// try to remove channel from shortlist
// 		// try {
// 		// 	const removed = channelShortlist.splice(parseInt(val), 1);
// 		// 	console.log('removed', removed);
// 		// 	console.log('channelShortlist', channelShortlist);
// 		// } catch (e) {
// 		// 	console.log(`val not found ${e}`);
// 		// }
// 		// try to add channels to db
// 		// console.log('val - channelShortlist.length', val - channelShortlist.length);
// 		// if ((val - channelShortlist.length) >= 0) {
// 		// 	channelShortlist.push(channelArray[val - channelShortlist.length]);
// 		//
// 		// }
// 	}
//
// 	console.log(channelShortlist);
//
// 	const db: Db = await dbInstance.connect(constants.DB_NAME_DEGEN);
//
// 	const dbSquad = db.collection(constants.DB_COLLECTION_SQUAD_CHANNELS);
//
// 	const record = await dbSquad.findOne({});
//
// 	await dbSquad.updateOne({ _id: record._id }, { $set: { claimedBy: channelShortlist } }, { upsert: true });
// };
//
// const dbChannelShortlist = async () => {
// 	const db: Db = await dbInstance.connect(constants.DB_NAME_DEGEN);
//
// 	const dbSquad = db.collection(constants.DB_COLLECTION_SQUAD_CHANNELS);
//
// 	const records:Record<string, any> = await dbSquad.find({}).toArray();
//
// 	console.log(records);
//
// 	return records.channels;
// };

const createMultiSelect = async (member: GuildMember, title: string, description: string, squadEmbed): Promise<void> => {
	const dmChannel: DMChannel = await member.user.createDM();

	const channels = await member.guild.channels.fetch();

	const optionsArray = [];

	for (const channel of channels.values()) {
		optionsArray.push({
			label: channel.name,
			description: channel.id,
			value: channel.id,
		});
	}

	const row = new MessageActionRow()
		.addComponents(
			new MessageSelectMenu()
				.setCustomId('select')
				.setPlaceholder('Nothing selected')
				.setMinValues(0)
				.setMaxValues(25)
				.addOptions(optionsArray.slice(0, 25)),
		);

	const row2 = new MessageActionRow()
		.addComponents(
			new MessageButton()
				.setCustomId('back')
				.setLabel('Back')
				.setStyle('PRIMARY'),
			new MessageButton()
				.setCustomId('next')
				.setLabel('Next')
				.setStyle('PRIMARY'),
			new MessageButton()
				.setCustomId('done')
				.setLabel('Done')
				.setStyle('SUCCESS'),
		);

	const interactionMsg = await dmChannel.send({ content: 'please select at least one channel to cross post your squad.', components: [row, row2] });

	console.log(interactionMsg.components);

	client.on('interactionCreate', async interaction => {
		if (!interaction.isSelectMenu()) return;

		// only trigger interaction of recent message
		if (!(interactionMsg.id === await interaction.channel.messages.cache.lastKey(1)[0])) return;

		await finalConfirm(member, squadEmbed, interaction.values);

		return;
	});
};