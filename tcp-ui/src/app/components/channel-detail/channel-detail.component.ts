import {Component, OnInit} from '@angular/core';
import {Channel} from "../../models/channel";
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {ChannelService} from "../../services/channel.service";
import {UserService} from "../../services/user.service";
import {AppComponent} from "../../app.component";
import {NotificationService} from "../../services/notification.service";
import {User} from "../../models/user";
import {Message} from "../../models/message";
import {MessageService} from "../../services/message.service";
import {SessionStorageService} from "ngx-webstorage";

@Component({
  selector: 'app-channel-detail',
  templateUrl: './channel-detail.component.html',
  styleUrls: ['./channel-detail.component.css']
})

export class ChannelDetailComponent implements OnInit {
  channel: Channel;
  currentUser: User;
  messages: Message[] = [];
  subscribed = false;

  constructor(private activatedRoute: ActivatedRoute,
              private location: Location,
              private channelService: ChannelService,
              private userService: UserService,
              private appComponent: AppComponent,
              private notificationService: NotificationService,
              private messageService: MessageService,
              private session: SessionStorageService) {
  }

  ngOnInit() {
    this.getChannel();
    this.currentUser = this.session.retrieve("currentUser");
    this.getMessages();
    this.messages.reverse()
    if (this.channel.channelName === 'Main Channel') {
      this.subscribed = true;
    }
  }

  getChannel(): void {
        this.channel = this.session.retrieve("currentChannel");
        console.log(this.channel);
        this.channel.users = [];
        this.getUsers(this.channel);
  }

  goBack(): void {
    this.location.back();
  }

  addUser(user: User) {
    this.userService.joinChannel(user.username, this.channel.channelName).subscribe(user => {
        if (this.channel.users.indexOf(user.username) < 0) {
          this.channel.users.push(user.username);
        }
      }
    );
    this.subscribed = true;
    this.notificationService.add(user.username + " joined " + this.channel.channelName + "!");
  }

  removeUser(user: User) {
    this.userService.leaveChannel(user.username, this.channel.channelName).subscribe(() => {
      this.notificationService.add(user.username + " has left " + this.channel.channelName + "!")
      this.subscribed = false;
      this.channel.users.splice(this.channel.users.indexOf(user.username), 1);
    });
  }

  getUsers(channel: Channel) {
    this.userService.getUsersSubscribedToChannel(channel.id).subscribe(users => {
      users.map(user => {
        this.channel.users.push(user.username);
        if (user.username === this.currentUser.username) {
          this.subscribed = true;
        }
      });
    });
  }

  getMessages() {
    this.messageService.getMessagesByChannel(this.channel.channelName).subscribe(messages => {
      this.messages = messages;
    });
  }
}
