import {
	CommandContext,
	CommandOptionType,
	SlashCommand,
	SlashCreator,
} from 'slash-create';
import ServiceUtils from '../../utils/ServiceUtils';
import CoordinapeSendForm from '../../service/coordinape/CoordinapeSendForm';
import ValidationError from '../../errors/ValidationError';
import discordServerIds from '../../service/constants/discordServerIds';
import { LogUtils } from '../../utils/Log';
import { Regive } from '../../service/coordinape/Regive';
import { Give } from '../../service/coordinape/Give';
import { Gives } from '../../service/coordinape/Gives';
import { Ungive } from '../../service/coordinape/Ungive';
import { Receipts } from '../../service/coordinape/Receipts';
import { Discord } from '../../service/coordinape/Discord';
import { Website } from '../../service/coordinape/Website';
import { Apply } from '../../service/coordinape/Apply';
import { Help } from '../../service/coordinape/Help';


// README
// Permissions for the /coordinape form-request need to be tweaked 
// the old permission structure is documented on the bottom of the file
module.exports = class Coordinape extends SlashCommand {
	constructor(creator: SlashCreator) {
		super(creator, {
			name: 'coordinape',
			description: 'Commands to manage Coordinape rounds',
			guildIDs: [process.env.DISCORD_SERVER_ID, discordServerIds.banklessDAO, discordServerIds.discordBotGarage],
			options: [
				{
					name: 'form-request',
					type: CommandOptionType.SUB_COMMAND,
					description: 'Send correct for to coordinape participants.',
					options: [],
				},
				{
					name: 'regive',
					type: CommandOptionType.SUB_COMMAND,
					description: 'Allocate according to your previous epoch\'s allocations, your current allocations will be reset.',
					options: [],
				},
				{
					name: 'give',
					type: CommandOptionType.SUB_COMMAND,
					description: 'Add username, tokens and note.',
					options: [
						{
							name: 'recipient',
							type: CommandOptionType.STRING,
							description: 'Username of the token recipient.',
							required: true,
						},
						{
							name: 'amount',
							type: CommandOptionType.STRING,
							description: 'Amount of tokens to give.',
							required: true,
						},
						{
							name: 'note',
							type: CommandOptionType.STRING,
							description: 'Optional note',
							required: false,
						},
					],
				},
				{
					name: 'gives',
					type: CommandOptionType.SUB_COMMAND,
					description: 'Get list of all the allocations that you have sent.',
					options: [],
				},
				{
					name: 'ungive',
					type: CommandOptionType.SUB_COMMAND,
					description: 'Remove all the give tokens the user has have given.',
					options: [],
				},
				{
					name: 'receipts',
					type: CommandOptionType.SUB_COMMAND,
					description: 'Get all the allocations you have received.',
					options: [],
				},
				{
					name: 'discord',
					type: CommandOptionType.SUB_COMMAND,
					description: 'Link to Coordinape discord.',
					options: [],
				},
				{
					name: 'website',
					type: CommandOptionType.SUB_COMMAND,
					description: 'Link to Coordinape website.',
					options: [],
				},
				{
					name: 'apply',
					type: CommandOptionType.SUB_COMMAND,
					description: 'Link to Typeform.',
					options: [],
				},
				{
					name: 'help',
					type: CommandOptionType.SUB_COMMAND,
					description: 'Link to documentaion.',
					options: [],
				},
			],
			throttling: {
				usages: 50,
				duration: 1,
			},
			defaultPermission: true,
		});
	}

	async run(ctx: CommandContext) {
		LogUtils.logCommandStart(ctx);
		if (ctx.user.bot) return;
		const { guildMember } = await ServiceUtils.getGuildAndMember(ctx);
		let command: Promise<any>;
		switch (ctx.subcommands[0]) {
		case 'form-request':
			command = CoordinapeSendForm(guildMember, ctx);
			break;
		case 'regive':
			command = Regive(guildMember, ctx);
			break;
		case 'give':
			command = Give(guildMember, ctx, ctx.options.give['recipient'], ctx.options.submit['amount'], ctx.options.submit['note']);
			break;
		case 'gives':
			command = Gives(guildMember, ctx);
			break;
		case 'ungive':
			command = Ungive(guildMember, ctx);
			break;
		case 'receipts':
			command = Receipts(guildMember, ctx);
			break;
		case 'discord':
			command = Discord(ctx);
			break;
		case 'website':
			command = Website(ctx);
			break;
		case 'apply':
			command = Apply(ctx);
			break;
		case 'help':
			command = Help(ctx);
			break;
		default:
			return ctx.send(`${ctx.user.mention} Please try again.`);
		}

		this.handleCommandError(ctx, command);
	}

	handleCommandError(ctx: CommandContext, command: Promise<any>) {
		command.catch(e => {
			if (!(e instanceof ValidationError)) {
				LogUtils.logError('failed to handle coordinape command', e);
				return ctx.send('Sorry something is not working and our devs are looking into it');
			}
		});
	}

};

/*
permissions: {
				[discordServerIds.banklessDAO]: [
					{
						type: ApplicationCommandPermissionType.ROLE,
						id: roleIds.level2,
						permission: true,
					},
					{
						type: ApplicationCommandPermissionType.ROLE,
						id: roleIds.level1,
						permission: true,
					},
				],
				[discordServerIds.discordBotGarage]: [
					{
						type: ApplicationCommandPermissionType.ROLE,
						id: roleIds.level2,
						permission: true,
					},
					{
						type: ApplicationCommandPermissionType.ROLE,
						id: roleIds.level1,
						permission: true,
					},
				],
			},
*/