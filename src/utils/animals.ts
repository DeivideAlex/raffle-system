
export const ANIMALS = [
  { id: 1, name: 'Avestruz', numbers: [1, 2, 3, 4] },
  { id: 2, name: 'Águia', numbers: [5, 6, 7, 8] },
  { id: 3, name: 'Burro', numbers: [9, 10, 11, 12] },
  { id: 4, name: 'Borboleta', numbers: [13, 14, 15, 16] },
  { id: 5, name: 'Cachorro', numbers: [17, 18, 19, 20] },
  { id: 6, name: 'Cabra', numbers: [21, 22, 23, 24] },
  { id: 7, name: 'Carneiro', numbers: [25, 26, 27, 28] },
  { id: 8, name: 'Camelo', numbers: [29, 30, 31, 32] },
  { id: 9, name: 'Cobra', numbers: [33, 34, 35, 36] },
  { id: 10, name: 'Coelho', numbers: [37, 38, 39, 40] },
  { id: 11, name: 'Cavalo', numbers: [41, 42, 43, 44] },
  { id: 12, name: 'Elefante', numbers: [45, 46, 47, 48] },
  { id: 13, name: 'Galo', numbers: [49, 50, 51, 52] },
  { id: 14, name: 'Gato', numbers: [53, 54, 55, 56] },
  { id: 15, name: 'Jacaré', numbers: [57, 58, 59, 60] },
  { id: 16, name: 'Leão', numbers: [61, 62, 63, 64] },
  { id: 17, name: 'Macaco', numbers: [65, 66, 67, 68] },
  { id: 18, name: 'Porco', numbers: [69, 70, 71, 72] },
  { id: 19, name: 'Pavão', numbers: [73, 74, 75, 76] },
  { id: 20, name: 'Peru', numbers: [77, 78, 79, 80] },
  { id: 21, name: 'Touro', numbers: [81, 82, 83, 84] },
  { id: 22, name: 'Tigre', numbers: [85, 86, 87, 88] },
  { id: 23, name: 'Urso', numbers: [89, 90, 91, 92] },
  { id: 24, name: 'Veado', numbers: [93, 94, 95, 96] },
  { id: 25, name: 'Vaca', numbers: [97, 98, 99, 0] } // 00 é tratado como 0 frequentemente
];

export function getAnimalByNumber(n: number) {
  return ANIMALS.find(a => a.numbers.includes(n));
}
