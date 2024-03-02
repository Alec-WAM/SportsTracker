import { Injectable, inject } from '@angular/core';
import { SwPush } from '@angular/service-worker';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  swPush = inject(SwPush);

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
      // new Notification(title, options);
      navigator.serviceWorker.getRegistration().then((reg) => {
        console.log(reg)
        if (reg != null) {
          reg.showNotification(title, options);
        }
      });
    } 
    else if (Notification.permission !== "denied") {
      this.requestPermission(() => {
        // new Notification(title, options);
        const promise = navigator.serviceWorker.getRegistration();
        promise.then((reg) => {
          if (reg != null) {
            reg.showNotification(title, options);
          }
        });
      });
    }
    else {
      console.log('Notification permission is not granted.');
    }
  }
}
