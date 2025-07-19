export interface Input {
	n_de_centros_de_madres: string;
	n_de_otras_organizaciones_comunitarias_funcionales_otros: string;
	n_de_centros_de_padres_y_apoderados: string;
	n_de_uniones_comunales: string;
	n_de_juntas_de_vecinos: string;
	n_centros_culturales: string;
	n_de_organizaciones_comunitarias_suma_total: string;
	n_de_clubes_deportivos: string;
	n_de_centros_u_organizaciones_del_adulto_mayor: string;
	n_de_companias_de_bomberos: string;
	anio: string;
}

export interface Output {
	nDeCentrosDeMadres: number;
	nDeOtrasOrganizacionesComunitariasFuncionalesOtros: number;
	nDeCentrosDePadresYApoderados: number;
	nDeUnionesComunales: number;
	nDeJuntasDeVecinos: number;
	nCentrosCulturales: number;
	nDeOrganizacionesComunitariasSumaTotal: number;
	nDeClubesDeportivos: number;
	nDeCentrosUOrganizacionesDelAdultoMayor: number;
	nDeCompaniasDeBomberos: number;
	anio: number;
}
