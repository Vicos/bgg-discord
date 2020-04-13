function OnClockTrigger(e) {
  const username = props.getProperty("bggUsername");
  publishNewerPlaysOnDiscord(username);
}
