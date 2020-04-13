class Play {
  readonly id: number;
  readonly date: Date;
  readonly quantity?: number;
  readonly length?: number;
  readonly incomplete: boolean;
  readonly nowinstats: boolean;
  readonly location?: string;
  readonly gameName: string;
  readonly gameId: number;
  readonly players: Player[];

  constructor(elt: GoogleAppsScript.XML_Service.Element) {
    this.id = Number.parseInt(elt.getAttribute("id").getValue(), 10);
    this.date = new Date(elt.getAttribute("date").getValue());
    if (elt.getAttribute("quantity").getValue() !== "0") {
      this.quantity = Number.parseInt(
        elt.getAttribute("quantity").getValue(),
        10
      );
    }
    if (elt.getAttribute("length").getValue() !== "0") {
      this.length = Number.parseInt(elt.getAttribute("length").getValue(), 10);
    }
    this.incomplete = elt.getAttribute("incomplete").getValue() === "1";
    this.nowinstats = elt.getAttribute("nowinstats").getValue() === "1";
    if (elt.getAttribute("location").getValue() !== "") {
      this.location = elt.getAttribute("location").getValue();
    }
    const itemElt = elt.getChild("item");
    this.gameName = itemElt.getAttribute("name").getValue();
    this.gameId = Number.parseInt(
      itemElt.getAttribute("objectid").getValue(),
      10
    );

    this.players = [];
    const playersElt = elt.getChild("players");
    for (const playerElt of playersElt.getChildren("player")) {
      this.players.push(new Player(playerElt));
    }
  }

  get sortedPlayers() {
    // TODO: guess the sort way for this game (i.e if higher score is better)
    return this.players.sort((a, b) => {
      if (a.isWinner !== b.isWinner) {
        return a.isWinner ? -1 : 1;
      } else {
        return b.score - a.score;
      }
    });
  }
  
  generateScoreTable() {
    const players = this.sortedPlayers;
    const playerColSize = 1 + Math.max(...players.map((p) => p.name.length));
    const scoreTable = [];
    for (const player of players) {
      const name = player.name.padEnd(playerColSize);
      const score =
        ` ${player.score} ` +
        (player.isWinner ? "🥇" : "") +
        (player.isNew ? "🔰" : "");
      scoreTable.push(`${name}│${score}`);
    }
    return scoreTable.join("\n");
  }
}
