import { NgModule, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'order',
  pure: false
})
export class OrderPipe implements PipeTransform {
  transform(array: any[], field: string, direction: string = 'asc') {
    if (!Array.isArray(array)) {
      return [];
    }

    if (!field) {
      field = 'id';
    }

    const factor = direction === 'desc' ? -1 : 1;

    return array.sort((left: any, right: any) => {
      const v_a = left[field];
      const v_b = right[field];

      if (v_a === undefined || v_b === undefined) {
        return 0;
      }

      if (v_a < v_b) {
        return -1 * factor;
      } else if (v_a > v_b) {
        return 1 * factor;
      }

      return 0;
    });
  }
}

@NgModule({
  imports: [],
  declarations: [
    OrderPipe,
  ],
  providers: [],
  exports: [OrderPipe]
})
export class PipesModule {}
