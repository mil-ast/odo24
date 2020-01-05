import { Pipe, PipeTransform } from '@angular/core';
import { ServiceStruct } from 'src/app/services/services/service.service';

@Pipe({
  name: 'distanceLevel'
})
export class DistanceLevelPipe implements PipeTransform {
  transform(odo: number, lastService: ServiceStruct): '' | 'ok' | 'low' | 'medium' | 'high' {
    if (!odo || !lastService || !lastService.next_distance) {
      return '';
    }

    const nextOdo = lastService.odo + lastService.next_distance;
    const leftDistance = nextOdo - odo;
    if (leftDistance < 0) {
      return 'high';
    }

    const percent = (100 / lastService.next_distance) * (odo - lastService.odo);
    if (percent > 90) {
      return 'high';
    } else if (percent > 75) {
      return 'medium';
    } else if (percent > 60) {
      return 'low';
    }

    return 'ok';
  }
}
