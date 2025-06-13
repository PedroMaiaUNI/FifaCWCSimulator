export const GROUPS = {
  A: ["Porto", "Palmeiras", "Al-Ahly", "Inter Miami"],
  B: ["PSG", "Atletico Madrid", "Botafogo", "Seattle Sounders"],
  C: ["Bayern Munich", "Benfica", "Boca Juniors", "Auckland City"],
  D: ["Flamengo", "Chelsea", "LA Galaxy", "Espérance"],
  E: ["River Plate", "Inter Milan", "Monterrey", "Urawa Red Diamonds"],
  F: ["Fluminense", "Borussia Dortmund", "Ulsan Hyundai", "Mamelodi Sundowns"],
  G: ["Manchester City", "Juventus", "Al Ain", "Wydad Casablanca"],
  H: ["Real Madrid", "RB Salzburg", "Pachuca", "Al-Hilal"],
}

export const KNOCKOUT_STRUCTURE = {
  roundOf16: [
    { id: "r16_1", description: "1A x 2B" },
    { id: "r16_2", description: "1C x 2D" },
    { id: "r16_3", description: "1E x 2F" },
    { id: "r16_4", description: "1G x 2H" },
    { id: "r16_5", description: "2A x 1B" },
    { id: "r16_6", description: "2C x 1D" },
    { id: "r16_7", description: "2E x 1F" },
    { id: "r16_8", description: "2G x 1H" },
  ],
  quarterFinals: [
    { id: "qf_1", description: "Vencedor R16_1 x Vencedor R16_2" },
    { id: "qf_2", description: "Vencedor R16_3 x Vencedor R16_4" },
    { id: "qf_3", description: "Vencedor R16_5 x Vencedor R16_6" },
    { id: "qf_4", description: "Vencedor R16_7 x Vencedor R16_8" },
  ],
  semiFinals: [
    { id: "sf_1", description: "Vencedor QF_1 x Vencedor QF_2" },
    { id: "sf_2", description: "Vencedor QF_3 x Vencedor QF_4" },
  ],
  thirdPlace: [{ id: "3rd", description: "Perdedor SF_1 x Perdedor SF_2" }],
  final: [{ id: "final", description: "Vencedor SF_1 x Vencedor SF_2" }],
}
