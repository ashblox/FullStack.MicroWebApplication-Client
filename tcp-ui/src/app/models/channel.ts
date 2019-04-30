import {User} from "./user";

export class Channel {
  id: number;
  channelName: string;
  users: User[] = [];

  userString = '';
  isPrivate: boolean;
}
