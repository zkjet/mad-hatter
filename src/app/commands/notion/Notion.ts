import { Client as NotionClient } from '@notionhq/client';
import dayjs from 'dayjs';
import { BaseGuildVoiceChannel, EmbedFieldData, MessageEmbed } from 'discord.js';
import { Db } from 'mongodb';
import { CommandContext, CommandOptionType, SlashCommand, SlashCreator } from 'slash-create';
import constants from '../../service/constants/constants';
import discordServerIds from '../../service/constants/discordServerIds';
import notionPageRefs from '../../service/notion/NotionGuildPages';
import { NotionMeetingNotes } from '../../types/notion/NotionMeetingNotes';
import { LogUtils } from '../../utils/Log';
import MongoDbUtils from '../../utils/MongoDbUtils';
import { command } from '../../utils/SentryUtils';
import ServiceUtils from '../../utils/ServiceUtils';
const notion = new NotionClient({ auth: process.env.NOTION_TOKEN });

// Subcommands
const COMMAND_HOMEPAGE = 'homepage';
const COMMAND_NOTES_CREATE = 'create';

export default class NotionNotes extends SlashCommand {
	constructor(creator: SlashCreator) {
		super(creator, {
			name: 'notion',
			description: 'Interact with the DAO Notion',
			guildIDs: [discordServerIds.banklessDAO, discordServerIds.discordBotGarage],
			options: [
				{
					name: COMMAND_HOMEPAGE,
					type: CommandOptionType.SUB_COMMAND,
					description: 'Get the Notion homepage for a guild',
					options: [
						{
							name: 'guild',
							type: CommandOptionType.STRING,
							description: 'Select a guild',
							required: true,
							choices: constants.GUILD_CHOICES,
						},
					],
				},
				{
					name: COMMAND_NOTES_CREATE,
					type: CommandOptionType.SUB_COMMAND,
					description: 'Create a meeting notes page in Notion',
					options: [
						{
							name: 'title',
							type: CommandOptionType.STRING,
							description: 'Title of meeting notes',
							required: true,
						},
						{
							name: 'guild',
							type: CommandOptionType.STRING,
							description: 'Guild that meeting notes belong to',
							required: false,
							choices: constants.GUILD_CHOICES,
						},
						{
							name: 'type',
							type: CommandOptionType.STRING,
							description: 'Type of meeting notes',
							required: false,
							choices: [
								{
									name: 'Standup',
									value: 'Standup',
								},
								{
									name: 'Weekly',
									value: 'Weekly',
								},
								{
									name: 'Retrospective',
									value: 'Retrospective',
								},
								{
									name: 'Ad Hoc',
									value: 'Ad Hoc',
								},
								{
									name: 'Brainstorm',
									value: 'Brainstorm',
								},
								{
									name: 'Governance',
									value: 'Governance',
								},
								{
									name: 'Community Call',
									value: 'Community Call',
								},
							],
						},
					],
				},
			],
			throttling: {
				usages: 2,
				duration: 1,
			},
		});
	}

	@command
	async run(ctx: CommandContext): Promise<any> {
		LogUtils.logCommandStart(ctx);
		// Ignores commands from bots
		if (ctx.user.bot) return;

		switch (ctx.subcommands[0]) {
		case COMMAND_HOMEPAGE:
			return this.getGuildHomepage(ctx);
		case COMMAND_NOTES_CREATE:
			return this.createMeetingNotes(ctx);
		default:
			LogUtils.logError('Undefined command', null);
			return;
		}
	}

	async getGuildHomepage(ctx: CommandContext): Promise<any> {
		const options = ctx.options[COMMAND_HOMEPAGE];
		const guild = String(options.guild).toLowerCase();
		const page = notionPageRefs[guild];
		return ctx.send(`Here you are ${ctx.user.mention}, the ${options.guild} Guild Notion Page: ${page}`);
	}

	async createMeetingNotes(ctx: CommandContext): Promise<any> {
		const options = ctx.options[COMMAND_NOTES_CREATE];
		const { guild, guildMember } = await ServiceUtils.getGuildAndMember(ctx);
		const voiceChannelId = guildMember.voice.channelId;
		const fields: EmbedFieldData[] = [];

		// Initialize properties with required or automatically generated fields
		const properties = {
			'Name': {
				title: [
					{
						type: 'text',
						text: {
							content: options.title,
						},
					},
				],
			},
			'Date': {
				date: {
					start: dayjs().format('YYYY-MM-DD'),
				},
			},
			'Note-taker': {
				rich_text: [
					{
						type: 'text',
						text: {
							content: `${ctx.user.username}#${ctx.user.discriminator}`,
						},
					},
				],
			},
		};

		// Add members in attendence to properties if user is in a voice channel
		if (voiceChannelId !== undefined) {
			const voiceChannel = guild.channels.cache.find(channel => {
				return channel.id == voiceChannelId;
			}) as BaseGuildVoiceChannel;

			if (voiceChannel != null && voiceChannel.type != 'GUILD_STAGE_VOICE') {
				const attendees = voiceChannel.members.map(member => member.displayName).join(', ');
				properties['Attendance'] = {
					rich_text: [
						{
							type: 'text',
							text: {
								content: attendees,
							},
						},
					],
				};
				
				fields.push({
					'name': 'Attendees',
					'value': attendees,
				} as EmbedFieldData);
			}
		}

		// Add type to properties if defined
		if (options.type !== undefined) {
			properties['Type'] = {
				multi_select: [
					{
						name: options.type,
					},
				],
			};
			fields.push({
				'name': 'Type',
				'value': options.type,
			} as EmbedFieldData);
		}

		// Default database is the central meeting notes database
		let databaseId = process.env.NOTION_CENTRAL_MEETING_NOTES_DATABASE_ID;
		if (options.guild !== undefined) {
			const db: Db = await MongoDbUtils.connect(constants.DB_NAME_DEGEN);
			const dbMeetingNotes = db.collection(constants.DB_COLLECTION_MEETING_NOTES);

			const notionMeetingNotes: NotionMeetingNotes = await dbMeetingNotes.findOne({
				guild: options.guild,
			});

			// Use guild-specific meeting notes database if it exists
			if (notionMeetingNotes) {
				databaseId = notionMeetingNotes.databaseId;
				fields.push({
					'name': 'Guild',
					'value': options.guild,
				} as EmbedFieldData);
			}
		}

		await notion.pages.create({
			parent: {
				database_id: databaseId,
			},
			properties: properties as Record<string, any>,
		}).then(async response => {
			fields.push({
				'name': 'Link',
				'value': `**[${options.title}](${response.url})**`,
			} as EmbedFieldData);

			const embed = new MessageEmbed()
				.setTitle('Meeting Notes')
				.setDescription('Created new meeting notes.')
				.setColor(0xFF1A1A)
				.setFields(fields.reverse());
				
			return ctx.send({ embeds: [embed as any] });
		}).catch(e => {
			LogUtils.logError('Failed to create meeting notes', e, guild.id);
			return ctx.send('Unable to create meeting notes at this time.');
		});
	}
}