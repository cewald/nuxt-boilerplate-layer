export default <T>(arr: T[]) => {
  return arr![randomBetween(0, arr!.length - 1)]
}
