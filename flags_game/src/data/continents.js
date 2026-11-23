/**
 * Continentes jugables. `id` coincide con el campo `continent` de countries.json.
 * Antártida y las Tierras Australes Francesas quedan fuera del juego: no pertenecen a
 * ninguno de estos continentes y solo aportan dos banderas al mazo.
 */
export const CONTINENTS = [
  { id: 'africa', label: 'África' },
  { id: 'america', label: 'América' },
  { id: 'asia', label: 'Asia' },
  { id: 'europa', label: 'Europa' },
  { id: 'oceania', label: 'Oceanía' },
]

export const CONTINENT_IDS = CONTINENTS.map((continent) => continent.id)
