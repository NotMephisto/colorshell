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

    public setSinkVolume(newSinkVolume: number): void {
        this.defaultSink.set_volume(
            (newSinkVolume > this.maxSinkVolume ? this.maxSinkVolume : newSinkVolume) / 100
        );
    }

    public setSourceVolume(newSourceVolume: number): void {
        this.defaultSource.set_volume(
            newSourceVolume > this.maxSourceVolume ? this.maxSourceVolume : newSourceVolume / 100
        );
    }

    public increaseSinkVolume(volumeIncrease: number): void {
        if((this.getSinkVolume() + volumeIncrease) > this.maxSinkVolume) {
            this.setSinkVolume(this.maxSinkVolume);
            return;
        }

        this.setSinkVolume(this.getSinkVolume() + volumeIncrease);
    }

    public increaseSourceVolume(volumeIncrease: number): void {
        if((this.getSourceVolume() + volumeIncrease) > this.maxSourceVolume) {
            this.setSourceVolume(this.maxSourceVolume);
            return;
        }

        this.setSourceVolume(this.getSourceVolume() + volumeIncrease);
    }

    public decreaseSinkVolume(volumeDecrease: number): void {
        const absDecrease = Math.abs(volumeDecrease);

        if((this.getSinkVolume() - absDecrease) < 0) {
            this.setSinkVolume(0);
            return;
        }

        this.setSinkVolume(this.getSinkVolume() - absDecrease);
    }

    public decreaseSourceVolume(volumeDecrease: number): void {
        const absDecrease = Math.abs(volumeDecrease);

        if((this.getSourceVolume() - absDecrease) < 0) 
            return this.setSourceVolume(0);

        this.setSourceVolume(this.getSourceVolume() - absDecrease);
    }

    public muteSink(): void {
        this.getDefaultSink().set_mute(true);
    }

    public muteSource(): void {
        this.getDefaultSource().set_mute(true);
    }

    public unmuteSink(): void {
        this.getDefaultSink().set_mute(false);
    }

    public unmuteSource(): void {
        this.getDefaultSource().set_mute(false);
    }

    public isMutedSink(): boolean {
        return this.getDefaultSink().get_mute();
    }

    public isMutedSource(): boolean {
        return this.getDefaultSource().get_mute();
    }

    public toggleMuteSink(): void {
        if(this.isMutedSink()) 
            return this.unmuteSink();

        return this.muteSink();
    }

    public toggleMuteSource(): void {
        if(this.isMutedSource())
            return this.unmuteSource();

        return this.muteSource();
    }
}
