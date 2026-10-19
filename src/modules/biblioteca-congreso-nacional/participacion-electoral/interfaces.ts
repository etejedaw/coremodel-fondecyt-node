export interface Input {
	eleccion: string;
	unidadTerritorial: string;
	inscritos: string;
	votantes: string;
	participacionFuente: string;
}

export interface Output {
	eleccion: string;
	unidadTerritorial: string;
	inscritos: number;
	votantes: number;
	participacionFuente: number;
	participacion: number;
}
