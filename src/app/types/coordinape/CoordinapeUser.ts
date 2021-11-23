import { Collection } from 'mongodb';

// copied from https://github.com/coordinape/coordinape-backend/blob/abbb8a3b743c8abf749721655e54db4ff234ef63/app/Models/User.php
// types may be incorrect
export interface CoordinapeUser extends Collection {
	name: string,
	address: string,
	circle_id: string,
	give_token_remaining: number,
	give_token_received: number,
	bio: string,
	non_receiver: string,
	epoch_first_visit: string,
	non_giver: string,
	starting_tokens: number,
	fixed_non_receiver: string,
	role: string,
}