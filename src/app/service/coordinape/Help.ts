import { CommandContext } from 'slash-create';

// /help - link to documentation
export const Help = async (ctx: CommandContext): Promise<any> => {
	return await ctx.send('Help is on the way!');
};