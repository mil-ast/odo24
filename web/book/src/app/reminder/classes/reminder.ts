export class Reminder {
    id: number;
    date_start: string;
    date_end: string;
    event_before: number;
    comment: string;

    constructor(id: number, date_start: string, date_end: string, event_before: number, comment: string) {
        this.id = id|0;

        this.Update(date_start, date_end, event_before, comment);
    }

    Update(date_start: string, date_end: string, event_before: number, comment: string) {
        this.date_start = date_start||null;
        this.date_end = date_end||null;
        this.event_before = event_before||30;
        this.comment = comment||null;
    }
}