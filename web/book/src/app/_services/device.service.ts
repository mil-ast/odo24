import { Injectable } from '@angular/core';

@Injectable()
export class DeviceService {
    isMobile: boolean;
    isPC: boolean;

    constructor() {
        const reg = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
        if (reg.test(window.navigator.userAgent) ) {
            this.setMobile();
        } else {
            const width = window.innerWidth;
            if (width <= 768) {
                this.setMobile();
            } else {
                this.setPC();
            }
        }
    }

    private setMobile() {
        this.isMobile = true;
        this.isPC = false;
    }

    private setPC() {
        this.isMobile = false;
        this.isPC = true;
    }
}
