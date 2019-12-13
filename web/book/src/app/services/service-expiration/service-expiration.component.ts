import { Component, OnInit, Input } from '@angular/core';
import { Auto } from 'src/app/_classes/auto';
import { ServiceStruct } from 'src/app/_services/service.service';
import { AutoService } from 'src/app/_services/avto.service';

@Component({
  selector: 'app-service-expiration',
  templateUrl: './service-expiration.component.html',
  styleUrls: ['./service-expiration.component.scss']
})
export class ServiceExpirationComponent implements OnInit {
  @Input() selectedAuto: Auto;
  @Input() lastService: ServiceStruct;
  constructor(
    private autoService: AutoService,
  ) { }

  ngOnInit() {
    /*this.autoService.onUpdateAuto.subscribe((autoID: number) => {

    });*/
  }

  get getLeftDistance(): number {
    if (this.selectedAuto && this.lastService && this.lastService.next_distance > 0) {
      const nextOdo = this.lastService.odo + this.lastService.next_distance;
      const leftOdo = nextOdo - this.selectedAuto.odo;

      return leftOdo > 0 ? leftOdo : 0;
    }

    return 0;
  }

  get leftDistanceColorState(): 'ok' | 'low' | 'medium' | 'high' {
    if (!this.selectedAuto.odo || !this.lastService || !this.lastService.next_distance) {
      return null;
    }

    const nextOdo = this.lastService.odo + this.lastService.next_distance;
    const leftDistance = nextOdo - this.selectedAuto.odo;
    if (leftDistance < 0) {
      return 'high';
    }

    const percent = (100 / this.lastService.next_distance) * (this.selectedAuto.odo - this.lastService.odo);
    if (percent > 89.9) {
      return 'high';
    } else if (percent > 69.9) {
      return 'medium';
    } else if (59.9) {
      return 'low';
    }

    return 'ok';
  }
}
