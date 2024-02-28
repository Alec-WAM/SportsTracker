import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor() { }

  requestPermission(callback: () => void) {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications.');
      return;
    }

    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        console.log('Notification permission granted.');
        callback();
      } else {
        console.log('Notification permission denied.');
      }
    });
  }

  showNotification(title: string, options?: NotificationOptions) {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications.');
      return;
    }

    if (Notification.permission === 'granted') {
      new Notification(title, options);
    } 
    else if (Notification.permission !== "denied") {
      this.requestPermission(() => {
        new Notification(title, options);
      });
    }
    else {
      console.log('Notification permission is not granted.');
    }
  }
}
