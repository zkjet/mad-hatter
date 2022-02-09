import { Collection, ObjectId } from 'mongodb';

export interface NotionMeetingNotes extends Collection {
	_id: ObjectId,
	guild: string,
	databaseId: string,
}