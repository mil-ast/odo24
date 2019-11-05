import { Pipe, PipeTransform } from '@angular/core';
import { Auto } from 'src/app/_classes/auto';
import { ServiceStruct } from 'src/app/_services/service.service';

@Pipe({
  name: 'distanceLevel'
})
export class DistanceLevelPipe implements PipeTransform {
  transform(selectedAuto: Auto, lastService: ServiceStruct): '' | 'ok' | 'low' | 'medium' | 'high' {
    console.log(lastService);
    if (!selectedAuto || !lastService || !lastService.next_distance) {
      return '';
    }

    const nextOdo = lastService.odo + lastService.next_distance;
    const leftDistance = nextOdo - selectedAuto.odo;
    if (leftDistance < 0) {
      return 'high';
    }

    const percent = (100 / lastService.next_distance) * (selectedAuto.odo - lastService.odo);
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
