import { Component, Inject, Input, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { AuthenticationService } from '../services/authentication.service';
import { User } from '../_models/user.model';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-tawk-to',
  templateUrl: './tawk-to.component.html',
  styleUrls: ['./tawk-to.component.scss']
})
export class TawkToComponent implements OnInit {
  @Input() id: string; // Not used
  script = this._renderer.createElement('script');
  isVisibleTawk = true;
  currentUser: User;
  config = environment;


  constructor(private _renderer: Renderer2, @Inject(DOCUMENT) private _document, private authService: AuthenticationService) {
    this.authService.currentUser.subscribe(x => {
      this.currentUser = x;
      console.log(this.currentUser);
      
    });

  }

  ngOnInit() {
    if(this.currentUser && this.currentUser.roles[0].id != 3) {

      this.script.text = `var Tawk_API = Tawk_API || {},  Tawk_LoadStart = new Date();
      (function () {
        var s1 = document.createElement("script"), s0 = document.getElementsByTagName("script")[0];
        s1.async = true;
        s1.src = 'https://embed.tawk.to/${this.config.tawkToId}/default';
        s1.charset = 'UTF-8';
        s1.setAttribute('crossorigin', '*');
        s0.parentNode.insertBefore(s1, s0);
      })();
      Tawk_API.onChatEnded = function(){
        console.log('END CHAT');
        Tawk_API.minimize();
      };
      Tawk_API.visitor = {
      name  : '',
      email : ''
      };`;
      this._renderer.appendChild(this._document.body, this.script);
      setTimeout(() => {
        // this.authService.setLoggedUserTawkTo(this.currentUser);
        // this.openChat();
        // this.setLoggedUser()
      }, 500);
    }

  }

  openChat() {
    if (window['Tawk_API'].hasOwnProperty('maximize')) {
      window['Tawk_API'].maximize();
    }

  }

  setLoggedUser() {
    if (window['Tawk_API'].hasOwnProperty('visitor')) {
      console.log(window['Tawk_API'])
      window['Tawk_API'].setAttributes({
        name: this.currentUser.username,
        email: this.currentUser.email
      }, function (error) {
        console.log(error)
      });
      window['Tawk_API'].onLoad = function () {
        window['Tawk_API'].setAttributes({
          name: this.currentUser.username,
          email: this.currentUser.email
        }, function (error) {
          console.log(error)
        });
      };

    }
  }

}
