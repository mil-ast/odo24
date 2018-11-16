export class Service {
    service_id: number;
    avto_id: number;
    odo: number;
    next_odo: number;
    date: string;
    comment: string;
    price: number;

    constructor(id: number, avto_id:number, odo: number, next_odo: number, date: string, comment: string, price: number) {
        this.service_id = id;
        this.avto_id = avto_id;

        this.Update(odo, next_odo, date, comment, price);
    }

    Update(odo: number, next_odo: number, date: string, comment: string, price: number) {
        this.odo = odo;
        this.next_odo = next_odo||null;
        this.date = date;
        this.comment = comment||null;
        this.price = price||null;
    }
}