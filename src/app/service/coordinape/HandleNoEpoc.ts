import { GuildMember } from 'discord.js';
import { CommandContext } from 'slash-create';

export const handleNoEpochs = async (guidlMember:GuildMember, ctx: CommandContext, coordinapeUser): Promise<any> => {
	return await ctx.send(`Sorry ${coordinapeUser} ser, there are currently no active epochs.`);
};