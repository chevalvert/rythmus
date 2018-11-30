module.exports = rythmus => (pillarIndex, { pulse, player }) => {
  // Set the pulse origin to the player pillar position
  const rotatedPillarIndex = (pillarIndex + player.position) % rythmus.circumference

  // Make pulse symmetric from a circular based index
  const pulseHistoryIndex = rotatedPillarIndex < player.historySize
    ? rotatedPillarIndex + 1
    : player.history.length - (rotatedPillarIndex - rythmus.circumference / 2)

  // Flip the history so that the first value is the oldest
  const invertedPulseHistoryIndex = player.history.length - pulseHistoryIndex

  return player.history[invertedPulseHistoryIndex]
}
