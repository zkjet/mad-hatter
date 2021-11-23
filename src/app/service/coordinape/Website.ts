import { CommandContext } from 'slash-create';

// /website - link to website
export const Website = async (ctx: CommandContext): Promise<any> => {
	const WebsiteEmbed = {
		color: 0x0099ff,
		title: 'Coordinape Website',
		url: 'http://www.coordinape.com/',
		author: {
			name: 'DEGEN',
		},
		description: 'Tools for DAOs that Do',
	};
	await ctx.send({ embeds: [WebsiteEmbed] });
};