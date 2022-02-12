import {
	DMChannel,
	GuildMember,
	MessageEmbed,
	TextChannel,
	User,
	Message,
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
	ctx?.send({ content: `Hi, ${ctx.user.mention}! I sent you a DM with more information.`, ephemeral: true });

	await getTitle(member, ctx);
};

const getTitle = async (member: GuildMember, ctx?: CommandContext): Promise<void> => {
	Log.debug('squadUp invoked getTitle()');

	const dmChannel: DMChannel = await member.user.createDM();

	Log.debug('squadUp getTitle() - about to send DM to user');
	let getTitlePrompt: Message;
	try {
		getTitlePrompt = await dmChannel.send({ content: 'Let\'s assemble a Squad! What is the title of your project?' });

	} catch {
		ctx?.send({ content: `Hi, ${ctx.user.mention}! Please enable DMs and try again.`, ephemeral: true });

		Log.debug('squadUp failed to send DM - possibly disabled?');

		return;
	}

	const collector = dmChannel.createMessageCollector({ max: 1, time: (5000 * 60), dispose: true });

	collector.on('collect', async (msg) => {

		try {
			await SquadUtils.validateTitle(member, msg.content);

			await getDescription(member, msg.content);

			return;

		} catch (e) {
			if (e instanceof ValidationError) {

				Log.debug('squadUp title validation failed');

				await getTitle(member);
			}
			return;
		}
	});

	collector.on('end', async (_, reason) => {

		// if getTitlePrompt is not the last message, time out silently.
		if ((getTitlePrompt.id === dmChannel.lastMessage.id) && (reason === 'time')) {
			Log.debug('squadUp getTitle message collector timed out');

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
	Log.debug('squadUp invoked getDescription()');

	const dmChannel: DMChannel = await member.user.createDM();

	Log.debug('squadUp getDescription() - about to send input prompt DM to user');

	const getDescriptionPrompt = await dmChannel.send({ content: 'A short description perhaps?' });

	const collector = dmChannel.createMessageCollector({ max: 1, time: (5000 * 60), dispose: true });

	collector.on('collect', async (msg) => {

		try {
			await SquadUtils.validateSummary(member, msg.content);

			Log.debug('squadUp summary valid');

			const squadEmbed = createEmbed(member, title, msg.content);

			Log.debug('squadUp getDescription() - about to send preview embed DM to user');

			await dmChannel.send({ content: 'Preview: ', embeds: [squadEmbed] });

			await xPostConfirm(member, title, msg.content, squadEmbed);

			return;

		} catch (e) {
			if (e instanceof ValidationError) {
				Log.debug('squadUp summary validation failed');

				await getDescription(member, title);
			}

			return;
		}
	});

	collector.on('end', async (_, reason) => {

		// if getTitlePrompt is not the last message, time out silently.
		if ((getDescriptionPrompt.id === dmChannel.lastMessage.id) && (reason === 'time')) {
			Log.debug('squadUp getDescription() message collector timed out');

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
	Log.debug('squadUp invoked xPostConfirm()');

	const dmChannel: DMChannel = await member.user.createDM();

	Log.debug('squadUp xPostConfirm() - about to send confirmation prompt DM to user');

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
			Log.debug('squadUp xPostConfirm valid reaction received');

			for (const reac of collected.values()) {
				const users = await reac.users.fetch();

				if (users.has(member.user.id)) {
					if (reac.emoji.name === '📮') {
						Log.debug('squadUp xPostConfirm 📮 selected');

						await getCrossPostChannels(member, squadEmbed);

						return;
					} else if (reac.emoji.name === '👍') {
						Log.debug('squadUp xPostConfirm 👍 selected');

						await postSquad(member, squadEmbed, []);

						return;
					} else if (reac.emoji.name === '🔃') {
						Log.debug('squadUp xPostConfirm 🔃 selected');

						await dmChannel.send({ content: 'Let\'s start over.' });

						await getTitle(member);

						return;
					} else if (reac.emoji.name === '❌') {
						Log.debug('squadUp xPostConfirm ❌ selected');

						await dmChannel.send({ content: 'Command cancelled.' });

						return;
					}
				}
			}
		} else {
			if ((xPostConfirmMsg.id === dmChannel.lastMessage.id) && (reason === 'time')) {
				Log.debug('squadUp xPostConfirm reaction collector timed out');

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
	Log.debug('squadUp invoked finalConfirm()');

	const dmChannel: DMChannel = await member.user.createDM();

	Log.debug('squadUp finalConfirm() - about to send confirmation prompt DM to user');

	await dmChannel.send({ content: 'the following channels were selected:\n' });

	if (xChannelList.length > 0) {
		Log.debug('squadUp list of cross post channels was provided by user');

		for (const chan of xChannelList) {
			await dmChannel.send({ content: `<#${chan}>\n` });
		}
	}

	const finalConfirmMsg = await dmChannel.send({ content:
			'👍 - Good to go, post now.\n' +
			'🔃 - I want to change something - start over\n' +
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
						Log.debug('squadUp finalConfirm() received 👍 reaction');

						await postSquad(member, squadEmbed, xChannelList);

						return;
					} else if (reac.emoji.name === '🔃') {
						Log.debug('squadUp finalConfirm() received 🔃 reaction');

						await dmChannel.send({ content: 'Let\'s start over.' });

						await getTitle(member);

						return;
					} else if (reac.emoji.name === '❌') {
						Log.debug('squadUp finalConfirm() received ❌ reaction');

						await dmChannel.send({ content: 'Command cancelled.' });

						return;
					}
				}
			}
		} else {
			if ((finalConfirmMsg.id === dmChannel.lastMessage.id) && (reason === 'time')) {
				Log.debug('squadUp finalConfirm() reaction collector timed out');
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
	Log.debug('squadUp postSquad() invoked');

	const dmChannel: DMChannel = await member.user.createDM();

	let squadChannel: TextChannel;

	try {
		squadChannel = await client.channels.fetch(channelIds.squad) as TextChannel;
	} catch (e) {
		LogUtils.logError('squadUp postSquad() failed to fetch squad channel', e);
		return;
	}

	let squadMsg: Message;
	try {
		squadMsg = await squadChannel.send({ embeds: [squadEmbed] });
	} catch (e) {
		LogUtils.logError('squadUp postSquad() failed to post to squad channel', e);
		return;
	}

	await dbCreateSquad(squadEmbed, member.user.id, squadMsg);

	await squadMsg.react('🙋');
	await squadMsg.react('❌');

	if (xChannelList.length > 0) {
		Log.debug('squadUp postSquad() cross posting');

		for (const chan of xChannelList) {

			try {
				const xPostChannel: TextChannel = await client.channels.fetch(chan) as TextChannel;

				await xPostChannel.send({ embeds: [squadEmbed] });

				await xPostChannel.send({ content: `To join the squad, raise your hand here: <${squadMsg.url}>\n` });

			} catch (e) {
				LogUtils.logError(`failed to cross post in channel ${chan}`, e);
			}
		}
	}
	Log.debug('squadUp postSquad() about to send success message to user via DM');

	await dmChannel.send(`All done! Your squad assemble has been posted. Check it out in <#${channelIds.squad}>`);

};

const dbCreateSquad = async (squadEmbed, userId, squadMsg) => {
	Log.debug('squadUp dbCreateSquad() invoked');

	const updateDoc = {
		_id: squadEmbed.footer.text,
		guildId: squadMsg.guild.id,
		messageId: squadMsg.id,
		authorId: userId,
		title: squadEmbed.title,
		description: squadEmbed.description,
		claimedBy: {},
		created: squadEmbed.timestamp,
		active: true,
	};

	const db: Db = await dbInstance.connect(constants.DB_NAME_DEGEN);

	const dbSquad = db.collection(constants.DB_COLLECTION_SQUAD);

	await dbSquad.insertOne(updateDoc);
};

const dbClaimSquad = async (squadId, userId, toggle) => {
	Log.debug('squadUp dbClaimSquad() invoked');

	const db: Db = await dbInstance.connect(constants.DB_NAME_DEGEN);

	const dbSquad = db.collection(constants.DB_COLLECTION_SQUAD);

	const record = await dbSquad.findOne({ '_id': squadId });

	const insertDoc = record.claimedBy;

	switch(toggle) {
	case 'CLAIM':
		Log.debug('squadUp dbClaimSquad() case CLAIM');
		insertDoc[userId] = Date.now();
		break;
	case 'UNCLAIM':
		Log.debug('squadUp dbClaimSquad() case UNCLAIM');
		delete insertDoc[userId];
		break;
	}
	await dbSquad.updateOne({ _id: squadId }, { $set: { claimedBy: insertDoc } }, { upsert: true });
};

export const claimSquad = async (user: User, squadMsg: Message, toggle: string): Promise<void> => {
	Log.debug('squadUp claimSquad() invoked');

	const db: Db = await dbInstance.connect(constants.DB_NAME_DEGEN);

	const dbSquad = db.collection(constants.DB_COLLECTION_SQUAD);

	const squad = await dbSquad.findOne({ 'messageId': squadMsg.id });

	if (user.id in squad.claimedBy) return ;

	if (squadMsg.embeds[0].fields.length <= 24) {
		Log.debug('squadUp claimSquad() valid to claim');

		const updateEmbed = squadMsg.embeds[0].addField('\u200b', `🙋 - <@${user.id}>`, false);

		await dbClaimSquad(updateEmbed.footer.text, user.id, toggle);

		await squadMsg.edit({ embeds:[updateEmbed] });
	}
};

export const unclaimSquad = async (user: User, squadMsg: Message, toggle: string): Promise<void> => {
	Log.debug('squadUp unclaimSquad() invoked');

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
	Log.debug('squadUp createEmbed() invoked');

	return new MessageEmbed()
		.setAuthor(member.user.username, member.user.avatarURL())
		.setTitle(title)
		.setDescription(description)
		.setFooter(randomUUID())
		.setTimestamp();
};

const getCrossPostChannels = async (member: GuildMember, squadEmbed) => {
	Log.debug('squadUp getCrossPostChannels() invoked');

	const dmChannel: DMChannel = await member.user.createDM();

	Log.debug('squadUp getCrossPostChannels() about to send DM to user: xPost channel list input prompt');

	const channelListInputPrompt = await dmChannel.send({ content: 'Please send me a list of comma separated channel Id\'s' });

	const collector = dmChannel.createMessageCollector({ max: 1, time: (20000 * 60), dispose: true });

	collector.on('collect', async (msg) => {
		Log.debug('squadUp getCrossPostChannels() Received user input, running input transformation');

		try {

			// Remove white spaces
			Log.debug('squadUp getCrossPostChannels() Remove white spaces');
			const noWhitespaces = msg.content.replace(/\s/g, '');

			Log.debug('squadUp getCrossPostChannels() Split string by delimiter');
			const rawArray = noWhitespaces.split(',');

			// Remove duplicates
			Log.debug('squadUp getCrossPostChannels() Removing duplicate entries');
			const unique = [...new Set(rawArray)];

			// Only include items that consists of 18 numeric characters
			Log.debug('squadUp getCrossPostChannels() Regex to match channel IDs');
			const xPostChannels = [];
			for (const chan of unique) {
				if (/^[0-9]{18}/.test(chan)) {
					xPostChannels.push(chan);
				}
			}

			Log.debug('squadUp getCrossPostChannels() Input transformation complete');
			await finalConfirm(member, squadEmbed, xPostChannels);

			return;

		} catch (e) {
			LogUtils.logError('squadUp getCrossPostChannels() input transformation failed', e);

			if (e instanceof ValidationError) {
				await getCrossPostChannels(member, squadEmbed);
			}
			return;
		}
	});

	collector.on('end', async (_, reason) => {

		// if channelListInputPrompt is not the last message, time out silently.
		if ((channelListInputPrompt.id === dmChannel.lastMessage.id) && (reason === 'time')) {
			try {
				await dmChannel.send('The conversation timed out.');
			} catch (e) {
				Log.debug(`Squad getCrossPostChannels collector timed out, unable to send dm, error msg: ${e}`);
			}
		}
		if (!['time', 'limit'].includes(reason)) {
			Log.debug(`Squad getCrossPostChannels collector stopped for unknown reason: ${reason}`);
		}
	});
};

export const checkExpiration = async (): Promise<void> => {
	Log.debug('squadUp checkExpiration() invoked');

	const db: Db = await dbInstance.connect(constants.DB_NAME_DEGEN);

	const dbSquad = db.collection(constants.DB_COLLECTION_SQUAD);

	const timestampAggregate = await dbSquad.aggregate([
		{ '$match': {	active: true } },
	]).toArray();

	let squadChannel: TextChannel;
	try {
		squadChannel = await client.channels.fetch(channelIds.squad) as TextChannel;
	} catch {
		Log.debug('squadUp checkExpiration() failed to fetch squad channel');
		return;
	}

	for (const squad of timestampAggregate) {

		if ((+new Date() - squad.created) >= 1000 * 60 * 60 * 24 * 7) {
			Log.debug('squadUp checkExpiration() found expired squad');

			const guilds = await client.guilds.fetch();

			for (const oAuth2Guild of guilds.values()) {
				const guild = await oAuth2Guild.fetch();

				if (guild.id === squad.guildId) {
					const members = await guild.members.fetch();

					for (const member of members.values()) {
						if (member.id === squad.authorId) {

							const dmChannel: DMChannel = await member.createDM();
							Log.debug('squadUp checkExpiration() sending completion DM to squad author');

							try {
								await dmChannel.send({ content: 'Squad has been completed. Time to get in touch with your team! ' +
										`<https://discord.com/channels/${squad.guildId}/${channelIds.squad}/${squad.messageId}>` });
							} catch {
								Log.info(`Squad completed - failed to send DM - SquadId ${squad._id}`);
							}

							const squadMsg = await squadChannel.messages.fetch(squad.messageId);

							await squadMsg.reactions.removeAll();

							await squadMsg.react('🔃');

							await dbSquad.updateOne({ _id: squad._id }, { $set: { active: false } }, { upsert: true });

							return;
						}
					}
				}
			}
		}
	}
};