/** « d'Iris », « de Léon » : la préposition « de » s'élide devant une voyelle ou un h muet. */
export const deCandidate = (prenom: string) => (/^[aeiouyéèêëàâîïôöûüh]/i.test(prenom) ? `d'${prenom}` : `de ${prenom}`);

/** Le pourcentage d'affinité, de 0 à 1 vers « 87 % ». */
export const affinitePourcent = (score: number) => `${Math.round(score * 100)} %`;
