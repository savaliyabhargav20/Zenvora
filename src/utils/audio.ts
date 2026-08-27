// Audio effects disabled as requested
export class SoundEffects {
  public setMuted(_muted: boolean) {}
  public getMuted(): boolean { return true; }
  public playClick() {}
  public playAdd() {}
  public playCashRegister() {}
}

export const sound = new SoundEffects();
