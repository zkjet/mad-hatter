import { CommandContext } from 'slash-create';


// /apply - typeform link to join coordinape and give out grants through our application
export const Apply = async (ctx: CommandContext): Promise<any> => {
	const ApplyEmbed = {
		color: 0x0099ff,
		title: 'Apply to Coordinape',
		url: 'https://yearnfinance.typeform.com/to/egGYEbrC/',
		author: {
			name: 'DEGEN',
		},
		description: 'Please fill out the linked form. You WILL hear back from us!',
	};
	await ctx.send({ embeds: [ApplyEmbed] });
};