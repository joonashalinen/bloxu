
export default class EventEmitter {

    _eventListeners: Array<{[prop: string]: any}>;
    _allowedEvents: Array<string>;
    _allowAllEvents: boolean;
	
	allowAllEvents(): boolean {
		return this._allowAllEvents;
	}
	
    setAllowAllEvents(allowAllEvents: boolean): void {
        this._allowAllEvents = allowAllEvents;
    }

    _onEvent(event: string, callback: Function) {
        if (this._allowAllEvents || this._allowedEvents.includes(event)) {
            this._eventListeners.push({
                event: event,
                callback: callback
            });
        }
    }

    _eventsFromEventString(eventsString: string) {
        return eventsString.split(" ").join("").split(",");
    }

    constructor() {
        this._eventListeners = [];
        this._allowedEvents = [];
        this._allowAllEvents = true;
    }

    on(eventsString: string, callback: Function): void {
        var events = this._eventsFromEventString(eventsString);

        for (var i = 0; i < events.length; i++) {
            this._onEvent(events[i], callback);
        }
    }

    off(event: string, callback: Function): void {

        for (var i = this._eventListeners.length - 1; i >= 0; i--) {
            if (
                this._eventListeners[i].event === event 
                && 
                ( 
                    ( this._eventListeners[i].callback as Function ).toString().replace(/\s/g,'') 
                    === 
                    ( callback as Function ).toString().replace(/\s/g,'')
                )
            ) {
                this._eventListeners.splice(i, 1);
            }
        }
    }

    trigger(event: string, args?: Array<any>): void {
        if (args === undefined) args = [];

        for (var i = 0; i < this._eventListeners.length; i++) {
            if (this._eventListeners[i].event === event) {
                this._eventListeners[i].callback.apply(null, args);
            }
        }
    }

    async triggerAwait(event: string, args?: Array<any>): Promise<any>  {
        if (args === undefined) args = [];

        for (var i = 0; i < this._eventListeners.length; i++) {
            if (this._eventListeners[i].event === event) {
                await this._eventListeners[i].callback.apply(null, args);
            }
        }
    }

    allowedEvents(): Array<string> {
        return this._allowedEvents;
    }

    setAllowedEvents(allowedEvents: Array<string>): void {
        this._allowedEvents = allowedEvents;
    }

    addAllowedEvent(event: string): void {
        if (!this._allowedEvents.includes(event)) this._allowedEvents.push(event);
    }

    removeAllowedEvent(event: string): void {
        if (this._allowedEvents.includes(event)) this._allowedEvents.splice(this._allowedEvents.indexOf(event), 1);
    }
}