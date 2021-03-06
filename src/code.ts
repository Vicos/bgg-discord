function publishNewerPlaysOnDiscord(username: string) {
  pipe(
    username,
    fetch,
    parse,
    filterBuddies,
    filterNewer,
    fetchDetails,
    convertIntoEmbeds,
    publishEmbeds
  );
}

function fetch(username: string) {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 3 * 24 * 3600 * 1000);
  const oneWeekAgoStr = oneWeekAgo.toISOString().slice(0, 10);
  const baseurl = "https://www.boardgamegeek.com/xmlapi2/plays";
  const qs = `?type=boardgame&username=${username}&mindate=${oneWeekAgoStr}`;
  Logger.log(`Fetching BGG plays since ${oneWeekAgoStr}`);
  return UrlFetchApp.fetch(baseurl + qs).getContentText();
}

function* parse(xml: string) {
  // https://developers.google.com/apps-script/reference/xml-service/
  const doc = XmlService.parse(xml);
  const root = doc.getRootElement();
  Logger.log(`Found ${root.getAttribute("total").getValue()} plays on BGG`);
  for (const playElt of root.getChildren("play")) {
    const play = new Play(playElt);
    if (!play.incomplete && !play.nowinstats && play.quantity > 0) {
      yield play;
    }
  }
}

function* filterBuddies(plays: Iterable<Play>) {
  const buddies = JSON.parse(props.getProperty("buddies") || "[]");
  for (const play of plays) {
    if (play.players.some((p) => buddies.includes(p.name))) {
      yield play;
    }
  }
}

function* filterNewer(plays: Iterable<Play>) {
  // Read saved property lastPublishedId, use 0 (i.e. all plays are newer)
  // by default
  const oldPubIds: number[] = JSON.parse(
    props.getProperty("publishedIds") || "[]"
  );
  const newPubIds = [];
  for (const p of plays) {
    if (!oldPubIds.includes(p.id)) {
      yield p;
    }
    newPubIds.push(p.id);
  }
  props.setProperty("publishedIds", JSON.stringify(newPubIds));
}

function* fetchDetails(playsItr: Iterable<Play>) {
  const plays = [...playsItr];
  if (plays.length === 0) {
    return;
  }
  const thingsIdsStr = [...new Set(plays.map((p) => p.gameId))].join(",");
  const url = `https://www.boardgamegeek.com/xmlapi2/things?id=${thingsIdsStr}`;
  Logger.log(`Fetching BGG things for ${thingsIdsStr}`);
  const xml = UrlFetchApp.fetch(url).getContentText();

  const doc = XmlService.parse(xml);
  const root = doc.getRootElement();
  for (const item of root.getChildren("item")) {
    const itemId = Number.parseInt(item.getAttribute("id").getValue(), 10);
    plays
      .filter((p) => p.gameId === itemId)
      .forEach((p) => p.addItemDetails(item));
  }
  yield* plays;
}

function* convertIntoEmbeds(plays: Iterable<Play>) {
  for (const p of plays) {
    const embed: Discord.Embed = {
      title: p.gameName,
      url: p.url,
      description:
        `Partie de **${p.gameName}** organisé le ` +
        `${p.date.toLocaleDateString()}\n` +
        "```\n" +
        p.generateScoreTable() +
        "\n```",
    };
    if (p.thumbnail) {
      embed.thumbnail = { url: p.thumbnail };
    }
    yield embed;
  }
}

function publishEmbeds(embedsItr: Iterable<Discord.Embed>): void {
  const embeds = [...embedsItr];
  if (embeds.length === 0) {
    return;
  }
  Logger.log(`Push on Discord ${embeds.length} embeds`);
  const webhookUrl = props.getProperty("webhookUrl");
  UrlFetchApp.fetch(webhookUrl, {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify({ embeds }),
  });
}
