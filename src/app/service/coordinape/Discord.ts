import { CommandContext } from 'slash-create';


// /discord - link to discord
export const Discord = async (ctx: CommandContext): Promise<any> => {
	const ApplyEmbed = {
		color: 0x0099ff,
		title: 'Coordinape Discord Server',
		url: 'https://yearnfinance.typeform.com/to/egGYEbrC/',
		author: {
			name: 'DEGEN',
		},
		description: 'Join us in our discord server!',
	};
	await ctx.send({ embeds: [ApplyEmbed] });
};