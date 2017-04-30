import { BehaviorSubject } from 'rxjs/Rx';

export class RefreshSubject<T> extends BehaviorSubject<T> {
    constructor(public f: () => T) {
        super(f());
    }

    refresh() {
        this.next(this.f());
    }
}
