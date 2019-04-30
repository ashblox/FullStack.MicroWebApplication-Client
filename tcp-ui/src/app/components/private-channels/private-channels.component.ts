import {Component, OnChanges, OnInit} from '@angular/core';
import {NotificationService} from '../../services/notification.service';
import {UserService} from '../../services/user.service';
import {User} from '../../models/user';
import {SessionStorageService} from 'ngx-webstorage';
import {Channel} from '../../models/channel';
import {ChannelService} from '../../services/channel.service';
import {filter} from "rxjs/operators";
import {allowNewBindingsForStylingContext} from "@angular/core/src/render3/styling/class_and_style_bindings";

@Component({
  selector: 'app-private-channels',
  templateUrl: './private-channels.component.html',
  styleUrls: ['./private-channels.component.css']
})
export class PrivateChannelsComponent implements OnInit, OnChanges {

  channels: Channel[] = [];
  currentUser: User;
  currentChannel: Channel;
  query: string;
  users: User[] = [];

  constructor(private channelService: ChannelService,
              private notificationService: NotificationService,
              private userService: UserService,
              private sessionStorageService: SessionStorageService) {
  }

  ngOnInit() {
    this.getChannels();
    this.currentUser = this.sessionStorageService.retrieve('currentUser');
    this.sessionStorageService.store('privateChannel', null);
  }

  ngOnChanges() {
    this.getChannels();
  }

  getChannels(): void {
    this.channelService.getChannels().subscribe(channels => {
      channels.filter(channel =>
       channel.isPrivate
      ).map(channel=> {
        this.channels.push(channel);
      });
    });
  }

  setUsersString(channel: Channel): void {
    channel.userString = '';
    this.userService.getUsersSubscribedToChannel(channel.id)
      .subscribe(users => {
        users.forEach(user => {
          if (user.username !== this.currentUser.username) {
            channel.userString += user.firstName + ', ';
          }
        });
        channel.userString = channel.userString.substring(0, channel.userString.length - 2);
      });
  }

  add(user: User): void {
    let newChannel: Channel = new Channel();
    newChannel.private = true;
    this.channelService.addChannel(newChannel).subscribe(channel => {
      newChannel.channelName = 'Private Message ' + channel.id;
      this.channelService.updateChannel(channel.id, newChannel.channelName).subscribe((c) => {
        this.userService.joinChannel(user.username, c.channelName).subscribe(() => {
          this.userService.joinChannel(this.currentUser.username, c.channelName).subscribe(() => {
            channel.userString = user.firstName;
            channel.channelName = newChannel.channelName;

            this.channels.push(channel);
          });
        });
      });
    });
  }

  delete(id: number): void {
    this.channels = this.channels.filter(c => c.id !== id);
    this.channelService.deleteChannel(id).subscribe();
    this.notificationService.add('Deleted private message');
  }

  updateChannel(channel: Channel): void {
    this.sessionStorageService.store("currentChannel", channel);
    this.currentChannel = channel;
  }

  search() {
    if (this.query) {
      this.query = this.query.toLowerCase();
      this.users = [];
      this.userService.getUsers().subscribe(users => {
        users.filter(user =>
          (user.username.toLowerCase() === this.query || user.firstName.toLowerCase() === this.query ||
            user.lastName.toLowerCase() === this.query || user.firstName.toLowerCase() + ' ' + user.lastName.toLowerCase() === this.query)
        ).map(user => {
          this.users.push(user);
        });
      });
    }
  }
}
