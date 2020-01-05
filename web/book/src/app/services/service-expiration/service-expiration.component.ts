import { Component, Input } from '@angular/core';
import { Auto } from 'src/app/_classes/auto';
import { ServiceStruct } from 'src/app/services/services/service.service';

@Component({
  selector: 'app-service-expiration',
  templateUrl: './service-expiration.component.html',
  styleUrls: ['./service-expiration.component.scss']
})
export class ServiceExpirationComponent {
  @Input() selectedAuto: Auto;
  @Input() lastService: ServiceStruct;
}
