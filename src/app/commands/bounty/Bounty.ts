import {
	CommandContext,
	CommandOptionType,
	SlashCommand,
	SlashCreator,
} from 'slash-create';
import ValidationError from '../../errors/ValidationError';
import DeleteBounty from '../../service/bounty/DeleteBounty';
import ServiceUtils from '../../utils/ServiceUtils';
import { BountyCreateNew } from '../../types/bounty/BountyCreateNew';
import ListBounty from '../../service/bounty/ListBounty';
import CreateNewBounty from '../../service/bounty/create/CreateNewBounty';
import PublishBounty from '../../service/bounty/create/PublishBounty';
import ClaimBounty from '../../service/bounty/ClaimBounty';
import SubmitBounty from '../../service/bounty/SubmitBounty';
import CompleteBounty from '../../service/bounty/CompleteBounty';
import discordServerIds from '../../service/constants/discordServerIds';
import Log, { LogUtils } from '../../utils/Log';
import { command } from '../../utils/SentryUtils';

export default class Bounty extends SlashCommand {
	constructor(creator: SlashCreator) {
		super(creator, {
			name: 'bounty',
			description: 'List, create, claim, delete, and complete bounties',
			guildIDs: [discordServerIds.banklessDAO, discordServerIds.discordBotGarage],
			options: [
				{
					name: 'claim',
					type: CommandOptionType.SUB_COMMAND,
					description: 'Claim a bounty to work on',
					options: [
						{
							name: 'bounty-id',
							type: CommandOptionType.STRING,
							description: 'Bounty Hash ID',
							required: true,
						},
					],
				},
				{
					name: 'complete',
					type: CommandOptionType.SUB_COMMAND,
					description: 'Mark bounty as complete and reward the claimer',
					options: [
						{
							name: 'bounty-id',
							type: CommandOptionType.STRING,
							description: 'Bounty Hash ID',
							required: true,
						},
					],
				},
				{
					name: 'create',
					type: CommandOptionType.SUB_COMMAND,
					description: 'Create a new draft of a bounty',
					options: [
						{
							name: 'title',
							type: CommandOptionType.STRING,
							description: 'Title of the bounty',
							required: true,
						},
						{
							name: 'reward',
							type: CommandOptionType.STRING,
							description: 'Reward for bounty completion',
							required: true,
						},
						{
							name: 'copies',
							type: CommandOptionType.INTEGER,
							description: 'Publish identical bounties (level 3+, max 100)',
							required: false,
						},
					],
				},
				{
					name: 'publish',
					type: CommandOptionType.SUB_COMMAND,
					description: 'Validate discord handle',
					options: [
						{
							name: 'bounty-id',
							type: CommandOptionType.STRING,
							description: 'Bounty Hash ID',
							required: true,
						},
					],
				},
				{
					name: 'list',
					type: CommandOptionType.SUB_COMMAND,
					description: 'View a fitered list of bounties',
					options: [
						{
							name: 'list-type',
							type: CommandOptionType.STRING,
							description: 'Filter bounties by',
							choices: [
								{
									name: 'created by me',
									value: 'CREATED_BY_ME',
								},
								{
									name: 'claimed by me',
									value: 'CLAIMED_BY_ME',
								},
								{
									name: 'drafted by me',
									value: 'DRAFT_BY_ME',
								},
								{
									name: 'open',
									value: 'OPEN',
								},
								{
									name: 'in progress',
									value: 'IN_PROGRESS',
								},
							],
							required: true,
						},
					],
				},
				{
					name: 'delete',
					type: CommandOptionType.SUB_COMMAND,
					description: 'Delete an open or in draft bounty',
					options: [
						{
							name: 'bounty-id',
							type: CommandOptionType.STRING,
							description: 'Bounty Hash ID',
							required: true,
						},
					],
				},
				{
					name: 'submit',
					type: CommandOptionType.SUB_COMMAND,
					description: 'Submit the bounty that you are working on. Bounty will be reviewed',
					options: [
						{
							name: 'bounty-id',
							type: CommandOptionType.STRING,
							description: 'Bounty Hash ID',
							required: true,
						},
						{
							name: 'url',
							type: CommandOptionType.STRING,
							description: 'Url of work',
							required: false,
						},
						{
							name: 'notes',
							type: CommandOptionType.STRING,
							description: 'Any additional notes',
							required: false,
						},
					],
				},
			],
			throttling: {
				usages: 2,
				duration: 1,
			},
			defaultPermission: true,
		});
	}

	@command
	async run(ctx: CommandContext): Promise<any> {
		LogUtils.logCommandStart(ctx);
		if (ctx.user.bot) return;

		const { guildMember } = await ServiceUtils.getGuildAndMember(ctx);
		let command: Promise<any>;
		let params;
		
		try {
			switch (ctx.subcommands[0]) {
			case 'claim':
				command = ClaimBounty(guildMember, ctx.options.claim['bounty-id']);
				break;
			case 'create':
				params = this.buildBountyCreateNewParams(ctx.guildID, ctx.options.create);
				command = CreateNewBounty(guildMember, params);
				break;
			case 'publish':
				command = PublishBounty(guildMember, ctx.options.publish['bounty-id']);
				break;
			case 'complete':
				command = CompleteBounty(guildMember, ctx.options.complete['bounty-id']);
				break;
			case 'delete':
				command = DeleteBounty(guildMember, ctx.options.delete['bounty-id']);
				break;
			case 'list':
				command = ListBounty(guildMember, ctx.options.list['list-type']);
				break;
			case 'submit':
				command = SubmitBounty(guildMember, ctx.options.submit['bounty-id'], ctx.options.submit['url'], ctx.options.submit['notes']);
				break;
			default:
				return ctx.send(`${ctx.user.mention} Please try again.`);
			}
			this.handleCommandError(ctx, command);
		} catch (e) {
			Log.error(e);
		}
	}

	handleCommandError(ctx: CommandContext, command: Promise<any>): void {
		command.then(() => {
			return ctx.send(`${ctx.user.mention} Sent you a DM with information.`);
		}).catch(e => {
			if (e instanceof ValidationError) {
				return ctx.send({ content: `${e.message}`, ephemeral: true });
			} else {
				LogUtils.logError('error', e);
				return ServiceUtils.sendOutErrorMessage(ctx);
			}
		});
	}
	
	buildBountyCreateNewParams(guild: string, ctxOptions: { [key: string]: any }): BountyCreateNew {
		const [reward, symbol] = (ctxOptions.reward != null) ? ctxOptions.reward.split(' ') : [null, null];
		const copies = (ctxOptions.copies == null || ctxOptions.copies <= 0) ? 1 : ctxOptions.copies;
		let scale = reward.split('.')[1]?.length;
		scale = (scale != null) ? scale : 0;
		return {
			customer_id: guild,
			title: ctxOptions.title,
			reward: {
				amount: reward,
				currencySymbol: symbol,
				scale: scale,
				amountWithoutScale: reward.replace('.', ''),
			},
			copies: copies,
		};
	}
}