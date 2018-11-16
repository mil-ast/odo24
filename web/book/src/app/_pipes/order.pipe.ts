import { NgModule, Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'order',
    pure: false
})
export class OrderPipe implements PipeTransform {
    transform(array: any[], field: string, direction: string) {
        if (!Array.isArray(array)) {
            return [];
        }

		if (field === undefined || field === '') {
			field = 'id';
        }

        var factor = 1;
        if (direction === 'desc') {
            factor = -1;
        }

        return array.sort((left: any, right: any) => {
			let v_a = left[field];
            let v_b = right[field];
            
            if (v_a === undefined || v_b === undefined) {
                return 0;
            }

			if (typeof v_a === 'number') {
				if (v_a < v_b) {
					return -1 * factor;
				} else if (v_a > v_b) {
					return 1 * factor;
				}
			} else {
				v_a = v_a.toLowerCase();
				v_b = v_b.toLowerCase();

				if (v_a < v_b) {
					return -1 * factor;
				} else if (v_a > v_b) {
					return 1 * factor;
				}
            }
            
            return 0;
        });
    }
}

@NgModule({
    imports: [
      
    ],
    declarations: [
        OrderPipe,
    ],
    providers : [

    ],
    exports : [ OrderPipe ]
})
export class PipesModule { }