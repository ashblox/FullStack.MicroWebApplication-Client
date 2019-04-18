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
import {map} from "rxjs/operators";

@Component({
  selector: 'app-channel-detail',
  templateUrl: './channel-detail.component.html',
  styleUrls: ["../../app.component.css"]
})

export class ChannelDetailComponent implements OnInit {
  channel: Channel = new Channel();
  currentUser: User;
  messages: Message[] = [];
  subscribed: boolean = false;

  constructor(private activatedRoute: ActivatedRoute,
              private location: Location,
              private channelService: ChannelService,
              private userService: UserService,
              private appComponent: AppComponent,
              private notificationService: NotificationService,
              private messageService: MessageService) {
  }

  ngOnInit() {
    this.getChannel();
    this.currentUser = this.appComponent.currentUser;
    this.getMessages();
    this.messages.reverse();
  }

  getChannel(): void {
    const id = +this.activatedRoute.snapshot.paramMap.get('id');
    this.channelService.getChannel(id)
      .subscribe(channel => {
        this.channel = channel;
        this.channel.users = [];
        this.getUsers(channel);

      });
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
        if (user.username == this.currentUser.username) {
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
