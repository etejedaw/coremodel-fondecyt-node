export type CasenField = `casen${string}`;

export type Input = { unidadTerritorial: string } & Record<CasenField, string>;

export type Output = { unidadTerritorial: string } & Record<CasenField, number>;

export type OutputWithYear = Output & { year: string };
