import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'docTypeIcon'
})
export class DocTypeIconPipe implements PipeTransform {
  transform(docTypeID: number): string {
    switch (docTypeID) {
      case 1:
        return 'assignment_ind';
      case 2:
        return 'verified_user';
      default:
        return 'assignment';
    }
  }
}
