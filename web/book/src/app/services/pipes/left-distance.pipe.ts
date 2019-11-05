import { Pipe, PipeTransform } from '@angular/core';
import { ServiceStruct } from 'src/app/_services/service.service';
import { Auto } from 'src/app/_classes/auto';

@Pipe({
  name: 'leftDistance'
})
export class LeftDistancePipe implements PipeTransform {

  transform(selectedAuto: Auto, lastService: ServiceStruct): number {
    if (selectedAuto && lastService && lastService.next_distance > 0) {
      const nextOdo = lastService.odo + lastService.next_distance;
      const leftOdo = nextOdo - selectedAuto.odo;

      if (leftOdo < 0) {
        return 0;
      }
      return leftOdo;
    }

    return 0;
  }
}
