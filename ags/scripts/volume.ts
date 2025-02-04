import AstalWp from "gi://AstalWp";

export class Wireplumber {
    private astalWireplumber: (AstalWp.Wp|null) = AstalWp.get_default();
    private defaultSink: AstalWp.Endpoint = this.astalWireplumber!.get_default_speaker()!;
    private defaultSource: AstalWp.Endpoint = this.astalWireplumber!.get_default_microphone()!;
    private static inst: Wireplumber = new Wireplumber();

    private maxSinkVolume: number = 100;
    private maxSourceVolume: number = 100;

    constructor() {
        if(!this.astalWireplumber) 
            throw new Error("Audio features will not work correctly! Please install wireplumber first", {
                cause: "Wireplumber library not found"
            });
    }

    public static getDefault(): Wireplumber {
        return Wireplumber.inst;
    }

    public getDefaultSink(): AstalWp.Endpoint {
        return this.defaultSink;
    }

    public getDefaultSource(): AstalWp.Endpoint {
        return this.defaultSource;
    }

    public getSinkVolume(): number {
        return this.getDefaultSink().get_volume() * 100;
    }

    public getSourceVolume(): number {
        return this.getDefaultSource().get_volume() * 100;
    }

    public setSinkVolume(newSinkVolume: number) {
        this.defaultSink.set_volume(
            (newSinkVolume > this.maxSinkVolume ? this.maxSinkVolume : newSinkVolume) / 100
        );
    }

    public setSourceVolume(newSourceVolume: number) {
        this.defaultSource.set_volume(
            newSourceVolume > this.maxSourceVolume ? this.maxSourceVolume : newSourceVolume / 100
        );
    }

    public increaseSinkVolume(volumeIncrease: number) {
        if(volumeIncrease > this.maxSinkVolume 
            || (this.maxSinkVolume + volumeIncrease) > this.maxSinkVolume) {
            this.setSinkVolume(this.maxSinkVolume);
        }

        this.setSinkVolume(this.getSinkVolume() + volumeIncrease);
    }

    public increaseSourceVolume(volumeIncrease: number) {
        if(volumeIncrease > this.maxSourceVolume //TODO
            || (this.maxSinkVolume + volumeIncrease) > this.maxSinkVolume) {
            this.setSinkVolume(this.maxSinkVolume);
        }

        this.setSinkVolume(this.getSinkVolume() + volumeIncrease);
    }
}
