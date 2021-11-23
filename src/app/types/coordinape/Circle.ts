import { Collection } from 'mongodb';

// copied from https://github.com/coordinape/coordinape-backend/blob/abbb8a3b743c8abf749721655e54db4ff234ef63/app/Models/Circle.php
// any types need to be updated

export interface Circle extends Collection {
	name: string,
	protocol_id: string,
	token_name: string,
    team_sel_text: string,
    aloc_text: string,
	vouching: any,
	min_vouches: any,
	logo: any,
    default_opt_in: any,
    team_selection: any,
    discord_webhook: any,
    only_giver_voucher: any,
}