import {
	DMChannel,
	GuildMember,
	TextBasedChannels,
	MessageActionRow,
	MessageSelectMenu,
	MessageEmbed, TextChannel,
} from 'discord.js';
import { CommandContext } from 'slash-create';
import Log, { LogUtils } from '../../utils/Log';
import BountyUtils from '../../utils/BountyUtils';
import ValidationError from '../../errors/ValidationError';
import client from '../../app';
import channelIds from '../constants/channelIds';

export default async (member: GuildMember, ctx?: CommandContext): Promise<void> => {
	ctx?.send(`Hi, ${ctx.user.mention}! I sent you a DM with more information.`);

	await getTitle(member);

};

const getTitle = async (member: GuildMember): Promise<void> => {
	const dmChannel: DMChannel = await member.user.createDM();

	await dmChannel.send({ content: 'Let\'s assemble a Squad! What is the title of your project?' });

	const collector = dmChannel.createMessageCollector({ max: 1, time: (5000 * 60), dispose: true });

	collector.on('collect', async (msg) => {

		try {
			console.log('collected: ', msg.content);

			await BountyUtils.validateTitle(member, msg.content);

			await getDescription(member, msg.content);

			return;

		} catch (e) {
			console.log('we got an error', e);

			if (e instanceof ValidationError) {
				await getTitle(member);
			}
			return;
		}
	});

	collector.on('end', async (_, reason) => {
		if (reason === 'time') {
			await dmChannel.send('The conversation timed out.');
		}
	});
};

const getDescription = async (member: GuildMember, title: string): Promise<void> => {
	const dmChannel: DMChannel = await member.user.createDM();

	await dmChannel.send({ content: 'A short description perhaps?' });

	const collector = dmChannel.createMessageCollector({ max: 1, time: (5000 * 60), dispose: true });

	collector.on('collect', async (msg) => {

		try {
			await BountyUtils.validateSummary(member, msg.content);

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
		if (reason === 'time') {
			await dmChannel.send('The conversation timed out.');
		}
	});
};

const xPostConfirm = async (member, title, description, squadEmbed): Promise<void> => {
	const dmChannel: DMChannel = await member.user.createDM();

	const xPostConfirmMsg = await dmChannel.send({ content: 'Would you like to cross post the Squad in other channels? \n' +
	'👍 - Select cross post channels\n' +
	'📮 - Post without cross posting\n' +
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
					if (reac.emoji.name === '👍') {
						await createMultiSelect(member, title, description);

						return;
					} else if (reac.emoji.name === '📮') {
						await postSquad(member, squadEmbed);

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
			await dmChannel.send({ content: 'Command timed out.' });
		}
	});
};

const postSquad = async (member, squadEmbed): Promise<void> => {
	const dmChannel: DMChannel = await member.user.createDM();

	const squadChannel: TextChannel = await client.channels.fetch(channelIds.scoapSquad) as TextChannel;

	await squadChannel.send({ embeds: [squadEmbed] });

	await dmChannel.send(`All done! Your Squad assemble has been posted in <#${channelIds.scoapSquad}>`);

	// await updateDatabase();

	// await updateNotion();

	// await startPoll();
};

const createEmbed = (member: GuildMember, title: string, description: string): MessageEmbed => {
	return new MessageEmbed()
		.setTitle(title)
		.setDescription(description)
		.setTimestamp();
};

const createMultiSelect = async (member: GuildMember, title: string, description: string): Promise<void> => {
	console.log('test', title, description);

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

	await dmChannel.send({ content: 'please select at least one channel to cross post your squad.', components: [row] });

	client.on('interactionCreate', async interaction => {
		if (!interaction.isSelectMenu()) return;

		console.log(interaction.values);

		return;
	});


};


// collector.on('end', async (collected, reason) => {

// 	if (reason === 'limit') {
// 		try {

// 			console.log('collected: ', collected.values()[0]);

// 			await BountyUtils.validateTitle(member, collected.values()[0].content);

// 			console.log('title valid: ');

// 		} catch (e) {

// 			console.log('we got an error', e);

// 		}
// 		return;
// 	}


// 	await dmChannel.send('The conversation timed out.');


// 	if (!['limit', 'time'].includes(reason)) {
// 		Log.debug(`Squad message collector stopped for unknown reason: ${reason}`);
// 	}
// });