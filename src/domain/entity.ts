export abstract class Entity<Id> {
  #internal: boolean;
  readonly id: Id;
  protected constructor(id: Id) {
    this.#internal = true;
    this.id = id;
  }
}
