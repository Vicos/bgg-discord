class Play {
  #id: number;
  #date: Date;
  #quantity?: number;
  #length?: number;
  #incomplete: boolean;
  #nowinstats: boolean;
  #location?: string;
  #gameName: string;
  #gameId: number;
  #players: Player[];

  #thumbnail?: string;
  #image?: string;

  constructor(elt: GoogleAppsScript.XML_Service.Element) {
    this.#id = Number.parseInt(elt.getAttribute("id").getValue(), 10);
    this.#date = new Date(elt.getAttribute("date").getValue());
    if (elt.getAttribute("quantity").getValue() !== "0") {
      this.#quantity = Number.parseInt(
        elt.getAttribute("quantity").getValue(),
        10
      );
    }
    if (elt.getAttribute("length").getValue() !== "0") {
      this.#length = Number.parseInt(elt.getAttribute("length").getValue(), 10);
    }
    this.#incomplete = elt.getAttribute("incomplete").getValue() === "1";
    this.#nowinstats = elt.getAttribute("nowinstats").getValue() === "1";
    if (elt.getAttribute("location").getValue() !== "") {
      this.#location = elt.getAttribute("location").getValue();
    }
    const itemElt = elt.getChild("item");
    this.#gameName = itemElt.getAttribute("name").getValue();
    this.#gameId = Number.parseInt(
      itemElt.getAttribute("objectid").getValue(),
      10
    );

    this.#players = [];
    const playersElt = elt.getChild("players");
    for (const playerElt of playersElt.getChildren("player")) {
      this.#players.push(new Player(playerElt));
    }
  }

  addItemDetails(elt: GoogleAppsScript.XML_Service.Element) {
    if (elt.getChild("thumbnail")) {
      this.#thumbnail = elt.getChild("thumbnail").getText();
    }
    if (elt.getChild("image")) {
      this.#image = elt.getChild("image").getText();
    }
  }

  get sortedPlayers() {
    // TODO: guess the sort way for this game (i.e if higher score is better)
    return this.#players.sort((a, b) => {
      if (a.isWinner !== b.isWinner) {
        return a.isWinner ? -1 : 1;
      } else {
        return b.score - a.score;
      }
    });
  }

  generateScoreTable() {
    const players = this.sortedPlayers;
    const playerColSize = Math.max(...players.map((p) => p.name.length));
    const colorColSize = Math.max(
      ...players.map((p) => (p.color && p.color.length) || 0)
    );
    const scoreTable = [];
    for (const player of players) {
      const cells = [];
      // Player name
      cells.push(player.name.padEnd(playerColSize));
      // Color
      if (colorColSize > 0) {
        cells.push((player.color || "").padEnd(colorColSize));
      }
      // Details
      const details = [];
      if (Number.isFinite(player.score)) {
        details.push(`${player.score}`);
      }
      if (player.isWinner) {
        details.push("🥇");
      }
      if (player.isNew) {
        details.push("🔰");
      }
      cells.push(details.join(" "));
      scoreTable.push(cells.join(" │ "));
    }
    return scoreTable.join("\n");
  }

  get url() {
    return `https://www.boardgamegeek.com/play/details/${this.#id}`;
  }

  get id() {
    return this.#id;
  }
  get date() {
    return this.#date;
  }
  get quantity() {
    return this.#quantity;
  }
  get length() {
    return this.#length;
  }
  get incomplete() {
    return this.#incomplete;
  }
  get nowinstats() {
    return this.#nowinstats;
  }
  get location() {
    return this.#location;
  }
  get gameName() {
    return this.#gameName;
  }
  get gameId() {
    return this.#gameId;
  }
  get players() {
    return this.#players;
  }
  get thumbnail() {
    return this.#thumbnail;
  }
  get image() {
    return this.#image;
  }
}
