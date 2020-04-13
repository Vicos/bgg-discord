class Player {
  readonly username?: string;
  readonly userid?: number;
  readonly name: string;
  readonly startposition?: number;
  readonly color?: string;
  readonly score: number;
  readonly isNew: boolean;
  readonly isWinner: boolean;

  constructor(elt: GoogleAppsScript.XML_Service.Element) {
    if (elt.getAttribute("username").getValue() !== "") {
      this.username = elt.getAttribute("username").getValue();
    }
    if (elt.getAttribute("userid").getValue() !== "0") {
      this.userid = Number.parseInt(elt.getAttribute("userid").getValue(), 10);
    }
    if (elt.getAttribute("name").getValue() !== "") {
      this.name = elt.getAttribute("name").getValue();
    } else {
      this.name = "John Doe";
    }
    if (elt.getAttribute("startposition").getValue() !== "0") {
      this.startposition = Number.parseInt(
        elt.getAttribute("startposition").getValue(),
        10
      );
    }
    if (elt.getAttribute("color").getValue() !== "") {
      this.color = elt.getAttribute("color").getValue();
    }
    this.score = Number.parseInt(elt.getAttribute("score").getValue(), 10);
    this.isNew = elt.getAttribute("new").getValue() === "1";
    this.isWinner = elt.getAttribute("win").getValue() === "1";
  }
}
