
interface IObservation {
    value: number;
    time: number;
}

/**
 * A difference between two numerical observations 
 * that takes into account the time passed between them.
 */
export default class TimeAdjustedDifference {
    observationPair: [IObservation?, IObservation?] = [];

    constructor() {
        
    }

    /**
     * Set new latest observation.
     */
    observe(observation: number, time: number) {
        this.observationPair.push({value: observation, time: time});
        if (this.observationPair.length > 2) {
            this.observationPair.shift();
        }
    }

    /**
     * Get the time adjusted difference between the two observations 
     * as a number.
     */
    get() {
        if (this.observationPair.length == 2) {
            const observation1 = this.observationPair[0]!;
            const observation2 = this.observationPair[1]!;
            
            const timeDifference = Math.abs(observation2.time - observation1.time);
            if (timeDifference >= 0.0001) {
                return (
                    (Math.abs(observation2.value - observation1.value)) / 
                    timeDifference
                );
            } else {
                return 0;
            }
            
        } else {
            return 0;
        }
    }
}