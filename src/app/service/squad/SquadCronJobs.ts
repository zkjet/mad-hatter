import Log from '../../utils/Log';
import { checkExpiration } from './LaunchSquad';
import cron from 'cron';

const dateTimeString = () => {

	const currentDate = new Date();

	return 'Cron executed: ' + currentDate.getDate() + '/'
		+ (currentDate.getMonth() + 1) + '/'
		+ currentDate.getFullYear() + ' @ '
		+ currentDate.getHours() + ':'
		+ currentDate.getMinutes() + ':'
		+ currentDate.getSeconds();
};

export default async (): Promise<any> => {

	const checkExpirationCronJob = new cron.CronJob('0 0/30 * * * *', async function() {

		await checkExpiration();

		Log.info(`SquadUp - checking for expired Squads - ${dateTimeString()}`);

	}, null, true, 'America/Los_Angeles');

	checkExpirationCronJob.start();
};